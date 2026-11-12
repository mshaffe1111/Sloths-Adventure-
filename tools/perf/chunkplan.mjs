/**
 * The chunk plan (EN-S, 2026-11-11): which built file each of the game's modules goes in, so the main script stays far under the 4 MiB
 * precache limit (tools/perf/chunkcheck.mjs) as worlds are added. vite.config.ts asks chunkOf(id) for every module.
 *
 * The split is STATIC and LAYERED, so it cannot change what the game does:
 *  - every chunk here is loaded with the page (index.html preloads it, the service worker precaches it): nothing arrives late, nothing
 *    is fetched at a stage's start, the game plays offline exactly as before;
 *  - LAYERS is an ordered list. A layer's chunk holds everything its roots import (the whole way down) that no earlier layer already
 *    took. So a chunk only ever imports chunks ABOVE it in the list, never the main script and never a later chunk: no import cycle
 *    between files, and every module still runs after all the modules it imports, as it did in one file. chunkcheck.mjs proves that on
 *    the built files (a static chunk that imports the main script, or a cycle, fails the gate).
 * To add a world: add its files' pattern as a new layer after the layers it builds on. A layer may not name src/game/engine.ts,
 * src/App.tsx or anything that imports them (chunkplan.test.ts).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const posix = (f) => f.split(path.sep).join('/');

/** [chunk name, pattern on the repo-relative path of the layer's ROOT modules]; order is the load order, lowest first */
export const LAYERS = [
  // --- plain data: these import nothing, so they sit at the bottom ---
  ['art-urls', /^src\/assets\//],
  ['rolls', /^src\/game\/gen2\/seeds\.ts$/],
  ['lines', /^src\/game\/(dotLinesData|journalCardsData|endCardsData|creatureLore)\.ts$/],
  ['sheets', /^src\/game\/[A-Za-z0-9_]*(AtlasData|AnimData|ClipsData|Data|Data_[a-z]+)\.ts$/],
  // --- sound ---
  ['audio', /^src\/audio\//],
  // --- what every stage is built from ---
  ['stagekit', /^src\/game\/(terrain|scenery|soil|envPlants|envKit|vectorArt|creatures|predators|levelCheck|life|physics|zones|items|flora|trees)\.ts$/],
  // each world's own pieces (sections, ground, art, lines) that do not reach a generator: 'parts' keeps a root out of the layer when it
  // imports one of the HUBS below, so a world's data never drags the generators into its file
  ['world-1-parts', /^src\/game\/(gen2\/worlds\/w1[A-Z.]|w1[A-Z]|mixer\/)/, 'parts'],
  ['world-2-4-parts', /^src\/game\/w[234][A-Z]/, 'parts'],
  ['world-5-parts', /^src\/game\/(gen2\/worlds\/w5[A-Z.]|w5[A-Z])/, 'parts'],
  ['world-6-parts', /^src\/game\/(gen2\/worlds\/w6[A-Z.]|w6[A-Z])/, 'parts'],
  ['world-7-parts', /^src\/game\/(gen2\/worlds\/w7[A-Z.]|w7[A-Z])/, 'parts'],
  ['world-8-parts', /^src\/game\/(gen2\/worlds\/w8[A-Z.]|w8[A-Z0-9]|w810)/, 'parts'],
  // the generators (the hubs every world's stages are built through), then what each world builds with them
  ['oldgen', /^src\/game\/(protoStage|protoArt|protoCheck|stageGenerator|extraStages|kitStage)\.ts$/],
  ['gen2', /^src\/game\/gen2\/[A-Za-z0-9_]+\.ts$/],
  ['world-1', /^src\/game\/(gen2\/worlds\/w1[A-Z.]|w1[A-Z]|mixer\/)/],
  ['world-2-4', /^src\/game\/w[234][A-Z]/],
  ['world-5', /^src\/game\/(gen2\/worlds\/w5[A-Z.]|w5[A-Z])/],
  ['world-6', /^src\/game\/(gen2\/worlds\/w6[A-Z.]|w6[A-Z])/],
  ['world-7', /^src\/game\/(gen2\/worlds\/w7[A-Z.]|w7[A-Z])/],
  ['world-8', /^src\/game\/(gen2\/worlds\/w8[A-Z.]|w8[A-Z0-9]|w810)/],
  // --- the special runs, the guardians, the puzzle rooms, the story ---
  ['runs', /^src\/game\/(dotFlight[A-Za-z]*|meeca[A-Za-z]*|chase|risingTide|lantern|glide|swim)\.ts$/],
  ['bosses', /^src\/game\/(boss[A-Z][A-Za-z]*|lair[A-Z][A-Za-z]*|sovereign[A-Z][A-Za-z]*|paintedBoss)\.ts$/],
  ['puzzle', /^src\/game\/puzzle[A-Z][A-Za-z]*\.ts$/],
  ['story', /^src\/game\/(story[A-Za-z_]*|victoryScenes|endCards|journal[A-Za-z]*|pokeyJournal|movesJournal)\.ts$/],
];

/** the top of the game: these, and every module that imports one of them, always stay in the main script */
export const TOP = ['src/main.tsx', 'src/App.tsx', 'src/game/engine.ts'];

/** the generators: a 'parts' layer takes no root that imports one of these */
export const HUBS = ['src/game/protoStage.ts', 'src/game/stageGenerator.ts', 'src/game/gen2/pipeline.ts', 'src/game/gen2/game.ts'];

/** the modules a file imports for real (a type-only import is erased; a dynamic import() is its own chunk), repo-relative; 'npm:<name>'
 *  for a package */
export function staticImports(rel, text = fs.readFileSync(path.join(ROOT, rel), 'utf8')) {
  const out = [];
  const code = text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  for (const m of code.matchAll(/^\s*(?:import|export)\s+(?!type\b)((?:[^'";]*?)\bfrom\s*)?['"]([^'"]+)['"]/gm)) {
    const spec = m[2].split('?')[0];
    const file = path.join(ROOT, rel);
    const base = spec.startsWith('.') ? path.resolve(path.dirname(file), spec) : spec.startsWith('@/') ? path.resolve(ROOT, spec.slice(2)) : null;
    if (!base) { out.push('npm:' + spec); continue; }
    const hit = [base, `${base}.ts`, `${base}.tsx`, path.join(base, 'index.ts'), path.join(base, 'index.tsx')].find((f) => fs.existsSync(f) && fs.statSync(f).isFile());
    if (hit) out.push(posix(path.relative(ROOT, hit)));
  }
  return out;
}

/** every source file under src that a build can reach (tests and stories are never imported) */
function sourceFiles(dir = path.join(ROOT, 'src'), out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) sourceFiles(p, out);
    else if (/\.(tsx?|mjs|js)$/.test(e.name) && !/\.test\.tsx?$/.test(e.name)) out.push(posix(path.relative(ROOT, p)));
  }
  return out;
}

/** the plan: module (repo-relative) -> chunk name; a module not in it stays in the main script. `imports`, `layers` and `hubs` are injectable for tests. */
export function buildPlan(files = sourceFiles(), imports = staticImports, layers = LAYERS, hubs = HUBS) {
  const deps = new Map();
  const dep = (f) => { if (!deps.has(f)) deps.set(f, f.startsWith('npm:') || !/\.(tsx?|mjs|js)$/.test(f) ? [] : imports(f)); return deps.get(f); };
  // the top of the game (the engine, the app shell, and everything that imports them) is the main script: never a layer's root
  const closure = (f) => { const seen = new Set([f]); for (const x of seen) for (const d of dep(x)) if (!d.startsWith('npm:')) seen.add(d); return seen; };
  const top = new Set(files.filter((f) => { const c = closure(f); return TOP.some((t) => c.has(t)); }));
  const plan = new Map();
  const hubby = new Set(files.filter((f) => { const c = closure(f); return hubs.some((h) => c.has(h)); }));
  for (const [name, pattern, parts] of layers) {
    const seen = new Set(files.filter((f) => pattern.test(f) && !plan.has(f) && !top.has(f) && !(parts && hubby.has(f))));
    for (const f of seen) for (const d of dep(f)) if (!d.startsWith('npm:') && !plan.has(d)) seen.add(d);
    for (const f of seen) plan.set(f, name);
  }
  return plan;
}

let cached;
/** vite's manualChunks: the chunk a module id goes in, or undefined for the main script */
export function chunkOf(id) {
  const clean = id.split('?')[0];
  if (/[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(clean)) return 'vendor';
  // (vite's own helper for a late import(): the layers that ask for a late file use it, so it sits under all of them)
  if (clean.includes('vite/preload-helper')) return 'loader';
  if (!path.isAbsolute(clean)) return undefined;
  cached ??= buildPlan();
  const rel = posix(path.relative(ROOT, clean));
  // (a picture, sound or font under src/assets is a one-line module holding its address: it imports nothing)
  return cached.get(rel) ?? (/^src\/assets\/.*\.(png|webp|svg|jpg|mp3|webm|woff2|json)$/.test(rel) ? 'art-urls' : undefined);
}
