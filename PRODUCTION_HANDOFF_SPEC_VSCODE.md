# Production Handoff Spec: exnihilo-vscode Extension (v2 — build-verified)

This is a corrected revision of the original spec. Every fix below closes a
specific gap that would otherwise have caused `npm test` to fail, the WASM
engine to fail to load in the extension host, the dialect rewriter to corrupt
valid SQL, session state to behave unpredictably, or `vsce package` to ship a
broken `.vsix`. Nothing architectural changed — the non-interference boundary,
the notebook APIs, and the renderer design are all kept as originally
specified because they were already correct.

**Fixes applied in this revision:**
1. `out/` vs `dist/` — test script now points at what actually gets compiled, and `pretest` builds both.
2. New **Phase 0** — verifies whether the WASM binary/glue from `exnihilo-95` is browser-only before Phase 1 starts.
3. Dialect rewriter is now AST-based (`node-sql-parser`), not regex — won't misfire on string literals or comments.
4. Session lifecycle is now explicit — per-notebook engine map, disposal on close, no persistence across reloads (by design).
5. `.vscodeignore` is now written out, and the build copies `sqlite3.wasm` into `dist/` so it can't be swept up by the ignore glob.
6. `tsconfig.json` module settings simplified to avoid the Node16 extension-in-imports footgun; role of `tsc -b` documented.

---

## 1. Project Overview & Non-Interference Guardrail

```
+-------------------------------------------------------------+
| REPO: exnihilo-95 (Web)        | REPO: exnihilo-vscode      |
| Next.js + React + WASM + Win95 | Pure TypeScript + WASM     |
| (IMMUTABLE - DO NOT MODIFY)    | (NEW EXTENSION REPO)       |
+-------------------------------------------------------------+
```

**Rule 1:** The `exnihilo-95` web repository remains completely untouched. No shared monorepo, no symlinks, no changes to web code — including for Phase 0's WASM investigation, which only *reads* the web repo's build artifacts, never edits them.

**Rule 2:** The extension repository is initialized in an isolated directory and extracts pure TypeScript engine modules (AST parsing, dialect rewriters, SQLite WASM executor) without DOM, React, or browser-storage dependencies.

---

## 2. Directory Structure & File Map

```
exnihilo-vscode/
├── .vscode/
│   ├── launch.json                   # Extension debugging configuration
│   └── tasks.json                    # Build & compile tasks
├── src/
│   ├── engine/
│   │   ├── parser/
│   │   │   ├── ast-builder.ts        # AST tokenization & extraction
│   │   │   ├── dialect-rewriter.ts   # PG/MySQL/T-SQL -> SQLite, via node-sql-parser AST
│   │   │   └── validator.ts          # Syntax and non-standard query validation
│   │   ├── catalog/
│   │   │   ├── session-catalog.ts    # In-memory DDL, schema, view & trigger metadata
│   │   │   └── types.ts
│   │   ├── wasm/
│   │   │   ├── sqlite-bridge.ts      # Node-target WASM init, loads from dist/wasm at runtime
│   │   │   └── sqlite3.wasm          # SOURCE copy (Node-target build — see Phase 0)
│   │   └── index.ts                  # HeadlessEngine execution interface
│   ├── notebook/
│   │   ├── types.ts
│   │   ├── serializer.ts             # vscode.NotebookSerializer implementation
│   │   └── controller.ts             # vscode.NotebookController + per-notebook engine map
│   ├── diagnostics/
│   │   └── linter.ts
│   ├── renderer/
│   │   ├── index.ts
│   │   └── table.css
│   └── extension.ts                  # activate() / deactivate()
├── test/
│   ├── engine/                       # Mocha unit specs for AST & execution
│   │   └── wasm-load.test.ts         # NEW — instantiates engine in plain Node, catches browser-global leaks
│   ├── suite/
│   │   └── index.ts                  # Mocha suite entrypoint for @vscode/test-electron
│   └── runTest.ts                    # NEW — @vscode/test-electron launcher (was implied, never specified)
├── .vscodeignore                     # NOW WRITTEN OUT — see Section 3
├── esbuild.js                        # Bundles extension+renderer, copies wasm into dist/
├── package.json
└── tsconfig.json
```

---

## 3. Configuration & Manifest Specification

### package.json

