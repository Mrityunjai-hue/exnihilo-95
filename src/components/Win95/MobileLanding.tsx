/**
 * MobileLanding.tsx — Authentic Windows 95 Mobile Landing Screen
 * Displayed on mobile devices (< 1024px viewport width).
 * Styled as an authentic Win95 Setup & Compatibility Warning window
 * with embedded animated video demo, product breakdown, and GitHub CTAs.
 */

'use client';

import React, { useState } from 'react';
import { LegalWindow } from './LegalWindow';

interface MobileLandingProps {
  onForceDesktop: () => void;
}

export const MobileLanding: React.FC<MobileLandingProps> = ({ onForceDesktop }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [showSystemInfo, setShowSystemInfo] = useState(false);
  const [showLegalModal, setShowLegalModal] = useState(false);

  return (
    <div
      style={{
        width: '100vw',
        minHeight: '100vh',
        backgroundColor: '#008080',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        padding: '16px 8px 32px 8px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        fontFamily: "'Windows 95', 'MS Sans Serif', Tahoma, Verdana, sans-serif",
        position: 'relative',
      }}
    >
      {/* Re-flowed Installer / Compatibility Dialog Window */}
      <div
        className="win95-window"
        style={{
          width: '100%',
          maxWidth: '540px',
          boxShadow: '4px 4px 20px rgba(0,0,0,0.6)',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
        }}
      >
        {/* Win95 Window Titlebar */}
        <div className="win95-titlebar" style={{ cursor: 'default' }}>
          <div className="win95-titlebar-text" style={{ fontSize: '12px' }}>
            <span>💾</span>
            <span>ExNihilo 95 Setup — System Compatibility Notice</span>
          </div>
          <div className="win95-titlebar-controls" style={{ display: 'flex', gap: '2px' }}>
            <button
              className="win95-btn-titlebar"
              title="System Information & Hardware Specs"
              onClick={() => setShowSystemInfo(true)}
              style={{ cursor: 'pointer', fontWeight: 'bold' }}
            >
              ?
            </button>
            <button
              className="win95-btn-titlebar"
              title="System Requirements Warning"
              onClick={() => setShowSystemInfo(true)}
              style={{ cursor: 'pointer', fontWeight: 'bold', color: '#ffcc00' }}
            >
              !
            </button>
          </div>
        </div>

        {/* Window Body Container */}
        <div style={{ padding: '16px', backgroundColor: '#c0c0c0' }}>
          
          {/* Header & Logo Section */}
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                marginBottom: '6px',
              }}
            >
              {/* 4-Color Windows Tile Logo */}
              <div className="win95-flag-container" style={{ transform: 'scale(0.85)' }}>
                <div className="win95-flag-tile win95-flag-red" />
                <div className="win95-flag-tile win95-flag-green" />
                <div className="win95-flag-tile win95-flag-blue" />
                <div className="win95-flag-tile win95-flag-yellow" />
              </div>

              {/* Title */}
              <h1 className="win95-3d-title" style={{ fontSize: '32px' }}>
                EXNIHILO<span className="win95-3d-edition" style={{ fontSize: '14px' }}>95</span>
              </h1>
            </div>

            <div
              style={{
                fontSize: '11px',
                fontWeight: 'bold',
                color: '#000080',
                letterSpacing: '1px',
                textTransform: 'uppercase',
              }}
            >
              Intelligent Zero-Config SQL Development Environment
            </div>
          </div>

          {/* Plain-Language Product Explanation */}
          <div
            className="win95-inset"
            style={{
              padding: '12px',
              backgroundColor: '#ffffff',
              marginBottom: '16px',
              fontSize: '12px',
              lineHeight: '1.6',
              color: '#000000',
            }}
          >
            <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: '#000080' }}>
              💡 What is ExNihilo 95?
            </p>
            <p style={{ margin: 0 }}>
              Type any SQL query — even against tables that don&apos;t exist yet! ExNihilo automatically infers data schemas, maps foreign key relationships, generates realistic test data on the fly, and executes queries entirely inside your browser via WebAssembly with <strong>ZERO &quot;Table not found&quot; errors</strong>.
            </p>
          </div>

          {/* Target Audience / Personas Section */}
          <div
            className="win95-inset"
            style={{
              padding: '12px',
              backgroundColor: '#ffffff',
              marginBottom: '16px',
              fontSize: '11px',
              lineHeight: '1.5',
            }}
          >
            <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: '#000080', fontSize: '12px' }}>
              🎯 Who is ExNihilo 95 Built For?
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div className="win95-sunken" style={{ background: '#f8f8ff', padding: '6px 8px' }}>
                🎓 <strong>Students &amp; Learners:</strong> Practice SQL with zero installation, DB setup, or dataset imports.
              </div>
              <div className="win95-sunken" style={{ background: '#f8f8ff', padding: '6px 8px' }}>
                💼 <strong>Recruiters &amp; Interviewers:</strong> Conduct live candidate SQL interviews without setting up test DB instances.
              </div>
              <div className="win95-sunken" style={{ background: '#f8f8ff', padding: '6px 8px' }}>
                🏫 <strong>Educators &amp; Teachers:</strong> Demonstrate complex queries (JOINs, CTEs, Window Functions) live in class.
              </div>
              <div className="win95-sunken" style={{ background: '#f8f8ff', padding: '6px 8px' }}>
                👨‍💻 <strong>Developers &amp; DBAs:</strong> Prototype and dry-run query logic before writing migrations or staging tables.
              </div>
              <div className="win95-sunken" style={{ background: '#f8f8ff', padding: '6px 8px' }}>
                🧪 <strong>QA &amp; Data Analysts:</strong> Test query edge-cases against auto-generated relational data on demand.
              </div>
            </div>
          </div>

          {/* Retro Win95 Media Player Container for Demo Video */}
          <div
            className="win95-window"
            style={{
              marginBottom: '16px',
              border: '2px solid #dfdfdf',
              boxShadow: 'none',
            }}
          >
            <div className="win95-titlebar" style={{ background: '#000080', padding: '2px 6px' }}>
              <div className="win95-titlebar-text" style={{ fontSize: '11px' }}>
                <span>▶</span>
                <span>Media Player — ExNihilo_IDE_Demo.avi ({isPlaying ? 'Playing' : 'Paused'})</span>
              </div>
            </div>

            {/* Video Container */}
            <div
              className="win95-inset"
              style={{
                backgroundColor: '#000000',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '200px',
              }}
            >
              {/* Animated Demo WebP / Video */}
              <img
                src="/win95_ide_demo.webp"
                alt="ExNihilo 95 Desktop IDE Demo Video"
                style={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: '280px',
                  objectFit: 'contain',
                  display: isPlaying ? 'block' : 'none',
                }}
                onError={(e) => {
                  // Fallback if image load fails
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />

              {!isPlaying && (
                <div
                  style={{
                    color: '#00ff00',
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    padding: '40px',
                    textAlign: 'center',
                  }}
                >
                  [ ❚❚ PAUSED — Click Play below to resume desktop video demo ]
                </div>
              )}
            </div>

            {/* Media Player Controls & Status Bar */}
            <div
              style={{
                padding: '6px 8px',
                backgroundColor: '#c0c0c0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '11px',
                borderTop: '1px solid #808080',
              }}
            >
              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  className="win95-button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  style={{ padding: '2px 8px', fontSize: '11px', fontWeight: 'bold' }}
                >
                  {isPlaying ? '❚❚ Pause' : '▶ Play'}
                </button>
                <button
                  className="win95-button"
                  onClick={() => setIsPlaying(false)}
                  style={{ padding: '2px 8px', fontSize: '11px' }}
                >
                  ◼ Stop
                </button>
              </div>

              <div style={{ color: '#444', fontFamily: 'monospace', fontSize: '10px' }}>
                00:15 / 00:15 • 1024x768 256c
              </div>
            </div>
          </div>

          {/* Retro System Requirements Warning Box */}
          <div
            className="win95-inset"
            style={{
              padding: '14px',
              backgroundColor: '#ffffe0',
              border: '1px solid #808000',
              marginBottom: '16px',
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start',
            }}
          >
            <div style={{ fontSize: '32px', lineHeight: 1 }}>⚠️</div>
            <div>
              <h4 style={{ margin: '0 0 6px 0', fontSize: '12px', color: '#800000', fontWeight: 'bold' }}>
                System Requirements Warning (Desktop Required)
              </h4>
              <p style={{ margin: 0, fontSize: '11px', lineHeight: '1.5', color: '#000000' }}>
                ExNihilo 95 is built specifically for <strong>Desktop and Laptop computers</strong> (recommended screen resolution 1024x768 or higher with keyboard precision).
              </p>
              <p style={{ margin: '6px 0 0 0', fontSize: '11px', lineHeight: '1.5', color: '#000000' }}>
                Please revisit <strong>exnihilo-95.vercel.app</strong> on your desktop or laptop for the full interactive Windows 95 SQL Studio experience!
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            <a
              href="https://github.com/Mrityunjai-hue/exnihilo-95"
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none' }}
            >
              <button
                className="win95-button win95-button-default"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                ⭐ Star on GitHub & Explore Source Code
              </button>
            </a>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px' }}>
              <a
                href="https://github.com/Mrityunjai-hue/exnihilo-95/blob/main/PREMIUM_FEATURES.md"
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none' }}
              >
                <button
                  className="win95-button"
                  style={{
                    width: '100%',
                    padding: '6px',
                    fontSize: '11px',
                    cursor: 'pointer',
                  }}
                >
                  🤝 Join Team & Roadmap
                </button>
              </a>

              <button
                className="win95-button"
                onClick={() => setShowLegalModal(true)}
                style={{
                  width: '100%',
                  padding: '6px',
                  fontSize: '11px',
                  cursor: 'pointer',
                }}
              >
                ⚖️ Legal & IP Protection
              </button>
            </div>

            {/* Optional Force Desktop Override */}
            <button
              className="win95-button"
              onClick={onForceDesktop}
              style={{
                width: '100%',
                padding: '6px 12px',
                fontSize: '11px',
                marginTop: '4px',
                cursor: 'pointer',
                color: '#444444',
              }}
            >
              🖥️ Try Desktop View Anyway (Experimental)
            </button>
          </div>

          {/* Footer & Attribution */}
          <div
            className="win95-inset"
            style={{
              padding: '10px',
              backgroundColor: '#f0f8ff',
              textAlign: 'center',
              fontSize: '11px',
              lineHeight: '1.5',
            }}
          >
            <div>
              👨‍💻 <strong>Original Idea & Design by:</strong>{' '}
              <a
                href="https://github.com/Mrityunjai-hue"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#000080', fontWeight: 'bold' }}
              >
                Mrityunjai (@Mrityunjai-hue)
              </a>
            </div>
            <div style={{ marginTop: '2px' }}>
              🌐 <strong>Powered by:</strong>{' '}
              <a
                href="https://n8n-ds-community.netlify.app/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#000080' }}
              >
                N8N Data Science Community
              </a>{' '}
              using AI
            </div>
          </div>

        </div>
      </div>

      {/* Win95 System Information Modal Dialog */}
      {showSystemInfo && (
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
            padding: '16px',
            boxSizing: 'border-box',
          }}
          onClick={() => setShowSystemInfo(false)}
        >
          <div
            className="win95-window"
            style={{
              width: '100%',
              maxWidth: '420px',
              boxShadow: '4px 4px 20px rgba(0,0,0,0.8)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Titlebar */}
            <div className="win95-titlebar">
              <div className="win95-titlebar-text">
                <span>ℹ️</span>
                <span>System Information — Hardware Diagnostics</span>
              </div>
              <div className="win95-titlebar-controls">
                <button className="win95-btn-titlebar" onClick={() => setShowSystemInfo(false)}>✕</button>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '14px', backgroundColor: '#c0c0c0' }}>
              <div
                className="win95-inset"
                style={{
                  padding: '12px',
                  backgroundColor: '#ffffff',
                  marginBottom: '14px',
                  fontSize: '11px',
                  lineHeight: '1.6',
                }}
              >
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div style={{ fontSize: '28px' }}>💻</div>
                  <div>
                    <strong style={{ color: '#000080', fontSize: '12px' }}>ExNihilo 95 Environment Diagnostics</strong>
                    <div style={{ color: '#800000', fontWeight: 'bold', fontSize: '11px' }}>
                      Status: Hardware Specification Warning
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #c0c0c0', paddingTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div>📱 <strong>Detected Viewport:</strong> {typeof window !== 'undefined' ? window.innerWidth : 390}px width</div>
                  <div>🖥️ <strong>Required Viewport:</strong> 1024px+ width (Desktop)</div>
                  <div>⚙️ <strong>SQL Engine:</strong> sql.js (WebAssembly SQLite 3.49.1)</div>
                  <div>🌳 <strong>Schema Inferencer:</strong> AST Precedence Visitor (Ready)</div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  className="win95-button win95-button-default"
                  onClick={() => setShowSystemInfo(false)}
                  style={{ padding: '4px 16px', fontSize: '11px', fontWeight: 'bold' }}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* In-App Win95 Legal & IP Protection Modal */}
      <LegalWindow
        isOpen={showLegalModal}
        isModal={true}
        onClose={() => setShowLegalModal(false)}
      />
    </div>
  );
};
