#!/usr/bin/env node
/**
 * Art use (2026-10-31, Matt: "We need to use all the art we create. Its a waste otherwise."; STAGE-RULES §4).
 *
 *   node tools/art/artuse.mjs [--json out.json] [--md out.md]
 *
 * Lists, game-wide:
 *  1. every packed piece with no draw site: each named frame (or animation sequence) in an atlas data file (src/game/*.ts whose
 *     entries look like `name: { x, y, w, h }` or `name: [ { x, ... } ]`, plus the frames of the JSON atlases under src/assets/) whose
 *     name is never used by game code;
 *  2. every art file under src/assets/ (webp, png, jpg, json) that no code, stylesheet, page or manifest points at.
 *
 * "Used" means the name appears in a game source file (src/**, not tests, not the atlas data files themselves) as a quoted string, a
 * property access (.name) or a shorthand key, or is matched by a dynamic name in code: a template literal (`thorn${i}`, `w${n}.webp`),
 * a string joined with + ('glowWave' + k), or an import.meta.glob pattern. That's a text check, not a run of the game, so a name that
 * appears in code but is never reached counts as used (false negatives are possible; false "unused" are rare). Pieces by world: from
 * the data file's name (proto* = W1, w2* = W2, ..., kitAtlasData by its world key); creatures, bosses, story and UI are their own
 * groups. Reference sheets that were never packed (reference/prop-sheets/) are listed by hand in KNOWN_UNPACKED below.
 *
 * The gate is src/game/artUse.test.ts with its allow-list src/game/artUse.allow.json (it may only shrink).
 */
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, basename, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const SRC = join(ROOT, 'src');

function walk(dir, out = []) {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) walk(p, out); else out.push(p);
  }
  return out;
}

