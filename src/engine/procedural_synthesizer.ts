/**
 * procedural_synthesizer.ts — Dynamic Contextual Schema Synthesizer
 *
 * For unknown or novel database table names outside pre-configured catalogs,
 * synthesizes an authentic, domain-appropriate relational schema based on
 * entity morphology, syntactic roles, and contextual archetypes.
 */

import { faker } from '@faker-js/faker';
import { DomainColumnSpec } from './domain_catalog_data';
import { NormalizedTableInfo } from './morphology';

export function synthesizeProceduralSchema(info: NormalizedTableInfo): DomainColumnSpec[] {
  const { cleanedName, singularName, tokens, entityHead } = info;

  // ── Archetype 1: Event / Audit / Log / History ─────────────────────────────
  const isEventLog = tokens.some(t => ['log', 'event', 'audit', 'history', 'activity', 'tracking', 'record', 'session'].includes(t));
  if (isEventLog) {
    const parentEntity = tokens.find(t => !['log', 'event', 'audit', 'history', 'activity', 'record', 'session'].includes(t)) || 'entity';
    return [
      { name: 'id', logicalType: 'INTEGER', isPrimaryKey: true, fakerGenerator: () => 1 },
      { name: `${parentEntity}_id`, logicalType: 'INTEGER', isForeignKey: true, references: { table: `${parentEntity}s`, column: 'id' }, fakerGenerator: () => faker.number.int({ min: 1, max: 20 }) },
      { name: 'event_type', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement([`${parentEntity}_created`, `${parentEntity}_updated`, `${parentEntity}_processed`, `${parentEntity}_archived`]) },
      { name: 'status', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['SUCCESS', 'PENDING', 'WARNING', 'FAILED']) },
      { name: 'message', logicalType: 'VARCHAR', fakerGenerator: () => faker.lorem.sentence() },
      { name: 'recorded_at', logicalType: 'TIMESTAMP', fakerGenerator: () => faker.date.recent().toISOString() }
    ];
  }

  // ── Archetype 2: Sensor / Metric / Telemetry ───────────────────────────────
  const isMetric = tokens.some(t => ['metric', 'reading', 'telemetry', 'sensor', 'stat', 'measurement', 'signal', 'gauge'].includes(t));
  if (isMetric) {
    const device = tokens.find(t => !['metric', 'reading', 'telemetry', 'sensor', 'stat', 'measurement', 'signal'].includes(t)) || 'sensor';
    return [
      { name: 'id', logicalType: 'INTEGER', isPrimaryKey: true, fakerGenerator: () => 1 },
      { name: `${device}_id`, logicalType: 'VARCHAR', fakerGenerator: () => `${device.toUpperCase()}-${faker.string.numeric(4)}` },
      { name: 'metric_name', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['temperature_c', 'pressure_kpa', 'voltage_v', 'vibration_hz', 'humidity_pct', 'load_factor']) },
      { name: 'value', logicalType: 'NUMERIC', fakerGenerator: () => parseFloat((faker.number.float({ min: 12.0, max: 98.5, fractionDigits: 2 })).toFixed(2)) },
      { name: 'quality_score', logicalType: 'NUMERIC', fakerGenerator: () => parseFloat((faker.number.float({ min: 0.85, max: 1.0, fractionDigits: 3 })).toFixed(3)) },
      { name: 'timestamp', logicalType: 'TIMESTAMP', fakerGenerator: () => faker.date.recent().toISOString() }
    ];
  }

  // ── Archetype 3: Many-to-Many Bridge Table (e.g., student_courses, user_roles, x_to_y, x_mapping) 
  const isExplicitBridge = tokens.some(t => ['bridge', 'mapping', 'rel', 'relation', 'link', 'junction', 'xref'].includes(t)) ||
    cleanedName.includes('_to_') ||
    cleanedName.includes('_has_') ||
    (tokens.length === 2 && ['user', 'student', 'role', 'group', 'tag', 'permission', 'author', 'book'].includes(tokens[0]) && ['role', 'course', 'tag', 'group', 'permission', 'member'].includes(tokens[1]));

  if (isExplicitBridge) {
    const ent1 = tokens[0] || 'entity_a';
    const ent2 = tokens[1] || 'entity_b';
    return [
      { name: 'id', logicalType: 'INTEGER', isPrimaryKey: true, fakerGenerator: () => 1 },
      { name: `${ent1}_id`, logicalType: 'INTEGER', isForeignKey: true, references: { table: `${ent1}s`, column: 'id' }, fakerGenerator: () => faker.number.int({ min: 1, max: 20 }) },
      { name: `${ent2}_id`, logicalType: 'INTEGER', isForeignKey: true, references: { table: `${ent2}s`, column: 'id' }, fakerGenerator: () => faker.number.int({ min: 1, max: 20 }) },
      { name: 'role_or_type', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['PRIMARY', 'SECONDARY', 'MEMBER', 'GUEST']) },
      { name: 'is_active', logicalType: 'BOOLEAN', fakerGenerator: () => faker.helpers.arrayElement([true, true, false]) },
      { name: 'assigned_at', logicalType: 'TIMESTAMP', fakerGenerator: () => faker.date.recent().toISOString() }
    ];
  }

  // ── Archetype 4: Master Contextual Entity ─────────────────────────────────
  const labelCol = `${singularName}_name`;
  const codeCol = `${singularName}_code`;

  return [
    { name: 'id', logicalType: 'INTEGER', isPrimaryKey: true, fakerGenerator: () => 1 },
    { name: labelCol, logicalType: 'VARCHAR', fakerGenerator: () => `${faker.word.adjective()} ${faker.word.noun()}`.replace(/\b\w/g, l => l.toUpperCase()) },
    { name: codeCol, logicalType: 'VARCHAR', fakerGenerator: () => `${singularName.substring(0, 3).toUpperCase()}-${faker.string.alphanumeric(5).toUpperCase()}` },
    { name: 'category', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['General', 'Premium', 'Standard', 'Archived']) },
    { name: 'status', logicalType: 'VARCHAR', fakerGenerator: () => faker.helpers.arrayElement(['ACTIVE', 'PENDING', 'COMPLETED', 'ARCHIVED']) },
    { name: 'rating_score', logicalType: 'NUMERIC', fakerGenerator: () => parseFloat((faker.number.float({ min: 1.0, max: 5.0, fractionDigits: 1 })).toFixed(1)) },
    { name: 'created_at', logicalType: 'TIMESTAMP', fakerGenerator: () => faker.date.past({ years: 1 }).toISOString().replace('T', ' ').substring(0, 19) }
  ];
}
