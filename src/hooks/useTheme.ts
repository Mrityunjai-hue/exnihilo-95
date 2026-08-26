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

export type ThemeId = 'win95-classic' | 'win95-noir' | 'winxp-luna' | 'win2000';

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

export function useTheme() {
  const [activeTheme, setActiveThemeState] = useState<ThemeId>(() => {
    if (typeof window === 'undefined' || !window.localStorage) return 'win95-classic';
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY) as ThemeId;
      if (stored && THEME_PRESETS.some((t) => t.id === stored)) {
        return stored;
      }
    } catch {
      // Fallback on error
    }
    return 'win95-classic';
  });

  const applyThemeToDOM = useCallback((theme: ThemeId) => {
    if (typeof document === 'undefined') return;
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
  }, []);

  const setTheme = useCallback(
    (newTheme: ThemeId) => {
      setActiveThemeState(newTheme);
      applyThemeToDOM(newTheme);
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          localStorage.setItem(THEME_STORAGE_KEY, newTheme);
        } catch {
          // Ignore quota error
        }
      }
    },
    [applyThemeToDOM]
  );

  useEffect(() => {
    applyThemeToDOM(activeTheme);
  }, [activeTheme, applyThemeToDOM]);

  const currentThemeMeta = THEME_PRESETS.find((t) => t.id === activeTheme) || THEME_PRESETS[0];

  return {
    activeTheme,
    currentThemeMeta,
    setTheme,
    allThemes: THEME_PRESETS,
  };
}
