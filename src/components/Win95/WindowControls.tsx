/**
 * WindowControls.tsx — Unified Windows 95 Titlebar Control Buttons
 * Provides bulletproof Minimize (_), Maximize/Restore (🗖/🗗), and Close (✕) buttons
 * with event propagation stopping to prevent window drag conflicts.
 */

import React from 'react';
import { useTheme } from '../../hooks/useTheme';

export interface WindowControlsProps {
  onMinimize?: () => void;
  onMaximize?: () => void;
  onClose?: () => void;
  isMaximized?: boolean;
  showMinimize?: boolean;
  showMaximize?: boolean;
  showClose?: boolean;
  disabled?: boolean;
  className?: string;
}

export const WindowControls: React.FC<WindowControlsProps> = ({
  onMinimize,
  onMaximize,
  onClose,
  isMaximized = false,
  showMinimize = true,
  showMaximize = true,
  showClose = true,
  disabled = false,
  className = '',
}) => {
  const { activeTheme } = useTheme();
  const isMac =
    activeTheme === 'macos-glass' ||
    (typeof document !== 'undefined' &&
      (document.documentElement.getAttribute('data-theme') === 'macos-glass' ||
        document.body.getAttribute('data-theme') === 'macos-glass'));

  const handleStopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleMinimize = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!disabled && onMinimize) {
      if (isMac) {
        const win = (e.currentTarget as HTMLElement).closest('.win95-window') as HTMLElement | null;
        if (win) {
          win.classList.add('mac-window-minimizing');
          setTimeout(() => {
            onMinimize();
            win.classList.remove('mac-window-minimizing');
          }, 180);
          return;
        }
      }
      onMinimize();
    }
  };

  const handleMaximize = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!disabled && onMaximize) {
      onMaximize();
    }
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!disabled && onClose) {
      if (isMac) {
        const win = (e.currentTarget as HTMLElement).closest('.win95-window') as HTMLElement | null;
        if (win) {
          win.classList.add('mac-window-closing');
          setTimeout(() => {
            onClose();
            win.classList.remove('mac-window-closing');
          }, 140);
          return;
        }
      }
      onClose();
    }
  };

  const canMinimize = showMinimize && !!onMinimize;
  const canMaximize = showMaximize && !!onMaximize;
  const canClose = showClose && !!onClose;

  return (
    <div
      className={`win95-titlebar-controls ${className}`.trim()}
      onMouseDown={handleStopPropagation}
      onMouseUp={handleStopPropagation}
      onClick={handleStopPropagation}
      style={{ display: 'flex', gap: '2px', alignItems: 'center', flexShrink: 0 }}
    >
      {(canMinimize || isMac) && (
        <button
          type="button"
          className="win95-btn-titlebar"
          onMouseDown={handleStopPropagation}
          onClick={canMinimize ? handleMinimize : undefined}
          title={canMinimize ? 'Minimize' : 'Minimize (Unavailable)'}
          aria-label="Minimize Window"
          disabled={disabled || !canMinimize}
        >
          <span className="win95-control-glyph">_</span>
          <span className="mac-control-glyph">−</span>
        </button>
      )}

      {(canMaximize || isMac) && (
        <button
          type="button"
          className="win95-btn-titlebar"
          onMouseDown={handleStopPropagation}
          onClick={canMaximize ? handleMaximize : undefined}
          title={canMaximize ? (isMaximized ? 'Restore Window' : 'Maximize Window') : 'Zoom (Unavailable)'}
          aria-label={isMaximized ? 'Restore Window' : 'Maximize Window'}
          disabled={disabled || !canMaximize}
        >
          <span className="win95-control-glyph">{isMaximized ? '🗗' : '🗖'}</span>
          <span className="mac-control-glyph">⤢</span>
        </button>
      )}

      {(canClose || isMac) && (
        <button
          type="button"
          className="win95-btn-titlebar"
          onMouseDown={handleStopPropagation}
          onClick={canClose ? handleClose : undefined}
          title="Close"
          aria-label="Close Window"
          disabled={disabled || !canClose}
        >
          <span className="win95-control-glyph">✕</span>
          <span className="mac-control-glyph">✕</span>
        </button>
      )}
    </div>
  );
};
