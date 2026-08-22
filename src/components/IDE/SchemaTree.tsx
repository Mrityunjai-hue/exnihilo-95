/**
 * SchemaTree.tsx — Windows 95 Explorer-style Schema TreeView
 */

import React, { useState } from 'react';
import { SessionCatalog, CatalogEntry } from '../../engine/catalog';

interface SchemaTreeProps {
  catalog:        SessionCatalog;
  onSelectTable:  (tableName: string) => void;
  onRefresh:      () => void;
}

export const SchemaTree: React.FC<SchemaTreeProps> = ({
  catalog,
  onSelectTable,
  onRefresh,
}) => {
  const [expandedTables, setExpandedTables] = useState<Record<string, boolean>>({});

  const toggleTable = (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedTables((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const tables: CatalogEntry[] = catalog.getAll();

  return (
    <div
      className="win95-inset"
      style={{
        width: '100%',
        height: '100%',
        background: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Tree Header */}
      <div
        style={{
          background: '#c0c0c0',
          padding: '4px 6px',
          borderBottom: '1px solid #808080',
          fontWeight: 'bold',
          fontSize: '11px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span>📂 Tables ({tables.length})</span>
        <button
          className="win95-button"
          style={{ padding: '0 4px', fontSize: '9px', minHeight: '18px' }}
          onClick={onRefresh}
          title="Refresh Schema"
        >
          🔄
        </button>
      </div>

      {/* Tree Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '4px' }}>
        {tables.length === 0 ? (
          <div style={{ padding: '12px 6px', color: '#888888', fontSize: '11px', textAlign: 'center' }}>
            No tables materialized yet. Execute a query to auto-generate tables!
          </div>
        ) : (
          tables.map((entry) => {
            const isExpanded = Boolean(expandedTables[entry.tableName]);
            return (
              <div key={entry.tableName} style={{ marginBottom: '2px' }}>
                {/* Table Row */}
                <div
                  className="win95-tree-item"
                  onClick={() => onSelectTable(entry.tableName)}
                  title="Click to query this table"
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
                      color: '#000080',
                    }}
                  >
                    {isExpanded ? '[-] ' : '[+] '}
                  </span>
                  <span>🗃️</span>
                  <strong style={{ flex: 1 }}>{entry.tableName}</strong>
                  <span style={{ fontSize: '10px', color: '#666' }}>({entry.rowCount}r)</span>
                </div>

                {/* Expanded Columns */}
                {isExpanded && (
                  <div style={{ paddingLeft: '24px', borderLeft: '1px dotted #a0a0a0', marginLeft: '6px' }}>
                    {entry.schema.columns.map((col) => (
                      <div
                        key={col.name}
                        style={{
                          fontSize: '10px',
                          padding: '1px 0',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          color: '#333333',
                        }}
                      >
                        <span>{col.name === 'id' ? '🔑' : '🔹'}</span>
                        <span style={{ fontWeight: col.name === 'id' ? 'bold' : 'normal' }}>
                          {col.name}
                        </span>
                        <span style={{ color: '#888888', fontSize: '9px' }}>
                          [{col.logicalType}]
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
