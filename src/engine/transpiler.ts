/**
 * transpiler.ts — Multi-Dialect AST & Grammar Transpiler
 *
 * Transpiles non-native SQL dialect sugar (Snowflake/BigQuery QUALIFY,
 * Oracle ROWNUM, and T-SQL/Oracle PIVOT) into standard ANSI SQL constructs
 * (CTEs, LIMIT, conditional CASE aggregations) that SQLite WASM executes natively.
 *
 * Non-negotiable: Pure, fast-path fall-through for standard queries;
 * zero allocation overhead if no dialect sugar is detected.
 */

export function hasDialectSugar(sql: string): boolean {
  return /\b(QUALIFY|ROWNUM|PIVOT|UNPIVOT)\b/i.test(sql);
}

/**
 * Transpiles Oracle `WHERE ROWNUM <= N` into SQLite standard `LIMIT N`.
 */
export function transpileRownum(sql: string): string {
  const rownumRegex = /(?:WHERE\s+)?(?:\bAND\s+)?\bROWNUM\s*(<=|<|=)\s*(\d+)(?:\s+AND\b)?/i;
  const match = sql.match(rownumRegex);
  if (!match) return sql;

  const op = match[1];
  const num = parseInt(match[2], 10);
  let limitVal = num;
  if (op === '<') limitVal = Math.max(0, num - 1);
  if (op === '=') limitVal = 1;

  let rewritten = sql.replace(match[0], (full) => {
    // If the matched string started with WHERE and had no AND afterwards, remove WHERE
    if (/^WHERE/i.test(full.trim()) && !/AND$/i.test(full.trim())) {
      return '';
    }
    // If it was chained with AND
    if (/AND$/i.test(full.trim())) {
      return /^WHERE/i.test(full.trim()) ? 'WHERE ' : '';
    }
    return '';
  });

  // Clean up any double spaces or dangling WHERE / semicolons
  rewritten = rewritten.replace(/\bWHERE\s*(ORDER\s+BY|GROUP\s+BY|LIMIT|;|$)/i, '$1').trim();
  const semi = rewritten.endsWith(';') ? ';' : '';
  const bare = semi ? rewritten.slice(0, -1).trim() : rewritten;

  // Append or reconcile LIMIT
  const existingLimit = bare.match(/\bLIMIT\s+(\d+)/i);
  if (existingLimit) {
    const cur = parseInt(existingLimit[1], 10);
    const minLimit = Math.min(cur, limitVal);
    return bare.replace(/\bLIMIT\s+\d+/i, `LIMIT ${minLimit}`) + semi;
  }

  return `${bare} LIMIT ${limitVal}${semi}`;
}

/**
 * Transpiles Snowflake / BigQuery `QUALIFY <condition>` into a CTE wrapper.
 */
export function transpileQualify(sql: string): string {
  // Extract query up to QUALIFY, the condition, and any trailing ORDER BY / LIMIT
  const qualifyRegex = /^([\s\S]+?)\s+QUALIFY\s+([\s\S]+?)(?:\s+(ORDER\s+BY[\s\S]+?|\bLIMIT\s+\d+[\s\S]*))?;?$/i;
  const match = sql.trim().match(qualifyRegex);
  if (!match) return sql;

  const baseQuery = match[1].trim();
  const qualifyCond = match[2].trim();
  const trailing = match[3] ? match[3].trim() : '';

  // If base query already starts with WITH, chain the CTE
  if (/^WITH\s+/i.test(baseQuery)) {
    // Replace the main SELECT of the CTE with _qualify_stage AS ( ... )
    const mainSelectMatch = baseQuery.match(/(?:^|\n)(SELECT[\s\S]+)$/i);
    if (mainSelectMatch) {
      const ctes = baseQuery.substring(0, baseQuery.length - mainSelectMatch[1].length).trim();
      const mainSelect = mainSelectMatch[1].trim();
      return `${ctes}, _qualify_stage AS (\n  ${mainSelect}\n)\nSELECT * FROM _qualify_stage WHERE ${qualifyCond}${trailing ? '\n' + trailing : ''};`;
    }
  }

  return `WITH _qualify_stage AS (\n  ${baseQuery}\n)\nSELECT * FROM _qualify_stage WHERE ${qualifyCond}${trailing ? '\n' + trailing : ''};`;
}

/**
 * Transpiles T-SQL / Oracle `PIVOT ( agg(val) FOR col IN (vals) )` into conditional CASE aggregation.
 */
export function transpilePivot(sql: string): string {
  const pivotRegex = /([\s\S]+?)\s+PIVOT\s*\(\s*(\w+)\s*\(\s*([\w.]+)\s*\)\s+FOR\s+([\w.]+)\s+IN\s*\(\s*([^\)]+)\s*\)\s*\)(?:\s+AS\s+(\w+))?/i;
  const match = sql.match(pivotRegex);
  if (!match) return sql;

  const basePart = match[1].trim();
  const aggFunc = match[2].toUpperCase();
  const valCol = match[3].trim();
  const pivotCol = match[4].trim();
  const inValuesRaw = match[5].trim();
  const alias = match[6] || 'pvt';

  const inValues = inValuesRaw
    .split(',')
    .map(v => v.trim().replace(/^['"\[]|['"\]]$/g, ''))
    .filter(Boolean);

  const caseStatements = inValues.map(val => {
    return `${aggFunc}(CASE WHEN ${pivotCol} = '${val}' THEN ${valCol} END) AS "${val}"`;
  });

  // Wrap base query in a subquery/CTE
  const fromClause = basePart.startsWith('(') ? `${basePart} AS _pivot_src` : `(${basePart}) AS _pivot_src`;

  return `SELECT\n  ${caseStatements.join(',\n  ')}\nFROM ${fromClause};`;
}

/**
 * Master Dialect Transpiler with Fail-Safe Circuit Breaker.
 */
export function transpileDialectSugar(sql: string): string {
  if (!hasDialectSugar(sql)) return sql;

  let result = sql;
  try {
    if (/\bROWNUM\b/i.test(result)) {
      result = transpileRownum(result);
    }
    if (/\bQUALIFY\b/i.test(result)) {
      result = transpileQualify(result);
    }
    if (/\bPIVOT\b/i.test(result)) {
      result = transpilePivot(result);
    }
    return result;
  } catch {
    // Fail-soft: if any AST anomaly occurs, return original query text untouched
    return sql;
  }
}
