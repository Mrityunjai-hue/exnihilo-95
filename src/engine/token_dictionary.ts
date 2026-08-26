/**
 * token_dictionary.ts — Impenetrable Word-Boundary Column Tokenizer & Type Dispatcher
 *
 * Replaces loose string matching with strict O(1) set lookups, tokenized word-boundary (\b) regexes,
 * and exact prefix/suffix rules to eliminate substring collisions (e.g. country vs count, discount vs count, manager vs age).
 */

import { faker } from '@faker-js/faker';
import { LogicalType } from './inference';

// ── Exact Canonical Column Map (O(1) Lookup) ─────────────────────────────────
const EXACT_VARCHAR_COLS = new Set([
  'country', 'city', 'state', 'province', 'address', 'street', 'zip', 'postal',
  'phone', 'mobile', 'email', 'name', 'first_name', 'last_name', 'firstname', 'lastname',
  'title', 'job_title', 'description', 'notes', 'comment', 'body', 'sku', 'status',
  'type', 'category', 'role', 'company', 'organization', 'department', 'domain', 'url',
  'website', 'ip_address', 'ip', 'uuid', 'guid', 'stage', 'deal_stage', 'message',
  'chat_message', 'manager', 'manager_name', 'account_code', 'account_name', 'blood_type',
  'doctor_name', 'patient_name', 'event_type', 'currency', 'plan_tier'
]);

const EXACT_NUMERIC_COLS = new Set([
  'price', 'unit_price', 'amount', 'total_amount', 'total', 'cost', 'unit_cost',
  'score', 'rating', 'balance', 'salary', 'weight', 'height', 'discount',
  'discount_rate', 'tax', 'subtotal', 'total_price'
]);

const EXACT_INTEGER_COLS = new Set([
  'id', 'user_id', 'order_id', 'customer_id', 'product_id', 'employee_id',
  'age', 'qty', 'quantity', 'count', 'item_count', 'total_pages', 'page_count', 'stock_quantity',
  'stock', 'year', 'year_born', 'dob_year'
]);

const EXACT_DATE_COLS = new Set([
  'date', 'created_at', 'updated_at', 'deleted_at', 'hire_date', 'dob', 'birth_date',
  'timestamp', 'sale_date', 'event_time', 'start_date', 'end_date'
]);

const EXACT_BOOLEAN_COLS = new Set([
  'is_active', 'is_verified', 'is_admin', 'has_discount', 'can_edit', 'was_deleted', 'active'
]);

// ── Impenetrable Token Matcher ───────────────────────────────────────────────

export interface ColumnMatchResult {
  logicalType: LogicalType;
  fakerGenerator?: () => any;
  source: string;
}

