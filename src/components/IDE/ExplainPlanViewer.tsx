'use client';

/**
 * ExplainPlanViewer.tsx — Visual Query Execution Plan & Optimizer Analyzer
 * Transforms raw SQLite EXPLAIN QUERY PLAN bytecode into an interactive hierarchical
 * execution tree with branch guides, bottleneck detection, index advisor, and raw opcodes.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { SQLExecutor } from '../../engine/executor';
import { Dialect } from '../../engine/parser';
import { useTheme } from '../../hooks/useTheme';

interface ExplainPlanViewerProps {
  isOpen: boolean;
  onClose: () => void;
  queryText: string;
  dialect: Dialect;
  executor: SQLExecutor;
}

interface PlanNode {
  id: number;
  parent: number;
  notused: number;
  detail: string;
  depth: number;
  opType: 'SCAN' | 'INDEX' | 'SORT' | 'COROUTINE' | 'JOIN' | 'OP';
}

export const ExplainPlanViewer: React.FC<ExplainPlanViewerProps> = ({
  isOpen,
  onClose,
  queryText,
  dialect,
  executor,
}) => {
  const { activeTheme } = useTheme();
  const isDark = activeTheme === 'macos-glass' || activeTheme === 'win95-noir';

  const [activeTab, setActiveTab] = useState<'tree' | 'insights' | 'raw'>('tree');
  const [planRows, setPlanRows] = useState<PlanNode[]>([]);
  const [rawOutput, setRawOutput] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<number | null>(null);
  const [copyFeedback, setCopyFeedback] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsLoading(true);
    setErrorMsg(null);
    setSelectedNodeId(null);

    (async () => {
      try {
        const db = (executor as any).db;
        if (!db) {
          throw new Error('No active session database found. Please run your query first (F5) so tables and schema are generated in memory, then view the Execution Plan.');
        }

        // Clean query text (first executable SELECT query)
        const cleanQuery = queryText
          .replace(/--.*$/gm, '')
          .replace(/\/\*[\s\S]*?\*\//g, '')
          .trim();

        if (!cleanQuery) {
          if (isMounted) {
            setErrorMsg('Please enter a valid SQL SELECT statement to analyze.');
            setIsLoading(false);
          }
          return;
        }

        const explainSql = `EXPLAIN QUERY PLAN ${cleanQuery.replace(/;+$/, '')};`;
        const res = db.exec(explainSql);

        if (res && res.length > 0 && res[0].values) {
          const rawNodes = res[0].values.map((v: any[]) => ({
            id: Number(v[0]),
            parent: Number(v[1]),
            notused: Number(v[2]),
            detail: String(v[3] || v[2] || ''),
          }));

          // Calculate depth and operation types for each step
          const nodes: PlanNode[] = rawNodes.map((n: any) => {
            // Walk up parents to calculate tree depth
            let depth = 0;
            let currParent = n.parent;
            const visited = new Set<number>();
            while (currParent > 0 && !visited.has(currParent)) {
              visited.add(currParent);
              depth++;
              const parentObj = rawNodes.find((x: any) => x.id === currParent);
              currParent = parentObj ? parentObj.parent : 0;
            }

            // Classify operation type
            let opType: PlanNode['opType'] = 'OP';
            if (/SCAN/i.test(n.detail)) opType = 'SCAN';
            else if (/INDEX|COVERING/i.test(n.detail)) opType = 'INDEX';
            else if (/TEMP B-TREE|ORDER BY|SORT/i.test(n.detail)) opType = 'SORT';
            else if (/CO-ROUTINE|SUBQUERY/i.test(n.detail)) opType = 'COROUTINE';
            else if (/JOIN|NESTED/i.test(n.detail)) opType = 'JOIN';

            return {
              ...n,
              depth,
              opType,
            };
          });

          if (isMounted) {
            setPlanRows(nodes);
            setRawOutput(
              nodes
                .map((n) => `[ID: ${n.id} -> Parent: ${n.parent}] (Depth: ${n.depth}) ${n.detail}`)
                .join('\n')
            );
            setIsLoading(false);
          }
        } else {
          if (isMounted) {
            setPlanRows([]);
            setRawOutput('Query planned with direct scalar evaluation.');
            setIsLoading(false);
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setErrorMsg(err?.message || 'Failed to generate execution plan.');
          setIsLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [isOpen, queryText, executor]);

  // Aggregate execution plan metrics
  const metrics = useMemo(() => {
    const totalSteps = planRows.length;
    const scans = planRows.filter((n) => n.opType === 'SCAN');
    const sorts = planRows.filter((n) => n.opType === 'SORT');
    const indices = planRows.filter((n) => n.opType === 'INDEX');
    const coroutines = planRows.filter((n) => n.opType === 'COROUTINE');

    // Extract table names from scans
    const scannedTables = scans.map((s) => {
      const match = s.detail.match(/SCAN (TABLE\s+)?([a-zA-Z0-9_]+)/i);
      return match ? match[2] : 'table';
    });

    const isHighComplexity = scans.length > 0 && sorts.length > 0;
    const estimatedCostRating = isHighComplexity
      ? 'O(N log N) — Sequential Scan & Temp Sort'
      : scans.length > 0
      ? 'O(N) — Linear Table Scan'
      : indices.length > 0
      ? 'O(log N) — B-Tree Index Seek'
      : 'O(1) — Direct Scalar Lookup';

    return {
      totalSteps,
      scansCount: scans.length,
      sortsCount: sorts.length,
      indicesCount: indices.length,
      coroutinesCount: coroutines.length,
      scannedTables: Array.from(new Set(scannedTables)),
      estimatedCostRating,
    };
  }, [planRows]);

  const handleCopyRaw = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(rawOutput);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999999,
        backdropFilter: isDark ? 'blur(8px)' : undefined,
      }}
      onClick={onClose}
    >
      <div
        className="win95-window"
        style={{
          width: '680px',
          maxWidth: '95vw',
          height: '560px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: isDark ? '0 16px 40px rgba(0,0,0,0.6)' : '4px 4px 14px rgba(0,0,0,0.5)',
          borderRadius: isDark ? '12px' : '0',
          overflow: 'hidden',
          background: 'var(--w95-gray, #c0c0c0)',
          color: 'var(--w95-text-color, #000000)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Titlebar */}
        <div className="win95-titlebar" style={{ padding: '4px 8px' }}>
          <div className="win95-titlebar-text" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>⚡</span>
            <strong>Query Execution Plan & Optimizer Analyzer</strong>
          </div>
          <div className="win95-titlebar-controls">
            <button className="win95-btn-titlebar" onClick={onClose} title="Close">
              ✕
            </button>
          </div>
        </div>

        {/* Subheader Dialect & Optimizer Banner */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '6px 12px',
            background: isDark ? 'rgba(255, 255, 255, 0.04)' : '#ece9d8',
            borderBottom: '1px solid var(--w95-border-dark, #808080)',
            fontSize: '11px',
          }}
        >
          <div>
            <span>Engine: <strong>SQLite 3.49.1 (WASM)</strong></span>
            <span style={{ margin: '0 8px', opacity: 0.5 }}>│</span>
            <span>Target Dialect: <strong>{dialect}</strong></span>
          </div>

          <span
            style={{
              padding: '2px 8px',
              borderRadius: '4px',
              fontWeight: 'bold',
              fontFamily: 'var(--w95-mono)',
              fontSize: '10px',
              background: metrics.scansCount > 0 ? (isDark ? 'rgba(239, 68, 68, 0.2)' : '#fce8e6') : (isDark ? 'rgba(34, 197, 94, 0.2)' : '#e6f4ea'),
              color: metrics.scansCount > 0 ? (isDark ? '#f87171' : '#c5221f') : (isDark ? '#4ade80' : '#137333'),
              border: `1px solid ${metrics.scansCount > 0 ? (isDark ? 'rgba(239,68,68,0.4)' : '#f5c6cb') : (isDark ? 'rgba(34,197,94,0.4)' : '#c3e6cb')}`,
            }}
          >
            {metrics.estimatedCostRating}
          </span>
        </div>

        {/* Executive Metric Cards Strip */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '8px',
            padding: '8px 12px',
            background: isDark ? 'rgba(20, 20, 24, 0.7)' : '#f0f0f0',
            borderBottom: '1px solid var(--w95-border-dark, #808080)',
          }}
        >
          <div className="win95-sunken" style={{ padding: '6px 8px', background: 'var(--w95-sunken-bg, #ffffff)', borderRadius: isDark ? '4px' : '0' }}>
            <div style={{ fontSize: '9px', textTransform: 'uppercase', opacity: 0.7, fontWeight: 'bold' }}>TOTAL STEPS</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', marginTop: '2px', color: 'var(--w95-text-color)' }}>{metrics.totalSteps}</div>
          </div>

          <div className="win95-sunken" style={{ padding: '6px 8px', background: 'var(--w95-sunken-bg, #ffffff)', borderRadius: isDark ? '4px' : '0' }}>
            <div style={{ fontSize: '9px', textTransform: 'uppercase', opacity: 0.7, fontWeight: 'bold' }}>TABLE SCANS</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', marginTop: '2px', color: metrics.scansCount > 0 ? '#ef4444' : (isDark ? '#4ade80' : '#16a34a') }}>
              {metrics.scansCount}
            </div>
          </div>

          <div className="win95-sunken" style={{ padding: '6px 8px', background: 'var(--w95-sunken-bg, #ffffff)', borderRadius: isDark ? '4px' : '0' }}>
            <div style={{ fontSize: '9px', textTransform: 'uppercase', opacity: 0.7, fontWeight: 'bold' }}>TEMP B-TREES</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', marginTop: '2px', color: metrics.sortsCount > 0 ? '#eab308' : (isDark ? '#94a3b8' : '#666666') }}>
              {metrics.sortsCount}
            </div>
          </div>

          <div className="win95-sunken" style={{ padding: '6px 8px', background: 'var(--w95-sunken-bg, #ffffff)', borderRadius: isDark ? '4px' : '0' }}>
            <div style={{ fontSize: '9px', textTransform: 'uppercase', opacity: 0.7, fontWeight: 'bold' }}>INDEX SEEKS</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', marginTop: '2px', color: metrics.indicesCount > 0 ? '#22c55e' : (isDark ? '#94a3b8' : '#666666') }}>
              {metrics.indicesCount}
            </div>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div style={{ display: 'flex', gap: '4px', padding: '6px 12px 0 12px', background: 'var(--w95-gray, #c0c0c0)' }}>
          <button
            className={`win95-tab ${activeTab === 'tree' ? 'active' : ''}`}
            onClick={() => setActiveTab('tree')}
            style={{
              padding: '4px 12px',
              fontSize: '11px',
              fontWeight: activeTab === 'tree' ? 'bold' : 'normal',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span>🌳</span>
            <span>Visual Execution Tree</span>
          </button>

          <button
            className={`win95-tab ${activeTab === 'insights' ? 'active' : ''}`}
            onClick={() => setActiveTab('insights')}
            style={{
              padding: '4px 12px',
              fontSize: '11px',
              fontWeight: activeTab === 'insights' ? 'bold' : 'normal',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span>⚠️</span>
            <span>Optimizer Insights ({metrics.scansCount + metrics.sortsCount} alerts)</span>
          </button>

          <button
            className={`win95-tab ${activeTab === 'raw' ? 'active' : ''}`}
            onClick={() => setActiveTab('raw')}
            style={{
              padding: '4px 12px',
              fontSize: '11px',
              fontWeight: activeTab === 'raw' ? 'bold' : 'normal',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span>📝</span>
            <span>Raw SQLite Bytecode</span>
          </button>
        </div>

        {/* Content Body Area */}
        <div style={{ padding: '0 12px 10px 12px', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {isLoading ? (
            <div
              className="win95-sunken"
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--w95-sunken-bg, #ffffff)',
                color: 'var(--w95-sunken-text, #000000)',
                fontSize: '12px',
              }}
            >
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>⏳</div>
              <strong>Analyzing AST & SQLite Execution Bytecode...</strong>
              <span style={{ fontSize: '11px', opacity: 0.7, marginTop: '4px' }}>Evaluating scan paths, index access, and temporary sorting structures</span>
            </div>
          ) : errorMsg ? (
            <div
              className="win95-sunken"
              style={{
                flex: 1,
                padding: '16px',
                backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#fff0f0',
                color: isDark ? '#fca5a5' : '#b00020',
                fontFamily: 'var(--w95-mono)',
                fontSize: '11px',
                overflow: 'auto',
                border: isDark ? '1px solid rgba(239, 68, 68, 0.3)' : undefined,
                borderRadius: isDark ? '6px' : '0',
              }}
            >
              <div style={{ fontWeight: 'bold', fontSize: '13px', marginBottom: '8px' }}>⚠️ Execution Plan Analysis Error</div>
              <p>{errorMsg}</p>
            </div>
          ) : (
            <div
              className="win95-sunken"
              style={{
                flex: 1,
                background: 'var(--w95-sunken-bg, #ffffff)',
                color: 'var(--w95-sunken-text, #000000)',
                overflow: 'auto',
                padding: '10px',
                borderRadius: isDark ? '6px' : '0',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {activeTab === 'tree' && (
                /* Tab 1: Visual Execution Tree with Depth Indentation & Branch Connectors */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ fontSize: '11px', opacity: 0.7, marginBottom: '6px' }}>
                    Execution pipeline evaluated from innermost co-routines to outer projections:
                  </div>

                  {planRows.length === 0 ? (
                    <div style={{ padding: '24px', textAlign: 'center', opacity: 0.7 }}>
                      No scan or sort operations recorded for this query.
                    </div>
                  ) : (
                    planRows.map((node, idx) => {
                      const isSelected = selectedNodeId === node.id;
                      const indentPx = node.depth * 24;

                      // Badge styling
                      const badgeStyles = {
                        SCAN: {
                          bg: isDark ? 'rgba(239, 68, 68, 0.25)' : '#fbe4e4',
                          color: isDark ? '#f87171' : '#990000',
                          border: isDark ? 'rgba(239, 68, 68, 0.4)' : '#f5c6cb',
                          label: 'SCAN',
                        },
                        INDEX: {
                          bg: isDark ? 'rgba(34, 197, 94, 0.25)' : '#e0f4e0',
                          color: isDark ? '#4ade80' : '#006600',
                          border: isDark ? 'rgba(34, 197, 94, 0.4)' : '#c3e6cb',
                          label: 'INDEX',
                        },
                        SORT: {
                          bg: isDark ? 'rgba(234, 179, 8, 0.25)' : '#fff2cc',
                          color: isDark ? '#facc15' : '#806000',
                          border: isDark ? 'rgba(234, 179, 8, 0.4)' : '#ffeeba',
                          label: 'SORT',
                        },
                        COROUTINE: {
                          bg: isDark ? 'rgba(56, 189, 248, 0.25)' : '#e0f2fe',
                          color: isDark ? '#38bdf8' : '#0369a1',
                          border: isDark ? 'rgba(56, 189, 248, 0.4)' : '#bae6fd',
                          label: 'CO-ROUTINE',
                        },
                        JOIN: {
                          bg: isDark ? 'rgba(168, 85, 247, 0.25)' : '#f3e8ff',
                          color: isDark ? '#c084fc' : '#7e22ce',
                          border: isDark ? 'rgba(168, 85, 247, 0.4)' : '#e9d5ff',
                          label: 'JOIN',
                        },
                        OP: {
                          bg: isDark ? 'rgba(255, 255, 255, 0.1)' : '#f0f0f0',
                          color: isDark ? '#e2e8f0' : '#333333',
                          border: isDark ? 'rgba(255, 255, 255, 0.15)' : '#d0d0d0',
                          label: 'OP',
                        },
                      }[node.opType];

                      return (
                        <div
                          key={node.id}
                          onClick={() => setSelectedNodeId(isSelected ? null : node.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '6px 10px',
                            paddingLeft: `${10 + indentPx}px`,
                            borderRadius: isDark ? '6px' : '2px',
                            background: isSelected
                              ? (isDark ? 'rgba(56, 189, 248, 0.2)' : '#e8f0fe')
                              : (idx % 2 === 0 ? (isDark ? 'rgba(255, 255, 255, 0.02)' : 'transparent') : (isDark ? 'rgba(255, 255, 255, 0.04)' : '#fafafa')),
                            border: isSelected
                              ? `1px solid ${isDark ? '#38bdf8' : '#000080'}`
                              : '1px solid transparent',
                            cursor: 'pointer',
                            transition: 'background 0.15s ease',
                          }}
                        >
                          {/* Visual Tree Connector Guides */}
                          {node.depth > 0 && (
                            <span
                              style={{
                                fontFamily: 'var(--w95-mono)',
                                color: isDark ? '#64748b' : '#999999',
                                fontSize: '11px',
                                userSelect: 'none',
                              }}
                            >
                              └──
                            </span>
                          )}

                          {/* Operation Badge */}
                          <span
                            style={{
                              fontSize: '10px',
                              fontFamily: 'var(--w95-mono)',
                              fontWeight: 'bold',
                              padding: '2px 6px',
                              borderRadius: '3px',
                              background: badgeStyles.bg,
                              color: badgeStyles.color,
                              border: `1px solid ${badgeStyles.border}`,
                              minWidth: '55px',
                              textAlign: 'center',
                            }}
                          >
                            {badgeStyles.label}
                          </span>

                          {/* Node Step Detail Text — Crystal High Contrast */}
                          <span
                            style={{
                              flex: 1,
                              fontFamily: 'var(--w95-mono)',
                              fontSize: '12px',
                              color: 'var(--w95-text-color)',
                              fontWeight: node.opType === 'SCAN' || node.opType === 'SORT' ? 'bold' : 'normal',
                            }}
                          >
                            {node.detail}
                          </span>

                          {/* Node Identification Tags */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span
                              style={{
                                fontSize: '10px',
                                fontFamily: 'var(--w95-mono)',
                                padding: '1px 5px',
                                borderRadius: '3px',
                                background: isDark ? 'rgba(255,255,255,0.06)' : '#e0e0e0',
                                color: isDark ? '#94a3b8' : '#666666',
                              }}
                            >
                              ID #{node.id}
                            </span>

                            {node.parent > 0 && (
                              <span
                                style={{
                                  fontSize: '10px',
                                  fontFamily: 'var(--w95-mono)',
                                  padding: '1px 5px',
                                  borderRadius: '3px',
                                  background: isDark ? 'rgba(255,255,255,0.04)' : '#eaeaea',
                                  color: isDark ? '#64748b' : '#888888',
                                }}
                              >
                                ↳ parent: #{node.parent}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {activeTab === 'insights' && (
                /* Tab 2: Optimizer Insights & Bottlenecks Advisor */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '13px', borderBottom: '1px solid var(--w95-border-dark)', paddingBottom: '6px' }}>
                    🔍 Optimizer Health Diagnostics & Index Recommendations
                  </div>

                  {/* Diagnostic 1: Table Scans */}
                  {metrics.scansCount > 0 ? (
                    <div
                      style={{
                        padding: '10px 14px',
                        borderRadius: isDark ? '6px' : '2px',
                        background: isDark ? 'rgba(239, 68, 68, 0.15)' : '#fdf2f2',
                        border: `1px solid ${isDark ? 'rgba(239, 68, 68, 0.35)' : '#f8b4b4'}`,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold', color: isDark ? '#f87171' : '#c5221f', fontSize: '12px' }}>
                        <span>⚠️</span>
                        <span>Full Table Scan Detected ({metrics.scansCount} operations)</span>
                      </div>
                      <p style={{ fontSize: '11px', marginTop: '6px', lineHeight: 1.5, color: 'var(--w95-text-color)' }}>
                        The query optimizer is scanning all rows sequentially on table(s):{' '}
                        <strong>{metrics.scannedTables.join(', ')}</strong>.
                        While synthetic in-memory databases evaluate this in sub-milliseconds, production databases with millions of rows will experience high disk I/O.
                      </p>
                      <div
                        style={{
                          marginTop: '8px',
                          padding: '6px 10px',
                          background: isDark ? 'rgba(0,0,0,0.4)' : '#f3f4f6',
                          borderRadius: '4px',
                          fontFamily: 'var(--w95-mono)',
                          fontSize: '11px',
                          color: isDark ? '#38bdf8' : '#0369a1',
                        }}
                      >
                        💡 Recommended Index: <code>CREATE INDEX idx_{metrics.scannedTables[0] || 'tbl'}_lookup ON {metrics.scannedTables[0] || 'table'}(...);</code>
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{
                        padding: '10px 14px',
                        borderRadius: isDark ? '6px' : '2px',
                        background: isDark ? 'rgba(34, 197, 94, 0.15)' : '#f0fdf4',
                        border: `1px solid ${isDark ? 'rgba(34, 197, 94, 0.35)' : '#bbf7d0'}`,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold', color: isDark ? '#4ade80' : '#15803d', fontSize: '12px' }}>
                        <span>✅</span>
                        <span>Zero Sequential Table Scans</span>
                      </div>
                      <p style={{ fontSize: '11px', marginTop: '4px', color: 'var(--w95-text-color)' }}>
                        All relational lookups utilize direct key indexing or streaming subqueries.
                      </p>
                    </div>
                  )}

                  {/* Diagnostic 2: In-Memory Temp B-Tree Sorts */}
                  {metrics.sortsCount > 0 && (
                    <div
                      style={{
                        padding: '10px 14px',
                        borderRadius: isDark ? '6px' : '2px',
                        background: isDark ? 'rgba(234, 179, 8, 0.15)' : '#fefce8',
                        border: `1px solid ${isDark ? 'rgba(234, 179, 8, 0.35)' : '#fde047'}`,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold', color: isDark ? '#facc15' : '#854d0e', fontSize: '12px' }}>
                        <span>ℹ️</span>
                        <span>Temporary B-Tree Sort Buffer Used ({metrics.sortsCount} sorting phases)</span>
                      </div>
                      <p style={{ fontSize: '11px', marginTop: '6px', lineHeight: 1.5, color: 'var(--w95-text-color)' }}>
                        An in-memory temporary B-Tree buffer was allocated to perform <code>ORDER BY</code> or <code>GROUP BY</code> sorting.
                        To eliminate temp sort overhead in production, add an index covering the sorting expression in matching order.
                      </p>
                    </div>
                  )}

                  {/* Diagnostic 3: Co-Routine Pipeline */}
                  {metrics.coroutinesCount > 0 && (
                    <div
                      style={{
                        padding: '10px 14px',
                        borderRadius: isDark ? '6px' : '2px',
                        background: isDark ? 'rgba(56, 189, 248, 0.12)' : '#f0f9ff',
                        border: `1px solid ${isDark ? 'rgba(56, 189, 248, 0.3)' : '#bae6fd'}`,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold', color: isDark ? '#38bdf8' : '#0369a1', fontSize: '12px' }}>
                        <span>⚙️</span>
                        <span>Streaming Co-Routine Evaluation</span>
                      </div>
                      <p style={{ fontSize: '11px', marginTop: '4px', color: 'var(--w95-text-color)' }}>
                        Subqueries and CTE views are being executed via cooperative multi-tasking co-routines, pipelining rows without materializing full intermediate tables.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'raw' && (
                /* Tab 3: Raw SQLite Bytecode View */
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', opacity: 0.7 }}>
                      Raw SQLite EXPLAIN QUERY PLAN opcode output:
                    </span>
                    <button
                      className="win95-button"
                      onClick={handleCopyRaw}
                      style={{ fontSize: '11px', padding: '2px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <span>{copyFeedback ? '✓' : '📋'}</span>
                      <span>{copyFeedback ? 'Copied!' : 'Copy Plan'}</span>
                    </button>
                  </div>

                  <pre
                    style={{
                      flex: 1,
                      margin: 0,
                      padding: '10px',
                      background: isDark ? 'rgba(0, 0, 0, 0.45)' : '#f8f8f8',
                      color: isDark ? '#38bdf8' : '#000080',
                      fontFamily: 'var(--w95-mono)',
                      fontSize: '11px',
                      lineHeight: 1.6,
                      borderRadius: isDark ? '4px' : '0',
                      border: '1px solid var(--w95-border-dark, #808080)',
                      overflow: 'auto',
                    }}
                  >
                    {rawOutput}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* Dialog Action Buttons Footer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
            <span style={{ fontSize: '10px', opacity: 0.65 }}>
              Tip: Press <strong>F5</strong> to re-run your query after altering syntax to test optimizer effects.
            </span>
            <button
              className="win95-button"
              style={{ padding: '4px 20px', fontWeight: 'bold', fontSize: '11px' }}
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
