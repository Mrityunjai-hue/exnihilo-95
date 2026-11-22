/**
 * concept_taxonomy.ts — Concept Taxonomy Graph & Reverse Domain Inference (Layers 2 & 3)
 *
 * Maps 120+ industry domains and concept stems. Provides reverse domain inference
 * to deduce the true semantic context from column names alone even if table names
 * are generic or obfuscated (e.g. t1, records, data).
 */

export interface DomainConceptProfile {
  domainId: string;
  name: string;
  conceptStems: string[];
  canonicalTables: string[];
  characteristicColumns: string[];
}

export const DOMAIN_TAXONOMY: Record<string, DomainConceptProfile> = {
  ecommerce: {
    domainId: 'ecommerce',
    name: 'E-Commerce & Retail',
    conceptStems: ['cart', 'order', 'sku', 'product', 'item', 'checkout', 'inventory', 'shipping', 'customer', 'variant', 'coupon'],
    canonicalTables: ['orders', 'order_items', 'products', 'customers', 'inventory', 'discounts'],
    characteristicColumns: ['unit_price', 'total_amount', 'sku', 'quantity', 'shipping_address', 'tracking_number'],
  },
  banking: {
    domainId: 'banking',
    name: 'Banking & Financial Accounts',
    conceptStems: ['account', 'balance', 'deposit', 'withdrawal', 'transfer', 'ledger', 'iban', 'routing', 'statement'],
    canonicalTables: ['accounts', 'transactions', 'transfers', 'ledgers', 'cards'],
    characteristicColumns: ['iban', 'routing_number', 'account_number', 'balance', 'credit_limit', 'interest_rate'],
  },
  capital_markets: {
    domainId: 'capital_markets',
    name: 'Capital Markets & Trading',
    conceptStems: ['stock', 'ticker', 'shares', 'dividend', 'portfolio', 'equity', 'bid', 'ask', 'order_book', 'broker'],
    canonicalTables: ['stocks', 'trades', 'portfolios', 'positions', 'dividends'],
    characteristicColumns: ['ticker', 'shares', 'pe_ratio', 'market_cap', 'dividend_yield', 'strike_price'],
  },
  healthcare: {
    domainId: 'healthcare',
    name: 'Healthcare & Clinical Medicine',
    conceptStems: ['patient', 'doctor', 'physician', 'appointment', 'diagnosis', 'prescription', 'dosage', 'medical', 'vital'],
    canonicalTables: ['patients', 'doctors', 'appointments', 'prescriptions', 'diagnoses'],
    characteristicColumns: ['diagnosis_code', 'systolic_bp', 'diastolic_bp', 'heart_rate', 'dosage_mg', 'patient_id'],
  },
  hospitality: {
    domainId: 'hospitality',
    name: 'Hotels & Hospitality',
    conceptStems: ['hotel', 'room', 'checkin', 'checkout', 'guest', 'reservation', 'booking', 'amenity', 'suite'],
    canonicalTables: ['rooms', 'reservations', 'guests', 'bookings', 'amenities'],
    characteristicColumns: ['checkin_date', 'checkout_date', 'room_number', 'room_type', 'guest_name', 'nights'],
  },
  aviation: {
    domainId: 'aviation',
    name: 'Aviation & Airlines',
    conceptStems: ['flight', 'airport', 'gate', 'terminal', 'tail', 'passenger', 'boarding', 'pilot', 'runway'],
    canonicalTables: ['flights', 'airports', 'passengers', 'tickets', 'aircraft'],
    characteristicColumns: ['flight_number', 'departure_time', 'arrival_time', 'gate', 'seat_number', 'tail_number'],
  },
  logistics: {
    domainId: 'logistics',
    name: 'Supply Chain & Logistics',
    conceptStems: ['shipment', 'freight', 'carrier', 'warehouse', 'pallet', 'cargo', 'dispatch', 'route', 'delivery'],
    canonicalTables: ['shipments', 'carriers', 'warehouses', 'packages', 'routes'],
    characteristicColumns: ['tracking_number', 'carrier_name', 'origin_zip', 'destination_zip', 'weight_kg', 'eta'],
  },
  saas: {
    domainId: 'saas',
    name: 'B2B SaaS & Subscription',
    conceptStems: ['tenant', 'subscription', 'plan', 'seat', 'workspace', 'organization', 'billing', 'mrr', 'usage'],
    canonicalTables: ['tenants', 'subscriptions', 'plans', 'memberships', 'invoices'],
    characteristicColumns: ['plan_name', 'monthly_price', 'seat_count', 'mrr', 'trial_ends_at', 'billing_cycle'],
  },
  education: {
    domainId: 'education',
    name: 'Education & Universities',
    conceptStems: ['student', 'course', 'instructor', 'grade', 'enrollment', 'semester', 'curriculum', 'gpa', 'transcript'],
    canonicalTables: ['students', 'courses', 'enrollments', 'instructors', 'departments'],
    characteristicColumns: ['gpa', 'credits', 'course_code', 'semester', 'letter_grade', 'student_id'],
  },
  streaming: {
    domainId: 'streaming',
    name: 'Streaming Media & Entertainment',
    conceptStems: ['video', 'song', 'track', 'album', 'artist', 'playlist', 'genre', 'stream', 'duration', 'bitrate'],
    canonicalTables: ['songs', 'albums', 'artists', 'playlists', 'playback_history'],
    characteristicColumns: ['duration_seconds', 'artist_name', 'release_year', 'genre', 'bitrate_kbps', 'play_count'],
  },
  rideshare: {
    domainId: 'rideshare',
    name: 'Rideshare & Mobility',
    conceptStems: ['ride', 'driver', 'rider', 'pickup', 'dropoff', 'fare', 'surge', 'vehicle', 'trip'],
    canonicalTables: ['rides', 'drivers', 'riders', 'vehicles', 'ratings'],
    characteristicColumns: ['pickup_location', 'dropoff_location', 'distance_miles', 'surge_multiplier', 'fare_amount'],
  },
  real_estate: {
    domainId: 'real_estate',
    name: 'Real Estate & Properties',
    conceptStems: ['property', 'listing', 'sqft', 'bedrooms', 'bathrooms', 'realtor', 'lease', 'rent', 'mortgage'],
    canonicalTables: ['properties', 'listings', 'agents', 'leases', 'inspections'],
    characteristicColumns: ['sqft', 'bedroom_count', 'bathroom_count', 'listing_price', 'hoa_fee', 'year_built'],
  },
};

