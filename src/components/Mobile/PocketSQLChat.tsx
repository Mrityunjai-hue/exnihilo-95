/**
 * PocketSQLChat.tsx — Retro Win95 Instant Messenger / Chat-Style SQL Studio (< 900px)
 *
 * Implements a modern SaaS conversational SQL stream with authentic Windows 95 aesthetics:
 * - User queries in distinct right-aligned chat bubbles.
 * - Kernel / System results in left-aligned response cards with bounded, scrollable data grids.
 * - Pure symbol-driven action controls (➤ Send/Run, ⚡ Run Selection, ✨ AI Copilot, 🗄️ Catalog).
 * - Full scrollable execution history preserving context within mobile screen boundaries (100dvh).
 */

'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import type { Dialect } from '../../engine/parser';
import type { ExecutionSuccess } from '../../engine/executor';
import type { SessionCatalog } from '../../engine/catalog';
import { SnapshotsDialog } from '../IDE/SnapshotsDialog';
import { MobileCatalogDrawer } from './MobileCatalogDrawer';
import { sqlWorkerClient } from '../../engine/worker/SQLWorkerClient';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'kernel' | 'copilot' | 'error';
  timestamp: string;
  text?: string;
  sql?: string;
  result?: ExecutionSuccess;
  error?: string;
  executionTimeMs?: number;
}

interface PocketSQLChatProps {
  dialect: Dialect;
  onDialectChange: (dialect: Dialect) => void;
  queryText: string;
  onQueryChange: (query: string) => void;
  onRun: (customQuery?: string) => Promise<any> | void;
  onCancelQuery?: () => void;
  isLoading: boolean;
  result: ExecutionSuccess | null;
  catalog: SessionCatalog | any;
  onSwitchToDesktop: () => void;
}

