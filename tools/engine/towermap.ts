// A schematic of the fixture tower (toyTower.ts) for the engineer's own eyes: every piece, vine, flag, animal and the route's order,
// drawn to scale in columns, as an SVG (R-165.170). Not the game's art: the stills of the real page are tools/engine/towerstills.mjs.
//   npx tsx tools/engine/towermap.ts --flow up --seed 2 [--easy] --out /tmp/tower.svg
import fs from 'node:fs';
import '../../src/game/headlessDom.ts';
import { buildGen2Stage } from '../../src/game/gen2/pipeline.ts';
import { downKit, towerCfg, upKit } from '../../src/game/gen2/toyTower.ts';
const arg = (k: string) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : undefined; };
const flow = (arg('--flow') ?? 'up') as 'up' | 'down';
const seed = Number(arg('--seed') ?? 1);
const st = buildGen2Stage({ config: flow === 'up' ? towerCfg('5-93', 'ascent') : towerCfg('5-93', 'sprint', 'down'), kit: flow === 'up' ? upKit : downKit, seed, difficulty: process.argv.includes('--easy') ? 'easy' : 'normal' });
const W = st.config.levelWidth;
const y0 = Math.min(...st.platforms.map((p) => p.y)) - 200, y1 = Math.max(...st.platforms.map((p) => p.y + p.height)) + 40;
const COL = Number(arg('--col') ?? 3200), k = Number(arg('--scale') ?? 0.3);
const cols = Math.ceil((y1 - y0) / COL);
const out: string[] = [];
const seam = new Set<number>();
const legs = st.gen2.tower?.route.legs ?? [];
// (a piece no leg's stretch holds is the lay's own: a catch, a run-on to a wall, the floor)
for (const p of st.platforms) if (!legs.some((g) => p.x + p.width > g.x0 + 2 && p.x < g.x1 - 2 && p.y >= Math.min(g.entry.y, g.exit.y) - 2 && p.y <= Math.max(g.entry.y, g.exit.y) + 2)) seam.add(p.id);
for (let c = 0; c < cols; c++) {
  // (going up, the first column is the foot of the tower: the columns read left to right the way he travels)
  const top = flow === 'up' ? y1 - (c + 1) * COL : y0 + c * COL;
  const X = (x: number) => (c * (W + 80) + x) * k, Y = (y: number) => (y - top) * k;
  const inCol = (a: number, b: number) => b > top && a < top + COL;
  out.push(`<rect x="${X(0)}" y="0" width="${W * k}" height="${COL * k}" fill="#eef3ea" stroke="#999"/>`);
  for (const p of st.platforms) if (inCol(p.y, p.y + p.height)) out.push(`<rect x="${X(p.x)}" y="${Y(p.y)}" width="${p.width * k}" height="${Math.min(p.height, 90) * k}" fill="${p.type === 'fragile' ? '#c33' : seam.has(p.id) ? '#c9a227' : p.height > 30 ? '#5b7a3a' : '#7a5230'}"/>`);
  for (const v of st.vines) if (inCol(v.topY, v.bottomY)) out.push(`<line x1="${X(v.x)}" y1="${Y(v.topY)}" x2="${X(v.x)}" y2="${Y(v.bottomY)}" stroke="#1c8a2e" stroke-width="2"/>`);
  for (const f of st.checkpoints ?? []) if (inCol(f.y, f.y)) out.push(`<path d="M${X(f.x)} ${Y(f.y)} v${-60 * k} l${30 * k} ${12 * k} l${-30 * k} ${12 * k}" fill="#e22" stroke="#900"/>`);
  for (const e of st.enemies) if (inCol(e.y, e.y)) out.push(`<circle cx="${X(e.x)}" cy="${Y(e.y)}" r="${14 * k}" fill="#a0f"/>`);
  for (const q of st.collectibles) if (inCol(q.y, q.y)) out.push(`<circle cx="${X(q.x)}" cy="${Y(q.y)}" r="${(q.type === 'heart' ? 9 : 5) * k}" fill="${q.type === 'heart' ? '#f06' : '#f5c400'}"/>`);
  legs.forEach((g, i) => { if (inCol(g.entry.y, g.entry.y)) out.push(`<text x="${X(g.entry.x)}" y="${Y(g.entry.y) - 4}" font-size="9" fill="#024">${i + 1}${g.exit.x < g.entry.x ? '&lt;' : '&gt;'}</text>`); });
  if (inCol(st.spawnY, st.spawnY)) out.push(`<circle cx="${X(st.spawnX)}" cy="${Y(st.spawnY) - 8}" r="6" fill="#06c"/>`);
  if (inCol(st.exitTotemY, st.exitTotemY)) out.push(`<rect x="${X(st.exitTotemX) - 5}" y="${Y(st.exitTotemY) - 30}" width="10" height="30" fill="#0aa"/>`);
}
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${cols * (W + 80) * k}" height="${COL * k}" font-family="sans-serif">${out.join('')}</svg>`;
const file = arg('--out') ?? 'tower.svg';
fs.writeFileSync(file, svg);
console.log(`${file}: ${flow} seed ${seed}, ${st.platforms.length} pieces (${seam.size} the lay's own), ${st.vines.length} vines, ${(st.checkpoints ?? []).length} flags, errors ${JSON.stringify(st.gen2.errors ?? [])}`);
