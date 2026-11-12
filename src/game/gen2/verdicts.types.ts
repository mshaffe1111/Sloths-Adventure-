/**
 * The roll verdict schema (R-165.61; reference/architecture/ADR-001-verdicts.md) and the fixed first run of 1-1 (ADR-002).
 * TYPES ONLY: no function bodies, no constants. The flown numbers live in the Designer's reference/specs/reach.md and bands.md; the
 * Engine packet that implements this enters them as data in src/game/gen2/reach.ts (new), never here.
 *
 * The rule this file serves: a roll is accepted only by a named, testable verdict, and every fall the player can meet says in the schema
 * what it ends in and how it looks. Nothing is inferred from the absence of an error string.
 */
import type { Difficulty } from '../difficulty.ts';
import type { PlanSlot } from './types.ts';

// ───────────────────────── reach: the flown arcs (reach.md §2) ─────────────────────────

/** a move as the player really makes it (reach.md §1: hold, flick, the Pad's tap). The builder judges with the flick, never the hold */
export type ReachMove = 'single-flick' | 'single-hold' | 'single-tap' | 'double-flick' | 'double-hold' | 'double-tap-tap' | 'bounce' | 'bounce-air';

/** where a flown row holds (reach.md scope): 1-1 on Normal, any stage on Easy; Normal from stage 25 was not flown and has no row */
export type ReachScope = 'normal-1-1' | 'easy-any';

/** one row of reach.md §2, per setting: every figure flown, px. A stage outside every scope has no arc and its roll fails `reach.unflown` */
export interface FlownArc {
  move: ReachMove;
  scope: ReachScope;
  /** the highest top he ends standing on, a block (50 px or taller) and a thin piece */
  climb: { block: number; thin: number };
  /** the widest level gap lip to lip: from 70 px before the lip, from the last ground frame, any timing (coyote and late press) */
  gap: { from70: number; lastGround: number; any: number };
  /** the reach.md row this came from, e.g. "§2 Double, flick" (the Critic diffs the data file against reach.md by this) */
  source: string;
}

/** the band a section kind may ask for (bands.md §2), per setting; `none` where the setting has no such section (Easy's double gap) */
export type Band = { lo: number; hi: number } | 'none';
/** `chain-hop` (chain.md §3): one mushroom cap to the next, its figure S, cap centre to cap centre; its band goes by the step between the
 *  two caps (reach.ts CHAIN_BANDS), the same on both settings */
export type SectionKind = 'single-gap' | 'single-rise' | 'double-teach-rise' | 'double-teach-rise-thin' | 'double-test-gap' | 'bounce-teach' | 'bounce-air-test' | 'chain-hop';
export type BandTable = Readonly<Record<SectionKind, Readonly<Record<Difficulty, Band>>>>;

// ───────────────────────── drops: what every fall ends in, and how it looks ─────────────────────────

/** what a stage promises about falls (its brief): `no-lethal` is 1-1 on both settings (R-165.53; A1's GraphBrief.softFalls = true) */
export type FallPolicy = 'no-lethal' | 'land-soft' | 'per-gap';

/** a fall that costs nothing: set back (on the take-off, or the last still ground), ground below to walk on, or a climb out */
export type SoftEnd = { kind: 'putback'; to: 'take-off' | 'last-still-ground' } | { kind: 'floor'; y: number } | { kind: 'climb-out'; y: number };
/** a fall that costs a life */
export type LethalEnd = { kind: 'life'; cause: 'water' | 'void' };

/** a fall that costs a HEART (a hurt floor, WorldManifest.hurtFloor; World 8's heart falls end this way in play too): set back on the
 *  take-off, hurt; his last heart is a life. Easy waives the heart (the zone is `soft`), never the look */
export type HeartEnd = { kind: 'heart'; to: 'take-off' };

