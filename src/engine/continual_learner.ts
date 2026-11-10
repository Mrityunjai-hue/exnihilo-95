/**
 * continual_learner.ts — In-Browser Continual Online Learner & Associative Memory
 *
 * Implements local-first online learning: when out-of-distribution tables and columns
 * are created or queried, their schemas, morphological roots, and conditional probabilities
 * are learned and persisted in IndexedDB so the engine continuously improves across sessions.
 */

import { DomainColumnSpec } from './domain_catalog_data';
import { normalizeTableName } from './morphology';
import { LogicalType } from './inference';
import { faker } from '@faker-js/faker';

export interface LearnedColumn {
  name: string;
  logicalType: LogicalType;
  frequency: number;
}

export interface LearnedTableMemory {
  tableName: string;
  rootToken: string;
  columns: LearnedColumn[];
  lastObserved: number;
}

const STORAGE_KEY = 'exnihilo_ml_experience';

class ContinualLearner {
  private memory: Map<string, LearnedTableMemory> = new Map();
  private isLoaded = false;

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (this.isLoaded) return;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed: LearnedTableMemory[] = JSON.parse(raw);
          parsed.forEach((item) => {
            this.memory.set(item.tableName.toLowerCase(), item);
          });
        }
      }
    } catch (e) {
      // In SSR or restricted storage environments, memory store gracefully handles learning
    }
    this.isLoaded = true;
  }

  private saveToStorage() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const list = Array.from(this.memory.values());
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      }
    } catch (e) {
      // Storage quota or SSR safe
    }
  }

  /**
   * Ingest an observed table and its columns into the continual learning memory
   */
  public recordTableExperience(
    rawTableName: string,
    columns: Array<{ name: string; logicalType: LogicalType }>
  ) {
    this.loadFromStorage();
    const info = normalizeTableName(rawTableName);
    const key = info.singularName.toLowerCase();
    const existing = this.memory.get(key);

    const colMap = new Map<string, LearnedColumn>();
    if (existing) {
      existing.columns.forEach((c) => colMap.set(c.name.toLowerCase(), c));
    }

    columns.forEach((col) => {
      const colKey = col.name.toLowerCase();
      const prev = colMap.get(colKey);
      if (prev) {
        prev.frequency += 1;
        prev.logicalType = col.logicalType; // Update with latest confirmed type
      } else {
        colMap.set(colKey, {
          name: col.name,
          logicalType: col.logicalType,
          frequency: 1,
        });
      }
    });

    this.memory.set(key, {
      tableName: rawTableName,
      rootToken: info.entityHead,
      columns: Array.from(colMap.values()),
      lastObserved: Date.now(),
    });

    this.saveToStorage();
  }

  /**
   * Check if a table name (or its root entity) has been learned previously
   */
  public predictLearnedSchema(rawTableName: string): DomainColumnSpec[] | null {
    this.loadFromStorage();
    const info = normalizeTableName(rawTableName);
    const key = info.singularName.toLowerCase();

    // 1. Direct table match in memory
    let matched = this.memory.get(key);

    // 2. Fallback: match by root entity head (e.g., 'quantum_circuits_v2' matches learned 'quantum_circuit')
    if (!matched && info.entityHead) {
      for (const item of this.memory.values()) {
        if (item.rootToken === info.entityHead || item.tableName.includes(info.entityHead)) {
          matched = item;
          break;
        }
      }
    }

    if (!matched || matched.columns.length === 0) return null;

    // Convert learned columns into DomainColumnSpecs
    return matched.columns.map((c, idx) => ({
      name: c.name,
      logicalType: c.logicalType,
      isPrimaryKey: idx === 0 && (c.name.toLowerCase() === 'id' || c.name.toLowerCase().endsWith('_id')),
      fakerGenerator: () => {
        switch (c.logicalType) {
          case 'INTEGER':
            return faker.number.int({ min: 1, max: 100 });
          case 'NUMERIC':
            return parseFloat((faker.number.float({ min: 10.0, max: 999.0, fractionDigits: 2 })).toFixed(2));
          case 'DATE':
            return faker.date.recent().toISOString().split('T')[0];
          case 'TIMESTAMP':
            return faker.date.recent().toISOString();
          case 'BOOLEAN':
            return faker.datatype.boolean();
          default:
            return `${c.name}_${faker.string.alphanumeric(4)}`;
        }
      },
    }));
  }

  public getLearnedCount(): number {
    this.loadFromStorage();
    return this.memory.size;
  }

  public clearExperience() {
    this.memory.clear();
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {}
  }
}

export const continualLearner = new ContinualLearner();

