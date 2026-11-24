/**
 * ExNihilo 95 — Headless Relational Synthesis & Database Engine
 * Public programmatic library exports.
 * 
 * Original concept & architecture by Mrityunjai (https://github.com/Mrityunjai-hue)
 * Licensed under the MIT License with Mandatory Attribution.
 */

import { SQLExecutor, ExecutionResult, transpileDialectForSqlite, getOrInitSqlJs } from './executor';
import { Dialect } from './parser';
import { inferSchema, InferredSchemaMap, TableSchema, ColumnDef } from './inference';
import { generateSyntheticDataset, GeneratorOptions, generateCreateTableSql, generateInsertSql } from './generator';
import { inferColumnIntelligence, SemanticColumnInference } from './column_intelligence';
import { DetectiveEvaluator } from './detective_evaluator';

// Re-export Core Classes and Types
export { SQLExecutor, transpileDialectForSqlite, getOrInitSqlJs };
export type { ExecutionResult, Dialect, InferredSchemaMap, TableSchema, ColumnDef, GeneratorOptions, SemanticColumnInference };
export { inferSchema, generateSyntheticDataset, generateCreateTableSql, generateInsertSql, inferColumnIntelligence, DetectiveEvaluator };

/**
 * Executes any SQL query "ex nihilo" — deducing schemas, resolving implied
 * foreign key relationships, synthesizing mock datasets, and executing in SQLite WASM.
 *
 * @param sql The SQL query to execute (any dialect: MySQL, PostgreSQL, SQLite, SSMS/T-SQL, Oracle)
 * @param options Configuration for dialect and row density
 */
export async function executeSQL(
  sql: string,
  options?: { dialect?: Dialect; rowsPerTable?: number }
): Promise<ExecutionResult> {
  const executor = new SQLExecutor();
  await executor.init();
  return executor.execute(sql, options?.dialect ?? 'MySQL', {
    rowsPerTable: options?.rowsPerTable ?? 20,
  });
}

/**
 * Transpiles dialect-specific SQL syntax (e.g. T-SQL TOP n / [brackets], Oracle ROWNUM)
 * into standard SQLite-compatible syntax.
 */
export function transpileSQL(sql: string): string {
  return transpileDialectForSqlite(sql);
}
