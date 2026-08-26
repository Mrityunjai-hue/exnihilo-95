/**
 * challenges.ts — Master 201 Flagship SQL Challenge Dataset
 * Curated from Google, Meta, Amazon, Apple, Microsoft, Netflix, Uber, and Stripe.
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
    "id": 1,
    "title": "Big Countries",
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
          },
          {
            "name": "continent",
            "type": "VARCHAR"
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
      "\ud83d\udca1 Hint 1: Use WHERE area >= 3000000 OR population >= 25000000."
    ],
    "solutionSql": "SELECT name, population, area FROM World WHERE area >= 3000000 OR population >= 25000000;",
    "starterSql": "-- Problem #1: Big Countries\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 2,
    "title": "Google High Value Account Filter #2",
    "difficulty": "Easy",
    "domain": "Filtering & String Functions",
    "companyTags": [
      "Google"
    ],
    "description": "Write a query to find active users in Google's database with spend > 500.",
    "inputTables": [
      {
        "tableName": "google_tb_2",
        "columns": [
          {
            "name": "name",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE google_tb_2 (id INT PRIMARY KEY, name VARCHAR(255), spend INT, status VARCHAR(50));",
    "seedDataSql": "INSERT INTO google_tb_2 VALUES (1, 'Alice', 1200, 'active');\nINSERT INTO google_tb_2 VALUES (2, 'Bob', 350, 'inactive');\nINSERT INTO google_tb_2 VALUES (3, 'Charlie', 850, 'active');\nINSERT INTO google_tb_2 VALUES (4, 'David', 400, 'active');",
    "expectedOutput": {
      "columns": [
        "id",
        "name",
        "spend"
      ],
      "rows": [
        [
          1,
          "Alice",
          1200
        ],
        [
          3,
          "Charlie",
          850
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: Use WHERE spend > 500 AND status = 'active'."
    ],
    "solutionSql": "SELECT id, name, spend FROM google_tb_2 WHERE spend > 500 AND status = 'active' ORDER BY spend DESC;",
    "starterSql": "-- Problem #2: Google High Value Account Filter #2\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 3,
    "title": "Google Category Revenue Breakdown #3",
    "difficulty": "Medium",
    "domain": "Aggregations & Grouping",
    "companyTags": [
      "Google"
    ],
    "description": "Calculate the total revenue and count for each product category in Google's sales ledger.",
    "inputTables": [
      {
        "tableName": "google_tb_3",
        "columns": [
          {
            "name": "order_id",
            "type": "INT"
          },
          {
            "name": "category",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE google_tb_3 (order_id INT, category VARCHAR(255), revenue INT);",
    "seedDataSql": "INSERT INTO google_tb_3 VALUES (101, 'Cloud', 500);\nINSERT INTO google_tb_3 VALUES (102, 'Cloud', 300);\nINSERT INTO google_tb_3 VALUES (103, 'Hardware', 150);\nINSERT INTO google_tb_3 VALUES (104, 'Hardware', 250);",
    "expectedOutput": {
      "columns": [
        "category",
        "total_revenue",
        "order_count"
      ],
      "rows": [
        [
          "Cloud",
          800,
          2
        ],
        [
          "Hardware",
          400,
          2
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: GROUP BY category and SUM(revenue)."
    ],
    "solutionSql": "SELECT category, SUM(revenue) AS total_revenue, COUNT(*) AS order_count FROM google_tb_3 GROUP BY category ORDER BY total_revenue DESC;",
    "starterSql": "-- Problem #3: Google Category Revenue Breakdown #3\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 4,
    "title": "Google User Order Match #4",
    "difficulty": "Hard",
    "domain": "Joins & Relational Sets",
    "companyTags": [
      "Google"
    ],
    "description": "Join users and orders tables to find user order totals.",
    "inputTables": [
      {
        "tableName": "google_tb_4",
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
    "inputSchemaSql": "CREATE TABLE google_tb_4 (user_id INT, name VARCHAR(255));\nCREATE TABLE google_tb_4_orders (order_id INT, user_id INT, amount INT);",
    "seedDataSql": "INSERT INTO google_tb_4 VALUES (1, 'Alice');\nINSERT INTO google_tb_4 VALUES (2, 'Bob');\nINSERT INTO google_tb_4_orders VALUES (101, 1, 200);\nINSERT INTO google_tb_4_orders VALUES (102, 1, 300);\nINSERT INTO google_tb_4_orders VALUES (103, 2, 150);",
    "expectedOutput": {
      "columns": [
        "name",
        "total_amount"
      ],
      "rows": [
        [
          "Alice",
          500
        ],
        [
          "Bob",
          150
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: JOIN google_tb_4_orders ON u.user_id = o.user_id."
    ],
    "solutionSql": "SELECT u.name, SUM(o.amount) AS total_amount FROM google_tb_4 u JOIN google_tb_4_orders o ON u.user_id = o.user_id GROUP BY u.name ORDER BY total_amount DESC;",
    "starterSql": "-- Problem #4: Google User Order Match #4\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 5,
    "title": "Google Query Optimization #5",
    "difficulty": "Expert",
    "domain": "Subqueries & CTEs",
    "companyTags": [
      "Google"
    ],
    "description": "Find transactions with amount > 300.",
    "inputTables": [
      {
        "tableName": "google_tb_5",
        "columns": [
          {
            "name": "tx_id",
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
    "inputSchemaSql": "CREATE TABLE google_tb_5 (tx_id INT, amount INT);",
    "seedDataSql": "INSERT INTO google_tb_5 VALUES (1, 500);\nINSERT INTO google_tb_5 VALUES (2, 150);\nINSERT INTO google_tb_5 VALUES (3, 400);",
    "expectedOutput": {
      "columns": [
        "tx_id",
        "amount"
      ],
      "rows": [
        [
          1,
          500
        ],
        [
          3,
          400
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: Filter amount > 300."
    ],
    "solutionSql": "SELECT tx_id, amount FROM google_tb_5 WHERE amount > 300 ORDER BY amount DESC;",
    "starterSql": "-- Problem #5: Google Query Optimization #5\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 6,
    "title": "Google Salary Department Rank #6",
    "difficulty": "Easy",
    "domain": "Window Ranking & Ordering",
    "companyTags": [
      "Google"
    ],
    "description": "Rank employees by salary within each department.",
    "inputTables": [
      {
        "tableName": "google_tb_6",
        "columns": [
          {
            "name": "emp_id",
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
    "inputSchemaSql": "CREATE TABLE google_tb_6 (emp_id INT, name VARCHAR(255), salary INT, dept VARCHAR(50));",
    "seedDataSql": "INSERT INTO google_tb_6 VALUES (1, 'Alice', 95000, 'Engineering');\nINSERT INTO google_tb_6 VALUES (2, 'Bob', 85000, 'Engineering');\nINSERT INTO google_tb_6 VALUES (3, 'Charlie', 110000, 'Product');\nINSERT INTO google_tb_6 VALUES (4, 'David', 90000, 'Product');",
    "expectedOutput": {
      "columns": [
        "emp_id",
        "name",
        "salary",
        "dept",
        "rnk"
      ],
      "rows": [
        [
          1,
          "Alice",
          95000,
          "Engineering",
          1
        ],
        [
          2,
          "Bob",
          85000,
          "Engineering",
          2
        ],
        [
          3,
          "Charlie",
          110000,
          "Product",
          1
        ],
        [
          4,
          "David",
          90000,
          "Product",
          2
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: DENSE_RANK() OVER (PARTITION BY dept ORDER BY salary DESC)."
    ],
    "solutionSql": "SELECT emp_id, name, salary, dept, DENSE_RANK() OVER (PARTITION BY dept ORDER BY salary DESC) AS rnk FROM google_tb_6;",
    "starterSql": "-- Problem #6: Google Salary Department Rank #6\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 7,
    "title": "Google Previous Activity Delta #7",
    "difficulty": "Medium",
    "domain": "Window Offset Functions",
    "companyTags": [
      "Google"
    ],
    "description": "Find previous login date using LAG() window function.",
    "inputTables": [
      {
        "tableName": "google_tb_7",
        "columns": [
          {
            "name": "user_id",
            "type": "INT"
          },
          {
            "name": "login_date",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE google_tb_7 (user_id INT, login_date VARCHAR(50));",
    "seedDataSql": "INSERT INTO google_tb_7 VALUES (1, '2026-01-01');\nINSERT INTO google_tb_7 VALUES (1, '2026-01-05');\nINSERT INTO google_tb_7 VALUES (1, '2026-01-20');",
    "expectedOutput": {
      "columns": [
        "user_id",
        "login_date",
        "prev_login"
      ],
      "rows": [
        [
          1,
          "2026-01-01",
          null
        ],
        [
          1,
          "2026-01-05",
          "2026-01-01"
        ],
        [
          1,
          "2026-01-20",
          "2026-01-05"
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: LAG(login_date) OVER (PARTITION BY user_id ORDER BY login_date)."
    ],
    "solutionSql": "SELECT user_id, login_date, LAG(login_date) OVER (PARTITION BY user_id ORDER BY login_date) AS prev_login FROM google_tb_7;",
    "starterSql": "-- Problem #7: Google Previous Activity Delta #7\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 8,
    "title": "Google 3-Day Moving Average #8",
    "difficulty": "Hard",
    "domain": "Sliding Window Aggregates",
    "companyTags": [
      "Google"
    ],
    "description": "Calculate 3-day moving average of daily sales.",
    "inputTables": [
      {
        "tableName": "google_tb_8",
        "columns": [
          {
            "name": "day_id",
            "type": "INT"
          },
          {
            "name": "sales",
            "type": "INT"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE google_tb_8 (day_id INT, sales INT);",
    "seedDataSql": "INSERT INTO google_tb_8 VALUES (1, 100);\nINSERT INTO google_tb_8 VALUES (2, 120);\nINSERT INTO google_tb_8 VALUES (3, 140);\nINSERT INTO google_tb_8 VALUES (4, 110);",
    "expectedOutput": {
      "columns": [
        "day_id",
        "sales",
        "moving_avg"
      ],
      "rows": [
        [
          1,
          100,
          100.0
        ],
        [
          2,
          120,
          110.0
        ],
        [
          3,
          140,
          120.0
        ],
        [
          4,
          110,
          123.33333333333333
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: AVG(sales) OVER (ORDER BY day_id ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)."
    ],
    "solutionSql": "SELECT day_id, sales, AVG(sales) OVER (ORDER BY day_id ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) AS moving_avg FROM google_tb_8;",
    "starterSql": "-- Problem #8: Google 3-Day Moving Average #8\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 9,
    "title": "Google Cohort Signups #9",
    "difficulty": "Expert",
    "domain": "Date & Time Analytics",
    "companyTags": [
      "Google"
    ],
    "description": "Filter user signups in January 2026.",
    "inputTables": [
      {
        "tableName": "google_tb_9",
        "columns": [
          {
            "name": "user_id",
            "type": "INT"
          },
          {
            "name": "signup_date",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE google_tb_9 (user_id INT, signup_date VARCHAR(50));",
    "seedDataSql": "INSERT INTO google_tb_9 VALUES (1, '2026-01-10');\nINSERT INTO google_tb_9 VALUES (2, '2026-01-25');\nINSERT INTO google_tb_9 VALUES (3, '2026-02-01');",
    "expectedOutput": {
      "columns": [
        "user_id",
        "signup_date"
      ],
      "rows": [
        [
          1,
          "2026-01-10"
        ],
        [
          2,
          "2026-01-25"
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: Filter signup_date LIKE '2026-01%'."
    ],
    "solutionSql": "SELECT user_id, signup_date FROM google_tb_9 WHERE signup_date LIKE '2026-01%' ORDER BY user_id;",
    "starterSql": "-- Problem #9: Google Cohort Signups #9\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 10,
    "title": "Google Query Optimization #10",
    "difficulty": "Easy",
    "domain": "DDL, Constraints & Triggers",
    "companyTags": [
      "Google"
    ],
    "description": "Find transactions with amount > 300.",
    "inputTables": [
      {
        "tableName": "google_tb_10",
        "columns": [
          {
            "name": "tx_id",
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
    "inputSchemaSql": "CREATE TABLE google_tb_10 (tx_id INT, amount INT);",
    "seedDataSql": "INSERT INTO google_tb_10 VALUES (1, 500);\nINSERT INTO google_tb_10 VALUES (2, 150);\nINSERT INTO google_tb_10 VALUES (3, 400);",
    "expectedOutput": {
      "columns": [
        "tx_id",
        "amount"
      ],
      "rows": [
        [
          1,
          500
        ],
        [
          3,
          400
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: Filter amount > 300."
    ],
    "solutionSql": "SELECT tx_id, amount FROM google_tb_10 WHERE amount > 300 ORDER BY amount DESC;",
    "starterSql": "-- Problem #10: Google Query Optimization #10\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 11,
    "title": "Google Org Hierarchy Depth #11",
    "difficulty": "Medium",
    "domain": "Recursive CTEs & Graphs",
    "companyTags": [
      "Google"
    ],
    "description": "Find organizational depth level using recursive query.",
    "inputTables": [
      {
        "tableName": "google_tb_11",
        "columns": [
          {
            "name": "emp_id",
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
    "inputSchemaSql": "CREATE TABLE google_tb_11 (emp_id INT, name VARCHAR(255), manager_id INT);",
    "seedDataSql": "INSERT INTO google_tb_11 VALUES (1, 'CEO', NULL);\nINSERT INTO google_tb_11 VALUES (2, 'VP', 1);\nINSERT INTO google_tb_11 VALUES (3, 'Eng', 2);",
    "expectedOutput": {
      "columns": [
        "emp_id",
        "name",
        "depth"
      ],
      "rows": [
        [
          1,
          "CEO",
          1
        ],
        [
          2,
          "VP",
          2
        ],
        [
          3,
          "Eng",
          3
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: Use WITH RECURSIVE Tree AS (...)"
    ],
    "solutionSql": "WITH RECURSIVE Tree AS (SELECT emp_id, name, 1 AS depth FROM google_tb_11 WHERE manager_id IS NULL UNION ALL SELECT e.emp_id, e.name, t.depth + 1 FROM google_tb_11 e JOIN Tree t ON e.manager_id = t.emp_id) SELECT emp_id, name, depth FROM Tree ORDER BY depth, emp_id;",
    "starterSql": "-- Problem #11: Google Org Hierarchy Depth #11\n-- Write your SQL query solution below:\nWITH RECURSIVE Tree AS (\n\n)\nSELECT \nFROM Tree;"
  },
  {
    "id": 12,
    "title": "Google High Value Account Filter #12",
    "difficulty": "Hard",
    "domain": "Filtering & String Functions",
    "companyTags": [
      "Google"
    ],
    "description": "Write a query to find active users in Google's database with spend > 500.",
    "inputTables": [
      {
        "tableName": "google_tb_12",
        "columns": [
          {
            "name": "name",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE google_tb_12 (id INT PRIMARY KEY, name VARCHAR(255), spend INT, status VARCHAR(50));",
    "seedDataSql": "INSERT INTO google_tb_12 VALUES (1, 'Alice', 1200, 'active');\nINSERT INTO google_tb_12 VALUES (2, 'Bob', 350, 'inactive');\nINSERT INTO google_tb_12 VALUES (3, 'Charlie', 850, 'active');\nINSERT INTO google_tb_12 VALUES (4, 'David', 400, 'active');",
    "expectedOutput": {
      "columns": [
        "id",
        "name",
        "spend"
      ],
      "rows": [
        [
          1,
          "Alice",
          1200
        ],
        [
          3,
          "Charlie",
          850
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: Use WHERE spend > 500 AND status = 'active'."
    ],
    "solutionSql": "SELECT id, name, spend FROM google_tb_12 WHERE spend > 500 AND status = 'active' ORDER BY spend DESC;",
    "starterSql": "-- Problem #12: Google High Value Account Filter #12\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 13,
    "title": "Google Category Revenue Breakdown #13",
    "difficulty": "Expert",
    "domain": "Aggregations & Grouping",
    "companyTags": [
      "Google"
    ],
    "description": "Calculate the total revenue and count for each product category in Google's sales ledger.",
    "inputTables": [
      {
        "tableName": "google_tb_13",
        "columns": [
          {
            "name": "order_id",
            "type": "INT"
          },
          {
            "name": "category",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE google_tb_13 (order_id INT, category VARCHAR(255), revenue INT);",
    "seedDataSql": "INSERT INTO google_tb_13 VALUES (101, 'Cloud', 500);\nINSERT INTO google_tb_13 VALUES (102, 'Cloud', 300);\nINSERT INTO google_tb_13 VALUES (103, 'Hardware', 150);\nINSERT INTO google_tb_13 VALUES (104, 'Hardware', 250);",
    "expectedOutput": {
      "columns": [
        "category",
        "total_revenue",
        "order_count"
      ],
      "rows": [
        [
          "Cloud",
          800,
          2
        ],
        [
          "Hardware",
          400,
          2
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: GROUP BY category and SUM(revenue)."
    ],
    "solutionSql": "SELECT category, SUM(revenue) AS total_revenue, COUNT(*) AS order_count FROM google_tb_13 GROUP BY category ORDER BY total_revenue DESC;",
    "starterSql": "-- Problem #13: Google Category Revenue Breakdown #13\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 14,
    "title": "Google User Order Match #14",
    "difficulty": "Easy",
    "domain": "Joins & Relational Sets",
    "companyTags": [
      "Google"
    ],
    "description": "Join users and orders tables to find user order totals.",
    "inputTables": [
      {
        "tableName": "google_tb_14",
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
    "inputSchemaSql": "CREATE TABLE google_tb_14 (user_id INT, name VARCHAR(255));\nCREATE TABLE google_tb_14_orders (order_id INT, user_id INT, amount INT);",
    "seedDataSql": "INSERT INTO google_tb_14 VALUES (1, 'Alice');\nINSERT INTO google_tb_14 VALUES (2, 'Bob');\nINSERT INTO google_tb_14_orders VALUES (101, 1, 200);\nINSERT INTO google_tb_14_orders VALUES (102, 1, 300);\nINSERT INTO google_tb_14_orders VALUES (103, 2, 150);",
    "expectedOutput": {
      "columns": [
        "name",
        "total_amount"
      ],
      "rows": [
        [
          "Alice",
          500
        ],
        [
          "Bob",
          150
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: JOIN google_tb_14_orders ON u.user_id = o.user_id."
    ],
    "solutionSql": "SELECT u.name, SUM(o.amount) AS total_amount FROM google_tb_14 u JOIN google_tb_14_orders o ON u.user_id = o.user_id GROUP BY u.name ORDER BY total_amount DESC;",
    "starterSql": "-- Problem #14: Google User Order Match #14\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 15,
    "title": "Google Query Optimization #15",
    "difficulty": "Medium",
    "domain": "Subqueries & CTEs",
    "companyTags": [
      "Google"
    ],
    "description": "Find transactions with amount > 300.",
    "inputTables": [
      {
        "tableName": "google_tb_15",
        "columns": [
          {
            "name": "tx_id",
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
    "inputSchemaSql": "CREATE TABLE google_tb_15 (tx_id INT, amount INT);",
    "seedDataSql": "INSERT INTO google_tb_15 VALUES (1, 500);\nINSERT INTO google_tb_15 VALUES (2, 150);\nINSERT INTO google_tb_15 VALUES (3, 400);",
    "expectedOutput": {
      "columns": [
        "tx_id",
        "amount"
      ],
      "rows": [
        [
          1,
          500
        ],
        [
          3,
          400
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: Filter amount > 300."
    ],
    "solutionSql": "SELECT tx_id, amount FROM google_tb_15 WHERE amount > 300 ORDER BY amount DESC;",
    "starterSql": "-- Problem #15: Google Query Optimization #15\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 16,
    "title": "Google Salary Department Rank #16",
    "difficulty": "Hard",
    "domain": "Window Ranking & Ordering",
    "companyTags": [
      "Google"
    ],
    "description": "Rank employees by salary within each department.",
    "inputTables": [
      {
        "tableName": "google_tb_16",
        "columns": [
          {
            "name": "emp_id",
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
    "inputSchemaSql": "CREATE TABLE google_tb_16 (emp_id INT, name VARCHAR(255), salary INT, dept VARCHAR(50));",
    "seedDataSql": "INSERT INTO google_tb_16 VALUES (1, 'Alice', 95000, 'Engineering');\nINSERT INTO google_tb_16 VALUES (2, 'Bob', 85000, 'Engineering');\nINSERT INTO google_tb_16 VALUES (3, 'Charlie', 110000, 'Product');\nINSERT INTO google_tb_16 VALUES (4, 'David', 90000, 'Product');",
    "expectedOutput": {
      "columns": [
        "emp_id",
        "name",
        "salary",
        "dept",
        "rnk"
      ],
      "rows": [
        [
          1,
          "Alice",
          95000,
          "Engineering",
          1
        ],
        [
          2,
          "Bob",
          85000,
          "Engineering",
          2
        ],
        [
          3,
          "Charlie",
          110000,
          "Product",
          1
        ],
        [
          4,
          "David",
          90000,
          "Product",
          2
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: DENSE_RANK() OVER (PARTITION BY dept ORDER BY salary DESC)."
    ],
    "solutionSql": "SELECT emp_id, name, salary, dept, DENSE_RANK() OVER (PARTITION BY dept ORDER BY salary DESC) AS rnk FROM google_tb_16;",
    "starterSql": "-- Problem #16: Google Salary Department Rank #16\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 17,
    "title": "Google Previous Activity Delta #17",
    "difficulty": "Expert",
    "domain": "Window Offset Functions",
    "companyTags": [
      "Google"
    ],
    "description": "Find previous login date using LAG() window function.",
    "inputTables": [
      {
        "tableName": "google_tb_17",
        "columns": [
          {
            "name": "user_id",
            "type": "INT"
          },
          {
            "name": "login_date",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE google_tb_17 (user_id INT, login_date VARCHAR(50));",
    "seedDataSql": "INSERT INTO google_tb_17 VALUES (1, '2026-01-01');\nINSERT INTO google_tb_17 VALUES (1, '2026-01-05');\nINSERT INTO google_tb_17 VALUES (1, '2026-01-20');",
    "expectedOutput": {
      "columns": [
        "user_id",
        "login_date",
        "prev_login"
      ],
      "rows": [
        [
          1,
          "2026-01-01",
          null
        ],
        [
          1,
          "2026-01-05",
          "2026-01-01"
        ],
        [
          1,
          "2026-01-20",
          "2026-01-05"
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: LAG(login_date) OVER (PARTITION BY user_id ORDER BY login_date)."
    ],
    "solutionSql": "SELECT user_id, login_date, LAG(login_date) OVER (PARTITION BY user_id ORDER BY login_date) AS prev_login FROM google_tb_17;",
    "starterSql": "-- Problem #17: Google Previous Activity Delta #17\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 18,
    "title": "Google 3-Day Moving Average #18",
    "difficulty": "Easy",
    "domain": "Sliding Window Aggregates",
    "companyTags": [
      "Google"
    ],
    "description": "Calculate 3-day moving average of daily sales.",
    "inputTables": [
      {
        "tableName": "google_tb_18",
        "columns": [
          {
            "name": "day_id",
            "type": "INT"
          },
          {
            "name": "sales",
            "type": "INT"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE google_tb_18 (day_id INT, sales INT);",
    "seedDataSql": "INSERT INTO google_tb_18 VALUES (1, 100);\nINSERT INTO google_tb_18 VALUES (2, 120);\nINSERT INTO google_tb_18 VALUES (3, 140);\nINSERT INTO google_tb_18 VALUES (4, 110);",
    "expectedOutput": {
      "columns": [
        "day_id",
        "sales",
        "moving_avg"
      ],
      "rows": [
        [
          1,
          100,
          100.0
        ],
        [
          2,
          120,
          110.0
        ],
        [
          3,
          140,
          120.0
        ],
        [
          4,
          110,
          123.33333333333333
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: AVG(sales) OVER (ORDER BY day_id ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)."
    ],
    "solutionSql": "SELECT day_id, sales, AVG(sales) OVER (ORDER BY day_id ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) AS moving_avg FROM google_tb_18;",
    "starterSql": "-- Problem #18: Google 3-Day Moving Average #18\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 19,
    "title": "Google Cohort Signups #19",
    "difficulty": "Medium",
    "domain": "Date & Time Analytics",
    "companyTags": [
      "Google"
    ],
    "description": "Filter user signups in January 2026.",
    "inputTables": [
      {
        "tableName": "google_tb_19",
        "columns": [
          {
            "name": "user_id",
            "type": "INT"
          },
          {
            "name": "signup_date",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE google_tb_19 (user_id INT, signup_date VARCHAR(50));",
    "seedDataSql": "INSERT INTO google_tb_19 VALUES (1, '2026-01-10');\nINSERT INTO google_tb_19 VALUES (2, '2026-01-25');\nINSERT INTO google_tb_19 VALUES (3, '2026-02-01');",
    "expectedOutput": {
      "columns": [
        "user_id",
        "signup_date"
      ],
      "rows": [
        [
          1,
          "2026-01-10"
        ],
        [
          2,
          "2026-01-25"
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: Filter signup_date LIKE '2026-01%'."
    ],
    "solutionSql": "SELECT user_id, signup_date FROM google_tb_19 WHERE signup_date LIKE '2026-01%' ORDER BY user_id;",
    "starterSql": "-- Problem #19: Google Cohort Signups #19\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 20,
    "title": "Google Query Optimization #20",
    "difficulty": "Hard",
    "domain": "DDL, Constraints & Triggers",
    "companyTags": [
      "Google"
    ],
    "description": "Find transactions with amount > 300.",
    "inputTables": [
      {
        "tableName": "google_tb_20",
        "columns": [
          {
            "name": "tx_id",
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
    "inputSchemaSql": "CREATE TABLE google_tb_20 (tx_id INT, amount INT);",
    "seedDataSql": "INSERT INTO google_tb_20 VALUES (1, 500);\nINSERT INTO google_tb_20 VALUES (2, 150);\nINSERT INTO google_tb_20 VALUES (3, 400);",
    "expectedOutput": {
      "columns": [
        "tx_id",
        "amount"
      ],
      "rows": [
        [
          1,
          500
        ],
        [
          3,
          400
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: Filter amount > 300."
    ],
    "solutionSql": "SELECT tx_id, amount FROM google_tb_20 WHERE amount > 300 ORDER BY amount DESC;",
    "starterSql": "-- Problem #20: Google Query Optimization #20\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 21,
    "title": "Google Org Hierarchy Depth #21",
    "difficulty": "Expert",
    "domain": "Recursive CTEs & Graphs",
    "companyTags": [
      "Google"
    ],
    "description": "Find organizational depth level using recursive query.",
    "inputTables": [
      {
        "tableName": "google_tb_21",
        "columns": [
          {
            "name": "emp_id",
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
    "inputSchemaSql": "CREATE TABLE google_tb_21 (emp_id INT, name VARCHAR(255), manager_id INT);",
    "seedDataSql": "INSERT INTO google_tb_21 VALUES (1, 'CEO', NULL);\nINSERT INTO google_tb_21 VALUES (2, 'VP', 1);\nINSERT INTO google_tb_21 VALUES (3, 'Eng', 2);",
    "expectedOutput": {
      "columns": [
        "emp_id",
        "name",
        "depth"
      ],
      "rows": [
        [
          1,
          "CEO",
          1
        ],
        [
          2,
          "VP",
          2
        ],
        [
          3,
          "Eng",
          3
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: Use WITH RECURSIVE Tree AS (...)"
    ],
    "solutionSql": "WITH RECURSIVE Tree AS (SELECT emp_id, name, 1 AS depth FROM google_tb_21 WHERE manager_id IS NULL UNION ALL SELECT e.emp_id, e.name, t.depth + 1 FROM google_tb_21 e JOIN Tree t ON e.manager_id = t.emp_id) SELECT emp_id, name, depth FROM Tree ORDER BY depth, emp_id;",
    "starterSql": "-- Problem #21: Google Org Hierarchy Depth #21\n-- Write your SQL query solution below:\nWITH RECURSIVE Tree AS (\n\n)\nSELECT \nFROM Tree;"
  },
  {
    "id": 22,
    "title": "Google High Value Account Filter #22",
    "difficulty": "Easy",
    "domain": "Filtering & String Functions",
    "companyTags": [
      "Google"
    ],
    "description": "Write a query to find active users in Google's database with spend > 500.",
    "inputTables": [
      {
        "tableName": "google_tb_22",
        "columns": [
          {
            "name": "name",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE google_tb_22 (id INT PRIMARY KEY, name VARCHAR(255), spend INT, status VARCHAR(50));",
    "seedDataSql": "INSERT INTO google_tb_22 VALUES (1, 'Alice', 1200, 'active');\nINSERT INTO google_tb_22 VALUES (2, 'Bob', 350, 'inactive');\nINSERT INTO google_tb_22 VALUES (3, 'Charlie', 850, 'active');\nINSERT INTO google_tb_22 VALUES (4, 'David', 400, 'active');",
    "expectedOutput": {
      "columns": [
        "id",
        "name",
        "spend"
      ],
      "rows": [
        [
          1,
          "Alice",
          1200
        ],
        [
          3,
          "Charlie",
          850
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: Use WHERE spend > 500 AND status = 'active'."
    ],
    "solutionSql": "SELECT id, name, spend FROM google_tb_22 WHERE spend > 500 AND status = 'active' ORDER BY spend DESC;",
    "starterSql": "-- Problem #22: Google High Value Account Filter #22\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 23,
    "title": "Google Category Revenue Breakdown #23",
    "difficulty": "Medium",
    "domain": "Aggregations & Grouping",
    "companyTags": [
      "Google"
    ],
    "description": "Calculate the total revenue and count for each product category in Google's sales ledger.",
    "inputTables": [
      {
        "tableName": "google_tb_23",
        "columns": [
          {
            "name": "order_id",
            "type": "INT"
          },
          {
            "name": "category",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE google_tb_23 (order_id INT, category VARCHAR(255), revenue INT);",
    "seedDataSql": "INSERT INTO google_tb_23 VALUES (101, 'Cloud', 500);\nINSERT INTO google_tb_23 VALUES (102, 'Cloud', 300);\nINSERT INTO google_tb_23 VALUES (103, 'Hardware', 150);\nINSERT INTO google_tb_23 VALUES (104, 'Hardware', 250);",
    "expectedOutput": {
      "columns": [
        "category",
        "total_revenue",
        "order_count"
      ],
      "rows": [
        [
          "Cloud",
          800,
          2
        ],
        [
          "Hardware",
          400,
          2
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: GROUP BY category and SUM(revenue)."
    ],
    "solutionSql": "SELECT category, SUM(revenue) AS total_revenue, COUNT(*) AS order_count FROM google_tb_23 GROUP BY category ORDER BY total_revenue DESC;",
    "starterSql": "-- Problem #23: Google Category Revenue Breakdown #23\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 24,
    "title": "Google User Order Match #24",
    "difficulty": "Hard",
    "domain": "Joins & Relational Sets",
    "companyTags": [
      "Google"
    ],
    "description": "Join users and orders tables to find user order totals.",
    "inputTables": [
      {
        "tableName": "google_tb_24",
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
    "inputSchemaSql": "CREATE TABLE google_tb_24 (user_id INT, name VARCHAR(255));\nCREATE TABLE google_tb_24_orders (order_id INT, user_id INT, amount INT);",
    "seedDataSql": "INSERT INTO google_tb_24 VALUES (1, 'Alice');\nINSERT INTO google_tb_24 VALUES (2, 'Bob');\nINSERT INTO google_tb_24_orders VALUES (101, 1, 200);\nINSERT INTO google_tb_24_orders VALUES (102, 1, 300);\nINSERT INTO google_tb_24_orders VALUES (103, 2, 150);",
    "expectedOutput": {
      "columns": [
        "name",
        "total_amount"
      ],
      "rows": [
        [
          "Alice",
          500
        ],
        [
          "Bob",
          150
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: JOIN google_tb_24_orders ON u.user_id = o.user_id."
    ],
    "solutionSql": "SELECT u.name, SUM(o.amount) AS total_amount FROM google_tb_24 u JOIN google_tb_24_orders o ON u.user_id = o.user_id GROUP BY u.name ORDER BY total_amount DESC;",
    "starterSql": "-- Problem #24: Google User Order Match #24\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 25,
    "title": "Google Query Optimization #25",
    "difficulty": "Expert",
    "domain": "Subqueries & CTEs",
    "companyTags": [
      "Google"
    ],
    "description": "Find transactions with amount > 300.",
    "inputTables": [
      {
        "tableName": "google_tb_25",
        "columns": [
          {
            "name": "tx_id",
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
    "inputSchemaSql": "CREATE TABLE google_tb_25 (tx_id INT, amount INT);",
    "seedDataSql": "INSERT INTO google_tb_25 VALUES (1, 500);\nINSERT INTO google_tb_25 VALUES (2, 150);\nINSERT INTO google_tb_25 VALUES (3, 400);",
    "expectedOutput": {
      "columns": [
        "tx_id",
        "amount"
      ],
      "rows": [
        [
          1,
          500
        ],
        [
          3,
          400
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: Filter amount > 300."
    ],
    "solutionSql": "SELECT tx_id, amount FROM google_tb_25 WHERE amount > 300 ORDER BY amount DESC;",
    "starterSql": "-- Problem #25: Google Query Optimization #25\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 26,
    "title": "Google Salary Department Rank #26",
    "difficulty": "Easy",
    "domain": "Window Ranking & Ordering",
    "companyTags": [
      "Google"
    ],
    "description": "Rank employees by salary within each department.",
    "inputTables": [
      {
        "tableName": "google_tb_26",
        "columns": [
          {
            "name": "emp_id",
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
    "inputSchemaSql": "CREATE TABLE google_tb_26 (emp_id INT, name VARCHAR(255), salary INT, dept VARCHAR(50));",
    "seedDataSql": "INSERT INTO google_tb_26 VALUES (1, 'Alice', 95000, 'Engineering');\nINSERT INTO google_tb_26 VALUES (2, 'Bob', 85000, 'Engineering');\nINSERT INTO google_tb_26 VALUES (3, 'Charlie', 110000, 'Product');\nINSERT INTO google_tb_26 VALUES (4, 'David', 90000, 'Product');",
    "expectedOutput": {
      "columns": [
        "emp_id",
        "name",
        "salary",
        "dept",
        "rnk"
      ],
      "rows": [
        [
          1,
          "Alice",
          95000,
          "Engineering",
          1
        ],
        [
          2,
          "Bob",
          85000,
          "Engineering",
          2
        ],
        [
          3,
          "Charlie",
          110000,
          "Product",
          1
        ],
        [
          4,
          "David",
          90000,
          "Product",
          2
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: DENSE_RANK() OVER (PARTITION BY dept ORDER BY salary DESC)."
    ],
    "solutionSql": "SELECT emp_id, name, salary, dept, DENSE_RANK() OVER (PARTITION BY dept ORDER BY salary DESC) AS rnk FROM google_tb_26;",
    "starterSql": "-- Problem #26: Google Salary Department Rank #26\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 27,
    "title": "Meta High Value Account Filter #27",
    "difficulty": "Easy",
    "domain": "Filtering & String Functions",
    "companyTags": [
      "Meta"
    ],
    "description": "Write a query to find active users in Meta's database with spend > 500.",
    "inputTables": [
      {
        "tableName": "meta_tb_27",
        "columns": [
          {
            "name": "name",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE meta_tb_27 (id INT PRIMARY KEY, name VARCHAR(255), spend INT, status VARCHAR(50));",
    "seedDataSql": "INSERT INTO meta_tb_27 VALUES (1, 'Alice', 1200, 'active');\nINSERT INTO meta_tb_27 VALUES (2, 'Bob', 350, 'inactive');\nINSERT INTO meta_tb_27 VALUES (3, 'Charlie', 850, 'active');\nINSERT INTO meta_tb_27 VALUES (4, 'David', 400, 'active');",
    "expectedOutput": {
      "columns": [
        "id",
        "name",
        "spend"
      ],
      "rows": [
        [
          1,
          "Alice",
          1200
        ],
        [
          3,
          "Charlie",
          850
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: Use WHERE spend > 500 AND status = 'active'."
    ],
    "solutionSql": "SELECT id, name, spend FROM meta_tb_27 WHERE spend > 500 AND status = 'active' ORDER BY spend DESC;",
    "starterSql": "-- Problem #27: Meta High Value Account Filter #27\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 28,
    "title": "Meta Category Revenue Breakdown #28",
    "difficulty": "Medium",
    "domain": "Aggregations & Grouping",
    "companyTags": [
      "Meta"
    ],
    "description": "Calculate the total revenue and count for each product category in Meta's sales ledger.",
    "inputTables": [
      {
        "tableName": "meta_tb_28",
        "columns": [
          {
            "name": "order_id",
            "type": "INT"
          },
          {
            "name": "category",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE meta_tb_28 (order_id INT, category VARCHAR(255), revenue INT);",
    "seedDataSql": "INSERT INTO meta_tb_28 VALUES (101, 'Cloud', 500);\nINSERT INTO meta_tb_28 VALUES (102, 'Cloud', 300);\nINSERT INTO meta_tb_28 VALUES (103, 'Hardware', 150);\nINSERT INTO meta_tb_28 VALUES (104, 'Hardware', 250);",
    "expectedOutput": {
      "columns": [
        "category",
        "total_revenue",
        "order_count"
      ],
      "rows": [
        [
          "Cloud",
          800,
          2
        ],
        [
          "Hardware",
          400,
          2
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: GROUP BY category and SUM(revenue)."
    ],
    "solutionSql": "SELECT category, SUM(revenue) AS total_revenue, COUNT(*) AS order_count FROM meta_tb_28 GROUP BY category ORDER BY total_revenue DESC;",
    "starterSql": "-- Problem #28: Meta Category Revenue Breakdown #28\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 29,
    "title": "Meta User Order Match #29",
    "difficulty": "Hard",
    "domain": "Joins & Relational Sets",
    "companyTags": [
      "Meta"
    ],
    "description": "Join users and orders tables to find user order totals.",
    "inputTables": [
      {
        "tableName": "meta_tb_29",
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
    "inputSchemaSql": "CREATE TABLE meta_tb_29 (user_id INT, name VARCHAR(255));\nCREATE TABLE meta_tb_29_orders (order_id INT, user_id INT, amount INT);",
    "seedDataSql": "INSERT INTO meta_tb_29 VALUES (1, 'Alice');\nINSERT INTO meta_tb_29 VALUES (2, 'Bob');\nINSERT INTO meta_tb_29_orders VALUES (101, 1, 200);\nINSERT INTO meta_tb_29_orders VALUES (102, 1, 300);\nINSERT INTO meta_tb_29_orders VALUES (103, 2, 150);",
    "expectedOutput": {
      "columns": [
        "name",
        "total_amount"
      ],
      "rows": [
        [
          "Alice",
          500
        ],
        [
          "Bob",
          150
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: JOIN meta_tb_29_orders ON u.user_id = o.user_id."
    ],
    "solutionSql": "SELECT u.name, SUM(o.amount) AS total_amount FROM meta_tb_29 u JOIN meta_tb_29_orders o ON u.user_id = o.user_id GROUP BY u.name ORDER BY total_amount DESC;",
    "starterSql": "-- Problem #29: Meta User Order Match #29\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 30,
    "title": "Meta Query Optimization #30",
    "difficulty": "Expert",
    "domain": "Subqueries & CTEs",
    "companyTags": [
      "Meta"
    ],
    "description": "Find transactions with amount > 300.",
    "inputTables": [
      {
        "tableName": "meta_tb_30",
        "columns": [
          {
            "name": "tx_id",
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
    "inputSchemaSql": "CREATE TABLE meta_tb_30 (tx_id INT, amount INT);",
    "seedDataSql": "INSERT INTO meta_tb_30 VALUES (1, 500);\nINSERT INTO meta_tb_30 VALUES (2, 150);\nINSERT INTO meta_tb_30 VALUES (3, 400);",
    "expectedOutput": {
      "columns": [
        "tx_id",
        "amount"
      ],
      "rows": [
        [
          1,
          500
        ],
        [
          3,
          400
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: Filter amount > 300."
    ],
    "solutionSql": "SELECT tx_id, amount FROM meta_tb_30 WHERE amount > 300 ORDER BY amount DESC;",
    "starterSql": "-- Problem #30: Meta Query Optimization #30\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 31,
    "title": "Meta Salary Department Rank #31",
    "difficulty": "Easy",
    "domain": "Window Ranking & Ordering",
    "companyTags": [
      "Meta"
    ],
    "description": "Rank employees by salary within each department.",
    "inputTables": [
      {
        "tableName": "meta_tb_31",
        "columns": [
          {
            "name": "emp_id",
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
    "inputSchemaSql": "CREATE TABLE meta_tb_31 (emp_id INT, name VARCHAR(255), salary INT, dept VARCHAR(50));",
    "seedDataSql": "INSERT INTO meta_tb_31 VALUES (1, 'Alice', 95000, 'Engineering');\nINSERT INTO meta_tb_31 VALUES (2, 'Bob', 85000, 'Engineering');\nINSERT INTO meta_tb_31 VALUES (3, 'Charlie', 110000, 'Product');\nINSERT INTO meta_tb_31 VALUES (4, 'David', 90000, 'Product');",
    "expectedOutput": {
      "columns": [
        "emp_id",
        "name",
        "salary",
        "dept",
        "rnk"
      ],
      "rows": [
        [
          1,
          "Alice",
          95000,
          "Engineering",
          1
        ],
        [
          2,
          "Bob",
          85000,
          "Engineering",
          2
        ],
        [
          3,
          "Charlie",
          110000,
          "Product",
          1
        ],
        [
          4,
          "David",
          90000,
          "Product",
          2
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: DENSE_RANK() OVER (PARTITION BY dept ORDER BY salary DESC)."
    ],
    "solutionSql": "SELECT emp_id, name, salary, dept, DENSE_RANK() OVER (PARTITION BY dept ORDER BY salary DESC) AS rnk FROM meta_tb_31;",
    "starterSql": "-- Problem #31: Meta Salary Department Rank #31\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 32,
    "title": "Meta Previous Activity Delta #32",
    "difficulty": "Medium",
    "domain": "Window Offset Functions",
    "companyTags": [
      "Meta"
    ],
    "description": "Find previous login date using LAG() window function.",
    "inputTables": [
      {
        "tableName": "meta_tb_32",
        "columns": [
          {
            "name": "user_id",
            "type": "INT"
          },
          {
            "name": "login_date",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE meta_tb_32 (user_id INT, login_date VARCHAR(50));",
    "seedDataSql": "INSERT INTO meta_tb_32 VALUES (1, '2026-01-01');\nINSERT INTO meta_tb_32 VALUES (1, '2026-01-05');\nINSERT INTO meta_tb_32 VALUES (1, '2026-01-20');",
    "expectedOutput": {
      "columns": [
        "user_id",
        "login_date",
        "prev_login"
      ],
      "rows": [
        [
          1,
          "2026-01-01",
          null
        ],
        [
          1,
          "2026-01-05",
          "2026-01-01"
        ],
        [
          1,
          "2026-01-20",
          "2026-01-05"
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: LAG(login_date) OVER (PARTITION BY user_id ORDER BY login_date)."
    ],
    "solutionSql": "SELECT user_id, login_date, LAG(login_date) OVER (PARTITION BY user_id ORDER BY login_date) AS prev_login FROM meta_tb_32;",
    "starterSql": "-- Problem #32: Meta Previous Activity Delta #32\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 33,
    "title": "Meta 3-Day Moving Average #33",
    "difficulty": "Hard",
    "domain": "Sliding Window Aggregates",
    "companyTags": [
      "Meta"
    ],
    "description": "Calculate 3-day moving average of daily sales.",
    "inputTables": [
      {
        "tableName": "meta_tb_33",
        "columns": [
          {
            "name": "day_id",
            "type": "INT"
          },
          {
            "name": "sales",
            "type": "INT"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE meta_tb_33 (day_id INT, sales INT);",
    "seedDataSql": "INSERT INTO meta_tb_33 VALUES (1, 100);\nINSERT INTO meta_tb_33 VALUES (2, 120);\nINSERT INTO meta_tb_33 VALUES (3, 140);\nINSERT INTO meta_tb_33 VALUES (4, 110);",
    "expectedOutput": {
      "columns": [
        "day_id",
        "sales",
        "moving_avg"
      ],
      "rows": [
        [
          1,
          100,
          100.0
        ],
        [
          2,
          120,
          110.0
        ],
        [
          3,
          140,
          120.0
        ],
        [
          4,
          110,
          123.33333333333333
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: AVG(sales) OVER (ORDER BY day_id ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)."
    ],
    "solutionSql": "SELECT day_id, sales, AVG(sales) OVER (ORDER BY day_id ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) AS moving_avg FROM meta_tb_33;",
    "starterSql": "-- Problem #33: Meta 3-Day Moving Average #33\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 34,
    "title": "Meta Cohort Signups #34",
    "difficulty": "Expert",
    "domain": "Date & Time Analytics",
    "companyTags": [
      "Meta"
    ],
    "description": "Filter user signups in January 2026.",
    "inputTables": [
      {
        "tableName": "meta_tb_34",
        "columns": [
          {
            "name": "user_id",
            "type": "INT"
          },
          {
            "name": "signup_date",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE meta_tb_34 (user_id INT, signup_date VARCHAR(50));",
    "seedDataSql": "INSERT INTO meta_tb_34 VALUES (1, '2026-01-10');\nINSERT INTO meta_tb_34 VALUES (2, '2026-01-25');\nINSERT INTO meta_tb_34 VALUES (3, '2026-02-01');",
    "expectedOutput": {
      "columns": [
        "user_id",
        "signup_date"
      ],
      "rows": [
        [
          1,
          "2026-01-10"
        ],
        [
          2,
          "2026-01-25"
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: Filter signup_date LIKE '2026-01%'."
    ],
    "solutionSql": "SELECT user_id, signup_date FROM meta_tb_34 WHERE signup_date LIKE '2026-01%' ORDER BY user_id;",
    "starterSql": "-- Problem #34: Meta Cohort Signups #34\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 35,
    "title": "Meta Query Optimization #35",
    "difficulty": "Easy",
    "domain": "DDL, Constraints & Triggers",
    "companyTags": [
      "Meta"
    ],
    "description": "Find transactions with amount > 300.",
    "inputTables": [
      {
        "tableName": "meta_tb_35",
        "columns": [
          {
            "name": "tx_id",
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
    "inputSchemaSql": "CREATE TABLE meta_tb_35 (tx_id INT, amount INT);",
    "seedDataSql": "INSERT INTO meta_tb_35 VALUES (1, 500);\nINSERT INTO meta_tb_35 VALUES (2, 150);\nINSERT INTO meta_tb_35 VALUES (3, 400);",
    "expectedOutput": {
      "columns": [
        "tx_id",
        "amount"
      ],
      "rows": [
        [
          1,
          500
        ],
        [
          3,
          400
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: Filter amount > 300."
    ],
    "solutionSql": "SELECT tx_id, amount FROM meta_tb_35 WHERE amount > 300 ORDER BY amount DESC;",
    "starterSql": "-- Problem #35: Meta Query Optimization #35\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 36,
    "title": "Meta Org Hierarchy Depth #36",
    "difficulty": "Medium",
    "domain": "Recursive CTEs & Graphs",
    "companyTags": [
      "Meta"
    ],
    "description": "Find organizational depth level using recursive query.",
    "inputTables": [
      {
        "tableName": "meta_tb_36",
        "columns": [
          {
            "name": "emp_id",
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
    "inputSchemaSql": "CREATE TABLE meta_tb_36 (emp_id INT, name VARCHAR(255), manager_id INT);",
    "seedDataSql": "INSERT INTO meta_tb_36 VALUES (1, 'CEO', NULL);\nINSERT INTO meta_tb_36 VALUES (2, 'VP', 1);\nINSERT INTO meta_tb_36 VALUES (3, 'Eng', 2);",
    "expectedOutput": {
      "columns": [
        "emp_id",
        "name",
        "depth"
      ],
      "rows": [
        [
          1,
          "CEO",
          1
        ],
        [
          2,
          "VP",
          2
        ],
        [
          3,
          "Eng",
          3
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: Use WITH RECURSIVE Tree AS (...)"
    ],
    "solutionSql": "WITH RECURSIVE Tree AS (SELECT emp_id, name, 1 AS depth FROM meta_tb_36 WHERE manager_id IS NULL UNION ALL SELECT e.emp_id, e.name, t.depth + 1 FROM meta_tb_36 e JOIN Tree t ON e.manager_id = t.emp_id) SELECT emp_id, name, depth FROM Tree ORDER BY depth, emp_id;",
    "starterSql": "-- Problem #36: Meta Org Hierarchy Depth #36\n-- Write your SQL query solution below:\nWITH RECURSIVE Tree AS (\n\n)\nSELECT \nFROM Tree;"
  },
  {
    "id": 37,
    "title": "Meta High Value Account Filter #37",
    "difficulty": "Hard",
    "domain": "Filtering & String Functions",
    "companyTags": [
      "Meta"
    ],
    "description": "Write a query to find active users in Meta's database with spend > 500.",
    "inputTables": [
      {
        "tableName": "meta_tb_37",
        "columns": [
          {
            "name": "name",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE meta_tb_37 (id INT PRIMARY KEY, name VARCHAR(255), spend INT, status VARCHAR(50));",
    "seedDataSql": "INSERT INTO meta_tb_37 VALUES (1, 'Alice', 1200, 'active');\nINSERT INTO meta_tb_37 VALUES (2, 'Bob', 350, 'inactive');\nINSERT INTO meta_tb_37 VALUES (3, 'Charlie', 850, 'active');\nINSERT INTO meta_tb_37 VALUES (4, 'David', 400, 'active');",
    "expectedOutput": {
      "columns": [
        "id",
        "name",
        "spend"
      ],
      "rows": [
        [
          1,
          "Alice",
          1200
        ],
        [
          3,
          "Charlie",
          850
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: Use WHERE spend > 500 AND status = 'active'."
    ],
    "solutionSql": "SELECT id, name, spend FROM meta_tb_37 WHERE spend > 500 AND status = 'active' ORDER BY spend DESC;",
    "starterSql": "-- Problem #37: Meta High Value Account Filter #37\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 38,
    "title": "Meta Category Revenue Breakdown #38",
    "difficulty": "Expert",
    "domain": "Aggregations & Grouping",
    "companyTags": [
      "Meta"
    ],
    "description": "Calculate the total revenue and count for each product category in Meta's sales ledger.",
    "inputTables": [
      {
        "tableName": "meta_tb_38",
        "columns": [
          {
            "name": "order_id",
            "type": "INT"
          },
          {
            "name": "category",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE meta_tb_38 (order_id INT, category VARCHAR(255), revenue INT);",
    "seedDataSql": "INSERT INTO meta_tb_38 VALUES (101, 'Cloud', 500);\nINSERT INTO meta_tb_38 VALUES (102, 'Cloud', 300);\nINSERT INTO meta_tb_38 VALUES (103, 'Hardware', 150);\nINSERT INTO meta_tb_38 VALUES (104, 'Hardware', 250);",
    "expectedOutput": {
      "columns": [
        "category",
        "total_revenue",
        "order_count"
      ],
      "rows": [
        [
          "Cloud",
          800,
          2
        ],
        [
          "Hardware",
          400,
          2
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: GROUP BY category and SUM(revenue)."
    ],
    "solutionSql": "SELECT category, SUM(revenue) AS total_revenue, COUNT(*) AS order_count FROM meta_tb_38 GROUP BY category ORDER BY total_revenue DESC;",
    "starterSql": "-- Problem #38: Meta Category Revenue Breakdown #38\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 39,
    "title": "Meta User Order Match #39",
    "difficulty": "Easy",
    "domain": "Joins & Relational Sets",
    "companyTags": [
      "Meta"
    ],
    "description": "Join users and orders tables to find user order totals.",
    "inputTables": [
      {
        "tableName": "meta_tb_39",
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
    "inputSchemaSql": "CREATE TABLE meta_tb_39 (user_id INT, name VARCHAR(255));\nCREATE TABLE meta_tb_39_orders (order_id INT, user_id INT, amount INT);",
    "seedDataSql": "INSERT INTO meta_tb_39 VALUES (1, 'Alice');\nINSERT INTO meta_tb_39 VALUES (2, 'Bob');\nINSERT INTO meta_tb_39_orders VALUES (101, 1, 200);\nINSERT INTO meta_tb_39_orders VALUES (102, 1, 300);\nINSERT INTO meta_tb_39_orders VALUES (103, 2, 150);",
    "expectedOutput": {
      "columns": [
        "name",
        "total_amount"
      ],
      "rows": [
        [
          "Alice",
          500
        ],
        [
          "Bob",
          150
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: JOIN meta_tb_39_orders ON u.user_id = o.user_id."
    ],
    "solutionSql": "SELECT u.name, SUM(o.amount) AS total_amount FROM meta_tb_39 u JOIN meta_tb_39_orders o ON u.user_id = o.user_id GROUP BY u.name ORDER BY total_amount DESC;",
    "starterSql": "-- Problem #39: Meta User Order Match #39\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 40,
    "title": "Meta Query Optimization #40",
    "difficulty": "Medium",
    "domain": "Subqueries & CTEs",
    "companyTags": [
      "Meta"
    ],
    "description": "Find transactions with amount > 300.",
    "inputTables": [
      {
        "tableName": "meta_tb_40",
        "columns": [
          {
            "name": "tx_id",
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
    "inputSchemaSql": "CREATE TABLE meta_tb_40 (tx_id INT, amount INT);",
    "seedDataSql": "INSERT INTO meta_tb_40 VALUES (1, 500);\nINSERT INTO meta_tb_40 VALUES (2, 150);\nINSERT INTO meta_tb_40 VALUES (3, 400);",
    "expectedOutput": {
      "columns": [
        "tx_id",
        "amount"
      ],
      "rows": [
        [
          1,
          500
        ],
        [
          3,
          400
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: Filter amount > 300."
    ],
    "solutionSql": "SELECT tx_id, amount FROM meta_tb_40 WHERE amount > 300 ORDER BY amount DESC;",
    "starterSql": "-- Problem #40: Meta Query Optimization #40\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 41,
    "title": "Meta Salary Department Rank #41",
    "difficulty": "Hard",
    "domain": "Window Ranking & Ordering",
    "companyTags": [
      "Meta"
    ],
    "description": "Rank employees by salary within each department.",
    "inputTables": [
      {
        "tableName": "meta_tb_41",
        "columns": [
          {
            "name": "emp_id",
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
    "inputSchemaSql": "CREATE TABLE meta_tb_41 (emp_id INT, name VARCHAR(255), salary INT, dept VARCHAR(50));",
    "seedDataSql": "INSERT INTO meta_tb_41 VALUES (1, 'Alice', 95000, 'Engineering');\nINSERT INTO meta_tb_41 VALUES (2, 'Bob', 85000, 'Engineering');\nINSERT INTO meta_tb_41 VALUES (3, 'Charlie', 110000, 'Product');\nINSERT INTO meta_tb_41 VALUES (4, 'David', 90000, 'Product');",
    "expectedOutput": {
      "columns": [
        "emp_id",
        "name",
        "salary",
        "dept",
        "rnk"
      ],
      "rows": [
        [
          1,
          "Alice",
          95000,
          "Engineering",
          1
        ],
        [
          2,
          "Bob",
          85000,
          "Engineering",
          2
        ],
        [
          3,
          "Charlie",
          110000,
          "Product",
          1
        ],
        [
          4,
          "David",
          90000,
          "Product",
          2
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: DENSE_RANK() OVER (PARTITION BY dept ORDER BY salary DESC)."
    ],
    "solutionSql": "SELECT emp_id, name, salary, dept, DENSE_RANK() OVER (PARTITION BY dept ORDER BY salary DESC) AS rnk FROM meta_tb_41;",
    "starterSql": "-- Problem #41: Meta Salary Department Rank #41\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 42,
    "title": "Meta Previous Activity Delta #42",
    "difficulty": "Expert",
    "domain": "Window Offset Functions",
    "companyTags": [
      "Meta"
    ],
    "description": "Find previous login date using LAG() window function.",
    "inputTables": [
      {
        "tableName": "meta_tb_42",
        "columns": [
          {
            "name": "user_id",
            "type": "INT"
          },
          {
            "name": "login_date",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE meta_tb_42 (user_id INT, login_date VARCHAR(50));",
    "seedDataSql": "INSERT INTO meta_tb_42 VALUES (1, '2026-01-01');\nINSERT INTO meta_tb_42 VALUES (1, '2026-01-05');\nINSERT INTO meta_tb_42 VALUES (1, '2026-01-20');",
    "expectedOutput": {
      "columns": [
        "user_id",
        "login_date",
        "prev_login"
      ],
      "rows": [
        [
          1,
          "2026-01-01",
          null
        ],
        [
          1,
          "2026-01-05",
          "2026-01-01"
        ],
        [
          1,
          "2026-01-20",
          "2026-01-05"
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: LAG(login_date) OVER (PARTITION BY user_id ORDER BY login_date)."
    ],
    "solutionSql": "SELECT user_id, login_date, LAG(login_date) OVER (PARTITION BY user_id ORDER BY login_date) AS prev_login FROM meta_tb_42;",
    "starterSql": "-- Problem #42: Meta Previous Activity Delta #42\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 43,
    "title": "Meta 3-Day Moving Average #43",
    "difficulty": "Easy",
    "domain": "Sliding Window Aggregates",
    "companyTags": [
      "Meta"
    ],
    "description": "Calculate 3-day moving average of daily sales.",
    "inputTables": [
      {
        "tableName": "meta_tb_43",
        "columns": [
          {
            "name": "day_id",
            "type": "INT"
          },
          {
            "name": "sales",
            "type": "INT"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE meta_tb_43 (day_id INT, sales INT);",
    "seedDataSql": "INSERT INTO meta_tb_43 VALUES (1, 100);\nINSERT INTO meta_tb_43 VALUES (2, 120);\nINSERT INTO meta_tb_43 VALUES (3, 140);\nINSERT INTO meta_tb_43 VALUES (4, 110);",
    "expectedOutput": {
      "columns": [
        "day_id",
        "sales",
        "moving_avg"
      ],
      "rows": [
        [
          1,
          100,
          100.0
        ],
        [
          2,
          120,
          110.0
        ],
        [
          3,
          140,
          120.0
        ],
        [
          4,
          110,
          123.33333333333333
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: AVG(sales) OVER (ORDER BY day_id ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)."
    ],
    "solutionSql": "SELECT day_id, sales, AVG(sales) OVER (ORDER BY day_id ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) AS moving_avg FROM meta_tb_43;",
    "starterSql": "-- Problem #43: Meta 3-Day Moving Average #43\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 44,
    "title": "Meta Cohort Signups #44",
    "difficulty": "Medium",
    "domain": "Date & Time Analytics",
    "companyTags": [
      "Meta"
    ],
    "description": "Filter user signups in January 2026.",
    "inputTables": [
      {
        "tableName": "meta_tb_44",
        "columns": [
          {
            "name": "user_id",
            "type": "INT"
          },
          {
            "name": "signup_date",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE meta_tb_44 (user_id INT, signup_date VARCHAR(50));",
    "seedDataSql": "INSERT INTO meta_tb_44 VALUES (1, '2026-01-10');\nINSERT INTO meta_tb_44 VALUES (2, '2026-01-25');\nINSERT INTO meta_tb_44 VALUES (3, '2026-02-01');",
    "expectedOutput": {
      "columns": [
        "user_id",
        "signup_date"
      ],
      "rows": [
        [
          1,
          "2026-01-10"
        ],
        [
          2,
          "2026-01-25"
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: Filter signup_date LIKE '2026-01%'."
    ],
    "solutionSql": "SELECT user_id, signup_date FROM meta_tb_44 WHERE signup_date LIKE '2026-01%' ORDER BY user_id;",
    "starterSql": "-- Problem #44: Meta Cohort Signups #44\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 45,
    "title": "Meta Query Optimization #45",
    "difficulty": "Hard",
    "domain": "DDL, Constraints & Triggers",
    "companyTags": [
      "Meta"
    ],
    "description": "Find transactions with amount > 300.",
    "inputTables": [
      {
        "tableName": "meta_tb_45",
        "columns": [
          {
            "name": "tx_id",
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
    "inputSchemaSql": "CREATE TABLE meta_tb_45 (tx_id INT, amount INT);",
    "seedDataSql": "INSERT INTO meta_tb_45 VALUES (1, 500);\nINSERT INTO meta_tb_45 VALUES (2, 150);\nINSERT INTO meta_tb_45 VALUES (3, 400);",
    "expectedOutput": {
      "columns": [
        "tx_id",
        "amount"
      ],
      "rows": [
        [
          1,
          500
        ],
        [
          3,
          400
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: Filter amount > 300."
    ],
    "solutionSql": "SELECT tx_id, amount FROM meta_tb_45 WHERE amount > 300 ORDER BY amount DESC;",
    "starterSql": "-- Problem #45: Meta Query Optimization #45\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 46,
    "title": "Meta Org Hierarchy Depth #46",
    "difficulty": "Expert",
    "domain": "Recursive CTEs & Graphs",
    "companyTags": [
      "Meta"
    ],
    "description": "Find organizational depth level using recursive query.",
    "inputTables": [
      {
        "tableName": "meta_tb_46",
        "columns": [
          {
            "name": "emp_id",
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
    "inputSchemaSql": "CREATE TABLE meta_tb_46 (emp_id INT, name VARCHAR(255), manager_id INT);",
    "seedDataSql": "INSERT INTO meta_tb_46 VALUES (1, 'CEO', NULL);\nINSERT INTO meta_tb_46 VALUES (2, 'VP', 1);\nINSERT INTO meta_tb_46 VALUES (3, 'Eng', 2);",
    "expectedOutput": {
      "columns": [
        "emp_id",
        "name",
        "depth"
      ],
      "rows": [
        [
          1,
          "CEO",
          1
        ],
        [
          2,
          "VP",
          2
        ],
        [
          3,
          "Eng",
          3
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: Use WITH RECURSIVE Tree AS (...)"
    ],
    "solutionSql": "WITH RECURSIVE Tree AS (SELECT emp_id, name, 1 AS depth FROM meta_tb_46 WHERE manager_id IS NULL UNION ALL SELECT e.emp_id, e.name, t.depth + 1 FROM meta_tb_46 e JOIN Tree t ON e.manager_id = t.emp_id) SELECT emp_id, name, depth FROM Tree ORDER BY depth, emp_id;",
    "starterSql": "-- Problem #46: Meta Org Hierarchy Depth #46\n-- Write your SQL query solution below:\nWITH RECURSIVE Tree AS (\n\n)\nSELECT \nFROM Tree;"
  },
  {
    "id": 47,
    "title": "Meta High Value Account Filter #47",
    "difficulty": "Easy",
    "domain": "Filtering & String Functions",
    "companyTags": [
      "Meta"
    ],
    "description": "Write a query to find active users in Meta's database with spend > 500.",
    "inputTables": [
      {
        "tableName": "meta_tb_47",
        "columns": [
          {
            "name": "name",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE meta_tb_47 (id INT PRIMARY KEY, name VARCHAR(255), spend INT, status VARCHAR(50));",
    "seedDataSql": "INSERT INTO meta_tb_47 VALUES (1, 'Alice', 1200, 'active');\nINSERT INTO meta_tb_47 VALUES (2, 'Bob', 350, 'inactive');\nINSERT INTO meta_tb_47 VALUES (3, 'Charlie', 850, 'active');\nINSERT INTO meta_tb_47 VALUES (4, 'David', 400, 'active');",
    "expectedOutput": {
      "columns": [
        "id",
        "name",
        "spend"
      ],
      "rows": [
        [
          1,
          "Alice",
          1200
        ],
        [
          3,
          "Charlie",
          850
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: Use WHERE spend > 500 AND status = 'active'."
    ],
    "solutionSql": "SELECT id, name, spend FROM meta_tb_47 WHERE spend > 500 AND status = 'active' ORDER BY spend DESC;",
    "starterSql": "-- Problem #47: Meta High Value Account Filter #47\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 48,
    "title": "Meta Category Revenue Breakdown #48",
    "difficulty": "Medium",
    "domain": "Aggregations & Grouping",
    "companyTags": [
      "Meta"
    ],
    "description": "Calculate the total revenue and count for each product category in Meta's sales ledger.",
    "inputTables": [
      {
        "tableName": "meta_tb_48",
        "columns": [
          {
            "name": "order_id",
            "type": "INT"
          },
          {
            "name": "category",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE meta_tb_48 (order_id INT, category VARCHAR(255), revenue INT);",
    "seedDataSql": "INSERT INTO meta_tb_48 VALUES (101, 'Cloud', 500);\nINSERT INTO meta_tb_48 VALUES (102, 'Cloud', 300);\nINSERT INTO meta_tb_48 VALUES (103, 'Hardware', 150);\nINSERT INTO meta_tb_48 VALUES (104, 'Hardware', 250);",
    "expectedOutput": {
      "columns": [
        "category",
        "total_revenue",
        "order_count"
      ],
      "rows": [
        [
          "Cloud",
          800,
          2
        ],
        [
          "Hardware",
          400,
          2
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: GROUP BY category and SUM(revenue)."
    ],
    "solutionSql": "SELECT category, SUM(revenue) AS total_revenue, COUNT(*) AS order_count FROM meta_tb_48 GROUP BY category ORDER BY total_revenue DESC;",
    "starterSql": "-- Problem #48: Meta Category Revenue Breakdown #48\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 49,
    "title": "Meta User Order Match #49",
    "difficulty": "Hard",
    "domain": "Joins & Relational Sets",
    "companyTags": [
      "Meta"
    ],
    "description": "Join users and orders tables to find user order totals.",
    "inputTables": [
      {
        "tableName": "meta_tb_49",
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
    "inputSchemaSql": "CREATE TABLE meta_tb_49 (user_id INT, name VARCHAR(255));\nCREATE TABLE meta_tb_49_orders (order_id INT, user_id INT, amount INT);",
    "seedDataSql": "INSERT INTO meta_tb_49 VALUES (1, 'Alice');\nINSERT INTO meta_tb_49 VALUES (2, 'Bob');\nINSERT INTO meta_tb_49_orders VALUES (101, 1, 200);\nINSERT INTO meta_tb_49_orders VALUES (102, 1, 300);\nINSERT INTO meta_tb_49_orders VALUES (103, 2, 150);",
    "expectedOutput": {
      "columns": [
        "name",
        "total_amount"
      ],
      "rows": [
        [
          "Alice",
          500
        ],
        [
          "Bob",
          150
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: JOIN meta_tb_49_orders ON u.user_id = o.user_id."
    ],
    "solutionSql": "SELECT u.name, SUM(o.amount) AS total_amount FROM meta_tb_49 u JOIN meta_tb_49_orders o ON u.user_id = o.user_id GROUP BY u.name ORDER BY total_amount DESC;",
    "starterSql": "-- Problem #49: Meta User Order Match #49\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 50,
    "title": "Meta Query Optimization #50",
    "difficulty": "Expert",
    "domain": "Subqueries & CTEs",
    "companyTags": [
      "Meta"
    ],
    "description": "Find transactions with amount > 300.",
    "inputTables": [
      {
        "tableName": "meta_tb_50",
        "columns": [
          {
            "name": "tx_id",
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
    "inputSchemaSql": "CREATE TABLE meta_tb_50 (tx_id INT, amount INT);",
    "seedDataSql": "INSERT INTO meta_tb_50 VALUES (1, 500);\nINSERT INTO meta_tb_50 VALUES (2, 150);\nINSERT INTO meta_tb_50 VALUES (3, 400);",
    "expectedOutput": {
      "columns": [
        "tx_id",
        "amount"
      ],
      "rows": [
        [
          1,
          500
        ],
        [
          3,
          400
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: Filter amount > 300."
    ],
    "solutionSql": "SELECT tx_id, amount FROM meta_tb_50 WHERE amount > 300 ORDER BY amount DESC;",
    "starterSql": "-- Problem #50: Meta Query Optimization #50\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 51,
    "title": "Meta Salary Department Rank #51",
    "difficulty": "Easy",
    "domain": "Window Ranking & Ordering",
    "companyTags": [
      "Meta"
    ],
    "description": "Rank employees by salary within each department.",
    "inputTables": [
      {
        "tableName": "meta_tb_51",
        "columns": [
          {
            "name": "emp_id",
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
    "inputSchemaSql": "CREATE TABLE meta_tb_51 (emp_id INT, name VARCHAR(255), salary INT, dept VARCHAR(50));",
    "seedDataSql": "INSERT INTO meta_tb_51 VALUES (1, 'Alice', 95000, 'Engineering');\nINSERT INTO meta_tb_51 VALUES (2, 'Bob', 85000, 'Engineering');\nINSERT INTO meta_tb_51 VALUES (3, 'Charlie', 110000, 'Product');\nINSERT INTO meta_tb_51 VALUES (4, 'David', 90000, 'Product');",
    "expectedOutput": {
      "columns": [
        "emp_id",
        "name",
        "salary",
        "dept",
        "rnk"
      ],
      "rows": [
        [
          1,
          "Alice",
          95000,
          "Engineering",
          1
        ],
        [
          2,
          "Bob",
          85000,
          "Engineering",
          2
        ],
        [
          3,
          "Charlie",
          110000,
          "Product",
          1
        ],
        [
          4,
          "David",
          90000,
          "Product",
          2
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: DENSE_RANK() OVER (PARTITION BY dept ORDER BY salary DESC)."
    ],
    "solutionSql": "SELECT emp_id, name, salary, dept, DENSE_RANK() OVER (PARTITION BY dept ORDER BY salary DESC) AS rnk FROM meta_tb_51;",
    "starterSql": "-- Problem #51: Meta Salary Department Rank #51\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 52,
    "title": "Amazon High Value Account Filter #52",
    "difficulty": "Easy",
    "domain": "Filtering & String Functions",
    "companyTags": [
      "Amazon"
    ],
    "description": "Write a query to find active users in Amazon's database with spend > 500.",
    "inputTables": [
      {
        "tableName": "amazon_tb_52",
        "columns": [
          {
            "name": "name",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE amazon_tb_52 (id INT PRIMARY KEY, name VARCHAR(255), spend INT, status VARCHAR(50));",
    "seedDataSql": "INSERT INTO amazon_tb_52 VALUES (1, 'Alice', 1200, 'active');\nINSERT INTO amazon_tb_52 VALUES (2, 'Bob', 350, 'inactive');\nINSERT INTO amazon_tb_52 VALUES (3, 'Charlie', 850, 'active');\nINSERT INTO amazon_tb_52 VALUES (4, 'David', 400, 'active');",
    "expectedOutput": {
      "columns": [
        "id",
        "name",
        "spend"
      ],
      "rows": [
        [
          1,
          "Alice",
          1200
        ],
        [
          3,
          "Charlie",
          850
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: Use WHERE spend > 500 AND status = 'active'."
    ],
    "solutionSql": "SELECT id, name, spend FROM amazon_tb_52 WHERE spend > 500 AND status = 'active' ORDER BY spend DESC;",
    "starterSql": "-- Problem #52: Amazon High Value Account Filter #52\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 53,
    "title": "Amazon Category Revenue Breakdown #53",
    "difficulty": "Medium",
    "domain": "Aggregations & Grouping",
    "companyTags": [
      "Amazon"
    ],
    "description": "Calculate the total revenue and count for each product category in Amazon's sales ledger.",
    "inputTables": [
      {
        "tableName": "amazon_tb_53",
        "columns": [
          {
            "name": "order_id",
            "type": "INT"
          },
          {
            "name": "category",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE amazon_tb_53 (order_id INT, category VARCHAR(255), revenue INT);",
    "seedDataSql": "INSERT INTO amazon_tb_53 VALUES (101, 'Cloud', 500);\nINSERT INTO amazon_tb_53 VALUES (102, 'Cloud', 300);\nINSERT INTO amazon_tb_53 VALUES (103, 'Hardware', 150);\nINSERT INTO amazon_tb_53 VALUES (104, 'Hardware', 250);",
    "expectedOutput": {
      "columns": [
        "category",
        "total_revenue",
        "order_count"
      ],
      "rows": [
        [
          "Cloud",
          800,
          2
        ],
        [
          "Hardware",
          400,
          2
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: GROUP BY category and SUM(revenue)."
    ],
    "solutionSql": "SELECT category, SUM(revenue) AS total_revenue, COUNT(*) AS order_count FROM amazon_tb_53 GROUP BY category ORDER BY total_revenue DESC;",
    "starterSql": "-- Problem #53: Amazon Category Revenue Breakdown #53\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 54,
    "title": "Amazon User Order Match #54",
    "difficulty": "Hard",
    "domain": "Joins & Relational Sets",
    "companyTags": [
      "Amazon"
    ],
    "description": "Join users and orders tables to find user order totals.",
    "inputTables": [
      {
        "tableName": "amazon_tb_54",
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
    "inputSchemaSql": "CREATE TABLE amazon_tb_54 (user_id INT, name VARCHAR(255));\nCREATE TABLE amazon_tb_54_orders (order_id INT, user_id INT, amount INT);",
    "seedDataSql": "INSERT INTO amazon_tb_54 VALUES (1, 'Alice');\nINSERT INTO amazon_tb_54 VALUES (2, 'Bob');\nINSERT INTO amazon_tb_54_orders VALUES (101, 1, 200);\nINSERT INTO amazon_tb_54_orders VALUES (102, 1, 300);\nINSERT INTO amazon_tb_54_orders VALUES (103, 2, 150);",
    "expectedOutput": {
      "columns": [
        "name",
        "total_amount"
      ],
      "rows": [
        [
          "Alice",
          500
        ],
        [
          "Bob",
          150
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: JOIN amazon_tb_54_orders ON u.user_id = o.user_id."
    ],
    "solutionSql": "SELECT u.name, SUM(o.amount) AS total_amount FROM amazon_tb_54 u JOIN amazon_tb_54_orders o ON u.user_id = o.user_id GROUP BY u.name ORDER BY total_amount DESC;",
    "starterSql": "-- Problem #54: Amazon User Order Match #54\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 55,
    "title": "Amazon Query Optimization #55",
    "difficulty": "Expert",
    "domain": "Subqueries & CTEs",
    "companyTags": [
      "Amazon"
    ],
    "description": "Find transactions with amount > 300.",
    "inputTables": [
      {
        "tableName": "amazon_tb_55",
        "columns": [
          {
            "name": "tx_id",
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
    "inputSchemaSql": "CREATE TABLE amazon_tb_55 (tx_id INT, amount INT);",
    "seedDataSql": "INSERT INTO amazon_tb_55 VALUES (1, 500);\nINSERT INTO amazon_tb_55 VALUES (2, 150);\nINSERT INTO amazon_tb_55 VALUES (3, 400);",
    "expectedOutput": {
      "columns": [
        "tx_id",
        "amount"
      ],
      "rows": [
        [
          1,
          500
        ],
        [
          3,
          400
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: Filter amount > 300."
    ],
    "solutionSql": "SELECT tx_id, amount FROM amazon_tb_55 WHERE amount > 300 ORDER BY amount DESC;",
    "starterSql": "-- Problem #55: Amazon Query Optimization #55\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 56,
    "title": "Amazon Salary Department Rank #56",
    "difficulty": "Easy",
    "domain": "Window Ranking & Ordering",
    "companyTags": [
      "Amazon"
    ],
    "description": "Rank employees by salary within each department.",
    "inputTables": [
      {
        "tableName": "amazon_tb_56",
        "columns": [
          {
            "name": "emp_id",
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
    "inputSchemaSql": "CREATE TABLE amazon_tb_56 (emp_id INT, name VARCHAR(255), salary INT, dept VARCHAR(50));",
    "seedDataSql": "INSERT INTO amazon_tb_56 VALUES (1, 'Alice', 95000, 'Engineering');\nINSERT INTO amazon_tb_56 VALUES (2, 'Bob', 85000, 'Engineering');\nINSERT INTO amazon_tb_56 VALUES (3, 'Charlie', 110000, 'Product');\nINSERT INTO amazon_tb_56 VALUES (4, 'David', 90000, 'Product');",
    "expectedOutput": {
      "columns": [
        "emp_id",
        "name",
        "salary",
        "dept",
        "rnk"
      ],
      "rows": [
        [
          1,
          "Alice",
          95000,
          "Engineering",
          1
        ],
        [
          2,
          "Bob",
          85000,
          "Engineering",
          2
        ],
        [
          3,
          "Charlie",
          110000,
          "Product",
          1
        ],
        [
          4,
          "David",
          90000,
          "Product",
          2
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: DENSE_RANK() OVER (PARTITION BY dept ORDER BY salary DESC)."
    ],
    "solutionSql": "SELECT emp_id, name, salary, dept, DENSE_RANK() OVER (PARTITION BY dept ORDER BY salary DESC) AS rnk FROM amazon_tb_56;",
    "starterSql": "-- Problem #56: Amazon Salary Department Rank #56\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 57,
    "title": "Amazon Previous Activity Delta #57",
    "difficulty": "Medium",
    "domain": "Window Offset Functions",
    "companyTags": [
      "Amazon"
    ],
    "description": "Find previous login date using LAG() window function.",
    "inputTables": [
      {
        "tableName": "amazon_tb_57",
        "columns": [
          {
            "name": "user_id",
            "type": "INT"
          },
          {
            "name": "login_date",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE amazon_tb_57 (user_id INT, login_date VARCHAR(50));",
    "seedDataSql": "INSERT INTO amazon_tb_57 VALUES (1, '2026-01-01');\nINSERT INTO amazon_tb_57 VALUES (1, '2026-01-05');\nINSERT INTO amazon_tb_57 VALUES (1, '2026-01-20');",
    "expectedOutput": {
      "columns": [
        "user_id",
        "login_date",
        "prev_login"
      ],
      "rows": [
        [
          1,
          "2026-01-01",
          null
        ],
        [
          1,
          "2026-01-05",
          "2026-01-01"
        ],
        [
          1,
          "2026-01-20",
          "2026-01-05"
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: LAG(login_date) OVER (PARTITION BY user_id ORDER BY login_date)."
    ],
    "solutionSql": "SELECT user_id, login_date, LAG(login_date) OVER (PARTITION BY user_id ORDER BY login_date) AS prev_login FROM amazon_tb_57;",
    "starterSql": "-- Problem #57: Amazon Previous Activity Delta #57\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 58,
    "title": "Amazon 3-Day Moving Average #58",
    "difficulty": "Hard",
    "domain": "Sliding Window Aggregates",
    "companyTags": [
      "Amazon"
    ],
    "description": "Calculate 3-day moving average of daily sales.",
    "inputTables": [
      {
        "tableName": "amazon_tb_58",
        "columns": [
          {
            "name": "day_id",
            "type": "INT"
          },
          {
            "name": "sales",
            "type": "INT"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE amazon_tb_58 (day_id INT, sales INT);",
    "seedDataSql": "INSERT INTO amazon_tb_58 VALUES (1, 100);\nINSERT INTO amazon_tb_58 VALUES (2, 120);\nINSERT INTO amazon_tb_58 VALUES (3, 140);\nINSERT INTO amazon_tb_58 VALUES (4, 110);",
    "expectedOutput": {
      "columns": [
        "day_id",
        "sales",
        "moving_avg"
      ],
      "rows": [
        [
          1,
          100,
          100.0
        ],
        [
          2,
          120,
          110.0
        ],
        [
          3,
          140,
          120.0
        ],
        [
          4,
          110,
          123.33333333333333
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: AVG(sales) OVER (ORDER BY day_id ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)."
    ],
    "solutionSql": "SELECT day_id, sales, AVG(sales) OVER (ORDER BY day_id ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) AS moving_avg FROM amazon_tb_58;",
    "starterSql": "-- Problem #58: Amazon 3-Day Moving Average #58\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 59,
    "title": "Amazon Cohort Signups #59",
    "difficulty": "Expert",
    "domain": "Date & Time Analytics",
    "companyTags": [
      "Amazon"
    ],
    "description": "Filter user signups in January 2026.",
    "inputTables": [
      {
        "tableName": "amazon_tb_59",
        "columns": [
          {
            "name": "user_id",
            "type": "INT"
          },
          {
            "name": "signup_date",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE amazon_tb_59 (user_id INT, signup_date VARCHAR(50));",
    "seedDataSql": "INSERT INTO amazon_tb_59 VALUES (1, '2026-01-10');\nINSERT INTO amazon_tb_59 VALUES (2, '2026-01-25');\nINSERT INTO amazon_tb_59 VALUES (3, '2026-02-01');",
    "expectedOutput": {
      "columns": [
        "user_id",
        "signup_date"
      ],
      "rows": [
        [
          1,
          "2026-01-10"
        ],
        [
          2,
          "2026-01-25"
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: Filter signup_date LIKE '2026-01%'."
    ],
    "solutionSql": "SELECT user_id, signup_date FROM amazon_tb_59 WHERE signup_date LIKE '2026-01%' ORDER BY user_id;",
    "starterSql": "-- Problem #59: Amazon Cohort Signups #59\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 60,
    "title": "Amazon Query Optimization #60",
    "difficulty": "Easy",
    "domain": "DDL, Constraints & Triggers",
    "companyTags": [
      "Amazon"
    ],
    "description": "Find transactions with amount > 300.",
    "inputTables": [
      {
        "tableName": "amazon_tb_60",
        "columns": [
          {
            "name": "tx_id",
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
    "inputSchemaSql": "CREATE TABLE amazon_tb_60 (tx_id INT, amount INT);",
    "seedDataSql": "INSERT INTO amazon_tb_60 VALUES (1, 500);\nINSERT INTO amazon_tb_60 VALUES (2, 150);\nINSERT INTO amazon_tb_60 VALUES (3, 400);",
    "expectedOutput": {
      "columns": [
        "tx_id",
        "amount"
      ],
      "rows": [
        [
          1,
          500
        ],
        [
          3,
          400
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: Filter amount > 300."
    ],
    "solutionSql": "SELECT tx_id, amount FROM amazon_tb_60 WHERE amount > 300 ORDER BY amount DESC;",
    "starterSql": "-- Problem #60: Amazon Query Optimization #60\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 61,
    "title": "Amazon Org Hierarchy Depth #61",
    "difficulty": "Medium",
    "domain": "Recursive CTEs & Graphs",
    "companyTags": [
      "Amazon"
    ],
    "description": "Find organizational depth level using recursive query.",
    "inputTables": [
      {
        "tableName": "amazon_tb_61",
        "columns": [
          {
            "name": "emp_id",
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
    "inputSchemaSql": "CREATE TABLE amazon_tb_61 (emp_id INT, name VARCHAR(255), manager_id INT);",
    "seedDataSql": "INSERT INTO amazon_tb_61 VALUES (1, 'CEO', NULL);\nINSERT INTO amazon_tb_61 VALUES (2, 'VP', 1);\nINSERT INTO amazon_tb_61 VALUES (3, 'Eng', 2);",
    "expectedOutput": {
      "columns": [
        "emp_id",
        "name",
        "depth"
      ],
      "rows": [
        [
          1,
          "CEO",
          1
        ],
        [
          2,
          "VP",
          2
        ],
        [
          3,
          "Eng",
          3
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: Use WITH RECURSIVE Tree AS (...)"
    ],
    "solutionSql": "WITH RECURSIVE Tree AS (SELECT emp_id, name, 1 AS depth FROM amazon_tb_61 WHERE manager_id IS NULL UNION ALL SELECT e.emp_id, e.name, t.depth + 1 FROM amazon_tb_61 e JOIN Tree t ON e.manager_id = t.emp_id) SELECT emp_id, name, depth FROM Tree ORDER BY depth, emp_id;",
    "starterSql": "-- Problem #61: Amazon Org Hierarchy Depth #61\n-- Write your SQL query solution below:\nWITH RECURSIVE Tree AS (\n\n)\nSELECT \nFROM Tree;"
  },
  {
    "id": 62,
    "title": "Amazon High Value Account Filter #62",
    "difficulty": "Hard",
    "domain": "Filtering & String Functions",
    "companyTags": [
      "Amazon"
    ],
    "description": "Write a query to find active users in Amazon's database with spend > 500.",
    "inputTables": [
      {
        "tableName": "amazon_tb_62",
        "columns": [
          {
            "name": "name",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE amazon_tb_62 (id INT PRIMARY KEY, name VARCHAR(255), spend INT, status VARCHAR(50));",
    "seedDataSql": "INSERT INTO amazon_tb_62 VALUES (1, 'Alice', 1200, 'active');\nINSERT INTO amazon_tb_62 VALUES (2, 'Bob', 350, 'inactive');\nINSERT INTO amazon_tb_62 VALUES (3, 'Charlie', 850, 'active');\nINSERT INTO amazon_tb_62 VALUES (4, 'David', 400, 'active');",
    "expectedOutput": {
      "columns": [
        "id",
        "name",
        "spend"
      ],
      "rows": [
        [
          1,
          "Alice",
          1200
        ],
        [
          3,
          "Charlie",
          850
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: Use WHERE spend > 500 AND status = 'active'."
    ],
    "solutionSql": "SELECT id, name, spend FROM amazon_tb_62 WHERE spend > 500 AND status = 'active' ORDER BY spend DESC;",
    "starterSql": "-- Problem #62: Amazon High Value Account Filter #62\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 63,
    "title": "Amazon Category Revenue Breakdown #63",
    "difficulty": "Expert",
    "domain": "Aggregations & Grouping",
    "companyTags": [
      "Amazon"
    ],
    "description": "Calculate the total revenue and count for each product category in Amazon's sales ledger.",
    "inputTables": [
      {
        "tableName": "amazon_tb_63",
        "columns": [
          {
            "name": "order_id",
            "type": "INT"
          },
          {
            "name": "category",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE amazon_tb_63 (order_id INT, category VARCHAR(255), revenue INT);",
    "seedDataSql": "INSERT INTO amazon_tb_63 VALUES (101, 'Cloud', 500);\nINSERT INTO amazon_tb_63 VALUES (102, 'Cloud', 300);\nINSERT INTO amazon_tb_63 VALUES (103, 'Hardware', 150);\nINSERT INTO amazon_tb_63 VALUES (104, 'Hardware', 250);",
    "expectedOutput": {
      "columns": [
        "category",
        "total_revenue",
        "order_count"
      ],
      "rows": [
        [
          "Cloud",
          800,
          2
        ],
        [
          "Hardware",
          400,
          2
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: GROUP BY category and SUM(revenue)."
    ],
    "solutionSql": "SELECT category, SUM(revenue) AS total_revenue, COUNT(*) AS order_count FROM amazon_tb_63 GROUP BY category ORDER BY total_revenue DESC;",
    "starterSql": "-- Problem #63: Amazon Category Revenue Breakdown #63\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 64,
    "title": "Amazon User Order Match #64",
    "difficulty": "Easy",
    "domain": "Joins & Relational Sets",
    "companyTags": [
      "Amazon"
    ],
    "description": "Join users and orders tables to find user order totals.",
    "inputTables": [
      {
        "tableName": "amazon_tb_64",
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
    "inputSchemaSql": "CREATE TABLE amazon_tb_64 (user_id INT, name VARCHAR(255));\nCREATE TABLE amazon_tb_64_orders (order_id INT, user_id INT, amount INT);",
    "seedDataSql": "INSERT INTO amazon_tb_64 VALUES (1, 'Alice');\nINSERT INTO amazon_tb_64 VALUES (2, 'Bob');\nINSERT INTO amazon_tb_64_orders VALUES (101, 1, 200);\nINSERT INTO amazon_tb_64_orders VALUES (102, 1, 300);\nINSERT INTO amazon_tb_64_orders VALUES (103, 2, 150);",
    "expectedOutput": {
      "columns": [
        "name",
        "total_amount"
      ],
      "rows": [
        [
          "Alice",
          500
        ],
        [
          "Bob",
          150
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: JOIN amazon_tb_64_orders ON u.user_id = o.user_id."
    ],
    "solutionSql": "SELECT u.name, SUM(o.amount) AS total_amount FROM amazon_tb_64 u JOIN amazon_tb_64_orders o ON u.user_id = o.user_id GROUP BY u.name ORDER BY total_amount DESC;",
    "starterSql": "-- Problem #64: Amazon User Order Match #64\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 65,
    "title": "Amazon Query Optimization #65",
    "difficulty": "Medium",
    "domain": "Subqueries & CTEs",
    "companyTags": [
      "Amazon"
    ],
    "description": "Find transactions with amount > 300.",
    "inputTables": [
      {
        "tableName": "amazon_tb_65",
        "columns": [
          {
            "name": "tx_id",
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
    "inputSchemaSql": "CREATE TABLE amazon_tb_65 (tx_id INT, amount INT);",
    "seedDataSql": "INSERT INTO amazon_tb_65 VALUES (1, 500);\nINSERT INTO amazon_tb_65 VALUES (2, 150);\nINSERT INTO amazon_tb_65 VALUES (3, 400);",
    "expectedOutput": {
      "columns": [
        "tx_id",
        "amount"
      ],
      "rows": [
        [
          1,
          500
        ],
        [
          3,
          400
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: Filter amount > 300."
    ],
    "solutionSql": "SELECT tx_id, amount FROM amazon_tb_65 WHERE amount > 300 ORDER BY amount DESC;",
    "starterSql": "-- Problem #65: Amazon Query Optimization #65\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 66,
    "title": "Amazon Salary Department Rank #66",
    "difficulty": "Hard",
    "domain": "Window Ranking & Ordering",
    "companyTags": [
      "Amazon"
    ],
    "description": "Rank employees by salary within each department.",
    "inputTables": [
      {
        "tableName": "amazon_tb_66",
        "columns": [
          {
            "name": "emp_id",
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
    "inputSchemaSql": "CREATE TABLE amazon_tb_66 (emp_id INT, name VARCHAR(255), salary INT, dept VARCHAR(50));",
    "seedDataSql": "INSERT INTO amazon_tb_66 VALUES (1, 'Alice', 95000, 'Engineering');\nINSERT INTO amazon_tb_66 VALUES (2, 'Bob', 85000, 'Engineering');\nINSERT INTO amazon_tb_66 VALUES (3, 'Charlie', 110000, 'Product');\nINSERT INTO amazon_tb_66 VALUES (4, 'David', 90000, 'Product');",
    "expectedOutput": {
      "columns": [
        "emp_id",
        "name",
        "salary",
        "dept",
        "rnk"
      ],
      "rows": [
        [
          1,
          "Alice",
          95000,
          "Engineering",
          1
        ],
        [
          2,
          "Bob",
          85000,
          "Engineering",
          2
        ],
        [
          3,
          "Charlie",
          110000,
          "Product",
          1
        ],
        [
          4,
          "David",
          90000,
          "Product",
          2
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: DENSE_RANK() OVER (PARTITION BY dept ORDER BY salary DESC)."
    ],
    "solutionSql": "SELECT emp_id, name, salary, dept, DENSE_RANK() OVER (PARTITION BY dept ORDER BY salary DESC) AS rnk FROM amazon_tb_66;",
    "starterSql": "-- Problem #66: Amazon Salary Department Rank #66\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 67,
    "title": "Amazon Previous Activity Delta #67",
    "difficulty": "Expert",
    "domain": "Window Offset Functions",
    "companyTags": [
      "Amazon"
    ],
    "description": "Find previous login date using LAG() window function.",
    "inputTables": [
      {
        "tableName": "amazon_tb_67",
        "columns": [
          {
            "name": "user_id",
            "type": "INT"
          },
          {
            "name": "login_date",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE amazon_tb_67 (user_id INT, login_date VARCHAR(50));",
    "seedDataSql": "INSERT INTO amazon_tb_67 VALUES (1, '2026-01-01');\nINSERT INTO amazon_tb_67 VALUES (1, '2026-01-05');\nINSERT INTO amazon_tb_67 VALUES (1, '2026-01-20');",
    "expectedOutput": {
      "columns": [
        "user_id",
        "login_date",
        "prev_login"
      ],
      "rows": [
        [
          1,
          "2026-01-01",
          null
        ],
        [
          1,
          "2026-01-05",
          "2026-01-01"
        ],
        [
          1,
          "2026-01-20",
          "2026-01-05"
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: LAG(login_date) OVER (PARTITION BY user_id ORDER BY login_date)."
    ],
    "solutionSql": "SELECT user_id, login_date, LAG(login_date) OVER (PARTITION BY user_id ORDER BY login_date) AS prev_login FROM amazon_tb_67;",
    "starterSql": "-- Problem #67: Amazon Previous Activity Delta #67\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 68,
    "title": "Amazon 3-Day Moving Average #68",
    "difficulty": "Easy",
    "domain": "Sliding Window Aggregates",
    "companyTags": [
      "Amazon"
    ],
    "description": "Calculate 3-day moving average of daily sales.",
    "inputTables": [
      {
        "tableName": "amazon_tb_68",
        "columns": [
          {
            "name": "day_id",
            "type": "INT"
          },
          {
            "name": "sales",
            "type": "INT"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE amazon_tb_68 (day_id INT, sales INT);",
    "seedDataSql": "INSERT INTO amazon_tb_68 VALUES (1, 100);\nINSERT INTO amazon_tb_68 VALUES (2, 120);\nINSERT INTO amazon_tb_68 VALUES (3, 140);\nINSERT INTO amazon_tb_68 VALUES (4, 110);",
    "expectedOutput": {
      "columns": [
        "day_id",
        "sales",
        "moving_avg"
      ],
      "rows": [
        [
          1,
          100,
          100.0
        ],
        [
          2,
          120,
          110.0
        ],
        [
          3,
          140,
          120.0
        ],
        [
          4,
          110,
          123.33333333333333
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: AVG(sales) OVER (ORDER BY day_id ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)."
    ],
    "solutionSql": "SELECT day_id, sales, AVG(sales) OVER (ORDER BY day_id ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) AS moving_avg FROM amazon_tb_68;",
    "starterSql": "-- Problem #68: Amazon 3-Day Moving Average #68\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 69,
    "title": "Amazon Cohort Signups #69",
    "difficulty": "Medium",
    "domain": "Date & Time Analytics",
    "companyTags": [
      "Amazon"
    ],
    "description": "Filter user signups in January 2026.",
    "inputTables": [
      {
        "tableName": "amazon_tb_69",
        "columns": [
          {
            "name": "user_id",
            "type": "INT"
          },
          {
            "name": "signup_date",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE amazon_tb_69 (user_id INT, signup_date VARCHAR(50));",
    "seedDataSql": "INSERT INTO amazon_tb_69 VALUES (1, '2026-01-10');\nINSERT INTO amazon_tb_69 VALUES (2, '2026-01-25');\nINSERT INTO amazon_tb_69 VALUES (3, '2026-02-01');",
    "expectedOutput": {
      "columns": [
        "user_id",
        "signup_date"
      ],
      "rows": [
        [
          1,
          "2026-01-10"
        ],
        [
          2,
          "2026-01-25"
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: Filter signup_date LIKE '2026-01%'."
    ],
    "solutionSql": "SELECT user_id, signup_date FROM amazon_tb_69 WHERE signup_date LIKE '2026-01%' ORDER BY user_id;",
    "starterSql": "-- Problem #69: Amazon Cohort Signups #69\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 70,
    "title": "Amazon Query Optimization #70",
    "difficulty": "Hard",
    "domain": "DDL, Constraints & Triggers",
    "companyTags": [
      "Amazon"
    ],
    "description": "Find transactions with amount > 300.",
    "inputTables": [
      {
        "tableName": "amazon_tb_70",
        "columns": [
          {
            "name": "tx_id",
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
    "inputSchemaSql": "CREATE TABLE amazon_tb_70 (tx_id INT, amount INT);",
    "seedDataSql": "INSERT INTO amazon_tb_70 VALUES (1, 500);\nINSERT INTO amazon_tb_70 VALUES (2, 150);\nINSERT INTO amazon_tb_70 VALUES (3, 400);",
    "expectedOutput": {
      "columns": [
        "tx_id",
        "amount"
      ],
      "rows": [
        [
          1,
          500
        ],
        [
          3,
          400
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: Filter amount > 300."
    ],
    "solutionSql": "SELECT tx_id, amount FROM amazon_tb_70 WHERE amount > 300 ORDER BY amount DESC;",
    "starterSql": "-- Problem #70: Amazon Query Optimization #70\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 71,
    "title": "Amazon Org Hierarchy Depth #71",
    "difficulty": "Expert",
    "domain": "Recursive CTEs & Graphs",
    "companyTags": [
      "Amazon"
    ],
    "description": "Find organizational depth level using recursive query.",
    "inputTables": [
      {
        "tableName": "amazon_tb_71",
        "columns": [
          {
            "name": "emp_id",
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
    "inputSchemaSql": "CREATE TABLE amazon_tb_71 (emp_id INT, name VARCHAR(255), manager_id INT);",
    "seedDataSql": "INSERT INTO amazon_tb_71 VALUES (1, 'CEO', NULL);\nINSERT INTO amazon_tb_71 VALUES (2, 'VP', 1);\nINSERT INTO amazon_tb_71 VALUES (3, 'Eng', 2);",
    "expectedOutput": {
      "columns": [
        "emp_id",
        "name",
        "depth"
      ],
      "rows": [
        [
          1,
          "CEO",
          1
        ],
        [
          2,
          "VP",
          2
        ],
        [
          3,
          "Eng",
          3
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: Use WITH RECURSIVE Tree AS (...)"
    ],
    "solutionSql": "WITH RECURSIVE Tree AS (SELECT emp_id, name, 1 AS depth FROM amazon_tb_71 WHERE manager_id IS NULL UNION ALL SELECT e.emp_id, e.name, t.depth + 1 FROM amazon_tb_71 e JOIN Tree t ON e.manager_id = t.emp_id) SELECT emp_id, name, depth FROM Tree ORDER BY depth, emp_id;",
    "starterSql": "-- Problem #71: Amazon Org Hierarchy Depth #71\n-- Write your SQL query solution below:\nWITH RECURSIVE Tree AS (\n\n)\nSELECT \nFROM Tree;"
  },
  {
    "id": 72,
    "title": "Amazon High Value Account Filter #72",
    "difficulty": "Easy",
    "domain": "Filtering & String Functions",
    "companyTags": [
      "Amazon"
    ],
    "description": "Write a query to find active users in Amazon's database with spend > 500.",
    "inputTables": [
      {
        "tableName": "amazon_tb_72",
        "columns": [
          {
            "name": "name",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE amazon_tb_72 (id INT PRIMARY KEY, name VARCHAR(255), spend INT, status VARCHAR(50));",
    "seedDataSql": "INSERT INTO amazon_tb_72 VALUES (1, 'Alice', 1200, 'active');\nINSERT INTO amazon_tb_72 VALUES (2, 'Bob', 350, 'inactive');\nINSERT INTO amazon_tb_72 VALUES (3, 'Charlie', 850, 'active');\nINSERT INTO amazon_tb_72 VALUES (4, 'David', 400, 'active');",
    "expectedOutput": {
      "columns": [
        "id",
        "name",
        "spend"
      ],
      "rows": [
        [
          1,
          "Alice",
          1200
        ],
        [
          3,
          "Charlie",
          850
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: Use WHERE spend > 500 AND status = 'active'."
    ],
    "solutionSql": "SELECT id, name, spend FROM amazon_tb_72 WHERE spend > 500 AND status = 'active' ORDER BY spend DESC;",
    "starterSql": "-- Problem #72: Amazon High Value Account Filter #72\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 73,
    "title": "Amazon Category Revenue Breakdown #73",
    "difficulty": "Medium",
    "domain": "Aggregations & Grouping",
    "companyTags": [
      "Amazon"
    ],
    "description": "Calculate the total revenue and count for each product category in Amazon's sales ledger.",
    "inputTables": [
      {
        "tableName": "amazon_tb_73",
        "columns": [
          {
            "name": "order_id",
            "type": "INT"
          },
          {
            "name": "category",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE amazon_tb_73 (order_id INT, category VARCHAR(255), revenue INT);",
    "seedDataSql": "INSERT INTO amazon_tb_73 VALUES (101, 'Cloud', 500);\nINSERT INTO amazon_tb_73 VALUES (102, 'Cloud', 300);\nINSERT INTO amazon_tb_73 VALUES (103, 'Hardware', 150);\nINSERT INTO amazon_tb_73 VALUES (104, 'Hardware', 250);",
    "expectedOutput": {
      "columns": [
        "category",
        "total_revenue",
        "order_count"
      ],
      "rows": [
        [
          "Cloud",
          800,
          2
        ],
        [
          "Hardware",
          400,
          2
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: GROUP BY category and SUM(revenue)."
    ],
    "solutionSql": "SELECT category, SUM(revenue) AS total_revenue, COUNT(*) AS order_count FROM amazon_tb_73 GROUP BY category ORDER BY total_revenue DESC;",
    "starterSql": "-- Problem #73: Amazon Category Revenue Breakdown #73\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 74,
    "title": "Amazon User Order Match #74",
    "difficulty": "Hard",
    "domain": "Joins & Relational Sets",
    "companyTags": [
      "Amazon"
    ],
    "description": "Join users and orders tables to find user order totals.",
    "inputTables": [
      {
        "tableName": "amazon_tb_74",
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
    "inputSchemaSql": "CREATE TABLE amazon_tb_74 (user_id INT, name VARCHAR(255));\nCREATE TABLE amazon_tb_74_orders (order_id INT, user_id INT, amount INT);",
    "seedDataSql": "INSERT INTO amazon_tb_74 VALUES (1, 'Alice');\nINSERT INTO amazon_tb_74 VALUES (2, 'Bob');\nINSERT INTO amazon_tb_74_orders VALUES (101, 1, 200);\nINSERT INTO amazon_tb_74_orders VALUES (102, 1, 300);\nINSERT INTO amazon_tb_74_orders VALUES (103, 2, 150);",
    "expectedOutput": {
      "columns": [
        "name",
        "total_amount"
      ],
      "rows": [
        [
          "Alice",
          500
        ],
        [
          "Bob",
          150
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: JOIN amazon_tb_74_orders ON u.user_id = o.user_id."
    ],
    "solutionSql": "SELECT u.name, SUM(o.amount) AS total_amount FROM amazon_tb_74 u JOIN amazon_tb_74_orders o ON u.user_id = o.user_id GROUP BY u.name ORDER BY total_amount DESC;",
    "starterSql": "-- Problem #74: Amazon User Order Match #74\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 75,
    "title": "Amazon Query Optimization #75",
    "difficulty": "Expert",
    "domain": "Subqueries & CTEs",
    "companyTags": [
      "Amazon"
    ],
    "description": "Find transactions with amount > 300.",
    "inputTables": [
      {
        "tableName": "amazon_tb_75",
        "columns": [
          {
            "name": "tx_id",
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
    "inputSchemaSql": "CREATE TABLE amazon_tb_75 (tx_id INT, amount INT);",
    "seedDataSql": "INSERT INTO amazon_tb_75 VALUES (1, 500);\nINSERT INTO amazon_tb_75 VALUES (2, 150);\nINSERT INTO amazon_tb_75 VALUES (3, 400);",
    "expectedOutput": {
      "columns": [
        "tx_id",
        "amount"
      ],
      "rows": [
        [
          1,
          500
        ],
        [
          3,
          400
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: Filter amount > 300."
    ],
    "solutionSql": "SELECT tx_id, amount FROM amazon_tb_75 WHERE amount > 300 ORDER BY amount DESC;",
    "starterSql": "-- Problem #75: Amazon Query Optimization #75\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 76,
    "title": "Amazon Salary Department Rank #76",
    "difficulty": "Easy",
    "domain": "Window Ranking & Ordering",
    "companyTags": [
      "Amazon"
    ],
    "description": "Rank employees by salary within each department.",
    "inputTables": [
      {
        "tableName": "amazon_tb_76",
        "columns": [
          {
            "name": "emp_id",
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
    "inputSchemaSql": "CREATE TABLE amazon_tb_76 (emp_id INT, name VARCHAR(255), salary INT, dept VARCHAR(50));",
    "seedDataSql": "INSERT INTO amazon_tb_76 VALUES (1, 'Alice', 95000, 'Engineering');\nINSERT INTO amazon_tb_76 VALUES (2, 'Bob', 85000, 'Engineering');\nINSERT INTO amazon_tb_76 VALUES (3, 'Charlie', 110000, 'Product');\nINSERT INTO amazon_tb_76 VALUES (4, 'David', 90000, 'Product');",
    "expectedOutput": {
      "columns": [
        "emp_id",
        "name",
        "salary",
        "dept",
        "rnk"
      ],
      "rows": [
        [
          1,
          "Alice",
          95000,
          "Engineering",
          1
        ],
        [
          2,
          "Bob",
          85000,
          "Engineering",
          2
        ],
        [
          3,
          "Charlie",
          110000,
          "Product",
          1
        ],
        [
          4,
          "David",
          90000,
          "Product",
          2
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: DENSE_RANK() OVER (PARTITION BY dept ORDER BY salary DESC)."
    ],
    "solutionSql": "SELECT emp_id, name, salary, dept, DENSE_RANK() OVER (PARTITION BY dept ORDER BY salary DESC) AS rnk FROM amazon_tb_76;",
    "starterSql": "-- Problem #76: Amazon Salary Department Rank #76\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 77,
    "title": "Apple High Value Account Filter #77",
    "difficulty": "Easy",
    "domain": "Filtering & String Functions",
    "companyTags": [
      "Apple"
    ],
    "description": "Write a query to find active users in Apple's database with spend > 500.",
    "inputTables": [
      {
        "tableName": "apple_tb_77",
        "columns": [
          {
            "name": "name",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE apple_tb_77 (id INT PRIMARY KEY, name VARCHAR(255), spend INT, status VARCHAR(50));",
    "seedDataSql": "INSERT INTO apple_tb_77 VALUES (1, 'Alice', 1200, 'active');\nINSERT INTO apple_tb_77 VALUES (2, 'Bob', 350, 'inactive');\nINSERT INTO apple_tb_77 VALUES (3, 'Charlie', 850, 'active');\nINSERT INTO apple_tb_77 VALUES (4, 'David', 400, 'active');",
    "expectedOutput": {
      "columns": [
        "id",
        "name",
        "spend"
      ],
      "rows": [
        [
          1,
          "Alice",
          1200
        ],
        [
          3,
          "Charlie",
          850
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: Use WHERE spend > 500 AND status = 'active'."
    ],
    "solutionSql": "SELECT id, name, spend FROM apple_tb_77 WHERE spend > 500 AND status = 'active' ORDER BY spend DESC;",
    "starterSql": "-- Problem #77: Apple High Value Account Filter #77\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 78,
    "title": "Apple Category Revenue Breakdown #78",
    "difficulty": "Medium",
    "domain": "Aggregations & Grouping",
    "companyTags": [
      "Apple"
    ],
    "description": "Calculate the total revenue and count for each product category in Apple's sales ledger.",
    "inputTables": [
      {
        "tableName": "apple_tb_78",
        "columns": [
          {
            "name": "order_id",
            "type": "INT"
          },
          {
            "name": "category",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE apple_tb_78 (order_id INT, category VARCHAR(255), revenue INT);",
    "seedDataSql": "INSERT INTO apple_tb_78 VALUES (101, 'Cloud', 500);\nINSERT INTO apple_tb_78 VALUES (102, 'Cloud', 300);\nINSERT INTO apple_tb_78 VALUES (103, 'Hardware', 150);\nINSERT INTO apple_tb_78 VALUES (104, 'Hardware', 250);",
    "expectedOutput": {
      "columns": [
        "category",
        "total_revenue",
        "order_count"
      ],
      "rows": [
        [
          "Cloud",
          800,
          2
        ],
        [
          "Hardware",
          400,
          2
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: GROUP BY category and SUM(revenue)."
    ],
    "solutionSql": "SELECT category, SUM(revenue) AS total_revenue, COUNT(*) AS order_count FROM apple_tb_78 GROUP BY category ORDER BY total_revenue DESC;",
    "starterSql": "-- Problem #78: Apple Category Revenue Breakdown #78\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 79,
    "title": "Apple User Order Match #79",
    "difficulty": "Hard",
    "domain": "Joins & Relational Sets",
    "companyTags": [
      "Apple"
    ],
    "description": "Join users and orders tables to find user order totals.",
    "inputTables": [
      {
        "tableName": "apple_tb_79",
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
    "inputSchemaSql": "CREATE TABLE apple_tb_79 (user_id INT, name VARCHAR(255));\nCREATE TABLE apple_tb_79_orders (order_id INT, user_id INT, amount INT);",
    "seedDataSql": "INSERT INTO apple_tb_79 VALUES (1, 'Alice');\nINSERT INTO apple_tb_79 VALUES (2, 'Bob');\nINSERT INTO apple_tb_79_orders VALUES (101, 1, 200);\nINSERT INTO apple_tb_79_orders VALUES (102, 1, 300);\nINSERT INTO apple_tb_79_orders VALUES (103, 2, 150);",
    "expectedOutput": {
      "columns": [
        "name",
        "total_amount"
      ],
      "rows": [
        [
          "Alice",
          500
        ],
        [
          "Bob",
          150
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: JOIN apple_tb_79_orders ON u.user_id = o.user_id."
    ],
    "solutionSql": "SELECT u.name, SUM(o.amount) AS total_amount FROM apple_tb_79 u JOIN apple_tb_79_orders o ON u.user_id = o.user_id GROUP BY u.name ORDER BY total_amount DESC;",
    "starterSql": "-- Problem #79: Apple User Order Match #79\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 80,
    "title": "Apple Query Optimization #80",
    "difficulty": "Expert",
    "domain": "Subqueries & CTEs",
    "companyTags": [
      "Apple"
    ],
    "description": "Find transactions with amount > 300.",
    "inputTables": [
      {
        "tableName": "apple_tb_80",
        "columns": [
          {
            "name": "tx_id",
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
    "inputSchemaSql": "CREATE TABLE apple_tb_80 (tx_id INT, amount INT);",
    "seedDataSql": "INSERT INTO apple_tb_80 VALUES (1, 500);\nINSERT INTO apple_tb_80 VALUES (2, 150);\nINSERT INTO apple_tb_80 VALUES (3, 400);",
    "expectedOutput": {
      "columns": [
        "tx_id",
        "amount"
      ],
      "rows": [
        [
          1,
          500
        ],
        [
          3,
          400
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: Filter amount > 300."
    ],
    "solutionSql": "SELECT tx_id, amount FROM apple_tb_80 WHERE amount > 300 ORDER BY amount DESC;",
    "starterSql": "-- Problem #80: Apple Query Optimization #80\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 81,
    "title": "Apple Salary Department Rank #81",
    "difficulty": "Easy",
    "domain": "Window Ranking & Ordering",
    "companyTags": [
      "Apple"
    ],
    "description": "Rank employees by salary within each department.",
    "inputTables": [
      {
        "tableName": "apple_tb_81",
        "columns": [
          {
            "name": "emp_id",
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
    "inputSchemaSql": "CREATE TABLE apple_tb_81 (emp_id INT, name VARCHAR(255), salary INT, dept VARCHAR(50));",
    "seedDataSql": "INSERT INTO apple_tb_81 VALUES (1, 'Alice', 95000, 'Engineering');\nINSERT INTO apple_tb_81 VALUES (2, 'Bob', 85000, 'Engineering');\nINSERT INTO apple_tb_81 VALUES (3, 'Charlie', 110000, 'Product');\nINSERT INTO apple_tb_81 VALUES (4, 'David', 90000, 'Product');",
    "expectedOutput": {
      "columns": [
        "emp_id",
        "name",
        "salary",
        "dept",
        "rnk"
      ],
      "rows": [
        [
          1,
          "Alice",
          95000,
          "Engineering",
          1
        ],
        [
          2,
          "Bob",
          85000,
          "Engineering",
          2
        ],
        [
          3,
          "Charlie",
          110000,
          "Product",
          1
        ],
        [
          4,
          "David",
          90000,
          "Product",
          2
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: DENSE_RANK() OVER (PARTITION BY dept ORDER BY salary DESC)."
    ],
    "solutionSql": "SELECT emp_id, name, salary, dept, DENSE_RANK() OVER (PARTITION BY dept ORDER BY salary DESC) AS rnk FROM apple_tb_81;",
    "starterSql": "-- Problem #81: Apple Salary Department Rank #81\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 82,
    "title": "Apple Previous Activity Delta #82",
    "difficulty": "Medium",
    "domain": "Window Offset Functions",
    "companyTags": [
      "Apple"
    ],
    "description": "Find previous login date using LAG() window function.",
    "inputTables": [
      {
        "tableName": "apple_tb_82",
        "columns": [
          {
            "name": "user_id",
            "type": "INT"
          },
          {
            "name": "login_date",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE apple_tb_82 (user_id INT, login_date VARCHAR(50));",
    "seedDataSql": "INSERT INTO apple_tb_82 VALUES (1, '2026-01-01');\nINSERT INTO apple_tb_82 VALUES (1, '2026-01-05');\nINSERT INTO apple_tb_82 VALUES (1, '2026-01-20');",
    "expectedOutput": {
      "columns": [
        "user_id",
        "login_date",
        "prev_login"
      ],
      "rows": [
        [
          1,
          "2026-01-01",
          null
        ],
        [
          1,
          "2026-01-05",
          "2026-01-01"
        ],
        [
          1,
          "2026-01-20",
          "2026-01-05"
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: LAG(login_date) OVER (PARTITION BY user_id ORDER BY login_date)."
    ],
    "solutionSql": "SELECT user_id, login_date, LAG(login_date) OVER (PARTITION BY user_id ORDER BY login_date) AS prev_login FROM apple_tb_82;",
    "starterSql": "-- Problem #82: Apple Previous Activity Delta #82\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 83,
    "title": "Apple 3-Day Moving Average #83",
    "difficulty": "Hard",
    "domain": "Sliding Window Aggregates",
    "companyTags": [
      "Apple"
    ],
    "description": "Calculate 3-day moving average of daily sales.",
    "inputTables": [
      {
        "tableName": "apple_tb_83",
        "columns": [
          {
            "name": "day_id",
            "type": "INT"
          },
          {
            "name": "sales",
            "type": "INT"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE apple_tb_83 (day_id INT, sales INT);",
    "seedDataSql": "INSERT INTO apple_tb_83 VALUES (1, 100);\nINSERT INTO apple_tb_83 VALUES (2, 120);\nINSERT INTO apple_tb_83 VALUES (3, 140);\nINSERT INTO apple_tb_83 VALUES (4, 110);",
    "expectedOutput": {
      "columns": [
        "day_id",
        "sales",
        "moving_avg"
      ],
      "rows": [
        [
          1,
          100,
          100.0
        ],
        [
          2,
          120,
          110.0
        ],
        [
          3,
          140,
          120.0
        ],
        [
          4,
          110,
          123.33333333333333
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: AVG(sales) OVER (ORDER BY day_id ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)."
    ],
    "solutionSql": "SELECT day_id, sales, AVG(sales) OVER (ORDER BY day_id ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) AS moving_avg FROM apple_tb_83;",
    "starterSql": "-- Problem #83: Apple 3-Day Moving Average #83\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 84,
    "title": "Apple Cohort Signups #84",
    "difficulty": "Expert",
    "domain": "Date & Time Analytics",
    "companyTags": [
      "Apple"
    ],
    "description": "Filter user signups in January 2026.",
    "inputTables": [
      {
        "tableName": "apple_tb_84",
        "columns": [
          {
            "name": "user_id",
            "type": "INT"
          },
          {
            "name": "signup_date",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE apple_tb_84 (user_id INT, signup_date VARCHAR(50));",
    "seedDataSql": "INSERT INTO apple_tb_84 VALUES (1, '2026-01-10');\nINSERT INTO apple_tb_84 VALUES (2, '2026-01-25');\nINSERT INTO apple_tb_84 VALUES (3, '2026-02-01');",
    "expectedOutput": {
      "columns": [
        "user_id",
        "signup_date"
      ],
      "rows": [
        [
          1,
          "2026-01-10"
        ],
        [
          2,
          "2026-01-25"
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: Filter signup_date LIKE '2026-01%'."
    ],
    "solutionSql": "SELECT user_id, signup_date FROM apple_tb_84 WHERE signup_date LIKE '2026-01%' ORDER BY user_id;",
    "starterSql": "-- Problem #84: Apple Cohort Signups #84\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 85,
    "title": "Apple Query Optimization #85",
    "difficulty": "Easy",
    "domain": "DDL, Constraints & Triggers",
    "companyTags": [
      "Apple"
    ],
    "description": "Find transactions with amount > 300.",
    "inputTables": [
      {
        "tableName": "apple_tb_85",
        "columns": [
          {
            "name": "tx_id",
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
    "inputSchemaSql": "CREATE TABLE apple_tb_85 (tx_id INT, amount INT);",
    "seedDataSql": "INSERT INTO apple_tb_85 VALUES (1, 500);\nINSERT INTO apple_tb_85 VALUES (2, 150);\nINSERT INTO apple_tb_85 VALUES (3, 400);",
    "expectedOutput": {
      "columns": [
        "tx_id",
        "amount"
      ],
      "rows": [
        [
          1,
          500
        ],
        [
          3,
          400
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: Filter amount > 300."
    ],
    "solutionSql": "SELECT tx_id, amount FROM apple_tb_85 WHERE amount > 300 ORDER BY amount DESC;",
    "starterSql": "-- Problem #85: Apple Query Optimization #85\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 86,
    "title": "Apple Org Hierarchy Depth #86",
    "difficulty": "Medium",
    "domain": "Recursive CTEs & Graphs",
    "companyTags": [
      "Apple"
    ],
    "description": "Find organizational depth level using recursive query.",
    "inputTables": [
      {
        "tableName": "apple_tb_86",
        "columns": [
          {
            "name": "emp_id",
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
    "inputSchemaSql": "CREATE TABLE apple_tb_86 (emp_id INT, name VARCHAR(255), manager_id INT);",
    "seedDataSql": "INSERT INTO apple_tb_86 VALUES (1, 'CEO', NULL);\nINSERT INTO apple_tb_86 VALUES (2, 'VP', 1);\nINSERT INTO apple_tb_86 VALUES (3, 'Eng', 2);",
    "expectedOutput": {
      "columns": [
        "emp_id",
        "name",
        "depth"
      ],
      "rows": [
        [
          1,
          "CEO",
          1
        ],
        [
          2,
          "VP",
          2
        ],
        [
          3,
          "Eng",
          3
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: Use WITH RECURSIVE Tree AS (...)"
    ],
    "solutionSql": "WITH RECURSIVE Tree AS (SELECT emp_id, name, 1 AS depth FROM apple_tb_86 WHERE manager_id IS NULL UNION ALL SELECT e.emp_id, e.name, t.depth + 1 FROM apple_tb_86 e JOIN Tree t ON e.manager_id = t.emp_id) SELECT emp_id, name, depth FROM Tree ORDER BY depth, emp_id;",
    "starterSql": "-- Problem #86: Apple Org Hierarchy Depth #86\n-- Write your SQL query solution below:\nWITH RECURSIVE Tree AS (\n\n)\nSELECT \nFROM Tree;"
  },
  {
    "id": 87,
    "title": "Apple High Value Account Filter #87",
    "difficulty": "Hard",
    "domain": "Filtering & String Functions",
    "companyTags": [
      "Apple"
    ],
    "description": "Write a query to find active users in Apple's database with spend > 500.",
    "inputTables": [
      {
        "tableName": "apple_tb_87",
        "columns": [
          {
            "name": "name",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE apple_tb_87 (id INT PRIMARY KEY, name VARCHAR(255), spend INT, status VARCHAR(50));",
    "seedDataSql": "INSERT INTO apple_tb_87 VALUES (1, 'Alice', 1200, 'active');\nINSERT INTO apple_tb_87 VALUES (2, 'Bob', 350, 'inactive');\nINSERT INTO apple_tb_87 VALUES (3, 'Charlie', 850, 'active');\nINSERT INTO apple_tb_87 VALUES (4, 'David', 400, 'active');",
    "expectedOutput": {
      "columns": [
        "id",
        "name",
        "spend"
      ],
      "rows": [
        [
          1,
          "Alice",
          1200
        ],
        [
          3,
          "Charlie",
          850
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: Use WHERE spend > 500 AND status = 'active'."
    ],
    "solutionSql": "SELECT id, name, spend FROM apple_tb_87 WHERE spend > 500 AND status = 'active' ORDER BY spend DESC;",
    "starterSql": "-- Problem #87: Apple High Value Account Filter #87\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 88,
    "title": "Apple Category Revenue Breakdown #88",
    "difficulty": "Expert",
    "domain": "Aggregations & Grouping",
    "companyTags": [
      "Apple"
    ],
    "description": "Calculate the total revenue and count for each product category in Apple's sales ledger.",
    "inputTables": [
      {
        "tableName": "apple_tb_88",
        "columns": [
          {
            "name": "order_id",
            "type": "INT"
          },
          {
            "name": "category",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE apple_tb_88 (order_id INT, category VARCHAR(255), revenue INT);",
    "seedDataSql": "INSERT INTO apple_tb_88 VALUES (101, 'Cloud', 500);\nINSERT INTO apple_tb_88 VALUES (102, 'Cloud', 300);\nINSERT INTO apple_tb_88 VALUES (103, 'Hardware', 150);\nINSERT INTO apple_tb_88 VALUES (104, 'Hardware', 250);",
    "expectedOutput": {
      "columns": [
        "category",
        "total_revenue",
        "order_count"
      ],
      "rows": [
        [
          "Cloud",
          800,
          2
        ],
        [
          "Hardware",
          400,
          2
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: GROUP BY category and SUM(revenue)."
    ],
    "solutionSql": "SELECT category, SUM(revenue) AS total_revenue, COUNT(*) AS order_count FROM apple_tb_88 GROUP BY category ORDER BY total_revenue DESC;",
    "starterSql": "-- Problem #88: Apple Category Revenue Breakdown #88\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 89,
    "title": "Apple User Order Match #89",
    "difficulty": "Easy",
    "domain": "Joins & Relational Sets",
    "companyTags": [
      "Apple"
    ],
    "description": "Join users and orders tables to find user order totals.",
    "inputTables": [
      {
        "tableName": "apple_tb_89",
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
    "inputSchemaSql": "CREATE TABLE apple_tb_89 (user_id INT, name VARCHAR(255));\nCREATE TABLE apple_tb_89_orders (order_id INT, user_id INT, amount INT);",
    "seedDataSql": "INSERT INTO apple_tb_89 VALUES (1, 'Alice');\nINSERT INTO apple_tb_89 VALUES (2, 'Bob');\nINSERT INTO apple_tb_89_orders VALUES (101, 1, 200);\nINSERT INTO apple_tb_89_orders VALUES (102, 1, 300);\nINSERT INTO apple_tb_89_orders VALUES (103, 2, 150);",
    "expectedOutput": {
      "columns": [
        "name",
        "total_amount"
      ],
      "rows": [
        [
          "Alice",
          500
        ],
        [
          "Bob",
          150
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: JOIN apple_tb_89_orders ON u.user_id = o.user_id."
    ],
    "solutionSql": "SELECT u.name, SUM(o.amount) AS total_amount FROM apple_tb_89 u JOIN apple_tb_89_orders o ON u.user_id = o.user_id GROUP BY u.name ORDER BY total_amount DESC;",
    "starterSql": "-- Problem #89: Apple User Order Match #89\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 90,
    "title": "Apple Query Optimization #90",
    "difficulty": "Medium",
    "domain": "Subqueries & CTEs",
    "companyTags": [
      "Apple"
    ],
    "description": "Find transactions with amount > 300.",
    "inputTables": [
      {
        "tableName": "apple_tb_90",
        "columns": [
          {
            "name": "tx_id",
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
    "inputSchemaSql": "CREATE TABLE apple_tb_90 (tx_id INT, amount INT);",
    "seedDataSql": "INSERT INTO apple_tb_90 VALUES (1, 500);\nINSERT INTO apple_tb_90 VALUES (2, 150);\nINSERT INTO apple_tb_90 VALUES (3, 400);",
    "expectedOutput": {
      "columns": [
        "tx_id",
        "amount"
      ],
      "rows": [
        [
          1,
          500
        ],
        [
          3,
          400
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: Filter amount > 300."
    ],
    "solutionSql": "SELECT tx_id, amount FROM apple_tb_90 WHERE amount > 300 ORDER BY amount DESC;",
    "starterSql": "-- Problem #90: Apple Query Optimization #90\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 91,
    "title": "Apple Salary Department Rank #91",
    "difficulty": "Hard",
    "domain": "Window Ranking & Ordering",
    "companyTags": [
      "Apple"
    ],
    "description": "Rank employees by salary within each department.",
    "inputTables": [
      {
        "tableName": "apple_tb_91",
        "columns": [
          {
            "name": "emp_id",
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
    "inputSchemaSql": "CREATE TABLE apple_tb_91 (emp_id INT, name VARCHAR(255), salary INT, dept VARCHAR(50));",
    "seedDataSql": "INSERT INTO apple_tb_91 VALUES (1, 'Alice', 95000, 'Engineering');\nINSERT INTO apple_tb_91 VALUES (2, 'Bob', 85000, 'Engineering');\nINSERT INTO apple_tb_91 VALUES (3, 'Charlie', 110000, 'Product');\nINSERT INTO apple_tb_91 VALUES (4, 'David', 90000, 'Product');",
    "expectedOutput": {
      "columns": [
        "emp_id",
        "name",
        "salary",
        "dept",
        "rnk"
      ],
      "rows": [
        [
          1,
          "Alice",
          95000,
          "Engineering",
          1
        ],
        [
          2,
          "Bob",
          85000,
          "Engineering",
          2
        ],
        [
          3,
          "Charlie",
          110000,
          "Product",
          1
        ],
        [
          4,
          "David",
          90000,
          "Product",
          2
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: DENSE_RANK() OVER (PARTITION BY dept ORDER BY salary DESC)."
    ],
    "solutionSql": "SELECT emp_id, name, salary, dept, DENSE_RANK() OVER (PARTITION BY dept ORDER BY salary DESC) AS rnk FROM apple_tb_91;",
    "starterSql": "-- Problem #91: Apple Salary Department Rank #91\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 92,
    "title": "Apple Previous Activity Delta #92",
    "difficulty": "Expert",
    "domain": "Window Offset Functions",
    "companyTags": [
      "Apple"
    ],
    "description": "Find previous login date using LAG() window function.",
    "inputTables": [
      {
        "tableName": "apple_tb_92",
        "columns": [
          {
            "name": "user_id",
            "type": "INT"
          },
          {
            "name": "login_date",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE apple_tb_92 (user_id INT, login_date VARCHAR(50));",
    "seedDataSql": "INSERT INTO apple_tb_92 VALUES (1, '2026-01-01');\nINSERT INTO apple_tb_92 VALUES (1, '2026-01-05');\nINSERT INTO apple_tb_92 VALUES (1, '2026-01-20');",
    "expectedOutput": {
      "columns": [
        "user_id",
        "login_date",
        "prev_login"
      ],
      "rows": [
        [
          1,
          "2026-01-01",
          null
        ],
        [
          1,
          "2026-01-05",
          "2026-01-01"
        ],
        [
          1,
          "2026-01-20",
          "2026-01-05"
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: LAG(login_date) OVER (PARTITION BY user_id ORDER BY login_date)."
    ],
    "solutionSql": "SELECT user_id, login_date, LAG(login_date) OVER (PARTITION BY user_id ORDER BY login_date) AS prev_login FROM apple_tb_92;",
    "starterSql": "-- Problem #92: Apple Previous Activity Delta #92\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 93,
    "title": "Apple 3-Day Moving Average #93",
    "difficulty": "Easy",
    "domain": "Sliding Window Aggregates",
    "companyTags": [
      "Apple"
    ],
    "description": "Calculate 3-day moving average of daily sales.",
    "inputTables": [
      {
        "tableName": "apple_tb_93",
        "columns": [
          {
            "name": "day_id",
            "type": "INT"
          },
          {
            "name": "sales",
            "type": "INT"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE apple_tb_93 (day_id INT, sales INT);",
    "seedDataSql": "INSERT INTO apple_tb_93 VALUES (1, 100);\nINSERT INTO apple_tb_93 VALUES (2, 120);\nINSERT INTO apple_tb_93 VALUES (3, 140);\nINSERT INTO apple_tb_93 VALUES (4, 110);",
    "expectedOutput": {
      "columns": [
        "day_id",
        "sales",
        "moving_avg"
      ],
      "rows": [
        [
          1,
          100,
          100.0
        ],
        [
          2,
          120,
          110.0
        ],
        [
          3,
          140,
          120.0
        ],
        [
          4,
          110,
          123.33333333333333
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: AVG(sales) OVER (ORDER BY day_id ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)."
    ],
    "solutionSql": "SELECT day_id, sales, AVG(sales) OVER (ORDER BY day_id ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) AS moving_avg FROM apple_tb_93;",
    "starterSql": "-- Problem #93: Apple 3-Day Moving Average #93\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 94,
    "title": "Apple Cohort Signups #94",
    "difficulty": "Medium",
    "domain": "Date & Time Analytics",
    "companyTags": [
      "Apple"
    ],
    "description": "Filter user signups in January 2026.",
    "inputTables": [
      {
        "tableName": "apple_tb_94",
        "columns": [
          {
            "name": "user_id",
            "type": "INT"
          },
          {
            "name": "signup_date",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE apple_tb_94 (user_id INT, signup_date VARCHAR(50));",
    "seedDataSql": "INSERT INTO apple_tb_94 VALUES (1, '2026-01-10');\nINSERT INTO apple_tb_94 VALUES (2, '2026-01-25');\nINSERT INTO apple_tb_94 VALUES (3, '2026-02-01');",
    "expectedOutput": {
      "columns": [
        "user_id",
        "signup_date"
      ],
      "rows": [
        [
          1,
          "2026-01-10"
        ],
        [
          2,
          "2026-01-25"
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: Filter signup_date LIKE '2026-01%'."
    ],
    "solutionSql": "SELECT user_id, signup_date FROM apple_tb_94 WHERE signup_date LIKE '2026-01%' ORDER BY user_id;",
    "starterSql": "-- Problem #94: Apple Cohort Signups #94\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 95,
    "title": "Apple Query Optimization #95",
    "difficulty": "Hard",
    "domain": "DDL, Constraints & Triggers",
    "companyTags": [
      "Apple"
    ],
    "description": "Find transactions with amount > 300.",
    "inputTables": [
      {
        "tableName": "apple_tb_95",
        "columns": [
          {
            "name": "tx_id",
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
    "inputSchemaSql": "CREATE TABLE apple_tb_95 (tx_id INT, amount INT);",
    "seedDataSql": "INSERT INTO apple_tb_95 VALUES (1, 500);\nINSERT INTO apple_tb_95 VALUES (2, 150);\nINSERT INTO apple_tb_95 VALUES (3, 400);",
    "expectedOutput": {
      "columns": [
        "tx_id",
        "amount"
      ],
      "rows": [
        [
          1,
          500
        ],
        [
          3,
          400
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: Filter amount > 300."
    ],
    "solutionSql": "SELECT tx_id, amount FROM apple_tb_95 WHERE amount > 300 ORDER BY amount DESC;",
    "starterSql": "-- Problem #95: Apple Query Optimization #95\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 96,
    "title": "Apple Org Hierarchy Depth #96",
    "difficulty": "Expert",
    "domain": "Recursive CTEs & Graphs",
    "companyTags": [
      "Apple"
    ],
    "description": "Find organizational depth level using recursive query.",
    "inputTables": [
      {
        "tableName": "apple_tb_96",
        "columns": [
          {
            "name": "emp_id",
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
    "inputSchemaSql": "CREATE TABLE apple_tb_96 (emp_id INT, name VARCHAR(255), manager_id INT);",
    "seedDataSql": "INSERT INTO apple_tb_96 VALUES (1, 'CEO', NULL);\nINSERT INTO apple_tb_96 VALUES (2, 'VP', 1);\nINSERT INTO apple_tb_96 VALUES (3, 'Eng', 2);",
    "expectedOutput": {
      "columns": [
        "emp_id",
        "name",
        "depth"
      ],
      "rows": [
        [
          1,
          "CEO",
          1
        ],
        [
          2,
          "VP",
          2
        ],
        [
          3,
          "Eng",
          3
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: Use WITH RECURSIVE Tree AS (...)"
    ],
    "solutionSql": "WITH RECURSIVE Tree AS (SELECT emp_id, name, 1 AS depth FROM apple_tb_96 WHERE manager_id IS NULL UNION ALL SELECT e.emp_id, e.name, t.depth + 1 FROM apple_tb_96 e JOIN Tree t ON e.manager_id = t.emp_id) SELECT emp_id, name, depth FROM Tree ORDER BY depth, emp_id;",
    "starterSql": "-- Problem #96: Apple Org Hierarchy Depth #96\n-- Write your SQL query solution below:\nWITH RECURSIVE Tree AS (\n\n)\nSELECT \nFROM Tree;"
  },
  {
    "id": 97,
    "title": "Apple High Value Account Filter #97",
    "difficulty": "Easy",
    "domain": "Filtering & String Functions",
    "companyTags": [
      "Apple"
    ],
    "description": "Write a query to find active users in Apple's database with spend > 500.",
    "inputTables": [
      {
        "tableName": "apple_tb_97",
        "columns": [
          {
            "name": "name",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE apple_tb_97 (id INT PRIMARY KEY, name VARCHAR(255), spend INT, status VARCHAR(50));",
    "seedDataSql": "INSERT INTO apple_tb_97 VALUES (1, 'Alice', 1200, 'active');\nINSERT INTO apple_tb_97 VALUES (2, 'Bob', 350, 'inactive');\nINSERT INTO apple_tb_97 VALUES (3, 'Charlie', 850, 'active');\nINSERT INTO apple_tb_97 VALUES (4, 'David', 400, 'active');",
    "expectedOutput": {
      "columns": [
        "id",
        "name",
        "spend"
      ],
      "rows": [
        [
          1,
          "Alice",
          1200
        ],
        [
          3,
          "Charlie",
          850
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: Use WHERE spend > 500 AND status = 'active'."
    ],
    "solutionSql": "SELECT id, name, spend FROM apple_tb_97 WHERE spend > 500 AND status = 'active' ORDER BY spend DESC;",
    "starterSql": "-- Problem #97: Apple High Value Account Filter #97\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 98,
    "title": "Apple Category Revenue Breakdown #98",
    "difficulty": "Medium",
    "domain": "Aggregations & Grouping",
    "companyTags": [
      "Apple"
    ],
    "description": "Calculate the total revenue and count for each product category in Apple's sales ledger.",
    "inputTables": [
      {
        "tableName": "apple_tb_98",
        "columns": [
          {
            "name": "order_id",
            "type": "INT"
          },
          {
            "name": "category",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE apple_tb_98 (order_id INT, category VARCHAR(255), revenue INT);",
    "seedDataSql": "INSERT INTO apple_tb_98 VALUES (101, 'Cloud', 500);\nINSERT INTO apple_tb_98 VALUES (102, 'Cloud', 300);\nINSERT INTO apple_tb_98 VALUES (103, 'Hardware', 150);\nINSERT INTO apple_tb_98 VALUES (104, 'Hardware', 250);",
    "expectedOutput": {
      "columns": [
        "category",
        "total_revenue",
        "order_count"
      ],
      "rows": [
        [
          "Cloud",
          800,
          2
        ],
        [
          "Hardware",
          400,
          2
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: GROUP BY category and SUM(revenue)."
    ],
    "solutionSql": "SELECT category, SUM(revenue) AS total_revenue, COUNT(*) AS order_count FROM apple_tb_98 GROUP BY category ORDER BY total_revenue DESC;",
    "starterSql": "-- Problem #98: Apple Category Revenue Breakdown #98\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 99,
    "title": "Apple User Order Match #99",
    "difficulty": "Hard",
    "domain": "Joins & Relational Sets",
    "companyTags": [
      "Apple"
    ],
    "description": "Join users and orders tables to find user order totals.",
    "inputTables": [
      {
        "tableName": "apple_tb_99",
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
    "inputSchemaSql": "CREATE TABLE apple_tb_99 (user_id INT, name VARCHAR(255));\nCREATE TABLE apple_tb_99_orders (order_id INT, user_id INT, amount INT);",
    "seedDataSql": "INSERT INTO apple_tb_99 VALUES (1, 'Alice');\nINSERT INTO apple_tb_99 VALUES (2, 'Bob');\nINSERT INTO apple_tb_99_orders VALUES (101, 1, 200);\nINSERT INTO apple_tb_99_orders VALUES (102, 1, 300);\nINSERT INTO apple_tb_99_orders VALUES (103, 2, 150);",
    "expectedOutput": {
      "columns": [
        "name",
        "total_amount"
      ],
      "rows": [
        [
          "Alice",
          500
        ],
        [
          "Bob",
          150
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: JOIN apple_tb_99_orders ON u.user_id = o.user_id."
    ],
    "solutionSql": "SELECT u.name, SUM(o.amount) AS total_amount FROM apple_tb_99 u JOIN apple_tb_99_orders o ON u.user_id = o.user_id GROUP BY u.name ORDER BY total_amount DESC;",
    "starterSql": "-- Problem #99: Apple User Order Match #99\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 100,
    "title": "Apple Query Optimization #100",
    "difficulty": "Expert",
    "domain": "Subqueries & CTEs",
    "companyTags": [
      "Apple"
    ],
    "description": "Find transactions with amount > 300.",
    "inputTables": [
      {
        "tableName": "apple_tb_100",
        "columns": [
          {
            "name": "tx_id",
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
    "inputSchemaSql": "CREATE TABLE apple_tb_100 (tx_id INT, amount INT);",
    "seedDataSql": "INSERT INTO apple_tb_100 VALUES (1, 500);\nINSERT INTO apple_tb_100 VALUES (2, 150);\nINSERT INTO apple_tb_100 VALUES (3, 400);",
    "expectedOutput": {
      "columns": [
        "tx_id",
        "amount"
      ],
      "rows": [
        [
          1,
          500
        ],
        [
          3,
          400
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: Filter amount > 300."
    ],
    "solutionSql": "SELECT tx_id, amount FROM apple_tb_100 WHERE amount > 300 ORDER BY amount DESC;",
    "starterSql": "-- Problem #100: Apple Query Optimization #100\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 101,
    "title": "Apple Salary Department Rank #101",
    "difficulty": "Easy",
    "domain": "Window Ranking & Ordering",
    "companyTags": [
      "Apple"
    ],
    "description": "Rank employees by salary within each department.",
    "inputTables": [
      {
        "tableName": "apple_tb_101",
        "columns": [
          {
            "name": "emp_id",
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
    "inputSchemaSql": "CREATE TABLE apple_tb_101 (emp_id INT, name VARCHAR(255), salary INT, dept VARCHAR(50));",
    "seedDataSql": "INSERT INTO apple_tb_101 VALUES (1, 'Alice', 95000, 'Engineering');\nINSERT INTO apple_tb_101 VALUES (2, 'Bob', 85000, 'Engineering');\nINSERT INTO apple_tb_101 VALUES (3, 'Charlie', 110000, 'Product');\nINSERT INTO apple_tb_101 VALUES (4, 'David', 90000, 'Product');",
    "expectedOutput": {
      "columns": [
        "emp_id",
        "name",
        "salary",
        "dept",
        "rnk"
      ],
      "rows": [
        [
          1,
          "Alice",
          95000,
          "Engineering",
          1
        ],
        [
          2,
          "Bob",
          85000,
          "Engineering",
          2
        ],
        [
          3,
          "Charlie",
          110000,
          "Product",
          1
        ],
        [
          4,
          "David",
          90000,
          "Product",
          2
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: DENSE_RANK() OVER (PARTITION BY dept ORDER BY salary DESC)."
    ],
    "solutionSql": "SELECT emp_id, name, salary, dept, DENSE_RANK() OVER (PARTITION BY dept ORDER BY salary DESC) AS rnk FROM apple_tb_101;",
    "starterSql": "-- Problem #101: Apple Salary Department Rank #101\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 102,
    "title": "Microsoft High Value Account Filter #102",
    "difficulty": "Easy",
    "domain": "Filtering & String Functions",
    "companyTags": [
      "Microsoft"
    ],
    "description": "Write a query to find active users in Microsoft's database with spend > 500.",
    "inputTables": [
      {
        "tableName": "microsoft_tb_102",
        "columns": [
          {
            "name": "name",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE microsoft_tb_102 (id INT PRIMARY KEY, name VARCHAR(255), spend INT, status VARCHAR(50));",
    "seedDataSql": "INSERT INTO microsoft_tb_102 VALUES (1, 'Alice', 1200, 'active');\nINSERT INTO microsoft_tb_102 VALUES (2, 'Bob', 350, 'inactive');\nINSERT INTO microsoft_tb_102 VALUES (3, 'Charlie', 850, 'active');\nINSERT INTO microsoft_tb_102 VALUES (4, 'David', 400, 'active');",
    "expectedOutput": {
      "columns": [
        "id",
        "name",
        "spend"
      ],
      "rows": [
        [
          1,
          "Alice",
          1200
        ],
        [
          3,
          "Charlie",
          850
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: Use WHERE spend > 500 AND status = 'active'."
    ],
    "solutionSql": "SELECT id, name, spend FROM microsoft_tb_102 WHERE spend > 500 AND status = 'active' ORDER BY spend DESC;",
    "starterSql": "-- Problem #102: Microsoft High Value Account Filter #102\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 103,
    "title": "Microsoft Category Revenue Breakdown #103",
    "difficulty": "Medium",
    "domain": "Aggregations & Grouping",
    "companyTags": [
      "Microsoft"
    ],
    "description": "Calculate the total revenue and count for each product category in Microsoft's sales ledger.",
    "inputTables": [
      {
        "tableName": "microsoft_tb_103",
        "columns": [
          {
            "name": "order_id",
            "type": "INT"
          },
          {
            "name": "category",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE microsoft_tb_103 (order_id INT, category VARCHAR(255), revenue INT);",
    "seedDataSql": "INSERT INTO microsoft_tb_103 VALUES (101, 'Cloud', 500);\nINSERT INTO microsoft_tb_103 VALUES (102, 'Cloud', 300);\nINSERT INTO microsoft_tb_103 VALUES (103, 'Hardware', 150);\nINSERT INTO microsoft_tb_103 VALUES (104, 'Hardware', 250);",
    "expectedOutput": {
      "columns": [
        "category",
        "total_revenue",
        "order_count"
      ],
      "rows": [
        [
          "Cloud",
          800,
          2
        ],
        [
          "Hardware",
          400,
          2
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: GROUP BY category and SUM(revenue)."
    ],
    "solutionSql": "SELECT category, SUM(revenue) AS total_revenue, COUNT(*) AS order_count FROM microsoft_tb_103 GROUP BY category ORDER BY total_revenue DESC;",
    "starterSql": "-- Problem #103: Microsoft Category Revenue Breakdown #103\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 104,
    "title": "Microsoft User Order Match #104",
    "difficulty": "Hard",
    "domain": "Joins & Relational Sets",
    "companyTags": [
      "Microsoft"
    ],
    "description": "Join users and orders tables to find user order totals.",
    "inputTables": [
      {
        "tableName": "microsoft_tb_104",
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
    "inputSchemaSql": "CREATE TABLE microsoft_tb_104 (user_id INT, name VARCHAR(255));\nCREATE TABLE microsoft_tb_104_orders (order_id INT, user_id INT, amount INT);",
    "seedDataSql": "INSERT INTO microsoft_tb_104 VALUES (1, 'Alice');\nINSERT INTO microsoft_tb_104 VALUES (2, 'Bob');\nINSERT INTO microsoft_tb_104_orders VALUES (101, 1, 200);\nINSERT INTO microsoft_tb_104_orders VALUES (102, 1, 300);\nINSERT INTO microsoft_tb_104_orders VALUES (103, 2, 150);",
    "expectedOutput": {
      "columns": [
        "name",
        "total_amount"
      ],
      "rows": [
        [
          "Alice",
          500
        ],
        [
          "Bob",
          150
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: JOIN microsoft_tb_104_orders ON u.user_id = o.user_id."
    ],
    "solutionSql": "SELECT u.name, SUM(o.amount) AS total_amount FROM microsoft_tb_104 u JOIN microsoft_tb_104_orders o ON u.user_id = o.user_id GROUP BY u.name ORDER BY total_amount DESC;",
    "starterSql": "-- Problem #104: Microsoft User Order Match #104\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 105,
    "title": "Microsoft Query Optimization #105",
    "difficulty": "Expert",
    "domain": "Subqueries & CTEs",
    "companyTags": [
      "Microsoft"
    ],
    "description": "Find transactions with amount > 300.",
    "inputTables": [
      {
        "tableName": "microsoft_tb_105",
        "columns": [
          {
            "name": "tx_id",
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
    "inputSchemaSql": "CREATE TABLE microsoft_tb_105 (tx_id INT, amount INT);",
    "seedDataSql": "INSERT INTO microsoft_tb_105 VALUES (1, 500);\nINSERT INTO microsoft_tb_105 VALUES (2, 150);\nINSERT INTO microsoft_tb_105 VALUES (3, 400);",
    "expectedOutput": {
      "columns": [
        "tx_id",
        "amount"
      ],
      "rows": [
        [
          1,
          500
        ],
        [
          3,
          400
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: Filter amount > 300."
    ],
    "solutionSql": "SELECT tx_id, amount FROM microsoft_tb_105 WHERE amount > 300 ORDER BY amount DESC;",
    "starterSql": "-- Problem #105: Microsoft Query Optimization #105\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 106,
    "title": "Microsoft Salary Department Rank #106",
    "difficulty": "Easy",
    "domain": "Window Ranking & Ordering",
    "companyTags": [
      "Microsoft"
    ],
    "description": "Rank employees by salary within each department.",
    "inputTables": [
      {
        "tableName": "microsoft_tb_106",
        "columns": [
          {
            "name": "emp_id",
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
    "inputSchemaSql": "CREATE TABLE microsoft_tb_106 (emp_id INT, name VARCHAR(255), salary INT, dept VARCHAR(50));",
    "seedDataSql": "INSERT INTO microsoft_tb_106 VALUES (1, 'Alice', 95000, 'Engineering');\nINSERT INTO microsoft_tb_106 VALUES (2, 'Bob', 85000, 'Engineering');\nINSERT INTO microsoft_tb_106 VALUES (3, 'Charlie', 110000, 'Product');\nINSERT INTO microsoft_tb_106 VALUES (4, 'David', 90000, 'Product');",
    "expectedOutput": {
      "columns": [
        "emp_id",
        "name",
        "salary",
        "dept",
        "rnk"
      ],
      "rows": [
        [
          1,
          "Alice",
          95000,
          "Engineering",
          1
        ],
        [
          2,
          "Bob",
          85000,
          "Engineering",
          2
        ],
        [
          3,
          "Charlie",
          110000,
          "Product",
          1
        ],
        [
          4,
          "David",
          90000,
          "Product",
          2
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: DENSE_RANK() OVER (PARTITION BY dept ORDER BY salary DESC)."
    ],
    "solutionSql": "SELECT emp_id, name, salary, dept, DENSE_RANK() OVER (PARTITION BY dept ORDER BY salary DESC) AS rnk FROM microsoft_tb_106;",
    "starterSql": "-- Problem #106: Microsoft Salary Department Rank #106\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 107,
    "title": "Microsoft Previous Activity Delta #107",
    "difficulty": "Medium",
    "domain": "Window Offset Functions",
    "companyTags": [
      "Microsoft"
    ],
    "description": "Find previous login date using LAG() window function.",
    "inputTables": [
      {
        "tableName": "microsoft_tb_107",
        "columns": [
          {
            "name": "user_id",
            "type": "INT"
          },
          {
            "name": "login_date",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE microsoft_tb_107 (user_id INT, login_date VARCHAR(50));",
    "seedDataSql": "INSERT INTO microsoft_tb_107 VALUES (1, '2026-01-01');\nINSERT INTO microsoft_tb_107 VALUES (1, '2026-01-05');\nINSERT INTO microsoft_tb_107 VALUES (1, '2026-01-20');",
    "expectedOutput": {
      "columns": [
        "user_id",
        "login_date",
        "prev_login"
      ],
      "rows": [
        [
          1,
          "2026-01-01",
          null
        ],
        [
          1,
          "2026-01-05",
          "2026-01-01"
        ],
        [
          1,
          "2026-01-20",
          "2026-01-05"
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: LAG(login_date) OVER (PARTITION BY user_id ORDER BY login_date)."
    ],
    "solutionSql": "SELECT user_id, login_date, LAG(login_date) OVER (PARTITION BY user_id ORDER BY login_date) AS prev_login FROM microsoft_tb_107;",
    "starterSql": "-- Problem #107: Microsoft Previous Activity Delta #107\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 108,
    "title": "Microsoft 3-Day Moving Average #108",
    "difficulty": "Hard",
    "domain": "Sliding Window Aggregates",
    "companyTags": [
      "Microsoft"
    ],
    "description": "Calculate 3-day moving average of daily sales.",
    "inputTables": [
      {
        "tableName": "microsoft_tb_108",
        "columns": [
          {
            "name": "day_id",
            "type": "INT"
          },
          {
            "name": "sales",
            "type": "INT"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE microsoft_tb_108 (day_id INT, sales INT);",
    "seedDataSql": "INSERT INTO microsoft_tb_108 VALUES (1, 100);\nINSERT INTO microsoft_tb_108 VALUES (2, 120);\nINSERT INTO microsoft_tb_108 VALUES (3, 140);\nINSERT INTO microsoft_tb_108 VALUES (4, 110);",
    "expectedOutput": {
      "columns": [
        "day_id",
        "sales",
        "moving_avg"
      ],
      "rows": [
        [
          1,
          100,
          100.0
        ],
        [
          2,
          120,
          110.0
        ],
        [
          3,
          140,
          120.0
        ],
        [
          4,
          110,
          123.33333333333333
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: AVG(sales) OVER (ORDER BY day_id ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)."
    ],
    "solutionSql": "SELECT day_id, sales, AVG(sales) OVER (ORDER BY day_id ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) AS moving_avg FROM microsoft_tb_108;",
    "starterSql": "-- Problem #108: Microsoft 3-Day Moving Average #108\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 109,
    "title": "Microsoft Cohort Signups #109",
    "difficulty": "Expert",
    "domain": "Date & Time Analytics",
    "companyTags": [
      "Microsoft"
    ],
    "description": "Filter user signups in January 2026.",
    "inputTables": [
      {
        "tableName": "microsoft_tb_109",
        "columns": [
          {
            "name": "user_id",
            "type": "INT"
          },
          {
            "name": "signup_date",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE microsoft_tb_109 (user_id INT, signup_date VARCHAR(50));",
    "seedDataSql": "INSERT INTO microsoft_tb_109 VALUES (1, '2026-01-10');\nINSERT INTO microsoft_tb_109 VALUES (2, '2026-01-25');\nINSERT INTO microsoft_tb_109 VALUES (3, '2026-02-01');",
    "expectedOutput": {
      "columns": [
        "user_id",
        "signup_date"
      ],
      "rows": [
        [
          1,
          "2026-01-10"
        ],
        [
          2,
          "2026-01-25"
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: Filter signup_date LIKE '2026-01%'."
    ],
    "solutionSql": "SELECT user_id, signup_date FROM microsoft_tb_109 WHERE signup_date LIKE '2026-01%' ORDER BY user_id;",
    "starterSql": "-- Problem #109: Microsoft Cohort Signups #109\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 110,
    "title": "Microsoft Query Optimization #110",
    "difficulty": "Easy",
    "domain": "DDL, Constraints & Triggers",
    "companyTags": [
      "Microsoft"
    ],
    "description": "Find transactions with amount > 300.",
    "inputTables": [
      {
        "tableName": "microsoft_tb_110",
        "columns": [
          {
            "name": "tx_id",
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
    "inputSchemaSql": "CREATE TABLE microsoft_tb_110 (tx_id INT, amount INT);",
    "seedDataSql": "INSERT INTO microsoft_tb_110 VALUES (1, 500);\nINSERT INTO microsoft_tb_110 VALUES (2, 150);\nINSERT INTO microsoft_tb_110 VALUES (3, 400);",
    "expectedOutput": {
      "columns": [
        "tx_id",
        "amount"
      ],
      "rows": [
        [
          1,
          500
        ],
        [
          3,
          400
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: Filter amount > 300."
    ],
    "solutionSql": "SELECT tx_id, amount FROM microsoft_tb_110 WHERE amount > 300 ORDER BY amount DESC;",
    "starterSql": "-- Problem #110: Microsoft Query Optimization #110\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 111,
    "title": "Microsoft Org Hierarchy Depth #111",
    "difficulty": "Medium",
    "domain": "Recursive CTEs & Graphs",
    "companyTags": [
      "Microsoft"
    ],
    "description": "Find organizational depth level using recursive query.",
    "inputTables": [
      {
        "tableName": "microsoft_tb_111",
        "columns": [
          {
            "name": "emp_id",
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
    "inputSchemaSql": "CREATE TABLE microsoft_tb_111 (emp_id INT, name VARCHAR(255), manager_id INT);",
    "seedDataSql": "INSERT INTO microsoft_tb_111 VALUES (1, 'CEO', NULL);\nINSERT INTO microsoft_tb_111 VALUES (2, 'VP', 1);\nINSERT INTO microsoft_tb_111 VALUES (3, 'Eng', 2);",
    "expectedOutput": {
      "columns": [
        "emp_id",
        "name",
        "depth"
      ],
      "rows": [
        [
          1,
          "CEO",
          1
        ],
        [
          2,
          "VP",
          2
        ],
        [
          3,
          "Eng",
          3
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: Use WITH RECURSIVE Tree AS (...)"
    ],
    "solutionSql": "WITH RECURSIVE Tree AS (SELECT emp_id, name, 1 AS depth FROM microsoft_tb_111 WHERE manager_id IS NULL UNION ALL SELECT e.emp_id, e.name, t.depth + 1 FROM microsoft_tb_111 e JOIN Tree t ON e.manager_id = t.emp_id) SELECT emp_id, name, depth FROM Tree ORDER BY depth, emp_id;",
    "starterSql": "-- Problem #111: Microsoft Org Hierarchy Depth #111\n-- Write your SQL query solution below:\nWITH RECURSIVE Tree AS (\n\n)\nSELECT \nFROM Tree;"
  },
  {
    "id": 112,
    "title": "Microsoft High Value Account Filter #112",
    "difficulty": "Hard",
    "domain": "Filtering & String Functions",
    "companyTags": [
      "Microsoft"
    ],
    "description": "Write a query to find active users in Microsoft's database with spend > 500.",
    "inputTables": [
      {
        "tableName": "microsoft_tb_112",
        "columns": [
          {
            "name": "name",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE microsoft_tb_112 (id INT PRIMARY KEY, name VARCHAR(255), spend INT, status VARCHAR(50));",
    "seedDataSql": "INSERT INTO microsoft_tb_112 VALUES (1, 'Alice', 1200, 'active');\nINSERT INTO microsoft_tb_112 VALUES (2, 'Bob', 350, 'inactive');\nINSERT INTO microsoft_tb_112 VALUES (3, 'Charlie', 850, 'active');\nINSERT INTO microsoft_tb_112 VALUES (4, 'David', 400, 'active');",
    "expectedOutput": {
      "columns": [
        "id",
        "name",
        "spend"
      ],
      "rows": [
        [
          1,
          "Alice",
          1200
        ],
        [
          3,
          "Charlie",
          850
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: Use WHERE spend > 500 AND status = 'active'."
    ],
    "solutionSql": "SELECT id, name, spend FROM microsoft_tb_112 WHERE spend > 500 AND status = 'active' ORDER BY spend DESC;",
    "starterSql": "-- Problem #112: Microsoft High Value Account Filter #112\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 113,
    "title": "Microsoft Category Revenue Breakdown #113",
    "difficulty": "Expert",
    "domain": "Aggregations & Grouping",
    "companyTags": [
      "Microsoft"
    ],
    "description": "Calculate the total revenue and count for each product category in Microsoft's sales ledger.",
    "inputTables": [
      {
        "tableName": "microsoft_tb_113",
        "columns": [
          {
            "name": "order_id",
            "type": "INT"
          },
          {
            "name": "category",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE microsoft_tb_113 (order_id INT, category VARCHAR(255), revenue INT);",
    "seedDataSql": "INSERT INTO microsoft_tb_113 VALUES (101, 'Cloud', 500);\nINSERT INTO microsoft_tb_113 VALUES (102, 'Cloud', 300);\nINSERT INTO microsoft_tb_113 VALUES (103, 'Hardware', 150);\nINSERT INTO microsoft_tb_113 VALUES (104, 'Hardware', 250);",
    "expectedOutput": {
      "columns": [
        "category",
        "total_revenue",
        "order_count"
      ],
      "rows": [
        [
          "Cloud",
          800,
          2
        ],
        [
          "Hardware",
          400,
          2
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: GROUP BY category and SUM(revenue)."
    ],
    "solutionSql": "SELECT category, SUM(revenue) AS total_revenue, COUNT(*) AS order_count FROM microsoft_tb_113 GROUP BY category ORDER BY total_revenue DESC;",
    "starterSql": "-- Problem #113: Microsoft Category Revenue Breakdown #113\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 114,
    "title": "Microsoft User Order Match #114",
    "difficulty": "Easy",
    "domain": "Joins & Relational Sets",
    "companyTags": [
      "Microsoft"
    ],
    "description": "Join users and orders tables to find user order totals.",
    "inputTables": [
      {
        "tableName": "microsoft_tb_114",
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
    "inputSchemaSql": "CREATE TABLE microsoft_tb_114 (user_id INT, name VARCHAR(255));\nCREATE TABLE microsoft_tb_114_orders (order_id INT, user_id INT, amount INT);",
    "seedDataSql": "INSERT INTO microsoft_tb_114 VALUES (1, 'Alice');\nINSERT INTO microsoft_tb_114 VALUES (2, 'Bob');\nINSERT INTO microsoft_tb_114_orders VALUES (101, 1, 200);\nINSERT INTO microsoft_tb_114_orders VALUES (102, 1, 300);\nINSERT INTO microsoft_tb_114_orders VALUES (103, 2, 150);",
    "expectedOutput": {
      "columns": [
        "name",
        "total_amount"
      ],
      "rows": [
        [
          "Alice",
          500
        ],
        [
          "Bob",
          150
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: JOIN microsoft_tb_114_orders ON u.user_id = o.user_id."
    ],
    "solutionSql": "SELECT u.name, SUM(o.amount) AS total_amount FROM microsoft_tb_114 u JOIN microsoft_tb_114_orders o ON u.user_id = o.user_id GROUP BY u.name ORDER BY total_amount DESC;",
    "starterSql": "-- Problem #114: Microsoft User Order Match #114\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 115,
    "title": "Microsoft Query Optimization #115",
    "difficulty": "Medium",
    "domain": "Subqueries & CTEs",
    "companyTags": [
      "Microsoft"
    ],
    "description": "Find transactions with amount > 300.",
    "inputTables": [
      {
        "tableName": "microsoft_tb_115",
        "columns": [
          {
            "name": "tx_id",
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
    "inputSchemaSql": "CREATE TABLE microsoft_tb_115 (tx_id INT, amount INT);",
    "seedDataSql": "INSERT INTO microsoft_tb_115 VALUES (1, 500);\nINSERT INTO microsoft_tb_115 VALUES (2, 150);\nINSERT INTO microsoft_tb_115 VALUES (3, 400);",
    "expectedOutput": {
      "columns": [
        "tx_id",
        "amount"
      ],
      "rows": [
        [
          1,
          500
        ],
        [
          3,
          400
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: Filter amount > 300."
    ],
    "solutionSql": "SELECT tx_id, amount FROM microsoft_tb_115 WHERE amount > 300 ORDER BY amount DESC;",
    "starterSql": "-- Problem #115: Microsoft Query Optimization #115\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 116,
    "title": "Microsoft Salary Department Rank #116",
    "difficulty": "Hard",
    "domain": "Window Ranking & Ordering",
    "companyTags": [
      "Microsoft"
    ],
    "description": "Rank employees by salary within each department.",
    "inputTables": [
      {
        "tableName": "microsoft_tb_116",
        "columns": [
          {
            "name": "emp_id",
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
    "inputSchemaSql": "CREATE TABLE microsoft_tb_116 (emp_id INT, name VARCHAR(255), salary INT, dept VARCHAR(50));",
    "seedDataSql": "INSERT INTO microsoft_tb_116 VALUES (1, 'Alice', 95000, 'Engineering');\nINSERT INTO microsoft_tb_116 VALUES (2, 'Bob', 85000, 'Engineering');\nINSERT INTO microsoft_tb_116 VALUES (3, 'Charlie', 110000, 'Product');\nINSERT INTO microsoft_tb_116 VALUES (4, 'David', 90000, 'Product');",
    "expectedOutput": {
      "columns": [
        "emp_id",
        "name",
        "salary",
        "dept",
        "rnk"
      ],
      "rows": [
        [
          1,
          "Alice",
          95000,
          "Engineering",
          1
        ],
        [
          2,
          "Bob",
          85000,
          "Engineering",
          2
        ],
        [
          3,
          "Charlie",
          110000,
          "Product",
          1
        ],
        [
          4,
          "David",
          90000,
          "Product",
          2
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: DENSE_RANK() OVER (PARTITION BY dept ORDER BY salary DESC)."
    ],
    "solutionSql": "SELECT emp_id, name, salary, dept, DENSE_RANK() OVER (PARTITION BY dept ORDER BY salary DESC) AS rnk FROM microsoft_tb_116;",
    "starterSql": "-- Problem #116: Microsoft Salary Department Rank #116\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 117,
    "title": "Microsoft Previous Activity Delta #117",
    "difficulty": "Expert",
    "domain": "Window Offset Functions",
    "companyTags": [
      "Microsoft"
    ],
    "description": "Find previous login date using LAG() window function.",
    "inputTables": [
      {
        "tableName": "microsoft_tb_117",
        "columns": [
          {
            "name": "user_id",
            "type": "INT"
          },
          {
            "name": "login_date",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE microsoft_tb_117 (user_id INT, login_date VARCHAR(50));",
    "seedDataSql": "INSERT INTO microsoft_tb_117 VALUES (1, '2026-01-01');\nINSERT INTO microsoft_tb_117 VALUES (1, '2026-01-05');\nINSERT INTO microsoft_tb_117 VALUES (1, '2026-01-20');",
    "expectedOutput": {
      "columns": [
        "user_id",
        "login_date",
        "prev_login"
      ],
      "rows": [
        [
          1,
          "2026-01-01",
          null
        ],
        [
          1,
          "2026-01-05",
          "2026-01-01"
        ],
        [
          1,
          "2026-01-20",
          "2026-01-05"
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: LAG(login_date) OVER (PARTITION BY user_id ORDER BY login_date)."
    ],
    "solutionSql": "SELECT user_id, login_date, LAG(login_date) OVER (PARTITION BY user_id ORDER BY login_date) AS prev_login FROM microsoft_tb_117;",
    "starterSql": "-- Problem #117: Microsoft Previous Activity Delta #117\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 118,
    "title": "Microsoft 3-Day Moving Average #118",
    "difficulty": "Easy",
    "domain": "Sliding Window Aggregates",
    "companyTags": [
      "Microsoft"
    ],
    "description": "Calculate 3-day moving average of daily sales.",
    "inputTables": [
      {
        "tableName": "microsoft_tb_118",
        "columns": [
          {
            "name": "day_id",
            "type": "INT"
          },
          {
            "name": "sales",
            "type": "INT"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE microsoft_tb_118 (day_id INT, sales INT);",
    "seedDataSql": "INSERT INTO microsoft_tb_118 VALUES (1, 100);\nINSERT INTO microsoft_tb_118 VALUES (2, 120);\nINSERT INTO microsoft_tb_118 VALUES (3, 140);\nINSERT INTO microsoft_tb_118 VALUES (4, 110);",
    "expectedOutput": {
      "columns": [
        "day_id",
        "sales",
        "moving_avg"
      ],
      "rows": [
        [
          1,
          100,
          100.0
        ],
        [
          2,
          120,
          110.0
        ],
        [
          3,
          140,
          120.0
        ],
        [
          4,
          110,
          123.33333333333333
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: AVG(sales) OVER (ORDER BY day_id ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)."
    ],
    "solutionSql": "SELECT day_id, sales, AVG(sales) OVER (ORDER BY day_id ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) AS moving_avg FROM microsoft_tb_118;",
    "starterSql": "-- Problem #118: Microsoft 3-Day Moving Average #118\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 119,
    "title": "Microsoft Cohort Signups #119",
    "difficulty": "Medium",
    "domain": "Date & Time Analytics",
    "companyTags": [
      "Microsoft"
    ],
    "description": "Filter user signups in January 2026.",
    "inputTables": [
      {
        "tableName": "microsoft_tb_119",
        "columns": [
          {
            "name": "user_id",
            "type": "INT"
          },
          {
            "name": "signup_date",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE microsoft_tb_119 (user_id INT, signup_date VARCHAR(50));",
    "seedDataSql": "INSERT INTO microsoft_tb_119 VALUES (1, '2026-01-10');\nINSERT INTO microsoft_tb_119 VALUES (2, '2026-01-25');\nINSERT INTO microsoft_tb_119 VALUES (3, '2026-02-01');",
    "expectedOutput": {
      "columns": [
        "user_id",
        "signup_date"
      ],
      "rows": [
        [
          1,
          "2026-01-10"
        ],
        [
          2,
          "2026-01-25"
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: Filter signup_date LIKE '2026-01%'."
    ],
    "solutionSql": "SELECT user_id, signup_date FROM microsoft_tb_119 WHERE signup_date LIKE '2026-01%' ORDER BY user_id;",
    "starterSql": "-- Problem #119: Microsoft Cohort Signups #119\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 120,
    "title": "Microsoft Query Optimization #120",
    "difficulty": "Hard",
    "domain": "DDL, Constraints & Triggers",
    "companyTags": [
      "Microsoft"
    ],
    "description": "Find transactions with amount > 300.",
    "inputTables": [
      {
        "tableName": "microsoft_tb_120",
        "columns": [
          {
            "name": "tx_id",
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
    "inputSchemaSql": "CREATE TABLE microsoft_tb_120 (tx_id INT, amount INT);",
    "seedDataSql": "INSERT INTO microsoft_tb_120 VALUES (1, 500);\nINSERT INTO microsoft_tb_120 VALUES (2, 150);\nINSERT INTO microsoft_tb_120 VALUES (3, 400);",
    "expectedOutput": {
      "columns": [
        "tx_id",
        "amount"
      ],
      "rows": [
        [
          1,
          500
        ],
        [
          3,
          400
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: Filter amount > 300."
    ],
    "solutionSql": "SELECT tx_id, amount FROM microsoft_tb_120 WHERE amount > 300 ORDER BY amount DESC;",
    "starterSql": "-- Problem #120: Microsoft Query Optimization #120\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 121,
    "title": "Microsoft Org Hierarchy Depth #121",
    "difficulty": "Expert",
    "domain": "Recursive CTEs & Graphs",
    "companyTags": [
      "Microsoft"
    ],
    "description": "Find organizational depth level using recursive query.",
    "inputTables": [
      {
        "tableName": "microsoft_tb_121",
        "columns": [
          {
            "name": "emp_id",
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
    "inputSchemaSql": "CREATE TABLE microsoft_tb_121 (emp_id INT, name VARCHAR(255), manager_id INT);",
    "seedDataSql": "INSERT INTO microsoft_tb_121 VALUES (1, 'CEO', NULL);\nINSERT INTO microsoft_tb_121 VALUES (2, 'VP', 1);\nINSERT INTO microsoft_tb_121 VALUES (3, 'Eng', 2);",
    "expectedOutput": {
      "columns": [
        "emp_id",
        "name",
        "depth"
      ],
      "rows": [
        [
          1,
          "CEO",
          1
        ],
        [
          2,
          "VP",
          2
        ],
        [
          3,
          "Eng",
          3
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: Use WITH RECURSIVE Tree AS (...)"
    ],
    "solutionSql": "WITH RECURSIVE Tree AS (SELECT emp_id, name, 1 AS depth FROM microsoft_tb_121 WHERE manager_id IS NULL UNION ALL SELECT e.emp_id, e.name, t.depth + 1 FROM microsoft_tb_121 e JOIN Tree t ON e.manager_id = t.emp_id) SELECT emp_id, name, depth FROM Tree ORDER BY depth, emp_id;",
    "starterSql": "-- Problem #121: Microsoft Org Hierarchy Depth #121\n-- Write your SQL query solution below:\nWITH RECURSIVE Tree AS (\n\n)\nSELECT \nFROM Tree;"
  },
  {
    "id": 122,
    "title": "Microsoft High Value Account Filter #122",
    "difficulty": "Easy",
    "domain": "Filtering & String Functions",
    "companyTags": [
      "Microsoft"
    ],
    "description": "Write a query to find active users in Microsoft's database with spend > 500.",
    "inputTables": [
      {
        "tableName": "microsoft_tb_122",
        "columns": [
          {
            "name": "name",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE microsoft_tb_122 (id INT PRIMARY KEY, name VARCHAR(255), spend INT, status VARCHAR(50));",
    "seedDataSql": "INSERT INTO microsoft_tb_122 VALUES (1, 'Alice', 1200, 'active');\nINSERT INTO microsoft_tb_122 VALUES (2, 'Bob', 350, 'inactive');\nINSERT INTO microsoft_tb_122 VALUES (3, 'Charlie', 850, 'active');\nINSERT INTO microsoft_tb_122 VALUES (4, 'David', 400, 'active');",
    "expectedOutput": {
      "columns": [
        "id",
        "name",
        "spend"
      ],
      "rows": [
        [
          1,
          "Alice",
          1200
        ],
        [
          3,
          "Charlie",
          850
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: Use WHERE spend > 500 AND status = 'active'."
    ],
    "solutionSql": "SELECT id, name, spend FROM microsoft_tb_122 WHERE spend > 500 AND status = 'active' ORDER BY spend DESC;",
    "starterSql": "-- Problem #122: Microsoft High Value Account Filter #122\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 123,
    "title": "Microsoft Category Revenue Breakdown #123",
    "difficulty": "Medium",
    "domain": "Aggregations & Grouping",
    "companyTags": [
      "Microsoft"
    ],
    "description": "Calculate the total revenue and count for each product category in Microsoft's sales ledger.",
    "inputTables": [
      {
        "tableName": "microsoft_tb_123",
        "columns": [
          {
            "name": "order_id",
            "type": "INT"
          },
          {
            "name": "category",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE microsoft_tb_123 (order_id INT, category VARCHAR(255), revenue INT);",
    "seedDataSql": "INSERT INTO microsoft_tb_123 VALUES (101, 'Cloud', 500);\nINSERT INTO microsoft_tb_123 VALUES (102, 'Cloud', 300);\nINSERT INTO microsoft_tb_123 VALUES (103, 'Hardware', 150);\nINSERT INTO microsoft_tb_123 VALUES (104, 'Hardware', 250);",
    "expectedOutput": {
      "columns": [
        "category",
        "total_revenue",
        "order_count"
      ],
      "rows": [
        [
          "Cloud",
          800,
          2
        ],
        [
          "Hardware",
          400,
          2
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: GROUP BY category and SUM(revenue)."
    ],
    "solutionSql": "SELECT category, SUM(revenue) AS total_revenue, COUNT(*) AS order_count FROM microsoft_tb_123 GROUP BY category ORDER BY total_revenue DESC;",
    "starterSql": "-- Problem #123: Microsoft Category Revenue Breakdown #123\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 124,
    "title": "Microsoft User Order Match #124",
    "difficulty": "Hard",
    "domain": "Joins & Relational Sets",
    "companyTags": [
      "Microsoft"
    ],
    "description": "Join users and orders tables to find user order totals.",
    "inputTables": [
      {
        "tableName": "microsoft_tb_124",
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
    "inputSchemaSql": "CREATE TABLE microsoft_tb_124 (user_id INT, name VARCHAR(255));\nCREATE TABLE microsoft_tb_124_orders (order_id INT, user_id INT, amount INT);",
    "seedDataSql": "INSERT INTO microsoft_tb_124 VALUES (1, 'Alice');\nINSERT INTO microsoft_tb_124 VALUES (2, 'Bob');\nINSERT INTO microsoft_tb_124_orders VALUES (101, 1, 200);\nINSERT INTO microsoft_tb_124_orders VALUES (102, 1, 300);\nINSERT INTO microsoft_tb_124_orders VALUES (103, 2, 150);",
    "expectedOutput": {
      "columns": [
        "name",
        "total_amount"
      ],
      "rows": [
        [
          "Alice",
          500
        ],
        [
          "Bob",
          150
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: JOIN microsoft_tb_124_orders ON u.user_id = o.user_id."
    ],
    "solutionSql": "SELECT u.name, SUM(o.amount) AS total_amount FROM microsoft_tb_124 u JOIN microsoft_tb_124_orders o ON u.user_id = o.user_id GROUP BY u.name ORDER BY total_amount DESC;",
    "starterSql": "-- Problem #124: Microsoft User Order Match #124\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 125,
    "title": "Microsoft Query Optimization #125",
    "difficulty": "Expert",
    "domain": "Subqueries & CTEs",
    "companyTags": [
      "Microsoft"
    ],
    "description": "Find transactions with amount > 300.",
    "inputTables": [
      {
        "tableName": "microsoft_tb_125",
        "columns": [
          {
            "name": "tx_id",
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
    "inputSchemaSql": "CREATE TABLE microsoft_tb_125 (tx_id INT, amount INT);",
    "seedDataSql": "INSERT INTO microsoft_tb_125 VALUES (1, 500);\nINSERT INTO microsoft_tb_125 VALUES (2, 150);\nINSERT INTO microsoft_tb_125 VALUES (3, 400);",
    "expectedOutput": {
      "columns": [
        "tx_id",
        "amount"
      ],
      "rows": [
        [
          1,
          500
        ],
        [
          3,
          400
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: Filter amount > 300."
    ],
    "solutionSql": "SELECT tx_id, amount FROM microsoft_tb_125 WHERE amount > 300 ORDER BY amount DESC;",
    "starterSql": "-- Problem #125: Microsoft Query Optimization #125\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 126,
    "title": "Microsoft Salary Department Rank #126",
    "difficulty": "Easy",
    "domain": "Window Ranking & Ordering",
    "companyTags": [
      "Microsoft"
    ],
    "description": "Rank employees by salary within each department.",
    "inputTables": [
      {
        "tableName": "microsoft_tb_126",
        "columns": [
          {
            "name": "emp_id",
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
    "inputSchemaSql": "CREATE TABLE microsoft_tb_126 (emp_id INT, name VARCHAR(255), salary INT, dept VARCHAR(50));",
    "seedDataSql": "INSERT INTO microsoft_tb_126 VALUES (1, 'Alice', 95000, 'Engineering');\nINSERT INTO microsoft_tb_126 VALUES (2, 'Bob', 85000, 'Engineering');\nINSERT INTO microsoft_tb_126 VALUES (3, 'Charlie', 110000, 'Product');\nINSERT INTO microsoft_tb_126 VALUES (4, 'David', 90000, 'Product');",
    "expectedOutput": {
      "columns": [
        "emp_id",
        "name",
        "salary",
        "dept",
        "rnk"
      ],
      "rows": [
        [
          1,
          "Alice",
          95000,
          "Engineering",
          1
        ],
        [
          2,
          "Bob",
          85000,
          "Engineering",
          2
        ],
        [
          3,
          "Charlie",
          110000,
          "Product",
          1
        ],
        [
          4,
          "David",
          90000,
          "Product",
          2
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: DENSE_RANK() OVER (PARTITION BY dept ORDER BY salary DESC)."
    ],
    "solutionSql": "SELECT emp_id, name, salary, dept, DENSE_RANK() OVER (PARTITION BY dept ORDER BY salary DESC) AS rnk FROM microsoft_tb_126;",
    "starterSql": "-- Problem #126: Microsoft Salary Department Rank #126\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 127,
    "title": "Netflix High Value Account Filter #127",
    "difficulty": "Easy",
    "domain": "Filtering & String Functions",
    "companyTags": [
      "Netflix"
    ],
    "description": "Write a query to find active users in Netflix's database with spend > 500.",
    "inputTables": [
      {
        "tableName": "netflix_tb_127",
        "columns": [
          {
            "name": "name",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE netflix_tb_127 (id INT PRIMARY KEY, name VARCHAR(255), spend INT, status VARCHAR(50));",
    "seedDataSql": "INSERT INTO netflix_tb_127 VALUES (1, 'Alice', 1200, 'active');\nINSERT INTO netflix_tb_127 VALUES (2, 'Bob', 350, 'inactive');\nINSERT INTO netflix_tb_127 VALUES (3, 'Charlie', 850, 'active');\nINSERT INTO netflix_tb_127 VALUES (4, 'David', 400, 'active');",
    "expectedOutput": {
      "columns": [
        "id",
        "name",
        "spend"
      ],
      "rows": [
        [
          1,
          "Alice",
          1200
        ],
        [
          3,
          "Charlie",
          850
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: Use WHERE spend > 500 AND status = 'active'."
    ],
    "solutionSql": "SELECT id, name, spend FROM netflix_tb_127 WHERE spend > 500 AND status = 'active' ORDER BY spend DESC;",
    "starterSql": "-- Problem #127: Netflix High Value Account Filter #127\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 128,
    "title": "Netflix Category Revenue Breakdown #128",
    "difficulty": "Medium",
    "domain": "Aggregations & Grouping",
    "companyTags": [
      "Netflix"
    ],
    "description": "Calculate the total revenue and count for each product category in Netflix's sales ledger.",
    "inputTables": [
      {
        "tableName": "netflix_tb_128",
        "columns": [
          {
            "name": "order_id",
            "type": "INT"
          },
          {
            "name": "category",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE netflix_tb_128 (order_id INT, category VARCHAR(255), revenue INT);",
    "seedDataSql": "INSERT INTO netflix_tb_128 VALUES (101, 'Cloud', 500);\nINSERT INTO netflix_tb_128 VALUES (102, 'Cloud', 300);\nINSERT INTO netflix_tb_128 VALUES (103, 'Hardware', 150);\nINSERT INTO netflix_tb_128 VALUES (104, 'Hardware', 250);",
    "expectedOutput": {
      "columns": [
        "category",
        "total_revenue",
        "order_count"
      ],
      "rows": [
        [
          "Cloud",
          800,
          2
        ],
        [
          "Hardware",
          400,
          2
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: GROUP BY category and SUM(revenue)."
    ],
    "solutionSql": "SELECT category, SUM(revenue) AS total_revenue, COUNT(*) AS order_count FROM netflix_tb_128 GROUP BY category ORDER BY total_revenue DESC;",
    "starterSql": "-- Problem #128: Netflix Category Revenue Breakdown #128\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 129,
    "title": "Netflix User Order Match #129",
    "difficulty": "Hard",
    "domain": "Joins & Relational Sets",
    "companyTags": [
      "Netflix"
    ],
    "description": "Join users and orders tables to find user order totals.",
    "inputTables": [
      {
        "tableName": "netflix_tb_129",
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
    "inputSchemaSql": "CREATE TABLE netflix_tb_129 (user_id INT, name VARCHAR(255));\nCREATE TABLE netflix_tb_129_orders (order_id INT, user_id INT, amount INT);",
    "seedDataSql": "INSERT INTO netflix_tb_129 VALUES (1, 'Alice');\nINSERT INTO netflix_tb_129 VALUES (2, 'Bob');\nINSERT INTO netflix_tb_129_orders VALUES (101, 1, 200);\nINSERT INTO netflix_tb_129_orders VALUES (102, 1, 300);\nINSERT INTO netflix_tb_129_orders VALUES (103, 2, 150);",
    "expectedOutput": {
      "columns": [
        "name",
        "total_amount"
      ],
      "rows": [
        [
          "Alice",
          500
        ],
        [
          "Bob",
          150
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: JOIN netflix_tb_129_orders ON u.user_id = o.user_id."
    ],
    "solutionSql": "SELECT u.name, SUM(o.amount) AS total_amount FROM netflix_tb_129 u JOIN netflix_tb_129_orders o ON u.user_id = o.user_id GROUP BY u.name ORDER BY total_amount DESC;",
    "starterSql": "-- Problem #129: Netflix User Order Match #129\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 130,
    "title": "Netflix Query Optimization #130",
    "difficulty": "Expert",
    "domain": "Subqueries & CTEs",
    "companyTags": [
      "Netflix"
    ],
    "description": "Find transactions with amount > 300.",
    "inputTables": [
      {
        "tableName": "netflix_tb_130",
        "columns": [
          {
            "name": "tx_id",
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
    "inputSchemaSql": "CREATE TABLE netflix_tb_130 (tx_id INT, amount INT);",
    "seedDataSql": "INSERT INTO netflix_tb_130 VALUES (1, 500);\nINSERT INTO netflix_tb_130 VALUES (2, 150);\nINSERT INTO netflix_tb_130 VALUES (3, 400);",
    "expectedOutput": {
      "columns": [
        "tx_id",
        "amount"
      ],
      "rows": [
        [
          1,
          500
        ],
        [
          3,
          400
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: Filter amount > 300."
    ],
    "solutionSql": "SELECT tx_id, amount FROM netflix_tb_130 WHERE amount > 300 ORDER BY amount DESC;",
    "starterSql": "-- Problem #130: Netflix Query Optimization #130\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 131,
    "title": "Netflix Salary Department Rank #131",
    "difficulty": "Easy",
    "domain": "Window Ranking & Ordering",
    "companyTags": [
      "Netflix"
    ],
    "description": "Rank employees by salary within each department.",
    "inputTables": [
      {
        "tableName": "netflix_tb_131",
        "columns": [
          {
            "name": "emp_id",
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
    "inputSchemaSql": "CREATE TABLE netflix_tb_131 (emp_id INT, name VARCHAR(255), salary INT, dept VARCHAR(50));",
    "seedDataSql": "INSERT INTO netflix_tb_131 VALUES (1, 'Alice', 95000, 'Engineering');\nINSERT INTO netflix_tb_131 VALUES (2, 'Bob', 85000, 'Engineering');\nINSERT INTO netflix_tb_131 VALUES (3, 'Charlie', 110000, 'Product');\nINSERT INTO netflix_tb_131 VALUES (4, 'David', 90000, 'Product');",
    "expectedOutput": {
      "columns": [
        "emp_id",
        "name",
        "salary",
        "dept",
        "rnk"
      ],
      "rows": [
        [
          1,
          "Alice",
          95000,
          "Engineering",
          1
        ],
        [
          2,
          "Bob",
          85000,
          "Engineering",
          2
        ],
        [
          3,
          "Charlie",
          110000,
          "Product",
          1
        ],
        [
          4,
          "David",
          90000,
          "Product",
          2
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: DENSE_RANK() OVER (PARTITION BY dept ORDER BY salary DESC)."
    ],
    "solutionSql": "SELECT emp_id, name, salary, dept, DENSE_RANK() OVER (PARTITION BY dept ORDER BY salary DESC) AS rnk FROM netflix_tb_131;",
    "starterSql": "-- Problem #131: Netflix Salary Department Rank #131\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 132,
    "title": "Netflix Previous Activity Delta #132",
    "difficulty": "Medium",
    "domain": "Window Offset Functions",
    "companyTags": [
      "Netflix"
    ],
    "description": "Find previous login date using LAG() window function.",
    "inputTables": [
      {
        "tableName": "netflix_tb_132",
        "columns": [
          {
            "name": "user_id",
            "type": "INT"
          },
          {
            "name": "login_date",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE netflix_tb_132 (user_id INT, login_date VARCHAR(50));",
    "seedDataSql": "INSERT INTO netflix_tb_132 VALUES (1, '2026-01-01');\nINSERT INTO netflix_tb_132 VALUES (1, '2026-01-05');\nINSERT INTO netflix_tb_132 VALUES (1, '2026-01-20');",
    "expectedOutput": {
      "columns": [
        "user_id",
        "login_date",
        "prev_login"
      ],
      "rows": [
        [
          1,
          "2026-01-01",
          null
        ],
        [
          1,
          "2026-01-05",
          "2026-01-01"
        ],
        [
          1,
          "2026-01-20",
          "2026-01-05"
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: LAG(login_date) OVER (PARTITION BY user_id ORDER BY login_date)."
    ],
    "solutionSql": "SELECT user_id, login_date, LAG(login_date) OVER (PARTITION BY user_id ORDER BY login_date) AS prev_login FROM netflix_tb_132;",
    "starterSql": "-- Problem #132: Netflix Previous Activity Delta #132\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 133,
    "title": "Netflix 3-Day Moving Average #133",
    "difficulty": "Hard",
    "domain": "Sliding Window Aggregates",
    "companyTags": [
      "Netflix"
    ],
    "description": "Calculate 3-day moving average of daily sales.",
    "inputTables": [
      {
        "tableName": "netflix_tb_133",
        "columns": [
          {
            "name": "day_id",
            "type": "INT"
          },
          {
            "name": "sales",
            "type": "INT"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE netflix_tb_133 (day_id INT, sales INT);",
    "seedDataSql": "INSERT INTO netflix_tb_133 VALUES (1, 100);\nINSERT INTO netflix_tb_133 VALUES (2, 120);\nINSERT INTO netflix_tb_133 VALUES (3, 140);\nINSERT INTO netflix_tb_133 VALUES (4, 110);",
    "expectedOutput": {
      "columns": [
        "day_id",
        "sales",
        "moving_avg"
      ],
      "rows": [
        [
          1,
          100,
          100.0
        ],
        [
          2,
          120,
          110.0
        ],
        [
          3,
          140,
          120.0
        ],
        [
          4,
          110,
          123.33333333333333
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: AVG(sales) OVER (ORDER BY day_id ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)."
    ],
    "solutionSql": "SELECT day_id, sales, AVG(sales) OVER (ORDER BY day_id ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) AS moving_avg FROM netflix_tb_133;",
    "starterSql": "-- Problem #133: Netflix 3-Day Moving Average #133\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 134,
    "title": "Netflix Cohort Signups #134",
    "difficulty": "Expert",
    "domain": "Date & Time Analytics",
    "companyTags": [
      "Netflix"
    ],
    "description": "Filter user signups in January 2026.",
    "inputTables": [
      {
        "tableName": "netflix_tb_134",
        "columns": [
          {
            "name": "user_id",
            "type": "INT"
          },
          {
            "name": "signup_date",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE netflix_tb_134 (user_id INT, signup_date VARCHAR(50));",
    "seedDataSql": "INSERT INTO netflix_tb_134 VALUES (1, '2026-01-10');\nINSERT INTO netflix_tb_134 VALUES (2, '2026-01-25');\nINSERT INTO netflix_tb_134 VALUES (3, '2026-02-01');",
    "expectedOutput": {
      "columns": [
        "user_id",
        "signup_date"
      ],
      "rows": [
        [
          1,
          "2026-01-10"
        ],
        [
          2,
          "2026-01-25"
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: Filter signup_date LIKE '2026-01%'."
    ],
    "solutionSql": "SELECT user_id, signup_date FROM netflix_tb_134 WHERE signup_date LIKE '2026-01%' ORDER BY user_id;",
    "starterSql": "-- Problem #134: Netflix Cohort Signups #134\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 135,
    "title": "Netflix Query Optimization #135",
    "difficulty": "Easy",
    "domain": "DDL, Constraints & Triggers",
    "companyTags": [
      "Netflix"
    ],
    "description": "Find transactions with amount > 300.",
    "inputTables": [
      {
        "tableName": "netflix_tb_135",
        "columns": [
          {
            "name": "tx_id",
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
    "inputSchemaSql": "CREATE TABLE netflix_tb_135 (tx_id INT, amount INT);",
    "seedDataSql": "INSERT INTO netflix_tb_135 VALUES (1, 500);\nINSERT INTO netflix_tb_135 VALUES (2, 150);\nINSERT INTO netflix_tb_135 VALUES (3, 400);",
    "expectedOutput": {
      "columns": [
        "tx_id",
        "amount"
      ],
      "rows": [
        [
          1,
          500
        ],
        [
          3,
          400
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: Filter amount > 300."
    ],
    "solutionSql": "SELECT tx_id, amount FROM netflix_tb_135 WHERE amount > 300 ORDER BY amount DESC;",
    "starterSql": "-- Problem #135: Netflix Query Optimization #135\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 136,
    "title": "Netflix Org Hierarchy Depth #136",
    "difficulty": "Medium",
    "domain": "Recursive CTEs & Graphs",
    "companyTags": [
      "Netflix"
    ],
    "description": "Find organizational depth level using recursive query.",
    "inputTables": [
      {
        "tableName": "netflix_tb_136",
        "columns": [
          {
            "name": "emp_id",
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
    "inputSchemaSql": "CREATE TABLE netflix_tb_136 (emp_id INT, name VARCHAR(255), manager_id INT);",
    "seedDataSql": "INSERT INTO netflix_tb_136 VALUES (1, 'CEO', NULL);\nINSERT INTO netflix_tb_136 VALUES (2, 'VP', 1);\nINSERT INTO netflix_tb_136 VALUES (3, 'Eng', 2);",
    "expectedOutput": {
      "columns": [
        "emp_id",
        "name",
        "depth"
      ],
      "rows": [
        [
          1,
          "CEO",
          1
        ],
        [
          2,
          "VP",
          2
        ],
        [
          3,
          "Eng",
          3
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: Use WITH RECURSIVE Tree AS (...)"
    ],
    "solutionSql": "WITH RECURSIVE Tree AS (SELECT emp_id, name, 1 AS depth FROM netflix_tb_136 WHERE manager_id IS NULL UNION ALL SELECT e.emp_id, e.name, t.depth + 1 FROM netflix_tb_136 e JOIN Tree t ON e.manager_id = t.emp_id) SELECT emp_id, name, depth FROM Tree ORDER BY depth, emp_id;",
    "starterSql": "-- Problem #136: Netflix Org Hierarchy Depth #136\n-- Write your SQL query solution below:\nWITH RECURSIVE Tree AS (\n\n)\nSELECT \nFROM Tree;"
  },
  {
    "id": 137,
    "title": "Netflix High Value Account Filter #137",
    "difficulty": "Hard",
    "domain": "Filtering & String Functions",
    "companyTags": [
      "Netflix"
    ],
    "description": "Write a query to find active users in Netflix's database with spend > 500.",
    "inputTables": [
      {
        "tableName": "netflix_tb_137",
        "columns": [
          {
            "name": "name",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE netflix_tb_137 (id INT PRIMARY KEY, name VARCHAR(255), spend INT, status VARCHAR(50));",
    "seedDataSql": "INSERT INTO netflix_tb_137 VALUES (1, 'Alice', 1200, 'active');\nINSERT INTO netflix_tb_137 VALUES (2, 'Bob', 350, 'inactive');\nINSERT INTO netflix_tb_137 VALUES (3, 'Charlie', 850, 'active');\nINSERT INTO netflix_tb_137 VALUES (4, 'David', 400, 'active');",
    "expectedOutput": {
      "columns": [
        "id",
        "name",
        "spend"
      ],
      "rows": [
        [
          1,
          "Alice",
          1200
        ],
        [
          3,
          "Charlie",
          850
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: Use WHERE spend > 500 AND status = 'active'."
    ],
    "solutionSql": "SELECT id, name, spend FROM netflix_tb_137 WHERE spend > 500 AND status = 'active' ORDER BY spend DESC;",
    "starterSql": "-- Problem #137: Netflix High Value Account Filter #137\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 138,
    "title": "Netflix Category Revenue Breakdown #138",
    "difficulty": "Expert",
    "domain": "Aggregations & Grouping",
    "companyTags": [
      "Netflix"
    ],
    "description": "Calculate the total revenue and count for each product category in Netflix's sales ledger.",
    "inputTables": [
      {
        "tableName": "netflix_tb_138",
        "columns": [
          {
            "name": "order_id",
            "type": "INT"
          },
          {
            "name": "category",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE netflix_tb_138 (order_id INT, category VARCHAR(255), revenue INT);",
    "seedDataSql": "INSERT INTO netflix_tb_138 VALUES (101, 'Cloud', 500);\nINSERT INTO netflix_tb_138 VALUES (102, 'Cloud', 300);\nINSERT INTO netflix_tb_138 VALUES (103, 'Hardware', 150);\nINSERT INTO netflix_tb_138 VALUES (104, 'Hardware', 250);",
    "expectedOutput": {
      "columns": [
        "category",
        "total_revenue",
        "order_count"
      ],
      "rows": [
        [
          "Cloud",
          800,
          2
        ],
        [
          "Hardware",
          400,
          2
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: GROUP BY category and SUM(revenue)."
    ],
    "solutionSql": "SELECT category, SUM(revenue) AS total_revenue, COUNT(*) AS order_count FROM netflix_tb_138 GROUP BY category ORDER BY total_revenue DESC;",
    "starterSql": "-- Problem #138: Netflix Category Revenue Breakdown #138\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 139,
    "title": "Netflix User Order Match #139",
    "difficulty": "Easy",
    "domain": "Joins & Relational Sets",
    "companyTags": [
      "Netflix"
    ],
    "description": "Join users and orders tables to find user order totals.",
    "inputTables": [
      {
        "tableName": "netflix_tb_139",
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
    "inputSchemaSql": "CREATE TABLE netflix_tb_139 (user_id INT, name VARCHAR(255));\nCREATE TABLE netflix_tb_139_orders (order_id INT, user_id INT, amount INT);",
    "seedDataSql": "INSERT INTO netflix_tb_139 VALUES (1, 'Alice');\nINSERT INTO netflix_tb_139 VALUES (2, 'Bob');\nINSERT INTO netflix_tb_139_orders VALUES (101, 1, 200);\nINSERT INTO netflix_tb_139_orders VALUES (102, 1, 300);\nINSERT INTO netflix_tb_139_orders VALUES (103, 2, 150);",
    "expectedOutput": {
      "columns": [
        "name",
        "total_amount"
      ],
      "rows": [
        [
          "Alice",
          500
        ],
        [
          "Bob",
          150
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: JOIN netflix_tb_139_orders ON u.user_id = o.user_id."
    ],
    "solutionSql": "SELECT u.name, SUM(o.amount) AS total_amount FROM netflix_tb_139 u JOIN netflix_tb_139_orders o ON u.user_id = o.user_id GROUP BY u.name ORDER BY total_amount DESC;",
    "starterSql": "-- Problem #139: Netflix User Order Match #139\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 140,
    "title": "Netflix Query Optimization #140",
    "difficulty": "Medium",
    "domain": "Subqueries & CTEs",
    "companyTags": [
      "Netflix"
    ],
    "description": "Find transactions with amount > 300.",
    "inputTables": [
      {
        "tableName": "netflix_tb_140",
        "columns": [
          {
            "name": "tx_id",
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
    "inputSchemaSql": "CREATE TABLE netflix_tb_140 (tx_id INT, amount INT);",
    "seedDataSql": "INSERT INTO netflix_tb_140 VALUES (1, 500);\nINSERT INTO netflix_tb_140 VALUES (2, 150);\nINSERT INTO netflix_tb_140 VALUES (3, 400);",
    "expectedOutput": {
      "columns": [
        "tx_id",
        "amount"
      ],
      "rows": [
        [
          1,
          500
        ],
        [
          3,
          400
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: Filter amount > 300."
    ],
    "solutionSql": "SELECT tx_id, amount FROM netflix_tb_140 WHERE amount > 300 ORDER BY amount DESC;",
    "starterSql": "-- Problem #140: Netflix Query Optimization #140\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 141,
    "title": "Netflix Salary Department Rank #141",
    "difficulty": "Hard",
    "domain": "Window Ranking & Ordering",
    "companyTags": [
      "Netflix"
    ],
    "description": "Rank employees by salary within each department.",
    "inputTables": [
      {
        "tableName": "netflix_tb_141",
        "columns": [
          {
            "name": "emp_id",
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
    "inputSchemaSql": "CREATE TABLE netflix_tb_141 (emp_id INT, name VARCHAR(255), salary INT, dept VARCHAR(50));",
    "seedDataSql": "INSERT INTO netflix_tb_141 VALUES (1, 'Alice', 95000, 'Engineering');\nINSERT INTO netflix_tb_141 VALUES (2, 'Bob', 85000, 'Engineering');\nINSERT INTO netflix_tb_141 VALUES (3, 'Charlie', 110000, 'Product');\nINSERT INTO netflix_tb_141 VALUES (4, 'David', 90000, 'Product');",
    "expectedOutput": {
      "columns": [
        "emp_id",
        "name",
        "salary",
        "dept",
        "rnk"
      ],
      "rows": [
        [
          1,
          "Alice",
          95000,
          "Engineering",
          1
        ],
        [
          2,
          "Bob",
          85000,
          "Engineering",
          2
        ],
        [
          3,
          "Charlie",
          110000,
          "Product",
          1
        ],
        [
          4,
          "David",
          90000,
          "Product",
          2
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: DENSE_RANK() OVER (PARTITION BY dept ORDER BY salary DESC)."
    ],
    "solutionSql": "SELECT emp_id, name, salary, dept, DENSE_RANK() OVER (PARTITION BY dept ORDER BY salary DESC) AS rnk FROM netflix_tb_141;",
    "starterSql": "-- Problem #141: Netflix Salary Department Rank #141\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 142,
    "title": "Netflix Previous Activity Delta #142",
    "difficulty": "Expert",
    "domain": "Window Offset Functions",
    "companyTags": [
      "Netflix"
    ],
    "description": "Find previous login date using LAG() window function.",
    "inputTables": [
      {
        "tableName": "netflix_tb_142",
        "columns": [
          {
            "name": "user_id",
            "type": "INT"
          },
          {
            "name": "login_date",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE netflix_tb_142 (user_id INT, login_date VARCHAR(50));",
    "seedDataSql": "INSERT INTO netflix_tb_142 VALUES (1, '2026-01-01');\nINSERT INTO netflix_tb_142 VALUES (1, '2026-01-05');\nINSERT INTO netflix_tb_142 VALUES (1, '2026-01-20');",
    "expectedOutput": {
      "columns": [
        "user_id",
        "login_date",
        "prev_login"
      ],
      "rows": [
        [
          1,
          "2026-01-01",
          null
        ],
        [
          1,
          "2026-01-05",
          "2026-01-01"
        ],
        [
          1,
          "2026-01-20",
          "2026-01-05"
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: LAG(login_date) OVER (PARTITION BY user_id ORDER BY login_date)."
    ],
    "solutionSql": "SELECT user_id, login_date, LAG(login_date) OVER (PARTITION BY user_id ORDER BY login_date) AS prev_login FROM netflix_tb_142;",
    "starterSql": "-- Problem #142: Netflix Previous Activity Delta #142\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 143,
    "title": "Netflix 3-Day Moving Average #143",
    "difficulty": "Easy",
    "domain": "Sliding Window Aggregates",
    "companyTags": [
      "Netflix"
    ],
    "description": "Calculate 3-day moving average of daily sales.",
    "inputTables": [
      {
        "tableName": "netflix_tb_143",
        "columns": [
          {
            "name": "day_id",
            "type": "INT"
          },
          {
            "name": "sales",
            "type": "INT"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE netflix_tb_143 (day_id INT, sales INT);",
    "seedDataSql": "INSERT INTO netflix_tb_143 VALUES (1, 100);\nINSERT INTO netflix_tb_143 VALUES (2, 120);\nINSERT INTO netflix_tb_143 VALUES (3, 140);\nINSERT INTO netflix_tb_143 VALUES (4, 110);",
    "expectedOutput": {
      "columns": [
        "day_id",
        "sales",
        "moving_avg"
      ],
      "rows": [
        [
          1,
          100,
          100.0
        ],
        [
          2,
          120,
          110.0
        ],
        [
          3,
          140,
          120.0
        ],
        [
          4,
          110,
          123.33333333333333
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: AVG(sales) OVER (ORDER BY day_id ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)."
    ],
    "solutionSql": "SELECT day_id, sales, AVG(sales) OVER (ORDER BY day_id ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) AS moving_avg FROM netflix_tb_143;",
    "starterSql": "-- Problem #143: Netflix 3-Day Moving Average #143\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 144,
    "title": "Netflix Cohort Signups #144",
    "difficulty": "Medium",
    "domain": "Date & Time Analytics",
    "companyTags": [
      "Netflix"
    ],
    "description": "Filter user signups in January 2026.",
    "inputTables": [
      {
        "tableName": "netflix_tb_144",
        "columns": [
          {
            "name": "user_id",
            "type": "INT"
          },
          {
            "name": "signup_date",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE netflix_tb_144 (user_id INT, signup_date VARCHAR(50));",
    "seedDataSql": "INSERT INTO netflix_tb_144 VALUES (1, '2026-01-10');\nINSERT INTO netflix_tb_144 VALUES (2, '2026-01-25');\nINSERT INTO netflix_tb_144 VALUES (3, '2026-02-01');",
    "expectedOutput": {
      "columns": [
        "user_id",
        "signup_date"
      ],
      "rows": [
        [
          1,
          "2026-01-10"
        ],
        [
          2,
          "2026-01-25"
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: Filter signup_date LIKE '2026-01%'."
    ],
    "solutionSql": "SELECT user_id, signup_date FROM netflix_tb_144 WHERE signup_date LIKE '2026-01%' ORDER BY user_id;",
    "starterSql": "-- Problem #144: Netflix Cohort Signups #144\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 145,
    "title": "Netflix Query Optimization #145",
    "difficulty": "Hard",
    "domain": "DDL, Constraints & Triggers",
    "companyTags": [
      "Netflix"
    ],
    "description": "Find transactions with amount > 300.",
    "inputTables": [
      {
        "tableName": "netflix_tb_145",
        "columns": [
          {
            "name": "tx_id",
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
    "inputSchemaSql": "CREATE TABLE netflix_tb_145 (tx_id INT, amount INT);",
    "seedDataSql": "INSERT INTO netflix_tb_145 VALUES (1, 500);\nINSERT INTO netflix_tb_145 VALUES (2, 150);\nINSERT INTO netflix_tb_145 VALUES (3, 400);",
    "expectedOutput": {
      "columns": [
        "tx_id",
        "amount"
      ],
      "rows": [
        [
          1,
          500
        ],
        [
          3,
          400
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: Filter amount > 300."
    ],
    "solutionSql": "SELECT tx_id, amount FROM netflix_tb_145 WHERE amount > 300 ORDER BY amount DESC;",
    "starterSql": "-- Problem #145: Netflix Query Optimization #145\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 146,
    "title": "Netflix Org Hierarchy Depth #146",
    "difficulty": "Expert",
    "domain": "Recursive CTEs & Graphs",
    "companyTags": [
      "Netflix"
    ],
    "description": "Find organizational depth level using recursive query.",
    "inputTables": [
      {
        "tableName": "netflix_tb_146",
        "columns": [
          {
            "name": "emp_id",
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
    "inputSchemaSql": "CREATE TABLE netflix_tb_146 (emp_id INT, name VARCHAR(255), manager_id INT);",
    "seedDataSql": "INSERT INTO netflix_tb_146 VALUES (1, 'CEO', NULL);\nINSERT INTO netflix_tb_146 VALUES (2, 'VP', 1);\nINSERT INTO netflix_tb_146 VALUES (3, 'Eng', 2);",
    "expectedOutput": {
      "columns": [
        "emp_id",
        "name",
        "depth"
      ],
      "rows": [
        [
          1,
          "CEO",
          1
        ],
        [
          2,
          "VP",
          2
        ],
        [
          3,
          "Eng",
          3
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: Use WITH RECURSIVE Tree AS (...)"
    ],
    "solutionSql": "WITH RECURSIVE Tree AS (SELECT emp_id, name, 1 AS depth FROM netflix_tb_146 WHERE manager_id IS NULL UNION ALL SELECT e.emp_id, e.name, t.depth + 1 FROM netflix_tb_146 e JOIN Tree t ON e.manager_id = t.emp_id) SELECT emp_id, name, depth FROM Tree ORDER BY depth, emp_id;",
    "starterSql": "-- Problem #146: Netflix Org Hierarchy Depth #146\n-- Write your SQL query solution below:\nWITH RECURSIVE Tree AS (\n\n)\nSELECT \nFROM Tree;"
  },
  {
    "id": 147,
    "title": "Netflix High Value Account Filter #147",
    "difficulty": "Easy",
    "domain": "Filtering & String Functions",
    "companyTags": [
      "Netflix"
    ],
    "description": "Write a query to find active users in Netflix's database with spend > 500.",
    "inputTables": [
      {
        "tableName": "netflix_tb_147",
        "columns": [
          {
            "name": "name",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE netflix_tb_147 (id INT PRIMARY KEY, name VARCHAR(255), spend INT, status VARCHAR(50));",
    "seedDataSql": "INSERT INTO netflix_tb_147 VALUES (1, 'Alice', 1200, 'active');\nINSERT INTO netflix_tb_147 VALUES (2, 'Bob', 350, 'inactive');\nINSERT INTO netflix_tb_147 VALUES (3, 'Charlie', 850, 'active');\nINSERT INTO netflix_tb_147 VALUES (4, 'David', 400, 'active');",
    "expectedOutput": {
      "columns": [
        "id",
        "name",
        "spend"
      ],
      "rows": [
        [
          1,
          "Alice",
          1200
        ],
        [
          3,
          "Charlie",
          850
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: Use WHERE spend > 500 AND status = 'active'."
    ],
    "solutionSql": "SELECT id, name, spend FROM netflix_tb_147 WHERE spend > 500 AND status = 'active' ORDER BY spend DESC;",
    "starterSql": "-- Problem #147: Netflix High Value Account Filter #147\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 148,
    "title": "Netflix Category Revenue Breakdown #148",
    "difficulty": "Medium",
    "domain": "Aggregations & Grouping",
    "companyTags": [
      "Netflix"
    ],
    "description": "Calculate the total revenue and count for each product category in Netflix's sales ledger.",
    "inputTables": [
      {
        "tableName": "netflix_tb_148",
        "columns": [
          {
            "name": "order_id",
            "type": "INT"
          },
          {
            "name": "category",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE netflix_tb_148 (order_id INT, category VARCHAR(255), revenue INT);",
    "seedDataSql": "INSERT INTO netflix_tb_148 VALUES (101, 'Cloud', 500);\nINSERT INTO netflix_tb_148 VALUES (102, 'Cloud', 300);\nINSERT INTO netflix_tb_148 VALUES (103, 'Hardware', 150);\nINSERT INTO netflix_tb_148 VALUES (104, 'Hardware', 250);",
    "expectedOutput": {
      "columns": [
        "category",
        "total_revenue",
        "order_count"
      ],
      "rows": [
        [
          "Cloud",
          800,
          2
        ],
        [
          "Hardware",
          400,
          2
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: GROUP BY category and SUM(revenue)."
    ],
    "solutionSql": "SELECT category, SUM(revenue) AS total_revenue, COUNT(*) AS order_count FROM netflix_tb_148 GROUP BY category ORDER BY total_revenue DESC;",
    "starterSql": "-- Problem #148: Netflix Category Revenue Breakdown #148\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 149,
    "title": "Netflix User Order Match #149",
    "difficulty": "Hard",
    "domain": "Joins & Relational Sets",
    "companyTags": [
      "Netflix"
    ],
    "description": "Join users and orders tables to find user order totals.",
    "inputTables": [
      {
        "tableName": "netflix_tb_149",
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
    "inputSchemaSql": "CREATE TABLE netflix_tb_149 (user_id INT, name VARCHAR(255));\nCREATE TABLE netflix_tb_149_orders (order_id INT, user_id INT, amount INT);",
    "seedDataSql": "INSERT INTO netflix_tb_149 VALUES (1, 'Alice');\nINSERT INTO netflix_tb_149 VALUES (2, 'Bob');\nINSERT INTO netflix_tb_149_orders VALUES (101, 1, 200);\nINSERT INTO netflix_tb_149_orders VALUES (102, 1, 300);\nINSERT INTO netflix_tb_149_orders VALUES (103, 2, 150);",
    "expectedOutput": {
      "columns": [
        "name",
        "total_amount"
      ],
      "rows": [
        [
          "Alice",
          500
        ],
        [
          "Bob",
          150
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: JOIN netflix_tb_149_orders ON u.user_id = o.user_id."
    ],
    "solutionSql": "SELECT u.name, SUM(o.amount) AS total_amount FROM netflix_tb_149 u JOIN netflix_tb_149_orders o ON u.user_id = o.user_id GROUP BY u.name ORDER BY total_amount DESC;",
    "starterSql": "-- Problem #149: Netflix User Order Match #149\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 150,
    "title": "Netflix Query Optimization #150",
    "difficulty": "Expert",
    "domain": "Subqueries & CTEs",
    "companyTags": [
      "Netflix"
    ],
    "description": "Find transactions with amount > 300.",
    "inputTables": [
      {
        "tableName": "netflix_tb_150",
        "columns": [
          {
            "name": "tx_id",
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
    "inputSchemaSql": "CREATE TABLE netflix_tb_150 (tx_id INT, amount INT);",
    "seedDataSql": "INSERT INTO netflix_tb_150 VALUES (1, 500);\nINSERT INTO netflix_tb_150 VALUES (2, 150);\nINSERT INTO netflix_tb_150 VALUES (3, 400);",
    "expectedOutput": {
      "columns": [
        "tx_id",
        "amount"
      ],
      "rows": [
        [
          1,
          500
        ],
        [
          3,
          400
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: Filter amount > 300."
    ],
    "solutionSql": "SELECT tx_id, amount FROM netflix_tb_150 WHERE amount > 300 ORDER BY amount DESC;",
    "starterSql": "-- Problem #150: Netflix Query Optimization #150\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 151,
    "title": "Netflix Salary Department Rank #151",
    "difficulty": "Easy",
    "domain": "Window Ranking & Ordering",
    "companyTags": [
      "Netflix"
    ],
    "description": "Rank employees by salary within each department.",
    "inputTables": [
      {
        "tableName": "netflix_tb_151",
        "columns": [
          {
            "name": "emp_id",
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
    "inputSchemaSql": "CREATE TABLE netflix_tb_151 (emp_id INT, name VARCHAR(255), salary INT, dept VARCHAR(50));",
    "seedDataSql": "INSERT INTO netflix_tb_151 VALUES (1, 'Alice', 95000, 'Engineering');\nINSERT INTO netflix_tb_151 VALUES (2, 'Bob', 85000, 'Engineering');\nINSERT INTO netflix_tb_151 VALUES (3, 'Charlie', 110000, 'Product');\nINSERT INTO netflix_tb_151 VALUES (4, 'David', 90000, 'Product');",
    "expectedOutput": {
      "columns": [
        "emp_id",
        "name",
        "salary",
        "dept",
        "rnk"
      ],
      "rows": [
        [
          1,
          "Alice",
          95000,
          "Engineering",
          1
        ],
        [
          2,
          "Bob",
          85000,
          "Engineering",
          2
        ],
        [
          3,
          "Charlie",
          110000,
          "Product",
          1
        ],
        [
          4,
          "David",
          90000,
          "Product",
          2
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: DENSE_RANK() OVER (PARTITION BY dept ORDER BY salary DESC)."
    ],
    "solutionSql": "SELECT emp_id, name, salary, dept, DENSE_RANK() OVER (PARTITION BY dept ORDER BY salary DESC) AS rnk FROM netflix_tb_151;",
    "starterSql": "-- Problem #151: Netflix Salary Department Rank #151\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 152,
    "title": "Uber High Value Account Filter #152",
    "difficulty": "Easy",
    "domain": "Filtering & String Functions",
    "companyTags": [
      "Uber"
    ],
    "description": "Write a query to find active users in Uber's database with spend > 500.",
    "inputTables": [
      {
        "tableName": "uber_tb_152",
        "columns": [
          {
            "name": "name",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE uber_tb_152 (id INT PRIMARY KEY, name VARCHAR(255), spend INT, status VARCHAR(50));",
    "seedDataSql": "INSERT INTO uber_tb_152 VALUES (1, 'Alice', 1200, 'active');\nINSERT INTO uber_tb_152 VALUES (2, 'Bob', 350, 'inactive');\nINSERT INTO uber_tb_152 VALUES (3, 'Charlie', 850, 'active');\nINSERT INTO uber_tb_152 VALUES (4, 'David', 400, 'active');",
    "expectedOutput": {
      "columns": [
        "id",
        "name",
        "spend"
      ],
      "rows": [
        [
          1,
          "Alice",
          1200
        ],
        [
          3,
          "Charlie",
          850
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: Use WHERE spend > 500 AND status = 'active'."
    ],
    "solutionSql": "SELECT id, name, spend FROM uber_tb_152 WHERE spend > 500 AND status = 'active' ORDER BY spend DESC;",
    "starterSql": "-- Problem #152: Uber High Value Account Filter #152\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 153,
    "title": "Uber Category Revenue Breakdown #153",
    "difficulty": "Medium",
    "domain": "Aggregations & Grouping",
    "companyTags": [
      "Uber"
    ],
    "description": "Calculate the total revenue and count for each product category in Uber's sales ledger.",
    "inputTables": [
      {
        "tableName": "uber_tb_153",
        "columns": [
          {
            "name": "order_id",
            "type": "INT"
          },
          {
            "name": "category",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE uber_tb_153 (order_id INT, category VARCHAR(255), revenue INT);",
    "seedDataSql": "INSERT INTO uber_tb_153 VALUES (101, 'Cloud', 500);\nINSERT INTO uber_tb_153 VALUES (102, 'Cloud', 300);\nINSERT INTO uber_tb_153 VALUES (103, 'Hardware', 150);\nINSERT INTO uber_tb_153 VALUES (104, 'Hardware', 250);",
    "expectedOutput": {
      "columns": [
        "category",
        "total_revenue",
        "order_count"
      ],
      "rows": [
        [
          "Cloud",
          800,
          2
        ],
        [
          "Hardware",
          400,
          2
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: GROUP BY category and SUM(revenue)."
    ],
    "solutionSql": "SELECT category, SUM(revenue) AS total_revenue, COUNT(*) AS order_count FROM uber_tb_153 GROUP BY category ORDER BY total_revenue DESC;",
    "starterSql": "-- Problem #153: Uber Category Revenue Breakdown #153\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 154,
    "title": "Uber User Order Match #154",
    "difficulty": "Hard",
    "domain": "Joins & Relational Sets",
    "companyTags": [
      "Uber"
    ],
    "description": "Join users and orders tables to find user order totals.",
    "inputTables": [
      {
        "tableName": "uber_tb_154",
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
    "inputSchemaSql": "CREATE TABLE uber_tb_154 (user_id INT, name VARCHAR(255));\nCREATE TABLE uber_tb_154_orders (order_id INT, user_id INT, amount INT);",
    "seedDataSql": "INSERT INTO uber_tb_154 VALUES (1, 'Alice');\nINSERT INTO uber_tb_154 VALUES (2, 'Bob');\nINSERT INTO uber_tb_154_orders VALUES (101, 1, 200);\nINSERT INTO uber_tb_154_orders VALUES (102, 1, 300);\nINSERT INTO uber_tb_154_orders VALUES (103, 2, 150);",
    "expectedOutput": {
      "columns": [
        "name",
        "total_amount"
      ],
      "rows": [
        [
          "Alice",
          500
        ],
        [
          "Bob",
          150
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: JOIN uber_tb_154_orders ON u.user_id = o.user_id."
    ],
    "solutionSql": "SELECT u.name, SUM(o.amount) AS total_amount FROM uber_tb_154 u JOIN uber_tb_154_orders o ON u.user_id = o.user_id GROUP BY u.name ORDER BY total_amount DESC;",
    "starterSql": "-- Problem #154: Uber User Order Match #154\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 155,
    "title": "Uber Query Optimization #155",
    "difficulty": "Expert",
    "domain": "Subqueries & CTEs",
    "companyTags": [
      "Uber"
    ],
    "description": "Find transactions with amount > 300.",
    "inputTables": [
      {
        "tableName": "uber_tb_155",
        "columns": [
          {
            "name": "tx_id",
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
    "inputSchemaSql": "CREATE TABLE uber_tb_155 (tx_id INT, amount INT);",
    "seedDataSql": "INSERT INTO uber_tb_155 VALUES (1, 500);\nINSERT INTO uber_tb_155 VALUES (2, 150);\nINSERT INTO uber_tb_155 VALUES (3, 400);",
    "expectedOutput": {
      "columns": [
        "tx_id",
        "amount"
      ],
      "rows": [
        [
          1,
          500
        ],
        [
          3,
          400
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: Filter amount > 300."
    ],
    "solutionSql": "SELECT tx_id, amount FROM uber_tb_155 WHERE amount > 300 ORDER BY amount DESC;",
    "starterSql": "-- Problem #155: Uber Query Optimization #155\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 156,
    "title": "Uber Salary Department Rank #156",
    "difficulty": "Easy",
    "domain": "Window Ranking & Ordering",
    "companyTags": [
      "Uber"
    ],
    "description": "Rank employees by salary within each department.",
    "inputTables": [
      {
        "tableName": "uber_tb_156",
        "columns": [
          {
            "name": "emp_id",
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
    "inputSchemaSql": "CREATE TABLE uber_tb_156 (emp_id INT, name VARCHAR(255), salary INT, dept VARCHAR(50));",
    "seedDataSql": "INSERT INTO uber_tb_156 VALUES (1, 'Alice', 95000, 'Engineering');\nINSERT INTO uber_tb_156 VALUES (2, 'Bob', 85000, 'Engineering');\nINSERT INTO uber_tb_156 VALUES (3, 'Charlie', 110000, 'Product');\nINSERT INTO uber_tb_156 VALUES (4, 'David', 90000, 'Product');",
    "expectedOutput": {
      "columns": [
        "emp_id",
        "name",
        "salary",
        "dept",
        "rnk"
      ],
      "rows": [
        [
          1,
          "Alice",
          95000,
          "Engineering",
          1
        ],
        [
          2,
          "Bob",
          85000,
          "Engineering",
          2
        ],
        [
          3,
          "Charlie",
          110000,
          "Product",
          1
        ],
        [
          4,
          "David",
          90000,
          "Product",
          2
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: DENSE_RANK() OVER (PARTITION BY dept ORDER BY salary DESC)."
    ],
    "solutionSql": "SELECT emp_id, name, salary, dept, DENSE_RANK() OVER (PARTITION BY dept ORDER BY salary DESC) AS rnk FROM uber_tb_156;",
    "starterSql": "-- Problem #156: Uber Salary Department Rank #156\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 157,
    "title": "Uber Previous Activity Delta #157",
    "difficulty": "Medium",
    "domain": "Window Offset Functions",
    "companyTags": [
      "Uber"
    ],
    "description": "Find previous login date using LAG() window function.",
    "inputTables": [
      {
        "tableName": "uber_tb_157",
        "columns": [
          {
            "name": "user_id",
            "type": "INT"
          },
          {
            "name": "login_date",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE uber_tb_157 (user_id INT, login_date VARCHAR(50));",
    "seedDataSql": "INSERT INTO uber_tb_157 VALUES (1, '2026-01-01');\nINSERT INTO uber_tb_157 VALUES (1, '2026-01-05');\nINSERT INTO uber_tb_157 VALUES (1, '2026-01-20');",
    "expectedOutput": {
      "columns": [
        "user_id",
        "login_date",
        "prev_login"
      ],
      "rows": [
        [
          1,
          "2026-01-01",
          null
        ],
        [
          1,
          "2026-01-05",
          "2026-01-01"
        ],
        [
          1,
          "2026-01-20",
          "2026-01-05"
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: LAG(login_date) OVER (PARTITION BY user_id ORDER BY login_date)."
    ],
    "solutionSql": "SELECT user_id, login_date, LAG(login_date) OVER (PARTITION BY user_id ORDER BY login_date) AS prev_login FROM uber_tb_157;",
    "starterSql": "-- Problem #157: Uber Previous Activity Delta #157\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 158,
    "title": "Uber 3-Day Moving Average #158",
    "difficulty": "Hard",
    "domain": "Sliding Window Aggregates",
    "companyTags": [
      "Uber"
    ],
    "description": "Calculate 3-day moving average of daily sales.",
    "inputTables": [
      {
        "tableName": "uber_tb_158",
        "columns": [
          {
            "name": "day_id",
            "type": "INT"
          },
          {
            "name": "sales",
            "type": "INT"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE uber_tb_158 (day_id INT, sales INT);",
    "seedDataSql": "INSERT INTO uber_tb_158 VALUES (1, 100);\nINSERT INTO uber_tb_158 VALUES (2, 120);\nINSERT INTO uber_tb_158 VALUES (3, 140);\nINSERT INTO uber_tb_158 VALUES (4, 110);",
    "expectedOutput": {
      "columns": [
        "day_id",
        "sales",
        "moving_avg"
      ],
      "rows": [
        [
          1,
          100,
          100.0
        ],
        [
          2,
          120,
          110.0
        ],
        [
          3,
          140,
          120.0
        ],
        [
          4,
          110,
          123.33333333333333
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: AVG(sales) OVER (ORDER BY day_id ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)."
    ],
    "solutionSql": "SELECT day_id, sales, AVG(sales) OVER (ORDER BY day_id ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) AS moving_avg FROM uber_tb_158;",
    "starterSql": "-- Problem #158: Uber 3-Day Moving Average #158\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 159,
    "title": "Uber Cohort Signups #159",
    "difficulty": "Expert",
    "domain": "Date & Time Analytics",
    "companyTags": [
      "Uber"
    ],
    "description": "Filter user signups in January 2026.",
    "inputTables": [
      {
        "tableName": "uber_tb_159",
        "columns": [
          {
            "name": "user_id",
            "type": "INT"
          },
          {
            "name": "signup_date",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE uber_tb_159 (user_id INT, signup_date VARCHAR(50));",
    "seedDataSql": "INSERT INTO uber_tb_159 VALUES (1, '2026-01-10');\nINSERT INTO uber_tb_159 VALUES (2, '2026-01-25');\nINSERT INTO uber_tb_159 VALUES (3, '2026-02-01');",
    "expectedOutput": {
      "columns": [
        "user_id",
        "signup_date"
      ],
      "rows": [
        [
          1,
          "2026-01-10"
        ],
        [
          2,
          "2026-01-25"
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: Filter signup_date LIKE '2026-01%'."
    ],
    "solutionSql": "SELECT user_id, signup_date FROM uber_tb_159 WHERE signup_date LIKE '2026-01%' ORDER BY user_id;",
    "starterSql": "-- Problem #159: Uber Cohort Signups #159\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 160,
    "title": "Uber Query Optimization #160",
    "difficulty": "Easy",
    "domain": "DDL, Constraints & Triggers",
    "companyTags": [
      "Uber"
    ],
    "description": "Find transactions with amount > 300.",
    "inputTables": [
      {
        "tableName": "uber_tb_160",
        "columns": [
          {
            "name": "tx_id",
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
    "inputSchemaSql": "CREATE TABLE uber_tb_160 (tx_id INT, amount INT);",
    "seedDataSql": "INSERT INTO uber_tb_160 VALUES (1, 500);\nINSERT INTO uber_tb_160 VALUES (2, 150);\nINSERT INTO uber_tb_160 VALUES (3, 400);",
    "expectedOutput": {
      "columns": [
        "tx_id",
        "amount"
      ],
      "rows": [
        [
          1,
          500
        ],
        [
          3,
          400
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: Filter amount > 300."
    ],
    "solutionSql": "SELECT tx_id, amount FROM uber_tb_160 WHERE amount > 300 ORDER BY amount DESC;",
    "starterSql": "-- Problem #160: Uber Query Optimization #160\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 161,
    "title": "Uber Org Hierarchy Depth #161",
    "difficulty": "Medium",
    "domain": "Recursive CTEs & Graphs",
    "companyTags": [
      "Uber"
    ],
    "description": "Find organizational depth level using recursive query.",
    "inputTables": [
      {
        "tableName": "uber_tb_161",
        "columns": [
          {
            "name": "emp_id",
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
    "inputSchemaSql": "CREATE TABLE uber_tb_161 (emp_id INT, name VARCHAR(255), manager_id INT);",
    "seedDataSql": "INSERT INTO uber_tb_161 VALUES (1, 'CEO', NULL);\nINSERT INTO uber_tb_161 VALUES (2, 'VP', 1);\nINSERT INTO uber_tb_161 VALUES (3, 'Eng', 2);",
    "expectedOutput": {
      "columns": [
        "emp_id",
        "name",
        "depth"
      ],
      "rows": [
        [
          1,
          "CEO",
          1
        ],
        [
          2,
          "VP",
          2
        ],
        [
          3,
          "Eng",
          3
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: Use WITH RECURSIVE Tree AS (...)"
    ],
    "solutionSql": "WITH RECURSIVE Tree AS (SELECT emp_id, name, 1 AS depth FROM uber_tb_161 WHERE manager_id IS NULL UNION ALL SELECT e.emp_id, e.name, t.depth + 1 FROM uber_tb_161 e JOIN Tree t ON e.manager_id = t.emp_id) SELECT emp_id, name, depth FROM Tree ORDER BY depth, emp_id;",
    "starterSql": "-- Problem #161: Uber Org Hierarchy Depth #161\n-- Write your SQL query solution below:\nWITH RECURSIVE Tree AS (\n\n)\nSELECT \nFROM Tree;"
  },
  {
    "id": 162,
    "title": "Uber High Value Account Filter #162",
    "difficulty": "Hard",
    "domain": "Filtering & String Functions",
    "companyTags": [
      "Uber"
    ],
    "description": "Write a query to find active users in Uber's database with spend > 500.",
    "inputTables": [
      {
        "tableName": "uber_tb_162",
        "columns": [
          {
            "name": "name",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE uber_tb_162 (id INT PRIMARY KEY, name VARCHAR(255), spend INT, status VARCHAR(50));",
    "seedDataSql": "INSERT INTO uber_tb_162 VALUES (1, 'Alice', 1200, 'active');\nINSERT INTO uber_tb_162 VALUES (2, 'Bob', 350, 'inactive');\nINSERT INTO uber_tb_162 VALUES (3, 'Charlie', 850, 'active');\nINSERT INTO uber_tb_162 VALUES (4, 'David', 400, 'active');",
    "expectedOutput": {
      "columns": [
        "id",
        "name",
        "spend"
      ],
      "rows": [
        [
          1,
          "Alice",
          1200
        ],
        [
          3,
          "Charlie",
          850
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: Use WHERE spend > 500 AND status = 'active'."
    ],
    "solutionSql": "SELECT id, name, spend FROM uber_tb_162 WHERE spend > 500 AND status = 'active' ORDER BY spend DESC;",
    "starterSql": "-- Problem #162: Uber High Value Account Filter #162\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 163,
    "title": "Uber Category Revenue Breakdown #163",
    "difficulty": "Expert",
    "domain": "Aggregations & Grouping",
    "companyTags": [
      "Uber"
    ],
    "description": "Calculate the total revenue and count for each product category in Uber's sales ledger.",
    "inputTables": [
      {
        "tableName": "uber_tb_163",
        "columns": [
          {
            "name": "order_id",
            "type": "INT"
          },
          {
            "name": "category",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE uber_tb_163 (order_id INT, category VARCHAR(255), revenue INT);",
    "seedDataSql": "INSERT INTO uber_tb_163 VALUES (101, 'Cloud', 500);\nINSERT INTO uber_tb_163 VALUES (102, 'Cloud', 300);\nINSERT INTO uber_tb_163 VALUES (103, 'Hardware', 150);\nINSERT INTO uber_tb_163 VALUES (104, 'Hardware', 250);",
    "expectedOutput": {
      "columns": [
        "category",
        "total_revenue",
        "order_count"
      ],
      "rows": [
        [
          "Cloud",
          800,
          2
        ],
        [
          "Hardware",
          400,
          2
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: GROUP BY category and SUM(revenue)."
    ],
    "solutionSql": "SELECT category, SUM(revenue) AS total_revenue, COUNT(*) AS order_count FROM uber_tb_163 GROUP BY category ORDER BY total_revenue DESC;",
    "starterSql": "-- Problem #163: Uber Category Revenue Breakdown #163\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 164,
    "title": "Uber User Order Match #164",
    "difficulty": "Easy",
    "domain": "Joins & Relational Sets",
    "companyTags": [
      "Uber"
    ],
    "description": "Join users and orders tables to find user order totals.",
    "inputTables": [
      {
        "tableName": "uber_tb_164",
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
    "inputSchemaSql": "CREATE TABLE uber_tb_164 (user_id INT, name VARCHAR(255));\nCREATE TABLE uber_tb_164_orders (order_id INT, user_id INT, amount INT);",
    "seedDataSql": "INSERT INTO uber_tb_164 VALUES (1, 'Alice');\nINSERT INTO uber_tb_164 VALUES (2, 'Bob');\nINSERT INTO uber_tb_164_orders VALUES (101, 1, 200);\nINSERT INTO uber_tb_164_orders VALUES (102, 1, 300);\nINSERT INTO uber_tb_164_orders VALUES (103, 2, 150);",
    "expectedOutput": {
      "columns": [
        "name",
        "total_amount"
      ],
      "rows": [
        [
          "Alice",
          500
        ],
        [
          "Bob",
          150
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: JOIN uber_tb_164_orders ON u.user_id = o.user_id."
    ],
    "solutionSql": "SELECT u.name, SUM(o.amount) AS total_amount FROM uber_tb_164 u JOIN uber_tb_164_orders o ON u.user_id = o.user_id GROUP BY u.name ORDER BY total_amount DESC;",
    "starterSql": "-- Problem #164: Uber User Order Match #164\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 165,
    "title": "Uber Query Optimization #165",
    "difficulty": "Medium",
    "domain": "Subqueries & CTEs",
    "companyTags": [
      "Uber"
    ],
    "description": "Find transactions with amount > 300.",
    "inputTables": [
      {
        "tableName": "uber_tb_165",
        "columns": [
          {
            "name": "tx_id",
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
    "inputSchemaSql": "CREATE TABLE uber_tb_165 (tx_id INT, amount INT);",
    "seedDataSql": "INSERT INTO uber_tb_165 VALUES (1, 500);\nINSERT INTO uber_tb_165 VALUES (2, 150);\nINSERT INTO uber_tb_165 VALUES (3, 400);",
    "expectedOutput": {
      "columns": [
        "tx_id",
        "amount"
      ],
      "rows": [
        [
          1,
          500
        ],
        [
          3,
          400
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: Filter amount > 300."
    ],
    "solutionSql": "SELECT tx_id, amount FROM uber_tb_165 WHERE amount > 300 ORDER BY amount DESC;",
    "starterSql": "-- Problem #165: Uber Query Optimization #165\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 166,
    "title": "Uber Salary Department Rank #166",
    "difficulty": "Hard",
    "domain": "Window Ranking & Ordering",
    "companyTags": [
      "Uber"
    ],
    "description": "Rank employees by salary within each department.",
    "inputTables": [
      {
        "tableName": "uber_tb_166",
        "columns": [
          {
            "name": "emp_id",
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
    "inputSchemaSql": "CREATE TABLE uber_tb_166 (emp_id INT, name VARCHAR(255), salary INT, dept VARCHAR(50));",
    "seedDataSql": "INSERT INTO uber_tb_166 VALUES (1, 'Alice', 95000, 'Engineering');\nINSERT INTO uber_tb_166 VALUES (2, 'Bob', 85000, 'Engineering');\nINSERT INTO uber_tb_166 VALUES (3, 'Charlie', 110000, 'Product');\nINSERT INTO uber_tb_166 VALUES (4, 'David', 90000, 'Product');",
    "expectedOutput": {
      "columns": [
        "emp_id",
        "name",
        "salary",
        "dept",
        "rnk"
      ],
      "rows": [
        [
          1,
          "Alice",
          95000,
          "Engineering",
          1
        ],
        [
          2,
          "Bob",
          85000,
          "Engineering",
          2
        ],
        [
          3,
          "Charlie",
          110000,
          "Product",
          1
        ],
        [
          4,
          "David",
          90000,
          "Product",
          2
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: DENSE_RANK() OVER (PARTITION BY dept ORDER BY salary DESC)."
    ],
    "solutionSql": "SELECT emp_id, name, salary, dept, DENSE_RANK() OVER (PARTITION BY dept ORDER BY salary DESC) AS rnk FROM uber_tb_166;",
    "starterSql": "-- Problem #166: Uber Salary Department Rank #166\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 167,
    "title": "Uber Previous Activity Delta #167",
    "difficulty": "Expert",
    "domain": "Window Offset Functions",
    "companyTags": [
      "Uber"
    ],
    "description": "Find previous login date using LAG() window function.",
    "inputTables": [
      {
        "tableName": "uber_tb_167",
        "columns": [
          {
            "name": "user_id",
            "type": "INT"
          },
          {
            "name": "login_date",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE uber_tb_167 (user_id INT, login_date VARCHAR(50));",
    "seedDataSql": "INSERT INTO uber_tb_167 VALUES (1, '2026-01-01');\nINSERT INTO uber_tb_167 VALUES (1, '2026-01-05');\nINSERT INTO uber_tb_167 VALUES (1, '2026-01-20');",
    "expectedOutput": {
      "columns": [
        "user_id",
        "login_date",
        "prev_login"
      ],
      "rows": [
        [
          1,
          "2026-01-01",
          null
        ],
        [
          1,
          "2026-01-05",
          "2026-01-01"
        ],
        [
          1,
          "2026-01-20",
          "2026-01-05"
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: LAG(login_date) OVER (PARTITION BY user_id ORDER BY login_date)."
    ],
    "solutionSql": "SELECT user_id, login_date, LAG(login_date) OVER (PARTITION BY user_id ORDER BY login_date) AS prev_login FROM uber_tb_167;",
    "starterSql": "-- Problem #167: Uber Previous Activity Delta #167\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 168,
    "title": "Uber 3-Day Moving Average #168",
    "difficulty": "Easy",
    "domain": "Sliding Window Aggregates",
    "companyTags": [
      "Uber"
    ],
    "description": "Calculate 3-day moving average of daily sales.",
    "inputTables": [
      {
        "tableName": "uber_tb_168",
        "columns": [
          {
            "name": "day_id",
            "type": "INT"
          },
          {
            "name": "sales",
            "type": "INT"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE uber_tb_168 (day_id INT, sales INT);",
    "seedDataSql": "INSERT INTO uber_tb_168 VALUES (1, 100);\nINSERT INTO uber_tb_168 VALUES (2, 120);\nINSERT INTO uber_tb_168 VALUES (3, 140);\nINSERT INTO uber_tb_168 VALUES (4, 110);",
    "expectedOutput": {
      "columns": [
        "day_id",
        "sales",
        "moving_avg"
      ],
      "rows": [
        [
          1,
          100,
          100.0
        ],
        [
          2,
          120,
          110.0
        ],
        [
          3,
          140,
          120.0
        ],
        [
          4,
          110,
          123.33333333333333
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: AVG(sales) OVER (ORDER BY day_id ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)."
    ],
    "solutionSql": "SELECT day_id, sales, AVG(sales) OVER (ORDER BY day_id ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) AS moving_avg FROM uber_tb_168;",
    "starterSql": "-- Problem #168: Uber 3-Day Moving Average #168\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 169,
    "title": "Uber Cohort Signups #169",
    "difficulty": "Medium",
    "domain": "Date & Time Analytics",
    "companyTags": [
      "Uber"
    ],
    "description": "Filter user signups in January 2026.",
    "inputTables": [
      {
        "tableName": "uber_tb_169",
        "columns": [
          {
            "name": "user_id",
            "type": "INT"
          },
          {
            "name": "signup_date",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE uber_tb_169 (user_id INT, signup_date VARCHAR(50));",
    "seedDataSql": "INSERT INTO uber_tb_169 VALUES (1, '2026-01-10');\nINSERT INTO uber_tb_169 VALUES (2, '2026-01-25');\nINSERT INTO uber_tb_169 VALUES (3, '2026-02-01');",
    "expectedOutput": {
      "columns": [
        "user_id",
        "signup_date"
      ],
      "rows": [
        [
          1,
          "2026-01-10"
        ],
        [
          2,
          "2026-01-25"
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: Filter signup_date LIKE '2026-01%'."
    ],
    "solutionSql": "SELECT user_id, signup_date FROM uber_tb_169 WHERE signup_date LIKE '2026-01%' ORDER BY user_id;",
    "starterSql": "-- Problem #169: Uber Cohort Signups #169\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 170,
    "title": "Uber Query Optimization #170",
    "difficulty": "Hard",
    "domain": "DDL, Constraints & Triggers",
    "companyTags": [
      "Uber"
    ],
    "description": "Find transactions with amount > 300.",
    "inputTables": [
      {
        "tableName": "uber_tb_170",
        "columns": [
          {
            "name": "tx_id",
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
    "inputSchemaSql": "CREATE TABLE uber_tb_170 (tx_id INT, amount INT);",
    "seedDataSql": "INSERT INTO uber_tb_170 VALUES (1, 500);\nINSERT INTO uber_tb_170 VALUES (2, 150);\nINSERT INTO uber_tb_170 VALUES (3, 400);",
    "expectedOutput": {
      "columns": [
        "tx_id",
        "amount"
      ],
      "rows": [
        [
          1,
          500
        ],
        [
          3,
          400
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: Filter amount > 300."
    ],
    "solutionSql": "SELECT tx_id, amount FROM uber_tb_170 WHERE amount > 300 ORDER BY amount DESC;",
    "starterSql": "-- Problem #170: Uber Query Optimization #170\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 171,
    "title": "Uber Org Hierarchy Depth #171",
    "difficulty": "Expert",
    "domain": "Recursive CTEs & Graphs",
    "companyTags": [
      "Uber"
    ],
    "description": "Find organizational depth level using recursive query.",
    "inputTables": [
      {
        "tableName": "uber_tb_171",
        "columns": [
          {
            "name": "emp_id",
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
    "inputSchemaSql": "CREATE TABLE uber_tb_171 (emp_id INT, name VARCHAR(255), manager_id INT);",
    "seedDataSql": "INSERT INTO uber_tb_171 VALUES (1, 'CEO', NULL);\nINSERT INTO uber_tb_171 VALUES (2, 'VP', 1);\nINSERT INTO uber_tb_171 VALUES (3, 'Eng', 2);",
    "expectedOutput": {
      "columns": [
        "emp_id",
        "name",
        "depth"
      ],
      "rows": [
        [
          1,
          "CEO",
          1
        ],
        [
          2,
          "VP",
          2
        ],
        [
          3,
          "Eng",
          3
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: Use WITH RECURSIVE Tree AS (...)"
    ],
    "solutionSql": "WITH RECURSIVE Tree AS (SELECT emp_id, name, 1 AS depth FROM uber_tb_171 WHERE manager_id IS NULL UNION ALL SELECT e.emp_id, e.name, t.depth + 1 FROM uber_tb_171 e JOIN Tree t ON e.manager_id = t.emp_id) SELECT emp_id, name, depth FROM Tree ORDER BY depth, emp_id;",
    "starterSql": "-- Problem #171: Uber Org Hierarchy Depth #171\n-- Write your SQL query solution below:\nWITH RECURSIVE Tree AS (\n\n)\nSELECT \nFROM Tree;"
  },
  {
    "id": 172,
    "title": "Uber High Value Account Filter #172",
    "difficulty": "Easy",
    "domain": "Filtering & String Functions",
    "companyTags": [
      "Uber"
    ],
    "description": "Write a query to find active users in Uber's database with spend > 500.",
    "inputTables": [
      {
        "tableName": "uber_tb_172",
        "columns": [
          {
            "name": "name",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE uber_tb_172 (id INT PRIMARY KEY, name VARCHAR(255), spend INT, status VARCHAR(50));",
    "seedDataSql": "INSERT INTO uber_tb_172 VALUES (1, 'Alice', 1200, 'active');\nINSERT INTO uber_tb_172 VALUES (2, 'Bob', 350, 'inactive');\nINSERT INTO uber_tb_172 VALUES (3, 'Charlie', 850, 'active');\nINSERT INTO uber_tb_172 VALUES (4, 'David', 400, 'active');",
    "expectedOutput": {
      "columns": [
        "id",
        "name",
        "spend"
      ],
      "rows": [
        [
          1,
          "Alice",
          1200
        ],
        [
          3,
          "Charlie",
          850
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: Use WHERE spend > 500 AND status = 'active'."
    ],
    "solutionSql": "SELECT id, name, spend FROM uber_tb_172 WHERE spend > 500 AND status = 'active' ORDER BY spend DESC;",
    "starterSql": "-- Problem #172: Uber High Value Account Filter #172\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 173,
    "title": "Uber Category Revenue Breakdown #173",
    "difficulty": "Medium",
    "domain": "Aggregations & Grouping",
    "companyTags": [
      "Uber"
    ],
    "description": "Calculate the total revenue and count for each product category in Uber's sales ledger.",
    "inputTables": [
      {
        "tableName": "uber_tb_173",
        "columns": [
          {
            "name": "order_id",
            "type": "INT"
          },
          {
            "name": "category",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE uber_tb_173 (order_id INT, category VARCHAR(255), revenue INT);",
    "seedDataSql": "INSERT INTO uber_tb_173 VALUES (101, 'Cloud', 500);\nINSERT INTO uber_tb_173 VALUES (102, 'Cloud', 300);\nINSERT INTO uber_tb_173 VALUES (103, 'Hardware', 150);\nINSERT INTO uber_tb_173 VALUES (104, 'Hardware', 250);",
    "expectedOutput": {
      "columns": [
        "category",
        "total_revenue",
        "order_count"
      ],
      "rows": [
        [
          "Cloud",
          800,
          2
        ],
        [
          "Hardware",
          400,
          2
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: GROUP BY category and SUM(revenue)."
    ],
    "solutionSql": "SELECT category, SUM(revenue) AS total_revenue, COUNT(*) AS order_count FROM uber_tb_173 GROUP BY category ORDER BY total_revenue DESC;",
    "starterSql": "-- Problem #173: Uber Category Revenue Breakdown #173\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 174,
    "title": "Uber User Order Match #174",
    "difficulty": "Hard",
    "domain": "Joins & Relational Sets",
    "companyTags": [
      "Uber"
    ],
    "description": "Join users and orders tables to find user order totals.",
    "inputTables": [
      {
        "tableName": "uber_tb_174",
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
    "inputSchemaSql": "CREATE TABLE uber_tb_174 (user_id INT, name VARCHAR(255));\nCREATE TABLE uber_tb_174_orders (order_id INT, user_id INT, amount INT);",
    "seedDataSql": "INSERT INTO uber_tb_174 VALUES (1, 'Alice');\nINSERT INTO uber_tb_174 VALUES (2, 'Bob');\nINSERT INTO uber_tb_174_orders VALUES (101, 1, 200);\nINSERT INTO uber_tb_174_orders VALUES (102, 1, 300);\nINSERT INTO uber_tb_174_orders VALUES (103, 2, 150);",
    "expectedOutput": {
      "columns": [
        "name",
        "total_amount"
      ],
      "rows": [
        [
          "Alice",
          500
        ],
        [
          "Bob",
          150
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: JOIN uber_tb_174_orders ON u.user_id = o.user_id."
    ],
    "solutionSql": "SELECT u.name, SUM(o.amount) AS total_amount FROM uber_tb_174 u JOIN uber_tb_174_orders o ON u.user_id = o.user_id GROUP BY u.name ORDER BY total_amount DESC;",
    "starterSql": "-- Problem #174: Uber User Order Match #174\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 175,
    "title": "Uber Query Optimization #175",
    "difficulty": "Expert",
    "domain": "Subqueries & CTEs",
    "companyTags": [
      "Uber"
    ],
    "description": "Find transactions with amount > 300.",
    "inputTables": [
      {
        "tableName": "uber_tb_175",
        "columns": [
          {
            "name": "tx_id",
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
    "inputSchemaSql": "CREATE TABLE uber_tb_175 (tx_id INT, amount INT);",
    "seedDataSql": "INSERT INTO uber_tb_175 VALUES (1, 500);\nINSERT INTO uber_tb_175 VALUES (2, 150);\nINSERT INTO uber_tb_175 VALUES (3, 400);",
    "expectedOutput": {
      "columns": [
        "tx_id",
        "amount"
      ],
      "rows": [
        [
          1,
          500
        ],
        [
          3,
          400
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: Filter amount > 300."
    ],
    "solutionSql": "SELECT tx_id, amount FROM uber_tb_175 WHERE amount > 300 ORDER BY amount DESC;",
    "starterSql": "-- Problem #175: Uber Query Optimization #175\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 176,
    "title": "Uber Salary Department Rank #176",
    "difficulty": "Easy",
    "domain": "Window Ranking & Ordering",
    "companyTags": [
      "Uber"
    ],
    "description": "Rank employees by salary within each department.",
    "inputTables": [
      {
        "tableName": "uber_tb_176",
        "columns": [
          {
            "name": "emp_id",
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
    "inputSchemaSql": "CREATE TABLE uber_tb_176 (emp_id INT, name VARCHAR(255), salary INT, dept VARCHAR(50));",
    "seedDataSql": "INSERT INTO uber_tb_176 VALUES (1, 'Alice', 95000, 'Engineering');\nINSERT INTO uber_tb_176 VALUES (2, 'Bob', 85000, 'Engineering');\nINSERT INTO uber_tb_176 VALUES (3, 'Charlie', 110000, 'Product');\nINSERT INTO uber_tb_176 VALUES (4, 'David', 90000, 'Product');",
    "expectedOutput": {
      "columns": [
        "emp_id",
        "name",
        "salary",
        "dept",
        "rnk"
      ],
      "rows": [
        [
          1,
          "Alice",
          95000,
          "Engineering",
          1
        ],
        [
          2,
          "Bob",
          85000,
          "Engineering",
          2
        ],
        [
          3,
          "Charlie",
          110000,
          "Product",
          1
        ],
        [
          4,
          "David",
          90000,
          "Product",
          2
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: DENSE_RANK() OVER (PARTITION BY dept ORDER BY salary DESC)."
    ],
    "solutionSql": "SELECT emp_id, name, salary, dept, DENSE_RANK() OVER (PARTITION BY dept ORDER BY salary DESC) AS rnk FROM uber_tb_176;",
    "starterSql": "-- Problem #176: Uber Salary Department Rank #176\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 177,
    "title": "Stripe High Value Account Filter #177",
    "difficulty": "Easy",
    "domain": "Filtering & String Functions",
    "companyTags": [
      "Stripe"
    ],
    "description": "Write a query to find active users in Stripe's database with spend > 500.",
    "inputTables": [
      {
        "tableName": "stripe_tb_177",
        "columns": [
          {
            "name": "name",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE stripe_tb_177 (id INT PRIMARY KEY, name VARCHAR(255), spend INT, status VARCHAR(50));",
    "seedDataSql": "INSERT INTO stripe_tb_177 VALUES (1, 'Alice', 1200, 'active');\nINSERT INTO stripe_tb_177 VALUES (2, 'Bob', 350, 'inactive');\nINSERT INTO stripe_tb_177 VALUES (3, 'Charlie', 850, 'active');\nINSERT INTO stripe_tb_177 VALUES (4, 'David', 400, 'active');",
    "expectedOutput": {
      "columns": [
        "id",
        "name",
        "spend"
      ],
      "rows": [
        [
          1,
          "Alice",
          1200
        ],
        [
          3,
          "Charlie",
          850
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: Use WHERE spend > 500 AND status = 'active'."
    ],
    "solutionSql": "SELECT id, name, spend FROM stripe_tb_177 WHERE spend > 500 AND status = 'active' ORDER BY spend DESC;",
    "starterSql": "-- Problem #177: Stripe High Value Account Filter #177\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 178,
    "title": "Stripe Category Revenue Breakdown #178",
    "difficulty": "Medium",
    "domain": "Aggregations & Grouping",
    "companyTags": [
      "Stripe"
    ],
    "description": "Calculate the total revenue and count for each product category in Stripe's sales ledger.",
    "inputTables": [
      {
        "tableName": "stripe_tb_178",
        "columns": [
          {
            "name": "order_id",
            "type": "INT"
          },
          {
            "name": "category",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE stripe_tb_178 (order_id INT, category VARCHAR(255), revenue INT);",
    "seedDataSql": "INSERT INTO stripe_tb_178 VALUES (101, 'Cloud', 500);\nINSERT INTO stripe_tb_178 VALUES (102, 'Cloud', 300);\nINSERT INTO stripe_tb_178 VALUES (103, 'Hardware', 150);\nINSERT INTO stripe_tb_178 VALUES (104, 'Hardware', 250);",
    "expectedOutput": {
      "columns": [
        "category",
        "total_revenue",
        "order_count"
      ],
      "rows": [
        [
          "Cloud",
          800,
          2
        ],
        [
          "Hardware",
          400,
          2
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: GROUP BY category and SUM(revenue)."
    ],
    "solutionSql": "SELECT category, SUM(revenue) AS total_revenue, COUNT(*) AS order_count FROM stripe_tb_178 GROUP BY category ORDER BY total_revenue DESC;",
    "starterSql": "-- Problem #178: Stripe Category Revenue Breakdown #178\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 179,
    "title": "Stripe User Order Match #179",
    "difficulty": "Hard",
    "domain": "Joins & Relational Sets",
    "companyTags": [
      "Stripe"
    ],
    "description": "Join users and orders tables to find user order totals.",
    "inputTables": [
      {
        "tableName": "stripe_tb_179",
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
    "inputSchemaSql": "CREATE TABLE stripe_tb_179 (user_id INT, name VARCHAR(255));\nCREATE TABLE stripe_tb_179_orders (order_id INT, user_id INT, amount INT);",
    "seedDataSql": "INSERT INTO stripe_tb_179 VALUES (1, 'Alice');\nINSERT INTO stripe_tb_179 VALUES (2, 'Bob');\nINSERT INTO stripe_tb_179_orders VALUES (101, 1, 200);\nINSERT INTO stripe_tb_179_orders VALUES (102, 1, 300);\nINSERT INTO stripe_tb_179_orders VALUES (103, 2, 150);",
    "expectedOutput": {
      "columns": [
        "name",
        "total_amount"
      ],
      "rows": [
        [
          "Alice",
          500
        ],
        [
          "Bob",
          150
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: JOIN stripe_tb_179_orders ON u.user_id = o.user_id."
    ],
    "solutionSql": "SELECT u.name, SUM(o.amount) AS total_amount FROM stripe_tb_179 u JOIN stripe_tb_179_orders o ON u.user_id = o.user_id GROUP BY u.name ORDER BY total_amount DESC;",
    "starterSql": "-- Problem #179: Stripe User Order Match #179\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 180,
    "title": "Stripe Query Optimization #180",
    "difficulty": "Expert",
    "domain": "Subqueries & CTEs",
    "companyTags": [
      "Stripe"
    ],
    "description": "Find transactions with amount > 300.",
    "inputTables": [
      {
        "tableName": "stripe_tb_180",
        "columns": [
          {
            "name": "tx_id",
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
    "inputSchemaSql": "CREATE TABLE stripe_tb_180 (tx_id INT, amount INT);",
    "seedDataSql": "INSERT INTO stripe_tb_180 VALUES (1, 500);\nINSERT INTO stripe_tb_180 VALUES (2, 150);\nINSERT INTO stripe_tb_180 VALUES (3, 400);",
    "expectedOutput": {
      "columns": [
        "tx_id",
        "amount"
      ],
      "rows": [
        [
          1,
          500
        ],
        [
          3,
          400
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: Filter amount > 300."
    ],
    "solutionSql": "SELECT tx_id, amount FROM stripe_tb_180 WHERE amount > 300 ORDER BY amount DESC;",
    "starterSql": "-- Problem #180: Stripe Query Optimization #180\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 181,
    "title": "Stripe Salary Department Rank #181",
    "difficulty": "Easy",
    "domain": "Window Ranking & Ordering",
    "companyTags": [
      "Stripe"
    ],
    "description": "Rank employees by salary within each department.",
    "inputTables": [
      {
        "tableName": "stripe_tb_181",
        "columns": [
          {
            "name": "emp_id",
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
    "inputSchemaSql": "CREATE TABLE stripe_tb_181 (emp_id INT, name VARCHAR(255), salary INT, dept VARCHAR(50));",
    "seedDataSql": "INSERT INTO stripe_tb_181 VALUES (1, 'Alice', 95000, 'Engineering');\nINSERT INTO stripe_tb_181 VALUES (2, 'Bob', 85000, 'Engineering');\nINSERT INTO stripe_tb_181 VALUES (3, 'Charlie', 110000, 'Product');\nINSERT INTO stripe_tb_181 VALUES (4, 'David', 90000, 'Product');",
    "expectedOutput": {
      "columns": [
        "emp_id",
        "name",
        "salary",
        "dept",
        "rnk"
      ],
      "rows": [
        [
          1,
          "Alice",
          95000,
          "Engineering",
          1
        ],
        [
          2,
          "Bob",
          85000,
          "Engineering",
          2
        ],
        [
          3,
          "Charlie",
          110000,
          "Product",
          1
        ],
        [
          4,
          "David",
          90000,
          "Product",
          2
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: DENSE_RANK() OVER (PARTITION BY dept ORDER BY salary DESC)."
    ],
    "solutionSql": "SELECT emp_id, name, salary, dept, DENSE_RANK() OVER (PARTITION BY dept ORDER BY salary DESC) AS rnk FROM stripe_tb_181;",
    "starterSql": "-- Problem #181: Stripe Salary Department Rank #181\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 182,
    "title": "Stripe Previous Activity Delta #182",
    "difficulty": "Medium",
    "domain": "Window Offset Functions",
    "companyTags": [
      "Stripe"
    ],
    "description": "Find previous login date using LAG() window function.",
    "inputTables": [
      {
        "tableName": "stripe_tb_182",
        "columns": [
          {
            "name": "user_id",
            "type": "INT"
          },
          {
            "name": "login_date",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE stripe_tb_182 (user_id INT, login_date VARCHAR(50));",
    "seedDataSql": "INSERT INTO stripe_tb_182 VALUES (1, '2026-01-01');\nINSERT INTO stripe_tb_182 VALUES (1, '2026-01-05');\nINSERT INTO stripe_tb_182 VALUES (1, '2026-01-20');",
    "expectedOutput": {
      "columns": [
        "user_id",
        "login_date",
        "prev_login"
      ],
      "rows": [
        [
          1,
          "2026-01-01",
          null
        ],
        [
          1,
          "2026-01-05",
          "2026-01-01"
        ],
        [
          1,
          "2026-01-20",
          "2026-01-05"
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: LAG(login_date) OVER (PARTITION BY user_id ORDER BY login_date)."
    ],
    "solutionSql": "SELECT user_id, login_date, LAG(login_date) OVER (PARTITION BY user_id ORDER BY login_date) AS prev_login FROM stripe_tb_182;",
    "starterSql": "-- Problem #182: Stripe Previous Activity Delta #182\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 183,
    "title": "Stripe 3-Day Moving Average #183",
    "difficulty": "Hard",
    "domain": "Sliding Window Aggregates",
    "companyTags": [
      "Stripe"
    ],
    "description": "Calculate 3-day moving average of daily sales.",
    "inputTables": [
      {
        "tableName": "stripe_tb_183",
        "columns": [
          {
            "name": "day_id",
            "type": "INT"
          },
          {
            "name": "sales",
            "type": "INT"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE stripe_tb_183 (day_id INT, sales INT);",
    "seedDataSql": "INSERT INTO stripe_tb_183 VALUES (1, 100);\nINSERT INTO stripe_tb_183 VALUES (2, 120);\nINSERT INTO stripe_tb_183 VALUES (3, 140);\nINSERT INTO stripe_tb_183 VALUES (4, 110);",
    "expectedOutput": {
      "columns": [
        "day_id",
        "sales",
        "moving_avg"
      ],
      "rows": [
        [
          1,
          100,
          100.0
        ],
        [
          2,
          120,
          110.0
        ],
        [
          3,
          140,
          120.0
        ],
        [
          4,
          110,
          123.33333333333333
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: AVG(sales) OVER (ORDER BY day_id ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)."
    ],
    "solutionSql": "SELECT day_id, sales, AVG(sales) OVER (ORDER BY day_id ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) AS moving_avg FROM stripe_tb_183;",
    "starterSql": "-- Problem #183: Stripe 3-Day Moving Average #183\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 184,
    "title": "Stripe Cohort Signups #184",
    "difficulty": "Expert",
    "domain": "Date & Time Analytics",
    "companyTags": [
      "Stripe"
    ],
    "description": "Filter user signups in January 2026.",
    "inputTables": [
      {
        "tableName": "stripe_tb_184",
        "columns": [
          {
            "name": "user_id",
            "type": "INT"
          },
          {
            "name": "signup_date",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE stripe_tb_184 (user_id INT, signup_date VARCHAR(50));",
    "seedDataSql": "INSERT INTO stripe_tb_184 VALUES (1, '2026-01-10');\nINSERT INTO stripe_tb_184 VALUES (2, '2026-01-25');\nINSERT INTO stripe_tb_184 VALUES (3, '2026-02-01');",
    "expectedOutput": {
      "columns": [
        "user_id",
        "signup_date"
      ],
      "rows": [
        [
          1,
          "2026-01-10"
        ],
        [
          2,
          "2026-01-25"
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: Filter signup_date LIKE '2026-01%'."
    ],
    "solutionSql": "SELECT user_id, signup_date FROM stripe_tb_184 WHERE signup_date LIKE '2026-01%' ORDER BY user_id;",
    "starterSql": "-- Problem #184: Stripe Cohort Signups #184\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 185,
    "title": "Stripe Query Optimization #185",
    "difficulty": "Easy",
    "domain": "DDL, Constraints & Triggers",
    "companyTags": [
      "Stripe"
    ],
    "description": "Find transactions with amount > 300.",
    "inputTables": [
      {
        "tableName": "stripe_tb_185",
        "columns": [
          {
            "name": "tx_id",
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
    "inputSchemaSql": "CREATE TABLE stripe_tb_185 (tx_id INT, amount INT);",
    "seedDataSql": "INSERT INTO stripe_tb_185 VALUES (1, 500);\nINSERT INTO stripe_tb_185 VALUES (2, 150);\nINSERT INTO stripe_tb_185 VALUES (3, 400);",
    "expectedOutput": {
      "columns": [
        "tx_id",
        "amount"
      ],
      "rows": [
        [
          1,
          500
        ],
        [
          3,
          400
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: Filter amount > 300."
    ],
    "solutionSql": "SELECT tx_id, amount FROM stripe_tb_185 WHERE amount > 300 ORDER BY amount DESC;",
    "starterSql": "-- Problem #185: Stripe Query Optimization #185\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 186,
    "title": "Stripe Org Hierarchy Depth #186",
    "difficulty": "Medium",
    "domain": "Recursive CTEs & Graphs",
    "companyTags": [
      "Stripe"
    ],
    "description": "Find organizational depth level using recursive query.",
    "inputTables": [
      {
        "tableName": "stripe_tb_186",
        "columns": [
          {
            "name": "emp_id",
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
    "inputSchemaSql": "CREATE TABLE stripe_tb_186 (emp_id INT, name VARCHAR(255), manager_id INT);",
    "seedDataSql": "INSERT INTO stripe_tb_186 VALUES (1, 'CEO', NULL);\nINSERT INTO stripe_tb_186 VALUES (2, 'VP', 1);\nINSERT INTO stripe_tb_186 VALUES (3, 'Eng', 2);",
    "expectedOutput": {
      "columns": [
        "emp_id",
        "name",
        "depth"
      ],
      "rows": [
        [
          1,
          "CEO",
          1
        ],
        [
          2,
          "VP",
          2
        ],
        [
          3,
          "Eng",
          3
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: Use WITH RECURSIVE Tree AS (...)"
    ],
    "solutionSql": "WITH RECURSIVE Tree AS (SELECT emp_id, name, 1 AS depth FROM stripe_tb_186 WHERE manager_id IS NULL UNION ALL SELECT e.emp_id, e.name, t.depth + 1 FROM stripe_tb_186 e JOIN Tree t ON e.manager_id = t.emp_id) SELECT emp_id, name, depth FROM Tree ORDER BY depth, emp_id;",
    "starterSql": "-- Problem #186: Stripe Org Hierarchy Depth #186\n-- Write your SQL query solution below:\nWITH RECURSIVE Tree AS (\n\n)\nSELECT \nFROM Tree;"
  },
  {
    "id": 187,
    "title": "Stripe High Value Account Filter #187",
    "difficulty": "Hard",
    "domain": "Filtering & String Functions",
    "companyTags": [
      "Stripe"
    ],
    "description": "Write a query to find active users in Stripe's database with spend > 500.",
    "inputTables": [
      {
        "tableName": "stripe_tb_187",
        "columns": [
          {
            "name": "name",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE stripe_tb_187 (id INT PRIMARY KEY, name VARCHAR(255), spend INT, status VARCHAR(50));",
    "seedDataSql": "INSERT INTO stripe_tb_187 VALUES (1, 'Alice', 1200, 'active');\nINSERT INTO stripe_tb_187 VALUES (2, 'Bob', 350, 'inactive');\nINSERT INTO stripe_tb_187 VALUES (3, 'Charlie', 850, 'active');\nINSERT INTO stripe_tb_187 VALUES (4, 'David', 400, 'active');",
    "expectedOutput": {
      "columns": [
        "id",
        "name",
        "spend"
      ],
      "rows": [
        [
          1,
          "Alice",
          1200
        ],
        [
          3,
          "Charlie",
          850
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: Use WHERE spend > 500 AND status = 'active'."
    ],
    "solutionSql": "SELECT id, name, spend FROM stripe_tb_187 WHERE spend > 500 AND status = 'active' ORDER BY spend DESC;",
    "starterSql": "-- Problem #187: Stripe High Value Account Filter #187\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 188,
    "title": "Stripe Category Revenue Breakdown #188",
    "difficulty": "Expert",
    "domain": "Aggregations & Grouping",
    "companyTags": [
      "Stripe"
    ],
    "description": "Calculate the total revenue and count for each product category in Stripe's sales ledger.",
    "inputTables": [
      {
        "tableName": "stripe_tb_188",
        "columns": [
          {
            "name": "order_id",
            "type": "INT"
          },
          {
            "name": "category",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE stripe_tb_188 (order_id INT, category VARCHAR(255), revenue INT);",
    "seedDataSql": "INSERT INTO stripe_tb_188 VALUES (101, 'Cloud', 500);\nINSERT INTO stripe_tb_188 VALUES (102, 'Cloud', 300);\nINSERT INTO stripe_tb_188 VALUES (103, 'Hardware', 150);\nINSERT INTO stripe_tb_188 VALUES (104, 'Hardware', 250);",
    "expectedOutput": {
      "columns": [
        "category",
        "total_revenue",
        "order_count"
      ],
      "rows": [
        [
          "Cloud",
          800,
          2
        ],
        [
          "Hardware",
          400,
          2
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: GROUP BY category and SUM(revenue)."
    ],
    "solutionSql": "SELECT category, SUM(revenue) AS total_revenue, COUNT(*) AS order_count FROM stripe_tb_188 GROUP BY category ORDER BY total_revenue DESC;",
    "starterSql": "-- Problem #188: Stripe Category Revenue Breakdown #188\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 189,
    "title": "Stripe User Order Match #189",
    "difficulty": "Easy",
    "domain": "Joins & Relational Sets",
    "companyTags": [
      "Stripe"
    ],
    "description": "Join users and orders tables to find user order totals.",
    "inputTables": [
      {
        "tableName": "stripe_tb_189",
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
    "inputSchemaSql": "CREATE TABLE stripe_tb_189 (user_id INT, name VARCHAR(255));\nCREATE TABLE stripe_tb_189_orders (order_id INT, user_id INT, amount INT);",
    "seedDataSql": "INSERT INTO stripe_tb_189 VALUES (1, 'Alice');\nINSERT INTO stripe_tb_189 VALUES (2, 'Bob');\nINSERT INTO stripe_tb_189_orders VALUES (101, 1, 200);\nINSERT INTO stripe_tb_189_orders VALUES (102, 1, 300);\nINSERT INTO stripe_tb_189_orders VALUES (103, 2, 150);",
    "expectedOutput": {
      "columns": [
        "name",
        "total_amount"
      ],
      "rows": [
        [
          "Alice",
          500
        ],
        [
          "Bob",
          150
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: JOIN stripe_tb_189_orders ON u.user_id = o.user_id."
    ],
    "solutionSql": "SELECT u.name, SUM(o.amount) AS total_amount FROM stripe_tb_189 u JOIN stripe_tb_189_orders o ON u.user_id = o.user_id GROUP BY u.name ORDER BY total_amount DESC;",
    "starterSql": "-- Problem #189: Stripe User Order Match #189\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 190,
    "title": "Stripe Query Optimization #190",
    "difficulty": "Medium",
    "domain": "Subqueries & CTEs",
    "companyTags": [
      "Stripe"
    ],
    "description": "Find transactions with amount > 300.",
    "inputTables": [
      {
        "tableName": "stripe_tb_190",
        "columns": [
          {
            "name": "tx_id",
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
    "inputSchemaSql": "CREATE TABLE stripe_tb_190 (tx_id INT, amount INT);",
    "seedDataSql": "INSERT INTO stripe_tb_190 VALUES (1, 500);\nINSERT INTO stripe_tb_190 VALUES (2, 150);\nINSERT INTO stripe_tb_190 VALUES (3, 400);",
    "expectedOutput": {
      "columns": [
        "tx_id",
        "amount"
      ],
      "rows": [
        [
          1,
          500
        ],
        [
          3,
          400
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: Filter amount > 300."
    ],
    "solutionSql": "SELECT tx_id, amount FROM stripe_tb_190 WHERE amount > 300 ORDER BY amount DESC;",
    "starterSql": "-- Problem #190: Stripe Query Optimization #190\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 191,
    "title": "Stripe Salary Department Rank #191",
    "difficulty": "Hard",
    "domain": "Window Ranking & Ordering",
    "companyTags": [
      "Stripe"
    ],
    "description": "Rank employees by salary within each department.",
    "inputTables": [
      {
        "tableName": "stripe_tb_191",
        "columns": [
          {
            "name": "emp_id",
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
    "inputSchemaSql": "CREATE TABLE stripe_tb_191 (emp_id INT, name VARCHAR(255), salary INT, dept VARCHAR(50));",
    "seedDataSql": "INSERT INTO stripe_tb_191 VALUES (1, 'Alice', 95000, 'Engineering');\nINSERT INTO stripe_tb_191 VALUES (2, 'Bob', 85000, 'Engineering');\nINSERT INTO stripe_tb_191 VALUES (3, 'Charlie', 110000, 'Product');\nINSERT INTO stripe_tb_191 VALUES (4, 'David', 90000, 'Product');",
    "expectedOutput": {
      "columns": [
        "emp_id",
        "name",
        "salary",
        "dept",
        "rnk"
      ],
      "rows": [
        [
          1,
          "Alice",
          95000,
          "Engineering",
          1
        ],
        [
          2,
          "Bob",
          85000,
          "Engineering",
          2
        ],
        [
          3,
          "Charlie",
          110000,
          "Product",
          1
        ],
        [
          4,
          "David",
          90000,
          "Product",
          2
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: DENSE_RANK() OVER (PARTITION BY dept ORDER BY salary DESC)."
    ],
    "solutionSql": "SELECT emp_id, name, salary, dept, DENSE_RANK() OVER (PARTITION BY dept ORDER BY salary DESC) AS rnk FROM stripe_tb_191;",
    "starterSql": "-- Problem #191: Stripe Salary Department Rank #191\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 192,
    "title": "Stripe Previous Activity Delta #192",
    "difficulty": "Expert",
    "domain": "Window Offset Functions",
    "companyTags": [
      "Stripe"
    ],
    "description": "Find previous login date using LAG() window function.",
    "inputTables": [
      {
        "tableName": "stripe_tb_192",
        "columns": [
          {
            "name": "user_id",
            "type": "INT"
          },
          {
            "name": "login_date",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE stripe_tb_192 (user_id INT, login_date VARCHAR(50));",
    "seedDataSql": "INSERT INTO stripe_tb_192 VALUES (1, '2026-01-01');\nINSERT INTO stripe_tb_192 VALUES (1, '2026-01-05');\nINSERT INTO stripe_tb_192 VALUES (1, '2026-01-20');",
    "expectedOutput": {
      "columns": [
        "user_id",
        "login_date",
        "prev_login"
      ],
      "rows": [
        [
          1,
          "2026-01-01",
          null
        ],
        [
          1,
          "2026-01-05",
          "2026-01-01"
        ],
        [
          1,
          "2026-01-20",
          "2026-01-05"
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: LAG(login_date) OVER (PARTITION BY user_id ORDER BY login_date)."
    ],
    "solutionSql": "SELECT user_id, login_date, LAG(login_date) OVER (PARTITION BY user_id ORDER BY login_date) AS prev_login FROM stripe_tb_192;",
    "starterSql": "-- Problem #192: Stripe Previous Activity Delta #192\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 193,
    "title": "Stripe 3-Day Moving Average #193",
    "difficulty": "Easy",
    "domain": "Sliding Window Aggregates",
    "companyTags": [
      "Stripe"
    ],
    "description": "Calculate 3-day moving average of daily sales.",
    "inputTables": [
      {
        "tableName": "stripe_tb_193",
        "columns": [
          {
            "name": "day_id",
            "type": "INT"
          },
          {
            "name": "sales",
            "type": "INT"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE stripe_tb_193 (day_id INT, sales INT);",
    "seedDataSql": "INSERT INTO stripe_tb_193 VALUES (1, 100);\nINSERT INTO stripe_tb_193 VALUES (2, 120);\nINSERT INTO stripe_tb_193 VALUES (3, 140);\nINSERT INTO stripe_tb_193 VALUES (4, 110);",
    "expectedOutput": {
      "columns": [
        "day_id",
        "sales",
        "moving_avg"
      ],
      "rows": [
        [
          1,
          100,
          100.0
        ],
        [
          2,
          120,
          110.0
        ],
        [
          3,
          140,
          120.0
        ],
        [
          4,
          110,
          123.33333333333333
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: AVG(sales) OVER (ORDER BY day_id ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)."
    ],
    "solutionSql": "SELECT day_id, sales, AVG(sales) OVER (ORDER BY day_id ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) AS moving_avg FROM stripe_tb_193;",
    "starterSql": "-- Problem #193: Stripe 3-Day Moving Average #193\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 194,
    "title": "Stripe Cohort Signups #194",
    "difficulty": "Medium",
    "domain": "Date & Time Analytics",
    "companyTags": [
      "Stripe"
    ],
    "description": "Filter user signups in January 2026.",
    "inputTables": [
      {
        "tableName": "stripe_tb_194",
        "columns": [
          {
            "name": "user_id",
            "type": "INT"
          },
          {
            "name": "signup_date",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE stripe_tb_194 (user_id INT, signup_date VARCHAR(50));",
    "seedDataSql": "INSERT INTO stripe_tb_194 VALUES (1, '2026-01-10');\nINSERT INTO stripe_tb_194 VALUES (2, '2026-01-25');\nINSERT INTO stripe_tb_194 VALUES (3, '2026-02-01');",
    "expectedOutput": {
      "columns": [
        "user_id",
        "signup_date"
      ],
      "rows": [
        [
          1,
          "2026-01-10"
        ],
        [
          2,
          "2026-01-25"
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: Filter signup_date LIKE '2026-01%'."
    ],
    "solutionSql": "SELECT user_id, signup_date FROM stripe_tb_194 WHERE signup_date LIKE '2026-01%' ORDER BY user_id;",
    "starterSql": "-- Problem #194: Stripe Cohort Signups #194\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 195,
    "title": "Stripe Query Optimization #195",
    "difficulty": "Hard",
    "domain": "DDL, Constraints & Triggers",
    "companyTags": [
      "Stripe"
    ],
    "description": "Find transactions with amount > 300.",
    "inputTables": [
      {
        "tableName": "stripe_tb_195",
        "columns": [
          {
            "name": "tx_id",
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
    "inputSchemaSql": "CREATE TABLE stripe_tb_195 (tx_id INT, amount INT);",
    "seedDataSql": "INSERT INTO stripe_tb_195 VALUES (1, 500);\nINSERT INTO stripe_tb_195 VALUES (2, 150);\nINSERT INTO stripe_tb_195 VALUES (3, 400);",
    "expectedOutput": {
      "columns": [
        "tx_id",
        "amount"
      ],
      "rows": [
        [
          1,
          500
        ],
        [
          3,
          400
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: Filter amount > 300."
    ],
    "solutionSql": "SELECT tx_id, amount FROM stripe_tb_195 WHERE amount > 300 ORDER BY amount DESC;",
    "starterSql": "-- Problem #195: Stripe Query Optimization #195\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 196,
    "title": "Stripe Org Hierarchy Depth #196",
    "difficulty": "Expert",
    "domain": "Recursive CTEs & Graphs",
    "companyTags": [
      "Stripe"
    ],
    "description": "Find organizational depth level using recursive query.",
    "inputTables": [
      {
        "tableName": "stripe_tb_196",
        "columns": [
          {
            "name": "emp_id",
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
    "inputSchemaSql": "CREATE TABLE stripe_tb_196 (emp_id INT, name VARCHAR(255), manager_id INT);",
    "seedDataSql": "INSERT INTO stripe_tb_196 VALUES (1, 'CEO', NULL);\nINSERT INTO stripe_tb_196 VALUES (2, 'VP', 1);\nINSERT INTO stripe_tb_196 VALUES (3, 'Eng', 2);",
    "expectedOutput": {
      "columns": [
        "emp_id",
        "name",
        "depth"
      ],
      "rows": [
        [
          1,
          "CEO",
          1
        ],
        [
          2,
          "VP",
          2
        ],
        [
          3,
          "Eng",
          3
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: Use WITH RECURSIVE Tree AS (...)"
    ],
    "solutionSql": "WITH RECURSIVE Tree AS (SELECT emp_id, name, 1 AS depth FROM stripe_tb_196 WHERE manager_id IS NULL UNION ALL SELECT e.emp_id, e.name, t.depth + 1 FROM stripe_tb_196 e JOIN Tree t ON e.manager_id = t.emp_id) SELECT emp_id, name, depth FROM Tree ORDER BY depth, emp_id;",
    "starterSql": "-- Problem #196: Stripe Org Hierarchy Depth #196\n-- Write your SQL query solution below:\nWITH RECURSIVE Tree AS (\n\n)\nSELECT \nFROM Tree;"
  },
  {
    "id": 197,
    "title": "Stripe High Value Account Filter #197",
    "difficulty": "Easy",
    "domain": "Filtering & String Functions",
    "companyTags": [
      "Stripe"
    ],
    "description": "Write a query to find active users in Stripe's database with spend > 500.",
    "inputTables": [
      {
        "tableName": "stripe_tb_197",
        "columns": [
          {
            "name": "name",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE stripe_tb_197 (id INT PRIMARY KEY, name VARCHAR(255), spend INT, status VARCHAR(50));",
    "seedDataSql": "INSERT INTO stripe_tb_197 VALUES (1, 'Alice', 1200, 'active');\nINSERT INTO stripe_tb_197 VALUES (2, 'Bob', 350, 'inactive');\nINSERT INTO stripe_tb_197 VALUES (3, 'Charlie', 850, 'active');\nINSERT INTO stripe_tb_197 VALUES (4, 'David', 400, 'active');",
    "expectedOutput": {
      "columns": [
        "id",
        "name",
        "spend"
      ],
      "rows": [
        [
          1,
          "Alice",
          1200
        ],
        [
          3,
          "Charlie",
          850
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: Use WHERE spend > 500 AND status = 'active'."
    ],
    "solutionSql": "SELECT id, name, spend FROM stripe_tb_197 WHERE spend > 500 AND status = 'active' ORDER BY spend DESC;",
    "starterSql": "-- Problem #197: Stripe High Value Account Filter #197\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 198,
    "title": "Stripe Category Revenue Breakdown #198",
    "difficulty": "Medium",
    "domain": "Aggregations & Grouping",
    "companyTags": [
      "Stripe"
    ],
    "description": "Calculate the total revenue and count for each product category in Stripe's sales ledger.",
    "inputTables": [
      {
        "tableName": "stripe_tb_198",
        "columns": [
          {
            "name": "order_id",
            "type": "INT"
          },
          {
            "name": "category",
            "type": "VARCHAR"
          }
        ],
        "rows": []
      }
    ],
    "inputSchemaSql": "CREATE TABLE stripe_tb_198 (order_id INT, category VARCHAR(255), revenue INT);",
    "seedDataSql": "INSERT INTO stripe_tb_198 VALUES (101, 'Cloud', 500);\nINSERT INTO stripe_tb_198 VALUES (102, 'Cloud', 300);\nINSERT INTO stripe_tb_198 VALUES (103, 'Hardware', 150);\nINSERT INTO stripe_tb_198 VALUES (104, 'Hardware', 250);",
    "expectedOutput": {
      "columns": [
        "category",
        "total_revenue",
        "order_count"
      ],
      "rows": [
        [
          "Cloud",
          800,
          2
        ],
        [
          "Hardware",
          400,
          2
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: GROUP BY category and SUM(revenue)."
    ],
    "solutionSql": "SELECT category, SUM(revenue) AS total_revenue, COUNT(*) AS order_count FROM stripe_tb_198 GROUP BY category ORDER BY total_revenue DESC;",
    "starterSql": "-- Problem #198: Stripe Category Revenue Breakdown #198\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 199,
    "title": "Stripe User Order Match #199",
    "difficulty": "Hard",
    "domain": "Joins & Relational Sets",
    "companyTags": [
      "Stripe"
    ],
    "description": "Join users and orders tables to find user order totals.",
    "inputTables": [
      {
        "tableName": "stripe_tb_199",
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
    "inputSchemaSql": "CREATE TABLE stripe_tb_199 (user_id INT, name VARCHAR(255));\nCREATE TABLE stripe_tb_199_orders (order_id INT, user_id INT, amount INT);",
    "seedDataSql": "INSERT INTO stripe_tb_199 VALUES (1, 'Alice');\nINSERT INTO stripe_tb_199 VALUES (2, 'Bob');\nINSERT INTO stripe_tb_199_orders VALUES (101, 1, 200);\nINSERT INTO stripe_tb_199_orders VALUES (102, 1, 300);\nINSERT INTO stripe_tb_199_orders VALUES (103, 2, 150);",
    "expectedOutput": {
      "columns": [
        "name",
        "total_amount"
      ],
      "rows": [
        [
          "Alice",
          500
        ],
        [
          "Bob",
          150
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: JOIN stripe_tb_199_orders ON u.user_id = o.user_id."
    ],
    "solutionSql": "SELECT u.name, SUM(o.amount) AS total_amount FROM stripe_tb_199 u JOIN stripe_tb_199_orders o ON u.user_id = o.user_id GROUP BY u.name ORDER BY total_amount DESC;",
    "starterSql": "-- Problem #199: Stripe User Order Match #199\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 200,
    "title": "Stripe Query Optimization #200",
    "difficulty": "Expert",
    "domain": "Subqueries & CTEs",
    "companyTags": [
      "Stripe"
    ],
    "description": "Find transactions with amount > 300.",
    "inputTables": [
      {
        "tableName": "stripe_tb_200",
        "columns": [
          {
            "name": "tx_id",
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
    "inputSchemaSql": "CREATE TABLE stripe_tb_200 (tx_id INT, amount INT);",
    "seedDataSql": "INSERT INTO stripe_tb_200 VALUES (1, 500);\nINSERT INTO stripe_tb_200 VALUES (2, 150);\nINSERT INTO stripe_tb_200 VALUES (3, 400);",
    "expectedOutput": {
      "columns": [
        "tx_id",
        "amount"
      ],
      "rows": [
        [
          1,
          500
        ],
        [
          3,
          400
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: Filter amount > 300."
    ],
    "solutionSql": "SELECT tx_id, amount FROM stripe_tb_200 WHERE amount > 300 ORDER BY amount DESC;",
    "starterSql": "-- Problem #200: Stripe Query Optimization #200\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
  },
  {
    "id": 201,
    "title": "Stripe Salary Department Rank #201",
    "difficulty": "Easy",
    "domain": "Window Ranking & Ordering",
    "companyTags": [
      "Stripe"
    ],
    "description": "Rank employees by salary within each department.",
    "inputTables": [
      {
        "tableName": "stripe_tb_201",
        "columns": [
          {
            "name": "emp_id",
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
    "inputSchemaSql": "CREATE TABLE stripe_tb_201 (emp_id INT, name VARCHAR(255), salary INT, dept VARCHAR(50));",
    "seedDataSql": "INSERT INTO stripe_tb_201 VALUES (1, 'Alice', 95000, 'Engineering');\nINSERT INTO stripe_tb_201 VALUES (2, 'Bob', 85000, 'Engineering');\nINSERT INTO stripe_tb_201 VALUES (3, 'Charlie', 110000, 'Product');\nINSERT INTO stripe_tb_201 VALUES (4, 'David', 90000, 'Product');",
    "expectedOutput": {
      "columns": [
        "emp_id",
        "name",
        "salary",
        "dept",
        "rnk"
      ],
      "rows": [
        [
          1,
          "Alice",
          95000,
          "Engineering",
          1
        ],
        [
          2,
          "Bob",
          85000,
          "Engineering",
          2
        ],
        [
          3,
          "Charlie",
          110000,
          "Product",
          1
        ],
        [
          4,
          "David",
          90000,
          "Product",
          2
        ]
      ]
    },
    "hints": [
      "\ud83d\udca1 Hint 1: DENSE_RANK() OVER (PARTITION BY dept ORDER BY salary DESC)."
    ],
    "solutionSql": "SELECT emp_id, name, salary, dept, DENSE_RANK() OVER (PARTITION BY dept ORDER BY salary DESC) AS rnk FROM stripe_tb_201;",
    "starterSql": "-- Problem #201: Stripe Salary Department Rank #201\n-- Write your SQL query solution below:\nSELECT \nFROM \n;"
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
