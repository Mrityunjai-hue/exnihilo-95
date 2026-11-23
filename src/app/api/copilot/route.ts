import { NextRequest, NextResponse } from 'next/server';
import {
  buildSystemPrompt,
  cleanCopilotResponse,
  buildSchemaSystemPrompt,
  parseSchemaResponse,
} from '../../../utils/copilotHelper';

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

    const primaryModel = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
    let url = `https://generativelanguage.googleapis.com/v1beta/models/${primaryModel}:generateContent?key=${apiKey}`;

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

    let response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: requestBody,
    });

    // Graceful fallback to gemini-1.5-flash if 2.0-flash returns 404/400
    if (!response.ok && (response.status === 404 || response.status === 400) && primaryModel !== 'gemini-1.5-flash') {
      const fallbackUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const fallbackRes = await fetch(fallbackUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: requestBody,
      });
      if (fallbackRes.ok) {
        response = fallbackRes;
      }
    }

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          ok: false,
          error: 'API_ERROR',
          message: errData?.error?.message || `Gemini API returned status ${response.status}`,
        },
        { status: response.status }
      );
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
    return NextResponse.json({ ok: true, sql: generatedSql });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: 'INTERNAL_ERROR', message: error?.message || 'Failed to generate SQL' },
      { status: 500 }
    );
  }
}
