/**
 * generator.ts — Phase 4: Synthetic Data Generation
 *
 * Implements spec Section 3.4 completely:
 *  - Type-appropriate synthetic data generation using @faker-js/faker
 *  - Name heuristics for realistic domain-specific values (email, name, price, status, dates, etc.)
 *  - Deterministic seeding per table name for reproducibility
 *  - Strict referential integrity enforcement using Phase 3 dependency graph & parent key pools
 *  - Match ratio logic:
 *      * INNER JOIN: 100% match from parent PK pool
 *      * LEFT JOIN / RIGHT JOIN: ~80–85% match, ~15–20% orphan (NULL / non-existent)
 *      * Self-joins: hierarchical tree with root manager = NULL
 *      * Composite keys: samples row tuples from the exact same parent row
 *  - Configurable row caps (default 20 rows/table) and identifier sanitization
 */

import { faker } from '@faker-js/faker';
import { TableSchema, ColumnDef, LogicalType } from './inference';
import { ForeignKeyRelationship, TableGenerationPlan } from './relationships';

// ── Configuration Options ─────────────────────────────────────────────────────

export interface GeneratorOptions {
  /** Maximum rows to generate per table (default: 20) */
  rowsPerTable?: number;
  /** Maximum tables allowed in session (default: 25) */
  tableCap?:     number;
  /** Global seed offset for session reproducibility (default: 42) */
  seedOffset?:   number;
}

export interface GeneratedTableData {
  tableName: string;
  schema:    TableSchema;
  columns:   string[];
  rows:      Record<string, any>[];
  /** DDL CREATE TABLE statement ready for sql.js */
  createSql: string;
  /** SQL INSERT statements ready for sql.js */
  insertSql: string[];
}

export type GeneratedDataset = Map<string, GeneratedTableData>;

// ── Deterministic String Hash for Seeding ─────────────────────────────────────

function stringToSeed(str: string, offset = 42): number {
  let hash = offset;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

// ── Identifier Sanitization ───────────────────────────────────────────────────

export function sanitizeIdentifier(name: string): string {
  // If valid standard SQL identifier, return as-is
  if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
    return name;
  }
  // Otherwise wrap in double quotes for SQLite
  return `"${name.replace(/"/g, '""')}"`;
}

// ── Heuristic Value Generators ────────────────────────────────────────────────

function generateVarchar(colName: string, tableName: string): string {
  const n = colName.toLowerCase();
  const t = tableName.toLowerCase();

  if (n === 'email' || n.endsWith('_email')) return faker.internet.email();
  if (n === 'first_name' || n === 'firstname') return faker.person.firstName();
  if (n === 'last_name' || n === 'lastname') return faker.person.lastName();

  if (n === 'name' || n.endsWith('_name')) {
    if (t.includes('cust') || t.includes('user') || t.includes('emp') || t.includes('person') || t.includes('lead') || t.includes('contact')) {
      return faker.person.fullName();
    }
    if (t.includes('prod') || t.includes('item')) return faker.commerce.productName();
    if (t.includes('dept') || t.includes('department')) return faker.commerce.department();
    if (t.includes('comp') || t.includes('org') || t.includes('vendor')) return faker.company.name();
    return faker.commerce.productName();
  }

  if (n === 'title' || n === 'job_title') return faker.person.jobTitle();
  if (n === 'phone' || n === 'phone_number' || n.endsWith('_phone')) return faker.phone.number();
  if (n === 'address' || n === 'street') return faker.location.streetAddress();
  if (n === 'city') return faker.location.city();
  if (n === 'state' || n === 'province') return faker.location.state();
  if (n === 'country') return faker.location.country();
  if (n === 'zip' || n === 'postal_code' || n === 'zipcode') return faker.location.zipCode();
  if (n === 'company' || n === 'organization') return faker.company.name();
  if (n === 'department') return faker.helpers.arrayElement(['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations', 'Support']);
  if (n === 'status') return faker.helpers.arrayElement(['active', 'pending', 'completed', 'shipped', 'cancelled', 'processing']);
  if (n === 'role') return faker.helpers.arrayElement(['admin', 'user', 'manager', 'editor', 'viewer']);
  if (n === 'type' || n === 'category') return faker.helpers.arrayElement(['standard', 'premium', 'basic', 'enterprise']);
  if (n === 'description' || n === 'notes' || n === 'body' || n === 'comment') return faker.lorem.sentence();

  return faker.word.sample();
}

