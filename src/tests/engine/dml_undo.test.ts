import { describe, it, expect, beforeEach } from 'vitest';
import { sqlWorkerClient } from '../../engine/worker/SQLWorkerClient';

describe('Phase 10 — Safe DML Mutation Diff & 1-Click Undo', () => {
  beforeEach(async () => {
    await sqlWorkerClient.init();
    await sqlWorkerClient.reset();
  });

  it('captures mutation diff and supports 1-click undo for UPDATE operations', async () => {
    // 1. Create a table with initial records
    await sqlWorkerClient.execute(
      'CREATE TABLE inventory (id INTEGER PRIMARY KEY, item TEXT, stock INTEGER);',
      'SQLite'
    );
    await sqlWorkerClient.execute(
      "INSERT INTO inventory (id, item, stock) VALUES (1, 'Floppy Disk', 50), (2, 'CRT Monitor', 10);",
      'SQLite'
    );

    // Verify initial stock
    const initRes: any = await sqlWorkerClient.execute('SELECT stock FROM inventory WHERE id = 1;', 'SQLite');
    expect(initRes.rows[0][0]).toBe(50);

    // 2. Perform UPDATE mutation
    const updateRes: any = await sqlWorkerClient.execute(
      'UPDATE inventory SET stock = 999 WHERE id = 1;',
      'SQLite'
    );

    expect(updateRes.ok).toBe(true);
    expect(updateRes.rowCount).toBe(1);
    expect((updateRes as any).mutationDiff).toBeDefined();
    expect((updateRes as any).mutationDiff.tableName).toBe('inventory');
    expect((updateRes as any).mutationDiff.type).toBe('UPDATE');
    expect((updateRes as any).mutationDiff.rowsAffected).toBe(1);

    // Check mutated value
    const postRes: any = await sqlWorkerClient.execute('SELECT stock FROM inventory WHERE id = 1;', 'SQLite');
    expect(postRes.rows[0][0]).toBe(999);

    // 3. Trigger 1-Click Undo
    const undoRes = await sqlWorkerClient.undoLastMutation();
    expect(undoRes.undone).toBe(true);
    expect(undoRes.message).toContain('Successfully reverted');

    // 4. Verify value is restored
    const restoredRes: any = await sqlWorkerClient.execute('SELECT stock FROM inventory WHERE id = 1;', 'SQLite');
    expect(restoredRes.rows[0][0]).toBe(50);
  });

  it('supports 1-click undo for DELETE operations', async () => {
    await sqlWorkerClient.execute(
      'CREATE TABLE staff (id INTEGER PRIMARY KEY, name TEXT);',
      'SQLite'
    );
    await sqlWorkerClient.execute(
      "INSERT INTO staff (id, name) VALUES (1, 'Alice'), (2, 'Bob');",
      'SQLite'
    );

    // Delete Alice
    const delRes: any = await sqlWorkerClient.execute("DELETE FROM staff WHERE name = 'Alice';", 'SQLite');
    expect(delRes.rowCount).toBe(1);

    const checkDel: any = await sqlWorkerClient.execute('SELECT COUNT(*) FROM staff;', 'SQLite');
    expect(checkDel.rows[0][0]).toBe(1);

    // Revert DELETE
    const undo = await sqlWorkerClient.undoLastMutation();
    expect(undo.undone).toBe(true);

    const checkRestored: any = await sqlWorkerClient.execute('SELECT COUNT(*) FROM staff;', 'SQLite');
    expect(checkRestored.rows[0][0]).toBe(2);
  });

  it('returns undone: false when no checkpoint exists to revert', async () => {
    const res = await sqlWorkerClient.undoLastMutation();
    expect(res.undone).toBe(false);
  });
});
