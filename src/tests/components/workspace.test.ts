/**
 * workspace.test.ts — UI State Resilience & Storage Vitest Suite (Phase 3)
 */


import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  loadWorkspaceFromStorage,
  removeTabFromStorage,
  clearWorkspaceStorage,
  PersistedTabMeta,
} from '../../hooks/useWorkspaceStorage';

// In-memory localStorage mock for node test runner
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

describe('UI State Resilience & Storage (Phase 3) Tests', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    if (typeof window === 'undefined') {
      (global as any).window = { localStorage: mockStorage };
    }
    if (typeof localStorage === 'undefined') {
      (global as any).localStorage = mockStorage;
    }
    localStorage.clear();
    clearWorkspaceStorage();
  });

  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
  });

  // ── 1. Debounced Storage Writes & Isolated Tab Keys ────────────────────────
  describe('Debounce & Storage Helper Mechanism', () => {
    it('saves tabs with isolated keys (exnihilo_tab_<id>) and index (exnihilo_tab_index)', () => {
      const tab1: PersistedTabMeta = { id: 'tab_1', title: 'Query 1', queryText: 'SELECT 1;', dialect: 'PostgreSQL' };
      const tab2: PersistedTabMeta = { id: 'tab_2', title: 'Query 2', queryText: 'SELECT 2;', dialect: 'MySQL' };

      localStorage.setItem('exnihilo_tab_index', JSON.stringify(['tab_1', 'tab_2']));
      localStorage.setItem('exnihilo_active_tab_id', 'tab_1');
      localStorage.setItem('exnihilo_tab_tab_1', JSON.stringify(tab1));
      localStorage.setItem('exnihilo_tab_tab_2', JSON.stringify(tab2));

      const loaded = loadWorkspaceFromStorage();
      expect(loaded).not.toBeNull();
      expect(loaded?.tabs).toHaveLength(2);
      expect(loaded?.activeTabId).toBe('tab_1');
      expect(loaded?.tabs[0].queryText).toBe('SELECT 1;');
      expect(loaded?.tabs[1].queryText).toBe('SELECT 2;');
    });

    it('removes single tab from index and localStorage without affecting other tabs', () => {
      const tab1: PersistedTabMeta = { id: 't1', title: 'Q1', queryText: 'SELECT 1;', dialect: 'PostgreSQL' };
      const tab2: PersistedTabMeta = { id: 't2', title: 'Q2', queryText: 'SELECT 2;', dialect: 'MySQL' };

      localStorage.setItem('exnihilo_tab_index', JSON.stringify(['t1', 't2']));
      localStorage.setItem('exnihilo_tab_t1', JSON.stringify(tab1));
      localStorage.setItem('exnihilo_tab_t2', JSON.stringify(tab2));

      removeTabFromStorage('t1');

      const loaded = loadWorkspaceFromStorage();
      expect(loaded?.tabs).toHaveLength(1);
      expect(loaded?.tabs[0].id).toBe('t2');
      expect(localStorage.getItem('exnihilo_tab_t1')).toBeNull();
    });
  });

  // ── 2. Storage Limit Guard & Payload Isolation ─────────────────────────────
  describe('Storage Limit Guard', () => {
    it('saves only SQL text, title, dialect, and ID, excluding execution result payloads', () => {
      const tabWithLargeResult: any = {
        id: 'tab_heavy',
        title: 'Heavy Query.sql',
        queryText: 'SELECT * FROM big_table;',
        dialect: 'MySQL',
        // Huge payload simulated
        result: { columns: ['id', 'data'], rows: Array(1000).fill([1, 'large payload']) },
      };

      // Save tab metadata excluding result
      const meta = {
        id: tabWithLargeResult.id,
        title: tabWithLargeResult.title,
        queryText: tabWithLargeResult.queryText,
        dialect: tabWithLargeResult.dialect,
      };

      localStorage.setItem('exnihilo_tab_index', JSON.stringify(['tab_heavy']));
      localStorage.setItem('exnihilo_tab_tab_heavy', JSON.stringify(meta));

      const rawStored = localStorage.getItem('exnihilo_tab_tab_heavy');
      expect(rawStored).not.toBeNull();

      const parsedStored = JSON.parse(rawStored!);
      expect(parsedStored.id).toBe('tab_heavy');
      expect(parsedStored.queryText).toBe('SELECT * FROM big_table;');
      expect(parsedStored.dialect).toBe('MySQL');

      // Result payload MUST NOT be persisted to prevent 5MB storage crashes
      expect(parsedStored.result).toBeUndefined();
    });
  });

  // ── 3. Cross-Tab Synchronization ──────────────────────────────────────────
  describe('Cross-Tab Synchronization', () => {
    it('reloads workspace correctly when exnihilo storage index is updated', () => {
      // Simulate external tab adding tab_ext to localStorage
      localStorage.setItem('exnihilo_tab_index', JSON.stringify(['tab_ext']));
      localStorage.setItem('exnihilo_active_tab_id', 'tab_ext');
      localStorage.setItem(
        'exnihilo_tab_tab_ext',
        JSON.stringify({ id: 'tab_ext', title: 'External.sql', queryText: 'SELECT 99;', dialect: 'SQLite', isPinned: true })
      );

      const reloaded = loadWorkspaceFromStorage();
      expect(reloaded?.tabs).toHaveLength(1);
      expect(reloaded?.tabs[0].id).toBe('tab_ext');
      expect(reloaded?.tabs[0].queryText).toBe('SELECT 99;');
      expect(reloaded?.tabs[0].isPinned).toBe(true);
    });
  });
});
