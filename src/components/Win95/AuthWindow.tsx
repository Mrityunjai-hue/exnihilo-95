/**
 * AuthWindow.tsx — Authentic Windows 95 Login & Sign Up Dialog
 * Features Win95 segmented password strength meter, avatar selector, caps lock detection, and status bar.
 */

import React, { useState, useEffect } from 'react';
import { useDraggable } from '../../hooks/useDraggable';
import { StoredUser } from '../../hooks/useAuth';
import { WindowControls } from './WindowControls';

interface AuthWindowProps {
  isOpen: boolean;
  zIndex: number;
  isSecureContext: boolean;
  onClose: () => void;
  onFocus: () => void;
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
  onSignUp,
  onLogin,
  currentUser,
}) => {
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

  if (!isOpen) return null;

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
        className="win95-window"
        style={{
          position: 'absolute',
          top: `${position.y}px`,
          left: `${position.x}px`,
          width: '440px',
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
            showMinimize={false}
            showMaximize={false}
            onClose={handleClose}
          />
        </div>

        {/* Dialog Body */}
        <div style={{ padding: '8px' }}>
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
              }}
            >
              ⛔ Warning: Plain HTTP connection detected. WebCrypto features are disabled. Please use HTTPS.
            </div>
          )}

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

          {/* Tab Inset Content */}
          <div
            className="win95-inset"
            style={{ padding: '14px', background: 'var(--w95-gray, #c0c0c0)', color: 'var(--w95-text-color, #000000)', minHeight: '260px' }}
          >
            {activeTab === 'login' ? (
              <form onSubmit={handleLoginSubmit}>
                <div style={{ fontSize: '11px', marginBottom: '12px' }}>
                  Enter your credentials to log in on this device:
                </div>

                <div style={{ marginBottom: '10px' }}>
                  <label htmlFor="loginUser" style={{ display: 'block', marginBottom: '3px', fontSize: '11px', fontWeight: 'bold' }}>
                    Username:
                  </label>
                  <input
                    id="loginUser"
                    type="text"
                    maxLength={20}
                    value={loginUser}
                    onChange={(e) => setLoginUser(e.target.value)}
                    className="win95-sunken"
                    style={{ width: '100%', padding: '4px', fontSize: '11px', boxSizing: 'border-box' }}
                    placeholder="e.g. mrityunjai"
                    disabled={isSubmitting || isLoading}
                  />
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label htmlFor="loginPass" style={{ display: 'block', marginBottom: '3px', fontSize: '11px', fontWeight: 'bold' }}>
                    Password:
                  </label>
                  <input
                    id="loginPass"
                    type="password"
                    maxLength={128}
                    value={loginPass}
                    onChange={(e) => setLoginPass(e.target.value)}
                    className="win95-sunken"
                    style={{ width: '100%', padding: '4px', fontSize: '11px', boxSizing: 'border-box' }}
                    disabled={isSubmitting || isLoading}
                  />
                </div>

                {capsLockOn && (
                  <div style={{ color: '#800000', fontSize: '10px', fontWeight: 'bold', marginBottom: '8px' }}>
                    ⚠️ CAPS LOCK is ON
                  </div>
                )}

                {isLoading && (
                  <div style={{ fontStyle: 'italic', color: '#000080', fontSize: '11px', marginBottom: '8px' }}>
                    ⏳ Verifying credentials (PBKDF2 600k iterations), please wait…
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
                  <button
                    type="submit"
                    className="win95-button"
                    style={{ minWidth: '85px', fontWeight: 'bold' }}
                    disabled={isSubmitting || isLoading || !isSecureContext}
                  >
                    {isLoading ? 'Wait...' : 'Log In'}
                  </button>
                  <button type="button" className="win95-button" style={{ minWidth: '80px' }} onClick={handleClose}>
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSignUpSubmit}>
                {/* Avatar Choice */}
                <div style={{ marginBottom: '8px' }}>
                  <label style={{ display: 'block', marginBottom: '3px', fontSize: '10px', fontWeight: 'bold' }}>
                    Choose Vintage Avatar Icon:
                  </label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {AVATAR_OPTIONS.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setSelectedAvatar(icon)}
                        style={{
                          fontSize: '14px',
                          padding: '2px 4px',
                          border: selectedAvatar === icon ? '2px inset #000' : '2px outset #fff',
                          background: selectedAvatar === icon ? '#dfdfdf' : '#c0c0c0',
                          cursor: 'pointer',
                        }}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: '6px' }}>
                  <label htmlFor="signUpName" style={{ display: 'block', marginBottom: '2px', fontSize: '10px', fontWeight: 'bold' }}>
                    Full Name:
                  </label>
                  <input
                    id="signUpName"
                    type="text"
                    maxLength={100}
                    value={signUpName}
                    onChange={(e) => setSignUpName(e.target.value)}
                    className="win95-sunken"
                    style={{ width: '100%', padding: '3px', fontSize: '11px', boxSizing: 'border-box' }}
                    placeholder="e.g. Mrityunjai Kumar"
                    disabled={isSubmitting || isLoading}
                  />
                </div>

                <div style={{ marginBottom: '6px' }}>
                  <label htmlFor="signUpUser" style={{ display: 'block', marginBottom: '2px', fontSize: '10px', fontWeight: 'bold' }}>
                    Username (3-20 chars, letters/numbers/_):
                  </label>
                  <input
                    id="signUpUser"
                    type="text"
                    maxLength={20}
                    value={signUpUser}
                    onChange={(e) => setSignUpUser(e.target.value)}
                    className="win95-sunken"
                    style={{ width: '100%', padding: '3px', fontSize: '11px', boxSizing: 'border-box' }}
                    placeholder="e.g. mrityunjai"
                    disabled={isSubmitting || isLoading}
                  />
                </div>

                <div style={{ marginBottom: '6px' }}>
                  <label htmlFor="signUpEmail" style={{ display: 'block', marginBottom: '2px', fontSize: '10px', fontWeight: 'bold' }}>
                    Contact Email <span style={{ color: '#800000', fontSize: '9px' }}>(unverified string)</span>:
                  </label>
                  <input
                    id="signUpEmail"
                    type="email"
                    maxLength={255}
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    className="win95-sunken"
                    style={{ width: '100%', padding: '3px', fontSize: '11px', boxSizing: 'border-box' }}
                    placeholder="user@example.com"
                    disabled={isSubmitting || isLoading}
                  />
                </div>

                <div style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                  <div style={{ flex: 1 }}>
                    <label htmlFor="signUpPass" style={{ display: 'block', marginBottom: '2px', fontSize: '10px', fontWeight: 'bold' }}>
                      Password:
                    </label>
                    <input
                      id="signUpPass"
                      type="password"
                      maxLength={128}
                      value={signUpPass}
                      onChange={(e) => setSignUpPass(e.target.value)}
                      className="win95-sunken"
                      style={{ width: '100%', padding: '3px', fontSize: '11px', boxSizing: 'border-box' }}
                      placeholder="≥10 chars, mixed case"
                      disabled={isSubmitting || isLoading}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label htmlFor="signUpConfirm" style={{ display: 'block', marginBottom: '2px', fontSize: '10px', fontWeight: 'bold' }}>
                      Confirm:
                    </label>
                    <input
                      id="signUpConfirm"
                      type="password"
                      maxLength={128}
                      value={signUpConfirm}
                      onChange={(e) => setSignUpConfirm(e.target.value)}
                      className="win95-sunken"
                      style={{ width: '100%', padding: '3px', fontSize: '11px', boxSizing: 'border-box' }}
                      disabled={isSubmitting || isLoading}
                    />
                  </div>
                </div>

                {/* Retro Segmented Password Strength Bar */}
                {signUpPass.length > 0 && (
                  <div style={{ marginBottom: '10px', fontSize: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                      <span>Strength:</span>
                      <span style={{ fontWeight: 'bold', color: strength.color }}>{strength.label}</span>
                    </div>
                    <div
                      className="win95-sunken"
                      style={{ background: '#ffffff', height: '10px', padding: '1px', display: 'flex', gap: '2px' }}
                    >
                      {[1, 2, 3, 4].map((step) => (
                        <div
                          key={step}
                          style={{
                            flex: 1,
                            background: step <= strength.score ? strength.color : '#dfdfdf',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {isLoading && (
                  <div style={{ fontStyle: 'italic', color: '#000080', fontSize: '11px', marginBottom: '8px' }}>
                    ⏳ Generating key (PBKDF2 600k iterations), please wait…
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                  <button
                    type="submit"
                    className="win95-button"
                    style={{ minWidth: '95px', fontWeight: 'bold' }}
                    disabled={isSubmitting || isLoading || !isSecureContext}
                  >
                    {isLoading ? 'Wait...' : 'Create Account'}
                  </button>
                  <button type="button" className="win95-button" style={{ minWidth: '80px' }} onClick={handleClose}>
                    Cancel
                  </button>
                </div>
              </form>
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
              {isSecureContext ? '🔒 SSL Encrypted (Local)' : '⚠️ Plain HTTP'}
            </div>
            <div className="win95-sunken" style={{ flex: 1, padding: '2px 6px', background: '#c0c0c0' }}>
              PBKDF2 (600,000 iter)
            </div>
            <div className="win95-sunken" style={{ width: '65px', padding: '2px 6px', background: '#c0c0c0', textAlign: 'center', color: capsLockOn ? '#800000' : '#808080', fontWeight: capsLockOn ? 'bold' : 'normal' }}>
              {capsLockOn ? 'CAPS' : 'caps off'}
            </div>
          </div>
        </div>
      </div>

      {/* Win95 Error Modal Dialog */}
      {errorModalText && (
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
            zIndex: zIndex + 50,
          }}
        >
          <div
            className="win95-window"
            style={{ width: '360px', padding: '0 0 12px 0', boxShadow: '4px 4px 10px rgba(0,0,0,0.5)' }}
          >
            <div className="win95-titlebar" style={{ background: '#800000' }}>
              <div className="win95-titlebar-text">
                <span>⛔</span>
                <span>Error</span>
              </div>
              <div className="win95-titlebar-controls">
                <button className="win95-btn-titlebar" onClick={() => setErrorModalText(null)}>
                  ✕
                </button>
              </div>
            </div>

            <div style={{ padding: '16px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '28px' }}>⛔</span>
              <div style={{ fontSize: '11px', lineHeight: '1.4', color: '#000000' }}>
                {errorModalText}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                className="win95-button"
                style={{ minWidth: '80px', fontWeight: 'bold' }}
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
