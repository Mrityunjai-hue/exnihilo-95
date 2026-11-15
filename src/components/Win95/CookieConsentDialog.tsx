/**
 * CookieConsentDialog.tsx — Windows 95 Authentic Cookie & Local Storage Manager
 *
 * Provides a vintage Windows 95 dialog for managing local cookies and browser storage.
 * Supports granular categories (Essential, Preferences, Performance), persistent
 * localStorage consent tracking, theme styling, and direct navigation to Privacy Policy.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useDraggable } from '../../hooks/useDraggable';
import { WindowControls } from './WindowControls';

export interface CookiePreferences {
  essential:   boolean; // Always true (SQLite catalog, auth keychain)
  preferences: boolean; // Theme skins, UI scale, CRT filter, open windows
  analytics:   boolean; // Vercel Speed Insights anonymous latency telemetry
  timestamp:   string;
}

const STORAGE_KEY = 'exnihilo_cookie_consent';

export const getStoredCookiePreferences = (): CookiePreferences | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

interface CookieConsentDialogProps {
  isOpen:         boolean;
  zIndex?:        number;
  onClose:        () => void;
  onOpenPrivacy?: () => void;
  onFocus?:       () => void;
}

export const CookieConsentDialog: React.FC<CookieConsentDialogProps> = ({
  isOpen,
  zIndex = 99999,
  onClose,
  onOpenPrivacy,
  onFocus,
}) => {
  const [showCustomize, setShowCustomize] = useState(false);
  const [prefStorage, setPrefStorage] = useState(true);
  const [prefAnalytics, setPrefAnalytics] = useState(true);
  const { position, handleMouseDown } = useDraggable({ x: 180, y: 140 });

  // Load existing preferences if available
  useEffect(() => {
    const existing = getStoredCookiePreferences();
    if (existing) {
      setPrefStorage(existing.preferences ?? true);
      setPrefAnalytics(existing.analytics ?? true);
    }
  }, [isOpen]);

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const saveConsent = (preferences: boolean, analytics: boolean) => {
    const payload: CookiePreferences = {
      essential: true,
      preferences,
      analytics,
      timestamp: new Date().toISOString(),
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.error('Failed to save cookie preferences', e);
    }
    onClose();
  };

  const handleAcceptAll = () => {
    saveConsent(true, true);
  };

  const handleEssentialOnly = () => {
    saveConsent(false, false);
  };

  const handleSaveCustom = () => {
    saveConsent(prefStorage, prefAnalytics);
  };

  return (
    <div
      id="cookie-consent-dialog"
      className="win95-window"
      style={{
        position: 'fixed',
        top: `${position.y}px`,
        left: `${position.x}px`,
        width: '510px',
        maxWidth: '94vw',
        zIndex,
        boxShadow: '4px 4px 20px rgba(0, 0, 0, 0.7)',
        boxSizing: 'border-box',
      }}
      onMouseDown={onFocus}
      role="dialog"
      aria-labelledby="cookie-dialog-title"
    >
      {/* ── Title Bar ────────────────────────────────────────────────────── */}
      <div
        className="win95-titlebar"
        onMouseDown={(e) => {
          if (onFocus) onFocus();
          handleMouseDown(e);
        }}
        style={{ cursor: 'move' }}
      >
        <div className="win95-titlebar-text" id="cookie-dialog-title">
          <span>🍪</span>
          <span>Windows 95 Storage &amp; Cookie Preferences</span>
        </div>
        <WindowControls
          showMinimize={false}
          showMaximize={false}
          onClose={onClose}
        />
      </div>

      {/* ── Dialog Body ──────────────────────────────────────────────────── */}
      <div style={{ padding: '12px 14px', background: 'var(--w95-gray, #c0c0c0)', color: 'var(--w95-text-color, #000000)' }}>
        {/* Banner with Vintage Storage Icon */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '12px' }}>
          <div style={{ fontSize: '32px', lineHeight: 1, filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.3))' }}>
            🍪
          </div>
          <div>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '13px', color: 'var(--w95-accent-color, var(--w95-titlebar-active, #000080))' }}>
              Local Workstation Storage Configuration
            </h3>
            <p style={{ margin: 0, fontSize: '11px', lineHeight: '1.5' }}>
              ExNihilo 95 runs entirely inside your client browser. We utilize local browser storage and minimal cookies to maintain your encrypted local credentials, synthetic table schemas, and retro desktop skins. <strong>We never sell your data or track you across the web.</strong>
            </p>
          </div>
        </div>

        {/* Granular Preferences Box */}
        <div
          className="win95-inset"
          style={{
            background: 'var(--w95-sunken-bg, #ffffff)',
            color: 'var(--w95-sunken-text, #000000)',
            padding: '10px 12px',
            marginBottom: '12px',
            maxHeight: showCustomize ? '240px' : '90px',
            overflowY: 'auto',
            transition: 'max-height 0.2s ease',
            fontSize: '11px',
          }}
        >
          {/* 1. Essential Storage (Locked) */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
            <input
              type="checkbox"
              id="cookie-essential"
              checked={true}
              disabled={true}
              style={{ marginTop: '2px', cursor: 'not-allowed' }}
            />
            <div>
              <label htmlFor="cookie-essential" style={{ fontWeight: 'bold', cursor: 'not-allowed' }}>
                Strictly Essential Engine Storage (Always Required)
              </label>
              <div style={{ fontSize: '10px', color: 'var(--w95-dark-gray, #555555)', marginTop: '1px' }}>
                Powers in-memory SQLite tables, query execution state, and local PBKDF2 encrypted credentials. Without this, the IDE cannot execute SQL queries.
              </div>
            </div>
          </div>

          {showCustomize && (
            <>
              {/* 2. Preferences & Nostalgia Themes */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '10px', paddingTop: '8px', borderTop: '1px solid var(--w95-dark-gray, #dfdfdf)' }}>
                <input
                  type="checkbox"
                  id="cookie-preferences"
                  checked={prefStorage}
                  onChange={(e) => setPrefStorage(e.target.checked)}
                  style={{ marginTop: '2px', cursor: 'pointer' }}
                />
                <div>
                  <label htmlFor="cookie-preferences" style={{ fontWeight: 'bold', cursor: 'pointer' }}>
                    Desktop Customization &amp; Nostalgia Themes (Recommended)
                  </label>
                  <div style={{ fontSize: '10px', color: 'var(--w95-dark-gray, #555555)', marginTop: '1px' }}>
                    Remembers your selected skin (Classic 95, Win98, 2000, XP Luna, Win7 Aero, Noir, macOS), UI zoom scale, and CRT scanline filter.
                  </div>
                </div>
              </div>

              {/* 3. Performance & Speed Insights */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '10px', paddingTop: '8px', borderTop: '1px solid var(--w95-dark-gray, #dfdfdf)' }}>
                <input
                  type="checkbox"
                  id="cookie-analytics"
                  checked={prefAnalytics}
                  onChange={(e) => setPrefAnalytics(e.target.checked)}
                  style={{ marginTop: '2px', cursor: 'pointer' }}
                />
                <div>
                  <label htmlFor="cookie-analytics" style={{ fontWeight: 'bold', cursor: 'pointer' }}>
                    Anonymous Speed Insights &amp; Latency Benchmarking
                  </label>
                  <div style={{ fontSize: '10px', color: 'var(--w95-dark-gray, #555555)', marginTop: '1px' }}>
                    Measures aggregated page load and WebAssembly cold-start latencies via Vercel Speed Insights. No queries or identity data are collected.
                  </div>
                </div>
              </div>
            </>
          )}

          {!showCustomize && (
            <div style={{ textAlign: 'center', marginTop: '6px' }}>
              <button
                type="button"
                onClick={() => setShowCustomize(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  fontSize: '11px',
                  color: 'var(--w95-accent-color, #000080)',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                ⚙️ Customize Granular Permissions &gt;&gt;
              </button>
            </div>
          )}
        </div>

        {/* Notice & Privacy Policy Link */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', fontSize: '10.5px', color: 'var(--w95-dark-gray, #555555)' }}>
          <span>Preferences stored locally on drive C:\</span>
          {onOpenPrivacy && (
            <button
              type="button"
              onClick={onOpenPrivacy}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                fontSize: '10.5px',
                color: 'var(--w95-accent-color, #000080)',
                textDecoration: 'underline',
                cursor: 'pointer',
              }}
            >
              🔒 Read Full Privacy Policy
            </button>
          )}
        </div>

        {/* ── Action Buttons ──────────────────────────────────────────────── */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '8px',
            paddingTop: '8px',
            borderTop: '1px solid var(--w95-dark-gray, #808080)',
            flexWrap: 'wrap',
          }}
        >
          <button
            type="button"
            className="win95-button"
            style={{ fontSize: '11px', padding: '3px 12px' }}
            onClick={handleEssentialOnly}
          >
            Essential Only
          </button>

          {showCustomize && (
            <button
              type="button"
              className="win95-button"
              style={{ fontSize: '11px', padding: '3px 12px' }}
              onClick={handleSaveCustom}
            >
              💾 Save Choices
            </button>
          )}

          <button
            type="button"
            className="win95-button win95-button-default"
            style={{
              fontSize: '11px',
              padding: '3px 16px',
              fontWeight: 'bold',
              background: 'var(--w95-title-active-bg, #000080)',
              color: 'var(--w95-title-active-text, #ffffff)',
            }}
            onClick={handleAcceptAll}
            autoFocus
          >
            ✅ Accept All
          </button>
        </div>
      </div>
    </div>
  );
};
