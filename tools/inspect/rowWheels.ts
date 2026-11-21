/**
 * The tier bots over a stage ROW not yet on the seed list (ENG-26d; level.md rules 21, 23: ready is proven on a real row, played),
 * every water wheel tallied as a person watching would tell it (wheelCrossings.ts). The row is planted the way Play rolls a listed row:
 * listed.ts withTestStage with its kit and its world's finish, a one-seed list packed from the roll (seedList.ts plantSeedList), and a
 * hand-built stage of the same id hidden for the run (it is routed before any listed row) and put back after it.
 *
 * As a tool: npx tsx tools/inspect/rowWheels.ts  (2-6's draft row, seed 1; OFF=1 the plant, rideWheel off; SEED=n; TIER=child SET=easy V=1)
 */
import '../../src/game/headlessDom.ts';
import { withTestStage } from '../../src/game/gen2/listed.ts';
import { buildGen2Stage, keptFoes } from '../../src/game/gen2/pipeline.ts';
import { packPlan, plantSeedList } from '../../src/game/gen2/seedList.ts';
import type { WorldKit } from '../../src/game/gen2/types.ts';
import { W2_STAGES } from '../../src/game/w2Stages.ts';
import { generateAllLevels } from '../../src/game/worldsData.ts';
import { runTier, type Setting, type Tier, type TierRun } from './tierBots.ts';
import { wheelTally, type WheelCrossing } from './wheelCrossings.ts';

/** a row as listed.ts takes it: its stage id, its kit and its world's finish */
export interface PlantedRow {
  stage: string;
  kit: () => WorldKit;
  world: (s: never, sq: never, d: 'easy' | 'normal') => unknown;
}

export const TIER_RUNS: ReadonlyArray<readonly [Tier, Setting]> = [['child', 'easy'], ['child', 'normal'], ['middle', 'normal'], ['middle', 'easy'], ['expert', 'normal']];

export interface RowWheelRun {
  tier: Tier;
  setting: Setting;
  v: number;
  run: TierRun;
  /** every wheel of the stage, lowest first (wheelCrossings.ts) */
  wheels: WheelCrossing[];
}

/** `fn` with `row` planted as the one listed roll of its stage at `seed` (as the game rolls a listed row), everything put back after */
export function withPlantedRow<T>(row: PlantedRow, seed: number, fn: () => T): T {
  const cfg = generateAllLevels().find((c) => c.id === row.stage && !c.secret);
  if (!cfg) throw new Error(`rowWheels: no stage ${row.stage}`);
  const kit = row.kit();
  const st = buildGen2Stage({ config: cfg, kit, seed, difficulty: 'normal' });
  const dict: string[] = [];
  const packed = packPlan({ seed: st.gen2.seed, rerolls: st.gen2.rerolls, plan: st.gen2.plan, foes: [...keptFoes(st)] }, dict);
  return withTestStage({ [row.stage]: { kit: () => kit, world: row.world as never, seeds: [] } }, () => {
    const undo = plantSeedList(row.stage, { dict, seeds: [seed], plans: [packed] });
    const hands = W2_STAGES as Record<string, unknown>;
    const had = row.stage in hands, hand = hands[row.stage];
    delete hands[row.stage];
    try {
      return fn();
    } finally {
      undo();
      if (had) hands[row.stage] = hand;
    }
  });
}

/** each tier run over the planted row, both variants, with every wheel tallied */
export function rowWheelRuns(row: PlantedRow, seed: number, runs = TIER_RUNS, variants: readonly number[] = [1, 2]): RowWheelRun[] {
  return withPlantedRow(row, seed, () => runs.flatMap(([tier, setting]) => variants.map((v) => {
    const tally = wheelTally();
    const run = runTier(tier, setting, v, row.stage, { onFrame: tally.onFrame });
    return { tier, setting, v, run, wheels: tally.crossings() };
  })));
}

/** one line a run, as the REPORT's bots table reads */
export const runLine = (r: RowWheelRun): string =>
  `${r.tier} ${r.setting} v${r.v}: ${r.run.end} ${r.run.finishSeconds ?? '-'} s, lives ${r.run.lives}, put-backs ${r.run.putbacks}, rescues ${r.run.rescues}`
  + ` | ${r.wheels.map((c) => `${c.row}${c.way > 0 ? 'R' : 'L'} ${c.seconds ?? 'never'}${c.seconds === null ? '' : 's'} sc${c.scrambles} pd${c.pond}`).join(', ')}`;

if (import.meta.url === `file://${process.argv[1]}`) {
  const { SKILLS } = await import('./firsttimer.ts');
  const { kitLib26, STAGE_26 } = await import('../../src/game/gen2/worlds/w2Arc26.ts');
  const { w2Finish } = await import('../../src/game/gen2/worlds/w2.ts');
  if (process.env.OFF) SKILLS.rideWheel = false;
  const runs = process.env.TIER ? [[process.env.TIER as Tier, (process.env.SET ?? 'normal') as Setting] as const] : TIER_RUNS;
  const variants = process.env.V ? [Number(process.env.V)] : [1, 2];
  for (const r of rowWheelRuns({ stage: STAGE_26, kit: kitLib26, world: w2Finish as never }, Number(process.env.SEED ?? 1), runs, variants)) console.log(runLine(r));
}
