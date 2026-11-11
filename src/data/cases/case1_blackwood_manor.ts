/**
 * case1_blackwood_manor.ts — Case File 1995-CR-0842
 * "The Midnight Cyanide at Blackwood Manor"
 * 
 * Authentic 1995 Scottish Highlands Homicide Investigation:
 * - 8 Relational Tables (guests, staff_shifts, manor_rooms, keycard_logs, phone_calls, toxicology_records, apothecary_orders, estate_wills)
 * - 6 Suspect Profiles with 1990s AFIS 128x128 Floyd-Steinberg dithered pixel-art SVG mugshots
 * - Form 42-A Autopsy Protocol with interactive anatomical trauma markers
 * - 5 Deduction Voucher Rules (FORM 95-VERIFY manual confirmation requirements)
 * - Anti-Red-Herring protection (eliminating Chef Gordon's scullery rat arsenic)
 */

import { CaseDossier } from './types';

// ============================================================================
// Case 1 Seed SQL: 8 Relational Tables (~420 rows of realistic 1995 data)
// ============================================================================

export const CASE_1_SEED_SQL = `
-- Drop existing tables
DROP TABLE IF EXISTS toxicology_records;
DROP TABLE IF EXISTS apothecary_orders;
DROP TABLE IF EXISTS keycard_logs;
DROP TABLE IF EXISTS phone_calls;
DROP TABLE IF EXISTS estate_wills;
DROP TABLE IF EXISTS staff_shifts;
DROP TABLE IF EXISTS guests;
DROP TABLE IF EXISTS manor_rooms;

-- 1. Manor Rooms (Architectural layout of Blackwood Manor)
CREATE TABLE manor_rooms (
  room_id TEXT PRIMARY KEY,
  wing TEXT NOT NULL,
  floor INTEGER NOT NULL,
  room_name TEXT NOT NULL,
  has_electronic_lock INTEGER NOT NULL,
  phone_extension TEXT
);

INSERT INTO manor_rooms VALUES
('STUDY_E201', 'East Wing', 2, 'Lord Archibald Private Study', 1, 'EXT-101'),
('MASTER_E202', 'East Wing', 2, 'Master Bedroom Suite', 1, 'EXT-102'),
('LIB_E101', 'East Wing', 1, 'Grand Library & Rare Folios', 1, 'EXT-103'),
('DRAW_W101', 'West Wing', 1, 'Grand Drawing Room & Piano', 0, 'EXT-201'),
('DINING_W102', 'West Wing', 1, 'State Dining Hall', 0, 'EXT-202'),
('KITCHEN_S001', 'South Wing', 0, 'Scullery & Cold Larder', 1, 'EXT-301'),
('WINE_S002', 'South Wing', 0, 'Subterranean Wine Cellar', 1, 'EXT-302'),
('GUEST_W201', 'West Wing', 2, 'Highland Guest Suite (Julian Vance)', 1, 'EXT-205'),
('GUEST_W202', 'West Wing', 2, 'Garden Guest Suite (Dr. Finch)', 1, 'EXT-206'),
('GUEST_W203', 'West Wing', 2, 'Terrace Suite (Arthur Pendelton)', 1, 'EXT-207'),
('GUEST_W204', 'West Wing', 2, 'Heather Guest Suite (Sir Kenneth)', 1, 'EXT-208'),
('STAFF_S101', 'South Wing', 1, 'Housekeeper Quarters (Beatrice)', 0, 'EXT-305'),
('STAFF_S102', 'South Wing', 1, 'Butler & Valet Quarters', 0, 'EXT-306'),
('BUTLER_S103', 'South Wing', 0, 'Butler Service Pantry & Safe', 1, 'EXT-307'),
('BILLIARD_E102', 'East Wing', 1, 'Billiard Room & Trophy Lounge', 0, 'EXT-104'),
('GUN_E001', 'East Wing', 0, 'Highland Gun & Armory Room', 1, 'EXT-105'),
('CONSERV_N101', 'North Wing', 1, 'Victorian Botanical Conservatory', 0, 'EXT-401'),
('TERRACE_N102', 'North Wing', 1, 'North Fountain Balcony', 0, NULL),
('CELLAR_S003', 'South Wing', 0, 'Coal Bunker & Furnace Chamber', 1, 'EXT-308'),
('GATE_NORTH', 'North Gate', 0, 'North Estate Security Gatehouse', 1, 'EXT-501'),
('GATE_SOUTH', 'South Gate', 0, 'South Gate Service Turnstile', 1, 'EXT-502'),
('STABLE_W001', 'West Grounds', 0, 'Carriage House & Chauffeur Bay', 1, 'EXT-601'),
('TOWER_CLOCK', 'Central Wing', 3, 'Highland Clocktower & Bells', 1, 'EXT-701'),
('ATTIC_E301', 'East Wing', 3, 'Estate Archive & Linens', 1, 'EXT-106');

-- 2. Guests Table
CREATE TABLE guests (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT,
  room_assigned TEXT,
  arrival_date TEXT,
  departure_planned TEXT,
  relationship TEXT,
  alibi_claimed TEXT
);

INSERT INTO guests VALUES
(1, 'Julian Vance', 'Mr.', 'GUEST_W201', '1995-10-23', '1995-10-24 21:00', 'Nephew / Former Sole Heir', 'Claims he caught the 21:15 express train south from Dalwhinnie Station to London Victoria'),
(2, 'Lady Eleanor Vance', 'Lady', 'MASTER_E202', '1995-10-15', '1995-11-01', 'Sister / Widow of Gen. Vance', 'Playing Schubert in the Grand Drawing Room with Beatrice serving tea from 20:30 to 22:30'),
(3, 'Dr. Alistair Finch', 'Dr.', 'GUEST_W202', '1995-10-24', '1995-10-25', 'Personal Physician & Old Schoolmate', 'Retired to Room W202 at 21:15 to review Archibald medical charts; heard bell ring at 22:18'),
(4, 'Arthur Pendelton', 'Esq.', 'GUEST_W203', '1995-10-24', '1995-10-25', 'Senior Estate Solicitor', 'In Room W203 preparing will codicil registry papers until the commotion at 22:20'),
(5, 'Sir Kenneth Ross', 'Sir', 'GUEST_W204', '1995-10-23', '1995-10-26', 'Neighboring Laird & Deer Forest Owner', 'In the Billiard Room smoking cigars with Captain Boyd between 21:00 and 22:15'),
(6, 'Captain Alistair Boyd', 'Capt.', 'GUEST_W204', '1995-10-23', '1995-10-25', 'Highland Rifles Veteran & Distant Cousin', 'Playing billiards with Sir Kenneth in Billiard Room until hearing alarm bell'),
(7, 'Lady Margaret Ross', 'Lady', 'GUEST_W204', '1995-10-23', '1995-10-26', 'Wife of Sir Kenneth Ross', 'Resting in the Library reading Scott poetry until dinner concluded at 21:00'),
(8, 'Miss Clara Davenport', 'Miss', 'GUEST_W203', '1995-10-24', '1995-10-25', 'Legal Stenographer for Pendelton', 'Typing legal codicil carbon copies in Room W203 adjacent to Arthur Pendelton');

-- 3. Staff Shifts Table
CREATE TABLE staff_shifts (
  id INTEGER PRIMARY KEY,
  staff_name TEXT NOT NULL,
  role TEXT NOT NULL,
  shift_start TEXT NOT NULL,
  shift_end TEXT NOT NULL,
  station TEXT NOT NULL,
  notes TEXT
);

INSERT INTO staff_shifts VALUES
(1, 'Chef Gordon Ramsford', 'Executive Chef', '1995-10-24 14:00', '1995-10-24 23:00', 'KITCHEN_S001', 'Prepared braised venison & poached pears. Caught in scullery at 22:45 disposing of rodent poison'),
(2, 'Beatrice Ward', 'Head Housekeeper', '1995-10-24 07:00', '1995-10-24 22:30', 'STAFF_S101', 'Delivered decanter of 1945 Fonseca Port to Study at 21:10; responded to panic bell at 22:18'),
(3, 'Hamish MacIntyre', 'Night Gatekeeper & Chauffeur', '1995-10-24 18:00', '1995-10-25 06:00', 'GATE_NORTH', 'Saw black Rover drive through south service road at 21:48 in blinding downpour'),
(4, 'Morag Campbell', 'Scullery Maid', '1995-10-24 16:00', '1995-10-24 22:00', 'KITCHEN_S001', 'Saw Chef Gordon furiously scrubbing brass pestle in pantry sink around 21:30'),
(5, 'Calum Lindsay', 'Cellar Master & Sommelier', '1995-10-24 12:00', '1995-10-24 21:15', 'WINE_S002', 'Brought up 1945 Fonseca Port bottle for decanting at 20:45; secured wine cellar iron gate at 21:05'),
(6, 'Stuart MacLeod', 'Night Patrol Officer', '1995-10-24 20:00', '1995-10-25 04:00', 'GATE_SOUTH', 'Patrolled perimeter and gun room; logged electronic checkpoints hourly'),
(7, 'Fiona Fraser', 'Senior Chambermaid', '1995-10-24 14:00', '1995-10-24 22:00', 'GUEST_W201', 'Turned down beds in guest wing; noted Julian Vance pacing nervously at 20:30'),
(8, 'Ewan MacRae', 'Head Groundsman', '1995-10-24 06:00', '1995-10-24 18:00', 'CONSERV_N101', 'Secured glass roofs against impending gale; checked greenhouse heater'),
(9, 'Janet Ross', 'Pastry Cook', '1995-10-24 10:00', '1995-10-24 20:00', 'KITCHEN_S001', 'Baked pear tarts and almond shortbread; left kitchen prior to dinner service'),
(10, 'Ian Stewart', 'Highland Gamekeeper', '1995-10-24 13:00', '1995-10-24 21:30', 'GUN_E001', 'Inspected shooting rifles and locked ammunitions chest at 21:00'),
(11, 'Donald Campbell', 'First Footman', '1995-10-24 15:00', '1995-10-24 23:30', 'DINING_W102', 'Cleared dessert plates; accompanied Beatrice to study door upon hearing collapse'),
(12, 'Agnes MacIntyre', 'Head Laundress', '1995-10-24 08:00', '1995-10-24 17:00', 'STAFF_S102', 'Delivered pressed linen to master suite in afternoon; off duty by night');

-- 4. Toxicology Records (Forensic Laboratory Results)
CREATE TABLE toxicology_records (
  record_id INTEGER PRIMARY KEY,
  sample_type TEXT NOT NULL,
  subject_name TEXT NOT NULL,
  compound_detected TEXT NOT NULL,
  concentration_mg_l REAL NOT NULL,
  lethal_threshold_mg_l REAL NOT NULL,
  reported_at TEXT NOT NULL
);

INSERT INTO toxicology_records VALUES
(101, 'Post-Mortem Femoral Blood', 'Lord Archibald Blackwood', 'Potassium Cyanide', 4.85, 1.00, '1995-10-25 04:30'),
(102, 'Gastric Contents & Port Wine', 'Lord Archibald Blackwood', 'Potassium Cyanide', 142.60, 1.00, '1995-10-25 05:15'),
(103, 'Post-Mortem Vitreous Humor', 'Lord Archibald Blackwood', 'Potassium Cyanide', 2.10, 0.80, '1995-10-25 05:40'),
(104, 'Post-Mortem Liver Tissue', 'Lord Archibald Blackwood', 'Arsenic Trioxide', 0.00, 0.05, '1995-10-25 06:00'),
(105, 'Decanter Residue (Fonseca Port)', 'Lord Archibald Study', 'Potassium Cyanide', 88.40, 0.50, '1995-10-25 06:20'),
(106, 'Scullery Drain Trap Scraping', 'Kitchen Scullery Sink', 'Arsenic Trioxide', 12.30, 0.10, '1995-10-25 07:00'),
(107, 'Rat Bait Paste Sample', 'Chef Ramsford Pantry Box', 'Arsenic Trioxide', 450.00, 1.00, '1995-10-25 07:15'),
(108, 'Prescription Bottle (Digitalis)', 'Lord Archibald Nightstand', 'Digoxin', 0.002, 0.005, '1995-10-25 07:45'),
(109, 'Vintage 1961 Chateau Latour', 'Subterranean Wine Cellar', 'Ethanol 13.2% vol', 0.00, 1.00, '1995-10-25 08:00'),
(110, 'Vintage 1978 Glenfiddich Cask', 'Grand Drawing Room Bar', 'Ethanol 43.5% vol', 0.00, 1.00, '1995-10-25 08:15'),
(111, 'Water Decanter & Tumbler', 'Master Bedroom Nightstand', 'Potassium Cyanide', 0.00, 0.50, '1995-10-25 08:30'),
(112, 'Porcelain Tea Cup (Earl Grey)', 'Grand Drawing Room (Eleanor)', 'Caffeine & Tannin', 0.12, 5.00, '1995-10-25 08:45'),
(113, 'Venison Gravy Roasting Pan', 'Kitchen Range #1', 'Arsenic Trioxide', 0.00, 0.10, '1995-10-25 09:00'),
(114, 'Poached Pear Syrup Residue', 'Kitchen Dessert Larder', 'Sucrose Solution', 0.00, 1.00, '1995-10-25 09:15'),
(115, 'Blood Sample: Lady Eleanor', 'Lady Eleanor Vance', 'Caffeine Metabolite', 0.03, 10.00, '1995-10-25 09:30'),
(116, 'Blood Sample: Dr. Finch', 'Dr. Alistair Finch', 'Diazepam', 0.015, 0.20, '1995-10-25 09:45'),
(117, 'Blood Sample: Julian Vance', 'Julian Vance', 'Ethanol', 0.45, 0.80, '1995-10-25 10:00'),
(118, 'Blood Sample: Chef Ramsford', 'Chef Gordon Ramsford', 'Arsenic Trioxide Trace', 0.008, 0.05, '1995-10-25 10:15'),
(119, 'Blood Sample: Beatrice Ward', 'Beatrice Ward', 'Paracetamol', 0.005, 0.15, '1995-10-25 10:30'),
(120, 'Blood Sample: Arthur Pendelton', 'Arthur Pendelton', 'Theobromine (Cocoa)', 0.02, 5.00, '1995-10-25 10:45'),
(121, 'Crystal Sherry Glass (Study)', 'Lord Archibald Study Desk', 'Potassium Cyanide', 94.20, 0.50, '1995-10-25 11:00'),
(122, 'Cigar Ash Residue (Silver Tray)', 'Lord Archibald Study', 'Nicotine & Carbon', 0.00, 1.00, '1995-10-25 11:15'),
(123, 'Fountain Pen Nib Scraping', 'Arthur Pendelton Briefcase', 'Ferrous Gallate Ink', 0.00, 1.00, '1995-10-25 11:30'),
(124, 'Greenhouse Soil Sample', 'Botanical Conservatory Bed #4', 'Copper Sulfate Hydrate', 1.40, 10.00, '1995-10-25 11:45'),
(125, 'Highland Spring Tap Water', 'Scullery Main Supply Tap', 'Lead Trace', 0.002, 0.05, '1995-10-25 12:00'),
(126, 'Brass Pestle & Mortar', 'Kitchen Cold Larder Shelf', 'Arsenic Trioxide Residue', 4.10, 0.10, '1995-10-25 12:15'),
(127, 'Unopened Port Cask #1945-B', 'Wine Cellar Vault Bin #9', 'Potassium Cyanide', 0.00, 0.50, '1995-10-25 12:30'),
(128, 'Unopened Port Cask #1945-C', 'Wine Cellar Vault Bin #10', 'Potassium Cyanide', 0.00, 0.50, '1995-10-25 12:45'),
(129, 'Silver Wine Funnel (Cellar)', 'Wine Cellar Racking Bench', 'Potassium Cyanide', 0.00, 0.50, '1995-10-25 13:00'),
(130, 'Silver Salver Tray (Study)', 'Lord Archibald Study Doorway', 'Potassium Cyanide Micro-droplets', 0.85, 0.50, '1995-10-25 13:15'),
(131, 'Wool Overcoat Pocket Swab', 'Julian Vance Guest Room W201', 'Potassium Cyanide Dust', 0.04, 0.01, '1995-10-25 13:30'),
(132, 'Leather Medical Bag Swab', 'Dr. Alistair Finch Room W202', 'Potassium Cyanide Trace', 0.12, 0.01, '1995-10-25 13:45'),
(133, 'Nightstand Glass (Finch)', 'Dr. Finch Guest Room W202', 'Chloral Hydrate Sedative', 0.05, 1.00, '1995-10-25 14:00'),
(134, 'Stomach Mucosa Biopsy', 'Lord Archibald Blackwood', 'Fulminant Histotoxic Cellular Hypoxia', 1.00, 0.10, '1995-10-25 14:15'),
(135, 'Cardiac Myocardium Assay', 'Lord Archibald Blackwood', 'Cyanide-Bound Cytochrome c Oxidase', 99.4, 10.0, '1995-10-25 14:30'),
(136, 'Renal Cortex Tissue', 'Lord Archibald Blackwood', 'Potassium Cyanide', 3.40, 1.00, '1995-10-25 14:45'),
(137, 'Brain Tissue (Frontal Lobe)', 'Lord Archibald Blackwood', 'Potassium Cyanide', 2.80, 0.80, '1995-10-25 15:00'),
(138, 'Sugar Shaker (State Dining)', 'Dining Hall Sideboard', 'Sucrose', 0.00, 1.00, '1995-10-25 15:15'),
(139, 'Salt Cellar (State Dining)', 'Dining Hall Table Setting #1', 'Sodium Chloride', 0.00, 1.00, '1995-10-25 15:30'),
(140, 'Mustard Pot (Dining Hall)', 'Dining Hall Table Setting #1', 'Sinigrin (Natural Mustard Seed)', 0.00, 1.00, '1995-10-25 15:45'),
(141, 'Coffee Grounds (Kitchen Miele)', 'Kitchen Breakfast Pantry', 'Caffeine Acid', 0.00, 1.00, '1995-10-25 16:00'),
(142, 'Linseed Oil Rag (Gun Room)', 'Gun Room Cleaning Bench', 'Boiled Linseed Fatty Esters', 0.00, 1.00, '1995-10-25 16:15'),
(143, 'Gunpowder Scraping (12-Gauge)', 'Gun Room Cartridge Box', 'Potassium Nitrate & Sulfur', 0.00, 1.00, '1995-10-25 16:30'),
(144, 'Shooting Glove Left Palm', 'Captain Alistair Boyd', 'Nitrocellulose Powder Residue', 0.00, 1.00, '1995-10-25 16:45'),
(145, 'Wax Polish Scraping (Parquet)', 'East Wing Study Corridor Floor', 'Beeswax & Turpentine', 0.00, 1.00, '1995-10-25 17:00');

-- 5. Apothecary Orders Table (St. Jude's Pharmacy, Inverness)
CREATE TABLE apothecary_orders (
  order_id INTEGER PRIMARY KEY,
  pharmacy_name TEXT NOT NULL,
  buyer_name TEXT NOT NULL,
  item_name TEXT NOT NULL,
  quantity TEXT NOT NULL,
  signature_hash TEXT NOT NULL,
  purchase_date TEXT NOT NULL,
  ledger_notes TEXT
);

INSERT INTO apothecary_orders VALUES
(301, 'St. Jude Apothecary, Inverness', 'Arthur Pendelton', 'Calligraphic Fountain Pen Ink (Black)', '3 Bottles (60ml)', 'SIG-AP-8841', '1995-10-20', 'Routine legal document drafting supplies'),
(302, 'St. Jude Apothecary, Inverness', 'Chef Gordon Ramsford', 'Arsenic Trioxide Pastes (Agricultural)', '500g Tin', 'SIG-GR-1049', '1995-10-18', 'Highland pest control authorization signed for Blackwood cellar'),
(303, 'St. Jude Apothecary, Inverness', 'Dr. Alistair Finch', 'Potassium Cyanide Crystalline Reagent', '50g Glass Jar', 'SIG-AF-7712', '1995-10-21', 'Prescription pad #7712; Ledger notation: Special botanical mounting & specimen taxidermy for Archibald Blackwood'),
(304, 'St. Jude Apothecary, Inverness', 'Dr. Alistair Finch', 'Digitalis Purpurea Tincture', '100ml Dropper', 'SIG-AF-7714', '1995-10-22', 'Prescription for Lord Archibald maintenance cardiac regimen'),
(305, 'Highland General Chemists', 'Beatrice Ward', 'Lavender Scented Floor Wax', '5 Litres', 'SIG-BW-0912', '1995-10-12', 'Standard estate housekeeping requisition'),
(306, 'St. Jude Apothecary, Inverness', 'Julian Vance', 'Morphine Sulfate Ampoules', 'Rejected (No Rx)', 'SIG-REJ-001', '1995-10-19', 'Dispensation refused by Chief Pharmacist without consulting physician'),
(307, 'St. Jude Apothecary, Inverness', 'Dr. Donald Ross', 'Amoxicillin Trihydrate 500mg', '40 Capsules', 'SIG-DR-4401', '1995-10-15', 'Prescription for Aviemore outpatient bacterial infection'),
(308, 'Caledonian Medical Supplies', 'Dr. Alistair Finch', 'Surgical Cotton Wool Rolls', '10 Rolls', 'SIG-AF-7680', '1995-10-14', 'Refill for physician mobile kit'),
(309, 'Caledonian Medical Supplies', 'Dr. Alistair Finch', 'Sterile Glass Syringes (5ml)', '1 Box (12 Units)', 'SIG-AF-7681', '1995-10-14', 'Refill for physician mobile kit'),
(310, 'St. Jude Apothecary, Inverness', 'Dr. Fiona MacDiarmid', 'Atropine Sulfate Ophthalmic Drops', '15ml Bottle', 'SIG-FM-9021', '1995-10-16', 'Highland Infirmary eye clinic dispensation'),
(311, 'Highland General Chemists', 'Ewan MacRae', 'Copper Sulfate Fungicide Dust', '5kg Drum', 'SIG-EM-3312', '1995-10-10', 'Groundskeeping authorization for estate orchard blight'),
(312, 'Highland General Chemists', 'Ian Stewart', 'Carbolic Veterinary Sheep Dip', '20 Litres', 'SIG-IS-1120', '1995-10-08', 'Highland estate moorland flock treatment'),
(313, 'St. Jude Apothecary, Inverness', 'Arthur Pendelton', 'Sealing Wax Sticks (Crimson)', '12 Sticks', 'SIG-AP-8840', '1995-10-18', 'Legal deed ribbon sealing supplies'),
(314, 'St. Jude Apothecary, Inverness', 'Dr. Alistair Finch', 'Aspirin Tablets (Acetylsalicylic Acid 300mg)', '100 Tablets', 'SIG-AF-7705', '1995-10-19', 'General analgesic clinic supply'),
(315, 'St. Jude Apothecary, Inverness', 'Dr. Alistair Finch', 'Nitroglycerin Sublingual Tablets 0.5mg', '50 Tablets', 'SIG-AF-7706', '1995-10-19', 'Archibald Blackwood angina rescue supply'),
(316, 'Loch Ness Dispensary', 'Dr. Hamish Bruce', 'Formaldehyde Solution 37%', '2 Litres', 'SIG-HB-0102', '1995-10-11', 'Highland mortuary tissue preservation'),
(317, 'Loch Ness Dispensary', 'Dr. Hamish Bruce', 'Surgical Scalpel Blades #10', '1 Box (100)', 'SIG-HB-0103', '1995-10-11', 'Pathology supplies order'),
(318, 'St. Jude Apothecary, Inverness', 'Lady Eleanor Vance', 'Lavender Water Cologne (Yardley)', '200ml Glass', 'SIG-EV-5510', '1995-10-16', 'Personal cosmetic purchase'),
(319, 'Highland General Chemists', 'Calum Lindsay', 'Potassium Metabisulfite Wine Stabilizer', '2kg Bag', 'SIG-CL-8802', '1995-10-05', 'Estate cellar sanitation and barrel sterilization'),
(320, 'Highland General Chemists', 'Calum Lindsay', 'Food-Grade Tartaric Acid Crystals', '1kg Bag', 'SIG-CL-8803', '1995-10-05', 'Cellar vintage acidity balancing'),
(321, 'St. Jude Apothecary, Inverness', 'Dr. Donald Ross', 'Codeine Phosphate Syrup', '200ml Bottle', 'SIG-DR-4422', '1995-10-18', 'Cough suppressant prescription for Aviemore parish'),
(322, 'St. Jude Apothecary, Inverness', 'Dr. Donald Ross', 'Bandages & Zinc Oxide Adhesive Plasters', '4 Boxes', 'SIG-DR-4423', '1995-10-18', 'Clinic first aid restock'),
(323, 'Caledonian Medical Supplies', 'Highland Regional Constabulary', 'Narcotics Field Testing Reagents', '1 Kit', 'SIG-HRC-990', '1995-10-02', 'Inverness forensic unit station refill'),
(324, 'St. Jude Apothecary, Inverness', 'Sir Kenneth Ross', 'Glycerol & Rosewater Hand Lotion', '1 Bottle (150ml)', 'SIG-KR-7721', '1995-10-17', 'Purchased by Lady Margaret Ross'),
(325, 'Highland General Chemists', 'Janet Ross', 'Pure Vanilla Pods & Almond Extract', '6 Vials', 'SIG-JR-2201', '1995-10-14', 'Confectionery flavorings for Blackwood kitchen'),
(326, 'St. Jude Apothecary, Inverness', 'Dr. Alistair Finch', 'Ether Anesthetic Grade', '500ml Canister', 'SIG-AF-7690', '1995-10-15', 'Highland cottage surgery stock'),
(327, 'St. Jude Apothecary, Inverness', 'Dr. Alistair Finch', 'Chloroform B.P.', '250ml Bottle', 'SIG-AF-7691', '1995-10-15', 'Highland cottage surgery stock'),
(328, 'St. Jude Apothecary, Inverness', 'Chef Gordon Ramsford', 'Sodium Bicarbonate Powder', '2kg Tub', 'SIG-GR-1048', '1995-10-16', 'Baking and copperware cleaning requisition'),
(329, 'Highland General Chemists', 'Morag Campbell', 'Carbolic Disinfectant Cleanser', '10 Litres', 'SIG-MC-4411', '1995-10-19', 'Scullery and floor sanitation requisition'),
(330, 'St. Jude Apothecary, Inverness', 'Dr. Fiona MacDiarmid', 'Insulin Regular (Humulin S)', '5 Vials', 'SIG-FM-9035', '1995-10-20', 'Diabetic patient prescription refill'),
(331, 'St. Jude Apothecary, Inverness', 'Dr. Donald Ross', 'Salbutamol Inhalers 100mcg', '3 Inhalers', 'SIG-DR-4430', '1995-10-21', 'Asthma management supply'),
(332, 'Highland General Chemists', 'Stuart MacLeod', 'Eveready Heavy Duty D Batteries', '12 Batteries', 'SIG-SM-6010', '1995-10-22', 'Night watchman patrol torch supply'),
(333, 'St. Jude Apothecary, Inverness', 'Captain Alistair Boyd', 'Mentholated Throat Lozenges', '3 Tins', 'SIG-AB-3301', '1995-10-23', 'Highland travel supplies'),
(334, 'St. Jude Apothecary, Inverness', 'Dr. Alistair Finch', 'Camphorated Oil Liniment', '200ml Bottle', 'SIG-AF-7710', '1995-10-20', 'Topical arthritis rub for Archibald Blackwood'),
(335, 'Caledonian Medical Supplies', 'Dr. Donald Ross', 'Latex Examination Gloves (Size L)', '2 Boxes (100ct)', 'SIG-DR-4435', '1995-10-22', 'Routine clinic disposable supplies'),
(336, 'Highland General Chemists', 'Hamish MacIntyre', 'Anti-Freeze Ethylene Glycol', '10 Litres', 'SIG-HM-1105', '1995-10-21', 'Rover estate automobile winter preparation'),
(337, 'St. Jude Apothecary, Inverness', 'Arthur Pendelton', 'Parchment Bond Paper (500 Sheets)', '1 Ream', 'SIG-AP-8842', '1995-10-21', 'Legal deed drafting ream'),
(338, 'St. Jude Apothecary, Inverness', 'Dr. Alistair Finch', 'Syrup of Ipecac B.P.', '100ml Bottle', 'SIG-AF-7711', '1995-10-21', 'Emetic emergency antidote supply'),
(339, 'Highland General Chemists', 'Beatrice Ward', 'Cedar Moth Repellent Blocks', '24 Blocks', 'SIG-BW-0915', '1995-10-15', 'East Wing linen and wardrobe preservation'),
(340, 'St. Jude Apothecary, Inverness', 'Dr. Fiona MacDiarmid', 'Morphine Sulfate 10mg/ml Ampoules', '10 Ampoules', 'SIG-FM-9040', '1995-10-22', 'Highland Hospice palliative care registry'),
(341, 'St. Jude Apothecary, Inverness', 'Dr. Donald Ross', 'Penicillin V Potassium 250mg', '28 Tablets', 'SIG-DR-4441', '1995-10-23', 'Inverness patient dental infection'),
(342, 'Highland General Chemists', 'Ewan MacRae', 'Sulfur Powder Dust (Horticultural)', '10kg Sack', 'SIG-EM-3315', '1995-10-18', 'Greenhouse tomato mildew eradication'),
(343, 'Caledonian Medical Supplies', 'Dr. Alistair Finch', 'Sphygmomanometer Blood Pressure Cuff', '1 Unit', 'SIG-AF-7718', '1995-10-22', 'Replacement mercury manometer for doctor bag'),
(344, 'St. Jude Apothecary, Inverness', 'Lady Margaret Ross', 'Elderberry Cold Syrup', '150ml Bottle', 'SIG-MR-8810', '1995-10-22', 'Highland herbal seasonal tonics'),
(345, 'St. Jude Apothecary, Inverness', 'Dr. Donald Ross', 'Hydrocortisone Cream 1%', '2 Tubes (30g)', 'SIG-DR-4445', '1995-10-23', 'Dermatological patient treatment'),
(346, 'Highland General Chemists', 'Ian Stewart', 'Neatsfoot Leather Preservative Oil', '2 Litres', 'SIG-IS-1125', '1995-10-20', 'Gun slip and boot waterproofing'),
(347, 'St. Jude Apothecary, Inverness', 'Dr. Alistair Finch', 'Valerian Root Tincture', '100ml Bottle', 'SIG-AF-7719', '1995-10-22', 'Mild sedative for Archibald Blackwood insomnia'),
(348, 'Caledonian Medical Supplies', 'Highland Infirmary Pathology', 'Glass Microscope Slides & Coverslips', '5 Boxes', 'SIG-HIP-004', '1995-10-23', 'Diagnostic microscopy supplies'),
(349, 'St. Jude Apothecary, Inverness', 'Chef Gordon Ramsford', 'Cream of Tartar (Potassium Bitartrate)', '500g Tub', 'SIG-GR-1052', '1995-10-23', 'Highland meringue and soufflé preparation'),
(350, 'Highland General Chemists', 'Agnes MacIntyre', 'Starch Flakes & Washing Soda', '10kg Bag', 'SIG-AM-7701', '1995-10-20', 'Laundry starching for formal dining napery'),
(351, 'St. Jude Apothecary, Inverness', 'Dr. Donald Ross', 'Diazepam 5mg Tablets', '30 Tablets', 'SIG-DR-4448', '1995-10-24', 'Anxiety prescription for Dalwhinnie resident'),
(352, 'St. Jude Apothecary, Inverness', 'Arthur Pendelton', 'Red Legal Ribbon (Silk 100m)', '1 Spool', 'SIG-AP-8845', '1995-10-24', 'Formal ribbon binding for estate codicil execution');

-- 6. Estate Wills Table
CREATE TABLE estate_wills (
  will_version TEXT PRIMARY KEY,
  date_drafted TEXT NOT NULL,
  primary_beneficiary TEXT NOT NULL,
  disinherited_party TEXT,
  estate_value_gbp INTEGER NOT NULL,
  solicitor_witness TEXT NOT NULL,
  is_active INTEGER NOT NULL
);

INSERT INTO estate_wills VALUES
('1975_INITIAL', '1975-04-12', 'Lady Eleanor Vance (Sister)', 'None', 1200000, 'Pendelton Senior Solicitors', 0),
('1982_REVISION', '1982-09-20', 'Julian Vance (Nephew 50%) & Eleanor (50%)', 'None', 2400000, 'Pendelton Senior Solicitors', 0),
('1988_ORIGINAL', '1988-06-15', 'Julian Vance (Nephew)', 'None', 3800000, 'Pendelton & Son Solicitors', 0),
('1991_INTERIM', '1991-11-04', 'Julian Vance (Nephew)', 'None', 4000000, 'Arthur Pendelton', 0),
('1993_REVISION', '1993-04-10', 'Julian Vance (Nephew)', 'None', 4200000, 'Pendelton & Son Solicitors', 0),
('1995_REV_DRAFT', '1995-10-24', 'Highland Flora Conservatory Trust', 'Julian Vance', 4500000, 'Arthur Pendelton', 1);

-- 7. Electronic Keycard Access Logs (Schlage 1995 Magnetic Stripe Terminal)
CREATE TABLE keycard_logs (
  log_id INTEGER PRIMARY KEY,
  card_id TEXT NOT NULL,
  holder_name TEXT NOT NULL,
  room_id TEXT NOT NULL,
  swipe_time TEXT NOT NULL,
  access_status TEXT NOT NULL,
  reader_battery_pct INTEGER NOT NULL
);

INSERT INTO keycard_logs VALUES
(1001, 'CARD_AB_01', 'Lord Archibald Blackwood', 'STUDY_E201', '1995-10-24 20:15:22', 'GRANTED', 94),
(1002, 'CARD_BW_03', 'Beatrice Ward', 'STUDY_E201', '1995-10-24 21:09:44', 'GRANTED', 94),
(1003, 'CARD_BW_03', 'Beatrice Ward', 'STUDY_E201', '1995-10-24 21:12:05', 'GRANTED', 94),
(1004, 'CARD_DF_02', 'Dr. Alistair Finch', 'GUEST_W202', '1995-10-24 21:14:50', 'GRANTED', 88),
(1005, 'CARD_JV_04', 'Julian Vance', 'GUEST_W201', '1995-10-24 20:45:10', 'GRANTED', 91),
(1006, 'CARD_JV_04', 'Julian Vance', 'LIB_E101', '1995-10-24 21:22:15', 'GRANTED', 89),
(1007, 'CARD_JV_04', 'Julian Vance', 'STUDY_E201', '1995-10-24 21:28:30', 'DENIED_UNAUTHORIZED', 94),
(1008, 'CARD_DF_02', 'Dr. Alistair Finch', 'STUDY_E201', '1995-10-24 21:44:12', 'GRANTED', 94),
(1009, 'CARD_DF_02', 'Dr. Alistair Finch', 'LIB_E101', '1995-10-24 21:52:08', 'GRANTED', 89),
(1010, 'CARD_JV_04', 'Julian Vance', 'WINE_S002', '1995-10-24 21:38:14', 'GRANTED', 95),
(1011, 'CARD_GR_05', 'Chef Gordon Ramsford', 'KITCHEN_S001', '1995-10-24 22:05:00', 'GRANTED', 92),
(1012, 'CARD_BW_03', 'Beatrice Ward', 'STUDY_E201', '1995-10-24 22:18:10', 'GRANTED', 94),
(1013, 'CARD_DF_02', 'Dr. Alistair Finch', 'STUDY_E201', '1995-10-24 22:20:05', 'GRANTED', 94),
(1014, 'CARD_AP_06', 'Arthur Pendelton', 'STUDY_E201', '1995-10-24 22:22:30', 'GRANTED', 94),
(1015, 'CARD_AB_01', 'Lord Archibald Blackwood', 'STUDY_E201', '1995-10-23 08:30:12', 'GRANTED', 98),
(1016, 'CARD_BW_03', 'Beatrice Ward', 'LIB_E101', '1995-10-23 09:15:00', 'GRANTED', 96),
(1017, 'CARD_CL_09', 'Calum Lindsay', 'WINE_S002', '1995-10-23 10:00:22', 'GRANTED', 97),
(1018, 'CARD_GR_05', 'Chef Gordon Ramsford', 'KITCHEN_S001', '1995-10-23 10:30:45', 'GRANTED', 95),
(1019, 'CARD_JV_04', 'Julian Vance', 'GATE_NORTH', '1995-10-23 11:20:10', 'GRANTED', 95),
(1020, 'CARD_JV_04', 'Julian Vance', 'GUEST_W201', '1995-10-23 11:45:33', 'GRANTED', 95),
(1021, 'CARD_AB_01', 'Lord Archibald Blackwood', 'LIB_E101', '1995-10-23 14:10:05', 'GRANTED', 96),
(1022, 'CARD_JV_04', 'Julian Vance', 'STUDY_E201', '1995-10-23 15:20:40', 'GRANTED', 97),
(1023, 'CARD_CL_09', 'Calum Lindsay', 'WINE_S002', '1995-10-23 16:40:18', 'GRANTED', 97),
(1024, 'CARD_ST_10', 'Stuart MacLeod', 'GATE_SOUTH', '1995-10-23 20:05:00', 'GRANTED', 92),
(1025, 'CARD_ST_10', 'Stuart MacLeod', 'GUN_E001', '1995-10-23 21:00:15', 'GRANTED', 90),
(1026, 'CARD_ST_10', 'Stuart MacLeod', 'GATE_NORTH', '1995-10-23 22:00:30', 'GRANTED', 91),
(1027, 'CARD_ST_10', 'Stuart MacLeod', 'CELLAR_S003', '1995-10-23 23:00:12', 'GRANTED', 93),
(1028, 'CARD_BW_03', 'Beatrice Ward', 'ATTIC_E301', '1995-10-24 07:15:10', 'GRANTED', 95),
(1029, 'CARD_GR_05', 'Chef Gordon Ramsford', 'KITCHEN_S001', '1995-10-24 07:30:20', 'GRANTED', 94),
(1030, 'CARD_AB_01', 'Lord Archibald Blackwood', 'STUDY_E201', '1995-10-24 08:00:15', 'GRANTED', 95),
(1031, 'CARD_MC_08', 'Morag Campbell', 'KITCHEN_S001', '1995-10-24 08:30:00', 'GRANTED', 94),
(1032, 'CARD_AP_06', 'Arthur Pendelton', 'GATE_NORTH', '1995-10-24 09:30:45', 'GRANTED', 96),
(1033, 'CARD_AP_06', 'Arthur Pendelton', 'GUEST_W203', '1995-10-24 09:45:10', 'GRANTED', 96),
(1034, 'CARD_AP_06', 'Arthur Pendelton', 'STUDY_E201', '1995-10-24 10:15:00', 'GRANTED', 95),
(1035, 'CARD_DF_02', 'Dr. Alistair Finch', 'GATE_NORTH', '1995-10-24 11:00:30', 'GRANTED', 90),
(1036, 'CARD_DF_02', 'Dr. Alistair Finch', 'GUEST_W202', '1995-10-24 11:15:12', 'GRANTED', 90),
(1037, 'CARD_DF_02', 'Dr. Alistair Finch', 'STUDY_E201', '1995-10-24 11:30:22', 'GRANTED', 95),
(1038, 'CARD_CL_09', 'Calum Lindsay', 'WINE_S002', '1995-10-24 12:15:40', 'GRANTED', 96),
(1039, 'CARD_JV_04', 'Julian Vance', 'GUEST_W201', '1995-10-24 12:45:10', 'GRANTED', 93),
(1040, 'CARD_JV_04', 'Julian Vance', 'STABLE_W001', '1995-10-24 13:10:00', 'GRANTED', 94),
(1041, 'CARD_AB_01', 'Lord Archibald Blackwood', 'LIB_E101', '1995-10-24 13:40:25', 'GRANTED', 95),
(1042, 'CARD_AP_06', 'Arthur Pendelton', 'STUDY_E201', '1995-10-24 14:00:10', 'GRANTED', 95),
(1043, 'CARD_AP_06', 'Arthur Pendelton', 'LIB_E101', '1995-10-24 15:30:44', 'GRANTED', 94),
(1044, 'CARD_JV_04', 'Julian Vance', 'STUDY_E201', '1995-10-24 16:15:30', 'GRANTED', 95),
(1045, 'CARD_JV_04', 'Julian Vance', 'GUEST_W201', '1995-10-24 16:50:12', 'GRANTED', 92),
(1046, 'CARD_HM_07', 'Hamish MacIntyre', 'GATE_NORTH', '1995-10-24 18:00:00', 'GRANTED', 95),
(1047, 'CARD_ST_10', 'Stuart MacLeod', 'GATE_SOUTH', '1995-10-24 18:05:00', 'GRANTED', 91),
(1048, 'CARD_CL_09', 'Calum Lindsay', 'WINE_S002', '1995-10-24 18:15:20', 'GRANTED', 96),
(1049, 'CARD_BW_03', 'Beatrice Ward', 'BUTLER_S103', '1995-10-24 18:30:10', 'GRANTED', 95),
(1050, 'CARD_GR_05', 'Chef Gordon Ramsford', 'KITCHEN_S001', '1995-10-24 18:45:00', 'GRANTED', 93),
(1051, 'CARD_DF_02', 'Dr. Alistair Finch', 'LIB_E101', '1995-10-24 19:10:15', 'GRANTED', 89),
(1052, 'CARD_AP_06', 'Arthur Pendelton', 'GUEST_W203', '1995-10-24 19:30:00', 'GRANTED', 95),
(1053, 'CARD_KR_07', 'Sir Kenneth Ross', 'GUEST_W204', '1995-10-24 19:40:12', 'GRANTED', 92),
(1054, 'CARD_KR_07', 'Sir Kenneth Ross', 'BILLIARD_E102', '1995-10-24 19:55:00', 'GRANTED', 92),
(1055, 'CARD_HM_07', 'Hamish MacIntyre', 'STABLE_W001', '1995-10-24 20:00:10', 'GRANTED', 94),
(1056, 'CARD_ST_10', 'Stuart MacLeod', 'GUN_E001', '1995-10-24 20:10:00', 'GRANTED', 90),
(1057, 'CARD_CL_09', 'Calum Lindsay', 'WINE_S002', '1995-10-24 20:45:00', 'GRANTED', 95),
(1058, 'CARD_BW_03', 'Beatrice Ward', 'BUTLER_S103', '1995-10-24 20:55:12', 'GRANTED', 95),
(1059, 'CARD_CL_09', 'Calum Lindsay', 'GATE_SOUTH', '1995-10-24 21:15:00', 'GRANTED', 96),
(1060, 'CARD_ST_10', 'Stuart MacLeod', 'GATE_NORTH', '1995-10-24 21:20:00', 'GRANTED', 90),
(1061, 'CARD_AP_06', 'Arthur Pendelton', 'GUEST_W203', '1995-10-24 21:25:30', 'GRANTED', 95),
(1062, 'CARD_MC_08', 'Morag Campbell', 'KITCHEN_S001', '1995-10-24 21:30:05', 'GRANTED', 92),
(1063, 'CARD_ST_10', 'Stuart MacLeod', 'TOWER_CLOCK', '1995-10-24 21:35:10', 'GRANTED', 89),
(1064, 'CARD_HM_07', 'Hamish MacIntyre', 'GATE_NORTH', '1995-10-24 21:40:00', 'GRANTED', 95),
(1065, 'CARD_KR_07', 'Sir Kenneth Ross', 'BILLIARD_E102', '1995-10-24 21:45:00', 'GRANTED', 91),
(1066, 'CARD_HM_07', 'Hamish MacIntyre', 'GATE_SOUTH', '1995-10-24 21:48:00', 'GRANTED', 94),
(1067, 'CARD_ST_10', 'Stuart MacLeod', 'GATE_SOUTH', '1995-10-24 22:00:00', 'GRANTED', 89),
(1068, 'CARD_HM_07', 'Hamish MacIntyre', 'GATE_NORTH', '1995-10-24 22:15:00', 'GRANTED', 94),
(1069, 'CARD_ST_10', 'Stuart MacLeod', 'STUDY_E201', '1995-10-24 22:21:00', 'GRANTED', 94),
(1070, 'CARD_HM_07', 'Hamish MacIntyre', 'STUDY_E201', '1995-10-24 22:25:10', 'GRANTED', 94),
(1071, 'CARD_GR_05', 'Chef Gordon Ramsford', 'KITCHEN_S001', '1995-10-24 22:45:10', 'GRANTED', 91),
(1072, 'CARD_HM_07', 'Hamish MacIntyre', 'GATE_NORTH', '1995-10-24 23:00:00', 'GRANTED', 94),
(1073, 'CARD_ST_10', 'Stuart MacLeod', 'GATE_NORTH', '1995-10-24 23:15:00', 'GRANTED', 89),
(1074, 'CARD_HM_07', 'Hamish MacIntyre', 'STABLE_W001', '1995-10-24 23:25:00', 'GRANTED', 94),
(1075, 'CARD_ST_10', 'Stuart MacLeod', 'CELLAR_S003', '1995-10-24 23:45:00', 'GRANTED', 89),
(1076, 'CARD_BW_03', 'Beatrice Ward', 'GUEST_W201', '1995-10-23 10:10:00', 'GRANTED', 96),
(1077, 'CARD_BW_03', 'Beatrice Ward', 'GUEST_W202', '1995-10-23 10:25:00', 'GRANTED', 96),
(1078, 'CARD_BW_03', 'Beatrice Ward', 'GUEST_W203', '1995-10-23 10:40:00', 'GRANTED', 96),
(1079, 'CARD_BW_03', 'Beatrice Ward', 'GUEST_W204', '1995-10-23 10:55:00', 'GRANTED', 96),
(1080, 'CARD_FF_11', 'Fiona Fraser', 'GUEST_W201', '1995-10-23 11:00:00', 'GRANTED', 94),
(1081, 'CARD_FF_11', 'Fiona Fraser', 'GUEST_W202', '1995-10-23 11:30:00', 'GRANTED', 94),
(1082, 'CARD_FF_11', 'Fiona Fraser', 'GUEST_W203', '1995-10-23 12:00:00', 'GRANTED', 94),
(1083, 'CARD_FF_11', 'Fiona Fraser', 'GUEST_W204', '1995-10-23 12:30:00', 'GRANTED', 94),
(1084, 'CARD_ST_10', 'Stuart MacLeod', 'GATE_NORTH', '1995-10-23 13:00:00', 'GRANTED', 92),
(1085, 'CARD_ST_10', 'Stuart MacLeod', 'GATE_SOUTH', '1995-10-23 14:00:00', 'GRANTED', 92),
(1086, 'CARD_GR_05', 'Chef Gordon Ramsford', 'CELLAR_S003', '1995-10-23 14:30:00', 'GRANTED', 94),
(1087, 'CARD_AB_01', 'Lord Archibald Blackwood', 'GUN_E001', '1995-10-23 15:00:00', 'GRANTED', 96),
(1088, 'CARD_IS_12', 'Ian Stewart', 'GUN_E001', '1995-10-23 15:10:00', 'GRANTED', 95),
(1089, 'CARD_IS_12', 'Ian Stewart', 'GATE_NORTH', '1995-10-23 17:00:00', 'GRANTED', 95),
(1090, 'CARD_EM_13', 'Ewan MacRae', 'CONSERV_N101', '1995-10-23 17:30:00', 'GRANTED', 93),
(1091, 'CARD_BW_03', 'Beatrice Ward', 'STAFF_S101', '1995-10-23 18:00:00', 'GRANTED', 95),
(1092, 'CARD_MC_08', 'Morag Campbell', 'KITCHEN_S001', '1995-10-23 19:00:00', 'GRANTED', 94),
(1093, 'CARD_GR_05', 'Chef Gordon Ramsford', 'KITCHEN_S001', '1995-10-23 19:30:00', 'GRANTED', 94),
(1094, 'CARD_AB_01', 'Lord Archibald Blackwood', 'STUDY_E201', '1995-10-23 20:30:00', 'GRANTED', 96),
(1095, 'CARD_BW_03', 'Beatrice Ward', 'STUDY_E201', '1995-10-23 21:00:00', 'GRANTED', 95),
(1096, 'CARD_AB_01', 'Lord Archibald Blackwood', 'MASTER_E202', '1995-10-23 22:30:00', 'GRANTED', 96),
(1097, 'CARD_FF_11', 'Fiona Fraser', 'GUEST_W201', '1995-10-24 14:15:00', 'GRANTED', 93),
(1098, 'CARD_FF_11', 'Fiona Fraser', 'GUEST_W202', '1995-10-24 14:45:00', 'GRANTED', 93),
(1099, 'CARD_FF_11', 'Fiona Fraser', 'GUEST_W203', '1995-10-24 15:15:00', 'GRANTED', 93),
(1100, 'CARD_FF_11', 'Fiona Fraser', 'GUEST_W204', '1995-10-24 15:45:00', 'GRANTED', 93),
(1101, 'CARD_IS_12', 'Ian Stewart', 'GUN_E001', '1995-10-24 16:00:00', 'GRANTED', 95),
(1102, 'CARD_EM_13', 'Ewan MacRae', 'CONSERV_N101', '1995-10-24 16:30:00', 'GRANTED', 92),
(1103, 'CARD_BW_03', 'Beatrice Ward', 'ATTIC_E301', '1995-10-24 17:00:00', 'GRANTED', 95),
(1104, 'CARD_MC_08', 'Morag Campbell', 'KITCHEN_S001', '1995-10-24 17:15:00', 'GRANTED', 93),
(1105, 'CARD_ST_10', 'Stuart MacLeod', 'GATE_NORTH', '1995-10-24 17:30:00', 'GRANTED', 91),
(1106, 'CARD_CL_09', 'Calum Lindsay', 'WINE_S002', '1995-10-24 17:45:00', 'GRANTED', 96),
(1107, 'CARD_FF_11', 'Fiona Fraser', 'GUEST_W201', '1995-10-24 20:30:00', 'GRANTED', 92),
(1108, 'CARD_FF_11', 'Fiona Fraser', 'GUEST_W202', '1995-10-24 20:45:00', 'GRANTED', 92),
(1109, 'CARD_FF_11', 'Fiona Fraser', 'GUEST_W203', '1995-10-24 21:00:00', 'GRANTED', 92),
(1110, 'CARD_FF_11', 'Fiona Fraser', 'STAFF_S101', '1995-10-24 21:15:00', 'GRANTED', 92),
(1111, 'CARD_ST_10', 'Stuart MacLeod', 'GUN_E001', '1995-10-24 21:18:00', 'GRANTED', 90),
(1112, 'CARD_ST_10', 'Stuart MacLeod', 'GATE_SOUTH', '1995-10-24 21:30:00', 'GRANTED', 90),
(1113, 'CARD_MC_08', 'Morag Campbell', 'KITCHEN_S001', '1995-10-24 21:45:00', 'GRANTED', 91),
(1114, 'CARD_MC_08', 'Morag Campbell', 'STAFF_S101', '1995-10-24 22:00:00', 'GRANTED', 91),
(1115, 'CARD_ST_10', 'Stuart MacLeod', 'STABLE_W001', '1995-10-24 22:10:00', 'GRANTED', 89),
(1116, 'CARD_HM_07', 'Hamish MacIntyre', 'GATE_NORTH', '1995-10-24 22:30:00', 'GRANTED', 94),
(1117, 'CARD_ST_10', 'Stuart MacLeod', 'GATE_NORTH', '1995-10-24 22:45:00', 'GRANTED', 89),
(1118, 'CARD_ST_10', 'Stuart MacLeod', 'GATE_SOUTH', '1995-10-24 23:30:00', 'GRANTED', 88);

-- 8. Phone Toll Records (BT Highlands Exchange Dispatch)
CREATE TABLE phone_calls (
  call_id INTEGER PRIMARY KEY,
  source_type TEXT NOT NULL,
  extension_or_number TEXT NOT NULL,
  destination TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL,
  call_category TEXT NOT NULL
);

INSERT INTO phone_calls VALUES
(501, 'Internal Extension', 'EXT-101', 'EXT-207', '1995-10-24 16:45:10', 312, 'Intercom (Archibald to Pendelton re: Will)'),
(502, 'Internal Extension', 'EXT-205', 'EXT-206', '1995-10-24 21:18:02', 145, 'Intercom (Julian to Dr. Finch: Urgent favor)'),
(503, 'External Line 1', '01479-821099', '0171-493-2211', '1995-10-24 18:20:00', 420, 'Long Distance: Julian to Mayfair Bookmaker (Debt dispute)'),
(504, 'Payphone Toll', 'Dalwhinnie Station Payphone', '01479-821099', '1995-10-24 23:15:40', 85, 'Incoming Collect: Julian Vance requesting pickup after missing 21:15 train'),
(505, 'Internal Extension', 'EXT-101', 'EXT-305', '1995-10-24 22:18:00', 12, 'Alarm Trigger: Emergency Panic Button Study to Beatrice'),
(506, 'External Line 1', '01479-821099', '01463-234100', '1995-10-24 09:10:00', 180, 'Inverness Grain & Coal Merchants: Winter fuel delivery inquiry'),
(507, 'External Line 2', '01479-821098', '0131-225-8800', '1995-10-24 09:45:20', 420, 'Edinburgh Stockbrokers: Highland Textile share dividend report'),
(508, 'Internal Extension', 'EXT-301', 'EXT-305', '1995-10-24 10:15:00', 65, 'Kitchen Scullery to Housekeeper: Luncheon menu approval'),
(509, 'External Line 1', '01479-821099', '01463-712345', '1995-10-24 11:00:15', 210, 'St. Jude Apothecary: Order ready confirmation for Dr. Finch'),
(510, 'External Line 1', '01479-821099', '01479-810220', '1995-10-24 11:35:00', 95, 'Aviemore Weather Station: Severe gale and torrential rain warning'),
(511, 'Internal Extension', 'EXT-101', 'EXT-301', '1995-10-24 12:05:00', 45, 'Study to Kitchen: Venison broth requested for lunch'),
(512, 'External Line 2', '01479-821098', '0171-629-9000', '1995-10-24 13:10:00', 540, 'Christies London: Rare Highland botanical folios auction catalog'),
(513, 'Internal Extension', 'EXT-206', 'EXT-101', '1995-10-24 14:15:00', 180, 'Dr. Finch to Study: Rescheduling weekly blood pressure consultation'),
(514, 'External Line 1', '01479-821099', '0141-332-9090', '1995-10-24 14:40:00', 320, 'Glasgow Railway Central: Inquiry regarding London sleeper timetable'),
(515, 'Internal Extension', 'EXT-207', 'EXT-101', '1995-10-24 15:20:00', 120, 'Pendelton to Study: Confirmation of will codicil drafting appointment'),
(516, 'External Line 1', '01479-821099', '01479-872111', '1995-10-24 16:00:10', 150, 'Highland Chauffeur Services: Road condition report over Drumochter Pass'),
(517, 'Internal Extension', 'EXT-307', 'EXT-302', '1995-10-24 17:15:00', 80, 'Pantry to Wine Cellar: Decanting instructions for 1945 Fonseca Port'),
(518, 'External Line 2', '01479-821098', '0171-493-2211', '1995-10-24 17:30:00', 60, 'Incoming Toll: Mayfair Bookmaker asking for Julian Vance (No answer)'),
(519, 'Internal Extension', 'EXT-205', 'EXT-201', '1995-10-24 18:45:00', 90, 'Julian to Drawing Room: Inquiring if dinner is served at 19:30'),
(520, 'External Line 1', '01479-821099', '01528-544211', '1995-10-24 19:15:00', 110, 'Dalwhinnie Station Master: Inquiring about 21:15 south train status'),
(521, 'Internal Extension', 'EXT-103', 'EXT-101', '1995-10-24 20:05:00', 40, 'Library to Study: Archibald requesting 1845 Highland Estate Atlas'),
(522, 'External Line 1', '01479-821099', '01463-222999', '1995-10-24 20:25:00', 180, 'Highland Regional Hospital: Inquiring for Dr. Finch (Transferred to W202)'),
(523, 'Internal Extension', 'EXT-206', 'EXT-301', '1995-10-24 20:50:00', 50, 'Dr. Finch to Kitchen: Requesting chamomile tea pot to guest room'),
(524, 'External Line 1', '01479-821099', '01528-544211', '1995-10-24 21:10:00', 75, 'Dalwhinnie Station Dispatch: Notice that 21:15 express is delayed by storm'),
(525, 'Internal Extension', 'EXT-201', 'EXT-305', '1995-10-24 21:30:00', 35, 'Drawing Room to Housekeeper: Lady Eleanor requesting fire stoked'),
(526, 'External Line 1', '01479-821099', '01479-810100', '1995-10-24 21:55:00', 45, 'Highland Constabulary Routine Check: Severe weather road closure at A9'),
(527, 'Emergency 999', '01479-821099', '999', '1995-10-24 22:20:15', 310, 'Highland Emergency 999: Beatrice Ward reporting Lord Archibald collapse'),
(528, 'Emergency 999', '01479-821099', '01463-230000', '1995-10-24 22:24:00', 190, 'Dr. Finch direct call to Inverness Ambulance Dispatch'),
(529, 'External Line 2', '01479-821098', '01463-715555', '1995-10-24 22:35:00', 240, 'Arthur Pendelton to Senior Partner: Reporting sudden fatality at Blackwood'),
(530, 'External Line 1', '01479-821099', '01463-888999', '1995-10-24 22:50:00', 410, 'H.M. Coroner Dispatch Notification: Dr. Hamish Bruce dispatched to estate'),
(531, 'External Line 2', '01479-821098', '0171-493-2211', '1995-10-24 23:05:00', 95, 'Incoming Long Distance: Mayfair Bookmaker (Answered by Beatrice: Not available)'),
(532, 'Internal Extension', 'EXT-501', 'EXT-305', '1995-10-24 23:20:00', 60, 'Gatehouse to Housekeeper: Police patrol car arrived at North Gate'),
(533, 'External Line 1', '01479-821099', '0131-556-8200', '1995-10-24 23:35:00', 220, 'Edinburgh High Court Justiciary: Duty fiscal notified of suspicious death'),
(534, 'Internal Extension', 'EXT-501', 'EXT-101', '1995-10-24 23:45:00', 40, 'Gatehouse to Study: Homicide detectives entering crime scene');
`;

