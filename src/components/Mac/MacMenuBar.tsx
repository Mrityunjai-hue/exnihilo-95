/**
 * MacMenuBar.tsx — Native macOS Top Menu Bar Component
 * Rendered at the top of the screen in 'macos-glass' theme.
 * Features  Apple menu, active app menus (File, Edit, Query, View, Tools, Window, Help),
 * System Status items (Dialect Pill, HTTPS Shield, User Account, Control Center, Spotlight, Clock).
 */

import React, { useState, useEffect, useRef } from 'react';
import { StoredUser } from '../../hooks/useAuth';
import { Dialect } from '../../engine/parser';

interface MacMenuBarProps {
  onOpenWindow: (id: string) => void;
  activeWindowId: string | null;
  dialect: Dialect;
  onDialectChange: (dialect: Dialect) => void;
  currentUser: StoredUser | null;
  isLoggedIn: boolean;
  isSecureContext: boolean;
  crtEnabled?: boolean;
  onToggleCrt?: () => void;
  onResetSession: () => void;
  onLogout: () => void;
  onRunQuery?: () => void;
  onFormatSql?: () => void;
  onStartTour: () => void;
}

export const MacMenuBar: React.FC<MacMenuBarProps> = ({
  onOpenWindow,
  activeWindowId,
  dialect,
  onDialectChange,
  currentUser,
  isLoggedIn,
  isSecureContext,
  crtEnabled,
  onToggleCrt,
  onResetSession,
  onLogout,
  onRunQuery,
  onFormatSql,
  onStartTour,
}) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [timeStr, setTimeStr] = useState('');
  const menuBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      };
      setTimeStr(d.toLocaleString('en-US', options).replace(/,/g, ''));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Close menus on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuBarRef.current && !menuBarRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };
    window.addEventListener('mousedown', handleOutsideClick);
    return () => window.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const toggleMenu = (menuName: string) => {
    setActiveMenu(activeMenu === menuName ? null : menuName);
  };

  return (
    <header
      ref={menuBarRef}
      className="mac-menubar"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '28px',
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(28px) saturate(190%)',
        WebkitBackdropFilter: 'blur(28px) saturate(190%)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.10)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 12px',
        fontSize: '13px',
        fontWeight: 500,
        color: '#f8fafc',
        zIndex: 999999,
        fontFamily: 'var(--w95-font)',
        userSelect: 'none',
      }}
    >
      {/* Left Menu Items */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
        {/* Apple Menu */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            className={`mac-menu-trigger ${activeMenu === 'apple' ? 'active' : ''}`}
            onClick={() => toggleMenu('apple')}
            style={{
              background: activeMenu === 'apple' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
              border: 'none',
              borderRadius: '6px',
              color: '#f8fafc',
              padding: '2px 8px',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              lineHeight: 1,
            }}
          >
            
          </button>
          {activeMenu === 'apple' && (
            <div className="mac-dropdown-menu">
              <div className="mac-dropdown-item" onClick={() => { onOpenWindow('welcome'); setActiveMenu(null); }}>
                <span>About ExNihilo Studio</span>
              </div>
              <div className="mac-dropdown-divider" />
              <div className="mac-dropdown-item" onClick={() => { onOpenWindow('settings'); setActiveMenu(null); }}>
                <span>System Settings...</span>
                <span className="mac-shortcut">⌘,</span>
              </div>
              <div className="mac-dropdown-item" onClick={() => { onOpenWindow('auth'); setActiveMenu(null); }}>
                <span>User Accounts...</span>
              </div>
              <div className="mac-dropdown-divider" />
              <div className="mac-dropdown-item" onClick={() => { onResetSession(); setActiveMenu(null); }}>
                <span>Clear Database Memory...</span>
              </div>
              <div className="mac-dropdown-item" onClick={() => { onOpenWindow('shutdown'); setActiveMenu(null); }}>
                <span>Restart ExNihilo...</span>
              </div>
              <div className="mac-dropdown-item" onClick={() => { onOpenWindow('shutdown'); setActiveMenu(null); }}>
                <span>Shut Down...</span>
              </div>
            </div>
          )}
        </div>

        {/* App Title */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            className={`mac-menu-trigger ${activeMenu === 'app' ? 'active' : ''}`}
            onClick={() => toggleMenu('app')}
            style={{
              background: activeMenu === 'app' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
              border: 'none',
              borderRadius: '6px',
              color: '#f8fafc',
              padding: '2px 8px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            ExNihilo
          </button>
          {activeMenu === 'app' && (
            <div className="mac-dropdown-menu">
              <div className="mac-dropdown-item" onClick={() => { onOpenWindow('welcome'); setActiveMenu(null); }}>
                <span>About ExNihilo</span>
              </div>
              <div className="mac-dropdown-item" onClick={() => { onStartTour(); setActiveMenu(null); }}>
                <span>Take Guided Product Tour</span>
              </div>
              <div className="mac-dropdown-divider" />
              <div className="mac-dropdown-item" onClick={() => { onOpenWindow('settings'); setActiveMenu(null); }}>
                <span>Preferences...</span>
                <span className="mac-shortcut">⌘,</span>
              </div>
              <div className="mac-dropdown-divider" />
              <div className="mac-dropdown-item" onClick={() => { onOpenWindow('ide'); setActiveMenu(null); }}>
                <span>Hide ExNihilo</span>
                <span className="mac-shortcut">⌘H</span>
              </div>
            </div>
          )}
        </div>

        {/* File Menu */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            className={`mac-menu-trigger ${activeMenu === 'file' ? 'active' : ''}`}
            onClick={() => toggleMenu('file')}
            style={{
              background: activeMenu === 'file' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
              border: 'none',
              borderRadius: '6px',
              color: '#f8fafc',
              padding: '2px 8px',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            File
          </button>
          {activeMenu === 'file' && (
            <div className="mac-dropdown-menu">
              <div className="mac-dropdown-item" onClick={() => { onOpenWindow('ide'); setActiveMenu(null); }}>
                <span>New Query Tab</span>
                <span className="mac-shortcut">⌘T</span>
              </div>
              <div className="mac-dropdown-item" onClick={() => { onOpenWindow('ide'); setActiveMenu(null); }}>
                <span>Open SQL Studio</span>
                <span className="mac-shortcut">⌘O</span>
              </div>
              <div className="mac-dropdown-divider" />
              <div className="mac-dropdown-item" onClick={() => { onOpenWindow('ide'); setActiveMenu(null); }}>
                <span>Export Active Results as CSV...</span>
              </div>
              <div className="mac-dropdown-item" onClick={() => { onOpenWindow('ide'); setActiveMenu(null); }}>
                <span>Export Schema DDL...</span>
              </div>
            </div>
          )}
        </div>

        {/* Edit Menu */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            className={`mac-menu-trigger ${activeMenu === 'edit' ? 'active' : ''}`}
            onClick={() => toggleMenu('edit')}
            style={{
              background: activeMenu === 'edit' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
              border: 'none',
              borderRadius: '6px',
              color: '#f8fafc',
              padding: '2px 8px',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            Edit
          </button>
          {activeMenu === 'edit' && (
            <div className="mac-dropdown-menu">
              <div className="mac-dropdown-item" onClick={() => { onFormatSql?.(); setActiveMenu(null); }}>
                <span>Format SQL Query</span>
                <span className="mac-shortcut">⌥⇧F</span>
              </div>
              <div className="mac-dropdown-item" onClick={() => { onOpenWindow('ide'); setActiveMenu(null); }}>
                <span>Clear Query Text</span>
              </div>
            </div>
          )}
        </div>

        {/* Query Menu */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            className={`mac-menu-trigger ${activeMenu === 'query' ? 'active' : ''}`}
            onClick={() => toggleMenu('query')}
            style={{
              background: activeMenu === 'query' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
              border: 'none',
              borderRadius: '6px',
              color: '#f8fafc',
              padding: '2px 8px',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            Query
          </button>
          {activeMenu === 'query' && (
            <div className="mac-dropdown-menu">
              <div className="mac-dropdown-item" onClick={() => { onRunQuery?.(); setActiveMenu(null); }}>
                <span>Run Query</span>
                <span className="mac-shortcut">⌘↵ / F5</span>
              </div>
              <div className="mac-dropdown-item" onClick={() => { onOpenWindow('ide'); setActiveMenu(null); }}>
                <span>Explain Query Plan</span>
                <span className="mac-shortcut">⌥E</span>
              </div>
              <div className="mac-dropdown-item" onClick={() => { onOpenWindow('ide'); setActiveMenu(null); }}>
                <span>Snippets Library</span>
                <span className="mac-shortcut">⌥S</span>
              </div>
              <div className="mac-dropdown-divider" />
              <div className="mac-dropdown-item" onClick={() => { onOpenWindow('ide'); setActiveMenu(null); }}>
                <span>Query Execution History</span>
                <span className="mac-shortcut">⌘H</span>
              </div>
            </div>
          )}
        </div>

        {/* View Menu */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            className={`mac-menu-trigger ${activeMenu === 'view' ? 'active' : ''}`}
            onClick={() => toggleMenu('view')}
            style={{
              background: activeMenu === 'view' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
              border: 'none',
              borderRadius: '6px',
              color: '#f8fafc',
              padding: '2px 8px',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            View
          </button>
          {activeMenu === 'view' && (
            <div className="mac-dropdown-menu">
              <div className="mac-dropdown-item" onClick={() => { onOpenWindow('ide'); setActiveMenu(null); }}>
                <span>Toggle Schema Explorer Sidebar</span>
                <span className="mac-shortcut">⌘B</span>
              </div>
              <div className="mac-dropdown-divider" />
              <div className="mac-dropdown-item" onClick={() => { onToggleCrt?.(); setActiveMenu(null); }}>
                <span>{crtEnabled ? '✓ CRT Monitor Filter (Enabled)' : '  CRT Monitor Filter (Disabled)'}</span>
              </div>
              <div className="mac-dropdown-item" onClick={() => { onOpenWindow('settings'); setActiveMenu(null); }}>
                <span>Appearance & Themes...</span>
              </div>
            </div>
          )}
        </div>

        {/* Tools Menu */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            className={`mac-menu-trigger ${activeMenu === 'tools' ? 'active' : ''}`}
            onClick={() => toggleMenu('tools')}
            style={{
              background: activeMenu === 'tools' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
              border: 'none',
              borderRadius: '6px',
              color: '#f8fafc',
              padding: '2px 8px',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            Tools
          </button>
          {activeMenu === 'tools' && (
            <div className="mac-dropdown-menu">
              <div className="mac-dropdown-item" onClick={() => { onOpenWindow('challenges'); setActiveMenu(null); }}>
                <span>🏆 SQL Challenge Arena (130+ LeetCode Problems)</span>
              </div>
              <div className="mac-dropdown-item" onClick={() => { onOpenWindow('sqlDictionary'); setActiveMenu(null); }}>
                <span>📖 SQL Dialects & Syntax Reference</span>
              </div>
              <div className="mac-dropdown-divider" />
              <div className="mac-dropdown-item" onClick={() => { onResetSession(); setActiveMenu(null); }}>
                <span>Reset Database & Memory</span>
              </div>
            </div>
          )}
        </div>

        {/* Help Menu */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            className={`mac-menu-trigger ${activeMenu === 'help' ? 'active' : ''}`}
            onClick={() => toggleMenu('help')}
            style={{
              background: activeMenu === 'help' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
              border: 'none',
              borderRadius: '6px',
              color: '#f8fafc',
              padding: '2px 8px',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            Help
          </button>
          {activeMenu === 'help' && (
            <div className="mac-dropdown-menu">
              <div className="mac-dropdown-item" onClick={() => { onOpenWindow('help'); setActiveMenu(null); }}>
                <span>SQL Tutorial & Query Guide</span>
              </div>
              <div className="mac-dropdown-item" onClick={() => { onStartTour(); setActiveMenu(null); }}>
                <span>Interactive Guided Tour</span>
              </div>
              <div className="mac-dropdown-item" onClick={() => { onOpenWindow('wizard'); setActiveMenu(null); }}>
                <span>Features Setup Wizard</span>
              </div>
              <div className="mac-dropdown-divider" />
              <div className="mac-dropdown-item" onClick={() => { onOpenWindow('contributors'); setActiveMenu(null); }}>
                <span>Join the Team & Contributors</span>
              </div>
              <div className="mac-dropdown-item" onClick={() => { onOpenWindow('legal'); setActiveMenu(null); }}>
                <span>Legal & IP Notice</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right System Tray & Status Items */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Active Dialect Selector Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '12px',
            padding: '2px 8px',
            fontSize: '11px',
            fontWeight: 600,
          }}
        >
          <span style={{ opacity: 0.6 }}>Dialect:</span>
          <select
            value={dialect}
            onChange={(e) => onDialectChange(e.target.value as Dialect)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#38bdf8',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              outline: 'none',
              padding: 0,
            }}
          >
            <option value="MySQL" style={{ background: '#0f172a', color: '#f8fafc' }}>MySQL</option>
            <option value="PostgreSQL" style={{ background: '#0f172a', color: '#f8fafc' }}>PostgreSQL</option>
            <option value="SQLite" style={{ background: '#0f172a', color: '#f8fafc' }}>SQLite</option>
            <option value="SSMS" style={{ background: '#0f172a', color: '#f8fafc' }}>SSMS (T-SQL)</option>
          </select>
        </div>

        {/* Security Shield */}
        <span
          title={isSecureContext ? 'WebCrypto PBKDF2 Enabled (HTTPS)' : 'Plain HTTP'}
          style={{ fontSize: '13px', cursor: 'help', opacity: isSecureContext ? 1 : 0.4 }}
        >
          {isSecureContext ? '🛡️' : '⚠️'}
        </span>

        {/* User Account / Control Center */}
        <button
          type="button"
          onClick={() => onOpenWindow(isLoggedIn ? 'admin' : 'auth')}
          title={isLoggedIn ? `Logged in as @${currentUser?.usernameNorm}` : 'Click to Log In / Register'}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {isLoggedIn ? (currentUser?.avatar || '👤') : '🔑'}
        </button>

        {/* Control Center Icon */}
        <button
          type="button"
          onClick={() => onOpenWindow('settings')}
          title="Control Center & System Settings"
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            fontSize: '12px',
            color: '#94a3b8',
          }}
        >
          🎛️
        </button>

        {/* Real-time Clock */}
        <span style={{ fontSize: '12px', fontWeight: 500, color: '#f8fafc', minWidth: '120px', textAlign: 'right' }}>
          {timeStr || 'Thu Oct 8 11:30 PM'}
        </span>
      </div>
    </header>
  );
};
