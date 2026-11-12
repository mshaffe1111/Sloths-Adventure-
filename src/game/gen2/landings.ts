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

export function events(path: FlightPath, y0: number, dir: 1 | -1, pieces: readonly LandPiece[], self: LandPiece | null): Ev[] {
  const out: Ev[] = [];
  for (const P of pieces) {
    if (P.broken) continue;
    const top = P.y - y0;
    // a catch on its top
    for (let i = 1; i < path.length; i++) {
      const [, d0] = path[i - 1], [dx, d1] = path[i];
      if (d1 <= d0 || !(d0 <= top + CATCH_DROP.px && d1 >= top)) continue;
      const side = P.type === 'bouncy' ? 12 : LAND_SIDE.px;
      const [a, b] = [P.x - side, P.x + P.width + side];
      out.push(dir > 0 ? { frame: i, lo: a - dx, hi: b - dx, piece: P, dx } : { frame: i, lo: a + dx, hi: b + dx, piece: P, dx });
      break;
    }
    if (!isWall(P)) continue;
    // a side stop: his body enters the face from his side this frame, with the face beside him (feet under its top, head over its
    // underside). The engine stops his way there and his rise or fall goes on along the face: when the rest of the flight brings his
    // feet within the hoist (MANTLE) of its top he is hoisted (or carried over) onto it, a landing on it; else he slides down the face, a
    // flight stopped (piece null)
    for (let i = 1; i < path.length; i++) {
      const [x0] = path[i - 1], [x1, d1] = path[i];
      const feet = d1, head = d1 - 48;
      if (!(feet > top && head < top + P.height)) continue;
      const onto = suffixMin(path)[i] <= top + MANTLE.px ? P : null;
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

/**
 * One stage's flights, each flown once from each source and kept (a stage judges dozens of landings from the same ledges): from a ledge
 * (or a cap) and a way, the piece each flight lands on first, and for a jump or a bounce the widest take-off window per piece it lands on.
 */
export class Landings {
  private readonly byX: LandPiece[];
  private readonly walks = new Map<LandPiece, Array<{ piece: LandPiece | null; mid: number }>>();
  private readonly wins = new Map<LandPiece, Map<LandPiece, number>>();
  private readonly singles = new Map<LandPiece, Map<LandPiece, number>>();
  constructor(readonly pieces: readonly LandPiece[], readonly setting: Difficulty) {
    this.byX = pieces.filter((p) => !p.broken).slice().sort((a, b) => a.x - b.x);
  }
  /** the pieces within NEAR px of a span */
  near(x0: number, x1: number): LandPiece[] {
    return this.byX.filter((p) => p.x < x1 + NEAR && p.x + p.width > x0 - NEAR);
  }
  /** a full-speed walk off each end of S: the piece it lands on first and his middle there */
  walk(S: LandPiece): Array<{ piece: LandPiece | null; mid: number }> {
    let w = this.walks.get(S);
    if (!w) {
      const near = this.near(S.x, S.x + S.width), F = LAND_FLIGHTS[this.setting];
      w = ([1, -1] as const).map((dir) => {
        const edge = dir > 0 ? S.x + S.width : S.x;
        const e = first(events(F.walk, S.y, dir, near, S), edge);
        return { piece: e?.piece ?? null, mid: edge + dir * (e?.dx ?? 0) };
      });
      this.walks.set(S, w);
    }
    return w;
  }
  /** the widest take-off window (px) from S, over every jump (a ledge) or bounce (a cap) and both ways, per piece landed on first */
  windows(S: LandPiece, single = false): Map<LandPiece, number> {
    const cache = single ? this.singles : this.wins;
    let m = cache.get(S);
    if (!m) {
      m = new Map();
      const near = this.near(S.x, S.x + S.width), F = LAND_FLIGHTS[this.setting];
      const bounce = S.type === 'bouncy';
      const a = bounce ? S.x - 12 : S.x - LAND_SIDE.px, b = bounce ? S.x + S.width + 12 : S.x + S.width + LAND_SIDE.px;
      for (const how of bounce ? BOUNCES : single ? SINGLES : JUMPS) for (const dir of [1, -1] as const) {
        for (const [P, w] of windowsOf(events(F[how], S.y, dir, near, S), a, b)) if (w > (m.get(P) ?? 0)) m.set(P, w);
      }
      cache.set(S, m);
    }
    return m;
  }
  /** how T is reached cleanly, or null (a dead zone) */
  cleanWay(T: LandPiece): CleanWay | null {
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
      for (const w of this.walk(S)) if (w.piece === T && w.mid >= T.x + LAND_IN.px && w.mid <= T.x + T.width - LAND_IN.px) return { how: 'walk-off', from: S };
    }
    // a full jump from a ledge, a bounce off a cap: a take-off window of JUMP_WINDOW
    for (const S of near) {
      if (S === T || S.broken) continue;
      const w = this.windows(S).get(T) ?? 0;
      if (w >= JUMP_WINDOW.px) return { how: S.type === 'bouncy' ? 'bounce' : 'jump', from: S, window: Math.round(w) };
    }
    return null;
  }
}

/** every piece's widest run of take-off x in [a, b] whose first event is a catch on it (px) */
function windowsOf(evs: readonly Ev[], a: number, b: number): Map<LandPiece, number> {
  const out = new Map<LandPiece, number>();
  if (b <= a) return out;
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
  return new Landings(pieces, setting).cleanWay(T);
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
  const L = new Landings(pieces, setting);
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
  const L = new Landings(pieces, setting);
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
