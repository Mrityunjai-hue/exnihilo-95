/**
 * dialectCommands.ts — Comprehensive SQL Dictionary & Command Matrix
 *
 * Exhaustive database of SQL commands, functions, and operators across
 * MySQL, PostgreSQL, SQLite, and MSSQL (T-SQL).
 *
 * Statuses:
 *  - 'supported': Executable in ExNihilo 95 in-memory engine (✅)
 *  - 'coming_soon': Planned advanced feature (⏳)
 */

export type DialectName = 'MySQL' | 'PostgreSQL' | 'SQLite' | 'TransactSQL';

export type CommandCategory =
  | 'String Functions'
  | 'Date & Time'
  | 'JSON & Semi-Structured'
  | 'Null Handling'
  | 'Aggregate & Math'
  | 'DDL & Schema'
  | 'DML & Querying'
  | 'Advanced & Windowing';

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
}

export const SQL_DICTIONARY_ITEMS: SQLDictionaryItem[] = [
  // ── Null Handling ──────────────────────────────────────────────────────────
  {
    id: 'null-coalesce',
    command: 'COALESCE()',
    syntax: 'COALESCE(val1, val2, ...)',
    description: 'Evaluates the arguments in order and returns the first non-NULL value.',
    category: 'Null Handling',
    dialects: ['MySQL', 'PostgreSQL', 'SQLite', 'TransactSQL'],
    status: 'supported',
    example: "SELECT COALESCE(email, phone, 'No Contact Info') AS contact FROM users;",
    notes: 'Standard ANSI SQL supported natively across all 4 database engines.'
  },
  {
    id: 'null-nullif',
    command: 'NULLIF()',
    syntax: 'NULLIF(expr1, expr2)',
    description: 'Returns NULL if expr1 equals expr2; otherwise returns expr1.',
    category: 'Null Handling',
    dialects: ['MySQL', 'PostgreSQL', 'SQLite', 'TransactSQL'],
    status: 'supported',
    example: "SELECT name, NULLIF(age, 0) AS age_or_null FROM customers;",
    notes: 'Useful for preventing division-by-zero errors in calculations.'
  },
  {
    id: 'null-ifnull',
    command: 'IFNULL() / ISNULL()',
    syntax: 'IFNULL(val, default) [MySQL/SQLite] | ISNULL(val, default) [MSSQL]',
    description: 'Replaces NULL with a specified fallback value (dialect shortcut for 2-arg COALESCE).',
    category: 'Null Handling',
    dialects: ['MySQL', 'SQLite', 'TransactSQL'],
    status: 'supported',
    example: "SELECT name, IFNULL(discount, 0) AS final_discount FROM orders;",
    notes: 'MySQL and SQLite use IFNULL(); MSSQL uses ISNULL(). Use COALESCE() for cross-dialect compatibility.'
  },
  {
    id: 'null-nvl',
    command: 'NVL()',
    syntax: 'NVL(expr1, replace_with)',
    description: 'Oracle / PL-SQL null replacement function.',
    category: 'Null Handling',
    dialects: ['PostgreSQL'],
    status: 'coming_soon',
    example: "SELECT NVL(commission, 0) FROM employees;",
    notes: 'Available in Oracle and PostgreSQL via compatibility extensions.'
  },

  // ── String Functions ───────────────────────────────────────────────────────
  {
    id: 'str-concat-func',
    command: 'CONCAT()',
    syntax: 'CONCAT(str1, str2, ...)',
    description: 'Concatenates two or more string values into a single string.',
    category: 'String Functions',
    dialects: ['MySQL', 'PostgreSQL', 'TransactSQL'],
    status: 'supported',
    example: "SELECT CONCAT(first_name, ' ', last_name) AS full_name FROM employees;",
    notes: 'In MySQL, if any argument is NULL, CONCAT returns NULL.'
  },
  {
    id: 'str-concat-op-pipe',
    command: 'String Concatenation (||)',
    syntax: 'str1 || str2',
    description: 'Binary operator for concatenating strings.',
    category: 'String Functions',
    dialects: ['PostgreSQL', 'SQLite'],
    status: 'supported',
    example: "SELECT name || ' (' || email || ')' AS user_label FROM users;",
    notes: 'Standard ANSI SQL concatenation operator used in PostgreSQL and SQLite.'
  },
  {
    id: 'str-concat-op-plus',
    command: 'String Concatenation (+)',
    syntax: 'str1 + str2',
    description: 'T-SQL binary operator for concatenating strings.',
    category: 'String Functions',
    dialects: ['TransactSQL'],
    status: 'supported',
    example: "SELECT 'Order #' + CAST(id AS VARCHAR) AS order_ref FROM orders;",
    notes: 'In MSSQL/T-SQL, + concatenates strings if either operand is string.'
  },
  {
    id: 'str-substring',
    command: 'SUBSTRING() / SUBSTR()',
    syntax: 'SUBSTRING(str, pos, len) [MySQL/PG/MSSQL] | SUBSTR(str, pos, len) [SQLite]',
    description: 'Extracts a substring starting at a 1-based index position for a specified length.',
    category: 'String Functions',
    dialects: ['MySQL', 'PostgreSQL', 'SQLite', 'TransactSQL'],
    status: 'supported',
    example: "SELECT SUBSTRING(email, 1, 5) AS prefix FROM users;",
    notes: 'SQL string indexes start at 1 (not 0).'
  },
  {
    id: 'str-upper-lower',
    command: 'UPPER() / LOWER()',
    syntax: 'UPPER(str) | LOWER(str)',
    description: 'Converts a string to all uppercase or all lowercase characters.',
    category: 'String Functions',
    dialects: ['MySQL', 'PostgreSQL', 'SQLite', 'TransactSQL'],
    status: 'supported',
    example: "SELECT UPPER(name) AS upper_name, LOWER(email) AS lower_email FROM customers;",
    notes: 'Universally supported across all SQL dialects.'
  },
  {
    id: 'str-length',
    command: 'LENGTH() / LEN()',
    syntax: 'LENGTH(str) [MySQL/PG/SQLite] | LEN(str) [MSSQL]',
    description: 'Returns the character length of a string.',
    category: 'String Functions',
    dialects: ['MySQL', 'PostgreSQL', 'SQLite', 'TransactSQL'],
    status: 'supported',
    example: "SELECT name, LENGTH(name) AS name_len FROM users WHERE LENGTH(name) > 5;",
    notes: 'MSSQL uses LEN() while MySQL, PostgreSQL, and SQLite use LENGTH().'
  },
  {
    id: 'str-replace',
    command: 'REPLACE()',
    syntax: "REPLACE(str, find_str, replace_with)",
    description: 'Replaces all occurrences of a specified substring with a new substring.',
    category: 'String Functions',
    dialects: ['MySQL', 'PostgreSQL', 'SQLite', 'TransactSQL'],
    status: 'supported',
    example: "SELECT REPLACE(phone, '-', '') AS clean_phone FROM contacts;",
    notes: 'Case-sensitive replacement in most dialects.'
  },

  // ── Date & Time Functions ──────────────────────────────────────────────────
  {
    id: 'date-format-mysql',
    command: 'DATE_FORMAT()',
    syntax: "DATE_FORMAT(date, '%Y-%m-%d %H:%i:%s')",
    description: 'Formats a date value according to a specified MySQL format string.',
    category: 'Date & Time',
    dialects: ['MySQL'],
    status: 'supported',
    example: "SELECT name, DATE_FORMAT(created_at, '%Y-%m-%d') AS join_date FROM users;",
    notes: 'MySQL specifiers: %Y (4-digit year), %m (2-digit month), %d (2-digit day).'
  },
  {
    id: 'date-to-char-pg',
    command: 'TO_CHAR()',
    syntax: "TO_CHAR(date, 'YYYY-MM-DD')",
    description: 'Converts a timestamp or date to a formatted string representation in PostgreSQL.',
    category: 'Date & Time',
    dialects: ['PostgreSQL'],
    status: 'supported',
    example: "SELECT name, TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') AS formatted FROM users;",
    notes: 'PostgreSQL specifiers: YYYY, MM, DD, HH24, MI, SS.'
  },
  {
    id: 'date-strftime-sqlite',
    command: 'strftime()',
    syntax: "strftime('%Y-%m-%d', date_str)",
    description: 'Formats date/time strings in SQLite using format specifiers.',
    category: 'Date & Time',
    dialects: ['SQLite'],
    status: 'supported',
    example: "SELECT name, strftime('%Y-%m-%d', created_at) AS created_day FROM users;",
    notes: 'Notice format string comes FIRST in SQLite strftime(fmt, timestring).'
  },
  {
    id: 'date-format-mssql',
    command: 'FORMAT()',
    syntax: "FORMAT(date, 'yyyy-MM-dd')",
    description: 'Formats a date or number according to a specified locale and format in T-SQL.',
    category: 'Date & Time',
    dialects: ['TransactSQL'],
    status: 'supported',
    example: "SELECT name, FORMAT(created_at, 'yyyy-MM-dd') AS formatted_date FROM users;",
    notes: 'T-SQL uses .NET style format strings (yyyy, MM, dd).'
  },
  {
    id: 'date-now',
    command: 'NOW() / CURRENT_TIMESTAMP / GETDATE()',
    syntax: 'NOW() [MySQL] | CURRENT_TIMESTAMP [PG/SQLite] | GETDATE() [MSSQL]',
    description: 'Returns the current date and time at the start of query execution.',
    category: 'Date & Time',
    dialects: ['MySQL', 'PostgreSQL', 'SQLite', 'TransactSQL'],
    status: 'supported',
    example: "SELECT name, CURRENT_TIMESTAMP AS query_time FROM users;",
    notes: 'CURRENT_TIMESTAMP is the ANSI standard syntax.'
  },

  // ── JSON & Semi-Structured ─────────────────────────────────────────────────
  {
    id: 'json-extract-func',
    command: 'JSON_EXTRACT()',
    syntax: "JSON_EXTRACT(json_doc, '$.path')",
    description: 'Extracts data from a JSON document matching the given path.',
    category: 'JSON & Semi-Structured',
    dialects: ['MySQL', 'SQLite'],
    status: 'supported',
    example: "SELECT JSON_EXTRACT('{\"user\": {\"name\": \"Alice\"}}', '$.user.name') AS user_name;",
    notes: 'Path syntax uses $.key or $.array[index].'
  },
  {
    id: 'json-pg-op-arrow',
    command: 'JSON Extract Operator (->)',
    syntax: "json_col -> 'key' or json_col -> index",
    description: 'PostgreSQL operator to extract a JSON object/field as JSON.',
    category: 'JSON & Semi-Structured',
    dialects: ['PostgreSQL'],
    status: 'supported',
    example: "SELECT data->'details' AS json_details FROM logs;",
    notes: 'Returns JSON type (quotes preserved for strings).'
  },
  {
    id: 'json-pg-op-arrow-text',
    command: 'JSON Text Extract Operator (->>)',
    syntax: "json_col ->> 'key' or json_col ->> index",
    description: 'PostgreSQL operator to extract a JSON field as unquoted text.',
    category: 'JSON & Semi-Structured',
    dialects: ['PostgreSQL'],
    status: 'supported',
    example: "SELECT data->>'role' AS role_text FROM users;",
    notes: 'Returns scalar text value without surrounding quotes.'
  },
  {
    id: 'json-value-mssql',
    command: 'JSON_VALUE()',
    syntax: "JSON_VALUE(json_doc, '$.path')",
    description: 'Extracts a scalar value (string/number/boolean) from a JSON string in T-SQL.',
    category: 'JSON & Semi-Structured',
    dialects: ['TransactSQL'],
    status: 'supported',
    example: "SELECT JSON_VALUE('{\"server\": \"prod-1\"}', '$.server') AS env;",
    notes: 'Returns NULL if path points to an object or array.'
  },
  {
    id: 'json-query-mssql',
    command: 'JSON_QUERY()',
    syntax: "JSON_QUERY(json_doc, '$.path')",
    description: 'Extracts a JSON object or array string from a JSON document in T-SQL.',
    category: 'JSON & Semi-Structured',
    dialects: ['TransactSQL'],
    status: 'supported',
    example: "SELECT JSON_QUERY('{\"config\": {\"max_conn\": 100}}', '$.config') AS cfg_obj;",
    notes: 'Returns NULL if path points to a scalar value.'
  },

  // ── Aggregates & Math ──────────────────────────────────────────────────────
  {
    id: 'agg-count',
    command: 'COUNT()',
    syntax: 'COUNT(*) | COUNT(column)',
    description: 'Returns the total number of rows matching query criteria.',
    category: 'Aggregate & Math',
    dialects: ['MySQL', 'PostgreSQL', 'SQLite', 'TransactSQL'],
    status: 'supported',
    example: "SELECT department, COUNT(*) AS total_emps FROM employees GROUP BY department;",
    notes: 'COUNT(*) counts all rows including NULLs; COUNT(col) ignores NULLs.'
  },
  {
    id: 'agg-avg-sum',
    command: 'AVG() / SUM()',
    syntax: 'AVG(numeric_col) | SUM(numeric_col)',
    description: 'Calculates the average or total sum of a numeric column across rows.',
    category: 'Aggregate & Math',
    dialects: ['MySQL', 'PostgreSQL', 'SQLite', 'TransactSQL'],
    status: 'supported',
    example: "SELECT department, AVG(salary) AS avg_sal, SUM(salary) AS total_payroll FROM employees GROUP BY department;",
    notes: 'Ignores NULL values in computation.'
  },
  {
    id: 'agg-min-max',
    command: 'MIN() / MAX()',
    syntax: 'MIN(col) | MAX(col)',
    description: 'Returns the minimum or maximum value of a column across grouped rows.',
    category: 'Aggregate & Math',
    dialects: ['MySQL', 'PostgreSQL', 'SQLite', 'TransactSQL'],
    status: 'supported',
    example: "SELECT MIN(age) AS youngest, MAX(age) AS oldest FROM users;",
    notes: 'Works on numbers, dates, and text columns.'
  },
  {
    id: 'math-round-abs',
    command: 'ROUND() / ABS()',
    syntax: 'ROUND(number, decimals) | ABS(number)',
    description: 'Rounds a number to specified decimals, or computes absolute value.',
    category: 'Aggregate & Math',
    dialects: ['MySQL', 'PostgreSQL', 'SQLite', 'TransactSQL'],
    status: 'supported',
    example: "SELECT price, ROUND(price * 1.08, 2) AS price_with_tax FROM products;",
    notes: 'Universally supported in standard SQL.'
  },

  // ── DML & Querying ────────────────────────────────────────────────────────
  {
    id: 'dml-select',
    command: 'SELECT ... FROM',
    syntax: 'SELECT col1, col2 FROM table_name WHERE condition;',
    description: 'Retrieves data rows from one or more tables in the database.',
    category: 'DML & Querying',
    dialects: ['MySQL', 'PostgreSQL', 'SQLite', 'TransactSQL'],
    status: 'supported',
    example: "SELECT id, name, age, email FROM customers WHERE age > 25 ORDER BY age DESC;",
    notes: 'Core fundamental DML query construct.'
  },
  {
    id: 'dml-joins',
    command: 'INNER JOIN / LEFT JOIN',
    syntax: 'SELECT * FROM t1 JOIN t2 ON t1.id = t2.t1_id;',
    description: 'Combines columns from two tables based on matching foreign key conditions.',
    category: 'DML & Querying',
    dialects: ['MySQL', 'PostgreSQL', 'SQLite', 'TransactSQL'],
    status: 'supported',
    example: "SELECT o.id, c.name, o.total FROM orders o INNER JOIN customers c ON o.customer_id = c.id;",
    notes: 'In ExNihilo 95, multi-table joins automatically trigger topological relationship inference!'
  },
  {
    id: 'dml-group-by',
    command: 'GROUP BY & HAVING',
    syntax: 'SELECT dept, AVG(salary) FROM emp GROUP BY dept HAVING AVG(salary) > 50000;',
    description: 'Groups rows sharing property values to calculate summary aggregates.',
    category: 'DML & Querying',
    dialects: ['MySQL', 'PostgreSQL', 'SQLite', 'TransactSQL'],
    status: 'supported',
    example: "SELECT department, COUNT(*) AS cnt FROM employees GROUP BY department HAVING cnt > 1;",
    notes: 'HAVING filters aggregated summary rows after grouping occurs.'
  },

  // ── DDL & Schema ──────────────────────────────────────────────────────────
  {
    id: 'ddl-create-table',
    command: 'CREATE TABLE',
    syntax: 'CREATE TABLE name (col1 TYPE, col2 TYPE);',
    description: 'Defines a new relational database table with explicit column types.',
    category: 'DDL & Schema',
    dialects: ['MySQL', 'PostgreSQL', 'SQLite', 'TransactSQL'],
    status: 'supported',
    example: "CREATE TABLE products (id INT PRIMARY KEY, title VARCHAR(100), price NUMERIC);",
    notes: 'ExNihilo 95 supports both explicit CREATE TABLE and automatic zero-config schema inference!'
  },
  {
    id: 'ddl-insert-into',
    command: 'INSERT INTO',
    syntax: 'INSERT INTO table (col1, col2) VALUES (val1, val2);',
    description: 'Inserts new data records into an existing database table.',
    category: 'DDL & Schema',
    dialects: ['MySQL', 'PostgreSQL', 'SQLite', 'TransactSQL'],
    status: 'supported',
    example: "INSERT INTO products (id, title, price) VALUES (1, 'Retro CRT Monitor', 199.99);",
    notes: 'Multiple row inserts `VALUES (1, ...), (2, ...)` supported.'
  },

  // ── Advanced & Windowing (Planned ⏳) ──────────────────────────────────────
  {
    id: 'adv-window-over',
    command: 'OVER (PARTITION BY ... ORDER BY ...)',
    syntax: 'ROW_NUMBER() OVER (PARTITION BY dept ORDER BY salary DESC)',
    description: 'Calculates aggregate or ranking values across a subset of table rows without grouping.',
    category: 'Advanced & Windowing',
    dialects: ['MySQL', 'PostgreSQL', 'SQLite', 'TransactSQL'],
    status: 'coming_soon',
    example: "SELECT name, dept, salary, DENSE_RANK() OVER (PARTITION BY dept ORDER BY salary DESC) FROM emp;",
    notes: 'Planned for ExNihilo 95 v1.3 Engine Upgrade Phase.'
  },
  {
    id: 'adv-cte-recursive',
    command: 'WITH RECURSIVE (Recursive CTE)',
    syntax: 'WITH RECURSIVE cte_name AS (...) SELECT * FROM cte_name;',
    description: 'Executes recursive hierarchical graph queries (e.g. org charts, bill of materials).',
    category: 'Advanced & Windowing',
    dialects: ['PostgreSQL', 'SQLite', 'MySQL', 'TransactSQL'],
    status: 'coming_soon',
    example: "WITH RECURSIVE org AS (SELECT id, manager_id FROM emp UNION ALL SELECT e.id, e.manager_id FROM emp e JOIN org o ON e.manager_id = o.id) SELECT * FROM org;",
    notes: 'Basic non-recursive CTEs (`WITH cte AS (...) SELECT * FROM cte`) are ALREADY supported in v1.2!'
  },
  {
    id: 'adv-stored-proc',
    command: 'CREATE PROCEDURE / FUNCTION',
    syntax: 'CREATE PROCEDURE proc_name () BEGIN ... END;',
    description: 'Defines reusable procedural code logic executed on the database server.',
    category: 'Advanced & Windowing',
    dialects: ['MySQL', 'PostgreSQL', 'TransactSQL'],
    status: 'coming_soon',
    example: "CREATE PROCEDURE UpdateSalaries() BEGIN UPDATE employees SET salary = salary * 1.05; END;",
    notes: 'In-memory engine currently focuses on instant query execution and synthetic data inference.'
  },
  {
    id: 'adv-triggers',
    command: 'CREATE TRIGGER',
    syntax: 'CREATE TRIGGER trg_name AFTER INSERT ON tbl BEGIN ... END;',
    description: 'Executes custom SQL logic automatically when INSERT/UPDATE/DELETE events occur.',
    category: 'Advanced & Windowing',
    dialects: ['MySQL', 'PostgreSQL', 'SQLite', 'TransactSQL'],
    status: 'coming_soon',
    example: "CREATE TRIGGER log_user_update AFTER UPDATE ON users BEGIN INSERT INTO audit_log VALUES ('updated'); END;",
    notes: 'Planned for advanced relational trigger simulation phase.'
  }
];

export const DIALECT_METADATA: Record<DialectName, { label: string; icon: string; desc: string }> = {
  MySQL: {
    label: 'MySQL 8.0+',
    icon: '🐬',
    desc: 'World\'s most popular open-source relational database. Uses DATE_FORMAT(), CONCAT(), and JSON_EXTRACT().'
  },
  PostgreSQL: {
    label: 'PostgreSQL 16+',
    icon: '🐘',
    desc: 'Advanced enterprise open-source database. Uses TO_CHAR(), || string pipe concat, and -> / ->> JSON operators.'
  },
  SQLite: {
    label: 'SQLite 3.45+',
    icon: '🪶',
    desc: 'Self-contained zero-config SQL engine. Uses strftime(), SUBSTR(), and native WASM execution.'
  },
  TransactSQL: {
    label: 'Microsoft T-SQL / MSSQL',
    icon: '🏢',
    desc: 'Microsoft SQL Server dialect. Uses FORMAT(), + string concatenation, JSON_VALUE(), and JSON_QUERY().'
  }
};
