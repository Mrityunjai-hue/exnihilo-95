/**
 * Taskbar.tsx — Windows 95 Taskbar & Start Menu
 */

import React, { useState, useEffect } from 'react';

export interface WindowMeta {
  id:        string;
  title:     string;
  icon:      string;
  isOpen:    boolean;
  isMinimized: boolean;
  zIndex:    number;
}

interface TaskbarProps {
  windows:           WindowMeta[];
  activeWindowId:    string | null;
  onFocusWindow:     (id: string) => void;
  onToggleMinimize:  (id: string) => void;
  onOpenWindow:      (id: string) => void;
  onResetSession:    () => void;
}

export const Taskbar: React.FC<TaskbarProps> = ({
  windows,
  activeWindowId,
  onFocusWindow,
  onToggleMinimize,
  onOpenWindow,
  onResetSession,
}) => {
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setTimeStr(
        d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      {/* Start Menu Dropup */}
      {startMenuOpen && (
        <div
          className="win95-start-menu"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="win95-start-banner">
            Windows<span style={{ fontWeight: 'normal', opacity: 0.9 }}>95</span>
          </div>
          <div className="win95-start-items">
            <div
              className="win95-start-item"
              onClick={() => { onOpenWindow('welcome'); setStartMenuOpen(false); }}
            >
              <span style={{ fontSize: '16px' }}>✨</span>
              <div>
                <strong>About ExNihilo 95</strong>
                <div style={{ fontSize: '10px', color: '#555' }}>Info, Creator & Community</div>
              </div>
            </div>

            <div
              className="win95-start-item"
              onClick={() => { onOpenWindow('ide'); setStartMenuOpen(false); }}
            >
              <span style={{ fontSize: '16px' }}>🗄️</span>
              <div>
                <strong>SQL IDE Shell</strong>
                <div style={{ fontSize: '10px', color: '#555' }}>Query Editor & Results</div>
              </div>
            </div>

            <div
              className="win95-start-item"
              onClick={() => { onOpenWindow('help'); setStartMenuOpen(false); }}
            >
              <span style={{ fontSize: '16px' }}>📖</span>
              <div>
                <strong>SQL Query Guide & Tutorial</strong>
                <div style={{ fontSize: '10px', color: '#555' }}>How to write queries</div>
              </div>
            </div>

            <div
              className="win95-start-item"
              onClick={() => { onOpenWindow('wizard'); setStartMenuOpen(false); }}
            >
              <span style={{ fontSize: '16px' }}>🧙‍♂️</span>
              <div>
                <strong>Setup & Features Wizard</strong>
                <div style={{ fontSize: '10px', color: '#555' }}>Guided Walkthrough</div>
              </div>
            </div>

            <div className="win95-start-divider" />

            <div
              className="win95-start-item"
              onClick={() => { onOpenWindow('settings'); setStartMenuOpen(false); }}
            >
              <span style={{ fontSize: '16px' }}>⚙️</span>
              <div>Control Panel & Options</div>
            </div>

            <div
              className="win95-start-item"
              onClick={() => { onResetSession(); setStartMenuOpen(false); }}
            >
              <span style={{ fontSize: '16px' }}>🗑️</span>
              <div>Reset Session / Clear DB</div>
            </div>
          </div>
        </div>
      )}

      {/* Main Taskbar */}
      <footer
        className="win95-taskbar"
        onClick={() => startMenuOpen && setStartMenuOpen(false)}
      >
        <button
          className={`win95-button win95-start-btn ${startMenuOpen ? 'pressed' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            setStartMenuOpen(!startMenuOpen);
          }}
        >
          <span style={{ fontSize: '14px' }}>📺</span>
          <strong>Start</strong>
        </button>

        {/* Running Window Tasks */}
        <div className="win95-taskbar-tasks">
          {windows
            .filter((w) => w.isOpen)
            .map((w) => {
              const isActive = activeWindowId === w.id && !w.isMinimized;
              return (
                <button
                  key={w.id}
                  className={`win95-task-tab ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    if (isActive) {
                      onToggleMinimize(w.id);
                    } else {
                      onFocusWindow(w.id);
                    }
                  }}
                >
                  <span>{w.icon}</span>
                  <span>{w.title}</span>
                </button>
              );
            })}
        </div>

        {/* System Tray with Clock */}
        <div className="win95-systray">
          <span title="Volume Control" style={{ fontSize: '12px', cursor: 'pointer' }}>🔊</span>
          <span>{timeStr || '12:00 PM'}</span>
        </div>
      </footer>
    </>
  );
};
