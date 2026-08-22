/**
 * ResultsGrid.tsx — Windows 95 ListView Results Grid
 */

import React from 'react';
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
        <div style={{ fontSize: '11px' }}>Ready for execution. Press <strong>F5</strong> or click <strong>▶ Run</strong>.</div>
      </div>
    );
  }

  const { columns, rows, rowCount, inferredTables, reusedTables } = result;

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
