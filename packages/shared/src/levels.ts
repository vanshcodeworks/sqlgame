import type { Level } from './types'

const EMPLOYEES_SCHEMA = `
CREATE TABLE employees (
  id     INTEGER PRIMARY KEY,
  name   TEXT    NOT NULL,
  dept   TEXT    NOT NULL,
  salary INTEGER NOT NULL,
  hired  TEXT    NOT NULL
);
INSERT INTO employees VALUES
  (1, 'Alice Chen',    'Engineering', 95000,  '2021-03-15'),
  (2, 'Bob Martinez',  'Marketing',   72000,  '2020-07-01'),
  (3, 'Carol White',   'Engineering', 88000,  '2022-01-10'),
  (4, 'David Park',    'HR',          65000,  '2019-11-20'),
  (5, 'Eve Johnson',   'Engineering', 102000, '2018-05-30'),
  (6, 'Frank Lee',     'Marketing',   78000,  '2021-09-12'),
  (7, 'Grace Kim',     'HR',          71000,  '2020-03-08'),
  (8, 'Henry Wilson',  'Engineering', 91000,  '2023-02-14');
`

const JOIN_SCHEMA = `
CREATE TABLE departments (
  id       INTEGER PRIMARY KEY,
  name     TEXT NOT NULL,
  location TEXT NOT NULL
);
INSERT INTO departments VALUES
  (1, 'Engineering', 'Building A, Floor 3'),
  (2, 'Marketing',   'Building B, Floor 1'),
  (3, 'HR',          'Building B, Floor 2');

CREATE TABLE employees (
  id      INTEGER PRIMARY KEY,
  name    TEXT    NOT NULL,
  dept_id INTEGER NOT NULL,
  salary  INTEGER NOT NULL,
  hired   TEXT    NOT NULL
);
INSERT INTO employees VALUES
  (1, 'Alice Chen',    1, 95000,  '2021-03-15'),
  (2, 'Bob Martinez',  2, 72000,  '2020-07-01'),
  (3, 'Carol White',   1, 88000,  '2022-01-10'),
  (4, 'David Park',    3, 65000,  '2019-11-20'),
  (5, 'Eve Johnson',   1, 102000, '2018-05-30'),
  (6, 'Frank Lee',     2, 78000,  '2021-09-12'),
  (7, 'Grace Kim',     3, 71000,  '2020-03-08'),
  (8, 'Henry Wilson',  1, 91000,  '2023-02-14');
`

const PROJECTS_SCHEMA = `
${JOIN_SCHEMA}
CREATE TABLE projects (
  id     INTEGER PRIMARY KEY,
  name   TEXT NOT NULL,
  status TEXT NOT NULL
);
INSERT INTO projects VALUES
  (1, 'Apollo Relaunch',  'active'),
  (2, 'Data Warehouse',   'active'),
  (3, 'Mobile App v2',    'planning');

CREATE TABLE assignments (
  employee_id INTEGER NOT NULL,
  project_id  INTEGER NOT NULL
);
INSERT INTO assignments VALUES
  (1,1),(3,1),(5,1),(8,1),
  (2,2),(6,2),(7,2),
  (4,3);
`

const UNDERLOOM_SCHEMA = `
CREATE TABLE underloom_transactions (
  tx_id         TEXT    PRIMARY KEY,
  fragment_type TEXT    NOT NULL,
  price_credits INTEGER NOT NULL,
  buyer_alias   TEXT    NOT NULL
);
INSERT INTO underloom_transactions VALUES
  ('TX-001', 'lineage_record', 120, 'ghost_hand'),
  ('TX-002', 'medical_record', 80,  'pale_eye'),
  ('TX-003', 'lineage_record', 340, 'the_widow'),
  ('TX-004', 'land_title',     60,  'iron_bell'),
  ('TX-005', 'medical_record', 90,  'grey_fox'),
  ('TX-006', 'lineage_record', 290, 'pale_eye'),
  ('TX-007', 'land_title',     60,  'ghost_hand'),
  ('TX-008', 'medical_record', 85,  'the_widow');
`

