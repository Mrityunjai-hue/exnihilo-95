/**
 * catalogAdapter.ts — Lightweight Main-Thread Catalog Store & Adapter
 *
 * Provides a pure, zero-dependency, JSON-serializable catalog wrapper
 * exposing the read-only interface consumed by SchemaTree, ERDViewer,
 * IDEShell, PocketSQLShell, and Autocomplete without loading the SQL engine
 * or Faker into the main browser thread.
 */

export interface ColumnDTO {
  name: string;
  logicalType: string;
  sqliteType: string;
  isPrimaryKey?: boolean;
  isForeignKey?: boolean;
  referencesTable?: string;
  referencesColumn?: string;
}

export interface TableEntryDTO {
  tableName: string;
  dbName: string;
  rowCount: number;
  isUserCreated: boolean;
  columns: ColumnDTO[];
  sampleRows?: unknown[][]; // First 5 rows for ERD live preview
}

export interface CatalogSnapshotDTO {
  databases: string[];
  tables: TableEntryDTO[];
  version: number;
}

export interface ReadOnlyCatalogEntry {
  tableName: string;
  dbName: string;
  rowCount: number;
  isUserDefined: boolean;
  schema: {
    columns: ColumnDTO[];
  };
  columns?: ColumnDTO[]; // Convenience accessor matching schema.columns
  sampleRows?: unknown[][];
}

export class ReadOnlyCatalogAdapter {
  private snapshot: CatalogSnapshotDTO;
  private tablesMap: Map<string, TableEntryDTO> = new Map();

  constructor(snapshot: CatalogSnapshotDTO) {
    this.snapshot = snapshot || { databases: ['default'], tables: [], version: 0 };
    for (const t of this.snapshot.tables || []) {
      const dbKey = (t.dbName || 'default').toLowerCase();
      const tblKey = t.tableName.toLowerCase();
      this.tablesMap.set(`${dbKey}.${tblKey}`, t);
      // Flat accessor for default db
      if (dbKey === 'default') {
        this.tablesMap.set(tblKey, t);
      }
    }
  }

  getDatabases(): string[] {
    return this.snapshot.databases && this.snapshot.databases.length > 0
      ? this.snapshot.databases
      : ['default'];
  }

  getDatabaseNames(): string[] {
    return this.getDatabases();
  }

  getAll(): ReadOnlyCatalogEntry[] {
    return (this.snapshot.tables || []).map((t) => ({
      tableName: t.tableName,
      dbName: t.dbName || 'default',
      rowCount: t.rowCount,
      isUserDefined: t.isUserCreated,
      schema: {
        columns: t.columns || [],
      },
      columns: t.columns || [],
      sampleRows: t.sampleRows,
    }));
  }

  getTable(name: string, dbName: string = 'default'): TableEntryDTO | undefined {
    const key = `${dbName.toLowerCase()}.${name.toLowerCase()}`;
    return this.tablesMap.get(key) || this.tablesMap.get(name.toLowerCase());
  }

  get(name: string, dbName: string = 'default'): ReadOnlyCatalogEntry | undefined {
    const t = this.getTable(name, dbName);
    if (!t) return undefined;
    return {
      tableName: t.tableName,
      dbName: t.dbName || 'default',
      rowCount: t.rowCount,
      isUserDefined: t.isUserCreated,
      schema: {
        columns: t.columns || [],
      },
      columns: t.columns || [],
      sampleRows: t.sampleRows,
    };
  }

  has(name: string, dbName: string = 'default'): boolean {
    return this.getTable(name, dbName) !== undefined;
  }

  getDatabase(dbName: string) {
    const targetDb = dbName.toLowerCase();
    const tables = new Map<string, ReadOnlyCatalogEntry>();
    for (const t of this.snapshot.tables || []) {
      if ((t.dbName || 'default').toLowerCase() === targetDb) {
        tables.set(t.tableName.toLowerCase(), {
          tableName: t.tableName,
          dbName: t.dbName || 'default',
          rowCount: t.rowCount,
          isUserDefined: t.isUserCreated,
          schema: { columns: t.columns || [] },
          sampleRows: t.sampleRows,
        });
      }
    }
    return {
      name: dbName,
      tables,
      views: new Map(),
      routines: new Map(),
      triggers: new Map(),
    };
  }

  toAutocompleteMap(): Record<string, string[]> {
    const map: Record<string, string[]> = {};
    for (const t of this.snapshot.tables || []) {
      map[t.tableName] = (t.columns || []).map((c) => c.name);
    }
    return map;
  }
}
