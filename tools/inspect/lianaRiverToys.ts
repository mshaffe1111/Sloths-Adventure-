/**
 * The liana-over-a-river toys' fixtures (ENG-24; reference/design/2-4.md NEW 1-2; lianaRiver.test.ts and lianaRide.test.ts run them): ONE
 * section on the toy kit with World 2's river table and the swing move: a bank, a liana hung from a riverside tree over a log river, the
 * far bank. The river is laid by place `river` AFTER THE LIANA (its landing is the river's logs), rolled by gen2 the way the game rolls a
 * listed stage (listed.ts withTestStage, a planted one-seed list, World 2's finish), and a tier bot's run over it.
 *   - 'drop': the liana in reach of the bank (2-1's measured liana: 165 px out, 410 over the bank, 410 long), over `long` (2-4 beat 1):
 *     he catches it off the bank and lets go onto a passing log;
 *   - 'catch': the liana out of every bank's reach (430 px out, 320 long: its foot ~118 px over a log) over `twin` (beat 4, "up from
 *     the log"): he boards a log at the bank, rides it under the liana and jumps up to it, then lets go onto the far bank or a log.
 * The rows are World 2's own (w2.ts W2_RIVERS) or the design's flown ones (`gap280`: beat 8's widest), the river laid DEEP (a fall costs
 * a life, so a let-go into the water shows in the count).
 */
import '../../src/game/headlessDom.ts';
import { withTestStage } from '../../src/game/gen2/listed.ts';
import { buildGen2Stage, keptFoes } from '../../src/game/gen2/pipeline.ts';
import { packPlan, plantSeedList } from '../../src/game/gen2/seedList.ts';
import type { RiverRow } from '../../src/game/gen2/riverLay.ts';
import { withFixtureConfig } from '../../src/game/realPlay.ts';
import { cfg as toyCfg, kit as toyKit, meadow } from '../../src/game/gen2/toyWorld.ts';
import { w2Finish, W2_RIVERS } from '../../src/game/gen2/worlds/w2.ts';
import { withSwing } from '../../src/game/gen2/worlds/w1Swing.ts';
import type { Gen2Stage, SectionPiece, SectionTemplate, WorldKit } from '../../src/game/gen2/types.ts';
import type { LevelConfig } from '../../src/game/types.ts';
import { runTier, type Setting, type Tier, type TierOpts, type TierRun } from './tierBots.ts';

/** the toys' rows: World 2's and the design's flown ones (2-4.md "The two clocks, FLOWN"); `sparse` is no row of the design: logs 400 px
 *  apart, the drop judge's planted refusal */
export const TOY_RIVERS = {
  ...W2_RIVERS,
  gap280: { dir: 1, speed: 110, logW: 150, logs: 2, gap: 280 },
  sparse: { dir: 1, speed: 110, logW: 150, logs: 2, gap: 400 },
  /** a river of rafts (RiverRow.look 'raft', R-165.288; ENG-24c): 2-4's last row's shape (the slow row to the jetty, w2Arc24.ts slow24),
   *  its carriers drawn as World 2's painted raft */
  raft: { dir: 1, speed: 70, logW: 200, logs: 2, look: 'raft' },
} as const satisfies Record<string, RiverRow>;
export type ToyRiver = keyof typeof TOY_RIVERS;
export type LianaToy = 'drop' | 'catch';
/** how far past the bank's end the liana hangs (px): 2-1's measured 165 (the bank's catch), or out of every bank's reach (from a log) */
export const TOY_REACH: Record<LianaToy, number> = { drop: 165, catch: 430 };
/** its length (px): 2-1's 410 (its foot at the bank's top), or 320 for the catch, its foot ~118 px over a log's top: a jump catches it,
 *  never a ride under it (at 410 the engine took him onto it as the log carried him through its foot, so no jump was asked) */
export const TOY_LEN: Record<LianaToy, number> = { drop: 410, catch: 320 };

const section = (toy: LianaToy, row: ToyRiver, easyRow: ToyRiver): SectionTemplate => {
  const body = (r: ToyRiver): SectionPiece[] => [
    { key: 'liana', shape: 'liana', w: [0, 0], place: { kind: 'swing', after: 'near', top: [410, 410], reach: [TOY_REACH[toy], TOY_REACH[toy]], len: [TOY_LEN[toy], TOY_LEN[toy]] } },
    { key: 'far', shape: 'bank', w: [420, 420], place: { kind: 'river', after: 'liana', row: r }, main: true, landing: true },
  ];
  // (Easy lays its own row, a version's twin, as 2-1's bricks do: gen2 lays Easy from Normal's plan)
  return {
    id: `toy-liana-${toy}`, name: `a liana over a river (${toy}, ${row} / Easy ${easyRow})`, archetypes: 'any', phases: ['ki', 'sho', 'ten', 'ketsu'], difficulty: 2, maxPerStage: 1,
    pieces: [{ key: 'near', shape: 'bank', w: [340, 340], place: { kind: 'start' }, main: true }],
    subBlocks: [{ id: 'body', versions: [{ id: 'n', pieces: body(row), ...(easyRow !== row ? { easy: 'e' } : {}) }, ...(easyRow !== row ? [{ id: 'e', pieces: body(easyRow), easyOnly: true }] : [])] }],
    entry: { piece: 'near', kind: 'ground' }, exit: { piece: 'far', kind: 'ground' }, exitDy: 0, sockets: [], mirrorable: false,
  };
};
export const kitFor = (toy: LianaToy, row: ToyRiver, easyRow: ToyRiver = row): WorldKit => withSwing({
  ...toyKit,
  manifest: {
    ...toyKit.manifest, world: 2, rivers: TOY_RIVERS, creatures: [], props: [], pairs: [], tips: {},
    sections: [{ ...meadow, phases: ['start', 'rest', 'ki', 'sho', 'ten', 'ketsu', 'goal'], mirrorable: false, sockets: meadow.sockets.filter((k) => k.role !== 'prop') }, section(toy, row, easyRow)],
  },
});
export const ID = '2-94';
export const cfg: LevelConfig = { ...toyCfg(ID, 'sprint'), unlocked: true };

/** the toy's stage as built */
export const toyStage = (toy: LianaToy, row: ToyRiver, seed: number, difficulty: 'normal' | 'easy' = 'normal', easyRow: ToyRiver = row): Gen2Stage =>
  buildGen2Stage({ config: cfg, kit: kitFor(toy, row, easyRow), seed, difficulty });

/** the first seed of 1-60 whose roll lays the one liana river and builds clean on these settings (both by default; or null: none does) */
export function fixtureSeed(toy: LianaToy, row: ToyRiver, settings: ReadonlyArray<'normal' | 'easy'> = ['normal', 'easy'], easyRow: ToyRiver = row): number | null {
  for (let seed = 1; seed <= 60; seed++) {
    const ok = settings.every((d) => {
      const st = toyStage(toy, row, seed, d, easyRow);
      return !st.gen2.errors?.length && (st.rivers ?? []).filter((r) => r.speed > 0).length === 1 && st.vines.some((v) => v.vineType === 'swing_liana');
    });
    if (ok) return seed;
  }
  return null;
}

/** a tier's run over the toy, rolled the game's way (the listed row, the planted list, World 2's finish) */
export function lianaRun(toy: LianaToy, row: ToyRiver, tier: Tier, setting: Setting, seed: number, variant = 1, easyRow: ToyRiver = row, opts: TierOpts = {}): TierRun {
  const kit = kitFor(toy, row, easyRow);
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
