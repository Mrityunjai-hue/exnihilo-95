'use client';

/**
 * CopilotDialog.tsx — Windows 95 AI SQL Copilot Assistant
 * Translates natural language prompts into executable dialect-calibrated SQL queries.
 */

import React, { useState, useEffect } from 'react';
import { Dialect } from '../../engine/parser';
import { useTheme } from '../../hooks/useTheme';

interface CopilotDialogProps {
  isOpen: boolean;
  onClose: () => void;
  dialect: Dialect;
  schemaContext?: string;
  onInsertSql: (sql: string) => void;
}

export const CopilotDialog: React.FC<CopilotDialogProps> = ({
  isOpen,
  onClose,
  dialect,
  schemaContext,
  onInsertSql,
}) => {
  const { activeTheme } = useTheme();
  const isDark = activeTheme === 'macos-glass' || activeTheme === 'win95-noir';

  const [prompt, setPrompt] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedSql, setGeneratedSql] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedKey = localStorage.getItem('exnihilo_gemini_api_key') || '';
      setApiKey(savedKey);
    }
  }, [isOpen]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setErrorMessage(null);
    setGeneratedSql('');

    try {
      if (apiKey.trim()) {
        localStorage.setItem('exnihilo_gemini_api_key', apiKey.trim());
      }

      const res = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          dialect,
          schema: schemaContext,
          userApiKey: apiKey.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (data.ok && data.sql) {
        setGeneratedSql(data.sql);
      } else {
        setErrorMessage(data.message || data.error || 'Failed to generate SQL.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Network error communicating with Copilot endpoint.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInsert = () => {
    if (generatedSql) {
      onInsertSql(generatedSql);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999999,
        padding: '12px',
      }}
      onClick={onClose}
    >
      <div
        className="win95-window"
        style={{
          width: '520px',
          maxWidth: '95vw',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '4px 4px 12px rgba(0,0,0,0.5)',
          background: 'var(--w95-gray, #c0c0c0)',
          color: 'var(--w95-text-color, #000000)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Titlebar */}
        <div className="win95-titlebar" style={{ padding: '3px 6px' }}>
          <div className="win95-titlebar-text">
            <span>✨</span>
            <span>Gemini SQL Copilot — Natural Language Query Assistant</span>
          </div>
          <div className="win95-titlebar-controls">
            <button className="win95-btn-titlebar" onClick={onClose}>
              ✕
            </button>
          </div>
        </div>

        <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ fontSize: '11px', lineHeight: 1.4 }}>
            Describe what data you want to retrieve or calculate in natural English. Gemini will generate optimized <strong>{dialect}</strong> SQL.
          </div>

          <div>
            <label style={{ fontSize: '10px', fontWeight: 'bold', display: 'block', marginBottom: '3px' }}>
              NATURAL LANGUAGE PROMPT:
            </label>
            <textarea
              className="win95-sunken"
              placeholder="e.g. Find top 5 customers with total order value > 1000 in 1995, ordered by total spent..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                  handleGenerate();
                }
              }}
              rows={3}
              style={{
                width: '100%',
                padding: '6px',
                fontSize: '11px',
                background: 'var(--w95-sunken-bg, #ffffff)',
                color: 'var(--w95-sunken-text, #000000)',
                boxSizing: 'border-box',
              }}
            />
            {/* Quick Prompt Presets */}
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '4px' }}>
              {[
                'Top 5 customers by spend',
                'Join orders with customers',
                'Monthly revenue trend',
                'Cardiac vitals with high heart rate',
              ].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  className="win95-button"
                  style={{ fontSize: '9px', padding: '1px 5px', opacity: 0.9 }}
                  onClick={() => setPrompt(preset)}
                >
                  ⚡ {preset}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: '10px', fontWeight: 'bold', display: 'block', marginBottom: '3px' }}>
              GEMINI API KEY (OPTIONAL IF CONFIGURED IN ENV):
            </label>
            <input
              type="password"
              className="win95-sunken"
              placeholder="AIzaSy... (Saved locally in your browser)"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              style={{
                width: '100%',
                padding: '3px 6px',
                fontSize: '11px',
                background: 'var(--w95-sunken-bg, #ffffff)',
                color: 'var(--w95-sunken-text, #000000)',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {errorMessage && (
            <div
              style={{
                padding: '6px 8px',
                background: isDark ? 'rgba(239, 68, 68, 0.2)' : '#fff0f0',
                color: isDark ? '#fca5a5' : '#b00020',
                fontSize: '11px',
                borderRadius: '2px',
              }}
            >
              ⚠️ {errorMessage}
            </div>
          )}

          {generatedSql && (
            <div>
              <label style={{ fontSize: '10px', fontWeight: 'bold', display: 'block', marginBottom: '3px', color: isDark ? '#4ade80' : '#137333' }}>
                GENERATED {dialect.toUpperCase()} SQL:
              </label>
              <pre
                className="win95-sunken"
                style={{
                  padding: '8px',
                  fontSize: '11px',
                  maxHeight: '130px',
                  overflow: 'auto',
                  background: 'var(--w95-sunken-bg, #ffffff)',
                  color: 'var(--w95-sunken-text, #000000)',
                  fontFamily: 'var(--w95-mono)',
                  margin: 0,
                }}
              >
                {generatedSql}
              </pre>
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '6px',
            padding: '8px 12px',
            background: 'var(--w95-gray, #c0c0c0)',
            borderTop: '1px solid var(--w95-dark-gray, #808080)',
          }}
        >
          {generatedSql && (
            <button
              className="win95-button"
              style={{ fontWeight: 'bold' }}
              onClick={handleInsert}
            >
              📥 Insert into Query Tab
            </button>
          )}
          <button
            className="win95-button"
            style={{ fontWeight: !generatedSql ? 'bold' : 'normal' }}
            onClick={handleGenerate}
            disabled={isLoading || !prompt.trim()}
          >
            {isLoading ? '⏳ Generating...' : '✨ Generate SQL'}
          </button>
          <button className="win95-button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
