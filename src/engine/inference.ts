/**
 * inference.ts — Phase 2: Schema Inference Engine
 *
 * Implements spec Sections 3.1 and 3.2 completely:
 *  - Full AST reference-site coverage (FROM, all JOIN types, self-joins,
 *    derived tables, CTEs, correlated subqueries, UNION branches,
 *    INSERT/UPDATE/DELETE targets)
 *  - Type inference ruleset with exact precedence order
 *  - SQLite storage-affinity DDL mapping
 *  - Identifier case normalization (all lowercase)
 *  - Bare-reference default schema
 *  - Conflict resolution: first-wins by priority, conflicts logged to console
 *
 * AST shapes verified empirically across MySQL, PostgreSQL, SQLite, TransactSQL, SSMS:
 *  - aggr_func: { type:'aggr_func', name:'AVG', args:{ expr: column_ref } }
 *  - groupby:   { columns: [column_ref...], modifiers: [...] }
 *  - cast:      { type:'cast', expr: column_ref, target:[{ dataType:'INT' }] }
 *  - SELECT *:  columns = [{ expr:{ type:'column_ref', column:'*' } }]
 *  - CTE name:  with[i].name.value / with[i].name
 *  - UPDATE set: set[i].column, set[i].value
 *  - Dialect polymorphism: PostgreSQL object column_ref.column vs string
 */

import { parse, Dialect } from './parser';
import { resolveDomainSchema, UNIVERSAL_FALLBACK_SCHEMA } from './domain_dictionary';
import { matchColumnToken } from './token_dictionary';

// ── Logical types (dialect-agnostic layer) ────────────────────────────────────

export type LogicalType =
  | 'INTEGER'
  | 'VARCHAR'
  | 'NUMERIC'
  | 'DATE'
  | 'TIMESTAMP'
  | 'BOOLEAN';

// SQLite storage-affinity DDL translation (spec 3.2 table)
export const SQLITE_DDL: Record<LogicalType, string> = {
  INTEGER:   'INTEGER',
  VARCHAR:   'TEXT',
  NUMERIC:   'REAL',
  DATE:      'TEXT',       // ISO-8601 string
  TIMESTAMP: 'TEXT',       // ISO-8601 string
  BOOLEAN:   'INTEGER',    // 0/1
};

// ── Type inference priority levels (spec 3.2, highest to lowest) ─────────────
const P_FALLBACK  = 1;   // VARCHAR(255) fallback
const P_NAME_HINT = 2;   // column-name heuristic (id/_id, email, etc.)
const P_GROUP_BY  = 3;   // GROUP BY / categorical inference → VARCHAR
const P_FUNCTION  = 4;   // LIKE/ILIKE, SUM/AVG, date functions, arithmetic
const P_LITERAL   = 5;   // comparison to typed literal (number/string/date/bool)
const P_CAST      = 6;   // explicit CAST / :: — always wins

// ── Default starter schema (zero column signal, spec 3.1) ────────────────────
export const DEFAULT_COLUMNS: Array<{ name: string; logicalType: LogicalType }> = [
  { name: 'id',         logicalType: 'INTEGER' },
  { name: 'name',       logicalType: 'VARCHAR' },
  { name: 'value',      logicalType: 'NUMERIC' },
  { name: 'created_at', logicalType: 'DATE'    },
];

// ── Public output types ───────────────────────────────────────────────────────

export interface ColumnDef {
  name:              string;
  logicalType:       LogicalType;
  sqliteType:        string;   // translated via SQLITE_DDL
  source:            string;   // which rule row determined this type (for traceability)
  predicateLiterals?: any[];   // literal values captured from WHERE/HAVING comparison clauses
  enumValues?:       string[]; // permitted values for ENUM / SET data types
}

export interface TableSchema {
  tableName: string;     // normalized lowercase
  columns:   ColumnDef[];
  isDefault: boolean;    // true if the zero-signal default schema was applied
}

export type InferredSchemaMap = Map<string, TableSchema>;

// ── Internal signal types ─────────────────────────────────────────────────────

interface TypeSignal {
  type:     LogicalType;
  priority: number;
  source:   string;
}

