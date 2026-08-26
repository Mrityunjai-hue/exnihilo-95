import { describe, it, expect, beforeEach } from 'vitest';
import { SQLExecutor } from '../../engine/executor';
import { parse, extractTruncateStatements, extractCreateSchemaStatements, extractCreateViewStatements } from '../../engine/parser';

describe('Batch 2 — DDL, Schemas & Views Engine', () => {
  let executor: SQLExecutor;

  beforeEach(() => {
    executor = new SQLExecutor();
  });

  describe('AST Parser — DDL Extraction', () => {
    it('extracts TRUNCATE TABLE statements', () => {
      const res = parse('TRUNCATE TABLE customers;', 'PostgreSQL');
      expect(res.ok).toBe(true);
      if (res.ok && res.ast) {
        const truncates = extractTruncateStatements(res.ast);
        expect(truncates).toHaveLength(1);
        expect(truncates[0].tableName.toLowerCase()).toBe('customers');
      }
    });

    it('extracts CREATE DATABASE and CREATE SCHEMA statements', () => {
      const dbRes = parse('CREATE DATABASE analytics;', 'MySQL');
      expect(dbRes.ok).toBe(true);
      if (dbRes.ok && dbRes.ast) {
        const schemas = extractCreateSchemaStatements(dbRes.ast);
        expect(schemas).toHaveLength(1);
        expect(schemas[0]).toEqual({ name: 'analytics', type: 'DATABASE' });
      }

      const schemaRes = parse('CREATE SCHEMA sales;', 'PostgreSQL');
      expect(schemaRes.ok).toBe(true);
      if (schemaRes.ok && schemaRes.ast) {
        const schemas = extractCreateSchemaStatements(schemaRes.ast);
        expect(schemas).toHaveLength(1);
        expect(schemas[0]).toEqual({ name: 'sales', type: 'SCHEMA' });
      }
    });

    it('extracts CREATE VIEW statements', () => {
      const res = parse('CREATE VIEW high_salaries AS SELECT name, salary FROM employees WHERE salary > 50000;', 'PostgreSQL');
      expect(res.ok).toBe(true);
      if (res.ok && res.ast) {
        const views = extractCreateViewStatements(res.ast);
        expect(views).toHaveLength(1);
        expect(views[0].viewName).toBe('high_salaries');
        expect(views[0].selectAst).toBeDefined();
      }
    });
  });

  describe('TRUNCATE TABLE Execution & Catalog Update', () => {
    it('resets row count to 0 without deleting table schema definition', async () => {
      const setupQuery = `
        CREATE TABLE products (id INT, name TEXT);
        INSERT INTO products VALUES (1, 'Laptop'), (2, 'Phone');
        SELECT * FROM products;
      `;
      const setupRes = await executor.execute(setupQuery, 'PostgreSQL');
      expect(setupRes.ok).toBe(true);
      if (setupRes.ok) {
        expect(setupRes.rows).toHaveLength(2);
      }

      // Catalog before truncate
      const catEntryBefore = executor.getCatalog().get('products');
      expect(catEntryBefore).toBeDefined();

      // TRUNCATE TABLE
      const truncRes = await executor.execute('TRUNCATE TABLE products;', 'PostgreSQL');
      expect(truncRes.ok).toBe(true);

      // Verify row count reset in catalog
      const catEntryAfter = executor.getCatalog().get('products');
      expect(catEntryAfter).toBeDefined();
      expect(catEntryAfter?.rowCount).toBe(0);

      // Subsequent query returns 0 rows without throwing "table not found"
      const subRes = await executor.execute('SELECT * FROM products;', 'PostgreSQL');
      expect(subRes.ok).toBe(true);
      if (subRes.ok) {
        expect(subRes.rows).toHaveLength(0);
        expect(subRes.columns).toEqual(['id', 'name']);
      }
    });
  });

  describe('CREATE DATABASE / SCHEMA & Qualified Name Routing', () => {
    it('creates schema namespace and queries schema-qualified tables', async () => {
      const schemaRes = await executor.execute('CREATE SCHEMA sales;', 'PostgreSQL');
      expect(schemaRes.ok).toBe(true);
      expect(executor.getCatalog().hasDatabase('sales')).toBe(true);

      const tableQuery = `
        CREATE TABLE "sales.orders" (order_id INT, amount INT);
        INSERT INTO "sales.orders" VALUES (101, 500), (102, 750);
        SELECT * FROM "sales.orders";
      `;
      const res = await executor.execute(tableQuery, 'PostgreSQL');
      expect(res.ok).toBe(true);

      if (res.ok) {
        expect(res.rows).toEqual([
          [101, 500],
          [102, 750],
        ]);
      }
    });
  });

  describe('CREATE VIEW & Dynamic Virtualized Resolution', () => {
    it('stores view definition in catalog and dynamically evaluates projected data', async () => {
      const createViewQuery = `
        CREATE TABLE employees (id INT, name TEXT, salary INT);
        INSERT INTO employees VALUES (1, 'Alice', 60000), (2, 'Bob', 40000), (3, 'Charlie', 80000);

        CREATE VIEW high_salaries AS
        SELECT name, salary FROM employees WHERE salary > 50000;
      `;
      const setupRes = await executor.execute(createViewQuery, 'PostgreSQL');
      expect(setupRes.ok).toBe(true);

      // Verify view registered in catalog without physical rows
      expect(executor.getCatalog().hasView('high_salaries')).toBe(true);
      const viewEntry = executor.getCatalog().getView('high_salaries');
      expect(viewEntry).toBeDefined();
      expect(viewEntry?.viewName).toBe('high_salaries');

      // Querying view dynamically returns underlying projected data
      const queryRes = await executor.execute('SELECT * FROM high_salaries ORDER BY salary DESC;', 'PostgreSQL');
      expect(queryRes.ok).toBe(true);
      if (queryRes.ok) {
        expect(queryRes.columns).toEqual(['name', 'salary']);
        expect(queryRes.rows).toEqual([
          ['Charlie', 80000],
          ['Alice', 60000],
        ]);
      }
    });
  });
});
