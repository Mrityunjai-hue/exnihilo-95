import { NextRequest, NextResponse } from 'next/server';
import { executeSQL } from '../../../engine';
import type { Dialect } from '../../../engine/parser';

/**
 * route.ts — ExNihilo 95 Programmatic Query Execution API
 * Allows headless execution from Python, curl, CLI, and external services.
 */

// Allow cross-origin requests from any client
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sql, dialect = 'MySQL', rowsPerTable = 20 } = body;

    if (!sql || typeof sql !== 'string') {
      return NextResponse.json(
        { success: false, error: 'SQL query string is required' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const result = await executeSQL(sql, {
      dialect: dialect as Dialect,
      rowsPerTable: Number(rowsPerTable) || 20,
    });

    return NextResponse.json(result, { headers: CORS_HEADERS });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Execution error' },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
