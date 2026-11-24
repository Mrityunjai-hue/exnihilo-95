import { describe, it, expect, beforeEach } from 'vitest';
import { SQLExecutor } from '../../engine/executor';

describe('SQLExecutor - Boolean Comparisons & Predicates', () => {
  let executor: SQLExecutor;

  beforeEach(async () => {
    executor = new SQLExecutor();

    // Setup a table with mixed boolean storage representations ('true'/'false' strings, 1/0 integers)
    await executor.execute(`
      CREATE TABLE users (
        id INTEGER PRIMARY KEY,
        username TEXT,
        role TEXT,
        is_active TEXT,
        is_verified INTEGER
      );
    `, 'SQLite');

    await executor.execute(`
      INSERT INTO users (id, username, role, is_active, is_verified) VALUES
        (1, 'alice', 'admin', 'true', 1),
        (2, 'bob', 'user', 'false', 0),
        (3, 'charlie', 'manager', 'TRUE', 1),
        (4, 'david', 'editor', 'true', 0);
    `, 'SQLite');
  });

  it('matches text boolean rows with WHERE is_active = TRUE', async () => {
    const res = await executor.execute('SELECT id, username, is_active FROM users WHERE is_active = TRUE;', 'SQLite');
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.rowCount).toBe(3);
    const names = res.rows.map((r: any[]) => r[1]);
    expect(names).toContain('alice');
    expect(names).toContain('charlie');
    expect(names).toContain('david');
  });

  it('matches text boolean rows with lowercase WHERE is_active = true', async () => {
    const res = await executor.execute('SELECT id, username FROM users WHERE is_active = true;', 'SQLite');
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.rowCount).toBe(3);
  });

  it('matches false rows with WHERE is_active = FALSE and WHERE is_active = false', async () => {
    const resUpper = await executor.execute('SELECT id, username FROM users WHERE is_active = FALSE;', 'SQLite');
    expect(resUpper.ok).toBe(true);
    if (!resUpper.ok) return;
    expect(resUpper.rowCount).toBe(1);
    expect(resUpper.rows[0][1]).toBe('bob');

    const resLower = await executor.execute('SELECT id, username FROM users WHERE is_active = false;', 'SQLite');
    expect(resLower.ok).toBe(true);
    if (!resLower.ok) return;
    expect(resLower.rowCount).toBe(1);
    expect(resLower.rows[0][1]).toBe('bob');
  });

  it('matches boolean predicates using IS TRUE and IS FALSE', async () => {
    const resTrue = await executor.execute('SELECT id, username FROM users WHERE is_active IS TRUE;', 'SQLite');
    expect(resTrue.ok).toBe(true);
    if (!resTrue.ok) return;
    expect(resTrue.rowCount).toBe(3);

    const resFalse = await executor.execute('SELECT id, username FROM users WHERE is_active IS FALSE;', 'SQLite');
    expect(resFalse.ok).toBe(true);
    if (!resFalse.ok) return;
    expect(resFalse.rowCount).toBe(1);
  });

  it('matches boolean inequality predicates with != TRUE and IS NOT FALSE', async () => {
    const resNotTrue = await executor.execute('SELECT id, username FROM users WHERE is_active != TRUE;', 'SQLite');
    expect(resNotTrue.ok).toBe(true);
    if (!resNotTrue.ok) return;
    expect(resNotTrue.rowCount).toBe(1);
    expect(resNotTrue.rows[0][1]).toBe('bob');

    const resNotFalse = await executor.execute('SELECT id, username FROM users WHERE is_active IS NOT FALSE;', 'SQLite');
    expect(resNotFalse.ok).toBe(true);
    if (!resNotFalse.ok) return;
    expect(resNotFalse.rowCount).toBe(3);
  });
});
