/**
 * IDEShell.tsx — Main Windows 95 SQL IDE Application Window
 * Supports:
 *  - Multiple Query Tabs
 *  - Table-click opens in dedicated new tab
 *  - Full authentic Windows 95 Menu Bar Dropdowns (File, Edit, Query, View, Tools, Help)
 *  - Export / Download .sql queries
 *  - Sample SQL templates insert
 *  - Toggleable Left Explorer Pane
 */

import React, { useState, useEffect, useRef } from 'react';
import { Dialect } from '../../engine/parser';
import { ExecutionSuccess, SQLExecutor } from '../../engine/executor';
import { Toolbar } from './Toolbar';
import { SchemaTree } from './SchemaTree';
import { QueryEditor } from './QueryEditor';
import { ResultsGrid } from './ResultsGrid';
import { useDraggable } from '../../hooks/useDraggable';

export interface QueryTab {
  id:              string;
  title:           string;
  queryText:       string;
  result:          ExecutionSuccess | null;
  isLoading:       boolean;
  executionTimeMs: number | null;
}

interface IDEShellProps {
  isOpen:         boolean;
  isMinimized:    boolean;
  zIndex:         number;
  executor:       SQLExecutor;
  dialect:        Dialect;
  queryText:      string;
  result:         ExecutionSuccess | null;
  isLoading:      boolean;
  executionTimeMs: number | null;
  onQueryChange:  (query: string) => void;
  onDialectChange: (dialect: Dialect) => void;
  onRun:          (queryToRun?: string) => void;
  onReset:        () => void;
  onClose:        () => void;
  onMinimize:     () => void;
  onFocus:        () => void;
  onOpenHelp:     () => void;
  onOpenSettings: () => void;
  onStartTour:    () => void;
}

