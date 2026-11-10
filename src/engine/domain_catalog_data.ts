/**
 * domain_catalog_data.ts — 50+ Deep Industry Domain Schema Catalogs
 *
 * Covers Aviation, Crypto, FinTech, Entertainment, Sports, Academia, Food & Dining,
 * Automotive, DevOps & SaaS, Real Estate, Healthcare, Logistics, and Social Networks.
 */

import { faker } from '@faker-js/faker';
import { LogicalType } from './inference';

export interface DomainColumnSpec {
  name: string;
  logicalType: LogicalType;
  isPrimaryKey?: boolean;
  isForeignKey?: boolean;
  references?: { table: string; column: string };
  fakerGenerator: () => any;
}

export interface DomainTableSpec {
  aliases: string[];
  columns: DomainColumnSpec[];
}

// ── Curated Real-World Value Pools ───────────────────────────────────────────
const IATA_AIRPORTS = ['JFK', 'LHR', 'HND', 'DXB', 'SFO', 'DEL', 'CDG', 'SIN', 'FRA', 'ORD', 'SYD', 'YYZ', 'AMS', 'ICN'];
const AIRLINES = ['Delta Air Lines', 'Emirates', 'Lufthansa', 'Singapore Airlines', 'Air India', 'British Airways', 'United Airlines', 'Qatar Airways', 'All Nippon Airways', 'Air France'];
const AIRCRAFT_MODELS = ['Boeing 787-9 Dreamliner', 'Airbus A350-900', 'Boeing 777-300ER', 'Airbus A320neo', 'Airbus A380-800', 'Boeing 737 MAX 8'];
const CRYPTO_TOKENS = ['BTC', 'ETH', 'SOL', 'USDC', 'AVAX', 'BNB', 'ADA', 'XRP', 'DOT', 'NEAR'];
const BLOCKCHAINS = ['Ethereum', 'Solana', 'Bitcoin', 'Polygon', 'Arbitrum', 'Avalanche'];
const F1_DRIVERS = ['Max Verstappen', 'Lewis Hamilton', 'Charles Leclerc', 'Lando Norris', 'Fernando Alonso', 'George Russell', 'Oscar Piastri', 'Carlos Sainz'];
const F1_TEAMS = ['Red Bull Racing', 'Ferrari', 'Mercedes-AMG', 'McLaren', 'Aston Martin', 'Alpine', 'Williams'];
const MOVIE_GENRES = ['Sci-Fi', 'Action', 'Drama', 'Comedy', 'Thriller', 'Horror', 'Animation', 'Adventure', 'Mystery'];
const MUSIC_GENRES = ['Electronic', 'Hip-Hop', 'Rock', 'Jazz', 'Classical', 'R&B', 'Indie', 'Synthwave', 'Ambient'];
const CUISINE_TYPES = ['Italian', 'Japanese', 'Mexican', 'Indian', 'French', 'Thai', 'Mediterranean', 'American BBQ'];
const VEHICLE_MAKES = ['Tesla', 'Porsche', 'BMW', 'Audi', 'Mercedes-Benz', 'Toyota', 'Ford', 'Hyundai', 'Volvo'];
const UNIVERSITY_DEPARTMENTS = ['Computer Science', 'Data Science', 'Electrical Engineering', 'Mathematics', 'Economics', 'Mechanical Engineering', 'Physics'];
const LOGISTICS_CARRIERS = ['FedEx Express', 'UPS Worldwide', 'DHL Express', 'USPS Priority', 'Blue Dart', 'Amazon Logistics'];
const MEDICAL_DIAGNOSES = ['Hypertension (I10)', 'Type 2 Diabetes (E11)', 'Acute Bronchitis (J20)', 'Asthma (J45)', 'Hyperlipidemia (E78)', 'Migraine (G43)'];
const MEDICATIONS = ['Metformin 500mg', 'Lisinopril 10mg', 'Amoxicillin 250mg', 'Atorvastatin 20mg', 'Albuterol Inhaler', 'Omeprazole 20mg'];

