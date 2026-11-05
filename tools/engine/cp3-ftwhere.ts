import '../../src/game/headlessDom.ts';
import { firstTimer, FT_ADULT } from '../inspect/firsttimer.ts';
import { generateAllLevels } from '../../src/game/worldsData.ts';
import { generateStage, setLayoutVariant } from '../../src/game/stageGenerator.ts';
const c = generateAllLevels().find((l) => l.id === '1-5')!;
for (const seed of [2]) {
  setLayoutVariant(seed); const st: any = generateStage({ ...c, unlocked: true }, 'normal'); setLayoutVariant(null);
  const ex = st.meta.mix.explain;
  const r = firstTimer('1-5', seed, FT_ADULT, { fresh: true });
  const where = r.harms.map((h) => { const e = ex.filter((e: any) => h.x >= e.x0 - 50 && h.x <= e.x1 + 50).map((e: any) => `n${e.node} ${e.idea}${e.road ? '/' + e.road : ''}`).join('|'); return `x ${Math.round(h.x)} y ${Math.round(h.y)} ${h.kind} ${h.cause} t ${Math.round(h.t)}: ${e}`; });
  const marks = st.collectibles.filter((q: any) => q.type === 'relic').length;
  console.log(`layout ${seed}: marks laid ${marks}, goal ${st.normalGoal}; ${r.harms.length} harms`); for (const w of where) console.log('    ' + w);
}
