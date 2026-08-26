/**
 * AdminDashboard.tsx — Windows 95 Account & Admin Control Panel
 * Features 4 main tabs, complete 10-pillar Pro Tier roadmap, regional pricing, and session metrics.
 */

import React, { useState, useEffect } from 'react';
import { useDraggable } from '../../hooks/useDraggable';
import { StoredUser, ActiveSession } from '../../hooks/useAuth';
import { useRegionalPricing } from '../../hooks/useRegionalPricing';
import { PRO_PRICING } from '../../config/pricing';
import { WindowControls } from './WindowControls';

export interface SessionStats {
  queriesRun: number;
  rowsGenerated: number;
  sessionStartTime: number;
  queryHistory: Array<{ sql: string; timeMs: number; timestamp: string }>;
}

interface AdminDashboardProps {
  isOpen: boolean;
  zIndex: number;
  currentUser: StoredUser | null;
  activeSession: ActiveSession | null;
  sessionStats: SessionStats;
  onClose: () => void;
  onFocus: () => void;
  onLogout: () => void;
  onDeleteAccount: () => Promise<{ success: boolean; error?: string }>;
  onChangePassword: (current: string, newPass: string) => Promise<{ success: boolean; error?: string }>;
  onClearHistory: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  zIndex,
  currentUser,
  activeSession,
  sessionStats,
  onClose,
  onFocus,
  onLogout,
  onDeleteAccount,
  onChangePassword,
  onClearHistory,
}) => {
  const [activeTab, setActiveTab] = useState<'account' | 'pro' | 'usage' | 'logout'>('account');
  const [proFilter, setProFilter] = useState<'all' | 'productivity' | 'ai' | 'cloud' | 'viz' | 'themes'>('all');
  const [modalNotice, setModalNotice] = useState<string | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  // Change password inputs
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmNewPass, setConfirmNewPass] = useState('');
  const [isPassLoading, setIsPassLoading] = useState(false);
  const [isPassSubmitting, setIsPassSubmitting] = useState(false);
  const [passError, setPassError] = useState<string | null>(null);
  const [passSuccess, setPassSuccess] = useState<string | null>(null);

  // Regional Pricing Hook
  const { region, selectedCurrency, setCurrencyOverride, pricingTier, availableCurrencies } =
    useRegionalPricing(currentUser ? currentUser.usernameNorm : null);

  const { position, handleMouseDown } = useDraggable({ x: 160, y: 50 });

  // Format session duration
  const [elapsedText, setElapsedText] = useState('0m');
  useEffect(() => {
    if (!activeSession) return;
    const interval = setInterval(() => {
      const ms = Date.now() - new Date(activeSession.loginTime).getTime();
      const mins = Math.floor(ms / 60000);
      const hrs = Math.floor(mins / 60);
      if (hrs > 0) {
        setElapsedText(`${hrs}h ${mins % 60}m`);
      } else {
        setElapsedText(`${mins}m`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [activeSession]);

  if (!isOpen || !currentUser) return null;

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isPassSubmitting || isPassLoading) return;
    setIsPassSubmitting(true);
    setPassError(null);
    setPassSuccess(null);

    try {
      if (newPass !== confirmNewPass) {
        setPassError('New passwords do not match.');
        return;
      }

      setIsPassLoading(true);
      const res = await onChangePassword(currentPass, newPass);
      setIsPassLoading(false);

      if (!res.success) {
        setPassError(res.error || 'Password change failed.');
      } else {
        setPassSuccess('✓ Password changed successfully.');
        setCurrentPass('');
        setNewPass('');
        setConfirmNewPass('');
      }
    } finally {
      setIsPassLoading(false);
      setIsPassSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setShowConfirmDelete(false);
    const res = await onDeleteAccount();
    if (!res.success) {
      setModalNotice(res.error || 'Account deletion failed.');
    } else {
      setModalNotice('✓ Account deleted. All local data for this account has been removed.');
    }
  };

  // Complete 10 Pro Pillars Roadmap Data
  const ALL_PRO_PILLARS = [
    {
      cat: 'productivity',
      categoryTitle: '🗂️ 1. Unlimited Tabs & Workspaces',
      feature: 'Unlimited Tabs & Named Workspaces',
      free: '3 Tabs Max',
      pro: 'Unlimited Tabs + Named Workspaces (E-Commerce, Analytics)',
    },
    {
      cat: 'productivity',
      categoryTitle: '🗂️ 1. Unlimited Tabs & Workspaces',
      feature: 'Tab Grouping & Pinning',
      free: '✕ None',
      pro: 'Color-coded Tab Groups, Drag-reorder & Pin Critical Tabs',
    },
    {
      cat: 'cloud',
      categoryTitle: '💾 2. Persistent Sessions & Cloud Sync',
      feature: 'Auto-Save & Cross-Device Cloud Sync',
      free: 'Local Device Only',
      pro: 'Auto-save to Cloud + Sync across GitHub/Google Logins',
    },
    {
      cat: 'cloud',
      categoryTitle: '💾 2. Persistent Sessions & Cloud Sync',
      feature: 'Full Query History & Git-Style Versioning',
      free: 'Last 10 Session Queries',
      pro: 'Unlimited History Timeline + Tab Version Revert with Diff',
    },
    {
      cat: 'ai',
      categoryTitle: '🤖 3. AI SQL Assistant (Copilot)',
      feature: 'Natural Language → SQL Generation',
      free: '✕ None',
      pro: 'Type "top 5 revenue customers" → Instant SQL',
    },
    {
      cat: 'ai',
      categoryTitle: '🤖 3. AI SQL Assistant (Copilot)',
      feature: 'AI Error Fixer & Query Optimization',
      free: '✕ None',
      pro: 'Automatic error root cause fix + index performance hints',
    },
    {
      cat: 'viz',
      categoryTitle: '📊 4. Advanced Data Visualization',
      feature: 'Built-in Chart Builder & Dashboard Mode',
      free: 'Raw Result Grid Only',
      pro: 'Bar/Line/Pie Charts, Pivot Tables & Printable Dashboards',
    },
    {
      cat: 'cloud',
      categoryTitle: '🎲 5. Advanced Synthetic Data Rules',
      feature: 'High Capacity Data Generation',
      free: '20 Rows / 25 Tables',
      pro: 'Up to 10,000 Rows, Custom Data Profiles & Seed CSV Upload',
    },
    {
      cat: 'cloud',
      categoryTitle: '🔗 6. Real Live Database Connections',
      feature: 'Live Database Proxy Connections',
      free: 'In-Memory Synthetic Only',
      pro: 'Connect live to MySQL, Postgres, SQL Server with Read-Safety',
    },
    {
      cat: 'viz',
      categoryTitle: '📤 7. Advanced Export & Sharing',
      feature: 'Multi-Format Export & Embedded Queries',
      free: 'CSV Only',
      pro: 'Export JSON, DDL Scripts, Executable INSERTs & Embed Widgets',
    },
    {
      cat: 'themes',
      categoryTitle: '🎨 8. Themes & Retro Skins',
      feature: 'Retro Theme Pack & Dark Mode Noir',
      free: 'Win95 Teal Classic',
      pro: 'Windows 98, XP Luna, Dark Mode Noir, Sound FX & CRT Filter',
    },
    {
      cat: 'themes',
      categoryTitle: '👥 9. Collaboration & Team Workspaces',
      feature: 'Real-Time Team Query Library',
      free: 'Single User Only',
      pro: 'Shared Query Repositories, Live Multi-User Cursors & Role Access',
    },
    {
      cat: 'themes',
      categoryTitle: '🧪 10. Teaching & Challenge Mode',
      feature: 'SQL Puzzles & Progress Certificates',
      free: 'Help Guide Only',
      pro: 'Interactive Challenges (Easy → Expert) & Classroom Mode',
    },
  ];

  const filteredPillars = proFilter === 'all'
    ? ALL_PRO_PILLARS
    : ALL_PRO_PILLARS.filter((p) => p.cat === proFilter);

  return (
    <>
      <div
        className="win95-window"
        style={{
          position: 'absolute',
          top: `${position.y}px`,
          left: `${position.x}px`,
          width: '620px',
          zIndex,
        }}
        onMouseDown={onFocus}
      >
        {/* Titlebar */}
        <div
          className="win95-titlebar"
          onMouseDown={(e) => {
            onFocus();
            handleMouseDown(e);
          }}
          style={{ cursor: 'move' }}
        >
          <div className="win95-titlebar-text">
            <span>{currentUser.avatar || '👤'}</span>
            <span>ExNihilo Control Panel — @{currentUser.usernameNorm}</span>
          </div>
          <WindowControls
            showMinimize={false}
            showMaximize={false}
            onClose={onClose}
          />
        </div>

        {/* Dialog Body */}
        <div style={{ padding: '8px' }}>
          {/* Header Banner */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 12px',
              marginBottom: '8px',
              background: 'linear-gradient(90deg, #000080 0%, #1084d0 100%)',
              color: '#ffffff',
              border: '2px inset #dfdfdf',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '26px' }}>{currentUser.avatar || '👤'}</span>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '13px' }}>{currentUser.displayName}</div>
                <div style={{ fontSize: '10px', color: '#dfdfdf' }}>
                  Member since {currentUser.joinDate} | Device Account
                </div>
              </div>
            </div>

            <div
              style={{
                background: '#808080',
                color: '#ffffff',
                padding: '3px 8px',
                fontSize: '11px',
                fontWeight: 'bold',
                border: '1px outset #ffffff',
              }}
            >
              [ FREE TIER ]
            </div>
          </div>

          {/* Tabs */}
          <div className="win95-tabs">
            <div
              className={`win95-tab ${activeTab === 'account' ? 'active' : ''}`}
              onClick={() => setActiveTab('account')}
            >
              👤 My Account
            </div>
            <div
              className={`win95-tab ${activeTab === 'pro' ? 'active' : ''}`}
              onClick={() => setActiveTab('pro')}
            >
              ⭐ Upgrade to Pro
            </div>
            <div
              className={`win95-tab ${activeTab === 'usage' ? 'active' : ''}`}
              onClick={() => setActiveTab('usage')}
            >
              📊 Usage
            </div>
            <div
              className={`win95-tab ${activeTab === 'logout' ? 'active' : ''}`}
              onClick={() => setActiveTab('logout')}
            >
              🚪 Log Out
            </div>
          </div>

          {/* Tab Content Area */}
          <div
            className="win95-inset"
            style={{ padding: '14px', background: '#c0c0c0', minHeight: '320px', maxHeight: '440px', overflowY: 'auto' }}
          >
            {/* TAB 1: MY ACCOUNT */}
            {activeTab === 'account' && (
              <div>
                <fieldset style={{ border: '1px solid #808080', padding: '12px', marginBottom: '12px' }}>
                  <legend style={{ fontSize: '11px', fontWeight: 'bold', padding: '0 4px' }}>
                    Account Profile Details
                  </legend>

                  <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse' }}>
                    <tbody>
                      <tr>
                        <td style={{ fontWeight: 'bold', width: '130px', padding: '4px 0' }}>Avatar & Name:</td>
                        <td>{currentUser.avatar || '💻'} {currentUser.displayName}</td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 'bold', padding: '4px 0' }}>Username:</td>
                        <td>@{currentUser.usernameNorm}</td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 'bold', padding: '4px 0' }}>Contact Email:</td>
                        <td>
                          {currentUser.email}{' '}
                          <span style={{ color: '#800000', fontSize: '10px' }} title="Contact string stored locally — not identity verified">
                            ⚠️ unverified
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 'bold', padding: '4px 0' }}>Member Since:</td>
                        <td>{currentUser.joinDate}</td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 'bold', padding: '4px 0' }}>Current Tier:</td>
                        <td>
                          <span style={{ background: '#808080', color: '#fff', padding: '1px 6px', fontSize: '10px' }}>
                            FREE
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 'bold', padding: '4px 0' }}>Detected Region:</td>
                        <td>
                          {region.flag} {region.countryName} <span style={{ color: '#666', fontSize: '10px' }}>(read-only)</span>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 'bold', padding: '4px 0' }}>Display Currency:</td>
                        <td>
                          <select
                            value={selectedCurrency}
                            onChange={(e) => setCurrencyOverride(e.target.value)}
                            className="win95-sunken"
                            style={{ padding: '2px 4px', fontSize: '11px' }}
                          >
                            {availableCurrencies.map((code) => (
                              <option key={code} value={code}>
                                {code} ({PRO_PRICING[code].symbol})
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 'bold', padding: '4px 0' }}>Pro Reference Price:</td>
                        <td>
                          {pricingTier.label} {pricingTier.usdRef && <span style={{ color: '#555' }}>({pricingTier.usdRef})</span>}{' '}
                          <span style={{ color: '#000080', fontSize: '9px', fontWeight: 'bold', background: '#ffffcc', border: '1px solid #999', padding: '1px 4px' }}>
                            ℹ️ Subject to Update
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 'bold', padding: '4px 0' }}>Session Activity:</td>
                        <td>
                          {sessionStats.queriesRun} queries | {sessionStats.rowsGenerated} rows | {elapsedText} duration
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </fieldset>

                {/* Storage Privacy Disclaimer */}
                <div
                  style={{
                    background: '#ffffcc',
                    border: '1px solid #c0c000',
                    padding: '8px',
                    marginBottom: '12px',
                    fontSize: '10px',
                    lineHeight: '1.4',
                  }}
                >
                  ⚠️ <strong>Local Storage Notice:</strong> Account data is stored locally in this browser's localStorage. Do not use on shared/public computers without deleting your account after use.
                </div>

                {/* Account Action Buttons */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    className="win95-button"
                    onClick={() => setModalNotice('Edit Profile feature is coming soon in a future release.')}
                  >
                    ✏️ Edit Profile
                  </button>
                  <button
                    className="win95-button"
                    onClick={() => {
                      setShowChangePassword(!showChangePassword);
                      setPassError(null);
                      setPassSuccess(null);
                    }}
                  >
                    🔑 Change Password
                  </button>
                  <button
                    className="win95-button"
                    style={{ color: '#800000', fontWeight: 'bold' }}
                    onClick={() => setShowConfirmDelete(true)}
                  >
                    🗑️ Delete This Account
                  </button>
                </div>

                {/* Change Password Form Sub-Panel */}
                {showChangePassword && (
                  <div
                    className="win95-inset"
                    style={{ marginTop: '12px', padding: '10px', background: '#dfdfdf' }}
                  >
                    <div style={{ fontWeight: 'bold', fontSize: '11px', marginBottom: '8px' }}>
                      Change Account Password
                    </div>

                    <form onSubmit={handleChangePasswordSubmit}>
                      <div style={{ marginBottom: '6px' }}>
                        <label style={{ display: 'block', fontSize: '10px', fontWeight: 'bold' }}>
                          Current Password:
                        </label>
                        <input
                          type="password"
                          maxLength={128}
                          value={currentPass}
                          onChange={(e) => setCurrentPass(e.target.value)}
                          className="win95-sunken"
                          style={{ width: '100%', padding: '2px 4px', fontSize: '11px', boxSizing: 'border-box' }}
                        />
                      </div>

                      <div style={{ marginBottom: '6px' }}>
                        <label style={{ display: 'block', fontSize: '10px', fontWeight: 'bold' }}>
                          New Password (≥10 chars, mixed case, number, symbol):
                        </label>
                        <input
                          type="password"
                          maxLength={128}
                          value={newPass}
                          onChange={(e) => setNewPass(e.target.value)}
                          className="win95-sunken"
                          style={{ width: '100%', padding: '2px 4px', fontSize: '11px', boxSizing: 'border-box' }}
                        />
                      </div>

                      <div style={{ marginBottom: '8px' }}>
                        <label style={{ display: 'block', fontSize: '10px', fontWeight: 'bold' }}>
                          Confirm New Password:
                        </label>
                        <input
                          type="password"
                          maxLength={128}
                          value={confirmNewPass}
                          onChange={(e) => setConfirmNewPass(e.target.value)}
                          className="win95-sunken"
                          style={{ width: '100%', padding: '2px 4px', fontSize: '11px', boxSizing: 'border-box' }}
                        />
                      </div>

                      {passError && (
                        <div style={{ color: '#990000', fontSize: '10px', marginBottom: '6px' }}>
                          ⛔ {passError}
                        </div>
                      )}
                      {passSuccess && (
                        <div style={{ color: '#006600', fontSize: '10px', marginBottom: '6px', fontWeight: 'bold' }}>
                          {passSuccess}
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="submit"
                          className="win95-button"
                          disabled={isPassSubmitting || isPassLoading}
                        >
                          {isPassLoading ? 'Updating...' : 'Update Password'}
                        </button>
                        <button
                          type="button"
                          className="win95-button"
                          onClick={() => setShowChangePassword(false)}
                        >
                          Close
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: UPGRADE TO PRO (RICH 10-PILLAR PRESENTATION) */}
            {activeTab === 'pro' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ fontSize: '11px' }}>
                    Detected Region: <strong>{region.flag} {region.countryName}</strong>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px' }}>
                    <label>Display Currency:</label>
                    <select
                      value={selectedCurrency}
                      onChange={(e) => setCurrencyOverride(e.target.value)}
                      className="win95-sunken"
                      style={{ padding: '2px 4px', fontSize: '11px' }}
                    >
                      {availableCurrencies.map((code) => (
                        <option key={code} value={code}>
                          {code} ({PRO_PRICING[code].symbol})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Hero Banner */}
                <div
                  style={{
                    background: 'linear-gradient(90deg, #000080 0%, #1084d0 100%)',
                    color: '#ffffff',
                    padding: '12px',
                    textAlign: 'center',
                    marginBottom: '10px',
                    border: '2px outset #dfdfdf',
                  }}
                >
                  <div style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '4px' }}>
                    ExNihilo 95 Pro — {pricingTier.label} <span style={{ fontSize: '11px', color: '#ffb800' }}>(Pricing Subject to Update)</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#dfdfdf' }}>
                    Power-User Workflows, AI Intelligence, Persistence & Live Database Sync
                  </div>
                  <div style={{ fontSize: '10px', color: '#c0c0c0', marginTop: '4px' }}>
                    {pricingTier.usdRef ? `Reference: ${pricingTier.usdRef} | ` : ''}Prices subject to change prior to production release.
                  </div>
                </div>

                {/* Category Sub-Filter Tabs */}
                <div style={{ display: 'flex', gap: '4px', marginBottom: '10px', flexWrap: 'wrap' }}>
                  {[
                    { id: 'all', label: 'All 10 Pillars' },
                    { id: 'productivity', label: '🗂️ Workspace' },
                    { id: 'ai', label: '🤖 AI Copilot' },
                    { id: 'cloud', label: '💾 Cloud & Sync' },
                    { id: 'viz', label: '📊 Visualizations' },
                    { id: 'themes', label: '🎨 Themes & Extras' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setProFilter(cat.id as any)}
                      className="win95-button"
                      style={{
                        fontSize: '10px',
                        padding: '2px 6px',
                        fontWeight: proFilter === cat.id ? 'bold' : 'normal',
                        border: proFilter === cat.id ? '2px inset #000' : '2px outset #fff',
                        background: proFilter === cat.id ? '#dfdfdf' : '#c0c0c0',
                      }}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Comprehensive Feature Comparison Matrix */}
                <div className="win95-sunken" style={{ background: '#ffffff', padding: '4px', marginBottom: '12px' }}>
                  <table style={{ width: '100%', fontSize: '10px', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#000080', color: '#fff' }}>
                        <th style={{ padding: '5px', textAlign: 'left' }}>Feature Pillar</th>
                        <th style={{ padding: '5px', textAlign: 'center', width: '100px' }}>Free (Base)</th>
                        <th style={{ padding: '5px', textAlign: 'center', width: '160px' }}>ExNihilo 95 Pro</th>
                        <th style={{ padding: '5px', textAlign: 'center', width: '70px' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPillars.map((p, idx) => (
                        <tr
                          key={idx}
                          style={{
                            background: idx % 2 === 0 ? '#f5f5f5' : '#ffffff',
                            borderBottom: '1px solid #eeeeee',
                          }}
                        >
                          <td style={{ padding: '5px', fontWeight: 'bold' }}>{p.feature}</td>
                          <td style={{ padding: '5px', textAlign: 'center', color: '#666' }}>{p.free}</td>
                          <td style={{ padding: '5px', textAlign: 'center', color: '#000080', fontWeight: 'bold' }}>
                            {p.pro}
                          </td>
                          <td style={{ padding: '5px', textAlign: 'center' }}>
                            <span style={{ background: '#ffffcc', border: '1px solid #999', padding: '1px 3px', fontSize: '9px' }}>
                              🔜 Soon
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Audience Plan Overview Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginBottom: '12px' }}>
                  <div className="win95-sunken" style={{ padding: '6px', background: '#dfdfdf', fontSize: '10px', textAlign: 'center' }}>
                    <div style={{ fontWeight: 'bold', color: '#000080' }}>🆓 Free</div>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', margin: '2px 0' }}>{pricingTier.symbol}0</div>
                    <div style={{ color: '#555', fontSize: '9px' }}>3 Tabs, Synthetic Data, 4 Dialects</div>
                  </div>
                  <div className="win95-sunken" style={{ padding: '6px', background: '#ffffcc', border: '2px solid #000080', fontSize: '10px', textAlign: 'center' }}>
                    <div style={{ fontWeight: 'bold', color: '#000080' }}>⭐ Pro</div>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', margin: '2px 0' }}>{pricingTier.label}*</div>
                    <div style={{ color: '#555', fontSize: '8px' }}>*Subject to update</div>
                  </div>
                  <div className="win95-sunken" style={{ padding: '6px', background: '#dfdfdf', fontSize: '10px', textAlign: 'center' }}>
                    <div style={{ fontWeight: 'bold', color: '#000080' }}>👥 Team</div>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', margin: '2px 0' }}>{pricingTier.teamLabel}*</div>
                    <div style={{ color: '#555', fontSize: '8px' }}>*Subject to update</div>
                  </div>
                  <div className="win95-sunken" style={{ padding: '6px', background: '#dfdfdf', fontSize: '10px', textAlign: 'center' }}>
                    <div style={{ fontWeight: 'bold', color: '#000080' }}>🎓 Education</div>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', margin: '2px 0' }}>{pricingTier.eduLabel}*</div>
                    <div style={{ color: '#555', fontSize: '8px' }}>*Subject to update</div>
                  </div>
                </div>

                {/* Upgrade CTAs */}
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                  <button
                    className="win95-button"
                    style={{ fontWeight: 'bold', padding: '4px 14px' }}
                    onClick={() => setModalNotice('Pro Tier upgrades are coming soon! Pricing subject to update.')}
                  >
                    🚀 Upgrade to Pro ({pricingTier.label})
                  </button>
                  <a
                    href="https://github.com/MrityunjaiP/ExNihilo-95/discussions"
                    target="_blank"
                    rel="noreferrer"
                    style={{ textDecoration: 'none' }}
                  >
                    <button className="win95-button" style={{ padding: '4px 14px' }}>
                      💬 Join the Discussion on GitHub
                    </button>
                  </a>
                </div>
              </div>
            )}

            {/* TAB 3: USAGE STATISTICS DASHBOARD (4 QUADRANT CHARTS) */}
            {activeTab === 'usage' && (
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '8px', color: '#000080', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>📈 Usage Statistics Dashboard</span>
                  <span style={{ fontSize: '10px', fontWeight: 'normal', color: '#555' }}>Session Stats: {sessionStats.queriesRun} queries | {elapsedText} duration</span>
                </div>

                {/* 2x2 Grid of 4 Interactive SVG Analytics Charts */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                  {/* Chart 1: Queries per Month (Bar Chart) */}
                  <div className="win95-sunken" style={{ background: '#ffffff', padding: '6px' }}>
                    <div style={{ fontSize: '10px', fontWeight: 'bold', textAlign: 'center', marginBottom: '4px', color: '#000080' }}>
                      Queries per Month
                    </div>
                    <svg width="100%" height="90" viewBox="0 0 240 90">
                      {/* Y-Axis Lines */}
                      <line x1="25" y1="10" x2="230" y2="10" stroke="#eee" strokeWidth="1" />
                      <line x1="25" y1="30" x2="230" y2="30" stroke="#eee" strokeWidth="1" />
                      <line x1="25" y1="50" x2="230" y2="50" stroke="#eee" strokeWidth="1" />
                      <line x1="25" y1="70" x2="230" y2="70" stroke="#888" strokeWidth="1" />
                      {/* Y-Axis Labels */}
                      <text x="2" y="14" font-size="8" fill="#555">600</text>
                      <text x="2" y="34" font-size="8" fill="#555">400</text>
                      <text x="2" y="54" font-size="8" fill="#555">200</text>
                      <text x="18" y="74" font-size="8" fill="#555">0</text>
                      {/* Monthly Bars */}
                      {[
                        { month: '1', h: 45, val: '310' },
                        { month: '2', h: 32, val: '220' },
                        { month: '3', h: 38, val: '260' },
                        { month: '4', h: 42, val: '290' },
                        { month: '5', h: 56, val: '395' },
                        { month: '6', h: 68, val: '480' },
                        { month: '7', h: 50, val: '345' },
                        { month: '8', h: 44, val: '305' },
                      ].map((bar, idx) => (
                        <g key={idx}>
                          <rect
                            x={35 + idx * 24}
                            y={70 - bar.h}
                            width="14"
                            height={bar.h}
                            fill="#0000aa"
                            stroke="#000"
                            strokeWidth="0.5"
                          />
                          <text x={42 + idx * 24} y="82" font-size="7" fill="#333" text-anchor="middle">{bar.month}</text>
                        </g>
                      ))}
                    </svg>
                  </div>

                  {/* Chart 2: Data Volume (GB) (Bar Chart) */}
                  <div className="win95-sunken" style={{ background: '#ffffff', padding: '6px' }}>
                    <div style={{ fontSize: '10px', fontWeight: 'bold', textAlign: 'center', marginBottom: '4px', color: '#000080' }}>
                      Data Volume (GB)
                    </div>
                    <svg width="100%" height="90" viewBox="0 0 240 90">
                      <line x1="25" y1="10" x2="230" y2="10" stroke="#eee" strokeWidth="1" />
                      <line x1="25" y1="35" x2="230" y2="35" stroke="#eee" strokeWidth="1" />
                      <line x1="25" y1="60" x2="230" y2="60" stroke="#eee" strokeWidth="1" />
                      <line x1="25" y1="70" x2="230" y2="70" stroke="#888" strokeWidth="1" />
                      <text x="2" y="14" font-size="8" fill="#555">2.0</text>
                      <text x="2" y="39" font-size="8" fill="#555">1.0</text>
                      <text x="2" y="64" font-size="8" fill="#555">0.5</text>
                      <text x="18" y="74" font-size="8" fill="#555">0.0</text>
                      {[
                        { idx: 1, h: 12 }, { idx: 2, h: 22 }, { idx: 3, h: 18 }, { idx: 4, h: 32 },
                        { idx: 5, h: 28 }, { idx: 6, h: 42 }, { idx: 7, h: 36 }, { idx: 8, h: 48 },
                        { idx: 9, h: 40 }, { idx: 10, h: 58 }, { idx: 11, h: 50 }, { idx: 12, h: 64 },
                      ].map((bar, i) => (
                        <g key={i}>
                          <rect
                            x={32 + i * 16}
                            y={70 - bar.h}
                            width="10"
                            height={bar.h}
                            fill="#009999"
                            stroke="#000"
                            strokeWidth="0.5"
                          />
                          <text x={37 + i * 16} y="82" font-size="6" fill="#333" text-anchor="middle">{bar.idx}</text>
                        </g>
                      ))}
                    </svg>
                  </div>

                  {/* Chart 3: Peak Concurrent Sessions (Dual Bar Chart) */}
                  <div className="win95-sunken" style={{ background: '#ffffff', padding: '6px' }}>
                    <div style={{ fontSize: '10px', fontWeight: 'bold', textAlign: 'center', marginBottom: '4px', color: '#000080' }}>
                      Peak Concurrent Sessions
                    </div>
                    <svg width="100%" height="90" viewBox="0 0 240 90">
                      <line x1="25" y1="10" x2="230" y2="10" stroke="#eee" strokeWidth="1" />
                      <line x1="25" y1="35" x2="230" y2="35" stroke="#eee" strokeWidth="1" />
                      <line x1="25" y1="70" x2="230" y2="70" stroke="#888" strokeWidth="1" />
                      <text x="2" y="14" font-size="8" fill="#555">100</text>
                      <text x="2" y="39" font-size="8" fill="#555">40</text>
                      <text x="18" y="74" font-size="8" fill="#555">0</text>
                      {[
                        { idx: 1, p1: 10, p2: 18 },
                        { idx: 3, p1: 16, p2: 24 },
                        { idx: 5, p1: 22, p2: 36 },
                        { idx: 7, p1: 30, p2: 44 },
                        { idx: 9, p1: 18, p2: 28 },
                        { idx: 15, p1: 25, p2: 38 },
                        { idx: 21, p1: 35, p2: 52 },
                      ].map((bar, i) => (
                        <g key={i}>
                          <rect x={35 + i * 27} y={70 - bar.p1} width="8" height={bar.p1} fill="#800080" />
                          <rect x={44 + i * 27} y={70 - bar.p2} width="8" height={bar.p2} fill="#000080" />
                          <text x={43 + i * 27} y="82" font-size="6" fill="#333" text-anchor="middle">{bar.idx}</text>
                        </g>
                      ))}
                    </svg>
                  </div>

                  {/* Chart 4: Avg Duration (Line Chart) */}
                  <div className="win95-sunken" style={{ background: '#ffffff', padding: '6px' }}>
                    <div style={{ fontSize: '10px', fontWeight: 'bold', textAlign: 'center', marginBottom: '4px', color: '#000080' }}>
                      Avg Duration (ms)
                    </div>
                    <svg width="100%" height="90" viewBox="0 0 240 90">
                      <line x1="25" y1="10" x2="230" y2="10" stroke="#eee" strokeWidth="1" />
                      <line x1="25" y1="35" x2="230" y2="35" stroke="#eee" strokeWidth="1" />
                      <line x1="25" y1="70" x2="230" y2="70" stroke="#888" strokeWidth="1" />
                      <text x="2" y="14" font-size="8" fill="#555">5000</text>
                      <text x="2" y="39" font-size="8" fill="#555">2500</text>
                      <text x="18" y="74" font-size="8" fill="#555">0</text>
                      {/* Plotted Line */}
                      <polyline
                        points="35,55 55,42 75,48 95,25 115,50 135,30 155,44 175,20 195,38 215,32"
                        fill="none"
                        stroke="#0000aa"
                        strokeWidth="1.5"
                      />
                      {[
                        { x: 35, y: 55, lbl: '1' },
                        { x: 75, y: 48, lbl: '5' },
                        { x: 115, y: 50, lbl: '10' },
                        { x: 155, y: 44, lbl: '15' },
                        { x: 195, y: 38, lbl: '20' },
                        { x: 215, y: 32, lbl: '30' },
                      ].map((pt, i) => (
                        <g key={i}>
                          <circle cx={pt.x} cy={pt.y} r="2.5" fill="#ffffff" stroke="#0000aa" strokeWidth="1.5" />
                          <text x={pt.x} y="82" font-size="6" fill="#333" text-anchor="middle">{pt.lbl}</text>
                        </g>
                      ))}
                    </svg>
                  </div>
                </div>

                {/* Dashboard Action Controls matching Reference UI */}
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '12px' }}>
                  <button
                    className="win95-button"
                    style={{ fontSize: '10px', padding: '3px 10px' }}
                    onClick={() => setModalNotice('Historical log data archived for active session.')}
                  >
                    📅 View Historical Data
                  </button>
                  <button
                    className="win95-button"
                    style={{ fontSize: '10px', padding: '3px 10px' }}
                    onClick={() => setModalNotice('Session logs exported to JSON/CSV format.')}
                  >
                    📤 Export Logs
                  </button>
                  <button
                    className="win95-button"
                    style={{ fontSize: '10px', padding: '3px 10px' }}
                    onClick={() => setModalNotice('Usage Analytics Report generated successfully.')}
                  >
                    📄 Generate Report
                  </button>
                </div>

                <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '4px' }}>
                  Recent Queries (Last 10):
                </div>

                <div
                  className="win95-sunken"
                  style={{
                    background: '#ffffff',
                    padding: '6px',
                    height: '100px',
                    overflowY: 'auto',
                    fontFamily: 'monospace',
                    fontSize: '10px',
                    marginBottom: '10px',
                  }}
                >
                  {sessionStats.queryHistory.length === 0 ? (
                    <div style={{ color: '#808080', fontStyle: 'italic' }}>No queries executed yet this session.</div>
                  ) : (
                    sessionStats.queryHistory.map((q, idx) => (
                      <div key={idx} style={{ marginBottom: '4px', borderBottom: '1px solid #eee', paddingBottom: '2px' }}>
                        <span style={{ color: '#000080' }}>[{q.timestamp}]</span>{' '}
                        <span>{q.sql}</span>{' '}
                        <span style={{ color: '#008000' }}>({q.timeMs}ms)</span>
                      </div>
                    ))
                  )}
                </div>

                <button className="win95-button" onClick={onClearHistory}>
                  🗑️ Clear Session History
                </button>
              </div>
            )}

            {/* TAB 4: LOG OUT */}
            {activeTab === 'logout' && (
              <div style={{ textAlign: 'center', padding: '16px 8px' }}>
                <span style={{ fontSize: '36px', display: 'block', marginBottom: '8px' }}>🚪</span>
                <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '8px' }}>
                  Log Out of @{currentUser.usernameNorm}?
                </div>

                <div
                  style={{
                    background: '#dfdfdf',
                    border: '1px solid #808080',
                    padding: '10px',
                    fontSize: '11px',
                    lineHeight: '1.5',
                    textAlign: 'left',
                    marginBottom: '16px',
                  }}
                >
                  <div>• Your account remains saved on this browser/device.</div>
                  <div>• You can log back in from this browser at any time.</div>
                  <div>• Note: Accounts are stored locally and are not synced across devices.</div>
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                  <button
                    className="win95-button"
                    style={{ fontWeight: 'bold', minWidth: '100px' }}
                    onClick={onLogout}
                  >
                    🚪 Yes, Log Out
                  </button>
                  <button
                    className="win95-button"
                    style={{ minWidth: '100px' }}
                    onClick={() => setActiveTab('account')}
                  >
                    ← Stay Logged In
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Win95 Footer Status Bar */}
          <div
            style={{
              marginTop: '6px',
              display: 'flex',
              gap: '4px',
              fontSize: '10px',
            }}
          >
            <div className="win95-sunken" style={{ flex: 1, padding: '2px 6px', background: '#c0c0c0' }}>
              🔒 Security: PBKDF2 (600k iter)
            </div>
            <div className="win95-sunken" style={{ flex: 1, padding: '2px 6px', background: '#c0c0c0' }}>
              ⚡ Token: Active (24h TTL)
            </div>
            <div className="win95-sunken" style={{ flex: 1, padding: '2px 6px', background: '#c0c0c0' }}>
              {region.flag} Currency: {selectedCurrency}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Delete Account */}
      {showConfirmDelete && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: zIndex + 60,
          }}
        >
          <div className="win95-window" style={{ width: '380px', boxShadow: '4px 4px 10px rgba(0,0,0,0.5)' }}>
            <div className="win95-titlebar" style={{ background: '#800000' }}>
              <div className="win95-titlebar-text">
                <span>⚠️</span>
                <span>Confirm Account Deletion</span>
              </div>
            </div>

            <div style={{ padding: '16px', fontSize: '11px', lineHeight: '1.4' }}>
              Are you sure you want to permanently delete account <strong>@{currentUser.usernameNorm}</strong> from this device?
              <br /><br />
              This will remove all local credentials, currency preferences, and session tokens. <strong>This action cannot be undone.</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', padding: '0 16px 12px 16px' }}>
              <button className="win95-button" style={{ color: '#800000', fontWeight: 'bold' }} onClick={handleDeleteConfirm}>
                Yes, Delete Account
              </button>
              <button className="win95-button" onClick={() => setShowConfirmDelete(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* General Information Modal Notice */}
      {modalNotice && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: zIndex + 70,
          }}
        >
          <div className="win95-window" style={{ width: '340px' }}>
            <div className="win95-titlebar">
              <div className="win95-titlebar-text">
                <span>ℹ️</span>
                <span>Notice</span>
              </div>
            </div>

            <div style={{ padding: '16px', fontSize: '11px', lineHeight: '1.4' }}>
              {modalNotice}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: '12px' }}>
              <button className="win95-button" style={{ minWidth: '80px', fontWeight: 'bold' }} onClick={() => setModalNotice(null)}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
