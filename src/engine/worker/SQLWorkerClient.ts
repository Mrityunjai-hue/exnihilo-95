/**
 * SQLWorkerClient.ts — Resilient Main-Thread RPC Client for Off-Thread Web Worker
 * Includes 5s watchdog timeout, hard thread cancellation, and transparent state recovery.
 */

import type { Dialect } from '../parser';
import type { ExecutionResult } from '../executor';
import type { SQLChallenge } from '../../data/challenges/types';
import type { EvaluationResult } from '../../utils/challengeEvaluator';
import type { ColumnFormRow } from '../../utils/dbManagerUtils';
import type { WorkerRequest, WorkerResponse, WorkerCatalogTableDTO } from './protocol';

type CatalogListener = (catalog: WorkerCatalogTableDTO[]) => void;

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
  private cachedCatalog: WorkerCatalogTableDTO[] = [];

  // Fallback direct executor for Node / Vitest SSR environments
  private fallbackExecutor: any = null;

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
        const cat = (res.payload as any).catalog as WorkerCatalogTableDTO[];
        if (Array.isArray(cat)) {
          this.cachedCatalog = cat;
          this.notifyCatalogListeners(cat);
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
        if (type === 'INIT') {
          return { initialized: true, catalog: [] };
        }
        if (type === 'EXECUTE') {
          const res = await exec.execute(payload.sql, payload.dialect, payload.options);
          return { result: res, catalog: [] };
        }
        if (type === 'CREATE_USER_DB') {
          const ok = exec.createUserDatabase(payload.dbName);
          return { ok, catalog: [] };
        }
        if (type === 'DROP_USER_DB') {
          const ok = await exec.dropUserDatabase(payload.dbName);
          return { ok, catalog: [] };
        }
        if (type === 'CREATE_USER_TABLE') {
          const { buildCreateTableSql } = await import('../../utils/dbManagerUtils');
          const ddl = buildCreateTableSql(payload.tableName, payload.columns, [], 'SQLite');
          const res = await exec.createUserTable(
            payload.tableName,
            ddl,
            payload.columns,
            payload.dbName || 'default',
            payload.seedRows || 20
          );
          return { ...res, catalog: [] };
        }
        if (type === 'DROP_USER_TABLE') {
          const ok = await exec.dropUserTable(payload.tableName, payload.dbName || 'default');
          return { ok, catalog: [] };
        }
        if (type === 'IMPORT_TABULAR') {
          const res = await exec.importTabularTable(payload.tableName, payload.columns, payload.rows);
          return { ...res, catalog: [] };
        }
        if (type === 'IMPORT_SQLITE_BINARY') {
          await exec.loadDatabaseBinary(payload.binary);
          return { ok: true, catalog: [] };
        }
        if (type === 'EXPORT_SNAPSHOT') {
          return exec.exportDatabaseBinary();
        }
        if (type === 'EVALUATE_CHALLENGE') {
          const { evaluateChallengeSubmission } = await import('../../utils/challengeEvaluator');
          return evaluateChallengeSubmission(payload.challenge, payload.userSql);
        }
        if (type === 'RESET') {
          exec.reset();
          return { ok: true, catalog: [] };
        }
        throw new Error(`Unknown type: ${type}`);
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
      this.cachedCatalog = res.catalog;
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
    columns: ColumnFormRow[],
    dbName?: string,
    seedRows?: number
  ): Promise<any> {
    const res = await this.sendRequest('CREATE_USER_TABLE', { tableName, columns, dbName, seedRows });
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
    rows: unknown[][]
  ): Promise<any> {
    const res = await this.sendRequest('IMPORT_TABULAR', { tableName, columns, rows }, 20000);
    this.exportSnapshot().then((snap) => { if (snap) this.lastKnownSnapshot = snap; }).catch(() => {});
    return res;
  }

  public async importSqliteBinary(binary: Uint8Array): Promise<boolean> {
    this.lastKnownSnapshot = binary;
    const res = await this.sendRequest('IMPORT_SQLITE_BINARY', { binary }, 20000);
    return Boolean(res?.ok);
  }

  public async exportSnapshot(): Promise<Uint8Array | null> {
    const res = await this.sendRequest<Uint8Array | null>('EXPORT_SNAPSHOT', {}, 10000);
    if (res) this.lastKnownSnapshot = res;
    return res;
  }

  public async getCatalog(): Promise<WorkerCatalogTableDTO[]> {
    if (this.cachedCatalog.length > 0) return this.cachedCatalog;
    const res = await this.sendRequest<WorkerCatalogTableDTO[]>('GET_CATALOG');
    if (Array.isArray(res)) {
      this.cachedCatalog = res;
      this.notifyCatalogListeners(res);
    }
    return res || [];
  }

  public getCachedCatalog(): WorkerCatalogTableDTO[] {
    return this.cachedCatalog;
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
    this.cachedCatalog = [];
    this.notifyCatalogListeners([]);
    return Boolean(res?.ok);
  }

  public subscribeCatalog(listener: CatalogListener): () => void {
    this.catalogListeners.add(listener);
    if (this.cachedCatalog.length > 0) {
      listener(this.cachedCatalog);
    }
    return () => {
      this.catalogListeners.delete(listener);
    };
  }

  private notifyCatalogListeners(catalog: WorkerCatalogTableDTO[]): void {
    for (const listener of this.catalogListeners) {
      try {
        listener(catalog);
      } catch (e) {
        console.error('Catalog listener error:', e);
      }
    }
  }
}

export const sqlWorkerClient = SQLWorkerClient.getInstance();
