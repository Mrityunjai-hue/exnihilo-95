/**
 * IDEShell.tsx — Main Windows 95 SQL IDE Application Window
 * Supports Multiple Query Tabs, Table-click New Tab opening, and independent tab result sets.
 */

import React, { useState, useEffect } from 'react';
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
  const [hasSelection, setHasSelection] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [, setRefreshKey] = useState(0);
  const { position, handleMouseDown } = useDraggable({ x: 50, y: 30 });

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

  if (!isOpen || isMinimized) return null;

  const catalog = executor.getCatalog();
  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  // ── Tab Operations ─────────────────────────────────────────────────────────

  // Add New Clean Tab
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
  };

  // Close Tab safely
  const handleCloseTab = (e: React.MouseEvent, tabIdToClose: string) => {
    e.stopPropagation();
    if (tabs.length <= 1) {
      // If closing the only tab, reset to clean Query 1
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
      return;
    }

    const remaining = tabs.filter((t) => t.id !== tabIdToClose);
    setTabs(remaining);

    if (activeTabId === tabIdToClose) {
      const nextActive = remaining[remaining.length - 1];
      setActiveTabId(nextActive.id);
      onQueryChange(nextActive.queryText);
    }
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

  // Open clicked table in a NEW tab (or switch to existing table tab)
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
  };

  const handleExecute = () => {
    const targetToRun = hasSelection && selectedText ? selectedText : activeTab.queryText;
    onRun(targetToRun);
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

      {/* Menu Strip */}
      <div style={{ display: 'flex', gap: '12px', padding: '2px 6px', borderBottom: '1px solid #808080', fontSize: '11px' }}>
        <span style={{ cursor: 'pointer' }} onClick={handleExecute}><u>Q</u>uery</span>
        <span style={{ cursor: 'pointer' }} onClick={() => handleNewTab()}><u>N</u>ew Tab</span>
        <span style={{ cursor: 'pointer' }} onClick={onReset}><u>E</u>dit</span>
        <span style={{ cursor: 'pointer' }} onClick={handleRefresh}><u>V</u>iew</span>
        <span style={{ cursor: 'pointer' }} onClick={onOpenSettings}><u>T</u>ools</span>
        <span style={{ cursor: 'pointer' }} onClick={onOpenHelp}><u>H</u>elp</span>
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
        <div id="tour-schema-tree" style={{ width: '240px', height: '100%' }}>
          <SchemaTree
            catalog={catalog}
            onSelectTable={handleSelectTable}
            onRefresh={handleRefresh}
          />
        </div>

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
