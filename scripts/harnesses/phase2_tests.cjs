/**
 * Phase 2 — Test Suite (7 spec items)
 * Tests spec Section 7 items: 1, 2, 4, 6, 12, 13, 14
 *
 * Self-contained CJS implementation of the schema inference engine.
 * Run with: node phase2_tests.cjs
 */

'use strict';
const { Parser } = require('node-sql-parser');
const p = new Parser();

// ── Priority levels (spec 3.2) ────────────────────────────────────────────────
const P_FALLBACK  = 1;
const P_NAME_HINT = 2;
const P_GROUP_BY  = 3;
const P_FUNCTION  = 4;
const P_LITERAL   = 5;
const P_CAST      = 6;

// ── SQLite DDL mapping (spec 3.2) ─────────────────────────────────────────────
const SQLITE_DDL = {
  INTEGER:   'INTEGER',
  VARCHAR:   'TEXT',
  NUMERIC:   'REAL',
  DATE:      'TEXT',
  TIMESTAMP: 'TEXT',
  BOOLEAN:   'INTEGER',
};

// ── Default schema (zero column signal, spec 3.1) ─────────────────────────────
const DEFAULT_COLUMNS = [
  { name: 'id',         type: 'INTEGER' },
  { name: 'name',       type: 'VARCHAR' },
  { name: 'value',      type: 'NUMERIC' },
  { name: 'created_at', type: 'DATE'    },
];

// ── AST Identifier Extraction Helpers ─────────────────────────────────────────
function getColName(col) {
  if (!col) return '';
  if (typeof col === 'string') return col.toLowerCase();
  if (typeof col === 'object') {
    if (col.expr?.value) return String(col.expr.value).toLowerCase();
    if (col.value) return String(col.value).toLowerCase();
    if (col.name) return String(col.name).toLowerCase();
    if (col.column) return getColName(col.column);
  }
  return String(col).toLowerCase();
}

function getTableName(tbl) {
  if (!tbl) return null;
  if (typeof tbl === 'string') return tbl.toLowerCase();
  if (typeof tbl === 'object') {
    if (tbl.expr?.value) return String(tbl.expr.value).toLowerCase();
    if (tbl.value) return String(tbl.value).toLowerCase();
    if (tbl.table) return getTableName(tbl.table);
  }
  return String(tbl).toLowerCase();
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}/;

// ── Function sets (empirically verified in pre-probe) ─────────────────────────
const NUMERIC_AGGR = new Set(['SUM','AVG','MIN','MAX','STDEV','VARIANCE']);
const DATE_FUNCS   = new Set([
  'NOW','GETDATE','CURDATE','CURRENT_DATE','CURRENT_TIMESTAMP',
  'DATETIME','DATE','TIMESTAMP','DATEADD','DATEDIFF','DATE_FORMAT',
  'YEAR','MONTH','DAY','EXTRACT','TO_DATE','TO_TIMESTAMP','DATE_TRUNC',
]);

