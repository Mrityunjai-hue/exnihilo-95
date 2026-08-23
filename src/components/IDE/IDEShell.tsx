/**
 * IDEShell.tsx — Complete Windows 95 SQL Development Studio Window
 * Features:
 *  - Multi-tab query workspace with clean new tab defaults
 *  - Draggable & resizable layout splitters (Schema Tree, Query Editor, Results Grid)
 *  - SQL Beautifier / Formatter (`handleFormatSql`)
 *  - Execution Query History Drawer & modal
 *  - Full integration with upgraded ResultsGrid, SchemaTree, and Toolbar across all 4 dialects
 */

import React, { useState, useEffect, useRef } from 'react';
import { Dialect } from '../../engine/parser';
import { SQLExecutor, ExecutionSuccess } from '../../engine/executor';
import { QueryEditor } from './QueryEditor';
import { ResultsGrid } from './ResultsGrid';
import { SchemaTree } from './SchemaTree';
import { Toolbar } from './Toolbar';

interface QueryTab {
  id:              string;
  title:           string;
  queryText:       string;
  result:          ExecutionSuccess | null;
  isLoading:       boolean;
  executionTimeMs: number | null;
}

interface QueryHistoryItem {
  id: string;
  sql: string;
  timestamp: Date;
  executionTimeMs: number | null;
  rowCount: number;
  dialect: Dialect;
}

interface IDEShellProps {
  isOpen:                  boolean;
  isMinimized:             boolean;
  zIndex:                  number;
  position?:               { x: number; y: number };
  dialect:                 Dialect;
  initialQueryText:        string;
  initialResult:           ExecutionSuccess | null;
  initialIsLoading:        boolean;
  initialExecutionTimeMs:  number | null;
  executor:                SQLExecutor;
  onFocus:                 () => void;
  onClose:                 () => void;
  onMinimize:              () => void;
  onDialectChange:         (dialect: Dialect) => void;
  onQueryChange:           (query: string) => void;
  onRun:                   (queryToRun?: string) => void;
  onReset:                 () => void;
  onOpenHelp:              () => void;
  onOpenSettings:          () => void;
  onStartTour:             () => void;
}

