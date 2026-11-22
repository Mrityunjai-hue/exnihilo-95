/**
 * challenges.ts — Lightweight Compatibility Barrel for Challenge Metadata & Shards
 */

export * from './challenges/types';
export * from './challenges/index';

import {
  CHALLENGE_INDEX,
  loadChallengeById,
  getFilteredChallengeMetadata,
  ChallengeMetadata,
} from './challenges/index';

// Backwards-compatible alias for metadata filtering
export const getFilteredChallenges = getFilteredChallengeMetadata;
