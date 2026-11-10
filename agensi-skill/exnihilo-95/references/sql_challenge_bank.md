# LeetCode & Interview SQL Challenge Bank

A comprehensive collection of core relational patterns, problem specifications, and multi-dialect solutions extracted from ExNihilo 95's 130+ LeetCode challenge arena.

---

## Pattern 1: Department Top Earners (Window Dense Ranking)
*LeetCode #184 & #185*

### Problem
Find employees who have the top 3 unique salaries in each of the departments. A tie should not skip rankings (`DENSE_RANK()`).

### Input Schema
```sql
CREATE TABLE Department (
    id INT PRIMARY KEY,
    name VARCHAR(50)
);

CREATE TABLE Employee (
    id INT PRIMARY KEY,
    name VARCHAR(50),
    salary INT,
    departmentId INT,
    FOREIGN KEY (departmentId) REFERENCES Department(id)
);
```

### Standard Solution (PostgreSQL / MySQL 8+ / T-SQL / SQLite)
```sql
WITH RankedSalaries AS (
    SELECT
        d.name AS Department,
        e.name AS Employee,
        e.salary AS Salary,
        DENSE_RANK() OVER (
            PARTITION BY e.departmentId
            ORDER BY e.salary DESC
        ) AS rnk
    FROM Employee e
    JOIN Department d ON e.departmentId = d.id
)
SELECT Department, Employee, Salary
FROM RankedSalaries
WHERE rnk <= 3
ORDER BY Department, Salary DESC;
```

---

## Pattern 2: Consecutive Numbers (Offset Functions & Island Grouping)
*LeetCode #180*

### Problem
Find all numbers that appear at least three times consecutively in a `Logs` table.

### Input Schema
```sql
CREATE TABLE Logs (
    id INT PRIMARY KEY,
    num INT
);
```

### Solution A: Using `LEAD()` & `LAG()` (Standard SQL)
```sql
WITH AnalyzedLogs AS (
    SELECT
        num,
        LAG(num, 1) OVER (ORDER BY id) AS prev_num,
        LAG(id, 1) OVER (ORDER BY id) AS prev_id,
        LEAD(num, 1) OVER (ORDER BY id) AS next_num,
        LEAD(id, 1) OVER (ORDER BY id) AS next_id,
        id
    FROM Logs
)
SELECT DISTINCT num AS ConsecutiveNums
FROM AnalyzedLogs
WHERE num = prev_num
  AND num = next_num
  AND id = prev_id + 1
  AND next_id = id + 1;
```

### Solution B: Difference of Row Numbers (Handles Any Arbitrary N Consecutive Occurrences)
```sql
WITH NumberGroups AS (
    SELECT
        id, num,
        ROW_NUMBER() OVER (ORDER BY id) - 
        ROW_NUMBER() OVER (PARTITION BY num ORDER BY id) AS island_id
    FROM Logs
)
SELECT DISTINCT num AS ConsecutiveNums
FROM NumberGroups
GROUP BY num, island_id
HAVING COUNT(*) >= 3;
```

---

## Pattern 3: Trips and Users (Conditional Aggregations & Status Filtering)
*LeetCode #262*

### Problem
Calculate the cancellation rate of requests with unbanned users (both client and driver must not be banned) each day between `"2013-10-01"` and `"2013-10-03"`. Round to 2 decimal places.

### Input Schema
```sql
CREATE TABLE Users (
    users_id INT PRIMARY KEY,
    banned VARCHAR(10),
    role VARCHAR(10)
);

CREATE TABLE Trips (
    id INT PRIMARY KEY,
    client_id INT,
    driver_id INT,
    city_id INT,
    status VARCHAR(50),
    request_at DATE
);
```

### Solution
```sql
SELECT
    t.request_at AS Day,
    ROUND(
        SUM(CASE WHEN t.status IN ('cancelled_by_driver', 'cancelled_by_client') THEN 1.0 ELSE 0.0 END) /
        COUNT(*),
        2
    ) AS "Cancellation Rate"
FROM Trips t
JOIN Users c ON t.client_id = c.users_id AND c.banned = 'No'
JOIN Users d ON t.driver_id = d.users_id AND d.banned = 'No'
WHERE t.request_at BETWEEN '2013-10-01' AND '2013-10-03'
GROUP BY t.request_at
ORDER BY Day;
```

---

## Pattern 4: Exchange Seats (Arithmetic Swapping with Window Edge Guards)
*LeetCode #626*

### Problem
Swap the seat id of every two consecutive students. If the number of students is odd, the id of the last student is not swapped.

### Input Schema
```sql
CREATE TABLE Seat (
    id INT PRIMARY KEY,
    student VARCHAR(50)
);
```

### Solution (Idiomatic & SARGable)
```sql
SELECT
    id,
    CASE
        -- If odd and has a successor, take the next student
        WHEN id % 2 = 1 AND LEAD(student) OVER (ORDER BY id) IS NOT NULL
            THEN LEAD(student) OVER (ORDER BY id)
        -- If even, take the previous student
        WHEN id % 2 = 0
            THEN LAG(student) OVER (ORDER BY id)
        -- Otherwise (last odd student without successor), keep current
        ELSE student
    END AS student
FROM Seat
ORDER BY id ASC;
```

---

## Pattern 5: Human Traffic of Stadium (Island Detection on Filtered Rows)
*LeetCode #601*

### Problem
Display the records with three or more consecutive rows where the number of people is greater than or equal to 100.

### Input Schema
```sql
CREATE TABLE Stadium (
    id INT PRIMARY KEY,
    visit_date DATE,
    people INT
);
```

### Solution
```sql
WITH Filtered AS (
    SELECT
        id, visit_date, people,
        id - ROW_NUMBER() OVER (ORDER BY id) AS island_id
    FROM Stadium
    WHERE people >= 100
),
IslandCounts AS (
    SELECT
        id, visit_date, people,
        COUNT(*) OVER (PARTITION BY island_id) AS consecutive_count
    FROM Filtered
)
SELECT id, visit_date, people
FROM IslandCounts
WHERE consecutive_count >= 3
ORDER BY id;
```

---

## Pattern 6: Hierarchical Org Tree (Recursive CTE)
*Classic Enterprise Interview Problem*

### Problem
Find the full management hierarchy, reporting depth, and manager path for every employee.

### Input Schema
```sql
CREATE TABLE EmployeeTree (
    id INT PRIMARY KEY,
    name VARCHAR(50),
    manager_id INT
);
```

### Solution (PostgreSQL / SQLite / MySQL 8+)
```sql
WITH RECURSIVE Hierarchy AS (
    -- Anchor member: Top-level CEOs/Directors (no manager)
    SELECT
        id,
        name,
        manager_id,
        1 AS level,
        CAST(name AS VARCHAR(1000)) AS management_path
    FROM EmployeeTree
    WHERE manager_id IS NULL

    UNION ALL

    -- Recursive member: Employees reporting to managers in CTE
    SELECT
        e.id,
        e.name,
        e.manager_id,
        h.level + 1,
        CAST(h.management_path || ' -> ' || e.name AS VARCHAR(1000))
    FROM EmployeeTree e
    JOIN Hierarchy h ON e.manager_id = h.id
)
SELECT id, name, level, management_path
FROM Hierarchy
ORDER BY level, id;
```
