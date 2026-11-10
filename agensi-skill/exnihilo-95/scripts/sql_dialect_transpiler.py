#!/usr/bin/env python3
"""
sql_dialect_transpiler.py — Standalone SQL Dialect Transpiler & Schema Generator
Part of the ExNihilo 95 Skill Package for Agensi.io

Capabilities:
1. Cross-dialect transpilation between PostgreSQL, MySQL, SQLite, and T-SQL.
2. In-memory schema & mock DDL generator for queries without declared schemas.
3. Zero third-party dependencies (pure standard library Python 3.8+).
"""

import sys
import re
import argparse
from typing import Dict, List, Set, Tuple

# ── Dialect Translation Rules ────────────────────────────────────────────────

DIALECT_FUNCTION_MAP = {
    # Function / Token -> { target_dialect: replacement }
    "IFNULL": {
        "postgresql": "COALESCE",
        "mysql": "IFNULL",
        "sqlite": "IFNULL",
        "tsql": "ISNULL",
    },
    "ISNULL": {
        "postgresql": "COALESCE",
        "mysql": "IFNULL",
        "sqlite": "IFNULL",
        "tsql": "ISNULL",
    },
    "NOW": {
        "postgresql": "CURRENT_TIMESTAMP",
        "mysql": "NOW()",
        "sqlite": "CURRENT_TIMESTAMP",
        "tsql": "GETDATE()",
    },
    "GETDATE": {
        "postgresql": "CURRENT_TIMESTAMP",
        "mysql": "NOW()",
        "sqlite": "CURRENT_TIMESTAMP",
        "tsql": "GETDATE()",
    },
    "CURDATE": {
        "postgresql": "CURRENT_DATE",
        "mysql": "CURDATE()",
        "sqlite": "date('now')",
        "tsql": "CAST(GETDATE() AS DATE)",
    },
    "STRING_AGG": {
        "postgresql": "STRING_AGG",
        "mysql": "GROUP_CONCAT",
        "sqlite": "GROUP_CONCAT",
        "tsql": "STRING_AGG",
    },
    "GROUP_CONCAT": {
        "postgresql": "STRING_AGG",
        "mysql": "GROUP_CONCAT",
        "sqlite": "GROUP_CONCAT",
        "tsql": "STRING_AGG",
    },
}

def transpile_sql(sql: str, target_dialect: str) -> str:
    """Translates common dialect-specific keywords and functions."""
    target = target_dialect.lower()
    translated = sql

    # 1. Null functions
    if target in ("postgresql", "sqlite"):
        translated = re.sub(r"\bISNULL\s*\(", "COALESCE(", translated, flags=re.IGNORECASE)
    if target == "tsql":
        translated = re.sub(r"\bIFNULL\s*\(", "ISNULL(", translated, flags=re.IGNORECASE)
    if target == "mysql":
        translated = re.sub(r"\bISNULL\s*\(", "IFNULL(", translated, flags=re.IGNORECASE)

    # 2. Timestamps
    if target == "tsql":
        translated = re.sub(r"\bNOW\s*\(\s*\)", "GETDATE()", translated, flags=re.IGNORECASE)
        translated = re.sub(r"\bCURRENT_TIMESTAMP\b", "GETDATE()", translated, flags=re.IGNORECASE)
    elif target in ("postgresql", "sqlite"):
        translated = re.sub(r"\bGETDATE\s*\(\s*\)", "CURRENT_TIMESTAMP", translated, flags=re.IGNORECASE)
        translated = re.sub(r"\bNOW\s*\(\s*\)", "CURRENT_TIMESTAMP", translated, flags=re.IGNORECASE)
    elif target == "mysql":
        translated = re.sub(r"\bGETDATE\s*\(\s*\)", "NOW()", translated, flags=re.IGNORECASE)

    # 3. String Aggregation
    if target == "mysql":
        translated = re.sub(r"\bSTRING_AGG\s*\(\s*([^,]+)\s*,\s*([^)]+)\)", r"GROUP_CONCAT(\1 SEPARATOR \2)", translated, flags=re.IGNORECASE)
    elif target == "postgresql":
        translated = re.sub(r"\bGROUP_CONCAT\s*\(\s*([^,\)]+)\s*(?:SEPARATOR\s*([^)]+))?\)", r"STRING_AGG(\1, COALESCE(\2, ', '))", translated, flags=re.IGNORECASE)

    # 4. Limit / Pagination
    if target == "tsql":
        limit_match = re.search(r"\bLIMIT\s+(\d+)\s+OFFSET\s+(\d+)", translated, flags=re.IGNORECASE)
        if limit_match:
            limit_val, offset_val = limit_match.groups()
            translated = re.sub(
                r"\bLIMIT\s+\d+\s+OFFSET\s+\d+",
                f"OFFSET {offset_val} ROWS FETCH NEXT {limit_val} ROWS ONLY",
                translated,
                flags=re.IGNORECASE
            )
        else:
            simple_limit = re.search(r"\bLIMIT\s+(\d+)", translated, flags=re.IGNORECASE)
            if simple_limit:
                limit_val = simple_limit.group(1)
                translated = re.sub(r"\bLIMIT\s+\d+", f"OFFSET 0 ROWS FETCH NEXT {limit_val} ROWS ONLY", translated, flags=re.IGNORECASE)

    return translated

