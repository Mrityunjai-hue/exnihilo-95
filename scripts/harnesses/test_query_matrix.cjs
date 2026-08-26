/**
 * test_query_matrix.cjs — Exhaustive Query Matrix Testing for ExNihilo 95
 * Tests 20 diverse SQL patterns across MySQL, PostgreSQL, SQLite, and SSMS:
 * Aggregations, Window Functions, Subqueries, CTEs, Set Operations, CASE Expressions,
 * Multi-Joins, Mathematical/String/Date functions, and Semicolon Batch Execution.
 */

'use strict';
const initSqlJs = require('sql.js');
const { Parser } = require('node-sql-parser');
const { faker } = require('@faker-js/faker');

const p = new Parser();

const DIALECT_MAP = {
  MySQL: 'MySQL',
  PostgreSQL: 'PostgreSQL',
  SQLite: 'SQLite',
  TransactSQL: 'TransactSQL',
  SSMS: 'TransactSQL',
};

const DEFAULT_COLUMNS = [
  { name: 'id',         logicalType: 'INTEGER', sqliteType: 'INTEGER' },
  { name: 'name',       logicalType: 'VARCHAR', sqliteType: 'TEXT'    },
  { name: 'value',      logicalType: 'NUMERIC', sqliteType: 'REAL'    },
  { name: 'created_at', logicalType: 'DATE',    sqliteType: 'TEXT'    },
];

const SQLITE_DDL = {
  INTEGER: 'INTEGER',
  VARCHAR: 'TEXT',
  NUMERIC: 'REAL',
  DATE:    'TEXT',
  BOOLEAN: 'INTEGER',
  JSON:    'TEXT',
};

function inferColumnType(colName, predicateOp, predicateVal) {
  const lower = colName.toLowerCase();
  if (lower === 'id' || lower.endsWith('_id') || lower.endsWith('id') || lower === 'count' || lower === 'quantity' || lower === 'age' || lower === 'stock_quantity') {
    return { logicalType: 'INTEGER', sqliteType: 'INTEGER' };
  }
  if (lower.includes('price') || lower.includes('amount') || lower.includes('salary') || lower.includes('total') || lower.includes('balance') || lower.includes('budget') || lower.includes('views') || lower.includes('gpa') || lower.includes('rating') || lower.includes('tax') || lower.includes('score')) {
    return { logicalType: 'NUMERIC', sqliteType: 'REAL' };
  }
  if (lower.includes('date') || lower.includes('time') || lower.endsWith('_at') || lower.includes('completed_at') || lower.includes('event_date')) {
    return { logicalType: 'DATE', sqliteType: 'TEXT' };
  }
  if (lower.startsWith('is_') || lower.startsWith('has_') || lower.startsWith('active')) {
    return { logicalType: 'BOOLEAN', sqliteType: 'INTEGER' };
  }
  if (predicateOp === 'LIKE' || predicateOp === 'NOT LIKE') {
    return { logicalType: 'VARCHAR', sqliteType: 'TEXT' };
  }
  if (typeof predicateVal === 'number') {
    return Number.isInteger(predicateVal)
      ? { logicalType: 'INTEGER', sqliteType: 'INTEGER' }
      : { logicalType: 'NUMERIC', sqliteType: 'REAL' };
  }
  return { logicalType: 'VARCHAR', sqliteType: 'TEXT' };
}

function extractPredicates(expr, acc = []) {
  if (!expr || typeof expr !== 'object') return acc;
  if (expr.type === 'binary_expr') {
    const op = (expr.operator || '').toUpperCase();
    if (op === 'AND' || op === 'OR') {
      extractPredicates(expr.left, acc);
      extractPredicates(expr.right, acc);
    } else {
      let colName = null;
      let val = null;
      if (expr.left && expr.left.type === 'column_ref') {
        colName = expr.left.column?.expr?.value || expr.left.column;
        val = expr.right?.value ?? expr.right;
      } else if (expr.right && expr.right.type === 'column_ref') {
        colName = expr.right.column?.expr?.value || expr.right.column;
        val = expr.left?.value ?? expr.left;
      }
      if (colName) {
        acc.push({ column: String(colName), operator: op, value: val });
      }
    }
  }
  return acc;
}

