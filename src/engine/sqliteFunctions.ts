/**
 * sqliteFunctions.ts — Shared Custom SQLite WASM Functions
 * Registers SQL dialect helper functions (CONCAT, DATE_FORMAT, REGEXP, GIS, etc.)
 * in any sql.js Database instance for both the main execution engine and challenge grader.
 */

import type { Database as SqlJsDatabase } from 'sql.js';
import {
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
  evalRegexp,
  evalRegexpLike,
  evalRegexpSubstr,
  evalRegexpReplace,
  evalStPoint,
  evalStX,
  evalStY,
  evalStDistance,
  evalStContains,
  evalNvl2,
  evalDecode,
  evalGreatest,
  evalLeast,
  evalGetDate,
  evalSysDate,
} from './executor';

export function registerCustomSqliteFunctions(db: SqlJsDatabase): void {
  const SQLITE_INTERNAL_BLACKLIST = new Set([
    'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'TOTAL', 'ABS', 'TYPEOF', 'LENGTH',
    'LOWER', 'UPPER', 'INSTR', 'TRIM', 'LTRIM', 'RTRIM', 'HEX', 'QUOTE',
    'RANDOM', 'ROUND', 'SOUNDEX', 'UNICODE', 'CHAR', 'ZEROBLOB', 'GLOB', 'LIKE'
  ]);

  const safeRegister = (name: string, fn: (...args: any[]) => any, arity?: number) => {
    if (SQLITE_INTERNAL_BLACKLIST.has(name.toUpperCase())) return;
    try {
      const wrapped = (...args: any[]) => fn(...args);
      const targetLength = arity !== undefined ? arity : -1;
      Object.defineProperty(wrapped, 'length', { value: targetLength });
      db.create_function(name, wrapped);
    } catch {
      // Safe fail-soft registration
    }
  };

  // Standard string and null functions
  safeRegister('COALESCE', evalCoalesce, -1);
  safeRegister('NULLIF', evalNullif, 2);
  safeRegister('CONCAT', evalConcat, -1);
  safeRegister('SUBSTRING', evalSubstring, -1);
  safeRegister('SUBSTR', evalSubstring, -1);
  safeRegister('DATE_FORMAT', evalDateFormat, 2);
  safeRegister('TO_CHAR', evalToChar, 2);
  safeRegister('strftime', evalStrftime, 2);
  safeRegister('FORMAT', evalFormatMssql, 2);
  safeRegister('JSON_EXTRACT', evalJsonExtract, 2);
  safeRegister('JSON_VALUE', evalJsonValue, 2);
  safeRegister('JSON_QUERY', evalJsonQuery, 2);
  safeRegister('PG_JSON_EXTRACT', (val: any, key: any) => evalPgJsonExtract(val, key, false), 2);
  safeRegister('PG_JSON_EXTRACT_TEXT', (val: any, key: any) => evalPgJsonExtract(val, key, true), 2);

  // Regex
  safeRegister('REGEXP', evalRegexp, 2);
  safeRegister('regexp', evalRegexp, 2);
  safeRegister('REGEXP_LIKE', evalRegexpLike, -1);
  safeRegister('regexp_like', evalRegexpLike, -1);
  safeRegister('REGEXP_SUBSTR', evalRegexpSubstr, -1);
  safeRegister('regexp_substr', evalRegexpSubstr, -1);
  safeRegister('REGEXP_REPLACE', evalRegexpReplace, -1);
  safeRegister('regexp_replace', evalRegexpReplace, -1);

  // GIS
  safeRegister('ST_Point', evalStPoint, 2);
  safeRegister('ST_POINT', evalStPoint, 2);
  safeRegister('st_point', evalStPoint, 2);
  safeRegister('ST_X', evalStX, 1);
  safeRegister('st_x', evalStX, 1);
  safeRegister('ST_Y', evalStY, 1);
  safeRegister('st_y', evalStY, 1);
  safeRegister('ST_Distance', evalStDistance, 2);
  safeRegister('ST_DISTANCE', evalStDistance, 2);
  safeRegister('st_distance', evalStDistance, 2);
  safeRegister('ST_Contains', evalStContains, 2);
  safeRegister('ST_CONTAINS', evalStContains, 2);
  safeRegister('st_contains', evalStContains, 2);

  // Oracle / MSSQL / PG helpers
  safeRegister('NVL2', evalNvl2, 3);
  safeRegister('nvl2', evalNvl2, 3);
  safeRegister('DECODE', evalDecode, -1);
  safeRegister('decode', evalDecode, -1);
  safeRegister('GREATEST', evalGreatest, -1);
  safeRegister('greatest', evalGreatest, -1);
  safeRegister('LEAST', evalLeast, -1);
  safeRegister('least', evalLeast, -1);
  safeRegister('GETDATE', evalGetDate, 0);
  safeRegister('getdate', evalGetDate, 0);
  safeRegister('SYSDATE', evalSysDate, 0);
  safeRegister('sysdate', evalSysDate, 0);
  safeRegister('NOW', () => new Date().toISOString(), 0);
  safeRegister('now', () => new Date().toISOString(), 0);
  safeRegister('IFNULL', (val: any, fallback: any) => (val !== null && val !== undefined ? val : fallback), 2);
  safeRegister('ifnull', (val: any, fallback: any) => (val !== null && val !== undefined ? val : fallback), 2);
  safeRegister('ISNULL', (val: any, fallback: any) => (val !== null && val !== undefined ? val : fallback), 2);
  safeRegister('isnull', (val: any, fallback: any) => (val !== null && val !== undefined ? val : fallback), 2);
  safeRegister('LEN', (s: any) => (s !== null && s !== undefined ? String(s).length : null), 1);
  safeRegister('len', (s: any) => (s !== null && s !== undefined ? String(s).length : null), 1);
}
