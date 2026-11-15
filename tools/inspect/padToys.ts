/**
 * The pad toys' fixtures (ENG-22; padRide.test.ts runs them): a pond section over deep water on the toy kit, rolled by gen2 the way the
 * game rolls a listed stage (listed.ts withTestStage, a planted one-seed list, World 2's finish), and a tier bot's run over it.
 */
import '../../src/game/headlessDom.ts';
import { withTestStage } from '../../src/game/gen2/listed.ts';
import { buildGen2Stage, keptFoes } from '../../src/game/gen2/pipeline.ts';
import { packPlan, plantSeedList } from '../../src/game/gen2/seedList.ts';
import type { PadRow } from '../../src/game/gen2/rideLay.ts';
import { withFixtureConfig } from '../../src/game/realPlay.ts';
import { cfg as toyCfg, kit as toyKit, meadow } from '../../src/game/gen2/toyWorld.ts';
import { w2Finish } from '../../src/game/gen2/worlds/w2.ts';
import type { Gen2Stage, SectionTemplate, WorldKit } from '../../src/game/gen2/types.ts';
import type { LevelConfig } from '../../src/game/types.ts';
import { runTier, type Setting, type Tier, type TierRun } from './tierBots.ts';

/** the toys' pad rows (data, the toys' own: the 2-2 builder tunes World 2's W2_PADS, never these) */
export const TOY_PADS = {
  keep: { by: 'weight', pads: ['small', 'small', 'small', 'small'], gap: 70 },
  rise: { by: 'beat', pads: ['big', 'stone', 'big'], gap: 80, beat: { up: 1.8, shiver: 0.6, under: 0.6 } },
  breath: { by: 'beat', pads: ['small', 'small'], gap: 70, beat: { up: 1.8, shiver: 0.6, under: 0.6 } },
  /** a SPUR (FIX-22): two small beat pads (the breath's numbers) out to a dead-end stone; the way on is the vine up from the near bank and
   *  the rope over: he goes out on a breath, waits on the stone for the next and comes back on it. Splash-back, as 2-2's X is (a child's
   *  late start on deep water cost 2-4 lives in 2 of 4 runs: tier fumbles, FIX-22 REPORT) */
  spur: { by: 'beat', pads: ['small', 'small', 'stone'], gap: 50, beat: { up: 1.8, shiver: 0.6, under: 0.6 }, spur: true, safe: true },
} as const satisfies Record<string, PadRow>;
/** a spur toy's way up (px): the vine from the near bank to the rope's ledge, so the far bank stands SPUR_UP + PAD_LAY.drop over the stone */
export const SPUR_UP = 190;
const NEAR_W = 420, LEDGE_W = 200;
export type ToyPad = keyof typeof TOY_PADS;

const pond = (row: ToyPad): SectionTemplate => ({
  id: `toy-pads-${row}`, name: `a pond (${row})`, archetypes: 'any', phases: ['ki', 'sho', 'ten', 'ketsu'], difficulty: 2, maxPerStage: 1,
  pieces: row === 'spur' ? [
    { key: 'near', shape: 'bank', w: [NEAR_W, NEAR_W], place: { kind: 'start' }, main: true },
    { key: 'vine', shape: 'vine', w: [0, 0], place: { kind: 'climb', on: 'near', at: [(NEAR_W - LEDGE_W + 50) / NEAR_W, (NEAR_W - LEDGE_W + 50) / NEAR_W], h: [SPUR_UP, SPUR_UP] } },
    { key: 'ledge', shape: 'branch', w: [LEDGE_W, LEDGE_W], place: { kind: 'over', on: 'near', at: [(NEAR_W - LEDGE_W) / NEAR_W, (NEAR_W - LEDGE_W) / NEAR_W], dy: [-SPUR_UP, -SPUR_UP] }, main: true },
    { key: 'far', shape: 'bank', w: [420, 420], place: { kind: 'pads', after: 'near', row, rope: 'ledge' }, main: true, landing: true },
  ] : [
    { key: 'near', shape: 'bank', w: [340, 340], place: { kind: 'start' }, main: true },
    { key: 'far', shape: 'bank', w: [420, 420], place: { kind: 'pads', after: 'near', row }, main: true, landing: true },
  ],
  entry: { piece: 'near', kind: 'ground' }, exit: { piece: 'far', kind: 'ground' }, exitDy: row === 'spur' ? -SPUR_UP : 0, sockets: [], mirrorable: false,
});
export const kitFor = (row: ToyPad): WorldKit => ({
  ...toyKit,
  manifest: {
    ...toyKit.manifest, world: 2, pads: TOY_PADS, moves: [...toyKit.manifest.moves, 'climb'], creatures: [], props: [], pairs: [], tips: {},
    sections: [{ ...meadow, phases: ['start', 'rest', 'ki', 'sho', 'ten', 'ketsu', 'goal'], mirrorable: false, sockets: meadow.sockets.filter((k) => k.role !== 'prop') }, pond(row)],
  },
});
export const ID = '2-92';
export const cfg: LevelConfig = { ...toyCfg(ID, 'sprint'), unlocked: true };

/** the first seed whose roll lays the one pond and builds clean */
export function fixtureSeed(row: ToyPad): number {
  for (let seed = 1; seed <= 60; seed++) {
    const st = buildGen2Stage({ config: cfg, kit: kitFor(row), seed, difficulty: 'normal' });
    if (!st.gen2.errors?.length && st.platforms.some((p) => p.pad)) return seed;
  }
  throw new Error(`no roll of 1-60 lays the ${row} pond clean`);
}

/** a tier's run over a pond fixture, rolled the game's way (the listed row, the planted list, World 2's finish) */
export function padRun(row: ToyPad, tier: Tier, setting: Setting, seed: number, variant = 1): TierRun {
  const kit = kitFor(row);
  const st = buildGen2Stage({ config: cfg, kit, seed, difficulty: 'normal' });
  const dict: string[] = [];
  const packed = packPlan({ seed: st.gen2.seed, rerolls: st.gen2.rerolls, plan: st.gen2.plan, foes: [...keptFoes(st)] }, dict);
  return withTestStage({ [ID]: { kit: () => kit, world: (s, _sq, d) => w2Finish(s as never, d) as typeof s, seeds: [] } }, () => {
    const undo = plantSeedList(ID, { dict, seeds: [seed], plans: [packed] });
    try {
      return withFixtureConfig(cfg, () => runTier(tier, setting, variant, ID));
    } finally {
      undo();
    }
  });
}

/** the most lives a tier may lose at the pond (a first try that reads the pad wrong once, as a person does) */
const POND_LIVES = 1;
const atPond = (r: TierRun, row: ToyPad) => r.pieces.find((q) => q.id === `toy-pads-${row}`);
export const crossed = (r: TierRun, row: ToyPad) => r.end === 'shrine' && !!atPond(r, row) && atPond(r, row)!.lives <= POND_LIVES && !r.stuck.some((k) => k.piece === `toy-pads-${row}`) && (row !== 'spur' || r.spurs >= 1);
export const told = (r: TierRun, row: ToyPad) => `ended ${r.end}, at the pond ${JSON.stringify(atPond(r, row))} (at most ${POND_LIVES} lives)${row === 'spur' ? `, spur stones ${r.spurs}` : ''}, stuck ${JSON.stringify(r.stuck)}`;
/** the fixture's stage as built (Normal) */
export const padStage = (row: ToyPad, seed: number): Gen2Stage => buildGen2Stage({ config: cfg, kit: kitFor(row), seed, difficulty: 'normal' });
