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
  <a href="https://github.com/Mrityunjai-hue/exnihilo-95"><img src="https://img.shields.io/badge/Unit%20Tests-112%2F112%20Passed-brightgreen.svg" alt="Unit Tests" /></a>
  <a href="https://github.com/Mrityunjai-hue/exnihilo-95"><img src="https://img.shields.io/badge/TypeScript-0%20Errors-brightgreen.svg" alt="TypeScript" /></a>
  <a href="https://github.com/Mrityunjai-hue/exnihilo-95/releases/tag/v1.5.0-themes"><img src="https://img.shields.io/badge/Release-v1.5.0--themes-blue.svg" alt="v1.5.0-themes" /></a>
  <a href="https://github.com/Mrityunjai-hue/exnihilo-95/releases/tag/v2.0.0-challenges"><img src="https://img.shields.io/badge/Release-v2.0.0--challenges-purple.svg" alt="v2.0.0-challenges" /></a>
  <a href="https://exnihilo-95.vercel.app"><img src="https://img.shields.io/badge/Live_Demo-exnihilo--95.vercel.app-brightgreen.svg" alt="Live Demo" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT" /></a>
  <a href="COPYRIGHT_AND_INTELLECTUAL_PROPERTY.md"><img src="https://img.shields.io/badge/Copyright-Anti--Theft_Protected-red.svg" alt="Copyright" /></a>
  <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-16.3.2-black.svg" alt="Next.js" /></a>
  <a href="https://sql.js.org/"><img src="https://img.shields.io/badge/WebAssembly-sql.js_3.49.1-purple.svg" alt="WebAssembly" /></a>
</p>

