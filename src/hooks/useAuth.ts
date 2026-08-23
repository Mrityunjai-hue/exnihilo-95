/**
 * src/hooks/useAuth.ts — Hardened Windows 95 Local-First Auth System
 *
 * Implements PBKDF2 (600k iterations, per-user salt), anti-spoofing session tokens,
 * cross-tab sync, secure context verification, brute-force lockout, and input normalization.
 */

import { useState, useEffect, useCallback } from 'react';

export interface StoredUser {
  usernameNorm:      string;
  displayName:       string;
  email:             string;
  joinDate:          string;
  avatar?:           string;
  tier:              'free';
  passwordRecord:    string; // "pbkdf2_hex:salt_hex"
  currentSessionId:  string | null;
  schemaVersion:     number;
}

export interface ActiveSession {
  usernameNorm: string;
  loginTime:    string;
  expiresAt:    string;
  sessionId:    string;
  schemaVersion: number;
}

export const RESERVED_USERNAMES = [
  '__proto__',
  'constructor',
  'prototype',
  'tostring',
  'valueof',
  'hasownproperty',
  'isprototypeof',
];

const MAX_ACCOUNTS_PER_DEVICE = 10;
const PBKDF2_ITERATIONS = 600_000;
const SCHEMA_VERSION = 1;

// Utility: convert Uint8Array to Hex string
function bufToHex(buf: Uint8Array): string {
  return Array.from(buf).map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Utility: parse Hex string back to Uint8Array
function hexToBuf(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

// PBKDF2 Password Hashing (Secure Context Required)
async function derivePbkdf2Hash(password: string, salt: Uint8Array): Promise<string> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );

  return bufToHex(new Uint8Array(derivedBits));
}

