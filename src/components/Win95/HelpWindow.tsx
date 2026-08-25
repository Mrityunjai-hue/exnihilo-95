/**
 * HelpWindow.tsx — Windows 95 Help Manual & SQL Query Tutorial (winhlp32 style)
 * Fully updated with multi-tab workspace, selection execution, cascading menus,
 * color highlighting guides, and advanced SQL query patterns (Window functions, CTEs, Subqueries).
 */

import React, { useState } from 'react';
import { useDraggable } from '../../hooks/useDraggable';
import { WindowControls } from './WindowControls';

interface HelpWindowProps {
  isOpen:        boolean;
  isMinimized:   boolean;
  zIndex:        number;
  onClose:       () => void;
  onMinimize:    () => void;
  onFocus:       () => void;
  onLoadQuery:   (sql: string, dialect: string) => void;
}

interface HelpTopic {
  id:          string;
  category:    string;
  title:       string;
  summary:     string;
  content:     React.ReactNode;
}

export const HelpWindow: React.FC<HelpWindowProps> = ({
  isOpen,
  isMinimized,
  zIndex,
  onClose,
  onMinimize,
  onFocus,
  onLoadQuery,
}) => {
  const [selectedTopicId, setSelectedTopicId] = useState<string>('intro');
  const { position, handleMouseDown } = useDraggable({ x: 80, y: 45 });

  if (!isOpen) return null;

  const topics: HelpTopic[] = [
    {
      id: 'intro',
      category: '1. Fundamentals',
      title: 'How ExNihilo Works (Zero-Config SQL)',
      summary: 'Never see "table not found" errors again.',
      content: (
        <div>
          <h3 style={{ margin: '0 0 8px 0', borderBottom: '1px solid #808080', paddingBottom: '4px' }}>
            📖 How ExNihilo 95 Works
          </h3>
          <p>
            In traditional SQL database systems, executing a query for a table that has not yet been defined produces an immediate runtime failure:
          </p>
          <div style={{ background: '#000', color: '#ff5555', padding: '6px', fontFamily: 'var(--w95-mono)', marginBottom: '8px' }}>
            ERROR 1146 (42S02): Table 'database.customers' doesn't exist
          </div>
          <p>
            <strong>ExNihilo 95</strong> (*"Out of nothing"*) eliminates this obstacle through client-side AST analysis:
          </p>
          <ol style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
            <li><strong>Multi-Dialect AST Parsing:</strong> Uses concrete dialect grammars for MySQL, PostgreSQL, SQLite, and SSMS / T-SQL.</li>
            <li><strong>Intelligent Schema Inference:</strong> Deduces column types, primary keys, and relationships from predicates, functions, and WHERE clauses.</li>
            <li><strong>Referential DAG Sorting:</strong> Discovers foreign key dependencies (e.g. <code>orders.customer_id = customers.id</code>) and generates parent tables first.</li>
            <li><strong>Realistic Synthetic Data:</strong> Generates context-aware mock rows with realistic names, emails, prices, dates, and orphan ratios.</li>
            <li><strong>100% In-Browser WASM:</strong> Executes queries client-side in SQLite WebAssembly at native speeds with zero server dependencies.</li>
          </ol>
        </div>
      ),
    },
    {
      id: 'workspace-features',
      category: '2. IDE & Navigation',
      title: 'Multi-Tab Editor & Cascading Menus',
      summary: 'Tab management, shortcuts, and menu bar operations.',
      content: (
        <div>
          <h3 style={{ margin: '0 0 8px 0', borderBottom: '1px solid #808080', paddingBottom: '4px' }}>
            🖥️ Multi-Tab Workspace & Windows 95 Menus
          </h3>

          <div style={{ marginTop: '10px' }}>
            <strong>📑 Multi-Tab Query Strips:</strong>
            <p style={{ margin: '4px 0' }}>
              Work on multiple SQL scripts simultaneously without losing query history. Click <strong>[ + ]</strong> or press <code>Ctrl+T</code> to open a new tab. Each tab maintains its own editor text, query results, row counts, and execution metrics.
            </p>
          </div>

          <div style={{ marginTop: '12px' }}>
            <strong>📂 Table-Click Dedicated Tabs:</strong>
            <p style={{ margin: '4px 0' }}>
              Clicking any table in the left <strong>Schema Explorer</strong> tree opens a new dedicated tab titled <code>{'{table}'}.sql</code> with <code>SELECT * FROM {'{table}'};</code> without overwriting any of your existing queries!
            </p>
          </div>

          <div style={{ marginTop: '12px' }}>
            <strong>🔽 Cascading Windows 95 Dropdown Menus:</strong>
            <ul style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
              <li><strong>File:</strong> New Query Tab (<code>Ctrl+T</code>), Save / Export <code>.sql</code> File (<code>Ctrl+S</code>), Close Tab, Exit Studio.</li>
              <li><strong>Edit:</strong> Clear Query, Insert Sample JOIN, Insert Sample GROUP BY, Insert Sample CTE.</li>
              <li><strong>Query:</strong> Execute Active Script (<code>F5</code>), Execute Highlighted Selection, Clear Results.</li>
              <li><strong>View:</strong> Show/Hide Schema Tree Explorer Pane, Refresh Schema (<code>F5</code>), Maximize/Restore.</li>
              <li><strong>Tools:</strong> Options & Control Panel, Reset In-Memory Database Session.</li>
              <li><strong>Help:</strong> SQL Query Tutorial, Guided Balloon Tour, About ExNihilo 95.</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'highlighting',
      category: '3. Editor & Syntax',
      title: 'Color Highlighting & Selection Execution',
      summary: 'Green quotes, purple numbers, and partial query execution.',
      content: (
        <div>
          <h3 style={{ margin: '0 0 8px 0', borderBottom: '1px solid #808080', paddingBottom: '4px' }}>
            🎨 Syntax Highlighting & Selection Execution
          </h3>

          <div style={{ marginTop: '10px' }}>
            <strong>🎨 Custom High-Contrast SQL Theme:</strong>
            <ul style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
              <li><span style={{ color: '#008800', fontWeight: 'bold' }}>🟢 Vibrant Green:</span> Quoted text literals between single or double quotes (e.g. <code>'@gmail.com'</code>, <code>'Engineering'</code>).</li>
              <li><span style={{ color: '#800080', fontWeight: 'bold' }}>🟣 Bold Purple:</span> Numbers and numeric comparison targets (e.g. <code>age &gt; 30</code>, <code>100</code>, <code>25.50</code>).</li>
              <li><span style={{ color: '#b00020', fontWeight: 'bold' }}>🔴 Bold Crimson:</span> Comparison and logical operators (<code>=</code>, <code>&gt;</code>, <code>&lt;</code>, <code>&gt;=</code>, <code>!=</code>).</li>
              <li><span style={{ color: '#000080', fontWeight: 'bold' }}>🔵 Navy Blue:</span> Standard SQL keywords (<code>SELECT</code>, <code>FROM</code>, <code>WHERE</code>, <code>JOIN</code>, <code>GROUP BY</code>).</li>
            </ul>
          </div>

          <div style={{ marginTop: '14px' }}>
            <strong>▶️ Selection-Aware Query Execution:</strong>
            <p style={{ margin: '4px 0' }}>
              When you highlight or select a portion of text in the CodeMirror editor, the toolbar automatically updates to <strong>`▶ Run Selection (F5)`</strong> and executes only your highlighted query block.
            </p>
          </div>

          <div style={{ marginTop: '14px' }}>
            <strong>📊 Multi-Query Semicolon Result Tabs:</strong>
            <p style={{ margin: '4px 0' }}>
              If your editor contains multiple queries separated by semicolons (<code>;</code>), ExNihilo executes each statement sequentially and renders dedicated result tabs:
            </p>
            <div style={{ background: '#f5f5f5', padding: '6px', border: '1px solid #ccc', fontFamily: 'var(--w95-mono)', fontSize: '11px' }}>
              SELECT id, name FROM authors LIMIT 3; <br />
              SELECT id, title, author_id FROM books LIMIT 5;
            </div>
            <button
              className="win95-button"
              style={{ marginTop: '6px', fontSize: '11px' }}
              onClick={() => onLoadQuery('SELECT id, name FROM authors LIMIT 3; SELECT id, title, author_id FROM books LIMIT 5;', 'SQLite')}
            >
              👉 Try multi-query batch in IDE
            </button>
          </div>
        </div>
      ),
    },
    {
      id: 'advanced-queries',
      category: '4. SQL Archetypes',
      title: 'Subqueries, CTEs & Window Functions',
      summary: 'Nested queries, common table expressions, and ranking.',
      content: (
        <div>
          <h3 style={{ margin: '0 0 8px 0', borderBottom: '1px solid #808080', paddingBottom: '4px' }}>
            ⚡ Advanced SQL Query Archetypes
          </h3>
          <p>ExNihilo 95 supports complex modern SQL constructs:</p>

          <div style={{ marginTop: '12px' }}>
            <strong>1. Subqueries with IN:</strong>
            <div style={{ background: '#f5f5f5', padding: '6px', border: '1px solid #ccc', fontFamily: 'var(--w95-mono)', fontSize: '11px' }}>
              SELECT id, name, budget FROM projects WHERE client_id IN (SELECT id FROM clients WHERE tier = 'enterprise')
            </div>
            <button
              className="win95-button"
              style={{ marginTop: '6px', fontSize: '11px' }}
              onClick={() => onLoadQuery("SELECT id, name, budget FROM projects WHERE client_id IN (SELECT id FROM clients WHERE tier = 'enterprise');", 'PostgreSQL')}
            >
              👉 Try this query in IDE
            </button>
          </div>

          <div style={{ marginTop: '14px' }}>
            <strong>2. Window Functions (ROW_NUMBER &amp; AVG OVER):</strong>
            <div style={{ background: '#f5f5f5', padding: '6px', border: '1px solid #ccc', fontFamily: 'var(--w95-mono)', fontSize: '11px' }}>
              SELECT id, department, salary, ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC) as dept_rank FROM staff_members
            </div>
            <button
              className="win95-button"
              style={{ marginTop: '6px', fontSize: '11px' }}
              onClick={() => onLoadQuery('SELECT id, department, salary, ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC) as dept_rank, AVG(salary) OVER (PARTITION BY department) as dept_avg FROM staff_members;', 'SQLite')}
            >
              👉 Try window functions in IDE
            </button>
          </div>

          <div style={{ marginTop: '14px' }}>
            <strong>3. Chained Common Table Expressions (CTEs):</strong>
            <div style={{ background: '#f5f5f5', padding: '6px', border: '1px solid #ccc', fontFamily: 'var(--w95-mono)', fontSize: '11px' }}>
              WITH high_val AS (SELECT customer_id, SUM(total) as lifetime_spent FROM orders GROUP BY customer_id HAVING lifetime_spent &gt; 100) SELECT c.name, hv.lifetime_spent FROM customers c JOIN high_val hv ON c.id = hv.customer_id
            </div>
            <button
              className="win95-button"
              style={{ marginTop: '6px', fontSize: '11px' }}
              onClick={() => onLoadQuery('WITH high_val AS (SELECT customer_id, SUM(total) as lifetime_spent FROM customer_orders GROUP BY customer_id HAVING lifetime_spent > 100) SELECT c.name, c.email, hv.lifetime_spent FROM store_customers c JOIN high_val hv ON c.id = hv.customer_id ORDER BY lifetime_spent DESC;', 'PostgreSQL')}
            >
              👉 Try chained CTEs in IDE
            </button>
          </div>

          <div style={{ marginTop: '14px' }}>
            <strong>4. Conditional CASE Expressions:</strong>
            <div style={{ background: '#f5f5f5', padding: '6px', border: '1px solid #ccc', fontFamily: 'var(--w95-mono)', fontSize: '11px' }}>
              SELECT id, name, age, CASE WHEN age &lt; 18 THEN 'Minor' WHEN age &lt; 65 THEN 'Adult' ELSE 'Senior' END as age_group FROM patients
            </div>
            <button
              className="win95-button"
              style={{ marginTop: '6px', fontSize: '11px' }}
              onClick={() => onLoadQuery("SELECT id, name, age, CASE WHEN age < 18 THEN 'Minor' WHEN age < 65 THEN 'Adult' ELSE 'Senior' END as age_group FROM patients;", 'MySQL')}
            >
              👉 Try CASE query in IDE
            </button>
          </div>
        </div>
      ),
    },
    {
      id: 'joins',
      category: '5. Relational Graph',
      title: 'JOINs & Referential Integrity',
      summary: 'Multi-table joins, self-joins, and foreign key hierarchies.',
      content: (
        <div>
          <h3 style={{ margin: '0 0 8px 0', borderBottom: '1px solid #808080', paddingBottom: '4px' }}>
            🔗 Relational Foreign Keys &amp; Multi-Joins
          </h3>
          <p>
            When tables are connected via join predicates (e.g. <code>orders.customer_id = customers.id</code>), ExNihio maps them into a topological dependency graph:
          </p>

          <div style={{ marginTop: '12px' }}>
            <strong>1. Multi-Table Chain (4 Tables):</strong>
            <div style={{ background: '#f5f5f5', padding: '6px', border: '1px solid #ccc', fontFamily: 'var(--w95-mono)', fontSize: '11px' }}>
              SELECT c.name, o.id, p.name FROM customers c JOIN orders o ON c.id = o.customer_id JOIN order_items oi ON o.id = oi.order_id JOIN products p ON oi.product_id = p.id
            </div>
            <button
              className="win95-button"
              style={{ marginTop: '6px', fontSize: '11px' }}
              onClick={() => onLoadQuery('SELECT c.name, o.id, p.name FROM customers c JOIN orders o ON c.id = o.customer_id JOIN order_items oi ON o.id = oi.order_id JOIN products p ON oi.product_id = p.id', 'MySQL')}
            >
              👉 Try 4-table join in IDE
            </button>
          </div>

          <div style={{ marginTop: '14px' }}>
            <strong>2. Hierarchical Self-Joins:</strong>
            <p style={{ margin: '4px 0' }}>Joining <code>team_members</code> to itself creates a valid management hierarchy with a top-level manager having <code>NULL</code> manager_id.</p>
            <div style={{ background: '#f5f5f5', padding: '6px', border: '1px solid #ccc', fontFamily: 'var(--w95-mono)', fontSize: '11px' }}>
              SELECT emp.name AS employee, mgr.name AS manager FROM team_members emp LEFT JOIN team_members mgr ON emp.manager_id = mgr.id
            </div>
            <button
              className="win95-button"
              style={{ marginTop: '6px', fontSize: '11px' }}
              onClick={() => onLoadQuery('SELECT emp.name AS employee, emp.title, mgr.name AS manager FROM team_members emp LEFT JOIN team_members mgr ON emp.manager_id = mgr.id', 'PostgreSQL')}
            >
              👉 Try self-join in IDE
            </button>
          </div>

          <div style={{ marginTop: '14px' }}>
            <strong>3. Set Operations (UNION ALL):</strong>
            <div style={{ background: '#f5f5f5', padding: '6px', border: '1px solid #ccc', fontFamily: 'var(--w95-mono)', fontSize: '11px' }}>
              SELECT id, name, email, 'US' as region FROM us_customers UNION ALL SELECT id, name, email, 'EU' as region FROM eu_customers
            </div>
            <button
              className="win95-button"
              style={{ marginTop: '6px', fontSize: '11px' }}
              onClick={() => onLoadQuery("SELECT id, name, email, 'US_Customer' as source FROM us_customers UNION ALL SELECT id, name, email, 'EU_Customer' as source FROM eu_customers;", 'SQLite')}
            >
              👉 Try UNION ALL in IDE
            </button>
          </div>
        </div>
      ),
    },
    {
      id: 'diagnostics',
      category: '6. Diagnostics & System',
      title: 'Error Diagnostics & Shut Down',
      summary: '1-click error traces, clipboard copy, and Win95 shut down.',
      content: (
        <div>
          <h3 style={{ margin: '0 0 8px 0', borderBottom: '1px solid #808080', paddingBottom: '4px' }}>
            🛠️ Error Diagnostics &amp; System Features
          </h3>

          <div style={{ marginTop: '10px' }}>
            <strong>📋 1-Click Error Diagnostics Copy:</strong>
            <p style={{ margin: '4px 0' }}>
              If a query encounters a syntax error or ambiguous column reference across joined tables, the authentic Windows 95 <strong>Error Dialog</strong> appears with detailed AST traces and a convenient <strong>`📋 Copy Error`</strong> button for instant clipboard sharing.
            </p>
          </div>

          <div style={{ marginTop: '14px' }}>
            <strong>🔌 Start Menu Shut Down:</strong>
            <p style={{ margin: '4px 0' }}>
              Access the classic <strong>Shut Down...</strong> dialog from the Start Menu to restart the environment, reset in-memory catalog databases, or clear desktop windows.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'about',
      category: '7. About & Community',
      title: 'About ExNihilo 95 & Attribution',
      summary: 'Original creator attribution and community partnership.',
      content: (
        <div>
          <h3 style={{ margin: '0 0 8px 0', borderBottom: '1px solid #808080', paddingBottom: '4px' }}>
            ✨ About ExNihilo 95
          </h3>
          <p>
            <strong>ExNihilo 95</strong> is an original zero-configuration in-browser SQL development environment conceived by Mrityunjai and built with AI.
          </p>
          <div
            className="win95-sunken"
            style={{
              background: '#f9f9f9',
              padding: '12px',
              border: '1px solid #c0c0c0',
              marginTop: '12px',
            }}
          >
            <p style={{ margin: '0 0 8px 0', fontSize: '12px' }}>
              👨‍💻 <strong>Original Idea &amp; Creator:</strong>{' '}
              <a
                href="https://github.com/Mrityunjai-hue"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#0000ee', fontWeight: 'bold', textDecoration: 'underline' }}
              >
                Mrityunjai
              </a>
            </p>
            <p style={{ margin: '0 0 8px 0', fontSize: '12px' }}>
              🌐 <strong>Community Partner:</strong>{' '}
              <a
                href="https://n8n-ds-community.netlify.app/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#0000ee', fontWeight: 'bold', textDecoration: 'underline' }}
              >
                N8N Data Science Community
              </a>{' '}
              using AI
            </p>
            <p style={{ margin: 0, fontSize: '10px', color: '#555' }}>
              Built with Next.js, WebAssembly SQLite (sql.js), CodeMirror 6, and authentic Windows 95 styling.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'shortcuts',
      category: '6. Power User',
      title: 'Keyboard Shortcuts & Tab Management',
      summary: 'Boost productivity with safe Alt+ key combinations.',
      content: (
        <div>
          <h3 style={{ margin: '0 0 8px 0', borderBottom: '1px solid #808080', paddingBottom: '4px' }}>
            ⚡ Keyboard Shortcuts & Workspace Persistence
          </h3>
          <p>
            ExNihilo 95 provides dedicated, non-intrusive keyboard shortcuts designed specifically for rapid multi-tab SQL authoring.
          </p>

          <div className="win95-inset" style={{ padding: '8px', background: '#f5f5f5', marginBottom: '12px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #c0c0c0', textAlign: 'left' }}>
                  <th style={{ padding: '4px' }}>Shortcut</th>
                  <th style={{ padding: '4px' }}>Action</th>
                  <th style={{ padding: '4px' }}>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
                  <td style={{ padding: '4px' }}><code>Alt + T</code></td>
                  <td style={{ padding: '4px' }}>New Query Tab</td>
                  <td style={{ padding: '4px' }}>Opens a clean query tab with incremental numbering</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
                  <td style={{ padding: '4px' }}><code>Alt + W</code></td>
                  <td style={{ padding: '4px' }}>Close Active Tab</td>
                  <td style={{ padding: '4px' }}>Closes the currently focused query tab</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
                  <td style={{ padding: '4px' }}><code>Alt + ]</code></td>
                  <td style={{ padding: '4px' }}>Next Tab</td>
                  <td style={{ padding: '4px' }}>Cycles focus to the next open query tab</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
                  <td style={{ padding: '4px' }}><code>Alt + [</code></td>
                  <td style={{ padding: '4px' }}>Previous Tab</td>
                  <td style={{ padding: '4px' }}>Cycles focus to the previous open query tab</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
                  <td style={{ padding: '4px' }}><code>F5</code></td>
                  <td style={{ padding: '4px' }}>Execute Query</td>
                  <td style={{ padding: '4px' }}>Runs the active or selected SQL statement</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h4 style={{ margin: '10px 0 4px 0' }}>💡 Why Alt Key Combinations?</h4>
          <p style={{ margin: '0 0 10px 0' }}>
            Standard browser-level hotkeys (such as <code>Ctrl+T</code> for browser tabs and <code>Ctrl+W</code> for closing windows) can lead to accidental loss of session data if hijacked. ExNihilo 95 uses the <strong>Alt</strong> modifier key to guarantee zero conflict with native browser navigation.
          </p>

          <h4 style={{ margin: '10px 0 4px 0' }}>🖱️ Tab Context Menu (Right-Click)</h4>
          <ul style={{ paddingLeft: '20px', margin: '4px 0' }}>
            <li><strong>Right-Click Tab &rarr; Duplicate Tab:</strong> Clones current query & dialect into a new tab.</li>
            <li><strong>Right-Click Tab &rarr; Close Other Tabs:</strong> Clears all other tabs from memory while preserving the active tab.</li>
          </ul>
        </div>
      ),
    },
  ];


  const currentTopic = topics.find((t) => t.id === selectedTopicId) || topics[0];

  return (
    <div
      className="win95-window"
      style={{
        position: 'absolute',
        top: `${position.y}px`,
        left: `${position.x}px`,
        width: '700px',
        height: '480px',
        zIndex,
        display: isMinimized ? 'none' : 'flex',
        flexDirection: 'column',
      }}
      onMouseDown={onFocus}
    >
      {/* Titlebar with Drag Handler */}
      <div
        className="win95-titlebar"
        onMouseDown={(e) => {
          onFocus();
          handleMouseDown(e);
        }}
        style={{ cursor: 'move' }}
      >
        <div className="win95-titlebar-text">
          <span>📖</span>
          <span>ExNihilo SQL Help & Query Guide</span>
        </div>
        <WindowControls
          onMinimize={onMinimize}
          onClose={onClose}
        />
      </div>

      {/* Menu Bar */}
      <div style={{ display: 'flex', gap: '12px', padding: '2px 6px', borderBottom: '1px solid #808080', fontSize: '11px' }}>
        <span style={{ cursor: 'pointer' }}><u>F</u>ile</span>
        <span style={{ cursor: 'pointer' }}><u>E</u>dit</span>
        <span style={{ cursor: 'pointer' }}><u>B</u>ookmark</span>
        <span style={{ cursor: 'pointer' }}><u>O</u>ptions</span>
        <span style={{ cursor: 'pointer' }}><u>H</u>elp</span>
      </div>

      {/* Help Content Layout */}
      <div style={{ display: 'flex', flex: 1, padding: '4px', gap: '4px', overflow: 'hidden' }}>
        {/* Topics Sidebar */}
        <div
          className="win95-inset"
          style={{ width: '230px', height: '100%', overflowY: 'auto', padding: '4px' }}
        >
          <div style={{ fontWeight: 'bold', marginBottom: '6px', fontSize: '11px', color: '#000080' }}>
            📂 Help Topics
          </div>
          {topics.map((t) => (
            <div
              key={t.id}
              onClick={() => setSelectedTopicId(t.id)}
              style={{
                padding: '4px 6px',
                cursor: 'pointer',
                background: selectedTopicId === t.id ? '#000080' : 'transparent',
                color: selectedTopicId === t.id ? '#ffffff' : '#000000',
                fontSize: '11px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                marginBottom: '2px',
              }}
            >
              <span>📄</span>
              <span>{t.title}</span>
            </div>
          ))}
        </div>

        {/* Topic Reader Pane */}
        <div
          className="win95-inset"
          style={{ flex: 1, height: '100%', overflowY: 'auto', padding: '12px', background: '#ffffff' }}
        >
          {currentTopic.content}
        </div>
      </div>

      {/* Status Bar */}
      <div className="win95-statusbar">
        <div className="win95-statusbar-pane" style={{ flex: 1 }}>
          Topic: {currentTopic.title}
        </div>
        <div className="win95-statusbar-pane">
          winhlp32.exe
        </div>
      </div>
    </div>
  );
};
