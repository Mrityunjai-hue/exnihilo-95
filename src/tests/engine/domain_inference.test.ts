/**
 * domain_inference.test.ts — Phase 1 Comprehensive Verification Test Suite
 *
 * Validates semantic matching, domain schema resolution, column schema augmentation,
 * type safety (no lorem word overrides on numbers/dates), and DAG referential integrity.
 */

import { describe, it, expect } from 'vitest';
import { inferSchema } from '../../engine/inference';
import { resolveDomainSchema, inferFakerFromColumnName } from '../../engine/domain_dictionary';
import { generateSyntheticDataset } from '../../engine/generator';
import { buildTableGenerationPlan } from '../../engine/relationships';

describe('Phase 1: Semantic Matching, Schema Augmentation & Domain Inference', () => {
  it('resolves tbl_customers to the users domain schema', () => {
    const domainCols = resolveDomainSchema('tbl_customers');
    expect(domainCols).not.toBeNull();
    const colNames = domainCols!.map(c => c.name);
    expect(colNames).toContain('first_name');
    expect(colNames).toContain('last_name');
    expect(colNames).toContain('email');

    const schemaMap = inferSchema('SELECT * FROM tbl_customers;', 'MySQL');
    const schema = schemaMap.get('tbl_customers');
    expect(schema).toBeDefined();
    expect(schema?.columns.some(c => c.name === 'email')).toBe(true);
  });

  it('augments sparse column queries with complementary domain columns', () => {
    const schemaMap = inferSchema('SELECT u.email FROM customers u;', 'PostgreSQL');
    const schema = schemaMap.get('customers');
    expect(schema).toBeDefined();
    const colNames = schema!.columns.map(c => c.name);
    // Explicit signal preserved
    expect(colNames).toContain('email');
    // Domain schema augmented
    expect(colNames).toContain('first_name');
    expect(colNames).toContain('last_name');
    expect(colNames).toContain('id');
  });

  it('infers an IPv4 address for user_ip_address custom column', () => {
    const generator = inferFakerFromColumnName('user_ip_address')!;
    expect(generator).not.toBeNull();
    const val = generator();
    expect(typeof val).toBe('string');
    // IPv4 pattern: 4 numbers separated by dots
    expect(val).toMatch(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/);
  });

  it('correctly types country as VARCHAR and generates country names, never matching count as integer', () => {
    const generator = inferFakerFromColumnName('country')!;
    expect(generator).not.toBeNull();
    const val = generator();
    expect(typeof val).toBe('string');
    expect(['India', 'United States', 'United Kingdom', 'Canada', 'Germany', 'Australia', 'Japan', 'France']).toContain(val);

    const schemaMap = inferSchema("SELECT * FROM employees WHERE country = 'india';", 'MySQL');
    const schema = schemaMap.get('employees');
    expect(schema).toBeDefined();
    const countryCol = schema!.columns.find(c => c.name === 'country');
    expect(countryCol?.logicalType).toBe('VARCHAR');
  });

  it('returns null for non-keyword column names so scalar type generators handle baseline types', () => {
    const generator = inferFakerFromColumnName('random_custom_col');
    expect(generator).toBeNull();
  });

  it('enforces DAG referential integrity so orders.user_id strictly exists in users.id', () => {
    const query = `
      SELECT u.id, u.email, o.id AS order_id, o.user_id, o.total_amount
      FROM users u
      JOIN orders o ON u.id = o.user_id;
    `;
    const dialect = 'MySQL';
    const schemaMap = inferSchema(query, dialect);
    const plan = buildTableGenerationPlan(query, dialect, Array.from(schemaMap.keys()));
    const dataset = generateSyntheticDataset(schemaMap, plan, { rowsPerTable: 20 });

    const usersData = dataset.get('users');
    const ordersData = dataset.get('orders');

    expect(usersData).toBeDefined();
    expect(ordersData).toBeDefined();

    // Verify sequential primary keys on users (1..20) and orders (1..20)
    const usersPks = usersData!.rows.map(r => r.id);
    expect(usersPks).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);

    const ordersPks = ordersData!.rows.map(r => r.id);
    expect(ordersPks).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);

    // Verify foreign key integrity
    const userPkSet = new Set(usersPks);
    for (const orderRow of ordersData!.rows) {
      if (orderRow.user_id !== null) {
        expect(userPkSet.has(orderRow.user_id)).toBe(true);
      }
    }
  });
});
