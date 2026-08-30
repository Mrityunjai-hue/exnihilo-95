/**
 * userCatalogStorage.ts — Persists user-created databases and tables to localStorage
 * so they are automatically restored when the page is refreshed.
 */

import { ColumnFormRow } from './dbManagerUtils';

export interface PersistedUserTable {
  tableName: string;
  dbName: string;
  ddlSql: string;
  columns: ColumnFormRow[];
  rowCount: number;
}

export interface PersistedUserCatalogData {
  databases: string[];
  tables: PersistedUserTable[];
}

const STORAGE_KEY = 'exnihilo_user_catalog_v1';

export function saveUserCatalogToStorage(databases: string[], tables: PersistedUserTable[]): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const data: PersistedUserCatalogData = { databases, tables };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save user catalog to localStorage:', e);
  }
}

export function loadUserCatalogFromStorage(): PersistedUserCatalogData | null {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.databases) && Array.isArray(parsed.tables)) {
      return parsed as PersistedUserCatalogData;
    }
    return null;
  } catch {
    return null;
  }
}

export function clearUserCatalogStorage(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore
  }
}
