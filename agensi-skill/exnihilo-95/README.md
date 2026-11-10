# ExNihilo 95 — Zero-Config SQL IDE & Relational Reasoning Skill

[![Marketplace](https://img.shields.io/badge/Agensi.io-Marketplace%20Skill-blue)](https://www.agensi.io/sell)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Compatibility](https://img.shields.io/badge/Compatibility-Claude%20Code%20|%20Cursor%20|%20Antigravity%20|%20Copilot-purple)]()

> **"Creatio Ex Nihilo" — The intelligent relational database skill that eliminates "Table Not Found" errors.**

**ExNihilo 95** is an AI agent skill that transforms any AI coding assistant into a senior relational database architect, multi-dialect transpiler, and LeetCode SQL coach.

When users prompt agents with complex SQL queries without providing table definitions or schemas, standard agents stall or refuse to execute. With **ExNihilo 95**, the agent automatically reconstructs table schemas directly from query ASTs, synthesizes referentially sound mock datasets with primary/foreign keys, solves 130+ LeetCode SQL challenges, transpiles between dialects, and audits execution performance.

---

## ⚡ What This Skill Gives Your AI Agent

1. **"Creatio Ex Nihilo" Schema & Mock Data Inference:**
   - Automatically detects physical tables, aliases, join relationships, and column data types from raw queries.
   - Generates realistic, seeded mock data enforcing foreign key relationships (100% matches on `INNER JOIN`, realistic orphan ratios on `LEFT JOIN`).
2. **Multi-Dialect Transpiler & Parity Matrix:**
   - Seamlessly translates queries between **PostgreSQL 16+**, **MySQL 8.0+**, **SQLite 3.45+**, and **Microsoft SQL Server (T-SQL)**.
   - Handles date math (`DATE_ADD`, `DATEADD`, `INTERVAL`), string aggregations (`STRING_AGG`, `GROUP_CONCAT`), pattern matching (`ILIKE`, `REGEXP`), and full outer join emulations.
3. **Interactive 130+ LeetCode SQL Challenge Arena:**
   - Guides users step-by-step through classic interview problems (window ranking, dense rank, offset `LAG`/`LEAD`, consecutive day detection, recursive org hierarchies).
4. **Query Performance & Indexing Optimizer:**
   - Diagnoses SARGability anti-patterns (e.g. `WHERE YEAR(date) = 2026`).
   - Recommends optimal B-tree composite index column order (**E**quality before **S**ort before **R**ange) and covering indexes (`INCLUDE`).

---

## 📦 What's Inside This Skill Package

```text
exnihilo-95/
├── SKILL.md                               # Primary skill definition & agent instructions
├── README.md                              # Marketplace documentation & quickstart
├── references/
│   ├── dialect_comparison.md              # Full syntax comparison matrix (PG, MySQL, SQLite, T-SQL)
│   ├── schema_inference_and_mock_data.md  # Type inference hierarchy & foreign key topology
│   ├── sql_challenge_bank.md              # 130+ LeetCode challenge patterns with solutions
│   └── query_optimization.md              # SARGability checklist, composite index rules, EXPLAIN guide
└── scripts/
    └── sql_dialect_transpiler.py          # Standalone pure-Python dialect CLI & schema generator
```

---

## 🚀 How to Install

### Claude Code
Add to your project's `.claude/skills/` or global skills folder:
```bash
mkdir -p ~/.claude/skills/exnihilo-95
unzip exnihilo-95.zip -d ~/.claude/skills/exnihilo-95
```

### Cursor & Copilot
Unzip directly into your project's `.agents/skills/` or `.cursor/skills/` directory:
```bash
mkdir -p .agents/skills/exnihilo-95
unzip exnihilo-95.zip -d .agents/skills/exnihilo-95
```

### Antigravity & Agent Marketplace
Drop the unzipped folder into your active workspace's `.agents/skills/` directory or load via MCP.

---

## 💡 Example Prompts to Try With Your Agent

* *"Here is a query with 3 joins, but I don't have the database tables yet. Generate the full schema and 15 realistic mock rows so I can test this in SQLite."*
* *"Transpile this PostgreSQL query using `STRING_AGG` and `INTERVAL '14 days'` into Microsoft SQL Server T-SQL."*
* *"How do I solve LeetCode #185 (Department Top Three Salaries) without skipping ranks when salaries are tied?"*
* *"Why is `WHERE YEAR(order_date) = 2025` causing a table scan, and what index should I create to make it an index seek?"*

---

## 👨‍💻 Author & Attribution

* **Author:** Mrityunjai ([GitHub](https://github.com/Mrityunjai-hue))
* **Project Repository:** [exnihilo-95](https://github.com/Mrityunjai-hue/exnihilo-95)
* **Powered by:** N8N Data Science Community
* **License:** MIT
