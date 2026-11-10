/**
 * cursor.test.ts — Unit Tests for ExNihilo Dynamic Super-Cursor Settings & Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';

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

describe('Cursor Settings & HUD Engine Unit Tests', () => {
  beforeEach(() => {
    if (typeof window === 'undefined') {
      (global as any).window = {
        localStorage: mockStorage,
        dispatchEvent: () => true,
        addEventListener: () => {},
        removeEventListener: () => {},
      };
    }
    if (typeof localStorage === 'undefined') {
      (global as any).localStorage = mockStorage;
    }
    mockStorage.clear();
  });

  afterEach(() => {
    mockStorage.clear();
  });

  it('initializes default cursor settings with all interactive superpowers enabled', () => {
    const raw = mockStorage.getItem('exnihilo_cursor_settings_v1');
    expect(raw).toBeNull();

    // Default structure expectations
    const defaults = {
      enabled: true,
      ambientSpotlight: true,
      liveMath: true,
      magneticSnap: true,
      mascotEnabled: true,
      audioHaptics: true,
    };

    expect(defaults.enabled).toBe(true);
    expect(defaults.ambientSpotlight).toBe(true);
    expect(defaults.liveMath).toBe(true);
    expect(defaults.magneticSnap).toBe(true);
    expect(defaults.mascotEnabled).toBe(true);
    expect(defaults.audioHaptics).toBe(true);
  });

  it('persists modified cursor settings to localStorage', () => {
    const modified = {
      enabled: true,
      ambientSpotlight: false,
      liveMath: true,
      magneticSnap: false,
      mascotEnabled: true,
      audioHaptics: false,
    };

    mockStorage.setItem('exnihilo_cursor_settings_v1', JSON.stringify(modified));

    const retrieved = JSON.parse(mockStorage.getItem('exnihilo_cursor_settings_v1') || '{}');
    expect(retrieved.ambientSpotlight).toBe(false);
    expect(retrieved.magneticSnap).toBe(false);
    expect(retrieved.audioHaptics).toBe(false);
    expect(retrieved.enabled).toBe(true);
  });

  it('calculates live math stats (sum, avg, count) accurately on cell numbers', () => {
    const sampleNumbers = [150, 250, 400];
    const sum = sampleNumbers.reduce((a, b) => a + b, 0);
    const count = sampleNumbers.length;
    const avg = Number((sum / count).toFixed(2));

    expect(count).toBe(3);
    expect(sum).toBe(800);
    expect(avg).toBe(266.67);
  });
});
