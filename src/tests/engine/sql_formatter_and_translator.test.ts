import { describe, it, expect } from 'vitest';
import { formatSql } from '../../utils/sqlFormatter';
import {
  detectSqlDialect,
  translateDialect,
} from '../../engine/dialect_translator';

describe('SQL Formatter (formatSql) — Professional, String-Safe & Idempotent', () => {
  it('formats short SELECT queries cleanly on one line', () => {
    const raw = 'select id, name from customers where active = 1 order by id desc limit 10;';
    const formatted = formatSql(raw);

    expect(formatted).toContain('SELECT id, name');
    expect(formatted).toContain('\nFROM customers');
    expect(formatted).toContain('\nWHERE active = 1');
    expect(formatted).toContain('\nORDER BY id DESC');
    expect(formatted).toContain('\nLIMIT 10;');
  });

  it('formats multi-column SELECT lists with clean indentation', () => {
    const raw = 'select id, first_name, last_name, email, phone from users where active = 1;';
    const formatted = formatSql(raw);

    expect(formatted).toContain('SELECT\n  id,\n  first_name,\n  last_name,\n  email,\n  phone');
    expect(formatted).toContain('\nFROM users');
  });

  it('indents JOIN clauses by 2 spaces', () => {
    const raw = 'select o.id, c.name from orders o inner join customers c on o.cust_id = c.id left join items i on o.id = i.order_id where o.total > 50;';
    const formatted = formatSql(raw);

    expect(formatted).toContain('\n  INNER JOIN customers c ON o.cust_id = c.id');
    expect(formatted).toContain('\n  LEFT JOIN items i ON o.id = i.order_id');
  });

  it('indents multiple AND / OR filter conditions under WHERE', () => {
    const raw = 'select * from orders where status = 1 and total > 100 and region = 5 or priority = 1;';
    const formatted = formatSql(raw);

    expect(formatted).toContain('WHERE status = 1\n  AND total > 100\n  AND region = 5\n  OR priority = 1;');
  });

  it('formats CTEs (WITH ... AS (...)) with indented body and distinct outer query', () => {
    const raw = 'with regional_sales as (select region, sum(amount) as total_sales from orders group by region) select region, total_sales from regional_sales where total_sales > 1000;';
    const formatted = formatSql(raw);

    expect(formatted).toContain('WITH regional_sales AS (\n  SELECT region, SUM(amount) AS total_sales\n  FROM orders\n  GROUP BY region\n)');
    expect(formatted).toContain('\nSELECT region, total_sales\nFROM regional_sales');
  });

  it('formats subqueries with indented inner clauses', () => {
    const raw = 'select * from (select id, count(*) as cnt from orders where status = 1 group by id) as sub where id > 10;';
    const formatted = formatSql(raw);

    expect(formatted).toContain('FROM (\n  SELECT id, COUNT(*) AS cnt\n  FROM orders\n  WHERE status = 1\n  GROUP BY id\n) AS sub');
  });

  it('formats CREATE TABLE DDL with one column per line indented', () => {
    const raw = 'create table employees (id int primary key, name varchar(100) not null, salary decimal(10, 2), dept_id int);';
    const formatted = formatSql(raw);

    expect(formatted).toContain('CREATE TABLE employees (\n  id INT PRIMARY KEY,\n  name VARCHAR(100) NOT NULL,\n  salary DECIMAL(10, 2),\n  dept_id INT\n);');
  });

  it('PROTECTS string literals from keyword uppercasing and clause linebreaks', () => {
    const raw = "select id, 'where is the order' as note, 'from here to there' as descrip from orders where status = 'drop table now';";
    const formatted = formatSql(raw);

    // Literal contents must NOT be capitalized or broken with newlines
    expect(formatted).toContain("'where is the order'");
    expect(formatted).toContain("'from here to there'");
    expect(formatted).toContain("'drop table now'");
    expect(formatted).not.toContain("'WHERE is the order'");
    expect(formatted).not.toContain("'\nFROM here to there'");
  });

  it('PROTECTS comments from being corrupted', () => {
    const raw = `-- select all customers from db\nselect * from customers; /* where active = 1 */`;
    const formatted = formatSql(raw);

    expect(formatted).toContain('-- select all customers from db');
    expect(formatted).toContain('/* where active = 1 */');
  });

  it('is completely IDEMPOTENT (formatting twice produces identical output)', () => {
    const raw = 'select id, name from users where status = 1 and role = \'admin\' order by created_at desc limit 25;';
    const once = formatSql(raw);
    const twice = formatSql(once);

    expect(twice).toBe(once);
  });
});

