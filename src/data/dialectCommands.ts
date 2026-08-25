/**
 * dialectCommands.ts — Ultimate Exhaustive SQL Dictionary & Command Reference Matrix
 *
 * Comprehensive reference of ALL SQL commands, functions, operators, clauses, DDL, DML,
 * Triggers, Procedures, Views, Transactions, and Window Functions across MySQL, PostgreSQL,
 * SQLite, and MSSQL (Transact-SQL).
 *
 * Statuses:
 *  - 'supported': Executable directly in ExNihilo 95 in-memory engine (✅)
 *  - 'coming_soon': Advanced dialect features planned for future engine releases (⏳)
 */

export type DialectName = 'MySQL' | 'PostgreSQL' | 'SQLite' | 'TransactSQL';

export type CommandCategory =
  | 'DML & Querying'
  | 'DDL & Schema'
  | 'Triggers & Stored Logic'
  | 'Transactions & Locks'
  | 'Null Handling'
  | 'String Functions'
  | 'Date & Time'
  | 'JSON & Semi-Structured'
  | 'Aggregate & Math'
  | 'Advanced & Windowing';

export interface DialectVariation {
  dialect: DialectName;
  syntax: string;
  note?: string;
}

export interface SQLDictionaryItem {
  id: string;
  command: string;
  syntax: string;
  description: string;
  category: CommandCategory;
  dialects: DialectName[];
  status: 'supported' | 'coming_soon';
  example: string;
  notes?: string;
  dialectVariations?: DialectVariation[];
}

export const DIALECT_METADATA: Record<DialectName, { name: string; icon: string; tag: string }> = {
  MySQL: { name: 'MySQL 8.0+', icon: '🐬', tag: 'MySQL' },
  PostgreSQL: { name: 'PostgreSQL 16+', icon: '🐘', tag: 'PG' },
  SQLite: { name: 'SQLite 3.45+', icon: '🪶', tag: 'SQLite' },
  TransactSQL: { name: 'Microsoft T-SQL', icon: '🏢', tag: 'T-SQL' },
};