```json
{
  "name": "exnihilo-vscode",
  "displayName": "ExNihilo SQL Notebooks & Engine",
  "description": "Offline, zero-config SQL notebooks with AST rewriting and SQLite WASM execution.",
  "version": "1.0.0",
  "publisher": "exnihilo",
  "engines": { "vscode": "^1.90.0" },
  "categories": ["Programming Languages", "Notebooks", "Data Science"],
  "main": "./dist/extension.js",
  "contributes": {
    "languages": [
      { "id": "sql", "extensions": [".sql"] },
      { "id": "exnihilo-sql", "aliases": ["ExNihilo SQL"], "extensions": [".exnihilosql"] }
    ],
    "notebooks": [
      {
        "type": "exnihilo-notebook",
        "displayName": "ExNihilo SQL Notebook",
        "selector": [{ "filenamePattern": "*.exnihilo" }]
      }
    ],
    "notebookRenderer": [
      {
        "id": "exnihilo-table-renderer",
        "displayName": "ExNihilo Virtualized Table",
        "entrypoint": "./dist/renderer.js",
        "mimeTypes": ["application/vnd.exnihilo.table+json"]
      }
    ],
    "commands": [
      { "command": "exnihilo.resetSession", "title": "ExNihilo: Reset In-Memory Database Session", "category": "ExNihilo" },
      { "command": "exnihilo.exportSchema", "title": "ExNihilo: Export In-Memory Schema", "category": "ExNihilo" }
    ]
  },
  "scripts": {
    "vscode:prepublish": "npm run build",
    "compile": "tsc -b",
    "watch": "tsc -b -w",
    "build": "node esbuild.js --production",
    "pretest": "npm run compile && npm run build",
    "test": "node ./out/test/runTest.js",
    "package": "vsce package"
  },
  "devDependencies": {
    "@types/node": "^20.x",
    "@types/vscode": "^1.90.0",
    "@types/vscode-notebook-renderer": "^1.72.0",
    "@types/mocha": "^10.x",
    "@vscode/test-electron": "^2.4.0",
    "@vscode/vsce": "^2.30.0",
    "esbuild": "^0.21.0",
    "glob": "^10.x",
    "mocha": "^10.x",
    "node-sql-parser": "^4.x",
    "typescript": "^5.4.0"
  }
}
```

**Why `pretest` changed:** `@vscode/test-electron` launches a real VS Code instance and loads the extension the normal way — via `package.json`'s `main` field, i.e. `dist/extension.js`. That file only exists after `esbuild.js` runs. `tsc -b` alone (which only produces `out/`) is not enough to make the extension loadable, so `pretest` now runs both the type-check/test-compile step and the bundle step.

**Why `node-sql-parser` is a real dependency now:** it's what Phase 4's rewriter uses instead of regex (see below), so it has to be installed, not just named in prose.

### tsconfig.json

```json
{
  "compilerOptions": {
    "module": "CommonJS",
    "moduleResolution": "Node",
    "target": "ES2022",
    "lib": ["ES2022"],
    "outDir": "out",
    "rootDir": ".",
    "sourceMap": true,
    "strict": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*", "test/**/*"]
}
```

**Two changes from the original, both deliberate:**

- `rootDir` is now `"."` and `include` covers `test/**/*` as well as `src/**/*`. This is what actually fixes the `out`/`dist` mismatch: `tsc -b` now compiles both `src/` and `test/` into `out/src/...` and `out/test/...`, which is exactly what `test/runTest.js` (compiled from `test/runTest.ts`) needs to exist at `out/test/runTest.js` — matching the `test` script above.
- `module`/`moduleResolution` changed from `Node16`/`Node16` to `CommonJS`/`Node`. `Node16` module resolution requires explicit file extensions in relative imports (e.g. `import { x } from './foo.js'` even from a `.ts` file) unless you're fully committed to native ESM output, which this project isn't — `esbuild.js` bundles everything to CJS for the actual shipped extension. Keeping `tsc` on plain CommonJS avoids implementers hitting confusing "relative import paths need explicit file extensions" errors for no benefit, since `tsc -b` here exists only for type-checking and compiling the test harness — **it is not the production build**. `esbuild.js` (`format: 'cjs'`) is solely responsible for `dist/extension.js` and `dist/renderer.js`, which is what actually ships in the `.vsix`.

