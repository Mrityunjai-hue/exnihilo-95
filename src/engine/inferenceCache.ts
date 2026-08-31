/**
 * inferenceCache.ts — High-Performance In-Memory LRU Cache for Schema Inference
 *
 * Caches AST-based InferredSchemaMap per (dialect, queryText) tuple to eliminate
 * redundant AST parses and relationship analyses during interactive editing and re-executions.
 */

import { Dialect } from './parser';
import { inferSchema, InferredSchemaMap } from './inference';

const MAX_CACHE_SIZE = 100;

interface CacheEntry {
  key: string;
  result: InferredSchemaMap;
}

class InferenceCache {
  private cache = new Map<string, CacheEntry>();

  private computeKey(queryText: string, dialect: Dialect): string {
    return `${dialect}:::${queryText.trim()}`;
  }

  get(queryText: string, dialect: Dialect): InferredSchemaMap | null {
    const key = this.computeKey(queryText, dialect);
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Refresh LRU order (delete & re-insert)
    this.cache.delete(key);
    this.cache.set(key, entry);
    return entry.result;
  }

  set(queryText: string, dialect: Dialect, result: InferredSchemaMap): void {
    const key = this.computeKey(queryText, dialect);
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= MAX_CACHE_SIZE) {
      // Evict oldest entry (first item in Map iterator)
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) this.cache.delete(oldestKey);
    }
    this.cache.set(key, { key, result });
  }

  clear(): void {
    this.cache.clear();
  }

  get size(): number {
    return this.cache.size;
  }
}

export const globalInferenceCache = new InferenceCache();

export function inferSchemaCached(queryText: string, dialect: Dialect): InferredSchemaMap {
  const cached = globalInferenceCache.get(queryText, dialect);
  if (cached) {
    return cached;
  }
  const computed = inferSchema(queryText, dialect);
  globalInferenceCache.set(queryText, dialect, computed);
  return computed;
}
