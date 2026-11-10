/**
 * ResultsGrid.tsx — Enhanced Windows 95 ListView Results Grid
 * Supports multi-statement tabs, export (CSV, JSON, INSERTs), column sorting,
 * quick row search filtering (ReDoS-safe), cell value inspection, and DOM Virtualization.
 *
 * NOTE: All React Hooks are declared unconditionally at top of component (Rules of Hooks).
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ExecutionSuccess } from '../../engine/executor';
import { Dialect } from '../../engine/parser';
import { useTheme } from '../../hooks/useTheme';
import {
  generateInsertStatements,
  generateDDLStatement,
  ExportColumnDef,
  ColumnType,
} from '../../engine/sql_exporter';

interface ResultsGridProps {
  result:          ExecutionSuccess | null;
  error?:          any;
  isLoading:       boolean;
  executionTimeMs: number | null;
  dialect?:        string;
}

const ROW_HEIGHT = 26;
const OVERSCAN = 5;

export const ResultsGrid: React.FC<ResultsGridProps> = ({
  result,
  error,
  isLoading,
  executionTimeMs,
  dialect = 'MySQL',
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColIdx, setSortColIdx] = useState<number | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(300);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);

  const { activeTheme } = useTheme();
  const isDark = activeTheme === 'macos-glass' || activeTheme === 'win95-noir';

  // Output View Mode ('data' for Grid, 'visual' for Instant Charting)
  const [viewMode, setViewMode] = useState<'data' | 'visual'>('data');
  const [chartType, setChartType] = useState<'bar' | 'kpi' | 'line'>('bar');
  const [selectedCatCol, setSelectedCatCol] = useState<number>(0);
  const [selectedNumCol, setSelectedNumCol] = useState<number>(0);

  const containerRef = useRef<HTMLDivElement>(null);

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
    setScrollTop(0);
  }, [result]);


  // Update viewport height on resize or container mount
  useEffect(() => {
    if (!containerRef.current) return;
    const updateHeight = () => {
      if (containerRef.current) {
        setViewportHeight(containerRef.current.clientHeight || 300);
      }
    };
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Extract active query result data safely for top-level hooks
  const currentResult = useMemo(() => {
    if (!result) return { columns: [] as string[], rows: [] as any[][], rowCount: 0 };
    const hasMultiple = Boolean(result.allResults && result.allResults.length > 1);
    if (hasMultiple && result.allResults && result.allResults[activeTab]) {
      return result.allResults[activeTab];
    }
    return { columns: result.columns || [], rows: result.rows || [], rowCount: result.rowCount || 0 };
  }, [result, activeTab]);

  const columns = useMemo(() => currentResult.columns || [], [currentResult]);
  const rowCount = currentResult.rowCount || 0;

  const rawRows = useMemo(() => {
    return currentResult.rows || [];
  }, [currentResult]);

  // Calculate memory byte size once when active raw rows change
  const dataSizeFormatted = useMemo(() => {
    if (!rawRows || rawRows.length === 0) return '0 B';
    const bytes = new Blob([JSON.stringify(rawRows)]).size;
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }, [rawRows]);

  // Filtered and Sorted Rows computation (Hook at top level)
  // Security Guardrail: Case-insensitive plain .includes() matching to prevent ReDoS
  const processedRows = useMemo(() => {
    if (!rawRows || rawRows.length === 0) return [];
    let list = rawRows.map((row, originalIndex) => ({ row, originalIndex }));

    // Search filter (ReDoS Immunity: plain .includes())
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(({ row }) =>
        row.some((cell) => cell !== null && cell !== undefined && String(cell).toLowerCase().includes(q))
      );
    }

    // Interactive Column Sorting
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
  }, [rawRows, searchQuery, sortColIdx, sortDir]);

  // Virtualization Slice Math
  const visibleStartIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN);
  const visibleEndIndex = Math.min(
    processedRows.length,
    Math.ceil((scrollTop + viewportHeight) / ROW_HEIGHT) + OVERSCAN
  );
  const visibleRows = processedRows.slice(visibleStartIndex, visibleEndIndex);

  const topSpacerHeight = visibleStartIndex * ROW_HEIGHT;
  const bottomSpacerHeight = Math.max(0, (processedRows.length - visibleEndIndex) * ROW_HEIGHT);

  // Infer column data types from row values for clear header badges (Top-Level Hook)
  const columnTypes = useMemo(() => {
    return columns.map((_, colIdx) => {
      for (const row of rawRows) {
        const val = row[colIdx];
        if (val !== null && val !== undefined) {
          if (typeof val === 'number') {
            return Number.isInteger(val) ? 'INT' : 'DEC';
          }
          if (typeof val === 'boolean') return 'BOOL';
          if (typeof val === 'string') {
            if (/^\d{4}-\d{2}-\d{2}/.test(val)) return 'DATE';
            return 'TEXT';
          }
        }
      }
      return 'ANY';
    });
  }, [columns, rawRows]);

  // Identify numeric & categorical column indices for instant zero-config charting (Top-Level Hook)
  const numericColIndices = useMemo(() => {
    const indices: number[] = [];
    columns.forEach((_, idx) => {
      const hasNum = rawRows.some(r => typeof r[idx] === 'number');
      if (hasNum) indices.push(idx);
    });
    return indices;
  }, [columns, rawRows]);

  const categoricalColIndices = useMemo(() => {
    const indices: number[] = [];
    columns.forEach((_, idx) => {
      if (!numericColIndices.includes(idx)) indices.push(idx);
    });
    return indices.length > 0 ? indices : columns.map((_, i) => i);
  }, [columns, numericColIndices]);

  useEffect(() => {
    if (categoricalColIndices.length > 0) setSelectedCatCol(categoricalColIndices[0]);
    if (numericColIndices.length > 0) setSelectedNumCol(numericColIndices[0]);
    else if (columns.length > 1) setSelectedNumCol(1);
    else setSelectedNumCol(0);
  }, [columns, categoricalColIndices, numericColIndices]);

  const chartData = useMemo(() => {
    if (rawRows.length === 0) return [];
    return rawRows.slice(0, 30).map((r, i) => {
      const rawCat = r[selectedCatCol];
      const label = rawCat !== null && rawCat !== undefined ? String(rawCat) : `Row ${i + 1}`;
      const rawVal = r[selectedNumCol];
      const value = typeof rawVal === 'number' ? rawVal : parseFloat(rawVal) || 0;
      return { label, value };
    });
  }, [rawRows, selectedCatCol, selectedNumCol]);

  const maxChartVal = useMemo(() => {
    return Math.max(...chartData.map(d => d.value), 0.0001);
  }, [chartData]);

  const sumChartVal = useMemo(() => {
    return chartData.reduce((acc, d) => acc + d.value, 0);
  }, [chartData]);

  const avgChartVal = useMemo(() => {
    return chartData.length > 0 ? sumChartVal / chartData.length : 0;
  }, [chartData, sumChartVal]);

  const showToast = (msg: string) => {
    setToastNotice(msg);
    setTimeout(() => setToastNotice(null), 2500);
  };

  // Early returns AFTER ALL hooks have been declared unconditionally (Rules of Hooks)
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
          background: 'var(--w95-sunken-bg, #ffffff)',
          color: 'var(--w95-sunken-text, #000000)',
          gap: '8px',
        }}
      >
        <div style={{ fontSize: '28px', animation: 'spin 1s linear infinite' }}>⏳</div>
        <div style={{ fontSize: '12px', fontWeight: 'bold' }}>Executing Query in WebAssembly...</div>
        <div style={{ fontSize: '10px', color: 'var(--w95-dark-gray, #666)' }}>Inferring schema & generating synthetic dataset</div>
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
          background: 'var(--w95-sunken-bg, #ffffff)',
          color: 'var(--w95-sunken-text, #666666)',
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
  const hasMultipleResults = Boolean(allResults && allResults.length > 1);

  // Handle column header click for sorting (ASC -> DESC -> Unsorted)
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

  // Export handlers
  const handleExportCSV = () => {
    const rowsToExport = rawRows;
    if (rowsToExport.length === 0) return;
    const header = columns.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',');
    const body = rowsToExport
      .map((r) =>
        r
          .map((v) => {
            if (v === null || v === undefined) return '""';
            const str = String(v).replace(/"/g, '""');
            return `"${str}"`;
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

  const handleExportJSON = () => {
    const rowsToExport = rawRows;
    if (rowsToExport.length === 0) return;
    const jsonArr = rowsToExport.map((r) => {
      const obj: Record<string, any> = {};
      columns.forEach((col, i) => {
        obj[col] = r[i];
      });
      return obj;
    });

    const jsonStr = JSON.stringify(jsonArr, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `query_result_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('✓ JSON file exported successfully.');
  };

  const handleExportExcel = () => {
    const rowsToExport = rawRows;
    if (rowsToExport.length === 0) return;

    let xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="Header">
   <Font ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#000080" ss:Pattern="Solid"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="QueryResult">
  <Table>
   <Row>`;

    columns.forEach((col) => {
      xml += `<Cell ss:StyleID="Header"><Data ss:Type="String">${String(col).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</Data></Cell>`;
    });
    xml += `</Row>`;

    rowsToExport.forEach((row) => {
      xml += `<Row>`;
      row.forEach((val) => {
        if (val === null || val === undefined) {
          xml += `<Cell><Data ss:Type="String"></Data></Cell>`;
        } else if (typeof val === 'number') {
          xml += `<Cell><Data ss:Type="Number">${val}</Data></Cell>`;
        } else {
          const safeStr = String(val).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
          xml += `<Cell><Data ss:Type="String">${safeStr}</Data></Cell>`;
        }
      });
      xml += `</Row>`;
    });

    xml += `</Table>
 </Worksheet>
</Workbook>`;

    const blob = new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `query_result_${Date.now()}.xls`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('✓ Excel spreadsheet (.xls) exported successfully.');
  };

  const handleExportSQL = () => {
    const rowsToExport = rawRows;
    if (rowsToExport.length === 0) return;
    const tableName = inferredTables[0] || 'result_data';
    const targetDialect = (dialect as Dialect) || 'MySQL';

    const insertStatements = generateInsertStatements(
      tableName,
      columns,
      rowsToExport,
      targetDialect
    );

    const blob = new Blob([insertStatements], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tableName}_inserts_${targetDialect.toLowerCase()}.sql`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`✓ Exported ${rowsToExport.length} INSERTs (${targetDialect}).`);
  };

  const handleExportDDL = () => {
    const tableName = inferredTables[0] || 'result_data';
    const targetDialect = (dialect as Dialect) || 'MySQL';

    // Infer basic types for columns from first non-null row
    const exportCols: ExportColumnDef[] = columns.map((colName, colIdx) => {
      let inferredType: ColumnType = 'VARCHAR';
      for (const row of rawRows) {
        const val = row[colIdx];
        if (val !== null && val !== undefined) {
          if (typeof val === 'number') {
            inferredType = Number.isInteger(val) ? 'INTEGER' : 'NUMERIC';
          } else if (typeof val === 'boolean') {
            inferredType = 'BOOLEAN';
          } else if (val instanceof Date || (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}/.test(val))) {
            inferredType = 'TIMESTAMP';
          }
          break;
        }
      }
      return {
        name: colName,
        inferredType,
        isPrimaryKey: colName.toLowerCase() === 'id',
      };
    });

    const ddlStatement = generateDDLStatement(tableName, exportCols, targetDialect);
    const blob = new Blob([ddlStatement], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tableName}_schema_${targetDialect.toLowerCase()}.sql`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`✓ Exported Schema DDL (${targetDialect}).`);
  };

  return (
    <div
      className="win95-inset"
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--w95-sunken-bg, #ffffff)',
        color: 'var(--w95-sunken-text, #000000)',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Action & Export Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '2px 6px',
          height: '28px',
          boxSizing: 'border-box',
          background: 'var(--w95-gray, #c0c0c0)',
          color: 'var(--w95-text-color, #000000)',
          borderBottom: '1px solid var(--w95-dark-gray, #808080)',
          fontSize: '11px',
          gap: '6px',
        }}
      >
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          {/* Output View Mode Toggles */}
          <button
            className={`win95-button ${viewMode === 'data' ? 'active' : ''}`}
            style={{
              fontSize: '11px',
              padding: '1px 8px',
              fontWeight: viewMode === 'data' ? 'bold' : 'normal',
              background: viewMode === 'data' ? 'var(--w95-sunken-bg, #ffffff)' : undefined,
              color: viewMode === 'data' ? 'var(--w95-sunken-text, #000000)' : undefined,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
            }}
            onClick={() => setViewMode('data')}
            title="View query results as tabular data grid"
          >
            <span>📊</span>
            <span>Data</span>
          </button>

          <button
            className={`win95-button ${viewMode === 'visual' ? 'active' : ''}`}
            style={{
              fontSize: '11px',
              padding: '1px 8px',
              fontWeight: viewMode === 'visual' ? 'bold' : 'normal',
              background: viewMode === 'visual' ? 'var(--w95-sunken-bg, #ffffff)' : undefined,
              color: viewMode === 'visual' ? 'var(--w95-sunken-text, #000000)' : undefined,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
            }}
            onClick={() => setViewMode('visual')}
            title="Visualize query results as interactive charts"
          >
            <span>📈</span>
            <span>Visual</span>
          </button>

          <div className="win95-divider-v" style={{ margin: '0 2px' }} />

          {/* Consolidated Export Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              className="win95-button"
              style={{ fontSize: '11px', padding: '1px 8px' }}
              onClick={() => setExportMenuOpen((prev) => !prev)}
              title="Export result set to file format"
            >
              💾 Export ▾
            </button>

            {exportMenuOpen && (
              <div
                className="win95-window"
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  marginTop: '2px',
                  width: '180px',
                  background: 'var(--w95-gray, #c0c0c0)',
                  boxShadow: '2px 2px 8px rgba(0,0,0,0.3)',
                  padding: '2px',
                  zIndex: 99999,
                }}
              >
                <div
                  className="win95-menu-item"
                  onClick={() => { handleExportCSV(); setExportMenuOpen(false); }}
                  style={{ padding: '4px 8px', fontSize: '11px', cursor: 'pointer' }}
                >
                  📄 Export as CSV File
                </div>
                <div
                  className="win95-menu-item"
                  onClick={() => { handleExportExcel(); setExportMenuOpen(false); }}
                  style={{ padding: '4px 8px', fontSize: '11px', cursor: 'pointer' }}
                >
                  📗 Export as Excel Sheet (.xls)
                </div>
                <div
                  className="win95-menu-item"
                  onClick={() => { handleExportJSON(); setExportMenuOpen(false); }}
                  style={{ padding: '4px 8px', fontSize: '11px', cursor: 'pointer' }}
                >
                  📋 Export as JSON File
                </div>
                <div
                  className="win95-menu-item"
                  onClick={() => { handleExportSQL(); setExportMenuOpen(false); }}
                  style={{ padding: '4px 8px', fontSize: '11px', cursor: 'pointer' }}
                >
                  📝 Export as SQL INSERTs
                </div>
                <div
                  className="win95-menu-item"
                  onClick={() => { handleExportDDL(); setExportMenuOpen(false); }}
                  style={{ padding: '4px 8px', fontSize: '11px', cursor: 'pointer' }}
                >
                  📜 Export as DDL Schema
                </div>
              </div>
            )}
          </div>

          {toastNotice && (
            <span style={{ color: '#006600', fontWeight: 'bold', fontSize: '10px' }}>
              {toastNotice}
            </span>
          )}
        </div>

        {/* Quick Row Search Input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <label style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--w95-text-color, #000000)' }}>Filter:</label>
          <input
            type="text"
            className="win95-sunken"
            placeholder="Search rows..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '130px', padding: '1px 4px', fontSize: '10px', background: 'var(--w95-sunken-bg, #ffffff)', color: 'var(--w95-sunken-text, #000000)' }}
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
            background: 'var(--w95-gray, #d4d0c8)',
            color: 'var(--w95-text-color, #000000)',
            padding: '3px 4px 0 4px',
            borderBottom: '1px solid var(--w95-dark-gray, #808080)',
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

      {viewMode === 'visual' ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--w95-sunken-bg, #ffffff)', color: 'var(--w95-sunken-text, #000000)' }}>
          {/* Visual Controls Strip */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 8px',
              background: 'var(--w95-gray, #c0c0c0)',
              borderBottom: '1px solid var(--w95-dark-gray, #808080)',
              fontSize: '11px',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <strong>Chart:</strong>
              <select
                className="win95-sunken"
                value={chartType}
                onChange={(e) => setChartType(e.target.value as any)}
                style={{ padding: '1px 4px', fontSize: '11px', background: 'var(--w95-sunken-bg, #ffffff)', color: 'var(--w95-sunken-text, #000000)' }}
              >
                <option value="bar">📊 Proportional Bar Chart</option>
                <option value="kpi">🎛️ Metric KPI Cards</option>
                <option value="line">📈 Trend Polyline Chart</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <strong>Category (X):</strong>
              <select
                className="win95-sunken"
                value={selectedCatCol}
                onChange={(e) => setSelectedCatCol(Number(e.target.value))}
                style={{ padding: '1px 4px', fontSize: '11px', background: 'var(--w95-sunken-bg, #ffffff)', color: 'var(--w95-sunken-text, #000000)' }}
              >
                {columns.map((c, i) => (
                  <option key={i} value={i}>{c}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <strong>Metric (Y):</strong>
              <select
                className="win95-sunken"
                value={selectedNumCol}
                onChange={(e) => setSelectedNumCol(Number(e.target.value))}
                style={{ padding: '1px 4px', fontSize: '11px', background: 'var(--w95-sunken-bg, #ffffff)', color: 'var(--w95-sunken-text, #000000)' }}
              >
                {columns.map((c, i) => (
                  <option key={i} value={i}>{c}</option>
                ))}
              </select>
            </div>

            <span style={{ marginLeft: 'auto', fontSize: '10px', opacity: 0.8 }}>
              Total: <strong>{sumChartVal.toLocaleString()}</strong> │ Avg: <strong>{avgChartVal.toFixed(2)}</strong> │ Max: <strong>{maxChartVal.toLocaleString()}</strong>
            </span>
          </div>

          {/* Visual Canvas Viewport */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
            {rawRows.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px 12px', opacity: 0.7 }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>📊</div>
                <strong style={{ fontSize: '13px' }}>No query result data available</strong>
                <p style={{ fontSize: '11px', marginTop: '4px' }}>Execute a query first to visualize results.</p>
              </div>
            ) : numericColIndices.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px 12px', opacity: 0.8 }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>💡</div>
                <strong style={{ fontSize: '13px' }}>No numeric columns found in this result set</strong>
                <p style={{ fontSize: '11px', marginTop: '4px' }}>
                  Include numeric fields (e.g. <code>COUNT()</code>, <code>SUM()</code>, <code>price</code>, <code>value</code>) in your query to render charts.
                </p>
              </div>
            ) : chartType === 'kpi' ? (
              /* KPI Cards Mode */
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '10px', padding: '4px' }}>
                <div className="win95-sunken" style={{ padding: '12px', background: 'var(--w95-sunken-bg, #ffffff)', color: 'var(--w95-sunken-text, #000000)', borderRadius: isDark ? '6px' : '0' }}>
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', opacity: 0.7, fontWeight: 'bold' }}>
                    TOTAL {columns[selectedNumCol]}
                  </div>
                  <div style={{ fontSize: '22px', fontWeight: 'bold', marginTop: '6px', color: isDark ? '#38bdf8' : '#000080' }}>
                    {sumChartVal.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '10px', opacity: 0.6, marginTop: '4px' }}>Cumulative across {chartData.length} records</div>
                </div>

                <div className="win95-sunken" style={{ padding: '12px', background: 'var(--w95-sunken-bg, #ffffff)', color: 'var(--w95-sunken-text, #000000)', borderRadius: isDark ? '6px' : '0' }}>
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', opacity: 0.7, fontWeight: 'bold' }}>
                    AVERAGE VALUE
                  </div>
                  <div style={{ fontSize: '22px', fontWeight: 'bold', marginTop: '6px', color: isDark ? '#4ade80' : '#006600' }}>
                    {avgChartVal.toFixed(2)}
                  </div>
                  <div style={{ fontSize: '10px', opacity: 0.6, marginTop: '4px' }}>Mean per category item</div>
                </div>

                <div className="win95-sunken" style={{ padding: '12px', background: 'var(--w95-sunken-bg, #ffffff)', color: 'var(--w95-sunken-text, #000000)', borderRadius: isDark ? '6px' : '0' }}>
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', opacity: 0.7, fontWeight: 'bold' }}>
                    PEAK / MAXIMUM
                  </div>
                  <div style={{ fontSize: '22px', fontWeight: 'bold', marginTop: '6px', color: isDark ? '#f43f5e' : '#800000' }}>
                    {maxChartVal.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '10px', opacity: 0.6, marginTop: '4px' }}>Top recorded metric point</div>
                </div>

                <div className="win95-sunken" style={{ padding: '12px', background: 'var(--w95-sunken-bg, #ffffff)', color: 'var(--w95-sunken-text, #000000)', borderRadius: isDark ? '6px' : '0' }}>
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', opacity: 0.7, fontWeight: 'bold' }}>
                    SAMPLE VOLUME
                  </div>
                  <div style={{ fontSize: '22px', fontWeight: 'bold', marginTop: '6px' }}>
                    {chartData.length} rows
                  </div>
                  <div style={{ fontSize: '10px', opacity: 0.6, marginTop: '4px' }}>Plotted from active result set</div>
                </div>
              </div>
            ) : chartType === 'line' ? (
              /* Trend Line Mode */
              <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <svg viewBox="0 0 500 160" style={{ width: '100%', height: '160px', overflow: 'visible' }}>
                  <line x1="0" y1="20" x2="500" y2="20" stroke="var(--w95-dark-gray)" strokeDasharray="3 3" opacity="0.3" />
                  <line x1="0" y1="80" x2="500" y2="80" stroke="var(--w95-dark-gray)" strokeDasharray="3 3" opacity="0.3" />
                  <line x1="0" y1="140" x2="500" y2="140" stroke="var(--w95-dark-gray)" strokeWidth="1" opacity="0.6" />

                  {chartData.length > 1 && (
                    <>
                      <polygon
                        points={`0,140 ${chartData.map((d, idx) => {
                          const x = (idx / (chartData.length - 1)) * 500;
                          const y = 140 - (d.value / maxChartVal) * 120;
                          return `${x},${y}`;
                        }).join(' ')} 500,140`}
                        fill={isDark ? 'rgba(56, 189, 248, 0.15)' : 'rgba(0, 0, 128, 0.12)'}
                      />
                      <polyline
                        points={chartData.map((d, idx) => {
                          const x = (idx / (chartData.length - 1)) * 500;
                          const y = 140 - (d.value / maxChartVal) * 120;
                          return `${x},${y}`;
                        }).join(' ')}
                        fill="none"
                        stroke={isDark ? '#38bdf8' : '#000080'}
                        strokeWidth="2"
                      />
                      {chartData.map((d, idx) => {
                        const x = (idx / (chartData.length - 1)) * 500;
                        const y = 140 - (d.value / maxChartVal) * 120;
                        return (
                          <g key={idx}>
                            <circle cx={x} cy={y} r="3" fill={isDark ? '#38bdf8' : '#000080'} />
                            <text x={x} y={y - 6} textAnchor="middle" fontSize="8" fill="var(--w95-text-color)" fontWeight="bold">
                              {d.value}
                            </text>
                          </g>
                        );
                      })}
                    </>
                  )}
                </svg>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', opacity: 0.7, padding: '0 4px' }}>
                  <span>{chartData[0]?.label}</span>
                  <span>{chartData[Math.floor(chartData.length / 2)]?.label}</span>
                  <span>{chartData[chartData.length - 1]?.label}</span>
                </div>
              </div>
            ) : (
              /* Proportional Bar Chart Mode */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {chartData.map((d, idx) => {
                  const pct = Math.max(3, (d.value / maxChartVal) * 100);
                  const retroPalette = ['#000080', '#008080', '#800080', '#808000', '#006600', '#800000', '#1084d0'];
                  const barColor = isDark
                    ? 'linear-gradient(90deg, #38bdf8, #818cf8)'
                    : retroPalette[idx % retroPalette.length];

                  return (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11px' }}>
                      <div
                        style={{
                          width: '130px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          fontWeight: 'bold',
                          textAlign: 'right',
                          color: 'var(--w95-text-color)',
                        }}
                        title={d.label}
                      >
                        {d.label}
                      </div>

                      <div
                        className="win95-sunken"
                        style={{
                          flex: 1,
                          height: '20px',
                          background: 'var(--w95-sunken-bg, #ffffff)',
                          position: 'relative',
                          overflow: 'hidden',
                          display: 'flex',
                          alignItems: 'center',
                          borderRadius: isDark ? '4px' : '0',
                        }}
                      >
                        <div
                          style={{
                            width: `${pct}%`,
                            height: '100%',
                            background: barColor,
                            transition: 'width 0.3s ease-out',
                            borderRight: isDark ? 'none' : '1px solid #000000',
                          }}
                        />
                      </div>

                      <div
                        style={{
                          minWidth: '85px',
                          fontWeight: 'bold',
                          fontFamily: 'var(--w95-mono)',
                          fontSize: '11px',
                          color: 'var(--w95-text-color)',
                        }}
                      >
                        {d.value.toLocaleString()}
                        <span style={{ fontSize: '9px', opacity: 0.65, marginLeft: '4px' }}>
                          ({sumChartVal > 0 ? ((d.value / sumChartVal) * 100).toFixed(0) : 0}%)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
      /* Virtualized Scrollable Grid Table */
      <div
        ref={containerRef}
        onScroll={(e) => setScrollTop((e.target as HTMLDivElement).scrollTop)}
        style={{ flex: 1, overflow: 'auto', position: 'relative', background: 'var(--w95-sunken-bg, #ffffff)', color: 'var(--w95-sunken-text, #000000)' }}
      >
        <table className="win95-grid" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--w95-gray, #c0c0c0)', color: 'var(--w95-text-color, #000000)' }}>
              <th style={{ width: '40px', textAlign: 'center' }}>#</th>
              {columns.map((col, idx) => {
                const isSorted = sortColIdx === idx;
                const colType = columnTypes[idx] || 'ANY';
                return (
                  <th
                    key={idx}
                    onClick={() => handleColumnSort(idx)}
                    style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap', padding: '3px 8px' }}
                    title={`Click to sort ${col} (${colType}) (ASC -> DESC -> Unsorted)`}
                  >
                    <span style={{ fontWeight: 'bold' }}>{col}</span>
                    <span style={{ marginLeft: '4px', fontSize: '9px', opacity: 0.65, fontWeight: 'normal', fontFamily: 'var(--w95-mono)' }}>
                      [{colType}]
                    </span>
                    {isSorted && (
                      <span style={{ marginLeft: '4px', fontSize: '9px', color: 'var(--w95-text-color, #000080)' }}>
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
                <td colSpan={columns.length + 1} style={{ textAlign: 'center', padding: '16px', color: 'var(--w95-dark-gray, #666)' }}>
                  {searchQuery ? 'No rows match filter criteria.' : 'Query executed successfully (0 rows returned).'}
                </td>
              </tr>
            ) : (
              <>
                {/* Top Virtual Spacer */}
                {topSpacerHeight > 0 && (
                  <tr style={{ height: `${topSpacerHeight}px` }}>
                    <td colSpan={columns.length + 1} style={{ padding: 0, border: 'none' }} />
                  </tr>
                )}

                {/* Visible Virtual Window Rows */}
                {visibleRows.map(({ row, originalIndex }) => (
                  <tr key={originalIndex} style={{ height: `${ROW_HEIGHT}px` }}>
                    <td style={{ textAlign: 'center', color: 'var(--w95-text-color, #888)', background: 'var(--w95-gray, #f5f5f5)', fontWeight: 'bold', fontSize: '10px' }}>
                      {originalIndex + 1}
                    </td>
                    {row.map((val, colIdx) => {
                      const isNum = typeof val === 'number';
                      return (
                        <td
                          key={colIdx}
                          onDoubleClick={() => setInspectedCell({ val, colName: columns[colIdx], rowIdx: originalIndex + 1 })}
                          onClick={() => {
                            if (val !== null && val !== undefined && typeof navigator !== 'undefined' && navigator.clipboard) {
                              navigator.clipboard.writeText(typeof val === 'object' ? JSON.stringify(val) : String(val));
                              showToast(`📋 Copied: ${String(val).slice(0, 24)}`);
                            }
                          }}
                          title="Click to copy, double-click to inspect cell value"
                          style={{
                            cursor: 'pointer',
                            textAlign: isNum ? 'right' : 'left',
                            fontVariantNumeric: isNum ? 'tabular-nums' : undefined,
                            fontFamily: isNum ? 'var(--w95-mono)' : undefined,
                            padding: '2px 8px',
                          }}
                        >
                          {val === null || val === undefined ? (
                            <span style={{ color: 'var(--w95-dark-gray, #999999)', fontStyle: 'italic', opacity: 0.6 }}>&lt;NULL&gt;</span>
                          ) : typeof val === 'object' ? (
                            JSON.stringify(val)
                          ) : (
                            String(val)
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}

                {/* Bottom Virtual Spacer */}
                {bottomSpacerHeight > 0 && (
                  <tr style={{ height: `${bottomSpacerHeight}px` }}>
                    <td colSpan={columns.length + 1} style={{ padding: 0, border: 'none' }} />
                  </tr>
                )}
              </>
            )}
          </tbody>
        </table>
      </div>
      )}

      {/* Grid Bottom Summary Bar */}
      <div className="win95-statusbar">
        <div className="win95-statusbar-pane">
          Rows: <strong>{processedRows.length}</strong> {searchQuery && `(filtered from ${rowCount})`}
        </div>
        <div className="win95-statusbar-pane">
          Size: <strong>{dataSizeFormatted}</strong>
        </div>
        <div className="win95-statusbar-pane">
          Time: <strong>{executionTimeMs !== null ? `${executionTimeMs.toFixed(1)} ms` : '0 ms'}</strong>
        </div>
        {inferredTables.length > 0 && (
          <div className="win95-statusbar-pane" style={{ color: 'var(--w95-text-color, #000080)' }}>
            Inferred: <strong>{inferredTables.join(', ')}</strong>
          </div>
        )}
        {reusedTables.length > 0 && (
          <div className="win95-statusbar-pane" style={{ color: 'var(--w95-text-color, #006600)' }}>
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
                Column: <span style={{ color: 'var(--w95-text-color, #000080)' }}>{inspectedCell.colName}</span> | Type:{' '}
                <span style={{ color: 'var(--w95-text-color, #800080)' }}>{inspectedCell.val === null ? 'NULL' : typeof inspectedCell.val}</span>
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
                  background: 'var(--w95-sunken-bg, #ffffff)',
                  color: 'var(--w95-sunken-text, #000000)',
                  boxSizing: 'border-box',
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
