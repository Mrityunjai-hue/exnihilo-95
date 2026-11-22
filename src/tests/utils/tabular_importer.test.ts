import { describe, it, expect } from 'vitest';
import {
  parseDelimitedText,
  parseTabularFile,
  isSQLiteBinary,
  sanitizeTableName,
} from '../../utils/tabularImporter';

describe('Tabular Importer Utility', () => {
  it('parses RFC-4180 CSV with quotes, commas in quotes, and doubled quotes', () => {
    const csv = `id,name,description\n1,"Doe, John","He said ""Hello!"""\n2,Alice,"Line 1\nLine 2"`;
    const rows = parseDelimitedText(csv, ',');

    expect(rows.length).toBe(3);
    expect(rows[0]).toEqual(['id', 'name', 'description']);
    expect(rows[1]).toEqual(['1', 'Doe, John', 'He said "Hello!"']);
    expect(rows[2][1]).toBe('Alice');
    expect(rows[2][2]).toContain('Line 1');
  });

  it('correctly infers types and converts CSV to dataset', () => {
    const csv = `product_id,price,stock,title\n101,19.99,50,"Vintage Mouse"\n102,4.50,120,"Floppy Disk 3.5"`;
    const dataset = parseTabularFile('retro_inventory.csv', csv);

    expect(dataset.tableName).toBe('retro_inventory');
    expect(dataset.format).toBe('csv');
    expect(dataset.rows.length).toBe(2);

    const typeMap = Object.fromEntries(dataset.columns.map((c) => [c.name, c.sqliteType]));
    expect(typeMap['product_id']).toBe('INTEGER');
    expect(typeMap['price']).toBe('REAL');
    expect(typeMap['stock']).toBe('INTEGER');
    expect(typeMap['title']).toBe('TEXT');
  });

  it('parses JSON array of objects correctly', () => {
    const json = JSON.stringify([
      { id: 1, country: 'USA', gdp: 25.4 },
      { id: 2, country: 'Japan', gdp: 4.2 },
    ]);
    const dataset = parseTabularFile('world_stats.json', json);

    expect(dataset.tableName).toBe('world_stats');
    expect(dataset.format).toBe('json');
    expect(dataset.rows.length).toBe(2);
    expect(dataset.columns.map((c) => c.name)).toEqual(['id', 'country', 'gdp']);
  });

  it('detects SQLite binary header', () => {
    const validHeader = new Uint8Array([
      0x53, 0x51, 0x4c, 0x69, 0x74, 0x65, 0x20, 0x66, 0x6f, 0x72, 0x6d, 0x61, 0x74, 0x20, 0x33, 0x00,
      0x04, 0x00, 0x01, 0x01,
    ]);
    const invalidHeader = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);

    expect(isSQLiteBinary(validHeader)).toBe(true);
    expect(isSQLiteBinary(invalidHeader)).toBe(false);
  });

  it('sanitizes table names properly', () => {
    expect(sanitizeTableName('Monthly Sales 1995.csv')).toBe('monthly_sales_1995');
    expect(sanitizeTableName('95_archive.json')).toBe('tbl_95_archive');
  });
});
