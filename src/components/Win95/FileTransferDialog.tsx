/**
 * FileTransferDialog.tsx — Windows 95 Authentic Open & Save As Common Dialog
 * Supports browsing virtual files, local disk browsing (FileReader), and exporting queries/databases/CSVs.
 */

'use client';

import React, { useState, useRef } from 'react';
import { useDraggable } from '../../hooks/useDraggable';
import { WindowControls } from './WindowControls';
import type { ExecutionSuccess } from '../../engine/executor';
import { sqlWorkerClient } from '../../engine/worker/SQLWorkerClient';

export type FileDialogMode = 'open' | 'save';

interface VirtualFile {
  name: string;
  size: string;
  type: 'sql' | 'csv' | 'json' | 'sqlite';
  date: string;
  content: string;
}

const SAMPLE_VIRTUAL_FILES: VirtualFile[] = [
  {
    name: 'orders_analytics.sql',
    size: '4.2 KB',
    type: 'sql',
    date: '08/24/95 09:15 AM',
    content: `-- Orders and Customer Revenue Analytics
SELECT 
    c.name AS customer_name,
    COUNT(o.id) AS total_orders,
    ROUND(SUM(o.total), 2) AS total_spent,
    AVG(o.total) AS average_order_value
FROM customers c
INNER JOIN orders o ON c.id = o.customer_id
GROUP BY c.name
HAVING COUNT(o.id) > 1
ORDER BY total_spent DESC;`,
  },
  {
    name: 'employee_hierarchy.sql',
    size: '3.1 KB',
    type: 'sql',
    date: '08/24/95 10:20 AM',
    content: `-- Department Salary Breakdown and Ranking
SELECT 
    e.name,
    e.department,
    e.salary,
    RANK() OVER (PARTITION BY e.department ORDER BY e.salary DESC) AS salary_rank,
    ROUND(AVG(e.salary) OVER (PARTITION BY e.department), 2) AS dept_avg_salary
FROM employees e
WHERE e.status = 'ACTIVE';`,
  },
  {
    name: 'ecommerce_star_schema.sql',
    size: '6.5 KB',
    type: 'sql',
    date: '08/24/95 11:45 AM',
    content: `-- Multi-Table Star Schema Analysis
SELECT 
    p.category,
    p.title AS product_name,
    SUM(oi.quantity) AS units_sold,
    SUM(oi.quantity * oi.unit_price) AS gross_revenue
FROM order_items oi
JOIN products p ON oi.product_id = p.id
JOIN orders o ON oi.order_id = o.id
WHERE o.created_at >= '1995-01-01'
GROUP BY p.category, p.title
ORDER BY gross_revenue DESC
LIMIT 10;`,
  },
  {
    name: 'inventory_snapshot.csv',
    size: '1.8 KB',
    type: 'csv',
    date: '08/24/95 02:10 PM',
    content: `id,sku,product_name,stock_qty,warehouse_zone,unit_cost
1,SKU-9501,486-DX2 CPU,140,ZONE-A,199.99
2,SKU-9502,16MB EDO RAM,320,ZONE-A,89.50
3,SKU-9503,1.44MB Floppy Drive,500,ZONE-B,24.00
4,SKU-9504,SoundBlaster 16 ISA,75,ZONE-C,129.95`,
  },
  {
    name: 'system_log_archive.json',
    size: '2.4 KB',
    type: 'json',
    date: '08/24/95 04:30 PM',
    content: JSON.stringify(
      [
        { timestamp: '1995-08-24T09:00:00Z', event: 'BOOT', status: 'OK', subsystem: 'KERNEL32' },
        { timestamp: '1995-08-24T09:00:02Z', event: 'DIALUP', status: 'CONNECTED', speed: 28800 },
        { timestamp: '1995-08-24T09:01:15Z', event: 'SQL_INIT', engine: 'SQLite-WASM', memory: '16MB' },
      ],
      null,
      2
    ),
  },
];

interface FileTransferDialogProps {
  isOpen: boolean;
  mode: FileDialogMode;
  onClose: () => void;
  onOpenSqlFile?: (content: string, fileName: string) => void;
  currentQueryText?: string;
  currentResult?: ExecutionSuccess | null;
  executor?: any;
  zIndex?: number;
}

