# 🛠️ ExNihilo 95 — Feature Implementation Impact & Refactoring Guide

> **Internal Architectural Planning Document**  
> Documents the exact code changes, new addon modules, step-by-step execution workflows, and safety isolation measures required to implement upcoming roadmap features without breaking existing functionality.
>
> ⚠️ **Note:** This is an internal technical guide for planning — do not commit or push to GitHub repository.

---

## 📑 Index of Feature Modules

1. [Table-Name Aware Schema Inference & Contextual Data Generation](#1-table-name-aware-schema-inference--contextual-data-generation)
2. [SQL Result Chart Builder & Visual Dashboard Canvas](#2-sql-result-chart-builder--visual-dashboard-canvas)
3. [SQL INSERT Statements & Dialect DDL Exporter](#3-sql-insert-statements--dialect-ddl-exporter)
4. [AI-Powered SQL Assistant (Copilot & Error Auto-Fix)](#4-ai-powered-sql-assistant-copilot--error-auto-fix)
5. [Theme Engine (Win95 Noir Dark Mode & Windows XP Skins)](#5-theme-engine-win95-noir-dark-mode--windows-xp-skins)
6. [Live Database Proxy Connections (Live Mode)](#6-live-database-proxy-connections-live-mode)
7. [Pro Multi-Tab Workspaces, Tab Pinning & Color Groups](#7-pro-multi-tab-workspaces-tab-pinning--color-groups)

---

## 1. Table-Name Aware Schema Inference & Contextual Data Generation

### 🎯 Feature Overview
Automatically infer domain-relevant column schemas and synthetic values based on the table name itself:
- Table `users` / `customers` → `id`, `first_name`, `last_name`, `email`, `phone`, `country`, `created_at`
- Table `products` / `items` → `id`, `product_name`, `sku`, `category`, `price`, `stock_quantity`, `description`
- Table `orders` / `transactions` → `id`, `user_id`, `order_date`, `status`, `payment_method`, `total_amount`
- Table `employees` / `staff` → `id`, `employee_code`, `full_name`, `department`, `job_title`, `salary`, `hire_date`

---

### 🔧 Code Changes Required

#### 1. Modify Existing File: `src/engine/inference.ts`
- **Location**: Inside `inferSchemaFromAST()` function.
- **Change**: When inspecting referenced tables (`tableList`), check if column list is sparse or empty (e.g. `SELECT * FROM products`).
- **Logic**: Query `domain_dictionary.ts` for table name matches. If a match is found, seed the table with domain-specific default columns instead of generic `DEFAULT_COLUMNS` (`id`, `name`, `value`, `created_at`).

```typescript
// Proposed Refactoring in src/engine/inference.ts
import { getDomainColumnsForTable } from './domain_dictionary';

// If no explicit column signals were extracted from AST:
const domainColumns = getDomainColumnsForTable(tableName);
if (domainColumns.length > 0) {
  columns = domainColumns;
} else {
  columns = DEFAULT_COLUMNS; // Fallback
}
```

#### 2. Modify Existing File: `src/engine/data_gen.ts`
- **Location**: Inside `generateSyntheticData()` function.
- **Change**: Update Faker.js value generators to be table-domain aware.
- **Logic**: When populating rows for `products`, map `price` to `faker.commerce.price()` and `product_name` to `faker.commerce.productName()`.

#### 3. Create New Addon File: `src/engine/domain_dictionary.ts`
- **Purpose**: Centralized dictionary of domain keywords, default schemas, and Faker generation functions.
- **Structure**:
```typescript
export interface DomainColumnSpec {
  name: string;
  logicalType: LogicalType;
  fakerGenerator: (faker: typeof Faker) => any;
}

export const DOMAIN_TABLE_MAP: Record<string, DomainColumnSpec[]> = {
  users: [
    { name: 'id', logicalType: 'INTEGER', fakerGenerator: (f) => f.number.int({ min: 1, max: 1000 }) },
    { name: 'first_name', logicalType: 'VARCHAR', fakerGenerator: (f) => f.person.firstName() },
    { name: 'last_name', logicalType: 'VARCHAR', fakerGenerator: (f) => f.person.lastName() },
    { name: 'email', logicalType: 'VARCHAR', fakerGenerator: (f) => f.internet.email() },
    { name: 'phone', logicalType: 'VARCHAR', fakerGenerator: (f) => f.phone.number() },
    { name: 'created_at', logicalType: 'TIMESTAMP', fakerGenerator: (f) => f.date.past().toISOString() }
  ],
  products: [
    { name: 'id', logicalType: 'INTEGER', fakerGenerator: (f) => f.number.int({ min: 1, max: 500 }) },
    { name: 'product_name', logicalType: 'VARCHAR', fakerGenerator: (f) => f.commerce.productName() },
    { name: 'sku', logicalType: 'VARCHAR', fakerGenerator: (f) => f.string.alphanumeric(8).toUpperCase() },
    { name: 'category', logicalType: 'VARCHAR', fakerGenerator: (f) => f.commerce.department() },
    { name: 'price', logicalType: 'NUMERIC', fakerGenerator: (f) => parseFloat(f.commerce.price({ min: 10, max: 999 })) },
    { name: 'stock_quantity', logicalType: 'INTEGER', fakerGenerator: (f) => f.number.int({ min: 0, max: 250 }) }
  ]
};
```

---

### 🛡️ Regression Safety
- **Topological DAG Ordering**: Foreign key linking (`orders.user_id = users.id`) must take precedence over domain generators so relational integrity is never broken.
- **Unit Test Coverage**: Add unit tests in `src/tests/engine/inference.test.ts` verifying domain schema matching for `users`, `products`, `orders`, and `employees`.

---

## 2. Standalone Visual Dashboard & Drag-and-Drop Chart Studio Window

### 🎯 Feature Overview
A dedicated standalone Win95 Desktop Application Window (`ChartStudioWindow.tsx`) separate from the SQL IDE. It features an interactive **Drag-and-Drop Visual Builder Canvas** where users can select any table from the session schema, drag columns onto Axis / Metric drop zones, and generate charts using an **Agent-Devised Smart Visualization Recommendation Strategy**.

---

### 🧠 Agent-Devised Smart Visualization Recommendation Strategy
When columns are dropped onto the canvas, the Agent Engine analyzes data types and cardinality to automatically recommend the optimal visual representation:

| Data Combination Dropped | Recommended Visual Type | Rationale & Example |
| :--- | :---: | :--- |
| **1 Categorical Column + 1 Numeric Column** | **Bar Chart** | `category` vs `SUM(price)` — Ideal for comparing discrete metrics across groups. |
| **1 Date/Timestamp Column + 1 Numeric Column** | **Time-Series Line / Area Chart** | `order_date` vs `revenue` — Highlights trend performance over time. |
| **Single Row Numeric Metric** | **KPI Stat Card** | `Total Users: 1,450` — Large retro Win95 numeric display card. |
| **1 Low-Cardinality Category (< 8 items)** | **Donut / Pie Chart** | `status` (`pending`, `shipped`, `delivered`) — Proportion breakdown. |
| **2 Continuous Numeric Columns** | **Scatter Plot** | `unit_price` vs `units_sold` — Visualizes correlation & distribution. |
| **Multi-Dimensional Matrix** | **Pivot Grid Table** | Drag dimensions across row/column headers for dynamic aggregation. |

---

### 🔧 Code Changes & Addon Architecture

#### 1. Create New Desktop Window: `src/components/Win95/ChartStudioWindow.tsx`
- **Purpose**: Standalone floating Win95 window registered in `Desktop.tsx` and opened via Desktop Icon, Start Menu, or Control Panel.
- **Layout**:
  - **Left Sidebar — Schema Explorer**: Interactive list of all inferred tables and columns with drag handles.
  - **Center Canvas — Visual Builder Drop Zones**:
    - `[ 🎯 Drag X-Axis Column Here ]`
    - `[ 📈 Drag Y-Axis / Metric Column Here ]`
    - `[ 🏷️ Drag Series / Legend Column Here ]`
  - **Top Toolbar — Visual Selector**: Switch between Bar, Line, Pie, Area, Scatter, Metric Card, and Pivot Table.
  - **Main Area — Interactive Canvas Grid**: Pin multiple generated visuals onto a resizable, draggable dashboard grid layout.

#### 2. Create New Engine File: `src/engine/visual_strategy.ts`
- **Purpose**: Evaluates dropped column types and suggests the most relevant visual type.
```typescript
export interface VisualStrategyRecommendation {
  recommendedType: 'bar' | 'line' | 'pie' | 'scatter' | 'kpi' | 'pivot';
  confidence: number; // 0 to 1
  reasoning: string;
  autoAggregation: 'SUM' | 'AVG' | 'COUNT' | 'NONE';
}

export function evaluateVisualStrategy(
  xAxisCol?: ColumnDef,
  yAxisCol?: ColumnDef,
  sampleRows: Record<string, any>[] = []
): VisualStrategyRecommendation {
  if (!yAxisCol) {
    return { recommendedType: 'kpi', confidence: 0.9, reasoning: 'Single column metric display', autoAggregation: 'COUNT' };
  }
  if (xAxisCol?.logicalType === 'DATE' || xAxisCol?.logicalType === 'TIMESTAMP') {
    return { recommendedType: 'line', confidence: 0.95, reasoning: 'Time-series trend over date/time axis', autoAggregation: 'SUM' };
  }
  if (xAxisCol?.logicalType === 'VARCHAR') {
    return { recommendedType: 'bar', confidence: 0.9, reasoning: 'Discrete category metric comparison', autoAggregation: 'SUM' };
  }
  return { recommendedType: 'bar', confidence: 0.7, reasoning: 'Default metric bar plot', autoAggregation: 'SUM' };
}
```

#### 3. Modify Desktop Window Manager: `src/components/Win95/Desktop.tsx`
- **Change**: Add `chart_studio` window state (`openWindows.chart_studio`, `focusWindow('chart_studio')`).
- **Icon**: Render new 3D retro icon `chart_studio.png` on the desktop canvas.

---

### 🛡️ Implementation Step-by-Step Workflow
1. Register `chart_studio` in `Desktop.tsx` window state and desktop icon list.
2. Build HTML5 Drag-and-Drop handles on `SchemaTree` / column items.
3. Build drop-zone target handlers in `ChartStudioWindow.tsx`.
4. Run `evaluateVisualStrategy()` on column drop to automatically set chart configuration.
5. Render SVG / Canvas plots with export buttons (PNG, SVG, HTML embed).

---

## 3. SQL INSERT Statements & Dialect DDL Exporter

### 🎯 Feature Overview
Allow users to export synthesized mock datasets as executable `.sql` files containing `INSERT INTO table VALUES (...)` statements and dialect-specific `CREATE TABLE` DDL scripts.

---

### 🔧 Code Changes Required

#### 1. Create New Addon File: `src/engine/exporters.ts`
- **Exports**:
  - `exportToInsertSQL(tableName: string, columns: string[], rows: Record<string, any>[]): string`
  - `exportToDialectDDL(schema: TableDef, dialect: Dialect): string`

#### 2. Modify Existing File: `src/components/IDE/ResultsGrid.tsx`
- **Change**: Add `Export SQL INSERTs` option to the grid toolbar export dropdown.

#### 3. Modify Existing File: `src/components/IDE/SchemaTree.tsx`
- **Change**: Add `Export Schema DDL` button next to table names in the tree sidebar.

---

## 4. AI-Powered SQL Assistant (Copilot & Error Auto-Fix)

### 🎯 Feature Overview
Natural language to SQL generation, schema-aware autocomplete, plain-English query explanation, and 1-click AI error fix suggestions.

---

### 🔧 Code Changes Required

#### 1. Create New Service File: `src/services/ai_copilot.ts`
- **Purpose**: Client API integration calling AI endpoints (Gemini / OpenAI API).
- **Functions**:
  - `generateSQLFromNaturalLanguage(prompt: string, schemaContext: SchemaCatalog): Promise<string>`
  - `explainSQLQuery(queryText: string): Promise<string>`
  - `fixSQLError(queryText: string, errorMessage: string): Promise<{ fixedQuery: string; explanation: string }>`

#### 2. Create New Addon Window: `src/components/IDE/AICopilotWindow.tsx`
- **Purpose**: Floating Win95 window with chat interface, natural language prompt input box, and 1-click "Insert SQL into Editor" button.

#### 3. Modify Existing File: `src/components/IDE/IDEShell.tsx`
- **Change**: Add "AI Assistant 🤖" button to the IDE toolbar; attach AI error fix trigger to error dialogs.

---

## 5. Theme Engine (Win95 Noir Dark Mode & Windows XP Skins)

### 🎯 Feature Overview
Switch between nostalgic operating system themes: **Windows 95 Classic**, **Win95 Noir Dark Mode**, **Windows XP Luna**, and **Windows 2000 Corporate**.

---

### 🔧 Code Changes Required

#### 1. Modify Existing File: `src/styles/win95.css`
- **Change**: Replace hardcoded hex colors (`#008080`, `#c0c0c0`, `#000080`) with CSS Custom Properties:
```css
:root {
  --win-bg: #008080;
  --win-face: #c0c0c0;
  --win-text: #000000;
  --win-titlebar: #000080;
  --win-border-light: #ffffff;
  --win-border-dark: #808080;
}

[data-theme="noir-dark"] {
  --win-bg: #121212;
  --win-face: #1e1e1e;
  --win-text: #e0e0e0;
  --win-titlebar: #2d004d;
  --win-border-light: #333333;
  --win-border-dark: #000000;
}
```

#### 2. Create New Addon Hook: `src/hooks/useThemeManager.ts`
- **Purpose**: Manage active theme state, apply `data-theme` attribute to `<body>`, and persist user choice in IndexedDB.

---

## 6. Live Database Proxy Connections (Live Mode)

### 🎯 Feature Overview
Connect ExNihilo 95 to external live MySQL, PostgreSQL, SQLite, or SQL Server databases over a WebSocket proxy with read-only safety locks.

---

### 🔧 Code Changes Required

#### 1. Modify Existing File: `src/engine/executor.ts`
- **Change**: Introduce execution router abstraction:
```typescript
export async function executeQuery(
  queryText: string,
  dialect: Dialect,
  options: { mode: 'synthetic' | 'live'; liveConnectionConfig?: LiveDbConfig }
) {
  if (options.mode === 'live') {
    return executeOverLiveProxy(queryText, options.liveConnectionConfig);
  }
  // Existing WASM synthetic execution path...
}
```

#### 2. Create New Addon Directory: `server/proxy/`
- `db_proxy_server.ts`: Express / WebSocket proxy server validating read-only query ASTs before forwarding to live databases.

---

## 7. Pro Multi-Tab Workspaces, Tab Pinning & Color Groups

### 🎯 Feature Overview
Unlimited query tabs, tab pinning, tab group colors, and named workspace management.

---

### 🔧 Code Changes Required

#### 1. Modify Existing File: `src/hooks/useWorkspaceStorage.ts`
- **Change**: Extend `TabState` interface:
```typescript
export interface TabState {
  id: string;
  title: string;
  query: string;
  dialect: Dialect;
  isPinned?: boolean;
  colorGroup?: string; // e.g. '#ff0000' for Red Group
}
```

#### 2. Modify Existing File: `src/components/IDE/QueryTabs.tsx`
- **Change**: Render pin icons (`📌`), color group tabs, right-click context menu (*"Pin Tab"*, *"Set Group Color"*, *"Close Other Tabs"*).

---

## 🗓️ Refactoring Execution Checklist

| Phase | Module | Changed Files | New Files | Testing |
| :--- | :--- | :--- | :--- | :---: |
| **Phase 1** | Table-Name Aware Schemas | `inference.ts`, `data_gen.ts` | `domain_dictionary.ts` | Unit tests for domain matching |
| **Phase 2** | SQL Exports | `ResultsGrid.tsx`, `SchemaTree.tsx` | `exporters.ts` | File generation unit tests |
| **Phase 3** | Result Chart Builder | `ResultsGrid.tsx`, `IDEShell.tsx` | `QueryResultChart.tsx` | UI rendering tests |
| **Phase 4** | Theme Engine | `win95.css`, `Desktop.tsx` | `useThemeManager.ts` | Theme switching validation |
| **Phase 5** | AI Copilot | `IDEShell.tsx` | `AICopilotWindow.tsx`, `ai_copilot.ts` | Mock API integration tests |

---
