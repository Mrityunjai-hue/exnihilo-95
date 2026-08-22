/**
 * Phase 2 — Pre-flight AST structure probes
 * Verifies AST shape for patterns not yet confirmed in Phase 1:
 *   - SELECT column with aggregate (AVG)
 *   - GROUP BY
 *   - CAST(x AS type) / :: type
 *   - IS NULL
 *   - Arithmetic expression
 *   - INSERT with VALUES
 *   - columns: '*' vs array
 * Run with: node phase2_preprobe.cjs
 */
const { Parser } = require('node-sql-parser');
const p = new Parser();

function probe(label, sql, db = 'MySQL') {
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`[${db}] ${label}`);
  console.log(`SQL: ${sql}`);
  console.log('─'.repeat(60));
  try {
    const ast = p.astify(sql, { database: db });
    const node = Array.isArray(ast) ? ast[0] : ast;
    console.log(JSON.stringify(node, null, 2));
  } catch (e) {
    console.log('ERROR:', e.message);
  }
}

// ── 1. GROUP BY + AVG aggregate ──────────────────────────────────────────────
probe('GROUP BY + AVG',
  'SELECT department, AVG(salary) FROM employees GROUP BY department');

// ── 2. CAST ──────────────────────────────────────────────────────────────────
probe('CAST(x AS INTEGER)',
  'SELECT CAST(age AS INT) FROM users WHERE CAST(score AS FLOAT) > 0.5');

// ── 3. PostgreSQL :: cast ─────────────────────────────────────────────────────
probe('PostgreSQL ::type cast',
  "SELECT age::integer FROM users WHERE score::float > 0.5", 'PostgreSQL');

// ── 4. IS NULL ───────────────────────────────────────────────────────────────
probe('IS NULL / IS NOT NULL',
  'SELECT name FROM users WHERE email IS NULL AND phone IS NOT NULL');

// ── 5. Arithmetic ────────────────────────────────────────────────────────────
probe('Arithmetic (price * qty)',
  'SELECT price * qty AS total FROM orders WHERE price > 0');

// ── 6. SELECT * (columns shape) ──────────────────────────────────────────────
probe('SELECT * columns shape',
  'SELECT * FROM customers WHERE age > 30');

// ── 7. INSERT with VALUES ─────────────────────────────────────────────────────
probe('INSERT with VALUES',
  "INSERT INTO leads (name, email) VALUES ('Test', 'test@x.com')");

// ── 8. UPDATE SET ─────────────────────────────────────────────────────────────
probe('UPDATE SET clause',
  "UPDATE orders SET status = 'shipped', updated_at = NOW() WHERE id = 1");

// ── 9. CTE WITH (confirm with[].name.value vs with[].name) ───────────────────
probe('CTE WITH clause',
  "WITH recent AS (SELECT * FROM sales WHERE sale_date > '2026-01-01') SELECT * FROM recent");

// ── 10. UNION _next chain ─────────────────────────────────────────────────────
probe('UNION _next',
  'SELECT name FROM customers UNION SELECT name FROM employees');
