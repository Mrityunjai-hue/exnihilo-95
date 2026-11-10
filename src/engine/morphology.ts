/**
 * morphology.ts — Morphological NLP Tokenizer, De-prefixer & Lemmatizer
 *
 * Decomposes raw database table names (including ETL prefixes, casing styles,
 * abbreviations, and irregular English plurals) into clean semantic root tokens.
 */

// Common database / ETL prefixes to strip
const DB_PREFIXES = [
  'tbl_', 't_', 'dim_', 'fact_', 'stg_', 'raw_', 'v_', 'vw_',
  'stage_', 'agg_', 'staging_', 'app_', 'mstr_', 'ods_', 'ext_'
];

// Common database suffixes to strip
const DB_SUFFIXES = [
  '_history', '_archive', '_staging', '_bkp', '_backup', '_v1', '_v2',
  '_temp', '_tmp', '_table', '_tbl', '_data', '_list', '_master'
];

// Irregular English noun plural mapping
const IRREGULAR_NOUNS: Record<string, string> = {
  people: 'person',
  children: 'child',
  men: 'man',
  women: 'woman',
  feet: 'foot',
  teeth: 'tooth',
  geese: 'goose',
  mice: 'mouse',
  oxen: 'ox',
  leaves: 'leaf',
  halves: 'half',
  knives: 'knife',
  lives: 'life',
  wives: 'wife',
  calves: 'calf',
  shelves: 'shelf',
  criteria: 'criterion',
  data: 'data',
  matrices: 'matrix',
  indices: 'index',
  vertices: 'vertex',
  analyses: 'analysis',
  crises: 'crisis',
  diagnoses: 'diagnosis',
  theses: 'thesis',
  phenomena: 'phenomenon',
  quizzes: 'quiz',
};

// Suffix rules for regular plurals
function singularizeWord(word: string): string {
  const w = word.toLowerCase();

  // 1. Check irregular nouns
  if (IRREGULAR_NOUNS[w]) {
    return IRREGULAR_NOUNS[w];
  }

  // 2. Words that look plural but are singular (or invariable)
  if (w.endsWith('ss') || w === 'news' || w === 'series' || w === 'species' || w === 'status' || w === 'canvas' || w === 'bus' || w === 'virus') {
    return w;
  }

  // 3. -ies -> -y (categories -> category, queries -> query, properties -> property)
  if (w.endsWith('ies') && w.length > 4) {
    return w.slice(0, -3) + 'y';
  }

  // 4. -ves -> -f or -fe (wolves -> wolf, scarves -> scarf)
  if (w.endsWith('ves') && w.length > 4) {
    return w.slice(0, -3) + 'f';
  }

  // 5. -es rules (classes -> class, boxes -> box, matches -> match, dishes -> dish)
  if (w.endsWith('es') && (w.endsWith('sses') || w.endsWith('shes') || w.endsWith('ches') || w.endsWith('xes') || w.endsWith('zes'))) {
    return w.slice(0, -2);
  }

  // 6. Generic trailing -s (books -> book, orders -> order, flights -> flight)
  if (w.endsWith('s') && !w.endsWith('ss') && w.length > 2) {
    return w.slice(0, -1);
  }

  return w;
}

export interface NormalizedTableInfo {
  original: string;
  cleanedName: string;
  singularName: string;
  tokens: string[];
  entityHead: string;
  qualifiers: string[];
}

export function normalizeTableName(rawTableName: string): NormalizedTableInfo {
  let s = rawTableName.trim();

  // 1. Convert CamelCase / PascalCase to snake_case (e.g., FlightBookings -> flight_bookings)
  s = s.replace(/([a-z\d])([A-Z])/g, '$1_$2');
  s = s.replace(/([A-Z]+)([A-Z][a-z\d]+)/g, '$1_$2');
  s = s.toLowerCase().replace(/[-\s.]+/g, '_');

  // 2. Strip known database prefixes
  for (const p of DB_PREFIXES) {
    if (s.startsWith(p) && s.length > p.length) {
      s = s.slice(p.length);
      break;
    }
  }

  // 3. Strip known database suffixes
  for (const suf of DB_SUFFIXES) {
    if (s.endsWith(suf) && s.length > suf.length) {
      s = s.slice(0, -suf.length);
      break;
    }
  }

  // Clean remaining dangling underscores
  s = s.replace(/^_+|_+$/g, '');

  // 4. Tokenize into individual words
  const rawTokens = s.split('_').filter(Boolean);
  const lemmatizedTokens = rawTokens.map(singularizeWord);

  const singularName = lemmatizedTokens.join('_');
  const entityHead = lemmatizedTokens[lemmatizedTokens.length - 1] || s;
  const qualifiers = lemmatizedTokens.slice(0, -1);

  return {
    original: rawTableName,
    cleanedName: s,
    singularName,
    tokens: lemmatizedTokens,
    entityHead,
    qualifiers,
  };
}

