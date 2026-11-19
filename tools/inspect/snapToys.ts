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
import { w2CastSpawn, w2Snappers } from '../../src/game/gen2/worlds/w2Cast.ts';
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
/** the meter's copy of the snap toys (snapChannel.test.ts): a toy id among World 2's first stages, so the level check grants him only what
 *  he has there (levelCheck.ts skillGuaranteedAt reads the stage's place: on 2-94, the 104th stage, the leaf glide is his and the meter's
 *  route glided over the whole pond, pricing no stone; 2-5 is the 15th) */
export const METER_ID = '2-19';
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

/** play `f` on a snap fixture, rolled the game's way (a planted one-seed list) on `setting` (the meter scores it here: snapChannel.test.ts) */
export function onSnapToy<T>(row: ToySnap, seed: number, setting: Setting, f: () => T, pads: Record<string, PadRow> = TOY_SNAPS, id = ID): T {
  const kit = kitFor(row, pads);
  const c: LevelConfig = id === ID ? cfg : { ...toyCfg(id, 'sprint'), unlocked: true };
  const st = buildGen2Stage({ config: c, kit, seed, difficulty: 'normal' });
  const dict: string[] = [];
  const packed = packPlan({ seed: st.gen2.seed, rerolls: st.gen2.rerolls, plan: st.gen2.plan, foes: [...keptFoes(st)] }, dict);
  return withTestStage({ [id]: { kit: () => kit, world: (s, _sq, d) => w2Finish(s as never, d) as typeof s, seeds: [] } }, () => {
    const undo = plantSeedList(id, { dict, seeds: [seed], plans: [packed] });
    try {
      setDifficulty(setting);
      return withFixtureConfig(c, f);
    } finally {
      undo();
    }
  });
}
/** a tier's run over a snap fixture, rolled the game's way */
export const snapRun = (row: ToySnap, tier: Tier, setting: Setting, seed: number, variant = 1): FTRun =>
  onSnapToy(row, seed, setting, () => firstTimer(ID, variant, BOTS[tier][setting]!, { cap: 600 }));

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

// ───────────────────────────── the snapper (ENG-25b; 2-5.md NEW 2: BONK-AFTER-THE-SNAP) ─────────────────────────────

/** which of World 2's snapper rows (gen2/worlds/w2Cast.ts w2Snappers): the awake one on its stones' bar, or the sleeper a lesson starts with */
export type ToySnapper = 'snapper' | 'snapper-asleep';
/** ENG-25's snapper row (src/game/gen2/w2Cast.test.ts, the same section): the practice snap row, then a snapper on the far bank's socket,
 *  laid by gen2 on the stones' clock (`snap-step`) and joined to the cast by World 2's spawn (w2CastSpawn) */
const bank = (): SectionTemplate => ({
  id: 'toy-snapper', name: 'a snapper by the stones', archetypes: 'any', phases: ['ki', 'sho', 'ten', 'ketsu'], difficulty: 2, maxPerStage: 1,
  pieces: [
    { key: 'near', shape: 'bank', w: [340, 340], place: { kind: 'start' }, main: true },
    { key: 'far', shape: 'bank', w: [520, 520], place: { kind: 'pads', after: 'near', row: 'step' }, main: true, landing: true },
  ],
  sockets: [{ id: 'snapper', role: 'enemy', on: 'far', t: [0.55, 0.55], maxThreat: 3, chance: 1 }],
  entry: { piece: 'near', kind: 'ground' }, exit: { piece: 'far', kind: 'ground' }, exitDy: 0, mirrorable: false,
});
export const snapperKit = (which: ToySnapper): WorldKit => ({
  ...toyKit,
  spawn: w2CastSpawn,
  manifest: {
    ...toyKit.manifest, world: 2, pads: { step: TOY_SNAPS.step }, creatures: w2Snappers('snap-step').filter((c) => c.id === which), props: [], pairs: [], tips: {},
    sections: [{ ...meadow, phases: ['start', 'rest', 'ki', 'sho', 'ten', 'ketsu', 'goal'], mirrorable: false, sockets: meadow.sockets.filter((k) => k.role !== 'prop' && k.role !== 'enemy') }, bank()],
  },
});
export const SNAPPER_ID = '2-89';
export const snapperCfg: LevelConfig = { ...toyCfg(SNAPPER_ID, 'sprint'), unlocked: true };

/** the first seed whose roll lays the snapper (one, on its clock) and builds clean */
export function snapperSeed(which: ToySnapper): number {
  for (let seed = 1; seed <= 40; seed++) {
    const st = buildGen2Stage({ config: snapperCfg, kit: snapperKit(which), seed, difficulty: 'normal' });
    if (!st.gen2.errors?.length && st.enemies.filter((e) => e.type === 'turtle' && e.kitBeat).length === 1) return seed;
  }
  throw new Error(`no roll of 1-40 lays the ${which} clean`);
}
export const snapperStage = (which: ToySnapper, seed: number, s: Setting = 'normal'): Gen2Stage =>
  buildGen2Stage({ config: snapperCfg, kit: snapperKit(which), seed, difficulty: s });

/** play `f` on the snapper fixture, rolled the game's way (a planted one-seed list) on `setting` */
export function onSnapper<T>(which: ToySnapper, seed: number, setting: Setting, f: () => T): T {
  const kit = snapperKit(which);
  const st = buildGen2Stage({ config: snapperCfg, kit, seed, difficulty: 'normal' });
  const dict: string[] = [];
  const packed = packPlan({ seed: st.gen2.seed, rerolls: st.gen2.rerolls, plan: st.gen2.plan, foes: [...keptFoes(st)] }, dict);
  return withTestStage({ [SNAPPER_ID]: { kit: () => kit, world: (s, _sq, d) => w2Finish(s as never, d) as typeof s, seeds: [] } }, () => {
    const undo = plantSeedList(SNAPPER_ID, { dict, seeds: [seed], plans: [packed] });
    try {
      setDifficulty(setting);
      return withFixtureConfig(snapperCfg, f);
    } finally {
      undo();
    }
  });
}
/** a tier's run over the snapper fixture */
export const snapperRun = (which: ToySnapper, tier: Tier, setting: Setting, seed: number, variant = 1): FTRun =>
  onSnapper(which, seed, setting, () => firstTimer(SNAPPER_ID, variant, BOTS[tier][setting]!, { cap: 600 }));

/** what a run did with the snapper: how it was cleared (the kit's way), the hits it took within its reach, and how the run ended */
export function atSnapper(r: FTRun, st: Gen2Stage) {
  const m = st.enemies.find((e) => e.type === 'turtle')!;
  const near = (x: number) => Math.abs(x - m.x) < 160;
  return {
    end: r.end, shrine: r.end === 'shrine', cleared: r.cast?.cleared ?? {}, left: r.cast?.left ?? -1,
    hits: r.harms.filter((h) => h.kind === 'hit' && near(h.x)).length, lives: r.harms.filter((h) => h.kind === 'life' && near(h.x)).length,
    causes: r.harms.filter((h) => near(h.x)).map((h) => `${h.kind}:${h.cause}@${Math.round(h.x)}`),
  };
}
