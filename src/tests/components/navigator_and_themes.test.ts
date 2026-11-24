import { describe, it, expect } from 'vitest';
import { THEME_PRESETS } from '../../hooks/useTheme';

describe('Database Navigator & Multi-Theme System', () => {
  it('defines all 6 supported vintage and modern themes with complete visual tokens', () => {
    const expectedThemes = ['win95-classic', 'macos-glass', 'win7-aero', 'win95-noir', 'winxp-luna', 'win2000'];
    const ids = THEME_PRESETS.map((t) => t.id);

    for (const expected of expectedThemes) {
      expect(ids).toContain(expected);
      const theme = THEME_PRESETS.find((t) => t.id === expected);
      expect(theme).toBeDefined();
      expect(theme?.name).toBeTruthy();
      expect(theme?.badge).toBeTruthy();
      expect(theme?.desktopBg).toBeTruthy();
      expect(theme?.windowBg).toBeTruthy();
      expect(theme?.titleGradient).toBeTruthy();
    }
  });

  it('guarantees Dark Mode flag is properly set for macos-glass and win95-noir', () => {
    const macTheme = THEME_PRESETS.find((t) => t.id === 'macos-glass');
    const noirTheme = THEME_PRESETS.find((t) => t.id === 'win95-noir');
    const classicTheme = THEME_PRESETS.find((t) => t.id === 'win95-classic');

    expect(macTheme?.isDark).toBe(true);
    expect(noirTheme?.isDark).toBe(true);
    expect(classicTheme?.isDark).toBe(false);
  });
});
