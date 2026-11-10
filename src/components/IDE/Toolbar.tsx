/**
 * Toolbar.tsx — Clean, Uncluttered Studio Action Toolbar
 * Includes primary execution, inline synthetic row generator, dialect picker,
 * ERD, templates, and a sleek consolidated 'More' dropdown menu.
 */

import React, { useState, useRef, useEffect } from 'react';
import { Dialect } from '../../engine/parser';
import { useTheme } from '../../hooks/useTheme';

interface ToolbarProps {
  dialect:              Dialect;
  onDialectChange:      (dialect: Dialect) => void;
  rowsPerTable?:        number;
  onRowsPerTableChange?: (count: number) => void;
  onRun:                () => void;
  onReset:              () => void;
  onFormatSql?:         () => void;
  onOpenExplainPlan?:   () => void;
  onInsertTemplate?:    (templateSql: string) => void;
  onToggleHistory?:     () => void;
  onOpenWorkspaces?:    () => void;
  onOpenERD?:           () => void;
  onOpenHelp:           () => void;
  onOpenSettings:       () => void;
  onStartTour:          () => void;
  onOpenShare?:         () => void;
  crtEnabled?:          boolean;
  onToggleCrt?:         () => void;
  isLoading:            boolean;
  hasSelection?:        boolean;
  historyCount?:        number;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  dialect,
  onDialectChange,
  rowsPerTable = 20,
  onRowsPerTableChange,
  onRun,
  onReset,
  onFormatSql,
  onOpenExplainPlan,
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
  const { activeTheme } = useTheme();
  const isDark = activeTheme === 'macos-glass' || activeTheme === 'win95-noir';
  const isMac = activeTheme === 'macos-glass';
  const [templateMenuOpen, setTemplateMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  const moreMenuRef = useRef<HTMLDivElement>(null);
  const templateMenuRef = useRef<HTMLDivElement>(null);

  // Auto-close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setMoreMenuOpen(false);
      }
      if (templateMenuRef.current && !templateMenuRef.current.contains(e.target as Node)) {
        setTemplateMenuOpen(false);
      }
    };
    window.addEventListener('mousedown', handleOutsideClick);
    return () => window.removeEventListener('mousedown', handleOutsideClick);
  }, []);

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
      className="win95-toolbar"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: isMac ? '4px 10px' : '3px 6px',
        minHeight: '32px',
        background: 'var(--w95-gray, #c0c0c0)',
        color: 'var(--w95-text-color, #000000)',
        borderBottom: '1px solid var(--w95-dark-gray, #808080)',
        gap: '8px',
        boxSizing: 'border-box',
        position: 'relative',
        zIndex: 10,
        overflowX: 'auto',
      }}
    >
      {/* Primary Execution & Core Settings Group */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
        {/* Primary Run Button */}
        <button
          id="btn-run"
          className="win95-button"
          style={{
            fontWeight: 'bold',
            color: hasSelection
              ? (isDark ? '#c084fc' : '#800080')
              : (isDark ? '#4ade80' : '#006600'),
            padding: isMac ? '3px 12px' : '2px 10px',
            fontSize: '11px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            cursor: isLoading ? 'wait' : 'pointer',
          }}
          onClick={onRun}
          disabled={isLoading}
          title={hasSelection ? 'Execute Selected Query (F5 or Ctrl+Enter)' : 'Execute All Queries (F5 or Ctrl+Enter)'}
        >
          <span>{isLoading ? '⏳' : '▶'}</span>
          <span>{isLoading ? 'Running...' : hasSelection ? 'Run Selection (F5)' : 'Run (F5)'}</span>
        </button>

        {/* Format SQL Button */}
        <button
          id="btn-format"
          className="win95-button"
          onClick={onFormatSql}
          disabled={isLoading}
          title="Format & Beautify SQL Query (Ctrl+Shift+F)"
          style={{ padding: '2px 8px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
        >
          <span>⚡</span>
          <span>Format</span>
        </button>

        {/* Explain Plan Button */}
        {onOpenExplainPlan && (
          <button
            id="btn-explain"
            className="win95-button"
            onClick={onOpenExplainPlan}
            disabled={isLoading}
            title="View Query Execution Plan & Cost Tree (Ctrl+E)"
            style={{ padding: '2px 8px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
          >
            <span>🔍</span>
            <span>Explain</span>
          </button>
        )}

        <div className="win95-divider-v" style={{ margin: '0 2px' }} />

        {/* Data Points / Synthetic Row Generator Control */}
        {onRowsPerTableChange && (
          <div
            className="win95-rows-control"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            title="Set how many synthetic rows our domain inference engine generates per new table"
          >
            <label
              htmlFor="tb-rows-select"
              style={{
                fontSize: '11px',
                fontWeight: 'bold',
                whiteSpace: 'nowrap',
                color: 'var(--w95-text-color, inherit)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                cursor: 'pointer',
              }}
            >
              <span>🎲</span>
              <span>Rows:</span>
            </label>
            <select
              id="tb-rows-select"
              className="win95-sunken"
              value={rowsPerTable}
              onChange={(e) => onRowsPerTableChange(Number(e.target.value))}
              title="Configures synthetic row count per table generated by ExNihilo engine"
              style={{
                fontSize: '11px',
                padding: '1px 5px',
                height: '22px',
                background: 'var(--w95-sunken-bg, #ffffff)',
                color: 'var(--w95-sunken-text, #000000)',
                cursor: 'pointer',
              }}
            >
              <option value={5}>5 rows (Fast)</option>
              <option value={10}>10 rows</option>
              <option value={20}>20 rows (Default)</option>
              <option value={50}>50 rows</option>
              <option value={100}>100 rows</option>
              <option value={250}>250 rows</option>
              <option value={500}>500 rows</option>
            </select>
          </div>
        )}

        {/* Dialect Selector */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <label
            htmlFor="dialect-select"
            style={{
              fontSize: '11px',
              fontWeight: 'bold',
              color: 'var(--w95-text-color, #000000)',
              whiteSpace: 'nowrap',
            }}
          >
            Dialect:
          </label>
          <select
            id="dialect-select"
            className="win95-sunken toolbar-dialect-select"
            value={dialect}
            onChange={(e) => onDialectChange(e.target.value as Dialect)}
            style={{
              fontSize: '11px',
              padding: '1px 5px',
              height: '22px',
              background: 'var(--w95-sunken-bg, #ffffff)',
              color: 'var(--w95-sunken-text, #000000)',
              cursor: 'pointer',
            }}
          >
            <option value="MySQL">🐬 MySQL</option>
            <option value="PostgreSQL">🐘 PostgreSQL</option>
            <option value="SQLite">🪶 SQLite</option>
            <option value="SSMS">🏢 SSMS (T-SQL)</option>
          </select>
        </div>
      </div>

      {/* Secondary Clean Tools & More Menu Group */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
        {/* Templates Dropdown */}
        <div ref={templateMenuRef} style={{ position: 'relative' }}>
          <button
            id="btn-templates"
            className="win95-button"
            onClick={() => setTemplateMenuOpen((prev) => !prev)}
            title="Insert Prebuilt SQL Query Templates"
            style={{ padding: '2px 8px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
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
                right: 0,
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

        {/* Visual ERD Button */}
        {onOpenERD && (
          <button
            id="btn-erd"
            className="win95-button"
            onClick={onOpenERD}
            title="Open Interactive Entity Relationship Diagram (ERD) & Schema Visualizer"
            style={{ padding: '2px 8px', fontSize: '11px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
          >
            <span>🌐</span>
            <span>ERD</span>
          </button>
        )}

        {/* Consolidated "More ⋯" Dropdown (History, Share, Settings) */}
        <div ref={moreMenuRef} style={{ position: 'relative' }}>
          <button
            id="btn-more-tools"
            className="win95-button"
            onClick={() => setMoreMenuOpen((prev) => !prev)}
            title="Additional IDE Tools & Preferences"
            style={{ padding: '2px 8px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '2px' }}
          >
            <span>⋯ More ▾</span>
          </button>

          {moreMenuOpen && (
            <div
              className="win95-window"
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '2px',
                width: '210px',
                background: 'var(--w95-gray, #c0c0c0)',
                boxShadow: '2px 2px 8px rgba(0,0,0,0.3)',
                padding: '2px',
                zIndex: 99999,
              }}
            >
              {onToggleHistory && (
                <div
                  className="win95-menu-item"
                  onClick={() => { onToggleHistory(); setMoreMenuOpen(false); }}
                  style={{ padding: '4px 8px', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <span>🕒</span>
                  <span>Execution History ({historyCount})</span>
                </div>
              )}

              {onOpenShare && (
                <div
                  className="win95-menu-item"
                  onClick={() => { onOpenShare(); setMoreMenuOpen(false); }}
                  style={{ padding: '4px 8px', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <span>🔗</span>
                  <span>Share Query Playground URL</span>
                </div>
              )}

              <div style={{ height: '1px', background: 'var(--w95-dark-gray, #808080)', margin: '2px 0' }} />

              {onStartTour && (
                <div
                  className="win95-menu-item"
                  onClick={() => { onStartTour(); setMoreMenuOpen(false); }}
                  style={{ padding: '4px 8px', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <span>💡</span>
                  <span>Start Feature Guided Tour</span>
                </div>
              )}

              {onOpenSettings && (
                <div
                  className="win95-menu-item"
                  onClick={() => { onOpenSettings(); setMoreMenuOpen(false); }}
                  style={{ padding: '4px 8px', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <span>⚙️</span>
                  <span>Options & Control Panel</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
