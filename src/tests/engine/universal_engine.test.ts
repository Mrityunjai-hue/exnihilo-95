/**
 * universal_engine.test.ts — Universal SQL Engine Test Suite
 *
 * Verifies Phase 1 native multi-dialect functions, spatial primitives,
 * analytical clause transpilation, procedural scripting, dynamic SQL,
 * and admin command simulation.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  SQLExecutor,
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
} from '../../engine/executor';

describe('Universal Engine — Phase 1: Pure Evaluators', () => {
  describe('Regular Expressions', () => {
    it('evalRegexp: matches case-insensitive patterns', () => {
      expect(evalRegexp('^abc', 'ABCDEF')).toBe(1);
      expect(evalRegexp('\\d+', 'Order 42')).toBe(1);
      expect(evalRegexp('^xyz', 'ABCDEF')).toBe(0);
      expect(evalRegexp(null, 'test')).toBe(0);
      expect(evalRegexp('test', null)).toBe(0);
    });

    it('evalRegexpLike: matches with optional flags', () => {
      expect(evalRegexpLike('Hello World', '^hello', 'i')).toBe(1);
      expect(evalRegexpLike('Hello World', '^hello', 'c')).toBe(0); // case sensitive
      expect(evalRegexpLike(null, '^hello')).toBe(0);
    });

    it('evalRegexpSubstr: extracts matching substring', () => {
      expect(evalRegexpSubstr('Contact: user@test.com today', '[\\w.]+@[\\w.]+')).toBe('user@test.com');
      expect(evalRegexpSubstr('No digits here', '\\d+')).toBeNull();
      expect(evalRegexpSubstr(null, '\\d+')).toBeNull();
    });

    it('evalRegexpReplace: replaces pattern with replacement', () => {
      expect(evalRegexpReplace('Foo 123 Bar 456', '\\d+', '###')).toBe('Foo ### Bar ###');
      expect(evalRegexpReplace('Hello World', 'world', 'Universe', 'i')).toBe('Hello Universe');
      expect(evalRegexpReplace(null, 'test')).toBeNull();
    });
  });

  describe('GIS & Spatial Primitives', () => {
    it('evalStPoint: constructs GeoJSON Point', () => {
      expect(evalStPoint(10.5, 20.8)).toBe(JSON.stringify({ type: 'Point', coordinates: [10.5, 20.8] }));
      expect(evalStPoint(null, 10)).toBeNull();
      expect(evalStPoint('abc', 10)).toBeNull();
    });

    it('evalStX & evalStY: extracts coordinates', () => {
      const pt = JSON.stringify({ type: 'Point', coordinates: [15, 35] });
      expect(evalStX(pt)).toBe(15);
      expect(evalStY(pt)).toBe(35);
      expect(evalStX('POINT(100 200)')).toBe(100);
      expect(evalStY('POINT(100 200)')).toBe(200);
      expect(evalStX('45, 90')).toBe(45);
      expect(evalStY('45, 90')).toBe(90);
      expect(evalStX(null)).toBeNull();
    });

    it('evalStDistance: computes Euclidean distance', () => {
      const p1 = JSON.stringify({ type: 'Point', coordinates: [0, 0] });
      const p2 = JSON.stringify({ type: 'Point', coordinates: [3, 4] });
      expect(evalStDistance(p1, p2)).toBe(5);
      expect(evalStDistance('0,0', '6,8')).toBe(10);
      expect(evalStDistance(null, p2)).toBeNull();
    });

    it('evalStContains: performs 2D ray casting point-in-polygon', () => {
      const squarePoly = JSON.stringify({
        type: 'Polygon',
        coordinates: [
          [[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]]
        ]
      });
      const insidePt = JSON.stringify({ type: 'Point', coordinates: [5, 5] });
      const outsidePt = JSON.stringify({ type: 'Point', coordinates: [15, 15] });

      expect(evalStContains(squarePoly, insidePt)).toBe(1);
      expect(evalStContains(squarePoly, outsidePt)).toBe(0);
      expect(evalStContains(squarePoly, null)).toBe(0);
      expect(evalStContains(null, insidePt)).toBe(0);
    });
  });

  describe('Multi-Dialect Helpers', () => {
    it('evalNvl2: conditional null checking', () => {
      expect(evalNvl2('value', 'NOT_NULL', 'IS_NULL')).toBe('NOT_NULL');
      expect(evalNvl2(null, 'NOT_NULL', 'IS_NULL')).toBe('IS_NULL');
      expect(evalNvl2(undefined, 'NOT_NULL', 'IS_NULL')).toBe('IS_NULL');
    });

    it('evalDecode: Oracle value matching', () => {
      expect(evalDecode('B', 'A', 'First', 'B', 'Second', 'Default')).toBe('Second');
      expect(evalDecode('Z', 'A', 'First', 'B', 'Second', 'Default')).toBe('Default');
      expect(evalDecode('Z', 'A', 'First', 'B', 'Second')).toBeNull();
    });

    it('evalGreatest & evalLeast: multi-arg scalar min/max', () => {
      expect(evalGreatest(10, 50, 25)).toBe(50);
      expect(evalLeast(10, 50, 25)).toBe(10);
      expect(evalGreatest('alpha', 'gamma', 'beta')).toBe('gamma');
      expect(evalLeast('alpha', 'gamma', 'beta')).toBe('alpha');
      // SQL standard: NULL argument yields NULL
      expect(evalGreatest(10, null, 25)).toBeNull();
      expect(evalLeast(10, null, 25)).toBeNull();
    });

    it('evalGetDate: returns valid ISO datetime string', () => {
      const d = evalGetDate();
      expect(d).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
    });
  });
});

describe('Universal Engine — Phase 1: In-WASM Query Execution', () => {
  let executor: SQLExecutor;

  beforeEach(() => {
    executor = new SQLExecutor();
  });

  it('executes REGEXP and REGEXP_SUBSTR inside SQL query', async () => {
    const sql = `
      SELECT 
        REGEXP_SUBSTR('Invoice #INV-9842 verified', 'INV-\\d+') AS invoice_code,
        NVL2('active', 'USER_ACTIVE', 'USER_INACTIVE') AS user_status,
        DECODE(2, 1, 'Gold', 2, 'Silver', 'Bronze') AS tier,
        GREATEST(10, 85, 42) AS max_val,
        LEAST(10, 85, 42) AS min_val;
    `;
    const res = await executor.execute(sql, 'PostgreSQL');
    if (!res.ok) console.log('ERROR:', res.message, res.errorType);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.rows[0][0]).toBe('INV-9842');
      expect(res.rows[0][1]).toBe('USER_ACTIVE');
      expect(res.rows[0][2]).toBe('Silver');
      expect(res.rows[0][3]).toBe(85);
      expect(res.rows[0][4]).toBe(10);
    }
  });

  it('executes GIS Spatial functions inside SQL query', async () => {
    const sql = `
      SELECT 
        ST_X(ST_Point(12.5, 45.2)) AS pt_x,
        ST_Y(ST_Point(12.5, 45.2)) AS pt_y,
        ROUND(ST_Distance(ST_Point(0, 0), ST_Point(3, 4)), 1) AS dist;
    `;
    const res = await executor.execute(sql, 'PostgreSQL');
    if (!res.ok) console.log('ERROR:', res.message, res.errorType);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.rows[0][0]).toBe(12.5);
      expect(res.rows[0][1]).toBe(45.2);
      expect(res.rows[0][2]).toBe(5);
    }
  });
});

describe('Universal Engine — Phase 2: Dialect Transpiler (QUALIFY, ROWNUM, PIVOT)', () => {
  let executor: SQLExecutor;

  beforeEach(() => {
    executor = new SQLExecutor();
  });

  it('transpiles and executes Oracle ROWNUM <= N as LIMIT', async () => {
    // Materialize a temporary table
    await executor.execute(`
      CREATE TABLE test_scores (id INT, score INT);
      INSERT INTO test_scores VALUES (1, 100), (2, 90), (3, 80), (4, 70);
    `, 'SQLite');

    const oracleSql = 'SELECT * FROM test_scores WHERE ROWNUM <= 2;';
    const res = await executor.execute(oracleSql, 'SQLite');
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.rows.length).toBe(2);
    }
  });

  it('transpiles and executes Snowflake/BigQuery QUALIFY clause via CTE', async () => {
    await executor.execute(`
      CREATE TABLE emp_salaries (dept TEXT, emp TEXT, salary INT);
      INSERT INTO emp_salaries VALUES 
        ('ENG', 'Alice', 120),
        ('ENG', 'Bob', 110),
        ('ENG', 'Charlie', 90),
        ('SALES', 'Dave', 95);
    `, 'SQLite');

    const qualifySql = `
      SELECT dept, emp, salary,
             ROW_NUMBER() OVER (PARTITION BY dept ORDER BY salary DESC) as rn
      FROM emp_salaries
      QUALIFY rn <= 2;
    `;
    const res = await executor.execute(qualifySql, 'SQLite');
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.rows.length).toBe(3); // 2 from ENG, 1 from SALES
      expect(res.columns).toContain('rn');
    }
  });

  it('transpiles and executes PIVOT into conditional aggregation', async () => {
    await executor.execute(`
      CREATE TABLE raw_sales (product TEXT, quarter TEXT, amount INT);
      INSERT INTO raw_sales VALUES
        ('Widget', 'Q1', 100),
        ('Widget', 'Q2', 150),
        ('Gadget', 'Q1', 200),
        ('Gadget', 'Q2', 250);
    `, 'SQLite');

    const pivotSql = `
      SELECT * FROM raw_sales
      PIVOT (
        SUM(amount) FOR quarter IN ('Q1', 'Q2')
      ) AS pvt;
    `;
    const res = await executor.execute(pivotSql, 'SQLite');
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.columns).toContain('Q1');
      expect(res.columns).toContain('Q2');
      expect(res.rows.length).toBeGreaterThan(0);
    }
  });
});

describe('Universal Engine — Phase 3 & 4: Procedural Scripting & Dynamic SQL', () => {
  let executor: SQLExecutor;

  beforeEach(() => {
    executor = new SQLExecutor();
  });

  it('executes DECLARE, SET, and parameter substitution', async () => {
    await executor.execute(`
      CREATE TABLE inventory (sku TEXT, stock INT);
      INSERT INTO inventory VALUES ('A10', 50), ('B20', 10), ('C30', 5);
    `, 'SQLite');

    const script = `
      DECLARE @threshold INT = 15;
      SELECT * FROM inventory WHERE stock < @threshold;
    `;
    const res = await executor.execute(script, 'TransactSQL');
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.rows.length).toBe(2); // B20 and C30
    }
  });

  it('executes IF/ELSE branching and PRINT streaming', async () => {
    await executor.execute(`
      CREATE TABLE orders_count (total INT);
      INSERT INTO orders_count VALUES (150);
    `, 'SQLite');

    const script = `
      DECLARE @cnt INT;
      SET @cnt = (SELECT total FROM orders_count);
      IF @cnt > 100
      BEGIN
        PRINT 'High volume detected';
        SELECT 'High' AS alert_level, @cnt AS order_count;
      END
      ELSE
      BEGIN
        PRINT 'Normal volume';
        SELECT 'Normal' AS alert_level, @cnt AS order_count;
      END
    `;
    const res = await executor.execute(script, 'TransactSQL');
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.rows[0][0]).toBe('High');
      expect(res.rows[0][1]).toBe(150);
      expect(res.message).toContain('High volume detected');
    }
  });

  it('executes dynamic SQL via sp_executesql and EXECUTE IMMEDIATE', async () => {
    await executor.execute(`
      CREATE TABLE metric_log (name TEXT, val INT);
      INSERT INTO metric_log VALUES ('CPU', 78), ('RAM', 65);
    `, 'SQLite');

    const dynamicSql = `
      DECLARE @query TEXT = 'SELECT * FROM metric_log WHERE val > 70';
      EXEC sp_executesql @query;
    `;
    const res = await executor.execute(dynamicSql, 'TransactSQL');
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.rows.length).toBe(1);
      expect(res.rows[0][0]).toBe('CPU');
    }
  });
});

describe('Universal Engine — Phase 5: Administration & Security Sandbox', () => {
  let executor: SQLExecutor;

  beforeEach(() => {
    executor = new SQLExecutor();
  });

  it('simulates GRANT and REVOKE commands', async () => {
    const grantSql = "GRANT SELECT, INSERT ON customers TO data_analyst;";
    const grantRes = await executor.execute(grantSql, 'PostgreSQL');
    expect(grantRes.ok).toBe(true);
    if (grantRes.ok) {
      expect(grantRes.columns).toContain('ACTION');
      expect(grantRes.rows[0][0]).toBe('GRANT');
      expect(grantRes.rows[0][1]).toBe('data_analyst');
    }

    const revokeSql = "REVOKE INSERT ON customers FROM data_analyst;";
    const revokeRes = await executor.execute(revokeSql, 'PostgreSQL');
    expect(revokeRes.ok).toBe(true);
    if (revokeRes.ok) {
      expect(revokeRes.rows[0][0]).toBe('REVOKE');
    }
  });

  it('simulates CREATE USER and BACKUP DATABASE', async () => {
    const userSql = "CREATE USER 'db_auditor' IDENTIFIED BY 'Vault95!';";
    const userRes = await executor.execute(userSql, 'MySQL');
    expect(userRes.ok).toBe(true);
    if (userRes.ok) {
      expect(userRes.rows[0][1]).toBe('db_auditor');
    }

    const backupSql = "BACKUP DATABASE master TO DISK = 'C:\\backups\\master.bak';";
    const backupRes = await executor.execute(backupSql, 'TransactSQL');
    expect(backupRes.ok).toBe(true);
    if (backupRes.ok) {
      expect(backupRes.columns).toContain('DATABASE');
      expect(backupRes.rows[0][1]).toBe('master');
      expect(backupRes.rows[0][4]).toBe('COMPLETED');
    }
  });
});
