#!/usr/bin/env node
// RUNS (#98 #119 #120 #136 #147): every packed frame name in the game's atlases, collected exactly as tools/art/artuse.mjs collects them
// (its FRAME rule over src/**/*.ts data files and the JSON atlases under src/assets; lines 36-93 of artuse.mjs, copied), filtered by a
// pattern, with the world artuse assigns. Prints name, world, file.   node tools/engine/runs/atlas-find.mjs <regex> [<regex>...]
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const walk = (d, o = []) => { for (const n of readdirSync(d)) { const p = join(d, n); if (statSync(p).isDirectory()) walk(p, o); else o.push(p); } return o; };
const FRAME = /(['"]?)([A-Za-z0-9_$-]+)\1\s*:\s*(?:\[\s*)?\{\s*['"]?x['"]?\s*:\s*-?\d/g;
const all = walk(join(ROOT, 'src'));
function worldOf(file, key) {
  const b = basename(file);
  if (/^proto/.test(b)) return 'W1';
  const w = b.match(/^w(\d+)/); if (w) return 'W' + Number(w[1]);
  if (b === 'kitAtlasData.ts' && key) return 'W' + key;
  return 'shared/other';
}
const pieces = [];
for (const p of all.filter((p) => /\.ts$/.test(p) && !/\.test\.ts$/.test(p))) {
  const t = readFileSync(p, 'utf8');
  if (!/\{\s*['"]?x['"]?\s*:\s*-?\d+\s*,\s*['"]?y['"]?\s*:/.test(t)) continue;
  const worldKeys = [...t.matchAll(/^\s*"(\d+)"\s*:\s*\{/gm)].map((m) => [m.index, m[1]]);
  for (const m of t.matchAll(FRAME)) {
    const key = m[2]; if (/^\d+$/.test(key) || ['x', 'y', 'w', 'h'].includes(key)) continue;
    let wk = null; for (const [i, k] of worldKeys) if (i < m.index) wk = k;
    pieces.push({ file: relative(ROOT, p), key, world: worldOf(p, wk) });
  }
}
for (const p of all.filter((p) => p.endsWith('.json') && !p.endsWith('manifest.json'))) {
  let j; try { j = JSON.parse(readFileSync(p, 'utf8')); } catch { continue; }
  const fr = j.frames && typeof j.frames === 'object' && !Array.isArray(j.frames) ? j.frames : Object.values(j).every((v) => v && typeof v === 'object' && 'x' in v) ? j : null;
  if (!fr) continue;
  for (const key of Object.keys(fr)) pieces.push({ file: relative(ROOT, p), key, world: worldOf(p) });
}
console.log(`${pieces.length} packed frames`);
for (const pat of process.argv.slice(2)) {
  const re = new RegExp(pat, 'i'); const hit = pieces.filter((q) => re.test(q.key));
  console.log(`/${pat}/: ${hit.length}`);
  for (const q of hit) console.log(`  ${q.key}  ${q.world}  ${q.file}`);
}
