/**
 * CreateTableWizard.tsx — Two-step Win95-themed wizard for creating user-defined tables.
 *
 * Step 1: Table name + target database selection
 * Step 2: Column definition grid with dialect-aware types & constraints,
 *         table-level constraints, auto-populate row count slider (capped at 25 — premium gate)
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Dialect } from '../../engine/parser';
import { SessionCatalog } from '../../engine/catalog';
import {
  ColumnFormRow,
  TableConstraintForm,
  DIALECT_TYPE_MANIFEST,
  buildCreateTableSql,
} from '../../utils/dbManagerUtils';

// ── Helpers ────────────────────────────────────────────────────────────────────

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

function getWarning(col: ColumnFormRow, dialect: Dialect): string | null {
  const manifest = DIALECT_TYPE_MANIFEST[dialect];
  const baseType = col.type.split('(')[0].replace('...', '').trim().toUpperCase();

  if (col.isAutoIncrement && !manifest.constraints['AUTO_INCREMENT'] && !manifest.constraints['AUTOINCREMENT']) {
    const kw = manifest.autoIncrementKeyword;
    return kw ? `Auto-increment keyword for ${dialect} is ${kw}, not AUTO_INCREMENT.` : `Auto-increment is not directly supported in ${dialect}.`;
  }
  if (baseType === 'ENUM' && !manifest.constraints['ENUM']) {
    return manifest.dialectWarnings?.['ENUM'] ?? `ENUM is not supported in ${dialect}.`;
  }
  if (baseType === 'SET' && !manifest.constraints['SET']) {
    return manifest.dialectWarnings?.['SET'] ?? `SET is not supported in ${dialect}.`;
  }
  if (manifest.dialectWarnings?.[baseType]) return manifest.dialectWarnings[baseType];
  return null;
}

// ── Sub-component: Column Row ──────────────────────────────────────────────────

interface ColumnRowProps {
  col: ColumnFormRow;
  index: number;
  dialect: Dialect;
  catalog: SessionCatalog;
  onChange: (index: number, col: ColumnFormRow) => void;
  onRemove: (index: number) => void;
  expanded: boolean;
  onToggleExpand: (index: number) => void;
  hasPk: boolean;
}

const ColumnRow: React.FC<ColumnRowProps> = ({
  col, index, dialect, catalog, onChange, onRemove, expanded, onToggleExpand, hasPk,
}) => {
  const manifest = DIALECT_TYPE_MANIFEST[dialect];
  const upd = (patch: Partial<ColumnFormRow>) => onChange(index, { ...col, ...patch });
  const warning = getWarning(col, dialect);

  const allTables = catalog.getAll().map(e => e.tableName);
  const refTableCols = col.references?.table
    ? catalog.get(col.references.table)?.schema.columns.map(c => c.name) ?? []
    : [];

  const baseType = col.type.split('(')[0].replace('...', '').replace('...', '').trim().toUpperCase();
  const isEnumLike = baseType === 'ENUM' || baseType === 'SET';
  const isGenerated = col.type.includes('GENERATED');
  const isNumeric = ['TINYINT', 'SMALLINT', 'MEDIUMINT', 'INT', 'BIGINT', 'FLOAT', 'DOUBLE', 'REAL', 'DECIMAL', 'NUMERIC'].includes(baseType);

  const inputStyle: React.CSSProperties = {
    background: 'var(--w95-sunken-bg, #fff)',
    color: 'var(--w95-sunken-text, #000)',
    border: '1px solid #808080',
    padding: '1px 3px',
    fontSize: 11,
    fontFamily: 'var(--w95-font)',
    boxSizing: 'border-box' as const,
  };

  return (
    <div style={{ borderBottom: '1px solid var(--w95-dark-gray, #888)', background: index % 2 === 0 ? 'var(--w95-sunken-bg,#fff)' : 'var(--w95-light-gray,#f0f0f0)' }}>
      {/* Main row */}
      <div style={{ display: 'grid', gridTemplateColumns: '28px 160px 170px 32px 32px 32px 1fr 28px', gap: 2, padding: '3px 4px', alignItems: 'center' }}>
        {/* Expand toggle */}
        <button
          className="win95-button"
          style={{ padding: 0, width: 22, height: 18, fontSize: 9 }}
          onClick={() => onToggleExpand(index)}
          title={expanded ? 'Collapse constraints' : 'Expand constraints'}
        >
          {expanded ? '▲' : '▼'}
        </button>

        {/* Name */}
        <input
          type="text"
          className="win95-sunken"
          value={col.name}
          onChange={e => upd({ name: e.target.value })}
          placeholder="column_name"
          style={{ ...inputStyle, width: '100%' }}
        />

        {/* Type */}
        <select
          className="win95-sunken"
          value={col.type}
          onChange={e => upd({ type: e.target.value, enumValues: [], isAutoIncrement: false })}
          style={{ ...inputStyle, width: '100%' }}
        >
          {manifest.typeGroups.map(g => (
            <optgroup key={g.group} label={`── ${g.group} ──`}>
              {g.types.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </optgroup>
          ))}
        </select>

        {/* PK */}
        <label style={{ textAlign: 'center', cursor: 'pointer', userSelect: 'none' }} title="Primary Key">
          <input
            type="checkbox"
            checked={col.isPrimaryKey}
            onChange={e => upd({ isPrimaryKey: e.target.checked, isUnique: e.target.checked ? false : col.isUnique })}
            disabled={hasPk && !col.isPrimaryKey}
            style={{ accentColor: 'var(--w95-titlebar-active, #000080)' }}
          />
          <div style={{ fontSize: 9 }}>🔑</div>
        </label>

        {/* NOT NULL */}
        <label style={{ textAlign: 'center', cursor: 'pointer', userSelect: 'none' }} title="NOT NULL">
          <input type="checkbox" checked={col.isNotNull} onChange={e => upd({ isNotNull: e.target.checked })} />
          <div style={{ fontSize: 9 }}>NN</div>
        </label>

        {/* UNIQUE */}
        <label style={{ textAlign: 'center', cursor: 'pointer', userSelect: 'none' }} title="UNIQUE">
          <input type="checkbox" checked={col.isUnique} onChange={e => upd({ isUnique: e.target.checked })} disabled={col.isPrimaryKey} />
          <div style={{ fontSize: 9 }}>UQ</div>
        </label>

        {/* Default value quick field */}
        <input
          type="text"
          className="win95-sunken"
          value={col.defaultValue ?? ''}
          onChange={e => upd({ defaultValue: e.target.value })}
          placeholder="DEFAULT..."
          style={{ ...inputStyle, width: '100%' }}
          title="DEFAULT value (optional)"
        />

        {/* Remove */}
        <button
          className="win95-button"
          style={{ padding: 0, width: 22, height: 18, fontSize: 10, color: '#cc0000' }}
          onClick={() => onRemove(index)}
          title="Remove column"
        >
          ✕
        </button>
      </div>

      {/* Warning banner */}
      {warning && (
        <div style={{ padding: '2px 32px', fontSize: 10, background: '#fffbe6', color: '#805500', borderTop: '1px dashed #c8a000' }}>
          ⚠️ {warning}
        </div>
      )}

      {/* Expanded constraint panel */}
      {expanded && (
        <div style={{ padding: '6px 32px 8px', background: 'var(--w95-light-gray,#e8e8e8)', borderTop: '1px solid #aaa', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px' }}>

          {/* AUTO_INCREMENT / IDENTITY */}
          {isNumeric && col.isPrimaryKey && manifest.autoIncrementKeyword && (
            <label style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 11, cursor: 'pointer' }}>
              <input type="checkbox" checked={!!col.isAutoIncrement} onChange={e => upd({ isAutoIncrement: e.target.checked })} />
              Auto-increment ({manifest.autoIncrementKeyword})
            </label>
          )}

          {/* UNSIGNED */}
          {isNumeric && manifest.constraints['UNSIGNED'] && (
            <label style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 11, cursor: 'pointer' }}>
              <input type="checkbox" checked={!!col.isUnsigned} onChange={e => upd({ isUnsigned: e.target.checked })} />
              UNSIGNED
            </label>
          )}

          {/* ZEROFILL */}
          {isNumeric && manifest.constraints['ZEROFILL'] && (
            <label style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 11, cursor: 'pointer' }}>
              <input type="checkbox" checked={!!col.isZerofill} onChange={e => upd({ isZerofill: e.target.checked })} />
              ZEROFILL
            </label>
          )}

          {/* ENUM/SET values */}
          {isEnumLike && manifest.constraints['ENUM'] && (
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ fontSize: 11, fontWeight: 'bold', display: 'block', marginBottom: 2 }}>
                {baseType} Values (comma-separated):
              </label>
              <input
                type="text"
                className="win95-sunken"
                value={(col.enumValues || []).join(', ')}
                onChange={e => upd({ enumValues: e.target.value.split(',').map(v => v.trim()).filter(Boolean) })}
                placeholder="active, inactive, pending"
                style={{ ...inputStyle, width: '100%' }}
              />
            </div>
          )}

          {/* CHECK expr */}
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ fontSize: 11, fontWeight: 'bold', display: 'block', marginBottom: 2 }}>CHECK (expr):</label>
            <input
              type="text"
              className="win95-sunken"
              value={col.checkExpr ?? ''}
              onChange={e => upd({ checkExpr: e.target.value })}
              placeholder={`e.g. ${col.name} >= 0 AND ${col.name} <= 999`}
              style={{ ...inputStyle, width: '100%' }}
            />
          </div>

          {/* GENERATED */}
          {isGenerated && (
            <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: '1fr auto', gap: 6 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 'bold', display: 'block', marginBottom: 2 }}>Generated Expression:</label>
                <input
                  type="text"
                  className="win95-sunken"
                  value={col.generatedExpr ?? ''}
                  onChange={e => upd({ generatedExpr: e.target.value })}
                  placeholder="e.g. price * quantity"
                  style={{ ...inputStyle, width: '100%' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, display: 'block', marginBottom: 2 }}>Mode:</label>
                <select
                  className="win95-sunken"
                  value={col.generatedMode ?? 'STORED'}
                  onChange={e => upd({ generatedMode: e.target.value as 'STORED' | 'VIRTUAL' | 'PERSISTED' })}
                  style={{ ...inputStyle }}
                >
                  <option value="STORED">{manifest.generatedStoredKeyword}</option>
                  {manifest.generatedVirtualSupported && <option value="VIRTUAL">VIRTUAL</option>}
                </select>
              </div>
            </div>
          )}

          {/* FOREIGN KEY reference */}
          {manifest.constraints['FOREIGN_KEY'] && allTables.length > 0 && (
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ fontSize: 11, fontWeight: 'bold', display: 'block', marginBottom: 4 }}>
                🔗 Foreign Key — REFERENCES:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 4 }}>
                <div>
                  <div style={{ fontSize: 10, marginBottom: 1 }}>Parent Table:</div>
                  <select
                    className="win95-sunken"
                    value={col.references?.table ?? ''}
                    onChange={e => upd({ references: { table: e.target.value, column: '', onDelete: 'NO ACTION', onUpdate: 'NO ACTION' } })}
                    style={{ ...inputStyle, width: '100%' }}
                  >
                    <option value="">(none)</option>
                    {allTables.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <div style={{ fontSize: 10, marginBottom: 1 }}>Parent Column:</div>
                  <select
                    className="win95-sunken"
                    value={col.references?.column ?? ''}
                    onChange={e => upd({ references: { ...col.references!, column: e.target.value } })}
                    style={{ ...inputStyle, width: '100%' }}
                    disabled={!col.references?.table}
                  >
                    <option value="">(select column)</option>
                    {refTableCols.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              {col.references?.table && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  <div>
                    <div style={{ fontSize: 10, marginBottom: 1 }}>ON DELETE:</div>
                    <select
                      className="win95-sunken"
                      value={col.references?.onDelete ?? 'NO ACTION'}
                      onChange={e => upd({ references: { ...col.references!, onDelete: e.target.value } })}
                      style={{ ...inputStyle, width: '100%' }}
                    >
                      {REFERENTIAL_ACTIONS.filter(a => {
                        if (a === 'SET DEFAULT' && !manifest.constraints['ON_DELETE_SET_DEFAULT']) return false;
                        if (a === 'RESTRICT' && !manifest.constraints['ON_DELETE_RESTRICT']) return false;
                        return true;
                      }).map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                  {manifest.constraints['ON_UPDATE_CASCADE'] && (
                    <div>
                      <div style={{ fontSize: 10, marginBottom: 1 }}>ON UPDATE:</div>
                      <select
                        className="win95-sunken"
                        value={col.references?.onUpdate ?? 'NO ACTION'}
                        onChange={e => upd({ references: { ...col.references!, onUpdate: e.target.value } })}
                        style={{ ...inputStyle, width: '100%' }}
                      >
                        {REFERENTIAL_ACTIONS.filter(a => {
                          if (a === 'SET DEFAULT' && !manifest.constraints['ON_DELETE_SET_DEFAULT']) return false;
                          if (a === 'RESTRICT' && !manifest.constraints['ON_DELETE_RESTRICT']) return false;
                          return true;
                        }).map(a => <option key={a} value={a}>{a}</option>)}
                      </select>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* COLLATE */}
          {manifest.constraints['COLLATE'] && (
            <div>
              <label style={{ fontSize: 11, display: 'block', marginBottom: 2 }}>COLLATE:</label>
              <input
                type="text"
                className="win95-sunken"
                value={col.collate ?? ''}
                onChange={e => upd({ collate: e.target.value })}
                placeholder="e.g. utf8_general_ci"
                style={{ ...inputStyle, width: '100%' }}
              />
            </div>
          )}

          {/* COMMENT */}
          {manifest.commentSupported && (
            <div>
              <label style={{ fontSize: 11, display: 'block', marginBottom: 2 }}>COMMENT:</label>
              <input
                type="text"
                className="win95-sunken"
                value={col.comment ?? ''}
                onChange={e => upd({ comment: e.target.value })}
                placeholder="Column description..."
                style={{ ...inputStyle, width: '100%' }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ── Main Wizard ────────────────────────────────────────────────────────────────

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
  const [step1Error, setStep1Error] = useState('');

  // Step 2 state
  const [columns, setColumns] = useState<ColumnFormRow[]>([freshColumn(0), freshColumn(1)]);
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});
  const [tableConstraints, setTableConstraints] = useState<TableConstraintForm[]>([]);
  const [rowsToGenerate, setRowsToGenerate] = useState(20);
  const [step2Error, setStep2Error] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const dbNames = catalog.getDatabaseNames();
  const manifest = DIALECT_TYPE_MANIFEST[dialect];

  // Live DDL preview
  const ddlPreview = useCallback(() => {
    if (!tableName.trim() || columns.every(c => !c.name.trim())) return '';
    try {
      return buildCreateTableSql(tableName.trim(), columns.filter(c => c.name.trim()), tableConstraints, dialect);
    } catch {
      return '';
    }
  }, [tableName, columns, tableConstraints, dialect]);

  // ── Step 1 handlers ──────────────────────────────────────────────────────────

  const validateStep1 = () => {
    const t = tableName.trim();
    if (!t) { setStep1Error('Table name is required.'); return false; }
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(t)) { setStep1Error('Table name must start with a letter/underscore and contain only letters, digits, or underscores.'); return false; }
    if (catalog.has(t, selectedDb)) { setStep1Error(`Table "${t}" already exists in "${selectedDb}".`); return false; }
    setStep1Error('');
    return true;
  };

  const handleNext = () => {
    if (validateStep1()) setStep(2);
  };

  // ── Step 2 handlers ──────────────────────────────────────────────────────────

  const handleColumnChange = (idx: number, col: ColumnFormRow) => {
    setColumns(prev => prev.map((c, i) => i === idx ? col : c));
  };

  const handleRemoveColumn = (idx: number) => {
    setColumns(prev => prev.filter((_, i) => i !== idx));
    setExpandedRows(prev => {
      const next: Record<number, boolean> = {};
      Object.keys(prev).forEach(k => {
        const n = parseInt(k);
        if (n < idx) next[n] = prev[n];
        else if (n > idx) next[n - 1] = prev[n];
      });
      return next;
    });
  };

  const handleAddColumn = () => {
    setColumns(prev => [...prev, freshColumn(prev.length)]);
  };

  const hasPk = columns.some(c => c.isPrimaryKey);

  const handleAddTableConstraint = () => {
    setTableConstraints(prev => [...prev, { type: 'CHECK', expr: '' }]);
  };

  const handleRemoveTableConstraint = (idx: number) => {
    setTableConstraints(prev => prev.filter((_, i) => i !== idx));
  };

  const validateStep2 = (): string | null => {
    const validCols = columns.filter(c => c.name.trim());
    if (validCols.length === 0) return 'At least one column with a name is required.';
    const names = validCols.map(c => c.name.trim().toLowerCase());
    if (new Set(names).size !== names.length) return 'Duplicate column names are not allowed.';
    for (const c of validCols) {
      if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(c.name.trim())) return `Column name "${c.name}" is invalid. Use only letters, digits, underscores.`;
    }
    return null;
  };

  const handleCreate = async () => {
    const err = validateStep2();
    if (err) { setStep2Error(err); return; }

    setIsCreating(true);
    const validCols = columns.filter(c => c.name.trim());
    const ddl = buildCreateTableSql(tableName.trim(), validCols, tableConstraints, dialect);
    onConfirm(tableName.trim(), ddl, validCols, selectedDb, rowsToGenerate);
  };

  // ── Styles ────────────────────────────────────────────────────────────────────

  const labelStyle: React.CSSProperties = { fontSize: 11, fontWeight: 'bold', display: 'block', marginBottom: 2 };
  const inputStyle: React.CSSProperties = {
    background: 'var(--w95-sunken-bg, #fff)', color: 'var(--w95-sunken-text, #000)',
    border: '1px solid #808080', padding: '3px 5px', fontSize: 12,
    fontFamily: 'var(--w95-font)', boxSizing: 'border-box', width: '100%',
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.35)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflowY: 'auto',
      }}
    >
      <div
        className="win95-raised"
        style={{
          width: step === 1 ? 420 : 760,
          maxHeight: '92vh',
          display: 'flex', flexDirection: 'column',
          background: 'var(--w95-gray, #c0c0c0)',
          color: 'var(--w95-text-color, #000)',
          fontFamily: 'var(--w95-font)', fontSize: 12,
          boxShadow: '4px 4px 0 0 #000',
        }}
      >
        {/* Title Bar */}
        <div style={{
          background: 'var(--w95-titlebar-active, #000080)', color: '#fff',
          padding: '3px 6px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', fontWeight: 'bold', fontSize: 11,
          userSelect: 'none', flexShrink: 0,
        }}>
          <span>📋 Create New Table — {dialect} Dialect (Step {step} of 2)</span>
          <button className="win95-button" style={{ padding: '0 4px', minHeight: 16, fontSize: 10 }} onClick={onCancel} title="Close">✕</button>
        </div>

        {/* Step Indicator */}
        <div style={{ display: 'flex', gap: 0, flexShrink: 0 }}>
          {[1, 2].map(s => (
            <div
              key={s}
              style={{
                flex: 1, padding: '5px 12px', fontSize: 11, fontWeight: step === s ? 'bold' : 'normal',
                background: step === s ? 'var(--w95-light-gray, #e0e0e0)' : 'var(--w95-gray, #c0c0c0)',
                borderBottom: step === s ? '2px solid var(--w95-titlebar-active, #000080)' : '2px solid transparent',
                textAlign: 'center', color: step === s ? 'var(--w95-titlebar-active, #000080)' : 'var(--w95-text-color, #555)',
              }}
            >
              {s === 1 ? '① Table Details' : '② Column Definitions'}
            </div>
          ))}
        </div>

        {/* Body — scrollable */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>

          {/* ─── STEP 1 ─────────────────────────────────────────────────────── */}
          {step === 1 && (
            <div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 14 }}>
                <span style={{ fontSize: 32 }}>📋</span>
                <div>
                  <div style={{ fontWeight: 'bold', marginBottom: 2 }}>New Table — Details</div>
                  <div style={{ fontSize: 11, color: 'var(--w95-dark-gray,#555)' }}>
                    Choose a name and target database for your new table. Columns are defined in the next step.
                  </div>
                </div>
              </div>

              <div className="win95-inset" style={{ height: 2, margin: '0 0 12px' }} />

              <div style={{ marginBottom: 10 }}>
                <label style={labelStyle}>Target Database:</label>
                <select className="win95-sunken" value={selectedDb} onChange={e => setSelectedDb(e.target.value)} style={inputStyle}>
                  {dbNames.map(db => <option key={db} value={db}>{db}</option>)}
                </select>
              </div>

              <div style={{ marginBottom: 10 }}>
                <label style={labelStyle}>Table Name:</label>
                <input
                  type="text"
                  className="win95-sunken"
                  value={tableName}
                  onChange={e => { setTableName(e.target.value); setStep1Error(''); }}
                  placeholder="e.g. employees"
                  style={inputStyle}
                  onKeyDown={e => e.key === 'Enter' && handleNext()}
                  autoFocus
                />
              </div>

              {step1Error && (
                <div style={{ background: '#ffffcc', border: '1px solid #cc9900', padding: '4px 6px', fontSize: 11, marginBottom: 8, color: '#663300' }}>
                  ⚠️ {step1Error}
                </div>
              )}

              <div style={{ fontSize: 10, color: 'var(--w95-dark-gray,#808080)', marginBottom: 8 }}>
                💡 Tip: Columns, types, and constraints are configured in Step 2. Data will be auto-generated.
              </div>
            </div>
          )}

          {/* ─── STEP 2 ─────────────────────────────────────────────────────── */}
          {step === 2 && (
            <div>
              {/* Column grid header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontWeight: 'bold', fontSize: 11 }}>📄 Columns for <em>{tableName}</em></span>
                <button className="win95-button" style={{ padding: '1px 8px', fontSize: 11 }} onClick={handleAddColumn}>
                  + Add Column
                </button>
              </div>

              {/* Grid header row */}
              <div className="win95-inset" style={{ overflowX: 'auto', marginBottom: 8 }}>
                <div style={{
                  display: 'grid', gridTemplateColumns: '28px 160px 170px 32px 32px 32px 1fr 28px',
                  gap: 2, padding: '2px 4px',
                  background: 'var(--w95-gray,#c0c0c0)', fontWeight: 'bold', fontSize: 10,
                  borderBottom: '2px solid var(--w95-dark-gray,#808080)',
                }}>
                  <div />
                  <div>Column Name</div>
                  <div>Data Type</div>
                  <div style={{ textAlign: 'center' }}>PK</div>
                  <div style={{ textAlign: 'center' }}>NN</div>
                  <div style={{ textAlign: 'center' }}>UQ</div>
                  <div>Default Value</div>
                  <div />
                </div>

                {/* Column rows */}
                {columns.map((col, idx) => (
                  <ColumnRow
                    key={idx}
                    col={col}
                    index={idx}
                    dialect={dialect}
                    catalog={catalog}
                    onChange={handleColumnChange}
                    onRemove={handleRemoveColumn}
                    expanded={!!expandedRows[idx]}
                    onToggleExpand={i => setExpandedRows(prev => ({ ...prev, [i]: !prev[i] }))}
                    hasPk={hasPk}
                  />
                ))}
              </div>

              {/* Table-level Constraints */}
              <div style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontWeight: 'bold', fontSize: 11 }}>🔒 Table-Level Constraints</span>
                  <button className="win95-button" style={{ padding: '1px 8px', fontSize: 11 }} onClick={handleAddTableConstraint}>
                    + Add Constraint
                  </button>
                </div>

                {tableConstraints.map((tc, idx) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 24px', gap: 4, marginBottom: 4, alignItems: 'center' }}>
                    <select
                      className="win95-sunken"
                      value={tc.type}
                      onChange={e => setTableConstraints(prev => prev.map((c, i) => i === idx ? { ...c, type: e.target.value as TableConstraintForm['type'] } : c))}
                      style={{ background: 'var(--w95-sunken-bg,#fff)', color: 'var(--w95-sunken-text,#000)', border: '1px solid #808080', padding: '2px 3px', fontSize: 11 }}
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
                      style={{ background: 'var(--w95-sunken-bg,#fff)', color: 'var(--w95-sunken-text,#000)', border: '1px solid #808080', padding: '2px 4px', fontSize: 11 }}
                    />
                    <button className="win95-button" style={{ padding: 0, width: 22, height: 20, fontSize: 10, color: '#cc0000' }} onClick={() => handleRemoveTableConstraint(idx)}>✕</button>
                  </div>
                ))}

                {tableConstraints.length === 0 && (
                  <div style={{ fontSize: 10, color: 'var(--w95-dark-gray,#808080)', padding: '4px 0' }}>
                    No table-level constraints. Column-level constraints (CHECK, UNIQUE, FK) are set per-column via ▼.
                  </div>
                )}
              </div>

              {/* Row count slider */}
              <div className="win95-inset" style={{ padding: '8px 10px', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 11, fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                    🎲 Auto-populate rows:
                  </span>
                  <input
                    type="range"
                    min={1}
                    max={25}
                    value={rowsToGenerate}
                    onChange={e => setRowsToGenerate(Number(e.target.value))}
                    style={{ flex: 1, accentColor: 'var(--w95-titlebar-active,#000080)', cursor: 'pointer' }}
                  />
                  <span style={{ minWidth: 28, textAlign: 'right', fontWeight: 'bold' }}>{rowsToGenerate}</span>
                  <span style={{ fontSize: 10, color: 'var(--w95-dark-gray,#888)', padding: '1px 5px', background: 'var(--w95-light-gray,#d0d0d0)', border: '1px solid #aaa' }}>
                    🔒 Max 25
                  </span>
                </div>
                <div style={{ fontSize: 10, color: 'var(--w95-dark-gray,#808080)', marginTop: 3 }}>
                  Realistic synthetic data will be auto-generated using the ExNihilo engine. More rows available in Pro.
                </div>
              </div>

              {/* DDL Preview */}
              <div>
                <div style={{ fontWeight: 'bold', fontSize: 10, marginBottom: 2 }}>📄 DDL Preview ({dialect}):</div>
                <div className="win95-inset" style={{ padding: 6, background: 'var(--w95-sunken-bg,#fff)', color: 'var(--w95-sunken-text,#000)', fontSize: 10, fontFamily: 'var(--w95-mono)', whiteSpace: 'pre-wrap', maxHeight: 100, overflowY: 'auto' }}>
                  {ddlPreview() || '(fill in column names to preview DDL)'}
                </div>
              </div>

              {step2Error && (
                <div style={{ background: '#ffffcc', border: '1px solid #cc9900', padding: '4px 6px', fontSize: 11, marginTop: 8, color: '#663300' }}>
                  ⚠️ {step2Error}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Buttons */}
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
              <button className="win95-button" style={{ minWidth: 80, fontWeight: 'bold' }} onClick={handleNext}>
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
