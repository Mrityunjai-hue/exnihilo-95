/**
 * marvel_roster.test.ts — Unit Tests for 55+ Mini Marvel Characters Roster & Shuffle Queue Engine
 */

import { describe, it, expect } from 'vitest';
import { MARVEL_ROSTER, getNextMarvelHero } from '../../utils/marvelRoster';

describe('55+ Mini Marvel Characters Roster & Shuffle Engine', () => {
  it('contains at least 55 unique Marvel characters in the roster', () => {
    expect(MARVEL_ROSTER.length).toBeGreaterThanOrEqual(55);

    // Verify all character IDs are unique
    const ids = MARVEL_ROSTER.map((c) => c.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(MARVEL_ROSTER.length);
  });

  it('defines valid quotes, emojis, and badge colors for every character', () => {
    MARVEL_ROSTER.forEach((hero) => {
      expect(hero.id).toBeDefined();
      expect(hero.name.length).toBeGreaterThan(0);
      expect(hero.emoji).toBeDefined();
      expect(hero.victoryQuote.length).toBeGreaterThan(0);
      expect(hero.teaserQuote.length).toBeGreaterThan(0);
      expect(hero.badgeColor).toMatch(/^#[0-9a-fA-F]{6}$/);
    });
  });

  it('rotates through all 55 characters without repeating in a single full pass', () => {
    const victoryHistory: string[] = [];

    // Fetch 55 victory heroes sequentially
    for (let i = 0; i < MARVEL_ROSTER.length; i++) {
      const hero = getNextMarvelHero('victory');
      victoryHistory.push(hero.id);
    }

    // Verify all 55 heroes were drawn without duplicate repetition in the first pass
    const setHistory = new Set(victoryHistory);
    expect(setHistory.size).toBe(MARVEL_ROSTER.length);
  });

  it('rotates through all 55 teaser characters without repeating in a single pass', () => {
    const teaserHistory: string[] = [];

    // Fetch 55 teaser heroes sequentially
    for (let i = 0; i < MARVEL_ROSTER.length; i++) {
      const hero = getNextMarvelHero('teaser');
      teaserHistory.push(hero.id);
    }

    // Verify all 55 teaser heroes were drawn without duplicate repetition
    const setHistory = new Set(teaserHistory);
    expect(setHistory.size).toBe(MARVEL_ROSTER.length);
  });
});