export const FileTransferDialog: React.FC<FileTransferDialogProps> = ({
  isOpen,
  mode,
  onClose,
  onOpenSqlFile,
  currentQueryText = '',
  currentResult = null,
  executor,
  zIndex = 99998,
}) => {
  const { position, handleMouseDown } = useDraggable({ x: 180, y: 110 });
  const [selectedFolder, setSelectedFolder] = useState<string>('C:\\EXNIHILO\\QUERIES');
  const [fileName, setFileName] = useState<string>(
    mode === 'save' ? 'query_export.sql' : 'orders_analytics.sql'
  );
  const [fileType, setFileType] = useState<string>('sql');
  const [selectedVirtualFile, setSelectedVirtualFile] = useState<VirtualFile | null>(
    mode === 'open' ? SAMPLE_VIRTUAL_FILES[0] : null
  );
  const [isDragOver, setIsDragOver] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const triggerDownload = (blob: Blob, name: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSave = async () => {
    let finalName = fileName.trim() || 'export_file';
    let blob: Blob;

    if (fileType === 'sql') {
      if (!finalName.toLowerCase().endsWith('.sql')) finalName += '.sql';
      blob = new Blob([currentQueryText], { type: 'text/plain;charset=utf-8' });
      triggerDownload(blob, finalName);
    } else if (fileType === 'sqlite') {
      if (!finalName.toLowerCase().endsWith('.sqlite') && !finalName.toLowerCase().endsWith('.db')) {
        finalName += '.sqlite';
      }
      const binary = await sqlWorkerClient.exportDatabaseBinary();
      if (!binary || binary.byteLength === 0) {
        setFeedback('⚠️ In-memory database has no tables yet. Run a query first.');
        setTimeout(() => setFeedback(null), 3000);
        return;
      }
      const arrayBuffer = binary.buffer.slice(binary.byteOffset, binary.byteOffset + binary.byteLength) as ArrayBuffer;
      blob = new Blob([arrayBuffer], { type: 'application/vnd.sqlite3' });
      triggerDownload(blob, finalName);
    } else if (fileType === 'csv') {
      if (!finalName.toLowerCase().endsWith('.csv')) finalName += '.csv';
      if (!currentResult || !currentResult.columns || currentResult.columns.length === 0) {
        setFeedback('⚠️ No query results to export as CSV. Execute a query first.');
        setTimeout(() => setFeedback(null), 3000);
        return;
      }
      const header = currentResult.columns.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',');
      const rows = currentResult.rows
        .map((r) =>
          currentResult.columns
            .map((c, i) => {
              const val = Array.isArray(r) ? r[i] : (r as Record<string, any>)[c];
              if (val === null || val === undefined) return '""';
              const str = String(val).replace(/"/g, '""');
              return `"${str}"`;
            })
            .join(',')
        )
        .join('\n');
      blob = new Blob([`${header}\n${rows}`], { type: 'text/csv;charset=utf-8' });
      triggerDownload(blob, finalName);
    } else if (fileType === 'json') {
      if (!finalName.toLowerCase().endsWith('.json')) finalName += '.json';
      let data: any = { query: currentQueryText };
      if (currentResult && currentResult.rows) {
        data = currentResult.rows.map((r) => {
          const obj: Record<string, any> = {};
          currentResult.columns.forEach((col, i) => {
            obj[col] = Array.isArray(r) ? r[i] : (r as Record<string, any>)[col];
          });
          return obj;
        });
      }
      blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
      triggerDownload(blob, finalName);
    }

    setFeedback(`Saved ${finalName} successfully.`);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  const handleOpenSelected = () => {
    if (selectedVirtualFile && onOpenSqlFile) {
      onOpenSqlFile(selectedVirtualFile.content, selectedVirtualFile.name);
      onClose();
    }
  };

  const handleLocalFileChosen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string' && onOpenSqlFile) {
        onOpenSqlFile(text, file.name);
        onClose();
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string' && onOpenSqlFile) {
        onOpenSqlFile(text, file.name);
        onClose();
      }
    };
    reader.readAsText(file);
  };

  return (
    <div
      className="win95-window"
      style={{
        position: 'fixed',
        top: `${position.y}px`,
        left: `${position.x}px`,
        width: '490px',
        maxWidth: '96vw',
        zIndex,
        boxShadow: '4px 4px 20px rgba(0,0,0,0.6)',
      }}
      role="dialog"
      aria-label={mode === 'open' ? 'Open File' : 'Save As'}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
    >
      {/* Titlebar */}
      <div
        className="win95-titlebar"
        onMouseDown={handleMouseDown}
        style={{ cursor: 'move' }}
      >
        <div className="win95-titlebar-text">
          <span>{mode === 'open' ? '📂' : '💾'}</span>
          <span>{mode === 'open' ? 'Open File' : 'Save As...'}</span>
        </div>
        <WindowControls
          showMinimize={false}
          showMaximize={false}
          onClose={onClose}
        />
      </div>

      <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {/* Look in / Save in Directory Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px' }}>
          <label htmlFor="w95-folder-select" style={{ minWidth: '55px' }}>
            {mode === 'open' ? 'Look in:' : 'Save in:'}
          </label>
          <div style={{ flex: 1, display: 'flex', gap: '4px' }}>
            <select
              id="w95-folder-select"
              className="win95-inset"
              value={selectedFolder}
              onChange={(e) => setSelectedFolder(e.target.value)}
              style={{ flex: 1, padding: '2px 4px', fontSize: '11px', background: '#fff' }}
            >
              <option value="C:\EXNIHILO\QUERIES">📂 C:\EXNIHILO\QUERIES</option>
              <option value="C:\EXNIHILO\EXPORTS">📂 C:\EXNIHILO\EXPORTS</option>
              <option value="A:\">💾 3.5" Floppy (A:)</option>
              <option value="C:\">💽 Local Disk (C:)</option>
              <option value="DESKTOP">🖥️ Desktop</option>
            </select>
            <button
              type="button"
              className="win95-button"
              title="Up One Level"
              style={{ padding: '1px 6px', fontSize: '11px' }}
              onClick={() => setSelectedFolder('C:\\')}
            >
              ⬆
            </button>
          </div>
        </div>

        {/* File Browser Grid (Sunken Inset) */}
        <div
          className="win95-inset"
          style={{
            backgroundColor: isDragOver ? '#eef7ff' : '#ffffff',
            height: '150px',
            overflowY: 'auto',
            padding: '4px',
            border: isDragOver ? '2px dashed #000080' : undefined,
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', cursor: 'pointer' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid #d0d0d0', color: '#555' }}>
                <th style={{ padding: '2px 6px' }}>Name</th>
                <th style={{ padding: '2px 6px', width: '65px' }}>Size</th>
                <th style={{ padding: '2px 6px', width: '55px' }}>Type</th>
                <th style={{ padding: '2px 6px', width: '110px' }}>Modified</th>
              </tr>
            </thead>
            <tbody>
              {SAMPLE_VIRTUAL_FILES.map((f) => {
                const isSelected = selectedVirtualFile?.name === f.name;
                const icon =
                  f.type === 'sql' ? '📜' : f.type === 'csv' ? '📊' : f.type === 'json' ? '📦' : '💾';
                return (
                  <tr
                    key={f.name}
                    style={{
                      backgroundColor: isSelected ? 'var(--w95-title-active-bg, #000080)' : 'transparent',
                      color: isSelected ? '#ffffff' : 'inherit',
                    }}
                    onClick={() => {
                      setSelectedVirtualFile(f);
                      setFileName(f.name);
                    }}
                    onDoubleClick={() => {
                      setSelectedVirtualFile(f);
                      setFileName(f.name);
                      if (mode === 'open' && onOpenSqlFile) {
                        onOpenSqlFile(f.content, f.name);
                        onClose();
                      }
                    }}
                  >
                    <td style={{ padding: '2px 6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>{icon}</span>
                      <span>{f.name}</span>
                    </td>
                    <td style={{ padding: '2px 6px' }}>{f.size}</td>
                    <td style={{ padding: '2px 6px', textTransform: 'uppercase' }}>{f.type}</td>
                    <td style={{ padding: '2px 6px' }}>{f.date}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Drag and Drop Prompt */}
        {mode === 'open' && (
          <div style={{ fontSize: '10px', color: '#555', textAlign: 'center' }}>
            💡 Double-click any file above, or drag and drop a .sql / .csv file from your computer.
          </div>
        )}

        {/* File name & File type inputs */}
        <div style={{ display: 'grid', gridTemplateColumns: '70px 1fr', gap: '6px', fontSize: '11px', alignItems: 'center' }}>
          <label htmlFor="w95-filename-input">File name:</label>
          <input
            id="w95-filename-input"
            type="text"
            className="win95-inset"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            style={{ padding: '3px 6px', fontSize: '11px', background: '#fff' }}
          />

          <label htmlFor="w95-filetype-select">
            {mode === 'open' ? 'Files of type:' : 'Save as type:'}
          </label>
          <select
            id="w95-filetype-select"
            className="win95-inset"
            value={fileType}
            onChange={(e) => setFileType(e.target.value)}
            style={{ padding: '3px 6px', fontSize: '11px', background: '#fff' }}
          >
            <option value="sql">SQL Script (*.sql)</option>
            <option value="sqlite">SQLite In-Memory Database (*.sqlite, *.db)</option>
            <option value="csv">Comma-Separated Values (*.csv)</option>
            <option value="json">JSON Dataset (*.json)</option>
          </select>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className="win95-inset"
            style={{
              padding: '4px 8px',
              fontSize: '11px',
              backgroundColor: '#ffffdf',
              color: '#000',
              fontWeight: 'bold',
            }}
          >
            {feedback}
          </div>
        )}

        {/* Footer Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '4px' }}>
          {mode === 'open' ? (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".sql,.csv,.json,.txt,.sqlite,.db"
                style={{ display: 'none' }}
                onChange={handleLocalFileChosen}
              />
              <button
                type="button"
                className="win95-button"
                style={{ fontSize: '11px', padding: '3px 10px' }}
                onClick={() => fileInputRef.current?.click()}
              >
                📂 Browse PC...
              </button>
            </div>
          ) : (
            <div style={{ fontSize: '10px', color: '#555' }}>
              Disk space free: 1.44 MB (Floppy A:)
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="win95-button"
              style={{ fontSize: '11px', padding: '3px 18px', fontWeight: 'bold' }}
              onClick={mode === 'open' ? handleOpenSelected : handleSave}
            >
              {mode === 'open' ? 'Open' : 'Save'}
            </button>
            <button
              type="button"
              className="win95-button"
              style={{ fontSize: '11px', padding: '3px 14px' }}
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
