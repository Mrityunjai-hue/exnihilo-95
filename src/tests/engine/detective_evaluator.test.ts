import { describe, it, expect } from 'vitest';
import { DetectiveEvaluator } from '../../engine/detective_evaluator';
import { CASE_1_DOSSIER } from '../../data/cases/case1_blackwood_manor';

describe('DetectiveEvaluator — Zero Auto-Progression & Voucher Verification', () => {
  const vouchers = CASE_1_DOSSIER.deductionVouchers;

  it('rejects verification if no row is selected', () => {
    const result = DetectiveEvaluator.evaluateVoucher(vouchers[0], null);
    expect(result.status).toBe('REJECTED');
    expect(result.title).toBe('NO RECORD ISOLATED');
  });

  it('catches red herring when user submits Chef Gordon arsenic for cause of death', () => {
    const redHerringRow = {
      record_id: 106,
      sample_type: 'Scullery Drain Trap Scraping',
      subject_name: 'Kitchen Scullery Sink',
      compound_detected: 'Arsenic Trioxide',
      concentration_mg_l: 12.3,
    };

    const result = DetectiveEvaluator.evaluateVoucher(vouchers[0], redHerringRow);
    expect(result.status).toBe('RED_HERRING');
    expect(result.deductCredibilityPercent).toBe(10);
    expect(result.message).toContain('RED HERRING TRAP');
  });

  it('successfully admits cyanide toxicology row for Voucher 1', () => {
    const correctRow = {
      record_id: 101,
      sample_type: 'Post-Mortem Femoral Blood',
      subject_name: 'Lord Archibald Blackwood',
      compound_detected: 'Potassium Cyanide',
      concentration_mg_l: 4.85,
    };

    const result = DetectiveEvaluator.evaluateVoucher(vouchers[0], correctRow);
    expect(result.status).toBe('ADMITTED');
    expect(result.deductCredibilityPercent).toBe(0);
    expect(result.stampLabel).toBe('ADMITTED AS EVIDENCE');
  });

  it('validates Grand Jury exhibits when all 3 criteria are satisfied', () => {
    const rowsA = [{ will_version: '1995_REV_DRAFT', disinherited_party: 'Julian Vance' }];
    const rowsB = [{ item_name: 'Potassium Cyanide Crystalline Reagent', buyer_name: 'Dr. Alistair Finch' }];
    const rowsC = [{ room_id: 'STUDY_E201', card_id: 'CARD_DF_02', swipe_time: '21:44:12' }];

    const verdict = DetectiveEvaluator.evaluateGrandJury(CASE_1_DOSSIER.grandJuryExhibits, {
      exhibitA: rowsA,
      exhibitB: rowsB,
      exhibitC: rowsC,
    });

    expect(verdict.isIndicted).toBe(true);
    expect(verdict.results.exhibitA.valid).toBe(true);
    expect(verdict.results.exhibitB.valid).toBe(true);
    expect(verdict.results.exhibitC.valid).toBe(true);
  });
});

