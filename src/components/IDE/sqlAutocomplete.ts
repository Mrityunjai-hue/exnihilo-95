/**
 * sqlAutocomplete.ts — Retro Windows 95 IntelliSense Autocomplete Engine
 *
 * Provides contextual SQL keyword, multi-dialect function, table, and column
 * autocompletion with parameter signatures, types, and docs in CodeMirror 6.
 */

import { Completion, CompletionContext, CompletionResult } from '@codemirror/autocomplete';

export const STATIC_SQL_COMPLETIONS: Completion[] = [
  // ── Core DQL / DML Keywords ──
  { label: 'SELECT', type: 'keyword', boost: 99, detail: 'KEYWORD', info: 'Retrieves data rows from one or more tables.' },
  { label: 'FROM', type: 'keyword', boost: 98, detail: 'KEYWORD', info: 'Specifies the table(s) to query from.' },
  { label: 'WHERE', type: 'keyword', boost: 97, detail: 'KEYWORD', info: 'Filters rows according to search conditions.' },
  { label: 'JOIN', type: 'keyword', boost: 90, detail: 'KEYWORD', info: 'Combines rows from two or more tables based on a related column.' },
  { label: 'LEFT JOIN', type: 'keyword', boost: 89, detail: 'KEYWORD', info: 'Returns all rows from left table and matched rows from right table.' },
  { label: 'RIGHT JOIN', type: 'keyword', boost: 88, detail: 'KEYWORD', info: 'Returns all rows from right table and matched rows from left table.' },
  { label: 'INNER JOIN', type: 'keyword', boost: 89, detail: 'KEYWORD', info: 'Returns rows that have matching values in both tables.' },
  { label: 'FULL OUTER JOIN', type: 'keyword', boost: 85, detail: 'KEYWORD', info: 'Returns all rows when there is a match in one of the tables.' },
  { label: 'GROUP BY', type: 'keyword', boost: 85, detail: 'KEYWORD', info: 'Groups rows that have the same values into summary rows.' },
  { label: 'HAVING', type: 'keyword', boost: 84, detail: 'KEYWORD', info: 'Filters group aggregate results (similar to WHERE for aggregates).' },
  { label: 'ORDER BY', type: 'keyword', boost: 83, detail: 'KEYWORD', info: 'Sorts the result set in ascending (ASC) or descending (DESC) order.' },
  { label: 'LIMIT', type: 'keyword', boost: 82, detail: 'KEYWORD', info: 'Constrains the number of rows returned by the query.' },
  { label: 'OFFSET', type: 'keyword', boost: 80, detail: 'KEYWORD', info: 'Skips a specific number of rows before beginning to return results.' },
  { label: 'WITH', type: 'keyword', boost: 85, detail: 'KEYWORD', info: 'Defines Common Table Expressions (CTEs) or recursive queries.' },
  { label: 'RECURSIVE', type: 'keyword', boost: 84, detail: 'KEYWORD', info: 'Enables recursive CTE graph/tree hierarchy traversal.' },
  { label: 'AS', type: 'keyword', boost: 70, detail: 'KEYWORD', info: 'Aliases tables or column expressions.' },
  { label: 'AND', type: 'keyword', boost: 75, detail: 'OPERATOR', info: 'Logical conjunction.' },
  { label: 'OR', type: 'keyword', boost: 74, detail: 'OPERATOR', info: 'Logical disjunction.' },
  { label: 'NOT', type: 'keyword', boost: 73, detail: 'OPERATOR', info: 'Logical negation.' },
  { label: 'IN', type: 'keyword', boost: 72, detail: 'OPERATOR', info: 'Determines whether a specified value matches any value in a subquery or list.' },
  { label: 'LIKE', type: 'keyword', boost: 71, detail: 'OPERATOR', info: 'Pattern matching using % (multi-char) and _ (single-char) wildcards.' },
  { label: 'BETWEEN', type: 'keyword', boost: 70, detail: 'OPERATOR', info: 'Tests whether an expression falls within an inclusive range.' },
  { label: 'CASE', type: 'keyword', boost: 75, detail: 'KEYWORD', info: 'Evaluates conditional expression branches (CASE WHEN ... THEN ... ELSE ... END).' },
  { label: 'WHEN', type: 'keyword', boost: 74, detail: 'KEYWORD', info: 'Conditional branch condition in CASE expression.' },
  { label: 'THEN', type: 'keyword', boost: 73, detail: 'KEYWORD', info: 'Result value for true condition in CASE expression.' },
  { label: 'ELSE', type: 'keyword', boost: 72, detail: 'KEYWORD', info: 'Default fallback value in CASE expression.' },
  { label: 'END', type: 'keyword', boost: 71, detail: 'KEYWORD', info: 'Terminates a CASE expression or block.' },
  { label: 'DISTINCT', type: 'keyword', boost: 70, detail: 'KEYWORD', info: 'Eliminates duplicate rows from the query result set.' },
  { label: 'UNION ALL', type: 'keyword', boost: 75, detail: 'KEYWORD', info: 'Combines results of two or more queries including duplicates.' },

  // ── Advanced Dialect Clauses (Transpiled) ──
  { label: 'QUALIFY', type: 'keyword', boost: 90, detail: 'SNOWFLAKE/BQ', info: 'Filters the results of window functions directly without subquery wrapping.' },
  { label: 'ROWNUM', type: 'keyword', boost: 88, detail: 'ORACLE', info: 'Oracle pseudo-column limiting the number of rows returned (WHERE ROWNUM <= N).' },
  { label: 'PIVOT', type: 'keyword', boost: 87, detail: 'T-SQL/ORACLE', info: 'Rotates rows into columns by aggregating values across categories.' },
  { label: 'UNPIVOT', type: 'keyword', boost: 86, detail: 'T-SQL/ORACLE', info: 'Rotates columns into rows.' },

  // ── Procedural & Dynamic SQL ──
  { label: 'DECLARE', type: 'keyword', boost: 92, detail: 'PROCEDURAL', info: 'Declares in-memory session variables (e.g. DECLARE @min_price INT = 50;).' },
  { label: 'SET', type: 'keyword', boost: 91, detail: 'PROCEDURAL', info: 'Assigns values or subquery results to session variables (SET @x = (SELECT ...);).' },
  { label: 'PRINT', type: 'keyword', boost: 89, detail: 'PROCEDURAL', info: 'Streams diagnostic text messages directly to the client execution console.' },
  { label: 'EXEC sp_executesql', type: 'function', boost: 88, detail: 'DYNAMIC SQL', info: 'Executes dynamic SQL statements stored in variables or strings.' },
  { label: 'EXECUTE IMMEDIATE', type: 'function', boost: 87, detail: 'DYNAMIC SQL', info: 'Runs dynamically prepared SQL query expressions.' },

  // ── Admin & Security Simulation ──
  { label: 'GRANT', type: 'keyword', boost: 80, detail: 'ADMIN/SECURITY', info: 'Grants access privileges on objects to users or roles.' },
  { label: 'REVOKE', type: 'keyword', boost: 79, detail: 'ADMIN/SECURITY', info: 'Revokes access privileges from users or roles.' },
  { label: 'CREATE USER', type: 'keyword', boost: 78, detail: 'ADMIN/SECURITY', info: 'Provisions a new database user in the session catalog.' },
  { label: 'BACKUP DATABASE', type: 'keyword', boost: 77, detail: 'ADMIN/SECURITY', info: 'Exports a live binary WASM snapshot of the active database.' },
  { label: 'OPTIMIZE TABLE', type: 'keyword', boost: 76, detail: 'ADMIN/MAINTENANCE', info: 'Defragments storage, reclaims deleted page space, and optimizes table indexes.' },
  { label: 'VACUUM FULL', type: 'keyword', boost: 75, detail: 'ADMIN/MAINTENANCE', info: 'Rebuilds database file defragmenting storage.' },

  // ── Built-in & Multi-Dialect Functions ──
  // Regex
  { label: 'REGEXP', type: 'operator', boost: 85, detail: 'REGEX', info: 'Binary regex operator: col REGEXP pattern.' },
  { label: 'REGEXP_LIKE', type: 'function', boost: 85, detail: 'FUNCTION (str, pattern, [flags])', info: 'Matches string against POSIX regular expression.' },
  { label: 'REGEXP_SUBSTR', type: 'function', boost: 84, detail: 'FUNCTION (str, pattern)', info: 'Extracts matching substring from text using regular expression.' },
  { label: 'REGEXP_REPLACE', type: 'function', boost: 83, detail: 'FUNCTION (str, pattern, repl, [flags])', info: 'Replaces matches of regex pattern with replacement string.' },

  // Spatial / GIS
  { label: 'ST_Point', type: 'function', boost: 86, detail: 'GIS (x, y)', info: 'Constructs a 2D GeoJSON Point geometry from X (lon) and Y (lat).' },
  { label: 'ST_X', type: 'function', boost: 85, detail: 'GIS (geom)', info: 'Extracts longitude (X coordinate) from geometric point.' },
  { label: 'ST_Y', type: 'function', boost: 85, detail: 'GIS (geom)', info: 'Extracts latitude (Y coordinate) from geometric point.' },
  { label: 'ST_Distance', type: 'function', boost: 84, detail: 'GIS (p1, p2)', info: 'Calculates planar Euclidean distance between two spatial points.' },
  { label: 'ST_Contains', type: 'function', boost: 83, detail: 'GIS (poly, pt)', info: 'Evaluates whether 2D polygon encloses point via ray casting.' },

  // Multi-Dialect Null & Branching
  { label: 'NVL2', type: 'function', boost: 85, detail: 'ORACLE (expr, not_null, if_null)', info: 'Returns second argument if expr is NOT NULL; otherwise returns third.' },
  { label: 'DECODE', type: 'function', boost: 85, detail: 'ORACLE (expr, s1, r1, ..., def)', info: 'Evaluates variable IF-THEN-ELSE search/result pairs.' },
  { label: 'GREATEST', type: 'function', boost: 84, detail: 'FUNCTION (v1, v2, ...)', info: 'Returns scalar maximum value across arguments.' },
  { label: 'LEAST', type: 'function', boost: 84, detail: 'FUNCTION (v1, v2, ...)', info: 'Returns scalar minimum value across arguments.' },
  { label: 'GETDATE', type: 'function', boost: 85, detail: 'T-SQL ()', info: 'Returns current database timestamp.' },
  { label: 'SYSDATE', type: 'function', boost: 85, detail: 'ORACLE ()', info: 'Returns current system date and time.' },

  // Standard Functions
  { label: 'COALESCE', type: 'function', boost: 90, detail: 'FUNCTION (v1, v2, ...)', info: 'Returns first non-null value from arguments.' },
  { label: 'NULLIF', type: 'function', boost: 88, detail: 'FUNCTION (e1, e2)', info: 'Returns null if e1 equals e2; otherwise returns e1.' },
  { label: 'CONCAT', type: 'function', boost: 87, detail: 'FUNCTION (s1, s2, ...)', info: 'Concatenates multiple string expressions.' },
  { label: 'SUBSTRING', type: 'function', boost: 86, detail: 'FUNCTION (s, pos, [len])', info: 'Extracts substring starting at 1-based position.' },
  { label: 'DATE_FORMAT', type: 'function', boost: 85, detail: 'MYSQL (date, fmt)', info: 'Formats date according to format string (%Y-%m-%d).' },
  { label: 'TO_CHAR', type: 'function', boost: 85, detail: 'ORACLE/PG (val, fmt)', info: 'Converts date or number to formatted character string.' },
  { label: 'JSON_EXTRACT', type: 'function', boost: 84, detail: 'JSON (doc, path)', info: 'Extracts value from JSON document using JSONPath.' },
  { label: 'COUNT', type: 'function', boost: 92, detail: 'AGGREGATE (expr)', info: 'Counts matching rows or non-null values.' },
  { label: 'SUM', type: 'function', boost: 91, detail: 'AGGREGATE (col)', info: 'Calculates arithmetic sum of column values.' },
  { label: 'AVG', type: 'function', boost: 90, detail: 'AGGREGATE (col)', info: 'Calculates arithmetic mean of column values.' },
  { label: 'MIN', type: 'function', boost: 89, detail: 'AGGREGATE (col)', info: 'Returns minimum value in group.' },
  { label: 'MAX', type: 'function', boost: 89, detail: 'AGGREGATE (col)', info: 'Returns maximum value in group.' },
  { label: 'ROW_NUMBER', type: 'function', boost: 90, detail: 'WINDOW () OVER (...)', info: 'Assigns sequential integer to each row in partition.' },
  { label: 'RANK', type: 'function', boost: 89, detail: 'WINDOW () OVER (...)', info: 'Assigns rank with gaps for ties.' },
  { label: 'DENSE_RANK', type: 'function', boost: 88, detail: 'WINDOW () OVER (...)', info: 'Assigns rank without gaps for ties.' },
  { label: 'LAG', type: 'function', boost: 87, detail: 'WINDOW (col, [offset], [def])', info: 'Accesses data from previous row in partition.' },
  { label: 'LEAD', type: 'function', boost: 86, detail: 'WINDOW (col, [offset], [def])', info: 'Accesses data from subsequent row in partition.' },
];