// ── Dialect mapping (same as parser.ts) ──────────────────────────────────────
const DIALECT_MAP = {
  MySQL: 'MySQL', PostgreSQL: 'PostgreSQL', SQLite: 'SQLite',
  TransactSQL: 'TransactSQL', SSMS: 'TransactSQL',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function normTable(name) { return getTableName(name) || ''; }

function signalKey(table, col) { return `${table}\0${col}`; }

function addSignal(signals, table, col, type, priority, source) {
  if (!table || !col || col === '*') return;
  const key = signalKey(table, col);
  const existing = signals.get(key);
  if (!existing || priority > existing.priority) {
    signals.set(key, { type, priority, source });
  }
}

function addColRef(colRefs, table, col) {
  if (!table || !col || col === '*') return;
  colRefs.set(signalKey(table, col), true);
}

function resolveAlias(alias, aliasMap) {
  if (!alias) return null;
  const lower = alias.toLowerCase();
  return aliasMap.get(lower) || lower;
}

// ── Literal type inference (spec 3.2 rows 2–8) ───────────────────────────────

function literalSignal(node) {
  if (!node) return null;
  switch (node.type) {
    case 'number':
      return { type: 'NUMERIC', priority: P_LITERAL,
               source: 'spec 3.2 row 2: numeric literal comparison → NUMERIC' };
    case 'single_quote_string':
    case 'double_quote_string': {
      const val = node.value || '';
      if (DATE_PATTERN.test(val))
        return { type: 'DATE', priority: P_LITERAL,
                 source: `spec 3.2 row 7: date-shaped literal '${val}' → DATE` };
      return { type: 'VARCHAR', priority: P_LITERAL,
               source: 'spec 3.2 row 3: string literal comparison → VARCHAR' };
    }
    case 'bool':
      return { type: 'BOOLEAN', priority: P_LITERAL,
               source: 'spec 3.2 row 8: boolean comparison → BOOLEAN' };
    default:
      return null;
  }
}

// ── CAST type normalization ───────────────────────────────────────────────────

function normalizeCastType(sqlType) {
  const t = (sqlType || '').toUpperCase();
  if (/^INT|BIGINT|SMALLINT|TINYINT/.test(t)) return 'INTEGER';
  if (/FLOAT|DOUBLE|DECIMAL|NUMERIC|REAL|NUMBER/.test(t)) return 'NUMERIC';
  if (/CHAR|TEXT|STRING|VARCHAR/.test(t)) return 'VARCHAR';
  if (/BOOL/.test(t)) return 'BOOLEAN';
  if (/TIMESTAMP/.test(t)) return 'TIMESTAMP';
  if (/DATE/.test(t)) return 'DATE';
  return null;
}

// ── Column name heuristic (spec 3.2 row 9+) ──────────────────────────────────

function nameHeuristic(col) {
  const n = col.toLowerCase();
  if (n === 'id' || n.endsWith('_id'))
    return { type: 'INTEGER', source: "spec 3.2 row 9: 'id' or '_id' suffix → INTEGER" };
  if (/^(price|amount|total|cost|qty|quantity|score|rating|balance|salary|age|weight|height)/.test(n)
      || n.endsWith('_price') || n.endsWith('_amount') || n.endsWith('_cost'))
    return { type: 'NUMERIC', source: `spec 3.2 generation hint: '${n}' matches numeric pattern → NUMERIC` };
  if (n.endsWith('_at') || n.endsWith('_date') || n.endsWith('_time') || n === 'date' || n === 'timestamp')
    return { type: 'DATE', source: `spec 3.2 generation hint: '${n}' matches date pattern → DATE` };
  if (n.startsWith('is_') || n.startsWith('has_') || n.startsWith('can_'))
    return { type: 'BOOLEAN', source: `spec 3.2 generation hint: '${n}' starts with is_/has_/can_ → BOOLEAN` };
  return null;
}

// ── Expression walker ─────────────────────────────────────────────────────────

function walkExpr(expr, aliasMap, scopeTables, signals, colRefs) {
  if (!expr || typeof expr !== 'object') return;

  switch (expr.type) {
    case 'binary_expr': {
      const op  = (expr.operator || '').toUpperCase();
      const lhs = expr.left;
      const rhs = expr.right;

      const resolveCol = (node) => {
        const col = getColName(node.column);
        if (!col || col === '*') return [null, null];
        const rawTable = getTableName(node.table);
        const tbl = rawTable
          ? resolveAlias(rawTable, aliasMap)
          : (scopeTables.length === 1 ? scopeTables[0] : null);
        return [tbl, col];
      };

      if (op === 'LIKE' || op === 'ILIKE') {
        if (lhs?.type === 'column_ref') {
          const [t, c] = resolveCol(lhs);
          addColRef(colRefs, t, c);
          addSignal(signals, t, c, 'VARCHAR', P_FUNCTION,
            `spec 3.2 row 4: ${op} operator → VARCHAR`);
        }
        walkExpr(rhs, aliasMap, scopeTables, signals, colRefs);
        return;
      }

      if (op === 'IS NULL' || op === 'IS NOT NULL' || op === 'IS' || op === 'IS NOT') {
        if (lhs?.type === 'column_ref') {
          const [t, c] = resolveCol(lhs);
          addColRef(colRefs, t, c);
        }
        return;
      }

      if (['+', '-', '*', '/'].includes(expr.operator)) {
        if (lhs?.type === 'column_ref') {
          const [t, c] = resolveCol(lhs);
          addColRef(colRefs, t, c);
          addSignal(signals, t, c, 'NUMERIC', P_FUNCTION,
            `spec 3.2 row 6: arithmetic '${expr.operator}' → NUMERIC`);
        }
        if (rhs?.type === 'column_ref') {
          const [t, c] = resolveCol(rhs);
          addColRef(colRefs, t, c);
          addSignal(signals, t, c, 'NUMERIC', P_FUNCTION,
            `spec 3.2 row 6: arithmetic '${expr.operator}' → NUMERIC`);
        }
        walkExpr(lhs, aliasMap, scopeTables, signals, colRefs);
        walkExpr(rhs, aliasMap, scopeTables, signals, colRefs);
        return;
      }

      const lhsIsCol = lhs?.type === 'column_ref';
      const rhsIsCol = rhs?.type === 'column_ref';

      if (lhsIsCol && !rhsIsCol) {
        const [t, c] = resolveCol(lhs);
        addColRef(colRefs, t, c);
        const sig = literalSignal(rhs);
        if (sig) addSignal(signals, t, c, sig.type, sig.priority, sig.source);
      }
      if (rhsIsCol && !lhsIsCol) {
        const [t, c] = resolveCol(rhs);
        addColRef(colRefs, t, c);
        const sig = literalSignal(lhs);
        if (sig) addSignal(signals, t, c, sig.type, sig.priority, sig.source);
      }
      if (lhsIsCol && rhsIsCol) {
        const [t1, c1] = resolveCol(lhs);
        const [t2, c2] = resolveCol(rhs);
        addColRef(colRefs, t1, c1);
        addColRef(colRefs, t2, c2);
      }

      walkExpr(lhs, aliasMap, scopeTables, signals, colRefs);
      walkExpr(rhs, aliasMap, scopeTables, signals, colRefs);
      break;
    }

    case 'aggr_func': {
      const funcName = (expr.name || '').toUpperCase();
      const argExpr  = expr.args?.expr;
      if (NUMERIC_AGGR.has(funcName) && argExpr?.type === 'column_ref') {
        const col = getColName(argExpr.column);
        const rawTable = getTableName(argExpr.table);
        const tbl = rawTable
          ? resolveAlias(rawTable, aliasMap)
          : (scopeTables.length === 1 ? scopeTables[0] : null);
        addColRef(colRefs, tbl, col);
        addSignal(signals, tbl, col, 'NUMERIC', P_FUNCTION,
          `spec 3.2 row 6: ${funcName}() aggregate → NUMERIC`);
      } else if (argExpr) {
        walkExpr(argExpr, aliasMap, scopeTables, signals, colRefs);
      }
      break;
    }

    case 'function': {
      let funcName = '';
      if (typeof expr.name === 'string') funcName = expr.name.toUpperCase();
      else if (Array.isArray(expr.name?.name)) funcName = (expr.name.name[0]?.value || '').toUpperCase();

      const args = expr.args?.value || [];

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
      for (const arg of args) walkExpr(arg, aliasMap, scopeTables, signals, colRefs);
      break;
    }

    case 'cast': {
      const inner      = expr.expr;
      const targetType = normalizeCastType(expr.target?.[0]?.dataType || '');
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
        walkExpr(inner, aliasMap, scopeTables, signals, colRefs);
      }
      break;
    }

    case 'expr': {
      if (expr.symbol === '::') {
        const inner = expr.expr;
        const targetType = normalizeCastType(expr.target?.[0]?.dataType || '');
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
          walkExpr(inner, aliasMap, scopeTables, signals, colRefs);
        }
        break;
      }
      for (const v of Object.values(expr)) {
        if (v && typeof v === 'object') {
          Array.isArray(v)
            ? v.forEach(item => walkExpr(item, aliasMap, scopeTables, signals, colRefs))
            : walkExpr(v, aliasMap, scopeTables, signals, colRefs);
        }
      }
      break;
    }

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

    case 'select': {
      walkStatement(expr, new Set(), new Set(), new Map(), signals, colRefs);
      break;
    }

    case 'unary_expr': {
      walkExpr(expr.expr, aliasMap, scopeTables, signals, colRefs);
      break;
    }

    default: {
      for (const v of Object.values(expr)) {
        if (v && typeof v === 'object') {
          Array.isArray(v)
            ? v.forEach(item => walkExpr(item, aliasMap, scopeTables, signals, colRefs))
            : walkExpr(v, aliasMap, scopeTables, signals, colRefs);
        }
      }
    }
  }
}

