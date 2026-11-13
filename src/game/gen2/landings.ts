/**
 * R-165.124, "No dead-zone landings" (STAGE-RULES §1; Matt, 11-06 and 11-11: "if I jump from a ledge, I can get either to a platform or I
 * can comfortably fall onto it, but it can't be in the in-between"), and R-165.126's bounce part ("a bounce mushroom only where a bounce
 * is needed or leads somewhere worth going"), judged on a built stage's pieces with the flights FLOWN on the real engine
 * (landFlights.data.ts; landFlights.test.ts proves the table is the engine's).
 *
 * A landing is reached CLEANLY when one plain flight puts him on it, holding the way he goes and nothing else:
 *   - walked on: a piece beside it at its level or up to the hoist's MANTLE under it;
 *   - a walk-off: walking off a ledge's end at full speed, the FIRST piece he lands on is this one, his middle LAND_IN inside its ends;
 *   - a full jump (single or double, held or straight up) or a bounce (alone or with the air jump): from a ledge (a mushroom's cap), every take-off in a
 *     window of at least JUMP_WINDOW px lands on it FIRST. A piece whose top his arc rises past catches him on the way down: that is the
 *     "log above" of Matt's report, the ceiling that cuts the arc (the engine has no head bump: engine.ts platform collisions).
 * A landing no clean flight reaches is a dead zone (reachable only by a mid-air correction: run at just the right speed, or start falling
 * and then jump). Judged: every piece a pickup sits on, and the landing of every ask the builder laid.
 *
 * The collisions are the engine's (engine.ts "Platform Collisions" and "Solid ground blocks"): caught from above when his feet cross a
 * top within CATCH_DROP and his middle is within LAND_SIDE of its ends; a solid piece WALL_H or taller stops him from the side unless his
 * feet are within MANTLE of its top (the hoist: a landing on it). Nothing here names a stage, a seed or an x.
 */
import type { Difficulty } from '../difficulty.ts';
import { FORGIVE, WALL_H } from '../physics.ts';
import type { Flight, FlightPath } from './landFlights.ts';
import { LAND_FLIGHTS } from './landFlights.data.ts';

/** a piece as the judge reads it (Platform's fields) */
export interface LandPiece { x: number; y: number; width: number; height: number; type: string; broken?: boolean }
export interface LandPickup { x: number; y: number; type: string }

/** his middle may hang this far past a top and still stand or be caught (engine.ts: width 44 x 0.26, the unassisted figure) */
export const LAND_SIDE = { px: 44 * 0.26, source: 'engine.ts platform collisions: p.width 44 x side 0.26' } as const;
/** a falling foot crossing a top is caught this far under it (engine.ts catchDrop 14, the unassisted figure) */
export const CATCH_DROP = { px: 14, source: 'engine.ts platform collisions: catchDrop 14' } as const;
/** half his body's width at a wall (engine.ts "Solid ground blocks": half 19) */
export const WALL_HALF = { px: 19, source: 'engine.ts solid ground blocks: half = 19' } as const;
/** the hoist onto a face whose top is this far over his feet (physics.ts FORGIVE.mantle) */
export const MANTLE = { px: FORGIVE.normal.mantle, source: 'physics.ts FORGIVE.mantle' } as const;
/** a walk-off lands with margin: his middle this far inside both ends (half his 32 px body, promises11 BODY_W) */
export const LAND_IN = { px: 16, source: 'half his body (promises11.ts BODY_W 32 px)' } as const;
/** a jump or a bounce lands with margin: every take-off over this many px lands on it (three frames of his full run, 285 px/s at 30 fps) */
export const JUMP_WINDOW = { px: 28, source: 'three frames at PHYS.maxRun 285 px/s, 30 fps' } as const;
/** sources this far from a landing (px, either side) are tried: past every flight's reach over a 1-1 drop */
const NEAR = 700;
/** a pickup stands on the highest top this far under it (a petal on a log floats 30-60 px over it) */
export const PICKUP_OVER = { px: 110, source: 'a petal on a log floats 30-60 px over its top (pipeline petal lines)' } as const;
/** the pickups the rule reads: what he collects (not doors, cages or gates) */
const COLLECTED = new Set(['fruit', 'flower', 'leaf', 'heart', 'super_heart', 'find', 'seed', 'relic']);