/** Keyed by "tableName\0columnName" (both lowercased) */
type SignalMap   = Map<string, TypeSignal>;
/** Tracks every column that was referenced anywhere in the query */
type ColRefMap   = Map<string, true>;
/** Keyed by "tableName\0columnName", tracks literal comparison values */
type LiteralsMap = Map<string, any[]>;

function addLiteral(literalsMap: LiteralsMap, table: string | null, col: string | null, value: any): void {
  if (!table || !col || value === undefined || value === null) return;
  const key = signalKey(table, col);
  const list = literalsMap.get(key) ?? [];
  if (!list.includes(value)) {
    list.push(value);
    literalsMap.set(key, list);
  }
}

// ── AST Identifier Extraction Helpers ─────────────────────────────────────────

export function getColName(col: any): string {
  if (!col) return '';
  if (typeof col === 'string') return col.toLowerCase();
  if (typeof col === 'object') {
    if (col.expr?.value) return String(col.expr.value).toLowerCase();
    if (col.value)       return String(col.value).toLowerCase();
    if (col.name)        return String(col.name).toLowerCase();
    if (col.column)      return getColName(col.column);
  }
  return String(col).toLowerCase();
}

export function getTableName(tbl: any): string | null {
  if (!tbl) return null;
  if (typeof tbl === 'string') return tbl.toLowerCase();
  if (typeof tbl === 'object') {
    if (tbl.expr?.value) return String(tbl.expr.value).toLowerCase();
    if (tbl.value)       return String(tbl.value).toLowerCase();
    if (tbl.table)       return getTableName(tbl.table);
  }
  return String(tbl).toLowerCase();
}

// ── Aggregate / date function sets (empirically verified prefix set) ──────────

const NUMERIC_AGGR_FUNCS = new Set(['SUM', 'AVG', 'MIN', 'MAX', 'STDEV', 'VARIANCE']);
const DATE_FUNCS = new Set([
  'NOW', 'GETDATE', 'CURDATE', 'CURRENT_DATE', 'CURRENT_TIMESTAMP',
  'DATETIME', 'DATE', 'TIMESTAMP', 'DATEADD', 'DATEDIFF', 'DATE_FORMAT',
  'YEAR', 'MONTH', 'DAY', 'EXTRACT', 'TO_DATE', 'TO_TIMESTAMP',
  'DATE_TRUNC', 'TIMESTAMPDIFF', 'TIMEDIFF',
]);
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}/;

// ── Column-name heuristic (spec 3.2 row 9 and "cosmetic generation hint") ─────
export function nameHeuristicType(colName: string): { type: LogicalType; source: string } | null {
  const tokenMatch = matchColumnToken(colName);
  if (tokenMatch) {
    return { type: tokenMatch.logicalType, source: tokenMatch.source };
  }
  return null;
}

// ── Signal accumulator ────────────────────────────────────────────────────────

function signalKey(table: string, col: string): string {
  return `${table}\0${col}`;
}

function addSignal(
  signals:  SignalMap,
  table:    string | null,
  col:      string | null,
  type:     LogicalType,
  priority: number,
  source:   string,
): void {
  if (!table || !col || col === '*') return;
  const key = signalKey(table, col);
  const existing = signals.get(key);
  if (!existing || priority > existing.priority) {
    if (existing && priority > existing.priority && existing.type !== type) {
      console.debug(
        `[inference] type conflict for ${table}.${col}: ` +
        `overwriting ${existing.type}(p=${existing.priority}) with ${type}(p=${priority})`
      );
    }
    signals.set(key, { type, priority, source });
  }
}

function addColRef(colRefs: ColRefMap, table: string | null, col: string | null): void {
  if (!table || !col || col === '*') return;
  colRefs.set(signalKey(table, col), true);
}

// ── Table name resolution ─────────────────────────────────────────────────────

function resolveAlias(alias: string | null, aliasMap: Map<string, string>): string | null {
  if (!alias) return null;
  const lower = alias.toLowerCase();
  return aliasMap.get(lower) ?? lower;
}

function normTable(name: string): string {
  return getTableName(name) || '';
}

// ── Expression walker ─────────────────────────────────────────────────────────

