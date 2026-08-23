/**
 * ResultsGrid.tsx — Enhanced Windows 95 ListView Results Grid
 * Supports multi-statement tabs, export (CSV, JSON, INSERTs), column sorting,
 * quick row search filtering, and cell value inspection.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { ExecutionSuccess } from '../../engine/executor';

interface ResultsGridProps {
  result:          ExecutionSuccess | null;
  isLoading:       boolean;
  executionTimeMs: number | null;
  dialect?:        string;
}

export const ResultsGrid: React.FC<ResultsGridProps> = ({
  result,
  isLoading,
  executionTimeMs,
  dialect = 'MySQL',
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColIdx, setSortColIdx] = useState<number | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // Cell inspector modal state
  const [inspectedCell, setInspectedCell] = useState<{
    val: any;
    colName: string;
    rowIdx: number;
  } | null>(null);

  const [toastNotice, setToastNotice] = useState<string | null>(null);

  // Reset state when new query result arrives
  useEffect(() => {
    setActiveTab(0);
    setSearchQuery('');
    setSortColIdx(null);
    setSortDir('asc');
    setInspectedCell(null);
  }, [result]);

  const showToast = (msg: string) => {
    setToastNotice(msg);
    setTimeout(() => setToastNotice(null), 2500);
  };

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

  // Handle column header click for sorting
  const handleColumnSort = (colIdx: number) => {
    if (sortColIdx === colIdx) {
      if (sortDir === 'asc') {
        setSortDir('desc');
      } else {
        setSortColIdx(null); // Clear sort
        setSortDir('asc');
      }
    } else {
      setSortColIdx(colIdx);
      setSortDir('asc');
    }
  };

  // Filtered and Sorted Rows computation
  const processedRows = useMemo(() => {
    let list = rows.map((row, originalIndex) => ({ row, originalIndex }));

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(({ row }) =>
        row.some((cell) => cell !== null && cell !== undefined && String(cell).toLowerCase().includes(q))
      );
    }

    // Sort
    if (sortColIdx !== null) {
      list.sort((a, b) => {
        const valA = a.row[sortColIdx];
        const valB = b.row[sortColIdx];

        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;

        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortDir === 'asc' ? valA - valB : valB - valA;
        }

        const strA = String(valA).toLowerCase();
        const strB = String(valB).toLowerCase();
        return sortDir === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
      });
    }

    return list;
  }, [rows, searchQuery, sortColIdx, sortDir]);

  // Export handlers
  const handleExportCSV = () => {
    if (rows.length === 0) return;
    const header = columns.map((c) => `"${c.replace(/"/g, '""')}"`).join(',');
    const body = rows
      .map((r) =>
        r
          .map((v) => {
            if (v === null || v === undefined) return '""';
            return `"${String(v).replace(/"/g, '""')}"`;
          })
          .join(',')
      )
      .join('\n');

    const csvContent = `${header}\n${body}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `query_result_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('✓ CSV file exported successfully.');
  };

  const handleCopyJSON = () => {
    if (rows.length === 0) return;
    const jsonArr = rows.map((r) => {
      const obj: Record<string, any> = {};
      columns.forEach((col, i) => {
        obj[col] = r[i];
      });
      return obj;
    });

    navigator.clipboard.writeText(JSON.stringify(jsonArr, null, 2));
    showToast('✓ Results copied to clipboard as JSON.');
  };

  const handleExportInserts = () => {
    if (rows.length === 0) return;
    const tableName = inferredTables[0] || 'result_data';
    const insertStatements = rows
      .map((r) => {
        const vals = r
          .map((v) => {
            if (v === null || v === undefined) return 'NULL';
            if (typeof v === 'number') return String(v);
            return `'${String(v).replace(/'/g, "''")}'`;
          })
          .join(', ');
        return `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${vals});`;
      })
      .join('\n');

    const blob = new Blob([insertStatements], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tableName}_inserts.sql`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('✓ SQL INSERT statements exported.');
  };

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
      {/* Action & Export Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '3px 6px',
          background: '#c0c0c0',
          borderBottom: '1px solid #808080',
          fontSize: '11px',
          gap: '6px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <button
            className="win95-button"
            style={{ fontSize: '10px', padding: '1px 6px' }}
            onClick={handleExportCSV}
            title="Export active result grid to CSV file"
          >
            💾 CSV
          </button>
          <button
            className="win95-button"
            style={{ fontSize: '10px', padding: '1px 6px' }}
            onClick={handleCopyJSON}
            title="Copy results to clipboard as formatted JSON"
          >
            📋 JSON
          </button>
          <button
            className="win95-button"
            style={{ fontSize: '10px', padding: '1px 6px' }}
            onClick={handleExportInserts}
            title="Generate SQL INSERT statements file"
          >
            📄 INSERTs
          </button>

          {toastNotice && (
            <span style={{ color: '#006600', fontWeight: 'bold', fontSize: '10px', marginLeft: '6px' }}>
              {toastNotice}
            </span>
          )}
        </div>

        {/* Quick Search Input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <label style={{ fontSize: '10px', fontWeight: 'bold' }}>Filter:</label>
          <input
            type="text"
            className="win95-sunken"
            placeholder="Search rows..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '130px', padding: '1px 4px', fontSize: '10px' }}
          />
          {searchQuery && (
            <button
              className="win95-button"
              style={{ fontSize: '9px', padding: '0 4px', minHeight: '18px' }}
              onClick={() => setSearchQuery('')}
            >
              ✕
            </button>
          )}
        </div>
      </div>

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
              {columns.map((col, idx) => {
                const isSorted = sortColIdx === idx;
                return (
                  <th
                    key={idx}
                    onClick={() => handleColumnSort(idx)}
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                    title="Click to sort column"
                  >
                    <span>{col}</span>
                    {isSorted && (
                      <span style={{ marginLeft: '4px', fontSize: '9px', color: '#000080' }}>
                        {sortDir === 'asc' ? '▲' : '▼'}
                      </span>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {processedRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} style={{ textAlign: 'center', padding: '16px', color: '#666' }}>
                  {searchQuery ? 'No rows match filter criteria.' : 'Query executed successfully (0 rows returned).'}
                </td>
              </tr>
            ) : (
              processedRows.map(({ row, originalIndex }) => (
                <tr key={originalIndex}>
                  <td style={{ textAlign: 'center', color: '#888', background: '#f5f5f5' }}>
                    {originalIndex + 1}
                  </td>
                  {row.map((val, colIdx) => (
                    <td
                      key={colIdx}
                      onDoubleClick={() => setInspectedCell({ val, colName: columns[colIdx], rowIdx: originalIndex + 1 })}
                      title="Double-click to inspect cell value"
                      style={{ cursor: 'pointer' }}
                    >
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
          Rows: <strong>{processedRows.length}</strong> {searchQuery && `(filtered from ${rowCount})`}
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

      {/* Win95 Cell Value Inspector Modal */}
      {inspectedCell && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999999,
          }}
        >
          <div className="win95-window" style={{ width: '420px', boxShadow: '4px 4px 10px rgba(0,0,0,0.5)' }}>
            <div className="win95-titlebar">
              <div className="win95-titlebar-text">
                <span>🔍</span>
                <span>Cell Inspector — [{inspectedCell.colName}] Row #{inspectedCell.rowIdx}</span>
              </div>
              <div className="win95-titlebar-controls">
                <button className="win95-btn-titlebar" onClick={() => setInspectedCell(null)}>
                  ✕
                </button>
              </div>
            </div>

            <div style={{ padding: '12px' }}>
              <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '4px' }}>
                Column: <span style={{ color: '#000080' }}>{inspectedCell.colName}</span> | Type:{' '}
                <span style={{ color: '#800080' }}>{inspectedCell.val === null ? 'NULL' : typeof inspectedCell.val}</span>
              </div>

              <textarea
                readOnly
                className="win95-sunken"
                value={
                  inspectedCell.val === null || inspectedCell.val === undefined
                    ? '<NULL>'
                    : typeof inspectedCell.val === 'object'
                    ? JSON.stringify(inspectedCell.val, null, 2)
                    : String(inspectedCell.val)
                }
                style={{
                  width: '100%',
                  height: '140px',
                  fontFamily: 'monospace',
                  fontSize: '11px',
                  padding: '6px',
                  boxSizing: 'border-box',
                  background: '#ffffff',
                }}
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                <span style={{ fontSize: '10px', color: '#666' }}>
                  Length: {String(inspectedCell.val || '').length} characters
                </span>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    className="win95-button"
                    onClick={() => {
                      navigator.clipboard.writeText(String(inspectedCell.val || ''));
                      showToast('✓ Cell value copied to clipboard.');
                    }}
                  >
                    📋 Copy Value
                  </button>
                  <button className="win95-button" style={{ fontWeight: 'bold' }} onClick={() => setInspectedCell(null)}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
