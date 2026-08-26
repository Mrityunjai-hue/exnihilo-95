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
  onOpenWorkspaces?: () => void;
  onOpenERD?:        () => void;
  onOpenHelp:        () => void;
  onOpenSettings:    () => void;
  onStartTour:       () => void;
  onOpenShare?:      () => void;
  crtEnabled?:       boolean;
  onToggleCrt?:      () => void;
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
  onOpenWorkspaces,
  onOpenERD,
  onOpenHelp,
  onOpenSettings,
  onStartTour,
  onOpenShare,
  crtEnabled,
  onToggleCrt,
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
        padding: '2px 6px',
        height: '28px',
        background: 'var(--w95-gray, #c0c0c0)',
        color: 'var(--w95-text-color, #000000)',
        borderBottom: '1px solid var(--w95-dark-gray, #808080)',
        gap: '6px',
        boxSizing: 'border-box',
        position: 'relative',
        zIndex: 10,
      }}
    >
      {/* Left Core Execution Group */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {/* Primary Run Button */}
        <button
          id="btn-run"
          className="win95-button"
          style={{
            fontWeight: 'bold',
            color: hasSelection ? '#800080' : '#006600',
            background: hasSelection ? '#f0e6f6' : undefined,
            padding: '2px 10px',
            fontSize: '11px',
          }}
          onClick={onRun}
          disabled={isLoading}
          title={hasSelection ? 'Execute Selected Query (F5 or Ctrl+Enter)' : 'Execute All Queries (F5 or Ctrl+Enter)'}
        >
          <span>▶</span>
          <span>{hasSelection ? 'Run Selection (F5)' : 'Run (F5)'}</span>
        </button>

        {/* Format SQL Button */}
        <button
          id="btn-format"
          className="win95-button"
          onClick={onFormatSql}
          disabled={isLoading}
          title="Format & Beautify SQL Query (Ctrl+Shift+F)"
          style={{ padding: '2px 8px', fontSize: '11px' }}
        >
          <span>⚡</span>
          <span>Format</span>
        </button>

        <div className="win95-divider-v" />

        {/* Templates Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            id="btn-templates"
            className="win95-button"
            onClick={() => setTemplateMenuOpen((prev) => !prev)}
            title="Insert Prebuilt SQL Query Templates"
            style={{ padding: '2px 8px', fontSize: '11px' }}
          >
            <span>📋</span>
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
                background: 'var(--w95-gray, #c0c0c0)',
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

        {/* Query History Drawer Button */}
        <button
          id="btn-history"
          className="win95-button"
          onClick={onToggleHistory}
          title="View Query Execution History Log (Ctrl+H)"
          style={{ padding: '2px 8px', fontSize: '11px' }}
        >
          <span>🕒</span>
          <span>History ({historyCount})</span>
        </button>

        {onOpenShare && (
          <button
            id="btn-share"
            className="win95-button"
            onClick={onOpenShare}
            title="Share SQL Query & Playground URL"
            style={{ padding: '2px 8px', fontSize: '11px', fontWeight: 'bold' }}
          >
            <span>🔗</span>
            <span>Share</span>
          </button>
        )}
      </div>

      {/* Right Dialect & Engine Selector Group */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <label htmlFor="dialect-select" style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--w95-text-color, #000000)' }}>
          Dialect:
        </label>
        <select
          id="dialect-select"
          className="win95-sunken"
          value={dialect}
          onChange={(e) => onDialectChange(e.target.value as Dialect)}
          style={{ padding: '1px 6px', fontSize: '11px', height: '20px', background: 'var(--w95-sunken-bg, #ffffff)', color: 'var(--w95-sunken-text, #000000)' }}
        >
          <option value="MySQL" style={{ background: 'var(--w95-sunken-bg, #ffffff)', color: 'var(--w95-sunken-text, #000000)' }}>MySQL</option>
          <option value="PostgreSQL" style={{ background: 'var(--w95-sunken-bg, #ffffff)', color: 'var(--w95-sunken-text, #000000)' }}>PostgreSQL</option>
          <option value="SQLite" style={{ background: 'var(--w95-sunken-bg, #ffffff)', color: 'var(--w95-sunken-text, #000000)' }}>SQLite</option>
          <option value="SSMS" style={{ background: 'var(--w95-sunken-bg, #ffffff)', color: 'var(--w95-sunken-text, #000000)' }}>SSMS (Transact-SQL)</option>
        </select>
      </div>
    </div>
  );
};
