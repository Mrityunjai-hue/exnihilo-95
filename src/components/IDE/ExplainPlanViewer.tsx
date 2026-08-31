'use client';

import React, { useState, useEffect } from 'react';
import { SQLExecutor } from '../../engine/executor';
import { Dialect } from '../../engine/parser';

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
}

export const ExplainPlanViewer: React.FC<ExplainPlanViewerProps> = ({
  isOpen,
  onClose,
  queryText,
  dialect,
  executor,
}) => {
  const [planRows, setPlanRows] = useState<PlanNode[]>([]);
  const [rawOutput, setRawOutput] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsLoading(true);
    setErrorMsg(null);

    (async () => {
      try {
        await executor.init();
        const db = (executor as any).db;
        if (!db) {
          throw new Error('Database engine is not initialized.');
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
          const nodes: PlanNode[] = res[0].values.map((v: any[]) => ({
            id: Number(v[0]),
            parent: Number(v[1]),
            notused: Number(v[2]),
            detail: String(v[3] || v[2] || ''),
          }));
          if (isMounted) {
            setPlanRows(nodes);
            setRawOutput(
              nodes
                .map((n) => `[ID: ${n.id} -> Parent: ${n.parent}] ${n.detail}`)
                .join('\n')
            );
            setIsLoading(false);
          }
        } else {
          if (isMounted) {
            setPlanRows([]);
            setRawOutput('Query planned with direct evaluation.');
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

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.35)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999999,
      }}
      onClick={onClose}
    >
      <div
        className="win95-window"
        style={{
          width: '580px',
          maxWidth: '94vw',
          height: '460px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '4px 4px 10px rgba(0,0,0,0.5)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="win95-titlebar">
          <div className="win95-titlebar-text">
            <span>⚡</span>
            <span>Query Execution Plan & Optimizer Analysis</span>
          </div>
          <div className="win95-titlebar-controls">
            <button className="win95-btn-titlebar" onClick={onClose}>
              ✕
            </button>
          </div>
        </div>

        <div style={{ padding: '8px', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ fontSize: '11px', color: '#333', marginBottom: '6px' }}>
            WASM SQLite Engine Query Plan Optimizer for Dialect: <strong>{dialect}</strong>
          </div>

          {isLoading ? (
            <div style={{ padding: '40px', textAlign: 'center', fontSize: '12px' }}>
              ⏳ Analyzing query plan and index access paths...
            </div>
          ) : errorMsg ? (
            <div
              className="win95-sunken"
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: '#fff0f0',
                color: '#b00020',
                fontFamily: 'monospace',
                fontSize: '11px',
                overflow: 'auto',
              }}
            >
              ⚠️ {errorMsg}
            </div>
          ) : (
            <div className="win95-sunken" style={{ flex: 1, background: '#ffffff', overflow: 'auto', padding: '6px' }}>
              <div style={{ fontWeight: 'bold', fontSize: '11px', marginBottom: '6px', color: '#000080' }}>
                🌳 Tree Execution Steps:
              </div>

              {planRows.length === 0 ? (
                <div style={{ padding: '16px', color: '#888', fontSize: '11px' }}>
                  No complex scan or join steps recorded.
                </div>
              ) : (
                planRows.map((node) => {
                  const isScan = /SCAN/i.test(node.detail);
                  const isIndex = /INDEX|USING COVERING/i.test(node.detail);
                  const isSort = /TEMP B-TREE|ORDER BY/i.test(node.detail);

                  return (
                    <div
                      key={node.id}
                      style={{
                        padding: '5px 8px',
                        borderBottom: '1px solid #f0f0f0',
                        fontSize: '11px',
                        fontFamily: 'var(--w95-mono)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '10px',
                          background: isIndex ? '#e0f4e0' : isSort ? '#fff2cc' : isScan ? '#fbe4e4' : '#f0f0f0',
                          color: isIndex ? '#006600' : isSort ? '#806000' : isScan ? '#990000' : '#333',
                          padding: '1px 5px',
                          borderRadius: '2px',
                          fontWeight: 'bold',
                        }}
                      >
                        {isIndex ? 'INDEX' : isSort ? 'SORT' : isScan ? 'SCAN' : 'OP'}
                      </span>

                      <span style={{ color: '#222', flex: 1 }}>{node.detail}</span>

                      <span style={{ fontSize: '9px', color: '#888' }}>
                        ID #{node.id} {node.parent > 0 ? `(parent: #${node.parent})` : ''}
                      </span>
                    </div>
                  );
                })
              )}

              <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px solid #e0e0e0' }}>
                <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#666', marginBottom: '4px' }}>
                  Raw Plan Output:
                </div>
                <pre
                  style={{
                    background: '#f8f8f8',
                    padding: '6px',
                    margin: 0,
                    fontSize: '10px',
                    fontFamily: 'var(--w95-mono)',
                    maxHeight: '80px',
                    overflow: 'auto',
                  }}
                >
                  {rawOutput}
                </pre>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button className="win95-button" style={{ padding: '4px 18px', fontWeight: 'bold' }} onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
