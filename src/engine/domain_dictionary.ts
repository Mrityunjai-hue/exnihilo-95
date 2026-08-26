/**
 * domain_dictionary.ts — Expanded Semantic Matching & Domain Schema Catalog
 *
 * Provides a 3-tier semantic matching system that infers realistic database schemas
 * based on table names and column names extracted from SQL ASTs.
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

export const DOMAIN_CATALOG: Record<string, DomainTableSpec> = {
  users: {
    aliases: ['user', 'users', 'app_users', 'customers', 'customer', 'accounts', 'members', 'clients', 'tbl_customers'],
    columns: [
      { name: 'id', logicalType: 'INTEGER', isPrimaryKey: true, fakerGenerator: () => 1 },
      { name: 'first_name', logicalType: 'VARCHAR', fakerGenerator: () => faker.person.firstName() },
      { name: 'last_name', logicalType: 'VARCHAR', fakerGenerator: () => faker.person.lastName() },
      { name: 'email', logicalType: 'VARCHAR', fakerGenerator: () => faker.internet.email().toLowerCase() },
      { name: 'created_at', logicalType: 'TIMESTAMP', fakerGenerator: () => faker.date.past({ years: 2 }).toISOString() }
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
      { name: 'user_id', logicalType: 'INTEGER', isForeignKey: true, references: { table: 'users', column: 'id' }, fakerGenerator: () => 1 },
      { name: 'status', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['PLACED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']) },
      { name: 'total_amount', logicalType: 'NUMERIC', fakerGenerator: () => parseFloat(faker.commerce.price({ min: 20, max: 2500, dec: 2 })) }
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
  const cleanCol = columnName.toLowerCase();
  
  if (cleanCol.includes('country')) return () => faker.helpers.arrayElement(['India', 'United States', 'United Kingdom', 'Canada', 'Germany', 'Australia', 'Japan', 'France']);
  if (cleanCol.includes('email')) return () => faker.internet.email().toLowerCase();
  if (cleanCol.includes('phone') || cleanCol.includes('mobile')) return () => faker.phone.number();
  if (cleanCol.includes('url') || cleanCol.includes('website')) return () => faker.internet.url();
  if (cleanCol.includes('ip_address') || cleanCol.includes('ip')) return () => faker.internet.ipv4();
  if (cleanCol.includes('uuid') || cleanCol.includes('guid')) return () => faker.string.uuid();
  if (cleanCol.includes('price') || cleanCol.includes('amount') || cleanCol.includes('cost') || cleanCol === 'total') return () => parseFloat(faker.commerce.price({ min: 10, max: 1000, dec: 2 }));
  if (cleanCol.includes('salary')) return () => faker.number.int({ min: 45000, max: 185000 });
  if (cleanCol === 'age' || cleanCol.endsWith('_age')) return () => faker.number.int({ min: 18, max: 75 });
  if (cleanCol.includes('qty') || cleanCol.includes('quantity') || cleanCol === 'count' || cleanCol.endsWith('_count') || cleanCol.startsWith('count_')) return () => faker.number.int({ min: 1, max: 50 });
  if (cleanCol.includes('score') || cleanCol.includes('rating')) return () => parseFloat(faker.number.float({ min: 1.0, max: 5.0, fractionDigits: 1 }).toFixed(1));
  if (cleanCol.includes('balance')) return () => parseFloat(faker.commerce.price({ min: 50, max: 25000, dec: 2 }));
  if (cleanCol.includes('date') || cleanCol.includes('time') || cleanCol.includes('_at')) return () => faker.date.recent().toISOString();
  if (cleanCol.includes('is_') || cleanCol.includes('has_')) return () => faker.datatype.boolean();
  if (cleanCol.includes('zip') || cleanCol.includes('postal')) return () => faker.location.zipCode();
  if (cleanCol.includes('city')) return () => faker.location.city();
  
  // Return null when no specific keyword heuristic matches, allowing type-specific generators to handle baseline types
  return null;
}
