/**
 * ResultsGrid.tsx — Windows 95 ListView Results Grid
 * Supports single and multi-statement query results with tabbed navigation.
 */

import React, { useState, useEffect } from 'react';
import { ExecutionSuccess } from '../../engine/executor';

interface ResultsGridProps {
  result:          ExecutionSuccess | null;
  isLoading:       boolean;
  executionTimeMs: number | null;
}

export const ResultsGrid: React.FC<ResultsGridProps> = ({
  result,
  isLoading,
  executionTimeMs,
}) => {
  const [activeTab, setActiveTab] = useState(0);

  // Reset tab index when new query result arrives
  useEffect(() => {
    setActiveTab(0);
  }, [result]);

  if (isLoading) {
    return (
      <div
        className="win95-inset"
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#ffffff',
          gap: '8px',
        }}
      >
        <div style={{ fontSize: '28px', animation: 'spin 1s linear infinite' }}>⏳</div>
        <div style={{ fontSize: '12px', fontWeight: 'bold' }}>Executing Query in WebAssembly...</div>
        <div style={{ fontSize: '10px', color: '#666' }}>Inferring schema & generating synthetic dataset</div>
      </div>
    );
  }

  if (!result) {
    return (
      <div
        className="win95-inset"
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#ffffff',
          color: '#666666',
        }}
      >
        <div style={{ fontSize: '24px', marginBottom: '4px' }}>📋</div>
        <div style={{ fontSize: '11px' }}>
          Ready for execution. Highlight any query or press <strong>F5</strong> to run.
        </div>
      </div>
    );
  }

  const { inferredTables, reusedTables, allResults } = result;

  // Active query result data
  const hasMultipleResults = Boolean(allResults && allResults.length > 1);
  const currentResult = (hasMultipleResults && allResults && allResults[activeTab])
    ? allResults[activeTab]
    : { columns: result.columns, rows: result.rows, rowCount: result.rowCount };

  const { columns, rows, rowCount } = currentResult;

  return (
    <div
      className="win95-inset"
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: '#ffffff',
        overflow: 'hidden',
      }}
    >
      {/* Multi-Query Result Tabs */}
      {hasMultipleResults && allResults && (
        <div
          style={{
            display: 'flex',
            gap: '2px',
            background: '#d4d0c8',
            padding: '3px 4px 0 4px',
            borderBottom: '1px solid #808080',
            overflowX: 'auto',
          }}
        >
          {allResults.map((r, idx) => {
            const isActive = activeTab === idx;
            return (
              <button
                key={idx}
                className={`win95-tab ${isActive ? 'active' : ''}`}
                style={{
                  fontSize: '11px',
                  padding: '2px 8px',
                  fontWeight: isActive ? 'bold' : 'normal',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                }}
                onClick={() => setActiveTab(idx)}
              >
                <span>📊</span>
                <span>Query #{r.queryIndex} ({r.rowCount} rows)</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Scrollable Grid Table */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <table className="win95-grid">
          <thead>
            <tr>
              <th style={{ width: '40px', textAlign: 'center' }}>#</th>
              {columns.map((col, idx) => (
                <th key={idx}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} style={{ textAlign: 'center', padding: '16px', color: '#666' }}>
                  Query executed successfully (0 rows returned).
                </td>
              </tr>
            ) : (
              rows.map((row, rowIdx) => (
                <tr key={rowIdx}>
                  <td style={{ textAlign: 'center', color: '#888', background: '#f5f5f5' }}>
                    {rowIdx + 1}
                  </td>
                  {row.map((val, colIdx) => (
                    <td key={colIdx}>
                      {val === null || val === undefined ? (
                        <span style={{ color: '#999999', fontStyle: 'italic' }}>&lt;NULL&gt;</span>
                      ) : typeof val === 'object' ? (
                        JSON.stringify(val)
                      ) : (
                        String(val)
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Grid Status Footer */}
      <div className="win95-statusbar">
        {hasMultipleResults && allResults && (
          <div className="win95-statusbar-pane" style={{ color: '#800080', fontWeight: 'bold' }}>
            Viewing Query {activeTab + 1} of {allResults.length}
          </div>
        )}
        <div className="win95-statusbar-pane">
          Rows: <strong>{rowCount}</strong>
        </div>
        <div className="win95-statusbar-pane">
          Time: <strong>{executionTimeMs !== null ? `${executionTimeMs.toFixed(1)} ms` : '0 ms'}</strong>
        </div>
        {inferredTables.length > 0 && (
          <div className="win95-statusbar-pane" style={{ color: '#000080' }}>
            Inferred: <strong>{inferredTables.join(', ')}</strong>
          </div>
        )}
        {reusedTables.length > 0 && (
          <div className="win95-statusbar-pane" style={{ color: '#006600' }}>
            Cached: <strong>{reusedTables.join(', ')}</strong>
          </div>
        )}
      </div>
    </div>
  );
};
