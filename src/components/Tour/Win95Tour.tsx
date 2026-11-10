/**
 * Win95Tour.tsx — Interactive Dynamic Target-Tracking Windows 95 Guided Tour
 * Dynamically tracks target DOM elements on screen, highlights them with a spotlight box,
 * and moves the balloon window with an arrow pointer directly pointing at each feature!
 * Covers the IDE, Visual Analytics Dashboard, ERD Viewer, Query Execution Plan,
 * SQL Challenge Arena, User Profile & Keyring, and Control Panel / Config sections.
 */

import React, { useState, useEffect } from 'react';

interface Win95TourProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenHelp: () => void;
  onEnsureIDEOpen?: () => void;
  onOpenSettings?: () => void;
  onOpenAuth?: () => void;
  onOpenERD?: () => void;
  onOpenChallenges?: () => void;
}

interface TourStep {
  title: string;
  content: string;
  targetId?: string;
  action?: 'ide' | 'erd' | 'challenges' | 'auth' | 'settings' | 'help';
  isHelpStep?: boolean;
}

export const Win95Tour: React.FC<Win95TourProps> = ({
  isOpen,
  onClose,
  onOpenHelp,
  onEnsureIDEOpen,
  onOpenSettings,
  onOpenAuth,
  onOpenERD,
  onOpenChallenges,
}) => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  // Reset to step 0 when tour opens & ensure IDE window is open and focused
  useEffect(() => {
    if (isOpen) {
      setCurrentStepIdx(0);
      onEnsureIDEOpen?.();
    }
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
        'ExNihilo ("out of nothing") is a zero-configuration SQL IDE and relational database studio. It parses query ASTs, deduces schemas automatically, and synthesizes realistic mock data in-memory without a database connection! Let\'s take a complete tour of the entire environment.',
      action: 'ide',
    },
    {
      title: '1. Multi-Dialect Parser Engine',
      content:
        'Switch effortlessly between MySQL, PostgreSQL, SQLite, and SSMS (Transact-SQL). ExNihilo adapts syntax parsing rules, quote delimiters, logical types, and clause formatting to match your target dialect.',
      targetId: 'dialect-select',
      action: 'ide',
    },
    {
      title: '2. Synthetic Row Count Generator',
      content:
        'Configure how many mock data rows are generated per table! Choose between 20 (Default), 50, 100, or 500 rows on the fly. The engine scales data volume while preserving foreign key relational integrity.',
      targetId: 'tb-rows-select',
      action: 'ide',
    },
    {
      title: '3. Run All & Selection Execution',
      content:
        'Execute all statements or highlight a specific SQL query in the editor to run only your selection. Press F5 or Ctrl+Enter to execute queries in sub-milliseconds via WebAssembly SQLite.',
      targetId: 'btn-run',
      action: 'ide',
    },
    {
      title: '4. 1-Click SQL Beautifier / Formatter',
      content:
        'Click "Format" to automatically convert keywords (SELECT, FROM, WHERE, JOIN) to uppercase and format clause line breaks cleanly.',
      targetId: 'btn-format',
      action: 'ide',
    },
    {
      title: '5. Prebuilt SQL Query Templates',
      content:
        'Quickly insert complex SQL queries (multi-table JOINs, GROUP BY aggregations, LEFT JOIN NULL filters, CTEs, INSERT statements) directly into your editor.',
      targetId: 'btn-templates',
      action: 'ide',
    },
    {
      title: '6. CodeMirror 6 Syntax Highlighting Editor',
      content:
        'Write SQL with intelligent autocomplete, high-contrast syntax highlighting (Strings in Green, Numbers in Purple, Operators in Crimson, Keywords in Bold Navy), line numbers, and bracket matching.',
      targetId: 'tour-query-editor',
      action: 'ide',
    },
    {
      title: '7. Results Grid & Visual Analytics Dashboard',
      content:
        'Explore results in two views: the virtualized Data Grid (column sorting, row filtering, cell modal inspector, and CSV/JSON/XLS exports) and the new Visual Analytics Dashboard featuring KPI stat cards, proportional category distribution bars, value trajectory trendlines, and a column health profiler matrix!',
      targetId: 'tour-results-grid',
      action: 'ide',
    },
    {
      title: '8. Visual Query Execution Plan & Optimizer',
      content:
        'Analyze query performance with Tools ➔ ⚡ Explain Query Plan! View an interactive hierarchical execution tree with branch connectors, full table scan warnings, temp B-tree sort detection, and index recommendations.',
      targetId: 'btn-explain',
      action: 'ide',
    },
    {
      title: '9. Interactive ERD Relation Visualizer',
      content:
        'Click "ERD" on the toolbar or desktop to launch the Entity-Relationship Diagram studio! Explore draggable table cards, foreign key bezier connector lines, cardinality badges (1 ➔ ∞), zoom controls, and a 1-click relational schema seeder.',
      targetId: 'btn-erd',
      action: 'erd',
    },
    {
      title: '10. Database Navigator & Schema Explorer',
      content:
        'Inspect all materialized tables, columns, logical types, and foreign key badges. Run 1-click COUNT(*) queries or view generated CREATE TABLE DDL schemas.',
      targetId: 'tour-schema-tree',
      action: 'ide',
    },
    {
      title: '11. SQL Challenge Arena (130 LeetCode Questions)',
      content:
        'Practice real SQL interview questions! Features 130 authentic problems with ground-truth test data, automated WASM evaluation, side-by-side mismatch diff viewer, and canonical solution unlocks.',
      action: 'challenges',
    },
    {
      title: '12. User Profile & Local Security Keyring',
      content:
        'Manage your offline-first user account profile! Select vintage 8-bit avatars, view session statistics and badges, and enjoy single-device local keychain security powered by PBKDF2 encryption with 600,000 iterations.',
      action: 'auth',
    },
    {
      title: '13. Control Panel & Display Configuration',
      content:
        'Customize your workspace in the Control Panel (Settings): switch between nostalgic themes (Win95 Classic, Win95 Noir, Win2000 Corporate, XP Luna, and macOS Obsidian Glass), toggle retro CRT monitor scanlines and curved glass, or configure table caps.',
      action: 'settings',
    },
    {
      title: '14. Share & URL State Serialization',
      content:
        'Click "⋯ More ▾" ➔ "Share" on the toolbar to encode your complete query, target dialect, and IDE state into a compact Base64 shareable URL—no backend server or external storage needed!',
      targetId: 'btn-more-tools',
      action: 'ide',
    },
    {
      title: '15. Help Manual & Interactive SQL Tutorial',
      content:
        'Open the Windows 95 Help Manual (winhlp32) for in-depth SQL lessons, runnable demo queries, dialect cheat sheets, and keyboard shortcuts!',
      targetId: 'btn-help',
      action: 'help',
      isHelpStep: true,
    },
  ];

  // Track target DOM element coordinates on screen and trigger relevant window actions
  useEffect(() => {
    if (!isOpen) return;

    const step = tourSteps[currentStepIdx];
    if (step) {
      if (step.action === 'ide') onEnsureIDEOpen?.();
      else if (step.action === 'erd') onOpenERD?.();
      else if (step.action === 'challenges') onOpenChallenges?.();
      else if (step.action === 'auth') onOpenAuth?.();
      else if (step.action === 'settings') onOpenSettings?.();
      else if (step.action === 'help') onOpenHelp?.();
    }

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
    const interval = setInterval(updatePosition, 250);
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
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
    width: '430px',
    maxWidth: '92vw',
    boxShadow: '4px 4px 20px rgba(0,0,0,0.7)',
    transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
  };

  let arrowDirection: 'top' | 'bottom' | 'center' = 'center';
  let arrowLeft = 24;

  if (targetRect) {
    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1024;
    const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 768;
    const balloonWidth = 430;

    const targetCenterX = targetRect.left + targetRect.width / 2;

    // Center balloon horizontally over target, bounded by viewport margins
    const balloonLeft = Math.max(16, Math.min(viewportWidth - balloonWidth - 16, targetCenterX - balloonWidth / 2));

    // Calculate exact arrow position relative to balloon box to point precisely at target center X
    arrowLeft = Math.max(20, Math.min(balloonWidth - 40, targetCenterX - balloonLeft - 10));

    // Prefer positioning below the target if space permits, otherwise above
    let balloonTop = 0;
    if (targetRect.top + targetRect.height + 260 < viewportHeight) {
      balloonTop = targetRect.top + targetRect.height + 14;
      arrowDirection = 'top';
    } else {
      balloonTop = Math.max(16, targetRect.top - 250);
      arrowDirection = 'bottom';
    }

    balloonStyle.top = `${balloonTop}px`;
    balloonStyle.left = `${balloonLeft}px`;
  } else {
    // Center modal fallback for steps without target element
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
              left: `${arrowLeft}px`,
              ...(arrowDirection === 'top'
                ? { top: '-10px', borderWidth: '0 10px 10px 10px', borderColor: 'transparent transparent var(--w95-title-active-bg, #000080) transparent' }
                : { bottom: '-10px', borderWidth: '10px 10px 0 10px', borderColor: 'var(--w95-gray, #c0c0c0) transparent transparent transparent' }),
              width: 0,
              height: 0,
              borderStyle: 'solid',
              transition: 'left 0.2s ease',
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
            <button className="win95-btn-titlebar" onClick={onClose} title="Close">✕</button>
          </div>
        </div>

        {/* Balloon Body */}
        <div style={{ padding: '14px', background: 'var(--w95-gray, #c0c0c0)', color: 'var(--w95-text-color, #000000)' }}>
          <div
            className="win95-inset"
            style={{
              padding: '12px',
              background: 'var(--w95-callout-yellow-bg, #ffffe0)',
              color: 'var(--w95-callout-yellow-text, #000000)',
              border: '1px solid var(--w95-dark-gray, #808000)',
              marginBottom: '12px',
            }}
          >
            <h4 style={{ margin: '0 0 6px 0', fontSize: '13px', color: '#000080', fontWeight: 'bold' }}>
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
