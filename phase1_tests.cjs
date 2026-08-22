/**
 * Phase 1 — 30-test parser test suite (UPDATED: adds SSMS dialect)
 *
 * 25 valid queries: SELECT, INSERT, UPDATE, DELETE, JOIN × 5 dialects
 *  5 malformed queries: one per dialect
 *
 * SSMS (SQL Server Management Studio) maps to TransactSQL internally —
 * confirmed empirically: 'SSMS' is not accepted by node-sql-parser directly.
 * Our parser.ts DIALECT_MAP handles the alias transparently.
 *
 * Run with: node phase1_tests.cjs
 */

const { Parser } = require('node-sql-parser');
const parser = new Parser();

// ── Dialect map (mirrors parser.ts DIALECT_MAP) ───────────────────────────────
// Applied before calling the parser so SSMS → TransactSQL
const DIALECT_MAP = {
  MySQL:       'MySQL',
  PostgreSQL:  'PostgreSQL',
  SQLite:      'SQLite',
  TransactSQL: 'TransactSQL',
  SSMS:        'TransactSQL',  // alias — 'SSMS' not accepted by node-sql-parser
};

function runParse(sql, dialect) {
  const db = DIALECT_MAP[dialect] || dialect;
  try {
    const result = parser.parse(sql.trim(), { database: db });
    return { ok: true, tableList: result.tableList, columnList: result.columnList };
  } catch (err) {
    return { ok: false, message: err.message };
  }
}

// ── Test cases ────────────────────────────────────────────────────────────────
// 25 valid (5 types × 5 dialects) + 5 malformed (1 per dialect) = 30 total

