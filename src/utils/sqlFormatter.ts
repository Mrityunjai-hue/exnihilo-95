/**
 * sqlFormatter.ts — Robust, Non-Destructive SQL Beautifier & Formatter
 *
 * Guarantees:
 * 1. String literal protection: Single quotes ('...'), double quotes ("..."), and backticks (`` `...` ``)
 *    are masked with tokens during formatting so their contents and casing are never modified.
 * 2. Comment protection: Line comments (-- and //) and block comments (/* ... * /) are preserved 100% intact.
 * 3. Clause structuring: Major clauses (SELECT, FROM, WHERE, GROUP BY, HAVING, ORDER BY, LIMIT, etc.)
 *    start cleanly on new lines.
 * 4. Join indentation: JOIN clauses (INNER, LEFT, RIGHT, FULL, CROSS) are placed on new lines and indented.
 * 5. Case normalization: SQL keywords are converted to clean UPPERCASE outside literals.
 * 6. Idempotence: Repeated formatting calls produce the exact same clean output without expanding lines.
 */

export function formatSql(sql: string): string {
  if (!sql || !sql.trim()) return sql;

  const tokens: string[] = [];

  // 1. Mask literals, comments, and bracketed identifiers
  // Tokenize in order of precedence: block comments, line comments, single-quoted strings, double-quoted strings, backticks, brackets
  const tokenRegex = /(\/\*[\s\S]*?\*\/|--[^\r\n]*|\/\/[^\r\n]*|'(?:[^'\\]|\\.|'')*'|"(?:[^"\\]|\\.|"")*"|`[^`]*`|\[[^\]]*\])/g;

  let masked = sql.replace(tokenRegex, (match) => {
    const placeholder = `___SQL_TOK_${tokens.length}___`;
    tokens.push(match);
    return placeholder;
  });

  // 2. Normalize whitespace (collapse multiple tabs/spaces into single space, keep existing intentional newlines manageable)
  masked = masked.replace(/[ \t]+/g, ' ');

  // 3. Uppercase SQL keywords and compound clauses
  // Compound keywords listed first to avoid partial matching
  const compoundKeywords = [
    'UNION ALL', 'LEFT OUTER JOIN', 'RIGHT OUTER JOIN', 'FULL OUTER JOIN',
    'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'FULL JOIN', 'CROSS JOIN',
    'NATURAL JOIN', 'INSERT INTO', 'DELETE FROM', 'CREATE TABLE', 'DROP TABLE',
    'ALTER TABLE', 'GROUP BY', 'ORDER BY', 'IS NOT NULL', 'IS NULL',
    'SELECT DISTINCT', 'CREATE INDEX', 'DROP INDEX', 'CREATE VIEW', 'DROP VIEW',
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
    'DISTINCT', 'ALL', 'TOP', 'FETCH', 'NEXT', 'ROWS', 'ONLY', 'OVER', 'PARTITION BY'
  ];

  for (const kw of standardKeywords) {
    const rx = new RegExp(`\\b${kw}\\b`, 'gi');
    masked = masked.replace(rx, kw);
  }

  // 4. Clean spacing around commas and operators outside tokens
  masked = masked.replace(/\s*,\s*/g, ', ');
  masked = masked.replace(/\s*;\s*$/g, ';');

  // 5. Place major top-level clauses on their own line
  const majorClauses = [
    'FROM', 'WHERE', 'GROUP BY', 'HAVING', 'ORDER BY', 'LIMIT', 'OFFSET',
    'UNION ALL', 'UNION', 'INTERSECT', 'EXCEPT', 'VALUES', 'SET',
    'QUALIFY', 'RETURNING'
  ];

  for (const clause of majorClauses) {
    // Break line before major clause if preceded by whitespace or non-newline
    const rx = new RegExp(`(?:\\s+|\\n)\\b(${clause.replace(/\s+/g, '\\s+')})\\b\\s*`, 'g');
    masked = masked.replace(rx, `\n$1 `);
  }

  // 6. Indent JOIN clauses by 2 spaces (single unified regex prevents partial matching of 'JOIN' inside 'INNER JOIN')
  const joinRegex = /(?:\s+|\n)\b((?:(?:LEFT|RIGHT|FULL)\s+OUTER\s+JOIN|(?:LEFT|RIGHT|INNER|FULL|CROSS|NATURAL)\s+JOIN|JOIN))\b\s*/gi;
  masked = masked.replace(joinRegex, (_, j) => `\n  ${j.toUpperCase().replace(/\s+/g, ' ')} `);

  // 7. Semicolons between multi-statement scripts
  masked = masked.replace(/;\s*(?!\s*$)/g, ';\n\n');

  // 8. Trim trailing whitespace on lines and multiple blank lines
  const lines = masked.split('\n').map((l) => l.trimEnd());
  const cleanedLines: string[] = [];
  let blankCount = 0;

  for (const line of lines) {
    if (!line.trim()) {
      blankCount++;
      if (blankCount <= 1) cleanedLines.push('');
    } else {
      blankCount = 0;
      cleanedLines.push(line);
    }
  }

  masked = cleanedLines.join('\n');

  // 9. Restore masked tokens
  const restored = masked.replace(/___SQL_TOK_(\d+)___/g, (_, idx) => {
    return tokens[parseInt(idx, 10)] ?? '';
  });

  return restored.trim();
}
