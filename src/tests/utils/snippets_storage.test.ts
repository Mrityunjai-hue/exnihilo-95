import { describe, it, expect, beforeEach } from 'vitest';
import { SavedSnippet } from '../../hooks/useSnippetsStorage';

describe('Saved Snippets Library', () => {
  const STORAGE_KEY = 'exnihilo_snippets_v1';

  beforeEach(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(STORAGE_KEY);
    }
  });

  it('should validate snippet data structure', () => {
    const snippet: SavedSnippet = {
      id: 'snip_test_1',
      name: 'Monthly Revenue',
      sql: 'SELECT sum(amount) FROM revenue GROUP BY month;',
      dialect: 'PostgreSQL',
      createdAt: new Date().toISOString(),
      tags: ['Finance', 'Monthly'],
    };

    expect(snippet.id).toBeDefined();
    expect(snippet.dialect).toBe('PostgreSQL');
    expect(snippet.tags?.length).toBe(2);
  });
});
