import { NextRequest, NextResponse } from 'next/server';
import { buildSystemPrompt, cleanCopilotResponse } from '../../../utils/copilotHelper';

/**
 * route.ts — Grounded Gemini SQL Copilot API Route (v2.0)
 * Uses native Gemini systemInstruction REST payload, dialect few-shot calibration,
 * and ExNihilo zero-config relational synthesis awareness.
 */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, schema, dialect = 'SQLite', userApiKey } = body;

    if (!prompt || typeof prompt !== 'string') {
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

    const systemPrompt = buildSystemPrompt(dialect, schema);
    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemPrompt }],
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt.trim() }],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      }),
    });

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
    const rawSql = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const generatedSql = cleanCopilotResponse(rawSql);

    return NextResponse.json({ ok: true, sql: generatedSql });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: 'INTERNAL_ERROR', message: error?.message || 'Failed to generate SQL' },
      { status: 500 }
    );
  }
}