/**
 * Creates dynamic CodeMirror CompletionSource matching keywords, functions,
 * tables from active catalog, and columns for known tables.
 */
export function createSqlCompletionSource(schemaTables?: Record<string, string[]>) {
  return (context: CompletionContext): CompletionResult | null => {
    const word = context.matchBefore(/[\w@.]+/);
    if (!word || (word.from === word.to && !context.explicit)) {
      return null;
    }

    const completions: Completion[] = [...STATIC_SQL_COMPLETIONS];

    // Add active schema tables and columns
    if (schemaTables && Object.keys(schemaTables).length > 0) {
      const allColumns = new Set<string>();

      for (const [tableName, columns] of Object.entries(schemaTables)) {
        completions.push({
          label: tableName,
          type: 'class',
          boost: 95,
          detail: 'TABLE',
          info: `Table with ${columns.length} columns: ${columns.slice(0, 5).join(', ')}${columns.length > 5 ? '...' : ''}`,
        });

        for (const col of columns) {
          allColumns.add(col);
          // Also table.column notation
          completions.push({
            label: `${tableName}.${col}`,
            type: 'property',
            boost: 80,
            detail: 'COLUMN',
            info: `Column of table ${tableName}`,
          });
        }
      }

      for (const col of allColumns) {
        completions.push({
          label: col,
          type: 'property',
          boost: 91,
          detail: 'COLUMN',
          info: `Column in active database schema.`,
        });
      }
    }

    return {
      from: word.from,
      options: completions,
      filter: true,
    };
  };
}
