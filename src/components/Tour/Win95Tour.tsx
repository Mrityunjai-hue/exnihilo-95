/**
 * Win95Tour.tsx — Interactive Dynamic Target-Tracking Windows 95 Guided Tour
 * Dynamically tracks target DOM elements on screen, highlights them with a spotlight box,
 * and moves the balloon window with an arrow pointer directly pointing at each feature!
 */

import React, { useState, useEffect } from 'react';

interface Win95TourProps {
  isOpen:          boolean;
  onClose:         () => void;
  onOpenHelp:      () => void;
  onEnsureIDEOpen?: () => void;
}

interface TourStep {
  title:       string;
  content:     string;
  targetId?:   string;
  isHelpStep?: boolean;
}

export const Win95Tour: React.FC<Win95TourProps> = ({
  isOpen,
  onClose,
  onOpenHelp,
  onEnsureIDEOpen,
}) => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  // Reset to step 0 when tour opens & ensure IDE window is open and focused
  useEffect(() => {
    if (isOpen) {
      setCurrentStepIdx(0);
      if (onEnsureIDEOpen) {
        onEnsureIDEOpen();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);
  const [targetRect, setTargetRect] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);

  const tourSteps: TourStep[] = [
    {
      title: '✨ Welcome to ExNihilo 95',
      content:
        'ExNihilo 95 is a zero-configuration SQL development environment. It parses your query AST, infers table schemas automatically, and generates synthetic data in-memory without a database connection! Let\'s take a dynamic guided tour of all features and tools.',
    },
    {
      title: '1. Multi-Dialect Parser Engine',
      content:
        'Switch effortlessly between MySQL, PostgreSQL, SQLite, and SSMS (Transact-SQL). ExNihilo adapts syntax parsing rules, quote delimiters, and column types to match your target dialect.',
      targetId: 'dialect-select',
    },
    {
      title: '2. Run All & Selection Execution',
      content:
        'Execute all statements or highlight a specific SQL query in the editor to run only your selection. Press F5 or Ctrl+Enter to execute instantly.',
      targetId: 'btn-run',
    },
    {
      title: '3. 1-Click SQL Beautifier / Formatter',
      content:
        'Click "Format SQL" to automatically convert keywords (SELECT, FROM, WHERE, JOIN) to uppercase and format clause line breaks cleanly.',
      targetId: 'btn-format',
    },
    {
      title: '4. Prebuilt SQL Query Templates',
      content:
        'Quickly insert complex SQL queries (JOINs, GROUP BY aggregations, LEFT JOIN NULL filters, CTEs, INSERT statements) directly into your editor.',
      targetId: 'btn-templates',
    },
    {
      title: '5. Query Execution History Drawer',
      content:
        'View your session execution log with execution time (ms), row count, and status. Reload any past query into your current tab or open in a new tab.',
      targetId: 'btn-history',
    },
    {
      title: '6. Schema Explorer & DDL Generator',
      content:
        'Explore materialized tables, column types, and foreign key badges. Filter table names with real-time search, run 1-click COUNT(*), and view generated CREATE TABLE DDL schemas.',
      targetId: 'tour-schema-tree',
    },
    {
      title: '7. Multi-Tab Workspace & Tab Management',
      content:
        'Manage multiple query scripts simultaneously! Click the [+] button to open clean new query tabs without overwriting your existing code.',
      targetId: 'tour-query-tabs',
    },
    {
      title: '8. CodeMirror 6 Syntax Highlighting Editor',
      content:
        'Enjoy high-contrast Win95 coding: Strings in Vibrant Green (#008800), Numbers in Purple (#800080), Operators in Crimson (#b00020), and Keywords in Bold Navy (#000080).',
      targetId: 'tour-query-editor',
    },
    {
      title: '9. ListView Results Grid & 1-Click Export',
      content:
        'Sort column headers ascending/descending, filter rows in real time, double-click any cell to inspect raw data in a modal, and export results to CSV, JSON, or SQL INSERTs.',
      targetId: 'tour-results-grid',
    },
    {
      title: '10. Control Panel & Local Security',
      content:
        'Access user account management, vintage avatar selection, PBKDF2 600k password security, regional currency detection (INR, USD, EUR, etc.), and system settings.',
      targetId: 'btn-options',
    },
    {
      title: '11. Help Manual & Interactive SQL Tutorial',
      content:
        'Open the Windows 95 Help Manual (winhlp32) for in-depth SQL tutorials, syntax references, and runnable demo queries!',
      targetId: 'btn-help',
      isHelpStep: true,
    },
  ];

  // Track target DOM element coordinates on screen
  useEffect(() => {
    if (!isOpen) return;

    const updatePosition = () => {
      const targetId = tourSteps[currentStepIdx]?.targetId;
      if (!targetId) {
        setTargetRect(null);
        return;
      }

      const el = document.getElementById(targetId);
      if (el) {
        const rect = el.getBoundingClientRect();
        setTargetRect({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        });

        // Scroll element into view if needed
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        setTargetRect(null);
      }
    };

    updatePosition();
    const interval = setInterval(updatePosition, 300);
    window.addEventListener('resize', updatePosition);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', updatePosition);
    };
  }, [currentStepIdx, isOpen]);

  if (!isOpen) return null;

  const currentStep = tourSteps[currentStepIdx];
  const isLast = currentStepIdx === tourSteps.length - 1;

  const handleNext = () => {
    if (isLast) {
      onClose();
      onOpenHelp();
    } else {
      setCurrentStepIdx((prev) => prev + 1);
    }
  };

  // Compute balloon positioning relative to targetRect
  let balloonStyle: React.CSSProperties = {
    position: 'fixed',
    zIndex: 999999,
    width: '420px',
    boxShadow: '4px 4px 20px rgba(0,0,0,0.7)',
    transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
  };

  let arrowDirection: 'top' | 'bottom' | 'center' = 'center';

  if (targetRect) {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Prefer positioning below the target, or above if near bottom
    if (targetRect.top + targetRect.height + 240 < viewportHeight) {
      balloonStyle.top = `${targetRect.top + targetRect.height + 12}px`;
      balloonStyle.left = `${Math.max(16, Math.min(viewportWidth - 440, targetRect.left))}px`;
      arrowDirection = 'top';
    } else {
      balloonStyle.top = `${Math.max(16, targetRect.top - 230)}px`;
      balloonStyle.left = `${Math.max(16, Math.min(viewportWidth - 440, targetRect.left))}px`;
      arrowDirection = 'bottom';
    }
  } else {
    // Center modal fallback for step 1
    balloonStyle.top = '50%';
    balloonStyle.left = '50%';
    balloonStyle.transform = 'translate(-50%, -50%)';
  }

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 999990, pointerEvents: 'none' }}>
      {/* Target Element Spotlight Highlight Ring */}
      {targetRect && (
        <div
          style={{
            position: 'fixed',
            top: `${targetRect.top - 4}px`,
            left: `${targetRect.left - 4}px`,
            width: `${targetRect.width + 8}px`,
            height: `${targetRect.height + 8}px`,
            borderRadius: '4px',
            border: '2px solid #000080',
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.45), 0 0 15px #000080',
            zIndex: 999995,
            transition: 'all 0.3s ease',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Interactive Balloon Tour Window */}
      <div
        className="win95-window"
        style={{ ...balloonStyle, pointerEvents: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Pointer Arrow */}
        {targetRect && (
          <div
            style={{
              position: 'absolute',
              left: '24px',
              ...(arrowDirection === 'top'
                ? { top: '-10px', borderWidth: '0 10px 10px 10px', borderColor: 'transparent transparent #000080 transparent' }
                : { bottom: '-10px', borderWidth: '10px 10px 0 10px', borderColor: '#c0c0c0 transparent transparent transparent' }),
              width: 0,
              height: 0,
              borderStyle: 'solid',
            }}
          />
        )}

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
        <div style={{ padding: '14px', background: '#c0c0c0' }}>
          <div
            className="win95-inset"
            style={{
              padding: '12px',
              background: '#ffffe0',
              border: '1px solid #808000',
              marginBottom: '12px',
            }}
          >
            <h4 style={{ margin: '0 0 6px 0', fontSize: '12px', color: '#000080' }}>
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
              style={{ fontSize: '10px' }}
            >
              Skip Tour
            </button>

            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                className="win95-button"
                disabled={currentStepIdx === 0}
                onClick={() => setCurrentStepIdx((prev) => Math.max(0, prev - 1))}
                style={{ fontSize: '10px' }}
              >
                &lt; Back
              </button>

              <button
                className="win95-button win95-button-default"
                onClick={handleNext}
                style={{ fontSize: '10px', fontWeight: 'bold' }}
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