// ── FROM walker ───────────────────────────────────────────────────────────────

function walkFrom(fromList, tableSet, cteNames, aliasMap, signals, colRefs) {
  const scope = [];
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
      if (item.on) walkExpr(item.on, aliasMap, scope, signals, colRefs);
    } else if (item.expr) {
      const subAst = item.expr.ast ?? item.expr;
      walkStatement(subAst, new Set(), cteNames, new Map(), signals, colRefs);
    }
  }
  return scope;
}

// ── Statement dispatcher ──────────────────────────────────────────────────────

function walkStatement(ast, tableSet, cteNames, aliasMap, signals, colRefs) {
  if (!ast) return;
  switch (ast.type) {
    case 'select': walkSelect(ast, tableSet, cteNames, aliasMap, signals, colRefs); break;
    case 'insert': walkInsert(ast, tableSet, signals, colRefs); break;
    case 'update': walkUpdate(ast, tableSet, signals, colRefs); break;
    case 'delete': walkDelete(ast, tableSet, cteNames, aliasMap, signals, colRefs); break;
  }
}

// ── SELECT walker ─────────────────────────────────────────────────────

function walkSelect(ast, tableSet, cteNames, aliasMap, signals, colRefs) {
  // 1. CTEs
  if (Array.isArray(ast.with)) {
    for (const cte of ast.with) {
      const cteName = normTable(cte.name?.value ?? cte.name?.name ?? cte.name ?? '');
      if (cteName) cteNames.add(cteName);
      const cteBody = cte.stmt?.ast ?? cte.stmt;
      if (cteBody) walkStatement(cteBody, tableSet, cteNames, new Map(), signals, colRefs);
    }
  }

  // 2. FROM + JOINs
  const scope = Array.isArray(ast.from)
    ? walkFrom(ast.from, tableSet, cteNames, aliasMap, signals, colRefs)
    : [];

  // 3. WHERE
  if (ast.where) walkExpr(ast.where, aliasMap, scope, signals, colRefs);

  // 4. SELECT columns
  if (Array.isArray(ast.columns)) {
    for (const col of ast.columns) {
      if (col?.expr) walkExpr(col.expr, aliasMap, scope, signals, colRefs);
    }
  }

  // 5. GROUP BY
  const groupbyCols = ast.groupby?.columns ?? (Array.isArray(ast.groupby) ? ast.groupby : []);
  for (const col of groupbyCols) {
    if (col?.type === 'column_ref') {
      const c = getColName(col.column);
      const rawTable = getTableName(col.table);
      const tbl = rawTable
        ? resolveAlias(rawTable, aliasMap)
        : (scope.length === 1 ? scope[0] : null);
      addColRef(colRefs, tbl, c);
      addSignal(signals, tbl, c, 'VARCHAR', P_GROUP_BY,
        'spec 3.2 row 9: column in GROUP BY alongside aggregates → VARCHAR (categorical)');
    }
  }

  // 6. HAVING
  if (ast.having) walkExpr(ast.having, aliasMap, scope, signals, colRefs);

  // 7. UNION/_next chain (spec 3.1)
  if (ast._next) walkStatement(ast._next, tableSet, cteNames, aliasMap, signals, colRefs);
}

