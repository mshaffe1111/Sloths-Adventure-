// ENG-19a NEW 1: which stages can the kit's BOA.tell reach at runtime? The real engine on every stage, both settings, layouts 1-4:
// the boas it holds, and how many of them the kit runs (e.cast members of kind 'boa': only those read BOA.tell, core.ts tellOf)
import '../../../src/game/headlessDom.ts';
import { makeEngine } from '../../../src/game/engineCoreHarness.ts';
import { generateAllLevels } from '../../../src/game/worldsData.ts';
import { setLayoutVariant } from '../../../src/game/stageGenerator.ts';
const rows: string[] = [];
let kitBoas = 0, stagesWithBoas = 0;
for (const c of generateAllLevels().filter((q) => !q.secret)) {
  let boas = 0, kit = 0;
  for (const d of ['normal', 'easy'] as const) for (let v = 1; v <= 4; v++) {
    setLayoutVariant(v);
    try {
      const { e } = makeEngine(c.id, d);
      boas += e.enemies.filter((q: any) => q.type === 'boa').length;
      kit += (e.cast?.members ?? []).filter((m: any) => m.def.kind === 'boa').length;
    } catch (err) { rows.push(`${c.id} ${d} ${v}: ${String(err).slice(0, 80)}`); }
    setLayoutVariant(null);
  }
  if (boas) { stagesWithBoas++; rows.push(`${c.id}: ${boas} boas over 8 builds, ${kit} on the kit`); }
  kitBoas += kit;
}
console.log(rows.join('\n'));
console.log(`stages with boas: ${stagesWithBoas}; boas the kit runs (read BOA.tell): ${kitBoas}`);
