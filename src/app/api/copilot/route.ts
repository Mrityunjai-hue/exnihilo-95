import { NextRequest, NextResponse } from 'next/server';

/**
 * route.ts — Opt-In Gemini SQL Copilot API Route
 * Zero heavyweight SDK dependencies — uses native fetch directly to Google's REST API.
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
          message: 'No Gemini API key configured. Enter your Gemini API key in the Copilot dialog or set the GEMINI_API_KEY environment variable.',
        },
        { status: 401 }
      );
    }

    const systemInstruction = `You are an expert SQL assistant for the retro ExNihilo 95 IDE.
Generate ONLY syntactically valid ${dialect} SQL for the user request.
Do not wrap in markdown codeblocks (no \`\`\`sql). Output pure, executable SQL only.
${schema ? `Existing Schema Context:\n${schema}` : ''}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: `${systemInstruction}\n\nUser Request: ${prompt}` }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1000,
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
    let generatedSql = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    generatedSql = generatedSql.replace(/^```(?:sql)?\n?/i, '').replace(/```$/i, '').trim();

    return NextResponse.json({ ok: true, sql: generatedSql });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: 'INTERNAL_ERROR', message: error?.message || 'Failed to generate SQL' },
      { status: 500 }
    );
  }
}
