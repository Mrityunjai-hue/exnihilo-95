-- ExNihilo 95 Local Standalone Starter Kit
-- Synthesized Relational Analytics (Zero Config Needed)

-- 1. Customer & Order Revenue Analytics
SELECT 
    c.name AS customer_name,
    COUNT(o.id) AS total_orders,
    ROUND(SUM(o.total), 2) AS lifetime_value
FROM customers c
INNER JOIN orders o ON c.id = o.customer_id
GROUP BY c.name
ORDER BY lifetime_value DESC;

-- 2. Employee Hierarchy & Salary Analytics
SELECT 
    e.name,
    e.department,
    e.salary,
    RANK() OVER (PARTITION BY e.department ORDER BY e.salary DESC) AS salary_rank,
    ROUND(AVG(e.salary) OVER (PARTITION BY e.department), 2) AS dept_avg_salary
FROM employees e;

-- 3. Celestial Objects & Cosmic Distance Analytics
SELECT 
    [name],
    [distance_light_years],
    [type]
FROM [celestial_objects]
ORDER BY [distance_light_years] DESC
LIMIT 10;
