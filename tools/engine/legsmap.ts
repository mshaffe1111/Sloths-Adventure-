// A schematic of a stage of LEGS (R-165.196) for the engineer's own eyes: every piece, wall, vine, flag, pickup and the route's
// order, drawn to scale in rows of `--row` px of stage, as an SVG (and a PNG beside it with --png). Not the game's art.
//   npx tsx tools/engine/legsmap.ts --code MIXED_CODE --seed 2 [--easy] [--id 5-95] --out /tmp/legs.svg [--png]
// `--code`: a fixture's name in src/game/gen2/toyLegs.ts, or a graph code written out.
import fs from 'node:fs';
import '../../src/game/headlessDom.ts';
import { buildGen2Stage } from '../../src/game/gen2/pipeline.ts';
import { towerCfg } from '../../src/game/gen2/toyTower.ts';
import * as toys from '../../src/game/gen2/toyLegs.ts';
const arg = (k: string) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : undefined; };
const name = arg('--code') ?? 'MIXED_CODE';
const code = (toys as unknown as Record<string, unknown>)[name];
const id = arg('--id') ?? '5-95', seed = Number(arg('--seed') ?? 1);
const st = buildGen2Stage({ config: towerCfg(id, 'sprint'), kit: toys.legsKit(id, typeof code === 'string' ? code : name), seed, difficulty: process.argv.includes('--easy') ? 'easy' : 'normal' });
const W = st.config.levelWidth, ROW = Number(arg('--row') ?? 6400), k = Number(arg('--scale') ?? 0.25);
const y0 = Math.min(...st.platforms.map((p) => p.y)) - 220, y1 = Math.max(...st.platforms.map((p) => p.y + p.height)) + 40;
const H = (y1 - y0) * k + 16, rows = Math.ceil(W / ROW);
const out: string[] = [];
const T = st.gen2.tower, route = T?.route.legs ?? [];
const COLOR: Record<string, string> = { right: '#eef3ea', left: '#e9eef8', up: '#f6efe2', down: '#f1e8f3' };
for (let r = 0; r < rows; r++) {
  const X = (x: number) => (x - r * ROW) * k, Y = (y: number) => r * H + (y - y0) * k;
  const inRow = (a: number, b: number) => b > r * ROW && a < (r + 1) * ROW;
  out.push(`<rect x="0" y="${r * H}" width="${ROW * k}" height="${H - 16}" fill="#fff" stroke="#999"/>`);
  for (const g of T?.legs ?? []) if (inRow(g.x0, g.x1)) out.push(`<rect x="${X(g.x0)}" y="${Y(g.y0 - 200)}" width="${(g.x1 - g.x0) * k}" height="${(g.y1 - g.y0 + 240) * k}" fill="${COLOR[g.travel]}" opacity="0.7"/><text x="${X(g.x0) + 4}" y="${Y(g.y0 - 200) + 12}" font-size="11" fill="#555">${g.travel}</text>`);
  for (const p of st.platforms) if (inRow(p.x, p.x + p.width)) out.push(`<rect x="${X(p.x)}" y="${Y(p.y)}" width="${p.width * k}" height="${p.height * k}" fill="${p.type === 'fragile' ? '#c33' : p.type === 'bouncy' ? '#d6a' : p.height > 30 ? '#5b7a3a' : '#7a5230'}" stroke="#222" stroke-width="0.4"/>`);
  for (const v of st.vines) if (inRow(v.x, v.x)) out.push(`<line x1="${X(v.x)}" y1="${Y(v.topY)}" x2="${X(v.x)}" y2="${Y(v.bottomY)}" stroke="#1c8a2e" stroke-width="2"/>`);
  for (const f of st.checkpoints ?? []) if (inRow(f.x, f.x)) out.push(`<path d="M${X(f.x)} ${Y(f.y)} v${-60 * k} l${30 * k} ${12 * k} l${-30 * k} ${12 * k}" fill="#e22" stroke="#900"/>`);
  for (const e of st.enemies) if (inRow(e.x, e.x)) out.push(`<circle cx="${X(e.x)}" cy="${Y(e.y)}" r="${14 * k}" fill="#a0f"/>`);
  for (const q of st.collectibles) if (inRow(q.x, q.x)) out.push(`<circle cx="${X(q.x)}" cy="${Y(q.y)}" r="${(q.type === 'heart' ? 9 : 5) * k}" fill="${q.type === 'heart' ? '#f06' : '#f5c400'}"/>`);
  route.forEach((g, i) => { if (inRow(g.entry.x, g.entry.x)) out.push(`<text x="${X(g.entry.x)}" y="${Y(g.entry.y) - 4}" font-size="9" fill="#024">${i + 1}${g.exit.x < g.entry.x ? '&lt;' : '&gt;'}</text>`); });
  if (inRow(st.spawnX, st.spawnX)) out.push(`<circle cx="${X(st.spawnX)}" cy="${Y(st.spawnY) - 8}" r="6" fill="#06c"/>`);
  if (inRow(st.exitTotemX, st.exitTotemX)) out.push(`<rect x="${X(st.exitTotemX) - 5}" y="${Y(st.exitTotemY) - 30}" width="10" height="30" fill="#0aa"/>`);
}
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${ROW * k}" height="${rows * H}" font-family="sans-serif">${out.join('')}</svg>`;
const file = arg('--out') ?? 'legs.svg';
fs.writeFileSync(file, svg);
console.log(`${file}: seed ${seed}, ${W} px wide, ${st.gen2.sections.length} sections, legs ${(T?.legs ?? []).map((g) => `${g.travel}:${g.i1 - g.i0}`).join(' ')}, ${(st.checkpoints ?? []).length} flags, errors ${JSON.stringify((st.gen2.errors ?? []).slice(0, 6))}`);
if (process.argv.includes('--png')) {
  const { chromium } = await import(process.env.PW ?? '/opt/node-tools/node_modules/playwright/index.mjs');
  const b = await chromium.launch();
  const pg = await b.newPage({ viewport: { width: Math.ceil(ROW * k), height: Math.ceil(rows * H) }, deviceScaleFactor: 1 });
  await pg.setContent(`<body style="margin:0">${svg}</body>`);
  await pg.screenshot({ path: file.replace(/\.svg$/, '.png') });
  await b.close();
}
