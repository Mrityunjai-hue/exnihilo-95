/**
 * shareEncoder.ts — URL-safe Base64 Encoding & Decoding for Shareable Query Links
 */

import { Dialect } from '../engine/parser';

export interface SharePayload {
  queryText: string;
  dialect:   Dialect;
  title?:    string;
  autoRun?:  boolean;
}

/**
 * Encodes a query payload into a URL-safe Base64 hash fragment
 */
export function encodeSharePayload(payload: SharePayload): string {
  try {
    const jsonStr = JSON.stringify({
      q: payload.queryText,
      d: payload.dialect,
      t: payload.title || 'Shared Query',
      r: Boolean(payload.autoRun),
    });

    // Handle UTF-8 unicode strings safely
    const utf8Bytes = encodeURIComponent(jsonStr).replace(
      /%([0-9A-F]{2})/g,
      (_, p1) => String.fromCharCode(parseInt(p1, 16))
    );

    const base64 = btoa(utf8Bytes)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    return `#share=${base64}`;
  } catch (err) {
    console.error('Failed to encode share payload:', err);
    return '';
  }
}

/**
 * Decodes a URL hash or search string into a SharePayload object
 */
export function decodeSharePayload(hashOrSearch: string): SharePayload | null {
  if (!hashOrSearch) return null;

  try {
    let rawBase64 = '';
    if (hashOrSearch.includes('share=')) {
      rawBase64 = hashOrSearch.split('share=')[1].split('&')[0];
    } else if (hashOrSearch.startsWith('#') || hashOrSearch.startsWith('?')) {
      rawBase64 = hashOrSearch.slice(1);
    } else {
      rawBase64 = hashOrSearch;
    }

    if (!rawBase64) return null;

    // Restore standard Base64 characters
    let base64 = rawBase64.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }

    const utf8Bytes = atob(base64);
    const jsonStr = decodeURIComponent(
      Array.from(utf8Bytes)
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    const parsed = JSON.parse(jsonStr);
    if (!parsed || typeof parsed.q !== 'string') {
      return null;
    }

    return {
      queryText: parsed.q,
      dialect:   (parsed.d as Dialect) || 'MySQL',
      title:     parsed.t || 'Shared Query',
      autoRun:   Boolean(parsed.r),
    };
  } catch (err) {
    console.error('Failed to decode share payload:', err);
    return null;
  }
}
