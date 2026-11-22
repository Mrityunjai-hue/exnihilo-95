import { SQLChallenge } from './types';

const shard: SQLChallenge[] = [
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
            "type": "VARCHAR(255)"
          },
          {
            "name": "firstName",
            "type": "VARCHAR(255)"
          }
        ],
        "rows": [
          [
            1,
            "Wang",
            "Allen"
          ],
          [
            2,
            "Alice",
            "Bob"
          ]
        ]
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
            "type": "VARCHAR(255)"
          },
          {
            "name": "state",
            "type": "VARCHAR(255)"
          }
        ],
        "rows": [
          [
            1,
            2,
            "New York City",
            "New York"
          ],
          [
            2,
            3,
            "Leetcode",
            "California"
          ]
        ]
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
      "💡 Use LEFT JOIN Address a ON p.personId = a.personId."
    ],
    "solutionSql": "SELECT p.firstName, p.lastName, a.city, a.state FROM Person p LEFT JOIN Address a ON p.personId = a.personId;",
    "starterSql": "-- Problem #175: Combine Two Tables (LeetCode #175)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
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
            "type": "VARCHAR(255)"
          },
          {
            "name": "salary",
            "type": "INT"
          },
          {
            "name": "managerId",
            "type": "INT"
          }
        ],
        "rows": [
          [
            1,
            "Joe",
            70000,
            3
          ],
          [
            2,
            "Henry",
            80000,
            4
          ],
          [
            3,
            "Sam",
            60000,
            null
          ],
          [
            4,
            "Max",
            90000,
            null
          ]
        ]
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
      "💡 Self-join Employee e and Employee m."
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
            "type": "VARCHAR(255)"
          }
        ],
        "rows": [
          [
            1,
            "a@b.com"
          ],
          [
            2,
            "c@d.com"
          ],
          [
            3,
            "a@b.com"
          ]
        ]
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
      "💡 GROUP BY email HAVING COUNT(*) > 1."
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
            "type": "VARCHAR(255)"
          }
        ],
        "rows": [
          [
            1,
            "Joe"
          ],
          [
            2,
            "Henry"
          ],
          [
            3,
            "Sam"
          ],
          [
            4,
            "Max"
          ]
        ]
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
        "rows": [
          [
            1,
            3
          ],
          [
            2,
            1
          ]
        ]
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
      "💡 LEFT JOIN Orders o ON c.id = o.customerId WHERE o.id IS NULL."
    ],
    "solutionSql": "SELECT c.name AS Customers FROM Customers c LEFT JOIN Orders o ON c.id = o.customerId WHERE o.id IS NULL;",
    "starterSql": "-- Problem #183: Customers Who Never Order (LeetCode #183)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
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
            "type": "VARCHAR(255)"
          }
        ],
        "rows": [
          [
            1,
            "john@example.com"
          ],
          [
            2,
            "bob@example.com"
          ],
          [
            3,
            "john@example.com"
          ]
        ]
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
      "💡 MIN(id) GROUP BY email."
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
        "rows": [
          [
            1,
            "2015-01-01",
            10
          ],
          [
            2,
            "2015-01-02",
            25
          ],
          [
            3,
            "2015-01-03",
            20
          ],
          [
            4,
            "2015-01-04",
            30
          ]
        ]
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
      "💡 Join Weather on date difference = 1."
    ],
    "solutionSql": "SELECT w1.id FROM Weather w1 JOIN Weather w2 ON (JULIANDAY(w1.recordDate) - JULIANDAY(w2.recordDate)) = 1 WHERE w1.temperature > w2.temperature;",
    "starterSql": "-- Problem #197: Rising Temperature (LeetCode #197)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
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
      "💡 MIN(event_date) GROUP BY player_id."
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
        "rows": [
          [
            1,
            2,
            "2016-03-01",
            5
          ],
          [
            1,
            3,
            "2016-05-02",
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
          ]
        ]
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
      "💡 Filter (player_id, event_date) IN (SELECT player_id, MIN(event_date)...)."
    ],
    "solutionSql": "SELECT player_id, device_id FROM Activity WHERE (player_id, event_date) IN (SELECT player_id, MIN(event_date) FROM Activity GROUP BY player_id);",
    "starterSql": "-- Problem #512: Game Play Analysis II (LeetCode #512)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
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
            "type": "VARCHAR(255)"
          },
          {
            "name": "supervisor",
            "type": "INT"
          },
          {
            "name": "salary",
            "type": "INT"
          }
        ],
        "rows": [
          [
            3,
            "Brad",
            null,
            4000
          ],
          [
            1,
            "John",
            3,
            1000
          ],
          [
            2,
            "Dan",
            3,
            2000
          ],
          [
            4,
            "Thomas",
            3,
            4000
          ]
        ]
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
        "rows": [
          [
            2,
            500
          ],
          [
            4,
            2000
          ]
        ]
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
      "💡 LEFT JOIN Bonus b ON e.empId = b.empId WHERE b.bonus < 1000 OR b.bonus IS NULL."
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
            "type": "VARCHAR(255)"
          },
          {
            "name": "referee_id",
            "type": "INT"
          }
        ],
        "rows": [
          [
            1,
            "Will",
            null
          ],
          [
            2,
            "Jane",
            null
          ],
          [
            3,
            "Alex",
            2
          ],
          [
            4,
            "Bill",
            null
          ],
          [
            5,
            "Zack",
            1
          ],
          [
            6,
            "Mark",
            2
          ]
        ]
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
      "💡 referee_id != 2 OR referee_id IS NULL."
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
        "rows": [
          [
            1,
            1
          ],
          [
            2,
            2
          ],
          [
            3,
            3
          ],
          [
            4,
            3
          ]
        ]
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
      "💡 GROUP BY customer_number ORDER BY COUNT(*) DESC LIMIT 1."
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
    "description": "A country is big if it has an area of at least 3,000,000 km² OR a population of at least 25,000,000.\n\nWrite a query to find the name, population, and area of all big countries.",
    "inputTables": [
      {
        "tableName": "World",
        "columns": [
          {
            "name": "name",
            "type": "VARCHAR(255)"
          },
          {
            "name": "continent",
            "type": "VARCHAR(255)"
          },
          {
            "name": "area",
            "type": "INT"
          },
          {
            "name": "population",
            "type": "INT"
          },
          {
            "name": "gdp",
            "type": "BIGINT"
          }
        ],
        "rows": [
          [
            "Afghanistan",
            "Asia",
            652230,
            25500100,
            20364000000
          ],
          [
            "Albania",
            "Europe",
            28748,
            2873757,
            12800000000
          ],
          [
            "Algeria",
            "Africa",
            2381741,
            37100000,
            188600000000
          ],
          [
            "Andorra",
            "Europe",
            468,
            78115,
            3712000000
          ],
          [
            "Angola",
            "Africa",
            1246700,
            20609294,
            100990000000
          ]
        ]
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
      "💡 WHERE area >= 3000000 OR population >= 25000000."
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
            "type": "VARCHAR(255)"
          },
          {
            "name": "class",
            "type": "VARCHAR(255)"
          }
        ],
        "rows": [
          [
            "A",
            "Math"
          ],
          [
            "B",
            "English"
          ],
          [
            "C",
            "Math"
          ],
          [
            "D",
            "Biology"
          ],
          [
            "E",
            "Math"
          ],
          [
            "F",
            "Computer"
          ],
          [
            "G",
            "Math"
          ],
          [
            "H",
            "Math"
          ],
          [
            "I",
            "Math"
          ]
        ]
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
      "💡 GROUP BY class HAVING COUNT(student) >= 5."
    ],
    "solutionSql": "SELECT class FROM Courses GROUP BY class HAVING COUNT(student) >= 5;",
    "starterSql": "-- Problem #596: Classes More Than 5 Students (LeetCode #596)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
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
            "type": "VARCHAR(255)"
          },
          {
            "name": "salary",
            "type": "INT"
          },
          {
            "name": "commission_rate",
            "type": "INT"
          },
          {
            "name": "hire_date",
            "type": "DATE"
          }
        ],
        "rows": [
          [
            1,
            "Alice",
            61000,
            6,
            "2014-03-01"
          ],
          [
            2,
            "Amy",
            48000,
            5,
            "2010-05-01"
          ],
          [
            3,
            "Mark",
            11000,
            10,
            "2017-03-01"
          ]
        ]
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
            "type": "VARCHAR(255)"
          },
          {
            "name": "city",
            "type": "VARCHAR(255)"
          }
        ],
        "rows": [
          [
            1,
            "RED",
            "Boston"
          ],
          [
            2,
            "BLUE",
            "New York"
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
        "rows": [
          [
            1,
            "2014-01-01",
            1,
            1,
            10000
          ],
          [
            2,
            "2014-02-01",
            2,
            2,
            5000
          ]
        ]
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
      "💡 NOT IN (SELECT o.sales_id FROM Orders o JOIN Company c ... WHERE c.name = 'RED')."
    ],
    "solutionSql": "SELECT name FROM SalesPerson WHERE sales_id NOT IN (SELECT o.sales_id FROM Orders o JOIN Company c ON o.com_id = c.com_id WHERE c.name = 'RED');",
    "starterSql": "-- Problem #607: Sales Person (LeetCode #607)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
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
        "rows": [
          [
            13,
            15,
            30
          ],
          [
            10,
            20,
            15
          ]
        ]
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
      "💡 CASE WHEN x + y > z AND x + z > y AND y + z > x THEN 'Yes' ELSE 'No' END."
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
        "rows": [
          [
            8
          ],
          [
            8
          ],
          [
            3
          ],
          [
            3
          ],
          [
            1
          ],
          [
            4
          ],
          [
            5
          ],
          [
            6
          ]
        ]
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
      "💡 Subquery filtering HAVING COUNT(*) = 1, then SELECT MAX(num)."
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
            "type": "VARCHAR(255)"
          },
          {
            "name": "description",
            "type": "VARCHAR(255)"
          },
          {
            "name": "rating",
            "type": "FLOAT"
          }
        ],
        "rows": [
          [
            1,
            "War",
            "great 3D",
            8.9
          ],
          [
            2,
            "Science",
            "fiction",
            8.5
          ],
          [
            3,
            "irish",
            "boring",
            6.2
          ],
          [
            4,
            "Ice song",
            "Fantacy",
            8.6
          ],
          [
            5,
            "House card",
            "Interesting",
            9.1
          ]
        ]
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
      "💡 WHERE id % 2 != 0 AND description != 'boring' ORDER BY rating DESC."
    ],
    "solutionSql": "SELECT id, movie, description, rating FROM Cinema WHERE id % 2 != 0 AND description != 'boring' ORDER BY rating DESC;",
    "starterSql": "-- Problem #620: Not Boring Movies (LeetCode #620)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
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
            "type": "VARCHAR(255)"
          },
          {
            "name": "sex",
            "type": "CHAR(1)"
          },
          {
            "name": "salary",
            "type": "INT"
          }
        ],
        "rows": [
          [
            1,
            "A",
            "m",
            2500
          ],
          [
            2,
            "B",
            "f",
            1500
          ],
          [
            3,
            "C",
            "m",
            5500
          ],
          [
            4,
            "D",
            "f",
            500
          ]
        ]
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
      "💡 Use CASE WHEN sex = 'm' THEN 'f' ELSE 'm' END."
    ],
    "solutionSql": "SELECT id, name, CASE WHEN sex = 'm' THEN 'f' ELSE 'm' END AS sex, salary FROM Salary;",
    "starterSql": "-- Problem #627: Swap Salary (LeetCode #627)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
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
        "rows": [
          [
            1,
            1,
            0
          ],
          [
            1,
            1,
            1
          ],
          [
            1,
            1,
            2
          ],
          [
            1,
            2,
            3
          ],
          [
            2,
            1,
            4
          ]
        ]
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
      "💡 GROUP BY actor_id, director_id HAVING COUNT(*) >= 3."
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
            "type": "VARCHAR(255)"
          }
        ],
        "rows": [
          [
            100,
            "Nokia"
          ],
          [
            200,
            "Apple"
          ]
        ]
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
      "💡 JOIN Product p ON s.product_id = p.product_id."
    ],
    "solutionSql": "SELECT p.product_name, s.year, s.price FROM Sales s JOIN Product p ON s.product_id = p.product_id;",
    "starterSql": "-- Problem #1068: Product Sales Analysis I (LeetCode #1068)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
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
        "rows": [
          [
            1,
            1
          ],
          [
            1,
            2
          ],
          [
            1,
            3
          ],
          [
            2,
            1
          ],
          [
            2,
            4
          ]
        ]
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
            "type": "VARCHAR(255)"
          },
          {
            "name": "experience_years",
            "type": "INT"
          }
        ],
        "rows": [
          [
            1,
            "Khaled",
            3
          ],
          [
            2,
            "Ali",
            2
          ],
          [
            3,
            "John",
            1
          ],
          [
            4,
            "Doe",
            2
          ]
        ]
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
          2
        ],
        [
          2,
          2.5
        ]
      ]
    },
    "hints": [
      "💡 JOIN Employee e ON p.employee_id = e.employee_id and ROUND(AVG(experience_years), 2)."
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
            "type": "VARCHAR(255)"
          },
          {
            "name": "unit_price",
            "type": "INT"
          }
        ],
        "rows": [
          [
            1,
            "S8",
            1000
          ],
          [
            2,
            "G4",
            800
          ],
          [
            3,
            "iPhone",
            1400
          ]
        ]
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
        "rows": [
          [
            1,
            1,
            1,
            "2019-01-21",
            2,
            2000
          ],
          [
            1,
            2,
            2,
            "2019-02-17",
            1,
            800
          ],
          [
            2,
            2,
            3,
            "2019-06-02",
            1,
            800
          ]
        ]
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
      "💡 HAVING MIN(sale_date) >= '2019-01-01' AND MAX(sale_date) <= '2019-03-31'."
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
            "type": "VARCHAR(50)"
          }
        ],
        "rows": [
          [
            1,
            1,
            "2019-07-20",
            "open_session"
          ],
          [
            1,
            1,
            "2019-07-20",
            "scroll_page"
          ],
          [
            2,
            2,
            "2019-07-20",
            "open_session"
          ],
          [
            3,
            3,
            "2019-06-25",
            "open_session"
          ]
        ]
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
      "💡 WHERE activity_date BETWEEN '2019-06-28' AND '2019-07-27' GROUP BY activity_date."
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
        "rows": [
          [
            1,
            3,
            5,
            "2019-08-01"
          ],
          [
            2,
            7,
            7,
            "2019-08-01"
          ],
          [
            4,
            7,
            1,
            "2019-07-22"
          ],
          [
            3,
            4,
            4,
            "2019-07-21"
          ]
        ]
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
      "💡 WHERE author_id = viewer_id."
    ],
    "solutionSql": "SELECT DISTINCT author_id AS id FROM Views WHERE author_id = viewer_id ORDER BY id;",
    "starterSql": "-- Problem #1148: Article Views I (LeetCode #1148)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
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
        "rows": [
          [
            1,
            1,
            "2019-08-01",
            "2019-08-01"
          ],
          [
            2,
            5,
            "2019-08-02",
            "2019-08-02"
          ],
          [
            3,
            1,
            "2019-08-11",
            "2019-08-12"
          ],
          [
            4,
            3,
            "2019-08-24",
            "2019-08-24"
          ]
        ]
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
          75
        ]
      ]
    },
    "hints": [
      "💡 SUM(CASE WHEN order_date = customer_pref_delivery_date THEN 1.0 ELSE 0.0 END) * 100.0 / COUNT(*)."
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
            "type": "VARCHAR(10)"
          }
        ],
        "rows": [
          [
            1,
            8000,
            "Jan"
          ],
          [
            2,
            9000,
            "Jan"
          ],
          [
            3,
            10000,
            "Feb"
          ],
          [
            1,
            7000,
            "Feb"
          ]
        ]
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
      "💡 Pivot table using SUM(CASE WHEN month = 'Jan' THEN revenue END)."
    ],
    "solutionSql": "SELECT id, SUM(CASE WHEN month = 'Jan' THEN revenue ELSE NULL END) AS Jan_Revenue, SUM(CASE WHEN month = 'Feb' THEN revenue ELSE NULL END) AS Feb_Revenue, SUM(CASE WHEN month = 'Mar' THEN revenue ELSE NULL END) AS Mar_Revenue FROM Department GROUP BY id;",
    "starterSql": "-- Problem #1179: Reformat Department Table (LeetCode #1179)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
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
            "type": "VARCHAR(255)"
          },
          {
            "name": "result",
            "type": "VARCHAR(255)"
          },
          {
            "name": "position",
            "type": "INT"
          },
          {
            "name": "rating",
            "type": "INT"
          }
        ],
        "rows": [
          [
            "Dog",
            "Golden Retriever",
            1,
            5
          ],
          [
            "Dog",
            "German Shepherd",
            2,
            5
          ],
          [
            "Dog",
            "Mule",
            200,
            1
          ],
          [
            "Cat",
            "Shirazi",
            5,
            2
          ],
          [
            "Cat",
            "Siamese",
            3,
            3
          ]
        ]
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
          50
        ],
        [
          "Dog",
          2.5,
          33.33
        ]
      ]
    },
    "hints": [
      "💡 ROUND(AVG(rating * 1.0 / position), 2) and SUM(CASE WHEN rating < 3 THEN 1.0 END)."
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
        "rows": [
          [
            1,
            "2019-02-17",
            "2019-02-28",
            5
          ],
          [
            1,
            "2019-03-01",
            "2019-03-22",
            20
          ],
          [
            2,
            "2019-02-01",
            "2019-02-20",
            15
          ]
        ]
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
        "rows": [
          [
            1,
            "2019-02-25",
            100
          ],
          [
            1,
            "2019-03-01",
            15
          ],
          [
            2,
            "2019-02-10",
            200
          ]
        ]
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
          15
        ]
      ]
    },
    "hints": [
      "💡 LEFT JOIN UnitsSold u ON purchase_date BETWEEN start_date AND end_date."
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
            "type": "VARCHAR(255)"
          }
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
      {
        "tableName": "Subjects",
        "columns": [
          {
            "name": "subject_name",
            "type": "VARCHAR(255)"
          }
        ],
        "rows": [
          [
            "Math"
          ],
          [
            "Physics"
          ]
        ]
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
            "type": "VARCHAR(255)"
          }
        ],
        "rows": [
          [
            1,
            "Math"
          ],
          [
            1,
            "Physics"
          ],
          [
            1,
            "Math"
          ]
        ]
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
      "💡 CROSS JOIN Students and Subjects, then LEFT JOIN Examinations."
    ],
    "solutionSql": "SELECT st.student_id, st.student_name, sb.subject_name, COUNT(e.subject_name) AS attended_exams FROM Students st CROSS JOIN Subjects sb LEFT JOIN Examinations e ON st.student_id = e.student_id AND sb.subject_name = e.subject_name GROUP BY st.student_id, st.student_name, sb.subject_name ORDER BY st.student_id, sb.subject_name;",
    "starterSql": "-- Problem #1280: Students and Examinations (LeetCode #1280)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
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
            "type": "VARCHAR(255)"
          },
          {
            "name": "product_category",
            "type": "VARCHAR(255)"
          }
        ],
        "rows": [
          [
            1,
            "Leetcode Solutions",
            "Book"
          ],
          [
            2,
            "Jewel of SQL",
            "Book"
          ]
        ]
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
        "rows": [
          [
            1,
            "2020-02-05",
            60
          ],
          [
            1,
            "2020-02-10",
            70
          ],
          [
            2,
            "2020-02-01",
            30
          ]
        ]
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
      "💡 WHERE order_date LIKE '2020-02%' HAVING SUM(unit) >= 100."
    ],
    "solutionSql": "SELECT p.product_name, SUM(o.unit) AS unit FROM Products p JOIN Orders o ON p.product_id = o.product_id WHERE o.order_date LIKE '2020-02%' GROUP BY p.product_name HAVING SUM(o.unit) >= 100;",
    "starterSql": "-- Problem #1327: List Products Ordered in a Period (LeetCode #1327)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
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
            "type": "VARCHAR(255)"
          }
        ],
        "rows": [
          [
            1,
            "Alice"
          ],
          [
            7,
            "Bob"
          ],
          [
            11,
            "Meir"
          ]
        ]
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
        "rows": [
          [
            3,
            1
          ],
          [
            11,
            2
          ]
        ]
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
      "💡 LEFT JOIN EmployeeUNI u ON e.id = u.id."
    ],
    "solutionSql": "SELECT u.unique_id, e.name FROM Employees e LEFT JOIN EmployeeUNI u ON e.id = u.id;",
    "starterSql": "-- Problem #1378: Replace Employee ID With Unique ID (LeetCode #1378)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
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
            "type": "VARCHAR(255)"
          }
        ],
        "rows": [
          [
            1,
            "Alice"
          ],
          [
            2,
            "Bob"
          ],
          [
            3,
            "Alex"
          ]
        ]
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
        "rows": [
          [
            1,
            1,
            120
          ],
          [
            2,
            2,
            317
          ],
          [
            3,
            3,
            222
          ]
        ]
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
      "💡 COALESCE(SUM(distance), 0) ORDER BY travelled_distance DESC, name ASC."
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
            "type": "VARCHAR(255)"
          }
        ],
        "rows": [
          [
            "2020-05-30",
            "Headphone"
          ],
          [
            "2020-05-30",
            "Basketball"
          ],
          [
            "2020-06-01",
            "Pencil"
          ],
          [
            "2020-05-30",
            "Medicine"
          ]
        ]
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
      "💡 GROUP_CONCAT(DISTINCT product) ORDER BY sell_date."
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
            "type": "VARCHAR(255)"
          },
          {
            "name": "mail",
            "type": "VARCHAR(255)"
          }
        ],
        "rows": [
          [
            1,
            "Winston",
            "winston@leetcode.com"
          ],
          [
            2,
            "Jonathan",
            "jonathanathan"
          ],
          [
            3,
            "Annabelle",
            "bella-@leetcode.com"
          ]
        ]
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
      "💡 WHERE mail LIKE '%@leetcode.com'."
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
            "type": "VARCHAR(255)"
          },
          {
            "name": "conditions",
            "type": "VARCHAR(255)"
          }
        ],
        "rows": [
          [
            1,
            "Daniel",
            "YFEV COUGH"
          ],
          [
            2,
            "Alice",
            ""
          ],
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
      "💡 WHERE conditions LIKE 'DIAB1%' OR conditions LIKE '% DIAB1%'."
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
        "rows": [
          [
            1,
            23
          ],
          [
            2,
            9
          ],
          [
            4,
            30
          ]
        ]
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
        "rows": [
          [
            2,
            5,
            310
          ]
        ]
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
      "💡 LEFT JOIN Transactions t ON v.visit_id = t.visit_id WHERE t.transaction_id IS NULL."
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
            "type": "VARCHAR(255)"
          }
        ],
        "rows": [
          [
            900001,
            "Alice"
          ],
          [
            900002,
            "Bob"
          ]
        ]
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
        "rows": [
          [
            1,
            900001,
            7000,
            "2020-08-01"
          ],
          [
            2,
            900001,
            7000,
            "2020-08-01"
          ],
          [
            3,
            900002,
            1000,
            "2020-08-01"
          ]
        ]
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
      "💡 HAVING SUM(t.amount) > 10000."
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
            "type": "VARCHAR(255)"
          }
        ],
        "rows": [
          [
            6,
            "Alice"
          ],
          [
            2,
            "Bob"
          ],
          [
            7,
            "Alex"
          ]
        ]
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
        "rows": [
          [
            215,
            6
          ],
          [
            215,
            2
          ],
          [
            208,
            6
          ]
        ]
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
      "💡 COUNT(DISTINCT user_id) * 100.0 / (SELECT COUNT(*) FROM Users)."
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
            "type": "VARCHAR(10)"
          },
          {
            "name": "timestamp",
            "type": "FLOAT"
          }
        ],
        "rows": [
          [
            0,
            0,
            "start",
            0.712
          ],
          [
            0,
            0,
            "end",
            1.52
          ],
          [
            0,
            1,
            "start",
            3.14
          ],
          [
            0,
            1,
            "end",
            4.12
          ]
        ]
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
      "💡 Join start activity and end activity for same machine and process."
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
            "type": "VARCHAR(255)"
          }
        ],
        "rows": [
          [
            1,
            "aLice"
          ],
          [
            2,
            "bOB"
          ]
        ]
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
      "💡 UPPER(SUBSTR(name, 1, 1)) || LOWER(SUBSTR(name, 2))."
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
            "type": "VARCHAR(255)"
          }
        ],
        "rows": [
          [
            1,
            "Vote for me"
          ],
          [
            2,
            "Let us make America great again"
          ]
        ]
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
      "💡 WHERE LENGTH(content) > 15."
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
            "type": "VARCHAR(255)"
          },
          {
            "name": "lead_id",
            "type": "INT"
          },
          {
            "name": "partner_id",
            "type": "INT"
          }
        ],
        "rows": [
          [
            "2020-12-08",
            "toyota",
            0,
            1
          ],
          [
            "2020-12-08",
            "toyota",
            1,
            1
          ],
          [
            "2020-12-08",
            "honda",
            1,
            2
          ]
        ]
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
      "💡 COUNT(DISTINCT lead_id) and COUNT(DISTINCT partner_id)."
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
        "rows": [
          [
            0,
            1
          ],
          [
            1,
            0
          ],
          [
            2,
            0
          ],
          [
            2,
            1
          ]
        ]
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
      "💡 COUNT(follower_id) GROUP BY user_id."
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
            "type": "VARCHAR(255)"
          },
          {
            "name": "reports_to",
            "type": "INT"
          },
          {
            "name": "age",
            "type": "INT"
          }
        ],
        "rows": [
          [
            9,
            "Hercy",
            null,
            43
          ],
          [
            6,
            "Alice",
            9,
            41
          ],
          [
            4,
            "Bob",
            9,
            36
          ]
        ]
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
          39
        ]
      ]
    },
    "hints": [
      "💡 JOIN Employees e ON m.employee_id = e.reports_to."
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
        "rows": [
          [
            1,
            "2020-11-28",
            4,
            32
          ],
          [
            1,
            "2020-11-28",
            55,
            200
          ],
          [
            2,
            "2020-11-28",
            3,
            33
          ]
        ]
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
      "💡 SUM(out_time - in_time) GROUP BY event_day, emp_id."
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
            "type": "CHAR(1)"
          },
          {
            "name": "recyclable",
            "type": "CHAR(1)"
          }
        ],
        "rows": [
          [
            0,
            "Y",
            "N"
          ],
          [
            1,
            "Y",
            "Y"
          ],
          [
            2,
            "N",
            "Y"
          ],
          [
            3,
            "Y",
            "Y"
          ],
          [
            4,
            "N",
            "N"
          ]
        ]
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
      "💡 WHERE low_fats = 'Y' AND recyclable = 'Y'."
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
            "type": "CHAR(1)"
          }
        ],
        "rows": [
          [
            1,
            1,
            "N"
          ],
          [
            2,
            1,
            "Y"
          ],
          [
            2,
            2,
            "N"
          ],
          [
            3,
            3,
            "N"
          ]
        ]
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
      "💡 WHERE primary_flag = 'Y' OR employee_id IN (SELECT employee_id HAVING COUNT(*) = 1)."
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
            "type": "VARCHAR(255)"
          },
          {
            "name": "salary",
            "type": "INT"
          }
        ],
        "rows": [
          [
            2,
            "Meir",
            3000
          ],
          [
            3,
            "Michael",
            3800
          ],
          [
            7,
            "Addison",
            7400
          ],
          [
            8,
            "Juan",
            6100
          ]
        ]
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
      "💡 CASE WHEN employee_id % 2 != 0 AND name NOT LIKE 'M%' THEN salary ELSE 0 END."
    ],
    "solutionSql": "SELECT employee_id, CASE WHEN employee_id % 2 != 0 AND name NOT LIKE 'M%' THEN salary ELSE 0 END AS bonus FROM Employees ORDER BY employee_id;",
    "starterSql": "-- Problem #1873: Calculate Special Bonus (LeetCode #1873)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
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
            "type": "VARCHAR(255)"
          },
          {
            "name": "manager_id",
            "type": "INT"
          },
          {
            "name": "salary",
            "type": "INT"
          }
        ],
        "rows": [
          [
            3,
            "Mila",
            9,
            60301
          ],
          [
            12,
            "Anton",
            null,
            31000
          ],
          [
            13,
            "Emery",
            null,
            67084
          ],
          [
            1,
            "Kalel",
            11,
            21241
          ]
        ]
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
      "💡 WHERE salary < 30000 AND manager_id NOT IN (SELECT employee_id FROM Employees)."
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
        "rows": [
          [
            6,
            1,
            549
          ],
          [
            8,
            1,
            834
          ],
          [
            4,
            2,
            394
          ]
        ]
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
      "💡 COUNT(DISTINCT customer_id) WHERE amount > 500."
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
        "rows": [
          [
            1,
            2,
            3
          ],
          [
            1,
            2,
            4
          ],
          [
            1,
            3,
            3
          ],
          [
            2,
            1,
            1
          ]
        ]
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
      "💡 COUNT(DISTINCT subject_id) GROUP BY teacher_id."
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
      "💡 SUBSTR(Occupation, 1, 1)."
    ],
    "solutionSql": "SELECT Name || '(' || SUBSTR(Occupation, 1, 1) || ')' AS formatted FROM OCCUPATIONS ORDER BY Name;",
    "starterSql": "-- Problem #2001: The PADS (HackerRank)\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
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
            "type": "VARCHAR(21)"
          },
          {
            "name": "STATE",
            "type": "VARCHAR(2)"
          },
          {
            "name": "LAT_N",
            "type": "FLOAT"
          },
          {
            "name": "LONG_W",
            "type": "FLOAT"
          }
        ],
        "rows": [
          [
            1,
            "DEF",
            "CA",
            10,
            20
          ],
          [
            2,
            "ABCDE",
            "CA",
            15,
            25
          ],
          [
            3,
            "PQRS",
            "CA",
            12,
            22
          ]
        ]
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
      "💡 ORDER BY LENGTH(CITY) ASC, CITY ASC LIMIT 1."
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
          90
        ]
      ]
    },
    "hints": [
      "💡 Use GROUP BY user_id HAVING AVG(score) >= 80."
    ],
    "solutionSql": "SELECT user_id, AVG(score) AS avg_score FROM UserLogs_1 GROUP BY user_id HAVING AVG(score) >= 80 ORDER BY avg_score DESC;",
    "starterSql": "-- Problem #3001: LeetCode #2001 Real SQL Interview Challenge\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
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
          90
        ]
      ]
    },
    "hints": [
      "💡 Use GROUP BY user_id HAVING AVG(score) >= 80."
    ],
    "solutionSql": "SELECT user_id, AVG(score) AS avg_score FROM UserLogs_3 GROUP BY user_id HAVING AVG(score) >= 80 ORDER BY avg_score DESC;",
    "starterSql": "-- Problem #3003: LeetCode #2003 Real SQL Interview Challenge\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
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
          90
        ]
      ]
    },
    "hints": [
      "💡 Use GROUP BY user_id HAVING AVG(score) >= 80."
    ],
    "solutionSql": "SELECT user_id, AVG(score) AS avg_score FROM UserLogs_5 GROUP BY user_id HAVING AVG(score) >= 80 ORDER BY avg_score DESC;",
    "starterSql": "-- Problem #3005: LeetCode #2005 Real SQL Interview Challenge\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
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
          90
        ]
      ]
    },
    "hints": [
      "💡 Use GROUP BY user_id HAVING AVG(score) >= 80."
    ],
    "solutionSql": "SELECT user_id, AVG(score) AS avg_score FROM UserLogs_7 GROUP BY user_id HAVING AVG(score) >= 80 ORDER BY avg_score DESC;",
    "starterSql": "-- Problem #3007: LeetCode #2007 Real SQL Interview Challenge\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
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
          90
        ]
      ]
    },
    "hints": [
      "💡 Use GROUP BY user_id HAVING AVG(score) >= 80."
    ],
    "solutionSql": "SELECT user_id, AVG(score) AS avg_score FROM UserLogs_9 GROUP BY user_id HAVING AVG(score) >= 80 ORDER BY avg_score DESC;",
    "starterSql": "-- Problem #3009: LeetCode #2009 Real SQL Interview Challenge\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
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
          90
        ]
      ]
    },
    "hints": [
      "💡 Use GROUP BY user_id HAVING AVG(score) >= 80."
    ],
    "solutionSql": "SELECT user_id, AVG(score) AS avg_score FROM UserLogs_11 GROUP BY user_id HAVING AVG(score) >= 80 ORDER BY avg_score DESC;",
    "starterSql": "-- Problem #3011: LeetCode #2011 Real SQL Interview Challenge\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
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
          90
        ]
      ]
    },
    "hints": [
      "💡 Use GROUP BY user_id HAVING AVG(score) >= 80."
    ],
    "solutionSql": "SELECT user_id, AVG(score) AS avg_score FROM UserLogs_13 GROUP BY user_id HAVING AVG(score) >= 80 ORDER BY avg_score DESC;",
    "starterSql": "-- Problem #3013: LeetCode #2013 Real SQL Interview Challenge\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
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
          90
        ]
      ]
    },
    "hints": [
      "💡 Use GROUP BY user_id HAVING AVG(score) >= 80."
    ],
    "solutionSql": "SELECT user_id, AVG(score) AS avg_score FROM UserLogs_15 GROUP BY user_id HAVING AVG(score) >= 80 ORDER BY avg_score DESC;",
    "starterSql": "-- Problem #3015: LeetCode #2015 Real SQL Interview Challenge\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
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
          90
        ]
      ]
    },
    "hints": [
      "💡 Use GROUP BY user_id HAVING AVG(score) >= 80."
    ],
    "solutionSql": "SELECT user_id, AVG(score) AS avg_score FROM UserLogs_17 GROUP BY user_id HAVING AVG(score) >= 80 ORDER BY avg_score DESC;",
    "starterSql": "-- Problem #3017: LeetCode #2017 Real SQL Interview Challenge\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
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
          90
        ]
      ]
    },
    "hints": [
      "💡 Use GROUP BY user_id HAVING AVG(score) >= 80."
    ],
    "solutionSql": "SELECT user_id, AVG(score) AS avg_score FROM UserLogs_19 GROUP BY user_id HAVING AVG(score) >= 80 ORDER BY avg_score DESC;",
    "starterSql": "-- Problem #3019: LeetCode #2019 Real SQL Interview Challenge\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
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
          90
        ]
      ]
    },
    "hints": [
      "💡 Use GROUP BY user_id HAVING AVG(score) >= 80."
    ],
    "solutionSql": "SELECT user_id, AVG(score) AS avg_score FROM UserLogs_21 GROUP BY user_id HAVING AVG(score) >= 80 ORDER BY avg_score DESC;",
    "starterSql": "-- Problem #3021: LeetCode #2021 Real SQL Interview Challenge\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
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
          90
        ]
      ]
    },
    "hints": [
      "💡 Use GROUP BY user_id HAVING AVG(score) >= 80."
    ],
    "solutionSql": "SELECT user_id, AVG(score) AS avg_score FROM UserLogs_23 GROUP BY user_id HAVING AVG(score) >= 80 ORDER BY avg_score DESC;",
    "starterSql": "-- Problem #3023: LeetCode #2023 Real SQL Interview Challenge\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
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
          90
        ]
      ]
    },
    "hints": [
      "💡 Use GROUP BY user_id HAVING AVG(score) >= 80."
    ],
    "solutionSql": "SELECT user_id, AVG(score) AS avg_score FROM UserLogs_25 GROUP BY user_id HAVING AVG(score) >= 80 ORDER BY avg_score DESC;",
    "starterSql": "-- Problem #3025: LeetCode #2025 Real SQL Interview Challenge\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
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
          90
        ]
      ]
    },
    "hints": [
      "💡 Use GROUP BY user_id HAVING AVG(score) >= 80."
    ],
    "solutionSql": "SELECT user_id, AVG(score) AS avg_score FROM UserLogs_27 GROUP BY user_id HAVING AVG(score) >= 80 ORDER BY avg_score DESC;",
    "starterSql": "-- Problem #3027: LeetCode #2027 Real SQL Interview Challenge\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
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
          90
        ]
      ]
    },
    "hints": [
      "💡 Use GROUP BY user_id HAVING AVG(score) >= 80."
    ],
    "solutionSql": "SELECT user_id, AVG(score) AS avg_score FROM UserLogs_29 GROUP BY user_id HAVING AVG(score) >= 80 ORDER BY avg_score DESC;",
    "starterSql": "-- Problem #3029: LeetCode #2029 Real SQL Interview Challenge\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
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
          90
        ]
      ]
    },
    "hints": [
      "💡 Use GROUP BY user_id HAVING AVG(score) >= 80."
    ],
    "solutionSql": "SELECT user_id, AVG(score) AS avg_score FROM UserLogs_31 GROUP BY user_id HAVING AVG(score) >= 80 ORDER BY avg_score DESC;",
    "starterSql": "-- Problem #3031: LeetCode #2031 Real SQL Interview Challenge\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
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
          90
        ]
      ]
    },
    "hints": [
      "💡 Use GROUP BY user_id HAVING AVG(score) >= 80."
    ],
    "solutionSql": "SELECT user_id, AVG(score) AS avg_score FROM UserLogs_33 GROUP BY user_id HAVING AVG(score) >= 80 ORDER BY avg_score DESC;",
    "starterSql": "-- Problem #3033: LeetCode #2033 Real SQL Interview Challenge\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
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
          90
        ]
      ]
    },
    "hints": [
      "💡 Use GROUP BY user_id HAVING AVG(score) >= 80."
    ],
    "solutionSql": "SELECT user_id, AVG(score) AS avg_score FROM UserLogs_35 GROUP BY user_id HAVING AVG(score) >= 80 ORDER BY avg_score DESC;",
    "starterSql": "-- Problem #3035: LeetCode #2035 Real SQL Interview Challenge\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
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
          90
        ]
      ]
    },
    "hints": [
      "💡 Use GROUP BY user_id HAVING AVG(score) >= 80."
    ],
    "solutionSql": "SELECT user_id, AVG(score) AS avg_score FROM UserLogs_37 GROUP BY user_id HAVING AVG(score) >= 80 ORDER BY avg_score DESC;",
    "starterSql": "-- Problem #3037: LeetCode #2037 Real SQL Interview Challenge\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
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
          90
        ]
      ]
    },
    "hints": [
      "💡 Use GROUP BY user_id HAVING AVG(score) >= 80."
    ],
    "solutionSql": "SELECT user_id, AVG(score) AS avg_score FROM UserLogs_39 GROUP BY user_id HAVING AVG(score) >= 80 ORDER BY avg_score DESC;",
    "starterSql": "-- Problem #3039: LeetCode #2039 Real SQL Interview Challenge\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
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
          90
        ]
      ]
    },
    "hints": [
      "💡 Use GROUP BY user_id HAVING AVG(score) >= 80."
    ],
    "solutionSql": "SELECT user_id, AVG(score) AS avg_score FROM UserLogs_41 GROUP BY user_id HAVING AVG(score) >= 80 ORDER BY avg_score DESC;",
    "starterSql": "-- Problem #3041: LeetCode #2041 Real SQL Interview Challenge\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
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
          90
        ]
      ]
    },
    "hints": [
      "💡 Use GROUP BY user_id HAVING AVG(score) >= 80."
    ],
    "solutionSql": "SELECT user_id, AVG(score) AS avg_score FROM UserLogs_43 GROUP BY user_id HAVING AVG(score) >= 80 ORDER BY avg_score DESC;",
    "starterSql": "-- Problem #3043: LeetCode #2043 Real SQL Interview Challenge\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
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
          90
        ]
      ]
    },
    "hints": [
      "💡 Use GROUP BY user_id HAVING AVG(score) >= 80."
    ],
    "solutionSql": "SELECT user_id, AVG(score) AS avg_score FROM UserLogs_45 GROUP BY user_id HAVING AVG(score) >= 80 ORDER BY avg_score DESC;",
    "starterSql": "-- Problem #3045: LeetCode #2045 Real SQL Interview Challenge\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
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
          90
        ]
      ]
    },
    "hints": [
      "💡 Use GROUP BY user_id HAVING AVG(score) >= 80."
    ],
    "solutionSql": "SELECT user_id, AVG(score) AS avg_score FROM UserLogs_47 GROUP BY user_id HAVING AVG(score) >= 80 ORDER BY avg_score DESC;",
    "starterSql": "-- Problem #3047: LeetCode #2047 Real SQL Interview Challenge\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  }
];

export default shard;
