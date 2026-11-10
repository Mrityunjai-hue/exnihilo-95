# ExNihilo: Schema Inference & Synthetic Data Generation

This reference details the algorithms used by ExNihilo 95 to convert bare SQL queries into fully realized, executable relational databases with zero configuration.

---

## 1. The Core Problem
When engineers, students, or data analysts prompt an AI coding agent with a complex query (e.g. `SELECT o.id, c.name, SUM(oi.price) FROM orders o JOIN customers c ON ...`), existing agents frequently fail by either:
1. Refusing to run or test the query due to missing table schemas.
2. Generating flat, mismatched tables that break on joins or foreign key checks.
3. Guessing arbitrary column data types that cause syntax or calculation errors.

ExNihilo eliminates this bottleneck by treating the query itself as a strict contract of intent.

---

## 2. AST Reference-Site Scanning

When analyzing a query:
1. **Physical Table Extraction:** Scan all `FROM`, `INNER JOIN`, `LEFT JOIN`, `RIGHT JOIN`, `FULL JOIN`, and `CROSS JOIN` nodes.
2. **Exclusion of Virtual Tables:** Any identifier defined within a Common Table Expression (`WITH cte AS (...)`) or subquery alias is excluded from physical DDL generation.
3. **Alias Map:** Build an alias dictionary:
   ```json
   {
     "o": "orders",
     "c": "customers",
     "oi": "order_items"
   }
   ```
4. **Column Disambiguation:**
   - Explicit references (`o.customer_id`) bind directly to their target table (`orders.customer_id`).
   - Unqualified references (`SELECT email FROM users`) bind to the single table in scope, or are flagged for multi-table ambiguity resolution.

---

## 3. Strict Type Inference Hierarchy

When determining the SQL type of an inferred column, evaluate evidence rules in descending priority order. The highest priority signal always wins:

```
[Level 6] Explicit CAST / Type Coercion (e.g., CAST(col AS INT), col::numeric)
   │
[Level 5] Typed Literal Comparison (e.g., col > 100, col = '2026-01-01', col IS TRUE)
   │
[Level 4] Function & Operator Context (e.g., SUM(col), LIKE '%...', DATE_ADD(col, ...))
   │
[Level 3] GROUP BY / Categorical Context (e.g., GROUP BY status)
   │
[Level 2] Semantic Column Name Heuristics (e.g., *_id, email, price, created_at)
   │
[Level 1] Universal Fallback -> VARCHAR(255)
```

### Signal Rules Reference Table

| Evidence Level | Code Pattern | Inferred Type | SQLite DDL | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Level 6** | `CAST(col AS INTEGER)` | `INTEGER` | `INTEGER` | Explicit developer intent |
| **Level 5** | `col = 42` or `col IN (1, 2)` | `INTEGER` | `INTEGER` | Numeric literal without decimal |
| **Level 5** | `col = 99.95` | `NUMERIC` | `REAL` | Numeric literal with decimal |
| **Level 5** | `col = '2026-03-15'` | `DATE` | `TEXT` | Standard ISO-8601 date string |
| **Level 5** | `col = TRUE` or `col IS FALSE`| `BOOLEAN` | `INTEGER` | Boolean truth values |
| **Level 4** | `col LIKE '%abc%'` or `col \|\| ...` | `VARCHAR(255)` | `TEXT` | String pattern matching / concat |
| **Level 4** | `SUM(col)` or `AVG(col)` | `NUMERIC(12,2)` | `REAL` | Continuous arithmetic aggregate |
| **Level 4** | `COUNT(col)` | *Passthrough* | — | Does not constrain column type |
| **Level 4** | `DATE_ADD(col, ...)` / `strftime` | `DATE` or `TIMESTAMP`| `TEXT` | Temporal function argument |
| **Level 3** | `GROUP BY col` (without math) | `VARCHAR(100)` | `TEXT` | Categorical grouping column |
| **Level 2** | `id`, `user_id`, `company_id` | `INTEGER` | `INTEGER` | Identifier / Foreign key pointer |
| **Level 2** | `email`, `mail` | `VARCHAR(255)` | `TEXT` | Electronic mail address format |
| **Level 2** | `price`, `amount`, `salary` | `NUMERIC(10,2)` | `REAL` | Currency / Monetary value |
| **Level 2** | `created_at`, `timestamp` | `TIMESTAMP` | `TEXT` | ISO-8601 Timestamp string |
| **Level 2** | `is_active`, `has_discount` | `BOOLEAN` | `INTEGER` | Binary flag |
| **Level 1** | *No other signal matched* | `VARCHAR(255)` | `TEXT` | Safe permissive default |

---

## 4. Referential Integrity & Foreign Key Topology

To generate mock data that actually produces query results when joins execute:

1. **Extract Relationships from Join Predicates:**
   - Pattern: `ON orders.customer_id = customers.id`
   - Inferred: `orders.customer_id` is a `FOREIGN KEY` referencing `customers.id`.
   - Dependency Order: `customers` must be created and seeded **before** `orders`.
2. **Topological Sort:**
   - Order table generation such that root parent tables are populated first.
   - Collect all generated primary keys (`id` values 1 through 20) into a parent key pool.
3. **Child Population with Join Match Ratios:**
   - **`INNER JOIN` Relationships:** Set the child's foreign key column to random values drawn strictly from the parent key pool (100% referential integrity match).
   - **`LEFT JOIN` Relationships:**
     - 80% to 85% of child records receive valid parent IDs.
     - 15% to 20% of records receive `NULL` or non-existent IDs. This ensures `WHERE parent.id IS NULL` tests pass realistically!
   - **Self-Referential Joins (e.g. `employees.manager_id = employees.id`):**
     - Row 1 (CEO / Top executive) has `manager_id = NULL`.
     - Subsequent rows randomly select a `manager_id` from previously inserted employee IDs (`id < current_id`), preventing circular reference loops.

---

## 5. Domain-Aware Synthetic Mock Data Generation

When seeding columns, use semantic name matching to provide human-readable, realistic data:

```python
# Semantic value templates
DOMAIN_TEMPLATES = {
    "email": ["alice.smith@example.com", "bob.dev@enterprise.org", "carol.w@tech.co"],
    "first_name": ["Alice", "Bob", "Charlie", "David", "Emma", "Fiona", "Grace"],
    "last_name": ["Miller", "Davis", "Johnson", "Patel", "Chen", "Williams"],
    "company": ["Acme Corp", "Globex Inc", "Initech", "Umbrella Corp", "Stark Industries"],
    "status": ["PENDING", "COMPLETED", "SHIPPED", "CANCELLED", "ACTIVE"],
    "country": ["United States", "Germany", "Japan", "India", "United Kingdom", "Canada"],
    "department": ["Engineering", "Product", "Sales", "Marketing", "Finance", "Human Resources"]
}
```

By producing deterministic, seeded data (15 to 25 rows per table), the agent can execute the query in SQLite/PostgreSQL, verify the result set, and present a complete, working reproduction to the user.
