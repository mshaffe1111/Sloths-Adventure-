/**
 * letGoCue — the swing's "let go now" glow over a river (R-165.289; ENG-24c). On a liana hung over a log river (river.ts lianasOver: 2-4's
 * drops), the glow on his grip and its glints (engine.ts sweetGlow) light only when a let-go NOW comes down on a log, or past the water
 * on the bank ahead: the drop judge's own "lands" (gen2/riverLay.ts lianaDrops), read off the very same flight (riverLay letGoFall and
 * fallOnLog), so the glow, the judge and the bot can never disagree. World 1's meaning (the sweet spot: the leap toward the next vine)
 * said "now" on 14-59% of the swings whose let-go lands in the water (BUILD-24), against 2-4's "Let go when it's under you"; with no river
 * under the liana it is the sweet spot, as it always was.
 *
 * The swing is a pure function of the vine's clock (physics.ts vineAngle), so each let-go is flown ONCE per liana, hold and facing: every
 * press of one swing as the engine plays it (physics.ts pressLaunchesFrom: the sweet spot's leap, a press a beat early waiting for it, a
 * beat late leaping from it), at two clocks half a frame apart; each frame reads the press for the vine's phase (`letGoAt`) and tests the
 * logs where the river's clock will have them as his feet come down. Facing back is the exact mirror: the same flight on the vine mirrored
 * about x = 0, half a swing on, read back. No flight on the play frame: a table is built when he takes hold or his hold comes to rest at a
 * new length (engine.ts keeps the last few), while his grip moves (a climb) the river says nothing.
 *
 * The glow promises a landing, so it is read a little tighter than the judge's share (CUE, measured against the engine itself, ENG-24c
 * REPORT): the press climbs his hold one frame before he leaves (a jump press is Up too: inputEngine.ts triggerTouchUp), and the catch is
 * read `inset` px narrower at each end on both readings of the river's clock (the judge's, and one frame back: the engine moves the logs
 * before it moves him). Against real let-gos on ENG-24's toy through the game's own touch input (letGoCue.test.ts: long, gap280, the raft
 * row, both settings, facing back), no frame lit over water, and lit on 83-97% of the frames whose let-go lands: it lights about a frame
 * later and goes out about a frame sooner than the true window, which the glow's own ease hides. 6 px left one such frame on the raft row.
 */
import { pressLaunchesFrom, SWING, vineAmp, vineAngle, vineOmega, vinePeriod, type SwingVine } from './physics.ts';
import type { DriftInfo } from './river.ts';
import { fallOnLog, letGoFall, type LetGoFall } from './gen2/riverLay.ts';

const DT = 1 / 30;

/** the glow is drawn above this (engine.ts render: the sweet spot's warm disc on his grip) */
export const GLOW_SHOWN = 0.03;

/** how the glow reads a let-go (above): the press's own climb (frames of SWING.climb), the catch's margin (px), the river's clock readings (s) */
export const CUE = { climbFrames: 1, inset: 8, clocks: [0, -DT] } as const;
/** the hold a press made at hold `len` leaves from (it climbs CUE.climbFrames first, never above SWING.minLen) */
export const pressHold = (len: number): number => Math.max(SWING.minLen, len - CUE.climbFrames * SWING.climb * DT);

/** a liana's every let-go at one hold and facing: one entry each half frame of its swing, in clock order from `t0` */
export interface LetGoTable {
  /** the vine's swing (s) */
  T: number;
  /** the press clock of entry 0 */
  t0: number;
  falls: Array<LetGoFall & { late: boolean }>;
}

/**
 * Fly every let-go of liana `v` pressed while he holds it `hold` from its top (it leaves from pressHold(hold)), toward `dir`, over the
 * river window `w` (its x0..x1 and its logs' top). Entry `late`: that press leaps from the sweet spot just passed (physics.ts
 * RELEASE.late), which the engine gives only with that sweet spot behind him on this vine (its sweetSnap), so the reader is told.
 */
export function letGoTable(v: SwingVine, hold: number, dir: 1 | -1, w: Pick<DriftInfo, 'x0' | 'x1' | 'baseY'>): LetGoTable {
  const len = pressHold(hold);
  const A: SwingVine = dir === 1 ? v : { ...v, x: -v.x, swingPhase: (v.swingPhase ?? 0) + 0.5 };
  const win = dir === 1 ? w : { x0: -w.x1, x1: -w.x0, baseY: w.baseY };
  const grids = [0, DT / 2].map((t0) => pressLaunchesFrom(A, { angle: vineAngle(A, t0), omega: vineOmega(A, t0), len, t: t0, amp: vineAmp(A) }));
  const falls: LetGoTable['falls'] = [];
  for (let k = 0; k < grids[0].length; k++) {
    for (const g of grids) {
      const f = letGoFall(g[k], win);
      const late = g[k].call === 'late';
      falls.push(dir === 1 ? { ...f, late } : { far: f.far, late, cross: f.cross.map((q) => ({ x: -q.x, vx: -q.vx, dt: q.dt, above: q.above })) });
    }
  }
  return { T: vinePeriod(v), t0: grids[0][0].pt, falls };
}

/** the let-go of the press made at vine clock `clock` (the nearest entry: half a frame apart, so at most a quarter frame off) */
export function letGoAt(tab: LetGoTable, clock: number): LetGoTable['falls'][number] {
  const u = (((clock - tab.t0) % tab.T) + tab.T) % tab.T;
  return tab.falls[Math.round(u / (DT / 2)) % tab.falls.length];
}

/**
 * Does a let-go pressed now (vine clock `clock`, river clock `riverT`) come down on one of `logs` (read by CUE), or on the bank ahead past
 * the water? `lateOk`: the engine would leap from the sweet spot just passed (its sweetSnap is this facing's, inside RELEASE.late);
 * without it a 'late' press is only a hop off, which the table does not fly, so it never says yes.
 */
export function letGoLands(tab: LetGoTable, clock: number, logs: readonly DriftInfo[], riverT: number, easy: boolean, lateOk: boolean): boolean {
  const f = letGoAt(tab, clock);
  if (f.late && !lateOk) return false;
  return f.far || CUE.clocks.every((c) => fallOnLog(f, logs, riverT + c, easy, CUE.inset));
}
