/**
 * ml_schema_predictor.ts — Lightweight Subword Vector Embedding & Semantic Schema Predictor
 *
 * Employs character 3-gram and 4-gram sparse embeddings with cosine similarity
 * across pre-computed cluster centroids to generalize unseen table names to their
 * most probable domain taxonomy without external dependencies.
 */

import { EXPANDED_DOMAIN_CATALOG, DomainColumnSpec } from './domain_catalog_data';

export interface MLPredictionResult {
  domainKey: string;
  confidence: number;
  columns: DomainColumnSpec[];
}

// Extract character n-grams (3-grams and 4-grams) from an input string
function vectorizeSubwords(text: string): Map<string, number> {
  const clean = `_${text.toLowerCase().trim()}_`;
  const vec = new Map<string, number>();

  for (let n of [3, 4]) {
    for (let i = 0; i <= clean.length - n; i++) {
      const gram = clean.substring(i, i + n);
      vec.set(gram, (vec.get(gram) || 0) + 1);
    }
  }

  // Normalize L2 vector norm
  let sumSq = 0;
  for (const val of vec.values()) {
    sumSq += val * val;
  }
  const norm = Math.sqrt(sumSq) || 1;
  for (const [gram, val] of vec.entries()) {
    vec.set(gram, val / norm);
  }

  return vec;
}

// Compute cosine similarity between two normalized sparse vectors
function cosineSimilarity(vecA: Map<string, number>, vecB: Map<string, number>): number {
  let dot = 0;
  for (const [gram, valA] of vecA.entries()) {
    const valB = vecB.get(gram);
    if (valB !== undefined) {
      dot += valA * valB;
    }
  }
  return dot;
}

// Pre-computed cluster centroids for each catalog domain
const DOMAIN_CENTROIDS: Array<{ key: string; vector: Map<string, number> }> = Object.entries(EXPANDED_DOMAIN_CATALOG).map(([key, spec]) => {
  const allAliases = [key, ...spec.aliases].join(' ');
  return {
    key,
    vector: vectorizeSubwords(allAliases),
  };
});

export function predictDomainWithML(tableName: string, threshold = 0.48): MLPredictionResult | null {
  const inputVec = vectorizeSubwords(tableName);

  let bestMatch: { key: string; score: number } | null = null;

  for (const centroid of DOMAIN_CENTROIDS) {
    const score = cosineSimilarity(inputVec, centroid.vector);
    if (!bestMatch || score > bestMatch.score) {
      bestMatch = { key: centroid.key, score };
    }
  }

  if (bestMatch && bestMatch.score >= threshold) {
    const spec = EXPANDED_DOMAIN_CATALOG[bestMatch.key];
    if (spec) {
      return {
        domainKey: bestMatch.key,
        confidence: parseFloat(bestMatch.score.toFixed(3)),
        columns: spec.columns,
      };
    }
  }

  return null;
}
