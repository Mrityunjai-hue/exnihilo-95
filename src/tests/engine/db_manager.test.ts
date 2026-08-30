import { describe, it, expect, beforeEach } from 'vitest';
import { SQLExecutor } from '../../engine/executor';
import {
  DIALECT_TYPE_MANIFEST,
  buildColumnDDL,
  buildCreateTableSql,
  mapFormTypeToLogicalType,
  ColumnFormRow,
  TableConstraintForm,
} from '../../utils/dbManagerUtils';

describe('Visual Database Manager — Engine & Utility Test Suite', () => {
  let executor: SQLExecutor;

  beforeEach(() => {
    executor = new SQLExecutor();
  });

  // ── 1. Dialect Type Manifest & DDL Utilities ─────────────────────────────────

  describe('DIALECT_TYPE_MANIFEST & DDL Generator', () => {
    it('contains all 5 supported dialects', () => {
      expect(DIALECT_TYPE_MANIFEST).toHaveProperty('MySQL');
      expect(DIALECT_TYPE_MANIFEST).toHaveProperty('PostgreSQL');
      expect(DIALECT_TYPE_MANIFEST).toHaveProperty('SQLite');
      expect(DIALECT_TYPE_MANIFEST).toHaveProperty('TransactSQL');
      expect(DIALECT_TYPE_MANIFEST).toHaveProperty('SSMS');
    });

    it('maps form types correctly to engine logical types', () => {
      expect(mapFormTypeToLogicalType('INT')).toBe('INTEGER');
      expect(mapFormTypeToLogicalType('VARCHAR(255)')).toBe('VARCHAR');
      expect(mapFormTypeToLogicalType('DECIMAL(10,2)')).toBe('NUMERIC');
      expect(mapFormTypeToLogicalType('DATE')).toBe('DATE');
      expect(mapFormTypeToLogicalType('DATETIME')).toBe('TIMESTAMP');
      expect(mapFormTypeToLogicalType('BOOLEAN')).toBe('BOOLEAN');
    });

    it('builds column DDL for MySQL with UNSIGNED, NOT NULL, AUTO_INCREMENT', () => {
      const col: ColumnFormRow = {
        name: 'user_id',
        type: 'INT',
        isPrimaryKey: true,
        isAutoIncrement: true,
        isNotNull: true,
        isUnique: false,
        isUnsigned: true,
      };
      const ddl = buildColumnDDL(col, 'MySQL');
      expect(ddl).toContain('`user_id`');
      expect(ddl).toContain('INT');
      expect(ddl).toContain('UNSIGNED');
      expect(ddl).toContain('NOT NULL');
      expect(ddl).toContain('AUTO_INCREMENT');
      expect(ddl).toContain('PRIMARY KEY');
    });

    it('builds column DDL for PostgreSQL with SERIAL', () => {
      const col: ColumnFormRow = {
        name: 'id',
        type: 'SERIAL',
        isPrimaryKey: true,
        isAutoIncrement: true,
        isNotNull: true,
        isUnique: false,
      };
      const ddl = buildColumnDDL(col, 'PostgreSQL');
      expect(ddl).toContain('`id` SERIAL NOT NULL PRIMARY KEY');
    });

    it('builds column DDL for T-SQL with IDENTITY(1,1)', () => {
      const col: ColumnFormRow = {
        name: 'employee_id',
        type: 'INT',
        isPrimaryKey: true,
        isAutoIncrement: true,
        isNotNull: true,
        isUnique: false,
      };
      const ddl = buildColumnDDL(col, 'TransactSQL');
      expect(ddl).toContain('IDENTITY(1,1)');
    });

    it('builds Foreign Key reference clause', () => {
      const col: ColumnFormRow = {
        name: 'dept_id',
        type: 'INT',
        isPrimaryKey: false,
        isAutoIncrement: false,
        isNotNull: true,
        isUnique: false,
        references: { table: 'departments', column: 'id', onDelete: 'CASCADE', onUpdate: 'RESTRICT' },
      };
      const ddl = buildColumnDDL(col, 'MySQL');
      expect(ddl).toContain('REFERENCES departments(id) ON DELETE CASCADE ON UPDATE RESTRICT');
    });

    it('builds complete CREATE TABLE statement with table constraints', () => {
      const cols: ColumnFormRow[] = [
        { name: 'id', type: 'INT', isPrimaryKey: true, isAutoIncrement: true, isNotNull: true, isUnique: false },
        { name: 'salary', type: 'DECIMAL(10,2)', isPrimaryKey: false, isAutoIncrement: false, isNotNull: true, isUnique: false },
      ];
      const tableCons: TableConstraintForm[] = [
        { type: 'CHECK', expr: 'salary > 0' },
      ];
      const sql = buildCreateTableSql('employees', cols, tableCons, 'MySQL');
      expect(sql).toContain('CREATE TABLE IF NOT EXISTS employees');
      expect(sql).toContain('PRIMARY KEY');
      expect(sql).toContain('CHECK (salary > 0)');
    });
  });

  // ── 2. Database & Table Operations in SQLExecutor ─────────────────────────────

  describe('SQLExecutor Database Namespace API', () => {
    it('creates and validates new database namespaces', () => {
      const created = executor.createUserDatabase('analytics_db');
      expect(created).toBe(true);

      const catalog = executor.getCatalog();
      expect(catalog.hasDatabase('analytics_db')).toBe(true);

      // Duplicate database should fail
      const dup = executor.createUserDatabase('analytics_db');
      expect(dup).toBe(false);

      // Invalid name should fail
      const invalid = executor.createUserDatabase('123-invalid');
      expect(invalid).toBe(false);
    });

    it('creates user tables, generates synthetic data, and updates catalog', async () => {
      executor.createUserDatabase('company_db');

      const cols: ColumnFormRow[] = [
        { name: 'id', type: 'INT', isPrimaryKey: true, isAutoIncrement: true, isNotNull: true, isUnique: false },
        { name: 'name', type: 'VARCHAR(100)', isPrimaryKey: false, isAutoIncrement: false, isNotNull: true, isUnique: false },
        { name: 'salary', type: 'DECIMAL', isPrimaryKey: false, isAutoIncrement: false, isNotNull: false, isUnique: false },
      ];

      const ddl = buildCreateTableSql('staff', cols, [], 'MySQL');
      const res = await executor.createUserTable('staff', ddl, cols, 'company_db', 15);

      expect(res.ok).toBe(true);
      expect(res.rowCount).toBeGreaterThan(0);
      expect(res.rowCount).toBeLessThanOrEqual(25);

      const catalog = executor.getCatalog();
      const entry = catalog.get('staff', 'company_db');
      expect(entry).toBeDefined();
      expect(entry?.isUserDefined).toBe(true);
      expect(entry?.rowCount).toBe(res.rowCount);
    });

    it('can query created user tables via execute()', async () => {
      const cols: ColumnFormRow[] = [
        { name: 'id', type: 'INT', isPrimaryKey: true, isAutoIncrement: true, isNotNull: true, isUnique: false },
        { name: 'title', type: 'VARCHAR', isPrimaryKey: false, isAutoIncrement: false, isNotNull: true, isUnique: false },
      ];

      const ddl = buildCreateTableSql('projects', cols, [], 'SQLite');
      await executor.createUserTable('projects', ddl, cols, 'default', 10);

      const queryRes = await executor.execute('SELECT * FROM projects;', 'SQLite');
      expect(queryRes.ok).toBe(true);
      if (queryRes.ok) {
        expect(queryRes.rows.length).toBeGreaterThan(0);
        expect(queryRes.columns).toContain('id');
        expect(queryRes.columns).toContain('title');
      }
    });

    it('drops user tables and cleans up catalog', async () => {
      const cols: ColumnFormRow[] = [
        { name: 'id', type: 'INT', isPrimaryKey: true, isAutoIncrement: true, isNotNull: true, isUnique: false },
      ];
      const ddl = buildCreateTableSql('temp_data', cols, [], 'MySQL');
      await executor.createUserTable('temp_data', ddl, cols, 'default', 5);

      const catalog = executor.getCatalog();
      expect(catalog.has('temp_data')).toBe(true);

      const dropped = await executor.dropUserTable('temp_data', 'default');
      expect(dropped).toBe(true);
      expect(catalog.has('temp_data')).toBe(false);
    });

    it('drops entire user database and all its contained tables', async () => {
      executor.createUserDatabase('test_db');

      const cols: ColumnFormRow[] = [
        { name: 'id', type: 'INT', isPrimaryKey: true, isAutoIncrement: true, isNotNull: true, isUnique: false },
      ];
      const ddl = buildCreateTableSql('t1', cols, [], 'MySQL');
      await executor.createUserTable('t1', ddl, cols, 'test_db', 5);

      const catalog = executor.getCatalog();
      expect(catalog.hasDatabase('test_db')).toBe(true);

      const droppedDb = await executor.dropUserDatabase('test_db');
      expect(droppedDb).toBe(true);
      expect(catalog.hasDatabase('test_db')).toBe(false);
    });
  });
});
