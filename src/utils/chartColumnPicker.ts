/**
 * chartColumnPicker.ts — Intelligent Column Picker for Visual Insights Charts
 * Automatically avoids picking surrogate primary keys (e.g. `id`) as chart metrics,
 * favoring genuine quantitative measures (total, revenue, quantity, salary, count)
 * and descriptive category labels (name, department, title, category, date).
 */

const MEASURE_BOOST_REGEX = /(total|amount|sum|price|revenue|cost|salary|score|count|avg|qty|quantity|value|balance|profit|margin|sales)/i;
const IDENTIFIER_PENALTY_REGEX = /(^id$|_id$|id_|pk$|row_num|index|code|zip|phone|ssn|uuid|guid)/i;

const CATEGORY_BOOST_REGEX = /(name|title|label|category|product|item|department|dept|country|city|state|month|date|day|type|genre|status|author|customer|user)/i;

export interface ChartColumnSelection {
  catIndex: number;
  numIndex: number;
}

export function pickSmartChartColumns(
  columns: string[],
  rows: unknown[][]
): ChartColumnSelection {
  if (columns.length === 0) {
    return { catIndex: 0, numIndex: 0 };
  }
  if (columns.length === 1) {
    return { catIndex: 0, numIndex: 0 };
  }

  // Identify numeric candidates
  const numericIndices: number[] = [];
  const stringIndices: number[] = [];

  for (let c = 0; c < columns.length; c++) {
    let numCount = 0;
    let strCount = 0;
    const sampleLimit = Math.min(rows.length, 50);

    for (let r = 0; r < sampleLimit; r++) {
      const val = rows[r]?.[c];
      if (typeof val === 'number') {
        numCount++;
      } else if (typeof val === 'string' && val.trim() !== '' && !isNaN(Number(val))) {
        numCount++;
      } else if (typeof val === 'string' && val.trim() !== '') {
        strCount++;
      }
    }

    if (numCount > strCount) {
      numericIndices.push(c);
    } else {
      stringIndices.push(c);
    }
  }

  // 1. Pick Best Numeric Measure (Y-Axis)
  let bestNumIndex = -1;
  let highestNumScore = -Infinity;

  const candidateNumIndices = numericIndices.length > 0 ? numericIndices : columns.map((_, i) => i);

  for (const idx of candidateNumIndices) {
    const colName = columns[idx];
    let score = 0;

    if (MEASURE_BOOST_REGEX.test(colName)) {
      score += 100;
    }
    if (IDENTIFIER_PENALTY_REGEX.test(colName)) {
      score -= 150;
    }

    // Secondary heuristic: check variance in sample rows (constants or monotonic 1,2,3 get slight penalty)
    if (rows.length >= 3) {
      const v0 = Number(rows[0]?.[idx]);
      const v1 = Number(rows[1]?.[idx]);
      const v2 = Number(rows[2]?.[idx]);
      if (v1 - v0 === 1 && v2 - v1 === 1) {
        score -= 50; // likely auto-increment id sequence
      }
    }

    if (score > highestNumScore) {
      highestNumScore = score;
      bestNumIndex = idx;
    }
  }

  if (bestNumIndex === -1) {
    bestNumIndex = candidateNumIndices[candidateNumIndices.length - 1] || 0;
  }

  // 2. Pick Best Categorical Label (X-Axis)
  let bestCatIndex = -1;
  let highestCatScore = -Infinity;

  const candidateCatIndices = stringIndices.length > 0 ? stringIndices : columns.map((_, i) => i);

  for (const idx of candidateCatIndices) {
    if (idx === bestNumIndex && candidateCatIndices.length > 1) continue;

    const colName = columns[idx];
    let score = 0;

    if (CATEGORY_BOOST_REGEX.test(colName)) {
      score += 80;
    }
    if (stringIndices.includes(idx)) {
      score += 40;
    }
    if (IDENTIFIER_PENALTY_REGEX.test(colName)) {
      score -= 50;
    }

    if (score > highestCatScore) {
      highestCatScore = score;
      bestCatIndex = idx;
    }
  }

  if (bestCatIndex === -1) {
    bestCatIndex = candidateCatIndices[0] || 0;
  }

  // If X and Y picked the same column and we have at least 2 columns, separate them
  if (bestCatIndex === bestNumIndex && columns.length > 1) {
    if (bestNumIndex === 0) bestCatIndex = 1;
    else bestCatIndex = 0;
  }

  return { catIndex: bestCatIndex, numIndex: bestNumIndex };
}
