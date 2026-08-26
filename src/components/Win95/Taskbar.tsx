/**
 * Taskbar.tsx — Windows 95 Taskbar, System Tray & Start Menu
 */

import React, { useState, useEffect } from 'react';
import { StoredUser } from '../../hooks/useAuth';

export interface WindowMeta {
  id:          string;
  title:       string;
  icon:        string;
  isOpen:      boolean;
  isMinimized: boolean;
  zIndex:      number;
}

interface TaskbarProps {
  windows:           WindowMeta[];
  activeWindowId:    string | null;
  currentUser:       StoredUser | null;
  isLoggedIn:        boolean;
  isSecureContext:   boolean;
  crtEnabled?:       boolean;
  onToggleCrt?:      () => void;
  onFocusWindow:     (id: string) => void;
  onToggleMinimize:  (id: string) => void;
  onOpenWindow:      (id: string) => void;
  onResetSession:    () => void;
  onLogout:          () => void;
}

export const Taskbar: React.FC<TaskbarProps> = ({
  windows,
  activeWindowId,
  currentUser,
  isLoggedIn,
  isSecureContext,
  crtEnabled,
  onToggleCrt,
  onFocusWindow,
  onToggleMinimize,
  onOpenWindow,
  onResetSession,
  onLogout,
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
            {/* Account Item */}
            <div
              className="win95-start-item"
              onClick={() => {
                onOpenWindow(isLoggedIn ? 'admin' : 'auth');
                setStartMenuOpen(false);
              }}
            >
              <span style={{ fontSize: '16px' }}>{isLoggedIn ? (currentUser?.avatar || '👤') : '🔑'}</span>
              <div>
                <strong>{isLoggedIn ? currentUser?.displayName : 'User Logon / Sign Up'}</strong>
                <div style={{ fontSize: '10px', color: '#555' }}>
                  {isLoggedIn ? `@${currentUser?.usernameNorm} (Control Panel)` : 'Single-Device Account Access'}
                </div>
              </div>
            </div>

            <div className="win95-start-divider" />

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
              onClick={() => { onOpenWindow('sqlDictionary'); setStartMenuOpen(false); }}
            >
              <span style={{ fontSize: '16px' }}>📖</span>
              <div>
                <strong>SQL Dictionary & Dialects</strong>
                <div style={{ fontSize: '10px', color: '#555' }}>Syntax, Functions & Dialects</div>
              </div>
            </div>

            <div
              className="win95-start-item"
              onClick={() => { onOpenWindow('help'); setStartMenuOpen(false); }}
            >
              <span style={{ fontSize: '16px' }}>❓</span>
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

            {onToggleCrt && (
              <div
                className="win95-start-item"
                onClick={() => { onToggleCrt(); setStartMenuOpen(false); }}
              >
                <span style={{ fontSize: '16px' }}>📺</span>
                <div>
                  <strong>CRT Monitor Filter ({crtEnabled ? 'ON' : 'OFF'})</strong>
                  <div style={{ fontSize: '10px', color: 'var(--w95-dark-gray, #555)' }}>Retro Scanlines & Glow</div>
                </div>
              </div>
            )}

            <div
              className="win95-start-item"
              onClick={() => { onResetSession(); setStartMenuOpen(false); }}
            >
              <span style={{ fontSize: '16px' }}>🗑️</span>
              <div>Reset Session / Clear DB</div>
            </div>

            <div className="win95-start-divider" />

            {/* Log Off Item (Classic Windows 95/98 Style) */}
            {isLoggedIn && (
              <div
                className="win95-start-item"
                onClick={() => {
                  onLogout();
                  setStartMenuOpen(false);
                }}
              >
                <span style={{ fontSize: '16px' }}>🚪</span>
                <div>
                  <strong>Log Off {currentUser?.displayName}...</strong>
                  <div style={{ fontSize: '10px', color: '#555' }}>Clear local session token</div>
                </div>
              </div>
            )}

            <div
              className="win95-start-item"
              onClick={() => { onOpenWindow('shutdown'); setStartMenuOpen(false); }}
            >
              <span style={{ fontSize: '16px' }}>🔌</span>
              <div>
                <strong>Shut Down...</strong>
                <div style={{ fontSize: '10px', color: '#555' }}>Restart or reload ExNihilo 95</div>
              </div>
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

        {/* System Tray with Account Status, Security Shield, and Clock */}
        <div className="win95-systray" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '2px 6px' }}>
          {/* Security Context Shield */}
          <span
            title={isSecureContext ? 'WebCrypto PBKDF2 Enabled (HTTPS)' : 'Plain HTTP (Crypto Features Disabled)'}
            style={{ fontSize: '11px', cursor: 'help', opacity: isSecureContext ? 1 : 0.4 }}
          >
            {isSecureContext ? '🛡️' : '⚠️'}
          </span>

          {/* Account Tray Icon */}
          <span
            title={isLoggedIn ? `Logged in as @${currentUser?.usernameNorm} (Free Tier)` : 'Click to Log In / Register'}
            style={{ fontSize: '12px', cursor: 'pointer' }}
            onClick={() => onOpenWindow(isLoggedIn ? 'admin' : 'auth')}
          >
            {isLoggedIn ? (currentUser?.avatar || '👤') : '🔑'}
          </span>

          <span style={{ borderLeft: '1px solid #808080', height: '12px' }} />

          <span>{timeStr || '12:00 PM'}</span>
        </div>
      </footer>
    </>
  );
};
