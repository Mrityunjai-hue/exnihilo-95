# ExNihilo 95 — v4.0 Hardening, Flagship Features & Architecture Master Plan

## 0. Current State (Post-Commit `d0e17d7`) & Hard Rules

### Verified Production Gaps to Fix Immediately (Wave 1)
1. **Split-Brain Worker Catalog Desync:** `Desktop.tsx` executes SQL via `sqlWorkerClient`, but still instantiates `new SQLExecutor()` on line 98 and passes `executor.getCatalog()` to `IDEShell`, `ERDViewer` (line 1326), and `PocketSQLShell` (line 534). Result: SchemaTree, ERD, Pocket Tables, and CodeMirror autocomplete stay stuck at `0 tables` after query execution, AND the entire engine remains bundled in the main thread (`2,812 KB` decoded JS).
2. **Unwired IndexedDB Snapshots:** `saveDatabaseSnapshot` / `loadDatabaseSnapshot` / `listDatabaseSnapshots` in `useWorkspaceStorage.ts` have zero production callers.
3. **Turbopack vs. `@serwist/next`:** `next.config.ts` sets `turbopack: {}`, which skips `@serwist/next`'s Webpack service-worker emit so `/sw.js` is missing in production.
4. **Leftover Credibility & Asset Bugs:** Dead `$ npx exnihilo-sql` remains on `/download` and `/landing`; static `public/robots.txt` and `public/sitemap.xml` shadow `src/app/robots.ts` and `src/app/sitemap.ts`; `public/win95_ide_demo.webp` is 4.5 MB.
5. **Live UI & Mobile Regressions:** `ResultsGrid.tsx` line 863 renders `"TOTAL TOTAL"`; Cookie toast overlaps the status bar and Visual chart; `PocketSQLShell.tsx` clips lines horizontally, lacks iOS `100dvh`/`safe-area-inset-bottom`, lacks SQL keyword quick-bar, and cannot launch Challenges or CSV import.

### Non-Negotiable Engineering Rules
- **No Main-Thread Engine Duplication:** After Phase 7, `Desktop.tsx`, `IDEShell.tsx`, `ERDViewer.tsx`, and `PocketSQLShell.tsx` MUST NOT import `SQLExecutor`, `inference.ts`, `generator.ts`, or `@faker-js/faker`. All SQL execution and catalog state MUST come exclusively from `SQLWorkerClient` + a lightweight plain-object `CatalogSnapshotDTO`.
- **No Unwired Helpers:** Every utility function added MUST be wired into the live UI and exercised by an automated test assertion.
- **Gate After Every Phase:**
  ```bash
  npm run typecheck && npm run lint && npm test && npm run build
  ```

---

## WAVE 1 — Seal All d0e17d7 Regressions & Hit True < 1.5 MB Performance

### Phase 7 — Single-Source-of-Truth Worker Catalog & Main-Thread Engine Removal (P0 CRITICAL)

#### 7.1 Create Lightweight Main-Thread Catalog Store (`src/engine/worker/catalogAdapter.ts`)
- Pure, zero-dependency, JSON-serializable catalog wrapper (~80 LOC, NO imports from `sql.js`, `faker`, or `node-sql-parser`).
- Exports `ColumnDTO`, `TableEntryDTO`, `CatalogSnapshotDTO`.
- Exposes `ReadOnlyCatalogAdapter` with `.getAll()`, `.getDatabases()`, `.getTable(name, db)`, `.toAutocompleteMap()`.

#### 7.2 Return Full `CatalogSnapshotDTO` Automatically From `sql.worker.ts`
- In `src/engine/worker/sql.worker.ts`: after EVERY mutation/execution, return `catalog: serializeCatalog(executor)`.
- Extract FK metadata from `PRAGMA foreign_key_list` and 5 sample rows per table for ERD preview.
- In `SQLWorkerClient.ts`: dynamically load `SQLExecutor` only inside `typeof Worker === 'undefined'` so Webpack/Turbopack never bundles `executor.ts` into client main chunks.

