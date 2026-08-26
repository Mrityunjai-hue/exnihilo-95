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

// ── Window Functions Parsing & Specification Extraction ───────────────────────

export type WindowFunctionName =
  | 'ROW_NUMBER'
  | 'RANK'
  | 'DENSE_RANK'
  | 'LEAD'
  | 'LAG'
  | 'SUM'
  | 'AVG'
  | 'MIN'
  | 'MAX'
  | 'COUNT';

export type FrameBoundType =
  | 'UNBOUNDED_PRECEDING'
  | 'PRECEDING'
  | 'CURRENT_ROW'
  | 'FOLLOWING'
  | 'UNBOUNDED_FOLLOWING';

export interface FrameBound {
  type: FrameBoundType;
  offset?: number;
}

export interface WindowFrameSpec {
  unit: 'ROWS';
  start: FrameBound;
  end: FrameBound;
}

export interface WindowOrderClause {
  column: string;
  direction: 'ASC' | 'DESC';
}

export interface WindowSpec {
  functionName: WindowFunctionName;
  alias: string;
  partitionBy: string[];
  orderBy: WindowOrderClause[];
  targetColumn?: string;
  args?: any[];
  frame: WindowFrameSpec;
}

function parseFrameBound(boundObj: any): FrameBound {
  if (!boundObj) return { type: 'CURRENT_ROW' };
  const raw = String(boundObj.value || boundObj.type || '').toUpperCase();

  if (raw.includes('UNBOUNDED PRECEDING')) return { type: 'UNBOUNDED_PRECEDING' };
  if (raw.includes('UNBOUNDED FOLLOWING')) return { type: 'UNBOUNDED_FOLLOWING' };
  if (raw.includes('CURRENT ROW')) return { type: 'CURRENT_ROW' };

  const precMatch = raw.match(/(\d+)\s+PRECEDING/i);
  if (precMatch) return { type: 'PRECEDING', offset: parseInt(precMatch[1], 10) };

  const follMatch = raw.match(/(\d+)\s+FOLLOWING/i);
  if (follMatch) return { type: 'FOLLOWING', offset: parseInt(follMatch[1], 10) };

  return { type: 'CURRENT_ROW' };
}

function extractColumnName(argsNode: any): string | undefined {
  if (!argsNode) return undefined;
  if (typeof argsNode === 'string') return argsNode;
  if (typeof argsNode.column === 'string') return argsNode.column;
  if (typeof argsNode.value === 'string') return argsNode.value;

  if (argsNode.column) {
    const colRes = extractColumnName(argsNode.column);
    if (colRes) return colRes;
  }

  if (argsNode.expr) {
    const exprRes = extractColumnName(argsNode.expr);
    if (exprRes) return exprRes;
  }

  if (Array.isArray(argsNode.value)) {
    const valRes = extractColumnName(argsNode.value[0]);
    if (valRes) return valRes;
  }

  if (Array.isArray(argsNode)) {
    const arrRes = extractColumnName(argsNode[0]);
    if (arrRes) return arrRes;
  }

  return undefined;
}


/**
 * Extract ranking, positional, and aggregate window function specifications
 * (OVER clause with PARTITION BY, ORDER BY, and ROWS BETWEEN sliding frames)
 * from a parsed SQL AST.
 */
