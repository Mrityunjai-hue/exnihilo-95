/**
 * ERDViewer.tsx — Interactive Entity-Relationship Diagram (ERD) Component & Window
 * Features draggable table cards, automatic FK bezier connector lines,
 * zoom controls, search filtering, sample schema seeder, and SVG image export.
 */

import React, { useState, useEffect, useRef } from 'react';
import { SessionCatalog } from '../../engine/catalog';
import { extractERDData, ERDGraphData } from '../../engine/erd_extractor';
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

  const [erdData, setErdData] = useState<ERDGraphData>(() => extractERDData(catalog));
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [zoom, setZoom] = useState(1);
  const [draggingNode, setDraggingNode] = useState<{ id: string; startX: number; startY: number; initialNodeX: number; initialNodeY: number } | null>(null);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const { position, handleMouseDown: handleHeaderDrag } = useDraggable({ x: 70, y: 35 });

  // Refresh ERD nodes and links whenever catalog changes or window opens
  useEffect(() => {
    if (!isOpen) return;
    const data = extractERDData(catalog);
    setErdData(data);
    setPositions((prev) => {
      const next = { ...prev };
      data.nodes.forEach((n, idx) => {
        if (!next[n.id]) {
          next[n.id] = {
            x: n.x || 40 + (idx % 3) * 310,
            y: n.y || 40 + Math.floor(idx / 3) * 260,
          };
        }
      });
      return next;
    });
  }, [catalog, isOpen]);

  // Window-level mouse move and mouse up listeners for smooth, glitch-free card dragging
  useEffect(() => {
    if (!draggingNode) return;
    const handleWindowMouseMove = (e: MouseEvent) => {
      const dx = (e.clientX - draggingNode.startX) / zoom;
      const dy = (e.clientY - draggingNode.startY) / zoom;
      setPositions((prev) => ({
        ...prev,
        [draggingNode.id]: {
          x: Math.max(10, draggingNode.initialNodeX + dx),
          y: Math.max(10, draggingNode.initialNodeY + dy),
        },
      }));
    };
    const handleWindowMouseUp = () => {
      setDraggingNode(null);
    };
    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, [draggingNode, zoom]);

  if (!isOpen || isMinimized) return null;

  // Handle Dragging Table Cards
  const handleMouseDownNode = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onFocus?.();
    const pos = positions[id] || { x: 0, y: 0 };
    setDraggingNode({
      id,
      startX: e.clientX,
      startY: e.clientY,
      initialNodeX: pos.x,
      initialNodeY: pos.y,
    });
  };

  // Seed instant multi-table relational schema (Users, Orders, Products, Order_Items)
  const handleSeedSampleData = async () => {
    if (!executor) return;
    setIsSeeding(true);
    try {
      const sampleQuery = `
        SELECT 
          users.id as user_id, 
          users.name, 
          users.email,
          orders.id as order_id, 
          orders.total, 
          orders.created_at,
          products.id as product_id,
          products.title, 
          products.price,
          order_items.quantity
        FROM users
        JOIN orders ON users.id = orders.user_id
        JOIN order_items ON orders.id = order_items.order_id
        JOIN products ON order_items.product_id = products.id;
      `;
      await executor.execute(sampleQuery, 'PostgreSQL');
      const data = extractERDData(catalog);
      setErdData(data);
      const initialPos: Record<string, { x: number; y: number }> = {};
      data.nodes.forEach((n, idx) => {
        initialPos[n.id] = {
          x: 40 + (idx % 3) * 310,
          y: 40 + Math.floor(idx / 3) * 260,
        };
      });
      setPositions(initialPos);
    } catch (err) {
      console.error('Failed to seed sample relational schema:', err);
    } finally {
      setIsSeeding(false);
    }
  };

  // Export ERD Canvas as SVG File
  const handleExportSVG = () => {
    if (!canvasRef.current) return;
    const svgElem = canvasRef.current.querySelector('svg');
    if (!svgElem) return;

    const svgData = new XMLSerializer().serializeToString(svgElem);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ExNihilo_ERD_${Date.now()}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter nodes by search query
  const filteredNodes = erdData.nodes.filter((node) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    if (node.tableName.toLowerCase().includes(q)) return true;
    return node.columns.some((c) => c.name.toLowerCase().includes(q));
  });

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
        width: 'min(1080px, 94vw)',
        height: 'min(760px, 86vh)',
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
      {/* Titlebar */}
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
          <span>Database Relation Visualizer &amp; Entity-Relationship (ERD)</span>
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

      {/* Toolbar */}
      <div
        style={{
          background: isMac ? 'rgba(30, 41, 59, 0.7)' : '#c0c0c0',
          padding: '6px 8px',
          borderBottom: isMac ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid #808080',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <input
            type="text"
            className="win95-sunken"
            placeholder="🔍 Search tables or columns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '220px', padding: '3px 6px', fontSize: '11px' }}
          />
          <div className="win95-divider-v" />
          <button
            className="win95-button"
            style={{ padding: '2px 6px', fontSize: '11px' }}
            onClick={() => setZoom((z) => Math.min(z + 0.15, 2.0))}
            title="Zoom In"
          >
            ➕ Zoom In
          </button>
          <button
            className="win95-button"
            style={{ padding: '2px 6px', fontSize: '11px' }}
            onClick={() => setZoom((z) => Math.max(z - 0.15, 0.4))}
            title="Zoom Out"
          >
            ➖ Zoom Out
          </button>
          <button
            className="win95-button"
            style={{ padding: '2px 6px', fontSize: '11px' }}
            onClick={() => setZoom(1.0)}
            title="Reset Zoom"
          >
            🔄 Reset (100%)
          </button>
          {executor && (
            <button
              className="win95-button"
              style={{
                padding: '2px 8px',
                fontSize: '11px',
                fontWeight: 600,
                background: isMac ? 'rgba(14, 165, 233, 0.25)' : '#000080',
                color: '#ffffff',
              }}
              onClick={handleSeedSampleData}
              disabled={isSeeding}
              title="Automatically generate a multi-table relational schema with foreign key relationships"
            >
              {isSeeding ? '⏳ Generating...' : '⚡ Seed Sample Schema'}
            </button>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '11px', color: isMac ? '#94a3b8' : '#404040' }}>
            Tables: <strong>{filteredNodes.length}</strong> | FK Links: <strong>{erdData.links.length}</strong>
          </span>
          <button
            className="win95-button"
            style={{ padding: '2px 8px', fontSize: '11px', fontWeight: 'bold' }}
            onClick={handleExportSVG}
            title="Export ERD Diagram as SVG File"
          >
            🖼️ Export SVG
          </button>
        </div>
      </div>

      {/* ERD Canvas Area */}
      <div
        ref={canvasRef}
        className="win95-sunken"
        style={{
          flex: 1,
          position: 'relative',
          overflow: 'auto',
          background: isMac ? 'rgba(18, 18, 22, 0.92)' : 'var(--w95-sunken-bg, #ece9d8)',
          color: 'var(--w95-sunken-text, #000000)',
          userSelect: 'none',
        }}
      >
        {/* Empty State Banner if no tables loaded */}
        {filteredNodes.length === 0 && (
          <div
            style={{
              position: 'absolute',
              top: '40%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              background: isMac ? 'rgba(28, 28, 34, 0.92)' : '#c0c0c0',
              color: isMac ? '#ffffff' : '#000000',
              padding: '28px 36px',
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
              ExNihilo infers table schemas, columns, and foreign key relationships automatically from your queries. Run any query in the SQL IDE or click below to auto-generate a multi-table relational schema.
            </p>
            {executor && (
              <button
                className="win95-button"
                style={{
                  padding: '6px 14px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  background: isMac ? 'rgba(255, 255, 255, 0.15)' : '#000080',
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

        <div
          style={{
            width: '3200px',
            height: '2400px',
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
                refX="6"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill={isMac ? '#38bdf8' : '#000080'} />
              </marker>
            </defs>

            {erdData.links.map((link) => {
              const sourceNode = erdData.nodes.find((n) => n.id === link.sourceTable);
              const targetNode = erdData.nodes.find((n) => n.id === link.targetTable);
              if (!sourceNode || !targetNode) return null;

              const sourcePos = positions[link.sourceTable] || { x: sourceNode.x, y: sourceNode.y };
              const targetPos = positions[link.targetTable] || { x: targetNode.x, y: targetNode.y };

              const sourceColIdx = sourceNode.columns.findIndex(
                (c) => c.name.toLowerCase() === link.sourceColumn.toLowerCase()
              );
              const targetColIdx = targetNode.columns.findIndex(
                (c) => c.name.toLowerCase() === link.targetColumn.toLowerCase()
              );

              const sy = sourcePos.y + 36 + Math.max(0, sourceColIdx) * 22;
              const ty = targetPos.y + 36 + Math.max(0, targetColIdx) * 22;

              const isTargetToRight = targetPos.x >= sourcePos.x;
              const sx = isTargetToRight ? sourcePos.x + 260 : sourcePos.x;
              const tx = isTargetToRight ? targetPos.x : targetPos.x + 260;

              const dx = Math.max(40, Math.abs(tx - sx) * 0.4);
              const c1x = isTargetToRight ? sx + dx : sx - dx;
              const c2x = isTargetToRight ? tx - dx : tx + dx;
              const pathD = `M ${sx} ${sy} C ${c1x} ${sy}, ${c2x} ${ty}, ${tx} ${ty}`;
              const isHovered = hoveredLink === link.id;

              return (
                <g key={link.id}>
                  <path
                    d={pathD}
                    fill="none"
                    stroke={isHovered ? '#ef4444' : isMac ? '#38bdf8' : '#000080'}
                    strokeWidth={isHovered ? 3 : 2}
                    strokeDasharray={isHovered ? 'none' : '4,2'}
                    markerEnd="url(#erd-arrow)"
                    onMouseEnter={() => setHoveredLink(link.id)}
                    onMouseLeave={() => setHoveredLink(null)}
                    style={{ pointerEvents: 'stroke', cursor: 'pointer' }}
                  />
                  {/* Cardinality Badge 1 -> N */}
                  <text
                    x={isTargetToRight ? sx + 12 : sx - 20}
                    y={sy - 4}
                    fill={isMac ? '#38bdf8' : '#000080'}
                    fontSize="10"
                    fontWeight="bold"
                  >
                    ∞
                  </text>
                  <text
                    x={isTargetToRight ? tx - 20 : tx + 12}
                    y={ty - 4}
                    fill={isMac ? '#38bdf8' : '#000080'}
                    fontSize="10"
                    fontWeight="bold"
                  >
                    1
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Draggable Table Cards */}
          {filteredNodes.map((node) => {
            const pos = positions[node.id] || { x: node.x, y: node.y };
            return (
              <div
                key={node.id}
                className="win95-window"
                onMouseDown={(e) => handleMouseDownNode(node.id, e)}
                style={{
                  position: 'absolute',
                  left: `${pos.x}px`,
                  top: `${pos.y}px`,
                  width: '260px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                  zIndex: 2,
                  cursor: draggingNode?.id === node.id ? 'grabbing' : 'grab',
                }}
              >
                {/* Table Card Titlebar */}
                <div className="win95-titlebar" style={{ padding: '2px 6px' }}>
                  <div className="win95-titlebar-text">
                    <span>📋</span>
                    <strong>{node.tableName}</strong>
                  </div>
                  <span style={{ fontSize: '9px', opacity: 0.85 }}>{node.rowCount} rows</span>
                </div>

                {/* Columns List */}
                <div style={{ background: isMac ? 'rgba(28, 28, 34, 0.96)' : '#ffffff', padding: '4px', fontSize: '10px' }}>
                  {node.columns.map((col, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '3px 4px',
                        borderBottom: isMac ? '1px solid rgba(255,255,255,0.06)' : '1px solid #f0f0f0',
                        background: col.isPrimaryKey
                          ? isMac ? 'rgba(234, 179, 8, 0.18)' : '#fffae6'
                          : col.isForeignKey
                          ? isMac ? 'rgba(255, 255, 255, 0.08)' : '#e6f2ff'
                          : 'transparent',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {col.isPrimaryKey && <span title="Primary Key">🔑</span>}
                        {col.isForeignKey && <span title={`Foreign Key -> ${col.foreignKeyTarget?.table}`}>🔗</span>}
                        <span style={{ fontWeight: col.isPrimaryKey ? 'bold' : 'normal', color: isMac ? '#f8fafc' : '#000000' }}>
                          {col.name}
                        </span>
                      </div>

                      <span
                        style={{
                          fontSize: '9px',
                          background: isMac ? 'rgba(255,255,255,0.1)' : '#e0e0e0',
                          padding: '1px 4px',
                          borderRadius: '2px',
                          color: isMac ? '#cbd5e1' : '#333333',
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
    </div>
  );
};
