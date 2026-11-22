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

export interface DatabaseSharePayload extends SharePayload {
  dbBinary?: Uint8Array;
}

export async function compressBytes(bytes: Uint8Array): Promise<Uint8Array> {
  if (typeof CompressionStream !== 'undefined') {
    const stream = new Blob([bytes as any]).stream().pipeThrough(new CompressionStream('gzip'));
    const ab = await new Response(stream).arrayBuffer();
    return new Uint8Array(ab);
  }
  return bytes;
}

export async function decompressBytes(bytes: Uint8Array): Promise<Uint8Array> {
  if (typeof DecompressionStream !== 'undefined') {
    const stream = new Blob([bytes as any]).stream().pipeThrough(new DecompressionStream('gzip'));
    const ab = await new Response(stream).arrayBuffer();
    return new Uint8Array(ab);
  }
  return bytes;
}

export function uint8ArrayToBase64Url(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export function base64UrlToUint8Array(base64url: string): Uint8Array {
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
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
 * Encodes a query AND full database binary into a compressed v2 URL share fragment
 */
export async function encodeDatabaseSharePayload(payload: DatabaseSharePayload): Promise<string> {
  try {
    let dbBase64 = '';
    if (payload.dbBinary && payload.dbBinary.length > 0) {
      const compressed = await compressBytes(payload.dbBinary);
      dbBase64 = uint8ArrayToBase64Url(compressed);
    }

    const jsonStr = JSON.stringify({
      q: payload.queryText,
      d: payload.dialect,
      t: payload.title || 'Shared Database',
      r: Boolean(payload.autoRun),
      b: dbBase64 || undefined,
    });

    const utf8Bytes = new TextEncoder().encode(jsonStr);
    const compressedPayload = await compressBytes(utf8Bytes);
    const base64 = uint8ArrayToBase64Url(compressedPayload);

    return `#dbshare=${base64}`;
  } catch (err) {
    console.error('Failed to encode database share payload:', err);
    return encodeSharePayload(payload);
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
    } else if (hashOrSearch.includes('q=')) {
      rawBase64 = hashOrSearch.split('q=')[1].split('&')[0];
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

/**
 * Decodes a URL hash containing either v1 query share (#share=) or v2 database share (#dbshare=)
 */
export async function decodeDatabaseSharePayload(hashOrSearch: string): Promise<DatabaseSharePayload | null> {
  if (!hashOrSearch) return null;
  if (!hashOrSearch.includes('dbshare=')) {
    return decodeSharePayload(hashOrSearch);
  }

  try {
    const raw = hashOrSearch.split('dbshare=')[1].split('&')[0];
    if (!raw) return null;

    const compressed = base64UrlToUint8Array(raw);
    const decompressed = await decompressBytes(compressed);
    const jsonStr = new TextDecoder().decode(decompressed);
    const parsed = JSON.parse(jsonStr);

    let dbBinary: Uint8Array | undefined;
    if (parsed.b) {
      const compDb = base64UrlToUint8Array(parsed.b);
      dbBinary = await decompressBytes(compDb);
    }

    return {
      queryText: parsed.q,
      dialect:   (parsed.d as Dialect) || 'SQLite',
      title:     parsed.t || 'Shared Database',
      autoRun:   Boolean(parsed.r),
      dbBinary,
    };
  } catch (err) {
    console.error('Failed to decode database share payload:', err);
    return decodeSharePayload(hashOrSearch);
  }
}
