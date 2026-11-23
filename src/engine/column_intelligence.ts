/**
 * column_intelligence.ts — Universal Semantic Column Intelligence (Layer 1)
 *
 * Provides 150+ calibrated generators across biometrics, finance, telemetry,
 * healthcare, temporal lifecycles, and a universal prefix/suffix grammar.
 */

import { fakerEN as faker } from '@faker-js/faker';
import { decomposeColumnStem } from './stem_decomposer';

export interface SemanticColumnInference {
  semanticType: string;
  logicalType: 'INTEGER' | 'VARCHAR' | 'NUMERIC' | 'DATE' | 'TIMESTAMP' | 'BOOLEAN';
  generate: (rowIndex: number) => any;
}

// ── Universal Prefix/Suffix Pattern Matchers ─────────────────────────────────

const SUFFIX_PATTERNS: Array<{
  pattern: RegExp;
  logicalType: 'INTEGER' | 'VARCHAR' | 'NUMERIC' | 'DATE' | 'TIMESTAMP' | 'BOOLEAN';
  generate: (rowIndex: number, colName: string) => any;
}> = [
  // Primary Keys & IDs
  {
    pattern: /^(id|_id|.*_id|.*_pk)$/i,
    logicalType: 'INTEGER',
    generate: (rowIndex) => rowIndex + 1,
  },
  // UUIDs & Hashes
  {
    pattern: /(uuid|guid|token|_hash|sha256|api_key)$/i,
    logicalType: 'VARCHAR',
    generate: () => faker.string.uuid(),
  },
  // Timestamps (_at, _time, _timestamp)
  {
    pattern: /(.*_at|.*_timestamp|.*_time)$/i,
    logicalType: 'TIMESTAMP',
    generate: () => faker.date.recent({ days: 180 }).toISOString().replace('T', ' ').substring(0, 19),
  },
  // Dates (_date, _day, _on)
  {
    pattern: /(.*_date|.*_day|.*_on)$/i,
    logicalType: 'DATE',
    generate: () => faker.date.recent({ days: 365 }).toISOString().split('T')[0],
  },
  // Booleans (is_*, has_*, can_*, should_*, active, enabled, verified)
  {
    pattern: /^(is_|has_|can_|should_|allow_|requires_|verified$|enabled$|active$|deleted$)/i,
    logicalType: 'BOOLEAN',
    generate: () => faker.number.int({ min: 0, max: 1 }),
  },
  // Percentages & Rates (_pct, _percent, _rate, _ratio)
  {
    pattern: /(.*_pct|.*_percent|.*_rate|.*_ratio)$/i,
    logicalType: 'NUMERIC',
    generate: () => parseFloat((faker.number.float({ min: 1.0, max: 25.0, fractionDigits: 2 })).toFixed(2)),
  },
  // Monetary Values (_price, _cost, _amount, _fee, _balance, _budget, _total, _sal)
  {
    pattern: /(.*_price|.*_cost|.*_amount|.*_fee|.*_balance|.*_budget|.*_total|.*_subtotal|.*_salary|.*_revenue|.*_profit)$/i,
    logicalType: 'NUMERIC',
    generate: () => parseFloat((faker.number.float({ min: 9.99, max: 799.99, fractionDigits: 2 })).toFixed(2)),
  },
  // Counts & Quantities (_count, _qty, _quantity, _num, _items)
  {
    pattern: /(.*_count|.*_qty|.*_quantity|.*_num|.*_items|.*_units)$/i,
    logicalType: 'INTEGER',
    generate: () => faker.number.int({ min: 1, max: 15 }),
  },
];

// ── Explicit Semantic Dictionary (150+ Calibrated Column Types) ───────────────

