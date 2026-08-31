import { describe, it, expect, beforeEach } from 'vitest';
import { inferSchemaCached, globalInferenceCache } from '../../engine/inferenceCache';

describe('InferenceCache (LRU Memoization)', () => {
  beforeEach(() => {
    globalInferenceCache.clear();
  });

  it('should infer schema and cache result on first call', () => {
    const query = 'SELECT customer_id, first_name, email FROM customers;';
    expect(globalInferenceCache.size).toBe(0);

    const firstResult = inferSchemaCached(query, 'MySQL');
    expect(globalInferenceCache.size).toBe(1);
    expect(firstResult.has('customers')).toBe(true);

    const cachedResult = inferSchemaCached(query, 'MySQL');
    expect(cachedResult).toBe(firstResult); // Object identity match from LRU cache
    expect(globalInferenceCache.size).toBe(1);
  });

  it('should differentiate cache entries by dialect', () => {
    const query = 'SELECT id, created_at FROM orders;';
    const mysqlResult = inferSchemaCached(query, 'MySQL');
    const pgResult = inferSchemaCached(query, 'PostgreSQL');

    expect(globalInferenceCache.size).toBe(2);
    expect(mysqlResult.has('orders')).toBe(true);
    expect(pgResult.has('orders')).toBe(true);
  });

  it('should handle cache clear properly', () => {
    inferSchemaCached('SELECT id FROM users;', 'SQLite');
    expect(globalInferenceCache.size).toBe(1);

    globalInferenceCache.clear();
    expect(globalInferenceCache.size).toBe(0);
  });
});
