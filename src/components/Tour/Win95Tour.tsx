/**
 * Win95Tour.tsx — Interactive Windows 95 Guided Tour
 * Covers all features: Dialects, Multi-Tabs, Syntax Highlighting, Selection Execution,
 * Cascading Menus, Schema Tree Clicks, Result Grids, and the Help Manual.
 */

import React, { useState } from 'react';

interface Win95TourProps {
  isOpen:       boolean;
  onClose:      () => void;
  onOpenHelp:   () => void;
}

interface TourStep {
  title:        string;
  content:      string;
  targetId?:    string;
  isHelpStep?:  boolean;
}

export const Win95Tour: React.FC<Win95TourProps> = ({
  isOpen,
  onClose,
  onOpenHelp,
}) => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  if (!isOpen) return null;

  const tourSteps: TourStep[] = [
    {
      title: 'Welcome to ExNihilo 95',
      content: 'ExNihilo 95 is a zero-configuration SQL engine that parses your query AST, automatically deduces table schemas, and generates realistic synthetic data in-memory. Let\'s take a complete interactive tour of all features!',
    },
    {
      title: '1. Multi-Dialect Parser Support',
      content: 'Switch effortlessly between MySQL, PostgreSQL, SQLite, and SSMS (Transact-SQL). ExNihio automatically adapts syntax rules, quote delimiters, and type mappings to match your target dialect.',
      targetId: 'dialect-select',
    },
    {
      title: '2. Multi-Tab Query Workspace',
      content: 'Manage multiple SQL scripts simultaneously without losing query history! Click the [+] button or press Ctrl+T to open new tabs. Each tab retains its own independent editor code, results, and execution speed.',
      targetId: 'tour-query-editor',
    },
    {
      title: '3. High-Contrast Syntax Highlighting',
      content: 'Experience custom visual coding: text inside quotes turns Vibrant Green (#008800), numbers & comparison targets turn Bold Purple (#800080), operators turn Bold Crimson (#b00020), and keywords turn Navy Blue (#000080).',
      targetId: 'tour-query-editor',
    },
    {
      title: '4. Selection-Aware & Multi-Query Execution',
      content: 'Highlight any query block in the editor to instantly switch the toolbar button to "▶ Run Selection (F5)". Multi-statement queries separated by semicolons return convenient result tabs for each query.',
      targetId: 'btn-run',
    },
    {
      title: '5. Windows 95 Cascading Menus',
      content: 'Use authentic menu bars (File, Edit, Query, View, Tools, Help) for 1-click sample template insertions (JOINs, GROUP BY, CTEs), saving .sql files (Ctrl+S), toggling panels, and resetting database sessions.',
      targetId: 'tour-menu-bar',
    },
    {
      title: '6. Schema Tree & Table-Click New Tabs',
      content: 'The left explorer pane displays all materialized tables, columns, and foreign keys. Clicking any table automatically opens a dedicated {table}.sql tab with "SELECT * FROM {table};" without overwriting your queries.',
      targetId: 'tour-schema-tree',
    },
    {
      title: '7. ListView Results Grid & 1-Click Export',
      content: 'Browse query outputs in classic Windows 95 ListView grids with 3D beveled headers, row counts, and referential integrity stats. Easily export results to CSV or JSON with one click.',
      targetId: 'tour-results-grid',
    },
    {
      title: '8. Help Manual & Query Tutorial (winhlp32)',
      content: 'Need guidance writing advanced SQL (Subqueries, CTEs, Window Functions)? Open the Help Manual for full guides and interactive "👉 Try this query in IDE" buttons.',
      targetId: 'btn-help',
      isHelpStep: true,
    },
  ];

  const currentStep = tourSteps[currentStepIdx];
  const isLast = currentStepIdx === tourSteps.length - 1;

  const handleNext = () => {
    if (isLast) {
      onClose();
      onOpenHelp();
    } else {
      setCurrentStepIdx(currentStepIdx + 1);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        className="win95-window"
        style={{
          width: '450px',
          boxShadow: '4px 4px 20px rgba(0,0,0,0.8)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Titlebar */}
        <div className="win95-titlebar">
          <div className="win95-titlebar-text">
            <span>💡</span>
            <span>ExNihilo 95 Guided Tour — ({currentStepIdx + 1} of {tourSteps.length})</span>
          </div>
          <div className="win95-titlebar-controls">
            <button className="win95-btn-titlebar" onClick={onClose}>✕</button>
          </div>
        </div>

        {/* Balloon Body */}
        <div style={{ padding: '16px', background: '#c0c0c0' }}>
          <div
            className="win95-inset"
            style={{
              padding: '14px',
              background: '#ffffe0',
              border: '1px solid #808000',
              marginBottom: '14px',
            }}
          >
            <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#000080' }}>
              {currentStep.title}
            </h4>
            <p style={{ margin: 0, fontSize: '11px', lineHeight: '1.6', color: '#000000' }}>
              {currentStep.content}
            </p>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              className="win95-button"
              onClick={onClose}
              style={{ fontSize: '11px' }}
            >
              Skip Tour
            </button>

            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                className="win95-button"
                disabled={currentStepIdx === 0}
                onClick={() => setCurrentStepIdx(currentStepIdx - 1)}
                style={{ fontSize: '11px' }}
              >
                &lt; Back
              </button>

              <button
                className="win95-button win95-button-default"
                onClick={handleNext}
                style={{ fontSize: '11px', fontWeight: 'bold' }}
              >
                {isLast ? 'Finish & Open Help 📖' : 'Next >'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
