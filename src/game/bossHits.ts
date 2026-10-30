/**
 * bossHits — how the boss bar counts (BossHud.tsx draws it, engine.ts says what each blow took off). The bar has about one segment per
 * hit: a hook or a kick is one segment, a jab half of one, and a blow on a stunned boss half as much again, so one blow can take off
 * nothing yet (half a segment), one, or two. What came off is popped at the spot that was hit, so the counter never seems to skip or
 * stall (2026-10-26, QA: "a punch gave points but the counter stayed"; "a single punch took 2").
 */

/** how many segments a boss bar has: about one per hit, so the bar itself says how long the fight still is */
export function bossSegmentCount(maxHp: number, hits?: number): number {
  if (hits && hits > 0) return Math.max(6, Math.min(40, Math.round(hits)));
  return Math.max(10, Math.min(28, Math.round(maxHp / 4)));
}

/** the segments still lit (the "N HITS LEFT" on the bar) */
export function hitsLeft(hp: number, maxHp: number, hits?: number): number {
  const per = maxHp / bossSegmentCount(maxHp, hits);
  return Math.max(0, Math.ceil(hp / per - 1e-6));
}

/** the words popped over the spot a blow landed on: what came off the bar */
export function hitLabel(before: number, after: number, _crit: boolean, _pts: number): string {
  // (calm and small, AN-3: what came off the bar, and nothing shouted; a critical shows in its colour, the score in the corner)
  const n = before - after;
  if (n <= 0) return '½ hit';
  return n === 1 ? '1 hit' : `${n} hits`;
}