export function extractWindowSpecs(ast: AST | AST[]): WindowSpec[] {
  const specs: WindowSpec[] = [];

  const walk = (node: any) => {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }

    if ((node.type === 'function' || node.type === 'aggr_func' || node.type === 'window_func') && node.over) {
      let funcName = '';
      if (typeof node.name === 'string') {
        funcName = node.name.toUpperCase();
      } else if (Array.isArray(node.name?.name)) {
        funcName = String(node.name.name[0]?.value || '').toUpperCase();
      } else if (typeof node.name?.value === 'string') {
        funcName = node.name.value.toUpperCase();
      }

      const supportedFuncs: WindowFunctionName[] = [
        'ROW_NUMBER',
        'RANK',
        'DENSE_RANK',
        'LEAD',
        'LAG',
        'SUM',
        'AVG',
        'MIN',
        'MAX',
        'COUNT',
      ];

      if (supportedFuncs.includes(funcName as WindowFunctionName)) {
        const specObj = node.over?.as_window_specification?.window_specification || {};
        const partitionBy: string[] = [];
        if (Array.isArray(specObj.partitionby)) {
          specObj.partitionby.forEach((p: any) => {
            const col = p?.expr?.column || p?.column || p?.expr?.value;
            if (col) partitionBy.push(String(col));
          });
        }

        const orderBy: WindowOrderClause[] = [];
        if (Array.isArray(specObj.orderby)) {
          specObj.orderby.forEach((o: any) => {
            const col = o?.expr?.column || o?.column || o?.expr?.value;
            const dir = String(o?.type || 'ASC').toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
            if (col) orderBy.push({ column: String(col), direction: dir });
          });
        }

        // Target column & positional args
        let targetColumn: string | undefined = undefined;
        let args: any[] | undefined = undefined;

        if (['LEAD', 'LAG'].includes(funcName)) {
          args = [];
          if (Array.isArray(node.args?.value)) {
            node.args.value.forEach((argNode: any, idx: number) => {
              if (idx === 0) {
                targetColumn = extractColumnName(argNode);
                args!.push(targetColumn);
              } else if (argNode?.type === 'number') {
                args!.push(Number(argNode.value));
              } else {
                args!.push(argNode?.value ?? argNode);
              }
            });
          }
          if (args.length < 2) args.push(1); // default offset = 1
          if (args.length < 3) args.push(null); // default fallback = null
        } else if (['SUM', 'AVG', 'MIN', 'MAX', 'COUNT'].includes(funcName)) {
          targetColumn = extractColumnName(node.args);
        }

        // Frame Clause Parsing & Default Rules
        let frame: WindowFrameSpec;
        const frameClause = specObj.window_frame_clause;

        if (frameClause && frameClause.operator === 'BETWEEN' && Array.isArray(frameClause.right?.value)) {
          const bounds = frameClause.right.value;
          frame = {
            unit: 'ROWS',
            start: parseFrameBound(bounds[0]),
            end: parseFrameBound(bounds[1]),
          };
        } else {
          // Default Framing Rules
          if (orderBy.length > 0) {
            // Default with ORDER BY: ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
            frame = {
              unit: 'ROWS',
              start: { type: 'UNBOUNDED_PRECEDING' },
              end: { type: 'CURRENT_ROW' },
            };
          } else {
            // Default without ORDER BY: ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
            frame = {
              unit: 'ROWS',
              start: { type: 'UNBOUNDED_PRECEDING' },
              end: { type: 'UNBOUNDED_FOLLOWING' },
            };
          }
        }

        specs.push({
          functionName: funcName as WindowFunctionName,
          alias: node.as || funcName.toLowerCase(),
          partitionBy,
          orderBy,
          targetColumn: targetColumn ? String(targetColumn) : undefined,
          args,
          frame,
        });
      }
    }

    for (const key of Object.keys(node)) {
      if (typeof node[key] === 'object') {
        walk(node[key]);
      }
    }
  };

  walk(ast);
  return specs;
}

// ── String Aggregation (GROUP_CONCAT / STRING_AGG) AST Extraction ──────────────

export interface StringAggregateSpec {
  functionName: 'GROUP_CONCAT' | 'STRING_AGG';
  alias: string;
  targetColumn: string;
  separator: string;
}

/**
 * Extracts string aggregation function specifications (GROUP_CONCAT, STRING_AGG)
 * from a parsed SQL AST.
 */
