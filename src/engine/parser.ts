/**
 * parser.ts — Phase 1: Dialect-Aware Parsing
 *
 * Wraps node-sql-parser v5.4.0 to provide:
 *   parse(queryText, dialect) → AST | ParseError
 *
 * Verified dialect strings (empirically confirmed in Phase 1 probe):
 *   'MySQL', 'PostgreSQL', 'SQLite', 'TransactSQL'
 *   (node-sql-parser lowercases internally, so these are canonical but
 *    the library is case-insensitive for the database option)
 *
 * AST key facts (empirically observed in Phase 1 AST probe):
 *  - SELECT: from[], where, groupby, having, columns, with[], _next (UNION)
 *  - JOIN entries: inside from[], items with a `join` property
 *  - CTEs: with[].stmt.ast (nested full AST)
 *  - Derived tables: from[].expr.ast (nested full AST, no .table on the item)
 *  - INSERT: .table (not .from)
 *  - UPDATE: .table
 *  - DELETE: .table + optionally .from
 */

import { Parser, AST, Option } from 'node-sql-parser';

// ── Supported dialects ────────────────────────────────────────────────────────

export type Dialect = 'MySQL' | 'PostgreSQL' | 'SQLite' | 'TransactSQL' | 'SSMS';

/**
 * SSMS (SQL Server Management Studio) is the user-facing name for
 * Microsoft's T-SQL dialect. node-sql-parser does not accept 'SSMS'
 * directly (empirically confirmed: 'SSMS is not supported currently').
 * It is therefore an alias that maps to 'TransactSQL' internally.
 */

export const SUPPORTED_DIALECTS: Dialect[] = [
  'MySQL',
  'PostgreSQL',
  'SQLite',
  'TransactSQL',
  'SSMS',
];

// Mapping from our canonical names to the exact strings node-sql-parser accepts.
// Verified empirically: parser lowercases internally, but these are the canonical
// forms we use throughout the codebase.
const DIALECT_MAP: Record<Dialect, string> = {
  MySQL:       'MySQL',
  PostgreSQL:  'PostgreSQL',
  SQLite:      'SQLite',
  TransactSQL: 'TransactSQL',
  SSMS:        'TransactSQL', // alias — 'SSMS' is rejected by node-sql-parser directly
};

// ── Result types ──────────────────────────────────────────────────────────────

export interface ParseSuccess {
  ok: true;
  ast: AST | AST[];
  /** Flat list of referenced tables in `authority::db::table` format */
  tableList: string[];
  /** Flat list of referenced columns */
  columnList: string[];
}

export interface ParseError {
  ok: false;
  message: string;
  /** The raw error from node-sql-parser */
  raw: Error;
}

export type ParseResult = ParseSuccess | ParseError;

// ── Parser singleton ──────────────────────────────────────────────────────────

const _parser = new Parser();

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * Parse a SQL query string in the given dialect.
 *
 * Returns a ParseSuccess with the AST on success, or a ParseError on any
 * syntax/grammar failure. Never throws — all exceptions are caught and
 * returned as ParseError.
 *
 * Missing tables/columns are NOT an error at this layer — they are handled
 * by the Schema Inference Engine (Phase 2+).
 */
export function parse(queryText: string, dialect: Dialect): ParseResult {
  const dbOption = DIALECT_MAP[dialect];
  const opt: Option = { database: dbOption };

  try {
    const parsed = _parser.parse(queryText.trim(), opt);
    return {
      ok: true,
      ast: parsed.ast,
      tableList: parsed.tableList,
      columnList: parsed.columnList,
    };
  } catch (err) {
    const e = err as Error;
    return {
      ok: false,
      message: e.message,
      raw: e,
    };
  }
}

/**
 * Convenience: returns the raw AST array/object, or throws on parse error.
 * Useful internally when the caller already knows the SQL is valid.
 */
export function astify(queryText: string, dialect: Dialect): AST | AST[] {
  const result = parse(queryText, dialect);
  if (!result.ok) throw result.raw;
  return result.ast;
}

/**
 * Extract all function names called in an AST for verification & testing.
 */
export function extractFunctionNames(ast: AST | AST[]): string[] {
  const names: string[] = [];
  const walk = (node: any) => {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    if (node.type === 'function' && node.name) {
      if (typeof node.name === 'string') {
        names.push(node.name.toUpperCase());
      } else if (Array.isArray(node.name?.name)) {
        node.name.name.forEach((n: any) => {
          if (n?.value) names.push(String(n.value).toUpperCase());
        });
      }
    }
    for (const key of Object.keys(node)) {
      if (key !== 'over' && typeof node[key] === 'object') {
        walk(node[key]);
      }
    }
  };
  walk(ast);
  return Array.from(new Set(names));
}