# ── Schema Inference Engine ──────────────────────────────────────────────────

def infer_schema_from_sql(sql: str) -> Dict[str, Dict[str, str]]:
    """Infers table and column definitions directly from SQL references."""
    tables: Dict[str, Dict[str, str]] = {}

    # Extract tables from FROM and JOIN
    from_matches = re.findall(r"\b(?:FROM|JOIN)\s+([a-zA-Z_][a-zA-Z0-9_]*)(?:\s+(?:AS\s+)?([a-zA-Z_][a-zA-Z0-9_]*))?", sql, re.IGNORECASE)
    alias_map: Dict[str, str] = {}
    for tbl, alias in from_matches:
        tbl_clean = tbl.lower()
        if tbl_clean not in ("select", "where", "group", "having", "order"):
            tables[tbl_clean] = {"id": "INTEGER PRIMARY KEY"}
            if alias:
                alias_map[alias.lower()] = tbl_clean
            alias_map[tbl_clean] = tbl_clean

    # Extract column references e.g. alias.column or table.column
    col_matches = re.findall(r"\b([a-zA-Z_][a-zA-Z0-9_]*)\.([a-zA-Z_][a-zA-Z0-9_]*)\b", sql)
    for ref, col in col_matches:
        ref_lower = ref.lower()
        col_lower = col.lower()
        if ref_lower in alias_map and col_lower != "*":
            target_table = alias_map[ref_lower]
            if col_lower != "id":
                # Infer type
                if col_lower.endswith("_id"):
                    col_type = "INTEGER"
                elif any(k in col_lower for k in ("price", "amount", "total", "salary", "balance")):
                    col_type = "NUMERIC(10,2)"
                elif any(k in col_lower for k in ("created_at", "updated_at", "date", "time")):
                    col_type = "TIMESTAMP"
                elif any(k in col_lower for k in ("is_", "has_", "active")):
                    col_type = "BOOLEAN"
                elif any(k in col_lower for k in ("count", "quantity", "age")):
                    col_type = "INTEGER"
                else:
                    col_type = "VARCHAR(255)"
                tables[target_table][col_lower] = col_type

    return tables

