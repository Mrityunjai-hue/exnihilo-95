/**
 * AdminDashboard.tsx — Windows 95 Account & Admin Control Panel
 */

import React, { useState, useEffect } from 'react';
import { useDraggable } from '../../hooks/useDraggable';
import { StoredUser, ActiveSession } from '../../hooks/useAuth';
import { useRegionalPricing } from '../../hooks/useRegionalPricing';
import { PRO_PRICING } from '../../config/pricing';

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

  const { position, handleMouseDown } = useDraggable({ x: 180, y: 60 });

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

  return (
    <>
      <div
        className="win95-window"
        style={{
          position: 'absolute',
          top: `${position.y}px`,
          left: `${position.x}px`,
          width: '580px',
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
          <div className="win95-titlebar-controls">
            <button
              className="win95-btn-titlebar"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
            >
              ✕
            </button>
          </div>
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
            style={{ padding: '14px', background: '#c0c0c0', minHeight: '300px', maxHeight: '420px', overflowY: 'auto' }}
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
                        <td style={{ fontWeight: 'bold', width: '130px', padding: '4px 0' }}>Display Name:</td>
                        <td>{currentUser.displayName}</td>
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
                          {pricingTier.label} {pricingTier.usdRef && <span style={{ color: '#555' }}>({pricingTier.usdRef})</span>}
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

            {/* TAB 2: UPGRADE TO PRO */}
            {activeTab === 'pro' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ fontSize: '11px' }}>
                    Region: <strong>{region.flag} {region.countryName}</strong>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px' }}>
                    <label>Currency:</label>
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

                {/* Pricing Banner */}
                <div
                  style={{
                    background: '#000080',
                    color: '#ffffff',
                    padding: '10px',
                    textAlign: 'center',
                    marginBottom: '12px',
                    border: '2px outset #dfdfdf',
                  }}
                >
                  <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>
                    ExNihilo 95 Pro Tier — {pricingTier.label}
                  </div>
                  <div style={{ fontSize: '10px', color: '#c0c0c0' }}>
                    {pricingTier.usdRef ? `Reference: ${pricingTier.usdRef} | ` : ''}Prices shown for reference only. Actual billing currency confirmed at checkout.
                  </div>
                </div>

                {/* Comparison Matrix */}
                <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse', marginBottom: '14px' }}>
                  <thead>
                    <tr style={{ background: '#808080', color: '#fff' }}>
                      <th style={{ padding: '4px', textAlign: 'left' }}>Feature</th>
                      <th style={{ padding: '4px', textAlign: 'center', width: '90px' }}>Base (Free)</th>
                      <th style={{ padding: '4px', textAlign: 'center', width: '90px' }}>Pro Tier</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ background: '#dfdfdf' }}>
                      <td style={{ padding: '4px' }}>SQL Engine & Query Tabs</td>
                      <td style={{ padding: '4px', textAlign: 'center' }}>✓ Full</td>
                      <td style={{ padding: '4px', textAlign: 'center' }}>✓ Full</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '4px' }}>Multi-Dialect Translation</td>
                      <td style={{ padding: '4px', textAlign: 'center' }}>✓ 4 Dialects</td>
                      <td style={{ padding: '4px', textAlign: 'center' }}>✓ All + Custom</td>
                    </tr>
                    <tr style={{ background: '#dfdfdf' }}>
                      <td style={{ padding: '4px' }}>Cloud Database Integration</td>
                      <td style={{ padding: '4px', textAlign: 'center' }}>✕ Local only</td>
                      <td style={{ padding: '4px', textAlign: 'center' }}>🔜 Coming Soon</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '4px' }}>Cross-Device Cloud Sync</td>
                      <td style={{ padding: '4px', textAlign: 'center' }}>✕ Device only</td>
                      <td style={{ padding: '4px', textAlign: 'center' }}>🔜 Coming Soon</td>
                    </tr>
                    <tr style={{ background: '#dfdfdf' }}>
                      <td style={{ padding: '4px' }}>AI Query Generator & Copilot</td>
                      <td style={{ padding: '4px', textAlign: 'center' }}>✕ None</td>
                      <td style={{ padding: '4px', textAlign: 'center' }}>🔜 Coming Soon</td>
                    </tr>
                  </tbody>
                </table>

                {/* Upgrade CTAs */}
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                  <button
                    className="win95-button"
                    style={{ fontWeight: 'bold', padding: '4px 12px' }}
                    onClick={() => setModalNotice('Pro Tier upgrades are coming soon! Stay tuned.')}
                  >
                    🚀 Upgrade to Pro ({pricingTier.label})
                  </button>
                  <a
                    href="https://github.com/MrityunjaiP/ExNihilo-95/discussions"
                    target="_blank"
                    rel="noreferrer"
                    style={{ textDecoration: 'none' }}
                  >
                    <button className="win95-button" style={{ padding: '4px 12px' }}>
                      💬 Join the Discussion on GitHub
                    </button>
                  </a>
                </div>
              </div>
            )}

            {/* TAB 3: USAGE */}
            {activeTab === 'usage' && (
              <div>
                <fieldset style={{ border: '1px solid #808080', padding: '10px', marginBottom: '12px' }}>
                  <legend style={{ fontSize: '11px', fontWeight: 'bold', padding: '0 4px' }}>
                    Current Engine Settings
                  </legend>
                  <div style={{ fontSize: '11px', lineHeight: '1.6' }}>
                    <div>Rows per table limit: <strong>20</strong> (configurable up to 100 in Settings)</div>
                    <div>Max tables per session: <strong>25</strong> (configurable up to 50 in Settings)</div>
                    <div>Default SQL Dialect: <strong>MySQL</strong></div>
                  </div>
                </fieldset>

                <fieldset style={{ border: '1px solid #808080', padding: '10px', marginBottom: '12px' }}>
                  <legend style={{ fontSize: '11px', fontWeight: 'bold', padding: '0 4px' }}>
                    Active Session Activity
                  </legend>
                  <div style={{ fontSize: '11px', lineHeight: '1.6' }}>
                    <div>Total Queries Executed: <strong>{sessionStats.queriesRun}</strong></div>
                    <div>Total Rows Generated: <strong>{sessionStats.rowsGenerated}</strong></div>
                    <div>Session Duration: <strong>{elapsedText}</strong></div>
                  </div>
                </fieldset>

                <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '4px' }}>
                  Recent Queries (Last 10):
                </div>

                <div
                  className="win95-sunken"
                  style={{
                    background: '#ffffff',
                    padding: '6px',
                    height: '110px',
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
