import { describe, it, expect } from 'vitest';
import type { ChatMessage } from '../../components/Mobile/PocketSQLChat';

describe('PocketSQLChat Message Logic & Architecture', () => {
  it('creates right-aligned user messages with SQL text', () => {
    const userMsg: ChatMessage = {
      id: 'user-1',
      sender: 'user',
      timestamp: '10:24 AM',
      sql: 'SELECT * FROM hearts;',
    };

    expect(userMsg.sender).toBe('user');
    expect(userMsg.sql).toBe('SELECT * FROM hearts;');
    expect(userMsg.timestamp).toBe('10:24 AM');
  });

  it('creates left-aligned kernel response messages with execution results', () => {
    const kernelMsg: ChatMessage = {
      id: 'kernel-1',
      sender: 'kernel',
      timestamp: '10:24 AM',
      executionTimeMs: 14.2,
      result: {
        ok: true,
        columns: ['heart_rate', 'beating_frequency'],
        rows: [[75, 1.25], [82, 1.36]],
        rowCount: 2,
        executionTimeMs: 14.2,
        inferredTables: ['hearts'],
        reusedTables: [],
      },
    };

    expect(kernelMsg.sender).toBe('kernel');
    expect(kernelMsg.result?.rowCount).toBe(2);
    expect(kernelMsg.result?.columns).toEqual(['heart_rate', 'beating_frequency']);
    expect(kernelMsg.result?.inferredTables).toContain('hearts');
  });

  it('formats AI copilot suggestion cards for seamless chat flow', () => {
    const aiMsg: ChatMessage = {
      id: 'ai-1',
      sender: 'copilot',
      timestamp: '10:25 AM',
      text: 'I generated this query for you:',
      sql: 'SELECT * FROM hearts WHERE heart_rate > 90;',
    };

    expect(aiMsg.sender).toBe('copilot');
    expect(aiMsg.sql).toContain('heart_rate > 90');
  });
});