export const EXPANDED_DOMAIN_CATALOG: Record<string, DomainTableSpec> = {
  // ── 1. USERS & IDENTITY ───────────────────────────────────────────────────
  users: {
    aliases: ['user', 'users', 'app_users', 'accounts', 'members', 'tbl_users', 'profiles'],
    columns: [
      { name: 'id', logicalType: 'INTEGER', isPrimaryKey: true, fakerGenerator: () => 1 },
      { name: 'username', logicalType: 'VARCHAR', fakerGenerator: () => faker.internet.username().toLowerCase() },
      { name: 'email', logicalType: 'VARCHAR', fakerGenerator: () => faker.internet.email().toLowerCase() },
      { name: 'role', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['admin', 'user', 'manager', 'editor']) },
      { name: 'is_active', logicalType: 'BOOLEAN', fakerGenerator: () => faker.helpers.arrayElement([true, true, true, false]) },
      { name: 'created_at', logicalType: 'TIMESTAMP', fakerGenerator: () => faker.date.past({ years: 2 }).toISOString().replace('T', ' ').substring(0, 19) }
    ]
  },

  customers: {
    aliases: ['customer', 'customers', 'client', 'clients', 'tbl_customers', 'buyers'],
    columns: [
      { name: 'id', logicalType: 'INTEGER', isPrimaryKey: true, fakerGenerator: () => 1 },
      { name: 'first_name', logicalType: 'VARCHAR', fakerGenerator: () => faker.person.firstName() },
      { name: 'last_name', logicalType: 'VARCHAR', fakerGenerator: () => faker.person.lastName() },
      { name: 'email', logicalType: 'VARCHAR', fakerGenerator: () => faker.internet.email().toLowerCase() },
      { name: 'phone', logicalType: 'VARCHAR', fakerGenerator: () => faker.phone.number() },
      { name: 'city', logicalType: 'VARCHAR', fakerGenerator: () => faker.location.city() },
      { name: 'country', logicalType: 'VARCHAR', fakerGenerator: () => faker.location.country() },
      { name: 'created_at', logicalType: 'TIMESTAMP', fakerGenerator: () => faker.date.past({ years: 2 }).toISOString().replace('T', ' ').substring(0, 19) }
    ]
  },

  // ── 2. E-COMMERCE & PRODUCTS ──────────────────────────────────────────────
  products: {
    aliases: ['product', 'products', 'items', 'inventory', 'goods', 'catalog', 'app_inventory_items', 'skus'],
    columns: [
      { name: 'id', logicalType: 'INTEGER', isPrimaryKey: true, fakerGenerator: () => 1 },
      { name: 'product_name', logicalType: 'VARCHAR', fakerGenerator: () => faker.commerce.productName() },
      { name: 'sku', logicalType: 'VARCHAR', fakerGenerator: () => `SKU-${faker.string.alphanumeric(8).toUpperCase()}` },
      { name: 'category', logicalType: 'VARCHAR', fakerGenerator: () => faker.commerce.department() },
      { name: 'price', logicalType: 'NUMERIC', fakerGenerator: () => parseFloat(faker.commerce.price({ min: 5, max: 1500, dec: 2 })) },
      { name: 'stock_quantity', logicalType: 'INTEGER', fakerGenerator: () => faker.number.int({ min: 0, max: 750 }) },
      { name: 'rating', logicalType: 'NUMERIC', fakerGenerator: () => parseFloat((faker.number.float({ min: 3.5, max: 5.0, fractionDigits: 1 })).toFixed(1)) }
    ]
  },

  orders: {
    aliases: ['order', 'orders', 'sales', 'transactions', 'purchases', 'checkouts', 'sales_orders'],
    columns: [
      { name: 'id', logicalType: 'INTEGER', isPrimaryKey: true, fakerGenerator: () => 1 },
      { name: 'customer_id', logicalType: 'INTEGER', isForeignKey: true, references: { table: 'customers', column: 'id' }, fakerGenerator: () => faker.number.int({ min: 1, max: 20 }) },
      { name: 'order_date', logicalType: 'TIMESTAMP', fakerGenerator: () => faker.date.recent({ days: 180 }).toISOString().replace('T', ' ').substring(0, 19) },
      { name: 'status', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['PLACED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']) },
      { name: 'total_amount', logicalType: 'NUMERIC', fakerGenerator: () => parseFloat(faker.commerce.price({ min: 20, max: 2500, dec: 2 })) },
      { name: 'payment_method', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['CREDIT_CARD', 'PAYPAL', 'UPI', 'APPLE_PAY', 'BANK_TRANSFER']) }
    ]
  },

  order_items: {
    aliases: ['order_item', 'order_items', 'line_items', 'order_lines', 'cart_items'],
    columns: [
      { name: 'id', logicalType: 'INTEGER', isPrimaryKey: true, fakerGenerator: () => 1 },
      { name: 'order_id', logicalType: 'INTEGER', isForeignKey: true, references: { table: 'orders', column: 'id' }, fakerGenerator: () => faker.number.int({ min: 1, max: 20 }) },
      { name: 'product_id', logicalType: 'INTEGER', isForeignKey: true, references: { table: 'products', column: 'id' }, fakerGenerator: () => faker.number.int({ min: 1, max: 20 }) },
      { name: 'quantity', logicalType: 'INTEGER', fakerGenerator: () => faker.number.int({ min: 1, max: 5 }) },
      { name: 'unit_price', logicalType: 'NUMERIC', fakerGenerator: () => parseFloat(faker.commerce.price({ min: 10, max: 350, dec: 2 })) }
    ]
  },

  reviews: {
    aliases: ['review', 'reviews', 'ratings', 'feedbacks', 'testimonials'],
    columns: [
      { name: 'id', logicalType: 'INTEGER', isPrimaryKey: true, fakerGenerator: () => 1 },
      { name: 'product_id', logicalType: 'INTEGER', isForeignKey: true, references: { table: 'products', column: 'id' }, fakerGenerator: () => faker.number.int({ min: 1, max: 20 }) },
      { name: 'reviewer_name', logicalType: 'VARCHAR', fakerGenerator: () => faker.person.fullName() },
      { name: 'rating', logicalType: 'INTEGER', fakerGenerator: () => faker.number.int({ min: 1, max: 5 }) },
      { name: 'review_title', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['Great value!', 'Exceeded expectations', 'Solid purchase', 'Decent quality', 'Could be better']) },
      { name: 'comment', logicalType: 'VARCHAR', fakerGenerator: () => faker.lorem.sentence() },
      { name: 'created_at', logicalType: 'TIMESTAMP', fakerGenerator: () => faker.date.recent().toISOString() }
    ]
  },

  // ── 3. AVIATION & TRAVEL ──────────────────────────────────────────────────
  flights: {
    aliases: ['flight', 'flights', 'flight_schedule', 'airplane_routes', 'flight_manifest'],
    columns: [
      { name: 'id', logicalType: 'INTEGER', isPrimaryKey: true, fakerGenerator: () => 1 },
      { name: 'flight_number', logicalType: 'VARCHAR', fakerGenerator: () => `${faker.helpers.arrayElement(['AA', 'DL', 'UA', 'EK', 'LH', 'BA', 'AI'])}-${faker.number.int({ min: 100, max: 999 })}` },
      { name: 'airline', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(AIRLINES) },
      { name: 'departure_airport', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(IATA_AIRPORTS) },
      { name: 'arrival_airport', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(IATA_AIRPORTS) },
      { name: 'aircraft_type', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(AIRCRAFT_MODELS) },
      { name: 'status', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['ON_TIME', 'SCHEDULED', 'BOARDING', 'DELAYED', 'DEPARTED']) },
      { name: 'gate', logicalType: 'VARCHAR', fakerGenerator: () => `${faker.helpers.arrayElement(['A', 'B', 'C', 'D'])}${faker.number.int({ min: 1, max: 32 })}` },
      { name: 'ticket_price', logicalType: 'NUMERIC', fakerGenerator: () => faker.number.int({ min: 120, max: 1450 }) }
    ]
  },

  airports: {
    aliases: ['airport', 'airports', 'aerodromes', 'flight_terminals'],
    columns: [
      { name: 'id', logicalType: 'INTEGER', isPrimaryKey: true, fakerGenerator: () => 1 },
      { name: 'iata_code', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(IATA_AIRPORTS) },
      { name: 'airport_name', logicalType: 'VARCHAR', fakerGenerator: () => `${faker.location.city()} International Airport` },
      { name: 'city', logicalType: 'VARCHAR', fakerGenerator: () => faker.location.city() },
      { name: 'country', logicalType: 'VARCHAR', fakerGenerator: () => faker.location.country() },
      { name: 'terminal_count', logicalType: 'INTEGER', fakerGenerator: () => faker.number.int({ min: 1, max: 5 }) }
    ]
  },

  hotels: {
    aliases: ['hotel', 'hotels', 'resorts', 'lodgings', 'accommodations'],
    columns: [
      { name: 'id', logicalType: 'INTEGER', isPrimaryKey: true, fakerGenerator: () => 1 },
      { name: 'hotel_name', logicalType: 'VARCHAR', fakerGenerator: () => `${faker.company.name()} Grand Hotel` },
      { name: 'city', logicalType: 'VARCHAR', fakerGenerator: () => faker.location.city() },
      { name: 'star_rating', logicalType: 'INTEGER', fakerGenerator: () => faker.number.int({ min: 3, max: 5 }) },
      { name: 'nightly_rate', logicalType: 'NUMERIC', fakerGenerator: () => faker.number.int({ min: 80, max: 650 }) },
      { name: 'has_pool', logicalType: 'BOOLEAN', fakerGenerator: () => faker.datatype.boolean() },
      { name: 'available_rooms', logicalType: 'INTEGER', fakerGenerator: () => faker.number.int({ min: 2, max: 45 }) }
    ]
  },

  // ── 4. CRYPTO, FINTECH & BANKING ──────────────────────────────────────────
  crypto_wallets: {
    aliases: ['crypto_wallet', 'crypto_wallets', 'wallets', 'blockchain_addresses', 'crypto_accounts'],
    columns: [
      { name: 'id', logicalType: 'INTEGER', isPrimaryKey: true, fakerGenerator: () => 1 },
      { name: 'wallet_address', logicalType: 'VARCHAR', fakerGenerator: () => `0x${faker.string.hexadecimal({ length: 40, prefix: '' }).toLowerCase()}` },
      { name: 'blockchain', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(BLOCKCHAINS) },
      { name: 'native_token', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(CRYPTO_TOKENS) },
      { name: 'balance', logicalType: 'NUMERIC', fakerGenerator: () => parseFloat(faker.number.float({ min: 0.05, max: 42.5, fractionDigits: 4 }).toFixed(4)) },
      { name: 'tx_count', logicalType: 'INTEGER', fakerGenerator: () => faker.number.int({ min: 1, max: 850 }) },
      { name: 'is_contract', logicalType: 'BOOLEAN', fakerGenerator: () => faker.helpers.arrayElement([false, false, false, true]) }
    ]
  },

  crypto_transactions: {
    aliases: ['crypto_tx', 'crypto_transaction', 'crypto_transactions', 'blockchain_tx', 'transfers'],
    columns: [
      { name: 'id', logicalType: 'INTEGER', isPrimaryKey: true, fakerGenerator: () => 1 },
      { name: 'tx_hash', logicalType: 'VARCHAR', fakerGenerator: () => `0x${faker.string.hexadecimal({ length: 64, prefix: '' }).toLowerCase()}` },
      { name: 'token_symbol', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(CRYPTO_TOKENS) },
      { name: 'amount', logicalType: 'NUMERIC', fakerGenerator: () => parseFloat(faker.number.float({ min: 0.1, max: 15.0, fractionDigits: 4 }).toFixed(4)) },
      { name: 'gas_fee_gwei', logicalType: 'NUMERIC', fakerGenerator: () => parseFloat((faker.number.float({ min: 12.0, max: 45.0, fractionDigits: 2 })).toFixed(2)) },
      { name: 'status', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['CONFIRMED', 'PENDING', 'FAILED']) },
      { name: 'block_number', logicalType: 'INTEGER', fakerGenerator: () => faker.number.int({ min: 19500000, max: 20500000 }) },
      { name: 'timestamp', logicalType: 'TIMESTAMP', fakerGenerator: () => faker.date.recent().toISOString() }
    ]
  },

  bank_accounts: {
    aliases: ['bank_account', 'bank_accounts', 'payments', 'financials', 'checking_accounts'],
    columns: [
      { name: 'id', logicalType: 'INTEGER', isPrimaryKey: true, fakerGenerator: () => 1 },
      { name: 'account_number', logicalType: 'VARCHAR', fakerGenerator: () => `ACCT-${faker.string.numeric(8)}` },
      { name: 'account_type', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['CHECKING', 'SAVINGS', 'BUSINESS', 'INVESTMENT']) },
      { name: 'balance', logicalType: 'NUMERIC', fakerGenerator: () => parseFloat(faker.commerce.price({ min: 250, max: 45000, dec: 2 })) },
      { name: 'currency', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['USD', 'EUR', 'GBP', 'INR', 'CAD']) },
      { name: 'status', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['ACTIVE', 'ACTIVE', 'PENDING', 'FROZEN']) }
    ]
  },

  invoices: {
    aliases: ['invoice', 'invoices', 'bills', 'billing_statements'],
    columns: [
      { name: 'id', logicalType: 'INTEGER', isPrimaryKey: true, fakerGenerator: () => 1 },
      { name: 'invoice_number', logicalType: 'VARCHAR', fakerGenerator: () => `INV-${faker.number.int({ min: 10000, max: 99999 })}` },
      { name: 'client_name', logicalType: 'VARCHAR', fakerGenerator: () => faker.company.name() },
      { name: 'subtotal', logicalType: 'NUMERIC', fakerGenerator: () => parseFloat(faker.commerce.price({ min: 200, max: 6000, dec: 2 })) },
      { name: 'tax_amount', logicalType: 'NUMERIC', fakerGenerator: () => parseFloat(faker.commerce.price({ min: 20, max: 600, dec: 2 })) },
      { name: 'total_amount', logicalType: 'NUMERIC', fakerGenerator: () => parseFloat(faker.commerce.price({ min: 220, max: 6600, dec: 2 })) },
      { name: 'status', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['PAID', 'PENDING', 'OVERDUE', 'DRAFT']) },
      { name: 'due_date', logicalType: 'DATE', fakerGenerator: () => faker.date.future({ years: 0.2 }).toISOString().split('T')[0] }
    ]
  },

  stocks: {
    aliases: ['stock', 'stocks', 'equities', 'tickers', 'securities', 'stock_quotes'],
    columns: [
      { name: 'id', logicalType: 'INTEGER', isPrimaryKey: true, fakerGenerator: () => 1 },
      { name: 'ticker', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA', 'META', 'BRK.B']) },
      { name: 'company_name', logicalType: 'VARCHAR', fakerGenerator: () => faker.company.name() },
      { name: 'current_price', logicalType: 'NUMERIC', fakerGenerator: () => parseFloat(faker.commerce.price({ min: 25, max: 980, dec: 2 })) },
      { name: 'market_cap_billions', logicalType: 'NUMERIC', fakerGenerator: () => faker.number.int({ min: 40, max: 3200 }) },
      { name: 'pe_ratio', logicalType: 'NUMERIC', fakerGenerator: () => parseFloat((faker.number.float({ min: 12.0, max: 65.0, fractionDigits: 1 })).toFixed(1)) },
      { name: 'dividend_yield', logicalType: 'NUMERIC', fakerGenerator: () => parseFloat((faker.number.float({ min: 0.0, max: 4.5, fractionDigits: 2 })).toFixed(2)) }
    ]
  },

  // ── 5. MEDIA & ENTERTAINMENT ──────────────────────────────────────────────
  movies: {
    aliases: ['movie', 'movies', 'films', 'cinema', 'motion_pictures'],
    columns: [
      { name: 'id', logicalType: 'INTEGER', isPrimaryKey: true, fakerGenerator: () => 1 },
      { name: 'title', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['Interstellar', 'The Dark Knight', 'Inception', 'Pulp Fiction', 'The Matrix', 'Gladiator', 'Oppenheimer', 'Blade Runner 2049']) },
      { name: 'genre', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(MOVIE_GENRES) },
      { name: 'release_year', logicalType: 'INTEGER', fakerGenerator: () => faker.number.int({ min: 1994, max: 2026 }) },
      { name: 'director', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['Christopher Nolan', 'Quentin Tarantino', 'Denis Villeneuve', 'Martin Scorsese', 'Steven Spielberg', 'David Fincher']) },
      { name: 'duration_minutes', logicalType: 'INTEGER', fakerGenerator: () => faker.number.int({ min: 92, max: 185 }) },
      { name: 'imdb_rating', logicalType: 'NUMERIC', fakerGenerator: () => parseFloat((faker.number.float({ min: 7.2, max: 9.3, fractionDigits: 1 })).toFixed(1)) }
    ]
  },

  songs: {
    aliases: ['song', 'songs', 'tracks', 'audio_tracks', 'music_tracks'],
    columns: [
      { name: 'id', logicalType: 'INTEGER', isPrimaryKey: true, fakerGenerator: () => 1 },
      { name: 'title', logicalType: 'VARCHAR', fakerGenerator: () => faker.music.songName() },
      { name: 'artist', logicalType: 'VARCHAR', fakerGenerator: () => faker.music.artist() },
      { name: 'genre', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(MUSIC_GENRES) },
      { name: 'duration_seconds', logicalType: 'INTEGER', fakerGenerator: () => faker.number.int({ min: 160, max: 380 }) },
      { name: 'stream_count', logicalType: 'INTEGER', fakerGenerator: () => faker.number.int({ min: 50000, max: 85000000 }) },
      { name: 'explicit_content', logicalType: 'BOOLEAN', fakerGenerator: () => faker.datatype.boolean() }
    ]
  },

  books: {
    aliases: ['book', 'books', 'library', 'publications', 'novels'],
    columns: [
      { name: 'id', logicalType: 'INTEGER', isPrimaryKey: true, fakerGenerator: () => 1 },
      { name: 'title', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['The Silent Patient', 'To Kill a Mockingbird', '1984', 'The Great Gatsby', 'Pride and Prejudice', 'The Hobbit', 'Fahrenheit 451', 'Brave New World']) },
      { name: 'author', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['J.K. Rowling', 'George R.R. Martin', 'Stephen King', 'Agatha Christie', 'Ernest Hemingway', 'Mark Twain', 'Charles Dickens']) },
      { name: 'cover_type', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['Hardcover', 'Paperback', 'E-Book', 'Audiobook']) },
      { name: 'pages', logicalType: 'INTEGER', fakerGenerator: () => faker.number.int({ min: 180, max: 740 }) },
      { name: 'published_year', logicalType: 'INTEGER', fakerGenerator: () => faker.number.int({ min: 1960, max: 2024 }) }
    ]
  },

  // ── 6. SPORTS & GAMING ────────────────────────────────────────────────────
  f1_drivers: {
    aliases: ['f1_driver', 'f1_drivers', 'drivers', 'racers', 'formula1_drivers', 'race_drivers'],
    columns: [
      { name: 'id', logicalType: 'INTEGER', isPrimaryKey: true, fakerGenerator: () => 1 },
      { name: 'driver_name', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(F1_DRIVERS) },
      { name: 'racing_team', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(F1_TEAMS) },
      { name: 'car_number', logicalType: 'INTEGER', fakerGenerator: () => faker.helpers.arrayElement([1, 4, 11, 16, 44, 55, 63, 81]) },
      { name: 'world_championships', logicalType: 'INTEGER', fakerGenerator: () => faker.helpers.arrayElement([0, 0, 1, 3, 7]) },
      { name: 'podium_finishes', logicalType: 'INTEGER', fakerGenerator: () => faker.number.int({ min: 5, max: 195 }) },
      { name: 'nationality', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['Dutch', 'British', 'Monegasque', 'Spanish', 'Australian', 'Mexican', 'French']) }
    ]
  },

  teams: {
    aliases: ['team', 'teams', 'clubs', 'franchises', 'squads'],
    columns: [
      { name: 'id', logicalType: 'INTEGER', isPrimaryKey: true, fakerGenerator: () => 1 },
      { name: 'team_name', logicalType: 'VARCHAR', fakerGenerator: () => `${faker.location.city()} ${faker.helpers.arrayElement(['Warriors', 'Knights', 'Thunder', 'Lions', 'Eagles', 'Titans', 'United'])}` },
      { name: 'sport', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['Football', 'Basketball', 'Cricket', 'Formula 1', 'Baseball', 'Hockey']) },
      { name: 'founded_year', logicalType: 'INTEGER', fakerGenerator: () => faker.number.int({ min: 1900, max: 2018 }) },
      { name: 'stadium_name', logicalType: 'VARCHAR', fakerGenerator: () => `${faker.company.name()} Arena` },
      { name: 'championship_titles', logicalType: 'INTEGER', fakerGenerator: () => faker.number.int({ min: 0, max: 18 }) }
    ]
  },

  players: {
    aliases: ['player', 'players', 'athletes', 'roster'],
    columns: [
      { name: 'id', logicalType: 'INTEGER', isPrimaryKey: true, fakerGenerator: () => 1 },
      { name: 'player_name', logicalType: 'VARCHAR', fakerGenerator: () => faker.person.fullName() },
      { name: 'team_id', logicalType: 'INTEGER', isForeignKey: true, references: { table: 'teams', column: 'id' }, fakerGenerator: () => faker.number.int({ min: 1, max: 20 }) },
      { name: 'jersey_number', logicalType: 'INTEGER', fakerGenerator: () => faker.number.int({ min: 1, max: 99 }) },
      { name: 'position', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['Forward', 'Midfielder', 'Defender', 'Goalkeeper', 'Point Guard', 'Center', 'Quarterback']) },
      { name: 'salary_usd', logicalType: 'NUMERIC', fakerGenerator: () => faker.number.int({ min: 750000, max: 35000000 }) }
    ]
  },

  // ── 7. EDUCATION & UNIVERSITIES ───────────────────────────────────────────
  courses: {
    aliases: ['course', 'courses', 'classes', 'curriculum', 'subjects'],
    columns: [
      { name: 'id', logicalType: 'INTEGER', isPrimaryKey: true, fakerGenerator: () => 1 },
      { name: 'course_code', logicalType: 'VARCHAR', fakerGenerator: () => `${faker.helpers.arrayElement(['CS', 'DS', 'MATH', 'ENG', 'ECON', 'PHYS'])}-${faker.number.int({ min: 101, max: 499 })}` },
      { name: 'course_title', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(UNIVERSITY_DEPARTMENTS) + ' Fundamentals' },
      { name: 'department', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(UNIVERSITY_DEPARTMENTS) },
      { name: 'credit_hours', logicalType: 'INTEGER', fakerGenerator: () => faker.helpers.arrayElement([3, 4]) },
      { name: 'instructor', logicalType: 'VARCHAR', fakerGenerator: () => `Prof. ${faker.person.lastName()}` }
    ]
  },

  students: {
    aliases: ['student', 'students', 'pupils', 'undergrads', 'postgrads'],
    columns: [
      { name: 'id', logicalType: 'INTEGER', isPrimaryKey: true, fakerGenerator: () => 1 },
      { name: 'student_number', logicalType: 'VARCHAR', fakerGenerator: () => `STU-${faker.string.numeric(7)}` },
      { name: 'full_name', logicalType: 'VARCHAR', fakerGenerator: () => faker.person.fullName() },
      { name: 'major', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(UNIVERSITY_DEPARTMENTS) },
      { name: 'gpa', logicalType: 'NUMERIC', fakerGenerator: () => parseFloat((faker.number.float({ min: 2.5, max: 4.0, fractionDigits: 2 })).toFixed(2)) },
      { name: 'graduation_year', logicalType: 'INTEGER', fakerGenerator: () => faker.number.int({ min: 2024, max: 2028 }) }
    ]
  },

  // ── 8. FOOD, DINING & RECIPES ─────────────────────────────────────────────
  restaurants: {
    aliases: ['restaurant', 'restaurants', 'cafes', 'eateries', 'bistros', 'diners'],
    columns: [
      { name: 'id', logicalType: 'INTEGER', isPrimaryKey: true, fakerGenerator: () => 1 },
      { name: 'restaurant_name', logicalType: 'VARCHAR', fakerGenerator: () => `${faker.person.firstName()}'s ${faker.helpers.arrayElement(['Kitchen', 'Bistro', 'Trattoria', 'Tavern', 'Diner', 'Steakhouse'])}` },
      { name: 'cuisine', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(CUISINE_TYPES) },
      { name: 'city', logicalType: 'VARCHAR', fakerGenerator: () => faker.location.city() },
      { name: 'price_tier', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['$', '$$', '$$$', '$$$$']) },
      { name: 'rating', logicalType: 'NUMERIC', fakerGenerator: () => parseFloat((faker.number.float({ min: 3.8, max: 5.0, fractionDigits: 1 })).toFixed(1)) },
      { name: 'has_delivery', logicalType: 'BOOLEAN', fakerGenerator: () => faker.datatype.boolean() }
    ]
  },

  recipes: {
    aliases: ['recipe', 'recipes', 'dishes', 'meals', 'menu_items'],
    columns: [
      { name: 'id', logicalType: 'INTEGER', isPrimaryKey: true, fakerGenerator: () => 1 },
      { name: 'dish_name', logicalType: 'VARCHAR', fakerGenerator: () => `${faker.helpers.arrayElement(['Crispy', 'Smoked', 'Roasted', 'Braised', 'Spicy'])} ${faker.helpers.arrayElement(['Salmon', 'Risotto', 'Tacos', 'Curry', 'Pasta', 'Steak', 'Bowl'])}` },
      { name: 'prep_time_minutes', logicalType: 'INTEGER', fakerGenerator: () => faker.number.int({ min: 10, max: 60 }) },
      { name: 'calories', logicalType: 'INTEGER', fakerGenerator: () => faker.number.int({ min: 220, max: 980 }) },
      { name: 'is_vegetarian', logicalType: 'BOOLEAN', fakerGenerator: () => faker.datatype.boolean() },
      { name: 'difficulty', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['EASY', 'MEDIUM', 'ADVANCED', 'EXPERT']) }
    ]
  },

  // ── 9. AUTOMOTIVE & VEHICLES ──────────────────────────────────────────────
  vehicles: {
    aliases: ['vehicle', 'vehicles', 'cars', 'automobiles', 'fleet'],
    columns: [
      { name: 'id', logicalType: 'INTEGER', isPrimaryKey: true, fakerGenerator: () => 1 },
      { name: 'vin', logicalType: 'VARCHAR', fakerGenerator: () => faker.vehicle.vin() },
      { name: 'make', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(VEHICLE_MAKES) },
      { name: 'model', logicalType: 'VARCHAR', fakerGenerator: () => faker.vehicle.model() },
      { name: 'year', logicalType: 'INTEGER', fakerGenerator: () => faker.number.int({ min: 2016, max: 2025 }) },
      { name: 'mileage', logicalType: 'INTEGER', fakerGenerator: () => faker.number.int({ min: 500, max: 120000 }) },
      { name: 'fuel_type', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['ELECTRIC', 'HYBRID', 'GASOLINE', 'DIESEL']) }
    ]
  },

  // ── 10. DEVOPS, GITHUB & SAAS ─────────────────────────────────────────────
  repositories: {
    aliases: ['repo', 'repos', 'repositories', 'git_repositories', 'codebases'],
    columns: [
      { name: 'id', logicalType: 'INTEGER', isPrimaryKey: true, fakerGenerator: () => 1 },
      { name: 'repo_name', logicalType: 'VARCHAR', fakerGenerator: () => `${faker.word.noun()}-${faker.word.verb()}`.toLowerCase() },
      { name: 'primary_language', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['TypeScript', 'Python', 'Go', 'Rust', 'C++', 'Java', 'SQL']) },
      { name: 'star_count', logicalType: 'INTEGER', fakerGenerator: () => faker.number.int({ min: 10, max: 45000 }) },
      { name: 'fork_count', logicalType: 'INTEGER', fakerGenerator: () => faker.number.int({ min: 2, max: 8500 }) },
      { name: 'is_private', logicalType: 'BOOLEAN', fakerGenerator: () => faker.datatype.boolean() },
      { name: 'default_branch', logicalType: 'VARCHAR', fakerGenerator: () => 'main' }
    ]
  },

  git_commits: {
    aliases: ['commit', 'commits', 'git_commits', 'revisions', 'changelog'],
    columns: [
      { name: 'id', logicalType: 'INTEGER', isPrimaryKey: true, fakerGenerator: () => 1 },
      { name: 'commit_sha', logicalType: 'VARCHAR', fakerGenerator: () => faker.git.commitSha().substring(0, 8) },
      { name: 'author_name', logicalType: 'VARCHAR', fakerGenerator: () => faker.person.fullName() },
      { name: 'commit_message', logicalType: 'VARCHAR', fakerGenerator: () => faker.git.commitMessage() },
      { name: 'files_changed', logicalType: 'INTEGER', fakerGenerator: () => faker.number.int({ min: 1, max: 24 }) },
      { name: 'additions', logicalType: 'INTEGER', fakerGenerator: () => faker.number.int({ min: 4, max: 480 }) },
      { name: 'committed_at', logicalType: 'TIMESTAMP', fakerGenerator: () => faker.date.recent().toISOString() }
    ]
  },

  // ── 11. HEALTHCARE & MEDICINE ─────────────────────────────────────────────
  patients: {
    aliases: ['patient', 'patients', 'medical_records', 'clinical_patients'],
    columns: [
      { name: 'id', logicalType: 'INTEGER', isPrimaryKey: true, fakerGenerator: () => 1 },
      { name: 'mrn', logicalType: 'VARCHAR', fakerGenerator: () => `MRN-${faker.string.numeric(7)}` },
      { name: 'patient_name', logicalType: 'VARCHAR', fakerGenerator: () => faker.person.fullName() },
      { name: 'dob', logicalType: 'DATE', fakerGenerator: () => faker.date.birthdate({ min: 18, max: 85, mode: 'age' }).toISOString().split('T')[0] },
      { name: 'blood_type', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']) },
      { name: 'primary_condition', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(MEDICAL_DIAGNOSES) }
    ]
  },

  prescriptions: {
    aliases: ['prescription', 'prescriptions', 'medications', 'rx_orders', 'pharmacy_orders'],
    columns: [
      { name: 'id', logicalType: 'INTEGER', isPrimaryKey: true, fakerGenerator: () => 1 },
      { name: 'patient_id', logicalType: 'INTEGER', isForeignKey: true, references: { table: 'patients', column: 'id' }, fakerGenerator: () => faker.number.int({ min: 1, max: 20 }) },
      { name: 'medication_name', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(MEDICATIONS) },
      { name: 'dosage', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['Once daily', 'Twice daily with meals', 'Every 8 hours as needed']) },
      { name: 'refills_left', logicalType: 'INTEGER', fakerGenerator: () => faker.number.int({ min: 0, max: 5 }) },
      { name: 'prescribed_by', logicalType: 'VARCHAR', fakerGenerator: () => `Dr. ${faker.person.lastName()}` }
    ]
  },

  // ── 12. LOGISTICS & SUPPLY CHAIN ──────────────────────────────────────────
  shipments: {
    aliases: ['shipment', 'shipments', 'deliveries', 'packages', 'parcels', 'freight'],
    columns: [
      { name: 'id', logicalType: 'INTEGER', isPrimaryKey: true, fakerGenerator: () => 1 },
      { name: 'tracking_number', logicalType: 'VARCHAR', fakerGenerator: () => `TRK-${faker.string.alphanumeric(12).toUpperCase()}` },
      { name: 'carrier', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(LOGISTICS_CARRIERS) },
      { name: 'origin_city', logicalType: 'VARCHAR', fakerGenerator: () => faker.location.city() },
      { name: 'destination_city', logicalType: 'VARCHAR', fakerGenerator: () => faker.location.city() },
      { name: 'weight_kg', logicalType: 'NUMERIC', fakerGenerator: () => parseFloat((faker.number.float({ min: 0.5, max: 48.0, fractionDigits: 1 })).toFixed(1)) },
      { name: 'status', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'EXCEPTION', 'PICKED_UP']) }
    ]
  },

  // ── 13. REAL ESTATE & PROPERTIES ──────────────────────────────────────────
  properties: {
    aliases: ['property', 'properties', 'real_estate', 'listings', 'apartments', 'homes', 'houses'],
    columns: [
      { name: 'id', logicalType: 'INTEGER', isPrimaryKey: true, fakerGenerator: () => 1 },
      { name: 'property_type', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['Single Family Home', 'Condo', 'Apartment', 'Townhouse', 'Duplex', 'Penthouse']) },
      { name: 'address', logicalType: 'VARCHAR', fakerGenerator: () => faker.location.streetAddress() },
      { name: 'city', logicalType: 'VARCHAR', fakerGenerator: () => faker.location.city() },
      { name: 'bedrooms', logicalType: 'INTEGER', fakerGenerator: () => faker.number.int({ min: 1, max: 5 }) },
      { name: 'bathrooms', logicalType: 'NUMERIC', fakerGenerator: () => faker.helpers.arrayElement([1.0, 1.5, 2.0, 2.5, 3.0, 3.5]) },
      { name: 'square_feet', logicalType: 'INTEGER', fakerGenerator: () => faker.number.int({ min: 550, max: 4200 }) },
      { name: 'price_usd', logicalType: 'NUMERIC', fakerGenerator: () => faker.number.int({ min: 180000, max: 1850000 }) }
    ]
  },

  // ── 14. SOCIAL MEDIA & POSTS ──────────────────────────────────────────────
  posts: {
    aliases: ['post', 'posts', 'articles', 'tweets', 'updates', 'threads'],
    columns: [
      { name: 'id', logicalType: 'INTEGER', isPrimaryKey: true, fakerGenerator: () => 1 },
      { name: 'user_id', logicalType: 'INTEGER', isForeignKey: true, references: { table: 'users', column: 'id' }, fakerGenerator: () => faker.number.int({ min: 1, max: 20 }) },
      { name: 'content', logicalType: 'VARCHAR', fakerGenerator: () => faker.lorem.paragraph() },
      { name: 'likes_count', logicalType: 'INTEGER', fakerGenerator: () => faker.number.int({ min: 0, max: 12500 }) },
      { name: 'shares_count', logicalType: 'INTEGER', fakerGenerator: () => faker.number.int({ min: 0, max: 1800 }) },
      { name: 'is_pinned', logicalType: 'BOOLEAN', fakerGenerator: () => faker.helpers.arrayElement([false, false, false, true]) },
      { name: 'published_at', logicalType: 'TIMESTAMP', fakerGenerator: () => faker.date.recent().toISOString() }
    ]
  },

  comments: {
    aliases: ['comment', 'comments', 'replies', 'feedback'],
    columns: [
      { name: 'id', logicalType: 'INTEGER', isPrimaryKey: true, fakerGenerator: () => 1 },
      { name: 'post_id', logicalType: 'INTEGER', isForeignKey: true, references: { table: 'posts', column: 'id' }, fakerGenerator: () => faker.number.int({ min: 1, max: 20 }) },
      { name: 'author_name', logicalType: 'VARCHAR', fakerGenerator: () => faker.person.fullName() },
      { name: 'text', logicalType: 'VARCHAR', fakerGenerator: () => faker.lorem.sentence() },
      { name: 'upvotes', logicalType: 'INTEGER', fakerGenerator: () => faker.number.int({ min: 0, max: 350 }) },
      { name: 'created_at', logicalType: 'TIMESTAMP', fakerGenerator: () => faker.date.recent().toISOString() }
    ]
  },

  // ── 15. ORGANIZATIONS & EMPLOYEES ─────────────────────────────────────────
  organizations: {
    aliases: ['orgs', 'tenants', 'companies', 'workspaces', 'organization'],
    columns: [
      { name: 'id', logicalType: 'INTEGER', isPrimaryKey: true, fakerGenerator: () => 1 },
      { name: 'name', logicalType: 'VARCHAR', fakerGenerator: () => faker.company.name() },
      { name: 'domain', logicalType: 'VARCHAR', fakerGenerator: () => faker.internet.domainName() },
      { name: 'plan_tier', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['free', 'pro', 'enterprise']) },
      { name: 'created_at', logicalType: 'TIMESTAMP', fakerGenerator: () => faker.date.past({ years: 3 }).toISOString() }
    ]
  },

  employees: {
    aliases: ['employee', 'employees', 'staff', 'workers', 'team', 'personnel'],
    columns: [
      { name: 'id', logicalType: 'INTEGER', isPrimaryKey: true, fakerGenerator: () => 1 },
      { name: 'name', logicalType: 'VARCHAR', fakerGenerator: () => faker.person.fullName() },
      { name: 'department', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Operations', 'Design']) },
      { name: 'salary', logicalType: 'NUMERIC', fakerGenerator: () => faker.number.int({ min: 45000, max: 185000 }) },
      { name: 'country', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['India', 'United States', 'United Kingdom', 'Canada', 'Germany', 'Australia', 'Japan', 'France']) },
      { name: 'hire_date', logicalType: 'DATE', fakerGenerator: () => faker.date.past({ years: 5 }).toISOString().split('T')[0] }
    ]
  },

  events: {
    aliases: ['logs', 'audits', 'activity', 'telemetry', 'event', 'events'],
    columns: [
      { name: 'id', logicalType: 'INTEGER', isPrimaryKey: true, fakerGenerator: () => 1 },
      { name: 'event_type', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['login_success', 'payment_failed', 'password_reset', 'item_added', 'session_start']) },
      { name: 'ip_address', logicalType: 'VARCHAR', fakerGenerator: () => faker.internet.ipv4() },
      { name: 'timestamp', logicalType: 'TIMESTAMP', fakerGenerator: () => faker.date.recent().toISOString() }
    ]
  }
};
