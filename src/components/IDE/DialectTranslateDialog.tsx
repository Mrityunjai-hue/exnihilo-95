/**
 * DialectTranslateDialog.tsx — Interactive SQL Dialect Cross-Compiler Modal
 *
 * Windows 95 styled dialog allowing interactive selection of source and target
 * dialects, real-time query transpilation, audit diff, and one-click application
 * to active query tab or new tab.
 */

import React, { useState, useEffect } from 'react';
import {
  translateDialect,
  detectSqlDialect,
  SourceDialect,
  TargetDialect,
  TranslationResult,
} from '../../engine/dialect_translator';
import { Dialect } from '../../engine/parser';
import { WindowControls } from '../Win95/WindowControls';

interface DialectTranslateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentSql: string;
  currentDialect: Dialect;
  onApplyTranslation: (translatedSql: string, newDialect?: Dialect) => void;
  onOpenInNewTab: (translatedSql: string, tabTitle: string, newDialect?: Dialect) => void;
}

export const DialectTranslateDialog: React.FC<DialectTranslateDialogProps> = ({
  isOpen,
  onClose,
  currentSql,
  currentDialect,
  onApplyTranslation,
  onOpenInNewTab,
}) => {
  const [sourceDialect, setSourceDialect] = useState<SourceDialect>('Auto-Detect');
  const [targetDialect, setTargetDialect] = useState<TargetDialect>(() => {
    // Default target dialect to something different than current if possible
    if (currentDialect === 'PostgreSQL') return 'TransactSQL';
    if (currentDialect === 'TransactSQL' || currentDialect === 'SSMS') return 'PostgreSQL';
    if (currentDialect === 'MySQL') return 'PostgreSQL';
    return 'PostgreSQL';
  });
  const [sourceCode, setSourceCode] = useState(currentSql || '');
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [switchActiveDialect, setSwitchActiveDialect] = useState(true);

  // Sync initial query when opened & handle Escape key
  useEffect(() => {
    if (isOpen) {
      setSourceCode(currentSql || '');
      setCopied(false);
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentSql, onClose]);

  // Run translation whenever source code, source dialect, or target dialect changes
  useEffect(() => {
    if (!sourceCode.trim()) {
      setResult(null);
      return;
    }
    const res = translateDialect(sourceCode, targetDialect, sourceDialect);
    setResult(res);
  }, [sourceCode, sourceDialect, targetDialect]);

  if (!isOpen) return null;

  const detection = detectSqlDialect(sourceCode);

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.translatedSql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleApply = () => {
    if (!result) return;
    const newDialect = switchActiveDialect && ['PostgreSQL', 'MySQL', 'SQLite', 'TransactSQL'].includes(targetDialect)
      ? (targetDialect as Dialect)
      : undefined;
    onApplyTranslation(result.translatedSql, newDialect);
    onClose();
  };

  const handleNewTab = () => {
    if (!result) return;
    const newDialect = ['PostgreSQL', 'MySQL', 'SQLite', 'TransactSQL'].includes(targetDialect)
      ? (targetDialect as Dialect)
      : undefined;
    const title = `Translated (${targetDialect}).sql`;
    onOpenInNewTab(result.translatedSql, title, newDialect);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999999,
        padding: '12px',
      }}
      onClick={onClose}
    >
      <div
        className="win95-window"
        style={{
          width: '840px',
          maxWidth: '96vw',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '4px 4px 14px rgba(0,0,0,0.6)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title Bar */}
        <div className="win95-titlebar">
          <div className="win95-titlebar-text">
            <span>🌐</span>
            <span>SQL Dialect Cross-Compiler & Interactive Translator</span>
          </div>
          <WindowControls
            showMinimize={false}
            showMaximize={false}
            onClose={onClose}
          />
        </div>

        {/* Content Body */}
        <div
          style={{
            padding: '10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            overflowY: 'auto',
            flex: 1,
            backgroundColor: 'var(--w95-gray, #c0c0c0)',
            color: 'var(--w95-text-color, #000000)',
          }}
        >
          {/* Information banner */}
          <div
            className="win95-groupbox"
            style={{
              padding: '8px 12px',
              fontSize: '11px',
              backgroundColor: 'var(--w95-light-gray, #e0e0e0)',
              color: 'var(--w95-text-color, #000000)',
              border: '1px solid var(--w95-dark-gray, #808080)',
              lineHeight: 1.45,
            }}
          >
            Translate queries across dialects without manual rewrites. Converts row limits (<code>TOP / LIMIT / ROWNUM</code>),
            null coalescing (<code>ISNULL / IFNULL / NVL / COALESCE</code>), quoting (<code>[col] / `col` / &quot;col&quot;</code>),
            timestamps, and analytic clauses.
          </div>

          {/* Dual Panel Layout: Source (Left) and Target (Right) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '10px',
              minHeight: '260px',
              flex: 1,
            }}
          >
            {/* SOURCE COLUMN */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                minWidth: 0,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px' }}>
                <label style={{ fontSize: '11px', fontWeight: 'bold' }}>
                  Source Dialect:
                </label>
                <select
                  className="win95-select"
                  value={sourceDialect}
                  onChange={(e) => setSourceDialect(e.target.value as SourceDialect)}
                  style={{
                    fontSize: '11px',
                    padding: '2px 6px',
                    background: 'var(--w95-sunken-bg, #ffffff)',
                    color: 'var(--w95-sunken-text, #000000)',
                  }}
                >
                  <option value="Auto-Detect">Auto-Detect ({detection.detectedDialect})</option>
                  <option value="PostgreSQL">PostgreSQL</option>
                  <option value="MySQL">MySQL</option>
                  <option value="SQLite">SQLite</option>
                  <option value="TransactSQL">Transact-SQL (T-SQL)</option>
                  <option value="Oracle">Oracle PL/SQL</option>
                  <option value="Snowflake">Snowflake / BigQuery</option>
                </select>
              </div>

              {sourceDialect === 'Auto-Detect' && (
                <div style={{ fontSize: '10px', color: 'var(--w95-accent-color, var(--w95-titlebar-active, #000080))', fontWeight: 'bold' }}>
                  🔍 Detected: {detection.detectedDialect} ({detection.confidence}% confidence)
                </div>
              )}

              <textarea
                className="win95-field"
                value={sourceCode}
                onChange={(e) => setSourceCode(e.target.value)}
                placeholder="Paste or write query to translate..."
                style={{
                  flex: 1,
                  minHeight: '180px',
                  fontFamily: 'var(--w95-mono, Consolas, monospace)',
                  fontSize: '11px',
                  padding: '8px',
                  resize: 'none',
                  whiteSpace: 'pre-wrap',
                  background: 'var(--w95-sunken-bg, #ffffff)',
                  color: 'var(--w95-sunken-text, #000000)',
                  border: '1px solid var(--w95-dark-gray, #808080)',
                }}
              />
            </div>

            {/* TARGET COLUMN */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                minWidth: 0,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px' }}>
                <label style={{ fontSize: '11px', fontWeight: 'bold' }}>
                  Target Dialect:
                </label>
                <select
                  className="win95-select"
                  value={targetDialect}
                  onChange={(e) => setTargetDialect(e.target.value as TargetDialect)}
                  style={{
                    fontSize: '11px',
                    padding: '2px 6px',
                    background: 'var(--w95-sunken-bg, #ffffff)',
                    color: 'var(--w95-sunken-text, #000000)',
                  }}
                >
                  <option value="PostgreSQL">PostgreSQL</option>
                  <option value="MySQL">MySQL</option>
                  <option value="SQLite">SQLite</option>
                  <option value="TransactSQL">Transact-SQL (T-SQL / SSMS)</option>
                  <option value="Oracle">Oracle SQL</option>
                </select>
              </div>

              <div style={{ fontSize: '10px', color: 'var(--w95-success-color, #1b5e20)', fontWeight: 'bold' }}>
                ⚡ Ready for execution in {targetDialect}
              </div>

              <textarea
                className="win95-field"
                value={result ? result.translatedSql : ''}
                readOnly
                placeholder="Translated query will appear here in real-time..."
                style={{
                  flex: 1,
                  minHeight: '180px',
                  fontFamily: 'var(--w95-mono, Consolas, monospace)',
                  fontSize: '11px',
                  padding: '8px',
                  background: 'var(--w95-sunken-bg, #ffffff)',
                  color: 'var(--w95-sunken-text, #000000)',
                  border: '1px solid var(--w95-dark-gray, #808080)',
                  resize: 'none',
                  whiteSpace: 'pre-wrap',
                }}
              />
            </div>
          </div>

          {/* Audit / Transformation breakdown list */}
          {result && (
            <div
              className="win95-groupbox"
              style={{
                padding: '8px 12px',
                fontSize: '11px',
                maxHeight: '90px',
                overflowY: 'auto',
                background: 'var(--w95-sunken-bg, #ffffff)',
                color: 'var(--w95-sunken-text, #000000)',
                border: '1px solid var(--w95-dark-gray, #808080)',
              }}
            >
              <div style={{ fontWeight: 'bold', marginBottom: '4px', color: 'var(--w95-accent-color, var(--w95-titlebar-active, #000080))' }}>
                Applied Transformations ({result.transformations.length}):
              </div>
              <ul style={{ margin: 0, paddingLeft: '18px' }}>
                {result.transformations.map((t, idx) => (
                  <li key={idx} style={{ color: 'var(--w95-sunken-text, #333333)', marginBottom: '2px' }}>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Options & Dialect sync checkbox */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px' }}>
            <input
              type="checkbox"
              id="chk-switch-dialect"
              checked={switchActiveDialect}
              onChange={(e) => setSwitchActiveDialect(e.target.checked)}
            />
            <label htmlFor="chk-switch-dialect" style={{ cursor: 'pointer' }}>
              Automatically switch IDE active dialect to <strong>{targetDialect}</strong> upon applying
            </label>
          </div>
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: '8px 10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid var(--w95-dark-gray, #808080)',
            backgroundColor: 'var(--w95-gray, #c0c0c0)',
          }}
        >
          <div style={{ fontSize: '11px' }}>
            {copied && <span style={{ color: 'var(--w95-success-color, #1b5e20)', fontWeight: 'bold' }}>✓ Copied to clipboard!</span>}
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              className="win95-button"
              onClick={handleCopy}
              disabled={!result || !result.translatedSql.trim()}
              style={{ padding: '3px 10px', fontSize: '11px' }}
            >
              📋 Copy SQL
            </button>
            <button
              className="win95-button"
              onClick={handleNewTab}
              disabled={!result || !result.translatedSql.trim()}
              style={{ padding: '3px 10px', fontSize: '11px' }}
            >
              ➕ Open in New Tab
            </button>
            <button
              className="win95-button"
              onClick={handleApply}
              disabled={!result || !result.translatedSql.trim()}
              style={{ padding: '3px 12px', fontSize: '11px', fontWeight: 'bold' }}
            >
              💾 Apply to Active Tab
            </button>
            <button
              className="win95-button"
              onClick={onClose}
              style={{ padding: '3px 10px', fontSize: '11px' }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
