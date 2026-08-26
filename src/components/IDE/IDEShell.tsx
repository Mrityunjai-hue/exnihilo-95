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
import { useDraggable } from '../../hooks/useDraggable';
import { Dialect } from '../../engine/parser';
import { SQLExecutor, ExecutionSuccess } from '../../engine/executor';
import { QueryEditor } from './QueryEditor';
import { ResultsGrid } from './ResultsGrid';
import { SchemaTree } from './SchemaTree';
import { Toolbar } from './Toolbar';
import { ERDViewer } from './ERDViewer';
import { WindowControls } from '../Win95/WindowControls';
import {
  useWorkspaceStorage,
  loadWorkspaceFromStorage,
  removeTabFromStorage,
  clearWorkspaceStorage,
  PersistedTabMeta,
} from '../../hooks/useWorkspaceStorage';


interface QueryTab {
  id:              string;
  title:           string;
  queryText:       string;
  result:          ExecutionSuccess | null;
  isLoading:       boolean;
  executionTimeMs: number | null;
  isPinned?:       boolean;
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
  crtEnabled?:             boolean;
  onToggleCrt?:            () => void;
}

export const IDEShell: React.FC<IDEShellProps> = ({
  isOpen,
  isMinimized,
  zIndex,
  position: propPosition,
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
  crtEnabled,
  onToggleCrt,
}) => {
  const { position, handleMouseDown: handleHeaderDrag } = useDraggable(propPosition || { x: 40, y: 30 });
  const [activeMenu, setActiveMenu] = useState<'file' | 'edit' | 'query' | 'view' | 'tools' | 'help' | null>(null);
  const [showExplorer, setShowExplorer] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(240);
  const [editorHeightPercent, setEditorHeightPercent] = useState(42); // 42% height for editor
  const [hasSelection, setHasSelection] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [isMaximized, setIsMaximized] = useState(false);

  // Query History State
  const [queryHistory, setQueryHistory] = useState<QueryHistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Drag Resizing State
  const [isResizingSidebar, setIsResizingSidebar] = useState(false);
  const [isResizingVertical, setIsResizingVertical] = useState(false);

  const menuBarRef = useRef<HTMLDivElement>(null);
  const studioBodyRef = useRef<HTMLDivElement>(null);

  // ── Multi-Tab State Management with Debounced Persistence ─────────────────
  const { saveWorkspaceDebounced, storageEstimate, formatIDEDisk } = useWorkspaceStorage(500);
  const [showFormatConfirmDialog, setShowFormatConfirmDialog] = useState(false);

  const [tabs, setTabs] = useState<QueryTab[]>(() => {

    const stored = loadWorkspaceFromStorage();
    if (stored && stored.tabs.length > 0) {
      return stored.tabs.map((t) => ({
        id: t.id,
        title: t.title,
        queryText: t.queryText,
        result: null,
        isLoading: false,
        executionTimeMs: null,
      }));
    }
    return [
      {
        id: 'tab_1',
        title: 'Query 1.sql',
        queryText: initialQueryText,
        result: initialResult,
        isLoading: initialIsLoading,
        executionTimeMs: initialExecutionTimeMs,
      },
    ];
  });

  const [activeTabId, setActiveTabId] = useState<string>(() => {
    const stored = loadWorkspaceFromStorage();
    if (stored && stored.activeTabId && stored.tabs.some((t) => t.id === stored.activeTabId)) {
      return stored.activeTabId;
    }
    return 'tab_1';
  });

  const [tabContextMenu, setTabContextMenu] = useState<{ x: number; y: number; tabId: string } | null>(null);
  const [isERDOpen, setIsERDOpen] = useState(false);

  const handleTogglePin = (tabId: string) => {
    setTabs((prev) =>
      prev.map((t) => (t.id === tabId ? { ...t, isPinned: !t.isPinned } : t))
    );
  };

  const handleReset = () => {
    onReset();
    clearWorkspaceStorage();
    const resetTab: QueryTab = {
      id: 'tab_1',
      title: 'Query 1.sql',
      queryText: `-- Welcome to ExNihilo 95!\n-- Memory & catalog reset successfully.\nSELECT * FROM customers;`,
      result: null,
      isLoading: false,
      executionTimeMs: null,
      isPinned: false,
    };
    setTabs([resetTab]);
    setActiveTabId('tab_1');
    onQueryChange(resetTab.queryText);
    setRefreshKey((k) => k + 1);
  };

  // Sync workspace state to localStorage with 500ms debounce
  useEffect(() => {
    const meta = tabs.map((t) => ({
      id: t.id,
      title: t.title,
      queryText: t.queryText,
      dialect,
      isPinned: Boolean(t.isPinned),
    }));
    saveWorkspaceDebounced(meta, activeTabId);
  }, [tabs, activeTabId, dialect, saveWorkspaceDebounced]);

  // Safe Alt Keyboard Shortcuts (Alt+T, Alt+W, Alt+], Alt+[)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!e.altKey) return;

      const keyLower = e.key.toLowerCase();
      if (keyLower === 't') {
        e.preventDefault();
        const nextNum = tabs.length + 1;
        const newTabId = `tab_${Date.now()}`;
        const initialSql = `-- Query ${nextNum}.sql\n\n`;
        const newTab: QueryTab = {
          id: newTabId,
          title: `Query ${nextNum}.sql`,
          queryText: initialSql,
          result: null,
          isLoading: false,
          executionTimeMs: null,
        };
        setTabs((prev) => [...prev, newTab]);
        setActiveTabId(newTabId);
        onQueryChange(initialSql);
      } else if (keyLower === 'w') {
        e.preventDefault();
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
          return;
        }
        removeTabFromStorage(activeTabId);
        const remaining = tabs.filter((t) => t.id !== activeTabId);
        setTabs(remaining);
        const nextActive = remaining[remaining.length - 1];
        setActiveTabId(nextActive.id);
        onQueryChange(nextActive.queryText);
      } else if (e.key === ']' || e.key === '}') {
        e.preventDefault();
        const currIdx = tabs.findIndex((t) => t.id === activeTabId);
        const nextIdx = (currIdx + 1) % tabs.length;
        setActiveTabId(tabs[nextIdx].id);
        onQueryChange(tabs[nextIdx].queryText);
      } else if (e.key === '[' || e.key === '{') {
        e.preventDefault();
        const currIdx = tabs.findIndex((t) => t.id === activeTabId);
        const prevIdx = (currIdx - 1 + tabs.length) % tabs.length;
        setActiveTabId(tabs[prevIdx].id);
        onQueryChange(tabs[prevIdx].queryText);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeTabId, tabs, onQueryChange]);

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
      setTabContextMenu(null);
    };
    window.addEventListener('mousedown', handleOutsideClick);
    return () => window.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  if (!isOpen) return null;

  const catalog = executor.getCatalog();
  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  // ── Tab Operations & Context Menu ─────────────────────────────────────────

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
    setTabContextMenu(null);
  };

  const handleCloseTab = (e: React.MouseEvent | null, tabIdToClose: string) => {
    if (e) e.stopPropagation();
    removeTabFromStorage(tabIdToClose);

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
      setTabContextMenu(null);
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
    setTabContextMenu(null);
  };

  const handleDuplicateTab = (tabIdToDuplicate: string) => {
    const target = tabs.find((t) => t.id === tabIdToDuplicate);
    if (!target) return;
    const newTabId = `tab_${Date.now()}`;
    const newTab: QueryTab = {
      id: newTabId,
      title: `${target.title.replace(/\.sql$/i, '')} (Copy).sql`,
      queryText: target.queryText,
      result: null,
      isLoading: false,
      executionTimeMs: null,
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newTabId);
    onQueryChange(target.queryText);
    setTabContextMenu(null);
  };

  const handleCloseOtherTabs = (targetTabId: string) => {
    tabs.filter((t) => t.id !== targetTabId).forEach((t) => removeTabFromStorage(t.id));
    const kept = tabs.filter((t) => t.id === targetTabId);
    setTabs(kept);
    setActiveTabId(targetTabId);
    if (kept[0]) onQueryChange(kept[0].queryText);
    setTabContextMenu(null);
  };

  const handleTabContextMenu = (e: React.MouseEvent, tabId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setTabContextMenu({ x: e.clientX, y: e.clientY, tabId });
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

  if (!isOpen) return null;

  return (
    <div
      className="win95-window"
      style={
        isMaximized
          ? {
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: 'calc(100vh - 32px)',
              maxWidth: '100vw',
              maxHeight: 'calc(100vh - 32px)',
              zIndex,
              display: isMinimized ? 'none' : 'flex',
              flexDirection: 'column',
              borderRadius: 0,
              boxSizing: 'border-box',
            }
          : {
              position: 'absolute',
              top: `${position.y}px`,
              left: `${position.x}px`,
              width: 'calc(100vw - 100px)',
              height: 'calc(100vh - 100px)',
              maxWidth: '1280px',
              maxHeight: '800px',
              zIndex,
              display: isMinimized ? 'none' : 'flex',
              flexDirection: 'column',
            }
      }
      onMouseDown={onFocus}
    >
      {/* Titlebar with Drag & Double-Click Maximize */}
      <div
        className="win95-titlebar"
        onMouseDown={(e) => {
          onFocus();
          if (!isMaximized) handleHeaderDrag(e);
        }}
        onDoubleClick={() => setIsMaximized((prev) => !prev)}
        style={{ cursor: isMaximized ? 'default' : 'move' }}
      >
        <div className="win95-titlebar-text">
          <span>🗄️</span>
          <span>ExNihilo SQL Studio — [{dialect}] — {activeTab.title}</span>
        </div>
        <WindowControls
          onMinimize={onMinimize}
          onMaximize={() => setIsMaximized((prev) => !prev)}
          isMaximized={isMaximized}
          onClose={onClose}
        />
      </div>

      {/* Menu Strip */}
      <div
        ref={menuBarRef}
        style={{
          display: 'flex',
          gap: '2px',
          padding: '2px 4px',
          borderBottom: '1px solid var(--w95-dark-gray, #808080)',
          fontSize: '11px',
          position: 'relative',
          background: 'var(--w95-gray, #c0c0c0)',
          color: 'var(--w95-text-color, #000000)',
        }}
      >
        {/* FILE MENU */}
        <div style={{ position: 'relative' }}>
          <span
            style={{
              cursor: 'pointer',
              padding: '2px 6px',
              backgroundColor: activeMenu === 'file' ? 'var(--w95-title-active-bg, #000080)' : 'transparent',
              color: activeMenu === 'file' ? '#ffffff' : 'var(--w95-text-color, #000000)',
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
              backgroundColor: activeMenu === 'edit' ? 'var(--w95-title-active-bg, #000080)' : 'transparent',
              color: activeMenu === 'edit' ? '#ffffff' : 'var(--w95-text-color, #000000)',
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
              backgroundColor: activeMenu === 'query' ? 'var(--w95-title-active-bg, #000080)' : 'transparent',
              color: activeMenu === 'query' ? '#ffffff' : 'var(--w95-text-color, #000000)',
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
              backgroundColor: activeMenu === 'view' ? 'var(--w95-title-active-bg, #000080)' : 'transparent',
              color: activeMenu === 'view' ? '#ffffff' : 'var(--w95-text-color, #000000)',
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
              <div className="win95-dropdown-divider" />
              <div className="win95-dropdown-item" onClick={() => { setIsERDOpen(true); setActiveMenu(null); }}>
                <span>🌐 Entity Relationship Diagram (ERD)</span>
              </div>
              <div className="win95-dropdown-item" onClick={() => { onOpenSettings(); setActiveMenu(null); }}>
                <span>🎨 Vintage Themes & Dark Mode...</span>
              </div>
              <div className="win95-dropdown-item" onClick={() => { onToggleCrt?.(); setActiveMenu(null); }}>
                <span>{crtEnabled ? '✓ 📺 CRT Scanline Filter (ON)' : '  📺 CRT Scanline Filter (OFF)'}</span>
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
              backgroundColor: activeMenu === 'help' ? 'var(--w95-title-active-bg, #000080)' : 'transparent',
              color: activeMenu === 'help' ? '#ffffff' : 'var(--w95-text-color, #000000)',
            }}
            onClick={() => setActiveMenu(activeMenu === 'help' ? null : 'help')}
          >
            <u>H</u>elp
          </span>
          {activeMenu === 'help' && (
            <div className="win95-dropdown-menu">
              <div className="win95-dropdown-item" onClick={() => { onOpenHelp(); setActiveMenu(null); }}>
                <span>📖 Open SQL Tutorial Guide (`winhlp32.exe`)</span>
              </div>
              <div className="win95-dropdown-item" onClick={() => { onStartTour(); setActiveMenu(null); }}>
                <span>💡 Start Guided Feature Tour</span>
              </div>
              <div className="win95-dropdown-divider" />
              <div className="win95-dropdown-item" onClick={() => { onOpenSettings(); setActiveMenu(null); }}>
                <span>⚙️ Options & Control Panel...</span>
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
        onReset={handleReset}
        onFormatSql={handleFormatSql}
        onInsertTemplate={handleInsertTemplate}
        onToggleHistory={() => setIsHistoryOpen(true)}
        onOpenERD={() => setIsERDOpen(true)}
        onOpenHelp={onOpenHelp}
        onOpenSettings={onOpenSettings}
        onStartTour={onStartTour}
        crtEnabled={crtEnabled}
        onToggleCrt={onToggleCrt}
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
            {[...tabs]
              .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0))
              .map((tab) => {
                const isActive = tab.id === activeTabId;
                return (
                  <div
                    key={tab.id}
                    className={`win95-editor-tab ${isActive ? 'active' : ''}`}
                    onClick={() => handleSelectTab(tab.id)}
                    onContextMenu={(e) => handleTabContextMenu(e, tab.id)}
                    title={tab.title}
                  >
                    <button
                      type="button"
                      style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: '10px' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTogglePin(tab.id);
                      }}
                      title={tab.isPinned ? 'Unpin tab' : 'Pin tab'}
                    >
                      {tab.isPinned ? '📌' : '📄'}
                    </button>
                    <span>{tab.title}</span>
                    {!tab.isPinned && (
                      <button
                        className="win95-editor-tab-close"
                        onClick={(e) => handleCloseTab(e, tab.id)}
                        title="Close Tab"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                );
              })}

            {tabContextMenu && (
              <div
                className="win95-dropdown-menu"
                onMouseDown={(e) => e.stopPropagation()}
                style={{
                  position: 'fixed',
                  left: `${tabContextMenu.x}px`,
                  top: `${tabContextMenu.y}px`,
                  zIndex: 9999,
                  boxShadow: '2px 2px 5px rgba(0,0,0,0.5)',
                }}
              >
                <div className="win95-dropdown-item" onClick={() => handleDuplicateTab(tabContextMenu.tabId)}>
                  <span>📋 Duplicate Tab</span>
                </div>
                <div className="win95-dropdown-item" onClick={() => handleCloseOtherTabs(tabContextMenu.tabId)}>
                  <span>❌ Close Other Tabs</span>
                </div>
              </div>
            )}


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
        <div className="win95-statusbar-pane" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>Storage: <strong>{storageEstimate.usedMb} MB / {storageEstimate.totalQuotaMb} MB</strong></span>
          <button
            type="button"
            className="win95-button"
            style={{ fontSize: '9px', padding: '0 4px', height: '16px', lineHeight: '14px' }}
            onClick={() => setShowFormatConfirmDialog(true)}
            title="Format IDE IndexedDB disk (preserves user login/auth session)"
          >
            💾 Format IDE Disk
          </button>
        </div>
      </div>

      {/* Format IDE Disk Confirmation Modal */}
      {showFormatConfirmDialog && (
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
          <div className="win95-window" style={{ width: '400px', boxShadow: '4px 4px 10px rgba(0,0,0,0.5)' }}>
            <div className="win95-titlebar">
              <div className="win95-titlebar-text">
                <span>⚠️</span>
                <span>Confirm Format IDE Disk</span>
              </div>
              <div className="win95-titlebar-controls">
                <button className="win95-btn-titlebar" onClick={() => setShowFormatConfirmDialog(false)}>
                  ✕
                </button>
              </div>
            </div>

            <div style={{ padding: '16px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '12px' }}>
                <span style={{ fontSize: '32px' }}>💾</span>
                <div style={{ fontSize: '11px', lineHeight: '1.5' }}>
                  <strong>Are you sure you want to Format the IDE Disk?</strong>
                  <p style={{ margin: '4px 0 0 0', color: '#555' }}>
                    This will clear all saved SQL query tabs from IndexedDB and reset the IDE workspace.
                    <br /><br />
                    <strong style={{ color: '#006600' }}>✓ Safe Hybrid Storage:</strong> Your login account, credentials, and user session in localStorage will remain <strong>100% untouched</strong>.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
                <button
                  className="win95-button"
                  style={{ fontWeight: 'bold', color: '#b00020' }}
                  onClick={async () => {
                    await formatIDEDisk();
                    const resetTabId = 'tab_1';
                    const resetTab: QueryTab = {
                      id: resetTabId,
                      title: 'Query 1.sql',
                      queryText: initialQueryText,
                      result: null,
                      isLoading: false,
                      executionTimeMs: null,
                    };
                    setTabs([resetTab]);
                    setActiveTabId(resetTabId);
                    onQueryChange(initialQueryText);
                    setShowFormatConfirmDialog(false);
                  }}
                >
                  Confirm Format
                </button>
                <button className="win95-button" onClick={() => setShowFormatConfirmDialog(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


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

      {/* Interactive ERD Diagram Viewer */}
      {isERDOpen && <ERDViewer catalog={catalog} onClose={() => setIsERDOpen(false)} />}
    </div>
  );
};
