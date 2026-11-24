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
import { useMessageAudio } from '../../hooks/useMessageAudio';
import { resolveOmniDomainSchema } from '../../engine/omni_domain_classifier';
import { parseSemanticQuery } from '../../engine/semantic_query_parser';
import { DialectPopoverMenu } from './DialectPopoverMenu';

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
  activeError?: any;
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
  activeError,
  catalog,
  onSwitchToDesktop,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('exnihilo_pocket_chat_history');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch {
        // ignore
      }
    }
    return [
      {
        id: 'welcome-1',
        sender: 'kernel',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: 'ExNihilo 95 Pocket SQL Kernel initialized. Type any query or tap 🗄️ to browse tables. Missing tables will be synthesized automatically!',
      },
    ];
  });

  // Preserve chat history across sessions
  useEffect(() => {
    if (typeof window !== 'undefined' && messages.length > 0) {
      try {
        const toSave = messages.slice(-40).map((m) => ({
          ...m,
          result: m.result ? {
            columns: m.result.columns,
            rows: (m.result.rows || []).slice(0, 50),
            rowCount: m.result.rowCount,
            executionTimeMs: m.result.executionTimeMs,
            inferredTables: m.result.inferredTables,
          } : undefined,
        }));
        localStorage.setItem('exnihilo_pocket_chat_history', JSON.stringify(toSave));
      } catch {
        // ignore
      }
    }
  }, [messages]);

  // Start with clean empty input box (no hardcoded preloaded query)
  const [inputVal, setInputVal] = useState('');
  const [selectedText, setSelectedText] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSnapshotsOpen, setIsSnapshotsOpen] = useState(false);
  const [isDialectMenuOpen, setIsDialectMenuOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [catalogVersion, setCatalogVersion] = useState(0);
  const [expandedTableId, setExpandedTableId] = useState<string | null>(null);
  const [fullscreenTable, setFullscreenTable] = useState<ExecutionSuccess | null>(null);
  const [viewportHeight, setViewportHeight] = useState<number | null>(null);

  // Lock body and html scroll so mobile Safari never scrolls the layout viewport
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const origHtmlOverflow = document.documentElement.style.overflow;
    const origBodyOverflow = document.body.style.overflow;
    const origBodyPosition = document.body.style.position;

    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';

    return () => {
      document.documentElement.style.overflow = origHtmlOverflow;
      document.body.style.overflow = origBodyOverflow;
      document.body.style.position = origBodyPosition;
    };
  }, []);

  // Track iOS / Android visual viewport to keep entire UI perfectly fitted above virtual keyboard
  useEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) return;
    const updateViewport = () => {
      if (window.visualViewport) {
        setViewportHeight(window.visualViewport.height);
      }
    };
    window.visualViewport.addEventListener('resize', updateViewport);
    updateViewport();
    return () => {
      window.visualViewport?.removeEventListener('resize', updateViewport);
    };
  }, []);

  const { playSendSound, playReceiveSound, isMuted, toggleMute } = useMessageAudio();
  const lastAudibleMsgIdRef = useRef<string>('welcome-1');

  const chatScrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Play iMessage-style receive chime when a new kernel, copilot, or error message arrives
  useEffect(() => {
    if (messages.length === 0) return;
    const latestMsg = messages[messages.length - 1];
    if (latestMsg && latestMsg.id !== lastAudibleMsgIdRef.current) {
      lastAudibleMsgIdRef.current = latestMsg.id;
      if (latestMsg.sender === 'kernel' || latestMsg.sender === 'copilot' || latestMsg.sender === 'error') {
        playReceiveSound();
      }
    }
  }, [messages, playReceiveSound]);

  // Auto-grow textarea height dynamically based on input (like iMessage/WhatsApp/ChatGPT)
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(Math.max(38, scrollHeight), 140)}px`;
    }
  }, [inputVal]);

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

  // Append query execution errors to chat
  const lastErrorRef = useRef<any>(null);
  useEffect(() => {
    if (activeError && activeError !== lastErrorRef.current) {
      lastErrorRef.current = activeError;
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'error',
          timestamp: timeStr,
          error: activeError.message || activeError.rawMessage || 'SQL Execution failed.',
        },
      ]);
    }
  }, [activeError]);

  // Auto-scroll chat to bottom inside inner chat container without displacing mobile viewport
  useEffect(() => {
    if (chatScrollContainerRef.current) {
      chatScrollContainerRef.current.scrollTo({
        top: chatScrollContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
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

    // Trigger instant procedural iMessage send swoosh sound
    playSendSound();

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Check if input is standard SQL or a natural language prompt
    const isExplicitAi = raw.startsWith('@ai') || raw.startsWith('/ai');
    // Administrative SHOW in SQL is only valid followed by database metadata keywords (e.g. SHOW TABLES, SHOW COLUMNS).
    // Conversational phrases like "Show me...", "Show top...", "Show all..." are natural language prompts!
    const isSqlAdminShow = /^\s*SHOW\s+(TABLES|COLUMNS|DATABASES|CREATE\s+TABLE|PROCESSLIST|STATUS|VARIABLES|INDEX)\b/i.test(raw);
    const isStandardSql = /^\s*(SELECT\b|INSERT\s+INTO\b|UPDATE\b|DELETE\s+FROM\b|CREATE\s+TABLE\b|WITH\b|DROP\s+TABLE\b|ALTER\s+TABLE\b|EXPLAIN\b|PRAGMA\b|DESCRIBE\b)/i.test(raw);
    const isSqlStatement = isSqlAdminShow || isStandardSql;

    // If input is natural language (e.g. "dinosaurs", "table for revenue", "heart patients") or explicit @ai, route to Copilot
    if (isExplicitAi || !isSqlStatement) {
      const aiPrompt = isExplicitAi ? raw.replace(/^[@/]ai\s*/i, '').trim() : raw;
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
    setInputVal('');
    setSelectedText('');
  };

  const handleRunSelection = () => {
    if (!selectedText) return;
    handleSend(selectedText);
  };

  const handleAskCopilot = async (promptText: string) => {
    setIsAiLoading(true);
    const controller = new AbortController();
    // 6-second hard ceiling: guarantees zero infinite loading under any network condition
    const timeoutId = setTimeout(() => {
      try {
        controller.abort();
      } catch {
        // ignore
      }
    }, 6000);

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const isTableRequest = /^(table|create table|schema for|synthesize table)\b/i.test(promptText.trim());
    const cleanPromptName = promptText.replace(/^(table|create table|schema for|synthesize table)\s*/i, '').trim();

    try {
      const schemaCtx = (catalogTables || [])
        .map((t: any) => {
          const rawCols = t?.schema?.columns || t?.columns || [];
          const cols = Array.isArray(rawCols) ? rawCols : [];
          const colList = cols.map((c: any) => c?.name || String(c)).join(', ');
          return `${t?.tableName || 'table'} (${colList})`;
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
          mode: isTableRequest ? 'schema' : undefined,
          tableName: isTableRequest ? cleanPromptName : undefined,
        }),
        signal: controller.signal,
      });

      const data = await res.json();

      if (data.ok && (data.sql || data.text)) {
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            sender: 'copilot',
            timestamp: timeStr,
            sql: data.sql || undefined,
            text: data.text || (data.mode === 'schema'
              ? `✨ Synthesized authentic schema for "${data.tableName}":`
              : 'I generated this query for you:'),
          },
        ]);

        // Ingest schema into continual on-device learner
        if (data.schema?.columns && typeof window !== 'undefined') {
          import('../../engine/continual_learner').then(({ continualLearner }) => {
            continualLearner.recordTableExperience(data.tableName || 'table', data.schema.columns);
          }).catch(() => {});
        }
        return;
      }
      throw new Error(data.message || 'Copilot fallback');
    } catch {
      // Instant on-device synthesis fallback: zero loading hang, instant astonish response
      try {
        const semantic = parseSemanticQuery(promptText);
        if (semantic.isTableCreation || isTableRequest) {
          const tbl = semantic.tableName;
          const cols = resolveOmniDomainSchema(tbl);
          const colDefs = cols.map(c => `  "${c.name}" ${c.logicalType === 'INTEGER' ? 'INTEGER' : c.logicalType === 'NUMERIC' ? 'NUMERIC' : c.logicalType === 'TIMESTAMP' ? 'TIMESTAMP' : c.logicalType === 'BOOLEAN' ? 'BOOLEAN' : 'VARCHAR(255)'}${c.isPrimaryKey ? ' PRIMARY KEY' : ''}`).join(',\n');
          const ddl = `CREATE TABLE IF NOT EXISTS "${tbl}" (\n${colDefs}\n);`;

          setMessages((prev) => [
            ...prev,
            {
              id: `ai-${Date.now()}`,
              sender: 'copilot',
              timestamp: timeStr,
              sql: ddl,
              text: `✨ Synthesized authentic schema for "${tbl}":`,
            },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              id: `ai-${Date.now()}`,
              sender: 'copilot',
              timestamp: timeStr,
              sql: semantic.sql,
              text: 'I generated this query for you:',
            },
          ]);
        }
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            sender: 'copilot',
            timestamp: timeStr,
            sql: `SELECT * FROM customers LIMIT 20;`,
            text: 'I generated this query for you:',
          },
        ]);
      }
    } finally {
      clearTimeout(timeoutId);
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

  const handleSnapshotRestored = async (snapshotName?: string) => {
    try {
      const refreshedCatalog = await sqlWorkerClient.getCatalog();
      setCatalogVersion((v) => v + 1);

      const tables = Array.isArray(refreshedCatalog) ? refreshedCatalog : (refreshedCatalog as any)?.tables || [];
      const tableNames = tables.map((t: any) => t.tableName || t.name).filter(Boolean);
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      playReceiveSound();

      setMessages((prev) => [
        ...prev,
        {
          id: `restore-${Date.now()}`,
          sender: 'kernel',
          timestamp: timeStr,
          text: `💾 Savepoint "${snapshotName || 'Checkpoint'}" loaded successfully!\n📦 Restored tables (${tableNames.length}): ${tableNames.length > 0 ? tableNames.join(', ') : 'None'}.`,
        },
      ]);

      if (tableNames.length > 0) {
        const primaryTable = tableNames[0];
        const previewQuery = `SELECT * FROM "${primaryTable}" LIMIT 20;`;
        onQueryChange(previewQuery);
        await onRun(previewQuery);
      }

      setIsSnapshotsOpen(false);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `restore-err-${Date.now()}`,
          sender: 'error',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          error: `Failed to load savepoint: ${err?.message || 'Unknown error'}`,
        },
      ]);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: viewportHeight ? `${viewportHeight}px` : '100dvh',
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
      {/* ── Full-Height Chat Screen Container (Capsules Sit on Top of Chat Screen) ── */}
      <div
        style={{
          position: 'relative',
          flex: '1 1 auto',
          minHeight: 0,
          margin: '2px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* ── Floating Island Capsules: Sitting Directly on Top of Chat Screen ── */}
        <div
          style={{
            position: 'absolute',
            top: '6px',
            left: '6px',
            right: '6px',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '6px',
            pointerEvents: 'none',
          }}
        >
          {/* Zone 1: Left Navigation Floating Capsule */}
          <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0, pointerEvents: 'auto' }}>
            <button
              type="button"
              className="win95-button"
              onClick={onSwitchToDesktop}
              style={{
                height: '38px',
                borderRadius: '19px',
                padding: '0 10px',
                fontSize: '11px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                backgroundColor: 'rgba(255, 255, 255, 0.94)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.18)',
                color: '#0f172a',
                cursor: 'pointer',
                border: '1px solid rgba(0, 0, 0, 0.15)',
              }}
              title="Switch to Desktop IDE Workspace"
            >
              <span style={{ fontSize: '10px' }}>◀</span>
              <span>IDE</span>
            </button>
          </div>

          {/* Zone 2: Centered Royal Blue "Sender Hero Pill" (Stacked Identity) */}
          <div
            onClick={() => {
              setIsMoreMenuOpen(false);
              setIsDialectMenuOpen((prev) => !prev);
            }}
            style={{
              background: 'linear-gradient(135deg, #007aff 0%, #0051d4 50%, #0038a8 100%)',
              borderRadius: '21px',
              padding: '2px 12px 2px 6px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 5px 18px rgba(0, 81, 212, 0.45), 0 2px 6px rgba(0, 0, 0, 0.22)',
              border: '1px solid rgba(255, 255, 255, 0.45)',
              height: '38px',
              flexShrink: 0,
              userSelect: 'none',
              pointerEvents: 'auto',
            }}
            title="Tap to change SQL dialect & view engine settings"
          >
            <div
              style={{
                width: '26px',
                height: '26px',
                backgroundColor: '#ffffff',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.25)',
                flexShrink: 0,
              }}
            >
              💾
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'center',
                lineHeight: 1.15,
              }}
            >
              <span
                style={{
                  color: '#ffffff',
                  fontSize: '11px',
                  fontWeight: 800,
                  letterSpacing: '0.3px',
                  whiteSpace: 'nowrap',
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                }}
              >
                ExNihilo 95
              </span>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                  fontSize: '9.5px',
                  color: '#e0f2fe',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                }}
              >
                <span
                  style={{
                    width: '5px',
                    height: '5px',
                    backgroundColor: '#22c55e',
                    borderRadius: '50%',
                    boxShadow: '0 0 5px #22c55e',
                    display: 'inline-block',
                  }}
                />
                <span>{dialect}</span>
                <span style={{ fontSize: '8px', opacity: 0.85 }}>▾</span>
              </div>
            </div>
          </div>

          {/* Zone 3: Right Action Floating Capsules */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0, pointerEvents: 'auto' }}>
            <button
              type="button"
              className="win95-button"
              onClick={() => setIsDrawerOpen(true)}
              style={{
                height: '38px',
                borderRadius: '19px',
                padding: '0 9px',
                fontSize: '11px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                backgroundColor: 'rgba(255, 255, 255, 0.94)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.18)',
                color: '#0f172a',
                cursor: 'pointer',
                border: '1px solid rgba(0, 0, 0, 0.15)',
              }}
              title={`Database Catalog (${catalogTables.length} tables in memory)`}
            >
              <span style={{ fontSize: '12px' }}>🗄️</span>
              {catalogTables.length > 0 && (
                <span
                  style={{
                    backgroundColor: '#007aff',
                    color: '#ffffff',
                    padding: '1px 5px',
                    borderRadius: '9px',
                    fontSize: '9px',
                    fontWeight: 800,
                  }}
                >
                  {catalogTables.length}
                </span>
              )}
            </button>

            <button
              type="button"
              className="win95-button"
              onClick={() => {
                setIsDialectMenuOpen(false);
                setIsMoreMenuOpen((prev) => !prev);
              }}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                padding: 0,
                fontSize: '14px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.94)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.18)',
                color: '#0f172a',
                cursor: 'pointer',
                border: '1px solid rgba(0, 0, 0, 0.15)',
              }}
              title="More Options"
            >
              ⋯
            </button>
          </div>
        </div>

        {/* ── More Options Popover Menu ── */}
        {isMoreMenuOpen && (
          <>
            <div
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 1999,
                backgroundColor: 'rgba(0, 0, 0, 0.25)',
                backdropFilter: 'blur(2px)',
                WebkitBackdropFilter: 'blur(2px)',
              }}
              onClick={() => setIsMoreMenuOpen(false)}
            />
            <div
              style={{
                position: 'fixed',
                top: '56px',
                right: '10px',
                width: 'calc(100vw - 32px)',
                maxWidth: '220px',
                backgroundColor: 'rgba(253, 251, 247, 0.98)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRadius: '18px',
                border: '2px solid #808080',
                boxShadow: '0 20px 45px rgba(0, 0, 0, 0.4)',
                zIndex: 2000,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                padding: '6px',
                boxSizing: 'border-box',
              }}
            >
              <div
                onClick={() => {
                  setIsMoreMenuOpen(false);
                  setIsSnapshotsOpen(true);
                }}
                style={{
                  padding: '9px 12px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#1e293b',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span>💾</span>
                <span>Checkpoints & Saves</span>
              </div>

              <div
                onClick={() => {
                  toggleMute();
                }}
                style={{
                  padding: '9px 12px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#1e293b',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span>{isMuted ? '🔇' : '🔊'}</span>
                <span>{isMuted ? 'Unmute Sound' : 'Mute Sound'}</span>
              </div>

              <div
                onClick={() => {
                  setIsMoreMenuOpen(false);
                  setMessages([]);
                }}
                style={{
                  padding: '9px 12px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#b91c1c',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span>🗑️</span>
                <span>Clear Chat History</span>
              </div>

              <div
                onClick={() => {
                  setIsMoreMenuOpen(false);
                  onSwitchToDesktop();
                }}
                style={{
                  padding: '9px 12px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#1e293b',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  borderTop: '1px solid #e2ded5',
                  marginTop: '4px',
                }}
              >
                <span>🖥️</span>
                <span>Desktop IDE Studio</span>
              </div>
            </div>
          </>
        )}

        {/* ── Custom Dialect Popover Menu Component ── */}
        <DialectPopoverMenu
          isOpen={isDialectMenuOpen}
          onClose={() => setIsDialectMenuOpen(false)}
          activeDialect={dialect}
          onSelectDialect={(d) => {
            onDialectChange(d);
            setIsDialectMenuOpen(false);
          }}
        />

        {/* ── Scrollable Chat Stream (Message History) ── */}
        <div
          ref={chatScrollContainerRef}
          className="win95-inset"
          style={{
            flex: '1 1 auto',
            minHeight: 0,
            width: '100%',
            height: '100%',
            backgroundColor: '#ffffff',
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: '52px 8px 12px 8px', // 52px top padding keeps initial message cleanly below floating capsules!
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'contain',
            boxSizing: 'border-box',
          }}
        >
        {messages.map((msg) => {
          if (msg.sender === 'user') {
            // USER MESSAGE BUBBLE (STRICTLY ON THE RIGHT SIDE - iMESSAGE CONTOUR IN WIN95 HIGH-COLOR GRADIENT)
            return (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  width: '100%',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', maxWidth: '85%' }}>
                  <div
                    style={{
                      width: 'fit-content',
                      minWidth: '60px',
                      background: 'linear-gradient(135deg, #000080 0%, #1084d0 100%)',
                      color: '#ffffff',
                      borderRadius: '18px 18px 3px 18px',
                      padding: '8px 13px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      wordBreak: 'break-word',
                      overflowWrap: 'break-word',
                      border: '1px solid rgba(255, 255, 255, 0.25)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', opacity: 0.85, fontSize: '9px' }}>
                      <span style={{ fontWeight: 'bold' }}>You</span>
                      <span>{msg.timestamp}</span>
                    </div>

                    {msg.text && (
                      <div style={{ fontSize: '12px', wordBreak: 'break-word', lineHeight: 1.35, whiteSpace: 'pre-wrap' }}>
                        {msg.text}
                      </div>
                    )}

                    {msg.sql && (
                      <pre
                        style={{
                          margin: 0,
                          padding: '6px 8px',
                          backgroundColor: 'rgba(0, 0, 0, 0.35)',
                          color: '#86efac',
                          fontSize: '11px',
                          fontFamily: 'Consolas, monospace',
                          borderRadius: '6px',
                          overflowX: 'auto',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
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
                <div style={{ fontSize: '9px', color: '#64748b', marginTop: '2px', marginRight: '4px', letterSpacing: '0.02em' }}>
                  Delivered
                </div>
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
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', maxWidth: '92%' }}>
                  <div
                    className="win95-window"
                    style={{
                      width: 'fit-content',
                      backgroundColor: '#f5f0ff',
                      borderRadius: '18px 18px 18px 3px',
                      border: '2px outset #c084fc',
                      padding: '8px 10px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.16)',
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
                          borderRadius: '6px',
                          overflowX: 'auto',
                          whiteSpace: 'pre-wrap',
                        }}
                      >
                        {msg.sql}
                      </pre>
                    )}

                    {msg.sql && (
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
                    )}
                  </div>
                  <div style={{ fontSize: '9px', color: '#7e22ce', marginTop: '2px', marginLeft: '6px' }}>
                    Gemini AI • {msg.timestamp}
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
                    borderRadius: '18px 18px 18px 3px',
                    border: '2px outset #ffffff',
                    padding: '8px 10px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.16)',
                  }}
                >
                  <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#b91c1c', marginBottom: '2px' }}>
                    ⚠️ Execution / AI Error ({msg.timestamp})
                  </div>
                  <div style={{ fontSize: '11px', color: '#7f1d1d' }}>{msg.error}</div>
                  <button
                    type="button"
                    className="win95-button"
                    style={{ fontSize: '10px', padding: '2px 8px', marginTop: '6px', fontWeight: 'bold', color: '#1e40af' }}
                    onClick={() => handleAskCopilot(`Fix this SQL error: ${msg.error}\nOriginal query: ${queryText || ''}`)}
                  >
                    ⚡ Ask AI Copilot to Fix
                  </button>
                </div>
              </div>
            );
          }

          // KERNEL RESULT BUBBLE (STRICTLY ON THE LEFT SIDE - iMESSAGE CONTOUR IN WIN95 CHROME)
          const res = msg.result;
          const isExpanded = expandedTableId === msg.id;
          return (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                justifyContent: 'flex-start',
                width: '100%',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }}>
                <div
                  className="win95-window"
                  style={{
                    width: '100%',
                    maxWidth: '100%',
                    minWidth: 0,
                    boxSizing: 'border-box',
                    backgroundColor: '#ece9d8',
                    padding: '8px 8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
                    borderRadius: '18px 18px 18px 3px',
                    overflow: 'hidden',
                  }}
                >
                {/* Kernel Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', gap: '4px', width: '100%', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '3px', flexWrap: 'wrap', minWidth: 0, flexShrink: 1 }}>
                    <span style={{ fontWeight: 'bold', color: '#000080', whiteSpace: 'nowrap' }}>💾 Kernel</span>
                    {res && (
                      <span style={{ color: '#15803d', fontWeight: 'bold', fontSize: '9px', whiteSpace: 'nowrap' }}>
                        • {res.rowCount} row{res.rowCount === 1 ? '' : 's'} ({res.executionTimeMs.toFixed(0)}ms)
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '3px', flexShrink: 0 }}>
                    {res && res.columns && res.columns.length > 0 && (
                      <>
                        <button
                          type="button"
                          className="win95-button"
                          style={{ fontSize: '9px', padding: '1px 5px', fontWeight: 'bold' }}
                          onClick={() => setExpandedTableId(isExpanded ? null : msg.id)}
                          title={isExpanded ? 'Collapse Table View' : 'Expand Table View'}
                        >
                          {isExpanded ? '⛶ Less' : '⛶ Expand'}
                        </button>
                        <button
                          type="button"
                          className="win95-button"
                          style={{ fontSize: '9px', padding: '1px 5px', fontWeight: 'bold' }}
                          onClick={() => setFullscreenTable(res)}
                          title="Open Fullscreen Data Sheet"
                        >
                          🗖 Full
                        </button>
                      </>
                    )}
                    <span style={{ color: '#666', fontSize: '9px', whiteSpace: 'nowrap' }}>{msg.timestamp}</span>
                  </div>
                </div>

                {msg.text && (
                  <div style={{ fontSize: '11px', color: '#222', lineHeight: 1.35, whiteSpace: 'pre-wrap' }}>
                    {msg.text}
                  </div>
                )}

                {/* Dynamic Data Grid Container with Smooth Momentum Scrolling */}
                {res && res.columns.length > 0 && (
                  <div
                    className="win95-sunken"
                    style={{
                      width: '100%',
                      maxWidth: '100%',
                      maxHeight: isExpanded ? '60vh' : '220px',
                      overflowX: 'auto',
                      overflowY: 'auto',
                      backgroundColor: '#ffffff',
                      margin: '2px 0',
                      WebkitOverflowScrolling: 'touch',
                      overscrollBehavior: 'contain',
                      touchAction: 'pan-x pan-y',
                      boxSizing: 'border-box',
                    }}
                  >
                    <table
                      style={{
                        minWidth: '100%',
                        width: 'max-content',
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
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', fontSize: '9px', color: '#555', marginTop: '2px', flexWrap: 'wrap' }}>
                    <span>⚡ Inferred: <strong>{res.inferredTables.join(', ')}</strong></span>
                    <button
                      type="button"
                      className="win95-button"
                      style={{ fontSize: '9px', padding: '1px 6px', color: '#6b21a8', fontWeight: 'bold' }}
                      onClick={() => handleAskCopilot(`table for ${res.inferredTables[0]}`)}
                      title="Calibrate schema using Gemini AI"
                    >
                      ✨ Calibrate with Gemini
                    </button>
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
              {res && (
                <div style={{ fontSize: '9px', color: '#64748b', marginTop: '2px', marginLeft: '6px' }}>
                  Executed in {res.executionTimeMs.toFixed(0)}ms • {msg.timestamp}
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
      </div>

      {/* ── Sticky Input Dock (Bottom Composer) ─────────────────────── */}
      <div
        className="win95-window"
        style={{
          margin: '2px',
          padding: '6px 6px',
          paddingBottom: 'calc(6px + env(safe-area-inset-bottom, 0px))',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          flexShrink: 0,
          background: '#d4d0c8',
          width: 'calc(100% - 4px)',
          maxWidth: '100%',
          boxSizing: 'border-box',
        }}
      >
        {/* Quick Suggestion Pills when input is empty */}
        {!inputVal.trim() && (
          <div
            style={{
              display: 'flex',
              gap: '4px',
              overflowX: 'auto',
              paddingBottom: '2px',
              WebkitOverflowScrolling: 'touch',
              width: '100%',
              maxWidth: '100%',
              boxSizing: 'border-box',
            }}
          >
            <button
              type="button"
              className="win95-button"
              style={{ fontSize: '10px', padding: '2px 8px', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '3px' }}
              onClick={() => handleSend('SELECT * FROM "customers" LIMIT 20;')}
            >
              <span>📋</span>
              <span>customers</span>
            </button>
            <button
              type="button"
              className="win95-button"
              style={{ fontSize: '10px', padding: '2px 8px', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '3px' }}
              onClick={() => handleSend('SELECT * FROM "orders" LIMIT 20;')}
            >
              <span>📊</span>
              <span>orders</span>
            </button>
            <button
              type="button"
              className="win95-button"
              style={{ fontSize: '10px', padding: '2px 8px', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '3px' }}
              onClick={() => handleSend('SELECT * FROM "revenue" LIMIT 20;')}
            >
              <span>💰</span>
              <span>revenue</span>
            </button>
            <button
              type="button"
              className="win95-button"
              style={{ fontSize: '10px', padding: '2px 8px', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '3px' }}
              onClick={() => handleSend('SELECT * FROM "heart" LIMIT 20;')}
            >
              <span>❤️</span>
              <span>heart</span>
            </button>
            <button
              type="button"
              className="win95-button"
              style={{ fontSize: '10px', padding: '2px 8px', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '3px', color: '#6b21a8' }}
              onClick={() => handleAskCopilot('Create table for user profiles with activity metrics')}
            >
              <span>✨</span>
              <span>@ai table...</span>
            </button>
          </div>
        )}

        <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-end', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
          <textarea
            ref={textareaRef}
            className="win95-sunken"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onSelect={handleSelectText}
            onKeyUp={handleSelectText}
            onFocus={() => {
              setTimeout(() => {
                if (chatScrollContainerRef.current) {
                  chatScrollContainerRef.current.scrollTo({
                    top: chatScrollContainerRef.current.scrollHeight,
                    behavior: 'smooth',
                  });
                }
              }, 120);
            }}
            placeholder="Type SQL query or ask Copilot here..."
            style={{
              flex: '1 1 auto',
              minWidth: 0,
              resize: 'none',
              minHeight: '38px',
              maxHeight: '140px',
              height: '38px',
              padding: '8px 10px',
              fontSize: '16px', // 16px minimum prevents iOS Safari from auto-zooming
              lineHeight: '1.4',
              fontFamily: 'Consolas, monospace',
              backgroundColor: '#ffffff',
              color: '#000000',
              boxSizing: 'border-box',
              overflowY: 'auto',
            }}
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                handleSend();
              }
            }}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flexShrink: 0 }}>
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
                  flexShrink: 0,
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
                  minHeight: '36px',
                  flexShrink: 0,
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
                  fontSize: '15px',
                  fontWeight: 'bold',
                  color: '#15803d',
                  padding: '6px 14px',
                  minHeight: '36px',
                  flexShrink: 0,
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
        onRestored={handleSnapshotRestored}
      />

      {/* ── Fullscreen Data Sheet Modal ────────────────────────────── */}
      {fullscreenTable && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            flexDirection: 'column',
            padding: '8px',
            boxSizing: 'border-box',
          }}
        >
          <div
            className="win95-window"
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
            }}
          >
            <div
              className="win95-titlebar"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '4px 8px',
                flexShrink: 0,
              }}
            >
              <div className="win95-titlebar-text" style={{ fontSize: '11px', fontWeight: 'bold' }}>
                <span>📊 Fullscreen Data Sheet</span>
                <span style={{ opacity: 0.85, marginLeft: '6px' }}>
                  ({fullscreenTable.rowCount} rows, {fullscreenTable.columns.length} columns)
                </span>
              </div>
              <button
                type="button"
                className="win95-button"
                onClick={() => setFullscreenTable(null)}
                style={{ fontSize: '11px', padding: '1px 6px', fontWeight: 'bold' }}
                title="Close Fullscreen View"
              >
                ✕
              </button>
            </div>

            <div
              className="win95-sunken"
              style={{
                flex: 1,
                overflow: 'auto',
                backgroundColor: '#ffffff',
                margin: '2px',
                WebkitOverflowScrolling: 'touch',
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
                    {(fullscreenTable.columns || []).map((col, cIdx) => (
                      <th
                        key={cIdx}
                        style={{
                          border: '1px solid #808080',
                          padding: '4px 8px',
                          textAlign: 'left',
                          fontWeight: 'bold',
                          color: '#000',
                          fontSize: '11px',
                        }}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(fullscreenTable.rows || []).map((row, rIdx) => (
                    <tr
                      key={rIdx}
                      style={{
                        backgroundColor: rIdx % 2 === 0 ? '#ffffff' : '#f8f8f8',
                      }}
                    >
                      {(fullscreenTable.columns || []).map((_, cIdx) => {
                        const val = Array.isArray(row) ? row[cIdx] : undefined;
                        return (
                          <td
                            key={cIdx}
                            style={{
                              border: '1px solid #e0e0e0',
                              padding: '3px 8px',
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

            <div
              style={{
                padding: '4px 8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#d4d0c8',
                borderTop: '1px solid #808080',
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: '10px', color: '#444' }}>
                Execution: {fullscreenTable.executionTimeMs.toFixed(0)}ms
              </span>
              <button
                type="button"
                className="win95-button"
                onClick={() => {
                  const csv = [(fullscreenTable.columns || []).join(','), ...(fullscreenTable.rows || []).map((r) => Array.isArray(r) ? r.join(',') : '')].join('\n');
                  copyToClipboard(csv);
                }}
                style={{ fontSize: '10px', padding: '2px 8px' }}
              >
                📋 Copy CSV
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
