/**
 * gen2/tower: what a stage laid UP or DOWN needs that a run does not (R-165.170). A vertical stage is a zigzag tower, the shape the
 * engine already plays (stageModes.ts up / down): each section is a stretch of a storey, laid on from where the last one ended; where
 * the wall is near, or the floor is under him, the next one hangs a storey over (or under) it and runs back the other way, a climbing
 * vine between the two. The lay itself is pipeline.ts layStage (one code path for a run and a tower); this file holds the tower's
 * numbers and its pure pieces: the reflection of a section for a storey that runs left, the clearance a storey keeps from the one it
 * lies over, the route measure (how far along the way a place is), the time a storey costs, and the tower's own verdicts.
 *
 * Nothing here names a stage, a seed or a place: a tower's width is its world's data (WorldManifest.tower).
 */
import { PHYS, DOUBLE_RISE, reachJump } from '../physics.ts';
import type { Platform, Vine } from '../types.ts';
import type { LocalLayout } from './pipeline.ts';

/** which way a graph is laid (MissionGraph.flow) */
export type Flow = 'right' | 'up' | 'down';
export const vertical = (flow: Flow): flow is 'up' | 'down' => flow !== 'right';

/** his body (the collider the engine moves: physics.ts), for the head room between storeys */
const BODY_H = 48;

/**
 * A tower's numbers.
 *   width     the tower's world width when its world names none (WorldManifest.tower.width): about three upright screens (one sideways),
 *             so a storey holds one to three sections before it turns
 *   wall      nothing is laid nearer a side than this (the engine keeps him inside [20, W - 20]; buildAscent's 70)
 *   clear     the least open height between a storey's floor and the underside of anything laid over it: a double jump's rise, his
 *             body and a margin, so no jump from the storey below lands on the one above (a storey is never skipped) and nothing
 *             hangs in a jump's way
 *   turn      the least a turn climbs or comes down: more than any jump, so the vine is the way
 *   fall      the most a miss may fall before sound wood catches him (STAGE-RULES §2 "Falls in climbs": one trunk section, 450 px)
 *   see       the most a way DOWN may drop him (a walk-off, a jump down, a hop off a vine) before the landing: the landing is in the
 *             view under his feet before he commits, upright and sideways (D46: no blind fall; cameraFollow.ts CLIMB_VIEW keeps this
 *             much under him on a way down in the short sideways view)
 *   vineIn    how far in from the tip of the ledge he leaves a turn's vine stands
 */
export const TOWER = {
  width: 1280,
  wall: 70,
  clear: Math.ceil(DOUBLE_RISE) + BODY_H + 24,
  turn: Math.ceil(DOUBLE_RISE) + 40,
  fall: 450,
  see: 300,
  vineIn: 44,
  /** a catch bough (STAGE-RULES §2 "Falls in climbs": a catch branch under the gap): under a storey's own gap it lies `hop` px under
   *  the lower lip, lip to lip (a fall in is one plain hop out, the tower's soft pit); under a storey's open end, where nothing
   *  else would catch within `fall` (or, going down, `see`), it is `catchW` wide, one storey's clearance down */
  hop: 70,
  catchW: 180,
  /** the summit's (or the crown's) plain ledge: the shrine stands on it, the totem `totem` px along it */
  summit: 420,
  totem: 250,
} as const;

/** the least a bough's top lies from the top of other wood it shares an x with: its thickness, his body and a margin (he walks under
 *  it; it is never a bough across his chest) */
const HEAD = 24 + BODY_H + 12;

/**
 * His jump, read GENEROUSLY (whatever the real engine can do, this says yes to): what the tower's own rules ask "could a jump get
 * there?" with, so a storey is never skipped. `up`: the highest a double jump climbs onto a lip (flown 214 px, reach.md §2; the
 * closed form DOUBLE_RISE is the apex of his feet), with a margin; `slack`: what the closed-form reach reads short across (reach.md
 * §4: 57-98 px for the double).
 */
export const LEAP = { up: Math.ceil(DOUBLE_RISE) + 36, slack: 100 } as const;
type Box = { x: number; y: number; width: number };
/** could a jump (a double, a fall included) take him from standing on `a` to standing on `b`? Generous: see LEAP */
export function leaps(a: Box, b: Box): boolean {
  const rise = a.y - b.y;
  if (rise > LEAP.up) return false;
  const gap = Math.max(0, b.x - (a.x + a.width), a.x - (b.x + b.width));
  return gap <= Math.max(0, reachJump(Math.max(-400, Math.min(rise, 150)), true)) + LEAP.slack;
}

/** a tower's soft pit: where a section's gap gets a catch bough (lip to lip, `hop` under its lower lip), its top's local y; undefined:
 *  none (a water gap, a slot too narrow to fall in, or a step taller than a hop, whose lower ledge is the catch already) */
