/**
 * challenges.ts — Authentic LeetCode & HackerRank SQL Challenge Dataset
 * Curated authentic LeetCode SQL problems with exact specifications, DDL schemas, test seed data, ground-truth outputs, and company tags.
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
      "\ud83d\udca1 Hint: Use LEFT JOIN Address a ON p.personId = a.personId."
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
      "\ud83d\udca1 Hint: Use (SELECT DISTINCT salary FROM Employee ORDER BY salary DESC LIMIT 1 OFFSET 1)."
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
      "\ud83d\udca1 Hint: DENSE_RANK() OVER (ORDER BY salary DESC)."
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
    "description": "Write a solution to find the rank of the scores. Scores should be ranked from high to low. If there is a tie between two scores, both should have the same ranking. After a tie, the next ranking number should be the next consecutive integer value.",
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
      "\ud83d\udca1 Hint: Use DENSE_RANK() OVER (ORDER BY score DESC)."
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
      "\ud83d\udca1 Hint: Use LEAD(num, 1) OVER (ORDER BY id) and LEAD(num, 2) OVER (ORDER BY id)."
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
      "\ud83d\udca1 Hint: JOIN Employee m ON e.managerId = m.id WHERE e.salary > m.salary."
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
    "description": "Write a solution to report all the duplicate emails. Note that it's guaranteed that the email field is not NULL.",
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
      "\ud83d\udca1 Hint: GROUP BY email HAVING COUNT(email) > 1."
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
      "\ud83d\udca1 Hint: LEFT JOIN Orders o ON c.id = o.customerId WHERE o.id IS NULL."
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
      "\ud83d\udca1 Hint: Use subquery or CTE to find MAX(salary) per departmentId."
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
    "description": "A company's executives are interested in seeing who earns the most money in each of the company's departments. High earners are employees who have a salary in the top three unique salaries for their department.",
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
      "\ud83d\udca1 Hint: DENSE_RANK() OVER (PARTITION BY departmentId ORDER BY salary DESC) <= 3."
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
      "\ud83d\udca1 Hint: SELECT MIN(id) AS id, email FROM Person GROUP BY email."
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
      "\ud83d\udca1 Hint: Join Weather w1 and w2 on date difference = 1."
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
    "description": "Find the cancellation rate of requests with unbanned users (both client and driver must not be banned) each day between '2013-10-01' and '2013-10-03'. Round Cancellation Rate to two decimal places.",
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
      "\ud83d\udca1 Hint: Join Users twice for client and driver where banned = 'No'."
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
      "\ud83d\udca1 Hint: SELECT player_id, MIN(event_date) AS first_login GROUP BY player_id."
    ],
    "solutionSql": "SELECT player_id, MIN(event_date) AS first_login FROM Activity GROUP BY player_id;",
    "starterSql": "-- Problem #511: Game Play Analysis I (LeetCode #511)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
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
      "\ud83d\udca1 Hint: WHERE id IN (SELECT managerId FROM Employee GROUP BY managerId HAVING COUNT(*) >= 5)."
    ],
    "solutionSql": "SELECT name FROM Employee WHERE id IN (SELECT managerId FROM Employee GROUP BY managerId HAVING COUNT(*) >= 5);",
    "starterSql": "-- Problem #570: Managers with 5 Direct Reports (LeetCode #570)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
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
      "\ud83d\udca1 Hint: Remember to include referee_id IS NULL in the WHERE clause!"
    ],
    "solutionSql": "SELECT name FROM Customer WHERE referee_id != 2 OR referee_id IS NULL;",
    "starterSql": "-- Problem #584: Find Customer Referee (LeetCode #584)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
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
      "\ud83d\udca1 Hint: GROUP BY customer_number ORDER BY COUNT(*) DESC LIMIT 1."
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
      "\ud83d\udca1 Hint: WHERE area >= 3000000 OR population >= 25000000."
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
      "\ud83d\udca1 Hint: GROUP BY class HAVING COUNT(student) >= 5."
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
      "\ud83d\udca1 Hint: Use id - ROW_NUMBER() OVER (ORDER BY id) to group consecutive rows."
    ],
    "solutionSql": "WITH Over100 AS (SELECT *, id - ROW_NUMBER() OVER (ORDER BY id) AS grp FROM Stadium WHERE people >= 100), Grouped AS (SELECT *, COUNT(*) OVER (PARTITION BY grp) AS cnt FROM Over100) SELECT id, visit_date, people FROM Grouped WHERE cnt >= 3 ORDER BY visit_date;",
    "starterSql": "-- Problem #601: Human Traffic of Stadium (LeetCode #601)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
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
      "\ud83d\udca1 Hint: Use NOT IN (SELECT o.sales_id FROM Orders o JOIN Company c ... WHERE c.name = 'RED')."
    ],
    "solutionSql": "SELECT name FROM SalesPerson WHERE sales_id NOT IN (SELECT o.sales_id FROM Orders o JOIN Company c ON o.com_id = c.com_id WHERE c.name = 'RED');",
    "starterSql": "-- Problem #607: Sales Person (LeetCode #607)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
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
    "description": "Write a solution to report the movies with an odd-numbered ID and a description that is not 'boring'. Return the result table ordered by rating in descending order.",
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
      "\ud83d\udca1 Hint: WHERE id % 2 != 0 AND description != 'boring' ORDER BY rating DESC."
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
      "\ud83d\udca1 Hint: Use CASE WHEN id % 2 != 0 THEN id + 1 ELSE id - 1 END."
    ],
    "solutionSql": "SELECT CASE WHEN id % 2 != 0 AND id = (SELECT MAX(id) FROM Seat) THEN id WHEN id % 2 != 0 THEN id + 1 ELSE id - 1 END AS id, student FROM Seat ORDER BY id;",
    "starterSql": "-- Problem #626: Exchange Seats (LeetCode #626)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
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
      "\ud83d\udca1 Hint: GROUP BY actor_id, director_id HAVING COUNT(*) >= 3."
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
      "\ud83d\udca1 Hint: JOIN Product p ON s.product_id = p.product_id."
    ],
    "solutionSql": "SELECT p.product_name, s.year, s.price FROM Sales s JOIN Product p ON s.product_id = p.product_id;",
    "starterSql": "-- Problem #1068: Product Sales Analysis I (LeetCode #1068)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 1141,
    "title": "User Activity Past 30 Days I (LeetCode #1141)",
    "difficulty": "Easy",
    "domain": "Date & Time Analytics",
    "companyTags": [
      "Meta",
      "Google"
    ],
    "description": "Write a solution to find the daily active user count for a period of 30 days ending 2019-07-27 inclusively. A user was active on total day if they made at least one activity on that day.",
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
      "\ud83d\udca1 Hint: WHERE activity_date BETWEEN '2019-06-28' AND '2019-07-27' GROUP BY activity_date."
    ],
    "solutionSql": "SELECT activity_date AS day, COUNT(DISTINCT user_id) AS active_users FROM Activity WHERE activity_date BETWEEN '2019-06-28' AND '2019-07-27' GROUP BY activity_date;",
    "starterSql": "-- Problem #1141: User Activity Past 30 Days I (LeetCode #1141)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
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
    "description": "Write an SQL query to find for each month and country, the number of transactions and their total amount, the number of approved transactions and their total amount.",
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
      "\ud83d\udca1 Hint: Use SUBSTR(trans_date, 1, 7) AS month and conditional SUM(CASE WHEN state = 'approved'...)."
    ],
    "solutionSql": "SELECT SUBSTR(trans_date, 1, 7) AS month, country, COUNT(*) AS trans_count, SUM(CASE WHEN state = 'approved' THEN 1 ELSE 0 END) AS approved_count, SUM(amount) AS trans_total_amount, SUM(CASE WHEN state = 'approved' THEN amount ELSE 0 END) AS approved_total_amount FROM Transactions GROUP BY month, country;",
    "starterSql": "-- Problem #1193: Monthly Transactions I (LeetCode #1193)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
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
      "\ud83d\udca1 Hint: LEFT JOIN EmployeeUNI u ON e.id = u.id."
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
    "description": "Write a solution to report the Capital Gain/Loss for each stock. Capital Gain/Loss is the total gain or loss after buying and selling the stock one or many times.",
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
      "\ud83d\udca1 Hint: SUM(CASE WHEN operation = 'Sell' THEN price ELSE -price END)."
    ],
    "solutionSql": "SELECT stock_name, SUM(CASE WHEN operation = 'Sell' THEN price ELSE -price END) AS capital_gain_loss FROM Stocks GROUP BY stock_name;",
    "starterSql": "-- Problem #1393: Capital Gain/Loss (LeetCode #1393)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
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
    "description": "Write a solution to find for each date the number of different products sold and their names. The sold products names for each date should be sorted lexicographically.",
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
      "\ud83d\udca1 Hint: Use GROUP_CONCAT(DISTINCT product) or STRING_AGG(DISTINCT product, ',')."
    ],
    "solutionSql": "SELECT sell_date, COUNT(DISTINCT product) AS num_sold, GROUP_CONCAT(DISTINCT product) AS products FROM Activities GROUP BY sell_date ORDER BY sell_date;",
    "starterSql": "-- Problem #1484: Group Sold Products By Date (LeetCode #1484)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
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
      "\ud83d\udca1 Hint: UPPER(SUBSTR(name, 1, 1)) || LOWER(SUBSTR(name, 2))."
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
      "\ud83d\udca1 Hint: WHERE LENGTH(content) > 15."
    ],
    "solutionSql": "SELECT tweet_id FROM Tweets WHERE LENGTH(content) > 15;",
    "starterSql": "-- Problem #1683: Invalid Tweets (LeetCode #1683)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
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
      "\ud83d\udca1 Hint: WHERE low_fats = 'Y' AND recyclable = 'Y'."
    ],
    "solutionSql": "SELECT product_id FROM Products WHERE low_fats = 'Y' AND recyclable = 'Y';",
    "starterSql": "-- Problem #1757: Recyclable and Low Fat Products (LeetCode #1757)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
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
    "description": "Write a solution to calculate the bonus of each employee. The bonus of an employee is 100% of their salary if the ID of the employee is an odd number and the employee's name does not start with the character 'M'. Otherwise, the bonus of an employee is 0.",
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
      "\ud83d\udca1 Hint: CASE WHEN employee_id % 2 != 0 AND name NOT LIKE 'M%' THEN salary ELSE 0 END."
    ],
    "solutionSql": "SELECT employee_id, CASE WHEN employee_id % 2 != 0 AND name NOT LIKE 'M%' THEN salary ELSE 0 END AS bonus FROM Employees ORDER BY employee_id;",
    "starterSql": "-- Problem #1873: Calculate Special Bonus (LeetCode #1873)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
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
