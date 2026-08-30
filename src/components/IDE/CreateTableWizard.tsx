/**
 * CreateTableWizard.tsx — Redesigned Win95 Property Sheet Wizard for Table Creation.
 *
 * Provides a clean, spacious 880px wide multi-tab layout:
 *   - Title Bar with Active Dialect Badge (MySQL, PostgreSQL, SQLite, T-SQL, SSMS)
 *   - Step 1: Table Details (Name, Database, Description)
 *   - Step 2: Tabbed Property Sheet:
 *       • [📋 Columns]: Name, Grouped Type, PK 🔑, NOT NULL NN, UNIQUE UQ, Default
 *       • [⚙️ Column Constraints]: AUTO_INCREMENT/SERIAL/IDENTITY, CHECK, ENUM/SET,
 *         FK picker with ON DELETE/UPDATE rules, GENERATED AS, UNSIGNED, ZEROFILL, COLLATE, COMMENT
 *       • [🔒 Table Constraints]: Composite PK/UNIQUE, Table CHECK, Table FK, INDEX
 *       • [🎲 Data & DDL]: Row count slider (1-25 max), Live DDL Preview + Copy button
 *   - Real-time Dialect Warning Alert Banner
 */

import React, { useState, useCallback, useMemo } from 'react';
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
    name: index === 0 ? 'id' : '',
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
        warnings.push(`Column "${col.name}": Auto-increment is not natively supported in ${dialect}.`);
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

type Step2Tab = 'columns' | 'col_constraints' | 'tbl_constraints' | 'preview';

