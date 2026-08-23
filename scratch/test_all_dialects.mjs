// scratch/test_all_dialects.mjs
import { SQLExecutor } from '../src/engine/executor.ts';

const dialects = ['MySQL', 'PostgreSQL', 'SQLite', 'SSMS'];

const complexQuery = `
SELECT c.country, COUNT(o.id) AS order_count, SUM(o.total_amount) AS total_revenue
FROM customers c
JOIN orders o ON c.id = o.customer_id
GROUP BY c.country
HAVING order_count >= 1
ORDER BY total_revenue DESC;
`;

console.log('Testing Complex Multi-Table JOIN & Aggregation across all 4 dialects...\n');

async function runTests() {
  const executor = new SQLExecutor();
  await executor.init();

  for (const dialect of dialects) {
    executor.reset();
    const res = await executor.execute(complexQuery, dialect);
    if (res.ok) {
      console.log(`[${dialect}] ✅ OK | Rows: ${res.rowCount} | Cols: [${res.columns.join(', ')}] | Time: ${res.executionTimeMs.toFixed(1)}ms`);
    } else {
      console.log(`[${dialect}] ❌ FAIL | Error: ${res.message || res.errorType}`);
    }
  }
}

runTests().catch(console.error);
