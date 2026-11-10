/**
 * useCursorSettings.ts — Settings for the ExNihilo Signature Liquid Cursor
 */

import { useState, useEffect, useCallback } from 'react';

export interface CursorSettings {
  enabled: boolean;
}

const STORAGE_KEY = 'exnihilo_liquid_cursor_v1';

const DEFAULT_SETTINGS: CursorSettings = {
  enabled: true,
};

export function useCursorSettings() {
  const [settings, setSettings] = useState<CursorSettings>(() => {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch {
      // Storage fallback
    }
    return DEFAULT_SETTINGS;
  });

  const updateSetting = useCallback(<K extends keyof CursorSettings>(key: K, value: CursorSettings[K]) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        window.dispatchEvent(new CustomEvent('exnihilo-cursor-settings-change', { detail: next }));
      } catch {
        // Storage fail-safe
      }
      return next;
    });
  }, []);

  useEffect(() => {
    const handleSync = (e: Event) => {
      const custom = e as CustomEvent<CursorSettings>;
      if (custom.detail) {
        setSettings(custom.detail);
      }
    };
    window.addEventListener('exnihilo-cursor-settings-change', handleSync);
    return () => window.removeEventListener('exnihilo-cursor-settings-change', handleSync);
  }, []);

  return {
    cursorSettings: settings,
    updateCursorSetting: updateSetting,
  };
}