export const gapCatchY = (g: { x0: number; x1: number; y: number; lo: number; water?: boolean }): number | undefined =>
  !g.water && g.x1 - g.x0 >= 50 && g.lo - g.y <= TOWER.hop + 20 ? g.lo + TOWER.hop : undefined;

/** the seconds a free fall of `px` takes (the engine's fall gravity, from rest) */
export const fallSeconds = (px: number): number => Math.sqrt((2 * Math.max(0, px)) / PHYS.gravDown);

/**
 * A section's local layout turned to run LEFT: every x mirrored about its entry (local 0), so its entry is still (0, 0) and it lies
 * in x from -width to 0. Heights are untouched: a rise is still a rise (which the lay's own `mirrored`, a re-ordering that keeps the
 * section running right, cannot promise: mirror.test.ts). Placed with the same `ox + x` as any layout.
 */
export function reflectLocal(L: LocalLayout): LocalLayout {
  return {
    ...L,
    pieces: L.pieces.map((p) => ({
      ...p,
      x: p.hang ? -p.x : -(p.x + p.w),
      ...(p.hang?.gap ? { hang: { ...p.hang, gap: [-p.hang.gap[1], -p.hang.gap[0]] as [number, number] } } : {}),
    })),
    gaps: L.gaps.map((g) => ({ ...g, x0: -g.x1, x1: -g.x0 })),
    ...(L.asks ? { asks: L.asks.map((k) => ({ ...k, x0: -k.x1, x1: -k.x0 })) } : {}),
    exit: { ...L.exit, x: -L.exit.x },
  };
}

/** how thick a laid piece is, as layStage's `mk` makes it aloft (a bank aloft is a slab `bankH` thick, never a column to the ground) */
export const pieceThick = (p: { shape: string; h: number }, bankH: number): number =>
  p.shape === 'bank' ? bankH : p.shape === 'branch' ? 24 : p.shape === 'stone' ? 22 : p.shape === 'hollow' ? 60 : Math.max(0, p.h);

/** a local layout's extent about its entry: the x it covers, how far its pieces reach under its entry (`low`, px down, 0 or more:
 *  undersides, vine feet and its gaps' catch boughs; `hang`: the lowest catch's top) and over it (`high`, px up, 0 or more) */
export function localExtent(L: LocalLayout, bankH: number): { x0: number; x1: number; low: number; high: number; hang: number } {
  let x0 = 0, x1 = 0, low = 0, high = 0, hang = 0;
  // (its gaps' catch boughs are its own wood: a storey laid over other wood keeps its clearance from their undersides too (`low`),
  // and a turn lifts the lowest one's top (`hang`, px under its entry) a turn over the ledge he leaves, so no catch is a rung)
  for (const g of L.gaps) { const cy = gapCatchY(g); if (cy !== undefined) { hang = Math.max(hang, cy); low = Math.max(low, cy + 24); } }
  for (const p of L.pieces) {
    x0 = Math.min(x0, p.x);
    x1 = Math.max(x1, p.x + (p.hang ? 0 : p.w));
    low = Math.max(low, p.hang ? p.y + p.h : p.y + pieceThick(p, bankH));
    high = Math.max(high, -p.y);
  }
  return { x0, x1, low, high, hang };
}

/**
 * Where a storey laid over [x0, x1] may put its entry so it clears everything already laid there (TOWER.clear of open height):
 * going UP, the highest y its entry may have (it must lie at or above it: a smaller y); going DOWN, the lowest (at or under it).
 * `low` / `high`: how far the storey's own pieces reach under / over its entry. Nothing laid in the span: no limit (±Infinity).
 */
export function storeyLimit(flow: 'up' | 'down', x0: number, x1: number, low: number, high: number, platforms: readonly Platform[], vines: readonly Vine[]): number {
  const inX = (a: number, b: number) => b > x0 + 2 && a < x1 - 2;
  if (flow === 'up') {
    let top = Infinity;
    for (const p of platforms) if (inX(p.x, p.x + p.width)) top = Math.min(top, p.y);
    for (const v of vines) if (inX(v.x - 1, v.x + 1)) top = Math.min(top, v.topY);
    return top - TOWER.clear - low;
  }
  let foot = -Infinity;
  for (const p of platforms) if (inX(p.x, p.x + p.width)) foot = Math.max(foot, p.y + p.height);
  for (const v of vines) if (inX(v.x - 1, v.x + 1)) foot = Math.max(foot, v.bottomY);
  return foot + TOWER.clear + high;
}

// ───────────────────────────── the route measure (piece 2: along the route) ─────────────────────────────

