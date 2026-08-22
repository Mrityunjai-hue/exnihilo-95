/**
 * ErrorDialog.tsx — Windows 95 Critical Error / Warning Dialog
 */

import React from 'react';
import { ClassifiedError } from '../../engine/errors';
import { useDraggable } from '../../hooks/useDraggable';

interface ErrorDialogProps {
  error:   ClassifiedError | null;
  zIndex:  number;
  onClose: () => void;
  onFocus: () => void;
}

export const ErrorDialog: React.FC<ErrorDialogProps> = ({
  error,
  zIndex,
  onClose,
  onFocus,
}) => {
  const { position, handleMouseDown } = useDraggable({ x: 260, y: 150 });

  if (!error) return null;

  const isSyntax = error.type === 'SYNTAX_ERROR';
  const isAmbiguous = error.type === 'AMBIGUOUS_COLUMN';

  const icon = isAmbiguous ? '⚠️' : '❌';
  const title = isSyntax
    ? 'SQL Syntax Error'
    : isAmbiguous
    ? 'Ambiguous Column Reference'
    : 'Execution Error';

  return (
    <div
      className="win95-window"
      style={{
        position: 'absolute',
        top: `${position.y}px`,
        left: `${position.x}px`,
        width: '440px',
        zIndex,
        boxShadow: '4px 4px 16px rgba(0,0,0,0.6)',
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
          <span>{icon}</span>
          <span>{title}</span>
        </div>
        <div className="win95-titlebar-controls">
          <button className="win95-btn-titlebar" onClick={onClose}>✕</button>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '16px 12px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
        <div style={{ fontSize: '36px', lineHeight: 1 }}>
          {icon}
        </div>

        <div style={{ flex: 1 }}>
          <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', fontSize: '12px', color: '#000000' }}>
            {error.message}
          </p>

          {error.suggestion && (
            <div
              className="win95-inset"
              style={{
                padding: '6px 8px',
                background: '#ffffe0',
                border: '1px solid #c0c000',
                fontSize: '11px',
                color: '#333300',
                marginTop: '8px',
              }}
            >
              <strong>💡 Suggestion:</strong> {error.suggestion}
            </div>
          )}
        </div>
      </div>

      {/* Footer Buttons */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', padding: '8px', borderTop: '1px solid #808080' }}>
        <button
          className="win95-button"
          style={{ minWidth: '80px', fontWeight: 'bold' }}
          onClick={onClose}
          autoFocus
        >
          OK
        </button>
      </div>
    </div>
  );
};
