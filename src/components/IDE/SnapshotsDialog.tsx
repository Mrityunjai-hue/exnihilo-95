/**
 * SnapshotsDialog.tsx — Time-Travel Database Snapshots & Checkpoints Manager
 *
 * Allows users to create named checkpoints of their in-memory SQLite database,
 * restore any checkpoint in 1 click, download standalone .sqlite files,
 * and view automated background saves without losing data.
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useDraggable } from '../../hooks/useDraggable';
import { useTheme } from '../../hooks/useTheme';
import {
  listDatabaseSnapshots,
  saveDatabaseSnapshot,
  loadDatabaseSnapshot,
  deleteDatabaseSnapshot,
  DatabaseSnapshot,
} from '../../hooks/useWorkspaceStorage';
import { sqlWorkerClient } from '../../engine/worker/SQLWorkerClient';

interface SnapshotsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRestored?: (snapshotName?: string) => void;
  zIndex?: number;
}

export const SnapshotsDialog: React.FC<SnapshotsDialogProps> = ({
  isOpen,
  onClose,
  onRestored,
  zIndex = 99995,
}) => {
  const { activeTheme } = useTheme();
  const isDark = activeTheme === 'macos-glass' || activeTheme === 'win95-noir';

  const [snapshots, setSnapshots] = useState<DatabaseSnapshot[]>([]);
  const [newSnapshotName, setNewSnapshotName] = useState('');
  const [feedback, setFeedback] = useState<{ msg: string; ok: boolean } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(typeof window !== 'undefined' && window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const { position, handleMouseDown } = useDraggable({ x: 120, y: 80 });

  const loadSnapshots = useCallback(async () => {
    try {
      const list = await listDatabaseSnapshots();
      setSnapshots(list);
    } catch (err) {
      console.warn('Failed to list snapshots:', err);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadSnapshots();
    }
  }, [isOpen, loadSnapshots]);

  if (!isOpen) return null;

  const showFeedback = (msg: string, ok: boolean) => {
    setFeedback({ msg, ok });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleCreateSnapshot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessing) return;

    setIsProcessing(true);
    try {
      const binary = await sqlWorkerClient.exportDatabaseBinary();
      if (!binary || binary.byteLength === 0) {
        showFeedback('⚠️ Database is empty. Execute a query first to create tables.', false);
        setIsProcessing(false);
        return;
      }

      const snapshotName = newSnapshotName.trim() || `Manual Save (${new Date().toLocaleTimeString()})`;
      const catalog = sqlWorkerClient.getCatalogSnapshot();
      const saved = await saveDatabaseSnapshot(snapshotName, binary, catalog.tables?.length || 0);

      if (saved) {
        setNewSnapshotName('');
        await loadSnapshots();
        showFeedback(`✅ Checkpoint "${saved.name}" created (${(saved.sizeBytes! / 1024).toFixed(1)} KB).`, true);
      } else {
        showFeedback('❌ Failed to save snapshot to IndexedDB.', false);
      }
    } catch (err) {
      showFeedback(`❌ Error: ${err instanceof Error ? err.message : String(err)}`, false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRestore = async (id: string, name: string) => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      const snap = await loadDatabaseSnapshot(id);
      if (!snap || !snap.binary) {
        showFeedback(`❌ Could not load binary data for "${name}".`, false);
        setIsProcessing(false);
        return;
      }

      const ok = await sqlWorkerClient.loadSqliteBinary(snap.binary);
      if (ok) {
        showFeedback(`✅ Database restored to checkpoint "${name}".`, true);
        onRestored?.(name);
      } else {
        showFeedback(`❌ Worker failed to mount snapshot "${name}".`, false);
      }
    } catch (err) {
      showFeedback(`❌ Restore error: ${err instanceof Error ? err.message : String(err)}`, false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExport = async (snap: DatabaseSnapshot) => {
    try {
      let binary = snap.binary;
      if (!binary) {
        const full = await loadDatabaseSnapshot(snap.id);
        binary = full?.binary;
      }
      if (!binary || binary.byteLength === 0) {
        showFeedback('⚠️ Snapshot has no binary payload.', false);
        return;
      }

      const arrayBuffer = binary.buffer.slice(binary.byteOffset, binary.byteOffset + binary.byteLength) as ArrayBuffer;
      const blob = new Blob([arrayBuffer], { type: 'application/vnd.sqlite3' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const safeName = snap.name.replace(/[^a-zA-Z0-9_-]/g, '_');
      a.download = `${safeName}.sqlite`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      showFeedback('❌ Failed to export snapshot file.', false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const ok = await deleteDatabaseSnapshot(id);
    if (ok) {
      await loadSnapshots();
      showFeedback(`🗑️ Deleted checkpoint "${name}".`, true);
    } else {
      showFeedback(`❌ Failed to delete "${name}".`, false);
    }
  };

  const dialogContent = (
    <div
      className="win95-window"
      style={{
        position: isMobile ? 'relative' : 'fixed',
        left: isMobile ? 'auto' : `${Math.max(10, Math.min(position.x, (typeof window !== 'undefined' ? window.innerWidth : 800) - 580))}px`,
        top: isMobile ? 'auto' : `${Math.max(10, Math.min(position.y, (typeof window !== 'undefined' ? window.innerHeight : 600) - 450))}px`,
        width: isMobile ? '100%' : '560px',
        maxWidth: isMobile ? '95vw' : '92vw',
        maxHeight: isMobile ? '86dvh' : '90vh',
        zIndex: isMobile ? 1 : zIndex,
        boxShadow: '4px 4px 20px rgba(0,0,0,0.6)',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {/* Titlebar */}
      <div
        className="win95-titlebar"
        onMouseDown={isMobile ? undefined : handleMouseDown}
        style={{ cursor: isMobile ? 'default' : 'move', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, padding: '4px 6px' }}
      >
        <div className="win95-titlebar-text" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 'bold' }}>
          <span>💾</span>
          <span>Time-Travel Snapshots</span>
        </div>
        <button
          type="button"
          className="win95-button win95-close-btn"
          onClick={onClose}
          style={{ width: '18px', height: '16px', lineHeight: '12px', fontSize: '11px', padding: 0, fontWeight: 'bold' }}
          title="Close Dialog"
        >
          ✕
        </button>
      </div>

      {/* Body */}
      <div style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px', overflowY: 'auto', flex: 1, minHeight: 0 }}>
        {/* Create Checkpoint Form */}
        <form onSubmit={handleCreateSnapshot} style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="text"
            className="win95-sunken"
            placeholder="Checkpoint description (e.g. Before Migration)..."
            value={newSnapshotName}
            onChange={(e) => setNewSnapshotName(e.target.value)}
            style={{ flex: '1 1 180px', minWidth: 0, padding: '4px 8px', fontSize: '11px', background: 'var(--w95-sunken-bg, #ffffff)' }}
          />
          <button
            type="submit"
            className="win95-button"
            disabled={isProcessing}
            style={{ padding: '3px 10px', fontSize: '11px', fontWeight: 'bold', whiteSpace: 'nowrap', flexShrink: 0 }}
          >
            📸 Create Checkpoint
          </button>
        </form>

        {/* Feedback Banner */}
        {feedback && (
          <div
            style={{
              padding: '6px 10px',
              fontSize: '11px',
              background: feedback.ok ? '#e0ffe0' : '#ffe0e0',
              border: `1px solid ${feedback.ok ? '#66bb66' : '#ee6666'}`,
              color: '#000000',
              fontWeight: 'bold',
            }}
          >
            {feedback.msg}
          </div>
        )}

        {/* Snapshots List Inset */}
        <div
          className="win95-inset"
          style={{
            height: isMobile ? '190px' : '240px',
            overflowY: 'auto',
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch',
            background: 'var(--w95-sunken-bg, #ffffff)',
            color: 'var(--w95-sunken-text, #000000)',
            flex: '1 1 auto',
            minHeight: '120px',
          }}
        >
          {snapshots.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#666' }}>
              <div>📦 No saved database checkpoints found.</div>
              <div style={{ fontSize: '10px', marginTop: '4px' }}>
                Run queries or create a snapshot above to preserve your session.
              </div>
            </div>
          ) : (
            <table style={{ width: '100%', minWidth: isMobile ? '100%' : '400px', borderCollapse: 'collapse', fontSize: '11px' }}>
              <thead>
                <tr style={{ background: '#d0d0d0', borderBottom: '1px solid #999', textAlign: 'left', position: 'sticky', top: 0, zIndex: 2 }}>
                  <th style={{ padding: '4px 8px' }}>Checkpoint Name</th>
                  <th style={{ padding: '4px 8px' }}>Created</th>
                  <th style={{ padding: '4px 8px' }}>Tables</th>
                  <th style={{ padding: '4px 8px' }}>Size</th>
                  <th style={{ padding: '4px 8px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {snapshots.map((snap) => {
                  const isAuto = snap.id === 'autosave_latest';
                  const dateStr = new Date(snap.timestamp).toLocaleTimeString([], {
                    hour: 'numeric',
                    minute: '2-digit',
                    second: '2-digit',
                  });
                  const kb = snap.sizeBytes ? (snap.sizeBytes / 1024).toFixed(1) : '0';

                  return (
                    <tr
                      key={snap.id}
                      style={{
                        borderBottom: '1px solid #eee',
                        background: isAuto ? (isDark ? '#1e293b' : '#f0fdf4') : 'transparent',
                      }}
                    >
                      <td style={{ padding: '4px 8px', fontWeight: isAuto ? 'bold' : 'normal', whiteSpace: 'nowrap' }}>
                        {isAuto ? '⚡ AutoSave (Latest)' : snap.name}
                      </td>
                      <td style={{ padding: '4px 8px', color: '#666', whiteSpace: 'nowrap' }}>{dateStr}</td>
                      <td style={{ padding: '4px 8px' }}>{snap.tablesCount ?? '-'}</td>
                      <td style={{ padding: '4px 8px', whiteSpace: 'nowrap' }}>{kb} KB</td>
                      <td style={{ padding: '4px 8px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <button
                          type="button"
                          className="win95-button"
                          onClick={() => handleRestore(snap.id, snap.name)}
                          disabled={isProcessing}
                          style={{ padding: '2px 8px', fontSize: '10px', marginRight: '4px', fontWeight: 'bold' }}
                          title="Restore SQLite in-memory state to this checkpoint"
                        >
                          ⏪ Restore
                        </button>
                        <button
                          type="button"
                          className="win95-button"
                          onClick={() => handleExport(snap)}
                          style={{ padding: '2px 6px', fontSize: '10px', marginRight: '4px' }}
                          title="Export standalone .sqlite binary"
                        >
                          💾 .sqlite
                        </button>
                        {!isAuto && (
                          <button
                            type="button"
                            className="win95-button"
                            onClick={() => handleDelete(snap.id, snap.name)}
                            disabled={isProcessing}
                            style={{ padding: '2px 6px', fontSize: '10px', color: '#c00000', fontWeight: 'bold' }}
                            title="Delete checkpoint from browser storage"
                          >
                            ✕
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer info & close */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, gap: '6px', flexWrap: 'wrap' }}>
          <div style={{ fontSize: '10px', opacity: 0.7 }}>
            Saved in local IndexedDB.
          </div>
          <button
            type="button"
            className="win95-button"
            onClick={onClose}
            style={{ padding: '3px 14px', fontSize: '11px', fontWeight: 'bold' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.55)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex,
          padding: '10px',
          boxSizing: 'border-box',
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        {dialogContent}
      </div>
    );
  }

  return dialogContent;
};
