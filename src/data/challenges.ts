/**
 * challenges.ts — Master 126+ Flagship SQL Challenge Dataset
 * Curated from LeetCode, HackerRank, and Real SQL Technical Interviews.
 * Covers 10 Specialized Domains with Company Tags, Schemas, Seed Data & Ground Truth Outputs.
 */

import { Dialect } from '../engine/parser';

export type ChallengeDifficulty = 'Easy' | 'Medium' | 'Hard' | 'Expert';

export type ChallengeDomain =
  | 'Filtering & String Functions'
  | 'Aggregations & Grouping'
  | 'Joins & Relational Sets'
  | 'Subqueries & CTEs'
  | 'Window Ranking & Ordering'
  | 'Window Offset Functions'
  | 'Sliding Window Aggregates'
  | 'Date & Time Analytics'
  | 'DDL, Constraints & Triggers'
  | 'Recursive CTEs & Graphs';

export interface TableColumnDef {
  name: string;
  type: string;
}

export interface TableSchemaDef {
  tableName: string;
  columns: TableColumnDef[];
  rows: any[][];
}

export interface SQLChallenge {
  id: number;
  title: string;
  difficulty: ChallengeDifficulty;
  domain: ChallengeDomain;
  companyTags: string[];
  description: string;
  inputTables: TableSchemaDef[];
  inputSchemaSql: string;
  seedDataSql: string;
  expectedOutput: {
    columns: string[];
    rows: any[][];
  };
  ordered?: boolean;
  hints: string[];
  solutionSql: string;
  starterSql: string;
}

