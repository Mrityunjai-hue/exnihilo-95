import { describe, it, expect } from 'vitest';
import { parseSemanticQuery } from '../../engine/semantic_query_parser';

describe('semantic_query_parser — Natural Language Intent & SQL Synthesizer', () => {
  it('correctly parses superlative queries (e.g. planet with largest mass)', () => {
    const res = parseSemanticQuery('Show me planet with largest mass');
    expect(res.tableName).toBe('planets');
    expect(res.sql).toBe('SELECT * FROM "planets" ORDER BY mass DESC LIMIT 1;');
  });

  it('correctly parses superlative with smallest/lowest metric', () => {
    const res = parseSemanticQuery('Find planet with smallest diameter');
    expect(res.tableName).toBe('planets');
    expect(res.sql).toBe('SELECT * FROM "planets" ORDER BY diameter ASC LIMIT 1;');
  });

  it('correctly parses simple entity request (e.g. Show me planets)', () => {
    const res = parseSemanticQuery('Show me planets');
    expect(res.tableName).toBe('planets');
    expect(res.sql).toBe('SELECT * FROM "planets" LIMIT 20;');
  });

  it('correctly extracts limit count (e.g. top 5 customers)', () => {
    const res = parseSemanticQuery('Give me top 5 customers');
    expect(res.tableName).toBe('customers');
    expect(res.sql).toBe('SELECT * FROM "customers" LIMIT 5;');
  });

  it('correctly handles cardiac / heart queries', () => {
    const res = parseSemanticQuery('Show patients with highest heart_rate');
    expect(res.tableName).toBe('heart');
    expect(res.sql).toBe('SELECT * FROM "heart" ORDER BY heart_rate DESC LIMIT 1;');
  });

  it('handles explicit table creation requests', () => {
    const res = parseSemanticQuery('table for cyber_incidents');
    expect(res.isTableCreation).toBe(true);
    expect(res.tableName).toBe('cyber_incidents');
    expect(res.sql).toContain('CREATE TABLE IF NOT EXISTS "cyber_incidents"');
  });
});
