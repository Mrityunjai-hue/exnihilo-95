/**
 * AuthWindow.tsx — Authentic Windows 95 Login & Sign Up Dialog
 * Features Win95 segmented password strength meter, avatar selector, caps lock detection, and status bar.
 */

import React, { useState, useEffect } from 'react';
import { useDraggable } from '../../hooks/useDraggable';
import { StoredUser } from '../../hooks/useAuth';
import { WindowControls } from './WindowControls';
import { useTheme } from '../../hooks/useTheme';

interface AuthWindowProps {
  isOpen: boolean;
  zIndex: number;
  isSecureContext: boolean;
  onClose: () => void;
  onFocus: () => void;
  isMinimized?: boolean;
  onMinimize?: () => void;
  onSignUp: (
    fullName: string,
    username: string,
    email: string,
    pass: string,
    avatar?: string
  ) => Promise<{ success: boolean; error?: string }>;
  onLogin: (
    username: string,
    pass: string
  ) => Promise<{ success: boolean; error?: string }>;
  currentUser: StoredUser | null;
}

const AVATAR_OPTIONS = ['💻', '🧙‍♂️', '💾', '🕹️', '⚡', '⚙️', '🛡️', '✨'];

export const AuthWindow: React.FC<AuthWindowProps> = ({
  isOpen,
  zIndex,
  isSecureContext,
  onClose,
  onFocus,
  isMinimized = false,
  onMinimize,
  onSignUp,
  onLogin,
  currentUser,
}) => {
  const { activeTheme } = useTheme();
  const isMac = activeTheme === 'macos-glass';
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');

  // Sign Up form state
  const [signUpName, setSignUpName] = useState('');
  const [signUpUser, setSignUpUser] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPass, setSignUpPass] = useState('');
  const [signUpConfirm, setSignUpConfirm] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('💻');

  // Login form state
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorModalText, setErrorModalText] = useState<string | null>(null);
  const [capsLockOn, setCapsLockOn] = useState(false);

  const { position, handleMouseDown } = useDraggable({ x: 200, y: 80 });

  // Caps Lock Listener
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.getModifierState) {
        setCapsLockOn(e.getModifierState('CapsLock'));
      }
    };
    window.addEventListener('keydown', handleKey);
    window.addEventListener('keyup', handleKey);
    return () => {
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('keyup', handleKey);
    };
  }, []);

  if (!isOpen || isMinimized) return null;

  const handleClose = () => {
    setErrorModalText(null);
    onClose();
  };

  // Password Strength Score (0 to 4)
  const calculatePasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: 'None', color: '#808080' };
    let score = 0;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/\d/.test(pass)) score += 1;
    if (/[!@#$%^&*()_+\-=[\]{}]/.test(pass)) score += 1;

    switch (score) {
      case 1: return { score: 1, label: 'Weak', color: '#800000' };
      case 2: return { score: 2, label: 'Fair', color: '#808000' };
      case 3: return { score: 3, label: 'Strong', color: '#000080' };
      case 4: return { score: 4, label: 'Very Strong', color: '#008000' };
      default: return { score: 0, label: 'Too Short', color: '#800000' };
    }
  };

  const strength = calculatePasswordStrength(signUpPass);

  // Submit Sign Up
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || isLoading) return;
    setIsSubmitting(true);

    try {
      if (!isSecureContext) {
        setErrorModalText('Secure Connection Required: Account features require HTTPS. Please access via https://exnihilo-95.vercel.app');
        return;
      }

      if (signUpPass !== signUpConfirm) {
        setErrorModalText('Passwords do not match.');
        return;
      }

      setIsLoading(true);
      const res = await onSignUp(signUpName, signUpUser, signUpEmail, signUpPass, selectedAvatar);
      setIsLoading(false);

      if (!res.success) {
        setErrorModalText(res.error || 'Registration failed.');
      } else {
        handleClose();
      }
    } finally {
      setIsLoading(false);
      setIsSubmitting(false);
    }
  };

  // Submit Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || isLoading) return;
    setIsSubmitting(true);

    try {
      if (!isSecureContext) {
        setErrorModalText('Secure Connection Required: Account features require HTTPS. Please access via https://exnihilo-95.vercel.app');
        return;
      }

      setIsLoading(true);
      const res = await onLogin(loginUser, loginPass);
      setIsLoading(false);

      if (!res.success) {
        setErrorModalText(res.error || 'Login failed.');
      } else {
        handleClose();
      }
    } finally {
      setIsLoading(false);
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div
        id="auth-window"
        className="win95-window"
        style={{
          position: 'absolute',
          top: `${position.y}px`,
          left: `${position.x}px`,
          width: '450px',
          maxWidth: '96vw',
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
            <span>🔑</span>
            <span>ExNihilo User Authentication</span>
          </div>
          <WindowControls
            showMinimize={true}
            showMaximize={false}
            onMinimize={onMinimize}
            onClose={handleClose}
          />
        </div>

        {/* Dialog Body */}
        <div style={{ padding: isMac ? '20px' : '8px' }}>
          {isMac ? (
            /* Apple ID Style Clean Profile Hero */
            <div style={{ textAlign: 'center', marginBottom: '14px' }}>
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '16px',
                  background: 'rgba(56, 189, 248, 0.16)',
                  border: '1px solid rgba(56, 189, 248, 0.35)',
                  boxShadow: '0 8px 24px rgba(56, 189, 248, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '28px',
                  marginBottom: '8px',
                }}
              >
                {selectedAvatar || '💻'}
              </div>
              <div style={{ fontWeight: 700, fontSize: '16px', color: '#f8fafc', letterSpacing: '-0.01em' }}>
                {activeTab === 'login' ? 'Sign In to ExNihilo' : 'Create Local Account'}
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                {activeTab === 'login'
                  ? 'Enter your credentials to unlock local schemas'
                  : 'Single-device local keychain with PBKDF2 encryption'}
              </div>

              {/* Apple Segmented Pill Switcher */}
              <div
                style={{
                  display: 'flex',
                  background: 'rgba(0, 0, 0, 0.35)',
                  padding: '3px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  margin: '14px auto 0 auto',
                  maxWidth: '320px',
                }}
              >
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  style={{
                    flex: 1,
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: activeTab === 'login' ? 600 : 500,
                    color: activeTab === 'login' ? '#ffffff' : '#94a3b8',
                    background: activeTab === 'login' ? 'rgba(255, 255, 255, 0.16)' : 'transparent',
                    borderRadius: '7px',
                    border: 'none',
                    boxShadow: activeTab === 'login' ? '0 2px 6px rgba(0,0,0,0.3)' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  Log In
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('signup')}
                  style={{
                    flex: 1,
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: activeTab === 'signup' ? 600 : 500,
                    color: activeTab === 'signup' ? '#ffffff' : '#94a3b8',
                    background: activeTab === 'signup' ? 'rgba(255, 255, 255, 0.16)' : 'transparent',
                    borderRadius: '7px',
                    border: 'none',
                    boxShadow: activeTab === 'signup' ? '0 2px 6px rgba(0,0,0,0.3)' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  Create Account
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Header Banner */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '8px 12px',
                  marginBottom: '8px',
                  background: 'linear-gradient(90deg, #000080 0%, #1084d0 100%)',
                  color: '#ffffff',
                  border: '2px inset #dfdfdf',
                }}
              >
                <span style={{ fontSize: '26px' }}>{selectedAvatar || '💻'}</span>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '13px' }}>ExNihilo 95 Security Logon</div>
                  <div style={{ fontSize: '10px', color: '#dfdfdf' }}>
                    Single-Device PBKDF2 Local Auth System
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="win95-tabs">
                <div
                  className={`win95-tab ${activeTab === 'login' ? 'active' : ''}`}
                  onClick={() => setActiveTab('login')}
                >
                  Log In
                </div>
                <div
                  className={`win95-tab ${activeTab === 'signup' ? 'active' : ''}`}
                  onClick={() => setActiveTab('signup')}
                >
                  Create Account
                </div>
              </div>
            </>
          )}

          {/* Secure Context Warning if HTTP */}
          {!isSecureContext && (
            <div
              style={{
                background: '#ffcccc',
                border: '1px solid #ff0000',
                padding: '6px 10px',
                marginBottom: '8px',
                fontSize: '11px',
                color: '#990000',
                fontWeight: 'bold',
                borderRadius: isMac ? '8px' : '0',
              }}
            >
              ⛔ Warning: Plain HTTP connection detected. WebCrypto features are disabled. Please use HTTPS.
            </div>
          )}

          {/* Tab Inset Content */}
          <div
            className={isMac ? '' : 'win95-inset'}
            style={{
              padding: isMac ? '4px 0' : '16px',
              background: isMac ? 'transparent' : 'var(--w95-sunken-bg, #c0c0c0)',
              color: 'var(--w95-text-color, #000000)',
              minHeight: isMac ? 'auto' : '260px',
              borderRadius: isMac ? '12px' : '0',
            }}
          >
            {activeTab === 'login' ? (
              <form onSubmit={handleLoginSubmit} autoComplete="on">
                <div style={{ fontSize: isMac ? '12px' : '11px', marginBottom: '14px', color: isMac ? '#94a3b8' : undefined }}>
                  Enter your credentials to log in on this device:
                </div>

                <div style={{ marginBottom: isMac ? '14px' : '10px' }}>
                  <label htmlFor="loginUser" style={{ display: 'block', marginBottom: '4px', fontSize: isMac ? '12px' : '11px', fontWeight: 600 }}>
                    Username:
                  </label>
                  <input
                    id="loginUser"
                    type="text"
                    maxLength={20}
                    value={loginUser}
                    onChange={(e) => setLoginUser(e.target.value)}
                    className="win95-sunken"
                    style={{
                      width: '100%',
                      padding: isMac ? '6px 12px' : '4px',
                      fontSize: isMac ? '12px' : '11px',
                      height: isMac ? '34px' : 'auto',
                      borderRadius: isMac ? '8px' : '0',
                      boxSizing: 'border-box',
                    }}
                    placeholder="e.g. mrityunjai"
                    autoComplete="username"
                    disabled={isSubmitting || isLoading}
                  />
                </div>

                <div style={{ marginBottom: isMac ? '16px' : '14px' }}>
                  <label htmlFor="loginPass" style={{ display: 'block', marginBottom: '4px', fontSize: isMac ? '12px' : '11px', fontWeight: 600 }}>
                    Password:
                  </label>
                  <input
                    id="loginPass"
                    type="password"
                    maxLength={128}
                    value={loginPass}
                    onChange={(e) => setLoginPass(e.target.value)}
                    className="win95-sunken"
                    style={{
                      width: '100%',
                      padding: isMac ? '6px 12px' : '4px',
                      fontSize: isMac ? '12px' : '11px',
                      height: isMac ? '34px' : 'auto',
                      borderRadius: isMac ? '8px' : '0',
                      boxSizing: 'border-box',
                    }}
                    autoComplete="current-password"
                    disabled={isSubmitting || isLoading}
                  />
                </div>

                {capsLockOn && (
                  <div style={{ color: isMac ? '#f87171' : '#800000', fontSize: '11px', fontWeight: 600, marginBottom: '8px' }}>
                    ⚠️ CAPS LOCK is ON
                  </div>
                )}

                {isLoading && (
                  <div style={{ fontStyle: 'italic', color: isMac ? '#38bdf8' : '#000080', fontSize: '11px', marginBottom: '8px' }}>
                    ⏳ Verifying credentials (PBKDF2 600k iterations), please wait…
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
                  <button
                    type="submit"
                    className={`win95-button ${isMac ? 'mac-button-primary' : ''}`}
                    style={{
                      minWidth: isMac ? '100px' : '90px',
                      fontWeight: 600,
                      height: isMac ? '34px' : 'auto',
                      borderRadius: isMac ? '8px' : '0',
                      cursor: 'pointer',
                    }}
                    disabled={isSubmitting || isLoading || !isSecureContext}
                  >
                    {isLoading ? 'Wait...' : 'Log In'}
                  </button>
                  <button
                    type="button"
                    className="win95-button"
                    style={{
                      minWidth: '80px',
                      height: isMac ? '34px' : 'auto',
                      borderRadius: isMac ? '8px' : '0',
                      background: isMac ? 'rgba(255, 255, 255, 0.08)' : undefined,
                      color: isMac ? '#cbd5e1' : undefined,
                      border: isMac ? '1px solid rgba(255, 255, 255, 0.16)' : undefined,
                      cursor: 'pointer',
                    }}
                    onClick={handleClose}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSignUpSubmit} autoComplete="off">
                {/* Avatar Choice */}
                <div style={{ marginBottom: isMac ? '14px' : '8px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: isMac ? '12px' : '10px', fontWeight: 600, color: isMac ? '#94a3b8' : undefined }}>
                    Choose Avatar:
                  </label>
                  <div style={{ display: 'flex', gap: isMac ? '8px' : '6px', flexWrap: 'wrap' }}>
                    {AVATAR_OPTIONS.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setSelectedAvatar(icon)}
                        style={{
                          fontSize: isMac ? '16px' : '14px',
                          width: isMac ? '36px' : 'auto',
                          height: isMac ? '36px' : 'auto',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: isMac ? '10px' : '0',
                          padding: isMac ? '0' : '2px 4px',
                          border: isMac
                            ? selectedAvatar === icon
                              ? '2px solid #38bdf8'
                              : '1px solid rgba(255, 255, 255, 0.14)'
                            : selectedAvatar === icon
                            ? '2px inset #000'
                            : '2px outset #fff',
                          background: isMac
                            ? selectedAvatar === icon
                              ? 'rgba(56, 189, 248, 0.22)'
                              : 'rgba(255, 255, 255, 0.06)'
                            : selectedAvatar === icon
                            ? '#dfdfdf'
                            : '#c0c0c0',
                          boxShadow: isMac && selectedAvatar === icon
                            ? '0 0 10px rgba(56, 189, 248, 0.35)'
                            : undefined,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: isMac ? '12px' : '6px' }}>
                  <label htmlFor="signUpName" style={{ display: 'block', marginBottom: '4px', fontSize: isMac ? '12px' : '10px', fontWeight: 600 }}>
                    Full Name:
                  </label>
                  <input
                    id="signUpName"
                    type="text"
                    maxLength={100}
                    value={signUpName}
                    onChange={(e) => setSignUpName(e.target.value)}
                    className="win95-sunken"
                    style={{
                      width: '100%',
                      padding: isMac ? '7px 12px' : '3px',
                      fontSize: isMac ? '12px' : '11px',
                      height: isMac ? '34px' : 'auto',
                      borderRadius: isMac ? '8px' : '0',
                      boxSizing: 'border-box',
                    }}
                    placeholder="e.g. Mrityunjai Kumar"
                    autoComplete="name"
                    disabled={isSubmitting || isLoading}
                  />
                </div>

                <div style={{ marginBottom: isMac ? '12px' : '6px' }}>
                  <label htmlFor="signUpUser" style={{ display: 'block', marginBottom: '4px', fontSize: isMac ? '12px' : '10px', fontWeight: 600 }}>
                    Username (3-20 chars, letters/numbers/_):
                  </label>
                  <input
                    id="signUpUser"
                    type="text"
                    maxLength={20}
                    value={signUpUser}
                    onChange={(e) => setSignUpUser(e.target.value)}
                    className="win95-sunken"
                    style={{
                      width: '100%',
                      padding: isMac ? '7px 12px' : '3px',
                      fontSize: isMac ? '12px' : '11px',
                      height: isMac ? '34px' : 'auto',
                      borderRadius: isMac ? '8px' : '0',
                      boxSizing: 'border-box',
                    }}
                    placeholder="e.g. mrityunjai"
                    autoComplete="username"
                    disabled={isSubmitting || isLoading}
                  />
                </div>

                <div style={{ marginBottom: isMac ? '12px' : '6px' }}>
                  <label htmlFor="signUpContactEmail" style={{ display: 'block', marginBottom: '4px', fontSize: isMac ? '12px' : '10px', fontWeight: 600 }}>
                    Contact Email <span style={{ color: isMac ? '#94a3b8' : '#800000', fontSize: isMac ? '11px' : '9px', fontWeight: 'normal' }}>({isMac ? 'optional' : 'unverified string'})</span>:
                  </label>
                  <input
                    id="signUpContactEmail"
                    name="nihilo_contact_id_field"
                    type="text"
                    inputMode="email"
                    maxLength={255}
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    className="win95-sunken"
                    style={{
                      width: '100%',
                      padding: isMac ? '7px 12px' : '3px',
                      fontSize: isMac ? '12px' : '11px',
                      height: isMac ? '34px' : 'auto',
                      borderRadius: isMac ? '8px' : '0',
                      boxSizing: 'border-box',
                    }}
                    placeholder="name@example.com (optional)"
                    autoComplete="new-password"
                    data-lpignore="true"
                    data-1p-ignore="true"
                    data-bwignore="true"
                    data-form-type="other"
                    disabled={isSubmitting || isLoading}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', marginBottom: isMac ? '12px' : '6px' }}>
                  <div style={{ flex: 1 }}>
                    <label htmlFor="signUpPass" style={{ display: 'block', marginBottom: '4px', fontSize: isMac ? '12px' : '10px', fontWeight: 600 }}>
                      Password:
                    </label>
                    <input
                      id="signUpPass"
                      type="password"
                      maxLength={128}
                      value={signUpPass}
                      onChange={(e) => setSignUpPass(e.target.value)}
                      className="win95-sunken"
                      style={{
                        width: '100%',
                        padding: isMac ? '7px 12px' : '3px',
                        fontSize: isMac ? '12px' : '11px',
                        height: isMac ? '34px' : 'auto',
                        borderRadius: isMac ? '8px' : '0',
                        boxSizing: 'border-box',
                      }}
                      placeholder="≥10 chars, mixed case"
                      autoComplete="new-password"
                      disabled={isSubmitting || isLoading}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label htmlFor="signUpConfirm" style={{ display: 'block', marginBottom: '4px', fontSize: isMac ? '12px' : '10px', fontWeight: 600 }}>
                      Confirm:
                    </label>
                    <input
                      id="signUpConfirm"
                      type="password"
                      maxLength={128}
                      value={signUpConfirm}
                      onChange={(e) => setSignUpConfirm(e.target.value)}
                      className="win95-sunken"
                      style={{
                        width: '100%',
                        padding: isMac ? '7px 12px' : '3px',
                        fontSize: isMac ? '12px' : '11px',
                        height: isMac ? '34px' : 'auto',
                        borderRadius: isMac ? '8px' : '0',
                        boxSizing: 'border-box',
                      }}
                      autoComplete="new-password"
                      disabled={isSubmitting || isLoading}
                    />
                  </div>
                </div>

                {/* Segmented Password Strength Bar */}
                {signUpPass.length > 0 && (
                  <div style={{ marginBottom: isMac ? '14px' : '10px', fontSize: isMac ? '11px' : '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                      <span style={{ color: isMac ? '#94a3b8' : undefined }}>Strength:</span>
                      <span style={{ fontWeight: 600, color: strength.color }}>{strength.label}</span>
                    </div>
                    <div
                      className="win95-sunken"
                      style={{
                        background: isMac ? 'rgba(0, 0, 0, 0.4)' : '#ffffff',
                        height: isMac ? '6px' : '10px',
                        padding: '1px',
                        display: 'flex',
                        gap: '3px',
                        borderRadius: isMac ? '4px' : '0',
                        overflow: 'hidden',
                      }}
                    >
                      {[1, 2, 3, 4].map((step) => (
                        <div
                          key={step}
                          style={{
                            flex: 1,
                            background: step <= strength.score ? strength.color : (isMac ? 'rgba(255,255,255,0.08)' : '#dfdfdf'),
                            borderRadius: isMac ? '2px' : '0',
                            transition: 'background 0.2s ease',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {isLoading && (
                  <div style={{ fontStyle: 'italic', color: isMac ? '#38bdf8' : '#000080', fontSize: '11px', marginBottom: '8px' }}>
                    ⏳ Generating key (PBKDF2 600k iterations), please wait…
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '14px' }}>
                  <button
                    type="submit"
                    className={`win95-button ${isMac ? 'mac-button-primary' : ''}`}
                    style={{
                      minWidth: isMac ? '120px' : '95px',
                      height: isMac ? '34px' : 'auto',
                      borderRadius: isMac ? '8px' : '0',
                      cursor: 'pointer',
                    }}
                    disabled={isSubmitting || isLoading || !isSecureContext}
                  >
                    {isLoading ? 'Wait...' : 'Create Account'}
                  </button>
                  <button
                    type="button"
                    className="win95-button"
                    style={{
                      minWidth: '80px',
                      height: isMac ? '34px' : 'auto',
                      borderRadius: isMac ? '8px' : '0',
                      background: isMac ? 'rgba(255, 255, 255, 0.08)' : undefined,
                      color: isMac ? '#cbd5e1' : undefined,
                      border: isMac ? '1px solid rgba(255, 255, 255, 0.16)' : undefined,
                      cursor: 'pointer',
                    }}
                    onClick={handleClose}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Footer Status / Security Bar */}
          {isMac ? (
            <div
              style={{
                marginTop: '16px',
                paddingTop: '12px',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '11px',
                color: '#94a3b8',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🔒</span>
                <span>PBKDF2 (600,000 iter) • Local Keychain Only</span>
              </div>
              {capsLockOn && (
                <span style={{ color: '#f87171', fontWeight: 600 }}>⇪ CAPS LOCK ON</span>
              )}
            </div>
          ) : (
            <div
              style={{
                marginTop: '8px',
                display: 'flex',
                gap: '6px',
                fontSize: '11px',
              }}
            >
              <div
                className="win95-sunken"
                style={{
                  flex: 1,
                  padding: '2px 6px',
                  background: 'var(--w95-sunken-bg, #c0c0c0)',
                  color: 'var(--w95-text-color, #f8fafc)',
                }}
              >
                {isSecureContext ? '🔒 SSL Encrypted (Local)' : '⚠️ Plain HTTP'}
              </div>
              <div
                className="win95-sunken"
                style={{
                  flex: 1,
                  padding: '2px 6px',
                  background: 'var(--w95-sunken-bg, #c0c0c0)',
                  color: 'var(--w95-text-color, #f8fafc)',
                }}
              >
                PBKDF2 (600,000 iter)
              </div>
              <div
                className="win95-sunken"
                style={{
                  width: '65px',
                  padding: '2px 6px',
                  background: 'var(--w95-sunken-bg, #c0c0c0)',
                  color: capsLockOn ? '#800000' : '#808080',
                  textAlign: 'center',
                  fontWeight: capsLockOn ? 'bold' : 'normal',
                }}
              >
                {capsLockOn ? 'CAPS' : 'caps off'}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error Modal Dialog */}
      {errorModalText && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: isMac ? 'rgba(0, 0, 0, 0.6)' : 'rgba(0,0,0,0.3)',
            backdropFilter: isMac ? 'blur(8px)' : undefined,
            WebkitBackdropFilter: isMac ? 'blur(8px)' : undefined,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: zIndex + 50,
          }}
        >
          <div
            className="win95-window"
            style={{
              width: '380px',
              maxWidth: '92vw',
              padding: '0 0 16px 0',
              borderRadius: isMac ? '16px' : '0',
              boxShadow: isMac ? '0 20px 50px rgba(0, 0, 0, 0.6)' : '4px 4px 10px rgba(0,0,0,0.5)',
              border: isMac ? '1px solid rgba(255, 255, 255, 0.16)' : undefined,
              overflow: 'hidden',
            }}
          >
            <div className="win95-titlebar" style={{ background: isMac ? 'rgba(239, 68, 68, 0.2)' : '#800000' }}>
              <div className="win95-titlebar-text">
                <span>⛔</span>
                <span>{isMac ? 'Authentication Alert' : 'Error'}</span>
              </div>
              <div className="win95-titlebar-controls">
                <button
                  className="win95-btn-titlebar"
                  onClick={() => setErrorModalText(null)}
                  title="Close"
                  aria-label="Close Window"
                >
                  <span className="win95-control-glyph">✕</span>
                  <span className="mac-control-glyph">✕</span>
                </button>
              </div>
            </div>

            <div style={{ padding: '20px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '28px' }}>⛔</span>
              <div style={{ fontSize: '12px', lineHeight: '1.5', color: 'var(--w95-text-color, #f8fafc)' }}>
                {errorModalText}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                className="win95-button"
                style={{
                  minWidth: '90px',
                  fontWeight: 600,
                  height: isMac ? '32px' : 'auto',
                  borderRadius: isMac ? '8px' : '0',
                  background: isMac ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' : undefined,
                  color: isMac ? '#ffffff' : undefined,
                  cursor: 'pointer',
                }}
                onClick={() => setErrorModalText(null)}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
