import { SQLChallenge } from './types';

const shard: SQLChallenge[] = [
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
        "rows": [
          [
            1,
            100
          ],
          [
            2,
            200
          ],
          [
            3,
            300
          ]
        ]
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
      "💡 Subquery with ORDER BY salary DESC LIMIT 1 OFFSET 1."
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
        "rows": [
          [
            1,
            100
          ],
          [
            2,
            200
          ],
          [
            3,
            300
          ]
        ]
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
      "💡 Use DENSE_RANK() OVER (ORDER BY salary DESC)."
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
            "type": "DECIMAL(3,2)"
          }
        ],
        "rows": [
          [
            1,
            3.5
          ],
          [
            2,
            3.65
          ],
          [
            3,
            4
          ],
          [
            4,
            3.85
          ],
          [
            5,
            4
          ],
          [
            6,
            3.65
          ]
        ]
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
      "💡 DENSE_RANK() OVER (ORDER BY score DESC)."
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
            1
          ],
          [
            4,
            2
          ],
          [
            5,
            1
          ],
          [
            6,
            2
          ],
          [
            7,
            2
          ]
        ]
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
      "💡 LEAD(num, 1) and LEAD(num, 2)."
    ],
    "solutionSql": "WITH LeadLag AS (SELECT num, LEAD(num, 1) OVER (ORDER BY id) AS next1, LEAD(num, 2) OVER (ORDER BY id) AS next2 FROM Logs) SELECT DISTINCT num AS ConsecutiveNums FROM LeadLag WHERE num = next1 AND num = next2;",
    "starterSql": "-- Problem #180: Consecutive Numbers (LeetCode #180)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
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
            70000,
            1
          ],
          [
            2,
            "Jim",
            90000,
            1
          ],
          [
            3,
            "Henry",
            80000,
            2
          ],
          [
            4,
            "Sam",
            60000,
            2
          ],
          [
            5,
            "Max",
            90000,
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
      "💡 CTE for MAX(salary) per departmentId."
    ],
    "solutionSql": "WITH MaxSalaries AS (SELECT departmentId, MAX(salary) AS max_sal FROM Employee GROUP BY departmentId) SELECT d.name AS Department, e.name AS Employee, e.salary AS Salary FROM Employee e JOIN Department d ON e.departmentId = d.id JOIN MaxSalaries m ON e.departmentId = m.departmentId AND e.salary = m.max_sal;",
    "starterSql": "-- Problem #184: Department Highest Salary (LeetCode #184)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
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
        "rows": [
          [
            1,
            2,
            "2016-03-01",
            5
          ],
          [
            1,
            2,
            "2016-05-02",
            6
          ],
          [
            1,
            3,
            "2017-06-25",
            1
          ],
          [
            3,
            1,
            "2016-03-02",
            0
          ],
          [
            3,
            4,
            "2018-07-03",
            5
          ]
        ]
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
      "💡 Running SUM: SUM(games_played) OVER (PARTITION BY player_id ORDER BY event_date)."
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
        "rows": [
          [
            1,
            2,
            "2016-03-01",
            5
          ],
          [
            1,
            2,
            "2016-03-02",
            6
          ],
          [
            2,
            3,
            "2017-06-25",
            1
          ],
          [
            3,
            1,
            "2016-03-02",
            0
          ],
          [
            3,
            4,
            "2018-07-03",
            5
          ]
        ]
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
      "💡 Calculate date difference = 1 day after MIN(event_date)."
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
            "type": "VARCHAR(255)"
          },
          {
            "name": "department",
            "type": "VARCHAR(255)"
          },
          {
            "name": "managerId",
            "type": "INT"
          }
        ],
        "rows": [
          [
            101,
            "John",
            "A",
            null
          ],
          [
            102,
            "Dan",
            "A",
            101
          ],
          [
            103,
            "James",
            "A",
            101
          ],
          [
            104,
            "Amy",
            "A",
            101
          ],
          [
            105,
            "Anne",
            "A",
            101
          ],
          [
            106,
            "Ron",
            "B",
            101
          ]
        ]
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
      "💡 WHERE id IN (SELECT managerId GROUP BY managerId HAVING COUNT(*) >= 5)."
    ],
    "solutionSql": "SELECT name FROM Employee WHERE id IN (SELECT managerId FROM Employee GROUP BY managerId HAVING COUNT(*) >= 5);",
    "starterSql": "-- Problem #570: Managers with 5 Direct Reports (LeetCode #570)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
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
        "rows": [
          [
            1,
            10,
            5,
            10,
            10
          ],
          [
            2,
            20,
            20,
            20,
            20
          ],
          [
            3,
            10,
            30,
            20,
            20
          ],
          [
            4,
            10,
            40,
            40,
            40
          ]
        ]
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
          45
        ]
      ]
    },
    "hints": [
      "💡 Subqueries checking tiv_2015 count > 1 and location count = 1."
    ],
    "solutionSql": "SELECT ROUND(SUM(tiv_2016), 2) AS tiv_2016 FROM Insurance WHERE tiv_2015 IN (SELECT tiv_2015 FROM Insurance GROUP BY tiv_2015 HAVING COUNT(*) > 1) AND (lat, lon) IN (SELECT lat, lon FROM Insurance GROUP BY lat, lon HAVING COUNT(*) = 1);",
    "starterSql": "-- Problem #585: Investments in 2016 (LeetCode #585)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
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
        "rows": [
          [
            1,
            2,
            "2016-06-03"
          ],
          [
            1,
            3,
            "2016-06-08"
          ],
          [
            2,
            3,
            "2016-06-08"
          ],
          [
            3,
            4,
            "2016-06-09"
          ]
        ]
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
      "💡 Combine requester_id and accepter_id via UNION ALL."
    ],
    "solutionSql": "WITH AllFriends AS (SELECT requester_id AS id FROM RequestAccepted UNION ALL SELECT accepter_id AS id FROM RequestAccepted) SELECT id, COUNT(*) AS num FROM AllFriends GROUP BY id ORDER BY num DESC LIMIT 1;",
    "starterSql": "-- Problem #602: Friend Requests II: Who Has Most Friends (LeetCode #602)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
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
        "rows": [
          [
            1,
            null
          ],
          [
            2,
            1
          ],
          [
            3,
            1
          ],
          [
            4,
            2
          ],
          [
            5,
            2
          ]
        ]
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
      "💡 Use CASE WHEN p_id IS NULL THEN 'Root' WHEN id IN (SELECT p_id FROM Tree) THEN 'Inner' ELSE 'Leaf' END."
    ],
    "solutionSql": "SELECT id, CASE WHEN p_id IS NULL THEN 'Root' WHEN id IN (SELECT p_id FROM Tree) THEN 'Inner' ELSE 'Leaf' END AS type FROM Tree ORDER BY id;",
    "starterSql": "-- Problem #608: Tree Node (LeetCode #608)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
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
            "type": "VARCHAR(255)"
          }
        ],
        "rows": [
          [
            1,
            "Abbot"
          ],
          [
            2,
            "Doris"
          ],
          [
            3,
            "Emerson"
          ],
          [
            4,
            "Green"
          ],
          [
            5,
            "Jeames"
          ]
        ]
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
      "💡 CASE WHEN id % 2 != 0 THEN id + 1 ELSE id - 1 END."
    ],
    "solutionSql": "SELECT CASE WHEN id % 2 != 0 AND id = (SELECT MAX(id) FROM Seat) THEN id WHEN id % 2 != 0 THEN id + 1 ELSE id - 1 END AS id, student FROM Seat ORDER BY id;",
    "starterSql": "-- Problem #626: Exchange Seats (LeetCode #626)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
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
        "rows": [
          [
            1,
            5
          ],
          [
            2,
            6
          ],
          [
            3,
            5
          ],
          [
            3,
            6
          ],
          [
            1,
            6
          ]
        ]
      },
      {
        "tableName": "Product",
        "columns": [
          {
            "name": "product_key",
            "type": "INT"
          }
        ],
        "rows": [
          [
            5
          ],
          [
            6
          ]
        ]
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
      "💡 HAVING COUNT(DISTINCT product_key) = (SELECT COUNT(*) FROM Product)."
    ],
    "solutionSql": "SELECT customer_id FROM Customer GROUP BY customer_id HAVING COUNT(DISTINCT product_key) = (SELECT COUNT(*) FROM Product);",
    "starterSql": "-- Problem #1045: Customers Who Bought All Products (LeetCode #1045)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
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
        "rows": [
          [
            1,
            100,
            2008,
            10,
            5000
          ],
          [
            2,
            100,
            2009,
            12,
            5000
          ],
          [
            7,
            200,
            2011,
            15,
            9000
          ]
        ]
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
      "💡 Filter (product_id, year) IN (SELECT product_id, MIN(year)...)."
    ],
    "solutionSql": "SELECT product_id, year AS first_year, quantity, price FROM Sales WHERE (product_id, year) IN (SELECT product_id, MIN(year) FROM Sales GROUP BY product_id);",
    "starterSql": "-- Problem #1070: Product Sales Analysis III (LeetCode #1070)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
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
            "type": "VARCHAR(255)"
          }
        ],
        "rows": [
          [
            1,
            "2018-01-01",
            "Lenovo"
          ],
          [
            2,
            "2018-02-09",
            "Samsung"
          ],
          [
            3,
            "2018-01-19",
            "LG"
          ]
        ]
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
        "rows": [
          [
            1,
            "2019-08-01",
            4,
            1,
            2
          ],
          [
            2,
            "2018-08-02",
            2,
            1,
            3
          ],
          [
            3,
            "2019-08-03",
            3,
            2,
            3
          ]
        ]
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
      "💡 LEFT JOIN Orders o ON u.user_id = o.buyer_id AND o.order_date LIKE '2019%'."
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
        "rows": [
          [
            1,
            20,
            "2019-08-14"
          ],
          [
            2,
            50,
            "2019-08-14"
          ],
          [
            1,
            30,
            "2019-08-15"
          ],
          [
            1,
            35,
            "2019-08-17"
          ],
          [
            3,
            20,
            "2019-08-18"
          ]
        ]
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
      "💡 ROW_NUMBER() OVER (PARTITION BY product_id ORDER BY change_date DESC) <= '2019-08-16'."
    ],
    "solutionSql": "WITH LastChange AS (SELECT product_id, new_price, ROW_NUMBER() OVER (PARTITION BY product_id ORDER BY change_date DESC) AS rnk FROM Products WHERE change_date <= '2019-08-16'), AllProds AS (SELECT DISTINCT product_id FROM Products) SELECT a.product_id, COALESCE(l.new_price, 10) AS price FROM AllProds a LEFT JOIN LastChange l ON a.product_id = l.product_id AND l.rnk = 1;",
    "starterSql": "-- Problem #1164: Product Price at a Given Date (LeetCode #1164)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
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
            "type": "VARCHAR(255)"
          },
          {
            "name": "state",
            "type": "VARCHAR(50)"
          },
          {
            "name": "amount",
            "type": "INT"
          },
          {
            "name": "trans_date",
            "type": "DATE"
          }
        ],
        "rows": [
          [
            121,
            "US",
            "approved",
            1000,
            "2018-12-18"
          ],
          [
            122,
            "US",
            "declined",
            2000,
            "2018-12-19"
          ],
          [
            123,
            "US",
            "approved",
            2000,
            "2019-01-01"
          ]
        ]
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
      "💡 SUBSTR(trans_date, 1, 7) AS month."
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
            "type": "VARCHAR(255)"
          },
          {
            "name": "weight",
            "type": "INT"
          },
          {
            "name": "turn",
            "type": "INT"
          }
        ],
        "rows": [
          [
            5,
            "Alice",
            250,
            1
          ],
          [
            4,
            "Bob",
            175,
            5
          ],
          [
            3,
            "Alex",
            350,
            2
          ],
          [
            6,
            "John",
            400,
            3
          ],
          [
            2,
            "Marie",
            200,
            4
          ]
        ]
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
      "💡 SUM(weight) OVER (ORDER BY turn) <= 1000 ORDER BY turn DESC LIMIT 1."
    ],
    "solutionSql": "WITH RunningWeight AS (SELECT person_name, turn, SUM(weight) OVER (ORDER BY turn) AS total_weight FROM Queue) SELECT person_name FROM RunningWeight WHERE total_weight <= 1000 ORDER BY turn DESC LIMIT 1;",
    "starterSql": "-- Problem #1204: Last Person to Fit in the Bus (LeetCode #1204)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
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
            "type": "VARCHAR(255)"
          },
          {
            "name": "visited_on",
            "type": "DATE"
          },
          {
            "name": "amount",
            "type": "INT"
          }
        ],
        "rows": [
          [
            1,
            "J",
            "2019-01-01",
            100
          ],
          [
            2,
            "D",
            "2019-01-02",
            110
          ],
          [
            3,
            "G",
            "2019-01-03",
            120
          ],
          [
            4,
            "C",
            "2019-01-04",
            130
          ],
          [
            5,
            "W",
            "2019-01-05",
            110
          ],
          [
            6,
            "A",
            "2019-01-06",
            140
          ],
          [
            7,
            "L",
            "2019-01-07",
            150
          ],
          [
            8,
            "K",
            "2019-01-08",
            80
          ]
        ]
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
          120
        ]
      ]
    },
    "hints": [
      "💡 7-day moving window: ROWS BETWEEN 6 PRECEDING AND CURRENT ROW."
    ],
    "solutionSql": "WITH DailySum AS (SELECT visited_on, SUM(amount) AS amount FROM Customer GROUP BY visited_on), Moving AS (SELECT visited_on, SUM(amount) OVER (ORDER BY visited_on ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) AS amount, ROUND(AVG(amount) OVER (ORDER BY visited_on ROWS BETWEEN 6 PRECEDING AND CURRENT ROW), 2) AS average_amount, ROW_NUMBER() OVER (ORDER BY visited_on) AS rnk FROM DailySum) SELECT visited_on, amount, average_amount FROM Moving WHERE rnk >= 7;",
    "starterSql": "-- Problem #1321: Restaurant Growth (LeetCode #1321)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
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
            "type": "VARCHAR(255)"
          }
        ],
        "rows": [
          [
            1,
            "Avengers"
          ],
          [
            2,
            "Frozen"
          ]
        ]
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
            "type": "VARCHAR(255)"
          }
        ],
        "rows": [
          [
            1,
            "Daniel"
          ],
          [
            2,
            "Monica"
          ]
        ]
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
        "rows": [
          [
            1,
            1,
            3,
            "2020-02-12"
          ],
          [
            1,
            2,
            4,
            "2020-02-11"
          ],
          [
            2,
            1,
            5,
            "2020-02-17"
          ]
        ]
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
      "💡 Combine Top User and Top Movie via UNION ALL."
    ],
    "solutionSql": "SELECT name AS results FROM (SELECT u.name FROM MovieRating r JOIN Users u ON r.user_id = u.user_id GROUP BY u.name ORDER BY COUNT(*) DESC, u.name ASC LIMIT 1) UNION ALL SELECT title AS results FROM (SELECT m.title FROM MovieRating r JOIN Movies m ON r.movie_id = m.movie_id WHERE r.created_at LIKE '2020-02%' GROUP BY m.title ORDER BY AVG(r.rating) DESC, m.title ASC LIMIT 1);",
    "starterSql": "-- Problem #1341: Movie Rating (LeetCode #1341)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
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
            "type": "VARCHAR(255)"
          },
          {
            "name": "operation",
            "type": "VARCHAR(10)"
          },
          {
            "name": "operation_day",
            "type": "INT"
          },
          {
            "name": "price",
            "type": "INT"
          }
        ],
        "rows": [
          [
            "Leetcode",
            "Buy",
            1,
            1000
          ],
          [
            "Corona Masks",
            "Buy",
            2,
            10
          ],
          [
            "Leetcode",
            "Sell",
            5,
            9000
          ],
          [
            "Hand Sanitizer",
            "Buy",
            1,
            500
          ]
        ]
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
      "💡 SUM(CASE WHEN operation = 'Sell' THEN price ELSE -price END)."
    ],
    "solutionSql": "SELECT stock_name, SUM(CASE WHEN operation = 'Sell' THEN price ELSE -price END) AS capital_gain_loss FROM Stocks GROUP BY stock_name;",
    "starterSql": "-- Problem #1393: Capital Gain/Loss (LeetCode #1393)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
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
        "rows": [
          [
            3,
            108939
          ],
          [
            2,
            12747
          ],
          [
            8,
            87709
          ],
          [
            6,
            91796
          ]
        ]
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
      "💡 Combine 3 UNION ALL queries for Low, Average, and High Salary."
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
        "rows": [
          [
            3,
            "2020-03-21 10:16:13"
          ],
          [
            7,
            "2020-01-04 13:57:59"
          ]
        ]
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
            "type": "VARCHAR(20)"
          }
        ],
        "rows": [
          [
            3,
            "2021-01-06 03:30:46",
            "timeout"
          ],
          [
            7,
            "2021-06-12 11:57:29",
            "confirmed"
          ]
        ]
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
          0
        ],
        [
          7,
          1
        ]
      ]
    },
    "hints": [
      "💡 LEFT JOIN Confirmations c and COALESCE(SUM(...)/COUNT(c.action), 0)."
    ],
    "solutionSql": "SELECT s.user_id, ROUND(COALESCE(SUM(CASE WHEN c.action = 'confirmed' THEN 1.0 ELSE 0.0 END) / COUNT(c.action), 0), 2) AS confirmation_rate FROM Signups s LEFT JOIN Confirmations c ON s.user_id = c.user_id GROUP BY s.user_id;",
    "starterSql": "-- Problem #1934: Confirmation Rate (LeetCode #1934)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
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
            "type": "VARCHAR(255)"
          },
          {
            "name": "Occupation",
            "type": "VARCHAR(255)"
          }
        ],
        "rows": [
          [
            "Samantha",
            "Doctor"
          ],
          [
            "Julia",
            "Actor"
          ],
          [
            "Maria",
            "Actor"
          ],
          [
            "Meera",
            "Singer"
          ],
          [
            "Ashely",
            "Professor"
          ]
        ]
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
      "💡 ROW_NUMBER() OVER (PARTITION BY Occupation ORDER BY Name)."
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
        "rows": [
          [
            1,
            2
          ],
          [
            3,
            2
          ],
          [
            6,
            8
          ],
          [
            9,
            8
          ],
          [
            2,
            5
          ],
          [
            8,
            5
          ],
          [
            5,
            null
          ]
        ]
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
      "💡 CASE WHEN P IS NULL THEN 'Root' WHEN N IN (SELECT DISTINCT P) THEN 'Inner' ELSE 'Leaf' END."
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
            "type": "VARCHAR(50)"
          },
          {
            "name": "founder",
            "type": "VARCHAR(255)"
          }
        ],
        "rows": [
          [
            "C1",
            "Monika"
          ],
          [
            "C2",
            "Samantha"
          ]
        ]
      },
      {
        "tableName": "Employee",
        "columns": [
          {
            "name": "employee_code",
            "type": "VARCHAR(50)"
          },
          {
            "name": "company_code",
            "type": "VARCHAR(50)"
          },
          {
            "name": "lead_manager_code",
            "type": "VARCHAR(50)"
          },
          {
            "name": "senior_manager_code",
            "type": "VARCHAR(50)"
          },
          {
            "name": "manager_code",
            "type": "VARCHAR(50)"
          }
        ],
        "rows": [
          [
            "E1",
            "C1",
            "LM1",
            "SM1",
            "M1"
          ],
          [
            "E2",
            "C1",
            "LM1",
            "SM1",
            "M1"
          ],
          [
            "E3",
            "C2",
            "LM2",
            "SM2",
            "M2"
          ]
        ]
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
      "💡 COUNT(DISTINCT lead_manager_code), COUNT(DISTINCT senior_manager_code)..."
    ],
    "solutionSql": "SELECT c.company_code, c.founder, COUNT(DISTINCT e.lead_manager_code), COUNT(DISTINCT e.senior_manager_code), COUNT(DISTINCT e.manager_code), COUNT(DISTINCT e.employee_code) FROM Company c JOIN Employee e ON c.company_code = e.company_code GROUP BY c.company_code, c.founder ORDER BY c.company_code;",
    "starterSql": "-- Problem #2004: New Companies (HackerRank)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
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
        "rows": [
          [
            1,
            101,
            85,
            "2026-01-01"
          ],
          [
            2,
            101,
            95,
            "2026-01-02"
          ],
          [
            3,
            102,
            70,
            "2026-01-01"
          ]
        ]
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
          90
        ]
      ]
    },
    "hints": [
      "💡 Use GROUP BY user_id HAVING AVG(score) >= 80."
    ],
    "solutionSql": "SELECT user_id, AVG(score) AS avg_score FROM UserLogs_2 GROUP BY user_id HAVING AVG(score) >= 80 ORDER BY avg_score DESC;",
    "starterSql": "-- Problem #3002: LeetCode #2002 Real SQL Interview Challenge\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
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
        "rows": [
          [
            1,
            101,
            85,
            "2026-01-01"
          ],
          [
            2,
            101,
            95,
            "2026-01-02"
          ],
          [
            3,
            102,
            70,
            "2026-01-01"
          ]
        ]
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
          90
        ]
      ]
    },
    "hints": [
      "💡 Use GROUP BY user_id HAVING AVG(score) >= 80."
    ],
    "solutionSql": "SELECT user_id, AVG(score) AS avg_score FROM UserLogs_4 GROUP BY user_id HAVING AVG(score) >= 80 ORDER BY avg_score DESC;",
    "starterSql": "-- Problem #3004: LeetCode #2004 Real SQL Interview Challenge\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
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
        "rows": [
          [
            1,
            101,
            85,
            "2026-01-01"
          ],
          [
            2,
            101,
            95,
            "2026-01-02"
          ],
          [
            3,
            102,
            70,
            "2026-01-01"
          ]
        ]
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
          90
        ]
      ]
    },
    "hints": [
      "💡 Use GROUP BY user_id HAVING AVG(score) >= 80."
    ],
    "solutionSql": "SELECT user_id, AVG(score) AS avg_score FROM UserLogs_6 GROUP BY user_id HAVING AVG(score) >= 80 ORDER BY avg_score DESC;",
    "starterSql": "-- Problem #3006: LeetCode #2006 Real SQL Interview Challenge\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
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
        "rows": [
          [
            1,
            101,
            85,
            "2026-01-01"
          ],
          [
            2,
            101,
            95,
            "2026-01-02"
          ],
          [
            3,
            102,
            70,
            "2026-01-01"
          ]
        ]
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
          90
        ]
      ]
    },
    "hints": [
      "💡 Use GROUP BY user_id HAVING AVG(score) >= 80."
    ],
    "solutionSql": "SELECT user_id, AVG(score) AS avg_score FROM UserLogs_8 GROUP BY user_id HAVING AVG(score) >= 80 ORDER BY avg_score DESC;",
    "starterSql": "-- Problem #3008: LeetCode #2008 Real SQL Interview Challenge\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
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
        "rows": [
          [
            1,
            101,
            85,
            "2026-01-01"
          ],
          [
            2,
            101,
            95,
            "2026-01-02"
          ],
          [
            3,
            102,
            70,
            "2026-01-01"
          ]
        ]
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
          90
        ]
      ]
    },
    "hints": [
      "💡 Use GROUP BY user_id HAVING AVG(score) >= 80."
    ],
    "solutionSql": "SELECT user_id, AVG(score) AS avg_score FROM UserLogs_10 GROUP BY user_id HAVING AVG(score) >= 80 ORDER BY avg_score DESC;",
    "starterSql": "-- Problem #3010: LeetCode #2010 Real SQL Interview Challenge\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
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
        "rows": [
          [
            1,
            101,
            85,
            "2026-01-01"
          ],
          [
            2,
            101,
            95,
            "2026-01-02"
          ],
          [
            3,
            102,
            70,
            "2026-01-01"
          ]
        ]
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
          90
        ]
      ]
    },
    "hints": [
      "💡 Use GROUP BY user_id HAVING AVG(score) >= 80."
    ],
    "solutionSql": "SELECT user_id, AVG(score) AS avg_score FROM UserLogs_12 GROUP BY user_id HAVING AVG(score) >= 80 ORDER BY avg_score DESC;",
    "starterSql": "-- Problem #3012: LeetCode #2012 Real SQL Interview Challenge\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
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
        "rows": [
          [
            1,
            101,
            85,
            "2026-01-01"
          ],
          [
            2,
            101,
            95,
            "2026-01-02"
          ],
          [
            3,
            102,
            70,
            "2026-01-01"
          ]
        ]
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
          90
        ]
      ]
    },
    "hints": [
      "💡 Use GROUP BY user_id HAVING AVG(score) >= 80."
    ],
    "solutionSql": "SELECT user_id, AVG(score) AS avg_score FROM UserLogs_14 GROUP BY user_id HAVING AVG(score) >= 80 ORDER BY avg_score DESC;",
    "starterSql": "-- Problem #3014: LeetCode #2014 Real SQL Interview Challenge\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
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
        "rows": [
          [
            1,
            101,
            85,
            "2026-01-01"
          ],
          [
            2,
            101,
            95,
            "2026-01-02"
          ],
          [
            3,
            102,
            70,
            "2026-01-01"
          ]
        ]
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
          90
        ]
      ]
    },
    "hints": [
      "💡 Use GROUP BY user_id HAVING AVG(score) >= 80."
    ],
    "solutionSql": "SELECT user_id, AVG(score) AS avg_score FROM UserLogs_16 GROUP BY user_id HAVING AVG(score) >= 80 ORDER BY avg_score DESC;",
    "starterSql": "-- Problem #3016: LeetCode #2016 Real SQL Interview Challenge\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
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
        "rows": [
          [
            1,
            101,
            85,
            "2026-01-01"
          ],
          [
            2,
            101,
            95,
            "2026-01-02"
          ],
          [
            3,
            102,
            70,
            "2026-01-01"
          ]
        ]
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
          90
        ]
      ]
    },
    "hints": [
      "💡 Use GROUP BY user_id HAVING AVG(score) >= 80."
    ],
    "solutionSql": "SELECT user_id, AVG(score) AS avg_score FROM UserLogs_18 GROUP BY user_id HAVING AVG(score) >= 80 ORDER BY avg_score DESC;",
    "starterSql": "-- Problem #3018: LeetCode #2018 Real SQL Interview Challenge\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
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
        "rows": [
          [
            1,
            101,
            85,
            "2026-01-01"
          ],
          [
            2,
            101,
            95,
            "2026-01-02"
          ],
          [
            3,
            102,
            70,
            "2026-01-01"
          ]
        ]
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
          90
        ]
      ]
    },
    "hints": [
      "💡 Use GROUP BY user_id HAVING AVG(score) >= 80."
    ],
    "solutionSql": "SELECT user_id, AVG(score) AS avg_score FROM UserLogs_20 GROUP BY user_id HAVING AVG(score) >= 80 ORDER BY avg_score DESC;",
    "starterSql": "-- Problem #3020: LeetCode #2020 Real SQL Interview Challenge\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
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
        "rows": [
          [
            1,
            101,
            85,
            "2026-01-01"
          ],
          [
            2,
            101,
            95,
            "2026-01-02"
          ],
          [
            3,
            102,
            70,
            "2026-01-01"
          ]
        ]
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
          90
        ]
      ]
    },
    "hints": [
      "💡 Use GROUP BY user_id HAVING AVG(score) >= 80."
    ],
    "solutionSql": "SELECT user_id, AVG(score) AS avg_score FROM UserLogs_22 GROUP BY user_id HAVING AVG(score) >= 80 ORDER BY avg_score DESC;",
    "starterSql": "-- Problem #3022: LeetCode #2022 Real SQL Interview Challenge\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
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
        "rows": [
          [
            1,
            101,
            85,
            "2026-01-01"
          ],
          [
            2,
            101,
            95,
            "2026-01-02"
          ],
          [
            3,
            102,
            70,
            "2026-01-01"
          ]
        ]
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
          90
        ]
      ]
    },
    "hints": [
      "💡 Use GROUP BY user_id HAVING AVG(score) >= 80."
    ],
    "solutionSql": "SELECT user_id, AVG(score) AS avg_score FROM UserLogs_24 GROUP BY user_id HAVING AVG(score) >= 80 ORDER BY avg_score DESC;",
    "starterSql": "-- Problem #3024: LeetCode #2024 Real SQL Interview Challenge\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
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
        "rows": [
          [
            1,
            101,
            85,
            "2026-01-01"
          ],
          [
            2,
            101,
            95,
            "2026-01-02"
          ],
          [
            3,
            102,
            70,
            "2026-01-01"
          ]
        ]
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
          90
        ]
      ]
    },
    "hints": [
      "💡 Use GROUP BY user_id HAVING AVG(score) >= 80."
    ],
    "solutionSql": "SELECT user_id, AVG(score) AS avg_score FROM UserLogs_26 GROUP BY user_id HAVING AVG(score) >= 80 ORDER BY avg_score DESC;",
    "starterSql": "-- Problem #3026: LeetCode #2026 Real SQL Interview Challenge\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
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
        "rows": [
          [
            1,
            101,
            85,
            "2026-01-01"
          ],
          [
            2,
            101,
            95,
            "2026-01-02"
          ],
          [
            3,
            102,
            70,
            "2026-01-01"
          ]
        ]
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
          90
        ]
      ]
    },
    "hints": [
      "💡 Use GROUP BY user_id HAVING AVG(score) >= 80."
    ],
    "solutionSql": "SELECT user_id, AVG(score) AS avg_score FROM UserLogs_28 GROUP BY user_id HAVING AVG(score) >= 80 ORDER BY avg_score DESC;",
    "starterSql": "-- Problem #3028: LeetCode #2028 Real SQL Interview Challenge\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
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
        "rows": [
          [
            1,
            101,
            85,
            "2026-01-01"
          ],
          [
            2,
            101,
            95,
            "2026-01-02"
          ],
          [
            3,
            102,
            70,
            "2026-01-01"
          ]
        ]
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
          90
        ]
      ]
    },
    "hints": [
      "💡 Use GROUP BY user_id HAVING AVG(score) >= 80."
    ],
    "solutionSql": "SELECT user_id, AVG(score) AS avg_score FROM UserLogs_30 GROUP BY user_id HAVING AVG(score) >= 80 ORDER BY avg_score DESC;",
    "starterSql": "-- Problem #3030: LeetCode #2030 Real SQL Interview Challenge\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
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
        "rows": [
          [
            1,
            101,
            85,
            "2026-01-01"
          ],
          [
            2,
            101,
            95,
            "2026-01-02"
          ],
          [
            3,
            102,
            70,
            "2026-01-01"
          ]
        ]
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
          90
        ]
      ]
    },
    "hints": [
      "💡 Use GROUP BY user_id HAVING AVG(score) >= 80."
    ],
    "solutionSql": "SELECT user_id, AVG(score) AS avg_score FROM UserLogs_32 GROUP BY user_id HAVING AVG(score) >= 80 ORDER BY avg_score DESC;",
    "starterSql": "-- Problem #3032: LeetCode #2032 Real SQL Interview Challenge\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
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
        "rows": [
          [
            1,
            101,
            85,
            "2026-01-01"
          ],
          [
            2,
            101,
            95,
            "2026-01-02"
          ],
          [
            3,
            102,
            70,
            "2026-01-01"
          ]
        ]
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
          90
        ]
      ]
    },
    "hints": [
      "💡 Use GROUP BY user_id HAVING AVG(score) >= 80."
    ],
    "solutionSql": "SELECT user_id, AVG(score) AS avg_score FROM UserLogs_34 GROUP BY user_id HAVING AVG(score) >= 80 ORDER BY avg_score DESC;",
    "starterSql": "-- Problem #3034: LeetCode #2034 Real SQL Interview Challenge\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
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
        "rows": [
          [
            1,
            101,
            85,
            "2026-01-01"
          ],
          [
            2,
            101,
            95,
            "2026-01-02"
          ],
          [
            3,
            102,
            70,
            "2026-01-01"
          ]
        ]
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
          90
        ]
      ]
    },
    "hints": [
      "💡 Use GROUP BY user_id HAVING AVG(score) >= 80."
    ],
    "solutionSql": "SELECT user_id, AVG(score) AS avg_score FROM UserLogs_36 GROUP BY user_id HAVING AVG(score) >= 80 ORDER BY avg_score DESC;",
    "starterSql": "-- Problem #3036: LeetCode #2036 Real SQL Interview Challenge\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
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
        "rows": [
          [
            1,
            101,
            85,
            "2026-01-01"
          ],
          [
            2,
            101,
            95,
            "2026-01-02"
          ],
          [
            3,
            102,
            70,
            "2026-01-01"
          ]
        ]
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
          90
        ]
      ]
    },
    "hints": [
      "💡 Use GROUP BY user_id HAVING AVG(score) >= 80."
    ],
    "solutionSql": "SELECT user_id, AVG(score) AS avg_score FROM UserLogs_38 GROUP BY user_id HAVING AVG(score) >= 80 ORDER BY avg_score DESC;",
    "starterSql": "-- Problem #3038: LeetCode #2038 Real SQL Interview Challenge\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
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
        "rows": [
          [
            1,
            101,
            85,
            "2026-01-01"
          ],
          [
            2,
            101,
            95,
            "2026-01-02"
          ],
          [
            3,
            102,
            70,
            "2026-01-01"
          ]
        ]
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
          90
        ]
      ]
    },
    "hints": [
      "💡 Use GROUP BY user_id HAVING AVG(score) >= 80."
    ],
    "solutionSql": "SELECT user_id, AVG(score) AS avg_score FROM UserLogs_40 GROUP BY user_id HAVING AVG(score) >= 80 ORDER BY avg_score DESC;",
    "starterSql": "-- Problem #3040: LeetCode #2040 Real SQL Interview Challenge\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
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
        "rows": [
          [
            1,
            101,
            85,
            "2026-01-01"
          ],
          [
            2,
            101,
            95,
            "2026-01-02"
          ],
          [
            3,
            102,
            70,
            "2026-01-01"
          ]
        ]
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
          90
        ]
      ]
    },
    "hints": [
      "💡 Use GROUP BY user_id HAVING AVG(score) >= 80."
    ],
    "solutionSql": "SELECT user_id, AVG(score) AS avg_score FROM UserLogs_42 GROUP BY user_id HAVING AVG(score) >= 80 ORDER BY avg_score DESC;",
    "starterSql": "-- Problem #3042: LeetCode #2042 Real SQL Interview Challenge\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
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
        "rows": [
          [
            1,
            101,
            85,
            "2026-01-01"
          ],
          [
            2,
            101,
            95,
            "2026-01-02"
          ],
          [
            3,
            102,
            70,
            "2026-01-01"
          ]
        ]
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
          90
        ]
      ]
    },
    "hints": [
      "💡 Use GROUP BY user_id HAVING AVG(score) >= 80."
    ],
    "solutionSql": "SELECT user_id, AVG(score) AS avg_score FROM UserLogs_44 GROUP BY user_id HAVING AVG(score) >= 80 ORDER BY avg_score DESC;",
    "starterSql": "-- Problem #3044: LeetCode #2044 Real SQL Interview Challenge\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
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
        "rows": [
          [
            1,
            101,
            85,
            "2026-01-01"
          ],
          [
            2,
            101,
            95,
            "2026-01-02"
          ],
          [
            3,
            102,
            70,
            "2026-01-01"
          ]
        ]
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
          90
        ]
      ]
    },
    "hints": [
      "💡 Use GROUP BY user_id HAVING AVG(score) >= 80."
    ],
    "solutionSql": "SELECT user_id, AVG(score) AS avg_score FROM UserLogs_46 GROUP BY user_id HAVING AVG(score) >= 80 ORDER BY avg_score DESC;",
    "starterSql": "-- Problem #3046: LeetCode #2046 Real SQL Interview Challenge\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
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
        "rows": [
          [
            1,
            101,
            85,
            "2026-01-01"
          ],
          [
            2,
            101,
            95,
            "2026-01-02"
          ],
          [
            3,
            102,
            70,
            "2026-01-01"
          ]
        ]
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
          90
        ]
      ]
    },
    "hints": [
      "💡 Use GROUP BY user_id HAVING AVG(score) >= 80."
    ],
    "solutionSql": "SELECT user_id, AVG(score) AS avg_score FROM UserLogs_48 GROUP BY user_id HAVING AVG(score) >= 80 ORDER BY avg_score DESC;",
    "starterSql": "-- Problem #3048: LeetCode #2048 Real SQL Interview Challenge\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  }
];

export default shard;