function parseQuery(sql, dialect) {
  const normDialect = DIALECT_MAP[dialect] || 'MySQL';
  try {
    const res = p.parse(sql, { database: normDialect });
    const astList = Array.isArray(res.ast) ? res.ast : [res.ast];
    const tableList = res.tableList || [];
    return { ok: true, ast: astList[0], astList, tableList, columnList: res.columnList || [] };
  } catch (err) {
    return { ok: false, message: err.message };
  }
}

function inferSchemas(sql, dialect) {
  const parseRes = parseQuery(sql, dialect);
  if (!parseRes.ok) throw new Error(parseRes.message);

  const ast = parseRes.ast;
  const schemas = new Map();
  const tableAliases = new Map();

  function scanTableSources(fromClause) {
    if (!fromClause) return;
    const sources = Array.isArray(fromClause) ? fromClause : [fromClause];
    for (const src of sources) {
      if (src.table) {
        const rawName = (src.table || '').toLowerCase().trim();
        if (rawName && rawName !== '(.*)') {
          tableAliases.set(rawName, rawName);
          if (src.as) tableAliases.set(src.as.toLowerCase(), rawName);
          if (!schemas.has(rawName)) {
            schemas.set(rawName, { tableName: rawName, columns: new Map() });
          }
        }
      }
      if (src.expr && src.expr.ast) {
        // Derived table
        scanTableSources(src.expr.ast.from);
      }
    }
  }

  scanTableSources(ast.from);

  // Scan columns in SELECT
  const columns = ast.columns || [];
  if (columns !== '*') {
    for (const col of columns) {
      if (col.expr && col.expr.type === 'column_ref') {
        const cName = String(col.expr.column?.expr?.value || col.expr.column || '').toLowerCase();
        const tTable = col.expr.table ? tableAliases.get(col.expr.table.toLowerCase()) : null;
        if (cName && cName !== '*') {
          const targetTables = tTable ? [tTable] : Array.from(schemas.keys());
          for (const tbl of targetTables) {
            const s = schemas.get(tbl);
            if (s && !s.columns.has(cName)) {
              s.columns.set(cName, inferColumnType(cName));
            }
          }
        }
      }
    }
  }

  // Scan WHERE predicates
  const predicates = extractPredicates(ast.where);
  for (const pred of predicates) {
    const cName = pred.column.toLowerCase();
    for (const s of schemas.values()) {
      if (!s.columns.has(cName)) {
        s.columns.set(cName, inferColumnType(cName, pred.operator, pred.value));
      }
    }
  }

  // Ensure default columns
  for (const s of schemas.values()) {
    if (s.columns.size === 0) {
      for (const def of DEFAULT_COLUMNS) {
        s.columns.set(def.name, { logicalType: def.logicalType, sqliteType: def.sqliteType });
      }
    } else if (!s.columns.has('id')) {
      s.columns.set('id', { logicalType: 'INTEGER', sqliteType: 'INTEGER' });
    }
  }

  // Convert to output format
  const out = new Map();
  for (const [tbl, s] of schemas) {
    out.set(tbl, {
      tableName: tbl,
      columns: Array.from(s.columns.entries()).map(([name, types]) => ({
        name,
        logicalType: types.logicalType,
        sqliteType: types.sqliteType,
      })),
      foreignKeys: [],
    });
  }
  return out;
}

function generateData(schemas, rowCount = 15) {
  const result = new Map();

  for (const [tableName, schema] of schemas) {
    const rows = [];
    for (let i = 1; i <= rowCount; i++) {
      const row = {};
      for (const col of schema.columns) {
        if (col.name === 'id') {
          row.id = i;
        } else if (col.name.endsWith('_id') || col.name.endsWith('id')) {
          row[col.name] = (i % 5) + 1;
        } else if (col.name === 'age') {
          row.age = 20 + ((i * 7) % 55);
        } else if (col.name === 'email') {
          row.email = `user${i}@gmail.com`;
        } else if (col.name.includes('name') || col.name === 'author' || col.name === 'title') {
          row[col.name] = `${faker.person.firstName()} ${faker.person.lastName()}`;
        } else if (col.name.includes('price') || col.name.includes('amount') || col.name.includes('total') || col.name.includes('salary') || col.name.includes('budget')) {
          row[col.name] = 50 + (i * 25);
        } else if (col.name === 'department') {
          row.department = ['Engineering', 'Marketing', 'Sales', 'Finance'][i % 4];
        } else if (col.name === 'status') {
          row.status = ['in_stock', 'low_stock', 'active'][i % 3];
        } else if (col.name.includes('date') || col.name.endsWith('_at')) {
          row[col.name] = '2025-06-15';
        } else if (col.logicalType === 'BOOLEAN') {
          row[col.name] = 1;
        } else {
          row[col.name] = `${col.name}_${i}`;
        }
      }
      rows.push(row);
    }

    const colDefs = schema.columns.map(c => `"${c.name}" ${SQLITE_DDL[c.logicalType] || 'TEXT'}`).join(', ');
    const createSql = `CREATE TABLE IF NOT EXISTS "${tableName}" (${colDefs});`;

    const insertSql = rows.map(r => {
      const colNames = Object.keys(r).map(c => `"${c}"`).join(', ');
      const colVals = Object.values(r).map(v => {
        if (v === null) return 'NULL';
        if (typeof v === 'number') return v;
        return `'${String(v).replace(/'/g, "''")}'`;
      }).join(', ');
      return `INSERT INTO "${tableName}" (${colNames}) VALUES (${colVals});`;
    });

    result.set(tableName, { schema, rows, createSql, insertSql });
  }

  return result;
}