/** a laid section's place on the route: where it is entered and left, and the route px before it (`s0`) and through it (`len`) */
export interface RouteLeg { uid: string; entry: { x: number; y: number }; exit: { x: number; y: number }; x0: number; x1: number; s0: number; len: number; /** the join before it: a turn's climb or descent, px (0: a walk on) */ join: number }
/** a stage's route: its legs in the order he meets them, its whole length from the spawn to the totem, and the part of it he WALKS
 *  (`walk`: the px across, what the time model walks; the rest he climbs or comes down, on vines the model costs one by one) */
export interface Route { flow: Flow; legs: RouteLeg[]; length: number; walk: number; spawn: { x: number; y: number }; exit: { x: number; y: number } }

/** the px of route between two places of one storey stretch: what he walks plus what he climbs or comes down (his way through a
 *  stretch runs on and up, or on and down, never back: so the two add) */
const span = (a: { x: number; y: number }, b: { x: number; y: number }): number => Math.abs(b.x - a.x) + Math.abs(b.y - a.y);

/**
 * The route of a laid stage, from its sections in order. On a RUN there are no legs to add up: the measure is x, as every rule has
 * always counted it (routeAt below returns x itself, so nothing a run's rules read moves). On a tower each leg is the px walked and
 * climbed from its entry to its exit, after the join that leads to it.
 */
export function routeOf(flow: Flow, sections: ReadonlyArray<{ uid: string; entry: { x: number; y: number }; exit: { x: number; y: number }; x0: number; x1: number }>, spawn: { x: number; y: number }, exit: { x: number; y: number }): Route {
  const legs: RouteLeg[] = [];
  let s = 0, walk = 0;
  let at = spawn;
  for (const q of sections) {
    const join = span(at, q.entry);
    s += join;
    const len = span(q.entry, q.exit);
    walk += Math.abs(q.entry.x - at.x) + Math.abs(q.exit.x - q.entry.x);
    legs.push({ uid: q.uid, entry: { ...q.entry }, exit: { ...q.exit }, x0: q.x0, x1: q.x1, s0: s, len, join: legs.length ? join : 0 });
    s += len;
    at = q.exit;
  }
  return { flow, legs, length: s + span(at, exit), walk: walk + Math.abs(exit.x - at.x), spawn: { ...spawn }, exit: { ...exit } };
}

/**
 * How far along the route a place is (px from the spawn). A run: its x from the spawn, exactly. A tower: the leg it lies in, then the
 * px walked and climbed from that leg's entry, never past the leg's end. The leg is the one whose stretch is nearest: by HEIGHT
 * first (how far the place lies over or under the heights the leg spans: a storey is a turn from the next), then by how far it lies
 * off the leg's ends in x; so the spawn, a run-on to a wall or a catch at a storey's height belongs to that storey, never to the one
 * over it that happens to share its x. A place before a leg's entry (the spawn before the first section, the ledge a turn's vine
 * stands on) is that far short of the leg's start, never short of the leg before.
 */
export function routeAt(route: Route, x: number, y: number): number {
  if (!vertical(route.flow)) return x - route.spawn.x;
  let k = -1, bestD = Infinity;
  route.legs.forEach((g, i) => {
    const lo = Math.min(g.entry.y, g.exit.y), hi = Math.max(g.entry.y, g.exit.y);
    const dy = y < lo ? lo - y : y > hi ? y - hi : 0;
    const dx = x < g.x0 ? g.x0 - x : x > g.x1 ? x - g.x1 : 0;
    const d = dy * 8 + dx;
    if (d < bestD) { k = i; bestD = d; }
  });
  if (k < 0) return 0;
  const best = route.legs[k];
  const way = best.exit.x < best.entry.x ? -1 : 1;
  const short = (best.entry.x - x) * way;
  if (short > 0) return Math.max(k ? route.legs[k - 1].s0 + route.legs[k - 1].len : 0, best.s0 - short);
  const lo = Math.min(best.entry.y, best.exit.y), hi = Math.max(best.entry.y, best.exit.y);
  const dx = Math.min(Math.abs(best.exit.x - best.entry.x), Math.abs(Math.max(best.x0, Math.min(best.x1, x)) - best.entry.x));
  const dy = Math.abs(Math.max(lo, Math.min(hi, y)) - best.entry.y);
  return best.s0 + Math.min(best.len, dx + dy);
}

/**
 * Which way the VIEW leads on this stage, for the climb camera (cameraFollow.ts travelFeet): its travel's own lead (StageMode.lead)
 * on a stage laid as a tower, -1 up, 1 down; 0 on every other stage, which keeps the framing it has. A tower's storeys are laid with
 * the next one a turn over him, and the framing is sized to that (tower.test.ts); the shipped climbs of the old generator (and the
 * way down) have rising water, lava and mist under him and their own framing rules, and are not moved here: each is looked at when it
 * is rebuilt as a tower, or by a packet of its own.
 */
