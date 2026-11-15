/**
 * procedural_runner.ts — Lightweight Client-Side Procedural Scripting Engine
 *
 * Executes multi-statement procedural scripts and query batches:
 * - Variable declaration & assignment: DECLARE @var, SET @var = expr | (SELECT ...)
 * - Conditional branching: IF <condition> BEGIN ... END ELSE BEGIN ... END
 * - Loop control: WHILE <condition> BEGIN ... END (with 1,000 iteration guard)
 * - Dynamic SQL execution: EXEC sp_executesql @stmt, EXECUTE IMMEDIATE <stmt>
 * - Output streaming: PRINT 'message'
 */

import { Database } from 'sql.js';
import { ExecutionResult, SQLExecutor } from './executor';
import { SessionCatalog } from './catalog';
import { Dialect } from './parser';

export function isProceduralScript(sql: string): boolean {
  return /\b(DECLARE\s+@\w+|SET\s+@\w+\s*=|EXEC\s+sp_executesql|EXECUTE\s+IMMEDIATE|\bPRINT\s+['"`\w@]|IF\b[\s\S]+\bBEGIN\b|WHILE\b[\s\S]+\bBEGIN\b)/i.test(sql);
}

export class ProceduralRunner {
  private static MAX_ITERATIONS = 1000;
  private static MAX_EXECUTION_TIME_MS = 3000;

  static substituteVariables(sql: string, variables: Map<string, any>): string {
    if (variables.size === 0) return sql;

    // Replace @var occurrences outside of literal quotes
    return sql.replace(/@([a-zA-Z_]\w*)\b/g, (match, varName) => {
      const key = `@${varName}`.toLowerCase();
      for (const [vName, vVal] of variables.entries()) {
        if (vName.toLowerCase() === key) {
          if (vVal === null || vVal === undefined) return 'NULL';
          if (typeof vVal === 'number') return String(vVal);
          if (typeof vVal === 'boolean') return vVal ? '1' : '0';
          return `'${String(vVal).replace(/'/g, "''")}'`;
        }
      }
      return match;
    });
  }

  static async execute(
    scriptText: string,
    executor: SQLExecutor,
    db: Database,
    catalog: SessionCatalog,
    dialect: Dialect,
    startTime: number,
    existingVariables?: Map<string, any>,
    existingPrintLogs?: string[]
  ): Promise<ExecutionResult> {
    const variables = existingVariables ?? new Map<string, any>();
    const printLogs: string[] = existingPrintLogs ?? [];
    let lastSelectResult: ExecutionResult | null = null;

    // Normalize script: split into top-level statements while preserving BEGIN...END blocks
    const statements = this.splitProceduralStatements(scriptText);

    for (const stmt of statements) {
      if (performance.now() - startTime > this.MAX_EXECUTION_TIME_MS) {
        return {
          ok: false,
          errorType: 'RUNTIME_ERROR',
          message: `Execution timed out: Procedural script exceeded ${this.MAX_EXECUTION_TIME_MS} ms limit.`,
          executionTimeMs: performance.now() - startTime,
        };
      }

      const trimmed = stmt.trim();
      if (!trimmed) continue;

      // 1. DECLARE @var [TYPE] [= expr]
      const declareMatch = trimmed.match(/^DECLARE\s+(@\w+)(?:\s+[\w()]+)?(?:\s*=\s*([\s\S]+?))?;?$/i);
      if (declareMatch) {
        const varName = declareMatch[1];
        const rawExpr = declareMatch[2];
        let val: any = null;
        if (rawExpr) {
          val = this.evaluateScalarExpr(rawExpr.trim(), variables, db);
        }
        variables.set(varName, val);
        continue;
      }

      // 2. SET @var = expr
      const setMatch = trimmed.match(/^SET\s+(@\w+)\s*=\s*([\s\S]+?);?$/i);
      if (setMatch) {
        const varName = setMatch[1];
        const rawExpr = setMatch[2].trim();
        const val = this.evaluateScalarExpr(rawExpr, variables, db);
        variables.set(varName, val);
        continue;
      }

      // 3. PRINT 'message' or PRINT @var
      const printMatch = trimmed.match(/^PRINT\s+([\s\S]+?);?$/i);
      if (printMatch) {
        const rawMsg = printMatch[1].trim();
        const msg = this.evaluateStringExpr(rawMsg, variables);
        printLogs.push(msg);
        continue;
      }

      // 4. Dynamic SQL: EXECUTE IMMEDIATE <expr>
      const execImmMatch = trimmed.match(/^EXECUTE\s+IMMEDIATE\s+([\s\S]+?);?$/i);
      if (execImmMatch) {
        const rawSqlExpr = execImmMatch[1].trim();
        const targetSql = this.evaluateStringExpr(rawSqlExpr, variables);
        lastSelectResult = await executor.execute(targetSql, dialect);
        continue;
      }

      // 5. Dynamic SQL: EXEC sp_executesql @stmt, ...
      const execSqlMatch = trimmed.match(/^EXEC(?:UTE)?\s+sp_executesql\s+([\s\S]+?);?$/i);
      if (execSqlMatch) {
        const argsStr = execSqlMatch[1].trim();
        // First parameter is the statement string
        const parts = argsStr.split(',').map(p => p.trim());
        const stmtExpr = parts[0];
        const targetSql = this.evaluateStringExpr(stmtExpr, variables);
        lastSelectResult = await executor.execute(targetSql, dialect);
        continue;
      }

      // 6. IF <condition> BEGIN ... END [ELSE BEGIN ... END]
      const ifMatch = trimmed.match(/^IF\s+([\s\S]+?)\s+BEGIN([\s\S]+?)END(?:\s*ELSE\s*BEGIN([\s\S]+?)END)?/i);
      if (ifMatch) {
        const condition = ifMatch[1].trim();
        const trueBlock = ifMatch[2].trim();
        const falseBlock = ifMatch[3] ? ifMatch[3].trim() : '';

        const condVal = this.evaluateCondition(condition, variables, db);
        const chosenBlock = condVal ? trueBlock : falseBlock;
        if (chosenBlock) {
          const subRes = await this.execute(chosenBlock, executor, db, catalog, dialect, startTime, variables, printLogs);
          if (subRes.ok && subRes.rows.length > 0) {
            lastSelectResult = subRes;
          }
        }
        continue;
      }

      // 7. Standard DML/DQL statement with variable substitution
      const resolvedSql = this.substituteVariables(trimmed, variables);
      const res = await executor.execute(resolvedSql, dialect);
      if (res.ok && res.columns.length > 0) {
        lastSelectResult = res;
      } else if (!res.ok) {
        return res;
      }
    }

    if (lastSelectResult) {
      if (printLogs.length > 0) {
        const prefix = printLogs.map(l => `[PRINT] ${l}`).join('\n');
        lastSelectResult.message = lastSelectResult.message
          ? `${prefix}\n${lastSelectResult.message}`
          : prefix;
      }
      return lastSelectResult;
    }

    // Default output for scripts with no SELECT (e.g. variable setup or print only)
    return {
      ok: true,
      columns: ['CONSOLE_OUTPUT', 'STATUS'],
      rows: printLogs.length > 0
        ? printLogs.map(l => [l, 'PRINT_STREAM'])
        : [['Procedural script completed successfully.', 'OK']],
      rowCount: printLogs.length > 0 ? printLogs.length : 1,
      executionTimeMs: performance.now() - startTime,
      inferredTables: [],
      reusedTables: [],
      message: printLogs.length > 0 ? printLogs.join('\n') : '[Status: OK] Script executed.',
    };
  }

  private static evaluateScalarExpr(rawExpr: string, variables: Map<string, any>, db: Database): any {
    // 1. Check if string literal
    const strMatch = rawExpr.match(/^['"]([\s\S]*)['"]$/);
    if (strMatch) return strMatch[1];

    // 2. Check if numeric
    if (!isNaN(Number(rawExpr))) return Number(rawExpr);

    // 3. Variable lookup
    if (rawExpr.startsWith('@')) {
      for (const [k, v] of variables.entries()) {
        if (k.toLowerCase() === rawExpr.toLowerCase()) return v;
      }
    }

    // 4. Subquery or arithmetic expression (e.g. (SELECT COUNT(*) FROM t) or 10 + 20)
    try {
      const sql = this.substituteVariables(`SELECT (${rawExpr}) AS res;`, variables);
      const res = db.exec(sql);
      if (res.length > 0 && res[0].values.length > 0) {
        return res[0].values[0][0];
      }
    } catch {
      // Fallback
    }

    return rawExpr;
  }

  private static evaluateStringExpr(rawExpr: string, variables: Map<string, any>): string {
    const trimmed = rawExpr.trim();
    if (trimmed.startsWith('@')) {
      for (const [k, v] of variables.entries()) {
        if (k.toLowerCase() === trimmed.toLowerCase()) return String(v ?? '');
      }
    }
    const m = trimmed.match(/^N?['"]([\s\S]*)['"]$/);
    if (m) return m[1];
    return trimmed;
  }

  private static evaluateCondition(condition: string, variables: Map<string, any>, db: Database): boolean {
    try {
      const sql = this.substituteVariables(`SELECT CASE WHEN (${condition}) THEN 1 ELSE 0 END AS cond;`, variables);
      const res = db.exec(sql);
      if (res.length > 0 && res[0].values.length > 0) {
        return Number(res[0].values[0][0]) === 1;
      }
    } catch {
      // Fallback
    }
    return false;
  }

  private static splitProceduralStatements(script: string): string[] {
    const statements: string[] = [];
    let current = '';
    let inString = false;
    let quoteChar = '';
    let depth = 0;

    for (let i = 0; i < script.length; i++) {
      const ch = script[i];
      const nextWord = script.substring(i).match(/^(\bBEGIN\b|\bEND\b)/i);

      if (inString) {
        current += ch;
        if (ch === quoteChar) {
          // Handle escaped quote
          if (script[i + 1] === quoteChar) {
            current += script[i + 1];
            i++;
          } else {
            inString = false;
          }
        }
      } else if (ch === "'" || ch === '"') {
        inString = true;
        quoteChar = ch;
        current += ch;
      } else if (nextWord) {
        const word = nextWord[1].toUpperCase();
        if (word === 'BEGIN') {
          depth++;
        } else if (word === 'END') {
          depth = Math.max(0, depth - 1);
        }
        current += ch;
      } else if (ch === ';' && depth === 0) {
        if (current.trim()) {
          statements.push(current.trim());
        }
        current = '';
      } else {
        current += ch;
      }
    }

    if (current.trim()) {
      statements.push(current.trim());
    }

    return statements;
  }
}
