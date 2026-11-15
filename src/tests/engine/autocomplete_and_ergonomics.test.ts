/**
 * autocomplete_and_ergonomics.test.ts — Pillar 1 IDE Ergonomics Test Suite
 *
 * Verifies CodeMirror 6 Retro IntelliSense completion sources,
 * drag-and-drop table/column matching, and dialect translation.
 */

import { describe, it, expect } from 'vitest';
import { STATIC_SQL_COMPLETIONS, createSqlCompletionSource } from '../../components/IDE/sqlAutocomplete';
import { transpileDialectSugar, hasDialectSugar } from '../../engine/transpiler';

describe('Pillar 1: Retro IntelliSense Autocomplete Engine', () => {
  it('contains comprehensive SQL keywords and multi-dialect functions', () => {
    const labels = STATIC_SQL_COMPLETIONS.map((c) => c.label);

    // Standard DQL / DML
    expect(labels).toContain('SELECT');
    expect(labels).toContain('WHERE');
    expect(labels).toContain('GROUP BY');
    expect(labels).toContain('ORDER BY');

    // Advanced Dialect Sugar
    expect(labels).toContain('QUALIFY');
    expect(labels).toContain('ROWNUM');
    expect(labels).toContain('PIVOT');

    // Procedural & Dynamic SQL
    expect(labels).toContain('DECLARE');
    expect(labels).toContain('SET');
    expect(labels).toContain('PRINT');
    expect(labels).toContain('EXEC sp_executesql');

    // Admin & Security
    expect(labels).toContain('GRANT');
    expect(labels).toContain('REVOKE');
    expect(labels).toContain('CREATE USER');
    expect(labels).toContain('BACKUP DATABASE');

    // Multi-Dialect Functions
    expect(labels).toContain('REGEXP_LIKE');
    expect(labels).toContain('ST_Point');
    expect(labels).toContain('ST_Distance');
    expect(labels).toContain('NVL2');
    expect(labels).toContain('DECODE');
    expect(labels).toContain('GREATEST');
    expect(labels).toContain('LEAST');
  });

  it('generates schema-aware completions for active tables and columns', () => {
    const mockSchema = {
      users: ['id', 'username', 'email'],
      orders: ['id', 'user_id', 'total_amount'],
    };

    const completionSource = createSqlCompletionSource(mockSchema);

    // Mock completion context at word 'us'
    const mockContext: any = {
      matchBefore: () => ({ from: 0, to: 2, text: 'us' }),
      explicit: false,
    };

    const res = completionSource(mockContext);
    expect(res).not.toBeNull();
    if (res) {
      const labels = res.options.map((o) => o.label);
      expect(labels).toContain('users');
      expect(labels).toContain('users.username');
      expect(labels).toContain('username');
      expect(labels).toContain('total_amount');
    }
  });
});

describe('Pillar 1: Dialect Translation & Sugar Detection', () => {
  it('detects and transpiles dialect sugar correctly', () => {
    const oracleSql = 'SELECT * FROM clients WHERE ROWNUM <= 5;';
    expect(hasDialectSugar(oracleSql)).toBe(true);
    const converted = transpileDialectSugar(oracleSql);
    expect(converted).toContain('LIMIT 5');
    expect(converted).not.toContain('ROWNUM');
  });

  it('transpiles Snowflake QUALIFY clause into CTE stage', () => {
    const bqSql = 'SELECT user_id, rank() OVER (ORDER BY score DESC) as rk FROM leaderboard QUALIFY rk <= 10;';
    expect(hasDialectSugar(bqSql)).toBe(true);
    const converted = transpileDialectSugar(bqSql);
    expect(converted).toContain('_qualify_stage');
    expect(converted).toContain('WHERE rk <= 10');
  });
});
