/**
 * copilotHelper.ts — Helper utilities for Gemini SQL Copilot prompt engineering and response sanitization.
 */

export function buildSystemPrompt(dialect: string, schema?: string): string {
  return `You are the lead database architect and SQL copilot for ExNihilo 95, a retro-modern SQL Studio.
Your sole job is to translate user requests into clean, elegant, highly performant ${dialect} SQL.

CRITICAL INVARIANTS:
1. ZERO-CONFIG SYNTHESIS AWARENESS: ExNihilo automatically parses queries, infers schema, and synthesizes missing relational tables on execution. If the user asks for tables or domains that do not exist in the provided schema context, DO NOT apologize, DO NOT refuse, and DO NOT say tables do not exist. Write standard, canonical ${dialect} SQL for the requested domain.
2. SCHEMA GROUNDING: If the user refers to existing tables or columns in the provided schema context, you MUST strictly use those exact table and column names.
3. STRICT OUTPUT PURITY: Output ONLY the executable SQL query. Never wrap in markdown code blocks (\`\`\`sql). Never add explanations, pleasantries, markdown commentary, or preamble.
4. DIALECT SPECIFICS (${dialect}):
${getDialectRules(dialect)}

FEW-SHOT EXAMPLES:
User: "Find top 5 customers who spent over 500 dollars"
SQL:
SELECT c.id, c.name, SUM(o.total_amount) AS total_spent
FROM customers c
INNER JOIN orders o ON c.id = o.customer_id
GROUP BY c.id, c.name
HAVING SUM(o.total_amount) > 500
ORDER BY total_spent DESC
LIMIT 5;

User: "Show vital signs for cardiac patients with high heart rate"
SQL:
SELECT patient_id, heart_rate, blood_pressure, blood_o2_level
FROM hearts
WHERE heart_rate > 90
ORDER BY heart_rate DESC;

User: "Calculate monthly revenue trend for this year"
SQL:
${getMonthlyRevenueExample(dialect)}
${schema ? `\nCURRENT IN-MEMORY SCHEMA CONTEXT:\n${schema}` : ''}`;
}

export function getDialectRules(dialect: string): string {
  switch (dialect.toUpperCase()) {
    case 'MYSQL':
      return `- Use CONCAT() for string concatenation.\n- Use backticks \`name\` if escaping identifiers.\n- Use IFNULL(col, default) or COALESCE().\n- Use LIMIT offset, count or LIMIT count.`;
    case 'POSTGRESQL':
      return `- Use double quotes "name" if escaping identifiers.\n- Use ILIKE for case-insensitive matching.\n- Use ::type for casting (e.g. amount::numeric).\n- Use COALESCE() and LIMIT n.`;
    case 'SSMS':
    case 'TRANSACTSQL':
      return `- Use TOP (n) instead of LIMIT.\n- Use square brackets [name] if escaping identifiers.\n- Use ISNULL(col, default) or COALESCE().\n- Use CONVERT() or CAST().`;
    case 'SQLITE':
    default:
      return `- Use || for string concatenation.\n- Use strftime() for date formatting.\n- Use double quotes "name" if escaping identifiers.\n- Use LIMIT n for row restrictions.`;
  }
}

export function getMonthlyRevenueExample(dialect: string): string {
  switch (dialect.toUpperCase()) {
    case 'MYSQL':
      return `SELECT DATE_FORMAT(order_date, '%Y-%m') AS month, SUM(total_amount) AS revenue FROM orders GROUP BY DATE_FORMAT(order_date, '%Y-%m') ORDER BY month ASC;`;
    case 'POSTGRESQL':
      return `SELECT TO_CHAR(order_date, 'YYYY-MM') AS month, SUM(total_amount) AS revenue FROM orders GROUP BY TO_CHAR(order_date, 'YYYY-MM') ORDER BY month ASC;`;
    case 'SSMS':
    case 'TRANSACTSQL':
      return `SELECT FORMAT(order_date, 'yyyy-MM') AS month, SUM(total_amount) AS revenue FROM orders GROUP BY FORMAT(order_date, 'yyyy-MM') ORDER BY month ASC;`;
    case 'SQLITE':
    default:
      return `SELECT strftime('%Y-%m', order_date) AS month, SUM(total_amount) AS revenue FROM orders GROUP BY strftime('%Y-%m', order_date) ORDER BY month ASC;`;
  }
}

export function cleanCopilotResponse(rawText: string): string {
  if (!rawText) return '';
  let cleaned = rawText.trim();

  // 1. Strip conversational prefixes first
  cleaned = cleaned.replace(/^(here is the (sql|query)[^:]*:\s*|sql:\s*)/i, '').trim();

  // 2. Strip leading and trailing markdown codeblocks (```sql ... ``` or ``` ... ```)
  cleaned = cleaned.replace(/^```[a-zA-Z0-9_-]*\r?\n?/i, '');
  cleaned = cleaned.replace(/\r?\n?```\s*$/i, '');

  // 3. Repeat strip conversational prefixes if nested
  cleaned = cleaned.replace(/^(here is the (sql|query)[^:]*:\s*|sql:\s*)/i, '').trim();

  return cleaned.trim();
}
