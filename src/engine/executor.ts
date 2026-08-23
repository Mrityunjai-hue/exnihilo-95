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

// ── SQLExecutor Class ─────────────────────────────────────────────────────────

export class SQLExecutor {
  private SQL:      SqlJsStatic | null = null;
  private db:       Database | null    = null;
  private catalog:  SessionCatalog;
  private initPromise: Promise<void> | null = null;

  constructor(catalog: SessionCatalog = globalCatalog) {
    this.catalog = catalog;
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
      } else {
        this.db = null;
      }
    }
    this.catalog.reset();
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
      if (this.catalog.has(tbl)) {
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

    // ── 4. Execute Query with Retry-Once Safety Net ───────────────────────────
    try {
      const results = this.db.exec(trimmedQuery);
      const executionTimeMs = performance.now() - startTime;

      if (results.length === 0) {
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
