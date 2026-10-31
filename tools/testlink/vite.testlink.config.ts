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
  // (a QA build: the control test, #ctest, opens here and not in the shipped game: src/game/playRecorder.ts qaBuild, UI-15)
  define: { __BUILD_TIME__: JSON.stringify(t), 'import.meta.env.VITE_QA_BUILD': JSON.stringify('1') },
  plugins: [react(), tailwindcss()],
  // (small pictures, under 24 KB, packed into the bundle: an artifact version holds at most 511 files, and the recorded music
  // took the build to 527, 2026-10-30. The test link only; the GitHub Pages build keeps them as files.)
  build: {
    outDir: 'tools/testlink/dist',
    emptyOutDir: true,
    // (fonts stay files: index.html preloads them by path, and an inlined one left its preload pointing at nothing)
    assetsInlineLimit: (file: string, content: Buffer) => !/\.woff2?$/.test(file) && content.length < 32 * 1024,
  },
});
