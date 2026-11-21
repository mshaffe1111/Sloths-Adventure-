import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';

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
// the git short commit of the build (testRound.ts: the testers' runs say which build they came from); GAME_GIT_COMMIT overrides it
function gitCommit(): string {
  if (process.env.GAME_GIT_COMMIT) return process.env.GAME_GIT_COMMIT;
  try {
    return execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  } catch {
    return '';
  }
}

// R-165.252 (LINK-ROOM 11-20): a picture named as `new URL('x.webp', import.meta.url)` is inlined by the bundler straight into the
// script that names it (most of them into index.js, which reached 14.6 MB of the artifact's 16 MB a file). Here, test link only, each
// such literal becomes an import of 'x.webp?url' (the same url, or the same data: url once inlined), so the picture is a module of its
// own and goes in the art packs below with every other one. (Template-literal names already go through import.meta.glob ?url.)
/** pictures under this many KB are inlined (test link only) */
export const INLINE_KB = 96;
/** an art pack's most bytes: the artifact takes 16 MB a file, and LINK-ROOM's goal keeps every file under 13 MB (build.py MAX_FILE_MB) */
export const ART_PACK = 11_000_000;
export const NEW_URL_ART = /new URL\(\s*(['"])([^'"`$\n]+?\.(?:webp|png))\1\s*,\s*import\.meta\.url\s*\)/g;
export function artAsImports(code: string, id: string): string | null {
  const imports: string[] = [];
  const out = code.replace(NEW_URL_ART, (whole, _q: string, rel: string) => {
    // (a path in a comment, or one that is not there, is left exactly as it was)
    if (!existsSync(path.resolve(path.dirname(id), rel))) return whole;
    const name = `__tlArt${imports.length}`;
    imports.push(`import ${name} from ${JSON.stringify(`${rel}?url`)};`);
    return `new URL(${name}, import.meta.url)`;
  });
  return imports.length ? `${imports.join('\n')}\n${out}` : null;
}
const artImports: Plugin = {
  name: 'testlink-art-imports',
  enforce: 'pre',
  apply: 'build',
  transform(code, id) {
    if (!/\/src\/.*\.tsx?$/.test(id) || id.includes('node_modules')) return null;
    const out = artAsImports(code, id);
    return out == null ? null : { code: out, map: null };
  },
};

export default defineConfig({
  base: './',
  // the new HUD and Dot (beta) is on by default here, off on the real game (src/game/newLook.ts)
  // (a QA build: the control test, #ctest, opens here and not in the shipped game: src/game/playRecorder.ts qaBuild, UI-15)
  define: { __GIT_COMMIT__: JSON.stringify(gitCommit()), __BUILD_TIME__: JSON.stringify(t), 'import.meta.env.VITE_QA_BUILD': JSON.stringify('1') },
  plugins: [artImports, react(), tailwindcss()],
  // (small pictures, under 96 KB since 11-20 LINK-ROOM (R-165.252: 479 files at 64 KB, one under build.py's 480 cap, with index.js at
  // 14.6 MB of the artifact's 16 MB a file), are inlined as data: urls, and every picture module goes in the art packs (artpack-*.js,
  // each at most ART_PACK bytes) instead of the script that imports it: 408 files, index.js 4.6 MB, the largest pack about 10 MB.
  // Before: 64 KB since 11-15 link #5 (inlined into index.js, so 64 KB was its ceiling), 48 KB 11-14, 32 KB 10-30 when the recorded music
  // took the build to 527. The test link only; the GitHub Pages build keeps them as files.)
  build: {
    outDir: 'tools/testlink/dist',
    emptyOutDir: true,
    // (fonts stay files: index.html preloads them by path, and an inlined one left its preload pointing at nothing)
    assetsInlineLimit: (file: string, content: Buffer) => !/\.woff2?$/.test(file) && content.length < INLINE_KB * 1024,
    // (a picture module is `export default "<url>"`, its id the file with any ?url query; the packs load with index.js, as the inlined
    // pictures did inside it)
    rollupOptions: { output: { codeSplitting: { groups: [{ name: 'artpack', test: /\.(webp|png)(\?|$)/, maxSize: ART_PACK }] } } },
  },
});
