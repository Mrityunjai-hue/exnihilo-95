/**
 * window.test.ts — Core Ranking Window Functions Vitest Suite
 *
 * Tests parsing and execution pipeline for:
 *  - ROW_NUMBER()
 *  - RANK()
 *  - DENSE_RANK()
 *
 * Verifies:
 *  1. ROW_NUMBER() without partitioning or sorting.
 *  2. ROW_NUMBER() with PARTITION BY resetting counter to 1 for each group.
 *  3. Behavioral difference between RANK() and DENSE_RANK() on ties.
 *  4. Compound multi-column sorting with mixed directions (ASC/DESC).
 *  5. Cross-dialect execution (MySQL, PostgreSQL, SQLite, TransactSQL).
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SQLExecutor } from '../../engine/executor';
import { extractWindowSpecs, parse } from '../../engine/parser';

describe('Core Window Functions (Phase 1) Engine Tests', () => {
  let executor: SQLExecutor;

  beforeEach(async () => {
    executor = new SQLExecutor();
    await executor.init();
    executor.reset();
  });

  // ── 1. AST Window Specification Extraction ──────────────────────────────────
  describe('AST Window Specification Parser', () => {
    it('extracts PARTITION BY and ORDER BY with directions', () => {
      const sql = `
        SELECT name, department, salary,
               ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC) AS rn,
               RANK() OVER (PARTITION BY department ORDER BY salary DESC) AS rk,
               DENSE_RANK() OVER (ORDER BY salary ASC) AS drk
        FROM employees;
      `;
      const parseResult = parse(sql, 'MySQL');
      expect(parseResult.ok).toBe(true);

      if (parseResult.ok) {
        const specs = extractWindowSpecs(parseResult.ast);
        expect(specs).toHaveLength(3);

        // ROW_NUMBER
        expect(specs[0].functionName).toBe('ROW_NUMBER');
        expect(specs[0].partitionBy).toEqual(['department']);
        expect(specs[0].orderBy).toEqual([{ column: 'salary', direction: 'DESC' }]);

        // RANK
        expect(specs[1].functionName).toBe('RANK');
        expect(specs[1].partitionBy).toEqual(['department']);
        expect(specs[1].orderBy).toEqual([{ column: 'salary', direction: 'DESC' }]);

        // DENSE_RANK
        expect(specs[2].functionName).toBe('DENSE_RANK');
        expect(specs[2].partitionBy).toEqual([]);
        expect(specs[2].orderBy).toEqual([{ column: 'salary', direction: 'ASC' }]);
      }
    });
  });

  // ── 2. ROW_NUMBER() Execution ──────────────────────────────────────────────
  describe('ROW_NUMBER() Execution', () => {
    it('evaluates ROW_NUMBER() without partitioning or sorting', async () => {
      const sql = `SELECT id, name, ROW_NUMBER() OVER (ORDER BY id ASC) AS rn FROM employees;`;
      const res = await executor.execute(sql, 'PostgreSQL');

      if (!res.ok) {
        console.error('Test 1 Failure:', res.message);
      }
      expect(res.ok).toBe(true);
      if (res.ok) {
        const rnIdx = res.columns.indexOf('rn');
        expect(rnIdx).toBeGreaterThan(-1);

        const rns = res.rows.map(r => r[rnIdx]);
        expect(rns.length).toBeGreaterThan(0);
        rns.forEach((val, idx) => {
          expect(val).toBe(idx + 1);
        });
      }
    });

    it('evaluates ROW_NUMBER() with PARTITION BY resetting counter to 1 for each group', async () => {
      const sql = `
        SELECT department, salary, ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC) AS rn
        FROM employees;
      `;
      const res = await executor.execute(sql, 'MySQL');

      if (!res.ok) {
        console.error('Test 2 Failure:', res.message);
      }
      expect(res.ok).toBe(true);
      if (res.ok) {
        const deptIdx = res.columns.indexOf('department');
        const rnIdx = res.columns.indexOf('rn');

        const deptRns: Record<string, number[]> = {};
        res.rows.forEach(r => {
          const dept = String(r[deptIdx]);
          const rn = Number(r[rnIdx]);
          if (!deptRns[dept]) deptRns[dept] = [];
          deptRns[dept].push(rn);
        });

        Object.values(deptRns).forEach(rns => {
          expect(rns[0]).toBe(1);
          rns.forEach((val, idx) => {
            expect(val).toBe(idx + 1);
          });
        });
      }
    });
  });

  // ── 3. RANK() vs DENSE_RANK() Behavioral Tie Differences ───────────────────
  describe('RANK() vs DENSE_RANK() Tie Handling', () => {
    it('demonstrates RANK() creating gaps (1, 2, 2, 4) vs DENSE_RANK() without gaps (1, 2, 2, 3)', async () => {
      // Execute DDL and INSERT as separate single statements
      await executor.execute(`CREATE TABLE scores (id INT, student VARCHAR(50), score INT);`, 'PostgreSQL');
      await executor.execute(`INSERT INTO scores (id, student, score) VALUES (1, 'Alice', 100);`, 'PostgreSQL');
      await executor.execute(`INSERT INTO scores (id, student, score) VALUES (2, 'Bob', 90);`, 'PostgreSQL');
      await executor.execute(`INSERT INTO scores (id, student, score) VALUES (3, 'Charlie', 90);`, 'PostgreSQL');
      await executor.execute(`INSERT INTO scores (id, student, score) VALUES (4, 'Dave', 80);`, 'PostgreSQL');

      const query = `
        SELECT student, score,
               RANK() OVER (ORDER BY score DESC) AS rk,
               DENSE_RANK() OVER (ORDER BY score DESC) AS drk
        FROM scores;
      `;
      const res = await executor.execute(query, 'PostgreSQL');

      if (!res.ok) {
        console.error('Test 3 Failure:', res.message);
      }
      expect(res.ok).toBe(true);
      if (res.ok) {
        const rkIdx = res.columns.indexOf('rk');
        const drkIdx = res.columns.indexOf('drk');

        const ranks = res.rows.map(r => r[rkIdx]);
        const denseRanks = res.rows.map(r => r[drkIdx]);

        // RANK: 100->1, 90->2, 90->2, 80->4 (Gap at 3!)
        expect(ranks).toEqual([1, 2, 2, 4]);

        // DENSE_RANK: 100->1, 90->2, 90->2, 80->3 (No gap!)
        expect(denseRanks).toEqual([1, 2, 2, 3]);
      }
    });
  });

  // ── 4. Compound Multi-Column Ordering ──────────────────────────────────────
  describe('Compound Multi-Column Sorting', () => {
    it('correctly sorts compound columns with mixed ASC/DESC directions', async () => {
      const sql = `
        SELECT department, salary,
               ROW_NUMBER() OVER (ORDER BY department ASC, salary DESC) AS rn
        FROM employees;
      `;
      const res = await executor.execute(sql, 'PostgreSQL');

      expect(res.ok).toBe(true);
      if (res.ok) {
        const deptIdx = res.columns.indexOf('department');
        const salIdx = res.columns.indexOf('salary');

        for (let i = 1; i < res.rows.length; i++) {
          const prevDept = String(res.rows[i - 1][deptIdx]);
          const currDept = String(res.rows[i][deptIdx]);
          const prevSal = Number(res.rows[i - 1][salIdx]);
          const currSal = Number(res.rows[i][salIdx]);

          if (prevDept === currDept) {
            expect(prevSal).toBeGreaterThanOrEqual(currSal);
          } else {
            expect(prevDept.localeCompare(currDept)).toBeLessThanOrEqual(0);
          }
        }
      }
    });
  });

  // ── 5. Cross-Dialect Execution ─────────────────────────────────────────────
  describe('Cross-Dialect Execution', () => {
    const dialects: Array<'MySQL' | 'PostgreSQL' | 'SQLite' | 'TransactSQL'> = [
      'MySQL',
      'PostgreSQL',
      'SQLite',
      'TransactSQL',
    ];

    dialects.forEach(dialect => {
      it(`executes ROW_NUMBER() and RANK() in ${dialect} dialect`, async () => {
        const sql = `
          SELECT id, salary,
                 ROW_NUMBER() OVER (PARTITION BY id ORDER BY salary DESC) AS rn,
                 RANK() OVER (PARTITION BY id ORDER BY salary DESC) AS rk
          FROM employees;
        `;
        const res = await executor.execute(sql, dialect);
        if (!res.ok) {
          console.error(`Cross dialect ${dialect} failure:`, res.message);
        }
        expect(res.ok).toBe(true);
        if (res.ok) {
          expect(res.columns).toContain('rn');
          expect(res.columns).toContain('rk');
          expect(res.rows.length).toBeGreaterThan(0);
        }
      });
    });

  });
});

