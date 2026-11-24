import { describe, it, expect, beforeEach } from 'vitest';
import { SQLExecutor, transpileDialectForSqlite } from '../../engine/executor';
import { parseSemanticQuery } from '../../engine/semantic_query_parser';

describe('Generic Multi-Dialect Transpiler & Dynamic Table Context', () => {
  let executor: SQLExecutor;

  beforeEach(() => {
    executor = new SQLExecutor();
  });

  it('transpiles T-SQL bracketed identifiers and SELECT TOP to SQLite LIMIT', () => {
    const tsql = 'SELECT TOP 1 [name] FROM [celestial_objects] ORDER BY [distance_light_years] DESC;';
    const transpiled = transpileDialectForSqlite(tsql);
    expect(transpiled).toContain('SELECT "name" FROM "celestial_objects" ORDER BY "distance_light_years" DESC LIMIT 1;');
  });

  it('transpiles SELECT DISTINCT TOP (5) with brackets correctly', () => {
    const tsql = 'SELECT DISTINCT TOP (5) [id], [sensor_type] FROM [iot_devices];';
    const transpiled = transpileDialectForSqlite(tsql);
    expect(transpiled).toBe('SELECT DISTINCT [id], [sensor_type] FROM [iot_devices] LIMIT 5;'.replace(/\[([a-zA-Z0-9_.]+)\]/g, '"$1"'));
  });

  it('transpiles Oracle ROWNUM clause to SQLite LIMIT', () => {
    const oracleSql = 'SELECT * FROM employees WHERE ROWNUM <= 10;';
    const transpiled = transpileDialectForSqlite(oracleSql);
    expect(transpiled).toBe('SELECT * FROM employees LIMIT 10;');
  });

  it('executes T-SQL query on unseeded arbitrary table with zero syntax errors', async () => {
    await executor.init();
    const query = 'SELECT TOP 1 [name] FROM [celestial_objects] ORDER BY [distance_light_years] DESC;';
    const result = await executor.execute(query, 'SSMS');

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.rowCount).toBe(1);
      expect(result.columns).toContain('name');
      expect(result.rows.length).toBe(1);
    }
  });

  it('executes T-SQL query on arbitrary novel domain table (e.g. quantum_processors)', async () => {
    await executor.init();
    const query = 'SELECT TOP 3 [processor_id], [qubit_count] FROM [quantum_processors] ORDER BY [qubit_count] DESC;';
    const result = await executor.execute(query, 'SSMS');

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.rowCount).toBe(3);
      expect(result.rows.length).toBe(3);
    }
  });

  it('repairs failed T-SQL queries via parseSemanticQuery without hallucinating "fix"', () => {
    const errorPrompt = 'Fix this SQL query error:\n[ERROR]: near "1": syntax error\n[FAILED_QUERY]: SELECT TOP 1 [name] FROM [celestial_objects] ORDER BY [distance_light_years] DESC;';
    const parsed = parseSemanticQuery(errorPrompt);

    expect(parsed.tableName).toBe('celestial_objects');
    expect(parsed.tableName).not.toBe('fix');
    expect(parsed.sql).toContain('LIMIT 1;');
    expect(parsed.sql).toContain('celestial_objects');
  });

  it('never extracts "fix" as an entity name when given conversational error prompts', () => {
    const prompt = 'Fix the syntax error in celestial objects table';
    const parsed = parseSemanticQuery(prompt);

    expect(parsed.tableName).not.toBe('fix');
    expect(parsed.tableName).not.toBe('error');
    expect(parsed.tableName).not.toBe('syntax');
  });
});
