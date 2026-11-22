/**
 * challengeEvaluator.ts — Automated WASM Evaluation & Scoring Engine
 * Compares user SQL output against ground truth datasets with cell-by-cell float tolerances,
 * column header normalization, multiset row frequency comparison, and hidden edge case grading.
 */

import { SQLChallenge } from '../data/challenges/types';
import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import { registerCustomSqliteFunctions } from '../engine/sqliteFunctions';
import type { Dialect } from '../engine/parser';

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
 * Checks if two row tuples match across all columns in order
 */
function rowsMatch(rowA: any[], rowB: any[]): boolean {
  if (!rowA || !rowB || rowA.length !== rowB.length) return false;
  for (let c = 0; c < rowA.length; c++) {
    if (!valuesMatch(rowA[c], rowB[c])) return false;
  }
  return true;
}

/**
 * Evaluates a user SQL query submission against a challenge payload
 */
export async function evaluateChallengeSubmission(
  challenge: SQLChallenge,
  userSql: string,
  _dialect?: Dialect
): Promise<EvaluationResult> {
  const startTime = performance.now();
  let db: SqlJsDatabase | null = null;

  try {
    const SQL = await getSqlJs();
    db = new SQL.Database();
    if (!db) {
      throw new Error('Failed to initialize SQLite WASM database');
    }

    // Register all custom multi-dialect functions
    registerCustomSqliteFunctions(db);

    // 1. Materialize DDL Schema and DML Seed Dataset
    db.run(challenge.inputSchemaSql);
    db.run(challenge.seedDataSql);

    // 2. Execute User SQL Query
    const results = db.exec(userSql);
    const runtimeMs = performance.now() - startTime;

    if (!results || results.length === 0) {
      const isExpectedEmpty = challenge.expectedOutput.rows.length === 0;
      return {
        isCorrect: isExpectedEmpty,
        status: isExpectedEmpty ? 'ACCEPTED' : 'ROW_COUNT_MISMATCH',
        errorMessage: isExpectedEmpty ? undefined : 'Query returned 0 rows.',
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

    for (let c = 0; c < expectedCols.length; c++) {
      if (userColumns[c].toLowerCase() !== expectedCols[c].toLowerCase()) {
        return {
          isCorrect: false,
          status: 'COLUMN_MISMATCH',
          errorMessage: `Column header mismatch at position ${c + 1}: Expected "${expectedCols[c]}", but query returned "${userColumns[c]}". Use "AS ${expectedCols[c]}" to alias the column.`,
          runtimeMs,
          userResult,
          expectedOutput: challenge.expectedOutput,
        };
      }
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

    // 5. Row Comparison: Order-dependent vs Multiset frequency matching
    const requireStrictOrder = Boolean(challenge.requireOrder || challenge.ordered);

    if (requireStrictOrder) {
      const mismatches: {
        rowIdx: number;
        colIdx: number;
        colName: string;
        userVal: any;
        expectedVal: any;
      }[] = [];

      for (let r = 0; r < expectedRows.length; r++) {
        for (let c = 0; c < expectedCols.length; c++) {
          const uVal = userRows[r] ? userRows[r][c] : undefined;
          const eVal = expectedRows[r][c];

          if (!valuesMatch(uVal, eVal)) {
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

      if (mismatches.length > 0) {
        return {
          isCorrect: false,
          status: 'WRONG_ANSWER',
          errorMessage: `Wrong answer: ${mismatches.length} cell(s) mismatched output expectation (ORDER BY required).`,
          runtimeMs,
          userResult,
          expectedOutput: challenge.expectedOutput,
          mismatches,
        };
      }
    } else {
      // Multiset 1-to-1 matching
      const matchedExpectedIndices = new Set<number>();
      for (let uIdx = 0; uIdx < userRows.length; uIdx++) {
        const uRow = userRows[uIdx];
        let foundMatch = false;

        for (let eIdx = 0; eIdx < expectedRows.length; eIdx++) {
          if (matchedExpectedIndices.has(eIdx)) continue;
          if (rowsMatch(uRow, expectedRows[eIdx])) {
            matchedExpectedIndices.add(eIdx);
            foundMatch = true;
            break;
          }
        }

        if (!foundMatch) {
          return {
            isCorrect: false,
            status: 'WRONG_ANSWER',
            errorMessage: `Wrong answer: User row [${uRow.join(', ')}] does not match any expected row in the target set.`,
            runtimeMs,
            userResult,
            expectedOutput: challenge.expectedOutput,
          };
        }
      }
    }

    // 6. Grade Hidden Edge Test Cases (if configured)
    if (challenge.hiddenTestCases && challenge.hiddenTestCases.length > 0) {
      for (let i = 0; i < challenge.hiddenTestCases.length; i++) {
        const tc = challenge.hiddenTestCases[i];
        let tcDb: SqlJsDatabase | null = null;
        try {
          tcDb = new SQL.Database();
          if (!tcDb) {
            throw new Error('Failed to initialize SQLite for hidden test case');
          }
          registerCustomSqliteFunctions(tcDb);
          tcDb.run(challenge.inputSchemaSql);
          tcDb.run(tc.seedDataSql);

          const tcRes = tcDb.exec(userSql);
          const tcUserRows = tcRes[0]?.values || [];

          if (tcUserRows.length !== tc.expectedOutput.rows.length) {
            return {
              isCorrect: false,
              status: 'WRONG_ANSWER',
              errorMessage: `Failed on hidden edge case #${i + 1} (${tc.name}): Expected ${tc.expectedOutput.rows.length} rows, but query returned ${tcUserRows.length}. Check boundary & NULL conditions.`,
              runtimeMs,
              expectedOutput: challenge.expectedOutput,
            };
          }

          // Check multiset matching on hidden case
          const matchedTc = new Set<number>();
          for (const uRow of tcUserRows) {
            let matched = false;
            for (let eIdx = 0; eIdx < tc.expectedOutput.rows.length; eIdx++) {
              if (matchedTc.has(eIdx)) continue;
              if (rowsMatch(uRow, tc.expectedOutput.rows[eIdx])) {
                matchedTc.add(eIdx);
                matched = true;
                break;
              }
            }
            if (!matched) {
              return {
                isCorrect: false,
                status: 'WRONG_ANSWER',
                errorMessage: `Failed on hidden edge case #${i + 1} (${tc.name}): Produced unexpected values on edge case dataset.`,
                runtimeMs,
                expectedOutput: challenge.expectedOutput,
              };
            }
          }
        } finally {
          if (tcDb) {
            try { tcDb.close(); } catch {}
          }
        }
      }
    }

    return {
      isCorrect: true,
      status: 'ACCEPTED',
      runtimeMs,
      userResult,
      expectedOutput: challenge.expectedOutput,
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