// ── INSERT / UPDATE / DELETE walkers ──────────────────────────────────────────

function walkInsert(ast, tableSet, signals, colRefs) {
  const te = Array.isArray(ast.table) ? ast.table[0] : ast.table;
  if (!te?.table) return;
  const tn = normTable(te.table);
  tableSet.add(tn);
  const colNames = Array.isArray(ast.columns) ? ast.columns.map(c => getColName(c)) : [];
  const rows = ast.values?.values || [];
  const firstRow = rows[0]?.value || [];
  for (let i = 0; i < Math.min(colNames.length, firstRow.length); i++) {
    addColRef(colRefs, tn, colNames[i]);
    const sig = literalSignal(firstRow[i]);
    if (sig) addSignal(signals, tn, colNames[i], sig.type, sig.priority, sig.source);
  }
  for (const col of colNames) addColRef(colRefs, tn, col);
}

function walkUpdate(ast, tableSet, signals, colRefs) {
  const te = Array.isArray(ast.table) ? ast.table[0] : ast.table;
  if (!te?.table) return;
  const tn  = normTable(te.table);
  const lam = new Map([[normTable(te.as || tn), tn]]);
  tableSet.add(tn);
  if (Array.isArray(ast.set)) {
    for (const item of ast.set) {
      const col = getColName(item.column);
      if (!col) continue;
      addColRef(colRefs, tn, col);
      const sig = literalSignal(item.value);
      if (sig) addSignal(signals, tn, col, sig.type, sig.priority, sig.source);
      if (item.value) walkExpr(item.value, lam, [tn], signals, colRefs);
    }
  }
  if (ast.where) walkExpr(ast.where, lam, [tn], signals, colRefs);
}

