/**
 * Phase 6 — Error Classification Tests (Spec Section 7 items 5 and 7)
 *
 * Test 5: Ambiguous column name across JOIN — must surface error (NOT swallowed)
 * Test 7: Malformed syntax (LIMIT with no value) — must surface SYNTAX_ERROR
 */

'use strict';
const initSqlJs = require('sql.js');
const { Parser } = require('node-sql-parser');
const p = new Parser();

function classifyError(msg) {
  if (/ambiguous column name/i.test(msg)) {
    const match = msg.match(/ambiguous column name:\s*([a-zA-Z0-9_]+)/i);
    const colName = match ? match[1] : 'column';
    return {
      type: 'AMBIGUOUS_COLUMN',
      message: msg,
      suggestion: `Qualify the column with its table alias, e.g. "e.${colName}" or "d.${colName}".`,
    };
  }
  if (/Expected .* but .* found/i.test(msg) || /syntax error/i.test(msg) || /near ".*": syntax error/i.test(msg)) {
    return {
      type: 'SYNTAX_ERROR',
      message: msg,
      suggestion: 'Check SQL syntax, keywords, parentheses, or unclosed quotes.',
    };
  }
  return { type: 'RUNTIME_ERROR', message: msg };
}

async function runErrorTests() {
  const SQL = await initSqlJs();
  console.log('=== Phase 6: Error Classification — Test Suite ===\n');

  let passed = 0;
  let failed = 0;

  // ── TEST 5: Ambiguous Column across JOIN ──────────────────────────────────
  console.log('Test 5 [Spec §7 Test 5]: Ambiguous column across JOIN');
  const sql5 = 'SELECT name FROM employees e JOIN departments d ON e.dept_id = d.id';
  console.log(`SQL: ${sql5}`);

  const db5 = new SQL.Database();
  // Both tables have column 'name'
  db5.run('CREATE TABLE employees (id INTEGER, name TEXT, dept_id INTEGER);');
  db5.run('CREATE TABLE departments (id INTEGER, name TEXT);');
  db5.run("INSERT INTO employees VALUES (1, 'Alice', 10);");
  db5.run("INSERT INTO departments VALUES (10, 'Engineering');");

  let error5 = null;
  try {
    db5.exec(sql5);
  } catch (err) {
    error5 = classifyError(err.message);
  }
  db5.close();

  if (error5 && error5.type === 'AMBIGUOUS_COLUMN') {
    console.log(`\nSurfaced Error: [${error5.type}] ${error5.message}`);
    console.log(`Suggestion:     ${error5.suggestion}`);
    console.log('Result: ✓ PASS (ambiguous column error correctly detected and surfaced with suggestion)');
    passed++;
  } else {
    console.log(`Result: ✗ FAIL (expected AMBIGUOUS_COLUMN, got ${error5 ? error5.type : 'none'})`);
    failed++;
  }

  // ── TEST 7: Malformed Syntax (LIMIT with no value) ────────────────────────
  console.log(`\n${'─'.repeat(70)}`);
  console.log('Test 7 [Spec §7 Test 7]: Malformed Syntax (LIMIT with no value)');
  const sql7 = 'SELECT * FROM prders LIMIT';
  console.log(`SQL: ${sql7}`);

  let error7 = null;
  try {
    p.parse(sql7, { database: 'SQLite' });
  } catch (err) {
    error7 = classifyError(err.message);
  }

  if (error7 && error7.type === 'SYNTAX_ERROR') {
    console.log(`\nSurfaced Error: [${error7.type}] ${error7.message}`);
    console.log(`Suggestion:     ${error7.suggestion}`);
    console.log('Result: ✓ PASS (syntax error correctly caught at parse time and surfaced with suggestion)');
    passed++;
  } else {
    console.log(`Result: ✗ FAIL (expected SYNTAX_ERROR, got ${error7 ? error7.type : 'none'})`);
    failed++;
  }

  console.log(`\n${'═'.repeat(70)}`);
  console.log(`TOTAL: 2  |  PASSED: ${passed}  |  FAILED: ${failed}`);
  if (failed === 0) {
    console.log('\nAll Phase 6 error classification tests passed. ✓');
  }
}

runErrorTests().catch(err => {
  console.error('Error test error:', err);
  process.exit(1);
});