export function extractStringAggregates(ast: AST | AST[]): StringAggregateSpec[] {
  const specs: StringAggregateSpec[] = [];

  const walk = (node: any) => {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }

    let funcName = '';
    if (typeof node.name === 'string') {
      funcName = node.name.toUpperCase();
    } else if (Array.isArray(node.name?.name)) {
      funcName = String(node.name.name[0]?.value || '').toUpperCase();
    } else if (typeof node.name?.value === 'string') {
      funcName = node.name.value.toUpperCase();
    }

    if (funcName === 'GROUP_CONCAT' || funcName === 'STRING_AGG') {
      let targetColumn = '';
      let separator = ',';

      // Case A: aggr_func structure (STRING_AGG or MySQL GROUP_CONCAT SEPARATOR)
      if (node.args?.expr) {
        targetColumn = extractColumnName(node.args.expr) || '';
        if (node.args?.separator) {
          const sepNode = node.args.separator;
          const sepVal =
            sepNode.delimiter?.value ??
            sepNode.value?.value ??
            sepNode.value ??
            sepNode.delimiter;
          if (typeof sepVal === 'string') separator = sepVal;
        }
      }
      // Case B: expr_list structure (SQLite GROUP_CONCAT(name, ', '))
      else if (node.args?.type === 'expr_list' && Array.isArray(node.args.value)) {
        const valArr = node.args.value;
        if (valArr.length > 0) {
          targetColumn = extractColumnName(valArr[0]) || '';
        }
        if (valArr.length > 1) {
          const sepArg = valArr[1];
          if (typeof sepArg?.value === 'string') {
            separator = sepArg.value;
          }
        }
      }

      if (targetColumn) {
        specs.push({
          functionName: funcName as 'GROUP_CONCAT' | 'STRING_AGG',
          alias: node.as || funcName.toLowerCase(),
          targetColumn,
          separator,
        });
      }
    }

    for (const key of Object.keys(node)) {
      if (typeof node[key] === 'object') {
        walk(node[key]);
      }
    }
  };

  walk(ast);
  return specs;
}

/**
 * Extracts all JOIN types present in a parsed SQL AST.
 */
export function extractJoinTypes(ast: AST | AST[]): string[] {
  const joins: string[] = [];

  const walk = (node: any) => {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }

    if (typeof node.join === 'string') {
      joins.push(node.join.toUpperCase());
    }

    for (const key of Object.keys(node)) {
      if (typeof node[key] === 'object') {
        walk(node[key]);
      }
    }
  };

  walk(ast);
  return joins;
}

// ── Batch 2: DDL Statements (TRUNCATE TABLE, CREATE DATABASE/SCHEMA, CREATE VIEW) ────

export interface TruncateTableSpec {
  tableName: string;
  dbName?: string;
}

export interface CreateSchemaSpec {
  name: string;
  type: 'DATABASE' | 'SCHEMA';
}

export interface CreateViewSpec {
  viewName: string;
  dbName?: string;
  selectAst: any;
}

/**
 * Extracts TRUNCATE TABLE statement specifications from a parsed AST.
 */
export function extractTruncateStatements(ast: AST | AST[]): TruncateTableSpec[] {
  const specs: TruncateTableSpec[] = [];

  const walk = (node: any) => {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }

    if (node.type === 'truncate') {
      const nameObj = Array.isArray(node.name) ? node.name[0] : node.name;
      const rawTable = nameObj?.table || nameObj?.value || (typeof nameObj === 'string' ? nameObj : '');
      const rawDb = nameObj?.db || undefined;
      if (rawTable) {
        specs.push({ tableName: String(rawTable), dbName: rawDb ? String(rawDb) : undefined });
      }
    }

    for (const key of Object.keys(node)) {
      if (typeof node[key] === 'object') walk(node[key]);
    }
  };

  walk(ast);
  return specs;
}

/**
 * Extracts CREATE DATABASE and CREATE SCHEMA statement specifications from a parsed AST.
 */
