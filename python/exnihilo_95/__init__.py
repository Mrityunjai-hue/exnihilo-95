"""
ExNihilo 95 — Python SDK
Zero-Config Relational Synthesis & Database Engine

Concept & Architecture by Mrityunjai (@Mrityunjai-hue)
Licensed under the MIT License
"""

from .client import execute_sql, QueryResult

__version__ = "2.1.0"
__all__ = ["execute_sql", "QueryResult"]
