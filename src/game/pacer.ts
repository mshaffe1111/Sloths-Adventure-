/**
 * The PACER (2-7's mail boat, reference/design/2-7.md NEW 1): a runner AHEAD of him over a stage's race leg, where a chase's front runs
 * behind (chase.ts). It waits at the race leg's start (2-7: the weir pool at the column's foot), sets off as he steps onto that leg, and
 * runs it at one steady speed to the dock (the stage's exit). Its time is set from the laid leg by the design's flown rule
 * (gen2/pacerLay.ts layPacer): the careful middle player's time for that leg plus the setting's share of it, and never more than the ride-only
 * time less `under`, so a careful middle player wins and letting the current carry him never does. Standing still loses by construction
 * (it never waits). It is a medal only: the race never locks the exit and never costs a life (the verdict is filed with the run's stats).
 * On a respawn on the race leg it is put back level with him plus the flown margin's share of the way left (pacerReplace).
 *
 * Pure data and arithmetic: the runtime piece is pieces/pacerPiece.ts, the lay gen2/pacerLay.ts. No stage id, world number, seed or x.
 */

/** a river row's flown crossing rates (px/s over the crossing: its water and `crossingBank` px of bank) */
export interface PacerRate { middle: number; rideOnly: number }

/** a world's pacer table (the designer's flown numbers; a graph's brief names it: GraphBrief.pacer) */
export interface PacerRow {
  /** px/s he runs a bank at (the flights' full run) */
  bank: number;
  /** each river row's flown rates, by the world's river row name (WorldManifest.rivers) */
  rivers: Readonly<Record<string, PacerRate>>;
  /** the bank px each flown crossing holds beside its water (the flights' 200 before and 30 after) */
  crossingBank: number;
  /** the share of the careful middle's time the pacer takes over it, by setting (0.07: 7% slower than the middle), so the margin is the
   *  same share of any leg's length (the lead's ruling, 11-21) */
  margin: { normal: number; easy: number };
  /** s the pacer's time stays under the ride-only time */
  under: number;
  /** its art: inventory ids, its frames in order (two rowing frames) */
  art: readonly string[];
}

/** a laid pacer (GeneratedStage.pacer) */
export interface Pacer {
  /** where it waits and sets off (the race leg's start) and where it docks (the exit), on its lane at height `lane` */
  x0: number;
  x1: number;
  lane: number;
  /** the way it runs: +1 right, -1 left */
  dir: -1 | 1;
  /** he sets it off stepping past `x0` on the race leg: his feet at or below `yMin` (the race leg's highest top, less a hop) */
  yMin: number;
  /** its time from x0 to the dock (s) */
  seconds: number;
  /** the flown times for the same leg (s): the careful middle player's and the ride-only player's */
  middle: number;
  rideOnly: number;
  /** the middle's time along the leg: [x, seconds from x0], in the order he meets them (the respawn's share reads it) */
  marks: ReadonlyArray<readonly [number, number]>;
  /** its art (PacerRow.art) */
  art: readonly string[];
}

/** where the pacer is `clock` s after it set off (it docks at x1 and waits there) */
export function pacerX(p: Pacer, clock: number): number {
  const f = Math.max(0, Math.min(1, clock / p.seconds));
  return p.x0 + (p.x1 - p.x0) * f;
}

/** the careful middle's time from x0 to `x` (s), read off the leg's marks */
export function middleAt(p: Pacer, x: number): number {
  const m = p.marks;
  const along = (q: number) => (q - p.x0) * p.dir;
  const a = along(x);
  if (a <= 0) return 0;
  for (let i = 1; i < m.length; i++) {
    const a0 = along(m[i - 1][0]), a1 = along(m[i][0]);
    if (a <= a1) return a1 > a0 ? m[i - 1][1] + ((m[i][1] - m[i - 1][1]) * (a - a0)) / (a1 - a0) : m[i][1];
  }
  return p.middle;
}

/** the pacer's clock after he is put back at `x` on its leg: level with him plus the margin's share of the way left (his careful-middle
 *  time from there to the dock, at the pacer's rate over the middle's). Before x0 the race has not begun: 0 */
export function pacerReplace(p: Pacer, x: number): number {
  const left = p.middle - middleAt(p, x);
  return Math.max(0, p.seconds - (left * p.seconds) / p.middle);
}

/** is he on the race leg past its start (the pacer sets off) */
export function pacerOff(p: Pacer, x: number, feetY: number): boolean {
  return feetY >= p.yMin && (x - p.x0) * p.dir >= 0;
}

/** what is wrong with a pacer's time, by name (empty: a fair race): over the careful middle's time, never over the ride-only's less `under` */
export function pacerFaults(p: Pacer, under: number): string[] {
  const out: string[] = [];
  const f = (s: number) => `${Math.round(s * 10) / 10} s`;
  if (!(p.seconds > p.middle)) out.push(`pacer: its ${f(p.seconds)} is not over the careful middle's ${f(p.middle)}: he cannot win the race`);
  if (p.seconds > p.rideOnly - under + 1e-6) out.push(`pacer: its ${f(p.seconds)} is over the ride-only ${f(p.rideOnly)} less ${under} s: letting the current carry him wins`);
  return out;
}
