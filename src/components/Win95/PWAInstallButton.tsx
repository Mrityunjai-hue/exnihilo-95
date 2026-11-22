/**
 * PWAInstallButton.tsx — Retro Windows 95 Native PWA Install Action Button
 * Triggers native OS / browser installation prompt or shows step-by-step install instructions.
 */

'use client';

import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  className?: string;
  style?: React.CSSProperties;
  label?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = 'win95-button',
  style,
  label = '💾 Install Offline App',
}) => {
  const { isInstallable, isInstalled, promptInstall } = usePWAInstall();
  const [showInstructions, setShowInstructions] = useState(false);

  if (isInstalled) {
    return (
      <span
        style={{
          fontSize: '11px',
          color: '#15803d',
          fontWeight: 'bold',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '2px 8px',
          ...style,
        }}
        title="ExNihilo 95 is installed as a native desktop application"
      >
        <span>✓</span>
        <span>App Installed</span>
      </span>
    );
  }

  const handleClick = async () => {
    if (isInstallable) {
      const accepted = await promptInstall();
      if (!accepted) {
        setShowInstructions(true);
      }
    } else {
      setShowInstructions(true);
    }
  };

  return (
    <>
      <button
        type="button"
        className={className}
        style={{
          fontSize: '11px',
          fontWeight: 'bold',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          cursor: 'pointer',
          padding: '2px 8px',
          ...style,
        }}
        onClick={handleClick}
        title="Install ExNihilo 95 locally for offline SQL querying"
      >
        <span>💾</span>
        <span>{label}</span>
      </button>

      {showInstructions && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={() => setShowInstructions(false)}
        >
          <div
            className="win95-window"
            style={{ width: '420px', maxWidth: '90vw', padding: '12px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="win95-titlebar" style={{ marginBottom: '10px' }}>
              <div className="win95-titlebar-text">
                <span>💻</span>
                <span>Install ExNihilo 95 Locally</span>
              </div>
              <button
                type="button"
                className="win95-button"
                style={{ padding: '0 4px', fontSize: '10px', fontWeight: 'bold' }}
                onClick={() => setShowInstructions(false)}
              >
                ✕
              </button>
            </div>

            <div style={{ fontSize: '12px', lineHeight: 1.5 }}>
              <p style={{ marginTop: 0 }}>
                <strong>How to install ExNihilo 95 on your device:</strong>
              </p>
              <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
                <li>
                  <strong>Chrome / Edge (Desktop):</strong> Click the install icon (🖥️ or ⊕) in the browser address bar, or click <em>Menu (⋮) → "Install ExNihilo 95"</em>.
                </li>
                <li>
                  <strong>macOS Safari:</strong> Click <em>File → "Add to Dock..."</em>.
                </li>
                <li>
                  <strong>iOS Safari:</strong> Tap the Share button (⎋), then tap <em>"Add to Home Screen"</em>.
                </li>
                <li>
                  <strong>Android Chrome:</strong> Tap <em>Menu (⋮) → "Install app"</em> or <em>"Add to Home screen"</em>.
                </li>
              </ul>
              <p style={{ fontSize: '11px', color: '#555', marginBottom: '12px' }}>
                Once installed, ExNihilo runs 100% offline with full in-browser SQLite WASM support and zero internet dependencies.
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <button
                type="button"
                className="win95-button"
                style={{ minWidth: '80px', padding: '3px 12px', fontSize: '11px', fontWeight: 'bold' }}
                onClick={() => setShowInstructions(false)}
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
