/**
 * Phase 0 — sql.js JOIN verification harness
 *
 * Tests RIGHT JOIN and FULL OUTER JOIN against the actual sql.js build.
 * Run with: node phase0_sqljs_test.mjs
 *
 * Logs exact output for every query. No assertions are suppressed.
 */

import initSqlJs from 'sql.js';

async function main() {
  console.log('=== Phase 0: sql.js JOIN Verification ===\n');

  // ── 1. Boot the engine ────────────────────────────────────────────────────
  const SQL = await initSqlJs();
  const db  = new SQL.Database();

  // Print the actual SQLite version we're running against
  const [[versionRow]] = db.exec("SELECT sqlite_version()");
  const version = versionRow.values[0][0];
  console.log(`SQLite version (from sql.js build): ${version}\n`);

  // ── 2. Create test tables ─────────────────────────────────────────────────
  db.run(`
    CREATE TABLE departments (
      id   INTEGER PRIMARY KEY,
      name TEXT NOT NULL
    );
  `);
  db.run(`
    INSERT INTO departments VALUES (1, 'Engineering'), (2, 'Marketing'), (3, 'HR');
  `);

  db.run(`
    CREATE TABLE employees (
      id    INTEGER PRIMARY KEY,
      name  TEXT NOT NULL,
      dept_id INTEGER   -- NULL for some rows to test outer-join NULL side
    );
  `);
  db.run(`
    INSERT INTO employees VALUES
      (1, 'Alice',  1),
      (2, 'Bob',   2),
      (3, 'Carol', NULL),   -- no department → will show in RIGHT/FULL
      (4, 'Dave',  99);     -- nonexistent dept → orphaned FK
  `);

  // ── 3. RIGHT JOIN test ────────────────────────────────────────────────────
  console.log('--- TEST 1: RIGHT JOIN ---');
  const rightJoinSQL = `
    SELECT e.name AS employee, d.name AS department
    FROM   employees e
    RIGHT JOIN departments d ON e.dept_id = d.id;
  `;
  console.log('Query:\n' + rightJoinSQL);
  try {
    const result = db.exec(rightJoinSQL);
    if (result.length === 0) {
      console.log('RESULT: (empty result set)');
    } else {
      const { columns, values } = result[0];
      console.log('Columns:', columns);
      console.log('Rows:');
      values.forEach(row => console.log(' ', JSON.stringify(row)));
    }
    console.log('RIGHT JOIN: PASS ✓\n');
  } catch (err) {
    console.log('RIGHT JOIN: FAIL ✗');
    console.log('Error:', err.message, '\n');
  }

  // ── 4. FULL OUTER JOIN test ───────────────────────────────────────────────
  console.log('--- TEST 2: FULL OUTER JOIN ---');
  const fullOuterSQL = `
    SELECT e.name AS employee, d.name AS department
    FROM   employees e
    FULL OUTER JOIN departments d ON e.dept_id = d.id;
  `;
  console.log('Query:\n' + fullOuterSQL);
  try {
    const result = db.exec(fullOuterSQL);
    if (result.length === 0) {
      console.log('RESULT: (empty result set)');
    } else {
      const { columns, values } = result[0];
      console.log('Columns:', columns);
      console.log('Rows:');
      values.forEach(row => console.log(' ', JSON.stringify(row)));
    }
    console.log('FULL OUTER JOIN: PASS ✓\n');
  } catch (err) {
    console.log('FULL OUTER JOIN: FAIL ✗');
    console.log('Error:', err.message, '\n');
  }

  db.close();
  console.log('=== sql.js verification complete ===');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