function walkExpr(
  expr:        any,
  aliasMap:    Map<string, string>,
  scopeTables: string[],
  signals:     SignalMap,
  colRefs:     ColRefMap,
  tableSet:    Set<string> = new Set(),
  cteNames:    Set<string> = new Set(),
  literalsMap: LiteralsMap = new Map(),
): void {
  if (!expr || typeof expr !== 'object') return;

  switch (expr.type) {
    // ── Binary expression ────────────────────────────────────────────────────
    case 'binary_expr': {
      const op  = (expr.operator ?? '').toUpperCase();
      const lhs = expr.left;
      const rhs = expr.right;

      const lhsIsCol = lhs?.type === 'column_ref';
      const rhsIsCol = rhs?.type === 'column_ref';

      // Helper: resolve a column_ref to (table, col)
      const resolveCol = (node: any): [string | null, string | null] => {
        const col = getColName(node.column);
        if (!col || col === '*') return [null, null];
        const rawTable = getTableName(node.table);
        const tbl = rawTable
          ? resolveAlias(rawTable, aliasMap)
          : (scopeTables.length === 1 ? scopeTables[0] : null);
        return [tbl, col];
      };

      // LIKE / ILIKE → VARCHAR (function-level, spec 3.2 row 4)
      if (op === 'LIKE' || op === 'ILIKE') {
        if (lhsIsCol) {
          const [t, c] = resolveCol(lhs);
          addColRef(colRefs, t, c);
          addSignal(signals, t, c, 'VARCHAR', P_FUNCTION,
            `spec 3.2 row 4: ${op} operator → VARCHAR`);
        }
        walkExpr(rhs, aliasMap, scopeTables, signals, colRefs, tableSet, cteNames);
        return;
      }

      // IS NULL / IS NOT NULL → no type signal (spec 3.2 row 10)
      if (op === 'IS NULL' || op === 'IS NOT NULL' || op === 'IS' || op === 'IS NOT') {
        if (lhsIsCol) {
          const [t, c] = resolveCol(lhs);
          addColRef(colRefs, t, c);
        }
        return;
      }

      // Arithmetic operators: both sides context → NUMERIC (spec 3.2 row 6)
      if (['+', '-', '*', '/'].includes(expr.operator)) {
        if (lhsIsCol) {
          const [t, c] = resolveCol(lhs);
          addColRef(colRefs, t, c);
          addSignal(signals, t, c, 'NUMERIC', P_FUNCTION,
            `spec 3.2 row 6: arithmetic '${expr.operator}' context → NUMERIC`);
        }
        if (rhsIsCol) {
          const [t, c] = resolveCol(rhs);
          addColRef(colRefs, t, c);
          addSignal(signals, t, c, 'NUMERIC', P_FUNCTION,
            `spec 3.2 row 6: arithmetic '${expr.operator}' context → NUMERIC`);
        }
        walkExpr(lhs, aliasMap, scopeTables, signals, colRefs, tableSet, cteNames);
        walkExpr(rhs, aliasMap, scopeTables, signals, colRefs, tableSet, cteNames);
        return;
      }

      // Comparison with literal
      if (lhsIsCol && !rhsIsCol) {
        const [t, c] = resolveCol(lhs);
        addColRef(colRefs, t, c);
        const sig = literalSignal(rhs);
        if (sig) addSignal(signals, t, c, sig.type, sig.priority, sig.source);
        if (t && c && (rhs?.type === 'single_quote_string' || rhs?.type === 'double_quote_string' || rhs?.type === 'number')) {
          addLiteral(literalsMap, t, c, rhs.value);
        }
      }
      if (rhsIsCol && !lhsIsCol) {
        const [t, c] = resolveCol(rhs);
        addColRef(colRefs, t, c);
        const sig = literalSignal(lhs);
        if (sig) addSignal(signals, t, c, sig.type, sig.priority, sig.source);
        if (t && c && (lhs?.type === 'single_quote_string' || lhs?.type === 'double_quote_string' || lhs?.type === 'number')) {
          addLiteral(literalsMap, t, c, lhs.value);
        }
      }
      // Both column refs (JOIN ON) — just track existence
      if (lhsIsCol && rhsIsCol) {
        const [t1, c1] = resolveCol(lhs);
        const [t2, c2] = resolveCol(rhs);
        addColRef(colRefs, t1, c1);
        addColRef(colRefs, t2, c2);
      }

      // Recurse
      walkExpr(lhs, aliasMap, scopeTables, signals, colRefs, tableSet, cteNames);
      walkExpr(rhs, aliasMap, scopeTables, signals, colRefs, tableSet, cteNames);
      break;
    }

    // ── Aggregate function (type: 'aggr_func', name: string, e.g. "AVG") ────
    case 'aggr_func': {
      const funcName = (expr.name ?? '').toUpperCase();
      const argExpr  = expr.args?.expr;

      if (NUMERIC_AGGR_FUNCS.has(funcName) && argExpr?.type === 'column_ref') {
        const col = getColName(argExpr.column);
        const rawTable = getTableName(argExpr.table);
        const tbl = rawTable
          ? resolveAlias(rawTable, aliasMap)
          : (scopeTables.length === 1 ? scopeTables[0] : null);
        addColRef(colRefs, tbl, col);
        addSignal(signals, tbl, col, 'NUMERIC', P_FUNCTION,
          `spec 3.2 row 6: ${funcName}() aggregate → NUMERIC`);
      } else if (argExpr) {
        walkExpr(argExpr, aliasMap, scopeTables, signals, colRefs, tableSet, cteNames);
      }
      break;
    }

    // ── Regular function (type: 'function', name: { name: [{value}] }) ──────
    case 'function': {
      let funcName = '';
      if (typeof expr.name === 'string') {
        funcName = expr.name.toUpperCase();
      } else if (Array.isArray(expr.name?.name)) {
        funcName = (expr.name.name[0]?.value ?? '').toUpperCase();
      }

      const args: any[] = expr.args?.value ?? [];

      if (DATE_FUNCS.has(funcName)) {
        for (const arg of args) {
          if (arg?.type === 'column_ref') {
            const col = getColName(arg.column);
            const rawTable = getTableName(arg.table);
            const tbl = rawTable
              ? resolveAlias(rawTable, aliasMap)
              : (scopeTables.length === 1 ? scopeTables[0] : null);
            addColRef(colRefs, tbl, col);
            addSignal(signals, tbl, col, 'DATE', P_FUNCTION,
              `spec 3.2 row 7: ${funcName}() date function → DATE`);
          }
        }
      }

      for (const arg of args) {
        walkExpr(arg, aliasMap, scopeTables, signals, colRefs, tableSet, cteNames);
      }
      break;
    }

    // ── CAST expression ──────────────────────────────────────────────────────
    case 'cast': {
      const inner = expr.expr;
      const targetType = normalizeCastType(expr.target?.[0]?.dataType ?? '');

      if (inner?.type === 'column_ref' && targetType) {
        const col = getColName(inner.column);
        const rawTable = getTableName(inner.table);
        const tbl = rawTable
          ? resolveAlias(rawTable, aliasMap)
          : (scopeTables.length === 1 ? scopeTables[0] : null);
        addColRef(colRefs, tbl, col);
        addSignal(signals, tbl, col, targetType, P_CAST,
          `spec 3.2 row 1: CAST(${col} AS ${expr.target?.[0]?.dataType}) → ${targetType}`);
      } else if (inner) {
        walkExpr(inner, aliasMap, scopeTables, signals, colRefs, tableSet, cteNames);
      }
      break;
    }

    // ── PostgreSQL :: cast (symbol: '::') ────────────────────────────────────
    case 'expr': {
      if (expr.symbol === '::') {
        const inner = expr.expr;
        const targetType = normalizeCastType(expr.target?.[0]?.dataType ?? '');
        if (inner?.type === 'column_ref' && targetType) {
          const col = getColName(inner.column);
          const rawTable = getTableName(inner.table);
          const tbl = rawTable
            ? resolveAlias(rawTable, aliasMap)
            : (scopeTables.length === 1 ? scopeTables[0] : null);
          addColRef(colRefs, tbl, col);
          addSignal(signals, tbl, col, targetType, P_CAST,
            `spec 3.2 row 1: ${col}::${expr.target?.[0]?.dataType} → ${targetType}`);
        } else if (inner) {
          walkExpr(inner, aliasMap, scopeTables, signals, colRefs, tableSet, cteNames);
        }
        break;
      }
      for (const v of Object.values(expr)) {
        if (v && typeof v === 'object') {
          Array.isArray(v)
            ? v.forEach(item => walkExpr(item, aliasMap, scopeTables, signals, colRefs, tableSet, cteNames))
            : walkExpr(v, aliasMap, scopeTables, signals, colRefs, tableSet, cteNames);
        }
      }
      break;
    }

    // ── Standalone column_ref (in SELECT list, etc.) ─────────────────────────
    case 'column_ref': {
      const col = getColName(expr.column);
      if (!col || col === '*') break;
      const rawTable = getTableName(expr.table);
      const tbl = rawTable
        ? resolveAlias(rawTable, aliasMap)
        : (scopeTables.length === 1 ? scopeTables[0] : null);
      addColRef(colRefs, tbl, col);
      break;
    }

    // ── Subquery (correlated subquery in WHERE/SELECT/HAVING) ────────────────
    case 'select': {
      walkStatement(expr, signals, colRefs, tableSet, cteNames, aliasMap);
      break;
    }

    // ── Expression list (IN (...), VALUES, subquery list) ────────────────────
    case 'expr_list': {
      const items = Array.isArray(expr.value) ? expr.value : [];
      for (const item of items) {
        if (item?.ast) {
          walkStatement(item.ast, signals, colRefs, tableSet, cteNames, aliasMap);
        } else if (item) {
          walkExpr(item, aliasMap, scopeTables, signals, colRefs, tableSet, cteNames);
        }
      }
      break;
    }

    // ── Unary expression ─────────────────────────────────────────────────────
    case 'unary_expr': {
      walkExpr(expr.expr, aliasMap, scopeTables, signals, colRefs, tableSet, cteNames);
      break;
    }

    // ── Default: recurse into any child objects ───────────────────────────────
    default: {
      if (expr.ast) {
        walkStatement(expr.ast, signals, colRefs, tableSet, cteNames, aliasMap);
      }
      for (const v of Object.values(expr)) {
        if (v && typeof v === 'object') {
          Array.isArray(v)
            ? v.forEach(item => walkExpr(item, aliasMap, scopeTables, signals, colRefs, tableSet, cteNames))
            : walkExpr(v, aliasMap, scopeTables, signals, colRefs, tableSet, cteNames);
        }
      }
    }
  }
}

