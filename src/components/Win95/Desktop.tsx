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
import { MobileLanding } from './MobileLanding';
import { LegalWindow } from './LegalWindow';
import { useAuth } from '../../hooks/useAuth';
import { AuthWindow } from './AuthWindow';
import { AdminDashboard, SessionStats } from './AdminDashboard';
import { ErrorBoundary } from './ErrorBoundary';
import { SQLDictionaryWindow } from './SQLDictionaryWindow';
import { DialectName } from '../../data/dialectCommands';



const DEFAULT_QUERY = `-- Welcome to ExNihilo 95!
-- Try querying any table below (even if it doesn't exist yet):

SELECT o.id, c.name, c.age, o.total 
FROM orders o 
INNER JOIN customers c ON o.customer_id = c.id 
WHERE c.age > 25;`;

export const Desktop: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const executor = useMemo(() => new SQLExecutor(), []);

  // Auth Hook
  const {
    currentUser,
    activeSession,
    isLoggedIn,
    isSecureContext,
    sessionExpiredNotice,
    dismissSessionNotice,
    signUp,
    login,
    changePassword,
    logout,
    deleteAccount,
  } = useAuth();

  // Session Stats State
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    queriesRun: 0,
    rowsGenerated: 0,
    sessionStartTime: Date.now(),
    queryHistory: [],
  });

  // Window State
  const [windowOrder, setWindowOrder] = useState<string[]>(['ide', 'welcome']);
  const [openWindows, setOpenWindows] = useState<Record<string, boolean>>({
    ide: true,
    welcome: true,
    help: false,
    sqlDictionary: false,
    wizard: false,
    settings: false,
    shutdown: false,
    contributors: false,
    legal: false,
    auth: false,
    admin: false,
  });
  const [minimizedWindows, setMinimizedWindows] = useState<Record<string, boolean>>({
    ide: false,
    welcome: false,
    help: false,
    sqlDictionary: false,
    wizard: false,
    settings: false,
    shutdown: false,
    contributors: false,
    legal: false,
    auth: false,
    admin: false,
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

  const handleTryInIde = (query: string, targetDialect: DialectName) => {
    setDialect(targetDialect as Dialect);
    setQueryText(query);
    setMinimizedWindows((prev) => ({ ...prev, ide: false }));
    setOpenWindows((prev) => ({ ...prev, ide: true }));
    focusWindow('ide');
  };


  // Mobile Viewport Detection & Force Desktop Override
  const [isMobileViewport, setIsMobileViewport] = useState<boolean>(false);
  const [forceDesktop, setForceDesktop] = useState<boolean>(false);

  useEffect(() => {
    const checkMobile = () => {
      const isMobileSize = window.innerWidth < 1024;
      const isTouchUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobileViewport(isMobileSize || isTouchUserAgent);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
    if (id === 'ide') {
      setTourOpen(false);
    }
  };

  const toggleMinimize = (id: string) => {
    setMinimizedWindows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getZIndex = (id: string) => {
    const idx = windowOrder.indexOf(id);
    return idx === -1 ? 10 : 10 + idx * 5;
  };

  // Handle Logout (Resets session usage stats cleanly)
  const handleLogout = () => {
    logout();
    setSessionStats({
      queriesRun: 0,
      rowsGenerated: 0,
      sessionStartTime: Date.now(),
      queryHistory: [],
    });
    closeWindow('admin');
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

        // Calculate rows generated
        const rowsCount = res.rowCount || 0;
        const now = new Date().toLocaleTimeString();

        setSessionStats((prev) => ({
          ...prev,
          queriesRun: prev.queriesRun + 1,
          rowsGenerated: prev.rowsGenerated + rowsCount,
          queryHistory: [
            { sql: targetSql.split('\n')[0].substring(0, 60), timeMs: res.executionTimeMs, timestamp: now },
            ...prev.queryHistory.slice(0, 9),
          ],
        }));
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

  // Global F5 Intercept: Prevents browser page refresh and executes query if IDE is open
  useEffect(() => {
    const handleGlobalF5 = (e: KeyboardEvent) => {
      if (e.key === 'F5' || e.code === 'F5') {
        e.preventDefault();
        e.stopPropagation();
        if (openWindows.ide && !minimizedWindows.ide) {
          handleRunQuery();
        }
      }
    };

    window.addEventListener('keydown', handleGlobalF5, true);
    return () => window.removeEventListener('keydown', handleGlobalF5, true);
  }, [openWindows.ide, minimizedWindows.ide, handleRunQuery]);

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

  // Mobile Landing Screen Guard
  if (isMobileViewport && !forceDesktop) {
    return <MobileLanding onForceDesktop={() => setForceDesktop(true)} />;
  }

  const windowsMeta: WindowMeta[] = [
    { id: 'ide', title: 'ExNihilo SQL Studio', icon: '🗄️', isOpen: openWindows.ide, isMinimized: minimizedWindows.ide, zIndex: getZIndex('ide') },
    { id: 'welcome', title: 'Welcome to ExNihilo 95', icon: '✨', isOpen: openWindows.welcome, isMinimized: minimizedWindows.welcome, zIndex: getZIndex('welcome') },
    { id: 'sqlDictionary', title: '📖 SQL Dictionary', icon: '📖', isOpen: openWindows.sqlDictionary, isMinimized: minimizedWindows.sqlDictionary, zIndex: getZIndex('sqlDictionary') },
    { id: 'help', title: 'ExNihilo Query Guide', icon: '❓', isOpen: openWindows.help, isMinimized: minimizedWindows.help, zIndex: getZIndex('help') },
    { id: 'wizard', title: 'Setup Wizard', icon: '🧙‍♂️', isOpen: openWindows.wizard, isMinimized: minimizedWindows.wizard, zIndex: getZIndex('wizard') },
    { id: 'settings', title: 'Options & Control Panel', icon: '⚙️', isOpen: openWindows.settings, isMinimized: false, zIndex: getZIndex('settings') },
    { id: 'contributors', title: 'Join the Team', icon: '🤝', isOpen: openWindows.contributors, isMinimized: minimizedWindows.contributors, zIndex: getZIndex('contributors') },
    { id: 'legal', title: 'Legal & IP Protection', icon: '⚖️', isOpen: openWindows.legal, isMinimized: minimizedWindows.legal, zIndex: getZIndex('legal') },
    { id: 'auth', title: 'Security Logon', icon: '🔑', isOpen: openWindows.auth, isMinimized: false, zIndex: getZIndex('auth') },
    { id: 'admin', title: 'Admin Control Panel', icon: '🎛️', isOpen: openWindows.admin, isMinimized: false, zIndex: getZIndex('admin') },
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
              onClick={() => focusWindow('sqlDictionary')}
            >
              📖 SQL Dictionary
            </button>
            <button
              className="win95-button"
              style={{ fontSize: '11px', padding: '2px 8px' }}
              onClick={() => focusWindow('help')}
            >
              ❓ Query Tutorial
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
        {/* Admin / Account Icon */}
        <div
          className="win95-desktop-icon"
          onDoubleClick={() => focusWindow(isLoggedIn ? 'admin' : 'auth')}
          onClick={() => focusWindow(isLoggedIn ? 'admin' : 'auth')}
          title={isLoggedIn ? `Logged in as ${currentUser?.displayName}` : 'Log in or Register'}
        >
          <div className="icon-symbol" style={{ opacity: isSecureContext ? 1 : 0.5 }}>
            {isLoggedIn ? (currentUser?.avatar || '🎛️') : '🎛️'}
          </div>
          <span>{isLoggedIn ? `${currentUser?.avatar || '🎛️'} ${currentUser?.displayName}` : '🎛️ Admin Control'}</span>
        </div>

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
          onDoubleClick={() => focusWindow('sqlDictionary')}
          onClick={() => focusWindow('sqlDictionary')}
          title="SQL Dictionary & Dialect Reference"
        >
          <div className="icon-symbol">📖</div>
          <span>SQL Dictionary</span>
        </div>

        <div
          className="win95-desktop-icon"
          onDoubleClick={() => focusWindow('help')}
          onClick={() => focusWindow('help')}
        >
          <div className="icon-symbol">❓</div>
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
          onClick={() => focusWindow('legal')}
        >
          <div className="icon-symbol">⚖️</div>
          <span>Legal & IP Notice</span>
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
      {openWindows.ide && (
        <ErrorBoundary>
          <IDEShell
            isOpen={openWindows.ide}
            isMinimized={minimizedWindows.ide}
            zIndex={getZIndex('ide')}
            executor={executor}
            dialect={dialect}
            initialQueryText={queryText}
            initialResult={result}
            initialIsLoading={isLoading}
            initialExecutionTimeMs={executionTimeMs}
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
        </ErrorBoundary>
      )}

      {/* Auth Window (Log In & Create Account) */}
      <AuthWindow
        isOpen={openWindows.auth}
        zIndex={getZIndex('auth')}
        isSecureContext={isSecureContext}
        onClose={() => closeWindow('auth')}
        onFocus={() => focusWindow('auth')}
        onSignUp={signUp}
        onLogin={async (user, pass) => {
          const res = await login(user, pass);
          if (res.success) {
            closeWindow('auth');
            focusWindow('admin');
          }
          return res;
        }}
        currentUser={currentUser}
      />

      {/* Admin Dashboard Window */}
      <AdminDashboard
        isOpen={openWindows.admin}
        zIndex={getZIndex('admin')}
        currentUser={currentUser}
        activeSession={activeSession}
        sessionStats={sessionStats}
        onClose={() => closeWindow('admin')}
        onFocus={() => focusWindow('admin')}
        onLogout={handleLogout}
        onDeleteAccount={async () => {
          const res = await deleteAccount();
          if (res.success) {
            handleLogout();
          }
          return res;
        }}
        onChangePassword={changePassword}
        onClearHistory={() => setSessionStats((prev) => ({ ...prev, queryHistory: [] }))}
      />

      {/* SQL Dictionary & Dialect Reference Window */}
      <SQLDictionaryWindow
        isOpen={openWindows.sqlDictionary}
        isMinimized={minimizedWindows.sqlDictionary}
        isMaximized={false}
        zIndex={getZIndex('sqlDictionary')}
        onClose={() => closeWindow('sqlDictionary')}
        onMinimize={() => toggleMinimize('sqlDictionary')}
        onMaximize={() => {}}
        onFocus={() => focusWindow('sqlDictionary')}
        onTryInIde={handleTryInIde}
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
            legal: false,
            auth: false,
            admin: false,
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

      {/* Legal & IP Protection Window */}
      <LegalWindow
        isOpen={openWindows.legal}
        isMinimized={minimizedWindows.legal}
        zIndex={getZIndex('legal')}
        onClose={() => closeWindow('legal')}
        onMinimize={() => toggleMinimize('legal')}
        onFocus={() => focusWindow('legal')}
      />

      {/* Interactive Tour Balloon */}
      <Win95Tour
        isOpen={tourOpen}
        onClose={() => setTourOpen(false)}
        onOpenHelp={() => focusWindow('help')}
      />

      {/* Session Expired Win95 Notification Modal */}
      {sessionExpiredNotice && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999999,
          }}
        >
          <div className="win95-window" style={{ width: '340px' }}>
            <div className="win95-titlebar" style={{ background: '#800000' }}>
              <div className="win95-titlebar-text">
                <span>⚠️</span>
                <span>Session Expired</span>
              </div>
            </div>

            <div style={{ padding: '16px', fontSize: '11px', lineHeight: '1.4' }}>
              Your session has ended for security reasons (24h TTL). Please log in again.
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: '12px' }}>
              <button
                className="win95-button"
                style={{ minWidth: '80px', fontWeight: 'bold' }}
                onClick={() => {
                  dismissSessionNotice();
                  closeWindow('admin');
                  focusWindow('auth');
                }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Taskbar */}
      <Taskbar
        windows={windowsMeta}
        activeWindowId={activeWindowId}
        currentUser={currentUser}
        isLoggedIn={isLoggedIn}
        isSecureContext={isSecureContext}
        onFocusWindow={focusWindow}
        onToggleMinimize={toggleMinimize}
        onOpenWindow={focusWindow}
        onResetSession={handleResetSession}
        onLogout={handleLogout}
      />
    </div>
  );
};
