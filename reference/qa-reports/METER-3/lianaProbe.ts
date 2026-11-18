// npx tsx reference/qa-reports/METER-3/lianaProbe.ts [setting]: the meter on ENG-24's liana toys (every toy row, rolled the game's way): the route's river moves and their prices (METER-3, R-165.287)
import '../../../src/game/headlessDom.ts';
import { withTestStage } from '../../../src/game/gen2/listed.ts';
import { buildGen2Stage, keptFoes } from '../../../src/game/gen2/pipeline.ts';
import { packPlan, plantSeedList } from '../../../src/game/gen2/seedList.ts';
import { withFixtureConfig } from '../../../src/game/realPlay.ts';
import { w2Finish } from '../../../src/game/gen2/worlds/w2.ts';
import { cfg, fixtureSeed, ID, kitFor, type LianaToy, type ToyRiver } from '../../../tools/inspect/lianaRiverToys.ts';
import { scoreStage } from '../../../tools/difficulty/score.ts';
const setting = (process.argv[2] ?? 'normal') as 'normal' | 'easy';
for (const [toy, row, easy] of [['drop', 'long', 'long'], ['drop', 'ride', 'deep'], ['drop', 'twin', 'deep'], ['drop', 'gap280', 'deep'], ['catch', 'twin', 'long']] as Array<[LianaToy, ToyRiver, ToyRiver]>) {
  const seed = fixtureSeed(toy, row, ['normal', 'easy'], easy)!;
  const kit = kitFor(toy, row, easy);
  const st = buildGen2Stage({ config: cfg, kit, seed, difficulty: setting });
  const dict: string[] = [];
  const packed = packPlan({ seed: st.gen2.seed, rerolls: st.gen2.rerolls, plan: st.gen2.plan, foes: [...keptFoes(st)] }, dict);
  withTestStage({ [ID]: { kit: () => kit, world: (s, _sq, d) => w2Finish(s as never, d) as typeof s, seeds: [] } }, () => {
    const undo = plantSeedList(ID, { dict, seeds: [seed], plans: [packed] });
    try {
      withFixtureConfig(cfg, () => {
        try {
          const sc = scoreStage(ID, setting, seed, new Map());
          console.log(`${toy}/${setting === 'easy' ? easy : row} ${setting}: raw ${sc.raw.toFixed(2)}; route ${sc.route ?? ''}`);
          console.log('   moves:', JSON.stringify((sc as any).moves ?? null));
          for (const c of sc.challenges) if (/liana|log|ride|catch|swing/.test(c.kind)) console.log(`   ${c.kind} x${Math.round(c.x)} ${c.bits.toFixed(2)} bits ${c.cost}: ${c.note}`);
          console.log('   pieces', sc.pieces.join(' '));
        } catch (e) { console.log(`${toy}/${row}: THROWS ${String(e).slice(0, 300)}`); }
      });
    } finally { undo(); }
  });
}
