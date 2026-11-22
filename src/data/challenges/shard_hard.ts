import { SQLChallenge } from './types';

const shard: SQLChallenge[] = [
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
            "type": "VARCHAR(255)"
          },
          {
            "name": "salary",
            "type": "INT"
          },
          {
            "name": "departmentId",
            "type": "INT"
          }
        ],
        "rows": [
          [
            1,
            "Joe",
            85000,
            1
          ],
          [
            2,
            "Henry",
            80000,
            2
          ],
          [
            3,
            "Sam",
            60000,
            2
          ],
          [
            4,
            "Max",
            90000,
            1
          ],
          [
            5,
            "Janet",
            69000,
            1
          ],
          [
            6,
            "Randy",
            85000,
            1
          ],
          [
            7,
            "Will",
            70000,
            1
          ]
        ]
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
            "type": "VARCHAR(255)"
          }
        ],
        "rows": [
          [
            1,
            "IT"
          ],
          [
            2,
            "Sales"
          ]
        ]
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
      "💡 DENSE_RANK() OVER (PARTITION BY departmentId ORDER BY salary DESC) <= 3."
    ],
    "solutionSql": "WITH RankedSalaries AS (SELECT d.name AS Department, e.name AS Employee, e.salary AS Salary, DENSE_RANK() OVER (PARTITION BY e.departmentId ORDER BY e.salary DESC) AS rnk FROM Employee e JOIN Department d ON e.departmentId = d.id) SELECT Department, Employee, Salary FROM RankedSalaries WHERE rnk <= 3;",
    "starterSql": "-- Problem #185: Department Top Three Salaries (LeetCode #185)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
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
            "type": "VARCHAR(50)"
          },
          {
            "name": "request_at",
            "type": "DATE"
          }
        ],
        "rows": [
          [
            1,
            1,
            10,
            1,
            "completed",
            "2013-10-01"
          ],
          [
            2,
            2,
            11,
            1,
            "cancelled_by_driver",
            "2013-10-01"
          ],
          [
            3,
            3,
            12,
            1,
            "completed",
            "2013-10-01"
          ],
          [
            4,
            4,
            10,
            12,
            "cancelled_by_client",
            "2013-10-01"
          ],
          [
            5,
            1,
            11,
            1,
            "completed",
            "2013-10-02"
          ],
          [
            6,
            3,
            11,
            6,
            "completed",
            "2013-10-02"
          ],
          [
            7,
            3,
            12,
            6,
            "completed",
            "2013-10-03"
          ]
        ]
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
            "type": "VARCHAR(10)"
          },
          {
            "name": "role",
            "type": "VARCHAR(20)"
          }
        ],
        "rows": [
          [
            1,
            "No",
            "client"
          ],
          [
            2,
            "Yes",
            "client"
          ],
          [
            3,
            "No",
            "client"
          ],
          [
            4,
            "No",
            "client"
          ],
          [
            10,
            "No",
            "driver"
          ],
          [
            11,
            "No",
            "driver"
          ],
          [
            12,
            "No",
            "driver"
          ]
        ]
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
          0
        ],
        [
          "2013-10-03",
          0
        ]
      ]
    },
    "hints": [
      "💡 Join Users for client and driver where banned = 'No'."
    ],
    "solutionSql": "SELECT t.request_at AS Day,\n       ROUND(SUM(CASE WHEN t.status LIKE 'cancelled%' THEN 1.0 ELSE 0.0 END) / COUNT(*), 2) AS 'Cancellation Rate'\nFROM Trips t\nJOIN Users c ON t.client_id = c.users_id AND c.banned = 'No'\nJOIN Users d ON t.driver_id = d.users_id AND d.banned = 'No'\nWHERE t.request_at BETWEEN '2013-10-01' AND '2013-10-03'\nGROUP BY t.request_at;",
    "starterSql": "-- Problem #262: Trips and Users (LeetCode #262)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
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
        "rows": [
          [
            1,
            "2017-01-01",
            10
          ],
          [
            2,
            "2017-01-02",
            109
          ],
          [
            3,
            "2017-01-03",
            150
          ],
          [
            4,
            "2017-01-04",
            99
          ],
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
      "💡 Group consecutive rows using id - ROW_NUMBER() OVER (ORDER BY id)."
    ],
    "solutionSql": "WITH Over100 AS (SELECT *, id - ROW_NUMBER() OVER (ORDER BY id) AS grp FROM Stadium WHERE people >= 100), Grouped AS (SELECT *, COUNT(*) OVER (PARTITION BY grp) AS cnt FROM Over100) SELECT id, visit_date, people FROM Grouped WHERE cnt >= 3 ORDER BY visit_date;",
    "starterSql": "-- Problem #601: Human Traffic of Stadium (LeetCode #601)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  }
];

export default shard;
