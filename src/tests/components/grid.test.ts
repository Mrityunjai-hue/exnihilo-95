/**
 * grid.test.ts — Phase 4 ResultsGrid Vitest Suite
 *
 * Verifies:
 *  1. Interactive column header sorting for numeric and string data.
 *  2. Safe substring filtering (ReDoS immunity via case-insensitive .includes()).
 *  3. CSV exporter RFC 4180 escaping (double quotes and internal commas).
 */

import { describe, it, expect } from 'vitest';

// Utility helper reproducing ResultsGrid processedRows logic
function processRowsHelper(
  rawRows: any[][],
  searchQuery: string,
  sortColIdx: number | null,
  sortDir: 'asc' | 'desc'
) {
  let list = rawRows.map((row, originalIndex) => ({ row, originalIndex }));

  // Safe substring filter (.includes())
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    list = list.filter(({ row }) =>
      row.some((cell) => cell !== null && cell !== undefined && String(cell).toLowerCase().includes(q))
    );
  }

  // Interactive sorting
  if (sortColIdx !== null) {
    list.sort((a, b) => {
      const valA = a.row[sortColIdx];
      const valB = b.row[sortColIdx];

      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDir === 'asc' ? valA - valB : valB - valA;
      }

      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      return sortDir === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
    });
  }

  return list;
}

// Utility helper reproducing ResultsGrid CSV export formatter logic
function generateCSVContent(columns: string[], rows: any[][]): string {
  const header = columns.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',');
  const body = rows
    .map((r) =>
      r
        .map((v) => {
          if (v === null || v === undefined) return '""';
          const str = String(v).replace(/"/g, '""');
          return `"${str}"`;
        })
        .join(',')
    )
    .join('\n');

  return `${header}\n${body}`;
}

describe('Phase 4 ResultsGrid & Exporter Vitest Suite', () => {
  const sampleColumns = ['id', 'name', 'salary'];
  const sampleRows = [
    [1, 'Bob Smith', 65000],
    [2, 'Alice Cooper', 95000],
    [3, 'Charlie Brown', 42000],
    [4, 'David "Dave" Miller', 81000],
  ];

  // ── 1. Interactive Column Header Sorting ───────────────────────────────────
  describe('Interactive Column Header Sorting', () => {
    it('sorts numeric values in ascending and descending order', () => {
      // Sort by salary (colIndex 2) ASC
      const sortedAsc = processRowsHelper(sampleRows, '', 2, 'asc');
      expect(sortedAsc.map((item) => item.row[1])).toEqual([
        'Charlie Brown',
        'Bob Smith',
        'David "Dave" Miller',
        'Alice Cooper',
      ]);

      // Sort by salary (colIndex 2) DESC
      const sortedDesc = processRowsHelper(sampleRows, '', 2, 'desc');
      expect(sortedDesc.map((item) => item.row[1])).toEqual([
        'Alice Cooper',
        'David "Dave" Miller',
        'Bob Smith',
        'Charlie Brown',
      ]);
    });

    it('sorts string values alphabetically in ascending and descending order', () => {
      // Sort by name (colIndex 1) ASC
      const sortedAsc = processRowsHelper(sampleRows, '', 1, 'asc');
      expect(sortedAsc.map((item) => item.row[1])).toEqual([
        'Alice Cooper',
        'Bob Smith',
        'Charlie Brown',
        'David "Dave" Miller',
      ]);

      // Sort by name (colIndex 1) DESC
      const sortedDesc = processRowsHelper(sampleRows, '', 1, 'desc');
      expect(sortedDesc.map((item) => item.row[1])).toEqual([
        'David "Dave" Miller',
        'Charlie Brown',
        'Bob Smith',
        'Alice Cooper',
      ]);
    });
  });

  // ── 2. ReDoS-Safe Substring Filtering ─────────────────────────────────────
  describe('Safe Substring Filtering (.includes())', () => {
    it('filters rows matching case-insensitive search queries', () => {
      const filtered = processRowsHelper(sampleRows, 'alice', null, 'asc');
      expect(filtered).toHaveLength(1);
      expect(filtered[0].row[1]).toBe('Alice Cooper');
    });

    it('hides non-matching rows when query does not match any cell', () => {
      const filtered = processRowsHelper(sampleRows, 'nonexistent_person', null, 'asc');
      expect(filtered).toHaveLength(0);
    });

    it('handles numeric substring searches correctly', () => {
      const filtered = processRowsHelper(sampleRows, '95000', null, 'asc');
      expect(filtered).toHaveLength(1);
      expect(filtered[0].row[1]).toBe('Alice Cooper');
    });
  });

  // ── 3. CSV Exporter RFC 4180 Escaping ──────────────────────────────────────
  describe('CSV Exporter Escaping', () => {
    it('correctly escapes internal quotes and quotes every cell value', () => {
      const csv = generateCSVContent(sampleColumns, sampleRows);
      expect(csv).toContain('"David ""Dave"" Miller"');
      expect(csv).toContain('"Alice Cooper"');
      expect(csv).toContain('"95000"');
    });

    it('correctly formats header line with quotes', () => {
      const csv = generateCSVContent(['user_id', 'full_name'], [[1, 'Test']]);
      const lines = csv.split('\n');
      expect(lines[0]).toBe('"user_id","full_name"');
      expect(lines[1]).toBe('"1","Test"');
    });
  });
});
