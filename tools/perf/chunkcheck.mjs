/**
 * The script-size check (R-165.103, 2026-11-11): every file must stay under Workbox's 4 MiB precache limit (vite.config.ts
 * maximumFileSizeToCacheInBytes, 4,194,304 B), or the build fails and the game can't be cached for offline play. The game's main script
 * grows with every stage, so this gate holds every JS chunk to 200,000 B under that limit: a branch that eats the spare goes red here,
 * before the build itself breaks. React and its scheduler sit in their own 'vendor' chunk (vite.config.ts manualChunks) to make that room.
 *
 * It measures the build THAT SHIPS (LESSONS D45, EN-S 2026-11-11): the live site is built with BASE_PATH=/Sloths-Adventure-/ (deploy.yml),
 * and that path is written into every picture's address inside the scripts, so the shipped main script is bigger than a plain
 * `vite build`'s (0.9.6 shipped 254 B over this budget while the gate, on a plain build, passed). A build whose base is not the deploy's
 * fails here, whatever its sizes.
 *
 * It also holds the split's shape (tools/perf/chunkplan.mjs): of the files the page loads at the start (the main script and everything
 * it imports, the whole way down), none may import the main script and none may sit in an import loop. A loop changes the order the
 * game's code runs in; without one, every module runs after the modules it imports, as it did in one file.
 *   BASE_PATH=/Sloths-Adventure-/ npx vite build && node tools/perf/chunkcheck.mjs     (seconds; exit 1 on any breach)
 *   CHUNKCHECK_BUDGET=<bytes> CHUNKCHECK_DIR=<dist> CHUNKCHECK_BASE=<base>   (the budget, 3,994,304; the build folder, dist; the
 *   deploy's base, /Sloths-Adventure-/)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..', '..');
const BUDGET = Number(process.env.CHUNKCHECK_BUDGET ?? 3_994_304);
const dir = path.resolve(root, process.env.CHUNKCHECK_DIR ?? 'dist');
const BASE = process.env.CHUNKCHECK_BASE || '/Sloths-Adventure-/';

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
// the build's base, read off the page's own main-script tag: it must be the deploy's (D45)
const html = fs.existsSync(path.join(dir, 'index.html')) ? fs.readFileSync(path.join(dir, 'index.html'), 'utf8') : '';
const tag = html.match(/<script[^>]*type="module"[^>]*src="([^"]*?)(assets\/index-[^"]+\.js)"/);
if (!tag) {
  console.log(`chunkcheck: FAIL: ${dir}/index.html has no main script tag (assets/index-*.js)`);
  process.exit(1);
}
if (tag[1] !== BASE) {
  console.log(`chunkcheck: FAIL: this build's base is '${tag[1]}', the deploy's is '${BASE}': it is not the build that ships, and its scripts are smaller than the shipped ones (LESSONS D45). Build with: BASE_PATH=${BASE} npx vite build`);
  process.exit(1);
}
// the files the page loads at the start, and what each imports (a late import("...") is not one of them)
const entry = tag[2];
const importsOf = (file) => {
  const text = fs.readFileSync(path.join(dir, file), 'utf8');
  const out = new Set();
  for (const m of text.matchAll(/(?:^|[;}\s])(?:import|export)\s*(?:[^"'()]*?\bfrom\s*)?["'](\.{1,2}\/[^"']+\.js)["']/g)) out.add(path.posix.normalize(path.posix.join(path.posix.dirname(file.split(path.sep).join('/')), m[1])));
  return [...out];
};
const graph = new Map([[entry, importsOf(entry)]]);
for (const [, deps] of graph) for (const d of deps) if (!graph.has(d)) graph.set(d, fs.existsSync(path.join(dir, d)) ? importsOf(d) : []);
const shape = [];
for (const [f, deps] of graph) if (f !== entry && deps.includes(entry)) shape.push(`${f} imports the main script`);
{ // a loop among the start files (depth-first: a file met again while still open)
  const state = new Map();
  const visit = (f, trail) => {
    if (state.get(f) === 2) return;
    if (state.get(f) === 1) { const loop = [...trail.slice(trail.indexOf(f)), f]; if (!loop.includes(entry) || loop.length > 3) shape.push(`import loop: ${loop.join(' -> ')}`); return; }
    state.set(f, 1);
    for (const d of graph.get(f) ?? []) visit(d, [...trail, f]);
    state.set(f, 2);
  };
  visit(entry, []);
}
chunks.sort((a, b) => b.bytes - a.bytes);
const over = chunks.filter((c) => c.bytes > BUDGET);
console.log(`chunkcheck: base ${BASE}, budget ${BUDGET.toLocaleString('en-US')} B a chunk, ${chunks.length} JS files, ${graph.size} loaded at the start`);
for (const c of chunks.slice(0, 8)) {
  console.log(`  ${c.bytes > BUDGET ? 'OVER' : 'ok  '} ${c.bytes.toLocaleString('en-US').padStart(11)} B  ${(BUDGET - c.bytes).toLocaleString('en-US').padStart(11)} spare  ${c.file}`);
}
if (over.length) {
  console.log(`chunkcheck: FAIL: ${over.length} chunk(s) over ${BUDGET.toLocaleString('en-US')} B: ${over.map((c) => c.file).join(', ')}`);
  process.exit(1);
}
if (shape.length) {
  console.log(`chunkcheck: FAIL: the start files are tied in a loop (tools/perf/chunkplan.mjs: a layer imports only the layers under it):\n  ${shape.join('\n  ')}`);
  process.exit(1);
}
console.log('chunkcheck: PASS');
