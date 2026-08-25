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
import { parse, Dialect } from './parser';
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
      return {
        ok: false,
        errorType: 'SYNTAX_ERROR',
        message: parseResult.message,
        executionTimeMs: performance.now() - startTime,
      };
    }

    // ── 2. Identify Tables & Cache State ──────────────────────────────────────
    const allReferencedTables = parseResult.tableList.map(t => {
      // Table string format: "select::null::customers" -> "customers"
      const parts = t.split('::');
      return (parts[parts.length - 1] || '').toLowerCase().trim();
    }).filter(t => Boolean(t) && t !== '(.*)');

    const uniqueTables = Array.from(new Set(allReferencedTables));
    const missingTables: string[] = [];
    const reusedTables:  string[] = [];

    for (const tbl of uniqueTables) {
      if (this.catalog.has(tbl) || this.hasTableInSqlite(tbl)) {
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
    try {
      const executableQuery = trimmedQuery
        .replace(/(\b[a-zA-Z0-9_.]+\b)\s*->>\s*('[^']+'|\b[a-zA-Z0-9_]+\b)/g, 'PG_JSON_EXTRACT_TEXT($1, $2)')
        .replace(/(\b[a-zA-Z0-9_.]+\b)\s*->\s*('[^']+'|\b[a-zA-Z0-9_]+\b)/g, 'PG_JSON_EXTRACT($1, $2)');

      const results = this.db.exec(executableQuery);
      const executionTimeMs = performance.now() - startTime;


      if (results.length === 0) {
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
              const retryResults = this.db.exec(trimmedQuery);
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
}
