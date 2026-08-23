/**
 * Toolbar.tsx — Enhanced Windows 95 IDE Action Toolbar
 * Includes SQL Beautifier/Formatter, Template Snippet Selector, History Toggle,
 * Dialect Selector, and Action Controls.
 */

import React, { useState } from 'react';
import { Dialect } from '../../engine/parser';

interface ToolbarProps {
  dialect:           Dialect;
  onDialectChange:   (dialect: Dialect) => void;
  onRun:             () => void;
  onReset:           () => void;
  onFormatSql?:      () => void;
  onInsertTemplate?: (templateSql: string) => void;
  onToggleHistory?:  () => void;
  onOpenHelp:        () => void;
  onOpenSettings:    () => void;
  onStartTour:       () => void;
  isLoading:         boolean;
  hasSelection?:     boolean;
  historyCount?:     number;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  dialect,
  onDialectChange,
  onRun,
  onReset,
  onFormatSql,
  onInsertTemplate,
  onToggleHistory,
  onOpenHelp,
  onOpenSettings,
  onStartTour,
  isLoading,
  hasSelection = false,
  historyCount = 0,
}) => {
  const [templateMenuOpen, setTemplateMenuOpen] = useState(false);

  const templates = [
    {
      label: '⚡ Basic SELECT Query',
      sql: `-- Basic SELECT Query\nSELECT id, name, category, price\nFROM products\nWHERE price > 50\nORDER BY price DESC;`,
    },
    {
      label: '🔗 INNER JOIN Aggregation',
      sql: `-- INNER JOIN & Group Aggregation\nSELECT c.country, COUNT(o.id) AS order_count, SUM(o.total_amount) AS total_revenue\nFROM customers c\nJOIN orders o ON c.id = o.customer_id\nGROUP BY c.country\nHAVING order_count >= 2\nORDER BY total_revenue DESC;`,
    },
    {
      label: '📂 LEFT JOIN & NULL Filter',
      sql: `-- LEFT JOIN (Find customers with zero orders)\nSELECT c.id, c.name, c.email\nFROM customers c\nLEFT JOIN orders o ON c.id = o.customer_id\nWHERE o.id IS NULL;`,
    },
    {
      label: '📊 CTE & Subquery (WITH Clause)',
      sql: `-- Common Table Expression (CTE)\nWITH HighValueOrders AS (\n  SELECT customer_id, SUM(total_amount) AS total_spent\n  FROM orders\n  GROUP BY customer_id\n)\nSELECT c.name, h.total_spent\nFROM HighValueOrders h\nJOIN customers c ON h.customer_id = c.id\nORDER BY h.total_spent DESC;`,
    },
    {
      label: '📝 INSERT INTO Record',
      sql: `-- INSERT INTO Statement\nINSERT INTO customers (name, email, country)\nVALUES ('Alice Walker', 'alice@example.com', 'United States');`,
    },
  ];

  const handleSelectTemplate = (templateSql: string) => {
    if (onInsertTemplate) {
      onInsertTemplate(templateSql);
    }
    setTemplateMenuOpen(false);
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '3px 4px',
        background: '#c0c0c0',
        borderBottom: '1px solid #808080',
        gap: '6px',
        flexWrap: 'wrap',
        position: 'relative',
        zIndex: 10,
      }}
    >
      {/* Left Action Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
        <button
          id="btn-run"
          className="win95-button"
          style={{
            fontWeight: 'bold',
            color: hasSelection ? '#800080' : '#006600',
            background: hasSelection ? '#f0e6f6' : undefined,
          }}
          onClick={onRun}
          disabled={isLoading}
          title={hasSelection ? 'Execute Selected Query (F5 or Ctrl+Enter)' : 'Execute All Queries (F5 or Ctrl+Enter)'}
        >
          <span>▶</span>
          <span>{hasSelection ? 'Run Selection (F5)' : 'Run (F5)'}</span>
        </button>

        <button
          id="btn-format"
          className="win95-button"
          onClick={onFormatSql}
          disabled={isLoading}
          title="Format & Beautify SQL Query"
        >
          <span>🧹</span>
          <span>Format SQL</span>
        </button>

        {/* Template Snippets Menu */}
        <div style={{ position: 'relative' }}>
          <button
            id="btn-templates"
            className="win95-button"
            onClick={() => setTemplateMenuOpen((prev) => !prev)}
            title="Insert Prebuilt SQL Query Templates"
          >
            <span>📜</span>
            <span>Templates ▾</span>
          </button>

          {templateMenuOpen && (
            <div
              className="win95-window"
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                marginTop: '2px',
                width: '240px',
                background: '#c0c0c0',
                boxShadow: '2px 2px 8px rgba(0,0,0,0.3)',
                padding: '2px',
                zIndex: 99999,
              }}
            >
              {templates.map((tpl, i) => (
                <div
                  key={i}
                  className="win95-menu-item"
                  onClick={() => handleSelectTemplate(tpl.sql)}
                  style={{
                    padding: '4px 8px',
                    fontSize: '11px',
                    cursor: 'pointer',
                    borderRadius: '0',
                  }}
                >
                  {tpl.label}
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          id="btn-history"
          className="win95-button"
          onClick={onToggleHistory}
          title="View Query History Log"
        >
          <span>🕒</span>
          <span>History ({historyCount})</span>
        </button>

        <button
          id="btn-reset"
          className="win95-button"
          onClick={onReset}
          disabled={isLoading}
          title="Clear database and reset catalog"
        >
          <span>🔄</span>
          <span>Reset Schema</span>
        </button>

        {/* Dialect Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '4px' }}>
          <label htmlFor="dialect-select" style={{ fontSize: '11px', fontWeight: 'bold' }}>
            Dialect:
          </label>
          <select
            id="dialect-select"
            className="win95-sunken"
            value={dialect}
            onChange={(e) => onDialectChange(e.target.value as Dialect)}
            style={{ padding: '2px 4px', fontSize: '11px', height: '22px' }}
          >
            <option value="MySQL">MySQL</option>
            <option value="PostgreSQL">PostgreSQL</option>
            <option value="SQLite">SQLite</option>
            <option value="SSMS">SSMS (Transact-SQL)</option>
          </select>
        </div>
      </div>

      {/* Right Helper Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <button
          id="btn-help"
          className="win95-button"
          onClick={onOpenHelp}
          title="Open SQL Query Tutorial & Guide"
        >
          <span>📖</span>
          <span>Help / Tutorial</span>
        </button>

        <button
          id="btn-tour"
          className="win95-button"
          onClick={onStartTour}
          title="Start Guided Tour"
        >
          <span>💡</span>
          <span>Tour</span>
        </button>

        <button
          id="btn-options"
          className="win95-button"
          onClick={onOpenSettings}
          title="Options & Preferences"
        >
          <span>⚙️</span>
          <span>Options</span>
        </button>
      </div>
    </div>
  );
};
