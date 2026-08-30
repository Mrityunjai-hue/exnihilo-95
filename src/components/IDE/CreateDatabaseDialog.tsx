/**
 * CreateDatabaseDialog.tsx — Win95-themed modal for creating a new database namespace
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
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name.trim())) return 'Name must start with a letter/underscore and contain only letters, digits, or underscores.';
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
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.35)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div
        className="win95-raised"
        style={{
          width: 380,
          background: 'var(--w95-gray, #c0c0c0)',
          color: 'var(--w95-text-color, #000)',
          fontFamily: 'var(--w95-font)',
          fontSize: 12,
          boxShadow: '4px 4px 0 0 #000',
        }}
        onKeyDown={handleKeyDown}
      >
        {/* Title Bar */}
        <div style={{
          background: 'var(--w95-titlebar-active, #000080)',
          color: '#fff',
          padding: '3px 6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontWeight: 'bold',
          fontSize: 11,
          userSelect: 'none',
        }}>
          <span>🗄️ Create New Database</span>
          <button
            className="win95-button"
            style={{ padding: '0 4px', minHeight: 16, fontSize: 10, lineHeight: '14px' }}
            onClick={onCancel}
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '16px 16px 12px' }}>
          {/* Icon + prompt row */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
            <span style={{ fontSize: 32, lineHeight: 1 }}>🗄️</span>
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: 4 }}>New Database</div>
              <div style={{ color: 'var(--w95-dark-gray, #555)', fontSize: 11 }}>
                Creates a new database namespace in the current session. Tables you create here will be organized under this database.
              </div>
            </div>
          </div>

          {/* Separator */}
          <div className="win95-inset" style={{ height: 2, margin: '0 0 12px', background: 'transparent' }} />

          {/* Name field */}
          <div style={{ marginBottom: 4 }}>
            <label style={{ display: 'block', marginBottom: 3, fontWeight: 'bold', fontSize: 11 }}>
              Database Name:
            </label>
            <input
              ref={inputRef}
              type="text"
              className="win95-sunken"
              value={dbName}
              onChange={e => { setDbName(e.target.value); setError(''); }}
              placeholder="e.g. company_db"
              style={{
                width: '100%', boxSizing: 'border-box',
                padding: '3px 5px', fontSize: 12,
                background: 'var(--w95-sunken-bg, #fff)',
                color: 'var(--w95-sunken-text, #000)',
              }}
              maxLength={64}
            />
          </div>

          {/* Error message */}
          {error && (
            <div style={{
              background: '#ffffcc', border: '1px solid #cc9900',
              padding: '4px 6px', fontSize: 11, marginBottom: 8, color: '#663300',
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Hint */}
          <div style={{ fontSize: 10, color: 'var(--w95-dark-gray, #808080)', marginBottom: 14 }}>
            Allowed: letters, digits, underscores. Must start with a letter or underscore.
          </div>

          {/* Separator */}
          <div className="win95-inset" style={{ height: 2, margin: '0 0 12px', background: 'transparent' }} />

          {/* Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
            <button className="win95-button" style={{ minWidth: 75 }} onClick={onCancel}>
              Cancel
            </button>
            <button
              className="win95-button"
              style={{ minWidth: 120, fontWeight: 'bold' }}
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
