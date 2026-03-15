import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  define: {
    global: 'globalThis',  // ← needs to be here
  },
  build: {
    outDir: 'dist',       // ← Vercel expects this
    sourcemap: false,     // ← keep bundle small in prod
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // ── Switch to injectManifest so we control the SW file ──────────────────
      // This lets us add custom push event handlers in src/sw.ts while still
      // getting Workbox precaching injected at build time.
      strategies: 'injectManifest',
      srcDir:     'src',
      filename:   'serviceWorker.ts',

      registerType: 'autoUpdate',
      devOptions: {
        enabled: true,
        type: 'module',
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],

      manifest: {
        name:             'JUNO Healthcare',
        short_name:       'JUNO',
        description:      'Jamaican Unified Network for Organising Healthcare Intelligence',
        display:          'standalone',
        scope:            '/',
        background_color: '#F7F9FC',
        theme_color:      '#00703C',
        start_url:        '/',
        orientation:      'portrait-primary',
        icons: [
          {
            src:   'pwa-192x192.png',
            sizes: '192x192',
            type:  'image/png',
          },
          {
            src:   'pwa-512x512.png',
            sizes: '512x512',
            type:  'image/png',
          },
          {
            src:     'pwa-512x512.png',
            sizes:   '512x512',
            type:    'image/png',
            purpose: 'maskable',
          },
        ],
      },

      // injectManifest uses your own SW file — workbox runtimeCaching config
      // goes inside src/sw.ts directly (see registerRoute calls there).
      injectManifest: {
        // Only inject the precache manifest; everything else is in sw.ts
        injectionPoint: 'self.__WB_MANIFEST',
      },
    }),
  ],
});