// Read all users from localStorage
function readUsers(): Record<string, StoredUser> {
  try {
    const raw = localStorage.getItem('exnihilo_users');
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

// Read raw session token
function readSession(): ActiveSession | null {
  try {
    const raw = localStorage.getItem('exnihilo_session');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function useAuth() {
  const [currentUser, setCurrentUser] = useState<StoredUser | null>(null);
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [isSecureContext, setIsSecureContext] = useState<boolean>(true);
  const [sessionExpiredNotice, setSessionExpiredNotice] = useState<boolean>(false);

  // Check secure context on mount
  useEffect(() => {
    const secure = typeof window !== 'undefined' && window.isSecureContext && !!window.crypto?.subtle;
    setIsSecureContext(secure);
  }, []);

  // Strict Read-Only Session Verification
  const verifySession = useCallback((): { user: StoredUser | null; session: ActiveSession | null } => {
    const session = readSession();
    if (!session) return { user: null, session: null };

    // Check expiration
    if (Date.now() > new Date(session.expiresAt).getTime()) {
      localStorage.removeItem('exnihilo_session');
      return { user: null, session: null };
    }

    const users = readUsers();
    const user = users[session.usernameNorm];

    // Verify Session ID anti-spoofing token match
    if (!user || !user.currentSessionId || session.sessionId !== user.currentSessionId) {
      localStorage.removeItem('exnihilo_session');
      return { user: null, session: null };
    }

    return { user, session };
  }, []);

  // Sync state on load
  const reloadSessionState = useCallback(() => {
    const { user, session } = verifySession();
    setCurrentUser(user);
    setActiveSession(session);
  }, [verifySession]);

  useEffect(() => {
    reloadSessionState();
  }, [reloadSessionState]);

  // Periodic 60-second expiration check while tab is open
  useEffect(() => {
    const interval = setInterval(() => {
      const session = readSession();
      if (session && Date.now() > new Date(session.expiresAt).getTime()) {
        localStorage.removeItem('exnihilo_session');
        setCurrentUser(null);
        setActiveSession(null);
        setSessionExpiredNotice(true);
      }
    }, 60_000);

    return () => clearInterval(interval);
  }, []);

  // Cross-Tab Sync via storage event
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'exnihilo_session') {
        if (e.newValue === null) {
          // Explicit logout from another tab — immediate local cleanup
          setCurrentUser(null);
          setActiveSession(null);
        } else {
          // Login/signup in another tab — read-only update (NO setItem calls!)
          reloadSessionState();
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [reloadSessionState]);

  // Lockout Helpers
  const checkLockout = (usernameNorm: string): number | null => {
    const lockoutKey = `exnihilo_lockout_${usernameNorm}`;
    const expiry = localStorage.getItem(lockoutKey);
    if (expiry) {
      const remainingMs = new Date(expiry).getTime() - Date.now();
      if (remainingMs > 0) {
        return Math.ceil(remainingMs / 60000);
      } else {
        localStorage.removeItem(lockoutKey);
      }
    }
    return null;
  };

  const registerFailedAttempt = (usernameNorm: string): boolean => {
    const attemptsKey = `exnihilo_attempts_${usernameNorm}`;
    const current = Number(localStorage.getItem(attemptsKey) || '0') + 1;
    if (current >= 5) {
      const lockoutExpiry = new Date(Date.now() + 5 * 60 * 1000).toISOString();
      localStorage.setItem(`exnihilo_lockout_${usernameNorm}`, lockoutExpiry);
      localStorage.removeItem(attemptsKey);
      return true; // Newly locked
    } else {
      localStorage.setItem(attemptsKey, String(current));
      return false;
    }
  };

  const clearLockout = (usernameNorm: string) => {
    localStorage.removeItem(`exnihilo_lockout_${usernameNorm}`);
    localStorage.removeItem(`exnihilo_attempts_${usernameNorm}`);
  };

  // ── Auth Actions ───────────────────────────────────────────────────────────

  // SIGN UP
  const signUp = async (
    rawFullName: string,
    rawUsername: string,
    rawEmail: string,
    rawPassword: string,
    avatar?: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!window.isSecureContext || !window.crypto?.subtle) {
      return { success: false, error: 'HTTPS connection is required for account operations.' };
    }

    const usernameNorm = rawUsername.trim().toLowerCase();
    const emailNorm = rawEmail.trim().toLowerCase();
    const displayName = rawFullName.trim();

    // Step 2: Account Limit Check
    const users = readUsers();
    if (Object.keys(users).length >= MAX_ACCOUNTS_PER_DEVICE) {
      return { success: false, error: 'Maximum device account limit reached (10). Delete an account to create a new one.' };
    }

    // Step 4: Prototype Pollution Blocklist Check
    if (RESERVED_USERNAMES.includes(usernameNorm)) {
      return { success: false, error: 'Invalid username.' };
    }

    // Step 6-8: Full Name Validation
    if (!displayName) return { success: false, error: 'Full Name is required.' };
    if (displayName.length > 100) return { success: false, error: 'Full Name must be 100 characters or fewer.' };
    if (!/^[a-zA-Z0-9\s.\-']+$/.test(displayName)) {
      return { success: false, error: 'Full Name may only contain letters, numbers, spaces, periods, hyphens, and apostrophes.' };
    }

    // Step 9-11: Username Validation
    if (!rawUsername.trim()) return { success: false, error: 'Username is required.' };
    if (usernameNorm.length < 3 || usernameNorm.length > 20) {
      return { success: false, error: 'Username must be 3–20 characters.' };
    }
    if (!/^[a-zA-Z0-9_]+$/.test(usernameNorm)) {
      return { success: false, error: 'Letters, numbers, and underscores only for Username.' };
    }

    // Step 12: Duplicate Username Check
    if (users[usernameNorm]) {
      return { success: false, error: 'Registration could not be completed. Please try a different username or email.' };
    }

    // Step 14-16: Email Validation
    if (!rawEmail.trim()) return { success: false, error: 'Email is required.' };
    if (emailNorm.length > 255) return { success: false, error: 'Email must be 255 characters or fewer.' };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNorm)) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    // Step 17: Duplicate Email Check
    const emailExists = Object.values(users).some((u) => u.email === emailNorm);
    if (emailExists) {
      return { success: false, error: 'Registration could not be completed. Please try a different username or email.' };
    }

    // Step 18-19: Password Validation
    if (!rawPassword) return { success: false, error: 'Password is required.' };
    if (rawPassword.length > 128) return { success: false, error: 'Password must be 128 characters or fewer.' };
    if (rawPassword.length < 10) return { success: false, error: 'Password must be at least 10 characters long.' };
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{}])/.test(rawPassword)) {
      return {
        success: false,
        error: 'Password must contain uppercase, lowercase, a number, and a special character (!@#$%^&*()_+-=[]{}).',
      };
    }

    // Step 20: Thread Yield to Paint UI Loading Label
    await new Promise<void>((resolve) => setTimeout(resolve, 10));

    // Step 21: PBKDF2 Hash with Fresh Salt
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const saltHex = bufToHex(salt);
    const pbkdf2HashHex = await derivePbkdf2Hash(rawPassword, salt);
    const passwordRecord = `${pbkdf2HashHex}:${saltHex}`;

    const sessionId = crypto.randomUUID();
    const nowIso = new Date().toISOString();
    const expiresIso = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const newUser: StoredUser = {
      usernameNorm,
      displayName,
      email: emailNorm,
      joinDate: nowIso.split('T')[0],
      avatar: avatar || '💻',
      tier: 'free',
      passwordRecord,
      currentSessionId: sessionId,
      schemaVersion: SCHEMA_VERSION,
    };

    const newSession: ActiveSession = {
      usernameNorm,
      loginTime: nowIso,
      expiresAt: expiresIso,
      sessionId,
      schemaVersion: SCHEMA_VERSION,
    };

    // Save to storage
    users[usernameNorm] = newUser;
    localStorage.setItem('exnihilo_users', JSON.stringify(users));
    localStorage.setItem('exnihilo_session', JSON.stringify(newSession));

    setCurrentUser(newUser);
    setActiveSession(newSession);

    return { success: true };
  };

  // LOGIN
  const login = async (
    rawUsername: string,
    rawPassword: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!window.isSecureContext || !window.crypto?.subtle) {
      return { success: false, error: 'HTTPS connection is required for account operations.' };
    }

    const usernameNorm = rawUsername.trim().toLowerCase();

    // Lockout check
    const remainingMin = checkLockout(usernameNorm);
    if (remainingMin !== null) {
      return { success: false, error: `Too many failed login attempts. Account locked for ${remainingMin} minute(s).` };
    }

    if (!usernameNorm) return { success: false, error: 'Please enter your username.' };
    if (!rawPassword) return { success: false, error: 'Please enter your password.' };
    if (rawPassword.length > 128) return { success: false, error: 'Password length exceeds 128 characters.' };

    const users = readUsers();
    const user = users[usernameNorm];

    if (!user) {
      const lockedNow = registerFailedAttempt(usernameNorm);
      return {
        success: false,
        error: lockedNow
          ? 'Too many failed login attempts. Account locked for 5 minutes.'
          : 'Incorrect username or password.',
      };
    }

    // Thread Yield
    await new Promise<void>((resolve) => setTimeout(resolve, 10));

    // Extract existing salt and derive hash
    const parts = user.passwordRecord.split(':');
    if (parts.length !== 2) {
      return { success: false, error: 'Incorrect username or password.' };
    }
    const [storedHashHex, saltHex] = parts;
    const salt = hexToBuf(saltHex);
    const derivedHashHex = await derivePbkdf2Hash(rawPassword, salt);

    if (derivedHashHex !== storedHashHex) {
      const lockedNow = registerFailedAttempt(usernameNorm);
      return {
        success: false,
        error: lockedNow
          ? 'Too many failed login attempts. Account locked for 5 minutes.'
          : 'Incorrect username or password.',
      };
    }

    // Login Successful
    clearLockout(usernameNorm);

    const sessionId = crypto.randomUUID();
    const nowIso = new Date().toISOString();
    const expiresIso = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    user.currentSessionId = sessionId;
    users[usernameNorm] = user;
    localStorage.setItem('exnihilo_users', JSON.stringify(users));

    const newSession: ActiveSession = {
      usernameNorm,
      loginTime: nowIso,
      expiresAt: expiresIso,
      sessionId,
      schemaVersion: SCHEMA_VERSION,
    };
    localStorage.setItem('exnihilo_session', JSON.stringify(newSession));

    setCurrentUser(user);
    setActiveSession(newSession);

    return { success: true };
  };

  // CHANGE PASSWORD
  const changePassword = async (
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!window.isSecureContext || !window.crypto?.subtle) {
      return { success: false, error: 'HTTPS connection is required for account operations.' };
    }

    if (!currentUser || !activeSession) {
      return { success: false, error: 'No active session found.' };
    }

    if (!currentPassword) return { success: false, error: 'Please enter your current password.' };
    if (currentPassword.length > 128) return { success: false, error: 'Password length exceeds 128 characters.' };

    const users = readUsers();
    const user = users[currentUser.usernameNorm];

    if (!user) return { success: false, error: 'User record not found.' };

    // Thread Yield
    await new Promise<void>((resolve) => setTimeout(resolve, 10));

    // Extract current salt and verify current password
    const [storedHashHex, saltHex] = user.passwordRecord.split(':');
    const currentSalt = hexToBuf(saltHex);
    const derivedCurrentHashHex = await derivePbkdf2Hash(currentPassword, currentSalt);

    if (derivedCurrentHashHex !== storedHashHex) {
      return { success: false, error: 'Current password is incorrect.' };
    }

    // New Password Validation
    if (!newPassword) return { success: false, error: 'Please enter a new password.' };
    if (newPassword.length > 128) return { success: false, error: 'New password length exceeds 128 characters.' };
    if (newPassword.length < 10) return { success: false, error: 'New password must be at least 10 characters long.' };
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{}])/.test(newPassword)) {
      return {
        success: false,
        error: 'New password must contain uppercase, lowercase, a number, and a special character (!@#$%^&*()_+-=[]{}).',
      };
    }
    if (newPassword === currentPassword) {
      return { success: false, error: 'New password must be different from your current password.' };
    }

    // Thread Yield before hashing new password
    await new Promise<void>((resolve) => setTimeout(resolve, 10));

    // Hash New Password with Fresh Salt
    const newSalt = crypto.getRandomValues(new Uint8Array(16));
    const newSaltHex = bufToHex(newSalt);
    const newHashHex = await derivePbkdf2Hash(newPassword, newSalt);
    user.passwordRecord = `${newHashHex}:${newSaltHex}`;

    // Step 14: Session Token Rotation
    const newSessionId = crypto.randomUUID();
    user.currentSessionId = newSessionId;
    users[currentUser.usernameNorm] = user;
    localStorage.setItem('exnihilo_users', JSON.stringify(users));

    const updatedSession: ActiveSession = {
      ...activeSession,
      sessionId: newSessionId,
    };
    localStorage.setItem('exnihilo_session', JSON.stringify(updatedSession));

    setCurrentUser(user);
    setActiveSession(updatedSession);

    return { success: true };
  };

  // LOGOUT
  const logout = useCallback(() => {
    if (currentUser) {
      const users = readUsers();
      if (users[currentUser.usernameNorm]) {
        users[currentUser.usernameNorm].currentSessionId = null;
        localStorage.setItem('exnihilo_users', JSON.stringify(users));
      }
    }
    localStorage.removeItem('exnihilo_session');
    setCurrentUser(null);
    setActiveSession(null);
  }, [currentUser]);

  // DELETE ACCOUNT
  const deleteAccount = async (): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) return { success: false, error: 'No active session to delete.' };

    const usernameNorm = currentUser.usernameNorm;
    const users = readUsers();

    delete users[usernameNorm];
    localStorage.setItem('exnihilo_users', JSON.stringify(users));

    localStorage.removeItem('exnihilo_session');
    localStorage.removeItem(`exnihilo_currency_${usernameNorm}`);
    localStorage.removeItem(`exnihilo_lockout_${usernameNorm}`);
    localStorage.removeItem(`exnihilo_attempts_${usernameNorm}`);

    setCurrentUser(null);
    setActiveSession(null);

    return { success: true };
  };

  return {
    currentUser,
    activeSession,
    isLoggedIn: !!currentUser,
    isSecureContext,
    sessionExpiredNotice,
    dismissSessionNotice: () => setSessionExpiredNotice(false),
    signUp,
    login,
    changePassword,
    logout,
    deleteAccount,
  };
}