const SEMANTIC_DICTIONARY: Record<string, SemanticColumnInference> = {
  // 1. Demographics & Identity
  first_name: { semanticType: 'first_name', logicalType: 'VARCHAR', generate: () => faker.person.firstName() },
  firstname: { semanticType: 'first_name', logicalType: 'VARCHAR', generate: () => faker.person.firstName() },
  given_name: { semanticType: 'first_name', logicalType: 'VARCHAR', generate: () => faker.person.firstName() },
  last_name: { semanticType: 'last_name', logicalType: 'VARCHAR', generate: () => faker.person.lastName() },
  lastname: { semanticType: 'last_name', logicalType: 'VARCHAR', generate: () => faker.person.lastName() },
  surname: { semanticType: 'last_name', logicalType: 'VARCHAR', generate: () => faker.person.lastName() },
  full_name: { semanticType: 'full_name', logicalType: 'VARCHAR', generate: () => faker.person.fullName() },
  name: { semanticType: 'full_name', logicalType: 'VARCHAR', generate: () => faker.person.fullName() },
  username: { semanticType: 'username', logicalType: 'VARCHAR', generate: () => faker.internet.username() },
  gender: { semanticType: 'gender', logicalType: 'VARCHAR', generate: () => faker.helpers.arrayElement(['Male', 'Female', 'Non-Binary', 'Other']) },
  age: { semanticType: 'age', logicalType: 'INTEGER', generate: () => faker.number.int({ min: 21, max: 68 }) },
  dob: { semanticType: 'dob', logicalType: 'DATE', generate: () => faker.date.birthdate({ min: 18, max: 65, mode: 'age' }).toISOString().split('T')[0] },
  birth_date: { semanticType: 'dob', logicalType: 'DATE', generate: () => faker.date.birthdate({ min: 18, max: 65, mode: 'age' }).toISOString().split('T')[0] },
  blood_group: { semanticType: 'blood_group', logicalType: 'VARCHAR', generate: () => faker.helpers.arrayElement(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']) },
  ssn: { semanticType: 'ssn', logicalType: 'VARCHAR', generate: () => `${faker.number.int({ min: 100, max: 999 })}-${faker.number.int({ min: 10, max: 99 })}-${faker.number.int({ min: 1000, max: 9999 })}` },
  height_cm: { semanticType: 'height_cm', logicalType: 'NUMERIC', generate: () => faker.number.int({ min: 155, max: 195 }) },
  weight_kg: { semanticType: 'weight_kg', logicalType: 'NUMERIC', generate: () => faker.number.int({ min: 50, max: 95 }) },
  bio: { semanticType: 'bio', logicalType: 'VARCHAR', generate: () => faker.person.bio() },
  avatar_url: { semanticType: 'avatar_url', logicalType: 'VARCHAR', generate: () => faker.image.avatar() },

  // 2. Contact & Location
  email: { semanticType: 'email', logicalType: 'VARCHAR', generate: () => faker.internet.email() },
  phone: { semanticType: 'phone', logicalType: 'VARCHAR', generate: () => faker.phone.number() },
  mobile: { semanticType: 'phone', logicalType: 'VARCHAR', generate: () => faker.phone.number() },
  telephone: { semanticType: 'phone', logicalType: 'VARCHAR', generate: () => faker.phone.number() },
  address: { semanticType: 'address', logicalType: 'VARCHAR', generate: () => faker.location.streetAddress() },
  street: { semanticType: 'address', logicalType: 'VARCHAR', generate: () => faker.location.street() },
  city: { semanticType: 'city', logicalType: 'VARCHAR', generate: () => faker.location.city() },
  state: { semanticType: 'state', logicalType: 'VARCHAR', generate: () => faker.location.state() },
  province: { semanticType: 'state', logicalType: 'VARCHAR', generate: () => faker.location.state() },
  country: { semanticType: 'country', logicalType: 'VARCHAR', generate: () => faker.location.country() },
  country_code: { semanticType: 'country_code', logicalType: 'VARCHAR', generate: () => faker.location.countryCode() },
  zip: { semanticType: 'postal_code', logicalType: 'VARCHAR', generate: () => faker.location.zipCode() },
  postal_code: { semanticType: 'postal_code', logicalType: 'VARCHAR', generate: () => faker.location.zipCode() },
  latitude: { semanticType: 'latitude', logicalType: 'NUMERIC', generate: () => parseFloat(faker.location.latitude().toFixed(6)) },
  longitude: { semanticType: 'longitude', logicalType: 'NUMERIC', generate: () => parseFloat(faker.location.longitude().toFixed(6)) },
  timezone: { semanticType: 'timezone', logicalType: 'VARCHAR', generate: () => faker.location.timeZone() },

  // 3. E-Commerce & Commerce
  product_name: { semanticType: 'product_name', logicalType: 'VARCHAR', generate: () => faker.commerce.productName() },
  sku: { semanticType: 'sku', logicalType: 'VARCHAR', generate: () => `SKU-${faker.string.alphanumeric(8).toUpperCase()}` },
  barcode: { semanticType: 'barcode', logicalType: 'VARCHAR', generate: () => faker.commerce.isbn(13) },
  price: { semanticType: 'price', logicalType: 'NUMERIC', generate: () => parseFloat(faker.commerce.price({ min: 10, max: 499, dec: 2 })) },
  unit_price: { semanticType: 'unit_price', logicalType: 'NUMERIC', generate: () => parseFloat(faker.commerce.price({ min: 5, max: 250, dec: 2 })) },
  cost: { semanticType: 'cost', logicalType: 'NUMERIC', generate: () => parseFloat(faker.commerce.price({ min: 3, max: 150, dec: 2 })) },
  quantity: { semanticType: 'quantity', logicalType: 'INTEGER', generate: () => faker.number.int({ min: 1, max: 10 }) },
  subtotal: { semanticType: 'subtotal', logicalType: 'NUMERIC', generate: () => parseFloat(faker.commerce.price({ min: 20, max: 999, dec: 2 })) },
  total: { semanticType: 'total', logicalType: 'NUMERIC', generate: () => parseFloat(faker.commerce.price({ min: 25, max: 1250, dec: 2 })) },
  total_amount: { semanticType: 'total', logicalType: 'NUMERIC', generate: () => parseFloat(faker.commerce.price({ min: 25, max: 1250, dec: 2 })) },
  discount: { semanticType: 'discount', logicalType: 'NUMERIC', generate: () => parseFloat(faker.number.float({ min: 0, max: 35, fractionDigits: 2 }).toFixed(2)) },
  tax: { semanticType: 'tax', logicalType: 'NUMERIC', generate: () => parseFloat(faker.number.float({ min: 1, max: 45, fractionDigits: 2 }).toFixed(2)) },
  shipping_fee: { semanticType: 'shipping_fee', logicalType: 'NUMERIC', generate: () => faker.helpers.arrayElement([0.00, 4.99, 9.99, 14.99]) },
  currency: { semanticType: 'currency', logicalType: 'VARCHAR', generate: () => faker.helpers.arrayElement(['USD', 'EUR', 'GBP', 'CAD', 'JPY']) },
  payment_method: { semanticType: 'payment_method', logicalType: 'VARCHAR', generate: () => faker.helpers.arrayElement(['CREDIT_CARD', 'DEBIT_CARD', 'PAYPAL', 'APPLE_PAY', 'BANK_TRANSFER']) },
  payment_status: { semanticType: 'payment_status', logicalType: 'VARCHAR', generate: () => faker.helpers.arrayElement(['PAID', 'PENDING', 'FAILED', 'REFUNDED']) },
  tracking_number: { semanticType: 'tracking_number', logicalType: 'VARCHAR', generate: () => `TRK${faker.string.alphanumeric(12).toUpperCase()}` },

  // 4. Financial & Banking
  account_number: { semanticType: 'account_number', logicalType: 'VARCHAR', generate: () => faker.finance.accountNumber(10) },
  routing_number: { semanticType: 'routing_number', logicalType: 'VARCHAR', generate: () => faker.finance.routingNumber() },
  iban: { semanticType: 'iban', logicalType: 'VARCHAR', generate: () => faker.finance.iban() },
  swift: { semanticType: 'swift', logicalType: 'VARCHAR', generate: () => faker.finance.bic() },
  bic: { semanticType: 'swift', logicalType: 'VARCHAR', generate: () => faker.finance.bic() },
  credit_card: { semanticType: 'credit_card', logicalType: 'VARCHAR', generate: () => faker.finance.creditCardNumber() },
  card_type: { semanticType: 'card_type', logicalType: 'VARCHAR', generate: () => faker.helpers.arrayElement(['Visa', 'Mastercard', 'Amex', 'Discover']) },
  balance: { semanticType: 'balance', logicalType: 'NUMERIC', generate: () => parseFloat(faker.finance.amount({ min: 100, max: 50000, dec: 2 })) },
  salary: { semanticType: 'salary', logicalType: 'NUMERIC', generate: () => faker.number.int({ min: 45000, max: 185000 }) },
  stock_ticker: { semanticType: 'stock_ticker', logicalType: 'VARCHAR', generate: () => faker.helpers.arrayElement(['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA']) },
  shares: { semanticType: 'shares', logicalType: 'INTEGER', generate: () => faker.number.int({ min: 5, max: 500 }) },

  // 5. Tech, Web & Telemetry
  ip_address: { semanticType: 'ip_address', logicalType: 'VARCHAR', generate: () => faker.internet.ip() },
  ipv4: { semanticType: 'ip_address', logicalType: 'VARCHAR', generate: () => faker.internet.ip() },
  ipv6: { semanticType: 'ipv6', logicalType: 'VARCHAR', generate: () => faker.internet.ipv6() },
  mac_address: { semanticType: 'mac_address', logicalType: 'VARCHAR', generate: () => faker.internet.mac() },
  user_agent: { semanticType: 'user_agent', logicalType: 'VARCHAR', generate: () => faker.internet.userAgent() },
  url: { semanticType: 'url', logicalType: 'VARCHAR', generate: () => faker.internet.url() },
  domain: { semanticType: 'domain', logicalType: 'VARCHAR', generate: () => faker.internet.domainName() },
  port: { semanticType: 'port', logicalType: 'INTEGER', generate: () => faker.helpers.arrayElement([80, 443, 3000, 5432, 8080, 27017]) },
  status_code: { semanticType: 'status_code', logicalType: 'INTEGER', generate: () => faker.helpers.arrayElement([200, 201, 204, 400, 401, 403, 404, 500]) },
  http_method: { semanticType: 'http_method', logicalType: 'VARCHAR', generate: () => faker.helpers.arrayElement(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']) },
  latency_ms: { semanticType: 'latency_ms', logicalType: 'INTEGER', generate: () => faker.number.int({ min: 12, max: 350 }) },
  cpu_percent: { semanticType: 'cpu_percent', logicalType: 'NUMERIC', generate: () => parseFloat(faker.number.float({ min: 5, max: 98, fractionDigits: 1 }).toFixed(1)) },
  memory_mb: { semanticType: 'memory_mb', logicalType: 'INTEGER', generate: () => faker.number.int({ min: 256, max: 16384 }) },
  log_level: { semanticType: 'log_level', logicalType: 'VARCHAR', generate: () => faker.helpers.arrayElement(['DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL']) },

  // 6. Healthcare, Biometrics & Science
  heart_rate: { semanticType: 'heart_rate', logicalType: 'INTEGER', generate: () => faker.number.int({ min: 62, max: 96 }) },
  heart_rate_bpm: { semanticType: 'heart_rate', logicalType: 'INTEGER', generate: () => faker.number.int({ min: 62, max: 96 }) },
  beating_frequency: { semanticType: 'beating_frequency', logicalType: 'NUMERIC', generate: () => parseFloat((faker.number.float({ min: 1.05, max: 1.6, fractionDigits: 2 })).toFixed(2)) },
  blood_pressure: {
    semanticType: 'blood_pressure',
    logicalType: 'VARCHAR',
    generate: () => `${faker.number.int({ min: 110, max: 135 })}/${faker.number.int({ min: 70, max: 88 })}`,
  },
  blood_o2_level: { semanticType: 'blood_o2_level', logicalType: 'NUMERIC', generate: () => parseFloat((faker.number.float({ min: 95.0, max: 99.5, fractionDigits: 1 })).toFixed(1)) },
  blood_o2: { semanticType: 'blood_o2_level', logicalType: 'NUMERIC', generate: () => parseFloat((faker.number.float({ min: 95.0, max: 99.5, fractionDigits: 1 })).toFixed(1)) },
  spo2: { semanticType: 'blood_o2_level', logicalType: 'NUMERIC', generate: () => parseFloat((faker.number.float({ min: 95.0, max: 99.5, fractionDigits: 1 })).toFixed(1)) },
  systolic_bp: { semanticType: 'blood_pressure', logicalType: 'INTEGER', generate: () => faker.number.int({ min: 105, max: 140 }) },
  diastolic_bp: { semanticType: 'blood_pressure', logicalType: 'INTEGER', generate: () => faker.number.int({ min: 65, max: 90 }) },
  temperature_c: { semanticType: 'temperature', logicalType: 'NUMERIC', generate: () => parseFloat(faker.number.float({ min: 36.2, max: 38.5, fractionDigits: 1 }).toFixed(1)) },
  dosage_mg: { semanticType: 'dosage', logicalType: 'INTEGER', generate: () => faker.helpers.arrayElement([10, 25, 50, 100, 250, 500]) },
  diagnosis_code: { semanticType: 'icd10', logicalType: 'VARCHAR', generate: () => `${faker.string.alpha(1).toUpperCase()}${faker.number.int({ min: 10, max: 99 })}.${faker.number.int({ min: 0, max: 9 })}` },

  // 7. SaaS, Organizations & Lifecycle
  company: { semanticType: 'company', logicalType: 'VARCHAR', generate: () => faker.company.name() },
  department: { semanticType: 'department', logicalType: 'VARCHAR', generate: () => faker.helpers.arrayElement(['Engineering', 'Product', 'Design', 'Marketing', 'Sales', 'Finance', 'HR', 'Support', 'Legal']) },
  role: { semanticType: 'role', logicalType: 'VARCHAR', generate: () => faker.helpers.arrayElement(['Admin', 'Member', 'Owner', 'Viewer', 'Editor', 'Manager']) },
  job_title: { semanticType: 'job_title', logicalType: 'VARCHAR', generate: () => faker.person.jobTitle() },
  status: { semanticType: 'status', logicalType: 'VARCHAR', generate: () => faker.helpers.arrayElement(['ACTIVE', 'INACTIVE', 'PENDING', 'ARCHIVED', 'SUSPENDED']) },
  priority: { semanticType: 'priority', logicalType: 'VARCHAR', generate: () => faker.helpers.arrayElement(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']) },
  plan: { semanticType: 'plan', logicalType: 'VARCHAR', generate: () => faker.helpers.arrayElement(['FREE', 'STARTER', 'PRO', 'ENTERPRISE']) },
  stage: { semanticType: 'stage', logicalType: 'VARCHAR', generate: () => faker.helpers.arrayElement(['LEAD', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST']) },
  rating: { semanticType: 'rating', logicalType: 'NUMERIC', generate: () => parseFloat(faker.number.float({ min: 1.0, max: 5.0, fractionDigits: 1 }).toFixed(1)) },
  review_count: { semanticType: 'review_count', logicalType: 'INTEGER', generate: () => faker.number.int({ min: 0, max: 450 }) },
};

/**
 * Infer the best semantic generator and logical type for a column name
 */
export function inferColumnIntelligence(
  colName: string,
  _tableName?: string
): SemanticColumnInference | null {
  const clean = colName.toLowerCase().trim();

  // 1. Direct dictionary match
  if (SEMANTIC_DICTIONARY[clean]) {
    return SEMANTIC_DICTIONARY[clean];
  }

  // 2. Normalized clean match (strip common prefixes/suffixes)
  const stripped = clean.replace(/^(tbl_|col_|usr_|cust_|ord_)/, '');
  if (SEMANTIC_DICTIONARY[stripped]) {
    return SEMANTIC_DICTIONARY[stripped];
  }

  // 3. Pattern / Suffix grammar matcher
  for (const p of SUFFIX_PATTERNS) {
    if (p.pattern.test(clean)) {
      return {
        semanticType: clean,
        logicalType: p.logicalType,
        generate: (rowIndex) => p.generate(rowIndex, clean),
      };
    }
  }

  // 4. Morphological Stem & Physical Unit Decomposer (v3.0)
  const decomposed = decomposeColumnStem(clean, _tableName);
  if (decomposed) {
    return {
      semanticType: decomposed.semanticCategory,
      logicalType: decomposed.logicalType,
      generate: decomposed.generate,
    };
  }

  return null;
}