export function towerLead(stage: object, mode: { lead(): { dx: number; dy: number } }): number {
  return (stage as { gen2?: { tower?: unknown } }).gen2?.tower ? mode.lead().dy : 0;
}

/**
 * A stage's flags in the order he meets them: along the route where the stage has one (a gen2 tower), by x on any other stage, as
 * ever. What "every second flag" means for the hearts laid by the flags (stageGenerator.ts): in a tower x runs both ways, and a
 * sort by x picks flags from any storey.
 */
export function flagsInOrder<T extends { x: number; y: number }>(stage: object, flags: readonly T[]): T[] {
  const route = (stage as { gen2?: { tower?: { route?: Route } } }).gen2?.tower?.route;
  return [...flags].sort(route ? (a, b) => routeAt(route, a.x, a.y) - routeAt(route, b.x, b.y) : (a, b) => a.x - b.x);
}

// ───────────────────────────── the tower's verdicts ─────────────────────────────

/** the top of the first sound piece under (x, y), within `reach` px; undefined: nothing catches */
function catchUnder(platforms: readonly Platform[], x: number, y: number, reach: number): number | undefined {
  let best: number | undefined;
  for (const p of platforms) {
    if (p.type === 'fragile' || x < p.x || x > p.x + p.width || p.y <= y + 1 || p.y > y + reach) continue;
    if (best === undefined || p.y < best) best = p.y;
  }
  return best;
}

/** where stepping off either end of a standable piece falls further than `most` px (or out of the tower): the open ends a catch is
 *  owed. An end at a wall is no end: the engine keeps him inside [20, width - 20] */
export function openEnds(platforms: readonly Platform[], floorY: number, most: number, width: number): Array<{ p: Platform; x: number; drop: number }> {
  const out: Array<{ p: Platform; x: number; drop: number }> = [];
  for (const p of platforms) {
    if (p.type !== 'solid' || p.y >= floorY - 1) continue;
    for (const x of [p.x - 24, p.x + p.width + 24]) {
      if (x < 20 || x > width - 20) continue;
      // (a neighbour at the same height, or one he walks onto: no fall there)
      if (platforms.some((q) => q !== p && q.type !== 'fragile' && x >= q.x && x <= q.x + q.width && q.y <= p.y + 1 && q.y + q.height > p.y)) continue;
      const land = catchUnder(platforms, x, p.y, 100000);
      const drop = land === undefined ? Infinity : land - p.y;
      if (drop > most) out.push({ p, x, drop });
    }
  }
  return out;
}

/**
 * The catch boughs a tower's open ends are owed (each `[x, y, w]`, a plain bough): under every end whose fall is past the tower's
 * limit (going up TOWER.fall; going down TOWER.see, where the bough is the landing he can see). In this order:
 *   1. An end near a side of the tower runs on into the wall at its own height: no slot is left between a storey and the wall.
 *   2. A BRIDGE where the storey under it has wood in reach (a body's height down or more, within the limit): that wood run on,
 *      at its own height, out under the open end, so a miss costs one storey and he walks back onto the way. Next to a vine's top
 *      it starts a hop past the vine, never over it.
 *   3. Going up, the piece itself RUN ON to the nearer wall at its own height (no fall is left at that end).
 *   4. else a bough of its own under the end, lowered (never past the limit) until it is laid fairly.
 * Laid fairly (going up): `level` says which storey a piece is of (how many turns were laid before it). No bough lets a jump climb
 * a storey: none that wood of a lower storey could jump onto (LEAP, read generously) while a jump from it reaches wood of a higher
 * one. And none lies across other wood with less than his body between them (HEAD), nor over a jump its storey was laid with.
 * Laid until no open end is left, or a pass adds none (towerFalls then names what is left, and the roll is refused).
 */
