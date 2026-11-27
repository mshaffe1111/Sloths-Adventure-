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
import { ASSIST, PHYS, DOUBLE_RISE, JUMP_RISE, reachJump, STAND_SIDE } from '../physics.ts';
import type { Platform, Vine } from '../types.ts';
import type { LocalLayout } from './pipeline.ts';
import { climbX, ledgeOut, vaultSide } from '../vineTop.ts';

/** which way a graph is laid (MissionGraph.flow) */
export type Flow = 'right' | 'up' | 'down' | 'legs';
export const vertical = (flow: Flow): flow is 'up' | 'down' => flow === 'up' || flow === 'down';

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
    gaps: L.gaps.map((g) => ({ ...g, x0: -g.x1, x1: -g.x0, ...(g.pond ? { pond: { ...g.pond, x0: -g.pond.x1, x1: -g.pond.x0 } } : {}) })),
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
  // (a water wheel's pond is its own: the storey keeps its water clear of the wood under it, across its whole span; wheelLay.ts)
  for (const g of L.gaps) if (g.pond) { x0 = Math.min(x0, g.pond.x0); x1 = Math.max(x1, g.pond.x1); low = Math.max(low, g.pond.low); }
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
  if (route.flow === 'right') return x - route.spawn.x;
  // (a way DOWN ends on its floor, under its last section: a place lower than the last leg is on the way from that leg's exit to the
  //  shrine (the route's own last span), measured along it, never past the exit. Before ENG-W3a every such place measured at the last
  //  leg's end, so the floor's walk to the shrine, up to 1,500 px, was never on the measure and no flag there could count)
  const last = route.legs[route.legs.length - 1];
  if (route.flow === 'down' && last && y > Math.max(last.entry.y, last.exit.y) + 1) return Math.min(route.length, last.s0 + last.len + span(last.exit, { x, y }));
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
export function towerLead(stage: object, mode: { lead(): { dx: number; dy: number } }, at?: { x: number; y: number }): number {
  const T = (stage as { gen2?: { tower?: { flow: Flow; legs?: LegBox[] } } }).gen2?.tower;
  if (!T) return 0;
  if (T.flow !== 'legs') return mode.lead().dy;
  // (a stage of legs, R-165.196: the column he is in leads the view its own way, up or down; on a run leg, or when the engine
  // names no place, the framing every run has)
  const leg = at && T.legs ? columnAt(T.legs, at.x, at.y) : undefined;
  return leg ? (leg.travel === 'up' ? -1 : 1) : 0;
}

/** a laid leg, as much of it as the route's readers need (legs.ts LaidLeg) */
type LegBox = { travel: 'right' | 'left' | 'up' | 'down'; y0: number; frame?: { x0: number; x1: number }; floorY?: number };
/** how far outside a column's frame he still counts as in it: its wall's thickness, and a storey over its top */
const COLUMN_KEEP = { x: 60, over: 320, under: 40 } as const;
/** the column (a leg laid up or down) the place lies in, on a stage of legs; undefined on a run leg. No allocation: the engine asks
 *  every frame */
export function columnAt(legs: readonly LegBox[], x: number, y: number): LegBox | undefined {
  for (let i = 0; i < legs.length; i++) {
    const g = legs[i];
    if (g.frame && x >= g.frame.x0 - COLUMN_KEEP.x && x <= g.frame.x1 + COLUMN_KEEP.x && y >= g.y0 - COLUMN_KEEP.over && y <= (g.floorY ?? Infinity) + COLUMN_KEEP.under) return g;
  }
  return undefined;
}

/**
 * How far through a stage of legs a place is, 0 to 1 along its route (the progress bar's answer where x and height each run both
 * ways); undefined on any other stage, whose travel mode answers as ever (stageModes.ts).
 */
