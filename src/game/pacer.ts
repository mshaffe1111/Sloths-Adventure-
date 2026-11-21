/**
 * The PACER (2-7's mail boat, reference/design/2-7.md NEW 1): a runner AHEAD of him over a stage's race leg, where a chase's front runs
 * behind (chase.ts). It waits at the race leg's start (2-7: the weir pool at the column's foot), sets off as he steps onto that leg, and
 * runs it at one steady speed to the dock (the stage's exit). Its time is set from the laid leg by the design's flown rule
 * (gen2/pacerLay.ts layPacer): the careful middle player's time for that leg plus the setting's share of it, and never more than the ride-only
 * time less `under`, so a careful middle player wins and letting the current carry him never does. Standing still loses by construction
 * (it never waits). It is a medal only: the race never locks the exit and never costs a life (the verdict is filed with the run's stats).
 * On a respawn on the race leg it is put back level with him plus the flown margin's share of the way left, never less than its floor
 * for each crossing still to make (pacerReplace; the lead's rulings 11-21: 2 s on Normal, 3 s on Easy, a crossing at a time).
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
  /** s of margin a re-placed pacer keeps at the least after a respawn, by setting, over his careful-middle time left, for each crossing
   *  he must still make (the lead's rulings 11-21: a late fall never turns a race he was winning into a loss by a river's log clock alone) */
  floor: { normal: number; easy: number };
  /** its art: inventory ids, its frames in order (two rowing frames) */
  art: readonly string[];
}

/** a laid pacer (GeneratedStage.pacer) */
export interface Pacer {
  /** its race point (its bow; its hull trails it, pacerDraw.ts pacerHull) where it waits and sets off (the far bank of the race leg's first
   *  river that holds it whole: he crosses that river beside it and sets it off reaching its bow) and where it docks (the far bank of the
   *  leg's last such river before the exit: the race is judged there), its hull seen over that river's water at both (gen2/pacerLay.ts, the
   *  lead's ruling 11-21); `lane` is the lowest river surface between them (pacerDraw.ts puts its waterline on each river's own) */
  x0: number;
  x1: number;
  lane: number;
  /** the way it runs: +1 right, -1 left */
  dir: -1 | 1;
  /** he sets it off stepping past `x0` on the race leg: his feet at or below `yMin` (the race leg's highest top, less a hop) */
  yMin: number;
  /** its time from its wait (x0) to its dock (x1) (s) */
  seconds: number;
  /** the flown times for the same leg (s): the careful middle player's and the ride-only player's */
  middle: number;
  rideOnly: number;
  /** the middle's time along the leg: [x, seconds from x0], in the order he meets them (the respawn's share reads it) */
  marks: ReadonlyArray<readonly [number, number]>;
  /** s of margin it keeps at the least for each crossing left when re-placed on a respawn (PacerRow.floor, the setting's), and s it stays under the ride-only time
   *  (PacerRow.under): the floor never gives the way left more than that bound's share of it */
  floor: number;
  under: number;
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

/** the race's crossings he has still to make from `x`: those whose far bank is ahead of him (the marks are x0, then each crossing's near
 *  and far bank in his order, the last crossing's far bank the dock, gen2/pacerLay.ts) */
export function riversLeft(p: Pacer, x: number): number {
  let n = 0;
  for (let i = 2; i < p.marks.length; i += 2) if ((p.marks[i][0] - x) * p.dir > 0) n++;
  return n;
}

/** the pacer's clock after he is put back at `x` on its leg: his careful-middle time from there to the dock plus the margin's share of
 *  it, and never less margin than its floor for EACH crossing he must still make from there, up to a clean run's margin (the lead's
 *  ruling (1), 11-21, ENG-27f: a fall that sends him a river back costs that river's log wait again; a fall never pays): on the last crossing whole (ruling A, ENG-27e), farther out where
 *  the ride-only bound allows it (the way left at the ride-only rate less `under`'s share). Before x0 the race has not begun: 0 */
export function pacerReplace(p: Pacer, x: number): number {
  const left = p.middle - middleAt(p, x);
  const share = p.seconds / p.middle - 1;
  // (the floor, a crossing at a time: post Normal seed 4 respawned two crossings out with the one floor's 2 s and the re-crossing's log
  //  wait alone cost 2.8 s over the flown marks, ENG-27f)
  const n = Math.max(1, riversLeft(p, x));
  // (and never more than a clean run's margin, the boat's lead over the flown middle at the dock: a fall must never pay (the lead's
  //  ruling (1), 11-21: per crossing alone, post Normal 4's first fall, 10 crossings out, put the boat back to its start, 11.7 s against
  //  a clean run's 6.6). Every respawn keeps at least the one floor)
  const floor = Math.max(p.floor, Math.min(p.floor * n, p.seconds - p.middle));
  // (never past the ride-only bound's share of the way left (pacerFaults: letting the current carry him never wins; planted: the
  //  ride-only bot won Easy seed 1 by 1.0 s on the 3 s floor after its respawns))
  const most = (p.rideOnly - p.under) / p.middle - 1;
  // (on the LAST crossing, no river left between him and the dock's, the floor holds whole: the lead's ruling A, 11-21: after a fall the
  //  child always keeps a fair chance to win; falling in is not winning without effort. Farther out the ride-only bound still caps it)
  const lastCrossing = n === 1;
  return Math.max(0, p.seconds - left - Math.max(left * share, lastCrossing ? floor : Math.min(floor, left * most)));
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
