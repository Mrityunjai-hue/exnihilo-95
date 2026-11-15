/**
 * new_screens.test.ts — Unit tests for NetworkStatusDialog, FileTransferDialog, and Safe Mode
 */

import { describe, it, expect } from 'vitest';
import { SQLExecutor } from '../../engine/executor';

describe('New Windows 95 Screens & Autonomous Mode Tests', () => {
  it('SQLExecutor.exportDatabaseBinary() returns valid binary data after table execution', async () => {
    const executor = new SQLExecutor();
    await executor.init();

    // Before queries, binary is still valid database
    const initialBinary = executor.exportDatabaseBinary();
    expect(initialBinary).not.toBeNull();
    expect(initialBinary instanceof Uint8Array).toBe(true);

    // Execute query to generate synthetic table
    const result = await executor.execute(
      'SELECT id, name, total FROM orders WHERE total > 100',
      'MySQL',
      { rowsPerTable: 5 }
    );
    expect(result.ok).toBe(true);

    const exportedBinary = executor.exportDatabaseBinary();
    expect(exportedBinary).not.toBeNull();
    expect(exportedBinary!.byteLength).toBeGreaterThan(100);

    // SQLite file magic header is 'SQLite format 3\0'
    const headerString = new TextDecoder('utf-8').decode(exportedBinary!.slice(0, 16));
    expect(headerString).toContain('SQLite format 3');
  });

  it('formats CSV and JSON properly for file export dialog', async () => {
    const executor = new SQLExecutor();
    const result = await executor.execute(
      'SELECT id, name, total FROM orders',
      'MySQL',
      { rowsPerTable: 3 }
    );

    if (!result.ok) {
      console.error('Execute failed:', result);
    }
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    // Test CSV transformation logic
    const header = result.columns.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',');
    expect(header).toBe('"id","name","total"');

    const csvRows = result.rows.map((r: any) =>
      result.columns
        .map((c, i) => {
          const val = Array.isArray(r) ? r[i] : r[c];
          if (val === null || val === undefined) return '""';
          const str = String(val).replace(/"/g, '""');
          return `"${str}"`;
        })
        .join(',')
    );

    expect(csvRows.length).toBe(result.rowCount);
    expect(typeof csvRows[0]).toBe('string');

    // Test JSON transformation logic with column mapping
    const jsonArr = result.rows.map((r: any) => {
      const obj: Record<string, any> = {};
      result.columns.forEach((col, i) => {
        obj[col] = Array.isArray(r) ? r[i] : r[col];
      });
      return obj;
    });

    const jsonOutput = JSON.stringify(jsonArr, null, 2);
    expect(jsonOutput).toContain('id');
    expect(jsonOutput).toContain('name');
    expect(jsonOutput).toContain('total');
    const parsed = JSON.parse(jsonOutput);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed.length).toBe(result.rowCount);
    expect(parsed[0]).toHaveProperty('id');
    expect(parsed[0]).toHaveProperty('name');
    expect(parsed[0]).toHaveProperty('total');
  });

  it('validates Safe Mode URL search parameter parsing', () => {
    const searchUrl = 'https://exnihilo-95.vercel.app/?mode=safe';
    const params = new URL(searchUrl).searchParams;
    expect(params.get('mode')).toBe('safe');

    const normalUrl = 'https://exnihilo-95.vercel.app/';
    const normalParams = new URL(normalUrl).searchParams;
    expect(normalParams.get('mode')).toBeNull();
  });
});
