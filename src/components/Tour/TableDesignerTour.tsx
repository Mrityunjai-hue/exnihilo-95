/**
 * TableDesignerTour.tsx — Interactive Win95 Guided Tour for Access 95 Table Design View
 * Highlights key wizard features with spotlight ring, balloon callout box, step navigation,
 * and an explicit Skip option.
 */

import React, { useState, useEffect } from 'react';

interface TableDesignerTourProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TourStep {
  title: string;
  content: string;
  targetId?: string;
}

export const TableDesignerTour: React.FC<TableDesignerTourProps> = ({ isOpen, onClose }) => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [targetRect, setTargetRect] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCurrentStepIdx(0);
    }
  }, [isOpen]);

  const tourSteps: TourStep[] = [
    {
      title: '✨ Welcome to Access 95 Table Designer',
      content:
        'This wizard lets you visually design SQL tables, configure 19 column constraints, inspect live DDL SQL, and auto-generate synthetic data rows without writing SQL manually. Let\'s walk through the key features!',
    },
    {
      title: '1. Target Database & Table Name',
      content:
        'Choose which database schema namespace your new table belongs to (e.g. default, museum, sales), and enter a clean SQL table name.',
      targetId: 'tour-tbl-meta',
    },
    {
      title: '2. Sunken Column Grid',
      content:
        'Add, remove, or reorder columns. Click on any column row to select it — the 👉 arrow indicator shows which column is actively selected for the Property Inspector below.',
      targetId: 'tour-col-grid',
    },
    {
      title: '3. Win95 Property Inspector Grid',
      content:
        'Configure all 19 column properties! Toggle Primary Key, NOT NULL, UNIQUE, AUTO_INCREMENT, Default Values, CHECK expressions, Foreign Keys, and Computed Columns.',
      targetId: 'tour-prop-table',
    },
    {
      title: '4. Dedicated ENUM & SET Inputs',
      content:
        'ENUM and SET have separate, dedicated value inputs! Simply type comma-separated values (e.g. active, pending, inactive or 0, 1) to auto-set the data type cleanly.',
      targetId: 'tour-enum-inputs',
    },
    {
      title: '5. Live DDL Preview & Auto-Data Slider',
      content:
        'Watch your dialect-specific CREATE TABLE DDL SQL update in real time! Use the slider to set how many synthetic rows (1 to 25) will be generated automatically.',
      targetId: 'tour-ddl-preview',
    },
    {
      title: '6. Materialize & Execute',
      content:
        'Click "🚀 Create & Populate Table" to run the DDL in memory, generate synthetic rows, and add the table to your Database Navigator pane!',
      targetId: 'tour-btn-create',
    },
  ];

  // Track target DOM element position on screen
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
    } else {
      setCurrentStepIdx((prev) => prev + 1);
    }
  };

  // Position balloon window relative to target element
  let balloonStyle: React.CSSProperties = {
    position: 'fixed',
    zIndex: 1000010,
    width: '420px',
    boxShadow: '4px 4px 20px rgba(0,0,0,0.7)',
    transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
  };

  let arrowDirection: 'top' | 'bottom' | 'center' = 'center';

  if (targetRect) {
    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1024;
    const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 768;

    if (targetRect.top + targetRect.height + 240 < viewportHeight) {
      balloonStyle.top = `${targetRect.top + targetRect.height + 12}px`;
      balloonStyle.left = `${Math.max(16, Math.min(viewportWidth - 440, targetRect.left))}px`;
      arrowDirection = 'top';
    } else {
      balloonStyle.top = `${Math.max(16, targetRect.top - 240)}px`;
      balloonStyle.left = `${Math.max(16, Math.min(viewportWidth - 440, targetRect.left))}px`;
      arrowDirection = 'bottom';
    }
  } else {
    balloonStyle.top = '50%';
    balloonStyle.left = '50%';
    balloonStyle.transform = 'translate(-50%, -50%)';
  }

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 1000005, pointerEvents: 'none' }}>
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
            zIndex: 1000008,
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
            <span>Table Designer Tour — ({currentStepIdx + 1} of {tourSteps.length})</span>
          </div>
          <div className="win95-titlebar-controls">
            <button className="win95-btn-titlebar" onClick={onClose} title="Close Tour">✕</button>
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
                {isLast ? 'Finish Tour 🎉' : 'Next >'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
