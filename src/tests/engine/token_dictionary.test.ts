/**
 * token_dictionary.test.ts — Unit Verification Suite for Impenetrable Tokenizer
 *
 * Verifies zero substring collisions across tricky column names (country, discount, manager, stage, etc.)
 */

import { describe, it, expect } from 'vitest';
import { matchColumnToken } from '../../engine/token_dictionary';
import { inferSchema } from '../../engine/inference';

describe('Impenetrable Tokenizer & Substring Collision Prevention', () => {
  it('correctly types country as VARCHAR and never matches count (INTEGER)', () => {
    const res = matchColumnToken('country');
    expect(res).not.toBeNull();
    expect(res?.logicalType).toBe('VARCHAR');

    const res2 = matchColumnToken('country_code');
    expect(res2?.logicalType).toBe('VARCHAR');
  });

  it('correctly types discount as NUMERIC and never matches count (INTEGER)', () => {
    const res = matchColumnToken('discount');
    expect(res).not.toBeNull();
    expect(res?.logicalType).toBe('NUMERIC');

    const res2 = matchColumnToken('discount_rate');
    expect(res2?.logicalType).toBe('NUMERIC');
  });

  it('correctly types stage as VARCHAR and never matches age (INTEGER)', () => {
    const res = matchColumnToken('stage');
    expect(res).not.toBeNull();
    expect(res?.logicalType).toBe('VARCHAR');

    const res2 = matchColumnToken('deal_stage');
    expect(res2?.logicalType).toBe('VARCHAR');
  });

  it('correctly types manager as VARCHAR and never matches age (INTEGER)', () => {
    const res = matchColumnToken('manager');
    expect(res).not.toBeNull();
    expect(res?.logicalType).toBe('VARCHAR');

    const res2 = matchColumnToken('manager_name');
    expect(res2?.logicalType).toBe('VARCHAR');
  });

  it('correctly types message as VARCHAR and never matches age (INTEGER)', () => {
    const res = matchColumnToken('message');
    expect(res).not.toBeNull();
    expect(res?.logicalType).toBe('VARCHAR');
  });

  it('correctly types total_pages as INTEGER and never matches total (NUMERIC)', () => {
    const res = matchColumnToken('total_pages');
    expect(res).not.toBeNull();
    expect(res?.logicalType).toBe('INTEGER');

    const res2 = matchColumnToken('total');
    expect(res2?.logicalType).toBe('NUMERIC');
  });

  it('extracts WHERE comparison literals for literal-aware dynamic seeding', () => {
    const schemaMap = inferSchema("SELECT * FROM employees WHERE country = 'india';", 'MySQL');
    const schema = schemaMap.get('employees');
    expect(schema).toBeDefined();
    const countryCol = schema!.columns.find(c => c.name === 'country');
    expect(countryCol?.logicalType).toBe('VARCHAR');
    expect(countryCol?.predicateLiterals).toContain('india');
  });
});
