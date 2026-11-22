/**
 * protocol.ts — Typed RPC Protocol for SQL Web Worker Engine
 */

import type { Dialect } from '../parser';
import type { ExecutionSuccess } from '../executor';
import type { ClassifiedError } from '../errors';
import type { SQLChallenge } from '../../data/challenges/types';
import type { EvaluationResult } from '../../utils/challengeEvaluator';
import type { ColumnFormRow } from '../../utils/dbManagerUtils';

export interface WorkerCatalogTableDTO {
  tableName: string;
  dbName: string;
  rowCount: number;
  isUserCreated: boolean;
  columns: Array<{
    name: string;
    logicalType: string;
    sqliteType: string;
    isPrimaryKey?: boolean;
  }>;
}

export type WorkerRequest =
  | { id: string; type: 'INIT'; snapshot?: Uint8Array }
  | { id: string; type: 'EXECUTE'; sql: string; dialect: Dialect; options?: { rowsPerTable?: number; tableCap?: number } }
  | { id: string; type: 'CREATE_USER_DB'; dbName: string }
  | { id: string; type: 'DROP_USER_DB'; dbName: string }
  | { id: string; type: 'CREATE_USER_TABLE'; tableName: string; columns: ColumnFormRow[]; dbName?: string; seedRows?: number }
  | { id: string; type: 'DROP_USER_TABLE'; tableName: string; dbName?: string }
  | { id: string; type: 'IMPORT_TABULAR'; tableName: string; columns: Array<{ name: string; sqliteType: string }>; rows: unknown[][] }
  | { id: string; type: 'IMPORT_SQLITE_BINARY'; binary: Uint8Array }
  | { id: string; type: 'EXPORT_SNAPSHOT' }
  | { id: string; type: 'GET_CATALOG' }
  | { id: string; type: 'EVALUATE_CHALLENGE'; challenge: SQLChallenge; userSql: string; dialect?: Dialect }
  | { id: string; type: 'RESET' };

export type WorkerResponse =
  | { id: string; ok: true; payload: unknown }
  | { id: string; ok: false; error: ClassifiedError | { message: string; code: string } };
