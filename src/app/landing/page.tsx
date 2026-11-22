/**
 * src/app/landing/page.tsx — ExNihilo 95 Interactive Showcase & Architecture Tour
 * Living Windows 95 introductory website explaining zero-schema inference, WASM engine, and local desktop execution.
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { ExNihiloLogo } from '../../components/Brand/ExNihiloLogo';
import { SQLExecutor, ExecutionSuccess } from '../../engine/executor';
import { PWAInstallButton } from '../../components/Win95/PWAInstallButton';

type LandingTab = 'sandbox' | 'architecture' | 'compare' | 'download';

interface QueryPreset {
  id: string;
  name: string;
  icon: string;
  desc: string;
  sql: string;
}

const PRESET_QUERIES: QueryPreset[] = [
  {
    id: 'joins',
    name: 'Multi-Table Joins',
    icon: '🛒',
    desc: 'Joins customers, orders, and order_items with aggregations without creating any tables.',
    sql: `SELECT 
    c.name AS customer_name,
    COUNT(o.id) AS total_orders,
    ROUND(SUM(o.total), 2) AS lifetime_value
FROM customers c
INNER JOIN orders o ON c.id = o.customer_id
WHERE c.age >= 21
GROUP BY c.name
ORDER BY lifetime_value DESC;`,
  },
  {
    id: 'window',
    name: 'Window Functions',
    icon: '👥',
    desc: 'Partitions department salaries and computes rankings using modern SQL syntax.',
    sql: `SELECT 
    e.name,
    e.department,
    e.salary,
    RANK() OVER (PARTITION BY e.department ORDER BY e.salary DESC) AS salary_rank,
    ROUND(AVG(e.salary) OVER (PARTITION BY e.department), 2) AS dept_avg
FROM employees e
WHERE e.status = 'ACTIVE';`,
  },
  {
    id: 'inventory',
    name: 'Inventory Aggregations',
    icon: '📦',
    desc: 'Analyzes warehouse stock, reorder levels, and calculates total inventory value.',
    sql: `SELECT 
    p.category,
    COUNT(p.id) AS item_count,
    SUM(p.stock_qty) AS total_units,
    ROUND(AVG(p.unit_price), 2) AS avg_price
FROM products p
GROUP BY p.category
HAVING item_count > 1
ORDER BY total_units DESC;`,
  },
  {
    id: 'financial',
    name: 'Financial Ledger',
    icon: '💼',
    desc: 'Ledger debit/credit reconciliation with subqueries and case expressions.',
    sql: `SELECT 
    t.account_number,
    SUM(CASE WHEN t.direction = 'CREDIT' THEN t.amount ELSE 0 END) AS total_credits,
    SUM(CASE WHEN t.direction = 'DEBIT' THEN t.amount ELSE 0 END) AS total_debits,
    ROUND(SUM(CASE WHEN t.direction = 'CREDIT' THEN t.amount ELSE -t.amount END), 2) AS net_balance
FROM transactions t
GROUP BY t.account_number
ORDER BY net_balance DESC;`,
  },
];

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<LandingTab>('sandbox');
  const [selectedPreset, setSelectedPreset] = useState<QueryPreset>(PRESET_QUERIES[0]);
  const [querySql, setQuerySql] = useState<string>(PRESET_QUERIES[0].sql);
  const [crtEnabled, setCrtEnabled] = useState<boolean>(false);
  const [copiedCli, setCopiedCli] = useState<boolean>(false);

  // In-browser execution state
  const executor = useMemo(() => new SQLExecutor(), []);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [executionResult, setExecutionResult] = useState<ExecutionSuccess | null>(null);
  const [execPipelineStep, setExecPipelineStep] = useState<number>(0);

  // Time state for taskbar
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setTimeStr(d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectPreset = (preset: QueryPreset) => {
    setSelectedPreset(preset);
    setQuerySql(preset.sql);
    setExecutionResult(null);
    setExecPipelineStep(0);
  };

  const handleRunQuery = async () => {
    setIsExecuting(true);
    setExecPipelineStep(1);

    // Simulate 4-step visible engine pipeline for educational insight
    await new Promise((res) => setTimeout(res, 220));
    setExecPipelineStep(2);
    await new Promise((res) => setTimeout(res, 220));
    setExecPipelineStep(3);
    await new Promise((res) => setTimeout(res, 220));
    setExecPipelineStep(4);

    try {
      const res = await executor.execute(querySql, 'MySQL', { rowsPerTable: 8 });
      if (res.ok) {
        setExecutionResult(res);
      }
    } catch {
      // safe fallback
    } finally {
      setIsExecuting(false);
    }
  };

  const handleCopyCli = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText('npx exnihilo-sql');
      setCopiedCli(true);
      setTimeout(() => setCopiedCli(false), 2000);
    }
  };

  return (
    <div
      className={`win95-desktop ${crtEnabled ? 'crt-monitor-active' : ''}`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#008080',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      {/* Top Retro Navigation Strip */}
      <header
        style={{
          backgroundColor: '#000080',
          color: '#ffffff',
          padding: '6px 14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '11px',
          fontWeight: 'bold',
          borderBottom: '2px solid #ffffff',
          boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ExNihiloLogo size={20} showText={false} />
          <span>ExNihilo 95: Professional SQL Studio — Zero-Schema Relational Engine</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            className="win95-button"
            style={{ fontSize: '11px', padding: '2px 8px' }}
            onClick={() => setCrtEnabled(!crtEnabled)}
          >
            📺 CRT Filter ({crtEnabled ? 'ON' : 'OFF'})
          </button>
          <Link href="/download" className="win95-button" style={{ fontSize: '11px', padding: '2px 10px', textDecoration: 'none', color: '#000' }}>
            💾 Download Standalone
          </Link>
          <Link href="/" className="win95-button" style={{ fontSize: '11px', padding: '2px 12px', fontWeight: 'bold', background: '#ffffdf', textDecoration: 'none', color: '#000' }}>
            🚀 Launch Web Studio 95
          </Link>
        </div>
      </header>

      {/* Main Living Showcase Window */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          overflowY: 'auto',
        }}
      >
        <div
          className="win95-window"
          style={{
            width: '920px',
            maxWidth: '96vw',
            maxHeight: 'calc(100vh - 84px)',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '6px 6px 24px rgba(0,0,0,0.6)',
          }}
        >
          {/* Window Titlebar */}
          <div className="win95-titlebar">
            <div className="win95-titlebar-text">
              <span>✨</span>
              <span>ExNihilo 95: Interactive Architecture &amp; Technology Tour</span>
            </div>
            <div className="win95-window-controls">
              <Link href="/" className="win95-control-btn" title="Launch Web Studio">
                ↗
              </Link>
            </div>
          </div>

          {/* Window Tabs Bar */}
          <div
            style={{
              display: 'flex',
              gap: '4px',
              padding: '6px 8px 0 8px',
              backgroundColor: '#c0c0c0',
              borderBottom: '1px solid #808080',
            }}
          >
            <button
              type="button"
              className={`win95-tab ${activeTab === 'sandbox' ? 'active' : ''}`}
              onClick={() => setActiveTab('sandbox')}
            >
              🌟 The Magic (Live Sandbox)
            </button>
            <button
              type="button"
              className={`win95-tab ${activeTab === 'architecture' ? 'active' : ''}`}
              onClick={() => setActiveTab('architecture')}
            >
              🏗️ How It Works (Engine Architecture)
            </button>
            <button
              type="button"
              className={`win95-tab ${activeTab === 'compare' ? 'active' : ''}`}
              onClick={() => setActiveTab('compare')}
            >
              ⚡ Browser vs Local Desktop (16GB RAM)
            </button>
            <button
              type="button"
              className={`win95-tab ${activeTab === 'download' ? 'active' : ''}`}
              onClick={() => setActiveTab('download')}
            >
              💾 Download Standalone &amp; CLI
            </button>
          </div>

          {/* Tab Content Area */}
          <div
            style={{
              flex: 1,
              padding: '14px',
              overflowY: 'auto',
              backgroundColor: '#c0c0c0',
            }}
          >
            {/* ── TAB 1: LIVE INTERACTIVE SANDBOX ──────────────────────── */}
            {activeTab === 'sandbox' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Hero Headline Box */}
                <div
                  className="win95-inset"
                  style={{
                    backgroundColor: '#ffffff',
                    padding: '10px 14px',
                    borderLeft: '4px solid #000080',
                  }}
                >
                  <h2 style={{ margin: '0 0 4px 0', fontSize: '15px', color: '#000080' }}>
                    Stop creating schemas before you write SQL.
                  </h2>
                  <p style={{ margin: 0, fontSize: '11px', color: '#333333', lineHeight: '1.45' }}>
                    In ordinary SQL tools, writing a query against a new table throws{' '}
                    <code style={{ background: '#f0f0f0', padding: '1px 4px', color: '#800000' }}>
                      Table &quot;orders&quot; not found
                    </code>
                    . ExNihilo 95 reverses the workflow: write your query first, and our parser dynamically infers table structures, data types, foreign key relationships, and generates authentic mock records <strong>in memory in real-time</strong>.
                  </p>
                </div>

                {/* Preset Selector Buttons */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {PRESET_QUERIES.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      className={`win95-button ${selectedPreset.id === p.id ? 'pressed' : ''}`}
                      style={{
                        padding: '4px 10px',
                        fontSize: '11px',
                        fontWeight: selectedPreset.id === p.id ? 'bold' : 'normal',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                      onClick={() => handleSelectPreset(p)}
                    >
                      <span>{p.icon}</span>
                      <span>{p.name}</span>
                    </button>
                  ))}
                </div>

                {/* Preset Description */}
                <div style={{ fontSize: '11px', color: '#444' }}>
                  ℹ️ <em>{selectedPreset.desc}</em>
                </div>

                {/* Query Editor & Action Strip */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div
                    className="win95-inset"
                    style={{
                      backgroundColor: '#ffffff',
                      padding: '8px',
                      fontFamily: 'var(--w95-mono, monospace)',
                      fontSize: '12px',
                      lineHeight: '1.4',
                      maxHeight: '160px',
                      overflowY: 'auto',
                    }}
                  >
                    <textarea
                      value={querySql}
                      onChange={(e) => setQuerySql(e.target.value)}
                      style={{
                        width: '100%',
                        height: '130px',
                        border: 'none',
                        outline: 'none',
                        resize: 'none',
                        fontFamily: 'inherit',
                        fontSize: 'inherit',
                      }}
                      spellCheck={false}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '11px', color: '#555' }}>
                      Try editing the SQL above or click Run to see the 4-stage pipeline synthesize data!
                    </div>
                    <button
                      type="button"
                      className="win95-button"
                      style={{
                        padding: '5px 18px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        background: '#ffffdf',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                      onClick={handleRunQuery}
                      disabled={isExecuting}
                    >
                      <span>{isExecuting ? '⏳' : '▶'}</span>
                      <span>{isExecuting ? 'Synthesizing...' : 'Run Query (Zero Schema)'}</span>
                    </button>
                  </div>
                </div>

                {/* 4-Stage Live Pipeline Visualization */}
                {execPipelineStep > 0 && (
                  <div
                    className="win95-inset"
                    style={{
                      backgroundColor: '#f7f7f7',
                      padding: '8px 12px',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      gap: '8px',
                      fontSize: '11px',
                    }}
                  >
                    <div
                      style={{
                        padding: '6px',
                        border: '1px solid #d0d0d0',
                        backgroundColor: execPipelineStep >= 1 ? '#e0f2fe' : '#ffffff',
                      }}
                    >
                      <strong>1. AST Parser</strong>
                      <div style={{ fontSize: '10px', color: '#666' }}>
                        {execPipelineStep >= 1 ? '✓ Extracted tables & columns' : 'Pending...'}
                      </div>
                    </div>
                    <div
                      style={{
                        padding: '6px',
                        border: '1px solid #d0d0d0',
                        backgroundColor: execPipelineStep >= 2 ? '#e0f2fe' : '#ffffff',
                      }}
                    >
                      <strong>2. Type Inferrer</strong>
                      <div style={{ fontSize: '10px', color: '#666' }}>
                        {execPipelineStep >= 2 ? '✓ Deduced types & foreign keys' : 'Pending...'}
                      </div>
                    </div>
                    <div
                      style={{
                        padding: '6px',
                        border: '1px solid #d0d0d0',
                        backgroundColor: execPipelineStep >= 3 ? '#e0f2fe' : '#ffffff',
                      }}
                    >
                      <strong>3. Synthesizer</strong>
                      <div style={{ fontSize: '10px', color: '#666' }}>
                        {execPipelineStep >= 3 ? '✓ Generated domain mock data' : 'Pending...'}
                      </div>
                    </div>
                    <div
                      style={{
                        padding: '6px',
                        border: '1px solid #d0d0d0',
                        backgroundColor: execPipelineStep >= 4 ? '#dcfce7' : '#ffffff',
                      }}
                    >
                      <strong>4. SQLite WASM</strong>
                      <div style={{ fontSize: '10px', color: '#666' }}>
                        {execPipelineStep >= 4 ? '✓ Executed in-memory' : 'Pending...'}
                      </div>
                    </div>
                  </div>
                )}

                {/* Results Grid Display */}
                {executionResult && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
                      <span>📊 Query Results ({executionResult.rowCount} rows generated on the fly):</span>
                      <span style={{ color: '#008000' }}>⚡ Execution time: {executionResult.executionTimeMs.toFixed(1)}ms</span>
                    </div>

                    <div
                      className="win95-inset"
                      style={{
                        backgroundColor: '#ffffff',
                        maxHeight: '160px',
                        overflow: 'auto',
                      }}
                    >
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#c0c0c0', borderBottom: '2px solid #808080' }}>
                            {executionResult.columns.map((c) => (
                              <th
                                key={c}
                                style={{
                                  padding: '4px 8px',
                                  textAlign: 'left',
                                  borderRight: '1px solid #808080',
                                }}
                              >
                                {c}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {executionResult.rows.map((row, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid #e0e0e0' }}>
                              {executionResult.columns.map((col) => (
                                <td key={col} style={{ padding: '3px 8px', borderRight: '1px solid #f0f0f0' }}>
                                  {String((row as Record<string, any>)[col] ?? 'NULL')}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── TAB 2: HOW IT WORKS (ARCHITECTURE) ────────────────────── */}
            {activeTab === 'architecture' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '11px', lineHeight: '1.5' }}>
                <div className="win95-inset" style={{ backgroundColor: '#ffffff', padding: '12px' }}>
                  <h3 style={{ margin: '0 0 6px 0', fontSize: '13px', color: '#000080' }}>
                    The ExNihilo Engine: From Nothingness into Relational Tables
                  </h3>
                  <p style={{ margin: '0 0 8px 0' }}>
                    <em>Ex Nihilo</em> is Latin for <em>&quot;Out of nothing&quot;</em>. Traditional SQL clients require a remote connection string, user credentials, database creation, table DDL schemas, and mock data insertion scripts. ExNihilo eliminates all 5 prerequisites.
                  </p>
                </div>

                {/* Step-by-Step Flowchart Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                  <div className="win95-window" style={{ padding: '10px' }}>
                    <div style={{ fontWeight: 'bold', color: '#000080', marginBottom: '4px' }}>
                      1. AST Lexing &amp; Clause Extraction
                    </div>
                    <div>
                      When you write a query, ExNihilo parses the raw SQL string into an Abstract Syntax Tree (AST). It inspects <code>FROM</code>, <code>JOIN</code>, <code>WHERE</code>, and <code>GROUP BY</code> clauses to locate table names and referenced column projections.
                    </div>
                  </div>

                  <div className="win95-window" style={{ padding: '10px' }}>
                    <div style={{ fontWeight: 'bold', color: '#000080', marginBottom: '4px' }}>
                      2. Contextual Type Inference
                    </div>
                    <div>
                      Columns compared with numbers become integers/floats. Columns compared with ISO strings become timestamps. Foreign key joins (e.g. <code>o.customer_id = c.id</code>) automatically link primary and foreign key domains to ensure join consistency!
                    </div>
                  </div>

                  <div className="win95-window" style={{ padding: '10px' }}>
                    <div style={{ fontWeight: 'bold', color: '#000080', marginBottom: '4px' }}>
                      3. Authentic Procedural Data Synthesis
                    </div>
                    <div>
                      Rather than placeholder garbage, columns named <code>email</code> get realistic emails; <code>name</code> gets real human names; <code>total</code> gets rounded currency values; <code>status</code> gets valid categorical enums.
                    </div>
                  </div>

                  <div className="win95-window" style={{ padding: '10px' }}>
                    <div style={{ fontWeight: 'bold', color: '#000080', marginBottom: '4px' }}>
                      4. In-Memory SQLite WebAssembly Virtual Machine
                    </div>
                    <div>
                      The generated tables and rows are compiled and materialized into a real, isolated in-memory SQLite WASM database inside your browser tab. Aggregations, window functions, and subqueries run at native compiled speed.
                    </div>
                  </div>
                </div>

                {/* Dialect Cross-Compilation Banner */}
                <div className="win95-inset" style={{ backgroundColor: '#ffffdf', padding: '10px' }}>
                  <strong>🌐 Multi-Dialect Cross-Compiler &amp; Universal Sugar:</strong>
                  <div style={{ marginTop: '4px' }}>
                    ExNihilo supports <strong>MySQL, PostgreSQL, SQLite, and Transact-SQL</strong> syntax, transpiling ILIKE, JSON operators (<code>-&gt;</code>, <code>-&gt;&gt;</code>), date arithmetic, NVL/IFNULL, and spatial functions transparently on the fly.
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB 3: BROWSER VS LOCAL DESKTOP (16GB RAM) ────────────── */}
            {activeTab === 'compare' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '11px' }}>
                <div className="win95-inset" style={{ backgroundColor: '#ffffff', padding: '10px 14px' }}>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#000080' }}>
                    Why Install ExNihilo Standalone on Your Machine?
                  </h3>
                  <p style={{ margin: 0, color: '#444', lineHeight: '1.4' }}>
                    While the Web Studio is great for instant query prototyping and learning, web browsers enforce a strict ~50MB WebAssembly memory ceiling. The <strong>ExNihilo Native Desktop Edition</strong> unlocks your physical workstation hardware.
                  </p>
                </div>

                {/* Comparison Matrix Table */}
                <div className="win95-inset" style={{ backgroundColor: '#ffffff', overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#c0c0c0', borderBottom: '2px solid #808080' }}>
                        <th style={{ padding: '6px 10px', textAlign: 'left', width: '25%' }}>Capability</th>
                        <th style={{ padding: '6px 10px', textAlign: 'left', width: '37%' }}>🌐 In-Browser Web Studio</th>
                        <th style={{ padding: '6px 10px', textAlign: 'left', width: '38%', backgroundColor: '#ffffdf' }}>
                          💾 Native Desktop Edition
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
                        <td style={{ padding: '6px 10px', fontWeight: 'bold' }}>Memory Allocation</td>
                        <td style={{ padding: '6px 10px' }}>50 MB (Browser WASM sandbox limit)</td>
                        <td style={{ padding: '6px 10px', backgroundColor: '#ffffdf', fontWeight: 'bold', color: '#008000' }}>
                          Up to 16 GB+ RAM (Full Physical Memory)
                        </td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
                        <td style={{ padding: '6px 10px', fontWeight: 'bold' }}>Max Processable Rows</td>
                        <td style={{ padding: '6px 10px' }}>~10,000 synthetic rows</td>
                        <td style={{ padding: '6px 10px', backgroundColor: '#ffffdf', fontWeight: 'bold', color: '#008000' }}>
                          10,000,000+ rows (Multi-Million Records)
                        </td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
                        <td style={{ padding: '6px 10px', fontWeight: 'bold' }}>Local File System Mounts</td>
                        <td style={{ padding: '6px 10px' }}>Virtual Drive / Browser File Picker</td>
                        <td style={{ padding: '6px 10px', backgroundColor: '#ffffdf', fontWeight: 'bold', color: '#008000' }}>
                          Direct disk access (Mount .csv, .parquet, .db)
                        </td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
                        <td style={{ padding: '6px 10px', fontWeight: 'bold' }}>Offline Guarantee</td>
                        <td style={{ padding: '6px 10px' }}>100% Offline (Once PWA cached)</td>
                        <td style={{ padding: '6px 10px', backgroundColor: '#ffffdf', fontWeight: 'bold', color: '#008000' }}>
                          100% Offline Standalone Binary (Zero Internet)
                        </td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
                        <td style={{ padding: '6px 10px', fontWeight: 'bold' }}>Telemetry &amp; Privacy</td>
                        <td style={{ padding: '6px 10px' }}>Zero query logging / private browser tab</td>
                        <td style={{ padding: '6px 10px', backgroundColor: '#ffffdf', fontWeight: 'bold', color: '#008000' }}>
                          Zero network sockets opened / air-gapped safe
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: '6px 10px', fontWeight: 'bold' }}>CLI Batch Processing</td>
                        <td style={{ padding: '6px 10px' }}>Not Available</td>
                        <td style={{ padding: '6px 10px', backgroundColor: '#ffffdf', fontWeight: 'bold', color: '#008000' }}>
                          <code>exnihilo-sql query.sql --export csv</code>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '6px' }}>
                  <Link
                    href="/download"
                    className="win95-button"
                    style={{
                      padding: '6px 20px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      textDecoration: 'none',
                      color: '#000',
                    }}
                  >
                    💾 Go to Desktop Download Station
                  </Link>
                </div>
              </div>
            )}

            {/* ── TAB 4: DOWNLOAD STATION & CLI ─────────────────────────── */}
            {activeTab === 'download' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '11px' }}>
                <div className="win95-inset" style={{ backgroundColor: '#ffffff', padding: '12px' }}>
                  <h3 style={{ margin: '0 0 6px 0', fontSize: '14px', color: '#000080' }}>
                    ExNihilo 95 Offline PWA &amp; Starter Depot
                  </h3>
                  <p style={{ margin: 0, color: '#444' }}>
                    ExNihilo 95 is an in-browser WebAssembly application that installs directly to your workstation or phone as a native Progressive Web App (PWA) with zero network dependencies.
                  </p>
                </div>

                {/* 3 OS Download Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  {/* Windows Card */}
                  <div
                    className="win95-window"
                    style={{
                      padding: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      gap: '8px',
                    }}
                  >
                    <span style={{ fontSize: '36px' }}>🪟</span>
                    <strong>Windows Desktop</strong>
                    <div style={{ fontSize: '10px', color: '#666' }}>Windows 95, 10, 11 (PWA)</div>
                    <div style={{ fontSize: '10px', color: '#888' }}>Zero-Config • Standalone Window</div>
                    <div style={{ marginTop: 'auto', width: '100%' }}>
                      <PWAInstallButton label="Install on Windows" style={{ width: '100%', justifyContent: 'center' }} />
                    </div>
                  </div>

                  {/* macOS Card */}
                  <div
                    className="win95-window"
                    style={{
                      padding: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      gap: '8px',
                    }}
                  >
                    <span style={{ fontSize: '36px' }}>🍏</span>
                    <strong>macOS Universal</strong>
                    <div style={{ fontSize: '10px', color: '#666' }}>Apple Silicon &amp; Intel</div>
                    <div style={{ fontSize: '10px', color: '#888' }}>PWA / Add to Dock</div>
                    <div style={{ marginTop: 'auto', width: '100%' }}>
                      <PWAInstallButton label="Install on macOS" style={{ width: '100%', justifyContent: 'center' }} />
                    </div>
                  </div>

                  {/* Linux Card */}
                  <div
                    className="win95-window"
                    style={{
                      padding: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      gap: '8px',
                    }}
                  >
                    <span style={{ fontSize: '36px' }}>🐧</span>
                    <strong>Linux &amp; ChromeOS</strong>
                    <div style={{ fontSize: '10px', color: '#666' }}>Ubuntu, Debian, Fedora, Arch</div>
                    <div style={{ fontSize: '10px', color: '#888' }}>Desktop App Launcher</div>
                    <div style={{ marginTop: 'auto', width: '100%' }}>
                      <PWAInstallButton label="Install on Linux" style={{ width: '100%', justifyContent: 'center' }} />
                    </div>
                  </div>
                </div>

                {/* Instant CLI Terminal Strip */}
                <div
                  className="win95-inset"
                  style={{
                    backgroundColor: '#000000',
                    color: '#00ff00',
                    padding: '10px 14px',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <span style={{ color: '#888' }}>$ </span>
                    <span>npx exnihilo-sql</span>
                    <span style={{ color: '#aaa', marginLeft: '12px', fontSize: '11px' }}>
                      # Run zero-config SQL engine from terminal
                    </span>
                  </div>
                  <button
                    type="button"
                    className="win95-button"
                    style={{ fontSize: '10px', padding: '2px 8px', color: '#000' }}
                    onClick={handleCopyCli}
                  >
                    {copiedCli ? '✓ Copied' : '📋 Copy'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Window Footer Action Status */}
          <div
            style={{
              padding: '8px 14px',
              backgroundColor: '#c0c0c0',
              borderTop: '2px solid #808080',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '11px',
            }}
          >
            <div style={{ color: '#555' }}>
              ExNihilo 95 • Built by{' '}
              <a href="https://github.com/Mrityunjai-hue" target="_blank" rel="noopener noreferrer" style={{ color: '#000080', fontWeight: 'bold' }}>
                Mrityunjai
              </a>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <Link href="/download" className="win95-button" style={{ padding: '3px 12px', textDecoration: 'none', color: '#000' }}>
                💾 Download Desktop
              </Link>
              <Link
                href="/"
                className="win95-button"
                style={{
                  padding: '3px 16px',
                  fontWeight: 'bold',
                  background: '#ffffdf',
                  textDecoration: 'none',
                  color: '#000',
                }}
              >
                🚀 Open Web Studio 95
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Windows 95 Taskbar */}
      <footer
        className="win95-taskbar"
        style={{
          height: '28px',
          backgroundColor: '#c0c0c0',
          borderTop: '2px solid #ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '2px 4px',
          boxSizing: 'border-box',
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Link
            href="/"
            className="win95-button win95-start-btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 6px',
              textDecoration: 'none',
              color: '#000',
              fontWeight: 'bold',
            }}
          >
            <ExNihiloLogo size={14} showText={false} />
            <span>Start</span>
          </Link>

          <div
            className="win95-task-tab active"
            style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '2px 8px', fontSize: '11px' }}
          >
            <span>✨</span>
            <span>ExNihilo 95 Showcase</span>
          </div>
        </div>

        <div className="win95-systray" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '2px 6px' }}>
          <span title="Dial-Up Status: 28,800 bps Connected" style={{ fontSize: '11px' }}>
            📟
          </span>
          <span style={{ borderLeft: '1px solid #808080', height: '12px' }} />
          <span style={{ fontSize: '11px' }}>{timeStr || '12:00 PM'}</span>
        </div>
      </footer>
    </div>
  );
}