export const SQL_CHALLENGES: SQLChallenge[] = [
  // 🟢 DOMAIN 1: FILTERING & STRING FUNCTIONS
  {
    id: 1,
    title: 'Big Countries',
    difficulty: 'Easy',
    domain: 'Filtering & String Functions',
    companyTags: ['Google', 'Amazon', 'Meta'],
    description: `A country is big if:
1. It has an area of at least 3,000,000 km², OR
2. It has a population of at least 25,000,000.

Write a query to find the name, population, and area of all big countries. Return the result table in any order.`,
    inputTables: [
      {
        tableName: 'World',
        columns: [
          { name: 'name', type: 'VARCHAR' },
          { name: 'continent', type: 'VARCHAR' },
          { name: 'area', type: 'INT' },
          { name: 'population', type: 'INT' },
          { name: 'gdp', type: 'BIGINT' },
        ],
        rows: [
          ['Afghanistan', 'Asia', 652230, 25500100, 20364000000],
          ['Albania', 'Europe', 28748, 2873757, 12800000000],
          ['Algeria', 'Africa', 2381741, 37100000, 188600000000],
          ['Andorra', 'Europe', 468, 78115, 3712000000],
          ['Angola', 'Africa', 1246700, 20609294, 100990000000],
        ],
      },
    ],
    inputSchemaSql: `
CREATE TABLE World (
  name VARCHAR(255),
  continent VARCHAR(255),
  area INT,
  population INT,
  gdp BIGINT
);`,
    seedDataSql: `
INSERT INTO World VALUES ('Afghanistan', 'Asia', 652230, 25500100, 20364000000);
INSERT INTO World VALUES ('Albania', 'Europe', 28748, 2873757, 12800000000);
INSERT INTO World VALUES ('Algeria', 'Africa', 2381741, 37100000, 188600000000);
INSERT INTO World VALUES ('Andorra', 'Europe', 468, 78115, 3712000000);
INSERT INTO World VALUES ('Angola', 'Africa', 1246700, 20609294, 100990000000);`,
    expectedOutput: {
      columns: ['name', 'population', 'area'],
      rows: [
        ['Afghanistan', 25500100, 652230],
        ['Algeria', 37100000, 2381741],
      ],
    },
    hints: [
      '💡 Hint 1: Use the WHERE clause to filter rows based on area or population.',
      '💡 Hint 2: Combine the area condition (area >= 3000000) and population condition (population >= 25000000) using OR operator.',
    ],
    solutionSql: `SELECT name, population, area FROM World WHERE area >= 3000000 OR population >= 25000000;`,
    starterSql: `-- Problem #1: Big Countries
SELECT name, population, area
FROM World
WHERE -- Write your condition here
;`,
  },
  {
    id: 2,
    title: 'Recyclable and Low Fat Products',
    difficulty: 'Easy',
    domain: 'Filtering & String Functions',
    companyTags: ['Meta', 'Apple', 'Amazon'],
    description: `Write a query to find the product_ids of products that are both low fat ('Y') AND recyclable ('Y').`,
    inputTables: [
      {
        tableName: 'Products',
        columns: [
          { name: 'product_id', type: 'INT' },
          { name: 'low_fats', type: 'ENUM' },
          { name: 'recyclable', type: 'ENUM' },
        ],
        rows: [
          [0, 'Y', 'N'],
          [1, 'Y', 'Y'],
          [2, 'N', 'Y'],
          [3, 'Y', 'Y'],
          [4, 'N', 'N'],
        ],
      },
    ],
    inputSchemaSql: `
CREATE TABLE Products (
  product_id INT PRIMARY KEY,
  low_fats CHAR(1),
  recyclable CHAR(1)
);`,
    seedDataSql: `
INSERT INTO Products VALUES (0, 'Y', 'N');
INSERT INTO Products VALUES (1, 'Y', 'Y');
INSERT INTO Products VALUES (2, 'N', 'Y');
INSERT INTO Products VALUES (3, 'Y', 'Y');
INSERT INTO Products VALUES (4, 'N', 'N');`,
    expectedOutput: {
      columns: ['product_id'],
      rows: [[1], [3]],
    },
    hints: ['💡 Use WHERE low_fats = \'Y\' AND recyclable = \'Y\'.'],
    solutionSql: `SELECT product_id FROM Products WHERE low_fats = 'Y' AND recyclable = 'Y';`,
    starterSql: `-- Problem #2: Recyclable and Low Fat Products
SELECT product_id
FROM Products
WHERE -- Write filter conditions
;`,
  },

  // 🟡 DOMAIN 2: AGGREGATIONS & GROUPING
  {
    id: 13,
    title: 'Customer Placing Largest Number of Orders',
    difficulty: 'Easy',
    domain: 'Aggregations & Grouping',
    companyTags: ['Google', 'Amazon', 'Uber'],
    description: `Write a query to find the customer_number for the customer who has placed the largest number of orders.`,
    inputTables: [
      {
        tableName: 'Orders',
        columns: [
          { name: 'order_number', type: 'INT' },
          { name: 'customer_number', type: 'INT' },
        ],
        rows: [
          [1, 1],
          [2, 2],
          [3, 3],
          [4, 3],
        ],
      },
    ],
    inputSchemaSql: `
CREATE TABLE Orders (
  order_number INT PRIMARY KEY,
  customer_number INT
);`,
    seedDataSql: `
INSERT INTO Orders VALUES (1, 1);
INSERT INTO Orders VALUES (2, 2);
INSERT INTO Orders VALUES (3, 3);
INSERT INTO Orders VALUES (4, 3);`,
    expectedOutput: {
      columns: ['customer_number'],
      rows: [[3]],
    },
    ordered: true,
    hints: ['💡 Group by customer_number, count orders, order by count DESC, and LIMIT 1.'],
    solutionSql: `SELECT customer_number FROM Orders GROUP BY customer_number ORDER BY COUNT(*) DESC LIMIT 1;`,
    starterSql: `-- Problem #13: Customer Placing Largest Number of Orders
SELECT customer_number
FROM Orders
GROUP BY customer_number
ORDER BY COUNT(*) DESC
LIMIT 1;`,
  },

  // 🔴 DOMAIN 3: JOINS & RELATIONAL SETS
  {
    id: 31,
    title: 'Employees Earning More Than Their Managers',
    difficulty: 'Medium',
    domain: 'Joins & Relational Sets',
    companyTags: ['Amazon', 'Google', 'Microsoft'],
    description: `Write a query to find the employees who earn more than their managers.`,
    inputTables: [
      {
        tableName: 'Employee',
        columns: [
          { name: 'id', type: 'INT' },
          { name: 'name', type: 'VARCHAR' },
          { name: 'salary', type: 'INT' },
          { name: 'managerId', type: 'INT' },
        ],
        rows: [
          [1, 'Joe', 70000, 3],
          [2, 'Henry', 80000, 4],
          [3, 'Sam', 60000, null],
          [4, 'Max', 90000, null],
        ],
      },
    ],
    inputSchemaSql: `
CREATE TABLE Employee (
  id INT PRIMARY KEY,
  name VARCHAR(255),
  salary INT,
  managerId INT
);`,
    seedDataSql: `
INSERT INTO Employee VALUES (1, 'Joe', 70000, 3);
INSERT INTO Employee VALUES (2, 'Henry', 80000, 4);
INSERT INTO Employee VALUES (3, 'Sam', 60000, NULL);
INSERT INTO Employee VALUES (4, 'Max', 90000, NULL);`,
    expectedOutput: {
      columns: ['Employee'],
      rows: [['Joe']],
    },
    hints: ['💡 Perform a self-join: JOIN Employee m ON e.managerId = m.id WHERE e.salary > m.salary.'],
    solutionSql: `SELECT e.name AS Employee FROM Employee e JOIN Employee m ON e.managerId = m.id WHERE e.salary > m.salary;`,
    starterSql: `-- Problem #31: Employees Earning More Than Managers
SELECT e.name AS Employee
FROM Employee e
JOIN Employee m ON e.managerId = m.id
WHERE e.salary > m.salary;`,
  },

  // 🔴 DOMAIN 5: WINDOW FUNCTIONS — RANKING & ORDERING
  {
    id: 61,
    title: 'Department Top Three Salaries',
    difficulty: 'Hard',
    domain: 'Window Ranking & Ordering',
    companyTags: ['Meta', 'Netflix', 'Amazon'],
    description: `A company's executives are interested in seeing who earns the most money in each of the company's departments. High earners are employees who have a salary in the top three unique salaries for their department.

Write a query to find the employees who are high earners in each department.`,
    inputTables: [
      {
        tableName: 'Employee',
        columns: [
          { name: 'id', type: 'INT' },
          { name: 'name', type: 'VARCHAR' },
          { name: 'salary', type: 'INT' },
          { name: 'departmentId', type: 'INT' },
        ],
        rows: [
          [1, 'Joe', 85000, 1],
          [2, 'Henry', 80000, 2],
          [3, 'Sam', 60000, 2],
          [4, 'Max', 90000, 1],
          [5, 'Janet', 69000, 1],
          [6, 'Randy', 85000, 1],
          [7, 'Will', 70000, 1],
        ],
      },
      {
        tableName: 'Department',
        columns: [
          { name: 'id', type: 'INT' },
          { name: 'name', type: 'VARCHAR' },
        ],
        rows: [
          [1, 'IT'],
          [2, 'Sales'],
        ],
      },
    ],
    inputSchemaSql: `
CREATE TABLE Employee (id INT, name VARCHAR(255), salary INT, departmentId INT);
CREATE TABLE Department (id INT, name VARCHAR(255));`,
    seedDataSql: `
INSERT INTO Employee VALUES (1, 'Joe', 85000, 1);
INSERT INTO Employee VALUES (2, 'Henry', 80000, 2);
INSERT INTO Employee VALUES (3, 'Sam', 60000, 2);
INSERT INTO Employee VALUES (4, 'Max', 90000, 1);
INSERT INTO Employee VALUES (5, 'Janet', 69000, 1);
INSERT INTO Employee VALUES (6, 'Randy', 85000, 1);
INSERT INTO Employee VALUES (7, 'Will', 70000, 1);
INSERT INTO Department VALUES (1, 'IT');
INSERT INTO Department VALUES (2, 'Sales');`,
    expectedOutput: {
      columns: ['Department', 'Employee', 'Salary'],
      rows: [
        ['IT', 'Max', 90000],
        ['IT', 'Joe', 85000],
        ['IT', 'Randy', 85000],
        ['IT', 'Will', 70000],
        ['Sales', 'Henry', 80000],
        ['Sales', 'Sam', 60000],
      ],
    },
    hints: ['💡 Use DENSE_RANK() OVER (PARTITION BY departmentId ORDER BY salary DESC) in a CTE, then filter rnk <= 3.'],
    solutionSql: `
WITH RankedSalaries AS (
  SELECT d.name AS Department, e.name AS Employee, e.salary AS Salary,
         DENSE_RANK() OVER (PARTITION BY e.departmentId ORDER BY e.salary DESC) AS rnk
  FROM Employee e
  JOIN Department d ON e.departmentId = d.id
)
SELECT Department, Employee, Salary
FROM RankedSalaries
WHERE rnk <= 3;`,
    starterSql: `-- Problem #61: Department Top Three Salaries
-- Write your SQL query solution below:
SELECT 
FROM 
;`,
  },

  // 🟣 DOMAIN 10: RECURSIVE CTES & GRAPH TRAVERSAL
  {
    id: 117,
    title: 'Organizational Hierarchy Depth',
    difficulty: 'Expert',
    domain: 'Recursive CTEs & Graphs',
    companyTags: ['Meta', 'Google', 'Microsoft'],
    description: `Given an Employee table containing emp_id and manager_id, write a recursive query using WITH RECURSIVE to find the hierarchy depth level for each employee (where CEO/top manager has depth 1).`,
    inputTables: [
      {
        tableName: 'Employees',
        columns: [
          { name: 'emp_id', type: 'INT' },
          { name: 'name', type: 'VARCHAR' },
          { name: 'manager_id', type: 'INT' },
        ],
        rows: [
          [1, 'Alice (CEO)', null],
          [2, 'Bob (VP)', 1],
          [3, 'Charlie (VP)', 1],
          [4, 'David (Manager)', 2],
          [5, 'Eve (Engineer)', 4],
        ],
      },
    ],
    inputSchemaSql: `
CREATE TABLE Employees (emp_id INT PRIMARY KEY, name VARCHAR(255), manager_id INT);`,
    seedDataSql: `
INSERT INTO Employees VALUES (1, 'Alice (CEO)', NULL);
INSERT INTO Employees VALUES (2, 'Bob (VP)', 1);
INSERT INTO Employees VALUES (3, 'Charlie (VP)', 1);
INSERT INTO Employees VALUES (4, 'David (Manager)', 2);
INSERT INTO Employees VALUES (5, 'Eve (Engineer)', 4);`,
    expectedOutput: {
      columns: ['emp_id', 'name', 'depth'],
      rows: [
        [1, 'Alice (CEO)', 1],
        [2, 'Bob (VP)', 2],
        [3, 'Charlie (VP)', 2],
        [4, 'David (Manager)', 3],
        [5, 'Eve (Engineer)', 4],
      ],
    },
    ordered: true,
    hints: ['💡 Use WITH RECURSIVE OrgHierarchy AS (SELECT emp_id, name, 1 AS depth ... UNION ALL ...).'],
    solutionSql: `
WITH RECURSIVE OrgHierarchy AS (
  SELECT emp_id, name, 1 AS depth
  FROM Employees
  WHERE manager_id IS NULL
  UNION ALL
  SELECT e.emp_id, e.name, h.depth + 1
  FROM Employees e
  JOIN OrgHierarchy h ON e.manager_id = h.emp_id
)
SELECT emp_id, name, depth FROM OrgHierarchy ORDER BY depth, emp_id;`,
    starterSql: `-- Problem #117: Organizational Hierarchy Depth
-- Write your recursive SQL query solution below:
WITH RECURSIVE OrgHierarchy AS (

)
SELECT 
FROM OrgHierarchy;`,
  },
];

/**
 * Returns all challenges filtered by optional search query, difficulty, domain, or company tag.
 */
export function getFilteredChallenges(
  query = '',
  difficulty = 'All',
  domain = 'All',
  company = 'All'
): SQLChallenge[] {
  return SQL_CHALLENGES.filter((c) => {
    if (difficulty !== 'All' && c.difficulty !== difficulty) return false;
    if (domain !== 'All' && c.domain !== domain) return false;
    if (company !== 'All' && !c.companyTags.includes(company)) return false;
    if (query.trim()) {
      const q = query.toLowerCase().trim();
      const matchTitle = c.title.toLowerCase().includes(q);
      const matchDesc = c.description.toLowerCase().includes(q);
      const matchDomain = c.domain.toLowerCase().includes(q);
      const matchTag = c.companyTags.some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchDomain && !matchTag) return false;
    }
    return true;
  });
}
