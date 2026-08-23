/**
 * SettingsDialog.tsx — Windows 95 Options & Control Panel Dialog
 */

import React, { useState } from 'react';
import { Dialect } from '../../engine/parser';
import { useDraggable } from '../../hooks/useDraggable';

interface SettingsDialogProps {
  isOpen:         boolean;
  zIndex:         number;
  currentDialect: Dialect;
  rowsPerTable:   number;
  tableCap:       number;
  onSave:         (rows: number, cap: number, dialect: Dialect) => void;
  onClose:        () => void;
  onFocus:        () => void;
}

export const SettingsDialog: React.FC<SettingsDialogProps> = ({
  isOpen,
  zIndex,
  currentDialect,
  rowsPerTable,
  tableCap,
  onSave,
  onClose,
  onFocus,
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'engine' | 'about'>('general');
  const [localRows, setLocalRows] = useState<number>(rowsPerTable);
  const [localCap, setLocalCap] = useState<number>(tableCap);
  const [localDialect, setLocalDialect] = useState<Dialect>(currentDialect);
  const { position, handleMouseDown } = useDraggable({ x: 220, y: 110 });

  if (!isOpen) return null;

  const handleApply = () => {
    onSave(localRows, localCap, localDialect);
  };

  const handleOk = () => {
    handleApply();
    onClose();
  };

  return (
    <div
      className="win95-window"
      style={{
        position: 'absolute',
        top: `${position.y}px`,
        left: `${position.x}px`,
        width: '420px',
        zIndex,
      }}
      onMouseDown={onFocus}
    >
      {/* Titlebar with Drag Handler */}
      <div
        className="win95-titlebar"
        onMouseDown={(e) => {
          onFocus();
          handleMouseDown(e);
        }}
        style={{ cursor: 'move' }}
      >
        <div className="win95-titlebar-text">
          <span>⚙️</span>
          <span>ExNihilo Settings & Options</span>
        </div>
        <div className="win95-titlebar-controls">
          <button className="win95-btn-titlebar" onMouseDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); onClose(); }}>✕</button>
        </div>
      </div>

      {/* Dialog Body */}
      <div style={{ padding: '8px' }}>
        {/* Tabs */}
        <div className="win95-tabs">
          <div
            className={`win95-tab ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            General
          </div>
          <div
            className={`win95-tab ${activeTab === 'engine' ? 'active' : ''}`}
            onClick={() => setActiveTab('engine')}
          >
            Engine
          </div>
          <div
            className={`win95-tab ${activeTab === 'about' ? 'active' : ''}`}
            onClick={() => setActiveTab('about')}
          >
            About
          </div>
        </div>

        {/* Tab Content Panel */}
        <div
          className="win95-inset"
          style={{ padding: '16px', background: '#c0c0c0', minHeight: '180px' }}
        >
          {activeTab === 'general' && (
            <div>
              <fieldset style={{ border: '1px solid #808080', padding: '10px', marginBottom: '12px' }}>
                <legend style={{ padding: '0 4px', fontSize: '11px', fontWeight: 'bold' }}>
                  Synthetic Data Limits
                </legend>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label htmlFor="rowsPerTable">Rows per generated table:</label>
                  <input
                    id="rowsPerTable"
                    type="number"
                    min="1"
                    max="100"
                    value={localRows}
                    onChange={(e) => setLocalRows(Number(e.target.value) || 20)}
                    className="win95-sunken"
                    style={{ width: '60px', padding: '2px 4px', fontSize: '11px' }}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label htmlFor="tableCap">Max tables per session:</label>
                  <input
                    id="tableCap"
                    type="number"
                    min="5"
                    max="50"
                    value={localCap}
                    onChange={(e) => setLocalCap(Number(e.target.value) || 25)}
                    className="win95-sunken"
                    style={{ width: '60px', padding: '2px 4px', fontSize: '11px' }}
                  />
                </div>
              </fieldset>

              <fieldset style={{ border: '1px solid #808080', padding: '10px' }}>
                <legend style={{ padding: '0 4px', fontSize: '11px', fontWeight: 'bold' }}>
                  Default SQL Dialect
                </legend>
                <select
                  value={localDialect}
                  onChange={(e) => setLocalDialect(e.target.value as Dialect)}
                  className="win95-sunken"
                  style={{ width: '100%', padding: '3px', fontSize: '11px' }}
                >
                  <option value="MySQL">MySQL (Default)</option>
                  <option value="PostgreSQL">PostgreSQL</option>
                  <option value="SQLite">SQLite</option>
                  <option value="SSMS">SSMS (Transact-SQL)</option>
                </select>
              </fieldset>
            </div>
          )}

          {activeTab === 'engine' && (
            <div>
              <fieldset style={{ border: '1px solid #808080', padding: '10px' }}>
                <legend style={{ padding: '0 4px', fontSize: '11px', fontWeight: 'bold' }}>
                  Execution Engine Details
                </legend>
                <p style={{ margin: '4px 0', fontSize: '11px' }}>
                  <strong>Runtime:</strong> WebAssembly In-Browser (sql.js v1.14.2)
                </p>
                <p style={{ margin: '4px 0', fontSize: '11px' }}>
                  <strong>SQLite Kernel:</strong> 3.49.1 (Full Join & Right Join enabled)
                </p>
                <p style={{ margin: '4px 0', fontSize: '11px' }}>
                  <strong>Parser:</strong> node-sql-parser v5.4.0
                </p>
                <p style={{ margin: '4px 0', fontSize: '11px' }}>
                  <strong>Data Generator:</strong> @faker-js/faker (deterministic hash seed)
                </p>
              </fieldset>
            </div>
          )}

          {activeTab === 'about' && (
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <div style={{ fontSize: '32px', marginBottom: '6px' }}>🗄️</div>
              <strong style={{ fontSize: '13px' }}>ExNihilo for Windows 95</strong>
              <div style={{ fontSize: '11px', color: '#333', margin: '4px 0' }}>Version 1.0 (Build 950)</div>
              <div style={{ fontSize: '11px', color: '#000080', marginTop: '10px' }}>
                <strong>Built by:</strong>{' '}
                <a
                  href="https://github.com/Mrityunjai-hue"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#0000ee', fontWeight: 'bold' }}
                >
                  Mrityunjai
                </a>
              </div>
              <div style={{ fontSize: '11px', marginTop: '4px' }}>
                <strong>Powered by:</strong>{' '}
                <a
                  href="https://n8n-ds-community.netlify.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#0000ee', fontWeight: 'bold' }}
                >
                  N8N Data Science Community
                </a>{' '}
                using AI
              </div>
              <div style={{ fontSize: '10px', color: '#666', marginTop: '12px' }}>
                Zero-config in-browser SQL IDE with automatic schema inference and synthetic data generation.
              </div>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
          <button className="win95-button" style={{ minWidth: '70px' }} onClick={handleOk}>
            OK
          </button>
          <button className="win95-button" style={{ minWidth: '70px' }} onClick={onClose}>
            Cancel
          </button>
          <button className="win95-button" style={{ minWidth: '70px' }} onClick={handleApply}>
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};
