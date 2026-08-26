# 🗄️ ExNihilo 95 — Zero-Config In-Browser SQL IDE

[![Live Demo](https://img.shields.io/badge/Live_Demo-exnihilo--95.vercel.app-brightgreen.svg)](https://exnihilo-95.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Copyright & Anti-Theft](https://img.shields.io/badge/Copyright-Anti--Theft_Protected-red.svg)](COPYRIGHT_AND_INTELLECTUAL_PROPERTY.md)
[![Next.js](https://img.shields.io/badge/Next.js-16.3.2-black.svg)](https://nextjs.org/)
[![WebAssembly](https://img.shields.io/badge/WebAssembly-sql.js_3.49.1-purple.svg)](https://sql.js.org/)
[![Windows 95 UI](https://img.shields.io/badge/Style-Windows_95-teal.svg)](https://github.com/Mrityunjai-hue)
[![N8N Community](https://img.shields.io/badge/Powered_by-N8N_Data_Science_Community-orange.svg)](https://n8n-ds-community.netlify.app/)
[![Contributors Welcome](https://img.shields.io/badge/Contributors-Welcome!-ff69b4.svg)](#-calling-all-builders--contributors-wanted)
[![Premium Roadmap](https://img.shields.io/badge/Premium_Roadmap-View_Plan-gold.svg)](PREMIUM_FEATURES.md)

> **The SQL database environment with ZERO "Table not found" errors.**  
> Built in the authentic nostalgic aesthetic of **Windows 95**, ExNihilo dynamically parses your SQL query's AST, automatically deduces column data types, maps foreign key relationships, synthesizes realistic test data on the fly, and executes queries entirely inside your browser via WebAssembly.
>
> 🌐 **Try it Live in Browser:** **[https://exnihilo-95.vercel.app](https://exnihilo-95.vercel.app)**

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

> **Protection of Original Authorship & Brand Integrity**

ExNihilo 95 is an open-source project created by **Mrityunjai ([@Mrityunjai-hue](https://github.com/Mrityunjai-hue))**. While legitimate forks, contributions, and educational exploration are encouraged, **plagiarism, deceptive re-branding, and attribution removal are strictly prohibited**.

- 🔴 **No Plagiarism or False Claims:** You may not claim the concept, architecture, or codebase as your own original creation.
- 🔴 **Mandatory Credit & Link:** Any deployment, fork, or derivative work **MUST** retain visible attribution to Mrityunjai and link to the official repository ([https://github.com/Mrityunjai-hue/exnihilo-95](https://github.com/Mrityunjai-hue/exnihilo-95)).
- 🔴 **Legal Enforcement & DMCA Takedowns:** Removing author notices, stripping credits, or re-publishing this application under a false author name will result in immediate **DMCA takedown demands**, repository reporting to GitHub Trust & Safety, and legal enforcement.

👉 **Read the full legal notice:** **[COPYRIGHT_AND_INTELLECTUAL_PROPERTY.md](COPYRIGHT_AND_INTELLECTUAL_PROPERTY.md)**

---

## 🎯 Who is ExNihilo 95 Built For?

> **Eliminating environment setup friction for students, recruiters, educators, and developers worldwide.**

| Persona | Why ExNihilo 95 is a Must-Use Tool |
|---------|-----------------------------------|
| 🎓 **Students & Self-Learners** | Practice writing SQL queries instantly with zero database installation, server setup, or dataset imports. |
| 💼 **Recruiters & Interviewers** | Conduct live candidate SQL coding tests on the spot without setting up test database instances or dummy tables. |
| 🏫 **Educators & CS Teachers** | Demonstrate complex SQL concepts (JOINs, CTEs, Window Functions) live in class with zero setup friction. |
| 👨‍💻 **Software Developers & DBAs** | Prototype and dry-run query logic before writing production database migrations or creating staging tables. |
| 🧪 **QA & Data Analysts** | Test query edge-cases and referential integrity against auto-synthesized relational data on demand. |

---

## 🌐 Community Partnership
ExNihilo 95 is proudly powered by the **[N8N Data Science Community](https://n8n-ds-community.netlify.app/)** using AI.  
Join the community for AI tools, automation workflows, tutorials, and data science discussions!

---

## 📢 Calling All Builders — Contributors Wanted!

> **ExNihilo 95 has proven its core concept. Now it's time to scale it into something massive — and we need YOU.**

I've laid out a comprehensive **[Premium Features Roadmap](PREMIUM_FEATURES.md)** with 10 major feature categories that will transform ExNihilo from a playground into a professional-grade SQL platform. This is too big for one person — it needs a **team of passionate builders**.

---

## ✨ Key Features & Engine Capabilities

- ⚡ **Zero Table Setup:** Type queries against tables that don't exist yet — ExNihilo infers schema and creates them on the fly.
- 🎛️ **Multi-Dialect Support:** Natively parses **MySQL**, **PostgreSQL** (with `::type` casting & `WITH` CTEs), **SQLite**, and **SSMS** (Transact-SQL with bracket identifiers `[dbo].[table]`).
- 📊 **Complete Window Functions Engine:** `ROW_NUMBER()`, `RANK()`, `DENSE_RANK()`, `LEAD()`, `LAG()`, aggregate functions (`SUM()`, `AVG()`, `MIN()`, `MAX() OVER ()`), and sliding frames (`ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING`).
- 🔗 **Advanced Joins & Aggregators:** `FULL OUTER JOIN` / `FULL JOIN`, `GROUP_CONCAT()`, `STRING_AGG()`, and custom separators (`GROUP_CONCAT(name SEPARATOR ', ')`).
- 🗄️ **DDL & Catalog Namespaces:** `TRUNCATE TABLE` (resets row counts to 0 while preserving schema), `CREATE DATABASE / CREATE SCHEMA` namespaces, `CREATE VIEW` virtualized views without data redundancy.
- ⚙️ **Procedural Logic & Triggers:** `CREATE PROCEDURE`, `CREATE FUNCTION`, `CREATE TRIGGER` with native WebAssembly event execution in SQLite WASM.
- 🌳 **Recursive CTEs & Hierarchies:** `WITH RECURSIVE` hierarchical tree & graph traversal (`Electronics > Laptops > Gaming Laptops`).
- 🖥️ **Virtualized Data Grid:** Virtualized DOM rendering, case-insensitive ReDoS-safe substring search, interactive column sorting, and CSV file exports.
- 💾 **Hybrid Storage Architecture:** IndexedDB workspace storage with native browser Quota Meter, completely isolated from user auth state in `localStorage`.
- 📂 **Cascading Win95 Menus & Desktop Environment:** Classic teal desktop (`#008080`), Start menu, taskbar tabs, CodeMirror 6 query editor, and interactive SQL Dictionary reference window.

---

## 🏗️ Architecture & Pipeline

```mermaid
graph TD
    A[User SQL Query] --> B[Dialect Parser node-sql-parser]
    B -->|AST Validation| C[Session Schema Catalog]
    C -->|Table Exists| G[Execute in sql.js WASM]
    C -->|Table Missing| D[Precedence Schema Inference]
    D --> E[Relationship Graph & Topological DAG Sort]
    E --> F[Synthetic Data & DDL/INSERT Generation]
    F -->|Materialize| G
    G -->|Runtime Exception: No such table| H[Retry-Once Safety Net]
    H -->|Materialize Default Schema| G
    G --> I[Virtualized Results Grid & Schema Tree]
```

---

## 🧪 Comprehensive Test Suite (100% Pass Rate)

ExNihilo 95 is rigorously validated across unit and E2E browser test suites:

- **Vitest Unit Test Suite:** **73 / 73 passed (100%)**
- **Next.js Production Build (`npm run build`):** **0 errors**
- **Playwright E2E Browser Test Suite:** **9 / 9 passed (100%)**

---

## 🚀 Getting Started

### 🌐 Instant Web Access
No installation required — launch the full application in your browser:  
👉 **[https://exnihilo-95.vercel.app](https://exnihilo-95.vercel.app)**

### 💻 Local Installation & Run

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

## 📦 Scripts

- `npm run dev` — Launches Next.js Turbopack development server on `localhost:3000`.
- `npm run build` — Creates an optimized production static bundle.
- `npm run test` / `npx vitest run` — Runs 73 unit tests.
- `npx playwright test` — Runs Playwright E2E browser automation tests.
- `node scripts/harnesses/phase6_full_suite.cjs` — Executes the full 14-query headless verification harness.

---

## 📄 License & Attribution

- **Creator:** [Mrityunjai](https://github.com/Mrityunjai-hue)
- **Community:** [N8N Data Science Community](https://n8n-ds-community.netlify.app/)
- **License:** MIT License
- **Contributing:** [CONTRIBUTING.md](CONTRIBUTING.md) — Read this to get started as a contributor
- **Premium Roadmap:** [PREMIUM_FEATURES.md](PREMIUM_FEATURES.md) — Full feature plan for the next evolution of ExNihilo
