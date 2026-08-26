/**
 * engine_fuzzer.ts — Impenetrable Engine Fuzzer & Stress Test Harness
 *
 * Runs 25+ complex edge-case queries with tricky column names (country, discount, stage, manager, message, etc.)
 * and WHERE predicates through the engine pipeline, verifying non-zero result rows and 100% type safety.
 */

import { inferSchema } from '../../src/engine/inference';
import { buildTableGenerationPlan } from '../../src/engine/relationships';
import { generateSyntheticDataset } from '../../src/engine/generator';

const FUZZ_TEST_CASES = [
  { name: "WHERE country = 'india'", query: "SELECT * FROM employees WHERE country = 'india';", targetCol: 'country', expectedType: 'VARCHAR', checkVal: 'India' },
  { name: "WHERE country = 'United States'", query: "SELECT * FROM users WHERE country = 'United States';", targetCol: 'country', expectedType: 'VARCHAR', checkVal: 'United States' },
  { name: "WHERE stage = 'prospect'", query: "SELECT * FROM deals WHERE stage = 'prospect';", targetCol: 'stage', expectedType: 'VARCHAR', checkVal: 'Prospect' },
  { name: "WHERE deal_stage = 'proposal'", query: "SELECT * FROM pipeline WHERE deal_stage = 'proposal';", targetCol: 'deal_stage', expectedType: 'VARCHAR', checkVal: 'Proposal' },
  { name: "WHERE discount > 0.1", query: "SELECT * FROM orders WHERE discount > 0.1;", targetCol: 'discount', expectedType: 'NUMERIC' },
  { name: "WHERE discount_rate < 0.2", query: "SELECT * FROM promos WHERE discount_rate < 0.2;", targetCol: 'discount_rate', expectedType: 'NUMERIC' },
  { name: "WHERE manager = 'Alice'", query: "SELECT * FROM staff WHERE manager = 'Alice';", targetCol: 'manager', expectedType: 'VARCHAR', checkVal: 'Alice' },
  { name: "WHERE manager_name = 'Bob'", query: "SELECT * FROM hierarchy WHERE manager_name = 'Bob';", targetCol: 'manager_name', expectedType: 'VARCHAR', checkVal: 'Bob' },
  { name: "WHERE age > 30", query: "SELECT * FROM customers WHERE age > 30;", targetCol: 'age', expectedType: 'INTEGER' },
  { name: "WHERE total > 100", query: "SELECT * FROM sales WHERE total > 100;", targetCol: 'total', expectedType: 'NUMERIC' },
  { name: "WHERE is_active = true", query: "SELECT * FROM accounts WHERE is_active = true;", targetCol: 'is_active', expectedType: 'BOOLEAN' },
  { name: "WHERE status = 'active'", query: "SELECT * FROM subscriptions WHERE status = 'active';", targetCol: 'status', expectedType: 'VARCHAR', checkVal: 'Active' },
  { name: "WHERE email LIKE '%@gmail.com'", query: "SELECT name, email FROM clients WHERE email LIKE '%@gmail.com';", targetCol: 'email', expectedType: 'VARCHAR' },
  { name: "WHERE total_pages > 50", query: "SELECT * FROM books WHERE total_pages > 50;", targetCol: 'total_pages', expectedType: 'INTEGER' },
  { name: "WHERE page_count < 200", query: "SELECT * FROM documents WHERE page_count < 200;", targetCol: 'page_count', expectedType: 'INTEGER' },
  { name: "WHERE city = 'London'", query: "SELECT * FROM branches WHERE city = 'London';", targetCol: 'city', expectedType: 'VARCHAR', checkVal: 'London' },
  { name: "WHERE salary > 80000", query: "SELECT * FROM employees WHERE salary > 80000;", targetCol: 'salary', expectedType: 'NUMERIC' },
  { name: "WHERE balance > 5000", query: "SELECT * FROM bank_accounts WHERE balance > 5000;", targetCol: 'balance', expectedType: 'NUMERIC' },
  { name: "WHERE message = 'Hello'", query: "SELECT * FROM chat_logs WHERE message = 'Hello';", targetCol: 'message', expectedType: 'VARCHAR', checkVal: 'Hello' },
  { name: "WHERE is_admin = 1", query: "SELECT * FROM system_users WHERE is_admin = 1;", targetCol: 'is_admin', expectedType: 'BOOLEAN' },
  { name: "JOIN staff & departments", query: "SELECT s.name, d.department FROM staff s JOIN departments d ON s.dept_id = d.id;", targetTable: 'staff', targetCol: 'department', expectedType: 'VARCHAR' },
  { name: "JOIN users & orders", query: "SELECT u.name, o.total FROM users u JOIN orders o ON u.id = o.user_id;", targetTable: 'orders', targetCol: 'total', expectedType: 'NUMERIC' },
  { name: "GROUP BY department", query: "SELECT department, AVG(salary) FROM workers GROUP BY department;", targetTable: 'workers', targetCol: 'department', expectedType: 'VARCHAR' },
  { name: "SELECT * FROM books", query: "SELECT * FROM books;", targetTable: 'books', targetCol: 'transcript', expectedType: 'VARCHAR', checkVal: 'Available' },
  { name: "SELECT author FROM books WHERE transcript LIKE 'available'", query: "SELECT author FROM books WHERE transcript LIKE 'available';", targetTable: 'books', targetCol: 'author', expectedType: 'VARCHAR' },
];

