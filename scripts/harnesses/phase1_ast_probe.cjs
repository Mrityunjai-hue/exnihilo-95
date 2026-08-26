/**
 * Phase 1 — Step 1: AST shape probe
 * 
 * Runs representative query types through the parser and logs
 * the full AST structure so Phase 2 knows exactly which fields to walk.
 * Run with: node phase1_ast_probe.cjs
 */
const { Parser } = require('node-sql-parser');
const parser = new Parser();

function probe(label, sql, db = 'MySQL') {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`[${db}] ${label}`);
  console.log(`SQL: ${sql}`);
  console.log('-'.repeat(70));
  try {
    const ast = parser.astify(sql, { database: db });
    // Print top-level keys and select key sub-structure
    const node = Array.isArray(ast) ? ast[0] : ast;
    console.log('Top-level AST keys:', Object.keys(node));
    
    // Show FROM clause structure
    if (node.from) {
      console.log('from:', JSON.stringify(node.from, null, 2));
    }
    // Show JOIN clause structure (embedded in 'from' for node-sql-parser)
    // Show WITH (CTE) structure
    if (node.with) {
      console.log('with:', JSON.stringify(node.with, null, 2));
    }
    // Show WHERE structure briefly
    if (node.where) {
      console.log('where (top):', JSON.stringify(node.where, null, 2).substring(0, 500));
    }
    // Show table/column lists
    const info = parser.parse(sql, { database: db });
    console.log('tableList:', info.tableList);
    console.log('columnList:', info.columnList);
  } catch (err) {
    console.log('ERROR:', err.message);
  }
}

// SELECT with FROM
probe('SELECT basic', 'SELECT id, name FROM customers WHERE age > 30');

// INNER JOIN
probe('INNER JOIN', 
  'SELECT o.id, c.name FROM orders o JOIN customers c ON o.customer_id = c.id');

// LEFT JOIN
probe('LEFT JOIN',
  'SELECT c.name, o.id FROM customers c LEFT JOIN orders o ON c.id = o.customer_id');

// RIGHT JOIN (MySQL)
probe('RIGHT JOIN',
  'SELECT e.name, d.name FROM employees e RIGHT JOIN departments d ON e.dept_id = d.id');

// FULL OUTER JOIN (PostgreSQL)
probe('FULL OUTER JOIN', 
  'SELECT e.name, d.name FROM employees e FULL OUTER JOIN departments d ON e.dept_id = d.id',
  'PostgreSQL');

// Self-join
probe('Self-join',
  'SELECT e1.name AS employee, e2.name AS manager FROM employees e1 JOIN employees e2 ON e1.manager_id = e2.id');

// CTE
probe('CTE / WITH',
  "WITH recent AS (SELECT * FROM sales WHERE sale_date > '2026-01-01') SELECT * FROM recent");

// Subquery in FROM (derived table)
probe('Derived table', 
  'SELECT x.name FROM (SELECT name, age FROM users WHERE age > 25) AS x');

// INSERT
probe('INSERT', 
  "INSERT INTO leads (name, email) VALUES ('Test', 'test@x.com')");

// UPDATE
probe('UPDATE',
  "UPDATE orders SET status = 'shipped' WHERE id = 1");

// DELETE
probe('DELETE',
  'DELETE FROM expired_sessions WHERE created_at < NOW()');

// UNION
probe('UNION',
  'SELECT name FROM customers UNION SELECT name FROM employees');

// GROUP BY
probe('GROUP BY',
  'SELECT department, AVG(salary) FROM employees GROUP BY department');
