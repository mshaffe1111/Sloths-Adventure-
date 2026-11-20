/**
 * The Sunlit Riverbank's rule (World 2): rivers with drifting logs.
 *
 * A river fills the gap between two banks. Logs slide out from under one bank, ride the current across the water and slide in
 * under the other; they never stop, so the player boards one, rides it, or hops from log to log. Everything here is pure (no
 * canvas, no engine) so the generator, the validator, the engine and the tests all agree on where a log is at any moment.
 *
 * The world is taught in order (see `riverRecipes`): the first stages have one slow river that flows WITH the player, then rivers
 * that flow against, then faster rapids with narrower logs, then long mixed runs.
 */

/** the motion of one log (stored on its platform) */
import { cyclePos } from './clock.ts';

export interface DriftInfo {
  /** the river window: a log travels from under one bank to under the other */
  x0: number;
  x1: number;
  /** +1 flows to the right (with a player running right), -1 to the left */
  dir: 1 | -1;
  /** px per second */
  speed: number;
  /** log length, px */
  width: number;
  /** seconds into the cycle at game time 0 (spaces the logs out) */
  offset: number;
  /** the log's top edge, px */
  baseY: number;
  /** drawn as a raft, not a log (gen2/riverLay.ts RiverRow.look, R-165.288): the painted raft's deck is this top. Draw only */
  look?: 'raft';
  /**
   * the river's TAIL (gen2/riverLay.ts RiverRow.tail, ENG-24e): log-free water this wide (px) past `x1` before the far bank. The logs go
   * under (or come out from under) World 2's painted end at `x1`, in mid-water, so no bank stands there: nothing hands a rider over at
   * that end (engine.ts), he rides into the water. The window is still `x0..x1`, the river's water `x0..riverEnd`
   */
  tail?: number;
}
/** where the water a log rides on ends: its far bank's lip, `tail` past the logs' own end (RiverRow.tail) */
export const riverEnd = (d: Pick<DriftInfo, 'x1' | 'tail'>): number => d.x1 + (d.tail ?? 0);
/** is `d` one of river `r`'s logs (its window starts at the river's near end and its water ends at the river's far end) */
export const onRiver = (d: Pick<DriftInfo, 'x0' | 'x1' | 'tail'>, r: Pick<RiverZone, 'x0' | 'x1'>): boolean => d.x0 === r.x0 && riverEnd(d) === r.x1;

/** a river as the stage keeps it: the water to draw and the surface that is fatal */
export interface RiverZone {
  x0: number;
  x1: number;
  /** y of the water surface (a log floats with its middle at this height) */
  surfaceY: number;
  dir: 1 | -1;
  speed: number;
  /**
   * a teaching river (2-1): falling in costs no life. He splashes, and is set back on the bank he jumped from to try again.
   * `back` is where he is set down.
   */
  safe?: { backX: number; backY: number };
  /** a pond of sinking pads that is a SPUR (gen2/rideLay.ts PadRow.spur): its far end is a dead-end stone, standing here (its top's
   *  middle); the way on is from the near bank, so the route goes out to it and back (route.ts) */
  spur?: { x: number; y: number };
  /** water crossed some other way, with no logs on it (swung over on the vines of 2-4) */
  open?: boolean;
  /** its logs' TAIL (DriftInfo.tail, RiverRow.tail): the last `tail` px before the far bank are log-free; the logs go under World 2's painted
   *  end at `x1 - tail` (riverArt.ts drawRiverTail) */
  tail?: number;
  /** a water wheel's pond (gen2/wheelLay.ts layWheel, ENG-26): still water under a wheel's whole sweep, its jetty and its street standing
   *  over it, so it has no banks at its ends (levelCheck asks none); a fall into it splashes him back onto the jetty (`safe`) */
  wheelPond?: true;
  /**
   * 2-8 Reed Cages: still water that rises once he passes `trigger`, from where it starts to `y1` over `seconds`, covering the low reed
   * islands in it (the banks stay dry). Back to where it started when he respawns. `y0` is filled in by the engine (the starting level).
   */
  flood?: { y1: number; seconds: number; trigger: number; y0?: number };
  /**
   * the puzzle kit's sluice gate (puzzleKit.ts 'sluice') runs this river's current: `flowT` is the river's own clock, which its logs
   * and its streaks follow instead of the game's (it runs on at 1 with the current, backwards at -1 when the sluice turns the current
   * about, and stands still at 0 when the sluice stops it); `flowRate` is how fast it runs now. Unset: the game's clock, as always.
   */
  flowT?: number;
  flowRate?: number;
  /**
   * 2-2's ferry: one wide raft instead of a row of logs (a sluice runs this river, puzzleKit.ts: shut, the raft waits moored under the far
   * bank; open, the current brings it round to him). The level check lets a raft river have its one log.
   */
  raft?: boolean;
}

