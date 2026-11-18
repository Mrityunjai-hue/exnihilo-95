/**
 * useTheme.ts — Custom Theme & Nostalgia Skins Manager Hook
 *
 * Supported Themes:
 * - 'win95-classic': Classic Windows 95 Teal & Gray
 * - 'win95-noir': Win95 Noir Dark Mode
 * - 'winxp-luna': Windows XP Luna (Bliss Green & Royal Blue)
 * - 'win2000': Windows 2000 Corporate (Steel Blue & Slate Gray)
 */

import { useState, useEffect, useCallback } from 'react';

export type ThemeId = 'macos-glass' | 'win95-classic' | 'win7-aero' | 'win95-noir' | 'winxp-luna' | 'win2000';
export type TypographyMode = 'hybrid' | 'pure95' | 'modern';

export interface ThemeMeta {
  id: ThemeId;
  name: string;
  badge: string;
  desktopBg: string;
  windowBg: string;
  titleGradient: string;
  isDark: boolean;
}

export const THEME_PRESETS: ThemeMeta[] = [
  {
    id: 'win95-classic',
    name: 'Windows 95 Classic',
    badge: '🩵 Teal & Gray',
    desktopBg: '#008080',
    windowBg: '#c0c0c0',
    titleGradient: 'linear-gradient(90deg, #000080 0%, #1084d0 100%)',
    isDark: false,
  },
  {
    id: 'macos-glass',
    name: 'macOS Modern (Nihilo Glass)',
    badge: '🍎 Acrylic Glass & Aurora',
    desktopBg: 'radial-gradient(circle at 20% 20%, rgba(30, 58, 138, 0.65) 0%, transparent 40%), radial-gradient(circle at 80% 80%, rgba(88, 28, 135, 0.55) 0%, transparent 45%), radial-gradient(circle at 50% 50%, rgba(15, 118, 110, 0.35) 0%, transparent 50%), #0b0f19',
    windowBg: 'rgba(18, 24, 38, 0.72)',
    titleGradient: 'linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)',
    isDark: true,
  },
  {
    id: 'win7-aero',
    name: 'Windows 7 Aero Glass',
    badge: '🩵 Aero Glass & Sky Blue',
    desktopBg: 'linear-gradient(135deg, #0e4166 0%, #1e5799 40%, #207cca 70%, #2989d8 100%)',
    windowBg: '#eef5fc',
    titleGradient: 'linear-gradient(180deg, rgba(185, 220, 250, 0.85) 0%, rgba(135, 190, 235, 0.75) 50%, rgba(100, 165, 225, 0.8) 51%, rgba(155, 210, 250, 0.9) 100%)',
    isDark: false,
  },
  {
    id: 'win95-noir',
    name: 'Win95 Noir Dark Mode',
    badge: '🌙 Midnight & Cyan',
    desktopBg: '#0a0e17',
    windowBg: '#1e2430',
    titleGradient: 'linear-gradient(90deg, #0f172a 0%, #0369a1 100%)',
    isDark: true,
  },
  {
    id: 'winxp-luna',
    name: 'Windows XP Luna',
    badge: '🏞️ Bliss Green & Blue',
    desktopBg: '#2d5a27',
    windowBg: '#ece9d8',
    titleGradient: 'linear-gradient(90deg, #0055ea 0%, #3f8cff 100%)',
    isDark: false,
  },
  {
    id: 'win2000',
    name: 'Windows 2000 Professional',
    badge: '🏢 Corporate Steel Blue',
    desktopBg: '#3a6ea5',
    windowBg: '#d4d0c8',
    titleGradient: 'linear-gradient(90deg, #0a246a 0%, #a6caf0 100%)',
    isDark: false,
  },
];

const THEME_STORAGE_KEY = 'exnihilo_active_theme';
const TYPOGRAPHY_STORAGE_KEY = 'exnihilo_typography_mode';

