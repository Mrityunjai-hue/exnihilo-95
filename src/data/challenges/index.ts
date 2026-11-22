/**
 * index.ts — Lightweight Challenge Index and Asynchronous Shard Loader
 */

import { SQLChallenge, ChallengeMetadata, ChallengeDifficulty, ChallengeDomain } from './types';
export * from './types';

export const CHALLENGE_INDEX: ChallengeMetadata[] = [
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
    "shard": "easy"
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
    "shard": "medium"
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
    "shard": "medium"
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
    "shard": "medium"
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
    "shard": "medium"
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
    "shard": "easy"
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
    "shard": "easy"
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
    "shard": "easy"
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
    "shard": "medium"
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
    "shard": "hard"
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
    "shard": "easy"
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
    "shard": "easy"
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
    "shard": "hard"
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
    "shard": "easy"
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
    "shard": "easy"
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
    "shard": "medium"
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
    "shard": "medium"
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
    "shard": "medium"
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
    "shard": "easy"
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
    "shard": "easy"
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
    "shard": "medium"
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
    "shard": "easy"
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
    "shard": "easy"
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
    "shard": "easy"
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
    "shard": "hard"
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
    "shard": "medium"
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
    "shard": "easy"
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
    "shard": "medium"
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
    "shard": "easy"
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
    "shard": "easy"
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
    "shard": "easy"
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
    "shard": "medium"
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
    "shard": "easy"
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
    "shard": "medium"
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
    "shard": "easy"
  },
  {
    "id": 1068,
    "title": "Product Sales Analysis I (LeetCode #1068)",
    "difficulty": "Easy",
    "domain": "Joins & Relational Sets",
    "companyTags": [
      "Amazon"
    ],
    "shard": "easy"
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
    "shard": "medium"
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
    "shard": "easy"
  },
  {
    "id": 1084,
    "title": "Sales Analysis III (LeetCode #1084)",
    "difficulty": "Easy",
    "domain": "Filtering & String Functions",
    "companyTags": [
      "Amazon"
    ],
    "shard": "easy"
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
    "shard": "easy"
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
    "shard": "easy"
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
    "shard": "medium"
  },
  {
    "id": 1164,
    "title": "Product Price at a Given Date (LeetCode #1164)",
    "difficulty": "Medium",
    "domain": "Window Offset Functions",
    "companyTags": [
      "Amazon"
    ],
    "shard": "medium"
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
    "shard": "easy"
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
    "shard": "easy"
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
    "shard": "medium"
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
    "shard": "medium"
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
    "shard": "easy"
  },
  {
    "id": 1251,
    "title": "Average Selling Price (LeetCode #1251)",
    "difficulty": "Easy",
    "domain": "Joins & Relational Sets",
    "companyTags": [
      "Amazon"
    ],
    "shard": "easy"
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
    "shard": "easy"
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
    "shard": "medium"
  },
  {
    "id": 1327,
    "title": "List Products Ordered in a Period (LeetCode #1327)",
    "difficulty": "Easy",
    "domain": "Filtering & String Functions",
    "companyTags": [
      "Amazon"
    ],
    "shard": "easy"
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
    "shard": "medium"
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
    "shard": "easy"
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
    "shard": "medium"
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
    "shard": "easy"
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
    "shard": "easy"
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
    "shard": "easy"
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
    "shard": "easy"
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
    "shard": "easy"
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
    "shard": "easy"
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
    "shard": "easy"
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
    "shard": "easy"
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
    "shard": "easy"
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
    "shard": "easy"
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
    "shard": "easy"
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
    "shard": "easy"
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
    "shard": "easy"
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
    "shard": "easy"
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
    "shard": "easy"
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
    "shard": "easy"
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
    "shard": "easy"
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
    "shard": "medium"
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
    "shard": "medium"
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
    "shard": "easy"
  },
  {
    "id": 2082,
    "title": "The Number of Rich Customers (LeetCode #2082)",
    "difficulty": "Easy",
    "domain": "Aggregations & Grouping",
    "companyTags": [
      "Amazon"
    ],
    "shard": "easy"
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
    "shard": "easy"
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
    "shard": "easy"
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
    "shard": "medium"
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
    "shard": "medium"
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
    "shard": "medium"
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
    "shard": "easy"
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
    "shard": "easy"
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
    "shard": "medium"
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
    "shard": "easy"
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
    "shard": "medium"
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
    "shard": "easy"
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
    "shard": "medium"
  },
  {
    "id": 3007,
    "title": "LeetCode #2007 Real SQL Interview Challenge",
    "difficulty": "Easy",
    "domain": "Filtering & String Functions",
    "companyTags": [
      "Stripe"
    ],
    "shard": "easy"
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
    "shard": "medium"
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
    "shard": "easy"
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
    "shard": "medium"
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
    "shard": "easy"
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
    "shard": "medium"
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
    "shard": "easy"
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
    "shard": "medium"
  },
  {
    "id": 3015,
    "title": "LeetCode #2015 Real SQL Interview Challenge",
    "difficulty": "Easy",
    "domain": "Joins & Relational Sets",
    "companyTags": [
      "Stripe"
    ],
    "shard": "easy"
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
    "shard": "medium"
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
    "shard": "easy"
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
    "shard": "medium"
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
    "shard": "easy"
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
    "shard": "medium"
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
    "shard": "easy"
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
    "shard": "medium"
  },
  {
    "id": 3023,
    "title": "LeetCode #2023 Real SQL Interview Challenge",
    "difficulty": "Easy",
    "domain": "Filtering & String Functions",
    "companyTags": [
      "Stripe"
    ],
    "shard": "easy"
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
    "shard": "medium"
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
    "shard": "easy"
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
    "shard": "medium"
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
    "shard": "easy"
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
    "shard": "medium"
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
    "shard": "easy"
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
    "shard": "medium"
  },
  {
    "id": 3031,
    "title": "LeetCode #2031 Real SQL Interview Challenge",
    "difficulty": "Easy",
    "domain": "Filtering & String Functions",
    "companyTags": [
      "Stripe"
    ],
    "shard": "easy"
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
    "shard": "medium"
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
    "shard": "easy"
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
    "shard": "medium"
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
    "shard": "easy"
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
    "shard": "medium"
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
    "shard": "easy"
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
    "shard": "medium"
  },
  {
    "id": 3039,
    "title": "LeetCode #2039 Real SQL Interview Challenge",
    "difficulty": "Easy",
    "domain": "Joins & Relational Sets",
    "companyTags": [
      "Stripe"
    ],
    "shard": "easy"
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
    "shard": "medium"
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
    "shard": "easy"
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
    "shard": "medium"
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
    "shard": "easy"
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
    "shard": "medium"
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
    "shard": "easy"
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
    "shard": "medium"
  },
  {
    "id": 3047,
    "title": "LeetCode #2047 Real SQL Interview Challenge",
    "difficulty": "Easy",
    "domain": "Filtering & String Functions",
    "companyTags": [
      "Stripe"
    ],
    "shard": "easy"
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
    "shard": "medium"
  }
];

