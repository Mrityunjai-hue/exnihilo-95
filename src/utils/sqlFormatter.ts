/**
 * sqlFormatter.ts — High-Fidelity Professional SQL Beautifier & Formatter
 *
 * Designed to produce elegant, clean, readable SQL formatting matching industry tools
 * (Prettier SQL, DataGrip, pgAdmin):
 *
 * 1. String & Comment Immunity: Single/double quotes, backticks, brackets, line comments,
 *    and block comments are 100% protected and never modified.
 * 2. Visual Clause Hierarchy: Top-level clauses (SELECT, FROM, WHERE, GROUP BY, HAVING,
 *    ORDER BY, LIMIT, OFFSET, QUALIFY, SET, VALUES) start on dedicated lines.
 * 3. Structured Column Lists: Multi-column SELECT lists (> 2 items or long) are neatly
 *    indented one item per line, with commas at the end of each line.
 * 4. Condition Stacking: Logical filters (AND, OR) in WHERE, HAVING, and multi-condition
 *    JOIN ON clauses are placed on new lines and indented for effortless scanning.
 * 5. Nested Indentation: Subqueries (SELECT inside parentheses) and CTEs (WITH ... AS (...))
 *    are indented by +1 level with their closing parentheses cleanly positioned.
 * 6. DDL & DML Structuring: Table columns in CREATE TABLE are aligned one per line.
 * 7. Case Consistency: Keywords, data types, and constraint definitions are standardized to UPPERCASE.
 * 8. Idempotence: Repeatedly running format produces the exact same clean output.
 */

