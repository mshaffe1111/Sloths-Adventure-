// CP3: where the first-timer bots stop (stuck spots and rescues), by the idea laid there, layouts 1-4, adult on Normal and kid on Easy
import '../../src/game/headlessDom.ts';
import { firstTimer, FT_ADULT, FT_KID } from '../inspect/firsttimer.ts';
import { generateAllLevels } from '../../src/game/worldsData.ts';
import { generateStage, setLayoutVariant } from '../../src/game/stageGenerator.ts';
const c = generateAllLevels().find((l) => l.id === (process.env.SID ?? '1-5'))!;
for (const who of [FT_ADULT, FT_KID]) for (const seed of [1, 2, 3, 4]) {
  setLayoutVariant(seed); const st: any = generateStage({ ...c, unlocked: true }, who.setting); setLayoutVariant(null);
  const ex = st.meta.mix.explain;
  const r: any = firstTimer((process.env.SID ?? '1-5'), seed, who, { fresh: true });
  for (const s of r.stuck) {
    const e = ex.filter((e: any) => s.x >= e.x0 - 60 && s.x <= e.x1 + 60).map((e: any) => `n${e.node} ${e.idea}${e.canopy ? ' (canopy)' : ''}${e.road ? '/' + e.road : ''}`).join('|') || 'frame';
    console.log(`${who.name} layout ${seed}: stuck x ${Math.round(s.x)} y ${Math.round(s.y)} ${s.dur} s ${s.rescued ? 'rescued' : ''} "${s.what}" at ${e}`);
  }
}
