// npx tsx reference/qa-reports/ENG-24/meterProbe.ts: the meter (tools/difficulty/score.ts) on the liana toys, rolled the game's way
import '../../../src/game/headlessDom.ts';
import { withTestStage } from '../../../src/game/gen2/listed.ts';
import { buildGen2Stage, keptFoes } from '../../../src/game/gen2/pipeline.ts';
import { packPlan, plantSeedList } from '../../../src/game/gen2/seedList.ts';
import { withFixtureConfig } from '../../../src/game/realPlay.ts';
import { w2Finish } from '../../../src/game/gen2/worlds/w2.ts';
import { cfg, fixtureSeed, ID, kitFor, type LianaToy, type ToyRiver } from '../../../tools/inspect/lianaRiverToys.ts';
import { scoreStage } from '../../../tools/difficulty/score.ts';
for (const [toy, row, easy] of [['drop', 'long', 'long'], ['drop', 'gap280', 'deep'], ['catch', 'twin', 'long']] as Array<[LianaToy, ToyRiver, ToyRiver]>) {
  const seed = fixtureSeed(toy, row, ['normal', 'easy'], easy)!;
  const kit = kitFor(toy, row, easy);
  const st = buildGen2Stage({ config: cfg, kit, seed, difficulty: 'normal' });
  const dict: string[] = [];
  const packed = packPlan({ seed: st.gen2.seed, rerolls: st.gen2.rerolls, plan: st.gen2.plan, foes: [...keptFoes(st)] }, dict);
  withTestStage({ [ID]: { kit: () => kit, world: (s, _sq, d) => w2Finish(s as never, d) as typeof s, seeds: [] } }, () => {
    const undo = plantSeedList(ID, { dict, seeds: [seed], plans: [packed] });
    try {
      withFixtureConfig(cfg, () => {
        try {
          const sc = scoreStage(ID, 'normal', seed, new Map()) as unknown as Record<string, unknown>;
          const asks = (sc.challenges ?? []) as Array<Record<string, unknown>>;
          console.log(`${toy}/${row}: total ${JSON.stringify(sc.total ?? sc.score ?? sc.bits)} keys ${Object.keys(sc).join(',')}`);
          console.log('  ', JSON.stringify(asks.filter((a) => Number(a.x ?? a.x0 ?? 0) > 1300 && Number(a.x ?? a.x0 ?? 0) < 3400)).slice(0, 900)); console.log('  pieces', JSON.stringify(sc.pieces).slice(0, 300));
        } catch (e) { console.log(`${toy}/${row}: THROWS ${String(e).slice(0, 300)}`); }
      });
    } finally { undo(); }
  });
}
