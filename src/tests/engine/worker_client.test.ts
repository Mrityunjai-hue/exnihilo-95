import { describe, it, expect, beforeEach } from 'vitest';
import { SQLWorkerClient } from '../../engine/worker/SQLWorkerClient';

describe('SQLWorkerClient (Node SSR / Fallback Mode)', () => {
  let client: SQLWorkerClient;

  beforeEach(() => {
    client = SQLWorkerClient.getInstance();
  });

  it('initializes successfully in fallback environment', async () => {
    const res = await client.init();
    expect(res).toBeDefined();
    expect(res.initialized).toBe(true);
  });

  it('executes a synthesized relational query correctly', async () => {
    await client.init();
    const result = await client.execute(
      'SELECT id, name, email FROM customers WHERE id = 1;',
      'SQLite'
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.columns).toEqual(['id', 'name', 'email']);
      expect(result.rows.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('handles query cancellation without corrupting client state', () => {
    expect(() => {
      client.cancelActiveQuery('USER_CANCELLED');
    }).not.toThrow();
  });

  it('creates and drops user databases cleanly', async () => {
    const created = await client.createUserDatabase('test_tenant');
    expect(created).toBe(true);
    const dropped = await client.dropUserDatabase('test_tenant');
    expect(dropped).toBe(true);
  });
});
