/**
 * Toolbar.tsx — Windows 95 IDE Action Toolbar
 */

import React from 'react';
import { Dialect } from '../../engine/parser';

interface ToolbarProps {
  dialect:          Dialect;
  onDialectChange:  (dialect: Dialect) => void;
  onRun:            () => void;
  onReset:          () => void;
  onOpenHelp:       () => void;
  onOpenSettings:   () => void;
  onStartTour:      () => void;
  isLoading:        boolean;
  hasSelection?:    boolean;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  dialect,
  onDialectChange,
  onRun,
  onReset,
  onOpenHelp,
  onOpenSettings,
  onStartTour,
  isLoading,
  hasSelection = false,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '3px 4px',
        background: '#c0c0c0',
        borderBottom: '1px solid #808080',
        gap: '6px',
        flexWrap: 'wrap',
      }}
    >
      {/* Left Action Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <button
          id="btn-run"
          className="win95-button"
          style={{
            fontWeight: 'bold',
            color: hasSelection ? '#800080' : '#006600',
            background: hasSelection ? '#f0e6f6' : undefined,
          }}
          onClick={onRun}
          disabled={isLoading}
          title={hasSelection ? 'Execute Selected Query (F5 or Ctrl+Enter)' : 'Execute All Queries (F5 or Ctrl+Enter)'}
        >
          <span>▶</span>
          <span>{hasSelection ? 'Run Selection (F5)' : 'Run (F5)'}</span>
        </button>

        <button
          id="btn-reset"
          className="win95-button"
          onClick={onReset}
          disabled={isLoading}
          title="Clear database and reset catalog"
        >
          <span>🔄</span>
          <span>Reset Schema</span>
        </button>

        {/* Dialect Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '6px' }}>
          <label htmlFor="dialect-select" style={{ fontSize: '11px', fontWeight: 'bold' }}>
            Dialect:
          </label>
          <select
            id="dialect-select"
            className="win95-sunken"
            value={dialect}
            onChange={(e) => onDialectChange(e.target.value as Dialect)}
            style={{ padding: '2px 4px', fontSize: '11px', height: '22px' }}
          >
            <option value="MySQL">MySQL</option>
            <option value="PostgreSQL">PostgreSQL</option>
            <option value="SQLite">SQLite</option>
            <option value="SSMS">SSMS (Transact-SQL)</option>
          </select>
        </div>
      </div>

      {/* Right Helper Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <button
          id="btn-help"
          className="win95-button"
          onClick={onOpenHelp}
          title="Open SQL Query Tutorial & Guide"
        >
          <span>📖</span>
          <span>Help / Tutorial</span>
        </button>

        <button
          id="btn-tour"
          className="win95-button"
          onClick={onStartTour}
          title="Start Guided Tour"
        >
          <span>💡</span>
          <span>Tour</span>
        </button>

        <button
          id="btn-options"
          className="win95-button"
          onClick={onOpenSettings}
          title="Options & Preferences"
        >
          <span>⚙️</span>
          <span>Options</span>
        </button>
      </div>
    </div>
  );
};