function walkDelete(ast, tableSet, cteNames, aliasMap, signals, colRefs) {
  const te = Array.isArray(ast.table) ? ast.table[0] : ast.table;
  if (te?.table) {
    const tn  = normTable(te.table);
    const lam = new Map([[normTable(te.as || tn), tn]]);
    tableSet.add(tn);
    if (ast.where) walkExpr(ast.where, lam, [tn], signals, colRefs);
  } else if (Array.isArray(ast.from)) {
    const scope = walkFrom(ast.from, tableSet, cteNames, aliasMap, signals, colRefs);
    if (ast.where) walkExpr(ast.where, aliasMap, scope, signals, colRefs);
  }
}

// ── Schema builder ────────────────────────────────────────────────────────────

function buildSchemaMap(tableSet, cteNames, signals, colRefs) {
  const result = new Map();
  for (const tableName of tableSet) {
    if (cteNames.has(tableName)) continue;
    const referencedCols = new Set();
    for (const key of colRefs.keys()) {
      const [tbl, col] = key.split('\0');
      if (tbl === tableName) referencedCols.add(col);
    }
    if (referencedCols.size === 0) {
      result.set(tableName, {
        tableName, isDefault: true,
        columns: DEFAULT_COLUMNS.map(dc => ({
          name: dc.name, type: dc.type,
          sqliteType: SQLITE_DDL[dc.type],
          source: 'spec 3.1: zero column signal → default starter schema',
        })),
      });
      continue;
    }
    const columns = [];
    for (const col of referencedCols) {
      const sig = signals.get(signalKey(tableName, col));
      if (sig) {
        columns.push({ name: col, type: sig.type, sqliteType: SQLITE_DDL[sig.type], source: sig.source });
      } else {
        const hint = nameHeuristic(col);
        if (hint) {
          columns.push({ name: col, type: hint.type, sqliteType: SQLITE_DDL[hint.type], source: hint.source });
        } else {
          columns.push({ name: col, type: 'VARCHAR', sqliteType: 'TEXT',
            source: 'spec 3.2 last row: no signal found → fallback VARCHAR(255)' });
        }
      }
    }
    result.set(tableName, { tableName, isDefault: false, columns });
  }
  return result;
}

// ── Main entry point ──────────────────────────────────────────────────────────

function inferSchema(sql, dialect) {
  const db = DIALECT_MAP[dialect] || dialect;
  let parsed;
  try {
    parsed = p.parse(sql.trim(), { database: db });
  } catch (e) {
    throw new Error(`Parse error: ${e.message}`);
  }

  const astNodes = Array.isArray(parsed.ast) ? parsed.ast : [parsed.ast];
  const tableSet = new Set();
  const cteNames = new Set();
  const aliasMap = new Map();
  const signals  = new Map();
  const colRefs  = new Map();

  for (const ast of astNodes) {
    walkStatement(ast, tableSet, cteNames, aliasMap, signals, colRefs);
  }

  return buildSchemaMap(tableSet, cteNames, signals, colRefs);
}

