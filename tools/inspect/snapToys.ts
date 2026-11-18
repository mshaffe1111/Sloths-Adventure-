/**
 * The snap stone toys' fixtures (ENG-25; 2-5.md NEW 1; level.md rules 21 and 23, toys before the level): a pond of SNAP STONES over deep
 * water on the toy kit, rolled by gen2 the way the game rolls a listed stage (listed.ts withTestStage, a planted one-seed list, World 2's
 * finish; padToys.ts's pattern), and a tier bot's run over it with every hit and life it took (snapRide.test.ts runs them).
 */
import '../../src/game/headlessDom.ts';
import { withTestStage } from '../../src/game/gen2/listed.ts';
import { buildGen2Stage, keptFoes } from '../../src/game/gen2/pipeline.ts';
import { packPlan, plantSeedList } from '../../src/game/gen2/seedList.ts';
import type { PadRow } from '../../src/game/gen2/rideLay.ts';
import { withFixtureConfig } from '../../src/game/realPlay.ts';
import { setDifficulty } from '../../src/game/difficulty.ts';
import { cfg as toyCfg, kit as toyKit, meadow } from '../../src/game/gen2/toyWorld.ts';
import { w2Finish } from '../../src/game/gen2/worlds/w2.ts';
import type { Gen2Stage, SectionTemplate, WorldKit } from '../../src/game/gen2/types.ts';
import type { ClockDef } from '../../src/game/stageKit.types.ts';
import type { LevelConfig } from '../../src/game/types.ts';
import { firstTimer, type FTRun } from './firsttimer.ts';
import { BOTS, type Setting, type Tier } from './tierBots.ts';

/** the toys' snap rows (the toys' own data: 2-5's builder lays World 2's): 2-5.md's practice row (3 in step at count 0.75) and its wave
 *  (3, each a count later: Easy's twist and the head of Normal's), both over deep water, 40 px of water each side (a tap hop) */
export const TOY_SNAPS = {
  step: { by: 'snap', pads: ['snap', 'snap', 'snap'], gap: 40, snap: { count: 0.75 } },
  wave: { by: 'snap', pads: ['snap', 'snap', 'snap'], gap: 40, snap: { count: 0.75, wave: true } },
} as const satisfies Record<string, PadRow>;
export type ToySnap = keyof typeof TOY_SNAPS;

const pond = (row: ToySnap): SectionTemplate => ({
  id: `toy-snap-${row}`, name: `snap stones (${row})`, archetypes: 'any', phases: ['ki', 'sho', 'ten', 'ketsu'], difficulty: 2, maxPerStage: 1,
  pieces: [
    { key: 'near', shape: 'bank', w: [340, 340], place: { kind: 'start' }, main: true },
    { key: 'far', shape: 'bank', w: [420, 420], place: { kind: 'pads', after: 'near', row }, main: true, landing: true },
  ],
  entry: { piece: 'near', kind: 'ground' }, exit: { piece: 'far', kind: 'ground' }, exitDy: 0, sockets: [], mirrorable: false,
});
export const kitFor = (row: ToySnap, pads: Record<string, PadRow> = TOY_SNAPS): WorldKit => ({
  ...toyKit,
  manifest: {
    ...toyKit.manifest, world: 2, pads, creatures: [], props: [], pairs: [], tips: {},
    sections: [{ ...meadow, phases: ['start', 'rest', 'ki', 'sho', 'ten', 'ketsu', 'goal'], mirrorable: false, sockets: meadow.sockets.filter((k) => k.role !== 'prop') }, pond(row)],
  },
});
export const ID = '2-94';
export const cfg: LevelConfig = { ...toyCfg(ID, 'sprint'), unlocked: true };

/** the first seed whose roll lays the one pond and builds clean */
export function fixtureSeed(row: ToySnap): number {
  for (let seed = 1; seed <= 60; seed++) {
    const st = buildGen2Stage({ config: cfg, kit: kitFor(row), seed, difficulty: 'normal' });
    if (!st.gen2.errors?.length && st.platforms.some((p) => p.pad?.on === 'bites')) return seed;
  }
  throw new Error(`no roll of 1-60 lays the ${row} snap pond clean`);
}
/** the fixture's stage as built */
export const snapStage = (row: ToySnap, seed: number, s: Setting = 'normal', pads?: Record<string, PadRow>): Gen2Stage =>
  buildGen2Stage({ config: cfg, kit: kitFor(row, pads), seed, difficulty: s });

/** a tier's run over a snap fixture, rolled the game's way; `clocks` swaps the built stage's clocks (a plant: a bar with no creak) */
export function snapRun(row: ToySnap, tier: Tier, setting: Setting, seed: number, variant = 1): FTRun {
  const kit = kitFor(row);
  const st = buildGen2Stage({ config: cfg, kit, seed, difficulty: 'normal' });
  const dict: string[] = [];
  const packed = packPlan({ seed: st.gen2.seed, rerolls: st.gen2.rerolls, plan: st.gen2.plan, foes: [...keptFoes(st)] }, dict);
  const who = BOTS[tier][setting]!;
  return withTestStage({ [ID]: { kit: () => kit, world: (s, _sq, d) => w2Finish(s as never, d) as typeof s, seeds: [] } }, () => {
    const undo = plantSeedList(ID, { dict, seeds: [seed], plans: [packed] });
    try {
      setDifficulty(setting);
      return withFixtureConfig(cfg, () => firstTimer(ID, variant, who, { cap: 600 }));
    } finally {
      undo();
    }
  });
}

/** the pond's span on a built stage (its still water) */
export function pondOf(st: Gen2Stage): { x0: number; x1: number } {
  const r = (st.rivers ?? []).find((z) => z.speed === 0 && st.platforms.some((p) => p.pad?.on === 'bites' && p.x > z.x0 && p.x < z.x1));
  if (!r) throw new Error('no snap pond on the fixture');
  return { x0: r.x0, x1: r.x1 };
}
/** the hits (bites) and lives a run took at the pond, and whether it reached the shrine */
export function atPond(r: FTRun, pond: { x0: number; x1: number }) {
  const inPond = (x: number) => x > pond.x0 - 10 && x < pond.x1 + 10;
  return { shrine: r.end === 'shrine', bites: r.harms.filter((h) => h.kind === 'hit' && inPond(h.x)).length, lives: r.harms.filter((h) => h.kind === 'life' && inPond(h.x)).length, end: r.end };
}
/** a bar with no creak: the bite comes straight out of the quiet (the plant for "a stone that bites without its tell") */
export const noTell = (d: ClockDef): ClockDef => ({ ...d, phases: [{ name: 'off', seconds: d.phases.filter((p) => p.name !== 'on').reduce((s, p) => s + p.seconds, 0) }, ...d.phases.filter((p) => p.name === 'on')] as ClockDef['phases'] });