/** the clock a log moves by: its river's own when a sluice runs that river (RiverZone.flowT), else the game's */
export function logClock(rivers: readonly RiverZone[] | undefined, d: DriftInfo, t: number): number {
  for (const r of rivers ?? []) if (r.flowT !== undefined && d.x0 >= r.x0 - 1 && d.x1 <= r.x1 + 1) return r.flowT;
  return t;
}

/**
 * The swinging lianas whose anchor hangs over a river's window (its water, bank to bank; ENG-24, place `river` after a liana): such a
 * river's logs are a let-go's landing, crossed by the vine and never hopped log to log, so the hop rule (levelCheck, gen2/riverLay.ts
 * riverFaults) gives way to the drop's (riverLay lianaRiverFaults)
 */
export function lianasOver<V extends { x: number; vineType?: string; isSwingingVine?: boolean; swingAmp?: number }>(vines: readonly V[], r: { x0: number; x1: number }): V[] {
  return vines.filter((v) => (v.isSwingingVine || v.vineType === 'swing_liana') && (v.swingAmp ?? 1) > 0 && v.x > r.x0 && v.x < r.x1);
}
/**
 * The lianas over a river whose throw has LOGS under it (ENG-24f, the lead's ruling 11-19 9:12 PM ET, level.md World 2 notes): the anchor
 * hangs over the logs' window, before the painted end where they go under (RiverZone.tail). Every let-go leaves forward of the anchor, so
 * one hung at or past the window's end (over the TAIL, log-free water) throws over open water: a swing held to World 1's vine rules
 * (gen2/riverLay.ts tailLianaFaults), never the log-drop share, and the logs before it are hopped as on any river (the hop rule stands).
 */
export function lianasOverLogs<V extends { x: number; vineType?: string; isSwingingVine?: boolean; swingAmp?: number }>(vines: readonly V[], r: { x0: number; x1: number; tail?: number }): V[] {
  const end = r.x1 - (r.tail ?? 0);
  return lianasOver(vines, r).filter((v) => v.x < end);
}

/** the gap between neighbouring logs a hop can take, for logs flowing `dir` (levelCheck.ts checks the river's own; a sluice that turns
 * the current about must keep the logs hoppable the other way too, puzzleCheck.ts) */
export const hopLimit = (dir: 1 | -1): number => (dir === 1 ? 80 : 130);

/** how high a rising river is `since` seconds after it began (y grows downward: it moves from y0 up to y1) */
export function floodLevel(f: { y1: number; seconds: number }, y0: number, since: number | undefined): number {
  if (since === undefined) return y0;
  return y0 - (y0 - f.y1) * Math.max(0, Math.min(1, since / f.seconds));
}

/** seconds for one log to cross the whole window, hidden end to hidden end */
export const driftCycle = (d: DriftInfo) => (d.x1 - d.x0 + d.width) / d.speed;

/** where a log's left edge is at game time `t` */
export function driftX(d: DriftInfo, t: number): number {
  const T = driftCycle(d);
  const u = cyclePos(t, d.offset, T);
  const travelled = u * d.speed;
  return d.dir === 1 ? d.x0 - d.width + travelled : d.x1 - travelled;
}

/**
 * The log's knock (reference/design/2-1.md NEW 2, Bit.Trip Runner's beat): how many times this log slid out from under its bank between
 * clock readings t0 and t1 (0 or 1 a step at 30 fps). A log's cycle starts with its front edge at the bank's lip (driftX: x0 - width for
 * a river with him, x1 against), so the count is the cycle passing its start: the beat is the river's own spacing, never a timer of its
 * own. A clock that stands or runs back (a sluice's, logClock) knocks nothing.
 */