export function extractCreateSchemaStatements(ast: AST | AST[]): CreateSchemaSpec[] {
  const specs: CreateSchemaSpec[] = [];

  const walk = (node: any) => {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }

    if (node.type === 'create') {
      const kw = String(node.keyword || '').toLowerCase();
      if (kw === 'database' || kw === 'schema') {
        const schemaObj = node.database || node.schema;
        const nameVal =
          schemaObj?.schema?.[0]?.value ??
          schemaObj?.name ??
          schemaObj?.value ??
          (typeof schemaObj === 'string' ? schemaObj : '');
        if (nameVal) {
          specs.push({
            name: String(nameVal),
            type: kw === 'database' ? 'DATABASE' : 'SCHEMA',
          });
        }
      }
    }

    for (const key of Object.keys(node)) {
      if (typeof node[key] === 'object') walk(node[key]);
    }
  };

  walk(ast);
  return specs;
}

/**
 * Extracts CREATE VIEW statement specifications from a parsed AST.
 */
export function extractCreateViewStatements(ast: AST | AST[]): CreateViewSpec[] {
  const specs: CreateViewSpec[] = [];

  const walk = (node: any) => {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }

    if (node.type === 'create' && String(node.keyword || '').toLowerCase() === 'view') {
      const viewObj = node.view;
      const rawView = viewObj?.view || viewObj?.value || (typeof viewObj === 'string' ? viewObj : '');
      const rawDb = viewObj?.db || undefined;
      const selectAst = node.select;
      if (rawView) {
        specs.push({
          viewName: String(rawView),
          dbName: rawDb ? String(rawDb) : undefined,
          selectAst,
        });
      }
    }

    for (const key of Object.keys(node)) {
      if (typeof node[key] === 'object') walk(node[key]);
    }
  };

  walk(ast);
  return specs;
}

// ── Final Batch: Procedural Routines, Triggers & Recursive CTEs ──────────────

export interface RoutineSpec {
  routineName: string;
  type: 'PROCEDURE' | 'FUNCTION';
  parameters: string[];
  returnType?: string;
  body: string;
  dbName?: string;
}

export interface TriggerSpec {
  triggerName: string;
  targetTable: string;
  timing: 'BEFORE' | 'AFTER' | 'INSTEAD OF';
  event: 'INSERT' | 'UPDATE' | 'DELETE';
  body: string;
  dbName?: string;
}

export interface RecursiveCteSpec {
  isRecursive: boolean;
  cteNames: string[];
}

/**
 * Extracts CREATE PROCEDURE and CREATE FUNCTION specifications from AST & query string.
 */
export function extractRoutineStatements(queryText: string, ast?: AST | AST[]): RoutineSpec[] {
  const specs: RoutineSpec[] = [];

  const walk = (node: any) => {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }

    if (node.type === 'create') {
      const kw = String(node.keyword || '').toLowerCase();
      if (kw === 'procedure' || kw === 'function') {
        const routineName = node.procedure || node.function || node.name || 'unnamed_routine';
        specs.push({
          routineName: String(routineName),
          type: kw === 'procedure' ? 'PROCEDURE' : 'FUNCTION',
          parameters: Array.isArray(node.parameters) ? node.parameters.map((p: any) => String(p.name || p)) : [],
          body: node.body ? String(node.body) : queryText,
        });
      }
    }

    for (const key of Object.keys(node)) {
      if (typeof node[key] === 'object') walk(node[key]);
    }
  };

  if (ast) walk(ast);

  const procRegex = /CREATE\s+(PROCEDURE|FUNCTION)\s+([a-zA-Z0-9_.]+)\s*\((.*?)\)(?:\s+RETURNS\s+([a-zA-Z0-9_]+))?\s+([\s\S]+)/gi;
  let match: RegExpExecArray | null;
  while ((match = procRegex.exec(queryText)) !== null) {
    const typeStr = match[1].toUpperCase() as 'PROCEDURE' | 'FUNCTION';
    const fullName = match[2];
    const paramsRaw = match[3];
    const returnType = match[4];
    const body = match[5];

    const params = paramsRaw
      .split(',')
      .map(p => p.trim())
      .filter(Boolean);

    if (!specs.some(s => s.routineName.toLowerCase() === fullName.toLowerCase())) {
      specs.push({
        routineName: fullName,
        type: typeStr,
        parameters: params,
        returnType,
        body,
      });
    }
  }

  return specs;
}