export function towerCatches(flow: 'up' | 'down', platforms: readonly Platform[], vines: readonly Vine[], floorY: number, width: number, gaps: ReadonlyArray<{ x0: number; x1: number; y: number }> = [], level: (p: Platform) => number = () => 0, sealed: (p: Platform) => boolean = () => false): Array<{ x: number; y: number; w: number; level: number }> {
  const most = flow === 'up' ? TOWER.fall : TOWER.see;
  const all: Platform[] = [...platforms];
  const lv = new Map<Platform, number>(platforms.map((p) => [p, level(p)]));
  const out: Array<{ x: number; y: number; w: number; level: number }> = [];
  const put = (x0: number, x1: number, y: number, L: number) => {
    const c = { x: Math.round(x0), y: Math.round(y), w: Math.round(x1 - x0), level: L };
    out.push(c);
    const p = { id: -1 - out.length, x: c.x, y: c.y, width: c.w, height: 24, type: 'solid' } as Platform;
    all.push(p);
    lv.set(p, L);
  };
  const solid = (but: ReadonlyArray<Platform>) => all.filter((q) => !but.includes(q) && q.type === 'solid');
  // (wood in its way: across other wood at another height with less than his body between the two; `but`: the wood it is laid as
  // part of. Going down the old rule stands: only wood in the bough's own body)
  const cramped = (x0: number, x1: number, y: number, but: ReadonlyArray<Platform>) => solid(but).some((q) => q.x < x1 && q.x + q.width > x0 && Math.abs(q.y - y) > 1
    && (flow === 'up' ? Math.abs(q.y - y) < HEAD : q.y < y + 24 && q.y + q.height > y));
  // (a storey climbed by a jump: the bough, of storey `L` (or of a lower one, if wood of a lower one could jump onto it), with wood of
  // a higher storey inside a jump of it. Going down a bough is only ever a way on: nothing to guard)
  /** the storey a bough at (x0-x1, y) is of: `L`, or a lower one if wood of a lower one could jump onto it; -1: it climbs a storey */
  const storeyAt = (x0: number, x1: number, y: number, L: number, but: ReadonlyArray<Platform>): number => {
    if (flow !== 'up') return L;
    const box = { x: x0, y, width: x1 - x0 };
    const wood = solid(but);
    let mine = L;
    for (const q of wood) if (lv.get(q)! < mine && leaps(q, box)) mine = lv.get(q)!;
    return wood.some((q) => lv.get(q)! > mine && leaps(box, q)) ? -1 : mine;
  };
  // (a bridge or a run-on never closes a jump the storey it joins was laid with: a section's gap at its height keeps its hop)
  const overGap = (x0: number, x1: number, y: number) => gaps.some((g) => g.x0 < x1 - 2 && g.x1 > x0 + 2 && Math.abs(g.y - y) <= 100);
  // (a sealed piece, a gate: nothing of the lay's lies level with it or within a hop of it. Read as the verdict reads it, towerGates:
  // a bough from just under its level up to a jump over it, within a hop across of its span, would be a way round)
  const gates = platforms.filter(sealed);
  const hop = Math.max(0, reachJump(0, true)) + LEAP.slack;
  const byGate = (x0: number, x1: number, y: number) => gates.some((g) => y <= g.y + GATE_LEVEL && y >= g.y - LEAP.up && Math.max(0, x0 - (g.x + g.width), g.x - x1) <= hop);
  /** laid fairly: the storey it is of (storeyAt), or -1 when it is in the way, climbs a storey or lies by a gate */
  const fair = (x0: number, x1: number, y: number, L: number, but: ReadonlyArray<Platform>): number => (cramped(x0, x1, y, but) || byGate(x0, x1, y) ? -1 : storeyAt(x0, x1, y, L, but));
  for (let pass = 0; pass < 10; pass++) {
    const ends = openEnds(all, floorY, most, width);
    if (!ends.length) break;
    let added = 0;
    for (const e of ends) {
      // (an earlier bough of this pass may already catch it)
      if (catchUnder(all, e.x, e.p.y, most) !== undefined) continue;
      const Le = lv.get(e.p) ?? 0;
      const leftEnd = e.x < e.p.x;
      // 1. (an end near a side of the tower: the piece runs on into the wall, at its own height, so no slot is left to fall down)
      const [w0, w1] = leftEnd ? [0, e.p.x] : [e.p.x + e.p.width, width];
      if ((e.x < TOWER.wall + 40 || e.x > width - TOWER.wall - 40) && !sealed(e.p) && !byGate(w0, w1, e.p.y)) {
        put(w0, w1, e.p.y, Le);
        added++;
        continue;
      }
      // 2. (wood under him from a body's height down: wood nearer than a storey is his own storey's, a jump back up to where he fell)
      const lo = e.p.y + BODY_H + 12, hi = Math.min(e.p.y + most, floorY - 1);
      const gapTo = (q: Platform) => (e.x < q.x ? q.x - e.x : e.x - (q.x + q.width));
      const anchor = all.filter((q) => q !== e.p && !sealed(q) && q.type === 'solid' && q.y >= lo && q.y <= hi && (e.x < q.x || e.x > q.x + q.width)).sort((a, b) => gapTo(a) - gapTo(b) || a.y - b.y)[0];
      if (anchor) {
        const left = e.x < anchor.x;
        // (a vine whose top stands at the anchor's end: the bridge starts a hop past it)
        const tip = left ? anchor.x : anchor.x + anchor.width;
        const vine = vines.some((v) => v.vineType === 'tree_climb' && Math.abs(v.x - tip) <= 44 && anchor.y >= v.topY - 6 && anchor.y <= v.bottomY + 6);
        const near = vine ? tip + (left ? -1 : 1) * (TOWER.hop + 30) : tip;
        const far = left ? Math.max(24, e.x - TOWER.catchW / 2) : Math.min(width - 24, e.x + TOWER.catchW / 2);
        const x0 = Math.min(near, far), x1 = Math.max(near, far);
        const L = x1 - x0 >= 60 && !overGap(x0, x1, anchor.y) ? fair(x0, x1, anchor.y, lv.get(anchor) ?? 0, [anchor]) : -1;
        if (L >= 0) { put(x0, x1, anchor.y, L); added++; continue; }
      }
      // (a sealed piece is never run on, and no shelf is hung at its end: the wood under it is its own section's, or the fall is named)
      if (sealed(e.p)) continue;
      // 3. (going up: the piece itself run on to the wall on that side)
      if (flow === 'up') {
        const [x0, x1] = leftEnd ? [0, e.p.x] : [e.p.x + e.p.width, width];
        const L = overGap(x0, x1, e.p.y) ? -1 : fair(x0, x1, e.p.y, Le, [e.p]);
        if (L >= 0) { put(x0, x1, e.p.y, L); added++; continue; }
      }
      // 4. (a bough of its own under the end)
      const x0 = Math.max(24, Math.min(width - 24 - TOWER.catchW, e.x - TOWER.catchW / 2));
      // (the highest fair height under the end, never past the limit: every 20 px, and the height of any wood it would lie across,
      // where it is that wood run on)
      const top = Math.min(e.p.y + (flow === 'up' ? 40 : TOWER.clear + 30), floorY - TOWER.hop), last = e.p.y + most - 4;
      const ys: number[] = [];
      for (let y = top; y <= last; y += 20) ys.push(y);
      for (const q of all) if (q.type === 'solid' && q.x < x0 + TOWER.catchW && q.x + q.width > x0 && q.y > top && q.y <= last) ys.push(q.y);
      for (const y of ys.sort((a, b) => a - b)) {
        const L = fair(x0, x0 + TOWER.catchW, y, Le, []);
        if (L < 0) continue;
        put(x0, x0 + TOWER.catchW, y, L);
        added++;
        break;
      }
    }
    if (!added) break;
  }
  return out;
}

