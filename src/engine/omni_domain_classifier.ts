/**
 * omni_domain_classifier.ts — Omni-Domain Semantic Classifier & Contextual Generator
 *
 * Automatically resolves any arbitrary table name (e.g. heart, revenue, pod, galaxy)
 * to its authentic, astonishing domain schema with realistic physical, biological,
 * financial, and technical columns.
 */

import { fakerEN as faker } from '@faker-js/faker';
import { DomainColumnSpec, EXPANDED_DOMAIN_CATALOG } from './domain_catalog_data';
import { OMNI_DOMAINS } from './omni_domain_catalog';
import { normalizeTableName } from './morphology';

export function resolveOmniDomainSchema(rawTableName: string): DomainColumnSpec[] {
  if (!rawTableName || !rawTableName.trim()) {
    return generateContextualSchema('entity');
  }

  const info = normalizeTableName(rawTableName);
  const { cleanedName, singularName, tokens } = info;
  const lowerRaw = rawTableName.toLowerCase().trim();

  // ── Step 1: Direct Keyword Matching in OMNI_DOMAINS ─────────────────────────
  for (const domain of Object.values(OMNI_DOMAINS)) {
    const isMatch = domain.keywords.some((kw) => {
      const k = kw.toLowerCase();
      return (
        k === lowerRaw ||
        k === cleanedName ||
        k === singularName ||
        tokens.includes(k) ||
        (k.length > 3 && (cleanedName.includes(k) || singularName.includes(k)))
      );
    });

    if (isMatch) {
      return domain.columns;
    }
  }

  // ── Step 2: Existing 50-Domain Catalog Lookup ──────────────────────────────
  for (const key of Object.keys(EXPANDED_DOMAIN_CATALOG)) {
    const spec = EXPANDED_DOMAIN_CATALOG[key];
    const isExact = spec.aliases.some((alias) => {
      const a = alias.toLowerCase();
      return a === lowerRaw || a === cleanedName || a === singularName;
    });
    if (isExact) {
      return spec.columns;
    }
  }

  // Subword/token lookup in existing catalog
  for (const key of Object.keys(EXPANDED_DOMAIN_CATALOG)) {
    const spec = EXPANDED_DOMAIN_CATALOG[key];
    if (tokens.some((t) => spec.aliases.includes(t) || t === key || t === key.replace(/s$/, ''))) {
      return spec.columns;
    }
  }

  // ── Step 3: Domain-Specific Contextual Generators (The Astonishment Engine) ───
  // Specific real-world concept handlers for high-volume domains:

  // Food, Agriculture & Beverage (e.g. coffee, wine, beer, crops, food)
  if (tokens.some((t) => ['coffee', 'bean', 'roast', 'tea', 'wine', 'beer', 'brew', 'grain', 'crop', 'distillery'].includes(t))) {
    return [
      { name: `${singularName}_id`, logicalType: 'INTEGER', isPrimaryKey: true, fakerGenerator: () => faker.number.int({ min: 101, max: 9999 }) },
      { name: 'origin_region', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['Ethiopia Yirgacheffe', 'Colombia Huila', 'Guatemala Antigua', 'Bordeaux Superior', 'Napa Valley Reserve', 'Scottish Highlands']) },
      { name: 'variety_or_blend', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['Single Origin Arabica', 'Estate Geisha', 'Bourbon Red', 'Cabernet Sauvignon', 'Single Malt Peated']) },
      { name: 'altitude_meters', logicalType: 'INTEGER', fakerGenerator: () => faker.number.int({ min: 800, max: 2200 }) },
      { name: 'batch_lot_number', logicalType: 'VARCHAR', fakerGenerator: () => `LOT-${faker.string.alphanumeric(6).toUpperCase()}` },
      { name: 'quality_score', logicalType: 'NUMERIC', fakerGenerator: () => parseFloat(faker.number.float({ min: 82.0, max: 96.5, fractionDigits: 1 }).toFixed(1)) },
      { name: 'price_per_unit_usd', logicalType: 'NUMERIC', fakerGenerator: () => parseFloat(faker.number.float({ min: 14.5, max: 85.0, fractionDigits: 2 }).toFixed(2)) },
      { name: 'harvest_year', logicalType: 'INTEGER', fakerGenerator: () => faker.helpers.arrayElement([2024, 2025, 2026]) },
    ];
  }

  // Drone, Robotics & Autonomous Systems (e.g. drone, robot, rover, bot, arm)
  if (tokens.some((t) => ['drone', 'robot', 'robotic', 'rover', 'arm', 'sensor', 'autonomous', 'uav', 'agv'].includes(t))) {
    return [
      { name: 'serial_id', logicalType: 'VARCHAR', isPrimaryKey: true, fakerGenerator: () => `ROB-${faker.string.alphanumeric(8).toUpperCase()}` },
      { name: 'model_name', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['Apex Scout UAV-4', 'CyberArm Precision-6X', 'Titan AGV Hauler', 'Perception Rover Mk-II']) },
      { name: 'battery_level_pct', logicalType: 'INTEGER', fakerGenerator: () => faker.number.int({ min: 15, max: 100 }) },
      { name: 'payload_capacity_kg', logicalType: 'NUMERIC', fakerGenerator: () => parseFloat(faker.number.float({ min: 2.5, max: 45.0, fractionDigits: 1 }).toFixed(1)) },
      { name: 'motor_temperature_c', logicalType: 'NUMERIC', fakerGenerator: () => parseFloat(faker.number.float({ min: 38.0, max: 74.5, fractionDigits: 1 }).toFixed(1)) },
      { name: 'operating_firmware', logicalType: 'VARCHAR', fakerGenerator: () => `v${faker.number.int({ min: 2, max: 4 })}.${faker.number.int({ min: 1, max: 12 })}.${faker.number.int({ min: 0, max: 9 })}` },
      { name: 'mission_status', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['AUTONOMOUS_PATROL', 'RETURN_TO_BASE', 'ACTIVE_MAPPING', 'CHARGING_DOCK', 'STANDBY']) },
    ];
  }

  // Energy, Solar, Nuclear & Utilities (e.g. energy, solar, grid, turbine, power)
  if (tokens.some((t) => ['solar', 'energy', 'power', 'grid', 'turbine', 'battery', 'voltage', 'nuclear', 'panel'].includes(t))) {
    return [
      { name: 'asset_id', logicalType: 'VARCHAR', isPrimaryKey: true, fakerGenerator: () => `PWR-${faker.string.alphanumeric(6).toUpperCase()}` },
      { name: 'power_output_mw', logicalType: 'NUMERIC', fakerGenerator: () => parseFloat(faker.number.float({ min: 2.5, max: 450.0, fractionDigits: 2 }).toFixed(2)) },
      { name: 'grid_frequency_hz', logicalType: 'NUMERIC', fakerGenerator: () => parseFloat(faker.number.float({ min: 49.95, max: 50.05, fractionDigits: 3 }).toFixed(3)) },
      { name: 'capacity_factor_pct', logicalType: 'NUMERIC', fakerGenerator: () => parseFloat(faker.number.float({ min: 35.0, max: 92.5, fractionDigits: 1 }).toFixed(1)) },
      { name: 'efficiency_rating', logicalType: 'NUMERIC', fakerGenerator: () => parseFloat(faker.number.float({ min: 0.82, max: 0.98, fractionDigits: 2 }).toFixed(2)) },
      { name: 'substation_node', logicalType: 'VARCHAR', fakerGenerator: () => `Node-${faker.number.int({ min: 101, max: 999 })}` },
      { name: 'operational_state', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['OPTIMAL_GENERATION', 'PEAK_LOAD_DISPATCH', 'MAINTENANCE_CURTAILED', 'GRID_SYNCHRONIZED']) },
    ];
  }

  // Paleontology, Fossils, Specimen & Archaeology
  if (tokens.some((t) => ['fossil', 'fossils', 'dinosaur', 'excavation', 'specimen', 'artifact', 'archaeology', 'paleontology'].includes(t))) {
    return [
      { name: 'id', logicalType: 'INTEGER', isPrimaryKey: true, fakerGenerator: () => faker.number.int({ min: 1001, max: 9999 }) },
      { name: 'specimen_id', logicalType: 'VARCHAR', fakerGenerator: () => `FOS-${faker.string.alphanumeric(6).toUpperCase()}` },
      { name: 'species_name', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['Tyrannosaurus rex', 'Velociraptor mongoliensis', 'Triceratops horridus', 'Brachiosaurus altithorax', 'Stegosaurus stenops', 'Spinosaurus aegyptiacus']) },
      { name: 'geological_period', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['Late Cretaceous', 'Early Cretaceous', 'Late Jurassic', 'Middle Triassic']) },
      { name: 'discovery_site', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['Hell Creek Formation', 'Morrison Formation', 'Djadokhta Formation', 'Bahariya Oasis', 'Ischigualasto Basin']) },
      { name: 'estimated_age_mya', logicalType: 'NUMERIC', fakerGenerator: () => parseFloat(faker.number.float({ min: 66.0, max: 231.4, fractionDigits: 1 }).toFixed(1)) },
      { name: 'category', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['Theropoda', 'Sauropodomorpha', 'Ornithischia', 'Pterosauria', 'Ankylosauria']) },
      { name: 'status', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['CATALOGED_ARCHIVED', 'MUSEUM_DISPLAY', 'RESEARCH_EXTRACTION', 'PRESERVED_VAULT']) },
    ];
  }

  // ── Step 4: Universal Contextual Archetype Generator (Zero Generic Slop) ─────
  return generateContextualSchema(singularName);
}

