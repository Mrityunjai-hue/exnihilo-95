/**
 * domain_dictionary.ts — Expanded Semantic Matching & Domain Schema Catalog
 *
 * Provides a 3-tier semantic matching system that infers realistic database schemas
 * based on table names and column names extracted from SQL ASTs.
 */

import { faker } from '@faker-js/faker';
import { LogicalType } from './inference';
import { matchColumnToken } from './token_dictionary';

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

export const DOMAIN_CATALOG: Record<string, DomainTableSpec> = {
  users: {
    aliases: ['user', 'users', 'app_users', 'accounts', 'members', 'tbl_users'],
    columns: [
      { name: 'id', logicalType: 'INTEGER', isPrimaryKey: true, fakerGenerator: () => 1 },
      { name: 'username', logicalType: 'VARCHAR', fakerGenerator: () => faker.internet.username().toLowerCase() },
      { name: 'email', logicalType: 'VARCHAR', fakerGenerator: () => faker.internet.email().toLowerCase() },
      { name: 'role', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['admin', 'user', 'manager', 'editor']) },
      { name: 'created_at', logicalType: 'TIMESTAMP', fakerGenerator: () => faker.date.past({ years: 2 }).toISOString().replace('T', ' ').substring(0, 19) }
    ]
  },
  customers: {
    aliases: ['customer', 'customers', 'client', 'clients', 'tbl_customers'],
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
  products: {
    aliases: ['product', 'products', 'items', 'inventory', 'goods', 'catalog', 'app_inventory_items'],
    columns: [
      { name: 'id', logicalType: 'INTEGER', isPrimaryKey: true, fakerGenerator: () => 1 },
      { name: 'product_name', logicalType: 'VARCHAR', fakerGenerator: () => faker.commerce.productName() },
      { name: 'sku', logicalType: 'VARCHAR', fakerGenerator: () => `SKU-${faker.string.alphanumeric(8).toUpperCase()}` },
      { name: 'price', logicalType: 'NUMERIC', fakerGenerator: () => parseFloat(faker.commerce.price({ min: 5, max: 1500, dec: 2 })) },
      { name: 'stock_quantity', logicalType: 'INTEGER', fakerGenerator: () => faker.number.int({ min: 0, max: 750 }) }
    ]
  },
  orders: {
    aliases: ['order', 'orders', 'sales', 'transactions', 'purchases', 'checkouts', 'sales_orders'],
    columns: [
      { name: 'id', logicalType: 'INTEGER', isPrimaryKey: true, fakerGenerator: () => 1 },
      { name: 'customer_id', logicalType: 'INTEGER', isForeignKey: true, references: { table: 'customers', column: 'id' }, fakerGenerator: () => faker.number.int({ min: 1, max: 20 }) },
      { name: 'user_id', logicalType: 'INTEGER', isForeignKey: true, references: { table: 'users', column: 'id' }, fakerGenerator: () => faker.number.int({ min: 1, max: 20 }) },
      { name: 'order_date', logicalType: 'TIMESTAMP', fakerGenerator: () => faker.date.recent({ days: 180 }).toISOString().replace('T', ' ').substring(0, 19) },
      { name: 'status', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['PLACED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']) },
      { name: 'total_amount', logicalType: 'NUMERIC', fakerGenerator: () => parseFloat(faker.commerce.price({ min: 20, max: 2500, dec: 2 })) },
      { name: 'payment_method', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['CREDIT_CARD', 'PAYPAL', 'UPI', 'BANK_TRANSFER']) }
    ]
  },
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
    aliases: ['employee', 'employees', 'staff', 'workers', 'team'],
    columns: [
      { name: 'id', logicalType: 'INTEGER', isPrimaryKey: true, fakerGenerator: () => 1 },
      { name: 'name', logicalType: 'VARCHAR', fakerGenerator: () => faker.person.fullName() },
      { name: 'department', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Operations']) },
      { name: 'salary', logicalType: 'NUMERIC', fakerGenerator: () => faker.number.int({ min: 45000, max: 185000 }) },
      { name: 'country', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['India', 'United States', 'United Kingdom', 'Canada', 'Germany', 'Australia', 'Japan']) },
      { name: 'hire_date', logicalType: 'DATE', fakerGenerator: () => faker.date.past({ years: 5 }).toISOString().split('T')[0] }
    ]
  },
  bank_accounts: {
    aliases: ['bank_account', 'bank_accounts', 'payments', 'invoices', 'financials'],
    columns: [
      { name: 'id', logicalType: 'INTEGER', isPrimaryKey: true, fakerGenerator: () => 1 },
      { name: 'account_number', logicalType: 'VARCHAR', fakerGenerator: () => `ACCT-${faker.string.numeric(8)}` },
      { name: 'balance', logicalType: 'NUMERIC', fakerGenerator: () => parseFloat(faker.commerce.price({ min: 100, max: 25000, dec: 2 })) },
      { name: 'currency', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['USD', 'EUR', 'GBP', 'CAD']) },
      { name: 'status', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['ACTIVE', 'PENDING', 'FROZEN']) }
    ]
  },
  patients: {
    aliases: ['patient', 'patients', 'appointments', 'medical_records'],
    columns: [
      { name: 'id', logicalType: 'INTEGER', isPrimaryKey: true, fakerGenerator: () => 1 },
      { name: 'patient_name', logicalType: 'VARCHAR', fakerGenerator: () => faker.person.fullName() },
      { name: 'dob', logicalType: 'DATE', fakerGenerator: () => faker.date.birthdate({ min: 18, max: 80, mode: 'age' }).toISOString().split('T')[0] },
      { name: 'blood_type', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']) },
      { name: 'doctor_name', logicalType: 'VARCHAR', fakerGenerator: () => `Dr. ${faker.person.lastName()}` }
    ]
  },
  events: {
    aliases: ['logs', 'audits', 'activity', 'telemetry', 'event', 'events'],
    columns: [
      { name: 'id', logicalType: 'INTEGER', isPrimaryKey: true, fakerGenerator: () => 1 },
      { name: 'event_type', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['login_success', 'payment_failed', 'password_reset', 'item_added']) },
      { name: 'ip_address', logicalType: 'VARCHAR', fakerGenerator: () => faker.internet.ipv4() },
      { name: 'timestamp', logicalType: 'TIMESTAMP', fakerGenerator: () => faker.date.recent().toISOString() }
    ]
  },
  books: {
    aliases: ['book', 'books', 'library', 'publications', 'catalog', 'authors', 'novels'],
    columns: [
      { name: 'id', logicalType: 'INTEGER', isPrimaryKey: true, fakerGenerator: () => 1 },
      { name: 'title', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['The Silent Patient', 'To Kill a Mockingbird', '1984', 'The Great Gatsby', 'Pride and Prejudice', 'The Hobbit', 'Fahrenheit 451', 'Brave New World']) },
      { name: 'author', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['J.K. Rowling', 'George R.R. Martin', 'Stephen King', 'Agatha Christie', 'Ernest Hemingway', 'Mark Twain', 'Charles Dickens', 'Leo Tolstoy']) },
      { name: 'cover_type', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['Hardcover', 'Paperback', 'Audiobook', 'E-Book']) },
      { name: 'pages', logicalType: 'INTEGER', fakerGenerator: () => faker.number.int({ min: 140, max: 880 }) },
      { name: 'translated', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['English', 'Spanish', 'French', 'German', 'Original']) },
      { name: 'transcript', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['Available', 'Pending', 'In Review', 'Completed']) }
    ]
  }
};