describe('SQL Dialect Auto-Detection (detectSqlDialect)', () => {
  it('detects Transact-SQL (T-SQL) signatures', () => {
    const sql = 'SELECT TOP 10 [id], [name], ISNULL([score], 0) FROM [users] WHERE created_at <= GETDATE();';
    const detection = detectSqlDialect(sql);

    expect(detection.detectedDialect).toBe('TransactSQL');
    expect(detection.confidence).toBeGreaterThanOrEqual(80);
    expect(detection.reasons).toEqual(
      expect.arrayContaining([expect.stringContaining('T-SQL TOP N')])
    );
  });

  it('detects Oracle PL/SQL signatures', () => {
    const sql = 'SELECT id, NVL(commission, 0), SYSDATE FROM employees WHERE ROWNUM <= 25;';
    const detection = detectSqlDialect(sql);

    expect(detection.detectedDialect).toBe('Oracle');
    expect(detection.reasons).toEqual(
      expect.arrayContaining([expect.stringContaining('Oracle ROWNUM')])
    );
  });

  it('detects Snowflake / BigQuery QUALIFY clause', () => {
    const sql = 'SELECT id, dept, ROW_NUMBER() OVER(PARTITION BY dept ORDER BY salary DESC) as rn FROM emp QUALIFY rn <= 2;';
    const detection = detectSqlDialect(sql);

    expect(detection.detectedDialect).toBe('Snowflake');
  });

  it('detects MySQL signatures', () => {
    const sql = 'SELECT `id`, IFNULL(`email`, "n/a"), DATE_FORMAT(created, "%Y-%m-%d") FROM `users` LIMIT 10, 5;';
    const detection = detectSqlDialect(sql);

    expect(detection.detectedDialect).toBe('MySQL');
  });

  it('detects PostgreSQL signatures', () => {
    const sql = 'SELECT id::int, name, email FROM users WHERE name ILIKE \'%smith%\';';
    const detection = detectSqlDialect(sql);

    expect(detection.detectedDialect).toBe('PostgreSQL');
  });
});

