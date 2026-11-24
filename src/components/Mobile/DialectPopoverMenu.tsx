'use client';

import React, { useEffect } from 'react';
import { Dialect } from '../../engine/parser';

interface DialectPopoverMenuProps {
  isOpen: boolean;
  onClose: () => void;
  activeDialect: Dialect;
  onSelectDialect: (dialect: Dialect) => void;
}

interface DialectItem {
  id: Dialect;
  icon: string;
  name: string;
  badge: string;
  description: string;
}

const DIALECT_ITEMS: DialectItem[] = [
  {
    id: 'SQLite',
    icon: '🪶',
    name: 'SQLite',
    badge: 'WASM Default',
    description: 'In-memory zero-latency execution • Browser SQLite 3.45',
  },
  {
    id: 'MySQL',
    icon: '🐬',
    name: 'MySQL',
    badge: 'v8.0',
    description: 'LIMIT offset, backtick quotes `col`, GROUP_CONCAT',
  },
  {
    id: 'PostgreSQL',
    icon: '🐘',
    name: 'PostgreSQL',
    badge: 'v16',
    description: 'ILIKE pattern matching, ::casting, RETURNING clause',
  },
  {
    id: 'SSMS',
    icon: '🏢',
    name: 'SSMS',
    badge: 'T-SQL',
    description: 'TOP N clauses, [Bracket] identifiers, DATEDIFF syntax',
  },
];

export const DialectPopoverMenu: React.FC<DialectPopoverMenuProps> = ({
  isOpen,
  onClose,
  activeDialect,
  onSelectDialect,
}) => {
  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop overlay for click-outside dismissal */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1999,
          backgroundColor: 'rgba(0, 0, 0, 0.25)',
          backdropFilter: 'blur(2px)',
          WebkitBackdropFilter: 'blur(2px)',
        }}
        onClick={onClose}
      />

      {/* Floating Curved Popover Card */}
      <div
        style={{
          position: 'fixed',
          top: '56px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100vw - 32px)',
          maxWidth: '320px',
          backgroundColor: 'rgba(253, 251, 247, 0.98)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '20px',
          border: '2px solid #808080',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.8)',
          zIndex: 2000,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          padding: '8px',
          boxSizing: 'border-box',
          fontFamily: "'Segoe UI', Tahoma, sans-serif",
          animation: 'popIn 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '4px 8px 8px 8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #e2ded5',
            marginBottom: '6px',
          }}
        >
          <span
            style={{
              fontSize: '11px',
              fontWeight: 800,
              color: '#0f172a',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            Select Active Dialect
          </span>
          <button
            type="button"
            onClick={onClose}
            style={{
              backgroundColor: '#e2ded5',
              border: 'none',
              borderRadius: '50%',
              width: '22px',
              height: '22px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              cursor: 'pointer',
              color: '#64748b',
              fontWeight: 'bold',
            }}
            title="Close menu"
          >
            ✕
          </button>
        </div>

        {/* Dialect Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {DIALECT_ITEMS.map((item) => {
            const isActive = activeDialect === item.id;
            return (
              <div
                key={item.id}
                onClick={() => {
                  onSelectDialect(item.id);
                  onClose();
                }}
                style={{
                  borderRadius: '14px',
                  padding: '9px 12px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  cursor: 'pointer',
                  backgroundColor: isActive ? '#0051d4' : '#ffffff',
                  backgroundImage: isActive ? 'linear-gradient(135deg, #007aff 0%, #0051d4 100%)' : 'none',
                  border: isActive ? '1px solid #0051d4' : '1px solid #e5e1d7',
                  color: isActive ? '#ffffff' : '#000000',
                  boxShadow: isActive ? '0 4px 14px rgba(0, 81, 212, 0.3)' : 'none',
                  transition: 'all 0.12s ease',
                }}
              >
                <div
                  style={{
                    width: '16px',
                    fontWeight: 800,
                    color: isActive ? '#4ade80' : '#15803d',
                    fontSize: '13px',
                    lineHeight: '1.2',
                    flexShrink: 0,
                  }}
                >
                  {isActive ? '✓' : ''}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '12px' }}>{item.icon}</span>
                    <span style={{ fontSize: '12px', fontWeight: 800 }}>{item.name}</span>
                    <span
                      style={{
                        fontSize: '9px',
                        fontWeight: 700,
                        padding: '1px 5px',
                        borderRadius: '6px',
                        backgroundColor: isActive ? 'rgba(255, 255, 255, 0.25)' : '#e2e8f0',
                        color: isActive ? '#ffffff' : '#475569',
                      }}
                    >
                      {item.badge}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: '10px',
                      color: isActive ? '#e0f2fe' : '#64748b',
                      marginTop: '2px',
                      lineHeight: '1.3',
                    }}
                  >
                    {item.description}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};