const standable = (p: LandPiece) => !p.broken && p.type !== 'bouncy';
const isWall = (p: LandPiece) => !p.broken && p.type === 'solid' && p.height >= WALL_H;

type Outcome = { piece: LandPiece; frame: number; x: number } | null;
interface Ev { frame: number; lo: number; hi: number; piece: LandPiece | null; dx: number }

/**
 * Every event a flight can meet among `pieces`, as the take-off x interval it happens for (dir +1 right, -1 left): a catch on a top
 * (descending, the first frame his feet cross it within CATCH_DROP), a bounce off a cap (the same), a side stop by a wall (piece null).
 */
/** the highest his feet reach from each frame on (the least dy), per path */
const SUFFIX = new WeakMap<FlightPath, number[]>();
function suffixMin(path: FlightPath): number[] {
  let m = SUFFIX.get(path);
  if (!m) {
    m = new Array<number>(path.length);
    for (let k = path.length - 1, lo = Infinity; k >= 0; k--) m[k] = lo = Math.min(lo, path[k][1]);
    SUFFIX.set(path, m);
  }
  return m;
}

/**
 * A flight's first catch frame on a top `top` px under its take-off (his feet descending across it within CATCH_DROP), -1 for none: the
 * scan events() made for every piece, done once per path and top (R-165.163: tops repeat across a stage's pieces and ledges)
 */
const CATCHES = new WeakMap<FlightPath, Map<number, number>>();
function catchFrame(path: FlightPath, top: number): number {
  let m = CATCHES.get(path);
  if (!m) CATCHES.set(path, (m = new Map()));
  let f = m.get(top);
  if (f === undefined) {
    f = -1;
    for (let i = 1; i < path.length; i++) {
      const d0 = path[i - 1][1], d1 = path[i][1];
      if (d1 > d0 && d0 <= top + CATCH_DROP.px && d1 >= top) { f = i; break; }
    }
    m.set(top, f);
  }
  return f;
}

/**
 * The frames a wall `height` tall, its top `top` px under the take-off, has his body at its face (feet under its top, head over its
 * underside), each with whether the rest of the flight brings his feet within the hoist (MANTLE) of its top: the scan events() made for
 * every wall, once per path, top and height (R-165.163)
 */
const STOPS = new WeakMap<FlightPath, Map<string, ReadonlyArray<readonly [number, boolean]>>>();
function stopFrames(path: FlightPath, top: number, height: number): ReadonlyArray<readonly [number, boolean]> {
  let m = STOPS.get(path);
  if (!m) STOPS.set(path, (m = new Map()));
  const k = `${top} ${height}`;
  let f = m.get(k);
  if (!f) {
    const highest = suffixMin(path), out: Array<readonly [number, boolean]> = [];
    for (let i = 1; i < path.length; i++) {
      const feet = path[i][1], head = feet - 48;
      if (feet > top && head < top + height) out.push([i, highest[i] <= top + MANTLE.px]);
    }
    m.set(k, (f = out));
  }
  return f;
}

