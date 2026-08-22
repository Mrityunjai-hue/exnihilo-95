/**
 * Win95Tour.tsx — Interactive Windows 95 Guided Tour with Query Tutorial Step
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
      title: 'Welcome to ExNihio Studio 95',
      content: 'ExNihio is a zero-configuration SQL engine that parses your query, automatically infers table schemas, and generates synthetic data on the fly. Let\'s take a quick look around!',
    },
    {
      title: '1. Choose Your SQL Dialect',
      content: 'Use the Dialect selector to switch between MySQL, PostgreSQL, SQLite, and SSMS (Transact-SQL). ExNihio adapts its parser to match your dialect rules.',
      targetId: 'dialect-select',
    },
    {
      title: '2. Write Any Query in the CodeMirror 6 Editor',
      content: 'Write standard SQL queries even for tables that don\'t exist yet! ExNihio infers data types from operators, functions, and WHERE clauses.',
      targetId: 'tour-query-editor',
    },
    {
      title: '3. Execute Instant Client-Side SQL',
      content: 'Press F5 or click the green ▶ Run button. ExNihio materializes the tables and returns results in milliseconds using in-memory WebAssembly.',
      targetId: 'btn-run',
    },
    {
      title: '4. Live Schema Explorer',
      content: 'Materialized tables, column types, and row counts appear here. Click any table to automatically generate a query for it.',
      targetId: 'tour-schema-tree',
    },
    {
      title: '5. ListView Results Grid',
      content: 'View your query output with 3D beveled headers, row counts, and referential integrity metrics.',
      targetId: 'tour-results-grid',
    },
    {
      title: '6. SQL Query Guide & Help Manual',
      content: 'Need help writing queries or understanding type inference? The ExNihio Help Manual includes interactive tutorials with "Try this query" buttons.',
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
          width: '420px',
          boxShadow: '4px 4px 20px rgba(0,0,0,0.8)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Titlebar */}
        <div className="win95-titlebar">
          <div className="win95-titlebar-text">
            <span>💡</span>
            <span>ExNihio Tour — ({currentStepIdx + 1} of {tourSteps.length})</span>
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
              padding: '12px',
              background: '#ffffe0',
              border: '1px solid #808000',
              marginBottom: '12px',
            }}
          >
            <h4 style={{ margin: '0 0 6px 0', fontSize: '13px', color: '#000080' }}>
              {currentStep.title}
            </h4>
            <p style={{ margin: 0, fontSize: '11px', lineHeight: '1.5', color: '#000000' }}>
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

              {currentStep.isHelpStep ? (
                <button
                  className="win95-button"
                  style={{ fontWeight: 'bold', fontSize: '11px', background: '#000080', color: '#ffffff' }}
                  onClick={() => {
                    onClose();
                    onOpenHelp();
                  }}
                >
                  📖 Open Query Tutorial
                </button>
              ) : (
                <button
                  className="win95-button"
                  style={{ fontWeight: 'bold', fontSize: '11px' }}
                  onClick={handleNext}
                >
                  Next &gt;
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
