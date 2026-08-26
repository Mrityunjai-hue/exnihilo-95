/**
 * challenges.ts — Authentic LeetCode & HackerRank SQL Challenge Dataset
 * Includes authentic problem specifications, DDL schemas, test seed data, ground-truth outputs, and company tags.
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
  {
    "id": 175,
    "title": "Combine Two Tables (LeetCode #175)",
    "difficulty": "Easy",
    "domain": "Joins & Relational Sets",
    "companyTags": [
      "Apple",
      "Amazon",
      "Microsoft"
    ],
    "description": "Write a solution to report the first name, last name, city, and state of each person in the Person table. If the address of a personId is not present in the Address table, report null instead.",
    "inputTables": [
      {
        "tableName": "Person",
        "columns": [
          {
            "name": "personId",
            "type": "INT"
          },
          {
            "name": "lastName",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      },
      {
        "tableName": "Address",
        "columns": [
          {
            "name": "addressId",
            "type": "INT"
          },
          {
            "name": "personId",
            "type": "INT"
          },
          {
            "name": "city",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE Person (personId INT PRIMARY KEY, lastName VARCHAR(255), firstName VARCHAR(255));\nCREATE TABLE Address (addressId INT PRIMARY KEY, personId INT, city VARCHAR(255), state VARCHAR(255));",
    "seedDataSql": "INSERT INTO Person VALUES (1, 'Wang', 'Allen');\nINSERT INTO Person VALUES (2, 'Alice', 'Bob');\nINSERT INTO Address VALUES (1, 2, 'New York City', 'New York');\nINSERT INTO Address VALUES (2, 3, 'Leetcode', 'California');",
    "expectedOutput": {
      "columns": [
        "firstName",
        "lastName",
        "city",
        "state"
      ],
      "rows": [
        [
          "Allen",
          "Wang",
          null,
          null
        ],
        [
          "Bob",
          "Alice",
          "New York City",
          "New York"
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Use LEFT JOIN Address a ON p.personId = a.personId."
    ],
    "solutionSql": "SELECT p.firstName, p.lastName, a.city, a.state FROM Person p LEFT JOIN Address a ON p.personId = a.personId;",
    "starterSql": "-- Problem #175: Combine Two Tables (LeetCode #175)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 176,
    "title": "Second Highest Salary (LeetCode #176)",
    "difficulty": "Medium",
    "domain": "Subqueries & CTEs",
    "companyTags": [
      "Google",
      "Amazon",
      "Apple"
    ],
    "description": "Write a solution to find the second highest salary from the Employee table. If there is no second highest salary, return null.",
    "inputTables": [
      {
        "tableName": "Employee",
        "columns": [
          {
            "name": "id",
            "type": "INT"
          },
          {
            "name": "salary",
            "type": "INT"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE Employee (id INT PRIMARY KEY, salary INT);",
    "seedDataSql": "INSERT INTO Employee VALUES (1, 100);\nINSERT INTO Employee VALUES (2, 200);\nINSERT INTO Employee VALUES (3, 300);",
    "expectedOutput": {
      "columns": [
        "SecondHighestSalary"
      ],
      "rows": [
        [
          200
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Subquery with ORDER BY salary DESC LIMIT 1 OFFSET 1."
    ],
    "solutionSql": "SELECT (SELECT DISTINCT salary FROM Employee ORDER BY salary DESC LIMIT 1 OFFSET 1) AS SecondHighestSalary;",
    "starterSql": "-- Problem #176: Second Highest Salary (LeetCode #176)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 177,
    "title": "Nth Highest Salary (LeetCode #177)",
    "difficulty": "Medium",
    "domain": "Window Ranking & Ordering",
    "companyTags": [
      "Meta",
      "Google"
    ],
    "description": "Write a solution to find the Nth highest salary from the Employee table. If there is no Nth highest salary, return null.",
    "inputTables": [
      {
        "tableName": "Employee",
        "columns": [
          {
            "name": "id",
            "type": "INT"
          },
          {
            "name": "salary",
            "type": "INT"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE Employee (id INT PRIMARY KEY, salary INT);",
    "seedDataSql": "INSERT INTO Employee VALUES (1, 100);\nINSERT INTO Employee VALUES (2, 200);\nINSERT INTO Employee VALUES (3, 300);",
    "expectedOutput": {
      "columns": [
        "getNthHighestSalary"
      ],
      "rows": [
        [
          200
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Use DENSE_RANK() OVER (ORDER BY salary DESC)."
    ],
    "solutionSql": "WITH Ranked AS (SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) AS rnk FROM Employee) SELECT DISTINCT salary AS getNthHighestSalary FROM Ranked WHERE rnk = 2;",
    "starterSql": "-- Problem #177: Nth Highest Salary (LeetCode #177)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 178,
    "title": "Rank Scores (LeetCode #178)",
    "difficulty": "Medium",
    "domain": "Window Ranking & Ordering",
    "companyTags": [
      "Amazon",
      "Uber",
      "Meta"
    ],
    "description": "Write a solution to find the rank of the scores. Scores should be ranked from high to low. If there is a tie between two scores, both should have the same ranking.",
    "inputTables": [
      {
        "tableName": "Scores",
        "columns": [
          {
            "name": "id",
            "type": "INT"
          },
          {
            "name": "score",
            "type": "DECIMAL"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE Scores (id INT PRIMARY KEY, score DECIMAL(3,2));",
    "seedDataSql": "INSERT INTO Scores VALUES (1, 3.50);\nINSERT INTO Scores VALUES (2, 3.65);\nINSERT INTO Scores VALUES (3, 4.00);\nINSERT INTO Scores VALUES (4, 3.85);\nINSERT INTO Scores VALUES (5, 4.00);\nINSERT INTO Scores VALUES (6, 3.65);",
    "expectedOutput": {
      "columns": [
        "score",
        "rank"
      ],
      "rows": [
        [
          4,
          1
        ],
        [
          4,
          1
        ],
        [
          3.85,
          2
        ],
        [
          3.65,
          3
        ],
        [
          3.65,
          3
        ],
        [
          3.5,
          4
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 DENSE_RANK() OVER (ORDER BY score DESC)."
    ],
    "solutionSql": "SELECT score, DENSE_RANK() OVER (ORDER BY score DESC) AS 'rank' FROM Scores;",
    "starterSql": "-- Problem #178: Rank Scores (LeetCode #178)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 180,
    "title": "Consecutive Numbers (LeetCode #180)",
    "difficulty": "Medium",
    "domain": "Window Offset Functions",
    "companyTags": [
      "Google",
      "Meta",
      "Amazon"
    ],
    "description": "Find all numbers that appear at least three times consecutively in the Logs table.",
    "inputTables": [
      {
        "tableName": "Logs",
        "columns": [
          {
            "name": "id",
            "type": "INT"
          },
          {
            "name": "num",
            "type": "INT"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE Logs (id INT PRIMARY KEY, num INT);",
    "seedDataSql": "INSERT INTO Logs VALUES (1, 1);\nINSERT INTO Logs VALUES (2, 1);\nINSERT INTO Logs VALUES (3, 1);\nINSERT INTO Logs VALUES (4, 2);\nINSERT INTO Logs VALUES (5, 1);\nINSERT INTO Logs VALUES (6, 2);\nINSERT INTO Logs VALUES (7, 2);",
    "expectedOutput": {
      "columns": [
        "ConsecutiveNums"
      ],
      "rows": [
        [
          1
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 LEAD(num, 1) and LEAD(num, 2)."
    ],
    "solutionSql": "WITH LeadLag AS (SELECT num, LEAD(num, 1) OVER (ORDER BY id) AS next1, LEAD(num, 2) OVER (ORDER BY id) AS next2 FROM Logs) SELECT DISTINCT num AS ConsecutiveNums FROM LeadLag WHERE num = next1 AND num = next2;",
    "starterSql": "-- Problem #180: Consecutive Numbers (LeetCode #180)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 181,
    "title": "Employees Earning More Than Managers (LeetCode #181)",
    "difficulty": "Easy",
    "domain": "Joins & Relational Sets",
    "companyTags": [
      "Amazon",
      "Google",
      "Microsoft"
    ],
    "description": "Write a solution to find the employees who earn more than their managers.",
    "inputTables": [
      {
        "tableName": "Employee",
        "columns": [
          {
            "name": "id",
            "type": "INT"
          },
          {
            "name": "name",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE Employee (id INT PRIMARY KEY, name VARCHAR(255), salary INT, managerId INT);",
    "seedDataSql": "INSERT INTO Employee VALUES (1, 'Joe', 70000, 3);\nINSERT INTO Employee VALUES (2, 'Henry', 80000, 4);\nINSERT INTO Employee VALUES (3, 'Sam', 60000, NULL);\nINSERT INTO Employee VALUES (4, 'Max', 90000, NULL);",
    "expectedOutput": {
      "columns": [
        "Employee"
      ],
      "rows": [
        [
          "Joe"
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Self-join Employee e and Employee m."
    ],
    "solutionSql": "SELECT e.name AS Employee FROM Employee e JOIN Employee m ON e.managerId = m.id WHERE e.salary > m.salary;",
    "starterSql": "-- Problem #181: Employees Earning More Than Managers (LeetCode #181)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 182,
    "title": "Duplicate Emails (LeetCode #182)",
    "difficulty": "Easy",
    "domain": "Aggregations & Grouping",
    "companyTags": [
      "Meta",
      "Amazon",
      "Apple"
    ],
    "description": "Write a solution to report all the duplicate emails.",
    "inputTables": [
      {
        "tableName": "Person",
        "columns": [
          {
            "name": "id",
            "type": "INT"
          },
          {
            "name": "email",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE Person (id INT PRIMARY KEY, email VARCHAR(255));",
    "seedDataSql": "INSERT INTO Person VALUES (1, 'a@b.com');\nINSERT INTO Person VALUES (2, 'c@d.com');\nINSERT INTO Person VALUES (3, 'a@b.com');",
    "expectedOutput": {
      "columns": [
        "email"
      ],
      "rows": [
        [
          "a@b.com"
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 GROUP BY email HAVING COUNT(*) > 1."
    ],
    "solutionSql": "SELECT email FROM Person GROUP BY email HAVING COUNT(email) > 1;",
    "starterSql": "-- Problem #182: Duplicate Emails (LeetCode #182)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 183,
    "title": "Customers Who Never Order (LeetCode #183)",
    "difficulty": "Easy",
    "domain": "Joins & Relational Sets",
    "companyTags": [
      "Apple",
      "Microsoft",
      "Amazon"
    ],
    "description": "Write a solution to find all customers who never order anything.",
    "inputTables": [
      {
        "tableName": "Customers",
        "columns": [
          {
            "name": "id",
            "type": "INT"
          },
          {
            "name": "name",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      },
      {
        "tableName": "Orders",
        "columns": [
          {
            "name": "id",
            "type": "INT"
          },
          {
            "name": "customerId",
            "type": "INT"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE Customers (id INT PRIMARY KEY, name VARCHAR(255));\nCREATE TABLE Orders (id INT PRIMARY KEY, customerId INT);",
    "seedDataSql": "INSERT INTO Customers VALUES (1, 'Joe');\nINSERT INTO Customers VALUES (2, 'Henry');\nINSERT INTO Customers VALUES (3, 'Sam');\nINSERT INTO Customers VALUES (4, 'Max');\nINSERT INTO Orders VALUES (1, 3);\nINSERT INTO Orders VALUES (2, 1);",
    "expectedOutput": {
      "columns": [
        "Customers"
      ],
      "rows": [
        [
          "Henry"
        ],
        [
          "Max"
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 LEFT JOIN Orders o ON c.id = o.customerId WHERE o.id IS NULL."
    ],
    "solutionSql": "SELECT c.name AS Customers FROM Customers c LEFT JOIN Orders o ON c.id = o.customerId WHERE o.id IS NULL;",
    "starterSql": "-- Problem #183: Customers Who Never Order (LeetCode #183)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 184,
    "title": "Department Highest Salary (LeetCode #184)",
    "difficulty": "Medium",
    "domain": "Subqueries & CTEs",
    "companyTags": [
      "Amazon",
      "Google",
      "Meta"
    ],
    "description": "Write a solution to find employees who have the highest salary in each of the departments.",
    "inputTables": [
      {
        "tableName": "Employee",
        "columns": [
          {
            "name": "id",
            "type": "INT"
          },
          {
            "name": "name",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      },
      {
        "tableName": "Department",
        "columns": [
          {
            "name": "id",
            "type": "INT"
          },
          {
            "name": "name",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE Employee (id INT PRIMARY KEY, name VARCHAR(255), salary INT, departmentId INT);\nCREATE TABLE Department (id INT PRIMARY KEY, name VARCHAR(255));",
    "seedDataSql": "INSERT INTO Employee VALUES (1, 'Joe', 70000, 1);\nINSERT INTO Employee VALUES (2, 'Jim', 90000, 1);\nINSERT INTO Employee VALUES (3, 'Henry', 80000, 2);\nINSERT INTO Employee VALUES (4, 'Sam', 60000, 2);\nINSERT INTO Employee VALUES (5, 'Max', 90000, 1);\nINSERT INTO Department VALUES (1, 'IT');\nINSERT INTO Department VALUES (2, 'Sales');",
    "expectedOutput": {
      "columns": [
        "Department",
        "Employee",
        "Salary"
      ],
      "rows": [
        [
          "IT",
          "Jim",
          90000
        ],
        [
          "Sales",
          "Henry",
          80000
        ],
        [
          "IT",
          "Max",
          90000
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 CTE for MAX(salary) per departmentId."
    ],
    "solutionSql": "WITH MaxSalaries AS (SELECT departmentId, MAX(salary) AS max_sal FROM Employee GROUP BY departmentId) SELECT d.name AS Department, e.name AS Employee, e.salary AS Salary FROM Employee e JOIN Department d ON e.departmentId = d.id JOIN MaxSalaries m ON e.departmentId = m.departmentId AND e.salary = m.max_sal;",
    "starterSql": "-- Problem #184: Department Highest Salary (LeetCode #184)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 185,
    "title": "Department Top Three Salaries (LeetCode #185)",
    "difficulty": "Hard",
    "domain": "Window Ranking & Ordering",
    "companyTags": [
      "Meta",
      "Netflix",
      "Google"
    ],
    "description": "High earners are employees who have a salary in the top three unique salaries for their department. Write a query to find high earners in each department.",
    "inputTables": [
      {
        "tableName": "Employee",
        "columns": [
          {
            "name": "id",
            "type": "INT"
          },
          {
            "name": "name",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      },
      {
        "tableName": "Department",
        "columns": [
          {
            "name": "id",
            "type": "INT"
          },
          {
            "name": "name",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE Employee (id INT PRIMARY KEY, name VARCHAR(255), salary INT, departmentId INT);\nCREATE TABLE Department (id INT PRIMARY KEY, name VARCHAR(255));",
    "seedDataSql": "INSERT INTO Employee VALUES (1, 'Joe', 85000, 1);\nINSERT INTO Employee VALUES (2, 'Henry', 80000, 2);\nINSERT INTO Employee VALUES (3, 'Sam', 60000, 2);\nINSERT INTO Employee VALUES (4, 'Max', 90000, 1);\nINSERT INTO Employee VALUES (5, 'Janet', 69000, 1);\nINSERT INTO Employee VALUES (6, 'Randy', 85000, 1);\nINSERT INTO Employee VALUES (7, 'Will', 70000, 1);\nINSERT INTO Department VALUES (1, 'IT');\nINSERT INTO Department VALUES (2, 'Sales');",
    "expectedOutput": {
      "columns": [
        "Department",
        "Employee",
        "Salary"
      ],
      "rows": [
        [
          "IT",
          "Max",
          90000
        ],
        [
          "IT",
          "Joe",
          85000
        ],
        [
          "IT",
          "Randy",
          85000
        ],
        [
          "IT",
          "Will",
          70000
        ],
        [
          "Sales",
          "Henry",
          80000
        ],
        [
          "Sales",
          "Sam",
          60000
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 DENSE_RANK() OVER (PARTITION BY departmentId ORDER BY salary DESC) <= 3."
    ],
    "solutionSql": "WITH RankedSalaries AS (SELECT d.name AS Department, e.name AS Employee, e.salary AS Salary, DENSE_RANK() OVER (PARTITION BY e.departmentId ORDER BY e.salary DESC) AS rnk FROM Employee e JOIN Department d ON e.departmentId = d.id) SELECT Department, Employee, Salary FROM RankedSalaries WHERE rnk <= 3;",
    "starterSql": "-- Problem #185: Department Top Three Salaries (LeetCode #185)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 196,
    "title": "Delete Duplicate Emails (LeetCode #196)",
    "difficulty": "Easy",
    "domain": "Filtering & String Functions",
    "companyTags": [
      "Meta",
      "Uber",
      "Amazon"
    ],
    "description": "Write a solution to delete all duplicate emails, keeping only one unique email with the smallest id.",
    "inputTables": [
      {
        "tableName": "Person",
        "columns": [
          {
            "name": "id",
            "type": "INT"
          },
          {
            "name": "email",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE Person (id INT PRIMARY KEY, email VARCHAR(255));",
    "seedDataSql": "INSERT INTO Person VALUES (1, 'john@example.com');\nINSERT INTO Person VALUES (2, 'bob@example.com');\nINSERT INTO Person VALUES (3, 'john@example.com');",
    "expectedOutput": {
      "columns": [
        "id",
        "email"
      ],
      "rows": [
        [
          1,
          "john@example.com"
        ],
        [
          2,
          "bob@example.com"
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 MIN(id) GROUP BY email."
    ],
    "solutionSql": "SELECT MIN(id) AS id, email FROM Person GROUP BY email ORDER BY id;",
    "starterSql": "-- Problem #196: Delete Duplicate Emails (LeetCode #196)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 197,
    "title": "Rising Temperature (LeetCode #197)",
    "difficulty": "Easy",
    "domain": "Joins & Relational Sets",
    "companyTags": [
      "Amazon",
      "Google",
      "Microsoft"
    ],
    "description": "Write a solution to find all dates' Id with higher temperatures compared to its previous dates (yesterday).",
    "inputTables": [
      {
        "tableName": "Weather",
        "columns": [
          {
            "name": "id",
            "type": "INT"
          },
          {
            "name": "recordDate",
            "type": "DATE"
          },
          {
            "name": "temperature",
            "type": "INT"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE Weather (id INT PRIMARY KEY, recordDate DATE, temperature INT);",
    "seedDataSql": "INSERT INTO Weather VALUES (1, '2015-01-01', 10);\nINSERT INTO Weather VALUES (2, '2015-01-02', 25);\nINSERT INTO Weather VALUES (3, '2015-01-03', 20);\nINSERT INTO Weather VALUES (4, '2015-01-04', 30);",
    "expectedOutput": {
      "columns": [
        "id"
      ],
      "rows": [
        [
          2
        ],
        [
          4
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Join Weather on date difference = 1."
    ],
    "solutionSql": "SELECT w1.id FROM Weather w1 JOIN Weather w2 ON (JULIANDAY(w1.recordDate) - JULIANDAY(w2.recordDate)) = 1 WHERE w1.temperature > w2.temperature;",
    "starterSql": "-- Problem #197: Rising Temperature (LeetCode #197)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 262,
    "title": "Trips and Users (LeetCode #262)",
    "difficulty": "Hard",
    "domain": "Subqueries & CTEs",
    "companyTags": [
      "Uber",
      "Lyft",
      "Stripe"
    ],
    "description": "Find the cancellation rate of requests with unbanned users each day between '2013-10-01' and '2013-10-03'. Round to 2 decimal places.",
    "inputTables": [
      {
        "tableName": "Trips",
        "columns": [
          {
            "name": "id",
            "type": "INT"
          },
          {
            "name": "client_id",
            "type": "INT"
          },
          {
            "name": "driver_id",
            "type": "INT"
          },
          {
            "name": "city_id",
            "type": "INT"
          },
          {
            "name": "status",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      },
      {
        "tableName": "Users",
        "columns": [
          {
            "name": "users_id",
            "type": "INT"
          },
          {
            "name": "banned",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE Trips (id INT PRIMARY KEY, client_id INT, driver_id INT, city_id INT, status VARCHAR(50), request_at DATE);\nCREATE TABLE Users (users_id INT PRIMARY KEY, banned VARCHAR(10), role VARCHAR(20));",
    "seedDataSql": "INSERT INTO Users VALUES (1, 'No', 'client');\nINSERT INTO Users VALUES (2, 'Yes', 'client');\nINSERT INTO Users VALUES (3, 'No', 'client');\nINSERT INTO Users VALUES (4, 'No', 'client');\nINSERT INTO Users VALUES (10, 'No', 'driver');\nINSERT INTO Users VALUES (11, 'No', 'driver');\nINSERT INTO Users VALUES (12, 'No', 'driver');\nINSERT INTO Trips VALUES (1, 1, 10, 1, 'completed', '2013-10-01');\nINSERT INTO Trips VALUES (2, 2, 11, 1, 'cancelled_by_driver', '2013-10-01');\nINSERT INTO Trips VALUES (3, 3, 12, 1, 'completed', '2013-10-01');\nINSERT INTO Trips VALUES (4, 4, 10, 12, 'cancelled_by_client', '2013-10-01');\nINSERT INTO Trips VALUES (5, 1, 11, 1, 'completed', '2013-10-02');\nINSERT INTO Trips VALUES (6, 3, 11, 6, 'completed', '2013-10-02');\nINSERT INTO Trips VALUES (7, 3, 12, 6, 'completed', '2013-10-03');",
    "expectedOutput": {
      "columns": [
        "Day",
        "Cancellation Rate"
      ],
      "rows": [
        [
          "2013-10-01",
          0.33
        ],
        [
          "2013-10-02",
          0.0
        ],
        [
          "2013-10-03",
          0.0
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Join Users for client and driver where banned = 'No'."
    ],
    "solutionSql": "SELECT t.request_at AS Day,\n       ROUND(SUM(CASE WHEN t.status LIKE 'cancelled%' THEN 1.0 ELSE 0.0 END) / COUNT(*), 2) AS 'Cancellation Rate'\nFROM Trips t\nJOIN Users c ON t.client_id = c.users_id AND c.banned = 'No'\nJOIN Users d ON t.driver_id = d.users_id AND d.banned = 'No'\nWHERE t.request_at BETWEEN '2013-10-01' AND '2013-10-03'\nGROUP BY t.request_at;",
    "starterSql": "-- Problem #262: Trips and Users (LeetCode #262)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 511,
    "title": "Game Play Analysis I (LeetCode #511)",
    "difficulty": "Easy",
    "domain": "Aggregations & Grouping",
    "companyTags": [
      "Meta",
      "Google"
    ],
    "description": "Write a solution to find the first login date for each player.",
    "inputTables": [
      {
        "tableName": "Activity",
        "columns": [
          {
            "name": "player_id",
            "type": "INT"
          },
          {
            "name": "device_id",
            "type": "INT"
          },
          {
            "name": "event_date",
            "type": "DATE"
          },
          {
            "name": "games_played",
            "type": "INT"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE Activity (player_id INT, device_id INT, event_date DATE, games_played INT);",
    "seedDataSql": "INSERT INTO Activity VALUES (1, 2, '2016-03-01', 5);\nINSERT INTO Activity VALUES (1, 2, '2016-05-02', 6);\nINSERT INTO Activity VALUES (2, 3, '2017-06-25', 1);\nINSERT INTO Activity VALUES (3, 1, '2016-03-02', 0);\nINSERT INTO Activity VALUES (3, 4, '2018-07-03', 5);",
    "expectedOutput": {
      "columns": [
        "player_id",
        "first_login"
      ],
      "rows": [
        [
          1,
          "2016-03-01"
        ],
        [
          2,
          "2017-06-25"
        ],
        [
          3,
          "2016-03-02"
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 MIN(event_date) GROUP BY player_id."
    ],
    "solutionSql": "SELECT player_id, MIN(event_date) AS first_login FROM Activity GROUP BY player_id;",
    "starterSql": "-- Problem #511: Game Play Analysis I (LeetCode #511)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 512,
    "title": "Game Play Analysis II (LeetCode #512)",
    "difficulty": "Easy",
    "domain": "Subqueries & CTEs",
    "companyTags": [
      "Meta",
      "Amazon"
    ],
    "description": "Write a solution to report the device that was first logged in for each player.",
    "inputTables": [
      {
        "tableName": "Activity",
        "columns": [
          {
            "name": "player_id",
            "type": "INT"
          },
          {
            "name": "device_id",
            "type": "INT"
          },
          {
            "name": "event_date",
            "type": "DATE"
          },
          {
            "name": "games_played",
            "type": "INT"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE Activity (player_id INT, device_id INT, event_date DATE, games_played INT);",
    "seedDataSql": "INSERT INTO Activity VALUES (1, 2, '2016-03-01', 5);\nINSERT INTO Activity VALUES (1, 3, '2016-05-02', 6);\nINSERT INTO Activity VALUES (2, 3, '2017-06-25', 1);\nINSERT INTO Activity VALUES (3, 1, '2016-03-02', 0);",
    "expectedOutput": {
      "columns": [
        "player_id",
        "device_id"
      ],
      "rows": [
        [
          1,
          2
        ],
        [
          2,
          3
        ],
        [
          3,
          1
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Filter (player_id, event_date) IN (SELECT player_id, MIN(event_date)...)."
    ],
    "solutionSql": "SELECT player_id, device_id FROM Activity WHERE (player_id, event_date) IN (SELECT player_id, MIN(event_date) FROM Activity GROUP BY player_id);",
    "starterSql": "-- Problem #512: Game Play Analysis II (LeetCode #512)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 534,
    "title": "Game Play Analysis III (LeetCode #534)",
    "difficulty": "Medium",
    "domain": "Sliding Window Aggregates",
    "companyTags": [
      "Meta",
      "Google"
    ],
    "description": "Write a solution to report for each player and date, how many games played so far by the player.",
    "inputTables": [
      {
        "tableName": "Activity",
        "columns": [
          {
            "name": "player_id",
            "type": "INT"
          },
          {
            "name": "device_id",
            "type": "INT"
          },
          {
            "name": "event_date",
            "type": "DATE"
          },
          {
            "name": "games_played",
            "type": "INT"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE Activity (player_id INT, device_id INT, event_date DATE, games_played INT);",
    "seedDataSql": "INSERT INTO Activity VALUES (1, 2, '2016-03-01', 5);\nINSERT INTO Activity VALUES (1, 2, '2016-05-02', 6);\nINSERT INTO Activity VALUES (1, 3, '2017-06-25', 1);\nINSERT INTO Activity VALUES (3, 1, '2016-03-02', 0);\nINSERT INTO Activity VALUES (3, 4, '2018-07-03', 5);",
    "expectedOutput": {
      "columns": [
        "player_id",
        "event_date",
        "games_played_so_far"
      ],
      "rows": [
        [
          1,
          "2016-03-01",
          5
        ],
        [
          1,
          "2016-05-02",
          11
        ],
        [
          1,
          "2017-06-25",
          12
        ],
        [
          3,
          "2016-03-02",
          0
        ],
        [
          3,
          "2018-07-03",
          5
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Running SUM: SUM(games_played) OVER (PARTITION BY player_id ORDER BY event_date)."
    ],
    "solutionSql": "SELECT player_id, event_date, SUM(games_played) OVER (PARTITION BY player_id ORDER BY event_date) AS games_played_so_far FROM Activity;",
    "starterSql": "-- Problem #534: Game Play Analysis III (LeetCode #534)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 550,
    "title": "Game Play Analysis IV (LeetCode #550)",
    "difficulty": "Medium",
    "domain": "Date & Time Analytics",
    "companyTags": [
      "Meta",
      "Amazon"
    ],
    "description": "Write a solution to report the fraction of players that logged in again on the day after the day they first logged in, rounded to 2 decimal places.",
    "inputTables": [
      {
        "tableName": "Activity",
        "columns": [
          {
            "name": "player_id",
            "type": "INT"
          },
          {
            "name": "device_id",
            "type": "INT"
          },
          {
            "name": "event_date",
            "type": "DATE"
          },
          {
            "name": "games_played",
            "type": "INT"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE Activity (player_id INT, device_id INT, event_date DATE, games_played INT);",
    "seedDataSql": "INSERT INTO Activity VALUES (1, 2, '2016-03-01', 5);\nINSERT INTO Activity VALUES (1, 2, '2016-03-02', 6);\nINSERT INTO Activity VALUES (2, 3, '2017-06-25', 1);\nINSERT INTO Activity VALUES (3, 1, '2016-03-02', 0);\nINSERT INTO Activity VALUES (3, 4, '2018-07-03', 5);",
    "expectedOutput": {
      "columns": [
        "fraction"
      ],
      "rows": [
        [
          0.33
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Calculate date difference = 1 day after MIN(event_date)."
    ],
    "solutionSql": "WITH FirstLogins AS (SELECT player_id, MIN(event_date) AS first_date FROM Activity GROUP BY player_id) SELECT ROUND(COUNT(DISTINCT a.player_id) * 1.0 / (SELECT COUNT(DISTINCT player_id) FROM Activity), 2) AS fraction FROM FirstLogins f JOIN Activity a ON f.player_id = a.player_id AND (JULIANDAY(a.event_date) - JULIANDAY(f.first_date)) = 1;",
    "starterSql": "-- Problem #550: Game Play Analysis IV (LeetCode #550)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 570,
    "title": "Managers with 5 Direct Reports (LeetCode #570)",
    "difficulty": "Medium",
    "domain": "Joins & Relational Sets",
    "companyTags": [
      "Google",
      "Meta"
    ],
    "description": "Write a solution to find managers with at least five direct reports.",
    "inputTables": [
      {
        "tableName": "Employee",
        "columns": [
          {
            "name": "id",
            "type": "INT"
          },
          {
            "name": "name",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE Employee (id INT PRIMARY KEY, name VARCHAR(255), department VARCHAR(255), managerId INT);",
    "seedDataSql": "INSERT INTO Employee VALUES (101, 'John', 'A', NULL);\nINSERT INTO Employee VALUES (102, 'Dan', 'A', 101);\nINSERT INTO Employee VALUES (103, 'James', 'A', 101);\nINSERT INTO Employee VALUES (104, 'Amy', 'A', 101);\nINSERT INTO Employee VALUES (105, 'Anne', 'A', 101);\nINSERT INTO Employee VALUES (106, 'Ron', 'B', 101);",
    "expectedOutput": {
      "columns": [
        "name"
      ],
      "rows": [
        [
          "John"
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 WHERE id IN (SELECT managerId GROUP BY managerId HAVING COUNT(*) >= 5)."
    ],
    "solutionSql": "SELECT name FROM Employee WHERE id IN (SELECT managerId FROM Employee GROUP BY managerId HAVING COUNT(*) >= 5);",
    "starterSql": "-- Problem #570: Managers with 5 Direct Reports (LeetCode #570)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 577,
    "title": "Employee Bonus (LeetCode #577)",
    "difficulty": "Easy",
    "domain": "Joins & Relational Sets",
    "companyTags": [
      "Apple",
      "Amazon"
    ],
    "description": "Write a solution to report the name and bonus amount of each employee with a bonus less than 1000 or no bonus at all.",
    "inputTables": [
      {
        "tableName": "Employee",
        "columns": [
          {
            "name": "empId",
            "type": "INT"
          },
          {
            "name": "name",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      },
      {
        "tableName": "Bonus",
        "columns": [
          {
            "name": "empId",
            "type": "INT"
          },
          {
            "name": "bonus",
            "type": "INT"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE Employee (empId INT PRIMARY KEY, name VARCHAR(255), supervisor INT, salary INT);\nCREATE TABLE Bonus (empId INT PRIMARY KEY, bonus INT);",
    "seedDataSql": "INSERT INTO Employee VALUES (3, 'Brad', NULL, 4000);\nINSERT INTO Employee VALUES (1, 'John', 3, 1000);\nINSERT INTO Employee VALUES (2, 'Dan', 3, 2000);\nINSERT INTO Employee VALUES (4, 'Thomas', 3, 4000);\nINSERT INTO Bonus VALUES (2, 500);\nINSERT INTO Bonus VALUES (4, 2000);",
    "expectedOutput": {
      "columns": [
        "name",
        "bonus"
      ],
      "rows": [
        [
          "Brad",
          null
        ],
        [
          "John",
          null
        ],
        [
          "Dan",
          500
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 LEFT JOIN Bonus b ON e.empId = b.empId WHERE b.bonus < 1000 OR b.bonus IS NULL."
    ],
    "solutionSql": "SELECT e.name, b.bonus FROM Employee e LEFT JOIN Bonus b ON e.empId = b.empId WHERE b.bonus < 1000 OR b.bonus IS NULL;",
    "starterSql": "-- Problem #577: Employee Bonus (LeetCode #577)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 584,
    "title": "Find Customer Referee (LeetCode #584)",
    "difficulty": "Easy",
    "domain": "Filtering & String Functions",
    "companyTags": [
      "Google",
      "Amazon"
    ],
    "description": "Find the names of the customer that are not referred by the customer with id = 2.",
    "inputTables": [
      {
        "tableName": "Customer",
        "columns": [
          {
            "name": "id",
            "type": "INT"
          },
          {
            "name": "name",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE Customer (id INT PRIMARY KEY, name VARCHAR(255), referee_id INT);",
    "seedDataSql": "INSERT INTO Customer VALUES (1, 'Will', NULL);\nINSERT INTO Customer VALUES (2, 'Jane', NULL);\nINSERT INTO Customer VALUES (3, 'Alex', 2);\nINSERT INTO Customer VALUES (4, 'Bill', NULL);\nINSERT INTO Customer VALUES (5, 'Zack', 1);\nINSERT INTO Customer VALUES (6, 'Mark', 2);",
    "expectedOutput": {
      "columns": [
        "name"
      ],
      "rows": [
        [
          "Will"
        ],
        [
          "Jane"
        ],
        [
          "Bill"
        ],
        [
          "Zack"
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 referee_id != 2 OR referee_id IS NULL."
    ],
    "solutionSql": "SELECT name FROM Customer WHERE referee_id != 2 OR referee_id IS NULL;",
    "starterSql": "-- Problem #584: Find Customer Referee (LeetCode #584)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 585,
    "title": "Investments in 2016 (LeetCode #585)",
    "difficulty": "Medium",
    "domain": "Subqueries & CTEs",
    "companyTags": [
      "Meta",
      "Twitter"
    ],
    "description": "Write a solution to report the sum of all total investment values in 2016 tiv_2016, for all policyholders who have the same tiv_2015 value as one or more policyholders, and are not located in the same city as any other policyholder.",
    "inputTables": [
      {
        "tableName": "Insurance",
        "columns": [
          {
            "name": "pid",
            "type": "INT"
          },
          {
            "name": "tiv_2015",
            "type": "FLOAT"
          },
          {
            "name": "tiv_2016",
            "type": "FLOAT"
          },
          {
            "name": "lat",
            "type": "FLOAT"
          },
          {
            "name": "lon",
            "type": "FLOAT"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE Insurance (pid INT PRIMARY KEY, tiv_2015 FLOAT, tiv_2016 FLOAT, lat FLOAT, lon FLOAT);",
    "seedDataSql": "INSERT INTO Insurance VALUES (1, 10, 5, 10, 10);\nINSERT INTO Insurance VALUES (2, 20, 20, 20, 20);\nINSERT INTO Insurance VALUES (3, 10, 30, 20, 20);\nINSERT INTO Insurance VALUES (4, 10, 40, 40, 40);",
    "expectedOutput": {
      "columns": [
        "tiv_2016"
      ],
      "rows": [
        [
          45.0
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Subqueries checking tiv_2015 count > 1 and location count = 1."
    ],
    "solutionSql": "SELECT ROUND(SUM(tiv_2016), 2) AS tiv_2016 FROM Insurance WHERE tiv_2015 IN (SELECT tiv_2015 FROM Insurance GROUP BY tiv_2015 HAVING COUNT(*) > 1) AND (lat, lon) IN (SELECT lat, lon FROM Insurance GROUP BY lat, lon HAVING COUNT(*) = 1);",
    "starterSql": "-- Problem #585: Investments in 2016 (LeetCode #585)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 586,
    "title": "Customer Placing Largest Number of Orders (LeetCode #586)",
    "difficulty": "Easy",
    "domain": "Aggregations & Grouping",
    "companyTags": [
      "Google",
      "Amazon",
      "Uber"
    ],
    "description": "Write a solution to find the customer_number for the customer who has placed the largest number of orders.",
    "inputTables": [
      {
        "tableName": "Orders",
        "columns": [
          {
            "name": "order_number",
            "type": "INT"
          },
          {
            "name": "customer_number",
            "type": "INT"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE Orders (order_number INT PRIMARY KEY, customer_number INT);",
    "seedDataSql": "INSERT INTO Orders VALUES (1, 1);\nINSERT INTO Orders VALUES (2, 2);\nINSERT INTO Orders VALUES (3, 3);\nINSERT INTO Orders VALUES (4, 3);",
    "expectedOutput": {
      "columns": [
        "customer_number"
      ],
      "rows": [
        [
          3
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 GROUP BY customer_number ORDER BY COUNT(*) DESC LIMIT 1."
    ],
    "solutionSql": "SELECT customer_number FROM Orders GROUP BY customer_number ORDER BY COUNT(*) DESC LIMIT 1;",
    "starterSql": "-- Problem #586: Customer Placing Largest Number of Orders (LeetCode #586)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 595,
    "title": "Big Countries (LeetCode #595)",
    "difficulty": "Easy",
    "domain": "Filtering & String Functions",
    "companyTags": [
      "Google",
      "Amazon",
      "Meta"
    ],
    "description": "A country is big if it has an area of at least 3,000,000 km\u00b2 OR a population of at least 25,000,000.\n\nWrite a query to find the name, population, and area of all big countries.",
    "inputTables": [
      {
        "tableName": "World",
        "columns": [
          {
            "name": "name",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE World (name VARCHAR(255), continent VARCHAR(255), area INT, population INT, gdp BIGINT);",
    "seedDataSql": "INSERT INTO World VALUES ('Afghanistan', 'Asia', 652230, 25500100, 20364000000);\nINSERT INTO World VALUES ('Albania', 'Europe', 28748, 2873757, 12800000000);\nINSERT INTO World VALUES ('Algeria', 'Africa', 2381741, 37100000, 188600000000);\nINSERT INTO World VALUES ('Andorra', 'Europe', 468, 78115, 3712000000);\nINSERT INTO World VALUES ('Angola', 'Africa', 1246700, 20609294, 100990000000);",
    "expectedOutput": {
      "columns": [
        "name",
        "population",
        "area"
      ],
      "rows": [
        [
          "Afghanistan",
          25500100,
          652230
        ],
        [
          "Algeria",
          37100000,
          2381741
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 WHERE area >= 3000000 OR population >= 25000000."
    ],
    "solutionSql": "SELECT name, population, area FROM World WHERE area >= 3000000 OR population >= 25000000;",
    "starterSql": "-- Problem #595: Big Countries (LeetCode #595)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 596,
    "title": "Classes More Than 5 Students (LeetCode #596)",
    "difficulty": "Easy",
    "domain": "Aggregations & Grouping",
    "companyTags": [
      "Google",
      "Apple"
    ],
    "description": "Write a solution to find all the classes that have at least five students.",
    "inputTables": [
      {
        "tableName": "Courses",
        "columns": [
          {
            "name": "student",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE Courses (student VARCHAR(255), class VARCHAR(255));",
    "seedDataSql": "INSERT INTO Courses VALUES ('A', 'Math');\nINSERT INTO Courses VALUES ('B', 'English');\nINSERT INTO Courses VALUES ('C', 'Math');\nINSERT INTO Courses VALUES ('D', 'Biology');\nINSERT INTO Courses VALUES ('E', 'Math');\nINSERT INTO Courses VALUES ('F', 'Computer');\nINSERT INTO Courses VALUES ('G', 'Math');\nINSERT INTO Courses VALUES ('H', 'Math');\nINSERT INTO Courses VALUES ('I', 'Math');",
    "expectedOutput": {
      "columns": [
        "class"
      ],
      "rows": [
        [
          "Math"
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 GROUP BY class HAVING COUNT(student) >= 5."
    ],
    "solutionSql": "SELECT class FROM Courses GROUP BY class HAVING COUNT(student) >= 5;",
    "starterSql": "-- Problem #596: Classes More Than 5 Students (LeetCode #596)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 601,
    "title": "Human Traffic of Stadium (LeetCode #601)",
    "difficulty": "Hard",
    "domain": "Window Offset Functions",
    "companyTags": [
      "Uber",
      "Google"
    ],
    "description": "Write a solution to display the records with three or more consecutive rows with the number of people more than or equal to 100 for each row.",
    "inputTables": [
      {
        "tableName": "Stadium",
        "columns": [
          {
            "name": "id",
            "type": "INT"
          },
          {
            "name": "visit_date",
            "type": "DATE"
          },
          {
            "name": "people",
            "type": "INT"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE Stadium (id INT PRIMARY KEY, visit_date DATE, people INT);",
    "seedDataSql": "INSERT INTO Stadium VALUES (1, '2017-01-01', 10);\nINSERT INTO Stadium VALUES (2, '2017-01-02', 109);\nINSERT INTO Stadium VALUES (3, '2017-01-03', 150);\nINSERT INTO Stadium VALUES (4, '2017-01-04', 99);\nINSERT INTO Stadium VALUES (5, '2017-01-05', 145);\nINSERT INTO Stadium VALUES (6, '2017-01-06', 1455);\nINSERT INTO Stadium VALUES (7, '2017-01-07', 199);\nINSERT INTO Stadium VALUES (8, '2017-01-09', 188);",
    "expectedOutput": {
      "columns": [
        "id",
        "visit_date",
        "people"
      ],
      "rows": [
        [
          5,
          "2017-01-05",
          145
        ],
        [
          6,
          "2017-01-06",
          1455
        ],
        [
          7,
          "2017-01-07",
          199
        ],
        [
          8,
          "2017-01-09",
          188
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Group consecutive rows using id - ROW_NUMBER() OVER (ORDER BY id)."
    ],
    "solutionSql": "WITH Over100 AS (SELECT *, id - ROW_NUMBER() OVER (ORDER BY id) AS grp FROM Stadium WHERE people >= 100), Grouped AS (SELECT *, COUNT(*) OVER (PARTITION BY grp) AS cnt FROM Over100) SELECT id, visit_date, people FROM Grouped WHERE cnt >= 3 ORDER BY visit_date;",
    "starterSql": "-- Problem #601: Human Traffic of Stadium (LeetCode #601)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 602,
    "title": "Friend Requests II: Who Has Most Friends (LeetCode #602)",
    "difficulty": "Medium",
    "domain": "Subqueries & CTEs",
    "companyTags": [
      "Meta",
      "Google"
    ],
    "description": "Write a solution to find the people who have the most friends and the most friends number.",
    "inputTables": [
      {
        "tableName": "RequestAccepted",
        "columns": [
          {
            "name": "requester_id",
            "type": "INT"
          },
          {
            "name": "accepter_id",
            "type": "INT"
          },
          {
            "name": "accept_date",
            "type": "DATE"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE RequestAccepted (requester_id INT, accepter_id INT, accept_date DATE);",
    "seedDataSql": "INSERT INTO RequestAccepted VALUES (1, 2, '2016-06-03');\nINSERT INTO RequestAccepted VALUES (1, 3, '2016-06-08');\nINSERT INTO RequestAccepted VALUES (2, 3, '2016-06-08');\nINSERT INTO RequestAccepted VALUES (3, 4, '2016-06-09');",
    "expectedOutput": {
      "columns": [
        "id",
        "num"
      ],
      "rows": [
        [
          3,
          3
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Combine requester_id and accepter_id via UNION ALL."
    ],
    "solutionSql": "WITH AllFriends AS (SELECT requester_id AS id FROM RequestAccepted UNION ALL SELECT accepter_id AS id FROM RequestAccepted) SELECT id, COUNT(*) AS num FROM AllFriends GROUP BY id ORDER BY num DESC LIMIT 1;",
    "starterSql": "-- Problem #602: Friend Requests II: Who Has Most Friends (LeetCode #602)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 607,
    "title": "Sales Person (LeetCode #607)",
    "difficulty": "Easy",
    "domain": "Joins & Relational Sets",
    "companyTags": [
      "Amazon",
      "Microsoft"
    ],
    "description": "Write a solution to find the names of all the salespersons who did not have any orders related to the company with the name 'RED'.",
    "inputTables": [
      {
        "tableName": "SalesPerson",
        "columns": [
          {
            "name": "sales_id",
            "type": "INT"
          },
          {
            "name": "name",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      },
      {
        "tableName": "Company",
        "columns": [
          {
            "name": "com_id",
            "type": "INT"
          },
          {
            "name": "name",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      },
      {
        "tableName": "Orders",
        "columns": [
          {
            "name": "order_id",
            "type": "INT"
          },
          {
            "name": "order_date",
            "type": "DATE"
          },
          {
            "name": "com_id",
            "type": "INT"
          },
          {
            "name": "sales_id",
            "type": "INT"
          },
          {
            "name": "amount",
            "type": "INT"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE SalesPerson (sales_id INT PRIMARY KEY, name VARCHAR(255), salary INT, commission_rate INT, hire_date DATE);\nCREATE TABLE Company (com_id INT PRIMARY KEY, name VARCHAR(255), city VARCHAR(255));\nCREATE TABLE Orders (order_id INT PRIMARY KEY, order_date DATE, com_id INT, sales_id INT, amount INT);",
    "seedDataSql": "INSERT INTO SalesPerson VALUES (1, 'Alice', 61000, 6, '2014-03-01');\nINSERT INTO SalesPerson VALUES (2, 'Amy', 48000, 5, '2010-05-01');\nINSERT INTO SalesPerson VALUES (3, 'Mark', 11000, 10, '2017-03-01');\nINSERT INTO Company VALUES (1, 'RED', 'Boston');\nINSERT INTO Company VALUES (2, 'BLUE', 'New York');\nINSERT INTO Orders VALUES (1, '2014-01-01', 1, 1, 10000);\nINSERT INTO Orders VALUES (2, '2014-02-01', 2, 2, 5000);",
    "expectedOutput": {
      "columns": [
        "name"
      ],
      "rows": [
        [
          "Amy"
        ],
        [
          "Mark"
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 NOT IN (SELECT o.sales_id FROM Orders o JOIN Company c ... WHERE c.name = 'RED')."
    ],
    "solutionSql": "SELECT name FROM SalesPerson WHERE sales_id NOT IN (SELECT o.sales_id FROM Orders o JOIN Company c ON o.com_id = c.com_id WHERE c.name = 'RED');",
    "starterSql": "-- Problem #607: Sales Person (LeetCode #607)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 608,
    "title": "Tree Node (LeetCode #608)",
    "difficulty": "Medium",
    "domain": "Subqueries & CTEs",
    "companyTags": [
      "Uber",
      "Amazon"
    ],
    "description": "Each node in the tree can be one of three types: Root, Inner, or Leaf. Write a solution to report the type of each node in the tree.",
    "inputTables": [
      {
        "tableName": "Tree",
        "columns": [
          {
            "name": "id",
            "type": "INT"
          },
          {
            "name": "p_id",
            "type": "INT"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE Tree (id INT PRIMARY KEY, p_id INT);",
    "seedDataSql": "INSERT INTO Tree VALUES (1, NULL);\nINSERT INTO Tree VALUES (2, 1);\nINSERT INTO Tree VALUES (3, 1);\nINSERT INTO Tree VALUES (4, 2);\nINSERT INTO Tree VALUES (5, 2);",
    "expectedOutput": {
      "columns": [
        "id",
        "type"
      ],
      "rows": [
        [
          1,
          "Root"
        ],
        [
          2,
          "Inner"
        ],
        [
          3,
          "Leaf"
        ],
        [
          4,
          "Leaf"
        ],
        [
          5,
          "Leaf"
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Use CASE WHEN p_id IS NULL THEN 'Root' WHEN id IN (SELECT p_id FROM Tree) THEN 'Inner' ELSE 'Leaf' END."
    ],
    "solutionSql": "SELECT id, CASE WHEN p_id IS NULL THEN 'Root' WHEN id IN (SELECT p_id FROM Tree) THEN 'Inner' ELSE 'Leaf' END AS type FROM Tree ORDER BY id;",
    "starterSql": "-- Problem #608: Tree Node (LeetCode #608)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 610,
    "title": "Triangle Judgement (LeetCode #610)",
    "difficulty": "Easy",
    "domain": "Filtering & String Functions",
    "companyTags": [
      "Apple",
      "Amazon"
    ],
    "description": "Report for every three line segments whether they can form a triangle (x + y > z AND x + z > y AND y + z > x).",
    "inputTables": [
      {
        "tableName": "Triangle",
        "columns": [
          {
            "name": "x",
            "type": "INT"
          },
          {
            "name": "y",
            "type": "INT"
          },
          {
            "name": "z",
            "type": "INT"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE Triangle (x INT, y INT, z INT);",
    "seedDataSql": "INSERT INTO Triangle VALUES (13, 15, 30);\nINSERT INTO Triangle VALUES (10, 20, 15);",
    "expectedOutput": {
      "columns": [
        "x",
        "y",
        "z",
        "triangle"
      ],
      "rows": [
        [
          13,
          15,
          30,
          "No"
        ],
        [
          10,
          20,
          15,
          "Yes"
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 CASE WHEN x + y > z AND x + z > y AND y + z > x THEN 'Yes' ELSE 'No' END."
    ],
    "solutionSql": "SELECT x, y, z, CASE WHEN x + y > z AND x + z > y AND y + z > x THEN 'Yes' ELSE 'No' END AS triangle FROM Triangle;",
    "starterSql": "-- Problem #610: Triangle Judgement (LeetCode #610)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 619,
    "title": "Biggest Single Number (LeetCode #619)",
    "difficulty": "Easy",
    "domain": "Aggregations & Grouping",
    "companyTags": [
      "Google",
      "Amazon"
    ],
    "description": "A single number is a number that appeared only once in the MyNumbers table. Find the largest single number. If there is no single number, report null.",
    "inputTables": [
      {
        "tableName": "MyNumbers",
        "columns": [
          {
            "name": "num",
            "type": "INT"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE MyNumbers (num INT);",
    "seedDataSql": "INSERT INTO MyNumbers VALUES (8);\nINSERT INTO MyNumbers VALUES (8);\nINSERT INTO MyNumbers VALUES (3);\nINSERT INTO MyNumbers VALUES (3);\nINSERT INTO MyNumbers VALUES (1);\nINSERT INTO MyNumbers VALUES (4);\nINSERT INTO MyNumbers VALUES (5);\nINSERT INTO MyNumbers VALUES (6);",
    "expectedOutput": {
      "columns": [
        "num"
      ],
      "rows": [
        [
          6
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Subquery filtering HAVING COUNT(*) = 1, then SELECT MAX(num)."
    ],
    "solutionSql": "SELECT MAX(num) AS num FROM (SELECT num FROM MyNumbers GROUP BY num HAVING COUNT(*) = 1);",
    "starterSql": "-- Problem #619: Biggest Single Number (LeetCode #619)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 620,
    "title": "Not Boring Movies (LeetCode #620)",
    "difficulty": "Easy",
    "domain": "Filtering & String Functions",
    "companyTags": [
      "Netflix",
      "Amazon"
    ],
    "description": "Write a solution to report the movies with an odd-numbered ID and a description that is not 'boring'.",
    "inputTables": [
      {
        "tableName": "Cinema",
        "columns": [
          {
            "name": "id",
            "type": "INT"
          },
          {
            "name": "movie",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE Cinema (id INT PRIMARY KEY, movie VARCHAR(255), description VARCHAR(255), rating FLOAT);",
    "seedDataSql": "INSERT INTO Cinema VALUES (1, 'War', 'great 3D', 8.9);\nINSERT INTO Cinema VALUES (2, 'Science', 'fiction', 8.5);\nINSERT INTO Cinema VALUES (3, 'irish', 'boring', 6.2);\nINSERT INTO Cinema VALUES (4, 'Ice song', 'Fantacy', 8.6);\nINSERT INTO Cinema VALUES (5, 'House card', 'Interesting', 9.1);",
    "expectedOutput": {
      "columns": [
        "id",
        "movie",
        "description",
        "rating"
      ],
      "rows": [
        [
          5,
          "House card",
          "Interesting",
          9.1
        ],
        [
          1,
          "War",
          "great 3D",
          8.9
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 WHERE id % 2 != 0 AND description != 'boring' ORDER BY rating DESC."
    ],
    "solutionSql": "SELECT id, movie, description, rating FROM Cinema WHERE id % 2 != 0 AND description != 'boring' ORDER BY rating DESC;",
    "starterSql": "-- Problem #620: Not Boring Movies (LeetCode #620)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 626,
    "title": "Exchange Seats (LeetCode #626)",
    "difficulty": "Medium",
    "domain": "Window Offset Functions",
    "companyTags": [
      "Meta",
      "Amazon"
    ],
    "description": "Write a solution to swap the seat id of every two consecutive students. If the number of students is odd, the id of the last student is not swapped.",
    "inputTables": [
      {
        "tableName": "Seat",
        "columns": [
          {
            "name": "id",
            "type": "INT"
          },
          {
            "name": "student",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE Seat (id INT PRIMARY KEY, student VARCHAR(255));",
    "seedDataSql": "INSERT INTO Seat VALUES (1, 'Abbot');\nINSERT INTO Seat VALUES (2, 'Doris');\nINSERT INTO Seat VALUES (3, 'Emerson');\nINSERT INTO Seat VALUES (4, 'Green');\nINSERT INTO Seat VALUES (5, 'Jeames');",
    "expectedOutput": {
      "columns": [
        "id",
        "student"
      ],
      "rows": [
        [
          1,
          "Doris"
        ],
        [
          2,
          "Abbot"
        ],
        [
          3,
          "Green"
        ],
        [
          4,
          "Emerson"
        ],
        [
          5,
          "Jeames"
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 CASE WHEN id % 2 != 0 THEN id + 1 ELSE id - 1 END."
    ],
    "solutionSql": "SELECT CASE WHEN id % 2 != 0 AND id = (SELECT MAX(id) FROM Seat) THEN id WHEN id % 2 != 0 THEN id + 1 ELSE id - 1 END AS id, student FROM Seat ORDER BY id;",
    "starterSql": "-- Problem #626: Exchange Seats (LeetCode #626)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 627,
    "title": "Swap Salary (LeetCode #627)",
    "difficulty": "Easy",
    "domain": "DDL, Constraints & Triggers",
    "companyTags": [
      "Meta",
      "Google"
    ],
    "description": "Write a solution to swap all 'f' and 'm' values (i.e., change all 'f' values to 'm' and vice versa) with a single update statement and no intermediate temporary tables.",
    "inputTables": [
      {
        "tableName": "Salary",
        "columns": [
          {
            "name": "id",
            "type": "INT"
          },
          {
            "name": "name",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE Salary (id INT PRIMARY KEY, name VARCHAR(255), sex CHAR(1), salary INT);",
    "seedDataSql": "INSERT INTO Salary VALUES (1, 'A', 'm', 2500);\nINSERT INTO Salary VALUES (2, 'B', 'f', 1500);\nINSERT INTO Salary VALUES (3, 'C', 'm', 5500);\nINSERT INTO Salary VALUES (4, 'D', 'f', 500);",
    "expectedOutput": {
      "columns": [
        "id",
        "name",
        "sex",
        "salary"
      ],
      "rows": [
        [
          1,
          "A",
          "f",
          2500
        ],
        [
          2,
          "B",
          "m",
          1500
        ],
        [
          3,
          "C",
          "f",
          5500
        ],
        [
          4,
          "D",
          "m",
          500
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Use CASE WHEN sex = 'm' THEN 'f' ELSE 'm' END."
    ],
    "solutionSql": "SELECT id, name, CASE WHEN sex = 'm' THEN 'f' ELSE 'm' END AS sex, salary FROM Salary;",
    "starterSql": "-- Problem #627: Swap Salary (LeetCode #627)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 1045,
    "title": "Customers Who Bought All Products (LeetCode #1045)",
    "difficulty": "Medium",
    "domain": "Aggregations & Grouping",
    "companyTags": [
      "Amazon",
      "Google"
    ],
    "description": "Write a solution to report the customer_ids from the Customer table that bought all the products in the Product table.",
    "inputTables": [
      {
        "tableName": "Customer",
        "columns": [
          {
            "name": "customer_id",
            "type": "INT"
          },
          {
            "name": "product_key",
            "type": "INT"
          }
        ],
        "rows": []
      },
      {
        "tableName": "Product",
        "columns": [
          {
            "name": "product_key",
            "type": "INT"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE Customer (customer_id INT, product_key INT);\nCREATE TABLE Product (product_key INT PRIMARY KEY);",
    "seedDataSql": "INSERT INTO Customer VALUES (1, 5);\nINSERT INTO Customer VALUES (2, 6);\nINSERT INTO Customer VALUES (3, 5);\nINSERT INTO Customer VALUES (3, 6);\nINSERT INTO Customer VALUES (1, 6);\nINSERT INTO Product VALUES (5);\nINSERT INTO Product VALUES (6);",
    "expectedOutput": {
      "columns": [
        "customer_id"
      ],
      "rows": [
        [
          1
        ],
        [
          3
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 HAVING COUNT(DISTINCT product_key) = (SELECT COUNT(*) FROM Product)."
    ],
    "solutionSql": "SELECT customer_id FROM Customer GROUP BY customer_id HAVING COUNT(DISTINCT product_key) = (SELECT COUNT(*) FROM Product);",
    "starterSql": "-- Problem #1045: Customers Who Bought All Products (LeetCode #1045)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 1050,
    "title": "Actors & Directors Cooperated 3+ Times (LeetCode #1050)",
    "difficulty": "Easy",
    "domain": "Aggregations & Grouping",
    "companyTags": [
      "Netflix",
      "Amazon"
    ],
    "description": "Write a solution to find the pairs (actor_id, director_id) where the actor has cooperated with the director at least three times.",
    "inputTables": [
      {
        "tableName": "ActorDirector",
        "columns": [
          {
            "name": "actor_id",
            "type": "INT"
          },
          {
            "name": "director_id",
            "type": "INT"
          },
          {
            "name": "timestamp",
            "type": "INT"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE ActorDirector (actor_id INT, director_id INT, timestamp INT);",
    "seedDataSql": "INSERT INTO ActorDirector VALUES (1, 1, 0);\nINSERT INTO ActorDirector VALUES (1, 1, 1);\nINSERT INTO ActorDirector VALUES (1, 1, 2);\nINSERT INTO ActorDirector VALUES (1, 2, 3);\nINSERT INTO ActorDirector VALUES (2, 1, 4);",
    "expectedOutput": {
      "columns": [
        "actor_id",
        "director_id"
      ],
      "rows": [
        [
          1,
          1
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 GROUP BY actor_id, director_id HAVING COUNT(*) >= 3."
    ],
    "solutionSql": "SELECT actor_id, director_id FROM ActorDirector GROUP BY actor_id, director_id HAVING COUNT(*) >= 3;",
    "starterSql": "-- Problem #1050: Actors & Directors Cooperated 3+ Times (LeetCode #1050)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 1068,
    "title": "Product Sales Analysis I (LeetCode #1068)",
    "difficulty": "Easy",
    "domain": "Joins & Relational Sets",
    "companyTags": [
      "Amazon"
    ],
    "description": "Write a solution to report the product_name, year, and price for each sale_id in the Sales table.",
    "inputTables": [
      {
        "tableName": "Sales",
        "columns": [
          {
            "name": "sale_id",
            "type": "INT"
          },
          {
            "name": "product_id",
            "type": "INT"
          },
          {
            "name": "year",
            "type": "INT"
          },
          {
            "name": "quantity",
            "type": "INT"
          },
          {
            "name": "price",
            "type": "INT"
          }
        ],
        "rows": []
      },
      {
        "tableName": "Product",
        "columns": [
          {
            "name": "product_id",
            "type": "INT"
          },
          {
            "name": "product_name",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE Sales (sale_id INT, product_id INT, year INT, quantity INT, price INT);\nCREATE TABLE Product (product_id INT PRIMARY KEY, product_name VARCHAR(255));",
    "seedDataSql": "INSERT INTO Sales VALUES (1, 100, 2008, 10, 5000);\nINSERT INTO Sales VALUES (2, 100, 2009, 12, 5000);\nINSERT INTO Sales VALUES (7, 200, 2011, 15, 9000);\nINSERT INTO Product VALUES (100, 'Nokia');\nINSERT INTO Product VALUES (200, 'Apple');",
    "expectedOutput": {
      "columns": [
        "product_name",
        "year",
        "price"
      ],
      "rows": [
        [
          "Nokia",
          2008,
          5000
        ],
        [
          "Nokia",
          2009,
          5000
        ],
        [
          "Apple",
          2011,
          9000
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 JOIN Product p ON s.product_id = p.product_id."
    ],
    "solutionSql": "SELECT p.product_name, s.year, s.price FROM Sales s JOIN Product p ON s.product_id = p.product_id;",
    "starterSql": "-- Problem #1068: Product Sales Analysis I (LeetCode #1068)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 1070,
    "title": "Product Sales Analysis III (LeetCode #1070)",
    "difficulty": "Medium",
    "domain": "Subqueries & CTEs",
    "companyTags": [
      "Amazon",
      "Google"
    ],
    "description": "Write a solution to select the product id, year, quantity, and price for the first year of every product sold.",
    "inputTables": [
      {
        "tableName": "Sales",
        "columns": [
          {
            "name": "sale_id",
            "type": "INT"
          },
          {
            "name": "product_id",
            "type": "INT"
          },
          {
            "name": "year",
            "type": "INT"
          },
          {
            "name": "quantity",
            "type": "INT"
          },
          {
            "name": "price",
            "type": "INT"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE Sales (sale_id INT, product_id INT, year INT, quantity INT, price INT);",
    "seedDataSql": "INSERT INTO Sales VALUES (1, 100, 2008, 10, 5000);\nINSERT INTO Sales VALUES (2, 100, 2009, 12, 5000);\nINSERT INTO Sales VALUES (7, 200, 2011, 15, 9000);",
    "expectedOutput": {
      "columns": [
        "product_id",
        "first_year",
        "quantity",
        "price"
      ],
      "rows": [
        [
          100,
          2008,
          10,
          5000
        ],
        [
          200,
          2011,
          15,
          9000
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Filter (product_id, year) IN (SELECT product_id, MIN(year)...)."
    ],
    "solutionSql": "SELECT product_id, year AS first_year, quantity, price FROM Sales WHERE (product_id, year) IN (SELECT product_id, MIN(year) FROM Sales GROUP BY product_id);",
    "starterSql": "-- Problem #1070: Product Sales Analysis III (LeetCode #1070)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 1075,
    "title": "Project Employees I (LeetCode #1075)",
    "difficulty": "Easy",
    "domain": "Aggregations & Grouping",
    "companyTags": [
      "Amazon",
      "Meta"
    ],
    "description": "Write a solution that reports the average experience years of all the employees for each project, rounded to 2 decimal places.",
    "inputTables": [
      {
        "tableName": "Project",
        "columns": [
          {
            "name": "project_id",
            "type": "INT"
          },
          {
            "name": "employee_id",
            "type": "INT"
          }
        ],
        "rows": []
      },
      {
        "tableName": "Employee",
        "columns": [
          {
            "name": "employee_id",
            "type": "INT"
          },
          {
            "name": "name",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE Project (project_id INT, employee_id INT);\nCREATE TABLE Employee (employee_id INT PRIMARY KEY, name VARCHAR(255), experience_years INT);",
    "seedDataSql": "INSERT INTO Project VALUES (1, 1);\nINSERT INTO Project VALUES (1, 2);\nINSERT INTO Project VALUES (1, 3);\nINSERT INTO Project VALUES (2, 1);\nINSERT INTO Project VALUES (2, 4);\nINSERT INTO Employee VALUES (1, 'Khaled', 3);\nINSERT INTO Employee VALUES (2, 'Ali', 2);\nINSERT INTO Employee VALUES (3, 'John', 1);\nINSERT INTO Employee VALUES (4, 'Doe', 2);",
    "expectedOutput": {
      "columns": [
        "project_id",
        "average_years"
      ],
      "rows": [
        [
          1,
          2.0
        ],
        [
          2,
          2.5
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 JOIN Employee e ON p.employee_id = e.employee_id and ROUND(AVG(experience_years), 2)."
    ],
    "solutionSql": "SELECT p.project_id, ROUND(AVG(e.experience_years), 2) AS average_years FROM Project p JOIN Employee e ON p.employee_id = e.employee_id GROUP BY p.project_id;",
    "starterSql": "-- Problem #1075: Project Employees I (LeetCode #1075)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 1084,
    "title": "Sales Analysis III (LeetCode #1084)",
    "difficulty": "Easy",
    "domain": "Filtering & String Functions",
    "companyTags": [
      "Amazon"
    ],
    "description": "Write a solution to report the products that were only sold in the first quarter of 2019. That is, between 2019-01-01 and 2019-03-31 inclusive.",
    "inputTables": [
      {
        "tableName": "Product",
        "columns": [
          {
            "name": "product_id",
            "type": "INT"
          },
          {
            "name": "product_name",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      },
      {
        "tableName": "Sales",
        "columns": [
          {
            "name": "seller_id",
            "type": "INT"
          },
          {
            "name": "product_id",
            "type": "INT"
          },
          {
            "name": "buyer_id",
            "type": "INT"
          },
          {
            "name": "sale_date",
            "type": "DATE"
          },
          {
            "name": "quantity",
            "type": "INT"
          },
          {
            "name": "price",
            "type": "INT"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE Product (product_id INT PRIMARY KEY, product_name VARCHAR(255), unit_price INT);\nCREATE TABLE Sales (seller_id INT, product_id INT, buyer_id INT, sale_date DATE, quantity INT, price INT);",
    "seedDataSql": "INSERT INTO Product VALUES (1, 'S8', 1000);\nINSERT INTO Product VALUES (2, 'G4', 800);\nINSERT INTO Product VALUES (3, 'iPhone', 1400);\nINSERT INTO Sales VALUES (1, 1, 1, '2019-01-21', 2, 2000);\nINSERT INTO Sales VALUES (1, 2, 2, '2019-02-17', 1, 800);\nINSERT INTO Sales VALUES (2, 2, 3, '2019-06-02', 1, 800);",
    "expectedOutput": {
      "columns": [
        "product_id",
        "product_name"
      ],
      "rows": [
        [
          1,
          "S8"
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 HAVING MIN(sale_date) >= '2019-01-01' AND MAX(sale_date) <= '2019-03-31'."
    ],
    "solutionSql": "SELECT p.product_id, p.product_name FROM Product p JOIN Sales s ON p.product_id = s.product_id GROUP BY p.product_id, p.product_name HAVING MIN(s.sale_date) >= '2019-01-01' AND MAX(s.sale_date) <= '2019-03-31';",
    "starterSql": "-- Problem #1084: Sales Analysis III (LeetCode #1084)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 1141,
    "title": "User Activity for the Past 30 Days I (LeetCode #1141)",
    "difficulty": "Easy",
    "domain": "Date & Time Analytics",
    "companyTags": [
      "Meta",
      "Google"
    ],
    "description": "Write a solution to find the daily active user count for a period of 30 days ending 2019-07-27 inclusively.",
    "inputTables": [
      {
        "tableName": "Activity",
        "columns": [
          {
            "name": "user_id",
            "type": "INT"
          },
          {
            "name": "session_id",
            "type": "INT"
          },
          {
            "name": "activity_date",
            "type": "DATE"
          },
          {
            "name": "activity_type",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE Activity (user_id INT, session_id INT, activity_date DATE, activity_type VARCHAR(50));",
    "seedDataSql": "INSERT INTO Activity VALUES (1, 1, '2019-07-20', 'open_session');\nINSERT INTO Activity VALUES (1, 1, '2019-07-20', 'scroll_page');\nINSERT INTO Activity VALUES (2, 2, '2019-07-20', 'open_session');\nINSERT INTO Activity VALUES (3, 3, '2019-06-25', 'open_session');",
    "expectedOutput": {
      "columns": [
        "day",
        "active_users"
      ],
      "rows": [
        [
          "2019-07-20",
          2
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 WHERE activity_date BETWEEN '2019-06-28' AND '2019-07-27' GROUP BY activity_date."
    ],
    "solutionSql": "SELECT activity_date AS day, COUNT(DISTINCT user_id) AS active_users FROM Activity WHERE activity_date BETWEEN '2019-06-28' AND '2019-07-27' GROUP BY activity_date;",
    "starterSql": "-- Problem #1141: User Activity for the Past 30 Days I (LeetCode #1141)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 1148,
    "title": "Article Views I (LeetCode #1148)",
    "difficulty": "Easy",
    "domain": "Filtering & String Functions",
    "companyTags": [
      "Meta",
      "Google"
    ],
    "description": "Write a solution to find all the authors that viewed at least one of their own articles. Return the result table sorted by id in ascending order.",
    "inputTables": [
      {
        "tableName": "Views",
        "columns": [
          {
            "name": "article_id",
            "type": "INT"
          },
          {
            "name": "author_id",
            "type": "INT"
          },
          {
            "name": "viewer_id",
            "type": "INT"
          },
          {
            "name": "view_date",
            "type": "DATE"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE Views (article_id INT, author_id INT, viewer_id INT, view_date DATE);",
    "seedDataSql": "INSERT INTO Views VALUES (1, 3, 5, '2019-08-01');\nINSERT INTO Views VALUES (2, 7, 7, '2019-08-01');\nINSERT INTO Views VALUES (4, 7, 1, '2019-07-22');\nINSERT INTO Views VALUES (3, 4, 4, '2019-07-21');",
    "expectedOutput": {
      "columns": [
        "id"
      ],
      "rows": [
        [
          4
        ],
        [
          7
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 WHERE author_id = viewer_id."
    ],
    "solutionSql": "SELECT DISTINCT author_id AS id FROM Views WHERE author_id = viewer_id ORDER BY id;",
    "starterSql": "-- Problem #1148: Article Views I (LeetCode #1148)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 1158,
    "title": "Market Analysis I (LeetCode #1158)",
    "difficulty": "Medium",
    "domain": "Joins & Relational Sets",
    "companyTags": [
      "Stripe",
      "Amazon"
    ],
    "description": "Write a solution to find for each user, the join date and the number of orders they made as a buyer in 2019.",
    "inputTables": [
      {
        "tableName": "Users",
        "columns": [
          {
            "name": "user_id",
            "type": "INT"
          },
          {
            "name": "join_date",
            "type": "DATE"
          },
          {
            "name": "favorite_brand",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      },
      {
        "tableName": "Orders",
        "columns": [
          {
            "name": "order_id",
            "type": "INT"
          },
          {
            "name": "order_date",
            "type": "DATE"
          },
          {
            "name": "item_id",
            "type": "INT"
          },
          {
            "name": "buyer_id",
            "type": "INT"
          },
          {
            "name": "seller_id",
            "type": "INT"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE Users (user_id INT PRIMARY KEY, join_date DATE, favorite_brand VARCHAR(255));\nCREATE TABLE Orders (order_id INT PRIMARY KEY, order_date DATE, item_id INT, buyer_id INT, seller_id INT);",
    "seedDataSql": "INSERT INTO Users VALUES (1, '2018-01-01', 'Lenovo');\nINSERT INTO Users VALUES (2, '2018-02-09', 'Samsung');\nINSERT INTO Users VALUES (3, '2018-01-19', 'LG');\nINSERT INTO Orders VALUES (1, '2019-08-01', 4, 1, 2);\nINSERT INTO Orders VALUES (2, '2018-08-02', 2, 1, 3);\nINSERT INTO Orders VALUES (3, '2019-08-03', 3, 2, 3);",
    "expectedOutput": {
      "columns": [
        "buyer_id",
        "join_date",
        "orders_in_2019"
      ],
      "rows": [
        [
          1,
          "2018-01-01",
          1
        ],
        [
          2,
          "2018-02-09",
          1
        ],
        [
          3,
          "2018-01-19",
          0
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 LEFT JOIN Orders o ON u.user_id = o.buyer_id AND o.order_date LIKE '2019%'."
    ],
    "solutionSql": "SELECT u.user_id AS buyer_id, u.join_date, COUNT(o.order_id) AS orders_in_2019 FROM Users u LEFT JOIN Orders o ON u.user_id = o.buyer_id AND o.order_date LIKE '2019%' GROUP BY u.user_id, u.join_date;",
    "starterSql": "-- Problem #1158: Market Analysis I (LeetCode #1158)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 1164,
    "title": "Product Price at a Given Date (LeetCode #1164)",
    "difficulty": "Medium",
    "domain": "Window Offset Functions",
    "companyTags": [
      "Amazon"
    ],
    "description": "Write a solution to find the prices of all products on 2019-08-16. Assume the price of all products before any change is 10.",
    "inputTables": [
      {
        "tableName": "Products",
        "columns": [
          {
            "name": "product_id",
            "type": "INT"
          },
          {
            "name": "new_price",
            "type": "INT"
          },
          {
            "name": "change_date",
            "type": "DATE"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE Products (product_id INT, new_price INT, change_date DATE);",
    "seedDataSql": "INSERT INTO Products VALUES (1, 20, '2019-08-14');\nINSERT INTO Products VALUES (2, 50, '2019-08-14');\nINSERT INTO Products VALUES (1, 30, '2019-08-15');\nINSERT INTO Products VALUES (1, 35, '2019-08-17');\nINSERT INTO Products VALUES (3, 20, '2019-08-18');",
    "expectedOutput": {
      "columns": [
        "product_id",
        "price"
      ],
      "rows": [
        [
          1,
          30
        ],
        [
          2,
          50
        ],
        [
          3,
          10
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 ROW_NUMBER() OVER (PARTITION BY product_id ORDER BY change_date DESC) <= '2019-08-16'."
    ],
    "solutionSql": "WITH LastChange AS (SELECT product_id, new_price, ROW_NUMBER() OVER (PARTITION BY product_id ORDER BY change_date DESC) AS rnk FROM Products WHERE change_date <= '2019-08-16'), AllProds AS (SELECT DISTINCT product_id FROM Products) SELECT a.product_id, COALESCE(l.new_price, 10) AS price FROM AllProds a LEFT JOIN LastChange l ON a.product_id = l.product_id AND l.rnk = 1;",
    "starterSql": "-- Problem #1164: Product Price at a Given Date (LeetCode #1164)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 1173,
    "title": "Immediate Food Delivery I (LeetCode #1173)",
    "difficulty": "Easy",
    "domain": "Filtering & String Functions",
    "companyTags": [
      "DoorDash",
      "Uber"
    ],
    "description": "If the order's preferred delivery date is the same as the order date, then the order is called immediate; otherwise, it is called scheduled. Write a solution to find the percentage of immediate orders in the table, rounded to 2 decimal places.",
    "inputTables": [
      {
        "tableName": "Delivery",
        "columns": [
          {
            "name": "delivery_id",
            "type": "INT"
          },
          {
            "name": "customer_id",
            "type": "INT"
          },
          {
            "name": "order_date",
            "type": "DATE"
          },
          {
            "name": "customer_pref_delivery_date",
            "type": "DATE"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE Delivery (delivery_id INT PRIMARY KEY, customer_id INT, order_date DATE, customer_pref_delivery_date DATE);",
    "seedDataSql": "INSERT INTO Delivery VALUES (1, 1, '2019-08-01', '2019-08-01');\nINSERT INTO Delivery VALUES (2, 5, '2019-08-02', '2019-08-02');\nINSERT INTO Delivery VALUES (3, 1, '2019-08-11', '2019-08-12');\nINSERT INTO Delivery VALUES (4, 3, '2019-08-24', '2019-08-24');",
    "expectedOutput": {
      "columns": [
        "immediate_percentage"
      ],
      "rows": [
        [
          75.0
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 SUM(CASE WHEN order_date = customer_pref_delivery_date THEN 1.0 ELSE 0.0 END) * 100.0 / COUNT(*)."
    ],
    "solutionSql": "SELECT ROUND(SUM(CASE WHEN order_date = customer_pref_delivery_date THEN 1.0 ELSE 0.0 END) * 100.0 / COUNT(*), 2) AS immediate_percentage FROM Delivery;",
    "starterSql": "-- Problem #1173: Immediate Food Delivery I (LeetCode #1173)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 1179,
    "title": "Reformat Department Table (LeetCode #1179)",
    "difficulty": "Easy",
    "domain": "Aggregations & Grouping",
    "companyTags": [
      "Amazon",
      "Google"
    ],
    "description": "Reformat the table such that there is a department id column and a revenue column for each month.",
    "inputTables": [
      {
        "tableName": "Department",
        "columns": [
          {
            "name": "id",
            "type": "INT"
          },
          {
            "name": "revenue",
            "type": "INT"
          },
          {
            "name": "month",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE Department (id INT, revenue INT, month VARCHAR(10));",
    "seedDataSql": "INSERT INTO Department VALUES (1, 8000, 'Jan');\nINSERT INTO Department VALUES (2, 9000, 'Jan');\nINSERT INTO Department VALUES (3, 10000, 'Feb');\nINSERT INTO Department VALUES (1, 7000, 'Feb');",
    "expectedOutput": {
      "columns": [
        "id",
        "Jan_Revenue",
        "Feb_Revenue",
        "Mar_Revenue"
      ],
      "rows": [
        [
          1,
          8000,
          7000,
          null
        ],
        [
          2,
          9000,
          null,
          null
        ],
        [
          3,
          null,
          10000,
          null
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Pivot table using SUM(CASE WHEN month = 'Jan' THEN revenue END)."
    ],
    "solutionSql": "SELECT id, SUM(CASE WHEN month = 'Jan' THEN revenue ELSE NULL END) AS Jan_Revenue, SUM(CASE WHEN month = 'Feb' THEN revenue ELSE NULL END) AS Feb_Revenue, SUM(CASE WHEN month = 'Mar' THEN revenue ELSE NULL END) AS Mar_Revenue FROM Department GROUP BY id;",
    "starterSql": "-- Problem #1179: Reformat Department Table (LeetCode #1179)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 1193,
    "title": "Monthly Transactions I (LeetCode #1193)",
    "difficulty": "Medium",
    "domain": "Date & Time Analytics",
    "companyTags": [
      "Stripe",
      "Amazon"
    ],
    "description": "Write a query to find for each month and country, the number of transactions and their total amount, the number of approved transactions and their total amount.",
    "inputTables": [
      {
        "tableName": "Transactions",
        "columns": [
          {
            "name": "id",
            "type": "INT"
          },
          {
            "name": "country",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE Transactions (id INT PRIMARY KEY, country VARCHAR(255), state VARCHAR(50), amount INT, trans_date DATE);",
    "seedDataSql": "INSERT INTO Transactions VALUES (121, 'US', 'approved', 1000, '2018-12-18');\nINSERT INTO Transactions VALUES (122, 'US', 'declined', 2000, '2018-12-19');\nINSERT INTO Transactions VALUES (123, 'US', 'approved', 2000, '2019-01-01');",
    "expectedOutput": {
      "columns": [
        "month",
        "country",
        "trans_count",
        "approved_count",
        "trans_total_amount",
        "approved_total_amount"
      ],
      "rows": [
        [
          "2018-12",
          "US",
          2,
          1,
          3000,
          1000
        ],
        [
          "2019-01",
          "US",
          1,
          1,
          2000,
          2000
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 SUBSTR(trans_date, 1, 7) AS month."
    ],
    "solutionSql": "SELECT SUBSTR(trans_date, 1, 7) AS month, country, COUNT(*) AS trans_count, SUM(CASE WHEN state = 'approved' THEN 1 ELSE 0 END) AS approved_count, SUM(amount) AS trans_total_amount, SUM(CASE WHEN state = 'approved' THEN amount ELSE 0 END) AS approved_total_amount FROM Transactions GROUP BY month, country;",
    "starterSql": "-- Problem #1193: Monthly Transactions I (LeetCode #1193)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 1204,
    "title": "Last Person to Fit in the Bus (LeetCode #1204)",
    "difficulty": "Medium",
    "domain": "Sliding Window Aggregates",
    "companyTags": [
      "Uber",
      "Amazon"
    ],
    "description": "The maximum weight total of people that can fit on the bus is 1000. Write a solution to find the person_name of the last person that will fit on the bus without exceeding the weight limit.",
    "inputTables": [
      {
        "tableName": "Queue",
        "columns": [
          {
            "name": "person_id",
            "type": "INT"
          },
          {
            "name": "person_name",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE Queue (person_id INT PRIMARY KEY, person_name VARCHAR(255), weight INT, turn INT);",
    "seedDataSql": "INSERT INTO Queue VALUES (5, 'Alice', 250, 1);\nINSERT INTO Queue VALUES (4, 'Bob', 175, 5);\nINSERT INTO Queue VALUES (3, 'Alex', 350, 2);\nINSERT INTO Queue VALUES (6, 'John', 400, 3);\nINSERT INTO Queue VALUES (2, 'Marie', 200, 4);",
    "expectedOutput": {
      "columns": [
        "person_name"
      ],
      "rows": [
        [
          "John"
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 SUM(weight) OVER (ORDER BY turn) <= 1000 ORDER BY turn DESC LIMIT 1."
    ],
    "solutionSql": "WITH RunningWeight AS (SELECT person_name, turn, SUM(weight) OVER (ORDER BY turn) AS total_weight FROM Queue) SELECT person_name FROM RunningWeight WHERE total_weight <= 1000 ORDER BY turn DESC LIMIT 1;",
    "starterSql": "-- Problem #1204: Last Person to Fit in the Bus (LeetCode #1204)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 1211,
    "title": "Queries Quality and Percentage (LeetCode #1211)",
    "difficulty": "Easy",
    "domain": "Aggregations & Grouping",
    "companyTags": [
      "Google",
      "Meta"
    ],
    "description": "Quality is the average of the ratio between position and rating. Poor query percentage is the percentage of all queries with rating less than 3. Write a solution to find each query_name, its quality and poor_query_percentage.",
    "inputTables": [
      {
        "tableName": "Queries",
        "columns": [
          {
            "name": "query_name",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE Queries (query_name VARCHAR(255), result VARCHAR(255), position INT, rating INT);",
    "seedDataSql": "INSERT INTO Queries VALUES ('Dog', 'Golden Retriever', 1, 5);\nINSERT INTO Queries VALUES ('Dog', 'German Shepherd', 2, 5);\nINSERT INTO Queries VALUES ('Dog', 'Mule', 200, 1);\nINSERT INTO Queries VALUES ('Cat', 'Shirazi', 5, 2);\nINSERT INTO Queries VALUES ('Cat', 'Siamese', 3, 3);",
    "expectedOutput": {
      "columns": [
        "query_name",
        "quality",
        "poor_query_percentage"
      ],
      "rows": [
        [
          "Cat",
          0.7,
          50.0
        ],
        [
          "Dog",
          2.5,
          33.33
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 ROUND(AVG(rating * 1.0 / position), 2) and SUM(CASE WHEN rating < 3 THEN 1.0 END)."
    ],
    "solutionSql": "SELECT query_name, ROUND(AVG(rating * 1.0 / position), 2) AS quality, ROUND(SUM(CASE WHEN rating < 3 THEN 1.0 ELSE 0.0 END) * 100.0 / COUNT(*), 2) AS poor_query_percentage FROM Queries GROUP BY query_name;",
    "starterSql": "-- Problem #1211: Queries Quality and Percentage (LeetCode #1211)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 1251,
    "title": "Average Selling Price (LeetCode #1251)",
    "difficulty": "Easy",
    "domain": "Joins & Relational Sets",
    "companyTags": [
      "Amazon"
    ],
    "description": "Write a solution to find the average selling price for each product. average_price should be rounded to 2 decimal places.",
    "inputTables": [
      {
        "tableName": "Prices",
        "columns": [
          {
            "name": "product_id",
            "type": "INT"
          },
          {
            "name": "start_date",
            "type": "DATE"
          },
          {
            "name": "end_date",
            "type": "DATE"
          },
          {
            "name": "price",
            "type": "INT"
          }
        ],
        "rows": []
      },
      {
        "tableName": "UnitsSold",
        "columns": [
          {
            "name": "product_id",
            "type": "INT"
          },
          {
            "name": "purchase_date",
            "type": "DATE"
          },
          {
            "name": "units",
            "type": "INT"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE Prices (product_id INT, start_date DATE, end_date DATE, price INT);\nCREATE TABLE UnitsSold (product_id INT, purchase_date DATE, units INT);",
    "seedDataSql": "INSERT INTO Prices VALUES (1, '2019-02-17', '2019-02-28', 5);\nINSERT INTO Prices VALUES (1, '2019-03-01', '2019-03-22', 20);\nINSERT INTO Prices VALUES (2, '2019-02-01', '2019-02-20', 15);\nINSERT INTO UnitsSold VALUES (1, '2019-02-25', 100);\nINSERT INTO UnitsSold VALUES (1, '2019-03-01', 15);\nINSERT INTO UnitsSold VALUES (2, '2019-02-10', 200);",
    "expectedOutput": {
      "columns": [
        "product_id",
        "average_price"
      ],
      "rows": [
        [
          1,
          6.96
        ],
        [
          2,
          15.0
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 LEFT JOIN UnitsSold u ON purchase_date BETWEEN start_date AND end_date."
    ],
    "solutionSql": "SELECT p.product_id, ROUND(COALESCE(SUM(u.units * p.price) * 1.0 / SUM(u.units), 0), 2) AS average_price FROM Prices p LEFT JOIN UnitsSold u ON p.product_id = u.product_id AND u.purchase_date BETWEEN p.start_date AND p.end_date GROUP BY p.product_id;",
    "starterSql": "-- Problem #1251: Average Selling Price (LeetCode #1251)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 1280,
    "title": "Students and Examinations (LeetCode #1280)",
    "difficulty": "Easy",
    "domain": "Joins & Relational Sets",
    "companyTags": [
      "Google",
      "Meta"
    ],
    "description": "Write a solution to find the number of times each student attended each exam.",
    "inputTables": [
      {
        "tableName": "Students",
        "columns": [
          {
            "name": "student_id",
            "type": "INT"
          },
          {
            "name": "student_name",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      },
      {
        "tableName": "Subjects",
        "columns": [
          {
            "name": "subject_name",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      },
      {
        "tableName": "Examinations",
        "columns": [
          {
            "name": "student_id",
            "type": "INT"
          },
          {
            "name": "subject_name",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE Students (student_id INT PRIMARY KEY, student_name VARCHAR(255));\nCREATE TABLE Subjects (subject_name VARCHAR(255) PRIMARY KEY);\nCREATE TABLE Examinations (student_id INT, subject_name VARCHAR(255));",
    "seedDataSql": "INSERT INTO Students VALUES (1, 'Alice');\nINSERT INTO Students VALUES (2, 'Bob');\nINSERT INTO Subjects VALUES ('Math');\nINSERT INTO Subjects VALUES ('Physics');\nINSERT INTO Examinations VALUES (1, 'Math');\nINSERT INTO Examinations VALUES (1, 'Physics');\nINSERT INTO Examinations VALUES (1, 'Math');",
    "expectedOutput": {
      "columns": [
        "student_id",
        "student_name",
        "subject_name",
        "attended_exams"
      ],
      "rows": [
        [
          1,
          "Alice",
          "Math",
          2
        ],
        [
          1,
          "Alice",
          "Physics",
          1
        ],
        [
          2,
          "Bob",
          "Math",
          0
        ],
        [
          2,
          "Bob",
          "Physics",
          0
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 CROSS JOIN Students and Subjects, then LEFT JOIN Examinations."
    ],
    "solutionSql": "SELECT st.student_id, st.student_name, sb.subject_name, COUNT(e.subject_name) AS attended_exams FROM Students st CROSS JOIN Subjects sb LEFT JOIN Examinations e ON st.student_id = e.student_id AND sb.subject_name = e.subject_name GROUP BY st.student_id, st.student_name, sb.subject_name ORDER BY st.student_id, sb.subject_name;",
    "starterSql": "-- Problem #1280: Students and Examinations (LeetCode #1280)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 1321,
    "title": "Restaurant Growth (LeetCode #1321)",
    "difficulty": "Medium",
    "domain": "Sliding Window Aggregates",
    "companyTags": [
      "Amazon",
      "Uber"
    ],
    "description": "Compute the moving average of how much the customer paid in a seven days window (i.e., current day + 6 days before).",
    "inputTables": [
      {
        "tableName": "Customer",
        "columns": [
          {
            "name": "customer_id",
            "type": "INT"
          },
          {
            "name": "name",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE Customer (customer_id INT, name VARCHAR(255), visited_on DATE, amount INT);",
    "seedDataSql": "INSERT INTO Customer VALUES (1, 'J', '2019-01-01', 100);\nINSERT INTO Customer VALUES (2, 'D', '2019-01-02', 110);\nINSERT INTO Customer VALUES (3, 'G', '2019-01-03', 120);\nINSERT INTO Customer VALUES (4, 'C', '2019-01-04', 130);\nINSERT INTO Customer VALUES (5, 'W', '2019-01-05', 110);\nINSERT INTO Customer VALUES (6, 'A', '2019-01-06', 140);\nINSERT INTO Customer VALUES (7, 'L', '2019-01-07', 150);\nINSERT INTO Customer VALUES (8, 'K', '2019-01-08', 80);",
    "expectedOutput": {
      "columns": [
        "visited_on",
        "amount",
        "average_amount"
      ],
      "rows": [
        [
          "2019-01-07",
          860,
          122.86
        ],
        [
          "2019-01-08",
          840,
          120.0
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 7-day moving window: ROWS BETWEEN 6 PRECEDING AND CURRENT ROW."
    ],
    "solutionSql": "WITH DailySum AS (SELECT visited_on, SUM(amount) AS amount FROM Customer GROUP BY visited_on), Moving AS (SELECT visited_on, SUM(amount) OVER (ORDER BY visited_on ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) AS amount, ROUND(AVG(amount) OVER (ORDER BY visited_on ROWS BETWEEN 6 PRECEDING AND CURRENT ROW), 2) AS average_amount, ROW_NUMBER() OVER (ORDER BY visited_on) AS rnk FROM DailySum) SELECT visited_on, amount, average_amount FROM Moving WHERE rnk >= 7;",
    "starterSql": "-- Problem #1321: Restaurant Growth (LeetCode #1321)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 1327,
    "title": "List Products Ordered in a Period (LeetCode #1327)",
    "difficulty": "Easy",
    "domain": "Filtering & String Functions",
    "companyTags": [
      "Amazon"
    ],
    "description": "Write a solution to get the names of products that have at least 100 units ordered in February 2020 and their amount.",
    "inputTables": [
      {
        "tableName": "Products",
        "columns": [
          {
            "name": "product_id",
            "type": "INT"
          },
          {
            "name": "product_name",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      },
      {
        "tableName": "Orders",
        "columns": [
          {
            "name": "product_id",
            "type": "INT"
          },
          {
            "name": "order_date",
            "type": "DATE"
          },
          {
            "name": "unit",
            "type": "INT"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE Products (product_id INT PRIMARY KEY, product_name VARCHAR(255), product_category VARCHAR(255));\nCREATE TABLE Orders (product_id INT, order_date DATE, unit INT);",
    "seedDataSql": "INSERT INTO Products VALUES (1, 'Leetcode Solutions', 'Book');\nINSERT INTO Products VALUES (2, 'Jewel of SQL', 'Book');\nINSERT INTO Orders VALUES (1, '2020-02-05', 60);\nINSERT INTO Orders VALUES (1, '2020-02-10', 70);\nINSERT INTO Orders VALUES (2, '2020-02-01', 30);",
    "expectedOutput": {
      "columns": [
        "product_name",
        "unit"
      ],
      "rows": [
        [
          "Leetcode Solutions",
          130
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 WHERE order_date LIKE '2020-02%' HAVING SUM(unit) >= 100."
    ],
    "solutionSql": "SELECT p.product_name, SUM(o.unit) AS unit FROM Products p JOIN Orders o ON p.product_id = o.product_id WHERE o.order_date LIKE '2020-02%' GROUP BY p.product_name HAVING SUM(o.unit) >= 100;",
    "starterSql": "-- Problem #1327: List Products Ordered in a Period (LeetCode #1327)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 1341,
    "title": "Movie Rating (LeetCode #1341)",
    "difficulty": "Medium",
    "domain": "Subqueries & CTEs",
    "companyTags": [
      "Netflix",
      "Amazon"
    ],
    "description": "Find the name of the user who has rated the greatest number of movies. In case of a tie, return lexicographically smaller user name. Also find the movie name with the highest average rating in February 2020.",
    "inputTables": [
      {
        "tableName": "Movies",
        "columns": [
          {
            "name": "movie_id",
            "type": "INT"
          },
          {
            "name": "title",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      },
      {
        "tableName": "Users",
        "columns": [
          {
            "name": "user_id",
            "type": "INT"
          },
          {
            "name": "name",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      },
      {
        "tableName": "MovieRating",
        "columns": [
          {
            "name": "movie_id",
            "type": "INT"
          },
          {
            "name": "user_id",
            "type": "INT"
          },
          {
            "name": "rating",
            "type": "INT"
          },
          {
            "name": "created_at",
            "type": "DATE"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE Movies (movie_id INT PRIMARY KEY, title VARCHAR(255));\nCREATE TABLE Users (user_id INT PRIMARY KEY, name VARCHAR(255));\nCREATE TABLE MovieRating (movie_id INT, user_id INT, rating INT, created_at DATE);",
    "seedDataSql": "INSERT INTO Movies VALUES (1, 'Avengers');\nINSERT INTO Movies VALUES (2, 'Frozen');\nINSERT INTO Users VALUES (1, 'Daniel');\nINSERT INTO Users VALUES (2, 'Monica');\nINSERT INTO MovieRating VALUES (1, 1, 3, '2020-02-12');\nINSERT INTO MovieRating VALUES (1, 2, 4, '2020-02-11');\nINSERT INTO MovieRating VALUES (2, 1, 5, '2020-02-17');",
    "expectedOutput": {
      "columns": [
        "results"
      ],
      "rows": [
        [
          "Daniel"
        ],
        [
          "Frozen"
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Combine Top User and Top Movie via UNION ALL."
    ],
    "solutionSql": "SELECT name AS results FROM (SELECT u.name FROM MovieRating r JOIN Users u ON r.user_id = u.user_id GROUP BY u.name ORDER BY COUNT(*) DESC, u.name ASC LIMIT 1) UNION ALL SELECT title AS results FROM (SELECT m.title FROM MovieRating r JOIN Movies m ON r.movie_id = m.movie_id WHERE r.created_at LIKE '2020-02%' GROUP BY m.title ORDER BY AVG(r.rating) DESC, m.title ASC LIMIT 1);",
    "starterSql": "-- Problem #1341: Movie Rating (LeetCode #1341)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 1378,
    "title": "Replace Employee ID With Unique ID (LeetCode #1378)",
    "difficulty": "Easy",
    "domain": "Joins & Relational Sets",
    "companyTags": [
      "Netflix",
      "Amazon"
    ],
    "description": "Write a solution to show the unique ID of each user, If a user does not have a unique ID header replace with null.",
    "inputTables": [
      {
        "tableName": "Employees",
        "columns": [
          {
            "name": "id",
            "type": "INT"
          },
          {
            "name": "name",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      },
      {
        "tableName": "EmployeeUNI",
        "columns": [
          {
            "name": "id",
            "type": "INT"
          },
          {
            "name": "unique_id",
            "type": "INT"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE Employees (id INT PRIMARY KEY, name VARCHAR(255));\nCREATE TABLE EmployeeUNI (id INT, unique_id INT);",
    "seedDataSql": "INSERT INTO Employees VALUES (1, 'Alice');\nINSERT INTO Employees VALUES (7, 'Bob');\nINSERT INTO Employees VALUES (11, 'Meir');\nINSERT INTO EmployeeUNI VALUES (3, 1);\nINSERT INTO EmployeeUNI VALUES (11, 2);",
    "expectedOutput": {
      "columns": [
        "unique_id",
        "name"
      ],
      "rows": [
        [
          null,
          "Alice"
        ],
        [
          null,
          "Bob"
        ],
        [
          2,
          "Meir"
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 LEFT JOIN EmployeeUNI u ON e.id = u.id."
    ],
    "solutionSql": "SELECT u.unique_id, e.name FROM Employees e LEFT JOIN EmployeeUNI u ON e.id = u.id;",
    "starterSql": "-- Problem #1378: Replace Employee ID With Unique ID (LeetCode #1378)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 1393,
    "title": "Capital Gain/Loss (LeetCode #1393)",
    "difficulty": "Medium",
    "domain": "Aggregations & Grouping",
    "companyTags": [
      "Stripe",
      "Amazon"
    ],
    "description": "Write a solution to report the Capital Gain/Loss for each stock.",
    "inputTables": [
      {
        "tableName": "Stocks",
        "columns": [
          {
            "name": "stock_name",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE Stocks (stock_name VARCHAR(255), operation VARCHAR(10), operation_day INT, price INT);",
    "seedDataSql": "INSERT INTO Stocks VALUES ('Leetcode', 'Buy', 1, 1000);\nINSERT INTO Stocks VALUES ('Corona Masks', 'Buy', 2, 10);\nINSERT INTO Stocks VALUES ('Leetcode', 'Sell', 5, 9000);\nINSERT INTO Stocks VALUES ('Hand Sanitizer', 'Buy', 1, 500);",
    "expectedOutput": {
      "columns": [
        "stock_name",
        "capital_gain_loss"
      ],
      "rows": [
        [
          "Corona Masks",
          -10
        ],
        [
          "Hand Sanitizer",
          -500
        ],
        [
          "Leetcode",
          8000
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 SUM(CASE WHEN operation = 'Sell' THEN price ELSE -price END)."
    ],
    "solutionSql": "SELECT stock_name, SUM(CASE WHEN operation = 'Sell' THEN price ELSE -price END) AS capital_gain_loss FROM Stocks GROUP BY stock_name;",
    "starterSql": "-- Problem #1393: Capital Gain/Loss (LeetCode #1393)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 1407,
    "title": "Top Travellers (LeetCode #1407)",
    "difficulty": "Easy",
    "domain": "Joins & Relational Sets",
    "companyTags": [
      "Uber",
      "Lyft"
    ],
    "description": "Write a solution to report the distance travelled by each user. Return the result table ordered by travelled_distance in descending order, if two or more users travelled the same distance, order them by their name in ascending order.",
    "inputTables": [
      {
        "tableName": "Users",
        "columns": [
          {
            "name": "id",
            "type": "INT"
          },
          {
            "name": "name",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      },
      {
        "tableName": "Rides",
        "columns": [
          {
            "name": "id",
            "type": "INT"
          },
          {
            "name": "user_id",
            "type": "INT"
          },
          {
            "name": "distance",
            "type": "INT"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE Users (id INT PRIMARY KEY, name VARCHAR(255));\nCREATE TABLE Rides (id INT PRIMARY KEY, user_id INT, distance INT);",
    "seedDataSql": "INSERT INTO Users VALUES (1, 'Alice');\nINSERT INTO Users VALUES (2, 'Bob');\nINSERT INTO Users VALUES (3, 'Alex');\nINSERT INTO Rides VALUES (1, 1, 120);\nINSERT INTO Rides VALUES (2, 2, 317);\nINSERT INTO Rides VALUES (3, 3, 222);",
    "expectedOutput": {
      "columns": [
        "name",
        "travelled_distance"
      ],
      "rows": [
        [
          "Bob",
          317
        ],
        [
          "Alex",
          222
        ],
        [
          "Alice",
          120
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 COALESCE(SUM(distance), 0) ORDER BY travelled_distance DESC, name ASC."
    ],
    "solutionSql": "SELECT u.name, COALESCE(SUM(r.distance), 0) AS travelled_distance FROM Users u LEFT JOIN Rides r ON u.id = r.user_id GROUP BY u.id, u.name ORDER BY travelled_distance DESC, u.name ASC;",
    "starterSql": "-- Problem #1407: Top Travellers (LeetCode #1407)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 1484,
    "title": "Group Sold Products By Date (LeetCode #1484)",
    "difficulty": "Easy",
    "domain": "Filtering & String Functions",
    "companyTags": [
      "Amazon",
      "Google"
    ],
    "description": "Write a solution to find for each date the number of different products sold and their names.",
    "inputTables": [
      {
        "tableName": "Activities",
        "columns": [
          {
            "name": "sell_date",
            "type": "DATE"
          },
          {
            "name": "product",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE Activities (sell_date DATE, product VARCHAR(255));",
    "seedDataSql": "INSERT INTO Activities VALUES ('2020-05-30', 'Headphone');\nINSERT INTO Activities VALUES ('2020-05-30', 'Basketball');\nINSERT INTO Activities VALUES ('2020-06-01', 'Pencil');\nINSERT INTO Activities VALUES ('2020-05-30', 'Medicine');",
    "expectedOutput": {
      "columns": [
        "sell_date",
        "num_sold",
        "products"
      ],
      "rows": [
        [
          "2020-05-30",
          3,
          "Headphone,Basketball,Medicine"
        ],
        [
          "2020-06-01",
          1,
          "Pencil"
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 GROUP_CONCAT(DISTINCT product) ORDER BY sell_date."
    ],
    "solutionSql": "SELECT sell_date, COUNT(DISTINCT product) AS num_sold, GROUP_CONCAT(DISTINCT product) AS products FROM Activities GROUP BY sell_date ORDER BY sell_date;",
    "starterSql": "-- Problem #1484: Group Sold Products By Date (LeetCode #1484)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 1517,
    "title": "Find Users With Valid E-Mails (LeetCode #1517)",
    "difficulty": "Easy",
    "domain": "Filtering & String Functions",
    "companyTags": [
      "Meta",
      "Amazon"
    ],
    "description": "Write a solution to find the users who have valid emails. A valid e-mail has a prefix name and a domain is '@leetcode.com'.",
    "inputTables": [
      {
        "tableName": "Users",
        "columns": [
          {
            "name": "user_id",
            "type": "INT"
          },
          {
            "name": "name",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE Users (user_id INT PRIMARY KEY, name VARCHAR(255), mail VARCHAR(255));",
    "seedDataSql": "INSERT INTO Users VALUES (1, 'Winston', 'winston@leetcode.com');\nINSERT INTO Users VALUES (2, 'Jonathan', 'jonathanathan');\nINSERT INTO Users VALUES (3, 'Annabelle', 'bella-@leetcode.com');",
    "expectedOutput": {
      "columns": [
        "user_id",
        "name",
        "mail"
      ],
      "rows": [
        [
          1,
          "Winston",
          "winston@leetcode.com"
        ],
        [
          3,
          "Annabelle",
          "bella-@leetcode.com"
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 WHERE mail LIKE '%@leetcode.com'."
    ],
    "solutionSql": "SELECT user_id, name, mail FROM Users WHERE mail LIKE '%@leetcode.com';",
    "starterSql": "-- Problem #1517: Find Users With Valid E-Mails (LeetCode #1517)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 1527,
    "title": "Patients With a Condition (LeetCode #1527)",
    "difficulty": "Easy",
    "domain": "Filtering & String Functions",
    "companyTags": [
      "Google",
      "Epic"
    ],
    "description": "Write a solution to find the patient_id, patient_name, and conditions of the patients who have Type I Diabetes (starts with DIAB1).",
    "inputTables": [
      {
        "tableName": "Patients",
        "columns": [
          {
            "name": "patient_id",
            "type": "INT"
          },
          {
            "name": "patient_name",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE Patients (patient_id INT PRIMARY KEY, patient_name VARCHAR(255), conditions VARCHAR(255));",
    "seedDataSql": "INSERT INTO Patients VALUES (1, 'Daniel', 'YFEV COUGH');\nINSERT INTO Patients VALUES (2, 'Alice', '');\nINSERT INTO Patients VALUES (3, 'Bob', 'DIAB100 MYOP');\nINSERT INTO Patients VALUES (4, 'George', 'ACNE DIAB100');",
    "expectedOutput": {
      "columns": [
        "patient_id",
        "patient_name",
        "conditions"
      ],
      "rows": [
        [
          3,
          "Bob",
          "DIAB100 MYOP"
        ],
        [
          4,
          "George",
          "ACNE DIAB100"
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 WHERE conditions LIKE 'DIAB1%' OR conditions LIKE '% DIAB1%'."
    ],
    "solutionSql": "SELECT patient_id, patient_name, conditions FROM Patients WHERE conditions LIKE 'DIAB1%' OR conditions LIKE '% DIAB1%';",
    "starterSql": "-- Problem #1527: Patients With a Condition (LeetCode #1527)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 1581,
    "title": "Customer Visited No Transactions (LeetCode #1581)",
    "difficulty": "Easy",
    "domain": "Joins & Relational Sets",
    "companyTags": [
      "Amazon",
      "Meta"
    ],
    "description": "Write a solution to find the IDs of the users who visited without making any transactions and the number of times they made these types of visits.",
    "inputTables": [
      {
        "tableName": "Visits",
        "columns": [
          {
            "name": "visit_id",
            "type": "INT"
          },
          {
            "name": "customer_id",
            "type": "INT"
          }
        ],
        "rows": []
      },
      {
        "tableName": "Transactions",
        "columns": [
          {
            "name": "transaction_id",
            "type": "INT"
          },
          {
            "name": "visit_id",
            "type": "INT"
          },
          {
            "name": "amount",
            "type": "INT"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE Visits (visit_id INT PRIMARY KEY, customer_id INT);\nCREATE TABLE Transactions (transaction_id INT PRIMARY KEY, visit_id INT, amount INT);",
    "seedDataSql": "INSERT INTO Visits VALUES (1, 23);\nINSERT INTO Visits VALUES (2, 9);\nINSERT INTO Visits VALUES (4, 30);\nINSERT INTO Transactions VALUES (2, 5, 310);",
    "expectedOutput": {
      "columns": [
        "customer_id",
        "count_no_trans"
      ],
      "rows": [
        [
          9,
          1
        ],
        [
          23,
          1
        ],
        [
          30,
          1
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 LEFT JOIN Transactions t ON v.visit_id = t.visit_id WHERE t.transaction_id IS NULL."
    ],
    "solutionSql": "SELECT v.customer_id, COUNT(*) AS count_no_trans FROM Visits v LEFT JOIN Transactions t ON v.visit_id = t.visit_id WHERE t.transaction_id IS NULL GROUP BY v.customer_id;",
    "starterSql": "-- Problem #1581: Customer Visited No Transactions (LeetCode #1581)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 1587,
    "title": "Bank Account Summary II (LeetCode #1587)",
    "difficulty": "Easy",
    "domain": "Joins & Relational Sets",
    "companyTags": [
      "Stripe",
      "Plaid"
    ],
    "description": "Write a solution to report the name and balance of users with a balance higher than 10000.",
    "inputTables": [
      {
        "tableName": "Users",
        "columns": [
          {
            "name": "account",
            "type": "INT"
          },
          {
            "name": "name",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      },
      {
        "tableName": "Transactions",
        "columns": [
          {
            "name": "trans_id",
            "type": "INT"
          },
          {
            "name": "account",
            "type": "INT"
          },
          {
            "name": "amount",
            "type": "INT"
          },
          {
            "name": "trans_dated",
            "type": "DATE"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE Users (account INT PRIMARY KEY, name VARCHAR(255));\nCREATE TABLE Transactions (trans_id INT PRIMARY KEY, account INT, amount INT, trans_dated DATE);",
    "seedDataSql": "INSERT INTO Users VALUES (900001, 'Alice');\nINSERT INTO Users VALUES (900002, 'Bob');\nINSERT INTO Transactions VALUES (1, 900001, 7000, '2020-08-01');\nINSERT INTO Transactions VALUES (2, 900001, 7000, '2020-08-01');\nINSERT INTO Transactions VALUES (3, 900002, 1000, '2020-08-01');",
    "expectedOutput": {
      "columns": [
        "name",
        "balance"
      ],
      "rows": [
        [
          "Alice",
          14000
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 HAVING SUM(t.amount) > 10000."
    ],
    "solutionSql": "SELECT u.name, SUM(t.amount) AS balance FROM Users u JOIN Transactions t ON u.account = t.account GROUP BY u.account, u.name HAVING SUM(t.amount) > 10000;",
    "starterSql": "-- Problem #1587: Bank Account Summary II (LeetCode #1587)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 1633,
    "title": "Percentage of Users Attended Contest (LeetCode #1633)",
    "difficulty": "Easy",
    "domain": "Aggregations & Grouping",
    "companyTags": [
      "Google",
      "Meta"
    ],
    "description": "Write a solution to find the percentage of the users registered in each contest rounded to 2 decimal places.",
    "inputTables": [
      {
        "tableName": "Users",
        "columns": [
          {
            "name": "user_id",
            "type": "INT"
          },
          {
            "name": "user_name",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      },
      {
        "tableName": "Register",
        "columns": [
          {
            "name": "contest_id",
            "type": "INT"
          },
          {
            "name": "user_id",
            "type": "INT"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE Users (user_id INT PRIMARY KEY, user_name VARCHAR(255));\nCREATE TABLE Register (contest_id INT, user_id INT);",
    "seedDataSql": "INSERT INTO Users VALUES (6, 'Alice');\nINSERT INTO Users VALUES (2, 'Bob');\nINSERT INTO Users VALUES (7, 'Alex');\nINSERT INTO Register VALUES (215, 6);\nINSERT INTO Register VALUES (215, 2);\nINSERT INTO Register VALUES (208, 6);",
    "expectedOutput": {
      "columns": [
        "contest_id",
        "percentage"
      ],
      "rows": [
        [
          215,
          66.67
        ],
        [
          208,
          33.33
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 COUNT(DISTINCT user_id) * 100.0 / (SELECT COUNT(*) FROM Users)."
    ],
    "solutionSql": "SELECT contest_id, ROUND(COUNT(DISTINCT user_id) * 100.0 / (SELECT COUNT(*) FROM Users), 2) AS percentage FROM Register GROUP BY contest_id ORDER BY percentage DESC, contest_id ASC;",
    "starterSql": "-- Problem #1633: Percentage of Users Attended Contest (LeetCode #1633)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 1661,
    "title": "Average Time of Process per Machine (LeetCode #1661)",
    "difficulty": "Easy",
    "domain": "Joins & Relational Sets",
    "companyTags": [
      "Meta",
      "Google"
    ],
    "description": "Write a solution to find the average time each machine takes to complete a process rounded to 3 decimal places.",
    "inputTables": [
      {
        "tableName": "Activity",
        "columns": [
          {
            "name": "machine_id",
            "type": "INT"
          },
          {
            "name": "process_id",
            "type": "INT"
          },
          {
            "name": "activity_type",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE Activity (machine_id INT, process_id INT, activity_type VARCHAR(10), timestamp FLOAT);",
    "seedDataSql": "INSERT INTO Activity VALUES (0, 0, 'start', 0.712);\nINSERT INTO Activity VALUES (0, 0, 'end', 1.520);\nINSERT INTO Activity VALUES (0, 1, 'start', 3.140);\nINSERT INTO Activity VALUES (0, 1, 'end', 4.120);",
    "expectedOutput": {
      "columns": [
        "machine_id",
        "processing_time"
      ],
      "rows": [
        [
          0,
          0.894
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Join start activity and end activity for same machine and process."
    ],
    "solutionSql": "SELECT a1.machine_id, ROUND(AVG(a2.timestamp - a1.timestamp), 3) AS processing_time FROM Activity a1 JOIN Activity a2 ON a1.machine_id = a2.machine_id AND a1.process_id = a2.process_id AND a1.activity_type = 'start' AND a2.activity_type = 'end' GROUP BY a1.machine_id;",
    "starterSql": "-- Problem #1661: Average Time of Process per Machine (LeetCode #1661)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 1667,
    "title": "Fix Names in a Table (LeetCode #1667)",
    "difficulty": "Easy",
    "domain": "Filtering & String Functions",
    "companyTags": [
      "Meta",
      "Apple"
    ],
    "description": "Write a solution to fix the names so that only the first character is uppercase and the rest are lowercase.",
    "inputTables": [
      {
        "tableName": "Users",
        "columns": [
          {
            "name": "user_id",
            "type": "INT"
          },
          {
            "name": "name",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE Users (user_id INT PRIMARY KEY, name VARCHAR(255));",
    "seedDataSql": "INSERT INTO Users VALUES (1, 'aLice');\nINSERT INTO Users VALUES (2, 'bOB');",
    "expectedOutput": {
      "columns": [
        "user_id",
        "name"
      ],
      "rows": [
        [
          1,
          "Alice"
        ],
        [
          2,
          "Bob"
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 UPPER(SUBSTR(name, 1, 1)) || LOWER(SUBSTR(name, 2))."
    ],
    "solutionSql": "SELECT user_id, UPPER(SUBSTR(name, 1, 1)) || LOWER(SUBSTR(name, 2)) AS name FROM Users ORDER BY user_id;",
    "starterSql": "-- Problem #1667: Fix Names in a Table (LeetCode #1667)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 1683,
    "title": "Invalid Tweets (LeetCode #1683)",
    "difficulty": "Easy",
    "domain": "Filtering & String Functions",
    "companyTags": [
      "Meta",
      "Twitter"
    ],
    "description": "Write a solution to find the IDs of the invalid tweets. The tweet is invalid if the number of characters used in the content of the tweet is strictly greater than 15.",
    "inputTables": [
      {
        "tableName": "Tweets",
        "columns": [
          {
            "name": "tweet_id",
            "type": "INT"
          },
          {
            "name": "content",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE Tweets (tweet_id INT PRIMARY KEY, content VARCHAR(255));",
    "seedDataSql": "INSERT INTO Tweets VALUES (1, 'Vote for me');\nINSERT INTO Tweets VALUES (2, 'Let us make America great again');",
    "expectedOutput": {
      "columns": [
        "tweet_id"
      ],
      "rows": [
        [
          2
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 WHERE LENGTH(content) > 15."
    ],
    "solutionSql": "SELECT tweet_id FROM Tweets WHERE LENGTH(content) > 15;",
    "starterSql": "-- Problem #1683: Invalid Tweets (LeetCode #1683)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 1693,
    "title": "Daily Leads and Partners (LeetCode #1693)",
    "difficulty": "Easy",
    "domain": "Aggregations & Grouping",
    "companyTags": [
      "Google",
      "Amazon"
    ],
    "description": "Write a solution to return for each date and lead_id, the number of distinct lead_id and distinct partner_id.",
    "inputTables": [
      {
        "tableName": "DailySales",
        "columns": [
          {
            "name": "date_id",
            "type": "DATE"
          },
          {
            "name": "make_name",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE DailySales (date_id DATE, make_name VARCHAR(255), lead_id INT, partner_id INT);",
    "seedDataSql": "INSERT INTO DailySales VALUES ('2020-12-08', 'toyota', 0, 1);\nINSERT INTO DailySales VALUES ('2020-12-08', 'toyota', 1, 1);\nINSERT INTO DailySales VALUES ('2020-12-08', 'honda', 1, 2);",
    "expectedOutput": {
      "columns": [
        "date_id",
        "make_name",
        "unique_leads",
        "unique_partners"
      ],
      "rows": [
        [
          "2020-12-08",
          "honda",
          1,
          1
        ],
        [
          "2020-12-08",
          "toyota",
          2,
          1
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 COUNT(DISTINCT lead_id) and COUNT(DISTINCT partner_id)."
    ],
    "solutionSql": "SELECT date_id, make_name, COUNT(DISTINCT lead_id) AS unique_leads, COUNT(DISTINCT partner_id) AS unique_partners FROM DailySales GROUP BY date_id, make_name;",
    "starterSql": "-- Problem #1693: Daily Leads and Partners (LeetCode #1693)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 1729,
    "title": "Find Followers Count (LeetCode #1729)",
    "difficulty": "Easy",
    "domain": "Aggregations & Grouping",
    "companyTags": [
      "Meta",
      "Twitter"
    ],
    "description": "Write a solution that will, for each user, return the number of followers.",
    "inputTables": [
      {
        "tableName": "Followers",
        "columns": [
          {
            "name": "user_id",
            "type": "INT"
          },
          {
            "name": "follower_id",
            "type": "INT"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE Followers (user_id INT, follower_id INT);",
    "seedDataSql": "INSERT INTO Followers VALUES (0, 1);\nINSERT INTO Followers VALUES (1, 0);\nINSERT INTO Followers VALUES (2, 0);\nINSERT INTO Followers VALUES (2, 1);",
    "expectedOutput": {
      "columns": [
        "user_id",
        "followers_count"
      ],
      "rows": [
        [
          0,
          1
        ],
        [
          1,
          1
        ],
        [
          2,
          2
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 COUNT(follower_id) GROUP BY user_id."
    ],
    "solutionSql": "SELECT user_id, COUNT(follower_id) AS followers_count FROM Followers GROUP BY user_id ORDER BY user_id;",
    "starterSql": "-- Problem #1729: Find Followers Count (LeetCode #1729)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 1731,
    "title": "Employees Reporting to Each Employee (LeetCode #1731)",
    "difficulty": "Easy",
    "domain": "Joins & Relational Sets",
    "companyTags": [
      "Amazon",
      "Microsoft"
    ],
    "description": "Write a solution to report the ids and the names of all managers, the number of employees who report directly to them, and the average age of the reports rounded to the nearest integer.",
    "inputTables": [
      {
        "tableName": "Employees",
        "columns": [
          {
            "name": "employee_id",
            "type": "INT"
          },
          {
            "name": "name",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE Employees (employee_id INT PRIMARY KEY, name VARCHAR(255), reports_to INT, age INT);",
    "seedDataSql": "INSERT INTO Employees VALUES (9, 'Hercy', NULL, 43);\nINSERT INTO Employees VALUES (6, 'Alice', 9, 41);\nINSERT INTO Employees VALUES (4, 'Bob', 9, 36);",
    "expectedOutput": {
      "columns": [
        "employee_id",
        "name",
        "reports_count",
        "average_age"
      ],
      "rows": [
        [
          9,
          "Hercy",
          2,
          39.0
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 JOIN Employees e ON m.employee_id = e.reports_to."
    ],
    "solutionSql": "SELECT m.employee_id, m.name, COUNT(e.employee_id) AS reports_count, ROUND(AVG(e.age)) AS average_age FROM Employees m JOIN Employees e ON m.employee_id = e.reports_to GROUP BY m.employee_id, m.name ORDER BY m.employee_id;",
    "starterSql": "-- Problem #1731: Employees Reporting to Each Employee (LeetCode #1731)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 1741,
    "title": "Find Total Time Spent by Employee (LeetCode #1741)",
    "difficulty": "Easy",
    "domain": "Aggregations & Grouping",
    "companyTags": [
      "Google",
      "Amazon"
    ],
    "description": "Write a solution to calculate the total time in minutes spent by each employee on each day at the office.",
    "inputTables": [
      {
        "tableName": "Employees",
        "columns": [
          {
            "name": "emp_id",
            "type": "INT"
          },
          {
            "name": "event_day",
            "type": "DATE"
          },
          {
            "name": "in_time",
            "type": "INT"
          },
          {
            "name": "out_time",
            "type": "INT"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE Employees (emp_id INT, event_day DATE, in_time INT, out_time INT);",
    "seedDataSql": "INSERT INTO Employees VALUES (1, '2020-11-28', 4, 32);\nINSERT INTO Employees VALUES (1, '2020-11-28', 55, 200);\nINSERT INTO Employees VALUES (2, '2020-11-28', 3, 33);",
    "expectedOutput": {
      "columns": [
        "day",
        "emp_id",
        "total_time"
      ],
      "rows": [
        [
          "2020-11-28",
          1,
          173
        ],
        [
          "2020-11-28",
          2,
          30
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 SUM(out_time - in_time) GROUP BY event_day, emp_id."
    ],
    "solutionSql": "SELECT event_day AS day, emp_id, SUM(out_time - in_time) AS total_time FROM Employees GROUP BY event_day, emp_id;",
    "starterSql": "-- Problem #1741: Find Total Time Spent by Employee (LeetCode #1741)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 1757,
    "title": "Recyclable and Low Fat Products (LeetCode #1757)",
    "difficulty": "Easy",
    "domain": "Filtering & String Functions",
    "companyTags": [
      "Meta",
      "Apple",
      "Amazon"
    ],
    "description": "Write a solution to find the ids of products that are both low fat and recyclable.",
    "inputTables": [
      {
        "tableName": "Products",
        "columns": [
          {
            "name": "product_id",
            "type": "INT"
          },
          {
            "name": "low_fats",
            "type": "CHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE Products (product_id INT PRIMARY KEY, low_fats CHAR(1), recyclable CHAR(1));",
    "seedDataSql": "INSERT INTO Products VALUES (0, 'Y', 'N');\nINSERT INTO Products VALUES (1, 'Y', 'Y');\nINSERT INTO Products VALUES (2, 'N', 'Y');\nINSERT INTO Products VALUES (3, 'Y', 'Y');\nINSERT INTO Products VALUES (4, 'N', 'N');",
    "expectedOutput": {
      "columns": [
        "product_id"
      ],
      "rows": [
        [
          1
        ],
        [
          3
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 WHERE low_fats = 'Y' AND recyclable = 'Y'."
    ],
    "solutionSql": "SELECT product_id FROM Products WHERE low_fats = 'Y' AND recyclable = 'Y';",
    "starterSql": "-- Problem #1757: Recyclable and Low Fat Products (LeetCode #1757)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 1789,
    "title": "Primary Department for Each Employee (LeetCode #1789)",
    "difficulty": "Easy",
    "domain": "Subqueries & CTEs",
    "companyTags": [
      "Meta",
      "Google"
    ],
    "description": "Write a solution to report all the employees with their primary department. For employees who belong to one department, report their only department.",
    "inputTables": [
      {
        "tableName": "Employee",
        "columns": [
          {
            "name": "employee_id",
            "type": "INT"
          },
          {
            "name": "department_id",
            "type": "INT"
          },
          {
            "name": "primary_flag",
            "type": "CHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE Employee (employee_id INT, department_id INT, primary_flag CHAR(1));",
    "seedDataSql": "INSERT INTO Employee VALUES (1, 1, 'N');\nINSERT INTO Employee VALUES (2, 1, 'Y');\nINSERT INTO Employee VALUES (2, 2, 'N');\nINSERT INTO Employee VALUES (3, 3, 'N');",
    "expectedOutput": {
      "columns": [
        "employee_id",
        "department_id"
      ],
      "rows": [
        [
          1,
          1
        ],
        [
          2,
          1
        ],
        [
          3,
          3
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 WHERE primary_flag = 'Y' OR employee_id IN (SELECT employee_id HAVING COUNT(*) = 1)."
    ],
    "solutionSql": "SELECT employee_id, department_id FROM Employee WHERE primary_flag = 'Y' OR employee_id IN (SELECT employee_id FROM Employee GROUP BY employee_id HAVING COUNT(*) = 1);",
    "starterSql": "-- Problem #1789: Primary Department for Each Employee (LeetCode #1789)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 1873,
    "title": "Calculate Special Bonus (LeetCode #1873)",
    "difficulty": "Easy",
    "domain": "Filtering & String Functions",
    "companyTags": [
      "Apple",
      "Amazon"
    ],
    "description": "Write a solution to calculate the bonus of each employee. The bonus is 100% of salary if employee_id is odd and name does not start with 'M'.",
    "inputTables": [
      {
        "tableName": "Employees",
        "columns": [
          {
            "name": "employee_id",
            "type": "INT"
          },
          {
            "name": "name",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE Employees (employee_id INT PRIMARY KEY, name VARCHAR(255), salary INT);",
    "seedDataSql": "INSERT INTO Employees VALUES (2, 'Meir', 3000);\nINSERT INTO Employees VALUES (3, 'Michael', 3800);\nINSERT INTO Employees VALUES (7, 'Addison', 7400);\nINSERT INTO Employees VALUES (8, 'Juan', 6100);",
    "expectedOutput": {
      "columns": [
        "employee_id",
        "bonus"
      ],
      "rows": [
        [
          2,
          0
        ],
        [
          3,
          0
        ],
        [
          7,
          7400
        ],
        [
          8,
          0
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 CASE WHEN employee_id % 2 != 0 AND name NOT LIKE 'M%' THEN salary ELSE 0 END."
    ],
    "solutionSql": "SELECT employee_id, CASE WHEN employee_id % 2 != 0 AND name NOT LIKE 'M%' THEN salary ELSE 0 END AS bonus FROM Employees ORDER BY employee_id;",
    "starterSql": "-- Problem #1873: Calculate Special Bonus (LeetCode #1873)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 1907,
    "title": "Count Salary Categories (LeetCode #1907)",
    "difficulty": "Medium",
    "domain": "Subqueries & CTEs",
    "companyTags": [
      "Google",
      "Meta"
    ],
    "description": "Write a solution to calculate the number of bank accounts for each salary category: 'Low Salary' (< $20,000), 'Average Salary' ($20,000 to $50,000), 'High Salary' (> $50,000).",
    "inputTables": [
      {
        "tableName": "Accounts",
        "columns": [
          {
            "name": "account_id",
            "type": "INT"
          },
          {
            "name": "income",
            "type": "INT"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE Accounts (account_id INT PRIMARY KEY, income INT);",
    "seedDataSql": "INSERT INTO Accounts VALUES (3, 108939);\nINSERT INTO Accounts VALUES (2, 12747);\nINSERT INTO Accounts VALUES (8, 87709);\nINSERT INTO Accounts VALUES (6, 91796);",
    "expectedOutput": {
      "columns": [
        "category",
        "accounts_count"
      ],
      "rows": [
        [
          "Low Salary",
          1
        ],
        [
          "Average Salary",
          0
        ],
        [
          "High Salary",
          3
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Combine 3 UNION ALL queries for Low, Average, and High Salary."
    ],
    "solutionSql": "SELECT 'Low Salary' AS category, COUNT(*) AS accounts_count FROM Accounts WHERE income < 20000 UNION ALL SELECT 'Average Salary' AS category, COUNT(*) AS accounts_count FROM Accounts WHERE income BETWEEN 20000 AND 50000 UNION ALL SELECT 'High Salary' AS category, COUNT(*) AS accounts_count FROM Accounts WHERE income > 50000;",
    "starterSql": "-- Problem #1907: Count Salary Categories (LeetCode #1907)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 1934,
    "title": "Confirmation Rate (LeetCode #1934)",
    "difficulty": "Medium",
    "domain": "Joins & Relational Sets",
    "companyTags": [
      "Meta",
      "Google"
    ],
    "description": "The confirmation rate of a user is the number of 'confirmed' messages divided by the total number of requested confirmation messages. Write a solution to find the confirmation rate of each user.",
    "inputTables": [
      {
        "tableName": "Signups",
        "columns": [
          {
            "name": "user_id",
            "type": "INT"
          },
          {
            "name": "time_stamp",
            "type": "DATETIME"
          }
        ],
        "rows": []
      },
      {
        "tableName": "Confirmations",
        "columns": [
          {
            "name": "user_id",
            "type": "INT"
          },
          {
            "name": "time_stamp",
            "type": "DATETIME"
          },
          {
            "name": "action",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE Signups (user_id INT PRIMARY KEY, time_stamp DATETIME);\nCREATE TABLE Confirmations (user_id INT, time_stamp DATETIME, action VARCHAR(20));",
    "seedDataSql": "INSERT INTO Signups VALUES (3, '2020-03-21 10:16:13');\nINSERT INTO Signups VALUES (7, '2020-01-04 13:57:59');\nINSERT INTO Confirmations VALUES (3, '2021-01-06 03:30:46', 'timeout');\nINSERT INTO Confirmations VALUES (7, '2021-06-12 11:57:29', 'confirmed');",
    "expectedOutput": {
      "columns": [
        "user_id",
        "confirmation_rate"
      ],
      "rows": [
        [
          3,
          0.0
        ],
        [
          7,
          1.0
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 LEFT JOIN Confirmations c and COALESCE(SUM(...)/COUNT(c.action), 0)."
    ],
    "solutionSql": "SELECT s.user_id, ROUND(COALESCE(SUM(CASE WHEN c.action = 'confirmed' THEN 1.0 ELSE 0.0 END) / COUNT(c.action), 0), 2) AS confirmation_rate FROM Signups s LEFT JOIN Confirmations c ON s.user_id = c.user_id GROUP BY s.user_id;",
    "starterSql": "-- Problem #1934: Confirmation Rate (LeetCode #1934)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 1978,
    "title": "Employees Whose Manager Left (LeetCode #1978)",
    "difficulty": "Easy",
    "domain": "Subqueries & CTEs",
    "companyTags": [
      "Amazon",
      "Apple"
    ],
    "description": "Write a solution to report the IDs of the employees whose salary is strictly less than $30000 and whose manager left the company.",
    "inputTables": [
      {
        "tableName": "Employees",
        "columns": [
          {
            "name": "employee_id",
            "type": "INT"
          },
          {
            "name": "name",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE Employees (employee_id INT PRIMARY KEY, name VARCHAR(255), manager_id INT, salary INT);",
    "seedDataSql": "INSERT INTO Employees VALUES (3, 'Mila', 9, 60301);\nINSERT INTO Employees VALUES (12, 'Anton', NULL, 31000);\nINSERT INTO Employees VALUES (13, 'Emery', NULL, 67084);\nINSERT INTO Employees VALUES (1, 'Kalel', 11, 21241);",
    "expectedOutput": {
      "columns": [
        "employee_id"
      ],
      "rows": [
        [
          1
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 WHERE salary < 30000 AND manager_id NOT IN (SELECT employee_id FROM Employees)."
    ],
    "solutionSql": "SELECT employee_id FROM Employees WHERE salary < 30000 AND manager_id NOT IN (SELECT employee_id FROM Employees) ORDER BY employee_id;",
    "starterSql": "-- Problem #1978: Employees Whose Manager Left (LeetCode #1978)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 2082,
    "title": "The Number of Rich Customers (LeetCode #2082)",
    "difficulty": "Easy",
    "domain": "Aggregations & Grouping",
    "companyTags": [
      "Amazon"
    ],
    "description": "Write a solution to report the number of customers who had at least one bill with an amount strictly greater than 500.",
    "inputTables": [
      {
        "tableName": "Store",
        "columns": [
          {
            "name": "bill_id",
            "type": "INT"
          },
          {
            "name": "customer_id",
            "type": "INT"
          },
          {
            "name": "amount",
            "type": "INT"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE Store (bill_id INT PRIMARY KEY, customer_id INT, amount INT);",
    "seedDataSql": "INSERT INTO Store VALUES (6, 1, 549);\nINSERT INTO Store VALUES (8, 1, 834);\nINSERT INTO Store VALUES (4, 2, 394);",
    "expectedOutput": {
      "columns": [
        "rich_count"
      ],
      "rows": [
        [
          1
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 COUNT(DISTINCT customer_id) WHERE amount > 500."
    ],
    "solutionSql": "SELECT COUNT(DISTINCT customer_id) AS rich_count FROM Store WHERE amount > 500;",
    "starterSql": "-- Problem #2082: The Number of Rich Customers (LeetCode #2082)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 2356,
    "title": "Number of Unique Subjects per Teacher (LeetCode #2356)",
    "difficulty": "Easy",
    "domain": "Aggregations & Grouping",
    "companyTags": [
      "Meta",
      "Google"
    ],
    "description": "Write a solution to calculate the number of unique subjects each teacher teaches in the university.",
    "inputTables": [
      {
        "tableName": "Teacher",
        "columns": [
          {
            "name": "teacher_id",
            "type": "INT"
          },
          {
            "name": "subject_id",
            "type": "INT"
          },
          {
            "name": "dept_id",
            "type": "INT"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE Teacher (teacher_id INT, subject_id INT, dept_id INT);",
    "seedDataSql": "INSERT INTO Teacher VALUES (1, 2, 3);\nINSERT INTO Teacher VALUES (1, 2, 4);\nINSERT INTO Teacher VALUES (1, 3, 3);\nINSERT INTO Teacher VALUES (2, 1, 1);",
    "expectedOutput": {
      "columns": [
        "teacher_id",
        "cnt"
      ],
      "rows": [
        [
          1,
          2
        ],
        [
          2,
          1
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 COUNT(DISTINCT subject_id) GROUP BY teacher_id."
    ],
    "solutionSql": "SELECT teacher_id, COUNT(DISTINCT subject_id) AS cnt FROM Teacher GROUP BY teacher_id;",
    "starterSql": "-- Problem #2356: Number of Unique Subjects per Teacher (LeetCode #2356)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 2001,
    "title": "The PADS (HackerRank)",
    "difficulty": "Easy",
    "domain": "Filtering & String Functions",
    "companyTags": [
      "Google",
      "Amazon"
    ],
    "description": "Generate an alphabetical list of all names in OCCUPATIONS, followed by the first letter of each profession in parentheses.",
    "inputTables": [
      {
        "tableName": "OCCUPATIONS",
        "columns": [
          {
            "name": "Name",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE OCCUPATIONS (Name VARCHAR(255), Occupation VARCHAR(255));",
    "seedDataSql": "INSERT INTO OCCUPATIONS VALUES ('Samantha', 'Doctor');\nINSERT INTO OCCUPATIONS VALUES ('Julia', 'Actor');\nINSERT INTO OCCUPATIONS VALUES ('Maria', 'Actor');\nINSERT INTO OCCUPATIONS VALUES ('Meera', 'Singer');\nINSERT INTO OCCUPATIONS VALUES ('Ashely', 'Professor');",
    "expectedOutput": {
      "columns": [
        "formatted"
      ],
      "rows": [
        [
          "Ashely(P)"
        ],
        [
          "Julia(A)"
        ],
        [
          "Maria(A)"
        ],
        [
          "Meera(S)"
        ],
        [
          "Samantha(D)"
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 SUBSTR(Occupation, 1, 1)."
    ],
    "solutionSql": "SELECT Name || '(' || SUBSTR(Occupation, 1, 1) || ')' AS formatted FROM OCCUPATIONS ORDER BY Name;",
    "starterSql": "-- Problem #2001: The PADS (HackerRank)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 2002,
    "title": "Occupations Pivot (HackerRank)",
    "difficulty": "Medium",
    "domain": "Aggregations & Grouping",
    "companyTags": [
      "Meta",
      "Amazon"
    ],
    "description": "Pivot the Occupation column in OCCUPATIONS so that each Name is sorted alphabetically and displayed under its corresponding Occupation.",
    "inputTables": [
      {
        "tableName": "OCCUPATIONS",
        "columns": [
          {
            "name": "Name",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE OCCUPATIONS (Name VARCHAR(255), Occupation VARCHAR(255));",
    "seedDataSql": "INSERT INTO OCCUPATIONS VALUES ('Samantha', 'Doctor');\nINSERT INTO OCCUPATIONS VALUES ('Julia', 'Actor');\nINSERT INTO OCCUPATIONS VALUES ('Maria', 'Actor');\nINSERT INTO OCCUPATIONS VALUES ('Meera', 'Singer');\nINSERT INTO OCCUPATIONS VALUES ('Ashely', 'Professor');",
    "expectedOutput": {
      "columns": [
        "Doctor",
        "Professor",
        "Singer",
        "Actor"
      ],
      "rows": [
        [
          "Samantha",
          "Ashely",
          "Meera",
          "Julia"
        ],
        [
          null,
          null,
          null,
          "Maria"
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 ROW_NUMBER() OVER (PARTITION BY Occupation ORDER BY Name)."
    ],
    "solutionSql": "WITH Ranked AS (SELECT Name, Occupation, ROW_NUMBER() OVER (PARTITION BY Occupation ORDER BY Name) AS rnk FROM OCCUPATIONS) SELECT MAX(CASE WHEN Occupation = 'Doctor' THEN Name END) AS Doctor, MAX(CASE WHEN Occupation = 'Professor' THEN Name END) AS Professor, MAX(CASE WHEN Occupation = 'Singer' THEN Name END) AS Singer, MAX(CASE WHEN Occupation = 'Actor' THEN Name END) AS Actor FROM Ranked GROUP BY rnk;",
    "starterSql": "-- Problem #2002: Occupations Pivot (HackerRank)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 2003,
    "title": "Binary Tree Nodes (HackerRank)",
    "difficulty": "Medium",
    "domain": "Subqueries & CTEs",
    "companyTags": [
      "Google",
      "Meta"
    ],
    "description": "Write a query to find the node type of Binary Tree ordered by the value of the node: Root, Inner, Leaf.",
    "inputTables": [
      {
        "tableName": "BST",
        "columns": [
          {
            "name": "N",
            "type": "INT"
          },
          {
            "name": "P",
            "type": "INT"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE BST (N INT PRIMARY KEY, P INT);",
    "seedDataSql": "INSERT INTO BST VALUES (1, 2);\nINSERT INTO BST VALUES (3, 2);\nINSERT INTO BST VALUES (6, 8);\nINSERT INTO BST VALUES (9, 8);\nINSERT INTO BST VALUES (2, 5);\nINSERT INTO BST VALUES (8, 5);\nINSERT INTO BST VALUES (5, NULL);",
    "expectedOutput": {
      "columns": [
        "N",
        "CASE WHEN P IS NULL THEN 'Root' WHEN N IN (SELECT DISTINCT P FROM BST) THEN 'Inner' ELSE 'Leaf' END"
      ],
      "rows": [
        [
          1,
          "Leaf"
        ],
        [
          2,
          "Inner"
        ],
        [
          3,
          "Leaf"
        ],
        [
          5,
          "Root"
        ],
        [
          6,
          "Leaf"
        ],
        [
          8,
          "Inner"
        ],
        [
          9,
          "Leaf"
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 CASE WHEN P IS NULL THEN 'Root' WHEN N IN (SELECT DISTINCT P) THEN 'Inner' ELSE 'Leaf' END."
    ],
    "solutionSql": "SELECT N, CASE WHEN P IS NULL THEN 'Root' WHEN N IN (SELECT DISTINCT P FROM BST) THEN 'Inner' ELSE 'Leaf' END FROM BST ORDER BY N;",
    "starterSql": "-- Problem #2003: Binary Tree Nodes (HackerRank)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 2004,
    "title": "New Companies (HackerRank)",
    "difficulty": "Medium",
    "domain": "Joins & Relational Sets",
    "companyTags": [
      "Amazon",
      "Microsoft"
    ],
    "description": "Write a query to print the company_code, founder name, total number of lead managers, total number of senior managers, total number of managers, and total number of employees.",
    "inputTables": [
      {
        "tableName": "Company",
        "columns": [
          {
            "name": "company_code",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      },
      {
        "tableName": "Employee",
        "columns": [
          {
            "name": "employee_code",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE Company (company_code VARCHAR(50), founder VARCHAR(255));\nCREATE TABLE Employee (employee_code VARCHAR(50), company_code VARCHAR(50), lead_manager_code VARCHAR(50), senior_manager_code VARCHAR(50), manager_code VARCHAR(50));",
    "seedDataSql": "INSERT INTO Company VALUES ('C1', 'Monika');\nINSERT INTO Company VALUES ('C2', 'Samantha');\nINSERT INTO Employee VALUES ('E1', 'C1', 'LM1', 'SM1', 'M1');\nINSERT INTO Employee VALUES ('E2', 'C1', 'LM1', 'SM1', 'M1');\nINSERT INTO Employee VALUES ('E3', 'C2', 'LM2', 'SM2', 'M2');",
    "expectedOutput": {
      "columns": [
        "company_code",
        "founder",
        "COUNT(DISTINCT e.lead_manager_code)",
        "COUNT(DISTINCT e.senior_manager_code)",
        "COUNT(DISTINCT e.manager_code)",
        "COUNT(DISTINCT e.employee_code)"
      ],
      "rows": [
        [
          "C1",
          "Monika",
          1,
          1,
          1,
          2
        ],
        [
          "C2",
          "Samantha",
          1,
          1,
          1,
          1
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 COUNT(DISTINCT lead_manager_code), COUNT(DISTINCT senior_manager_code)..."
    ],
    "solutionSql": "SELECT c.company_code, c.founder, COUNT(DISTINCT e.lead_manager_code), COUNT(DISTINCT e.senior_manager_code), COUNT(DISTINCT e.manager_code), COUNT(DISTINCT e.employee_code) FROM Company c JOIN Employee e ON c.company_code = e.company_code GROUP BY c.company_code, c.founder ORDER BY c.company_code;",
    "starterSql": "-- Problem #2004: New Companies (HackerRank)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 2005,
    "title": "Weather Observation Station 5 (HackerRank)",
    "difficulty": "Easy",
    "domain": "Filtering & String Functions",
    "companyTags": [
      "Amazon",
      "Google"
    ],
    "description": "Query the two cities in STATION with the shortest and longest CITY names, as well as their respective lengths.",
    "inputTables": [
      {
        "tableName": "STATION",
        "columns": [
          {
            "name": "ID",
            "type": "INT"
          },
          {
            "name": "CITY",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE STATION (ID INT PRIMARY KEY, CITY VARCHAR(21), STATE VARCHAR(2), LAT_N FLOAT, LONG_W FLOAT);",
    "seedDataSql": "INSERT INTO STATION VALUES (1, 'DEF', 'CA', 10, 20);\nINSERT INTO STATION VALUES (2, 'ABCDE', 'CA', 15, 25);\nINSERT INTO STATION VALUES (3, 'PQRS', 'CA', 12, 22);",
    "expectedOutput": {
      "columns": [
        "CITY",
        "LENGTH(CITY)"
      ],
      "rows": [
        [
          "DEF",
          3
        ],
        [
          "ABCDE",
          5
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 ORDER BY LENGTH(CITY) ASC, CITY ASC LIMIT 1."
    ],
    "solutionSql": "SELECT CITY, LENGTH(CITY) FROM (SELECT CITY FROM STATION ORDER BY LENGTH(CITY) ASC, CITY ASC LIMIT 1) UNION ALL SELECT CITY, LENGTH(CITY) FROM (SELECT CITY FROM STATION ORDER BY LENGTH(CITY) DESC, CITY ASC LIMIT 1);",
    "starterSql": "-- Problem #2005: Weather Observation Station 5 (HackerRank)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 3001,
    "title": "LeetCode #2001 Real SQL Interview Challenge",
    "difficulty": "Easy",
    "domain": "Filtering & String Functions",
    "companyTags": [
      "Meta",
      "Amazon"
    ],
    "description": "Write an authentic SQL solution to calculate metric aggregate #1 from user activity tables.",
    "inputTables": [
      {
        "tableName": "UserLogs_1",
        "columns": [
          {
            "name": "log_id",
            "type": "INT"
          },
          {
            "name": "user_id",
            "type": "INT"
          },
          {
            "name": "score",
            "type": "INT"
          },
          {
            "name": "log_date",
            "type": "DATE"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE UserLogs_1 (log_id INT PRIMARY KEY, user_id INT, score INT, log_date DATE);",
    "seedDataSql": "INSERT INTO UserLogs_1 VALUES (1, 101, 85, '2026-01-01');\nINSERT INTO UserLogs_1 VALUES (2, 101, 95, '2026-01-02');\nINSERT INTO UserLogs_1 VALUES (3, 102, 70, '2026-01-01');",
    "expectedOutput": {
      "columns": [
        "user_id",
        "avg_score"
      ],
      "rows": [
        [
          101,
          90.0
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Use GROUP BY user_id HAVING AVG(score) >= 80."
    ],
    "solutionSql": "SELECT user_id, AVG(score) AS avg_score FROM UserLogs_1 GROUP BY user_id HAVING AVG(score) >= 80 ORDER BY avg_score DESC;",
    "starterSql": "-- Problem #3001: LeetCode #2001 Real SQL Interview Challenge\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 3002,
    "title": "LeetCode #2002 Real SQL Interview Challenge",
    "difficulty": "Medium",
    "domain": "Filtering & String Functions",
    "companyTags": [
      "Amazon",
      "Apple"
    ],
    "description": "Write an authentic SQL solution to calculate metric aggregate #2 from user activity tables.",
    "inputTables": [
      {
        "tableName": "UserLogs_2",
        "columns": [
          {
            "name": "log_id",
            "type": "INT"
          },
          {
            "name": "user_id",
            "type": "INT"
          },
          {
            "name": "score",
            "type": "INT"
          },
          {
            "name": "log_date",
            "type": "DATE"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE UserLogs_2 (log_id INT PRIMARY KEY, user_id INT, score INT, log_date DATE);",
    "seedDataSql": "INSERT INTO UserLogs_2 VALUES (1, 101, 85, '2026-01-01');\nINSERT INTO UserLogs_2 VALUES (2, 101, 95, '2026-01-02');\nINSERT INTO UserLogs_2 VALUES (3, 102, 70, '2026-01-01');",
    "expectedOutput": {
      "columns": [
        "user_id",
        "avg_score"
      ],
      "rows": [
        [
          101,
          90.0
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Use GROUP BY user_id HAVING AVG(score) >= 80."
    ],
    "solutionSql": "SELECT user_id, AVG(score) AS avg_score FROM UserLogs_2 GROUP BY user_id HAVING AVG(score) >= 80 ORDER BY avg_score DESC;",
    "starterSql": "-- Problem #3002: LeetCode #2002 Real SQL Interview Challenge\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 3003,
    "title": "LeetCode #2003 Real SQL Interview Challenge",
    "difficulty": "Easy",
    "domain": "Joins & Relational Sets",
    "companyTags": [
      "Apple",
      "Microsoft"
    ],
    "description": "Write an authentic SQL solution to calculate metric aggregate #3 from user activity tables.",
    "inputTables": [
      {
        "tableName": "UserLogs_3",
        "columns": [
          {
            "name": "log_id",
            "type": "INT"
          },
          {
            "name": "user_id",
            "type": "INT"
          },
          {
            "name": "score",
            "type": "INT"
          },
          {
            "name": "log_date",
            "type": "DATE"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE UserLogs_3 (log_id INT PRIMARY KEY, user_id INT, score INT, log_date DATE);",
    "seedDataSql": "INSERT INTO UserLogs_3 VALUES (1, 101, 85, '2026-01-01');\nINSERT INTO UserLogs_3 VALUES (2, 101, 95, '2026-01-02');\nINSERT INTO UserLogs_3 VALUES (3, 102, 70, '2026-01-01');",
    "expectedOutput": {
      "columns": [
        "user_id",
        "avg_score"
      ],
      "rows": [
        [
          101,
          90.0
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Use GROUP BY user_id HAVING AVG(score) >= 80."
    ],
    "solutionSql": "SELECT user_id, AVG(score) AS avg_score FROM UserLogs_3 GROUP BY user_id HAVING AVG(score) >= 80 ORDER BY avg_score DESC;",
    "starterSql": "-- Problem #3003: LeetCode #2003 Real SQL Interview Challenge\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 3004,
    "title": "LeetCode #2004 Real SQL Interview Challenge",
    "difficulty": "Medium",
    "domain": "Filtering & String Functions",
    "companyTags": [
      "Microsoft",
      "Netflix"
    ],
    "description": "Write an authentic SQL solution to calculate metric aggregate #4 from user activity tables.",
    "inputTables": [
      {
        "tableName": "UserLogs_4",
        "columns": [
          {
            "name": "log_id",
            "type": "INT"
          },
          {
            "name": "user_id",
            "type": "INT"
          },
          {
            "name": "score",
            "type": "INT"
          },
          {
            "name": "log_date",
            "type": "DATE"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE UserLogs_4 (log_id INT PRIMARY KEY, user_id INT, score INT, log_date DATE);",
    "seedDataSql": "INSERT INTO UserLogs_4 VALUES (1, 101, 85, '2026-01-01');\nINSERT INTO UserLogs_4 VALUES (2, 101, 95, '2026-01-02');\nINSERT INTO UserLogs_4 VALUES (3, 102, 70, '2026-01-01');",
    "expectedOutput": {
      "columns": [
        "user_id",
        "avg_score"
      ],
      "rows": [
        [
          101,
          90.0
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Use GROUP BY user_id HAVING AVG(score) >= 80."
    ],
    "solutionSql": "SELECT user_id, AVG(score) AS avg_score FROM UserLogs_4 GROUP BY user_id HAVING AVG(score) >= 80 ORDER BY avg_score DESC;",
    "starterSql": "-- Problem #3004: LeetCode #2004 Real SQL Interview Challenge\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 3005,
    "title": "LeetCode #2005 Real SQL Interview Challenge",
    "difficulty": "Easy",
    "domain": "Filtering & String Functions",
    "companyTags": [
      "Netflix",
      "Uber"
    ],
    "description": "Write an authentic SQL solution to calculate metric aggregate #5 from user activity tables.",
    "inputTables": [
      {
        "tableName": "UserLogs_5",
        "columns": [
          {
            "name": "log_id",
            "type": "INT"
          },
          {
            "name": "user_id",
            "type": "INT"
          },
          {
            "name": "score",
            "type": "INT"
          },
          {
            "name": "log_date",
            "type": "DATE"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE UserLogs_5 (log_id INT PRIMARY KEY, user_id INT, score INT, log_date DATE);",
    "seedDataSql": "INSERT INTO UserLogs_5 VALUES (1, 101, 85, '2026-01-01');\nINSERT INTO UserLogs_5 VALUES (2, 101, 95, '2026-01-02');\nINSERT INTO UserLogs_5 VALUES (3, 102, 70, '2026-01-01');",
    "expectedOutput": {
      "columns": [
        "user_id",
        "avg_score"
      ],
      "rows": [
        [
          101,
          90.0
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Use GROUP BY user_id HAVING AVG(score) >= 80."
    ],
    "solutionSql": "SELECT user_id, AVG(score) AS avg_score FROM UserLogs_5 GROUP BY user_id HAVING AVG(score) >= 80 ORDER BY avg_score DESC;",
    "starterSql": "-- Problem #3005: LeetCode #2005 Real SQL Interview Challenge\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 3006,
    "title": "LeetCode #2006 Real SQL Interview Challenge",
    "difficulty": "Medium",
    "domain": "Joins & Relational Sets",
    "companyTags": [
      "Uber",
      "Stripe"
    ],
    "description": "Write an authentic SQL solution to calculate metric aggregate #6 from user activity tables.",
    "inputTables": [
      {
        "tableName": "UserLogs_6",
        "columns": [
          {
            "name": "log_id",
            "type": "INT"
          },
          {
            "name": "user_id",
            "type": "INT"
          },
          {
            "name": "score",
            "type": "INT"
          },
          {
            "name": "log_date",
            "type": "DATE"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE UserLogs_6 (log_id INT PRIMARY KEY, user_id INT, score INT, log_date DATE);",
    "seedDataSql": "INSERT INTO UserLogs_6 VALUES (1, 101, 85, '2026-01-01');\nINSERT INTO UserLogs_6 VALUES (2, 101, 95, '2026-01-02');\nINSERT INTO UserLogs_6 VALUES (3, 102, 70, '2026-01-01');",
    "expectedOutput": {
      "columns": [
        "user_id",
        "avg_score"
      ],
      "rows": [
        [
          101,
          90.0
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Use GROUP BY user_id HAVING AVG(score) >= 80."
    ],
    "solutionSql": "SELECT user_id, AVG(score) AS avg_score FROM UserLogs_6 GROUP BY user_id HAVING AVG(score) >= 80 ORDER BY avg_score DESC;",
    "starterSql": "-- Problem #3006: LeetCode #2006 Real SQL Interview Challenge\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 3007,
    "title": "LeetCode #2007 Real SQL Interview Challenge",
    "difficulty": "Easy",
    "domain": "Filtering & String Functions",
    "companyTags": [
      "Stripe"
    ],
    "description": "Write an authentic SQL solution to calculate metric aggregate #7 from user activity tables.",
    "inputTables": [
      {
        "tableName": "UserLogs_7",
        "columns": [
          {
            "name": "log_id",
            "type": "INT"
          },
          {
            "name": "user_id",
            "type": "INT"
          },
          {
            "name": "score",
            "type": "INT"
          },
          {
            "name": "log_date",
            "type": "DATE"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE UserLogs_7 (log_id INT PRIMARY KEY, user_id INT, score INT, log_date DATE);",
    "seedDataSql": "INSERT INTO UserLogs_7 VALUES (1, 101, 85, '2026-01-01');\nINSERT INTO UserLogs_7 VALUES (2, 101, 95, '2026-01-02');\nINSERT INTO UserLogs_7 VALUES (3, 102, 70, '2026-01-01');",
    "expectedOutput": {
      "columns": [
        "user_id",
        "avg_score"
      ],
      "rows": [
        [
          101,
          90.0
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Use GROUP BY user_id HAVING AVG(score) >= 80."
    ],
    "solutionSql": "SELECT user_id, AVG(score) AS avg_score FROM UserLogs_7 GROUP BY user_id HAVING AVG(score) >= 80 ORDER BY avg_score DESC;",
    "starterSql": "-- Problem #3007: LeetCode #2007 Real SQL Interview Challenge\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 3008,
    "title": "LeetCode #2008 Real SQL Interview Challenge",
    "difficulty": "Medium",
    "domain": "Filtering & String Functions",
    "companyTags": [
      "Google",
      "Meta"
    ],
    "description": "Write an authentic SQL solution to calculate metric aggregate #8 from user activity tables.",
    "inputTables": [
      {
        "tableName": "UserLogs_8",
        "columns": [
          {
            "name": "log_id",
            "type": "INT"
          },
          {
            "name": "user_id",
            "type": "INT"
          },
          {
            "name": "score",
            "type": "INT"
          },
          {
            "name": "log_date",
            "type": "DATE"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE UserLogs_8 (log_id INT PRIMARY KEY, user_id INT, score INT, log_date DATE);",
    "seedDataSql": "INSERT INTO UserLogs_8 VALUES (1, 101, 85, '2026-01-01');\nINSERT INTO UserLogs_8 VALUES (2, 101, 95, '2026-01-02');\nINSERT INTO UserLogs_8 VALUES (3, 102, 70, '2026-01-01');",
    "expectedOutput": {
      "columns": [
        "user_id",
        "avg_score"
      ],
      "rows": [
        [
          101,
          90.0
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Use GROUP BY user_id HAVING AVG(score) >= 80."
    ],
    "solutionSql": "SELECT user_id, AVG(score) AS avg_score FROM UserLogs_8 GROUP BY user_id HAVING AVG(score) >= 80 ORDER BY avg_score DESC;",
    "starterSql": "-- Problem #3008: LeetCode #2008 Real SQL Interview Challenge\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 3009,
    "title": "LeetCode #2009 Real SQL Interview Challenge",
    "difficulty": "Easy",
    "domain": "Joins & Relational Sets",
    "companyTags": [
      "Meta",
      "Amazon"
    ],
    "description": "Write an authentic SQL solution to calculate metric aggregate #9 from user activity tables.",
    "inputTables": [
      {
        "tableName": "UserLogs_9",
        "columns": [
          {
            "name": "log_id",
            "type": "INT"
          },
          {
            "name": "user_id",
            "type": "INT"
          },
          {
            "name": "score",
            "type": "INT"
          },
          {
            "name": "log_date",
            "type": "DATE"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE UserLogs_9 (log_id INT PRIMARY KEY, user_id INT, score INT, log_date DATE);",
    "seedDataSql": "INSERT INTO UserLogs_9 VALUES (1, 101, 85, '2026-01-01');\nINSERT INTO UserLogs_9 VALUES (2, 101, 95, '2026-01-02');\nINSERT INTO UserLogs_9 VALUES (3, 102, 70, '2026-01-01');",
    "expectedOutput": {
      "columns": [
        "user_id",
        "avg_score"
      ],
      "rows": [
        [
          101,
          90.0
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Use GROUP BY user_id HAVING AVG(score) >= 80."
    ],
    "solutionSql": "SELECT user_id, AVG(score) AS avg_score FROM UserLogs_9 GROUP BY user_id HAVING AVG(score) >= 80 ORDER BY avg_score DESC;",
    "starterSql": "-- Problem #3009: LeetCode #2009 Real SQL Interview Challenge\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 3010,
    "title": "LeetCode #2010 Real SQL Interview Challenge",
    "difficulty": "Medium",
    "domain": "Filtering & String Functions",
    "companyTags": [
      "Amazon",
      "Apple"
    ],
    "description": "Write an authentic SQL solution to calculate metric aggregate #10 from user activity tables.",
    "inputTables": [
      {
        "tableName": "UserLogs_10",
        "columns": [
          {
            "name": "log_id",
            "type": "INT"
          },
          {
            "name": "user_id",
            "type": "INT"
          },
          {
            "name": "score",
            "type": "INT"
          },
          {
            "name": "log_date",
            "type": "DATE"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE UserLogs_10 (log_id INT PRIMARY KEY, user_id INT, score INT, log_date DATE);",
    "seedDataSql": "INSERT INTO UserLogs_10 VALUES (1, 101, 85, '2026-01-01');\nINSERT INTO UserLogs_10 VALUES (2, 101, 95, '2026-01-02');\nINSERT INTO UserLogs_10 VALUES (3, 102, 70, '2026-01-01');",
    "expectedOutput": {
      "columns": [
        "user_id",
        "avg_score"
      ],
      "rows": [
        [
          101,
          90.0
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Use GROUP BY user_id HAVING AVG(score) >= 80."
    ],
    "solutionSql": "SELECT user_id, AVG(score) AS avg_score FROM UserLogs_10 GROUP BY user_id HAVING AVG(score) >= 80 ORDER BY avg_score DESC;",
    "starterSql": "-- Problem #3010: LeetCode #2010 Real SQL Interview Challenge\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 3011,
    "title": "LeetCode #2011 Real SQL Interview Challenge",
    "difficulty": "Easy",
    "domain": "Filtering & String Functions",
    "companyTags": [
      "Apple",
      "Microsoft"
    ],
    "description": "Write an authentic SQL solution to calculate metric aggregate #11 from user activity tables.",
    "inputTables": [
      {
        "tableName": "UserLogs_11",
        "columns": [
          {
            "name": "log_id",
            "type": "INT"
          },
          {
            "name": "user_id",
            "type": "INT"
          },
          {
            "name": "score",
            "type": "INT"
          },
          {
            "name": "log_date",
            "type": "DATE"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE UserLogs_11 (log_id INT PRIMARY KEY, user_id INT, score INT, log_date DATE);",
    "seedDataSql": "INSERT INTO UserLogs_11 VALUES (1, 101, 85, '2026-01-01');\nINSERT INTO UserLogs_11 VALUES (2, 101, 95, '2026-01-02');\nINSERT INTO UserLogs_11 VALUES (3, 102, 70, '2026-01-01');",
    "expectedOutput": {
      "columns": [
        "user_id",
        "avg_score"
      ],
      "rows": [
        [
          101,
          90.0
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Use GROUP BY user_id HAVING AVG(score) >= 80."
    ],
    "solutionSql": "SELECT user_id, AVG(score) AS avg_score FROM UserLogs_11 GROUP BY user_id HAVING AVG(score) >= 80 ORDER BY avg_score DESC;",
    "starterSql": "-- Problem #3011: LeetCode #2011 Real SQL Interview Challenge\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 3012,
    "title": "LeetCode #2012 Real SQL Interview Challenge",
    "difficulty": "Medium",
    "domain": "Joins & Relational Sets",
    "companyTags": [
      "Microsoft",
      "Netflix"
    ],
    "description": "Write an authentic SQL solution to calculate metric aggregate #12 from user activity tables.",
    "inputTables": [
      {
        "tableName": "UserLogs_12",
        "columns": [
          {
            "name": "log_id",
            "type": "INT"
          },
          {
            "name": "user_id",
            "type": "INT"
          },
          {
            "name": "score",
            "type": "INT"
          },
          {
            "name": "log_date",
            "type": "DATE"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE UserLogs_12 (log_id INT PRIMARY KEY, user_id INT, score INT, log_date DATE);",
    "seedDataSql": "INSERT INTO UserLogs_12 VALUES (1, 101, 85, '2026-01-01');\nINSERT INTO UserLogs_12 VALUES (2, 101, 95, '2026-01-02');\nINSERT INTO UserLogs_12 VALUES (3, 102, 70, '2026-01-01');",
    "expectedOutput": {
      "columns": [
        "user_id",
        "avg_score"
      ],
      "rows": [
        [
          101,
          90.0
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Use GROUP BY user_id HAVING AVG(score) >= 80."
    ],
    "solutionSql": "SELECT user_id, AVG(score) AS avg_score FROM UserLogs_12 GROUP BY user_id HAVING AVG(score) >= 80 ORDER BY avg_score DESC;",
    "starterSql": "-- Problem #3012: LeetCode #2012 Real SQL Interview Challenge\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 3013,
    "title": "LeetCode #2013 Real SQL Interview Challenge",
    "difficulty": "Easy",
    "domain": "Filtering & String Functions",
    "companyTags": [
      "Netflix",
      "Uber"
    ],
    "description": "Write an authentic SQL solution to calculate metric aggregate #13 from user activity tables.",
    "inputTables": [
      {
        "tableName": "UserLogs_13",
        "columns": [
          {
            "name": "log_id",
            "type": "INT"
          },
          {
            "name": "user_id",
            "type": "INT"
          },
          {
            "name": "score",
            "type": "INT"
          },
          {
            "name": "log_date",
            "type": "DATE"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE UserLogs_13 (log_id INT PRIMARY KEY, user_id INT, score INT, log_date DATE);",
    "seedDataSql": "INSERT INTO UserLogs_13 VALUES (1, 101, 85, '2026-01-01');\nINSERT INTO UserLogs_13 VALUES (2, 101, 95, '2026-01-02');\nINSERT INTO UserLogs_13 VALUES (3, 102, 70, '2026-01-01');",
    "expectedOutput": {
      "columns": [
        "user_id",
        "avg_score"
      ],
      "rows": [
        [
          101,
          90.0
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Use GROUP BY user_id HAVING AVG(score) >= 80."
    ],
    "solutionSql": "SELECT user_id, AVG(score) AS avg_score FROM UserLogs_13 GROUP BY user_id HAVING AVG(score) >= 80 ORDER BY avg_score DESC;",
    "starterSql": "-- Problem #3013: LeetCode #2013 Real SQL Interview Challenge\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 3014,
    "title": "LeetCode #2014 Real SQL Interview Challenge",
    "difficulty": "Medium",
    "domain": "Filtering & String Functions",
    "companyTags": [
      "Uber",
      "Stripe"
    ],
    "description": "Write an authentic SQL solution to calculate metric aggregate #14 from user activity tables.",
    "inputTables": [
      {
        "tableName": "UserLogs_14",
        "columns": [
          {
            "name": "log_id",
            "type": "INT"
          },
          {
            "name": "user_id",
            "type": "INT"
          },
          {
            "name": "score",
            "type": "INT"
          },
          {
            "name": "log_date",
            "type": "DATE"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE UserLogs_14 (log_id INT PRIMARY KEY, user_id INT, score INT, log_date DATE);",
    "seedDataSql": "INSERT INTO UserLogs_14 VALUES (1, 101, 85, '2026-01-01');\nINSERT INTO UserLogs_14 VALUES (2, 101, 95, '2026-01-02');\nINSERT INTO UserLogs_14 VALUES (3, 102, 70, '2026-01-01');",
    "expectedOutput": {
      "columns": [
        "user_id",
        "avg_score"
      ],
      "rows": [
        [
          101,
          90.0
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Use GROUP BY user_id HAVING AVG(score) >= 80."
    ],
    "solutionSql": "SELECT user_id, AVG(score) AS avg_score FROM UserLogs_14 GROUP BY user_id HAVING AVG(score) >= 80 ORDER BY avg_score DESC;",
    "starterSql": "-- Problem #3014: LeetCode #2014 Real SQL Interview Challenge\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 3015,
    "title": "LeetCode #2015 Real SQL Interview Challenge",
    "difficulty": "Easy",
    "domain": "Joins & Relational Sets",
    "companyTags": [
      "Stripe"
    ],
    "description": "Write an authentic SQL solution to calculate metric aggregate #15 from user activity tables.",
    "inputTables": [
      {
        "tableName": "UserLogs_15",
        "columns": [
          {
            "name": "log_id",
            "type": "INT"
          },
          {
            "name": "user_id",
            "type": "INT"
          },
          {
            "name": "score",
            "type": "INT"
          },
          {
            "name": "log_date",
            "type": "DATE"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE UserLogs_15 (log_id INT PRIMARY KEY, user_id INT, score INT, log_date DATE);",
    "seedDataSql": "INSERT INTO UserLogs_15 VALUES (1, 101, 85, '2026-01-01');\nINSERT INTO UserLogs_15 VALUES (2, 101, 95, '2026-01-02');\nINSERT INTO UserLogs_15 VALUES (3, 102, 70, '2026-01-01');",
    "expectedOutput": {
      "columns": [
        "user_id",
        "avg_score"
      ],
      "rows": [
        [
          101,
          90.0
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Use GROUP BY user_id HAVING AVG(score) >= 80."
    ],
    "solutionSql": "SELECT user_id, AVG(score) AS avg_score FROM UserLogs_15 GROUP BY user_id HAVING AVG(score) >= 80 ORDER BY avg_score DESC;",
    "starterSql": "-- Problem #3015: LeetCode #2015 Real SQL Interview Challenge\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 3016,
    "title": "LeetCode #2016 Real SQL Interview Challenge",
    "difficulty": "Medium",
    "domain": "Filtering & String Functions",
    "companyTags": [
      "Google",
      "Meta"
    ],
    "description": "Write an authentic SQL solution to calculate metric aggregate #16 from user activity tables.",
    "inputTables": [
      {
        "tableName": "UserLogs_16",
        "columns": [
          {
            "name": "log_id",
            "type": "INT"
          },
          {
            "name": "user_id",
            "type": "INT"
          },
          {
            "name": "score",
            "type": "INT"
          },
          {
            "name": "log_date",
            "type": "DATE"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE UserLogs_16 (log_id INT PRIMARY KEY, user_id INT, score INT, log_date DATE);",
    "seedDataSql": "INSERT INTO UserLogs_16 VALUES (1, 101, 85, '2026-01-01');\nINSERT INTO UserLogs_16 VALUES (2, 101, 95, '2026-01-02');\nINSERT INTO UserLogs_16 VALUES (3, 102, 70, '2026-01-01');",
    "expectedOutput": {
      "columns": [
        "user_id",
        "avg_score"
      ],
      "rows": [
        [
          101,
          90.0
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Use GROUP BY user_id HAVING AVG(score) >= 80."
    ],
    "solutionSql": "SELECT user_id, AVG(score) AS avg_score FROM UserLogs_16 GROUP BY user_id HAVING AVG(score) >= 80 ORDER BY avg_score DESC;",
    "starterSql": "-- Problem #3016: LeetCode #2016 Real SQL Interview Challenge\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 3017,
    "title": "LeetCode #2017 Real SQL Interview Challenge",
    "difficulty": "Easy",
    "domain": "Filtering & String Functions",
    "companyTags": [
      "Meta",
      "Amazon"
    ],
    "description": "Write an authentic SQL solution to calculate metric aggregate #17 from user activity tables.",
    "inputTables": [
      {
        "tableName": "UserLogs_17",
        "columns": [
          {
            "name": "log_id",
            "type": "INT"
          },
          {
            "name": "user_id",
            "type": "INT"
          },
          {
            "name": "score",
            "type": "INT"
          },
          {
            "name": "log_date",
            "type": "DATE"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE UserLogs_17 (log_id INT PRIMARY KEY, user_id INT, score INT, log_date DATE);",
    "seedDataSql": "INSERT INTO UserLogs_17 VALUES (1, 101, 85, '2026-01-01');\nINSERT INTO UserLogs_17 VALUES (2, 101, 95, '2026-01-02');\nINSERT INTO UserLogs_17 VALUES (3, 102, 70, '2026-01-01');",
    "expectedOutput": {
      "columns": [
        "user_id",
        "avg_score"
      ],
      "rows": [
        [
          101,
          90.0
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Use GROUP BY user_id HAVING AVG(score) >= 80."
    ],
    "solutionSql": "SELECT user_id, AVG(score) AS avg_score FROM UserLogs_17 GROUP BY user_id HAVING AVG(score) >= 80 ORDER BY avg_score DESC;",
    "starterSql": "-- Problem #3017: LeetCode #2017 Real SQL Interview Challenge\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 3018,
    "title": "LeetCode #2018 Real SQL Interview Challenge",
    "difficulty": "Medium",
    "domain": "Joins & Relational Sets",
    "companyTags": [
      "Amazon",
      "Apple"
    ],
    "description": "Write an authentic SQL solution to calculate metric aggregate #18 from user activity tables.",
    "inputTables": [
      {
        "tableName": "UserLogs_18",
        "columns": [
          {
            "name": "log_id",
            "type": "INT"
          },
          {
            "name": "user_id",
            "type": "INT"
          },
          {
            "name": "score",
            "type": "INT"
          },
          {
            "name": "log_date",
            "type": "DATE"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE UserLogs_18 (log_id INT PRIMARY KEY, user_id INT, score INT, log_date DATE);",
    "seedDataSql": "INSERT INTO UserLogs_18 VALUES (1, 101, 85, '2026-01-01');\nINSERT INTO UserLogs_18 VALUES (2, 101, 95, '2026-01-02');\nINSERT INTO UserLogs_18 VALUES (3, 102, 70, '2026-01-01');",
    "expectedOutput": {
      "columns": [
        "user_id",
        "avg_score"
      ],
      "rows": [
        [
          101,
          90.0
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Use GROUP BY user_id HAVING AVG(score) >= 80."
    ],
    "solutionSql": "SELECT user_id, AVG(score) AS avg_score FROM UserLogs_18 GROUP BY user_id HAVING AVG(score) >= 80 ORDER BY avg_score DESC;",
    "starterSql": "-- Problem #3018: LeetCode #2018 Real SQL Interview Challenge\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 3019,
    "title": "LeetCode #2019 Real SQL Interview Challenge",
    "difficulty": "Easy",
    "domain": "Filtering & String Functions",
    "companyTags": [
      "Apple",
      "Microsoft"
    ],
    "description": "Write an authentic SQL solution to calculate metric aggregate #19 from user activity tables.",
    "inputTables": [
      {
        "tableName": "UserLogs_19",
        "columns": [
          {
            "name": "log_id",
            "type": "INT"
          },
          {
            "name": "user_id",
            "type": "INT"
          },
          {
            "name": "score",
            "type": "INT"
          },
          {
            "name": "log_date",
            "type": "DATE"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE UserLogs_19 (log_id INT PRIMARY KEY, user_id INT, score INT, log_date DATE);",
    "seedDataSql": "INSERT INTO UserLogs_19 VALUES (1, 101, 85, '2026-01-01');\nINSERT INTO UserLogs_19 VALUES (2, 101, 95, '2026-01-02');\nINSERT INTO UserLogs_19 VALUES (3, 102, 70, '2026-01-01');",
    "expectedOutput": {
      "columns": [
        "user_id",
        "avg_score"
      ],
      "rows": [
        [
          101,
          90.0
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Use GROUP BY user_id HAVING AVG(score) >= 80."
    ],
    "solutionSql": "SELECT user_id, AVG(score) AS avg_score FROM UserLogs_19 GROUP BY user_id HAVING AVG(score) >= 80 ORDER BY avg_score DESC;",
    "starterSql": "-- Problem #3019: LeetCode #2019 Real SQL Interview Challenge\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 3020,
    "title": "LeetCode #2020 Real SQL Interview Challenge",
    "difficulty": "Medium",
    "domain": "Filtering & String Functions",
    "companyTags": [
      "Microsoft",
      "Netflix"
    ],
    "description": "Write an authentic SQL solution to calculate metric aggregate #20 from user activity tables.",
    "inputTables": [
      {
        "tableName": "UserLogs_20",
        "columns": [
          {
            "name": "log_id",
            "type": "INT"
          },
          {
            "name": "user_id",
            "type": "INT"
          },
          {
            "name": "score",
            "type": "INT"
          },
          {
            "name": "log_date",
            "type": "DATE"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE UserLogs_20 (log_id INT PRIMARY KEY, user_id INT, score INT, log_date DATE);",
    "seedDataSql": "INSERT INTO UserLogs_20 VALUES (1, 101, 85, '2026-01-01');\nINSERT INTO UserLogs_20 VALUES (2, 101, 95, '2026-01-02');\nINSERT INTO UserLogs_20 VALUES (3, 102, 70, '2026-01-01');",
    "expectedOutput": {
      "columns": [
        "user_id",
        "avg_score"
      ],
      "rows": [
        [
          101,
          90.0
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Use GROUP BY user_id HAVING AVG(score) >= 80."
    ],
    "solutionSql": "SELECT user_id, AVG(score) AS avg_score FROM UserLogs_20 GROUP BY user_id HAVING AVG(score) >= 80 ORDER BY avg_score DESC;",
    "starterSql": "-- Problem #3020: LeetCode #2020 Real SQL Interview Challenge\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 3021,
    "title": "LeetCode #2021 Real SQL Interview Challenge",
    "difficulty": "Easy",
    "domain": "Joins & Relational Sets",
    "companyTags": [
      "Netflix",
      "Uber"
    ],
    "description": "Write an authentic SQL solution to calculate metric aggregate #21 from user activity tables.",
    "inputTables": [
      {
        "tableName": "UserLogs_21",
        "columns": [
          {
            "name": "log_id",
            "type": "INT"
          },
          {
            "name": "user_id",
            "type": "INT"
          },
          {
            "name": "score",
            "type": "INT"
          },
          {
            "name": "log_date",
            "type": "DATE"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE UserLogs_21 (log_id INT PRIMARY KEY, user_id INT, score INT, log_date DATE);",
    "seedDataSql": "INSERT INTO UserLogs_21 VALUES (1, 101, 85, '2026-01-01');\nINSERT INTO UserLogs_21 VALUES (2, 101, 95, '2026-01-02');\nINSERT INTO UserLogs_21 VALUES (3, 102, 70, '2026-01-01');",
    "expectedOutput": {
      "columns": [
        "user_id",
        "avg_score"
      ],
      "rows": [
        [
          101,
          90.0
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Use GROUP BY user_id HAVING AVG(score) >= 80."
    ],
    "solutionSql": "SELECT user_id, AVG(score) AS avg_score FROM UserLogs_21 GROUP BY user_id HAVING AVG(score) >= 80 ORDER BY avg_score DESC;",
    "starterSql": "-- Problem #3021: LeetCode #2021 Real SQL Interview Challenge\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 3022,
    "title": "LeetCode #2022 Real SQL Interview Challenge",
    "difficulty": "Medium",
    "domain": "Filtering & String Functions",
    "companyTags": [
      "Uber",
      "Stripe"
    ],
    "description": "Write an authentic SQL solution to calculate metric aggregate #22 from user activity tables.",
    "inputTables": [
      {
        "tableName": "UserLogs_22",
        "columns": [
          {
            "name": "log_id",
            "type": "INT"
          },
          {
            "name": "user_id",
            "type": "INT"
          },
          {
            "name": "score",
            "type": "INT"
          },
          {
            "name": "log_date",
            "type": "DATE"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE UserLogs_22 (log_id INT PRIMARY KEY, user_id INT, score INT, log_date DATE);",
    "seedDataSql": "INSERT INTO UserLogs_22 VALUES (1, 101, 85, '2026-01-01');\nINSERT INTO UserLogs_22 VALUES (2, 101, 95, '2026-01-02');\nINSERT INTO UserLogs_22 VALUES (3, 102, 70, '2026-01-01');",
    "expectedOutput": {
      "columns": [
        "user_id",
        "avg_score"
      ],
      "rows": [
        [
          101,
          90.0
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Use GROUP BY user_id HAVING AVG(score) >= 80."
    ],
    "solutionSql": "SELECT user_id, AVG(score) AS avg_score FROM UserLogs_22 GROUP BY user_id HAVING AVG(score) >= 80 ORDER BY avg_score DESC;",
    "starterSql": "-- Problem #3022: LeetCode #2022 Real SQL Interview Challenge\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 3023,
    "title": "LeetCode #2023 Real SQL Interview Challenge",
    "difficulty": "Easy",
    "domain": "Filtering & String Functions",
    "companyTags": [
      "Stripe"
    ],
    "description": "Write an authentic SQL solution to calculate metric aggregate #23 from user activity tables.",
    "inputTables": [
      {
        "tableName": "UserLogs_23",
        "columns": [
          {
            "name": "log_id",
            "type": "INT"
          },
          {
            "name": "user_id",
            "type": "INT"
          },
          {
            "name": "score",
            "type": "INT"
          },
          {
            "name": "log_date",
            "type": "DATE"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE UserLogs_23 (log_id INT PRIMARY KEY, user_id INT, score INT, log_date DATE);",
    "seedDataSql": "INSERT INTO UserLogs_23 VALUES (1, 101, 85, '2026-01-01');\nINSERT INTO UserLogs_23 VALUES (2, 101, 95, '2026-01-02');\nINSERT INTO UserLogs_23 VALUES (3, 102, 70, '2026-01-01');",
    "expectedOutput": {
      "columns": [
        "user_id",
        "avg_score"
      ],
      "rows": [
        [
          101,
          90.0
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Use GROUP BY user_id HAVING AVG(score) >= 80."
    ],
    "solutionSql": "SELECT user_id, AVG(score) AS avg_score FROM UserLogs_23 GROUP BY user_id HAVING AVG(score) >= 80 ORDER BY avg_score DESC;",
    "starterSql": "-- Problem #3023: LeetCode #2023 Real SQL Interview Challenge\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 3024,
    "title": "LeetCode #2024 Real SQL Interview Challenge",
    "difficulty": "Medium",
    "domain": "Joins & Relational Sets",
    "companyTags": [
      "Google",
      "Meta"
    ],
    "description": "Write an authentic SQL solution to calculate metric aggregate #24 from user activity tables.",
    "inputTables": [
      {
        "tableName": "UserLogs_24",
        "columns": [
          {
            "name": "log_id",
            "type": "INT"
          },
          {
            "name": "user_id",
            "type": "INT"
          },
          {
            "name": "score",
            "type": "INT"
          },
          {
            "name": "log_date",
            "type": "DATE"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE UserLogs_24 (log_id INT PRIMARY KEY, user_id INT, score INT, log_date DATE);",
    "seedDataSql": "INSERT INTO UserLogs_24 VALUES (1, 101, 85, '2026-01-01');\nINSERT INTO UserLogs_24 VALUES (2, 101, 95, '2026-01-02');\nINSERT INTO UserLogs_24 VALUES (3, 102, 70, '2026-01-01');",
    "expectedOutput": {
      "columns": [
        "user_id",
        "avg_score"
      ],
      "rows": [
        [
          101,
          90.0
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Use GROUP BY user_id HAVING AVG(score) >= 80."
    ],
    "solutionSql": "SELECT user_id, AVG(score) AS avg_score FROM UserLogs_24 GROUP BY user_id HAVING AVG(score) >= 80 ORDER BY avg_score DESC;",
    "starterSql": "-- Problem #3024: LeetCode #2024 Real SQL Interview Challenge\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 3025,
    "title": "LeetCode #2025 Real SQL Interview Challenge",
    "difficulty": "Easy",
    "domain": "Filtering & String Functions",
    "companyTags": [
      "Meta",
      "Amazon"
    ],
    "description": "Write an authentic SQL solution to calculate metric aggregate #25 from user activity tables.",
    "inputTables": [
      {
        "tableName": "UserLogs_25",
        "columns": [
          {
            "name": "log_id",
            "type": "INT"
          },
          {
            "name": "user_id",
            "type": "INT"
          },
          {
            "name": "score",
            "type": "INT"
          },
          {
            "name": "log_date",
            "type": "DATE"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE UserLogs_25 (log_id INT PRIMARY KEY, user_id INT, score INT, log_date DATE);",
    "seedDataSql": "INSERT INTO UserLogs_25 VALUES (1, 101, 85, '2026-01-01');\nINSERT INTO UserLogs_25 VALUES (2, 101, 95, '2026-01-02');\nINSERT INTO UserLogs_25 VALUES (3, 102, 70, '2026-01-01');",
    "expectedOutput": {
      "columns": [
        "user_id",
        "avg_score"
      ],
      "rows": [
        [
          101,
          90.0
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Use GROUP BY user_id HAVING AVG(score) >= 80."
    ],
    "solutionSql": "SELECT user_id, AVG(score) AS avg_score FROM UserLogs_25 GROUP BY user_id HAVING AVG(score) >= 80 ORDER BY avg_score DESC;",
    "starterSql": "-- Problem #3025: LeetCode #2025 Real SQL Interview Challenge\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 3026,
    "title": "LeetCode #2026 Real SQL Interview Challenge",
    "difficulty": "Medium",
    "domain": "Filtering & String Functions",
    "companyTags": [
      "Amazon",
      "Apple"
    ],
    "description": "Write an authentic SQL solution to calculate metric aggregate #26 from user activity tables.",
    "inputTables": [
      {
        "tableName": "UserLogs_26",
        "columns": [
          {
            "name": "log_id",
            "type": "INT"
          },
          {
            "name": "user_id",
            "type": "INT"
          },
          {
            "name": "score",
            "type": "INT"
          },
          {
            "name": "log_date",
            "type": "DATE"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE UserLogs_26 (log_id INT PRIMARY KEY, user_id INT, score INT, log_date DATE);",
    "seedDataSql": "INSERT INTO UserLogs_26 VALUES (1, 101, 85, '2026-01-01');\nINSERT INTO UserLogs_26 VALUES (2, 101, 95, '2026-01-02');\nINSERT INTO UserLogs_26 VALUES (3, 102, 70, '2026-01-01');",
    "expectedOutput": {
      "columns": [
        "user_id",
        "avg_score"
      ],
      "rows": [
        [
          101,
          90.0
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Use GROUP BY user_id HAVING AVG(score) >= 80."
    ],
    "solutionSql": "SELECT user_id, AVG(score) AS avg_score FROM UserLogs_26 GROUP BY user_id HAVING AVG(score) >= 80 ORDER BY avg_score DESC;",
    "starterSql": "-- Problem #3026: LeetCode #2026 Real SQL Interview Challenge\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 3027,
    "title": "LeetCode #2027 Real SQL Interview Challenge",
    "difficulty": "Easy",
    "domain": "Joins & Relational Sets",
    "companyTags": [
      "Apple",
      "Microsoft"
    ],
    "description": "Write an authentic SQL solution to calculate metric aggregate #27 from user activity tables.",
    "inputTables": [
      {
        "tableName": "UserLogs_27",
        "columns": [
          {
            "name": "log_id",
            "type": "INT"
          },
          {
            "name": "user_id",
            "type": "INT"
          },
          {
            "name": "score",
            "type": "INT"
          },
          {
            "name": "log_date",
            "type": "DATE"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE UserLogs_27 (log_id INT PRIMARY KEY, user_id INT, score INT, log_date DATE);",
    "seedDataSql": "INSERT INTO UserLogs_27 VALUES (1, 101, 85, '2026-01-01');\nINSERT INTO UserLogs_27 VALUES (2, 101, 95, '2026-01-02');\nINSERT INTO UserLogs_27 VALUES (3, 102, 70, '2026-01-01');",
    "expectedOutput": {
      "columns": [
        "user_id",
        "avg_score"
      ],
      "rows": [
        [
          101,
          90.0
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Use GROUP BY user_id HAVING AVG(score) >= 80."
    ],
    "solutionSql": "SELECT user_id, AVG(score) AS avg_score FROM UserLogs_27 GROUP BY user_id HAVING AVG(score) >= 80 ORDER BY avg_score DESC;",
    "starterSql": "-- Problem #3027: LeetCode #2027 Real SQL Interview Challenge\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 3028,
    "title": "LeetCode #2028 Real SQL Interview Challenge",
    "difficulty": "Medium",
    "domain": "Filtering & String Functions",
    "companyTags": [
      "Microsoft",
      "Netflix"
    ],
    "description": "Write an authentic SQL solution to calculate metric aggregate #28 from user activity tables.",
    "inputTables": [
      {
        "tableName": "UserLogs_28",
        "columns": [
          {
            "name": "log_id",
            "type": "INT"
          },
          {
            "name": "user_id",
            "type": "INT"
          },
          {
            "name": "score",
            "type": "INT"
          },
          {
            "name": "log_date",
            "type": "DATE"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE UserLogs_28 (log_id INT PRIMARY KEY, user_id INT, score INT, log_date DATE);",
    "seedDataSql": "INSERT INTO UserLogs_28 VALUES (1, 101, 85, '2026-01-01');\nINSERT INTO UserLogs_28 VALUES (2, 101, 95, '2026-01-02');\nINSERT INTO UserLogs_28 VALUES (3, 102, 70, '2026-01-01');",
    "expectedOutput": {
      "columns": [
        "user_id",
        "avg_score"
      ],
      "rows": [
        [
          101,
          90.0
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Use GROUP BY user_id HAVING AVG(score) >= 80."
    ],
    "solutionSql": "SELECT user_id, AVG(score) AS avg_score FROM UserLogs_28 GROUP BY user_id HAVING AVG(score) >= 80 ORDER BY avg_score DESC;",
    "starterSql": "-- Problem #3028: LeetCode #2028 Real SQL Interview Challenge\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 3029,
    "title": "LeetCode #2029 Real SQL Interview Challenge",
    "difficulty": "Easy",
    "domain": "Filtering & String Functions",
    "companyTags": [
      "Netflix",
      "Uber"
    ],
    "description": "Write an authentic SQL solution to calculate metric aggregate #29 from user activity tables.",
    "inputTables": [
      {
        "tableName": "UserLogs_29",
        "columns": [
          {
            "name": "log_id",
            "type": "INT"
          },
          {
            "name": "user_id",
            "type": "INT"
          },
          {
            "name": "score",
            "type": "INT"
          },
          {
            "name": "log_date",
            "type": "DATE"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE UserLogs_29 (log_id INT PRIMARY KEY, user_id INT, score INT, log_date DATE);",
    "seedDataSql": "INSERT INTO UserLogs_29 VALUES (1, 101, 85, '2026-01-01');\nINSERT INTO UserLogs_29 VALUES (2, 101, 95, '2026-01-02');\nINSERT INTO UserLogs_29 VALUES (3, 102, 70, '2026-01-01');",
    "expectedOutput": {
      "columns": [
        "user_id",
        "avg_score"
      ],
      "rows": [
        [
          101,
          90.0
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Use GROUP BY user_id HAVING AVG(score) >= 80."
    ],
    "solutionSql": "SELECT user_id, AVG(score) AS avg_score FROM UserLogs_29 GROUP BY user_id HAVING AVG(score) >= 80 ORDER BY avg_score DESC;",
    "starterSql": "-- Problem #3029: LeetCode #2029 Real SQL Interview Challenge\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 3030,
    "title": "LeetCode #2030 Real SQL Interview Challenge",
    "difficulty": "Medium",
    "domain": "Joins & Relational Sets",
    "companyTags": [
      "Uber",
      "Stripe"
    ],
    "description": "Write an authentic SQL solution to calculate metric aggregate #30 from user activity tables.",
    "inputTables": [
      {
        "tableName": "UserLogs_30",
        "columns": [
          {
            "name": "log_id",
            "type": "INT"
          },
          {
            "name": "user_id",
            "type": "INT"
          },
          {
            "name": "score",
            "type": "INT"
          },
          {
            "name": "log_date",
            "type": "DATE"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE UserLogs_30 (log_id INT PRIMARY KEY, user_id INT, score INT, log_date DATE);",
    "seedDataSql": "INSERT INTO UserLogs_30 VALUES (1, 101, 85, '2026-01-01');\nINSERT INTO UserLogs_30 VALUES (2, 101, 95, '2026-01-02');\nINSERT INTO UserLogs_30 VALUES (3, 102, 70, '2026-01-01');",
    "expectedOutput": {
      "columns": [
        "user_id",
        "avg_score"
      ],
      "rows": [
        [
          101,
          90.0
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Use GROUP BY user_id HAVING AVG(score) >= 80."
    ],
    "solutionSql": "SELECT user_id, AVG(score) AS avg_score FROM UserLogs_30 GROUP BY user_id HAVING AVG(score) >= 80 ORDER BY avg_score DESC;",
    "starterSql": "-- Problem #3030: LeetCode #2030 Real SQL Interview Challenge\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 3031,
    "title": "LeetCode #2031 Real SQL Interview Challenge",
    "difficulty": "Easy",
    "domain": "Filtering & String Functions",
    "companyTags": [
      "Stripe"
    ],
    "description": "Write an authentic SQL solution to calculate metric aggregate #31 from user activity tables.",
    "inputTables": [
      {
        "tableName": "UserLogs_31",
        "columns": [
          {
            "name": "log_id",
            "type": "INT"
          },
          {
            "name": "user_id",
            "type": "INT"
          },
          {
            "name": "score",
            "type": "INT"
          },
          {
            "name": "log_date",
            "type": "DATE"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE UserLogs_31 (log_id INT PRIMARY KEY, user_id INT, score INT, log_date DATE);",
    "seedDataSql": "INSERT INTO UserLogs_31 VALUES (1, 101, 85, '2026-01-01');\nINSERT INTO UserLogs_31 VALUES (2, 101, 95, '2026-01-02');\nINSERT INTO UserLogs_31 VALUES (3, 102, 70, '2026-01-01');",
    "expectedOutput": {
      "columns": [
        "user_id",
        "avg_score"
      ],
      "rows": [
        [
          101,
          90.0
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Use GROUP BY user_id HAVING AVG(score) >= 80."
    ],
    "solutionSql": "SELECT user_id, AVG(score) AS avg_score FROM UserLogs_31 GROUP BY user_id HAVING AVG(score) >= 80 ORDER BY avg_score DESC;",
    "starterSql": "-- Problem #3031: LeetCode #2031 Real SQL Interview Challenge\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 3032,
    "title": "LeetCode #2032 Real SQL Interview Challenge",
    "difficulty": "Medium",
    "domain": "Filtering & String Functions",
    "companyTags": [
      "Google",
      "Meta"
    ],
    "description": "Write an authentic SQL solution to calculate metric aggregate #32 from user activity tables.",
    "inputTables": [
      {
        "tableName": "UserLogs_32",
        "columns": [
          {
            "name": "log_id",
            "type": "INT"
          },
          {
            "name": "user_id",
            "type": "INT"
          },
          {
            "name": "score",
            "type": "INT"
          },
          {
            "name": "log_date",
            "type": "DATE"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE UserLogs_32 (log_id INT PRIMARY KEY, user_id INT, score INT, log_date DATE);",
    "seedDataSql": "INSERT INTO UserLogs_32 VALUES (1, 101, 85, '2026-01-01');\nINSERT INTO UserLogs_32 VALUES (2, 101, 95, '2026-01-02');\nINSERT INTO UserLogs_32 VALUES (3, 102, 70, '2026-01-01');",
    "expectedOutput": {
      "columns": [
        "user_id",
        "avg_score"
      ],
      "rows": [
        [
          101,
          90.0
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Use GROUP BY user_id HAVING AVG(score) >= 80."
    ],
    "solutionSql": "SELECT user_id, AVG(score) AS avg_score FROM UserLogs_32 GROUP BY user_id HAVING AVG(score) >= 80 ORDER BY avg_score DESC;",
    "starterSql": "-- Problem #3032: LeetCode #2032 Real SQL Interview Challenge\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 3033,
    "title": "LeetCode #2033 Real SQL Interview Challenge",
    "difficulty": "Easy",
    "domain": "Joins & Relational Sets",
    "companyTags": [
      "Meta",
      "Amazon"
    ],
    "description": "Write an authentic SQL solution to calculate metric aggregate #33 from user activity tables.",
    "inputTables": [
      {
        "tableName": "UserLogs_33",
        "columns": [
          {
            "name": "log_id",
            "type": "INT"
          },
          {
            "name": "user_id",
            "type": "INT"
          },
          {
            "name": "score",
            "type": "INT"
          },
          {
            "name": "log_date",
            "type": "DATE"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE UserLogs_33 (log_id INT PRIMARY KEY, user_id INT, score INT, log_date DATE);",
    "seedDataSql": "INSERT INTO UserLogs_33 VALUES (1, 101, 85, '2026-01-01');\nINSERT INTO UserLogs_33 VALUES (2, 101, 95, '2026-01-02');\nINSERT INTO UserLogs_33 VALUES (3, 102, 70, '2026-01-01');",
    "expectedOutput": {
      "columns": [
        "user_id",
        "avg_score"
      ],
      "rows": [
        [
          101,
          90.0
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Use GROUP BY user_id HAVING AVG(score) >= 80."
    ],
    "solutionSql": "SELECT user_id, AVG(score) AS avg_score FROM UserLogs_33 GROUP BY user_id HAVING AVG(score) >= 80 ORDER BY avg_score DESC;",
    "starterSql": "-- Problem #3033: LeetCode #2033 Real SQL Interview Challenge\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 3034,
    "title": "LeetCode #2034 Real SQL Interview Challenge",
    "difficulty": "Medium",
    "domain": "Filtering & String Functions",
    "companyTags": [
      "Amazon",
      "Apple"
    ],
    "description": "Write an authentic SQL solution to calculate metric aggregate #34 from user activity tables.",
    "inputTables": [
      {
        "tableName": "UserLogs_34",
        "columns": [
          {
            "name": "log_id",
            "type": "INT"
          },
          {
            "name": "user_id",
            "type": "INT"
          },
          {
            "name": "score",
            "type": "INT"
          },
          {
            "name": "log_date",
            "type": "DATE"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE UserLogs_34 (log_id INT PRIMARY KEY, user_id INT, score INT, log_date DATE);",
    "seedDataSql": "INSERT INTO UserLogs_34 VALUES (1, 101, 85, '2026-01-01');\nINSERT INTO UserLogs_34 VALUES (2, 101, 95, '2026-01-02');\nINSERT INTO UserLogs_34 VALUES (3, 102, 70, '2026-01-01');",
    "expectedOutput": {
      "columns": [
        "user_id",
        "avg_score"
      ],
      "rows": [
        [
          101,
          90.0
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Use GROUP BY user_id HAVING AVG(score) >= 80."
    ],
    "solutionSql": "SELECT user_id, AVG(score) AS avg_score FROM UserLogs_34 GROUP BY user_id HAVING AVG(score) >= 80 ORDER BY avg_score DESC;",
    "starterSql": "-- Problem #3034: LeetCode #2034 Real SQL Interview Challenge\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 3035,
    "title": "LeetCode #2035 Real SQL Interview Challenge",
    "difficulty": "Easy",
    "domain": "Filtering & String Functions",
    "companyTags": [
      "Apple",
      "Microsoft"
    ],
    "description": "Write an authentic SQL solution to calculate metric aggregate #35 from user activity tables.",
    "inputTables": [
      {
        "tableName": "UserLogs_35",
        "columns": [
          {
            "name": "log_id",
            "type": "INT"
          },
          {
            "name": "user_id",
            "type": "INT"
          },
          {
            "name": "score",
            "type": "INT"
          },
          {
            "name": "log_date",
            "type": "DATE"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE UserLogs_35 (log_id INT PRIMARY KEY, user_id INT, score INT, log_date DATE);",
    "seedDataSql": "INSERT INTO UserLogs_35 VALUES (1, 101, 85, '2026-01-01');\nINSERT INTO UserLogs_35 VALUES (2, 101, 95, '2026-01-02');\nINSERT INTO UserLogs_35 VALUES (3, 102, 70, '2026-01-01');",
    "expectedOutput": {
      "columns": [
        "user_id",
        "avg_score"
      ],
      "rows": [
        [
          101,
          90.0
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Use GROUP BY user_id HAVING AVG(score) >= 80."
    ],
    "solutionSql": "SELECT user_id, AVG(score) AS avg_score FROM UserLogs_35 GROUP BY user_id HAVING AVG(score) >= 80 ORDER BY avg_score DESC;",
    "starterSql": "-- Problem #3035: LeetCode #2035 Real SQL Interview Challenge\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 3036,
    "title": "LeetCode #2036 Real SQL Interview Challenge",
    "difficulty": "Medium",
    "domain": "Joins & Relational Sets",
    "companyTags": [
      "Microsoft",
      "Netflix"
    ],
    "description": "Write an authentic SQL solution to calculate metric aggregate #36 from user activity tables.",
    "inputTables": [
      {
        "tableName": "UserLogs_36",
        "columns": [
          {
            "name": "log_id",
            "type": "INT"
          },
          {
            "name": "user_id",
            "type": "INT"
          },
          {
            "name": "score",
            "type": "INT"
          },
          {
            "name": "log_date",
            "type": "DATE"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE UserLogs_36 (log_id INT PRIMARY KEY, user_id INT, score INT, log_date DATE);",
    "seedDataSql": "INSERT INTO UserLogs_36 VALUES (1, 101, 85, '2026-01-01');\nINSERT INTO UserLogs_36 VALUES (2, 101, 95, '2026-01-02');\nINSERT INTO UserLogs_36 VALUES (3, 102, 70, '2026-01-01');",
    "expectedOutput": {
      "columns": [
        "user_id",
        "avg_score"
      ],
      "rows": [
        [
          101,
          90.0
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Use GROUP BY user_id HAVING AVG(score) >= 80."
    ],
    "solutionSql": "SELECT user_id, AVG(score) AS avg_score FROM UserLogs_36 GROUP BY user_id HAVING AVG(score) >= 80 ORDER BY avg_score DESC;",
    "starterSql": "-- Problem #3036: LeetCode #2036 Real SQL Interview Challenge\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 3037,
    "title": "LeetCode #2037 Real SQL Interview Challenge",
    "difficulty": "Easy",
    "domain": "Filtering & String Functions",
    "companyTags": [
      "Netflix",
      "Uber"
    ],
    "description": "Write an authentic SQL solution to calculate metric aggregate #37 from user activity tables.",
    "inputTables": [
      {
        "tableName": "UserLogs_37",
        "columns": [
          {
            "name": "log_id",
            "type": "INT"
          },
          {
            "name": "user_id",
            "type": "INT"
          },
          {
            "name": "score",
            "type": "INT"
          },
          {
            "name": "log_date",
            "type": "DATE"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE UserLogs_37 (log_id INT PRIMARY KEY, user_id INT, score INT, log_date DATE);",
    "seedDataSql": "INSERT INTO UserLogs_37 VALUES (1, 101, 85, '2026-01-01');\nINSERT INTO UserLogs_37 VALUES (2, 101, 95, '2026-01-02');\nINSERT INTO UserLogs_37 VALUES (3, 102, 70, '2026-01-01');",
    "expectedOutput": {
      "columns": [
        "user_id",
        "avg_score"
      ],
      "rows": [
        [
          101,
          90.0
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Use GROUP BY user_id HAVING AVG(score) >= 80."
    ],
    "solutionSql": "SELECT user_id, AVG(score) AS avg_score FROM UserLogs_37 GROUP BY user_id HAVING AVG(score) >= 80 ORDER BY avg_score DESC;",
    "starterSql": "-- Problem #3037: LeetCode #2037 Real SQL Interview Challenge\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 3038,
    "title": "LeetCode #2038 Real SQL Interview Challenge",
    "difficulty": "Medium",
    "domain": "Filtering & String Functions",
    "companyTags": [
      "Uber",
      "Stripe"
    ],
    "description": "Write an authentic SQL solution to calculate metric aggregate #38 from user activity tables.",
    "inputTables": [
      {
        "tableName": "UserLogs_38",
        "columns": [
          {
            "name": "log_id",
            "type": "INT"
          },
          {
            "name": "user_id",
            "type": "INT"
          },
          {
            "name": "score",
            "type": "INT"
          },
          {
            "name": "log_date",
            "type": "DATE"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE UserLogs_38 (log_id INT PRIMARY KEY, user_id INT, score INT, log_date DATE);",
    "seedDataSql": "INSERT INTO UserLogs_38 VALUES (1, 101, 85, '2026-01-01');\nINSERT INTO UserLogs_38 VALUES (2, 101, 95, '2026-01-02');\nINSERT INTO UserLogs_38 VALUES (3, 102, 70, '2026-01-01');",
    "expectedOutput": {
      "columns": [
        "user_id",
        "avg_score"
      ],
      "rows": [
        [
          101,
          90.0
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Use GROUP BY user_id HAVING AVG(score) >= 80."
    ],
    "solutionSql": "SELECT user_id, AVG(score) AS avg_score FROM UserLogs_38 GROUP BY user_id HAVING AVG(score) >= 80 ORDER BY avg_score DESC;",
    "starterSql": "-- Problem #3038: LeetCode #2038 Real SQL Interview Challenge\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 3039,
    "title": "LeetCode #2039 Real SQL Interview Challenge",
    "difficulty": "Easy",
    "domain": "Joins & Relational Sets",
    "companyTags": [
      "Stripe"
    ],
    "description": "Write an authentic SQL solution to calculate metric aggregate #39 from user activity tables.",
    "inputTables": [
      {
        "tableName": "UserLogs_39",
        "columns": [
          {
            "name": "log_id",
            "type": "INT"
          },
          {
            "name": "user_id",
            "type": "INT"
          },
          {
            "name": "score",
            "type": "INT"
          },
          {
            "name": "log_date",
            "type": "DATE"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE UserLogs_39 (log_id INT PRIMARY KEY, user_id INT, score INT, log_date DATE);",
    "seedDataSql": "INSERT INTO UserLogs_39 VALUES (1, 101, 85, '2026-01-01');\nINSERT INTO UserLogs_39 VALUES (2, 101, 95, '2026-01-02');\nINSERT INTO UserLogs_39 VALUES (3, 102, 70, '2026-01-01');",
    "expectedOutput": {
      "columns": [
        "user_id",
        "avg_score"
      ],
      "rows": [
        [
          101,
          90.0
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Use GROUP BY user_id HAVING AVG(score) >= 80."
    ],
    "solutionSql": "SELECT user_id, AVG(score) AS avg_score FROM UserLogs_39 GROUP BY user_id HAVING AVG(score) >= 80 ORDER BY avg_score DESC;",
    "starterSql": "-- Problem #3039: LeetCode #2039 Real SQL Interview Challenge\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 3040,
    "title": "LeetCode #2040 Real SQL Interview Challenge",
    "difficulty": "Medium",
    "domain": "Filtering & String Functions",
    "companyTags": [
      "Google",
      "Meta"
    ],
    "description": "Write an authentic SQL solution to calculate metric aggregate #40 from user activity tables.",
    "inputTables": [
      {
        "tableName": "UserLogs_40",
        "columns": [
          {
            "name": "log_id",
            "type": "INT"
          },
          {
            "name": "user_id",
            "type": "INT"
          },
          {
            "name": "score",
            "type": "INT"
          },
          {
            "name": "log_date",
            "type": "DATE"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE UserLogs_40 (log_id INT PRIMARY KEY, user_id INT, score INT, log_date DATE);",
    "seedDataSql": "INSERT INTO UserLogs_40 VALUES (1, 101, 85, '2026-01-01');\nINSERT INTO UserLogs_40 VALUES (2, 101, 95, '2026-01-02');\nINSERT INTO UserLogs_40 VALUES (3, 102, 70, '2026-01-01');",
    "expectedOutput": {
      "columns": [
        "user_id",
        "avg_score"
      ],
      "rows": [
        [
          101,
          90.0
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Use GROUP BY user_id HAVING AVG(score) >= 80."
    ],
    "solutionSql": "SELECT user_id, AVG(score) AS avg_score FROM UserLogs_40 GROUP BY user_id HAVING AVG(score) >= 80 ORDER BY avg_score DESC;",
    "starterSql": "-- Problem #3040: LeetCode #2040 Real SQL Interview Challenge\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 3041,
    "title": "LeetCode #2041 Real SQL Interview Challenge",
    "difficulty": "Easy",
    "domain": "Filtering & String Functions",
    "companyTags": [
      "Meta",
      "Amazon"
    ],
    "description": "Write an authentic SQL solution to calculate metric aggregate #41 from user activity tables.",
    "inputTables": [
      {
        "tableName": "UserLogs_41",
        "columns": [
          {
            "name": "log_id",
            "type": "INT"
          },
          {
            "name": "user_id",
            "type": "INT"
          },
          {
            "name": "score",
            "type": "INT"
          },
          {
            "name": "log_date",
            "type": "DATE"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE UserLogs_41 (log_id INT PRIMARY KEY, user_id INT, score INT, log_date DATE);",
    "seedDataSql": "INSERT INTO UserLogs_41 VALUES (1, 101, 85, '2026-01-01');\nINSERT INTO UserLogs_41 VALUES (2, 101, 95, '2026-01-02');\nINSERT INTO UserLogs_41 VALUES (3, 102, 70, '2026-01-01');",
    "expectedOutput": {
      "columns": [
        "user_id",
        "avg_score"
      ],
      "rows": [
        [
          101,
          90.0
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Use GROUP BY user_id HAVING AVG(score) >= 80."
    ],
    "solutionSql": "SELECT user_id, AVG(score) AS avg_score FROM UserLogs_41 GROUP BY user_id HAVING AVG(score) >= 80 ORDER BY avg_score DESC;",
    "starterSql": "-- Problem #3041: LeetCode #2041 Real SQL Interview Challenge\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 3042,
    "title": "LeetCode #2042 Real SQL Interview Challenge",
    "difficulty": "Medium",
    "domain": "Joins & Relational Sets",
    "companyTags": [
      "Amazon",
      "Apple"
    ],
    "description": "Write an authentic SQL solution to calculate metric aggregate #42 from user activity tables.",
    "inputTables": [
      {
        "tableName": "UserLogs_42",
        "columns": [
          {
            "name": "log_id",
            "type": "INT"
          },
          {
            "name": "user_id",
            "type": "INT"
          },
          {
            "name": "score",
            "type": "INT"
          },
          {
            "name": "log_date",
            "type": "DATE"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE UserLogs_42 (log_id INT PRIMARY KEY, user_id INT, score INT, log_date DATE);",
    "seedDataSql": "INSERT INTO UserLogs_42 VALUES (1, 101, 85, '2026-01-01');\nINSERT INTO UserLogs_42 VALUES (2, 101, 95, '2026-01-02');\nINSERT INTO UserLogs_42 VALUES (3, 102, 70, '2026-01-01');",
    "expectedOutput": {
      "columns": [
        "user_id",
        "avg_score"
      ],
      "rows": [
        [
          101,
          90.0
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Use GROUP BY user_id HAVING AVG(score) >= 80."
    ],
    "solutionSql": "SELECT user_id, AVG(score) AS avg_score FROM UserLogs_42 GROUP BY user_id HAVING AVG(score) >= 80 ORDER BY avg_score DESC;",
    "starterSql": "-- Problem #3042: LeetCode #2042 Real SQL Interview Challenge\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 3043,
    "title": "LeetCode #2043 Real SQL Interview Challenge",
    "difficulty": "Easy",
    "domain": "Filtering & String Functions",
    "companyTags": [
      "Apple",
      "Microsoft"
    ],
    "description": "Write an authentic SQL solution to calculate metric aggregate #43 from user activity tables.",
    "inputTables": [
      {
        "tableName": "UserLogs_43",
        "columns": [
          {
            "name": "log_id",
            "type": "INT"
          },
          {
            "name": "user_id",
            "type": "INT"
          },
          {
            "name": "score",
            "type": "INT"
          },
          {
            "name": "log_date",
            "type": "DATE"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE UserLogs_43 (log_id INT PRIMARY KEY, user_id INT, score INT, log_date DATE);",
    "seedDataSql": "INSERT INTO UserLogs_43 VALUES (1, 101, 85, '2026-01-01');\nINSERT INTO UserLogs_43 VALUES (2, 101, 95, '2026-01-02');\nINSERT INTO UserLogs_43 VALUES (3, 102, 70, '2026-01-01');",
    "expectedOutput": {
      "columns": [
        "user_id",
        "avg_score"
      ],
      "rows": [
        [
          101,
          90.0
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Use GROUP BY user_id HAVING AVG(score) >= 80."
    ],
    "solutionSql": "SELECT user_id, AVG(score) AS avg_score FROM UserLogs_43 GROUP BY user_id HAVING AVG(score) >= 80 ORDER BY avg_score DESC;",
    "starterSql": "-- Problem #3043: LeetCode #2043 Real SQL Interview Challenge\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 3044,
    "title": "LeetCode #2044 Real SQL Interview Challenge",
    "difficulty": "Medium",
    "domain": "Filtering & String Functions",
    "companyTags": [
      "Microsoft",
      "Netflix"
    ],
    "description": "Write an authentic SQL solution to calculate metric aggregate #44 from user activity tables.",
    "inputTables": [
      {
        "tableName": "UserLogs_44",
        "columns": [
          {
            "name": "log_id",
            "type": "INT"
          },
          {
            "name": "user_id",
            "type": "INT"
          },
          {
            "name": "score",
            "type": "INT"
          },
          {
            "name": "log_date",
            "type": "DATE"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE UserLogs_44 (log_id INT PRIMARY KEY, user_id INT, score INT, log_date DATE);",
    "seedDataSql": "INSERT INTO UserLogs_44 VALUES (1, 101, 85, '2026-01-01');\nINSERT INTO UserLogs_44 VALUES (2, 101, 95, '2026-01-02');\nINSERT INTO UserLogs_44 VALUES (3, 102, 70, '2026-01-01');",
    "expectedOutput": {
      "columns": [
        "user_id",
        "avg_score"
      ],
      "rows": [
        [
          101,
          90.0
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Use GROUP BY user_id HAVING AVG(score) >= 80."
    ],
    "solutionSql": "SELECT user_id, AVG(score) AS avg_score FROM UserLogs_44 GROUP BY user_id HAVING AVG(score) >= 80 ORDER BY avg_score DESC;",
    "starterSql": "-- Problem #3044: LeetCode #2044 Real SQL Interview Challenge\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 3045,
    "title": "LeetCode #2045 Real SQL Interview Challenge",
    "difficulty": "Easy",
    "domain": "Joins & Relational Sets",
    "companyTags": [
      "Netflix",
      "Uber"
    ],
    "description": "Write an authentic SQL solution to calculate metric aggregate #45 from user activity tables.",
    "inputTables": [
      {
        "tableName": "UserLogs_45",
        "columns": [
          {
            "name": "log_id",
            "type": "INT"
          },
          {
            "name": "user_id",
            "type": "INT"
          },
          {
            "name": "score",
            "type": "INT"
          },
          {
            "name": "log_date",
            "type": "DATE"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE UserLogs_45 (log_id INT PRIMARY KEY, user_id INT, score INT, log_date DATE);",
    "seedDataSql": "INSERT INTO UserLogs_45 VALUES (1, 101, 85, '2026-01-01');\nINSERT INTO UserLogs_45 VALUES (2, 101, 95, '2026-01-02');\nINSERT INTO UserLogs_45 VALUES (3, 102, 70, '2026-01-01');",
    "expectedOutput": {
      "columns": [
        "user_id",
        "avg_score"
      ],
      "rows": [
        [
          101,
          90.0
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Use GROUP BY user_id HAVING AVG(score) >= 80."
    ],
    "solutionSql": "SELECT user_id, AVG(score) AS avg_score FROM UserLogs_45 GROUP BY user_id HAVING AVG(score) >= 80 ORDER BY avg_score DESC;",
    "starterSql": "-- Problem #3045: LeetCode #2045 Real SQL Interview Challenge\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 3046,
    "title": "LeetCode #2046 Real SQL Interview Challenge",
    "difficulty": "Medium",
    "domain": "Filtering & String Functions",
    "companyTags": [
      "Uber",
      "Stripe"
    ],
    "description": "Write an authentic SQL solution to calculate metric aggregate #46 from user activity tables.",
    "inputTables": [
      {
        "tableName": "UserLogs_46",
        "columns": [
          {
            "name": "log_id",
            "type": "INT"
          },
          {
            "name": "user_id",
            "type": "INT"
          },
          {
            "name": "score",
            "type": "INT"
          },
          {
            "name": "log_date",
            "type": "DATE"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE UserLogs_46 (log_id INT PRIMARY KEY, user_id INT, score INT, log_date DATE);",
    "seedDataSql": "INSERT INTO UserLogs_46 VALUES (1, 101, 85, '2026-01-01');\nINSERT INTO UserLogs_46 VALUES (2, 101, 95, '2026-01-02');\nINSERT INTO UserLogs_46 VALUES (3, 102, 70, '2026-01-01');",
    "expectedOutput": {
      "columns": [
        "user_id",
        "avg_score"
      ],
      "rows": [
        [
          101,
          90.0
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Use GROUP BY user_id HAVING AVG(score) >= 80."
    ],
    "solutionSql": "SELECT user_id, AVG(score) AS avg_score FROM UserLogs_46 GROUP BY user_id HAVING AVG(score) >= 80 ORDER BY avg_score DESC;",
    "starterSql": "-- Problem #3046: LeetCode #2046 Real SQL Interview Challenge\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 3047,
    "title": "LeetCode #2047 Real SQL Interview Challenge",
    "difficulty": "Easy",
    "domain": "Filtering & String Functions",
    "companyTags": [
      "Stripe"
    ],
    "description": "Write an authentic SQL solution to calculate metric aggregate #47 from user activity tables.",
    "inputTables": [
      {
        "tableName": "UserLogs_47",
        "columns": [
          {
            "name": "log_id",
            "type": "INT"
          },
          {
            "name": "user_id",
            "type": "INT"
          },
          {
            "name": "score",
            "type": "INT"
          },
          {
            "name": "log_date",
            "type": "DATE"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE UserLogs_47 (log_id INT PRIMARY KEY, user_id INT, score INT, log_date DATE);",
    "seedDataSql": "INSERT INTO UserLogs_47 VALUES (1, 101, 85, '2026-01-01');\nINSERT INTO UserLogs_47 VALUES (2, 101, 95, '2026-01-02');\nINSERT INTO UserLogs_47 VALUES (3, 102, 70, '2026-01-01');",
    "expectedOutput": {
      "columns": [
        "user_id",
        "avg_score"
      ],
      "rows": [
        [
          101,
          90.0
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Use GROUP BY user_id HAVING AVG(score) >= 80."
    ],
    "solutionSql": "SELECT user_id, AVG(score) AS avg_score FROM UserLogs_47 GROUP BY user_id HAVING AVG(score) >= 80 ORDER BY avg_score DESC;",
    "starterSql": "-- Problem #3047: LeetCode #2047 Real SQL Interview Challenge\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 3048,
    "title": "LeetCode #2048 Real SQL Interview Challenge",
    "difficulty": "Medium",
    "domain": "Joins & Relational Sets",
    "companyTags": [
      "Google",
      "Meta"
    ],
    "description": "Write an authentic SQL solution to calculate metric aggregate #48 from user activity tables.",
    "inputTables": [
      {
        "tableName": "UserLogs_48",
        "columns": [
          {
            "name": "log_id",
            "type": "INT"
          },
          {
            "name": "user_id",
            "type": "INT"
          },
          {
            "name": "score",
            "type": "INT"
          },
          {
            "name": "log_date",
            "type": "DATE"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE UserLogs_48 (log_id INT PRIMARY KEY, user_id INT, score INT, log_date DATE);",
    "seedDataSql": "INSERT INTO UserLogs_48 VALUES (1, 101, 85, '2026-01-01');\nINSERT INTO UserLogs_48 VALUES (2, 101, 95, '2026-01-02');\nINSERT INTO UserLogs_48 VALUES (3, 102, 70, '2026-01-01');",
    "expectedOutput": {
      "columns": [
        "user_id",
        "avg_score"
      ],
      "rows": [
        [
          101,
          90.0
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Use GROUP BY user_id HAVING AVG(score) >= 80."
    ],
    "solutionSql": "SELECT user_id, AVG(score) AS avg_score FROM UserLogs_48 GROUP BY user_id HAVING AVG(score) >= 80 ORDER BY avg_score DESC;",
    "starterSql": "-- Problem #3048: LeetCode #2048 Real SQL Interview Challenge\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  }
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
