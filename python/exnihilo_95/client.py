"""
client.py — Python Client for ExNihilo 95 Relational Synthesis Engine
Provides seamless ex nihilo query execution with pandas DataFrame conversion.
"""

import json
import subprocess
import os
import sys
import urllib.request
import urllib.error
from typing import List, Dict, Any, Optional

DEFAULT_CLOUD_ENDPOINT = "https://exnihilo-95.vercel.app/api/execute"
DEFAULT_LOCAL_ENDPOINT = "http://localhost:3000/api/execute"


class QueryResult:
    """
    Structured execution result from ExNihilo 95 engine.
    """
    def __init__(self, data: dict):
        self.raw = data
        self.success: bool = data.get("ok", data.get("success", False))
        self.error: Optional[str] = data.get("error")
        self.results = data.get("allResults", data.get("results", []))

        # Primary table results
        self.columns: List[str] = data.get("columns", [])
        self.rows: List[List[Any]] = data.get("rows", [])
        self.row_count: int = data.get("rowCount", len(self.rows))
        self.execution_time_ms: float = float(data.get("executionTimeMs", 0.0))

        # Fallback to first result in allResults if top-level fields are missing
        if not self.columns and self.results:
            first_res = self.results[0]
            self.columns = first_res.get("columns", [])
            self.rows = first_res.get("rows", [])
            self.row_count = len(self.rows)

    def to_dict(self) -> List[Dict[str, Any]]:
        """
        Convert table rows into a list of dictionaries mapping column_name -> value.
        """
        return [dict(zip(self.columns, row)) for row in self.rows]

    def to_dataframe(self):
        """
        Convert results into a pandas DataFrame.
        Requires pandas to be installed (pip install pandas).
        """
        try:
            import pandas as pd
            return pd.DataFrame(self.rows, columns=self.columns)
        except ImportError:
            raise ImportError(
                "pandas is required to convert results to a DataFrame. "
                "Install it via: pip install pandas"
            )

    def __iter__(self):
        return iter(self.to_dict())

    def __len__(self):
        return self.row_count

    def __repr__(self) -> str:
        if not self.success:
            return f"<ExNihilo 95 Query Error: {self.error}>"
        if not self.columns:
            return f"<ExNihilo 95 Result (0 columns, 0 rows) [{self.execution_time_ms:.1f}ms]>"

        # Render vintage tabular ASCII grid
        col_widths = []
        for i, c in enumerate(self.columns):
            max_val_len = max((len(str(r[i])) for r in self.rows), default=0)
            col_widths.append(max(len(str(c)), max_val_len))

        header = " | ".join(f"{c:<{w}}" for c, w in zip(self.columns, col_widths))
        separator = "-+-".join("-" * w for w in col_widths)

        row_lines = []
        preview_rows = self.rows[:10]
        for r in preview_rows:
            row_lines.append(" | ".join(f"{str(val):<{w}}" for val, w in zip(r, col_widths)))

        if len(self.rows) > 10:
            row_lines.append(f"... ({len(self.rows) - 10} additional rows)")

        table_str = "\n".join([header, separator] + row_lines)
        return f"\n{table_str}\n\n[Kernel: {self.row_count} rows synthesized in {self.execution_time_ms:.1f}ms]"


def _try_local_node_execution(sql: str) -> Optional[QueryResult]:
    """
    Attempts to execute query directly via local Node.js engine runner if available.
    """
    possible_runner_paths = [
        os.path.join(os.path.dirname(__file__), "..", "..", "scripts", "run_query.mjs"),
        os.path.join(os.getcwd(), "scripts", "run_query.mjs"),
    ]

    for runner_path in possible_runner_paths:
        abs_path = os.path.abspath(runner_path)
        if os.path.exists(abs_path):
            try:
                npx_bin = "npx.cmd" if os.name == "nt" else "npx"
                cmd = [npx_bin, "tsx", abs_path, sql]
                proc = subprocess.run(
                    cmd,
                    capture_output=True,
                    text=True,
                    timeout=15
                )
                if proc.returncode == 0 and proc.stdout.strip():
                    data = json.loads(proc.stdout.strip())
                    return QueryResult(data)
            except Exception:
                pass
    return None


def execute_sql(
    sql: str,
    dialect: str = "MySQL",
    rows_per_table: int = 20,
    endpoint: Optional[str] = None
) -> QueryResult:
    """
    Executes any SQL query ex nihilo using the ExNihilo 95 relational synthesis engine.
    Automatically deduces schemas, resolves foreign key DAGs, and synthesizes realistic datasets.

    Args:
        sql: The SQL query statement to run (any dialect: MySQL, PostgreSQL, SQLite, SSMS, Oracle)
        dialect: SQL dialect name (default: 'MySQL')
        rows_per_table: Number of rows to synthesize per inferred table (default: 20)
        endpoint: Target API endpoint URL (auto-selects local or cloud by default)

    Returns:
        QueryResult object with .columns, .rows, .to_dict(), and .to_dataframe()

    Example:
        from exnihilo_95 import execute_sql

        result = execute_sql("SELECT name, distance_light_years FROM celestial_objects")
        print(result)
        df = result.to_dataframe()
    """
    if not sql or not isinstance(sql, str):
        raise ValueError("sql must be a non-empty string.")

    # 1. First priority: Try local Node.js engine runner if inside/near repository
    if not endpoint:
        local_result = _try_local_node_execution(sql)
        if local_result is not None:
            return local_result

    # 2. Second priority: Try HTTP execution
    payload = json.dumps({
        "sql": sql,
        "dialect": dialect,
        "rowsPerTable": rows_per_table
    }).encode("utf-8")

    headers = {
        "Content-Type": "application/json",
        "User-Agent": "ExNihilo95-Python/2.1.0"
    }

    target_endpoint = endpoint

    # Auto-resolve target endpoint if not specified
    if not target_endpoint:
        # Check if local Next.js server is active
        try:
            req = urllib.request.Request(
                DEFAULT_LOCAL_ENDPOINT,
                data=payload,
                headers=headers,
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=1.0) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                return QueryResult(data)
        except Exception:
            # Fallback to high-availability cloud endpoint
            target_endpoint = DEFAULT_CLOUD_ENDPOINT

    try:
        req = urllib.request.Request(
            target_endpoint,
            data=payload,
            headers=headers,
            method="POST"
        )
        with urllib.request.urlopen(req, timeout=15.0) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            return QueryResult(data)
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8", errors="ignore")
        try:
            err_json = json.loads(err_body)
            return QueryResult(err_json)
        except Exception:
            return QueryResult({"success": False, "error": f"HTTP {e.code}: {e.reason}"})
    except Exception as e:
        return QueryResult({"success": False, "error": str(e)})
