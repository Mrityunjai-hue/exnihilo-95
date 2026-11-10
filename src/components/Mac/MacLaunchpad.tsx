/**
 * MacLaunchpad.tsx — Fullscreen macOS Modern Launchpad App Launcher
 *
 * Implements the authentic Apple macOS Launchpad experience:
 * - Immersive full-screen frosted glass blur
 * - Spotlight-style instant app search filter
 * - Responsive squircle app icon grid with spring hover feedback
 * - Keyboard navigation (Esc to close, auto-focused search)
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { StoredUser } from '../../hooks/useAuth';

export interface MacLaunchpadProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenApp: (appId: string) => void;
  onStartTour: () => void;
  currentUser: StoredUser | null;
  isLoggedIn: boolean;
}

interface LaunchpadApp {
  id: string;
  name: string;
  category: string;
  icon: string;
  bg: string;
  action: () => void;
}

export const MacLaunchpad: React.FC<MacLaunchpadProps> = ({
  isOpen,
  onClose,
  onOpenApp,
  onStartTour,
  currentUser,
  isLoggedIn,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus search input on open & listen for Escape
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  const apps: LaunchpadApp[] = useMemo(() => [
    {
      id: 'ide',
      name: 'SQL Studio',
      category: 'Developer Tools',
      icon: '💻',
      bg: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
      action: () => { onOpenApp('ide'); onClose(); },
    },
    {
      id: 'sqlDictionary',
      name: 'SQL Dictionary',
      category: 'Reference',
      icon: '📖',
      bg: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
      action: () => { onOpenApp('sqlDictionary'); onClose(); },
    },
    {
      id: 'challenges',
      name: 'LeetCode SQL',
      category: 'Puzzles & Challenges',
      icon: '🏆',
      bg: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
      action: () => { onOpenApp('challenges'); onClose(); },
    },
    {
      id: 'erd',
      name: 'Relation Visualizer (ERD)',
      category: 'Data & Databases',
      icon: '🌐',
      bg: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
      action: () => { onOpenApp('erd'); onClose(); },
    },
    {
      id: 'help',
      name: 'Help & SQL Guide',
      category: 'Documentation',
      icon: '❓',
      bg: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
      action: () => { onOpenApp('help'); onClose(); },
    },
    {
      id: 'settings',
      name: 'System Settings',
      category: 'Preferences',
      icon: '⚙️',
      bg: 'linear-gradient(135deg, #475569 0%, #334155 100%)',
      action: () => { onOpenApp('settings'); onClose(); },
    },
    {
      id: 'account',
      name: isLoggedIn ? (currentUser?.displayName || `@${currentUser?.usernameNorm}`) : 'User Account / Sign In',
      category: 'Account',
      icon: isLoggedIn ? (currentUser?.avatar || '👤') : '🔑',
      bg: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
      action: () => { onOpenApp(isLoggedIn ? 'admin' : 'auth'); onClose(); },
    },
    {
      id: 'wizard',
      name: 'Setup Wizard',
      category: 'Utility',
      icon: '🧙‍♂️',
      bg: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      action: () => { onOpenApp('wizard'); onClose(); },
    },
    {
      id: 'tour',
      name: 'Interactive Tour',
      category: 'Walkthrough',
      icon: '🚀',
      bg: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
      action: () => { onStartTour(); onClose(); },
    },
    {
      id: 'welcome',
      name: 'About ExNihilo',
      category: 'Information',
      icon: '✨',
      bg: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)',
      action: () => { onOpenApp('welcome'); onClose(); },
    },
    {
      id: 'contributors',
      name: 'Community & Team',
      category: 'Community',
      icon: '🤝',
      bg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      action: () => { onOpenApp('contributors'); onClose(); },
    },
    {
      id: 'legal',
      name: 'Legal & License',
      category: 'System',
      icon: '⚖️',
      bg: 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
      action: () => { onOpenApp('legal'); onClose(); },
    },
    {
      id: 'shutdown',
      name: 'Restart Session',
      category: 'System',
      icon: '🔄',
      bg: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      action: () => { onOpenApp('shutdown'); onClose(); },
    },
  ], [onOpenApp, onClose, onStartTour, isLoggedIn, currentUser]);

  const filteredApps = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return apps;
    return apps.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        a.id.toLowerCase().includes(q)
    );
  }, [apps, searchQuery]);

  if (!isOpen) return null;

  return (
    <div
      className="mac-launchpad-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99998,
        background: 'rgba(8, 12, 22, 0.78)',
        WebkitBackdropFilter: 'blur(48px) saturate(200%)',
        backdropFilter: 'blur(48px) saturate(200%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '50px 24px 100px 24px',
        overflowY: 'auto',
        boxSizing: 'border-box',
        animation: 'macLaunchpadIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* Search Header Container (stops backdrop click propagation) */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
          width: '100%',
          maxWidth: '480px',
          marginBottom: '40px',
        }}
      >
        <div style={{ position: 'relative', width: '100%', maxWidth: '320px' }}>
          <span
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.6)',
              pointerEvents: 'none',
            }}
          >
            🔍
          </span>
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Applications..."
            style={{
              width: '100%',
              height: '38px',
              borderRadius: '20px',
              background: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.22)',
              color: '#ffffff',
              padding: '0 16px 0 38px',
              fontSize: '13px',
              fontFamily: 'var(--w95-font)',
              outline: 'none',
              boxSizing: 'border-box',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
              transition: 'all 0.15s ease',
            }}
          />
        </div>

        <div
          style={{
            fontSize: '11px',
            color: 'rgba(255, 255, 255, 0.5)',
            fontFamily: 'var(--w95-font)',
          }}
        >
          Press <kbd style={{ background: 'rgba(255,255,255,0.15)', padding: '2px 6px', borderRadius: '4px', color: '#fff' }}>Esc</kbd> or click outside to exit
        </div>
      </div>

      {/* App Grid */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 120px))',
          gap: '32px 28px',
          justifyContent: 'center',
          alignItems: 'start',
          width: '100%',
          maxWidth: '840px',
          margin: '0 auto',
        }}
      >
        {filteredApps.map((app) => (
          <button
            key={app.id}
            type="button"
            className="mac-launchpad-app-card"
            onClick={app.action}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '8px',
              borderRadius: '16px',
              outline: 'none',
              transition: 'transform 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* Squircle Icon */}
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '18px',
                background: app.bg,
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 12px 28px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '34px',
                transition: 'transform 0.18s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.18s ease',
              }}
            >
              {app.icon}
            </div>

            {/* App Label */}
            <span
              style={{
                marginTop: '10px',
                fontSize: '12px',
                fontWeight: 500,
                color: '#ffffff',
                fontFamily: 'var(--w95-font)',
                textAlign: 'center',
                lineHeight: 1.25,
                textShadow: '0 1px 4px rgba(0, 0, 0, 0.8)',
                maxWidth: '105px',
                wordBreak: 'break-word',
              }}
            >
              {app.name}
            </span>
          </button>
        ))}

        {filteredApps.length === 0 && (
          <div
            style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '40px',
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '14px',
              fontFamily: 'var(--w95-font)',
            }}
          >
            No apps matching &ldquo;{searchQuery}&rdquo;
          </div>
        )}
      </div>
    </div>
  );
};
