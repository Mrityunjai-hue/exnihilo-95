import { describe, it, expect } from 'vitest';
import manifest from '../../app/manifest';
import fs from 'fs';
import path from 'path';

describe('PWA & Offline Installation Assets', () => {
  it('manifest metadata route returns valid PWA configuration', () => {
    const config = manifest();
    expect(config.name).toContain('ExNihilo 95');
    expect(config.display).toBe('standalone');
    expect(config.start_url).toBe('/');
    expect(config.icons).toBeDefined();
    expect(config.icons!.length).toBeGreaterThanOrEqual(3);

    const sizes = config.icons!.map((i) => i.sizes);
    expect(sizes).toContain('192x192');
    expect(sizes).toContain('512x512');
  });

  it('all required PWA icons exist in public directory', () => {
    const pubDir = path.join(process.cwd(), 'public');
    expect(fs.existsSync(path.join(pubDir, 'icons', 'icon-192x192.png'))).toBe(true);
    expect(fs.existsSync(path.join(pubDir, 'icons', 'icon-512x512.png'))).toBe(true);
    expect(fs.existsSync(path.join(pubDir, 'icons', 'icon-maskable-512x512.png'))).toBe(true);
    expect(fs.existsSync(path.join(pubDir, 'apple-touch-icon.png'))).toBe(true);
  });
});
