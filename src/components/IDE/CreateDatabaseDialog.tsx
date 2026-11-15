/**
 * CreateDatabaseDialog.tsx — Authentic Win95-themed modal for creating a new database namespace.
 * Uses high zIndex (1000000) and dark backdrop so it floats on top of all workspace windows.
 */

import React, { useState, useRef, useEffect } from 'react';
import { WindowControls } from '../Win95/WindowControls';

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
        className="win95-window"
        style={{
          width: 440,
          maxWidth: '94vw',
          background: 'var(--w95-gray, #c0c0c0)',
          color: 'var(--w95-text-color, #000000)',
          fontFamily: 'var(--w95-font)',
          fontSize: 12,
          boxShadow: '4px 4px 14px rgba(0,0,0,0.6)',
        }}
        onKeyDown={handleKeyDown}
      >
        {/* Title Bar */}
        <div className="win95-titlebar">
          <div className="win95-titlebar-text">
            <span>🗄️</span>
            <span>Create New Database Namespace</span>
          </div>
          <WindowControls
            showMinimize={false}
            showMaximize={false}
            onClose={onCancel}
          />
        </div>

        {/* Dialog Body */}
        <div style={{ padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
            <span style={{ fontSize: 36, lineHeight: 1 }}>🗄️</span>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: 12, marginBottom: 4 }}>New Database</div>
              <div style={{ color: 'var(--w95-text-color, #000000)', opacity: 0.85, fontSize: 11, lineHeight: 1.4 }}>
                Creates a new database namespace in your session catalog. Tables you build will be organized under this database.
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--w95-dark-gray, #808080)', borderBottom: '1px solid var(--w95-light-gray, #ffffff)', margin: '0 0 14px' }} />

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
                padding: '5px 8px',
                fontSize: 12,
                background: 'var(--w95-sunken-bg, #ffffff)',
                color: 'var(--w95-sunken-text, #000000)',
                border: '1px solid var(--w95-dark-gray, #808080)',
              }}
              maxLength={64}
            />
          </div>

          {error && (
            <div className="win95-warning-box">
              ⚠️ {error}
            </div>
          )}

          <div style={{ fontSize: 10, color: 'var(--w95-text-color, #000000)', opacity: 0.75, marginBottom: 14 }}>
            Identifier rules: Letters, digits, underscores only. Must start with a letter/underscore.
          </div>

          <div style={{ borderTop: '1px solid var(--w95-dark-gray, #808080)', borderBottom: '1px solid var(--w95-light-gray, #ffffff)', margin: '0 0 14px' }} />

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