### .vscodeignore

```
.vscode/**
.vscode-test/**
.gitignore
.yarnrc
esbuild.js
tsconfig.json
src/**
test/**
out/**
node_modules/**
**/*.map
**/*.ts
**/tsconfig.json
**/.eslintrc.json
vsc-extension-quickstart.md
```

Deliberately **not** listed: `dist/**`. Everything the extension needs at runtime — `dist/extension.js`, `dist/renderer.js`, and `dist/wasm/sqlite3.wasm` (copied there by the build, see Phase 6) — lives under `dist/`, so it's included in the `.vsix` by default. This was the original spec's actual risk: the WASM binary lived only under `src/engine/wasm/`, which the ignore list correctly excludes, so if the build never copied it out to `dist/`, packaging would silently ship a broken extension. That copy step is now mandatory, not optional (Phase 6).

---

## 4. Phase 0: WASM Target Verification (new — blocks Phase 1)

Before extracting `sqlite-bridge.ts`, confirm what you're actually extracting.

1. Inspect `exnihilo-95`'s existing WASM loader glue code (read-only — Rule 1 still applies). Determine whether it was built for `ENVIRONMENT=web` (calls `fetch`, `importScripts`, or `WebAssembly.instantiateStreaming` against a URL) or is a universal/Node-compatible build.
2. If it's browser-only — which is the common case for `sql.js`/`wa-sqlite`-style builds pulled into a Next.js app — do **not** attempt to reuse the glue file as-is inside the extension host. Choose one:
   - **Option A (preferred):** use a Node-target SQLite WASM distribution as a fresh dependency of `exnihilo-vscode` — e.g. the Node build of `sql.js`, `wa-sqlite`'s Node/ESM target, or `better-sqlite3` (native binding, not WASM) if WASM parity with the web app isn't a hard requirement.
   - **Option B:** recompile the same Emscripten SQLite source `exnihilo-95` uses, with `-sENVIRONMENT=node` (or `'web,node'`), producing a second binary that lives only in `exnihilo-vscode/src/engine/wasm/`. This still respects Rule 1 — nothing in the web repo changes, you're just building the same source a second time for a different target.
3. Whichever option is chosen, `sqlite-bridge.ts` must load it via `fs.promises.readFile` (or `vscode.workspace.fs.readFile` against `context.extensionUri`) into a `Buffer`/`Uint8Array`, then `WebAssembly.instantiate(buffer, imports)` — no `fetch`, no `document`, no `window`.
4. Add `test/engine/wasm-load.test.ts` that instantiates `HeadlessEngine` in a **plain Node process**, not just inside the extension host — this catches any residual browser-global reference (e.g. an accidental `self` or `window` reference deep in glue code) well before it becomes a Phase 1–5 blocker.
5. Record the final decision (package + version, or recompiled-binary provenance and build flags) at the top of `src/engine/wasm/sqlite-bridge.ts` as a comment, so Phase 1 doesn't start on an unconfirmed assumption.

---

## 5. Phase 1: Pure Headless Engine Integration

**File: `src/engine/wasm/sqlite-bridge.ts`**
- Load the WASM binary chosen in Phase 0 from `vscode.Uri.joinPath(context.extensionUri, 'dist', 'wasm', 'sqlite3.wasm')` at runtime — **not** from `src/engine/wasm/`, which won't exist in the packaged extension (see `.vscodeignore`, Section 3).
- Instantiate the module in-memory with no browser globals, per Phase 0's confirmed approach.

**File: `src/engine/parser/dialect-rewriter.ts`**

Transformations to support:
- `STRING_AGG(expr, delimiter)` → `GROUP_CONCAT(expr, delimiter)`
- `GROUP_CONCAT(expr SEPARATOR sep)` → `GROUP_CONCAT(expr, sep)`
- `TRUNCATE TABLE tablename` → `DELETE FROM tablename` + catalog reset

**File: `src/engine/index.ts`**

```typescript
export interface QueryColumn {
  name: string;
  type: string;
}
export interface ExecutionResult {
  columns: QueryColumn[];
  rows: (string | number | boolean | null)[][];
  executionTimeMs: number;
  rowCount: number;
}
export class HeadlessEngine {
  constructor(private wasmBinary: Uint8Array) {}
  public async init(): Promise<void>;
  public async execute(sql: string): Promise<ExecutionResult>;
  public reset(): Promise<void>;
  public dispose(): void;              // NEW — releases WASM memory/handles; called on notebook close (Phase 3)
  public getCatalog(): SessionCatalog;
}
```