export function logKnocks(d: DriftInfo, t0: number, t1: number): number {
  if (!(t1 > t0)) return 0;
  const T = driftCycle(d);
  return Math.floor((t1 + d.offset) / T) - Math.floor((t0 + d.offset) / T);
}

/** how far the log has crossed, 0 (just out from under its bank) to 1 (about to slide under the far one) */
export function driftProgress(d: DriftInfo, t: number): number {
  const T = driftCycle(d);
  return cyclePos(t, d.offset, T) / T;
}

/** how the log sits relative to the water: how deep its middle is below the surface */
export const LOG_DROP = 28;
export const LOG_HEIGHT = 28;
/** a log's top edge hangs this far below the bank tops, so the hop on and off is a small one */
export const surfaceBelowBank = LOG_DROP + LOG_HEIGHT / 2;

export interface RiverRecipe {
  dir: 1 | -1;
  speed: number;
  logW: number;
  /** edge-to-edge space between neighbouring logs */
  gap: number;
  /** river width, bank to bank */
  width: number;
}

/**
 * The logs' spacing. Logs that flow the way you are running pull away while you are in the air, so the next one is further than
 * it looks: with the flow the gap stays moderate (a hop already has to reach the log's far end). Logs that flow toward you close
 * the gap while you jump, so they can sit much further apart. Either way the gap is wide enough that RUNNING across is never
 * possible: the player has to jump (the engine is strict about catching a falling player on a log, see `DRIFT_CATCH`).
 */
export function gapFor(dir: 1 | -1, speed: number): number {
  return dir === 1 ? 72 : Math.round(96 + speed * 0.2);
}

/** how forgiving a log is to a player who runs off the end of one: much less than ground, so a gap has to be jumped */
export const DRIFT_CATCH = { side: 0.3, drop: 8, easySide: 0.1 } as const;
// (Easy, LV-5: a kid's hop that comes down on a log's very end still lands, as on a ledge, a foot wider and with the ledge-landing
// forgiveness for a jump that falls a little short; walking off a log's end still falls. The kid bot drowned 84-114 times in 2-1 on Easy
// against 74-87 for the adult on Normal, nearly all of them hopping onto drifting logs)

/**
 * The rivers of a World 2 stage, in order. Stage 1: one slow river with the flow. Stages 2-3: two, one of them against the flow.
 * Stages 4-5: faster, both ways. Stages 6-8: rapids, narrower logs, three rivers. Stage 9: the long mixed run. The boss lair has none.
 */
export function riverRecipes(mini: number): RiverRecipe[] {
  const table: Array<Array<[1 | -1, number]>> = [
    [[1, 70]],
    [[1, 75]],
    [[1, 75], [-1, 70]],
    [[-1, 80], [1, 80]],
    [[-1, 85], [-1, 90]],
    [[1, 100], [-1, 105]],
    [[1, 105], [-1, 110], [1, 100]],
    [[-1, 115], [1, 110], [-1, 115]],
    [[1, 100], [-1, 110], [1, 120]],
  ];
  const row = table[Math.max(0, Math.min(table.length - 1, mini - 1))];
  const logW = Math.round(170 - (Math.min(mini, 9) - 1) * 5);
  return row.map(([dir, speed], i) => {
    const gap = Math.round(gapFor(dir, speed));
    // about three logs on the water at once; the last river of the long stage is the longest. The window is an exact whole number of
    // log spacings (minus one log length), so the logs sit at an even spacing all the way round
    const logs = 3 + (mini >= 6 ? 1 : 0) + (mini === 9 && i === 1 ? 1 : 0);
    return { dir, speed, logW, gap, width: (logs + 1) * (logW + gap) - logW };
  });
}

/** the logs of one river: how many, and when each starts so they are evenly spaced along the current */
export function logLayout(r: RiverRecipe): { count: number; period: number } {
  const T = (r.width + r.logW) / r.speed;
  const spacing = (r.logW + r.gap) / r.speed;
  const count = Math.max(2, Math.round(T / spacing));
  return { count, period: T };
}
