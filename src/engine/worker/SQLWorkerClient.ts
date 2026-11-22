/**
 * SQLWorkerClient.ts — Resilient Main-Thread RPC Client for Off-Thread Web Worker
 * Includes 5s watchdog timeout, hard thread cancellation, and transparent state recovery.
 */

import type { Dialect } from '../parser';
import type { ExecutionResult } from '../executor';
import type { SQLChallenge } from '../../data/challenges/types';
import type { EvaluationResult } from '../../utils/challengeEvaluator';
import type { ColumnFormRow } from '../../utils/dbManagerUtils';
import type { WorkerRequest, WorkerResponse, WorkerCatalogTableDTO, CatalogSnapshotDTO } from './protocol';

type CatalogListener = (catalog: CatalogSnapshotDTO) => void;

function extractFallbackCatalog(exec: any): CatalogSnapshotDTO {
  try {
    const cat = exec.getCatalog();
    const dbNames = cat.getDatabaseNames ? cat.getDatabaseNames() : ['default'];
    const entries = cat.getAll ? cat.getAll() : [];
    const tables = entries.map((entry: any) => ({
      tableName: entry.tableName,
      dbName: entry.dbName || 'default',
      rowCount: entry.rowCount,
      isUserCreated: entry.isUserDefined,
      columns: entry.schema?.columns?.map((col: any) => ({
        name: col.name,
        logicalType: col.logicalType,
        sqliteType: col.sqliteType,
        isPrimaryKey: Boolean(col.isPrimaryKey || col.name?.toLowerCase() === 'id'),
        isForeignKey: Boolean(col.references),
        referencesTable: col.references?.table,
        referencesColumn: col.references?.column || 'id',
      })) || [],
      sampleRows: [],
    }));
    return {
      databases: dbNames.length > 0 ? dbNames : ['default'],
      tables,
      version: Date.now(),
    };
  } catch {
    return { databases: ['default'], tables: [], version: Date.now() };
  }
}

export class SQLWorkerClient {
  private static instance: SQLWorkerClient | null = null;
  private worker: Worker | null = null;
  private isBrowser: boolean = false;
  private pendingRequests = new Map<
    string,
    {
      resolve: (value: any) => void;
      reject: (reason: any) => void;
      timerId?: ReturnType<typeof setTimeout>;
      requestType: string;
    }
  >();
  private activeExecutionId: string | null = null;
  private lastKnownSnapshot: Uint8Array | null = null;
  private catalogListeners = new Set<CatalogListener>();
  private legacyCatalogListeners = new Set<(catalog: WorkerCatalogTableDTO[]) => void>();
  private cachedCatalogSnapshot: CatalogSnapshotDTO = { databases: ['default'], tables: [], version: 0 };
  private debouncedAutoSaveTimer: ReturnType<typeof setTimeout> | null = null;

  // Fallback direct executor for Node / Vitest SSR environments
  private fallbackExecutor: any = null;
  private fallbackPreMutationSnapshot: Uint8Array | null = null;

  public static getInstance(): SQLWorkerClient {
    if (!SQLWorkerClient.instance) {
      SQLWorkerClient.instance = new SQLWorkerClient();
    }
    return SQLWorkerClient.instance;
  }

  constructor() {
    this.isBrowser = typeof window !== 'undefined' && typeof Worker !== 'undefined';
    if (this.isBrowser) {
      this.spawnWorker();
    }
  }

