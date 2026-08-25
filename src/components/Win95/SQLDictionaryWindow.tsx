/**
 * SQLDictionaryWindow.tsx — Authentic Windows 95 SQL Dictionary & Dialect Reference
 */

import React, { useState, useMemo } from 'react';
import { useDraggable } from '../../hooks/useDraggable';
import { WindowControls } from './WindowControls';
import {
  SQL_DICTIONARY_ITEMS,
  DIALECT_METADATA,
  DialectName,
  CommandCategory,
} from '../../data/dialectCommands';

interface SQLDictionaryWindowProps {
  isOpen: boolean;
  isMinimized: boolean;
  zIndex: number;
  onClose: () => void;
  onMinimize: () => void;
  onFocus: () => void;
  onTryInIde: (query: string, dialect: DialectName) => void;
}

export const SQLDictionaryWindow: React.FC<SQLDictionaryWindowProps> = ({
  isOpen,
  isMinimized,
  zIndex,
  onClose,
  onMinimize,
  onFocus,
  onTryInIde,
}) => {
  const { position, handleMouseDown } = useDraggable({ x: 90, y: 40 });
  const [isMaximized, setIsMaximized] = useState(false);
  const [selectedDialect, setSelectedDialect] = useState<DialectName | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'supported' | 'coming_soon'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories: CommandCategory[] = [
    'Null Handling',
    'String Functions',
    'Date & Time',
    'JSON & Semi-Structured',
    'Aggregate & Math',
    'DML & Querying',
    'DDL & Schema',
    'Advanced & Windowing',
  ];

  // Filter dictionary items
  const filteredItems = useMemo(() => {
    return SQL_DICTIONARY_ITEMS.filter((item) => {
      // Dialect filter
      if (selectedDialect !== 'ALL' && !item.dialects.includes(selectedDialect)) {
        return false;
      }
      // Status filter
      if (statusFilter !== 'ALL' && item.status !== statusFilter) {
        return false;
      }
      // Category filter
      if (categoryFilter !== 'ALL' && item.category !== categoryFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = item.command.toLowerCase().includes(q);
        const matchSyntax = item.syntax.toLowerCase().includes(q);
        const matchDesc = item.description.toLowerCase().includes(q);
        const matchNotes = item.notes?.toLowerCase().includes(q);
        if (!matchName && !matchSyntax && !matchDesc && !matchNotes) {
          return false;
        }
      }
      return true;
    });
  }, [selectedDialect, statusFilter, categoryFilter, searchQuery]);

  const handleCopyCode = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen) return null;

  const windowStyle: React.CSSProperties = isMaximized
    ? {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: 'calc(100vh - 36px)',
        zIndex,
        display: isMinimized ? 'none' : 'flex',
        flexDirection: 'column',
      }
    : {
        position: 'absolute',
        top: `${position.y}px`,
        left: `${position.x}px`,
        width: '820px',
        height: '560px',
        maxHeight: '90vh',
        maxWidth: '96vw',
        zIndex,
        display: isMinimized ? 'none' : 'flex',
        flexDirection: 'column',
      };

  return (
    <div className="win95-window" style={windowStyle} onMouseDown={onFocus}>
      {/* ── Title Bar ────────────────────────────────────────────────────── */}
      <div
        className="win95-titlebar"
        onMouseDown={(e) => {
          onFocus();
          handleMouseDown(e);
        }}
        style={{ cursor: 'move' }}
      >
        <div className="win95-titlebar-text">
          <span>📖</span>
          <span>SQL Dictionary & Dialect Reference (ExNihilo 95)</span>
        </div>
        <WindowControls
          onMinimize={onMinimize}
          onMaximize={() => setIsMaximized((prev) => !prev)}
          isMaximized={isMaximized}
          onClose={onClose}
        />
      </div>

      {/* ── Top Header & Dialect Tabs ─────────────────────────────────────── */}
      <div style={{ background: '#c0c0c0', padding: '6px 8px', borderBottom: '1px solid #808080' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', fontSize: '11px' }}>
          <div>
            <strong style={{ color: '#000080' }}>SQL Command Matrix:</strong> Select a dialect tab to explore commands, view support status (✅ Supported vs ⏳ Coming Soon), and test examples.
          </div>
          <div style={{ background: '#e0e0e0', padding: '2px 6px', border: '1px solid #808080', fontWeight: 'bold' }}>
            {filteredItems.length} / {SQL_DICTIONARY_ITEMS.length} Commands
          </div>
        </div>

        {/* Dialect Tabs */}
        <div style={{ display: 'flex', gap: '2px', borderBottom: '2px solid #808080', paddingTop: '4px' }}>
          <button
            type="button"
            onClick={() => setSelectedDialect('ALL')}
            className={`win95-button ${selectedDialect === 'ALL' ? 'pressed' : ''}`}
            style={{
              fontSize: '11px',
              padding: '2px 10px',
              fontWeight: selectedDialect === 'ALL' ? 'bold' : 'normal',
              color: selectedDialect === 'ALL' ? '#000080' : '#000000',
            }}
          >
            🌐 All Dialects
          </button>
          {(Object.keys(DIALECT_METADATA) as DialectName[]).map((dialect) => {
            const meta = DIALECT_METADATA[dialect];
            const isSelected = selectedDialect === dialect;
            return (
              <button
                key={dialect}
                type="button"
                onClick={() => setSelectedDialect(dialect)}
                className={`win95-button ${isSelected ? 'pressed' : ''}`}
                style={{
                  fontSize: '11px',
                  padding: '2px 10px',
                  fontWeight: isSelected ? 'bold' : 'normal',
                  color: isSelected ? '#000080' : '#000000',
                }}
              >
                {meta.icon} {dialect}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Filters Bar ────────────────────────────────────────────────────── */}
      <div style={{ background: '#d4d0c8', padding: '6px 8px', borderBottom: '1px solid #ffffff', display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', fontSize: '11px' }}>
        {/* Status Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#c0c0c0', padding: '2px 4px', border: '1px solid #808080' }}>
          <strong style={{ color: '#555' }}>Status:</strong>
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className={`win95-button ${statusFilter === 'ALL' ? 'pressed' : ''}`}
            style={{ fontSize: '10px', padding: '1px 6px' }}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('supported')}
            className={`win95-button ${statusFilter === 'supported' ? 'pressed' : ''}`}
            style={{ fontSize: '10px', padding: '1px 6px', color: statusFilter === 'supported' ? '#008000' : '#000' }}
          >
            ✅ Supported
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('coming_soon')}
            className={`win95-button ${statusFilter === 'coming_soon' ? 'pressed' : ''}`}
            style={{ fontSize: '10px', padding: '1px 6px', color: statusFilter === 'coming_soon' ? '#808000' : '#000' }}
          >
            ⏳ Coming Soon
          </button>
        </div>

        {/* Category Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <strong>Category:</strong>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ background: '#fff', border: '1px solid #808080', padding: '2px 4px', fontSize: '11px' }}
          >
            <option value="ALL">All Categories ({categories.length})</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Search Input */}
        <div style={{ flex: 1, minWidth: '180px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <strong>🔍 Search:</strong>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Type function or command name..."
            style={{ flex: 1, background: '#fff', border: '1px solid #808080', padding: '2px 6px', fontSize: '11px', fontFamily: 'var(--w95-mono)' }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="win95-button"
              style={{ fontSize: '10px', padding: '1px 5px' }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* ── Commands Content Grid ─────────────────────────────────────────── */}
      <div
        className="win95-inset"
        style={{ flex: 1, overflowY: 'auto', padding: '8px', background: '#ffffff' }}
      >
        {filteredItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px', color: '#666' }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>🔍</div>
            <strong>No matching SQL commands found</strong>
            <div style={{ fontSize: '11px', marginTop: '4px' }}>Try clearing your search query or selecting "All Dialects".</div>
            <button
              type="button"
              onClick={() => {
                setSelectedDialect('ALL');
                setStatusFilter('ALL');
                setCategoryFilter('ALL');
                setSearchQuery('');
              }}
              className="win95-button"
              style={{ marginTop: '12px', padding: '4px 12px', fontWeight: 'bold' }}
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '8px' }}>
            {filteredItems.map((item) => {
              const isSupported = item.status === 'supported';
              const targetDialect = selectedDialect !== 'ALL' ? selectedDialect : item.dialects[0];

              return (
                <div
                  key={item.id}
                  className="win95-window"
                  style={{
                    padding: '8px',
                    background: '#f8f9fa',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    {/* Header: Command Name & Status */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '4px', marginBottom: '4px' }}>
                      <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#000080', fontFamily: 'var(--w95-mono)' }}>
                        {item.command}
                      </div>

                      {isSupported ? (
                        <span style={{ background: '#e6f4ea', color: '#137333', border: '1px solid #a8dab5', padding: '1px 6px', fontSize: '10px', fontWeight: 'bold' }}>
                          ✅ Executable
                        </span>
                      ) : (
                        <span style={{ background: '#fef7e0', color: '#b06000', border: '1px solid #fde293', padding: '1px 6px', fontSize: '10px', fontWeight: 'bold' }}>
                          ⏳ Coming Soon
                        </span>
                      )}
                    </div>

                    {/* Category & Dialect Badges */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '6px' }}>
                      <span style={{ background: '#e8eaed', color: '#3c4043', padding: '1px 5px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {item.category}
                      </span>
                      {item.dialects.map((d) => (
                        <span key={d} style={{ background: '#000080', color: '#ffffff', padding: '1px 5px', fontSize: '10px', fontWeight: 'bold' }}>
                          {DIALECT_METADATA[d]?.icon} {d}
                        </span>
                      ))}
                    </div>

                    {/* Syntax Code Block */}
                    <div style={{ background: '#000000', color: '#00ff00', padding: '6px', fontFamily: 'var(--w95-mono)', fontSize: '11px', marginBottom: '6px', overflowX: 'auto' }}>
                      <code>{item.syntax}</code>
                    </div>

                    {/* Description */}
                    <div style={{ fontSize: '11px', color: '#222', lineHeight: '1.4', marginBottom: '6px' }}>
                      {item.description}
                    </div>

                    {/* Notes if available */}
                    {item.notes && (
                      <div style={{ fontSize: '10px', background: '#fff8e1', borderLeft: '3px solid #ffb300', padding: '4px', color: '#444', marginBottom: '6px' }}>
                        💡 <strong>Note:</strong> {item.notes}
                      </div>
                    )}
                  </div>

                  {/* Footer Actions */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '6px', borderTop: '1px solid #dfdfdf', marginTop: '4px' }}>
                    <button
                      type="button"
                      onClick={() => handleCopyCode(item.id, item.example)}
                      className="win95-button"
                      style={{ fontSize: '10px', padding: '2px 8px' }}
                    >
                      {copiedId === item.id ? '✓ Copied!' : '📋 Copy SQL'}
                    </button>

                    {isSupported && (
                      <button
                        type="button"
                        onClick={() => onTryInIde(item.example, targetDialect)}
                        className="win95-button"
                        style={{ fontSize: '11px', padding: '2px 10px', fontWeight: 'bold', color: '#000080' }}
                      >
                        ▶ Try in IDE ({targetDialect})
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Status Bar ────────────────────────────────────────────────────── */}
      <div className="win95-statusbar">
        <div className="win95-statusbar-pane" style={{ flex: 1 }}>
          Dialect Filter: <strong>{selectedDialect === 'ALL' ? 'All Supported Dialects' : selectedDialect}</strong>
        </div>
        <div className="win95-statusbar-pane">
          ExNihilo SQL Dictionary v1.2
        </div>
      </div>
    </div>
  );
};