---

## 6. Phase 2: Notebook Serializer (`.exnihilo`)

**File: `src/notebook/types.ts`**

```typescript
export interface RawNotebookCell {
  kind: 'markup' | 'code';
  language: string;
  value: string;
  metadata?: Record<string, unknown>;
}
export interface RawNotebookDocument {
  version: number;
  cells: RawNotebookCell[];
}
```

**File: `src/notebook/serializer.ts`** — implements `vscode.NotebookSerializer`:
- `deserializeNotebook(content, token)`: decode UTF-8 → JSON; fall back to a single empty SQL code cell on parse failure or empty buffer. `"markup"` → `NotebookCellKind.Markup` (language `markdown`); `"code"` → `NotebookCellKind.Code` (language `sql` or `exnihilo-sql`).
- `serializeNotebook(data, token)`: map cells into `RawNotebookDocument`, encode with `TextEncoder().encode(...)`.

---

## 7. Phase 3: Notebook Execution Controller

**File: `src/notebook/controller.ts`**

- `vscode.notebooks.createNotebookController('exnihilo-controller', 'exnihilo-notebook', 'ExNihilo SQL Engine')`
- `controller.supportedLanguages = ['sql', 'exnihilo-sql']`
- `controller.supportsExecutionOrder = true`

**Session lifecycle (explicit — was implicit before):**

```typescript
const engines = new Map<string /* notebook.uri.toString() */, HeadlessEngine>();

function getOrCreateEngine(uri: vscode.Uri): Promise<HeadlessEngine> {
  const key = uri.toString();
  if (!engines.has(key)) {
    engines.set(key, new HeadlessEngine(wasmBinary)); // init() awaited by caller before first use
  }
  return engines.get(key)!;
}

vscode.workspace.onDidCloseNotebookDocument(nb => {
  const key = nb.uri.toString();
  engines.get(key)?.dispose();
  engines.delete(key);
});
```

