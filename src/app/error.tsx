/**
 * error.tsx — Next.js Client-Side Error Boundary & Update Notifier
 *
 * Catches runtime failures and chunk mismatch errors during new software releases,
 * rendering authentic Windows 95 System Fault or Software Update dialogs.
 */

'use client';

import React, { useState } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorProps) {
  const [copied, setCopied] = useState(false);

  // Detect if the failure was caused by a software update (ChunkLoadError / module fetch failure)
  const isChunkError =
    error?.name === 'ChunkLoadError' ||
    error?.message?.includes('Loading chunk') ||
    error?.message?.includes('Failed to fetch dynamically imported module') ||
    error?.message?.includes('importing a module script failed');

  const handleCopyCrashDump = () => {
    const dump = `EXNIHILO 95 CRASH DUMP:
Date: ${new Date().toISOString()}
Error Name: ${error.name || 'Application Fault'}
Message: ${error.message}
Digest: ${error.digest || 'N/A'}
Stack:
${error.stack || 'No stack trace available.'}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(dump).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      });
    }
  };

  const handleHardRefresh = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#008080',
        backgroundImage: 'radial-gradient(circle at 50% 50%, #008a8a 0%, #008080 70%, #006666 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "var(--w95-font-body, var(--font-inter), sans-serif)",
        color: '#000000',
        padding: '16px',
        boxSizing: 'border-box',
        userSelect: 'none',
        zIndex: 999999,
      }}
    >
      <div
        className="win95-window"
        style={{
          width: '560px',
          maxWidth: '96vw',
          backgroundColor: '#c0c0c0',
          borderTop: '2px solid #ffffff',
          borderLeft: '2px solid #ffffff',
          borderRight: '2px solid #000000',
          borderBottom: '2px solid #000000',
          boxShadow: '6px 6px 30px rgba(0, 0, 0, 0.8)',
          display: 'flex',
          flexDirection: 'column',
        }}
        role="alertdialog"
        aria-labelledby="system-error-title"
      >
        {/* Title Bar */}
        <div
          style={{
            background: isChunkError
              ? 'linear-gradient(90deg, #000080 0%, #1084d0 100%)'
              : 'linear-gradient(90deg, #800000 0%, #cc0000 100%)',
            color: '#ffffff',
            padding: '3px 6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontWeight: 'bold',
            fontSize: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} id="system-error-title">
            <span>{isChunkError ? '💿' : '❌'}</span>
            <span>
              {isChunkError
                ? 'ExNihilo 95 Software Update Notification'
                : 'ExNihilo 95 — Application Fault (EXNIHILO.EXE)'}
            </span>
          </div>
          <button
            onClick={reset}
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
              cursor: 'pointer',
              lineHeight: 1,
            }}
            title="Retry"
          >
            ✕
          </button>
        </div>

        {/* Dialog Body */}
        <div style={{ padding: '16px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
          <div style={{ fontSize: '42px', lineHeight: 1 }}>
            {isChunkError ? '💿' : '❌'}
          </div>

          <div style={{ flex: 1, fontSize: '11px', lineHeight: '1.5' }}>
            {isChunkError ? (
              <>
                <h3 style={{ margin: '0 0 6px 0', fontSize: '13px', color: '#000080', fontWeight: 'bold' }}>
                  A New Software Version of ExNihilo 95 Has Been Deployed!
                </h3>
                <p style={{ margin: '0 0 8px 0' }}>
                  Your browser session requested an older cached binary chunk that was superseded by an update.
                  The latest SQL dialect engine, synthetic schema inferrer, and security improvements are now available.
                </p>
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
                    marginBottom: '10px',
                  }}
                >
                  <div><strong>UPDATE STATUS:</strong> READY_FOR_REFRESH</div>
                  <div><strong>ACTION:</strong> Click &quot;Install Update &amp; Reload&quot; below.</div>
                </div>
              </>
            ) : (
              <>
                <h3 style={{ margin: '0 0 6px 0', fontSize: '13px', color: '#800000', fontWeight: 'bold' }}>
                  An unexpected application fault has occurred.
                </h3>
                <p style={{ margin: '0 0 8px 0' }}>
                  EXNIHILO.EXE encountered an unhandled exception at runtime. The ExNihilo Error Supervisor trapped the failure safely to prevent data loss.
                </p>

                {/* Exception Box */}
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
                    color: '#800000',
                    maxHeight: '120px',
                    overflowY: 'auto',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                    marginBottom: '10px',
                  }}
                >
                  <strong>{error.name || 'Error'}:</strong> {error.message || 'Unknown runtime fault'}
                </div>
              </>
            )}

            <p style={{ margin: 0, color: '#555555' }}>
              * Click <strong>{isChunkError ? 'Install Update & Reload' : 'Try Again'}</strong> to resume immediately.
              <br />
              * Your local catalog schema state will be preserved.
            </p>
          </div>
        </div>

        {/* Footer Buttons */}
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
          {!isChunkError && (
            <button
              type="button"
              onClick={handleCopyCrashDump}
              style={{
                backgroundColor: '#c0c0c0',
                color: '#000000',
                borderTop: '2px solid #ffffff',
                borderLeft: '2px solid #ffffff',
                borderRight: '2px solid #000000',
                borderBottom: '2px solid #000000',
                padding: '4px 12px',
                fontSize: '11px',
                cursor: 'pointer',
              }}
            >
              📋 {copied ? 'Copied Dump!' : 'Copy Crash Dump'}
            </button>
          )}

          <button
            type="button"
            onClick={reset}
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
              cursor: 'pointer',
            }}
          >
            🔄 Try Again
          </button>

          <button
            type="button"
            onClick={handleHardRefresh}
            style={{
              backgroundColor: isChunkError ? '#000080' : '#c0c0c0',
              color: isChunkError ? '#ffffff' : '#000000',
              borderTop: '2px solid #ffffff',
              borderLeft: '2px solid #ffffff',
              borderRight: '2px solid #000000',
              borderBottom: '2px solid #000000',
              padding: '4px 16px',
              fontSize: '11px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            {isChunkError ? '🚀 Install Update & Reload' : '🗄️ Reboot Desktop'}
          </button>
        </div>
      </div>
    </div>
  );
}
