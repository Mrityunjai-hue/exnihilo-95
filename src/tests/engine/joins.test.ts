import { describe, it, expect, beforeEach } from 'vitest';
import { SQLExecutor, evaluateFullOuterJoin } from '../../engine/executor';
import { parse, extractJoinTypes } from '../../engine/parser';

describe('Batch 1 — FULL OUTER JOIN & FULL JOIN Engine', () => {
  let executor: SQLExecutor;

  beforeEach(() => {
    executor = new SQLExecutor();
  });

  describe('AST Parser — Join Type Recognition', () => {
    it('recognizes FULL OUTER JOIN in TransactSQL dialect', () => {
      const res = parse('SELECT * FROM t1 FULL OUTER JOIN t2 ON t1.id = t2.id', 'TransactSQL');
      expect(res.ok).toBe(true);
      if (res.ok && res.ast) {
        const joins = extractJoinTypes(res.ast);
        expect(joins).toContain('FULL OUTER JOIN');
      }
    });

    it('recognizes FULL JOIN in PostgreSQL dialect', () => {
      const res = parse('SELECT * FROM t1 FULL JOIN t2 ON t1.id = t2.id', 'PostgreSQL');
      expect(res.ok).toBe(true);
      if (res.ok && res.ast) {
        const joins = extractJoinTypes(res.ast);
        expect(joins).toContain('FULL JOIN');
      }
    });
  });

  describe('Pure Evaluator — evaluateFullOuterJoin', () => {
    it('correctly returns matching rows, unmatched left rows, and unmatched right rows', () => {
      const left = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
      ];
      const right = [
        { id: 1, score: 100 },
        { id: 3, score: 300 },
      ];

      const result = evaluateFullOuterJoin(left, right, (l, r) => l.id === r.id);

      expect(result).toHaveLength(3);

      // Match 1: Alice (100)
      expect(result[0]).toEqual({
        leftRow: { id: 1, name: 'Alice' },
        rightRow: { id: 1, score: 100 },
      });

      // Unmatched left: Bob (NULL)
      expect(result[1]).toEqual({
        leftRow: { id: 2, name: 'Bob' },
        rightRow: null,
      });

      // Unmatched right: NULL (300)
      expect(result[2]).toEqual({
        leftRow: null,
        rightRow: { id: 3, score: 300 },
      });
    });
  });

  describe('SQLExecutor — FULL OUTER JOIN WASM Execution', () => {
    it('executes FULL OUTER JOIN and returns matched, left unmatched, and right unmatched rows', async () => {
      const setupQuery = `
        CREATE TABLE employees (emp_id INT, emp_name TEXT, dept_id INT);
        INSERT INTO employees VALUES (1, 'Alice', 10), (2, 'Bob', 20);

        CREATE TABLE departments (dept_id INT, dept_name TEXT);
        INSERT INTO departments VALUES (10, 'Engineering'), (30, 'Sales');

        SELECT e.emp_name, d.dept_name
        FROM employees e
        FULL OUTER JOIN departments d ON e.dept_id = d.dept_id;
      `;

      const result = await executor.execute(setupQuery, 'PostgreSQL');
      expect(result.ok).toBe(true);

      if (result.ok) {
        // Alice -> Engineering
        // Bob -> NULL (unmatched left)
        // NULL -> Sales (unmatched right)
        expect(result.rows).toHaveLength(3);
        expect(result.rows).toEqual([
          ['Alice', 'Engineering'],
          ['Bob', null],
          [null, 'Sales'],
        ]);
      }
    });
  });
});
