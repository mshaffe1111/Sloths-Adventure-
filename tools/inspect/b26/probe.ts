// BUILD-26 probe: the draft row's built beats, flags and banks (route measure), one roll per setting
import '../../../src/game/headlessDom.ts';
import { generateAllLevels } from '../../../src/game/worldsData.ts';
import { listedStage, playFinish, withTestStage } from '../../../src/game/gen2/listed.ts';
import { buildGen2Stage } from '../../../src/game/gen2/pipeline.ts';
import { w2Finish } from '../../../src/game/gen2/worlds/w2.ts';
import { kitLib26, STAGE_26 } from '../../../src/game/gen2/worlds/w2Arc26.ts';
const cfg = generateAllLevels().find((c) => c.id === STAGE_26 && !c.secret)!;
const seeds = (process.argv[2] ?? '1').split(',').map(Number);
withTestStage({ [STAGE_26]: { kit: kitLib26, world: (s: any, _q: any, d: any) => w2Finish(s, d) as any, seeds: [] } } as any, () => {
  const row = listedStage(STAGE_26)!;
  for (const d of ['normal', 'easy'] as const) for (const seed of seeds) {
    const st: any = playFinish(row, buildGen2Stage({ config: cfg, kit: row.kit(), seed, difficulty: d }) as never, d);
    console.log(`== ${d} ${seed} errors ${JSON.stringify(st.gen2.errors ?? [])} keys ${Object.keys(st.gen2).join(',')}`);
    for (const s of st.gen2.sections) console.log(`  ${s.template.replace('w2-26-', '').padEnd(14)} node ${s.node} x0 ${Math.round(s.x0)} x1 ${Math.round(s.x1)} y ${Math.round(s.y ?? 0)} along ${s.along ?? ''}`);
    console.log("  miss", JSON.stringify({ flag: st.gen2.flagMiss, tower: st.gen2.towerMiss, window: st.gen2.windowMiss, verdicts: (st.gen2.verdicts ?? []).length, hearts: (st.collectibles ?? []).filter((c: any) => c.type === "heart").length }));
    console.log('  flags', JSON.stringify(st.checkpoints.map((c: any) => [Math.round(c.x), Math.round(c.y), c.along])));
  }
});