// ── Literal type inference (spec 3.2 rows 2–8) ───────────────────────────────

function literalSignal(node: any): { type: LogicalType; priority: number; source: string } | null {
  if (!node) return null;
  switch (node.type) {
    case 'number':
      return { type: 'NUMERIC', priority: P_LITERAL,
        source: `spec 3.2 row 2: numeric literal comparison → NUMERIC` };
    case 'single_quote_string':
    case 'double_quote_string': {
      const val: string = node.value ?? '';
      if (DATE_PATTERN.test(val)) {
        return { type: 'DATE', priority: P_LITERAL,
          source: `spec 3.2 row 7: date-shaped literal '${val}' → DATE` };
      }
      return { type: 'VARCHAR', priority: P_LITERAL,
        source: `spec 3.2 row 3: string literal comparison → VARCHAR` };
    }
    case 'bool':
      return { type: 'BOOLEAN', priority: P_LITERAL,
        source: `spec 3.2 row 8: boolean comparison → BOOLEAN` };
    default:
      return null;
  }
}

// ── CAST target type normalization ────────────────────────────────────────────

function normalizeCastType(sqlType: string): LogicalType | null {
  const t = sqlType.toUpperCase();
  if (/^INT|BIGINT|SMALLINT|TINYINT/.test(t)) return 'INTEGER';
  if (/FLOAT|DOUBLE|DECIMAL|NUMERIC|REAL|NUMBER/.test(t)) return 'NUMERIC';
  if (/CHAR|TEXT|STRING|VARCHAR/.test(t)) return 'VARCHAR';
  if (/BOOL/.test(t)) return 'BOOLEAN';
  if (/TIMESTAMP/.test(t)) return 'TIMESTAMP';
  if (/DATE/.test(t)) return 'DATE';
  return null;
}

