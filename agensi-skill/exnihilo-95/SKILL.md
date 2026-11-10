---
name: exnihilo-95
description: Zero-config in-browser SQL IDE & relational reasoning engine. Automatically infers schemas and generates referentially sound synthetic mock datasets from bare queries, solves 130+ LeetCode SQL challenges, transpiles between PostgreSQL, MySQL, SQLite, and T-SQL, and optimizes query execution plans.
license: MIT
compatibility: Universal (Claude Code, Cursor, Copilot, Antigravity, Codex)
metadata:
  author: Mrityunjai
  version: "2.0.0"
  repository: "https://github.com/Mrityunjai-hue/exnihilo-95"
  tags:
    - sql
    - database
    - postgresql
    - mysql
    - sqlite
    - tsql
    - leetcode
    - schema-inference
    - synthetic-data
    - query-optimization
---

# ExNihilo 95 — Zero-Config SQL & Relational Reasoning Engine

`exnihilo-95` empowers your AI agent to become an authoritative relational database architect, multi-dialect SQL transpiler, and LeetCode SQL coach. It brings the core philosophy of **ExNihilo 95** ("Creatio Ex Nihilo" — creation out of nothing) to any coding agent: eliminating "table not found" bottlenecks by inferring relational schemas and generating synthetic, referentially sound mock datasets on the fly.

---

## When to Activate This Skill

Activate this skill when the user:
1. **Writes SQL without a schema:** Asks you to review, run, debug, or verify a SQL query, but hasn't provided the `CREATE TABLE` DDL or table schemas.
2. **Needs mock relational test data:** Asks to generate realistic synthetic test datasets with foreign keys and parent-child relational constraints.
3. **Translates across SQL dialects:** Needs to convert queries between **PostgreSQL**, **MySQL**, **SQLite**, and **Transact-SQL (T-SQL)**.
4. **Practices LeetCode / Interview SQL:** Requests help solving, optimizing, or understanding SQL interview puzzles (window functions, consecutive events, hierarchical queries, rankings).
5. **Optimizes SQL performance:** Asks to audit slow queries, check SARGability, analyze execution plans (`EXPLAIN`), or design indexing strategies.

---

## Core Capabilities & Instructions

### 1. "Creatio Ex Nihilo": Schema & Mock Data Inference
When given a SQL query without schema declarations, do **not** stall or ask the user to paste their DDL. Automatically reconstruct the required database state using this deterministic inference pipeline:

1. **Table Extraction:**
   - Scan all `FROM`, `JOIN` (INNER, LEFT, RIGHT, FULL, CROSS), subqueries, and CTEs.
   - Discard CTE aliases declared in `WITH` clauses from physical table targets.
2. **Column Type Inference Precedence:**
   - **Level 6 (Explicit Cast):** `CAST(col AS INT)` or `col::numeric` -> always sets explicit target type.
   - **Level 5 (Typed Literal Comparison):** `col = '2026-01-01'` -> `DATE`; `col = 42` -> `INTEGER`; `col = 99.95` -> `NUMERIC`; `col = true` -> `BOOLEAN`.
   - **Level 4 (Operators & Functions):**
     - String: `LIKE`, `ILIKE`, `LOWER()`, `UPPER()`, `CONCAT()` -> `VARCHAR(255)`.
     - Math: `SUM()`, `AVG()`, `*`, `/` -> `NUMERIC(12,2)`.
     - Date: `DATE_ADD()`, `EXTRACT()`, `AGE()`, `DATEDIFF()` -> `TIMESTAMP` or `DATE`.
   - **Level 3 (GROUP BY / Categorical):** Columns in `GROUP BY` without numeric functions -> `VARCHAR(100)`.
   - **Level 2 (Column Name Heuristics):**
     - Ends with `_id` or named `id` -> `INTEGER PRIMARY KEY` or `FOREIGN KEY`.
     - Contains `email` -> `VARCHAR(255)`.
     - Contains `price`, `amount`, `total`, `salary` -> `NUMERIC(10,2)`.
     - Contains `created_at`, `updated_at`, `timestamp` -> `TIMESTAMP`.
     - Contains `is_`, `has_`, `active` -> `BOOLEAN`.
   - **Level 1 (Universal Fallback):** `VARCHAR(255)`.
3. **Referential Integrity & Dependency Graph:**
   - Detect `ON a.foreign_id = b.id`. Mark `b` as parent and `a` as child.
   - Generate topological creation order: Parent tables first, followed by child tables.
4. **Synthetic Data Synthesis:**
   - Generate 10–20 realistic rows per table.
   - **INNER JOIN:** Ensure 100% foreign key matching against parent primary keys.
   - **LEFT / RIGHT JOIN:** Ensure ~85% match and ~15% deliberate orphans/NULLs to test outer join filtering.
   - Provide the complete runnable `CREATE TABLE` and `INSERT INTO` script.

*(For detailed rules and token dictionaries, consult `references/schema_inference_and_mock_data.md`)*

---

