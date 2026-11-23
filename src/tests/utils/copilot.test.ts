import { describe, it, expect, vi } from 'vitest';
import { POST } from '../../app/api/copilot/route';
import { buildSystemPrompt, cleanCopilotResponse } from '../../utils/copilotHelper';
import { NextRequest } from 'next/server';

describe('Phase 13 — Gemini SQL Copilot API Route', () => {
  it('returns 400 when prompt is missing or empty', async () => {
    const req = new NextRequest('http://localhost:3000/api/copilot', {
      method: 'POST',
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.ok).toBe(false);
    expect(data.error).toBe('Prompt is required');
  });

  it('returns 401 GEMINI_API_KEY_REQUIRED when no API key is available', async () => {
    const originalKey = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;

    try {
      const req = new NextRequest('http://localhost:3000/api/copilot', {
        method: 'POST',
        body: JSON.stringify({ prompt: 'Select all users from customers' }),
      });
      const res = await POST(req);
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.ok).toBe(false);
      expect(data.error).toBe('GEMINI_API_KEY_REQUIRED');
      expect(data.message).toContain('No Gemini API key configured');
    } finally {
      if (originalKey) process.env.GEMINI_API_KEY = originalKey;
    }
  });

  it('generates SQL when API key is provided and endpoint returns success', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [{ text: 'SELECT * FROM customers WHERE age > 25;' }],
            },
          },
        ],
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    try {
      const req = new NextRequest('http://localhost:3000/api/copilot', {
        method: 'POST',
        body: JSON.stringify({
          prompt: 'Find customers older than 25',
          dialect: 'PostgreSQL',
          userApiKey: 'AIzaSyTestKey123',
        }),
      });
      const res = await POST(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.ok).toBe(true);
      expect(data.sql).toBe('SELECT * FROM customers WHERE age > 25;');
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('strips markdown codeblock fence syntax (including ```sqlite)', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [{ text: '```sqlite\nSELECT id, name FROM users;\n```' }],
            },
          },
        ],
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    try {
      const req = new NextRequest('http://localhost:3000/api/copilot', {
        method: 'POST',
        body: JSON.stringify({
          prompt: 'Get users',
          userApiKey: 'testKey',
        }),
      });
      const res = await POST(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.ok).toBe(true);
      expect(data.sql).toBe('SELECT id, name FROM users;');
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('builds grounded system prompt with dialect rules and zero-config awareness', () => {
    const pgPrompt = buildSystemPrompt('PostgreSQL', 'users (id, email)');
    expect(pgPrompt).toContain('ZERO-CONFIG SYNTHESIS AWARENESS');
    expect(pgPrompt).toContain('ILIKE');
    expect(pgPrompt).toContain('users (id, email)');

    const myPrompt = buildSystemPrompt('MySQL');
    expect(myPrompt).toContain('CONCAT()');
    expect(myPrompt).toContain('DATE_FORMAT');
  });

  it('cleans conversational prefixes from copilot responses', () => {
    const raw = 'Here is the SQL query:\n```sql\nSELECT * FROM orders;\n```';
    expect(cleanCopilotResponse(raw)).toBe('SELECT * FROM orders;');
  });

  it('supports schema mode to synthesize out-of-context table ontologies with Gemini', async () => {
    const mockSchema = {
      tableName: 'ancient_mayan_calendars',
      columns: [
        { name: 'id', logicalType: 'INTEGER', description: 'Primary key' },
        { name: 'baktun_cycle', logicalType: 'INTEGER', description: 'Calendar cycle' },
        { name: 'glyph_notation', logicalType: 'VARCHAR', description: 'Hieroglyph' },
      ],
      createSql: 'CREATE TABLE ancient_mayan_calendars (id INT PRIMARY KEY, baktun_cycle INT, glyph_notation TEXT);',
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [{ text: JSON.stringify(mockSchema) }],
            },
          },
        ],
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    try {
      const req = new NextRequest('http://localhost:3000/api/copilot', {
        method: 'POST',
        body: JSON.stringify({
          mode: 'schema',
          tableName: 'ancient_mayan_calendars',
          userApiKey: 'testKey123',
        }),
      });
      const res = await POST(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.ok).toBe(true);
      expect(data.mode).toBe('schema');
      expect(data.tableName).toBe('ancient_mayan_calendars');
      expect(data.schema.columns).toHaveLength(3);
      expect(data.sql).toContain('CREATE TABLE ancient_mayan_calendars');
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
