/**
 * TableImportModal.tsx — Windows 95 Tabular Data Import Wizard Dialog
 * Inspects parsed CSV/TSV/JSON datasets, allows customizing table name and column types,
 * displays a 5-row preview, and materializes directly into the SQLite WASM kernel.
 */

'use client';

import React, { useState } from 'react';
import { useDraggable } from '../../hooks/useDraggable';
import { WindowControls } from '../Win95/WindowControls';
import type { ParsedTableDataset } from '../../utils/tabularImporter';

interface TableImportModalProps {
  isOpen: boolean;
  dataset: ParsedTableDataset | null;
  zIndex?: number;
  onClose: () => void;
  onImport: (
    tableName: string,
    columns: Array<{ name: string; sqliteType: 'INTEGER' | 'REAL' | 'TEXT' }>,
    rows: unknown[][],
    dbName: string
  ) => Promise<void>;
}

export const TableImportModal: React.FC<TableImportModalProps> = ({
  isOpen,
  dataset,
  zIndex = 9999,
  onClose,
  onImport,
}) => {
  const { position, handleMouseDown } = useDraggable({ x: 180, y: 90 });
  const [tableName, setTableName] = useState<string>(dataset?.tableName || 'imported_data');
  const [columns, setColumns] = useState<Array<{ name: string; sqliteType: 'INTEGER' | 'REAL' | 'TEXT' }>>(
    dataset?.columns || []
  );
  const [targetDb, setTargetDb] = useState<string>('default');
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync state if dataset changes
  React.useEffect(() => {
    if (dataset) {
      setTableName(dataset.tableName);
      setColumns(dataset.columns);
      setErrorMsg(null);
    }
  }, [dataset]);

  if (!isOpen || !dataset) return null;

  const handleTypeChange = (colIdx: number, newType: 'INTEGER' | 'REAL' | 'TEXT') => {
    setColumns((prev) =>
      prev.map((col, idx) => (idx === colIdx ? { ...col, sqliteType: newType } : col))
    );
  };

  const handleNameChange = (colIdx: number, newName: string) => {
    setColumns((prev) =>
      prev.map((col, idx) => (idx === colIdx ? { ...col, name: newName } : col))
    );
  };

  const handleConfirmImport = async () => {
    const cleanName = tableName.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
    if (!cleanName) {
      setErrorMsg('Please specify a valid table name.');
      return;
    }

    setIsImporting(true);
    setErrorMsg(null);
    try {
      await onImport(cleanName, columns, dataset.rows, targetDb);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to import table.');
    } finally {
      setIsImporting(false);
    }
  };

  const previewRows = dataset.rows.slice(0, 5);

  return (
    <div
      className="win95-window"
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: '580px',
        maxWidth: '95vw',
        zIndex,
        boxShadow: '3px 3px 12px rgba(0,0,0,0.5)',
      }}
    >
      {/* Titlebar */}
      <div
        className="win95-titlebar"
        onMouseDown={handleMouseDown}
        style={{ cursor: 'move', userSelect: 'none' }}
      >
        <div className="win95-titlebar-text">
          <span>📊</span>
          <span>Tabular Import Wizard — [{dataset.format.toUpperCase()}]</span>
        </div>
        <WindowControls
          showMinimize={false}
          showMaximize={false}
          onClose={onClose}
        />
      </div>

      {/* Body */}
      <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {/* Destination Settings */}
        <fieldset style={{ border: '1px solid #808080', padding: '8px' }}>
          <legend style={{ padding: '0 4px', fontSize: '11px', fontWeight: 'bold' }}>
            Destination Table & Namespace
          </legend>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '11px', display: 'block', marginBottom: '2px' }}>
                <strong>Table Name:</strong>
              </label>
              <input
                type="text"
                className="win95-sunken"
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
                style={{ width: '100%', padding: '3px', fontSize: '11px', fontFamily: 'var(--w95-mono, monospace)' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '11px', display: 'block', marginBottom: '2px' }}>
                <strong>Target Database:</strong>
              </label>
              <select
                className="win95-sunken"
                value={targetDb}
                onChange={(e) => setTargetDb(e.target.value)}
                style={{ width: '100%', padding: '3px', fontSize: '11px' }}
              >
                <option value="default">default (main memory)</option>
              </select>
            </div>
          </div>
          <div style={{ marginTop: '6px', fontSize: '10px', color: '#555555' }}>
            Detected: <strong>{dataset.rows.length}</strong> data rows, <strong>{columns.length}</strong> columns.
          </div>
        </fieldset>

        {/* Columns & Types Specification */}
        <fieldset style={{ border: '1px solid #808080', padding: '8px' }}>
          <legend style={{ padding: '0 4px', fontSize: '11px', fontWeight: 'bold' }}>
            Column Schema Mapping ({columns.length} Columns)
          </legend>
          <div
            className="win95-sunken"
            style={{
              maxHeight: '140px',
              overflowY: 'auto',
              background: '#ffffff',
              padding: '4px',
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
              <thead>
                <tr style={{ background: '#e0e0e0', textAlign: 'left' }}>
                  <th style={{ padding: '3px 6px', borderBottom: '1px solid #999' }}>#</th>
                  <th style={{ padding: '3px 6px', borderBottom: '1px solid #999' }}>Column Identifier</th>
                  <th style={{ padding: '3px 6px', borderBottom: '1px solid #999' }}>SQLite Storage Type</th>
                </tr>
              </thead>
              <tbody>
                {columns.map((col, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '3px 6px', color: '#888', width: '28px' }}>{idx + 1}</td>
                    <td style={{ padding: '2px 6px' }}>
                      <input
                        type="text"
                        value={col.name}
                        onChange={(e) => handleNameChange(idx, e.target.value)}
                        style={{ width: '100%', padding: '1px 3px', fontSize: '11px', border: '1px solid #ccc' }}
                      />
                    </td>
                    <td style={{ padding: '2px 6px', width: '130px' }}>
                      <select
                        value={col.sqliteType}
                        onChange={(e) => handleTypeChange(idx, e.target.value as any)}
                        style={{ width: '100%', padding: '1px', fontSize: '11px' }}
                      >
                        <option value="TEXT">TEXT (String)</option>
                        <option value="INTEGER">INTEGER</option>
                        <option value="REAL">REAL (Float / Numeric)</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </fieldset>

        {/* 5-Row Data Preview */}
        <fieldset style={{ border: '1px solid #808080', padding: '8px' }}>
          <legend style={{ padding: '0 4px', fontSize: '11px', fontWeight: 'bold' }}>
            Data Preview (Top {previewRows.length} Rows)
          </legend>
          <div
            className="win95-sunken"
            style={{
              maxHeight: '110px',
              overflowX: 'auto',
              overflowY: 'auto',
              background: '#ffffff',
              fontSize: '11px',
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', whiteSpace: 'nowrap' }}>
              <thead>
                <tr style={{ background: '#c0c0c0', borderBottom: '1px solid #808080' }}>
                  {columns.map((c, i) => (
                    <th key={i} style={{ padding: '3px 6px', textAlign: 'left', fontWeight: 'bold' }}>
                      {c.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewRows.map((row, rIdx) => (
                  <tr key={rIdx} style={{ background: rIdx % 2 === 1 ? '#f9f9f9' : '#ffffff' }}>
                    {columns.map((_, cIdx) => (
                      <td key={cIdx} style={{ padding: '2px 6px', borderRight: '1px solid #eee' }}>
                        {row[cIdx] !== null && row[cIdx] !== undefined ? String(row[cIdx]) : <em style={{ color: '#aaa' }}>NULL</em>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </fieldset>

        {errorMsg && (
          <div style={{ color: '#b91c1c', fontSize: '11px', fontWeight: 'bold' }}>
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Buttons Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
          <button
            type="button"
            className="win95-button"
            onClick={onClose}
            disabled={isImporting}
            style={{ minWidth: '80px', padding: '3px 12px', fontSize: '11px' }}
          >
            Cancel
          </button>
          <button
            type="button"
            className="win95-button"
            onClick={handleConfirmImport}
            disabled={isImporting}
            style={{ minWidth: '130px', padding: '3px 14px', fontSize: '11px', fontWeight: 'bold' }}
          >
            {isImporting ? '⏳ Materializing...' : '💾 Materialize Table'}
          </button>
        </div>
      </div>
    </div>
  );
};