// ── Test cases (spec Section 7 items 1, 2, 4, 6, 12, 13, 14) ─────────────────

const TESTS = [
  {
    id:      1,
    specRef: 'Spec §7 Test 1',
    desc:    'SELECT * with WHERE numeric comparison — infers one column',
    sql:     'SELECT * FROM customers WHERE age > 30',
    dialect: 'MySQL',
    check: (schema) => {
      const t = schema.get('customers');
      if (!t) return 'FAIL: table customers not found';
      const age = t.columns.find(c => c.name === 'age');
      if (!age) return 'FAIL: column age not found';
      if (age.type !== 'NUMERIC') return `FAIL: age type = ${age.type}, expected NUMERIC`;
      if (t.isDefault) return 'FAIL: isDefault should be false (age was inferred from WHERE)';
      return 'PASS';
    },
  },
  {
    id:      2,
    specRef: 'Spec §7 Test 2',
    desc:    'LIKE operator → VARCHAR; bare SELECT column → fallback',
    sql:     "SELECT name, email FROM users WHERE email LIKE '%@gmail.com'",
    dialect: 'PostgreSQL',
    check: (schema) => {
      const t = schema.get('users');
      if (!t) return 'FAIL: table users not found';
      const email = t.columns.find(c => c.name === 'email');
      const name  = t.columns.find(c => c.name === 'name');
      if (!email) return 'FAIL: column email not found';
      if (!name)  return 'FAIL: column name not found';
      if (email.type !== 'VARCHAR') return `FAIL: email type = ${email.type}, expected VARCHAR`;
      if (name.type !== 'VARCHAR')  return `FAIL: name type = ${name.type}, expected VARCHAR`;
      return 'PASS';
    },
  },
  {
    id:      4,
    specRef: 'Spec §7 Test 4',
    desc:    'AVG aggregate → NUMERIC; GROUP BY column → VARCHAR',
    sql:     'SELECT department, AVG(salary) FROM employees GROUP BY department',
    dialect: 'MySQL',
    check: (schema) => {
      const t = schema.get('employees');
      if (!t) return 'FAIL: table employees not found';
      const dept   = t.columns.find(c => c.name === 'department');
      const salary = t.columns.find(c => c.name === 'salary');
      if (!dept)   return 'FAIL: column department not found';
      if (!salary) return 'FAIL: column salary not found';
      if (salary.type !== 'NUMERIC')  return `FAIL: salary type = ${salary.type}, expected NUMERIC`;
      if (dept.type !== 'VARCHAR')    return `FAIL: department type = ${dept.type}, expected VARCHAR`;
      return 'PASS';
    },
  },
  {
    id:      6,
    specRef: 'Spec §7 Test 6',
    desc:    'SELECT * only — zero column signal → default starter schema',
    sql:     'SELECT * FROM orderz',
    dialect: 'SQLite',
    check: (schema) => {
      const t = schema.get('orderz');
      if (!t) return 'FAIL: table orderz not found';
      if (!t.isDefault) return 'FAIL: isDefault should be true (no column signals)';
      const expectedCols = ['id','name','value','created_at'];
      for (const en of expectedCols) {
        if (!t.columns.find(c => c.name === en)) return `FAIL: default column '${en}' missing`;
      }
      const id  = t.columns.find(c => c.name === 'id');
      const val = t.columns.find(c => c.name === 'value');
      if (id?.type !== 'INTEGER') return `FAIL: id type = ${id?.type}, expected INTEGER`;
      if (val?.type !== 'NUMERIC') return `FAIL: value type = ${val?.type}, expected NUMERIC`;
      return 'PASS';
    },
  },
  {
    id:      12,
    specRef: 'Spec §7 Test 12',
    desc:    'Mixed-case table name → normalized to lowercase key',
    sql:     'SELECT * FROM Foo',
    dialect: 'MySQL',
    check: (schema) => {
      if (schema.has('Foo')) return 'FAIL: table stored as "Foo" — must normalize to lowercase';
      if (!schema.has('foo')) return 'FAIL: table "foo" (normalized) not found in schema map';
      const t = schema.get('foo');
      if (!t.isDefault) return 'FAIL: isDefault should be true (SELECT * no column signal)';
      return 'PASS';
    },
  },
  {
    id:      13,
    specRef: 'Spec §7 Test 13',
    desc:    'SELECT * from bare table — zero column signal → default schema',
    sql:     'SELECT * FROM widgets;',
    dialect: 'SQLite',
    check: (schema) => {
      const t = schema.get('widgets');
      if (!t) return 'FAIL: table widgets not found';
      if (!t.isDefault) return 'FAIL: isDefault should be true';
      const names = t.columns.map(c => c.name).sort().join(',');
      const exp   = 'created_at,id,name,value';
      if (names !== exp) return `FAIL: default columns = [${names}], expected [${exp}]`;
      return 'PASS';
    },
  },
  {
    id:      14,
    specRef: 'Spec §7 Test 14',
    desc:    'CTE: real table inferred from CTE body; CTE alias not stored as real table',
    sql:     "WITH recent AS (SELECT * FROM sales WHERE sale_date > '2026-01-01') SELECT * FROM recent",
    dialect: 'PostgreSQL',
    check: (schema) => {
      if (schema.has('recent'))
        return 'FAIL: CTE alias "recent" must not appear in schema map as a real table';
      const t = schema.get('sales');
      if (!t) return 'FAIL: table sales not found (should be inferred from CTE body)';
      const sd = t.columns.find(c => c.name === 'sale_date');
      if (!sd) return 'FAIL: column sale_date not found in sales';
      if (sd.type !== 'DATE') return `FAIL: sale_date type = ${sd.type}, expected DATE`;
      return 'PASS';
    },
  },
];

