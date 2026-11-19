/**
 * breathAim — a breathing row never meets him in lockstep after a death or a put-back (FIX-284, R-165.284; the lead's ruling A, 11-19).
 *
 * A row of beat pads (pieces/padPiece.ts: a pad on the stage's beat, by 'beat') sinks and rises on the stage's clock. Measured on 2-2's
 * finale (castBots, reference/qa-reports/FIX-284/phase.ts): a first-timer drowned at the pair, was put back at his flag and ran back in
 * 6.2-6.5 s, two whole breaths of 3.2 s, so every try met the pair at the same bad moment until the rescue; a person who runs back the same
 * way meets it the same way ("I keep dying at the same spot"). So, at every put-back (engine.ts respawnAtCheckpoint: the iris is fully
 * closed, the screen dark, so nothing is seen to jump), each breathing row ahead of him is turned on its breath: on the first put-back
 * before it, to have JUST RISEN at the soonest moment he can reach it at a run (a whole breath ahead of a runner); on each later one, a
 * golden share of a breath (0.618) further round than the try before. Whatever his own pace (a slow reader of the pond arrives the same
 * long after the soonest every try), no two tries in a row meet the row at the same moment of its breath, and the moments spread evenly
 * over the breath as the tries go on, never settling into a lock. Aiming every try at "just risen" was tried first and failed: it is
 * itself a lockstep for any player not at the soonest (castBots 2-2: kid Normal 18 -> 6 of 40, FIX-284 REPORT). Nothing else on the
 * clock moves (1-4's pods, 1-6's vine snakes are no floor that goes).
 *
 * Pure (no canvas, no engine, no stage ids): what is a breathing row and where it stands come from the platforms.
 */
import type { StageClock } from './clock.ts';
import type { Platform } from './types.ts';

export const BREATH_AIM = {
  /** a row farther ahead than this from where he is put back is not aimed (px): his arrival there is no longer one run he repeats */
  reach: 1600,
  /** how far round its breath each later try turns a row (share of the period): the golden share, so the tries never repeat a moment
   *  and spread evenly over the breath */
  turn: (Math.sqrt(5) - 1) / 2,
} as const;

/** each breathing row's clock and its nearest pad ahead of `fromX` within reach: the clock to aim, the pad's stagger and how far it is */
export function breathsAhead(platforms: readonly Platform[], fromX: number, reach: number = BREATH_AIM.reach): Array<{ clock: string; shift: number; dist: number }> {
  const near = new Map<string, { clock: string; shift: number; dist: number }>();
  for (const q of platforms) {
    if (q.pad?.by !== 'beat') continue;
    const dist = q.x - fromX;
    if (dist < 0 || dist > reach) continue;
    const had = near.get(q.pad.clock);
    if (!had || dist < had.dist) near.set(q.pad.clock, { clock: q.pad.clock, shift: q.pad.shift ?? 0, dist });
  }
  return [...near.values()];
}

/**
 * Aim every breathing row ahead of him: put back at `fromX` at game time `now`, able to move after `grace` s and running at `run` px/s,
 * he reaches a row's nearest pad at now + grace + dist / run; its beat is set to have just risen then (its first aim), or a golden share
 * of a breath further round than its last aim (each later one). `tries` counts each row's aims (the engine keeps it for the stage).
 * Returns what was aimed (the tests read it).
 */
export function aimBreaths(platforms: readonly Platform[], fromX: number, now: number, grace: number, run: number, clock: Pick<StageClock, 'align'>, tries: Map<string, number>): Array<{ clock: string; at: number; turn: number }> {
  const out: Array<{ clock: string; at: number; turn: number }> = [];
  for (const b of breathsAhead(platforms, fromX)) {
    const n = tries.get(b.clock) ?? 0;
    tries.set(b.clock, n + 1);
    const at = now + grace + b.dist / run;
    const turn = (n * BREATH_AIM.turn) % 1;
    clock.align(b.clock, at, b.shift, turn);
    out.push({ clock: b.clock, at, turn });
  }
  return out;
}