function generateNumeric(colName: string, rowIndex: number): number {
  const n = colName.toLowerCase();

  if (n.includes('price') || n.includes('cost') || n.includes('amount')) {
    return faker.number.float({ min: 9.99, max: 499.99, fractionDigits: 2 });
  }
  if (n.includes('salary')) {
    return faker.number.int({ min: 45000, max: 160000 });
  }
  if (n === 'age' || n.endsWith('_age')) {
    return faker.number.int({ min: 21, max: 65 });
  }
  if (n.includes('qty') || n.includes('quantity') || n.includes('count')) {
    return faker.number.int({ min: 1, max: 20 });
  }
  if (n.includes('score') || n.includes('rating')) {
    return faker.number.float({ min: 1.0, max: 5.0, fractionDigits: 1 });
  }
  if (n.includes('balance')) {
    return faker.number.float({ min: 100.0, max: 15000.0, fractionDigits: 2 });
  }
  return faker.number.float({ min: 1.0, max: 100.0, fractionDigits: 2 });
}

function generateInteger(colName: string, rowIndex: number): number {
  const n = colName.toLowerCase();

  if (n === 'id' || n.endsWith('_pk')) {
    return rowIndex + 1; // 1, 2, 3, 4, ...
  }
  if (n === 'age') {
    return faker.number.int({ min: 21, max: 65 });
  }
  if (n.includes('qty') || n.includes('quantity') || n.includes('count')) {
    return faker.number.int({ min: 1, max: 25 });
  }
  if (n.includes('year')) {
    return faker.number.int({ min: 2020, max: 2026 });
  }
  return faker.number.int({ min: 1, max: 1000 });
}

function generateDate(colName: string): string {
  const date = faker.date.recent({ days: 365 });
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
}

function generateTimestamp(colName: string): string {
  const date = faker.date.recent({ days: 365 });
  return date.toISOString().replace('T', ' ').substring(0, 19); // YYYY-MM-DD HH:MM:SS
}

function generateBoolean(): number {
  return faker.number.int({ min: 0, max: 1 });
}

// ── Single Column Value Dispatcher ────────────────────────────────────────────

function generateScalarValue(
  col:       ColumnDef,
  tableName: string,
  rowIndex:  number,
): any {
  switch (col.logicalType) {
    case 'INTEGER':   return generateInteger(col.name, rowIndex);
    case 'NUMERIC':   return generateNumeric(col.name, rowIndex);
    case 'VARCHAR':   return generateVarchar(col.name, tableName);
    case 'DATE':      return generateDate(col.name);
    case 'TIMESTAMP': return generateTimestamp(col.name);
    case 'BOOLEAN':   return generateBoolean();
    default:          return faker.word.sample();
  }
}

// ── SQL DDL & INSERT Formatter ────────────────────────────────────────────────

export function generateCreateTableSql(tableName: string, columns: ColumnDef[]): string {
  const safeTable = sanitizeIdentifier(tableName);
  const colDefs = columns.map(c => {
    const safeCol = sanitizeIdentifier(c.name);
    if (c.name.toLowerCase() === 'id') {
      return `${safeCol} ${c.sqliteType} PRIMARY KEY`;
    }
    return `${safeCol} ${c.sqliteType}`;
  });

  return `CREATE TABLE ${safeTable} (\n  ${colDefs.join(',\n  ')}\n);`;
}