export const SQL_DICTIONARY_ITEMS: SQLDictionaryItem[] = [
  // ── 1. DML & Querying ──────────────────────────────────────────────────────
  {
    id: 'dml-select',
    command: 'SELECT',
    syntax: 'SELECT [DISTINCT] columns FROM table [WHERE conditions] [GROUP BY ...] [HAVING ...] [ORDER BY ...]',
    description: 'Retrieves data rows from one or more database tables.',
    category: 'DML & Querying',
    dialects: ['MySQL', 'PostgreSQL', 'SQLite', 'TransactSQL'],
    status: 'supported',
    example: 'SELECT id, name, salary FROM employees WHERE salary > 50000 ORDER BY salary DESC;',
    notes: 'The foundation of data querying across all SQL databases.'
  },
  {
    id: 'dml-insert',
    command: 'INSERT INTO',
    syntax: 'INSERT INTO table (col1, col2, ...) VALUES (val1, val2, ...);',
    description: 'Inserts new data records into a specified table.',
    category: 'DML & Querying',
    dialects: ['MySQL', 'PostgreSQL', 'SQLite', 'TransactSQL'],
    status: 'supported',
    example: "INSERT INTO customers (name, email, age) VALUES ('Alice Smith', 'alice@example.com', 28);",
    notes: 'Can insert single rows or multiple batch value rows in one query.'
  },
  {
    id: 'dml-update',
    command: 'UPDATE',
    syntax: 'UPDATE table SET col1 = val1, col2 = val2 WHERE condition;',
    description: 'Modifies existing row records in a table.',
    category: 'DML & Querying',
    dialects: ['MySQL', 'PostgreSQL', 'SQLite', 'TransactSQL'],
    status: 'supported',
    example: "UPDATE employees SET salary = salary * 1.10 WHERE department = 'Engineering';",
    notes: 'Always use a WHERE clause unless you intend to update every row in the table!'
  },
  {
    id: 'dml-delete',
    command: 'DELETE FROM',
    syntax: 'DELETE FROM table WHERE condition;',
    description: 'Removes rows from a table matching a specified condition.',
    category: 'DML & Querying',
    dialects: ['MySQL', 'PostgreSQL', 'SQLite', 'TransactSQL'],
    status: 'supported',
    example: "DELETE FROM orders WHERE status = 'cancelled' AND created_at < '2024-01-01';",
    notes: 'Deletes matching rows row-by-row and can be rolled back inside transactions.'
  },
  {
    id: 'dml-upsert',
    command: 'MERGE / UPSERT / ON CONFLICT / REPLACE INTO',
    syntax: 'INSERT INTO ... ON CONFLICT (col) DO UPDATE (PG/SQLite) OR REPLACE INTO (MySQL/SQLite) OR MERGE INTO (T-SQL)',
    description: 'Inserts a new record or updates the existing record if a key constraint collision occurs.',
    category: 'DML & Querying',
    dialects: ['MySQL', 'PostgreSQL', 'SQLite', 'TransactSQL'],
    status: 'supported',
    example: "INSERT INTO users (id, name, visits) VALUES (1, 'Alice', 1) ON CONFLICT(id) DO UPDATE SET visits = visits + 1;",
    dialectVariations: [
      { dialect: 'MySQL', syntax: 'INSERT INTO ... ON DUPLICATE KEY UPDATE visits = visits + 1 OR REPLACE INTO ...' },
      { dialect: 'PostgreSQL', syntax: 'INSERT INTO ... ON CONFLICT (id) DO UPDATE SET visits = users.visits + 1' },
      { dialect: 'SQLite', syntax: 'INSERT INTO ... ON CONFLICT(id) DO UPDATE SET visits = visits + 1 OR REPLACE INTO ...' },
      { dialect: 'TransactSQL', syntax: 'MERGE INTO target USING source ON target.id = source.id WHEN MATCHED THEN UPDATE ... WHEN NOT MATCHED THEN INSERT ...' },
    ]
  },
  {
    id: 'dml-where',
    command: 'WHERE',
    syntax: 'WHERE condition1 AND/OR condition2',
    description: 'Filters records based on conditional evaluation BEFORE aggregation.',
    category: 'DML & Querying',
    dialects: ['MySQL', 'PostgreSQL', 'SQLite', 'TransactSQL'],
    status: 'supported',
    example: "SELECT * FROM products WHERE price >= 100 AND category = 'Electronics';",
    notes: 'Evaluates row-by-row before GROUP BY and HAVING clauses.'
  },
  {
    id: 'dml-group-by',
    command: 'GROUP BY',
    syntax: 'GROUP BY column1, column2, ...',
    description: 'Groups rows sharing identical values into summary rows for aggregate calculations.',
    category: 'DML & Querying',
    dialects: ['MySQL', 'PostgreSQL', 'SQLite', 'TransactSQL'],
    status: 'supported',
    example: 'SELECT department, COUNT(*) AS emp_count, AVG(salary) FROM employees GROUP BY department;',
    notes: 'Every non-aggregated column in the SELECT list must be in the GROUP BY clause.'
  },
  {
    id: 'dml-having',
    command: 'HAVING',
    syntax: 'HAVING aggregate_condition',
    description: 'Filters aggregated group results AFTER the GROUP BY step has been performed.',
    category: 'DML & Querying',
    dialects: ['MySQL', 'PostgreSQL', 'SQLite', 'TransactSQL'],
    status: 'supported',
    example: 'SELECT department, COUNT(*) FROM employees GROUP BY department HAVING COUNT(*) > 5;',
    notes: 'Use WHERE for raw rows; use HAVING for grouped aggregate calculations.'
  },
  {
    id: 'dml-order-by',
    command: 'ORDER BY',
    syntax: 'ORDER BY column1 [ASC|DESC], column2 [ASC|DESC]',
    description: 'Sorts the query result set in ascending (ASC) or descending (DESC) order.',
    category: 'DML & Querying',
    dialects: ['MySQL', 'PostgreSQL', 'SQLite', 'TransactSQL'],
    status: 'supported',
    example: 'SELECT name, age, created_at FROM users ORDER BY age DESC, name ASC;',
    notes: 'Default sorting direction is ASC (ascending) if omitted.'
  },
  {
    id: 'dml-limit-offset',
    command: 'LIMIT / OFFSET / TOP / FETCH FIRST',
    syntax: 'LIMIT n OFFSET start (MySQL/PG/SQLite) OR SELECT TOP n (T-SQL) OR FETCH FIRST n ROWS ONLY',
    description: 'Restricts the maximum number of rows returned by a query for pagination.',
    category: 'DML & Querying',
    dialects: ['MySQL', 'PostgreSQL', 'SQLite', 'TransactSQL'],
    status: 'supported',
    example: 'SELECT id, title FROM posts ORDER BY created_at DESC LIMIT 10 OFFSET 20;',
    dialectVariations: [
      { dialect: 'MySQL', syntax: 'LIMIT 10 OFFSET 20' },
      { dialect: 'PostgreSQL', syntax: 'LIMIT 10 OFFSET 20 OR FETCH FIRST 10 ROWS ONLY' },
      { dialect: 'SQLite', syntax: 'LIMIT 10 OFFSET 20' },
      { dialect: 'TransactSQL', syntax: 'SELECT TOP 10 ... OR OFFSET 20 ROWS FETCH NEXT 10 ROWS ONLY' },
    ]
  },
  {
    id: 'dml-inner-join',
    command: 'INNER JOIN',
    syntax: 'SELECT ... FROM tableA INNER JOIN tableB ON tableA.key = tableB.key',
    description: 'Returns rows when there is a matching key in BOTH tables.',
    category: 'DML & Querying',
    dialects: ['MySQL', 'PostgreSQL', 'SQLite', 'TransactSQL'],
    status: 'supported',
    example: 'SELECT o.id, c.name, o.total FROM orders o INNER JOIN customers c ON o.customer_id = c.id;',
    notes: 'Excludes unmatched rows from either side.'
  },
  {
    id: 'dml-left-join',
    command: 'LEFT JOIN (LEFT OUTER JOIN)',
    syntax: 'SELECT ... FROM tableA LEFT JOIN tableB ON tableA.key = tableB.key',
    description: 'Returns ALL rows from the left table, and matched rows from the right table (NULL if no match).',
    category: 'DML & Querying',
    dialects: ['MySQL', 'PostgreSQL', 'SQLite', 'TransactSQL'],
    status: 'supported',
    example: 'SELECT c.name, o.id AS order_id FROM customers c LEFT JOIN orders o ON c.id = o.customer_id;',
    notes: 'Preserves left table records even if right table has 0 matching records.'
  },
  {
    id: 'dml-right-join',
    command: 'RIGHT JOIN (RIGHT OUTER JOIN)',
    syntax: 'SELECT ... FROM tableA RIGHT JOIN tableB ON tableA.key = tableB.key',
    description: 'Returns ALL rows from the right table, and matched rows from the left table.',
    category: 'DML & Querying',
    dialects: ['MySQL', 'PostgreSQL', 'TransactSQL'],
    status: 'supported',
    example: 'SELECT e.name, d.dept_name FROM employees e RIGHT JOIN departments d ON e.dept_id = d.id;',
    notes: 'Supported in MySQL, PG, and T-SQL. (In SQLite, rewrite as a LEFT JOIN).'
  },
  {
    id: 'dml-full-join',
    command: 'FULL OUTER JOIN',
    syntax: 'SELECT ... FROM tableA FULL JOIN tableB ON tableA.key = tableB.key',
    description: 'Returns all records when there is a match in EITHER left or right table records.',
    category: 'DML & Querying',
    dialects: ['PostgreSQL', 'TransactSQL'],
    status: 'coming_soon',
    example: 'SELECT a.col, b.col FROM tableA a FULL JOIN tableB b ON a.id = b.id;',
    notes: 'Supported natively in PG & T-SQL.'
  },
  {
    id: 'dml-cross-join',
    command: 'CROSS JOIN',
    syntax: 'SELECT ... FROM tableA CROSS JOIN tableB',
    description: 'Produces a Cartesian product combining every row of tableA with every row of tableB.',
    category: 'DML & Querying',
    dialects: ['MySQL', 'PostgreSQL', 'SQLite', 'TransactSQL'],
    status: 'supported',
    example: 'SELECT s.size, c.color FROM sizes s CROSS JOIN colors c;',
    notes: 'Result count equals (rows in A) × (rows in B).'
  },
  {
    id: 'dml-union',
    command: 'UNION / UNION ALL',
    syntax: 'SELECT col FROM tableA UNION [ALL] SELECT col FROM tableB',
    description: 'Combines the result sets of two or more SELECT queries into a single result set.',
    category: 'DML & Querying',
    dialects: ['MySQL', 'PostgreSQL', 'SQLite', 'TransactSQL'],
    status: 'supported',
    example: "SELECT email FROM customers UNION ALL SELECT email FROM leads;",
    notes: 'UNION removes duplicate rows; UNION ALL keeps all duplicates and runs faster.'
  },
  {
    id: 'dml-intersect-except',
    command: 'INTERSECT / EXCEPT (MINUS)',
    syntax: 'SELECT col FROM tableA INTERSECT | EXCEPT SELECT col FROM tableB',
    description: 'INTERSECT returns rows present in BOTH queries; EXCEPT returns rows in query 1 but NOT query 2.',
    category: 'DML & Querying',
    dialects: ['MySQL', 'PostgreSQL', 'SQLite', 'TransactSQL'],
    status: 'supported',
    example: 'SELECT user_id FROM active_2023 INTERSECT SELECT user_id FROM active_2024;',
    dialectVariations: [
      { dialect: 'MySQL', syntax: 'INTERSECT / EXCEPT (MySQL 8.0+)' },
      { dialect: 'PostgreSQL', syntax: 'INTERSECT / EXCEPT' },
      { dialect: 'SQLite', syntax: 'INTERSECT / EXCEPT' },
      { dialect: 'TransactSQL', syntax: 'INTERSECT / EXCEPT' },
    ]
  },
  {
    id: 'dml-case-when',
    command: 'CASE WHEN',
    syntax: 'CASE WHEN cond1 THEN res1 WHEN cond2 THEN res2 ELSE default_res END',
    description: 'Evaluates conditional logic expressions inside SELECT or UPDATE statements.',
    category: 'DML & Querying',
    dialects: ['MySQL', 'PostgreSQL', 'SQLite', 'TransactSQL'],
    status: 'supported',
    example: "SELECT name, salary, CASE WHEN salary > 80000 THEN 'Senior' WHEN salary > 50000 THEN 'Mid' ELSE 'Junior' END AS tier FROM employees;",
    notes: 'Standard ANSI SQL conditional control flow.'
  },
  {
    id: 'dml-in',
    command: 'IN / NOT IN',
    syntax: 'WHERE column IN (val1, val2, ...) OR WHERE column IN (SELECT ...)',
    description: 'Checks whether a column value matches any value in a list or subquery.',
    category: 'DML & Querying',
    dialects: ['MySQL', 'PostgreSQL', 'SQLite', 'TransactSQL'],
    status: 'supported',
    example: "SELECT * FROM orders WHERE status IN ('pending', 'processing', 'shipped');",
    notes: 'Efficient alternative to multiple OR conditions.'
  },
  {
    id: 'dml-between',
    command: 'BETWEEN',
    syntax: 'WHERE column BETWEEN low AND high',
    description: 'Filters values within an inclusive range (low <= val <= high).',
    category: 'DML & Querying',
    dialects: ['MySQL', 'PostgreSQL', 'SQLite', 'TransactSQL'],
    status: 'supported',
    example: "SELECT * FROM sales WHERE sale_date BETWEEN '2024-01-01' AND '2024-03-31';",
    notes: 'Includes both boundary values.'
  },
  {
    id: 'dml-like',
    command: 'LIKE / ILIKE',
    syntax: "WHERE column LIKE 'pattern%' (% wildcard, _ single char)",
    description: 'Performs pattern matching string comparison with wildcard characters.',
    category: 'DML & Querying',
    dialects: ['MySQL', 'PostgreSQL', 'SQLite', 'TransactSQL'],
    status: 'supported',
    example: "SELECT * FROM users WHERE email LIKE '%@gmail.com';",
    dialectVariations: [
      { dialect: 'MySQL', syntax: "email LIKE '%@gmail.com'" },
      { dialect: 'PostgreSQL', syntax: "email ILIKE '%@gmail.com'", note: 'ILIKE provides explicit case-insensitive matching' },
      { dialect: 'SQLite', syntax: "email LIKE '%@gmail.com'" },
      { dialect: 'TransactSQL', syntax: "email LIKE '%@gmail.com'" },
    ]
  },
  {
    id: 'dml-exists',
    command: 'EXISTS / NOT EXISTS',
    syntax: 'WHERE EXISTS (SELECT 1 FROM subtable WHERE subtable.id = maintable.id)',
    description: 'Tests for the existence of any records in a subquery.',
    category: 'DML & Querying',
    dialects: ['MySQL', 'PostgreSQL', 'SQLite', 'TransactSQL'],
    status: 'supported',
    example: 'SELECT c.name FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id);',
    notes: 'Returns TRUE as soon as the first matching row is found in the subquery.'
  },

  // ── 2. DDL & Schema ────────────────────────────────────────────────────────
  {
    id: 'ddl-create-table',
    command: 'CREATE TABLE',
    syntax: 'CREATE TABLE table_name (col1 datatype constraints, col2 datatype, ...);',
    description: 'Creates a new table structure in the database schema.',
    category: 'DDL & Schema',
    dialects: ['MySQL', 'PostgreSQL', 'SQLite', 'TransactSQL'],
    status: 'supported',
    example: 'CREATE TABLE users (id INT PRIMARY KEY, name VARCHAR(100), email VARCHAR(255) UNIQUE);',
    notes: 'Supports INT, VARCHAR, TEXT, DATETIME, DECIMAL, BOOLEAN data types.'
  },
  {
    id: 'ddl-alter-table',
    command: 'ALTER TABLE',
    syntax: 'ALTER TABLE table_name ADD/DROP/MODIFY column_name datatype;',
    description: 'Modifies an existing table structure (adding, renaming, or dropping columns).',
    category: 'DDL & Schema',
    dialects: ['MySQL', 'PostgreSQL', 'SQLite', 'TransactSQL'],
    status: 'supported',
    example: 'ALTER TABLE users ADD COLUMN phone_number VARCHAR(20);',
    notes: 'SQLite supports ADD COLUMN and RENAME COLUMN.'
  },
  {
    id: 'ddl-drop-table',
    command: 'DROP TABLE',
    syntax: 'DROP TABLE [IF EXISTS] table_name;',
    description: 'Permanently removes a table schema and all contained data from the database.',
    category: 'DDL & Schema',
    dialects: ['MySQL', 'PostgreSQL', 'SQLite', 'TransactSQL'],
    status: 'supported',
    example: 'DROP TABLE IF EXISTS old_logs;',
    notes: 'Irreversible DDL operation.'
  },
  {
    id: 'ddl-truncate-table',
    command: 'TRUNCATE TABLE',
    syntax: 'TRUNCATE TABLE table_name;',
    description: 'Deletes all records from a table quickly by deallocating pages (resets auto-increment IDs).',
    category: 'DDL & Schema',
    dialects: ['MySQL', 'PostgreSQL', 'TransactSQL'],
    status: 'coming_soon',
    example: 'TRUNCATE TABLE staging_events;',
    notes: 'Faster than DELETE FROM table.'
  },
  {
    id: 'ddl-create-index',
    command: 'CREATE INDEX',
    syntax: 'CREATE [UNIQUE] INDEX index_name ON table_name (col1, col2);',
    description: 'Creates a B-Tree index on specified table columns to accelerate query lookups.',
    category: 'DDL & Schema',
    dialects: ['MySQL', 'PostgreSQL', 'SQLite', 'TransactSQL'],
    status: 'supported',
    example: 'CREATE INDEX idx_users_email ON users (email);',
    notes: 'Speed up SELECT queries; slightly slows down INSERT/UPDATE writes.'
  },
  {
    id: 'ddl-create-view',
    command: 'CREATE VIEW',
    syntax: 'CREATE VIEW view_name AS SELECT query;',
    description: 'Creates a virtual table based on the result-set of a SELECT query.',
    category: 'DDL & Schema',
    dialects: ['MySQL', 'PostgreSQL', 'SQLite', 'TransactSQL'],
    status: 'coming_soon',
    example: 'CREATE VIEW active_customers AS SELECT id, name, email FROM customers WHERE active = 1;',
    notes: 'Views do not store physical data unless materialized.'
  },
  {
    id: 'ddl-constraints',
    command: 'PRIMARY KEY / FOREIGN KEY / CHECK / UNIQUE',
    syntax: 'CONSTRAINT fk_name FOREIGN KEY (col) REFERENCES parent_table(id) ON DELETE CASCADE',
    description: 'Enforces data integrity, foreign key references, and validation rules on table columns.',
    category: 'DDL & Schema',
    dialects: ['MySQL', 'PostgreSQL', 'SQLite', 'TransactSQL'],
    status: 'supported',
    example: 'CREATE TABLE orders (id INT PRIMARY KEY, customer_id INT, CONSTRAINT fk_cust FOREIGN KEY (customer_id) REFERENCES customers(id));',
    notes: 'FOREIGN KEY constraints trigger parent-child table validation.'
  },
  {
    id: 'ddl-create-schema-db',
    command: 'CREATE DATABASE / CREATE SCHEMA',
    syntax: 'CREATE DATABASE db_name; OR CREATE SCHEMA schema_name;',
    description: 'Creates a new database namespace or schema container.',
    category: 'DDL & Schema',
    dialects: ['MySQL', 'PostgreSQL', 'TransactSQL'],
    status: 'coming_soon',
    example: 'CREATE SCHEMA analytics_mart;',
    notes: 'Organizes tables into logical namespaces.'
  },

  // ── 3. Triggers & Stored Logic ──────────────────────────────────────────────
  {
    id: 'logic-create-trigger',
    command: 'CREATE TRIGGER',
    syntax: 'CREATE TRIGGER trigger_name BEFORE/AFTER INSERT/UPDATE/DELETE ON table FOR EACH ROW BEGIN ... END;',
    description: 'Executes automatic procedural SQL code when an INSERT, UPDATE, or DELETE operation occurs on a table.',
    category: 'Triggers & Stored Logic',
    dialects: ['MySQL', 'PostgreSQL', 'SQLite', 'TransactSQL'],
    status: 'coming_soon',
    example: 'CREATE TRIGGER audit_log AFTER UPDATE ON accounts FOR EACH ROW INSERT INTO logs (account_id, old_bal, new_bal) VALUES (OLD.id, OLD.balance, NEW.balance);',
    dialectVariations: [
      { dialect: 'MySQL', syntax: 'CREATE TRIGGER ... BEFORE/AFTER ... FOR EACH ROW BEGIN ... END' },
      { dialect: 'PostgreSQL', syntax: 'CREATE TRIGGER ... BEFORE/AFTER ... EXECUTE FUNCTION func_name()' },
      { dialect: 'SQLite', syntax: 'CREATE TRIGGER ... BEFORE/AFTER ... BEGIN ... END;' },
      { dialect: 'TransactSQL', syntax: 'CREATE TRIGGER ... ON table AFTER/INSTEAD OF ... AS BEGIN ... END' },
    ],
    notes: 'Invaluable for automated audit logging, data validation, and cascading changes.'
  },
  {
    id: 'logic-create-procedure',
    command: 'CREATE PROCEDURE / CREATE FUNCTION',
    syntax: 'CREATE PROCEDURE proc_name(IN param1 INT) BEGIN ... END; OR CREATE FUNCTION func_name(...) RETURNS type AS ...',
    description: 'Stores reusable parameterized SQL business logic on the database server.',
    category: 'Triggers & Stored Logic',
    dialects: ['MySQL', 'PostgreSQL', 'TransactSQL'],
    status: 'coming_soon',
    example: 'CREATE PROCEDURE TransferFunds(IN src INT, IN dest INT, IN amt DECIMAL) BEGIN ... END;',
    notes: 'Encapsulates complex multi-statement transaction logic.'
  },

  // ── 4. Transactions & Locks ────────────────────────────────────────────────
  {
    id: 'tx-transactions',
    command: 'BEGIN / COMMIT / ROLLBACK / SAVEPOINT',
    syntax: 'BEGIN TRANSACTION; ... COMMIT; OR ROLLBACK;',
    description: 'Manages ACID-compliant transaction boundaries to guarantee atomic database operations.',
    category: 'Transactions & Locks',
    dialects: ['MySQL', 'PostgreSQL', 'SQLite', 'TransactSQL'],
    status: 'coming_soon',
    example: 'BEGIN TRANSACTION; UPDATE accounts SET balance = balance - 100 WHERE id = 1; UPDATE accounts SET balance = balance + 100 WHERE id = 2; COMMIT;',
    notes: 'Ensures that all statements succeed together or none are applied.'
  },

  // ── 5. Null Handling ───────────────────────────────────────────────────────
  {
    id: 'null-coalesce',
    command: 'COALESCE()',
    syntax: 'COALESCE(val1, val2, ...)',
    description: 'Returns the first non-NULL value from a list of expressions.',
    category: 'Null Handling',
    dialects: ['MySQL', 'PostgreSQL', 'SQLite', 'TransactSQL'],
    status: 'supported',
    example: "SELECT COALESCE(email, phone, 'No Contact Info') AS contact FROM users;",
    notes: 'Standard ANSI SQL supported across all 4 database engines.'
  },
  {
    id: 'null-nullif',
    command: 'NULLIF()',
    syntax: 'NULLIF(expr1, expr2)',
    description: 'Returns NULL if expr1 equals expr2; otherwise returns expr1. Useful for preventing division by zero.',
    category: 'Null Handling',
    dialects: ['MySQL', 'PostgreSQL', 'SQLite', 'TransactSQL'],
    status: 'supported',
    example: 'SELECT total / NULLIF(item_count, 0) AS avg_item_price FROM orders;',
    notes: 'Prevents Division by Zero errors gracefully.'
  },
  {
    id: 'null-ifnull-isnull',
    command: 'IFNULL() / ISNULL() / NVL()',
    syntax: 'IFNULL(val, fallback) (MySQL/SQLite) OR ISNULL(val, fallback) (T-SQL)',
    description: 'Replaces NULL values with a specified fallback value.',
    category: 'Null Handling',
    dialects: ['MySQL', 'PostgreSQL', 'SQLite', 'TransactSQL'],
    status: 'supported',
    example: "SELECT IFNULL(discount, 0.00) AS applied_discount FROM products;",
    dialectVariations: [
      { dialect: 'MySQL', syntax: 'IFNULL(val, fallback)' },
      { dialect: 'PostgreSQL', syntax: 'COALESCE(val, fallback)' },
      { dialect: 'SQLite', syntax: 'IFNULL(val, fallback)' },
      { dialect: 'TransactSQL', syntax: 'ISNULL(val, fallback)' },
    ]
  },
  {
    id: 'null-greatest-least',
    command: 'GREATEST() / LEAST()',
    syntax: 'GREATEST(val1, val2, ...) / LEAST(val1, val2, ...)',
    description: 'Returns the maximum or minimum value from a list of scalar expressions.',
    category: 'Null Handling',
    dialects: ['MySQL', 'PostgreSQL', 'SQLite'],
    status: 'supported',
    example: 'SELECT GREATEST(score1, score2, score3) AS highest_score FROM evaluations;',
    notes: 'Evaluates across columns for a single row.'
  },

  // ── 6. String Functions ────────────────────────────────────────────────────
  {
    id: 'str-concat',
    command: 'CONCAT() / CONCAT_WS() / || / +',
    syntax: 'CONCAT(str1, str2, ...) OR str1 || str2 (PG/SQLite) OR str1 + str2 (T-SQL)',
    description: 'Concatenates two or more strings together into a single string.',
    category: 'String Functions',
    dialects: ['MySQL', 'PostgreSQL', 'SQLite', 'TransactSQL'],
    status: 'supported',
    example: "SELECT CONCAT(first_name, ' ', last_name) AS full_name FROM employees;",
    dialectVariations: [
      { dialect: 'MySQL', syntax: "CONCAT(first_name, ' ', last_name)" },
      { dialect: 'PostgreSQL', syntax: "first_name || ' ' || last_name OR CONCAT(...)" },
      { dialect: 'SQLite', syntax: "first_name || ' ' || last_name" },
      { dialect: 'TransactSQL', syntax: "first_name + ' ' + last_name OR CONCAT(...)" },
    ]
  },
  {
    id: 'str-substring',
    command: 'SUBSTRING() / SUBSTR()',
    syntax: 'SUBSTRING(string, start_pos, length) OR SUBSTR(string, start_pos, length)',
    description: 'Extracts a portion of text starting at a specific position for a specified length.',
    category: 'String Functions',
    dialects: ['MySQL', 'PostgreSQL', 'SQLite', 'TransactSQL'],
    status: 'supported',
    example: "SELECT SUBSTRING(email, 1, 5) AS email_prefix FROM users;",
    notes: 'SQL string indexes are 1-based (not 0-based).'
  },
  {
    id: 'str-length',
    command: 'LENGTH() / LEN()',
    syntax: 'LENGTH(str) (MySQL/PG/SQLite) OR LEN(str) (T-SQL)',
    description: 'Returns the character length of a text string.',
    category: 'String Functions',
    dialects: ['MySQL', 'PostgreSQL', 'SQLite', 'TransactSQL'],
    status: 'supported',
    example: 'SELECT name, LENGTH(name) AS name_len FROM users ORDER BY name_len DESC;',
    dialectVariations: [
      { dialect: 'MySQL', syntax: 'LENGTH(str) / CHAR_LENGTH(str)' },
      { dialect: 'PostgreSQL', syntax: 'LENGTH(str)' },
      { dialect: 'SQLite', syntax: 'LENGTH(str)' },
      { dialect: 'TransactSQL', syntax: 'LEN(str)' },
    ]
  },
  {
    id: 'str-casing',
    command: 'UPPER() / LOWER()',
    syntax: 'UPPER(str) / LOWER(str)',
    description: 'Converts a text string to uppercase or lowercase letters.',
    category: 'String Functions',
    dialects: ['MySQL', 'PostgreSQL', 'SQLite', 'TransactSQL'],
    status: 'supported',
    example: 'SELECT UPPER(code) AS code_upper, LOWER(email) AS email_clean FROM users;',
    notes: 'Essential for case-neutral comparisons.'
  },
  {
    id: 'str-trim',
    command: 'TRIM() / LTRIM() / RTRIM()',
    syntax: 'TRIM(str) / LTRIM(str) / RTRIM(str)',
    description: 'Removes leading and trailing whitespace characters from string data.',
    category: 'String Functions',
    dialects: ['MySQL', 'PostgreSQL', 'SQLite', 'TransactSQL'],
    status: 'supported',
    example: "SELECT TRIM('   hello world   ') AS clean_text;",
    notes: 'LTRIM strips left spaces; RTRIM strips right spaces.'
  },
  {
    id: 'str-replace',
    command: 'REPLACE()',
    syntax: 'REPLACE(string, search_str, replacement_str)',
    description: 'Replaces all occurrences of a specified substring with a new substring.',
    category: 'String Functions',
    dialects: ['MySQL', 'PostgreSQL', 'SQLite', 'TransactSQL'],
    status: 'supported',
    example: "SELECT REPLACE(phone, '-', '') AS clean_phone FROM contacts;",
    notes: 'Replaces all matching substring instances.'
  },
  {
    id: 'str-instr-position',
    command: 'INSTR() / POSITION() / CHARINDEX()',
    syntax: 'INSTR(string, search) OR POSITION(search IN string) OR CHARINDEX(search, string)',
    description: 'Finds the 1-based character position index of a substring within a text string.',
    category: 'String Functions',
    dialects: ['MySQL', 'PostgreSQL', 'SQLite', 'TransactSQL'],
    status: 'supported',
    example: "SELECT INSTR(email, '@') AS domain_start FROM users;",
    dialectVariations: [
      { dialect: 'MySQL', syntax: "INSTR(email, '@')" },
      { dialect: 'PostgreSQL', syntax: "POSITION('@' IN email)" },
      { dialect: 'SQLite', syntax: "INSTR(email, '@')" },
      { dialect: 'TransactSQL', syntax: "CHARINDEX('@', email)" },
    ]
  },
  {
    id: 'str-pad',
    command: 'LPAD() / RPAD()',
    syntax: 'LPAD(string, total_length, pad_char) / RPAD(...)',
    description: 'Pads a string on the left or right with specified characters to reach a target length.',
    category: 'String Functions',
    dialects: ['MySQL', 'PostgreSQL', 'SQLite'],
    status: 'supported',
    example: "SELECT LPAD(account_id, 8, '0') AS formatted_account FROM accounts;",
    notes: 'Common for formatting fixed-width invoice numbers and codes.'
  },
  {
    id: 'str-group-concat',
    command: 'GROUP_CONCAT() / STRING_AGG()',
    syntax: 'GROUP_CONCAT(col SEPARATOR ",") (MySQL/SQLite) OR STRING_AGG(col, ",") (PG/T-SQL)',
    description: 'Concatenates string values from multiple grouped rows into a single delimited string.',
    category: 'String Functions',
    dialects: ['MySQL', 'PostgreSQL', 'SQLite', 'TransactSQL'],
    status: 'coming_soon',
    example: 'SELECT dept_id, GROUP_CONCAT(name SEPARATOR ", ") AS members FROM employees GROUP BY dept_id;',
    dialectVariations: [
      { dialect: 'MySQL', syntax: "GROUP_CONCAT(name SEPARATOR ', ')" },
      { dialect: 'PostgreSQL', syntax: "STRING_AGG(name, ', ')" },
      { dialect: 'SQLite', syntax: "GROUP_CONCAT(name, ', ')" },
      { dialect: 'TransactSQL', syntax: "STRING_AGG(name, ', ')" },
    ]
  },

  // ── 7. Date & Time ─────────────────────────────────────────────────────────
  {
    id: 'date-now',
    command: 'NOW() / CURRENT_TIMESTAMP',
    syntax: 'NOW() OR CURRENT_TIMESTAMP OR GETDATE() (T-SQL)',
    description: 'Returns the current date and time timestamp from the database clock.',
    category: 'Date & Time',
    dialects: ['MySQL', 'PostgreSQL', 'SQLite', 'TransactSQL'],
    status: 'supported',
    example: 'SELECT NOW() AS current_time_stamp;',
    dialectVariations: [
      { dialect: 'MySQL', syntax: 'NOW() / CURRENT_TIMESTAMP()' },
      { dialect: 'PostgreSQL', syntax: 'NOW() / CURRENT_TIMESTAMP' },
      { dialect: 'SQLite', syntax: "DATETIME('now') / CURRENT_TIMESTAMP" },
      { dialect: 'TransactSQL', syntax: 'GETDATE() / CURRENT_TIMESTAMP' },
    ]
  },
  {
    id: 'date-formatting',
    command: 'DATE_FORMAT() / TO_CHAR() / STRFTIME() / FORMAT()',
    syntax: 'DATE_FORMAT(date, fmt) (MySQL) | TO_CHAR(date, fmt) (PG) | STRFTIME(fmt, date) (SQLite) | FORMAT(date, fmt) (T-SQL)',
    description: 'Formats a date or timestamp value according to a custom specified format pattern.',
    category: 'Date & Time',
    dialects: ['MySQL', 'PostgreSQL', 'SQLite', 'TransactSQL'],
    status: 'supported',
    example: "SELECT DATE_FORMAT(created_at, '%Y-%m-%d') AS date_formatted FROM orders;",
    dialectVariations: [
      { dialect: 'MySQL', syntax: "DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s')" },
      { dialect: 'PostgreSQL', syntax: "TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS')" },
      { dialect: 'SQLite', syntax: "STRFTIME('%Y-%m-%d %H:%M:%S', created_at)" },
      { dialect: 'TransactSQL', syntax: "FORMAT(created_at, 'yyyy-MM-dd HH:mm:ss')" },
    ]
  },
  {
    id: 'date-extract',
    command: 'EXTRACT() / DATEPART() / YEAR() / MONTH()',
    syntax: 'EXTRACT(part FROM date) OR DATEPART(part, date) OR YEAR(date)',
    description: 'Extracts a specific sub-component (year, month, day, hour) from a date value.',
    category: 'Date & Time',
    dialects: ['MySQL', 'PostgreSQL', 'SQLite', 'TransactSQL'],
    status: 'supported',
    example: 'SELECT EXTRACT(YEAR FROM created_at) AS order_year, COUNT(*) FROM orders GROUP BY order_year;',
    notes: 'Standard ANSI EXTRACT supported in MySQL and PostgreSQL.'
  },
  {
    id: 'date-math',
    command: 'DATEADD() / DATEDIFF() / INTERVAL',
    syntax: 'DATE_ADD(date, INTERVAL n unit) OR DATEADD(part, n, date) OR DATEDIFF(date1, date2)',
    description: 'Performs date arithmetic (adding time intervals or calculating differences between dates).',
    category: 'Date & Time',
    dialects: ['MySQL', 'PostgreSQL', 'SQLite', 'TransactSQL'],
    status: 'coming_soon',
    example: "SELECT DATE_ADD(NOW(), INTERVAL 30 DAY) AS in_30_days;",
    dialectVariations: [
      { dialect: 'MySQL', syntax: 'DATE_ADD(created_at, INTERVAL 7 DAY)' },
      { dialect: 'PostgreSQL', syntax: "created_at + INTERVAL '7 days'" },
      { dialect: 'SQLite', syntax: "DATE(created_at, '+7 days')" },
      { dialect: 'TransactSQL', syntax: 'DATEADD(day, 7, created_at)' },
    ]
  },

  // ── 8. JSON & Semi-Structured ──────────────────────────────────────────────
  {
    id: 'json-extract',
    command: 'JSON_EXTRACT() / JSON_VALUE() / -> / ->>',
    syntax: "JSON_EXTRACT(json_doc, '$.path') OR json_col->'key' (PG) OR JSON_VALUE(json_doc, '$.path') (T-SQL)",
    description: 'Extracts a value, array element, or scalar property from a JSON string column.',
    category: 'JSON & Semi-Structured',
    dialects: ['MySQL', 'PostgreSQL', 'SQLite', 'TransactSQL'],
    status: 'supported',
    example: "SELECT id, JSON_EXTRACT(attributes, '$.color') AS item_color FROM products;",
    dialectVariations: [
      { dialect: 'MySQL', syntax: "JSON_EXTRACT(metadata, '$.user.role')" },
      { dialect: 'PostgreSQL', syntax: "metadata->'user'->>'role'" },
      { dialect: 'SQLite', syntax: "JSON_EXTRACT(metadata, '$.user.role')" },
      { dialect: 'TransactSQL', syntax: "JSON_VALUE(metadata, '$.user.role')" },
    ]
  },
  {
    id: 'json-query',
    command: 'JSON_QUERY() / JSON_ARRAY() / JSON_OBJECT()',
    syntax: "JSON_QUERY(json_doc, '$.path') OR JSON_ARRAY(val1, val2) OR JSON_OBJECT(key, val)",
    description: 'Constructs or queries complex JSON objects and array fragments.',
    category: 'JSON & Semi-Structured',
    dialects: ['MySQL', 'PostgreSQL', 'TransactSQL'],
    status: 'supported',
    example: "SELECT JSON_QUERY(payload, '$.items') AS items_array FROM webhooks;",
    notes: 'Preserves JSON formatting without unquoting.'
  },

  // ── 9. Aggregate & Math ────────────────────────────────────────────────────
  {
    id: 'agg-count',
    command: 'COUNT()',
    syntax: 'COUNT(*) OR COUNT(column) OR COUNT(DISTINCT column)',
    description: 'Counts the total number of rows matching the query condition.',
    category: 'Aggregate & Math',
    dialects: ['MySQL', 'PostgreSQL', 'SQLite', 'TransactSQL'],
    status: 'supported',
    example: 'SELECT COUNT(*) AS total_users, COUNT(DISTINCT country) AS unique_countries FROM users;',
    notes: 'COUNT(*) counts all rows including NULLs; COUNT(column) ignores NULLs.'
  },
  {
    id: 'agg-sum-avg',
    command: 'SUM() / AVG()',
    syntax: 'SUM(numeric_col) / AVG(numeric_col)',
    description: 'Calculates the total sum or arithmetic mean average of a numeric column.',
    category: 'Aggregate & Math',
    dialects: ['MySQL', 'PostgreSQL', 'SQLite', 'TransactSQL'],
    status: 'supported',
    example: 'SELECT department, SUM(salary) AS total_payroll, AVG(salary) AS avg_salary FROM employees GROUP BY department;',
    notes: 'Ignores NULL values during calculation.'
  },
  {
    id: 'agg-min-max',
    command: 'MIN() / MAX()',
    syntax: 'MIN(column) / MAX(column)',
    description: 'Finds the minimum or maximum value in a set of values.',
    category: 'Aggregate & Math',
    dialects: ['MySQL', 'PostgreSQL', 'SQLite', 'TransactSQL'],
    status: 'supported',
    example: 'SELECT MIN(price) AS lowest_price, MAX(price) AS highest_price FROM products;',
    notes: 'Works on numbers, dates, and text columns.'
  },
  {
    id: 'math-round-abs',
    command: 'ROUND() / ABS() / CEIL() / FLOOR()',
    syntax: 'ROUND(val, decimals) / ABS(val) / CEIL(val) / FLOOR(val)',
    description: 'Performs standard mathematical rounding, absolute value, ceiling, or floor calculations.',
    category: 'Aggregate & Math',
    dialects: ['MySQL', 'PostgreSQL', 'SQLite', 'TransactSQL'],
    status: 'supported',
    example: 'SELECT price, ROUND(price, 1) AS rounded_price, ABS(balance) FROM accounts;',
    notes: 'Standard mathematical scalar functions.'
  },

  // ── 10. Advanced & Windowing ───────────────────────────────────────────────
  {
    id: 'win-row-number',
    command: 'ROW_NUMBER() OVER()',
    syntax: 'ROW_NUMBER() OVER (PARTITION BY group_col ORDER BY sort_col)',
    description: 'Assigns a sequential integer rank number to each row within a partition.',
    category: 'Advanced & Windowing',
    dialects: ['MySQL', 'PostgreSQL', 'SQLite', 'TransactSQL'],
    status: 'coming_soon',
    example: 'SELECT name, department, salary, ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC) AS rank FROM employees;',
    notes: 'Essential for Top-N per group queries.'
  },
  {
    id: 'win-rank-dense',
    command: 'RANK() / DENSE_RANK() OVER()',
    syntax: 'RANK() OVER (...) OR DENSE_RANK() OVER (...)',
    description: 'Ranks rows with tied values (RANK skips numbers after ties; DENSE_RANK does not skip).',
    category: 'Advanced & Windowing',
    dialects: ['MySQL', 'PostgreSQL', 'SQLite', 'TransactSQL'],
    status: 'coming_soon',
    example: 'SELECT name, score, DENSE_RANK() OVER (ORDER BY score DESC) AS position FROM leaderboard;',
    notes: 'DENSE_RANK produces 1, 2, 2, 3 while RANK produces 1, 2, 2, 4.'
  },
  {
    id: 'win-lead-lag',
    command: 'LEAD() / LAG() OVER()',
    syntax: 'LEAD(col, offset) OVER (...) OR LAG(col, offset) OVER (...)',
    description: 'Accesses data from a subsequent (LEAD) or previous (LAG) row without self-joins.',
    category: 'Advanced & Windowing',
    dialects: ['MySQL', 'PostgreSQL', 'SQLite', 'TransactSQL'],
    status: 'coming_soon',
    example: 'SELECT sale_date, revenue, LAG(revenue, 1) OVER (ORDER BY sale_date) AS prev_revenue FROM daily_sales;',
    notes: 'Invaluable for period-over-period growth calculations.'
  },
  {
    id: 'cte-with',
    command: 'WITH (Common Table Expressions / CTE)',
    syntax: 'WITH cte_name AS (SELECT ...) SELECT * FROM cte_name',
    description: 'Defines a temporary named result set that can be referenced within a SELECT, INSERT, UPDATE, or DELETE statement.',
    category: 'Advanced & Windowing',
    dialects: ['MySQL', 'PostgreSQL', 'SQLite', 'TransactSQL'],
    status: 'supported',
    example: 'WITH dept_avg AS (SELECT department, AVG(salary) AS avg_sal FROM employees GROUP BY department) SELECT e.name, e.salary, d.avg_sal FROM employees e JOIN dept_avg d ON e.department = d.department WHERE e.salary > d.avg_sal;',
    notes: 'Improves query readability over nested subqueries.'
  },
  {
    id: 'cte-recursive',
    command: 'WITH RECURSIVE',
    syntax: 'WITH RECURSIVE cte_name AS (base_query UNION ALL recursive_query) SELECT * FROM cte_name',
    description: 'Performs recursive queries to traverse hierarchical data structures (org charts, tree structures, graph networks).',
    category: 'Advanced & Windowing',
    dialects: ['MySQL', 'PostgreSQL', 'SQLite', 'TransactSQL'],
    status: 'coming_soon',
    example: 'WITH RECURSIVE org AS (SELECT id, name, manager_id, 1 AS depth FROM employees WHERE manager_id IS NULL UNION ALL SELECT e.id, e.name, e.manager_id, o.depth + 1 FROM employees e JOIN org o ON e.manager_id = o.id) SELECT * FROM org;',
    notes: 'Standard ANSI SQL syntax for hierarchical tree traversal.'
  }
];
