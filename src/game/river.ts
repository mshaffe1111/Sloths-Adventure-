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
}

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
  /** water crossed some other way, with no logs on it (swung over on the vines of 2-4) */
  open?: boolean;
  /**
   * 2-8 Reed Cages: still water that rises once he passes `trigger`, from where it starts to `y1` over `seconds`, covering the low reed
   * islands in it (the banks stay dry). Back to where it started when he respawns. `y0` is filled in by the engine (the starting level).
   */
  flood?: { y1: number; seconds: number; trigger: number; y0?: number };
}

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
  const u = (((t + d.offset) % T) + T) % T;
  const travelled = u * d.speed;
  return d.dir === 1 ? d.x0 - d.width + travelled : d.x1 - travelled;
}

/** how far the log has crossed, 0 (just out from under its bank) to 1 (about to slide under the far one) */
export function driftProgress(d: DriftInfo, t: number): number {
  const T = driftCycle(d);
  return ((((t + d.offset) % T) + T) % T) / T;
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
export const DRIFT_CATCH = { side: 0.3, drop: 8 } as const;

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
