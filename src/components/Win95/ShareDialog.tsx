/**
 * ShareDialog.tsx — Windows 95 Shareable SQL Query Link Modal
 */

import React, { useState, useEffect } from 'react';
import { Dialect } from '../../engine/parser';
import { encodeSharePayload } from '../../utils/shareEncoder';

interface ShareDialogProps {
  isOpen:         boolean;
  zIndex:         number;
  queryText:      string;
  currentDialect: Dialect;
  tabTitle?:      string;
  onClose:        () => void;
  onFocus:        () => void;
}

export const ShareDialog: React.FC<ShareDialogProps> = ({
  isOpen,
  zIndex,
  queryText,
  currentDialect,
  tabTitle = 'Shared Query',
  onClose,
  onFocus,
}) => {
  const [includeDialect, setIncludeDialect] = useState(true);
  const [autoRun, setAutoRun] = useState(true);
  const [shareUrl, setShareUrl] = useState('');
  const [copiedNotice, setCopiedNotice] = useState(false);
  const [showEmbedCode, setShowEmbedCode] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && isOpen) {
      const hash = encodeSharePayload({
        queryText,
        dialect: includeDialect ? currentDialect : 'MySQL',
        title: tabTitle,
        autoRun,
      });

      const fullUrl = `${window.location.origin}${window.location.pathname}${hash}`;
      setShareUrl(fullUrl);
    }
  }, [isOpen, queryText, currentDialect, tabTitle, includeDialect, autoRun]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedNotice(true);
    setTimeout(() => setCopiedNotice(false), 2500);
  };

  const embedCode = `<iframe src="${shareUrl}" width="100%" height="600" frameborder="0"></iframe>`;

  return (
    <div
      className="win95-window"
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '460px',
        maxWidth: '92vw',
        zIndex,
        boxShadow: '4px 4px 12px rgba(0,0,0,0.5)',
      }}
      onMouseDown={onFocus}
    >
      {/* Titlebar */}
      <div className="win95-titlebar" style={{ background: 'var(--w95-title-active-bg, #000080)' }}>
        <div className="win95-titlebar-text">
          <span>🔗</span>
          <span>Share SQL Query Playground</span>
        </div>
        <button
          className="win95-btn-titlebar"
          onClick={onClose}
          aria-label="Close"
          style={{ width: '16px', height: '14px', lineHeight: '10px' }}
        >
          ✕
        </button>
      </div>

      <div style={{ padding: '12px', fontSize: '11px', lineHeight: '1.5' }}>
        <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>
          Share this query playground link with colleagues, students, or team members:
        </p>

        {/* Generated URL Box */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
          <input
            type="text"
            readOnly
            className="win95-sunken"
            value={shareUrl}
            onClick={(e) => (e.target as HTMLInputElement).select()}
            style={{
              flex: 1,
              padding: '4px 6px',
              fontSize: '10px',
              fontFamily: 'var(--w95-mono)',
              background: 'var(--w95-sunken-bg, #ffffff)',
              color: 'var(--w95-sunken-text, #000000)',
            }}
          />
          <button
            className="win95-button"
            onClick={handleCopyLink}
            style={{ fontWeight: 'bold', padding: '2px 10px', whiteSpace: 'nowrap' }}
          >
            {copiedNotice ? '✓ Copied!' : '📋 Copy Link'}
          </button>
        </div>

        {/* Link Configuration Options */}
        <fieldset style={{ border: '1px solid var(--w95-dark-gray, #808080)', padding: '8px', marginBottom: '12px' }}>
          <legend style={{ padding: '0 4px', fontWeight: 'bold' }}>⚙️ Link Options</legend>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={includeDialect}
                onChange={(e) => setIncludeDialect(e.target.checked)}
              />
              <span>Include Selected Dialect (<strong>{currentDialect}</strong>)</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={autoRun}
                onChange={(e) => setAutoRun(e.target.checked)}
              />
              <span>Automatically Run Query on Link Open</span>
            </label>
          </div>
        </fieldset>

        {/* Embed Section Toggle */}
        <div style={{ marginBottom: '12px' }}>
          <button
            className="win95-button"
            style={{ fontSize: '10px', padding: '2px 6px' }}
            onClick={() => setShowEmbedCode((prev) => !prev)}
          >
            {showEmbedCode ? '▲ Hide Embed Code' : '🖼️ Get Embed HTML <iframe>'}
          </button>

          {showEmbedCode && (
            <textarea
              readOnly
              className="win95-sunken"
              value={embedCode}
              rows={3}
              onClick={(e) => (e.target as HTMLTextAreaElement).select()}
              style={{
                width: '100%',
                marginTop: '6px',
                padding: '4px',
                fontSize: '10px',
                fontFamily: 'var(--w95-mono)',
                boxSizing: 'border-box',
                background: 'var(--w95-sunken-bg, #ffffff)',
                color: 'var(--w95-sunken-text, #000000)',
              }}
            />
          )}
        </div>

        {/* Bottom Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
          <button
            className="win95-button"
            style={{ minWidth: '70px' }}
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