// ── Test runner ───────────────────────────────────────────────────────────────

console.log('=== Phase 2: Schema Inference Engine — Test Suite ===\n');
console.log('7 spec test cases: §7 items 1, 2, 4, 6, 12, 13, 14\n');

let passed = 0;
let failed = 0;
const failures = [];

for (const test of TESTS) {
  console.log(`${'─'.repeat(70)}`);
  console.log(`Test #${test.id}  [${test.specRef}]`);
  console.log(`Desc:    ${test.desc}`);
  console.log(`Dialect: ${test.dialect}`);
  console.log(`SQL:     ${test.sql}`);

  let schema;
  try {
    schema = inferSchema(test.sql, test.dialect);
  } catch (e) {
    console.log(`\nERROR (unexpected parse failure): ${e.message}`);
    console.log('Result: ✗ FAIL (exception)');
    failed++;
    failures.push({ test, error: e.message });
    continue;
  }

  // Log inferred schema
  console.log('\nInferred schema:');
  for (const [tableName, tableSchema] of schema) {
    console.log(`  Table: ${tableName}${tableSchema.isDefault ? ' [DEFAULT SCHEMA]' : ''}`);
    for (const col of tableSchema.columns) {
      console.log(`    ${col.name.padEnd(14)} ${col.type.padEnd(10)} (SQLite: ${col.sqliteType.padEnd(8)}) ← ${col.source}`);
    }
  }

  const result = test.check(schema);
  const isPass = result === 'PASS';
  if (isPass) {
    passed++;
    console.log(`\nResult: ✓ PASS`);
  } else {
    failed++;
    failures.push({ test, result });
    console.log(`\nResult: ✗ ${result}`);
  }
}

// ── Summary ───────────────────────────────────────────────────────────────────

console.log(`\n${'═'.repeat(70)}`);
console.log(`TOTAL: ${TESTS.length}  |  PASSED: ${passed}  |  FAILED: ${failed}`);

if (failures.length > 0) {
  console.log('\n--- FAILURES ---');
  for (const { test, result, error } of failures) {
    console.log(`  Test #${test.id}: ${error ?? result}`);
  }
} else {
  console.log('\nAll 7 Phase 2 tests passed. ✓');
}
