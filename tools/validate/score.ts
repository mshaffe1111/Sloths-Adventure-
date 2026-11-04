/**
 * Two of the validator's score families as pure rules, so each has a fixture that fails it and one that passes (D15). The quality
 * supervisor's review of the pages (2026-11-04) found both gave points for what does not bite:
 *   - 1-5 scored "hazards matter 5" while every run of its breaking branches was outrun on every layout, and 1-8 the same for a chase
 *     whose collapse is on screen in 0-5% of its frames. A hazard that is outrun or unseen is decoration (STAGE-RULES §0.2), not challenge.
 *   - 1-5 scored "something new 10" for the breaking branch, a mechanic the route passes underneath and that is outrun. A new move counts
 *     as new only where the way to the shrine needs it and, for a hazard, where it bites.
 */

export type HazardKind = 'breaking' | 'eagle' | 'chase';
/** the move letter each hazard is in the move string (core.ts MOVE_NAMES) and the "six things" name it is part of (mechanics.ts) */
export const HAZARD_LETTER: Record<HazardKind, string> = { breaking: 'B', eagle: 'E', chase: 'K' };
export const HAZARD_THING: Record<HazardKind, string> = { breaking: 'branches', eagle: 'eagle', chase: 'branches' };

/** one hazard kind on a stage: the share of its judged tries where it bit (0-1), or null when none could be judged */
export interface HazardRead { kind: HazardKind; bite: number | null }

const clamp = (v: number) => Math.max(0, Math.min(10, Math.round(v * 10) / 10));

/**
 * hazards matter, 0-10: no hazard at all is 0 (Matt: nothing bites); else 10 x the mean share that bites over the kinds that could be
 * judged (an outrun or unseen kind bites 0). null when the stage has hazards and none could be judged (left out of the total, named).
 */
export function hazardsScore(present: HazardKind[], reads: HazardRead[]): number | null {
  if (!present.length) return 0;
  const judged = reads.filter((r) => present.includes(r.kind) && r.bite !== null);
  if (!judged.length) return null;
  return clamp((10 * judged.reduce((a, r) => a + (r.bite as number), 0)) / judged.length);
}

/** the kinds that do not bite: judged, and biting on none of their tries */
export const deadKinds = (reads: HazardRead[]) => new Set(reads.filter((r) => r.bite === 0).map((r) => r.kind));

/**
 * what a stage adds that counts as new: moves the shortest way to the shrine needs (they are in its move string) and that are not a hazard
 * that never bites; pairs whose parts are not all made of hazards that never bite.
 */
export function newThatCounts(adds: { moves: string[]; pairs: string[] }, quick: string, dead: Set<HazardKind>, present: HazardKind[]): { moves: string[]; pairs: string[] } {
  const deadLetters = new Set([...dead].map((k) => HAZARD_LETTER[k]));
  // (a "six things" name made of hazards only, "branches" being the breaking branch and the chase, is dead when every one of them on the
  // stage never bites)
  const deadThing = (thing: string) => {
    const ks = present.filter((k) => HAZARD_THING[k] === thing);
    return ks.length > 0 && ks.every((k) => dead.has(k));
  };
  return {
    moves: adds.moves.filter((m) => quick.includes(m) && !deadLetters.has(m)),
    pairs: adds.pairs.filter((p) => !p.split('+').some(deadThing)),
  };
}

/** something new, 0-10: 10 for a new move or pairing that counts, 3 for only new 3-move runs of old moves (more than 5), else 0 */
export function newScore(adds: { moves: string[]; pairs: string[]; grams: number } | undefined, quick: string, dead: Set<HazardKind>, present: HazardKind[]): number {
  if (!adds) return 10;
  const c = newThatCounts(adds, quick, dead, present);
  return clamp(c.moves.length || c.pairs.length ? 10 : adds.grams > 5 ? 3 : 0);
}
