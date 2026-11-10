<p align="center">
  <h1 align="center">🗄️ ExNihilo 95 — Zero-Config In-Browser SQL IDE & Challenge Arena</h1>
  <p align="center">
    <strong>Run SQL queries instantly against non-existent tables without creating schemas or databases.</strong>
  </p>
</p>

<p align="center">
  <a href="https://exnihilo-95.vercel.app">
    <img src="exnihilo_demo.gif" alt="ExNihilo 95 Animated Demo" width="850" />
  </a>
</p>

<p align="center">
  <a href="https://github.com/Mrityunjai-hue/exnihilo-95"><img src="https://img.shields.io/badge/Build-Passing-brightgreen.svg" alt="Build Status" /></a>
  <a href="https://github.com/Mrityunjai-hue/exnihilo-95"><img src="https://img.shields.io/badge/Vitest%20Suites-22%2F22%20Passed-brightgreen.svg" alt="Vitest Suites" /></a>
  <a href="https://github.com/Mrityunjai-hue/exnihilo-95"><img src="https://img.shields.io/badge/Unit%20Tests-155%2F155%20Passed-brightgreen.svg" alt="Unit Tests" /></a>
  <a href="https://github.com/Mrityunjai-hue/exnihilo-95"><img src="https://img.shields.io/badge/TypeScript-0%20Errors-brightgreen.svg" alt="TypeScript" /></a>
  <a href="https://github.com/Mrityunjai-hue/exnihilo-95/releases/tag/v2.0.0-challenges"><img src="https://img.shields.io/badge/Release-v2.5.0--analytics-purple.svg" alt="v2.5.0-analytics" /></a>
  <a href="https://exnihilo-95.vercel.app"><img src="https://img.shields.io/badge/Live_Demo-exnihilo--95.vercel.app-brightgreen.svg" alt="Live Demo" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT" /></a>
  <a href="COPYRIGHT_AND_INTELLECTUAL_PROPERTY.md"><img src="https://img.shields.io/badge/Copyright-Anti--Theft_Protected-red.svg" alt="Copyright" /></a>
  <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-16.3.2%20(Turbopack)-black.svg" alt="Next.js" /></a>
  <a href="https://sql.js.org/"><img src="https://img.shields.io/badge/WebAssembly-SQLite%203.49.1-purple.svg" alt="WebAssembly" /></a>
</p>