export function formatSql(sql: string): string {
  if (!sql || !sql.trim()) return sql;

  // 1. Mask literals and comments
  const tokens: string[] = [];
  const tokenRegex = /(\/\*[\s\S]*?\*\/|--[^\r\n]*|\/\/[^\r\n]*|'(?:[^'\\]|\\.|'')*'|"(?:[^"\\]|\\.|"")*"|`[^`]*`|\[[^\]]*\])/g;

  let masked = sql.replace(tokenRegex, (match) => {
    const placeholder = `___SQL_TOK_${tokens.length}___`;
    tokens.push(match);
    return placeholder;
  });

  // Normalize basic whitespace
  masked = masked.replace(/[ \t]+/g, ' ').trim();

  // 2. Standardize compound and single SQL keywords to uppercase
  const compoundKeywords = [
    'SELECT DISTINCT', 'UNION ALL', 'LEFT OUTER JOIN', 'RIGHT OUTER JOIN', 'FULL OUTER JOIN',
    'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'FULL JOIN', 'CROSS JOIN', 'NATURAL JOIN',
    'GROUP BY', 'ORDER BY', 'INSERT INTO', 'DELETE FROM', 'CREATE TABLE', 'DROP TABLE',
    'ALTER TABLE', 'CREATE INDEX', 'DROP INDEX', 'CREATE VIEW', 'DROP VIEW',
    'PRIMARY KEY', 'FOREIGN KEY', 'NOT NULL', 'IS NOT NULL', 'IS NULL',
    'EXECUTE IMMEDIATE', 'BACKUP DATABASE', 'OPTIMIZE TABLE', 'VACUUM FULL'
  ];

  for (const compound of compoundKeywords) {
    const rx = new RegExp(`\\b${compound.replace(/\s+/g, '\\s+')}\\b`, 'gi');
    masked = masked.replace(rx, compound);
  }

  const standardKeywords = [
    'SELECT', 'FROM', 'WHERE', 'JOIN', 'ON', 'USING', 'HAVING', 'WITH', 'RECURSIVE',
    'AS', 'LIMIT', 'OFFSET', 'UNION', 'INTERSECT', 'EXCEPT', 'AND', 'OR', 'NOT',
    'VALUES', 'UPDATE', 'SET', 'ASC', 'DESC', 'COUNT', 'SUM', 'AVG', 'MIN', 'MAX',
    'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'IN', 'EXISTS', 'BETWEEN', 'LIKE', 'ILIKE',
    'QUALIFY', 'ROWNUM', 'PIVOT', 'UNPIVOT', 'DECLARE', 'PRINT', 'EXEC', 'sp_executesql',
    'GRANT', 'REVOKE', 'CREATE', 'DROP', 'ALTER', 'TABLE', 'VIEW', 'INDEX', 'RETURNING',
    'COALESCE', 'NULLIF', 'IFNULL', 'ISNULL', 'NVL', 'NVL2', 'DECODE', 'GREATEST', 'LEAST',
    'DISTINCT', 'ALL', 'TOP', 'FETCH', 'NEXT', 'ROWS', 'ONLY', 'OVER', 'PARTITION BY',
    'INT', 'INTEGER', 'BIGINT', 'SMALLINT', 'VARCHAR', 'CHAR', 'TEXT', 'DECIMAL', 'NUMERIC',
    'FLOAT', 'REAL', 'DOUBLE', 'BOOLEAN', 'DATE', 'TIME', 'TIMESTAMP', 'DATETIME', 'BLOB', 'JSON',
    'DEFAULT', 'UNIQUE', 'CHECK', 'REFERENCES', 'AUTOINCREMENT'
  ];

  for (const kw of standardKeywords) {
    const rx = new RegExp(`\\b${kw}\\b`, 'gi');
    masked = masked.replace(rx, kw);
  }

  // 3. Tokenize SQL into lexical units
  const tokenList: string[] = [];
  const lexer = /(___SQL_TOK_\d+___|\b(?:SELECT DISTINCT|UNION ALL|LEFT OUTER JOIN|RIGHT OUTER JOIN|FULL OUTER JOIN|LEFT JOIN|RIGHT JOIN|INNER JOIN|FULL JOIN|CROSS JOIN|NATURAL JOIN|GROUP BY|ORDER BY|INSERT INTO|DELETE FROM|CREATE TABLE|DROP TABLE|ALTER TABLE|CREATE INDEX|DROP INDEX|CREATE VIEW|DROP VIEW|PRIMARY KEY|FOREIGN KEY|NOT NULL|IS NOT NULL|IS NULL|EXECUTE IMMEDIATE|BACKUP DATABASE|OPTIMIZE TABLE)\b|\b\w+\b|[(),;.]|<=|>=|<>|!=|:=|[=<>+\-*/%])/gi;

  let match: RegExpExecArray | null;
  while ((match = lexer.exec(masked)) !== null) {
    tokenList.push(match[0]);
  }

  if (tokenList.length === 0) return sql;

  // 4. Stateful Indentation & Layout Engine
  const lines: string[] = [];
  let curLine = '';
  let indentLevel = 0;

  const pushLine = () => {
    if (curLine.trim()) {
      lines.push(curLine.trimEnd());
      curLine = '';
    }
  };

  const startNewLine = (extraIndent = 0) => {
    pushLine();
    curLine = '  '.repeat(Math.max(0, indentLevel + extraIndent));
  };

  let inSelect = false;
  let multiLineSelect = false;
  let inWhere = false;
  let inSet = false;
  let inCase = false;
  let inValues = false;
  let parenDepth = 0;
  const parenContext: ('subquery' | 'values' | 'columns' | 'normal')[] = [];

  for (let i = 0; i < tokenList.length; i++) {
    const tok = tokenList[i];
    const prevTok = i > 0 ? tokenList[i - 1] : '';
    const nextTok = i < tokenList.length - 1 ? tokenList[i + 1] : '';
    const upper = tok.toUpperCase();

    // Top-level Clauses
    if (['SELECT', 'SELECT DISTINCT'].includes(upper)) {
      if (parenDepth === 0 && lines.length > 0 && !lines[lines.length - 1].endsWith(';')) {
        pushLine();
      }
      startNewLine();
      curLine += tok;
      inSelect = true;
      inWhere = false;
      inSet = false;

      // Determine whether column list should format across multiple indented lines
      let commaCount = 0;
      let charsCount = 0;
      let depthCheck = parenDepth;
      for (let j = i + 1; j < tokenList.length; j++) {
        const t = tokenList[j];
        if (t === '(') depthCheck++;
        else if (t === ')') depthCheck--;
        else if (depthCheck === parenDepth) {
          if (['FROM', 'WHERE', 'ORDER BY', 'GROUP BY', 'LIMIT', 'UNION', ';'].includes(t.toUpperCase())) {
            break;
          }
          if (t === ',') commaCount++;
          charsCount += t.length + 1;
        }
      }

      if (commaCount >= 2 || charsCount > 45) {
        multiLineSelect = true;
        startNewLine(1);
      } else {
        curLine += ' ';
        multiLineSelect = false;
      }
      continue;
    }

    if (['FROM', 'WHERE', 'GROUP BY', 'HAVING', 'ORDER BY', 'LIMIT', 'OFFSET', 'QUALIFY', 'RETURNING'].includes(upper)) {
      startNewLine();
      curLine += tok + ' ';
      inSelect = false;
      multiLineSelect = false;
      inSet = false;
      inWhere = upper === 'WHERE' || upper === 'HAVING';
      continue;
    }

    if (upper === 'SET') {
      startNewLine();
      curLine += tok + ' ';
      inSelect = false;
      multiLineSelect = false;
      inSet = true;
      inWhere = false;
      continue;
    }

    if (['UNION', 'UNION ALL', 'INTERSECT', 'EXCEPT'].includes(upper)) {
      pushLine();
      lines.push('');
      startNewLine();
      curLine += tok;
      startNewLine();
      inSelect = false;
      multiLineSelect = false;
      inWhere = false;
      inSet = false;
      continue;
    }

    if (upper === 'VALUES') {
      startNewLine();
      curLine += tok;
      startNewLine(1);
      inValues = true;
      inSelect = false;
      inWhere = false;
      inSet = false;
      continue;
    }

    // Joins (indented +1 from FROM)
    if (upper.includes('JOIN')) {
      startNewLine(1);
      curLine += tok + ' ';
      inSelect = false;
      multiLineSelect = false;
      inWhere = false;
      inSet = false;
      continue;
    }

    // Condition operators (AND / OR in WHERE, HAVING, or ON)
    if ((inWhere || upper === 'ON') && (upper === 'AND' || upper === 'OR') && parenDepth === 0) {
      startNewLine(1);
      curLine += tok + ' ';
      continue;
    }

    // Parentheses & Subquery / DDL Columns / Multi-row Values
    if (tok === '(') {
      parenDepth++;
      const isSubquery = ['SELECT', 'SELECT DISTINCT', 'WITH'].includes(nextTok.toUpperCase());
      const isTableColumns = /CREATE\s+TABLE/i.test(curLine) || /CREATE\s+TABLE/i.test(lines[lines.length - 1] || '');

      if (isSubquery) {
        parenContext.push('subquery');
        curLine = curLine.trimEnd() + ' (';
        indentLevel++;
        startNewLine();
        continue;
      } else if (isTableColumns && parenDepth === 1) {
        parenContext.push('columns');
        curLine = curLine.trimEnd() + ' (';
        indentLevel++;
        startNewLine();
        continue;
      } else if (inValues && parenDepth === 1) {
        parenContext.push('values');
        curLine += '(';
        continue;
      } else {
        parenContext.push('normal');
        curLine += '(';
        continue;
      }
    }

    if (tok === ')') {
      parenDepth--;
      const ctx = parenContext.pop();
      if (ctx === 'subquery' || ctx === 'columns') {
        indentLevel = Math.max(0, indentLevel - 1);
        startNewLine();
        curLine += ')';
        if (nextTok && ![';', ',', ')'].includes(nextTok)) {
          curLine += ' ';
        }
        continue;
      } else {
        curLine += ')';
        if (nextTok && ![';', ',', ')'].includes(nextTok)) {
          curLine += ' ';
        }
        continue;
      }
    }

    // Commas
    if (tok === ',') {
      curLine = curLine.trimEnd() + ',';
      const lastCtx = parenContext[parenContext.length - 1];
      if (lastCtx === 'columns') {
        startNewLine();
      } else if (inSelect && parenDepth === 0 && multiLineSelect) {
        startNewLine(1);
      } else if (inSet && parenDepth === 0) {
        startNewLine(1);
      } else if (inValues && parenDepth === 0) {
        startNewLine(1);
      } else {
        curLine += ' ';
      }
      continue;
    }

    // Semicolons
    if (tok === ';') {
      curLine = curLine.trimEnd() + ';';
      pushLine();
      if (nextTok && nextTok !== ';') {
        lines.push(''); // Clean breathing room between statements
      }
      inSelect = false;
      inWhere = false;
      inSet = false;
      inValues = false;
      continue;
    }

    // Standard token spacing (avoid spaces around dots for table.column)
    if (tok === '.' || curLine.endsWith('.')) {
      curLine = curLine.trimEnd() + tok;
    } else if (curLine.endsWith(' ') || curLine.endsWith('(') || curLine === '') {
      curLine += tok;
    } else {
      curLine += ' ' + tok;
    }
  }

  pushLine();

  let formatted = lines.join('\n');

  // 5. Restore protected tokens
  formatted = formatted.replace(/___SQL_TOK_(\d+)___/g, (_, idx) => {
    return tokens[parseInt(idx, 10)] ?? '';
  });

  return formatted.trim();
}
