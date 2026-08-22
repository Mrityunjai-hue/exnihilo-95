/**
 * IDEShell.tsx — Main Windows 95 SQL IDE Application Window
 */

import React, { useState } from 'react';
import { Dialect } from '../../engine/parser';
import { ExecutionSuccess, SQLExecutor } from '../../engine/executor';
import { Toolbar } from './Toolbar';
import { SchemaTree } from './SchemaTree';
import { QueryEditor } from './QueryEditor';
import { ResultsGrid } from './ResultsGrid';
import { useDraggable } from '../../hooks/useDraggable';

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
  onRun:          () => void;
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
  queryText,
  result,
  isLoading,
  executionTimeMs,
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
  const [, setRefreshKey] = useState(0);
  const { position, handleMouseDown } = useDraggable({ x: 50, y: 30 });

  if (!isOpen || isMinimized) return null;

  const catalog = executor.getCatalog();

  const handleSelectTable = (tableName: string) => {
    onQueryChange(`SELECT * FROM ${tableName};`);
  };

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
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
          <span>ExNihilo SQL Studio — [{dialect}]</span>
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
        <span style={{ cursor: 'pointer' }} onClick={onRun}><u>Q</u>uery</span>
        <span style={{ cursor: 'pointer' }} onClick={onReset}><u>E</u>dit</span>
        <span style={{ cursor: 'pointer' }} onClick={handleRefresh}><u>V</u>iew</span>
        <span style={{ cursor: 'pointer' }} onClick={onOpenSettings}><u>T</u>ools</span>
        <span style={{ cursor: 'pointer' }} onClick={onOpenHelp}><u>H</u>elp</span>
      </div>

      {/* Action Toolbar */}
      <Toolbar
        dialect={dialect}
        onDialectChange={onDialectChange}
        onRun={onRun}
        onReset={onReset}
        onOpenHelp={onOpenHelp}
        onOpenSettings={onOpenSettings}
        onStartTour={onStartTour}
        isLoading={isLoading}
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

        {/* Right Work Area (Editor + Results Split) */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', height: '100%', overflow: 'hidden' }}>
          {/* Query Editor Pane */}
          <div id="tour-query-editor" style={{ height: '42%', minHeight: '140px' }}>
            <QueryEditor
              value={queryText}
              onChange={onQueryChange}
              onRun={onRun}
              dialect={dialect}
            />
          </div>

          {/* Results Grid Pane */}
          <div id="tour-results-grid" style={{ flex: 1, overflow: 'hidden' }}>
            <ResultsGrid
              result={result}
              isLoading={isLoading}
              executionTimeMs={executionTimeMs}
            />
          </div>
        </div>
      </div>

      {/* Global Window Status Bar */}
      <div className="win95-statusbar">
        <div className="win95-statusbar-pane" style={{ flex: 1 }}>
          {isLoading ? 'Executing...' : 'Ready'}
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
