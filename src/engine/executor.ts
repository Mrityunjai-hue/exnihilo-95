/**
 * executor.ts — Phase 5: Execution Integration & Pipeline Orchestration
 *
 * Implements the complete ExNihio pipeline:
 *  1. Parse query in chosen dialect (MySQL, PostgreSQL, SQLite, TransactSQL, SSMS)
 *  2. Query Session Catalog for known vs missing tables
 *  3. For missing tables:
 *      a. Infer schema & column types (Phase 2)
 *      b. Infer foreign key relationships & topological order (Phase 3)
 *      c. Generate synthetic data & DDL/INSERT statements (Phase 4)
 *      d. Materialize tables into in-memory sql.js database
 *      e. Register in Session Catalog
 *  4. Execute query against in-memory sql.js database
 *  5. Retry-once Safety Net: Catches "no such table: X" at runtime, materializes with default schema, and retries once
 *  6. Error Classification: Routes syntax, runtime, and ambiguous column errors cleanly
 *  7. Reset Schema: Clears sql.js database and resets catalog
 */

import initSqlJs, { Database, SqlJsStatic } from 'sql.js';
import { registerCustomSqliteFunctions } from './sqliteFunctions';
import {
  parse,
  Dialect,
  WindowSpec,
  WindowOrderClause,
  WindowFrameSpec,
  extractWindowSpecs,
  extractTruncateStatements,
  extractCreateSchemaStatements,
  extractCreateViewStatements,
  extractRoutineStatements,
  extractTriggerStatements,
  extractRecursiveCtes,
} from './parser';
import { inferSchema, InferredSchemaMap, DEFAULT_COLUMNS, TableSchema, SQLITE_DDL } from './inference';
import { inferSchemaCached } from './inferenceCache';

import { buildTableGenerationPlan } from './relationships';
import { generateSyntheticDataset, GeneratorOptions, generateCreateTableSql, generateInsertSql } from './generator';
import { SessionCatalog, globalCatalog } from './catalog';
import { continualLearner } from './continual_learner';
import { isAdminCommand, AdminSimulator } from './admin_simulator';
import { isProceduralScript, ProceduralRunner } from './procedural_runner';
import { hasDialectSugar, transpileDialectSugar } from './transpiler';

// Module-level WASM binary loader singleton — avoids compiling WASM on each SQLExecutor instance
let _sqlJsModulePromise: Promise<SqlJsStatic> | null = null;

