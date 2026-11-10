# SQL Query Optimization & Indexing Playbook

A practical guide for AI agents to audit slow queries, interpret execution plans, diagnose anti-patterns, and recommend optimal indexing structures.

---

## 1. The Cardinal Rule of SARGability
A query predicate is **SARGable** (Search ARGument ABLE) if the database query engine can use a B-tree index seek rather than scanning every row in the table (Index or Table Scan).

### Common SARGability Violations & Fixes

#### A. Wrapping Indexed Columns in Functions
* ❌ **Slow (Index Scan):**
  ```sql
  WHERE YEAR(created_at) = 2026;
  ```
* ✅ **Fast (Index Seek):**
  ```sql
  WHERE created_at >= '2026-01-01' AND created_at < '2027-01-01';
  ```

#### B. Leading Wildcards in `LIKE`
* ❌ **Slow (Index Scan):**
  ```sql
  WHERE email LIKE '%@gmail.com';
  ```
* ✅ **Fix:** If suffix searching is frequent, store a reversed column (`email_reversed`) indexed with trailing wildcards:
  ```sql
  WHERE email_reversed LIKE 'moc.liamg@%';
  ```
  Or use a trigram GIN index (PostgreSQL: `CREATE INDEX idx_email_trgm ON users USING gin (email gin_trgm_ops);`).

#### C. Implicit Type Conversions
* ❌ **Slow:** Filtering a string column with a numeric literal:
  ```sql
  WHERE phone_number = 1234567890; -- Forces database to CAST(phone_number AS BIGINT) for all rows
  ```
* ✅ **Fast:** Always match literal types to column types:
  ```sql
  WHERE phone_number = '1234567890';
  ```

---

## 2. Composite Index Column Ordering (The ESR Rule)

When designing a composite index covering multiple filter conditions:
**E - Equality | S - Sort | R - Range**

1. **Equality Columns First:** Place columns tested with `=` or `IS NULL` first in the index.
2. **Sort Columns Second:** If sorting (`ORDER BY`) matches the order of equality-filtered columns, index those columns next to avoid an explicit in-memory Sort step.
3. **Range Columns Last:** Place columns tested with `<`, `>`, `<=`, `>=`, `BETWEEN`, or `LIKE 'prefix%'` at the end. Once an index encounters a range predicate, subsequent columns cannot be used for seeking.

### Example:
Query:
```sql
SELECT id, total
FROM orders
WHERE customer_id = 42          -- Equality
  AND status = 'COMPLETED'      -- Equality
  AND order_date >= '2026-01-01' -- Range
ORDER BY order_date DESC;
```
**Optimal Index:**
```sql
CREATE INDEX idx_orders_cust_status_date
ON orders (customer_id, status, order_date DESC);
```

---

## 3. Covering Indexes (Index-Only Scans)

When a query can be satisfied entirely from the B-tree leaf nodes without accessing the heap or base table pages, the database performs an **Index Only Scan** (PostgreSQL) or **Covering Index Seek** (SQL Server/MySQL).

### Using `INCLUDE` Columns
Instead of adding extra columns to the B-tree search key (which increases index size and depth), store them in the leaf pages:
```sql
-- PostgreSQL & T-SQL
CREATE INDEX idx_orders_lookup
ON orders (customer_id, status)
INCLUDE (total, tracking_number);
```

---

## 4. Join Optimization Strategies

### A. Join Algorithm Characteristics
| Join Type | Best Used When | Memory Footprint | Requires Index? |
| :--- | :--- | :--- | :--- |
| **Nested Loop** | One table is small; the other table has a fast index seek on the join column. | Very Low (streaming) | Yes (on inner table) |
| **Hash Join** | Joining two large, unsorted datasets with equality predicates. | High (builds in-memory hash table) | No |
| **Merge Join** | Both datasets are already sorted on the join key (e.g. from an index or previous sort). | Moderate | Helpful if presorted |

### B. Subquery Unnesting
* ❌ Correlated Subquery:
  ```sql
  SELECT u.id, (SELECT MAX(o.total) FROM orders o WHERE o.user_id = u.id) as max_spend
  FROM users u;
  ```
* ✅ Clean Join + Aggregate:
  ```sql
  SELECT u.id, MAX(o.total) as max_spend
  FROM users u
  LEFT JOIN orders o ON u.id = o.user_id
  GROUP BY u.id;
  ```

---

## 5. Execution Plan Interpretation Guide (`EXPLAIN`)

| Signal / Node | What It Means | Action to Take |
| :--- | :--- | :--- |
| **Seq Scan / Table Scan** | Scanning entire table without using index. | Check if WHERE clause is SARGable; add missing index if table has >1,000 rows. |
| **Bitmap Heap Scan** | Index found matching rows, now fetching pages. | Acceptable for medium selectivity; consider covering index if frequent. |
| **Sort Node (Disk / External)** | In-memory `work_mem` was exceeded; sorting spilled to disk temp files. | Add index matching `ORDER BY`, or increase `work_mem` (PostgreSQL). |
| **Nested Loop with High Loops** | Re-executing inner query millions of times. | Verify inner table has an index on join foreign key. |