export const IDEShell: React.FC<IDEShellProps> = ({
  isOpen,
  isMinimized,
  zIndex,
  executor,
  dialect,
  queryText: initialQueryText,
  result: initialResult,
  isLoading: initialIsLoading,
  executionTimeMs: initialExecutionTimeMs,
  onQueryChange,
  onDialectChange,
  onRun,
  onReset,
  onClose,
  onMinimize,
  onFocus,
  onOpenHelp,
  onOpenSettings,
  onStartTour,
}) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [showExplorer, setShowExplorer] = useState(true);
  const [hasSelection, setHasSelection] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [activeMenu, setActiveMenu] = useState<'file' | 'edit' | 'query' | 'view' | 'tools' | 'help' | null>(null);
  const [, setRefreshKey] = useState(0);
  const { position, handleMouseDown } = useDraggable({ x: 50, y: 30 });
  const menuBarRef = useRef<HTMLDivElement>(null);

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

  // Sync external props with active tab
  useEffect(() => {
    setTabs((prev) =>
      prev.map((tab) =>
        tab.id === activeTabId
          ? {
              ...tab,
              result: initialResult,
              isLoading: initialIsLoading,
              executionTimeMs: initialExecutionTimeMs,
            }
          : tab
      )
    );
  }, [initialResult, initialIsLoading, initialExecutionTimeMs]);

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

  // Add New Tab
  const handleNewTab = (customTitle?: string, customSql?: string) => {
    const nextNum = tabs.length + 1;
    const newTabId = `tab_${Date.now()}`;
    const newTab: QueryTab = {
      id: newTabId,
      title: customTitle || `Query ${nextNum}.sql`,
      queryText: customSql || `-- Query ${nextNum}\nSELECT o.id, c.name FROM orders o JOIN customers c ON o.customer_id = c.id;`,
      result: null,
      isLoading: false,
      executionTimeMs: null,
    };

    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newTabId);
    onQueryChange(newTab.queryText);
    setActiveMenu(null);
  };

  // Close Tab safely
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

  // Switch Active Tab
  const handleSelectTab = (tabId: string) => {
    setActiveTabId(tabId);
    const targetTab = tabs.find((t) => t.id === tabId);
    if (targetTab) {
      onQueryChange(targetTab.queryText);
    }
  };

  // Update query in active tab
  const handleActiveQueryChange = (newText: string) => {
    setTabs((prev) =>
      prev.map((t) => (t.id === activeTabId ? { ...t, queryText: newText } : t))
    );
    onQueryChange(newText);
  };

  // Open clicked table in a dedicated tab
  const handleSelectTable = (tableName: string) => {
    const tabTitle = `${tableName}.sql`;
    const existing = tabs.find(
      (t) => t.title.toLowerCase() === tabTitle.toLowerCase() || t.id === `tbl_${tableName.toLowerCase()}`
    );

    if (existing) {
      handleSelectTab(existing.id);
      return;
    }

    handleNewTab(tabTitle, `SELECT * FROM ${tableName};`);
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

  // Download SQL query as a file
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

  // Insert template SQL
  const handleInsertTemplate = (sqlTemplate: string) => {
    handleActiveQueryChange(sqlTemplate);
    setActiveMenu(null);
  };

  return (
    <div
      className="win95-window"
      style={{
        position: 'absolute',
        top: isMaximized ? 0 : `${position.y}px`,
        left: isMaximized ? 0 : `${position.x}px`,
        width: isMaximized ? '100vw' : 'calc(100vw - 100px)',
        height: isMaximized ? 'calc(100vh - 30px)' : 'calc(100vh - 100px)',
        maxWidth: isMaximized ? '100vw' : '1280px',
        maxHeight: isMaximized ? 'calc(100vh - 30px)' : '800px',
        zIndex,
      }}
      onMouseDown={onFocus}
    >
      {/* Titlebar with Drag Handler */}
      <div
        className="win95-titlebar"
        onMouseDown={(e) => {
          onFocus();
          if (!isMaximized) handleMouseDown(e);
        }}
        style={{ cursor: isMaximized ? 'default' : 'move' }}
      >
        <div className="win95-titlebar-text">
          <span>🗄️</span>
          <span>ExNihilo SQL Studio — [{dialect}] — {activeTab.title}</span>
        </div>
        <div className="win95-titlebar-controls">
          <button className="win95-btn-titlebar" onClick={onMinimize} title="Minimize">_</button>
          <button className="win95-btn-titlebar" onClick={() => setIsMaximized(!isMaximized)} title="Maximize">
            {isMaximized ? '❐' : '□'}
          </button>
          <button className="win95-btn-titlebar" onClick={onClose} title="Close">✕</button>
        </div>
      </div>

      {/* Cascading Menu Strip */}
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
                <span style={{ color: '#666', fontSize: '10px' }}>Ctrl+T</span>
              </div>
              <div className="win95-dropdown-item" onClick={handleDownloadSql}>
                <span>💾 Save / Export Query...</span>
                <span style={{ color: '#666', fontSize: '10px' }}>Ctrl+S</span>
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
              <div className="win95-dropdown-item" onClick={() => handleActiveQueryChange('')}>
                <span>✨ Clear Query Text</span>
              </div>
              <div className="win95-dropdown-divider" />
              <div
                className="win95-dropdown-item"
                onClick={() =>
                  handleInsertTemplate(
                    `SELECT o.id, c.name, o.total, c.email\nFROM orders o\nINNER JOIN customers c ON o.customer_id = c.id\nWHERE c.age > 25;`
                  )
                }
              >
                <span>🔹 Insert Sample JOIN</span>
              </div>
              <div
                className="win95-dropdown-item"
                onClick={() =>
                  handleInsertTemplate(
                    `SELECT department, COUNT(*) as total_staff, AVG(salary) as avg_pay\nFROM employees\nGROUP BY department\nHAVING avg_pay > 50000;`
                  )
                }
              >
                <span>🔹 Insert Sample GROUP BY</span>
              </div>
              <div
                className="win95-dropdown-item"
                onClick={() =>
                  handleInsertTemplate(
                    `WITH high_spenders AS (\n  SELECT customer_id, SUM(amount) as total_spent\n  FROM payments\n  GROUP BY customer_id\n  HAVING total_spent > 500\n)\nSELECT c.name, hs.total_spent\nFROM high_spenders hs\nJOIN customers c ON hs.customer_id = c.id;`
                  )
                }
              >
                <span>🔹 Insert Sample CTE Query</span>
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
                <span style={{ color: '#666', fontSize: '10px' }}>F5</span>
              </div>
              <div
                className={`win95-dropdown-item ${!hasSelection ? 'disabled' : ''}`}
                onClick={() => hasSelection && handleExecute()}
              >
                <span>▶ Run Selected Query</span>
              </div>
              <div className="win95-dropdown-divider" />
              <div
                className="win95-dropdown-item"
                onClick={() => {
                  setTabs((prev) =>
                    prev.map((t) => (t.id === activeTabId ? { ...t, result: null } : t))
                  );
                  setActiveMenu(null);
                }}
              >
                <span>🔄 Clear Result Grid</span>
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
                <span>{showExplorer ? '✓ Hide Explorer Pane' : '  Show Explorer Pane'}</span>
              </div>
              <div className="win95-dropdown-item" onClick={handleRefresh}>
                <span>🔄 Refresh Schema Tree</span>
              </div>
              <div className="win95-dropdown-divider" />
              <div className="win95-dropdown-item" onClick={() => { setIsMaximized(!isMaximized); setActiveMenu(null); }}>
                <span>{isMaximized ? '❐ Restore Window' : '□ Maximize Studio'}</span>
              </div>
            </div>
          )}
        </div>

        {/* TOOLS MENU */}
        <div style={{ position: 'relative' }}>
          <span
            style={{
              cursor: 'pointer',
              padding: '2px 6px',
              backgroundColor: activeMenu === 'tools' ? '#000080' : 'transparent',
              color: activeMenu === 'tools' ? '#ffffff' : '#000000',
            }}
            onClick={() => setActiveMenu(activeMenu === 'tools' ? null : 'tools')}
          >
            <u>T</u>ools
          </span>
          {activeMenu === 'tools' && (
            <div className="win95-dropdown-menu">
              <div className="win95-dropdown-item" onClick={() => { onOpenSettings(); setActiveMenu(null); }}>
                <span>⚙️ Options & Control Panel...</span>
              </div>
              <div className="win95-dropdown-divider" />
              <div className="win95-dropdown-item" onClick={() => { onReset(); setActiveMenu(null); }}>
                <span>🗑️ Reset Session & Database</span>
              </div>
            </div>
          )}
        </div>

        {/* HELP MENU */}
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
              <div className="win95-dropdown-divider" />
              <div className="win95-dropdown-item" onClick={() => { onOpenSettings(); setActiveMenu(null); }}>
                <span>✨ About ExNihilo 95</span>
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
        onOpenHelp={onOpenHelp}
        onOpenSettings={onOpenSettings}
        onStartTour={onStartTour}
        isLoading={activeTab.isLoading}
        hasSelection={hasSelection}
      />

      {/* Main Studio Body Layout */}
      <div style={{ display: 'flex', flex: 1, padding: '4px', gap: '4px', overflow: 'hidden' }}>
        {/* Left Explorer Pane (Schema Tree) */}
        {showExplorer && (
          <div id="tour-schema-tree" style={{ width: '240px', height: '100%' }}>
            <SchemaTree
              catalog={catalog}
              onSelectTable={handleSelectTable}
              onRefresh={handleRefresh}
            />
          </div>
        )}

        {/* Right Work Area (Multi-Tabs + Editor + Results Split) */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', height: '100%', overflow: 'hidden' }}>
          {/* Query Editor Multi-Tab Bar */}
          <div className="win95-editor-tabs">
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

            {/* + New Tab Button */}
            <button
              className="win95-new-tab-btn"
              onClick={() => handleNewTab()}
              title="Open New Query Tab (Ctrl+T)"
            >
              +
            </button>
          </div>

          {/* Query Editor Pane */}
          <div id="tour-query-editor" style={{ height: '40%', minHeight: '130px' }}>
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

          {/* Results Grid Pane */}
          <div id="tour-results-grid" style={{ flex: 1, overflow: 'hidden' }}>
            <ResultsGrid
              result={activeTab.result}
              isLoading={activeTab.isLoading}
              executionTimeMs={activeTab.executionTimeMs}
            />
          </div>
        </div>
      </div>

      {/* Global Window Status Bar */}
      <div className="win95-statusbar">
        <div className="win95-statusbar-pane" style={{ flex: 1 }}>
          {activeTab.isLoading ? 'Executing...' : 'Ready'} — Tab {tabs.findIndex((t) => t.id === activeTabId) + 1} of {tabs.length}
        </div>
        <div className="win95-statusbar-pane">
          Dialect: <strong>{dialect}</strong>
        </div>
        <div className="win95-statusbar-pane">
          Kernel: <strong>SQLite 3.49.1 (WASM)</strong>
        </div>
      </div>
    </div>
  );
};
