/**
 * sql.worker.ts — Dedicated Off-Thread Web Worker SQL & WASM Execution Kernel
 */

import { SQLExecutor } from '../executor';
import { classifyError } from '../errors';
import { evaluateChallengeSubmission } from '../../utils/challengeEvaluator';
import { buildCreateTableSql } from '../../utils/dbManagerUtils';
import type { SessionCatalog } from '../catalog';
import type { WorkerRequest, WorkerResponse, WorkerCatalogTableDTO } from './protocol';

let executor: SQLExecutor | null = null;

function getExecutor(): SQLExecutor {
  if (!executor) {
    executor = new SQLExecutor();
  }
  return executor;
}

function extractCatalogDTO(catalog: SessionCatalog): WorkerCatalogTableDTO[] {
  return catalog.getAll().map((entry) => ({
    tableName: entry.tableName,
    dbName: entry.dbName || 'default',
    rowCount: entry.rowCount,
    isUserCreated: entry.isUserDefined,
    columns: entry.schema.columns.map((col) => ({
      name: col.name,
      logicalType: col.logicalType,
      sqliteType: col.sqliteType,
    })),
  }));
}

self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const req = event.data;
  if (!req || !req.id || !req.type) return;

  try {
    const exec = getExecutor();
    let payload: unknown = null;

    switch (req.type) {
      case 'INIT': {
        await exec.init();
        if (req.snapshot && req.snapshot.byteLength > 0) {
          await exec.loadDatabaseBinary(req.snapshot);
        }
        payload = { initialized: true, catalog: extractCatalogDTO(exec.getCatalog()) };
        break;
      }

      case 'EXECUTE': {
        const result = await exec.execute(req.sql, req.dialect, req.options);
        payload = {
          result,
          catalog: extractCatalogDTO(exec.getCatalog()),
        };
        break;
      }

      case 'CREATE_USER_DB': {
        const ok = exec.createUserDatabase(req.dbName);
        payload = { ok, catalog: extractCatalogDTO(exec.getCatalog()) };
        break;
      }

      case 'DROP_USER_DB': {
        const ok = await exec.dropUserDatabase(req.dbName);
        payload = { ok, catalog: extractCatalogDTO(exec.getCatalog()) };
        break;
      }

      case 'CREATE_USER_TABLE': {
        const ddl = buildCreateTableSql(req.tableName, req.columns, [], 'SQLite');
        const res = await exec.createUserTable(
          req.tableName,
          ddl,
          req.columns,
          req.dbName || 'default',
          req.seedRows || 20
        );
        payload = { ...res, catalog: extractCatalogDTO(exec.getCatalog()) };
        break;
      }

      case 'DROP_USER_TABLE': {
        const ok = await exec.dropUserTable(req.tableName, req.dbName || 'default');
        payload = { ok, catalog: extractCatalogDTO(exec.getCatalog()) };
        break;
      }

      case 'IMPORT_TABULAR': {
        const res = await exec.importTabularTable(req.tableName, req.columns, req.rows);
        payload = { ...res, catalog: extractCatalogDTO(exec.getCatalog()) };
        break;
      }

      case 'IMPORT_SQLITE_BINARY': {
        await exec.loadDatabaseBinary(req.binary);
        payload = { ok: true, catalog: extractCatalogDTO(exec.getCatalog()) };
        break;
      }

      case 'EXPORT_SNAPSHOT': {
        payload = exec.exportDatabaseBinary();
        break;
      }

      case 'GET_CATALOG': {
        payload = extractCatalogDTO(exec.getCatalog());
        break;
      }

      case 'EVALUATE_CHALLENGE': {
        payload = await evaluateChallengeSubmission(req.challenge, req.userSql);
        break;
      }

      case 'RESET': {
        exec.reset();
        payload = { ok: true, catalog: [] };
        break;
      }

      default:
        throw new Error(`Unknown worker request type: ${(req as any).type}`);
    }

    const response: WorkerResponse = { id: req.id, ok: true, payload };
    self.postMessage(response);
  } catch (err: any) {
    const classified = classifyError(err);
    const response: WorkerResponse = {
      id: req.id,
      ok: false,
      error: classified,
    };
    self.postMessage(response);
  }
};