Rules this makes explicit:
- **One engine per open notebook document**, keyed by URI — no schema/table sharing across two simultaneously open `.exnihilo` files.
- **State does not persist across a VS Code window reload or extension host restart.** This is by design (the session is an in-memory SQLite database, matching the web app's behavior) — not a bug to fix later. If a user needs their schema to survive a reload, that's a "keep a setup cell at the top of the notebook" workflow, not something the extension guarantees.
- `exnihilo.resetSession` command clears the current notebook's entry from `engines` (or calls `.reset()`), so the next cell execution starts a fresh session for that notebook only.

**Per-cell execution handler**, unchanged from original:

```typescript
const execution = controller.createNotebookCellExecution(cell);
execution.start(Date.now());
try {
  const result = await engine.execute(cell.document.getText());
  const jsonOutput = vscode.NotebookCellOutputItem.json(result, 'application/vnd.exnihilo.table+json');
  const mdFallback = vscode.NotebookCellOutputItem.text(renderMarkdownTable(result), 'text/markdown');
  await execution.replaceOutput([new vscode.NotebookCellOutput([jsonOutput, mdFallback])]);
  execution.end(true, Date.now());
} catch (err) {
  await execution.replaceOutput([
    new vscode.NotebookCellOutput([
      vscode.NotebookCellOutputItem.error({ name: 'SQLExecutionError', message: err.message, stack: err.stack })
    ])
  ]);
  execution.end(false, Date.now());
}
```

---

## 8. Phase 4: AST Diagnostics & Dialect Linter

**File: `src/diagnostics/linter.ts`** — unchanged from original:
- `vscode.languages.createDiagnosticCollection('exnihilo-sql')`
- Debounce `onDidChangeTextDocument` by 300ms for `.sql`/`.exnihilo` buffers
- Run `validateQuery(text)`; emit `Information`/`Warning` diagnostics for auto-normalized dialect syntax, `Error` diagnostics (with computed line/column) for genuinely invalid SQL
- `collection.set(document.uri, diagnostics)`

**File: `src/engine/parser/dialect-rewriter.ts` — mechanism, now specified**

The original spec listed transformations but not *how* they're applied, which is what made regex the likely (and unsafe) default — a regex replace of `STRING_AGG` or `TRUNCATE` would also fire inside string literals, comments, or identifiers containing those substrings. Use an actual SQL parser instead:

```typescript
import { Parser } from 'node-sql-parser';

const parser = new Parser();

export class DialectParseError extends Error {
  constructor(public readonly sql: string, public readonly cause: Error) {
    super(`Failed to parse SQL for dialect rewriting: ${cause.message}`);
  }
}

export function rewriteToSqlite(
  sql: string,
  sourceDialect: 'postgresql' | 'mysql' | 'transactsql'
): { sql: string; notes: string[] } {
  let ast;
  try {
    ast = parser.astify(sql, { database: sourceDialect });
  } catch (cause) {
    // Do NOT fall back to regex here — surface as a diagnostics-layer parse
    // error instead of guessing at a rewrite. Unparseable input is exactly
    // the case where blind text substitution is most dangerous.
    throw new DialectParseError(sql, cause as Error);
  }

  const notes: string[] = [];
  // Walk `ast` (or ast[] for multi-statement input) rewriting function-call
  // nodes: STRING_AGG -> GROUP_CONCAT, GROUP_CONCAT(... SEPARATOR ...) ->
  // GROUP_CONCAT(...,...), TRUNCATE TABLE -> DELETE FROM + catalog reset
  // flag. Each rewrite pushes a human-readable note for the linter to
  // surface as an Information diagnostic.

  const rewrittenSql = parser.sqlify(ast, { database: 'sqlite' });
  return { sql: rewrittenSql, notes };
}
```

Because the rewrite operates on parsed AST nodes and regenerates SQL text via `sqlify`, it can't misfire on a string literal or comment that happens to contain the text `STRING_AGG` — the parser already knows that content isn't a function call. A parse failure is treated as a genuine syntax error and routed to the `Error`-severity diagnostic path in `linter.ts`, not silently passed through.

---

## 9. Phase 5: Output Table Renderer

Unchanged from original — this part was already correct.

**File: `src/renderer/index.ts`**

```typescript
import type { ActivationFunction } from 'vscode-notebook-renderer';

export const activate: ActivationFunction = (context) => {
  return {
    renderOutputItem(outputItem, element) {
      const data = outputItem.json();
      element.innerHTML = '';

      const container = document.createElement('div');
      container.className = 'exnihilo-table-container';

      const table = document.createElement('table');
      table.className = 'exnihilo-table';

      const thead = document.createElement('thead');
      const headerRow = document.createElement('tr');
      data.columns.forEach((col: { name: string; type: string }) => {
        const th = document.createElement('th');
        th.textContent = `${col.name} (${col.type})`;
        headerRow.appendChild(th);
      });
      thead.appendChild(headerRow);
      table.appendChild(thead);

      const tbody = document.createElement('tbody');
      const displayRows = data.rows.slice(0, 500);
      displayRows.forEach((row: unknown[]) => {
        const tr = document.createElement('tr');
        row.forEach((cellVal) => {
          const td = document.createElement('td');
          td.textContent = cellVal === null ? 'NULL' : String(cellVal);
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);
      container.appendChild(table);

      if (data.rows.length > 500) {
        const notice = document.createElement('div');
        notice.className = 'exnihilo-truncation-notice';
        notice.textContent = `Showing 500 of ${data.rows.length} rows`;
        container.appendChild(notice);
      }

      element.appendChild(container);
    }
  };
};
```

**File: `src/renderer/table.css`** — VS Code CSS variable theming, unchanged from original.

---

## 10. Phase 6: Build Automation (`esbuild.js`)

```javascript
const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const isProduction = process.argv.includes('--production');
const watch = process.argv.includes('--watch');

function copyWasmAsset() {
  const src = path.join(__dirname, 'src/engine/wasm/sqlite3.wasm');
  const destDir = path.join(__dirname, 'dist/wasm');
  fs.mkdirSync(destDir, { recursive: true });
  fs.copyFileSync(src, path.join(destDir, 'sqlite3.wasm'));
}

async function main() {
  const extensionCtx = await esbuild.context({
    entryPoints: ['src/extension.ts'],
    bundle: true,
    format: 'cjs',
    minify: isProduction,
    sourcemap: !isProduction,
    sourcesContent: false,
    platform: 'node',
    outfile: 'dist/extension.js',
    external: ['vscode'],
    logLevel: 'info',
  });

  const rendererCtx = await esbuild.context({
    entryPoints: ['src/renderer/index.ts'],
    bundle: true,
    format: 'iife',
    minify: isProduction,
    sourcemap: !isProduction,
    sourcesContent: false,
    platform: 'browser',
    outfile: 'dist/renderer.js',
    logLevel: 'info',
  });

  if (watch) {
    copyWasmAsset();
    await Promise.all([extensionCtx.watch(), rendererCtx.watch()]);
  } else {
    await Promise.all([extensionCtx.rebuild(), rendererCtx.rebuild()]);
    copyWasmAsset(); // NEW — esbuild bundles JS/TS, it will not copy a binary WASM file on its own
    await Promise.all([extensionCtx.dispose(), rendererCtx.dispose()]);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

This is the fix that closes the loop with Section 3: `sqlite-bridge.ts` reads from `dist/wasm/sqlite3.wasm`, this script is what puts it there, and `.vscodeignore` doesn't exclude `dist/**` — so the binary reliably ends up in the packaged `.vsix` instead of depending on nobody ever touching the ignore list.

---

## 11. Test Harness (new — was referenced but never specified)

**File: `test/runTest.ts`**

```typescript
import * as path from 'path';
import { runTests } from '@vscode/test-electron';

async function main() {
  try {
    const extensionDevelopmentPath = path.resolve(__dirname, '../../');
    const extensionTestsPath = path.resolve(__dirname, './suite/index');
    await runTests({ extensionDevelopmentPath, extensionTestsPath });
  } catch (err) {
    console.error('Failed to run tests', err);
    process.exit(1);
  }
}
main();
```

**File: `test/suite/index.ts`** — standard Mocha runner boilerplate: creates a `Mocha` instance, globs `**/*.test.js` under the compiled `out/test/` directory, and runs them inside the launched VS Code instance. `test/engine/wasm-load.test.ts` (Phase 0, item 4) is a plain Node-context test and can run either inside this suite or separately via a direct `mocha out/test/engine/wasm-load.test.js` — either is fine as long as it's exercised in CI without requiring the full extension host.

With Section 3's `pretest` script (`compile` then `build`) and this file existing, `npm test` now has a real, reachable entrypoint at `out/test/runTest.js`, and the extension it loads (`dist/extension.js`) actually exists by the time the test electron instance starts.

---

## 12. Definition of Done & Quality Gates

- [ ] `npm run build` succeeds with zero TypeScript errors or missing imports.
- [ ] Phase 0's WASM target decision is recorded in `sqlite-bridge.ts` and confirmed via `wasm-load.test.ts` running in a plain Node process, not just inside the extension host.
- [ ] `npm test` runs end-to-end: `pretest` produces both `out/` and `dist/`, `out/test/runTest.js` exists, and it successfully loads `dist/extension.js` in the launched VS Code instance.
- [ ] Creating a sample `.exnihilo` file natively opens the VS Code notebook interface.
- [ ] Adding Markdown cells and SQL code cells preserves data accurately on file save/reload.
- [ ] SQL execution retains schema state within a single notebook: `CREATE TABLE t (id INT);` in cell 1 allows `SELECT * FROM t;` to run in cell 2 — and confirm state does *not* leak to a second, simultaneously open `.exnihilo` file.
- [ ] Closing a notebook disposes its `HeadlessEngine` (no leaked WASM memory across many open/close cycles).
- [ ] Multi-dialect transformations (`STRING_AGG`, `TRUNCATE`, `FULL OUTER JOIN`) execute correctly via the `node-sql-parser` AST rewrite — including a query that contains one of those keywords inside a string literal or a `--` comment, to confirm it's *not* rewritten.
- [ ] A deliberately malformed query hits the `DialectParseError` path and surfaces as an `Error`-severity diagnostic, not a silently-passed-through (and possibly wrong) rewrite.
- [ ] `vsce package` outputs a valid `.vsix`; unzip it and confirm `dist/wasm/sqlite3.wasm`, `dist/extension.js`, and `dist/renderer.js` are all present inside.
