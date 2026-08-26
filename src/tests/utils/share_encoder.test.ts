import { describe, it, expect } from 'vitest';
import { encodeSharePayload, decodeSharePayload, SharePayload } from '../../utils/shareEncoder';

describe('ShareEncoder Utility', () => {
  it('should correctly encode and decode a basic SQL query payload', () => {
    const original: SharePayload = {
      queryText: 'SELECT * FROM customers WHERE city = "Houstonside";',
      dialect: 'MySQL',
      title: 'Customer Query',
      autoRun: true,
    };

    const encodedHash = encodeSharePayload(original);
    expect(encodedHash).toContain('#share=');

    const decoded = decodeSharePayload(encodedHash);
    expect(decoded).not.toBeNull();
    expect(decoded?.queryText).toBe(original.queryText);
    expect(decoded?.dialect).toBe('MySQL');
    expect(decoded?.title).toBe('Customer Query');
    expect(decoded?.autoRun).toBe(true);
  });

  it('should handle Unicode characters in query text', () => {
    const original: SharePayload = {
      queryText: 'SELECT * FROM "café_orders" WHERE status = "🎉";',
      dialect: 'PostgreSQL',
      title: 'Unicode Test',
      autoRun: false,
    };

    const encodedHash = encodeSharePayload(original);
    const decoded = decodeSharePayload(encodedHash);

    expect(decoded).not.toBeNull();
    expect(decoded?.queryText).toBe(original.queryText);
    expect(decoded?.dialect).toBe('PostgreSQL');
    expect(decoded?.title).toBe('Unicode Test');
    expect(decoded?.autoRun).toBe(false);
  });

  it('should return null for malformed or empty hash strings', () => {
    expect(decodeSharePayload('')).toBeNull();
    expect(decodeSharePayload('#share=invalid_base64_data!!!')).toBeNull();
    expect(decodeSharePayload('#share=e30=')).toBeNull(); // Empty object `{}`
  });
});