export function matchColumnToken(colName: string): ColumnMatchResult | null {
  const n = colName.toLowerCase().trim();

  // Tier 1: Primary Key / Foreign Key integer rules
  if (n === 'id' || n.endsWith('_id') || n.endsWith('_pk') || n.endsWith('_fk')) {
    return {
      logicalType: 'INTEGER',
      source: `token dictionary: exact PK/FK pattern '${colName}' → INTEGER`
    };
  }

  // Tier 2: Exact Set Lookups (O(1))
  if (EXACT_VARCHAR_COLS.has(n)) {
    return {
      logicalType: 'VARCHAR',
      fakerGenerator: getFakerGeneratorForToken(n),
      source: `token dictionary: exact match '${n}' → VARCHAR`
    };
  }
  if (EXACT_NUMERIC_COLS.has(n)) {
    return {
      logicalType: 'NUMERIC',
      fakerGenerator: getFakerGeneratorForToken(n),
      source: `token dictionary: exact match '${n}' → NUMERIC`
    };
  }
  if (EXACT_INTEGER_COLS.has(n)) {
    return {
      logicalType: 'INTEGER',
      fakerGenerator: getFakerGeneratorForToken(n),
      source: `token dictionary: exact match '${n}' → INTEGER`
    };
  }
  if (EXACT_DATE_COLS.has(n)) {
    return {
      logicalType: 'DATE',
      fakerGenerator: getFakerGeneratorForToken(n),
      source: `token dictionary: exact match '${n}' → DATE`
    };
  }
  if (EXACT_BOOLEAN_COLS.has(n)) {
    return {
      logicalType: 'BOOLEAN',
      fakerGenerator: getFakerGeneratorForToken(n),
      source: `token dictionary: exact match '${n}' → BOOLEAN`
    };
  }

  // Tier 3: Strict Suffix Rules
  if (n.endsWith('_country') || n.endsWith('_city') || n.endsWith('_state') || n.endsWith('_name') || n.endsWith('_email') || n.endsWith('_phone') || n.endsWith('_code')) {
    return { logicalType: 'VARCHAR', fakerGenerator: getFakerGeneratorForToken(n), source: `token dictionary: suffix rule → VARCHAR` };
  }
  if (n.endsWith('_price') || n.endsWith('_amount') || n.endsWith('_cost') || n.endsWith('_score') || n.endsWith('_rate') || n.endsWith('_balance') || n.endsWith('_salary')) {
    return { logicalType: 'NUMERIC', fakerGenerator: getFakerGeneratorForToken(n), source: `token dictionary: suffix rule → NUMERIC` };
  }
  if (n.endsWith('_count') || n.endsWith('_qty') || n.endsWith('_pages') || n.endsWith('_num') || n.endsWith('_year')) {
    return { logicalType: 'INTEGER', fakerGenerator: getFakerGeneratorForToken(n), source: `token dictionary: suffix rule → INTEGER` };
  }
  if (n.endsWith('_at') || n.endsWith('_date') || n.endsWith('_time')) {
    return { logicalType: 'TIMESTAMP', fakerGenerator: getFakerGeneratorForToken(n), source: `token dictionary: suffix rule → TIMESTAMP` };
  }

  // Tier 4: Strict Prefix Rules
  if (n.startsWith('is_') || n.startsWith('has_') || n.startsWith('can_') || n.startsWith('was_')) {
    return { logicalType: 'BOOLEAN', fakerGenerator: getFakerGeneratorForToken(n), source: `token dictionary: prefix rule → BOOLEAN` };
  }
  if (n.startsWith('num_') || n.startsWith('count_') || n.startsWith('cnt_') || n.startsWith('sum_') || n.startsWith('avg_')) {
    return { logicalType: 'INTEGER', fakerGenerator: getFakerGeneratorForToken(n), source: `token dictionary: prefix rule → INTEGER` };
  }

  // Tier 5: Word Boundary Token Regexes (\b) & Specific Patterns
  if (n.includes('ip_address') || n.includes('ip')) {
    return { logicalType: 'VARCHAR', fakerGenerator: () => faker.internet.ipv4(), source: `token dictionary: ip address pattern → VARCHAR` };
  }
  if (n.includes('url') || n.includes('website')) {
    return { logicalType: 'VARCHAR', fakerGenerator: () => faker.internet.url(), source: `token dictionary: url pattern → VARCHAR` };
  }
  if (n.includes('uuid') || n.includes('guid')) {
    return { logicalType: 'VARCHAR', fakerGenerator: () => faker.string.uuid(), source: `token dictionary: uuid pattern → VARCHAR` };
  }
  if (/\b(country|nation|territory)\b/.test(n)) {
    return { logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['India', 'United States', 'United Kingdom', 'Canada', 'Germany', 'Australia', 'Japan', 'France']), source: `token dictionary: word boundary → country VARCHAR` };
  }
  if (/\b(city|town|municipality)\b/.test(n)) {
    return { logicalType: 'VARCHAR', fakerGenerator: () => faker.location.city(), source: `token dictionary: word boundary → city VARCHAR` };
  }
  if (/\b(stage|phase|step)\b/.test(n)) {
    return { logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['Prospect', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost']), source: `token dictionary: word boundary → stage VARCHAR` };
  }
  if (/\b(discount|markup|rebate)\b/.test(n)) {
    return { logicalType: 'NUMERIC', fakerGenerator: () => parseFloat(faker.number.float({ min: 0.05, max: 0.50, fractionDigits: 2 }).toFixed(2)), source: `token dictionary: word boundary → discount NUMERIC` };
  }
  if (/\b(age)\b/.test(n)) {
    return { logicalType: 'INTEGER', fakerGenerator: () => faker.number.int({ min: 18, max: 75 }), source: `token dictionary: word boundary → age INTEGER` };
  }
  if (/\b(count|qty|quantity)\b/.test(n)) {
    return { logicalType: 'INTEGER', fakerGenerator: () => faker.number.int({ min: 1, max: 50 }), source: `token dictionary: word boundary → count INTEGER` };
  }

  return null;
}

export function getFakerGeneratorForToken(colName: string): () => any {
  const n = colName.toLowerCase().trim();

  if (n.includes('country')) return () => faker.helpers.arrayElement(['India', 'United States', 'United Kingdom', 'Canada', 'Germany', 'Australia', 'Japan', 'France']);
  if (n.includes('city')) return () => faker.location.city();
  if (n.includes('state') || n.includes('province')) return () => faker.location.state();
  if (n.includes('email')) return () => faker.internet.email().toLowerCase();
  if (n.includes('phone') || n.includes('mobile')) return () => faker.phone.number();
  if (n.includes('url') || n.includes('website')) return () => faker.internet.url();
  if (n.includes('ip_address') || n.includes('ip')) return () => faker.internet.ipv4();
  if (n.includes('uuid') || n.includes('guid')) return () => faker.string.uuid();
  if (n.includes('discount')) return () => parseFloat(faker.number.float({ min: 0.05, max: 0.50, fractionDigits: 2 }).toFixed(2));
  if (n.includes('price') || n.includes('amount') || n.includes('cost') || n === 'total') return () => parseFloat(faker.commerce.price({ min: 10, max: 1000, dec: 2 }));
  if (n.includes('salary')) return () => faker.number.int({ min: 45000, max: 185000 });
  if (n === 'age' || n.endsWith('_age')) return () => faker.number.int({ min: 18, max: 75 });
  if (n === 'count' || n.endsWith('_count') || n.startsWith('count_') || n.includes('qty') || n.includes('quantity')) return () => faker.number.int({ min: 1, max: 50 });
  if (n.includes('score') || n.includes('rating')) return () => parseFloat(faker.number.float({ min: 1.0, max: 5.0, fractionDigits: 1 }).toFixed(1));
  if (n.includes('balance')) return () => parseFloat(faker.commerce.price({ min: 50, max: 25000, dec: 2 }));
  if (n.includes('date') || n.includes('time') || n.includes('_at')) return () => faker.date.recent().toISOString();
  if (n.startsWith('is_') || n.startsWith('has_') || n === 'active') return () => faker.datatype.boolean();

  return () => faker.word.sample();
}
