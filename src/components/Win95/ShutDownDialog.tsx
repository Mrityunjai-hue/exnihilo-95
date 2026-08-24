/**
 * ShutDownDialog.tsx — Windows 95 Authentic Shut Down Dialog
 */

import React, { useState } from 'react';
import { useDraggable } from '../../hooks/useDraggable';
import { WindowControls } from './WindowControls';

interface ShutDownDialogProps {
  isOpen:       boolean;
  zIndex:       number;
  onClose:      () => void;
  onRestart:    () => void;
  onClearAndRestart: () => void;
  onCloseAllWindows: () => void;
  onFocus:      () => void;
}

export const ShutDownDialog: React.FC<ShutDownDialogProps> = ({
  isOpen,
  zIndex,
  onClose,
  onRestart,
  onClearAndRestart,
  onCloseAllWindows,
  onFocus,
}) => {
  const [selectedOption, setSelectedOption] = useState<'restart' | 'clear' | 'closeAll'>('restart');
  const { position, handleMouseDown } = useDraggable({ x: 300, y: 180 });

  if (!isOpen) return null;

  const handleConfirm = () => {
    onClose();
    if (selectedOption === 'restart') {
      onRestart();
    } else if (selectedOption === 'clear') {
      onClearAndRestart();
    } else if (selectedOption === 'closeAll') {
      onCloseAllWindows();
    }
  };

  return (
    <div
      className="win95-window"
      style={{
        position: 'absolute',
        top: `${position.y}px`,
        left: `${position.x}px`,
        width: '380px',
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
          <span>💻</span>
          <span>Shut Down ExNihilo 95</span>
        </div>
        <WindowControls
          showMinimize={false}
          showMaximize={false}
          onClose={onClose}
        />
      </div>

      {/* Body */}
      <div style={{ padding: '16px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
        <div style={{ fontSize: '36px', lineHeight: 1 }}>
          💻
        </div>

        <div style={{ flex: 1 }}>
          <p style={{ margin: '0 0 12px 0', fontSize: '11px', fontWeight: 'bold' }}>
            What do you want the computer to do?
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="radio"
                name="shutdown_action"
                checked={selectedOption === 'restart'}
                onChange={() => setSelectedOption('restart')}
              />
              <span>Restart the computer (replay boot)</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="radio"
                name="shutdown_action"
                checked={selectedOption === 'clear'}
                onChange={() => setSelectedOption('clear')}
              />
              <span>Wipe database catalog and restart</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="radio"
                name="shutdown_action"
                checked={selectedOption === 'closeAll'}
                onChange={() => setSelectedOption('closeAll')}
              />
              <span>Close all windows (clean desktop)</span>
            </label>
          </div>
        </div>
      </div>

      {/* Footer Buttons */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', padding: '8px 12px', borderTop: '1px solid #808080' }}>
        <button
          className="win95-button"
          style={{ minWidth: '70px', fontWeight: 'bold' }}
          onClick={handleConfirm}
          autoFocus
        >
          Yes
        </button>
        <button
          className="win95-button"
          style={{ minWidth: '70px' }}
          onClick={onClose}
        >
          No
        </button>
      </div>
    </div>
  );
};
