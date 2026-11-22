/**
 * cookie_and_legal.test.ts — Unit tests for Cookie Consent, Terms of Service, and Privacy Policy
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getStoredCookiePreferences, CookiePreferences } from '../../components/Win95/CookieConsentDialog';

class LocalStorageMock {
  private store: Record<string, string> = {};

  clear() {
    this.store = {};
  }

  getItem(key: string): string | null {
    return this.store[key] !== undefined ? this.store[key] : null;
  }

  setItem(key: string, value: string) {
    this.store[key] = String(value);
  }

  removeItem(key: string) {
    delete this.store[key];
  }
}

const mockStorage = new LocalStorageMock();

describe('Cookie Consent & Privacy Storage Unit Tests', () => {
  beforeEach(() => {
    if (typeof window === 'undefined') {
      (global as any).window = { localStorage: mockStorage };
    }
    if (typeof localStorage === 'undefined') {
      (global as any).localStorage = mockStorage;
    }
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('returns null when no cookie preferences have been stored yet', () => {
    const consent = getStoredCookiePreferences();
    expect(consent).toBeNull();
  });

  it('correctly reads stored cookie preferences from localStorage', () => {
    const mockConsent: CookiePreferences = {
      essential: true,
      preferences: true,
      analytics: false,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('exnihilo_cookie_consent', JSON.stringify(mockConsent));

    const consent = getStoredCookiePreferences();
    expect(consent).not.toBeNull();
    expect(consent?.essential).toBe(true);
    expect(consent?.preferences).toBe(true);
    expect(consent?.analytics).toBe(false);
  });

  it('handles invalid JSON gracefully without throwing', () => {
    localStorage.setItem('exnihilo_cookie_consent', '{ malformed_json');
    const consent = getStoredCookiePreferences();
    expect(consent).toBeNull();
  });

  it('stores and retrieves updated cookie preferences with all categories enabled', () => {
    const consent: CookiePreferences = {
      essential: true,
      preferences: true,
      analytics: true,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('exnihilo_cookie_consent', JSON.stringify(consent));
    const retrieved = getStoredCookiePreferences();
    expect(retrieved?.essential).toBe(true);
    expect(retrieved?.preferences).toBe(true);
    expect(retrieved?.analytics).toBe(true);
  });
});
