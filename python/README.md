# ExNihilo 95 — Python SDK

**The Zero-Config In-Browser SQL IDE & Relational Synthesis Engine**  
*Query tables that don't even exist with automatic schema deduction, foreign key DAG resolution, and calibrated mock data synthesis.*

---

## 🚀 Quickstart

### Installation
```bash
# Direct install from GitHub repository:
pip install "git+https://github.com/Mrityunjai-hue/exnihilo-95.git#subdirectory=python"

# Or from local source:
pip install .
```

### Basic Query Synthesis
```python
from exnihilo_95 import execute_sql

# Execute any query ex nihilo without setting up databases or tables:
result = execute_sql("SELECT * FROM users JOIN orders ON users.id = orders.user_id")

# Print the formatted ASCII result table
print(result)

# Access columns and rows programmatically
print("Columns:", result.columns)
print("Rows:", result.rows)

# Convert to a list of dictionaries
records = result.to_dict()
print(records[0])
```

---

## 📊 Pandas DataFrame Integration

ExNihilo 95 integrates seamlessly with Pandas for instant data science experimentation and ETL testing:

```python
from exnihilo_95 import execute_sql

result = execute_sql("""
    SELECT 
        e.department,
        AVG(e.salary) AS avg_salary,
        COUNT(e.id) AS headcount
    FROM employees e
    GROUP BY e.department
    ORDER BY avg_salary DESC;
""")

# Convert directly to a pandas DataFrame
df = result.to_dataframe()
print(df.head())
```

---

## 🌐 Dialects Supported

ExNihilo 95 automatically transpiles multi-dialect syntax:
- **MySQL:** `GROUP_CONCAT`, `DATE_FORMAT`
- **PostgreSQL:** `ILIKE`, `->>`, `::numeric`
- **T-SQL / SSMS:** `SELECT TOP (n)`, `[bracketed_columns]`
- **Oracle:** `ROWNUM <= n`, `NVL2`, `DECODE`
- **SQLite:** Native WebAssembly execution

```python
# T-SQL query with bracketed identifiers:
res = execute_sql("SELECT TOP 5 [name], [distance_light_years] FROM [celestial_objects]")
print(res)
```

---

## 📜 License
Licensed under the **MIT License** with Attribution.  
Original Concept & Architecture by **Mrityunjai** ([@Mrityunjai-hue](https://github.com/Mrityunjai-hue)).