/** how the bottom of a drop is DRAWN. A soft look and a lethal look never overlap: that is the testers' finding (the deadly drop is
 *  painted like the safe floor), made unrepresentable in the type and checked on the built stage by `drop.look-lies` */
export type SoftLook = 'ground' | 'pit-floor-art';
export type LethalLook = 'water-art' | 'void-dark';
/** a hurt floor's own look: the painted family the world's manifest names (`hurtFloor.art`). Never a soft look, never a lethal one */
export type HurtLook = 'hurt-art';

/** a lethal drop carries its warning: Dot's line before it and the sign at its lip (WATER_WARN); neither may be absent */
export interface Warning { dotLine: string; leadPx: number; sign: true }

/** one drop on the route, per setting (the same gap may be soft on Easy and lethal on Normal elsewhere; never in 1-1) */
export type Drop =
  | { x0: number; x1: number; lipY: number; ends: SoftEnd; look: SoftLook }
  | { x0: number; x1: number; lipY: number; ends: LethalEnd; look: LethalLook; warn: Warning }
  | { x0: number; x1: number; lipY: number; ends: HeartEnd; look: HurtLook };
export type SoftDrop = Extract<Drop, { ends: SoftEnd }>;
export type LethalDrop = Extract<Drop, { ends: LethalEnd }>;
export type HeartDrop = Extract<Drop, { ends: HeartEnd }>;

/** a stage's drops under its policy: a `no-lethal` stage's list holds soft drops only, so a builder that types its output can't
 *  hand back a lethal one; the run-time verdict `drop.lethal-in-no-lethal` is still judged on the built stage (the type is the
 *  contract, the verdict is the proof) */
export type StageDrops<P extends FallPolicy> = P extends 'no-lethal' ? readonly SoftDrop[] : readonly Drop[];

// ───────────────────────── verdicts ─────────────────────────

/** every reason a roll fails, by name. A new check adds a name here first; a string not in this union can't be a verdict */
export type VerdictName =
  // reach (setting-aware arcs, reach.md / bands.md)
  | 'reach.unflown' //            the stage's setting and place have no flown arc (Normal past 1-1 until flown)
  | 'arc.single-gap-over' //      a single-jump gap over the band (flick from 70 px Easy, 55 px Normal)
  | 'arc.single-rise-over' //     a single-jump rise over the band
  | 'block.lesser-passes' //      a teach or test the lesser move clears (one jump climbs the "double" rise; a plain double clears the bounce)
  | 'block.taught-fails' //       the taught move does not clear its own teach on every try
  | 'block.spare-thin' //         lesser move fails, but with under 5 px spare (25 fps loses ~3 px of apex)
  | 'band.out' //                 a section asks for a figure outside its kind's band on this setting, or for a band that is `none`
  // headroom
  | 'headroom.cuts-arc' //        a piece above the take-off or the flight path is lower than the arc the section needs
  // floors and drops
  | 'floor.unmarked' //           a gap World 1 reads as a pit with nothing drawn under it and no soft zone (promises11 floorlessGaps)
  | 'drop.lethal-in-no-lethal' // any lethal drop on a `no-lethal` stage (1-1 on either setting): the roll fails by this name
  | 'drop.unwarned' //            a lethal drop without Dot's line and the sign
  | 'drop.look-lies' //           a drop drawn with another kind's look (lethal painted as ground, soft painted as water, a hurt floor as either)
  | 'drop.untyped' //             a gap on the route the builder laid with no Drop record (every fall must be stated, never inferred)
  | 'hazard.untaught' //          a hurt drop before the end of its lesson's showing piece, or within the row's clearStart of the spawn
  // the lessons (promises11)
  | 'teach.double-no-gap-after' // no gap only the double crosses after the double's teach (Normal only; Easy has no double gap)
  | 'teach.double-gap-unsafe' //  that gap has nothing under it
  // the pieces where they are laid (landings.ts: R-165.124, R-165.126)
  | 'landing.dead-zone' //        a pickup's piece or a laid landing no plain flight reaches (walk-off, full jump, bounce, with margin, the arc uncut)
  | 'bounce.no-purpose' //        a mushroom whose bounce lands nowhere worth going (no higher road, no find, no mushroom that has one)
  // the first run (ADR-002)
  | 'first-run.drift'; //         the fixed first layout no longer builds identically to its recorded parts

