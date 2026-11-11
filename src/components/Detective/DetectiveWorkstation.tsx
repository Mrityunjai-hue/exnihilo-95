/**
 * DetectiveWorkstation.tsx — Windows 95 Homicide Case Management System & Investigation Room (v8.0)
 *
 * Authentic Windows 95 Forensic Investigation System:
 * - Multi-Case Support: Switch between Case 1 (Blackwood Manor) and Case 2 (Clyde Shipyard)
 * - Zero Auto-Solved Queries: No pre-filled answer WHERE filters; learned users write real SQL
 * - Massively Populated Tables: 130+ keycard swipes, 45+ toxicology tests, 50+ apothecary orders
 * - Single Dedicated Forensic Inspector: Clear evidence attachment with [📌 Attach as Clue Evidence]
 * - Tactile Clue Interrogation Desk: Side-by-side suspect lie vs forensic proof with rubber stamps
 * - Secure Crown Office Grand Jury Vault: Authentic 3-exhibit padlocks, oak gavel strike & Gazette newspaper
 * - Detective Field Manual Quick Guide Tour Wizard: Accessible anytime from menu or toolbar
 * - Persistent State in LocalStorage: Active case, career rank, solved clues, pinned evidence survive reload
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  CaseDossier,
  DetectiveCareerProgress,
  VerificationResult,
} from '../../data/cases/types';
import { CASE_1_DOSSIER } from '../../data/cases/case1_blackwood_manor';
import { CASE_2_DOSSIER } from '../../data/cases/case2_clyde_shipyard';
import { DetectiveEvaluator } from '../../engine/detective_evaluator';
import { getOrInitSqlJs } from '../../engine/executor';
import { useDetectiveAudio } from '../../hooks/useDetectiveAudio';
import { useTheme } from '../../hooks/useTheme';
import { DetectiveTourModal } from './DetectiveTourModal';

interface DetectiveWorkstationProps {
  onClose?: () => void;
}

type DetectiveTab = 'docket' | 'suspects' | 'evidence' | 'terminal' | 'vouchers' | 'courtroom';

interface QueryResultData {
  title: string;
  query: string;
  columns: string[];
  rows: any[][];
  executionTimeMs: number;
  rowCount: number;
}

interface InvestigationLead {
  icon: string;
  title: string;
  desc: string;
  table: string;
  objective: string;
  hint: string;
  starterSql: string;
  matchingVoucherId: string;
}

const DOSSIERS: Record<string, CaseDossier> = {
  case_blackwood_manor: CASE_1_DOSSIER,
  case_clyde_shipyard: CASE_2_DOSSIER,
};

const CASE_1_LEADS: InvestigationLead[] = [
  {
    icon: '🧪',
    title: '1. Fatal Poison Analysis',
    desc: 'Find which compound exceeded the lethal threshold',
    table: 'toxicology_records',
    objective: 'Disprove the natural cardiac arrest claim. Query toxicology_records to identify which chemical in Lord Archibald blood or port wine exceeded the lethal limit.',
    hint: 'Check columns: record_id, sample_type, subject_name, compound_detected, concentration_mg_l, lethal_threshold_mg_l. Filter where concentration_mg_l > lethal_threshold_mg_l.',
    starterSql: 'SELECT * FROM toxicology_records;',
    matchingVoucherId: 'voucher_1_cause_of_death',
  },
  {
    icon: '🚪',
    title: "2. Julian's Card Swipes",
    desc: 'Audit door swipes after 21:00 to shatter the train alibi',
    table: 'keycard_logs',
    objective: "Julian claims he caught the 21:15 train to London. Audit keycard_logs to prove he was still inside Blackwood Manor after 21:00.",
    hint: "Filter keycard_logs for holder_name LIKE '%Julian%' and inspect swipe_time after 21:00. Room swipes at 21:22 or 21:38 shatter his claimed train alibi.",
    starterSql: 'SELECT * FROM keycard_logs;',
    matchingVoucherId: 'voucher_2_shatter_julian_alibi',
  },
  {
    icon: '💊',
    title: '3. Cyanide Pharmacy Trail',
    desc: 'Trace the apothecary purchase of Potassium Cyanide',
    table: 'apothecary_orders',
    objective: 'Examine apothecary orders in Inverness to locate the invoice proving who procured Potassium Cyanide prior to the murder.',
    hint: "Search item_name in apothecary_orders for '%Cyanide%' or inspect purchases made by Dr. Finch.",
    starterSql: 'SELECT * FROM apothecary_orders;',
    matchingVoucherId: 'voucher_3_trace_cyanide_purchase',
  },
  {
    icon: '📜',
    title: "4. Archibald's Secret Will",
    desc: 'Uncover who was disinherited in the 1995 revision',
    table: 'estate_wills',
    objective: 'Identify the financial motive. Find the secret draft will drafted on the afternoon of October 24 cutting off the heir.',
    hint: "Query estate_wills to check which party was disinherited in the '1995_REV_DRAFT' version and the estate value.",
    starterSql: 'SELECT * FROM estate_wills;',
    matchingVoucherId: 'voucher_4_uncover_will_motive',
  },
  {
    icon: '🔑',
    title: '5. Study Access at 21:44',
    desc: 'Who entered the study during the fatal death window?',
    table: 'keycard_logs',
    objective: 'Prove physical opportunity. Find which keycard opened the locked Private Study (STUDY_E201) between 21:40 and 22:00.',
    hint: "Filter keycard_logs for room_id = 'STUDY_E201' and swipe_time around 21:44:12 with access_status = 'GRANTED'.",
    starterSql: 'SELECT * FROM keycard_logs;',
    matchingVoucherId: 'voucher_5_pinpoint_study_access',
  },
];

const CASE_2_LEADS: InvestigationLead[] = [
  {
    icon: '🔬',
    title: '1. Naval Toxicology Swabs',
    desc: 'Analyze chemical residues inside Drydock #4',
    table: 'dockyard_toxicology',
    objective: "Examine forensic toxicology swabs from Sir Douglas MacIntyre body and the stealth blueprints tube to identify the fatal chemical.",
    hint: "Query dockyard_toxicology where concentration_ppm > lethal_threshold_ppm or search for 'Cyanide' in chemical_detected.",
    starterSql: 'SELECT * FROM dockyard_toxicology;',
    matchingVoucherId: 'voucher_clyde_1_poison',
  },
  {
    icon: '🚢',
    title: '2. Turnstile Gate Re-Entry',
    desc: 'Did Colin Vance secretly return after departing at 22:45?',
    table: 'dock_gate_logs',
    objective: "Colin Vance swore he left the shipyard for Glasgow Central Station at 22:45. Search gate turnstile logs for unauthorized re-entry.",
    hint: "Filter dock_gate_logs for badge_id = 'BADGE_CV_04' or inspect swipes after 23:00 at GATE_CARGO_EAST.",
    starterSql: 'SELECT * FROM dock_gate_logs;',
    matchingVoucherId: 'voucher_clyde_2_gate_reentry',
  },
  {
    icon: '🧪',
    title: '3. Chemical Stores Cyanide Requisition',
    desc: 'Who signed out Potassium Cyanide crystals?',
    table: 'chemical_stores',
    objective: 'Identify which defense broker or engineer signed out lethal Potassium Cyanide crystals from shipyard stores.',
    hint: "Inspect chemical_stores for chemical_name LIKE '%Cyanide%' and check requested_by.",
    starterSql: 'SELECT * FROM chemical_stores;',
    matchingVoucherId: 'voucher_clyde_3_chemical_order',
  },
  {
    icon: '📑',
    title: '4. Blueprints Vault Forced Entry',
    desc: 'Audit unauthorized lock picks in Drydock #4 Vault',
    table: 'blueprint_vault_logs',
    objective: 'Identify who broke into the classified Type-23 Frigate stealth propulsor drawer inside Vault 4 at 23:42.',
    hint: "Filter blueprint_vault_logs for action = 'UNAUTHORIZED_FORCED_LOCK' or drawer_accessed = 'DRAWER_PROPULSOR_SECRET'.",
    starterSql: 'SELECT * FROM blueprint_vault_logs;',
    matchingVoucherId: 'voucher_clyde_4_vault_infiltration',
  },
  {
    icon: '📡',
    title: '5. Foreign Consulate Dispatch',
    desc: 'Trace the phone transmission confirming blueprint extraction',
    table: 'telecom_dispatches',
    objective: 'Find the intercepted telecom transmission confirming the classified blueprint package was retrieved from the drydock tube.',
    hint: "Query telecom_dispatches for recipient LIKE '%Consulate%' or calls placed between 23:45 and 00:00.",
    starterSql: 'SELECT * FROM telecom_dispatches;',
    matchingVoucherId: 'voucher_clyde_5_consulate_wiretap',
  },
];

const STORAGE_SESSION_KEY = 'exnihilo_detective_session_v8';

export const DetectiveWorkstation: React.FC<DetectiveWorkstationProps> = ({ onClose }) => {
  const { activeTheme } = useTheme();

  // Active Case Selection
  const [activeCaseId, setActiveCaseId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_SESSION_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.activeCaseId && DOSSIERS[parsed.activeCaseId]) return parsed.activeCaseId;
        }
      } catch {}
    }
    return 'case_blackwood_manor';
  });

  const dossier = DOSSIERS[activeCaseId] || CASE_1_DOSSIER;
  const caseLeads = activeCaseId === 'case_clyde_shipyard' ? CASE_2_LEADS : CASE_1_LEADS;

  // Active Tab
  const [activeTab, setActiveTab] = useState<DetectiveTab>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_SESSION_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.activeTab) return parsed.activeTab;
        }
      } catch {}
    }
    return 'docket';
  });

  // Tour Dialog State
  const [showTourModal, setShowTourModal] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        const completed = localStorage.getItem('exnihilo_detective_tour_completed');
        return completed !== 'true';
      } catch {}
    }
    return false;
  });

  // Selected Suspect & Evidence
  const [selectedSuspectId, setSelectedSuspectId] = useState<string>(dossier.suspects[0].id);
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string>(dossier.evidenceDocs[0].id);

  // Active Voucher & Selected Evidence Row (Pin Method)
  const [activeVoucherId, setActiveVoucherId] = useState<string>(dossier.deductionVouchers[0].id);
  const [pinnedRow, setPinnedRow] = useState<Record<string, any> | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_SESSION_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.pinnedRow) return parsed.pinnedRow;
        }
      } catch {}
    }
    return null;
  });
  const [verificationFeedback, setVerificationFeedback] = useState<VerificationResult | null>(null);
  const [attachToast, setAttachToast] = useState<string | null>(null);

  // Data Investigation Room State (Single Focused Result - No Stacked Duplicates)
  const [activeLeadIndex, setActiveLeadIndex] = useState<number>(0);
  const [activeQueryTitle, setActiveQueryTitle] = useState<string>(caseLeads[0].title);
  const [terminalSql, setTerminalSql] = useState<string>(caseLeads[0].starterSql);
  const [activeResult, setActiveResult] = useState<QueryResultData | null>(null);
  const [activeError, setActiveError] = useState<string | null>(null);
  const [selectedTableForBrowse, setSelectedTableForBrowse] = useState<string>(dossier.tables[0]);
  const [dbInstance, setDbInstance] = useState<any>(null);
  const [executing, setExecuting] = useState<boolean>(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  // Workbench Ergonomics: Interactive Schema Inspector, Query History, Sorting & Filtering
  const [tableSchema, setTableSchema] = useState<Array<{ name: string; type: string; pk: boolean }>>([]);
  const [queryHistory, setQueryHistory] = useState<string[]>([caseLeads[0].starterSql]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [clientFilterText, setClientFilterText] = useState<string>('');

  // Career Progress with LocalStorage Persistence
  const [careerProgress, setCareerProgress] = useState<DetectiveCareerProgress>(() => {
    const defaultProgress: DetectiveCareerProgress = {
      rank: 'Junior Detective',
      badgeNumber: 8841,
      credibilityRating: 100,
      solvedCases: [],
      activeCaseId: 'case_blackwood_manor',
      completedVouchersByCase: {
        case_blackwood_manor: [],
        case_clyde_shipyard: [],
      },
      boardPositionsByCase: {},
      totalQueriesRun: 0,
      hintsUsed: 0,
    };
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_SESSION_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.careerProgress) {
            return {
              ...defaultProgress,
              ...parsed.careerProgress,
            };
          }
        }
      } catch {}
    }
    return defaultProgress;
  });

  // Grand Jury State
  const [indictmentState, setIndictmentState] = useState<'pending' | 'indicted'>('pending');

  const {
    playTypewriterKey,
    playStampSlam,
    playGavelStrike,
    playCaseSolvedFanfare,
    playPaperclip,
  } = useDetectiveAudio();
  const terminalInputRef = useRef<HTMLTextAreaElement>(null);

  const completedVoucherIds = careerProgress.completedVouchersByCase[dossier.id] || [];

  // Introspect table schema when selectedTableForBrowse or dbInstance updates
  useEffect(() => {
    if (!dbInstance || !selectedTableForBrowse) return;
    try {
      const res = dbInstance.exec(`PRAGMA table_info("${selectedTableForBrowse}");`);
      if (res && res.length > 0 && res[0].values) {
        const cols = res[0].values.map((row: any[]) => ({
          name: String(row[1]),
          type: String(row[2] || 'TEXT'),
          pk: row[5] === 1,
        }));
        setTableSchema(cols);
      }
    } catch {
      setTableSchema([]);
    }
  }, [dbInstance, selectedTableForBrowse]);

  // Insert column name into terminal SQL input
  const handleInsertColumn = (colName: string) => {
    playTypewriterKey();
    setTerminalSql((prev) => {
      const trimmed = prev.trim();
      if (!trimmed) return colName;
      if (
        trimmed.endsWith(',') ||
        trimmed.endsWith('SELECT') ||
        trimmed.endsWith('WHERE') ||
        trimmed.endsWith('AND') ||
        trimmed.endsWith('OR') ||
        trimmed.endsWith('=') ||
        trimmed.endsWith('LIKE')
      ) {
        return `${prev} ${colName}`;
      }
      return `${prev}, ${colName}`;
    });
    terminalInputRef.current?.focus();
  };

  // Sort toggle for result table columns
  const handleSort = (colName: string) => {
    playTypewriterKey();
    if (sortColumn === colName) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(colName);
      setSortDirection('asc');
    }
  };

  // Memoized filter and client-side sort
  const filteredAndSortedRows = React.useMemo(() => {
    if (!activeResult || !activeResult.rows) return [];
    let rows = [...activeResult.rows];

    if (clientFilterText.trim()) {
      const lower = clientFilterText.toLowerCase();
      rows = rows.filter((r) =>
        r.some((val) => val !== null && val !== undefined && String(val).toLowerCase().includes(lower))
      );
    }

    if (sortColumn && activeResult.columns.includes(sortColumn)) {
      const colIdx = activeResult.columns.indexOf(sortColumn);
      rows.sort((a, b) => {
        const valA = a[colIdx];
        const valB = b[colIdx];
        if (valA === valB) return 0;
        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;

        const numA = Number(valA);
        const numB = Number(valB);
        let cmp = 0;
        if (!isNaN(numA) && !isNaN(numB) && typeof valA !== 'boolean' && typeof valB !== 'boolean') {
          cmp = numA - numB;
        } else {
          cmp = String(valA).localeCompare(String(valB));
        }
        return sortDirection === 'asc' ? cmp : -cmp;
      });
    }

    return rows;
  }, [activeResult, clientFilterText, sortColumn, sortDirection]);

  // Export active query result as CSV
  const handleExportCsv = () => {
    if (!activeResult || !activeResult.columns.length) return;
    playTypewriterKey();
    const headers = activeResult.columns.join(',');
    const rows = filteredAndSortedRows.map((r) =>
      r
        .map((v) => {
          if (v === null || v === undefined) return '""';
          const s = String(v).replace(/"/g, '""');
          return `"${s}"`;
        })
        .join(',')
    );
    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `forensic_data_${dossier.id}_${activeResult.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Export full Case Dossier findings report (.TXT)
  const handleExportReport = () => {
    playTypewriterKey();
    const lines = [
      '================================================================================',
      'SCOTLAND YARD / CROWN OFFICE HOMICIDE BUREAU — FORENSIC CASE DOSSIER',
      '================================================================================',
      `CASE REFERENCE:      #${dossier.caseNumber}`,
      `CASE TITLE:          ${dossier.title}`,
      `SUBTITLE:            ${dossier.subtitle}`,
      `DATE OF REPORT:      ${new Date().toLocaleString()}`,
      `LEAD DETECTIVE:      Badge #${careerProgress.badgeNumber} (${careerProgress.rank})`,
      `CREDIBILITY RATING:  ${careerProgress.credibilityRating}%`,
      `PROSECUTION STATUS:  ${indictmentState === 'indicted' ? 'INDICTED (CLOSED)' : `${completedVoucherIds.length}/5 CLUES VERIFIED`}`,
      '',
      '--------------------------------------------------------------------------------',
      '1. VICTIM BIOMETRIC PROFILE',
      '--------------------------------------------------------------------------------',
      `Full Name:           ${dossier.victim.name}`,
      `Age / Occupation:    ${dossier.victim.age} years / ${dossier.victim.occupation}`,
      `Location Found:      ${dossier.victim.locationFound}`,
      `Cause of Death:      ${dossier.victim.causeOfDeath}`,
      `Estimated Window:    ${dossier.victim.timeOfDeathEstimate}`,
      '',
      '--------------------------------------------------------------------------------',
      '2. OFFICIAL HOMICIDE BRIEFING NARRATIVE',
      '--------------------------------------------------------------------------------',
      dossier.briefSummary,
      '',
      '--------------------------------------------------------------------------------',
      '3. FORENSIC CLUE DEDUCTION VOUCHERS (5)',
      '--------------------------------------------------------------------------------',
      ...dossier.deductionVouchers.map((v, i) => {
        const isSolved = completedVoucherIds.includes(v.id);
        return [
          `[${isSolved ? 'ADMITTED' : 'UNVERIFIED'}] VOUCHER #${i + 1}: ${v.title}`,
          `  Target Suspect:   ${v.targetSuspectId || 'Prime Suspect'}`,
          `  Suspect Claim:    "${v.contradictedClaimText}"`,
          `  Investigation:    ${v.hypothesisTarget}`,
          `  Notebook Aim:     ${v.notebookObjective}`,
          `  Legal Status:     ${isSolved ? '✓ Verified by Forensic Mainframe' : '✗ Awaiting Attached Evidence'}`,
          '',
        ].join('\n');
      }),
      '--------------------------------------------------------------------------------',
      '4. CURRENT ATTACHED PROOF ROW',
      '--------------------------------------------------------------------------------',
      pinnedRow ? JSON.stringify(pinnedRow, null, 2) : 'No evidence row currently attached.',
      '',
      '--------------------------------------------------------------------------------',
      '5. CROWN OFFICE HIGH COURT INDICTMENT DOCKET',
      '--------------------------------------------------------------------------------',
      `Exhibit A (Motive):      ${hasMotive ? '[VERIFIED]' : '[UNVERIFIED]'}`,
      `Exhibit B (Means):       ${hasMeans ? '[VERIFIED]' : '[UNVERIFIED]'}`,
      `Exhibit C (Opportunity): ${hasOpportunity ? '[VERIFIED]' : '[UNVERIFIED]'}`,
      `High Court Indictment:   ${indictmentState === 'indicted' ? 'TRUE BILL HANDED DOWN — ACCUSED CONVICTED' : 'LOCKED — PENDING PROSECUTION EXHIBITS'}`,
      '',
      '================================================================================',
      'END OF DOSSIER — ARCHIVED IN FORENSIC DIVISION RECORD VAULT (1995)',
      '================================================================================',
    ];

    const text = lines.join('\n');
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Case_${dossier.caseNumber}_Forensic_Dossier_Report.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Persist session to localStorage on changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const sessionData = {
          careerProgress,
          pinnedRow,
          activeTab,
          activeCaseId,
        };
        localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(sessionData));
      } catch {}
    }
  }, [careerProgress, pinnedRow, activeTab, activeCaseId]);

  // Execute SQL in Investigation Room (Updates Single Active Table - No Stacked Duplicates)
  const executeSql = (queryToRun: string, title = 'Custom SQL Query', db = dbInstance) => {
    if (!db) return;
    const cleanQuery = queryToRun.trim();
    if (!cleanQuery) return;

    setExecuting(true);
    setActiveError(null);
    playTypewriterKey();

    // Push into query history
    setQueryHistory((prev) => {
      if (prev.length > 0 && prev[prev.length - 1] === cleanQuery) return prev;
      return [...prev.slice(-29), cleanQuery];
    });
    setHistoryIndex(-1);

    const startTime = performance.now();
    try {
      const results = db.exec(cleanQuery);
      const executionTimeMs = Math.round((performance.now() - startTime) * 10) / 10;

      if (results && results.length > 0) {
        const last = results[results.length - 1];
        setActiveResult({
          title,
          query: cleanQuery,
          columns: last.columns,
          rows: last.values,
          executionTimeMs,
          rowCount: last.values.length,
        });

        // Auto-pin first row if none is currently pinned
        if (!pinnedRow && last.values.length > 0) {
          const rowObj: Record<string, any> = {};
          last.columns.forEach((c: string, idx: number) => {
            rowObj[c] = last.values[0][idx];
          });
          setPinnedRow(rowObj);
        }
      } else {
        setActiveResult({
          title,
          query: cleanQuery,
          columns: [],
          rows: [],
          executionTimeMs,
          rowCount: 0,
        });
      }

      setCareerProgress((prev) => ({
        ...prev,
        totalQueriesRun: prev.totalQueriesRun + 1,
      }));
    } catch (err: any) {
      setActiveError(err?.message || 'SQL Syntax Error');
    } finally {
      setExecuting(false);
    }
  };

  // Switch Case Dossier Handler
  const handleSwitchCase = async (newCaseId: string) => {
    if (newCaseId === activeCaseId) return;
    const targetDossier = DOSSIERS[newCaseId];
    if (!targetDossier) return;

    playTypewriterKey();
    setActiveCaseId(newCaseId);
    setSelectedSuspectId(targetDossier.suspects[0].id);
    setSelectedEvidenceId(targetDossier.evidenceDocs[0].id);
    setActiveVoucherId(targetDossier.deductionVouchers[0].id);
    setPinnedRow(null);
    setVerificationFeedback(null);
    setActiveResult(null);
    setActiveError(null);
    setActiveLeadIndex(0);
    setIndictmentState('pending');

    const leads = newCaseId === 'case_clyde_shipyard' ? CASE_2_LEADS : CASE_1_LEADS;
    setActiveQueryTitle(leads[0].title);
    setTerminalSql(leads[0].starterSql);
    setSelectedTableForBrowse(targetDossier.tables[0]);

    try {
      const SQL = await getOrInitSqlJs();
      const db = new SQL.Database();
      db.run(targetDossier.seedSql);
      setDbInstance(db);
      executeSql(leads[0].starterSql, `Table: ${leads[0].table}`, db);
    } catch (err: any) {
      setActiveError(err?.message || 'Database initialization error');
    }
  };

  // Initialize SQLite WASM database on activeCaseId
  useEffect(() => {
    let active = true;
    async function initDb() {
      try {
        const SQL = await getOrInitSqlJs();
        if (!active) return;
        const db = new SQL.Database();
        db.run(dossier.seedSql);
        setDbInstance(db);

        const currentLeads = activeCaseId === 'case_clyde_shipyard' ? CASE_2_LEADS : CASE_1_LEADS;
        executeSql(currentLeads[0].starterSql, `Table: ${currentLeads[0].table}`, db);
      } catch (err: any) {
        setActiveError(err?.message || 'Database initialization error');
      }
    }
    initDb();
    return () => {
      active = false;
    };
  }, [activeCaseId]);

  // Global F5 listener
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F5') {
        e.preventDefault();
        executeSql(terminalSql, activeQueryTitle);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [terminalSql, activeQueryTitle, dbInstance]);

  // Submit Voucher Verification (Interrogation Confrontation)
  const handleVerifyVoucher = () => {
    const voucher = dossier.deductionVouchers.find((v) => v.id === activeVoucherId);
    if (!voucher) return;

    playStampSlam();
    const result = DetectiveEvaluator.evaluateVoucher(voucher, pinnedRow);
    setVerificationFeedback(result);

    if (result.status === 'ADMITTED') {
      setCareerProgress((prev) => {
        const cur = prev.completedVouchersByCase[dossier.id] || [];
        const next = cur.includes(voucher.id) ? cur : [...cur, voucher.id];
        return {
          ...prev,
          completedVouchersByCase: {
            ...prev.completedVouchersByCase,
            [dossier.id]: next,
          },
        };
      });
    } else if (result.deductCredibilityPercent && result.deductCredibilityPercent > 0) {
      setCareerProgress((prev) => ({
        ...prev,
        credibilityRating: Math.max(0, prev.credibilityRating - result.deductCredibilityPercent!),
      }));
    }
  };

  // Grand Jury Indictment Status (Dynamic for active case)
  const hasMotive =
    activeCaseId === 'case_clyde_shipyard'
      ? completedVoucherIds.includes('voucher_clyde_5_consulate_wiretap')
      : completedVoucherIds.includes('voucher_4_uncover_will_motive');

  const hasMeans =
    activeCaseId === 'case_clyde_shipyard'
      ? completedVoucherIds.includes('voucher_clyde_3_chemical_order') &&
        completedVoucherIds.includes('voucher_clyde_1_poison')
      : completedVoucherIds.includes('voucher_3_trace_cyanide_purchase') &&
        completedVoucherIds.includes('voucher_1_cause_of_death');

  const hasOpportunity =
    activeCaseId === 'case_clyde_shipyard'
      ? completedVoucherIds.includes('voucher_clyde_4_vault_infiltration') &&
        completedVoucherIds.includes('voucher_clyde_2_gate_reentry')
      : completedVoucherIds.includes('voucher_5_pinpoint_study_access') &&
        completedVoucherIds.includes('voucher_2_shatter_julian_alibi');

  const readyForIndictment = hasMotive && hasMeans && hasOpportunity;

  const handleIndict = () => {
    if (!readyForIndictment) return;
    playGavelStrike();
    setIndictmentState('indicted');
    setTimeout(() => {
      playCaseSolvedFanfare();
      setCareerProgress((prev) => ({
        ...prev,
        solvedCases: [...new Set([...prev.solvedCases, dossier.id])],
        rank: 'Chief Forensics Master',
      }));
    }, 1000);
  };

  const selectedSuspect =
    dossier.suspects.find((s) => s.id === selectedSuspectId) || dossier.suspects[0];
  const selectedEvidence =
    dossier.evidenceDocs.find((e) => e.id === selectedEvidenceId) || dossier.evidenceDocs[0];
  const activeVoucher =
    dossier.deductionVouchers.find((v) => v.id === activeVoucherId) || dossier.deductionVouchers[0];
  const activeLead = caseLeads[activeLeadIndex] || caseLeads[0];

  return (
    <div className="win95-bureau-container">
      {/* Quick Guide Tour Modal Dialog */}
      <DetectiveTourModal
        isOpen={showTourModal}
        onClose={() => setShowTourModal(false)}
        onOpenInvestigationRoom={() => {
          setShowTourModal(false);
          setActiveTab('terminal');
        }}
      />

      {/* ── 1. Windows 95 Menu Bar ──────────────────────────────────────── */}
      <div className="win95-menubar">
        <div
          className={`win95-menubar-item ${activeMenu === 'file' ? 'active' : ''}`}
          onClick={() => setActiveMenu(activeMenu === 'file' ? null : 'file')}
        >
          File
          {activeMenu === 'file' && (
            <div className="win95-menu-dropdown" onMouseLeave={() => setActiveMenu(null)}>
              <div
                className="win95-menu-dropdown-item"
                onClick={() => {
                  setActiveMenu(null);
                  handleSwitchCase('case_blackwood_manor');
                }}
              >
                <span>{activeCaseId === 'case_blackwood_manor' ? '✓ ' : '  '}Case 1: Blackwood Manor</span>
              </div>
              <div
                className="win95-menu-dropdown-item"
                onClick={() => {
                  setActiveMenu(null);
                  handleSwitchCase('case_clyde_shipyard');
                }}
              >
                <span>{activeCaseId === 'case_clyde_shipyard' ? '✓ ' : '  '}Case 2: Clyde Naval Shipyard</span>
              </div>
              <div className="win95-menu-divider" />
              <div
                className="win95-menu-dropdown-item"
                onClick={() => {
                  setActiveMenu(null);
                  setActiveTab('docket');
                }}
              >
                <span>Case Briefing</span>
                <span>F1</span>
              </div>
              <div
                className="win95-menu-dropdown-item"
                onClick={() => {
                  setActiveMenu(null);
                  setActiveTab('terminal');
                }}
              >
                <span>Investigation Room</span>
                <span>F2</span>
              </div>
              <div className="win95-menu-divider" />
              <div
                className="win95-menu-dropdown-item"
                onClick={() => {
                  setActiveMenu(null);
                  handleExportReport();
                }}
              >
                <span>📄 Export Case Dossier (.TXT)...</span>
              </div>
              <div
                className="win95-menu-dropdown-item"
                onClick={() => {
                  setActiveMenu(null);
                  handleExportCsv();
                }}
              >
                <span>💾 Export Active Query to CSV...</span>
              </div>
              <div className="win95-menu-divider" />
              <div
                className="win95-menu-dropdown-item"
                onClick={() => {
                  setActiveMenu(null);
                  setCareerProgress((prev) => ({
                    ...prev,
                    completedVouchersByCase: { [dossier.id]: [] },
                    credibilityRating: 100,
                  }));
                  setPinnedRow(null);
                  setVerificationFeedback(null);
                  setIndictmentState('pending');
                  if (typeof window !== 'undefined') {
                    localStorage.removeItem(STORAGE_SESSION_KEY);
                  }
                }}
              >
                <span>Restart Current Case</span>
              </div>
              <div className="win95-menu-divider" />
              <div
                className="win95-menu-dropdown-item"
                onClick={() => {
                  setActiveMenu(null);
                  if (onClose) onClose();
                }}
              >
                <span>Close Case Window</span>
                <span>Alt+F4</span>
              </div>
            </div>
          )}
        </div>

        <div
          className={`win95-menubar-item ${activeMenu === 'tables' ? 'active' : ''}`}
          onClick={() => setActiveMenu(activeMenu === 'tables' ? null : 'tables')}
        >
          Database Tables ({dossier.tables.length})
          {activeMenu === 'tables' && (
            <div className="win95-menu-dropdown" onMouseLeave={() => setActiveMenu(null)}>
              {dossier.tables.map((t) => (
                <div
                  key={t}
                  className="win95-menu-dropdown-item"
                  onClick={() => {
                    setActiveMenu(null);
                    setSelectedTableForBrowse(t);
                    setTerminalSql(`SELECT * FROM ${t};`);
                    setActiveQueryTitle(`Table: ${t}`);
                    setActiveTab('terminal');
                    executeSql(`SELECT * FROM ${t};`, `Table: ${t}`);
                  }}
                >
                  <span>📁 {t}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div
          className={`win95-menubar-item ${activeMenu === 'help' ? 'active' : ''}`}
          onClick={() => setActiveMenu(activeMenu === 'help' ? null : 'help')}
        >
          Help
          {activeMenu === 'help' && (
            <div className="win95-menu-dropdown" onMouseLeave={() => setActiveMenu(null)}>
              <div
                className="win95-menu-dropdown-item"
                onClick={() => {
                  setActiveMenu(null);
                  setShowTourModal(true);
                }}
              >
                <span>Detective Field Manual...</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── 2. Tab Navigation Bar ────────────────────────────────────────── */}
      <div className="win95-sheet-tabs-container">
        <button
          className={`win95-sheet-tab ${activeTab === 'docket' ? 'active' : ''}`}
          onClick={() => {
            playTypewriterKey();
            setActiveTab('docket');
          }}
        >
          <span>📋 Case Briefing</span>
          {activeTab === 'docket' && <span className="win95-tab-active-pill">● ACTIVE</span>}
        </button>
        <button
          className={`win95-sheet-tab ${activeTab === 'suspects' ? 'active' : ''}`}
          onClick={() => {
            playTypewriterKey();
            setActiveTab('suspects');
          }}
        >
          <span>👥 Suspects &amp; Alibis ({dossier.suspects.length})</span>
          {activeTab === 'suspects' && <span className="win95-tab-active-pill">● ACTIVE</span>}
        </button>
        <button
          className={`win95-sheet-tab ${activeTab === 'evidence' ? 'active' : ''}`}
          onClick={() => {
            playTypewriterKey();
            setActiveTab('evidence');
          }}
        >
          <span>🔍 Evidence Vault ({dossier.evidenceDocs.length})</span>
          {activeTab === 'evidence' && <span className="win95-tab-active-pill">● ACTIVE</span>}
        </button>
        <button
          className={`win95-sheet-tab ${activeTab === 'terminal' ? 'active' : ''}`}
          onClick={() => {
            playTypewriterKey();
            setActiveTab('terminal');
          }}
        >
          <span>🔬 Investigation Room</span>
          {activeTab === 'terminal' && <span className="win95-tab-active-pill">● ACTIVE</span>}
        </button>
        <button
          className={`win95-sheet-tab ${activeTab === 'vouchers' ? 'active' : ''}`}
          onClick={() => {
            playTypewriterKey();
            setActiveTab('vouchers');
          }}
        >
          <span>🧩 Solve Clues ({completedVoucherIds.length}/5)</span>
          {activeTab === 'vouchers' && <span className="win95-tab-active-pill">● ACTIVE</span>}
        </button>
        <button
          className={`win95-sheet-tab ${activeTab === 'courtroom' ? 'active' : ''}`}
          onClick={() => {
            playTypewriterKey();
            setActiveTab('courtroom');
          }}
        >
          <span>⚖️ Grand Jury Trial</span>
          {activeTab === 'courtroom' && <span className="win95-tab-active-pill">● ACTIVE</span>}
        </button>

        {/* Right Status Toolbar */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '3px' }}>
          <button
            className="win95-button"
            onClick={() => setShowTourModal(true)}
            style={{
              padding: '2px 8px',
              fontSize: '11px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
            title="Open Detective Field Manual"
          >
            ❓ Guide Tour
          </button>

          <div
            className="win95-inset"
            style={{
              padding: '3px 10px',
              fontSize: '11px',
              fontWeight: 'bold',
              background: 'var(--w95-sunken-bg, #ffffff)',
              color: 'var(--w95-sunken-text, #000000)',
            }}
          >
            Credibility:{' '}
            <span
              style={{
                color:
                  careerProgress.credibilityRating > 70
                    ? '#1b5e20'
                    : careerProgress.credibilityRating > 40
                    ? '#e65100'
                    : '#b71c1c',
              }}
            >
              {careerProgress.credibilityRating}%
            </span>
          </div>

          <div
            className="win95-inset"
            style={{
              padding: '3px 10px',
              fontSize: '11px',
              fontWeight: 'bold',
              background: 'var(--w95-sunken-bg, #ffffff)',
              color: 'var(--w95-sunken-text, #000000)',
            }}
          >
            Badge #{careerProgress.badgeNumber} • {careerProgress.rank}
          </div>
        </div>
      </div>

      {/* ── 3. Main Workspace Viewport ─────────────────────────────────── */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* ── TAB 1: Case Briefing & Docket Selection ─────────────────────── */}
        {activeTab === 'docket' && (
          <div className="win95-split-content" style={{ padding: '20px 24px', flex: 1, overflowY: 'auto' }}>
            {/* Dual Case Dossier Switcher Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', borderBottom: '2px solid var(--w95-dark-gray, #808080)', paddingBottom: '12px' }}>
              <button
                className={`win95-button ${activeCaseId === 'case_blackwood_manor' ? 'active' : ''}`}
                onClick={() => handleSwitchCase('case_blackwood_manor')}
                style={{
                  padding: '6px 16px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: activeCaseId === 'case_blackwood_manor' ? 'var(--w95-title-active-bg, #000080)' : undefined,
                  color: activeCaseId === 'case_blackwood_manor' ? '#ffffff' : undefined,
                }}
              >
                📁 CASE #1995-CR-0842: Blackwood Manor (Scottish Highlands)
              </button>
              <button
                className={`win95-button ${activeCaseId === 'case_clyde_shipyard' ? 'active' : ''}`}
                onClick={() => handleSwitchCase('case_clyde_shipyard')}
                style={{
                  padding: '6px 16px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: activeCaseId === 'case_clyde_shipyard' ? 'var(--w95-title-active-bg, #000080)' : undefined,
                  color: activeCaseId === 'case_clyde_shipyard' ? '#ffffff' : undefined,
                }}
              >
                📁 CASE #1995-CR-1042: Clyde Naval Shipyard (Glasgow)
              </button>
            </div>

            <div className="detective-hero-banner">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>
                    CASE FILE #{dossier.caseNumber}: {dossier.title}
                  </h2>
                  <div style={{ fontSize: '13px', opacity: 0.85, marginTop: '3px' }}>
                    {dossier.subtitle} • Location: {dossier.setting}
                  </div>
                </div>
                <span className="win95-badge success" style={{ padding: '4px 10px', fontSize: '11px' }}>
                  ACTIVE INQUIRY
                </span>
              </div>
            </div>

            <fieldset className="detective-card" style={{ marginBottom: '16px' }}>
              <legend className="detective-card-legend">DECEASED VICTIM PROFILE</legend>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', fontSize: '13px' }}>
                <div><strong>Name:</strong> {dossier.victim.name}</div>
                <div><strong>Age:</strong> {dossier.victim.age} years</div>
                <div><strong>Occupation:</strong> {dossier.victim.occupation}</div>
                <div><strong>Location Found:</strong> {dossier.victim.locationFound}</div>
                <div><strong>Cause of Death:</strong> <span style={{ color: '#b71c1c', fontWeight: 'bold' }}>{dossier.victim.causeOfDeath}</span></div>
                <div><strong>Estimated Time of Death:</strong> {dossier.victim.timeOfDeathEstimate}</div>
              </div>
            </fieldset>

            <fieldset className="detective-card" style={{ marginBottom: '16px' }}>
              <legend className="detective-card-legend">OFFICIAL HOMICIDE BRIEFING NARRATIVE</legend>
              <div className="detective-paper-box" style={{ fontSize: '13px', lineHeight: '1.7' }}>
                {dossier.briefSummary}
              </div>
            </fieldset>

            <fieldset className="detective-card" style={{ marginBottom: '16px' }}>
              <legend className="detective-card-legend">FORENSIC RELATIONAL DATABASE TABLES ({dossier.tables.length})</legend>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {dossier.tables.map((tbl) => (
                  <button
                    key={tbl}
                    className="win95-button"
                    onClick={() => {
                      setTerminalSql(`SELECT * FROM ${tbl};`);
                      setActiveQueryTitle(`Table: ${tbl}`);
                      setActiveTab('terminal');
                      executeSql(`SELECT * FROM ${tbl};`, `Table: ${tbl}`);
                    }}
                    style={{ padding: '4px 10px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    📁 <span>{tbl}</span> ➔
                  </button>
                ))}
              </div>
            </fieldset>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
              <button
                className="win95-button"
                onClick={handleExportReport}
                style={{ padding: '8px 16px', fontWeight: 'bold', fontSize: '12px' }}
                title="Download full forensic case dossier report as a text file"
              >
                📄 Export Dossier (.TXT)
              </button>
              <button
                className="win95-button"
                onClick={() => {
                  playTypewriterKey();
                  setActiveTab('suspects');
                }}
                style={{ padding: '8px 20px', fontWeight: 'bold', fontSize: '12px' }}
              >
                👥 Review Suspects & Alibis ➔
              </button>
              <button
                className="win95-button"
                onClick={() => {
                  playTypewriterKey();
                  setActiveTab('terminal');
                }}
                style={{ padding: '8px 20px', fontWeight: 'bold', fontSize: '12px', background: 'var(--w95-title-active-bg, #000080)', color: '#ffffff' }}
              >
                🔬 Open Investigation Room ➔
              </button>
            </div>
          </div>
        )}

        {/* ── TAB 2: Suspects & Alibis ───────────────────────────────────── */}
        {activeTab === 'suspects' && (
          <div className="win95-split-view">
            <div className="win95-split-sidebar">
              <div className="win95-listview-header">
                <span>SUSPECT PERSONS ({dossier.suspects.length})</span>
                <span>STATUS</span>
              </div>
              {dossier.suspects.map((s) => (
                <div
                  key={s.id}
                  className={`win95-list-item ${selectedSuspectId === s.id ? 'selected' : ''}`}
                  onClick={() => {
                    playTypewriterKey();
                    setSelectedSuspectId(s.id);
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '12px' }}>{s.name}</div>
                    <div style={{ fontSize: '11px', opacity: 0.75 }}>
                      {s.badgeNumber} • {s.role}
                    </div>
                  </div>
                  <span className="win95-badge pending" style={{ fontSize: '10px' }}>
                    PENDING
                  </span>
                </div>
              ))}
            </div>

            <div className="win95-split-content">
              <div
                style={{
                  borderBottom: '2px solid var(--w95-dark-gray, #808080)',
                  paddingBottom: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px' }}>{selectedSuspect.name}</h3>
                  <div style={{ fontSize: '12px', opacity: 0.85, marginTop: '2px' }}>
                    Role: {selectedSuspect.role} • Relationship: {selectedSuspect.relationship}
                  </div>
                </div>
                <span className="win95-badge" style={{ fontSize: '11px' }}>
                  {selectedSuspect.badgeNumber} • AGE {selectedSuspect.age}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <fieldset className="detective-card">
                  <legend className="detective-card-legend">WHAT THEY CLAIMED TO POLICE (THEIR ALIBI)</legend>
                  <div className="detective-paper-box">"{selectedSuspect.swornStatement}"</div>
                  <div style={{ marginTop: '8px', fontSize: '12px', opacity: 0.85 }}>
                    <strong>Claimed Location:</strong> {selectedSuspect.declaredAlibiLocation}
                  </div>
                </fieldset>

                <fieldset className="detective-card">
                  <legend className="detective-card-legend">MOTIVE & REASON FOR SUSPICION</legend>
                  <div style={{ fontSize: '13px', lineHeight: '1.6' }}>{selectedSuspect.financialMotive}</div>
                  <div
                    style={{
                      marginTop: '12px',
                      padding: '8px 12px',
                      background: 'rgba(0,0,0,0.05)',
                      borderRadius: '2px',
                      fontSize: '12px',
                    }}
                  >
                    💡 <strong>Detective Tip:</strong> Audit electronic door logs or switchboard toll records in the
                    Investigation Room to cross-examine their claims!
                  </div>
                </fieldset>
              </div>

              {selectedSuspect.brokenAlibiAdmission &&
                completedVoucherIds.some((vId) => vId.includes('alibi') || vId.includes('reentry') || vId.includes('breakin')) && (
                  <fieldset
                    style={{
                      border: '2px solid #b71c1c',
                      padding: '14px 16px',
                      background: 'rgba(183, 28, 28, 0.08)',
                      borderRadius: '2px',
                    }}
                  >
                    <legend style={{ fontWeight: 'bold', color: '#b71c1c', padding: '0 6px', fontSize: '12px' }}>
                      🚨 ALIBI SHATTERED BY FORENSIC EVIDENCE — SUSPECT CONFESSION
                    </legend>
                    <div className="detective-paper-box" style={{ color: '#b71c1c', fontWeight: 'bold' }}>
                      "{selectedSuspect.brokenAlibiAdmission}"
                    </div>
                  </fieldset>
                )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'auto', paddingTop: '10px' }}>
                <button
                  className="win95-button"
                  onClick={() => {
                    playTypewriterKey();
                    const targetTable = activeCaseId === 'case_clyde_shipyard' ? 'dock_gate_logs' : 'keycard_logs';
                    const q = `SELECT * FROM ${targetTable};`;
                    setTerminalSql(q);
                    setActiveQueryTitle(`Audit: ${selectedSuspect.name}`);
                    setActiveTab('terminal');
                    terminalInputRef.current?.focus();
                  }}
                  style={{ padding: '6px 18px', fontWeight: 'bold', fontSize: '12px' }}
                >
                  🔬 Interrogate This Suspect's Data in Investigation Room ➔
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 3: Evidence Vault ─────────────────────────────────────── */}
        {activeTab === 'evidence' && (
          <div className="win95-split-view">
            <div className="win95-split-sidebar">
              <div className="win95-listview-header">
                <span>EVIDENCE VAULT ({dossier.evidenceDocs.length})</span>
                <span>SEAL DATE</span>
              </div>
              {dossier.evidenceDocs.map((doc) => (
                <div
                  key={doc.id}
                  className={`win95-list-item ${selectedEvidenceId === doc.id ? 'selected' : ''}`}
                  onClick={() => {
                    playTypewriterKey();
                    setSelectedEvidenceId(doc.id);
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '12px' }}>{doc.title}</div>
                    <div style={{ fontSize: '11px', opacity: 0.75 }}>Tag #{doc.id.toUpperCase()}</div>
                  </div>
                  <span style={{ fontSize: '10px', opacity: 0.8 }}>{doc.dateStr}</span>
                </div>
              ))}
            </div>

            <div className="win95-split-content">
              {selectedEvidence.type === 'autopsy' && selectedEvidence.autopsyData ? (
                <div>
                  <div
                    style={{
                      borderBottom: '2px solid var(--w95-dark-gray, #808080)',
                      paddingBottom: '8px',
                      marginBottom: '14px',
                    }}
                  >
                    <h3 style={{ margin: 0, fontSize: '18px' }}>
                      HER MAJESTY'S CORONER: OFFICIAL AUTOPSY & TOXICOLOGY PROTOCOL
                    </h3>
                    <div style={{ fontSize: '12px', opacity: 0.85, marginTop: '3px' }}>
                      Protocol: {selectedEvidence.autopsyData.protocolNumber} • Coroner:{' '}
                      {selectedEvidence.autopsyData.coronerName}
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '12px',
                      marginBottom: '16px',
                      fontSize: '13px',
                    }}
                  >
                    <div><strong>Deceased:</strong> {selectedEvidence.autopsyData.victimName}</div>
                    <div>
                      <strong>Cause of Death:</strong>{' '}
                      <span style={{ color: '#b71c1c', fontWeight: 'bold' }}>
                        {selectedEvidence.autopsyData.causeOfDeath}
                      </span>
                    </div>
                    <div><strong>Estimated Time of Death:</strong> {selectedEvidence.autopsyData.timeOfDeathEstimated}</div>
                    <div>
                      <strong>Key Toxicology Summary:</strong> {selectedEvidence.autopsyData.toxicologySummary}
                    </div>
                  </div>

                  <fieldset className="detective-card">
                    <legend className="detective-card-legend">PATHOLOGIST CONFIDENTIAL REMARKS</legend>
                    <div className="detective-paper-box" style={{ fontSize: '13px', lineHeight: '1.6' }}>
                      {selectedEvidence.autopsyData.pathologistNotes}
                    </div>
                  </fieldset>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                    <button
                      className="win95-button"
                      onClick={() => {
                        playTypewriterKey();
                        const targetTbl = activeCaseId === 'case_clyde_shipyard' ? 'dockyard_toxicology' : 'toxicology_records';
                        setTerminalSql(`SELECT * FROM ${targetTbl};`);
                        setActiveQueryTitle('Forensic Toxicology Records');
                        setActiveTab('terminal');
                        terminalInputRef.current?.focus();
                      }}
                      style={{ padding: '6px 18px', fontWeight: 'bold', fontSize: '12px' }}
                    >
                      🔬 Inspect Full Toxicology in Investigation Room ➔
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div
                    style={{
                      borderBottom: '2px solid var(--w95-dark-gray, #808080)',
                      paddingBottom: '8px',
                      marginBottom: '14px',
                    }}
                  >
                    <h3 style={{ margin: 0, fontSize: '18px' }}>{selectedEvidence.title}</h3>
                    <div style={{ fontSize: '12px', opacity: 0.85, marginTop: '2px' }}>
                      {selectedEvidence.description}
                    </div>
                  </div>
                  <pre className="detective-paper-box">{selectedEvidence.rawText}</pre>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB 4: Data Investigation Room (Forensic Crime Lab) ──────────── */}
        {activeTab === 'terminal' && (
          <div className="forensic-workbench-layout">
            {/* Left Sidebar: 5 Clear Investigation Leads + Table Dropdown */}
            <div className="forensic-lead-sidebar">
              <div style={{ fontWeight: 'bold', fontSize: '12px', borderBottom: '1px solid var(--w95-dark-gray)', paddingBottom: '4px' }}>
                💡 INVESTIGATION LEADS (5)
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {caseLeads.map((lead, idx) => (
                  <div
                    key={idx}
                    className={`forensic-lead-card ${activeLeadIndex === idx ? 'active' : ''}`}
                    onClick={() => {
                      playTypewriterKey();
                      setActiveLeadIndex(idx);
                      setActiveQueryTitle(lead.title);
                      // Set starter query without answer filters!
                      setTerminalSql(lead.starterSql);
                      setSelectedTableForBrowse(lead.table);
                      setSortColumn(null);
                      setClientFilterText('');
                      // Do NOT auto-execute!
                    }}
                  >
                    <div style={{ fontWeight: 'bold', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>{lead.icon}</span>
                      <span>{lead.title}</span>
                    </div>
                    <div style={{ fontSize: '11px', opacity: 0.85 }}>{lead.desc}</div>
                    <div className="forensic-sub-table">📁 {lead.table}</div>
                  </div>
                ))}
              </div>

              {/* Table Selector (Clean, non-cluttered dropdown) */}
              <div style={{ fontWeight: 'bold', fontSize: '12px', borderBottom: '1px solid var(--w95-dark-gray)', paddingBottom: '4px', marginTop: '10px' }}>
                📁 BROWSE DATABASE TABLES
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <select
                  className="win95-select"
                  value={selectedTableForBrowse}
                  onChange={(e) => setSelectedTableForBrowse(e.target.value)}
                  style={{
                    padding: '4px 6px',
                    fontSize: '11px',
                    background: 'var(--w95-sunken-bg, #ffffff)',
                    color: 'var(--w95-sunken-text, #000000)',
                    border: '1px solid var(--w95-dark-gray)',
                  }}
                >
                  {dossier.tables.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <button
                  className="win95-button"
                  onClick={() => {
                    const q = `SELECT * FROM ${selectedTableForBrowse};`;
                    setActiveQueryTitle(`Table: ${selectedTableForBrowse}`);
                    setTerminalSql(q);
                    executeSql(q, `Table: ${selectedTableForBrowse}`);
                  }}
                  style={{ padding: '4px 10px', fontSize: '11px', fontWeight: 'bold' }}
                >
                  🔍 Inspect Table ➔
                </button>
              </div>

              {/* Interactive Column Schema Inspector */}
              {tableSchema.length > 0 && (
                <div className="forensic-schema-box">
                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: 'bold',
                      marginBottom: '4px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span>COLUMNS ({tableSchema.length})</span>
                    <span style={{ fontSize: '9px', opacity: 0.7 }}>Click to append</span>
                  </div>
                  <div className="forensic-column-chips">
                    {tableSchema.map((col) => (
                      <button
                        key={col.name}
                        className="forensic-col-chip"
                        onClick={() => handleInsertColumn(col.name)}
                        title={`Click to append column "${col.name}" into SQL input`}
                      >
                        <span className="col-name">{col.name}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                          <span className="col-type">{col.type || 'TEXT'}</span>
                          {col.pk && <span className="col-pk">PK</span>}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Main Screen: Single Dedicated Result View (Zero Stacked Clutter) */}
            <div className="forensic-main-screen">
              {/* Header Bar */}
              <div className="forensic-header-bar">
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '13px' }}>
                    🔬 {activeResult ? activeResult.title : 'Forensic Investigation Workbench'}
                  </div>
                  <div style={{ fontSize: '11px', opacity: 0.85, marginTop: '2px', fontFamily: 'var(--w95-mono)' }}>
                    {activeResult ? activeResult.query : terminalSql}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {activeResult && (
                    <>
                      <input
                        type="text"
                        className="forensic-filter-input"
                        placeholder="Search rows..."
                        value={clientFilterText}
                        onChange={(e) => setClientFilterText(e.target.value)}
                        style={{ width: '120px' }}
                        title="Filter loaded rows"
                      />
                      {clientFilterText && (
                        <button
                          className="win95-button"
                          onClick={() => setClientFilterText('')}
                          style={{ padding: '1px 5px', fontSize: '10px' }}
                          title="Clear filter"
                        >
                          ✕
                        </button>
                      )}
                      <button
                        className="win95-button"
                        onClick={handleExportCsv}
                        disabled={activeResult.rows.length === 0}
                        style={{ padding: '2px 8px', fontSize: '11px', fontWeight: 'bold' }}
                        title="Export current rows to CSV file"
                      >
                        💾 CSV
                      </button>
                      <span className="win95-badge success" style={{ fontSize: '11px' }}>
                        {filteredAndSortedRows.length} / {activeResult.rowCount} Records ({activeResult.executionTimeMs} ms)
                      </span>
                    </>
                  )}
                  {activeError && (
                    <span className="win95-badge danger" style={{ fontSize: '11px' }}>
                      SQL Error
                    </span>
                  )}
                </div>
              </div>

              {/* Active Lead Directive & Objective Card */}
              <div className="forensic-lead-directive-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: '13px' }}>
                    <span>{activeLead.icon}</span>
                    <span>MISSION OBJECTIVE: {activeLead.title}</span>
                  </div>
                  {attachToast && <span className="forensic-toast-banner">{attachToast}</span>}
                </div>
                <div style={{ fontSize: '12px', marginTop: '4px', lineHeight: '1.5' }}>
                  <strong>🎯 Target:</strong> {activeLead.objective}
                </div>
                <div style={{ fontSize: '11px', marginTop: '3px', opacity: 0.9, color: 'var(--w95-accent-color, var(--w95-titlebar-active, #000080))' }}>
                  💡 <strong>Investigative Clue:</strong> {activeLead.hint}
                </div>
                <div style={{ marginTop: '6px', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <button
                    className="win95-button"
                    onClick={() => {
                      executeSql(activeLead.starterSql, `Table: ${activeLead.table}`);
                    }}
                    style={{ padding: '2px 8px', fontSize: '11px', fontWeight: 'bold' }}
                    title="Run raw table query"
                  >
                    ▶ Inspect Base Table ({activeLead.table})
                  </button>
                  <span style={{ fontSize: '11px', opacity: 0.75 }}>
                    Formulate your SQL <code>WHERE</code> filter in the box below to isolate the smoking gun row!
                  </span>
                </div>
              </div>

              {/* Table Data Viewport */}
              <div className="forensic-table-viewport">
                {activeError ? (
                  <div style={{ padding: '16px', color: '#b71c1c', fontWeight: 'bold' }}>
                    ⚠️ {activeError}
                  </div>
                ) : activeResult && activeResult.rows.length > 0 ? (
                  <table className="forensic-data-table">
                    <thead>
                      <tr>
                        <th style={{ width: '180px', textAlign: 'center' }}>EVIDENCE ACTION</th>
                        {activeResult.columns.map((col) => (
                          <th
                            key={col}
                            className="sortable-th"
                            onClick={() => handleSort(col)}
                            title={`Click to sort by ${col}`}
                          >
                            <span>{col.toUpperCase().replace(/_/g, ' ')}</span>
                            <span className="forensic-sort-indicator">
                              {sortColumn === col ? (sortDirection === 'asc' ? ' ▲' : ' ▼') : ' ↕'}
                            </span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAndSortedRows.length > 0 ? (
                        filteredAndSortedRows.map((rowVals, rIdx) => {
                          const rowObj: Record<string, any> = {};
                          activeResult.columns.forEach((c, idx) => {
                            rowObj[c] = rowVals[idx];
                          });

                          const isPinned =
                            pinnedRow &&
                            Object.keys(pinnedRow).every((k) => String(pinnedRow[k]) === String(rowObj[k]));

                          return (
                            <tr
                              key={rIdx}
                              className={isPinned ? 'selected' : ''}
                              onClick={() => {
                                playPaperclip();
                                setPinnedRow(rowObj);
                                setAttachToast('✓ Row Attached to Evidence Clip!');
                                setTimeout(() => setAttachToast(null), 3000);
                              }}
                              style={{ cursor: 'pointer' }}
                            >
                              <td style={{ textAlign: 'center' }}>
                                <button
                                  className={`forensic-evidence-btn ${isPinned ? 'selected' : 'unselected'}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    playPaperclip();
                                    setPinnedRow(rowObj);
                                    setAttachToast('✓ Row Attached to Evidence Clip!');
                                    setTimeout(() => setAttachToast(null), 3000);
                                  }}
                                >
                                  {isPinned ? '✓ ATTACHED AS EVIDENCE' : '📌 Attach as Clue Evidence'}
                                </button>
                              </td>
                              {rowVals.map((val, cIdx) => {
                                const valStr = val === null ? 'NULL' : String(val);
                                const isHighInterest =
                                  valStr.toLowerCase().includes('cyanide') ||
                                  valStr.toLowerCase().includes('julian') ||
                                  valStr.toLowerCase().includes('colin') ||
                                  valStr === 'STUDY_E201' ||
                                  valStr.includes('1995_REV') ||
                                  valStr.includes('UNAUTHORIZED');

                                return (
                                  <td
                                    key={cIdx}
                                    style={{
                                      fontWeight: isHighInterest ? 'bold' : 'normal',
                                      color: isHighInterest ? '#b71c1c' : undefined,
                                    }}
                                  >
                                    {valStr}
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={activeResult.columns.length + 1} style={{ textAlign: 'center', padding: '24px', opacity: 0.75 }}>
                            No records match filter "{clientFilterText}". Click ✕ above to clear.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                ) : (
                  <div style={{ padding: '24px', textAlign: 'center', opacity: 0.75 }}>
                    0 records returned. Select an Investigation Lead on the left or enter a SQL query below.
                  </div>
                )}
              </div>

              {/* Bottom Evidence Dock (Crystal Clear Evidence Connection) */}
              <div className="forensic-dock-strip">
                <div>
                  {pinnedRow ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 'bold', color: '#1b5e20' }}>
                        📌 CURRENT ATTACHED PROOF:
                      </span>
                      <span style={{ opacity: 0.9, fontFamily: 'var(--w95-mono)' }}>
                        [
                        {Object.entries(pinnedRow)
                          .slice(0, 3)
                          .map(([k, v]) => `${k}=${v}`)
                          .join(' | ')}
                        ]
                      </span>
                    </div>
                  ) : (
                    <span style={{ opacity: 0.85 }}>
                      💡 Click <strong>[ 📌 Attach as Clue Evidence ]</strong> on any row above to use it to solve clues!
                    </span>
                  )}
                </div>
                <button
                  className="win95-button"
                  onClick={() => {
                    playTypewriterKey();
                    setActiveTab('vouchers');
                  }}
                  disabled={!pinnedRow}
                  style={{
                    padding: '4px 16px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    background: pinnedRow ? 'var(--w95-title-active-bg, #000080)' : undefined,
                    color: pinnedRow ? '#ffffff' : undefined,
                  }}
                >
                  👉 TAKE PROOF TO SOLVE CLUES (VOUCHER 1..5) ➔
                </button>
              </div>

              {/* Spacious & Prominent Multi-Line SQL Query Console */}
              <div className="forensic-query-console">
                <div className="forensic-query-console-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      💻 <span>SQL INVESTIGATION CONSOLE</span>
                    </span>
                    <span style={{ fontSize: '11px', opacity: 0.8, fontStyle: 'italic' }}>
                      (Press [F5] or [Ctrl+Enter] to Execute)
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    {queryHistory.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <button
                          type="button"
                          className="win95-button"
                          onClick={() => {
                            const nextIdx = historyIndex === -1 ? queryHistory.length - 1 : Math.max(0, historyIndex - 1);
                            setHistoryIndex(nextIdx);
                            setTerminalSql(queryHistory[nextIdx]);
                          }}
                          style={{ padding: '2px 8px', fontSize: '11px' }}
                          title="Previous Query from History (Up Arrow)"
                        >
                          ◀ Prev
                        </button>
                        <span style={{ fontSize: '10px', opacity: 0.75, padding: '0 2px' }}>
                          History ({queryHistory.length})
                        </span>
                        <button
                          type="button"
                          className="win95-button"
                          onClick={() => {
                            if (historyIndex === -1) return;
                            if (historyIndex < queryHistory.length - 1) {
                              const nextIdx = historyIndex + 1;
                              setHistoryIndex(nextIdx);
                              setTerminalSql(queryHistory[nextIdx]);
                            } else {
                              setHistoryIndex(-1);
                              setTerminalSql('');
                            }
                          }}
                          disabled={historyIndex === -1}
                          style={{ padding: '2px 8px', fontSize: '11px' }}
                          title="Next Query from History (Down Arrow)"
                        >
                          Next ▶
                        </button>
                      </div>
                    )}
                    <button
                      type="button"
                      className="win95-button"
                      onClick={() => {
                        setTerminalSql('');
                        terminalInputRef.current?.focus();
                      }}
                      style={{ padding: '2px 8px', fontSize: '11px' }}
                      title="Clear Query Area"
                    >
                      ✕ Clear
                    </button>
                    <button
                      type="button"
                      className="win95-button"
                      onClick={() => {
                        setTerminalSql(activeLead.starterSql);
                        terminalInputRef.current?.focus();
                      }}
                      style={{ padding: '2px 8px', fontSize: '11px' }}
                      title="Reset to Active Table Base Query"
                    >
                      🔄 Reset Query
                    </button>
                    <button
                      type="button"
                      className="win95-button"
                      onClick={() => executeSql(terminalSql, 'Custom SQL Query')}
                      disabled={executing || !terminalSql.trim()}
                      style={{
                        padding: '4px 18px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        background: 'var(--w95-title-active-bg, #000080)',
                        color: '#ffffff',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '1px 1px 4px rgba(0,0,0,0.3)',
                      }}
                    >
                      ▶ RUN QUERY [F5]
                    </button>
                  </div>
                </div>

                {/* Multi-Line SQL Textarea Editor */}
                <div className="forensic-query-input-wrap">
                  <div className="forensic-query-gutter">
                    <span>1</span>
                    <span>2</span>
                    <span>3</span>
                    <span>4</span>
                  </div>
                  <textarea
                    ref={terminalInputRef}
                    className="forensic-sql-textarea"
                    value={terminalSql}
                    onChange={(e) => {
                      setTerminalSql(e.target.value);
                      setHistoryIndex(-1);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'F5' || (e.key === 'Enter' && (e.ctrlKey || e.metaKey))) {
                        e.preventDefault();
                        executeSql(terminalSql, 'Custom SQL Query');
                      }
                    }}
                    placeholder={`-- Enter SQL query to investigate forensic evidence (Press F5 or Ctrl+Enter to execute):
SELECT * FROM ${activeLead.table} WHERE ...;`}
                    rows={4}
                    spellCheck={false}
                  />
                </div>

                {/* Quick SQL Keyword Helper Buttons */}
                <div className="forensic-query-snippets">
                  <span style={{ fontSize: '11px', fontWeight: 'bold', opacity: 0.85 }}>Quick SQL Syntax:</span>
                  {['WHERE', 'AND', 'OR', 'LIKE', 'IN', 'JOIN', 'GROUP BY', 'ORDER BY', 'LIMIT 10'].map((snip) => (
                    <button
                      key={snip}
                      type="button"
                      className="win95-button"
                      onClick={() => {
                        const newSql = terminalSql ? `${terminalSql.trimEnd()} ${snip} ` : `${snip} `;
                        setTerminalSql(newSql);
                        terminalInputRef.current?.focus();
                      }}
                      style={{ padding: '1px 7px', fontSize: '11px' }}
                    >
                      +{snip}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 5: Solve Clues & Interrogation Desk ─────────────────────── */}
        {activeTab === 'vouchers' && (
          <div className="clue-confrontation-desk">
            <div className="clue-dossier-list">
              <div className="win95-listview-header">
                <span>CLUE DOSSIER FOLDERS (5)</span>
                <span>STATUS</span>
              </div>
              {dossier.deductionVouchers.map((v) => {
                const isAdmitted = completedVoucherIds.includes(v.id);
                return (
                  <div
                    key={v.id}
                    className={`clue-dossier-folder-item ${activeVoucherId === v.id ? 'selected' : ''}`}
                    onClick={() => {
                      playTypewriterKey();
                      setActiveVoucherId(v.id);
                      setVerificationFeedback(null);
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '12px' }}>📂 Clue #{v.phaseNumber}</span>
                      <span className={`win95-badge ${isAdmitted ? 'success' : 'pending'}`}>
                        {isAdmitted ? 'SOLVED ✅' : 'OPEN'}
                      </span>
                    </div>
                    <div style={{ fontSize: '11px', opacity: 0.85, marginTop: '2px' }}>
                      {v.title.slice(8, 42)}...
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="win95-split-content">
              <div
                style={{
                  borderBottom: '2px solid var(--w95-dark-gray, #808080)',
                  paddingBottom: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px' }}>{activeVoucher.title}</h3>
                  <div style={{ fontSize: '13px', marginTop: '4px', opacity: 0.85 }}>
                    <strong>Investigation Objective:</strong> {activeVoucher.hypothesisTarget}
                  </div>
                </div>
                <span
                  className={`win95-badge ${
                    completedVoucherIds.includes(activeVoucher.id) ? 'success' : 'pending'
                  }`}
                  style={{ padding: '4px 10px', fontSize: '11px' }}
                >
                  {completedVoucherIds.includes(activeVoucher.id) ? 'PROVEN & ADMITTED ✅' : 'PROOF REQUIRED'}
                </span>
              </div>

              <div className="clue-side-by-side">
                <fieldset className="detective-card">
                  <legend className="detective-card-legend">SUSPECT'S SWORN CLAIM (WHAT WE MUST DISPROVE)</legend>
                  <div className="detective-paper-box" style={{ borderLeft: '4px solid #b71c1c' }}>
                    "{activeVoucher.contradictedClaimText}"
                  </div>
                  <div style={{ marginTop: '10px', fontSize: '12px', opacity: 0.85 }}>
                    💡 <strong>Your task:</strong> Find digital or physical evidence that proves this statement is a lie!
                  </div>
                </fieldset>

                <fieldset className="detective-card">
                  <legend className="detective-card-legend">YOUR FORENSIC EVIDENCE ATTACHED (FROM LAB)</legend>
                  {pinnedRow ? (
                    <div
                      className="win95-sunken"
                      style={{
                        padding: '10px',
                        background: 'var(--w95-sunken-bg, #ffffff)',
                        maxHeight: '160px',
                        overflowY: 'auto',
                        fontSize: '12px',
                      }}
                    >
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <tbody>
                          {Object.entries(pinnedRow).map(([k, v]) => (
                            <tr key={k} style={{ borderBottom: '1px dotted rgba(128,128,128,0.25)' }}>
                              <td style={{ fontWeight: 'bold', width: '40%', padding: '3px 6px' }}>{k}:</td>
                              <td style={{ padding: '3px 6px', fontFamily: 'var(--w95-mono)' }}>{String(v)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div style={{ padding: '16px', textAlign: 'center' }}>
                      <div style={{ color: '#b71c1c', fontWeight: 'bold', marginBottom: '8px' }}>
                        No evidence record attached yet!
                      </div>
                      <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '12px' }}>
                        Go to the Investigation Room, run your query, and click <strong>[ 📌 Attach as Clue Evidence ]</strong> on the
                        incriminating record.
                      </div>
                      <button
                        className="win95-button"
                        onClick={() => setActiveTab('terminal')}
                        style={{ padding: '4px 14px', fontWeight: 'bold' }}
                      >
                        🔬 Open Investigation Room ➔
                      </button>
                    </div>
                  )}
                </fieldset>
              </div>

              {verificationFeedback && (
                <div
                  style={{
                    padding: '14px 18px',
                    border: '2px solid',
                    borderColor:
                      verificationFeedback.status === 'ADMITTED'
                        ? '#1b5e20'
                        : verificationFeedback.status === 'RED_HERRING'
                        ? '#b71c1c'
                        : '#f57f17',
                    background:
                      verificationFeedback.status === 'ADMITTED'
                        ? 'rgba(27, 94, 32, 0.12)'
                        : verificationFeedback.status === 'RED_HERRING'
                        ? 'rgba(183, 28, 28, 0.12)'
                        : 'rgba(245, 127, 23, 0.12)',
                    borderRadius: '2px',
                    boxShadow: '2px 2px 6px rgba(0,0,0,0.15)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{verificationFeedback.title}</span>
                    <span
                      className={
                        verificationFeedback.status === 'ADMITTED'
                          ? 'forensic-stamp-admitted'
                          : 'forensic-stamp-rejected'
                      }
                    >
                      {verificationFeedback.stampLabel}
                    </span>
                  </div>
                  <div style={{ marginTop: '8px', lineHeight: '1.5', fontSize: '13px' }}>
                    {verificationFeedback.message}
                  </div>
                </div>
              )}

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: 'auto',
                  paddingTop: '12px',
                  borderTop: '1px solid var(--w95-dark-gray)',
                }}
              >
                <button
                  className="win95-button"
                  onClick={() => setActiveTab('terminal')}
                  style={{ padding: '6px 14px' }}
                >
                  🔬 Return to Investigation Room
                </button>
                <button
                  className="clue-confront-btn"
                  onClick={handleVerifyVoucher}
                  disabled={!pinnedRow}
                >
                  ⚖️ CONFRONT SUSPECT WITH THIS EVIDENCE
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 6: High Court Grand Jury Prosecution Vault ────────────── */}
        {activeTab === 'courtroom' && (
          <div className="win95-split-content" style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
            <div className="court-vault-container">
              <div className="court-vault-header">
                <div className="court-vault-seal">
                  <div style={{ fontSize: '36px' }}>⚖️</div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>
                      HIGH COURT OF JUSTICIARY: CROWN PROSECUTION VAULT
                    </h2>
                    <div style={{ fontSize: '12px', opacity: 0.85, marginTop: '2px' }}>
                      Crown Office Prosecution Docket • Case #{dossier.caseNumber} • Lord Advocate's Special Inquiry
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className={`court-lock-badge ${readyForIndictment ? 'unlocked' : 'locked'}`}>
                    {readyForIndictment ? '🔓 3 OF 3 EXHIBITS UNSEALED' : `🔒 ${completedVoucherIds.length}/5 CLUES SOLVED`}
                  </span>
                </div>
              </div>

              <div className="court-vault-grid">
                <div className={`court-vault-card ${hasMotive ? 'unlocked' : 'locked'}`}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '13px' }}>EXHIBIT A: MOTIVE</span>
                      <span className={`court-lock-badge ${hasMotive ? 'unlocked' : 'locked'}`}>
                        {hasMotive ? '🔓 UNSEALED' : '🔒 LOCKED'}
                      </span>
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', margin: '10px 0 6px', color: hasMotive ? '#1b5e20' : '#b71c1c' }}>
                      {hasMotive ? '✓ Motive Substantiated' : '✗ Unverified Motive'}
                    </div>
                    <div style={{ fontSize: '12px', lineHeight: '1.5', opacity: 0.85 }}>
                      {activeCaseId === 'case_clyde_shipyard'
                        ? 'Intercepted foreign wiretap proving £1.8M black-market contract for stolen stealth frigate schematics.'
                        : 'Lord Archibald 1995 revised will completely disinheriting Julian Vance due to £120,000 Mayfair gambling debts.'}
                    </div>
                  </div>
                  <div style={{ marginTop: '12px', fontSize: '11px', opacity: 0.75, borderTop: '1px dotted rgba(128,128,128,0.3)', paddingTop: '6px' }}>
                    {activeCaseId === 'case_clyde_shipyard' ? 'Unlocked by Clue #5 (Foreign Wiretap)' : 'Unlocked by Clue #4 (Secret Will)'}
                  </div>
                </div>

                <div className={`court-vault-card ${hasMeans ? 'unlocked' : 'locked'}`}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '13px' }}>EXHIBIT B: MEANS</span>
                      <span className={`court-lock-badge ${hasMeans ? 'unlocked' : 'locked'}`}>
                        {hasMeans ? '🔓 UNSEALED' : '🔒 LOCKED'}
                      </span>
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', margin: '10px 0 6px', color: hasMeans ? '#1b5e20' : '#b71c1c' }}>
                      {hasMeans ? '✓ Lethal Weapon Traced' : '✗ Unverified Weapon'}
                    </div>
                    <div style={{ fontSize: '12px', lineHeight: '1.5', opacity: 0.85 }}>
                      {activeCaseId === 'case_clyde_shipyard'
                        ? 'Dockyard toxicology verifying lethal Cyanide crystals inside blueprint tube, matched to Requisition #303.'
                        : 'Coroner protocol confirming 4.85 mg/L Cyanide in port wine, matched to St. Jude Apothecary order #303.'}
                    </div>
                  </div>
                  <div style={{ marginTop: '12px', fontSize: '11px', opacity: 0.75, borderTop: '1px dotted rgba(128,128,128,0.3)', paddingTop: '6px' }}>
                    Unlocked by Clues #1 & #3 (Poison Forensics)
                  </div>
                </div>

                <div className={`court-vault-card ${hasOpportunity ? 'unlocked' : 'locked'}`}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '13px' }}>EXHIBIT C: OPPORTUNITY</span>
                      <span className={`court-lock-badge ${hasOpportunity ? 'unlocked' : 'locked'}`}>
                        {hasOpportunity ? '🔓 UNSEALED' : '🔒 LOCKED'}
                      </span>
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', margin: '10px 0 6px', color: hasOpportunity ? '#1b5e20' : '#b71c1c' }}>
                      {hasOpportunity ? '✓ Physical Access Proven' : '✗ Unverified Opportunity'}
                    </div>
                    <div style={{ fontSize: '12px', lineHeight: '1.5', opacity: 0.85 }}>
                      {activeCaseId === 'case_clyde_shipyard'
                        ? 'Turnstile logs proving 23:14 secret re-entry and 23:42 Vault 4 forced lock pick during the murder window.'
                        : 'Electronic keycard audit proving study entry at 21:44:12, completely breaking the claimed 21:15 train alibi.'}
                    </div>
                  </div>
                  <div style={{ marginTop: '12px', fontSize: '11px', opacity: 0.75, borderTop: '1px dotted rgba(128,128,128,0.3)', paddingTop: '6px' }}>
                    Unlocked by Clues #2 & #5 (Access & Opportunity)
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'center', margin: '12px 0' }}>
                <button
                  className="court-gavel-btn"
                  onClick={handleIndict}
                  disabled={!readyForIndictment || indictmentState === 'indicted'}
                >
                  {indictmentState === 'indicted' ? (
                    <>🔨 CAPITAL INDICTMENT HANDED DOWN BY HIGH COURT</>
                  ) : readyForIndictment ? (
                    <>🔨 DELIVER TRUE BILL OF INDICTMENT AGAINST {dossier.suspects[0].name.toUpperCase()}</>
                  ) : (
                    <>🔒 Solve All 5 Clues to Unseal Prosecution Vault ({completedVoucherIds.length}/5 Completed)</>
                  )}
                </button>
              </div>

              {indictmentState === 'indicted' && (
                <div className="court-newspaper-frontpage">
                  <div style={{ textAlign: 'center', borderBottom: '2px solid #000000', paddingBottom: '8px' }}>
                    <div style={{ fontSize: '28px', fontWeight: '900', letterSpacing: '2px', fontFamily: 'serif' }}>
                      {dossier.newspaperHeadline.paperName.toUpperCase()}
                    </div>
                    <div style={{ fontSize: '11px', marginTop: '3px', letterSpacing: '1px' }}>
                      {dossier.newspaperHeadline.date} • SPECIAL EXTRA EDITION • PRICE TWO PENCE
                    </div>
                  </div>

                  <div style={{ textAlign: 'center', margin: '18px 0 12px' }}>
                    <h1 style={{ fontSize: '24px', margin: 0, fontWeight: 'bold', fontFamily: 'serif' }}>
                      {dossier.newspaperHeadline.headline}
                    </h1>
                    <div style={{ fontSize: '14px', fontStyle: 'italic', marginTop: '6px' }}>
                      {dossier.newspaperHeadline.subheadline}
                    </div>
                  </div>

                  <p style={{ fontSize: '13px', lineHeight: '1.7', margin: '14px 0 0', fontFamily: 'serif' }}>
                    {dossier.newspaperHeadline.storySnippet}
                  </p>

                  <div
                    style={{
                      marginTop: '20px',
                      padding: '12px',
                      border: '2px solid #1b5e20',
                      background: 'rgba(27, 94, 32, 0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 'bold', color: '#1b5e20', fontSize: '14px' }}>
                        🏆 PROMOTED TO CHIEF FORENSICS MASTER
                      </div>
                      <div style={{ fontSize: '12px', opacity: 0.9 }}>
                        Congratulations Detective! You solved Case #{dossier.caseNumber} with {careerProgress.credibilityRating}% credibility rating!
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="win95-button"
                        onClick={handleExportReport}
                        style={{ padding: '6px 16px', fontWeight: 'bold' }}
                        title="Download official High Court indictment dossier"
                      >
                        📄 Download Dossier (.TXT)
                      </button>
                      <button
                        className="win95-button"
                        onClick={() => {
                          setCareerProgress((prev) => ({
                            ...prev,
                            completedVouchersByCase: { [dossier.id]: [] },
                            credibilityRating: 100,
                          }));
                          setPinnedRow(null);
                          setVerificationFeedback(null);
                          setIndictmentState('pending');
                        }}
                        style={{ padding: '6px 16px', fontWeight: 'bold' }}
                      >
                        🔄 Replay Case
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── 4. Bottom System Status Bar ─────────────────────────────────── */}
      <div className="win95-statusbar">
        <div className="win95-statusbar-field" style={{ flex: 1 }}>
          Case #{dossier.caseNumber} • {dossier.tables.length} SQLite Tables • VAX/VMS SQL Engine
        </div>
        <div className="win95-statusbar-field" style={{ width: '220px', textAlign: 'center' }}>
          {completedVoucherIds.length}/5 Clues Solved • Ready for Trial
        </div>
        <div className="win95-statusbar-field" style={{ width: '180px', textAlign: 'right' }}>
          Press [F5] to Run Query
        </div>
      </div>
    </div>
  );
};
