/**
 * useWorkspaceStorage.ts — Tab-Isolated, Debounced LocalStorage Persistence Hook
 *
 * Prevents "Last-Write-Wins" race conditions across multiple browser windows by storing
 * isolated tab keys (`exnihilo_tab_<id>`) and a lightweight index (`exnihilo_tab_index`).
 *
 * Security & Quota Guard:
 *  - Saves ONLY SQL text, title, dialect, and tab ID.
 *  - NEVER saves query execution results (JSON payloads) to prevent 5MB storage quota crashes.
 *  - Uses 500ms debouncing so editor typing remains locked at 60fps.
 *  - Listens to window 'storage' events for clean cross-tab synchronization.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Dialect } from '../engine/parser';

export interface PersistedTabMeta {
  id: string;
  title: string;
  queryText: string;
  dialect: Dialect;
}

const INDEX_KEY = 'exnihilo_tab_index';
const ACTIVE_TAB_KEY = 'exnihilo_active_tab_id';
const TAB_PREFIX = 'exnihilo_tab_';

export function loadWorkspaceFromStorage(): { tabs: PersistedTabMeta[]; activeTabId: string | null } | null {
  if (typeof window === 'undefined' || !window.localStorage) return null;

  try {
    const rawIndex = localStorage.getItem(INDEX_KEY);
    if (!rawIndex) return null;

    const tabIds: string[] = JSON.parse(rawIndex);
    if (!Array.isArray(tabIds) || tabIds.length === 0) return null;

    const tabs: PersistedTabMeta[] = [];
    tabIds.forEach((id) => {
      const rawTab = localStorage.getItem(`${TAB_PREFIX}${id}`);
      if (rawTab) {
        try {
          const parsed = JSON.parse(rawTab);
          if (parsed && parsed.id && parsed.queryText !== undefined) {
            tabs.push({
              id: parsed.id,
              title: parsed.title || `Query ${parsed.id}.sql`,
              queryText: parsed.queryText || '',
              dialect: (parsed.dialect as Dialect) || 'PostgreSQL',
            });
          }
        } catch {
          // Skip corrupt tab data
        }
      }
    });

    if (tabs.length === 0) return null;
    const activeTabId = localStorage.getItem(ACTIVE_TAB_KEY) || tabs[0].id;

    return { tabs, activeTabId };
  } catch (err) {
    console.warn('Failed to load workspace from localStorage:', err);
    return null;
  }
}

export function removeTabFromStorage(tabId: string) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    localStorage.removeItem(`${TAB_PREFIX}${tabId}`);

    const rawIndex = localStorage.getItem(INDEX_KEY);
    if (rawIndex) {
      const tabIds: string[] = JSON.parse(rawIndex);
      const updatedIds = tabIds.filter((id) => id !== tabId);
      localStorage.setItem(INDEX_KEY, JSON.stringify(updatedIds));
    }
  } catch (err) {
    console.warn('Failed to remove tab from localStorage:', err);
  }
}

export function clearWorkspaceStorage() {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const rawIndex = localStorage.getItem(INDEX_KEY);
    if (rawIndex) {
      const tabIds: string[] = JSON.parse(rawIndex);
      tabIds.forEach((id) => localStorage.removeItem(`${TAB_PREFIX}${id}`));
    }
    localStorage.removeItem(INDEX_KEY);
    localStorage.removeItem(ACTIVE_TAB_KEY);
  } catch (err) {
    console.warn('Failed to clear workspace storage:', err);
  }
}

export function useWorkspaceStorage(debounceMs = 500) {
  const [storedWorkspace, setStoredWorkspace] = useState<{
    tabs: PersistedTabMeta[];
    activeTabId: string | null;
  } | null>(() => loadWorkspaceFromStorage());

  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Debounced save workspace to localStorage
   */
  const saveWorkspaceDebounced = useCallback(
    (tabs: PersistedTabMeta[], activeTabId: string) => {
      if (typeof window === 'undefined' || !window.localStorage) return;

      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }

      saveTimerRef.current = setTimeout(() => {
        try {
          const tabIds = tabs.map((t) => t.id);
          localStorage.setItem(INDEX_KEY, JSON.stringify(tabIds));
          localStorage.setItem(ACTIVE_TAB_KEY, activeTabId);

          tabs.forEach((tab) => {
            // Strictly exclude execution results / large JSON payloads
            const tabMeta = {
              id: tab.id,
              title: tab.title,
              queryText: tab.queryText,
              dialect: tab.dialect,
            };
            localStorage.setItem(`${TAB_PREFIX}${tab.id}`, JSON.stringify(tabMeta));
          });

          setStoredWorkspace({ tabs, activeTabId });
        } catch (err) {
          console.warn('Failed to save workspace to localStorage:', err);
        }
      }, debounceMs);
    },
    [debounceMs]
  );

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  // Cross-tab synchronization via window 'storage' event
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorageEvent = (e: StorageEvent) => {
      if (!e.key) return;
      if (e.key === INDEX_KEY || e.key === ACTIVE_TAB_KEY || e.key.startsWith(TAB_PREFIX)) {
        const reloaded = loadWorkspaceFromStorage();
        if (reloaded) {
          setStoredWorkspace(reloaded);
        }
      }
    };

    window.addEventListener('storage', handleStorageEvent);
    return () => window.removeEventListener('storage', handleStorageEvent);
  }, []);

  return {
    storedWorkspace,
    saveWorkspaceDebounced,
    removeTabFromStorage,
    clearWorkspaceStorage,
  };
}
