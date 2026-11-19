/**
 * breathAim — a breathing row never meets him in lockstep after a death or a put-back (FIX-284, R-165.284; the lead's ruling A, 11-19).
 *
 * A row of beat pads (pieces/padPiece.ts: a pad on the stage's beat, by 'beat') sinks and rises on the stage's clock. Measured on 2-2's
 * finale (castBots, reference/qa-reports/FIX-284/phase.ts): a first-timer drowned at the pair, was put back at his flag and ran back in
 * 6.2-6.5 s, two whole breaths of 3.2 s, so every try met the pair at the same bad moment until the rescue; a person who comes back the
 * same way meets it the same way ("I keep dying at the same spot").
 *
 * So, at every put-back (engine.ts respawnAtCheckpoint: the iris is fully closed, the screen dark, so nothing is seen to jump), each
 * breathing row ahead of him is turned on its breath to have JUST RISEN a moment (`lead`) before he comes to it: the first time at the
 * soonest he can (moving at once, at a full run), and after that with the time he really took over the soonest last time (the engine
 * watches him pass the row's mark, `near` px before its first pad: noteArrivals), which goes with him to any flag he is put back at. However he plays it, he meets a whole breath, never the same bad
 * moment again. What was tried first and failed (FIX-284 REPORT): aiming at the soonest every try (its own lockstep for anyone slower:
 * kid Normal 18 -> 6 of 40), and turning each try a golden share of a breath on (no lock, but it hands some tries a bad moment on purpose:
 * the respawn clip drowned on its second try). Nothing else on the clock moves (1-4's pods, 1-6's vine snakes are no floor that goes).
 *
 * Pure (no canvas, no engine, no stage ids): what is a breathing row and where it stands come from the platforms.
 */
import type { StageClock } from './clock.ts';
import type { Platform } from './types.ts';

export const BREATH_AIM = {
  /** a row farther ahead than this from where he is put back is not aimed (px): his arrival there is no longer one run he repeats */
  reach: 1600,
  /** his arrival at a row is the moment his middle passes this far before its first pad (px): committed to it, a hop or two from landing */
  near: 100,
  /** the row has risen this long before he arrives (s): he lands well inside its up, with the whole up and shiver to cross in */
  lead: 0.1,
} as const;

/** a row aimed at a put-back, watched until he arrives: its clock, where its mark is, when he was put back and the soonest he could come */
export interface BreathWatch { clock: string; mark: number; from: number; soonest: number }

/** each breathing row's clock and its nearest pad ahead of `fromX` within reach: the clock to aim, the pad's stagger and how far it is */
export function breathsAhead(platforms: readonly Platform[], fromX: number, reach: number = BREATH_AIM.reach): Array<{ clock: string; shift: number; x: number; dist: number }> {
  const near = new Map<string, { clock: string; shift: number; x: number; dist: number }>();
  for (const q of platforms) {
    if (q.pad?.by !== 'beat') continue;
    const dist = q.x - fromX;
    if (dist < 0 || dist > reach) continue;
    const had = near.get(q.pad.clock);
    if (!had || dist < had.dist) near.set(q.pad.clock, { clock: q.pad.clock, shift: q.pad.shift ?? 0, x: q.x, dist });
  }
  return [...near.values()];
}

/**
 * Aim every breathing row ahead of him: put back with his middle at `fromX` at game time `now`, running at most `run` px/s, he could reach
 * a row's mark at the soonest (a full run from now); a row he has come back to before is aimed that much later as he took over the soonest
 * then (`late`: s, by clock); either way it has just risen `lead` s before. Returns the rows to watch for his arrival (noteArrivals).
 */
export function aimBreaths(platforms: readonly Platform[], fromX: number, now: number, run: number, clock: Pick<StageClock, 'align'>, late: ReadonlyMap<string, number>): BreathWatch[] {
  const out: BreathWatch[] = [];
  for (const b of breathsAhead(platforms, fromX)) {
    const mark = b.x - BREATH_AIM.near;
    const soonest = Math.max(0, mark - fromX) / run;
    clock.align(b.clock, now + soonest + (late.get(b.clock) ?? 0) - BREATH_AIM.lead, b.shift);
    out.push({ clock: b.clock, mark, from: now, soonest });
  }
  return out;
}

/** each frame: a watched row whose mark his middle has passed records how much longer than the soonest he took (`late`) and is no longer
 *  watched */
export function noteArrivals(watch: BreathWatch[], midX: number, now: number, late: Map<string, number>): BreathWatch[] {
  if (!watch.length) return watch;
  const left: BreathWatch[] = [];
  for (const w of watch) {
    if (midX >= w.mark) late.set(w.clock, Math.max(0, now - w.from - w.soonest));
    else left.push(w);
  }
  return left;
}
