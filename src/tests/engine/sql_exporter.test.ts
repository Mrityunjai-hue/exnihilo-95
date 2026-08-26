import { describe, it, expect } from 'vitest';
import {
  escapeSqlString,
  formatSqlValue,
  mapColumnTypeToDDL,
  generateDDLStatement,
  generateInsertStatements,
  ExportColumnDef,
} from '../../engine/sql_exporter';

describe('SQL Exporter Module', () => {
  describe('escapeSqlString()', () => {
    it('escapes single quotes correctly for MySQL', () => {
      expect(escapeSqlString("O'Reilly", 'MySQL')).toBe("'O\\'Reilly'");
    });

    it('escapes single quotes correctly for PostgreSQL/SQLite/TransactSQL', () => {
      expect(escapeSqlString("O'Reilly", 'PostgreSQL')).toBe("'O''Reilly'");
      expect(escapeSqlString("O'Reilly", 'SQLite')).toBe("'O''Reilly'");
      expect(escapeSqlString("O'Reilly", 'TransactSQL')).toBe("'O''Reilly'");
    });
  });

  describe('formatSqlValue()', () => {
    it('formats null values', () => {
      expect(formatSqlValue(null, 'MySQL')).toBe('NULL');
      expect(formatSqlValue(undefined, 'PostgreSQL')).toBe('NULL');
    });

    it('formats booleans per dialect', () => {
      expect(formatSqlValue(true, 'PostgreSQL')).toBe('TRUE');
      expect(formatSqlValue(false, 'SQLite')).toBe('0');
      expect(formatSqlValue(true, 'MySQL')).toBe('1');
      expect(formatSqlValue(false, 'TransactSQL')).toBe('0');
    });

    it('formats numbers and strings', () => {
      expect(formatSqlValue(42.5, 'MySQL')).toBe('42.5');
      expect(formatSqlValue('Hello World', 'SQLite')).toBe("'Hello World'");
    });
  });

  describe('mapColumnTypeToDDL()', () => {
    it('maps types for MySQL', () => {
      expect(mapColumnTypeToDDL('INTEGER', 'MySQL', 'id')).toBe('INT AUTO_INCREMENT');
      expect(mapColumnTypeToDDL('VARCHAR', 'MySQL', 'name')).toBe('VARCHAR(255)');
      expect(mapColumnTypeToDDL('NUMERIC', 'MySQL', 'price')).toBe('DECIMAL(12,2)');
    });

    it('maps types for PostgreSQL', () => {
      expect(mapColumnTypeToDDL('INTEGER', 'PostgreSQL', 'id')).toBe('SERIAL');
      expect(mapColumnTypeToDDL('BOOLEAN', 'PostgreSQL', 'is_active')).toBe('BOOLEAN');
    });

    it('maps types for TransactSQL / SSMS', () => {
      expect(mapColumnTypeToDDL('INTEGER', 'TransactSQL', 'id')).toBe('INT IDENTITY(1,1)');
      expect(mapColumnTypeToDDL('BOOLEAN', 'SSMS', 'is_active')).toBe('BIT');
    });
  });

  describe('generateDDLStatement()', () => {
    const cols: ExportColumnDef[] = [
      { name: 'id', inferredType: 'INTEGER', isPrimaryKey: true },
      { name: 'title', inferredType: 'VARCHAR' },
      { name: 'price', inferredType: 'NUMERIC' },
    ];

    it('generates valid DDL for MySQL', () => {
      const sql = generateDDLStatement('products', cols, 'MySQL');
      expect(sql).toContain('CREATE TABLE IF NOT EXISTS `products`');
      expect(sql).toContain('`id` INT AUTO_INCREMENT');
      expect(sql).toContain('`title` VARCHAR(255)');
      expect(sql).toContain('PRIMARY KEY (`id`)');
    });

    it('generates valid DDL for SQLite', () => {
      const sql = generateDDLStatement('products', cols, 'SQLite');
      expect(sql).toContain('CREATE TABLE IF NOT EXISTS "products"');
      expect(sql).toContain('"id" INTEGER PRIMARY KEY AUTOINCREMENT');
    });

    it('generates valid DDL for TransactSQL', () => {
      const sql = generateDDLStatement('products', cols, 'TransactSQL');
      expect(sql).toContain('CREATE TABLE [dbo].[products]');
      expect(sql).toContain('[id] INT IDENTITY(1,1)');
    });
  });

  describe('generateInsertStatements()', () => {
    const cols = ['id', 'name', 'price'];
    const rows = [
      [1, "Widget A", 19.99],
      [2, "O'Reilly Book", 49.95],
    ];

    it('generates batch INSERTs for PostgreSQL', () => {
      const sql = generateInsertStatements('products', cols, rows, 'PostgreSQL');
      expect(sql).toContain('INSERT INTO "products" ("id", "name", "price") VALUES');
      expect(sql).toContain("(1, 'Widget A', 19.99)");
      expect(sql).toContain("(2, 'O''Reilly Book', 49.95)");
    });

    it('generates batch INSERTs for MySQL', () => {
      const sql = generateInsertStatements('products', cols, rows, 'MySQL');
      expect(sql).toContain('INSERT INTO `products` (`id`, `name`, `price`) VALUES');
      expect(sql).toContain("(2, 'O\\'Reilly Book', 49.95)");
    });
  });
});
