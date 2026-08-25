/**
 * functions.test.ts — Dialect-Specific SQL Functions Comprehensive Vitest Suite
 *
 * Tests parsing, AST routing, pure function evaluators, and end-to-end SQLExecutor
 * query execution across MySQL, PostgreSQL, SQLite, and MSSQL (TransactSQL).
 *
 * Covers 5 Categories:
 *  1. Null Handling: COALESCE(), NULLIF()
 *  2. String Concatenation: CONCAT(), ||, +
 *  3. Substring Operations: SUBSTRING(), SUBSTR()
 *  4. Date Formatting: DATE_FORMAT(), TO_CHAR(), strftime(), FORMAT()
 *  5. JSON Extraction: JSON_EXTRACT(), -> / ->>, JSON_VALUE(), JSON_QUERY()
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { parse, extractFunctionNames } from '../../engine/parser';
import {
  SQLExecutor,
  evalCoalesce,
  evalNullif,
  evalConcat,
  evalSubstring,
  evalDateFormat,
  evalToChar,
  evalStrftime,
  evalFormatMssql,
  evalJsonExtract,
  evalJsonValue,
  evalJsonQuery,
  evalPgJsonExtract,
} from '../../engine/executor';

describe('Dialect-Specific SQL Functions — Pure Evaluators & Edge Cases', () => {
  // ── Category 1: Null Handling Evaluators ──────────────────────────────────
  describe('Category 1: Null Handling (COALESCE, NULLIF)', () => {
    it('evalCoalesce: returns first non-null argument', () => {
      expect(evalCoalesce(null, undefined, 'first', 'second')).toBe('first');
      expect(evalCoalesce(null, 42, 'fallback')).toBe(42);
      expect(evalCoalesce(0, 'fallback')).toBe(0); // 0 is non-null
      expect(evalCoalesce(false, true)).toBe(false); // false is non-null
      expect(evalCoalesce('', 'fallback')).toBe(''); // empty string is non-null
      expect(evalCoalesce(null, null, null, null, 'last_resort')).toBe('last_resort');
    });

    it('evalCoalesce: returns null when all arguments are null/undefined', () => {
      expect(evalCoalesce(null, null, undefined)).toBeNull();
    });

    it('evalNullif: returns null when arguments are equal', () => {
      expect(evalNullif('abc', 'abc')).toBeNull();
      expect(evalNullif(100, 100)).toBeNull();
      expect(evalNullif('100', 100)).toBeNull(); // loose equality
      expect(evalNullif(3.14, 3.14)).toBeNull();
    });

    it('evalNullif: returns first argument when arguments differ', () => {
      expect(evalNullif('abc', 'xyz')).toBe('abc');
      expect(evalNullif(100, 200)).toBe(100);
      expect(evalNullif(true, false)).toBe(true);
    });

    it('evalNullif: handles null edge cases gracefully', () => {
      expect(evalNullif(null, 'abc')).toBeNull();
      expect(evalNullif('abc', null)).toBe('abc');
    });
  });

  // ── Category 2: String Concatenation Evaluators ───────────────────────────
  describe('Category 2: String Concatenation (CONCAT, ||, +)', () => {
    it('evalConcat: concatenates strings and numeric values', () => {
      expect(evalConcat('Hello', ' ', 'World')).toBe('Hello World');
      expect(evalConcat('Item_', 101, '_v', 2)).toBe('Item_101_v2');
      expect(evalConcat('Count: ', 0)).toBe('Count: 0');
      expect(evalConcat('A', 'B', 'C', 'D', 'E')).toBe('ABCDE');
    });

    it('evalConcat: returns null if any argument is null/undefined (MySQL spec)', () => {
      expect(evalConcat('Hello', null, 'World')).toBeNull();
      expect(evalConcat(undefined, 'Test')).toBeNull();
    });
  });

  // ── Category 3: Substring Evaluators ──────────────────────────────────────
  describe('Category 3: Substring Operations (SUBSTRING, SUBSTR)', () => {
    it('evalSubstring: 1-based indexing substring extraction', () => {
      expect(evalSubstring('ExNihilo', 1, 2)).toBe('Ex');
      expect(evalSubstring('ExNihilo', 3, 6)).toBe('Nihilo');
      expect(evalSubstring('ExNihilo', 3)).toBe('Nihilo'); // no length specified
    });

    it('evalSubstring: handles negative start offsets, zero length, and out-of-bounds', () => {
      expect(evalSubstring('Database', 10, 2)).toBe('');
      expect(evalSubstring('Database', 1, 0)).toBe('');
      expect(evalSubstring('Database', 1, -5)).toBe('');
      expect(evalSubstring('Database', 2, 100)).toBe('atabase'); // length > remaining
      expect(evalSubstring('Database', -4)).toBe('base'); // negative start offset
      expect(evalSubstring('Hello', -2, 2)).toBe('lo');
    });

    it('evalSubstring: returns null on null input', () => {
      expect(evalSubstring(null, 1, 2)).toBeNull();
      expect(evalSubstring('Test', null, 2)).toBeNull();
    });
  });

  // ── Category 4: Date Formatting Evaluators ────────────────────────────────
  describe('Category 4: Date Formatting (DATE_FORMAT, TO_CHAR, strftime, FORMAT)', () => {
    const testDate = '2026-08-25T14:30:15Z';

    it('evalDateFormat (MySQL): formats dates with specifiers', () => {
      expect(evalDateFormat(testDate, '%Y-%m-%d')).toBe('2026-08-25');
      expect(evalDateFormat(testDate, '%W, %M %d, %Y')).toBe('Tuesday, August 25, 2026');
      expect(evalDateFormat(testDate, '%H:%i:%s')).toBe('14:30:15');
    });

    it('evalToChar (PostgreSQL): formats dates with YYYY-MM-DD', () => {
      expect(evalToChar(testDate, 'YYYY-MM-DD')).toBe('2026-08-25');
      expect(evalToChar(testDate, 'YYYY/MM/DD HH24:MI:SS')).toBe('2026/08/25 14:30:15');
    });

    it('evalStrftime (SQLite): formats dates with %Y-%m-%d', () => {
      expect(evalStrftime('%Y-%m-%d', testDate)).toBe('2026-08-25');
      expect(evalStrftime('%H:%i:%s', testDate)).toBe('14:30:15');
    });

    it('evalFormatMssql (MSSQL): formats dates with yyyy-MM-dd', () => {
      expect(evalFormatMssql(testDate, 'yyyy-MM-dd')).toBe('2026-08-25');
      expect(evalFormatMssql(testDate, 'yyyy/MM/dd HH:mm:ss')).toBe('2026/08/25 14:30:15');
    });

    it('Date formatters handle null/invalid inputs', () => {
      expect(evalDateFormat(null, '%Y-%m-%d')).toBeNull();
      expect(evalToChar('not-a-date', 'YYYY-MM-DD')).toBe('not-a-date');
    });
  });

  // ── Category 5: JSON Extraction Evaluators ────────────────────────────────
  describe('Category 5: JSON Extraction (JSON_EXTRACT, ->, ->>, JSON_VALUE, JSON_QUERY)', () => {
    const sampleJson = JSON.stringify({
      user: { name: 'Alice', age: 30, tags: ['admin', 'dev'], profile: { bio: 'coder' } },
      status: 'active',
      count: 5
    });

    it('evalJsonExtract (MySQL/SQLite): extracts scalar & object values', () => {
      expect(evalJsonExtract(sampleJson, '$.user.name')).toBe('Alice');
      expect(evalJsonExtract(sampleJson, '$.user.age')).toBe(30);
      expect(evalJsonExtract(sampleJson, '$.user.tags[0]')).toBe('admin');
      expect(evalJsonExtract(sampleJson, '$.user.tags[1]')).toBe('dev');
      expect(evalJsonExtract(sampleJson, '$.user.profile.bio')).toBe('coder');
      expect(evalJsonExtract(sampleJson, '$.status')).toBe('active');
    });

    it('evalJsonValue (MSSQL): extracts scalar text values only', () => {
      expect(evalJsonValue(sampleJson, '$.user.name')).toBe('Alice');
      expect(evalJsonValue(sampleJson, '$.count')).toBe('5');
      expect(evalJsonValue(sampleJson, '$.user')).toBeNull(); // returns null for objects
      expect(evalJsonValue(sampleJson, '$.user.tags')).toBeNull(); // returns null for arrays
    });

    it('evalJsonQuery (MSSQL): extracts JSON objects/arrays as strings', () => {
      const userObj = evalJsonQuery(sampleJson, '$.user');
      expect(userObj).toBe('{"name":"Alice","age":30,"tags":["admin","dev"],"profile":{"bio":"coder"}}');
      const tagsArray = evalJsonQuery(sampleJson, '$.user.tags');
      expect(tagsArray).toBe('["admin","dev"]');
      expect(evalJsonQuery(sampleJson, '$.user.name')).toBeNull(); // returns null for scalars
    });

    it('evalPgJsonExtract (PostgreSQL): extracts keys with -> and ->>', () => {
      // -> returns JSON element
      expect(evalPgJsonExtract(sampleJson, 'user', false)).toBe('{"name":"Alice","age":30,"tags":["admin","dev"],"profile":{"bio":"coder"}}');
      // ->> returns text
      expect(evalPgJsonExtract(sampleJson, 'status', true)).toBe('active');
    });

    it('JSON extractors handle malformed JSON and missing paths safely without eval()', () => {
      expect(evalJsonExtract('invalid-json', '$.name')).toBeNull();
      expect(evalJsonExtract(sampleJson, '$.nonexistent.path')).toBeNull();
      expect(evalJsonExtract(null, '$.name')).toBeNull();
    });
  });
});

// ── End-to-End Execution & Dialect AST Routing Tests ─────────────────────────

describe('Dialect-Specific SQL Functions — End-to-End Query Execution', () => {
  let executor: SQLExecutor;

  beforeAll(async () => {
    executor = new SQLExecutor();
    await executor.init();
  });

  afterAll(() => {
    executor.reset();
  });

  // ── MySQL Dialect Tests ───────────────────────────────────────────────────
  describe('MySQL Dialect Function Execution', () => {
    it('MySQL: COALESCE, NULLIF, CONCAT, SUBSTRING, DATE_FORMAT, JSON_EXTRACT', async () => {
      const sql = `
        SELECT 
          COALESCE(NULL, 'MySQL_Default') AS c1,
          NULLIF('same', 'same') AS c2,
          CONCAT('My', 'SQL', '_V8') AS c3,
          SUBSTRING('Database', 1, 4) AS c4,
          DATE_FORMAT('2026-08-25', '%Y-%m-%d') AS c5,
          JSON_EXTRACT('{"version": 8}', '$.version') AS c6;
      `;
      const astResult = parse(sql, 'MySQL');
      expect(astResult.ok).toBe(true);

      const res = await executor.execute(sql, 'MySQL');
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.rows[0][0]).toBe('MySQL_Default');
        expect(res.rows[0][1]).toBeNull();
        expect(res.rows[0][2]).toBe('MySQL_V8');
        expect(res.rows[0][3]).toBe('Data');
        expect(res.rows[0][4]).toBe('2026-08-25');
        expect(res.rows[0][5]).toBe(8);
      }
    });
  });

  // ── PostgreSQL Dialect Tests ──────────────────────────────────────────────
  describe('PostgreSQL Dialect Function Execution', () => {
    it('PostgreSQL: COALESCE, NULLIF, ||, SUBSTRING, TO_CHAR, ->, ->>', async () => {
      const sql = `
        SELECT 
          COALESCE(NULL, 'PG_Default') AS c1,
          NULLIF('a', 'b') AS c2,
          'Postgre' || 'SQL' AS c3,
          SUBSTRING('Elephant', 1, 4) AS c4,
          TO_CHAR('2026-08-25', 'YYYY-MM-DD') AS c5;
      `;
      const astResult = parse(sql, 'PostgreSQL');
      expect(astResult.ok).toBe(true);

      const res = await executor.execute(sql, 'PostgreSQL');
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.rows[0][0]).toBe('PG_Default');
        expect(res.rows[0][1]).toBe('a');
        expect(res.rows[0][2]).toBe('PostgreSQL');
        expect(res.rows[0][3]).toBe('Elep');
        expect(res.rows[0][4]).toBe('2026-08-25');
      }
    });

    it('PostgreSQL: JSON operators -> and ->>', async () => {
      await executor.execute("CREATE TABLE pg_demo (id INT, data TEXT);", 'PostgreSQL');
      await executor.execute(`INSERT INTO pg_demo VALUES (1, '{"role": "admin", "details": {"name": "Bob"}}');`, 'PostgreSQL');

      const jsonQuery = "SELECT data->'details' AS json_obj, data->>'role' AS role_text FROM pg_demo;";
      const res = await executor.execute(jsonQuery, 'PostgreSQL');
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.rows[0][0]).toBe('{"name":"Bob"}');
        expect(res.rows[0][1]).toBe('admin');
      }
    });
  });

  // ── SQLite Dialect Tests ──────────────────────────────────────────────────
  describe('SQLite Dialect Function Execution', () => {
    it('SQLite: COALESCE, NULLIF, ||, SUBSTR, strftime, JSON_EXTRACT', async () => {
      const sql = `
        SELECT 
          COALESCE(NULL, 'SQLite_Default') AS c1,
          NULLIF(123, 123) AS c2,
          'Lite' || 'DB' AS c3,
          SUBSTR('SQLite', 1, 4) AS c4,
          strftime('%Y-%m-%d', '2026-08-25') AS c5,
          JSON_EXTRACT('{"status": "ok"}', '$.status') AS c6;
      `;
      const astResult = parse(sql, 'SQLite');
      expect(astResult.ok).toBe(true);

      const res = await executor.execute(sql, 'SQLite');
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.rows[0][0]).toBe('SQLite_Default');
        expect(res.rows[0][1]).toBeNull();
        expect(res.rows[0][2]).toBe('LiteDB');
        expect(res.rows[0][3]).toBe('SQLi');
        expect(res.rows[0][4]).toBe('2026-08-25');
        expect(res.rows[0][5]).toBe('ok');
      }
    });
  });

  // ── TransactSQL / MSSQL Dialect Tests ────────────────────────────────────
  describe('TransactSQL / MSSQL Dialect Function Execution', () => {
    it('MSSQL: COALESCE, NULLIF, CONCAT, SUBSTRING, FORMAT, JSON_VALUE, JSON_QUERY', async () => {
      const sql = `
        SELECT 
          COALESCE(NULL, 'MSSQL_Default') AS c1,
          NULLIF('xyz', 'abc') AS c2,
          CONCAT('MS', 'SQL') AS c3,
          SUBSTRING('Transact', 1, 5) AS c4,
          FORMAT('2026-08-25', 'yyyy-MM-dd') AS c5,
          JSON_VALUE('{"server": "sql2026"}', '$.server') AS c6,
          JSON_QUERY('{"config": {"max_conn": 100}}', '$.config') AS c7;
      `;
      const astResult = parse(sql, 'TransactSQL');
      if (astResult.ok) {
        const funcs = extractFunctionNames(astResult.ast);
        expect(funcs).toContain('COALESCE');
        expect(funcs).toContain('FORMAT');
        expect(funcs).toContain('JSON_VALUE');
      }


      const res = await executor.execute(sql, 'TransactSQL');
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.rows[0][0]).toBe('MSSQL_Default');
        expect(res.rows[0][1]).toBe('xyz');
        expect(res.rows[0][2]).toBe('MSSQL');
        expect(res.rows[0][3]).toBe('Trans');
        expect(res.rows[0][4]).toBe('2026-08-25');
        expect(res.rows[0][5]).toBe('sql2026');
        expect(res.rows[0][6]).toBe('{"max_conn":100}');
      }
    });
  });
});
