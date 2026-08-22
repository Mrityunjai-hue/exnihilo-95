# ARCHITECTURE.md — ExNihio

**Locked:** 2026-08-22  
**Phase:** 0 — Architecture verification complete

---

## Execution Engine Decision

### Verified: sql.js v1.14.2 — PASS, no fallback needed

The Phase 0 harness (`phase0_sqljs_test.cjs`) was run against the actual
installed `sql.js` build.  Exact output, unedited:

```
=== Phase 0: sql.js JOIN Verification ===

sql.js version: 1.14.2 (installed)

Embedded SQLite version: 3.49.1
(RIGHT JOIN + FULL OUTER JOIN require SQLite >= 3.39.0)

--- TEST 1: RIGHT JOIN ---
Query:
SELECT e.name AS employee, d.name AS department
FROM   employees e
RIGHT JOIN departments d ON e.dept_id = d.id

Columns: ["employee","department"]
Rows:
  [0] ["Alice","Engineering"]
  [1] ["Bob","Marketing"]
  [2] [null,"HR"]
Total rows: 3
RIGHT JOIN: PASS ✓

--- TEST 2: FULL OUTER JOIN ---
Query:
SELECT e.name AS employee, d.name AS department
FROM   employees e
FULL OUTER JOIN departments d ON e.dept_id = d.id

Columns: ["employee","department"]
Rows:
  [0] ["Alice","Engineering"]
  [1] ["Bob","Marketing"]
  [2] ["Carol",null]
  [3] ["Dave",null]
  [4] [null,"HR"]
Total rows: 5
FULL OUTER JOIN: PASS ✓

=== SUMMARY ===
RIGHT JOIN:      PASS ✓
FULL OUTER JOIN: PASS ✓

Decision: sql.js is sufficient — duckdb-wasm fallback NOT needed.
```

**Key finding:** `sql.js` v1.14.2 embeds **SQLite 3.49.1** (well above the
3.39.0 threshold where `RIGHT JOIN` and `FULL OUTER JOIN` were added).
Both join types execute correctly and return logically correct results —
`RIGHT JOIN` surfaces the unmatched `HR` department row with a `null`
employee, and `FULL OUTER JOIN` surfaces both unmatched employees (`Carol`
with no dept, `Dave` with a nonexistent dept) and the unmatched department
(`HR`) with `null` counterparts.

**duckdb-wasm fallback status:** NOT installed, NOT measured — not needed.
The fallback will be introduced only via lazy code-splitting if a future
regression appears (per Phase 0 decision: lazy-load, not eager).

---

## Confirmed Tech Stack

| Layer | Choice | Pinned version | Notes |
|---|---|---|---|
| Framework | Next.js + TypeScript | latest (15.x at scaffold time) | App Router, `src/` layout |
| Styling | Tailwind CSS + `xp.css` | Tailwind v4 (bundled by scaffold); xp.css to be installed Phase 7 | Tailwind for layout; xp.css for XP chrome |
| Query editor | CodeMirror 6 | to be pinned at Phase 8 install | Not Monaco — user decision |
| SQL parsing | `node-sql-parser` | to be pinned at Phase 1 install | MySQL / PostgreSQL / SQLite / TransactSQL |
| Execution engine | **`sql.js` v1.14.2** | **PINNED** — do not upgrade without re-running Phase 0 join tests | Embeds SQLite 3.49.1 |
| Synthetic data | `@faker-js/faker` | to be pinned at Phase 4 install | Seeded by table name for reproducibility |
| Deployment | **Vercel** | — | Static Next.js export; no backend |
| Settings panel | Separate XP-style dialog | — | Not inline toolbar; user decision |

---

## Architectural Constraints Locked Here

1. **Client-side only, no backend.** Every computation runs in the browser
   via WASM. This is a hard constraint — no server-side route may be added.

2. **sql.js API:** Uses CJS `require('sql.js')`, returns a promise resolving
   to the SQL namespace. `db.exec(sql)` returns `Array<{ columns: string[],
   values: any[][] }>`. Row data is accessed as `result[0].values`.

3. **WASM loading in Next.js:** `sql.js` ships a WASM binary
   (`node_modules/sql.js/dist/sql-wasm.wasm`). This must be copied to
   `/public/` or served via a custom Next.js config (`webpack.config` copy
   plugin) so the browser can fetch it at runtime. To be wired in Phase 5.

4. **Identifier normalization:** All table/column names lowercased before
   catalog lookup, across all four dialects. Intentional simplification
   documented in spec Section 3.1.

5. **duckdb-wasm fallback strategy:** Lazy-loaded via dynamic `import()` /
   code-splitting — only downloaded if sql.js fails a join at runtime.
   No eager load on page entry.

6. **SQLite dynamic typing caveat (spec Section 3.6):** SQLite will not
   catch every type-mismatch a stricter engine (Postgres, SSMS) would.
   This is a known, documented limitation of the client-side-only
   architecture, not a bug to paper over.

---

## Deviations from Spec

| Spec reference | Deviation | Reason |
|---|---|---|
| Section 4 — "sql.js: pin a version and verify" | Pinned at **v1.14.2** (latest at time of install) | Phase 0 empirical test passed; version locked going forward |
| Section 4 — duckdb-wasm fallback bundle size | Not measured — not needed | sql.js v1.14.2 passed both join tests; measuring duckdb-wasm bundle for a path not taken would be wasteful |
| Phase 0 decision — lazy-load duckdb-wasm | Confirmed in strategy above | Per user instruction: code-split, only loads if sql.js fails |
