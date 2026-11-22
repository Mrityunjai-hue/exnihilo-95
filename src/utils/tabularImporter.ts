/**
 * tabularImporter.ts — RFC-4180 Compliant CSV / TSV / JSON / SQLite Ingestion Utility
 * Parses raw text or binary data into strongly typed schema definitions and row matrices,
 * suitable for immediate SQLite materialization.
 */

export interface ParsedTableDataset {
  tableName: string;
  columns: Array<{
    name: string;
    sqliteType: 'INTEGER' | 'REAL' | 'TEXT';
  }>;
  rows: unknown[][];
  format: 'csv' | 'tsv' | 'json' | 'sqlite';
}

/**
 * Checks if a byte buffer starts with the canonical SQLite 3 format header:
 * "SQLite format 3\0" (16 bytes: 0x53 0x51 0x4C 0x69 0x74 0x65 0x20 0x66 0x6F 0x72 0x6D 0x61 0x74 0x20 0x33 0x00)
 */
export function isSQLiteBinary(buffer: Uint8Array): boolean {
  if (buffer.length < 16) return false;
  const sqliteHeader = [0x53, 0x51, 0x4c, 0x69, 0x74, 0x65, 0x20, 0x66, 0x6f, 0x72, 0x6d, 0x61, 0x74, 0x20, 0x33, 0x00];
  for (let i = 0; i < 16; i++) {
    if (buffer[i] !== sqliteHeader[i]) return false;
  }
  return true;
}

/**
 * Sanitizes a filename into a valid SQL table identifier.
 */
export function sanitizeTableName(fileName: string): string {
  const baseName = fileName.replace(/\.[^/.]+$/, '').trim();
  let sanitized = baseName.toLowerCase().replace(/[^a-z0-9_]/g, '_').replace(/_+/g, '_');
  if (/^[0-9]/.test(sanitized)) {
    sanitized = `tbl_${sanitized}`;
  }
  return sanitized || 'imported_table';
}

/**
 * RFC-4180 Compliant CSV / TSV Line & Cell Lexer
 * Handles commas/tabs, quoted delimiters, doubled quotes (""), and multiline cells.
 */
export function parseDelimitedText(
  text: string,
  delimiter: string = ','
): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let insideQuotes = false;

  const len = text.length;
  let i = 0;

  while (i < len) {
    const ch = text[i];
    const nextCh = i + 1 < len ? text[i + 1] : '';

    if (insideQuotes) {
      if (ch === '"') {
        if (nextCh === '"') {
          // Escaped quote: "" -> "
          currentCell += '"';
          i += 2;
          continue;
        } else {
          // Closing quote
          insideQuotes = false;
          i++;
          continue;
        }
      } else {
        currentCell += ch;
        i++;
        continue;
      }
    } else {
      if (ch === '"') {
        insideQuotes = true;
        i++;
        continue;
      } else if (ch === delimiter) {
        currentRow.push(currentCell.trim());
        currentCell = '';
        i++;
        continue;
      } else if (ch === '\r') {
        if (nextCh === '\n') {
          i++;
        }
        currentRow.push(currentCell.trim());
        currentCell = '';
        if (currentRow.length > 0 && currentRow.some((c) => c !== '')) {
          rows.push(currentRow);
        }
        currentRow = [];
        i++;
        continue;
      } else if (ch === '\n') {
        currentRow.push(currentCell.trim());
        currentCell = '';
        if (currentRow.length > 0 && currentRow.some((c) => c !== '')) {
          rows.push(currentRow);
        }
        currentRow = [];
        i++;
        continue;
      } else {
        currentCell += ch;
        i++;
        continue;
      }
    }
  }

  // Push trailing cell and row
  if (currentCell !== '' || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    if (currentRow.some((c) => c !== '')) {
      rows.push(currentRow);
    }
  }

  return rows;
}

/**
 * Infer SQLite storage affinities (INTEGER, REAL, TEXT) for column values.
 */
export function inferColumnTypes(
  headers: string[],
  rows: unknown[][]
): Array<{ name: string; sqliteType: 'INTEGER' | 'REAL' | 'TEXT' }> {
  const sampleLimit = Math.min(rows.length, 100);

  return headers.map((header, colIdx) => {
    let intCount = 0;
    let realCount = 0;
    let textCount = 0;
    let totalChecked = 0;

    for (let r = 0; r < sampleLimit; r++) {
      const val = rows[r]?.[colIdx];
      if (val === null || val === undefined || val === '') continue;

      totalChecked++;
      if (typeof val === 'number') {
        if (Number.isInteger(val)) intCount++;
        else realCount++;
      } else if (typeof val === 'string') {
        const trimmed = val.trim();
        if (/^-?\d+$/.test(trimmed)) {
          intCount++;
        } else if (/^-?\d+\.\d+$/.test(trimmed) || /^-?\d+(?:\.\d+)?(?:e[+-]?\d+)?$/i.test(trimmed)) {
          realCount++;
        } else {
          textCount++;
        }
      } else {
        textCount++;
      }
    }

    let sqliteType: 'INTEGER' | 'REAL' | 'TEXT' = 'TEXT';
    if (totalChecked > 0 && textCount === 0) {
      if (realCount > 0) sqliteType = 'REAL';
      else if (intCount > 0) sqliteType = 'INTEGER';
    }

    return {
      name: header || `column_${colIdx + 1}`,
      sqliteType,
    };
  });
}

/**
 * Parse raw file content (CSV, TSV, JSON) into a structured dataset.
 */
export function parseTabularFile(
  fileName: string,
  rawContent: string
): ParsedTableDataset {
  const tableName = sanitizeTableName(fileName);
  const ext = fileName.split('.').pop()?.toLowerCase() || '';

  if (ext === 'json') {
    try {
      const parsed = JSON.parse(rawContent);
      if (Array.isArray(parsed) && parsed.length > 0) {
        if (typeof parsed[0] === 'object' && parsed[0] !== null && !Array.isArray(parsed[0])) {
          const headerSet = new Set<string>();
          for (const item of parsed.slice(0, 50)) {
            if (item && typeof item === 'object') {
              Object.keys(item).forEach((k) => headerSet.add(k));
            }
          }
          const headers = Array.from(headerSet);
          const rows = parsed.map((item) =>
            headers.map((h) => (item[h] !== undefined ? item[h] : null))
          );
          const columns = inferColumnTypes(headers, rows);
          return { tableName, columns, rows, format: 'json' };
        } else if (Array.isArray(parsed[0])) {
          // Matrix: first row as headers
          const headers = parsed[0].map(String);
          const rows = parsed.slice(1);
          const columns = inferColumnTypes(headers, rows);
          return { tableName, columns, rows, format: 'json' };
        }
      }
    } catch {}
  }

  const delimiter = ext === 'tsv' ? '\t' : ',';
  const parsedRows = parseDelimitedText(rawContent, delimiter);

  if (parsedRows.length === 0) {
    return {
      tableName,
      columns: [{ name: 'value', sqliteType: 'TEXT' }],
      rows: [],
      format: delimiter === '\t' ? 'tsv' : 'csv',
    };
  }

  const headers = parsedRows[0];
  const dataRows: unknown[][] = parsedRows.slice(1).map((r) => {
    return headers.map((_, i) => (r[i] !== undefined ? r[i] : null));
  });

  const columns = inferColumnTypes(headers, dataRows);

  return {
    tableName,
    columns,
    rows: dataRows,
    format: delimiter === '\t' ? 'tsv' : 'csv',
  };
}
