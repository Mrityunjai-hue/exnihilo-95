/**
 * Desktop.tsx — Main Windows 95 Desktop Environment
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Dialect } from '../../engine/parser';
import { SQLExecutor, ExecutionSuccess } from '../../engine/executor';
import dynamic from 'next/dynamic';
import { ClassifiedError, classifyError } from '../../engine/errors';
import { Taskbar, WindowMeta } from './Taskbar';
import { IDEShell } from '../IDE/IDEShell';
import { ErrorDialog } from './ErrorDialog';
import { MobileLanding } from './MobileLanding';
import { CookieConsentDialog, getStoredCookiePreferences } from './CookieConsentDialog';
import { useAuth } from '../../hooks/useAuth';
import { ErrorBoundary } from './ErrorBoundary';
import { DialectName } from '../../data/dialectCommands';
import { clearWorkspaceStorage } from '../../hooks/useWorkspaceStorage';
import { decodeSharePayload } from '../../utils/shareEncoder';
import type { SessionStats } from './AdminDashboard';
import type { TabId as LegalTabId } from './LegalWindow';

const WindowLoader = () => (
  <div className="win95-window" style={{ padding: 16, fontSize: 12 }}>
    ⏳ Loading module...
  </div>
);

const ChallengeWindow = dynamic(
  () => import('./ChallengeWindow').then((m) => m.ChallengeWindow),
  { ssr: false, loading: WindowLoader }
);
const DetectiveWindow = dynamic(
  () => import('../Detective/DetectiveWindow').then((m) => m.DetectiveWindow),
  { ssr: false, loading: WindowLoader }
);
const ERDViewer = dynamic(
  () => import('../IDE/ERDViewer').then((m) => m.ERDViewer),
  { ssr: false, loading: WindowLoader }
);
const AdminDashboard = dynamic(
  () => import('./AdminDashboard').then((m) => m.AdminDashboard),
  { ssr: false, loading: WindowLoader }
);
const SQLDictionaryWindow = dynamic(
  () => import('./SQLDictionaryWindow').then((m) => m.SQLDictionaryWindow),
  { ssr: false, loading: WindowLoader }
);
const HelpWindow = dynamic(() => import('./HelpWindow').then((m) => m.HelpWindow), { ssr: false });
const SetupWizard = dynamic(() => import('./SetupWizard').then((m) => m.SetupWizard), { ssr: false });
const SettingsDialog = dynamic(() => import('./SettingsDialog').then((m) => m.SettingsDialog), { ssr: false });
const WelcomeWindow = dynamic(() => import('./WelcomeWindow').then((m) => m.WelcomeWindow), { ssr: false });
const LegalWindow = dynamic(() => import('./LegalWindow').then((m) => m.LegalWindow), { ssr: false });
const ContributorsWindow = dynamic(() => import('./ContributorsWindow').then((m) => m.ContributorsWindow), { ssr: false });
const AuthWindow = dynamic(() => import('./AuthWindow').then((m) => m.AuthWindow), { ssr: false });
const BootAnimation = dynamic(() => import('./BootAnimation').then((m) => m.BootAnimation), { ssr: false });
const Win95Tour = dynamic(() => import('../Tour/Win95Tour').then((m) => m.Win95Tour), { ssr: false });
const ShutDownDialog = dynamic(() => import('./ShutDownDialog').then((m) => m.ShutDownDialog), { ssr: false });
const NetworkStatusDialog = dynamic(() => import('./NetworkStatusDialog').then((m) => m.NetworkStatusDialog), { ssr: false });
const MacLaunchpad = dynamic(() => import('../Mac/MacLaunchpad').then((m) => m.MacLaunchpad), { ssr: false });

import {
  AuthorShieldIcon,
  RebootIcon,
  AboutIcon,
  TeamIcon,
  IdeIcon,
  LegalIcon,
  DictionaryIcon,
  RecycleBinIcon,
  TutorialIcon,
  WizardIcon,
  OptionsIcon,
  TourIcon,
  ChallengeIcon,
  DetectiveIcon,
} from './Win95Icons';

import { useTheme } from '../../hooks/useTheme';
import { MacMenuBar } from '../Mac/MacMenuBar';
import { ExNihiloLogo } from '../Brand/ExNihiloLogo';

const DEFAULT_QUERY = `-- Welcome to ExNihilo 95!
-- Try querying any table below (even if it doesn't exist yet):

SELECT o.id, c.name, c.age, o.total 
FROM orders o 
INNER JOIN customers c ON o.customer_id = c.id 
WHERE c.age > 25;`;

export const Desktop: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const { activeTheme } = useTheme();
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

  // Window State with LocalStorage Persistence
  const [windowOrder, setWindowOrder] = useState<string[]>(['ide']);
  const [openWindows, setOpenWindows] = useState<Record<string, boolean>>(() => {
    const defaults = {
      ide: true,
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
      challenges: false,
      erd: false,
      detective: false,
    };
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('exnihilo_open_windows');
        if (stored) {
          const parsed = JSON.parse(stored);
          return { ...defaults, ...parsed };
        }
      } catch {}
    }
    return defaults;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('exnihilo_open_windows', JSON.stringify(openWindows));
      } catch {}
    }
  }, [openWindows]);
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
    challenges: false,
    erd: false,
    detective: false,
  });

  // Safe Mode State
  const [isSafeMode, setIsSafeMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('mode') === 'safe';
    }
    return false;
  });

  // Boot Animation State (bypassed in safe mode)
  const [showBootAnimation, setShowBootAnimation] = useState(() => {
    if (typeof window !== 'undefined') {
      if (new URLSearchParams(window.location.search).get('mode') === 'safe') return false;
    }
    return true;
  });

  // Tour State
  const [tourOpen, setTourOpen] = useState(false);

  // Network / Dial-Up Offline Status State
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });
  const [networkDialogOpen, setNetworkDialogOpen] = useState(false);
  const [networkToast, setNetworkToast] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOffline = () => {
      setIsOnline(false);
      setNetworkDialogOpen(true);
    };

    const handleOnline = () => {
      setIsOnline(true);
      setNetworkToast('Dial-Up Networking: Carrier detected (28,800 bps)');
      setTimeout(() => setNetworkToast(null), 4000);
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  // CRT Monitor Filter State
  const [crtEnabled, setCrtEnabled] = useState<boolean>(false);

  // macOS Launchpad Overlay State
  const [launchpadOpen, setLaunchpadOpen] = useState(false);

  // Cookie Consent & Legal Navigation State
  const [cookieConsentOpen, setCookieConsentOpen] = useState(false);
  const [legalInitialTab, setLegalInitialTab] = useState<LegalTabId>('terms');

  // Automatically prompt Cookie Consent dialog on first boot
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const consent = getStoredCookiePreferences();
      if (!consent) {
        const timer = setTimeout(() => {
          setCookieConsentOpen(true);
        }, 1200);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCrt = localStorage.getItem('exnihilo_crt_enabled');
      if (savedCrt === 'true') {
        setCrtEnabled(true);
      }
    }
  }, []);

  const handleToggleCrt = () => {
    setCrtEnabled((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('exnihilo_crt_enabled', String(next));
      }
      return next;
    });
  };

  // Settings State with LocalStorage Persistence
  const [rowsPerTable, setRowsPerTableState] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('exnihilo_rows_per_table');
        if (stored) {
          const parsed = parseInt(stored, 10);
          if (!isNaN(parsed) && parsed > 0) return parsed;
        }
      } catch {}
    }
    return 20;
  });

  const setRowsPerTable = (val: number) => {
    const safeVal = Math.max(1, Math.min(1000, Number(val) || 20));
    setRowsPerTableState(safeVal);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('exnihilo_rows_per_table', String(safeVal));
      } catch {}
    }
  };
  const [tableCap, setTableCap] = useState(25);
  const [dialect, setDialectState] = useState<Dialect>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('exnihilo_active_dialect');
        if (stored) return stored as Dialect;
      } catch {}
    }
    return 'MySQL';
  });

  const setDialect = (d: Dialect) => {
    setDialectState(d);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('exnihilo_active_dialect', d);
      } catch {}
    }
  };

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

  // Share URL Link Hydration Engine
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hashOrSearch = window.location.hash || window.location.search;
      if (hashOrSearch && hashOrSearch.includes('share=')) {
        const payload = decodeSharePayload(hashOrSearch);
        if (payload && payload.queryText) {
          setQueryText(payload.queryText);
          if (payload.dialect) {
            setDialect(payload.dialect);
          }
          setShowBootAnimation(false);
          focusWindow('ide');
        }
      }
    }
  }, []);

  // Window Management
  const focusWindow = (id: string) => {
    setOpenWindows((prev) => ({ ...prev, [id]: true }));
    setMinimizedWindows((prev) => ({ ...prev, [id]: false }));
    setWindowOrder((prev) => [...prev.filter((w) => w !== id), id]);
  };

  const closeWindow = (id: string) => {
    setOpenWindows((prev) => ({ ...prev, [id]: false }));
    setMaximizedWindows((prev) => ({ ...prev, [id]: false }));
    if (id === 'ide') {
      setTourOpen(false);
    }
  };

  const toggleMinimize = (id: string) => {
    setMinimizedWindows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Maximized Windows State (Tracks fullscreen windows)
  const [maximizedWindows, setMaximizedWindows] = useState<Record<string, boolean>>({});
  const handleToggleMaximize = (id: string) => {
    setMaximizedWindows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const isAnyMaximized = Boolean(
    Object.entries(maximizedWindows).some(
      ([id, isMax]) => isMax && openWindows[id] && !minimizedWindows[id]
    )
  );

  const getZIndex = (id: string) => {
    const idx = windowOrder.indexOf(id);
    return idx === -1 ? 10 : 10 + idx * 5;
  };

  // Handle Start Guided Tour (Ensures ExNihilo SQL IDE is open, un-minimized, and focused)
  const handleStartGuidedTour = React.useCallback(() => {
    focusWindow('ide');
    setTourOpen(true);
  }, []);

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
            {
              sql: targetSql.split('\n')[0].substring(0, 60),
              timeMs: res.executionTimeMs,
              timestamp: now,
              rowCount: rowsCount,
            },
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
    clearWorkspaceStorage();
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
    { id: 'challenges', title: '🏆 SQL Challenge Arena', icon: '🏆', isOpen: openWindows.challenges, isMinimized: minimizedWindows.challenges, zIndex: getZIndex('challenges') },
    { id: 'detective', title: '🕵️ Case Files (Homicide Bureau)', icon: '🕵️', isOpen: openWindows.detective, isMinimized: minimizedWindows.detective, zIndex: getZIndex('detective') },
    { id: 'erd', title: '🌐 Relation Visualizer (ERD)', icon: '🌐', isOpen: openWindows.erd, isMinimized: minimizedWindows.erd, zIndex: getZIndex('erd') },
    { id: 'legal', title: 'Legal & IP Protection', icon: '⚖️', isOpen: openWindows.legal, isMinimized: minimizedWindows.legal, zIndex: getZIndex('legal') },
    { id: 'auth', title: 'Security Logon', icon: '🔑', isOpen: openWindows.auth, isMinimized: minimizedWindows.auth, zIndex: getZIndex('auth') },
    { id: 'admin', title: 'Admin Control Panel', icon: '🎛️', isOpen: openWindows.admin, isMinimized: minimizedWindows.admin, zIndex: getZIndex('admin') },
  ];

  const activeWindowId = windowOrder[windowOrder.length - 1] || null;
  const isMacTheme = activeTheme === 'macos-glass';

  return (
    <div className={`win95-desktop ${isMacTheme ? 'macos-desktop-layout' : ''}`}>
      {/* Safe Mode Watermarks and Top Recovery Banner */}
      {isSafeMode && (
        <>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              backgroundColor: '#000000',
              color: '#ffff00',
              borderBottom: '2px solid #808080',
              padding: '4px 12px',
              fontSize: '11px',
              fontFamily: 'var(--w95-mono, monospace)',
              zIndex: 999998,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>⚠️</span>
              <strong>WINDOWS 95 SAFE MODE (Diagnostic Recovery Environment)</strong>
              <span style={{ color: '#cccccc' }}>
                — Startup animations and heavy routines disabled.
              </span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="win95-button"
                style={{ fontSize: '10px', padding: '2px 8px' }}
                onClick={handleResetSession}
              >
                🧹 Reset Workspace
              </button>
              <button
                type="button"
                className="win95-button"
                style={{ fontSize: '10px', padding: '2px 8px', fontWeight: 'bold' }}
                onClick={() => {
                  window.location.href = window.location.pathname;
                }}
              >
                🔄 Normal Reboot
              </button>
            </div>
          </div>

          <div style={{ position: 'fixed', top: '30px', left: '10px', color: 'rgba(255,255,255,0.7)', fontFamily: 'monospace', fontSize: '12px', zIndex: 10, pointerEvents: 'none', textShadow: '1px 1px 0 #000' }}>Safe Mode</div>
          <div style={{ position: 'fixed', top: '30px', right: '10px', color: 'rgba(255,255,255,0.7)', fontFamily: 'monospace', fontSize: '12px', zIndex: 10, pointerEvents: 'none', textShadow: '1px 1px 0 #000' }}>Safe Mode</div>
          <div style={{ position: 'fixed', bottom: '38px', left: '10px', color: 'rgba(255,255,255,0.7)', fontFamily: 'monospace', fontSize: '12px', zIndex: 10, pointerEvents: 'none', textShadow: '1px 1px 0 #000' }}>Safe Mode</div>
          <div style={{ position: 'fixed', bottom: '38px', right: '10px', color: 'rgba(255,255,255,0.7)', fontFamily: 'monospace', fontSize: '12px', zIndex: 10, pointerEvents: 'none', textShadow: '1px 1px 0 #000' }}>Safe Mode</div>
        </>
      )}

      {/* Network Carrier Toast Notification */}
      {networkToast && (
        <div
          className="win95-window"
          style={{
            position: 'fixed',
            bottom: '36px',
            right: '12px',
            zIndex: 999990,
            padding: '6px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '11px',
            boxShadow: '2px 2px 8px rgba(0,0,0,0.5)',
          }}
        >
          <span>📟</span>
          <span>{networkToast}</span>
        </div>
      )}

      {/* Native macOS Top Menu Bar */}
      {isMacTheme && (
        <MacMenuBar
          onOpenWindow={focusWindow}
          activeWindowId={activeWindowId}
          dialect={dialect}
          onDialectChange={setDialect}
          currentUser={currentUser}
          isLoggedIn={isLoggedIn}
          isSecureContext={isSecureContext}
          crtEnabled={crtEnabled}
          onToggleCrt={handleToggleCrt}
          onResetSession={handleResetSession}
          onLogout={handleLogout}
          onRunQuery={() => handleRunQuery()}
          onStartTour={handleStartGuidedTour}
          onToggleLaunchpad={() => setLaunchpadOpen((prev) => !prev)}
        />
      )}

      {/* Desktop Wallpaper Centerpiece */}
      {isMacTheme ? (
        <div className="mac-wallpaper-center">
          <div className="mac-hero-emblem-box">
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
              <ExNihiloLogo size={62} showText={true} />
            </div>
            <p className="mac-hero-subtitle" style={{ marginTop: '8px' }}>
              Intelligent Zero-Config In-Browser Relational SQL Studio
            </p>
          </div>

          <div className="mac-hero-action-pills">
            <button
              type="button"
              className="mac-pill-btn mac-pill-primary"
              onClick={() => focusWindow('ide')}
            >
              <span>▶</span>
              <strong>Open SQL Studio</strong>
            </button>
            <button
              type="button"
              className="mac-pill-btn"
              onClick={() => focusWindow('challenges')}
            >
              <span>🏆</span>
              <span>Challenge Arena</span>
            </button>
            <button
              type="button"
              className="mac-pill-btn"
              onClick={() => focusWindow('detective')}
            >
              <span>🕵️</span>
              <span>Case Files</span>
            </button>
            <button
              type="button"
              className="mac-pill-btn"
              onClick={() => focusWindow('erd')}
            >
              <span>🌐</span>
              <span>Relation Visualizer</span>
            </button>
            <button
              type="button"
              className="mac-pill-btn"
              onClick={() => focusWindow('sqlDictionary')}
            >
              <span>📖</span>
              <span>SQL Dictionary</span>
            </button>
            <button
              type="button"
              className="mac-pill-btn"
              onClick={() => focusWindow('help')}
            >
              <span>❓</span>
              <span>Tutorial</span>
            </button>
            <button
              type="button"
              className="mac-pill-btn"
              onClick={() => setTourOpen(true)}
            >
              <span>✦</span>
              <span>Guided Tour</span>
            </button>
          </div>

          <div className="mac-attribution-glass-badge">
            👨‍💻 <strong>Built by:</strong>{' '}
            <a
              href="https://github.com/Mrityunjai-hue"
              target="_blank"
              rel="noopener noreferrer"
              className="mac-attribution-link"
              onClick={(e) => {
                e.stopPropagation();
                window.open('https://github.com/Mrityunjai-hue', '_blank');
              }}
            >
              Mrityunjai
            </a>
            &nbsp;•&nbsp; 🌐 <strong>Powered by:</strong>{' '}
            <a
              href="https://n8n-ds-community.netlify.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="mac-attribution-link"
              onClick={(e) => {
                e.stopPropagation();
                window.open('https://n8n-ds-community.netlify.app/', '_blank');
              }}
            >
              N8N Data Science Community
            </a>{' '}
            using AI
          </div>
        </div>
      ) : (
        /* Retro Windows Wallpaper Centerpiece (Adapts dynamically to theme) */
        <div className="win95-wallpaper-center">
          <div className="win95-3d-logo-box" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <ExNihiloLogo size={56} showText={true} />
          </div>

          <div className="win95-3d-subtitle">
            Intelligent Zero-Config SQL Development Environment
          </div>

          <div className="win95-3d-badge">
            <div className="win95-3d-badge-text" style={{ position: 'relative', zIndex: 10 }}>
              👨‍💻 <strong>Built by:</strong>{' '}
              <a
                href="https://github.com/Mrityunjai-hue"
                target="_blank"
                rel="noopener noreferrer"
                className="win95-3d-badge-link"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open('https://github.com/Mrityunjai-hue', '_blank');
                }}
              >
                Mrityunjai
              </a>
              &nbsp;•&nbsp; 🌐 <strong>Powered by:</strong>{' '}
              <a
                href="https://n8n-ds-community.netlify.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="win95-3d-badge-link"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open('https://n8n-ds-community.netlify.app/', '_blank');
                }}
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
                onClick={() => focusWindow('challenges')}
              >
                🏆 Challenge Arena
              </button>
              <button
                className="win95-button"
                style={{ fontSize: '11px', padding: '2px 8px' }}
                onClick={() => focusWindow('detective')}
              >
                🕵️ Case Files
              </button>
              <button
                className="win95-button"
                style={{ fontSize: '11px', padding: '2px 8px' }}
                onClick={() => focusWindow('erd')}
              >
                🌐 Relation Visualizer
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
      )}

      {/* Desktop Shortcut Icons for Retro Themes */}
      {!isMacTheme && (
        <div className="win95-icon-grid" style={{ position: 'relative', zIndex: 2 }}>
          {/* Admin / Account Control Icon */}
          <div
            className="win95-desktop-icon"
            onDoubleClick={() => focusWindow(isLoggedIn ? 'admin' : 'auth')}
            onClick={() => focusWindow(isLoggedIn ? 'admin' : 'auth')}
            title={isLoggedIn ? `Logged in as ${currentUser?.displayName}` : 'Log in or Register User Account'}
          >
            <img src="/icons/author_shield.png" alt="User Account" />
            <span>{isLoggedIn ? currentUser?.displayName || 'User Account' : 'User Account'}</span>
          </div>

          <div
            className="win95-desktop-icon"
            onDoubleClick={() => focusWindow('welcome')}
            onClick={() => focusWindow('welcome')}
          >
            <img src="/icons/about_galaxy.png" alt="About ExNihilo" />
            <span>About ExNihilo</span>
          </div>

          <div
            className="win95-desktop-icon"
            onDoubleClick={() => focusWindow('ide')}
            onClick={() => focusWindow('ide')}
          >
            <img src="/icons/sql_ide.png" alt="ExNihilo SQL IDE" />
            <span>ExNihilo SQL IDE</span>
          </div>

          <div
            className="win95-desktop-icon"
            onDoubleClick={() => focusWindow('challenges')}
            onClick={() => focusWindow('challenges')}
            title="SQL Challenge Arena (130+ LeetCode Puzzles)"
          >
            <ChallengeIcon size={36} />
            <span>SQL Challenges</span>
          </div>

          <div
            className="win95-desktop-icon"
            onDoubleClick={() => focusWindow('detective')}
            onClick={() => focusWindow('detective')}
            title="SQL Noir: Department of Unsolved Homicides (1995)"
          >
            <DetectiveIcon size={36} />
            <span>Case Files</span>
          </div>

          <div
            className="win95-desktop-icon"
            onDoubleClick={() => focusWindow('erd')}
            onClick={() => focusWindow('erd')}
            title="Database Relation Visualizer & Entity-Relationship Diagrams (ERD)"
          >
            <div style={{ fontSize: '32px', filter: 'drop-shadow(2px 2px 0px rgba(0,0,0,0.5))' }}>🌐</div>
            <span>Relation Visualizer</span>
          </div>

          <div
            className="win95-desktop-icon"
            onDoubleClick={() => focusWindow('sqlDictionary')}
            onClick={() => focusWindow('sqlDictionary')}
            title="SQL Dictionary & Dialect Reference"
          >
            <img src="/icons/sql_dictionary.png" alt="SQL Dictionary" />
            <span>SQL Dictionary</span>
          </div>

          <div
            className="win95-desktop-icon"
            onDoubleClick={() => focusWindow('help')}
            onClick={() => focusWindow('help')}
          >
            <img src="/icons/query_tutorial.png" alt="Query Tutorial" />
            <span>Query Tutorial</span>
          </div>

          <div
            className="win95-desktop-icon"
            onDoubleClick={() => focusWindow('wizard')}
            onClick={() => focusWindow('wizard')}
          >
            <img src="/icons/setup_wizard.png" alt="Setup Wizard" />
            <span>Setup Wizard</span>
          </div>

          <div
            className="win95-desktop-icon"
            onDoubleClick={() => focusWindow('settings')}
            onClick={() => focusWindow('settings')}
          >
            <img src="/icons/options_config.png" alt="Options & Config" />
            <span>Options & Config</span>
          </div>

          <div
            className="win95-desktop-icon"
            onClick={handleToggleCrt}
            title="Toggle Retro CRT Monitor Scanline & Glow Overlay Effect"
          >
            <div style={{ fontSize: '32px', filter: 'drop-shadow(2px 2px 0px rgba(0,0,0,0.5))' }}>📺</div>
            <span>CRT Filter ({crtEnabled ? 'ON' : 'OFF'})</span>
          </div>

          <div
            className="win95-desktop-icon"
            onClick={handleStartGuidedTour}
          >
            <img src="/icons/guided_tour.png" alt="Guided Tour" />
            <span>Guided Tour</span>
          </div>

          <div
            className="win95-desktop-icon"
            onClick={() => setShowBootAnimation(true)}
            title="Play Windows 95 Opening Animation"
          >
            <img src="/icons/reboot.png" alt="Reboot 95" />
            <span>Reboot 95</span>
          </div>

          <div
            className="win95-desktop-icon"
            onClick={() => focusWindow('contributors')}
          >
            <img src="/icons/join_team.png" alt="Join the Team" />
            <span>Join the Team</span>
          </div>

          <div
            className="win95-desktop-icon"
            onClick={() => {
              setLegalInitialTab('terms');
              focusWindow('legal');
            }}
          >
            <img src="/icons/legal_gavel.png" alt="Terms, Privacy & Legal Notice" />
            <span>Terms, Privacy &amp; Legal</span>
          </div>

          <div
            className="win95-desktop-icon"
            onClick={() => setCookieConsentOpen(true)}
          >
            <div style={{ fontSize: '30px', lineHeight: 1, padding: '2px 0' }}>🍪</div>
            <span>Cookie Settings</span>
          </div>

          <div
            className="win95-desktop-icon"
            onClick={() => setNetworkDialogOpen(true)}
            title="Dial-Up Networking & Autonomous Offline Status"
          >
            <div style={{ fontSize: '30px', lineHeight: 1, padding: '2px 0' }}>{isOnline ? '📟' : '📴'}</div>
            <span>Dial-Up ({isOnline ? 'Online' : 'Offline'})</span>
          </div>

          <div
            className="win95-desktop-icon"
            onClick={handleResetSession}
          >
            <img src="/icons/recycle_bin.png" alt="Recycle Bin" />
            <span>Recycle Bin (Reset)</span>
          </div>
        </div>
      )}

      {/* Opening Boot Animation */}
      {showBootAnimation && (
        <BootAnimation theme={activeTheme} onComplete={() => setShowBootAnimation(false)} />
      )}

      {/* Landing / Welcome Information Dialog */}
      {openWindows.welcome && (
        <WelcomeWindow
          isOpen={openWindows.welcome}
          zIndex={getZIndex('welcome')}
          onClose={() => closeWindow('welcome')}
          onStartTour={handleStartGuidedTour}
          onOpenHelp={() => focusWindow('help')}
          onOpenIDE={() => focusWindow('ide')}
          onFocus={() => focusWindow('welcome')}
        />
      )}

      {/* SQL IDE Shell Window */}
      {openWindows.ide && (
        <ErrorBoundary>
          <IDEShell
            isOpen={openWindows.ide}
            isMinimized={minimizedWindows.ide}
            isMaximized={Boolean(maximizedWindows.ide)}
            onMaximize={() => handleToggleMaximize('ide')}
            zIndex={getZIndex('ide')}
            executor={executor}
            dialect={dialect}
            rowsPerTable={rowsPerTable}
            onRowsPerTableChange={setRowsPerTable}
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
            onOpenChallenges={() => focusWindow('challenges')}
            onOpenDetective={() => focusWindow('detective')}
            onOpenERD={() => focusWindow('erd')}
            onStartTour={handleStartGuidedTour}
            crtEnabled={crtEnabled}
            onToggleCrt={handleToggleCrt}
          />
        </ErrorBoundary>
      )}

      {/* Auth Window (Log In & Create Account) */}
      {openWindows.auth && (
        <AuthWindow
          isOpen={openWindows.auth}
          isMinimized={minimizedWindows.auth}
          zIndex={getZIndex('auth')}
          isSecureContext={isSecureContext}
          onClose={() => closeWindow('auth')}
          onMinimize={() => toggleMinimize('auth')}
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
          onOpenLegal={(tab) => {
            if (tab) setLegalInitialTab(tab);
            focusWindow('legal');
          }}
        />
      )}

      {/* Admin Dashboard Window */}
      {openWindows.admin && (
        <AdminDashboard
          isOpen={openWindows.admin}
          isMinimized={minimizedWindows.admin}
          zIndex={getZIndex('admin')}
          currentUser={currentUser}
          activeSession={activeSession}
          sessionStats={sessionStats}
          onClose={() => closeWindow('admin')}
          onMinimize={() => toggleMinimize('admin')}
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
      )}

      {/* SQL Dictionary & Dialect Reference Window */}
      {openWindows.sqlDictionary && (
        <SQLDictionaryWindow
          isOpen={openWindows.sqlDictionary}
          isMinimized={minimizedWindows.sqlDictionary}
          isMaximized={Boolean(maximizedWindows.sqlDictionary)}
          onMaximize={() => handleToggleMaximize('sqlDictionary')}
          zIndex={getZIndex('sqlDictionary')}
          onClose={() => closeWindow('sqlDictionary')}
          onMinimize={() => toggleMinimize('sqlDictionary')}
          onFocus={() => focusWindow('sqlDictionary')}
          onTryInIde={handleTryInIde}
        />
      )}

      {/* Help / Query Tutorial Window */}
      {openWindows.help && (
        <HelpWindow
          isOpen={openWindows.help}
          isMinimized={minimizedWindows.help}
          zIndex={getZIndex('help')}
          onClose={() => closeWindow('help')}
          onMinimize={() => toggleMinimize('help')}
          onFocus={() => focusWindow('help')}
          onLoadQuery={handleLoadQuery}
        />
      )}

      {/* Setup Wizard Window */}
      {openWindows.wizard && (
        <SetupWizard
          isOpen={openWindows.wizard}
          isMinimized={minimizedWindows.wizard}
          zIndex={getZIndex('wizard')}
          onClose={() => closeWindow('wizard')}
          onMinimize={() => toggleMinimize('wizard')}
          onFocus={() => focusWindow('wizard')}
          onFinish={() => focusWindow('ide')}
        />
      )}

      {/* Settings / Options Dialog */}
      {openWindows.settings && (
        <SettingsDialog
          isOpen={openWindows.settings}
          zIndex={getZIndex('settings')}
          currentDialect={dialect}
          rowsPerTable={rowsPerTable}
          tableCap={tableCap}
          crtEnabled={crtEnabled}
          onToggleCrt={handleToggleCrt}
          onSave={(r, c, d) => {
            setRowsPerTable(r);
            setTableCap(c);
            setDialect(d);
          }}
          onClose={() => closeWindow('settings')}
          onFocus={() => focusWindow('settings')}
          onOpenCookies={() => setCookieConsentOpen(true)}
          onOpenLegal={(tab) => {
            if (tab) setLegalInitialTab(tab);
            focusWindow('legal');
          }}
        />
      )}

      {/* Retro CRT Monitor Filter Overlay */}
      {crtEnabled && <div className="win95-crt-overlay" aria-hidden="true" />}

      {/* Error / Warning Dialog */}
      <ErrorDialog
        error={activeError}
        zIndex={99999}
        onClose={() => setActiveError(null)}
        onFocus={() => {}}
      />

      {/* Authentic Shut Down Dialog */}
      {openWindows.shutdown && (
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
      )}

      {/* Contributors / Join the Team Window */}
      {openWindows.contributors && (
        <ContributorsWindow
          isOpen={openWindows.contributors}
          isMinimized={minimizedWindows.contributors}
          zIndex={getZIndex('contributors')}
          onClose={() => closeWindow('contributors')}
          onMinimize={() => toggleMinimize('contributors')}
          onFocus={() => focusWindow('contributors')}
        />
      )}

      {/* Legal & IP Protection Window */}
      {openWindows.legal && (
        <LegalWindow
          isOpen={openWindows.legal}
          isMinimized={minimizedWindows.legal}
          zIndex={getZIndex('legal')}
          initialTab={legalInitialTab}
          onClose={() => closeWindow('legal')}
          onMinimize={() => toggleMinimize('legal')}
          onFocus={() => focusWindow('legal')}
        />
      )}

      {/* Cookie & Local Storage Consent Dialog */}
      <CookieConsentDialog
        isOpen={cookieConsentOpen}
        onClose={() => setCookieConsentOpen(false)}
        onOpenPrivacy={() => {
          setLegalInitialTab('privacy');
          focusWindow('legal');
        }}
        onFocus={() => {}}
      />

      {/* Flagship SQL Challenge Arena Window */}
      {openWindows.challenges && (
        <ChallengeWindow
          isOpen={openWindows.challenges}
          isMinimized={minimizedWindows.challenges}
          isMaximized={Boolean(maximizedWindows.challenges)}
          onMaximize={() => handleToggleMaximize('challenges')}
          zIndex={getZIndex('challenges')}
          onClose={() => closeWindow('challenges')}
          onMinimize={() => toggleMinimize('challenges')}
          onFocus={() => focusWindow('challenges')}
          onTryInStudio={(sql, ddl, seed) => {
            executor.execute(ddl + '\n' + seed, dialect).catch(console.error);
            setQueryText(sql);
            closeWindow('challenges');
            focusWindow('ide');
          }}
        />
      )}

      {/* SQL Noir: Department of Unsolved Homicides */}
      {openWindows.detective && (
        <DetectiveWindow
          isOpen={openWindows.detective}
          isMinimized={minimizedWindows.detective}
          isMaximized={Boolean(maximizedWindows.detective)}
          onMaximize={() => handleToggleMaximize('detective')}
          zIndex={getZIndex('detective')}
          onClose={() => closeWindow('detective')}
          onMinimize={() => toggleMinimize('detective')}
          onFocus={() => focusWindow('detective')}
        />
      )}

      {/* Database Relation Visualizer (ERD) Window */}
      {openWindows.erd && (
        <ERDViewer
          isOpen={openWindows.erd}
          isMinimized={minimizedWindows.erd}
          isMaximized={Boolean(maximizedWindows.erd)}
          onMaximize={() => handleToggleMaximize('erd')}
          zIndex={getZIndex('erd')}
          catalog={executor.getCatalog()}
          executor={executor}
          onClose={() => closeWindow('erd')}
          onMinimize={() => toggleMinimize('erd')}
          onFocus={() => focusWindow('erd')}
        />
      )}

      {/* Interactive Tour Balloon */}
      {tourOpen && (
        <Win95Tour
          isOpen={tourOpen}
          onClose={() => setTourOpen(false)}
          onOpenHelp={() => focusWindow('help')}
          onEnsureIDEOpen={() => focusWindow('ide')}
          onOpenSettings={() => focusWindow('settings')}
          onOpenAuth={() => focusWindow('auth')}
          onOpenERD={() => focusWindow('erd')}
          onOpenChallenges={() => focusWindow('challenges')}
        />
      )}

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

      {/* Fullscreen macOS Launchpad App Drawer */}
      {isMacTheme && (
        <MacLaunchpad
          isOpen={launchpadOpen}
          onClose={() => setLaunchpadOpen(false)}
          onOpenApp={(id) => {
            setLaunchpadOpen(false);
            focusWindow(id);
          }}
          onStartTour={() => {
            setLaunchpadOpen(false);
            handleStartGuidedTour();
          }}
          currentUser={currentUser}
          isLoggedIn={isLoggedIn}
        />
      )}

      {/* Taskbar */}
      <Taskbar
        windows={windowsMeta}
        activeWindowId={activeWindowId}
        currentUser={currentUser}
        isLoggedIn={isLoggedIn}
        isSecureContext={isSecureContext}
        activeTheme={activeTheme}
        isAnyMaximized={isAnyMaximized}
        crtEnabled={crtEnabled}
        onToggleCrt={handleToggleCrt}
        onFocusWindow={focusWindow}
        onToggleMinimize={toggleMinimize}
        onOpenWindow={focusWindow}
        onResetSession={handleResetSession}
        onLogout={handleLogout}
        onToggleLaunchpad={() => setLaunchpadOpen((prev) => !prev)}
        isLaunchpadOpen={launchpadOpen}
        onOpenCookies={() => setCookieConsentOpen(true)}
        isOnline={isOnline}
        onOpenNetwork={() => setNetworkDialogOpen(true)}
      />

      {/* Dial-Up Networking & Autonomous Mode Status Dialog */}
      {networkDialogOpen && (
        <NetworkStatusDialog
          isOpen={networkDialogOpen}
          onClose={() => setNetworkDialogOpen(false)}
          isOnline={isOnline}
          onRedial={() => {
            if (typeof navigator !== 'undefined') {
              setIsOnline(navigator.onLine);
            }
          }}
          zIndex={100000}
        />
      )}
    </div>
  );
};
