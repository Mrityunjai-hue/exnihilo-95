import { describe, it, expect } from 'vitest';
import { getSemanticGroupId, areSemanticDuplicates } from '../../engine/semanticAliases';
import { inferSchema } from '../../engine/inference';

describe('Semantic Column Aliases & Deduplication', () => {
  it('correctly maps synonyms to semantic groups', () => {
    expect(getSemanticGroupId('total')).toBe('TOTAL');
    expect(getSemanticGroupId('total_amount')).toBe('TOTAL');
    expect(getSemanticGroupId('amount')).toBe('TOTAL');
    expect(getSemanticGroupId('first_name')).toBe('FIRST_NAME');
    expect(getSemanticGroupId('customer_name')).toBe('FULL_NAME');
    expect(getSemanticGroupId('unrelated_col')).toBeNull();
  });

  it('detects duplicate synonyms', () => {
    expect(areSemanticDuplicates('total', 'total_amount')).toBe(true);
    expect(areSemanticDuplicates('first_name', 'given_name')).toBe(true);
    expect(areSemanticDuplicates('email', 'phone')).toBe(false);
  });

  it('suppresses redundant domain columns when synonym is explicitly referenced in query', () => {
    const schemaMap = inferSchema('SELECT total FROM orders;', 'SQLite');
    const orders = schemaMap.get('orders');
    expect(orders).toBeDefined();

    const colNames = orders!.columns.map((c) => c.name.toLowerCase());
    expect(colNames).toContain('total');
    // Ensure total_amount is NOT also added
    expect(colNames).not.toContain('total_amount');
    expect(colNames).not.toContain('order_total');
  });

  it('suppresses first_name and last_name when name is explicitly referenced in query', () => {
    const schemaMap = inferSchema('SELECT name FROM customers;', 'SQLite');
    const customers = schemaMap.get('customers');
    expect(customers).toBeDefined();

    const colNames = customers!.columns.map((c) => c.name.toLowerCase());
    expect(colNames).toContain('name');
    expect(colNames).not.toContain('first_name');
    expect(colNames).not.toContain('last_name');
  });
});
