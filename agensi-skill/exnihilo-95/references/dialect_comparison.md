# SQL Multi-Dialect Comparison & Equivalence Reference

An exhaustive reference matrix for transpiling, normalizing, and comparing SQL queries across **PostgreSQL 16+**, **MySQL 8.0+**, **SQLite 3.45+**, and **Microsoft SQL Server (T-SQL)**.

---

## 1. Date & Time Analytics

| Operation | PostgreSQL | MySQL 8.0+ | SQLite 3.45+ | Transact-SQL (MSSQL) |
| :--- | :--- | :--- | :--- | :--- |
| **Current Date** | `CURRENT_DATE` | `CURDATE()` or `CURRENT_DATE` | `date('now')` | `CAST(GETDATE() AS DATE)` |
| **Current Timestamp** | `CURRENT_TIMESTAMP` or `NOW()` | `NOW()` | `datetime('now')` | `GETDATE()` or `SYSDATETIME()` |
| **Add Days** | `col + INTERVAL '7 days'` | `DATE_ADD(col, INTERVAL 7 DAY)` | `date(col, '+7 days')` | `DATEADD(day, 7, col)` |
| **Subtract Months** | `col - INTERVAL '1 month'` | `DATE_SUB(col, INTERVAL 1 MONTH)` | `date(col, '-1 month')` | `DATEADD(month, -1, col)` |
| **Difference in Days** | `DATE_PART('day', d2 - d1)` | `DATEDIFF(d2, d1)` | `CAST(julianday(d2) - julianday(d1) AS INT)` | `DATEDIFF(day, d1, d2)` |
| **Extract Year** | `EXTRACT(YEAR FROM col)` | `YEAR(col)` or `EXTRACT(YEAR FROM col)` | `CAST(strftime('%Y', col) AS INT)` | `YEAR(col)` or `DATEPART(year, col)` |
| **Date Truncation (Month)** | `DATE_TRUNC('month', col)` | `DATE_FORMAT(col, '%Y-%m-01')` | `strftime('%Y-%m-01', col)` | `DATETRUNC(month, col)` or `DATEFROMPARTS(YEAR(col), MONTH(col), 1)` |

---

## 2. String Manipulation & Pattern Matching

| Operation | PostgreSQL | MySQL 8.0+ | SQLite 3.45+ | Transact-SQL (MSSQL) |
| :--- | :--- | :--- | :--- | :--- |
| **String Concatenation** | `a \|\| b` or `CONCAT(a, b)` | `CONCAT(a, b)` | `a \|\| b` | `a + b` or `CONCAT(a, b)` |
| **Concat with Separator** | `CONCAT_WS(', ', a, b)` | `CONCAT_WS(', ', a, b)` | `printf('%s, %s', a, b)` | `CONCAT_WS(', ', a, b)` |
| **Substring** | `SUBSTRING(str FROM 1 FOR 4)` | `SUBSTRING(str, 1, 4)` | `substr(str, 1, 4)` | `SUBSTRING(str, 1, 4)` |
| **Length (Characters)** | `LENGTH(str)` or `CHAR_LENGTH(str)` | `CHAR_LENGTH(str)` | `length(str)` | `LEN(str)` |
| **Length (Bytes)** | `OCTET_LENGTH(str)` | `LENGTH(str)` | `length(cast(str as blob))` | `DATALENGTH(str)` |
| **Case-Insensitive Match** | `col ILIKE '%term%'` | `col LIKE '%term%'` | `LOWER(col) LIKE '%term%'` | `col LIKE '%term%'` |
| **Regex Match** | `col ~ '^[A-Z]'` | `REGEXP_LIKE(col, '^[A-Z]')` | `col REGEXP '^[A-Z]'` (ext) | `col LIKE '[A-Z]%'` (wildcards) |
| **Group String Aggregation** | `STRING_AGG(col, ', ')` | `GROUP_CONCAT(col SEPARATOR ', ')` | `GROUP_CONCAT(col, ', ')` | `STRING_AGG(col, ', ')` |

---

## 3. Null Handling & Conditional Logic

| Operation | PostgreSQL | MySQL 8.0+ | SQLite 3.45+ | Transact-SQL (MSSQL) |
| :--- | :--- | :--- | :--- | :--- |
| **First Non-Null Value** | `COALESCE(a, b, c)` | `COALESCE(a, b, c)` | `COALESCE(a, b, c)` | `COALESCE(a, b, c)` |
| **Two-Arg Null Fallback** | `COALESCE(a, b)` | `IFNULL(a, b)` | `IFNULL(a, b)` | `ISNULL(a, b)` |
| **Null If Equal** | `NULLIF(a, b)` | `NULLIF(a, b)` | `NULLIF(a, b)` | `NULLIF(a, b)` |
| **Simple Inline If** | `CASE WHEN c THEN t ELSE f END` | `IF(c, t, f)` | `CASE WHEN c THEN t ELSE f END` | `IIF(c, t, f)` |
| **Sorting Nulls** | `ORDER BY col NULLS LAST` | `ORDER BY ISNULL(col), col` | `ORDER BY col NULLS LAST` | `ORDER BY CASE WHEN col IS NULL THEN 1 ELSE 0 END, col` |

