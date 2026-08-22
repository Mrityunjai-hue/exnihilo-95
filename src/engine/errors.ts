/**
 * errors.ts — Phase 6: Error Classification & Diagnostics
 *
 * Implements spec Section 3.5:
 *  - Categorizes error events into clear user-facing diagnostics:
 *      * SYNTAX_ERROR: Malformed SQL grammar (e.g. Test 7 `SELECT * FROM prders LIMIT`)
 *      * AMBIGUOUS_COLUMN: Unqualified column existing in multiple joined tables (e.g. Test 5)
 *      * RUNTIME_ERROR: Engine-level execution failures
 *  - Helper functions for error presentation and user-friendly diagnostics
 */

export type ErrorClassification =
  | 'SYNTAX_ERROR'
  | 'AMBIGUOUS_COLUMN'
  | 'RUNTIME_ERROR';

export interface ClassifiedError {
  type:            ErrorClassification;
  message:         string;
  originalMessage: string;
  suggestion?:     string;
}

/**
 * Classify a raw database / parser exception.
 */
export function classifyError(rawError: any): ClassifiedError {
  const msg: string = rawError?.message || String(rawError || 'Unknown execution error');

  // 1. Ambiguous Column Error (e.g. SQLite "ambiguous column name: name")
  if (/ambiguous column name/i.test(msg)) {
    const match = msg.match(/ambiguous column name:\s*([a-zA-Z0-9_]+)/i);
    const colName = match ? match[1] : 'column';
    return {
      type: 'AMBIGUOUS_COLUMN',
      message: msg,
      originalMessage: msg,
      suggestion: `Qualify the column with its table alias, e.g. "e.${colName}" or "d.${colName}".`,
    };
  }

  // 2. Syntax / Parser Error
  if (
    /Expected .* but .* found/i.test(msg) ||
    /syntax error/i.test(msg) ||
    /near ".*": syntax error/i.test(msg) ||
    /unclosed/i.test(msg)
  ) {
    return {
      type: 'SYNTAX_ERROR',
      message: msg,
      originalMessage: msg,
      suggestion: 'Check SQL syntax, keywords, parentheses, or unclosed quotes.',
    };
  }

  // 3. Default Runtime Error
  return {
    type: 'RUNTIME_ERROR',
    message: msg,
    originalMessage: msg,
  };
}