export function events(path: FlightPath, y0: number, dir: 1 | -1, pieces: readonly LandPiece[], self: LandPiece | null): Ev[] {
  const out: Ev[] = [];
  for (const P of pieces) {
    if (P.broken) continue;
    const top = P.y - y0;
    // a catch on its top
    const i = catchFrame(path, top);
    if (i > 0) {
      const dx = path[i][0];
      const side = P.type === 'bouncy' ? 12 : LAND_SIDE.px;
      const [a, b] = [P.x - side, P.x + P.width + side];
      out.push(dir > 0 ? { frame: i, lo: a - dx, hi: b - dx, piece: P, dx } : { frame: i, lo: a + dx, hi: b + dx, piece: P, dx });
    }
    if (!isWall(P)) continue;
    // a side stop: his body enters the face from his side this frame, with the face beside him (feet under its top, head over its
    // underside). The engine stops his way there and his rise or fall goes on along the face: when the rest of the flight brings his
    // feet within the hoist (MANTLE) of its top he is hoisted (or carried over) onto it, a landing on it; else he slides down the face, a
    // flight stopped (piece null)
    for (const [i, hoist] of stopFrames(path, top, P.height)) {
      const x0 = path[i - 1][0], x1 = path[i][0];
      const onto = hoist ? P : null;
      if (dir > 0) {
        // (his right side was at or left of the face, P.x + 2, and is past it now)
        const lo = P.x - WALL_HALF.px - x1, hi = P.x + 2 - WALL_HALF.px - x0;
        if (hi > lo) out.push({ frame: i, lo, hi, piece: onto, dx: x1 });
      } else {
        const R = P.x + P.width;
        const lo = R - 2 + WALL_HALF.px + x0, hi = R + WALL_HALF.px + x1;
        if (hi > lo) out.push({ frame: i, lo, hi, piece: onto, dx: x1 });
      }
    }
  }
  return out.sort((a, b) => a.frame - b.frame || (a.piece && b.piece ? a.piece.y - b.piece.y : 0));
}

/** the first event a take-off at x meets (null: none, he falls past everything flown) */
function first(evs: readonly Ev[], x: number): Ev | null {
  for (const e of evs) if (x > e.lo && x < e.hi) return e;
  return null;
}

export type CleanWay = { how: 'walked-on' | 'walk-off' | Flight; from: LandPiece; window?: number };

const JUMPS: readonly Flight[] = ['jump', 'double', 'jump-up', 'double-up'];
const SINGLES: readonly Flight[] = ['jump', 'jump-up'];
const BOUNCES: readonly Flight[] = ['bounce', 'bounce-air', 'bounce-up', 'bounce-air-up'];

/** the take-off x span of a ledge (his middle over its top, LAND_SIDE past each end) or a cap (12 past each end) */
const takeOff = (S: LandPiece): readonly [number, number] => S.type === 'bouncy' ? [S.x - 12, S.x + S.width + 12] : [S.x - LAND_SIDE.px, S.x + S.width + LAND_SIDE.px];

/**
 * One stage's flights, each flown once from each source and kept (a stage judges dozens of landings from the same ledges): from a ledge
 * (or a cap) and a way, the piece each flight lands on first, and for a jump or a bounce the widest take-off window per piece it lands on.
 * R-165.163 (1-1's stage build): each flight from a ledge one way is flown only when asked for and kept by itself, so a landing asks only
 * for the flights whose events on it can meet the ledge's take-off span, and each landing's way is kept once judged; every answer is the
 * one the whole set of flights gives.
 */
