/**
 * Desktop.tsx — Main Windows 95 Desktop Environment
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Dialect } from '../../engine/parser';
import { SQLExecutor, ExecutionSuccess } from '../../engine/executor';
import { ClassifiedError, classifyError } from '../../engine/errors';
import { Taskbar, WindowMeta } from './Taskbar';
import { IDEShell } from '../IDE/IDEShell';
import { HelpWindow } from './HelpWindow';
import { SetupWizard } from './SetupWizard';
import { SettingsDialog } from './SettingsDialog';
import { ErrorDialog } from './ErrorDialog';
import { WelcomeWindow } from './WelcomeWindow';
import { Win95Tour } from '../Tour/Win95Tour';
import { BootAnimation } from './BootAnimation';
import { ShutDownDialog } from './ShutDownDialog';
import { ContributorsWindow } from './ContributorsWindow';

const DEFAULT_QUERY = `-- Welcome to ExNihilo 95!
-- Try querying any table below (even if it doesn't exist yet):

SELECT o.id, c.name, c.age, o.total 
FROM orders o 
INNER JOIN customers c ON o.customer_id = c.id 
WHERE c.age > 25;`;

export const Desktop: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const executor = useMemo(() => new SQLExecutor(), []);

  // Window State
  const [windowOrder, setWindowOrder] = useState<string[]>(['ide', 'welcome']);
  const [openWindows, setOpenWindows] = useState<Record<string, boolean>>({
    ide: true,
    welcome: true,
    help: false,
    wizard: false,
    settings: false,
    shutdown: false,
    contributors: false,
  });
  const [minimizedWindows, setMinimizedWindows] = useState<Record<string, boolean>>({
    ide: false,
    welcome: false,
    help: false,
    wizard: false,
    settings: false,
    shutdown: false,
    contributors: false,
  });

  // Boot Animation State
  const [showBootAnimation, setShowBootAnimation] = useState(true);

  // Tour State
  const [tourOpen, setTourOpen] = useState(false);

  // Settings State
  const [rowsPerTable, setRowsPerTable] = useState(20);
  const [tableCap, setTableCap] = useState(25);
  const [dialect, setDialect] = useState<Dialect>('MySQL');

  // IDE State
  const [queryText, setQueryText] = useState(DEFAULT_QUERY);
  const [result, setResult] = useState<ExecutionSuccess | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [executionTimeMs, setExecutionTimeMs] = useState<number | null>(null);
  const [activeError, setActiveError] = useState<ClassifiedError | null>(null);

  useEffect(() => {
    setMounted(true);
    // Initialize DB
    executor.init().catch(console.error);
  }, [executor]);

  // Window Management
  const focusWindow = (id: string) => {
    setOpenWindows((prev) => ({ ...prev, [id]: true }));
    setMinimizedWindows((prev) => ({ ...prev, [id]: false }));
    setWindowOrder((prev) => [...prev.filter((w) => w !== id), id]);
  };

  const closeWindow = (id: string) => {
    setOpenWindows((prev) => ({ ...prev, [id]: false }));
  };

  const toggleMinimize = (id: string) => {
    setMinimizedWindows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getZIndex = (id: string) => {
    const idx = windowOrder.indexOf(id);
    return idx === -1 ? 10 : 10 + idx * 5;
  };

  // Run Query (Supports highlighted query execution or full multi-query execution)
  const handleRunQuery = async (customQueryText?: string) => {
    if (isLoading) return;
    setIsLoading(true);
    setActiveError(null);

    const targetSql = typeof customQueryText === 'string' && customQueryText.trim()
      ? customQueryText.trim()
      : queryText;

    try {
      const res = await executor.execute(targetSql, dialect, {
        rowsPerTable,
        tableCap,
      });

      if (res.ok) {
        setResult(res);
        setExecutionTimeMs(res.executionTimeMs);
      } else {
        const classified = classifyError(res);
        setActiveError(classified);
      }
    } catch (err: any) {
      const classified = classifyError(err);
      setActiveError(classified);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset Session
  const handleResetSession = () => {
    executor.reset();
    setResult(null);
    setExecutionTimeMs(null);
    setActiveError(null);
  };

  // Load Query from Help / Tutorial
  const handleLoadQuery = (sql: string, newDialect?: string) => {
    setQueryText(sql);
    if (newDialect) setDialect(newDialect as Dialect);
    setOpenWindows((prev) => ({ ...prev, help: false }));
    focusWindow('ide');
  };

  if (!mounted) {
    return (
      <div style={{ background: '#008080', width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
        Starting ExNihilo 95...
      </div>
    );
  }

  const windowsMeta: WindowMeta[] = [
    { id: 'ide', title: 'ExNihilo SQL Studio', icon: '🗄️', isOpen: openWindows.ide, isMinimized: minimizedWindows.ide, zIndex: getZIndex('ide') },
    { id: 'welcome', title: 'Welcome to ExNihilo 95', icon: '✨', isOpen: openWindows.welcome, isMinimized: minimizedWindows.welcome, zIndex: getZIndex('welcome') },
    { id: 'help', title: 'ExNihilo Query Guide', icon: '📖', isOpen: openWindows.help, isMinimized: minimizedWindows.help, zIndex: getZIndex('help') },
    { id: 'wizard', title: 'Setup Wizard', icon: '🧙‍♂️', isOpen: openWindows.wizard, isMinimized: minimizedWindows.wizard, zIndex: getZIndex('wizard') },
    { id: 'settings', title: 'Options & Control Panel', icon: '⚙️', isOpen: openWindows.settings, isMinimized: false, zIndex: getZIndex('settings') },
    { id: 'contributors', title: 'Join the Team', icon: '🤝', isOpen: openWindows.contributors, isMinimized: minimizedWindows.contributors, zIndex: getZIndex('contributors') },
  ];

  const activeWindowId = windowOrder[windowOrder.length - 1] || null;

  return (
    <div className="win95-desktop">
      {/* 3D Desktop Wallpaper Centerpiece */}
      <div className="win95-wallpaper-center">
        <div className="win95-3d-logo-box">
          <div className="win95-flag-container">
            <div className="win95-flag-tile win95-flag-red" />
            <div className="win95-flag-tile win95-flag-green" />
            <div className="win95-flag-tile win95-flag-blue" />
            <div className="win95-flag-tile win95-flag-yellow" />
          </div>
          <h1 className="win95-3d-title">
            EXNIHILO<span className="win95-3d-edition">95</span>
          </h1>
        </div>

        <div className="win95-3d-subtitle">
          Intelligent Zero-Config SQL Development Environment
        </div>

        <div className="win95-3d-badge">
          <div className="win95-3d-badge-text">
            👨‍💻 <strong>Built by:</strong>{' '}
            <a
              href="https://github.com/Mrityunjai-hue"
              target="_blank"
              rel="noopener noreferrer"
              className="win95-3d-badge-link"
            >
              Mrityunjai
            </a>
            &nbsp;•&nbsp; 🌐 <strong>Powered by:</strong>{' '}
            <a
              href="https://n8n-ds-community.netlify.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="win95-3d-badge-link"
            >
              N8N Data Science Community
            </a>{' '}
            using AI
          </div>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '6px' }}>
            <button
              className="win95-button"
              style={{ fontSize: '11px', padding: '2px 8px' }}
              onClick={() => focusWindow('ide')}
            >
              🗄️ Open SQL Studio
            </button>
            <button
              className="win95-button"
              style={{ fontSize: '11px', padding: '2px 8px' }}
              onClick={() => focusWindow('help')}
            >
              📖 SQL Query Guide
            </button>
            <button
              className="win95-button"
              style={{ fontSize: '11px', padding: '2px 8px' }}
              onClick={() => setTourOpen(true)}
            >
              💡 Guided Tour
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Shortcut Icons */}
      <div className="win95-icon-grid" style={{ position: 'relative', zIndex: 2 }}>
        <div
          className="win95-desktop-icon"
          onDoubleClick={() => focusWindow('welcome')}
          onClick={() => focusWindow('welcome')}
        >
          <div className="icon-symbol">✨</div>
          <span>About ExNihilo</span>
        </div>

        <div
          className="win95-desktop-icon"
          onDoubleClick={() => focusWindow('ide')}
          onClick={() => focusWindow('ide')}
        >
          <div className="icon-symbol">🗄️</div>
          <span>ExNihilo SQL IDE</span>
        </div>

        <div
          className="win95-desktop-icon"
          onDoubleClick={() => focusWindow('help')}
          onClick={() => focusWindow('help')}
        >
          <div className="icon-symbol">📖</div>
          <span>Query Tutorial</span>
        </div>

        <div
          className="win95-desktop-icon"
          onDoubleClick={() => focusWindow('wizard')}
          onClick={() => focusWindow('wizard')}
        >
          <div className="icon-symbol">🧙‍♂️</div>
          <span>Setup Wizard</span>
        </div>

        <div
          className="win95-desktop-icon"
          onDoubleClick={() => focusWindow('settings')}
          onClick={() => focusWindow('settings')}
        >
          <div className="icon-symbol">⚙️</div>
          <span>Options & Config</span>
        </div>

        <div
          className="win95-desktop-icon"
          onClick={() => setTourOpen(true)}
        >
          <div className="icon-symbol">💡</div>
          <span>Guided Tour</span>
        </div>

        <div
          className="win95-desktop-icon"
          onClick={() => setShowBootAnimation(true)}
          title="Play Windows 95 Opening Animation"
        >
          <div className="icon-symbol">🔄</div>
          <span>Reboot 95</span>
        </div>

        <div
          className="win95-desktop-icon"
          onClick={() => focusWindow('contributors')}
        >
          <div className="icon-symbol">🤝</div>
          <span>Join the Team</span>
        </div>

        <div
          className="win95-desktop-icon"
          onClick={handleResetSession}
        >
          <div className="icon-symbol">🗑️</div>
          <span>Recycle Bin (Reset)</span>
        </div>
      </div>

      {/* Opening Boot Animation */}
      {showBootAnimation && (
        <BootAnimation onComplete={() => setShowBootAnimation(false)} />
      )}

      {/* Landing / Welcome Information Dialog */}
      <WelcomeWindow
        isOpen={openWindows.welcome}
        zIndex={getZIndex('welcome')}
        onClose={() => closeWindow('welcome')}
        onStartTour={() => {
          setTourOpen(true);
        }}
        onOpenHelp={() => focusWindow('help')}
        onOpenIDE={() => focusWindow('ide')}
        onFocus={() => focusWindow('welcome')}
      />

      {/* SQL IDE Shell Window */}
      <IDEShell
        isOpen={openWindows.ide}
        isMinimized={minimizedWindows.ide}
        zIndex={getZIndex('ide')}
        executor={executor}
        dialect={dialect}
        queryText={queryText}
        result={result}
        isLoading={isLoading}
        executionTimeMs={executionTimeMs}
        onQueryChange={setQueryText}
        onDialectChange={setDialect}
        onRun={handleRunQuery}
        onReset={handleResetSession}
        onClose={() => closeWindow('ide')}
        onMinimize={() => toggleMinimize('ide')}
        onFocus={() => focusWindow('ide')}
        onOpenHelp={() => focusWindow('help')}
        onOpenSettings={() => focusWindow('settings')}
        onStartTour={() => setTourOpen(true)}
      />

      {/* Help / Query Tutorial Window */}
      <HelpWindow
        isOpen={openWindows.help}
        isMinimized={minimizedWindows.help}
        zIndex={getZIndex('help')}
        onClose={() => closeWindow('help')}
        onMinimize={() => toggleMinimize('help')}
        onFocus={() => focusWindow('help')}
        onLoadQuery={handleLoadQuery}
      />

      {/* Setup Wizard Window */}
      <SetupWizard
        isOpen={openWindows.wizard}
        isMinimized={minimizedWindows.wizard}
        zIndex={getZIndex('wizard')}
        onClose={() => closeWindow('wizard')}
        onMinimize={() => toggleMinimize('wizard')}
        onFocus={() => focusWindow('wizard')}
        onFinish={() => focusWindow('ide')}
      />

      {/* Settings / Options Dialog */}
      <SettingsDialog
        isOpen={openWindows.settings}
        zIndex={getZIndex('settings')}
        currentDialect={dialect}
        rowsPerTable={rowsPerTable}
        tableCap={tableCap}
        onSave={(r, c, d) => {
          setRowsPerTable(r);
          setTableCap(c);
          setDialect(d);
        }}
        onClose={() => closeWindow('settings')}
        onFocus={() => focusWindow('settings')}
      />

      {/* Error / Warning Dialog */}
      <ErrorDialog
        error={activeError}
        zIndex={99999}
        onClose={() => setActiveError(null)}
        onFocus={() => {}}
      />

      {/* Authentic Shut Down Dialog */}
      <ShutDownDialog
        isOpen={openWindows.shutdown}
        zIndex={getZIndex('shutdown')}
        onClose={() => closeWindow('shutdown')}
        onFocus={() => focusWindow('shutdown')}
        onRestart={() => setShowBootAnimation(true)}
        onClearAndRestart={() => {
          handleResetSession();
          setShowBootAnimation(true);
        }}
        onCloseAllWindows={() => {
          setOpenWindows({
            ide: false,
            welcome: false,
            help: false,
            wizard: false,
            settings: false,
            shutdown: false,
            contributors: false,
          });
        }}
      />

      {/* Contributors / Join the Team Window */}
      <ContributorsWindow
        isOpen={openWindows.contributors}
        isMinimized={minimizedWindows.contributors}
        zIndex={getZIndex('contributors')}
        onClose={() => closeWindow('contributors')}
        onMinimize={() => toggleMinimize('contributors')}
        onFocus={() => focusWindow('contributors')}
      />

      {/* Interactive Tour Balloon */}
      <Win95Tour
        isOpen={tourOpen}
        onClose={() => setTourOpen(false)}
        onOpenHelp={() => focusWindow('help')}
      />

      {/* Taskbar */}
      <Taskbar
        windows={windowsMeta}
        activeWindowId={activeWindowId}
        onFocusWindow={focusWindow}
        onToggleMinimize={toggleMinimize}
        onOpenWindow={focusWindow}
        onResetSession={handleResetSession}
      />
    </div>
  );
};