/** how far under a gate's top a piece still counts as level with it (px) */
const GATE_LEVEL = 30;

/**
 * A tower's shut gates passed, each by name (empty: none). `sealed`: the gate boughs (SectionPiece.sealed). With a gate shut he
 * cannot come up onto it from the vines under it, and the vine that stands on it is held down: so nothing at its level or over it
 * may be reached without it. Refused: any piece at the gate's level or higher (not the gate itself) that a jump reaches (LEAP,
 * generous) from the wood under the gate's level, or a HOP reaches from the top of a climbing vine he can get onto from that wood
 * (the vines hung under the gate above all: a bough beside the gate at its height is one hop from a field vine's top).
 */
export function towerGates(sealed: readonly Platform[], platforms: readonly Platform[], vines: readonly Vine[]): string[] {
  const out: string[] = [];
  const R = Math.round;
  for (const g of sealed) {
    const wood = platforms.filter((p) => p !== g && p.type !== 'bouncy');
    const under = wood.filter((p) => p.y > g.y + GATE_LEVEL);
    // (the vines he can get onto from that wood, but for the ones that stand on the gate: their tops are where a hop starts)
    const tops = vines.filter((v) => v.vineType === 'tree_climb' && !(Math.abs(v.bottomY - g.y) <= 8 && v.x >= g.x - 4 && v.x <= g.x + g.width + 4)
      && under.some((p) => v.x >= p.x - 30 && v.x <= p.x + p.width + 30 && p.y >= v.topY + 30 && p.y <= v.bottomY + 40));
    let hit: string | undefined;
    for (const b of wood) {
      if (b.y > g.y + GATE_LEVEL) continue;
      const v = tops.find((t) => leaps({ x: t.x - 1, y: t.topY, width: 2 }, b));
      const a = v ? undefined : under.find((p) => leaps(p, b));
      if (!v && !a) continue;
      hit = `the piece at x ${R(b.x)}-${R(b.x + b.width)}, y ${R(b.y)} is reached by a hop from ${v ? `the top of the vine at x ${R(v.x)}` : `the piece at x ${R(a!.x)}-${R(a!.x + a!.width)}, y ${R(a!.y)}`}`;
      break;
    }
    if (hit) out.push(`tower: the shut gate at x ${R(g.x)}-${R(g.x + g.width)}, y ${R(g.y)} is passed without opening it: ${hit}`);
  }
  return out;
}

/**
 * A tower's storeys skipped, each by name (empty: none): going up, for every turn, the wood at or under the ledge he leaves and
 * everything a jump reaches from it (LEAP, read generously; no vine) holds nothing as high as the storey the turn climbs to. So the
 * vine is the only way up, and the stage is played storey by storey in the order it was laid (no catch bough, hop or step is a
 * ladder). `turns`: each turn's vine x and the heights it joins. A way down is not judged here (its drops are towerFalls').
 */