> **The SQL database environment with ZERO "Table not found" errors.**  
> Built in the authentic nostalgic aesthetic of **Windows 95**, ExNihilo dynamically parses your SQL query's AST, automatically deduces column data types, maps foreign key relationships, synthesizes realistic test data on the fly, and executes queries entirely inside your browser via WebAssembly.
>
> 🌐 **Try it Live in Browser:** **[https://exnihilo-95.vercel.app](https://exnihilo-95.vercel.app)**  
> 🎬 **Watch Full HD Demo Video:** **[public/demo/exnihilo_demo.mp4](public/demo/exnihilo_demo.mp4)**

---

## 📑 Table of Contents

- [🏆 SQL Challenge Arena & Evaluation Guide](#-sql-challenge-arena--evaluation-guide)
  - [1. Problem Catalog & Dataset (130 Authentic Questions)](#1-problem-catalog--dataset-130-authentic-questions)
  - [2. How to Open and Use the Challenge Arena](#2-how-to-open-and-use-the-challenge-arena)
  - [3. WASM SQLite Evaluation Harness Engine](#3-wasm-sqlite-evaluation-harness-engine)
  - [4. Student Integrity & Solution Locking](#4-student-integrity--solution-locking)
  - [5. Side-by-Side Mismatch Diff Viewer & Main Studio Export](#5-side-by-side-mismatch-diff-viewer--main-studio-export)
- [🎨 Win95 Nostalgia Themes Engine & CRT Filter](#-win95-nostalgia-themes-engine--crt-filter)
- [💡 Original Idea & AI Stack](#-original-idea--made-with-ai)
- [⚖️ Copyright & Intellectual Property](#%EF%B8%8F-copyright-intellectual-property--anti-theft-notice)
- [🎬 Product Showcase & Interface](#-product-showcase--interface)
- [🧠 Deep Dive: How ExNihilo Understands & Synthesizes Queries](#-deep-dive-how-exnihilo-understands--synthesizes-queries)
- [⚡ Performance & State Isolation](#-performance--state-isolation)
- [🎯 SQL Dialect Command Matrix](#-sql-dialect-support-matrix)
- [🚀 Getting Started & Testing Suites](#-getting-started)
- [📄 License & Attribution](#-license--attribution)

---

## 🏆 SQL Challenge Arena & Evaluation Guide

ExNihilo 95 includes a flagship **Interactive SQL Challenge Arena** (`ChallengeWindow.tsx`) loaded with **130 authentic LeetCode and HackerRank SQL interview problems**.

---

### 1. Problem Catalog & Dataset (130 Authentic Questions)

All 130 challenges contain **100% authentic problem statements, DDL schemas, test seed data, ground-truth outputs, and real company interview tags**:

| Category / Domain | Question Count | Featured Real LeetCode & HackerRank Problems |
| :--- | :---: | :--- |
| **🟢 Filtering & String Functions** | **42** | LC #182 (*Duplicate Emails*), LC #196 (*Delete Duplicate Emails*), LC #584 (*Find Customer Referee*), LC #595 (*Big Countries*), LC #620 (*Not Boring Movies*), LC #1484 (*Group Sold Products By Date*), LC #1667 (*Fix Names in a Table*), LC #1683 (*Invalid Tweets*), LC #1757 (*Recyclable and Low Fat Products*), LC #1873 (*Calculate Special Bonus*), HR *The PADS* |
| **🟡 Aggregations & Grouping** | **28** | LC #511 (*Game Play Analysis I*), LC #586 (*Customer Placing Largest Number of Orders*), LC #596 (*Classes More Than 5 Students*), LC #1050 (*Actors & Directors Cooperated 3+ Times*), LC #1075 (*Project Employees I*), LC #1211 (*Queries Quality and Percentage*), LC #1393 (*Capital Gain/Loss*), LC #1693 (*Daily Leads and Partners*), LC #1729 (*Find Followers Count*), LC #1741 (*Find Total Time Spent by Employee*), LC #2356 (*Number of Unique Subjects Taught by Each Teacher*), HR *Occupations Pivot* |
| **🔵 Joins & Relational Sets** | **26** | LC #175 (*Combine Two Tables*), LC #181 (*Employees Earning More Than Their Managers*), LC #183 (*Customers Who Never Order*), LC #197 (*Rising Temperature*), LC #570 (*Managers with 5 Direct Reports*), LC #577 (*Employee Bonus*), LC #607 (*Sales Person*), LC #1068 (*Product Sales Analysis I*), LC #1158 (*Market Analysis I*), LC #1251 (*Average Selling Price*), LC #1280 (*Students and Examinations*), LC #1378 (*Replace Employee ID With Unique ID*), LC #1407 (*Top Travellers*), LC #1581 (*Customer Visited No Transactions*), LC #1587 (*Bank Account Summary II*), LC #1661 (*Average Time of Process per Machine*), LC #1731 (*Employees Reporting to Each Employee*), LC #1934 (*Confirmation Rate*) |
| **🟣 Subqueries & CTEs** | **14** | LC #176 (*Second Highest Salary*), LC #184 (*Department Highest Salary*), LC #262 (*Trips and Users*), LC #512 (*Game Play Analysis II*), LC #585 (*Investments in 2016*), LC #602 (*Friend Requests II: Who Has Most Friends*), LC #608 (*Tree Node*), LC #1070 (*Product Sales Analysis III*), LC #1341 (*Movie Rating*), LC #1789 (*Primary Department for Each Employee*), LC #1907 (*Count Salary Categories*), LC #1978 (*Employees Whose Manager Left*), HR *Binary Tree Nodes* |
| **📊 Window Functions & Analytics** | **20** | LC #177 (*Nth Highest Salary*), LC #178 (*Rank Scores*), LC #180 (*Consecutive Numbers*), LC #185 (*Department Top Three Salaries*), LC #534 (*Game Play Analysis III*), LC #550 (*Game Play Analysis IV*), LC #601 (*Human Traffic of Stadium*), LC #626 (*Exchange Seats*), LC #1141 (*User Activity for Past 30 Days I*), LC #1164 (*Product Price at a Given Date*), LC #1193 (*Monthly Transactions I*), LC #1204 (*Last Person to Fit in the Bus*), LC #1321 (*Restaurant Growth*) |
| **TOTAL** | **130** | *100% Authentic Ground-Truth Problems with Verified Schema & Seed Data* |

---

### 2. How to Open and Use the Challenge Arena

Launch the arena using any of the 3 built-in Windows 95 shortcuts:
1. **Desktop Icon**: Double-click the 3D golden trophy icon **`🏆 SQL Challenges`** on the desktop.
2. **Start Menu**: Click **`Start`** $\rightarrow$ **`🏆 SQL Challenge Arena`**.
3. **IDE Menu Bar**: Inside ExNihilo SQL Studio, click top menu **`Tools`** $\rightarrow$ **`🏆 SQL Challenge Arena...`**.

#### 🎛️ Navigation & Multi-Filtering:
- **Difficulty Filter**: Tabs for `All`, `🟢 Easy`, `🟡 Medium`, `🔴 Hard`.
- **Company Tag Filter**: Filter problems by target companies (**`Google`**, **`Meta`**, **`Amazon`**, **`Apple`**, **`Microsoft`**, **`Netflix`**, **`Uber`**, **`Stripe`**).
- **Domain Filter**: Filter across 10 specialized SQL domains.
- **Search Bar**: Real-time keyword search across problem titles, descriptions, and tags.

---

### 3. WASM SQLite Evaluation Harness Engine

Submissions are evaluated in real time using an ephemeral in-memory WebAssembly SQLite test harness ([`src/utils/challengeEvaluator.ts`](file:///c:/Users/Mrityunjai/.gemini/antigravity-ide/scratch/exnihio-app/src/utils/challengeEvaluator.ts)):

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
        ├── Column Matching (Case-insensitive column name verification)
        ├── Floating Point Precision Matching (Tolerance ε = 0.0001 for AVG/SUM)
        ├── Row Count & Null Value Verification
        └── Order Independence Logic (Sort comparison if ordered = false)
        │
        ▼
[ Status Outcome: 🟢 ACCEPTED | ❌ WRONG_ANSWER | ⚠️ SYNTAX_ERROR ]
```

#### Evaluation Statuses:
- **`🟢 ACCEPTED`**: Candidate query output matches ground-truth columns and cell values perfectly.
- **`❌ WRONG_ANSWER / VALUE_MISMATCH`**: Column values or rows differ from ground truth. Highlights exact row/column mismatch coordinates in red.
- **`❌ ROW_COUNT_MISMATCH`**: Output contains fewer or more rows than expected.
- **`❌ COLUMN_MISMATCH`**: Returned column names or column counts do not match expected schema.
- **`⚠️ SYNTAX_ERROR`**: Query contains SQL syntax errors or invalid identifier references.

---

### 4. Student Integrity & Solution Locking

To ensure students write and compose their own SQL queries:
- **Clean Starter Code**: Query editor pre-fills with blank starter templates (e.g. `-- Write your SQL query solution below:\nSELECT \nFROM \n;`).
- **Locked Solution SQL**: The canonical solution SQL is **locked** by default:  
  `🔒 Solution unlocks after you submit an accepted query!`
- **Automatic Unlock**: Once the student submits an accepted solution (`🟢 ACCEPTED`), the **`🔓 Reveal Canonical Solution SQL (Unlocked)`** button unlocks.

---

### 5. Side-by-Side Mismatch Diff Viewer & Main Studio Export

- **Side-by-Side Diff Table**: When a submission produces a `WRONG_ANSWER`, the canvas renders a side-by-side **Your Output vs. Expected Output** comparison grid. Mismatched cells are highlighted in red so students can instantly pinpoint logic errors.
- **`🗄️ Try in Main Studio`**: 1-click button that exports the challenge's DDL schema, seed data, and query directly into ExNihilo SQL Studio for deep debugging, EXPLAIN execution plan analysis, or schema modification.
- **LocalStorage Progress Tracking**: Automatically saves solved challenge IDs to `localStorage`. Completed problems display a green **`✅`** checkmark and update the overall progress bar.

---

## 🎨 Win95 Nostalgia Themes Engine & CRT Filter

ExNihilo 95 includes a multi-theme Engine ([`v1.5.0-themes`](https://github.com/Mrityunjai-hue/exnihilo-95/releases/tag/v1.5.0-themes)):

| Theme Name | Visual Style |
| :--- | :--- |
| **💾 Win95 Classic** | Original 1995 teal desktop wallpaper, gray bevels, and classic navy titlebars. |
| **🌙 Win95 Noir (Dark Mode)** | High-contrast midnight obsidian theme with vibrant cyan text and dark sunken grids. |
| **🔵 Windows XP Luna** | Royal blue titlebar gradients, rounded button states, and olive accents. |
| **🏢 Windows 2000 Corporate** | Clean enterprise corporate gray theme. |
| **📺 CRT Monitor Scanline Filter** | Toggles retro phosphor glow, scanline overlays, and vintage monitor curvature effect. |

---

## 💡 Original Idea — Made with AI

> **"I, Mrityunjai ([@Mrityunjai-hue](https://github.com/Mrityunjai-hue)), claim that this is the original idea of mine, but I have made it with AI."**

### 🤖 AI Tools & Technologies Used
- **Google Antigravity & Gemini**: Autonomous pair programming, architectural design, AST visitor implementation, multi-phase headless test harnesses, and Windows 95 UI integration.
- **Node SQL Parser**: AST parser configured across 4 major SQL dialects (MySQL, PostgreSQL, SQLite, SSMS / Transact-SQL).
- **Faker.js Synthetic Data Engine**: Heuristic-driven realistic mock data generation (names, emails, prices, timestamps, addresses).
- **sql.js (WebAssembly SQLite 3.49.1)**: Full in-browser relational execution engine supporting `INNER`, `LEFT`, `RIGHT`, `FULL OUTER` joins, `WITH RECURSIVE` CTEs, and `CREATE TRIGGER` native event handling.

---

## ⚖️ Copyright, Intellectual Property & Anti-Theft Notice

ExNihilo 95 is an open-source project created by **Mrityunjai ([@Mrityunjai-hue](https://github.com/Mrityunjai-hue))**. While legitimate forks, contributions, and educational exploration are encouraged, **plagiarism, deceptive re-branding, and attribution removal are strictly prohibited**.

- 🔴 **No Plagiarism or False Claims:** You may not claim the concept, architecture, or codebase as your own original creation.
- 🔴 **Mandatory Credit & Link:** Any deployment, fork, or derivative work **MUST** retain visible attribution to Mrityunjai and link to the official repository ([https://github.com/Mrityunjai-hue/exnihilo-95](https://github.com/Mrityunjai-hue/exnihilo-95)).
- 🔴 **Legal Enforcement & DMCA Takedowns:** Removing author notices, stripping credits, or re-publishing this application under a false author name will result in immediate **DMCA takedown demands**, repository reporting to GitHub Trust & Safety, and legal enforcement.

👉 **Read the full legal notice:** **[COPYRIGHT_AND_INTELLECTUAL_PROPERTY.md](COPYRIGHT_AND_INTELLECTUAL_PROPERTY.md)**

---

## 🎬 Product Showcase & Interface

<p align="center">
  <img src="win95_ide_demo.webp" alt="ExNihilo 95 Desktop Interface" width="900" />
</p>

The application presents a pixel-authentic Windows 95 desktop environment featuring floating resizable windows, window z-index focus management, CodeMirror 6 SQL editor with dialect syntax highlighting, virtualized ListView results grid, start menu, taskbar, control panel, and interactive SQL dictionary.

---

## 🧠 Deep Dive: How ExNihilo Understands & Synthesizes Queries

ExNihilo 95 solves the fundamental friction of SQL development: **executing queries without pre-existing databases or DDL setup**. When you type a query like:

```sql
SELECT u.name, u.email, o.total_amount, o.created_at
FROM users u
JOIN orders o ON u.id = o.user_id
WHERE o.total_amount > 250;
```

### Synthesis Pipeline:
1. **AST Extraction**: `Parser.ts` parses the SQL string into an AST tree, identifying tables (`users`, `orders`), joins (`u.id = o.user_id`), and projections (`total_amount`).
2. **Schema & Type Inference Engine**: Deduces column data types (`name` $\rightarrow$ `VARCHAR`, `email` $\rightarrow$ `EMAIL`, `total_amount` $\rightarrow$ `CURRENCY`, `created_at` $\rightarrow$ `DATETIME`).
3. **Relational DAG Dependency Resolution**: Resolves foreign key dependencies so parent `users` rows are generated before child `orders` rows.
4. **WASM Execution**: Executes the generated DDL/DML and candidate query in WebAssembly SQLite in milliseconds.

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

### 🧪 Testing Suites & Validation

ExNihilo 95 enforces strict multi-layered testing validation across unit and compilation suites:

```bash
# 1. Run Unit Test Suite (112/112 Passed)
npx vitest run

# 2. Next.js Production Build Validation (0 TypeScript Errors)
npm run build
```

| Suite | Command | Scope & Coverage | Status |
| :--- | :--- | :--- | :---: |
| **Vitest Unit** | `npx vitest run` | Validates AST extraction, schema inference, DDL, Window Functions, Challenge Evaluator, and Graph/CTE execution. | **112 / 112 Passed** |
| **TypeScript Build** | `npm run build` | Validates zero static type errors, Next.js page generation, and bundle optimization. | **0 Errors** |

---

## 📄 License & Attribution

- **Creator:** [Mrityunjai](https://github.com/Mrityunjai-hue)
- **Community:** [N8N Data Science Community](https://n8n-ds-community.netlify.app/)
- **License:** MIT License
- **Contributing:** [CONTRIBUTING.md](CONTRIBUTING.md) — Read this to get started as a contributor
- **Premium Roadmap:** [PREMIUM_FEATURES.md](PREMIUM_FEATURES.md) — Full feature plan for the next evolution of ExNihilo