const MEDICAL_VERIFY_SCHEMA = `
CREATE TABLE market_medical_records (
  record_id         TEXT PRIMARY KEY,
  patient_code      TEXT NOT NULL,
  diagnosis_fragment TEXT NOT NULL,
  price_credits     INTEGER NOT NULL
);
INSERT INTO market_medical_records VALUES
  ('MR-01', 'PC-4471', 'respiratory, partial',   80),
  ('MR-02', 'PC-9012', 'trauma, unverified',     90),
  ('MR-03', 'PC-3387', 'cardiac, partial',       75),
  ('MR-04', 'PC-1120', 'unknown, fragment only', 60);

CREATE TABLE verified_medical_baseline (
  record_id TEXT PRIMARY KEY
);
INSERT INTO verified_medical_baseline VALUES
  ('MR-01'), ('MR-03');
`

const UNDERLOOM_INVENTORY_SCHEMA = `
CREATE TABLE underloom_inventory (
  fragment_id   TEXT    PRIMARY KEY,
  fragment_type TEXT    NOT NULL,
  record_year   INTEGER NOT NULL,
  market_price  INTEGER NOT NULL
);
INSERT INTO underloom_inventory VALUES
  ('F-01', 'lineage_record', 158, 340),
  ('F-02', 'medical_record', 190, 90),
  ('F-03', 'land_title',     175, 60),
  ('F-04', 'lineage_record', 172, 200),
  ('F-05', 'medical_record', 161, 85);
`

const COMMERCE_VOID_SCHEMA = `
CREATE TABLE commerce_records (
  record_id           TEXT    PRIMARY KEY,
  entity_name         TEXT    NOT NULL,
  asset_type          TEXT    NOT NULL,
  estimated_value     INTEGER NOT NULL,
  registered_entity_id TEXT   NOT NULL
);
INSERT INTO commerce_records VALUES
  ('CR-01', 'Serrin Estate',      'property', 14000, 'ENT-001'),
  ('CR-02', 'Vethara Granary Co', 'business', 3200,  'ENT-002'),
  ('CR-03', 'Mourne Trading',     'business', 1800,  'ENT-003'),
  ('CR-04', 'Kael Workshop',      'property', 2600,  'ENT-004');

CREATE TABLE void_entities (
  entity_id      TEXT PRIMARY KEY,
  erasure_reason TEXT NOT NULL,
  heir_status    TEXT NOT NULL
);
INSERT INTO void_entities VALUES
  ('ENT-001', 'null_event', 'living_confirmed'),
  ('ENT-002', 'null_event', 'living_confirmed'),
  ('ENT-003', 'null_event', 'no_heir_found'),
  ('ENT-004', 'record_error', 'living_confirmed');
`