export function towerSkips(turns: ReadonlyArray<{ x: number; from: number; to: number }>, platforms: readonly Platform[]): string[] {
  const wood = platforms.filter((p) => p.type !== 'bouncy');
  const out: string[] = [];
  for (const t of turns) {
    if (t.to >= t.from) continue;
    const seen = new Set(wood.filter((p) => p.y >= t.from - 1));
    const open = [...seen];
    let hit: Platform | undefined;
    while (open.length && !hit) {
      const a = open.pop()!;
      for (const b of wood) {
        if (seen.has(b) || !leaps(a, b)) continue;
        seen.add(b);
        open.push(b);
        if (b.y <= t.to + 1) { hit = b; break; }
      }
    }
    if (hit) out.push(`tower: the storey at y ${Math.round(t.to)} is reached from y ${Math.round(t.from)} by jumps alone (onto the piece at x ${Math.round(hit.x)}-${Math.round(hit.x + hit.width)}, y ${Math.round(hit.y)}): the vine at x ${Math.round(t.x)} is not the only way up`);
  }
  return out;
}

/**
 * A tower's falls, each miss by name (empty: kept). Stepping off either end of any piece he can stand on, a body's width past it:
 *   - going UP, sound wood catches him within TOWER.fall px (STAGE-RULES §2 "Falls in climbs": a miss costs a storey, never the climb);
 *   - going DOWN, the drop is his way on, so its landing is in view before he commits: within TOWER.see px (D46: no blind fall);
 *   - a piece that gives way under him (a crumbling tile, a creaky limb) drops him onto sound wood inside the same limit.
 * `floorY`: the tower's floor (nothing is under it to catch; a piece standing on it is not judged).
 */
export function towerFalls(flow: 'up' | 'down', platforms: readonly Platform[], floorY: number, width: number): string[] {
  const most = flow === 'up' ? TOWER.fall : TOWER.see;
  const out = openEnds(platforms, floorY, most, width).map(({ p, drop }) => (flow === 'up'
    ? `tower: a fall off the piece at x ${Math.round(p.x)}-${Math.round(p.x + p.width)}, y ${Math.round(p.y)} drops ${drop === Infinity ? 'out of the tower' : `${Math.round(drop)} px`} (sound wood within ${TOWER.fall})`
    : `tower: a blind drop off the piece at x ${Math.round(p.x)}-${Math.round(p.x + p.width)}, y ${Math.round(p.y)}: ${drop === Infinity ? 'nothing under it' : `${Math.round(drop)} px to its landing`} (in view: within ${TOWER.see})`));
  // (a piece that gives way under him, a crumbling tile or a creaky limb: where it drops him, at its middle and a body in from each
  // end, sound wood catches him inside the same limit)
  for (const p of platforms) {
    if (p.type !== 'fragile' || p.y >= floorY - 1) continue;
    const xs = p.width > 64 ? [p.x + 24, p.x + p.width / 2, p.x + p.width - 24] : [p.x + p.width / 2];
    const drop = Math.max(...xs.map((x) => { const land = catchUnder(platforms, x, p.y, 100000); return land === undefined ? Infinity : land - p.y; }));
    if (drop > most) out.push(`tower: the piece at x ${Math.round(p.x)}-${Math.round(p.x + p.width)}, y ${Math.round(p.y)} gives way over ${drop === Infinity ? 'nothing' : `a ${Math.round(drop)} px drop`} (sound wood within ${most})`);
  }
  return out;
}

// ───────────────────────────── flags along the route ─────────────────────────────

/** Matt's flag rule's numbers (pipeline.ts ROLLED_FLAGS: one rule, the same numbers, on a run and on a tower) */
export interface FlagRule { first: number; min: number; max: number; last: number; before: number; clear: number }
export interface RouteFlag { x: number; y: number; s: number }

/**
 * Is flag `cp` further on than the place he holds (`cur`: a flag, or the spawn)? On a stage with a route (a gen2 tower) it is read
 * ALONG THE ROUTE, the px of way to each: x runs both ways in a tower and two flags may stand on one storey, where height (the
 * travel mode's own answer, stageModes.ts) calls neither further. Any other stage: its travel mode's answer, as ever. The engine
 * asks this when he touches a flag and when a run is resumed at one (engine.ts); levelCheck asks it of a tower's flag order.
 */
export function flagFurther(stage: object, mode: { further(cp: { x: number; y: number }, cur: { x: number; y: number }): boolean }, cp: { x: number; y: number }, cur: { x: number; y: number }): boolean {
  const route = (stage as { gen2?: { tower?: { route?: Route } } }).gen2?.tower?.route;
  return route ? routeAt(route, cp.x, cp.y) > routeAt(route, cur.x, cur.y) + 1 : mode.further(cp, cur);
}

