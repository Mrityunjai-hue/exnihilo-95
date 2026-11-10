/**
 * SchemaTree.tsx — Windows 95 Database Navigator Pane
 *
 * Hierarchical tree view:
 *   🖥️ ExNihilo Session
 *   └─ 🗄️ <database>
 *       └─ 📋 Tables (N)
 *           └─ 📄 <table>
 *               └─ column rows (🔑/🔗/📄)
 *
 * Features:
 *  - [+ New DB] button in header
 *  - Right-click context menus on database and table nodes
 *  - Search filter (tables + columns)
 *  - DDL modal with copy
 *  - Drop Table / Drop Database confirmation dialogs
 */

import React, { useState, useEffect, useRef } from 'react';
import { SessionCatalog, CatalogEntry } from '../../engine/catalog';
import { SQLExecutor } from '../../engine/executor';
import { useTheme } from '../../hooks/useTheme';

interface SchemaTreeProps {
  catalog:           SessionCatalog;
  executor:          SQLExecutor;
  onSelectTable:     (tableName: string, querySql?: string) => void;
  onRefresh:         () => void;
  onNewDatabase:     () => void;
  onNewTable:        (targetDb: string) => void;
}

// ── Context Menu ───────────────────────────────────────────────────────────────

type CtxTarget =
  | { kind: 'db'; dbName: string }
  | { kind: 'table'; tableName: string; dbName: string; isUserDefined: boolean };

interface ContextMenuState {
  x: number; y: number;
  target: CtxTarget;
}

const ContextMenu: React.FC<{
  menu: ContextMenuState;
  onClose: () => void;
  onAction: (action: string, target: CtxTarget) => void;
}> = ({ menu, onClose, onAction }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    window.addEventListener('mousedown', handler);
    return () => window.removeEventListener('mousedown', handler);
  }, [onClose]);

  const items: { label: string; action: string; separator?: boolean }[] =
    menu.target.kind === 'db'
      ? [
          { label: '📋 New Table Here', action: 'new_table' },
          { label: '', action: '', separator: true },
          { label: '🔄 Refresh', action: 'refresh' },
          { label: '', action: '', separator: true },
          { label: '🗑️ Drop Database', action: 'drop_db' },
        ]
      : [
          { label: '📊 SELECT * FROM', action: 'select_all' },
          { label: '📝 Script INSERT Template', action: 'insert_template' },
          { label: '📋 Copy Table Name', action: 'copy_name' },
          { label: '📄 View DDL', action: 'view_ddl' },
          { label: '', action: '', separator: true },
          ...(menu.target.isUserDefined ? [{ label: '🗑️ Drop Table', action: 'drop_table' }] : []),
        ];

  return (
    <div
      ref={ref}
      className="win95-raised"
      style={{
        position: 'fixed',
        top: menu.y, left: menu.x,
        zIndex: 99999,
        minWidth: 170,
        background: 'var(--w95-gray,#c0c0c0)',
        border: '2px solid',
        borderColor: '#fff #808080 #808080 #fff',
        boxShadow: '2px 2px 0 #000',
        padding: '2px 0',
        fontFamily: 'var(--w95-font)',
        fontSize: 12,
      }}
    >
      {items.map((item, idx) =>
        item.separator ? (
          <div key={idx} style={{ height: 1, background: 'var(--w95-dark-gray,#808080)', margin: '2px 4px' }} />
        ) : (
          <div
            key={idx}
            style={{ padding: '3px 16px', cursor: 'pointer', color: 'var(--w95-text-color,#000)', whiteSpace: 'nowrap' }}
            onClick={() => { onAction(item.action, menu.target); onClose(); }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--w95-titlebar-active,#000080)', e.currentTarget.style.color = '#fff')}
            onMouseLeave={e => (e.currentTarget.style.background = '', e.currentTarget.style.color = 'var(--w95-text-color,#000)')}
          >
            {item.label}
          </div>
        )
      )}
    </div>
  );
};

// ── Confirm Dialog ─────────────────────────────────────────────────────────────

