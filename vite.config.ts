import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
import {defineConfig} from 'vite';
import { execSync } from 'node:child_process';

// the time of the latest commit, shown on the start screen so you can tell which version a device has. The deploy checks out the commit,
// so git has it; GAME_BUILD_TIME overrides it (the preview build has no git folder); the build time is the last resort.
function lastUpdate(): string {
  if (process.env.GAME_BUILD_TIME) return process.env.GAME_BUILD_TIME;
  try {
    const t = execSync('git log -1 --format=%cI', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
    if (t) return t;
  } catch {
    /* no git: fall through */
  }
  return new Date().toISOString();
}

// GitHub Pages serves the game from /<repo-name>/, so the deploy build sets BASE_PATH. Locally it stays '/'.
const base = process.env.BASE_PATH || '/';

export default defineConfig(() => {
  const buildTime = lastUpdate();
  return {
    base,
    define: { __BUILD_TIME__: JSON.stringify(buildTime) },
    plugins: [
      react(),
      // the published stamp an open copy of the game compares itself with (src/game/updates.ts)
      {
        name: 'sloth-version-file',
        apply: 'build' as const,
        generateBundle(this: { emitFile: (f: { type: 'asset'; fileName: string; source: string }) => void }) {
          this.emitFile({ type: 'asset', fileName: 'version.json', source: JSON.stringify({ build: buildTime }) });
        },
      },
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        // the painted sprite sheets are cached with the app, so they load instantly and work offline
        workbox: { globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,webmanifest,mp3}'] },
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'icon.svg'],
        manifest: {
          id: base,
          name: 'Sloths Rainforest Adventures',
          short_name: 'SlothAdv',
          description: 'High-DPI side-scrolling action adventure game where Sloth navigates 10 lush rainforest stages to save Meeca.',
          theme_color: '#0e3b28',
          background_color: '#0b1a13',
          display: 'standalone',
          orientation: 'any',
          start_url: base,
          scope: base,
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: 'pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        devOptions: {
          enabled: true,
          type: 'module',
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
