// The props' support, measured (the first part of E3's support check; Matt, 11-05: "Rocks can't float"): every dressing prop the
// game's builders place, in every list the game draws them from (proto.dress and dress: dressArt.ts; proto.mixDress: w1NewArt.ts;
// proto.kitDecor: puzzleArt.ts; proto.decor: riverArt.ts; proto.w3decor: w3Art.ts; proto.bushes), on all 102 stages, layouts 1-2, Normal, judged by its family's footing
// (the designer's labels, src/game/mixer/catalog.ts PROP_FAMILIES):
//   - fly: may sit in open air;
//   - hang: hangs from a landing or a trunk at its top (dressArt draws a hanging piece from its anchor, b);
//   - water: on a water surface (a river, a water zone) or a landing at its bank edge;
//   - every other family: its foot (b) on a landing's top, under its middle half.
// A prop with nothing under it is "open air": the list to check by eye, then fix, per world. Writes tools/engine/propsupport.json.
//   npx tsx tools/engine/propsupport.ts
import fs from 'node:fs';
import '../../src/game/headlessDom.ts';
import { generateAllLevels } from '../../src/game/worldsData.ts';
import { sim } from '../validate/play.ts';
import { dressSize } from '../../src/game/dressArt.ts';
import { propFamily } from '../../src/game/mixer/catalog.ts';
import { w1DressWidth } from '../../src/game/w1NewArt.ts';
/** pieces that are part of a drawn structure the landing list does not hold (a W2 bank house, W2's canopy over it, World 3's cave
 *  ceiling and walls): they rest on that structure, so this check cannot judge them from the landings; counted apart, for E3 */
const STRUCTURE: Record<string, string> = {
  'proto.decor:porch': 'part of a W2 bank house', 'proto.decor:window': 'part of a W2 bank house', 'proto.decor:door': 'part of a W2 bank house',
  'proto.decor:rooftop': 'part of a W2 bank house', 'proto.decor:chimney': 'part of a W2 bank house', 'proto.decor:limbShort': 'a limb of the W2 canopy tree',
  'proto.decor:canopy': 'the W2 canopy over the village', 'proto.w3decor:stalactite': "hangs from World 3's cave ceiling", 'proto.w3decor:mossCurtain': "hangs from World 3's cave ceiling",
  'proto.w3decor:wallTile': "World 3's cave wall", 'proto.w3decor:glowLit': "a glow on World 3's cave wall",
};
const stages = generateAllLevels().filter((c) => !c.secret).map((c) => c.id);
type Bad = { st: string; layout: number; list: string; n: string; family: string; x: number; b: number; why: string };
const bad: Bad[] = [];
const onStruct: Record<string, number> = {};
const placed: Record<number, number> = {}, unsup: Record<number, number> = {}, unlabelled = new Set<string>();
for (const id of stages) for (let v = 1; v <= 2; v++) {
  const w = Number(id.split('-')[0]);
  const s: any = sim(id, v, 'normal').stage;
  const P: any[] = s.platforms;
  const trunks: any[] = [...(s.trees ?? []), ...(s.proto?.trunks ?? [])];
  const water: Array<{ x0: number; x1: number; y: number }> = [...(s.rivers ?? []).map((r: any) => ({ x0: r.x0, x1: r.x1, y: r.surfaceY })), ...(s.proto?.water ?? [])];
  // (every list's pieces as centre x, foot b and width: all are drawn centred on x but the bushes, which run from x over their width;
  // a kit piece with \`far\` is the distant backdrop, drawn in parallax, and stands on nothing in the play layer: not checked)
  const items: Array<{ n: string; x: number; b: number; w?: number; list: string }> = [
    ...(s.proto?.dress ?? s.dress ?? []).map((d: any) => ({ n: d.n, x: d.x, b: d.b, list: s.proto?.dress ? 'proto.dress' : 'dress' })),
    ...(s.proto?.mixDress ?? []).map((d: any) => ({ n: d.n, x: d.x, b: d.b, w: w1DressWidth(d.n) || undefined, list: 'proto.mixDress' })),
    ...(s.proto?.kitDecor ?? []).filter((d: any) => !d.far).map((d: any) => ({ n: d.n, x: d.x, b: d.b, w: d.w, list: 'proto.kitDecor' })),
    ...(s.proto?.decor ?? []).map((d: any) => ({ n: d.n ?? d.cel, x: d.x, b: d.b, w: d.w, list: 'proto.decor' })),
    ...(s.proto?.w3decor ?? []).map((d: any) => ({ n: d.n, x: d.x, b: d.b, w: d.w, list: 'proto.w3decor' })),
    ...(s.proto?.bushes ?? []).map((d: any) => ({ n: d.kind ?? 'bush', x: d.x + d.w / 2, b: d.y, w: d.w, list: 'proto.bushes' })),
  ].filter((d) => d.n && Number.isFinite(d.x) && Number.isFinite(d.b));
  for (const d of items) {
    if (v === 1) placed[w] = (placed[w] ?? 0) + 1;
    const struct = STRUCTURE[`${d.list}:${d.n}`];
    if (struct) { if (v === 1) onStruct[struct] = (onStruct[struct] ?? 0) + 1; continue; }
    const fam = propFamily(d.n);
    if (!fam) { unlabelled.add(d.n); continue; }
    if (fam.family === 'fly') continue;
    let sz = { w: d.w ?? 60, h: 60 }; if (d.w === undefined) try { sz = dressSize(d.n as never); } catch { /* no frame: 60 px */ }
    const mid0 = d.x - sz.w / 4, mid1 = d.x + sz.w / 4;
    const onTop = P.some((p) => p.x <= mid1 && p.x + p.width >= mid0 && d.b - p.y >= -12 && d.b - p.y <= 30);
    let ok = onTop, why = 'nothing under its foot';
    if (fam.family === 'hang') { ok = P.some((p) => p.x <= d.x + 10 && p.x + p.width >= d.x - 10 && d.b >= p.y - 10 && d.b <= p.y + (p.height ?? 24) + 30) || trunks.some((t) => Math.abs((t.x ?? 0) + (t.width ?? 0) / 2 - d.x) < 120); why = 'nothing to hang from at its top'; }
    if (fam.family === 'water') { ok = onTop || water.some((z) => d.x >= z.x0 && d.x <= z.x1 && Math.abs(d.b - z.y) <= 24); why = 'no water surface or bank under it'; }
    if (!ok) { if (v === 1) unsup[w] = (unsup[w] ?? 0) + 1; bad.push({ st: id, layout: v, list: d.list, n: d.n, family: fam.family, x: Math.round(d.x), b: Math.round(d.b), why }); }
  }
  process.stderr.write(`${id} `);
}
fs.writeFileSync(new URL('./propsupport.json', import.meta.url), JSON.stringify({ placed, unsup, onStruct, bad, unlabelled: [...unlabelled] }, null, 1) + '\n');
console.log('\nprops in open air (layout 1), per world:');
for (let w = 1; w <= 10; w++) console.log(`  W${w}: ${unsup[w] ?? 0} of ${placed[w] ?? 0} placed`);
console.log('on a drawn structure (not judged here; E3):', JSON.stringify(onStruct));
console.log(`unlabelled prop names: ${[...unlabelled].join(', ') || 'none'}`);
