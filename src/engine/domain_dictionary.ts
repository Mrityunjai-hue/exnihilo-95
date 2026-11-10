/**
 * domain_dictionary.ts — Next-Generation Semantic Domain Schema Catalog & ML Dispatcher
 *
 * Provides a 5-tier semantic matching system:
 * 1. Continual On-Device Experience Memory (IndexedDB learned schemas)
 * 2. Morphological NLP Normalization (prefix/suffix stripping, lemmatization, token splitting)
 * 3. 50+ Deep Industry Domain Catalogs (Aviation, Crypto, Sports, Healthcare, Education, etc.)
 * 4. Machine Learning Subword Vector Cosine Similarity Classifier
 * 5. Dynamic Procedural Schema Synthesizer for arbitrary unknown tables
 */

import { faker } from '@faker-js/faker';
import { LogicalType } from './inference';
import { matchColumnToken } from './token_dictionary';
import { normalizeTableName } from './morphology';
import { EXPANDED_DOMAIN_CATALOG, DomainColumnSpec, DomainTableSpec } from './domain_catalog_data';
import { predictDomainWithML } from './ml_schema_predictor';
import { synthesizeProceduralSchema } from './procedural_synthesizer';
import { continualLearner } from './continual_learner';

export type { DomainColumnSpec, DomainTableSpec };

// Export DOMAIN_CATALOG with full 50+ industry domains (preserving backwards compatibility)
export const DOMAIN_CATALOG: Record<string, DomainTableSpec> = EXPANDED_DOMAIN_CATALOG;

// Universal Fallback Schema for backward compatibility
export const UNIVERSAL_FALLBACK_SCHEMA: DomainColumnSpec[] = [
  { name: 'id', logicalType: 'INTEGER', isPrimaryKey: true, fakerGenerator: () => 1 },
  { name: 'uuid', logicalType: 'VARCHAR', fakerGenerator: () => faker.string.uuid() },
  { name: 'name', logicalType: 'VARCHAR', fakerGenerator: () => faker.company.name() },
  { name: 'value', logicalType: 'NUMERIC', fakerGenerator: () => parseFloat(faker.commerce.price({ min: 10, max: 1000, dec: 2 })) },
  { name: 'status', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['active', 'pending', 'archived']) },
  { name: 'created_at', logicalType: 'TIMESTAMP', fakerGenerator: () => faker.date.recent().toISOString() }
];

export function resolveDomainSchema(rawTableName: string): DomainColumnSpec[] | null {
  if (!rawTableName || !rawTableName.trim()) return null;

  // ── Step 1: Continual On-Device Learner (Active Memory) ───────────────────
  const learned = continualLearner.predictLearnedSchema(rawTableName);
  if (learned && learned.length > 0) {
    return learned;
  }

  // ── Step 2: Morphological NLP Decomposition ───────────────────────────────
  const info = normalizeTableName(rawTableName);
  const { cleanedName, singularName, tokens, entityHead } = info;

  // ── Step 3: Exact & Alias Matching in 50+ Domain Catalog ──────────────────
  for (const key of Object.keys(EXPANDED_DOMAIN_CATALOG)) {
    const spec = EXPANDED_DOMAIN_CATALOG[key];
    const isExact = spec.aliases.some((alias) => {
      const a = alias.toLowerCase();
      return (
        a === rawTableName.toLowerCase() ||
        a === cleanedName ||
        a === singularName ||
        a === entityHead
      );
    });
    if (isExact) return spec.columns;
  }

  // Token matching (e.g. 'hospital_patients' -> matches 'patients' catalog)
  for (const key of Object.keys(EXPANDED_DOMAIN_CATALOG)) {
    const spec = EXPANDED_DOMAIN_CATALOG[key];
    if (tokens.some((t) => spec.aliases.includes(t) || t === key || t === key.replace(/s$/, ''))) {
      return spec.columns;
    }
  }

  // Substring matching
  for (const key of Object.keys(EXPANDED_DOMAIN_CATALOG)) {
    const keyRoot = key.replace(/s$/, '');
    if (cleanedName.includes(keyRoot) || singularName.includes(keyRoot)) {
      return EXPANDED_DOMAIN_CATALOG[key].columns;
    }
  }

  // ── Step 4: Machine Learning Subword Vector & Cosine Similarity Matcher ───
  const mlMatch = predictDomainWithML(cleanedName);
  if (mlMatch) {
    return mlMatch.columns;
  }

  // ── Step 5: Dynamic Procedural Synthesizer for Unknown / Novel Tables ──────
  // Guarantees that any table name gets an authentic, context-rich schema
  return synthesizeProceduralSchema(info);
}

export function inferFakerFromColumnName(columnName: string): (() => any) | null {
  const matched = matchColumnToken(columnName);
  if (matched?.fakerGenerator) {
    return matched.fakerGenerator;
  }
  return null;
}
