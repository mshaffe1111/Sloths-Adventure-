/**
 * The FLOOD CLOCK (2-8 "Walk Them Home", reference/design/2-8.md NEW 1 and "The flood's rules"): one clock per stage, started by a goal
 * item (the last cage he frees, in met order), raising every flood-marked water to paddling depth over its own `seconds`; the LOW ROAD's
 * water (the one water marked to close) turns DEEP `close` s after the start: a wall the line waits at, lethal to him like any deep water.
 * Nothing drains and a respawn never resets it (the high road is always there). Every other water stops at paddling depth.
 *
 * Its fairness is the design's flown rule, checked on the LAID stage (floodFaults, the way pacer.ts pacerFaults guards the race): the line,
 * not Pokey, sets the time (its pace is under every tier's run, 2-8.md:19), so the close must come at least `spare` s after the line's
 * PROMPT tail-off of the low road, at the setting's flown rate over the laid route from the start to off the low road. A close no tier can
 * beat with that spare is refused by name.
 *
 * Pure data and arithmetic: the lay is gen2/floodLay.ts, the runtime FloodClock below (the engine steps it). No stage id, world number,
 * seed or x.
 */
import { floodLevel } from './river.ts';

/** a world's flood table (the designer's flown numbers, 2-8.md "FLOWN"; a graph's brief names it: GraphBrief.flood) */
export interface FloodRow {
  /** T_CLOSE: s after the clock starts that the low road turns deep, by setting (2-8.md:16) */
  close: { normal: number; easy: number };
  /** s the close must come after the line's prompt tail-off of the low road, by setting (2-8.md:58: + 4 s Normal, + 8 s Easy) */
  spare: { normal: number; easy: number };
  /** the leg the flights measured: px from the turn (the last cage) to off the low road, and the prompt line's tail-off time over it (s),
   *  by setting (2-8.md:8-9, :13). The line's rate over any laid leg is that px over that time (its waits and its length included) */
  flown: { px: number; tailOff: { normal: number; easy: number } };
}

/** one water the clock raises (a river of the stage, by index) */
export interface FloodWater {
  river: number;
  x0: number;
  x1: number;
  /** its surface before the clock starts */
  y0: number;
  /** paddling depth: the surface it rises to over `seconds` (never over its banks' lips: `lip`); the lay rises every water over the
   *  close (one clock: each reaches paddling depth as the low road turns deep, gen2/floodLay.ts), no number of its own */
  y1: number;
  seconds: number;
  /** the top of the banks either side (the lower of the two): paddling water stays at or under it */
  lip: number;
  /**
   * the LOW ROAD: at the close it turns deep (its surface `y`, a wall the line waits at), and a little one paddling in it then is set on
   * its NEAR bank (`near`: the bank on the clock's start side, by met order; where it sits in the reeds and waits for him)
   */
  deep?: { y: number; near: { x: number; y: number } };
}

/** a laid flood (GeneratedStage.flood) */
export interface Flood {
  /** the goal item that starts the clock (the last cage met, gen2/floodLay.ts): its collectible id and place */
  start: { id: number; x: number; y: number };
  /** s after the start the low road turns deep (the setting's FloodRow.close) */
  close: number;
  waters: FloodWater[];
  /** the line's prompt tail-off of the low road on this laid stage (s from the start), and the spare the rule asks over it */
  tailOff: number;
  spare: number;
  /** px along the route from the start to off the low road (the tail-off's leg) */
  px: number;
}

/** the line's prompt tail-off (s) over `px` of route at the setting's flown rate (FloodRow.flown) */
export function floodTailOff(row: FloodRow, px: number, easy: boolean): number {
  const t = easy ? row.flown.tailOff.easy : row.flown.tailOff.normal;
  return (px * t) / row.flown.px;
}

/** a water's surface `since` s after the clock started (undefined: not started) */
export function floodSurface(f: Pick<Flood, 'close'>, w: FloodWater, since: number | undefined): number {
  if (since === undefined) return w.y0;
  if (w.deep && since >= f.close) return w.deep.y;
  return floodLevel({ y1: w.y1, seconds: w.seconds }, w.y0, since);
}

/** has the low road turned deep `since` s after the start */
export const floodDeep = (f: Pick<Flood, 'close'>, w: FloodWater, since: number | undefined): boolean => !!w.deep && since !== undefined && since >= f.close;

/**
 * The flood's rules on a laid flood, by name (empty: fair). 2-8.md:45-49, :57-58: one water turns deep (the low road) and the rest stop at
 * paddling depth, never over their banks; the close comes at least the spare after the line's prompt tail-off; the start is a goal item.
 */
