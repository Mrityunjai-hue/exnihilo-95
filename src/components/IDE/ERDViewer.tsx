/**
 * ERDViewer.tsx — Interactive Entity-Relationship Diagram (ERD) Component
 * Features draggable Win95 table cards, automatic FK bezier connector lines,
 * zoom controls, search filtering, and SVG image export.
 */

import React, { useState, useEffect, useRef } from 'react';
import { SessionCatalog } from '../../engine/catalog';
import { extractERDData, ERDGraphData, ERDNode } from '../../engine/erd_extractor';

interface ERDViewerProps {
  catalog: SessionCatalog;
  onClose: () => void;
}

export const ERDViewer: React.FC<ERDViewerProps> = ({ catalog, onClose }) => {
  const [erdData, setErdData] = useState<ERDGraphData>(() => extractERDData(catalog));
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [zoom, setZoom] = useState(1);
  const [draggingNode, setDraggingNode] = useState<{ id: string; startX: number; startY: number; initialNodeX: number; initialNodeY: number } | null>(null);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);

  // Initialize node positions
  useEffect(() => {
    const data = extractERDData(catalog);
    setErdData(data);
    const initialPos: Record<string, { x: number; y: number }> = {};
    data.nodes.forEach((n) => {
      initialPos[n.id] = { x: n.x, y: n.y };
    });
    setPositions(initialPos);
  }, [catalog]);

  // Handle Dragging Table Cards
  const handleMouseDownNode = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const pos = positions[id] || { x: 0, y: 0 };
    setDraggingNode({
      id,
      startX: e.clientX,
      startY: e.clientY,
      initialNodeX: pos.x,
      initialNodeY: pos.y,
    });
  };

  const handleMouseMoveCanvas = (e: React.MouseEvent) => {
    if (!draggingNode) return;
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

  const handleMouseUpCanvas = () => {
    setDraggingNode(null);
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

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999999,
      }}
    >
      <div
        className="win95-window"
        style={{
          width: '90vw',
          height: '85vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '4px 4px 12px rgba(0,0,0,0.5)',
        }}
      >
        {/* Titlebar */}
        <div className="win95-titlebar">
          <div className="win95-titlebar-text">
            <span>🌐</span>
            <span>Entity Relationship Diagram (ERD) Viewer</span>
          </div>
          <div className="win95-titlebar-controls">
            <button className="win95-btn-titlebar" onClick={onClose}>
              ✕
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div
          style={{
            background: '#c0c0c0',
            padding: '6px',
            borderBottom: '1px solid #808080',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
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
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '10px', color: '#404040' }}>
              Tables: {filteredNodes.length} | Relationships: {erdData.links.length}
            </span>
            <button
              className="win95-button"
              style={{ padding: '2px 8px', fontSize: '11px', fontWeight: 'bold' }}
              onClick={handleExportSVG}
              title="Export ERD Diagram as SVG"
            >
              🖼️ Export SVG
            </button>
          </div>
        </div>

        {/* ERD Canvas Area */}
        <div
          ref={canvasRef}
          onMouseMove={handleMouseMoveCanvas}
          onMouseUp={handleMouseUpCanvas}
          className="win95-sunken"
          style={{
            flex: 1,
            position: 'relative',
            overflow: 'auto',
            background: 'var(--w95-sunken-bg, #ece9d8)',
            color: 'var(--w95-sunken-text, #000000)',
            userSelect: 'none',
          }}
        >
          <div
            style={{
              width: '3000px',
              height: '2000px',
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
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#000080" />
                </marker>
              </defs>

              {erdData.links.map((link) => {
                const sourceNode = erdData.nodes.find((n) => n.id === link.sourceTable);
                const targetNode = erdData.nodes.find((n) => n.id === link.targetTable);
                const sourcePos = positions[link.sourceTable];
                const targetPos = positions[link.targetTable];

                if (!sourcePos || !targetPos || !sourceNode || !targetNode) return null;

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
                      stroke={isHovered ? '#ff0000' : '#000080'}
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
                      fill="#000080"
                      fontSize="10"
                      fontWeight="bold"
                    >
                      ∞
                    </text>
                    <text
                      x={isTargetToRight ? tx - 20 : tx + 12}
                      y={ty - 4}
                      fill="#000080"
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
                    boxShadow: '3px 3px 8px rgba(0,0,0,0.3)',
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
                  <div style={{ background: '#ffffff', padding: '4px', fontSize: '10px' }}>
                    {node.columns.map((col, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '3px 4px',
                          borderBottom: '1px solid #f0f0f0',
                          background: col.isPrimaryKey ? '#fffae6' : col.isForeignKey ? '#e6f2ff' : 'transparent',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {col.isPrimaryKey && <span title="Primary Key">🔑</span>}
                          {col.isForeignKey && <span title={`Foreign Key -> ${col.foreignKeyTarget?.table}`}>🔗</span>}
                          <span style={{ fontWeight: col.isPrimaryKey ? 'bold' : 'normal' }}>{col.name}</span>
                        </div>

                        <span
                          style={{
                            fontSize: '9px',
                            background: '#e0e0e0',
                            padding: '1px 4px',
                            borderRadius: '2px',
                            color: '#333333',
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
    </div>
  );
};
