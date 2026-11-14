/**
 * chase — 1-8 The Long Branch: the branch collapses behind Pokey and he must keep moving (World 1's special stage, Act I's set piece).
 *
 * Past the calm start the collapse sets off behind him. Its front moves a little slower than he runs, so anyone who keeps moving
 * stays ahead; when he gets far ahead it speeds up (the pressure never lets go), and when he stops, fights or misses a jump it closes
 * in. Every section of branch behind the front breaks and falls; the few sections just ahead of it crack first, the warning. Caught
 * (the front reaches him) or off the branch, he loses a heart and starts again at the last flag with the branch whole again (Matt's
 * choice, 2026-10-24), and the collapse waits a moment before it sets off again.
 *
 * A stage's chase as data (ChaseLay, any world: gen2 lays it, B5 chaseLay): several STRETCHES, each ending at a LIVING FORK the
 * collapse cannot break. The front stops at the fork (he can rest there: it never catches him on one), and a new crack sets off behind
 * him when he leaves it. Each setting has its row (CHASE_ROWS): Easy's front is at most 200 px/s and never faster than his run.
 *
 * Pure: the old hand-built 1-8 is stepped and drawn by engine.ts (one ChasePlan, the Normal row); a laid chase runs as a stage piece
 * (pieces/chasePiece.ts). chase.test.ts checks the rules.
 */
import { PHYS } from './physics.ts';

export interface ChasePlan {
  /** where the collapse sets off (he passes this x), and where it stops (the last liana: the shrine is beyond it) */
  start: number;
  end: number;
  /** from here the collapse goes faster (the end of the branch: it breaks for good) */
  finalFrom: number;
}

export const CHASE = {
  /** its speed with him close (px/s): his run is 285, so a player who keeps going pulls away */
  base: 230,
  /** its speed at most, when he is far ahead */
  max: 420,
  /** how far ahead he can get before it speeds up, and over how much more it reaches full speed */
  band: 560,
  ramp: 500,
  /** faster on the last stretch */
  final: 60,
  /** how far behind him it starts (px), at the start and after a restart */
  behind: 520,
  /** after a restart it waits this long (s) before it sets off again */
  hold: 1.6,
  /** the sections this far ahead of the front crack (the warning) */
  crackAhead: 300,
  /** caught: the front within this of him (px) */
  catchAt: 24,
} as const;

/** one setting's numbers for the front (CHASE's fields, and a cap it never runs over) */
export interface ChaseRow {
  readonly base: number;
  readonly max: number;
  readonly band: number;
  readonly ramp: number;
  readonly final: number;
  readonly behind: number;
  readonly hold: number;
  readonly crackAhead: number;
  readonly catchAt: number;
  /** the front never runs faster than this (px/s) */
  readonly cap: number;
}

/**
 * The rows by setting. Normal is CHASE (the old 1-8's numbers, unchanged). Easy (1-8.md "Easy ~4", ENGINE-678 B1): the front at most
 * 200 px/s and never faster than his run (PHYS.maxRun), no burst on the last stretch, and more room: it sets off 600 px back and waits
 * 2.2 s after a restart, so the stop budget (behind - catchAt) / base is (600 - 24) / 170 = 3.4 s against Normal's (520 - 24) / 230 = 2.2 s.
 */
export const CHASE_ROWS: { readonly normal: ChaseRow; readonly easy: ChaseRow } = {
  normal: { ...CHASE, cap: Infinity },
  easy: { base: 170, max: 200, band: 560, ramp: 500, final: 0, behind: 600, hold: 2.2, crackAhead: 300, catchAt: 24, cap: Math.min(200, PHYS.maxRun) },
};

export interface ChaseState {
  /** the collapse front (world x): everything left of it has fallen */
  front: number;
  active: boolean;
  /** seconds it still waits before moving */
  hold: number;
}

