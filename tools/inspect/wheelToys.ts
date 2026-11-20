/**
 * The water wheel toys' fixtures (ENG-26; reference/design/2-6.md NEW 1-2; wheel.test.ts and wheelRide.test.ts run them): a toy TOWER
 * (an ascent, as 2-6 is: gen2/toyTower.ts's plain storeys and vines) on World 2's ground with ONE wheel section: a jetty, the wheel of a
 * World 2 row (w2.ts W2_WHEELS) laid by place `wheel`, and its street, rolled by gen2 the way the game rolls a listed stage (listed.ts
 * withTestStage, a planted one-seed list, World 2's finish), and a tier bot's run over it.
 *   - 'teach': the teach wheel (R160 V60, Easy V50; the street in over the top), 2-6 beat 1
 *   - 'edge':  the street at the sweep's edge (R180 V70, Easy V50): a step off as the bucket comes level, 2-6 beat 5
 *   - 'top':   the street 80 px over the top bucket (Easy 60): a jump off the top, 2-6 beat 8
 */
import '../../src/game/headlessDom.ts';
import { withTestStage } from '../../src/game/gen2/listed.ts';
import { buildGen2Stage, keptFoes } from '../../src/game/gen2/pipeline.ts';
import { packPlan, plantSeedList } from '../../src/game/gen2/seedList.ts';
import { withFixtureConfig } from '../../src/game/realPlay.ts';
import { w2Finish } from '../../src/game/gen2/worlds/w2.ts';
import { cfg, ID, kitFor, type WheelToy } from '../../src/game/wheelFixtureStage.ts';
import { runTier, type Setting, type Tier, type TierOpts, type TierRun } from './tierBots.ts';

// (the toys' kit, rows and stage live with the page's dev fixture, src/game/wheelFixtureStage.ts: one definition for the tests and the page)
export { cfg, fixtureSeed, ID, kitFor, RUN_ID, runCfg, runKitFor, TOY_WHEELS, toyStage, wheelSection, wheelsOf, type WheelToy } from '../../src/game/wheelFixtureStage.ts';

/** a tier's run over the toy, rolled the game's way (the listed row, the planted list, World 2's finish) */
export function wheelRun(row: WheelToy, tier: Tier, setting: Setting, seed: number, variant = 1, opts: TierOpts = {}): TierRun {
  const kit = kitFor(row);
  const st = buildGen2Stage({ config: cfg, kit, seed, difficulty: 'normal' });
  const dict: string[] = [];
  const packed = packPlan({ seed: st.gen2.seed, rerolls: st.gen2.rerolls, plan: st.gen2.plan, foes: [...keptFoes(st)] }, dict);
  return withTestStage({ [ID]: { kit: () => kit, world: (s, _sq, d) => w2Finish(s as never, d) as typeof s, seeds: [] } }, () => {
    const undo = plantSeedList(ID, { dict, seeds: [seed], plans: [packed] });
    try {
      return withFixtureConfig(cfg, () => runTier(tier, setting, variant, ID, opts));
    } finally {
      undo();
    }
  });
}

/**
 * a tier's crossing of the toy's wheel, as a person watching would tell it: from the first frame he stands on the jetty or in a bucket to
 * the first on the street (s; null: never), how many times he left a bucket and came down anywhere but the street (a scramble bucket to
 * bucket, or into the pond), and how many times he fell into the pond (his feet past its surface inside it)
 */
export function wheelCrossing(row: WheelToy, tier: Tier, setting: Setting, seed: number, variant = 1): { run: TierRun; seconds: number | null; scrambles: number; pond: number } {
  let t0 = -1, t1 = -1, scrambles = 0, pond = 0, prev = '', wet = false, left = false;
  const run = wheelRun(row, tier, setting, seed, variant, {
    onFrame: (sim) => {
      if (t1 >= 0) return;
      const w = sim.platforms.find((p) => p.wheel)?.wheel?.w;
      const z = sim.stage.rivers?.find((r) => r.wheelPond);
      if (!w?.lay || !z) return;
      const on = sim.standingOn;
      // (the street's storey: the street, or wood laid on from its far end at its height (a tower's run-on), past the lip)
      const street = sim.platforms.find((p) => p.id === w.lay!.streetId);
      const q = sim.platforms.find((p) => p.id === on);
      const onStreet = !!q && !!street && (q === street || (!q.wheel && Math.abs(q.y - street.y) <= 4 && (sim.p.x - w.cx) * w.way > 0));
      const where = on === w.lay.jetty ? 'jetty' : onStreet ? 'street' : q?.wheel ? 'bucket' : on >= 0 ? 'other' : 'air';
      // (from 2 s on: the stage's first moments are the bot's blind walk on (FirstTimer.look), and the toy's jetty is near its start)
      if (t0 < 0 && sim.t >= 2 && (where === 'jetty' || where === 'bucket')) t0 = sim.t;
      // (a leave from a bucket is a scramble unless it lands on the street: the step-off)
      if (t0 >= 0 && prev === 'bucket' && where === 'air') left = true;
      if (left && where !== 'air') { if (where !== 'street') scrambles++; left = false; }
      if (t0 >= 0 && where === 'street') t1 = sim.t;
      const inPond = sim.p.x > z.x0 && sim.p.x < z.x1 && sim.p.y > z.surfaceY - 8;
      if (t0 >= 0 && inPond && !wet) pond++;
      wet = inPond;
      prev = where;
    },
  });
  return { run, seconds: t0 >= 0 && t1 >= 0 ? +(t1 - t0).toFixed(1) : null, scrambles, pond };
}
