/**
 * MobileCatalogDrawer.tsx — Slide-Out Database Catalog Sheet for Pocket SQL
 * Provides instant live visibility into in-memory materialized tables, row counts,
 * and column signatures with 1-tap SELECT injection and manual refresh.
 */

'use client';

import React from 'react';

interface MobileCatalogDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  tables: any[];
  onSelectTable: (tableName: string) => void;
  onRefresh: () => void;
}

export const MobileCatalogDrawer: React.FC<MobileCatalogDrawerProps> = ({
  isOpen,
  onClose,
  tables,
  onSelectTable,
  onRefresh,
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        zIndex: 99999,
        display: 'flex',
        justifyContent: 'flex-start',
      }}
      onClick={onClose}
    >
      <div
        className="win95-window"
        style={{
          width: '82%',
          maxWidth: '320px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '4px 0 16px rgba(0,0,0,0.5)',
          background: '#c0c0c0',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Titlebar */}
        <div className="win95-titlebar" style={{ padding: '4px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="win95-titlebar-text" style={{ fontSize: '11px', fontWeight: 'bold' }}>
            <span>🗄️</span>
            <span>Database Catalog ({tables.length})</span>
          </div>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              type="button"
              className="win95-btn-titlebar"
              onClick={onRefresh}
              title="Refresh Catalog"
              style={{ padding: '0 4px', fontSize: '10px' }}
            >
              🔄
            </button>
            <button
              type="button"
              className="win95-btn-titlebar"
              onClick={onClose}
              title="Close"
              style={{ padding: '0 4px', fontSize: '10px' }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ fontSize: '11px', color: '#000080', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Materialized Tables</span>
            <button
              type="button"
              className="win95-button"
              style={{ fontSize: '9px', padding: '1px 5px' }}
              onClick={onRefresh}
            >
              🔄 Refresh
            </button>
          </div>

          {tables.length === 0 ? (
            <div
              className="win95-sunken"
              style={{ padding: '12px', fontSize: '11px', color: '#555', backgroundColor: '#fff', textAlign: 'center' }}
            >
              No tables materialized yet.
              <br />
              <span style={{ fontSize: '10px', color: '#888' }}>
                Run any SQL query to synthesize relational tables automatically.
              </span>
            </div>
          ) : (
            (tables || []).map((t: any) => {
              const rawCols = t?.schema?.columns || t?.columns || [];
              const cols = Array.isArray(rawCols) ? rawCols : [];
              const colListStr = cols.map((c: any) => c?.name || String(c)).join(', ');
              return (
                <div
                  key={t?.tableName || Math.random()}
                  className="win95-window"
                  style={{ padding: '6px 8px', background: '#ece9d8' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#000' }}>
                      📊 {t?.tableName || 'table'}
                    </span>
                    <button
                      type="button"
                      className="win95-button"
                      style={{ fontSize: '10px', padding: '1px 6px' }}
                      onClick={() => {
                        if (t?.tableName) onSelectTable(t.tableName);
                        onClose();
                      }}
                      title="Generate SELECT Query"
                    >
                      ➤ Query
                    </button>
                  </div>
                  <div style={{ fontSize: '10px', color: '#555', marginTop: '3px' }}>
                    <strong>{t?.rowCount ?? 0} rows</strong> • {cols.length} cols
                  </div>
                  <div
                    style={{
                      fontSize: '9px',
                      color: '#666',
                      marginTop: '2px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    title={colListStr}
                  >
                    {colListStr}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div
          style={{
            padding: '4px 8px',
            fontSize: '9px',
            color: '#444',
            borderTop: '1px solid #808080',
            backgroundColor: '#d4d0c8',
          }}
        >
          Zero-Config Relational Kernel • SQLite WASM
        </div>
      </div>
    </div>
  );
};