export class Landings {
  private readonly byX: LandPiece[];
  private readonly nears = new Map<LandPiece, LandPiece[]>();
  private readonly walks = new Map<LandPiece, Array<{ piece: LandPiece | null; mid: number }>>();
  /** per ledge, per flight and way ('jump+', 'double-'...): windowsOf on that one flight's events */
  private readonly flown = new Map<LandPiece, Map<string, Map<LandPiece, number>>>();
  private readonly wins = new Map<LandPiece, Map<LandPiece, number>>();
  private readonly singles = new Map<LandPiece, Map<LandPiece, number>>();
  private readonly ways = new Map<LandPiece, CleanWay | null>();
  constructor(readonly pieces: readonly LandPiece[], readonly setting: Difficulty) {
    this.byX = pieces.filter((p) => !p.broken).slice().sort((a, b) => a.x - b.x);
  }
  /** the pieces within NEAR px of a span */
  near(x0: number, x1: number): LandPiece[] {
    return this.byX.filter((p) => p.x < x1 + NEAR && p.x + p.width > x0 - NEAR);
  }
  /** the pieces within NEAR px of S, kept per S */
  private nearOf(S: LandPiece): LandPiece[] {
    let n = this.nears.get(S);
    if (!n) this.nears.set(S, (n = this.near(S.x, S.x + S.width)));
    return n;
  }
  /** a full-speed walk off each end of S: the piece it lands on first and his middle there */
  walk(S: LandPiece): Array<{ piece: LandPiece | null; mid: number }> {
    let w = this.walks.get(S);
    if (!w) {
      const near = this.nearOf(S), F = LAND_FLIGHTS[this.setting];
      w = ([1, -1] as const).map((dir) => {
        const edge = dir > 0 ? S.x + S.width : S.x;
        const e = first(events(F.walk, S.y, dir, near, S), edge);
        return { piece: e?.piece ?? null, mid: edge + dir * (e?.dx ?? 0) };
      });
      this.walks.set(S, w);
    }
    return w;
  }
  /** one flight from S one way: the widest take-off window (px) per piece it lands on first */
  private flight(S: LandPiece, how: Flight, dir: 1 | -1): Map<LandPiece, number> {
    let byS = this.flown.get(S);
    if (!byS) this.flown.set(S, (byS = new Map()));
    const k = `${how}${dir > 0 ? '+' : '-'}`;
    let m = byS.get(k);
    if (!m) {
      const [a, b] = takeOff(S);
      byS.set(k, (m = windowsOf(events(LAND_FLIGHTS[this.setting][how], S.y, dir, this.nearOf(S), S), a, b)));
    }
    return m;
  }
  /** the widest take-off window (px) from S, over every jump (a ledge) or bounce (a cap) and both ways, per piece landed on first */
  windows(S: LandPiece, single = false): Map<LandPiece, number> {
    const cache = single ? this.singles : this.wins;
    let m = cache.get(S);
    if (!m) {
      m = new Map();
      for (const how of S.type === 'bouncy' ? BOUNCES : single ? SINGLES : JUMPS) for (const dir of [1, -1] as const) {
        for (const [P, w] of this.flight(S, how, dir)) if (w > (m.get(P) ?? 0)) m.set(P, w);
      }
      cache.set(S, m);
    }
    return m;
  }
  /**
   * windows(S).get(T) ?? 0, flying only the flights whose events on T (events() on T alone: a piece's events never depend on the others)
   * meet S's take-off span: a flight with none has no midpoint in that span whose first event is T's, so it holds no window for T
   */
  private windowOnto(S: LandPiece, T: LandPiece): number {
    const all = this.wins.get(S);
    if (all) return all.get(T) ?? 0;
    const F = LAND_FLIGHTS[this.setting], [a, b] = takeOff(S);
    let w = 0;
    for (const how of S.type === 'bouncy' ? BOUNCES : JUMPS) for (const dir of [1, -1] as const) {
      if (!events(F[how], S.y, dir, [T], S).some((e) => e.piece === T && e.hi > a && e.lo < b)) continue;
      const v = this.flight(S, how, dir).get(T) ?? 0;
      if (v > w) w = v;
    }
    return w;
  }
  /**
   * Can a walk off either end of S land on T: one of T's own events holds the take-off edge. When none does, the first event there is
   * never T's and walk(S) cannot name T
   */
  private mayWalkOnto(S: LandPiece, T: LandPiece): boolean {
    const F = LAND_FLIGHTS[this.setting];
    return ([1, -1] as const).some((dir) => {
      const edge = dir > 0 ? S.x + S.width : S.x;
      return events(F.walk, S.y, dir, [T], S).some((e) => e.piece === T && edge > e.lo && edge < e.hi);
    });
  }
  /** how T is reached cleanly, or null (a dead zone); kept once judged */
  cleanWay(T: LandPiece): CleanWay | null {
    let c = this.ways.get(T);
    if (c === undefined) this.ways.set(T, (c = this.judge(T)));
    return c;
  }
  private judge(T: LandPiece): CleanWay | null {
    const near = this.near(T.x, T.x + T.width);
    // walked on: a standable piece touching it, at its level or under it by no more than the hoist
    for (const S of near) {
      if (S === T || !standable(S)) continue;
      const touch = S.x <= T.x + T.width + 2 && S.x + S.width >= T.x - 2;
      if (touch && S.y - T.y >= -2 && S.y - T.y <= MANTLE.px) return { how: 'walked-on', from: S };
    }
    // a walk-off from either end of a ledge, his middle LAND_IN inside T
    for (const S of near) {
      if (S === T || !standable(S)) continue;
      if (!this.walks.has(S) && !this.mayWalkOnto(S, T)) continue;
      for (const w of this.walk(S)) if (w.piece === T && w.mid >= T.x + LAND_IN.px && w.mid <= T.x + T.width - LAND_IN.px) return { how: 'walk-off', from: S };
    }
    // a full jump from a ledge, a bounce off a cap: a take-off window of JUMP_WINDOW
    for (const S of near) {
      if (S === T || S.broken) continue;
      const w = this.windowOnto(S, T);
      if (w >= JUMP_WINDOW.px) return { how: S.type === 'bouncy' ? 'bounce' : 'jump', from: S, window: Math.round(w) };
    }
    return null;
  }
}

