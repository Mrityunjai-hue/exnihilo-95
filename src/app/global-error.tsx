/**
 * global-error.tsx — Root Layout Fatal Error Boundary (Windows 95 BSOD)
 *
 * Catches catastrophic errors that break the Next.js root layout.
 * Renders an authentic full-screen Blue Screen of Death (BSOD) with zero
 * external CSS dependencies so it is guaranteed to render in all crash states.
 */

'use client';

import React from 'react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  const handleSafeReboot = () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('exnihilo_open_windows');
      } catch {}
      window.location.href = '/';
    }
  };

  const handleHardRefresh = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  return (
    <html lang="en">
      <head>
        <title>ExNihilo 95 — Fatal System Exception</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body
        style={{
          margin: 0,
          backgroundColor: '#0000AA', // Authentic Windows 95 BSOD Blue
          color: '#FFFFFF',
          fontFamily: "'Courier New', Courier, monospace",
          height: '100vh',
          width: '100vw',
          overflow: 'auto',
          boxSizing: 'border-box',
          padding: '40px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          userSelect: 'text',
        }}
      >
        <div style={{ maxWidth: '800px', width: '100%' }}>
          {/* Header Banner */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <span
              style={{
                backgroundColor: '#AAAAAA',
                color: '#0000AA',
                fontWeight: 'bold',
                fontSize: '18px',
                padding: '3px 18px',
                display: 'inline-block',
                letterSpacing: '1px',
              }}
            >
              ExNihilo 95
            </span>
          </div>

          <p style={{ fontSize: '15px', lineHeight: '1.6', margin: '0 0 18px 0' }}>
            A fatal exception 0E has occurred at 0028:C0011E36 in VXD EXNIHILO(01) + 00010E36.
            <br />
            The current execution loop has been halted by the Root System Supervisor.
          </p>

          {/* Diagnostic Crash Details */}
          <div
            style={{
              backgroundColor: '#000077',
              border: '1px solid #5555FF',
              padding: '12px 16px',
              marginBottom: '22px',
              fontSize: '13px',
              lineHeight: '1.5',
              maxHeight: '180px',
              overflowY: 'auto',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
            }}
          >
            <div style={{ color: '#FFFF55', fontWeight: 'bold', marginBottom: '6px' }}>
              FAULT: {error.name || 'System Exception'} — {error.message || 'Unknown root exception'}
            </div>
            <div style={{ color: '#AAAAAA', fontSize: '11.5px' }}>
              {error.stack || 'No extended stack dump is available.'}
            </div>
            {error.digest && (
              <div style={{ color: '#55FFFF', fontSize: '11px', marginTop: '6px' }}>
                DIGEST: {error.digest}
              </div>
            )}
          </div>

          <p style={{ fontSize: '14px', lineHeight: '1.6', margin: '0 0 24px 0' }}>
            * Press <strong>Restart Application</strong> to attempt memory recovery and reload.
            <br />
            * Press <strong>Safe Mode Reboot</strong> to clear window layout caches and perform a clean boot.
            <br />
            * Press <strong>Try Again</strong> to call the component recovery routine.
          </p>

          {/* Recovery Buttons */}
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <button
              onClick={reset}
              style={{
                backgroundColor: '#C0C0C0',
                color: '#000000',
                borderTop: '2px solid #FFFFFF',
                borderLeft: '2px solid #FFFFFF',
                borderRight: '2px solid #000000',
                borderBottom: '2px solid #000000',
                padding: '8px 18px',
                fontFamily: 'inherit',
                fontWeight: 'bold',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              Try Again
            </button>

            <button
              onClick={handleHardRefresh}
              style={{
                backgroundColor: '#C0C0C0',
                color: '#000000',
                borderTop: '2px solid #FFFFFF',
                borderLeft: '2px solid #FFFFFF',
                borderRight: '2px solid #000000',
                borderBottom: '2px solid #000000',
                padding: '8px 18px',
                fontFamily: 'inherit',
                fontWeight: 'bold',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              Restart Application
            </button>

            <button
              onClick={handleSafeReboot}
              style={{
                backgroundColor: '#C0C0C0',
                color: '#000000',
                borderTop: '2px solid #FFFFFF',
                borderLeft: '2px solid #FFFFFF',
                borderRight: '2px solid #000000',
                borderBottom: '2px solid #000000',
                padding: '8px 18px',
                fontFamily: 'inherit',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              Safe Mode Reboot (Reset Layout)
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
