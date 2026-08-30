/**
 * dbManagerUtils.ts — Visual Database Manager Utilities
 *
 * - DIALECT_TYPE_MANIFEST: single source of truth for dialect-aware types & constraints
 * - buildColumnDDL: generates a single column DDL clause per dialect
 * - buildCreateTableSql: assembles full CREATE TABLE statement
 * - mapFormTypeToLogicalType: maps wizard UI types to engine LogicalType
 */

import { Dialect } from '../engine/parser';
import { LogicalType } from '../engine/inference';

// ── Column Constraint Form Row ─────────────────────────────────────────────────

export interface ColumnFormRow {
  name: string;
  type: string;           // e.g. 'INT', 'VARCHAR', 'ENUM', etc.
  typeParam?: string;     // length / precision e.g. '255' for VARCHAR(255)
  isPrimaryKey: boolean;
  isAutoIncrement: boolean;
  isNotNull: boolean;
  isUnique: boolean;
  defaultValue?: string;
  checkExpr?: string;
  enumValues?: string[];  // for ENUM
  setValues?: string[];   // for SET
  enumRawInput?: string; // preserves raw typed text for ENUM input (trailing commas/spaces)
  setRawInput?: string;  // preserves raw typed text for SET input (trailing commas/spaces)
  references?: {
    table: string;
    column: string;
    onDelete?: string;
    onUpdate?: string;
  };
  generatedExpr?: string;
  generatedMode?: 'STORED' | 'VIRTUAL' | 'PERSISTED';
  comment?: string;
  collate?: string;
  isUnsigned?: boolean;
  isZerofill?: boolean;
}

export interface TableConstraintForm {
  type: 'PRIMARY_KEY' | 'UNIQUE' | 'CHECK' | 'FOREIGN_KEY' | 'INDEX';
  columns?: string[];
  expr?: string;
  references?: { table: string; column: string; onDelete?: string; onUpdate?: string };
  name?: string;
}

// ── Dialect Type Manifest ──────────────────────────────────────────────────────

export interface DialectTypeGroup {
  group: string;
  types: string[];
}

export interface DialectManifestEntry {
  typeGroups: DialectTypeGroup[];
  constraints: Record<string, boolean>;
  autoIncrementKeyword: string | null;
  generatedStoredKeyword: string;
  generatedVirtualSupported: boolean;
  commentSupported: boolean;
  dialectWarnings: Record<string, string>;
}