const TESTS = [

  // ── MySQL (5 valid) ───────────────────────────────────────────────────────
  {
    id:  1, dialect: 'MySQL',       type: 'SELECT',    expect: 'PASS',
    sql: 'SELECT id, name FROM customers WHERE age > 30',
  },
  {
    id:  2, dialect: 'MySQL',       type: 'INSERT',    expect: 'PASS',
    sql: "INSERT INTO leads (name, email) VALUES ('Alice', 'alice@example.com')",
  },
  {
    id:  3, dialect: 'MySQL',       type: 'UPDATE',    expect: 'PASS',
    sql: "UPDATE orders SET status = 'shipped' WHERE id = 42",
  },
  {
    id:  4, dialect: 'MySQL',       type: 'DELETE',    expect: 'PASS',
    sql: 'DELETE FROM sessions WHERE created_at < NOW()',
  },
  {
    id:  5, dialect: 'MySQL',       type: 'JOIN',      expect: 'PASS',
    sql: 'SELECT o.id, c.name FROM orders o INNER JOIN customers c ON o.customer_id = c.id WHERE c.age > 25',
  },

  // ── PostgreSQL (5 valid) ──────────────────────────────────────────────────
  {
    id:  6, dialect: 'PostgreSQL',  type: 'SELECT',    expect: 'PASS',
    sql: "SELECT id, name FROM \"users\" WHERE email ILIKE '%@gmail.com'",
  },
  {
    id:  7, dialect: 'PostgreSQL',  type: 'INSERT',    expect: 'PASS',
    sql: "INSERT INTO products (name, price) VALUES ('Widget', 9.99)",
  },
  {
    id:  8, dialect: 'PostgreSQL',  type: 'UPDATE',    expect: 'PASS',
    sql: 'UPDATE accounts SET balance = balance + 100.0 WHERE user_id = 7',
  },
  {
    id:  9, dialect: 'PostgreSQL',  type: 'DELETE',    expect: 'PASS',
    sql: 'DELETE FROM audit_log WHERE created_at < NOW()',
  },
  {
    id: 10, dialect: 'PostgreSQL',  type: 'JOIN',      expect: 'PASS',
    sql: 'SELECT e.name, d.name FROM employees e FULL OUTER JOIN departments d ON e.dept_id = d.id',
  },

  // ── SQLite (5 valid) ──────────────────────────────────────────────────────
  {
    id: 11, dialect: 'SQLite',      type: 'SELECT',    expect: 'PASS',
    sql: "SELECT name, created_at FROM items WHERE created_at > '2026-01-01'",
  },
  {
    id: 12, dialect: 'SQLite',      type: 'INSERT',    expect: 'PASS',
    sql: "INSERT INTO notes (title, body) VALUES ('Hello', 'World')",
  },
  {
    id: 13, dialect: 'SQLite',      type: 'UPDATE',    expect: 'PASS',
    sql: "UPDATE notes SET body = 'Updated' WHERE title = 'Hello'",
  },
  {
    id: 14, dialect: 'SQLite',      type: 'DELETE',    expect: 'PASS',
    sql: 'DELETE FROM temp_data WHERE id > 100',
  },
  {
    id: 15, dialect: 'SQLite',      type: 'JOIN',      expect: 'PASS',
    sql: 'SELECT c.name, o.id FROM customers c LEFT JOIN orders o ON c.id = o.customer_id',
  },

  // ── TransactSQL (5 valid) ─────────────────────────────────────────────────
  {
    id: 16, dialect: 'TransactSQL', type: 'SELECT',    expect: 'PASS',
    sql: 'SELECT TOP 10 [id], [name] FROM [dbo].[customers] WHERE [age] > 25',
  },
  {
    id: 17, dialect: 'TransactSQL', type: 'INSERT',    expect: 'PASS',
    sql: "INSERT INTO [leads] ([name], [email]) VALUES ('Bob', 'bob@test.com')",
  },
  {
    id: 18, dialect: 'TransactSQL', type: 'UPDATE',    expect: 'PASS',
    sql: "UPDATE [orders] SET [status] = 'processed' WHERE [id] = 1",
  },
  {
    id: 19, dialect: 'TransactSQL', type: 'DELETE',    expect: 'PASS',
    sql: 'DELETE FROM [expired_tokens] WHERE [created_at] < GETDATE()',
  },
  {
    id: 20, dialect: 'TransactSQL', type: 'JOIN',      expect: 'PASS',
    sql: "SELECT e.[name] + ' - ' + d.[name] AS label FROM [employees] e RIGHT JOIN [departments] d ON e.[dept_id] = d.[id]",
  },

  // ── SSMS (5 valid — alias for TransactSQL) ────────────────────────────────
  // Uses identical T-SQL syntax; the parser.ts DIALECT_MAP maps SSMS→TransactSQL.
  {
    id: 21, dialect: 'SSMS',        type: 'SELECT',    expect: 'PASS',
    // SSMS-style: [schema].[table], GETDATE(), TOP
    sql: 'SELECT TOP 5 [id], [email], [created_at] FROM [dbo].[users] WHERE [created_at] > GETDATE()',
  },
  {
    id: 22, dialect: 'SSMS',        type: 'INSERT',    expect: 'PASS',
    sql: "INSERT INTO [dbo].[contacts] ([first_name], [last_name], [phone]) VALUES ('Jane', 'Doe', '555-1234')",
  },
  {
    id: 23, dialect: 'SSMS',        type: 'UPDATE',    expect: 'PASS',
    sql: "UPDATE [dbo].[inventory] SET [qty] = [qty] - 1 WHERE [product_id] = 99",
  },
  {
    id: 24, dialect: 'SSMS',        type: 'DELETE',    expect: 'PASS',
    sql: 'DELETE FROM [dbo].[archive] WHERE [archived_at] < DATEADD(day, -90, GETDATE())',
  },
  {
    id: 25, dialect: 'SSMS',        type: 'JOIN',      expect: 'PASS',
    // SSMS RIGHT JOIN with bracket identifiers
    sql: 'SELECT e.[name], d.[name] AS dept FROM [dbo].[employees] e RIGHT JOIN [dbo].[departments] d ON e.[dept_id] = d.[id]',
  },

  // ── Malformed queries (1 per dialect, must each FAIL) ────────────────────
  {
    id: 26, dialect: 'MySQL',       type: 'MALFORMED', expect: 'FAIL',
    sql: 'SELECT * FROM WHERE id = 1',            // missing table name after FROM
  },
  {
    id: 27, dialect: 'PostgreSQL',  type: 'MALFORMED', expect: 'FAIL',
    sql: "SELECT name FROM users WHERE email = 'unclosed",  // unterminated string
  },
  {
    id: 28, dialect: 'SQLite',      type: 'MALFORMED', expect: 'FAIL',
    sql: 'SELECT * FROM prders LIMIT',             // spec item 7 — LIMIT with no value
  },
  {
    id: 29, dialect: 'TransactSQL', type: 'MALFORMED', expect: 'FAIL',
    sql: 'SELECT [name FROM customers',            // mismatched bracket
  },
  {
    id: 30, dialect: 'SSMS',        type: 'MALFORMED', expect: 'FAIL',
    // 'FORM' is a misspelling of 'FROM' — confirmed to produce a genuine parse error
    // ('SELECT TOP [id] FROM [users]' was tried first but accepted by the T-SQL parser)
    sql: 'SELECT [name] FORM [dbo].[users]',
  },
];