def generate_ddl_and_seed(tables: Dict[str, Dict[str, str]]) -> str:
    """Generates runnable SQL DDL and mock seed rows."""
    ddl_statements = []
    insert_statements = []

    for table_name, columns in tables.items():
        col_defs = [f"    {col} {dtype}" for col, dtype in columns.items()]
        ddl = f"CREATE TABLE IF NOT EXISTS {table_name} (\n" + ",\n".join(col_defs) + "\n);"
        ddl_statements.append(ddl)

        # Generate sample seed rows
        cols = list(columns.keys())
        non_id_cols = [c for c in cols if c != "id"]
        if non_id_cols:
            val_rows = []
            for i in range(1, 4):
                vals = []
                for c in non_id_cols:
                    t = columns[c].upper()
                    if "INT" in t:
                        vals.append(str(i * 10))
                    elif "NUMERIC" in t:
                        vals.append(f"{i * 24.50:.2f}")
                    elif "DATE" in t or "TIME" in t:
                        vals.append(f"'2026-03-0{i} 12:00:00'")
                    elif "BOOL" in t:
                        vals.append("TRUE" if i % 2 == 1 else "FALSE")
                    else:
                        vals.append(f"'{c}_{i}'")
                val_rows.append(f"    ({i}, " + ", ".join(vals) + ")")
            col_list_str = "id, " + ", ".join(non_id_cols)
            insert_statements.append(f"INSERT INTO {table_name} ({col_list_str}) VALUES\n" + ",\n".join(val_rows) + ";")

    return "\n\n".join(ddl_statements) + "\n\n" + "\n\n".join(insert_statements)

# ── Self-Test Suite ──────────────────────────────────────────────────────────

def run_self_test() -> bool:
    print("[ExNihilo Transpiler] Running verification suite...")

    # Test 1: Function mapping
    t1 = transpile_sql("SELECT IFNULL(name, 'N/A'), NOW() FROM users LIMIT 10 OFFSET 20;", "tsql")
    assert "ISNULL" in t1, "Failed ISNULL translation"
    assert "GETDATE()" in t1, "Failed GETDATE translation"
    assert "OFFSET 20 ROWS FETCH NEXT 10 ROWS ONLY" in t1, "Failed T-SQL pagination translation"

    # Test 2: Schema inference
    sample_query = "SELECT o.id, c.name, o.total, o.created_at FROM orders o JOIN customers c ON o.customer_id = c.id WHERE c.age > 21;"
    schema = infer_schema_from_sql(sample_query)
    assert "orders" in schema, "Failed to infer orders table"
    assert "customers" in schema, "Failed to infer customers table"
    assert schema["orders"]["total"] == "NUMERIC(10,2)", "Failed to infer numeric total"

    ddl = generate_ddl_and_seed(schema)
    assert "CREATE TABLE IF NOT EXISTS orders" in ddl, "Failed to generate DDL"
    assert "INSERT INTO orders" in ddl, "Failed to generate seed data"

    print("[ExNihilo Transpiler] All self-tests passed successfully!")
    return True

# ── CLI Entrypoint ───────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="ExNihilo 95 Standalone SQL Transpiler & Schema Generator")
    parser.add_argument("--sql", type=str, help="Input SQL query string")
    parser.add_argument("--to", type=str, choices=["postgresql", "mysql", "sqlite", "tsql"], default="postgresql", help="Target SQL dialect")
    parser.add_argument("--infer-schema", action="store_true", help="Infer table schema and output DDL + seed data")
    parser.add_argument("--test", action="store_true", help="Run internal self-tests")

    args = parser.parse_args()

    if args.test:
        success = run_self_test()
        sys.exit(0 if success else 1)

    if not args.sql:
        parser.print_help()
        sys.exit(1)

    if args.infer_schema:
        schema = infer_schema_from_sql(args.sql)
        ddl = generate_ddl_and_seed(schema)
        print("-- Inferred Schema & Mock Seed DDL (ExNihilo):")
        print(ddl)
    else:
        out = transpile_sql(args.sql, args.to)
        print(f"-- Transpiled SQL ({args.to}):")
        print(out)

if __name__ == "__main__":
    main()
