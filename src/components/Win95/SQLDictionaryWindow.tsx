import React, { useState, useMemo } from 'react';
import {
  SQL_DICTIONARY_ITEMS,
  DIALECT_METADATA,
  DialectName,
  CommandCategory,
  SQLDictionaryItem,
} from '../../data/dialectCommands';
import { WindowControls } from './WindowControls';

interface SQLDictionaryWindowProps {
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onFocus: () => void;
  onTryInIde: (query: string, dialect: DialectName) => void;
  zIndex: number;
}

export const SQLDictionaryWindow: React.FC<SQLDictionaryWindowProps> = ({
  isOpen,
  isMinimized,
  isMaximized,
  onClose,
  onMinimize,
  onMaximize,
  onFocus,
  onTryInIde,
  zIndex,
}) => {
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

  return (
    <div
      onClick={onFocus}
      style={{
        display: isMinimized ? 'none' : 'flex',
        zIndex,
      }}
      className={`fixed flex-col bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-black border-r-black shadow-2xl font-mono text-sm transition-all duration-75 select-none ${
        isMaximized
          ? 'top-0 left-0 w-full h-[calc(100vh-28px)]'
          : 'top-8 left-1/2 -translate-x-1/2 w-[92vw] max-w-5xl h-[85vh]'
      }`}
    >
      {/* ── Title Bar ────────────────────────────────────────────────────── */}
      <div className="bg-[#000080] px-2 py-1 flex items-center justify-between text-white font-bold cursor-move shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-base">📖</span>
          <span className="tracking-wide">SQL Dictionary & Dialect Reference (Windows 95)</span>
        </div>
        <WindowControls
          onMinimize={onMinimize}
          onMaximize={onMaximize}
          onClose={onClose}
          isMaximized={isMaximized}
        />
      </div>

      {/* ── Top Info Header & Dialect Tabs ─────────────────────────────────── */}
      <div className="p-2 border-b border-[#808080] bg-[#c0c0c0] shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="text-xs text-black">
            <span className="font-bold text-[#000080]">SQL Command Dictionary</span> — Select a dialect tab to explore commands, view support status (✅ Supported vs ⏳ Coming Soon), and test examples.
          </div>
          <div className="text-xs bg-[#e0e0e0] px-2 py-0.5 border border-black font-semibold">
            Showing {filteredItems.length} of {SQL_DICTIONARY_ITEMS.length} Commands
          </div>
        </div>

        {/* Dialect Tabs */}
        <div className="flex flex-wrap items-end gap-1 border-b-2 border-[#808080] pt-1">
          <button
            onClick={() => setSelectedDialect('ALL')}
            className={`px-3 py-1 text-xs font-bold border-t-2 border-l-2 border-r-2 ${
              selectedDialect === 'ALL'
                ? 'bg-[#c0c0c0] border-t-white border-l-white border-r-black -mb-[2px] pb-1.5 z-10 text-[#000080]'
                : 'bg-[#a0a0a0] border-t-white border-l-white border-r-gray-700 text-black hover:bg-[#b0b0b0]'
            }`}
          >
            🌐 All Dialects
          </button>
          {(Object.keys(DIALECT_METADATA) as DialectName[]).map((dialect) => {
            const meta = DIALECT_METADATA[dialect];
            const isSelected = selectedDialect === dialect;
            return (
              <button
                key={dialect}
                onClick={() => setSelectedDialect(dialect)}
                className={`px-3 py-1 text-xs font-bold border-t-2 border-l-2 border-r-2 ${
                  isSelected
                    ? 'bg-[#c0c0c0] border-t-white border-l-white border-r-black -mb-[2px] pb-1.5 z-10 text-[#000080]'
                    : 'bg-[#a0a0a0] border-t-white border-l-white border-r-gray-700 text-black hover:bg-[#b0b0b0]'
                }`}
              >
                {meta.icon} {dialect}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Filter Controls Bar ────────────────────────────────────────────── */}
      <div className="p-2 bg-[#d4d0c8] border-b-2 border-white flex flex-wrap items-center gap-3 shrink-0 text-xs">
        {/* Status Filter Pills */}
        <div className="flex items-center gap-1 bg-[#c0c0c0] p-1 border border-t-[#808080] border-l-[#808080] border-b-white border-r-white">
          <span className="font-bold text-[#808080] mr-1">Status:</span>
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-2 py-0.5 text-xs ${
              statusFilter === 'ALL'
                ? 'bg-[#000080] text-white font-bold'
                : 'bg-[#c0c0c0] text-black hover:bg-[#b0b0b0]'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter('supported')}
            className={`px-2 py-0.5 text-xs flex items-center gap-1 ${
              statusFilter === 'supported'
                ? 'bg-[#008000] text-white font-bold'
                : 'bg-[#c0c0c0] text-black hover:bg-[#b0b0b0]'
            }`}
          >
            ✅ Supported
          </button>
          <button
            onClick={() => setStatusFilter('coming_soon')}
            className={`px-2 py-0.5 text-xs flex items-center gap-1 ${
              statusFilter === 'coming_soon'
                ? 'bg-[#808000] text-white font-bold'
                : 'bg-[#c0c0c0] text-black hover:bg-[#b0b0b0]'
            }`}
          >
            ⏳ Coming Soon
          </button>
        </div>

        {/* Category Dropdown */}
        <div className="flex items-center gap-1">
          <span className="font-bold text-black">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-white border-2 border-t-black border-l-black border-b-white border-r-white px-2 py-0.5 text-xs font-sans text-black"
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
        <div className="flex-1 min-w-[200px] flex items-center gap-1">
          <span className="font-bold text-black">🔍 Search:</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Type command, function, or keyword..."
            className="flex-1 bg-white border-2 border-t-black border-l-black border-b-white border-r-white px-2 py-0.5 text-xs font-mono text-black outline-none focus:bg-yellow-50"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="bg-[#c0c0c0] border border-black px-1.5 py-0.5 text-xs hover:bg-[#d0d0d0]"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* ── Main Content Area ──────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-3 bg-[#ffffff] border-2 border-t-black border-l-black border-b-white border-r-white">
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center text-gray-500 font-sans">
            <div className="text-3xl mb-2">🔍</div>
            <div className="font-bold text-black">No matching SQL commands found</div>
            <div className="text-xs text-gray-600 mt-1">
              Try adjusting your search keywords or switching filters.
            </div>
            <button
              onClick={() => {
                setSelectedDialect('ALL');
                setStatusFilter('ALL');
                setCategoryFilter('ALL');
                setSearchQuery('');
              }}
              className="mt-3 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-black border-r-black px-3 py-1 text-xs font-bold text-black hover:bg-[#d0d0d0]"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredItems.map((item) => {
              const isSupported = item.status === 'supported';
              const targetDialect = selectedDialect !== 'ALL' ? selectedDialect : item.dialects[0];

              return (
                <div
                  key={item.id}
                  className="bg-[#f8f9fa] border-2 border-t-white border-l-white border-b-[#808080] border-r-[#808080] p-3 flex flex-col justify-between shadow-sm hover:border-[#000080] transition-colors"
                >
                  {/* Top Row: Command Name & Badges */}
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="font-bold text-sm text-[#000080] font-mono break-all">
                        {item.command}
                      </div>

                      {/* Status Badge */}
                      {isSupported ? (
                        <span className="shrink-0 bg-[#e6f4ea] text-[#137333] border border-[#a8dab5] px-2 py-0.5 text-[11px] font-bold rounded flex items-center gap-1">
                          <span>✅</span> Executable in IDE
                        </span>
                      ) : (
                        <span className="shrink-0 bg-[#fef7e0] text-[#b06000] border border-[#fde293] px-2 py-0.5 text-[11px] font-bold rounded flex items-center gap-1">
                          <span>⏳</span> Coming Soon
                        </span>
                      )}
                    </div>

                    {/* Category & Dialect Tags */}
                    <div className="flex flex-wrap items-center gap-1 mb-2">
                      <span className="bg-[#e8eaed] text-[#3c4043] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider border border-[#dadce0]">
                        {item.category}
                      </span>
                      {item.dialects.map((d) => (
                        <span
                          key={d}
                          className="bg-[#000080] text-white px-1.5 py-0.5 text-[10px] font-bold"
                        >
                          {DIALECT_METADATA[d]?.icon} {d}
                        </span>
                      ))}
                    </div>

                    {/* Syntax Box */}
                    <div className="bg-[#000000] text-[#00ff00] p-2 font-mono text-xs mb-2 rounded border border-[#808080] overflow-x-auto">
                      <code>{item.syntax}</code>
                    </div>

                    {/* Description */}
                    <div className="text-xs text-gray-800 font-sans leading-relaxed mb-2">
                      {item.description}
                    </div>

                    {/* Notes if available */}
                    {item.notes && (
                      <div className="text-[11px] bg-[#fff8e1] border-l-2 border-[#ffb300] p-1.5 text-gray-700 font-sans mb-2">
                        💡 <strong>Note:</strong> {item.notes}
                      </div>
                    )}
                  </div>

                  {/* Bottom Actions Row */}
                  <div className="pt-2 border-t border-gray-200 flex items-center justify-between gap-2 mt-1">
                    <button
                      onClick={() => handleCopyCode(item.id, item.example)}
                      className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-black border-r-black px-2 py-0.5 text-xs text-black hover:bg-[#d0d0d0] active:translate-y-0.5"
                    >
                      {copiedId === item.id ? '✓ Copied!' : '📋 Copy SQL'}
                    </button>

                    {isSupported && (
                      <button
                        onClick={() => onTryInIde(item.example, targetDialect)}
                        className="bg-[#000080] text-white border-2 border-t-blue-300 border-l-blue-300 border-b-black border-r-black px-3 py-1 text-xs font-bold hover:bg-[#0000a0] active:translate-y-0.5 flex items-center gap-1 shadow"
                      >
                        <span>▶</span> Try in IDE ({targetDialect})
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Status Bar Footer ──────────────────────────────────────────────── */}
      <div className="bg-[#c0c0c0] border-t-2 border-white px-2 py-1 flex items-center justify-between text-xs text-black shrink-0">
        <div>
          Dialect Focus:{' '}
          <span className="font-bold text-[#000080]">
            {selectedDialect === 'ALL' ? 'All SQL Dialects' : selectedDialect}
          </span>
        </div>
        <div className="text-gray-600 font-sans text-[11px]">
          ExNihilo 95 In-Memory Relational Engine v1.2
        </div>
      </div>
    </div>
  );
};
