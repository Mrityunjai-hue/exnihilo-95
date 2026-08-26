import { describe, it, expect, beforeEach } from 'vitest';
import { SQLExecutor } from '../../engine/executor';
import { parse, extractRecursiveCtes } from '../../engine/parser';

describe('Final Batch — Recursive CTEs (WITH RECURSIVE) Engine', () => {
  let executor: SQLExecutor;

  beforeEach(() => {
    executor = new SQLExecutor();
  });

  describe('AST Parser — Recursive CTE Extraction', () => {
    it('extracts CTE names and detects RECURSIVE keyword', () => {
      const sql = `
        WITH RECURSIVE cnt(x) AS (
          SELECT 1
          UNION ALL
          SELECT x + 1 FROM cnt WHERE x < 5
        )
        SELECT * FROM cnt;
      `;

      const res = parse(sql, 'PostgreSQL');
      expect(res.ok).toBe(true);

      const cteInfo = extractRecursiveCtes(sql, res.ok ? res.ast : undefined);
      expect(cteInfo.isRecursive).toBe(true);
      expect(cteInfo.cteNames).toContain('cnt');
    });
  });

  describe('SQLExecutor — End-to-End Recursive CTE Execution', () => {
    it('executes a simple counter WITH RECURSIVE query successfully', async () => {
      const query = `
        WITH RECURSIVE cnt(x) AS (
          SELECT 1
          UNION ALL
          SELECT x + 1 FROM cnt WHERE x < 5
        )
        SELECT * FROM cnt;
      `;

      const result = await executor.execute(query, 'PostgreSQL');
      expect(result.ok).toBe(true);

      if (result.ok) {
        expect(result.columns).toEqual(['x']);
        expect(result.rows).toEqual([
          [1],
          [2],
          [3],
          [4],
          [5],
        ]);
        expect(result.rowCount).toBe(5);
      }
    });

    it('executes a hierarchical tree traversal WITH RECURSIVE query', async () => {
      const setupAndRecursiveQuery = `
        CREATE TABLE categories (id INT, name TEXT, parent_id INT);
        INSERT INTO categories VALUES
          (1, 'Electronics', NULL),
          (2, 'Laptops', 1),
          (3, 'Gaming Laptops', 2);

        WITH RECURSIVE category_path(id, name, path) AS (
          SELECT id, name, name AS path
          FROM categories
          WHERE parent_id IS NULL

          UNION ALL

          SELECT c.id, c.name, cp.path || ' > ' || c.name
          FROM categories c
          JOIN category_path cp ON c.parent_id = cp.id
        )
        SELECT name, path FROM category_path ORDER BY id;
      `;

      const result = await executor.execute(setupAndRecursiveQuery, 'PostgreSQL');
      expect(result.ok).toBe(true);

      if (result.ok) {
        expect(result.rows).toEqual([
          ['Electronics', 'Electronics'],
          ['Laptops', 'Electronics > Laptops'],
          ['Gaming Laptops', 'Electronics > Laptops > Gaming Laptops'],
        ]);
      }
    });
  });
});
