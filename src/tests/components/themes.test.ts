/**
 * themes.test.ts — Unit Tests for Nostalgia Themes & Multi-Theme Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { THEME_PRESETS } from '../../hooks/useTheme';

// In-memory localStorage mock for node test environment
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

describe('Multi-Theme Engine Unit Tests', () => {
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

  it('contains 5 authentic nostalgia theme presets', () => {
    expect(THEME_PRESETS).toHaveLength(5);
    const themeIds = THEME_PRESETS.map((t) => t.id);
    expect(themeIds).toContain('win95-classic');
    expect(themeIds).toContain('win7-aero');
    expect(themeIds).toContain('win95-noir');
    expect(themeIds).toContain('winxp-luna');
    expect(themeIds).toContain('win2000');
  });

  it('defines desktop background and titlebar gradient for every theme', () => {
    THEME_PRESETS.forEach((theme) => {
      expect(theme.desktopBg).toBeDefined();
      expect(theme.desktopBg.length).toBeGreaterThan(0);
      expect(theme.titleGradient).toBeDefined();
      expect(theme.titleGradient).toContain('linear-gradient');
    });
  });

  it('correctly flags dark mode vs light mode themes', () => {
    const noir = THEME_PRESETS.find((t) => t.id === 'win95-noir');
    const classic = THEME_PRESETS.find((t) => t.id === 'win95-classic');

    expect(noir?.isDark).toBe(true);
    expect(classic?.isDark).toBe(false);
  });
});
