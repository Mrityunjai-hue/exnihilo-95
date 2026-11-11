import React, { useState, useEffect, useRef } from 'react';
import { StoredUser } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { ExNihiloLogo } from '../Brand/ExNihiloLogo';

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
  activeTheme?:      string;
  isAnyMaximized?:   boolean;
  crtEnabled?:       boolean;
  onToggleCrt?:      () => void;
  onFocusWindow:     (id: string) => void;
  onToggleMinimize:  (id: string) => void;
  onOpenWindow:      (id: string) => void;
  onResetSession:    () => void;
  onLogout:          () => void;
  onToggleLaunchpad?: () => void;
  isLaunchpadOpen?:   boolean;
}

export const Taskbar: React.FC<TaskbarProps> = ({
  windows,
  activeWindowId,
  currentUser,
  isLoggedIn,
  isSecureContext,
  activeTheme: propTheme,
  isAnyMaximized = false,
  crtEnabled,
  onToggleCrt,
  onFocusWindow,
  onToggleMinimize,
  onOpenWindow,
  onResetSession,
  onLogout,
  onToggleLaunchpad,
  isLaunchpadOpen = false,
}) => {
  const { activeTheme: hookTheme } = useTheme();
  const activeTheme = propTheme || hookTheme;
  const isMac = activeTheme === 'macos-glass';
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [hoveredDockId, setHoveredDockId] = useState<string | null>(null);
  const [isDockHovered, setIsDockHovered] = useState(false);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [timeStr, setTimeStr] = useState('');

  // Determine if any window is actively open or maximized
  const hasActiveWindows = Boolean(
    isAnyMaximized || windows.some((w) => w.isOpen && !w.isMinimized)
  );

  // Auto-hide rule:
  // - When hovered (or cursor touches bottom hotspot), dock reveals (isDockVisible = true).
  // - When unhovered, if any window is in use (open/maximized), dock auto-hides.
  // - On empty desktop (no open windows), dock sits comfortably visible.
  const isDockVisible = isDockHovered || !hasActiveWindows;

  const handleMouseEnter = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    setIsDockHovered(true);
  };

  const handleMouseLeave = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    hideTimeoutRef.current = setTimeout(() => {
      setIsDockHovered(false);
    }, 350);
  };

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

  // Determine active account window target (auth for login/signup, admin for logged-in profile)
  const accountWindowId = isLoggedIn ? 'admin' : 'auth';

  // Dock items configuration for macOS
  const macDockItems = [
    { id: 'welcome', label: 'About ExNihilo', icon: '✨', bg: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' },
    { id: 'ide', label: 'ExNihilo SQL Studio', icon: '🗄️', bg: 'linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)' },
    { id: 'detective', label: 'Case Files (Homicide Bureau)', icon: '🕵️', bg: 'linear-gradient(135deg, #78350f 0%, #451a03 100%)' },
    { id: 'challenges', label: 'SQL Challenges', icon: '🏆', bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' },
    { id: 'erd', label: 'Relation Visualizer (ERD)', icon: '🌐', bg: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' },
    { id: 'sqlDictionary', label: 'SQL Dictionary', icon: '📖', bg: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)' },
    { id: 'help', label: 'Query Tutorial', icon: '❓', bg: 'linear-gradient(135deg, #10b981 0%, #047857 100%)' },
    { id: 'wizard', label: 'Setup Wizard', icon: '🧙‍♂️', bg: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)' },
    { id: 'settings', label: 'System Settings', icon: '⚙️', bg: 'linear-gradient(135deg, #64748b 0%, #334155 100%)' },
    { id: accountWindowId, label: isLoggedIn ? (currentUser?.displayName || `@${currentUser?.usernameNorm}`) : 'User Account / Sign In', icon: isLoggedIn ? (currentUser?.avatar || '👤') : '🔑', bg: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)' },
  ];

  if (isMac) {
    return (
      <>
        {/* Invisible Bottom Hotspot to trigger auto-reveal when cursor moves to the bottom of the screen */}
        <div
          className="mac-dock-hotspot"
          onMouseEnter={handleMouseEnter}
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            height: '24px',
            zIndex: 99998,
            pointerEvents: 'auto',
          }}
          aria-hidden="true"
        />

        <nav
          className={`mac-dock-container ${!isDockVisible ? 'is-auto-hidden' : ''}`}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={{
            position: 'fixed',
            bottom: '12px',
            left: '50%',
            transform: isDockVisible ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(140%)',
            opacity: isDockVisible ? 1 : 0,
            pointerEvents: isDockVisible ? 'auto' : 'none',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'flex-end',
            gap: '8px',
            background: 'rgba(15, 23, 42, 0.65)',
            WebkitBackdropFilter: 'blur(36px) saturate(200%)',
            backdropFilter: 'blur(36px) saturate(200%)',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            borderRadius: '24px',
            padding: '6px 12px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.22)',
            transition: 'transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.22s ease',
          }}
        >
        {/* Launchpad Button */}
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {hoveredDockId === 'launchpad' && (
            <div className="mac-dock-tooltip">Launchpad</div>
          )}
          <button
            type="button"
            className="mac-dock-icon-btn"
            onMouseEnter={() => setHoveredDockId('launchpad')}
            onMouseLeave={() => setHoveredDockId(null)}
            onClick={() => {
              if (onToggleLaunchpad) {
                onToggleLaunchpad();
              } else {
                onOpenWindow('welcome');
              }
            }}
            title="Launchpad"
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
              border: isLaunchpadOpen ? '1px solid #c084fc' : '1px solid rgba(255, 255, 255, 0.25)',
              boxShadow: isLaunchpadOpen ? '0 0 18px rgba(168, 85, 247, 0.6)' : '0 4px 12px rgba(0,0,0,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              cursor: 'pointer',
              transition: 'transform 0.16s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.16s ease',
              transform: isLaunchpadOpen ? 'scale(1.12) translateY(-4px)' : (hoveredDockId === 'launchpad' ? 'scale(1.18) translateY(-6px)' : 'none'),
            }}
          >
            🚀
          </button>
          <div
            style={{
              width: '4px',
              height: '4px',
              borderRadius: '50%',
              marginTop: '2px',
              background: isLaunchpadOpen ? '#a855f7' : 'transparent',
              boxShadow: isLaunchpadOpen ? '0 0 6px #a855f7' : 'none',
              transition: 'all 0.2s ease',
            }}
          />
        </div>

        {/* Separator */}
        <div style={{ width: '1px', height: '36px', background: 'rgba(255, 255, 255, 0.15)', margin: '0 2px 4px' }} />

        {/* Main Dock Items */}
        {macDockItems.map((item) => {
          const win = windows.find((w) => w.id === item.id);
          const isOpen = Boolean(win?.isOpen);
          const isActive = activeWindowId === item.id && !win?.isMinimized;

          return (
            <div
              key={item.id}
              style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            >
              {hoveredDockId === item.id && (
                <div className="mac-dock-tooltip">{item.label}</div>
              )}
              <button
                type="button"
                className="mac-dock-icon-btn"
                onMouseEnter={() => setHoveredDockId(item.id)}
                onMouseLeave={() => setHoveredDockId(null)}
                onClick={() => {
                  if (isOpen) {
                    if (isActive) {
                      if (isMac) {
                        const win =
                          document.getElementById(`${item.id}-window`) ||
                          (item.id === 'ide' ? document.getElementById('ide-window') : null) ||
                          (document.querySelector('.win95-window') as HTMLElement | null);
                        if (win) {
                          win.classList.add('mac-window-minimizing');
                          setTimeout(() => {
                            onToggleMinimize(item.id);
                            win.classList.remove('mac-window-minimizing');
                          }, 180);
                          return;
                        }
                      }
                      onToggleMinimize(item.id);
                    } else {
                      onFocusWindow(item.id);
                    }
                  } else {
                    onOpenWindow(item.id);
                  }
                }}
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: item.bg,
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                  cursor: 'pointer',
                  transition: 'transform 0.16s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.16s ease',
                  transform: hoveredDockId === item.id ? 'scale(1.18) translateY(-6px)' : 'none',
                }}
              >
                {item.icon}
              </button>

              {/* Running App Glowing Dot */}
              <div
                style={{
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  marginTop: '2px',
                  background: isOpen ? '#38bdf8' : 'transparent',
                  boxShadow: isOpen ? '0 0 6px #38bdf8' : 'none',
                  transition: 'background 0.2s ease',
                }}
              />
            </div>
          );
        })}

        {/* Separator */}
        <div style={{ width: '1px', height: '36px', background: 'rgba(255, 255, 255, 0.15)', margin: '0 2px 4px' }} />

        {/* Trash / Reset Session Icon */}
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {hoveredDockId === 'trash' && (
            <div className="mac-dock-tooltip">Trash / Reset Database</div>
          )}
          <button
            type="button"
            className="mac-dock-icon-btn"
            onMouseEnter={() => setHoveredDockId('trash')}
            onMouseLeave={() => setHoveredDockId(null)}
            onClick={onResetSession}
            title="Reset Database Memory"
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #475569 0%, #1e293b 100%)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              cursor: 'pointer',
              transition: 'transform 0.16s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.16s ease',
              transform: hoveredDockId === 'trash' ? 'scale(1.18) translateY(-6px)' : 'none',
            }}
          >
            🗑️
          </button>
          <div style={{ height: '4px' }} />
        </div>
      </nav>
    </>
  );
}

  // Classic Windows 95 Taskbar for retro themes
  return (
    <>
      {/* Start Menu Dropup */}
      {startMenuOpen && (
        <div
          className="win95-start-menu"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="win95-start-banner">
            ExNihilo<span style={{ fontWeight: 'normal', opacity: 0.9 }}>95</span>
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
              onClick={() => { onOpenWindow('erd'); setStartMenuOpen(false); }}
            >
              <span style={{ fontSize: '16px' }}>🌐</span>
              <div>
                <strong>Relation Visualizer (ERD)</strong>
                <div style={{ fontSize: '10px', color: '#555' }}>Interactive Entity-Relationship Diagrams</div>
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

            <div
              className="win95-start-item"
              onClick={() => { onOpenWindow('challenges'); setStartMenuOpen(false); }}
            >
              <span style={{ fontSize: '16px' }}>🏆</span>
              <div>
                <strong>SQL Challenge Arena</strong>
                <div style={{ fontSize: '10px', color: '#555' }}>130+ LeetCode SQL Puzzles</div>
              </div>
            </div>

            <div
              className="win95-start-item"
              onClick={() => { onOpenWindow('detective'); setStartMenuOpen(false); }}
            >
              <span style={{ fontSize: '16px' }}>🕵️</span>
              <div>
                <strong>Case Files (Homicide Bureau)</strong>
                <div style={{ fontSize: '10px', color: '#555' }}>SQL Noir: Unsolved Mysteries (1995)</div>
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

            {/* Log Off Item */}
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
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          onClick={(e) => {
            e.stopPropagation();
            setStartMenuOpen(!startMenuOpen);
          }}
        >
          <ExNihiloLogo size={16} showText={false} />
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
            title={isLoggedIn ? `Logged in as @${currentUser?.usernameNorm} (Full Access)` : 'Click to Log In / Register'}
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

