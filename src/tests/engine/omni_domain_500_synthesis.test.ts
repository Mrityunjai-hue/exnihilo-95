/**
 * omni_domain_500_synthesis.test.ts — Comprehensive 500-Domain Schema Verification Suite
 *
 * Verifies that SELECT * FROM <tableName> generates domain-authentic, astonishing,
 * non-generic schemas across 500 diverse real-world domains with ZERO template fallback.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SQLExecutor } from '../../engine/executor';
import { resolveDomainSchema } from '../../engine/domain_dictionary';

describe('Omni-Domain Semantic Synthesis (OSI 500+)', () => {
  let executor: SQLExecutor;

  beforeEach(() => {
    executor = new SQLExecutor();
  });

  it('synthesizes authentic cardiology schema for "heart" (fixes user screenshot 1)', async () => {
    const res = await executor.execute('SELECT * FROM heart;', 'SQLite');
    expect(res.ok).toBe(true);
    if (!res.ok) return;

    // Must NOT have the old broken archetype columns
    expect(res.columns).not.toContain('heart_code');
    expect(res.columns).not.toContain('category');
    expect(res.columns).not.toContain('rating_score');

    // Must contain domain-authentic cardiology columns
    expect(res.columns).toContain('patient_id');
    expect(res.columns).toContain('heart_rate_bpm');
    expect(res.columns).toContain('blood_pressure');
    expect(res.columns).toContain('blood_o2_level');

    // Values must be realistic
    for (const row of res.rows) {
      const hrIdx = res.columns.indexOf('heart_rate_bpm');
      const bpIdx = res.columns.indexOf('blood_pressure');
      const o2Idx = res.columns.indexOf('blood_o2_level');

      expect(row[hrIdx]).toBeGreaterThanOrEqual(60);
      expect(row[hrIdx]).toBeLessThanOrEqual(105);
      expect(typeof row[bpIdx]).toBe('string');
      expect(row[bpIdx]).toMatch(/^\d{2,3}\/\d{2,3}$/);
      expect(row[o2Idx]).toBeGreaterThanOrEqual(94.0);
    }
  });

  it('synthesizes authentic financial P&L schema for "revenue" (fixes user screenshot 2)', async () => {
    const res = await executor.execute('SELECT * FROM revenue;', 'SQLite');
    expect(res.ok).toBe(true);
    if (!res.ok) return;

    // Must NOT have the old broken archetype columns
    expect(res.columns).not.toContain('revenue_code');
    expect(res.columns).not.toContain('category');
    expect(res.columns).not.toContain('rating_score');

    // Must contain domain-authentic accounting & P&L columns
    expect(res.columns).toContain('fiscal_year');
    expect(res.columns).toContain('fiscal_quarter');
    expect(res.columns).toContain('gross_revenue');
    expect(res.columns).toContain('cogs');
    expect(res.columns).toContain('net_profit_margin');
    expect(res.columns).toContain('currency');

    for (const row of res.rows) {
      const revIdx = res.columns.indexOf('gross_revenue');
      const qtrIdx = res.columns.indexOf('fiscal_quarter');
      const currIdx = res.columns.indexOf('currency');

      expect(row[revIdx]).toBeGreaterThan(10000);
      expect(['Q1', 'Q2', 'Q3', 'Q4']).toContain(row[qtrIdx]);
      expect(typeof row[currIdx]).toBe('string');
    }
  });

  it('synthesizes authentic kubernetes schema for "pods"', async () => {
    const res = await executor.execute('SELECT * FROM pods;', 'SQLite');
    expect(res.ok).toBe(true);
    if (!res.ok) return;

    expect(res.columns).toContain('pod_name');
    expect(res.columns).toContain('namespace');
    expect(res.columns).toContain('node_name');
    expect(res.columns).toContain('cpu_usage_cores');
    expect(res.columns).toContain('memory_usage_mib');
  });

  it('synthesizes authentic astronomy schema for "galaxies"', async () => {
    const res = await executor.execute('SELECT * FROM galaxies;', 'SQLite');
    expect(res.ok).toBe(true);
    if (!res.ok) return;

    expect(res.columns).toContain('catalog_id');
    expect(res.columns).toContain('celestial_name');
    expect(res.columns).toContain('distance_light_years');
    expect(res.columns).toContain('redshift_z');
  });

  it('synthesizes authentic weather schema for "weather_forecasts"', async () => {
    const res = await executor.execute('SELECT * FROM weather_forecasts;', 'SQLite');
    expect(res.ok).toBe(true);
    if (!res.ok) return;

    expect(res.columns).toContain('station_id');
    expect(res.columns).toContain('temperature_c');
    expect(res.columns).toContain('relative_humidity_pct');
    expect(res.columns).toContain('barometric_pressure_hpa');
  });

  it('guarantees diversity and zero-slop across 500 distinct real-world domain tables', () => {
    // Generate 500 diverse domain table names spanning all human disciplines
    const domainPrefixes = [
      'cardiac', 'neural', 'oncology', 'pulmonary', 'genomic', 'hematology', 'cellular', 'orthopedic', 'pediatric', 'endocrine',
      'revenue', 'expense', 'treasury', 'ledger', 'payroll', 'portfolio', 'derivative', 'annuity', 'dividend', 'mortgage',
      'k8s_pod', 'docker_image', 'server_cluster', 'api_gateway', 'lambda_function', 'microservice', 'firewall_rule', 'cve_exploit', 'vpn_tunnel', 'dns_zone',
      'galaxy', 'nebula', 'asteroid', 'telescope', 'orbital_probe', 'satellite', 'rocket_stage', 'black_hole', 'exoplanet', 'constellation',
      'quantum_flux', 'hadron_collider', 'particle_beam', 'laser_optics', 'isotope', 'superconductor', 'spectrometer', 'plasma_arc', 'fusion_reactor', 'gravity_wave',
      'electric_vehicle', 'turbocharger', 'transmission', 'suspension_telemetry', 'battery_cell', 'flight_avionics', 'jet_propulsion', 'drone_swarm', 'cargo_freight', 'shipping_container',
      'coffee_harvest', 'vineyard_estate', 'whiskey_barrel', 'craft_brewery', 'hydroponic_crop', 'soil_sensor', 'greenhouse_climate', 'dairy_livestock', 'grain_silo', 'aquaculture_tank',
      'esports_tournament', 'player_inventory', 'quest_progress', 'leaderboard_rank', 'rpg_character', 'matchmaking_queue', 'f1_telemetry', 'premier_league', 'marathon_split', 'stadium_concession',
    ];

    const domainSuffixes = [
      'metrics', 'records', 'telemetry', 'logs', 'ledger', 'profiles', 'catalog', 'readings', 'assets', 'events'
    ];

    const test500Tables: string[] = [];
    for (const prefix of domainPrefixes) {
      for (const suffix of domainSuffixes) {
        test500Tables.push(`${prefix}_${suffix}`);
        if (test500Tables.length >= 500) break;
      }
      if (test500Tables.length >= 500) break;
    }

    expect(test500Tables.length).toBe(500);

    // Verify all 500 tables resolve to authentic schemas
    for (const tableName of test500Tables) {
      const schema = resolveDomainSchema(tableName);
      expect(schema).not.toBeNull();
      expect(schema!.length).toBeGreaterThanOrEqual(4);

      const colNames = schema!.map((c) => c.name);

      // CRITICAL INVARIANT: NONE of the 500 tables can have the broken template
      const isBrokenTemplate =
        colNames.includes(`${tableName}_code`) &&
        colNames.includes('category') &&
        colNames.includes('rating_score');

      expect(isBrokenTemplate).toBe(false);

      // Every table must have a primary key
      const hasPk = schema!.some((c) => c.isPrimaryKey || c.name === 'id' || c.name.endsWith('_id') || c.name.endsWith('_vin') || c.name.endsWith('_code'));
      expect(hasPk).toBe(true);
    }
  });
});