/**
 * Extracts CREATE TRIGGER specifications from AST & query string.
 */
export function extractTriggerStatements(queryText: string, ast?: AST | AST[]): TriggerSpec[] {
  const specs: TriggerSpec[] = [];

  const walk = (node: any) => {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }

    if (node.type === 'create' && String(node.keyword || '').toLowerCase() === 'trigger') {
      const triggerName = node.trigger?.table || node.trigger?.value || node.trigger || 'unnamed_trigger';
      const targetTable = node.table?.table || node.table?.value || node.table || '';
      const timing = String(node.time || 'AFTER').toUpperCase() as 'BEFORE' | 'AFTER' | 'INSTEAD OF';
      const event = String(node.events?.[0]?.keyword || 'INSERT').toUpperCase() as 'INSERT' | 'UPDATE' | 'DELETE';

      if (targetTable) {
        specs.push({
          triggerName: String(triggerName),
          targetTable: String(targetTable),
          timing,
          event,
          body: queryText,
        });
      }
    }

    for (const key of Object.keys(node)) {
      if (typeof node[key] === 'object') walk(node[key]);
    }
  };

  if (ast) walk(ast);

  const triggerRegex = /CREATE\s+TRIGGER\s+([a-zA-Z0-9_.]+)\s+(BEFORE|AFTER|INSTEAD\s+OF)\s+(INSERT|UPDATE|DELETE)\s+ON\s+([a-zA-Z0-9_.]+)\s+([\s\S]+)/gi;
  let match: RegExpExecArray | null;
  while ((match = triggerRegex.exec(queryText)) !== null) {
    const triggerName = match[1];
    const timing = match[2].toUpperCase().replace(/\s+/, ' ') as 'BEFORE' | 'AFTER' | 'INSTEAD OF';
    const event = match[3].toUpperCase() as 'INSERT' | 'UPDATE' | 'DELETE';
    const targetTable = match[4];
    const body = match[5];

    if (!specs.some(s => s.triggerName.toLowerCase() === triggerName.toLowerCase())) {
      specs.push({
        triggerName,
        targetTable,
        timing,
        event,
        body,
      });
    }
  }

  return specs;
}

/**
 * Extracts CTE names and RECURSIVE status from WITH / WITH RECURSIVE clauses.
 */
export function extractRecursiveCtes(queryText: string, ast?: AST | AST[]): RecursiveCteSpec {
  const cteNames: string[] = [];
  let isRecursive = false;

  const walk = (node: any) => {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }

    if (Array.isArray(node.with)) {
      node.with.forEach((cte: any) => {
        if (cte.recursive) isRecursive = true;
        const nameVal = cte.name?.value || cte.name || (typeof cte === 'string' ? cte : '');
        if (nameVal) cteNames.push(String(nameVal).toLowerCase());
      });
    }

    for (const key of Object.keys(node)) {
      if (typeof node[key] === 'object') walk(node[key]);
    }
  };

  if (ast) walk(ast);

  if (/WITH\s+RECURSIVE\b/i.test(queryText)) {
    isRecursive = true;
  }

  const cteRegex = /WITH\s+(?:RECURSIVE\s+)?([a-zA-Z0-9_]+)\s*(?:\(.*?\))?\s+AS/gi;
  let match: RegExpExecArray | null;
  while ((match = cteRegex.exec(queryText)) !== null) {
    const cteName = match[1].toLowerCase();
    if (!cteNames.includes(cteName)) cteNames.push(cteName);
  }

  return { isRecursive, cteNames: Array.from(new Set(cteNames)) };
}