/**
 * A tower's flags, Matt's rule measured ALONG THE ROUTE (D49; never x, which runs both ways in a tower; never height, which two
 * flags on one storey share: the engine takes them in the route's order, flagFurther): a flag before each hard
 * node (within `before` px of way ahead of it, `clear` or more ahead), none closer than `min` to the one before (`first` to the
 * start), then every span past `max` (`last` before the totem) split at the furthest spot in reach. `spots`: the clear runs of
 * wide main pieces a flag may stand on; `hard`: the route px where each hard node begins. Returned in the order he meets them.
 */
export function towerFlags(route: Route, spots: ReadonlyArray<{ x0: number; x1: number; y: number }>, hard: readonly number[], rule: FlagRule, blocked: (x: number, y: number) => boolean = () => false): RouteFlag[] {
  const cands: RouteFlag[] = [];
  for (const sp of spots) {
    // (every 20 px of the run, and both its ends)
    const n = Math.max(1, Math.ceil((sp.x1 - sp.x0) / 20));
    for (let k = 0; k <= n; k++) {
      const xx = sp.x0 + ((sp.x1 - sp.x0) * k) / n;
      if (!blocked(xx, sp.y)) cands.push({ x: Math.round(xx), y: sp.y, s: routeAt(route, xx, sp.y) });
    }
  }
  cands.sort((a, b) => a.s - b.s);
  const flags: RouteFlag[] = [];
  const add = (c: RouteFlag) => { flags.push(c); flags.sort((a, b) => a.s - b.s); };
  const bestIn = (lo: number, hi: number): RouteFlag | undefined => {
    for (let k = cands.length - 1; k >= 0; k--) if (cands[k].s <= hi && cands[k].s >= lo) return cands[k];
    return undefined;
  };
  for (const h of hard) {
    if (h < rule.first + rule.clear) continue;
    const c = bestIn(h - rule.before, h - rule.clear);
    if (c) add(c);
  }
  for (let k = 0; k < flags.length; k++) if (flags[k].s - (k ? flags[k - 1].s : 0) < (k ? rule.min : rule.first)) { flags.splice(k, 1); k--; }
  for (let guard = 0; guard < 80; guard++) {
    const ss = [0, ...flags.map((f) => f.s), route.length];
    let k = -1;
    for (let i = 1; i < ss.length; i++) if (ss[i] - ss[i - 1] > (i === ss.length - 1 ? Math.min(rule.last, rule.max) : rule.max)) { k = i; break; }
    if (k < 0) break;
    const from = ss[k - 1], to = ss[k], last = k === ss.length - 1;
    const lo = k === 1 ? rule.first : from + rule.min;
    // (toward the totem the run's pass steps a `last` at a time; where no spot stands that near, the furthest inside `max` keeps the rule)
    const c = bestIn(lo, Math.min(from + (last ? Math.min(rule.last, rule.max) : rule.max) - 20, last ? to : to - rule.min)) ?? (last ? bestIn(lo, Math.min(from + rule.max - 20, to)) : undefined);
    if (!c) break;
    add(c);
  }
  return flags;
}

/** a tower's flags against the rule, each miss by name (empty: kept): pipeline.ts rolledFlagBreaches' lines, measured along the route */
export function towerFlagBreaches(route: Route, flags: ReadonlyArray<{ x: number; y: number }>, hard: ReadonlyArray<{ id: string; s: number }>, rule: FlagRule): string[] {
  const fs = flags.map((f) => ({ ...f, s: routeAt(route, f.x, f.y) })).sort((a, b) => a.s - b.s);
  if (!fs.length) return ['flags: none'];
  const R = Math.round;
  const out: string[] = [];
  if (fs[0].s < rule.first) out.push(`flags: the first ${R(fs[0].s)} px of way from the start (at least ${rule.first})`);
  if (fs[0].s > rule.max) out.push(`flags: the first ${R(fs[0].s)} px of way from the start (no span over ${rule.max})`);
  for (let k = 1; k < fs.length; k++) {
    const g = fs[k].s - fs[k - 1].s;
    if (g < rule.min || g > rule.max) out.push(`flags: ${R(g)} px of way apart after the flag at x ${R(fs[k - 1].x)}, y ${R(fs[k - 1].y)} (${rule.min}-${rule.max})`);
  }
  for (const h of hard) if (h.s >= rule.first + rule.clear && !fs.some((f) => f.s <= h.s + 150 && f.s >= h.s - rule.before)) out.push(`flags: none before the hard node ${h.id}, ${R(h.s)} px along the way (within ${rule.before} px)`);
  if (route.length - fs[fs.length - 1].s > rule.last) out.push(`flags: the last ${R(route.length - fs[fs.length - 1].s)} px of way from the exit (within ${rule.last})`);
  return out;
}