export const DIALECT_TYPE_MANIFEST: Record<Dialect, DialectManifestEntry> = {
  MySQL: {
    typeGroups: [
      { group: 'Integer', types: ['TINYINT', 'SMALLINT', 'MEDIUMINT', 'INT', 'BIGINT'] },
      { group: 'Decimal', types: ['FLOAT', 'DOUBLE', 'REAL', 'DECIMAL(p,s)', 'NUMERIC(p,s)'] },
      { group: 'String', types: ['CHAR(n)', 'VARCHAR(n)', 'TINYTEXT', 'TEXT', 'MEDIUMTEXT', 'LONGTEXT'] },
      { group: 'Special String', types: ['ENUM(...)', 'SET(...)'] },
      { group: 'Date & Time', types: ['DATE', 'TIME', 'YEAR', 'DATETIME', 'TIMESTAMP'] },
      { group: 'Binary / Boolean', types: ['BOOLEAN', 'BIT(n)', 'BINARY(n)', 'VARBINARY(n)', 'BLOB'] },
      { group: 'JSON', types: ['JSON'] },
      { group: 'Spatial', types: ['GEOMETRY', 'POINT', 'LINESTRING', 'POLYGON'] },
      { group: 'Computed', types: ['GENERATED STORED', 'GENERATED VIRTUAL'] },
    ],
    constraints: {
      PRIMARY_KEY: true, NOT_NULL: true, UNIQUE: true, DEFAULT: true, CHECK: true,
      AUTO_INCREMENT: true, SERIAL: false, IDENTITY: false, AUTOINCREMENT: false,
      FOREIGN_KEY: true, ON_DELETE_CASCADE: true, ON_DELETE_SET_NULL: true,
      ON_DELETE_SET_DEFAULT: false, ON_DELETE_RESTRICT: true, ON_DELETE_NO_ACTION: true,
      ON_UPDATE_CASCADE: true, ON_UPDATE_SET_NULL: true, ON_UPDATE_RESTRICT: true,
      ENUM: true, SET: true, UNSIGNED: true, ZEROFILL: true, COLLATE: true,
      COMMENT: true, GENERATED_STORED: true, GENERATED_VIRTUAL: true,
      DEFERRABLE: false, EXCLUDE: false,
    },
    autoIncrementKeyword: 'AUTO_INCREMENT',
    generatedStoredKeyword: 'STORED',
    generatedVirtualSupported: true,
    commentSupported: true,
    dialectWarnings: {
      CHECK: 'CHECK constraints are enforced from MySQL 8.0.16+. Earlier versions parse but ignore them.',
      ON_DELETE_SET_DEFAULT: 'ON DELETE SET DEFAULT is not supported in MySQL.',
    },
  },

  PostgreSQL: {
    typeGroups: [
      { group: 'Integer', types: ['SMALLINT', 'INT', 'BIGINT', 'SERIAL', 'BIGSERIAL'] },
      { group: 'Decimal', types: ['REAL', 'DOUBLE PRECISION', 'DECIMAL(p,s)', 'NUMERIC(p,s)', 'MONEY'] },
      { group: 'String', types: ['CHAR(n)', 'VARCHAR(n)', 'TEXT'] },
      { group: 'Date & Time', types: ['DATE', 'TIME', 'TIMESTAMP', 'TIMESTAMPTZ', 'INTERVAL'] },
      { group: 'Binary / Boolean', types: ['BOOLEAN', 'BIT(n)', 'BYTEA'] },
      { group: 'JSON', types: ['JSON', 'JSONB'] },
      { group: 'Network', types: ['CIDR', 'INET', 'MACADDR'] },
      { group: 'Array & Other', types: ['ARRAY', 'UUID', 'HSTORE'] },
      { group: 'Spatial (PostGIS)', types: ['GEOMETRY', 'GEOGRAPHY'] },
      { group: 'Computed', types: ['GENERATED STORED'] },
    ],
    constraints: {
      PRIMARY_KEY: true, NOT_NULL: true, UNIQUE: true, DEFAULT: true, CHECK: true,
      AUTO_INCREMENT: false, SERIAL: true, IDENTITY: false, AUTOINCREMENT: false,
      FOREIGN_KEY: true, ON_DELETE_CASCADE: true, ON_DELETE_SET_NULL: true,
      ON_DELETE_SET_DEFAULT: true, ON_DELETE_RESTRICT: true, ON_DELETE_NO_ACTION: true,
      ON_UPDATE_CASCADE: true, ON_UPDATE_SET_NULL: true, ON_UPDATE_RESTRICT: true,
      ENUM: false, SET: false, UNSIGNED: false, ZEROFILL: false, COLLATE: true,
      COMMENT: false, GENERATED_STORED: true, GENERATED_VIRTUAL: true,
      DEFERRABLE: true, EXCLUDE: true,
    },
    autoIncrementKeyword: 'SERIAL',
    generatedStoredKeyword: 'STORED',
    generatedVirtualSupported: true,
    commentSupported: false,
    dialectWarnings: {
      AUTO_INCREMENT: 'AUTO_INCREMENT is a MySQL feature. Use SERIAL or GENERATED AS IDENTITY in PostgreSQL.',
      ENUM: 'Inline ENUM is not supported in PostgreSQL. Use CREATE TYPE ... AS ENUM (...) before creating the table.',
      SET: 'SET type is not supported in PostgreSQL.',
      COMMENT: 'Inline COMMENT syntax is not supported. Use COMMENT ON COLUMN table.col IS \'...\' after creation.',
    },
  },

  SQLite: {
    typeGroups: [
      { group: 'Integer (Affinity)', types: ['INTEGER', 'INT', 'TINYINT', 'SMALLINT', 'BIGINT'] },
      { group: 'Real (Affinity)', types: ['REAL', 'FLOAT', 'DOUBLE', 'DECIMAL(p,s)'] },
      { group: 'Text (Affinity)', types: ['TEXT', 'VARCHAR(n)', 'CHAR(n)', 'CLOB'] },
      { group: 'Blob (Affinity)', types: ['BLOB'] },
      { group: 'Numeric (Affinity)', types: ['NUMERIC', 'BOOLEAN', 'DATE', 'DATETIME'] },
      { group: 'Computed', types: ['GENERATED STORED', 'GENERATED VIRTUAL'] },
    ],
    constraints: {
      PRIMARY_KEY: true, NOT_NULL: true, UNIQUE: true, DEFAULT: true, CHECK: true,
      AUTO_INCREMENT: false, SERIAL: false, IDENTITY: false, AUTOINCREMENT: true,
      FOREIGN_KEY: true, ON_DELETE_CASCADE: true, ON_DELETE_SET_NULL: true,
      ON_DELETE_SET_DEFAULT: false, ON_DELETE_RESTRICT: true, ON_DELETE_NO_ACTION: true,
      ON_UPDATE_CASCADE: true, ON_UPDATE_SET_NULL: true, ON_UPDATE_RESTRICT: true,
      ENUM: false, SET: false, UNSIGNED: false, ZEROFILL: false, COLLATE: true,
      COMMENT: false, GENERATED_STORED: true, GENERATED_VIRTUAL: true,
      DEFERRABLE: true, EXCLUDE: false,
    },
    autoIncrementKeyword: 'AUTOINCREMENT',
    generatedStoredKeyword: 'STORED',
    generatedVirtualSupported: true,
    commentSupported: false,
    dialectWarnings: {
      AUTO_INCREMENT: 'Use AUTOINCREMENT in SQLite (with INTEGER PRIMARY KEY). Note: AUTOINCREMENT prevents reuse of deleted row IDs.',
      ENUM: 'ENUM is not supported in SQLite. Use a CHECK constraint to restrict values.',
      SET: 'SET type is not supported in SQLite.',
    },
  },

  TransactSQL: {
    typeGroups: [
      { group: 'Integer', types: ['TINYINT', 'SMALLINT', 'INT', 'BIGINT', 'BIT'] },
      { group: 'Decimal', types: ['REAL', 'FLOAT', 'DECIMAL(p,s)', 'NUMERIC(p,s)', 'MONEY', 'SMALLMONEY'] },
      { group: 'String', types: ['CHAR(n)', 'VARCHAR(n)', 'VARCHAR(MAX)', 'NCHAR(n)', 'NVARCHAR(n)', 'NVARCHAR(MAX)', 'TEXT', 'NTEXT'] },
      { group: 'Date & Time', types: ['DATE', 'TIME', 'DATETIME', 'DATETIME2', 'SMALLDATETIME', 'DATETIMEOFFSET'] },
      { group: 'Binary', types: ['BINARY(n)', 'VARBINARY(n)', 'VARBINARY(MAX)', 'IMAGE'] },
      { group: 'Other', types: ['UNIQUEIDENTIFIER', 'XML', 'ROWVERSION', 'TIMESTAMP', 'SQL_VARIANT'] },
      { group: 'Computed', types: ['GENERATED STORED (PERSISTED)'] },
    ],
    constraints: {
      PRIMARY_KEY: true, NOT_NULL: true, UNIQUE: true, DEFAULT: true, CHECK: true,
      AUTO_INCREMENT: false, SERIAL: false, IDENTITY: true, AUTOINCREMENT: false,
      FOREIGN_KEY: true, ON_DELETE_CASCADE: true, ON_DELETE_SET_NULL: true,
      ON_DELETE_SET_DEFAULT: true, ON_DELETE_RESTRICT: false, ON_DELETE_NO_ACTION: true,
      ON_UPDATE_CASCADE: false, ON_UPDATE_SET_NULL: false, ON_UPDATE_RESTRICT: false,
      ENUM: false, SET: false, UNSIGNED: false, ZEROFILL: false, COLLATE: true,
      COMMENT: false, GENERATED_STORED: true, GENERATED_VIRTUAL: false,
      DEFERRABLE: false, EXCLUDE: false,
    },
    autoIncrementKeyword: 'IDENTITY(1,1)',
    generatedStoredKeyword: 'PERSISTED',
    generatedVirtualSupported: false,
    commentSupported: false,
    dialectWarnings: {
      AUTO_INCREMENT: 'Use IDENTITY(1,1) for auto-increment in T-SQL/SSMS.',
      ENUM: 'ENUM is not supported in T-SQL. Use a CHECK constraint or a lookup table.',
      SET: 'SET type is not supported in T-SQL.',
      BOOLEAN: 'BOOLEAN is not a native T-SQL type. Use BIT (0 = false, 1 = true) instead.',
      ON_UPDATE_CASCADE: 'ON UPDATE CASCADE is not supported in T-SQL.',
      GENERATED_VIRTUAL: 'VIRTUAL computed columns are not supported in T-SQL. Use PERSISTED instead.',
    },
  },

  SSMS: {
    // SSMS is an alias for TransactSQL
    typeGroups: [
      { group: 'Integer', types: ['TINYINT', 'SMALLINT', 'INT', 'BIGINT', 'BIT'] },
      { group: 'Decimal', types: ['REAL', 'FLOAT', 'DECIMAL(p,s)', 'NUMERIC(p,s)', 'MONEY', 'SMALLMONEY'] },
      { group: 'String', types: ['CHAR(n)', 'VARCHAR(n)', 'VARCHAR(MAX)', 'NCHAR(n)', 'NVARCHAR(n)', 'NVARCHAR(MAX)', 'TEXT', 'NTEXT'] },
      { group: 'Date & Time', types: ['DATE', 'TIME', 'DATETIME', 'DATETIME2', 'SMALLDATETIME', 'DATETIMEOFFSET'] },
      { group: 'Binary', types: ['BINARY(n)', 'VARBINARY(n)', 'VARBINARY(MAX)', 'IMAGE'] },
      { group: 'Other', types: ['UNIQUEIDENTIFIER', 'XML', 'ROWVERSION', 'TIMESTAMP', 'SQL_VARIANT'] },
      { group: 'Computed', types: ['GENERATED STORED (PERSISTED)'] },
    ],
    constraints: {
      PRIMARY_KEY: true, NOT_NULL: true, UNIQUE: true, DEFAULT: true, CHECK: true,
      AUTO_INCREMENT: false, SERIAL: false, IDENTITY: true, AUTOINCREMENT: false,
      FOREIGN_KEY: true, ON_DELETE_CASCADE: true, ON_DELETE_SET_NULL: true,
      ON_DELETE_SET_DEFAULT: true, ON_DELETE_RESTRICT: false, ON_DELETE_NO_ACTION: true,
      ON_UPDATE_CASCADE: false, ON_UPDATE_SET_NULL: false, ON_UPDATE_RESTRICT: false,
      ENUM: false, SET: false, UNSIGNED: false, ZEROFILL: false, COLLATE: true,
      COMMENT: false, GENERATED_STORED: true, GENERATED_VIRTUAL: false,
      DEFERRABLE: false, EXCLUDE: false,
    },
    autoIncrementKeyword: 'IDENTITY(1,1)',
    generatedStoredKeyword: 'PERSISTED',
    generatedVirtualSupported: false,
    commentSupported: false,
    dialectWarnings: {
      AUTO_INCREMENT: 'Use IDENTITY(1,1) for auto-increment in T-SQL/SSMS.',
      ENUM: 'ENUM is not supported in SSMS/T-SQL. Use a CHECK constraint instead.',
    },
  },
};

