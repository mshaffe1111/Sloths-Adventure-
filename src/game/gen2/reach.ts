/**
 * The flown reach and the section bands (R-165.61, ADR-001 decision 3), entered as data from the Designer's specs at
 * t-designer-reach@030a4093: reference/specs/reach.md §2 (the arcs, flown on the real engine at 30 fps) and reference/specs/bands.md
 * §1-§2 (the bands a section may ask for). Every row names its `source` line so the Critic can diff this file against the specs.
 *
 * SCOPE (THE BOUNDARY, packet E0a): these figures gate the stages of the JUDGED table only (`judgedOnArcs`). Every other stage (5-7, 5-9, Worlds 6-8, the old
 * generator) keeps physics.ts's closed-form figures exactly as before and carries the verdicts as `notJudged`.
 */
import type { Difficulty } from '../difficulty.ts';
import type { Band, BandTable, FlownArc, ReachMove, ReachScope, SectionKind } from './verdicts.types.ts';

// ───────────────────────── reach.md §2: the flown arcs, per scope ─────────────────────────

const row = (move: ReachMove, climb: [number, number], n: [number, number, number], e: [number, number, number], source: string): FlownArc[] => [
  { move, scope: 'normal-1-1', climb: { block: climb[0], thin: climb[1] }, gap: { from70: n[0], lastGround: n[1], any: n[2] }, source },
  { move, scope: 'easy-any', climb: { block: climb[0], thin: climb[1] }, gap: { from70: e[0], lastGround: e[1], any: e[2] }, source },
];

/** every row of reach.md §2 ("Normal 1-1 and Easy are the same unless two figures are given") */
export const FLOWN_ARCS: readonly FlownArc[] = [
  // (N any 246, not the table's 244: the same row's "the Critic's finer flight found 246 on Normal too: design to 246")
  ...row('single-hold', [123, 117], [137, 223, 246], [141, 227, 246], 'reach.md §2 "Single, hold" (N any: "design to 246")'),
  ...row('single-flick', [123, 117], [128, 213, 239], [132, 217, 243], 'reach.md §2 "Single, flick"'),
  ...row('single-tap', [87, 81], [77, 163, 184], [77, 163, 184], 'reach.md §2 "Single, Pad tap" (one figure: the same on Easy)'),
  ...row('double-hold', [214, 208], [292, 379, 409], [296, 383, 411], 'reach.md §2 "Double, hold"'),
  ...row('double-flick', [212, 206], [283, 370, 396], [287, 374, 400], 'reach.md §2 "Double, flick"'),
  ...row('double-tap-tap', [150, 144], [191, 278, 299], [195, 282, 299], 'reach.md §2 "Double, Pad tap,tap"'),
  // (the bounce's gap is one figure, mushroom at the lip, for every take-off column)
  ...row('bounce', [223, 217], [179, 179, 179], [183, 183, 183], 'reach.md §2 "Bounce (floor mushroom, cap 30 px up)"'),
  ...row('bounce-air', [317, 309], [340, 340, 340], [340, 340, 340], 'reach.md §2 "Bounce + air jump"'),
];

/** the apex of his feet over the floor (reach.md §2's first column), for the headroom a move needs */
export const APEX: Readonly<Record<ReachMove, { px: number; source: string }>> = {
  'single-hold': { px: 97.8, source: 'reach.md §2 "Single, hold" apex' },
  'single-flick': { px: 97.2, source: 'reach.md §2 "Single, flick" apex' },
  'single-tap': { px: 61.7, source: 'reach.md §2 "Single, Pad tap" apex' },
  'double-hold': { px: 189.0, source: 'reach.md §2 "Double, hold" apex' },
  'double-flick': { px: 187.0, source: 'reach.md §2 "Double, flick" apex' },
  'double-tap-tap': { px: 124.4, source: 'reach.md §2 "Double, Pad tap,tap" apex' },
  bounce: { px: 197.6, source: 'reach.md §2 "Bounce" apex over the floor' },
  'bounce-air': { px: 289.1, source: 'reach.md §2 "Bounce + air jump" apex over the floor' },
};

