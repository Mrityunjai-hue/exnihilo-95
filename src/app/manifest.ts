import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ExNihilo 95 — Windows 95 SQL IDE',
    short_name: 'ExNihilo 95',
    description: 'Zero-Config, Self-Synthesizing SQL Development Studio with authentic Windows 95 interface & in-browser WASM engine',
    start_url: '/',
    display: 'standalone',
    background_color: '#008080',
    theme_color: '#000080',
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-maskable-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
    ],
  };
}