export const CreateTableWizard: React.FC<CreateTableWizardProps> = ({
  dialect, catalog, defaultDb, onConfirm, onCancel,
}) => {
  const [step, setStep] = useState(1);
  const [step2Tab, setStep2Tab] = useState<Step2Tab>('columns');

  // Step 1 state
  const [tableName, setTableName] = useState('');
  const [selectedDb, setSelectedDb] = useState(defaultDb || 'default');
  const [tableDesc, setTableDesc] = useState('');
  const [step1Error, setStep1Error] = useState('');

  // Step 2 state
  const [columns, setColumns] = useState<ColumnFormRow[]>([freshColumn(0), freshColumn(1)]);
  const [selectedColIdx, setSelectedColIdx] = useState(0);
  const [tableConstraints, setTableConstraints] = useState<TableConstraintForm[]>([]);
  const [rowsToGenerate, setRowsToGenerate] = useState(20);
  const [step2Error, setStep2Error] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const dbNames = catalog.getDatabaseNames();
  const manifest = DIALECT_TYPE_MANIFEST[dialect];

  // List of all existing tables and parent columns for Foreign Key picker
  const allTables = useMemo(() => catalog.getAll().map(e => e.tableName), [catalog]);
  const activeCol = columns[selectedColIdx] || columns[0];

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
      setSelectedColIdx(next.length - 1);
      return next;
    });
  };

  const handleRemoveColumn = (idx: number) => {
    if (columns.length <= 1) return;
    setColumns(prev => prev.filter((_, i) => i !== idx));
    setSelectedColIdx(prev => Math.max(0, prev >= idx ? prev - 1 : prev));
  };

  const hasPk = columns.some(c => c.isPrimaryKey);

  // ── Table Constraint Handlers ────────────────────────────────────────────────
  const handleAddTableConstraint = () => {
    setTableConstraints(prev => [...prev, { type: 'CHECK', expr: '' }]);
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

  // Common input styles
  const inputStyle: React.CSSProperties = {
    background: 'var(--w95-sunken-bg, #fff)',
    color: 'var(--w95-sunken-text, #000)',
    border: '1px solid #808080',
    padding: '2px 4px',
    fontSize: 11,
    fontFamily: 'var(--w95-font)',
    boxSizing: 'border-box',
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 12,
      }}
    >
      <div className="win95-wizard-window">
        {/* Title Bar */}
        <div style={{
          background: 'var(--w95-titlebar-active, #000080)', color: '#fff',
          padding: '4px 8px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', fontWeight: 'bold', fontSize: 11,
          userSelect: 'none', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>📋</span>
            <span>Create New Table — <strong>{dialect} Dialect</strong></span>
          </div>
          <button className="win95-button" style={{ padding: '0 4px', minHeight: 16, fontSize: 10 }} onClick={onCancel} title="Close">✕</button>
        </div>

        {/* Step Indicator Header */}
        <div style={{ display: 'flex', background: 'var(--w95-gray, #c0c0c0)', borderBottom: '1px solid var(--w95-dark-gray,#808080)', flexShrink: 0 }}>
          <div style={{
            flex: 1, padding: '6px 12px', textAlign: 'center', fontSize: 11,
            fontWeight: step === 1 ? 'bold' : 'normal',
            background: step === 1 ? 'var(--w95-light-gray,#e0e0e0)' : 'var(--w95-gray,#c0c0c0)',
            color: step === 1 ? 'var(--w95-titlebar-active,#000080)' : 'var(--w95-text-color,#555)',
            borderBottom: step === 1 ? '2px solid var(--w95-titlebar-active,#000080)' : 'none',
          }}>
            Step 1: Table & Database Details
          </div>
          <div style={{
            flex: 1, padding: '6px 12px', textAlign: 'center', fontSize: 11,
            fontWeight: step === 2 ? 'bold' : 'normal',
            background: step === 2 ? 'var(--w95-light-gray,#e0e0e0)' : 'var(--w95-gray,#c0c0c0)',
            color: step === 2 ? 'var(--w95-titlebar-active,#000080)' : 'var(--w95-text-color,#555)',
            borderBottom: step === 2 ? '2px solid var(--w95-titlebar-active,#000080)' : 'none',
          }}>
            Step 2: Columns, Dialect Constraints & Auto-Data
          </div>
        </div>

        {/* Dialect Warnings Banner */}
        {warnings.length > 0 && step === 2 && (
          <div className="win95-warning-box" style={{ flexShrink: 0, margin: '8px 12px 0' }}>
            {warnings.map((w, idx) => (
              <div key={idx}>⚠️ {w}</div>
            ))}
          </div>
        )}

        {/* Body Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column' }}>

          {/* ── STEP 1: Details ────────────────────────────────────────────── */}
          {step === 1 && (
            <div style={{ maxWidth: 500, margin: '20px auto 0', width: '100%' }}>
              <div className="win95-fieldset">
                <legend>🗄️ Database & Table Configuration</legend>

                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: 3, fontSize: 11 }}>
                    Target Database:
                  </label>
                  <select
                    className="win95-sunken"
                    value={selectedDb}
                    onChange={e => setSelectedDb(e.target.value)}
                    style={{ ...inputStyle, width: '100%' }}
                  >
                    {dbNames.map(db => <option key={db} value={db}>{db}</option>)}
                  </select>
                </div>

                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: 3, fontSize: 11 }}>
                    Table Name:
                  </label>
                  <input
                    type="text"
                    className="win95-sunken"
                    value={tableName}
                    onChange={e => { setTableName(e.target.value); setStep1Error(''); }}
                    placeholder="e.g. employees"
                    style={{ ...inputStyle, width: '100%' }}
                    autoFocus
                    onKeyDown={e => e.key === 'Enter' && handleStep1Next()}
                  />
                </div>

                <div style={{ marginBottom: 8 }}>
                  <label style={{ display: 'block', marginBottom: 3, fontSize: 11 }}>
                    Description / Notes (Optional):
                  </label>
                  <input
                    type="text"
                    className="win95-sunken"
                    value={tableDesc}
                    onChange={e => setTableDesc(e.target.value)}
                    placeholder="e.g. Stores company employee records"
                    style={{ ...inputStyle, width: '100%' }}
                  />
                </div>
              </div>

              {step1Error && (
                <div className="win95-warning-box">
                  ⚠️ {step1Error}
                </div>
              )}

              <div style={{ fontSize: 11, color: 'var(--w95-dark-gray,#666)', marginTop: 12 }}>
                💡 <strong>Next Step:</strong> You will configure columns, data types, constraints, foreign keys, and synthetic data generation.
              </div>
            </div>
          )}

          {/* ── STEP 2: Tabbed Property Sheet ─────────────────────────────── */}
          {step === 2 && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

              {/* Property Sheet Tabs */}
              <div className="win95-wizard-tabs" style={{ flexShrink: 0 }}>
                <button
                  className={`win95-wizard-tab-btn ${step2Tab === 'columns' ? 'active' : ''}`}
                  onClick={() => setStep2Tab('columns')}
                >
                  📋 Columns ({columns.length})
                </button>
                <button
                  className={`win95-wizard-tab-btn ${step2Tab === 'col_constraints' ? 'active' : ''}`}
                  onClick={() => setStep2Tab('col_constraints')}
                >
                  ⚙️ Column Constraints & FKs
                </button>
                <button
                  className={`win95-wizard-tab-btn ${step2Tab === 'tbl_constraints' ? 'active' : ''}`}
                  onClick={() => setStep2Tab('tbl_constraints')}
                >
                  🔒 Table Constraints ({tableConstraints.length})
                </button>
                <button
                  className={`win95-wizard-tab-btn ${step2Tab === 'preview' ? 'active' : ''}`}
                  onClick={() => setStep2Tab('preview')}
                >
                  🎲 Auto-Data & DDL Preview
                </button>
              </div>

              {/* Tab 1: Columns Grid */}
              {step2Tab === 'columns' && (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '10px 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontWeight: 'bold', fontSize: 11 }}>Columns for <em>{tableName}</em>:</span>
                    <button className="win95-button" style={{ padding: '2px 8px', fontSize: 11 }} onClick={handleAddColumn}>
                      + Add Column
                    </button>
                  </div>

                  <div className="win95-inset" style={{ flex: 1, overflowY: 'auto', background: 'var(--w95-sunken-bg,#fff)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                      <thead>
                        <tr style={{ background: 'var(--w95-gray,#c0c0c0)', fontWeight: 'bold', borderBottom: '2px solid var(--w95-dark-gray,#808080)' }}>
                          <th style={{ padding: '3px 4px', textAlign: 'left', width: 30 }}>#</th>
                          <th style={{ padding: '3px 6px', textAlign: 'left' }}>Column Name</th>
                          <th style={{ padding: '3px 6px', textAlign: 'left', width: 210 }}>Data Type ({dialect})</th>
                          <th style={{ padding: '3px 4px', textAlign: 'center', width: 40 }} title="Primary Key">🔑 PK</th>
                          <th style={{ padding: '3px 4px', textAlign: 'center', width: 40 }} title="NOT NULL">NN</th>
                          <th style={{ padding: '3px 4px', textAlign: 'center', width: 40 }} title="UNIQUE">UQ</th>
                          <th style={{ padding: '3px 6px', textAlign: 'left' }}>Default Value</th>
                          <th style={{ padding: '3px 4px', textAlign: 'center', width: 70 }}>Options</th>
                        </tr>
                      </thead>
                      <tbody>
                        {columns.map((col, idx) => (
                          <tr
                            key={idx}
                            style={{
                              background: selectedColIdx === idx ? 'var(--w95-titlebar-active,#000080)' : (idx % 2 === 0 ? 'var(--w95-sunken-bg,#fff)' : 'var(--w95-light-gray,#f5f5f5)'),
                              color: selectedColIdx === idx ? '#fff' : 'var(--w95-sunken-text,#000)',
                            }}
                            onClick={() => setSelectedColIdx(idx)}
                          >
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
                                style={{ padding: '0 4px', fontSize: 10 }}
                                onClick={() => { setSelectedColIdx(idx); setStep2Tab('col_constraints'); }}
                              >
                                ⚙️ FK / Extra
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tab 2: Column Constraints Drawer */}
              {step2Tab === 'col_constraints' && (
                <div style={{ flex: 1, overflowY: 'auto', padding: '10px 0' }}>
                  {/* Active Column Selector bar */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <span style={{ fontWeight: 'bold', fontSize: 11 }}>Configuring Column:</span>
                    <select
                      className="win95-sunken"
                      value={selectedColIdx}
                      onChange={e => setSelectedColIdx(Number(e.target.value))}
                      style={{ ...inputStyle, width: 220, fontWeight: 'bold' }}
                    >
                      {columns.map((c, i) => (
                        <option key={i} value={i}>
                          #{i + 1}: {c.name || '(unnamed)'} [{c.type}]
                        </option>
                      ))}
                    </select>
                  </div>

                  {activeCol && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>

                      {/* Auto-Increment / Serial / Identity */}
                      <div className="win95-fieldset">
                        <legend>🔢 Auto Increment / Identity</legend>
                        {manifest.autoIncrementKeyword ? (
                          <label style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 11, cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={!!activeCol.isAutoIncrement}
                              onChange={e => handleColumnChange(selectedColIdx, { isAutoIncrement: e.target.checked })}
                            />
                            Use <strong>{manifest.autoIncrementKeyword}</strong> ({dialect})
                          </label>
                        ) : (
                          <div style={{ fontSize: 11, color: 'var(--w95-dark-gray,#666)' }}>
                            Auto-increment keyword is not supported directly in {dialect}.
                          </div>
                        )}
                      </div>

                      {/* CHECK Expression */}
                      <div className="win95-fieldset">
                        <legend>✅ CHECK Expression</legend>
                        <input
                          type="text"
                          className="win95-sunken"
                          value={activeCol.checkExpr ?? ''}
                          onChange={e => handleColumnChange(selectedColIdx, { checkExpr: e.target.value })}
                          placeholder={`e.g. ${activeCol.name || 'col'} >= 0 AND ${activeCol.name || 'col'} <= 100`}
                          style={{ ...inputStyle, width: '100%' }}
                        />
                      </div>

                      {/* ENUM / SET values */}
                      {(activeCol.type.includes('ENUM') || activeCol.type.includes('SET')) && (
                        <div className="win95-fieldset" style={{ gridColumn: '1 / -1' }}>
                          <legend>🏷️ ENUM / SET Values</legend>
                          <input
                            type="text"
                            className="win95-sunken"
                            value={(activeCol.enumValues || []).join(', ')}
                            onChange={e => handleColumnChange(selectedColIdx, { enumValues: e.target.value.split(',').map(v => v.trim()).filter(Boolean) })}
                            placeholder="active, inactive, pending, archived"
                            style={{ ...inputStyle, width: '100%' }}
                          />
                          <div style={{ fontSize: 10, color: 'var(--w95-dark-gray,#666)', marginTop: 2 }}>
                            Enter comma-separated values.
                          </div>
                        </div>
                      )}

                      {/* FOREIGN KEY Reference Picker */}
                      <div className="win95-fieldset" style={{ gridColumn: '1 / -1' }}>
                        <legend>🔗 Foreign Key Reference (REFERENCES)</legend>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
                          <div>
                            <div style={{ fontSize: 10, marginBottom: 2 }}>Parent Table:</div>
                            <select
                              className="win95-sunken"
                              value={activeCol.references?.table ?? ''}
                              onChange={e => handleColumnChange(selectedColIdx, { references: { table: e.target.value, column: '', onDelete: 'NO ACTION', onUpdate: 'NO ACTION' } })}
                              style={{ ...inputStyle, width: '100%' }}
                            >
                              <option value="">(none)</option>
                              {allTables.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                          </div>
                          <div>
                            <div style={{ fontSize: 10, marginBottom: 2 }}>Parent Column:</div>
                            <select
                              className="win95-sunken"
                              value={activeCol.references?.column ?? ''}
                              onChange={e => handleColumnChange(selectedColIdx, { references: { ...activeCol.references!, column: e.target.value } })}
                              style={{ ...inputStyle, width: '100%' }}
                              disabled={!activeCol.references?.table}
                            >
                              <option value="">(select column)</option>
                              {parentTableCols.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                          </div>
                          <div>
                            <div style={{ fontSize: 10, marginBottom: 2 }}>ON DELETE:</div>
                            <select
                              className="win95-sunken"
                              value={activeCol.references?.onDelete ?? 'NO ACTION'}
                              onChange={e => handleColumnChange(selectedColIdx, { references: { ...activeCol.references!, onDelete: e.target.value } })}
                              style={{ ...inputStyle, width: '100%' }}
                            >
                              {REFERENTIAL_ACTIONS.map(a => <option key={a} value={a}>{a}</option>)}
                            </select>
                          </div>
                          <div>
                            <div style={{ fontSize: 10, marginBottom: 2 }}>ON UPDATE:</div>
                            <select
                              className="win95-sunken"
                              value={activeCol.references?.onUpdate ?? 'NO ACTION'}
                              onChange={e => handleColumnChange(selectedColIdx, { references: { ...activeCol.references!, onUpdate: e.target.value } })}
                              style={{ ...inputStyle, width: '100%' }}
                            >
                              {REFERENTIAL_ACTIONS.map(a => <option key={a} value={a}>{a}</option>)}
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* GENERATED Column */}
                      <div className="win95-fieldset">
                        <legend>⚡ GENERATED Column (Computed)</legend>
                        <input
                          type="text"
                          className="win95-sunken"
                          value={activeCol.generatedExpr ?? ''}
                          onChange={e => handleColumnChange(selectedColIdx, { generatedExpr: e.target.value })}
                          placeholder="e.g. price * quantity"
                          style={{ ...inputStyle, width: '100%', marginBottom: 4 }}
                        />
                        <select
                          className="win95-sunken"
                          value={activeCol.generatedMode ?? 'STORED'}
                          onChange={e => handleColumnChange(selectedColIdx, { generatedMode: e.target.value as any })}
                          style={{ ...inputStyle }}
                        >
                          <option value="STORED">{manifest.generatedStoredKeyword}</option>
                          {manifest.generatedVirtualSupported && <option value="VIRTUAL">VIRTUAL</option>}
                        </select>
                      </div>

                      {/* Modifiers & Collate */}
                      <div className="win95-fieldset">
                        <legend>🛠️ Modifiers & Collate</legend>
                        <div style={{ display: 'flex', gap: 12, marginBottom: 6 }}>
                          {manifest.constraints['UNSIGNED'] && (
                            <label style={{ fontSize: 11, cursor: 'pointer' }}>
                              <input
                                type="checkbox"
                                checked={!!activeCol.isUnsigned}
                                onChange={e => handleColumnChange(selectedColIdx, { isUnsigned: e.target.checked })}
                              /> UNSIGNED
                            </label>
                          )}
                          {manifest.constraints['ZEROFILL'] && (
                            <label style={{ fontSize: 11, cursor: 'pointer' }}>
                              <input
                                type="checkbox"
                                checked={!!activeCol.isZerofill}
                                onChange={e => handleColumnChange(selectedColIdx, { isZerofill: e.target.checked })}
                              /> ZEROFILL
                            </label>
                          )}
                        </div>
                        <input
                          type="text"
                          className="win95-sunken"
                          value={activeCol.collate ?? ''}
                          onChange={e => handleColumnChange(selectedColIdx, { collate: e.target.value })}
                          placeholder="COLLATE e.g. utf8_general_ci"
                          style={{ ...inputStyle, width: '100%' }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Table-Level Constraints */}
              {step2Tab === 'tbl_constraints' && (
                <div style={{ flex: 1, overflowY: 'auto', padding: '10px 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontWeight: 'bold', fontSize: 11 }}>Table-Level Multi-Column Constraints:</span>
                    <button className="win95-button" style={{ padding: '2px 8px', fontSize: 11 }} onClick={handleAddTableConstraint}>
                      + Add Table Constraint
                    </button>
                  </div>

                  {tableConstraints.map((tc, idx) => (
                    <div key={idx} className="win95-fieldset" style={{ padding: 8, marginBottom: 6 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr 24px', gap: 6, alignItems: 'center' }}>
                        <select
                          className="win95-sunken"
                          value={tc.type}
                          onChange={e => setTableConstraints(prev => prev.map((c, i) => i === idx ? { ...c, type: e.target.value as any } : c))}
                          style={{ ...inputStyle }}
                        >
                          <option value="CHECK">CHECK</option>
                          <option value="UNIQUE">UNIQUE (columns)</option>
                          <option value="PRIMARY_KEY">PRIMARY KEY (columns)</option>
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
                        <button className="win95-button" style={{ padding: 0, width: 22, height: 20, fontSize: 10, color: '#cc0000' }} onClick={() => handleRemoveTableConstraint(idx)}>
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}

                  {tableConstraints.length === 0 && (
                    <div style={{ fontSize: 11, color: 'var(--w95-dark-gray,#666)', padding: '12px 0', textAlign: 'center' }}>
                      No table-level constraints added. Use the button above to add composite keys or checks.
                    </div>
                  )}
                </div>
              )}

              {/* Tab 4: Auto-Data & DDL Preview */}
              {step2Tab === 'preview' && (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, padding: '10px 0' }}>
                  {/* Row Slider Box */}
                  <div className="win95-fieldset">
                    <legend>🎲 Synthetic Data Auto-Population</legend>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 11, fontWeight: 'bold' }}>Number of Rows:</span>
                      <input
                        type="range"
                        min={1}
                        max={25}
                        value={rowsToGenerate}
                        onChange={e => setRowsToGenerate(Number(e.target.value))}
                        style={{ flex: 1, accentColor: 'var(--w95-titlebar-active,#000080)', cursor: 'pointer' }}
                      />
                      <span style={{ minWidth: 30, textAlign: 'right', fontWeight: 'bold', fontSize: 12 }}>{rowsToGenerate}</span>
                      <span style={{ fontSize: 10, background: '#ffe0a0', color: '#664400', padding: '2px 6px', border: '1px solid #c8a000' }}>
                        🔒 Max 25 (Pro)
                      </span>
                    </div>
                  </div>

                  {/* Live DDL Box */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontWeight: 'bold', fontSize: 11 }}>📄 Live DDL Preview ({dialect}):</span>
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
                        fontSize: 11,
                        padding: 8,
                        boxSizing: 'border-box',
                        background: 'var(--w95-sunken-bg,#fff)',
                        color: 'var(--w95-sunken-text,#000)',
                        resize: 'none',
                      }}
                    />
                  </div>
                </div>
              )}

              {step2Error && (
                <div className="win95-warning-box" style={{ flexShrink: 0 }}>
                  ⚠️ {step2Error}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons */}
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
