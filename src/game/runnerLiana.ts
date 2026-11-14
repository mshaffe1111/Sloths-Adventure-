/**
 * runnerLiana — 1-8 NEW 4, A LIANA PHASED TO A RUNNER'S ARRIVAL (ENG-B6; the `s` letter's dial `phase: runner`; any world by data):
 * a liana that swings to meet him at a full run, so a runner catches it in stride and never waits at the lip for it to come back.
 *
 * Every liana swings on its own (physics.ts, the self-swing: vineAngle from the vines' clock and its phase), so where it is when he
 * reaches the lip is luck: at a run, about half its swing is away from him (BUILD-16c: the bots stood and watched it come). A runner
 * liana (Vine.runner) is solved once, from the engine's own air (airStep, the jump's hold and cut) and catch (canGrabSwing): the moments
 * of its swing at which a full-run jump off its take-off lip catches it, over a spread of take-offs and holds (`RUNNER.takeoffs`,
 * `RUNNER.holds`). While he runs toward that lip the liana's phase is eased, never jumped, so that the best of those moments comes as he
 * gets there at his top run: by at most `RUNNER.rate` of a swing a second, its rhythm only a little quicker or slower for a moment
 * (no frame moves it further than its own swing plus that). It is eased only while he runs at it at his top run (RUNNER.atRun):
 * never while he holds it, once he is past its lip, or while he walks or stops, when it keeps its phase and swings as any liana does.
 * What is promised is the run.
 * Pure; run by pieces/runnerLianaPiece.ts. runnerLiana.test.ts holds the rules on the real engine.
 */
import { airStep, canGrabSwing, PHYS, vinePeriod, type SwingVine } from './physics.ts';
import type { Platform } from './types.ts';

export const RUNNER = {
  /** the most its phase is eased (swings per second): its rhythm at most this share quicker or slower for a moment */
  rate: 0.12,
  /** it is eased while he is within this of its lip (px): half a swing's correction at `rate`, at his top run */
  get from(): number {
    return Math.ceil((0.5 / this.rate) * PHYS.maxRun);
  },
  /** he is running at it when his speed toward it is at least this share of his top run (a full run reads 268-285 px/s frame to frame) */
  atRun: 0.85,
  /** the take-offs solved for (px before the lip) and the jump's holds (s): a run's press lands a little before the lip */
  takeoffs: [8, 40, 80] as readonly number[],
  holds: [0.12, 0.2, 0.32] as readonly number[],
  /** the moments of its swing tried (per swing) */
  samples: 48,
} as const;

const DT = 1 / 30;

/** the lip a runner takes off from for this liana: the solid ground he runs on whose far end is the nearest one short of it */
export function runnerLip(v: SwingVine & { topY: number; bottomY: number }, platforms: readonly Platform[], dir: 1 | -1 = 1): Platform | null {
  let best: Platform | null = null;
  for (const p of platforms) {
    if (p.type !== 'solid' || p.width < 60) continue;
    const end = dir > 0 ? p.x + p.width : p.x;
    const d = dir * (v.x - end);
    // (as the bots read a liana off an edge, lianaWait: ahead within 360 px, its foot within reach of his height, its top over him)
    if (d < -40 || d > 360 || v.bottomY < p.y - 140 || v.topY > p.y - 100) continue;
    if (!best || dir * (end - (dir > 0 ? best.x + best.width : best.x)) > 0) best = p;
  }
  return best;
}

/** does a full-run jump off (x, y), held `hold` s, taking off at clock `t0`, catch the liana as the engine catches (physics.ts)? */
export function runCatches(v: SwingVine, x: number, y: number, dir: 1 | -1, hold: number, t0: number): boolean {
  const b = { x, y, vx: dir * PHYS.maxRun, vy: -PHYS.jumpV };
  for (let i = 1; i < 60; i++) {
    const held = i * DT < hold;
    if (!held && b.vy < -PHYS.cutV) b.vy = -PHYS.cutV;
    airStep(b, DT, dir, held);
    if (canGrabSwing(b.x, b.y, v, t0 + i * DT)) return true;
    if (b.y > y + 200) return false;
  }
  return false;
}