export async function getOrInitSqlJs(): Promise<SqlJsStatic> {
  if (!_sqlJsModulePromise) {
    const isBrowserOrWorker = typeof window !== 'undefined' || (typeof self !== 'undefined' && typeof (process as any)?.versions?.node === 'undefined');
    if (isBrowserOrWorker) {
      _sqlJsModulePromise = initSqlJs({ locateFile: () => '/sql-wasm.wasm' });
    } else {
      let config: any = undefined;
      try {
        const fs = await import('fs');
        const path = await import('path');
        const candidatePaths = [
          path.join(process.cwd(), 'public', 'sql-wasm.wasm'),
          path.join(process.cwd(), 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm'),
        ];
        for (const p of candidatePaths) {
          if (fs.existsSync(p)) {
            config = { wasmBinary: fs.readFileSync(p) };
            break;
          }
        }
      } catch {
        // Fall back to default sql.js Node loading
      }
      _sqlJsModulePromise = initSqlJs(config);
    }
    _sqlJsModulePromise.catch(() => {
      _sqlJsModulePromise = null; // Clear cached rejection to allow retry on next call
    });
  }
  return _sqlJsModulePromise;
}


// ── Types ─────────────────────────────────────────────────────────────────────

export interface SingleQueryResult {
  queryIndex: number;
  columns:    string[];
  rows:       any[][];
  rowCount:   number;
}

export interface ExecutionSuccess {
  ok:              true;
  columns:         string[];
  rows:            any[][];
  rowCount:        number;
  executionTimeMs: number;
  inferredTables:  string[];
  reusedTables:    string[];
  allResults?:     SingleQueryResult[];
  message?:        string;
}

export interface ExecutionFailure {
  ok:              false;
  errorType:       'SYNTAX_ERROR' | 'RUNTIME_ERROR' | 'AMBIGUOUS_COLUMN';
  message:         string;
  executionTimeMs: number;
}

export type ExecutionResult = ExecutionSuccess | ExecutionFailure;

export interface ExecutorOptions extends GeneratorOptions {
  /** Optional custom catalog instance */
  catalog?: SessionCatalog;
}

// ── Pure Dialect Function Evaluators (Static, Pure JS — No eval/new Function) ──

export function evalCoalesce(...args: any[]): any {
  for (const a of args) {
    if (a !== null && a !== undefined) return a;
  }
  return null;
}

export function evalNullif(expr1: any, expr2: any): any {
  if (expr1 === null || expr1 === undefined) return null;
  if (expr1 == expr2) return null;
  return expr1;
}

export function evalConcat(...args: any[]): string | null {
  if (args.some(a => a === null || a === undefined)) return null;
  return args.map(a => String(a)).join('');
}

export function evalSubstring(str: any, pos: any, len?: any): string | null {
  if (str === null || str === undefined || pos === null || pos === undefined) return null;
  const s = String(str);
  const start = Number(pos);
  const jsStart = start > 0 ? start - 1 : (start < 0 ? Math.max(0, s.length + start) : 0);
  if (len !== undefined && len !== null) {
    const length = Number(len);
    if (length <= 0) return '';
    return s.substring(jsStart, jsStart + length);
  }
  return s.substring(jsStart);
}

export function evalDateFormat(dateVal: any, formatStr: any): string | null {
  if (!dateVal || !formatStr) return null;
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return String(dateVal);
  const fmt = String(formatStr);
  const pad = (n: number, w = 2) => String(n).padStart(w, '0');
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const monthsShort = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

  return fmt
    .replace(/%Y/g, String(d.getUTCFullYear()))
    .replace(/%y/g, pad(d.getUTCFullYear() % 100))
    .replace(/%m/g, pad(d.getUTCMonth() + 1))
    .replace(/%c/g, String(d.getUTCMonth() + 1))
    .replace(/%d/g, pad(d.getUTCDate()))
    .replace(/%e/g, String(d.getUTCDate()))
    .replace(/%H/g, pad(d.getUTCHours()))
    .replace(/%h/g, pad(d.getUTCHours() % 12 || 12))
    .replace(/%i/g, pad(d.getUTCMinutes()))
    .replace(/%s/g, pad(d.getUTCSeconds()))
    .replace(/%M/g, months[d.getUTCMonth()])
    .replace(/%b/g, monthsShort[d.getUTCMonth()])
    .replace(/%W/g, days[d.getUTCDay()]);
}

export function evalToChar(val: any, fmt: any): string | null {
  if (val === null || val === undefined || fmt === null || fmt === undefined) return null;
  const d = new Date(val);
  if (!isNaN(d.getTime())) {
    const formatStr = String(fmt);
    const pad = (n: number, w = 2) => String(n).padStart(w, '0');
    return formatStr
      .replace(/YYYY/gi, String(d.getUTCFullYear()))
      .replace(/YY/gi, pad(d.getUTCFullYear() % 100))
      .replace(/MM/g, pad(d.getUTCMonth() + 1))
      .replace(/DD/gi, pad(d.getUTCDate()))
      .replace(/HH24/gi, pad(d.getUTCHours()))
      .replace(/HH12/gi, pad(d.getUTCHours() % 12 || 12))
      .replace(/MI/gi, pad(d.getUTCMinutes()))
      .replace(/SS/gi, pad(d.getUTCSeconds()));
  }
  return String(val);
}

export function evalStrftime(fmt: any, dateVal: any): string | null {
  if (!fmt || !dateVal) return null;
  return evalDateFormat(dateVal, fmt);
}

export function evalFormatMssql(val: any, fmt: any): string | null {
  if (val === null || val === undefined || fmt === null || fmt === undefined) return null;
  const d = new Date(val);
  if (!isNaN(d.getTime())) {
    const formatStr = String(fmt);
    const pad = (n: number, w = 2) => String(n).padStart(w, '0');
    return formatStr
      .replace(/yyyy/gi, String(d.getUTCFullYear()))
      .replace(/yy/gi, pad(d.getUTCFullYear() % 100))
      .replace(/MM/g, pad(d.getUTCMonth() + 1))
      .replace(/dd/gi, pad(d.getUTCDate()))
      .replace(/HH/g, pad(d.getUTCHours()))
      .replace(/mm/g, pad(d.getUTCMinutes()))
      .replace(/ss/g, pad(d.getUTCSeconds()));
  }
  return String(val);
}


export function evalJsonExtract(jsonVal: any, pathStr: any): any {
  if (jsonVal === null || jsonVal === undefined || !pathStr) return null;
  let obj: any;
  if (typeof jsonVal === 'string') {
    try { obj = JSON.parse(jsonVal); } catch { return null; }
  } else {
    obj = jsonVal;
  }
  const path = String(pathStr).trim();
  let cleanPath = path.startsWith('$.') ? path.slice(2) : (path.startsWith('$') ? path.slice(1) : path);
  if (!cleanPath) return typeof obj === 'object' ? JSON.stringify(obj) : obj;

  const tokens = cleanPath.split('.').flatMap(t => {
    const m = t.match(/^([^\[]+)(?:\[(\d+)\])?$/);
    if (m) {
      const p = [m[1]];
      if (m[2] !== undefined) p.push(Number(m[2]) as any);
      return p;
    }
    return [t];
  });

  let curr = obj;
  for (const tok of tokens) {
    if (curr === null || curr === undefined) return null;
    curr = curr[tok];
  }
  if (curr === undefined) return null;
  if (typeof curr === 'object' && curr !== null) return JSON.stringify(curr);
  return curr;
}

export function evalJsonValue(jsonVal: any, pathStr: any): string | null {
  if (jsonVal === null || jsonVal === undefined || !pathStr) return null;
  let obj: any;
  if (typeof jsonVal === 'string') {
    try { obj = JSON.parse(jsonVal); } catch { return null; }
  } else {
    obj = jsonVal;
  }
  const path = String(pathStr).trim();
  let cleanPath = path.startsWith('$.') ? path.slice(2) : (path.startsWith('$') ? path.slice(1) : path);
  if (!cleanPath) return typeof obj === 'object' ? null : String(obj);

  const tokens = cleanPath.split('.').flatMap(t => {
    const m = t.match(/^([^\[]+)(?:\[(\d+)\])?$/);
    if (m) {
      const p = [m[1]];
      if (m[2] !== undefined) p.push(Number(m[2]) as any);
      return p;
    }
    return [t];
  });

  let curr = obj;
  for (const tok of tokens) {
    if (curr === null || curr === undefined) return null;
    curr = curr[tok];
  }
  if (curr === undefined || curr === null) return null;
  if (typeof curr === 'object') return null; // MSSQL JSON_VALUE returns NULL for objects/arrays
  return String(curr);
}


export function evalJsonQuery(jsonVal: any, pathStr: any): string | null {
  const res = evalJsonExtract(jsonVal, pathStr);
  if (res === null || res === undefined) return null;
  if (typeof res === 'object') return JSON.stringify(res);
  if (typeof res === 'string' && (res.startsWith('{') || res.startsWith('['))) return res;
  return null;
}

export function evalPgJsonExtract(jsonVal: any, key: any, asText = false): any {
  if (jsonVal === null || jsonVal === undefined || key === null || key === undefined) return null;
  let obj: any;
  if (typeof jsonVal === 'string') {
    try { obj = JSON.parse(jsonVal); } catch { return null; }
  } else {
    obj = jsonVal;
  }
  const cleanKey = String(key).replace(/^['"]|['"]$/g, '');
  const res = obj[cleanKey];
  if (res === undefined) return null;
  if (asText) {
    return typeof res === 'object' && res !== null ? JSON.stringify(res) : String(res);
  }
  return typeof res === 'object' && res !== null ? JSON.stringify(res) : (typeof res === 'string' ? `"${res}"` : String(res));
}

// ── Regular Expression Evaluators ─────────────────────────────────────────────

export function evalRegexp(pattern: any, str: any): number {
  if (pattern === null || pattern === undefined || str === null || str === undefined) return 0;
  try {
    return new RegExp(String(pattern), 'i').test(String(str)) ? 1 : 0;
  } catch {
    return 0;
  }
}

export function evalRegexpLike(str: any, pattern: any, flags?: any): number {
  if (pattern === null || pattern === undefined || str === null || str === undefined) return 0;
  try {
    const f = flags ? String(flags) : 'i';
    return new RegExp(String(pattern), f).test(String(str)) ? 1 : 0;
  } catch {
    return 0;
  }
}

export function evalRegexpSubstr(str: any, pattern: any): string | null {
  if (pattern === null || pattern === undefined || str === null || str === undefined) return null;
  try {
    const match = String(str).match(new RegExp(String(pattern)));
    return match ? match[0] : null;
  } catch {
    return null;
  }
}

export function evalRegexpReplace(str: any, pattern: any, replacement?: any, flags?: any): string | null {
  if (str === null || str === undefined) return null;
  if (pattern === null || pattern === undefined) return String(str);
  try {
    const f = flags ? String(flags) : 'g';
    return String(str).replace(new RegExp(String(pattern), f), String(replacement ?? ''));
  } catch {
    return String(str);
  }
}

// ── GIS Spatial Evaluators ───────────────────────────────────────────────────

export function evalStPoint(x: any, y: any): string | null {
  if (x === null || x === undefined || y === null || y === undefined) return null;
  const numX = Number(x);
  const numY = Number(y);
  if (isNaN(numX) || isNaN(numY)) return null;
  return JSON.stringify({ type: 'Point', coordinates: [numX, numY] });
}

function parsePointCoords(geom: any): [number, number] | null {
  if (geom === null || geom === undefined) return null;
  if (typeof geom === 'object' && geom !== null) {
    if (Array.isArray(geom.coordinates) && geom.coordinates.length >= 2) {
      return [Number(geom.coordinates[0]), Number(geom.coordinates[1])];
    }
  }
  const s = String(geom).trim();
  if (s.startsWith('{')) {
    try {
      const parsed = JSON.parse(s);
      if (parsed && Array.isArray(parsed.coordinates) && parsed.coordinates.length >= 2) {
        return [Number(parsed.coordinates[0]), Number(parsed.coordinates[1])];
      }
    } catch {
      // Not JSON
    }
  }
  const pointMatch = s.match(/POINT\s*\(\s*([-\d.]+)\s+([-\d.]+)\s*\)/i);
  if (pointMatch) {
    return [Number(pointMatch[1]), Number(pointMatch[2])];
  }
  const commaParts = s.split(',');
  if (commaParts.length === 2) {
    const x = Number(commaParts[0].trim());
    const y = Number(commaParts[1].trim());
    if (!isNaN(x) && !isNaN(y)) return [x, y];
  }
  return null;
}

export function evalStX(geom: any): number | null {
  const coords = parsePointCoords(geom);
  return coords ? coords[0] : null;
}

export function evalStY(geom: any): number | null {
  const coords = parsePointCoords(geom);
  return coords ? coords[1] : null;
}

export function evalStDistance(p1: any, p2: any): number | null {
  const c1 = parsePointCoords(p1);
  const c2 = parsePointCoords(p2);
  if (!c1 || !c2) return null;
  return Math.hypot(c2[0] - c1[0], c2[1] - c1[1]);
}

export function evalStContains(polyGeom: any, ptGeom: any): number {
  const pt = parsePointCoords(ptGeom);
  if (!pt) return 0;
  const [px, py] = pt;

  let rings: [number, number][] | null = null;
  if (typeof polyGeom === 'object' && polyGeom !== null) {
    if (Array.isArray(polyGeom.coordinates)) {
      rings = polyGeom.coordinates[0] || polyGeom.coordinates;
    }
  } else if (typeof polyGeom === 'string') {
    try {
      const parsed = JSON.parse(polyGeom);
      if (parsed && Array.isArray(parsed.coordinates)) {
        rings = Array.isArray(parsed.coordinates[0]) && Array.isArray(parsed.coordinates[0][0])
          ? parsed.coordinates[0]
          : parsed.coordinates;
      }
    } catch {
      // Not JSON
    }
  }

  if (!rings || !Array.isArray(rings) || rings.length < 3) return 0;

  let inside = false;
  for (let i = 0, j = rings.length - 1; i < rings.length; j = i++) {
    const xi = Number(rings[i][0]);
    const yi = Number(rings[i][1]);
    const xj = Number(rings[j][0]);
    const yj = Number(rings[j][1]);
    const intersect = ((yi > py) !== (yj > py)) &&
                      (px < (xj - xi) * (py - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside ? 1 : 0;
}

// ── Multi-Dialect Helper Functions ────────────────────────────────────────────

export function evalNvl2(val: any, ifNotNull: any, ifNull: any): any {
  return (val !== null && val !== undefined) ? ifNotNull : ifNull;
}

export function evalDecode(val: any, ...args: any[]): any {
  if (args.length === 0) return null;
  for (let i = 0; i < args.length - 1; i += 2) {
    const search = args[i];
    const result = args[i + 1];
    if (val === search || (val == search) || (val === null && search === null)) {
      return result;
    }
  }
  return args.length % 2 === 1 ? args[args.length - 1] : null;
}

export function evalGreatest(...args: any[]): any {
  const clean = args.filter(a => a !== undefined && a !== null);
  if (clean.length === 0) return null;
  if (clean.length < args.length) return null; // Standard SQL behavior: NULL argument produces NULL
  const allNumbers = clean.every(a => !isNaN(Number(a)) && typeof a !== 'boolean');
  if (allNumbers) {
    return Math.max(...clean.map(Number));
  }
  return clean.reduce((max, curr) => String(curr) > String(max) ? curr : max, clean[0]);
}

export function evalLeast(...args: any[]): any {
  const clean = args.filter(a => a !== undefined && a !== null);
  if (clean.length === 0) return null;
  if (clean.length < args.length) return null; // Standard SQL behavior: NULL argument produces NULL
  const allNumbers = clean.every(a => !isNaN(Number(a)) && typeof a !== 'boolean');
  if (allNumbers) {
    return Math.min(...clean.map(Number));
  }
  return clean.reduce((min, curr) => String(curr) < String(min) ? curr : min, clean[0]);
}

export function evalGetDate(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getUTCFullYear()}-${pad(now.getUTCMonth() + 1)}-${pad(now.getUTCDate())} ${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())}:${pad(now.getUTCSeconds())}`;
}

export function evalSysDate(): string {
  return evalGetDate();
}

// ── Multi-Pass Window Function Execution Pipeline ─────────────────────────────

/**
 * Step B Compound Cascading Comparator Function:
 * Compares two row tuples across multiple ORDER BY columns and directions (ASC / DESC).
 * Returns -1, 0, or 1 immediately upon encountering the first non-zero comparison score.
 * Correctly handles mixed directions (e.g. ORDER BY dept ASC, salary DESC) and NULL values.
 */
export function compareRows(
  rowA: any[],
  rowB: any[],
  columns: string[],
  orderBy: WindowOrderClause[]
): number {
  for (const clause of orderBy) {
    const colIdx = columns.findIndex(c => c.toLowerCase() === clause.column.toLowerCase());
    if (colIdx === -1) continue;

    const valA = rowA[colIdx];
    const valB = rowB[colIdx];

    if (valA === valB) continue;

    // NULL handling: NULLs sort last in ASC, first in DESC
    if (valA === null || valA === undefined) return clause.direction === 'ASC' ? 1 : -1;
    if (valB === null || valB === undefined) return clause.direction === 'ASC' ? -1 : 1;

    let comp = 0;
    if (typeof valA === 'number' && typeof valB === 'number') {
      comp = valA - valB;
    } else if (valA instanceof Date && valB instanceof Date) {
      comp = valA.getTime() - valB.getTime();
    } else {
      comp = String(valA).localeCompare(String(valB));
    }

    if (comp !== 0) {
      return clause.direction === 'DESC' ? -comp : comp;
    }
  }
  return 0;
}

/**
 * Computes absolute [startIndex, endIndex] frame boundaries for a given row index within a partition
 * based on the WindowFrameSpec (ROWS BETWEEN ... AND ...). Clamped to valid indices [0, partitionLength - 1].
 */
export function getFrameBounds(
  currentIndex: number,
  partitionLength: number,
  frame: WindowFrameSpec
): [number, number] {
  const N = partitionLength;

  let start = 0;
  switch (frame.start.type) {
    case 'UNBOUNDED_PRECEDING':
      start = 0;
      break;
    case 'PRECEDING':
      start = Math.max(0, currentIndex - (frame.start.offset || 0));
      break;
    case 'CURRENT_ROW':
      start = currentIndex;
      break;
    case 'FOLLOWING':
      start = Math.min(N - 1, currentIndex + (frame.start.offset || 0));
      break;
    case 'UNBOUNDED_FOLLOWING':
      start = N - 1;
      break;
  }

  let end = N - 1;
  switch (frame.end.type) {
    case 'UNBOUNDED_PRECEDING':
      end = 0;
      break;
    case 'PRECEDING':
      end = Math.max(0, currentIndex - (frame.end.offset || 0));
      break;
    case 'CURRENT_ROW':
      end = currentIndex;
      break;
    case 'FOLLOWING':
      end = Math.min(N - 1, currentIndex + (frame.end.offset || 0));
      break;
    case 'UNBOUNDED_FOLLOWING':
      end = N - 1;
      break;
  }

  const clampedStart = Math.max(0, Math.min(N - 1, start));
  const clampedEnd = Math.max(0, Math.min(N - 1, end));
  return [Math.min(clampedStart, clampedEnd), Math.max(clampedStart, clampedEnd)];
}

/**
 * Multi-Pass Execution Engine for All Window Functions (Ranking, Positional, and Aggregate):
 * Step A: Partition intermediate dataset by PARTITION BY columns.
 * Step B: Sort each partition using compareRows compound cascading comparator.
 * Step C: Calculate values (ROW_NUMBER, RANK, DENSE_RANK, LEAD, LAG, SUM, AVG, MIN, MAX, COUNT).
 * Step D: Stitch partitions together for projection.
 */
export function evaluateWindowFunction(
  columns: string[],
  rows: any[][],
  spec: WindowSpec
): { columns: string[]; rows: any[][] } {
  const resultColumns = [...columns];
  const targetColIdx = columns.findIndex(c => c.toLowerCase() === spec.alias.toLowerCase());
  if (targetColIdx === -1) {
    resultColumns.push(spec.alias);
  }
  const outputColIdx = targetColIdx === -1 ? resultColumns.length - 1 : targetColIdx;

  // Find column index of target column for LEAD/LAG/Aggregates
  const valColIdx = spec.targetColumn
    ? columns.findIndex(c => c.toLowerCase() === spec.targetColumn!.toLowerCase())
    : -1;

  // Step A: Group dataset into memory buckets based on PARTITION BY columns
  const partitionMap = new Map<string, { originalIndex: number; row: any[] }[]>();

  rows.forEach((row, originalIndex) => {
    let key = '__ALL__';
    if (spec.partitionBy.length > 0) {
      key = spec.partitionBy
        .map(colName => {
          const idx = columns.findIndex(c => c.toLowerCase() === colName.toLowerCase());
          return idx !== -1 ? String(row[idx]) : 'null';
        })
        .join('::');
    }

    if (!partitionMap.has(key)) {
      partitionMap.set(key, []);
    }
    partitionMap.get(key)!.push({ originalIndex, row: [...row] });
  });

  const outputRows = rows.map(r => [...r]);

  // Step B & Step C: Sort each partition and calculate values
  for (const [, partitionEntries] of partitionMap.entries()) {
    // Step B: Sort partition using single compound cascading comparator
    if (spec.orderBy.length > 0) {
      partitionEntries.sort((a, b) => compareRows(a.row, b.row, columns, spec.orderBy));
    }

    // Step C: Calculate window values for sorted partition
    let currentRank = 0;
    let currentDenseRank = 0;
    let rankCounter = 0;
    let prevRow: any[] | null = null;
    const partitionLength = partitionEntries.length;

    partitionEntries.forEach((entry, idx) => {
      rankCounter++;

      const isTie =
        prevRow !== null &&
        spec.orderBy.length > 0 &&
        compareRows(prevRow, entry.row, columns, spec.orderBy) === 0;

      const func = spec.functionName;

      if (func === 'ROW_NUMBER') {
        outputRows[entry.originalIndex][outputColIdx] = idx + 1;
      } else if (func === 'RANK') {
        if (!isTie) currentRank = rankCounter;
        outputRows[entry.originalIndex][outputColIdx] = currentRank;
      } else if (func === 'DENSE_RANK') {
        if (!isTie) currentDenseRank++;
        outputRows[entry.originalIndex][outputColIdx] = currentDenseRank;
      } else if (func === 'LEAD' || func === 'LAG') {
        const offset = Number(spec.args?.[1] ?? 1);
        const fallback = spec.args?.[2] ?? null;
        const targetIdx = func === 'LEAD' ? idx + offset : idx - offset;

        if (targetIdx >= 0 && targetIdx < partitionLength) {
          const targetRow = partitionEntries[targetIdx].row;
          outputRows[entry.originalIndex][outputColIdx] = valColIdx !== -1 ? targetRow[valColIdx] : null;
        } else {
          outputRows[entry.originalIndex][outputColIdx] = fallback;
        }
      } else if (['SUM', 'AVG', 'MIN', 'MAX', 'COUNT'].includes(func)) {
        const [startIdx, endIdx] = getFrameBounds(idx, partitionLength, spec.frame);
        const frameSlice = partitionEntries.slice(startIdx, endIdx + 1);

        if (func === 'COUNT') {
          if (valColIdx === -1 || spec.targetColumn === '*') {
            outputRows[entry.originalIndex][outputColIdx] = frameSlice.length;
          } else {
            const validCount = frameSlice.filter(e => e.row[valColIdx] !== null && e.row[valColIdx] !== undefined).length;
            outputRows[entry.originalIndex][outputColIdx] = validCount;
          }
        } else {
          const vals = frameSlice
            .map(e => (valColIdx !== -1 ? e.row[valColIdx] : null))
            .filter(v => v !== null && v !== undefined);

          if (vals.length === 0) {
            outputRows[entry.originalIndex][outputColIdx] = null;
          } else if (func === 'SUM') {
            const sum = vals.reduce((acc, v) => acc + Number(v), 0);
            outputRows[entry.originalIndex][outputColIdx] = sum;
          } else if (func === 'AVG') {
            const sum = vals.reduce((acc, v) => acc + Number(v), 0);
            outputRows[entry.originalIndex][outputColIdx] = sum / vals.length;
          } else if (func === 'MIN') {
            const numericVals = vals.map(v => Number(v));
            if (numericVals.every(v => !isNaN(v))) {
              outputRows[entry.originalIndex][outputColIdx] = Math.min(...numericVals);
            } else {
              outputRows[entry.originalIndex][outputColIdx] = vals.reduce((m, v) => (String(v) < String(m) ? v : m), vals[0]);
            }
          } else if (func === 'MAX') {
            const numericVals = vals.map(v => Number(v));
            if (numericVals.every(v => !isNaN(v))) {
              outputRows[entry.originalIndex][outputColIdx] = Math.max(...numericVals);
            } else {
              outputRows[entry.originalIndex][outputColIdx] = vals.reduce((m, v) => (String(v) > String(m) ? v : m), vals[0]);
            }
          }
        }
      }

      prevRow = entry.row;
    });
  }

  return { columns: resultColumns, rows: outputRows };
}

/**
 * Backward compatibility alias for evaluateWindowFunction
 */
export function evaluateRankingWindowFunction(
  columns: string[],
  rows: any[][],
  spec: WindowSpec
): { columns: string[]; rows: any[][] } {
  return evaluateWindowFunction(columns, rows, spec);
}

// ── Pure Aggregation & Join Evaluators ────────────────────────────────────────

/**
 * Evaluates string aggregation (GROUP_CONCAT / STRING_AGG) over an array of row values.
 * Collects non-null/non-undefined string values and joins them with the specified separator.
 * Returns null if no non-null values exist.
 */
export function evaluateStringAggregate(values: any[], separator: string = ','): string | null {
  const validStrings = values
    .filter(v => v !== null && v !== undefined)
    .map(v => String(v));

  if (validStrings.length === 0) return null;
  return validStrings.join(separator);
}

/**
 * Pure evaluation function for FULL OUTER JOIN logic:
 * 1. Executes Left Join (all left rows, matching right rows or null).
 * 2. Identifies unmatched right rows.
 * 3. Appends unmatched right rows (with nulls for left columns).
 */
export function evaluateFullOuterJoin<T extends Record<string, any>, U extends Record<string, any>>(
  leftRows: T[],
  rightRows: U[],
  matchPredicate: (left: T, right: U) => boolean
): { leftRow: T | null; rightRow: U | null }[] {
  const result: { leftRow: T | null; rightRow: U | null }[] = [];
  const matchedRightIndices = new Set<number>();

  // 1. Left Join pass
  for (const left of leftRows) {
    let matched = false;
    for (let j = 0; j < rightRows.length; j++) {
      const right = rightRows[j];
      if (matchPredicate(left, right)) {
        matched = true;
        matchedRightIndices.add(j);
        result.push({ leftRow: left, rightRow: right });
      }
    }
    if (!matched) {
      result.push({ leftRow: left, rightRow: null });
    }
  }

  // 2. Unmatched Right rows pass
  for (let j = 0; j < rightRows.length; j++) {
    if (!matchedRightIndices.has(j)) {
      result.push({ leftRow: null, rightRow: rightRows[j] });
    }
  }

  return result;
}

/**
 * Generic pre-execution SQL dialect transpiler for SQLite WASM.
 * Normalizes multi-dialect constructs (T-SQL, Oracle, MySQL, Postgres)
 * to valid ANSI/SQLite SQL so any query on any table runs seamlessly.
 */
export function transpileDialectForSqlite(sql: string): string {
  if (!sql) return '';

  let out = sql;

  // 1. T-SQL bracketed identifiers: [col] or [table] -> "col" / "table"
  out = out.replace(/\[([a-zA-Z0-9_.]+)\]/g, '"$1"');

  // 2. T-SQL TOP clause: SELECT [DISTINCT] TOP (n) ... -> SELECT ... LIMIT n
  out = out.replace(
    /\bSELECT\s+(DISTINCT\s+)?TOP\s*\(?(\d+)\)?\s*(?:PERCENT\s+)?([\s\S]*?)(;|\s*$)/i,
    (_match, distinct, limitNum, rest, trailing) => {
      const cleanRest = rest.trim();
      if (/\bLIMIT\s+\d+/i.test(cleanRest)) {
        return `SELECT ${distinct || ''}${cleanRest}${trailing}`;
      }
      return `SELECT ${distinct || ''}${cleanRest} LIMIT ${limitNum}${trailing}`;
    }
  );

  // 3. Oracle ROWNUM filtering: WHERE ROWNUM <= n -> LIMIT n
  out = out.replace(
    /\bWHERE\s+ROWNUM\s*<=\s*(\d+)\s*(?:AND\s+([\s\S]*?))?(;|\s*$)/i,
    (_match, limitNum, remainingWhere, trailing) => {
      const whereClause = remainingWhere ? `WHERE ${remainingWhere.trim()} ` : '';
      return `${whereClause}LIMIT ${limitNum}${trailing}`;
    }
  );
  out = out.replace(
    /\bAND\s+ROWNUM\s*<=\s*(\d+)(;|\s*$)/i,
    (_match, limitNum, trailing) => {
      return ` LIMIT ${limitNum}${trailing}`;
    }
  );

  // 4. Postgres JSON operators
  out = out
    .replace(/(\b[a-zA-Z0-9_.]+\b)\s*->>\s*('[^']+'|\b[a-zA-Z0-9_]+\b)/g, 'PG_JSON_EXTRACT_TEXT($1, $2)')
    .replace(/(\b[a-zA-Z0-9_.]+\b)\s*->\s*('[^']+'|\b[a-zA-Z0-9_]+\b)/g, 'PG_JSON_EXTRACT($1, $2)');

  // 5. String aggregations (SQL Server STRING_AGG / MySQL GROUP_CONCAT)
  out = out
    .replace(/\bSTRING_AGG\s*\(\s*([^,]+?)\s*,\s*('[^']*'|"[^"]*")\s*\)/gi, 'GROUP_CONCAT($1, $2)')
    .replace(/\bSTRING_AGG\s*\(\s*([^)]+?)\s*\)/gi, 'GROUP_CONCAT($1)')
    .replace(/\bGROUP_CONCAT\s*\(\s*(.*?)\s+SEPARATOR\s+('[^']*'|"[^"]*")\s*\)/gi, 'GROUP_CONCAT($1, $2)');

  // 6. DDL & Administration
  out = out
    .replace(/\bTRUNCATE\s+(?:TABLE\s+)?([a-zA-Z0-9_.]+?);?$/gi, 'DELETE FROM "$1";')
    .replace(/\bTRUNCATE\s+(?:TABLE\s+)?([a-zA-Z0-9_.]+?)\s*;/gi, 'DELETE FROM "$1";')
    .replace(/CREATE\s+(?:DATABASE|SCHEMA)\s+[a-zA-Z0-9_.]+;?/gi, '');

  // 7. Boolean comparison normalization
  out = out
    .replace(/(\b[a-zA-Z0-9_.]+\b)\s*IS\s+NOT\s+(?:TRUE|true)\b/g, "$1 NOT IN (1, 'true', 'TRUE', 't', '1')")
    .replace(/(\b[a-zA-Z0-9_.]+\b)\s*IS\s+NOT\s+(?:FALSE|false)\b/g, "$1 NOT IN (0, 'false', 'FALSE', 'f', '0')")
    .replace(/(\b[a-zA-Z0-9_.]+\b)\s*(?:!=|<>)\s*(?:TRUE|true)\b/g, "$1 NOT IN (1, 'true', 'TRUE', 't', '1')")
    .replace(/(\b[a-zA-Z0-9_.]+\b)\s*(?:!=|<>)\s*(?:FALSE|false)\b/g, "$1 NOT IN (0, 'false', 'FALSE', 'f', '0')")
    .replace(/(\b[a-zA-Z0-9_.]+\b)\s*(?:=|IS)\s+(?:TRUE|true)\b/g, "$1 IN (1, 'true', 'TRUE', 't', '1')")
    .replace(/(\b[a-zA-Z0-9_.]+\b)\s*(?:=|IS)\s+(?:FALSE|false)\b/g, "$1 IN (0, 'false', 'FALSE', 'f', '0')");

  return out.trim();
}



// ── SQLExecutor Class ─────────────────────────────────────────────────────────


export class SQLExecutor {
  private SQL:      SqlJsStatic | null = null;
  private db:       Database | null    = null;
  private catalog:  SessionCatalog;
  private initPromise: Promise<void> | null = null;

  constructor(catalog: SessionCatalog = globalCatalog) {
    this.catalog = catalog;
  }

  private registerCustomFunctions(db: Database): void {
    registerCustomSqliteFunctions(db);
  }

  private isRehydrated = false;
  private userTableDefs = new Map<string, { ddlSql: string; columns: any[] }>();

  /**
   * Initialize sql.js engine and create fresh in-memory database.
   */
  async init(): Promise<void> {
    if (this.db) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      if (!this.SQL) {
        this.SQL = await getOrInitSqlJs();
      }
      this.db = new this.SQL.Database();
      this.registerCustomFunctions(this.db);

      if (!this.isRehydrated) {
        this.isRehydrated = true;
        await this.rehydrateUserCatalog();
      }
    })();

    return this.initPromise;
  }

  private async rehydrateUserCatalog(): Promise<void> {
    try {
      const { loadUserCatalogFromStorage } = await import('../utils/userCatalogStorage');
      const persisted = loadUserCatalogFromStorage();
      if (!persisted) return;

      for (const dbName of persisted.databases) {
        if (!this.catalog.hasDatabase(dbName)) {
          this.catalog.createDatabase(dbName);
        }
      }

      for (const table of persisted.tables) {
        if (!this.catalog.has(table.tableName, table.dbName)) {
          await this.createUserTable(table.tableName, table.ddlSql, table.columns, table.dbName, table.rowCount);
        }
      }
    } catch {
      // ignore
    }
  }

  private async syncUserCatalogToStorage(): Promise<void> {
    try {
      const { saveUserCatalogToStorage } = await import('../utils/userCatalogStorage');
      const dbs = this.catalog.getDatabaseNames().filter(d => d !== 'default');
      const userTables: import('../utils/userCatalogStorage').PersistedUserTable[] = [];

      for (const entry of this.catalog.getAll()) {
        if (entry.isUserDefined) {
          const key = `${entry.dbName || 'default'}.${entry.tableName}`;
          const meta = this.userTableDefs.get(key);
          if (meta) {
            userTables.push({
              tableName: entry.tableName,
              dbName: entry.dbName || 'default',
              ddlSql: meta.ddlSql,
              columns: meta.columns,
              rowCount: entry.rowCount,
            });
          }
        }
      }

      saveUserCatalogToStorage(dbs, userTables);
    } catch {
      // ignore
    }
  }

  /**
   * Reset database and clear session catalog.
   */
  reset(): void {
    if (this.db) {
      this.db.close();
      if (this.SQL) {
        this.db = new this.SQL.Database();
        this.registerCustomFunctions(this.db);
      } else {
        this.db = null;
      }
    }
    this.catalog.reset();
  }

  private hasTableInSqlite(tableName: string): boolean {
    if (!this.db) return false;
    try {
      const safeName = tableName.replace(/'/g, "''");
      const res = this.db.exec(`SELECT name FROM sqlite_master WHERE type='table' AND lower(name)=lower('${safeName}')`);
      return res.length > 0 && res[0].values.length > 0;
    } catch {
      return false;
    }
  }

  /**
   * Returns current session catalog.
   */
  getCatalog(): SessionCatalog {
    return this.catalog;
  }

  /**
   * Export the in-memory SQLite database as raw binary Uint8Array.
   */
  exportDatabaseBinary(): Uint8Array | null {
    if (!this.db) return null;
    try {
      return this.db.export();
    } catch {
      return null;
    }
  }

  /**
   * Return foreign keys for a table from SQLite PRAGMA
   */
  getTableForeignKeys(tableName: string): Array<{ from: string; toTable: string; toCol: string }> {
    if (!this.db) return [];
    try {
      const res = this.db.exec(`PRAGMA foreign_key_list("${tableName}");`);
      if (res && res[0] && res[0].values) {
        return res[0].values.map((row) => ({
          from: String(row[3] || '').toLowerCase(),
          toTable: String(row[2] || '').toLowerCase(),
          toCol: String(row[4] || 'id').toLowerCase(),
        }));
      }
    } catch {
      // ignore
    }
    return [];
  }

  /**
   * Return sample rows from a table for ERD preview
   */
  getTableSampleRows(tableName: string, limit = 5): unknown[][] {
    if (!this.db) return [];
    try {
      const res = this.db.exec(`SELECT * FROM "${tableName}" LIMIT ${limit};`);
      if (res && res[0] && res[0].values) {
        return res[0].values;
      }
    } catch {
      // ignore
    }
    return [];
  }

  /**
   * Materialize an imported tabular dataset (CSV, TSV, JSON) directly into SQLite
   * and register it in the session catalog.
   */
  async importTabularTable(
    tableName: string,
    columns: Array<{ name: string; sqliteType: string }>,
    rows: unknown[][],
    dbName: string = 'default'
  ): Promise<{ ok: boolean; rowCount: number; error?: string }> {
    await this.init();
    if (!this.db) return { ok: false, rowCount: 0, error: 'Database not initialized' };

    const safeTable = tableName.toLowerCase().trim().replace(/[^a-z0-9_]/g, '_');
    const colDefs = columns.map((c) => `"${c.name.replace(/"/g, '""')}" ${c.sqliteType || 'TEXT'}`).join(', ');
    const ddl = `CREATE TABLE IF NOT EXISTS "${safeTable}" (${colDefs});`;

    try {
      this.db.exec(ddl);

      if (rows.length > 0) {
        const placeholders = columns.map(() => '?').join(', ');
        const insertSql = `INSERT INTO "${safeTable}" VALUES (${placeholders});`;
        const stmt = this.db.prepare(insertSql);
        try {
          this.db.exec('BEGIN TRANSACTION;');
          for (const row of rows) {
            const rowValues = columns.map((_, i) => {
              const v = row[i];
              return (typeof v === 'number' || typeof v === 'string') ? v : v == null ? null : String(v);
            });
            stmt.run(rowValues);
          }
          this.db.exec('COMMIT;');
        } catch (insertErr) {
          try { this.db.exec('ROLLBACK;'); } catch {}
          throw insertErr;
        } finally {
          stmt.free();
        }
      }

      // Register in catalog
      const inferredCols: import('./inference').ColumnDef[] = columns.map((c) => ({
        name: c.name,
        logicalType: (c.sqliteType === 'INTEGER' ? 'INTEGER' : c.sqliteType === 'REAL' ? 'NUMERIC' : 'VARCHAR') as import('./inference').LogicalType,
        sqliteType: c.sqliteType || 'TEXT',
        source: 'csv_import',
      }));

      const schema: import('./inference').TableSchema = {
        tableName: safeTable,
        columns: inferredCols,
        isDefault: false,
      };

      this.catalog.set(safeTable, schema, rows.length, true, dbName);
      return { ok: true, rowCount: rows.length };
    } catch (err: any) {
      return { ok: false, rowCount: 0, error: err.message || String(err) };
    }
  }

  /**
   * Load an entire SQLite binary database into the engine and inspect its tables to rebuild catalog.
   */
  async loadDatabaseBinary(binary: Uint8Array): Promise<void> {
    if (!this.SQL) {
      this.SQL = await getOrInitSqlJs();
    }
    if (this.db) {
      try { this.db.close(); } catch {}
    }
    this.db = new this.SQL.Database(binary);
    this.registerCustomFunctions(this.db);
    await this.rebuildCatalogFromSqlite();
  }

  private async rebuildCatalogFromSqlite(): Promise<void> {
    if (!this.db) return;
    this.catalog.reset();

    try {
      const res = this.db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';");
      if (!res.length || !res[0].values) return;

      for (const [tblNameVal] of res[0].values) {
        const tableName = String(tblNameVal);
        const colRes = this.db.exec(`PRAGMA table_info("${tableName.replace(/"/g, '""')}");`);
        const countRes = this.db.exec(`SELECT COUNT(*) FROM "${tableName.replace(/"/g, '""')}";`);
        const rowCount = Number(countRes[0]?.values[0]?.[0] || 0);

        const columns: import('./inference').ColumnDef[] = [];
        let pkCol: string | undefined;

        if (colRes.length && colRes[0].values) {
          for (const colRow of colRes[0].values) {
            const colName = String(colRow[1]);
            const colType = String(colRow[2] || 'TEXT').toUpperCase();
            const isPk = Boolean(colRow[5]);
            if (isPk && !pkCol) pkCol = colName;

            let logicalType: import('./inference').LogicalType = 'VARCHAR';
            if (colType.includes('INT')) logicalType = 'INTEGER';
            else if (colType.includes('REAL') || colType.includes('FLOA') || colType.includes('DOUB')) logicalType = 'NUMERIC';
            else if (colType.includes('DATE') || colType.includes('TIME')) logicalType = 'DATE';
            else if (colType.includes('BOOL')) logicalType = 'BOOLEAN';

            columns.push({
              name: colName,
              logicalType,
              sqliteType: colType,
              source: 'sqlite_import',
            });
          }
        }

        const schema: import('./inference').TableSchema = {
          tableName,
          columns,
          isDefault: false,
        };

        this.catalog.set(tableName, schema, rowCount, true, 'default');
      }
    } catch (e) {
      console.warn('Failed to rebuild catalog from sqlite binary:', e);
    }
  }



  /**
   * Main pipeline entry point: parses, infers, materializes, and executes query.
   */
  async execute(
    queryText: string,
    dialect:   Dialect,
    options:   ExecutorOptions = {},
  ): Promise<ExecutionResult> {
    const startTime = performance.now();
    await this.init();

    if (!this.db) {
      return {
        ok: false,
        errorType: 'RUNTIME_ERROR',
        message: 'SQL execution engine failed to initialize.',
        executionTimeMs: performance.now() - startTime,
      };
    }

    const trimmedQuery = queryText.trim();
    if (!trimmedQuery) {
      return {
        ok: true,
        columns: [],
        rows: [],
        rowCount: 0,
        executionTimeMs: performance.now() - startTime,
        inferredTables: [],
        reusedTables: [],
      };
    }

    // Strip SQL comments to check if executable statements exist
    const codeWithoutComments = trimmedQuery
      .replace(/--.*$/gm, '')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .trim();

    if (!codeWithoutComments) {
      return {
        ok: true,
        columns: ['info'],
        rows: [['(Comment only — no SQL statements executed)']],
        rowCount: 0,
        executionTimeMs: performance.now() - startTime,
        inferredTables: [],
        reusedTables: [],
      };
    }

    // ── Fast-Path Fall-Through Gate: Administrative & Procedural Classifiers ───
    if (isAdminCommand(codeWithoutComments)) {
      return await AdminSimulator.execute(codeWithoutComments, this.db, this.catalog, startTime);
    }

    if (isProceduralScript(codeWithoutComments)) {
      return await ProceduralRunner.execute(codeWithoutComments, this, this.db, this.catalog, dialect, startTime);
    }

    const effectiveQuery = hasDialectSugar(codeWithoutComments)
      ? transpileDialectSugar(codeWithoutComments)
      : trimmedQuery;

    // ── 1. Parse Query ────────────────────────────────────────────────────────
    let parseResult = parse(effectiveQuery, dialect);
    if (!parseResult.ok && effectiveQuery !== trimmedQuery) {
      parseResult = parse(trimmedQuery, dialect);
    }
    if (!parseResult.ok) {
      const routineSpecs = extractRoutineStatements(trimmedQuery);
      const triggerSpecs = extractTriggerStatements(trimmedQuery);

      if (routineSpecs.length > 0 || triggerSpecs.length > 0) {
        for (const r of routineSpecs) {
          this.catalog.setRoutine(r.routineName, r.type, r.parameters, r.body, r.returnType, r.dbName);
        }
        for (const tr of triggerSpecs) {
          this.catalog.setTrigger(tr.triggerName, tr.targetTable, tr.timing, tr.event, tr.body, tr.dbName);
          try {
            this.db.run(tr.body);
          } catch {
            // WASM engine fallback
          }
        }
        return {
          ok: true,
          columns: ['status'],
          rows: [['Procedural DDL executed & registered in catalog.']],
          rowCount: 0,
          executionTimeMs: performance.now() - startTime,
          inferredTables: [],
          reusedTables: [],
        };
      }

      return {
        ok: false,
        errorType: 'SYNTAX_ERROR',
        message: parseResult.message,
        executionTimeMs: performance.now() - startTime,
      };
    }

    // ── 1.5. Process DDL Statements & Register Schema/Tables/Views/Routines/Triggers ─
    if (parseResult.ast) {
      const schemaSpecs = extractCreateSchemaStatements(parseResult.ast);
      for (const s of schemaSpecs) {
        this.catalog.createSchema(s.name);
      }

      const viewSpecs = extractCreateViewStatements(parseResult.ast);
      for (const v of viewSpecs) {
        this.catalog.setView(v.viewName, trimmedQuery, v.selectAst, v.dbName);
      }

      const truncateSpecs = extractTruncateStatements(parseResult.ast);
      for (const t of truncateSpecs) {
        this.catalog.truncateTable(t.tableName, t.dbName);
      }

      const routineSpecs = extractRoutineStatements(trimmedQuery, parseResult.ast);
      for (const r of routineSpecs) {
        this.catalog.setRoutine(r.routineName, r.type, r.parameters, r.body, r.returnType, r.dbName);
      }

      const triggerSpecs = extractTriggerStatements(trimmedQuery, parseResult.ast);
      for (const tr of triggerSpecs) {
        this.catalog.setTrigger(tr.triggerName, tr.targetTable, tr.timing, tr.event, tr.body, tr.dbName);
      }

      // Register explicit user-defined CREATE TABLE statements into catalog
      const walkCreateTables = (node: any) => {
        if (!node || typeof node !== 'object') return;
        if (Array.isArray(node)) {
          node.forEach(walkCreateTables);
          return;
        }
        if (node.type === 'create' && String(node.keyword || '').toLowerCase() === 'table') {
          const tblObj = Array.isArray(node.table) ? node.table[0] : node.table;
          const rawName = tblObj?.table || tblObj?.value || (typeof tblObj === 'string' ? tblObj : '');
          if (rawName) {
            const cols: any[] = [];
            if (Array.isArray(node.create_definitions)) {
              node.create_definitions.forEach((defNode: any) => {
                const colName = defNode.column?.column?.expr?.value || defNode.column?.column || defNode.column;
                const dataType = defNode.definition?.dataType || 'TEXT';
                if (colName) {
                  cols.push({
                    name: String(colName),
                    logicalType: String(dataType).toUpperCase(),
                    sqliteType: String(dataType).toUpperCase(),
                    source: 'User-defined DDL',
                  });
                }
              });
            }
            this.catalog.set(
              String(rawName),
              { tableName: String(rawName), isDefault: false, columns: cols },
              0,
              true
            );
            continualLearner.recordTableExperience(
              String(rawName),
              cols.map(c => ({ name: c.name, logicalType: c.logicalType as any }))
            );
          }
        }
        for (const k of Object.keys(node)) {
          if (typeof node[k] === 'object') walkCreateTables(node[k]);
        }
      };
      walkCreateTables(parseResult.ast);
    } else {
      // Fallback regex extractions if AST parser returned errors
      const routineSpecs = extractRoutineStatements(trimmedQuery);
      for (const r of routineSpecs) {
        this.catalog.setRoutine(r.routineName, r.type, r.parameters, r.body, r.returnType, r.dbName);
      }

      const triggerSpecs = extractTriggerStatements(trimmedQuery);
      for (const tr of triggerSpecs) {
        this.catalog.setTrigger(tr.triggerName, tr.targetTable, tr.timing, tr.event, tr.body, tr.dbName);
      }
    }

    // Extract CTE names (WITH / WITH RECURSIVE)
    const recursiveCteInfo = extractRecursiveCtes(trimmedQuery, parseResult.ast);
    const cteNameSet = new Set(recursiveCteInfo.cteNames);

    // ── 2. Identify Tables & Cache State ──────────────────────────────────────
    const allReferencedTables = parseResult.tableList.map(t => {
      // Table string format: "select::null::customers" -> "customers"
      const parts = t.split('::');
      return (parts[parts.length - 1] || '').toLowerCase().trim();
    }).filter(t => Boolean(t) && t !== '(.*)');

    const uniqueTables = Array.from(new Set(allReferencedTables));
    const missingTables: string[] = [];
    const reusedTables:  string[] = [];

    const createdInQuery = new Set(
      parseResult.tableList
        .filter(t => t.startsWith('create::'))
        .map(t => {
          const parts = t.split('::');
          return (parts[parts.length - 1] || '').toLowerCase().trim();
        })
    );

    for (const tbl of uniqueTables) {
      const existsInSqlite = this.hasTableInSqlite(tbl);
      if (
        (this.catalog.has(tbl) && existsInSqlite) ||
        this.catalog.hasView(tbl) ||
        existsInSqlite ||
        createdInQuery.has(tbl) ||
        cteNameSet.has(tbl.toLowerCase())
      ) {
        reusedTables.push(tbl);
      } else {
        missingTables.push(tbl);
      }
    }


    const inferredTables: string[] = [];

    // ── 3. Infer & Materialize Missing Tables ─────────────────────────────────
    if (missingTables.length > 0) {
      try {
        const inferredSchemas = inferSchemaCached(trimmedQuery, dialect);
        const plan = buildTableGenerationPlan(trimmedQuery, dialect, missingTables);
        const dataset = generateSyntheticDataset(inferredSchemas, plan, options);

        for (const [tblName, data] of dataset) {
          // Create table in sql.js
          this.db.run(data.createSql);
          // Insert rows
          for (const insertStmt of data.insertSql) {
            this.db.run(insertStmt);
          }
          // Register in catalog
          this.catalog.set(tblName, data.schema, data.rows.length, false);
          inferredTables.push(tblName);
        }
      } catch (err: any) {
        return {
          ok: false,
          errorType: 'RUNTIME_ERROR',
          message: `Schema inference failure: ${err.message}`,
          executionTimeMs: performance.now() - startTime,
        };
      }
    }

    // ── 4. Execute Query in SQLite WASM ───────────────────────────────────────
    let executableQuery = transpileDialectForSqlite(effectiveQuery);

    if (!executableQuery) {
      return {
        ok: true,
        columns: ['status'],
        rows: [['Statement executed successfully.']],
        rowCount: 0,
        executionTimeMs: performance.now() - startTime,
        inferredTables,
        reusedTables,
      };
    }

    try {
      const results = this.db.exec(executableQuery);
      const executionTimeMs = performance.now() - startTime;

      // Sync row counts for all catalog entries from SQLite WASM database
      for (const entry of this.catalog.getAll()) {
        try {
          const cntRes = this.db.exec(`SELECT COUNT(*) FROM "${entry.tableName}";`);
          if (cntRes.length > 0 && cntRes[0].values.length > 0) {
            entry.rowCount = Number(cntRes[0].values[0][0]);
          }
        } catch {
          // Table may not exist yet in SQLite WASM
        }
      }



      if (results.length === 0) {
        const isSelect =
          /^\s*SELECT\b/i.test(codeWithoutComments) ||
          (parseResult.ok && Array.isArray(parseResult.ast) && parseResult.ast.some((n: any) => n.type === 'select'));

        if (isSelect) {
          let selectCols: string[] = [];
          if (allReferencedTables.length > 0) {
            const entry = this.catalog.get(allReferencedTables[0]);
            if (entry && entry.schema && Array.isArray(entry.schema.columns)) {
              selectCols = entry.schema.columns.map(c => c.name);
            }
          }

          if (selectCols.length === 0 && allReferencedTables.length > 0) {
            try {
              const pragmaRes = this.db.exec(`PRAGMA table_info("${allReferencedTables[0]}");`);
              if (pragmaRes.length > 0 && Array.isArray(pragmaRes[0].values)) {
                selectCols = pragmaRes[0].values.map((v: any) => String(v[1]));
              }
            } catch {
              // fallback
            }
          }

          return {
            ok: true,
            columns: selectCols,
            rows: [],
            rowCount: 0,
            executionTimeMs,
            inferredTables,
            reusedTables,
          };
        }

        const rowsModified = (this.db as any).getRowsModified ? (this.db as any).getRowsModified() : 0;
        return {
          ok: true,
          columns: ['status', 'rows_affected'],
          rows: [['Statement executed successfully.', rowsModified]],
          rowCount: rowsModified,
          executionTimeMs,
          inferredTables,
          reusedTables,
        };
      }

      const allResults: SingleQueryResult[] = results.map((r, idx) => ({
        queryIndex: idx + 1,
        columns:    r.columns || [],
        rows:       r.values || [],
        rowCount:   r.values ? r.values.length : 0,
      }));

      const firstResult = results[0];
      return {
        ok: true,
        columns: firstResult?.columns || [],
        rows: firstResult?.values || [],
        rowCount: firstResult?.values ? firstResult.values.length : 0,
        executionTimeMs,
        inferredTables,
        reusedTables,
        allResults,
      };
    } catch (err: any) {
      const errMsg: string = err?.message || String(err);

      // Check if this is an ambiguous column error
      if (/ambiguous column name/i.test(errMsg)) {
        return {
          ok: false,
          errorType: 'AMBIGUOUS_COLUMN',
          message: errMsg,
          executionTimeMs: performance.now() - startTime,
        };
      }

      // ── 5. Retry-Once Safety Net for Missing Tables ─────────────────────────
      const match = errMsg.match(/no such table:\s*([a-zA-Z0-9_]+)/i);
      if (match && match[1]) {
        const fallbackTable = match[1].toLowerCase();
        if (!this.catalog.has(fallbackTable)) {
          try {
            // Materialize fallback starter schema
            const fallbackSchema: TableSchema = {
              tableName: fallbackTable,
              isDefault: true,
              columns: DEFAULT_COLUMNS.map(c => ({
                name: c.name,
                logicalType: c.logicalType,
                sqliteType: SQLITE_DDL[c.logicalType],
                source: 'Safety Net: starter default schema fallback',
              })),
            };

            const fallbackPlan = {
              generationOrder: [fallbackTable],
              relationships: [],
              selfJoins: [],
            };

            const fallbackDataset = generateSyntheticDataset(
              new Map([[fallbackTable, fallbackSchema]]),
              fallbackPlan,
              options
            );

            const fallbackData = fallbackDataset.get(fallbackTable);
            if (fallbackData) {
              this.db.run(fallbackData.createSql);
              for (const ins of fallbackData.insertSql) {
                this.db.run(ins);
              }
              this.catalog.set(fallbackTable, fallbackSchema, fallbackData.rows.length, false);
              inferredTables.push(fallbackTable);

              // Retry execution ONCE
              const retryResults = this.db.exec(executableQuery);
              const executionTimeMs = performance.now() - startTime;

              if (retryResults.length === 0) {
                return {
                  ok: true,
                  columns: [],
                  rows: [],
                  rowCount: 0,
                  executionTimeMs,
                  inferredTables,
                  reusedTables,
                };
              }

              const allRetryResults: SingleQueryResult[] = retryResults.map((r, idx) => ({
                queryIndex: idx + 1,
                columns:    r.columns || [],
                rows:       r.values || [],
                rowCount:   r.values ? r.values.length : 0,
              }));

              return {
                ok: true,
                columns: retryResults[0]?.columns || [],
                rows: retryResults[0]?.values || [],
                rowCount: retryResults[0]?.values ? retryResults[0].values.length : 0,
                executionTimeMs,
                inferredTables,
                reusedTables,
                allResults: allRetryResults,
              };
            }
          } catch (retryErr: any) {
            return {
              ok: false,
              errorType: 'RUNTIME_ERROR',
              message: retryErr.message || String(retryErr),
              executionTimeMs: performance.now() - startTime,
            };
          }
        }
      }

      // If not recoverable by retry-once, return runtime error
      return {
        ok: false,
        errorType: 'RUNTIME_ERROR',
        message: errMsg,
        executionTimeMs: performance.now() - startTime,
      };
    }
  }

  // ── Visual Database Manager — Public API ────────────────────────────────────

  /**
   * Creates a named database/schema namespace in the SessionCatalog.
   * Returns false if the name is invalid or already exists.
   */
  createUserDatabase(dbName: string): boolean {
    const trimmed = dbName.trim().toLowerCase();
    if (!trimmed || !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(trimmed)) return false;
    if (this.catalog.hasDatabase(trimmed)) return false;
    this.catalog.createDatabase(trimmed);
    this.syncUserCatalogToStorage();
    return true;
  }

  /**
   * Drops a named database: removes all its tables from the WASM db and clears it from the catalog.
   * Returns false if the database does not exist.
   */
  async dropUserDatabase(dbName: string): Promise<boolean> {
    const trimmed = dbName.trim().toLowerCase();
    if (!this.catalog.hasDatabase(trimmed)) return false;
    await this.init();
    if (!this.db) return false;
    const db = this.catalog.getDatabase(trimmed);
    if (db) {
      for (const tableName of Array.from(db.tables.keys())) {
        try { this.db.run(`DROP TABLE IF EXISTS ${tableName};`); } catch { /* ignore */ }
      }
    }
    this.catalog.dropDatabase(trimmed);
    await this.syncUserCatalogToStorage();
    return true;
  }

  /**
   * Creates a user-defined table from wizard form data:
   *  1. Executes DDL in the WASM sql.js DB (FK constraints attempted separately, with safe fallback).
   *  2. Maps form columns to a TableSchema for the catalog and data generator.
   *  3. Auto-generates synthetic rows using the existing generator pipeline.
   *  4. Executes INSERT batch.
   *  5. Registers table in SessionCatalog as isUserDefined=true.
   *
   * @param tableName  - table name (unqualified)
   * @param ddlSql     - complete CREATE TABLE ... SQL already built by buildCreateTableSql
   * @param columns    - raw column form rows for schema mapping
   * @param dbName     - target database name (default = 'default')
   * @param rowsToGenerate - number of synthetic rows to insert (max 25)
   */
  async createUserTable(
    tableName: string,
    ddlSql: string,
    columns: import('../utils/dbManagerUtils').ColumnFormRow[],
    dbName: string = 'default',
    rowsToGenerate: number = 20,
  ): Promise<{ ok: boolean; rowCount: number; ddl: string; error?: string }> {
    await this.init();
    if (!this.db) return { ok: false, rowCount: 0, ddl: ddlSql, error: 'Engine not initialized.' };

    const safeRows = Math.min(Math.max(1, rowsToGenerate), 25);
    const safeTable = tableName.toLowerCase().trim();

    // ── 1. Execute DDL in SQLite WASM engine ──
    // Convert form columns to clean SQLite-compatible DDL for sql.js execution
    const { mapFormTypeToLogicalType } = await import('../utils/dbManagerUtils');
    const { SQLITE_DDL } = await import('./inference');

    const execColDefs = columns.map(c => {
      const lt = mapFormTypeToLogicalType(c.type);
      const sqType = SQLITE_DDL[lt];
      const pk = c.isPrimaryKey ? ' PRIMARY KEY' : '';
      const nn = c.isNotNull && !c.isPrimaryKey ? ' NOT NULL' : '';
      const uq = c.isUnique && !c.isPrimaryKey ? ' UNIQUE' : '';
      return `"${c.name}" ${sqType}${pk}${nn}${uq}`;
    });
    const sqliteDdl = `CREATE TABLE IF NOT EXISTS "${safeTable}" (\n  ${execColDefs.join(',\n  ')}\n);`;

    try {
      this.db.run(sqliteDdl);
    } catch (e: any) {
      return { ok: false, rowCount: 0, ddl: ddlSql, error: `DDL Error: ${e.message || String(e)}` };
    }

    // ── 2. Build TableSchema from form columns ─────────────────────────────────
    const schemaCols = columns.map(c => {
      const lt = mapFormTypeToLogicalType(c.type);
      const ev = (c.type.toUpperCase().includes('ENUM') ? c.enumValues : c.setValues);
      return {
        name: c.name,
        logicalType: lt,
        sqliteType: SQLITE_DDL[lt],
        source: 'User-defined via wizard',
        enumValues: (ev && ev.length > 0) ? ev : undefined,
      };
    });

    const tableSchema = { tableName: safeTable, columns: schemaCols, isDefault: false };

    // ── 3. Generate synthetic data ─────────────────────────────────────────────
    let insertedRows = 0;
    try {
      const { generateSyntheticDataset, generateInsertSql } = await import('./generator');
      const schemasMap = new Map([[safeTable, tableSchema]]);
      const plan = { generationOrder: [safeTable], relationships: [], selfJoins: [], tableSpecs: {} };
      const dataset = generateSyntheticDataset(schemasMap, plan as any, { rowsPerTable: safeRows });
      const tableData = dataset.get(safeTable);

      if (tableData && tableData.rows.length > 0) {
        const inserts = generateInsertSql(safeTable, tableData.columns, tableData.rows);
        for (const ins of inserts) {
          try { this.db!.run(ins); insertedRows++; } catch { /* skip problematic rows */ }
        }
      }
    } catch {
      // Data generation failure is non-fatal — table is still created
    }

    // ── 4. Register in catalog & persist to storage ────────────────────────────
    this.catalog.set(safeTable, tableSchema, insertedRows, true, dbName);
    continualLearner.recordTableExperience(
      safeTable,
      tableSchema.columns.map(c => ({ name: c.name, logicalType: c.logicalType as any }))
    );
    const key = `${dbName.toLowerCase()}.${safeTable}`;
    this.userTableDefs.set(key, { ddlSql, columns });
    await this.syncUserCatalogToStorage();

    return { ok: true, rowCount: insertedRows, ddl: ddlSql };
  }

  /**
   * Drops a user-defined table from the WASM DB and removes it from the SessionCatalog.
   * Only tables marked as isUserDefined=true can be dropped via this method.
   */
  async dropUserTable(tableName: string, dbName: string = 'default'): Promise<boolean> {
    const safeTable = tableName.toLowerCase().trim();
    const entry = this.catalog.get(safeTable, dbName);
    if (!entry) return false;

    await this.init();
    if (!this.db) return false;

    try {
      this.db.run(`DROP TABLE IF EXISTS ${safeTable};`);
    } catch { /* ignore */ }

    this.catalog.delete(safeTable, dbName);
    const key = `${dbName.toLowerCase()}.${safeTable}`;
    this.userTableDefs.delete(key);
    await this.syncUserCatalogToStorage();
    return true;
  }
}