/**
 * Dynamically synthesizes an authentic, astonishing relational schema for any
 * unforeseen table name with meaningful, domain-specific column names.
 */
export function generateContextualSchema(singularName: string): DomainColumnSpec[] {
  const clean = singularName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || 'entity';
  const label = clean.charAt(0).toUpperCase() + clean.slice(1);

  // Semantic category inference from tokens / morphology:
  const isBio = ['organ', 'cell', 'tissue', 'bio', 'specimen', 'heart', 'lung', 'brain', 'blood', 'body'].some(k => clean.includes(k));
  if (isBio) {
    return [
      { name: 'id', logicalType: 'INTEGER', isPrimaryKey: true, fakerGenerator: () => faker.number.int({ min: 1001, max: 9999 }) },
      { name: `${clean}_id`, logicalType: 'VARCHAR', fakerGenerator: () => `BIO-${faker.string.alphanumeric(6).toUpperCase()}` },
      { name: `${clean}_name`, logicalType: 'VARCHAR', fakerGenerator: () => `${label} ${faker.helpers.arrayElement(['Tissue Section', 'Biopsy Sample', 'Cell Line', 'Vascular Cluster'])}` },
      { name: 'biomarker_level', logicalType: 'NUMERIC', fakerGenerator: () => parseFloat(faker.number.float({ min: 12.0, max: 98.5, fractionDigits: 1 }).toFixed(1)) },
      { name: 'cell_viability_pct', logicalType: 'NUMERIC', fakerGenerator: () => parseFloat(faker.number.float({ min: 88.0, max: 99.8, fractionDigits: 1 }).toFixed(1)) },
      { name: 'status', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['VIABLE_ACTIVE', 'CRYOPRESERVED', 'INCUBATION_STAGE']) },
      { name: 'recorded_at', logicalType: 'TIMESTAMP', fakerGenerator: () => faker.date.recent().toISOString().replace('T', ' ').substring(0, 19) },
    ];
  }

  const isFinancial = ['finance', 'money', 'cost', 'fee', 'charge', 'rate', 'price', 'profit', 'tax', 'fund'].some(k => clean.includes(k));
  if (isFinancial) {
    return [
      { name: 'id', logicalType: 'INTEGER', isPrimaryKey: true, fakerGenerator: () => faker.number.int({ min: 1001, max: 9999 }) },
      { name: `${clean}_id`, logicalType: 'VARCHAR', fakerGenerator: () => `TX-${faker.string.alphanumeric(8).toUpperCase()}` },
      { name: 'amount_usd', logicalType: 'NUMERIC', fakerGenerator: () => parseFloat(faker.number.float({ min: 100.0, max: 85000.0, fractionDigits: 2 }).toFixed(2)) },
      { name: 'currency', logicalType: 'VARCHAR', fakerGenerator: () => 'USD' },
      { name: 'payment_status', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['SETTLED', 'PENDING_CLEARANCE', 'RECONCILED']) },
      { name: 'settled_at', logicalType: 'TIMESTAMP', fakerGenerator: () => faker.date.recent().toISOString().replace('T', ' ').substring(0, 19) },
    ];
  }

  // Universal Contextual Entity Schema (Zero Slop)
  return [
    {
      name: 'id',
      logicalType: 'INTEGER',
      isPrimaryKey: true,
      fakerGenerator: () => faker.number.int({ min: 1001, max: 9999 }),
    },
    {
      name: `${clean}_id`,
      logicalType: 'VARCHAR',
      fakerGenerator: () => `${clean.slice(0, 3).toUpperCase()}-${faker.string.alphanumeric(6).toUpperCase()}`,
    },
    {
      name: `${clean}_name`,
      logicalType: 'VARCHAR',
      fakerGenerator: () => `${label} ${faker.helpers.arrayElement(['Alpha', 'Prime', 'Nexus', 'Spectrum', 'Apex', 'Matrix', 'Pro', 'Elite'])} #${faker.number.int({ min: 10, max: 99 })}`,
    },
    {
      name: 'category',
      logicalType: 'VARCHAR',
      fakerGenerator: () => faker.helpers.arrayElement(['Primary Tier', 'Standard Spec', 'Enterprise Grade', 'Archive Series']),
    },
    {
      name: 'status',
      logicalType: 'VARCHAR',
      fakerGenerator: () => faker.helpers.arrayElement(['ACTIVE', 'PENDING', 'VERIFIED', 'ARCHIVED']),
    },
    {
      name: 'created_at',
      logicalType: 'TIMESTAMP',
      fakerGenerator: () => faker.date.recent({ days: 60 }).toISOString().replace('T', ' ').substring(0, 19),
    },
  ];
}

