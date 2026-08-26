/**
 * test_engine_live.ts — End-to-End Live Matrix Test of the Production SQLExecutor
 * Runs 20 distinct SQL query patterns directly through src/engine/executor.ts
 */

import { SQLExecutor } from '../../src/engine/executor';
import { Dialect } from '../../src/engine/parser';

async function main() {
  console.log('╔════════════════════════════════════════════════════════════════════════╗');
  console.log('║        ExNihilo 95 — Production Engine Comprehensive Matrix Test       ║');
  console.log('║        Testing 20 Distinct SQL Query Archetypes End-to-End             ║');
  console.log('╚════════════════════════════════════════════════════════════════════════╝\n');

  const executor = new SQLExecutor();
  await executor.init();

  const testCases: { id: string; category: string; dialect: Dialect; sql: string }[] = [
    // 1. Aggregations with HAVING & Filter
    {
      id: 'AGG_01',
      category: 'Aggregations & Grouping (GROUP BY + HAVING)',
      dialect: 'MySQL',
      sql: `SELECT department, COUNT(*) as staff_count, AVG(salary) as avg_salary, MAX(salary) as max_salary 
            FROM employees 
            GROUP BY department 
            HAVING avg_salary > 40000;`,
    },
    // 2. BETWEEN and IN operators
    {
      id: 'OP_02',
      category: 'Advanced Predicates (BETWEEN & IN)',
      dialect: 'PostgreSQL',
      sql: `SELECT id, price, stock_quantity, status 
            FROM inventory 
            WHERE price BETWEEN 10.00 AND 300.00 
            AND status IN ('in_stock', 'low_stock');`,
    },
    // 3. CASE WHEN expression
    {
      id: 'CASE_03',
      category: 'Conditional CASE Expressions',
      dialect: 'MySQL',
      sql: `SELECT id, name, age, 
            CASE 
              WHEN age < 18 THEN 'Minor' 
              WHEN age < 65 THEN 'Adult' 
              ELSE 'Senior' 
            END as age_group 
            FROM patients;`,
    },
    // 4. Window Functions - ROW_NUMBER & AVG OVER
    {
      id: 'WIN_04',
      category: 'Window Functions (ROW_NUMBER & AVG OVER)',
      dialect: 'SQLite',
      sql: `SELECT id, department, salary, 
            ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC) as dept_rank,
            AVG(salary) OVER (PARTITION BY department) as dept_avg_salary
            FROM staff_members;`,
    },
    // 5. Scalar Subquery in WHERE
    {
      id: 'SUB_05',
      category: 'Scalar Subquery in WHERE',
      dialect: 'MySQL',
      sql: `SELECT id, name, salary 
            FROM teachers 
            WHERE salary > (SELECT AVG(salary) FROM teachers);`,
    },
    // 6. Subquery with IN clause
    {
      id: 'SUB_06',
      category: 'Subquery with IN operator',
      dialect: 'PostgreSQL',
      sql: `SELECT id, name, budget 
            FROM projects 
            WHERE client_id IN (SELECT id FROM clients WHERE tier = 'enterprise');`,
    },
    // 7. Derived Table (Inline View)
    {
      id: 'SUB_07',
      category: 'Derived Table in FROM',
      dialect: 'MySQL',
      sql: `SELECT sub.author, SUM(sub.views) as total_author_views 
            FROM (
              SELECT author, views FROM articles WHERE views > 100
            ) as sub 
            GROUP BY sub.author;`,
    },
    // 8. Chained CTEs (Common Table Expressions)
    {
      id: 'CTE_08',
      category: 'Multiple Chained CTEs',
      dialect: 'PostgreSQL',
      sql: `WITH high_value_orders AS (
              SELECT customer_id, SUM(total) as lifetime_spent 
              FROM customer_orders 
              GROUP BY customer_id 
              HAVING lifetime_spent > 100
            ),
            vip_customers AS (
              SELECT c.id, c.name, c.email, hvo.lifetime_spent 
              FROM store_customers c 
              JOIN high_value_orders hvo ON c.id = hvo.customer_id
            )
            SELECT name, email, lifetime_spent FROM vip_customers ORDER BY lifetime_spent DESC;`,
    },
    // 9. 3-Table E-Commerce Join
    {
      id: 'JOIN_09',
      category: '3-Table Multi-Join',
      dialect: 'MySQL',
      sql: `SELECT u.name as customer_name, o.id as order_id, oi.quantity, oi.price, (oi.quantity * oi.price) as item_total 
            FROM app_users u 
            JOIN ecommerce_orders o ON u.id = o.user_id 
            JOIN shop_order_items oi ON o.id = oi.order_id;`,
    },
    // 10. Self-Join for Org Hierarchy
    {
      id: 'SELF_10',
      category: 'Self-Join (Org Hierarchy)',
      dialect: 'PostgreSQL',
      sql: `SELECT emp.name as employee_name, emp.title, mgr.name as manager_name 
            FROM team_members emp 
            LEFT JOIN team_members mgr ON emp.manager_id = mgr.id;`,
    },
    // 11. Set Operations (UNION ALL)
    {
      id: 'SET_11',
      category: 'UNION ALL Set Operation',
      dialect: 'SQLite',
      sql: `SELECT id, name, email, 'US_Customer' as source FROM us_customers 
            UNION ALL 
            SELECT id, name, email, 'EU_Customer' as source FROM eu_customers;`,
    },
    // 12. String Functions & Concatenation
    {
      id: 'FUNC_12',
      category: 'String Functions & Concatenation',
      dialect: 'SQLite',
      sql: `SELECT id, 
            UPPER(name) as uppercase_name, 
            LENGTH(name) as name_length 
            FROM user_profiles;`,
    },
    // 13. Mathematical Functions (ROUND, ABS)
    {
      id: 'MATH_13',
      category: 'Mathematical Functions',
      dialect: 'MySQL',
      sql: `SELECT id, amount, ROUND(amount * 0.08, 2) as tax, ABS(amount) as absolute_value 
            FROM financial_transactions;`,
    },
    // 14. Date Comparison & Ordering
    {
      id: 'DATE_14',
      category: 'Date Filtering & Ordering',
      dialect: 'PostgreSQL',
      sql: `SELECT id, name, event_date 
            FROM calendar_events 
            WHERE event_date >= '2025-01-01' 
            ORDER BY event_date ASC 
            LIMIT 5;`,
    },
    // 15. Complex Join with WHERE & GROUP BY
    {
      id: 'COMPLEX_15',
      category: 'Join + Where + Group By + Having',
      dialect: 'MySQL',
      sql: `SELECT c.name as category_name, COUNT(p.id) as product_count, AVG(p.price) as avg_price 
            FROM product_categories c 
            JOIN catalog_products p ON c.id = p.category_id 
            WHERE p.id > 0 
            GROUP BY c.name 
            HAVING product_count >= 1;`,
    },
    // 16. SSMS Bracket Identifiers
    {
      id: 'SSMS_16',
      category: 'SSMS / Transact-SQL Brackets',
      dialect: 'SSMS',
      sql: `SELECT [c].[name], [o].[amount] 
            FROM [ms_customers] [c] 
            INNER JOIN [ms_orders] [o] ON [c].[id] = [o].[customer_id];`,
    },
    // 17. Null Handling with IS NOT NULL
    {
      id: 'NULL_17',
      category: 'NULL Handling (IS NOT NULL)',
      dialect: 'PostgreSQL',
      sql: `SELECT id, name, completed_at 
            FROM sprint_tasks 
            WHERE completed_at IS NOT NULL;`,
    },
    // 18. Compound Logical Conditions (AND / OR with Parentheses)
    {
      id: 'LOGIC_18',
      category: 'Compound Boolean Logic',
      dialect: 'MySQL',
      sql: `SELECT id, name, price, department 
            FROM store_items 
            WHERE (department = 'Engineering' AND price < 500) 
               OR (department = 'Sales' AND price > 100);`,
    },
    // 19. Multi-Query Semicolon Batch Execution
    {
      id: 'MULTI_19',
      category: 'Multi-Query Batch Execution',
      dialect: 'SQLite',
      sql: `SELECT id, name FROM book_authors LIMIT 3; 
            SELECT id, name, author_id FROM library_books LIMIT 5;`,
    },
    // 20. Zero-Config Bare Query on Unseen Tables
    {
      id: 'BARE_20',
      category: 'Zero-Signal Bare Table Query',
      dialect: 'SQLite',
      sql: `SELECT * FROM galactic_starships WHERE speed > 50;`,
    },
  ];

  let passed = 0;
  let failed = 0;

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    console.log(`────────────────────────────────────────────────────────────────────────`);
    console.log(`Test #${i + 1} [${tc.id} - ${tc.dialect}]: ${tc.category}`);
    console.log(`Query: ${tc.sql.replace(/\s+/g, ' ').trim()}`);

    const res = await executor.execute(tc.sql, tc.dialect, { rowsPerTable: 20 });

    if (res.ok) {
      console.log(`Execution Time: ${res.executionTimeMs?.toFixed(1)} ms`);
      console.log(`Inferred Tables: [${res.inferredTables.join(', ')}] | Cached: [${res.reusedTables.join(', ')}]`);
      if (res.allResults && res.allResults.length > 1) {
        console.log(`Multi-Query Result Sets: ${res.allResults.length}`);
        res.allResults.forEach((r, idx) => {
          console.log(`  Set #${idx + 1}: ${r.rowCount} rows | Cols: [${r.columns.join(', ')}]`);
        });
      } else {
        console.log(`Returned: ${res.rowCount} rows | Columns: [${res.columns.join(', ')}]`);
        if (res.rows.length > 0) {
          console.log(`Sample Row: ${JSON.stringify(res.rows[0])}`);
        }
      }
      console.log(`Outcome: ✓ PASS`);
      passed++;
    } else {
      console.error(`Outcome: ✗ FAIL -> [${res.errorType}] ${res.message}`);
      failed++;
    }
  }

  console.log('\n════════════════════════════════════════════════════════════════════════');
  console.log(`TOTAL: ${testCases.length}  |  PASSED: ${passed}  |  FAILED: ${failed}`);

  if (failed === 0) {
    console.log('\n🎉 ALL 20 Production Query Archetypes PASSED Flawlessly in SQLExecutor!');
  } else {
    console.log(`\n⚠️ ${failed} queries failed.`);
  }
}

main().catch(console.error);
