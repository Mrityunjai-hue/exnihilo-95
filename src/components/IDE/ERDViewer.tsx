/**
 * ERDViewer.tsx — Database Relation Visualizer & Entity-Relationship Diagram Studio
 *
 * Professional interactive ERD suite featuring:
 * - Real-time schema extraction & live catalog sync
 * - Draggable table entity cards with grab titlebar handle (glitch-free)
 * - Details Inspector sidebar: column definitions, PK/FK constraints, live 5-row sample preview
 * - Relationships Tracker: inbound & outbound FK navigator with 1-click generated JOIN SQL
 * - Smooth Orthogonal / Cubic Bezier connection lines with arrowheads & cardinality badges (1:N)
 * - Canvas Panning & Zoom Controls (Zoom In, Zoom Out, Reset, Fit to View)
 * - Collision-Free Smart Auto-Layout engine
 * - SVG diagram exporter & instant sample schema generator
 * - 100% theme adaptive across macOS Obsidian Glass & Retro Windows 95/2000/XP/7
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { SessionCatalog } from '../../engine/catalog';
import { extractERDData, ERDGraphData, ERDNode, ERDLink } from '../../engine/erd_extractor';
import { useDraggable } from '../../hooks/useDraggable';
import { WindowControls } from '../Win95/WindowControls';
import { useTheme } from '../../hooks/useTheme';

export interface ERDViewerProps {
  catalog: SessionCatalog;
  executor?: any;
  isOpen?: boolean;
  isMinimized?: boolean;
  onMinimize?: () => void;
  isMaximized?: boolean;
  onMaximize?: () => void;
  zIndex?: number;
  onClose: () => void;
  onFocus?: () => void;
}

export const ERDViewer: React.FC<ERDViewerProps> = ({
  catalog,
  executor,
  isOpen = true,
  isMinimized = false,
  onMinimize,
  isMaximized = false,
  onMaximize,
  zIndex = 999999,
  onClose,
  onFocus,
}) => {
  const { activeTheme } = useTheme();
  const isMac = activeTheme === 'macos-glass';

  // Core ERD State
  const [erdData, setErdData] = useState<ERDGraphData>(() => extractERDData(catalog));
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [zoom, setZoom] = useState(1.0);

  // Selection & Details Tracking State
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [selectedLinkId, setSelectedLinkId] = useState<string | null>(null);
  const [hoveredLinkId, setHoveredLinkId] = useState<string | null>(null);
  const [showInspector, setShowInspector] = useState(true);
  const [inspectorTab, setInspectorTab] = useState<'columns' | 'relations' | 'sample'>('columns');

  // Sample Data Preview State
  const [sampleRows, setSampleRows] = useState<any[] | null>(null);
  const [sampleCols, setSampleCols] = useState<string[]>([]);
  const [sampleLoading, setSampleLoading] = useState(false);
  const [copyNotice, setCopyNotice] = useState<string | null>(null);

  // Canvas Dragging & Panning State
  const [draggingNode, setDraggingNode] = useState<{
    id: string;
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
  } | null>(null);

  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number; scrollLeft: number; scrollTop: number }>({
    x: 0,
    y: 0,
    scrollLeft: 0,
    scrollTop: 0,
  });

  const [isSeeding, setIsSeeding] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const { position, handleMouseDown: handleHeaderDrag } = useDraggable({ x: 60, y: 30 });

  // ── Auto-Layout Engine (Collision-Free Grid) ──────────────────────────────
  const calculateAutoLayout = useCallback((nodes: ERDNode[]): Record<string, { x: number; y: number }> => {
    const newPositions: Record<string, { x: number; y: number }> = {};
    const colCount = Math.max(1, Math.min(3, Math.ceil(Math.sqrt(nodes.length || 1))));
    const cardWidth = 280;
    const horizontalGap = 80;

    // Track the bottom Y coordinate of each column to avoid vertical collisions
    const colBottoms = new Array(colCount).fill(50);

    nodes.forEach((node, idx) => {
      const col = idx % colCount;
      const x = 50 + col * (cardWidth + horizontalGap);
      const y = colBottoms[col];

      newPositions[node.id] = { x, y };

      // Calculate card height: Titlebar (32px) + Columns (22px each) + Padding & Borders (24px)
      const estimatedHeight = 32 + node.columns.length * 22 + 24;
      colBottoms[col] += estimatedHeight + 50; // Add 50px buffer between rows
    });

    return newPositions;
  }, []);

  // ── Refresh & Sync ERD Data from Catalog ──────────────────────────────────
  const refreshDiagram = useCallback(() => {
    const data = extractERDData(catalog);
    setErdData(data);
    setPositions((prev) => {
      const updated = { ...prev };
      let hasMissing = false;
      data.nodes.forEach((n) => {
        if (!updated[n.id]) {
          hasMissing = true;
        }
      });
      if (hasMissing) {
        return calculateAutoLayout(data.nodes);
      }
      return updated;
    });
  }, [catalog, calculateAutoLayout]);

  useEffect(() => {
    if (isOpen) {
      refreshDiagram();
    }
  }, [isOpen, refreshDiagram]);

  // If a table is selected, auto-fetch 5 sample records
  useEffect(() => {
    if (!selectedTableId || !executor) {
      setSampleRows(null);
      setSampleCols([]);
      return;
    }

    let isSubscribed = true;
    setSampleLoading(true);

    const loadSample = async () => {
      try {
        const res = await executor.execute(`SELECT * FROM "${selectedTableId}" LIMIT 5;`, 'SQLite');
        if (isSubscribed && res && res.ok && res.rows) {
          setSampleCols(res.columns || []);
          setSampleRows(res.rows);
        } else if (isSubscribed) {
          setSampleRows([]);
          setSampleCols([]);
        }
      } catch {
        if (isSubscribed) {
          setSampleRows([]);
          setSampleCols([]);
        }
      } finally {
        if (isSubscribed) setSampleLoading(false);
      }
    };

    loadSample();

    return () => {
      isSubscribed = false;
    };
  }, [selectedTableId, executor]);

  // ── Card Dragging Handlers (Restricted to Card Titlebar) ────────────────────
  const handleMouseDownCardTitle = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onFocus?.();
    const pos = positions[id] || { x: 50, y: 50 };
    setDraggingNode({
      id,
      startX: e.clientX,
      startY: e.clientY,
      initialX: pos.x,
      initialY: pos.y,
    });
  };

  useEffect(() => {
    if (!draggingNode) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = (e.clientX - draggingNode.startX) / zoom;
      const dy = (e.clientY - draggingNode.startY) / zoom;
      setPositions((prev) => ({
        ...prev,
        [draggingNode.id]: {
          x: Math.max(10, Math.round(draggingNode.initialX + dx)),
          y: Math.max(10, Math.round(draggingNode.initialY + dy)),
        },
      }));
    };

    const handleMouseUp = () => {
      setDraggingNode(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingNode, zoom]);

  // ── Canvas Panning Handlers ───────────────────────────────────────────────
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.target !== canvasRef.current && (e.target as HTMLElement).tagName !== 'svg') {
      return;
    }
    if (!canvasRef.current) return;

    setIsPanning(true);
    setPanStart({
      x: e.clientX,
      y: e.clientY,
      scrollLeft: canvasRef.current.scrollLeft,
      scrollTop: canvasRef.current.scrollTop,
    });
  };

  useEffect(() => {
    if (!isPanning) return;

    const handlePanMove = (e: MouseEvent) => {
      if (!canvasRef.current) return;
      const dx = e.clientX - panStart.x;
      const dy = e.clientY - panStart.y;
      canvasRef.current.scrollLeft = panStart.scrollLeft - dx;
      canvasRef.current.scrollTop = panStart.scrollTop - dy;
    };

    const handlePanUp = () => {
      setIsPanning(false);
    };

    window.addEventListener('mousemove', handlePanMove);
    window.addEventListener('mouseup', handlePanUp);
    return () => {
      window.removeEventListener('mousemove', handlePanMove);
      window.removeEventListener('mouseup', handlePanUp);
    };
  }, [isPanning, panStart]);

  // ── Action: Fit to View ───────────────────────────────────────────────────
  const handleFitToView = () => {
    if (erdData.nodes.length === 0 || !canvasRef.current) return;
    const xs = erdData.nodes.map((n) => positions[n.id]?.x ?? n.x);
    const ys = erdData.nodes.map((n) => positions[n.id]?.y ?? n.y);
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);

    canvasRef.current.scrollTo({
      left: Math.max(0, minX - 40),
      top: Math.max(0, minY - 40),
      behavior: 'smooth',
    });
    setZoom(1.0);
  };

  // ── Action: Seed Sample Relational Schema (Users, Orders, Products, Items) ──
  const handleSeedSampleData = async () => {
    if (!executor) return;
    setIsSeeding(true);
    try {
      const sampleQuery = `
        SELECT 
          users.id AS user_id, 
          users.username, 
          users.email,
          orders.id AS order_id, 
          orders.total_amount, 
          orders.status AS order_status,
          products.id AS product_id,
          products.product_name, 
          products.price,
          order_items.quantity
        FROM users
        JOIN orders ON users.id = orders.user_id
        JOIN order_items ON orders.id = order_items.order_id
        JOIN products ON order_items.product_id = products.id;
      `;
      await executor.execute(sampleQuery, 'PostgreSQL');
      const refreshedData = extractERDData(catalog);
      setErdData(refreshedData);
      setPositions(calculateAutoLayout(refreshedData.nodes));
      if (refreshedData.nodes.length > 0) {
        setSelectedTableId(refreshedData.nodes[0].id);
      }
    } catch (err) {
      console.error('Failed to seed sample schema:', err);
    } finally {
      setIsSeeding(false);
    }
  };

  // ── Action: Export SVG ────────────────────────────────────────────────────
  const handleExportSVG = () => {
    if (!canvasRef.current) return;
    const svgElem = canvasRef.current.querySelector('#erd-diagram-svg');
    if (!svgElem) return;

    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svgElem);
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ExNihilo_ERD_${Date.now()}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // ── Clipboard Toast Helper ────────────────────────────────────────────────
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    setCopyNotice(`Copied ${label}!`);
    setTimeout(() => setCopyNotice(null), 2500);
  };

  // ── Filtered Nodes via Search Box ─────────────────────────────────────────
  const filteredNodes = useMemo(() => {
    if (!searchQuery.trim()) return erdData.nodes;
    const q = searchQuery.toLowerCase().trim();
    return erdData.nodes.filter(
      (node) =>
        node.tableName.toLowerCase().includes(q) ||
        node.columns.some((c) => c.name.toLowerCase().includes(q) || c.type.toLowerCase().includes(q))
    );
  }, [erdData.nodes, searchQuery]);

  // Selected Table Entity details
  const selectedNode = useMemo(
    () => erdData.nodes.find((n) => n.id === selectedTableId),
    [erdData.nodes, selectedTableId]
  );

  // Selected Link details
  const selectedLink = useMemo(
    () => erdData.links.find((l) => l.id === selectedLinkId),
    [erdData.links, selectedLinkId]
  );

  // Related Links for the Selected Table
  const tableLinks = useMemo(() => {
    if (!selectedTableId) return { inbound: [], outbound: [] };
    const outbound = erdData.links.filter((l) => l.sourceTable === selectedTableId);
    const inbound = erdData.links.filter((l) => l.targetTable === selectedTableId);
    return { inbound, outbound };
  }, [erdData.links, selectedTableId]);

  if (!isOpen || isMinimized) return null;

  const windowStyle: React.CSSProperties = isMaximized
    ? {
        position: 'fixed',
        top: isMac ? '28px' : '0px',
        left: '0px',
        width: '100vw',
        height: isMac ? 'calc(100vh - 28px)' : 'calc(100vh - 28px)',
        zIndex,
        display: 'flex',
        flexDirection: 'column',
      }
    : {
        position: 'absolute',
        top: `${position.y}px`,
        left: `${position.x}px`,
        width: 'min(1140px, 95vw)',
        height: 'min(780px, 88vh)',
        zIndex,
        display: 'flex',
        flexDirection: 'column',
      };

  return (
    <div
      id="erd-window"
      className="win95-window"
      style={windowStyle}
      onMouseDown={onFocus}
    >
      {/* ── Window Titlebar ────────────────────────────────────────────── */}
      <div
        className="win95-titlebar"
        onMouseDown={(e) => {
          onFocus?.();
          if (!isMaximized) handleHeaderDrag(e);
        }}
        style={{ cursor: isMaximized ? 'default' : 'move' }}
      >
        <div className="win95-titlebar-text">
          <span>🌐</span>
          <span>Database Relation Visualizer &amp; Entity-Relationship Diagram (ERD Studio)</span>
        </div>
        <WindowControls
          showMinimize={true}
          showMaximize={true}
          isMaximized={isMaximized}
          onMinimize={onMinimize}
          onMaximize={onMaximize}
          onClose={onClose}
        />
      </div>

      {/* ── Toolbar Controls Strip ─────────────────────────────────────── */}
      <div
        style={{
          background: isMac ? 'rgba(30, 41, 59, 0.7)' : 'var(--w95-gray, #c0c0c0)',
          padding: '6px 10px',
          borderBottom: isMac ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid #808080',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          flexWrap: 'wrap',
          flexShrink: 0,
        }}
      >
        {/* Left Toolbar Tools */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <input
            type="text"
            className="win95-sunken"
            placeholder="🔍 Search tables or columns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '210px',
              padding: '3px 6px',
              fontSize: '11px',
              background: 'var(--w95-sunken-bg, #ffffff)',
              color: 'var(--w95-sunken-text, #000000)',
            }}
          />

          <button
            className="win95-button"
            style={{ padding: '2px 8px', fontSize: '11px' }}
            onClick={refreshDiagram}
            title="Refresh tables and schema relations from session catalog"
          >
            🔄 Refresh
          </button>

          <button
            className="win95-button"
            style={{ padding: '2px 8px', fontSize: '11px' }}
            onClick={() => setPositions(calculateAutoLayout(erdData.nodes))}
            title="Automatically rearrange table cards to eliminate overlaps"
          >
            📐 Auto Layout
          </button>

          <button
            className="win95-button"
            style={{ padding: '2px 8px', fontSize: '11px' }}
            onClick={handleFitToView}
            title="Center and fit all tables in canvas"
          >
            🎯 Fit View
          </button>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
            <button
              className="win95-button"
              style={{ padding: '2px 6px', fontSize: '11px' }}
              onClick={() => setZoom((z) => Math.min(z + 0.15, 2.0))}
              title="Zoom In"
            >
              ➕
            </button>
            <span style={{ fontSize: '11px', minWidth: '40px', textAlign: 'center', fontFamily: 'var(--w95-mono)' }}>
              {Math.round(zoom * 100)}%
            </span>
            <button
              className="win95-button"
              style={{ padding: '2px 6px', fontSize: '11px' }}
              onClick={() => setZoom((z) => Math.max(z - 0.15, 0.4))}
              title="Zoom Out"
            >
              ➖
            </button>
            <button
              className="win95-button"
              style={{ padding: '2px 6px', fontSize: '11px' }}
              onClick={() => setZoom(1.0)}
              title="Reset Zoom to 100%"
            >
              1:1
            </button>
          </div>

          {executor && (
            <button
              className="win95-button"
              style={{
                padding: '2px 8px',
                fontSize: '11px',
                fontWeight: 'bold',
                background: isMac ? 'rgba(14, 165, 233, 0.25)' : 'var(--w95-title-active-bg, #000080)',
                color: '#ffffff',
              }}
              onClick={handleSeedSampleData}
              disabled={isSeeding}
              title="Automatically generate a rich 4-table relational e-commerce schema with foreign key links"
            >
              {isSeeding ? '⏳ Generating...' : '⚡ Seed Sample Schema'}
            </button>
          )}
        </div>

        {/* Right Toolbar Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {copyNotice && (
            <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 'bold' }}>
              ✓ {copyNotice}
            </span>
          )}

          <span style={{ fontSize: '11px', color: isMac ? '#94a3b8' : 'var(--w95-dark-gray, #444)' }}>
            Tables: <strong>{filteredNodes.length}</strong> | Relations: <strong>{erdData.links.length}</strong>
          </span>

          <button
            className="win95-button"
            style={{
              padding: '2px 8px',
              fontSize: '11px',
              fontWeight: showInspector ? 'bold' : 'normal',
              background: showInspector ? (isMac ? 'rgba(56, 189, 248, 0.2)' : '#dfdfdf') : undefined,
            }}
            onClick={() => setShowInspector((prev) => !prev)}
            title="Toggle Details Inspector sidebar"
          >
            📋 Details Inspector
          </button>

          <button
            className="win95-button"
            style={{ padding: '2px 8px', fontSize: '11px' }}
            onClick={handleExportSVG}
            title="Export interactive ERD diagram as clean standalone SVG vector image"
          >
            🖼️ Export SVG
          </button>
        </div>
      </div>

      {/* ── Main Viewport Splitter (Canvas + Inspector) ─────────────────── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        {/* Left Side: Infinite Zoomable & Pannable Canvas */}
        <div
          ref={canvasRef}
          className="win95-sunken"
          onMouseDown={handleCanvasMouseDown}
          style={{
            flex: 1,
            position: 'relative',
            overflow: 'auto',
            background: isMac ? 'rgba(15, 18, 26, 0.95)' : 'var(--w95-sunken-bg, #ffffff)',
            color: 'var(--w95-sunken-text, #000000)',
            cursor: isPanning ? 'grabbing' : 'default',
            userSelect: 'none',
          }}
        >
          {/* Subtle Grid Paper Pattern */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '4000px',
              height: '3000px',
              backgroundImage: isMac
                ? 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)'
                : 'radial-gradient(circle, rgba(0,0,0,0.06) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
              pointerEvents: 'none',
            }}
          />

          {/* Empty State Banner if no tables loaded yet */}
          {filteredNodes.length === 0 && (
            <div
              style={{
                position: 'absolute',
                top: '40%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                background: isMac ? 'rgba(28, 28, 34, 0.95)' : 'var(--w95-gray, #c0c0c0)',
                color: 'var(--w95-text-color, #000000)',
                padding: '30px 40px',
                borderRadius: isMac ? '16px' : '0',
                border: isMac ? '1px solid rgba(255, 255, 255, 0.18)' : '2px outset #ffffff',
                boxShadow: '0 16px 36px rgba(0, 0, 0, 0.35)',
                maxWidth: '520px',
                zIndex: 10,
              }}
            >
              <div style={{ fontSize: '48px', marginBottom: '8px' }}>🌐</div>
              <h3 style={{ margin: '0 0 6px 0', fontSize: '16px' }}>No Relational Tables Loaded Yet</h3>
              <p style={{ fontSize: '11.5px', opacity: 0.85, lineHeight: 1.5, margin: '0 0 16px 0' }}>
                ExNihilo dynamically tracks and infers tables, column structures, and foreign key relationships directly from your SQL queries. Run any query in the SQL IDE or click below to auto-generate a sample relational schema.
              </p>
              {executor && (
                <button
                  className="win95-button"
                  style={{
                    padding: '6px 14px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    background: isMac ? 'rgba(56, 189, 248, 0.25)' : 'var(--w95-title-active-bg, #000080)',
                    color: '#ffffff',
                    cursor: 'pointer',
                  }}
                  onClick={handleSeedSampleData}
                  disabled={isSeeding}
                >
                  {isSeeding ? '⏳ Generating...' : '⚡ Generate Sample E-Commerce Schema (Users, Orders, Products)'}
                </button>
              )}
            </div>
          )}

          {/* Scaled Diagram Layer */}
          <div
            id="erd-diagram-svg"
            style={{
              width: '4000px',
              height: '3000px',
              position: 'relative',
              transform: `scale(${zoom})`,
              transformOrigin: '0 0',
            }}
          >
            {/* SVG Relationship Connector Lines */}
            <svg
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 1,
              }}
            >
              <defs>
                <marker
                  id="erd-arrow"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto"
                >
                  <path d="M 0 1 L 9 5 L 0 9 z" fill={isMac ? '#38bdf8' : '#000080'} />
                </marker>
                <marker
                  id="erd-arrow-active"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="7"
                  markerHeight="7"
                  orient="auto"
                >
                  <path d="M 0 1 L 9 5 L 0 9 z" fill="#ef4444" />
                </marker>
              </defs>

              {erdData.links.map((link) => {
                const sourceNode = erdData.nodes.find((n) => n.id === link.sourceTable);
                const targetNode = erdData.nodes.find((n) => n.id === link.targetTable);
                if (!sourceNode || !targetNode) return null;

                const sourcePos = positions[link.sourceTable] || { x: sourceNode.x, y: sourceNode.y };
                const targetPos = positions[link.targetTable] || { x: targetNode.x, y: targetNode.y };

                const sourceColIdx = Math.max(
                  0,
                  sourceNode.columns.findIndex((c) => c.name.toLowerCase() === link.sourceColumn.toLowerCase())
                );
                const targetColIdx = Math.max(
                  0,
                  targetNode.columns.findIndex((c) => c.name.toLowerCase() === link.targetColumn.toLowerCase())
                );

                const cardWidth = 280;
                // Header (32px) + padding (4px) + column middle (~11px) + index * 22px
                const sy = sourcePos.y + 36 + sourceColIdx * 22;
                const ty = targetPos.y + 36 + targetColIdx * 22;

                const isTargetToRight = targetPos.x >= sourcePos.x + cardWidth / 2;
                const sx = isTargetToRight ? sourcePos.x + cardWidth : sourcePos.x;
                const tx = isTargetToRight ? targetPos.x : targetPos.x + cardWidth;

                // Bezier control handles
                const dx = Math.max(45, Math.abs(tx - sx) * 0.45);
                const c1x = isTargetToRight ? sx + dx : sx - dx;
                const c2x = isTargetToRight ? tx - dx : tx + dx;
                const pathD = `M ${sx} ${sy} C ${c1x} ${sy}, ${c2x} ${ty}, ${tx} ${ty}`;

                const isLinkSelected = selectedLinkId === link.id;
                const isHovered = hoveredLinkId === link.id;
                const isTableConnected =
                  selectedTableId === link.sourceTable || selectedTableId === link.targetTable;

                const strokeColor = isLinkSelected || isHovered
                  ? '#ef4444'
                  : isTableConnected
                  ? isMac ? '#38bdf8' : '#000080'
                  : isMac ? 'rgba(56, 189, 248, 0.45)' : 'rgba(0, 0, 128, 0.45)';

                const strokeWidth = isLinkSelected || isHovered ? 3 : isTableConnected ? 2.5 : 1.75;

                return (
                  <g
                    key={link.id}
                    onClick={() => {
                      setSelectedLinkId(link.id);
                      setSelectedTableId(link.sourceTable);
                      setInspectorTab('relations');
                    }}
                    onMouseEnter={() => setHoveredLinkId(link.id)}
                    onMouseLeave={() => setHoveredLinkId(null)}
                    style={{ cursor: 'pointer', pointerEvents: 'auto' }}
                  >
                    {/* Wider transparent hit-area for easy line selection */}
                    <path d={pathD} fill="none" stroke="transparent" strokeWidth={14} />

                    <path
                      d={pathD}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth={strokeWidth}
                      strokeDasharray={isLinkSelected ? 'none' : '5,3'}
                      markerEnd={isLinkSelected || isHovered ? 'url(#erd-arrow-active)' : 'url(#erd-arrow)'}
                    />

                    {/* Cardinality Badges: Foreign Key (Many/∞) & Primary Key (1) */}
                    <text
                      x={isTargetToRight ? sx + 10 : sx - 18}
                      y={sy - 4}
                      fill={strokeColor}
                      fontSize="10"
                      fontWeight="bold"
                    >
                      ∞
                    </text>
                    <text
                      x={isTargetToRight ? tx - 18 : tx + 10}
                      y={ty - 4}
                      fill={strokeColor}
                      fontSize="10"
                      fontWeight="bold"
                    >
                      1
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Draggable Table Entity Cards */}
            {filteredNodes.map((node) => {
              const pos = positions[node.id] || { x: node.x, y: node.y };
              const isSelected = selectedTableId === node.id;
              const hasConnectedLink =
                selectedTableId !== null &&
                erdData.links.some(
                  (l) =>
                    (l.sourceTable === selectedTableId && l.targetTable === node.id) ||
                    (l.targetTable === selectedTableId && l.sourceTable === node.id)
                );

              return (
                <div
                  key={node.id}
                  className="win95-window"
                  onClick={() => {
                    setSelectedTableId(node.id);
                    setSelectedLinkId(null);
                  }}
                  style={{
                    position: 'absolute',
                    left: `${pos.x}px`,
                    top: `${pos.y}px`,
                    width: '280px',
                    boxShadow: isSelected
                      ? '0 0 0 2px #38bdf8, 0 12px 28px rgba(0,0,0,0.45)'
                      : hasConnectedLink
                      ? '0 0 0 1px #0284c7, 0 8px 20px rgba(0,0,0,0.3)'
                      : '0 6px 16px rgba(0,0,0,0.25)',
                    zIndex: isSelected ? 5 : 2,
                    borderRadius: isMac ? '8px' : '0',
                    transition: 'box-shadow 0.15s ease',
                  }}
                >
                  {/* Entity Card Titlebar (Acts as the Drag Handle) */}
                  <div
                    className="win95-titlebar"
                    onMouseDown={(e) => handleMouseDownCardTitle(node.id, e)}
                    style={{
                      padding: '3px 8px',
                      cursor: draggingNode?.id === node.id ? 'grabbing' : 'grab',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderRadius: isMac ? '8px 8px 0 0' : '0',
                    }}
                    title="Click and drag here to reposition table"
                  >
                    <div className="win95-titlebar-text" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span>{node.isUserDefined ? '📋' : '🗄️'}</span>
                      <strong style={{ fontSize: '11px' }}>{node.tableName}</strong>
                    </div>
                    <span style={{ fontSize: '9px', opacity: 0.85, fontFamily: 'var(--w95-mono)' }}>
                      {node.rowCount} rows
                    </span>
                  </div>

                  {/* Columns Definition List */}
                  <div
                    style={{
                      background: isMac ? 'rgba(24, 24, 30, 0.98)' : 'var(--w95-sunken-bg, #ffffff)',
                      color: 'var(--w95-sunken-text, #000000)',
                      padding: '4px',
                      fontSize: '11px',
                    }}
                  >
                    {node.columns.map((col, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '3px 6px',
                          borderBottom: isMac ? '1px solid rgba(255,255,255,0.05)' : '1px solid #f0f0f0',
                          background: col.isPrimaryKey
                            ? isMac ? 'rgba(234, 179, 8, 0.16)' : '#fffae6'
                            : col.isForeignKey
                            ? isMac ? 'rgba(56, 189, 248, 0.14)' : '#e6f2ff'
                            : 'transparent',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          {col.isPrimaryKey && <span title="Primary Key">🔑</span>}
                          {col.isForeignKey && <span title={`Foreign Key referencing ${col.foreignKeyTarget?.table}.${col.foreignKeyTarget?.column}`}>🔗</span>}
                          {!col.isPrimaryKey && !col.isForeignKey && <span style={{ opacity: 0.4 }}>📄</span>}

                          <span
                            style={{
                              fontWeight: col.isPrimaryKey ? 'bold' : 'normal',
                              color: col.isPrimaryKey
                                ? isMac ? '#fde047' : '#854d0e'
                                : col.isForeignKey
                                ? isMac ? '#38bdf8' : '#0369a1'
                                : 'inherit',
                            }}
                          >
                            {col.name}
                          </span>
                        </div>

                        <span
                          style={{
                            fontSize: '9px',
                            background: isMac ? 'rgba(255,255,255,0.08)' : '#e8e8e8',
                            padding: '1px 5px',
                            borderRadius: '3px',
                            color: isMac ? '#cbd5e1' : 'var(--w95-dark-gray, #444)',
                            fontFamily: 'var(--w95-mono)',
                          }}
                        >
                          {col.type}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Right Side: Live Details Inspector Sidebar ─────────────────── */}
        {showInspector && (
          <div
            className="win95-raised"
            style={{
              width: '340px',
              borderLeft: isMac ? '1px solid rgba(255, 255, 255, 0.15)' : '2px solid var(--w95-dark-gray, #808080)',
              background: isMac ? 'rgba(20, 24, 34, 0.96)' : 'var(--w95-gray, #c0c0c0)',
              color: 'var(--w95-text-color, #000000)',
              display: 'flex',
              flexDirection: 'column',
              flexShrink: 0,
              zIndex: 10,
            }}
          >
            {/* Inspector Header */}
            <div
              style={{
                padding: '8px 12px',
                borderBottom: '1px solid var(--w95-dark-gray, #808080)',
                background: isMac ? 'rgba(255, 255, 255, 0.04)' : '#d0d0d0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '14px' }}>📋</span>
                <strong style={{ fontSize: '12px' }}>
                  {selectedNode ? selectedNode.tableName : selectedLink ? 'Relation Inspector' : 'Schema Overview'}
                </strong>
              </div>

              {selectedNode && (
                <button
                  className="win95-button"
                  style={{ padding: '1px 6px', fontSize: '10px' }}
                  onClick={() => setSelectedTableId(null)}
                  title="Deselect table and show full overview"
                >
                  ✕ Clear
                </button>
              )}
            </div>

            {/* Inspector Content */}
            {selectedNode ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {/* Entity Summary Bar */}
                <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--w95-dark-gray, #808080)', fontSize: '11px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Namespace: <strong>{selectedNode.dbName || 'default'}</strong></span>
                  <span style={{ fontFamily: 'var(--w95-mono)', background: isMac ? 'rgba(255,255,255,0.1)' : '#e0e0e0', padding: '1px 6px', borderRadius: '3px' }}>
                    {selectedNode.rowCount} rows
                  </span>
                </div>

                {/* Quick Query Actions Strip */}
                <div style={{ padding: '6px 12px', display: 'flex', gap: '6px', borderBottom: '1px solid var(--w95-dark-gray, #808080)', flexWrap: 'wrap' }}>
                  <button
                    className="win95-button"
                    style={{ flex: 1, padding: '3px 6px', fontSize: '10px', fontWeight: 'bold' }}
                    onClick={() => copyToClipboard(`SELECT * FROM ${selectedNode.tableName};`, 'Query')}
                  >
                    📋 Copy SELECT
                  </button>
                  <button
                    className="win95-button"
                    style={{ flex: 1, padding: '3px 6px', fontSize: '10px' }}
                    onClick={() => {
                      const ddl = `CREATE TABLE ${selectedNode.tableName} (\n${selectedNode.columns.map((c) => `  ${c.name} ${c.type}${c.isPrimaryKey ? ' PRIMARY KEY' : ''}`).join(',\n')}\n);`;
                      copyToClipboard(ddl, 'DDL');
                    }}
                  >
                    📄 Copy DDL
                  </button>
                </div>

                {/* Inspector Tabs Header */}
                <div style={{ display: 'flex', borderBottom: '1px solid var(--w95-dark-gray, #808080)' }}>
                  <button
                    style={{
                      flex: 1,
                      padding: '6px 4px',
                      fontSize: '11px',
                      fontWeight: inspectorTab === 'columns' ? 'bold' : 'normal',
                      background: inspectorTab === 'columns' ? (isMac ? 'rgba(255,255,255,0.1)' : '#fff') : 'transparent',
                      border: 'none',
                      borderBottom: inspectorTab === 'columns' ? '2px solid #38bdf8' : 'none',
                      cursor: 'pointer',
                      color: 'inherit',
                    }}
                    onClick={() => setInspectorTab('columns')}
                  >
                    Columns ({selectedNode.columns.length})
                  </button>

                  <button
                    style={{
                      flex: 1,
                      padding: '6px 4px',
                      fontSize: '11px',
                      fontWeight: inspectorTab === 'relations' ? 'bold' : 'normal',
                      background: inspectorTab === 'relations' ? (isMac ? 'rgba(255,255,255,0.1)' : '#fff') : 'transparent',
                      border: 'none',
                      borderBottom: inspectorTab === 'relations' ? '2px solid #38bdf8' : 'none',
                      cursor: 'pointer',
                      color: 'inherit',
                    }}
                    onClick={() => setInspectorTab('relations')}
                  >
                    Relations ({tableLinks.inbound.length + tableLinks.outbound.length})
                  </button>

                  <button
                    style={{
                      flex: 1,
                      padding: '6px 4px',
                      fontSize: '11px',
                      fontWeight: inspectorTab === 'sample' ? 'bold' : 'normal',
                      background: inspectorTab === 'sample' ? (isMac ? 'rgba(255,255,255,0.1)' : '#fff') : 'transparent',
                      border: 'none',
                      borderBottom: inspectorTab === 'sample' ? '2px solid #38bdf8' : 'none',
                      cursor: 'pointer',
                      color: 'inherit',
                    }}
                    onClick={() => setInspectorTab('sample')}
                  >
                    Sample Data
                  </button>
                </div>

                {/* Tab 1: Columns Breakdown */}
                {inspectorTab === 'columns' && (
                  <div style={{ flex: 1, overflowY: 'auto', padding: '6px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                      <thead>
                        <tr style={{ background: isMac ? 'rgba(255,255,255,0.06)' : '#e0e0e0', borderBottom: '1px solid #808080' }}>
                          <th style={{ textAlign: 'left', padding: '4px' }}>Column</th>
                          <th style={{ textAlign: 'left', padding: '4px' }}>Type</th>
                          <th style={{ textAlign: 'left', padding: '4px' }}>Key</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedNode.columns.map((c, i) => (
                          <tr
                            key={i}
                            style={{
                              borderBottom: isMac ? '1px solid rgba(255,255,255,0.04)' : '1px solid #eee',
                              background: c.isPrimaryKey
                                ? isMac ? 'rgba(234, 179, 8, 0.1)' : '#fffae6'
                                : c.isForeignKey
                                ? isMac ? 'rgba(56, 189, 248, 0.1)' : '#e6f2ff'
                                : 'transparent',
                            }}
                          >
                            <td style={{ padding: '5px 4px', fontWeight: c.isPrimaryKey ? 'bold' : 'normal' }}>
                              {c.name}
                            </td>
                            <td style={{ padding: '5px 4px', fontFamily: 'var(--w95-mono)', fontSize: '10px', opacity: 0.85 }}>
                              {c.type}
                            </td>
                            <td style={{ padding: '5px 4px', fontSize: '10px' }}>
                              {c.isPrimaryKey && <span style={{ color: '#ca8a04', fontWeight: 'bold' }}>🔑 PK</span>}
                              {c.isForeignKey && (
                                <span style={{ color: '#0284c7', fontWeight: 'bold' }}>
                                  🔗 FK → {c.foreignKeyTarget?.table}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Tab 2: Relationships Navigator */}
                {inspectorTab === 'relations' && (
                  <div style={{ flex: 1, overflowY: 'auto', padding: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {/* Outbound FKs */}
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '4px' }}>
                        ↗️ Outbound Foreign Keys ({tableLinks.outbound.length})
                      </div>
                      {tableLinks.outbound.length === 0 ? (
                        <div style={{ fontSize: '10px', opacity: 0.6 }}>No outbound foreign keys defined.</div>
                      ) : (
                        tableLinks.outbound.map((l) => (
                          <div
                            key={l.id}
                            className="win95-sunken"
                            style={{
                              padding: '6px',
                              marginBottom: '6px',
                              background: 'var(--w95-sunken-bg, #ffffff)',
                              color: 'var(--w95-sunken-text, #000000)',
                              fontSize: '11px',
                            }}
                          >
                            <div>
                              <strong>{l.sourceTable}.{l.sourceColumn}</strong> → <strong>{l.targetTable}.{l.targetColumn}</strong>
                            </div>
                            <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                              <button
                                className="win95-button"
                                style={{ padding: '1px 6px', fontSize: '9px' }}
                                onClick={() => setSelectedTableId(l.targetTable)}
                              >
                                View {l.targetTable}
                              </button>
                              <button
                                className="win95-button"
                                style={{ padding: '1px 6px', fontSize: '9px' }}
                                onClick={() =>
                                  copyToClipboard(
                                    `SELECT * FROM ${l.sourceTable} JOIN ${l.targetTable} ON ${l.sourceTable}.${l.sourceColumn} = ${l.targetTable}.${l.targetColumn};`,
                                    'JOIN Query'
                                  )
                                }
                              >
                                Copy JOIN
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Inbound FKs */}
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '4px' }}>
                        ↙️ Referenced By Other Tables ({tableLinks.inbound.length})
                      </div>
                      {tableLinks.inbound.length === 0 ? (
                        <div style={{ fontSize: '10px', opacity: 0.6 }}>No other tables reference this table.</div>
                      ) : (
                        tableLinks.inbound.map((l) => (
                          <div
                            key={l.id}
                            className="win95-sunken"
                            style={{
                              padding: '6px',
                              marginBottom: '6px',
                              background: 'var(--w95-sunken-bg, #ffffff)',
                              color: 'var(--w95-sunken-text, #000000)',
                              fontSize: '11px',
                            }}
                          >
                            <div>
                              <strong>{l.sourceTable}.{l.sourceColumn}</strong> references this table's <strong>{l.targetColumn}</strong>
                            </div>
                            <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                              <button
                                className="win95-button"
                                style={{ padding: '1px 6px', fontSize: '9px' }}
                                onClick={() => setSelectedTableId(l.sourceTable)}
                              >
                                View {l.sourceTable}
                              </button>
                              <button
                                className="win95-button"
                                style={{ padding: '1px 6px', fontSize: '9px' }}
                                onClick={() =>
                                  copyToClipboard(
                                    `SELECT * FROM ${l.sourceTable} JOIN ${l.targetTable} ON ${l.sourceTable}.${l.sourceColumn} = ${l.targetTable}.${l.targetColumn};`,
                                    'JOIN Query'
                                  )
                                }
                              >
                                Copy JOIN
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* Tab 3: Sample Data Live Preview (5 rows) */}
                {inspectorTab === 'sample' && (
                  <div style={{ flex: 1, overflow: 'auto', padding: '6px' }}>
                    {sampleLoading ? (
                      <div style={{ padding: '20px', textAlign: 'center', fontSize: '11px', opacity: 0.7 }}>
                        ⏳ Loading sample data from SQLite...
                      </div>
                    ) : sampleRows && sampleRows.length > 0 ? (
                      <table className="win95-grid" style={{ width: '100%', fontSize: '10px', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ background: isMac ? 'rgba(255,255,255,0.08)' : '#e0e0e0' }}>
                            {sampleCols.map((col) => (
                              <th key={col} style={{ padding: '3px 6px', textAlign: 'left', whiteSpace: 'nowrap' }}>
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {sampleRows.map((row, idx) => (
                            <tr key={idx} style={{ background: idx % 2 === 0 ? 'transparent' : isMac ? 'rgba(255,255,255,0.02)' : '#f9f9f9' }}>
                              {sampleCols.map((col) => (
                                <td key={col} style={{ padding: '3px 6px', whiteSpace: 'nowrap', fontFamily: 'var(--w95-mono)' }}>
                                  {String(row[col] ?? 'NULL')}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div style={{ padding: '20px', textAlign: 'center', fontSize: '11px', opacity: 0.7 }}>
                        No records stored in this table yet.
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : selectedLink ? (
              /* Link Inspector View */
              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '11px' }}>
                <div style={{ fontWeight: 'bold', fontSize: '12px', color: '#38bdf8' }}>
                  🔗 Foreign Key Relationship Link
                </div>
                <div className="win95-sunken" style={{ padding: '10px', background: 'var(--w95-sunken-bg, #ffffff)', color: 'var(--w95-sunken-text, #000000)' }}>
                  <div>Source Table: <strong>{selectedLink.sourceTable}</strong></div>
                  <div>Foreign Key Column: <strong>{selectedLink.sourceColumn}</strong> (∞ Many)</div>
                  <div style={{ margin: '8px 0', borderTop: '1px solid #ddd' }} />
                  <div>Target Table: <strong>{selectedLink.targetTable}</strong></div>
                  <div>Primary Key Column: <strong>{selectedLink.targetColumn}</strong> (1 One)</div>
                  <div style={{ marginTop: '8px', fontSize: '10px', color: 'var(--w95-dark-gray, #666)' }}>
                    Cardinality: <strong>Many-to-One (N : 1)</strong>
                  </div>
                </div>

                <button
                  className="win95-button"
                  style={{ padding: '4px 8px', fontWeight: 'bold' }}
                  onClick={() =>
                    copyToClipboard(
                      `SELECT * FROM ${selectedLink.sourceTable} JOIN ${selectedLink.targetTable} ON ${selectedLink.sourceTable}.${selectedLink.sourceColumn} = ${selectedLink.targetTable}.${selectedLink.targetColumn};`,
                      'JOIN Query'
                    )
                  }
                >
                  📋 Copy Generated JOIN SQL
                </button>
              </div>
            ) : (
              /* Global Schema Overview (No Table Selected) */
              <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ fontSize: '11px', opacity: 0.8 }}>
                  Click on any table card or relationship link to inspect column structures, foreign key paths, and live sample records.
                </div>

                <div className="win95-sunken" style={{ padding: '10px', background: 'var(--w95-sunken-bg, #ffffff)', color: 'var(--w95-sunken-text, #000000)' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '11px' }}>Catalog Statistics:</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px' }}>
                    <div>Total Tables: <strong>{erdData.nodes.length}</strong></div>
                    <div>Foreign Keys: <strong>{erdData.links.length}</strong></div>
                    <div>Total Columns: <strong>{erdData.nodes.reduce((acc, n) => acc + n.columns.length, 0)}</strong></div>
                    <div>Namespaces: <strong>{new Set(erdData.nodes.map((n) => n.dbName || 'default')).size}</strong></div>
                  </div>
                </div>

                {/* Table Quick Navigation List */}
                <div style={{ fontSize: '11px', fontWeight: 'bold' }}>All Registered Tables:</div>
                <div className="win95-sunken" style={{ maxHeight: '240px', overflowY: 'auto', background: 'var(--w95-sunken-bg, #ffffff)', color: 'var(--w95-sunken-text, #000000)', padding: '4px' }}>
                  {erdData.nodes.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => setSelectedTableId(n.id)}
                      style={{
                        padding: '4px 6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '11px',
                        borderBottom: '1px solid #f0f0f0',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = isMac ? 'rgba(56, 189, 248, 0.15)' : '#e8f0fe')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <span>🗄️ {n.tableName}</span>
                      <span style={{ fontSize: '9px', opacity: 0.7 }}>{n.columns.length} cols</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