/**
 * The moment of its swing (0..1 of a swing, at his take-off from the first of RUNNER.takeoffs) a runner meets it best: the middle of
 * the widest run of moments the most take-offs and holds catch it at. null when no moment of its swing is caught at a full run.
 */
export function runnerMoment(v: SwingVine, lipEnd: number, y: number, dir: 1 | -1 = 1): { at: number; share: number } | null {
  const n = RUNNER.samples, P = vinePeriod(v);
  const score = new Array<number>(n).fill(0);
  const ways = RUNNER.takeoffs.length * RUNNER.holds.length;
  const near = RUNNER.takeoffs[0];
  for (let i = 0; i < n; i++) {
    // (the clock at the first take-off is i/n of a swing; a take-off further back is that much earlier, at his top run)
    const u = i / n;
    for (const off of RUNNER.takeoffs) for (const hold of RUNNER.holds) {
      const early = (off - near) / PHYS.maxRun;
      if (runCatches({ ...v, swingPhase: 0 }, lipEnd - dir * off, y, dir, hold, u * P - early)) score[i]++;
    }
  }
  const top = Math.max(...score);
  if (top === 0) return null;
  // (the widest run of the best moments, round the swing; its middle)
  let bestLen = 0, bestMid = 0;
  for (let i = 0; i < n; i++) {
    if (score[i] !== top || score[(i - 1 + n) % n] === top) continue;
    let len = 0;
    while (len < n && score[(i + len) % n] === top) len++;
    if (len > bestLen) {
      bestLen = len;
      bestMid = (i + (len - 1) / 2) / n;
    }
  }
  if (bestLen === 0) return { at: 0, share: top / ways };
  return { at: bestMid % 1, share: top / ways };
}

/** the phase that puts the liana at moment `at` of its swing when the vines' clock reads `t` */
export function phaseFor(v: SwingVine, at: number, t: number): number {
  const u = at - t / vinePeriod(v);
  return ((u % 1) + 1) % 1;
}

/** one step of easing a phase toward `want` the short way round, by at most `rate` x `dt` of a swing */
export function easePhase(cur: number, want: number, dt: number, rate: number = RUNNER.rate): number {
  let d = (((want - cur) % 1) + 1.5) % 1 - 0.5;
  const most = rate * dt;
  if (d > most) d = most;
  else if (d < -most) d = -most;
  return (((cur + d) % 1) + 1) % 1;
}

/** what is wrong with a runner liana, in words (empty when it can run): the lay refuses one by name */
export function runnerProblems(v: SwingVine & { topY: number; bottomY: number }, platforms: readonly Platform[], dir: 1 | -1 = 1): string[] {
  const lip = runnerLip(v, platforms, dir);
  const name = `runner liana at ${Math.round(v.x)}`;
  if (!lip) return [`${name}: no ground he runs off toward it (360 px short of it, its foot within his reach)`];
  const end = dir > 0 ? lip.x + lip.width : lip.x;
  const m = runnerMoment(v, end, lip.y, dir);
  if (!m) return [`${name}: no moment of its swing is caught by a full-run jump off its lip at ${Math.round(end)}`];
  const problems: string[] = [];
  // (the run of unbroken ground that ends at the lip: long enough to ease half a swing at his top run, or it cannot promise the run)
  const run = runTo(platforms, lip, dir);
  if (run < RUNNER.from) problems.push(`${name}: ${Math.round(run)} px of run to its lip, ${RUNNER.from} px eases it to a runner`);
  return problems;
}

/** how far unbroken ground at the lip's height runs back from the lip's far end (px) */
export function runTo(platforms: readonly Platform[], lip: Platform, dir: 1 | -1 = 1): number {
  const end = dir > 0 ? lip.x + lip.width : lip.x;
  let at = dir > 0 ? lip.x : lip.x + lip.width;
  for (let moved = true; moved; ) {
    moved = false;
    for (const p of platforms) {
      if (p.type !== 'solid' || Math.abs(p.y - lip.y) > 2) continue;
      const near = dir > 0 ? p.x + p.width : p.x, far = dir > 0 ? p.x : p.x + p.width;
      if (Math.abs(near - at) <= 1 && dir * (far - at) < 0) {
        at = far;
        moved = true;
      }
    }
  }
  return Math.abs(end - at);
}
