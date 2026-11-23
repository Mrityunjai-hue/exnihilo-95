import { describe, it, expect, beforeEach } from 'vitest';
import { SQLExecutor } from '../../engine/executor';
import { decomposeColumnStem } from '../../engine/stem_decomposer';

describe('Universal Semantic Synthesis v3.0 Accuracy', () => {
  let executor: SQLExecutor;

  beforeEach(() => {
    executor = new SQLExecutor();
  });

  it('decomposes cardiology & biometrics stems accurately', () => {
    const hr = decomposeColumnStem('heart_rate');
    expect(hr).not.toBeNull();
    expect(hr?.domain).toBe('cardiology');
    expect(hr?.logicalType).toBe('INTEGER');

    const freq = decomposeColumnStem('beating_frequency');
    expect(freq).not.toBeNull();
    expect(freq?.domain).toBe('cardiology');
    expect(freq?.logicalType).toBe('NUMERIC');

    const o2 = decomposeColumnStem('blood_o2_level');
    expect(o2).not.toBeNull();
    expect(o2?.domain).toBe('pulmonology');
    expect(o2?.logicalType).toBe('NUMERIC');

    const bp = decomposeColumnStem('blood_pressure');
    expect(bp).not.toBeNull();
    expect(bp?.domain).toBe('cardiology');
    expect(bp?.logicalType).toBe('VARCHAR');
  });

  it('synthesizes realistic biometric values without Latin slop', async () => {
    const sql = `SELECT heart_rate, beating_frequency, blood_o2_level, blood_pressure FROM hearts;`;
    const res = await executor.execute(sql, 'SQLite');

    expect(res.ok).toBe(true);
    if (!res.ok) return;

    expect(res.columns).toEqual(['heart_rate', 'beating_frequency', 'blood_o2_level', 'blood_pressure']);
    expect(res.rows.length).toBeGreaterThanOrEqual(10);

    for (const row of res.rows) {
      const [heartRate, beatingFreq, bloodO2, bloodPressure] = row;

      // Heart rate: resting human bpm 60-110
      expect(typeof heartRate).toBe('number');
      expect(heartRate).toBeGreaterThanOrEqual(55);
      expect(heartRate).toBeLessThanOrEqual(115);

      // Beating frequency: ~1.0 - 2.2 Hz
      expect(typeof beatingFreq).toBe('number');
      expect(beatingFreq).toBeGreaterThanOrEqual(0.9);
      expect(beatingFreq).toBeLessThanOrEqual(2.5);

      // Blood O2 Level: SpO2 % (94 - 100)
      expect(typeof bloodO2).toBe('number');
      expect(bloodO2).toBeGreaterThanOrEqual(93.0);
      expect(bloodO2).toBeLessThanOrEqual(100.0);

      // Blood pressure format: systolic/diastolic (e.g. "120/80")
      expect(typeof bloodPressure).toBe('string');
      expect(bloodPressure).toMatch(/^\d{2,3}\/\d{2,3}$/);
    }
  });

  it('synthesizes telemetry and physical sensor columns with plausible metrics', async () => {
    const sql = `SELECT engine_rpm, battery_voltage, packet_loss_pct, ambient_temp_c FROM sensors;`;
    const res = await executor.execute(sql, 'SQLite');

    expect(res.ok).toBe(true);
    if (!res.ok) return;

    for (const row of res.rows) {
      const [rpm, voltage, loss, temp] = row;
      expect(rpm).toBeGreaterThanOrEqual(1000);
      expect(rpm).toBeLessThanOrEqual(7000);
      expect(voltage).toBeGreaterThanOrEqual(2.0);
      expect(loss).toBeLessThanOrEqual(5.0);
      expect(temp).toBeGreaterThanOrEqual(15.0);
    }
  });
});
