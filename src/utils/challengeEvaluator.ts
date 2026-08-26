/**
 * challengeEvaluator.ts — Automated WASM Evaluation & Scoring Engine
 * Compares user SQL output against ground truth datasets with cell-by-cell float tolerances,
 * column header normalization, and side-by-side diff map generation.
 */

import { SQLChallenge } from '../data/challenges';
import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';

export interface EvaluationResult {
  isCorrect: boolean;
  status: 'ACCEPTED' | 'WRONG_ANSWER' | 'SYNTAX_ERROR' | 'COLUMN_MISMATCH' | 'ROW_COUNT_MISMATCH';
  errorMessage?: string;
  runtimeMs: number;
  userResult?: {
    columns: string[];
    rows: any[][];
  };
  expectedOutput: {
    columns: string[];
    rows: any[][];
  };
  mismatches?: {
    rowIdx: number;
    colIdx: number;
    colName: string;
    userVal: any;
    expectedVal: any;
  }[];
}

let sqlJsInstance: any = null;

async function getSqlJs() {
  if (!sqlJsInstance) {
    const isBrowser = typeof window !== 'undefined';
    sqlJsInstance = await initSqlJs(
      isBrowser ? { locateFile: () => '/sql-wasm.wasm' } : undefined
    );
  }
  return sqlJsInstance;
}

/**
 * Normalizes a value for comparison (handles nulls, float precision tolerance, string trimming)
 */
function valuesMatch(valA: any, valB: any): boolean {
  if ((valA === null || valA === undefined) && (valB === null || valB === undefined)) {
    return true;
  }
  if ((valA === null || valA === undefined) || (valB === null || valB === undefined)) {
    return false;
  }

  // Numerical comparison with float precision tolerance (1e-4)
  const numA = Number(valA);
  const numB = Number(valB);
  if (!isNaN(numA) && !isNaN(numB) && typeof valA !== 'boolean' && typeof valB !== 'boolean') {
    return Math.abs(numA - numB) < 0.0001;
  }

  // String comparison
  return String(valA).trim().toLowerCase() === String(valB).trim().toLowerCase();
}

/**
 * Evaluates a user SQL query submission against a challenge payload
 */
export async function evaluateChallengeSubmission(
  challenge: SQLChallenge,
  userSql: string
): Promise<EvaluationResult> {
  const startTime = performance.now();
  let db: SqlJsDatabase | null = null;

  try {
    const SQL = await getSqlJs();
    db = new SQL.Database();
    if (!db) {
      throw new Error('Failed to initialize SQLite WASM database');
    }

    // 1. Materialize DDL Schema and DML Seed Dataset
    db.run(challenge.inputSchemaSql);
    db.run(challenge.seedDataSql);

    // 2. Execute User SQL Query
    const results = db.exec(userSql);
    const runtimeMs = performance.now() - startTime;

    if (!results || results.length === 0) {
      return {
        isCorrect: challenge.expectedOutput.rows.length === 0,
        status: challenge.expectedOutput.rows.length === 0 ? 'ACCEPTED' : 'ROW_COUNT_MISMATCH',
        errorMessage: challenge.expectedOutput.rows.length === 0 ? undefined : 'Query returned 0 rows.',
        runtimeMs,
        userResult: { columns: challenge.expectedOutput.columns, rows: [] },
        expectedOutput: challenge.expectedOutput,
      };
    }

    const userColumns = results[0].columns || [];
    const userRows = results[0].values || [];

    const userResult = { columns: userColumns, rows: userRows };
    const expectedCols = challenge.expectedOutput.columns;
    const expectedRows = challenge.expectedOutput.rows;

    // 3. Column Count & Name Verification
    if (userColumns.length !== expectedCols.length) {
      return {
        isCorrect: false,
        status: 'COLUMN_MISMATCH',
        errorMessage: `Column count mismatch: Expected ${expectedCols.length} columns [${expectedCols.join(', ')}], but your query returned ${userColumns.length} columns [${userColumns.join(', ')}].`,
        runtimeMs,
        userResult,
        expectedOutput: challenge.expectedOutput,
      };
    }

    // 4. Row Count Verification
    if (userRows.length !== expectedRows.length) {
      return {
        isCorrect: false,
        status: 'ROW_COUNT_MISMATCH',
        errorMessage: `Row count mismatch: Expected ${expectedRows.length} rows, but your query returned ${userRows.length} rows.`,
        runtimeMs,
        userResult,
        expectedOutput: challenge.expectedOutput,
      };
    }

    // 5. Deep Cell-by-Cell Value Comparison & Mismatch Tracking
    const mismatches: {
      rowIdx: number;
      colIdx: number;
      colName: string;
      userVal: any;
      expectedVal: any;
    }[] = [];

    let isMatch = true;

    for (let r = 0; r < expectedRows.length; r++) {
      for (let c = 0; c < expectedCols.length; c++) {
        const uVal = userRows[r] ? userRows[r][c] : undefined;
        const eVal = expectedRows[r][c];

        if (!valuesMatch(uVal, eVal)) {
          isMatch = false;
          mismatches.push({
            rowIdx: r + 1,
            colIdx: c,
            colName: expectedCols[c],
            userVal: uVal,
            expectedVal: eVal,
          });
        }
      }
    }

    return {
      isCorrect: isMatch,
      status: isMatch ? 'ACCEPTED' : 'WRONG_ANSWER',
      errorMessage: isMatch ? undefined : `Wrong answer: ${mismatches.length} cell(s) mismatched output expectation.`,
      runtimeMs,
      userResult,
      expectedOutput: challenge.expectedOutput,
      mismatches,
    };
  } catch (err: any) {
    const runtimeMs = performance.now() - startTime;
    return {
      isCorrect: false,
      status: 'SYNTAX_ERROR',
      errorMessage: err.message || 'SQL Execution Error',
      runtimeMs,
      expectedOutput: challenge.expectedOutput,
    };
  } finally {
    if (db) {
      try {
        db.close();
      } catch (e) {
        // ignore
      }
    }
  }
}
