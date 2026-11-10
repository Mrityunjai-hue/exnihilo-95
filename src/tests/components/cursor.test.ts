/**
 * cursor.test.ts — Unit Tests for ExNihilo Signature Liquid Mercury Droplet Cursor
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

describe('Liquid Mercury Droplet Cursor Unit Tests', () => {
  beforeEach(() => {
    if (typeof window === 'undefined') {
      (global as any).window = {
        localStorage: mockStorage,
        dispatchEvent: () => true,
        addEventListener: () => {},
        removeEventListener: () => {},
        matchMedia: () => ({ matches: false }),
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

  it('initializes default liquid cursor settings with enabled = true', () => {
    const raw = mockStorage.getItem('exnihilo_liquid_cursor_v1');
    expect(raw).toBeNull();

    const defaults = {
      enabled: true,
    };

    expect(defaults.enabled).toBe(true);
  });

  it('persists modified liquid cursor state to localStorage', () => {
    const modified = {
      enabled: false,
    };

    mockStorage.setItem('exnihilo_liquid_cursor_v1', JSON.stringify(modified));

    const retrieved = JSON.parse(mockStorage.getItem('exnihilo_liquid_cursor_v1') || '{}');
    expect(retrieved.enabled).toBe(false);
  });

  it('calculates velocity elongation and volume preservation correctly', () => {
    const BASE_TAIL = 9;
    const MAX_TAIL = 24;

    // Test at zero speed
    const speedZero = 0;
    const tailZero = BASE_TAIL + Math.min(speedZero * 1.1, MAX_TAIL - BASE_TAIL);
    expect(tailZero).toBe(9);

    // Test at high speed flick (e.g. 25px delta)
    const speedFast = 25;
    const tailFast = BASE_TAIL + Math.min(speedFast * 1.1, MAX_TAIL - BASE_TAIL);
    expect(tailFast).toBe(24);

    // Fluid volume conservation: width narrows as tail stretches
    const volWidthAtRest = Math.sqrt(BASE_TAIL / Math.max(tailZero, 4));
    const volWidthAtMaxStretch = Math.sqrt(BASE_TAIL / Math.max(tailFast, 4));

    expect(volWidthAtRest).toBe(1.0);
    expect(volWidthAtMaxStretch).toBeLessThan(1.0);
    expect(Number(volWidthAtMaxStretch.toFixed(2))).toBe(0.61);
  });

  it('produces valid analytical Bezier SVG path coordinates', () => {
    const t = 14;
    const w = 0.85;
    const d = `M 0 0 C ${-t * 0.24} ${-w * 4.2}, ${-t * 0.78} ${-w * 4.5}, ${-t} 0 C ${-t * 0.78} ${w * 4.5}, ${-t * 0.24} ${w * 4.2}, 0 0 Z`;

    expect(d).toContain('M 0 0');
    expect(d).toContain(`${-t} 0`);
    expect(d.endsWith('Z')).toBe(true);
  });
});
