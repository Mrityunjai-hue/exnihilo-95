import { describe, it, expect, beforeEach } from 'vitest';
import { SQLExecutor } from '../../engine/executor';
import { parse, extractRoutineStatements, extractTriggerStatements } from '../../engine/parser';

describe('Final Batch — Procedural Logic & Triggers Engine', () => {
  let executor: SQLExecutor;

  beforeEach(() => {
    executor = new SQLExecutor();
  });

  describe('AST Parser — Routine & Trigger Extraction', () => {
    it('extracts CREATE FUNCTION specifications', () => {
      const sql = 'CREATE FUNCTION add_tax(price INT, tax_rate INT) RETURNS INT RETURN price + (price * tax_rate / 100);';
      const specs = extractRoutineStatements(sql);
      expect(specs).toHaveLength(1);
      expect(specs[0].routineName).toBe('add_tax');
      expect(specs[0].type).toBe('FUNCTION');
      expect(specs[0].parameters).toEqual(['price INT', 'tax_rate INT']);
      expect(specs[0].returnType).toBe('INT');
    });

    it('extracts CREATE PROCEDURE specifications', () => {
      const sql = 'CREATE PROCEDURE process_orders(customer_id INT) SELECT * FROM orders WHERE cid = customer_id;';
      const specs = extractRoutineStatements(sql);
      expect(specs).toHaveLength(1);
      expect(specs[0].routineName).toBe('process_orders');
      expect(specs[0].type).toBe('PROCEDURE');
      expect(specs[0].parameters).toEqual(['customer_id INT']);
    });

    it('extracts CREATE TRIGGER specifications', () => {
      const sql = `
        CREATE TRIGGER audit_user_insert
        AFTER INSERT ON users
        BEGIN
          INSERT INTO user_logs VALUES (NEW.id, 'User Registered');
        END;
      `;
      const specs = extractTriggerStatements(sql);
      expect(specs).toHaveLength(1);
      expect(specs[0].triggerName).toBe('audit_user_insert');
      expect(specs[0].targetTable).toBe('users');
      expect(specs[0].timing).toBe('AFTER');
      expect(specs[0].event).toBe('INSERT');
    });
  });

  describe('SQLExecutor — Routine & Trigger Catalog Registries', () => {
    it('stores CREATE FUNCTION and CREATE PROCEDURE in catalog routine registry', async () => {
      const funcSql = 'CREATE FUNCTION calculate_bonus(salary INT) RETURNS INT RETURN salary * 0.1;';
      await executor.execute(funcSql, 'MySQL');

      expect(executor.getCatalog().hasRoutine('calculate_bonus')).toBe(true);
      const routine = executor.getCatalog().getRoutine('calculate_bonus');
      expect(routine).toBeDefined();
      expect(routine?.type).toBe('FUNCTION');

      const procSql = 'CREATE PROCEDURE archive_old_logs(cutoff_date DATE) DELETE FROM logs WHERE log_date < cutoff_date;';
      await executor.execute(procSql, 'MySQL');

      expect(executor.getCatalog().hasRoutine('archive_old_logs')).toBe(true);
      const proc = executor.getCatalog().getRoutine('archive_old_logs');
      expect(proc).toBeDefined();
      expect(proc?.type).toBe('PROCEDURE');
    });

    it('stores CREATE TRIGGER in catalog and fires natively in WASM engine', async () => {
      const triggerSetup = `
        CREATE TABLE users (id INT, name TEXT);
        CREATE TABLE user_logs (user_id INT, action TEXT);

        CREATE TRIGGER log_user_insert
        AFTER INSERT ON users
        BEGIN
          INSERT INTO user_logs VALUES (NEW.id, 'User Joined');
        END;
      `;

      const setupRes = await executor.execute(triggerSetup, 'SQLite');
      expect(setupRes.ok).toBe(true);

      // Verify trigger recorded in catalog & attached to table metadata
      expect(executor.getCatalog().hasTrigger('log_user_insert')).toBe(true);
      const userTableEntry = executor.getCatalog().get('users');
      expect(userTableEntry).toBeDefined();
      expect(userTableEntry?.triggers).toContain('log_user_insert');

      // Execute insert to fire trigger natively
      await executor.execute("INSERT INTO users VALUES (101, 'Alice');", 'SQLite');

      // Verify trigger automatically inserted log row into user_logs
      const logRes = await executor.execute('SELECT * FROM user_logs;', 'SQLite');
      expect(logRes.ok).toBe(true);
      if (logRes.ok) {
        expect(logRes.rows).toEqual([[101, 'User Joined']]);
      }
    });
  });
});
