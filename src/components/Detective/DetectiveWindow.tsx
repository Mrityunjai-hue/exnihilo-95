/**
 * DetectiveWindow.tsx — Window Wrapper for Windows 95 Homicide Case Management System
 *
 * Integrates into ExNihilo 95's Desktop Window Manager with standard minimize,
 * maximize, and close controls using the authentic Windows 95 visual design system.
 */

import React, { useState } from 'react';
import { WindowControls } from '../Win95/WindowControls';
import { DetectiveWorkstation } from './DetectiveWorkstation';
import { useTheme } from '../../hooks/useTheme';
import { DetectiveIcon } from '../Win95/Win95Icons';

interface DetectiveWindowProps {
  isOpen: boolean;
  isMinimized?: boolean;
  zIndex: number;
  isMaximized?: boolean;
  onMaximize?: () => void;
  onClose: () => void;
  onMinimize?: () => void;
  onFocus: () => void;
}

export const DetectiveWindow: React.FC<DetectiveWindowProps> = ({
  isOpen,
  isMinimized = false,
  zIndex,
  isMaximized: propIsMaximized,
  onMaximize: propOnMaximize,
  onClose,
  onMinimize,
  onFocus,
}) => {
  const { activeTheme } = useTheme();
  const isMac = activeTheme === 'macos-glass';
  const [internalMaximized, setInternalMaximized] = useState(false);
  const isMaximized = propIsMaximized !== undefined ? propIsMaximized : internalMaximized;

  const toggleMaximize = () => {
    if (propOnMaximize) {
      propOnMaximize();
    } else {
      setInternalMaximized(!internalMaximized);
    }
  };

  if (!isOpen || isMinimized) return null;

  return (
    <div
      id="detective-case-window"
      className="win95-window"
      style={
        isMaximized
          ? {
              position: 'fixed',
              top: isMac ? '28px' : 0,
              left: 0,
              right: 0,
              bottom: isMac ? 0 : '30px',
              width: '100vw',
              height: isMac ? 'calc(100vh - 28px)' : 'calc(100vh - 30px)',
              maxWidth: '100vw',
              maxHeight: '100vh',
              zIndex: 1000,
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 'none',
              borderRadius: 0,
              padding: 0,
              overflow: 'hidden',
            }
          : {
              position: 'fixed',
              top: isMac ? '36px' : '30px',
              left: '30px',
              right: '30px',
              bottom: isMac ? '76px' : '45px',
              width: 'calc(100vw - 60px)',
              height: isMac ? 'calc(100vh - 112px)' : 'calc(100vh - 75px)',
              maxWidth: '1400px',
              maxHeight: '90vh',
              zIndex,
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '3px 3px 10px rgba(0,0,0,0.5)',
              padding: 0,
              overflow: 'hidden',
            }
      }
      onMouseDown={onFocus}
    >
      {/* Titlebar with Standard Windows 95 Styling */}
      <div
        className="win95-titlebar"
        style={{
          cursor: isMaximized ? 'default' : 'move',
        }}
        onDoubleClick={toggleMaximize}
      >
        <div className="win95-titlebar-text">
          <DetectiveIcon size={16} />
          <span>Homicide Bureau: Department of Unsolved Crimes — Windows 95 Forensic Workstation</span>
        </div>
        <WindowControls
          onMinimize={onMinimize}
          onMaximize={toggleMaximize}
          isMaximized={isMaximized}
          onClose={onClose}
        />
      </div>

      {/* Main Workstation Container */}
      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <DetectiveWorkstation onClose={onClose} />
      </div>
    </div>
  );
};
