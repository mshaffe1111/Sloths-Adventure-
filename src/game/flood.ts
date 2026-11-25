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
import { JUMP_AIRTIME, PHYS } from './physics.ts';

/** his collider's height (px; engine.ts:1223, the player box 44 x 48): a piece whose bottom is over the road's top by less is in his way */
const HEAD = 48;

/** a world's flood table (the designer's flown numbers, 2-8.md "FLOWN"; a graph's brief names it: GraphBrief.flood) */
export interface FloodRow {
  /** T_CLOSE: s after the clock starts that the low road turns deep, by setting (2-8.md:16) */
  close: { normal: number; easy: number };
  /** s the close must come after the line's prompt tail-off of the low road, by setting (2-8.md:58: + 4 s Normal, + 8 s Easy) */
  spare: { normal: number; easy: number };
  /** the leg the flights measured: px from the turn (the last cage) to off the low road, and the prompt line's tail-off time over it (s),
   *  by setting (2-8.md:8-9, :13). The line's rate over any laid leg is that px over that time (its waits and its length included) */
  flown: { px: number; tailOff: { normal: number; easy: number } };
  /** the FORK's wall-step numbers: each tier's modelled play from its landing on the wall-step W to the next high-road piece (forkFaults) */
  climb: FloodClimb;
  /** px: the line's step (the world's follow row's `step`, follow.ts): a drop deeper than it off an end of a high-road piece is a WAIT at
   *  the lip, so the line is stranded there (strandFaults) */
  step: number;
}

/** the tiers the fork is judged for (the bots' own: child, middle, expert, and the first-timer adult) */
export type FloodTier = 'child' | 'middle' | 'expert' | 'adult';

/** a world's WALL-STEP numbers (R-165.430's fork: a wall-step W on the bank that both roads climb; the low road walks off W down into the
 *  gap, the high road hops that gap onto the next piece). Each value DERIVED, never invented: the world's table cites its source */
