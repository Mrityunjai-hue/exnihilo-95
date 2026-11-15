/**
 * src/app/download/page.tsx — ExNihilo 95 Software Distribution Depot
 * Dedicated retro Windows 95 installation center with OS detection and download simulation.
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ExNihiloLogo } from '../../components/Brand/ExNihiloLogo';

interface OSDownloadOption {
  id: string;
  osName: string;
  icon: string;
  fileName: string;
  fileSize: string;
  architecture: string;
  recommended: boolean;
  notes: string;
}

export default function DownloadPage() {
  const [detectedOs, setDetectedOs] = useState<'windows' | 'macos' | 'linux'>('windows');
  const [downloadingPackage, setDownloadingPackage] = useState<OSDownloadOption | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [isDownloadComplete, setIsDownloadComplete] = useState<boolean>(false);
  const [copiedCli, setCopiedCli] = useState<boolean>(false);
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      const ua = navigator.userAgent.toLowerCase();
      if (ua.includes('mac') || ua.includes('darwin')) {
        setDetectedOs('macos');
      } else if (ua.includes('linux') && !ua.includes('android')) {
        setDetectedOs('linux');
      } else {
        setDetectedOs('windows');
      }
    }

    const updateTime = () => {
      const d = new Date();
      setTimeStr(d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const downloadPackages: OSDownloadOption[] = [
    {
      id: 'windows',
      osName: 'Microsoft Windows',
      icon: '🪟',
      fileName: 'ExNihilo95-Setup-v2.5.0-x64.exe',
      fileSize: '38.4 MB',
      architecture: 'x64 (Windows 95, 10, 11)',
      recommended: detectedOs === 'windows',
      notes: 'Includes embedded SQLite 3.45 binary, desktop shortcut, and 16GB RAM support.',
    },
    {
      id: 'macos',
      osName: 'Apple macOS',
      icon: '🍏',
      fileName: 'ExNihilo-v2.5.0-Universal.dmg',
      fileSize: '42.1 MB',
      architecture: 'Universal (Apple Silicon M1/M2/M3/M4 & Intel)',
      recommended: detectedOs === 'macos',
      notes: 'Native macOS drag-and-drop DMG with Metal acceleration and dark glass theme.',
    },
    {
      id: 'linux',
      osName: 'Linux Distribution',
      icon: '🐧',
      fileName: 'ExNihilo-v2.5.0-x86_64.AppImage',
      fileSize: '36.9 MB',
      architecture: 'x86_64 AppImage',
      recommended: detectedOs === 'linux',
      notes: 'Zero dependencies. Runs seamlessly on Ubuntu, Debian, Fedora, RedHat, and Arch.',
    },
  ];

  const handleStartDownload = (pkg: OSDownloadOption) => {
    setDownloadingPackage(pkg);
    setDownloadProgress(0);
    setIsDownloadComplete(false);

    // Realistic retro 28.8k dial-up progress simulation
    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsDownloadComplete(true);

          // Trigger a real download of a helpful sample starter SQL pack
          const starterSql = `-- ExNihilo 95 Local Standalone Starter Kit
-- Automatically generated for ${pkg.osName} (${pkg.architecture})

-- 1. E-Commerce Multi-Table Join
SELECT 
    c.name AS customer_name,
    COUNT(o.id) AS total_orders,
    ROUND(SUM(o.total), 2) AS lifetime_value
FROM customers c
JOIN orders o ON c.id = o.customer_id
GROUP BY c.name
ORDER BY lifetime_value DESC;

-- 2. Financial Ledger Reconciliation
SELECT 
    t.account_number,
    ROUND(SUM(CASE WHEN t.direction = 'CREDIT' THEN t.amount ELSE -t.amount END), 2) AS net_balance
FROM transactions t
GROUP BY t.account_number;
`;
          const blob = new Blob([starterSql], { type: 'text/sql' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `exnihilo_starter_kit.sql`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);

          return 100;
        }
        return prev + 12;
      });
    }, 280);
  };

  const handleCopyCli = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText('npx exnihilo-sql');
      setCopiedCli(true);
      setTimeout(() => setCopiedCli(false), 2000);
    }
  };

  return (
    <div
      className="win95-desktop"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#008080',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      {/* Top Retro Navigation Header */}
      <header
        style={{
          backgroundColor: '#000080',
          color: '#ffffff',
          padding: '6px 14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '11px',
          fontWeight: 'bold',
          borderBottom: '2px solid #ffffff',
          boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ExNihiloLogo size={18} showText={false} />
          <span>Windows 95 Software Distribution Depot — ExNihilo Standalone Station</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link href="/landing" className="win95-button" style={{ fontSize: '11px', padding: '2px 8px', textDecoration: 'none', color: '#000' }}>
            📖 Interactive Showcase
          </Link>
          <Link href="/" className="win95-button" style={{ fontSize: '11px', padding: '2px 12px', fontWeight: 'bold', background: '#ffffdf', textDecoration: 'none', color: '#000' }}>
            🚀 Open Web Studio 95
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          overflowY: 'auto',
        }}
      >
        <div
          className="win95-window"
          style={{
            width: '820px',
            maxWidth: '96vw',
            maxHeight: 'calc(100vh - 80px)',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '6px 6px 20px rgba(0,0,0,0.6)',
          }}
        >
          {/* Titlebar */}
          <div className="win95-titlebar">
            <div className="win95-titlebar-text">
              <span>💾</span>
              <span>ExNihilo 95: Standalone Desktop Edition Distribution Station</span>
            </div>
            <div className="win95-window-controls">
              <Link href="/" className="win95-control-btn" title="Back to Web Studio">
                ✕
              </Link>
            </div>
          </div>

          <div style={{ padding: '14px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Header Banner */}
            <div
              className="win95-inset"
              style={{
                backgroundColor: '#ffffff',
                padding: '12px 14px',
                display: 'flex',
                gap: '14px',
                alignItems: 'center',
              }}
            >
              <div style={{ fontSize: '42px' }}>💽</div>
              <div style={{ flex: 1, fontSize: '11px', lineHeight: '1.45' }}>
                <h2 style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#000080' }}>
                  Install ExNihilo Standalone on Your Workstation
                </h2>
                <div>
                  Eliminate browser sandbox constraints. The desktop binary accesses your local file system, runs with up to 16GB of physical RAM, and processes multi-million row datasets completely offline without telemetry.
                </div>
              </div>
            </div>

            {/* Operating System Installer Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {downloadPackages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="win95-window"
                  style={{
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    gap: '6px',
                    border: pkg.recommended ? '2px solid #000080' : undefined,
                    position: 'relative',
                  }}
                >
                  {pkg.recommended && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '-8px',
                        backgroundColor: '#ffff00',
                        color: '#000000',
                        fontSize: '9px',
                        fontWeight: 'bold',
                        padding: '1px 6px',
                        border: '1px solid #808080',
                      }}
                    >
                      ★ DETECTED OS
                    </div>
                  )}

                  <span style={{ fontSize: '36px', marginTop: '4px' }}>{pkg.icon}</span>
                  <strong style={{ fontSize: '12px' }}>{pkg.osName}</strong>
                  <div style={{ fontSize: '10px', color: '#444' }}>{pkg.architecture}</div>
                  <div style={{ fontSize: '10px', color: '#666' }}>{pkg.fileSize}</div>

                  <div style={{ fontSize: '10px', color: '#555', margin: '4px 0', minHeight: '36px' }}>
                    {pkg.notes}
                  </div>

                  <button
                    type="button"
                    className="win95-button"
                    style={{
                      width: '100%',
                      padding: '5px 8px',
                      fontSize: '11px',
                      fontWeight: pkg.recommended ? 'bold' : 'normal',
                      marginTop: 'auto',
                      backgroundColor: pkg.recommended ? '#ffffdf' : undefined,
                    }}
                    onClick={() => handleStartDownload(pkg)}
                  >
                    💾 Download {pkg.osName.split(' ')[0]}
                  </button>
                </div>
              ))}
            </div>

            {/* Terminal CLI Command */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ fontSize: '11px', fontWeight: 'bold' }}>
                ⚡ Or run instantly via Node.js command line (Zero Installation Required):
              </div>
              <div
                className="win95-inset"
                style={{
                  backgroundColor: '#000000',
                  color: '#00ff00',
                  padding: '8px 12px',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <span style={{ color: '#888' }}>$ </span>
                  <span>npx exnihilo-sql</span>
                </div>
                <button
                  type="button"
                  className="win95-button"
                  style={{ fontSize: '10px', padding: '2px 8px', color: '#000' }}
                  onClick={handleCopyCli}
                >
                  {copiedCli ? '✓ Copied' : '📋 Copy'}
                </button>
              </div>
            </div>

            {/* System Requirements Table */}
            <div className="win95-inset" style={{ backgroundColor: '#ffffff', padding: '8px 12px', fontSize: '11px' }}>
              <strong style={{ color: '#000080' }}>🖥️ Minimum &amp; Recommended System Specifications:</strong>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr', gap: '6px', marginTop: '6px' }}>
                <span style={{ color: '#666' }}>Component:</span>
                <span style={{ color: '#666' }}>Minimum (Standard)</span>
                <span style={{ color: '#666' }}>Recommended (Heavy Queries)</span>

                <strong>Processor:</strong>
                <span>486 DX2-66 MHz or x86_64</span>
                <span>Intel Core i5 / Apple Silicon M1+</span>

                <strong>Memory (RAM):</strong>
                <span>16 MB RAM</span>
                <span>2 GB - 16 GB Physical RAM</span>

                <strong>Hard Disk:</strong>
                <span>50 MB available space</span>
                <span>500 MB for local table caching</span>

                <strong>Display:</strong>
                <span>640x480 256 Colors (VGA)</span>
                <span>1920x1080 or 4K Retina Display</span>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div
            style={{
              padding: '8px 14px',
              backgroundColor: '#c0c0c0',
              borderTop: '2px solid #808080',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '11px',
            }}
          >
            <Link href="/landing" style={{ color: '#000080', textDecoration: 'underline' }}>
              ← Return to Architecture Showcase
            </Link>

            <Link
              href="/"
              className="win95-button"
              style={{
                padding: '4px 18px',
                fontWeight: 'bold',
                background: '#ffffdf',
                textDecoration: 'none',
                color: '#000',
              }}
            >
              🚀 Launch Web Studio 95
            </Link>
          </div>
        </div>
      </main>

      {/* Windows 95 File Download Simulation Dialog */}
      {downloadingPackage && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999999,
          }}
        >
          <div className="win95-window" style={{ width: '420px', maxWidth: '94vw' }}>
            <div className="win95-titlebar">
              <div className="win95-titlebar-text">
                <span>💾</span>
                <span>File Download — {downloadingPackage.fileName}</span>
              </div>
            </div>

            <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '11px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <span style={{ fontSize: '32px' }}>📥</span>
                <div>
                  <div style={{ fontWeight: 'bold' }}>
                    {isDownloadComplete
                      ? 'Download Complete!'
                      : `Saving ${downloadingPackage.fileName}...`}
                  </div>
                  <div style={{ color: '#555', fontSize: '10px' }}>
                    from software.exnihilo.dev (TCP/IP Dial-Up 28,800 bps)
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div
                className="win95-inset"
                style={{
                  height: '18px',
                  backgroundColor: '#ffffff',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${downloadProgress}%`,
                    backgroundColor: '#000080',
                    transition: 'width 0.25s linear',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#444' }}>
                <span>Transfer rate: 28.8 KB/second</span>
                <span>{downloadProgress}% Complete</span>
              </div>

              {isDownloadComplete ? (
                <div
                  className="win95-inset"
                  style={{
                    backgroundColor: '#e6ffed',
                    padding: '6px 10px',
                    fontSize: '11px',
                    color: '#006600',
                    fontWeight: 'bold',
                  }}
                >
                  ✓ Package downloaded. Run installer or double-click to execute!
                </div>
              ) : (
                <div style={{ fontSize: '10px', color: '#666' }}>
                  Estimated time left: {Math.max(1, Math.round((100 - downloadProgress) / 25))} seconds
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '4px' }}>
                <button
                  type="button"
                  className="win95-button"
                  style={{ padding: '3px 14px', fontWeight: isDownloadComplete ? 'bold' : 'normal' }}
                  onClick={() => setDownloadingPackage(null)}
                >
                  {isDownloadComplete ? 'Close' : 'Cancel'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Taskbar */}
      <footer
        className="win95-taskbar"
        style={{
          height: '28px',
          backgroundColor: '#c0c0c0',
          borderTop: '2px solid #ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '2px 4px',
          boxSizing: 'border-box',
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Link
            href="/"
            className="win95-button win95-start-btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 6px',
              textDecoration: 'none',
              color: '#000',
              fontWeight: 'bold',
            }}
          >
            <ExNihiloLogo size={14} showText={false} />
            <span>Start</span>
          </Link>

          <div
            className="win95-task-tab active"
            style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '2px 8px', fontSize: '11px' }}
          >
            <span>💾</span>
            <span>Software Depot</span>
          </div>
        </div>

        <div className="win95-systray" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '2px 6px' }}>
          <span title="Dial-Up Status: 28,800 bps Connected" style={{ fontSize: '11px' }}>
            📟
          </span>
          <span style={{ borderLeft: '1px solid #808080', height: '12px' }} />
          <span style={{ fontSize: '11px' }}>{timeStr || '12:00 PM'}</span>
        </div>
      </footer>
    </div>
  );
}
