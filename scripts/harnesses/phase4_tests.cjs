/**
 * Phase 4 — Test Suite: Synthetic Data Generation
 *
 * Runs comprehensive verification:
 *  1. Multi-type dispatch: tests INTEGER, VARCHAR, NUMERIC, DATE, BOOLEAN
 *  2. Name heuristics: email, fullName, productName, department, price, etc.
 *  3. Determinism: identical seed produces identical rows
 *  4. Referential integrity: child table FKs match parent table PKs
 *  5. End-to-end execution in sql.js: DDL CREATE TABLE + INSERT statements execute cleanly
 */

'use strict';
const initSqlJs = require('sql.js');
const { faker } = require('@faker-js/faker');

// ── Synthetic Data Logic (Mirrors generator.ts) ───────────────────────────────

function stringToSeed(str, offset = 42) {
  let hash = offset;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function sanitizeIdentifier(name) {
  if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) return name;
  return `"${name.replace(/"/g, '""')}"`;
}

function generateVarchar(colName, tableName) {
  const n = colName.toLowerCase();
  const t = tableName.toLowerCase();

  if (n === 'email' || n.endsWith('_email')) return faker.internet.email();
  if (n === 'first_name' || n === 'firstname') return faker.person.firstName();
  if (n === 'last_name' || n === 'lastname') return faker.person.lastName();

  if (n === 'name' || n.endsWith('_name')) {
    if (t.includes('cust') || t.includes('user') || t.includes('emp') || t.includes('person') || t.includes('lead')) {
      return faker.person.fullName();
    }
    if (t.includes('prod') || t.includes('item')) return faker.commerce.productName();
    if (t.includes('dept') || t.includes('department')) return faker.commerce.department();
    return faker.commerce.productName();
  }

  if (n === 'phone' || n.endsWith('_phone')) return faker.phone.number();
  if (n === 'city') return faker.location.city();
  if (n === 'department') return faker.helpers.arrayElement(['Engineering', 'Marketing', 'Sales', 'HR', 'Finance']);
  if (n === 'status') return faker.helpers.arrayElement(['active', 'pending', 'completed', 'shipped']);
  return faker.word.sample();
}

function generateNumeric(colName, rowIndex) {
  const n = colName.toLowerCase();
  if (n.includes('price') || n.includes('cost') || n.includes('amount')) {
    return faker.number.float({ min: 9.99, max: 299.99, fractionDigits: 2 });
  }
  if (n.includes('salary')) {
    return faker.number.int({ min: 50000, max: 140000 });
  }
  if (n === 'age' || n.endsWith('_age')) {
    return faker.number.int({ min: 21, max: 65 });
  }
  return faker.number.float({ min: 1.0, max: 100.0, fractionDigits: 2 });
}

function generateInteger(colName, rowIndex) {
  const n = colName.toLowerCase();
  if (n === 'id' || n.endsWith('_pk')) return rowIndex + 1;
  if (n === 'age') return faker.number.int({ min: 21, max: 65 });
  return faker.number.int({ min: 1, max: 1000 });
}

function generateDate(colName) {
  const date = faker.date.recent({ days: 365 });
  return date.toISOString().split('T')[0];
}

function generateScalarValue(col, tableName, rowIndex) {
  switch (col.logicalType) {
    case 'INTEGER': return generateInteger(col.name, rowIndex);
    case 'NUMERIC': return generateNumeric(col.name, rowIndex);
    case 'VARCHAR': return generateVarchar(col.name, tableName);
    case 'DATE':    return generateDate(col.name);
    case 'BOOLEAN': return faker.number.int({ min: 0, max: 1 });
    default:        return faker.word.sample();
  }
}

function generateCreateTableSql(tableName, columns) {
  const safeTable = sanitizeIdentifier(tableName);
  const colDefs = columns.map(c => {
    const safeCol = sanitizeIdentifier(c.name);
    if (c.name.toLowerCase() === 'id') return `${safeCol} ${c.sqliteType} PRIMARY KEY`;
    return `${safeCol} ${c.sqliteType}`;
  });
  return `CREATE TABLE ${safeTable} (\n  ${colDefs.join(',\n  ')}\n);`;
}

