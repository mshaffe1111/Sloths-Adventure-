/**
 * The PACER (2-7's mail boat, reference/design/2-7.md NEW 1): a runner AHEAD of him over a stage's race leg, where a chase's front runs
 * behind (chase.ts). It waits at the race leg's start (2-7: the weir pool at the column's foot), sets off as he steps onto that leg, and
 * runs it at one steady speed to the dock (the stage's exit). Its time is set from the laid leg by the design's flown rule
 * (gen2/pacerLay.ts layPacer): the careful middle player's time for that leg plus the setting's share of it, and never more than the ride-only
 * time less `under`, so a careful middle player wins and letting the current carry him never does. Standing still loses by construction
 * (it never waits). It is a medal only: the race never locks the exit and never costs a life (the verdict is filed with the run's stats).
 * A fall neither costs nor pays race time (the lead's ruling, Option A, 11-21, D112): on a respawn on the race leg the respawn's lost time
 * is forgiven and he keeps EXACTLY the margin he had when he fell (pacerKeep; it still costs the heart). A respawn before that leg puts it
 * back at its start, waiting. (It replaced a floor per crossing and a last-crossing exemption that reset every respawn to "him plus the
 * floor": it paid a trailing player and took a leading player's lead, ENG-27j's measure; engine-core.md.)
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
  /** s it stays under the ride-only time (PacerRow.under) */
  under: number;
  /** its art (PacerRow.art) */
  art: readonly string[];
}

/** where the pacer is `clock` s after it set off (it docks at x1 and waits there) */
export function pacerX(p: Pacer, clock: number): number {
  const f = Math.max(0, Math.min(1, clock / p.seconds));
  return p.x0 + (p.x1 - p.x0) * f;
}

/** the boat's clock at which it would stand at `x` on its leg (s; along its way at its one speed, unclamped: before x0 it is negative) */
export function pacerAt(p: Pacer, x: number): number {
  return (((x - p.x0) * p.dir) / Math.max(1, Math.abs(p.x1 - p.x0))) * p.seconds;
}

/** his margin to the boat (s; + ahead) at `x` with the boat's clock at `clock`: the time the boat needs to come level with him */
export function pacerMargin(p: Pacer, x: number, clock: number): number {
  return pacerAt(p, x) - clock;
}

/** the pacer's clock after he is put back at `x` on its leg so that he keeps exactly `margin` (the lead's ruling, Option A, D112: a fall
 *  neither costs nor pays race time). A lead larger than the way from the start leaves the clock negative: the boat waits at its start
 *  that long, so the race's time is kept whole (the verdict reads the clock) */
export function pacerKeep(p: Pacer, x: number, margin: number): number {
  return pacerAt(p, x) - margin;
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
