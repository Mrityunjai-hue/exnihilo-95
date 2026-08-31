'use client';

import React, { useState, useMemo } from 'react';
import { SavedSnippet, useSnippetsStorage } from '../../hooks/useSnippetsStorage';
import { Dialect } from '../../engine/parser';

interface SnippetsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentQueryText: string;
  currentDialect: Dialect;
  onLoadSnippet: (sql: string, dialect?: Dialect) => void;
  onOpenSnippetInNewTab: (title: string, sql: string) => void;
}

export const SnippetsPanel: React.FC<SnippetsPanelProps> = ({
  isOpen,
  onClose,
  currentQueryText,
  currentDialect,
  onLoadSnippet,
  onOpenSnippetInNewTab,
}) => {
  const { snippets, addSnippet, deleteSnippet } = useSnippetsStorage();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSavingNew, setIsSavingNew] = useState(false);
  const [newSnippetName, setNewSnippetName] = useState('');
  const [newSnippetTag, setNewSnippetTag] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredSnippets = useMemo(() => {
    if (!searchQuery.trim()) return snippets;
    const q = searchQuery.toLowerCase().trim();
    return snippets.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.sql.toLowerCase().includes(q) ||
        s.dialect.toLowerCase().includes(q) ||
        s.tags?.some((t) => t.toLowerCase().includes(q))
    );
  }, [snippets, searchQuery]);

  if (!isOpen) return null;

  const handleSaveCurrent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSnippetName.trim()) return;
    const tags = newSnippetTag
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    addSnippet(newSnippetName, currentQueryText, currentDialect, tags);
    setIsSavingNew(false);
    setNewSnippetName('');
    setNewSnippetTag('');
  };

  const handleCopySql = (id: string, sql: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(sql);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
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
          width: '620px',
          maxWidth: '94vw',
          height: '520px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '4px 4px 10px rgba(0,0,0,0.5)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="win95-titlebar">
          <div className="win95-titlebar-text">
            <span>📚</span>
            <span>Saved Queries & Snippets Library ({snippets.length})</span>
          </div>
          <div className="win95-titlebar-controls">
            <button className="win95-btn-titlebar" onClick={onClose}>
              ✕
            </button>
          </div>
        </div>

        <div style={{ padding: '8px', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Top action bar with Search and New Snippet button */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="🔍 Search snippets by name, query text, or tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                padding: '4px 6px',
                fontSize: '11px',
                fontFamily: 'var(--w95-font)',
                border: '1px solid #808080',
                background: '#ffffff',
              }}
            />
            {searchQuery && (
              <button
                className="win95-button"
                style={{ fontSize: '10px', padding: '2px 8px' }}
                onClick={() => setSearchQuery('')}
              >
                Clear
              </button>
            )}
            <button
              className="win95-button"
              style={{ fontWeight: 'bold', fontSize: '11px', padding: '2px 10px', backgroundColor: isSavingNew ? '#e0e0e0' : undefined }}
              onClick={() => setIsSavingNew(!isSavingNew)}
            >
              💾 Save Current Tab
            </button>
          </div>

          {/* Inline Save New Snippet Form */}
          {isSavingNew && (
            <form
              onSubmit={handleSaveCurrent}
              className="win95-raised"
              style={{
                padding: '8px',
                marginBottom: '8px',
                backgroundColor: '#e8ecf0',
                border: '1px solid #000080',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
            >
              <div style={{ fontWeight: 'bold', fontSize: '11px', color: '#000080' }}>
                Save Active Query as Reusable Snippet:
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <input
                  type="text"
                  placeholder="Snippet Title (e.g. Monthly Revenue Summary)"
                  value={newSnippetName}
                  onChange={(e) => setNewSnippetName(e.target.value)}
                  required
                  style={{ flex: 2, padding: '3px 6px', fontSize: '11px', background: '#fff', border: '1px solid #808080' }}
                />
                <input
                  type="text"
                  placeholder="Tags (comma separated, e.g. Finance, Monthly)"
                  value={newSnippetTag}
                  onChange={(e) => setNewSnippetTag(e.target.value)}
                  style={{ flex: 1, padding: '3px 6px', fontSize: '11px', background: '#fff', border: '1px solid #808080' }}
                />
                <button type="submit" className="win95-button" style={{ fontWeight: 'bold', fontSize: '11px', padding: '0 12px' }}>
                  Save
                </button>
                <button
                  type="button"
                  className="win95-button"
                  style={{ fontSize: '11px', padding: '0 8px' }}
                  onClick={() => setIsSavingNew(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Snippets List Container */}
          <div className="win95-sunken" style={{ flex: 1, overflow: 'auto', background: '#ffffff', padding: '6px' }}>
            {filteredSnippets.length === 0 ? (
              <div style={{ padding: '30px', color: '#888', textAlign: 'center', fontSize: '11px' }}>
                {snippets.length === 0 ? 'No snippets saved yet. Click "Save Current Tab" to store your first reusable query!' : 'No snippets match your search criteria.'}
              </div>
            ) : (
              filteredSnippets.map((item, idx) => (
                <div
                  key={item.id}
                  style={{
                    padding: '8px',
                    borderBottom: '1px solid #e0e0e0',
                    fontSize: '11px',
                    background: idx % 2 === 0 ? '#fbfbfb' : '#ffffff',
                    marginBottom: '4px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontWeight: 'bold', color: '#000080', fontSize: '12px' }}>{item.name}</span>
                      <span style={{ fontSize: '10px', background: '#dce8f5', color: '#003366', padding: '1px 5px', borderRadius: '2px' }}>
                        {item.dialect}
                      </span>
                      {item.tags?.map((t, ti) => (
                        <span key={ti} style={{ fontSize: '9px', background: '#eaeaea', color: '#555', padding: '1px 4px', borderRadius: '2px' }}>
                          #{t}
                        </span>
                      ))}
                    </div>
                    <span style={{ fontSize: '10px', color: '#888' }}>
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <pre
                    style={{
                      margin: '4px 0 6px 0',
                      fontFamily: 'var(--w95-mono)',
                      fontSize: '11px',
                      whiteSpace: 'pre-wrap',
                      background: '#f4f4f4',
                      padding: '6px',
                      border: '1px solid #ddd',
                      maxHeight: '75px',
                      overflow: 'hidden',
                      color: '#222',
                    }}
                  >
                    {item.sql}
                  </pre>

                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', alignItems: 'center' }}>
                    <button
                      className="win95-button"
                      style={{ fontSize: '10px', padding: '1px 8px' }}
                      onClick={() => handleCopySql(item.id, item.sql)}
                    >
                      {copiedId === item.id ? '✓ Copied!' : '📋 Copy SQL'}
                    </button>
                    <button
                      className="win95-button"
                      style={{ fontSize: '10px', padding: '1px 8px' }}
                      onClick={() => {
                        onLoadSnippet(item.sql, item.dialect);
                        onClose();
                      }}
                    >
                      📥 Load in Active Tab
                    </button>
                    <button
                      className="win95-button"
                      style={{ fontSize: '10px', padding: '1px 8px' }}
                      onClick={() => {
                        onOpenSnippetInNewTab(`${item.name}.sql`, item.sql);
                        onClose();
                      }}
                    >
                      ➕ Open in New Tab
                    </button>
                    <button
                      className="win95-button"
                      style={{ fontSize: '10px', padding: '1px 6px', color: '#b00020' }}
                      onClick={() => deleteSnippet(item.id)}
                      title="Delete Snippet"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button className="win95-button" style={{ padding: '4px 18px', fontWeight: 'bold' }} onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