const shardCache = new Map<string, Map<number, SQLChallenge>>();

export async function loadChallengeById(id: number): Promise<SQLChallenge | null> {
  const meta = CHALLENGE_INDEX.find((c) => c.id === id);
  if (!meta) return null;

  if (!shardCache.has(meta.shard)) {
    let mod: { default: SQLChallenge[] };
    switch (meta.shard) {
      case 'easy':
        mod = await import('./shard_easy');
        break;
      case 'medium':
        mod = await import('./shard_medium');
        break;
      case 'hard':
        mod = await import('./shard_hard');
        break;
      case 'expert':
        mod = await import('./shard_expert');
        break;
      default:
        return null;
    }
    shardCache.set(meta.shard, new Map(mod.default.map((c) => [c.id, c])));
  }

  return shardCache.get(meta.shard)!.get(id) ?? null;
}

export function getFilteredChallengeMetadata(
  query = '',
  difficulty = 'All',
  domain = 'All',
  company = 'All'
): ChallengeMetadata[] {
  return CHALLENGE_INDEX.filter((c) => {
    if (difficulty !== 'All' && c.difficulty !== difficulty) return false;
    if (domain !== 'All' && c.domain !== domain) return false;
    if (company !== 'All' && !c.companyTags.includes(company)) return false;
    if (query.trim()) {
      const q = query.toLowerCase().trim();
      const matchTitle = c.title.toLowerCase().includes(q);
      const matchDomain = c.domain.toLowerCase().includes(q);
      const matchTag = c.companyTags.some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchDomain && !matchTag) return false;
    }
    return true;
  });
}

export const ALL_DIFFICULTIES: string[] = ['All', 'Easy', 'Medium', 'Hard', 'Expert'];

export const ALL_DOMAINS: string[] = [
  'All',
  'Filtering & String Functions',
  'Aggregations & Grouping',
  'Joins & Relational Sets',
  'Subqueries & CTEs',
  'Window Ranking & Ordering',
  'Window Offset Functions',
  'Sliding Window Aggregates',
  'Date & Time Analytics',
  'DDL, Constraints & Triggers',
  'Recursive CTEs & Graphs',
];

export const ALL_COMPANY_TAGS: string[] = [
  'All',
  'Amazon',
  'Apple',
  'Google',
  'Meta',
  'Microsoft',
  'Netflix',
  'Bloomberg',
  'Uber',
  'Twitter',
  'Spotify',
  'Adobe',
  'Salesforce',
];