/** a check's measured figure against its limit (px); `spare` = limit - measured for an upper bound, measured - limit for a lower */
export interface Measure { measured: number; limit: number; spare: number; source: string }

export interface Verdict {
  name: VerdictName;
  setting: Difficulty;
  /** where on the route (x0..x1) and the section uid when one owns it */
  at: { x0: number; x1: number; section?: string };
  measure?: Measure;
  /** one plain line for the report, e.g. "one flick climbs the 'double' rise at x 4120: 126 px, block 123" */
  line: string;
}

type NonEmpty<T> = readonly [T, ...T[]];
/** a roll's outcome: accepted carries no failed verdict; refused carries at least one. There is no third state ("accepted with warnings").
 *  `notJudged`: the checks that did not run because the stage is outside their scope (Normal past 1-1 has no flown reach: `reach.unflown`
 *  and the arc and block names), stated so an unjudged roll is never mistaken for a judged one (ADR-001 decision 3). Empty inside scope */
export type RollVerdict =
  | { accepted: true; setting: Difficulty; notJudged: readonly VerdictName[] }
  | { accepted: false; setting: Difficulty; failed: NonEmpty<Verdict>; notJudged: readonly VerdictName[] };

/** what the checks read off a built stage, per setting: the policy from the brief, every drop stated, the sections' asked figures */
export interface JudgedStage<P extends FallPolicy = FallPolicy> {
  stageId: string;
  setting: Difficulty;
  policy: P;
  drops: StageDrops<P>;
  /** each section that asks for a reach figure: its kind, the figure laid, the move it is built for, and the clear height above it */
  /** `step` (a chain hop): the next cap's height over this one, px up (negative: down) */
  asks: ReadonlyArray<{ section: string; kind: SectionKind; x0: number; x1: number; figure: number; move: ReachMove; headroom: number; step?: number }>;
}

/**
 * ONE definition of a player promise, read by BOTH the test (promises11.ts and its tests) and the list builder (seedList.ts
 * seedListBreaches): the archetype card's "a new promise lives in two places" trap, closed. `settings` says where it is judged;
 * seedListBreaches stops filtering by substring (`b.includes('double')`), and reads `settings` instead.
 */
export interface PromiseDef {
  id: VerdictName;
  stages: readonly string[] | 'all';
  settings: readonly Difficulty[];
  judge: (st: JudgedStage) => readonly Verdict[];
}
export type PromiseRegistry = readonly PromiseDef[];

// ───────────────────────── the fixed first run of 1-1 (ADR-002) ─────────────────────────

/** the one layout every player meets on the first-ever 1-1 run (R-165.52), as the seed list stores a proven plan, plus the lock that
 *  proves it unchanged: its stage parts' hash (seedList.ts stageParts) per setting */
export interface FirstRunLayout {
  stageId: '1-1';
  seed: number;
  plan: PlanSlot[];
  rerolls: number;
  foes?: Array<[string, string]>;
  lock: Readonly<Record<Difficulty, string>>;
}

/** which layout a 1-1 run plays: the first run until the save records a finish of 1-1 on any setting; then a roll from the proven
 *  list in its shuffled order (testlink1_1.ts). The fixed seed is never drawn as a replay's first roll (no "first run again" by chance) */
export type RunPick = { kind: 'first'; layout: FirstRunLayout } | { kind: 'replay'; seed: number; orderIndex: number };

/** the save's one fact for this (saveFile.ts): absent on an old save that has finished 1-1 means `finished` is read from its progress */
export interface FirstRunSave { oneOneFinished: boolean }
