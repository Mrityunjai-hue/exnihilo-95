/**
 * window.test.ts — Complete Core & Advanced Window Functions Vitest Suite (Phase 1 & Phase 2)
 *
 * Phase 1: ROW_NUMBER(), RANK(), DENSE_RANK() with PARTITION BY and ORDER BY.
 * Phase 2: Positional (LEAD, LAG), Sliding Frames (ROWS BETWEEN), Aggregates (SUM, AVG, MIN, MAX, COUNT).
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SQLExecutor } from '../../engine/executor';
import { extractWindowSpecs, parse } from '../../engine/parser';

describe('Core & Advanced Window Functions Engine Tests (Phase 1 & Phase 2)', () => {
  let executor: SQLExecutor;

  beforeEach(async () => {
    executor = new SQLExecutor();
    await executor.init();
    executor.reset();
  });

  // ── 1. AST Window Specification & Frame Parser ─────────────────────────────
  describe('AST Window Specification Parser', () => {
    it('extracts PARTITION BY, ORDER BY, and ROWS BETWEEN sliding frame bounds', () => {
      const sql = `
        SELECT region, month, sales,
               AVG(sales) OVER (PARTITION BY region ORDER BY month ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING) AS moving_avg,
               LEAD(sales, 2, 0) OVER (PARTITION BY region ORDER BY month ASC) AS lead_val,
               LAG(sales, 1) OVER (PARTITION BY region ORDER BY month ASC) AS lag_val
        FROM sales;
      `;
      const parseResult = parse(sql, 'PostgreSQL');
      expect(parseResult.ok).toBe(true);

      if (parseResult.ok) {
        const specs = extractWindowSpecs(parseResult.ast);
        expect(specs).toHaveLength(3);

        // AVG moving average
        expect(specs[0].functionName).toBe('AVG');
        expect(specs[0].targetColumn).toBe('sales');
        expect(specs[0].frame.start).toEqual({ type: 'PRECEDING', offset: 1 });
        expect(specs[0].frame.end).toEqual({ type: 'FOLLOWING', offset: 1 });

        // LEAD
        expect(specs[1].functionName).toBe('LEAD');
        expect(specs[1].targetColumn).toBe('sales');
        expect(specs[1].args).toEqual(['sales', 2, 0]);

        // LAG
        expect(specs[2].functionName).toBe('LAG');
        expect(specs[2].targetColumn).toBe('sales');
        expect(specs[2].args).toEqual(['sales', 1, null]);
      }
    });

    it('applies default framing rules correctly (UNBOUNDED PRECEDING TO CURRENT ROW with ORDER BY)', () => {
      const sql = `SELECT name, SUM(salary) OVER (ORDER BY hired_date ASC) AS running_total FROM emp;`;
      const parseResult = parse(sql, 'PostgreSQL');
      expect(parseResult.ok).toBe(true);

      if (parseResult.ok) {
        const specs = extractWindowSpecs(parseResult.ast);
        expect(specs).toHaveLength(1);
        expect(specs[0].frame.start).toEqual({ type: 'UNBOUNDED_PRECEDING' });
        expect(specs[0].frame.end).toEqual({ type: 'CURRENT_ROW' });
      }
    });
  });

  // ── 2. Ranking Functions (ROW_NUMBER, RANK, DENSE_RANK) ───────────────────
  describe('Ranking Window Functions', () => {
    it('evaluates ROW_NUMBER() without partitioning or sorting', async () => {
      const sql = `SELECT id, name, ROW_NUMBER() OVER (ORDER BY id ASC) AS rn FROM employees;`;
      const res = await executor.execute(sql, 'PostgreSQL');

      expect(res.ok).toBe(true);
      if (res.ok) {
        const rnIdx = res.columns.indexOf('rn');
        expect(rnIdx).toBeGreaterThan(-1);
        const rns = res.rows.map(r => r[rnIdx]);
        rns.forEach((val, idx) => expect(val).toBe(idx + 1));
      }
    });

    it('evaluates ROW_NUMBER() with PARTITION BY resetting counter to 1 for each group', async () => {
      const sql = `
        SELECT department, salary, ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC) AS rn
        FROM employees;
      `;
      const res = await executor.execute(sql, 'MySQL');

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
          rns.forEach((val, idx) => expect(val).toBe(idx + 1));
        });
      }
    });

    it('demonstrates RANK() creating gaps (1, 2, 2, 4) vs DENSE_RANK() without gaps (1, 2, 2, 3)', async () => {
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

      expect(res.ok).toBe(true);
      if (res.ok) {
        const rkIdx = res.columns.indexOf('rk');
        const drkIdx = res.columns.indexOf('drk');

        expect(res.rows.map(r => r[rkIdx])).toEqual([1, 2, 2, 4]);
        expect(res.rows.map(r => r[drkIdx])).toEqual([1, 2, 2, 3]);
      }
    });
  });

  // ── 3. Positional Functions (LEAD, LAG) ───────────────────────────────────
  describe('Positional Window Functions (LEAD & LAG)', () => {
    it('evaluates LAG and LEAD with custom offset and default fallback values', async () => {
      await executor.execute(`CREATE TABLE sales_log (id INT, month_no INT, revenue INT);`, 'PostgreSQL');
      await executor.execute(`INSERT INTO sales_log (id, month_no, revenue) VALUES (1, 1, 1000);`, 'PostgreSQL');
      await executor.execute(`INSERT INTO sales_log (id, month_no, revenue) VALUES (2, 2, 1500);`, 'PostgreSQL');
      await executor.execute(`INSERT INTO sales_log (id, month_no, revenue) VALUES (3, 3, 2000);`, 'PostgreSQL');

      const query = `
        SELECT month_no, revenue,
               LAG(revenue, 1, 0) OVER (ORDER BY month_no ASC) AS prev_rev,
               LEAD(revenue, 1, -1) OVER (ORDER BY month_no ASC) AS next_rev
        FROM sales_log;
      `;
      const res = await executor.execute(query, 'PostgreSQL');

      expect(res.ok).toBe(true);
      if (res.ok) {
        const prevIdx = res.columns.indexOf('prev_rev');
        const nextIdx = res.columns.indexOf('next_rev');

        // LAG: month 1 -> 0 (fallback), month 2 -> 1000, month 3 -> 1500
        expect(res.rows.map(r => r[prevIdx])).toEqual([0, 1000, 1500]);

        // LEAD: month 1 -> 1500, month 2 -> 2000, month 3 -> -1 (fallback)
        expect(res.rows.map(r => r[nextIdx])).toEqual([1500, 2000, -1]);
      }
    });
  });

  // ── 4. Aggregate Window Functions & Sliding Frames ─────────────────────────
  describe('Sliding Frame Aggregate Window Functions', () => {
    it('calculates Running Total SUM(salary) OVER (ORDER BY hired_date)', async () => {
      await executor.execute(`CREATE TABLE emp_pay (id INT, name VARCHAR(50), salary INT);`, 'PostgreSQL');
      await executor.execute(`INSERT INTO emp_pay (id, name, salary) VALUES (1, 'Alice', 1000);`, 'PostgreSQL');
      await executor.execute(`INSERT INTO emp_pay (id, name, salary) VALUES (2, 'Bob', 2000);`, 'PostgreSQL');
      await executor.execute(`INSERT INTO emp_pay (id, name, salary) VALUES (3, 'Charlie', 3000);`, 'PostgreSQL');

      const query = `
        SELECT name, salary,
               SUM(salary) OVER (ORDER BY id ASC) AS running_total
        FROM emp_pay;
      `;
      const res = await executor.execute(query, 'PostgreSQL');

      expect(res.ok).toBe(true);
      if (res.ok) {
        const totalIdx = res.columns.indexOf('running_total');
        // Running totals: row1=1000, row2=3000, row3=6000
        expect(res.rows.map(r => r[totalIdx])).toEqual([1000, 3000, 6000]);
      }
    });

    it('calculates Moving Average AVG(sales) OVER (PARTITION BY region ORDER BY month ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING)', async () => {
      await executor.execute(`CREATE TABLE reg_sales (id INT, region VARCHAR(20), month_no INT, sales INT);`, 'PostgreSQL');
      await executor.execute(`INSERT INTO reg_sales (id, region, month_no, sales) VALUES (1, 'North', 1, 10);`, 'PostgreSQL');
      await executor.execute(`INSERT INTO reg_sales (id, region, month_no, sales) VALUES (2, 'North', 2, 20);`, 'PostgreSQL');
      await executor.execute(`INSERT INTO reg_sales (id, region, month_no, sales) VALUES (3, 'North', 3, 30);`, 'PostgreSQL');
      await executor.execute(`INSERT INTO reg_sales (id, region, month_no, sales) VALUES (4, 'North', 4, 40);`, 'PostgreSQL');

      const query = `
        SELECT region, month_no, sales,
               AVG(sales) OVER (PARTITION BY region ORDER BY month_no ASC ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING) AS moving_avg
        FROM reg_sales;
      `;
      const res = await executor.execute(query, 'PostgreSQL');

      expect(res.ok).toBe(true);
      if (res.ok) {
        const avgIdx = res.columns.indexOf('moving_avg');
        // Month 1: avg(10, 20) = 15
        // Month 2: avg(10, 20, 30) = 20
        // Month 3: avg(20, 30, 40) = 30
        // Month 4: avg(30, 40) = 35
        expect(res.rows.map(r => r[avgIdx])).toEqual([15, 20, 30, 35]);
      }
    });

    it('strictly isolates sliding frame boundaries within partition limits', async () => {
      await executor.execute(`CREATE TABLE multi_part (id INT, group_id VARCHAR(10), val INT);`, 'PostgreSQL');
      await executor.execute(`INSERT INTO multi_part (id, group_id, val) VALUES (1, 'A', 100);`, 'PostgreSQL');
      await executor.execute(`INSERT INTO multi_part (id, group_id, val) VALUES (2, 'A', 200);`, 'PostgreSQL');
      await executor.execute(`INSERT INTO multi_part (id, group_id, val) VALUES (3, 'B', 500);`, 'PostgreSQL');

      const query = `
        SELECT group_id, val,
               SUM(val) OVER (PARTITION BY group_id ORDER BY id ASC ROWS BETWEEN 1 PRECEDING AND CURRENT ROW) AS part_sum
        FROM multi_part;
      `;
      const res = await executor.execute(query, 'PostgreSQL');

      expect(res.ok).toBe(true);
      if (res.ok) {
        const sumIdx = res.columns.indexOf('part_sum');
        // Group A: row1=100, row2=300 (100+200)
        // Group B: row1=500 (Must NOT include Group A's 200!)
        expect(res.rows.map(r => r[sumIdx])).toEqual([100, 300, 500]);
      }
    });
  });
});
