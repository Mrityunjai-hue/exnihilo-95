/**
 * detective_evaluator.ts — Offline Verification Engine for FORM 95-VERIFY & Grand Jury Indictments
 *
 * Implements the Zero Auto-Progression principle:
 * - Query execution alone NEVER advances the investigation.
 * - The investigator must manually isolate a specific incriminating record and submit it
 *   to contradict a suspect's sworn claim.
 * - Red herrings (e.g., Chef Gordon's scullery rat arsenic) trigger Lieutenant Callahan
 *   reprimands and credibility penalties.
 */

import {
  DeductionVoucherRule,
  GrandJuryExhibitRequirement,
  VerificationResult,
  DetectiveCareerProgress,
} from '../data/cases/types';

export class DetectiveEvaluator {
  /**
   * Evaluates a user-selected row against the active Deduction Voucher Rule.
   */
  static evaluateVoucher(
    rule: DeductionVoucherRule,
    selectedRow: Record<string, any> | null
  ): VerificationResult {
    if (!selectedRow || Object.keys(selectedRow).length === 0) {
      return {
        status: 'REJECTED',
        title: 'NO RECORD ISOLATED',
        message: 'Detective, you must select and isolate a specific record row from the terminal result table before stamping FORM 95-VERIFY.',
        deductCredibilityPercent: 0,
      };
    }

    try {
      const evaluation = rule.validateRow(selectedRow);

      if (evaluation.isSuccess) {
        return {
          status: 'ADMITTED',
          title: 'EVIDENCE ADMITTED TO DOCKET',
          message: evaluation.feedbackMessage,
          stampLabel: 'ADMITTED AS EVIDENCE',
          deductCredibilityPercent: 0,
          unlockedObjective: rule.notebookObjective,
          newCrimeBoardLink: rule.crimeBoardLink,
        };
      }

      if (evaluation.isRedHerring) {
        return {
          status: 'RED_HERRING',
          title: 'RED HERRING TRAP TRIGGERED',
          message: evaluation.feedbackMessage,
          stampLabel: 'REJECTED: RED HERRING',
          deductCredibilityPercent: 10,
        };
      }

      return {
        status: 'REJECTED',
        title: 'CLAIM NOT CONTRADICTED',
        message: evaluation.feedbackMessage || 'The isolated record does not substantiate the deductive hypothesis or contradict the suspect\'s statement.',
        stampLabel: 'REJECTED: INSUFFICIENT',
        deductCredibilityPercent: 2,
      };
    } catch (err: any) {
      return {
        status: 'REJECTED',
        title: 'VERIFICATION ERROR',
        message: `Forensic audit error during row inspection: ${err?.message || err}`,
        deductCredibilityPercent: 0,
      };
    }
  }

  /**
   * Validates Grand Jury 3-Exhibit Prosecution Indictment.
   */
  static evaluateGrandJury(
    requirements: GrandJuryExhibitRequirement,
    exhibitRows: {
      exhibitA?: Record<string, any>[];
      exhibitB?: Record<string, any>[];
      exhibitC?: Record<string, any>[];
    }
  ): {
    isIndicted: boolean;
    results: {
      exhibitA: { valid: boolean; feedback: string };
      exhibitB: { valid: boolean; feedback: string };
      exhibitC: { valid: boolean; feedback: string };
    };
  } {
    const validA = exhibitRows.exhibitA ? requirements.exhibitA_Motive.validateQuery(exhibitRows.exhibitA) : false;
    const validB = exhibitRows.exhibitB ? requirements.exhibitB_Means.validateQuery(exhibitRows.exhibitB) : false;
    const validC = exhibitRows.exhibitC ? requirements.exhibitC_Opportunity.validateQuery(exhibitRows.exhibitC) : false;

    return {
      isIndicted: validA && validB && validC,
      results: {
        exhibitA: {
          valid: validA,
          feedback: validA
            ? 'EXHIBIT A ACCEPTED: Financial motive proven beyond reasonable doubt.'
            : requirements.exhibitA_Motive.failFeedback,
        },
        exhibitB: {
          valid: validB,
          feedback: validB
            ? 'EXHIBIT B ACCEPTED: Chemical murder weapon procurement verified.'
            : requirements.exhibitB_Means.failFeedback,
        },
        exhibitC: {
          valid: validC,
          feedback: validC
            ? 'EXHIBIT C ACCEPTED: Infiltration opportunity during death window confirmed.'
            : requirements.exhibitC_Opportunity.failFeedback,
        },
      },
    };
  }

  /**
   * Calculates detective career rank based on credibility rating and solved cases.
   */
  static calculateRank(progress: DetectiveCareerProgress): DetectiveCareerProgress['rank'] {
    if (progress.solvedCases.length >= 3 && progress.credibilityRating >= 85) {
      return 'Chief Forensics Master';
    }
    if (progress.solvedCases.length >= 1 && progress.credibilityRating >= 75) {
      return 'Homicide Inspector';
    }
    if (progress.credibilityRating >= 60) {
      return 'Junior Detective';
    }
    return 'Patrolman';
  }
}