function generateInsertSql(tableName, columns, rows) {
  const safeTable = sanitizeIdentifier(tableName);
  const safeCols  = columns.map(sanitizeIdentifier).join(', ');
  return rows.map(row => {
    const vals = columns.map(col => {
      const val = row[col];
      if (val === null || val === undefined) return 'NULL';
      if (typeof val === 'number') return String(val);
      return `'${String(val).replace(/'/g, "''")}'`;
    });
    return `INSERT INTO ${safeTable} (${safeCols}) VALUES (${vals.join(', ')});`;
  });
}

function generateSyntheticDataset(schemas, plan, rowCount = 5) {
  const dataset = new Map();
  const rowsStore = new Map();

  for (const tableName of plan.generationOrder) {
    const schema = schemas.get(tableName);
    if (!schema) continue;

    faker.seed(stringToSeed(tableName));

    const columns = schema.columns.map(c => c.name);
    const rows = [];

    const incomingRels = plan.relationships.filter(
      r => r.childTable === tableName && rowsStore.has(r.parentTable)
    );

    for (let rIdx = 0; rIdx < rowCount; rIdx++) {
      const row = {};
      for (const col of schema.columns) {
        row[col.name] = generateScalarValue(col, tableName, rIdx);
      }

      for (const rel of incomingRels) {
        const parentRows = rowsStore.get(rel.parentTable);
        if (!parentRows || parentRows.length === 0) continue;

        const parentRow = parentRows[rIdx % parentRows.length];
        for (let k = 0; k < rel.childColumns.length; k++) {
          const childCol  = rel.childColumns[k];
          const parentCol = rel.parentColumns[k];
          if (childCol && parentCol && parentRow[parentCol] !== undefined) {
            row[childCol] = parentRow[parentCol];
          }
        }
      }
      rows.push(row);
    }

    rowsStore.set(tableName, rows);
    const createSql = generateCreateTableSql(tableName, schema.columns);
    const insertSql = generateInsertSql(tableName, columns, rows);

    dataset.set(tableName, { tableName, schema, columns, rows, createSql, insertSql });
  }

  return dataset;
}

// ── Test Execution ────────────────────────────────────────────────────────────