// ── mapFormTypeToLogicalType ───────────────────────────────────────────────────

export function mapFormTypeToLogicalType(formType: string): LogicalType {
  const t = formType.toUpperCase().split('(')[0].trim();
  if (['INT', 'INTEGER', 'TINYINT', 'SMALLINT', 'MEDIUMINT', 'BIGINT', 'BIT', 'SERIAL', 'BIGSERIAL'].includes(t)) return 'INTEGER';
  if (['FLOAT', 'DOUBLE', 'REAL', 'DECIMAL', 'NUMERIC', 'MONEY', 'SMALLMONEY', 'DOUBLE PRECISION'].includes(t)) return 'NUMERIC';
  if (['DATE'].includes(t)) return 'DATE';
  if (['DATETIME', 'TIMESTAMP', 'TIMESTAMPTZ', 'DATETIME2', 'SMALLDATETIME', 'DATETIMEOFFSET', 'TIME', 'YEAR'].includes(t)) return 'TIMESTAMP';
  if (['BOOLEAN', 'BOOL'].includes(t)) return 'BOOLEAN';
  return 'VARCHAR';
}

// ── buildColumnDDL ────────────────────────────────────────────────────────────

export function buildColumnDDL(col: ColumnFormRow, dialect: Dialect): string {
  const manifest = DIALECT_TYPE_MANIFEST[dialect];
  const parts: string[] = [];

  // Column name
  parts.push(`\`${col.name}\``);

  // Data type formatting
  let typeStr = col.type.replace('(...)', '').replace('(p,s)', '').replace('(n)', '').trim();
  const upperType = typeStr.toUpperCase();

  if (upperType.startsWith('ENUM')) {
    const rawVals = (col.enumValues && col.enumValues.length > 0) ? col.enumValues : (col.setValues || []);
    const cleanVals = rawVals.map(v => v.replace(/^['"\[\s]+|['"\]\s]+$/g, '').trim()).filter(Boolean);
    const finalVals = cleanVals.length > 0 ? cleanVals : ['val1', 'val2'];
    typeStr = `ENUM(${finalVals.map(v => `'${v.replace(/'/g, "''")}'`).join(', ')})`;
  } else if (upperType.startsWith('SET')) {
    const rawVals = (col.setValues && col.setValues.length > 0) ? col.setValues : (col.enumValues || []);
    const cleanVals = rawVals.map(v => v.replace(/^['"\[\s]+|['"\]\s]+$/g, '').trim()).filter(Boolean);
    const finalVals = cleanVals.length > 0 ? cleanVals : ['val1', 'val2'];
    typeStr = `SET(${finalVals.map(v => `'${v.replace(/'/g, "''")}'`).join(', ')})`;
  } else if (upperType.includes('GENERATED')) {
    typeStr = '';
  }

  if (typeStr) parts.push(typeStr);

  // UNSIGNED (MySQL only)
  if (col.isUnsigned && manifest.constraints['UNSIGNED']) parts.push('UNSIGNED');

  // ZEROFILL (MySQL only)
  if (col.isZerofill && manifest.constraints['ZEROFILL']) parts.push('ZEROFILL');

  // NOT NULL
  if (col.isNotNull) parts.push('NOT NULL');

  // AUTO_INCREMENT / IDENTITY / AUTOINCREMENT / SERIAL (handled separately at type level for SERIAL)
  if (col.isAutoIncrement && manifest.autoIncrementKeyword && manifest.autoIncrementKeyword !== 'SERIAL') {
    parts.push(manifest.autoIncrementKeyword);
  }

  // PRIMARY KEY
  if (col.isPrimaryKey) parts.push('PRIMARY KEY');

  // UNIQUE (only if not PK)
  if (col.isUnique && !col.isPrimaryKey) parts.push('UNIQUE');

  // DEFAULT
  if (col.defaultValue !== undefined && col.defaultValue !== '') {
    parts.push(`DEFAULT ${col.defaultValue}`);
  }

  // CHECK
  if (col.checkExpr && col.checkExpr.trim()) {
    parts.push(`CHECK (${col.checkExpr.trim()})`);
  }

  // GENERATED
  if (col.generatedExpr && col.generatedExpr.trim()) {
    const storedKw = manifest.generatedStoredKeyword;
    const mode = col.generatedMode === 'VIRTUAL' && manifest.generatedVirtualSupported ? 'VIRTUAL' : storedKw;
    parts.splice(1, 0, `AS (${col.generatedExpr.trim()}) ${mode}`);
  }

  // REFERENCES (FK) — inline column-level
  if (col.references && col.references.table && col.references.column) {
    let refStr = `REFERENCES ${col.references.table}(${col.references.column})`;
    if (col.references.onDelete) refStr += ` ON DELETE ${col.references.onDelete}`;
    if (col.references.onUpdate && manifest.constraints['ON_UPDATE_CASCADE']) {
      refStr += ` ON UPDATE ${col.references.onUpdate}`;
    }
    parts.push(refStr);
  }

  // COLLATE
  if (col.collate && col.collate.trim()) {
    parts.push(`COLLATE ${col.collate.trim()}`);
  }

  // COMMENT (MySQL only)
  if (col.comment && col.comment.trim() && manifest.commentSupported) {
    parts.push(`COMMENT '${col.comment.replace(/'/g, "''")}'`);
  }

  return parts.join(' ');
}

// ── buildCreateTableSql ───────────────────────────────────────────────────────

export function buildCreateTableSql(
  tableName: string,
  columns: ColumnFormRow[],
  tableConstraints: TableConstraintForm[],
  dialect: Dialect,
): string {
  const colDefs = columns.map(c => `  ${buildColumnDDL(c, dialect)}`);

  const tableCons: string[] = tableConstraints.map(tc => {
    switch (tc.type) {
      case 'PRIMARY_KEY':
        return `  PRIMARY KEY (${(tc.columns || []).join(', ')})`;
      case 'UNIQUE':
        return `  UNIQUE (${(tc.columns || []).join(', ')})`;
      case 'CHECK':
        return `  CHECK (${tc.expr || ''})`;
      case 'FOREIGN_KEY': {
        const cols = (tc.columns || []).join(', ');
        let fk = `  FOREIGN KEY (${cols}) REFERENCES ${tc.references?.table || ''}(${tc.references?.column || ''})`;
        if (tc.references?.onDelete) fk += ` ON DELETE ${tc.references.onDelete}`;
        if (tc.references?.onUpdate) fk += ` ON UPDATE ${tc.references.onUpdate}`;
        return fk;
      }
      case 'INDEX':
        return `  INDEX (${(tc.columns || []).join(', ')})`;
      default:
        return '';
    }
  }).filter(Boolean);

  const allDefs = [...colDefs, ...tableCons];
  return `CREATE TABLE IF NOT EXISTS ${tableName} (\n${allDefs.join(',\n')}\n);`;
}

// ── Drop SQL helpers ──────────────────────────────────────────────────────────

export function dropTableSql(tableName: string): string {
  return `DROP TABLE IF EXISTS ${tableName};`;
}

export function dropDatabaseSql(dbName: string): string {
  return `DROP DATABASE IF EXISTS ${dbName};`;
}