/**
 * One Landings per piece set (R-165.163): a build's repair and its verdicts judge the same pieces on the same setting, and each flew every
 * ledge's flights again (4 Landings a 1-1 build). Landings reads only the pieces and the setting (LAND_FLIGHTS is a fixed table), so the
 * last few sets are kept and one is handed back only when it is the SAME piece objects, in the same order, each with the fields the
 * judge reads (x, y, width, height, type, broken) unchanged since it was flown; anything else flies afresh.
 */
const KEPT = 4;
const FIELDS = (p: LandPiece) => [p.x, p.y, p.width, p.height, p.type, !!p.broken] as const;
const kept: Array<{ setting: Difficulty; pieces: readonly LandPiece[]; seen: ReadonlyArray<ReturnType<typeof FIELDS>>; L: Landings }> = [];
export function landingsOf(pieces: readonly LandPiece[], setting: Difficulty): Landings {
  const same = (k: (typeof kept)[number]) => k.setting === setting && k.pieces.length === pieces.length
    && k.pieces.every((p, i) => p === pieces[i] && FIELDS(p).every((v, j) => v === k.seen[i][j]));
  const hit = kept.find(same);
  if (hit) return hit.L;
  const L = new Landings(pieces, setting);
  kept.unshift({ setting, pieces: pieces.slice(), seen: pieces.map(FIELDS), L });
  if (kept.length > KEPT) kept.pop();
  return L;
}

/** every piece's widest run of take-off x in [a, b] whose first event is a catch on it (px) */
function windowsOf(all: readonly Ev[], a: number, b: number): Map<LandPiece, number> {
  const out = new Map<LandPiece, number>();
  if (b <= a) return out;
  // (only the events whose span meets (a, b), in their order: every midpoint below is inside (a, b), so no other event can be the first
  // there, and the others' ends inside [a, b] are a or b again; R-165.163)
  const evs = all.filter((e) => e.hi > a && e.lo < b);
  const cuts = [a, b, ...evs.flatMap((e) => [e.lo, e.hi])].filter((v) => v >= a && v <= b).sort((p, q) => p - q);
  let cur: LandPiece | null = null, run = 0;
  for (let i = 0; i + 1 < cuts.length; i++) {
    const [u, v] = [cuts[i], cuts[i + 1]];
    if (v - u < 1e-6) continue;
    const P = first(evs, (u + v) / 2)?.piece ?? null;
    run = P && P === cur ? run + (v - u) : v - u;
    cur = P;
    if (P && run > (out.get(P) ?? 0)) out.set(P, run);
  }
  return out;
}

/** how `T` is reached cleanly among `pieces` on `setting`, or null (a dead zone) */
export function cleanWay(T: LandPiece, pieces: readonly LandPiece[], setting: Difficulty): CleanWay | null {
  return landingsOf(pieces, setting).cleanWay(T);
}