describe('SQL Dialect Cross-Compiler & Translator (translateDialect)', () => {
  describe('Row Limiting (TOP vs LIMIT vs ROWNUM)', () => {
    it('translates PostgreSQL LIMIT N to T-SQL SELECT TOP N', () => {
      const sql = 'SELECT id, name FROM customers LIMIT 15;';
      const res = translateDialect(sql, 'TransactSQL', 'PostgreSQL');

      expect(res.translatedSql).toContain('SELECT TOP 15 id, name');
      expect(res.translatedSql).not.toContain('LIMIT 15');
      expect(res.transformations).toEqual(
        expect.arrayContaining([expect.stringContaining('Converted LIMIT 15 to SELECT TOP 15')])
      );
    });

    it('translates T-SQL SELECT TOP N to PostgreSQL LIMIT N', () => {
      const sql = 'SELECT TOP 20 id, email FROM users;';
      const res = translateDialect(sql, 'PostgreSQL', 'TransactSQL');

      expect(res.translatedSql).toContain('SELECT id, email');
      expect(res.translatedSql).toContain('LIMIT 20;');
      expect(res.transformations).toEqual(
        expect.arrayContaining([expect.stringContaining('Converted T-SQL TOP 20 to standard LIMIT 20')])
      );
    });

    it('translates Oracle ROWNUM <= N to PostgreSQL LIMIT N', () => {
      const sql = 'SELECT * FROM products WHERE ROWNUM <= 5;';
      const res = translateDialect(sql, 'PostgreSQL', 'Oracle');

      expect(res.translatedSql).toContain('LIMIT 5');
      expect(res.translatedSql).not.toContain('ROWNUM');
    });

    it('translates MySQL comma offset (LIMIT 10, 5) to standard LIMIT 5 OFFSET 10', () => {
      const sql = 'SELECT * FROM logs LIMIT 10, 5;';
      const res = translateDialect(sql, 'PostgreSQL', 'MySQL');

      expect(res.translatedSql).toMatch(/LIMIT 5\s+OFFSET 10/);
    });
  });

  describe('Identifier Quotes Conversion', () => {
    it('converts T-SQL [col] brackets to MySQL backticks `col`', () => {
      const sql = 'SELECT [first_name], [last_name] FROM [users];';
      const res = translateDialect(sql, 'MySQL', 'TransactSQL');

      expect(res.translatedSql).toContain('`first_name`');
      expect(res.translatedSql).toContain('`last_name`');
      expect(res.translatedSql).toContain('`users`');
    });

    it('converts MySQL `col` backticks to standard PostgreSQL "col" double quotes', () => {
      const sql = 'SELECT `id`, `balance` FROM `accounts`;';
      const res = translateDialect(sql, 'PostgreSQL', 'MySQL');

      expect(res.translatedSql).toContain('"id"');
      expect(res.translatedSql).toContain('"balance"');
      expect(res.translatedSql).toContain('"accounts"');
    });

    it('converts standard "col" double quotes to T-SQL [col] brackets', () => {
      const sql = 'SELECT "order_id", "total" FROM "orders";';
      const res = translateDialect(sql, 'TransactSQL', 'PostgreSQL');

      expect(res.translatedSql).toContain('[order_id]');
      expect(res.translatedSql).toContain('[total]');
      expect(res.translatedSql).toContain('[orders]');
    });
  });

  describe('Null Coalescing Functions', () => {
    it('translates MySQL IFNULL to T-SQL ISNULL', () => {
      const sql = 'SELECT IFNULL(phone, \'N/A\') FROM contacts;';
      const res = translateDialect(sql, 'TransactSQL', 'MySQL');

      expect(res.translatedSql).toContain("ISNULL(phone, 'N/A')");
    });

    it('translates Oracle NVL to ANSI COALESCE for PostgreSQL and SQLite', () => {
      const sql = 'SELECT NVL(bonus, 0) FROM staff;';
      const res = translateDialect(sql, 'PostgreSQL', 'Oracle');

      expect(res.translatedSql).toContain('COALESCE(bonus, 0)');
    });

    it('translates Oracle NVL2(a, b, c) to ANSI CASE WHEN expression', () => {
      const sql = 'SELECT NVL2(bonus, 1, 0) FROM staff;';
      const res = translateDialect(sql, 'PostgreSQL', 'Oracle');

      expect(res.translatedSql).toContain('CASE WHEN bonus IS NOT NULL THEN 1 ELSE 0 END');
    });
  });

  describe('String Functions & Timestamps', () => {
    it('translates ANSI LENGTH() to T-SQL LEN()', () => {
      const sql = 'SELECT LENGTH(username) FROM accounts;';
      const res = translateDialect(sql, 'TransactSQL', 'PostgreSQL');

      expect(res.translatedSql).toContain('LEN(username)');
    });

    it('translates T-SQL LEN() to PostgreSQL LENGTH()', () => {
      const sql = 'SELECT LEN(username) FROM accounts;';
      const res = translateDialect(sql, 'PostgreSQL', 'TransactSQL');

      expect(res.translatedSql).toContain('LENGTH(username)');
    });

    it('translates T-SQL GETDATE() to MySQL NOW() and PostgreSQL CURRENT_TIMESTAMP', () => {
      const sql = 'SELECT GETDATE() AS curr;';
      const mysqlRes = translateDialect(sql, 'MySQL', 'TransactSQL');
      const pgRes = translateDialect(sql, 'PostgreSQL', 'TransactSQL');

      expect(mysqlRes.translatedSql).toContain('NOW()');
      expect(pgRes.translatedSql).toContain('CURRENT_TIMESTAMP');
    });
  });

  describe('PostgreSQL Type Casts & ILIKE', () => {
    it('translates PostgreSQL ::cast syntax to standard CAST(col AS type)', () => {
      const sql = 'SELECT age::int, score::text FROM players;';
      const res = translateDialect(sql, 'MySQL', 'PostgreSQL');

      expect(res.translatedSql).toContain('CAST(age AS INT)');
      expect(res.translatedSql).toContain('CAST(score AS VARCHAR(255))');
    });

    it('translates PostgreSQL ILIKE to standard LIKE for MySQL and SQLite', () => {
      const sql = "SELECT * FROM users WHERE name ILIKE '%john%';";
      const res = translateDialect(sql, 'MySQL', 'PostgreSQL');

      expect(res.translatedSql).toContain("LIKE '%john%'");
    });
  });

  describe('Snowflake QUALIFY and PIVOT Transpilation', () => {
    it('transpiles Snowflake QUALIFY into CTE stage for PostgreSQL and T-SQL', () => {
      const sql = 'SELECT dept, salary, ROW_NUMBER() OVER(PARTITION BY dept ORDER BY salary DESC) as rn FROM employees QUALIFY rn <= 3;';
      const res = translateDialect(sql, 'PostgreSQL', 'Snowflake');

      expect(res.translatedSql).toContain('WITH _qualify_stage AS');
      expect(res.translatedSql).toMatch(/SELECT \*\s+FROM _qualify_stage\s+WHERE rn <= 3/);
      expect(res.transformations).toEqual(
        expect.arrayContaining([expect.stringContaining('QUALIFY clause into CTE stage')])
      );
    });

    it('transpiles PIVOT into conditional CASE aggregation for PostgreSQL', () => {
      const sql = "SELECT * FROM sales PIVOT (SUM(amount) FOR quarter IN ('Q1', 'Q2')) AS pvt;";
      const res = translateDialect(sql, 'PostgreSQL', 'TransactSQL');

      expect(res.translatedSql).toContain("SUM(CASE WHEN quarter = 'Q1' THEN amount END) AS \"Q1\"");
      expect(res.translatedSql).toContain("SUM(CASE WHEN quarter = 'Q2' THEN amount END) AS \"Q2\"");
    });
  });
});
