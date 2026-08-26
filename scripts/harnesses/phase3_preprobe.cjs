/**
 * Phase 3 Pre-flight Probe: Multi-table JOINs, Self-joins, Composite ON conditions
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
    console.log('FROM clause:');
    console.log(JSON.stringify(node.from, null, 2));
  } catch (e) {
    console.log('ERROR:', e.message);
  }
}

// 1. Self Join
probe('Self Join (employees e LEFT JOIN employees m ON e.manager_id = m.id)',
  'SELECT e.name AS employee, m.name AS manager FROM employees e LEFT JOIN employees m ON e.manager_id = m.id');

// 2. Multi-table Join (4 tables)
probe('4-table Join',
  'SELECT c.name, o.id, p.name FROM customers c JOIN orders o ON c.id = o.customer_id JOIN order_items oi ON o.id = oi.order_id JOIN products p ON oi.product_id = p.id');

// 3. Composite Key Join (AND in ON condition)
probe('Composite Key Join (ON a.tenant_id = b.tenant_id AND a.user_id = b.id)',
  'SELECT * FROM audit_logs a JOIN users b ON a.tenant_id = b.tenant_id AND a.user_id = b.id');

// 4. Non-equi Join (ON a.created_at > b.start_date)
probe('Non-equi Join',
  'SELECT * FROM events a JOIN campaigns b ON a.created_at > b.start_date');