// ── FROM clause walker ────────────────────────────────────────────────────────

function walkFrom(
  fromList:   any[],
  tableSet:   Set<string>,
  cteNames:   Set<string>,
  aliasMap:   Map<string, string>,
  signals:    SignalMap,
  colRefs:    ColRefMap,
): string[] {
  const scope: string[] = [];

  for (const item of fromList) {
    if (!item) continue;

    if (item.table) {
      const tableName = normTable(item.table);
      const alias     = item.as ? normTable(item.as) : tableName;

      if (!cteNames.has(tableName)) {
        tableSet.add(tableName);
        scope.push(tableName);
      }
      aliasMap.set(alias, tableName);
      if (alias !== tableName) aliasMap.set(tableName, tableName);

      if (item.on) {
        walkExpr(item.on, aliasMap, scope, signals, colRefs, tableSet, cteNames);
      }
    } else if (item.expr) {
      const subAst = item.expr.ast ?? item.expr;
      if (subAst) {
        walkStatement(subAst, signals, colRefs, tableSet, cteNames, aliasMap);
        if (Array.isArray(subAst.from)) {
          for (const f of subAst.from) {
            if (f && f.table) {
              const subTbl = normTable(f.table);
              scope.push(subTbl);
              if (item.as) {
                const alias = normTable(item.as);
                aliasMap.set(alias, subTbl);
              }
            }
          }
        }
      }
    }
  }

  return scope;
}

