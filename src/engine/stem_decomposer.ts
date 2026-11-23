/**
 * stem_decomposer.ts — Morphological Stem Decomposer & Calibrated Domain Generators (v3.0)
 *
 * Deconstructs arbitrary column identifiers into semantic root tokens, physical dimensions,
 * and contextual units. Calibrates realistic numbers, ranges, and composite values for
 * biometrics, medicine, telemetry, IoT, DevOps, and aerospace without relying on exact
 * dictionary matches or Latin dummy text.
 */

import { fakerEN as faker } from '@faker-js/faker';

export interface StemDecompositionResult {
  stems: string[];
  domain: string;
  logicalType: 'INTEGER' | 'VARCHAR' | 'NUMERIC' | 'DATE' | 'TIMESTAMP' | 'BOOLEAN';
  semanticCategory: string;
  generate: (rowIndex: number) => any;
}

// ── Morphological Tokenizer ──────────────────────────────────────────────────

export function tokenizeColumnName(colName: string): string[] {
  if (!colName) return [];
  // Split on underscores, hyphens, dots, and camelCase boundaries
  return colName
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
    .toLowerCase()
    .split(/[_.\-\s]+/)
    .filter(Boolean);
}

// ── Calibrated Physical & Biological Rules ───────────────────────────────────

