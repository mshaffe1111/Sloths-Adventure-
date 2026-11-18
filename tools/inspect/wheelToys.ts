/**
 * The water wheel toys' fixtures (ENG-26; reference/design/2-6.md NEW 1-2; wheel.test.ts and wheelRide.test.ts run them): a toy TOWER
 * (an ascent, as 2-6 is: gen2/toyTower.ts's plain storeys and vines) on World 2's ground with ONE wheel section: a jetty, the wheel of a
 * World 2 row (w2.ts W2_WHEELS) laid by place `wheel`, and its street, rolled by gen2 the way the game rolls a listed stage (listed.ts
 * withTestStage, a planted one-seed list, World 2's finish), and a tier bot's run over it.
 *   - 'teach': the teach wheel (R160 V60, Easy V50; the street in over the top), 2-6 beat 1
 *   - 'edge':  the street at the sweep's edge (R180 V70, Easy V60): a step off as the bucket comes level, 2-6 beat 5
 *   - 'top':   the street 80 px over the top bucket (Easy 60): a jump off the top, 2-6 beat 8
 */
import '../../src/game/headlessDom.ts';
import { withTestStage } from '../../src/game/gen2/listed.ts';
import { buildGen2Stage, keptFoes } from '../../src/game/gen2/pipeline.ts';
import { packPlan, plantSeedList } from '../../src/game/gen2/seedList.ts';
import { withFixtureConfig } from '../../src/game/realPlay.ts';
import { landing, towerCfg, upManifest, vineUp } from '../../src/game/gen2/toyTower.ts';
import { cfg as toyCfg, kit as toyKit, meadow } from '../../src/game/gen2/toyWorld.ts';
import { w2Finish, W2_GROUND, W2_WHEELS } from '../../src/game/gen2/worlds/w2.ts';
import type { Gen2Stage, SectionTemplate, WorldKit } from '../../src/game/gen2/types.ts';
import type { LevelConfig } from '../../src/game/types.ts';
import { runTier, type Setting, type Tier, type TierOpts, type TierRun } from './tierBots.ts';

export type WheelToy = keyof typeof W2_WHEELS;

/** the wheel section: a jetty (a storey's bough), the wheel, its street (the next storey's bough) */
export const wheelSection = (row: WheelToy): SectionTemplate => ({
  id: `toy-wheel-${row}`, name: `a water wheel (${row})`, archetypes: 'any', phases: ['ki', 'sho', 'ten', 'ketsu'], difficulty: 2, maxPerStage: 1,
  pieces: [
    // (rolled widths: a narrow roll fits on the way the storey runs, a wide one turns it back first, so the toy lays the wheel both ways round)
    { key: 'jetty', shape: 'branch', w: [120, 300], place: { kind: 'start' }, main: true },
    { key: 'street', shape: 'branch', w: [180, 340], place: { kind: 'wheel', after: 'jetty', row }, main: true, landing: true },
  ],
  entry: { piece: 'jetty', kind: 'ledge' }, exit: { piece: 'street', kind: 'ledge' }, exitDy: -300, sockets: [], mirrorable: false,
});

/** the toy RUN's kit (a stage laid right, never turned: the wheel turned the other way round from the tower's leftward storeys) */
export const runKitFor = (row: WheelToy): WorldKit => ({
  ...toyKit,
  manifest: {
    ...toyKit.manifest, world: 2, wheels: W2_WHEELS, creatures: [], props: [], pairs: [], tips: {},
    sections: [{ ...meadow, phases: ['start', 'rest', 'ki', 'sho', 'ten', 'ketsu', 'goal'], mirrorable: false, sockets: meadow.sockets.filter((k) => k.role !== 'prop') }, wheelSection(row)],
  },
});
export const RUN_ID = '2-96';
export const runCfg: LevelConfig = { ...toyCfg(RUN_ID, 'sprint'), unlocked: true };

/** the toy tower's kit: World 2's ground and wheels, the toy tower's landing and climbing vine, and the wheel */
export const kitFor = (row: WheelToy): WorldKit => ({
  manifest: {
    ...upManifest, world: 2, name: `Toy wheel tower (${row})`, ground: { y: W2_GROUND.y, bankH: W2_GROUND.bankH, style: 'log' }, wheels: W2_WHEELS,
    creatures: [], props: [], pairs: [], tips: {},
    sections: [landing, vineUp, wheelSection(row)],
    required: { [ID]: [{ section: `toy-wheel-${row}` }] },
  },
  emit: {},
});
export const ID = '2-95';
export const cfg: LevelConfig = { ...towerCfg(ID, 'ascent'), unlocked: true };

/** the toy's stage as built */
export const toyStage = (row: WheelToy, seed: number, difficulty: 'normal' | 'easy' = 'normal', flow: 'up' | 'right' = 'up'): Gen2Stage =>
  flow === 'up' ? buildGen2Stage({ config: cfg, kit: kitFor(row), seed, difficulty }) : buildGen2Stage({ config: runCfg, kit: runKitFor(row), seed, difficulty });

/** the toy's wheels laid (each once) */
export const wheelsOf = (st: { platforms: ReadonlyArray<{ wheel?: { w: unknown } }> }) => new Set(st.platforms.filter((p) => p.wheel).map((p) => p.wheel!.w)).size;

/** the first seed of 1-60 whose roll lays the one wheel and builds clean on both settings (or null: none does) */
export function fixtureSeed(row: WheelToy, settings: ReadonlyArray<'normal' | 'easy'> = ['normal', 'easy'], flow: 'up' | 'right' = 'up'): number | null {
  for (let seed = 1; seed <= 60; seed++) {
    const ok = settings.every((d) => {
      const st = toyStage(row, seed, d, flow);
      return !st.gen2.errors?.length && wheelsOf(st) === 1;
    });
    if (ok) return seed;
  }
  return null;
}

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