// ── Statement walker ──────────────────────────────────────────────────────────

function walkStatement(
  ast:         any,
  signals:     SignalMap,
  colRefs:     ColRefMap,
  tableSet:    Set<string>,
  cteNames:    Set<string>,
  aliasMap:    Map<string, string>,
  literalsMap: LiteralsMap = new Map(),
): void {
  if (!ast) return;
  switch (ast.type) {
    case 'select': walkSelect(ast, signals, colRefs, tableSet, cteNames, aliasMap, literalsMap); break;
    case 'insert': walkInsert(ast, signals, colRefs, tableSet); break;
    case 'update': walkUpdate(ast, signals, colRefs, tableSet); break;
    case 'delete': walkDelete(ast, signals, colRefs, tableSet, cteNames, aliasMap); break;
    default: break;
  }
}

// ── SELECT walker ─────────────────────────────────────────────────────────────

function walkSelect(
  ast:         any,
  signals:     SignalMap,
  colRefs:     ColRefMap,
  tableSet:    Set<string>,
  cteNames:    Set<string>,
  aliasMap:    Map<string, string>,
  literalsMap: LiteralsMap = new Map(),
): void {
  // 1. Process CTEs (spec 3.1 "CTEs")
  if (Array.isArray(ast.with)) {
    for (const cte of ast.with) {
      const cteName = normTable(cte.name?.value ?? cte.name?.name ?? cte.name ?? '');
      if (cteName) cteNames.add(cteName);

      const cteBody = cte.stmt?.ast ?? cte.stmt;
      if (cteBody) {
        walkStatement(cteBody, signals, colRefs, tableSet, cteNames, new Map<string, string>(), literalsMap);
      }
    }
  }

  // 2. Process FROM clause (tables, JOINs, derived tables)
  const scope = Array.isArray(ast.from)
    ? walkFrom(ast.from, tableSet, cteNames, aliasMap, signals, colRefs)
    : [];

  // 3. Walk WHERE
  if (ast.where) {
    walkExpr(ast.where, aliasMap, scope, signals, colRefs, tableSet, cteNames, literalsMap);
  }

  // 4. Walk SELECT column list
  if (Array.isArray(ast.columns)) {
    for (const col of ast.columns) {
      if (col?.expr) {
        walkExpr(col.expr, aliasMap, scope, signals, colRefs, tableSet, cteNames, literalsMap);
      }
    }
  }

  // 5. Walk GROUP BY
  const groupbyCols = ast.groupby?.columns ?? (Array.isArray(ast.groupby) ? ast.groupby : []);
  for (const col of groupbyCols) {
    if (col?.type === 'column_ref') {
      const c = getColName(col.column);
      const rawTable = getTableName(col.table);
      const t = rawTable
        ? resolveAlias(rawTable, aliasMap)
        : (scope.length === 1 ? scope[0] : null);
      addColRef(colRefs, t, c);
      addSignal(signals, t, c, 'VARCHAR', P_GROUP_BY,
        `spec 3.2 row 9: column in GROUP BY alongside aggregates → VARCHAR (categorical)`);
    }
  }

  // 6. Walk HAVING
  if (ast.having) {
    walkExpr(ast.having, aliasMap, scope, signals, colRefs, tableSet, cteNames);
  }

  // 7. Walk UNION / INTERSECT / EXCEPT via _next chain (spec 3.1)
  if (ast._next) {
    walkStatement(ast._next, signals, colRefs, tableSet, cteNames, aliasMap);
  }
}

