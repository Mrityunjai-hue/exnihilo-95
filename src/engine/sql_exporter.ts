/**
 * src/engine/sql_exporter.ts — Dialect-Aware SQL INSERT & DDL Script Exporter
 *
 * Generates production-ready, executable .sql script files for MySQL, PostgreSQL, SQLite, TransactSQL & SSMS.
 * Handles dialect-native escaping, type mapping, and 100-row batching for DBMS parser performance.
 */

import { Dialect } from './parser';

export type ColumnType = 'VARCHAR' | 'INTEGER' | 'NUMERIC' | 'TIMESTAMP' | 'BOOLEAN';

export interface ExportColumnDef {
  name: string;
  inferredType: ColumnType;
  isPrimaryKey?: boolean;
  isNullable?: boolean;
}

/**
 * Escape string literal according to SQL dialect rules
 */
export function escapeSqlString(str: string, dialect: Dialect): string {
  if (str === null || str === undefined) return 'NULL';
  
  if (dialect === 'MySQL') {
    // MySQL escapes single quote with backslash or double single-quote
    return `'${str.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n').replace(/\r/g, '\\r')}'`;
  }
  
  // PostgreSQL, SQLite, TransactSQL, SSMS escape single quote by doubling it (' -> '')
  return `'${str.replace(/'/g, "''")}'`;
}

/**
 * Format a single JavaScript cell value into an executable SQL value literal
 */
export function formatSqlValue(val: any, dialect: Dialect): string {
  if (val === null || val === undefined) {
    return 'NULL';
  }

  if (typeof val === 'boolean') {
    if (dialect === 'PostgreSQL') {
      return val ? 'TRUE' : 'FALSE';
    }
    // MySQL, SQLite & T-SQL BIT/INTEGER storage affinity (1 / 0)
    return val ? '1' : '0';
  }

  if (typeof val === 'number') {
    if (isNaN(val)) return 'NULL';
    return String(val);
  }

  if (val instanceof Date) {
    const iso = val.toISOString().replace('T', ' ').substring(0, 19);
    return `'${iso}'`;
  }

  if (typeof val === 'object') {
    return escapeSqlString(JSON.stringify(val), dialect);
  }

  return escapeSqlString(String(val), dialect);
}

/**
 * Maps generic ColumnType to dialect-native DDL type string
 */
export function mapColumnTypeToDDL(type: ColumnType, dialect: Dialect, colName: string): string {
  const isId = colName.toLowerCase() === 'id';

  switch (dialect) {
    case 'MySQL':
      switch (type) {
        case 'INTEGER':
          return isId ? 'INT AUTO_INCREMENT' : 'INT';
        case 'NUMERIC':
          return 'DECIMAL(12,2)';
        case 'BOOLEAN':
          return 'TINYINT(1)';
        case 'TIMESTAMP':
          return 'DATETIME';
        case 'VARCHAR':
        default:
          return 'VARCHAR(255)';
      }

    case 'PostgreSQL':
      switch (type) {
        case 'INTEGER':
          return isId ? 'SERIAL' : 'INTEGER';
        case 'NUMERIC':
          return 'NUMERIC(12,2)';
        case 'BOOLEAN':
          return 'BOOLEAN';
        case 'TIMESTAMP':
          return 'TIMESTAMP WITH TIME ZONE';
        case 'VARCHAR':
        default:
          return 'VARCHAR(255)';
      }

    case 'SQLite':
      switch (type) {
        case 'INTEGER':
          return isId ? 'INTEGER' : 'INTEGER';
        case 'NUMERIC':
          return 'REAL';
        case 'BOOLEAN':
          return 'INTEGER';
        case 'TIMESTAMP':
          return 'TEXT';
        case 'VARCHAR':
        default:
          return 'TEXT';
      }

    case 'TransactSQL':
    case 'SSMS':
    default:
      switch (type) {
        case 'INTEGER':
          return isId ? 'INT IDENTITY(1,1)' : 'INT';
        case 'NUMERIC':
          return 'DECIMAL(12,2)';
        case 'BOOLEAN':
          return 'BIT';
        case 'TIMESTAMP':
          return 'DATETIME2';
        case 'VARCHAR':
        default:
          return 'NVARCHAR(255)';
      }
  }
}

/**
 * Generates an executable CREATE TABLE DDL statement
 */
