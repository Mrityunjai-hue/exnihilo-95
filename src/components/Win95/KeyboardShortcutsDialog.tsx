'use client';

import React, { useState } from 'react';

interface KeyboardShortcutsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsDialog: React.FC<KeyboardShortcutsDialogProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'exec' | 'editor' | 'nav'>('exec');

  if (!isOpen) return null;

  const shortcutData = {
    exec: [
      { key: 'F5', desc: 'Execute current query or highlighted text', tag: 'Core' },
      { key: 'Ctrl + Enter', desc: 'Execute current query or highlighted text', tag: 'Core' },
      { key: 'Alt + T', desc: 'Open a new query tab', tag: 'Tabs' },
      { key: 'Alt + W', desc: 'Close active query tab', tag: 'Tabs' },
      { key: 'Alt + ] / [', desc: 'Cycle next / previous query tab', tag: 'Tabs' },
    ],
    editor: [
      { key: 'Ctrl + Shift + F', desc: 'Beautify and auto-format SQL query', tag: 'Format' },
      { key: 'Ctrl + Space', desc: 'Trigger intelligent SQL autocompletion', tag: 'IntelliSense' },
      { key: 'Ctrl + Z', desc: 'Undo last editor change', tag: 'Edit' },
      { key: 'Ctrl + Y', desc: 'Redo last undone change', tag: 'Edit' },
      { key: 'Ctrl + A', desc: 'Select all SQL text in active editor', tag: 'Selection' },
    ],
    nav: [
      { key: 'F1', desc: 'Open ExNihilo Interactive Help & Documentation', tag: 'Help' },
      { key: 'Alt + H', desc: 'Open Query Execution History Drawer', tag: 'Tools' },
      { key: 'Alt + E', desc: 'Open Interactive ERD Schema Diagram', tag: 'Tools' },
      { key: 'Double-Click Titlebar', desc: 'Toggle Maximize / Restore IDE Window', tag: 'Window' },
    ],
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.35)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999999,
      }}
      onClick={onClose}
    >
      <div
        className="win95-window"
        style={{
          width: '520px',
          maxWidth: '92vw',
          boxShadow: '4px 4px 10px rgba(0,0,0,0.5)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="win95-titlebar">
          <div className="win95-titlebar-text">
            <span>⌨️</span>
            <span>Keyboard Shortcuts & Accelerator Reference</span>
          </div>
          <div className="win95-titlebar-controls">
            <button className="win95-btn-titlebar" onClick={onClose}>
              ✕
            </button>
          </div>
        </div>

        <div style={{ padding: '12px' }}>
          {/* Win95 Tab Headers */}
          <div style={{ display: 'flex', gap: '2px', borderBottom: '2px solid #808080', marginBottom: '8px' }}>
            <button
              className={`win95-button ${activeTab === 'exec' ? 'active' : ''}`}
              style={{
                fontWeight: activeTab === 'exec' ? 'bold' : 'normal',
                borderBottom: activeTab === 'exec' ? '2px solid #c0c0c0' : undefined,
                marginBottom: activeTab === 'exec' ? '-2px' : '0',
                padding: '4px 12px',
                fontSize: '11px',
              }}
              onClick={() => setActiveTab('exec')}
            >
              ⚡ Execution & Tabs
            </button>
            <button
              className={`win95-button ${activeTab === 'editor' ? 'active' : ''}`}
              style={{
                fontWeight: activeTab === 'editor' ? 'bold' : 'normal',
                borderBottom: activeTab === 'editor' ? '2px solid #c0c0c0' : undefined,
                marginBottom: activeTab === 'editor' ? '-2px' : '0',
                padding: '4px 12px',
                fontSize: '11px',
              }}
              onClick={() => setActiveTab('editor')}
            >
              📝 Editor & Formatting
            </button>
            <button
              className={`win95-button ${activeTab === 'nav' ? 'active' : ''}`}
              style={{
                fontWeight: activeTab === 'nav' ? 'bold' : 'normal',
                borderBottom: activeTab === 'nav' ? '2px solid #c0c0c0' : undefined,
                marginBottom: activeTab === 'nav' ? '-2px' : '0',
                padding: '4px 12px',
                fontSize: '11px',
              }}
              onClick={() => setActiveTab('nav')}
            >
              🧭 Navigation & Window
            </button>
          </div>

          {/* Table of Shortcuts */}
          <div className="win95-sunken" style={{ background: '#ffffff', maxHeight: '240px', overflowY: 'auto', padding: '4px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', fontFamily: 'var(--w95-font)' }}>
              <thead>
                <tr style={{ background: '#ece9d8', borderBottom: '1px solid #c0c0c0', textAlign: 'left' }}>
                  <th style={{ padding: '6px 8px', width: '140px' }}>Key Binding</th>
                  <th style={{ padding: '6px 8px' }}>Action Description</th>
                  <th style={{ padding: '6px 8px', width: '80px', textAlign: 'right' }}>Category</th>
                </tr>
              </thead>
              <tbody>
                {shortcutData[activeTab].map((item, idx) => (
                  <tr
                    key={idx}
                    style={{
                      borderBottom: '1px solid #f0f0f0',
                      background: idx % 2 === 0 ? '#fafafa' : '#ffffff',
                    }}
                  >
                    <td style={{ padding: '6px 8px' }}>
                      <kbd
                        style={{
                          background: '#f4f4f4',
                          border: '1px solid #c0c0c0',
                          boxShadow: '1px 1px 0 #808080',
                          padding: '2px 6px',
                          borderRadius: '2px',
                          fontWeight: 'bold',
                          fontFamily: 'monospace',
                          fontSize: '10px',
                          color: '#000080',
                        }}
                      >
                        {item.key}
                      </kbd>
                    </td>
                    <td style={{ padding: '6px 8px', color: '#222' }}>{item.desc}</td>
                    <td style={{ padding: '6px 8px', textAlign: 'right' }}>
                      <span
                        style={{
                          background: '#e0e8f0',
                          color: '#004080',
                          padding: '1px 6px',
                          borderRadius: '2px',
                          fontSize: '10px',
                          fontWeight: '500',
                        }}
                      >
                        {item.tag}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
            <button
              className="win95-button"
              style={{ padding: '4px 18px', fontWeight: 'bold' }}
              onClick={onClose}
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