export const IDEShell: React.FC<IDEShellProps> = ({
  isOpen,
  isMinimized,
  zIndex,
  position,
  dialect,
  initialQueryText,
  initialResult,
  initialIsLoading,
  initialExecutionTimeMs,
  executor,
  onFocus,
  onClose,
  onMinimize,
  onDialectChange,
  onQueryChange,
  onRun,
  onReset,
  onOpenHelp,
  onOpenSettings,
  onStartTour,
}) => {
  const [activeMenu, setActiveMenu] = useState<'file' | 'edit' | 'query' | 'view' | 'tools' | 'help' | null>(null);
  const [showExplorer, setShowExplorer] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(240);
  const [editorHeightPercent, setEditorHeightPercent] = useState(42); // 42% height for editor
  const [hasSelection, setHasSelection] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  // Query History State
  const [queryHistory, setQueryHistory] = useState<QueryHistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Drag Resizing State
  const [isResizingSidebar, setIsResizingSidebar] = useState(false);
  const [isResizingVertical, setIsResizingVertical] = useState(false);

  const menuBarRef = useRef<HTMLDivElement>(null);
  const studioBodyRef = useRef<HTMLDivElement>(null);

  // ── Multi-Tab State Management ─────────────────────────────────────────────
  const [tabs, setTabs] = useState<QueryTab[]>([
    {
      id: 'tab_1',
      title: 'Query 1.sql',
      queryText: initialQueryText,
      result: initialResult,
      isLoading: initialIsLoading,
      executionTimeMs: initialExecutionTimeMs,
    },
  ]);
  const [activeTabId, setActiveTabId] = useState<string>('tab_1');

  // Track previous initialQueryText to only update query text on explicit external load
  const prevInitialQueryRef = useRef(initialQueryText);

  // Sync execution results & external query load with active tab
  useEffect(() => {
    const isExternalQueryLoad = prevInitialQueryRef.current !== initialQueryText;
    prevInitialQueryRef.current = initialQueryText;

    setTabs((prev) =>
      prev.map((tab) =>
        tab.id === activeTabId
          ? {
              ...tab,
              queryText: isExternalQueryLoad && initialQueryText ? initialQueryText : tab.queryText,
              result: initialResult,
              isLoading: initialIsLoading,
              executionTimeMs: initialExecutionTimeMs,
            }
          : tab
      )
    );

    // Record execution into query history log on new result arrival
    if (initialResult && !initialIsLoading) {
      const activeTabObj = tabs.find((t) => t.id === activeTabId);
      if (activeTabObj) {
        setQueryHistory((prev) => [
          {
            id: `hist_${Date.now()}`,
            sql: activeTabObj.queryText,
            timestamp: new Date(),
            executionTimeMs: initialExecutionTimeMs,
            rowCount: initialResult.rowCount,
            dialect,
          },
          ...prev.slice(0, 49), // Keep last 50 history entries
        ]);
      }
    }
  }, [initialQueryText, initialResult, initialIsLoading, initialExecutionTimeMs, activeTabId]);

  // Handle Drag Resizing for Split Panes
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizingSidebar && studioBodyRef.current) {
        const rect = studioBodyRef.current.getBoundingClientRect();
        const newWidth = Math.max(140, Math.min(420, e.clientX - rect.left));
        setSidebarWidth(newWidth);
      }
      if (isResizingVertical && studioBodyRef.current) {
        const rect = studioBodyRef.current.getBoundingClientRect();
        const relativeY = e.clientY - rect.top;
        const newPercent = Math.max(20, Math.min(75, (relativeY / rect.height) * 100));
        setEditorHeightPercent(newPercent);
      }
    };

    const handleMouseUp = () => {
      setIsResizingSidebar(false);
      setIsResizingVertical(false);
    };

    if (isResizingSidebar || isResizingVertical) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizingSidebar, isResizingVertical]);

  // Close menus on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuBarRef.current && !menuBarRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };
    window.addEventListener('mousedown', handleOutsideClick);
    return () => window.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  if (!isOpen || isMinimized) return null;

  const catalog = executor.getCatalog();
  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  // ── Tab Operations ─────────────────────────────────────────────────────────

  const handleNewTab = (customTitle?: string, customSql?: string) => {
    const nextNum = tabs.length + 1;
    const newTabId = `tab_${Date.now()}`;
    const initialSql = customSql !== undefined ? customSql : `-- Query ${nextNum}.sql\n\n`;

    const newTab: QueryTab = {
      id: newTabId,
      title: customTitle || `Query ${nextNum}.sql`,
      queryText: initialSql,
      result: null,
      isLoading: false,
      executionTimeMs: null,
    };

    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newTabId);
    onQueryChange(initialSql);
    setActiveMenu(null);
  };

  const handleCloseTab = (e: React.MouseEvent | null, tabIdToClose: string) => {
    if (e) e.stopPropagation();
    if (tabs.length <= 1) {
      const resetTab: QueryTab = {
        id: 'tab_1',
        title: 'Query 1.sql',
        queryText: '-- New Query Tab\nSELECT * FROM customers;',
        result: null,
        isLoading: false,
        executionTimeMs: null,
      };
      setTabs([resetTab]);
      setActiveTabId('tab_1');
      onQueryChange(resetTab.queryText);
      setActiveMenu(null);
      return;
    }

    const remaining = tabs.filter((t) => t.id !== tabIdToClose);
    setTabs(remaining);

    if (activeTabId === tabIdToClose) {
      const nextActive = remaining[remaining.length - 1];
      setActiveTabId(nextActive.id);
      onQueryChange(nextActive.queryText);
    }
    setActiveMenu(null);
  };

  const handleSelectTab = (tabId: string) => {
    setActiveTabId(tabId);
    const targetTab = tabs.find((t) => t.id === tabId);
    if (targetTab) {
      onQueryChange(targetTab.queryText);
    }
  };

  const handleActiveQueryChange = (newText: string) => {
    setTabs((prev) =>
      prev.map((t) => (t.id === activeTabId ? { ...t, queryText: newText } : t))
    );
    onQueryChange(newText);
  };

  // SQL Beautifier / Formatter
  const handleFormatSql = () => {
    const raw = activeTab.queryText;
    if (!raw.trim()) return;

    // Standardize SQL keywords to uppercase
    const keywords = [
      'SELECT', 'FROM', 'WHERE', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'OUTER JOIN',
      'ON', 'GROUP BY', 'ORDER BY', 'HAVING', 'WITH', 'AS', 'LIMIT', 'OFFSET', 'UNION', 'ALL',
      'AND', 'OR', 'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE FROM', 'CREATE TABLE', 'DROP TABLE',
      'ASC', 'DESC', 'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'IS NULL', 'IS NOT NULL'
    ];

    let formatted = raw;
    keywords.forEach((kw) => {
      const regex = new RegExp(`\\b${kw}\\b`, 'gi');
      formatted = formatted.replace(regex, kw);
    });

    // Add line breaks before major clause keywords
    const breakKeywords = ['FROM', 'WHERE', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT'];
    breakKeywords.forEach((kw) => {
      const regex = new RegExp(`\\s+(${kw})\\b`, 'g');
      formatted = formatted.replace(regex, `\n$1`);
    });

    handleActiveQueryChange(formatted);
  };

  const handleSelectTable = (tableName: string, querySql?: string) => {
    const tabTitle = `${tableName}.sql`;
    const existing = tabs.find(
      (t) => t.title.toLowerCase() === tabTitle.toLowerCase() || t.id === `tbl_${tableName.toLowerCase()}`
    );

    if (existing) {
      handleSelectTab(existing.id);
      if (querySql) handleActiveQueryChange(querySql);
      return;
    }

    handleNewTab(tabTitle, querySql || `SELECT * FROM ${tableName};`);
  };

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
    setActiveMenu(null);
  };

  const handleExecute = () => {
    const targetToRun = hasSelection && selectedText ? selectedText : activeTab.queryText;
    onRun(targetToRun);
    setActiveMenu(null);
  };

  // Global F5 & Ctrl+Enter shortcut intercept inside IDE window
  useEffect(() => {
    if (!isOpen || isMinimized) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F5' || e.code === 'F5' || (e.key === 'Enter' && (e.ctrlKey || e.metaKey))) {
        e.preventDefault();
        e.stopPropagation();
        handleExecute();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, isMinimized, handleExecute]);

  const handleDownloadSql = () => {
    const blob = new Blob([activeTab.queryText], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeTab.title.endsWith('.sql') ? activeTab.title : `${activeTab.title}.sql`;
    a.click();
    URL.revokeObjectURL(url);
    setActiveMenu(null);
  };

  const handleInsertTemplate = (sqlTemplate: string) => {
    handleActiveQueryChange(sqlTemplate);
    setActiveMenu(null);
  };

  return (
    <div
      className="win95-window"
      style={{
        position: 'absolute',
        top: position ? `${position.y}px` : '40px',
        left: position ? `${position.x}px` : '40px',
        width: 'calc(100vw - 100px)',
        height: 'calc(100vh - 100px)',
        maxWidth: '1280px',
        maxHeight: '800px',
        zIndex,
        display: 'flex',
        flexDirection: 'column',
      }}
      onMouseDown={onFocus}
    >
      {/* Titlebar */}
      <div className="win95-titlebar" onMouseDown={onFocus} style={{ cursor: 'default' }}>
        <div className="win95-titlebar-text">
          <span>🗄️</span>
          <span>ExNihilo SQL Studio — [{dialect}] — {activeTab.title}</span>
        </div>
        <div className="win95-titlebar-controls">
          <button className="win95-btn-titlebar" onClick={onMinimize} title="Minimize">_</button>
          <button className="win95-btn-titlebar" onClick={onClose} title="Close">✕</button>
        </div>
      </div>

      {/* Menu Strip */}
      <div
        ref={menuBarRef}
        style={{
          display: 'flex',
          gap: '2px',
          padding: '2px 4px',
          borderBottom: '1px solid #808080',
          fontSize: '11px',
          position: 'relative',
          background: '#c0c0c0',
        }}
      >
        {/* FILE MENU */}
        <div style={{ position: 'relative' }}>
          <span
            style={{
              cursor: 'pointer',
              padding: '2px 6px',
              backgroundColor: activeMenu === 'file' ? '#000080' : 'transparent',
              color: activeMenu === 'file' ? '#ffffff' : '#000000',
            }}
            onClick={() => setActiveMenu(activeMenu === 'file' ? null : 'file')}
          >
            <u>F</u>ile
          </span>
          {activeMenu === 'file' && (
            <div className="win95-dropdown-menu">
              <div className="win95-dropdown-item" onClick={() => handleNewTab()}>
                <span>📄 New Query Tab</span>
              </div>
              <div className="win95-dropdown-item" onClick={handleDownloadSql}>
                <span>💾 Save / Export Query...</span>
              </div>
              <div className="win95-dropdown-divider" />
              <div className="win95-dropdown-item" onClick={(e) => handleCloseTab(e, activeTabId)}>
                <span>✕ Close Active Tab</span>
              </div>
              <div className="win95-dropdown-item" onClick={onClose}>
                <span>🚪 Exit Studio</span>
              </div>
            </div>
          )}
        </div>

        {/* EDIT MENU */}
        <div style={{ position: 'relative' }}>
          <span
            style={{
              cursor: 'pointer',
              padding: '2px 6px',
              backgroundColor: activeMenu === 'edit' ? '#000080' : 'transparent',
              color: activeMenu === 'edit' ? '#ffffff' : '#000000',
            }}
            onClick={() => setActiveMenu(activeMenu === 'edit' ? null : 'edit')}
          >
            <u>E</u>dit
          </span>
          {activeMenu === 'edit' && (
            <div className="win95-dropdown-menu">
              <div className="win95-dropdown-item" onClick={handleFormatSql}>
                <span>🧹 Format SQL Query</span>
              </div>
              <div className="win95-dropdown-item" onClick={() => handleActiveQueryChange('')}>
                <span>✨ Clear Query Text</span>
              </div>
            </div>
          )}
        </div>

        {/* QUERY MENU */}
        <div style={{ position: 'relative' }}>
          <span
            style={{
              cursor: 'pointer',
              padding: '2px 6px',
              backgroundColor: activeMenu === 'query' ? '#000080' : 'transparent',
              color: activeMenu === 'query' ? '#ffffff' : '#000000',
            }}
            onClick={() => setActiveMenu(activeMenu === 'query' ? null : 'query')}
          >
            <u>Q</u>uery
          </span>
          {activeMenu === 'query' && (
            <div className="win95-dropdown-menu">
              <div className="win95-dropdown-item" onClick={handleExecute}>
                <span>▶ Run All / Active (F5)</span>
              </div>
              <div className="win95-dropdown-item" onClick={() => setIsHistoryOpen(true)}>
                <span>🕒 View Query History</span>
              </div>
            </div>
          )}
        </div>

        {/* VIEW MENU */}
        <div style={{ position: 'relative' }}>
          <span
            style={{
              cursor: 'pointer',
              padding: '2px 6px',
              backgroundColor: activeMenu === 'view' ? '#000080' : 'transparent',
              color: activeMenu === 'view' ? '#ffffff' : '#000000',
            }}
            onClick={() => setActiveMenu(activeMenu === 'view' ? null : 'view')}
          >
            <u>V</u>iew
          </span>
          {activeMenu === 'view' && (
            <div className="win95-dropdown-menu">
              <div className="win95-dropdown-item" onClick={() => { setShowExplorer(!showExplorer); setActiveMenu(null); }}>
                <span>{showExplorer ? '✓ Hide Explorer Sidebar' : '  Show Explorer Sidebar'}</span>
              </div>
              <div className="win95-dropdown-item" onClick={handleRefresh}>
                <span>🔄 Refresh Schema Tree</span>
              </div>
            </div>
          )}
        </div>

        {/* TOOLS & HELP MENU */}
        <div style={{ position: 'relative' }}>
          <span
            style={{
              cursor: 'pointer',
              padding: '2px 6px',
              backgroundColor: activeMenu === 'help' ? '#000080' : 'transparent',
              color: activeMenu === 'help' ? '#ffffff' : '#000000',
            }}
            onClick={() => setActiveMenu(activeMenu === 'help' ? null : 'help')}
          >
            <u>H</u>elp
          </span>
          {activeMenu === 'help' && (
            <div className="win95-dropdown-menu">
              <div className="win95-dropdown-item" onClick={() => { onOpenHelp(); setActiveMenu(null); }}>
                <span>📖 SQL Query Tutorial...</span>
              </div>
              <div className="win95-dropdown-item" onClick={() => { onStartTour(); setActiveMenu(null); }}>
                <span>💡 Guided Balloon Tour</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Toolbar */}
      <Toolbar
        dialect={dialect}
        onDialectChange={onDialectChange}
        onRun={handleExecute}
        onReset={onReset}
        onFormatSql={handleFormatSql}
        onInsertTemplate={handleInsertTemplate}
        onToggleHistory={() => setIsHistoryOpen(true)}
        onOpenHelp={onOpenHelp}
        onOpenSettings={onOpenSettings}
        onStartTour={onStartTour}
        isLoading={activeTab.isLoading}
        hasSelection={hasSelection}
        historyCount={queryHistory.length}
      />

      {/* Main Studio Body Layout with Resizable Split Panes */}
      <div ref={studioBodyRef} style={{ display: 'flex', flex: 1, padding: '4px', gap: '2px', overflow: 'hidden', position: 'relative' }}>
        {/* Left Explorer Pane (Schema Tree) */}
        {showExplorer && (
          <div id="tour-schema-tree" style={{ width: `${sidebarWidth}px`, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <SchemaTree
              catalog={catalog}
              onSelectTable={handleSelectTable}
              onRefresh={handleRefresh}
            />
          </div>
        )}

        {/* Sidebar Drag Resizer Handle */}
        {showExplorer && (
          <div
            onMouseDown={() => setIsResizingSidebar(true)}
            style={{
              width: '6px',
              cursor: 'col-resize',
              background: '#c0c0c0',
              borderLeft: '1px solid #ffffff',
              borderRight: '1px solid #808080',
              userSelect: 'none',
            }}
          />
        )}

        {/* Right Work Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px', height: '100%', overflow: 'hidden' }}>
          {/* Query Editor Multi-Tab Bar */}
          <div id="tour-query-tabs" className="win95-editor-tabs">
            {tabs.map((tab) => {
              const isActive = tab.id === activeTabId;
              return (
                <div
                  key={tab.id}
                  className={`win95-editor-tab ${isActive ? 'active' : ''}`}
                  onClick={() => handleSelectTab(tab.id)}
                  title={tab.title}
                >
                  <span>📄</span>
                  <span>{tab.title}</span>
                  <button
                    className="win95-editor-tab-close"
                    onClick={(e) => handleCloseTab(e, tab.id)}
                    title="Close Tab"
                  >
                    ✕
                  </button>
                </div>
              );
            })}

            <button
              className="win95-new-tab-btn"
              onClick={() => handleNewTab()}
              title="Open New Query Tab"
            >
              +
            </button>

            <button
              className="win95-button"
              style={{ fontSize: '9px', padding: '1px 6px', marginLeft: 'auto' }}
              onClick={() => setShowExplorer(!showExplorer)}
              title="Toggle Schema Sidebar"
            >
              {showExplorer ? '◀ Hide Sidebar' : '▶ Show Sidebar'}
            </button>
          </div>

          {/* Query Editor Pane */}
          <div id="tour-query-editor" style={{ height: `${editorHeightPercent}%`, minHeight: '110px' }}>
            <QueryEditor
              value={activeTab.queryText}
              onChange={handleActiveQueryChange}
              onRun={onRun}
              dialect={dialect}
              onSelectionChange={(hasSel, selText) => {
                setHasSelection(hasSel);
                setSelectedText(selText);
              }}
            />
          </div>

          {/* Vertical Drag Resizer Handle */}
          <div
            onMouseDown={() => setIsResizingVertical(true)}
            style={{
              height: '6px',
              cursor: 'row-resize',
              background: '#c0c0c0',
              borderTop: '1px solid #ffffff',
              borderBottom: '1px solid #808080',
              userSelect: 'none',
            }}
          />

          {/* Results Grid Pane */}
          <div id="tour-results-grid" style={{ flex: 1, overflow: 'hidden' }}>
            <ResultsGrid
              result={activeTab.result}
              isLoading={activeTab.isLoading}
              executionTimeMs={activeTab.executionTimeMs}
              dialect={dialect}
            />
          </div>
        </div>
      </div>

      {/* Global Window Status Bar */}
      <div className="win95-statusbar">
        <div className="win95-statusbar-pane" style={{ flex: 1 }}>
          {activeTab.isLoading ? 'Executing Query...' : 'Ready'} — Tab {tabs.findIndex((t) => t.id === activeTabId) + 1} of {tabs.length}
        </div>
        <div className="win95-statusbar-pane">
          Dialect: <strong>{dialect}</strong>
        </div>
        <div className="win95-statusbar-pane">
          Engine: <strong>In-Browser WASM Kernel</strong>
        </div>
      </div>

      {/* Query History Modal Drawer */}
      {isHistoryOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999999,
          }}
        >
          <div className="win95-window" style={{ width: '540px', height: '420px', display: 'flex', flexDirection: 'column', boxShadow: '4px 4px 10px rgba(0,0,0,0.5)' }}>
            <div className="win95-titlebar">
              <div className="win95-titlebar-text">
                <span>🕒</span>
                <span>Query Execution History ({queryHistory.length} entries)</span>
              </div>
              <div className="win95-titlebar-controls">
                <button className="win95-btn-titlebar" onClick={() => setIsHistoryOpen(false)}>
                  ✕
                </button>
              </div>
            </div>

            <div style={{ padding: '8px', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '6px' }}>
                Recent Executed Queries:
              </div>

              <div className="win95-sunken" style={{ flex: 1, overflow: 'auto', background: '#ffffff', padding: '4px' }}>
                {queryHistory.length === 0 ? (
                  <div style={{ padding: '20px', color: '#888', textAlign: 'center', fontSize: '11px' }}>
                    No execution history recorded in this session. Run queries to populate history!
                  </div>
                ) : (
                  queryHistory.map((item, idx) => (
                    <div
                      key={item.id}
                      style={{
                        padding: '6px',
                        borderBottom: '1px solid #e0e0e0',
                        fontSize: '11px',
                        background: idx % 2 === 0 ? '#fcfcfc' : '#ffffff',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666', fontSize: '10px', marginBottom: '3px' }}>
                        <span>
                          🕒 {item.timestamp.toLocaleTimeString()} | Dialect: <strong>{item.dialect}</strong>
                        </span>
                        <span style={{ color: '#006600', fontWeight: 'bold' }}>
                          {item.rowCount} rows ({item.executionTimeMs?.toFixed(1)} ms)
                        </span>
                      </div>

                      <pre
                        style={{
                          margin: 0,
                          fontFamily: 'monospace',
                          fontSize: '10px',
                          whiteSpace: 'pre-wrap',
                          background: '#f4f4f4',
                          padding: '4px',
                          border: '1px solid #ddd',
                          maxHeight: '60px',
                          overflow: 'hidden',
                        }}
                      >
                        {item.sql}
                      </pre>

                      <div style={{ display: 'flex', gap: '4px', marginTop: '4px', justifyContent: 'flex-end' }}>
                        <button
                          className="win95-button"
                          style={{ fontSize: '9px', padding: '1px 6px' }}
                          onClick={() => {
                            handleActiveQueryChange(item.sql);
                            setIsHistoryOpen(false);
                          }}
                        >
                          📥 Load into Active Tab
                        </button>
                        <button
                          className="win95-button"
                          style={{ fontSize: '9px', padding: '1px 6px' }}
                          onClick={() => {
                            handleNewTab(`History #${queryHistory.length - idx}.sql`, item.sql);
                            setIsHistoryOpen(false);
                          }}
                        >
                          ➕ Open in New Tab
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                <button
                  className="win95-button"
                  style={{ fontSize: '10px' }}
                  onClick={() => setQueryHistory([])}
                  disabled={queryHistory.length === 0}
                >
                  🗑️ Clear History
                </button>
                <button className="win95-button" style={{ fontWeight: 'bold' }} onClick={() => setIsHistoryOpen(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
