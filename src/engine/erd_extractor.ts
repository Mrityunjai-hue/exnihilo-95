/**
 * erd_extractor.ts — ERD Data Extractor Engine
 * Extracts tables, column details, primary keys, and infers foreign key relationships
 * for rendering interactive Entity-Relationship Diagrams.
 */

import { SessionCatalog, CatalogEntry } from './catalog';

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
    const columns: ERDColumn[] = entry.schema.columns.map((col) => {
      const colNameLower = col.name.toLowerCase();
      const isPk = colNameLower === 'id' || colNameLower === `${tableName}_id`;
      return {
        name: col.name,
        type: col.logicalType,
        isPrimaryKey: isPk,
        isForeignKey: false,
      };
    });

    // Auto-layout initial coordinates grid calculation
    const colCount = 3;
    const row = Math.floor(idx / colCount);
    const col = idx % colCount;
    const x = 40 + col * 340;
    const y = 40 + row * 280;

    nodes.push({
      id: tableName,
      tableName: entry.tableName,
      rowCount: entry.rowCount,
      columns,
      x,
      y,
    });
  });

  // 2. Second pass: Infer Foreign Key Relationships
  const SYNONYM_GROUPS: Record<string, string[]> = {
    user: ['customers', 'users', 'clients', 'accounts', 'members'],
    customer: ['customers', 'users', 'clients', 'accounts', 'members'],
    client: ['customers', 'users', 'clients', 'accounts'],
    account: ['accounts', 'users', 'customers'],
    product: ['products', 'items', 'inventory'],
    item: ['products', 'items'],
    category: ['categories', 'category'],
    author: ['authors', 'writers'],
  };

  const findMatchingTargetTable = (colName: string, currentNodeId: string): string | null => {
    const colLower = colName.toLowerCase();
    if (!colLower.endsWith('_id') || colLower === 'id') return null;

    const base = colLower.replace(/_id$/, '');
    const candidates = [base, `${base}s`, `${base}es`].map((c) => c.toLowerCase());

    if (SYNONYM_GROUPS[base]) {
      candidates.push(...SYNONYM_GROUPS[base]);
    }

    for (const cand of candidates) {
      if (tableNames.has(cand) && cand !== currentNodeId) {
        return cand;
      }
    }
    return null;
  };

  nodes.forEach((node) => {
    node.columns.forEach((col) => {
      const targetTable = findMatchingTargetTable(col.name, node.id);
      if (targetTable) {
        col.isForeignKey = true;
        col.foreignKeyTarget = {
          table: targetTable,
          column: 'id',
        };

        links.push({
          id: `${node.id}.${col.name}->${targetTable}.id`,
          sourceTable: node.id,
          sourceColumn: col.name,
          targetTable: targetTable,
          targetColumn: 'id',
        });
      }
    });
  });

  return { nodes, links };
}