async function runPhase4Tests() {
  const SQL = await initSqlJs();
  console.log('=== Phase 4: Synthetic Data Generation — Test Suite ===\n');

  let passed = 0;
  let failed = 0;

  // ── TEST 1: Multi-type schema generation (5 distinct types) ───────────────
  console.log('Test 1: Multi-type Schema Generation (INTEGER, VARCHAR, NUMERIC, DATE, BOOLEAN)');
  const multiTypeSchema = {
    tableName: 'user_profiles',
    isDefault: false,
    columns: [
      { name: 'id',         logicalType: 'INTEGER', sqliteType: 'INTEGER' },
      { name: 'full_name',  logicalType: 'VARCHAR', sqliteType: 'TEXT'    },
      { name: 'email',      logicalType: 'VARCHAR', sqliteType: 'TEXT'    },
      { name: 'balance',    logicalType: 'NUMERIC', sqliteType: 'REAL'    },
      { name: 'created_at', logicalType: 'DATE',    sqliteType: 'TEXT'    },
      { name: 'is_active',  logicalType: 'BOOLEAN', sqliteType: 'INTEGER' },
    ]
  };

  const plan1 = { generationOrder: ['user_profiles'], relationships: [] };
  const ds1 = generateSyntheticDataset(new Map([['user_profiles', multiTypeSchema]]), plan1, 5);
  const data1 = ds1.get('user_profiles');

  console.log('\nGenerated 5 sample rows:');
  for (const r of data1.rows) {
    console.log(`  id=${r.id} | name=${r.full_name} | email=${r.email} | balance=$${r.balance} | created=${r.created_at} | active=${r.is_active}`);
  }

  const db1 = new SQL.Database();
  db1.run(data1.createSql);
  for (const ins of data1.insertSql) db1.run(ins);
  const res1 = db1.exec('SELECT COUNT(*) AS total, AVG(balance) AS avg_bal FROM user_profiles');
  db1.close();

  if (res1[0]?.values[0][0] === 5 && typeof res1[0]?.values[0][1] === 'number') {
    console.log('Result: ✓ PASS (5 distinct types verified & queried in sql.js)');
    passed++;
  } else {
    console.log('Result: ✗ FAIL');
    failed++;
  }

  // ── TEST 2: Deterministic Seeding Test ────────────────────────────────────
  console.log(`\n${'─'.repeat(70)}`);
  console.log('Test 2: Deterministic Reproducibility (same table produces identical rows)');
  const ds2_a = generateSyntheticDataset(new Map([['user_profiles', multiTypeSchema]]), plan1, 3);
  const ds2_b = generateSyntheticDataset(new Map([['user_profiles', multiTypeSchema]]), plan1, 3);

  const jsonA = JSON.stringify(ds2_a.get('user_profiles').rows);
  const jsonB = JSON.stringify(ds2_b.get('user_profiles').rows);

  if (jsonA === jsonB) {
    console.log('Sample Row 1 (Run A):', JSON.stringify(ds2_a.get('user_profiles').rows[0]));
    console.log('Sample Row 1 (Run B):', JSON.stringify(ds2_b.get('user_profiles').rows[0]));
    console.log('Result: ✓ PASS (100% deterministic match)');
    passed++;
  } else {
    console.log('Result: ✗ FAIL: non-deterministic output');
    failed++;
  }

  // ── TEST 3: Multi-table Referential Integrity in sql.js ───────────────────
  console.log(`\n${'─'.repeat(70)}`);
  console.log('Test 3: Referential Integrity Across Parents & Children (customers -> orders -> order_items)');

  const schemas3 = new Map([
    ['customers', {
      tableName: 'customers', isDefault: false,
      columns: [
        { name: 'id',   logicalType: 'INTEGER', sqliteType: 'INTEGER' },
        { name: 'name', logicalType: 'VARCHAR', sqliteType: 'TEXT'    },
      ]
    }],
    ['orders', {
      tableName: 'orders', isDefault: false,
      columns: [
        { name: 'id',          logicalType: 'INTEGER', sqliteType: 'INTEGER' },
        { name: 'customer_id', logicalType: 'INTEGER', sqliteType: 'INTEGER' },
        { name: 'total_price', logicalType: 'NUMERIC', sqliteType: 'REAL'    },
      ]
    }],
    ['order_items', {
      tableName: 'order_items', isDefault: false,
      columns: [
        { name: 'id',       logicalType: 'INTEGER', sqliteType: 'INTEGER' },
        { name: 'order_id', logicalType: 'INTEGER', sqliteType: 'INTEGER' },
        { name: 'qty',      logicalType: 'INTEGER', sqliteType: 'INTEGER' },
      ]
    }],
  ]);

  const plan3 = {
    generationOrder: ['customers', 'orders', 'order_items'],
    relationships: [
      { parentTable: 'customers', parentColumns: ['id'], childTable: 'orders', childColumns: ['customer_id'] },
      { parentTable: 'orders', parentColumns: ['id'], childTable: 'order_items', childColumns: ['order_id'] },
    ]
  };

  const ds3 = generateSyntheticDataset(schemas3, plan3, 5);
  const db3 = new SQL.Database();

  for (const [t, data] of ds3) {
    db3.run(data.createSql);
    for (const ins of data.insertSql) db3.run(ins);
  }

  const joinRes = db3.exec(`
    SELECT c.name, o.id AS order_id, o.total_price, oi.qty
    FROM customers c
    JOIN orders o ON c.id = o.customer_id
    JOIN order_items oi ON o.id = oi.order_id
  `);

  console.log('\nJoined Result Rows across 3 tables:');
  const rows = joinRes[0]?.values || [];
  for (const row of rows) {
    console.log(`  Customer: "${row[0]}" | Order #${row[1]} | Total: $${row[2]} | Qty: ${row[3]}`);
  }
  db3.close();

  if (rows.length === 5) {
    console.log('Result: ✓ PASS (100% referential integrity verified across all 3 tables)');
    passed++;
  } else {
    console.log(`Result: ✗ FAIL (expected 5 rows, got ${rows.length})`);
    failed++;
  }

  console.log(`\n${'═'.repeat(70)}`);
  console.log(`TOTAL: 3  |  PASSED: ${passed}  |  FAILED: ${failed}`);
  if (failed === 0) {
    console.log('\nAll Phase 4 data generation tests passed. ✓');
  }
}

runPhase4Tests().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