/** his standing height, the body the headroom must hold over the apex of his feet (engine.ts:957, the player's `height: 48`) */
export const BODY_H = { px: 48, source: 'engine.ts:957 player height' } as const;
/** a floor mushroom's cap over the floor it stands on (reach.md §2 "Bounce (floor mushroom, cap 30 px up)") */
export const CAP_UP = { px: 30, source: 'reach.md §2 "Bounce (floor mushroom, cap 30 px up)"' } as const;
/** a block is a solid piece this tall or taller; under it, thin (reach.md §1 "block" / "thin") */
export const BLOCK_H = { px: 50, source: 'reach.md §1 "block: a solid piece 50 px or taller"' } as const;

// ───────────────────────── bands.md §1-§2 ─────────────────────────

/** the spare a block keeps over the lesser move (bands.md §1: "at least 5 px to spare"; 25 fps loses about 3 px of apex) */
export const SPARE = { px: 5, source: 'bands.md §1 "A block ... at least 5 px to spare"' } as const;
/** how far before the lip a single-jump section's flick takes off (bands.md §1: 70 px Easy, 55 px Normal) */
export const TAKEOFF = { easy: 70, normal: 55, source: 'bands.md §1 "A single-jump section"' } as const;

const b = (lo: number, hi: number): Band => ({ lo, hi });
/** bands.md §2, every row: what a section of each kind may ask for, per setting ('none': the setting has no such section) */
export const BANDS: BandTable = {
  'single-gap': { easy: b(0, 114), normal: b(0, 143) },
  'single-rise': { easy: b(0, 63), normal: b(0, 80) },
  'double-teach-rise': { easy: b(128, 132), normal: b(136, 140) },
  'double-teach-rise-thin': { easy: b(122, 128), normal: b(128, 134) },
  'double-test-gap': { easy: 'none', normal: b(252, 262) },
  'bounce-teach': { easy: b(232, 246), normal: b(232, 246) },
  'bounce-air-test': { easy: b(236, 250), normal: b(236, 250) },
};
export const BAND_SOURCE: Readonly<Record<SectionKind, string>> = {
  'single-gap': 'bands.md §2 "Single jump, gap"',
  'single-rise': 'bands.md §2 "Single jump, rise"',
  'double-teach-rise': 'bands.md §2 "Double teach, rise form (block face)"',
  'double-teach-rise-thin': 'bands.md §2 "Double teach, rise form, thin lip"',
  'double-test-gap': 'bands.md §2 "Double gap (Normal only; Easy has none)"',
  'bounce-teach': 'bands.md §2 "Bounce teach, floor mushroom"',
  'bounce-air-test': 'bands.md §2 "Bounce + air jump test (U, V)"',
};

// ───────────────────────── lookups ─────────────────────────

/**
 * THE TABLE (packet E12 item 3, D43): the stages judged on the flown arcs, each with its Normal scope (its own flown rows above). A stage
 * is judged where it has a row, on both settings; Easy's rows are `easy-any`. DATA: the one line here that names a stage; judging the
 * next stage is flying it, entering its rows and adding its line.
 */
export const JUDGED: Record<string, ReachScope> = { '1-1': 'normal-1-1' };

/** is this stage judged on the flown arcs (THE BOUNDARY: a stage with a JUDGED row, on both settings) */
export const judgedOnArcs = (stageId: string): boolean => Object.hasOwn(JUDGED, stageId);

/** where a stage's setting has flown rows (reach.md "Scope"): Normal by its JUDGED row, Easy anywhere; undefined: unflown (`reach.unflown`) */
export function scopeOf(stageId: string, setting: Difficulty): ReachScope | undefined {
  if (setting === 'easy') return 'easy-any';
  return judgedOnArcs(stageId) ? JUDGED[stageId] : undefined;
}