---

## 4. DDL & Auto-Incrementing Primary Keys

| Feature | PostgreSQL | MySQL 8.0+ | SQLite 3.45+ | Transact-SQL (MSSQL) |
| :--- | :--- | :--- | :--- | :--- |
| **Auto-Increment PK** | `id GENERATED ALWAYS AS IDENTITY PRIMARY KEY` | `id INT AUTO_INCREMENT PRIMARY KEY` | `id INTEGER PRIMARY KEY AUTOINCREMENT` | `id INT IDENTITY(1,1) PRIMARY KEY` |
| **Boolean Type** | `BOOLEAN` (`TRUE` / `FALSE`) | `TINYINT(1)` (`1` / `0`) | `INTEGER` (`1` / `0`) | `BIT` (`1` / `0`) |
| **JSON Data Type** | `JSONB` or `JSON` | `JSON` | `TEXT` (with JSON functions) | `NVARCHAR(MAX)` (with `ISJSON()`) |
| **UUID Generation** | `gen_random_uuid()` | `UUID()` | `lower(hex(randomblob(16)))` | `NEWID()` |
| **Create If Not Exists** | `CREATE TABLE IF NOT EXISTS` | `CREATE TABLE IF NOT EXISTS` | `CREATE TABLE IF NOT EXISTS` | `IF NOT EXISTS (SELECT * FROM sys.tables ...)` |

---

## 5. Advanced Joins & Pagination

### Full Outer Join Emulation (for MySQL & SQLite)
PostgreSQL and T-SQL support native `FULL OUTER JOIN`:
```sql
SELECT a.*, b.*
FROM table_a a
FULL OUTER JOIN table_b b ON a.id = b.a_id;
```
In MySQL and SQLite, emulate full outer joins using `UNION ALL`:
```sql
SELECT a.*, b.*
FROM table_a a
LEFT JOIN table_b b ON a.id = b.a_id
UNION ALL
SELECT a.*, b.*
FROM table_b b
LEFT JOIN table_a a ON b.a_id = a.id
WHERE a.id IS NULL;
```

### Offset & Pagination
* **PostgreSQL / SQLite:**
  ```sql
  SELECT * FROM employees ORDER BY id LIMIT 20 OFFSET 40;
  ```
* **MySQL 8.0+:**
  ```sql
  SELECT * FROM employees ORDER BY id LIMIT 40, 20;
  ```
* **Transact-SQL (MSSQL):**
  ```sql
  SELECT * FROM employees ORDER BY id OFFSET 40 ROWS FETCH NEXT 20 ROWS ONLY;
  ```

---

## 6. Window Functions & Recursive CTEs

### Window Ranking Syntax
All four dialects support modern standard window functions:
```sql
SELECT
  id, department_id, salary,
  ROW_NUMBER() OVER (PARTITION BY department_id ORDER BY salary DESC) as row_num,
  RANK()       OVER (PARTITION BY department_id ORDER BY salary DESC) as rnk,
  DENSE_RANK() OVER (PARTITION BY department_id ORDER BY salary DESC) as dense_rnk
FROM employees;
```

### Recursive CTE Syntax
* **PostgreSQL, MySQL 8+, SQLite:**
  ```sql
  WITH RECURSIVE org_tree AS (
    SELECT id, name, manager_id, 1 as depth
    FROM employees WHERE manager_id IS NULL
    UNION ALL
    SELECT e.id, e.name, e.manager_id, o.depth + 1
    FROM employees e
    JOIN org_tree o ON e.manager_id = o.id
  )
  SELECT * FROM org_tree;
  ```
* **Transact-SQL:**
  ```sql
  WITH org_tree AS (
    SELECT id, name, manager_id, 1 as depth
    FROM employees WHERE manager_id IS NULL
    UNION ALL
    SELECT e.id, e.name, e.manager_id, o.depth + 1
    FROM employees e
    JOIN org_tree o ON e.manager_id = o.id
  )
  SELECT * FROM org_tree;
  ```
*(Note: T-SQL omits the `RECURSIVE` keyword; CTE recursion is detected automatically).*
