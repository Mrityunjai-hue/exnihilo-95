/**
 * Phase 1 — Step 0: Empirical dialect name probe
 * 
 * Tests every plausible dialect string against a simple SELECT query
 * to find the exact accepted keys and their case sensitivity.
 * Run with: node phase1_dialect_probe.cjs
 */
const { Parser } = require('node-sql-parser');
const parser = new Parser();

const CANDIDATES = [
  // MySQL variations
  'MySQL', 'mysql', 'MYSQL',
  // PostgreSQL variations  
  'PostgreSQL', 'Postgresql', 'postgresql', 'POSTGRESQL', 'postgres', 'Postgres',
  // SQLite variations
  'SQLite', 'Sqlite', 'sqlite', 'SQLITE',
  // T-SQL variations
  'TransactSQL', 'transactsql', 'TRANSACTSQL', 'tsql', 'TSQL', 'mssql', 'MSSQL', 'sqlserver',
];

const TEST_SQL = 'SELECT id, name FROM users WHERE age > 25';

console.log('=== node-sql-parser v5.4.0 — Dialect Name Probe ===\n');
console.log(`Test query: ${TEST_SQL}\n`);
console.log('Candidate string          | Result');
console.log('--------------------------|--------');

for (const db of CANDIDATES) {
  try {
    const ast = parser.astify(TEST_SQL, { database: db });
    // Success — AST was returned
    const tableFound = JSON.stringify(ast).includes('"users"');
    console.log(`${db.padEnd(26)}| PASS ✓  (table 'users' in AST: ${tableFound})`);
  } catch (err) {
    // Could be a parse error (dialect not supported) or syntax error
    const msg = err.message.substring(0, 60);
    console.log(`${db.padEnd(26)}| FAIL ✗  [${msg}]`);
  }
}