export function floodFaults(f: Flood): string[] {
  const out: string[] = [];
  const R = (v: number) => Math.round(v * 10) / 10;
  const deep = f.waters.filter((w) => w.deep);
  if (deep.length !== 1) out.push(`flood: ${deep.length} waters turn deep: the low road is the only one (every other stops at paddling depth)`);
  for (const w of f.waters) {
    if (w.y1 < w.lip - 1e-6) out.push(`flood: the water at x ${Math.round(w.x0)}-${Math.round(w.x1)} rises to ${Math.round(w.y1)}, ${Math.round(w.lip - w.y1)} px over its banks: paddling depth stays under them`);
    if (!(w.seconds > 0)) out.push(`flood: the water at x ${Math.round(w.x0)}-${Math.round(w.x1)} rises in ${w.seconds} s`);
  }
  if (!(f.close > 0)) out.push(`flood: its close (${f.close} s) is not after the start`);
  if (f.close < f.tailOff + f.spare - 1e-6)
    out.push(`flood: the low road turns deep ${R(f.close)} s after the last cage, but the line's prompt tail-off of it is ${R(f.tailOff)} s (${Math.round(f.px)} px) and the rule asks ${R(f.spare)} s more: no tier beats it (${R(f.tailOff + f.spare - f.close)} s short)`);
  return out;
}

/**
 * The high road round the low road (2-8.md:58: always laid and walkable by the line: steps of at most `step` px up or down, no climb, no
 * fall): the solid pieces over the low road's span (`x0..x1`, from its near bank's top `from` to its far bank's top `to`) must chain from
 * bank to bank, each top within `step` px of the one before and each gap a hop of at most `hop` px. By name; empty: walkable.
 */
export function highRoadFaults(tops: ReadonlyArray<{ x: number; w: number; y: number }>, span: { x0: number; x1: number; from: { x: number; y: number }; to: { x: number; y: number } }, step: number, hop: number): string[] {
  const dir = span.to.x >= span.from.x ? 1 : -1;
  const over = tops.filter((p) => p.x < span.x1 && p.x + p.w > span.x0 && p.y < Math.min(span.from.y, span.to.y) + step).sort((a, b) => (a.x - b.x) * dir);
  const out: string[] = [];
  let at = { x: span.from.x, y: span.from.y };
  for (const p of over) {
    const near = dir > 0 ? p.x : p.x + p.w;
    const gap = (near - at.x) * dir;
    if (gap > hop) out.push(`flood: the high road has a ${Math.round(gap)} px gap at x ${Math.round(near)} (a hop for the line is at most ${hop})`);
    if (Math.abs(p.y - at.y) > step) out.push(`flood: the high road steps ${Math.round(Math.abs(p.y - at.y))} px at x ${Math.round(near)} (the line takes at most ${step})`);
    at = { x: dir > 0 ? p.x + p.w : p.x, y: p.y };
  }
  if (!over.length) out.push(`flood: no high road over the low road at x ${Math.round(span.x0)}-${Math.round(span.x1)}`);
  else {
    const gap = (span.to.x - at.x) * dir;
    if (gap > hop) out.push(`flood: the high road ends ${Math.round(gap)} px short of the far bank (a hop for the line is at most ${hop})`);
    if (Math.abs(span.to.y - at.y) > step) out.push(`flood: the high road steps ${Math.round(Math.abs(span.to.y - at.y))} px onto the far bank (the line takes at most ${step})`);
  }
  return out;
}

/**
 * The runtime clock: started once, when the start cage is freed (never reset: a respawn keeps it; nothing drains). Each step gives every
 * water's surface and the waters that turned deep this step (the engine sets the rivers' surfaces and the line's set-backs from them).
 */
export class FloodClock {
  at: number | undefined;
  private closed = new Set<FloodWater>();
  constructor(readonly f: Flood) {}
  /** the cage with collectible id `id` was freed at game time `t` (only the start cage starts it; once) */
  freed(id: number, t: number): boolean {
    if (id !== this.f.start.id || this.at !== undefined) return false;
    this.at = t;
    return true;
  }
  since(now: number): number | undefined {
    return this.at === undefined ? undefined : now - this.at;
  }
  step(now: number): { levels: number[]; closed: FloodWater[] } {
    const since = this.since(now);
    const closed: FloodWater[] = [];
    const levels = this.f.waters.map((w) => {
      if (floodDeep(this.f, w, since) && !this.closed.has(w)) {
        this.closed.add(w);
        closed.push(w);
      }
      return floodSurface(this.f, w, since);
    });
    return { levels, closed };
  }
}
