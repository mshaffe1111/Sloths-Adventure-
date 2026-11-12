/**
 * The script-size check (R-165.103, 2026-11-11): every file must stay under Workbox's 4 MiB precache limit (vite.config.ts
 * maximumFileSizeToCacheInBytes, 4,194,304 B), or the build fails and the game can't be cached for offline play. The game's main script
 * grows with every stage, so this gate holds every JS chunk to 200,000 B under that limit: a branch that eats the spare goes red here,
 * before the build itself breaks. React and its scheduler sit in their own 'vendor' chunk (vite.config.ts manualChunks) to make that room.
 *   npx vite build && node tools/perf/chunkcheck.mjs     (seconds; exit 1 when a chunk is over budget or dist has no JS)
 *   CHUNKCHECK_BUDGET=<bytes> CHUNKCHECK_DIR=<dist>       (the budget, 3,994,304; the build folder, dist)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..', '..');
const BUDGET = Number(process.env.CHUNKCHECK_BUDGET ?? 3_994_304);
const dir = path.resolve(root, process.env.CHUNKCHECK_DIR ?? 'dist');

const chunks = [];
const walk = (d) => {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.js')) chunks.push({ file: path.relative(dir, p), bytes: fs.statSync(p).size });
  }
};
if (!fs.existsSync(dir)) {
  console.log(`chunkcheck: FAIL: ${dir} not found (run npx vite build first)`);
  process.exit(1);
}
walk(dir);
if (!chunks.some((c) => /(^|[\\/])assets[\\/]index-.*\.js$/.test(c.file))) {
  console.log(`chunkcheck: FAIL: no main script (assets/index-*.js) in ${dir}`);
  process.exit(1);
}
chunks.sort((a, b) => b.bytes - a.bytes);
const over = chunks.filter((c) => c.bytes > BUDGET);
console.log(`chunkcheck: budget ${BUDGET.toLocaleString('en-US')} B a chunk, ${chunks.length} JS files`);
for (const c of chunks.slice(0, 8)) {
  console.log(`  ${c.bytes > BUDGET ? 'OVER' : 'ok  '} ${c.bytes.toLocaleString('en-US').padStart(11)} B  ${(BUDGET - c.bytes).toLocaleString('en-US').padStart(11)} spare  ${c.file}`);
}
if (over.length) {
  console.log(`chunkcheck: FAIL: ${over.length} chunk(s) over ${BUDGET.toLocaleString('en-US')} B: ${over.map((c) => c.file).join(', ')}`);
  process.exit(1);
}
console.log('chunkcheck: PASS');
