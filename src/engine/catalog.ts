/**
 * catalog.ts — Phase 5: Session Schema Catalog
 *
 * Implements spec Section 3.1 & 3.5:
 *  - In-memory catalog of all inferred and user-defined tables in the current session
 *  - Maps normalized (lowercased) table names to CatalogEntry
 *  - Explicit user-authored `CREATE TABLE` permanently marks `isUserDefined = true`
 *  - Cache hit on repeat queries (no re-inference or re-materialization of known tables)
 *  - Full `reset()` capability (clears all catalog entries)
 */

import { TableSchema } from './inference';

export interface CatalogEntry {
  tableName:      string;      // normalized lowercase
  schema:         TableSchema;
  materializedAt: Date;
  rowCount:       number;
  isUserDefined:  boolean;
}

export class SessionCatalog {
  private entries: Map<string, CatalogEntry> = new Map();

  /**
   * Check if a table exists in the session catalog.
   */
  has(tableName: string): boolean {
    return this.entries.has(tableName.toLowerCase().trim());
  }

  /**
   * Retrieve a catalog entry by table name.
   */
  get(tableName: string): CatalogEntry | undefined {
    return this.entries.get(tableName.toLowerCase().trim());
  }

  /**
   * Register or update a table in the session catalog.
   */
  set(
    tableName:     string,
    schema:        TableSchema,
    rowCount:      number,
    isUserDefined: boolean = false,
  ): CatalogEntry {
    const key = tableName.toLowerCase().trim();
    const existing = this.entries.get(key);

    // If already user-defined, preserve that status
    const userDefined = isUserDefined || (existing?.isUserDefined ?? false);

    const entry: CatalogEntry = {
      tableName: key,
      schema,
      materializedAt: new Date(),
      rowCount,
      isUserDefined: userDefined,
    };

    this.entries.set(key, entry);
    return entry;
  }

  /**
   * Remove a single table from the catalog.
   */
  delete(tableName: string): boolean {
    return this.entries.delete(tableName.toLowerCase().trim());
  }

  /**
   * Returns all catalog entries as an array.
   */
  getAll(): CatalogEntry[] {
    return Array.from(this.entries.values());
  }

  /**
   * Returns all registered table names (lowercase).
   */
  getTableNames(): string[] {
    return Array.from(this.entries.keys());
  }

  /**
   * Reset the entire catalog (clears all registered tables).
   */
  reset(): void {
    this.entries.clear();
  }

  /**
   * Current number of tables in catalog.
   */
  get size(): number {
    return this.entries.size;
  }
}

// Global session singleton instance
export const globalCatalog = new SessionCatalog();