export function decomposeColumnStem(colName: string, tableName: string = ''): StemDecompositionResult | null {
  const tokens = tokenizeColumnName(colName);
  if (tokens.length === 0) return null;

  const tSet = new Set(tokens);
  const fullName = tokens.join('_');

  // 1. CARDIOLOGY & BIOMETRICS
  // (e.g. heart_rate, pulse, bpm, beating_frequency, cardiac_output)
  if (
    (tSet.has('heart') && (tSet.has('rate') || tSet.has('bpm') || tSet.has('beat') || tSet.has('beats'))) ||
    fullName.includes('pulse') ||
    fullName.includes('heart_rate')
  ) {
    return {
      stems: tokens,
      domain: 'cardiology',
      logicalType: 'INTEGER',
      semanticCategory: 'heart_rate_bpm',
      generate: () => faker.number.int({ min: 62, max: 98 }), // normal resting human bpm
    };
  }

  // Beating frequency / oscillation / hz
  if (
    (tSet.has('beating') || tSet.has('cardiac') || tSet.has('pulse')) &&
    (tSet.has('frequency') || tSet.has('freq') || tSet.has('hz'))
  ) {
    return {
      stems: tokens,
      domain: 'cardiology',
      logicalType: 'NUMERIC',
      semanticCategory: 'cardiac_frequency_hz',
      generate: () => parseFloat((faker.number.float({ min: 1.05, max: 1.65, fractionDigits: 2 })).toFixed(2)), // ~63-99 bpm in Hz
    };
  }

  // Blood Oxygen Level / SpO2 (e.g. blood_o2_level, o2_sat, spo2, oxygen_saturation)
  if (
    (tSet.has('o2') || tSet.has('oxygen') || tSet.has('spo2')) &&
    (tSet.has('blood') || tSet.has('level') || tSet.has('sat') || tSet.has('saturation'))
  ) {
    return {
      stems: tokens,
      domain: 'pulmonology',
      logicalType: 'NUMERIC',
      semanticCategory: 'blood_oxygen_saturation',
      generate: () => parseFloat((faker.number.float({ min: 95.0, max: 99.8, fractionDigits: 1 })).toFixed(1)), // normal SpO2 95-100%
    };
  }

  // Blood Pressure (e.g. blood_pressure, bp, arterial_pressure)
  if (
    (tSet.has('blood') && tSet.has('pressure')) ||
    fullName === 'bp' ||
    fullName.includes('blood_pressure')
  ) {
    return {
      stems: tokens,
      domain: 'cardiology',
      logicalType: 'VARCHAR',
      semanticCategory: 'blood_pressure_mmhg',
      generate: () => {
        const systolic = faker.number.int({ min: 110, max: 135 });
        const diastolic = faker.number.int({ min: 70, max: 88 });
        return `${systolic}/${diastolic}`;
      },
    };
  }

  // Systolic / Diastolic discrete columns
  if (tSet.has('systolic')) {
    return {
      stems: tokens,
      domain: 'cardiology',
      logicalType: 'INTEGER',
      semanticCategory: 'systolic_bp',
      generate: () => faker.number.int({ min: 112, max: 138 }),
    };
  }
  if (tSet.has('diastolic')) {
    return {
      stems: tokens,
      domain: 'cardiology',
      logicalType: 'INTEGER',
      semanticCategory: 'diastolic_bp',
      generate: () => faker.number.int({ min: 72, max: 88 }),
    };
  }

  // Body Temperature (temp_c, body_temp, fever)
  if ((tSet.has('body') || tSet.has('patient')) && (tSet.has('temp') || tSet.has('temperature'))) {
    return {
      stems: tokens,
      domain: 'vitals',
      logicalType: 'NUMERIC',
      semanticCategory: 'body_temp_celsius',
      generate: () => parseFloat((faker.number.float({ min: 36.4, max: 37.6, fractionDigits: 1 })).toFixed(1)),
    };
  }

  // Glucose / Blood Sugar
  if (tSet.has('glucose') || (tSet.has('blood') && tSet.has('sugar'))) {
    return {
      stems: tokens,
      domain: 'endocrinology',
      logicalType: 'INTEGER',
      semanticCategory: 'blood_glucose_mg_dl',
      generate: () => faker.number.int({ min: 75, max: 140 }),
    };
  }

  // Respiratory Rate
  if (tSet.has('respiratory') || (tSet.has('breath') && tSet.has('rate'))) {
    return {
      stems: tokens,
      domain: 'pulmonology',
      logicalType: 'INTEGER',
      semanticCategory: 'respiratory_rate_bpm',
      generate: () => faker.number.int({ min: 12, max: 20 }),
    };
  }

  // 2. SENSORS, TELEMETRY & PHYSICAL QUANTITIES
  // RPM (engine_rpm, motor_rpm, fan_rpm)
  if (tSet.has('rpm') || (tSet.has('revolutions') && tSet.has('minute'))) {
    return {
      stems: tokens,
      domain: 'mechanical',
      logicalType: 'INTEGER',
      semanticCategory: 'rotational_speed_rpm',
      generate: () => faker.number.int({ min: 1200, max: 5800 }),
    };
  }

  // Voltage (voltage, v_in, v_out, battery_voltage)
  if (tSet.has('voltage') || tSet.has('volts') || tSet.has('volt')) {
    return {
      stems: tokens,
      domain: 'electrical',
      logicalType: 'NUMERIC',
      semanticCategory: 'electrical_voltage',
      generate: () => parseFloat((faker.number.float({ min: 3.3, max: 240.0, fractionDigits: 2 })).toFixed(2)),
    };
  }

  // Current / Amperage (current_amp, amperage, amps)
  if (tSet.has('amperage') || tSet.has('amps') || (tSet.has('current') && (tSet.has('amp') || tSet.has('draw')))) {
    return {
      stems: tokens,
      domain: 'electrical',
      logicalType: 'NUMERIC',
      semanticCategory: 'electrical_current',
      generate: () => parseFloat((faker.number.float({ min: 0.25, max: 15.0, fractionDigits: 2 })).toFixed(2)),
    };
  }

  // Frequency (hz, khz, mhz, ghz)
  if (tSet.has('frequency') || tSet.has('freq') || tSet.has('hz')) {
    return {
      stems: tokens,
      domain: 'physics',
      logicalType: 'NUMERIC',
      semanticCategory: 'frequency_hz',
      generate: () => parseFloat((faker.number.float({ min: 50.0, max: 2400.0, fractionDigits: 2 })).toFixed(2)),
    };
  }

  // Temperature (temp, temperature, celsius, fahrenheit)
  if (tSet.has('temp') || tSet.has('temperature')) {
    const isFahrenheit = tSet.has('f') || tSet.has('fahrenheit');
    return {
      stems: tokens,
      domain: 'thermodynamics',
      logicalType: 'NUMERIC',
      semanticCategory: isFahrenheit ? 'temp_fahrenheit' : 'temp_celsius',
      generate: () =>
        isFahrenheit
          ? parseFloat((faker.number.float({ min: 65.0, max: 105.0, fractionDigits: 1 })).toFixed(1))
          : parseFloat((faker.number.float({ min: 18.0, max: 75.0, fractionDigits: 1 })).toFixed(1)),
    };
  }

  // Pressure (psi, bar, pascal, atmospheric_pressure)
  if (tSet.has('pressure') || tSet.has('psi') || tSet.has('bar')) {
    return {
      stems: tokens,
      domain: 'thermodynamics',
      logicalType: 'NUMERIC',
      semanticCategory: 'fluid_pressure',
      generate: () => parseFloat((faker.number.float({ min: 14.7, max: 120.0, fractionDigits: 1 })).toFixed(1)),
    };
  }

  // Humidity (humidity, relative_humidity)
  if (tSet.has('humidity')) {
    return {
      stems: tokens,
      domain: 'environment',
      logicalType: 'NUMERIC',
      semanticCategory: 'relative_humidity_pct',
      generate: () => parseFloat((faker.number.float({ min: 30.0, max: 85.0, fractionDigits: 1 })).toFixed(1)),
    };
  }

  // Latency & Durations (latency_ms, response_time, ping)
  if (tSet.has('latency') || tSet.has('ping') || (tSet.has('response') && tSet.has('time'))) {
    return {
      stems: tokens,
      domain: 'networking',
      logicalType: 'INTEGER',
      semanticCategory: 'network_latency_ms',
      generate: () => faker.number.int({ min: 14, max: 320 }),
    };
  }

  // Packet Loss, Error Rate, Drops
  if ((tSet.has('packet') || tSet.has('error') || tSet.has('drop') || tSet.has('loss')) && (tSet.has('rate') || tSet.has('pct') || tSet.has('loss'))) {
    return {
      stems: tokens,
      domain: 'networking',
      logicalType: 'NUMERIC',
      semanticCategory: 'packet_loss_pct',
      generate: () => parseFloat((faker.number.float({ min: 0.0, max: 2.5, fractionDigits: 3 })).toFixed(3)),
    };
  }

  // IP Address & MAC Address
  if (tSet.has('ip') || tSet.has('ipv4')) {
    return {
      stems: tokens,
      domain: 'networking',
      logicalType: 'VARCHAR',
      semanticCategory: 'ip_address',
      generate: () => faker.internet.ipv4(),
    };
  }
  if (tSet.has('mac') || tSet.has('macaddress')) {
    return {
      stems: tokens,
      domain: 'networking',
      logicalType: 'VARCHAR',
      semanticCategory: 'mac_address',
      generate: () => faker.internet.mac(),
    };
  }

  // 3. SCIENTIFIC, GEOSPATIAL & METRICS
  if (tSet.has('latitude') || tSet.has('lat')) {
    return {
      stems: tokens,
      domain: 'geospatial',
      logicalType: 'NUMERIC',
      semanticCategory: 'geo_latitude',
      generate: () => parseFloat(faker.location.latitude({ max: 80, min: -80, precision: 0.00001 }).toFixed(5)),
    };
  }
  if (tSet.has('longitude') || tSet.has('lon') || tSet.has('lng')) {
    return {
      stems: tokens,
      domain: 'geospatial',
      logicalType: 'NUMERIC',
      semanticCategory: 'geo_longitude',
      generate: () => parseFloat(faker.location.longitude({ max: 180, min: -180, precision: 0.00001 }).toFixed(5)),
    };
  }

  // Altitude / Elevation
  if (tSet.has('altitude') || tSet.has('elevation')) {
    return {
      stems: tokens,
      domain: 'geospatial',
      logicalType: 'INTEGER',
      semanticCategory: 'geo_altitude_meters',
      generate: () => faker.number.int({ min: 15, max: 3200 }),
    };
  }

  // Scores, Confidence & Probabilities (e.g. confidence_score, risk_score, accuracy)
  if (tSet.has('confidence') || tSet.has('probability') || tSet.has('accuracy')) {
    return {
      stems: tokens,
      domain: 'data_science',
      logicalType: 'NUMERIC',
      semanticCategory: 'probability_score',
      generate: () => parseFloat((faker.number.float({ min: 0.65, max: 0.99, fractionDigits: 3 })).toFixed(3)),
    };
  }

  return null;
}