const ConfirmDialog: React.FC<{
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ message, onConfirm, onCancel }) => (
  <div style={{ position: 'fixed', inset: 0, zIndex: 99998, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div className="win95-raised" style={{ width: 340, background: 'var(--w95-gray,#c0c0c0)', boxShadow: '4px 4px 0 #000', fontFamily: 'var(--w95-font)', fontSize: 12 }}>
      <div style={{ background: 'var(--w95-titlebar-active,#000080)', color: '#fff', padding: '3px 8px', fontWeight: 'bold', fontSize: 11 }}>⚠️ Confirm Action</div>
      <div style={{ padding: '16px 16px 12px' }}>
        <div style={{ marginBottom: 16 }}>{message}</div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
          <button className="win95-button" style={{ minWidth: 70 }} onClick={onCancel}>Cancel</button>
          <button className="win95-button" style={{ minWidth: 80, fontWeight: 'bold' }} onClick={onConfirm}>🗑️ Confirm</button>
        </div>
      </div>
    </div>
  </div>
);

// ── Main SchemaTree Component ──────────────────────────────────────────────────

export const SchemaTree: React.FC<SchemaTreeProps> = ({
  catalog, executor, onSelectTable, onRefresh, onNewDatabase, onNewTable,
}) => {
  const { activeTheme } = useTheme();
  const isMac = activeTheme === 'macos-glass';
  const [expandedDbs, setExpandedDbs] = useState<Record<string, boolean>>({ default: true });
  const [expandedTables, setExpandedTables] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [confirmDrop, setConfirmDrop] = useState<{ message: string; onConfirm: () => void } | null>(null);
  const [viewDdlModal, setViewDdlModal] = useState<{ tableName: string; ddlSql: string } | null>(null);
  const [notification, setNotification] = useState<{ msg: string; ok: boolean } | null>(null);

  // Auto-dismiss notification
  useEffect(() => {
    if (!notification) return;
    const t = setTimeout(() => setNotification(null), 3500);
    return () => clearTimeout(t);
  }, [notification]);

  const showNotif = (msg: string, ok = true) => setNotification({ msg, ok });

  const dbNames = catalog.getDatabaseNames();

  // Filter: if search active, show all tables across dbs that match
  const getFilteredTables = (dbName: string): CatalogEntry[] => {
    const db = catalog.getDatabase(dbName);
    if (!db) return [];
    const tables = Array.from(db.tables.values());
    if (!searchQuery.trim()) return tables;
    const q = searchQuery.toLowerCase().trim();
    return tables.filter(e =>
      e.tableName.includes(q) || e.schema.columns.some(c => c.name.toLowerCase().includes(q))
    );
  };

  const generateDDL = (entry: CatalogEntry): string => {
    const cols = entry.schema.columns.map(col => {
      const isPk = col.name.toLowerCase() === 'id';
      const t = col.logicalType === 'INTEGER' ? 'INT' : col.logicalType === 'NUMERIC' ? 'DECIMAL' : col.logicalType;
      return `  ${col.name.padEnd(20)} ${t}${isPk ? ' PRIMARY KEY' : ''}`;
    }).join(',\n');
    return `CREATE TABLE ${entry.tableName} (\n${cols}\n);`;
  };

  // ── Context Menu actions ───────────────────────────────────────────────────

  const handleContextAction = async (action: string, target: CtxTarget) => {
    if (action === 'refresh') { onRefresh(); return; }
    if (action === 'new_table') { onNewTable(target.kind === 'db' ? target.dbName : 'default'); return; }

    if (action === 'select_all' && target.kind === 'table') {
      onSelectTable(target.tableName, `SELECT * FROM ${target.tableName};`);
      return;
    }

    if (action === 'insert_template' && target.kind === 'table') {
      const entry = catalog.get(target.tableName, target.dbName);
      if (entry) {
        const colNames = entry.schema.columns.map(c => c.name);
        const placeholders = entry.schema.columns.map(c => {
          if (c.logicalType === 'INTEGER') return '1';
          if (c.logicalType === 'NUMERIC') return '99.99';
          if (c.logicalType === 'DATE') return "'2026-01-01'";
          if (c.logicalType === 'BOOLEAN') return '1';
          return `'Sample ${c.name}'`;
        });
        const sql = `INSERT INTO ${target.tableName} (${colNames.join(', ')})\nVALUES (${placeholders.join(', ')});`;
        onSelectTable(target.tableName, sql);
      }
      return;
    }

    if (action === 'copy_name' && target.kind === 'table') {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(target.tableName);
        showNotif(`📋 Copied "${target.tableName}" to clipboard.`);
      }
      return;
    }

    if (action === 'view_ddl' && target.kind === 'table') {
      const entry = catalog.get(target.tableName, target.dbName);
      if (entry) setViewDdlModal({ tableName: target.tableName, ddlSql: generateDDL(entry) });
      return;
    }

    if (action === 'drop_table' && target.kind === 'table') {
      setConfirmDrop({
        message: `Drop table "${target.tableName}"? This cannot be undone.`,
        onConfirm: async () => {
          setConfirmDrop(null);
          const ok = await executor.dropUserTable(target.tableName, target.dbName);
          showNotif(ok ? `✅ Table "${target.tableName}" dropped.` : `❌ Could not drop "${target.tableName}".`, ok);
          onRefresh();
        },
      });
      return;
    }

    if (action === 'drop_db' && target.kind === 'db') {
      if (target.dbName === 'default') { showNotif('❌ Cannot drop the default database.', false); return; }
      setConfirmDrop({
        message: `Drop database "${target.dbName}" and ALL its tables? This cannot be undone.`,
        onConfirm: async () => {
          setConfirmDrop(null);
          const ok = await executor.dropUserDatabase(target.dbName);
          showNotif(ok ? `✅ Database "${target.dbName}" dropped.` : `❌ Could not drop "${target.dbName}".`, ok);
          onRefresh();
        },
      });
      return;
    }
  };

  const handleDbContextMenu = (e: React.MouseEvent, dbName: string) => {
    e.preventDefault(); e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, target: { kind: 'db', dbName } });
  };

  const handleTableContextMenu = (e: React.MouseEvent, entry: CatalogEntry) => {
    e.preventDefault(); e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, target: { kind: 'table', tableName: entry.tableName, dbName: entry.dbName ?? 'default', isUserDefined: entry.isUserDefined } });
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div
      className="win95-inset"
      style={{ width: '100%', height: '100%', background: 'var(--w95-sunken-bg,#fff)', color: 'var(--w95-sunken-text,#000)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
    >
      {/* Header */}
      <div
        style={{
          background: isMac ? 'rgba(255, 255, 255, 0.04)' : 'var(--w95-gray,#c0c0c0)',
          color: isMac ? '#f8fafc' : 'var(--w95-text-color,#000)',
          padding: isMac ? '6px 10px' : '3px 5px',
          borderBottom: isMac ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid var(--w95-dark-gray,#808080)',
          fontWeight: isMac ? 700 : 'bold',
          fontSize: isMac ? 12 : 11,
          letterSpacing: isMac ? '0.03em' : 'normal',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 6,
          flexShrink: 0,
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>🗂️ DATABASE NAVIGATOR</span>
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            className="win95-button"
            style={{
              padding: isMac ? '2px 8px' : '0 5px',
              fontSize: isMac ? 11 : 9,
              minHeight: isMac ? 22 : 18,
              borderRadius: isMac ? 6 : 0,
              cursor: 'pointer',
            }}
            onClick={onNewDatabase}
            title="Create new database"
          >
            🗄️ New DB
          </button>
          <button
            className="win95-button"
            style={{
              padding: isMac ? '2px 6px' : '0 4px',
              fontSize: isMac ? 11 : 9,
              minHeight: isMac ? 22 : 18,
              borderRadius: isMac ? 6 : 0,
              cursor: 'pointer',
            }}
            onClick={onRefresh}
            title="Refresh"
          >
            🔄
          </button>
        </div>
      </div>

      {/* Search */}
      <div
        style={{
          padding: isMac ? '6px 8px' : '3px 4px',
          background: isMac ? 'transparent' : 'var(--w95-light-gray,#e0e0e0)',
          borderBottom: isMac ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid var(--w95-gray,#c0c0c0)',
          flexShrink: 0,
        }}
      >
        <input
          type="text"
          className="win95-sunken"
          placeholder="🔍 Filter tables / columns..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: isMac ? '5px 10px' : '1px 4px',
            fontSize: isMac ? 12 : 10,
            height: isMac ? 28 : 'auto',
            borderRadius: isMac ? 8 : 0,
            boxSizing: 'border-box',
            background: isMac ? 'rgba(10, 15, 26, 0.85)' : 'var(--w95-sunken-bg,#fff)',
            color: isMac ? '#f8fafc' : 'var(--w95-sunken-text,#000)',
          }}
        />
      </div>

      {/* Notification bar */}
      {notification && (
        <div style={{ padding: '3px 6px', fontSize: 11, background: notification.ok ? '#dfffdf' : '#ffe0e0', borderBottom: '1px solid #888', flexShrink: 0 }}>
          {notification.msg}
        </div>
      )}

      {/* Tree Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: isMac ? '8px 6px' : '4px 2px' }}>
        {/* Server root node */}
        <div
          style={{
            padding: isMac ? '6px 8px' : '2px 4px',
            fontWeight: isMac ? 700 : 'bold',
            fontSize: isMac ? 13 : 11,
            color: isMac ? '#38bdf8' : 'var(--w95-titlebar-active,#000080)',
            display: 'flex',
            alignItems: 'center',
            gap: isMac ? 8 : 4,
            borderRadius: isMac ? 6 : 0,
            background: isMac ? 'rgba(56, 189, 248, 0.08)' : 'transparent',
            marginBottom: isMac ? 4 : 0,
          }}
        >
          <span style={{ fontSize: isMac ? 16 : 13 }}>🖥️</span>
          <span>ExNihilo Session</span>
        </div>

        {/* Database nodes */}
        {dbNames.map(dbName => {
          const isDbExpanded = searchQuery.trim() ? true : Boolean(expandedDbs[dbName]);
          const tables = getFilteredTables(dbName);
          const db = catalog.getDatabase(dbName);
          const viewCount = db ? db.views.size : 0;

          return (
            <div
              key={dbName}
              style={{
                marginLeft: isMac ? 10 : 8,
                borderLeft: isMac ? '1px solid rgba(255, 255, 255, 0.12)' : '1px dotted var(--w95-dark-gray,#aaa)',
                paddingLeft: isMac ? 6 : 4,
                marginBottom: isMac ? 4 : 0,
              }}
            >
              {/* DB row */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: isMac ? 6 : 4,
                  padding: isMac ? '5px 8px' : '2px 3px',
                  cursor: 'pointer',
                  borderRadius: isMac ? 6 : 1,
                  userSelect: 'none',
                  background: isMac ? 'rgba(255, 255, 255, 0.04)' : 'transparent',
                  transition: 'background 0.15s ease',
                }}
                onClick={() => setExpandedDbs(prev => ({ ...prev, [dbName]: !prev[dbName] }))}
                onContextMenu={e => handleDbContextMenu(e, dbName)}
                title={`Right-click for database options`}
              >
                <span
                  style={{
                    fontSize: isMac ? 10 : 9,
                    fontWeight: 'bold',
                    color: isMac ? '#94a3b8' : 'var(--w95-dark-gray,#555)',
                    minWidth: 12,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {isDbExpanded ? '▼' : '▶'}
                </span>
                <span style={{ fontSize: isMac ? 14 : 12 }}>🗄️</span>
                <span
                  style={{
                    fontWeight: isMac ? 600 : 'bold',
                    fontSize: isMac ? 13 : 11,
                    flex: 1,
                    color: isMac ? '#f8fafc' : 'var(--w95-sunken-text,#000)',
                  }}
                >
                  {dbName}
                </span>
                <span
                  style={{
                    fontSize: isMac ? 11 : 9,
                    color: isMac ? '#94a3b8' : 'var(--w95-dark-gray,#888)',
                  }}
                >
                  ({tables.length} tbl{tables.length !== 1 ? 's' : ''}{viewCount > 0 ? `, ${viewCount} views` : ''})
                </span>
              </div>

              {/* Tables sub-tree */}
              {isDbExpanded && (
                <div
                  style={{
                    marginLeft: isMac ? 14 : 12,
                    borderLeft: isMac ? '1px solid rgba(255, 255, 255, 0.1)' : '1px dotted #bbb',
                    paddingLeft: isMac ? 6 : 4,
                    marginTop: isMac ? 2 : 0,
                  }}
                >
                  {/* "New Table" shortcut */}
                  <div
                    style={{
                      padding: isMac ? '4px 6px' : '1px 3px',
                      fontSize: isMac ? 12 : 10,
                      fontWeight: isMac ? 500 : 'normal',
                      color: isMac ? '#38bdf8' : 'var(--w95-titlebar-active,#000080)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: isMac ? 5 : 3,
                      borderRadius: isMac ? 4 : 0,
                      transition: 'opacity 0.15s ease',
                    }}
                    onClick={() => onNewTable(dbName)}
                    title="Create a new table in this database"
                  >
                    <span style={{ fontSize: isMac ? 12 : 10 }}>➕</span>
                    <span style={{ textDecoration: 'underline' }}>New Table</span>
                  </div>

                  {tables.length === 0 ? (
                    <div
                      style={{
                        fontSize: isMac ? 12 : 10,
                        color: isMac ? '#64748b' : 'var(--w95-dark-gray,#aaa)',
                        padding: isMac ? '6px 8px' : '3px 4px',
                        fontStyle: 'italic',
                      }}
                    >
                      {searchQuery ? 'No matches.' : 'No tables yet.'}
                    </div>
                  ) : (
                    tables.map(entry => {
                      const key = `${dbName}.${entry.tableName}`;
                      const isTableExpanded = Boolean(expandedTables[key]) || Boolean(searchQuery.trim());

                      return (
                        <div key={key}>
                          {/* Table row */}
                          <div
                            className="win95-tree-item"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: isMac ? 6 : 3,
                              padding: isMac ? '4px 6px' : '2px 3px',
                              cursor: 'pointer',
                              borderRadius: isMac ? 6 : 0,
                            }}
                            onClick={() => onSelectTable(entry.tableName, `SELECT * FROM ${entry.tableName};`)}
                            onContextMenu={e => handleTableContextMenu(e, entry)}
                            draggable={true}
                            onDragStart={e => {
                              e.dataTransfer.setData('text/plain', `SELECT * FROM ${entry.tableName};\n`);
                            }}
                            data-cursor={`📊 Table: ${entry.tableName} (${entry.rowCount} rows)`}
                            title="Left-click to SELECT • Drag to insert SQL"
                          >
                            <span
                              style={{
                                fontSize: isMac ? 10 : 9,
                                minWidth: 12,
                                textAlign: 'center',
                                color: isMac ? '#94a3b8' : 'var(--w95-dark-gray,#555)',
                                cursor: 'pointer',
                              }}
                              onClick={e => { e.stopPropagation(); setExpandedTables(prev => ({ ...prev, [key]: !prev[key] })); }}
                            >
                              {isTableExpanded ? '▼' : '▶'}
                            </span>
                            <span style={{ fontSize: isMac ? 14 : 12 }}>{entry.isUserDefined ? '📋' : '🗃️'}</span>
                            <span
                              style={{
                                flex: 1,
                                fontWeight: isMac ? 600 : 'bold',
                                fontSize: isMac ? 13 : 11,
                                color: isMac ? '#f8fafc' : 'var(--w95-titlebar-active,#000080)',
                              }}
                            >
                              {entry.tableName}
                            </span>
                            <span
                              style={{
                                fontSize: isMac ? 11 : 9,
                                background: isMac ? 'rgba(255, 255, 255, 0.08)' : 'var(--w95-gray,#e0e0e0)',
                                color: isMac ? '#cbd5e1' : 'var(--w95-text-color,#333)',
                                padding: isMac ? '1px 5px' : '0 3px',
                                border: isMac ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid var(--w95-dark-gray,#aaa)',
                                borderRadius: isMac ? 4 : 0,
                              }}
                            >
                              {entry.rowCount}r
                            </span>
                            {entry.isUserDefined && (
                              <span
                                style={{
                                  fontSize: isMac ? 11 : 9,
                                  background: isMac ? 'rgba(234, 179, 8, 0.2)' : '#ffe0a0',
                                  color: isMac ? '#fde047' : '#664400',
                                  padding: isMac ? '1px 5px' : '0 3px',
                                  border: isMac ? '1px solid rgba(234, 179, 8, 0.4)' : '1px solid #c8a000',
                                  borderRadius: isMac ? 4 : 0,
                                }}
                                title="User-defined table"
                              >
                                usr
                              </span>
                            )}
                          </div>

                          {/* Columns sub-tree */}
                          {isTableExpanded && (
                            <div
                              style={{
                                marginLeft: isMac ? 20 : 20,
                                borderLeft: isMac ? '1px solid rgba(255, 255, 255, 0.1)' : '1px dotted #bbb',
                                paddingLeft: isMac ? 6 : 5,
                                marginBottom: isMac ? 4 : 2,
                              }}
                            >
                              <div
                                style={{
                                  fontSize: isMac ? 11 : 9,
                                  fontWeight: isMac ? 600 : 'bold',
                                  color: isMac ? '#94a3b8' : 'var(--w95-dark-gray,#555)',
                                  marginBottom: 2,
                                  padding: isMac ? '2px 0' : 0,
                                }}
                              >
                                📂 Columns ({entry.schema.columns.length})
                              </div>
                              {entry.schema.columns.map(col => {
                                const isPk = col.name.toLowerCase() === 'id';
                                const isFk = col.name.toLowerCase().endsWith('_id') && !isPk;
                                return (
                                  <div
                                    key={col.name}
                                    style={{
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      padding: isMac ? '2px 4px' : '1px 3px',
                                      fontSize: isMac ? 12 : 10,
                                      cursor: 'pointer',
                                      borderRadius: isMac ? 4 : 0,
                                    }}
                                    onClick={e => { e.stopPropagation(); onSelectTable(entry.tableName, `SELECT ${col.name} FROM ${entry.tableName};`); }}
                                    draggable={true}
                                    onDragStart={e => {
                                      e.dataTransfer.setData('text/plain', col.name);
                                    }}
                                    data-cursor={`Column: ${col.name} (${col.logicalType.toLowerCase()}${isPk ? ' PK' : ''})`}
                                    title={`SELECT ${col.name} • Drag column name`}
                                  >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: isMac ? 5 : 3 }}>
                                      <span style={{ fontSize: isMac ? 13 : 11 }}>{isPk ? '🔑' : isFk ? '🔗' : '📄'}</span>
                                      <span
                                        style={{
                                          fontWeight: isPk || isFk ? (isMac ? 600 : 'bold') : 'normal',
                                          color: isMac ? '#e2e8f0' : 'var(--w95-sunken-text,#000)',
                                        }}
                                      >
                                        {col.name}
                                      </span>
                                    </div>
                                    <span
                                      style={{
                                        fontSize: isMac ? 11 : 9,
                                        color: isMac ? '#94a3b8' : 'var(--w95-dark-gray,#666)',
                                        fontStyle: 'italic',
                                      }}
                                    >
                                      {col.logicalType.toLowerCase()}
                                    </span>
                                  </div>
                                );
                              })}
                              {/* Triggers */}
                              {entry.triggers && entry.triggers.length > 0 && (
                                <div
                                  style={{
                                    marginTop: isMac ? 4 : 3,
                                    borderTop: isMac ? '1px solid rgba(255, 255, 255, 0.1)' : '1px dotted #bbb',
                                    paddingTop: 2,
                                  }}
                                >
                                  <div
                                    style={{
                                      fontSize: isMac ? 11 : 9,
                                      fontWeight: isMac ? 600 : 'bold',
                                      color: isMac ? '#94a3b8' : 'var(--w95-dark-gray,#555)',
                                      marginBottom: 1,
                                    }}
                                  >
                                    ⚡ Triggers ({entry.triggers.length})
                                  </div>
                                  {entry.triggers.map(tr => (
                                    <div
                                      key={tr}
                                      style={{
                                        fontSize: isMac ? 11 : 10,
                                        padding: '1px 3px',
                                        color: isMac ? '#cbd5e1' : 'var(--w95-dark-gray,#555)',
                                      }}
                                    >
                                      ⚡ {tr}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}

                  {/* Views sub-tree */}
                  {viewCount > 0 && !searchQuery && (
                    <div
                      style={{
                        padding: isMac ? '3px 6px' : '1px 3px',
                        fontSize: isMac ? 11 : 10,
                        color: isMac ? '#94a3b8' : 'var(--w95-dark-gray,#555)',
                        marginTop: 2,
                      }}
                    >
                      <span>👁️ {viewCount} view{viewCount !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          menu={contextMenu}
          onClose={() => setContextMenu(null)}
          onAction={handleContextAction}
        />
      )}

      {/* Confirm Drop Dialog */}
      {confirmDrop && (
        <ConfirmDialog
          message={confirmDrop.message}
          onConfirm={confirmDrop.onConfirm}
          onCancel={() => setConfirmDrop(null)}
        />
      )}

      {/* DDL Modal */}
      {viewDdlModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999999 }}>
          <div className="win95-window" style={{ width: 440, boxShadow: '4px 4px 10px rgba(0,0,0,0.5)' }}>
            <div className="win95-titlebar">
              <div className="win95-titlebar-text"><span>📄</span><span>DDL — {viewDdlModal.tableName}</span></div>
              <div className="win95-titlebar-controls">
                <button className="win95-btn-titlebar" onClick={() => setViewDdlModal(null)}>✕</button>
              </div>
            </div>
            <div style={{ padding: 12 }}>
              <textarea
                readOnly className="win95-sunken"
                value={viewDdlModal.ddlSql}
                style={{ width: '100%', height: 140, fontFamily: 'monospace', fontSize: 11, padding: 6, boxSizing: 'border-box', background: 'var(--w95-sunken-bg,#fff)', color: 'var(--w95-sunken-text,#000)' }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, marginTop: 10 }}>
                <button className="win95-button" onClick={() => navigator.clipboard?.writeText(viewDdlModal.ddlSql)}>📋 Copy</button>
                <button className="win95-button" style={{ fontWeight: 'bold' }} onClick={() => setViewDdlModal(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