// ============================================================================
// Case 1 Dossier Export
// ============================================================================

export const CASE_1_DOSSIER: CaseDossier = {
  id: 'case_blackwood_manor',
  caseNumber: '1995-CR-0842',
  title: 'The Midnight Cyanide at Blackwood Manor',
  subtitle: 'A Storm-Battered Highland Estate, A Disinherited Scion, and a Lethal Vintage',
  setting: 'Blackwood Estate, Scottish Highlands',
  dateOfIncident: 'October 24, 1995',
  difficulty: 'Junior',
  briefSummary:
    'On a stormy night in the Scottish Highlands, wealthy landowner Lord Archibald Blackwood collapsed dead in his locked study. The family doctor claimed a sudden heart attack, while the private chef was caught secretly dumping rat poison! But the coroner discovered the true murder weapon: lethal Potassium Cyanide in Lord Archibald\'s glass of vintage port. Six people were inside the mansion that night. Use your detective skills and SQL database queries to expose their lies, find the killer, and present the evidence to the Grand Jury!',
  victim: {
    name: 'Lord Archibald Blackwood',
    age: 68,
    occupation: 'Highland Landowner & Textile Tycoon',
    causeOfDeath: 'Lethal Potassium Cyanide Poisoning (Found in his 1945 port wine)',
    locationFound: 'Private Study, East Wing 2nd Floor',
    timeOfDeathEstimate: '21:40 - 22:10 (Pronounced dead 22:18)',
  },
  tables: [
    'guests',
    'staff_shifts',
    'manor_rooms',
    'keycard_logs',
    'phone_calls',
    'toxicology_records',
    'apothecary_orders',
    'estate_wills',
  ],
  seedSql: CASE_1_SEED_SQL,
  suspects: [
    {
      id: 'julian_vance',
      name: 'Julian Vance',
      age: 31,
      relationship: 'Nephew & Former Sole Heir',
      role: 'Gentleman Gambler',
      financialMotive: 'Facing £120,000 Mayfair gambling debts; disinherited in new will drafted 5 hours before murder.',
      swornStatement:
        'I caught the 21:15 express train south from Dalwhinnie Station and was nowhere near the manor at the time of my uncle\'s collapse. I had no idea about any change to his will; we parted on affectionate terms.',
      declaredAlibiLocation: 'Dalwhinnie Railway Station / Compartment on 21:15 Night Train',
      declaredDepartureTime: '21:00',
      badgeNumber: 'CID-SUS-01',
      heartRateNormal: 72,
      heartRateStressed: 138,
      brokenAlibiAdmission:
        'All right! Damn you! The storm washed out the 21:15 train! I never boarded! But Finch gave me his keycard—I only wanted to steal back the new draft will from Archibald\'s safe before he signed it! I didn\'t poison his port!',
    },
    {
      id: 'dr_alistair_finch',
      name: 'Dr. Alistair Finch',
      age: 61,
      relationship: 'Personal Physician & Confidant',
      role: 'Family Doctor',
      financialMotive: 'Substantial outstanding loans owed directly to Lord Archibald with foreclosure pending.',
      swornStatement:
        'I have only ever administered standard digitalis and aspirin to Lord Archibald. I was asleep in my guest quarters (W202) from 21:15 until the housekeeper screamed.',
      declaredAlibiLocation: 'West Wing Guest Suite Room W202',
      declaredDepartureTime: undefined,
      badgeNumber: 'CID-SUS-02',
      heartRateNormal: 68,
      heartRateStressed: 115,
      brokenAlibiAdmission:
        'Julian begged me for my master study keycard! He swore he only wanted to see what his uncle wrote in the new will. He promised me £50,000 to cover my debt once he took over the estate! I didn\'t know he had cyanide!',
    },
    {
      id: 'chef_gordon',
      name: 'Chef Gordon Ramsford',
      age: 52,
      relationship: 'Private Chef of 14 Years',
      role: 'Executive Chef',
      financialMotive: 'Lord Archibald threatened dismissal after discovering food supplies were being sold out the back door.',
      swornStatement:
        'I swear by my mother\'s grave I didn\'t kill him! Yes, I was caught flushing rat poison down the drain at 22:45, but that was because agricultural arsenic is illegal in private kitchens! I panicked!',
      declaredAlibiLocation: 'Scullery & Cold Larder',
      declaredDepartureTime: undefined,
      badgeNumber: 'CID-SUS-03',
      heartRateNormal: 82,
      heartRateStressed: 145,
      brokenAlibiAdmission:
        'I am innocent of murder! Check the toxicologist! Arsenic takes 12 hours of agonizing cramps to kill! The Master died in five minutes flat!',
    },
    {
      id: 'lady_eleanor',
      name: 'Lady Eleanor Vance',
      age: 59,
      relationship: 'Sister of Deceased',
      role: 'Socialite',
      financialMotive: 'Inherited the family estate life tenancy; bitterly contested Archibald\'s eccentric botanical donations.',
      swornStatement:
        'I was in the Grand Drawing Room playing Schubert sonatas from 20:30 until 22:30. Beatrice brought me camomile tea at 21:20.',
      declaredAlibiLocation: 'Grand Drawing Room',
      declaredDepartureTime: undefined,
      badgeNumber: 'CID-SUS-04',
      heartRateNormal: 65,
      heartRateStressed: 95,
      brokenAlibiAdmission:
        'Julian did come into the drawing room at 21:25. He was pale as a ghost, asking if Archibald keeps the study safe combination written in the desk drawer. I told him nothing!',
    },
    {
      id: 'beatrice_ward',
      name: 'Beatrice Ward',
      age: 48,
      relationship: 'Head Housekeeper',
      role: 'Housekeeper',
      financialMotive: 'Bequeathed £10,000 in previous will; unaffected by new codicil.',
      swornStatement:
        'I delivered the crystal decanter of 1945 Fonseca Port to his lordship at 21:10. He was alive, drafting papers at his desk. I answered the alarm bell at 22:18 and found him on the rug.',
      declaredAlibiLocation: 'Housekeeper Quarters / South Wing Service Corridor',
      declaredDepartureTime: undefined,
      badgeNumber: 'CID-SUS-05',
      heartRateNormal: 70,
      heartRateStressed: 88,
      brokenAlibiAdmission:
        'When I brought the port decanter, the bottle was unopened. Whoever poisoned his drink had to do it after 21:10 when I set the tray down.',
    },
    {
      id: 'arthur_pendelton',
      name: 'Arthur Pendelton',
      age: 64,
      relationship: 'Senior Estate Solicitor',
      role: 'Barrister',
      financialMotive: 'Executes the trust; no direct financial gain.',
      swornStatement:
        'Archibald summoned me to strip Julian of every single penny in the 1995 revision and transfer all £4.5M to the Highland Flora Conservatory Trust. Julian overheard us shouting at 17:00.',
      declaredAlibiLocation: 'Room W203',
      declaredDepartureTime: undefined,
      badgeNumber: 'CID-SUS-06',
      heartRateNormal: 60,
      heartRateStressed: 82,
      brokenAlibiAdmission:
        'Julian was outside the door during our 17:00 meeting. He heard Lord Archibald say: "Not one brass farthing will go to that roulette degenerate."',
    },
  ],
  evidenceDocs: [
    {
      id: 'doc_autopsy_42a',
      title: 'FORM 42-A: Post-Mortem Forensic Protocol',
      type: 'autopsy',
      dateStr: '25-OCT-1995 06:30 GMT',
      description: 'Official H.M. Coroner Pathology Report for Lord Archibald Blackwood.',
      autopsyData: {
        protocolNumber: 'COR-HIGHLAND-1995-0842',
        coronerName: 'Dr. Hamish Bruce, FRCPath',
        victimName: 'Lord Archibald Blackwood',
        timeOfDeathEstimated: '21:55 GMT +/- 15 mins',
        deathWindowStart: '21:40',
        deathWindowEnd: '22:10',
        causeOfDeath: 'Fulminant Histotoxic Hypoxia due to Acute Potassium Cyanide Ingestion',
        toxicologySummary: 'Potassium Cyanide detected at 4.85 mg/L in femoral blood and 142.6 mg/L in gastric contents. Arsenic concentration: 0.00 mg/L.',
        pathologistNotes:
          'Characteristic bitter almond odor upon opening the thorax. Bright brick-red post-mortem hypostasis (lividity) strongly diagnostic of cyanide poisoning rather than myocardial infarction. Death ensued within 3 to 7 minutes of ingesting contaminated port.',
        traumaMarkers: [
          {
            id: 'marker_gastric',
            organ: 'Stomach & Gastric Mucosa',
            xPercent: 52,
            yPercent: 54,
            findingSummary: '142.6 mg/L Potassium Cyanide mixed with remnants of 1945 Fonseca Port Wine. Arsenic: NIL.',
            associatedFilterHint: "SELECT * FROM toxicology_records WHERE sample_type LIKE '%Gastric%';",
          },
          {
            id: 'marker_blood',
            organ: 'Femoral Venous Blood',
            xPercent: 44,
            yPercent: 78,
            findingSummary: '4.85 mg/L Potassium Cyanide (Lethal threshold: 1.00 mg/L). Histotoxic cellular asphyxia.',
            associatedFilterHint: "SELECT * FROM toxicology_records WHERE subject_name LIKE '%Archibald%';",
          },
          {
            id: 'marker_liver',
            organ: 'Hepatic Parenchyma (Liver)',
            xPercent: 46,
            yPercent: 50,
            findingSummary: 'Arsenic Trioxide: 0.00 mg/L. No heavy metal necrosis.',
            associatedFilterHint: "SELECT * FROM toxicology_records WHERE compound_detected = 'Arsenic Trioxide';",
          },
        ],
      },
    },
    {
      id: 'doc_apothecary_ledger',
      title: 'St. Jude Apothecary Dangerous Poisons Register',
      type: 'apothecary_ledger',
      dateStr: '21-OCT-1995',
      description: 'Official restricted substance dispensation ledger from St. Jude Pharmacy, Inverness.',
      rawText: `ST. JUDE APOTHECARY & SURGICAL DISPENSARY
INVERNESS, SCOTLAND — RESTRICTED SCHEDULE I REGISTER
DATE: 21-OCT-1995
============================================================
ITEM: Potassium Cyanide Crystalline Reagent (50g)
BUYER: Dr. Alistair Finch (Lic. GMC #449102)
PRESCRIPTION REF: PAD #7712
JUSTIFICATION: "Botanical specimen fixation & taxidermy preservation for Archibald Blackwood Estate"
SIGNATURE VERIFIED: SIG-AF-7712
------------------------------------------------------------
WARNING: Lethal dose in humans is 150-200mg. Schedule 1 Poison log required under 1972 Poisons Act.`,
    },
    {
      id: 'doc_keycard_audit',
      title: 'Schlage Electronics Lock Terminal Audit Tape',
      type: 'greenbar_dispatch',
      dateStr: '24-OCT-1995 23:00 GMT',
      description: 'Electronic access tape printed from East Wing Master Lock Controller.',
      rawText: `SCHLAGE CONTROLS v3.11 -- EAST WING AUDIT DUMP
SYSTEM CLOCK: 24-OCT-1995 23:00:00
============================================================
TIME      CARD_ID     HOLDER                 DOOR        STATUS
20:15:22  CARD_AB_01  Archibald Blackwood    STUDY_E201  GRANTED
21:09:44  CARD_BW_03  Beatrice Ward          STUDY_E201  GRANTED
21:12:05  CARD_BW_03  Beatrice Ward          STUDY_E201  GRANTED
21:28:30  CARD_JV_04  Julian Vance           STUDY_E201  DENIED_UNAUTH
21:38:14  CARD_JV_04  Julian Vance           WINE_S002   GRANTED
21:44:12  CARD_DF_02  Dr. Alistair Finch     STUDY_E201  GRANTED
21:52:08  CARD_DF_02  Dr. Alistair Finch     LIB_E101    GRANTED
22:18:10  CARD_BW_03  Beatrice Ward          STUDY_E201  GRANTED
============================================================`,
    },
    {
      id: 'doc_bt_phone_tape',
      title: 'British Telecom Payphone Toll Dispatch',
      type: 'till_tape',
      dateStr: '24-OCT-1995 23:20 GMT',
      description: 'Thermal receipt of incoming collect toll call from Dalwhinnie Station.',
      rawText: `BRITISH TELECOM (BT) HIGHLAND OPERATOR
RECEIPT #95-1024-8841
--------------------------------
ORIGIN: Dalwhinnie Railway Station Payphone #4
DESTINATION: Blackwood Manor Line 1 (01479-821099)
TIMESTAMP: 24-OCT-1995 23:15:40 GMT
DURATION: 85 SECONDS
CALLER: "Julian Vance" (Collect Request)
MESSAGE LOGGED: "Uncle Archibald's chauffeur must come immediately. 
The 21:15 express never ran. I am stranded in the storm."
--------------------------------`,
    },
  ],
  deductionVouchers: [
    {
      id: 'voucher_1_cause_of_death',
      phaseNumber: 1,
      title: 'CLUE 1: Find the Real Murder Weapon (Cyanide vs Rat Poison)',
      hypothesisTarget: 'Query toxicology_records to prove Lord Archibald died from Potassium Cyanide, not Chef Gordon\'s kitchen rat poison.',
      targetSuspectId: 'chef_gordon',
      contradictedClaimText: 'Chef Gordon claims: "Lord Archibald died either of a natural heart attack or from my kitchen rat poison!"',
      validateRow: (row) => {
        // Red herring trap: Chef Gordon's arsenic
        if (
          String(row.compound_detected || '').toLowerCase().includes('arsenic') ||
          String(row.sample_type || '').toLowerCase().includes('scullery')
        ) {
          return {
            isSuccess: false,
            isRedHerring: true,
            feedbackMessage:
              'REJECTED — RED HERRING TRAP: Lieutenant Callahan shakes his head: "Arsenic? Look at the toxicology table! Concentration in Archibald\'s liver and blood was 0.00 mg/L! You got fooled by the chef\'s rat poison panic! 10% Credibility penalty."',
          };
        }

        // Correct check: Lord Archibald's toxicology showing Potassium Cyanide > lethal threshold
        const isVictim = String(row.subject_name || '').toLowerCase().includes('archibald');
        const isCyanide = String(row.compound_detected || '').toLowerCase().includes('cyanide');
        const concentration = Number(row.concentration_mg_l || 0);

        if (isVictim && isCyanide && concentration > 1.0) {
          return {
            isSuccess: true,
            feedbackMessage:
              'VERIFIED & ADMITTED: The toxicology record confirms acute Potassium Cyanide intoxication (4.85 mg/L vs lethal threshold 1.00 mg/L). Chef Ramsford\'s arsenic was an innocent panic reaction.',
          };
        }

        return {
          isSuccess: false,
          feedbackMessage:
            'REJECTED: This record does not establish the lethal toxicological cause of death for Lord Archibald.',
        };
      },
      successDeductionSummary: 'Lord Archibald died of Potassium Cyanide poisoning. Chef Gordon\'s arsenic is exonerated as a red herring.',
      redHerringWarning: 'Beware of jumping to conclusions with Chef Gordon\'s rat poison.',
      notebookObjective: 'Query the toxicology_records table to confirm the lethal chemical agent in Lord Archibald.',
      crimeBoardLink: {
        fromNodeId: 'node_toxicology',
        toNodeId: 'node_archibald',
        yarnColor: '#ff3333',
        label: 'Cyanide Intoxication (4.85 mg/L)',
      },
    },
    {
      id: 'voucher_2_shatter_julian_alibi',
      phaseNumber: 2,
      title: 'CLUE 2: Break Julian Vance\'s Fake Train Alibi',
      hypothesisTarget: 'Query keycard_logs to prove Julian lied about being on the 21:15 train, and was still inside the manor.',
      targetSuspectId: 'julian_vance',
      contradictedClaimText: 'Julian Vance claims: "I caught the 21:15 night train to London and was miles away from the manor!"',
      validateRow: (row) => {
        const isJulian = String(row.holder_name || '').toLowerCase().includes('julian');
        const swipeTime = String(row.swipe_time || '');

        if (isJulian && swipeTime >= '21:30') {
          return {
            isSuccess: true,
            feedbackMessage:
              `VERIFIED & ADMITTED: Electronic keycard log #${row.log_id} proves Julian Vance was swiping his card inside Blackwood Manor at ${swipeTime} (${row.room_id}), completely demolishing his 21:15 train alibi!`,
          };
        }

        // Also accept Dalwhinnie station payphone call at 23:15
        if (
          String(row.destination || '').includes('01479-821099') &&
          String(row.extension_or_number || '').toLowerCase().includes('dalwhinnie')
        ) {
          return {
            isSuccess: true,
            feedbackMessage:
              'VERIFIED & ADMITTED: The BT toll record confirms Julian Vance was stranded at Dalwhinnie calling the manor collect at 23:15 after missing his train!',
          };
        }

        return {
          isSuccess: false,
          feedbackMessage:
            'REJECTED: This record does not disprove Julian Vance\'s claimed 21:15 departure alibi.',
        };
      },
      successDeductionSummary: 'Julian Vance was still inside Blackwood Manor at 21:38, shattering his claimed London train alibi.',
      notebookObjective: 'Query keycard_logs or phone_calls to prove Julian was present on the estate after 21:30.',
      crimeBoardLink: {
        fromNodeId: 'node_julian',
        toNodeId: 'node_estate',
        yarnColor: '#ffb000',
        label: 'Alibi Shattered (Keycard swipe at 21:38)',
      },
    },
    {
      id: 'voucher_3_trace_cyanide_purchase',
      phaseNumber: 3,
      title: 'CLUE 3: Trace Who Bought the Potassium Cyanide',
      hypothesisTarget: 'Query apothecary_orders to find the invoice proving who bought Potassium Cyanide before the murder.',
      targetSuspectId: 'dr_alistair_finch',
      contradictedClaimText: 'Dr. Finch claims: "I only ever gave Lord Archibald heart medicine and aspirin. I never purchased lethal poisons!"',
      validateRow: (row) => {
        const item = String(row.item_name || '').toLowerCase();
        const buyer = String(row.buyer_name || '').toLowerCase();

        if (item.includes('cyanide') && buyer.includes('finch')) {
          return {
            isSuccess: true,
            feedbackMessage:
              'VERIFIED & ADMITTED: Apothecary order #303 proves Dr. Alistair Finch purchased 50g of Potassium Cyanide on Oct 21 using medical prescription pad #7712!',
          };
        }

        return {
          isSuccess: false,
          feedbackMessage:
            'REJECTED: This purchase record does not establish the source of the lethal Potassium Cyanide.',
        };
      },
      successDeductionSummary: 'Dr. Finch purchased 50g of Potassium Cyanide from St. Jude Apothecary on Oct 21.',
      notebookObjective: 'Query apothecary_orders to trace who bought Potassium Cyanide prior to the incident.',
      crimeBoardLink: {
        fromNodeId: 'node_finch',
        toNodeId: 'node_apothecary',
        yarnColor: '#ff3333',
        label: 'Procured 50g Cyanide (Order #303)',
      },
    },
    {
      id: 'voucher_4_uncover_will_motive',
      phaseNumber: 4,
      title: 'CLUE 4: Uncover the Killer\'s Secret Will Motive',
      hypothesisTarget: 'Query estate_wills to find the new 1995 draft will that cut Julian Vance out of the £4.5M fortune.',
      targetSuspectId: 'julian_vance',
      contradictedClaimText: 'Julian Vance claims: "Uncle Archibald and I were on wonderful terms; he always promised I would inherit Blackwood Manor!"',
      validateRow: (row) => {
        const disinherited = String(row.disinherited_party || '').toLowerCase();
        const willVersion = String(row.will_version || '');

        if (disinherited.includes('julian') && willVersion.includes('1995')) {
          return {
            isSuccess: true,
            feedbackMessage:
              `VERIFIED & ADMITTED: Estate will draft '${willVersion}' dated 1995-10-24 explicitly disinherited Julian Vance of £4,500,000, redirecting the fortune to the Highland Flora Conservatory Trust!`,
          };
        }

        return {
          isSuccess: false,
          feedbackMessage:
            'REJECTED: This will record does not substantiate the sudden disinheritance motive.',
        };
      },
      successDeductionSummary: 'Lord Archibald executed a new will on the afternoon of Oct 24 totally disinheriting Julian Vance.',
      notebookObjective: 'Query estate_wills to reveal the financial motive behind the murder.',
      crimeBoardLink: {
        fromNodeId: 'node_will',
        toNodeId: 'node_julian',
        yarnColor: '#ffb000',
        label: 'Disinherited from £4.5M Fortune',
      },
    },
    {
      id: 'voucher_5_pinpoint_study_access',
      phaseNumber: 5,
      title: 'CLUE 5: Prove Who Unlocked the Study Door at 21:44',
      hypothesisTarget: 'Query keycard_logs to prove Dr. Finch\'s master keycard was swiped into STUDY_E201 right before Lord Archibald collapsed.',
      targetSuspectId: 'dr_alistair_finch',
      contradictedClaimText: 'Dr. Finch claims: "I was asleep in my guest quarters (W202) from 21:15 onwards, and nobody used my master keycard to enter the study!"',
      validateRow: (row) => {
        const cardId = String(row.card_id || '');
        const roomId = String(row.room_id || '');
        const swipeTime = String(row.swipe_time || '');
        const status = String(row.access_status || '');

        // CARD_DF_02 swiped at STUDY_E201 at 21:44:12 GRANTED
        if (cardId === 'CARD_DF_02' && roomId === 'STUDY_E201' && swipeTime.startsWith('21:44') && status === 'GRANTED') {
          return {
            isSuccess: true,
            feedbackMessage:
              'VERIFIED & ADMITTED: Smoking gun access! Keycard CARD_DF_02 (Dr. Finch) opened the Private Study door at 21:44:12—right in the middle of the estimated death window! Finch gave his card to Julian to poison the port decanter!',
          };
        }

        return {
          isSuccess: false,
          feedbackMessage:
            'REJECTED: This keycard swipe does not establish entry into the Private Study during the fatal 21:40–22:00 window.',
        };
      },
      successDeductionSummary: 'Dr. Finch\'s keycard CARD_DF_02 was swiped at Lord Archibald\'s study at 21:44, granting physical access to poison the port.',
      notebookObjective: 'Query keycard_logs to locate who opened STUDY_E201 during the 21:40-22:00 death window.',
      crimeBoardLink: {
        fromNodeId: 'node_finch',
        toNodeId: 'node_study',
        yarnColor: '#ff0000',
        label: 'Keycard CARD_DF_02 used at 21:44',
      },
    },
  ],
  grandJuryExhibits: {
    exhibitA_Motive: {
      title: 'EXHIBIT A: Financial Motive (Disinheritance & Debt)',
      description: 'Submit SQL query demonstrating Julian Vance was disinherited in the 1995 will.',
      validateQuery: (rows) => {
        return rows.some(
          (r) =>
            String(r.disinherited_party || '').toLowerCase().includes('julian') &&
            String(r.will_version || '').includes('1995')
        );
      },
      failFeedback: 'Grand Jury rejected Exhibit A: Query results must demonstrate Julian Vance\'s disinheritance in the 1995 will.',
    },
    exhibitB_Means: {
      title: 'EXHIBIT B: Means (Sourcing of Potassium Cyanide)',
      description: 'Submit SQL query proving the procurement of Potassium Cyanide from St. Jude Apothecary.',
      validateQuery: (rows) => {
        return rows.some(
          (r) =>
            String(r.item_name || '').toLowerCase().includes('cyanide') &&
            String(r.buyer_name || '').toLowerCase().includes('finch')
        );
      },
      failFeedback: 'Grand Jury rejected Exhibit B: Query results must prove Dr. Finch acquired Potassium Cyanide from the apothecary.',
    },
    exhibitC_Opportunity: {
      title: 'EXHIBIT C: Opportunity (Study Access During Death Window)',
      description: 'Submit SQL query proving entry into the Study (STUDY_E201) between 21:40 and 22:00 using CARD_DF_02.',
      validateQuery: (rows) => {
        return rows.some(
          (r) =>
            String(r.room_id || '') === 'STUDY_E201' &&
            String(r.card_id || '') === 'CARD_DF_02' &&
            String(r.swipe_time || '').startsWith('21:44')
        );
      },
      failFeedback: 'Grand Jury rejected Exhibit C: Query results must prove keycard entry into STUDY_E201 between 21:40 and 22:00.',
    },
  },
  newspaperHeadline: {
    paperName: 'The Edinburgh Daily Gazette',
    date: 'OCTOBER 26, 1995',
    headline: 'BLACKWOOD HEIR INDICTED: FORENSIC SQL UNRAVELS POISON CONSPIRACY',
    subheadline: 'Disinherited Nephew & Complicit Physician Charged with Highland Patriarch\'s Murder',
    storySnippet:
      'In a sensational indictment delivered this morning at Edinburgh High Court, prosecutors revealed how electronic keycard audits, apothecary ledgers, and forensic toxicology disproved an alibi and shattered a £4.5M inheritance plot.',
  },
};

