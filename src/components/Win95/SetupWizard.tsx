/**
 * SetupWizard.tsx — Windows 95 Setup & Onboarding Wizard
 */

import React, { useState } from 'react';
import { useDraggable } from '../../hooks/useDraggable';
import { WindowControls } from './WindowControls';

interface SetupWizardProps {
  isOpen:      boolean;
  isMinimized: boolean;
  zIndex:      number;
  onClose:     () => void;
  onMinimize:  () => void;
  onFocus:     () => void;
  onFinish:    () => void;
}

export const SetupWizard: React.FC<SetupWizardProps> = ({
  isOpen,
  isMinimized,
  zIndex,
  onClose,
  onMinimize,
  onFocus,
  onFinish,
}) => {
  const [step, setStep] = useState<number>(1);
  const totalSteps = 4;
  const { position, handleMouseDown } = useDraggable({ x: 140, y: 70 });

  if (!isOpen) return null;

  return (
    <div
      className="win95-window"
      style={{
        position: 'absolute',
        top: `${position.y}px`,
        left: `${position.x}px`,
        width: '540px',
        height: '380px',
        zIndex,
        display: isMinimized ? 'none' : 'flex',
        flexDirection: 'column',
      }}
      onMouseDown={onFocus}
    >
      {/* Titlebar with Drag Handler */}
      <div
        className="win95-titlebar"
        onMouseDown={(e) => {
          onFocus();
          handleMouseDown(e);
        }}
        style={{ cursor: 'move' }}
      >
        <div className="win95-titlebar-text">
          <span>🧙‍♂️</span>
          <span>ExNihilo Setup Wizard</span>
        </div>
        <WindowControls
          onMinimize={onMinimize}
          onClose={onClose}
        />
      </div>

      {/* Wizard Body */}
      <div style={{ display: 'flex', flex: 1, padding: '8px', gap: '8px', overflow: 'hidden' }}>
        {/* Left Visual Sidebar */}
        <div
          className="win95-inset"
          style={{
            width: '140px',
            height: '100%',
            background: '#000080',
            color: '#ffffff',
            padding: '16px 8px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>💿</div>
            <strong style={{ fontSize: '14px', lineHeight: '1.2' }}>
              ExNihilo 95
            </strong>
            <p style={{ fontSize: '10px', color: '#c0c0c0', marginTop: '8px' }}>
              Intelligent Zero-Config SQL IDE
            </p>
          </div>
          <div style={{ fontSize: '10px', color: '#a0a0a0' }}>
            Step {step} of {totalSteps}
          </div>
        </div>

        {/* Right Step Content */}
        <div
          className="win95-inset"
          style={{ flex: 1, height: '100%', background: 'var(--w95-sunken-bg, #ffffff)', color: 'var(--w95-sunken-text, #000000)', padding: '16px', overflowY: 'auto' }}
        >
          {step === 1 && (
            <div>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#000080' }}>
                Welcome to ExNihilo Setup
              </h3>
              <p style={{ lineHeight: '1.5' }}>
                ExNihilo is a revolutionary SQL development environment that eliminates <strong>"Table not found"</strong> errors forever.
              </p>
              <p style={{ lineHeight: '1.5' }}>
                Whenever you query a non-existent table, ExNihilo parses your SQL AST, infers column data types, maps foreign key relationships, and generates realistic synthetic data on the fly.
              </p>
              <p style={{ marginTop: '16px', color: '#555' }}>
                Click <strong>Next</strong> to discover key features.
              </p>
            </div>
          )}

          {step === 2 && (
            <div>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#000080' }}>
                Select Your SQL Dialect
              </h3>
              <p style={{ lineHeight: '1.5' }}>
                ExNihilo natively understands 4 major SQL dialects:
              </p>
              <ul style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
                <li><strong>MySQL:</strong> Standard backticks, LIMIT clauses, GROUP BY aggregations.</li>
                <li><strong>PostgreSQL:</strong> Casting syntax (<code>::type</code>), CTE queries (<code>WITH ...</code>).</li>
                <li><strong>SQLite:</strong> Standard lightweight relational execution.</li>
                <li><strong>SSMS / Transact-SQL:</strong> Bracket identifiers (<code>[dbo].[table]</code>), <code>TOP N</code>.</li>
              </ul>
            </div>
          )}

          {step === 3 && (
            <div>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#000080' }}>
                Referential Integrity & Caching
              </h3>
              <p style={{ lineHeight: '1.5' }}>
                ExNihilo guarantees realistic join results:
              </p>
              <ul style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
                <li><strong>Topological Order:</strong> Parent tables are generated before child tables.</li>
                <li><strong>Foreign Key Pools:</strong> Child rows sample directly from parent primary keys.</li>
                <li><strong>Session Catalog:</strong> Inferred tables are cached in memory so repeat queries run instantly without re-generation.</li>
              </ul>
            </div>
          )}

          {step === 4 && (
            <div>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#000080' }}>
                Setup Complete!
              </h3>
              <p style={{ lineHeight: '1.5' }}>
                Everything is configured and ready. Click <strong>Finish</strong> to launch the SQL IDE Shell and run your first query.
              </p>
              <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '28px' }}>
                🚀 🗄️ 💾
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Wizard Footer Buttons */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', padding: '6px 8px', borderTop: '1px solid #808080' }}>
        <button
          className="win95-button"
          disabled={step === 1}
          onClick={() => setStep(step - 1)}
        >
          &lt; Back
        </button>

        {step < totalSteps ? (
          <button
            className="win95-button"
            onClick={() => setStep(step + 1)}
          >
            Next &gt;
          </button>
        ) : (
          <button
            className="win95-button"
            style={{ fontWeight: 'bold' }}
            onClick={() => {
              onClose();
              onFinish();
            }}
          >
            Finish
          </button>
        )}

        <button
          className="win95-button"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