### 2. Multi-Dialect Transpiler & Parity Matrix
When translating or validating queries across **PostgreSQL**, **MySQL**, **SQLite**, and **Transact-SQL (T-SQL)**, apply these critical syntax equivalences:

| Category | PostgreSQL | MySQL 8.0+ | SQLite | Transact-SQL (MSSQL) |
| :--- | :--- | :--- | :--- | :--- |
| **Current Timestamp** | `CURRENT_TIMESTAMP` or `NOW()` | `NOW()` | `CURRENT_TIMESTAMP` | `GETDATE()` or `SYSUTCDATETIME()` |
| **Date Add (Days)** | `col + INTERVAL '7 days'` | `DATE_ADD(col, INTERVAL 7 DAY)` | `date(col, '+7 days')` | `DATEADD(day, 7, col)` |
| **String Aggregation** | `STRING_AGG(col, ', ')` | `GROUP_CONCAT(col SEPARATOR ', ')` | `GROUP_CONCAT(col, ', ')` | `STRING_AGG(col, ', ')` |
| **Null Replacement** | `COALESCE(a, b)` | `IFNULL(a, b)` or `COALESCE` | `IFNULL(a, b)` or `COALESCE` | `ISNULL(a, b)` or `COALESCE` |
| **Case-Insensitive Match** | `col ILIKE '%term%'` | `col LIKE '%term%'` (default collation) | `LOWER(col) LIKE '%term%'` | `col LIKE '%term%'` (default collation) |
| **Full Outer Join** | Native `FULL OUTER JOIN` | `LEFT JOIN ... UNION ALL ... LEFT JOIN` | `LEFT JOIN ... UNION ALL ... LEFT JOIN` | Native `FULL OUTER JOIN` |
| **Recursive CTE** | `WITH RECURSIVE cte AS (...)` | `WITH RECURSIVE cte AS (...)` | `WITH RECURSIVE cte AS (...)` | `WITH cte AS (...)` |
| **Limit & Pagination** | `LIMIT 10 OFFSET 20` | `LIMIT 20, 10` or `LIMIT 10 OFFSET 20` | `LIMIT 10 OFFSET 20` | `OFFSET 20 ROWS FETCH NEXT 10 ROWS ONLY` |

*(For full syntax variations and JSON operators, consult `references/dialect_comparison.md`)*

---

### 3. LeetCode & SQL Interview Challenge Coach
When tutoring or solving SQL challenge problems:

1. **Clarify Edge Cases Upfront:**
   - Empty tables (handling zero rows gracefully without dividing by zero).
   - Ties in ranking (`ROW_NUMBER()` vs `RANK()` vs `DENSE_RANK()`).
   - Gaps and islands (consecutive days/events using `LAG()` / `LEAD()` or difference-of-row-numbers).
   - NULL propagation in aggregate functions (`COUNT(col)` vs `COUNT(*)`).
2. **Structured Solution Pattern:**
   - **Step 1: Concept & Strategy:** Explain the underlying set theory or window partitioning approach in 2–3 sentences.
   - **Step 2: Idiomatic Query:** Provide clean, capitalized, indented SQL.
   - **Step 3: Dialect Variations:** If the problem requires features with dialect differences (e.g., date diffs, string aggregations), provide the PostgreSQL and MySQL/T-SQL variants.
   - **Step 4: Complexity & Optimization:** Note the time complexity and indexing requirements (e.g. composite index on `(partition_col, order_col)`).

*(For 130+ LeetCode challenge references, consult `references/sql_challenge_bank.md`)*

---

### 4. Query Performance & Indexing Optimizer
When reviewing query efficiency:

1. **Check SARGability (Search Argument Ability):**
   - ❌ Anti-pattern: `WHERE YEAR(created_at) = 2026` (invalidates index on `created_at`).
   - ✅ SARGable: `WHERE created_at >= '2026-01-01' AND created_at < '2027-01-01'`.
   - ❌ Anti-pattern: `WHERE LOWER(username) = 'alice'`.
   - ✅ SARGable: Case-insensitive collation or expression index (`CREATE INDEX idx_user_lower ON users (LOWER(username));`).
2. **Composite Index Ordering (Equality Before Range):**
   - Rule: Place columns filtered with equality (`=`) first, followed by the column filtered with a range (`<`, `>`, `BETWEEN`), followed by columns in `ORDER BY`.
3. **Covering Indexes:**
   - Recommend `INCLUDE (col1, col2)` or composite keys to eliminate table lookups (Index Only Scan).

*(For execution plans and join strategies, consult `references/query_optimization.md`)*

---

## Standalone Tools Included in This Skill

- **`scripts/sql_dialect_transpiler.py`:** Standalone Python CLI to inspect queries, translate dialect syntax, and generate synthetic DDL schemas.
  ```bash
  python scripts/sql_dialect_transpiler.py --sql "SELECT IFNULL(name, 'N/A') FROM users WHERE date_sub(NOW(), INTERVAL 7 DAY);" --to postgresql
  ```
