import { describe, it, expect } from 'vitest';

/**
 * Helper extracting error location matching IDEShell.tsx parser
 */
function parseErrorLocation(msg: string | null | undefined): { line: number; col: number; message: string } | null {
  if (!msg) return null;
  const match = msg.match(/line\s+(\d+)(?:,\s*(?:col|column)\s+(\d+))?/i);
  if (match) {
    return {
      line: parseInt(match[1], 10),
      col: match[2] ? parseInt(match[2], 10) : 1,
      message: msg,
    };
  }
  return null;
}

describe('Error Location Parser (ActiveErrorLocation Regex)', () => {
  it('should parse syntax error with line only and default col to 1', () => {
    const errorMsg = "Syntax error near 'FROM' at line 3";
    const parsed = parseErrorLocation(errorMsg);
    expect(parsed).toEqual({
      line: 3,
      col: 1,
      message: errorMsg,
    });
  });

  it('should parse syntax error with line and column', () => {
    const errorMsg = 'Parse error at line 5, column 12: unexpected identifier';
    const parsed = parseErrorLocation(errorMsg);
    expect(parsed).toEqual({
      line: 5,
      col: 12,
      message: errorMsg,
    });
  });

  it('should parse error with col shorthand', () => {
    const errorMsg = 'Unexpected token at line 1, col 8';
    const parsed = parseErrorLocation(errorMsg);
    expect(parsed).toEqual({
      line: 1,
      col: 8,
      message: errorMsg,
    });
  });

  it('should return null for messages without line information', () => {
    expect(parseErrorLocation('Table not found: customers')).toBeNull();
    expect(parseErrorLocation('Execution timed out after 5000ms')).toBeNull();
    expect(parseErrorLocation('')).toBeNull();
    expect(parseErrorLocation(null)).toBeNull();
  });
});
