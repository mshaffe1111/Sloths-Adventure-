/**
 * The PACER (2-7's mail boat, reference/design/2-7.md NEW 1): a runner AHEAD of him over a stage's race leg, where a chase's front runs
 * behind (chase.ts). It waits at the race leg's start (2-7: the weir pool at the column's foot), sets off as he steps onto that leg, and
 * runs it at one steady speed to the dock (the stage's exit). Its time is set from the laid leg by the design's flown rule
 * (gen2/pacerLay.ts layPacer): the careful middle player's time for that leg plus the setting's share of it, so a careful middle player
 * wins. Letting the current carry him never wins, by `under` s or more: MEASURED on the ride-only bot (pacerLay.test), no longer capped at
 * the designer's flown ride-only rate, which rides far faster than the bot does (the lead's ruling on the race's pace, ENG-27w: the boat at
 * the picked pace broke that cap by 12-16 s while the ride-only bot still lost every race). Standing still loses by construction
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
  /** the race's END lines (the brief's `raceEnd`, its tip ids read from the world's tips when the stage is laid, gen2/pipeline.ts): one
   *  is said ONCE, the frame he reaches the dock, by the speaker it names (engine.ts sayRaceEnd). Absent: the race ends unsaid */
  ends?: RaceEnds<RaceEndSaid>;
}

/** who says a race's end line: Dot, or Pokey himself (the words name their speaker: the stage's line sheet says whose each is) */
export type RaceEndWho = 'Dot' | 'Pokey';
/** a brief's race-end line: a tip id of the world's own (WorldManifest.tips, where the stage's other lines live) and who says it */
export interface RaceEndLine { tip: string; who: RaceEndWho }
/** a race-end line as laid: its words and who says them */
export interface RaceEndSaid { text: string; who: RaceEndWho }
/** the line for a race he won (he reached the dock before the pacer) and for one he lost (the pacer docked first) */
export interface RaceEnds<L> { win: L; lose: L }

/** the brief's race-end lines read from the world's tips, or what is wrong with them by name (a tip id the world has no words for) */
export function raceEndsOf(spec: RaceEnds<RaceEndLine>, tips: Readonly<Record<string, string>>): { ends?: RaceEnds<RaceEndSaid>; problems: string[] } {
  const problems: string[] = [];
  const said = (k: 'win' | 'lose'): RaceEndSaid => {
    const text = tips[spec[k].tip];
    if (!text) problems.push(`race end: the ${k} line's tip '${spec[k].tip}' has no words in the world's tips`);
    return { text: text ?? '', who: spec[k].who };
  };
  const ends = { win: said('win'), lose: said('lose') };
  return problems.length ? { problems } : { ends, problems };
}

/** the line a race's end says: the win's when he docked before the pacer, else the loss's */
export const raceEndLine = (ends: RaceEnds<RaceEndSaid>, verdict: { won: boolean }): RaceEndSaid => (verdict.won ? ends.win : ends.lose);

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

/** what is wrong with a pacer's time, by name (empty: a fair race): it must be over the careful middle's time. (The ride-only bound is
 *  measured on the ride-only bot, pacerLay.test, not read from the flown ride-only rate: the lead's ruling, ENG-27w) */
export function pacerFaults(p: Pacer): string[] {
  const out: string[] = [];
  const f = (s: number) => `${Math.round(s * 10) / 10} s`;
  if (!(p.seconds > p.middle)) out.push(`pacer: its ${f(p.seconds)} is not over the careful middle's ${f(p.middle)}: he cannot win the race`);
  return out;
}
