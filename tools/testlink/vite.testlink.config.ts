import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import { execSync } from 'node:child_process';

// The test-link build: the same game as the GitHub Pages deploy, but with relative paths and no service worker, so it runs as
// Matt's private Claude artifact (https://claude.ai/artifact/EnK5hmtGubQeKhKEdgignb). Run it from the repo root with
// `python3 tools/testlink/build.py`, which also works out which files changed since the last publish.
const t = (() => {
  try {
    return execSync('git log -1 --format=%cI').toString().trim();
  } catch {
    return new Date().toISOString();
  }
})();
export default defineConfig({
  base: './',
  // the new HUD and Dot (beta) is on by default here, off on the real game (src/game/newLook.ts)
  define: { __BUILD_TIME__: JSON.stringify(t) },
  plugins: [react(), tailwindcss()],
  build: { outDir: 'tools/testlink/dist', emptyOutDir: true },
});