export function newChase(plan: ChasePlan, row: ChaseRow = CHASE_ROWS.normal): ChaseState {
  return { front: plan.start - row.behind, active: false, hold: 0 };
}

/** how fast the front moves with him `gap` px ahead of it, at x */
export function chaseSpeed(plan: ChasePlan, gap: number, x: number, row: ChaseRow = CHASE_ROWS.normal): number {
  const k = Math.max(0, Math.min(1, (gap - row.band) / row.ramp));
  return Math.min(row.cap, row.base + (row.max - row.base) * k + (x >= plan.finalFrom ? row.final : 0));
}

/** step the collapse with him at x */
export function stepChase(s: ChaseState, plan: ChasePlan, dt: number, x: number, row: ChaseRow = CHASE_ROWS.normal): void {
  if (!s.active) {
    if (x >= plan.start) {
      s.active = true;
      s.front = Math.min(s.front, x - row.behind);
    }
    return;
  }
  if (s.hold > 0) {
    s.hold = Math.max(0, s.hold - dt);
    return;
  }
  s.front = Math.min(plan.end, s.front + chaseSpeed(plan, x - s.front, s.front, row) * dt);
}

/** has the front reached him? */
export function caught(s: ChaseState, x: number, row: ChaseRow = CHASE_ROWS.normal): boolean {
  return s.active && x - s.front < row.catchAt;
}

/** start again at a flag: the front well behind it, waiting a moment (and not set off at all if the flag is before the chase) */
export function restartAt(s: ChaseState, plan: ChasePlan, flagX: number, row: ChaseRow = CHASE_ROWS.normal): void {
  // a flag before the branch: the chase as at the stage start (it sets off CHASE.behind behind him when he reaches it). The front kept
  // 520 px behind THIS flag used to be kept when it started (stepChase keeps the further-back front), so a fall before the branch left
  // the collapse thousands of px behind for the rest of the run (the Critic, EN-F, on A-07's restart at every respawn)
  if (flagX < plan.start) {
    Object.assign(s, newChase(plan, row));
    return;
  }
  s.front = flagX - row.behind;
  s.active = true;
  s.hold = row.hold;
}

/** what a section of branch looks like: fallen (behind the front), cracking (just ahead of it), or whole */
export function sectionState(s: ChaseState, x0: number, x1: number, row: ChaseRow = CHASE_ROWS.normal): 'fallen' | 'cracked' | 'whole' {
  if (!s.active) return 'whole';
  if (x1 <= s.front) return 'fallen';
  if (x0 <= s.front + row.crackAhead) return 'cracked';
  return 'whole';
}

// ---------------------------------------------------------------------------------------------------------------------------------
// A laid chase: stretches and living forks (ENGINE-678 B1; run by pieces/chasePiece.ts; laid by gen2, B5)

/** one stretch: the crack sets off behind him as he passes `start`, and the front stops at `end`, the near edge of a living fork */
export interface ChaseStretch {
  start: number;
  end: number;
  /** the last stretch: the front runs its row's final burst over all of it (Normal: faster than his run; Easy: none) */
  last?: boolean;
}

/**
 * A stage's chase, as data (any world). The stretches run left to right and never overlap; between one's `end` and the next one's
 * `start` lies a living fork: no section on it falls and the collapse never catches him there (the one place to stop). The sections
 * that fall are the stage's platforms marked `chase`; a flag belongs on a fork (STAGE-RULES:105-109), never inside a stretch.
 */
export interface ChaseLay {
  stretches: ChaseStretch[];
}

/** a laid chase running: one front per stretch (each waits for him, runs, and stops at its fork) */
export interface ChaseRun {
  readonly lay: ChaseLay;
  readonly row: ChaseRow;
  readonly fronts: ChaseState[];
}

