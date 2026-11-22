import { describe, it, expect } from 'vitest';
import { inferRecommendedIndex, parsePlanNodes } from '../../components/IDE/ExplainPlanViewer';

describe('Phase 9 — Interactive What-If Index Advisor & EXPLAIN Analyzer', () => {
  describe('inferRecommendedIndex', () => {
    it('infers index on filtered column from WHERE clause', () => {
      const sql = 'SELECT * FROM orders WHERE customer_id = 42;';
      const rec = inferRecommendedIndex(sql, ['orders']);
      expect(rec).not.toBeNull();
      expect(rec?.table).toBe('orders');
      expect(rec?.column).toBe('customer_id');
      expect(rec?.indexSql).toBe('CREATE INDEX idx_orders_customer_id ON orders(customer_id);');
    });

    it('infers index on join condition column from JOIN ON clause', () => {
      const sql = 'SELECT * FROM users u INNER JOIN orders ON orders.user_id = u.id;';
      const rec = inferRecommendedIndex(sql, ['orders']);
      expect(rec).not.toBeNull();
      expect(rec?.table).toBe('orders');
      expect(rec?.column).toBe('user_id');
      expect(rec?.indexSql).toBe('CREATE INDEX idx_orders_user_id ON orders(user_id);');
    });

    it('infers index on ORDER BY column when no filter is present', () => {
      const sql = 'SELECT * FROM products ORDER BY created_at DESC;';
      const rec = inferRecommendedIndex(sql, ['products']);
      expect(rec).not.toBeNull();
      expect(rec?.table).toBe('products');
      expect(rec?.column).toBe('created_at');
      expect(rec?.indexSql).toBe('CREATE INDEX idx_products_created_at ON products(created_at);');
    });

    it('falls back to id index when query has no explicit column filter', () => {
      const sql = 'SELECT * FROM logs;';
      const rec = inferRecommendedIndex(sql, ['logs']);
      expect(rec).not.toBeNull();
      expect(rec?.table).toBe('logs');
      expect(rec?.column).toBe('id');
      expect(rec?.indexSql).toBe('CREATE INDEX idx_logs_id ON logs(id);');
    });

    it('returns null if there are no scanned tables', () => {
      const rec = inferRecommendedIndex('SELECT 1;', []);
      expect(rec).toBeNull();
    });
  });

  describe('parsePlanNodes', () => {
    it('correctly maps raw SQLite explain rows into hierarchical plan nodes', () => {
      const rawRows = [
        [0, 0, 0, 'SCAN TABLE orders'],
        [1, 0, 0, 'USE TEMP B-TREE FOR ORDER BY'],
      ];
      const nodes = parsePlanNodes(rawRows);
      expect(nodes).toHaveLength(2);
      expect(nodes[0].opType).toBe('SCAN');
      expect(nodes[0].detail).toContain('SCAN TABLE orders');
      expect(nodes[1].opType).toBe('SORT');
    });

    it('classifies index search operations correctly', () => {
      const rawRows = [
        [0, 0, 0, 'SEARCH TABLE orders USING INDEX idx_orders_customer_id (customer_id=?)'],
      ];
      const nodes = parsePlanNodes(rawRows);
      expect(nodes).toHaveLength(1);
      expect(nodes[0].opType).toBe('INDEX');
    });
  });
});
