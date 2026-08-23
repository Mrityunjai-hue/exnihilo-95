/**
 * WelcomeWindow.tsx — Windows 95 Welcome & Landing Page Dialog
 *
 * Details what ExNihilo is, key features, author attribution to Mrityunjai,
 * and community partnership with N8N Data Science Community with clickable link,
 * followed by the guided tour trigger.
 */

import React from 'react';
import { useDraggable } from '../../hooks/useDraggable';

interface WelcomeWindowProps {
  isOpen:       boolean;
  zIndex:       number;
  onClose:      () => void;
  onStartTour:  () => void;
  onOpenHelp:   () => void;
  onOpenIDE:    () => void;
  onFocus:      () => void;
}

export const WelcomeWindow: React.FC<WelcomeWindowProps> = ({
  isOpen,
  zIndex,
  onClose,
  onStartTour,
  onOpenHelp,
  onOpenIDE,
  onFocus,
}) => {
  const { position, handleMouseDown } = useDraggable({ x: 120, y: 40 });

  if (!isOpen) return null;

  return (
    <div
      className="win95-window"
      style={{
        position: 'absolute',
        top: `${position.y}px`,
        left: `${position.x}px`,
        width: '620px',
        maxWidth: '95vw',
        zIndex,
        boxShadow: '4px 4px 20px rgba(0,0,0,0.6)',
      }}
      onMouseDown={onFocus}
    >
      {/* Titlebar with Drag Handler */}
      <div
        className="win95-titlebar"
        onMouseDown={(e) => {
          onFocus();
          handleMouseDown(e);
        }}
        style={{ cursor: 'move' }}
      >
        <div className="win95-titlebar-text">
          <span>✨</span>
          <span>Welcome to ExNihilo 95 — Zero-Config SQL IDE</span>
        </div>
        <div className="win95-titlebar-controls">
          <button className="win95-btn-titlebar" onMouseDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); onClose(); }} title="Close">✕</button>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {/* Hero Header Banner */}
        <div
          className="win95-inset"
          style={{
            background: 'linear-gradient(135deg, #000080 0%, #1084d0 100%)',
            color: '#ffffff',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <div style={{ fontSize: '42px', filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.5))' }}>
            🗄️
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', letterSpacing: '0.5px' }}>
              ExNihilo 95
            </h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#cce6ff', lineHeight: 1.4 }}>
              The Intelligent SQL Environment with <strong>Zero &quot;Table Not Found&quot; Errors</strong>.
              Auto-infers schemas and generates synthetic data on the fly.
            </p>
          </div>
        </div>

        {/* Informational Body */}
        <div
          className="win95-inset"
          style={{
            background: '#ffffff',
            padding: '14px',
            maxHeight: '260px',
            overflowY: 'auto',
            fontSize: '11px',
            lineHeight: '1.6',
          }}
        >
          <h4 style={{ margin: '0 0 6px 0', color: '#000080', fontSize: '12px' }}>
            💡 What is ExNihilo?
          </h4>
          <p style={{ margin: '0 0 10px 0' }}>
            <em>Ex Nihilo</em> is Latin for <strong>&quot;out of nothing&quot;</strong>. In traditional SQL tools, querying an uncreated table immediately crashes with a <code>Table not found</code> error. ExNihilo analyzes your query&apos;s Abstract Syntax Tree (AST), infers column data types, links foreign keys, and generates realistic synthetic data inside your browser in milliseconds!
          </p>

          <h4 style={{ margin: '10px 0 6px 0', color: '#000080', fontSize: '12px' }}>
            ⚡ Key Capabilities
          </h4>
          <ul style={{ margin: '0 0 10px 0', paddingLeft: '18px' }}>
            <li><strong>Multi-Dialect Support:</strong> MySQL, PostgreSQL (casting & CTEs), SQLite, and SSMS (Transact-SQL).</li>
            <li><strong>Referential Integrity:</strong> Parents generated before children with foreign key value sampling.</li>
            <li><strong>100% In-Browser:</strong> Runs WebAssembly SQLite 3.49.1 (sql.js) locally — no backend required.</li>
            <li><strong>CodeMirror 6 Editor:</strong> Syntax highlighting, line numbers, and F5 / Ctrl+Enter execution.</li>
          </ul>

          {/* Attribution & Community Badge */}
          <div
            className="win95-sunken"
            style={{
              background: '#f7f7f7',
              border: '1px solid #c0c0c0',
              padding: '10px 12px',
              marginTop: '10px',
              borderRadius: '2px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '16px' }}>👨‍💻</span>
              <span>
                <strong>Built by:</strong>{' '}
                <a
                  href="https://github.com/Mrityunjai-hue"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#0000ee', fontWeight: 'bold', textDecoration: 'underline' }}
                >
                  Mrityunjai
                </a>
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '16px' }}>🌐</span>
              <span>
                <strong>Powered by:</strong>{' '}
                <a
                  href="https://n8n-ds-community.netlify.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: '#0000ee',
                    fontWeight: 'bold',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                  }}
                  title="Visit N8N Data Science Community"
                >
                  N8N Data Science Community
                </a>{' '}
                using AI
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '6px',
            borderTop: '1px solid #808080',
          }}
        >
          <a
            href="https://n8n-ds-community.netlify.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="win95-button"
            style={{ fontSize: '11px', textDecoration: 'none', color: '#000' }}
          >
            🌐 Visit N8N Community
          </a>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="win95-button"
              style={{ fontSize: '11px' }}
              onClick={() => {
                onClose();
                onOpenHelp();
              }}
            >
              📖 Query Guide
            </button>

            <button
              className="win95-button"
              style={{ fontWeight: 'bold', fontSize: '11px', background: '#000080', color: '#ffffff' }}
              onClick={() => {
                onClose();
                onOpenIDE();
                onStartTour();
              }}
            >
              💡 Start Tour &amp; Launch IDE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
