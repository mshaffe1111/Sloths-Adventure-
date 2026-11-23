// ENG-HUD27b: every listed stage, 16 layouts x 2 settings: on a stage with a route, does the first painted water by the route differ from the old x pick? Run from the repo root: npx tsx reference/qa-reports/ENG-HUD27/firstWaterListed.ts
import '../../../src/game/headlessDom.ts';
import { generateAllLevels } from '../../../src/game/worldsData.ts';
import { generateStage, setLayoutVariant } from '../../../src/game/stageGenerator.ts';
import { easyStage } from '../../../src/game/easyMode.ts';
import { withGoals } from '../../../src/game/goals.ts';
import { firstMet } from '../../../src/game/gen2/tower.ts';
const levels = generateAllLevels().filter((c) => !c.secret);
let routed = 0, differ = 0, waters = 0;
for (const c of levels) for (const setting of ['normal', 'easy'] as const) for (let v = 1; v <= 16; v++) {
  setLayoutVariant(v);
  let st: any;
  try { st = setting === 'easy' ? easyStage(withGoals(generateStage({ ...c, unlocked: true }, 'easy'))) : withGoals(generateStage({ ...c, unlocked: true }, 'normal')); } catch { setLayoutVariant(null); continue; }
  setLayoutVariant(null);
  if (!st.gen2?.tower?.route) continue;
  routed++;
  const w = (st.gen2.drops ?? []).filter((d: any) => d.ends.kind === 'life' && d.look === 'water-art');
  waters += w.length;
  const old = [...w].sort((a: any, b: any) => a.x0 - b.x0)[0];
  const now = firstMet(st, w, (d: any) => [{ x: d.x0, y: d.lipY }, { x: d.x1, y: d.lipY }]);
  if (old !== now) { differ++; console.log('DIFFERS', c.id, setting, v, old?.x0, now?.x0); }
}
console.log(`routed builds ${routed}, painted lethal waters on them ${waters}, first water differs on ${differ}`);