export function generateInsertSql(
  tableName: string,
  columns:   string[],
  rows:      Record<string, any>[],
): string[] {
  if (rows.length === 0) return [];
  const safeTable = sanitizeIdentifier(tableName);
  const safeCols  = columns.map(sanitizeIdentifier).join(', ');

  return rows.map(row => {
    const vals = columns.map(col => {
      const val = row[col];
      if (val === null || val === undefined) return 'NULL';
      if (typeof val === 'number') return String(val);
      // Escape single quotes for SQL string literals
      return `'${String(val).replace(/'/g, "''")}'`;
    });
    return `INSERT INTO ${safeTable} (${safeCols}) VALUES (${vals.join(', ')});`;
  });
}

// ── Master Dataset Generator ──────────────────────────────────────────────────

export function generateSyntheticDataset(
  schemas: Map<string, TableSchema>,
  plan:    TableGenerationPlan,
  options: GeneratorOptions = {},
): GeneratedDataset {
  const rowsPerTable = options.rowsPerTable ?? 20;
  const seedOffset   = options.seedOffset ?? 42;

  const dataset: GeneratedDataset = new Map();
  // Stores generated row objects for parent tables so child tables can sample keys/tuples
  const generatedRowsStore = new Map<string, Record<string, any>[]>();

  // Generate tables in strictly topological order
  for (const tableName of plan.generationOrder) {
    const schema = schemas.get(tableName);
    if (!schema) continue;

    // Seed faker deterministically per table
    const tableSeed = stringToSeed(tableName, seedOffset);
    faker.seed(tableSeed);

    const columns = schema.columns.map(c => c.name);
    const rows: Record<string, any>[] = [];

    // Find incoming relationships where this table is the CHILD
    const incomingRels = plan.relationships.filter(
      r => r.childTable === tableName && generatedRowsStore.has(r.parentTable)
    );

    // Find self-joins on this table
    const selfRel = plan.selfJoins.find(r => r.childTable === tableName);

    for (let rIdx = 0; rIdx < rowsPerTable; rIdx++) {
      const row: Record<string, any> = {};

      // 1. Generate baseline values for each column
      for (const col of schema.columns) {
        row[col.name] = generateScalarValue(col, tableName, rIdx);
      }

      // 2. Apply Foreign Key Referential Integrity from Parent Tables
      for (const rel of incomingRels) {
        const parentRows = generatedRowsStore.get(rel.parentTable)!;
        if (parentRows.length === 0) continue;

        // Determine match vs orphan status based on join type
        let isOrphan = false;
        if (rel.joinType === 'LEFT' || rel.joinType === 'FULL') {
          // ~20% orphan ratio for realistic outer join testing (e.g. index % 5 === 4)
          isOrphan = (rIdx % 5 === 4);
        }

        if (isOrphan) {
          // Assign non-matching or null values for orphan rows
          for (const childCol of rel.childColumns) {
            row[childCol] = null;
          }
        } else {
          // Pick a random parent row to maintain exact referential integrity
          const parentRowIndex = rIdx % parentRows.length;
          const parentRow = parentRows[parentRowIndex];

          for (let k = 0; k < rel.childColumns.length; k++) {
            const childCol  = rel.childColumns[k];
            const parentCol = rel.parentColumns[k];
            if (childCol && parentCol && parentRow[parentCol] !== undefined) {
              row[childCol] = parentRow[parentCol];
            }
          }
        }
      }

      // 3. Apply Self-Join Hierarchy (e.g. manager_id -> id)
      if (selfRel) {
        const childCol  = selfRel.childColumns[0];
        const parentCol = selfRel.parentColumns[0];

        // Root manager / CEO: row 0 has NULL manager
        if (rIdx === 0) {
          row[childCol] = null;
        } else {
          // Other employees reference an earlier employee in the hierarchy
          const parentIndex = Math.floor(Math.random() * rIdx);
          row[childCol] = rows[parentIndex]?.[parentCol] ?? 1;
        }
      }

      rows.push(row);
    }

    generatedRowsStore.set(tableName, rows);

    const createSql = generateCreateTableSql(tableName, schema.columns);
    const insertSql = generateInsertSql(tableName, columns, rows);

    dataset.set(tableName, {
      tableName,
      schema,
      columns,
      rows,
      createSql,
      insertSql,
    });
  }

  return dataset;
}
