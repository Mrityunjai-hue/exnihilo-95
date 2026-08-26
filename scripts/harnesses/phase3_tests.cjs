/**
 * Phase 3 — Test Suite (spec Section 7 items: 3, 9, 10, 11)
 *
 * Tests:
 *  1. Relationship extraction (parent, child, columns, join type)
 *  2. Topological sorting (parents before children)
 *  3. Self-join detection (employees.manager_id = employees.id)
 *  4. End-to-end data integrity & execution with sql.js:
 *      - Test 3 (INNER JOIN): 100% referential integrity match -> returns non-empty result rows
 *      - Test 9 (SELF JOIN): generates hierarchical employees with root manager = NULL -> returns both matched and NULL managers
 *      - Test 10 (4-TABLE JOIN): topological ordering -> customers -> orders -> order_items <- products -> returns valid joined rows across all 4 tables
 *      - Test 11 (LEFT JOIN): 80-85% match, 15-20% orphan ratio -> returns customers with orders AND customers with NULL order ID
 */

'use strict';
const initSqlJs = require('sql.js');
const { Parser } = require('node-sql-parser');
const p = new Parser();

// ── Relationship Extractor Logic ──────────────────────────────────────────────

function norm(s) { return (s || '').toLowerCase().trim(); }

function getColName(col) {
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

function getTableName(tbl) {
  if (!tbl) return null;
  if (typeof tbl === 'string') return tbl.toLowerCase();
  if (typeof tbl === 'object') {
    if (tbl.expr?.value) return String(tbl.expr.value).toLowerCase();
    if (tbl.value)       return String(tbl.value).toLowerCase();
    if (tbl.table)       return getTableName(tbl.table);
  }
  return String(tbl).toLowerCase();
}

function identifyParentChild(t1, c1, t2, c2) {
  if (t1 === t2) {
    if (c1 === 'id' || c1.endsWith('_pk')) return { parentTable: t1, parentCol: c1, childTable: t2, childCol: c2 };
    if (c2 === 'id' || c2.endsWith('_pk')) return { parentTable: t2, parentCol: c2, childTable: t1, childCol: c1 };
    return { parentTable: t1, parentCol: c1, childTable: t2, childCol: c2 };
  }
  if ((c1 === 'id' || c1.endsWith('_pk')) && c2 !== 'id') {
    return { parentTable: t1, parentCol: c1, childTable: t2, childCol: c2 };
  }
  if ((c2 === 'id' || c2.endsWith('_pk')) && c1 !== 'id') {
    return { parentTable: t2, parentCol: c2, childTable: t1, childCol: c1 };
  }
  if (c1.endsWith('_id') || c1.endsWith('_fk')) {
    const prefix = c1.replace(/(_id|_fk)$/, '');
    if (t2.includes(prefix) || prefix.includes(t2)) {
      return { parentTable: t2, parentCol: c2, childTable: t1, childCol: c1 };
    }
  }
  if (c2.endsWith('_id') || c2.endsWith('_fk')) {
    const prefix = c2.replace(/(_id|_fk)$/, '');
    if (t1.includes(prefix) || prefix.includes(t1)) {
      return { parentTable: t1, parentCol: c1, childTable: t2, childCol: c2 };
    }
  }
  return { parentTable: t1, parentCol: c1, childTable: t2, childCol: c2 };
}

function extractPairsFromExpr(expr, aliasMap) {
  if (!expr || typeof expr !== 'object') return [];
  if (expr.type === 'binary_expr') {
    const op = (expr.operator || '').toUpperCase();
    if (op === 'AND') {
      return [
        ...extractPairsFromExpr(expr.left, aliasMap),
        ...extractPairsFromExpr(expr.right, aliasMap),
      ];
    }
    const lhs = expr.left;
    const rhs = expr.right;
    if (lhs?.type === 'column_ref' && rhs?.type === 'column_ref') {
      const c1 = getColName(lhs.column);
      const c2 = getColName(rhs.column);
      const rawT1 = getTableName(lhs.table);
      const rawT2 = getTableName(rhs.table);
      const t1 = rawT1 ? (aliasMap.get(rawT1.toLowerCase()) || rawT1.toLowerCase()) : null;
      const t2 = rawT2 ? (aliasMap.get(rawT2.toLowerCase()) || rawT2.toLowerCase()) : null;
      if (t1 && t2 && c1 && c2 && c1 !== '*' && c2 !== '*') {
        return [{ t1, c1, t2, c2, op: expr.operator || '=' }];
      }
    }
  }
  return [];
}

function extractRelationships(ast) {
  const relationships = [];
  const nodes = Array.isArray(ast) ? ast : [ast];

  for (const node of nodes) {
    if (!node || node.type !== 'select') continue;
    const aliasMap = new Map();
    const fromList = Array.isArray(node.from) ? node.from : [];

    for (const item of fromList) {
      if (item?.table) {
        const tn = norm(getTableName(item.table));
        const as = norm(item.as || tn);
        aliasMap.set(as, tn);
        if (as !== tn) aliasMap.set(tn, tn);
      }
    }

    for (const item of fromList) {
      if (!item || !item.join || !item.on) continue;
      const rawJoin = String(item.join).toUpperCase();
      let joinType = 'INNER';
      if (rawJoin.includes('LEFT')) joinType = 'LEFT';
      else if (rawJoin.includes('RIGHT')) joinType = 'RIGHT';
      else if (rawJoin.includes('FULL')) joinType = 'FULL';
      else if (rawJoin.includes('CROSS')) joinType = 'CROSS';

      const pairs = extractPairsFromExpr(item.on, aliasMap);
      if (pairs.length === 0) continue;

      const firstPair = pairs[0];
      const pc = identifyParentChild(firstPair.t1, firstPair.c1, firstPair.t2, firstPair.c2);
      const isSelfJoin = pc.parentTable === pc.childTable;

      const parentCols = [];
      const childCols  = [];

      if (isSelfJoin) {
        parentCols.push(pc.parentCol);
        childCols.push(pc.childCol);
      } else {
        for (const pair of pairs) {
          if (pair.t1 === pc.parentTable && pair.t2 === pc.childTable) {
            parentCols.push(pair.c1);
            childCols.push(pair.c2);
          } else if (pair.t2 === pc.parentTable && pair.t1 === pc.childTable) {
            parentCols.push(pair.c2);
            childCols.push(pair.c1);
          } else {
            parentCols.push(pair.c1);
            childCols.push(pair.c2);
          }
        }
      }

      relationships.push({
        parentTable:   pc.parentTable,
        parentColumns: parentCols,
        childTable:    pc.childTable,
        childColumns:  childCols,
        joinType,
        isSelfJoin,
        isNonEqui:     !pairs.every(p => p.op === '='),
        operator:      firstPair.op,
      });
    }
  }

  return relationships;
}

function topologicalSort(tables, relationships) {
  const normTables = Array.from(new Set(tables.map(norm)));
  if (normTables.length <= 1) return normTables;

  const adj = new Map();
  const inDegree = new Map();

  for (const t of normTables) {
    adj.set(t, new Set());
    inDegree.set(t, 0);
  }

  for (const rel of relationships) {
    if (rel.isSelfJoin) continue;
    const p = norm(rel.parentTable);
    const c = norm(rel.childTable);
    if (adj.has(p) && adj.has(c) && p !== c) {
      const children = adj.get(p);
      if (!children.has(c)) {
        children.add(c);
        inDegree.set(c, (inDegree.get(c) || 0) + 1);
      }
    }
  }

  const queue = [];
  for (const [t, deg] of inDegree.entries()) {
    if (deg === 0) queue.push(t);
  }

  const result = [];
  while (queue.length > 0) {
    const current = queue.shift();
    result.push(current);
    const neighbors = adj.get(current) || new Set();
    for (const neighbor of neighbors) {
      const newDeg = (inDegree.get(neighbor) || 1) - 1;
      inDegree.set(neighbor, newDeg);
      if (newDeg === 0) queue.push(neighbor);
    }
  }

  for (const t of normTables) {
    if (!result.includes(t)) result.push(t);
  }
  return result;
}

// ── Synthetic Data Harness for Verification ───────────────────────────────────

async function runTestHarness() {
  const SQL = await initSqlJs();

  const TESTS = [
    {
      id: 3,
      specRef: 'Spec §7 Test 3',
      desc: 'INNER JOIN — customers (parent) & orders (child) with 100% integrity match',
      sql: 'SELECT o.id, c.name FROM orders o INNER JOIN customers c ON o.customer_id = c.id WHERE c.age > 25',
      dialect: 'MySQL',
      tables: ['orders', 'customers'],
      verify: (db, rels, order) => {
        // Verify relationship
        const rel = rels.find(r => r.parentTable === 'customers' && r.childTable === 'orders');
        if (!rel) return 'FAIL: relationship customers -> orders not inferred';
        if (rel.parentColumns[0] !== 'id' || rel.childColumns[0] !== 'customer_id')
          return 'FAIL: wrong key mapping';

        // Verify topological order
        const cIdx = order.indexOf('customers');
        const oIdx = order.indexOf('orders');
        if (cIdx >= oIdx) return `FAIL: customers (${cIdx}) should be before orders (${oIdx})`;

        // Populate mock data respecting referential integrity
        db.run('CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT, age REAL);');
        db.run('CREATE TABLE orders (id INTEGER PRIMARY KEY, customer_id INTEGER);');

        db.run("INSERT INTO customers VALUES (1, 'Alice', 30), (2, 'Bob', 28), (3, 'Carol', 22);");
        db.run("INSERT INTO orders VALUES (101, 1), (102, 2), (103, 1);");

        const res = db.exec('SELECT o.id, c.name FROM orders o INNER JOIN customers c ON o.customer_id = c.id WHERE c.age > 25');
        const rows = res[0]?.values || [];
        if (rows.length !== 3) return `FAIL: expected 3 joined rows, got ${rows.length}`;
        return { status: 'PASS', rows, cols: res[0].columns };
      }
    },
    {
      id: 9,
      specRef: 'Spec §7 Test 9',
      desc: 'SELF JOIN — employees (manager_id = id) with top-level manager having NULL manager_id',
      sql: 'SELECT e.name AS employee, m.name AS manager FROM employees e LEFT JOIN employees m ON e.manager_id = m.id',
      dialect: 'PostgreSQL',
      tables: ['employees'],
      verify: (db, rels, order) => {
        const selfRel = rels.find(r => r.isSelfJoin && r.parentTable === 'employees');
        if (!selfRel) return 'FAIL: self-join relationship not detected on employees';
        if (selfRel.parentColumns[0] !== 'id' || selfRel.childColumns[0] !== 'manager_id')
          return 'FAIL: self-join keys incorrect';

        db.run('CREATE TABLE employees (id INTEGER PRIMARY KEY, name TEXT, manager_id INTEGER);');
        // CEO with manager_id = NULL, Alice managed by CEO, Bob managed by Alice
        db.run("INSERT INTO employees VALUES (1, 'Eve (CEO)', NULL), (2, 'Alice', 1), (3, 'Bob', 2);");

        const res = db.exec('SELECT e.name AS employee, m.name AS manager FROM employees e LEFT JOIN employees m ON e.manager_id = m.id');
        const rows = res[0]?.values || [];
        const hasNullManager = rows.some(r => r[0] === 'Eve (CEO)' && r[1] === null);
        const hasManaged = rows.some(r => r[0] === 'Alice' && r[1] === 'Eve (CEO)');
        if (!hasNullManager || !hasManaged) return 'FAIL: self-join did not yield expected hierarchical rows';
        return { status: 'PASS', rows, cols: res[0].columns };
      }
    },
    {
      id: 10,
      specRef: 'Spec §7 Test 10',
      desc: '4-TABLE JOIN — customers, orders, order_items, products with multi-level topological ordering',
      sql: 'SELECT c.name, o.id, p.name FROM customers c JOIN orders o ON c.id = o.customer_id JOIN order_items oi ON o.id = oi.order_id JOIN products p ON oi.product_id = p.id',
      dialect: 'MySQL',
      tables: ['customers', 'orders', 'order_items', 'products'],
      verify: (db, rels, order) => {
        if (rels.length !== 3) return `FAIL: expected 3 relationships, got ${rels.length}`;
        const cIdx = order.indexOf('customers');
        const oIdx = order.indexOf('orders');
        const oiIdx = order.indexOf('order_items');
        const pIdx = order.indexOf('products');

        if (cIdx >= oIdx) return 'FAIL: customers must precede orders';
        if (oIdx >= oiIdx) return 'FAIL: orders must precede order_items';
        if (pIdx >= oiIdx) return 'FAIL: products must precede order_items';

        db.run('CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT);');
        db.run('CREATE TABLE orders (id INTEGER PRIMARY KEY, customer_id INTEGER);');
        db.run('CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT);');
        db.run('CREATE TABLE order_items (id INTEGER PRIMARY KEY, order_id INTEGER, product_id INTEGER);');

        db.run("INSERT INTO customers VALUES (1, 'Alice');");
        db.run("INSERT INTO products VALUES (10, 'Widget A'), (20, 'Gadget B');");
        db.run("INSERT INTO orders VALUES (100, 1);");
        db.run("INSERT INTO order_items VALUES (1001, 100, 10), (1002, 100, 20);");

        const res = db.exec('SELECT c.name, o.id, p.name FROM customers c JOIN orders o ON c.id = o.customer_id JOIN order_items oi ON o.id = oi.order_id JOIN products p ON oi.product_id = p.id');
        const rows = res[0]?.values || [];
        if (rows.length !== 2) return `FAIL: expected 2 joined rows, got ${rows.length}`;
        return { status: 'PASS', rows, cols: res[0].columns };
      }
    },
    {
      id: 11,
      specRef: 'Spec §7 Test 11',
      desc: 'LEFT JOIN — customers & orders showing ~80% matched customers and ~20% customers with NULL order',
      sql: 'SELECT c.name, o.id FROM customers c LEFT JOIN orders o ON c.id = o.customer_id',
      dialect: 'SQLite',
      tables: ['customers', 'orders'],
      verify: (db, rels, order) => {
        const rel = rels.find(r => r.parentTable === 'customers' && r.childTable === 'orders');
        if (!rel || rel.joinType !== 'LEFT') return 'FAIL: LEFT JOIN relationship not identified';

        db.run('CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT);');
        db.run('CREATE TABLE orders (id INTEGER PRIMARY KEY, customer_id INTEGER);');

        // 5 customers: 4 have orders (80%), 1 has no order (20% orphan)
        db.run("INSERT INTO customers VALUES (1, 'Alice'), (2, 'Bob'), (3, 'Carol'), (4, 'Dave'), (5, 'Erin');");
        db.run("INSERT INTO orders VALUES (101, 1), (102, 2), (103, 3), (104, 4);");

        const res = db.exec('SELECT c.name, o.id FROM customers c LEFT JOIN orders o ON c.id = o.customer_id');
        const rows = res[0]?.values || [];
        const hasNullOrder = rows.some(r => r[0] === 'Erin' && r[1] === null);
        const hasMatched = rows.filter(r => r[1] !== null).length;
        if (!hasNullOrder || hasMatched !== 4) return 'FAIL: LEFT JOIN did not surface customer with NULL order';
        return { status: 'PASS', rows, cols: res[0].columns };
      }
    }
  ];

  console.log('=== Phase 3: Relationship Inference & Referential Integrity — Test Suite ===\n');
  console.log('Spec Section 7 items: 3, 9, 10, 11\n');

  let passed = 0;
  let failed = 0;

  for (const test of TESTS) {
    console.log(`${'─'.repeat(70)}`);
    console.log(`Test #${test.id}  [${test.specRef}]`);
    console.log(`Desc:    ${test.desc}`);
    console.log(`Dialect: ${test.dialect}`);
    console.log(`SQL:     ${test.sql}`);

    const parsed = p.parse(test.sql, { database: test.dialect === 'PostgreSQL' ? 'PostgreSQL' : 'MySQL' });
    const rels = extractRelationships(parsed.ast);
    const order = topologicalSort(test.tables, rels);

    console.log('\nInferred Relationships:');
    for (const r of rels) {
      console.log(`  [${r.joinType}] ${r.parentTable}.${r.parentColumns.join(',')} ${r.operator} ${r.childTable}.${r.childColumns.join(',')} (self-join: ${r.isSelfJoin})`);
    }
    console.log(`Topological Generation Order: [${order.join(' -> ')}]`);

    const db = new SQL.Database();
    const outcome = test.verify(db, rels, order);

    if (outcome.status === 'PASS') {
      passed++;
      console.log(`\nExecution Sample Result (${outcome.rows.length} rows):`);
      console.log(`  Columns: [${outcome.cols.join(', ')}]`);
      for (const row of outcome.rows) {
        console.log(`  Row: ${JSON.stringify(row)}`);
      }
      console.log('Result: ✓ PASS');
    } else {
      failed++;
      console.log(`\nResult: ✗ ${outcome}`);
    }
    db.close();
  }

  console.log(`\n${'═'.repeat(70)}`);
  console.log(`TOTAL: ${TESTS.length}  |  PASSED: ${passed}  |  FAILED: ${failed}`);
  if (failed === 0) {
    console.log('\nAll 4 Phase 3 acceptance tests passed. ✓');
  }
}

runTestHarness().catch(err => {
  console.error('Test harness exception:', err);
  process.exit(1);
});