// Universal Fallback Schema for unknown tables (Maintains full backward compatibility)
export const UNIVERSAL_FALLBACK_SCHEMA: DomainColumnSpec[] = [
  { name: 'id', logicalType: 'INTEGER', isPrimaryKey: true, fakerGenerator: () => 1 },
  { name: 'uuid', logicalType: 'VARCHAR', fakerGenerator: () => faker.string.uuid() },
  { name: 'name', logicalType: 'VARCHAR', fakerGenerator: () => faker.company.name() },
  { name: 'value', logicalType: 'NUMERIC', fakerGenerator: () => parseFloat(faker.commerce.price({ min: 10, max: 1000, dec: 2 })) },
  { name: 'status', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['active', 'pending', 'archived']) },
  { name: 'created_at', logicalType: 'TIMESTAMP', fakerGenerator: () => faker.date.recent().toISOString() }
];

export function resolveDomainSchema(rawTableName: string): DomainColumnSpec[] | null {
  const cleanName = rawTableName.toLowerCase().trim().replace(/^tbl_|^t_|^app_|^dim_|^fact_/, '').replace(/s$/, '');

  // Tier 1: Exact and Alias Match
  for (const key of Object.keys(DOMAIN_CATALOG)) {
    const match = DOMAIN_CATALOG[key].aliases.some(alias => 
      alias.toLowerCase().replace(/s$/, '') === cleanName || rawTableName.toLowerCase() === alias.toLowerCase()
    );
    if (match) return DOMAIN_CATALOG[key].columns;
  }

  // Tier 2: Substring Match
  for (const key of Object.keys(DOMAIN_CATALOG)) {
    if (cleanName.includes(key.replace(/s$/, ''))) return DOMAIN_CATALOG[key].columns;
  }

  return null;
}

export function inferFakerFromColumnName(columnName: string): (() => any) | null {
  const matched = matchColumnToken(columnName);
  if (matched?.fakerGenerator) {
    return matched.fakerGenerator;
  }
  return null;
}
