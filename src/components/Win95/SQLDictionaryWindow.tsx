/**
 * SQLDictionaryWindow.tsx — Clean Windows 95 Master-Detail SQL Dictionary & Reference
 * Designed for maximum readability, zero clutter, and comprehensive dialect reference.
 */

import React, { useState, useMemo } from 'react';
import { useDraggable } from '../../hooks/useDraggable';
import { WindowControls } from './WindowControls';
import {
  SQL_DICTIONARY_ITEMS,
  DIALECT_METADATA,
  DialectName,
  CommandCategory,
  SQLDictionaryItem,
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
  const { position, handleMouseDown } = useDraggable({ x: 70, y: 35 });
  const [isMaximized, setIsMaximized] = useState(false);
  const [selectedDialect, setSelectedDialect] = useState<DialectName | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'supported' | 'coming_soon'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedItemId, setSelectedItemId] = useState<string>('dml-select');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories: CommandCategory[] = [
    'DML & Querying',
    'DDL & Schema',
    'Triggers & Stored Logic',
    'Transactions & Locks',
    'Null Handling',
    'String Functions',
    'Date & Time',
    'JSON & Semi-Structured',
    'Aggregate & Math',
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

  // Selected Item details
  const activeItem: SQLDictionaryItem = useMemo(() => {
    return (
      filteredItems.find((i) => i.id === selectedItemId) ||
      filteredItems[0] ||
      SQL_DICTIONARY_ITEMS[0]
    );
  }, [filteredItems, selectedItemId]);

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
        width: '880px',
        height: '590px',
        maxHeight: '92vh',
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
          <span>SQL Dictionary & Dialect Reference (Windows 95)</span>
        </div>
        <WindowControls
          onMinimize={onMinimize}
          onMaximize={() => setIsMaximized((prev) => !prev)}
          isMaximized={isMaximized}
          onClose={onClose}
        />
      </div>

      {/* ── Top Header Controls & Dialect Selector ────────────────────────── */}
      <div style={{ background: '#c0c0c0', padding: '6px 8px', borderBottom: '1px solid #808080' }}>
        {/* Dialect Tabs Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '2px' }}>
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

          {/* Quick Counter */}
          <div style={{ fontSize: '11px', background: '#ffffff', padding: '2px 8px', border: '1px solid #808080', fontWeight: 'bold' }}>
            {filteredItems.length} Commands Available
          </div>
        </div>

        {/* Filters Bar: Search & Category Dropdowns */}
        <div style={{ marginTop: '6px', display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', fontSize: '11px' }}>
          {/* Search Box */}
          <div style={{ flex: 1, minWidth: '200px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <strong>🔍 Search:</strong>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search SQL keywords, syntax, functions..."
              style={{
                flex: 1,
                background: '#ffffff',
                border: '1px solid #808080',
                padding: '2px 6px',
                fontSize: '11px',
                fontFamily: 'var(--w95-mono)',
              }}
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

          {/* Status Filter Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', background: '#d4d0c8', padding: '1px 3px', border: '1px solid #808080' }}>
            <span style={{ fontSize: '10px', color: '#555', marginRight: '2px' }}>Status:</span>
            <button
              type="button"
              onClick={() => setStatusFilter('ALL')}
              className={`win95-button ${statusFilter === 'ALL' ? 'pressed' : ''}`}
              style={{ fontSize: '10px', padding: '1px 5px' }}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('supported')}
              className={`win95-button ${statusFilter === 'supported' ? 'pressed' : ''}`}
              style={{ fontSize: '10px', padding: '1px 5px', color: statusFilter === 'supported' ? '#008000' : '#000' }}
            >
              ✅ Executable
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('coming_soon')}
              className={`win95-button ${statusFilter === 'coming_soon' ? 'pressed' : ''}`}
              style={{ fontSize: '10px', padding: '1px 5px', color: statusFilter === 'coming_soon' ? '#808000' : '#000' }}
            >
              ⏳ Soon
            </button>
          </div>
        </div>
      </div>

      {/* ── 2-Pane Master Detail Layout ──────────────────────────────────── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', padding: '4px', gap: '4px', background: '#c0c0c0' }}>
        {/* Left Master Pane: Command Index List */}
        <div
          className="win95-inset"
          style={{
            width: '260px',
            height: '100%',
            overflowY: 'auto',
            background: '#ffffff',
            padding: '2px',
          }}
        >
          <div style={{ padding: '4px 6px', background: '#000080', color: '#ffffff', fontWeight: 'bold', fontSize: '11px', marginBottom: '2px' }}>
            📋 Command Index ({filteredItems.length})
          </div>

          {filteredItems.length === 0 ? (
            <div style={{ padding: '16px', textWrap: 'wrap', textAlign: 'center', color: '#777', fontSize: '11px' }}>
              No commands match current filter criteria.
            </div>
          ) : (
            filteredItems.map((item) => {
              const isSelected = activeItem && activeItem.id === item.id;
              const isExecutable = item.status === 'supported';

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedItemId(item.id)}
                  style={{
                    padding: '4px 6px',
                    cursor: 'pointer',
                    background: isSelected ? '#000080' : 'transparent',
                    color: isSelected ? '#ffffff' : '#000000',
                    fontSize: '11px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '4px',
                    borderBottom: '1px solid #f0f0f0',
                  }}
                >
                  <div style={{ fontFamily: 'var(--w95-mono)', fontWeight: isSelected ? 'bold' : 'normal', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.command}
                  </div>

                  <span style={{ fontSize: '10px', opacity: isSelected ? 1 : 0.75, flexShrink: 0 }}>
                    {isExecutable ? '✅' : '⏳'}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Right Detail Pane: Command Inspector & Student Guide */}
        <div
          className="win95-inset"
          style={{
            flex: 1,
            height: '100%',
            overflowY: 'auto',
            background: '#ffffff',
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          {activeItem ? (
            <div>
              {/* Header: Title & Status Badge */}
              <div style={{ borderBottom: '2px solid #000080', paddingBottom: '6px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '16px', color: '#000080', fontFamily: 'var(--w95-mono)', fontWeight: 'bold' }}>
                    {activeItem.command}
                  </h2>
                  <div style={{ fontSize: '10px', color: '#555', marginTop: '2px' }}>
                    Category: <strong>{activeItem.category}</strong>
                  </div>
                </div>

                {activeItem.status === 'supported' ? (
                  <span style={{ background: '#e6f4ea', color: '#137333', border: '1px solid #a8dab5', padding: '2px 8px', fontSize: '11px', fontWeight: 'bold' }}>
                    ✅ Executable in ExNihilo IDE
                  </span>
                ) : (
                  <span style={{ background: '#fef7e0', color: '#b06000', border: '1px solid #fde293', padding: '2px 8px', fontSize: '11px', fontWeight: 'bold' }}>
                    ⏳ Coming Soon / Advanced Dialect
                  </span>
                )}
              </div>

              {/* Dialect Badges */}
              <div style={{ marginBottom: '10px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#444', marginRight: '4px' }}>Dialect Support:</span>
                {activeItem.dialects.map((d) => (
                  <span
                    key={d}
                    style={{
                      background: '#000080',
                      color: '#ffffff',
                      padding: '2px 6px',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      borderRadius: '2px',
                    }}
                  >
                    {DIALECT_METADATA[d]?.icon} {d}
                  </span>
                ))}
              </div>

              {/* 1. What It Does */}
              <div style={{ marginBottom: '12px' }}>
                <strong style={{ fontSize: '11px', color: '#000080' }}>📘 What It Does:</strong>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', lineHeight: '1.5', color: '#222' }}>
                  {activeItem.description}
                </p>
              </div>

              {/* 2. Standard Syntax */}
              <div style={{ marginBottom: '12px' }}>
                <strong style={{ fontSize: '11px', color: '#000080' }}>📄 Standard Syntax:</strong>
                <div style={{ background: '#000000', color: '#00ff00', padding: '8px', fontFamily: 'var(--w95-mono)', fontSize: '11px', marginTop: '4px', border: '1px solid #808080' }}>
                  <code>{activeItem.syntax}</code>
                </div>
              </div>

              {/* 3. Dialect Variations Comparison Table (If Available) */}
              {activeItem.dialectVariations && activeItem.dialectVariations.length > 0 && (
                <div style={{ marginBottom: '12px' }}>
                  <strong style={{ fontSize: '11px', color: '#000080' }}>🔄 Dialect Variations Comparison:</strong>
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '4px', fontSize: '11px' }}>
                    <thead>
                      <tr style={{ background: '#c0c0c0', borderBottom: '1px solid #808080' }}>
                        <th style={{ padding: '4px', textAlign: 'left', border: '1px solid #808080' }}>Dialect</th>
                        <th style={{ padding: '4px', textAlign: 'left', border: '1px solid #808080' }}>Dialect Syntax</th>
                        <th style={{ padding: '4px', textAlign: 'left', border: '1px solid #808080' }}>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeItem.dialectVariations.map((v) => (
                        <tr key={v.dialect} style={{ background: '#f8f9fa' }}>
                          <td style={{ padding: '4px', border: '1px solid #dfdfdf', fontWeight: 'bold' }}>
                            {DIALECT_METADATA[v.dialect]?.icon} {v.dialect}
                          </td>
                          <td style={{ padding: '4px', border: '1px solid #dfdfdf', fontFamily: 'var(--w95-mono)', color: '#000080' }}>
                            <code>{v.syntax}</code>
                          </td>
                          <td style={{ padding: '4px', border: '1px solid #dfdfdf', color: '#555' }}>
                            {v.note || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* 4. Executable Code Example */}
              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <strong style={{ fontSize: '11px', color: '#000080' }}>💡 Code Example:</strong>
                  <button
                    type="button"
                    onClick={() => handleCopyCode(activeItem.id, activeItem.example)}
                    className="win95-button"
                    style={{ fontSize: '10px', padding: '1px 6px' }}
                  >
                    {copiedId === activeItem.id ? '✓ Copied!' : '📋 Copy SQL'}
                  </button>
                </div>
                <div style={{ background: '#f0f4f8', border: '1px dashed #000080', padding: '8px', fontFamily: 'var(--w95-mono)', fontSize: '11px', color: '#111' }}>
                  <code>{activeItem.example}</code>
                </div>
              </div>

              {/* 5. Notes & Gotchas */}
              {activeItem.notes && (
                <div style={{ background: '#fff8e1', borderLeft: '4px solid #ffb300', padding: '6px 10px', fontSize: '11px', color: '#444' }}>
                  <strong>🎓 Student Note:</strong> {activeItem.notes}
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
              Select a command from the left index list to inspect its specification.
            </div>
          )}

          {/* Bottom Action Footer */}
          {activeItem && (
            <div style={{ marginTop: '16px', paddingTop: '10px', borderTop: '1px solid #c0c0c0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '11px', color: '#666' }}>
                Selected Command: <strong>{activeItem.command}</strong>
              </div>

              {activeItem.status === 'supported' ? (
                <button
                  type="button"
                  onClick={() =>
                    onTryInIde(
                      activeItem.example,
                      selectedDialect !== 'ALL' ? selectedDialect : activeItem.dialects[0]
                    )
                  }
                  className="win95-button"
                  style={{
                    fontSize: '11px',
                    padding: '4px 14px',
                    fontWeight: 'bold',
                    color: '#000080',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span>▶</span> Try in IDE ({selectedDialect !== 'ALL' ? selectedDialect : activeItem.dialects[0]})
                </button>
              ) : (
                <span style={{ fontSize: '11px', color: '#888', fontStyle: 'italic' }}>
                  ⏳ Planned for future engine update
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Status Bar ────────────────────────────────────────────────────── */}
      <div className="win95-statusbar">
        <div className="win95-statusbar-pane" style={{ flex: 1 }}>
          Active Selection: <strong>{activeItem?.command || 'None'}</strong> ({activeItem?.category || ''})
        </div>
        <div className="win95-statusbar-pane">
          ExNihilo SQL Dictionary Matrix v1.3
        </div>
      </div>
    </div>
  );
};
