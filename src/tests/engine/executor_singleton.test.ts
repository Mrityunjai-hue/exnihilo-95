import { describe, it, expect } from 'vitest';
import { SQLExecutor, getOrInitSqlJs } from '../../engine/executor';

describe('SQLExecutor & WASM Singleton', () => {
  it('should initialize and execute queries across multiple instances sharing WASM', async () => {
    const wasmModule = await getOrInitSqlJs();
    expect(wasmModule).toBeDefined();

    const executor1 = new SQLExecutor();
    const result1 = await executor1.execute('SELECT 1 as num, "hello" as greeting;', 'MySQL');
    expect(result1.ok).toBe(true);
    if (result1.ok) {
      expect(result1.columns).toContain('num');
      expect(result1.rows[0][0]).toBe(1);
    }

    const executor2 = new SQLExecutor();
    const result2 = await executor2.execute('SELECT customer_id, name FROM customers;', 'PostgreSQL');
    expect(result2.ok).toBe(true);
    if (result2.ok) {
      expect(result2.inferredTables).toContain('customers');
      expect(result2.rows.length).toBeGreaterThan(0);
    }
  });

  it('should correctly execute multi-statement batches', async () => {
    const executor = new SQLExecutor();
    const result = await executor.execute(
      'SELECT id, name FROM departments;\nSELECT id, title FROM projects;',
      'MySQL'
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.allResults).toBeDefined();
      expect(result.allResults?.length).toBe(2);
    }
  });
});
