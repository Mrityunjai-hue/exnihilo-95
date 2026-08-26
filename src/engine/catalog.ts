/**
 * catalog.ts — Batch 2: Session Schema & Namespace Catalog
 *
 * In-memory catalog of tables, views, and schemas/databases in the current session.
 * - Supports namespaces (databases[dbName].tables & databases[dbName].views)
 * - Supports schema-qualified table names (schema_name.table_name)
 * - Supports TRUNCATE TABLE (clears row count to 0, preserves DDL schema)
 * - Supports CREATE VIEW (stores query definition without storing physical data rows)
 * - Backwards-compatible flat table accessors for default namespace
 */

import { TableSchema } from './inference';

export interface CatalogEntry {
  tableName:      string;      // normalized lowercase
  schema:         TableSchema;
  materializedAt: Date;
  rowCount:       number;
  isUserDefined:  boolean;
  dbName?:        string;
}

export interface ViewEntry {
  viewName:  string;           // normalized lowercase
  querySql:  string;           // underlying SELECT query
  selectAst?: any;
  createdAt: Date;
  dbName?:   string;
}

export interface DatabaseSchema {
  name:   string;
  tables: Map<string, CatalogEntry>;
  views:  Map<string, ViewEntry>;
}

export class SessionCatalog {
  private databases: Map<string, DatabaseSchema> = new Map();
  private defaultDbName: string = 'default';

  constructor() {
    this.createDatabase(this.defaultDbName);
  }

  /**
   * Helper to parse qualified table/view names ("schema.table" -> { dbName: "schema", name: "table" }).
   */
  public parseQualifiedName(fullName: string, defaultDb: string = this.defaultDbName): { dbName: string; name: string } {
    const trimmed = fullName.toLowerCase().trim();
    if (trimmed.includes('.')) {
      const parts = trimmed.split('.');
      return { dbName: parts[0], name: parts.slice(1).join('.') };
    }
    return { dbName: defaultDb, name: trimmed };
  }

  /**
   * Create or register a database/schema namespace.
   */
  createDatabase(dbName: string): DatabaseSchema {
    const key = dbName.toLowerCase().trim();
    if (!this.databases.has(key)) {
      this.databases.set(key, {
        name: key,
        tables: new Map(),
        views: new Map(),
      });
    }
    return this.databases.get(key)!;
  }

  /**
   * Synonym for createDatabase.
   */
  createSchema(schemaName: string): DatabaseSchema {
    return this.createDatabase(schemaName);
  }

  /**
   * Check if a database/schema namespace exists.
   */
  hasDatabase(dbName: string): boolean {
    return this.databases.has(dbName.toLowerCase().trim());
  }

  /**
   * Returns all registered database/schema names.
   */
  getDatabaseNames(): string[] {
    return Array.from(this.databases.keys());
  }

  /**
   * Check if a table exists in the session catalog.
   */
  has(tableName: string, dbName?: string): boolean {
    const { dbName: resolvedDb, name } = this.parseQualifiedName(tableName, dbName);
    const db = this.databases.get(resolvedDb);
    if (db && db.tables.has(name)) return true;

    // Fallback: check all databases if not qualified
    if (!tableName.includes('.')) {
      for (const d of this.databases.values()) {
        if (d.tables.has(name)) return true;
      }
    }
    return false;
  }

  /**
   * Retrieve a catalog entry by table name.
   */
  get(tableName: string, dbName?: string): CatalogEntry | undefined {
    const { dbName: resolvedDb, name } = this.parseQualifiedName(tableName, dbName);
    const db = this.databases.get(resolvedDb);
    if (db && db.tables.has(name)) return db.tables.get(name);

    if (!tableName.includes('.')) {
      for (const d of this.databases.values()) {
        if (d.tables.has(name)) return d.tables.get(name);
      }
    }
    return undefined;
  }