// ── INSERT walker ─────────────────────────────────────────────────────────────

function walkInsert(
  ast:      any,
  signals:  SignalMap,
  colRefs:  ColRefMap,
  tableSet: Set<string>,
): void {
  const tableEntry = Array.isArray(ast.table) ? ast.table[0] : ast.table;
  if (!tableEntry?.table) return;

  const tableName = normTable(tableEntry.table);
  tableSet.add(tableName);

  const colNames: string[] = Array.isArray(ast.columns) ? ast.columns.map((c: any) => getColName(c)) : [];

  const rows: any[] = ast.values?.values ?? [];
  if (rows.length > 0 && colNames.length > 0) {
    const firstRow: any[] = rows[0]?.value ?? [];
    for (let i = 0; i < Math.min(colNames.length, firstRow.length); i++) {
      const col = colNames[i];
      addColRef(colRefs, tableName, col);
      const sig = literalSignal(firstRow[i]);
      if (sig) addSignal(signals, tableName, col, sig.type, sig.priority, sig.source);
    }
  } else {
    for (const col of colNames) addColRef(colRefs, tableName, col);
  }
}

// ── UPDATE walker ─────────────────────────────────────────────────────────────

function walkUpdate(
  ast:      any,
  signals:  SignalMap,
  colRefs:  ColRefMap,
  tableSet: Set<string>,
): void {
  const tableEntry = Array.isArray(ast.table) ? ast.table[0] : ast.table;
  if (!tableEntry?.table) return;

  const tableName = normTable(tableEntry.table);
  tableSet.add(tableName);
  const localAlias = new Map([[normTable(tableEntry.as ?? tableName), tableName]]);

  if (Array.isArray(ast.set)) {
    for (const item of ast.set) {
      const col = getColName(item.column);
      if (!col) continue;
      addColRef(colRefs, tableName, col);
      const sig = literalSignal(item.value);
      if (sig) addSignal(signals, tableName, col, sig.type, sig.priority, sig.source);
      if (item.value) walkExpr(item.value, localAlias, [tableName], signals, colRefs);
    }
  }

  if (ast.where) walkExpr(ast.where, localAlias, [tableName], signals, colRefs);
}

// ── DELETE walker ─────────────────────────────────────────────────────────────

function walkDelete(
  ast:      any,
  signals:  SignalMap,
  colRefs:  ColRefMap,
  tableSet: Set<string>,
  cteNames: Set<string>,
  aliasMap: Map<string, string>,
): void {
  const tableEntry = Array.isArray(ast.table) ? ast.table[0] : ast.table;
  if (tableEntry?.table) {
    const tableName = normTable(tableEntry.table);
    tableSet.add(tableName);
    const localAlias = new Map([[normTable(tableEntry.as ?? tableName), tableName]]);
    if (ast.where) walkExpr(ast.where, localAlias, [tableName], signals, colRefs);
  } else if (Array.isArray(ast.from)) {
    const scope = walkFrom(ast.from, tableSet, cteNames, aliasMap, signals, colRefs);
    if (ast.where) walkExpr(ast.where, aliasMap, scope, signals, colRefs);
  }
}

// ── Schema builder ────────────────────────────────────────────────────────────

