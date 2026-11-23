/**
 * sql.worker.ts — Dedicated Off-Thread Web Worker SQL & WASM Execution Kernel
 */

import { SQLExecutor } from '../executor';
import { classifyError } from '../errors';
import { evaluateChallengeSubmission } from '../../utils/challengeEvaluator';
import { buildCreateTableSql } from '../../utils/dbManagerUtils';
import type { WorkerRequest, WorkerResponse, CatalogSnapshotDTO, TableEntryDTO, MutationDiffDTO } from './protocol';

let executor: SQLExecutor | null = null;
let lastPreMutationSnapshot: Uint8Array | null = null;
let lastMutationDiff: MutationDiffDTO | null = null;

function getExecutor(): SQLExecutor {
  if (!executor) {
    executor = new SQLExecutor();
  }
  return executor;
}

function extractCatalogSnapshot(exec: SQLExecutor): CatalogSnapshotDTO {
  const cat = exec.getCatalog();
  const dbNames = cat.getDatabaseNames();
  const entries = cat.getAll();

  const tables: TableEntryDTO[] = entries.map((entry) => {
    const fks = exec.getTableForeignKeys(entry.tableName);
    const fkMap = new Map<string, { table: string; column: string }>();
    fks.forEach((f) => fkMap.set(f.from.toLowerCase(), { table: f.toTable, column: f.toCol }));

    const sampleRows = exec.getTableSampleRows(entry.tableName, 5);

    return {
      tableName: entry.tableName,
      dbName: entry.dbName || 'default',
      rowCount: entry.rowCount,
      isUserCreated: entry.isUserDefined,
      columns: (entry.schema?.columns || []).map((col) => {
        const colLower = col.name.toLowerCase();
        const fk = fkMap.get(colLower) || (col as any).references;
        return {
          name: col.name,
          logicalType: col.logicalType,
          sqliteType: col.sqliteType,
          isPrimaryKey: Boolean((col as any).isPrimaryKey || colLower === 'id' || colLower === `${entry.tableName.toLowerCase()}_id`),
          isForeignKey: Boolean(fk),
          referencesTable: fk?.table,
          referencesColumn: fk?.column || 'id',
        };
      }),
      sampleRows,
    };
  });

  return {
    databases: dbNames.length > 0 ? dbNames : ['default'],
    tables,
    version: Date.now(),
  };
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
        payload = { initialized: true, catalog: extractCatalogSnapshot(exec) };
        break;
      }

      case 'EXECUTE': {
        const isMutation = /^\s*(UPDATE|DELETE|INSERT)\b/i.test(req.sql);
        let preSnapshot: Uint8Array | null = null;
        let mutationTargetTable = '';
        let preRows: any[] = [];

        if (isMutation) {
          preSnapshot = exec.exportDatabaseBinary();
          const match = req.sql.match(/(?:UPDATE|FROM|INTO)\s+["`]?([a-zA-Z0-9_]+)["`]?/i);
          if (match && match[1]) {
            mutationTargetTable = match[1];
            preRows = exec.getTableSampleRows(mutationTargetTable, 5);
          }
        }

        const result = await exec.execute(req.sql, req.dialect, req.options);

        if (isMutation && preSnapshot) {
          lastPreMutationSnapshot = preSnapshot;
          let postRows: any[] = [];
          if (mutationTargetTable) {
            postRows = exec.getTableSampleRows(mutationTargetTable, 5);
          }

          const mType = req.sql.trim().toUpperCase().startsWith('UPDATE')
            ? 'UPDATE'
            : req.sql.trim().toUpperCase().startsWith('DELETE')
            ? 'DELETE'
            : 'INSERT';

          lastMutationDiff = {
            tableName: mutationTargetTable || 'table',
            type: mType,
            rowsAffected: result.ok ? result.rowCount : 0,
            preRows,
            postRows,
            timestamp: Date.now(),
          };
          (result as any).mutationDiff = lastMutationDiff;
        }

        payload = {
          result,
          catalog: extractCatalogSnapshot(exec),
        };
        break;
      }

      case 'UNDO_LAST_MUTATION': {
        if (!lastPreMutationSnapshot) {
          payload = { undone: false, message: 'No mutation checkpoint available to undo.' };
        } else {
          await exec.loadDatabaseBinary(lastPreMutationSnapshot);
          lastPreMutationSnapshot = null;
          lastMutationDiff = null;
          payload = {
            undone: true,
            message: 'Successfully reverted database to pre-mutation state.',
            catalog: extractCatalogSnapshot(exec),
          };
        }
        break;
      }

      case 'CREATE_USER_DB': {
        const ok = exec.createUserDatabase(req.dbName);
        payload = { ok, catalog: extractCatalogSnapshot(exec) };
        break;
      }

      case 'DROP_USER_DB': {
        const ok = await exec.dropUserDatabase(req.dbName);
        payload = { ok, catalog: extractCatalogSnapshot(exec) };
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
        payload = { ...res, catalog: extractCatalogSnapshot(exec) };
        break;
      }

      case 'DROP_USER_TABLE': {
        const ok = await exec.dropUserTable(req.tableName, req.dbName || 'default');
        payload = { ok, catalog: extractCatalogSnapshot(exec) };
        break;
      }

      case 'IMPORT_TABULAR': {
        const res = await exec.importTabularTable(req.tableName, req.columns, req.rows);
        payload = { ...res, catalog: extractCatalogSnapshot(exec) };
        break;
      }

      case 'IMPORT_SQLITE_BINARY': {
        await exec.loadDatabaseBinary(req.binary);
        payload = { ok: true, catalog: extractCatalogSnapshot(exec) };
        break;
      }

      case 'EXPORT_SNAPSHOT': {
        payload = exec.exportDatabaseBinary();
        break;
      }

      case 'GET_CATALOG': {
        payload = extractCatalogSnapshot(exec);
        break;
      }

      case 'EVALUATE_CHALLENGE': {
        payload = await evaluateChallengeSubmission(req.challenge, req.userSql);
        break;
      }

      case 'RESET': {
        exec.reset();
        payload = { ok: true, catalog: extractCatalogSnapshot(exec) };
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