// ── Run tests ─────────────────────────────────────────────────────────────────

console.log('=== Phase 1 (UPDATED): Parser Test Suite — node-sql-parser v5.4.0 ===\n');
console.log('30 cases: 25 valid (SELECT/INSERT/UPDATE/DELETE/JOIN × 5 dialects)');
console.log('        +  5 malformed (1 per dialect)\n');
console.log('Dialects: MySQL | PostgreSQL | SQLite | TransactSQL | SSMS');
console.log('  SSMS → maps to TransactSQL internally (node-sql-parser alias)\n');

let passed = 0;
let failed = 0;
const failures = [];

const header = [
  '#'.padEnd(3),
  'Dialect'.padEnd(13),
  'Type'.padEnd(10),
  'Exp'.padEnd(5),
  'Got'.padEnd(5),
  'Tables / Error (truncated)',
].join(' | ');
console.log(header);
console.log('-'.repeat(header.length + 10));

for (const test of TESTS) {
  const result = runParse(test.sql, test.dialect);
  const actual  = result.ok ? 'PASS' : 'FAIL';
  const matched = actual === test.expect;

  if (matched) passed++;
  else { failed++; failures.push({ test, result, actual }); }

  const mark   = matched
    ? (test.expect === 'PASS' ? '✓' : '✓ err confirmed')
    : '✗ UNEXPECTED';
  const detail = result.ok
    ? (result.tableList || []).join(', ').substring(0, 42) || '(none)'
    : result.message.substring(0, 42);

  console.log([
    String(test.id).padEnd(3),
    test.dialect.padEnd(13),
    test.type.padEnd(10),
    test.expect.padEnd(5),
    actual.padEnd(5),
    detail,
  ].join(' | ') + `  ${mark}`);
}

console.log('\n' + '='.repeat(80));
console.log(`TOTAL: ${TESTS.length}  |  PASSED: ${passed}  |  FAILED: ${failed}`);

if (failures.length > 0) {
  console.log('\n--- UNEXPECTED FAILURES ---');
  for (const { test, result, actual } of failures) {
    console.log(`\nTest #${test.id} [${test.dialect}] ${test.type}`);
    console.log(`  SQL:      ${test.sql}`);
    console.log(`  Expected: ${test.expect}  Got: ${actual}`);
    console.log(result.ok ? `  Tables: ${result.tableList}` : `  Error:  ${result.message}`);
  }
} else {
  console.log('\nAll 30 tests matched expected outcomes. ✓');
}

// ── Full error text for all malformed cases ───────────────────────────────────
console.log('\n--- MALFORMED ERROR DETAILS (tests 26-30) ---');
for (const t of TESTS.filter(t => t.expect === 'FAIL')) {
  const r = runParse(t.sql, t.dialect);
  console.log(`\nTest #${t.id} [${t.dialect}] MALFORMED`);
  console.log(`  SQL:   ${t.sql}`);
  console.log(`  Error: ${r.ok ? '(no error — UNEXPECTED)' : r.message}`);
}
