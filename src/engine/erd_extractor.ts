/**
 * erd_extractor.ts — ERD Data Extractor Engine
 * Extracts tables, column details, primary keys, and infers foreign key relationships
 * for rendering interactive Entity-Relationship Diagrams.
 */

import { SessionCatalog, CatalogEntry } from './catalog';
import { EXPANDED_DOMAIN_CATALOG } from './domain_catalog_data';

export interface ERDColumn {
  name: string;
  type: string;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  foreignKeyTarget?: {
    table: string;
    column: string;
  };
}

export interface ERDNode {
  id: string; // tableName (lowercased)
  tableName: string;
  rowCount: number;
  dbName?: string;
  isUserDefined?: boolean;
  columns: ERDColumn[];
  x: number;
  y: number;
}

export interface ERDLink {
  id: string;
  sourceTable: string;
  sourceColumn: string;
  targetTable: string;
  targetColumn: string;
  cardinality?: '1:1' | '1:N' | 'N:1' | 'N:M';
}

export interface ERDGraphData {
  nodes: ERDNode[];
  links: ERDLink[];
}

export function extractERDData(catalog: SessionCatalog): ERDGraphData {
  const catalogEntries: CatalogEntry[] = catalog.getAll();
  const nodes: ERDNode[] = [];
  const links: ERDLink[] = [];
  const tableNames = new Set(catalogEntries.map((e) => e.tableName.toLowerCase()));

  // 1. First pass: Build ERD Nodes and identify Primary Keys
  catalogEntries.forEach((entry, idx) => {
    const tableName = entry.tableName.toLowerCase();

    // Check if table matches any domain catalog entry for known PKs/FKs
    const domainSpec = Object.entries(EXPANDED_DOMAIN_CATALOG).find(
      ([key, val]) => key.toLowerCase() === tableName || val.aliases?.some((a) => a.toLowerCase() === tableName)
    )?.[1];

    const columns: ERDColumn[] = entry.schema.columns.map((col) => {
      const colNameLower = col.name.toLowerCase();
      const domainCol = domainSpec?.columns.find((c) => c.name.toLowerCase() === colNameLower);

      const isPk =
        (col as any).isPrimaryKey === true ||
        domainCol?.isPrimaryKey === true ||
        colNameLower === 'id' ||
        colNameLower === `${tableName}_id` ||
        colNameLower === `${tableName}id`;

      const explicitFk = (col as any).references || domainCol?.references;

      return {
        name: col.name,
        type: col.logicalType,
        isPrimaryKey: Boolean(isPk),
        isForeignKey: Boolean(explicitFk),
        foreignKeyTarget: explicitFk
          ? { table: explicitFk.table.toLowerCase(), column: explicitFk.column || 'id' }
          : undefined,
      };
    });

    // Auto-layout initial coordinates grid calculation with generous collision-free spacing
    const colCount = Math.max(1, Math.min(3, Math.ceil(Math.sqrt(catalogEntries.length || 1))));
    const row = Math.floor(idx / colCount);
    const col = idx % colCount;
    const x = 50 + col * 360;
    const y = 50 + row * 380;

    nodes.push({
      id: tableName,
      tableName: entry.tableName,
      rowCount: entry.rowCount,
      dbName: entry.dbName,
      isUserDefined: entry.isUserDefined,
      columns,
      x,
      y,
    });
  });

  // 2. Second pass: Infer Foreign Key Relationships
  const SYNONYM_GROUPS: Record<string, string[]> = {
    user: ['users', 'user', 'customers', 'accounts', 'members', 'clients'],
    customer: ['customers', 'customer', 'users', 'clients', 'accounts'],
    client: ['clients', 'client', 'customers', 'users'],
    account: ['accounts', 'account', 'users', 'customers'],
    product: ['products', 'product', 'items', 'item', 'inventory'],
    item: ['items', 'item', 'products', 'product'],
    order: ['orders', 'order'],
    invoice: ['invoices', 'invoice', 'bills'],
    category: ['categories', 'category'],
    author: ['authors', 'author', 'writers', 'users'],
    dept: ['departments', 'department'],
    department: ['departments', 'department'],
    employee: ['employees', 'employee', 'staff'],
    post: ['posts', 'post'],
    article: ['articles', 'article', 'posts'],
    airline: ['airlines', 'airline'],
    airport: ['airports', 'airport'],
    flight: ['flights', 'flight'],
    patient: ['patients', 'patient'],
    doctor: ['doctors', 'doctor'],
    course: ['courses', 'course'],
    student: ['students', 'student'],
  };

  const findMatchingTargetTable = (colName: string, currentNodeId: string): { targetTable: string; targetColumn: string } | null => {
    // 1. Convert snake_case or camelCase: 'customerId' -> 'customer_id'
    const normalized = colName.replace(/([A-Z])/g, '_$1').toLowerCase();
    if (!normalized.endsWith('_id') || normalized === 'id') return null;

    const base = normalized.replace(/_id$/, '');
    const candidates = [base, `${base}s`, `${base}es`].map((c) => c.toLowerCase());

    if (SYNONYM_GROUPS[base]) {
      candidates.push(...SYNONYM_GROUPS[base]);
    }

    for (const cand of candidates) {
      if (tableNames.has(cand) && cand !== currentNodeId) {
        // Find target table's primary key (defaults to 'id')
        const targetNode = nodes.find((n) => n.id === cand);
        const pkCol = targetNode?.columns.find((c) => c.isPrimaryKey)?.name || 'id';
        return { targetTable: cand, targetColumn: pkCol };
      }
    }
    return null;
  };

  nodes.forEach((node) => {
    node.columns.forEach((col) => {
      // If already has explicit target
      if (col.foreignKeyTarget && tableNames.has(col.foreignKeyTarget.table) && col.foreignKeyTarget.table !== node.id) {
        col.isForeignKey = true;
        const linkId = `${node.id}.${col.name}->${col.foreignKeyTarget.table}.${col.foreignKeyTarget.column}`;
        if (!links.some((l) => l.id === linkId)) {
          links.push({
            id: linkId,
            sourceTable: node.id,
            sourceColumn: col.name,
            targetTable: col.foreignKeyTarget.table,
            targetColumn: col.foreignKeyTarget.column,
            cardinality: 'N:1',
          });
        }
        return;
      }

      // Infer through name matching
      const match = findMatchingTargetTable(col.name, node.id);
      if (match) {
        col.isForeignKey = true;
        col.foreignKeyTarget = {
          table: match.targetTable,
          column: match.targetColumn,
        };

        const linkId = `${node.id}.${col.name}->${match.targetTable}.${match.targetColumn}`;
        if (!links.some((l) => l.id === linkId)) {
          links.push({
            id: linkId,
            sourceTable: node.id,
            sourceColumn: col.name,
            targetTable: match.targetTable,
            targetColumn: match.targetColumn,
            cardinality: 'N:1',
          });
        }
      }
    });
  });

  return { nodes, links };
}