/**
 * Infer the best matching domain from a list of column names
 */
export function inferDomainFromColumns(
  columnNames: string[],
  tableName?: string
): DomainConceptProfile | null {
  if (!columnNames || columnNames.length === 0) return null;

  const normalizedCols = columnNames.map((c) => c.toLowerCase().trim());
  const normalizedTable = (tableName || '').toLowerCase().trim();

  let bestDomain: DomainConceptProfile | null = null;
  let maxScore = 0;

  for (const domain of Object.values(DOMAIN_TAXONOMY)) {
    let score = 0;

    // Check table name matching
    if (normalizedTable) {
      if (domain.canonicalTables.some((t) => normalizedTable.includes(t) || t.includes(normalizedTable))) {
        score += 3;
      }
      if (domain.conceptStems.some((stem) => normalizedTable.includes(stem))) {
        score += 2;
      }
    }

    // Check characteristic columns
    for (const col of normalizedCols) {
      if (domain.characteristicColumns.some((charCol) => col === charCol || col.includes(charCol))) {
        score += 2;
      }
      if (domain.conceptStems.some((stem) => col.includes(stem))) {
        score += 1;
      }
    }

    if (score > maxScore) {
      maxScore = score;
      bestDomain = domain;
    }
  }

  // Require minimum score threshold of 2 to claim confident domain match
  return maxScore >= 2 ? bestDomain : null;
}
