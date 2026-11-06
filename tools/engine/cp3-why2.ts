import '../../src/game/headlessDom.ts';
import { generateAllLevels } from '../../src/game/worldsData.ts';
import { generateStage, setLayoutVariant } from '../../src/game/stageGenerator.ts';
import { easyStage } from '../../src/game/easyMode.ts';
import { withGoals } from '../../src/game/goals.ts';
import { validateStage } from '../../src/game/levelCheck.ts';
const c = generateAllLevels().find((l) => l.id === '1-5')!;
const tally = new Map<string, number>();
for (let v = 1; v <= 16; v++) for (const setting of ['normal', 'easy'] as const) {
  setLayoutVariant(v); const st = setting === 'easy' ? easyStage(withGoals(generateStage({ ...c, unlocked: true }, 'easy'))) : withGoals(generateStage({ ...c, unlocked: true }, 'normal')); setLayoutVariant(null);
  const r = validateStage(st, { rooms: false }); if (r.ok) continue;
  const ok = new Set(r.reachableIds);
  const ps = [...st.platforms].sort((a, b) => a.x - b.x);
  const first = ps.find((p) => !ok.has(p.id) && p.type !== 'bouncy' && !(p as any).catch);
  const ex = first ? (st.meta as any).mix.explain.filter((e: any) => first.x >= e.x0 - 120 && first.x <= e.x1 + 120).map((e: any) => e.idea + (e.road ? '(' + e.road + ')' : '')).join('|') : 'all reachable: ' + r.errors[0];
  const k = `${setting}: ${ex}`; tally.set(k, (tally.get(k) ?? 0) + 1);
}
for (const [k, v] of [...tally].sort((a, b) => b[1] - a[1])) console.log(`${v} x ${k}`);
