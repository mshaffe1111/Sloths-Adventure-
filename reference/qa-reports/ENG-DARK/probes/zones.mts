// ENG-DARK probe: the 3-1 draft's dark zones, lights and the laid-stage verdict, per seed and setting
import '../../../../src/game/headlessDom.ts';
import { readyDraft } from '../../../../tools/engine/draft.ts';
import { generateAllLevels } from '../../../../src/game/worldsData.ts';
import { generateStage, setLayoutVariant } from '../../../../src/game/stageGenerator.ts';
import { darkGaps, darkRims } from '../../../../src/game/gen2/dark.ts';
readyDraft('3-1');
const seeds = (process.argv[2] ?? '1-6').split('-').map(Number);
for (let seed = seeds[0]; seed <= (seeds[1] ?? seeds[0]); seed++) for (const d of ['normal', 'easy'] as const) {
  setLayoutVariant(seed);
  let st;
  try { st = generateStage({ ...generateAllLevels().find((c) => c.id === '3-1' && !c.secret)!, unlocked: true }, d); } finally { setLayoutVariant(null); }
  const dark = (st.zones ?? []).filter((z) => z.kind === 'dark');
  const rims = darkRims(st);
  const gaps = darkGaps(st);
  console.log(`seed ${seed} ${d}: dark ${dark.length}, lights ${dark.reduce((s, z) => s + (z.lights?.length ?? 0), 0)}, rims ${rims.length} (lit ${rims.filter((r) => r.light).length}); darkGaps ${gaps.length}`);
  for (const g of gaps.slice(0, 3)) console.log('   ', g);
}
