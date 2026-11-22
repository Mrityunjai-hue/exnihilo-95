/**
 * case3_wallstreet_phantom.ts — Homicide Bureau Case #1995-CR-1104: The Wall Street Phantom
 *
 * Setting: Vanguard Securities Executive Suite & Trading Floor, 120 Wall Street, Manhattan, NY (October 24, 1995)
 * Victim: Marcus Vance (48), Managing Director of Global Arbitrage
 * Crime: Found poisoned in 44th floor private boardroom during midnight market prep
 */

import { CaseDossier } from './types';

export const CASE_3_DOSSIER: CaseDossier = {
  id: 'case_wallstreet_phantom',
  caseNumber: '1995-CR-1104',
  title: 'The Wall Street Phantom',
  subtitle: 'A Poisoned Arbitrage Titan, $42M in Offshore Cayman Wires, and Insider Shorting',
  setting: '120 Wall Street, 44th Floor Executive Suite & Trading Floor, Manhattan, New York',
  dateOfIncident: 'October 24, 1995',
  difficulty: 'Chief',
  briefSummary:
    'Marcus Vance (48), Managing Director of Global Arbitrage at Vanguard Securities, collapsed dead inside his private corner suite at 22:30. The brokerage firm initially claimed heart failure due to high stress, but toxicological analysis revealed lethal digitalis injection disguised in his Glenfiddich scotch. A $42,000,000 unauthorized wire transfer cleared to the Cayman Islands minutes before his death.',
  victim: {
    name: 'Marcus Vance',
    age: 48,
    occupation: 'Managing Director, Global Arbitrage Desk',
    causeOfDeath: 'Acute Cardiac Arrhythmia induced by Lethal Digitalis Glycoside',
    locationFound: '44th Floor Corner Office, 120 Wall Street, Manhattan',
    timeOfDeathEstimate: '21:40 – 22:15 EST (Discovered 22:35)',
  },
  tables: [
    'trades',
    'keycard_access',
    'wire_transfers',
    'phone_logs',
    'suspects_records',
  ],
  seedSql: `
-- 1. Suspects Directory
CREATE TABLE suspects_records (
  badge_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  desk TEXT NOT NULL,
  declared_alibi TEXT NOT NULL,
  financial_motive TEXT NOT NULL
);

INSERT INTO suspects_records VALUES
  ('BADGE_EC_01', 'Evelyn Cross', 'Lead Quantitative Trader', 'Statistical Arbitrage', 'Coding Monte Carlo simulation algorithms in Quant Lab B until midnight', 'Facing $4M personal margin call after rogue currency options position collapsed'),
  ('BADGE_GV_02', 'Gregory Vance', 'Junior Broker & Nephew', 'Emerging Equities', 'Drinking with foreign clients at Harry''s Bar on Hanover Square from 20:30 to 23:00', 'Disinherited from $60M family trust after Marcus uncovered his illicit offshore shell company'),
  ('BADGE_VK_03', 'Victor Kane', 'Chief Compliance Officer', 'Regulatory Surveillance', 'Reviewing SEC Form 13F quarterly filings from his residential study in Greenwich, CT', 'Marcus discovered Kane was accepting $250k quarterly payoffs to ignore illegal front-running'),
  ('BADGE_CD_04', 'Clara Delgado', 'Senior Database Administrator', 'Infrastructure Operations', 'Running tape backup and index rebuild routines in Sub-Basement Data Vault from 21:00 to 01:00', 'Marcus threatened to fire her after an unauthorized terminal query logged into the Cayman accounts');

-- 2. Building Keycard Access Logs
CREATE TABLE keycard_access (
  log_id INTEGER PRIMARY KEY,
  badge_id TEXT NOT NULL,
  employee_name TEXT NOT NULL,
  door_location TEXT NOT NULL,
  access_time TEXT NOT NULL,
  authorized INTEGER NOT NULL
);

INSERT INTO keycard_access VALUES
  (101, 'BADGE_EC_01', 'Evelyn Cross', 'Quant Lab B - Entry', '20:15:00', 1),
  (102, 'BADGE_CD_04', 'Clara Delgado', 'Sub-Basement Server Vault', '20:55:00', 1),
  (103, 'BADGE_MV_00', 'Marcus Vance', '44th Floor Executive Suite', '21:05:00', 1),
  (104, 'BADGE_GV_02', 'Gregory Vance', '120 Wall St - Lobby Turnstile', '21:38:00', 1),
  (105, 'BADGE_GV_02', 'Gregory Vance', '44th Floor Executive Stairwell', '21:46:00', 1),
  (106, 'BADGE_GV_02', 'Gregory Vance', '44th Floor Executive Suite', '21:48:00', 1),
  (107, 'BADGE_GV_02', 'Gregory Vance', '120 Wall St - Fire Exit Alley', '22:04:00', 1),
  (108, 'BADGE_EC_01', 'Evelyn Cross', 'Quant Lab B - Exit', '23:45:00', 1),
  (109, 'BADGE_CD_04', 'Clara Delgado', 'Sub-Basement Server Vault', '01:10:00', 1);

-- 3. High-Value Wire Transfers
CREATE TABLE wire_transfers (
  transfer_id TEXT PRIMARY KEY,
  origin_account TEXT NOT NULL,
  destination_bank TEXT NOT NULL,
  destination_country TEXT NOT NULL,
  amount_usd NUMERIC NOT NULL,
  timestamp TEXT NOT NULL,
  authorized_by TEXT NOT NULL
);

INSERT INTO wire_transfers VALUES
  ('WT-95-8801', 'ACCT_VANGUARD_SETTLE', 'Federal Reserve Bank of NY', 'USA', 15000000.00, '16:30:00', 'Marcus Vance'),
  ('WT-95-8802', 'ACCT_CORP_TREASURY', 'Bank of England - London', 'UK', 8500000.00, '17:15:00', 'Marcus Vance'),
  ('WT-95-8803', 'ACCT_CLIENT_ESCROW', 'Credit Suisse - Zurich', 'Switzerland', 2400000.00, '18:00:00', 'Victor Kane'),
  ('WT-95-8804', 'ACCT_SPECIAL_RESERVE', 'Grand Cayman Offshore Commerce Bank', 'Cayman Islands', 42000000.00, '21:52:00', 'G. Vance (Forged MV Signature)');

-- 4. Floor Telephone & Dispatch Logs
CREATE TABLE phone_logs (
  call_id INTEGER PRIMARY KEY,
  caller TEXT NOT NULL,
  destination_number TEXT NOT NULL,
  recipient_name TEXT NOT NULL,
  duration_sec INTEGER NOT NULL,
  call_time TEXT NOT NULL,
  notes TEXT NOT NULL
);

INSERT INTO phone_logs VALUES
  (301, 'Extension 4401 (Marcus Vance)', '212-555-0199', 'Wall Street Journal Desk', 420, '18:45:00', 'Marcus threatening whistleblower scoop on embezzlement'),
  (302, 'Extension 2205 (Evelyn Cross)', '212-555-8821', 'Chicago Mercantile Broker', 180, '19:15:00', 'Asking for emergency margin extension'),
  (303, 'Payphone (Harry''s Bar Hanover Sq)', '011-345-949-0021', 'Cayman Trust Officer Pierre Dubois', 240, '21:12:00', 'Caller asking if Wire WT-95-8804 routing code was confirmed'),
  (304, 'Extension 4401 (Marcus Vance)', '911', 'Emergency Services Operator', 18, '22:08:00', 'Gasping noises, chest clutching sounds before line dropped');

-- 5. Trading Desk Blots
CREATE TABLE trades (
  trade_id TEXT PRIMARY KEY,
  trader_badge TEXT NOT NULL,
  symbol TEXT NOT NULL,
  side TEXT NOT NULL,
  shares INTEGER NOT NULL,
  price NUMERIC NOT NULL,
  execution_time TEXT NOT NULL
);

INSERT INTO trades VALUES
  ('TR-95-401', 'BADGE_EC_01', 'IBM', 'BUY', 50000, 94.25, '15:45:00'),
  ('TR-95-402', 'BADGE_GV_02', 'MEDTECH', 'SHORT', 200000, 48.50, '15:58:00'),
  ('TR-95-403', 'BADGE_VK_03', 'GE', 'BUY', 10000, 62.00, '15:59:00'),
  ('TR-95-404', 'BADGE_GV_02', 'MEDTECH', 'SHORT', 300000, 48.25, '16:00:00');
`,
  suspects: [
    {
      id: 'gregory_vance',
      name: 'Gregory Vance',
      alias: 'The Prodigal Nephew',
      age: 29,
      relationship: 'Nephew & Junior Emerging Equities Broker',
      role: 'Heir & Rogue Trader',
      financialMotive:
        'Disinherited by Marcus after embezzling company funds into Cayman shell accounts. Needed Marcus dead before Monday morning audit.',
      swornStatement:
        'I swear on my mother’s grave I never left Harry’s Bar on Hanover Square between 8:30 PM and 11 PM! Ask any bartender!',
      declaredAlibiLocation: "Harry's Bar, Hanover Square",
      heartRateNormal: 72,
      heartRateStressed: 138,
      brokenAlibiAdmission:
        'Alright! Marcus was going to report me to the SEC! I used my keycard to enter his suite at 21:48, spiked his scotch with Digitalis drops, and authorized the $42M transfer to the Caymans!',
    },
    {
      id: 'evelyn_cross',
      name: 'Evelyn Cross',
      alias: 'The Quant Queen',
      age: 34,
      relationship: 'Lead Quantitative Strategist',
      role: 'Statistical Arbitrage Trader',
      financialMotive:
        'Facing massive margin liquidation on unauthorized currency derivative bets.',
      swornStatement:
        'I was locked in Quant Lab B all evening optimizing our algorithmic volatility models. The electronic keycard logs will prove I never went up to the 44th floor.',
      declaredAlibiLocation: 'Quant Lab B, 22nd Floor',
      heartRateNormal: 68,
      heartRateStressed: 88,
      brokenAlibiAdmission:
        'I lost money in derivatives, yes, but I am a mathematician, not an assassin!',
    },
    {
      id: 'victor_kane',
      name: 'Victor Kane',
      alias: 'The Compliance Shadow',
      age: 52,
      relationship: 'Chief Compliance Officer',
      role: 'Internal Regulatory Surveillance',
      financialMotive:
        'Marcus discovered Kane was taking secret kickbacks to overlook illegal insider trading rings.',
      swornStatement:
        'I caught the 19:42 commuter express to Greenwich and was having dinner with my family all evening.',
      declaredAlibiLocation: 'Residential Residence, Greenwich, CT',
      heartRateNormal: 75,
      heartRateStressed: 92,
      brokenAlibiAdmission:
        'I may have turned a blind eye to questionable trades, but I was in Greenwich having dinner with my wife.',
    },
    {
      id: 'clara_delgado',
      name: 'Clara Delgado',
      alias: 'The Sysadmin',
      age: 38,
      relationship: 'Senior Database Administrator',
      role: 'Core Systems Architect',
      financialMotive:
        'Furious at Marcus for threatening her career over routine maintenance queries.',
      swornStatement:
        'I spent the night in the Sub-Basement server room conducting tape backups and index maintenance.',
      declaredAlibiLocation: 'Sub-Basement Server Vault',
      heartRateNormal: 65,
      heartRateStressed: 82,
      brokenAlibiAdmission:
        'I noticed the Cayman transfer at 21:55 from the system logs, but I was terrified of being blamed!',
    },
  ],
  evidenceDocs: [
    {
      id: 'evidence_autopsy_vance',
      title: 'Autopsy Protocol #95-H-1104 (Office of Chief Medical Examiner)',
      type: 'autopsy',
      dateStr: 'October 25, 1995',
      description:
        'Toxicology report confirms acute cardiac failure caused by digitalis glycoside poisoning in Marcus Vance.',
      rawText:
        'CORONER PROTOCOL: Marcus Vance (48). Found unresponsive in 44th floor suite. Blood serum digitalis concentration: 18.4 ng/mL (lethal threshold: >2.0 ng/mL). Chemical residue matches prescription digitalis drops administered orally in beverage.',
    },
    {
      id: 'evidence_wire_transfer_slip',
      title: 'Vanguard Treasury Dispatch: $42,000,000 Offshore Wire Record',
      type: 'greenbar_dispatch',
      dateStr: 'October 24, 1995 21:52 EST',
      description:
        'Greenbar printout showing wire transfer WT-95-8804 transmitting $42M to Grand Cayman Offshore Commerce Bank.',
      rawText:
        'DISPATCH WT-95-8804: ORIGIN: ACCT_SPECIAL_RESERVE -> DEST: GRAND CAYMAN OFFSHORE COMMERCE BANK. AMOUNT: $42,000,000.00 USD. SIGNATURE: FORGED MARCUS VANCE.',
    },
    {
      id: 'evidence_bar_phone_slip',
      title: 'Telephone Carrier Wiretap: Hanover Square Payphone Log',
      type: 'wiretap',
      dateStr: 'October 24, 1995 21:12 EST',
      description:
        'Carrier dispatch record proving Gregory Vance phoned Cayman trust officer Pierre Dubois from Harry’s Bar right before heading to the office.',
      rawText:
        'CALL 303: PAYPHONE HANOVER SQ TO CAYMAN TRUST OFFICER PIERRE DUBOIS: "Routing code confirmed. The $42M wire will be released before midnight."',
    },
    {
      id: 'evidence_medtech_short_ticket',
      title: 'Trading Blotter: 500,000 Share Massive Insider Short on MEDTECH',
      type: 'till_tape',
      dateStr: 'October 24, 1995 16:00 EST',
      description:
        'Order ticket showing Gregory Vance shorting 500k shares of MedTech immediately before company announced FDA rejection.',
      rawText:
        'ORDER BLOTTER: BADGE_GV_02 SOLD SHORT 500,000 SHARES MEDTECH AT $48.35. ESTIMATED PROFIT: $14,200,000.',
    },
  ],
  deductionVouchers: [
    {
      id: 'voucher_wallstreet_1_keycard_alibi',
      phaseNumber: 1,
      title: 'CLUE 1: Shatter Gregory Vance’s Hanover Square Bar Alibi',
      hypothesisTarget:
        'Query keycard_access to prove Gregory Vance entered the 44th floor suite during the murder window.',
      targetSuspectId: 'gregory_vance',
      contradictedClaimText:
        'Gregory Vance claims: "I never set foot inside 120 Wall Street all evening! I was drinking at Harry’s Bar on Hanover Square!"',
      validateRow: (row) => {
        if (
          String(row.badge_id || '').includes('BADGE_GV_02') &&
          String(row.door_location || '').includes('44th Floor')
        ) {
          return {
            isSuccess: true,
            feedbackMessage:
              'ADMITTED — ALIBI SHATTERED: Keycard log #106 records Gregory Vance swiping into the 44th Floor Executive Suite at 21:48:00 EST, right inside the estimated murder window!',
          };
        }
        return {
          isSuccess: false,
          feedbackMessage: 'REJECTED: This access row does not contradict Gregory Vance’s alibi.',
        };
      },
      successDeductionSummary:
        'Turnstile access confirms Gregory Vance was inside Marcus Vance’s suite at 21:48.',
      notebookObjective: 'Filter keycard_access for BADGE_GV_02.',
      crimeBoardLink: {
        fromNodeId: 'gregory_vance',
        toNodeId: 'executive_suite',
        yarnColor: '#f44336',
        label: 'Swipe at 21:48',
      },
    },
    {
      id: 'voucher_wallstreet_2_cayman_wire',
      phaseNumber: 2,
      title: 'CLUE 2: Uncover the $42,000,000 Cayman Offshore Embezzlement',
      hypothesisTarget:
        'Query wire_transfers to expose the fraudulent $42M transfer to Grand Cayman Offshore Commerce Bank.',
      targetSuspectId: 'gregory_vance',
      contradictedClaimText:
        'Gregory Vance claims: "Marcus handled all firm wires. I had nothing to do with any offshore bank transfers!"',
      validateRow: (row) => {
        if (
          Number(row.amount_usd) === 42000000 ||
          String(row.destination_country || '').includes('Cayman')
        ) {
          return {
            isSuccess: true,
            feedbackMessage:
              'ADMITTED — $42M EMBEZZLEMENT EXPOSED: Transfer WT-95-8804 shows $42M sent to Grand Cayman with forged credentials at 21:52:00, four minutes after Gregory entered the room!',
          };
        }
        return {
          isSuccess: false,
          feedbackMessage: 'REJECTED: This wire transfer is not the fraudulent Cayman embezzlement.',
        };
      },
      successDeductionSummary:
        'Wire transfer WT-95-8804 proves $42M was sent to Cayman Islands at 21:52.',
      notebookObjective: 'Query wire_transfers for Cayman Islands.',
      crimeBoardLink: {
        fromNodeId: 'gregory_vance',
        toNodeId: 'cayman_bank',
        yarnColor: '#ff9800',
        label: '$42M Stolen',
      },
    },
    {
      id: 'voucher_wallstreet_3_payphone_conspiracy',
      phaseNumber: 3,
      title: 'CLUE 3: Trace the Hanover Square Payphone Call to Cayman Trust',
      hypothesisTarget:
        'Query phone_logs to connect the Hanover Square payphone call to Cayman Trust Officer Pierre Dubois.',
      targetSuspectId: 'gregory_vance',
      contradictedClaimText:
        'Gregory Vance claims: "I never spoke to anyone in the Caribbean about wire routing codes!"',
      validateRow: (row) => {
        if (
          String(row.caller || '').includes('Payphone') &&
          String(row.notes || '').includes('Cayman')
        ) {
          return {
            isSuccess: true,
            feedbackMessage:
              'ADMITTED — OFFSHORE CONSPIRACY CONFIRMED: Call #303 from the Harry’s Bar payphone shows Gregory verifying the $42M routing code with Pierre Dubois at 21:12 EST!',
          };
        }
        return {
          isSuccess: false,
          feedbackMessage: 'REJECTED: This call record does not prove offshore conspiracy.',
        };
      },
      successDeductionSummary:
        'Phone log proves Gregory Vance coordinated the Cayman transfer from Hanover Square.',
      notebookObjective: 'Query phone_logs for Payphone.',
      crimeBoardLink: {
        fromNodeId: 'gregory_vance',
        toNodeId: 'pierre_dubois',
        yarnColor: '#2196f3',
        label: 'Cayman Call',
      },
    },
    {
      id: 'voucher_wallstreet_4_medtech_short',
      phaseNumber: 4,
      title: 'CLUE 4: Expose Gregory’s $14.2M Illegal MedTech Insider Short',
      hypothesisTarget:
        'Query trades to uncover Gregory Vance’s 500,000 share aggressive short position on MedTech.',
      targetSuspectId: 'gregory_vance',
      contradictedClaimText:
        'Gregory Vance claims: "I never traded MedTech options or shares ahead of any FDA disclosures!"',
      validateRow: (row) => {
        if (
          String(row.trader_badge || '').includes('BADGE_GV_02') &&
          String(row.symbol || '').toUpperCase() === 'MEDTECH'
        ) {
          return {
            isSuccess: true,
            feedbackMessage:
              'ADMITTED — INSIDER TRADING PROVEN: Trade logs show Gregory Vance sold short 500,000 shares of MedTech at the closing bell for an illegal profit of over $14.2 Million!',
          };
        }
        return {
          isSuccess: false,
          feedbackMessage: 'REJECTED: This trade record is not the insider short.',
        };
      },
      successDeductionSummary:
        'Trading desk blotter proves Gregory Vance executed massive insider shorts on MedTech.',
      notebookObjective: 'Query trades for MEDTECH and BADGE_GV_02.',
      crimeBoardLink: {
        fromNodeId: 'gregory_vance',
        toNodeId: 'sec_indictment',
        yarnColor: '#9c27b0',
        label: '$14.2M Fraud',
      },
    },
  ],
  grandJuryExhibits: {
    exhibitA_Motive: {
      title: 'EXHIBIT A: $42,000,000 Cayman Offshore Embezzlement Wire',
      description: 'Treasury dispatch proving $42M was sent to Cayman Islands with forged signature.',
      validateQuery: (rows) => rows.some((r) => Number(r.amount_usd) === 42000000 || String(r.destination_country || '').includes('Cayman')),
      failFeedback: 'Motive unproven. Query wire_transfers to expose the $42M Cayman transfer.',
    },
    exhibitB_Means: {
      title: 'EXHIBIT B: Forensic Digitalis Poisoning Analysis',
      description: 'Autopsy protocol proving lethal digitalis poison was administered in victim’s scotch.',
      validateQuery: (rows) => rows.some((r) => String(r.declared_alibi || r.financial_motive || '').length > 0),
      failFeedback: 'Means unproven. Review forensic documents and suspects.',
    },
    exhibitC_Opportunity: {
      title: 'EXHIBIT C: 44th Floor Suite Keycard Access at 21:48',
      description: 'Keycard access entry proving Gregory Vance entered the victim suite during the murder window.',
      validateQuery: (rows) => rows.some((r) => String(r.badge_id || '').includes('BADGE_GV_02') && String(r.door_location || '').includes('44th')),
      failFeedback: 'Opportunity unproven. Query keycard_access for BADGE_GV_02.',
    },
  },
  newspaperHeadline: {
    paperName: 'The Wall Street Journal & New York Post',
    date: 'Wednesday, October 25, 1995',
    headline: 'WALL STREET HEIR INDICTED IN $42M ARBITRAGE POISONING CONSPIRACY',
    subheadline: 'Manhattan District Attorney & SEC Arrest Gregory Vance for Homicide and Grand Larceny',
    storySnippet:
      'Following a midnight audit of electronic keycard records, financial dispatch wires, and floor trade blotters by Manhattan District Attorney forensic investigators, a grand jury returned an indictment charging junior broker Gregory Vance with first-degree murder and grand larceny in the death of Managing Director Marcus Vance. Investigators proved Gregory poisoned his uncle’s scotch with digitalis drops to conceal an illicit $42,000,000 Cayman Islands wire transfer.',
  },
};
