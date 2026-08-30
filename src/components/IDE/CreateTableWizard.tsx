/**
 * CreateTableWizard.tsx — Access 95 & SSMS Table Design View with Property Inspector Grid.
 *
 * Fixed Dimensions: 860px wide x 640px tall (zIndex: 1000000)
 *
 * Step 1: Table & Database Setup
 * Step 2: Access 95 Table Designer View:
 *   - Top Half: Sunken Column Grid Viewport (Row Indicator 👉, Name, Grouped Type, PK 🔑, NN, UQ, Default)
 *   - Bottom Half: Property Inspector Table for Currently Selected Column (#activeColIdx)
 *       Listing ALL 19 properties in clear, un-cramped, structured key-value rows.
 *   - Bottom Section: Live DDL Preview & Table-Level Multi-Column Constraints
 */

import React, { useState, useMemo } from 'react';
import { Dialect } from '../../engine/parser';
import { SessionCatalog } from '../../engine/catalog';
import {
  ColumnFormRow,
  TableConstraintForm,
  DIALECT_TYPE_MANIFEST,
  buildCreateTableSql,
} from '../../utils/dbManagerUtils';

const REFERENTIAL_ACTIONS = ['CASCADE', 'SET NULL', 'SET DEFAULT', 'RESTRICT', 'NO ACTION'];

function freshColumn(index: number): ColumnFormRow {
  return {
    name: index === 0 ? 'id' : index === 1 ? 'name' : '',
    type: index === 0 ? 'INT' : 'VARCHAR(n)',
    isPrimaryKey: index === 0,
    isAutoIncrement: index === 0,
    isNotNull: index === 0,
    isUnique: false,
  };
}

function getDialectWarnings(columns: ColumnFormRow[], dialect: Dialect): string[] {
  const manifest = DIALECT_TYPE_MANIFEST[dialect];
  const warnings: string[] = [];

  columns.forEach(col => {
    if (!col.name.trim()) return;
    const baseType = col.type.split('(')[0].replace('...', '').trim().toUpperCase();

    if (col.isAutoIncrement) {
      if (!manifest.constraints['AUTO_INCREMENT'] && !manifest.constraints['AUTOINCREMENT'] && !manifest.constraints['SERIAL'] && !manifest.constraints['IDENTITY']) {
        warnings.push(`Column "${col.name}": Auto-increment is not supported in ${dialect}.`);
      } else if (dialect === 'PostgreSQL' && col.isAutoIncrement) {
        warnings.push(`Column "${col.name}": PostgreSQL uses SERIAL / BIGSERIAL for auto-increment PKs.`);
      } else if ((dialect === 'TransactSQL' || dialect === 'SSMS') && col.isAutoIncrement) {
        warnings.push(`Column "${col.name}": T-SQL/SSMS uses IDENTITY(1,1) for auto-increment.`);
      }
    }

    if (baseType === 'ENUM' && !manifest.constraints['ENUM']) {
      warnings.push(`Column "${col.name}": ENUM type is not supported inline in ${dialect}.`);
    }
    if (baseType === 'SET' && !manifest.constraints['SET']) {
      warnings.push(`Column "${col.name}": SET type is not supported in ${dialect}.`);
    }
    if (col.isUnsigned && !manifest.constraints['UNSIGNED']) {
      warnings.push(`Column "${col.name}": UNSIGNED modifier is only supported in MySQL.`);
    }
  });

  return warnings;
}

interface CreateTableWizardProps {
  dialect: Dialect;
  catalog: SessionCatalog;
  defaultDb: string;
  onConfirm: (
    tableName: string,
    ddlSql: string,
    columns: ColumnFormRow[],
    dbName: string,
    rowsToGenerate: number,
  ) => void;
  onCancel: () => void;
}