#### 7.3 Remove `new SQLExecutor()` From `Desktop.tsx` and Re-Wire All Consumers
- In `Desktop.tsx`: delete `new SQLExecutor()`. Add `catalogSnapshot` state and subscribe to `sqlWorkerClient.onCatalogChange(setCatalogSnapshot)`.
- Update `IDEShell.tsx`, `SchemaTree.tsx`, `CreateTableWizard.tsx`, `CreateDatabaseDialog.tsx`, `FileTransferDialog.tsx`, `ERDViewer.tsx`, and `PocketSQLShell.tsx`.
- Audit `src/data/challenges/index.ts` to keep only metadata `{ id, title, difficulty, domain, companyTags, shard }`.

---

### Phase 8 — Wire Snapshots, Real Service Worker, Honesty Cleanup & Live UI/Mobile Polish (P0/P1)

#### 8.1 Wire IndexedDB Binary Snapshots End-to-End (`Desktop.tsx`, `Toolbar.tsx`, `IDEShell.tsx`)
- Auto-restore on boot (`loadDatabaseSnapshot('autosave_latest')`).
- Auto-save after schema/data mutations via `SQLWorkerClient.ts` debounced 1200ms.
- Add `💾 Snapshots` dialog in `Toolbar.tsx` for checkpointing and time-travel restore.

#### 8.2 Fix Production Service Worker (`public/sw.js`) Under Next.js 16
- Update `package.json` build or dedicated esbuild script so `public/sw.js` is ALWAYS emitted and verified.

#### 8.3 Finish Credibility, SEO & Asset Cleanup
- Remove dead `$ npx exnihilo-sql` from `/download` and `/landing`.
- Delete conflicting static `public/robots.txt` and `public/sitemap.xml`.
- Purge/compress `public/win95_ide_demo.webp` (4.5 MB).

#### 8.4 Fix Live Visual & Mobile Polish Bugs
- Fix "TOTAL TOTAL" in `ResultsGrid.tsx`.
- Fix Cookie toast overlap in `CookieConsentDialog.tsx`.
- Upgrade `PocketSQLShell.tsx`: `100dvh`, `safe-area-inset-bottom`, line wrapping, quick-insert bar, and modal triggers (Challenges, CSV import, Snapshots).
- Populate hidden edge cases in challenge shards.

---

## Phase 8.5 — Universal Semantic Schema & Hyper-Accurate Data Synthesis Engine v2.0 (CORE DIFFERENTIATOR)
- Layer 1: Universal Column Intelligence (`src/engine/column_intelligence.ts`) with 150+ calibrated biometric, scientific, telemetry, financial distributions and universal suffix/prefix grammar.
- Layer 2: Concept Taxonomy Graph (`src/engine/concept_taxonomy.ts`) mapping 120+ domains and 600+ concept stems.
- Layer 3: Reverse Domain Inference (`inferDomainFromColumns`).
- Layer 4: Statistical Distributions & Intra-Row Correlated Generator (`src/engine/row_correlator.ts`).
- Layer 5: Worker-native blueprint caching and test suite in `src/tests/engine/universal_synthesis_accuracy.test.ts`.

---

## WAVE 2 & 3 — Flagship Differentiators & Release Gate
- Phase 9: Interactive "What-If" Index Advisor & Live EXPLAIN Diff (`ExplainPlanViewer.tsx`).
- Phase 10: Safe DML Mutation Diff & 1-Click Undo (`ResultsGrid.tsx` + Worker).
- Phase 11: Full-Database URL Sharing v2 (`shareEncoder.ts`) & SQL Noir Case #3 (`case3_wallstreet_phantom.ts`).
- Phase 12: Playwright E2E Regression Suite (`e2e/exnihilo.spec.ts`) & Monolith Decomposition.
- Phase 13: Optional Opt-In Gemini SQL Copilot (`src/app/api/copilot/route.ts`).