/** a flown row; throws on an unflown scope (a caller checks scopeOf first) */
export function arc(move: ReachMove, scope: ReachScope): FlownArc {
  const a = FLOWN_ARCS.find((r) => r.move === move && r.scope === scope);
  if (!a) throw new Error(`reach.ts: no flown row for ${move} in ${scope}`);
  return a;
}
/** the judged stage's own scope on a setting; a stage with no flown rows there throws by name (a caller asks judgedOnArcs first) */
export function scopeFor(setting: Difficulty, stageId: string): ReachScope {
  const s = scopeOf(stageId, setting);
  if (!s) throw new Error(`${stageId} ${setting} has no flown rows (reach.ts JUDGED)`);
  return s;
}

/** the band's top, or undefined for 'none' */
export const bandHi = (kind: SectionKind, setting: Difficulty): number | undefined => {
  const x = BANDS[kind][setting];
  return x === 'none' ? undefined : x.hi;
};

/**
 * The gaps and climbs levelCheck may link by on 1-1 (jumpOK, heldMaxGap, validateStage's `arcs`): the move the builder lays to, the
 * flick (bands.md §1), from its take-off rule. Single: Normal the band's 143 (a flick from 55 px, bands.md §2 / reach.md §4), Easy a flick
 * from 70 px (132). Double: a double flick from 70 px (283 / 287); no "from 55" figure was flown for the double, so 70 is used on both.
 */
export interface JumpArcs { single: { gap: number; climb: { block: number; thin: number } }; double: { gap: number; climb: { block: number; thin: number } } }
export function linkArcs(setting: Difficulty, stageId: string): JumpArcs {
  const s = scopeFor(setting, stageId);
  const sf = arc('single-flick', s), df = arc('double-flick', s);
  return {
    single: { gap: setting === 'normal' ? bandHi('single-gap', 'normal')! : sf.gap.from70, climb: sf.climb },
    double: { gap: df.gap.from70, climb: df.climb },
  };
}
/** the lesser moves at their best (any timing, hold): what a block must keep out by SPARE (bands.md §1) */
export function lesserArcs(setting: Difficulty, stageId: string): JumpArcs {
  const s = scopeFor(setting, stageId);
  const sh = arc('single-hold', s), dh = arc('double-hold', s);
  return { single: { gap: sh.gap.any, climb: sh.climb }, double: { gap: dh.gap.any, climb: dh.climb } };
}

/**
 * The builder's envelope on 1-1 (pipeline maxGap / the rise clamps, read here instead of physics.ts): a level gap is laid up to the
 * band's top (Easy's double gap, band 'none': up to the double flick from 70 px, and `band.out` refuses it as a verdict). A raised landing
 * has no flown figure: the caller keeps its closed-form envelope, capped by this.
 */
export function gapEnvelope(dbl: boolean, setting: Difficulty, stageId: string): number {
  const s = scopeFor(setting, stageId);
  if (!dbl) return bandHi('single-gap', setting)!;
  return bandHi('double-test-gap', setting) ?? arc('double-flick', s).gap.from70;
}
/** the highest rise the builder lays on 1-1: the single-rise band's top, or the double teach's rise band's top (its thin-lip row for
 *  a lip under a block's 50 px) */
export function riseEnvelope(dbl: boolean, setting: Difficulty, thin = false): number {
  return bandHi(!dbl ? 'single-rise' : thin ? 'double-teach-rise-thin' : 'double-teach-rise', setting)!;
}
/** the highest a bounce lip may stand over its mushroom's cap on 1-1: the bounce + air jump test band's top over the floor, less the cap */
export function bounceLipOverCap(setting: Difficulty): number {
  return bandHi('bounce-air-test', setting)! - CAP_UP.px;
}
