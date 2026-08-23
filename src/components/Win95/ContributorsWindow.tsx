/**
 * ContributorsWindow.tsx — "Join the Team" window showcasing premium features
 * roadmap and open call for contributors, styled as a classic Win95 window.
 */

'use client';

import React, { useState } from 'react';
import { useDraggable } from '../../hooks/useDraggable';

interface ContributorsWindowProps {
  isOpen:       boolean;
  isMinimized:  boolean;
  zIndex:       number;
  onClose:      () => void;
  onMinimize:   () => void;
  onFocus:      () => void;
}

type TabId = 'overview' | 'features' | 'roles' | 'getstarted';

const PREMIUM_FEATURES = [
  { icon: '🤖', name: 'AI SQL Copilot',              desc: 'Natural language → SQL, query explanations, AI-powered error fix suggestions', skills: 'AI/ML, LLM APIs' },
  { icon: '💾', name: 'Cloud Sync & Persistence',     desc: 'Auto-save queries to cloud, cross-device sync, query version history', skills: 'Backend, Auth, DB' },
  { icon: '📊', name: 'Chart Builder & Dashboards',   desc: 'Bar, line, pie, scatter charts generated from query results + dashboard mode', skills: 'React, D3/Chart.js' },
  { icon: '🔗', name: 'Live Database Connections',     desc: 'Connect to real MySQL/PostgreSQL/SQLite databases via secure proxy', skills: 'Backend, Security' },
  { icon: '🎨', name: 'Theme Engine & Skins',         desc: 'Win98, XP Luna, Dark Mode, custom color palettes, CRT scanline filter', skills: 'CSS, Design' },
  { icon: '👥', name: 'Real-Time Collaboration',      desc: 'Google Docs-style shared editing with team workspaces & activity feed', skills: 'WebSockets, CRDT' },
  { icon: '🧪', name: 'SQL Challenge Mode',           desc: 'Built-in SQL puzzles with progressive difficulty (Easy → Expert)', skills: 'Content, Frontend' },
  { icon: '📤', name: 'Advanced Exports',             desc: 'DDL scripts, shareable query links, embeddable widgets, PDF reports', skills: 'Frontend, Backend' },
  { icon: '🎲', name: 'Smart Data Generation',        desc: 'Locale-aware data, custom profiles, deterministic seeding, seed CSV upload', skills: 'Data Engineering' },
  { icon: '🎓', name: 'Teaching & Classroom Mode',    desc: 'Instructor broadcasts, student progress tracking, completion certificates', skills: 'Full-Stack' },
];

const CONTRIBUTOR_ROLES = [
  { icon: '⚛️', title: 'Frontend Engineers',    desc: 'React / Next.js / TypeScript — UI components, chart builder, theming engine, visualization' },
  { icon: '🔧', title: 'Backend Engineers',      desc: 'Authentication, cloud sync infrastructure, database connection proxies, API design' },
  { icon: '🧠', title: 'AI/ML Engineers',        desc: 'Natural language to SQL, query optimization suggestions, intelligent autocomplete' },
  { icon: '🎨', title: 'Designers',              desc: 'Theme skins (Win98, XP, Dark Mode), UX flows, data visualization & chart component design' },
  { icon: '📝', title: 'Content Creators',       desc: 'SQL tutorials, challenge puzzles & solutions, documentation, blog posts' },
  { icon: '🌐', title: 'Community Builders',     desc: 'Developer relations, outreach, onboarding guides, community management' },
];

