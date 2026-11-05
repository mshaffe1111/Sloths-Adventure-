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
import { propBreaches, propItems } from '../../src/game/mixer/propSupport.ts';
const stages = generateAllLevels().filter((c) => !c.secret).map((c) => c.id);
type Bad = { st: string; layout: number; list: string; n: string; family: string; x: number; b: number; why: string };
const bad: Bad[] = [];
const onStruct: Record<string, number> = {};
const placed: Record<number, number> = {}, unsup: Record<number, number> = {}, unlabelled = new Set<string>();
for (const id of stages) for (let v = 1; v <= 2; v++) {
  const w = Number(id.split('-')[0]);
  const s: any = sim(id, v, 'normal').stage;
  // (the judging is the game's own, src/game/mixer/propSupport.ts, shared with stage.ts's gate; layout 1 counts what is placed)
  if (v === 1) placed[w] = (placed[w] ?? 0) + propItems(s).length;
  for (const d of propBreaches(s, { onStructure: v === 1 ? onStruct : {}, unlabelled })) {
    if (v === 1) unsup[w] = (unsup[w] ?? 0) + 1;
    bad.push({ st: id, layout: v, list: d.list, n: d.n, family: d.family, x: d.x, b: d.b, why: d.why });
  }
  process.stderr.write(`${id} `);
}
fs.writeFileSync(new URL('./propsupport.json', import.meta.url), JSON.stringify({ placed, unsup, onStruct, bad, unlabelled: [...unlabelled] }, null, 1) + '\n');
console.log('\nprops in open air (layout 1), per world:');
for (let w = 1; w <= 10; w++) console.log(`  W${w}: ${unsup[w] ?? 0} of ${placed[w] ?? 0} placed`);
console.log('on a drawn structure (not judged here; E3):', JSON.stringify(onStruct));
console.log(`unlabelled prop names: ${[...unlabelled].join(', ') || 'none'}`);