export const CreateTableWizard: React.FC<CreateTableWizardProps> = ({
  dialect, catalog, defaultDb, onConfirm, onCancel,
}) => {
  const [step, setStep] = useState(1);

  // Step 1 state
  const [tableName, setTableName] = useState('');
  const [selectedDb, setSelectedDb] = useState(defaultDb || 'default');
  const [tableDesc, setTableDesc] = useState('');
  const [step1Error, setStep1Error] = useState('');

  // Step 2 state
  const [columns, setColumns] = useState<ColumnFormRow[]>([freshColumn(0), freshColumn(1)]);
  const [activeColIdx, setActiveColIdx] = useState(0);
  const [tableConstraints, setTableConstraints] = useState<TableConstraintForm[]>([]);
  const [rowsToGenerate, setRowsToGenerate] = useState(20);
  const [bottomTab, setBottomTab] = useState<'ddl' | 'table_constraints'>('ddl');
  const [step2Error, setStep2Error] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const dbNames = catalog.getDatabaseNames();
  const manifest = DIALECT_TYPE_MANIFEST[dialect];

  // List of all existing tables and parent columns for Foreign Key picker
  const allTables = useMemo(() => catalog.getAll().map(e => e.tableName), [catalog]);
  const activeCol = columns[activeColIdx] || columns[0];

  const parentTableCols = useMemo(() => {
    if (!activeCol?.references?.table) return [];
    return catalog.get(activeCol.references.table)?.schema.columns.map(c => c.name) ?? [];
  }, [activeCol, catalog]);

  const warnings = useMemo(() => getDialectWarnings(columns, dialect), [columns, dialect]);

  // Live DDL generator
  const ddlSql = useMemo(() => {
    if (!tableName.trim() || columns.every(c => !c.name.trim())) return '';
    try {
      return buildCreateTableSql(tableName.trim(), columns.filter(c => c.name.trim()), tableConstraints, dialect);
    } catch {
      return '';
    }
  }, [tableName, columns, tableConstraints, dialect]);

  // ── Step 1 Validation ────────────────────────────────────────────────────────
  const handleStep1Next = () => {
    const t = tableName.trim();
    if (!t) { setStep1Error('Table name is required.'); return; }
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(t)) { setStep1Error('Table name must start with a letter/underscore and contain only alphanumeric characters.'); return; }
    if (catalog.has(t, selectedDb)) { setStep1Error(`Table "${t}" already exists in database "${selectedDb}".`); return; }
    setStep1Error('');
    setStep(2);
  };

  // ── Column Handlers ──────────────────────────────────────────────────────────
  const handleColumnChange = (idx: number, patch: Partial<ColumnFormRow>) => {
    setColumns(prev => prev.map((c, i) => i === idx ? { ...c, ...patch } : c));
  };

  const handleAddColumn = () => {
    setColumns(prev => {
      const next = [...prev, freshColumn(prev.length)];
      setActiveColIdx(next.length - 1);
      return next;
    });
  };

  const handleRemoveColumn = (idx: number) => {
    if (columns.length <= 1) return;
    setColumns(prev => prev.filter((_, i) => i !== idx));
    setActiveColIdx(prev => Math.max(0, prev >= idx ? prev - 1 : prev));
  };

  const hasPk = columns.some(c => c.isPrimaryKey);

  // ── Table Constraint Handlers ────────────────────────────────────────────────
  const handleAddTableConstraint = () => {
    setTableConstraints(prev => [...prev, { type: 'CHECK', expr: '' }]);
    setBottomTab('table_constraints');
  };

  const handleRemoveTableConstraint = (idx: number) => {
    setTableConstraints(prev => prev.filter((_, i) => i !== idx));
  };

  // ── Final Submit ─────────────────────────────────────────────────────────────
  const handleCreate = () => {
    const validCols = columns.filter(c => c.name.trim());
    if (validCols.length === 0) { setStep2Error('At least one column name is required.'); return; }

    const names = validCols.map(c => c.name.trim().toLowerCase());
    if (new Set(names).size !== names.length) { setStep2Error('Duplicate column names are not allowed.'); return; }

    setIsCreating(true);
    onConfirm(tableName.trim(), ddlSql, validCols, selectedDb, rowsToGenerate);
  };

  // Input styles
  const inputStyle: React.CSSProperties = {
    background: 'var(--w95-sunken-bg, #ffffff)',
    color: 'var(--w95-sunken-text, #000000)',
    border: '1px solid #808080',
    padding: '2px 5px',
    fontSize: 11,
    fontFamily: 'var(--w95-font)',
    boxSizing: 'border-box',
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000000,
        background: 'rgba(0,0,0,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 12,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div
        className="win95-raised"
        style={{
          width: 860,
          height: 640,
          background: 'var(--w95-gray, #c0c0c0)',
          color: 'var(--w95-text-color, #000000)',
          fontFamily: 'var(--w95-font)',
          fontSize: 12,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '6px 6px 14px rgba(0,0,0,0.6)',
          border: '2px solid',
          borderColor: '#ffffff #808080 #808080 #ffffff',
          boxSizing: 'border-box',
        }}
      >
        {/* Window Title Bar */}
        <div style={{
          background: 'var(--w95-titlebar-active, #000080)',
          color: '#ffffff',
          padding: '4px 8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontWeight: 'bold',
          fontSize: 11,
          userSelect: 'none',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>🗄️</span>
            <span>Table Designer — [{tableName || 'New Table'}] — <strong>{dialect} Dialect</strong></span>
          </div>
          <button className="win95-button" style={{ padding: '0 4px', minHeight: 16, fontSize: 10 }} onClick={onCancel} title="Close">✕</button>
        </div>

        {/* Step Indicator Header */}
        <div style={{ display: 'flex', background: 'var(--w95-gray, #c0c0c0)', borderBottom: '1px solid var(--w95-dark-gray,#808080)', flexShrink: 0 }}>
          <div style={{
            flex: 1, padding: '5px 12px', textAlign: 'center', fontSize: 11,
            fontWeight: step === 1 ? 'bold' : 'normal',
            background: step === 1 ? 'var(--w95-light-gray,#e0e0e0)' : 'var(--w95-gray,#c0c0c0)',
            color: step === 1 ? 'var(--w95-titlebar-active,#000080)' : 'var(--w95-text-color,#555)',
            borderBottom: step === 1 ? '2px solid var(--w95-titlebar-active,#000080)' : 'none',
          }}>
            Step 1: Table & Database Setup
          </div>
          <div style={{
            flex: 1, padding: '5px 12px', textAlign: 'center', fontSize: 11,
            fontWeight: step === 2 ? 'bold' : 'normal',
            background: step === 2 ? 'var(--w95-light-gray,#e0e0e0)' : 'var(--w95-gray,#c0c0c0)',
            color: step === 2 ? 'var(--w95-titlebar-active,#000080)' : 'var(--w95-text-color,#555)',
            borderBottom: step === 2 ? '2px solid var(--w95-titlebar-active,#000080)' : 'none',
          }}>
            Step 2: Table Designer (Access 95 View)
          </div>
        </div>

        {/* Dialect Warnings Banner */}
        {warnings.length > 0 && step === 2 && (
          <div className="win95-warning-box" style={{ flexShrink: 0, margin: '6px 10px 0' }}>
            {warnings.map((w, idx) => (
              <div key={idx}>⚠️ {w}</div>
            ))}
          </div>
        )}

        {/* Main Content Area */}
        <div style={{ flex: 1, overflow: 'hidden', padding: 10, display: 'flex', flexDirection: 'column' }}>

          {/* ── STEP 1: Details Setup ────────────────────────────────────────── */}
          {step === 1 && (
            <div style={{ maxWidth: 520, margin: '30px auto 0', width: '100%' }}>
              <div className="win95-fieldset" style={{ padding: 16 }}>
                <legend style={{ fontWeight: 'bold', fontSize: 12 }}>🗄️ Database & Table Configuration</legend>

                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: 4, fontSize: 11 }}>
                    Target Database:
                  </label>
                  <select
                    className="win95-sunken"
                    value={selectedDb}
                    onChange={e => setSelectedDb(e.target.value)}
                    style={{ ...inputStyle, width: '100%', padding: '4px 6px', fontSize: 12 }}
                  >
                    {dbNames.map(db => <option key={db} value={db}>{db}</option>)}
                  </select>
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: 4, fontSize: 11 }}>
                    Table Name:
                  </label>
                  <input
                    type="text"
                    className="win95-sunken"
                    value={tableName}
                    onChange={e => { setTableName(e.target.value); setStep1Error(''); }}
                    placeholder="e.g. employees"
                    style={{ ...inputStyle, width: '100%', padding: '4px 6px', fontSize: 12 }}
                    autoFocus
                    onKeyDown={e => e.key === 'Enter' && handleStep1Next()}
                  />
                </div>

                <div style={{ marginBottom: 10 }}>
                  <label style={{ display: 'block', marginBottom: 4, fontSize: 11 }}>
                    Description / Purpose (Optional):
                  </label>
                  <input
                    type="text"
                    className="win95-sunken"
                    value={tableDesc}
                    onChange={e => setTableDesc(e.target.value)}
                    placeholder="e.g. Stores company employee records"
                    style={{ ...inputStyle, width: '100%', padding: '4px 6px', fontSize: 12 }}
                  />
                </div>
              </div>

              {step1Error && (
                <div className="win95-warning-box">
                  ⚠️ {step1Error}
                </div>
              )}

              <div style={{ fontSize: 11, color: 'var(--w95-dark-gray,#666)', marginTop: 16 }}>
                💡 Click <strong>Next ▶</strong> to open the Access 95 Table Designer and configure columns, data types, constraints, and foreign keys.
              </div>
            </div>
          )}

          {/* ── STEP 2: Access 95 Table Designer Split View ──────────────────── */}
          {step === 2 && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, overflow: 'hidden' }}>

              {/* Toolbar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <button className="win95-button" style={{ padding: '2px 8px', fontSize: 11, fontWeight: 'bold' }} onClick={handleAddColumn}>
                    ➕ Add Column
                  </button>
                  <button className="win95-button" style={{ padding: '2px 8px', fontSize: 11 }} onClick={handleAddTableConstraint}>
                    🔒 Add Table Constraint
                  </button>
                </div>
                <div style={{ fontSize: 11, fontWeight: 'bold', color: 'var(--w95-titlebar-active,#000080)' }}>
                  Active Dialect: <span style={{ background: '#000080', color: '#fff', padding: '1px 6px', borderRadius: 2 }}>{dialect}</span>
                </div>
              </div>

              {/* Top Half: Access 95 Column Grid (Sunken Viewport) */}
              <div className="win95-inset" style={{ height: '34%', overflowY: 'auto', background: 'var(--w95-sunken-bg,#fff)', flexShrink: 0 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                  <thead>
                    <tr style={{ background: 'var(--w95-gray,#c0c0c0)', fontWeight: 'bold', borderBottom: '2px solid var(--w95-dark-gray,#808080)', position: 'sticky', top: 0, zIndex: 10 }}>
                      <th style={{ padding: '3px 4px', textAlign: 'center', width: 28 }}></th>
                      <th style={{ padding: '3px 4px', textAlign: 'center', width: 24 }}>#</th>
                      <th style={{ padding: '3px 6px', textAlign: 'left' }}>Column Name</th>
                      <th style={{ padding: '3px 6px', textAlign: 'left', width: 190 }}>Data Type ({dialect})</th>
                      <th style={{ padding: '3px 4px', textAlign: 'center', width: 44 }} title="Primary Key">🔑 PK</th>
                      <th style={{ padding: '3px 4px', textAlign: 'center', width: 44 }} title="NOT NULL">NN</th>
                      <th style={{ padding: '3px 4px', textAlign: 'center', width: 44 }} title="UNIQUE">UQ</th>
                      <th style={{ padding: '3px 6px', textAlign: 'left' }}>Default Value</th>
                      <th style={{ padding: '3px 4px', textAlign: 'center', width: 32 }}>Del</th>
                    </tr>
                  </thead>
                  <tbody>
                    {columns.map((col, idx) => {
                      const isActive = activeColIdx === idx;
                      return (
                        <tr
                          key={idx}
                          style={{
                            background: isActive ? 'var(--w95-titlebar-active,#000080)' : (idx % 2 === 0 ? 'var(--w95-sunken-bg,#fff)' : 'var(--w95-light-gray,#f5f5f5)'),
                            color: isActive ? '#ffffff' : 'var(--w95-sunken-text,#000000)',
                            cursor: 'pointer',
                          }}
                          onClick={() => setActiveColIdx(idx)}
                        >
                          <td style={{ padding: '2px 4px', textAlign: 'center', fontWeight: 'bold', fontSize: 10 }}>
                            {isActive ? '👉' : ''}
                          </td>
                          <td style={{ padding: '2px 4px', textAlign: 'center' }}>{idx + 1}</td>
                          <td style={{ padding: '2px 4px' }}>
                            <input
                              type="text"
                              className="win95-sunken"
                              value={col.name}
                              onChange={e => handleColumnChange(idx, { name: e.target.value })}
                              placeholder="column_name"
                              style={{ ...inputStyle, width: '100%' }}
                            />
                          </td>
                          <td style={{ padding: '2px 4px' }}>
                            <select
                              className="win95-sunken"
                              value={col.type}
                              onChange={e => handleColumnChange(idx, { type: e.target.value })}
                              style={{ ...inputStyle, width: '100%' }}
                            >
                              {manifest.typeGroups.map(g => (
                                <optgroup key={g.group} label={`── ${g.group} ──`}>
                                  {g.types.map(t => <option key={t} value={t}>{t}</option>)}
                                </optgroup>
                              ))}
                            </select>
                          </td>
                          <td style={{ padding: '2px 4px', textAlign: 'center' }}>
                            <input
                              type="checkbox"
                              checked={col.isPrimaryKey}
                              onChange={e => handleColumnChange(idx, { isPrimaryKey: e.target.checked, isUnique: e.target.checked ? false : col.isUnique })}
                              disabled={hasPk && !col.isPrimaryKey}
                            />
                          </td>
                          <td style={{ padding: '2px 4px', textAlign: 'center' }}>
                            <input
                              type="checkbox"
                              checked={col.isNotNull}
                              onChange={e => handleColumnChange(idx, { isNotNull: e.target.checked })}
                            />
                          </td>
                          <td style={{ padding: '2px 4px', textAlign: 'center' }}>
                            <input
                              type="checkbox"
                              checked={col.isUnique}
                              onChange={e => handleColumnChange(idx, { isUnique: e.target.checked })}
                              disabled={col.isPrimaryKey}
                            />
                          </td>
                          <td style={{ padding: '2px 4px' }}>
                            <input
                              type="text"
                              className="win95-sunken"
                              value={col.defaultValue ?? ''}
                              onChange={e => handleColumnChange(idx, { defaultValue: e.target.value })}
                              placeholder="DEFAULT..."
                              style={{ ...inputStyle, width: '100%' }}
                            />
                          </td>
                          <td style={{ padding: '2px 4px', textAlign: 'center' }}>
                            <button
                              className="win95-button"
                              style={{ padding: '0 4px', fontSize: 10, color: '#cc0000' }}
                              onClick={(e) => { e.stopPropagation(); handleRemoveColumn(idx); }}
                              title="Delete column"
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Bottom Half: Win95 Property Inspector Grid for Active Column */}
              <div className="win95-fieldset" style={{ height: '40%', overflowY: 'auto', margin: 0, padding: 6, flexShrink: 0 }}>
                <legend style={{ fontWeight: 'bold', fontSize: 11, color: 'var(--w95-titlebar-active,#000080)' }}>
                  ⚙️ Property Inspector for Selected Column: <u>{activeCol?.name || `#${activeColIdx + 1}`}</u> [{activeCol?.type || 'INT'}]
                </legend>

                {activeCol && (
                  <div className="win95-inset" style={{ overflowY: 'auto', maxHeight: '100%' }}>
                    <table className="win95-prop-table">
                      <tbody>
                        {/* 1. Column Name */}
                        <tr>
                          <td className="win95-prop-name-col">Column Name</td>
                          <td className="win95-prop-val-col">
                            <input
                              type="text"
                              className="win95-sunken"
                              value={activeCol.name}
                              onChange={e => handleColumnChange(activeColIdx, { name: e.target.value })}
                              style={{ ...inputStyle, width: '100%' }}
                            />
                          </td>
                        </tr>

                        {/* 2. Data Type */}
                        <tr>
                          <td className="win95-prop-name-col">Data Type ({dialect})</td>
                          <td className="win95-prop-val-col">
                            <select
                              className="win95-sunken"
                              value={activeCol.type}
                              onChange={e => handleColumnChange(activeColIdx, { type: e.target.value })}
                              style={{ ...inputStyle, width: '100%' }}
                            >
                              {manifest.typeGroups.map(g => (
                                <optgroup key={g.group} label={`── ${g.group} ──`}>
                                  {g.types.map(t => <option key={t} value={t}>{t}</option>)}
                                </optgroup>
                              ))}
                            </select>
                          </td>
                        </tr>

                        {/* 3. Primary Key */}
                        <tr>
                          <td className="win95-prop-name-col">Primary Key (PK)</td>
                          <td className="win95-prop-val-col">
                            <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                              <input
                                type="checkbox"
                                checked={activeCol.isPrimaryKey}
                                onChange={e => handleColumnChange(activeColIdx, { isPrimaryKey: e.target.checked, isUnique: e.target.checked ? false : activeCol.isUnique })}
                                disabled={hasPk && !activeCol.isPrimaryKey}
                              />
                              🔑 Primary Key constraint
                            </label>
                          </td>
                        </tr>

                        {/* 4. Allow Nulls / NOT NULL */}
                        <tr>
                          <td className="win95-prop-name-col">Allow Nulls (NOT NULL)</td>
                          <td className="win95-prop-val-col">
                            <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                              <input
                                type="checkbox"
                                checked={activeCol.isNotNull}
                                onChange={e => handleColumnChange(activeColIdx, { isNotNull: e.target.checked })}
                              />
                              NOT NULL (Disallow NULL values)
                            </label>
                          </td>
                        </tr>

                        {/* 5. Unique Constraint */}
                        <tr>
                          <td className="win95-prop-name-col">Unique Constraint (UQ)</td>
                          <td className="win95-prop-val-col">
                            <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                              <input
                                type="checkbox"
                                checked={activeCol.isUnique}
                                onChange={e => handleColumnChange(activeColIdx, { isUnique: e.target.checked })}
                                disabled={activeCol.isPrimaryKey}
                              />
                              UNIQUE index constraint
                            </label>
                          </td>
                        </tr>

                        {/* 6. Default Value */}
                        <tr>
                          <td className="win95-prop-name-col">Default Value / Expression</td>
                          <td className="win95-prop-val-col">
                            <input
                              type="text"
                              className="win95-sunken"
                              value={activeCol.defaultValue ?? ''}
                              onChange={e => handleColumnChange(activeColIdx, { defaultValue: e.target.value })}
                              placeholder="e.g. 0, 'active', CURRENT_TIMESTAMP, NULL"
                              style={{ ...inputStyle, width: '100%' }}
                            />
                          </td>
                        </tr>

                        {/* 7. Auto-Increment / Identity */}
                        <tr>
                          <td className="win95-prop-name-col">Auto-Increment / Identity</td>
                          <td className="win95-prop-val-col">
                            {manifest.autoIncrementKeyword ? (
                              <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                                <input
                                  type="checkbox"
                                  checked={!!activeCol.isAutoIncrement}
                                  onChange={e => handleColumnChange(activeColIdx, { isAutoIncrement: e.target.checked })}
                                />
                                {manifest.autoIncrementKeyword} ({dialect})
                              </label>
                            ) : (
                              <span style={{ color: 'var(--w95-dark-gray,#666)', fontSize: 10 }}>Not supported in {dialect}</span>
                            )}
                          </td>
                        </tr>

                        {/* 8. CHECK Expression */}
                        <tr>
                          <td className="win95-prop-name-col">CHECK Expression</td>
                          <td className="win95-prop-val-col">
                            <input
                              type="text"
                              className="win95-sunken"
                              value={activeCol.checkExpr ?? ''}
                              onChange={e => handleColumnChange(activeColIdx, { checkExpr: e.target.value })}
                              placeholder={`e.g. ${activeCol.name || 'col'} >= 0 AND ${activeCol.name || 'col'} <= 100`}
                              style={{ ...inputStyle, width: '100%' }}
                            />
                          </td>
                        </tr>

                        {/* 9a. ENUM Permitted Values */}
                        <tr>
                          <td className="win95-prop-name-col">ENUM Permitted Values</td>
                          <td className="win95-prop-val-col">
                            <input
                              type="text"
                              className="win95-sunken"
                              value={(activeCol.enumValues || []).map(v => v.replace(/^['"]+|['"]+$/g, '')).join(', ')}
                              onChange={e => {
                                const clean = e.target.value.split(',').map(v => v.replace(/^['"]+|['"]+$/g, '').trim()).filter(Boolean);
                                const patch: Partial<ColumnFormRow> = { enumValues: clean };
                                if (clean.length > 0 && !activeCol.type.toUpperCase().includes('ENUM')) {
                                  patch.type = 'ENUM(...)';
                                }
                                handleColumnChange(activeColIdx, patch);
                              }}
                              placeholder="e.g. active, inactive, pending"
                              style={{ ...inputStyle, width: '100%' }}
                            />
                          </td>
                        </tr>

                        {/* 9b. SET Permitted Values */}
                        <tr>
                          <td className="win95-prop-name-col">SET Permitted Values</td>
                          <td className="win95-prop-val-col">
                            <input
                              type="text"
                              className="win95-sunken"
                              value={(activeCol.setValues || []).map(v => v.replace(/^['"]+|['"]+$/g, '')).join(', ')}
                              onChange={e => {
                                const clean = e.target.value.split(',').map(v => v.replace(/^['"]+|['"]+$/g, '').trim()).filter(Boolean);
                                const patch: Partial<ColumnFormRow> = { setValues: clean };
                                if (clean.length > 0 && !activeCol.type.toUpperCase().includes('SET')) {
                                  patch.type = 'SET(...)';
                                }
                                handleColumnChange(activeColIdx, patch);
                              }}
                              placeholder="e.g. read, write, execute"
                              style={{ ...inputStyle, width: '100%' }}
                            />
                          </td>
                        </tr>

                        {/* 10. Foreign Key Parent Table */}
                        <tr>
                          <td className="win95-prop-name-col">Foreign Key Parent Table</td>
                          <td className="win95-prop-val-col">
                            <select
                              className="win95-sunken"
                              value={activeCol.references?.table ?? ''}
                              onChange={e => handleColumnChange(activeColIdx, { references: { table: e.target.value, column: '', onDelete: 'NO ACTION', onUpdate: 'NO ACTION' } })}
                              style={{ ...inputStyle, width: '100%' }}
                            >
                              <option value="">(no Foreign Key reference)</option>
                              {allTables.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                          </td>
                        </tr>

                        {/* 11. Foreign Key Parent Column */}
                        <tr>
                          <td className="win95-prop-name-col">Foreign Key Parent Column</td>
                          <td className="win95-prop-val-col">
                            <select
                              className="win95-sunken"
                              value={activeCol.references?.column ?? ''}
                              onChange={e => handleColumnChange(activeColIdx, { references: { ...activeCol.references!, column: e.target.value } })}
                              style={{ ...inputStyle, width: '100%' }}
                              disabled={!activeCol.references?.table}
                            >
                              <option value="">(select parent column)</option>
                              {parentTableCols.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                          </td>
                        </tr>

                        {/* 12. FK ON DELETE Action */}
                        <tr>
                          <td className="win95-prop-name-col">FK ON DELETE Action</td>
                          <td className="win95-prop-val-col">
                            <select
                              className="win95-sunken"
                              value={activeCol.references?.onDelete ?? 'NO ACTION'}
                              onChange={e => handleColumnChange(activeColIdx, { references: { ...activeCol.references!, onDelete: e.target.value } })}
                              style={{ ...inputStyle, width: '100%' }}
                            >
                              {REFERENTIAL_ACTIONS.map(a => <option key={a} value={a}>{a}</option>)}
                            </select>
                          </td>
                        </tr>

                        {/* 13. FK ON UPDATE Action */}
                        <tr>
                          <td className="win95-prop-name-col">FK ON UPDATE Action</td>
                          <td className="win95-prop-val-col">
                            <select
                              className="win95-sunken"
                              value={activeCol.references?.onUpdate ?? 'NO ACTION'}
                              onChange={e => handleColumnChange(activeColIdx, { references: { ...activeCol.references!, onUpdate: e.target.value } })}
                              style={{ ...inputStyle, width: '100%' }}
                            >
                              {REFERENTIAL_ACTIONS.map(a => <option key={a} value={a}>{a}</option>)}
                            </select>
                          </td>
                        </tr>

                        {/* 14. Computed Expression (AS) */}
                        <tr>
                          <td className="win95-prop-name-col">Computed Expression (AS)</td>
                          <td className="win95-prop-val-col">
                            <input
                              type="text"
                              className="win95-sunken"
                              value={activeCol.generatedExpr ?? ''}
                              onChange={e => handleColumnChange(activeColIdx, { generatedExpr: e.target.value })}
                              placeholder="e.g. price * quantity"
                              style={{ ...inputStyle, width: '100%' }}
                            />
                          </td>
                        </tr>

                        {/* 15. Computed Mode */}
                        <tr>
                          <td className="win95-prop-name-col">Computed Mode</td>
                          <td className="win95-prop-val-col">
                            <select
                              className="win95-sunken"
                              value={activeCol.generatedMode ?? 'STORED'}
                              onChange={e => handleColumnChange(activeColIdx, { generatedMode: e.target.value as any })}
                              style={{ ...inputStyle, width: '100%' }}
                            >
                              <option value="STORED">{manifest.generatedStoredKeyword}</option>
                              {manifest.generatedVirtualSupported && <option value="VIRTUAL">VIRTUAL</option>}
                            </select>
                          </td>
                        </tr>

                        {/* 16. Unsigned Numeric */}
                        <tr>
                          <td className="win95-prop-name-col">Unsigned Numeric</td>
                          <td className="win95-prop-val-col">
                            {manifest.constraints['UNSIGNED'] ? (
                              <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                                <input
                                  type="checkbox"
                                  checked={!!activeCol.isUnsigned}
                                  onChange={e => handleColumnChange(activeColIdx, { isUnsigned: e.target.checked })}
                                />
                                UNSIGNED (MySQL)
                              </label>
                            ) : (
                              <span style={{ color: 'var(--w95-dark-gray,#666)', fontSize: 10 }}>Only supported in MySQL</span>
                            )}
                          </td>
                        </tr>

                        {/* 17. Zerofill */}
                        <tr>
                          <td className="win95-prop-name-col">Zerofill Modifier</td>
                          <td className="win95-prop-val-col">
                            {manifest.constraints['ZEROFILL'] ? (
                              <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                                <input
                                  type="checkbox"
                                  checked={!!activeCol.isZerofill}
                                  onChange={e => handleColumnChange(activeColIdx, { isZerofill: e.target.checked })}
                                />
                                ZEROFILL (MySQL)
                              </label>
                            ) : (
                              <span style={{ color: 'var(--w95-dark-gray,#666)', fontSize: 10 }}>Only supported in MySQL</span>
                            )}
                          </td>
                        </tr>

                        {/* 18. Collation (COLLATE) */}
                        <tr>
                          <td className="win95-prop-name-col">Collation (COLLATE)</td>
                          <td className="win95-prop-val-col">
                            <input
                              type="text"
                              className="win95-sunken"
                              value={activeCol.collate ?? ''}
                              onChange={e => handleColumnChange(activeColIdx, { collate: e.target.value })}
                              placeholder="e.g. utf8_general_ci"
                              style={{ ...inputStyle, width: '100%' }}
                            />
                          </td>
                        </tr>

                        {/* 19. Column Comment */}
                        <tr>
                          <td className="win95-prop-name-col">Column Comment</td>
                          <td className="win95-prop-val-col">
                            <input
                              type="text"
                              className="win95-sunken"
                              value={activeCol.comment ?? ''}
                              onChange={e => handleColumnChange(activeColIdx, { comment: e.target.value })}
                              placeholder="Column description..."
                              style={{ ...inputStyle, width: '100%' }}
                            />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Bottom Section: Collapsible View for Table Constraints or Live DDL Preview */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid #808080', flexShrink: 0 }}>
                  <button
                    className="win95-button"
                    style={{ padding: '1px 8px', fontSize: 10, fontWeight: bottomTab === 'ddl' ? 'bold' : 'normal' }}
                    onClick={() => setBottomTab('ddl')}
                  >
                    📄 Live DDL Preview & Auto-Data
                  </button>
                  <button
                    className="win95-button"
                    style={{ padding: '1px 8px', fontSize: 10, fontWeight: bottomTab === 'table_constraints' ? 'bold' : 'normal' }}
                    onClick={() => setBottomTab('table_constraints')}
                  >
                    🔒 Table-Level Constraints ({tableConstraints.length})
                  </button>
                </div>

                {bottomTab === 'ddl' && (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '4px 0', gap: 4, overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
                        <span style={{ fontWeight: 'bold' }}>🎲 Auto-Populate Rows:</span>
                        <input
                          type="range"
                          min={1}
                          max={25}
                          value={rowsToGenerate}
                          onChange={e => setRowsToGenerate(Number(e.target.value))}
                          style={{ accentColor: 'var(--w95-titlebar-active,#000080)', cursor: 'pointer', width: 100 }}
                        />
                        <span style={{ fontWeight: 'bold' }}>{rowsToGenerate}</span>
                        <span style={{ fontSize: 9, background: '#ffe0a0', color: '#664400', padding: '1px 4px', border: '1px solid #c8a000' }}>
                          🔒 Max 25
                        </span>
                      </div>
                      <button
                        className="win95-button"
                        style={{ padding: '1px 8px', fontSize: 10 }}
                        onClick={() => ddlSql && navigator.clipboard?.writeText(ddlSql)}
                      >
                        📋 Copy DDL
                      </button>
                    </div>

                    <textarea
                      readOnly
                      className="win95-sunken"
                      value={ddlSql || '(Fill in column names to generate DDL)'}
                      style={{
                        flex: 1,
                        width: '100%',
                        fontFamily: 'var(--w95-mono)',
                        fontSize: 10,
                        padding: 6,
                        boxSizing: 'border-box',
                        background: 'var(--w95-sunken-bg,#fff)',
                        color: 'var(--w95-sunken-text,#000)',
                        resize: 'none',
                      }}
                    />
                  </div>
                )}

                {bottomTab === 'table_constraints' && (
                  <div style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }}>
                    {tableConstraints.map((tc, idx) => (
                      <div key={idx} style={{ display: 'grid', gridTemplateColumns: '130px 1fr 24px', gap: 4, marginBottom: 4, alignItems: 'center' }}>
                        <select
                          className="win95-sunken"
                          value={tc.type}
                          onChange={e => setTableConstraints(prev => prev.map((c, i) => i === idx ? { ...c, type: e.target.value as any } : c))}
                          style={{ ...inputStyle }}
                        >
                          <option value="CHECK">CHECK</option>
                          <option value="UNIQUE">UNIQUE (cols)</option>
                          <option value="PRIMARY_KEY">PRIMARY KEY (cols)</option>
                          <option value="FOREIGN_KEY">FOREIGN KEY</option>
                          <option value="INDEX">INDEX</option>
                        </select>
                        <input
                          type="text"
                          className="win95-sunken"
                          value={tc.type === 'CHECK' ? (tc.expr ?? '') : (tc.columns ?? []).join(', ')}
                          onChange={e => {
                            const v = e.target.value;
                            setTableConstraints(prev => prev.map((c, i) => i === idx
                              ? (c.type === 'CHECK' ? { ...c, expr: v } : { ...c, columns: v.split(',').map(x => x.trim()).filter(Boolean) })
                              : c
                            ));
                          }}
                          placeholder={tc.type === 'CHECK' ? 'expr e.g. end_date > start_date' : 'col1, col2'}
                          style={{ ...inputStyle, width: '100%' }}
                        />
                        <button className="win95-button" style={{ padding: 0, width: 22, height: 20, fontSize: 10, color: '#cc0000' }} onClick={() => handleRemoveTableConstraint(idx)}>✕</button>
                      </div>
                    ))}
                    {tableConstraints.length === 0 && (
                      <div style={{ fontSize: 10, color: 'var(--w95-dark-gray,#666)', padding: '6px 0' }}>
                        No table-level constraints added. Click "🔒 Add Table Constraint" in the top toolbar to add multi-column keys or checks.
                      </div>
                    )}
                  </div>
                )}

                {step2Error && (
                  <div className="win95-warning-box" style={{ flexShrink: 0, marginTop: 4 }}>
                    ⚠️ {step2Error}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons Footer */}
        <div style={{
          borderTop: '2px solid var(--w95-dark-gray,#808080)',
          padding: '8px 12px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'var(--w95-gray,#c0c0c0)', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {step === 2 && (
              <button className="win95-button" style={{ minWidth: 80 }} onClick={() => setStep(1)}>
                ◀ Back
              </button>
            )}
            <button className="win95-button" style={{ minWidth: 75 }} onClick={onCancel}>Cancel</button>
          </div>

          <div>
            {step === 1 && (
              <button className="win95-button" style={{ minWidth: 90, fontWeight: 'bold' }} onClick={handleStep1Next}>
                Next ▶
              </button>
            )}
            {step === 2 && (
              <button
                className="win95-button"
                style={{ minWidth: 140, fontWeight: 'bold' }}
                onClick={handleCreate}
                disabled={isCreating}
              >
                {isCreating ? '⏳ Creating...' : '✅ Create Table'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