  private getTimeoutMs(): number {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const stored = localStorage.getItem('exnihilo_query_timeout_ms');
        if (stored) {
          const val = parseInt(stored, 10);
          if (!isNaN(val) && val >= 1000) return val;
        }
      } catch {}
    }
    return 5000;
  }

  private spawnWorker(): void {
    if (!this.isBrowser) return;

    try {
      this.worker = new Worker(new URL('./sql.worker.ts', import.meta.url));
      this.worker.onmessage = this.handleWorkerMessage.bind(this);
      this.worker.onerror = (e) => {
        console.error('SQL Web Worker uncaught error:', e);
      };
    } catch (err) {
      console.warn('Could not spawn dedicated Web Worker; falling back to direct executor:', err);
      this.worker = null;
    }
  }

  private handleWorkerMessage(event: MessageEvent<WorkerResponse>): void {
    const res = event.data;
    if (!res || !res.id) return;

    const pending = this.pendingRequests.get(res.id);
    if (!pending) return;

    if (pending.timerId) {
      clearTimeout(pending.timerId);
    }
    this.pendingRequests.delete(res.id);

    if (this.activeExecutionId === res.id) {
      this.activeExecutionId = null;
    }

    if (res.ok) {
      // If response includes updated catalog, broadcast to listeners
      if (res.payload && typeof res.payload === 'object' && 'catalog' in res.payload) {
        const cat = (res.payload as any).catalog as CatalogSnapshotDTO;
        if (cat && typeof cat === 'object') {
          this.cachedCatalogSnapshot = cat;
          this.notifyCatalogListeners(cat);
          if (cat.tables && cat.tables.length > 0) {
            this.triggerAutoSave(cat.tables.length);
          }
        }
      }
      pending.resolve(res.payload);
    } else {
      pending.reject(res.error);
    }
  }

  private async getFallbackExecutor() {
    if (!this.fallbackExecutor) {
      const { SQLExecutor } = await import('../executor');
      this.fallbackExecutor = new SQLExecutor();
      await this.fallbackExecutor.init();
    }
    return this.fallbackExecutor;
  }

  private sendRequest<T = any>(
    type: WorkerRequest['type'],
    payload: Record<string, any> = {},
    customTimeout?: number
  ): Promise<T> {
    const id = `req_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    if (!this.worker) {
      // Fallback implementation for Node/Vitest
      return (async () => {
        const exec = await this.getFallbackExecutor();
        let resPayload: any = null;
        if (type === 'INIT') {
          resPayload = { initialized: true, catalog: extractFallbackCatalog(exec) };
        } else if (type === 'EXECUTE') {
          const isMutation = /^\s*(UPDATE|DELETE|INSERT)\b/i.test(payload.sql);
          let preSnap: Uint8Array | null = null;
          let targetTable = '';
          let preRows: any[] = [];
          if (isMutation) {
            preSnap = exec.exportDatabaseBinary();
            const match = payload.sql.match(/(?:UPDATE|FROM|INTO)\s+["`]?([a-zA-Z0-9_]+)["`]?/i);
            if (match && match[1]) {
              targetTable = match[1];
              preRows = exec.getTableSampleRows(targetTable, 5);
            }
          }
          const res = await exec.execute(payload.sql, payload.dialect, payload.options);
          if (isMutation && preSnap) {
            this.fallbackPreMutationSnapshot = preSnap;
            let postRows: any[] = [];
            if (targetTable) {
              postRows = exec.getTableSampleRows(targetTable, 5);
            }
            const mType = payload.sql.trim().toUpperCase().startsWith('UPDATE')
              ? 'UPDATE'
              : payload.sql.trim().toUpperCase().startsWith('DELETE')
              ? 'DELETE'
              : 'INSERT';
            (res as any).mutationDiff = {
              tableName: targetTable || 'table',
              type: mType,
              rowsAffected: res.rowCount,
              preRows,
              postRows,
              timestamp: Date.now(),
            };
          }
          resPayload = { result: res, catalog: extractFallbackCatalog(exec) };
        } else if (type === 'UNDO_LAST_MUTATION') {
          if (!this.fallbackPreMutationSnapshot) {
            resPayload = { undone: false, message: 'No mutation checkpoint available to undo.' };
          } else {
            await exec.loadDatabaseBinary(this.fallbackPreMutationSnapshot);
            this.fallbackPreMutationSnapshot = null;
            resPayload = {
              undone: true,
              message: 'Successfully reverted database to pre-mutation state.',
              catalog: extractFallbackCatalog(exec),
            };
          }
        } else if (type === 'CREATE_USER_DB') {
          const ok = exec.createUserDatabase(payload.dbName);
          resPayload = { ok, catalog: extractFallbackCatalog(exec) };
        } else if (type === 'DROP_USER_DB') {
          const ok = await exec.dropUserDatabase(payload.dbName);
          resPayload = { ok, catalog: extractFallbackCatalog(exec) };
        } else if (type === 'CREATE_USER_TABLE') {
          const { buildCreateTableSql } = await import('../../utils/dbManagerUtils');
          const ddl = buildCreateTableSql(payload.tableName, payload.columns, [], 'SQLite');
          const res = await exec.createUserTable(
            payload.tableName,
            ddl,
            payload.columns,
            payload.dbName || 'default',
            payload.seedRows || 20
          );
          resPayload = { ...res, catalog: extractFallbackCatalog(exec) };
        } else if (type === 'DROP_USER_TABLE') {
          const ok = await exec.dropUserTable(payload.tableName, payload.dbName || 'default');
          resPayload = { ok, catalog: extractFallbackCatalog(exec) };
        } else if (type === 'IMPORT_TABULAR') {
          const res = await exec.importTabularTable(payload.tableName, payload.columns, payload.rows);
          resPayload = { ...res, catalog: extractFallbackCatalog(exec) };
        } else if (type === 'IMPORT_SQLITE_BINARY') {
          await exec.loadDatabaseBinary(payload.binary);
          resPayload = { ok: true, catalog: extractFallbackCatalog(exec) };
        } else if (type === 'EXPORT_SNAPSHOT') {
          return exec.exportDatabaseBinary();
        } else if (type === 'EVALUATE_CHALLENGE') {
          const { evaluateChallengeSubmission } = await import('../../utils/challengeEvaluator');
          return evaluateChallengeSubmission(payload.challenge, payload.userSql);
        } else if (type === 'RESET') {
          exec.reset();
          resPayload = { ok: true, catalog: extractFallbackCatalog(exec) };
        } else if (type === 'GET_CATALOG') {
          return extractFallbackCatalog(exec);
        } else {
          throw new Error(`Unknown type: ${type}`);
        }

        if (resPayload && resPayload.catalog) {
          this.cachedCatalogSnapshot = resPayload.catalog;
          this.notifyCatalogListeners(resPayload.catalog);
        }
        return resPayload;
      })() as Promise<T>;
    }

    return new Promise<T>((resolve, reject) => {
      const timeoutMs = customTimeout !== undefined ? customTimeout : this.getTimeoutMs();

      let timerId: ReturnType<typeof setTimeout> | undefined;
      if (timeoutMs > 0) {
        timerId = setTimeout(() => {
          if (type === 'EXECUTE') {
            this.cancelActiveQuery('TIMEOUT');
          } else {
            this.pendingRequests.delete(id);
            reject(
              new Error(`Worker operation timed out after ${timeoutMs}ms`)
            );
          }
        }, timeoutMs);
      }

      this.pendingRequests.set(id, {
        resolve,
        reject,
        timerId,
        requestType: type,
      });

      if (type === 'EXECUTE') {
        this.activeExecutionId = id;
      }

      const req = { id, type, ...payload } as WorkerRequest;
      if (this.worker) {
        this.worker.postMessage(req);
      }
    });
  }

  /**
   * Immediately terminates the worker thread to break infinite CTE loops or freeze.
   * Spawns a clean worker and restores the last known database snapshot seamlessly.
   */
  public cancelActiveQuery(reason: 'USER_CANCELLED' | 'TIMEOUT' = 'USER_CANCELLED'): void {
    if (!this.worker) return;

    const cancelledId = this.activeExecutionId;
    this.activeExecutionId = null;

    // Reject in-flight execution promise
    if (cancelledId && this.pendingRequests.has(cancelledId)) {
      const pending = this.pendingRequests.get(cancelledId);
      if (pending) {
        if (pending.timerId) clearTimeout(pending.timerId);
        this.pendingRequests.delete(cancelledId);

        const isTimeout = reason === 'TIMEOUT';
        pending.reject(
          new Error(
            isTimeout
              ? 'Query execution exceeded timeout limit (5s)'
              : 'Query execution stopped by user'
          )
        );
      }
    }

    // Hard kill the Web Worker
    try {
      this.worker.terminate();
    } catch (e) {
      console.warn('Failed to terminate worker:', e);
    }
    this.worker = null;

    // Reject any other dangling requests
    for (const [reqId, p] of this.pendingRequests.entries()) {
      if (p.timerId) clearTimeout(p.timerId);
      p.reject(new Error('Worker restarted due to query cancellation.'));
    }
    this.pendingRequests.clear();

    // Respawn fresh worker and restore state
    this.spawnWorker();
    if (this.lastKnownSnapshot && this.worker) {
      this.sendRequest('INIT', { snapshot: this.lastKnownSnapshot }).catch(console.warn);
    }
  }

  public async init(snapshot?: Uint8Array): Promise<{ initialized: boolean; catalog: WorkerCatalogTableDTO[] }> {
    if (snapshot) {
      this.lastKnownSnapshot = snapshot;
    }
    const res = await this.sendRequest('INIT', { snapshot }, 15000);
    if (res?.catalog) {
      this.cachedCatalogSnapshot = res.catalog;
      this.notifyCatalogListeners(res.catalog);
    }
    return res;
  }

  public async execute(
    sql: string,
    dialect: Dialect,
    options?: { rowsPerTable?: number; tableCap?: number }
  ): Promise<ExecutionResult> {
    const res = await this.sendRequest('EXECUTE', { sql, dialect, options });

    // Auto-update snapshot after successful mutation
    if (res.result?.ok) {
      this.exportSnapshot()
        .then((snap) => {
          if (snap) this.lastKnownSnapshot = snap;
        })
        .catch(() => {});
    }

    return res.result;
  }

  public async createUserDatabase(dbName: string): Promise<boolean> {
    const res = await this.sendRequest('CREATE_USER_DB', { dbName });
    return Boolean(res?.ok);
  }

  public async dropUserDatabase(dbName: string): Promise<boolean> {
    const res = await this.sendRequest('DROP_USER_DB', { dbName });
    return Boolean(res?.ok);
  }

  public async createUserTable(
    tableName: string,
    ddlSqlOrColumns: string | ColumnFormRow[],
    columnsOrDbName?: ColumnFormRow[] | string,
    dbNameOrSeedRows?: string | number,
    seedRows?: number
  ): Promise<any> {
    let ddlSql = '';
    let columns: ColumnFormRow[] = [];
    let dbName = 'default';
    let rows = 20;

    if (typeof ddlSqlOrColumns === 'string') {
      ddlSql = ddlSqlOrColumns;
      columns = Array.isArray(columnsOrDbName) ? columnsOrDbName : [];
      dbName = typeof dbNameOrSeedRows === 'string' ? dbNameOrSeedRows : 'default';
      rows = typeof seedRows === 'number' ? seedRows : 20;
    } else {
      columns = ddlSqlOrColumns;
      dbName = typeof columnsOrDbName === 'string' ? columnsOrDbName : 'default';
      rows = typeof dbNameOrSeedRows === 'number' ? dbNameOrSeedRows : 20;
    }

    const res = await this.sendRequest('CREATE_USER_TABLE', { tableName, ddlSql, columns, dbName, seedRows: rows });
    this.exportSnapshot().then((snap) => { if (snap) this.lastKnownSnapshot = snap; }).catch(() => {});
    return res;
  }

  public async dropUserTable(tableName: string, dbName?: string): Promise<boolean> {
    const res = await this.sendRequest('DROP_USER_TABLE', { tableName, dbName });
    this.exportSnapshot().then((snap) => { if (snap) this.lastKnownSnapshot = snap; }).catch(() => {});
    return Boolean(res?.ok);
  }

  public async importTabular(
    tableName: string,
    columns: Array<{ name: string; sqliteType: string }>,
    rows: unknown[][],
    dbName?: string
  ): Promise<any> {
    const res = await this.sendRequest('IMPORT_TABULAR', { tableName, columns, rows, dbName }, 20000);
    this.exportSnapshot().then((snap) => { if (snap) this.lastKnownSnapshot = snap; }).catch(() => {});
    return res;
  }

  public async importSqliteBinary(binary: Uint8Array): Promise<boolean> {
    this.lastKnownSnapshot = binary;
    const res = await this.sendRequest('IMPORT_SQLITE_BINARY', { binary }, 20000);
    return Boolean(res?.ok);
  }

  public async loadSqliteBinary(binary: Uint8Array): Promise<boolean> {
    return this.importSqliteBinary(binary);
  }

  public async exportSnapshot(): Promise<Uint8Array | null> {
    const res = await this.sendRequest<Uint8Array | null>('EXPORT_SNAPSHOT', {}, 10000);
    if (res) this.lastKnownSnapshot = res;
    return res;
  }

  public async exportDatabaseBinary(): Promise<Uint8Array | null> {
    return this.exportSnapshot();
  }

  public async getCatalog(): Promise<WorkerCatalogTableDTO[]> {
    if (this.cachedCatalogSnapshot.tables.length > 0) return this.cachedCatalogSnapshot.tables;
    const res = await this.sendRequest<CatalogSnapshotDTO>('GET_CATALOG');
    if (res && res.tables) {
      this.cachedCatalogSnapshot = res;
      this.notifyCatalogListeners(res);
    }
    return this.cachedCatalogSnapshot.tables;
  }

  public getCachedCatalog(): WorkerCatalogTableDTO[] {
    return this.cachedCatalogSnapshot.tables;
  }

  public getCatalogSnapshot(): CatalogSnapshotDTO {
    return this.cachedCatalogSnapshot;
  }

  public onCatalogChange(listener: CatalogListener): () => void {
    this.catalogListeners.add(listener);
    if (this.cachedCatalogSnapshot) {
      try {
        listener(this.cachedCatalogSnapshot);
      } catch (e) {
        console.error('Initial catalog listener error:', e);
      }
    }
    return () => {
      this.catalogListeners.delete(listener);
    };
  }

  public async undoLastMutation(): Promise<{ undone: boolean; message: string }> {
    const res = await this.sendRequest<{ undone: boolean; message: string; catalog?: CatalogSnapshotDTO }>('UNDO_LAST_MUTATION');
    if (res && res.catalog) {
      this.cachedCatalogSnapshot = res.catalog;
      this.notifyCatalogListeners(res.catalog);
    }
    return res;
  }

  public async evaluateChallenge(
    challenge: SQLChallenge,
    userSql: string,
    dialect: Dialect
  ): Promise<EvaluationResult> {
    return this.sendRequest<EvaluationResult>('EVALUATE_CHALLENGE', { challenge, userSql, dialect }, 15000);
  }

  public async reset(): Promise<boolean> {
    this.lastKnownSnapshot = null;
    const res = await this.sendRequest('RESET');
    this.cachedCatalogSnapshot = { databases: ['default'], tables: [], version: Date.now() };
    this.notifyCatalogListeners(this.cachedCatalogSnapshot);
    return Boolean(res?.ok);
  }

  public subscribeCatalog(listener: (catalog: WorkerCatalogTableDTO[]) => void): () => void {
    this.legacyCatalogListeners.add(listener);
    if (this.cachedCatalogSnapshot.tables.length > 0) {
      listener(this.cachedCatalogSnapshot.tables);
    }
    return () => {
      this.legacyCatalogListeners.delete(listener);
    };
  }

  private triggerAutoSave(tableCount: number) {
    if (!this.isBrowser) return;
    if (this.debouncedAutoSaveTimer) {
      clearTimeout(this.debouncedAutoSaveTimer);
    }
    this.debouncedAutoSaveTimer = setTimeout(async () => {
      try {
        const binary = await this.exportSnapshot();
        if (binary && binary.byteLength > 0 && binary.byteLength <= 25 * 1024 * 1024) {
          const { saveDatabaseSnapshot } = await import('../../hooks/useWorkspaceStorage');
          await saveDatabaseSnapshot('autosave_latest', binary, tableCount);
        }
      } catch (err) {
        console.warn('Auto-save database snapshot failed:', err);
      }
    }, 1200);
  }

  private notifyCatalogListeners(catalog: CatalogSnapshotDTO): void {
    for (const listener of this.catalogListeners) {
      try {
        listener(catalog);
      } catch (e) {
        console.error('Catalog listener error:', e);
      }
    }
    for (const legacy of this.legacyCatalogListeners) {
      try {
        legacy(catalog.tables || []);
      } catch (e) {
        console.error('Legacy catalog listener error:', e);
      }
    }
  }
}

export const sqlWorkerClient = SQLWorkerClient.getInstance();
