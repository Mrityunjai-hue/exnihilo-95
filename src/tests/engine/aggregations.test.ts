import { describe, it, expect, beforeEach } from 'vitest';
import { SQLExecutor, evaluateStringAggregate } from '../../engine/executor';
import { parse, extractStringAggregates } from '../../engine/parser';

describe('Batch 1 — String Aggregation Engine (GROUP_CONCAT & STRING_AGG)', () => {
  let executor: SQLExecutor;

  beforeEach(() => {
    executor = new SQLExecutor();
  });

  describe('AST Parser — String Aggregate Extraction', () => {
    it('extracts STRING_AGG with custom separator in PostgreSQL', () => {
      const res = parse("SELECT category, STRING_AGG(product_name, ', ') FROM products GROUP BY category", 'PostgreSQL');
      expect(res.ok).toBe(true);
      if (res.ok && res.ast) {
        const specs = extractStringAggregates(res.ast);
        expect(specs).toHaveLength(1);
        expect(specs[0]).toEqual({
          functionName: 'STRING_AGG',
          alias: 'string_agg',
          targetColumn: 'product_name',
          separator: ', ',
        });
      }
    });

    it('extracts GROUP_CONCAT with custom separator in SQLite', () => {
      const res = parse("SELECT category, GROUP_CONCAT(product_name, ' - ') FROM products GROUP BY category", 'SQLite');
      expect(res.ok).toBe(true);
      if (res.ok && res.ast) {
        const specs = extractStringAggregates(res.ast);
        expect(specs).toHaveLength(1);
        expect(specs[0]).toEqual({
          functionName: 'GROUP_CONCAT',
          alias: 'group_concat',
          targetColumn: 'product_name',
          separator: ' - ',
        });
      }
    });

    it('extracts GROUP_CONCAT with SEPARATOR syntax in MySQL', () => {
      const res = parse("SELECT category, GROUP_CONCAT(product_name SEPARATOR ' | ') FROM products GROUP BY category", 'MySQL');
      expect(res.ok).toBe(true);
      if (res.ok && res.ast) {
        const specs = extractStringAggregates(res.ast);
        expect(specs).toHaveLength(1);
        expect(specs[0]).toEqual({
          functionName: 'GROUP_CONCAT',
          alias: 'group_concat',
          targetColumn: 'product_name',
          separator: ' | ',
        });
      }
    });
  });

  describe('Pure Evaluator — evaluateStringAggregate', () => {
    it('concatenates strings with default separator', () => {
      const result = evaluateStringAggregate(['Apple', 'Banana', 'Cherry']);
      expect(result).toBe('Apple,Banana,Cherry');
    });

    it('concatenates strings with custom separator', () => {
      const result = evaluateStringAggregate(['Apple', 'Banana', 'Cherry'], ' -> ');
      expect(result).toBe('Apple -> Banana -> Cherry');
    });

    it('ignores NULL and undefined values', () => {
      const result = evaluateStringAggregate(['Apple', null, 'Cherry', undefined], '; ');
      expect(result).toBe('Apple; Cherry');
    });

    it('returns null if all values are NULL', () => {
      const result = evaluateStringAggregate([null, undefined, null]);
      expect(result).toBeNull();
    });
  });

  describe('SQLExecutor — End-to-End Query Execution', () => {
    it('executes STRING_AGG in PostgreSQL dialect with custom separator', async () => {
      const query = `
        CREATE TABLE items (category TEXT, name TEXT);
        INSERT INTO items VALUES ('Tech', 'Laptop'), ('Tech', 'Phone'), ('Office', 'Pen');

        SELECT category, STRING_AGG(name, ', ') AS item_list
        FROM items
        GROUP BY category
        ORDER BY category;
      `;

      const result = await executor.execute(query, 'PostgreSQL');
      expect(result.ok).toBe(true);

      if (result.ok) {
        expect(result.rows).toEqual([
          ['Office', 'Pen'],
          ['Tech', 'Laptop, Phone'],
        ]);
      }
    });

    it('executes GROUP_CONCAT in MySQL dialect with SEPARATOR syntax', async () => {
      const query = `
        CREATE TABLE items (category TEXT, name TEXT);
        INSERT INTO items VALUES ('Tech', 'Laptop'), ('Tech', 'Phone'), ('Office', 'Pen');

        SELECT category, GROUP_CONCAT(name SEPARATOR ' | ') AS item_list
        FROM items
        GROUP BY category
        ORDER BY category;
      `;

      const result = await executor.execute(query, 'MySQL');
      expect(result.ok).toBe(true);

      if (result.ok) {
        expect(result.rows).toEqual([
          ['Office', 'Pen'],
          ['Tech', 'Laptop | Phone'],
        ]);
      }
    });

    it('executes GROUP_CONCAT in SQLite dialect', async () => {
      const query = `
        CREATE TABLE items (category TEXT, name TEXT);
        INSERT INTO items VALUES ('Tech', 'Laptop'), ('Tech', 'Phone'), ('Office', 'Pen');

        SELECT category, GROUP_CONCAT(name, ' - ') AS item_list
        FROM items
        GROUP BY category
        ORDER BY category;
      `;

      const result = await executor.execute(query, 'SQLite');
      expect(result.ok).toBe(true);

      if (result.ok) {
        expect(result.rows).toEqual([
          ['Office', 'Pen'],
          ['Tech', 'Laptop - Phone'],
        ]);
      }
    });
  });
});
