/**
 * semantic_query_parser.ts — Intent Extraction & Offline Semantic SQL Synthesizer
 *
 * Accurately parses natural language conversational queries into valid SQL
 * when offline or when an external LLM API is unavailable.
 * Understands entities, superlatives (largest, highest, smallest), ordering, limits, and metrics.
 */

import { transpileDialectForSqlite } from './executor';

export interface SemanticQueryResult {
  sql: string;
  tableName: string;
  isTableCreation?: boolean;
}

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'with', 'by', 'in', 'of', 'for', 'all', 'any', 'from',
  'where', 'and', 'or', 'to', 'that', 'which', 'fix', 'error', 'syntax',
  'near', 'original', 'query', 'failed', 'issue', 'sql', 'execution',
  'table', 'columns', 'column', 'data', 'database', 'results', 'rows', 'row',
  'me', 'please', 'can', 'you', 'give', 'tell', 'show', 'find', 'list', 'get',
  'display', 'select', 'calculate', 'what', 'which', 'is', 'are'
]);

export function parseSemanticQuery(promptText: string): SemanticQueryResult {
  const cleanPrompt = (promptText || '').trim();
  const lower = cleanPrompt.toLowerCase();

  // 1. Detect error repair intent: e.g. "Fix this SQL error: ... Original query: SELECT ..."
  const isErrorRepair = /fix\s+(this\s+)?(sql\s+)?(query\s+)?error/i.test(cleanPrompt) || /original\s+query\s*:/i.test(cleanPrompt);
  if (isErrorRepair) {
    const queryMatch = cleanPrompt.match(/(?:original\s+query|\[FAILED_QUERY\])\s*:\s*([\s\S]+)$/i);
    const rawFailedQuery = queryMatch ? queryMatch[1].trim() : '';

    if (rawFailedQuery) {
      const repaired = transpileDialectForSqlite(rawFailedQuery);
      const tblMatch = repaired.match(/\bFROM\s+["`]?([a-zA-Z0-9_]+)["`]?/i);
      const extractedTable = tblMatch ? tblMatch[1] : 'query_target';
      return {
        sql: repaired.endsWith(';') ? repaired : `${repaired};`,
        tableName: extractedTable,
      };
    }
  }

  // 2. Detect explicit schema / table synthesis request
  const isTableRequest = /^(table\s+for|table|create\s+table|schema\s+for|synthesize\s+table)\b/i.test(cleanPrompt);
  if (isTableRequest) {
    const rawEntity = cleanPrompt.replace(/^(table\s+for|table|create\s+table|schema\s+for|synthesize\s+table)\s*/i, '').trim();
    const cleanTable = rawEntity.replace(/[^a-zA-Z0-9_]/g, '') || 'entity';
    return {
      sql: `CREATE TABLE IF NOT EXISTS "${cleanTable}" (id INT PRIMARY KEY);`,
      tableName: cleanTable,
      isTableCreation: true,
    };
  }

  // 3. Strip conversational filler words ("show me", "tell me", "give me", "find all", "what is", etc.)
  const core = lower
    .replace(/^(show\s+me|tell\s+me|give\s+me|find\s+me|display\s+me|show|find|list|get|select|query|calculate|display|search|what\s+is|which\s+is|table\s+for|table)\s+/i, '')
    .trim();

  // 4. Detect Superlative / Ordering Intent (largest, highest, biggest, smallest, lowest, least)
  const isLargest = /\b(largest|highest|biggest|maximum|max|greatest|heaviest|most|fastest|longest)\b/i.test(core);
  const isSmallest = /\b(smallest|lowest|minimum|min|least|lightest|slowest|shortest)\b/i.test(core);

  // 5. Extract Ordering Metric Column (e.g. "largest mass" -> "mass", "highest revenue" -> "revenue")
  const metricMatch = core.match(/\b(?:largest|highest|biggest|maximum|max|greatest|heaviest|most|fastest|longest|smallest|lowest|minimum|min|least|lightest|slowest|shortest)\s+([a-zA-Z_]+)/i);
  const metricCol = metricMatch ? metricMatch[1].replace(/[^a-zA-Z0-9_]/g, '') : null;

  // 6. Extract Limit Count (e.g. "top 5" -> 5, "top 10" -> 10, "limit 3" -> 3)
  const limitMatch = core.match(/\b(?:top|first|limit)\s+(\d+)\b/i);
  const rowLimit = limitMatch ? parseInt(limitMatch[1], 10) : (isLargest || isSmallest ? 1 : 20);

  // 7. Extract Table / Entity Name
  // Filter out stop words and numbers
  const words = core
    .split(/\s+/)
    .map(w => w.replace(/[^a-z0-9_]/g, ''))
    .filter(w => w && !/^\d+$/.test(w) && !STOP_WORDS.has(w));

  // Find candidate entity word that isn't the metric column
  let entityWord = words.find(w => w && w !== metricCol && !['largest', 'highest', 'smallest', 'lowest', 'max', 'min', 'top'].includes(w) && !STOP_WORDS.has(w)) || 'customers';

  // Normalize pluralization / common domain entities
  const entityMap: Record<string, string> = {
    planet: 'planets',
    planets: 'planets',
    customer: 'customers',
    customers: 'customers',
    order: 'orders',
    orders: 'orders',
    revenue: 'revenue',
    revenues: 'revenue',
    heart: 'heart',
    hearts: 'heart',
    patient: 'heart',
    patients: 'heart',
    user: 'users',
    users: 'users',
    product: 'products',
    products: 'products',
    employee: 'employees',
    employees: 'employees',
  };

  const finalTable = entityMap[entityWord] || entityWord || 'customers';

  // 8. Assemble Grounded SQL
  if (isLargest) {
    const orderCol = metricCol || 'id';
    return {
      sql: `SELECT * FROM "${finalTable}" ORDER BY ${orderCol} DESC LIMIT ${rowLimit};`,
      tableName: finalTable,
    };
  }

  if (isSmallest) {
    const orderCol = metricCol || 'id';
    return {
      sql: `SELECT * FROM "${finalTable}" ORDER BY ${orderCol} ASC LIMIT ${rowLimit};`,
      tableName: finalTable,
    };
  }

  return {
    sql: `SELECT * FROM "${finalTable}" LIMIT ${rowLimit};`,
    tableName: finalTable,
  };
}
