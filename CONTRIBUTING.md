# Contributing to ExNihilo 95

Thank you for your interest in contributing to **ExNihilo 95** — the zero-configuration, in-browser SQL IDE and relational synthesis engine built in the authentic Windows 95 aesthetic! 🗄️

ExNihilo 95 is a 100% free, client-side, WebAssembly-powered platform designed and maintained by [Mrityunjai](https://github.com/Mrityunjai-hue). We welcome developers, database designers, retro UI fans, and open-source enthusiasts to help expand our engine.

---

## 🚀 Quickstart Development Setup

### 1. Prerequisites
- **Node.js:** v18.17.0 or later (Node.js 20+ strongly recommended)
- **npm:** v9.0 or later (bundled with Node.js)
- **Git**

### 2. Fork & Clone
```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/exnihilo-95.git
cd exnihilo-95

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to launch your local Windows 95 workstation.

---

## 🗺️ Project Status & Contribution Opportunities

We have already completed and shipped the core foundational engine and major workstations. Below is the updated status of features to guide your contributions:

### ✅ Already Shipped & Production-Verified
- **Zero-Setup Relational Synthesis Engine:** AST parser, implied foreign key DAG sorter, and Faker.js data generator (500+ domain stems).
- **Universal Cross-Dialect SQL Transpiler:** Normalizes T-SQL `TOP (n)` / `[brackets]`, Oracle `ROWNUM`, PostgreSQL JSON `->>`, and MySQL functions to SQLite WebAssembly.
- **Pocket SQL Chat (Mobile Experience):** Handheld messenger interface with floating dialect pill, expandable kernel result cards, and 1-tap query error repair.
- **SQL Noir: Forensic Homicide Bureau:** Retro forensic crime desk with Case 1 & 2, live suspect rosters, paperclip proof attachments, credibility stamping, and grand jury trials.
- **Executive Visual Analytics Dashboard:** Client-side aggregation of Volume, Mean, Peak, Floor, horizontal distribution bars, SVG area trendlines, and column profiler matrix.
- **Visual Query Execution Plan & Optimizer Analyzer:** Hierarchical query plan inspection (`SCAN`, `INDEX`, `SORT`, `JOIN`) and index advisor.
- **Interactive ERD Studio:** Draggable table windows with auto-updating Bezier curve foreign key connectors and cardinality badges.
- **SQL Challenge Arena:** 130 authentic LeetCode & HackerRank SQL interview problems with ephemeral in-browser WebAssembly verification.
- **6 Nostalgic Desktop Themes & CRT Filter:** Windows 95 Classic, macOS Obsidian Glass, Windows Noir Midnight, XP Luna, Windows 2000, and CRT scanlines.
- **Offline Security Keyring:** Local PBKDF2 with 600,000 rounds via Web Crypto.

### 🌟 Active Areas Open for Community Contributions

| Domain | Opportunities & Target Tasks | Difficulty |
| :--- | :--- | :---: |
| **🧠 Dialect Transpiler** | Add transpilation support for Snowflake (`QUALIFY`, `IFF`), BigQuery (`REGEXP_CONTAINS`), or ClickHouse syntax rules in `src/engine/executor.ts`. | 🟡 Medium |
| **🌐 Omni-Domain Ontology** | Expand the 500+ morphological stem catalog in `src/engine/column_intelligence.ts` to include specialized fields (e.g. Genomics, Logistics, Aerospace). | 🟢 Good First Issue |
| **🕵️‍♂️ SQL Noir Cases** | Author Case 3: *The Phantom Vault of Bern* (Swiss banking heist with ledger reconciliation, foreign exchange audit, and passport swipe logs). | 🟡 Creative / SQL |
| **🏆 Challenge Arena** | Contribute new LeetCode Hard SQL challenge problem sets and reference solutions in `src/engine/dataset_store.ts`. | 🟢 Good First Issue |
| **🎨 Retro Themes** | Design new retro operating system skins (e.g., *Windows 98 Second Edition*, *NeXTSTEP 3.3*, *BeOS 5 Personal*) using CSS variables. | 🟡 Design / CSS |
| **⚡ Performance & Web Workers** | Optimize WebAssembly thread pooling and parallel query batch execution in background Web Workers. | 🔴 Advanced |

---

## 🏗️ Project Architecture & Directory Map

```
exnihilo-95/
├── src/
│   ├── app/                          # Next.js App Router (Studio, Mobile, Download Depot, Landing)
│   ├── components/
│   │   ├── Win95/                    # Desktop, Taskbar, StartMenu, WindowShell, CRTFilter, PWAInstall
│   │   ├── IDE/                      # CodeMirror 6 Editor, DataGrid Virtualizer, Toolbar, QueryTabs
│   │   ├── Mobile/                   # PocketSQLChat, FloatingDialectPill, KernelResultCard, TouchBar
│   │   ├── Detective/                # SQLNoirBureau, SuspectDossier, AlibiStamp, PaperclipProof
│   │   ├── Analytics/                # VisualAnalyticsDashboard, MetricPills, TrendArea, ColumnProfiler
│   │   ├── ERD/                      # DynamicCanvas, DraggableTable, BezierConnectors, CardinalityBadge
│   │   ├── ChallengeArena/           # ArenaWorkspace, ProblemDrawer, DiffHighlighter, MismatchTable
│   │   └── Brand/                    # ExNihiloLogo, RetroBadges
│   ├── engine/                       # Core Database & Transpilation Engine (Runs 100% In-Browser)
│   │   ├── executor.ts               # SQLExecutor & Universal Cross-Dialect Transpiler
│   │   ├── inference.ts              # AST Schema Walker & ORDER BY / GROUP BY Column Deductor
│   │   ├── materializer.ts           # DDL & Relational Dependency DAG Sorter
│   │   ├── column_intelligence.ts    # Omni-Domain Morphological Stem Catalog (OSI 500+)
│   │   ├── semantic_query_parser.ts  # Offline Natural Language Copilot & Query Syntax Repair
│   │   ├── db_manager.ts             # Session State & SQLite WASM Connection Pool
│   │   └── dataset_store.ts          # 130 LeetCode/HackerRank Benchmark Question Catalog
│   ├── hooks/                        # useDraggable, useWindowFocus, useVirtualScroll, useCRTFilter
│   ├── styles/                       # Tailwind CSS + 3D Retro Bevel Matrix + Glass Filter Tokens
│   └── tests/                        # 43 Vitest Test Suites (328 Unit & Integration Tests)
├── public/                           # Static WebAssembly assets (sql-wasm.wasm), audio, icons, screenshots
│   ├── demo/                         # Standalone starter kit (exnihilo_starter_pack.sql, sample CSV)
│   └── screenshots/                  # Verified product screenshots (Windows 95 Classic)
├── COPYRIGHT_AND_INTELLECTUAL_PROPERTY.md # Author Rights & Anti-Plagiarism Policy
├── LICENSE                           # Multi-Tier Open Source License
└── CONTRIBUTING.md                   # This file
```

---

## 📋 Contribution & Quality Standards

Before submitting any Pull Request, ensure your code adheres to our quality bar:

### 1. Verification Checklist
```bash
# 1. Run all 328 Vitest tests (All 43 suites must pass)
npm test

# 2. Verify zero TypeScript errors
npm run typecheck

# 3. Test production build
npm run build
```

### 2. Code Conventions
- **Strict TypeScript:** No implicit `any`. Explicitly type function signatures, props, and AST visitor returns.
- **Relational Integrity:** Any new table generation logic must integrate into `src/engine/column_intelligence.ts` and respect parent-child foreign key ordering.
- **Pixel-Perfect Authenticity:** When designing UI in Windows 95 mode, preserve the standard 3D beveled borders (`#dfdfdf` face, `#ffffff` top/left highlight, `#808080` / `#000000` bottom/right shadow).
- **No Heavy External Dependencies:** The client runs entirely in the browser; avoid pulling in heavy server-only packages.

### 3. Submitting Pull Requests
1. Create a feature branch with a descriptive name:
   ```bash
   git checkout -b feat/snowflake-transpiler-rules
   ```
2. Commit with meaningful messages:
   ```bash
   git commit -m "feat(transpiler): add support for Snowflake QUALIFY clause normalization"
   ```
3. Push to your fork and submit a PR against `main`.
4. Include a concise summary of changes and screenshots/recordings for any visual modifications.

---

## 📜 Licensing & Contributor Agreement

By contributing to **ExNihilo 95**, you agree that:
1. Your code contributions are licensed under the **MIT License with Attribution**.
2. Any documentation, creative assets, or audio elements are contributed under **Creative Commons CC BY 4.0**.
3. Any challenge schemas or dataset definitions are contributed under **Open Data Commons Attribution (ODC-By v1.0)**.
4. You agree to uphold our anti-plagiarism policy as detailed in [COPYRIGHT_AND_INTELLECTUAL_PROPERTY.md](COPYRIGHT_AND_INTELLECTUAL_PROPERTY.md).

---

## 📬 Contact & Community

- **Project Lead:** [Mrityunjai](https://github.com/Mrityunjai-hue)
- **GitHub Repository:** [exnihilo-95](https://github.com/Mrityunjai-hue/exnihilo-95)
- **Community:** [N8N Data Science Community](https://n8n-ds-community.netlify.app/)
- **Bug Reports & Ideas:** [GitHub Issues](https://github.com/Mrityunjai-hue/exnihilo-95/issues)