/** the piece a pickup sits on: the highest standable top under it within PICKUP_OVER, its x inside the top */
export function pickupPiece(c: LandPickup, pieces: readonly LandPiece[]): LandPiece | undefined {
  let best: LandPiece | undefined;
  for (const p of pieces) {
    if (!standable(p) || c.x < p.x || c.x > p.x + p.width || p.y < c.y || p.y - c.y > PICKUP_OVER.px) continue;
    if (!best || p.y < best.y) best = p;
  }
  return best;
}

/**
 * Every judged landing no clean flight reaches on `setting`: each piece a collected pickup sits on, and each `landings` piece (the asks'
 * landings), once each.
 */
export function deadZones(pieces: readonly LandPiece[], pickups: readonly LandPickup[], setting: Difficulty, landings: readonly LandPiece[] = []): LandPiece[] {
  const judged = new Set<LandPiece>(landings);
  for (const c of pickups) {
    if (!COLLECTED.has(c.type)) continue;
    const p = pickupPiece(c, pieces);
    if (p) judged.add(p);
  }
  const L = landingsOf(pieces, setting);
  return [...judged].filter((T) => !L.cleanWay(T)).sort((a, b) => a.x - b.x);
}

/**
 * R-165.126, the bounce part: a mushroom with a purpose. Its bounce (alone or with the air jump, either way) lands, first and with
 * JUMP_WINDOW to spare, somewhere worth going: a top at least WALL_H over the floor it stands on (a higher road), a piece a find sits
 * on, a piece no walk off and no single jump from that floor reaches (the bounce is needed: across a gap, a shortcut), or another
 * mushroom that has a purpose (a chain). Else the bounce goes nowhere a walk does not: a mushroom laid for nothing.
 */
export function purposelessBounces(pieces: readonly LandPiece[], pickups: readonly LandPickup[], setting: Difficulty): LandPiece[] {
  const caps = pieces.filter((p) => p.type === 'bouncy' && !p.broken);
  const finds = new Set(pickups.filter((c) => c.type === 'find' || c.type === 'seed' || c.type === 'relic').map((c) => pickupPiece(c, pieces)).filter((p): p is LandPiece => !!p));
  // the floor a cap stands on: the highest standable top under its middle
  const floorOf = (m: LandPiece) => pieces.filter((p) => standable(p) && p.x <= m.x + m.width / 2 && p.x + p.width >= m.x + m.width / 2 && p.y >= m.y + m.height - 2).sort((a, b) => a.y - b.y)[0];
  // each cap's landings: every piece a window of JUMP_WINDOW px of contact x lands on first, for each way and flight
  const L = landingsOf(pieces, setting);
  const lands = new Map<LandPiece, Set<LandPiece>>();
  for (const m of caps) lands.set(m, new Set([...L.windows(m)].filter(([, w]) => w >= JUMP_WINDOW.px).map(([P]) => P)));
  const worth = new Set<LandPiece>();
  for (const m of caps) {
    const fl = floorOf(m);
    const base = fl ? fl.y : m.y + m.height;
    // (needed: a piece neither a walk off nor a single jump from its floor reaches, e.g. across a gap past one jump, the other answer to a
    // double: two answers' perched mushroom)
    const needed = (T: LandPiece) => !!fl && T !== fl && !L.walk(fl).some((w) => w.piece === T) && (L.windows(fl, true).get(T) ?? 0) < JUMP_WINDOW.px;
    if ([...lands.get(m)!].some((T) => T.type !== 'bouncy' && (base - T.y >= WALL_H || finds.has(T) || needed(T)))) worth.add(m);
  }
  // (a chain: a cap whose bounce lands on a cap with a purpose has one; to a fixed point)
  for (let grew = true; grew;) {
    grew = false;
    for (const m of caps) if (!worth.has(m) && [...lands.get(m)!].some((T) => worth.has(T))) { worth.add(m); grew = true; }
  }
  return caps.filter((m) => !worth.has(m)).sort((a, b) => a.x - b.x);
}

