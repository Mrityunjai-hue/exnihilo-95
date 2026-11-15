/**
 * NetworkStatusDialog.tsx — Windows 95 Dial-Up Networking & Offline Status Dialog
 * Displays authentic retro dial-up status, carrier detection, and autonomous offline mode assurance.
 */

'use client';

import React, { useState } from 'react';
import { useDraggable } from '../../hooks/useDraggable';
import { WindowControls } from './WindowControls';

interface NetworkStatusDialogProps {
  isOpen: boolean;
  onClose: () => void;
  isOnline: boolean;
  onRedial?: () => void;
  zIndex?: number;
}

export const NetworkStatusDialog: React.FC<NetworkStatusDialogProps> = ({
  isOpen,
  onClose,
  isOnline,
  onRedial,
  zIndex = 99999,
}) => {
  const { position, handleMouseDown } = useDraggable({ x: 220, y: 140 });
  const [showDetails, setShowDetails] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [pingStatus, setPingStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setIsChecking(true);
    setPingStatus('Dialing remote carrier (28,800 bps)...');

    // Emulate realistic dial-up handshake latency
    await new Promise((res) => setTimeout(res, 900));

    if (typeof navigator !== 'undefined' && navigator.onLine) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 2500);
        await fetch('/favicon.ico', { method: 'HEAD', signal: controller.signal, cache: 'no-store' });
        clearTimeout(timeout);
        setPingStatus('Carrier detected! Line stable at 28,800 bps.');
      } catch {
        setPingStatus('Carrier handshake timed out. Operating locally.');
      }
    } else {
      setPingStatus('No dial tone / line signal. Continuing in Local Autonomous Mode.');
    }

    if (onRedial) onRedial();
    setIsChecking(false);
  };

  return (
    <div
      className="win95-window"
      style={{
        position: 'fixed',
        top: `${position.y}px`,
        left: `${position.x}px`,
        width: '420px',
        maxWidth: '94vw',
        zIndex,
        boxShadow: '4px 4px 18px rgba(0,0,0,0.6)',
      }}
      role="dialog"
      aria-label="Dial-Up Networking Status"
    >
      {/* Titlebar */}
      <div
        className="win95-titlebar"
        onMouseDown={handleMouseDown}
        style={{ cursor: 'move' }}
      >
        <div className="win95-titlebar-text">
          <span>📟</span>
          <span>Dial-Up Networking — {isOnline ? 'Connected' : 'Autonomous Mode'}</span>
        </div>
        <WindowControls
          showMinimize={false}
          showMaximize={false}
          onClose={onClose}
        />
      </div>

      <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Header with Retro Modem Icon and Status */}
        <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
          <div
            className="win95-inset"
            style={{
              padding: '8px',
              backgroundColor: '#c0c0c0',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '56px',
              minHeight: '56px',
            }}
          >
            <span style={{ fontSize: '32px', filter: 'drop-shadow(1px 1px 0 #fff)' }}>
              {isOnline ? '📟' : '📴'}
            </span>
            <span
              style={{
                fontSize: '9px',
                fontWeight: 'bold',
                marginTop: '4px',
                color: isOnline ? '#008000' : '#800000',
              }}
            >
              {isOnline ? 'ONLINE' : 'OFFLINE'}
            </span>
          </div>

          <div style={{ flex: 1, fontSize: '11px', lineHeight: '1.45' }}>
            <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '4px' }}>
              {isOnline
                ? 'Dial-Up Connection: Active (28,800 bps)'
                : 'Connection Lost — Local Autonomous Mode Active'}
            </div>
            <div>
              {isOnline
                ? 'ExNihilo 95 is synchronized with the network. Remote query sharing and cloud updates are available.'
                : 'Your device is disconnected from the internet. However, ExNihilo 95 executes 100% in-browser via SQLite WebAssembly. All query parsing, synthetic data inference, and relational tables continue working with zero disruption.'}
            </div>
          </div>
        </div>

        {/* Diagnostic Properties Box */}
        <div
          className="win95-inset"
          style={{
            backgroundColor: '#ffffff',
            padding: '8px 10px',
            fontSize: '11px',
            fontFamily: 'var(--w95-mono, monospace)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
            <span style={{ color: '#555' }}>Adapter:</span>
            <strong>Standard Modem 28800 bps (V.34)</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
            <span style={{ color: '#555' }}>Carrier Detect:</span>
            <strong style={{ color: isOnline ? '#008000' : '#800000' }}>
              {isOnline ? 'ONLINE (Carrier Signal OK)' : 'DISCONNECTED (No Carrier)'}
            </strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
            <span style={{ color: '#555' }}>SQL Engine:</span>
            <strong>SQLite 3.45 WASM (Local Memory)</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
            <span style={{ color: '#555' }}>Execution Mode:</span>
            <strong>{isOnline ? 'Standard Hybrid' : '100% Local Autonomous'}</strong>
          </div>
        </div>

        {/* Dynamic Ping Output */}
        {pingStatus && (
          <div
            className="win95-inset"
            style={{
              backgroundColor: '#000080',
              color: '#ffffff',
              padding: '6px 10px',
              fontSize: '10px',
              fontFamily: 'monospace',
            }}
          >
            &gt; {pingStatus}
          </div>
        )}

        {/* Expandable Technical Details */}
        {showDetails && (
          <div
            className="win95-inset"
            style={{
              backgroundColor: '#ffffdf',
              padding: '8px 10px',
              fontSize: '10px',
              lineHeight: '1.4',
              color: '#333333',
              maxHeight: '110px',
              overflowY: 'auto',
            }}
          >
            <strong>Technical Note:</strong>
            <p style={{ margin: '4px 0 0 0' }}>
              ExNihilo 95 uses an in-browser WebAssembly virtual machine that compiles and runs SQLite inside your browser tab without any backend server. Schemas and sample data are computed procedurally on-the-fly from your SQL syntax tree. No internet access is required to execute queries, view results, generate ERDs, or solve LeetCode challenges.
            </p>
          </div>
        )}

        {/* Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '4px' }}>
          <button
            type="button"
            className="win95-button"
            style={{ fontSize: '11px', padding: '3px 10px' }}
            onClick={() => setShowDetails((prev) => !prev)}
          >
            {showDetails ? '<< Less' : 'Details >>'}
          </button>

          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              className="win95-button"
              style={{ fontSize: '11px', padding: '3px 12px' }}
              onClick={handleTestConnection}
              disabled={isChecking}
            >
              {isChecking ? 'Dialing...' : '🔄 Redial / Ping'}
            </button>
            <button
              type="button"
              className="win95-button"
              style={{ fontSize: '11px', padding: '3px 16px', fontWeight: 'bold' }}
              onClick={onClose}
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
