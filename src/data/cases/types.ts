/**
 * types.ts — TypeScript Interfaces for SQL Noir: Department of Unsolved Homicides
 *
 * Defines the core domain models for:
 * - Case dossiers, suspects, victims, and physical paper evidence documents
 * - The Deductive Verification & Manual Record Confirmation Engine (FORM 95-VERIFY)
 * - Grand Jury Indictment 3-Exhibit prosecution requirements
 * - Anti-Clutter Bureau navigation viewports and investigator career state
 */

export type BureauMode = 'dossier' | 'terminal' | 'board' | 'interrogation' | 'courtroom' | 'archive';

export type PhosphorColor = 'amber' | 'green' | 'ice';

export type EvidenceDocType =
  | 'autopsy'
  | 'greenbar_dispatch'
  | 'till_tape'
  | 'wiretap'
  | 'polaroid_evidence'
  | 'apothecary_ledger';

export interface AnatomicalTraumaMarker {
  id: string;
  organ: string;
  xPercent: number; // For interactive coordinate click hotspot
  yPercent: number;
  findingSummary: string;
  associatedFilterHint: string; // e.g. "WHERE trauma_site = 'GASTRIC' AND toxin_detected IS NOT NULL"
}

export interface AutopsyProtocol {
  protocolNumber: string;
  coronerName: string;
  victimName: string;
  timeOfDeathEstimated: string;
  deathWindowStart: string;
  deathWindowEnd: string;
  causeOfDeath: string;
  toxicologySummary: string;
  traumaMarkers: AnatomicalTraumaMarker[];
  pathologistNotes: string;
}

export interface EvidenceDoc {
  id: string;
  title: string;
  type: EvidenceDocType;
  dateStr: string;
  description: string;
  rawText?: string;
  metadata?: Record<string, string | number>;
  autopsyData?: AutopsyProtocol;
  isUVSecret?: boolean;
  uvFluorescentNote?: string;
  audioUrl?: string; // For wiretap cassette player
}

export interface SuspectProfile {
  id: string;
  name: string;
  alias?: string;
  age: number;
  relationship: string;
  role: string;
  financialMotive: string;
  swornStatement: string;
  declaredAlibiLocation: string;
  declaredDepartureTime?: string;
  ditheredMugshotSvg?: string; // Optional legacy asset
  badgeNumber?: string;
  heartRateNormal: number;
  heartRateStressed: number;
  brokenAlibiAdmission: string;
}

export interface DeductionVoucherRule {
  id: string;
  phaseNumber: number;
  title: string;
  hypothesisTarget: string; // e.g. "Shatter Julian Vance's claimed London train departure alibi"
  targetSuspectId?: string;
  contradictedClaimText: string;
  /**
   * Predicate validator against the user-selected row in the query result.
   */
  validateRow: (row: Record<string, any>) => {
    isSuccess: boolean;
    isRedHerring?: boolean;
    feedbackMessage: string;
  };
  successDeductionSummary: string;
  redHerringWarning?: string;
  notebookObjective: string;
  crimeBoardLink: {
    fromNodeId: string;
    toNodeId: string;
    yarnColor: string;
    label: string;
  };
}

export interface GrandJuryExhibitRequirement {
  exhibitA_Motive: {
    title: string;
    description: string;
    validateQuery: (rows: Record<string, any>[]) => boolean;
    failFeedback: string;
  };
  exhibitB_Means: {
    title: string;
    description: string;
    validateQuery: (rows: Record<string, any>[]) => boolean;
    failFeedback: string;
  };
  exhibitC_Opportunity: {
    title: string;
    description: string;
    validateQuery: (rows: Record<string, any>[]) => boolean;
    failFeedback: string;
  };
}

export interface CaseDossier {
  id: string;
  caseNumber: string;
  title: string;
  subtitle: string;
  setting: string;
  dateOfIncident: string;
  difficulty: 'Apprentice' | 'Junior' | 'Senior' | 'Chief';
  briefSummary: string;
  victim: {
    name: string;
    age: number;
    occupation: string;
    causeOfDeath: string;
    locationFound: string;
    timeOfDeathEstimate: string;
  };
  tables: string[];
  seedSql: string;
  suspects: SuspectProfile[];
  evidenceDocs: EvidenceDoc[];
  deductionVouchers: DeductionVoucherRule[];
  grandJuryExhibits: GrandJuryExhibitRequirement;
  newspaperHeadline: {
    paperName: string;
    date: string;
    headline: string;
    subheadline: string;
    storySnippet: string;
  };
}

export interface VerificationResult {
  status: 'ADMITTED' | 'RED_HERRING' | 'CIRCUMSTANTIAL' | 'REJECTED';
  title: string;
  message: string;
  stampLabel?: string;
  deductCredibilityPercent?: number;
  unlockedObjective?: string;
  newCrimeBoardLink?: DeductionVoucherRule['crimeBoardLink'];
}

export interface CrimeBoardNode {
  id: string;
  title: string;
  type: 'suspect' | 'victim' | 'evidence' | 'location' | 'weapon';
  x: number;
  y: number;
  imageUrl?: string;
  svgIcon?: string;
  subtitle: string;
  stamp?: string;
}

export interface CrimeBoardLink {
  id: string;
  fromId: string;
  toId: string;
  label: string;
  color: string;
}

export interface DetectiveCareerProgress {
  rank: 'Patrolman' | 'Junior Detective' | 'Homicide Inspector' | 'Chief Forensics Master';
  badgeNumber: number;
  credibilityRating: number; // Starts at 100%, drops on red herrings
  solvedCases: string[];
  activeCaseId: string;
  completedVouchersByCase: Record<string, string[]>;
  boardPositionsByCase: Record<string, Record<string, { x: number; y: number }>>;
  totalQueriesRun: number;
  hintsUsed: number;
}