export interface FloodClimb {
  /** px: his centre past W's NEAR face where the climb-jump from a stand at that face sets him down, by tier */
  land: Record<FloodTier, number>;
  /** px: the room he needs between that landing and W's FAR lip to take off from (his take-off aim before a lip), by tier */
  runUp: Record<FloodTier, number>;
  /** s: the small-ledge pause on W. It STOPS him: he restarts from a stand (its length is the clock's business, floodFaults) */
  pause: [number, number];
  /** px: his width. The way down onto the low road is a gap after W at least this wide (he falls through it) */
  width: number;
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
 * fall): from the near bank's top (`span.from`) a chain of solid pieces, each met next in the way he goes, each reached from the one before
 * by a step of at most `step` px and a gap of at most `hop` px, out over the low road's span (`x0..x1`) to its far bank's top (`span.to`).
 * Pieces out of that reach (a leg laid far above) are no part of it. Its FIRST piece is a WALL-STEP (the lead's ruling on ENG-28's late
 * case): its face stands on the near bank (its near side at or before the bank's edge, `span.from.x`) and reaches down to the bank's top
 * (`h`, its height: y + h at or under span.from.y), so he walks into it and climbs it. A first piece out over the edge, or floating over the
 * bank with room under it, is a BARE EDGE HOP up off the bank, which nobody is shown and the tier bots' edge press does not aim at: refused
 * by name. By name; empty: walkable.
 */
export function highRoadFaults(tops: ReadonlyArray<{ x: number; w: number; y: number; h?: number }>, span: { x0: number; x1: number; from: { x: number; y: number }; to: { x: number; y: number } }, step: number, hop: number, jump = hop): string[] {
  return highRoad(tops, span, step, hop, jump).faults;
}

/**
 * The FORK at the high road's first piece, the wall-step W (the lead's ruling on ENG-28's fork, R-165.430), both halves by name:
 * (1) a WAY DOWN from W onto the low road: the gap after W (to the high road's next piece) at least his width, so he falls through it;
 * (2) that gap CROSSED by each tier's own modelled play from its landing on W: he lands `land` px past W's near face, the small-ledge pause
 *     stops him, he restarts from a stand (PHYS.groundAcc to PHYS.maxRun) and needs `runUp` px of W before its far lip to take off from.
 *     Short of it he walks off the lip and a walk-off crosses no gap; with it, a full jump at the speed his run reached (the air pushing
 *     him on to PHYS.maxRun over JUMP_AIRTIME) must carry him from his take-off past the gap.
 * `chain` is highRoad's (W first, the next piece second). By name; empty: fair.
 */
export function forkFaults(chain: ReadonlyArray<{ x: number; w: number; y: number }>, span: { from: { x: number }; to: { x: number } }, climb: FloodClimb): string[] {
  const [w, next] = chain;
  if (!w || !next) return [];
  const dir = span.to.x >= span.from.x ? 1 : -1;
  const farLip = dir > 0 ? w.x + w.w : w.x;
  const gap = Math.round((dir > 0 ? next.x - farLip : farLip - (next.x + next.w)) * 10) / 10;
  const at = `the wall-step at x ${Math.round(w.x)}-${Math.round(w.x + w.w)}`;
  const out: string[] = [];
  if (gap < climb.width) out.push(`flood: ${at} has no way down onto the low road: the gap after it is ${gap} px, under his ${climb.width} px width (the low road falls through it)`);
  for (const tier of Object.keys(climb.land) as FloodTier[]) {
    const room = w.w - climb.land[tier];
    const runUp = climb.runUp[tier];
    if (room < runUp) {
      if (gap > 0) out.push(`flood: on ${at} the ${tier} lands ${climb.land[tier]} px past its face and has ${Math.round(room)} px to its lip, short of his ${runUp} px run-up: he walks off into the ${gap} px gap (W at least ${climb.land[tier] + runUp} px wide)`);
      continue;
    }
    // (a stand start over room - runUp px, then a full jump runUp px before the lip; the air takes him on to a full run)
    const v = Math.min(PHYS.maxRun, Math.sqrt(2 * PHYS.groundAcc * (room - runUp)));
    const tUp = (PHYS.maxRun - v) / PHYS.airAcc;
    const reach = tUp >= JUMP_AIRTIME ? v * JUMP_AIRTIME + (PHYS.airAcc * JUMP_AIRTIME ** 2) / 2 : ((v + PHYS.maxRun) / 2) * tUp + PHYS.maxRun * (JUMP_AIRTIME - tUp);
    if (reach < runUp + gap) out.push(`flood: from ${at} the ${tier}'s jump ${runUp} px before its lip at ${Math.round(v)} px/s reaches ${Math.round(reach)} px, short of the ${gap} px gap past it`);
  }
  return out;
}

/**
 * THE STRAND VERDICT (BUILD-28 1e, the walk-off model, carry 0). He can walk off EITHER end of any piece of the high road (traced: the
 * adult turned back on the top and walked off its near edge), and the line follows him down only a drop of at most its step (follow.ts
 * record: deeper is a WAIT at the lip, and he goes on alone). So just outside each end of each piece of `chain`, the first ground under it
 * (a top in `tops` at or below the piece's top, else `under(x)`: the low road's floor or water there, or a bank) lies at most `step` below
 * the piece's top. By name; empty: fair. Laid by floodLay (gen2/floodLay.ts) after forkFaults, with the row's `step` (FloodRow.step).
 */
export function strandFaults(chain: ReadonlyArray<{ x: number; w: number; y: number }>, tops: ReadonlyArray<{ x: number; w: number; y: number }>, under: (x: number) => number, step: number): string[] {
  const out: string[] = [];
  for (const q of chain) {
    for (const [x, side] of [[q.x - 1, 'left'], [q.x + q.w + 1, 'right']] as const) {
      let g = under(x);
      for (const t of tops) if (t !== q && x >= t.x && x <= t.x + t.w && t.y >= q.y - 0.5 && t.y < g) g = t.y;
      if (g - q.y > step) out.push(`flood: off the ${side} end of the high road's piece at x ${Math.round(q.x)}-${Math.round(q.x + q.w)} the first ground is ${Math.round(g - q.y)} px down, deeper than the line's ${step} px step: he walks off it and the line waits at its lip (stranded)`);
    }
  }
  return out;
}

/**
 * THE LOW ROAD'S HOP (BUILD-28 session 6, the lead's ruling (c)): his ORDINARY hop from the low road's floor never lands him on the high
 * road, so the choice of road stays his (a DOUBLE jump up off it is his own move onto the high road: both go home). No piece stops a hop
 * from below, thin or block (A0, BUILD-28's probe-a0: the engine stops him only at a block's faces), so every piece of `chain` standing
 * over the low road's walked floor (`floor`: its x span and its top) has its top more than `hop.reach` (a single full jump's rise plus the
 * engine's landing catch, the most generous setting) plus `hop.margin` over that floor. By name; empty: fair. Laid by floodLay.
 */
export function lowHopFaults(chain: ReadonlyArray<{ x: number; w: number; y: number }>, floor: { x0: number; x1: number; y: number }, hop: { reach: number; margin: number }): string[] {
  const out: string[] = [];
  for (const q of chain) {
    if (q.x + q.w <= floor.x0 || q.x >= floor.x1) continue;
    const over = Math.round((floor.y - q.y) * 10) / 10;
    if (over < hop.reach + hop.margin) out.push(`flood: the high road's piece at x ${Math.round(q.x)}-${Math.round(q.x + q.w)} stands ${over} px over the low road's floor (x ${Math.round(floor.x0)}-${Math.round(floor.x1)}), within a single jump's reach ${hop.reach} px + its ${hop.margin} px margin: his ordinary hop off the low road lands him on the high road`);
  }
  return out;
}

/** the high road itself (highRoadFaults' walk): its pieces in the order he meets them (the bot's way round, lead-the-line), and the faults
 *  by name (empty: walkable) */
export function highRoad<T extends { x: number; w: number; y: number; h?: number }>(tops: ReadonlyArray<T>, span: { x0: number; x1: number; from: { x: number; y: number }; to: { x: number; y: number } }, step: number, hop: number, jump = hop): { chain: T[]; faults: string[] } {
  const dir = span.to.x >= span.from.x ? 1 : -1;
  const nearOf = (p: { x: number; w: number }) => (dir > 0 ? p.x : p.x + p.w);
  const farOf = (p: { x: number; w: number }) => (dir > 0 ? p.x + p.w : p.x);
  const beyond = (a: number, b: number) => (a - b) * dir;
  let at = { x: span.from.x, y: span.from.y };
  const chain: T[] = [];
  for (;;) {
    const used = chain.length;
    // (done when the far bank is a step and a hop from here)
    if (used && beyond(span.to.x, at.x) <= hop && Math.abs(span.to.y - at.y) <= step) return { chain, faults: [] };
    // (the next piece: it starts within a hop ahead of here (or under him already), goes on past here, and is a step up, level or down;
    //  the first may stand back on the near bank: its far side at most a hop before the edge, a step down off it onto the bank. Every step
    //  UP is a WALL-STEP: its face where he stands, reaching down to his feet, so he walks into it and climbs; a piece up off an edge with
    //  room under it is a bare edge hop up, which nobody is shown and the tier bots' edge press does not aim at)
    let next: T | undefined;
    let bare: T | undefined;
    for (const p of tops) {
      // (the FORK's link, off the wall-step W to a LEVEL piece, may be a jump up to `jump` px (the lead's entry principle, BUILD-28 session
      //  7: a run off W takes the low road, a press the high road, so that gap is wider than his full-run walk-off carry, floodLay
      //  FLOOD_WALK_OFF; forkFaults proves each tier's jump crosses it); every other link is a hop of at most `hop`. So W may stand back
      //  on the near bank up to `jump` px before its edge: the gap stays over the bank, and a walk-off back off the porch's near end
      //  lands on the bank, within the line's step: strandFaults)
      const reach = used === 1 && Math.abs(p.y - at.y) <= 1 ? Math.max(hop, jump) : hop;
      if (beyond(nearOf(p), at.x) > reach || beyond(farOf(p), at.x) <= (used ? 1 : -Math.max(hop, jump) - 1) || Math.abs(p.y - at.y) > step) continue;
      if (p.y < at.y - 1 && !(beyond(nearOf(p), at.x) <= 0 && p.h !== undefined && p.y + p.h >= at.y - 1)) {
        if (!bare || beyond(farOf(p), farOf(bare)) > 0) bare = p;
        continue;
      }
      if (!next || beyond(farOf(p), farOf(next)) > 0) next = p;
    }
    if (!next && bare) {
      const up = Math.round(at.y - bare.y);
      return { chain, faults: [used ? `flood: the high road climbs by a bare edge hop up at x ${Math.round(nearOf(bare))} (${up} px up off the piece at x ${Math.round(at.x)}): every step up is a wall-step he walks into and climbs` : `flood: the high road starts with a bare edge hop at x ${Math.round(nearOf(bare))}: its first piece (${up} px up) is not a wall-step standing on the near bank that he walks into and climbs`] };
    }
    if (!next) {
      if (!used) return { chain, faults: [`flood: no high road over the low road at x ${Math.round(span.x0)}-${Math.round(span.x1)} (no piece a step of at most ${step} px off its near bank)`] };
      return { chain, faults: [`flood: the high road breaks at x ${Math.round(at.x)}: no piece or far bank within a step of ${step} px and a hop of ${hop} px from there`] };
    }
    // (EVERY piece in his way on it is met in order, never skipped by a jump to its far end (the lead's ruling, R-165.430, BUILD-28): a
    //  piece whose near side lies ahead of where he steps on and before its far end, its bottom over its top and under his head (his
    //  collider's HEAD px). Standing on it and at most a step tall: a wall-step, he climbs it and goes on from it; taller: a wall; with room
    //  under it: a bare edge hop up. By name)
    let cur = next;
    let enter = beyond(nearOf(cur), at.x) > 0 ? nearOf(cur) : at.x;
    chain.push(cur);
    for (;;) {
      let q: T | undefined;
      for (const p of tops) {
        const bottom = p.y + (p.h ?? 0);
        if (p === cur || beyond(nearOf(p), enter) <= 0 || beyond(nearOf(p), farOf(cur)) >= 0 || bottom > cur.y + 1 || bottom < cur.y - HEAD) continue;
        if (!q || beyond(nearOf(p), nearOf(q)) < 0) q = p;
      }
      if (!q) break;
      const up = Math.round(cur.y - q.y);
      if (q.y + (q.h ?? 0) < cur.y - 1) return { chain, faults: [`flood: the high road climbs by a bare edge hop up at x ${Math.round(nearOf(q))} (${up} px up off the piece at x ${Math.round(nearOf(cur))}, ${Math.round(cur.y - q.y - (q.h ?? 0))} px of room under it): every step up is a wall-step he walks into and climbs`] };
      if (up > step) return { chain, faults: [`flood: the high road meets a wall ${up} px tall at x ${Math.round(nearOf(q))} on the piece at x ${Math.round(nearOf(cur))}: every step up is at most ${step} px`] };
      chain.push(q);
      cur = q;
      enter = nearOf(q);
    }
    // (a loop is no ground gained. A piece met AGAIN further along is not one: he comes back down onto a block past the far end of the block
    //  standing on it (three up, three down: the top, then the rise's far tread). Counting pieces (the chain longer than the tops) refused
    //  every such stair, W2-LANE b's trace of the 80 px treads, BUILD-28)
    const was = at.x;
    at = { x: farOf(cur), y: cur.y };
    // (the first piece may stand back on the near bank, its far side short of the edge: no ground gained there by design)
    if (used && beyond(at.x, was) <= 0) return { chain, faults: ['flood: the high road loops'] };
  }
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
  /** is (x, y) in a water that has turned deep by `now`: within its span, at or under its banks' top (a wall the line waits at) */
  deepAt(x: number, y: number, now: number): boolean {
    const since = this.since(now);
    return this.f.waters.some((w) => floodDeep(this.f, w, since) && x > w.x0 && x < w.x1 && y > w.lip - 2);
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