const FRAME = /(['"]?)([A-Za-z0-9_$-]+)\1\s*:\s*(?:\[\s*)?\{\s*['"]?x['"]?\s*:\s*-?\d/g;
const all = walk(SRC);
const code = all.filter(p => /\.(ts|tsx|js|mjs|css|html)$/.test(p) && !/\.test\.ts$/.test(p));
const isData = p => /(Data|Data_[a-z]+)\.ts$/.test(p);

// the corpus: game code with the frame-definition lines taken out (an atlas naming its own pieces isn't a use)
const corpusParts = [];
for (const p of code) {
  if (isData(p)) continue;
  // comments don't draw anything: strip /* */ blocks and // tails (not inside a URL's '//')
  const src = readFileSync(p, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`\\])\/\/.*$/gm, '$1');
  const t = src.split('\n').filter(l => !/\{\s*['"]?x['"]?\s*:\s*-?\d+\s*,\s*['"]?y['"]?\s*:/.test(l)).join('\n');
  corpusParts.push(t);
}
for (const p of [join(ROOT, 'index.html')]) { try { corpusParts.push(readFileSync(p, 'utf8')); } catch { /* none */ } }
const corpus = corpusParts.join('\n');
const words = new Set();
for (const m of corpus.matchAll(/['"`]([A-Za-z0-9_$./-]+)['"`]/g)) words.add(m[1]);
for (const m of corpus.matchAll(/\.([A-Za-z_$][A-Za-z0-9_$]*)/g)) words.add(m[1]);
for (const m of corpus.matchAll(/[{,]\s*([A-Za-z_$][A-Za-z0-9_$]*)\s*[,}]/g)) words.add(m[1]);
for (const m of corpus.matchAll(/([A-Za-z_$][A-Za-z0-9_$]*)\s*:\s*['"`A-Za-z0-9_$\[{(]/g)) words.add(m[1]);
// dynamic names: `prefix${...}suffix`, 'prefix' + x, import.meta.glob('...')
const dyn = [];
for (const m of corpus.matchAll(/`([^`]*\$\{[^`]*)`/g)) {
  const re = m[1].split(/\$\{[^}]*\}/).map(s => s.replace(/[.*+?^()|[\]\\]/g, '\\$&')).join('.*');
  if (re.replace(/\.\*/g, '').length >= 2) dyn.push(new RegExp('(^|/)' + re + '$'));
}
for (const m of corpus.matchAll(/['"]([A-Za-z0-9_/.-]+)['"]\s*\+/g)) {
  const esc = m[1].replace(/[.*+?^()|[\]\\]/g, '\\$&');
  dyn.push(new RegExp('(^|/)' + esc + (m[1].length >= 2 ? '[A-Za-z0-9_-]*' : '\\d+') + '$'));
}
for (const m of corpus.matchAll(/import\.meta\.glob\(\s*\[?\s*['"]([^'"]+)['"]/g)) {
  dyn.push(new RegExp(m[1].replace(/^\.\.?\//, '').replace(/[.+?^()|[\]\\]/g, '\\$&').replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*') + '$'));
}
const usedOne = n => words.has(n) || dyn.some(r => r.test(n));
// a numbered frame (walk_3, glowWave2, f12) counts as used when its sequence's name is: animations are looked up by sequence
const usedName = n => {
  if (usedOne(n)) return true;
  const m = n.match(/^(.*?[A-Za-z])[_-]?\d+$/);
  return !!m && m[1].length >= 2 && usedOne(m[1]);
};

function worldOf(file, key) {
  const b = basename(file);
  if (/^proto/.test(b)) return 'W1';
  const w = b.match(/^w(\d+)/);
  if (w) return 'W' + Number(w[1]);
  if (b === 'kitAtlasData.ts' && key) return 'W' + key;
  if (/(snake|boa|eagle|turtle|guard|caiman|frog|ocelot|jaguar|harpy|tayra|spider|butler|dangler|dozer|mantis|seamstress|sentry|fruitbat|goldsnake)/i.test(b)) return 'creatures';
  if (/(venom|croc|prowler|sovereign|queen|reaver|golem|monarch|drake|ironclaw|thornbark|boss)/i.test(b)) return 'bosses';
  if (/(story|journal|meeca|pell|hero|dot|flicker)/i.test(b)) return 'story/characters';
  if (/(hud|ui|medal|trails)/i.test(b)) return 'ui';
  return 'shared';
}

const pieces = [];
for (const p of code.filter(p => /\.ts$/.test(p))) {
  const t = readFileSync(p, 'utf8');
  if (!/\{\s*['"]?x['"]?\s*:\s*-?\d+\s*,\s*['"]?y['"]?\s*:/.test(t)) continue;
  // a kit file keyed by world: "2": { "liana": {...} }; track the current world key by position
  const worldKeys = [...t.matchAll(/^\s*"(\d+)"\s*:\s*\{/gm)].map(m => [m.index, m[1]]);
  for (const m of t.matchAll(FRAME)) {
    const key = m[2];
    if (/^\d+$/.test(key) || ['x', 'y', 'w', 'h'].includes(key)) continue;
    let wk = null;
    for (const [i, k] of worldKeys) if (i < m.index) wk = k;
    pieces.push({ file: relative(ROOT, p), key, world: worldOf(p, wk), kitWorld: wk });
  }
}
// JSON atlases (frames objects) under src/assets
for (const p of all.filter(p => p.endsWith('.json') && !p.endsWith('manifest.json'))) {
  let j; try { j = JSON.parse(readFileSync(p, 'utf8')); } catch { continue; }
  const fr = j.frames && typeof j.frames === 'object' && !Array.isArray(j.frames) ? j.frames
    : Object.values(j).every(v => v && typeof v === 'object' && 'x' in v) ? j : null;
  if (!fr) continue;
  for (const key of Object.keys(fr)) pieces.push({ file: relative(ROOT, p), key, world: worldOf(p), kitWorld: null });
}
// a data file's own sequence lists ("walk": ["walk_01", ...], or SEQ arrays) name the frames an animation plays
const ownRefs = new Map();
for (const f of new Set(pieces.map(p => p.file))) {
  const t = readFileSync(join(ROOT, f), 'utf8');
  const s = new Set();
  for (const l of t.split('\n')) {
    if (/\{\s*['"]?x['"]?\s*:\s*-?\d/.test(l) && !/\[\s*['"]/.test(l)) continue;
    for (const m of l.matchAll(/['"]([A-Za-z0-9_$-]+)['"]\s*[,\]]/g)) s.add(m[1]);
  }
  ownRefs.set(f, s);
}
const fileUsed = f => { const b = basename(f).replace(/\.(ts|json)$/, ''); return corpus.includes(b); };
const seen = new Set();
const unusedPieces = [];
for (const pc of pieces) {
  const id = `${pc.file}#${pc.kitWorld ? pc.kitWorld + '.' : ''}${pc.key}`;
  if (seen.has(id)) continue;
  seen.add(id);
  if (usedName(pc.key)) continue;
  if (ownRefs.get(pc.file)?.has(pc.key) && fileUsed(pc.file)) continue;
  unusedPieces.push({ id, ...pc });
}

// art files nobody points at
const artFiles = all.filter(p => /\.(webp|png|jpg|jpeg|json)$/.test(p) && p.startsWith(join(SRC, 'assets')));
// a manifest only counts when code imports it (music's does; w6to10's is a packing record, not a use)
const manifests = all.filter(p => p.endsWith('manifest.json') && corpus.includes(relative(join(SRC, 'assets'), p).replace(/\\/g, '/'))).map(p => readFileSync(p, 'utf8')).join('\n');
const allText = corpus + '\n' + manifests;
const unusedFiles = [];
for (const p of artFiles) {
  const rel = relative(SRC, p).replace(/\\/g, '/');
  const b = basename(p);
  if (allText.includes(b) || allText.includes(rel)) continue;
  if (dyn.some(r => r.test(rel) || r.test(b))) continue;
  // a .json beside a used .webp of the same name is that atlas's frame list
  if (p.endsWith('.json') && allText.includes(basename(p, '.json') + '.webp')) continue;
  unusedFiles.push({ id: 'asset:' + rel, file: 'src/' + rel, world: worldOf(p), key: '' });
}

// reference sheets painted but never packed (hand list from the World 1-4 inventories, 2026-10-31)
const KNOWN_UNPACKED = [
  { id: 'sheet:w1-props-1-puzzle-and-secrets.jpg#hollowLogVariants', file: 'reference/prop-sheets/w1-props-1-puzzle-and-secrets.jpg',
    key: 'three hollow-log variants (bottom row)', world: 'W1', why: 'painted by Matt, never cut or packed' },
];

// confirmed unused by reading the draw code (the text check counts them as used: a template like `cage${ri}` matches cageA,
// and the gemini folder is loaded by a glob, so river-king-peek is loaded but never drawn)
const KNOWN_UNDRAWN = [
  { id: 'src/game/w2PropsData.ts#cageA', file: 'src/game/w2PropsData.ts', key: 'cageA', world: 'W2',
    why: 'the dome cageB stands in for it (riverArt.ts ~410); no draw call names cageA' },
  { id: 'asset:assets/w6to10/gemini/river-king-peek.webp', file: 'src/assets/w6to10/gemini/river-king-peek.webp', key: '', world: 'W2',
    why: 'loaded with the gemini glob, never drawn (ART-TO-GET.md:13 wants it at the end of 2-2)' },
];

const WHY = {
  'W2': { cageA: 'the dome cageB stands in until the redraw (riverArt.ts ~410)' },
  'W3': { catEyes: 'drawn only for the ring leap-in; the eyes watcher is code gradients (engine.ts:6349)' },
};
const rows = [...unusedPieces, ...unusedFiles, ...KNOWN_UNDRAWN.filter(k => !unusedPieces.some(u => u.id === k.id)), ...KNOWN_UNPACKED].map(r => ({ ...r, why: r.why ?? WHY[r.world]?.[r.key] ?? '' }));
const groups = {};
for (const r of rows) (groups[r.world] ??= []).push(r);
const order = Object.keys(groups).sort((a, b) => {
  const na = /^W\d+$/.test(a) ? Number(a.slice(1)) : 100, nb = /^W\d+$/.test(b) ? Number(b.slice(1)) : 100;
  return na - nb || a.localeCompare(b);
});

let md = `# Unused art, game-wide (tools/art/artuse.mjs, ${new Date().toISOString().slice(0, 10)})\n\n` +
  `${unusedPieces.length} packed pieces with no draw site, ${unusedFiles.length} art files nothing points at, ` +
  `${KNOWN_UNPACKED.length} painted sheet parts never packed. A text check (see the script's header for what counts as used).\n`;
for (const g of order) {
  md += `\n## ${g} (${groups[g].length})\n\n| Piece | File | Why unused (if known) |\n|---|---|---|\n`;
  for (const r of groups[g]) md += `| ${r.key || '(whole file)'} | \`${r.file}\` | ${r.why} |\n`;
}

const args = process.argv.slice(2);
const opt = k => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
if (opt('--json')) writeFileSync(opt('--json'), JSON.stringify(rows, null, 1));
if (opt('--md')) writeFileSync(opt('--md'), md);
if (!opt('--json') && !opt('--md')) process.stdout.write(md);
else console.log(`unused: ${unusedPieces.length} pieces, ${unusedFiles.length} files, ${KNOWN_UNPACKED.length} unpacked sheet parts`);
export { rows };
