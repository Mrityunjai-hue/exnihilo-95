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
  triggers?:      string[];    // Names of triggers attached to this table
}

export interface ViewEntry {
  viewName:  string;           // normalized lowercase
  querySql:  string;           // underlying SELECT query
  selectAst?: any;
  createdAt: Date;
  dbName?:   string;
}

export interface RoutineEntry {
  routineName: string;         // normalized lowercase
  type:        'PROCEDURE' | 'FUNCTION';
  parameters:  string[];
  returnType?: string;
  body:        string;
  createdAt:   Date;
  dbName?:     string;
}

export interface TriggerEntry {
  triggerName: string;         // normalized lowercase
  targetTable: string;         // normalized lowercase
  timing:      'BEFORE' | 'AFTER' | 'INSTEAD OF';
  event:       'INSERT' | 'UPDATE' | 'DELETE';
  body:        string;
  createdAt:   Date;
  dbName?:     string;
}

export interface DatabaseSchema {
  name:     string;
  tables:   Map<string, CatalogEntry>;
  views:    Map<string, ViewEntry>;
  routines: Map<string, RoutineEntry>;
  triggers: Map<string, TriggerEntry>;
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
        routines: new Map(),
        triggers: new Map(),
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

    const attachedTriggers = existing?.triggers ? [...existing.triggers] : [];
    for (const tr of db.triggers.values()) {
      if (tr.targetTable.toLowerCase() === name.toLowerCase() && !attachedTriggers.includes(tr.triggerName)) {
        attachedTriggers.push(tr.triggerName);
      }
    }

    const entry: CatalogEntry = {
      tableName: name,
      schema,
      materializedAt: new Date(),
      rowCount,
      isUserDefined: userDefined,
      dbName: resolvedDb,
      triggers: attachedTriggers,
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

  // ── Routine Management (PROCEDURE & FUNCTION) ────────────────────────────────

  /**
   * Register a stored procedure or function in the catalog.
   */
  setRoutine(
    routineName: string,
    type:        'PROCEDURE' | 'FUNCTION',
    parameters:  string[],
    body:        string,
    returnType?: string,
    dbName?:     string
  ): RoutineEntry {
    const { dbName: resolvedDb, name } = this.parseQualifiedName(routineName, dbName);
    const db = this.createDatabase(resolvedDb);

    const routineEntry: RoutineEntry = {
      routineName: name,
      type,
      parameters,
      returnType,
      body,
      createdAt: new Date(),
      dbName: resolvedDb,
    };

    db.routines.set(name, routineEntry);
    return routineEntry;
  }

  /**
   * Retrieve a stored routine by name.
   */
  getRoutine(routineName: string, dbName?: string): RoutineEntry | undefined {
    const { dbName: resolvedDb, name } = this.parseQualifiedName(routineName, dbName);
    const db = this.databases.get(resolvedDb);
    if (db && db.routines.has(name)) return db.routines.get(name);

    if (!routineName.includes('.')) {
      for (const d of this.databases.values()) {
        if (d.routines.has(name)) return d.routines.get(name);
      }
    }
    return undefined;
  }

  /**
   * Check if a stored routine exists in the catalog.
   */
  hasRoutine(routineName: string, dbName?: string): boolean {
    return this.getRoutine(routineName, dbName) !== undefined;
  }

  /**
   * Returns all registered routines across databases.
   */
  getAllRoutines(dbName?: string): RoutineEntry[] {
    if (dbName) {
      const db = this.databases.get(dbName.toLowerCase().trim());
      return db ? Array.from(db.routines.values()) : [];
    }
    const allRoutines: RoutineEntry[] = [];
    for (const d of this.databases.values()) {
      allRoutines.push(...Array.from(d.routines.values()));
    }
    return allRoutines;
  }

  // ── Trigger Management ────────────────────────────────────────────────────────

  /**
   * Register a trigger in the catalog and attach it to its target table.
   */
  setTrigger(
    triggerName: string,
    targetTable: string,
    timing:      'BEFORE' | 'AFTER' | 'INSTEAD OF',
    event:       'INSERT' | 'UPDATE' | 'DELETE',
    body:        string,
    dbName?:     string
  ): TriggerEntry {
    const { dbName: resolvedDb, name } = this.parseQualifiedName(triggerName, dbName);
    const db = this.createDatabase(resolvedDb);

    const triggerEntry: TriggerEntry = {
      triggerName: name,
      targetTable: targetTable.toLowerCase().trim(),
      timing,
      event,
      body,
      createdAt: new Date(),
      dbName: resolvedDb,
    };

    db.triggers.set(name, triggerEntry);

    // Attach trigger name to target table catalog entry if present
    const tableEntry = this.get(targetTable, resolvedDb);
    if (tableEntry) {
      if (!tableEntry.triggers) tableEntry.triggers = [];
      if (!tableEntry.triggers.includes(name)) tableEntry.triggers.push(name);
    }

    return triggerEntry;
  }

  /**
   * Retrieve a trigger by name.
   */
  getTrigger(triggerName: string, dbName?: string): TriggerEntry | undefined {
    const { dbName: resolvedDb, name } = this.parseQualifiedName(triggerName, dbName);
    const db = this.databases.get(resolvedDb);
    if (db && db.triggers.has(name)) return db.triggers.get(name);

    if (!triggerName.includes('.')) {
      for (const d of this.databases.values()) {
        if (d.triggers.has(name)) return d.triggers.get(name);
      }
    }
    return undefined;
  }

  /**
   * Check if a trigger exists in the catalog.
   */
  hasTrigger(triggerName: string, dbName?: string): boolean {
    return this.getTrigger(triggerName, dbName) !== undefined;
  }

  /**
   * Returns all triggers across databases or for a specific database.
   */
  getAllTriggers(dbName?: string): TriggerEntry[] {
    if (dbName) {
      const db = this.databases.get(dbName.toLowerCase().trim());
      return db ? Array.from(db.triggers.values()) : [];
    }
    const allTriggers: TriggerEntry[] = [];
    for (const d of this.databases.values()) {
      allTriggers.push(...Array.from(d.triggers.values()));
    }
    return allTriggers;
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

