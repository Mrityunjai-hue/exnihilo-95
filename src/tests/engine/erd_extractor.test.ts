/**
 * erd_extractor.test.ts — ERD Extractor Engine Vitest Suite
 */

import { describe, it, expect } from 'vitest';
import { SessionCatalog } from '../../engine/catalog';
import { extractERDData } from '../../engine/erd_extractor';

describe('ERD Extractor Engine', () => {
  it('extracts table nodes and primary keys correctly', () => {
    const catalog = new SessionCatalog();
    catalog.set('customers', {
      tableName: 'customers',
      columns: [
        { name: 'id', logicalType: 'INTEGER', sqliteType: 'INTEGER', source: 'test' },
        { name: 'name', logicalType: 'VARCHAR', sqliteType: 'TEXT', source: 'test' },
      ],
      isDefault: false,
    }, 10);

    const erd = extractERDData(catalog);
    expect(erd.nodes).toHaveLength(1);
    expect(erd.nodes[0].tableName).toBe('customers');
    expect(erd.nodes[0].columns[0].isPrimaryKey).toBe(true);
  });

  it('infers foreign key relationships between orders.customer_id and customers.id', () => {
    const catalog = new SessionCatalog();
    catalog.set('customers', {
      tableName: 'customers',
      columns: [
        { name: 'id', logicalType: 'INTEGER', sqliteType: 'INTEGER', source: 'test' },
        { name: 'name', logicalType: 'VARCHAR', sqliteType: 'TEXT', source: 'test' },
      ],
      isDefault: false,
    }, 5);

    catalog.set('orders', {
      tableName: 'orders',
      columns: [
        { name: 'id', logicalType: 'INTEGER', sqliteType: 'INTEGER', source: 'test' },
        { name: 'customer_id', logicalType: 'INTEGER', sqliteType: 'INTEGER', source: 'test' },
        { name: 'total_amount', logicalType: 'NUMERIC', sqliteType: 'REAL', source: 'test' },
      ],
      isDefault: false,
    }, 20);

    const erd = extractERDData(catalog);
    expect(erd.nodes).toHaveLength(2);
    expect(erd.links).toHaveLength(1);
    expect(erd.links[0].sourceTable).toBe('orders');
    expect(erd.links[0].sourceColumn).toBe('customer_id');
    expect(erd.links[0].targetTable).toBe('customers');
    expect(erd.links[0].targetColumn).toBe('id');
  });
});
