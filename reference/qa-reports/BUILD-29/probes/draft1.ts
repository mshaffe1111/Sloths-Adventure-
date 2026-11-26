// BUILD-29: the draft rolled once per setting (seeds 1-2), its gen2 errors listed. npx tsx reference/qa-reports/BUILD-29/probes/draft1.ts
import '../../../../src/game/headlessDom.ts';
import { withTestStage } from '../../../../src/game/gen2/listed.ts';
import { buildGen2Stage } from '../../../../src/game/gen2/pipeline.ts';
import { STAGE_29, draft29Cfg, draft29Row, kitLib29 } from '../../../../src/game/gen2/worlds/w2Arc29.ts';
for (const d of ['normal', 'easy'] as const) for (const seed of [1, 2]) {
  try {
    const st = withTestStage({ [STAGE_29]: draft29Row() }, () => buildGen2Stage({ config: draft29Cfg(), kit: kitLib29(), seed, difficulty: d }));
    const e = st.gen2.errors; console.log(`${d} s${seed}: errors ${e.length}; width ${Math.round(Math.max(...st.platforms.map((p) => p.x + p.width)))}; enemies ${st.enemies.length}; target ${st.config?.targetCount}`);
    for (const x of e) console.log('   ', String(x).slice(0, 200));
  } catch (err) { console.log(`${d} s${seed}: THREW ${String(err).slice(0, 300)}`); }
}
