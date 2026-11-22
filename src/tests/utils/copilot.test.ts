import { describe, it, expect, vi } from 'vitest';
import { POST } from '../../app/api/copilot/route';
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
});
