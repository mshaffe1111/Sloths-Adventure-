// ENG-DARK probe: the darkFlags toy's flag on seed 1, and the glows a stop at it reaches
import '../../../../src/game/headlessDom.ts';
import { readyDraft } from '../../../../tools/engine/draft.ts';
import { generateAllLevels } from '../../../../src/game/worldsData.ts';
import { generateStage, setLayoutVariant } from '../../../../src/game/stageGenerator.ts';
import { keepsClear } from '../../../../src/game/zones.ts';
import { litAfter } from '../../../../src/game/gen2/dark.ts';
readyDraft('3-1');
setLayoutVariant(1);
const st = generateStage({ ...generateAllLevels().find((c) => c.id === '3-1' && !c.secret)!, unlocked: true }, 'normal');
setLayoutVariant(null);
const glow = (st.zones ?? []).filter((z) => z.kind === 'dark' && !keepsClear(z));
for (const c of st.checkpoints ?? []) {
  const zs = glow.filter((z) => c.x >= z.x0 && c.x <= z.x1 && c.y >= z.top && c.y <= z.bottom);
  if (!zs.length) continue;
  const ls = zs.flatMap((z) => z.lights ?? []).map((l) => ({ d: Math.round(Math.hypot(l.x - c.x, l.y - c.y)), t: Math.min(litAfter(l, c.x, c.y, 1), litAfter(l, c.x, c.y, -1)) })).sort((a, b) => a.d - b.d);
  console.log(`flag ${Math.round(c.x)},${Math.round(c.y)} zones ${zs.length}: nearest ${JSON.stringify(ls.slice(0, 4))}`);
}
import { darkFlags } from '../../../../src/game/gen2/dark.ts';
const c = (st.checkpoints ?? []).find((q) => glow.some((z) => q.x >= z.x0 && q.x <= z.x1 && q.y >= z.top && q.y <= z.bottom))!;
const zones = (st.zones ?? []).map((z) => (z.kind === 'dark' && z.lights ? { ...z, lights: z.lights.filter((l) => Math.hypot(l.x - c.x, l.y - c.y) > 600 || !l.sleep) } : z));
console.log('toy flag', c.x, c.y, 'red', darkFlags({ ...st, zones }), 'left', zones.filter((z) => z.kind === 'dark' && c.x >= z.x0 && c.x <= z.x1 && c.y >= z.top && c.y <= z.bottom).map((z) => z.lights?.length));
