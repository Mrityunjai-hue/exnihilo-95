/**
 * Phase 0 — sql.js JOIN verification harness (CJS, corrected API usage)
 * Run with: node phase0_sqljs_test.cjs
 *
 * sql.js v1.14.2 ships a CJS bundle and a WASM file.
 * initSqlJs() returns a promise that resolves to the SQL namespace object.
 * db.exec(sql) returns an array of { columns, values } objects — one per SELECT.
 */

const initSqlJs = require('sql.js');

async function main() {
  console.log('=== Phase 0: sql.js JOIN Verification ===\n');
  console.log('sql.js version: 1.14.2 (installed)\n');

  // Boot the engine — no WASM file path needed for Node; sql.js ships a built-in WASM
  const SQL = await initSqlJs();
  const db  = new SQL.Database();

  // Report the actual SQLite version embedded in this sql.js build
  const versionResult = db.exec("SELECT sqlite_version()");
  const sqliteVersion = versionResult[0].values[0][0];
  console.log(`Embedded SQLite version: ${sqliteVersion}`);
  console.log(`(RIGHT JOIN + FULL OUTER JOIN require SQLite >= 3.39.0)\n`);

  // ── Create test tables ────────────────────────────────────────────────────
  db.run("CREATE TABLE departments (id INTEGER PRIMARY KEY, name TEXT NOT NULL)");
  db.run("INSERT INTO departments VALUES (1, 'Engineering')");
  db.run("INSERT INTO departments VALUES (2, 'Marketing')");
  db.run("INSERT INTO departments VALUES (3, 'HR')");

  db.run("CREATE TABLE employees (id INTEGER PRIMARY KEY, name TEXT NOT NULL, dept_id INTEGER)");
  db.run("INSERT INTO employees VALUES (1, 'Alice',  1)");
  db.run("INSERT INTO employees VALUES (2, 'Bob',    2)");
  db.run("INSERT INTO employees VALUES (3, 'Carol',  NULL)");  // no dept → appears in RIGHT/FULL unmatched
  db.run("INSERT INTO employees VALUES (4, 'Dave',   99)");    // nonexistent dept → orphaned FK

  // ── TEST 1: RIGHT JOIN ────────────────────────────────────────────────────
  console.log('--- TEST 1: RIGHT JOIN ---');
  const rightJoinSQL = [
    "SELECT e.name AS employee, d.name AS department",
    "FROM   employees e",
    "RIGHT JOIN departments d ON e.dept_id = d.id"
  ].join('\n');
  console.log('Query:\n' + rightJoinSQL + '\n');

  let rightJoinPassed = false;
  try {
    const result = db.exec(rightJoinSQL);
    if (result.length === 0) {
      console.log('RESULT: (empty — no rows returned)');
    } else {
      const { columns, values } = result[0];
      console.log('Columns:', JSON.stringify(columns));
      console.log('Rows:');
      values.forEach((row, i) => console.log(`  [${i}]`, JSON.stringify(row)));
      console.log(`Total rows: ${values.length}`);
    }
    rightJoinPassed = true;
    console.log('RIGHT JOIN: PASS ✓\n');
  } catch (err) {
    console.log('RIGHT JOIN: FAIL ✗');
    console.log('Error message:', err.message, '\n');
  }

  // ── TEST 2: FULL OUTER JOIN ───────────────────────────────────────────────
  console.log('--- TEST 2: FULL OUTER JOIN ---');
  const fullOuterSQL = [
    "SELECT e.name AS employee, d.name AS department",
    "FROM   employees e",
    "FULL OUTER JOIN departments d ON e.dept_id = d.id"
  ].join('\n');
  console.log('Query:\n' + fullOuterSQL + '\n');

  let fullOuterPassed = false;
  try {
    const result = db.exec(fullOuterSQL);
    if (result.length === 0) {
      console.log('RESULT: (empty — no rows returned)');
    } else {
      const { columns, values } = result[0];
      console.log('Columns:', JSON.stringify(columns));
      console.log('Rows:');
      values.forEach((row, i) => console.log(`  [${i}]`, JSON.stringify(row)));
      console.log(`Total rows: ${values.length}`);
    }
    fullOuterPassed = true;
    console.log('FULL OUTER JOIN: PASS ✓\n');
  } catch (err) {
    console.log('FULL OUTER JOIN: FAIL ✗');
    console.log('Error message:', err.message, '\n');
  }

  db.close();

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log('=== SUMMARY ===');
  console.log(`RIGHT JOIN:      ${rightJoinPassed  ? 'PASS ✓' : 'FAIL ✗'}`);
  console.log(`FULL OUTER JOIN: ${fullOuterPassed  ? 'PASS ✓' : 'FAIL ✗'}`);

  if (rightJoinPassed && fullOuterPassed) {
    console.log('\nDecision: sql.js is sufficient — duckdb-wasm fallback NOT needed.');
  } else {
    console.log('\nDecision: sql.js FAILED — duckdb-wasm fallback required.');
    console.log('Next step: run phase0_duckdb_test.cjs');
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