export const levels: Level[] = [
  {
    id: 1,
    title: 'First Light',
    xpReward: 100,
    orderSensitive: false,
    story: {
      character: 'Nyx Varath',
      message: "The terminal just lit up for the first time in 200 years — I still can't believe it. Before anything else, I need to see who's actually archived in here. Every record, every column. Don't filter anything out yet.",
      hint: "Use SELECT * to select all columns from a table, followed by FROM tablename."
    },
    task: "Pull every record in the archive — don't filter anything, don't leave a column out.",
    schema: EMPLOYEES_SCHEMA,
    expectedQuery: `SELECT * FROM employees`,
    initialQuery: `SELECT * FROM employees`
  },
  {
    id: 2,
    title: 'Trim the Signal',
    xpReward: 150,
    orderSensitive: false,
    story: {
      character: 'Nyx Varath',
      message: "Good, it reads clean. Now trim it down — I don't need salaries or hire dates for this pass, just names and which sector they were assigned to. Keep it tidy.",
      hint: "List only the column names you want: SELECT col1, col2 FROM tablename."
    },
    task: "Just names and departments this time — leave salary and hire date out of it.",
    schema: EMPLOYEES_SCHEMA,
    expectedQuery: `SELECT name, dept FROM employees`,
    initialQuery: `SELECT  FROM employees`
  },
  {
    id: 3,
    title: 'The Missing Team',
    xpReward: 200,
    orderSensitive: false,
    story: {
      character: 'Nyx Varath',
      message: "There's a research team that never made it home before the Null Event — all of them logged under Engineering. Filter to just that department. I think that's where the missing schema notes are.",
      hint: "Use WHERE dept = 'Engineering' to filter rows by department."
    },
    task: "Filter the archive down to Engineering only — that's the team I need.",
    schema: EMPLOYEES_SCHEMA,
    expectedQuery: `SELECT * FROM employees WHERE dept = 'Engineering'`,
    initialQuery: `SELECT * FROM employees WHERE `
  },
  {
    id: 4,
    title: 'Rank by Authority',
    xpReward: 250,
    orderSensitive: true,
    story: {
      character: 'Nyx Varath',
      message: "Sorel wants to know who held the most authority in this sector — salary's the closest proxy this old system tracked. Sort everyone highest to lowest. The order matters here.",
      hint: "Use ORDER BY salary DESC to sort from highest to lowest."
    },
    task: "Sort the whole archive by salary, highest authority first.",
    schema: EMPLOYEES_SCHEMA,
    expectedQuery: `SELECT * FROM employees ORDER BY salary DESC`,
    initialQuery: `SELECT * FROM employees ORDER BY `
  },
  {
    id: 5,
    title: 'What Sorel Needs Most',
    xpReward: 300,
    orderSensitive: true,
    story: {
      character: 'Nyx Varath',
      message: "He doesn't have long — his notes were just confiscated. Just the top 3, highest first. Give him what matters most before he runs out of time to use it.",
      hint: "Combine ORDER BY salary DESC with LIMIT 3 to get just the top 3."
    },
    task: "Just the top 3 salaries, highest first — that's all Sorel has time for.",
    schema: EMPLOYEES_SCHEMA,
    expectedQuery: `SELECT * FROM employees ORDER BY salary DESC LIMIT 3`,
    initialQuery: `SELECT * FROM employees ORDER BY salary DESC LIMIT `
  },
  {
    id: 6,
    title: 'Sector 2: The Headcount',
    xpReward: 350,
    orderSensitive: false,
    story: {
      character: 'Nyx Varath',
      message: "Sector 2 just came online — Population records this time. Before we go any further, I need one number: how many people are actually archived in here. Alias it total_employees.",
      hint: "Use COUNT(*) AS total_employees to count all rows with a named column."
    },
    task: "Give me one number: the total headcount, aliased as total_employees.",
    schema: EMPLOYEES_SCHEMA,
    expectedQuery: `SELECT COUNT(*) AS total_employees FROM employees`,
    initialQuery: `SELECT COUNT(*) AS total_employees FROM employees`
  },
  {
    id: 7,
    title: 'The Sector Breakdown',
    xpReward: 400,
    orderSensitive: false,
    story: {
      character: 'Nyx Varath',
      message: "The old org chart doesn't match anything I've seen on the ground. I need to know exactly how many people were assigned to each department when the records froze. One row per department, count column labelled headcount.",
      hint: "Use GROUP BY dept with COUNT(*) AS headcount to aggregate by department."
    },
    task: "Break the headcount down by department — one row each, count aliased as headcount.",
    schema: EMPLOYEES_SCHEMA,
    expectedQuery: `SELECT dept, COUNT(*) AS headcount FROM employees GROUP BY dept`,
    initialQuery: `SELECT dept, COUNT(*) AS headcount FROM employees GROUP BY `
  },
  {
    id: 8,
    title: 'Cross-Referenced',
    xpReward: 500,
    orderSensitive: false,
    story: {
      character: 'Nyx Varath',
      message: "If the wall split families the way it split this city, the building assignment might tell us who ended up on which side. Cross-reference every name with their department's location — you'll need to join the two tables.",
      hint: "Use INNER JOIN departments d ON e.dept_id = d.id to combine the two tables."
    },
    task: "Cross-reference every employee's name and salary with their department's location.",
    schema: JOIN_SCHEMA,
    expectedQuery: `SELECT e.name, e.salary, d.location FROM employees e INNER JOIN departments d ON e.dept_id = d.id`,
    initialQuery: `SELECT e.name, e.salary, d.location\nFROM employees e\nINNER JOIN departments d ON `
  },
  {
    id: 9,
    title: 'Above the Average',
    xpReward: 600,
    orderSensitive: false,
    story: {
      character: 'Nyx Varath',
      message: "Vex thinks the Council watched anyone whose authority sat above the sector average most closely. Find everyone earning more than the average — you'll need a subquery to calculate that average inside your WHERE clause.",
      hint: "Use WHERE salary > (SELECT AVG(salary) FROM employees) as your filter."
    },
    task: "Find everyone earning above the average salary — name and salary only.",
    schema: EMPLOYEES_SCHEMA,
    expectedQuery: `SELECT name, salary FROM employees WHERE salary > (SELECT AVG(salary) FROM employees)`,
    initialQuery: `SELECT name, salary FROM employees\nWHERE salary > `
  },
  {
    id: 10,
    title: 'Sector 2: Restored',
    xpReward: 750,
    orderSensitive: false,
    story: {
      character: 'Nyx Varath',
      message: "Last check before Sector 2 is fully restored. I need each restoration project's name and team size — including the ones nobody's assigned to anymore. Don't lose the empty ones; a zero is still evidence.",
      hint: "LEFT JOIN assignments a ON p.id = a.project_id, then GROUP BY p.id, p.name with COUNT(a.employee_id)."
    },
    task: "Give me every project's name and team size, aliased as team_size — even the empty ones.",
    schema: PROJECTS_SCHEMA,
    expectedQuery: `SELECT p.name, COUNT(a.employee_id) AS team_size FROM projects p LEFT JOIN assignments a ON p.id = a.project_id GROUP BY p.id, p.name`,
    initialQuery: `SELECT p.name, COUNT(a.employee_id) AS team_size\nFROM projects p\nLEFT JOIN assignments a ON p.id = a.project_id\nGROUP BY `
  },

  // ── Arc 3: The Underground Market ──────────────────────────────────────
  {
    id: 11,
    title: 'The Underloom Ledger',
    xpReward: 850,
    orderSensitive: false,
    story: {
      character: 'Vex Draith',
      message: "Welcome to the Underloom. Before I show you anything real, prove you can read a ledger. I trade in three kinds of fragments — but I've got a hundred transactions logged and I've lost track of which types I even still deal in. Tell me the unique fragment types moving through my network.",
      hint: "Use SELECT DISTINCT column FROM tablename to remove duplicate values."
    },
    task: "Just the distinct fragment_type values moving through my ledger.",
    schema: UNDERLOOM_SCHEMA,
    expectedQuery: `SELECT DISTINCT fragment_type FROM underloom_transactions`,
    initialQuery: `SELECT DISTINCT  FROM underloom_transactions`
  },
  {
    id: 12,
    title: 'The Pattern in the Aliases',
    xpReward: 950,
    orderSensitive: false,
    story: {
      character: 'Vex Draith',
      message: "One buyer network keeps coming back under different names, but they all share a tell — every alias has 'eye' somewhere in it. Find every transaction where the buyer_alias contains 'eye'. I want to know how deep this goes.",
      hint: "Use WHERE column LIKE '%eye%' to match any alias containing that substring."
    },
    task: "Every transaction where buyer_alias contains 'eye' — that's the tell.",
    schema: UNDERLOOM_SCHEMA,
    expectedQuery: `SELECT * FROM underloom_transactions WHERE buyer_alias LIKE '%eye%'`,
    initialQuery: `SELECT * FROM underloom_transactions WHERE buyer_alias LIKE `
  },
  {
    id: 13,
    title: 'Who Buys Too Much',
    xpReward: 1050,
    orderSensitive: false,
    story: {
      character: 'Vex Draith',
      message: "Somebody's accumulating more fragments than a casual buyer should. Group my transactions by buyer_alias, count how many each one has made, and only show me the ones with more than one purchase. That's my suspect list.",
      hint: "GROUP BY buyer_alias, then filter the grouped results with HAVING COUNT(*) > 1 — HAVING filters groups, WHERE can't."
    },
    task: "Group by buyer_alias, count their purchases as purchase_count, keep only the ones over one.",
    schema: UNDERLOOM_SCHEMA,
    expectedQuery: `SELECT buyer_alias, COUNT(*) AS purchase_count FROM underloom_transactions GROUP BY buyer_alias HAVING COUNT(*) > 1`,
    initialQuery: `SELECT buyer_alias, COUNT(*) AS purchase_count\nFROM underloom_transactions\nGROUP BY buyer_alias\nHAVING `
  },
  {
    id: 14,
    title: 'The Query Duel',
    xpReward: 1200,
    orderSensitive: false,
    story: {
      character: 'Vex Draith',
      message: "Same data, same goal — first correct result wins. Find every medical record in market_medical_records that has NO matching entry in verified_medical_baseline. Those are the ones being sold as complete when they're really unverified fragments. Don't hesitate.",
      hint: "Use WHERE NOT EXISTS (SELECT 1 FROM verified_medical_baseline v WHERE v.record_id = m.record_id)."
    },
    task: "Every medical record with no matching entry in verified_medical_baseline — record_id, patient_code, diagnosis_fragment.",
    schema: MEDICAL_VERIFY_SCHEMA,
    expectedQuery: `SELECT record_id, patient_code, diagnosis_fragment FROM market_medical_records m WHERE NOT EXISTS (SELECT 1 FROM verified_medical_baseline v WHERE v.record_id = m.record_id)`,
    initialQuery: `SELECT record_id, patient_code, diagnosis_fragment\nFROM market_medical_records m\nWHERE NOT EXISTS (\n  SELECT 1 FROM verified_medical_baseline v WHERE v.record_id = m.record_id\n)`
  },
  {
    id: 15,
    title: 'CASE Files',
    xpReward: 1350,
    orderSensitive: false,
    story: {
      character: 'Vex Draith',
      message: "To get past the next checkpoint I need my inventory classified by risk: any lineage_record from before year 160 is high risk, any medical_record is medium risk, everything else is low risk. Get this wrong and it's my neck, not yours.",
      hint: "Use CASE WHEN condition THEN value ... ELSE value END AS risk_level."
    },
    task: "Classify each fragment by risk_level: lineage_record before year 160 is high risk, medical_record is medium risk, everything else low risk.",
    schema: UNDERLOOM_INVENTORY_SCHEMA,
    expectedQuery: `SELECT fragment_id, CASE WHEN fragment_type = 'lineage_record' AND record_year < 160 THEN 'high risk' WHEN fragment_type = 'medical_record' THEN 'medium risk' ELSE 'low risk' END AS risk_level FROM underloom_inventory`,
    initialQuery: `SELECT fragment_id,\n  CASE\n    WHEN fragment_type = 'lineage_record' AND record_year < 160 THEN 'high risk'\n    WHEN fragment_type = 'medical_record' THEN 'medium risk'\n    ELSE 'low risk'\n  END AS risk_level\nFROM underloom_inventory`
  },
  {
    id: 16,
    title: 'Sector 3 Commerce: Restored',
    xpReward: 1500,
    orderSensitive: true,
    story: {
      character: 'Vex Draith',
      message: "Last one. Somewhere in commerce_records are assets registered to entities the Null Event erased — but only the ones with a living, confirmed heir actually matter. Find those records, highest value first. If the Serrin estate is on that list, we're both about to have a very bad week.",
      hint: "Use WHERE registered_entity_id IN (SELECT entity_id FROM void_entities WHERE erasure_reason = 'null_event' AND heir_status = 'living_confirmed'), then ORDER BY estimated_value DESC."
    },
    task: "Assets tied to a null_event entity with a living_confirmed heir — record_id, entity_name, asset_type, estimated_value, highest value first.",
    schema: COMMERCE_VOID_SCHEMA,
    expectedQuery: `SELECT record_id, entity_name, asset_type, estimated_value FROM commerce_records WHERE registered_entity_id IN (SELECT entity_id FROM void_entities WHERE erasure_reason = 'null_event' AND heir_status = 'living_confirmed') ORDER BY estimated_value DESC`,
    initialQuery: `SELECT record_id, entity_name, asset_type, estimated_value\nFROM commerce_records\nWHERE registered_entity_id IN (\n  SELECT entity_id FROM void_entities\n  WHERE erasure_reason = 'null_event' AND heir_status = \n)\nORDER BY `
  }
]

const ARC_LEVEL_RANGES: ReadonlyArray<readonly [number, number]> = [
  [1, 5],
  [6, 10],
  [11, 16],
  [17, 21],
  [22, 26],
  [27, 31],
  [32, 40],
]

/** Which story arc a level belongs to. Kept in shared code so the API and UI agree. */
export function levelArcId(levelId: number): number {
  const index = ARC_LEVEL_RANGES.findIndex(([min, max]) => levelId >= min && levelId <= max)
  return index === -1 ? 1 : index + 1
}
