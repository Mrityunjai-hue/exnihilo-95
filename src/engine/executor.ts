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

import { buildTableGenerationPlan } from './relationships';
import { generateSyntheticDataset, GeneratorOptions, generateCreateTableSql, generateInsertSql } from './generator';
import { SessionCatalog, globalCatalog } from './catalog';


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
    db.create_function('COALESCE', evalCoalesce);
    db.create_function('NULLIF', evalNullif);
    db.create_function('CONCAT', evalConcat);
    db.create_function('SUBSTRING', evalSubstring);
    db.create_function('SUBSTR', evalSubstring);
    db.create_function('DATE_FORMAT', evalDateFormat);
    db.create_function('TO_CHAR', evalToChar);
    db.create_function('strftime', evalStrftime);
    db.create_function('FORMAT', evalFormatMssql);
    db.create_function('JSON_EXTRACT', evalJsonExtract);
    db.create_function('JSON_VALUE', evalJsonValue);
    db.create_function('JSON_QUERY', evalJsonQuery);
    db.create_function('PG_JSON_EXTRACT', (val: any, key: any) => evalPgJsonExtract(val, key, false));
    db.create_function('PG_JSON_EXTRACT_TEXT', (val: any, key: any) => evalPgJsonExtract(val, key, true));
  }

  /**
   * Initialize sql.js engine and create fresh in-memory database.
   */
  async init(): Promise<void> {
    if (this.db) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      if (!this.SQL) {
        // In browser (Next.js client-side), load WASM from /sql-wasm.wasm
        const isBrowser = typeof window !== 'undefined';
        this.SQL = await initSqlJs(
          isBrowser ? { locateFile: () => '/sql-wasm.wasm' } : undefined
        );
      }
      this.db = new this.SQL.Database();
      this.registerCustomFunctions(this.db);
    })();

    return this.initPromise;
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

    // ── 1. Parse Query ────────────────────────────────────────────────────────
    const parseResult = parse(trimmedQuery, dialect);
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
      if (
        this.catalog.has(tbl) ||
        this.catalog.hasView(tbl) ||
        this.hasTableInSqlite(tbl) ||
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
        const inferredSchemas = inferSchema(trimmedQuery, dialect);
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
    let executableQuery = trimmedQuery
      .replace(/(\b[a-zA-Z0-9_.]+\b)\s*->>\s*('[^']+'|\b[a-zA-Z0-9_]+\b)/g, 'PG_JSON_EXTRACT_TEXT($1, $2)')
      .replace(/(\b[a-zA-Z0-9_.]+\b)\s*->\s*('[^']+'|\b[a-zA-Z0-9_]+\b)/g, 'PG_JSON_EXTRACT($1, $2)')
      .replace(/\bSTRING_AGG\s*\(\s*([^,]+?)\s*,\s*('[^']*'|"[^"]*")\s*\)/gi, 'GROUP_CONCAT($1, $2)')
      .replace(/\bSTRING_AGG\s*\(\s*([^)]+?)\s*\)/gi, 'GROUP_CONCAT($1)')
      .replace(/\bGROUP_CONCAT\s*\(\s*(.*?)\s+SEPARATOR\s+('[^']*'|"[^"]*")\s*\)/gi, 'GROUP_CONCAT($1, $2)')
      .replace(/\bTRUNCATE\s+(?:TABLE\s+)?([a-zA-Z0-9_.]+?);?$/gi, 'DELETE FROM "$1";')
      .replace(/\bTRUNCATE\s+(?:TABLE\s+)?([a-zA-Z0-9_.]+?)\s*;/gi, 'DELETE FROM "$1";')
      .replace(/CREATE\s+(?:DATABASE|SCHEMA)\s+[a-zA-Z0-9_.]+;?/gi, '')
      .trim();

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
        columns:    r.columns,
        rows:       r.values,
        rowCount:   r.values.length,
      }));

      const firstResult = results[0];
      return {
        ok: true,
        columns: firstResult.columns,
        rows: firstResult.values,
        rowCount: firstResult.values.length,
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
                columns:    r.columns,
                rows:       r.values,
                rowCount:   r.values.length,
              }));

              return {
                ok: true,
                columns: retryResults[0].columns,
                rows: retryResults[0].values,
                rowCount: retryResults[0].values.length,
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
      return {
        name: c.name,
        logicalType: lt,
        sqliteType: SQLITE_DDL[lt],
        source: 'User-defined via wizard',
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

    // ── 4. Register in catalog ─────────────────────────────────────────────────
    this.catalog.set(safeTable, tableSchema, insertedRows, true, dbName);

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
    return true;
  }
}
