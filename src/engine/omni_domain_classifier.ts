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

  // ── High-Volume Real-World Semantic Domains ──────────────────────────────
  const isBio = ['organ', 'cell', 'tissue', 'bio', 'specimen', 'heart', 'lung', 'brain', 'blood', 'body', 'cardio', 'neural', 'gene', 'dna', 'protein'].some(k => clean.includes(k));
  if (isBio) {
    return [
      { name: 'id', logicalType: 'INTEGER', isPrimaryKey: true, fakerGenerator: () => faker.number.int({ min: 1001, max: 9999 }) },
      { name: `${clean}_id`, logicalType: 'VARCHAR', fakerGenerator: () => `BIO-${faker.string.alphanumeric(6).toUpperCase()}` },
      { name: `${clean}_name`, logicalType: 'VARCHAR', fakerGenerator: () => `${label} ${faker.helpers.arrayElement(['Tissue Section', 'Biopsy Sample', 'Cell Line', 'Vascular Cluster', 'Myocardial Complex', 'Neural Synapse'])}` },
      { name: 'biomarker_level', logicalType: 'NUMERIC', fakerGenerator: () => parseFloat(faker.number.float({ min: 12.0, max: 98.5, fractionDigits: 1 }).toFixed(1)) },
      { name: 'cell_viability_pct', logicalType: 'NUMERIC', fakerGenerator: () => parseFloat(faker.number.float({ min: 88.0, max: 99.8, fractionDigits: 1 }).toFixed(1)) },
      { name: 'health_status', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['VIABLE_ACTIVE', 'CRYOPRESERVED', 'INCUBATION_STAGE', 'NORMAL_HOMEOSTASIS']) },
      { name: 'recorded_at', logicalType: 'TIMESTAMP', fakerGenerator: () => faker.date.recent().toISOString().replace('T', ' ').substring(0, 19) },
    ];
  }

  const isFinancial = ['finance', 'money', 'cost', 'fee', 'charge', 'rate', 'price', 'profit', 'tax', 'fund', 'revenue', 'expense', 'budget', 'salary', 'invoice'].some(k => clean.includes(k));
  if (isFinancial) {
    return [
      { name: 'id', logicalType: 'INTEGER', isPrimaryKey: true, fakerGenerator: () => faker.number.int({ min: 1001, max: 9999 }) },
      { name: `${clean}_id`, logicalType: 'VARCHAR', fakerGenerator: () => `TX-${faker.string.alphanumeric(8).toUpperCase()}` },
      { name: 'amount_usd', logicalType: 'NUMERIC', fakerGenerator: () => parseFloat(faker.number.float({ min: 100.0, max: 85000.0, fractionDigits: 2 }).toFixed(2)) },
      { name: 'currency', logicalType: 'VARCHAR', fakerGenerator: () => 'USD' },
      { name: 'fiscal_period', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['2025-Q1', '2025-Q2', '2025-Q3', '2025-Q4', '2026-Q1']) },
      { name: 'payment_status', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['SETTLED', 'PENDING_CLEARANCE', 'RECONCILED', 'AUDITED']) },
      { name: 'settled_at', logicalType: 'TIMESTAMP', fakerGenerator: () => faker.date.recent().toISOString().replace('T', ' ').substring(0, 19) },
    ];
  }

  const isAcademic = ['student', 'course', 'exam', 'grade', 'university', 'college', 'professor', 'school', 'scholarship', 'class', 'lecture', 'subject', 'curriculum', 'thesis'].some(k => clean.includes(k));
  if (isAcademic) {
    return [
      { name: 'id', logicalType: 'INTEGER', isPrimaryKey: true, fakerGenerator: () => faker.number.int({ min: 1001, max: 9999 }) },
      { name: `${clean}_id`, logicalType: 'VARCHAR', fakerGenerator: () => `EDU-${faker.string.alphanumeric(6).toUpperCase()}` },
      { name: 'course_title', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['Advanced Algorithms', 'Quantum Mechanics II', 'Organic Chemistry Lab', 'Distributed Systems', 'Macroeconomics']) },
      { name: 'credits_count', logicalType: 'INTEGER', fakerGenerator: () => faker.helpers.arrayElement([3, 4, 5]) },
      { name: 'gpa_score', logicalType: 'NUMERIC', fakerGenerator: () => parseFloat(faker.number.float({ min: 2.8, max: 4.0, fractionDigits: 2 }).toFixed(2)) },
      { name: 'academic_standing', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['HONORS_LIST', 'GOOD_STANDING', 'PROBATION', 'DEANS_LIST']) },
      { name: 'enrolled_at', logicalType: 'TIMESTAMP', fakerGenerator: () => faker.date.recent({ days: 120 }).toISOString().replace('T', ' ').substring(0, 19) },
    ];
  }

  const isFaunaEcology = ['animal', 'species', 'fauna', 'wildlife', 'bird', 'fish', 'mammal', 'reptile', 'pet', 'dog', 'cat', 'insect', 'safari', 'habitat', 'zoo'].some(k => clean.includes(k));
  if (isFaunaEcology) {
    return [
      { name: 'id', logicalType: 'INTEGER', isPrimaryKey: true, fakerGenerator: () => faker.number.int({ min: 1001, max: 9999 }) },
      { name: 'species_id', logicalType: 'VARCHAR', fakerGenerator: () => `SPEC-${faker.string.alphanumeric(6).toUpperCase()}` },
      { name: 'common_name', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['Bengal Tiger', 'Snow Leopard', 'Blue Whale', 'Peregrine Falcon', 'Giant Panda', 'Sea Otter', 'Golden Eagle']) },
      { name: 'scientific_taxonomy', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['Panthera tigris tigris', 'Panthera uncia', 'Balaenoptera musculus', 'Falco peregrinus', 'Ailuropoda melanoleuca']) },
      { name: 'population_estimate', logicalType: 'INTEGER', fakerGenerator: () => faker.number.int({ min: 250, max: 45000 }) },
      { name: 'conservation_status', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['CRITICALLY_ENDANGERED', 'ENDANGERED', 'VULNERABLE', 'NEAR_THREATENED', 'LEAST_CONCERN']) },
      { name: 'biome_habitat', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['Alpine Tundra', 'Boreal Forest', 'Tropical Rainforest', 'Coral Reef', 'Savanna Grassland']) },
    ];
  }

  const isFloraBotany = ['plant', 'tree', 'flower', 'leaf', 'botanical', 'flora', 'forest', 'timber', 'seed', 'crop', 'herb', 'botany'].some(k => clean.includes(k));
  if (isFloraBotany) {
    return [
      { name: 'id', logicalType: 'INTEGER', isPrimaryKey: true, fakerGenerator: () => faker.number.int({ min: 1001, max: 9999 }) },
      { name: 'botanical_id', logicalType: 'VARCHAR', fakerGenerator: () => `BOT-${faker.string.alphanumeric(6).toUpperCase()}` },
      { name: 'common_name', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['Coast Redwood', 'Bristlecone Pine', 'Japanese Cherry', 'Giant Sequoia', 'Silver Birch', 'English Oak']) },
      { name: 'growth_rate_cm_yr', logicalType: 'NUMERIC', fakerGenerator: () => parseFloat(faker.number.float({ min: 15.0, max: 120.0, fractionDigits: 1 }).toFixed(1)) },
      { name: 'soil_ph_requirement', logicalType: 'NUMERIC', fakerGenerator: () => parseFloat(faker.number.float({ min: 5.5, max: 7.2, fractionDigits: 1 }).toFixed(1)) },
      { name: 'foliage_type', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['Evergreen Conifer', 'Deciduous Broadleaf', 'Broadleaf Evergreen', 'Succulent']) },
      { name: 'native_region', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['Pacific Northwest', 'Mediterranean Basin', 'East Asian Temperate', 'Himalayan Subalpine']) },
    ];
  }

  const isCulinaryFood = ['recipe', 'ingredient', 'dish', 'meal', 'chef', 'cuisine', 'restaurant', 'food', 'bakery', 'kitchen', 'flavor', 'diet'].some(k => clean.includes(k));
  if (isCulinaryFood) {
    return [
      { name: 'id', logicalType: 'INTEGER', isPrimaryKey: true, fakerGenerator: () => faker.number.int({ min: 1001, max: 9999 }) },
      { name: `${clean}_id`, logicalType: 'VARCHAR', fakerGenerator: () => `REC-${faker.string.alphanumeric(6).toUpperCase()}` },
      { name: 'dish_name', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['Truffle Tagliolini', 'Pan-Seared Scallops', 'Dry-Aged Ribeye', 'Saffron Risotto', 'Wild Berry Tart', 'Miso Glazed Black Cod']) },
      { name: 'cuisine_type', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['Italian Fine Dining', 'French Contemporary', 'Japanese Kaiseki', 'Basque Molecular', 'Nordic Foraged']) },
      { name: 'calories_kcal', logicalType: 'INTEGER', fakerGenerator: () => faker.number.int({ min: 280, max: 950 }) },
      { name: 'preparation_time_mins', logicalType: 'INTEGER', fakerGenerator: () => faker.number.int({ min: 15, max: 90 }) },
      { name: 'price_usd', logicalType: 'NUMERIC', fakerGenerator: () => parseFloat(faker.number.float({ min: 18.0, max: 95.0, fractionDigits: 2 }).toFixed(2)) },
    ];
  }

  const isEntertainmentMedia = ['music', 'song', 'album', 'track', 'artist', 'band', 'movie', 'film', 'cinema', 'video', 'podcast', 'show', 'theater'].some(k => clean.includes(k));
  if (isEntertainmentMedia) {
    return [
      { name: 'id', logicalType: 'INTEGER', isPrimaryKey: true, fakerGenerator: () => faker.number.int({ min: 1001, max: 9999 }) },
      { name: `${clean}_id`, logicalType: 'VARCHAR', fakerGenerator: () => `MED-${faker.string.alphanumeric(8).toUpperCase()}` },
      { name: 'title', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['Nocturne in C Minor', 'Solaris Horizons', 'Subterranean Echoes', 'The Velvet Paradox', 'Chasing Neon Ghosts', 'Symphony of Iron']) },
      { name: 'genre', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['Cyberpunk Ambient', 'Neo-Classical', 'Progressive Electronic', 'Orchestral Score', 'Post-Rock Instrumental']) },
      { name: 'duration_seconds', logicalType: 'INTEGER', fakerGenerator: () => faker.number.int({ min: 180, max: 480 }) },
      { name: 'stream_count', logicalType: 'INTEGER', fakerGenerator: () => faker.number.int({ min: 50000, max: 4800000 }) },
      { name: 'release_year', logicalType: 'INTEGER', fakerGenerator: () => faker.helpers.arrayElement([2023, 2024, 2025, 2026]) },
    ];
  }

  const isTransportAviation = ['flight', 'airline', 'airport', 'plane', 'aircraft', 'pilot', 'cargo', 'rail', 'train', 'vessel', 'transit', 'route'].some(k => clean.includes(k));
  if (isTransportAviation) {
    return [
      { name: 'id', logicalType: 'INTEGER', isPrimaryKey: true, fakerGenerator: () => faker.number.int({ min: 1001, max: 9999 }) },
      { name: 'carrier_code', logicalType: 'VARCHAR', fakerGenerator: () => `${faker.string.alpha({ length: 2, casing: 'upper' })}-${faker.number.int({ min: 100, max: 999 })}` },
      { name: 'origin_station', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['JFK Terminal 4', 'LHR Heathrow T5', 'HND Tokyo Haneda', 'DXB Dubai Gate 22', 'SIN Singapore Changi', 'FRA Frankfurt Hub']) },
      { name: 'destination_station', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['SFO San Francisco Gate B', 'CDG Paris Charles de Gaulle', 'SYD Sydney Kingsford', 'ZRH Zurich Kloten']) },
      { name: 'cruising_speed_kmh', logicalType: 'INTEGER', fakerGenerator: () => faker.number.int({ min: 450, max: 920 }) },
      { name: 'occupancy_pct', logicalType: 'NUMERIC', fakerGenerator: () => parseFloat(faker.number.float({ min: 72.0, max: 99.5, fractionDigits: 1 }).toFixed(1)) },
      { name: 'transit_status', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['EN_ROUTE_ON_TIME', 'GATE_DEPARTED', 'APPROACHING_RUNWAY', 'LANDED_TAXIING']) },
    ];
  }

  const isLegalGovernance = ['legal', 'law', 'contract', 'court', 'case', 'statute', 'judge', 'verdict', 'attorney', 'clause', 'patent', 'license'].some(k => clean.includes(k));
  if (isLegalGovernance) {
    return [
      { name: 'id', logicalType: 'INTEGER', isPrimaryKey: true, fakerGenerator: () => faker.number.int({ min: 1001, max: 9999 }) },
      { name: 'docket_id', logicalType: 'VARCHAR', fakerGenerator: () => `CASE-${faker.number.int({ min: 2024, max: 2026 })}-${faker.string.numeric(5)}` },
      { name: 'jurisdiction_court', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['U.S. Court of Appeals 2nd Cir.', 'High Court of Justice Chancery Div.', 'Delaware Court of Chancery', 'Federal Circuit IP Chamber']) },
      { name: 'matter_type', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['Intellectual Property Patent', 'Securities Class Action', 'Cross-Border Merger Antitrust', 'Commercial Breach of Contract']) },
      { name: 'compliance_state', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['PLEADINGS_CONCLUDED', 'DISCOVERY_IN_PROGRESS', 'SUMMARY_JUDGMENT_PENDING', 'DECREE_ENTERED']) },
      { name: 'filing_date', logicalType: 'TIMESTAMP', fakerGenerator: () => faker.date.past({ years: 1 }).toISOString().replace('T', ' ').substring(0, 10) },
    ];
  }

  const isTechDevops = ['server', 'cluster', 'container', 'node', 'pod', 'cloud', 'pipeline', 'deployment', 'endpoint', 'api', 'gateway', 'microservice'].some(k => clean.includes(k));
  if (isTechDevops) {
    return [
      { name: 'id', logicalType: 'INTEGER', isPrimaryKey: true, fakerGenerator: () => faker.number.int({ min: 1001, max: 9999 }) },
      { name: 'service_id', logicalType: 'VARCHAR', fakerGenerator: () => `SVC-${faker.string.alphanumeric(8).toLowerCase()}` },
      { name: 'instance_type', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['c7g.4xlarge', 'm6i.2xlarge', 'r6g.xlarge', 'g5.8xlarge-gpu', 't4g.nano']) },
      { name: 'cpu_utilization_pct', logicalType: 'NUMERIC', fakerGenerator: () => parseFloat(faker.number.float({ min: 14.5, max: 88.2, fractionDigits: 1 }).toFixed(1)) },
      { name: 'memory_usage_mb', logicalType: 'INTEGER', fakerGenerator: () => faker.number.int({ min: 1024, max: 32768 }) },
      { name: 'latency_p99_ms', logicalType: 'NUMERIC', fakerGenerator: () => parseFloat(faker.number.float({ min: 4.2, max: 48.0, fractionDigits: 1 }).toFixed(1)) },
      { name: 'health_status', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['HEALTHY_STABLE', 'AUTO_SCALING_UP', 'DEGRADED_FAILOVER', 'REPLICA_SYNCHRONIZED']) },
    ];
  }

  // Universal Contextual Entity Schema (Zero Slop Fallback)
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
      name: 'operational_tier',
      logicalType: 'VARCHAR',
      fakerGenerator: () => faker.helpers.arrayElement(['Strategic Enterprise', 'Production Standard', 'Experimental Lab', 'Long-Term Archive']),
    },
    {
      name: 'operational_status',
      logicalType: 'VARCHAR',
      fakerGenerator: () => faker.helpers.arrayElement(['ACTIVE_OPTIMAL', 'PENDING_VALIDATION', 'SYNCHRONIZED', 'ARCHIVED']),
    },
    {
      name: 'utilization_pct',
      logicalType: 'NUMERIC',
      fakerGenerator: () => parseFloat(faker.number.float({ min: 62.0, max: 99.4, fractionDigits: 1 }).toFixed(1)),
    },
    {
      name: 'last_calibrated_at',
      logicalType: 'TIMESTAMP',
      fakerGenerator: () => faker.date.recent({ days: 45 }).toISOString().replace('T', ' ').substring(0, 19),
    },
  ];
}

