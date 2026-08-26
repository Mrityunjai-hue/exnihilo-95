/**
 * SchemaTree.tsx — Enhanced Windows 95 Explorer-style Schema TreeView
 * Includes table search filtering, DDL generator modal, table quick actions,
 * and column constraint/foreign key indicators.
 */

import React, { useState } from 'react';
import { SessionCatalog, CatalogEntry } from '../../engine/catalog';

interface SchemaTreeProps {
  catalog:        SessionCatalog;
  onSelectTable:  (tableName: string, querySql?: string) => void;
  onRefresh:      () => void;
}

export const SchemaTree: React.FC<SchemaTreeProps> = ({
  catalog,
  onSelectTable,
  onRefresh,
}) => {
  const [expandedTables, setExpandedTables] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [viewDdlModal, setViewDdlModal] = useState<{
    tableName: string;
    ddlSql: string;
  } | null>(null);

  const toggleTable = (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedTables((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const tables: CatalogEntry[] = catalog.getAll();

  // Filter tables and columns by search query
  const filteredTables = tables.filter((entry) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    if (entry.tableName.toLowerCase().includes(q)) return true;
    return entry.schema.columns.some((c) => c.name.toLowerCase().includes(q));
  });

  // Generate DDL for a table
  const handleGenerateDDL = (entry: CatalogEntry, e: React.MouseEvent) => {
    e.stopPropagation();
    const cols = entry.schema.columns
      .map((col) => {
        let typeStr = col.logicalType.toUpperCase();
        if (typeStr === 'STRING') typeStr = 'VARCHAR(255)';
        if (typeStr === 'NUMBER') typeStr = 'INT';
        if (typeStr === 'BOOLEAN') typeStr = 'BOOLEAN';
        if (typeStr === 'DATE') typeStr = 'DATE';

        const isPk = col.name.toLowerCase() === 'id';
        return `  ${col.name.padEnd(20)} ${typeStr}${isPk ? ' PRIMARY KEY' : ''}`;
      })
      .join(',\n');

    const ddl = `CREATE TABLE ${entry.tableName} (\n${cols}\n);`;
    setViewDdlModal({ tableName: entry.tableName, ddlSql: ddl });
  };

  return (
    <div
      className="win95-inset"
      style={{
        width: '100%',
        height: '100%',
        background: 'var(--w95-sunken-bg, #ffffff)',
        color: 'var(--w95-sunken-text, #000000)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Tree Header */}
      <div
        style={{
          background: 'var(--w95-gray, #c0c0c0)',
          color: 'var(--w95-text-color, #000000)',
          padding: '4px 6px',
          borderBottom: '1px solid var(--w95-dark-gray, #808080)',
          fontWeight: 'bold',
          fontSize: '11px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span>📂 DATABASE NAVIGATOR</span>
        <button
          className="win95-button"
          style={{ padding: '0 4px', fontSize: '9px', minHeight: '18px' }}
          onClick={onRefresh}
          title="Refresh Schema Catalog"
        >
          🔄
        </button>
      </div>

      {/* Table Search Bar */}
      <div style={{ padding: '3px 4px', background: 'var(--w95-light-gray, #e0e0e0)', borderBottom: '1px solid var(--w95-gray, #c0c0c0)' }}>
        <input
          type="text"
          className="win95-sunken"
          placeholder="🔍 Filter tables / columns..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: '100%', padding: '1px 4px', fontSize: '10px', boxSizing: 'border-box', background: 'var(--w95-sunken-bg, #ffffff)', color: 'var(--w95-sunken-text, #000000)' }}
        />
      </div>

      {/* Tree Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '4px' }}>
        {filteredTables.length === 0 ? (
          <div style={{ padding: '12px 6px', color: 'var(--w95-dark-gray, #888888)', fontSize: '11px', textAlign: 'center' }}>
            {searchQuery ? 'No tables match search query.' : 'No tables materialized yet.'}
          </div>
        ) : (
          filteredTables.map((entry) => {
            const isExpanded = Boolean(expandedTables[entry.tableName]) || Boolean(searchQuery.trim());
            return (
              <div key={entry.tableName} style={{ marginBottom: '4px' }}>
                {/* Table Row */}
                <div
                  className="win95-tree-item"
                  onClick={() => onSelectTable(entry.tableName, `SELECT * FROM ${entry.tableName};`)}
                  title="Click to query this table"
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '2px 4px' }}
                >
                  <span
                    onClick={(e) => toggleTable(entry.tableName, e)}
                    style={{
                      cursor: 'pointer',
                      fontSize: '10px',
                      width: '12px',
                      display: 'inline-block',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      color: 'var(--w95-sunken-text, #000080)',
                    }}
                  >
                    {isExpanded ? '[-] ' : '[+] '}
                  </span>
                  <span>🗃️</span>
                  <strong style={{ flex: 1, color: 'var(--w95-sunken-text, #000080)' }}>{entry.tableName}</strong>
                  <span
                    style={{
                      fontSize: '9px',
                      background: 'var(--w95-gray, #e0e0e0)',
                      color: 'var(--w95-text-color, #333333)',
                      padding: '1px 4px',
                      borderRadius: '2px',
                      border: '1px solid var(--w95-dark-gray, #808080)',
                    }}
                  >
                    {entry.rowCount} rows
                  </span>
                  <button
                    className="win95-button"
                    onClick={(e) => handleGenerateDDL(entry, e)}
                    title="View Table DDL Schema"
                    style={{ fontSize: '9px', padding: '0 4px', minHeight: '16px', marginLeft: '2px' }}
                  >
                    DDL
                  </button>
                </div>

                {/* Expanded Columns Sub-Tree */}
                {isExpanded && (
                  <div style={{ marginLeft: '16px', borderLeft: '1px dotted var(--w95-dark-gray, #808080)', paddingLeft: '6px', marginTop: '2px' }}>
                    <div style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--w95-dark-gray, #555555)', margin: '2px 0' }}>
                      📂 Columns ({entry.schema.columns.length})
                    </div>
                    {entry.schema.columns.map((col) => {
                      const isPk = col.name.toLowerCase() === 'id';
                      const isFk = col.name.toLowerCase().endsWith('_id') && !isPk;
                      return (
                        <div
                          key={col.name}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectTable(entry.tableName, `SELECT ${col.name} FROM ${entry.tableName};`);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '1px 4px',
                            fontSize: '10px',
                            cursor: 'pointer',
                          }}
                          title={`Click to SELECT ${col.name}`}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span>{isPk ? '🔑' : isFk ? '🔗' : '📄'}</span>
                            <span style={{ fontWeight: isPk || isFk ? 'bold' : 'normal', color: 'var(--w95-sunken-text, #000000)' }}>{col.name}</span>
                          </div>
                          <span style={{ fontSize: '9px', color: 'var(--w95-dark-gray, #666666)', fontStyle: 'italic' }}>
                            {col.logicalType.toLowerCase()}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* DDL Modal */}
      {viewDdlModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999999,
          }}
        >
          <div className="win95-window" style={{ width: '440px', boxShadow: '4px 4px 10px rgba(0,0,0,0.5)' }}>
            <div className="win95-titlebar">
              <div className="win95-titlebar-text">
                <span>📄</span>
                <span>Table DDL — {viewDdlModal.tableName}</span>
              </div>
              <div className="win95-titlebar-controls">
                <button className="win95-btn-titlebar" onClick={() => setViewDdlModal(null)}>
                  ✕
                </button>
              </div>
            </div>

            <div style={{ padding: '12px' }}>
              <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '6px' }}>
                DDL Schema Definition:
              </div>

              <textarea
                readOnly
                className="win95-sunken"
                value={viewDdlModal.ddlSql}
                style={{
                  width: '100%',
                  height: '140px',
                  fontFamily: 'monospace',
                  fontSize: '11px',
                  padding: '6px',
                  boxSizing: 'border-box',
                  background: '#ffffff',
                }}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '10px' }}>
                <button
                  className="win95-button"
                  onClick={() => {
                    navigator.clipboard.writeText(viewDdlModal.ddlSql);
                  }}
                >
                  📋 Copy DDL
                </button>
                <button
                  className="win95-button"
                  style={{ fontWeight: 'bold' }}
                  onClick={() => setViewDdlModal(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
