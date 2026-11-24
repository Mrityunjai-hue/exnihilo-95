import { NextRequest, NextResponse } from 'next/server';
import {
  buildSystemPrompt,
  cleanCopilotResponse,
  buildSchemaSystemPrompt,
  parseSchemaResponse,
} from '../../../utils/copilotHelper';
import { resolveOmniDomainSchema } from '../../../engine/omni_domain_classifier';

/**
 * route.ts — Grounded Gemini SQL Copilot API Route (v2.1)
 * Uses native Gemini systemInstruction REST payload, dialect few-shot calibration,
 * ExNihilo zero-config relational synthesis awareness, and on-demand table schema synthesis.
 */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, schema, dialect = 'SQLite', userApiKey, mode, tableName } = body;

    const isSchemaMode = mode === 'schema' || Boolean(tableName);
    const targetPrompt = prompt || tableName || '';

    if (!targetPrompt || typeof targetPrompt !== 'string') {
      return NextResponse.json({ ok: false, error: 'Prompt is required' }, { status: 400 });
    }

    const trimmed = targetPrompt.trim().toLowerCase();

    // 1. Conversational Greeting & Capability Interceptor
    const isGreeting = /^(hello|hi|hey|greetings|help|who are you|what can you do|good morning|good evening|good afternoon)\b/i.test(trimmed);
    if (isGreeting && !isSchemaMode) {
      return NextResponse.json({
        ok: true,
        text: `Hello! 👋 I'm your ExNihilo SQL Copilot. I can write ${dialect} queries for you or synthesize realistic relational tables.\n\nTry asking:\n• "Show top 10 customers by revenue"\n• "Find patients with high heart rate"\n• "@ai table for cyber security events"`,
        sql: `SELECT 'Hello from ExNihilo Copilot!' AS message, '${dialect}' AS dialect;`,
      });
    }

    // Helper for instant on-device synthesis fallback if Gemini is unconfigured or unavailable
    const createFallbackResponse = () => {
      if (isSchemaMode) {
        const cleanTable = (tableName || targetPrompt).replace(/^create table\s*/i, '').trim().replace(/[^a-zA-Z0-9_]/g, '') || 'entity';
        const cols = resolveOmniDomainSchema(cleanTable);
        const colDefs = cols.map(c => `  "${c.name}" ${c.logicalType === 'INTEGER' ? 'INTEGER' : c.logicalType === 'NUMERIC' ? 'NUMERIC' : c.logicalType === 'TIMESTAMP' ? 'TIMESTAMP' : c.logicalType === 'BOOLEAN' ? 'BOOLEAN' : 'VARCHAR(255)'}${c.isPrimaryKey ? ' PRIMARY KEY' : ''}`).join(',\n');
        const ddl = `CREATE TABLE IF NOT EXISTS "${cleanTable}" (\n${colDefs}\n);`;
        return NextResponse.json({
          ok: true,
          mode: 'schema',
          tableName: cleanTable,
          schema: {
            tableName: cleanTable,
            columns: cols.map(c => ({
              name: c.name,
              logicalType: c.logicalType,
              description: `${c.name} column`,
              sampleValue: typeof c.fakerGenerator === 'function' ? c.fakerGenerator() : 1,
            })),
            createSql: ddl,
          },
          sql: ddl,
        });
      }

      const targetWord = targetPrompt.replace(/^(show|find|list|get|select|query|give me|calculate|display|search|table for|table)\s+/i, '').trim();
      const inferredTable = targetWord.split(/\s+/)[0]?.toLowerCase().replace(/[^a-z0-9_]/g, '') || 'customers';
      return NextResponse.json({
        ok: true,
        sql: `SELECT * FROM "${inferredTable}" LIMIT 20;`,
        text: `Generated query for "${targetPrompt}":`,
      });
    };

    const apiKey = userApiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          ok: false,
          error: 'GEMINI_API_KEY_REQUIRED',
          message: 'No Gemini API key configured. Enter your Gemini API key in the Copilot dialog or set the GEMINI_API_KEY environment variable in Vercel.',
        },
        { status: 401 }
      );
    }

    const systemPrompt = isSchemaMode
      ? buildSchemaSystemPrompt(tableName || targetPrompt.replace(/^create table\s*/i, '').trim(), dialect)
      : buildSystemPrompt(dialect, schema);

    // Production-stable Gemini models: prioritize gemini-1.5-flash as the fast, universal primary.
    // Exclude deprecated 2.0-flash models to avoid 404/400 failures.
    const envModel = process.env.GEMINI_MODEL;
    const cleanEnvModel = (envModel && !envModel.includes('2.0') && !envModel.includes('3.8')) ? envModel : null;

    const candidateModels = Array.from(new Set([
      'gemini-1.5-flash',
      cleanEnvModel,
      'gemini-1.5-pro',
      'gemini-2.5-flash',
    ].filter(Boolean))) as string[];

    const requestBody = JSON.stringify({
      systemInstruction: {
        parts: [{ text: systemPrompt }],
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: targetPrompt.trim() }],
        },
      ],
      generationConfig: {
        temperature: isSchemaMode ? 0.2 : 0.1,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
        responseMimeType: isSchemaMode ? 'application/json' : undefined,
      },
    });

    let response: Response | null = null;

    for (const model of candidateModels) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: requestBody,
          signal: AbortSignal.timeout(4500), // Enforce 4.5s max per Google API call
        });

        if (res.ok) {
          response = res;
          break;
        }

        // If key is invalid (401/403), stop immediately — no model will succeed
        if (res.status === 401 || res.status === 403) {
          break;
        }
      } catch {
        continue;
      }
    }

    if (!response || !response.ok) {
      // If external Gemini API fails or times out, immediately fall back to on-device synthesis
      return createFallbackResponse();
    }

    const data = await response.json();
    const rawOutput = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (isSchemaMode) {
      const parsedSchema = parseSchemaResponse(rawOutput);
      return NextResponse.json({
        ok: true,
        mode: 'schema',
        tableName: parsedSchema?.tableName || targetPrompt,
        schema: parsedSchema,
        sql: parsedSchema?.createSql || `CREATE TABLE ${parsedSchema?.tableName || targetPrompt} (id INT PRIMARY KEY);`,
      });
    }

    const generatedSql = cleanCopilotResponse(rawOutput);
    const isSql = /^\s*(SELECT|INSERT|UPDATE|DELETE|CREATE|WITH|ALTER|DROP|SHOW|EXPLAIN|PRAGMA|DESCRIBE)\b/i.test(generatedSql);
    const extractedSql = isSql ? generatedSql : (rawOutput.match(/(SELECT|INSERT|UPDATE|DELETE|CREATE|WITH)\b[\s\S]*?;/i)?.[0] || '');

    return NextResponse.json({
      ok: true,
      sql: extractedSql,
      text: isSql ? undefined : rawOutput,
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: 'INTERNAL_ERROR', message: error?.message || 'Failed to generate SQL' },
      { status: 500 }
    );
  }
}