export function routeRatio(stage: object, at: { x: number; y: number }): number | undefined {
  const T = (stage as { gen2?: { tower?: { flow: Flow; route?: Route } } }).gen2?.tower;
  if (!T?.route || T.flow !== 'legs') return undefined;
  return Math.max(0, Math.min(1, routeAt(T.route, at.x, at.y) / Math.max(1, T.route.length)));
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

/** his width (engine.ts: 44 px) */
const BODY_W = 44;
/** how far past an end his middle hangs still standing (engine.ts landing, physics.ts STAND_SIDE): `fall` the least (Normal, no
 *  early-stage help: past this he can fall), `off` the most (Easy, the help's wider footing: past this he steps off on either setting) */
export const HANG = { fall: BODY_W * STAND_SIDE, off: BODY_W * (STAND_SIDE + ASSIST.landSide) };
/**
 * Where his middle comes down stepping off the end of wood at `end` toward `dir`: a body's width past it, never past the walls the
 * engine keeps his middle inside, [20, width - 20]; null when the wall's line lies within `hang` of the end (he stands at the wall,
 * hanging past it: no end). The engine stands him while his middle hangs at most HANG past an end, so an end further in from that
 * line is a slot: on the drafted 3-1 Normal 25, log #48's left end at x 34 (14 px in) read as no end (its body-width point, x 10, is
 * past the wall), and the child, jumping left against the wall, fell past it 1850 px; but a bridge run on to x 1256 (4 px in) by
 * Normal 22's shrine is no way off: read as one, it was laid as the way down and every bot stood on its end (ENG-DARK box 18).
 * `hang`: HANG.fall where a fall must be caught (the lay's open ends and its catches' landings); HANG.off where the end is to be a
 * way off on both settings (handOn, the catch guard).
 */
export function offEnd(end: number, dir: -1 | 1, width: number, hang = HANG.off): number | null {
  return dir < 0 ? (end - 20 <= hang ? null : Math.max(20, end - 24)) : width - 20 - end <= hang ? null : Math.min(width - 20, end + 24);
}

/** where stepping off either end of a standable piece falls further than `most` px (or out of the tower): the open ends a catch is
 *  owed. An end at a wall is no end (offEnd) */
export function openEnds(platforms: readonly Platform[], floorY: number, most: number, width: number): Array<{ p: Platform; x: number; drop: number }> {
  const out: Array<{ p: Platform; x: number; drop: number }> = [];
  for (const p of platforms) {
    if (p.type !== 'solid' || p.y >= floorY - 1) continue;
    for (const x of [offEnd(p.x, -1, width, HANG.fall), offEnd(p.x + p.width, 1, width, HANG.fall)]) {
      if (x === null) continue;
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
export function towerCatches(flow: 'up' | 'down', platforms: readonly Platform[], vines: readonly Vine[], floorY: number, width: number, gaps: ReadonlyArray<{ x0: number; x1: number; y: number }> = [], level: (p: Platform) => number = () => 0, sealed: (p: Platform) => boolean = () => false,
  /** boxes no bough may lie in (a water wheel's sweep and its rider over it, ENG-26: a bough there knocks him out of his bucket) */
  keepOut: ReadonlyArray<{ x0: number; x1: number; y0: number; y1: number }> = [],
  /** going down, the column's turn vines by id and the storeys each joins (pipeline.ts turns): the catch each hands on (downInvariant) */
  turns: ReadonlyArray<{ id: number; from: number; to: number }> = []): Array<{ x: number; y: number; w: number; level: number }> {
  const first = layCatches(false, flow, platforms, vines, floorY, width, gaps, level, sealed, keepOut, turns);
  if (flow !== 'down') return first;
  // (going down, a lay that leaves a blind drop is laid once more with every bridge reaching under the fall line it is laid for; a lay
  //  with none left is never touched. Next to a vine's top a bridge starts a hop past the vine (rule 2), and where the end's fall line
  //  lies in that hop the bridge caught nothing: the drafted 3-1's storey hole x 554-654 at y 7377, under a bounce brick's cap shelf
  //  (its far end x 650, the fall line 626), was bridged 654-716 on every pass and the walk off the shelf fell 481 px past the storey
  //  (Easy 2; Easy 4 the same, 477 px), ENG-CATCH-b. Kept only if it leaves fewer misses of the down tower's invariant, ENG-CATCH-c)
  const left = (cs: ReadonlyArray<{ x: number; y: number; w: number }>) => downInvariant([...platforms, ...cs.map((c, k) => ({ id: -1 - k, x: c.x, y: c.y, width: c.w, height: 24, type: 'solid' }) as Platform)], vines, turns, floorY, width);
  const before = left(first);
  if (!before.length) return first;
  const again = layCatches(true, flow, platforms, vines, floorY, width, gaps, level, sealed, keepOut, turns);
  const after = left(again);
  const better = after.length < before.length;
  const lay = better ? again : first, misses = better ? after : before;
  // THE GUARANTEE (ENG-CATCH-e, R-165.534): a down tower never returns a lay with a miss. A miss the mend's bounded tries left is the
  // roll's to answer, not the stage's to ship: the roll is refused by name (TowerRefusal), and the seed search rolls again (pipeline.ts
  // buildRolledOn). On the narrowed kit de6feebff, a catch against the wall whose far end saw nothing under it was returned and the
  // stage verdict named it after the build (Easy 11, 19; Normal 33): the mend's fourth shape-by-shape box, ENG-CATCH-e
  if (misses.length) throw new TowerRefusal(misses[0].line);
  return lay;
}

/** the name a down tower's refusal carries: a miss the mend could not mend (towerCatches' guarantee) */
export const UNMENDABLE = 'tower: unmendable miss: ';
/** a down tower's lay that still has a miss once its mend is done: the roll is refused by name and the seed search rolls again */
export class TowerRefusal extends Error {
  constructor(readonly miss: string) {
    super(UNMENDABLE + miss);
    this.name = 'TowerRefusal';
  }
}

/** towerCatches' lay. `cover`: a bridge is laid only where it reaches under the fall line of the end it is laid for */
function layCatches(cover: boolean, flow: 'up' | 'down', platforms: readonly Platform[], vines: readonly Vine[], floorY: number, width: number, gaps: ReadonlyArray<{ x0: number; x1: number; y: number }>, level: (p: Platform) => number, sealed: (p: Platform) => boolean,
  keepOut: ReadonlyArray<{ x0: number; x1: number; y0: number; y1: number }>, turns: ReadonlyArray<{ id: number; from: number; to: number }>): Array<{ x: number; y: number; w: number; level: number }> {
  const most = flow === 'up' ? TOWER.fall : TOWER.see;
  const all: Platform[] = [...platforms];
  const lv = new Map<Platform, number>(platforms.map((p) => [p, level(p)]));
  const out: Array<{ x: number; y: number; w: number; level: number }> = [];
  /** each laid piece's platform in `all`, and the fall line (x) of the open end it was laid for */
  const laid: Platform[] = [], served: Array<{ x: number; y: number }> = [];
  let serving = { x: 0, y: 0 };
  // (going down, his hop's room: no bough within ROOF over a dip's lip or a climb vine's top, the rooms towerLids reads; read again
  //  after each bough, which may itself be a lip)
  let rooms: ReturnType<typeof hopRooms> | undefined;
  // (nor a bough that would itself make a new dip, a lip or its floor, under wood already laid: normal 21's later bough made the lip of a
  //  dip 158 px under a bough laid before it)
  const made = (x0: number, x1: number, y: number) => {
    const near = all.filter((q) => q.type === 'solid' && q.x < x1 + 220 && q.x + q.width > x0 - 220 && q.y > y - ROOF - 160 && q.y < y + 160);
    const box = { id: 0, x: x0, y, width: x1 - x0, height: 24, type: 'solid' } as Platform;
    const had = new Set(hopRooms(near, [], false).map((r) => `${r.x0},${r.x1},${r.y}`));
    const fresh = hopRooms([...near, box], [], false).filter((r) => !had.has(`${r.x0},${r.x1},${r.y}`));
    return fresh.length > 0 && near.some((q) => inRoom(fresh, q.x, q.x + q.width, q.y) !== undefined);
  };
  const lidded = (x0: number, x1: number, y: number) => flow === 'down' && (inRoom((rooms ??= hopRooms(all, vines, false)), x0, x1, y) !== undefined || made(x0, x1, y));
  const put = (x0: number, x1: number, y: number, L: number) => {
    const c = { x: Math.round(x0), y: Math.round(y), w: Math.round(x1 - x0), level: L };
    out.push(c);
    const p = { id: -1 - out.length, x: c.x, y: c.y, width: c.w, height: 24, type: 'solid' } as Platform;
    all.push(p);
    lv.set(p, L);
    laid.push(p);
    served.push(serving);
    rooms = undefined;
  };
  const solid = (but: ReadonlyArray<Platform>) => all.filter((q) => !but.includes(q) && q.type === 'solid');
  // (wood in its way: across other wood at another height with less than his body between the two, over it or under it; `but`: the
  // wood it is laid as part of. Both ways going down too (ENG-DOWNBOT): a bridge run on 70 px under a shelf left him no head room
  // under it, and a catch 60 px over the storey laid under it none over that storey's ledge, on 48 of 48 drafted 3-1 rolls)
  const cramped = (x0: number, x1: number, y: number, but: ReadonlyArray<Platform>) => solid(but).some((q) => q.x < x1 && q.x + q.width > x0 && Math.abs(q.y - y) > 1 && Math.abs(q.y - y) < HEAD);
  // (a storey climbed by a jump: the bough, of storey `L` (or of a lower one, if wood of a lower one could jump onto it), with wood of
  // a higher storey inside a jump of it. Going down a bough is only ever a way on (its ends drop him onto the storey under it), so no
  // storey is guarded here; what is guarded going down is his hop's way: no bough lies in his hop's room over a dip's lip or a climb
  // vine's top (lidded, hopRooms, the verdict towerLids), where a hop up onto it would be a way back, a dead end)
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
  const byGate = (x0: number, x1: number, y: number) => gates.some((g) => y <= g.y + GATE_LEVEL && y >= g.y - LEAP.up && Math.max(0, x0 - (g.x + g.width), g.x - x1) <= hop)
    || keepOut.some((k) => x0 < k.x1 && x1 > k.x0 && y >= k.y0 && y <= k.y1);
  // (going down, a turn's catch hands him on to its own storey: no wood is laid level with the wood across a climb vine (the catch the
  //  vine will stop on, stopVines), run on with it, that leaves that run with no end landing on the vine's storey or above it: over ALL
  //  of the storey he would land past it off both ends, skipping its leg, or wall to wall with no way off (the lead's ruling on LAY
  //  finding 2, ENG-DOWNBOT: 69 turns on 33 of 48 drafted 3-1 rolls). Its first landing only: a landing over the storey that hands
  //  him on past it is named by the verdict (towerHandOns, which follows the drops), not yet laid round (guarding the whole chain here
  //  left open ends, blind drops, on 37 of 48 rolls; box 5))
  const climbs = flow === 'down' ? vines.filter((v) => v.vineType === 'tree_climb') : [];
  const passes = (x0: number, x1: number, y: number): boolean => {
    if (!climbs.length) return false;
    const box = { id: 0, x: x0, y, width: x1 - x0, height: 24, type: 'solid' } as Platform;
    const lvl = [...solid([]), box].filter((q) => Math.abs(q.y - y) <= 1);
    let a = x0, b = x1, grew = true;
    while (grew) {
      grew = false;
      for (const q of lvl) if (q.x <= b + 2 && q.x + q.width >= a - 2 && (q.x < a || q.x + q.width > b)) { a = Math.min(a, q.x); b = Math.max(b, q.x + q.width); grew = true; }
    }
    // (the vine where it will hang: a vine on the face of the wood at its top is moved CLIMB_CLEAR out in front of it (climbX,
    //  clearClimbs), so read there too. The drafted 3-1's vine at x 798, flush with a log's end, was moved to 819 onto the catch
    //  799-979 beside it, after a bridge 979-1207 and its run-on into the wall were laid level with that catch (seed 3, both
    //  settings), ENG-CATCH)
    const wood = [...all, box];
    const v = climbs.find((q) => [q.x, climbX(q, wood)].some((x) => a + 6 < x && b - 6 > x) && y > q.topY + 10 && y < q.bottomY - 10);
    if (!v) return false;
    // (and a walled end is no way off (walledEnd), as the verdict's handOn reads it: that run's left end walked into the log's side,
    //  so it ran wall to wall with no way off. ENG-DARK box 18 had taken it out when no lay of 80 changed without it)
    return ![a, b].map((end, i) => (walledEnd(wood, end, i ? 1 : -1, y) ? null : offEnd(end, i ? 1 : -1, width))).filter((x): x is number => x !== null).some((x) => { const l = catchUnder(wood, x, y, 100000); return l !== undefined && l <= v.bottomY + 2; });
  };
  // (going down, no slot beside it: a bough within a step of the wood beside it (SLOT.step px in height) lies flush with it, a
  //  walkable crack from it (SLOT.walk) or his body and a margin clear of it (SLOT.clear). A gap about his body's width between two
  //  near-level pieces is one he can neither fall through nor read as an end: the kid and the adult went to and fro over a 42 px gap
  //  between a catch and the vine-foot storey 6 px over it for 20 s until rescued, the top rescue cause of the drafted 3-1 lay
  //  (slots of 40-60 px 26 -> 107 on 48 rolls, ENG-DOWNBOT box 10))
  const slotted = (x0: number, x1: number, y: number, but: ReadonlyArray<Platform>) => flow === 'down' && solid(but).some((q) => {
    const gap = Math.max(q.x - x1, x0 - (q.x + q.width));
    return Math.abs(q.y - y) <= SLOT.step && gap > SLOT.walk && gap < SLOT.clear;
  });
  /** laid fairly: the storey it is of (storeyAt), or -1 when it is in the way, climbs a storey, lies by a gate or in a kept-out box,
   *  or (going down) runs a catch on past its storey or lies in his hop's room (hopRooms: a lid over a dip's lip, a roof over a vine's
   *  top) */
  const fair = (x0: number, x1: number, y: number, L: number, but: ReadonlyArray<Platform>): number => (cramped(x0, x1, y, but) || slotted(x0, x1, y, but) || byGate(x0, x1, y) || passes(x0, x1, y) || lidded(x0, x1, y) ? -1 : storeyAt(x0, x1, y, L, but));
  /** going down, every own end of a piece at (x0-x1, y) lands in view: a body's width past it (offEnd) he walks onto wood level with
   *  it, stands at a wall, or comes down within `most` */
  const lands = (x0: number, x1: number, y: number): boolean => {
    const box = { id: 0, x: x0, y, width: x1 - x0, height: 24, type: 'solid' } as Platform;
    return [offEnd(x0, -1, width, HANG.fall), offEnd(x1, 1, width, HANG.fall)].every((x) => x === null
      || all.some((q) => q.type === 'solid' && Math.abs(q.y - y) <= 1 && x >= q.x && x <= q.x + q.width)
      || catchUnder([...all, box], x, y, most) !== undefined);
  };
  /** going down, every own end of a piece at (x0-x1, y) is no open end as openEnds reads it (the invariant's own reading, for the mend):
   *  at a wall, onto wood he walks onto, or coming down within `most` */
  const endsLand = (x0: number, x1: number, y: number): boolean => {
    const box = { id: 0, x: x0, y, width: x1 - x0, height: 24, type: 'solid' } as Platform;
    return [offEnd(x0, -1, width, HANG.fall), offEnd(x1, 1, width, HANG.fall)].every((x) => x === null
      || all.some((q) => q.type !== 'fragile' && x >= q.x && x <= q.x + q.width && q.y <= y + 1 && q.y + q.height > y)
      || catchUnder([...all, box], x, y, most) !== undefined);
  };
  for (let pass = 0; pass < 10; pass++) {
    const ends = openEnds(all, floorY, most, width);
    if (!ends.length) break;
    let added = 0;
    for (const e of ends) {
      // (an earlier bough of this pass may already catch it)
      if (catchUnder(all, e.x, e.p.y, most) !== undefined) continue;
      serving = { x: e.x, y: e.p.y };
      const Le = lv.get(e.p) ?? 0;
      const leftEnd = e.x < e.p.x;
      // 1. (an end near a side of the tower: the piece runs on into the wall, at its own height, so no slot is left to fall down)
      const [w0, w1] = leftEnd ? [0, e.p.x] : [e.p.x + e.p.width, width];
      // (going down, only into the wall on the end's own side, with his head room kept: the right end of a 60 px bridge by the left
      //  wall ran on to the RIGHT wall, a plank across the whole tower 70 px over a storey, ENG-DOWNBOT, drafted 3-1 easy 18)
      const ownSide = flow !== 'down' || (leftEnd ? e.x < TOWER.wall + 40 : e.x > width - TOWER.wall - 40);
      // (no slot is read here: a run-on opens no gap, one end at the wall and the other joined to the piece's own end, so a gap beside
      //  it is the piece's own, there before it. Read off the run-on alone, a bridge 1176-1241 laid on wood ending at 1176 made the
      //  run-on 1241-1280 65 px from that wood, a slot, though the bridge fills the gap; refused, the end 19 px in from the wall line was
      //  left a way off with a 568 px blind drop, as no catch can lie under its point on the wall line (offEnd); read off the piece and
      //  run-on as one, a piece's own 65 px gap on its far side refused its run-on (drafted 3-1 Easy 6 and 34, ENG-DARK box 26))
      if ((e.x < TOWER.wall + 40 || e.x > width - TOWER.wall - 40) && ownSide && !sealed(e.p) && !byGate(w0, w1, e.p.y) && (flow !== 'down' || (!cramped(w0, w1, e.p.y, [e.p]) && !passes(w0, w1, e.p.y) && !lidded(w0, w1, e.p.y)))) {
        put(w0, w1, e.p.y, Le);
        added++;
        continue;
      }
      // 2. (wood under him from a body's height down: wood nearer than a storey is his own storey's, a jump back up to where he fell)
      const lo = e.p.y + BODY_H + 12, hi = Math.min(e.p.y + most, floorY - 1);
      const gapTo = (q: Platform) => (e.x < q.x ? q.x - e.x : e.x - (q.x + q.width));
      // (going down, the next nearest wood is tried when the nearest's bridge is not fair (its head room above all): the nearest
      //  6 px off, 70 px under the bough he stood on, left a 306 px blind drop with fair wood 194 px down, ENG-DOWNBOT)
      // (going down, never the wood a climb vine stops on, its catch: a bridge to it runs that catch on, and the dip's end beside a
      //  vine's stop was bridged level with its catch onto a shelf over the storey and on past it, ENG-DOWNBOT, LAY finding 2)
      const isCatch = (q: Platform) => climbs.some((v) => q.x + 6 < v.x && q.x + q.width - 6 > v.x && q.y > v.topY + 10 && q.y < v.bottomY - 10);
      const anchors = all.filter((q) => q !== e.p && !sealed(q) && q.type === 'solid' && q.y >= lo && q.y <= hi && (e.x < q.x || e.x > q.x + q.width) && !isCatch(q)).sort((a, b) => gapTo(a) - gapTo(b) || a.y - b.y);
      let bridged = false;
      for (const anchor of flow === 'down' ? anchors : anchors.slice(0, 1)) {
        const left = e.x < anchor.x;
        // (a vine whose top stands at the anchor's end: the bridge starts a hop past it)
        const tip = left ? anchor.x : anchor.x + anchor.width;
        const vine = vines.some((v) => v.vineType === 'tree_climb' && Math.abs(v.x - tip) <= 44 && anchor.y >= v.topY - 6 && anchor.y <= v.bottomY + 6);
        const near = vine ? tip + (left ? -1 : 1) * (TOWER.hop + 30) : tip;
        const far = left ? Math.max(24, e.x - TOWER.catchW / 2) : Math.min(width - 24, e.x + TOWER.catchW / 2);
        const x0 = Math.min(near, far), x1 = Math.max(near, far);
        const L = x1 - x0 >= 60 && (!cover || (x0 <= e.x && x1 >= e.x)) && !overGap(x0, x1, anchor.y) ? fair(x0, x1, anchor.y, lv.get(anchor) ?? 0, [anchor]) : -1;
        if (L >= 0) { put(x0, x1, anchor.y, L); added++; bridged = true; break; }
      }
      if (bridged) continue;
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
      ys.sort((a, b) => a - b);
      // (going down, when the band at the storey under it is all in the way (its own jump's gap there, wood across it), the landing
      //  he can see is laid higher, a head's room under the piece at the least (HEAD), the deepest fair height first: a way down's
      //  catch is only ever a way on, and the band alone left a 10 px slot, ENG-W3a's down rolls: blind drops of 350-560 px)
      //  Up there it keeps his body's room to all wood over or under it (the climb's rule, HEAD), so he never stands squeezed under it,
      //  and HEAD over the storey laid under it later (a storey is TOWER.clear under the one it leaves: a catch 193 px down stood 81 px
      //  over the next storey's floor, by its turn vine's top)
      if (flow === 'down') for (let y = Math.min(top - 20, e.p.y + TOWER.clear - HEAD); y >= e.p.y + HEAD; y -= 20) ys.push(y);
      // (and the highest fair height itself, a head's room under the piece: the 20 px steps passed over the only height that kept his
      //  hop's room over a vine's top 267 px under and a head's room under both storeys, drafted 3-1 easy 8, ENG-DOWNBOT)
      if (flow === 'down') ys.push(e.p.y + HEAD);
      // (going down, at each height the bough may also lie further along, still under where he lands: SLIDE.out px of it past the
      //  end's fall line the way he walks off, SLIDE.back px of it behind; the centred one first, then the nearest. With his head
      //  room kept both ways (cramped) the centred bough alone found no fair height under 7 of 48 drafted 3-1 rolls' ends (a shelf
      //  6 px across it), and those rolls were refused for blind drops of 301-382 px, ENG-DOWNBOT)
      const out = leftEnd ? -1 : 1;
      const xs = [x0];
      if (flow === 'down') {
        for (let d = 10; d <= TOWER.catchW; d += 10) for (const s of [-d, d]) {
          const bx = x0 + s;
          const fwd = out > 0 ? bx + TOWER.catchW - e.x : e.x - bx, back = TOWER.catchW - fwd;
          if (bx >= 24 && bx <= width - 24 - TOWER.catchW && fwd >= SLIDE.out && back >= SLIDE.back) xs.push(bx);
        }
      }
      // (going down, a bough whose own ends both land in view (within `most`, or at a wall) first: kept out of his hop's room the first
      //  fair bough lay 287 px down beside the storey under it, its near end a 347 px blind drop with no fair wood under it, on 6 of 48
      //  drafted 3-1 rolls, where a bough a little higher, off the vine's top, landed both ends, ENG-DOWNBOT)
      const landed = (bx: number, y: number) => {
        const box = { id: 0, x: bx, y, width: TOWER.catchW, height: 24, type: 'solid' } as Platform;
        return [offEnd(bx, -1, width, HANG.fall), offEnd(bx + TOWER.catchW, 1, width, HANG.fall)].every((x) => x === null || all.some((q) => q.type === 'solid' && Math.abs(q.y - y) <= 1 && x >= q.x && x <= q.x + q.width) || (catchUnder([...all, box], x, y, most) !== undefined));
      };
      let pick: { bx: number; y: number; L: number } | undefined;
      for (const y of ys) {
        for (const bx of xs) {
          const L = fair(bx, bx + TOWER.catchW, y, Le, []);
          if (L < 0) continue;
          if (!pick) pick = { bx, y, L };
          if (flow !== 'down' || landed(bx, y)) { pick = { bx, y, L }; break; }
        }
        if (pick && (flow !== 'down' || landed(pick.bx, pick.y))) break;
      }
      if (pick) { put(pick.bx, pick.bx + TOWER.catchW, pick.y, pick.L); added++; }
    }
    if (!added) break;
  }
  if (flow === 'down') { reLay(); mend(); }
  return out;

  /**
   * Going down, THE DOWN TOWER'S INVARIANT kept on the tower's own lay (downInvariant, ENG-CATCH-c): once the lay and reLay are done, each
   * miss left is mended with the tower's own wood, and a remedy is kept only if it leaves FEWER misses, so the mend converges (each kept
   * remedy takes one miss off; at most MEND.steps of them, MEND.checks tries in all). The remedies, in this order:
   *   1. the piece the miss is of, if the lay laid it, laid again narrower or moved along (an end joined to level wood kept), at its own
   *      height first, then at any height under the end it serves (a turn's catch: between the turn's storeys, still across its vine),
   *      the least change first: a catch too wide for its storey ends where its ends land on it;
   *      A turn's catch that passes its storey may leave the wood run on level with it (a catch never runs past its storey: the run
   *      to the wall is trimmed back to the vine's side of it, so an end hands him on);
   *   2. a run-on of any wood under a fall line the miss names, at its own height (flush under the lip allowed, LIP);
   *   3. a catch under the catch: a bough of its own under a fall line the miss names (the end's; for a catch that passes its storey,
   *      each way off he was followed along), at the turn's storey's height first, then rule 4's heights, widest first, never narrower
   *      than SLIDE asks (he lands on it walking off);
   *   4. 2's and 3's wood refused ONLY by the tower's own pieces in its way (cramped or slotted against them), laid with those pieces
   *      trimmed back off it, each keeping MEND.trim px and the end it serves (trimKeep).
   * Each is laid only fairly (fair) with its own ends landing in view (endsLand). Moving the storey or its hole is not the tower's: a
   * section's pieces are its own (Content's), so a miss no remedy mends is left for the verdict to name (the roll is refused).
   * A lay with no miss is never touched.
   */
  function mend(): void {
    type Way = { a: number; b: number; y: number; L: number; but: ReadonlyArray<Platform>; serve: { x: number; y: number } };
    const check = () => downInvariant(all, vines, turns, floorY, width);
    let misses = check();
    let tries = MEND.checks;
    /** the lay with the piece laid (k: laid[k] moved; else a bough added) kept if it leaves fewer misses */
    const keep = (k: number | undefined, a: number, b: number, y: number, L: number, serve: { x: number; y: number }): boolean => {
      tries--;
      if (k !== undefined) {
        const p = laid[k];
        p.x = a; p.y = y; p.width = b - a;
        all.push(p);
      } else { serving = serve; put(a, b, y, L); }
      const now = check();
      if (now.length < misses.length) {
        misses = now;
        if (k !== undefined) { out[k].x = a; out[k].y = y; out[k].w = b - a; }
        return true;
      }
      if (k !== undefined) all.pop();
      else { const q = laid.pop()!; out.pop(); served.pop(); all.pop(); lv.delete(q); }
      return false;
    };
    const solidAt = (y: number) => all.filter((q) => q.type === 'solid' && Math.abs(q.y - y) <= 1);
    /** the tower's own piece `q` in the way of wood at (a-b, y) as `fair` reads it: across it with less than his body between (cramped),
     *  or a slot beside it (slotted) */
    const inWay = (q: Platform, a: number, b: number, y: number) => {
      const dy = Math.abs(q.y - y), gap = Math.max(q.x - b, a - (q.x + q.width));
      return (q.x < b && q.x + q.width > a && dy > 1 && dy < HEAD) || (dy <= SLOT.step && gap > SLOT.walk && gap < SLOT.clear);
    };
    /**
     * 4. wood at (a-b, y) refused ONLY by the tower's own pieces in its way (cramped or slotted against them, inWay) laid with those
     *    pieces trimmed back off it, each on the side of the end it serves (its fall line and SLIDE.back either side of it kept, MEND.trim
     *    px of it at the least); every trimmed piece laid fairly with its own ends landing in view, and the whole kept only if it leaves
     *    FEWER misses (keep), else every piece as it was. The drafted 3-1's catch 683-863 overhung a dip floor's far end 4 px and cramped
     *    every run-on under that end's fall line (shelf-hops alone, normal 7 and 9), ENG-CATCH-d
     */
    const trimKeep = (k: number | undefined, a: number, b: number, y: number, L: number, but: ReadonlyArray<Platform>, serve: { x: number; y: number }): boolean => {
      const me = k !== undefined ? laid[k] : undefined;
      const own = laid.filter((q) => q !== me && !but.includes(q) && inWay(q, a, b, y));
      if (!own.length || own.length > MEND.trimmed || fair(a, b, y, L, [...but, ...own]) < 0) return false;
      const was = own.map((q) => ({ q, x: q.x, w: q.width }));
      const undo = () => { for (const w of was) { const j = laid.indexOf(w.q); w.q.x = w.x; w.q.width = w.w; out[j].x = w.x; out[j].w = w.w; } rooms = undefined; };
      for (const q of own) {
        const j = laid.indexOf(q), ex = served[j].x;
        const keepL = ex + SLIDE.back <= a, keepR = ex - SLIDE.back >= b;
        if (!keepL && !keepR) { undo(); return false; }
        const x0 = q.x, x1 = q.x + q.width;
        let done = false;
        // (the least trimmed first: its end in 10 px steps back from the new wood's end to its own fall line's SLIDE.back)
        for (let e = keepL ? Math.min(x1, a) : Math.max(x0, b); keepL ? e >= ex + SLIDE.back : e <= ex - SLIDE.back; e += keepL ? -10 : 10) {
          const [u, v] = keepL ? [x0, Math.round(e)] : [Math.round(e), x1];
          if (v - u < MEND.trim) break;
          if (inWay({ ...q, x: u, width: v - u } as Platform, a, b, y)) continue;
          q.x = u; q.width = v - u; rooms = undefined;
          const joins = solidAt(q.y).filter((p) => p !== q && (Math.abs(p.x + p.width - u) <= 2 || Math.abs(p.x - v) <= 2));
          if (endsLand(u, v, q.y) && fair(u, v, q.y, lv.get(q) ?? 0, [q, ...joins]) >= 0) { out[j].x = u; out[j].w = v - u; done = true; break; }
          q.x = x0; q.width = x1 - x0;
        }
        if (!done) { undo(); return false; }
      }
      rooms = undefined;
      if (fair(a, b, y, L, me ? [me, ...but] : but) < 0 || !endsLand(a, b, y)) { undo(); return false; }
      if (keep(k, a, b, y, L, serve)) return true;
      undo();
      return false;
    };
    /** remedy 2's wood: a run-on of any wood under a fall line the miss names, at its own height (the nearest first) */
    function* runOns(m: DownMiss, L: number): Generator<Way> {
      for (const f of m.at.slice(0, MEND.lines)) for (const q of [...all]) {
        if (q.type !== 'solid' || sealed(q) || q.y <= f.y + 1 || q.y > f.y + most || q.y >= floorY - 1) continue;
        const right = f.x > q.x + q.width;
        if (!right && f.x >= q.x) continue;
        const run = runOf(solidAt(q.y), q.x, q.x + q.width, q.y);
        // (behind the fall line SLIDE.back, or flush under the lip he steps off (offEnd's 24 px): he drops past the lip, never behind it)
        for (const d of [LIP, ...Array.from({ length: 16 }, (_, i) => SLIDE.back + 10 * i)]) {
          const [a, b] = right ? [run.b, Math.round(f.x + d)] : [Math.round(f.x - d), run.a];
          if (b - a < 20 || a < 24 || b > width - 24) continue;
          const r0 = Math.min(a, run.a), r1 = Math.max(b, run.b), fwd = f.dir > 0 ? r1 - f.x : f.x - r0;
          if (fwd < SLIDE.out || r1 - r0 - fwd < LIP || overGap(a, b, q.y)) continue;
          yield { a, b, y: q.y, L: lv.get(q) ?? L, but: [q], serve: { x: f.x, y: f.y } };
        }
      }
    }
    /** remedy 3's wood: a bough of its own under a fall line the miss names, at the turn's storey's height first, then rule 4's heights,
     *  widest first, centred under the fall line first, then the nearest along, SLIDE kept */
    function* boughs(m: DownMiss, L: number): Generator<Way> {
      for (const f of m.at.slice(0, MEND.lines)) {
        const ys: number[] = [];
        if (m.turn && m.turn.to > f.y + HEAD && m.turn.to <= f.y + most) ys.push(m.turn.to);
        const top = Math.min(f.y + TOWER.clear + 30, f.y + most - 4, floorY - TOWER.hop);
        for (let y = top; y <= Math.min(f.y + most - 4, floorY - TOWER.hop); y += 10) ys.push(y);
        for (let y = top - 10; y >= f.y + HEAD; y -= 10) ys.push(y);
        for (const y of ys) for (const w of MEND.widths) {
          const c = Math.round(f.x - w / 2);
          for (let d = 0; d <= w; d += 10) for (const s of d ? [-d, d] : [0]) {
            const a = c + s, b = a + w, fwd = f.dir > 0 ? b - f.x : f.x - a;
            if (a >= 24 && b <= width - 24 && fwd >= SLIDE.out && w - fwd >= SLIDE.back) yield { a, b, y, L, but: [], serve: { x: f.x, y: f.y } };
          }
        }
      }
    }
    for (let step = 0; step < MEND.steps && misses.length && tries > 0; step++) {
      let mended = false;
      for (const m of misses) {
        if (mended || tries <= 0) break;
        if (!m.piece) continue;
        const L = lv.get(m.piece) ?? 0;
        // 1. the piece itself laid again, if the lay laid it
        const k = laid.indexOf(m.piece);
        if (k >= 0) {
          const p = laid[k], was = { x: p.x, y: p.y, w: p.width };
          const joinL = solidAt(p.y).some((q) => q !== p && Math.abs(q.x + q.width - p.x) <= 2), joinR = solidAt(p.y).some((q) => q !== p && Math.abs(q.x - (p.x + p.width)) <= 2);
          // (a turn's catch stays across its vine (a body's 6 px in from its ends, as vineCuts reads it); else the piece keeps the end it
          //  was laid for, SLIDE.back either side of its fall line)
          const [lo, hi] = m.turn ? [m.turn.x - 7, m.turn.x + 7] : [served[k].x - SLIDE.back, served[k].x + SLIDE.back];
          // (a catch that passes its storey may also leave the wood run on level with it: the run it closes (to the wall, or onto the
          //  storey's far side) is what passes, so its ends are laid free too, a slot's margin off that wood (fair). The drafted 3-1's
          //  catch 761-1239 joined both ways ran 581 to the wall over its storey 756-986 (cap-steps alone, normal 12 and 13), ENG-CATCH-d)
          const free = m.what === 'pass';
          const as: number[] = [], bs: number[] = [];
          if (joinL) as.push(p.x);
          if (!joinL || free) for (let x = Math.floor(lo); x >= Math.max(24, hi - TOWER.catchW); x -= 10) as.push(x);
          if (joinR) bs.push(p.x + p.width);
          if (!joinR || free) for (let x = Math.ceil(hi); x <= Math.min(width - 24, lo + TOWER.catchW); x += 10) bs.push(x);
          const ys = [p.y];
          if (!joinL && !joinR) {
            const [y0, y1] = m.turn ? [m.turn.from + HEAD, m.turn.to - HEAD] : [served[k].y + HEAD, served[k].y + most - 4];
            for (let y = y0; y <= y1; y += 10) if (Math.abs(y - p.y) > 2 && y < floorY - TOWER.hop) ys.push(y);
            ys.sort((u, v) => Math.abs(u - p.y) - Math.abs(v - p.y));
          }
          const at = all.indexOf(p);
          all.splice(at, 1);
          rooms = undefined;
          const widest = Math.max(TOWER.catchW, was.w);
          for (const y of ys) {
            const cands: Array<[number, number]> = [];
            for (const a of as) for (const b of bs) if (b - a >= 60 && b - a <= widest && !(a === was.x && b === was.x + was.w && y === was.y)) cands.push([a, b]);
            cands.sort((u, v) => Math.abs(u[0] - was.x) + Math.abs(u[1] - was.x - was.w) - Math.abs(v[0] - was.x) - Math.abs(v[1] - was.x - was.w));
            for (const [a, b] of cands) {
              if (tries <= 0) break;
              if (!endsLand(a, b, y) || fair(a, b, y, L, []) < 0) continue;
              if (keep(k, a, b, y, L, served[k])) { mended = true; break; }
            }
            if (mended || tries <= 0) break;
          }
          if (!mended) { p.x = was.x; p.y = was.y; p.width = was.w; all.splice(at, 0, p); }
          rooms = undefined;
          if (mended) break;
        }
        // 2. wood under a fall line the miss names, within `most`, run on at its own height out under it (a bridge from any wood, the
        //    lay's own included, however near under the end: rule 2 bridges only from a body's height down), SLIDE kept along the run
        //    it joins, never over a jump its storey was laid with (overGap)
        // 3. a catch under the catch: a bough of its own under a fall line the miss names
        // 4. (trimKeep) 2's and 3's wood refused only by the tower's own pieces in its way, laid with those pieces trimmed back off it
        for (const trim of [false, true]) {
          for (const gen of [runOns, boughs]) for (const c of gen(m, L)) {
            if (mended || tries <= 0) break;
            if (!endsLand(c.a, c.b, c.y)) continue;
            const fairly = fair(c.a, c.b, c.y, c.L, c.but) >= 0;
            if (!trim ? fairly && keep(undefined, c.a, c.b, c.y, c.L, c.serve) : !fairly && trimKeep(undefined, c.a, c.b, c.y, c.L, c.but, c.serve)) mended = true;
          }
          if (mended || tries <= 0) break;
        }
        rooms = undefined;
      }
      if (!mended) break;
    }
  }

  /**
   * Going down, a piece the lay laid whose OWN end is still a blind drop once the lay is done (no later pass caught it) is laid again
   * shorter or moved along, still under the end it was laid for (SLIDE.back of it either side of that fall line), with any end joined
   * to level wood kept; a piece joined to none may also lie at another height under that end (its own height first, then the nearest,
   * a head's room under the end at the least and in view of it): the first fair lay whose own ends land in view (lands), kept only if
   * it leaves fewer open ends.
   * A lay with no blind drop left is never touched. The drafted 3-1's catch 934-1114 under a bridge's end overhung the exit shelf
   * and dropped 370 px (Easy 1), and a bridge 718-934 ended 6 px past its shelf's end and dropped 323 px (seed 5, both settings),
   * ENG-CATCH.
   */
  function reLay(): void {
    for (let k = 0; k < laid.length; k++) {
      const p = laid[k], ex = served[k].x;
      const before = openEnds(all, floorY, most, width);
      if (!before.some((o) => o.p === p)) continue;
      const level = (q: Platform) => q !== p && q.type === 'solid' && Math.abs(q.y - p.y) <= 1;
      const joinL = all.filter((q) => level(q) && Math.abs(q.x + q.width - p.x) <= 2), joinR = all.filter((q) => level(q) && Math.abs(q.x - (p.x + p.width)) <= 2);
      const span = (from: number, to: number, keep: number | undefined) => {
        if (keep !== undefined) return [keep];
        const xs: number[] = [];
        for (let x = from; from < to ? x <= to : x >= to; x += from < to ? 10 : -10) xs.push(Math.round(x));
        return xs;
      };
      // (free ends from the furthest in to the fall line's SLIDE.back: the most footing first, never wider than it was or catchW)
      const as = span(Math.max(24, ex - TOWER.catchW), ex - SLIDE.back, joinL.length ? p.x : undefined);
      const bs = span(Math.min(width - 24, ex + TOWER.catchW), ex + SLIDE.back, joinR.length ? p.x + p.width : undefined);
      const widest = Math.max(TOWER.catchW, p.width);
      const ys = [p.y];
      if (!joinL.length && !joinR.length) {
        for (let y = served[k].y + HEAD; y <= served[k].y + most - 4; y += 10) if (Math.abs(y - p.y) > 2 && y < floorY - TOWER.hop) ys.push(y);
        ys.sort((a, b) => Math.abs(a - p.y) - Math.abs(b - p.y));
      }
      const at = all.indexOf(p);
      all.splice(at, 1);
      rooms = undefined;
      let done = false;
      for (const y of ys) {
        for (const a of y === p.y ? as : [...as, p.x]) {
          for (const b of y === p.y ? bs : [...bs, p.x + p.width]) {
            if (b - a < 60 || b - a > widest || (a === p.x && b === p.x + p.width && y === p.y) || !lands(a, b, y)) continue;
            if (fair(a, b, y, lv.get(p) ?? 0, [...joinL, ...joinR]) < 0) continue;
            const q = { ...p, x: a, y, width: b - a } as Platform;
            if (openEnds([...all, q], floorY, most, width).length >= before.length) continue;
            p.x = a; p.y = y; p.width = b - a;
            out[k].x = a; out[k].y = y; out[k].w = b - a;
            done = true;
            break;
          }
          if (done) break;
        }
        if (done) break;
      }
      all.splice(at, 0, p);
      rooms = undefined;
    }
  }
}

/** how far a way down's catch bough (towerCatches rule 4) may lie along from the centre under an open end: at least `out` px of it
 *  past the end's fall line, the way he walks off (the centred bough has catchW / 2), and `back` px behind it (he steps 24 px past
 *  the lip before he drops) */
const SLIDE = { out: 60, back: 30 } as const;

/** the down tower's mend (towerCatches mend): at most `steps` remedies kept and `checks` tried in all (each kept one takes a miss off the
 *  invariant, so it converges), the first `lines` fall lines of a miss read, and a new catch's widths, widest first (SLIDE keeps the least:
 *  out + back); remedy 4 trims at most `trimmed` of the tower's own pieces for one piece of wood, each to `trim` px at the least (a
 *  footing, as reLay keeps) */
const MEND = { steps: 16, checks: 400, lines: 6, widths: [180, 160, 140, 120, 100, 90], trim: 60, trimmed: 3 } as const;
/** how far past a lip his middle is when he drops (offEnd's step: half his body and a margin) */
const LIP = 24;

/** a way down's no-slot lay (towerCatches, `slotted`): within `step` px in height of the wood beside it, a bough's gap to that wood
 *  is at most `walk` (a crack he walks across: under half his body, so his middle never leaves wood) or at least `clear` (his body,
 *  2 x BODY_HALF = 42 px, plus a 24 px margin: he steps 24 px past a lip before he drops, SLIDE.back's note) */
const SLOT = { step: 8, walk: 21, clear: 42 + 24 } as const;

/**
 * A WALLED end: going down, the end of the run of wood at height `y` (its end at `end`, stepping off toward `dir`) is no way off when
 * other wood, not level with it (past SLOT.step), lies within his half-width past that end (WALL_HALF: he drops once his middle is
 * past the end) with its own body (its top to its underside) inside his (BODY_H over his feet): he walks into its side and stands
 * there. 28 px past an end, 8 px into his height, he goes by (the same lay's Normal 22, y 11421). ENG-DOWNBOT's catch across a
 * climb vine (stopVines) was laid 17 px from a 90 px log 73 px over it (the drafted 3-1 Normal 22) and flush with a bough 62 px over it
 * (Easy 37): handOn and the route stepped off that end, and the kid, the middle and the adult stood at it, turning, until rescued (the
 * rescue kinds 'a waist-high step ahead, a drop ahead, a trunk beside him', new on every x40 since the merge, ENG-DARK box 17).
 */
/** his half-width (engine.ts: the player is 44 px wide): how far past an end his body still reaches when he starts to drop */
const WALL_HALF = 22;
export function walledEnd(platforms: ReadonlyArray<Pick<Platform, 'x' | 'y' | 'width' | 'type'> & { height?: number }>, end: number, dir: -1 | 1, y: number): boolean {
  const a = dir < 0 ? end - WALL_HALF : end, b = dir < 0 ? end : end + WALL_HALF;
  return platforms.some((q) => q.type !== 'fragile' && q.type !== 'bouncy' && q.y < y - SLOT.step && q.y + (q.height ?? 24) > y - BODY_H
    && q.x < b && q.x + q.width > a);
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
 * Straight up at the top of every climbing vine lands him on the wood there, whichever way he faces (STAGE-RULES §1: straight up always
 * climbs; D46: the plain action lands, never only a mid-air correction). Read with the engine's own finder (vineTop.ts vaultSide and
 * ledgeOut, D19): each vine whose straight-up vault, facing either way, goes toward no wood it lands on, by name. Until 11-13 the
 * engine's finder never saw a cleared vine's bough, and 1-4's turn-backs vaulted him off the storey above (B14c).
 */
export function towerVaults(vines: readonly Vine[], platforms: readonly Platform[]): string[] {
  const out: string[] = [];
  for (const v of vines) {
    if (v.vineType !== 'tree_climb') continue;
    const f = ([1, -1] as const).find((face) => ledgeOut(v, platforms, vaultSide(v, platforms, face)) === 0);
    if (f === undefined) continue;
    const side = vaultSide(v, platforms, f);
    out.push(`tower: straight up at the top of the vine at x ${Math.round(v.x)} (y ${Math.round(v.topY)}), facing ${f > 0 ? 'right' : 'left'}, vaults him ${side > 0 ? 'right' : 'left'} onto no wood`);
  }
  return out;
}

/** the sound wood across a climb vine between its top and its foot, each pair (a body's 6 px in from the wood's ends, 10 px clear of the
 *  vine's top and foot: wood the vine merely stands on or hangs from is not across it) */
export function vineCuts(vines: readonly Vine[], platforms: readonly Platform[]): Array<{ v: Vine; p: Platform }> {
  const out: Array<{ v: Vine; p: Platform }> = [];
  for (const v of vines) {
    if (v.vineType !== 'tree_climb') continue;
    for (const p of platforms) if (p.type === 'solid' && p.x + 6 < v.x && p.x + p.width - 6 > v.x && p.y > v.topY + 10 && p.y < v.bottomY - 10) out.push({ v, p });
  }
  return out;
}

/**
 * Going down, a climb vine stops on the highest wood across it (the lead's ruling (b), ENG-DOWNBOT 11-25): a turn's drop is 347-351 px,
 * past TOWER.see, so towerCatches owes a catch under the end the vine hangs from, and the catch lay across the vine (247 cuts on 24 of
 * 24 drafted 3-1 rolls: a vine through a shelf). The catch is a landing on the way down: he climbs down onto it and walks off its end,
 * whose drop towerFalls holds within TOWER.see like every other end's.
 */
export function stopVines(vines: readonly Vine[], platforms: readonly Platform[]): void {
  for (const { v, p } of vineCuts(vines, platforms)) v.bottomY = Math.min(v.bottomY, p.y);
}

/** a way down's vines, each one wood lies across by name (empty: kept): the verdict 'a catch crosses a vine' (stopVines) */
export function towerVineCuts(vines: readonly Vine[], platforms: readonly Platform[]): string[] {
  return vineCuts(vines, platforms).map(({ v, p }) => `tower: a catch crosses a vine: the piece at x ${Math.round(p.x)}-${Math.round(p.x + p.width)}, y ${Math.round(p.y)} lies across the vine at x ${Math.round(v.x)} (y ${Math.round(v.topY)}-${Math.round(v.bottomY)})`);
}

/** the run of sound wood at height `y` that the span x0-x1 is part of: wood level with it (1 px), end to end (2 px) */
function runOf(solid: readonly Platform[], x0: number, x1: number, y: number): { a: number; b: number; y: number } {
  let a = x0, b = x1, grew = true;
  while (grew) {
    grew = false;
    for (const q of solid) if (Math.abs(q.y - y) <= 1 && q.x <= b + 2 && q.x + q.width >= a - 2 && (q.x < a || q.x + q.width > b)) { a = Math.min(a, q.x); b = Math.max(b, q.x + q.width); grew = true; }
  }
  return { a, b, y };
}

/**
 * Where stepping off the ends of the run of wood at (x0-x1, y) takes him, a body's width past each end, run after run he lands on:
 * 'ok' when he comes down onto wood at the storey's height `to` (2 px) before any landing below it; 'open' when none does but a drop
 * is past `most` (going down a catch is still owed there, towerCatches); else 'past' (every way off lands below the storey, or there
 * is none). `first`: the landings off the run's own ends (none: it runs wall to wall). `trail`: each way off he was followed along
 * (its fall line and the height he steps off at), in the order walked: where a landing at the storey's height would hand him on.
 */
export function handOn(platforms: readonly Platform[], x0: number, x1: number, y: number, to: number, width: number, most = Infinity): { state: 'ok' | 'open' | 'past'; run: { a: number; b: number; y: number }; first: Array<number | undefined>; trail: Array<{ x: number; y: number; dir: -1 | 1 }> } {
  const solid = platforms.filter((p) => p.type === 'solid');
  const run = runOf(solid, x0, x1, y);
  // (a walled end is no way off: walledEnd)
  const offs = (r: { a: number; b: number; y: number }) => [offEnd(r.a, -1, width), offEnd(r.b, 1, width)].filter((x, i): x is number => x !== null && !walledEnd(platforms, i ? r.b : r.a, i ? 1 : -1, r.y)).map((x) => ({ x, l: catchUnder(platforms, x, r.y, 100000) }));
  const first = offs(run).map((o) => o.l);
  const trail: Array<{ x: number; y: number; dir: -1 | 1 }> = [];
  let open = false;
  const todo = [run], seen = new Set([`${run.a} ${run.y}`]);
  for (let k = 0; k < todo.length && k < 60; k++) {
    for (const { x, l } of offs(todo[k])) {
      trail.push({ x, y: todo[k].y, dir: x < todo[k].a ? -1 : 1 });
      if (l === undefined) continue;
      if (l - todo[k].y > most) { open = true; continue; }
      if (Math.abs(l - to) <= 2) return { state: 'ok', run, first, trail };
      if (l > to + 2) continue;
      const q = platforms.find((p) => p.type !== 'fragile' && Math.abs(p.y - l) < 0.5 && x >= p.x && x <= p.x + p.width)!;
      const r = q.type === 'solid' ? runOf(solid, q.x, q.x + q.width, l) : { a: q.x, b: q.x + q.width, y: l };
      if (!seen.has(`${r.a} ${r.y}`)) { seen.add(`${r.a} ${r.y}`); todo.push(r); }
    }
  }
  return { state: open ? 'open' : 'past', run, first, trail };
}

/**
 * Going down, a stopped vine's catch hands him on to the turn's own storey (the lead's ruling on LAY finding 2, ENG-DOWNBOT 11-25):
 * the catch is the wood the vine stops on (stopVines) with any wood run on level with it, end to end; stepping off its ends, and on
 * off whatever he lands on, he comes down onto wood at the storey's height before he lands below it (handOn). A catch run on over
 * ALL of its storey sends him past it (normal 1: off the catch 581-1280 at y 11711 onto 11825, then 12062, past its storey 729-1144
 * at y 11889), so that storey's leg is skipped; a catch run on wall to wall has no way off.
 * Each turn whose catch hands him past its storey, by name (empty: kept). `turns`: each going-down turn's vine x and storeys.
 */
export function towerHandOns(turns: ReadonlyArray<{ x: number; from: number; to: number }>, platforms: readonly Platform[], width: number): string[] {
  return handOnMisses(turns, platforms, width).map((m) => m.line);
}

/** towerHandOns' misses: each with the catch, the turn's storey and the ways off he was followed along (handOn's trail) */
function handOnMisses(turns: ReadonlyArray<{ x: number; from: number; to: number }>, platforms: readonly Platform[], width: number): Array<{ line: string; c: Platform; turn: { x: number; from: number; to: number }; trail: Array<{ x: number; y: number; dir: -1 | 1 }> }> {
  const out: Array<{ line: string; c: Platform; turn: { x: number; from: number; to: number }; trail: Array<{ x: number; y: number; dir: -1 | 1 }> }> = [];
  const solid = platforms.filter((p) => p.type === 'solid');
  for (const t of turns) {
    if (!(t.to > t.from)) continue;
    // (the catch: the highest wood the vine stops on between its storeys, as vineCuts reads wood across a vine)
    const c = solid.filter((p) => p.x + 6 < t.x && p.x + p.width - 6 > t.x && p.y > t.from + 10 && p.y < t.to - 10).sort((a, b) => a.y - b.y)[0];
    if (!c) continue;
    const h = handOn(platforms, c.x, c.x + c.width, c.y, t.to, width);
    if (h.state === 'ok') continue;
    out.push({ c, turn: { x: t.x, from: t.from, to: t.to }, trail: h.trail, line: `tower: a catch passes its storey: the catch at x ${Math.round(h.run.a)}-${Math.round(h.run.b)}, y ${Math.round(c.y)}, where the vine at x ${Math.round(t.x)} stops, hands him past its storey at y ${Math.round(t.to)} (${h.first.length ? `off its ends he lands at y ${h.first.map((y) => (y === undefined ? 'nothing' : Math.round(y))).join(' and ')}, and never comes down at its storey's height` : 'it runs wall to wall: no way off'})` });
  }
  return out;
}

/** one miss of THE DOWN TOWER'S INVARIANT (downInvariant), by name: `line` is the verdict's own line; `piece` the wood it is of (the end's
 *  piece, or the turn's catch); `at` the fall lines a landing would mend (the end's, or every way off the catch he was followed along) */
export interface DownMiss { what: 'drop' | 'gives' | 'pass' | 'lid'; line: string; piece?: Platform; at: Array<{ x: number; y: number; dir: -1 | 1 }>; turn?: { x: number; from: number; to: number } }

/**
 * THE DOWN TOWER'S INVARIANT (ENG-CATCH-c, R-165.534; D154): going down, no piece end's fall line drops him more than TOWER.see (his landing
 * is in view, D46: towerFalls), no piece gives way over a blind drop, no turn's catch hands him past the storey it serves (towerHandOns), and
 * nothing lies in his hop's room (towerLids). Read with the vines where the stage will hang them (clearClimbs: climbX) and stop them
 * (stopVines), so the lay (towerCatches, which keeps it) and the stage's verdict read one tower. Each miss by name; empty: kept.
 * `turns`: the column's turn vines by id, with the storeys each joins (pipeline.ts turns).
 */
export function downInvariant(platforms: readonly Platform[], vines: readonly Vine[], turns: ReadonlyArray<{ id: number; from: number; to: number }>, floorY: number, width: number): DownMiss[] {
  const hung = vines.map((v) => ({ ...v, x: climbX(v, platforms) }));
  stopVines(hung, platforms);
  const out: DownMiss[] = fallMisses('down', platforms, floorY, width).map((m) => (m.x === undefined ? { what: 'gives', line: m.line, piece: m.p, at: [] } : { what: 'drop', line: m.line, piece: m.p, at: [{ x: m.x, y: m.p.y, dir: m.x < m.p.x ? -1 : 1 }] }));
  const T = turns.flatMap((t) => { const v = hung.find((q) => q.id === t.id); return v ? [{ x: v.x, from: t.from, to: t.to }] : []; });
  for (const m of handOnMisses(T, platforms, width)) out.push({ what: 'pass', line: m.line, piece: m.c, at: m.trail, turn: m.turn });
  for (const line of towerLids(hung, platforms)) out.push({ what: 'lid', line, at: [] });
  return out;
}

/** the room a hop or a climb-off needs over the wood it leaves (px): a plain jump's rise, his body and a bough's thickness. Going down
 *  nothing lies lower than this over a dip's lip (his hop across the dip lands on it, or he hits his head on it) or over a climb
 *  vine's top (a jump at the top lands on it, the climb-off vault hits it): towerLids. Seed 13 normal of drafted 3-1 laid a shelf
 *  108 px over a storey, its end 4 px past the dip's lip and roofing the next turn vine's top: a dead end in a jump's reach, and the
 *  kid and the adult stood under it until rescued (ENG-DOWNBOT) */
export const ROOF = Math.ceil(JUMP_RISE) + BODY_H + 24;
/** how far along past a dip's lip that room is kept (px): his run-up to the lip; and either side of a climb vine: his body on it (the
 *  half-width the engine snaps to the vine, vineTop.ts CLIMB_CLEAR's 21). A bough that ends past that beside the vine's top (normal 2:
 *  24 px past it, 18 px over its ledge) is not over his head */
const ROOF_SIDE = 30, BODY_HALF = 21;

/** the rooms (each `[x0, x1]` along, `y` the wood it is kept over) a hop or a climb-off needs: over every dip (two pieces level, 20-200 px
 *  apart, wood 20-150 px lower across the gap: the storey's hop) from ROOF_SIDE before the near lip to ROOF_SIDE past the far one, and
 *  over every climb vine's top, BODY_HALF either side of where it stands. `cleared`: the vines already stand off their boughs' faces
 *  (the stage, towerLids); else (the lay, towerCatches, before clearClimbs) each is read where clearClimbs will stand it (climbX) */
export function hopRooms(platforms: readonly Platform[], vines: readonly Vine[], cleared = true): Array<{ x0: number; x1: number; y: number; what: 'dip' | 'vine'; at: number }> {
  const out: Array<{ x0: number; x1: number; y: number; what: 'dip' | 'vine'; at: number }> = [];
  const solid = platforms.filter((p) => p.type === 'solid');
  for (const a of solid) {
    const ar = a.x + a.width;
    // (the nearest piece level with it to its right: the far lip)
    let b: Platform | undefined;
    for (const q of solid) if (q !== a && Math.abs(q.y - a.y) < 4 && q.x - ar > 20 && q.x - ar < 200 && (!b || q.x < b.x)) b = q;
    if (!b || solid.some((q) => q !== a && q !== b && Math.abs(q.y - a.y) < 4 && q.x < b!.x && q.x + q.width > ar)) continue;
    if (!solid.some((d) => d.y > a.y + 20 && d.y < a.y + 150 && d.x <= ar + 4 && d.x + d.width >= b!.x - 4)) continue;
    out.push({ x0: ar - ROOF_SIDE, x1: b.x + ROOF_SIDE, y: a.y, what: 'dip', at: ar });
  }
  for (const v of vines) {
    if (v.vineType !== 'tree_climb') continue;
    const x = cleared ? v.x : climbX(v, platforms);
    out.push({ x0: x - BODY_HALF, x1: x + BODY_HALF, y: v.topY, what: 'vine', at: x });
  }
  return out;
}

/** the room (hopRooms) wood at `x0-x1`, `y` lies in: over its wood by more than a step (4 px) and less than ROOF */
export function inRoom(rooms: ReturnType<typeof hopRooms>, x0: number, x1: number, y: number): ReturnType<typeof hopRooms>[number] | undefined {
  return rooms.find((r) => x0 < r.x1 && x1 > r.x0 && y < r.y - 4 && y > r.y - ROOF);
}

/**
 * Going down, his hop's room, each miss by name (empty: kept): two verdicts, read with the rooms the lay keeps (hopRooms, towerCatches):
 *   - 'a lid over a dip's lip': wood within ROOF over a dip's lip, ROOF_SIDE either way of it (his hop across lands on it or hits it);
 *   - 'a roof over a vine's top': wood within ROOF over a climb vine's top (a jump at the top lands on it, the climb-off hits it).
 */
export function towerLids(vines: readonly Vine[], platforms: readonly Platform[]): string[] {
  const out: string[] = [];
  const rooms = hopRooms(platforms, vines);
  for (const q of platforms) {
    if (q.type !== 'solid') continue;
    const r = inRoom(rooms, q.x, q.x + q.width, q.y);
    if (!r) continue;
    const at = `wood at x ${Math.round(q.x)}-${Math.round(q.x + q.width)}, y ${Math.round(q.y)}, lies ${Math.round(r.y - q.y)} px over`;
    out.push(r.what === 'dip' ? `tower: a lid over a dip's lip: ${at} the lip at x ${Math.round(r.at)} (y ${Math.round(r.y)}), in his hop (${ROOF} px)` : `tower: a roof over a vine's top: ${at} the top of the vine at x ${Math.round(r.at)} (y ${Math.round(r.y)}), in his climb-off (${ROOF} px)`);
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
  return fallMisses(flow, platforms, floorY, width).map((m) => m.line);
}

/** towerFalls' misses: each with its piece and, for an end, its fall line (x) */
function fallMisses(flow: 'up' | 'down', platforms: readonly Platform[], floorY: number, width: number): Array<{ line: string; p: Platform; x?: number }> {
  const most = flow === 'up' ? TOWER.fall : TOWER.see;
  const out: Array<{ line: string; p: Platform; x?: number }> = openEnds(platforms, floorY, most, width).map(({ p, x, drop }) => ({ p, x, line: flow === 'up'
    ? `tower: a fall off the piece at x ${Math.round(p.x)}-${Math.round(p.x + p.width)}, y ${Math.round(p.y)} drops ${drop === Infinity ? 'out of the tower' : `${Math.round(drop)} px`} (sound wood within ${TOWER.fall})`
    : `tower: a blind drop off the piece at x ${Math.round(p.x)}-${Math.round(p.x + p.width)}, y ${Math.round(p.y)}: ${drop === Infinity ? 'nothing under it' : `${Math.round(drop)} px to its landing`} (in view: within ${TOWER.see})` }));
  // (a piece that gives way under him, a crumbling tile or a creaky limb: where it drops him, at its middle and a body in from each
  // end, sound wood catches him inside the same limit)
  for (const p of platforms) {
    if (p.type !== 'fragile' || p.y >= floorY - 1) continue;
    const xs = p.width > 64 ? [p.x + 24, p.x + p.width / 2, p.x + p.width - 24] : [p.x + p.width / 2];
    const drop = Math.max(...xs.map((x) => { const land = catchUnder(platforms, x, p.y, 100000); return land === undefined ? Infinity : land - p.y; }));
    if (drop > most) out.push({ p, line: `tower: the piece at x ${Math.round(p.x)}-${Math.round(p.x + p.width)}, y ${Math.round(p.y)} gives way over ${drop === Infinity ? 'nothing' : `a ${Math.round(drop)} px drop`} (sound wood within ${most})` });
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