/** a pickup moved off a dead zone keeps this far inside its new piece's ends (the petal lines' own 20 px, pipeline.ts) */
const PICKUP_INSET = 20;
/** two pickups closer than this are one (pipeline.ts flower(): a pickup within 40 px of another is not laid) */
const PICKUP_APART = 40;
/** the pickups the repair moves: petals, blooms and leaves (a find or a heart keeps its place, each placed by its own rule) */
const MOVABLE = new Set(['flower', 'fruit', 'leaf']);

/**
 * Y2 (R-165.120 after R-165.124/.126): the repair INSIDE a roll, so the generator stops laying what the two rules refuse instead of the
 * search swapping sections for them. On one setting's built pieces:
 *   1. every mushroom with no purpose (purposelessBounces) is taken up, again until none is left (a cap's purpose can hang on another's);
 *   2. every petal, bloom or leaf on a dead zone (deadZones) moves, its row together, to the nearest piece a clean flight reaches, `within`
 *      its own stretch (the section it was laid in), its height over the top and its spacing kept, nothing of it within PICKUP_APART of
 *      another pickup, and the new piece the one it stands on (pickupPiece). A row with no such piece stays, and the verdict refuses it.
 * The pickups are moved in place; the caps to take up are returned. A roll with neither changes nothing.
 */
export function repairLandings(
  pieces: readonly LandPiece[], pickups: LandPickup[], setting: Difficulty, within: (x: number) => readonly [number, number] | undefined,
): { caps: LandPiece[]; moved: number } {
  const caps: LandPiece[] = [];
  let ps = pieces.slice();
  for (let k = 0; k < 4; k++) {
    const idle = purposelessBounces(ps, pickups, setting);
    if (!idle.length) break;
    caps.push(...idle);
    ps = ps.filter((p) => !idle.includes(p));
  }
  const dead = deadZones(ps, pickups, setting);
  if (!dead.length) return { caps, moved: 0 };
  const L = landingsOf(ps, setting);
  let moved = 0;
  for (const T of dead) {
    const row = pickups.filter((c) => COLLECTED.has(c.type) && pickupPiece(c, ps) === T);
    if (!row.length || row.some((c) => !MOVABLE.has(c.type))) continue;
    const xs = row.map((c) => c.x), cx = (Math.min(...xs) + Math.max(...xs)) / 2, bounds = within(cx);
    if (!bounds) continue;
    const others = pickups.filter((c) => !row.includes(c));
    let best: { cost: number; spots: Array<{ x: number; y: number }> } | undefined;
    for (const P of ps) {
      if (P === T || !standable(P) || P.x + P.width < bounds[0] || P.x > bounds[1]) continue;
      const lo = Math.max(P.x, bounds[0]) + PICKUP_INSET, hi = Math.min(P.x + P.width, bounds[1]) - PICKUP_INSET;
      if (hi < lo) continue;
      // (the row's spacing kept, squeezed to fit the top; its middle as near the old one as the top allows)
      const span = Math.min(Math.max(...xs) - Math.min(...xs), hi - lo), mid = Math.max(lo + span / 2, Math.min(hi - span / 2, cx));
      const k0 = Math.max(...xs) - Math.min(...xs);
      const spots = row.map((c) => ({ x: Math.round(mid + (k0 ? ((c.x - cx) / k0) * span : 0)), y: Math.round(P.y - (T.y - c.y)) }));
      const cost = Math.abs(mid - cx) + Math.abs(P.y - T.y);
      if (best && cost >= best.cost) continue;
      if (spots.some((s) => others.some((o) => Math.hypot(o.x - s.x, o.y - s.y) < PICKUP_APART))) continue;
      if (spots.some((s) => pickupPiece({ ...s, type: row[0].type }, ps) !== P)) continue;
      if (!L.cleanWay(P)) continue;
      best = { cost, spots };
    }
    if (!best) continue;
    row.forEach((c, i) => { c.x = best!.spots[i].x; c.y = best!.spots[i].y; });
    moved += row.length;
  }
  return { caps, moved };
}