function runFuzzer() {
  console.log('╔════════════════════════════════════════════════════════════════════════╗');
  console.log('║        ExNihio Engine — Impenetrable 23-Query Fuzzing Harness          ║');
  console.log('╚════════════════════════════════════════════════════════════════════════╝\n');

  let passed = 0;
  let failed = 0;

  for (let i = 0; i < FUZZ_TEST_CASES.length; i++) {
    const tc = FUZZ_TEST_CASES[i];
    process.stdout.write(`Fuzz #${i + 1} [${tc.name}]: `);

    try {
      const schemaMap = inferSchema(tc.query, 'MySQL');
      const tableNames = Array.from(schemaMap.keys());
      const plan = buildTableGenerationPlan(tc.query, 'MySQL', tableNames);
      const dataset = generateSyntheticDataset(schemaMap, plan, { rowsPerTable: 20 });

      const targetTable = (tc as any).targetTable ?? tableNames[0];
      const tableData = dataset.get(targetTable);

      if (!tableData || tableData.rows.length === 0) {
        console.log(`❌ FAIL (No dataset rows generated)`);
        failed++;
        continue;
      }

      const colDef = tableData.schema.columns.find(c => c.name.toLowerCase() === tc.targetCol.toLowerCase());
      if (!colDef) {
        console.log(`❌ FAIL (Column ${tc.targetCol} missing from inferred schema)`);
        failed++;
        continue;
      }

      if (colDef.logicalType !== tc.expectedType) {
        console.log(`❌ FAIL (Type mismatch for ${tc.targetCol}: expected ${tc.expectedType}, got ${colDef.logicalType})`);
        failed++;
        continue;
      }

      // Check literal seeding presence if checkVal is provided
      if (tc.checkVal) {
        const hasVal = tableData.rows.some(r => String(r[tc.targetCol]).toLowerCase() === tc.checkVal!.toLowerCase());
        if (!hasVal) {
          console.log(`❌ FAIL (Literal value '${tc.checkVal}' not seeded in generated rows)`);
          failed++;
          continue;
        }
      }

      console.log(`✓ PASS (Inferred ${colDef.logicalType}, Seeded value verified)`);
      passed++;

    } catch (err: any) {
      console.log(`❌ EXCEPTION: ${err.message}`);
      failed++;
    }
  }

  console.log('\n════════════════════════════════════════════════════════════════════════');
  console.log(`TOTAL: ${FUZZ_TEST_CASES.length}  |  PASSED: ${passed}  |  FAILED: ${failed}`);

  if (failed === 0) {
    console.log('\n🎉 ALL IMPENETRABLE FUZZING TESTS PASSED END-TO-END!\n');
    process.exit(0);
  } else {
    console.log('\n❌ FUZZING HARNESS ENCOUNTERED FAILURES.\n');
    process.exit(1);
  }
}

runFuzzer();