async function runQueryMatrix() {
  console.log('╔════════════════════════════════════════════════════════════════════════╗');
  console.log('║        ExNihilo 95 — Comprehensive Multi-Pattern Query Matrix          ║');
  console.log('║        Testing 20 Distinct SQL Archetypes in In-Memory WASM Engine     ║');
  console.log('╚════════════════════════════════════════════════════════════════════════╝\n');

  const SQL = await initSqlJs();
  let db = new SQL.Database();
  const materializedTables = new Set();

  const testCases = [
    // 1. Aggregations with HAVING & Filter
    {
      id: 'AGG_01',
      category: 'Aggregations & Grouping',
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

  let passedCount = 0;
  let failedCount = 0;

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    console.log(`────────────────────────────────────────────────────────────────────────`);
    console.log(`Test #${i + 1} [${tc.id} - ${tc.dialect}]: ${tc.category}`);
    console.log(`Query: ${tc.sql.replace(/\s+/g, ' ').trim()}`);

    try {
      const startTime = performance.now();

      // Step 1: Infer Schemas & Synthesize Missing Data
      const schemas = inferSchemas(tc.sql, tc.dialect);
      const missingSchemas = new Map();
      for (const [tName, s] of schemas) {
        if (!materializedTables.has(tName)) {
          missingSchemas.set(tName, s);
        }
      }

      if (missingSchemas.size > 0) {
        const dataset = generateData(missingSchemas, 20);
        for (const [tblName, data] of dataset) {
          db.run(data.createSql);
          for (const ins of data.insertSql) {
            db.run(ins);
          }
          materializedTables.add(tblName);
        }
      }

      // Step 2: Normalize SQL for SQLite execution if SSMS brackets are used
      let executableSql = tc.sql;
      if (tc.dialect === 'SSMS') {
        executableSql = executableSql.replace(/\[/g, '"').replace(/\]/g, '"');
      }

      // Step 3: Execute in SQLite WASM
      const execResults = db.exec(executableSql);
      const durationMs = performance.now() - startTime;

      if (execResults.length === 0) {
        console.log(`Result: 0 rows returned (or DML executed) (${durationMs.toFixed(1)} ms)`);
      } else {
        execResults.forEach((r, idx) => {
          console.log(`Result set #${idx + 1}: ${r.values.length} rows | Columns: [${r.columns.join(', ')}]`);
          if (r.values.length > 0) {
            console.log(`Sample Row: ${JSON.stringify(r.values[0])}`);
          }
        });
      }

      console.log(`Outcome: ✓ PASS (${durationMs.toFixed(1)} ms)`);
      passedCount++;
    } catch (err) {
      console.error(`Outcome: ✗ FAIL -> ${err.message}`);
      failedCount++;
    }
  }

  console.log('\n════════════════════════════════════════════════════════════════════════');
  console.log(`TOTAL: ${testCases.length}  |  PASSED: ${passedCount}  |  FAILED: ${failedCount}`);

  if (failedCount === 0) {
    console.log('\n🎉 ALL 20 Complex Query Archetypes PASSED Flawlessly!');
  } else {
    console.log(`\n⚠️ ${failedCount} query tests failed.`);
  }
}

runQueryMatrix().catch(console.error);
