/**
 * WindowControls.tsx — Unified Windows 95 Titlebar Control Buttons
 * Provides bulletproof Minimize (_), Maximize/Restore (🗖/🗗), and Close (✕) buttons
 * with event propagation stopping to prevent window drag conflicts.
 */

import React from 'react';

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
  const handleStopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleMinimize = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!disabled && onMinimize) {
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
      onClose();
    }
  };

  return (
    <div
      className={`win95-titlebar-controls ${className}`.trim()}
      onMouseDown={handleStopPropagation}
      onMouseUp={handleStopPropagation}
      onClick={handleStopPropagation}
      style={{ display: 'flex', gap: '2px', alignItems: 'center', flexShrink: 0 }}
    >
      {showMinimize && onMinimize && (
        <button
          type="button"
          className="win95-btn-titlebar"
          onMouseDown={handleStopPropagation}
          onClick={handleMinimize}
          title="Minimize"
          aria-label="Minimize Window"
          disabled={disabled}
        >
          _
        </button>
      )}

      {showMaximize && onMaximize && (
        <button
          type="button"
          className="win95-btn-titlebar"
          onMouseDown={handleStopPropagation}
          onClick={handleMaximize}
          title={isMaximized ? 'Restore Window' : 'Maximize Window'}
          aria-label={isMaximized ? 'Restore Window' : 'Maximize Window'}
          disabled={disabled}
        >
          {isMaximized ? '🗗' : '🗖'}
        </button>
      )}

      {showClose && onClose && (
        <button
          type="button"
          className="win95-btn-titlebar"
          onMouseDown={handleStopPropagation}
          onClick={handleClose}
          title="Close"
          aria-label="Close Window"
          disabled={disabled}
        >
          ✕
        </button>
      )}
    </div>
  );
};