> **The SQL database environment with ZERO "Table not found" errors.**  
> Built in the authentic nostalgic aesthetic of **Windows 95** and modern **macOS Obsidian Glass**, ExNihilo dynamically parses your SQL query's AST, automatically deduces column data types, maps foreign key relationships, synthesizes realistic test data on the fly, and executes queries entirely inside your browser via WebAssembly SQLite.
>
> 🌐 **Try it Live in Browser:** **[https://exnihilo-95.vercel.app](https://exnihilo-95.vercel.app)**  
> 🎬 **Watch Full HD Demo Video:** **[public/demo/exnihilo_demo.mp4](public/demo/exnihilo_demo.mp4)**

---

## 📑 Table of Contents

- [✨ Core Capabilities & Innovations](#-core-capabilities--innovations)
- [📊 Executive Visual Insights Analytics Dashboard](#-executive-visual-insights-analytics-dashboard)
- [⚡ Query Execution Plan & Optimizer Analyzer](#-query-execution-plan--optimizer-analyzer)
- [🌐 Entity-Relationship Diagram (ERD Studio)](#-entity-relationship-diagram-erd-studio)
- [🏆 SQL Challenge Arena (130 Real Interview Questions)](#-sql-challenge-arena-130-real-interview-questions)
- [🎲 Configurable Synthetic Data Generator](#-configurable-synthetic-data-generator)
- [👤 User Profile & Offline Security Keyring](#-user-profile--offline-security-keyring)
- [🎨 Nostalgia Themes Engine & CRT Filter](#-nostalgia-themes-engine--crt-filter)
- [💡 Original Idea — Made with AI](#-original-idea--made-with-ai)
- [⚖️ Copyright & Anti-Theft Notice](#%EF%B8%8F-copyright-intellectual-property--anti-theft-notice)
- [🧠 Architecture: How ExNihilo Synthesizes Relational Data](#-architecture-how-exnihilo-synthesizes-relational-data)
- [🚀 Getting Started & Testing Suites](#-getting-started--testing-suites)
- [📄 License & Attribution](#-license--attribution)

---

## ✨ Core Capabilities & Innovations

1. **Zero-Setup Database Environment:**  
   Query tables that don't exist yet (e.g. `SELECT * FROM mars_rover_telemetry WHERE battery < 20`). ExNihilo parses the query AST, builds the DDL schema, synthesizes realistic mock data via Faker.js, and runs the query locally.
2. **Multi-Dialect Parser Engine:**  
   Seamlessly switch between **MySQL**, **PostgreSQL**, **SQLite**, and **SSMS (Transact-SQL)** with dialect-specific syntax, quote delimiters, and functions.
3. **In-Browser WebAssembly SQLite (sql.js 3.49.1):**  
   Zero backend required. Full support for `INNER`, `LEFT`, `RIGHT`, `FULL OUTER` joins, `WITH RECURSIVE` CTEs, window functions, and subqueries.
4. **CodeMirror 6 Editor:**  
   High-contrast syntax highlighting, intelligent SQL autocomplete, 1-click query formatter, prebuilt templates, and execution history.
5. **Interactive 15-Step Guided Tour:**  
   Dynamic target-tracking balloon tour that guides users through every tool, window, profile, and setting.

---

## 📊 Executive Visual Insights Analytics Dashboard

In addition to the virtualized **Data Grid**, query results feature a dedicated **Visual Analytics Dashboard** (`ResultsGrid.tsx`) that turns raw query outputs into immediate business intelligence:

```
┌────────────────────────────────────────────────────────────────────────┐
│  TOTAL VALUE           MEAN AVERAGE         PEAK MAXIMUM       FLOOR   │
│  $148,290.00           $4,943.00            $18,400.00         $120.00 │
│  Cumulative 30 rows    Per category unit    Top: Electronics   Low: Misc│
├────────────────────────────────────────┬───────────────────────────────┤
│ 📶 Category Distribution (Bars)        │ 📈 Trajectory & Trend Area    │
│  #1 Electronics  ████████████ 38%      │      ▲ +24.5% upward trend    │
│  #2 Appliances   ████████     24%      │     /\    /\                  │
│  #3 Home Goods   ████         14%      │    /  \  /  \                 │
├────────────────────────────────────────┴───────────────────────────────┤
│ 📋 Column Health & Profiler Matrix                                     │
│  Column      Type     Completeness          Distinct   Sample / Range  │
│  id          INT      ██████████ 100% (5/5) 5 unique   Min: 1 | Max: 5 │
│  value       DEC      ██████████ 100% (5/5) 5 unique   Avg: 4,943.00   │
└────────────────────────────────────────────────────────────────────────┘
```

- **Top KPI Stat Cards:** Instant aggregation of Total Volume, Mean Average, Peak Maximum (with category label), and Floor Minimum.
- **Side-by-Side Dual Visual Panels:**
  - **Composition & Ranking:** Proportional horizontal bar chart with rank badges, values, and percentage share of total.
  - **Trajectory & Trendline:** Interactive SVG area polyline with gradient shading, gridlines, data points, and a trajectory delta indicator (`▲ +X.X%` or `▼ -X.X%`).
- **Column Profiler & Health Matrix:** Deep schema profiling inspecting every column for inferred types, completeness fill-rate bars, cardinality (distinct count), and value samples.
- **View Selector:** Switch between `📊 Executive Dashboard (All-in-One)`, `📶 Proportional Distribution`, `📈 Trajectory & Trend Area`, `🎛️ Metric KPI Cards`, and `📋 Column Health & Profiler`.

---

## ⚡ Query Execution Plan & Optimizer Analyzer

ExNihilo features an interactive **Visual Query Execution Plan** (`ExplainPlanViewer.tsx`) that analyzes SQLite optimizer bytecodes:

- **Hierarchical Execution Tree:** Calculates true tree depth and displays visual branch connectors (`└──`) with operation badges:
  - `🔍 SCAN` (Sequential Table Scan)
  - `⚡ INDEX` (B-Tree Index / Covering Lookup)
  - `🔄 SORT` (Temporary B-Tree In-Memory Sort)
  - `⚙️ CO-ROUTINE` (Streaming Subquery Evaluation)
  - `🔗 JOIN` (Nested Loop / Hash Join)
- **Bottleneck Diagnostics & Index Advisor:**
  - Automated detection of full table scans with actionable index recommendations (e.g. `CREATE INDEX idx_tbl_search ON tbl(...);`).
  - Detection of temporary in-memory B-Tree sorting buffers for `ORDER BY` and `GROUP BY`.
- **Complexity Rating:** Classifies query cost from $O(1)$ scalar seeks up to $O(N \log N)$ table scans with temporary sorting.
- **Raw Bytecode Viewer:** Inspect raw SQLite opcodes with line numbers and a 1-click `📋 Copy Plan` button.

---

## 🌐 Entity-Relationship Diagram (ERD Studio)

The built-in **Entity-Relationship Diagram Studio** (`ERDViewer.tsx`) visualizes schema relationships automatically:

- **Interactive Draggable Table Cards:** Reposition tables smoothly with window-level drag tracking.
- **Dynamic Foreign Key Bezier Connectors:** Curved lines draw foreign key dependencies between tables with cardinality badges (`1` ➔ `∞`).
- **One-Click Relational Schema Seeder:** Instantly seeds a 4-table relational e-commerce schema (`users`, `orders`, `products`, `order_items`) with pre-linked foreign keys.
- **Search & Zoom Controls:** Real-time table search, canvas zoom ($0.5\times$ to $2.0\times$), and SVG export.

---

## 🏆 SQL Challenge Arena (130 Real Interview Questions)

ExNihilo 95 includes an **Interactive SQL Challenge Arena** (`ChallengeWindow.tsx`) loaded with **130 authentic LeetCode and HackerRank SQL interview problems**.

### 1. Problem Catalog & Dataset

| Category / Domain | Question Count | Featured Real Problems |
| :--- | :---: | :--- |
| **🟢 Filtering & Strings** | **42** | LC #182 (*Duplicate Emails*), LC #584 (*Customer Referee*), LC #595 (*Big Countries*), LC #1757 (*Recyclable Products*) |
| **🟡 Aggregations & Grouping** | **28** | LC #511 (*Game Play I*), LC #586 (*Largest Orders*), LC #1075 (*Project Employees I*), LC #1693 (*Daily Leads*) |
| **🔵 Joins & Relational Sets** | **26** | LC #175 (*Combine Tables*), LC #181 (*Employees Earning More*), LC #183 (*Never Order*), LC #197 (*Rising Temp*) |
| **🟣 Subqueries & CTEs** | **14** | LC #176 (*Second Highest Salary*), LC #184 (*Department Highest Salary*), LC #262 (*Trips and Users*) |
| **📊 Window Functions** | **20** | LC #177 (*Nth Highest Salary*), LC #178 (*Rank Scores*), LC #180 (*Consecutive Numbers*), LC #185 (*Top Three Salaries*) |
| **TOTAL** | **130** | *100% Authentic Ground-Truth Problems with Verified Schema & Seed Data* |

### 2. Ephemeral WASM Evaluation Harness

```
[ User Query Input ]
        │
        ▼
[ Ephemeral WASM SQLite Database ]
        │
        ├── 1. Execute DDL Schema (inputSchemaSql)
        ├── 2. Populate Seed Data (seedDataSql)
        ├── 3. Execute Candidate SQL & Record Execution Time
        │
        ▼
[ Result Grid Comparator Engine ]
        │
        ├── Column Matching (Case-insensitive)
        ├── Floating Point Precision Matching (ε = 0.0001)
        ├── Row Count & Null Verification
        └── Order Independence Logic
        │
        ▼
[ Status: 🟢 ACCEPTED | ❌ WRONG_ANSWER | ⚠️ SYNTAX_ERROR ]
```

- **Side-by-Side Mismatch Diff Viewer:** Highlights exact row/column mismatch coordinates in red against ground-truth outputs.
- **Solution Locking:** Canonical solution SQL unlocks only after students submit an accepted query.
- **Try in Main Studio:** 1-click export of any challenge's DDL and seed data directly into ExNihilo SQL Studio.

---

## 🎲 Configurable Synthetic Data Generator

Control the density of mock data generated by the engine using the **Rows Selector** (`tb-rows-select`) on the action toolbar:
- **20 rows (Default):** Instant execution for rapid query prototyping.
- **50 rows / 100 rows:** Realistic dataset volume for aggregation testing and grouping.
- **500 rows:** Stress-test query performance, window functions, and table join complexity.

---

## 👤 User Profile & Offline Security Keyring

ExNihilo provides a privacy-focused, offline-first user account management system (`AuthWindow.tsx`):
- **Retro 8-Bit Avatars:** Select from vintage retro avatars (`💻`, `🧙‍♂️`, `💾`, `🕹️`, `⚡`, `⚙️`, `🛡️`, `✨`).
- **PBKDF2 600,000 Iterations:** Enterprise-grade password hashing performed locally in-browser using Web Crypto APIs.
- **Local Keyring Storage:** Single-device keychain keeps your credentials and session state on your device without transmitting data to external servers.
- **Session Badges & Statistics:** Track queries executed, challenges solved, and active session status.

---

## 🎨 Nostalgia Themes Engine & CRT Filter

Switch themes on the fly via Desktop Right-Click $\rightarrow$ **Properties** or the **Control Panel**:

| Theme Name | Aesthetic Highlights |
| :--- | :--- |
| **🍎 macOS Modern (Nihilo Glass)** | Authentic neutral obsidian glass (`#141416`), frosted materials, continuous squircle corners, floating dock, and traffic light controls. |
| **💾 Windows 95 Classic** | Original 1995 teal desktop (`#008080`), 3D beveled borders, and navy active titlebars. |
| **🌙 Windows 95 Noir** | High-contrast dark midnight theme with neon cyan accents and dark sunken wells. |
| **🔵 Windows XP Luna** | Iconic royal blue titlebar gradients, rounded push buttons, and olive green highlights. |
| **🏢 Windows 2000 Corporate** | Clean enterprise steel blue titlebars and classic workstation gray panels. |
| **📺 CRT Monitor Scanline Filter** | Toggleable retro phosphor glow, scanline overlays, and vintage cathode-ray tube glass curvature. |

---

## 💡 Original Idea — Made with AI

> **"I, Mrityunjai ([@Mrityunjai-hue](https://github.com/Mrityunjai-hue)), claim that this is the original idea of mine, but I have made it with AI."**

### 🤖 AI Stack & Tools Used
- **Google Antigravity & Gemini:** Autonomous architectural engineering, AST visitor implementation, multi-chart analytics dashboard, and regression test suites.
- **Node SQL Parser:** Multi-dialect AST parser configured for MySQL, PostgreSQL, SQLite, and SSMS.
- **Faker.js:** Heuristic-driven realistic mock data synthesis (names, emails, prices, timestamps, coordinates).
- **sql.js (WebAssembly SQLite 3.49.1):** High-performance in-memory relational SQL engine.

---

## ⚖️ Copyright, Intellectual Property & Anti-Theft Notice

ExNihilo 95 is an open-source project created by **Mrityunjai ([@Mrityunjai-hue](https://github.com/Mrityunjai-hue))**. While legitimate forks, contributions, and educational exploration are encouraged, **plagiarism, deceptive re-branding, and attribution removal are strictly prohibited**.

- 🔴 **No Plagiarism:** You may not claim the concept, architecture, or codebase as your own original creation.
- 🔴 **Mandatory Credit & Link:** Any deployment, fork, or derivative work **MUST** retain visible attribution to Mrityunjai and link to the official repository ([https://github.com/Mrityunjai-hue/exnihilo-95](https://github.com/Mrityunjai-hue/exnihilo-95)).
- 🔴 **Legal Enforcement:** Removing author notices or stripping credits will result in immediate **DMCA takedown demands** and repository reporting.

👉 **Read full legal terms:** **[COPYRIGHT_AND_INTELLECTUAL_PROPERTY.md](COPYRIGHT_AND_INTELLECTUAL_PROPERTY.md)**

---

## 🧠 Architecture: How ExNihilo Synthesizes Relational Data

```
[ User SQL Query ]
        │
        ▼
[ 1. AST Parser Engine (Node-SQL-Parser) ]
        │
        ├── Extract Tables & Aliases
        ├── Extract Column References & Expressions
        └── Map JOIN Predicates & Equi-join Keys
        │
        ▼
[ 2. Schema Deduction & Heuristic Type Engine ]
        │
        ├── Infer Types: INT, DEC, VARCHAR, DATE, BOOL, EMAIL, CURRENCY
        └── Mark Primary Keys (id, {table}_id)
        │
        ▼
[ 3. Relational Dependency DAG Resolver ]
        │
        ├── Detect Foreign Key References ({parent}_id ➔ parent.id)
        └── Topologically Sort Generation Order
        │
        ▼
[ 4. Synthetic Mock Data Generator (Faker.js) ]
        │
        └── Generate N Rows per Table (20 / 50 / 100 / 500 rows)
        │
        ▼
[ 5. WebAssembly SQLite Engine (sql.js) ]
        │
        ├── Execute CREATE TABLE DDLs
        ├── Execute INSERT Mock Data Statements
        └── Execute User Query & Return Dataset
        │
        ▼
┌────────────────────────────────────────────────────────┐
│  • Virtualized Results Grid & 1-Click File Exports     │
│  • Executive Visual Analytics Dashboard (Multi-Chart)  │
│  • Visual Query Execution Plan & Optimizer Analyzer    │
│  • Entity-Relationship Diagram (ERD Studio)            │
└────────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started & Testing Suites

### 1. Installation & Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/Mrityunjai-hue/exnihilo-95.git
   cd exnihilo-95
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the local development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

### 🧪 Quality Assurance & Test Suites

ExNihilo 95 enforces strict multi-layered testing validation across unit and compilation suites:

```bash
# 1. Run Complete Vitest Suite (155/155 Tests Passing across 22 Suites)
npx vitest run

# 2. Next.js Production Build Validation (0 TypeScript Errors)
npm run build
```

| Test Suite | File Scope | Tests | Status |
| :--- | :--- | :---: | :---: |
| **Grid Virtualization & Sorting** | `src/tests/components/grid.test.ts` | 9 | **Passed** |
| **Themes & macOS Glass Engine** | `src/tests/components/themes.test.ts` | 3 | **Passed** |
| **Challenge Evaluator Harness** | `src/tests/engine/challenge_evaluator.test.ts` | 3 | **Passed** |
| **DDL Generation & Dialects** | `src/tests/engine/ddl.test.ts` | 6 | **Passed** |
| **Procedural Generation & Faker** | `src/tests/engine/procedural.test.ts` | 5 | **Passed** |
| **Inference Cache & LRU** | `src/tests/engine/inference_cache.test.ts` | 3 | **Passed** |
| **Domain Inference Engine** | `src/tests/engine/domain_inference.test.ts` | 11 | **Passed** |
| **Database Session Manager** | `src/tests/engine/db_manager.test.ts` | 22 | **Passed** |
| **SQL Aggregate Functions** | `src/tests/engine/functions.test.ts` | 25 | **Passed** |
| **Recursive CTEs & Graphs** | `src/tests/engine/recursive.test.ts` | 3 | **Passed** |
| **Token Dictionary & NLP** | `src/tests/engine/token_dictionary.test.ts` | 9 | **Passed** |
| **Relational Joins (INNER, LEFT, RIGHT)** | `src/tests/engine/joins.test.ts` | 4 | **Passed** |
| **Aggregations & Grouping** | `src/tests/engine/aggregations.test.ts` | 10 | **Passed** |
| **Window Functions & Partitions** | `src/tests/engine/window.test.ts` | 9 | **Passed** |
| **SQL Exporters (CSV, JSON, XLS, DDL)**| `src/tests/engine/sql_exporter.test.ts` | 13 | **Passed** |
| **ERD Graph Extractor & FKs** | `src/tests/engine/erd_extractor.test.ts` | 2 | **Passed** |
| **Share URL State Serialization** | `src/tests/utils/share_encoder.test.ts` | 3 | **Passed** |
| **Other Component & Engine Suites** | `src/tests/...` | 15 | **Passed** |
| **TOTAL** | **22 Suites** | **155** | **100% Passed** |

---

## 📄 License & Attribution

- **Creator:** [Mrityunjai](https://github.com/Mrityunjai-hue)
- **Community:** [N8N Data Science Community](https://n8n-ds-community.netlify.app/)
- **License:** MIT License
