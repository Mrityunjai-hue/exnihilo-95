/**
 * CreateDatabaseDialog.tsx — Authentic Win95-themed modal for creating a new database namespace.
 * Uses high zIndex (1000000) and dark backdrop so it floats on top of all workspace windows.
 */

import React, { useState, useRef, useEffect } from 'react';

interface CreateDatabaseDialogProps {
  existingDatabases: string[];
  onConfirm: (dbName: string) => void;
  onCancel: () => void;
}

export const CreateDatabaseDialog: React.FC<CreateDatabaseDialogProps> = ({
  existingDatabases,
  onConfirm,
  onCancel,
}) => {
  const [dbName, setDbName] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const validate = (name: string): string => {
    if (!name.trim()) return 'Database name cannot be empty.';
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name.trim())) return 'Name must start with a letter or underscore, containing only letters, digits, or underscores.';
    if (existingDatabases.map(d => d.toLowerCase()).includes(name.trim().toLowerCase())) return `Database "${name.trim()}" already exists.`;
    if (name.trim().length > 64) return 'Name must be 64 characters or fewer.';
    return '';
  };

  const handleSubmit = () => {
    const trimmed = dbName.trim();
    const err = validate(trimmed);
    if (err) { setError(err); return; }
    onConfirm(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
    if (e.key === 'Escape') onCancel();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000000,
        background: 'rgba(0,0,0,0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div
        className="win95-raised"
        style={{
          width: 420,
          background: 'var(--w95-gray, #c0c0c0)',
          color: 'var(--w95-text-color, #000)',
          fontFamily: 'var(--w95-font)',
          fontSize: 12,
          boxShadow: '4px 4px 10px rgba(0,0,0,0.6)',
          border: '2px solid',
          borderColor: '#ffffff #808080 #808080 #ffffff',
        }}
        onKeyDown={handleKeyDown}
      >
        {/* Title Bar */}
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
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>🗄️</span>
            <span>Create New Database Namespace</span>
          </div>
          <button
            className="win95-button"
            style={{ padding: '0 4px', minHeight: 16, fontSize: 10, lineHeight: '14px' }}
            onClick={onCancel}
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Dialog Body */}
        <div style={{ padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
            <span style={{ fontSize: 36, lineHeight: 1 }}>🗄️</span>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: 12, marginBottom: 4 }}>New Database</div>
              <div style={{ color: 'var(--w95-dark-gray, #444)', fontSize: 11, lineHeight: 1.3 }}>
                Creates a new database namespace in your session catalog. Tables you build will be organized under this database.
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--w95-dark-gray, #808080)', borderBottom: '1px solid #ffffff', margin: '0 0 14px' }} />

          {/* Form field */}
          <div style={{ marginBottom: 10 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold', fontSize: 11 }}>
              Database Name:
            </label>
            <input
              ref={inputRef}
              type="text"
              className="win95-sunken"
              value={dbName}
              onChange={e => { setDbName(e.target.value); setError(''); }}
              placeholder="e.g. sales_db"
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '4px 6px',
                fontSize: 12,
                background: 'var(--w95-sunken-bg, #ffffff)',
                color: 'var(--w95-sunken-text, #000000)',
              }}
              maxLength={64}
            />
          </div>

          {error && (
            <div className="win95-warning-box">
              ⚠️ {error}
            </div>
          )}

          <div style={{ fontSize: 10, color: 'var(--w95-dark-gray, #666)', marginBottom: 14 }}>
            Identifier rules: Letters, digits, underscores only. Must start with a letter/underscore.
          </div>

          <div style={{ borderTop: '1px solid var(--w95-dark-gray, #808080)', borderBottom: '1px solid #ffffff', margin: '0 0 14px' }} />

          {/* Dialog Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button className="win95-button" style={{ minWidth: 80, padding: '4px 12px' }} onClick={onCancel}>
              Cancel
            </button>
            <button
              className="win95-button"
              style={{ minWidth: 130, padding: '4px 12px', fontWeight: 'bold' }}
              onClick={handleSubmit}
              disabled={!dbName.trim()}
            >
              🗄️ Create Database
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
