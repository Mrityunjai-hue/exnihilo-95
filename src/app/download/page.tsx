/**
 * src/app/download/page.tsx — ExNihilo 95 Offline PWA & Starter Depot
 * Genuine Progressive Web App installation portal and starter dataset repository.
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ExNihiloLogo } from '../../components/Brand/ExNihiloLogo';
import { PWAInstallButton } from '../../components/Win95/PWAInstallButton';

export default function DownloadPage() {
  const [detectedOs, setDetectedOs] = useState<'windows' | 'macos' | 'linux'>('windows');
  const [copiedCli, setCopiedCli] = useState<boolean>(false);
  const [timeStr, setTimeStr] = useState<string>('');
  const [downloadSuccessMsg, setDownloadSuccessMsg] = useState<string | null>(null);

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

  const handleCopyCli = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText('git clone https://github.com/exnihilo-95/exnihilo-95.git && cd exnihilo-95 && npm install && npm run dev');
      setCopiedCli(true);
      setTimeout(() => setCopiedCli(false), 2000);
    }
  };

  const handleDownloadStarterSql = () => {
    const starterSql = `-- ExNihilo 95 Local Standalone Starter Kit
-- Synthesized Relational Analytics (Zero Config Needed)

-- 1. Customer & Order Revenue Analytics
SELECT 
    c.name AS customer_name,
    COUNT(o.id) AS total_orders,
    ROUND(SUM(o.total), 2) AS lifetime_value
FROM customers c
INNER JOIN orders o ON c.id = o.customer_id
GROUP BY c.name
ORDER BY lifetime_value DESC;

-- 2. Employee Hierarchy & Salary Analytics
SELECT 
    e.name,
    e.department,
    e.salary,
    RANK() OVER (PARTITION BY e.department ORDER BY e.salary DESC) AS salary_rank,
    ROUND(AVG(e.salary) OVER (PARTITION BY e.department), 2) AS dept_avg_salary
FROM employees e;
`;
    const blob = new Blob([starterSql], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'exnihilo_starter_pack.sql';
    a.click();
    URL.revokeObjectURL(url);
    setDownloadSuccessMsg('Downloaded "exnihilo_starter_pack.sql"');
    setTimeout(() => setDownloadSuccessMsg(null), 3000);
  };

  const handleDownloadSampleCsv = () => {
    const csvContent = `id,sku,product_name,category,stock_qty,unit_price
1,SKU-9501,486-DX2 66MHz Processor,Hardware,140,199.99
2,SKU-9502,16MB EDO RAM Module,Memory,320,89.50
3,SKU-9503,1.44MB 3.5" Floppy Drive,Storage,500,24.00
4,SKU-9504,SoundBlaster 16 ISA Card,Audio,75,129.95
5,SKU-9505,14" CRT SVGA Color Monitor,Display,60,249.00
6,SKU-9506,US Robotics 28.8k Modem,Networking,210,149.95`;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'retro_hardware_inventory.csv';
    a.click();
    URL.revokeObjectURL(url);
    setDownloadSuccessMsg('Downloaded "retro_hardware_inventory.csv"');
    setTimeout(() => setDownloadSuccessMsg(null), 3000);
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
              <span>ExNihilo 95: Offline Desktop PWA &amp; Starter Depot</span>
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
                  Install ExNihilo 95 Offline PWA on Your Device
                </h2>
                <div>
                  ExNihilo 95 runs 100% in-browser using compiled SQLite WebAssembly. No database servers, background daemons, or telemetry required. You can install it directly onto your desktop or mobile device as a Progressive Web App (PWA) with full offline caching, or download starter kits.
                </div>
              </div>
            </div>

            {/* Platform PWA Installation Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {/* Windows PWA */}
              <div
                className="win95-window"
                style={{
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  gap: '6px',
                  border: detectedOs === 'windows' ? '2px solid #000080' : undefined,
                  position: 'relative',
                }}
              >
                {detectedOs === 'windows' && (
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
                <span style={{ fontSize: '36px', marginTop: '4px' }}>🪟</span>
                <strong style={{ fontSize: '12px' }}>Microsoft Windows</strong>
                <div style={{ fontSize: '10px', color: '#444' }}>Desktop App (PWA)</div>
                <div style={{ fontSize: '10px', color: '#555', margin: '4px 0', minHeight: '36px' }}>
                  Standalone window, Start Menu integration, taskbar pinning, and 100% offline querying.
                </div>
                <div style={{ marginTop: 'auto', width: '100%' }}>
                  <PWAInstallButton label="Install on Windows" style={{ width: '100%', justifyContent: 'center' }} />
                </div>
              </div>

              {/* macOS PWA */}
              <div
                className="win95-window"
                style={{
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  gap: '6px',
                  border: detectedOs === 'macos' ? '2px solid #000080' : undefined,
                  position: 'relative',
                }}
              >
                {detectedOs === 'macos' && (
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
                <span style={{ fontSize: '36px', marginTop: '4px' }}>🍏</span>
                <strong style={{ fontSize: '12px' }}>Apple macOS</strong>
                <div style={{ fontSize: '10px', color: '#444' }}>Native Web App (PWA)</div>
                <div style={{ fontSize: '10px', color: '#555', margin: '4px 0', minHeight: '36px' }}>
                  Runs via Chrome/Edge or Safari "Add to Dock", with dedicated icon and offline cache.
                </div>
                <div style={{ marginTop: 'auto', width: '100%' }}>
                  <PWAInstallButton label="Install on macOS" style={{ width: '100%', justifyContent: 'center' }} />
                </div>
              </div>

              {/* Linux PWA */}
              <div
                className="win95-window"
                style={{
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  gap: '6px',
                  border: detectedOs === 'linux' ? '2px solid #000080' : undefined,
                  position: 'relative',
                }}
              >
                {detectedOs === 'linux' && (
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
                <span style={{ fontSize: '36px', marginTop: '4px' }}>🐧</span>
                <strong style={{ fontSize: '12px' }}>Linux &amp; ChromeOS</strong>
                <div style={{ fontSize: '10px', color: '#444' }}>Desktop PWA</div>
                <div style={{ fontSize: '10px', color: '#555', margin: '4px 0', minHeight: '36px' }}>
                  Direct desktop launcher icon for Ubuntu, Fedora, Debian, Arch, and Chromebooks.
                </div>
                <div style={{ marginTop: 'auto', width: '100%' }}>
                  <PWAInstallButton label="Install on Linux" style={{ width: '100%', justifyContent: 'center' }} />
                </div>
              </div>
            </div>

            {/* Starter Data Packs Download Section */}
            <fieldset style={{ border: '1px solid #808080', padding: '10px', backgroundColor: '#ffffff' }}>
              <legend style={{ padding: '0 4px', fontSize: '11px', fontWeight: 'bold', color: '#000080' }}>
                📦 Offline Starter Data Packs (Direct Downloads)
              </legend>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 'bold' }}>
                    1. SQL Starter Schemas &amp; Queries (.sql)
                  </div>
                  <div style={{ fontSize: '10px', color: '#555' }}>
                    Includes pre-configured multi-table JOINs, CTEs, and financial ledgers.
                  </div>
                  <button
                    type="button"
                    className="win95-button"
                    style={{ fontSize: '11px', padding: '3px 8px', alignSelf: 'flex-start', marginTop: '4px' }}
                    onClick={handleDownloadStarterSql}
                  >
                    📥 Download starter_pack.sql
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 'bold' }}>
                    2. Sample Tabular Hardware Inventory (.csv)
                  </div>
                  <div style={{ fontSize: '10px', color: '#555' }}>
                    RFC-4180 CSV dataset ready for drag-and-drop into ExNihilo Studio.
                  </div>
                  <button
                    type="button"
                    className="win95-button"
                    style={{ fontSize: '11px', padding: '3px 8px', alignSelf: 'flex-start', marginTop: '4px' }}
                    onClick={handleDownloadSampleCsv}
                  >
                    📥 Download sample_inventory.csv
                  </button>
                </div>
              </div>
              {downloadSuccessMsg && (
                <div style={{ marginTop: '8px', color: '#15803d', fontWeight: 'bold', fontSize: '11px' }}>
                  ✓ {downloadSuccessMsg}
                </div>
              )}
            </fieldset>

            {/* Terminal CLI Command */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ fontSize: '11px', fontWeight: 'bold' }}>
                ⚡ Or run standalone offline locally with Node.js & Next.js:
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
                  <span>git clone https://github.com/exnihilo-95/exnihilo-95.git</span>
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
          <span title="PWA Offline Engine Ready" style={{ fontSize: '11px' }}>
            ⚡
          </span>
          <span style={{ borderLeft: '1px solid #808080', height: '12px' }} />
          <span style={{ fontSize: '11px' }}>{timeStr || '12:00 PM'}</span>
        </div>
      </footer>
    </div>
  );
}