export const ContributorsWindow: React.FC<ContributorsWindowProps> = ({
  isOpen,
  isMinimized,
  zIndex,
  onClose,
  onMinimize,
  onFocus,
}) => {
  const { position, handleMouseDown } = useDraggable({ x: 120, y: 55 });
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [isMaximized, setIsMaximized] = useState(false);

  if (!isOpen || isMinimized) return null;

  const windowStyle: React.CSSProperties = isMaximized
    ? { position: 'fixed', top: 0, left: 0, width: '100vw', height: 'calc(100vh - 36px)', zIndex }
    : { position: 'absolute', top: position.y, left: position.x, width: '680px', height: '520px', zIndex };

  const tabs: { id: TabId; label: string }[] = [
    { id: 'overview',    label: '🚀 Overview' },
    { id: 'features',   label: '💎 Premium Features' },
    { id: 'roles',      label: '🎯 Roles Needed' },
    { id: 'getstarted', label: '🛠️ Get Started' },
  ];

  return (
    <div className="win95-window" style={windowStyle} onMouseDown={onFocus}>
      <div
        className="win95-titlebar"
        onMouseDown={(e) => {
          onFocus();
          handleMouseDown(e);
        }}
        style={{ cursor: 'move' }}
      >
        <div className="win95-titlebar-text">
          <span>🤝</span>
          <span>ExNihilo 95 — Join the Team</span>
        </div>
        <div className="win95-titlebar-controls">
          <button className="win95-btn-titlebar" onMouseDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); onMinimize(); }}>_</button>
          <button className="win95-btn-titlebar" onMouseDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); setIsMaximized(!isMaximized); }}>□</button>
          <button className="win95-btn-titlebar" onMouseDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); onClose(); }}>✕</button>
        </div>
      </div>

      {/* Tab Strip */}
      <div style={{ display: 'flex', background: '#c0c0c0', borderBottom: '1px solid #808080', padding: '2px 4px 0' }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className="win95-button"
            onClick={() => setActiveTab(tab.id)}
            style={{
              fontSize: '11px',
              padding: '3px 10px',
              marginRight: '2px',
              borderBottom: activeTab === tab.id ? '2px solid #000080' : '2px solid transparent',
              fontWeight: activeTab === tab.id ? 'bold' : 'normal',
              background: activeTab === tab.id ? '#ffffff' : '#c0c0c0',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div style={{ flex: 1, overflow: 'auto', background: '#ffffff', padding: '14px', fontSize: '11px', lineHeight: '1.7' }}>

        {/* ─── OVERVIEW TAB ─── */}
        {activeTab === 'overview' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div style={{ fontSize: '32px', marginBottom: '6px' }}>🤝</div>
              <h2 style={{ margin: '0 0 4px', fontSize: '16px', color: '#000080' }}>
                Calling All Builders — Contributors Wanted!
              </h2>
              <p style={{ margin: 0, color: '#444', fontSize: '11px' }}>
                ExNihilo 95 has proven its core concept. Now it&apos;s time to scale it into something massive.
              </p>
            </div>

            <div className="win95-inset" style={{ padding: '12px', marginBottom: '12px', background: '#ffffe0', border: '1px solid #808000' }}>
              <p style={{ margin: '0 0 8px', fontWeight: 'bold', color: '#000080' }}>
                💡 What is ExNihilo 95?
              </p>
              <p style={{ margin: 0 }}>
                A zero-configuration, in-browser SQL IDE built in the iconic Windows 95 aesthetic.
                It parses your SQL AST, automatically deduces table schemas, generates realistic synthetic data,
                and executes queries entirely client-side via WebAssembly — with ZERO &quot;Table not found&quot; errors.
              </p>
            </div>

            <div className="win95-inset" style={{ padding: '12px', marginBottom: '12px', background: '#f0f8ff' }}>
              <p style={{ margin: '0 0 8px', fontWeight: 'bold', color: '#000080' }}>
                🏗️ What&apos;s Next? 10 Major Feature Categories
              </p>
              <p style={{ margin: '0 0 8px' }}>
                We&apos;ve mapped out a comprehensive <strong>Premium Features Roadmap</strong> spanning:
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px' }}>
                {PREMIUM_FEATURES.map((f) => (
                  <div key={f.name} style={{ fontSize: '10px' }}>
                    {f.icon} <strong>{f.name}</strong>
                  </div>
                ))}
              </div>
            </div>

            <div className="win95-inset" style={{ padding: '12px', background: '#f0fff0', border: '1px solid #228B22' }}>
              <p style={{ margin: '0 0 6px', fontWeight: 'bold', color: '#006400' }}>
                ⭐ Top contributors will be credited as co-creators and core team members.
              </p>
              <p style={{ margin: 0 }}>
                This is too big for one person — it needs a <strong>team of passionate builders</strong>.
                Let&apos;s build the future of SQL tooling together! 🚀
              </p>
            </div>
          </div>
        )}

        {/* ─── FEATURES TAB ─── */}
        {activeTab === 'features' && (
          <div>
            <h3 style={{ margin: '0 0 10px', fontSize: '13px', color: '#000080' }}>
              💎 Premium Features Roadmap
            </h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
              <thead>
                <tr style={{ background: '#000080', color: '#fff' }}>
                  <th style={{ padding: '4px 6px', textAlign: 'left' }}>Feature</th>
                  <th style={{ padding: '4px 6px', textAlign: 'left' }}>Description</th>
                  <th style={{ padding: '4px 6px', textAlign: 'left' }}>Skills</th>
                </tr>
              </thead>
              <tbody>
                {PREMIUM_FEATURES.map((f, i) => (
                  <tr key={f.name} style={{ background: i % 2 === 0 ? '#f8f8ff' : '#ffffff' }}>
                    <td style={{ padding: '5px 6px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                      {f.icon} {f.name}
                    </td>
                    <td style={{ padding: '5px 6px' }}>{f.desc}</td>
                    <td style={{ padding: '5px 6px', color: '#800080', fontStyle: 'italic', whiteSpace: 'nowrap' }}>
                      {f.skills}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="win95-inset" style={{ padding: '10px', marginTop: '12px', background: '#ffffe0', border: '1px solid #808000' }}>
              <p style={{ margin: 0, fontSize: '10px' }}>
                📄 Full roadmap with pricing tiers, Gantt timeline, and conversion strategies available at{' '}
                <a href="https://github.com/Mrityunjai-hue/exnihilo-95/blob/main/PREMIUM_FEATURES.md" target="_blank" rel="noopener noreferrer" style={{ color: '#000080' }}>
                  PREMIUM_FEATURES.md on GitHub
                </a>
              </p>
            </div>
          </div>
        )}

        {/* ─── ROLES TAB ─── */}
        {activeTab === 'roles' && (
          <div>
            <h3 style={{ margin: '0 0 10px', fontSize: '13px', color: '#000080' }}>
              🎯 Contributor Roles We&apos;re Looking For
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {CONTRIBUTOR_ROLES.map((role) => (
                <div key={role.title} className="win95-inset" style={{ padding: '10px', background: '#f8f8ff' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '4px' }}>
                    {role.icon} {role.title}
                  </div>
                  <div style={{ fontSize: '10px', color: '#333' }}>{role.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── GET STARTED TAB ─── */}
        {activeTab === 'getstarted' && (
          <div>
            <h3 style={{ margin: '0 0 10px', fontSize: '13px', color: '#000080' }}>
              🛠️ How to Get Started
            </h3>

            <div className="win95-inset" style={{ padding: '12px', marginBottom: '10px', background: '#f0f8ff' }}>
              <p style={{ margin: '0 0 8px', fontWeight: 'bold' }}>Step 1: Fork & Clone</p>
              <div style={{ background: '#000', color: '#00ff00', padding: '8px 10px', fontFamily: 'monospace', fontSize: '11px', borderRadius: '2px' }}>
                git clone https://github.com/YOUR_USERNAME/exnihilo-95.git<br />
                cd exnihilo-95<br />
                npm install<br />
                npm run dev
              </div>
            </div>

            <div className="win95-inset" style={{ padding: '12px', marginBottom: '10px', background: '#f0f8ff' }}>
              <p style={{ margin: '0 0 8px', fontWeight: 'bold' }}>Step 2: Pick a Feature</p>
              <p style={{ margin: 0, fontSize: '10px' }}>
                Check the <strong>💎 Premium Features</strong> tab or read the full{' '}
                <a href="https://github.com/Mrityunjai-hue/exnihilo-95/blob/main/PREMIUM_FEATURES.md" target="_blank" rel="noopener noreferrer" style={{ color: '#000080' }}>
                  PREMIUM_FEATURES.md
                </a>{' '}
                roadmap on GitHub.
              </p>
            </div>

            <div className="win95-inset" style={{ padding: '12px', marginBottom: '10px', background: '#f0f8ff' }}>
              <p style={{ margin: '0 0 8px', fontWeight: 'bold' }}>Step 3: Create a Branch & Submit a PR</p>
              <div style={{ background: '#000', color: '#00ff00', padding: '8px 10px', fontFamily: 'monospace', fontSize: '11px', borderRadius: '2px' }}>
                git checkout -b feature/your-feature-name
              </div>
              <p style={{ margin: '6px 0 0', fontSize: '10px' }}>
                Include screenshots for UI changes, reference the feature from PREMIUM_FEATURES.md, and run <code>npm run build</code> to verify zero TypeScript errors.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a
                href="https://github.com/Mrityunjai-hue/exnihilo-95"
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none' }}
              >
                <button className="win95-button win95-button-default" style={{ fontSize: '11px', padding: '4px 14px', fontWeight: 'bold', cursor: 'pointer' }}>
                  ⭐ Star & Fork on GitHub
                </button>
              </a>
              <a
                href="https://github.com/Mrityunjai-hue/exnihilo-95/blob/main/CONTRIBUTING.md"
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none' }}
              >
                <button className="win95-button" style={{ fontSize: '11px', padding: '4px 14px', cursor: 'pointer' }}>
                  📋 Read CONTRIBUTING.md
                </button>
              </a>
              <a
                href="https://github.com/Mrityunjai-hue/exnihilo-95/issues"
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none' }}
              >
                <button className="win95-button" style={{ fontSize: '11px', padding: '4px 14px', cursor: 'pointer' }}>
                  🐛 View Open Issues
                </button>
              </a>
            </div>

            <div className="win95-inset" style={{ padding: '10px', marginTop: '14px', background: '#f0fff0', border: '1px solid #228B22', textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: '11px' }}>
                💬 <strong>Creator:</strong>{' '}
                <a href="https://github.com/Mrityunjai-hue" target="_blank" rel="noopener noreferrer" style={{ color: '#000080' }}>
                  Mrityunjai
                </a>
                {' '}&bull;{' '}
                🌐 <strong>Community:</strong>{' '}
                <a href="https://n8n-ds-community.netlify.app/" target="_blank" rel="noopener noreferrer" style={{ color: '#000080' }}>
                  N8N Data Science Community
                </a>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
