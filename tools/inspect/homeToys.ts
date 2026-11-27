/**
 * The out-and-back toy's runs (ENG-27; reference/design/2-7.md READY, level.md rule 23): gen2/toyHome.ts's kit (World 2's ground and
 * river rows: out right with a river at him, a way down, home LEFT with the rivers flowing left) rolled the way the game rolls a listed
 * stage (listed.ts withTestStage, a planted one-seed list, World 2's finish), and a tier bot's run over it. No stage of the game.
 */
import '../../src/game/headlessDom.ts';
import { withTestStage } from '../../src/game/gen2/listed.ts';
import { buildGen2Stage, keptFoes } from '../../src/game/gen2/pipeline.ts';
import { packPlan, plantSeedList } from '../../src/game/gen2/seedList.ts';
import { withFixtureConfig } from '../../src/game/realPlay.ts';
import { towerCfg } from '../../src/game/gen2/toyTower.ts';
import { HOME_CODE, homeKit } from '../../src/game/gen2/toyHome.ts';
import { w2Finish } from '../../src/game/gen2/worlds/w2.ts';
import type { LevelConfig } from '../../src/game/types.ts';
import { runTier, type Setting, type Tier, type TierOpts, type TierRun } from './tierBots.ts';

/** the toy's stage id: World 2, no stage of the game */
export const HOME_ID = '2-97';
export const homeCfg: LevelConfig = { ...towerCfg(HOME_ID, 'sprint'), unlocked: true };

/** the toy built as the listed row builds it */
export const homeStage = (seed: number, difficulty: 'normal' | 'easy' = 'normal', code = HOME_CODE) => buildGen2Stage({ config: homeCfg, kit: homeKit(HOME_ID, code), seed, difficulty });

/** a tier's run over the toy, rolled the game's way (the listed row, the planted list, World 2's finish) */
export function homeRun(tier: Tier, setting: Setting, seed: number, variant = 1, opts: TierOpts = {}, code = HOME_CODE): TierRun {
  const kit = homeKit(HOME_ID, code);
  const st = buildGen2Stage({ config: homeCfg, kit, seed, difficulty: 'normal' });
  const dict: string[] = [];
  const packed = packPlan({ seed: st.gen2.seed, rerolls: st.gen2.rerolls, plan: st.gen2.plan, foes: [...keptFoes(st)] }, dict);
  return withTestStage({ [HOME_ID]: { kit: () => kit, world: (s, _sq, d) => w2Finish(s as never, d) as typeof s, seeds: [] } }, () => {
    const undo = plantSeedList(HOME_ID, { dict, seeds: [seed], plans: [packed] });
    try {
      return withFixtureConfig(homeCfg, () => runTier(tier, setting, variant, HOME_ID, opts));
    } finally {
      undo();
    }
  });
}

// (a run from the shell: `npx tsx tools/inspect/homeToys.ts <tier> <setting> <seed>`)
if (process.argv[1]?.endsWith('homeToys.ts')) {
  const [tier = 'middle', setting = 'normal', seed = '1'] = process.argv.slice(2);
  const r = homeRun(tier as Tier, setting as Setting, Number(seed));
  console.log(JSON.stringify({ tier: r.tier, setting: r.setting, end: r.end, finishSeconds: r.finishSeconds, lives: r.lives, putbacks: r.putbacks, handed: r.handed }));
}