export function useTheme() {
  const [activeTheme, setActiveThemeState] = useState<ThemeId>(() => {
    if (typeof window === 'undefined') return 'win95-classic';
    try {
      if (typeof document !== 'undefined') {
        const domTheme = document.documentElement.getAttribute('data-theme') as ThemeId;
        if (domTheme && THEME_PRESETS.some((t) => t.id === domTheme)) {
          return domTheme;
        }
      }
      if (window.localStorage) {
        const stored = localStorage.getItem(THEME_STORAGE_KEY) as ThemeId;
        if (stored && THEME_PRESETS.some((t) => t.id === stored)) {
          return stored;
        }
      }
    } catch {
      // Fallback on error
    }
    return 'win95-classic';
  });

  const [typographyMode, setTypographyModeState] = useState<TypographyMode>(() => {
    if (typeof window === 'undefined') return 'hybrid';
    try {
      if (typeof document !== 'undefined') {
        const domTypo = document.documentElement.getAttribute('data-typography') as TypographyMode;
        if (domTypo && ['hybrid', 'pure95', 'modern'].includes(domTypo)) {
          return domTypo;
        }
      }
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem(TYPOGRAPHY_STORAGE_KEY) as TypographyMode;
        if (stored && ['hybrid', 'pure95', 'modern'].includes(stored)) {
          return stored;
        }
      }
    } catch {
      // Fallback on error
    }
    return 'hybrid';
  });

  const applyThemeToDOM = useCallback((theme: ThemeId) => {
    if (typeof document === 'undefined') return;
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
  }, []);

  const applyTypographyToDOM = useCallback((mode: TypographyMode) => {
    if (typeof document === 'undefined') return;
    document.documentElement.setAttribute('data-typography', mode);
    document.body.setAttribute('data-typography', mode);
  }, []);

  const setTheme = useCallback(
    (newTheme: ThemeId) => {
      setActiveThemeState(newTheme);
      applyThemeToDOM(newTheme);
      if (typeof window !== 'undefined') {
        try {
          if (window.localStorage) {
            localStorage.setItem(THEME_STORAGE_KEY, newTheme);
          }
          window.dispatchEvent(new CustomEvent('exnihilo-theme-change', { detail: newTheme }));
        } catch {
          // Ignore quota error
        }
      }
    },
    [applyThemeToDOM]
  );

  const setTypographyMode = useCallback(
    (newMode: TypographyMode) => {
      setTypographyModeState(newMode);
      applyTypographyToDOM(newMode);
      if (typeof window !== 'undefined') {
        try {
          if (window.localStorage) {
            localStorage.setItem(TYPOGRAPHY_STORAGE_KEY, newMode);
          }
          window.dispatchEvent(new CustomEvent('exnihilo-typography-change', { detail: newMode }));
        } catch {
          // Ignore quota error
        }
      }
    },
    [applyTypographyToDOM]
  );

  useEffect(() => {
    applyThemeToDOM(activeTheme);
  }, [activeTheme, applyThemeToDOM]);

  useEffect(() => {
    applyTypographyToDOM(typographyMode);
  }, [typographyMode, applyTypographyToDOM]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleSync = (e: Event) => {
      const custom = e as CustomEvent<ThemeId>;
      if (custom.detail && THEME_PRESETS.some((t) => t.id === custom.detail)) {
        setActiveThemeState(custom.detail);
      }
    };
    const handleTypoSync = (e: Event) => {
      const custom = e as CustomEvent<TypographyMode>;
      if (custom.detail && ['hybrid', 'pure95', 'modern'].includes(custom.detail)) {
        setTypographyModeState(custom.detail);
      }
    };
    window.addEventListener('exnihilo-theme-change', handleSync);
    window.addEventListener('exnihilo-typography-change', handleTypoSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('exnihilo-theme-change', handleSync);
      window.removeEventListener('exnihilo-typography-change', handleTypoSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const currentThemeMeta = THEME_PRESETS.find((t) => t.id === activeTheme) || THEME_PRESETS[0];

  return {
    activeTheme,
    currentThemeMeta,
    setTheme,
    allThemes: THEME_PRESETS,
    typographyMode,
    setTypographyMode,
  };
}
