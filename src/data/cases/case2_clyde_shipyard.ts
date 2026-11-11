/**
 * case2_clyde_shipyard.ts — Homicide Bureau Case #1995-CR-1042: The Midnight Sabotage at Clyde Shipyard
 *
 * Setting: Clyde Naval Shipyards, Govan, Glasgow, Scotland (November 14, 1995)
 * Victim: Sir Douglas MacIntyre (61), Chief Naval Architect & Director of Admiralty Defense Projects
 * Crime: Found dead inside Drydock #4 High-Security Blueprints Vault
 */

import { CaseDossier } from './types';

export const CASE_2_DOSSIER: CaseDossier = {
  id: 'case_clyde_shipyard',
  caseNumber: '1995-CR-1042',
  title: 'The Midnight Sabotage at Clyde Naval Shipyard',
  subtitle: 'A Poisoned Admiralty Architect, Classified Frigate Blueprints, and Industrial Espionage',
  setting: 'Govan Naval Drydock #4 & Admiralty Design Bureau, River Clyde, Glasgow',
  dateOfIncident: 'November 14, 1995',
  difficulty: 'Senior',
  briefSummary:
    'Sir Douglas MacIntyre (61), Chief Naval Ballistics Architect overseeing the classified Type-23 Frigate Stealth Propulsor program, collapsed dead inside Drydock #4 Ballistics Vault at 23:42 during a gale over the River Clyde. The defense contractor claimed an accidental heart failure, but forensic swabs found lethal Potassium Cyanide vapor residues inside his locked blueprints storage tube. Four defense contractors, naval officers, and rival engineers were locked inside the shipyard perimeter.',
  victim: {
    name: 'Sir Douglas MacIntyre',
    age: 61,
    occupation: 'Director of Admiralty Naval Defense Design',
    causeOfDeath: 'Acute Potassium Cyanide Inhalation & Ingestion',
    locationFound: 'Admiralty Blueprints Vault, Drydock #4, Clyde Shipyards',
    timeOfDeathEstimate: '23:30 – 23:50 GMT (Pronounced dead 00:05)',
  },
  tables: [
    'dock_gate_logs',
    'chemical_stores',
    'telecom_dispatches',
    'personnel_roster',
    'blueprint_vault_logs',
    'shift_roster',
    'crane_telemetry',
    'dockyard_toxicology',
  ],
  seedSql: `
-- 1. Personnel Roster
CREATE TABLE personnel_roster (
  badge_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  security_clearance TEXT NOT NULL,
  company TEXT NOT NULL,
  alibi_claimed TEXT NOT NULL
);

INSERT INTO personnel_roster VALUES
('BADGE_DM_01', 'Sir Douglas MacIntyre', 'Chief Naval Architect', 'LEVEL_5_SECRET', 'Royal Admiralty Bureau', 'Victim - Found deceased at drafting table inside Vault 4'),
('BADGE_AC_02', 'Angus Calder', 'Senior Metallurgy Engineer', 'LEVEL_4_RESTRICTED', 'Calder Industrial Marine', 'Claims he was in Canteen 2 drinking Bovril from 23:00 to 00:15'),
('BADGE_FS_03', 'Fiona Sinclair', 'Propulsion Specialist', 'LEVEL_4_RESTRICTED', 'Clyde Marine Systems', 'Claims she was monitoring Drydock 4 water pumping gauges until 23:35'),
('BADGE_CV_04', 'Colin Vance', 'Defense Procurement Broker', 'LEVEL_3_CONFIDENTIAL', 'Vance & Sterling International', 'Claims he departed Clyde main gate in black saloon at 22:45 for Glasgow Central Station'),
('BADGE_VR_05', 'Viktor Ramos', 'Foreign Technical Attache', 'LEVEL_2_VISITOR', 'Trans-Baltic Shipping Corp', 'Claims he stayed inside Visitor Lounge B reviewing non-classified harbor charts'),
('BADGE_HW_06', 'Hamish Wallace', 'Drydock Security Officer', 'LEVEL_3_CONFIDENTIAL', 'Clyde Security Services', 'Stationed at Drydock 4 Gatehouse monitoring night access logs'),
('BADGE_GC_07', 'Gordon Campbell', 'Main Gate Watchman', 'LEVEL_2_VISITOR', 'Clyde Security Services', 'Logged vehicle traffic at Main South Gate until 02:00'),
('BADGE_DG_08', 'Donald Gibson', 'Engineering Gatekeeper', 'LEVEL_2_VISITOR', 'Clyde Security Services', 'On duty at North Office Gatehouse throughout evening shift'),
('BADGE_IR_09', 'Ian Ross', 'Master Crane Rigger', 'LEVEL_3_CONFIDENTIAL', 'Clyde Heavy Gantry Division', 'Operating automated gantry crane across Drydock 4 roof until 23:30'),
('BADGE_AL_10', 'Alistair Lamont', 'Chief Electrical Drafter', 'LEVEL_4_RESTRICTED', 'Admiralty Design Bureau', 'In Drawing Office B completing radar conduit schematics'),
('BADGE_CM_11', 'Calum MacFarlane', 'Hull Riveting Foreman', 'LEVEL_3_CONFIDENTIAL', 'Govan Shipwrights Guild', 'Supervising late-night hull plate fitting on Frigate Berth 2'),
('BADGE_SM_12', 'Sarah Murdoch', 'Admiralty Document Archivist', 'LEVEL_4_RESTRICTED', 'Royal Admiralty Bureau', 'Secured Vault 4 classification register before 22:00');

-- 2. Turnstile Gate Logs
CREATE TABLE dock_gate_logs (
  log_id INTEGER PRIMARY KEY,
  badge_id TEXT NOT NULL,
  gate_name TEXT NOT NULL,
  swipe_time TEXT NOT NULL,
  direction TEXT NOT NULL,
  guard_id TEXT NOT NULL
);

INSERT INTO dock_gate_logs VALUES
(2001, 'BADGE_DM_01', 'GATE_NORTH_OFFICE', '1995-11-14 19:30:10', 'IN', 'GUARD_GIBSON'),
(2002, 'BADGE_AC_02', 'GATE_NORTH_OFFICE', '1995-11-14 20:15:45', 'IN', 'GUARD_GIBSON'),
(2003, 'BADGE_FS_03', 'GATE_DRYDOCK_4', '1995-11-14 21:00:20', 'IN', 'GUARD_WALLACE'),
(2004, 'BADGE_CV_04', 'GATE_MAIN_SOUTH', '1995-11-14 21:30:00', 'IN', 'GUARD_CAMPBELL'),
(2005, 'BADGE_CV_04', 'GATE_MAIN_SOUTH', '1995-11-14 22:46:12', 'OUT', 'GUARD_CAMPBELL'),
(2006, 'BADGE_CV_04', 'GATE_CARGO_EAST', '1995-11-14 23:14:05', 'IN_RE_ENTRY', 'GUARD_NIGHT_AUTOMATED'),
(2007, 'BADGE_AC_02', 'GATE_DRYDOCK_4', '1995-11-14 23:25:30', 'IN', 'GUARD_WALLACE'),
(2008, 'BADGE_FS_03', 'GATE_DRYDOCK_4', '1995-11-14 23:38:10', 'OUT', 'GUARD_WALLACE'),
(2009, 'BADGE_CV_04', 'GATE_DRYDOCK_4', '1995-11-14 23:41:00', 'IN', 'GUARD_WALLACE'),
(2010, 'BADGE_CV_04', 'GATE_DRYDOCK_4', '1995-11-14 23:48:22', 'OUT', 'GUARD_WALLACE'),
(2011, 'BADGE_CM_11', 'GATE_MAIN_SOUTH', '1995-11-14 18:00:15', 'IN', 'GUARD_CAMPBELL'),
(2012, 'BADGE_IR_09', 'GATE_MAIN_SOUTH', '1995-11-14 18:15:20', 'IN', 'GUARD_CAMPBELL'),
(2013, 'BADGE_AL_10', 'GATE_NORTH_OFFICE', '1995-11-14 18:30:00', 'IN', 'GUARD_GIBSON'),
(2014, 'BADGE_SM_12', 'GATE_NORTH_OFFICE', '1995-11-14 18:45:10', 'IN', 'GUARD_GIBSON'),
(2015, 'BADGE_HW_06', 'GATE_DRYDOCK_4', '1995-11-14 19:45:00', 'IN', 'GUARD_WALLACE'),
(2016, 'BADGE_VR_05', 'GATE_MAIN_SOUTH', '1995-11-14 20:00:00', 'IN', 'GUARD_CAMPBELL'),
(2017, 'BADGE_CM_11', 'GATE_DRYDOCK_4', '1995-11-14 20:20:15', 'IN', 'GUARD_WALLACE'),
(2018, 'BADGE_IR_09', 'GATE_DRYDOCK_4', '1995-11-14 20:30:00', 'IN', 'GUARD_WALLACE'),
(2019, 'BADGE_DM_01', 'GATE_DRYDOCK_4', '1995-11-14 20:45:12', 'IN', 'GUARD_WALLACE'),
(2020, 'BADGE_SM_12', 'GATE_DRYDOCK_4', '1995-11-14 21:05:00', 'IN', 'GUARD_WALLACE'),
(2021, 'BADGE_SM_12', 'GATE_DRYDOCK_4', '1995-11-14 21:50:20', 'OUT', 'GUARD_WALLACE'),
(2022, 'BADGE_SM_12', 'GATE_NORTH_OFFICE', '1995-11-14 22:00:15', 'OUT', 'GUARD_GIBSON'),
(2023, 'BADGE_AL_10', 'GATE_DRYDOCK_4', '1995-11-14 22:05:30', 'IN', 'GUARD_WALLACE'),
(2024, 'BADGE_AL_10', 'GATE_DRYDOCK_4', '1995-11-14 22:30:00', 'OUT', 'GUARD_WALLACE'),
(2025, 'BADGE_CM_11', 'GATE_DRYDOCK_4', '1995-11-14 22:35:10', 'OUT', 'GUARD_WALLACE'),
(2026, 'BADGE_IR_09', 'GATE_DRYDOCK_4', '1995-11-14 22:40:00', 'OUT', 'GUARD_WALLACE'),
(2027, 'BADGE_VR_05', 'GATE_MAIN_SOUTH', '1995-11-14 22:45:00', 'OUT', 'GUARD_CAMPBELL'),
(2028, 'BADGE_IR_09', 'GATE_DRYDOCK_4', '1995-11-14 23:00:10', 'IN', 'GUARD_WALLACE'),
(2029, 'BADGE_CM_11', 'GATE_MAIN_SOUTH', '1995-11-14 23:10:00', 'OUT', 'GUARD_CAMPBELL'),
(2030, 'BADGE_IR_09', 'GATE_DRYDOCK_4', '1995-11-14 23:32:00', 'OUT', 'GUARD_WALLACE'),
(2031, 'BADGE_HW_06', 'GATE_DRYDOCK_4', '1995-11-14 23:55:00', 'OUT', 'GUARD_WALLACE'),
(2032, 'BADGE_DG_08', 'GATE_NORTH_OFFICE', '1995-11-15 00:05:00', 'OUT', 'GUARD_GIBSON'),
(2033, 'BADGE_HW_06', 'GATE_DRYDOCK_4', '1995-11-14 08:00:00', 'IN', 'GUARD_WALLACE'),
(2034, 'BADGE_HW_06', 'GATE_DRYDOCK_4', '1995-11-14 12:00:00', 'OUT', 'GUARD_WALLACE'),
(2035, 'BADGE_HW_06', 'GATE_DRYDOCK_4', '1995-11-14 13:00:00', 'IN', 'GUARD_WALLACE'),
(2036, 'BADGE_DM_01', 'GATE_NORTH_OFFICE', '1995-11-14 09:00:00', 'IN', 'GUARD_GIBSON'),
(2037, 'BADGE_DM_01', 'GATE_NORTH_OFFICE', '1995-11-14 12:30:00', 'OUT', 'GUARD_GIBSON'),
(2038, 'BADGE_DM_01', 'GATE_NORTH_OFFICE', '1995-11-14 14:00:00', 'IN', 'GUARD_GIBSON'),
(2039, 'BADGE_AC_02', 'GATE_NORTH_OFFICE', '1995-11-14 09:15:00', 'IN', 'GUARD_GIBSON'),
(2040, 'BADGE_AC_02', 'GATE_DRYDOCK_4', '1995-11-14 10:30:00', 'IN', 'GUARD_WALLACE'),
(2041, 'BADGE_AC_02', 'GATE_DRYDOCK_4', '1995-11-14 12:45:00', 'OUT', 'GUARD_WALLACE'),
(2042, 'BADGE_AC_02', 'GATE_DRYDOCK_4', '1995-11-14 14:15:00', 'IN', 'GUARD_WALLACE'),
(2043, 'BADGE_FS_03', 'GATE_DRYDOCK_4', '1995-11-14 09:30:00', 'IN', 'GUARD_WALLACE'),
(2044, 'BADGE_FS_03', 'GATE_DRYDOCK_4', '1995-11-14 12:15:00', 'OUT', 'GUARD_WALLACE'),
(2045, 'BADGE_FS_03', 'GATE_DRYDOCK_4', '1995-11-14 13:30:00', 'IN', 'GUARD_WALLACE'),
(2046, 'BADGE_CV_04', 'GATE_MAIN_SOUTH', '1995-11-14 11:00:00', 'IN', 'GUARD_CAMPBELL'),
(2047, 'BADGE_CV_04', 'GATE_MAIN_SOUTH', '1995-11-14 13:00:00', 'OUT', 'GUARD_CAMPBELL'),
(2048, 'BADGE_CV_04', 'GATE_MAIN_SOUTH', '1995-11-14 14:30:00', 'IN', 'GUARD_CAMPBELL'),
(2049, 'BADGE_CV_04', 'GATE_NORTH_OFFICE', '1995-11-14 16:30:00', 'OUT', 'GUARD_GIBSON'),
(2050, 'BADGE_VR_05', 'GATE_MAIN_SOUTH', '1995-11-14 10:00:00', 'IN', 'GUARD_CAMPBELL'),
(2051, 'BADGE_VR_05', 'GATE_MAIN_SOUTH', '1995-11-14 12:00:00', 'OUT', 'GUARD_CAMPBELL'),
(2052, 'BADGE_VR_05', 'GATE_MAIN_SOUTH', '1995-11-14 14:00:00', 'IN', 'GUARD_CAMPBELL'),
(2053, 'BADGE_VR_05', 'GATE_MAIN_SOUTH', '1995-11-14 17:00:00', 'OUT', 'GUARD_CAMPBELL'),
(2054, 'BADGE_IR_09', 'GATE_MAIN_SOUTH', '1995-11-14 08:30:00', 'IN', 'GUARD_CAMPBELL'),
(2055, 'BADGE_IR_09', 'GATE_MAIN_SOUTH', '1995-11-14 17:00:00', 'OUT', 'GUARD_CAMPBELL'),
(2056, 'BADGE_CM_11', 'GATE_MAIN_SOUTH', '1995-11-14 07:45:00', 'IN', 'GUARD_CAMPBELL'),
(2057, 'BADGE_CM_11', 'GATE_MAIN_SOUTH', '1995-11-14 16:30:00', 'OUT', 'GUARD_CAMPBELL'),
(2058, 'BADGE_AL_10', 'GATE_NORTH_OFFICE', '1995-11-14 08:45:00', 'IN', 'GUARD_GIBSON'),
(2059, 'BADGE_AL_10', 'GATE_NORTH_OFFICE', '1995-11-14 17:15:00', 'OUT', 'GUARD_GIBSON'),
(2060, 'BADGE_SM_12', 'GATE_NORTH_OFFICE', '1995-11-14 09:00:00', 'IN', 'GUARD_GIBSON'),
(2061, 'BADGE_SM_12', 'GATE_NORTH_OFFICE', '1995-11-14 17:00:00', 'OUT', 'GUARD_GIBSON'),
(2062, 'BADGE_GC_07', 'GATE_MAIN_SOUTH', '1995-11-14 06:00:00', 'IN', 'GUARD_NIGHT_AUTOMATED'),
(2063, 'BADGE_GC_07', 'GATE_MAIN_SOUTH', '1995-11-14 14:00:00', 'OUT', 'GUARD_CAMPBELL'),
(2064, 'BADGE_DG_08', 'GATE_NORTH_OFFICE', '1995-11-14 07:00:00', 'IN', 'GUARD_NIGHT_AUTOMATED'),
(2065, 'BADGE_DG_08', 'GATE_NORTH_OFFICE', '1995-11-14 15:00:00', 'OUT', 'GUARD_GIBSON'),
(2066, 'BADGE_HW_06', 'GATE_DRYDOCK_4', '1995-11-14 16:00:00', 'OUT', 'GUARD_WALLACE'),
(2067, 'BADGE_AC_02', 'GATE_NORTH_OFFICE', '1995-11-14 17:30:00', 'OUT', 'GUARD_GIBSON'),
(2068, 'BADGE_FS_03', 'GATE_DRYDOCK_4', '1995-11-14 17:45:00', 'OUT', 'GUARD_WALLACE'),
(2069, 'BADGE_DM_01', 'GATE_NORTH_OFFICE', '1995-11-14 18:00:00', 'OUT', 'GUARD_GIBSON');

-- 3. Chemical Stores Inventory
CREATE TABLE chemical_stores (
  requisition_id INTEGER PRIMARY KEY,
  chemical_name TEXT NOT NULL,
  requisition_date TEXT NOT NULL,
  requested_by TEXT NOT NULL,
  quantity_kg REAL NOT NULL,
  authorized_purpose TEXT NOT NULL,
  stored_location TEXT NOT NULL
);

INSERT INTO chemical_stores VALUES
(301, 'Nitric Acid 70%', '1995-11-10', 'Angus Calder', 25, 'Hull Plate Acid Etching', 'CHEM_STORE_A'),
(302, 'Trichloroethylene', '1995-11-12', 'Fiona Sinclair', 50, 'Turbine Degreasing', 'CHEM_STORE_B'),
(303, 'Potassium Cyanide Crystals', '1995-11-14', 'Colin Vance', 2.5, 'Propulsor Bearing Electroplating Test', 'CHEM_STORE_SPECIAL_VAULT'),
(304, 'Methyl Ethyl Ketone', '1995-11-13', 'Yard Painter Shift 2', 40, 'Anti-Fouling Hull Primer', 'CHEM_STORE_A'),
(305, 'Sodium Hydroxide Pellets', '1995-11-14', 'Boiler Maintenance', 10, 'Water Treatment Plant', 'CHEM_STORE_C'),
(306, 'Hydrochloric Acid 37%', '1995-11-08', 'Angus Calder', 30, 'Scale Rust Removal on Bulkhead 4', 'CHEM_STORE_A'),
(307, 'Sulfuric Acid Concentrated', '1995-11-09', 'Battery Maintenance Crew', 15, 'Lead-Acid Submarine Bank Overhaul', 'CHEM_STORE_C'),
(308, 'Acetone Industrial Solvent', '1995-11-11', 'Fiona Sinclair', 60, 'Fuel Injector Nozzle Cleansing', 'CHEM_STORE_B'),
(309, 'Marine Epoxy Resin Part A', '1995-11-12', 'Hull Composites Team', 120, 'Stealth Fin Fairing Lamination', 'CHEM_STORE_D'),
(310, 'Polyamine Hardener Part B', '1995-11-12', 'Hull Composites Team', 40, 'Stealth Fin Fairing Lamination', 'CHEM_STORE_D'),
(311, 'Zinc Phosphate Corrosion Inhibitor', '1995-11-10', 'Drydock Painting Shop', 80, 'Cathodic Hull Protection Coating', 'CHEM_STORE_A'),
(312, 'Toluene Industrial Thinner', '1995-11-13', 'Painting Foreman', 55, 'Polyurethane Coating Viscosity', 'CHEM_STORE_A'),
(313, 'Hydraulic Fluid ISO 46', '1995-11-14', 'Gantry Crane Maintenance', 200, 'Hydraulic Ram Fluid Replacement', 'CHEM_STORE_E'),
(314, 'Lithium Complex Grease EP2', '1995-11-14', 'Machinery Fitters', 45, 'Propeller Shaft Journal Lubrication', 'CHEM_STORE_E'),
(315, 'Liquid Nitrogen Dewar', '1995-11-13', 'Cryogenic Metallurgy Lab', 50, 'Shaft Sleeve Interference Shrink Fit', 'CHEM_STORE_SPECIAL_VAULT'),
(316, 'Argon Shielding Gas (Grade 5)', '1995-11-14', 'TIG Welding Bay 3', 80, 'Titanium Propulsor Blade Welding', 'GAS_DEPOT_NORTH'),
(317, 'Acetylene Fuel Gas', '1995-11-14', 'Oxy-Fuel Cutting Crew', 60, 'Plate Beveling for Keel Block 12', 'GAS_DEPOT_NORTH'),
(318, 'Silver Brazing Flux Powder', '1995-11-11', 'Pipefitting Division', 8, 'High-Pressure Steam Pipe Jointing', 'CHEM_STORE_B'),
(319, 'Ethylene Glycol Antifreeze', '1995-11-10', 'Diesel Generator Service', 150, 'Auxiliary Power Unit Winterizing', 'CHEM_STORE_C'),
(320, 'Sodium Hypochlorite 15%', '1995-11-09', 'Sanitation Services', 200, 'Bilge Water Disinfection System', 'CHEM_STORE_C'),
(321, 'Potassium Permanganate', '1995-11-07', 'Water Quality Control', 5, 'Cooling Loop Bio-fouling Treatment', 'CHEM_STORE_SPECIAL_VAULT'),
(322, 'Copper Antifouling Paste', '1995-11-12', 'Berth 2 Paint Crew', 75, 'Rudder Blade Coating Application', 'CHEM_STORE_A'),
(323, 'Fluorocarbon Refrigerant R-134a', '1995-11-13', 'HVAC Engineers', 30, 'Radar Equipment Chiller Recharging', 'CHEM_STORE_B'),
(324, 'Silicone Sealant High-Temp', '1995-11-14', 'Boiler Mount Team', 12, 'Exhaust Flange Gasket Sealing', 'CHEM_STORE_B'),
(325, 'Magnesium Anode Ingots', '1995-11-14', 'Sacrificial Metal Shop', 100, 'Ballast Tank Corrosion Prevention', 'CHEM_STORE_D');

-- 4. Blueprints Vault Access Logs
CREATE TABLE blueprint_vault_logs (
  access_id INTEGER PRIMARY KEY,
  vault_id TEXT NOT NULL,
  badge_id TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  drawer_accessed TEXT NOT NULL,
  action TEXT NOT NULL
);

INSERT INTO blueprint_vault_logs VALUES
(401, 'VAULT_DRYDOCK_4', 'BADGE_DM_01', '1995-11-14 22:10:00', 'DRAWER_PROPULSOR_SECRET', 'OPENED_WORK_IN_PROGRESS'),
(402, 'VAULT_DRYDOCK_4', 'BADGE_AC_02', '1995-11-14 22:30:15', 'DRAWER_METALLURGY', 'CHECKOUT_DOC_502'),
(403, 'VAULT_DRYDOCK_4', 'BADGE_CV_04', '1995-11-14 23:42:18', 'DRAWER_PROPULSOR_SECRET', 'UNAUTHORIZED_FORCED_LOCK'),
(404, 'VAULT_DRYDOCK_4', 'BADGE_FS_03', '1995-11-14 23:52:00', 'DRAWER_MAIN_DOOR', 'FOUND_VICTIM_EMERGENCY_ALARM'),
(405, 'VAULT_DRYDOCK_4', 'BADGE_SM_12', '1995-11-14 09:15:00', 'DRAWER_MAIN_REGISTER', 'DAILY_AUDIT_CHECKIN'),
(406, 'VAULT_DRYDOCK_4', 'BADGE_DM_01', '1995-11-14 10:00:22', 'DRAWER_PROPULSOR_SECRET', 'REVISION_REVIEW'),
(407, 'VAULT_DRYDOCK_4', 'BADGE_AL_10', '1995-11-14 11:30:00', 'DRAWER_ELECTRICAL', 'CHECKOUT_DOC_204'),
(408, 'VAULT_DRYDOCK_4', 'BADGE_AC_02', '1995-11-14 14:20:10', 'DRAWER_METALLURGY', 'CHECKIN_DOC_488'),
(409, 'VAULT_DRYDOCK_4', 'BADGE_FS_03', '1995-11-14 15:45:00', 'DRAWER_HYDRODYNAMICS', 'CHECKOUT_DOC_312'),
(410, 'VAULT_DRYDOCK_4', 'BADGE_DM_01', '1995-11-14 16:30:00', 'DRAWER_PROPULSOR_SECRET', 'LOCKBOX_DEPOSIT'),
(411, 'VAULT_DRYDOCK_4', 'BADGE_SM_12', '1995-11-14 17:00:00', 'DRAWER_MAIN_REGISTER', 'EVENING_VAULT_SEAL'),
(412, 'VAULT_DRYDOCK_4', 'BADGE_DM_01', '1995-11-14 21:00:00', 'DRAWER_MAIN_DOOR', 'OVERRIDE_NIGHT_SESSION'),
(413, 'VAULT_DRYDOCK_4', 'BADGE_AL_10', '1995-11-14 22:15:00', 'DRAWER_ELECTRICAL', 'RETURN_DOC_204'),
(414, 'VAULT_DRYDOCK_4', 'BADGE_FS_03', '1995-11-14 22:20:00', 'DRAWER_HYDRODYNAMICS', 'RETURN_DOC_312'),
(415, 'VAULT_DRYDOCK_4', 'BADGE_HW_06', '1995-11-14 23:00:00', 'DRAWER_MAIN_DOOR', 'ROUTINE_SECURITY_PEEP');

-- 5. Dockyard Toxicology & Forensic Swabs
CREATE TABLE dockyard_toxicology (
  sample_id INTEGER PRIMARY KEY,
  source TEXT NOT NULL,
  chemical_detected TEXT NOT NULL,
  concentration_ppm REAL NOT NULL,
  lethal_threshold_ppm REAL NOT NULL,
  finding TEXT NOT NULL
);

INSERT INTO dockyard_toxicology VALUES
(501, 'Victim Oral Cavity & Trachea', 'Potassium Cyanide Residue', 320, 50, 'FATAL_INGESTION_AND_VAPOR'),
(502, 'Blueprints Tube Seal (Frigate Type 23)', 'Potassium Cyanide Micro-crystals', 1450, 50, 'DELIBERATE_CONTAMINATION_OF_CAP_THREAD'),
(503, 'Victim Thermos Flask (Earl Grey Tea)', 'Potassium Cyanide', 480, 50, 'FATAL_POISON_IN_HOT_TEA'),
(504, 'Drydock 4 Basin Sump Water', 'Bilge Oil & Marine Diesel', 12, 100, 'NORMAL_HARBOR_RUNOFF'),
(505, 'Angus Calder Drafting Gloves', 'Nitric Acid Trace', 4, 500, 'INDUSTRIAL_METALLURGY_CONTACT'),
(506, 'Sir Douglas Blood Assay (Femoral)', 'Potassium Cyanide', 8.2, 1, 'LETHAL_CELLULAR_HYPOXIA'),
(507, 'Sir Douglas Gastric Contents', 'Potassium Cyanide', 210, 1, 'FATAL_POISONING_CONCENTRATION'),
(508, 'Sir Douglas Vitreous Humor', 'Potassium Cyanide', 3.4, 0.8, 'POST_MORTEM_CONFIRMATION'),
(509, 'Drafting Table Edge Swab', 'Potassium Cyanide Dust', 85, 50, 'CONTAMINATED_WORK_SURFACE'),
(510, 'Stainless Steel Blueprint Shears', 'Potassium Cyanide Trace', 22, 50, 'TOOL_SURFACE_CONTACT'),
(511, 'Visitor Lounge B Coffee Mug (Ramos)', 'Caffeine & Chicory', 180, 500, 'NORMAL_BEVERAGE'),
(512, 'Canteen 2 Bovril Mug (Calder)', 'Beef Extract & Salt', 0, 50, 'NEGATIVE_FOR_TOXINS'),
(513, 'Fiona Sinclair Pumping Coveralls', 'Marine Diesel Fuel', 15, 200, 'STANDARD_PUMP_RESIDUE'),
(514, 'Cargo East Gate Turnstile Bar Swab', 'Potassium Cyanide Trace', 1.8, 0.5, 'TRANSFER_DEPOSIT_FROM_GLOVES'),
(515, 'Colin Vance Black Saloon Steering Wheel', 'Potassium Cyanide Micro-residue', 4.5, 0.5, 'GLOVE_TRANSFER_DETECTED'),
(516, 'Drydock 4 Pumping Station Well', 'Industrial Silt & Zinc', 2, 50, 'ENVIRONMENTAL_SAFE'),
(517, 'Admiralty Vault 4 Keyhole Swab', 'Graphite Lock Lubricant', 0, 50, 'MECHANICAL_PICK_TRACES'),
(518, 'Sir Douglas Eyeglasses Frame', 'Potassium Cyanide Micro-vapor', 18, 5, 'AEROSOLIZED_EXPOSURE_ON_OPENING');

-- 6. Telecom Dispatches
CREATE TABLE telecom_dispatches (
  call_id INTEGER PRIMARY KEY,
  channel TEXT NOT NULL,
  caller TEXT NOT NULL,
  recipient TEXT NOT NULL,
  time_recorded TEXT NOT NULL,
  transcript_summary TEXT NOT NULL
);

INSERT INTO telecom_dispatches VALUES
(601, 'VHF Channel 16', 'Tugboat Flying Scotsman', 'Drydock 4 Control', '1995-11-14 22:15:00', 'Requesting tide clearance for HMS Montrose docking'),
(602, 'Internal Extension 402', 'Colin Vance', 'Sir Douglas MacIntyre', '1995-11-14 22:40:00', 'Demanding final review of stealth blueprints before overseas courier departs'),
(603, 'External Line 1', 'Payphone Clyde Gate', 'Foreign Embassy Consulate', '1995-11-14 23:50:30', 'Payment dispatch confirmed. Package retrieved from drydock tube.'),
(604, 'Emergency Line 999', 'Fiona Sinclair', 'Strathclyde Police Dispatch', '1995-11-14 23:53:10', 'Sir Douglas is not breathing inside Vault 4. Smells of bitter almonds.'),
(605, 'Internal Extension 101', 'Admiralty Security', 'Drydock 4 Gatehouse', '1995-11-14 19:00:00', 'Shift handover briefing for night security officer Wallace'),
(606, 'External Line 2', 'Clyde Marine Purchasing', 'Calder Industrial Marine', '1995-11-14 19:30:00', 'Invoice query regarding metallurgical test coupons'),
(607, 'VHF Channel 12', 'Harbor Master Govan', 'Tugboat Flying Scotsman', '1995-11-14 20:00:00', 'Weather report: Heavy fog descending over River Clyde navigation channel'),
(608, 'Internal Extension 205', 'Sir Douglas MacIntyre', 'Drawing Office B', '1995-11-14 20:30:00', 'Requesting final propulsor cavitation curve data sheets'),
(609, 'External Line 1', 'Foreign Technical Attache', 'Trans-Baltic Shipping', '1995-11-14 21:00:00', 'Visitor check-in call from shipyard lounge'),
(610, 'Internal Extension 301', 'Fiona Sinclair', 'Drydock 4 Pump Room', '1995-11-14 21:30:00', 'Water evacuation pump level telemetry verified at 12 feet'),
(611, 'External Line 3', 'Colin Vance', 'Vance & Sterling London', '1995-11-14 22:00:00', 'Overseas courier confirmation for midnight rendezvous in Glasgow'),
(612, 'Internal Extension 402', 'Colin Vance', 'Main South Gate', '1995-11-14 22:42:00', 'Inquiring if personal driver has arrived at south turning circle'),
(613, 'Emergency Line 999', 'Hamish Wallace', 'Glasgow Central Ambulance', '1995-11-14 23:55:00', 'Ambulance requested for cardiac emergency at Govan Drydock 4'),
(614, 'External Line 1', 'Strathclyde Police Homicide', 'Coroner Dr. Murdoch', '1995-11-15 00:10:00', 'Duty coroner dispatched to shipyard for chemical poisoning investigation');

-- 7. Shift Roster
CREATE TABLE shift_roster (
  shift_id INTEGER PRIMARY KEY,
  worker_name TEXT NOT NULL,
  role TEXT NOT NULL,
  location TEXT NOT NULL,
  shift_window TEXT NOT NULL
);

INSERT INTO shift_roster VALUES
(701, 'Hamish Wallace', 'Drydock Security Officer', 'Drydock 4 Gatehouse', '1995-11-14 20:00 - 04:00'),
(702, 'Gordon Campbell', 'Main Gate Watchman', 'Main South Gate', '1995-11-14 18:00 - 02:00'),
(703, 'Donald Gibson', 'Engineering Office Gate', 'North Office Gate', '1995-11-14 16:00 - 00:00'),
(704, 'Ian Ross', 'Gantry Crane Operator', 'Drydock 4 Gantry', '1995-11-14 18:00 - 02:00'),
(705, 'Calum MacFarlane', 'Shipwright Supervisor', 'Berth 2 Keel Blocks', '1995-11-14 16:00 - 00:00');

-- 8. Crane Telemetry (Automated Gantry)
CREATE TABLE crane_telemetry (
  op_id INTEGER PRIMARY KEY,
  crane_id TEXT NOT NULL,
  operator_id TEXT NOT NULL,
  bay_location TEXT NOT NULL,
  operation_time TEXT NOT NULL,
  load_weight_tons REAL NOT NULL
);

INSERT INTO crane_telemetry VALUES
(801, 'GANTRY_CRANE_01', 'OPERATOR_ROSS', 'BAY_HULL_PLATE_3', '1995-11-14 21:10:00', 14.5),
(802, 'GANTRY_CRANE_02', 'OPERATOR_ROSS', 'DRYDOCK_4_ROOF', '1995-11-14 23:30:00', 2.0),
(803, 'GANTRY_CRANE_01', 'OPERATOR_ROSS', 'BAY_PROPELLER_SHAFT', '1995-11-14 22:15:00', 8.2),
(804, 'GANTRY_CRANE_02', 'OPERATOR_ROSS', 'DRYDOCK_4_EQUIPMENT', '1995-11-14 23:45:00', 1.5);
`,
  suspects: [
    {
      id: 'colin_vance',
      name: 'Colin Vance',
      age: 48,
      relationship: 'Defense Procurement Broker',
      role: 'Private Defense Contractor',
      financialMotive:
        'Negotiated a £1.8M black-market contract with overseas foreign buyers for classified Type-23 Frigate stealth propulsor schematics.',
      swornStatement:
        'I left the Clyde Shipyard at 22:45 through the South Gate to catch the London Sleeper at Glasgow Central. I was nowhere near Drydock 4 when Sir Douglas collapsed.',
      declaredAlibiLocation: 'Departed Shipyard South Gate at 22:45 / Heading to Glasgow Central',
      declaredDepartureTime: '22:45',
      badgeNumber: 'CID-SUS-101',
      heartRateNormal: 72,
      heartRateStressed: 110,
      brokenAlibiAdmission:
        'I slipped back in through the automated Cargo East Gate at 23:14! Sir Douglas refused to hand over the secret blueprints, so I tainted his tea and blueprint tube with Potassium Cyanide!',
    },
    {
      id: 'angus_calder',
      name: 'Angus Calder',
      age: 55,
      relationship: 'Rival Metallurgy Engineer',
      role: 'Senior Metallurgist',
      financialMotive:
        'Bitterness over being passed over for the Director of Admiralty Design promotion in favor of Sir Douglas.',
      swornStatement:
        'I was in Canteen 2 drinking Bovril and reviewing weld test coupons from 23:00 to 00:15. I knew nothing of any poison in Drydock 4.',
      declaredAlibiLocation: 'Clyde Shipyard Canteen 2',
      badgeNumber: 'CID-SUS-102',
      heartRateNormal: 78,
      heartRateStressed: 95,
      brokenAlibiAdmission:
        'I disliked Sir Douglas, but I only used Nitric Acid for metal etching! I never touched Potassium Cyanide!',
    },
    {
      id: 'fiona_sinclair',
      name: 'Fiona Sinclair',
      age: 38,
      relationship: 'Propulsion Specialist',
      role: 'Naval Architect',
      financialMotive: 'Subordinate architect with clean record; called 999 immediately upon finding the victim.',
      swornStatement:
        'I was checking the drydock pump drainage valves until 23:35. At 23:52 I opened Vault 4 to deliver fuel specifications and found Sir Douglas motionless on the floor.',
      declaredAlibiLocation: 'Drydock 4 Pump Room',
      badgeNumber: 'CID-SUS-103',
      heartRateNormal: 68,
      heartRateStressed: 85,
      brokenAlibiAdmission:
        'I was the one who called police! I smelled bitter almonds immediately and warned officers not to inhale the fumes.',
    },
  ],
  evidenceDocs: [
    {
      id: 'doc_shipyard_autopsy',
      title: 'H.M. CORONER: Forensic Inhalation Protocol #COR-GLASGOW-95-1042',
      type: 'autopsy',
      dateStr: '15-NOV-1995 04:00 GMT',
      description: 'Official Glasgow High Court Pathology Report on Sir Douglas MacIntyre.',
      autopsyData: {
        protocolNumber: 'COR-GLASGOW-1995-1042',
        coronerName: 'Dr. Evelyn Murdoch, FRCPath',
        victimName: 'Sir Douglas MacIntyre',
        timeOfDeathEstimated: '23:40 GMT +/- 10 mins',
        deathWindowStart: '23:30',
        deathWindowEnd: '23:50',
        causeOfDeath: 'Acute Potassium Cyanide Intoxication & Hydrocyanic Vapor Inhalation',
        toxicologySummary: '320.0 ppm Cyanide in oral cavity, 480.0 ppm in tea thermos, 1450.0 ppm in blueprints tube seal.',
        pathologistNotes:
          'Intense bitter almond odor and cherry-red lividity. The victim inhaled high-concentration cyanide crystals dispersed into the threaded seal of the blueprint tube upon opening it.',
        traumaMarkers: [
          {
            id: 'marker_trachea',
            organ: 'Trachea & Pulmonary Alveoli',
            xPercent: 50,
            yPercent: 40,
            findingSummary: '320.0 ppm Cyanide inhalation residue.',
            associatedFilterHint: 'SELECT * FROM dockyard_toxicology WHERE sample_id = 501;',
          },
        ],
      },
    },
  ],
  deductionVouchers: [
    {
      id: 'voucher_clyde_1_poison',
      phaseNumber: 1,
      title: 'CLUE 1: Prove the Lethal Weapon at Clyde Drydock',
      hypothesisTarget: 'Query dockyard_toxicology to prove Sir Douglas died from Potassium Cyanide, not Nitric Acid.',
      targetSuspectId: 'angus_calder',
      contradictedClaimText: 'Angus Calder claims: "Sir Douglas must have suffered an accidental acid splash from hull welding!"',
      validateRow: (row) => {
        if (String(row.chemical_detected || '').toLowerCase().includes('cyanide')) {
          return {
            isSuccess: true,
            feedbackMessage:
              'ADMITTED — FORENSIC PROOF VERIFIED: High-concentration Potassium Cyanide was found in Sir Douglas oral cavity and thermos flask (320-480 ppm)! This disproves industrial acid fumes.',
          };
        }
        return {
          isSuccess: false,
          feedbackMessage: 'REJECTED: This record does not prove the lethal cyanide poisoning in Drydock 4.',
        };
      },
      successDeductionSummary: 'Coroner proves Sir Douglas was killed by Potassium Cyanide.',
      notebookObjective: 'Filter dockyard_toxicology for Cyanide.',
      crimeBoardLink: {
        fromNodeId: 'victim',
        toNodeId: 'weapon',
        yarnColor: '#ff0000',
        label: 'Cyanide Weapon',
      },
    },
    {
      id: 'voucher_clyde_2_gate_reentry',
      phaseNumber: 2,
      title: "CLUE 2: Break Colin Vance's 22:45 Departure Alibi",
      hypothesisTarget: 'Query dock_gate_logs to prove Colin Vance secretly re-entered the shipyard at 23:14.',
      targetSuspectId: 'colin_vance',
      contradictedClaimText: 'Colin Vance claims: "I left through the South Gate at 22:45 and never returned to the shipyard!"',
      validateRow: (row) => {
        if (
          String(row.badge_id || '').includes('BADGE_CV_04') &&
          String(row.gate_name || '').includes('CARGO_EAST') &&
          String(row.swipe_time || '').includes('23:14')
        ) {
          return {
            isSuccess: true,
            feedbackMessage:
              'ADMITTED — ALIBI SHATTERED: Schlage turnstile logs record BADGE_CV_04 (Colin Vance) secretly re-entering through the automated East Cargo Gate at 23:14:05!',
          };
        }
        return {
          isSuccess: false,
          feedbackMessage: 'REJECTED: This does not prove Colin Vance re-entered the shipyard at 23:14.',
        };
      },
      successDeductionSummary: "Turnstile log proves Colin Vance lied about leaving the shipyard at 22:45.",
      notebookObjective: 'Filter dock_gate_logs for Colin Vance after 23:00.',
      crimeBoardLink: {
        fromNodeId: 'colin_vance',
        toNodeId: 'drydock_4',
        yarnColor: '#00ff66',
        label: 'Secret Re-entry',
      },
    },
    {
      id: 'voucher_clyde_3_chemical_order',
      phaseNumber: 3,
      title: 'CLUE 3: Trace Who Checked Out the Potassium Cyanide Crystals',
      hypothesisTarget: 'Query chemical_stores to prove Colin Vance ordered 2.5 kg Potassium Cyanide.',
      targetSuspectId: 'colin_vance',
      contradictedClaimText: 'Colin Vance claims: "I never requisitioned any dangerous chemicals from dockyard stores!"',
      validateRow: (row) => {
        if (
          String(row.chemical_name || '').toLowerCase().includes('cyanide') &&
          String(row.requested_by || '').includes('Colin Vance')
        ) {
          return {
            isSuccess: true,
            feedbackMessage:
              'ADMITTED — CHEMICAL PAPER TRAIL PROVEN: Requisition #303 shows Colin Vance personally requisitioned 2.5 kg of Potassium Cyanide crystals on November 14 under false pretexts!',
          };
        }
        return {
          isSuccess: false,
          feedbackMessage: 'REJECTED: This requisition does not link Colin Vance to the cyanide.',
        };
      },
      successDeductionSummary: 'Chemical requisition connects Colin Vance to the murder weapon.',
      notebookObjective: 'Filter chemical_stores for Cyanide and Colin Vance.',
      crimeBoardLink: {
        fromNodeId: 'colin_vance',
        toNodeId: 'chemical_stores',
        yarnColor: '#ffb000',
        label: 'Cyanide Requisition',
      },
    },
    {
      id: 'voucher_clyde_4_vault_infiltration',
      phaseNumber: 4,
      title: 'CLUE 4: Catch Colin Vance Inside Vault 4 at 23:42',
      hypothesisTarget: 'Query blueprint_vault_logs to prove Colin Vance broke into the Propulsor drawer at 23:42.',
      targetSuspectId: 'colin_vance',
      contradictedClaimText: 'Colin Vance claims: "I never touched the classified Type-23 Frigate blueprints vault!"',
      validateRow: (row) => {
        if (
          String(row.badge_id || '').includes('BADGE_CV_04') &&
          String(row.timestamp || '').includes('23:42')
        ) {
          return {
            isSuccess: true,
            feedbackMessage:
              'ADMITTED — VAULT INFILTRATION PROVEN: Access Log #403 proves Colin Vance forced open the classified Type-23 Propulsor drawer inside Vault 4 at 23:42:18!',
          };
        }
        return {
          isSuccess: false,
          feedbackMessage: 'REJECTED: This log does not prove Colin Vance accessed the vault at 23:42.',
        };
      },
      successDeductionSummary: 'Vault logs prove Colin Vance broke into Vault 4 at 23:42.',
      notebookObjective: 'Filter blueprint_vault_logs for Colin Vance.',
      crimeBoardLink: {
        fromNodeId: 'colin_vance',
        toNodeId: 'blueprint_vault',
        yarnColor: '#1b5e20',
        label: 'Blueprints Heist',
      },
    },
    {
      id: 'voucher_clyde_5_consulate_wiretap',
      phaseNumber: 5,
      title: 'CLUE 5: Prove the Espionage Motive with Wiretap Records',
      hypothesisTarget: 'Query telecom_dispatches to expose Colin Vance calling the foreign consulate at 23:50.',
      targetSuspectId: 'colin_vance',
      contradictedClaimText: 'Colin Vance claims: "I have no foreign contacts and no financial incentive to steal military plans!"',
      validateRow: (row) => {
        if (
          String(row.caller || '').includes('Payphone') &&
          String(row.recipient || '').includes('Consulate')
        ) {
          return {
            isSuccess: true,
            feedbackMessage:
              'ADMITTED — INDUSTRIAL ESPIONAGE PROVEN: Dispatch #603 records the payphone call to the Foreign Consulate confirming package retrieval from the drydock tube for £1.8M!',
          };
        }
        return {
          isSuccess: false,
          feedbackMessage: 'REJECTED: This dispatch does not prove foreign espionage.',
        };
      },
      successDeductionSummary: 'Telecom wiretap confirms Colin Vance stole blueprints for £1.8M.',
      notebookObjective: 'Filter telecom_dispatches for Consulate.',
      crimeBoardLink: {
        fromNodeId: 'colin_vance',
        toNodeId: 'foreign_embassy',
        yarnColor: '#9c27b0',
        label: '£1.8M Treason',
      },
    },
  ],
  grandJuryExhibits: {
    exhibitA_Motive: {
      title: 'EXHIBIT A: £1.8M Industrial Espionage Wiretap',
      description: 'Telecom wiretap recording Colin Vance selling classified naval schematics to foreign consulate.',
      validateQuery: (rows) => rows.some((r) => String(r.recipient || '').includes('Consulate')),
      failFeedback: 'Motive unproven. Query telecom_dispatches to verify foreign espionage.',
    },
    exhibitB_Means: {
      title: 'EXHIBIT B: 2.5 kg Potassium Cyanide Crystals Requisition',
      description: 'Chemical store invoice proving Colin Vance requisitioned the lethal cyanide crystals.',
      validateQuery: (rows) => rows.some((r) => String(r.chemical_name || '').includes('Cyanide')),
      failFeedback: 'Means unproven. Query chemical_stores to trace the cyanide requisition.',
    },
    exhibitC_Opportunity: {
      title: 'EXHIBIT C: Secret East Cargo Gate Re-entry at 23:14',
      description: 'Turnstile access logs proving Colin Vance broke back into the shipyard and Drydock 4.',
      validateQuery: (rows) => rows.some((r) => String(r.badge_id || '').includes('BADGE_CV_04')),
      failFeedback: 'Opportunity unproven. Query dock_gate_logs for Colin Vance.',
    },
  },
  newspaperHeadline: {
    paperName: 'The Glasgow Herald & Daily Mail',
    date: 'Wednesday, November 15, 1995',
    headline: 'DEFENSE BROKER INDICTED IN CLYDE SHIPYARD CYANIDE SABOTAGE',
    subheadline: 'Crown Office & Admiralty Charge Colin Vance with Capital Treason and Homicide',
    storySnippet:
      'Following an all-night digital audit of electronic turnstiles, chemical logs, and telephone dispatches by Highland Regional Constabulary forensic investigators, the High Court of Justiciary at Glasgow has returned a unanimous true bill of indictment against defense broker Colin Vance. Forensic specialists proved Vance secretly re-entered Drydock 4 to contaminate Sir Douglas MacIntyre blueprint tube with lethal Potassium Cyanide in a £1.8M industrial espionage conspiracy.',
  },
};