export function generateDDLStatement(
  tableName: string,
  columns: ExportColumnDef[],
  dialect: Dialect
): string {
  const cleanTableName = tableName.replace(/[^a-zA-Z0-9_]/g, '') || 'synthesized_table';
  const timestamp = new Date().toISOString();
  const isTSQL = dialect === 'TransactSQL' || dialect === 'SSMS';

  const lines: string[] = [];
  lines.push(`-- =====================================================`);
  lines.push(`-- ExNihilo 95 — Schema DDL Export (${dialect})`);
  lines.push(`-- Generated: ${timestamp}`);
  lines.push(`-- Table: ${cleanTableName}`);
  lines.push(`-- =====================================================\n`);

  if (dialect === 'MySQL') {
    lines.push(`CREATE TABLE IF NOT EXISTS \`${cleanTableName}\` (`);
  } else if (isTSQL) {
    lines.push(`IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = '${cleanTableName}')`);
    lines.push(`CREATE TABLE [dbo].[${cleanTableName}] (`);
  } else {
    lines.push(`CREATE TABLE IF NOT EXISTS "${cleanTableName}" (`);
  }

  const colDefinitions: string[] = [];
  const primaryKeys: string[] = [];

  columns.forEach((col) => {
    const colName = col.name;
    const ddlType = mapColumnTypeToDDL(col.inferredType, dialect, colName);
    const quoteChar = dialect === 'MySQL' ? '`' : isTSQL ? '[' : '"';
    const closeQuote = isTSQL ? ']' : quoteChar;
    
    let colLine = `  ${quoteChar}${colName}${closeQuote} ${ddlType}`;
    
    if (col.isNullable === false) {
      colLine += ' NOT NULL';
    }

    if (col.isPrimaryKey || colName.toLowerCase() === 'id') {
      if (dialect === 'SQLite') {
        colLine += ' PRIMARY KEY AUTOINCREMENT';
      } else {
        primaryKeys.push(`${quoteChar}${colName}${closeQuote}`);
      }
    }

    colDefinitions.push(colLine);
  });

  if (primaryKeys.length > 0 && dialect !== 'SQLite') {
    colDefinitions.push(`  PRIMARY KEY (${primaryKeys.join(', ')})`);
  }

  lines.push(colDefinitions.join(',\n'));
  lines.push(`);`);

  return lines.join('\n');
}

/**
 * Generates executable batch INSERT statements
 */
export function generateInsertStatements(
  tableName: string,
  columnNames: string[],
  rows: any[][],
  dialect: Dialect,
  batchSize = 100
): string {
  const cleanTableName = tableName.replace(/[^a-zA-Z0-9_]/g, '') || 'synthesized_table';
  const timestamp = new Date().toISOString();
  const isTSQL = dialect === 'TransactSQL' || dialect === 'SSMS';

  const lines: string[] = [];
  lines.push(`-- =====================================================`);
  lines.push(`-- ExNihilo 95 — Data INSERT Script Export (${dialect})`);
  lines.push(`-- Generated: ${timestamp}`);
  lines.push(`-- Table: ${cleanTableName}`);
  lines.push(`-- Total Rows: ${rows.length}`);
  lines.push(`-- =====================================================\n`);

  if (rows.length === 0 || columnNames.length === 0) {
    lines.push(`-- No data rows to export.`);
    return lines.join('\n');
  }

  const quoteChar = dialect === 'MySQL' ? '`' : isTSQL ? '[' : '"';
  const closeQuote = isTSQL ? ']' : quoteChar;
  const colListStr = columnNames.map((c) => `${quoteChar}${c}${closeQuote}`).join(', ');

  let targetTable = `"${cleanTableName}"`;
  if (dialect === 'MySQL') targetTable = `\`${cleanTableName}\``;
  if (isTSQL) targetTable = `[dbo].[${cleanTableName}]`;

  // Process rows in batches
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    lines.push(`INSERT INTO ${targetTable} (${colListStr}) VALUES`);

    const valueTuples = batch.map((row) => {
      const formattedVals = row.map((val) => formatSqlValue(val, dialect));
      return `  (${formattedVals.join(', ')})`;
    });

    lines.push(valueTuples.join(',\n') + ';');
    lines.push(''); // Blank line between batches
  }

  return lines.join('\n');
}
