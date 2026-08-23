/**
 * LegalWindow.tsx — Windows 95 Legal, Intellectual Property & Anti-Theft Protection Window
 * Styled as an authentic Win95 dialog window with tabs, copy-to-clipboard attribution notice,
 * and clear ownership, anti-plagiarism & DMCA enforcement terms.
 */

'use client';

import React, { useState } from 'react';
import { useDraggable } from '../../hooks/useDraggable';

interface LegalWindowProps {
  isOpen:       boolean;
  isMinimized?: boolean;
  zIndex?:      number;
  onClose:      () => void;
  onMinimize?:  () => void;
  onFocus?:     () => void;
  isModal?:     boolean; // If true, renders as modal popup (for mobile view)
}

type TabId = 'originality' | 'antitheft' | 'enforcement' | 'attribution';

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
}) => {
  const { position, handleMouseDown } = useDraggable({ x: 140, y: 60 });
  const [activeTab, setActiveTab] = useState<TabId>('originality');
  const [isMaximized, setIsMaximized] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen || isMinimized) return null;

  const handleCopyNotice = () => {
    navigator.clipboard.writeText(ATTRIBUTION_TEXT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const tabs: { id: TabId; label: string }[] = [
    { id: 'originality', label: '📜 Originality Claim' },
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
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '4px 4px 20px rgba(0,0,0,0.8)',
              boxSizing: 'border-box',
            }
          : isMaximized
          ? { position: 'fixed', top: 0, left: 0, width: '100vw', height: 'calc(100vh - 36px)', zIndex, display: 'flex', flexDirection: 'column' }
          : { position: 'absolute', top: position.y, left: position.x, width: '660px', height: '520px', zIndex, display: 'flex', flexDirection: 'column' }
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
        <div className="win95-titlebar-controls" style={{ flexShrink: 0 }}>
          {onMinimize && !isModal && (
            <button
              className="win95-btn-titlebar"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); onMinimize(); }}
              title="Minimize"
            >
              _
            </button>
          )}
          {!isModal && (
            <button
              className="win95-btn-titlebar"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); setIsMaximized(!isMaximized); }}
              title="Maximize"
            >
              {isMaximized ? '❐' : '□'}
            </button>
          )}
          <button
            className="win95-btn-titlebar"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            title="Close"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Tab Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          background: '#c0c0c0',
          borderBottom: '1px solid #808080',
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
              borderBottom: activeTab === tab.id ? '2px solid #000080' : '2px solid transparent',
              fontWeight: activeTab === tab.id ? 'bold' : 'normal',
              background: activeTab === tab.id ? '#ffffff' : '#c0c0c0',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', background: '#ffffff', padding: '12px', fontSize: '11px', lineHeight: '1.6' }}>

        {/* ─── TAB 1: ORIGINALITY CLAIM ─── */}
        {activeTab === 'originality' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div style={{ fontSize: '32px', marginBottom: '4px' }}>📜</div>
              <h2 style={{ margin: '0 0 4px', fontSize: '15px', color: '#000080' }}>
                Declaration of Ownership & Original Concept
              </h2>
              <p style={{ margin: 0, color: '#555', fontSize: '11px' }}>
                ExNihilo 95 — In-Browser Zero-Config SQL Development Environment
              </p>
            </div>

            <div className="win95-inset" style={{ padding: '12px', marginBottom: '12px', background: '#ffffe0', border: '1px solid #808000' }}>
              <p style={{ margin: '0 0 6px', fontWeight: 'bold', color: '#800000', fontSize: '12px' }}>
                💡 Formal Ownership Claim
              </p>
              <p style={{ margin: 0, fontStyle: 'italic' }}>
                &quot;I, Mrityunjai (@Mrityunjai-hue), claim that this is the original idea of mine, but I have made it with AI.&quot;
              </p>
            </div>

            <div className="win95-inset" style={{ padding: '12px', marginBottom: '12px', background: '#f8f8ff' }}>
              <p style={{ margin: '0 0 6px', fontWeight: 'bold', color: '#000080' }}>
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
            <h3 style={{ margin: '0 0 10px', fontSize: '13px', color: '#000080' }}>
              🛡️ Terms of Use & Strict Anti-Plagiarism Policy
            </h3>

            <div className="win95-inset" style={{ padding: '10px', marginBottom: '10px', background: '#f0fff0', border: '1px solid #228B22' }}>
              <p style={{ margin: '0 0 4px', fontWeight: 'bold', color: '#006400' }}>
                ✅ Allowed Open-Source Actions:
              </p>
              <ul style={{ margin: 0, paddingLeft: '18px' }}>
                <li>Viewing, inspecting, learning from, and experimenting with the source code.</li>
                <li>Forking for personal study or submitting Pull Requests to the official repository.</li>
                <li>Integrating parts into non-competing projects with <strong>full visible credit to Mrityunjai</strong>.</li>
              </ul>
            </div>

            <div className="win95-inset" style={{ padding: '10px', marginBottom: '10px', background: '#fff0f0', border: '1px solid #b00020' }}>
              <p style={{ margin: '0 0 4px', fontWeight: 'bold', color: '#b00020' }}>
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
            <h3 style={{ margin: '0 0 10px', fontSize: '13px', color: '#000080' }}>
              ⚖️ Legal Enforcement & DMCA Takedowns
            </h3>

            <div className="win95-inset" style={{ padding: '12px', marginBottom: '10px', background: '#ffffe0', border: '1px solid #808000' }}>
              <p style={{ margin: '0 0 6px', fontWeight: 'bold', color: '#800000' }}>
                🚨 Notice of DMCA & Legal Recourse
              </p>
              <p style={{ margin: 0 }}>
                Unattributed copying, credit stripping, or deceptive re-publishing constitutes direct copyright infringement.
                Offenders will face immediate enforcement action:
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div className="win95-inset" style={{ padding: '10px', background: '#f8f8ff' }}>
                <strong>1. Formal DMCA Takedown Notices:</strong> Filed immediately with GitHub, Vercel, Netlify, Cloudflare, AWS, and domain registrars to remove infringing sites/forks.
              </div>
              <div className="win95-inset" style={{ padding: '10px', background: '#f8f8ff' }}>
                <strong>2. GitHub Trust & Safety Escalation:</strong> Infringing repositories and user accounts will be reported for Terms of Service violations and intellectual property theft.
              </div>
              <div className="win95-inset" style={{ padding: '10px', background: '#f8f8ff' }}>
                <strong>3. Public Plagiarism Disclosures:</strong> Legal cease & desist notices and public disclosures of infringement will be published.
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 4: REQUIRED ATTRIBUTION NOTICE ─── */}
        {activeTab === 'attribution' && (
          <div>
            <h3 style={{ margin: '0 0 8px', fontSize: '13px', color: '#000080' }}>
              📌 Mandatory Legal Attribution Notice
            </h3>
            <p style={{ margin: '0 0 10px', color: '#333' }}>
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
                border: '1px solid #808080',
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
      <div style={{ padding: '8px 14px', background: '#c0c0c0', borderTop: '1px solid #808080', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <div style={{ fontSize: '10px', color: '#444' }}>
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
