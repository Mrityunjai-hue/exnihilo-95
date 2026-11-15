/**
 * not-found.tsx — Authentic Windows 95 HTTP 404 Error Page
 *
 * Catches any unmatched route across ExNihilo 95 and displays a vintage
 * Windows 95 "File or Directory Not Found" desktop interface.
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function NotFound() {
  const [currentPath, setCurrentPath] = useState<string>('');
  const [systemTime, setSystemTime] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentPath(window.location.pathname);
      const updateClock = () => {
        const now = new Date();
        setSystemTime(
          now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        );
      };
      updateClock();
      const interval = setInterval(updateClock, 1000);
      return () => clearInterval(interval);
    }
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#008080', // Classic Windows 95 Teal Desktop
        backgroundImage: 'radial-gradient(circle at 50% 50%, #008a8a 0%, #008080 70%, #006666 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        fontFamily: "'MS Sans Serif', Tahoma, Geneva, Verdana, sans-serif",
        color: '#000000',
        userSelect: 'none',
        overflow: 'hidden',
      }}
    >
      {/* ── Main Error Dialog Area ───────────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
        }}
      >
        <div
          className="win95-window"
          style={{
            width: '540px',
            maxWidth: '95vw',
            backgroundColor: '#c0c0c0',
            borderTop: '2px solid #ffffff',
            borderLeft: '2px solid #ffffff',
            borderRight: '2px solid #000000',
            borderBottom: '2px solid #000000',
            boxShadow: '4px 4px 24px rgba(0, 0, 0, 0.7)',
            display: 'flex',
            flexDirection: 'column',
          }}
          role="alertdialog"
          aria-labelledby="not-found-title"
        >
          {/* Title Bar */}
          <div
            style={{
              background: 'linear-gradient(90deg, #000080 0%, #1084d0 100%)',
              color: '#ffffff',
              padding: '3px 4px 3px 6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontWeight: 'bold',
              fontSize: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} id="not-found-title">
              <span>⚠️</span>
              <span>ExNihilo 95 — HTTP 404 (File Not Found)</span>
            </div>
            <Link
              href="/"
              style={{
                width: '16px',
                height: '14px',
                backgroundColor: '#c0c0c0',
                borderTop: '1px solid #ffffff',
                borderLeft: '1px solid #ffffff',
                borderRight: '1px solid #000000',
                borderBottom: '1px solid #000000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#000000',
                fontSize: '10px',
                fontWeight: 'bold',
                textDecoration: 'none',
                lineHeight: 1,
              }}
              title="Close and return to desktop"
            >
              ✕
            </Link>
          </div>

          {/* Dialog Body */}
          <div style={{ padding: '16px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div
              style={{
                fontSize: '40px',
                lineHeight: 1,
                filter: 'drop-shadow(2px 2px 0px rgba(0,0,0,0.2))',
              }}
            >
              ⚠️
            </div>

            <div style={{ flex: 1, fontSize: '11px', lineHeight: '1.5' }}>
              <h2 style={{ margin: '0 0 6px 0', fontSize: '13px', fontWeight: 'bold' }}>
                Cannot find the requested file or directory on drive C:\
              </h2>
              <p style={{ margin: '0 0 10px 0' }}>
                The resource at path <strong>{currentPath || '/unknown'}</strong> does not exist in this ExNihilo 95 environment, or was relocated during a recent system software update.
              </p>

              {/* Diagnostic Box */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderTop: '1px solid #808080',
                  borderLeft: '1px solid #808080',
                  borderRight: '1px solid #ffffff',
                  borderBottom: '1px solid #ffffff',
                  padding: '8px 10px',
                  fontFamily: "'Courier New', Courier, monospace",
                  fontSize: '10.5px',
                  color: '#333333',
                  marginBottom: '12px',
                }}
              >
                <div><strong>ERROR CODE:</strong> 404_RESOURCE_NOT_FOUND</div>
                <div><strong>DRIVE:</strong> C:\EXNIHILO\WEB_ROOT{currentPath}</div>
                <div><strong>SYSTEM:</strong> Windows 95 Relational WASM Kernel v2.1</div>
                <div><strong>ACTION:</strong> Return to Desktop or Launch SQL IDE Shell.</div>
              </div>

              <p style={{ margin: 0, color: '#555555' }}>
                * Verify the URL spelling in your browser address bar.
                <br />
                * Use the buttons below to return to the active SQL workspace.
              </p>
            </div>
          </div>

          {/* Dialog Action Buttons */}
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: '#c0c0c0',
              borderTop: '1px solid #808080',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '8px',
              flexWrap: 'wrap',
            }}
          >
            <Link
              href="/"
              style={{
                backgroundColor: '#c0c0c0',
                color: '#000000',
                borderTop: '2px solid #ffffff',
                borderLeft: '2px solid #ffffff',
                borderRight: '2px solid #000000',
                borderBottom: '2px solid #000000',
                padding: '4px 14px',
                fontSize: '11px',
                fontWeight: 'bold',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span>🗄️</span> Return to Desktop
            </Link>

            <Link
              href="/"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  try {
                    const existing = JSON.parse(localStorage.getItem('exnihilo_open_windows') || '{}');
                    localStorage.setItem('exnihilo_open_windows', JSON.stringify({ ...existing, ide: true }));
                  } catch {}
                }
              }}
              style={{
                backgroundColor: '#c0c0c0',
                color: '#000000',
                borderTop: '2px solid #ffffff',
                borderLeft: '2px solid #ffffff',
                borderRight: '2px solid #000000',
                borderBottom: '2px solid #000000',
                padding: '4px 14px',
                fontSize: '11px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span>💻</span> Open SQL IDE
            </Link>
          </div>
        </div>
      </div>

      {/* ── Retro Windows 95 Taskbar ─────────────────────────────────────── */}
      <div
        style={{
          height: '30px',
          backgroundColor: '#c0c0c0',
          borderTop: '2px solid #ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '2px 4px',
          zIndex: 10,
        }}
      >
        <Link
          href="/"
          style={{
            height: '24px',
            backgroundColor: '#c0c0c0',
            borderTop: '2px solid #ffffff',
            borderLeft: '2px solid #ffffff',
            borderRight: '2px solid #000000',
            borderBottom: '2px solid #000000',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '0 8px',
            fontWeight: 'bold',
            fontSize: '12px',
            color: '#000000',
            textDecoration: 'none',
          }}
        >
          <span style={{ fontSize: '14px' }}>🏁</span>
          <span>Start</span>
        </Link>

        {/* Tray Clock */}
        <div
          style={{
            borderTop: '1px solid #808080',
            borderLeft: '1px solid #808080',
            borderRight: '1px solid #ffffff',
            borderBottom: '1px solid #ffffff',
            padding: '2px 8px',
            fontSize: '11px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span>🔊</span>
          <span>{systemTime || '12:00 PM'}</span>
        </div>
      </div>
    </div>
  );
}