export const PocketSQLChat: React.FC<PocketSQLChatProps> = ({
  dialect,
  onDialectChange,
  queryText,
  onQueryChange,
  onRun,
  onCancelQuery,
  isLoading,
  result,
  catalog,
  onSwitchToDesktop,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome-1',
      sender: 'kernel',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: 'ExNihilo 95 Pocket SQL Kernel initialized. Type any query or tap 🗄️ to browse tables. Missing tables will be synthesized automatically!',
    },
  ]);

  const [inputVal, setInputVal] = useState(queryText || 'SELECT heart_rate, beating_frequency, blood_o2_level, blood_pressure FROM hearts;');
  const [selectedText, setSelectedText] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSnapshotsOpen, setIsSnapshotsOpen] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [catalogVersion, setCatalogVersion] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync catalog updates from worker
  useEffect(() => {
    return sqlWorkerClient.onCatalogChange(() => {
      setCatalogVersion((v) => v + 1);
    });
  }, []);

  const catalogTables = useMemo(() => {
    return catalog?.getAll ? catalog.getAll() : [];
  }, [catalog, catalogVersion]);

  // Append new execution results to chat
  const lastResultRef = useRef<ExecutionSuccess | null>(null);
  useEffect(() => {
    if (result && result !== lastResultRef.current) {
      lastResultRef.current = result;
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages((prev) => [
        ...prev,
        {
          id: `res-${Date.now()}`,
          sender: 'kernel',
          timestamp: timeStr,
          result,
          executionTimeMs: result.executionTimeMs,
        },
      ]);
    }
  }, [result]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, isAiLoading]);

  // Track text selection in input for "Run Selected" (⚡)
  const handleSelectText = () => {
    if (textareaRef.current) {
      const { selectionStart, selectionEnd, value } = textareaRef.current;
      if (selectionStart !== selectionEnd) {
        setSelectedText(value.substring(selectionStart, selectionEnd).trim());
      } else {
        setSelectedText('');
      }
    }
  };

  const handleSend = async (forcedQuery?: string) => {
    const raw = (forcedQuery || inputVal).trim();
    if (!raw) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Handle @ai or /ai natural language prompt
    if (raw.startsWith('@ai') || raw.startsWith('/ai')) {
      const aiPrompt = raw.replace(/^[@/]ai\s*/i, '').trim();
      setMessages((prev) => [
        ...prev,
        {
          id: `user-${Date.now()}`,
          sender: 'user',
          timestamp: timeStr,
          text: `✨ ${aiPrompt}`,
        },
      ]);
      setInputVal('');
      setSelectedText('');
      await handleAskCopilot(aiPrompt);
      return;
    }

    // Standard SQL Execution
    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        sender: 'user',
        timestamp: timeStr,
        sql: raw,
      },
    ]);

    onQueryChange(raw);
    onRun(raw);
    setSelectedText('');
  };

  const handleRunSelection = () => {
    if (!selectedText) return;
    handleSend(selectedText);
  };

  const handleAskCopilot = async (promptText: string) => {
    setIsAiLoading(true);
    try {
      const schemaCtx = catalogTables
        .map((t: any) => {
          const cols = t.schema?.columns || t.columns || [];
          return `${t.tableName} (${cols.map((c: any) => c.name).join(', ')})`;
        })
        .join('\n');

      const savedKey = typeof window !== 'undefined' ? localStorage.getItem('exnihilo_gemini_api_key') || '' : '';

      const res = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          dialect,
          schema: schemaCtx,
          userApiKey: savedKey || undefined,
        }),
      });

      const data = await res.json();
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      if (data.ok && data.sql) {
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            sender: 'copilot',
            timestamp: timeStr,
            sql: data.sql,
            text: 'I generated this query for you:',
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-err-${Date.now()}`,
            sender: 'error',
            timestamp: timeStr,
            error: data.message || data.error || 'Failed to generate query.',
          },
        ]);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'error',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          error: err?.message || 'Network error reaching AI Copilot.',
        },
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
  };

  const handleRefreshCatalog = async () => {
    try {
      await sqlWorkerClient.getCatalog();
      setCatalogVersion((v) => v + 1);
    } catch {
      // ignore
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        height: '100dvh',
        maxHeight: '100dvh',
        width: '100vw',
        backgroundColor: '#008080',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        overflow: 'hidden',
        fontFamily: "'Segoe UI', Tahoma, sans-serif",
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {/* ── Top Header Bar ─────────────────────────────────────────── */}
      <div
        className="win95-titlebar"
        style={{
          padding: '4px 8px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        <div className="win95-titlebar-text" style={{ fontSize: '12px', fontWeight: 'bold' }}>
          <span>📱</span>
          <span>ExNihilo Pocket SQL</span>
        </div>

        <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
          <select
            className="win95-sunken"
            value={dialect}
            onChange={(e) => onDialectChange(e.target.value as Dialect)}
            style={{ fontSize: '10px', padding: '1px 3px', fontWeight: 'bold' }}
            title="Active SQL Dialect"
          >
            <option value="SQLite">SQLite</option>
            <option value="MySQL">MySQL</option>
            <option value="PostgreSQL">PostgreSQL</option>
            <option value="SSMS">SSMS</option>
          </select>

          <button
            type="button"
            className="win95-button"
            onClick={() => setIsDrawerOpen(true)}
            style={{ fontSize: '11px', padding: '2px 6px' }}
            title={`Database Catalog (${catalogTables.length} tables)`}
          >
            🗄️ {catalogTables.length > 0 && <span style={{ fontSize: '9px', fontWeight: 'bold' }}>{catalogTables.length}</span>}
          </button>

          <button
            type="button"
            className="win95-button"
            onClick={() => setIsSnapshotsOpen(true)}
            style={{ fontSize: '11px', padding: '2px 5px' }}
            title="Snapshots Time-Travel"
          >
            💾
          </button>

          <button
            type="button"
            className="win95-button"
            onClick={() => setMessages([])}
            style={{ fontSize: '11px', padding: '2px 5px' }}
            title="Clear Chat History"
          >
            🗑️
          </button>

          <button
            type="button"
            className="win95-button"
            onClick={onSwitchToDesktop}
            style={{ fontSize: '11px', padding: '2px 5px' }}
            title="Switch to Desktop Mode"
          >
            🖥️
          </button>
        </div>
      </div>

      {/* ── Scrollable Chat Stream (Message History) ───────────────── */}
      <div
        className="win95-inset"
        style={{
          flex: 1,
          margin: '2px',
          backgroundColor: '#ffffff',
          overflowY: 'auto',
          padding: '10px 8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        {messages.map((msg) => {
          if (msg.sender === 'user') {
            // USER MESSAGE BUBBLE (STRICTLY ON THE RIGHT SIDE)
            return (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  width: '100%',
                }}
              >
                <div
                  style={{
                    maxWidth: '85%',
                    backgroundColor: '#000080',
                    color: '#ffffff',
                    borderRadius: '6px 6px 0 6px',
                    padding: '8px 10px',
                    boxShadow: '1px 2px 4px rgba(0,0,0,0.25)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', opacity: 0.8, fontSize: '9px' }}>
                    <span style={{ fontWeight: 'bold' }}>You</span>
                    <span>{msg.timestamp}</span>
                  </div>

                  {msg.text && (
                    <div style={{ fontSize: '12px', wordBreak: 'break-word', lineHeight: 1.3 }}>
                      {msg.text}
                    </div>
                  )}

                  {msg.sql && (
                    <pre
                      style={{
                        margin: 0,
                        padding: '6px 8px',
                        backgroundColor: '#001040',
                        color: '#a6e22e',
                        fontSize: '11px',
                        fontFamily: 'Consolas, monospace',
                        borderRadius: '3px',
                        overflowX: 'auto',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      }}
                    >
                      {msg.sql}
                    </pre>
                  )}

                  {/* Icon Actions */}
                  {msg.sql && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '2px' }}>
                      <button
                        type="button"
                        style={{
                          background: 'rgba(255,255,255,0.15)',
                          border: 'none',
                          color: '#fff',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          padding: '2px 5px',
                          fontSize: '10px',
                        }}
                        onClick={() => copyToClipboard(msg.sql!)}
                        title="Copy SQL"
                      >
                        📋
                      </button>
                      <button
                        type="button"
                        style={{
                          background: 'rgba(255,255,255,0.15)',
                          border: 'none',
                          color: '#fff',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          padding: '2px 5px',
                          fontSize: '10px',
                        }}
                        onClick={() => {
                          setInputVal(msg.sql!);
                          textareaRef.current?.focus();
                        }}
                        title="Edit in Input Bar"
                      >
                        ✎
                      </button>
                      <button
                        type="button"
                        style={{
                          background: 'rgba(255,255,255,0.25)',
                          border: 'none',
                          color: '#fff',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          padding: '2px 6px',
                          fontSize: '10px',
                        }}
                        onClick={() => handleSend(msg.sql)}
                        title="Re-run Query"
                      >
                        ↺
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          }

          if (msg.sender === 'copilot') {
            // AI COPILOT SUGGESTION CARD (LEFT ALIGNED)
            return (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  justifyContent: 'flex-start',
                  width: '100%',
                }}
              >
                <div
                  className="win95-window"
                  style={{
                    maxWidth: '92%',
                    backgroundColor: '#f3e8ff',
                    border: '2px outset #ffffff',
                    padding: '8px 10px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px' }}>
                    <span style={{ fontWeight: 'bold', color: '#6b21a8' }}>✨ Gemini Copilot</span>
                    <span style={{ color: '#666', fontSize: '9px' }}>{msg.timestamp}</span>
                  </div>

                  {msg.text && <div style={{ fontSize: '11px', color: '#333' }}>{msg.text}</div>}

                  {msg.sql && (
                    <pre
                      style={{
                        margin: 0,
                        padding: '6px 8px',
                        backgroundColor: '#ffffff',
                        border: '1px solid #c084fc',
                        color: '#000000',
                        fontSize: '11px',
                        fontFamily: 'Consolas, monospace',
                        overflowX: 'auto',
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {msg.sql}
                    </pre>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                    <button
                      type="button"
                      className="win95-button"
                      style={{ fontSize: '10px', padding: '2px 6px' }}
                      onClick={() => {
                        setInputVal(msg.sql!);
                        textareaRef.current?.focus();
                      }}
                      title="Edit in Input Bar"
                    >
                      ✎
                    </button>
                    <button
                      type="button"
                      className="win95-button"
                      style={{ fontSize: '11px', padding: '2px 8px', fontWeight: 'bold', color: '#15803d' }}
                      onClick={() => handleSend(msg.sql)}
                      title="Execute SQL"
                    >
                      ➤
                    </button>
                  </div>
                </div>
              </div>
            );
          }

          if (msg.sender === 'error') {
            // ERROR MESSAGE BUBBLE (LEFT ALIGNED)
            return (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  justifyContent: 'flex-start',
                  width: '100%',
                }}
              >
                <div
                  className="win95-window"
                  style={{
                    maxWidth: '90%',
                    backgroundColor: '#fee2e2',
                    border: '2px outset #ffffff',
                    padding: '8px 10px',
                  }}
                >
                  <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#b91c1c', marginBottom: '2px' }}>
                    ⚠️ Execution / AI Error ({msg.timestamp})
                  </div>
                  <div style={{ fontSize: '11px', color: '#7f1d1d' }}>{msg.error}</div>
                </div>
              </div>
            );
          }

          // KERNEL RESULT BUBBLE (STRICTLY ON THE LEFT SIDE)
          const res = msg.result;
          return (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                justifyContent: 'flex-start',
                width: '100%',
              }}
            >
              <div
                className="win95-window"
                style={{
                  width: '95%',
                  maxWidth: '95%',
                  backgroundColor: '#ece9d8',
                  padding: '6px 8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  boxShadow: '1px 2px 4px rgba(0,0,0,0.15)',
                }}
              >
                {/* Kernel Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ fontWeight: 'bold', color: '#000080' }}>💾 ExNihilo Kernel</span>
                    {res && (
                      <span style={{ color: '#15803d', fontWeight: 'bold' }}>
                        • {res.rowCount} rows ({res.executionTimeMs.toFixed(0)}ms)
                      </span>
                    )}
                  </div>
                  <span style={{ color: '#666', fontSize: '9px' }}>{msg.timestamp}</span>
                </div>

                {msg.text && (
                  <div style={{ fontSize: '11px', color: '#222', lineHeight: 1.3 }}>
                    {msg.text}
                  </div>
                )}

                {/* Bounded Data Grid Container */}
                {res && res.columns.length > 0 && (
                  <div
                    className="win95-sunken"
                    style={{
                      maxHeight: '220px',
                      overflow: 'auto',
                      backgroundColor: '#ffffff',
                      margin: '2px 0',
                    }}
                  >
                    <table
                      style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        fontSize: '11px',
                        fontFamily: 'Consolas, monospace',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <thead style={{ position: 'sticky', top: 0, backgroundColor: '#d4d0c8', zIndex: 1 }}>
                        <tr>
                          {(res.columns || []).map((col, cIdx) => (
                            <th
                              key={cIdx}
                              style={{
                                border: '1px solid #808080',
                                padding: '3px 6px',
                                textAlign: 'left',
                                fontWeight: 'bold',
                                color: '#000',
                                fontSize: '10px',
                              }}
                            >
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {(res.rows || []).map((row, rIdx) => (
                          <tr
                            key={rIdx}
                            style={{
                              backgroundColor: rIdx % 2 === 0 ? '#ffffff' : '#f8f8f8',
                            }}
                          >
                            {(res.columns || []).map((_, cIdx) => {
                              const val = Array.isArray(row) ? row[cIdx] : undefined;
                              return (
                                <td
                                  key={cIdx}
                                  style={{
                                    border: '1px solid #e0e0e0',
                                    padding: '2px 6px',
                                    color: val === null || val === undefined ? '#888' : '#000',
                                  }}
                                >
                                  {val === null || val === undefined ? 'NULL' : String(val)}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Summary & Inferred Badges */}
                {res && res.inferredTables && res.inferredTables.length > 0 && (
                  <div style={{ fontSize: '9px', color: '#555' }}>
                    ⚡ Inferred & Synthesized: <strong>{res.inferredTables.join(', ')}</strong>
                  </div>
                )}

                {/* Footer Controls */}
                {res && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px', marginTop: '2px' }}>
                    <button
                      type="button"
                      className="win95-button"
                      style={{ fontSize: '10px', padding: '1px 6px' }}
                      onClick={() => {
                        const csv = [(res.columns || []).join(','), ...(res.rows || []).map((r) => Array.isArray(r) ? r.join(',') : '')].join('\n');
                        copyToClipboard(csv);
                      }}
                      title="Copy Results as CSV"
                    >
                      📋 CSV
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Spinner Indicator */}
        {(isLoading || isAiLoading) && (
          <div style={{ display: 'flex', justifyContent: 'flex-start', width: '100%' }}>
            <div
              className="win95-window"
              style={{
                padding: '6px 12px',
                fontSize: '11px',
                color: '#000080',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>⏳</span>
              <span>{isAiLoading ? 'Gemini is generating SQL...' : 'Executing in SQLite WASM...'}</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Sticky Input Dock (Bottom Composer) ─────────────────────── */}
      <div
        className="win95-window"
        style={{
          margin: '2px',
          padding: '6px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          flexShrink: 0,
          background: '#d4d0c8',
        }}
      >
        <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-end' }}>
          <textarea
            ref={textareaRef}
            className="win95-sunken"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onSelect={handleSelectText}
            onKeyUp={handleSelectText}
            placeholder="Type SQL or @ai prompt..."
            rows={2}
            style={{
              flex: 1,
              resize: 'none',
              padding: '6px 8px',
              fontSize: '12px',
              fontFamily: 'Consolas, monospace',
              backgroundColor: '#ffffff',
              color: '#000000',
              boxSizing: 'border-box',
            }}
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                handleSend();
              }
            }}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {/* Run Selection (⚡) appears dynamically when user highlights a snippet */}
            {selectedText && (
              <button
                type="button"
                className="win95-button"
                onClick={handleRunSelection}
                style={{
                  fontSize: '13px',
                  fontWeight: 'bold',
                  color: '#b45309',
                  padding: '4px 10px',
                }}
                title={`⚡ Run Selected: "${selectedText.slice(0, 20)}..."`}
              >
                ⚡
              </button>
            )}

            {/* Main Action Button (Stop ■ or Send/Run ➤) */}
            {isLoading ? (
              <button
                type="button"
                className="win95-button"
                onClick={onCancelQuery}
                style={{
                  fontSize: '13px',
                  fontWeight: 'bold',
                  color: '#ffffff',
                  backgroundColor: '#b91c1c',
                  padding: '6px 12px',
                }}
                title="Stop Execution"
              >
                ■
              </button>
            ) : (
              <button
                type="button"
                className="win95-button"
                onClick={() => handleSend()}
                disabled={!inputVal.trim() || isAiLoading}
                style={{
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: '#15803d',
                  padding: '6px 12px',
                }}
                title="Send / Run SQL (Ctrl+Enter)"
              >
                ➤
              </button>
            )}
          </div>
        </div>

        {/* Quick Icon Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 2px' }}>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              type="button"
              className="win95-button"
              onClick={() => {
                setInputVal('@ai ');
                textareaRef.current?.focus();
              }}
              style={{ fontSize: '11px', padding: '1px 6px' }}
              title="Ask Gemini Copilot (@ai)"
            >
              ✨ @ai
            </button>
            <button
              type="button"
              className="win95-button"
              onClick={() => setIsDrawerOpen(true)}
              style={{ fontSize: '11px', padding: '1px 6px' }}
              title="Browse Database Tables"
            >
              🗄️ Tables
            </button>
          </div>

          <div style={{ fontSize: '10px', color: '#555' }}>
            {result ? `${result.rowCount} rows` : 'WASM Ready'}
          </div>
        </div>
      </div>

      {/* ── Slide-Out Database Catalog Drawer ──────────────────────── */}
      <MobileCatalogDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        tables={catalogTables}
        onRefresh={handleRefreshCatalog}
        onSelectTable={(tableName) => {
          setInputVal(`SELECT * FROM "${tableName}" LIMIT 20;`);
          textareaRef.current?.focus();
        }}
      />

      {/* ── Snapshots Time-Travel Dialog ───────────────────────────── */}
      <SnapshotsDialog
        isOpen={isSnapshotsOpen}
        onClose={() => setIsSnapshotsOpen(false)}
        onRestored={handleRefreshCatalog}
      />
    </div>
  );
};