/** what is wrong with a lay, in words (empty when it can run): the lay refuses a chase by name rather than run a broken one */
export function chaseLayProblems(lay: ChaseLay): string[] {
  const out: string[] = [];
  if (!lay.stretches.length) out.push('no stretch');
  lay.stretches.forEach((st, i) => {
    if (!(st.end > st.start)) out.push(`stretch ${i}: its end ${st.end} is not past its start ${st.start}`);
    const prev = lay.stretches[i - 1];
    if (prev && st.start < prev.end) out.push(`stretch ${i}: starts at ${st.start}, before stretch ${i - 1}'s fork at ${prev.end}`);
    if (st.last && i !== lay.stretches.length - 1) out.push(`stretch ${i}: marked last but is not`);
  });
  return out;
}

/** the old one-plan form of a stretch (the final burst over the whole of the last one) */
function planOf(st: ChaseStretch): ChasePlan {
  return { start: st.start, end: st.end, finalFrom: st.last ? -Infinity : Infinity };
}

export function newChaseRun(lay: ChaseLay, easy: boolean): ChaseRun {
  const row = easy ? CHASE_ROWS.easy : CHASE_ROWS.normal;
  return { lay, row, fronts: lay.stretches.map((st) => newChase(planOf(st), row)) };
}

/** step every front with him at x: each sets off when he passes its stretch's start and stops at its fork */
export function stepChaseRun(r: ChaseRun, dt: number, x: number): void {
  r.lay.stretches.forEach((st, i) => stepChase(r.fronts[i], planOf(st), dt, x, r.row));
}

/** the stretch whose ground he is on (past its start, short of its fork), or -1: before the chase, on a fork, or past the last fork */
export function stretchAt(lay: ChaseLay, x: number): number {
  return lay.stretches.findIndex((st) => x >= st.start && x < st.end);
}

/** has a front reached him? Only on a stretch's own ground: never on a fork (it stops there) and never before its crack */
export function caughtInRun(r: ChaseRun, x: number): boolean {
  const i = stretchAt(r.lay, x);
  return i >= 0 && caught(r.fronts[i], x, r.row);
}

/** the front nearest behind him (world x) of a stretch that is running, for the warning at the edge of the screen; null for none */
export function frontBehind(r: ChaseRun, x: number): number | null {
  let best: number | null = null;
  r.lay.stretches.forEach((st, i) => {
    const f = r.fronts[i];
    if (f.active && f.front < st.end && f.front <= x && (best === null || f.front > best)) best = f.front;
  });
  return best;
}

/**
 * Back at a flag: a stretch past the flag waits for him again, the one he is in (a flag inside a stretch) waits `hold` s with its
 * front `behind` back, and one wholly behind him stays fallen to its fork.
 */
export function restartRunAt(r: ChaseRun, flagX: number): void {
  r.lay.stretches.forEach((st, i) => {
    const f = r.fronts[i];
    if (flagX >= st.end) Object.assign(f, { front: st.end, active: true, hold: 0 });
    else restartAt(f, planOf(st), flagX, r.row);
  });
}

/**
 * The stretch a section of branch belongs to (its middle on that stretch's ground, from the fork before it to its own fork), or -1 for
 * a section on a fork or past the last one: those never fall. The first stretch also owns the base behind its crack (it falls as the
 * front sets off there, the old 1-8's long crack).
 */
export function sectionStretch(lay: ChaseLay, x0: number, x1: number): number {
  const m = (x0 + x1) / 2;
  return lay.stretches.findIndex((st, i) => m <= st.end && (i === 0 ? true : m >= st.start));
}

/** a section's look now: fallen (its stretch's front has passed it), cracking (just ahead of the front), or whole */
export function sectionInRun(r: ChaseRun, owner: number, x0: number, x1: number): 'fallen' | 'cracked' | 'whole' {
  if (owner < 0) return 'whole';
  const st = r.lay.stretches[owner];
  const f = r.fronts[owner];
  // (a front stopped at its fork cracks nothing more: the fork is living)
  if (f.active && f.front >= st.end) return x1 <= f.front ? 'fallen' : 'whole';
  return sectionState(f, x0, x1, r.row);
}
