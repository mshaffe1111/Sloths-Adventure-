// The landings' support, measured (E3's first count, for the designer's rule 1, "rocks never float", and §4's float caps): on all
// 102 stages, layouts 1-2, Normal, per world:
//   - every no-float stone landing (the designer's LABELS §1: moss_stone, ruin, fragile ruin, moving stone; and the kit's built pieces,
//     "solid - art=kit", counted on their own row): (a) placed; (b) with open air under it: nothing solid (a landing's top, a water
//     surface, the stage floor) within 8 px below its bottom anywhere along its width; (c) of those, over a pit (nothing below at all,
//     down to the stage floor) or over ground further down; (d) the median and max height of that open air;
//   - the floating platform share: platform pieces that may float (logs, boughs, bridges, springy and moving platforms) with open air
//     under them, as a share of every landing.
// GEOMETRY ONLY: a piece's collider, not its drawn body. A bank of 50 px or more is drawn with earth under it by terrain.ts (earthBody,
// or a ground/step/pillar role), so its drawn base may reach what its collider does not; under 50 px it is drawn as a thin piece or a
// "floating island". Both are counted apart. E3's gate will read the renderer's own footing.
//   npx tsx tools/engine/stonesupport.ts   (writes tools/engine/stonesupport.json)
import fs from 'node:fs';
import '../../src/game/headlessDom.ts';
import { generateAllLevels } from '../../src/game/worldsData.ts';
import { sim } from '../validate/play.ts';
import { LANDINGS } from '../../src/game/mixer/catalog.ts';
const stages = generateAllLevels().filter((c) => !c.secret).map((c) => c.id);
type Acc = { placed: number; open: number; pit: number; overGround: number; air: number[] };
const blank = (): Acc => ({ placed: 0, open: 0, pit: 0, overGround: 0, air: [] });
const stone: Record<string, Record<number, Acc>> = { 'stone, 50 px or more': {}, 'stone, under 50 px': {}, 'kit (built)': {} };
const plat: Record<number, { landings: number; floating: number }> = {};
const examples: Array<{ st: string; layout: number; kind: string; x: number; y: number; w: number; h: number; air: number | 'pit' }> = [];
for (const id of stages) for (let v = 1; v <= 2; v++) {
  const w = Number(id.split('-')[0]);
  const s: any = sim(id, v, 'normal').stage;
  const P: any[] = s.platforms.filter((p: any) => !p.broken);
  const floorY = s.config.levelHeight;
  const water: Array<{ x0: number; x1: number; y: number }> = [...(s.rivers ?? []).map((r: any) => ({ x0: r.x0, x1: r.x1, y: r.surfaceY })), ...(s.proto?.water ?? [])];
  const pl = (plat[w] ??= { landings: 0, floating: 0 });
  for (const p of P) {
    const kind = LANDINGS.find((k) => k.match(p));
    if (!kind) continue;
    const bottom = p.y + (p.height ?? 24);
    // (what lies under it: the nearest landing top, water surface or the stage floor, anywhere along its width)
    const under = [
      ...P.filter((q) => q !== p && q.x < p.x + p.width && q.x + q.width > p.x && q.y >= bottom - 8).map((q) => q.y),
      ...water.filter((z) => z.x0 < p.x + p.width && z.x1 > p.x && z.y >= bottom - 8).map((z) => z.y),
    ];
    const near = Math.min(...under, floorY);
    const gap = near - bottom;
    const open = gap > 8;
    const isPit = open && under.length === 0;
    pl.landings++;
    if (kind.mayFloat === 'yes' && open) pl.floating++;
    const row = kind.mayFloat === 'no' && kind.element === 'stone' ? ((p.height ?? 24) >= 50 ? 'stone, 50 px or more' : 'stone, under 50 px') : kind.name === 'built set piece' && p.art === 'kit' ? 'kit (built)' : null;
    if (!row) continue;
    const a = (stone[row][w] ??= blank());
    a.placed++;
    if (open) { a.open++; if (isPit) a.pit++; else a.overGround++; a.air.push(gap); if (examples.length < 400) examples.push({ st: id, layout: v, kind: row, x: p.x, y: p.y, w: p.width, h: p.height ?? 24, air: isPit ? 'pit' : Math.round(gap) }); }
  }
  process.stderr.write(`${id} `);
}
const med = (xs: number[]) => { const s = [...xs].sort((a, b) => a - b); return s.length ? Math.round(s[Math.floor(s.length / 2)]) : 0; };
const out: any = { method: 'collider geometry, 8 px, layouts 1-2, Normal', stone: {}, floatShare: {} };
console.log('\nno-float stone landings, per world: placed / open air under (over a pit, over ground further down) / open air median, max px');
for (const [row, byW] of Object.entries(stone)) {
  console.log(`  ${row}:`);
  out.stone[row] = {};
  for (let w = 1; w <= 10; w++) { const a = byW[w]; if (!a) continue; out.stone[row][w] = { placed: a.placed, open: a.open, pit: a.pit, overGround: a.overGround, airMedian: med(a.air), airMax: Math.round(Math.max(0, ...a.air)) };
    console.log(`    W${w}: ${a.placed} / ${a.open} (${a.pit} pit, ${a.overGround} ground below) / ${med(a.air)}, ${Math.round(Math.max(0, ...a.air))}`); }
}
console.log('floating platform share (platform pieces with open air under them, of all landings):');
for (let w = 1; w <= 10; w++) { const p = plat[w]; if (!p) continue; out.floatShare[w] = { landings: p.landings, floating: p.floating, share: +(p.floating / p.landings).toFixed(3), capRoundedUp5: Math.ceil((p.floating / p.landings) * 20) * 5 };
  console.log(`  W${w}: ${p.floating} of ${p.landings} = ${(100 * p.floating / p.landings).toFixed(1)}% (cap rounded up to 5%: ${out.floatShare[w].capRoundedUp5}%)`); }
out.examples = examples;
fs.writeFileSync(new URL('./stonesupport.json', import.meta.url), JSON.stringify(out, null, 1) + '\n');
