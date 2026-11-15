/**
 * LegalWindow.tsx — Windows 95 Legal, Intellectual Property & Anti-Theft Protection Window
 * Styled as an authentic Win95 dialog window with tabs, copy-to-clipboard attribution notice,
 * and clear ownership, anti-plagiarism & DMCA enforcement terms.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useDraggable } from '../../hooks/useDraggable';
import { WindowControls } from './WindowControls';

interface LegalWindowProps {
  isOpen:       boolean;
  isMinimized?: boolean;
  zIndex?:      number;
  onClose:      () => void;
  onMinimize?:  () => void;
  onFocus?:     () => void;
  isModal?:     boolean; // If true, renders as modal popup (for mobile view)
  initialTab?:  TabId;
}

export type TabId = 'terms' | 'privacy' | 'cookies' | 'originality' | 'antitheft' | 'enforcement' | 'attribution';

const ATTRIBUTION_TEXT = `Original Concept, Architecture & Design by Mrityunjai (@Mrityunjai-hue)
Official Repository: https://github.com/Mrityunjai-hue/exnihilo-95
Live App: https://exnihilo-95.vercel.app`;

export const LegalWindow: React.FC<LegalWindowProps> = ({
  isOpen,
  isMinimized = false,
  zIndex = 9999,
  onClose,
  onMinimize,
  onFocus,
  isModal = false,
  initialTab = 'terms',
}) => {
  const { position, handleMouseDown } = useDraggable({ x: 140, y: 60 });
  const [activeTab, setActiveTab] = useState<TabId>(initialTab);
  const [isMaximized, setIsMaximized] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopyNotice = () => {
    navigator.clipboard.writeText(ATTRIBUTION_TEXT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const tabs: { id: TabId; label: string }[] = [
    { id: 'terms',       label: '📜 Terms of Service' },
    { id: 'privacy',     label: '🔒 Privacy Policy' },
    { id: 'cookies',     label: '🍪 Cookie Policy' },
    { id: 'originality', label: '💡 Originality Claim' },
    { id: 'antitheft',   label: '🛡️ Anti-Theft Terms' },
    { id: 'enforcement', label: '⚖️ Legal & DMCA' },
    { id: 'attribution', label: '📌 Required Notice' },
  ];

  const content = (
    <div
      className="win95-window"
      style={
        isModal
          ? {
              width: '94vw',
              maxWidth: '540px',
              maxHeight: '88vh',
              display: isMinimized ? 'none' : 'flex',
              flexDirection: 'column',
              boxShadow: '4px 4px 20px rgba(0,0,0,0.8)',
              boxSizing: 'border-box',
            }
          : isMaximized
          ? { position: 'fixed', top: 0, left: 0, width: '100vw', height: 'calc(100vh - 36px)', zIndex: 1000, display: isMinimized ? 'none' : 'flex', flexDirection: 'column' }
          : { position: 'absolute', top: position.y, left: position.x, width: '660px', height: '520px', zIndex, display: isMinimized ? 'none' : 'flex', flexDirection: 'column' }
      }
      onMouseDown={onFocus}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Titlebar */}
      <div
        className="win95-titlebar"
        onMouseDown={(e) => {
          if (onFocus) onFocus();
          if (!isMaximized && !isModal) handleMouseDown(e);
        }}
        style={{ cursor: isModal ? 'default' : 'move', flexShrink: 0 }}
      >
        <div className="win95-titlebar-text" style={{ fontSize: '11px' }}>
          <span>⚖️</span>
          <span>ExNihilo 95 — Copyright & Intellectual Property Protection</span>
        </div>
        <WindowControls
          onMinimize={!isModal ? onMinimize : undefined}
          onMaximize={!isModal ? () => setIsMaximized((prev) => !prev) : undefined}
          isMaximized={isMaximized}
          onClose={onClose}
        />
      </div>

      {/* Tab Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          background: 'var(--w95-gray, #c0c0c0)',
          borderBottom: '1px solid var(--w95-dark-gray, #808080)',
          padding: '2px 4px 0',
          gap: '2px',
          flexShrink: 0,
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className="win95-button"
            onClick={() => setActiveTab(tab.id)}
            style={{
              fontSize: '10px',
              padding: '3px 8px',
              borderBottom: activeTab === tab.id ? '2px solid var(--w95-accent-color, #000080)' : '2px solid transparent',
              fontWeight: activeTab === tab.id ? 'bold' : 'normal',
              background: activeTab === tab.id ? 'var(--w95-sunken-bg, #ffffff)' : 'var(--w95-gray, #c0c0c0)',
              color: activeTab === tab.id ? 'var(--w95-sunken-text, #000000)' : 'var(--w95-text-color, #000000)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', background: 'var(--w95-sunken-bg, #ffffff)', color: 'var(--w95-sunken-text, #000000)', padding: '12px 14px 48px 14px', boxSizing: 'border-box', fontSize: '11px', lineHeight: '1.6' }}>


        {/* ─── TAB: TERMS OF SERVICE ─── */}
        {activeTab === 'terms' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '14px' }}>
              <div style={{ fontSize: '30px', marginBottom: '4px' }}>📜</div>
              <h2 style={{ margin: '0 0 4px', fontSize: '15px', color: 'var(--w95-accent-color, var(--w95-titlebar-active, #000080))' }}>
                ExNihilo 95 Terms of Service
              </h2>
              <p style={{ margin: 0, color: 'var(--w95-dark-gray, #555)', fontSize: '11px' }}>
                Last Updated: November 2026 • Effective Immediately for All Registered & Guest Users
              </p>
            </div>

            <div className="win95-inset" style={{ padding: '10px 12px', marginBottom: '12px', background: 'var(--w95-callout-blue-bg, #f8f8ff)', color: 'var(--w95-callout-blue-text, #000000)', border: '1px solid var(--w95-dark-gray, #808080)' }}>
              <strong>Summary in Plain English:</strong> ExNihilo 95 is a 100% in-browser, client-side SQL IDE. Queries, inferred schemas, and synthetic tables execute locally in your browser WebAssembly sandbox. We do not transmit your SQL to any cloud server, and we do not sell your data.
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div className="win95-inset" style={{ padding: '10px' }}>
                <strong style={{ color: 'var(--w95-accent-color, #000080)', display: 'block', marginBottom: '4px' }}>
                  1. Acceptance & Permitted Educational / Professional Use
                </strong>
                <p style={{ margin: 0 }}>
                  By launching ExNihilo 95, creating a local account, or executing SQL queries, you agree to these Terms. ExNihilo 95 is provided free of charge for students, interview candidates, instructors, database administrators, and software engineers to prototype, test, and learn SQL without installing or provisioning external database daemon servers.
                </p>
              </div>

              <div className="win95-inset" style={{ padding: '10px' }}>
                <strong style={{ color: 'var(--w95-accent-color, #000080)', display: 'block', marginBottom: '4px' }}>
                  2. In-Browser Client Architecture & Simulated Datasets
                </strong>
                <p style={{ margin: 0 }}>
                  All Abstract Syntax Tree (AST) parsing and schema syntheses occur inside the client browser. Tables generated &quot;out of nothing&quot; (Ex Nihilo) are populated with context-aware synthetic mock data via deterministic algorithms. These records are simulations intended for testing, demonstration, and query practice, and do not represent actual individuals, real financial transactions, or production records.
                </p>
              </div>

              <div className="win95-inset" style={{ padding: '10px' }}>
                <strong style={{ color: 'var(--w95-accent-color, #000080)', display: 'block', marginBottom: '4px' }}>
                  3. Local User Accounts & Cryptographic Keychain Security
                </strong>
                <p style={{ margin: 0 }}>
                  Account creation operates on a decentralized single-device architecture. Passwords are salted and transformed using PBKDF2 with 600,000 iterations inside your browser before storage in local device memory. Because ExNihilo does not operate a central credential server, you are solely responsible for remembering your login password. We cannot recover lost passwords or access your local encrypted schemas.
                </p>
              </div>

              <div className="win95-inset" style={{ padding: '10px' }}>
                <strong style={{ color: 'var(--w95-accent-color, #000080)', display: 'block', marginBottom: '4px' }}>
                  4. Software Releases, Automatic Engine Updates & Bug Fixes
                </strong>
                <p style={{ margin: 0 }}>
                  ExNihilo 95 continuously receives hotfixes, dialect translations, new challenge problem sets, and vintage theme enhancements. Updates deploy seamlessly through the CDN. If an in-flight cached module becomes outdated, our recovery system alerts you to reload the latest libraries with zero disruption to your saved local state.
                </p>
              </div>

              <div className="win95-inset" style={{ padding: '10px' }}>
                <strong style={{ color: 'var(--w95-accent-color, #000080)', display: 'block', marginBottom: '4px' }}>
                  5. Disclaimer of Warranties & Limitation of Liability
                </strong>
                <p style={{ margin: 0 }}>
                  ExNihilo 95 is provided &quot;AS IS&quot; without warranties of any kind, whether express or implied. Under no circumstances shall the author (Mrityunjai) or project contributors be liable for any indirect, incidental, or consequential damages resulting from your use of the simulated query environment.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB: PRIVACY POLICY ─── */}
        {activeTab === 'privacy' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '14px' }}>
              <div style={{ fontSize: '30px', marginBottom: '4px' }}>🔒</div>
              <h2 style={{ margin: '0 0 4px', fontSize: '15px', color: 'var(--w95-accent-color, var(--w95-titlebar-active, #000080))' }}>
                ExNihilo 95 Privacy Policy
              </h2>
              <p style={{ margin: 0, color: 'var(--w95-dark-gray, #555)', fontSize: '11px' }}>
                Your Privacy is Guaranteed by Architecture, Not Just by Promises
              </p>
            </div>

            <div className="win95-inset" style={{ padding: '10px 12px', marginBottom: '12px', background: 'var(--w95-callout-yellow-bg, #ffffe0)', color: 'var(--w95-callout-yellow-text, #000000)', border: '1px solid var(--w95-dark-gray, #808000)' }}>
              <strong>Zero-Knowledge Architecture:</strong> ExNihilo 95 was architected so that your SQL statements, table schemas, query results, and passwords NEVER leave your device. We cannot view your queries even if we wanted to.
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div className="win95-inset" style={{ padding: '10px' }}>
                <strong style={{ color: 'var(--w95-accent-color, #000080)', display: 'block', marginBottom: '4px' }}>
                  1. Information We Do NOT Collect
                </strong>
                <ul style={{ margin: 0, paddingLeft: '18px' }}>
                  <li>We do <strong>NOT</strong> collect, inspect, or log your SQL queries.</li>
                  <li>We do <strong>NOT</strong> transmit your inferred database schemas or mock tables to any remote backend.</li>
                  <li>We do <strong>NOT</strong> sell, broker, or monetize user data with third-party advertising exchanges.</li>
                  <li>We do <strong>NOT</strong> store unencrypted plaintext passwords or share profiles across websites.</li>
                </ul>
              </div>

              <div className="win95-inset" style={{ padding: '10px' }}>
                <strong style={{ color: 'var(--w95-accent-color, #000080)', display: 'block', marginBottom: '4px' }}>
                  2. Information Stored Locally on Your Machine
                </strong>
                <p style={{ margin: '0 0 6px 0' }}>
                  ExNihilo uses standard browser <code>localStorage</code> and IndexedDB solely to provide your persistent retro OS experience:
                </p>
                <ul style={{ margin: 0, paddingLeft: '18px' }}>
                  <li><strong>Local Keychain:</strong> Your username, avatar icon, and PBKDF2 hash (never plaintext).</li>
                  <li><strong>Active Desktop State:</strong> Open window locations, active theme selection, and CRT overlay toggles.</li>
                  <li><strong>Query History & Snippets:</strong> Your recently executed SQL statements and saved forensic notes.</li>
                  <li><strong>Challenge Solved Ledger:</strong> Array of completed SQL challenge IDs for your progress badges.</li>
                </ul>
              </div>

              <div className="win95-inset" style={{ padding: '10px' }}>
                <strong style={{ color: 'var(--w95-accent-color, #000080)', display: 'block', marginBottom: '4px' }}>
                  3. Minimal Anonymous Performance Telemetry
                </strong>
                <p style={{ margin: 0 }}>
                  We utilize Vercel Analytics and Speed Insights to measure high-level page render speeds and WebAssembly initialization latencies across browsers. This telemetry is aggregated, strictly anonymized, and does not record query text, user identities, or sensitive database records.
                </p>
              </div>

              <div className="win95-inset" style={{ padding: '10px' }}>
                <strong style={{ color: 'var(--w95-accent-color, #000080)', display: 'block', marginBottom: '4px' }}>
                  4. Complete User Data Erasure (Right to be Forgotten)
                </strong>
                <p style={{ margin: 0 }}>
                  You retain total control over your device storage. To permanently wipe all local accounts, cached tables, and query history, simply click <strong>Start &gt; Shut Down &gt; Wipe database catalog and restart</strong>, or clear your browser site data at any time.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB: COOKIE POLICY ─── */}
        {activeTab === 'cookies' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '14px' }}>
              <div style={{ fontSize: '30px', marginBottom: '4px' }}>🍪</div>
              <h2 style={{ margin: '0 0 4px', fontSize: '15px', color: 'var(--w95-accent-color, var(--w95-titlebar-active, #000080))' }}>
                ExNihilo 95 Cookie &amp; Storage Policy
              </h2>
              <p style={{ margin: 0, color: 'var(--w95-dark-gray, #555)', fontSize: '11px' }}>
                Transparent Breakdown of Cookies &amp; Local Storage Keys
              </p>
            </div>

            <div className="win95-inset" style={{ padding: '10px 12px', marginBottom: '12px', background: 'var(--w95-callout-blue-bg, #f8f8ff)', color: 'var(--w95-callout-blue-text, #000000)', border: '1px solid var(--w95-dark-gray, #808080)' }}>
              <strong>What Are Local Cookies in ExNihilo?</strong> Unlike traditional ad-heavy sites, ExNihilo does not use third-party tracking pixels or behavioral cookies. We use browser local storage to simulate a genuine operating system environment that remembers your setup when you return.
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10.5px', marginBottom: '14px' }}>
              <thead>
                <tr style={{ background: 'var(--w95-gray, #c0c0c0)', color: 'var(--w95-text-color, #000000)', borderBottom: '1px solid var(--w95-dark-gray, #808080)' }}>
                  <th style={{ padding: '4px 6px', textAlign: 'left', border: '1px solid var(--w95-dark-gray, #808080)' }}>Storage Key</th>
                  <th style={{ padding: '4px 6px', textAlign: 'left', border: '1px solid var(--w95-dark-gray, #808080)' }}>Category</th>
                  <th style={{ padding: '4px 6px', textAlign: 'left', border: '1px solid var(--w95-dark-gray, #808080)' }}>Purpose</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ background: 'var(--w95-grid-even-bg, #ffffff)' }}>
                  <td style={{ padding: '4px 6px', border: '1px solid var(--w95-dark-gray, #808080)', fontFamily: 'var(--w95-mono)' }}>exnihilo_auth_users</td>
                  <td style={{ padding: '4px 6px', border: '1px solid var(--w95-dark-gray, #808080)', fontWeight: 'bold' }}>Strictly Essential</td>
                  <td style={{ padding: '4px 6px', border: '1px solid var(--w95-dark-gray, #808080)' }}>Stores salted PBKDF2 credentials for your local account profile.</td>
                </tr>
                <tr style={{ background: 'var(--w95-grid-odd-bg, #f8f8f8)' }}>
                  <td style={{ padding: '4px 6px', border: '1px solid var(--w95-dark-gray, #808080)', fontFamily: 'var(--w95-mono)' }}>exnihilo_cookie_consent</td>
                  <td style={{ padding: '4px 6px', border: '1px solid var(--w95-dark-gray, #808080)', fontWeight: 'bold' }}>Strictly Essential</td>
                  <td style={{ padding: '4px 6px', border: '1px solid var(--w95-dark-gray, #808080)' }}>Remembers your selected storage permission choices.</td>
                </tr>
                <tr style={{ background: 'var(--w95-grid-even-bg, #ffffff)' }}>
                  <td style={{ padding: '4px 6px', border: '1px solid var(--w95-dark-gray, #808080)', fontFamily: 'var(--w95-mono)' }}>exnihilo_active_theme</td>
                  <td style={{ padding: '4px 6px', border: '1px solid var(--w95-dark-gray, #808080)' }}>Preferences</td>
                  <td style={{ padding: '4px 6px', border: '1px solid var(--w95-dark-gray, #808080)' }}>Preserves your chosen skin (Classic 95, Win98, 2000, XP, Aero, Noir, Mac).</td>
                </tr>
                <tr style={{ background: 'var(--w95-grid-odd-bg, #f8f8f8)' }}>
                  <td style={{ padding: '4px 6px', border: '1px solid var(--w95-dark-gray, #808080)', fontFamily: 'var(--w95-mono)' }}>exnihilo_open_windows</td>
                  <td style={{ padding: '4px 6px', border: '1px solid var(--w95-dark-gray, #808080)' }}>Preferences</td>
                  <td style={{ padding: '4px 6px', border: '1px solid var(--w95-dark-gray, #808080)' }}>Restores your active desktop workstation layout across reloads.</td>
                </tr>
                <tr style={{ background: 'var(--w95-grid-even-bg, #ffffff)' }}>
                  <td style={{ padding: '4px 6px', border: '1px solid var(--w95-dark-gray, #808080)', fontFamily: 'var(--w95-mono)' }}>_vercel_speed_insights</td>
                  <td style={{ padding: '4px 6px', border: '1px solid var(--w95-dark-gray, #808080)' }}>Performance</td>
                  <td style={{ padding: '4px 6px', border: '1px solid var(--w95-dark-gray, #808080)' }}>Measures Web Vitals (FCP, LCP) to ensure snappy WASM query runs.</td>
                </tr>
              </tbody>
            </table>

            <div className="win95-inset" style={{ padding: '10px' }}>
              <strong style={{ color: 'var(--w95-accent-color, #000080)', display: 'block', marginBottom: '4px' }}>
                Managing Your Preferences
              </strong>
              <p style={{ margin: 0 }}>
                You can review or adjust your storage permissions at any time via the <strong>Cookie &amp; Storage Manager</strong> dialog in the Start Menu or ExNihilo Settings.
              </p>
            </div>
          </div>
        )}

        {/* ─── TAB 1: ORIGINALITY CLAIM ─── */}
        {activeTab === 'originality' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div style={{ fontSize: '32px', marginBottom: '4px' }}>📜</div>
              <h2 style={{ margin: '0 0 4px', fontSize: '15px', color: 'var(--w95-accent-color, var(--w95-titlebar-active, #000080))' }}>
                Declaration of Ownership & Original Concept
              </h2>
              <p style={{ margin: 0, color: 'var(--w95-dark-gray, #555)', fontSize: '11px' }}>
                ExNihilo 95 — In-Browser Zero-Config SQL Development Environment
              </p>
            </div>

            <div className="win95-inset" style={{ padding: '12px', marginBottom: '12px', background: 'var(--w95-callout-yellow-bg, #ffffe0)', color: 'var(--w95-callout-yellow-text, #000000)', border: '1px solid var(--w95-dark-gray, #808000)' }}>
              <p style={{ margin: '0 0 6px', fontWeight: 'bold', color: 'var(--w95-danger-color, #800000)', fontSize: '12px' }}>
                💡 Formal Ownership Claim
              </p>
              <p style={{ margin: 0, fontStyle: 'italic' }}>
                &quot;I, Mrityunjai (@Mrityunjai-hue), claim that this is the original idea of mine, but I have made it with AI.&quot;
              </p>
            </div>

            <div className="win95-inset" style={{ padding: '12px', marginBottom: '12px', background: 'var(--w95-callout-blue-bg, #f8f8ff)', color: 'var(--w95-callout-blue-text, #000000)' }}>
              <p style={{ margin: '0 0 6px', fontWeight: 'bold', color: 'var(--w95-accent-color, #000080)' }}>
                🧠 Intellectual Property Scope
              </p>
              <p style={{ margin: '0 0 8px' }}>
                This repository and software product include the following original proprietary concepts and implementations:
              </p>
              <ul style={{ margin: 0, paddingLeft: '18px' }}>
                <li><strong>Zero-Config AST Schema Inference Architecture:</strong> Precedence-driven type deduction (`CAST`, typed literals, functions, `GROUP BY`, naming heuristics).</li>
                <li><strong>Dynamic Synthetic Materialization:</strong> Referential integrity foreign-key DAG topological ordering algorithm.</li>
                <li><strong>Windows 95 Interactive UI Design:</strong> Tailored retro desktop, multi-tab workspace, cascading Win95 menus, and ListView results grid.</li>
              </ul>
            </div>
          </div>
        )}

        {/* ─── TAB 2: ANTI-THEFT TERMS ─── */}
        {activeTab === 'antitheft' && (
          <div>
            <h3 style={{ margin: '0 0 10px', fontSize: '13px', color: 'var(--w95-accent-color, var(--w95-titlebar-active, #000080))' }}>
              🛡️ Terms of Use & Strict Anti-Plagiarism Policy
            </h3>

            <div className="win95-inset" style={{ padding: '10px', marginBottom: '10px', background: 'rgba(0, 100, 0, 0.08)', border: '1px solid #228B22' }}>
              <p style={{ margin: '0 0 4px', fontWeight: 'bold', color: 'var(--w95-success-color, #006400)' }}>
                ✅ Allowed Open-Source Actions:
              </p>
              <ul style={{ margin: 0, paddingLeft: '18px' }}>
                <li>Viewing, inspecting, learning from, and experimenting with the source code.</li>
                <li>Forking for personal study or submitting Pull Requests to the official repository.</li>
                <li>Integrating parts into non-competing projects with <strong>full visible credit to Mrityunjai</strong>.</li>
              </ul>
            </div>

            <div className="win95-inset" style={{ padding: '10px', marginBottom: '10px', background: 'rgba(176, 0, 32, 0.08)', border: '1px solid #b00020' }}>
              <p style={{ margin: '0 0 4px', fontWeight: 'bold', color: 'var(--w95-danger-color, #b00020)' }}>
                🚫 Strictly Prohibited Actions (Theft & Plagiarism):
              </p>
              <ul style={{ margin: 0, paddingLeft: '18px' }}>
                <li><strong>False Ownership Claims:</strong> Claiming the concept, architecture, or codebase as your own work.</li>
                <li><strong>Stripping Attribution:</strong> Removing, hiding, or altering copyright notices, badges, or credits to Mrityunjai.</li>
                <li><strong>Deceptive Re-Branding:</strong> Re-hosting or publishing under a different name to obscure original authorship.</li>
              </ul>
            </div>
          </div>
        )}

        {/* ─── TAB 3: LEGAL ENFORCEMENT & DMCA ─── */}
        {activeTab === 'enforcement' && (
          <div>
            <h3 style={{ margin: '0 0 10px', fontSize: '13px', color: 'var(--w95-accent-color, var(--w95-titlebar-active, #000080))' }}>
              ⚖️ Legal Enforcement & DMCA Takedowns
            </h3>

            <div className="win95-inset" style={{ padding: '12px', marginBottom: '10px', background: 'var(--w95-callout-yellow-bg, #ffffe0)', color: 'var(--w95-callout-yellow-text, #000000)', border: '1px solid var(--w95-dark-gray, #808000)' }}>
              <p style={{ margin: '0 0 6px', fontWeight: 'bold', color: 'var(--w95-danger-color, #800000)' }}>
                🚨 Notice of DMCA & Legal Recourse
              </p>
              <p style={{ margin: 0 }}>
                Unattributed copying, credit stripping, or deceptive re-publishing constitutes direct copyright infringement.
                Offenders will face immediate enforcement action:
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div className="win95-inset" style={{ padding: '10px', background: 'var(--w95-callout-blue-bg, #f8f8ff)', color: 'var(--w95-callout-blue-text, #000000)' }}>
                <strong>1. Formal DMCA Takedown Notices:</strong> Filed immediately with GitHub, Vercel, Netlify, Cloudflare, AWS, and domain registrars to remove infringing sites/forks.
              </div>
              <div className="win95-inset" style={{ padding: '10px', background: 'var(--w95-callout-blue-bg, #f8f8ff)', color: 'var(--w95-callout-blue-text, #000000)' }}>
                <strong>2. GitHub Trust & Safety Escalation:</strong> Infringing repositories and user accounts will be reported for Terms of Service violations and intellectual property theft.
              </div>
              <div className="win95-inset" style={{ padding: '10px', background: 'var(--w95-callout-blue-bg, #f8f8ff)', color: 'var(--w95-callout-blue-text, #000000)' }}>
                <strong>3. Public Plagiarism Disclosures:</strong> Legal cease & desist notices and public disclosures of infringement will be published.
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 4: REQUIRED ATTRIBUTION NOTICE ─── */}
        {activeTab === 'attribution' && (
          <div>
            <h3 style={{ margin: '0 0 8px', fontSize: '13px', color: 'var(--w95-accent-color, var(--w95-titlebar-active, #000080))' }}>
              📌 Mandatory Legal Attribution Notice
            </h3>
            <p style={{ margin: '0 0 10px', color: 'var(--w95-sunken-text, #333333)' }}>
              Any authorized deployment, fork, or derivative work <strong>MUST</strong> include the following notice:
            </p>

            <div
              style={{
                background: '#000000',
                color: '#00ff00',
                padding: '10px',
                fontFamily: 'monospace',
                fontSize: '11px',
                borderRadius: '2px',
                marginBottom: '12px',
                whiteSpace: 'pre-wrap',
                border: '1px solid var(--w95-dark-gray, #808080)',
              }}
            >
              {ATTRIBUTION_TEXT}
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                className="win95-button win95-button-default"
                onClick={handleCopyNotice}
                style={{ padding: '4px 14px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                {copied ? '✅ Notice Copied!' : '📋 Copy Legal Attribution Notice'}
              </button>

              <a
                href="https://github.com/Mrityunjai-hue/exnihilo-95/blob/main/COPYRIGHT_AND_INTELLECTUAL_PROPERTY.md"
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none' }}
              >
                <button className="win95-button" style={{ padding: '4px 12px', fontSize: '11px', cursor: 'pointer' }}>
                  🌐 View Full Document on GitHub
                </button>
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Footer Controls */}
      <div style={{ padding: '8px 14px', background: 'var(--w95-gray, #c0c0c0)', borderTop: '1px solid var(--w95-dark-gray, #808080)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <div style={{ fontSize: '10px', color: 'var(--w95-dark-gray, #444)' }}>
          Owner: <strong>Mrityunjai (@Mrityunjai-hue)</strong>
        </div>
        <button
          className="win95-button win95-button-default"
          onClick={onClose}
          style={{ padding: '3px 18px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          OK
        </button>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 999999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '12px',
          boxSizing: 'border-box',
        }}
        onClick={onClose}
      >
        {content}
      </div>
    );
  }

  return content;
};
