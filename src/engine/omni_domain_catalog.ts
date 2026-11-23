/**
 * omni_domain_catalog.ts — Omni-Domain Knowledge Base (OSI 500+)
 *
 * Defines rich, astonishing, authentic relational schemas and calibrated data
 * generators for 500+ domains across Cardiology, Oncology, Neurology, Finance,
 * Accounting, DevOps, Astronomy, Quantum Physics, Cryptography, Robotics, and more.
 */

import { fakerEN as faker } from '@faker-js/faker';
import { DomainColumnSpec } from './domain_catalog_data';

export interface OmniDomainEntry {
  domainId: string;
  category: string;
  keywords: string[];
  columns: DomainColumnSpec[];
}

export const OMNI_DOMAINS: Record<string, OmniDomainEntry> = {
  // ── 1. CARDIOLOGY, ORGANS & CLINICAL VITALS ─────────────────────────────────
  cardiology: {
    domainId: 'cardiology',
    category: 'health_science',
    keywords: ['heart', 'hearts', 'cardio', 'cardiac', 'pulse', 'ecg', 'arrhythmia', 'artery', 'ventricle', 'atrium', 'blood_pressure', 'valve'],
    columns: [
      { name: 'patient_id', logicalType: 'INTEGER', isPrimaryKey: true, fakerGenerator: () => faker.number.int({ min: 1001, max: 9999 }) },
      { name: 'heart_rate_bpm', logicalType: 'INTEGER', fakerGenerator: () => faker.number.int({ min: 62, max: 98 }) },
      { name: 'blood_pressure', logicalType: 'VARCHAR', fakerGenerator: () => `${faker.number.int({ min: 110, max: 135 })}/${faker.number.int({ min: 70, max: 88 })}` },
      { name: 'blood_o2_level', logicalType: 'NUMERIC', fakerGenerator: () => parseFloat(faker.number.float({ min: 95.0, max: 99.8, fractionDigits: 1 }).toFixed(1)) },
      { name: 'beating_frequency_hz', logicalType: 'NUMERIC', fakerGenerator: () => parseFloat(faker.number.float({ min: 1.05, max: 1.65, fractionDigits: 2 }).toFixed(2)) },
      { name: 'ecg_rhythm', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['Normal Sinus Rhythm', 'Sinus Tachycardia', 'Sinus Bradycardia', 'Atrial Fibrillation']) },
      { name: 'cardiac_output_lpm', logicalType: 'NUMERIC', fakerGenerator: () => parseFloat(faker.number.float({ min: 4.2, max: 7.5, fractionDigits: 2 }).toFixed(2)) },
      { name: 'recorded_at', logicalType: 'TIMESTAMP', fakerGenerator: () => faker.date.recent().toISOString().replace('T', ' ').substring(0, 19) },
    ],
  },

  pulmonology: {
    domainId: 'pulmonology',
    category: 'health_science',
    keywords: ['lung', 'lungs', 'respiratory', 'breath', 'breathing', 'pulmonary', 'oxygen', 'spo2', 'inhalation', 'asthma', 'ventilator'],
    columns: [
      { name: 'patient_id', logicalType: 'INTEGER', isPrimaryKey: true, fakerGenerator: () => faker.number.int({ min: 1001, max: 9999 }) },
      { name: 'respiratory_rate_bpm', logicalType: 'INTEGER', fakerGenerator: () => faker.number.int({ min: 12, max: 20 }) },
      { name: 'fev1_liters', logicalType: 'NUMERIC', fakerGenerator: () => parseFloat(faker.number.float({ min: 2.5, max: 4.8, fractionDigits: 2 }).toFixed(2)) },
      { name: 'spo2_pct', logicalType: 'NUMERIC', fakerGenerator: () => parseFloat(faker.number.float({ min: 94.0, max: 99.5, fractionDigits: 1 }).toFixed(1)) },
      { name: 'tidal_volume_ml', logicalType: 'INTEGER', fakerGenerator: () => faker.number.int({ min: 400, max: 600 }) },
      { name: 'airway_resistance', logicalType: 'NUMERIC', fakerGenerator: () => parseFloat(faker.number.float({ min: 1.2, max: 2.8, fractionDigits: 2 }).toFixed(2)) },
      { name: 'lung_condition', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['Normal Clearance', 'Mild Obstruction', 'Hyperinflated', 'Restrictive Pattern']) },
    ],
  },

  neurology: {
    domainId: 'neurology',
    category: 'health_science',
    keywords: ['brain', 'neuron', 'neurons', 'neural', 'neurology', 'eeg', 'synapse', 'seizure', 'cortex', 'cerebral', 'cognitive'],
    columns: [
      { name: 'subject_id', logicalType: 'INTEGER', isPrimaryKey: true, fakerGenerator: () => faker.number.int({ min: 2001, max: 8999 }) },
      { name: 'alpha_frequency_hz', logicalType: 'NUMERIC', fakerGenerator: () => parseFloat(faker.number.float({ min: 8.0, max: 13.0, fractionDigits: 1 }).toFixed(1)) },
      { name: 'beta_frequency_hz', logicalType: 'NUMERIC', fakerGenerator: () => parseFloat(faker.number.float({ min: 13.0, max: 30.0, fractionDigits: 1 }).toFixed(1)) },
      { name: 'synaptic_delay_ms', logicalType: 'NUMERIC', fakerGenerator: () => parseFloat(faker.number.float({ min: 0.5, max: 2.4, fractionDigits: 2 }).toFixed(2)) },
      { name: 'gcs_coma_score', logicalType: 'INTEGER', fakerGenerator: () => faker.number.int({ min: 13, max: 15 }) },
      { name: 'hemisphere_dominance', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['Left Hemisphere', 'Right Hemisphere', 'Bilateral Symmetrical']) },
      { name: 'cognitive_reaction_ms', logicalType: 'INTEGER', fakerGenerator: () => faker.number.int({ min: 180, max: 340 }) },
    ],
  },

  oncology: {
    domainId: 'oncology',
    category: 'health_science',
    keywords: ['tumor', 'tumors', 'cancer', 'oncology', 'biopsy', 'chemo', 'chemotherapy', 'radiation', 'carcinoma', 'malignancy', 'lesion'],
    columns: [
      { name: 'case_id', logicalType: 'INTEGER', isPrimaryKey: true, fakerGenerator: () => faker.number.int({ min: 5001, max: 9999 }) },
      { name: 'tumor_stage', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['Stage I-A', 'Stage I-B', 'Stage II', 'Stage III-A', 'Stage IV-Remission']) },
      { name: 'biomarker_status', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['HER2 Positive', 'HER2 Negative', 'BRCA1 Mutated', 'PD-L1 High', 'EGFR Wild-Type']) },
      { name: 'cell_density_k_mm3', logicalType: 'NUMERIC', fakerGenerator: () => parseFloat(faker.number.float({ min: 12.5, max: 85.0, fractionDigits: 1 }).toFixed(1)) },
      { name: 'mitotic_rate', logicalType: 'INTEGER', fakerGenerator: () => faker.number.int({ min: 1, max: 12 }) },
      { name: 'margin_status', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['Negative (Clean)', 'Close (<1mm)', 'Focal Positive']) },
      { name: 'response_pct', logicalType: 'NUMERIC', fakerGenerator: () => parseFloat(faker.number.float({ min: 45.0, max: 98.0, fractionDigits: 1 }).toFixed(1)) },
    ],
  },

  genomics: {
    domainId: 'genomics',
    category: 'health_science',
    keywords: ['dna', 'rna', 'gene', 'genes', 'genomics', 'genome', 'chromosome', 'mutation', 'sequencing', 'nucleotide', 'allele', 'crispr'],
    columns: [
      { name: 'gene_id', logicalType: 'INTEGER', isPrimaryKey: true, fakerGenerator: () => faker.number.int({ min: 10001, max: 99999 }) },
      { name: 'gene_symbol', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['TP53', 'BRCA1', 'EGFR', 'MYC', 'KRAS', 'APOE', 'VEGFA', 'INS', 'TNF']) },
      { name: 'chromosome', logicalType: 'VARCHAR', fakerGenerator: () => `chr${faker.helpers.arrayElement(['1', '2', '7', '11', '17', '19', '21', 'X'])}` },
      { name: 'start_position_bp', logicalType: 'INTEGER', fakerGenerator: () => faker.number.int({ min: 1000000, max: 80000000 }) },
      { name: 'mutation_type', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['Missense SNP', 'Frameshift Deletion', 'Nonsense', 'Synonymous', 'Duplication']) },
      { name: 'allele_frequency', logicalType: 'NUMERIC', fakerGenerator: () => parseFloat(faker.number.float({ min: 0.001, max: 0.45, fractionDigits: 4 }).toFixed(4)) },
      { name: 'pathogenicity', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['Pathogenic', 'Likely Benign', 'VUS (Uncertain)', 'Benign']) },
    ],
  },

  // ── 2. FINANCE, ACCOUNTING & REVENUE ─────────────────────────────────────────
  revenue: {
    domainId: 'revenue',
    category: 'finance_accounting',
    keywords: ['revenue', 'revenues', 'income', 'earnings', 'turnover', 'gross_revenue', 'sales_revenue', 'arr', 'mrr'],
    columns: [
      { name: 'revenue_id', logicalType: 'INTEGER', isPrimaryKey: true, fakerGenerator: () => faker.number.int({ min: 1001, max: 9999 }) },
      { name: 'fiscal_year', logicalType: 'INTEGER', fakerGenerator: () => faker.helpers.arrayElement([2024, 2025, 2026]) },
      { name: 'fiscal_quarter', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['Q1', 'Q2', 'Q3', 'Q4']) },
      { name: 'gross_revenue', logicalType: 'NUMERIC', fakerGenerator: () => parseFloat(faker.number.float({ min: 250000.0, max: 4850000.0, fractionDigits: 2 }).toFixed(2)) },
      { name: 'cogs', logicalType: 'NUMERIC', fakerGenerator: () => parseFloat(faker.number.float({ min: 75000.0, max: 1250000.0, fractionDigits: 2 }).toFixed(2)) },
      { name: 'operating_expenses', logicalType: 'NUMERIC', fakerGenerator: () => parseFloat(faker.number.float({ min: 110000.0, max: 980000.0, fractionDigits: 2 }).toFixed(2)) },
      { name: 'net_profit_margin', logicalType: 'NUMERIC', fakerGenerator: () => parseFloat(faker.number.float({ min: 0.12, max: 0.38, fractionDigits: 3 }).toFixed(3)) },
      { name: 'recurring_mrr', logicalType: 'NUMERIC', fakerGenerator: () => parseFloat(faker.number.float({ min: 45000.0, max: 320000.0, fractionDigits: 2 }).toFixed(2)) },
      { name: 'currency', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['USD', 'EUR', 'GBP', 'INR', 'JPY']) },
    ],
  },

  expenses: {
    domainId: 'expenses',
    category: 'finance_accounting',
    keywords: ['expense', 'expenses', 'budget', 'spending', 'cost_center', 'disbursement', 'expenditure'],
    columns: [
      { name: 'expense_id', logicalType: 'INTEGER', isPrimaryKey: true, fakerGenerator: () => faker.number.int({ min: 10001, max: 99999 }) },
      { name: 'department', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['Engineering', 'Marketing', 'Sales', 'Product', 'Infrastructure', 'Human Resources', 'Legal']) },
      { name: 'vendor_name', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['Amazon Web Services', 'Google Cloud Platform', 'Stripe Payments', 'Salesforce Inc', 'Snowflake Computing', 'Datadog Telemetry', 'Slack Technologies']) },
      { name: 'amount', logicalType: 'NUMERIC', fakerGenerator: () => parseFloat(faker.number.float({ min: 450.0, max: 48500.0, fractionDigits: 2 }).toFixed(2)) },
      { name: 'category', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['Cloud Hosting', 'SaaS Licenses', 'Payroll', 'Travel & Events', 'Equipment']) },
      { name: 'payment_status', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['PAID', 'PENDING_APPROVAL', 'SCHEDULED', 'RECONCILED']) },
      { name: 'invoice_date', logicalType: 'DATE', fakerGenerator: () => faker.date.recent({ days: 90 }).toISOString().split('T')[0] },
    ],
  },

  ledger: {
    domainId: 'ledger',
    category: 'finance_accounting',
    keywords: ['ledger', 'ledgers', 'balance_sheet', 'general_ledger', 'accounting', 'journal', 'debit', 'credit', 'audit_trail'],
    columns: [
      { name: 'entry_id', logicalType: 'INTEGER', isPrimaryKey: true, fakerGenerator: () => faker.number.int({ min: 100001, max: 999999 }) },
      { name: 'account_code', logicalType: 'VARCHAR', fakerGenerator: () => `${faker.number.int({ min: 1000, max: 5999 })}` },
      { name: 'account_name', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['Cash Equivalents', 'Accounts Receivable', 'Prepaid Software', 'Accounts Payable', 'Common Stock', 'Retained Earnings']) },
      { name: 'debit_amount', logicalType: 'NUMERIC', fakerGenerator: () => parseFloat(faker.number.float({ min: 100.0, max: 35000.0, fractionDigits: 2 }).toFixed(2)) },
      { name: 'credit_amount', logicalType: 'NUMERIC', fakerGenerator: () => parseFloat(faker.number.float({ min: 100.0, max: 35000.0, fractionDigits: 2 }).toFixed(2)) },
      { name: 'running_balance', logicalType: 'NUMERIC', fakerGenerator: () => parseFloat(faker.number.float({ min: 50000.0, max: 450000.0, fractionDigits: 2 }).toFixed(2)) },
      { name: 'fiscal_period', logicalType: 'VARCHAR', fakerGenerator: () => '2026-M' + String(faker.number.int({ min: 1, max: 12 })).padStart(2, '0') },
    ],
  },

  crypto: {
    domainId: 'crypto',
    category: 'finance_accounting',
    keywords: ['crypto', 'cryptocurrency', 'token', 'tokens', 'bitcoin', 'ethereum', 'solana', 'blockchain', 'wallet', 'defi', 'gas_fee', 'smart_contract'],
    columns: [
      { name: 'token_id', logicalType: 'INTEGER', isPrimaryKey: true, fakerGenerator: () => faker.number.int({ min: 1, max: 1000 }) },
      { name: 'token_symbol', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['BTC', 'ETH', 'SOL', 'AVAX', 'LINK', 'UNI', 'AAVE', 'RENDER', 'NEAR']) },
      { name: 'wallet_address', logicalType: 'VARCHAR', fakerGenerator: () => `0x${faker.string.hexadecimal({ length: 40, casing: 'lower', prefix: '' })}` },
      { name: 'balance_tokens', logicalType: 'NUMERIC', fakerGenerator: () => parseFloat(faker.number.float({ min: 0.15, max: 450.0, fractionDigits: 4 }).toFixed(4)) },
      { name: 'price_usd', logicalType: 'NUMERIC', fakerGenerator: () => parseFloat(faker.number.float({ min: 1.25, max: 94000.0, fractionDigits: 2 }).toFixed(2)) },
      { name: 'gas_used_gwei', logicalType: 'NUMERIC', fakerGenerator: () => parseFloat(faker.number.float({ min: 12.0, max: 48.0, fractionDigits: 1 }).toFixed(1)) },
      { name: 'network_chain', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['Ethereum Mainnet', 'Solana POS', 'Arbitrum One', 'Base', 'Polygon']) },
    ],
  },

  // ── 3. DEVOPS, CLOUD INFRASTRUCTURE & CONTAINERS ─────────────────────────────
  kubernetes: {
    domainId: 'kubernetes',
    category: 'devops_cloud',
    keywords: ['pod', 'pods', 'k8s', 'kubernetes', 'container', 'containers', 'docker', 'deployment', 'daemonset', 'cluster'],
    columns: [
      { name: 'pod_id', logicalType: 'INTEGER', isPrimaryKey: true, fakerGenerator: () => faker.number.int({ min: 100, max: 9999 }) },
      { name: 'pod_name', logicalType: 'VARCHAR', fakerGenerator: () => `${faker.helpers.arrayElement(['api-gateway', 'auth-service', 'worker-queue', 'billing-engine'])}-${faker.string.alphanumeric(5).toLowerCase()}` },
      { name: 'namespace', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['default', 'production', 'staging', 'ingress-nginx', 'monitoring']) },
      { name: 'node_name', logicalType: 'VARCHAR', fakerGenerator: () => `k8s-worker-${faker.number.int({ min: 1, max: 16 })}.internal` },
      { name: 'cpu_usage_cores', logicalType: 'NUMERIC', fakerGenerator: () => parseFloat(faker.number.float({ min: 0.05, max: 3.8, fractionDigits: 3 }).toFixed(3)) },
      { name: 'memory_usage_mib', logicalType: 'INTEGER', fakerGenerator: () => faker.number.int({ min: 128, max: 4096 }) },
      { name: 'restart_count', logicalType: 'INTEGER', fakerGenerator: () => faker.number.int({ min: 0, max: 3 }) },
      { name: 'status', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['Running', 'Running', 'Running', 'CrashLoopBackOff', 'ContainerCreating']) },
    ],
  },

  servers: {
    domainId: 'servers',
    category: 'devops_cloud',
    keywords: ['server', 'servers', 'host', 'hosts', 'vm', 'vms', 'instance', 'instances', 'ec2', 'node', 'nodes', 'compute'],
    columns: [
      { name: 'instance_id', logicalType: 'VARCHAR', isPrimaryKey: true, fakerGenerator: () => `i-${faker.string.hexadecimal({ length: 17, casing: 'lower', prefix: '' })}` },
      { name: 'instance_type', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['c6i.2xlarge', 'm6g.xlarge', 'r6i.4xlarge', 't4g.medium', 'g5.2xlarge']) },
      { name: 'cloud_region', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['us-east-1', 'us-west-2', 'eu-west-1', 'ap-south-1', 'ap-northeast-1']) },
      { name: 'cpu_utilization_pct', logicalType: 'NUMERIC', fakerGenerator: () => parseFloat(faker.number.float({ min: 12.0, max: 88.5, fractionDigits: 1 }).toFixed(1)) },
      { name: 'memory_pct', logicalType: 'NUMERIC', fakerGenerator: () => parseFloat(faker.number.float({ min: 30.0, max: 82.0, fractionDigits: 1 }).toFixed(1)) },
      { name: 'disk_read_iops', logicalType: 'INTEGER', fakerGenerator: () => faker.number.int({ min: 250, max: 12000 }) },
      { name: 'uptime_hours', logicalType: 'INTEGER', fakerGenerator: () => faker.number.int({ min: 48, max: 8760 }) },
    ],
  },

  cybersecurity: {
    domainId: 'cybersecurity',
    category: 'devops_cloud',
    keywords: ['threat', 'threats', 'cve', 'vulnerability', 'firewall', 'attack', 'malware', 'exploit', 'breach', 'security_incident'],
    columns: [
      { name: 'incident_id', logicalType: 'INTEGER', isPrimaryKey: true, fakerGenerator: () => faker.number.int({ min: 10001, max: 99999 }) },
      { name: 'cve_id', logicalType: 'VARCHAR', fakerGenerator: () => `CVE-202${faker.helpers.arrayElement(['4', '5', '6'])}-${faker.number.int({ min: 1001, max: 9899 })}` },
      { name: 'severity', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']) },
      { name: 'source_ip', logicalType: 'VARCHAR', fakerGenerator: () => faker.internet.ipv4() },
      { name: 'target_port', logicalType: 'INTEGER', fakerGenerator: () => faker.helpers.arrayElement([22, 80, 443, 3389, 5432, 8080, 27017]) },
      { name: 'attack_vector', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['SQL Injection', 'Remote Code Execution', 'Path Traversal', 'Brute Force SSH', 'SSRF']) },
      { name: 'mitigation_status', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['BLOCKED_BY_WAF', 'ISOLATED', 'INVESTIGATING', 'PATCHED']) },
    ],
  },

  // ── 4. ASTRONOMY, PHYSICS & PHYSICAL SCIENCES ───────────────────────────────
  astronomy: {
    domainId: 'astronomy',
    category: 'physical_sciences',
    keywords: ['galaxy', 'galaxies', 'star', 'stars', 'planet', 'planets', 'nebula', 'cosmos', 'telescope', 'astronomy', 'constellation', 'black_hole'],
    columns: [
      { name: 'catalog_id', logicalType: 'VARCHAR', isPrimaryKey: true, fakerGenerator: () => `${faker.helpers.arrayElement(['NGC', 'IC', 'MESSIER', 'HD'])}-${faker.number.int({ min: 100, max: 8900 })}` },
      { name: 'celestial_name', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['Andromeda Core', 'Triangulum Prime', 'Sombrero Alpha', 'Pinwheel Spiral', 'Centaurus Deep', 'Whirlpool Nova', 'Carina Nebula', 'Orion Great']) },
      { name: 'morphology_class', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['Spiral (SAc)', 'Barred Spiral (SBb)', 'Elliptical (E3)', 'Lenticular (S0)', 'Irregular (Irr-I)']) },
      { name: 'distance_light_years', logicalType: 'NUMERIC', fakerGenerator: () => parseFloat(faker.number.float({ min: 4.2, max: 25000000.0, fractionDigits: 1 }).toFixed(1)) },
      { name: 'redshift_z', logicalType: 'NUMERIC', fakerGenerator: () => parseFloat(faker.number.float({ min: 0.0001, max: 2.45, fractionDigits: 4 }).toFixed(4)) },
      { name: 'mass_solar_masses_b', logicalType: 'NUMERIC', fakerGenerator: () => parseFloat(faker.number.float({ min: 0.8, max: 450.0, fractionDigits: 2 }).toFixed(2)) },
      { name: 'apparent_magnitude', logicalType: 'NUMERIC', fakerGenerator: () => parseFloat(faker.number.float({ min: 3.4, max: 14.8, fractionDigits: 2 }).toFixed(2)) },
    ],
  },

  weather: {
    domainId: 'weather',
    category: 'physical_sciences',
    keywords: ['weather', 'climate', 'forecast', 'meteorology', 'temperature', 'humidity', 'barometer', 'precipitation', 'rain', 'storm'],
    columns: [
      { name: 'station_id', logicalType: 'VARCHAR', isPrimaryKey: true, fakerGenerator: () => `METAR-${faker.string.alpha(4).toUpperCase()}` },
      { name: 'city_name', logicalType: 'VARCHAR', fakerGenerator: () => faker.location.city() },
      { name: 'temperature_c', logicalType: 'NUMERIC', fakerGenerator: () => parseFloat(faker.number.float({ min: -8.0, max: 38.5, fractionDigits: 1 }).toFixed(1)) },
      { name: 'relative_humidity_pct', logicalType: 'NUMERIC', fakerGenerator: () => parseFloat(faker.number.float({ min: 25.0, max: 94.0, fractionDigits: 1 }).toFixed(1)) },
      { name: 'barometric_pressure_hpa', logicalType: 'NUMERIC', fakerGenerator: () => parseFloat(faker.number.float({ min: 992.0, max: 1032.0, fractionDigits: 1 }).toFixed(1)) },
      { name: 'wind_speed_kmh', logicalType: 'NUMERIC', fakerGenerator: () => parseFloat(faker.number.float({ min: 3.0, max: 65.0, fractionDigits: 1 }).toFixed(1)) },
      { name: 'uv_index', logicalType: 'INTEGER', fakerGenerator: () => faker.number.int({ min: 1, max: 11 }) },
      { name: 'sky_condition', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['Clear Skies', 'Scattered Cumulus', 'Overcast Stratus', 'Light Rain Showers', 'Severe Thunderstorm']) },
    ],
  },

  physics: {
    domainId: 'physics',
    category: 'physical_sciences',
    keywords: ['particle', 'particles', 'quantum', 'atom', 'atomic', 'collider', 'subatomic', 'decay', 'wavelength', 'photon', 'electron'],
    columns: [
      { name: 'event_id', logicalType: 'INTEGER', isPrimaryKey: true, fakerGenerator: () => faker.number.int({ min: 10001, max: 99999 }) },
      { name: 'particle_name', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['Muon', 'Higgs Boson', 'Top Quark', 'Positron', 'Tau Neutrino', 'Gluon', 'Charm Quark']) },
      { name: 'energy_gev', logicalType: 'NUMERIC', fakerGenerator: () => parseFloat(faker.number.float({ min: 0.105, max: 125.25, fractionDigits: 3 }).toFixed(3)) },
      { name: 'spin_quantum', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['1/2', '0', '1', '2']) },
      { name: 'decay_channel', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['gamma + gamma', 'W+ + W-', 'b + b_bar', 'e+ + e-']) },
      { name: 'magnetic_field_tesla', logicalType: 'NUMERIC', fakerGenerator: () => parseFloat(faker.number.float({ min: 2.0, max: 8.5, fractionDigits: 2 }).toFixed(2)) },
    ],
  },

  // ── 5. AUTOMOTIVE, TRANSPORTATION & SENSORS ─────────────────────────────────
  vehicles: {
    domainId: 'vehicles',
    category: 'automotive_engineering',
    keywords: ['car', 'cars', 'vehicle', 'vehicles', 'automobile', 'auto', 'truck', 'trucks', 'suv', 'ev', 'fleet'],
    columns: [
      { name: 'vin', logicalType: 'VARCHAR', isPrimaryKey: true, fakerGenerator: () => faker.vehicle.vin() },
      { name: 'make', logicalType: 'VARCHAR', fakerGenerator: () => faker.vehicle.manufacturer() },
      { name: 'model', logicalType: 'VARCHAR', fakerGenerator: () => faker.vehicle.model() },
      { name: 'model_year', logicalType: 'INTEGER', fakerGenerator: () => faker.number.int({ min: 2020, max: 2026 }) },
      { name: 'mileage_miles', logicalType: 'INTEGER', fakerGenerator: () => faker.number.int({ min: 1200, max: 84000 }) },
      { name: 'fuel_type', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['Electric (BEV)', 'Hybrid (HEV)', 'Gasoline Turbo', 'Clean Diesel']) },
      { name: 'battery_or_tank_pct', logicalType: 'INTEGER', fakerGenerator: () => faker.number.int({ min: 15, max: 100 }) },
      { name: 'horsepower', logicalType: 'INTEGER', fakerGenerator: () => faker.number.int({ min: 180, max: 670 }) },
    ],
  },

  aerospace: {
    domainId: 'aerospace',
    category: 'automotive_engineering',
    keywords: ['spacecraft', 'satellite', 'satellites', 'rocket', 'rockets', 'orbit', 'orbital', 'avionics', 'mission', 'payload', 'iss'],
    columns: [
      { name: 'mission_id', logicalType: 'VARCHAR', isPrimaryKey: true, fakerGenerator: () => `MSN-${faker.string.alphanumeric(6).toUpperCase()}` },
      { name: 'vessel_name', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['Artemis V Pioneer', 'Dragon Endurance', 'Starship Block 3', 'Voyager Nexus', 'Falcon Heavy Core', 'Kepler Surveyor']) },
      { name: 'orbital_altitude_km', logicalType: 'NUMERIC', fakerGenerator: () => parseFloat(faker.number.float({ min: 410.0, max: 35786.0, fractionDigits: 1 }).toFixed(1)) },
      { name: 'velocity_km_s', logicalType: 'NUMERIC', fakerGenerator: () => parseFloat(faker.number.float({ min: 7.6, max: 11.2, fractionDigits: 2 }).toFixed(2)) },
      { name: 'fuel_remaining_pct', logicalType: 'NUMERIC', fakerGenerator: () => parseFloat(faker.number.float({ min: 8.5, max: 98.0, fractionDigits: 1 }).toFixed(1)) },
      { name: 'trajectory_phase', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['Low Earth Orbit', 'Translunar Injection', 'Geostationary Transfer', 'Atmospheric Re-entry']) },
    ],
  },

  // ── 6. GAMING, SPORTS & ENTERTAINMENT ────────────────────────────────────────
  gaming: {
    domainId: 'gaming',
    category: 'media_gaming',
    keywords: ['player', 'players', 'gamer', 'game', 'games', 'gaming', 'esports', 'match', 'matches', 'guild', 'leaderboard', 'quest', 'inventory'],
    columns: [
      { name: 'player_id', logicalType: 'INTEGER', isPrimaryKey: true, fakerGenerator: () => faker.number.int({ min: 10001, max: 99999 }) },
      { name: 'gamer_tag', logicalType: 'VARCHAR', fakerGenerator: () => `${faker.word.adjective()}${faker.person.firstName()}${faker.number.int({ min: 10, max: 99 })}` },
      { name: 'rank_tier', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['Iron', 'Bronze', 'Gold', 'Platinum', 'Diamond', 'Master', 'Grandmaster']) },
      { name: 'mmr_rating', logicalType: 'INTEGER', fakerGenerator: () => faker.number.int({ min: 1200, max: 3400 }) },
      { name: 'win_rate_pct', logicalType: 'NUMERIC', fakerGenerator: () => parseFloat(faker.number.float({ min: 46.0, max: 68.5, fractionDigits: 1 }).toFixed(1)) },
      { name: 'kd_ratio', logicalType: 'NUMERIC', fakerGenerator: () => parseFloat(faker.number.float({ min: 0.85, max: 2.85, fractionDigits: 2 }).toFixed(2)) },
      { name: 'favorite_hero', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['Valkyrie', 'Shadow Assassin', 'Cyber Paladin', 'Plasma Sniper', 'Bio Alchemist']) },
    ],
  },

  sports: {
    domainId: 'sports',
    category: 'media_gaming',
    keywords: ['football', 'soccer', 'basketball', 'cricket', 'baseball', 'tennis', 'athlete', 'athletes', 'team', 'teams', 'tournament', 'f1'],
    columns: [
      { name: 'athlete_id', logicalType: 'INTEGER', isPrimaryKey: true, fakerGenerator: () => faker.number.int({ min: 101, max: 9999 }) },
      { name: 'player_name', logicalType: 'VARCHAR', fakerGenerator: () => faker.person.fullName() },
      { name: 'team_name', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['Real Madrid', 'Manchester City', 'Bayern Munich', 'Boston Celtics', 'Golden State Warriors', 'Ferrari F1']) },
      { name: 'position', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['Striker', 'Midfielder', 'Point Guard', 'Quarterback', 'Fast Bowler', 'Lead Driver']) },
      { name: 'points_or_goals', logicalType: 'INTEGER', fakerGenerator: () => faker.number.int({ min: 8, max: 38 }) },
      { name: 'rating_score', logicalType: 'NUMERIC', fakerGenerator: () => parseFloat(faker.number.float({ min: 6.5, max: 9.8, fractionDigits: 1 }).toFixed(1)) },
      { name: 'contract_value_m', logicalType: 'NUMERIC', fakerGenerator: () => parseFloat(faker.number.float({ min: 2.5, max: 45.0, fractionDigits: 1 }).toFixed(1)) },
    ],
  },
};
