/**
 * useCursorSettings.ts — Manages settings for the ExNihilo Dynamic Super-Cursor
 * Persists user preferences to localStorage with zero latency.
 */

import { useState, useEffect, useCallback } from 'react';

export interface CursorSettings {
  enabled: boolean;          // Master toggle for custom cursor
  ambientSpotlight: boolean; // Soft glow torch effect on dark glass
  liveMath: boolean;         // Live Sum/Avg on table cell drag
  magneticSnap: boolean;     // Proximity pull to primary buttons
  mascotEnabled: boolean;    // Interactive theme companion (Orb/Wizard)
  audioHaptics: boolean;     // Subtle micro-audio on clicks/snaps
}

const STORAGE_KEY = 'exnihilo_cursor_settings_v1';

const DEFAULT_SETTINGS: CursorSettings = {
  enabled: true,
  ambientSpotlight: true,
  liveMath: true,
  magneticSnap: true,
  mascotEnabled: true,
  audioHaptics: true,
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
      // Fallback on storage errors
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

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
      window.dispatchEvent(new CustomEvent('exnihilo-cursor-settings-change', { detail: DEFAULT_SETTINGS }));
    } catch {
      // Storage fail-safe
    }
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
    resetCursorSettings: resetSettings,
  };
}
