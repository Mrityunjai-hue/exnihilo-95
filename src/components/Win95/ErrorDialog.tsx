/**
 * ErrorDialog.tsx — Windows 95 Critical Error / Warning Dialog
 * Supports Draggable window positioning and 1-click clipboard error diagnostic copying.
 */

import React, { useState } from 'react';
import { ClassifiedError } from '../../engine/errors';
import { useDraggable } from '../../hooks/useDraggable';
import { WindowControls } from './WindowControls';

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
  const [copied, setCopied] = useState(false);

  if (!error) return null;

  const isSyntax = error.type === 'SYNTAX_ERROR';
  const isAmbiguous = error.type === 'AMBIGUOUS_COLUMN';

  const icon = isAmbiguous ? '⚠️' : '❌';
  const title = isSyntax
    ? 'SQL Syntax Error'
    : isAmbiguous
    ? 'Ambiguous Column Reference'
    : 'Execution Error';

  const handleCopyError = () => {
    const errorText = `[${error.type}] ${error.message}${error.suggestion ? `\n\nSuggestion: ${error.suggestion}` : ''}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(errorText).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  return (
    <div
      className="win95-window"
      style={{
        position: 'absolute',
        top: `${position.y}px`,
        left: `${position.x}px`,
        width: '460px',
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
        <WindowControls
          showMinimize={false}
          showMaximize={false}
          onClose={onClose}
        />
      </div>

      {/* Body */}
      <div style={{ padding: '16px 12px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
        <div style={{ fontSize: '36px', lineHeight: 1 }}>
          {icon}
        </div>

        <div style={{ flex: 1 }}>
          <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', fontSize: '12px', color: '#000000', lineHeight: '1.4' }}>
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
                lineHeight: '1.4',
              }}
            >
              <strong>💡 Suggestion:</strong> {error.suggestion}
            </div>
          )}
        </div>
      </div>

      {/* Footer Buttons */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', padding: '8px', borderTop: '1px solid #808080' }}>
        <button
          className="win95-button"
          style={{ minWidth: '90px' }}
          onClick={handleCopyError}
          title="Copy error message to clipboard"
        >
          <span>📋</span>
          <span>{copied ? 'Copied!' : 'Copy Error'}</span>
        </button>

        <button
          className="win95-button"
          style={{ minWidth: '70px', fontWeight: 'bold' }}
          onClick={onClose}
          autoFocus
        >
          OK
        </button>
      </div>
    </div>
  );
};
