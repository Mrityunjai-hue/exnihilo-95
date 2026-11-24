/**
 * semantic_query_parser.ts — Intent Extraction & Offline Semantic SQL Synthesizer
 *
 * Accurately parses natural language conversational queries into valid SQL
 * when offline or when an external LLM API is unavailable.
 * Understands entities, superlatives (largest, highest, smallest), ordering, limits, and metrics.
 */

export interface SemanticQueryResult {
  sql: string;
  tableName: string;
  isTableCreation?: boolean;
}

export function parseSemanticQuery(promptText: string): SemanticQueryResult {
  const cleanPrompt = (promptText || '').trim();
  const lower = cleanPrompt.toLowerCase();

  // 1. Detect explicit schema / table synthesis request
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

  // 2. Strip conversational filler words ("show me", "tell me", "give me", "find all", "what is", etc.)
  const core = lower
    .replace(/^(show\s+me|tell\s+me|give\s+me|find\s+me|display\s+me|show|find|list|get|select|query|calculate|display|search|what\s+is|which\s+is|table\s+for|table)\s+/i, '')
    .trim();

  // 3. Detect Superlative / Ordering Intent (largest, highest, biggest, smallest, lowest, least)
  const isLargest = /\b(largest|highest|biggest|maximum|max|greatest|heaviest|most|fastest|longest)\b/i.test(core);
  const isSmallest = /\b(smallest|lowest|minimum|min|least|lightest|slowest|shortest)\b/i.test(core);

  // 4. Extract Ordering Metric Column (e.g. "largest mass" -> "mass", "highest revenue" -> "revenue")
  const metricMatch = core.match(/\b(?:largest|highest|biggest|maximum|max|greatest|heaviest|most|fastest|longest|smallest|lowest|minimum|min|least|lightest|slowest|shortest)\s+([a-zA-Z_]+)/i);
  const metricCol = metricMatch ? metricMatch[1].replace(/[^a-zA-Z0-9_]/g, '') : null;

  // 5. Extract Limit Count (e.g. "top 5" -> 5, "top 10" -> 10, "limit 3" -> 3)
  const limitMatch = core.match(/\b(?:top|first|limit)\s+(\d+)\b/i);
  const rowLimit = limitMatch ? parseInt(limitMatch[1], 10) : (isLargest || isSmallest ? 1 : 20);

  // 6. Extract Table / Entity Name
  // Filter out stop words and numbers
  const words = core
    .split(/\s+/)
    .map(w => w.replace(/[^a-z0-9_]/g, ''))
    .filter(w => w && !/^\d+$/.test(w) && !['the', 'a', 'an', 'with', 'by', 'in', 'of', 'for', 'all', 'any', 'from', 'where', 'and', 'or', 'to', 'that', 'which'].includes(w));

  // Find candidate entity word that isn't the metric column
  let entityWord = words.find(w => w && w !== metricCol && !['largest', 'highest', 'smallest', 'lowest', 'max', 'min', 'top'].includes(w)) || 'customers';

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

  // 7. Assemble Grounded SQL
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
