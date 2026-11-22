/**
 * PocketSQLShell.tsx — Compact Mobile "Pocket SQL" Studio (< 900px)
 * Provides a responsive, touch-friendly 3-tab IDE layout (Query, Results, Schema)
 * styled in authentic Windows 95 aesthetics for mobile and small-screen devices.
 */

'use client';

import React, { useState } from 'react';
import type { Dialect } from '../../engine/parser';
import type { ExecutionSuccess } from '../../engine/executor';
import type { SessionCatalog } from '../../engine/catalog';
import { QueryEditor } from '../IDE/QueryEditor';
import { SnapshotsDialog } from '../IDE/SnapshotsDialog';
import { CopilotDialog } from '../IDE/CopilotDialog';

interface PocketSQLShellProps {
  dialect: Dialect;
  onDialectChange: (dialect: Dialect) => void;
  queryText: string;
  onQueryChange: (query: string) => void;
  onRun: () => void;
  onCancelQuery?: () => void;
  isLoading: boolean;
  result: ExecutionSuccess | null;
  catalog: SessionCatalog | any;
  onSwitchToDesktop: () => void;
}

export const PocketSQLShell: React.FC<PocketSQLShellProps> = ({
  dialect,
  onDialectChange,
  queryText,
  onQueryChange,
  onRun,
  onCancelQuery,
  isLoading,
  result,
  catalog,
  onSwitchToDesktop,
}) => {
  const [activeTab, setActiveTab] = useState<'query' | 'results' | 'schema'>('query');
  const [isSnapshotsOpen, setIsSnapshotsOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);

  const catalogTables = catalog.getAll ? catalog.getAll() : [];
  const rowCount = result?.rowCount ?? 0;

  const handleInsertTableQuery = (tableName: string) => {
    onQueryChange(`SELECT * FROM "${tableName}" LIMIT 20;`);
    setActiveTab('query');
  };

  const handleQuickInsert = (kw: string) => {
    const trimmed = queryText.trimEnd();
    const separator = trimmed.length > 0 ? ' ' : '';
    onQueryChange(`${trimmed}${separator}${kw} `);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        height: '100dvh',
        maxHeight: '100dvh',
        backgroundColor: '#008080',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        overflow: 'hidden',
        fontFamily: "'Segoe UI', Tahoma, sans-serif",
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {/* Top Titlebar */}
      <div
        className="win95-titlebar"
        style={{
          padding: '4px 8px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        <div className="win95-titlebar-text" style={{ fontSize: '12px' }}>
          <span>📱</span>
          <span>ExNihilo 95: Pocket SQL</span>
        </div>
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <button
            type="button"
            className="win95-button"
            onClick={() => setIsSnapshotsOpen(true)}
            style={{ fontSize: '10px', padding: '1px 6px' }}
            title="Time-Travel Snapshots"
          >
            💾 Snapshots
          </button>
          <button
            type="button"
            className="win95-button"
            onClick={onSwitchToDesktop}
            style={{ fontSize: '10px', padding: '1px 6px' }}
            title="Switch to full Windows 95 Desktop Mode"
          >
            🖥️ Desktop
          </button>
        </div>
      </div>

      {/* Action Bar */}
      <div
        className="win95-window"
        style={{
          margin: '2px',
          padding: '4px 6px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '6px',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {isLoading ? (
            <button
              type="button"
              className="win95-button"
              onClick={onCancelQuery}
              style={{
                fontSize: '11px',
                fontWeight: 'bold',
                color: '#ffffff',
                backgroundColor: '#b91c1c',
                padding: '3px 10px',
              }}
            >
              ■ Stop
            </button>
          ) : (
            <button
              type="button"
              className="win95-button"
              onClick={() => {
                onRun();
                setActiveTab('results');
              }}
              style={{
                fontSize: '11px',
                fontWeight: 'bold',
                color: '#006600',
                padding: '3px 10px',
              }}
            >
              ▶ Run SQL
            </button>
          )}

          <select
            className="win95-sunken"
            value={dialect}
            onChange={(e) => onDialectChange(e.target.value as Dialect)}
            style={{ fontSize: '11px', padding: '2px 4px' }}
          >
            <option value="SQLite">SQLite</option>
            <option value="MySQL">MySQL</option>
            <option value="PostgreSQL">PostgreSQL</option>
            <option value="SSMS">SSMS</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            className="win95-button"
            onClick={() => setIsCopilotOpen(true)}
            style={{ fontSize: '10px', padding: '2px 6px', fontWeight: 'bold' }}
            title="Ask Gemini SQL Copilot"
          >
            ✨ Copilot
          </button>
          <div style={{ fontSize: '10px', opacity: 0.8 }}>
            {result ? `${rowCount} rows (${result.executionTimeMs.toFixed(0)}ms)` : 'WASM Ready'}
          </div>
        </div>
      </div>

      {/* 3-Tab Navigator */}
      <div className="win95-tabs" style={{ padding: '0 4px', margin: 0, flexShrink: 0 }}>
        <div
          className={`win95-tab ${activeTab === 'query' ? 'active' : ''}`}
          onClick={() => setActiveTab('query')}
          style={{ fontSize: '11px', padding: '3px 10px' }}
        >
          ✍️ Query
        </div>
        <div
          className={`win95-tab ${activeTab === 'results' ? 'active' : ''}`}
          onClick={() => setActiveTab('results')}
          style={{ fontSize: '11px', padding: '3px 10px' }}
        >
          📊 Results {result ? `(${rowCount})` : ''}
        </div>
        <div
          className={`win95-tab ${activeTab === 'schema' ? 'active' : ''}`}
          onClick={() => setActiveTab('schema')}
          style={{ fontSize: '11px', padding: '3px 10px' }}
        >
          🗄️ Tables ({catalogTables.length})
        </div>
      </div>

      {/* Main Tab Viewport */}
      <div
        className="win95-inset"
        style={{
          flex: 1,
          margin: '0 2px 2px 2px',
          backgroundColor: '#ffffff',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
      >
        {/* Tab 1: Query Editor */}
        {activeTab === 'query' && (
          <div style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Quick SQL Keyword Keyboard Bar */}
            <div
              className="win95-window"
              style={{
                display: 'flex',
                gap: '4px',
                overflowX: 'auto',
                padding: '3px 4px',
                background: '#d4d0c8',
                borderBottom: '1px solid #808080',
                flexShrink: 0,
                whiteSpace: 'nowrap',
              }}
            >
              {['SELECT', 'FROM', 'WHERE', 'JOIN', 'ON', 'GROUP BY', 'ORDER BY', 'LIMIT 10', '*'].map((kw) => (
                <button
                  key={kw}
                  type="button"
                  className="win95-button"
                  onClick={() => handleQuickInsert(kw)}
                  style={{ fontSize: '10px', padding: '1px 6px', fontWeight: 'bold' }}
                >
                  {kw}
                </button>
              ))}
            </div>
            <div style={{ flex: 1, height: '100%', overflow: 'hidden' }}>
              <QueryEditor
                value={queryText}
                onChange={onQueryChange}
                dialect={dialect}
                wrapLines={true}
                onRun={() => {
                  onRun();
                  setActiveTab('results');
                }}
              />
            </div>
          </div>
        )}

        {/* Tab 2: Results Grid */}
        {activeTab === 'results' && (
          <div style={{ flex: 1, height: '100%', overflow: 'auto', padding: '4px' }}>
            {!result || !result.rows || result.rows.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 16px', color: '#666666' }}>
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>📋</div>
                <div style={{ fontSize: '12px', fontWeight: 'bold' }}>No query results to display.</div>
                <div style={{ fontSize: '11px', marginTop: '4px' }}>
                  Write a query in the Query tab and tap <strong>▶ Run SQL</strong>.
                </div>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', whiteSpace: 'nowrap' }}>
                <thead>
                  <tr style={{ background: '#c0c0c0', borderBottom: '1px solid #808080' }}>
                    <th style={{ padding: '3px 6px', textAlign: 'center', color: '#555' }}>#</th>
                    {result.columns.map((col, idx) => (
                      <th key={idx} style={{ padding: '3px 8px', textAlign: 'left', fontWeight: 'bold' }}>
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((row, rIdx) => (
                    <tr
                      key={rIdx}
                      style={{
                        background: rIdx % 2 === 1 ? '#f9f9f9' : '#ffffff',
                        borderBottom: '1px solid #eee',
                      }}
                    >
                      <td style={{ padding: '2px 6px', textAlign: 'center', color: '#888', borderRight: '1px solid #eee' }}>
                        {rIdx + 1}
                      </td>
                      {result.columns.map((_, cIdx) => (
                        <td key={cIdx} style={{ padding: '2px 8px', borderRight: '1px solid #eee' }}>
                          {row[cIdx] !== null && row[cIdx] !== undefined ? (
                            String(row[cIdx])
                          ) : (
                            <em style={{ color: '#aaa' }}>NULL</em>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab 3: Schema Explorer */}
        {activeTab === 'schema' && (
          <div style={{ flex: 1, height: '100%', overflowY: 'auto', padding: '8px' }}>
            <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '8px', color: '#000080' }}>
              In-Memory Catalog ({catalogTables.length} Tables Registered)
            </div>
            {catalogTables.length === 0 ? (
              <div style={{ fontSize: '11px', color: '#666' }}>
                No tables materialized yet. Running any SQL query will synthesize tables automatically.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {catalogTables.map((entry: any) => (
                  <div
                    key={entry.tableName}
                    className="win95-window"
                    style={{ padding: '6px 8px' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '12px' }}>📊 {entry.tableName}</strong>
                      <button
                        type="button"
                        className="win95-button"
                        style={{ fontSize: '10px', padding: '1px 6px' }}
                        onClick={() => handleInsertTableQuery(entry.tableName)}
                      >
                        SELECT
                      </button>
                    </div>
                    <div style={{ fontSize: '10px', color: '#555', marginTop: '2px' }}>
                      {entry.rowCount} rows • Columns: {(entry.schema?.columns || []).map((c: any) => c.name).join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Status Bar */}
      <div
        className="win95-window"
        style={{
          padding: '2px 8px',
          fontSize: '10px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        <span>ExNihilo 95 Pocket Edition</span>
        <span>Offline SQLite Kernel</span>
      </div>

      {/* Time-Travel Snapshots Modal */}
      <SnapshotsDialog
        isOpen={isSnapshotsOpen}
        onClose={() => setIsSnapshotsOpen(false)}
      />

      {/* Gemini SQL Copilot Modal */}
      <CopilotDialog
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        dialect={dialect}
        schemaContext={
          catalog?.getAll
            ? catalog.getAll().map((t: any) => {
                const cols = t.schema?.columns || t.columns || [];
                return `${t.tableName} (${cols.map((c: any) => `${c.name} ${c.logicalType || c.type || ''}`).join(', ')})`;
              }).join('\n')
            : ''
        }
        onInsertSql={(sql) => {
          onQueryChange(sql);
          setActiveTab('query');
        }}
      />
    </div>
  );
};
