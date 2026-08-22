/**
 * HelpWindow.tsx — Windows 95 Help Manual & SQL Query Tutorial (winhlp32 style)
 */

import React, { useState } from 'react';
import { useDraggable } from '../../hooks/useDraggable';

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
  const { position, handleMouseDown } = useDraggable({ x: 90, y: 55 });

  if (!isOpen || isMinimized) return null;

  const topics: HelpTopic[] = [
    {
      id: 'intro',
      category: '1. Fundamentals',
      title: 'How ExNihio Works (Zero Table-Not-Found)',
      summary: 'Never see "table not found" error again.',
      content: (
        <div>
          <h3 style={{ margin: '0 0 8px 0', borderBottom: '1px solid #808080', paddingBottom: '4px' }}>
            📖 How ExNihio Works
          </h3>
          <p>
            In traditional SQL database environments, querying a table that does not exist results in an immediate execution failure:
          </p>
          <div style={{ background: '#000', color: '#ff5555', padding: '6px', fontFamily: 'var(--w95-mono)', marginBottom: '8px' }}>
            ERROR 1146 (42S02): Table 'database.customers' doesn't exist
          </div>
          <p>
            <strong>ExNihio</strong> operates differently:
          </p>
          <ol style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
            <li><strong>AST Parsing:</strong> ExNihio parses your SQL query according to your selected SQL dialect (MySQL, PostgreSQL, SQLite, or SSMS).</li>
            <li><strong>Schema Inference:</strong> It inspects every column reference, comparison operator, function, and JOIN condition to deduce column data types.</li>
            <li><strong>Relationship Graph:</strong> It discovers foreign keys and builds a dependency graph to generate parent tables before children.</li>
            <li><strong>Synthetic Data Generation:</strong> It generates type-appropriate, realistic mock rows adhering to referential integrity.</li>
            <li><strong>In-Browser Execution:</strong> Everything executes client-side inside WebAssembly SQLite (sql.js) in milliseconds.</li>
          </ol>
        </div>
      ),
    },
    {
      id: 'writing-queries',
      category: '2. Query Tutorial',
      title: 'Writing SELECT, WHERE & Aggregates',
      summary: 'Learn how to write queries with type inference.',
      content: (
        <div>
          <h3 style={{ margin: '0 0 8px 0', borderBottom: '1px solid #808080', paddingBottom: '4px' }}>
            ✍️ Writing Queries in ExNihio
          </h3>
          <p>
            You can write standard SQL just like in any production database. ExNihio infers data types automatically from your syntax:
          </p>

          <div style={{ marginTop: '12px' }}>
            <strong>1. Numeric Comparisons:</strong>
            <p style={{ margin: '4px 0' }}>Comparing a column against numbers tells ExNihio the column is NUMERIC.</p>
            <div style={{ background: '#f5f5f5', padding: '6px', border: '1px solid #ccc', fontFamily: 'var(--w95-mono)' }}>
              SELECT * FROM customers WHERE age &gt; 30
            </div>
            <button
              className="win95-button"
              style={{ marginTop: '6px', fontSize: '11px' }}
              onClick={() => onLoadQuery('SELECT * FROM customers WHERE age > 30', 'MySQL')}
            >
              👉 Try this query in IDE
            </button>
          </div>

          <div style={{ marginTop: '16px' }}>
            <strong>2. String Pattern Matching (LIKE):</strong>
            <p style={{ margin: '4px 0' }}>Using <code>LIKE '%@gmail.com'</code> infers a VARCHAR text column.</p>
            <div style={{ background: '#f5f5f5', padding: '6px', border: '1px solid #ccc', fontFamily: 'var(--w95-mono)' }}>
              {"SELECT name, email FROM users WHERE email LIKE '%@gmail.com'"}
            </div>
            <button
              className="win95-button"
              style={{ marginTop: '6px', fontSize: '11px' }}
              onClick={() => onLoadQuery("SELECT name, email FROM users WHERE email LIKE '%@gmail.com'", 'PostgreSQL')}
            >
              👉 Try this query in IDE
            </button>
          </div>

          <div style={{ marginTop: '16px' }}>
            <strong>3. Group By and Aggregates:</strong>
            <p style={{ margin: '4px 0' }}><code>AVG(salary)</code> infers salary as NUMERIC, while department is categorical VARCHAR.</p>
            <div style={{ background: '#f5f5f5', padding: '6px', border: '1px solid #ccc', fontFamily: 'var(--w95-mono)' }}>
              SELECT department, AVG(salary) FROM employees GROUP BY department
            </div>
            <button
              className="win95-button"
              style={{ marginTop: '6px', fontSize: '11px' }}
              onClick={() => onLoadQuery('SELECT department, AVG(salary) FROM employees GROUP BY department', 'MySQL')}
            >
              👉 Try this query in IDE
            </button>
          </div>
        </div>
      ),
    },
    {
      id: 'joins',
      category: '3. Advanced Joins',
      title: 'JOINs & Referential Integrity',
      summary: 'Multi-table joins, self-joins, and outer join orphan ratios.',
      content: (
        <div>
          <h3 style={{ margin: '0 0 8px 0', borderBottom: '1px solid #808080', paddingBottom: '4px' }}>
            🔗 JOINs and Foreign Keys
          </h3>
          <p>
            When you join tables on keys (e.g. <code>orders.customer_id = customers.id</code>), ExNihio automatically connects the generated keys:
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
              👉 Try this query in IDE
            </button>
          </div>

          <div style={{ marginTop: '16px' }}>
            <strong>2. Hierarchical Self-Joins:</strong>
            <p style={{ margin: '4px 0' }}>Joining <code>employees</code> to itself creates a company hierarchy with a top-level manager having <code>NULL</code> manager_id.</p>
            <div style={{ background: '#f5f5f5', padding: '6px', border: '1px solid #ccc', fontFamily: 'var(--w95-mono)' }}>
              SELECT e.name AS employee, m.name AS manager FROM employees e LEFT JOIN employees m ON e.manager_id = m.id
            </div>
            <button
              className="win95-button"
              style={{ marginTop: '6px', fontSize: '11px' }}
              onClick={() => onLoadQuery('SELECT e.name AS employee, m.name AS manager FROM employees e LEFT JOIN employees m ON e.manager_id = m.id', 'PostgreSQL')}
            >
              👉 Try this query in IDE
            </button>
          </div>

          <div style={{ marginTop: '16px' }}>
            <strong>3. LEFT JOIN with Realistic Unmatched Rows:</strong>
            <p style={{ margin: '4px 0' }}>Outer joins simulate ~80% matched records and ~20% unmatched/null records.</p>
            <div style={{ background: '#f5f5f5', padding: '6px', border: '1px solid #ccc', fontFamily: 'var(--w95-mono)' }}>
              SELECT c.name, o.id FROM customers c LEFT JOIN orders o ON c.id = o.customer_id
            </div>
            <button
              className="win95-button"
              style={{ marginTop: '6px', fontSize: '11px' }}
              onClick={() => onLoadQuery('SELECT c.name, o.id FROM customers c LEFT JOIN orders o ON c.id = o.customer_id', 'SQLite')}
            >
              👉 Try this query in IDE
            </button>
          </div>
        </div>
      ),
    },
    {
      id: 'dialects',
      category: '4. Dialects & Tips',
      title: 'Dialect Specifics (Postgres, SSMS, MySQL, SQLite)',
      summary: 'Syntax variations across SQL dialects.',
      content: (
        <div>
          <h3 style={{ margin: '0 0 8px 0', borderBottom: '1px solid #808080', paddingBottom: '4px' }}>
            🎛️ SQL Dialect Support
          </h3>
          <p>ExNihio provides native parser support for 5 dialect configurations:</p>
          <ul style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
            <li><strong>MySQL:</strong> Full support for backticks, <code>LIMIT</code>, <code>GROUP BY</code>.</li>
            <li><strong>PostgreSQL:</strong> Supports <code>::type</code> casting (e.g. <code>score::float</code>) and CTEs (<code>WITH ...</code>).</li>
            <li><strong>SQLite:</strong> Standard ANSI SQL, AUTOINCREMENT, zero-configuration execution.</li>
            <li><strong>SSMS / Transact-SQL:</strong> Supports bracket identifiers <code>[dbo].[table]</code> and <code>TOP N</code> clauses.</li>
          </ul>

          <div style={{ marginTop: '12px' }}>
            <strong>PostgreSQL CTE Example:</strong>
            <div style={{ background: '#f5f5f5', padding: '6px', border: '1px solid #ccc', fontFamily: 'var(--w95-mono)', fontSize: '11px' }}>
              {"WITH recent AS (SELECT * FROM sales WHERE sale_date > '2026-01-01') SELECT * FROM recent"}
            </div>
            <button
              className="win95-button"
              style={{ marginTop: '6px', fontSize: '11px' }}
              onClick={() => onLoadQuery("WITH recent AS (SELECT * FROM sales WHERE sale_date > '2026-01-01') SELECT * FROM recent", 'PostgreSQL')}
            >
              👉 Try this query in IDE
            </button>
          </div>
        </div>
      ),
    },
    {
      id: 'about',
      category: '5. About & Community',
      title: 'About ExNihilo & N8N Community',
      summary: 'Author attribution and community links.',
      content: (
        <div>
          <h3 style={{ margin: '0 0 8px 0', borderBottom: '1px solid #808080', paddingBottom: '4px' }}>
            ✨ About ExNihilo 95
          </h3>
          <p>
            <strong>ExNihilo</strong> is a zero-configuration in-browser SQL development environment that eliminates <code>Table not found</code> errors through intelligent schema deduction and referential mock data generation.
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
              👨‍💻 <strong>Built by:</strong>{' '}
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
              🌐 <strong>Powered by:</strong>{' '}
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
              Join the community for tools, tutorials, workflows, and discussions in AI &amp; data science!
            </p>
          </div>
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
        width: '680px',
        height: '460px',
        zIndex,
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
        <div className="win95-titlebar-controls">
          <button className="win95-btn-titlebar" onClick={onMinimize}>_</button>
          <button className="win95-btn-titlebar" onClick={onClose}>✕</button>
        </div>
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
          style={{ width: '220px', height: '100%', overflowY: 'auto', padding: '4px' }}
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
