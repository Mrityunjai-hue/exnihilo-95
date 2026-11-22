import { describe, it, expect } from 'vitest';
import { inferColumnIntelligence } from '../../engine/column_intelligence';
import { inferDomainFromColumns, DOMAIN_TAXONOMY } from '../../engine/concept_taxonomy';
import { correlateRow } from '../../engine/row_correlator';
import { inferSchema } from '../../engine/inference';
import { generateSyntheticDataset } from '../../engine/generator';
import { buildTableGenerationPlan } from '../../engine/relationships';

describe('Phase 8.5: Universal Semantic Schema & Synthesis Engine v2.0', () => {
  // ── Layer 1: Universal Column Intelligence Tests ─────────────────────────────

  describe('Layer 1: Column Intelligence & Semantic Types', () => {
    it('infers age as INTEGER between 21 and 68', () => {
      const intel = inferColumnIntelligence('age');
      expect(intel).toBeDefined();
      expect(intel?.logicalType).toBe('INTEGER');
      const val = intel?.generate(0);
      expect(val).toBeGreaterThanOrEqual(21);
      expect(val).toBeLessThanOrEqual(68);
    });

    it('infers email as valid RFC email string', () => {
      const intel = inferColumnIntelligence('email');
      expect(intel).toBeDefined();
      expect(intel?.logicalType).toBe('VARCHAR');
      const val = intel?.generate(0);
      expect(val).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    });

    it('infers price as 2-decimal positive NUMERIC', () => {
      const intel = inferColumnIntelligence('unit_price');
      expect(intel).toBeDefined();
      expect(intel?.logicalType).toBe('NUMERIC');
      const val = intel?.generate(0);
      expect(val).toBeGreaterThan(0);
    });

    it('infers boolean prefix columns (is_active, has_discount)', () => {
      const active = inferColumnIntelligence('is_active');
      expect(active?.logicalType).toBe('BOOLEAN');
      expect([0, 1]).toContain(active?.generate(0));

      const hasDisc = inferColumnIntelligence('has_discount');
      expect(hasDisc?.logicalType).toBe('BOOLEAN');
    });

    it('infers timestamp suffix columns (_at, _time, _timestamp)', () => {
      const createdAt = inferColumnIntelligence('published_at');
      expect(createdAt?.logicalType).toBe('TIMESTAMP');
      expect(createdAt?.generate(0)).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
    });

    it('infers date suffix columns (_date, _day)', () => {
      const hireDate = inferColumnIntelligence('hire_date');
      expect(hireDate?.logicalType).toBe('DATE');
      expect(hireDate?.generate(0)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('infers telemetry columns (ip_address, latency_ms, status_code)', () => {
      const ip = inferColumnIntelligence('ip_address');
      expect(ip?.logicalType).toBe('VARCHAR');

      const latency = inferColumnIntelligence('latency_ms');
      expect(latency?.logicalType).toBe('INTEGER');
      expect(latency?.generate(0)).toBeGreaterThan(0);

      const status = inferColumnIntelligence('status_code');
      expect(status?.logicalType).toBe('INTEGER');
    });

    it('infers healthcare biometric columns (heart_rate_bpm, systolic_bp, diagnosis_code)', () => {
      const hr = inferColumnIntelligence('heart_rate_bpm');
      expect(hr?.logicalType).toBe('INTEGER');
      expect(hr?.generate(0)).toBeGreaterThanOrEqual(50);

      const diag = inferColumnIntelligence('diagnosis_code');
      expect(diag?.logicalType).toBe('VARCHAR');
    });
  });

  // ── Layer 2 & 3: Concept Taxonomy & Reverse Domain Inference ─────────────────

  describe('Layers 2 & 3: Concept Taxonomy & Reverse Domain Inference', () => {
    it('infers E-Commerce domain from retail columns', () => {
      const domain = inferDomainFromColumns(['sku', 'unit_price', 'quantity', 'shipping_address'], 'tbl_x');
      expect(domain?.domainId).toBe('ecommerce');
    });

    it('infers Banking domain from financial columns', () => {
      const domain = inferDomainFromColumns(['iban', 'routing_number', 'balance', 'account_number'], 'data');
      expect(domain?.domainId).toBe('banking');
    });

    it('infers Capital Markets domain from trading columns', () => {
      const domain = inferDomainFromColumns(['ticker', 'shares', 'dividend_yield', 'pe_ratio'], 't1');
      expect(domain?.domainId).toBe('capital_markets');
    });

    it('infers Healthcare domain from clinical columns', () => {
      const domain = inferDomainFromColumns(['patient_id', 'diagnosis_code', 'systolic_bp', 'dosage_mg'], 'records');
      expect(domain?.domainId).toBe('healthcare');
    });

    it('infers Aviation domain from airline columns', () => {
      const domain = inferDomainFromColumns(['flight_number', 'departure_time', 'arrival_time', 'gate'], 'events');
      expect(domain?.domainId).toBe('aviation');
    });

    it('infers Hospitality domain from hotel columns', () => {
      const domain = inferDomainFromColumns(['checkin_date', 'checkout_date', 'room_number', 'room_type'], 'res');
      expect(domain?.domainId).toBe('hospitality');
    });

    it('returns null for generic ambiguous columns with no score match', () => {
      const domain = inferDomainFromColumns(['foo', 'bar', 'baz'], 'tbl');
      expect(domain).toBeNull();
    });

    it('contains at least 12 major domain profiles in taxonomy', () => {
      expect(Object.keys(DOMAIN_TAXONOMY).length).toBeGreaterThanOrEqual(12);
    });
  });

  // ── Layer 4: Intra-Row Statistical & Relational Correlator ───────────────────

  describe('Layer 4: Intra-Row Correlation & Logical Consistency', () => {
    it('computes total mathematically as quantity * unit_price', () => {
      const rawRow = {
        quantity: 4,
        unit_price: 25.50,
        total: 999.99, // incorrect dummy
      };
      const correlated = correlateRow(rawRow);
      expect(correlated.total).toBe(102.00);
    });

    it('computes subtotal + tax = grand total', () => {
      const rawRow = {
        subtotal: 100.00,
        tax: 0,
        total: 0,
      };
      const correlated = correlateRow(rawRow);
      expect(correlated.tax).toBe(8.00);
      expect(correlated.total).toBe(108.00);
    });

    it('enforces created_at <= updated_at', () => {
      const rawRow = {
        created_at: '2026-06-15 12:00:00',
        updated_at: '2025-01-01 08:00:00', // corrupt past date
      };
      const correlated = correlateRow(rawRow);
      const cDate = new Date(correlated.created_at);
      const uDate = new Date(correlated.updated_at);
      expect(uDate.getTime()).toBeGreaterThanOrEqual(cDate.getTime());
    });

    it('enforces start_date <= end_date', () => {
      const rawRow = {
        start_date: '2026-08-10',
        end_date: '2026-08-01', // corrupt earlier date
      };
      const correlated = correlateRow(rawRow);
      expect(new Date(correlated.end_date).getTime()).toBeGreaterThanOrEqual(
        new Date(correlated.start_date).getTime()
      );
    });

    it('aligns full_name to first_name and last_name', () => {
      const rawRow = {
        first_name: 'Grace',
        last_name: 'Hopper',
        name: 'Random User',
      };
      const correlated = correlateRow(rawRow);
      expect(correlated.name).toBe('Grace Hopper');
    });

    it('aligns email domain to person first and last names', () => {
      const rawRow = {
        first_name: 'Alan',
        last_name: 'Turing',
        email: 'nobody@bletchley.org',
      };
      const correlated = correlateRow(rawRow);
      expect(correlated.email).toBe('alan.turing@bletchley.org');
    });

    it('aligns birth_date year with age', () => {
      const currentYear = new Date().getFullYear();
      const rawRow = {
        age: 30,
        birth_date: '1970-01-01', // mismatched
      };
      const correlated = correlateRow(rawRow);
      expect(correlated.birth_date).toContain(String(currentYear - 30));
    });

    it('clears shipped_at and delivered_at for PENDING status', () => {
      const rawRow = {
        status: 'PENDING',
        shipped_at: '2026-05-01 10:00:00',
        delivered_at: '2026-05-03 14:00:00',
      };
      const correlated = correlateRow(rawRow);
      expect(correlated.shipped_at).toBeNull();
      expect(correlated.delivered_at).toBeNull();
    });

    it('enforces non-negativity on price, age, and quantity', () => {
      const rawRow = {
        age: -25,
        price: -49.99,
        quantity: -3,
      };
      const correlated = correlateRow(rawRow);
      expect(correlated.age).toBe(25);
      expect(correlated.price).toBe(49.99);
      expect(correlated.quantity).toBe(3);
    });
  });

  // ── Layer 5: End-to-End Dataset Synthesis Accuracy ───────────────────────────

  describe('Layer 5: End-to-End Dataset Synthesis Accuracy', () => {
    it('synthesizes multi-table correlated dataset with zero semantic duplicates', () => {
      const sql = `
        SELECT o.id, c.first_name, c.last_name, o.quantity, o.unit_price, o.total 
        FROM orders o 
        INNER JOIN customers c ON o.customer_id = c.id;
      `;
      const schemas = inferSchema(sql, 'PostgreSQL');
      const customers = schemas.get('customers');
      expect(customers).toBeDefined();

      // Ensure 'name' is NOT added because first_name & last_name were explicitly referenced
      const custCols = customers!.columns.map((c) => c.name.toLowerCase());
      expect(custCols).toContain('first_name');
      expect(custCols).toContain('last_name');
      expect(custCols).not.toContain('name');

      // Generate dataset
      const plan = buildTableGenerationPlan(sql, 'PostgreSQL', Array.from(schemas.keys()));
      const dataset = generateSyntheticDataset(schemas, plan, { rowsPerTable: 10 });

      const ordersData = dataset.get('orders');
      expect(ordersData).toBeDefined();
      expect(ordersData!.rows.length).toBe(10);

      // Verify each row in orders obeys intra-row mathematical correlation
      for (const row of ordersData!.rows) {
        expect(row.total).toBe(parseFloat((row.quantity * row.unit_price).toFixed(2)));
      }
    });

    it('synthesizes correlated names and emails in generated dataset', () => {
      const sql = 'SELECT id, first_name, last_name, email FROM employees;';
      const schemas = inferSchema(sql, 'SQLite');
      const plan = buildTableGenerationPlan(sql, 'SQLite', Array.from(schemas.keys()));
      const dataset = generateSyntheticDataset(schemas, plan, { rowsPerTable: 5 });

      const empData = dataset.get('employees');
      expect(empData).toBeDefined();

      for (const row of empData!.rows) {
        const expectedPrefix = `${row.first_name.toLowerCase().replace(/[^a-z0-9]/g, '')}.${row.last_name.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
        expect(row.email.toLowerCase()).toContain(expectedPrefix);
      }
    });
  });
});