function buildSchemaMap(
  tableSet: Set<string>,
  cteNames: Set<string>,
  signals:  SignalMap,
  colRefs:  ColRefMap,
  literalsMap: LiteralsMap = new Map(),
): InferredSchemaMap {
  const result: InferredSchemaMap = new Map();

  for (const tableName of tableSet) {
    if (cteNames.has(tableName)) continue;

    const referencedCols = new Set<string>();
    for (const key of colRefs.keys()) {
      const [tbl, col] = key.split('\0');
      if (tbl === tableName) referencedCols.add(col);
    }

    if (referencedCols.size === 0) {
      const domainSchema = resolveDomainSchema(tableName);
      const targetSpecs = domainSchema ?? UNIVERSAL_FALLBACK_SCHEMA;
      result.set(tableName, {
        tableName,
        isDefault: !domainSchema,
        columns: targetSpecs.map(dc => ({
          name:              dc.name,
          logicalType:       dc.logicalType,
          sqliteType:        SQLITE_DDL[dc.logicalType],
          source:            domainSchema ? `domain catalog: matched ${tableName} schema` : `universal fallback schema`,
          predicateLiterals: literalsMap.get(signalKey(tableName, dc.name)),
        })),
      });
      continue;
    }

    const columns: ColumnDef[] = [];
    const colNameSet = new Set<string>();

    for (const col of referencedCols) {
      const key      = signalKey(tableName, col);
      const signal   = signals.get(key);
      const lits     = literalsMap.get(key);
      colNameSet.add(col.toLowerCase());

      if (signal) {
        let finalType = signal.type;
        const hint = nameHeuristicType(col);
        if (signal.type === 'NUMERIC' && hint && hint.type !== 'NUMERIC') {
          finalType = hint.type;
        }
        columns.push({
          name:              col,
          logicalType:       finalType,
          sqliteType:        SQLITE_DDL[finalType],
          source:            signal.source,
          predicateLiterals: lits,
        });
      } else {
        const hint = nameHeuristicType(col);
        if (hint) {
          columns.push({
            name:              col,
            logicalType:       hint.type,
            sqliteType:        SQLITE_DDL[hint.type],
            source:            hint.source,
            predicateLiterals: lits,
          });
        } else {
          columns.push({
            name:              col,
            logicalType:       'VARCHAR',
            sqliteType:        SQLITE_DDL['VARCHAR'],
            source:            `spec 3.2 last row: no signal found → fallback VARCHAR(255)`,
            predicateLiterals: lits,
          });
        }
      }
    }

    // Domain Schema Augmentation: fill in complementary domain columns if table matches a domain spec
    const domainSchema = resolveDomainSchema(tableName);
    if (domainSchema) {
      for (const dc of domainSchema) {
        if (!colNameSet.has(dc.name.toLowerCase())) {
          columns.push({
            name:              dc.name,
            logicalType:       dc.logicalType,
            sqliteType:        SQLITE_DDL[dc.logicalType],
            source:            `domain catalog: augmented ${tableName} schema`,
            predicateLiterals: literalsMap.get(signalKey(tableName, dc.name)),
          });
          colNameSet.add(dc.name.toLowerCase());
        }
      }
    }

    result.set(tableName, { tableName, isDefault: false, columns });
  }

  return result;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Infer the schema of all tables referenced in a SQL query.
 *
 * @param queryText - The raw SQL string
 * @param dialect   - One of MySQL | PostgreSQL | SQLite | TransactSQL | SSMS
 * @returns         - Map from normalized table name → TableSchema
 * @throws          - Only on genuine parse errors (not "table not found")
 */
export function inferSchema(queryText: string, dialect: Dialect): InferredSchemaMap {
  const parsed = parse(queryText, dialect);
  if (!parsed.ok) throw new Error(`Parse error: ${parsed.message}`);

  const astNodes = Array.isArray(parsed.ast) ? parsed.ast : [parsed.ast];

  const tableSet: Set<string>           = new Set();
  const cteNames: Set<string>           = new Set();
  const aliasMap: Map<string, string>   = new Map();
  const signals:  SignalMap             = new Map();
  const colRefs:  ColRefMap             = new Map();
  const literalsMap: LiteralsMap        = new Map();

  for (const ast of astNodes) {
    walkStatement(ast, signals, colRefs, tableSet, cteNames, aliasMap, literalsMap);
  }

  return buildSchemaMap(tableSet, cteNames, signals, colRefs, literalsMap);
}