  /**
   * Register or update a table in the session catalog.
   */
  set(
    tableName:     string,
    schema:        TableSchema,
    rowCount:      number,
    isUserDefined: boolean = false,
    dbName?:        string,
  ): CatalogEntry {
    const { dbName: resolvedDb, name } = this.parseQualifiedName(tableName, dbName);
    const db = this.createDatabase(resolvedDb);

    const existing = db.tables.get(name);
    const userDefined = isUserDefined || (existing?.isUserDefined ?? false);

    const entry: CatalogEntry = {
      tableName: name,
      schema,
      materializedAt: new Date(),
      rowCount,
      isUserDefined: userDefined,
      dbName: resolvedDb,
    };

    db.tables.set(name, entry);
    return entry;
  }

  /**
   * Truncate table data (resets row count to 0, preserves schema and columns).
   */
  truncateTable(tableName: string, dbName?: string): boolean {
    const entry = this.get(tableName, dbName);
    if (entry) {
      entry.rowCount = 0;
      entry.materializedAt = new Date();
      return true;
    }
    return false;
  }

  /**
   * Register a virtualized view in the catalog without physical data rows.
   */
  setView(
    viewName:  string,
    querySql:  string,
    selectAst?: any,
    dbName?:   string
  ): ViewEntry {
    const { dbName: resolvedDb, name } = this.parseQualifiedName(viewName, dbName);
    const db = this.createDatabase(resolvedDb);

    const viewEntry: ViewEntry = {
      viewName: name,
      querySql,
      selectAst,
      createdAt: new Date(),
      dbName: resolvedDb,
    };

    db.views.set(name, viewEntry);
    return viewEntry;
  }

  /**
   * Retrieve a view entry by name.
   */
  getView(viewName: string, dbName?: string): ViewEntry | undefined {
    const { dbName: resolvedDb, name } = this.parseQualifiedName(viewName, dbName);
    const db = this.databases.get(resolvedDb);
    if (db && db.views.has(name)) return db.views.get(name);

    if (!viewName.includes('.')) {
      for (const d of this.databases.values()) {
        if (d.views.has(name)) return d.views.get(name);
      }
    }
    return undefined;
  }

  /**
   * Check if a view exists in the session catalog.
   */
  hasView(viewName: string, dbName?: string): boolean {
    return this.getView(viewName, dbName) !== undefined;
  }

  /**
   * Returns all views across databases or for a specific database.
   */
  getAllViews(dbName?: string): ViewEntry[] {
    if (dbName) {
      const db = this.databases.get(dbName.toLowerCase().trim());
      return db ? Array.from(db.views.values()) : [];
    }
    const allViews: ViewEntry[] = [];
    for (const d of this.databases.values()) {
      allViews.push(...Array.from(d.views.values()));
    }
    return allViews;
  }

  /**
   * Remove a single table from the catalog.
   */
  delete(tableName: string, dbName?: string): boolean {
    const { dbName: resolvedDb, name } = this.parseQualifiedName(tableName, dbName);
    const db = this.databases.get(resolvedDb);
    if (db) {
      return db.tables.delete(name);
    }
    return false;
  }

  /**
   * Returns all catalog entries as a flat array.
   */
  getAll(): CatalogEntry[] {
    const allEntries: CatalogEntry[] = [];
    for (const db of this.databases.values()) {
      allEntries.push(...Array.from(db.tables.values()));
    }
    return allEntries;
  }

  /**
   * Returns all registered table names (lowercase).
   */
  getTableNames(): string[] {
    return this.getAll().map(e => e.tableName);
  }

  /**
   * Reset the entire catalog (clears all registered tables, views, and schemas).
   */
  reset(): void {
    this.databases.clear();
    this.createDatabase(this.defaultDbName);
  }

  /**
   * Current total number of tables across all databases.
   */
  get size(): number {
    return this.getAll().length;
  }
}

// Global session singleton instance
export const globalCatalog = new SessionCatalog();

