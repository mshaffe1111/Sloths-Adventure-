/**
 * Level validator: proves a generated stage can be finished.
 *
 * It builds a graph of everything the player can stand on or hang from (platforms,
 * climbing vines, swinging lianas) and connects two nodes only if the real movement
 * rules (physics.ts, shared with the engine) allow the move with a safety margin.
 * Then it walks the graph from the spawn point and checks the exit, the checkpoints,
 * and the quota items are all reachable.
 */
import type { GeneratedStage } from './stageGenerator.ts';
import type { Platform, Vine } from './types.ts';
import { HANG_DROP, ROPE_OVERLAP, ropeYAt } from './rope.ts';
import { maxRise } from './protoCheck.ts';
import type { Waterfall } from './waterfalls.ts';
import { PAST_SHRINE } from './rules.ts';
import { checkRooms, kitSolved, type KitWall } from './puzzleCheck.ts';
import { hopLimit } from './river.ts';
import { skillGuaranteedAt, skillHeldAt } from './skills.ts';
import { idleTime, isDamaging, sporeClearTime, SPORE_CLEAR_MIN, isStatic, tideCrossTime, CRUMBLE_TILE_W, CRUMBLE_RUN_MAX, CRUMBLE_STEP } from './zones.ts';
import {
  PHYS,
  SAFE,
  SIM_DTS,
  LAND_HALF,
  TAKEOFF_SLACK,
  airStep,
  canGrabSwing,
  flightReach,
  maxDropReach,
  reachBounce,
  reachBounceGlide,
  reachGlide,
  reachJump,
  reachMin,
  SWING,
  swingGrab,
  swingStep,
  timedLaunch,
  type AirBody,
} from './physics.ts';

export interface CheckResult {
  ok: boolean;
  errors: string[];
  stats: {
    platforms: number;
    reachablePlatforms: number;
    vines: number;
    maxGapUsed: number;
    swingEdges: number;
    climbEdges: number;
  };
  /** the ids of the platforms the player can get to (for placing things that must be reachable) */
  reachableIds: number[];
}

/** Fraction of the simulated maximum reach the validator still accepts. */
const MARGIN = 0.97;

/** the engine keeps the hero this far inside the world's left and right edges (engine.ts), and a ledge narrower than STAND_MIN is not somewhere to stand */
const STRIP_MARGIN = 20;
const STAND_MIN = 24;
/**
 * the warm air (4-7, glide.ts): the open leaf is lifted while his middle (32 px over his feet) is inside it, so at its top his feet hang
 * at most about this far under its top edge (32 px, and a dip each time the lift lets go); he must be this far inside it to be
 * carried; and a drift off it gives up this much of its reach (he starts it from anywhere across the air, already moving, so this is
 * only room to spare)
 */
const LIFT_HOVER = 36;
const LIFT_INSIDE = 30;
const LIFT_SLACK = 30;
/** two pickups closer than this overlap on the screen */
export const PICKUP_APART = 36;
/** the clear approach kept around the start, every flag and the exit: no animal's patch comes closer than this */
export const SAFE_APPROACH = 200;

const ext = (p: Platform): [number, number] =>
  p.type === 'moving'
    ? [(p.baseX ?? p.x) - (p.moveRange ?? 0), (p.baseX ?? p.x) + (p.moveRange ?? 0) + p.width]
    : p.type === 'drift' && p.drift
      ? [p.drift.x0, p.drift.x1] // a log is somewhere across its river; the generator keeps them evenly spaced (checked below)
      : [p.x, p.x + p.width];

const dxTo = (x0: number, x1: number, x: number) => (x < x0 ? x0 - x : x > x1 ? x - x1 : 0);

/** Can the player get from platform a to platform b with jumps (and a double jump)? */
export function jumpOK(a: Platform, b: Platform, allowDouble = true): { ok: boolean; gap: number } {
  const [ax0, ax1] = ext(a);
  const [bx0, bx1] = ext(b);
  const gap = Math.max(0, bx0 - ax1, ax0 - bx1);
  const dy = a.y - b.y;
  const f = a.type === 'bouncy' ? reachBounce : reachJump;
  const r = allowDouble ? Math.max(f(dy, false), f(dy, true)) : f(dy, false);
  return { ok: r >= 0 && gap <= r * MARGIN - TAKEOFF_SLACK, gap };
}

// ---- Swinging --------------------------------------------------------------

/**
 * Simulates running jumps off `a` into a liana, swinging, and letting go.
 * Returns, per landing platform id, how robust the move is (number of distinct
 * takeoff/steer lines that have a release window of at least 6 frames).
 */
export function swingLandings(
  a: Platform,
  v: Vine,
  dir: 1 | -1,
  platforms: Platform[],
  waterY: number
): Map<number, number> {
  return swingLandingsIn(a, v, dir, landingPack(v, platforms), waterY);
}

/**
 * The platforms a flight from one liana can come down on, as flat number arrays sorted by height, so a falling body only looks at
 * the platforms inside the band it fell through (it used to be compared with every platform on every step).
 */
interface LandingPack {
  n: number;
  /** sorted by top (y), ascending */
  y: Float64Array;
  lx: Float64Array;
  rx: Float64Array;
  /** the platform's place in the original list: of two platforms hit in the same step the earlier one wins, as before */
  order: Int32Array;
  id: Int32Array;
  maxTop: number;
}

/**
 * Only platforms a flight from this liana can possibly come down on are packed (a speed-up that changes no result): a release
 * is at most 0.93 * the rope's length to the side of the vine and a leap covers at most 120 steps * 520 px/s, and it never rises
 * more than 152 px above a release point that hangs below the vine's top.
 */
function landingPack(v: Vine, platforms: Platform[]): LandingPack {
  const dt = SIM_DTS[0];
  const reachX = 0.93 * Math.max(SWING.minLen, v.bottomY - v.topY) + 120 * dt * SWING.leapMax + LAND_HALF + 8;
  const list: Array<{ p: Platform; order: number }> = [];
  for (let i = 0; i < platforms.length; i++) {
    const p = platforms[i];
    if (p.broken || p.type === 'moving' || p.type === 'drift') continue;
    if (p.x + p.width >= v.x - reachX && p.x <= v.x + reachX && p.y >= v.topY - 200) list.push({ p, order: i });
  }
  list.sort((m, q) => m.p.y - q.p.y || m.order - q.order);
  const n = list.length;
  const pack: LandingPack = { n, y: new Float64Array(n), lx: new Float64Array(n), rx: new Float64Array(n), order: new Int32Array(n), id: new Int32Array(n), maxTop: -Infinity };
  for (let i = 0; i < n; i++) {
    const p = list[i].p;
    pack.y[i] = p.y;
    pack.lx[i] = p.x - LAND_HALF;
    pack.rx[i] = p.x + p.width + LAND_HALF;
    pack.order[i] = list[i].order;
    pack.id[i] = p.id;
    if (p.y > pack.maxTop) pack.maxTop = p.y;
  }
  return pack;
}

/** "no platform" in the flight results (platform ids can be negative: the generator tests a swing with two stand-in platforms, -1 and -2) */
const NO_LANDING = -2147483647;
const hitBuf = new Int32Array(100);

function swingLandingsIn(a: Platform, v: Vine, dir: 1 | -1, pack: LandingPack, waterY: number): Map<number, number> {
  const out = new Map<number, number>();
  const dt = SIM_DTS[0];
  const edge = dir === 1 ? a.x + a.width : a.x;
  const { n, y: py, lx, rx, order, id: pids, maxTop } = pack;
  const b: AirBody = { x: 0, y: 0, vx: 0, vy: 0 };
  const fb: AirBody = { x: 0, y: 0, vx: 0, vy: 0 };

  for (let s = 0; s <= 90; s += 15) {
    b.x = edge - dir * s; b.y = a.y; b.vx = dir * PHYS.maxRun; b.vy = -PHYS.jumpV;
    let grabbed = false;
    for (let i = 0; i < 90 && !grabbed; i++) {
      airStep(b, dt, dir, false);
      if (b.y > waterY + 40) break;
      if (canGrabSwing(b.x, b.y, v) && Math.abs(b.vx) > 25) grabbed = true;
    }
    if (!grabbed) continue;

    for (const steer of [0, dir] as const) {
      const sw = swingGrab(b, v);
      for (let f = 0; f < 100; f++) {
        const pos = swingStep(sw, v, dt, steer);
        // release now: Tarzan leap toward the far side
        void pos;
        const l = timedLaunch(sw, dir);
        fb.x = pos.x; fb.y = pos.y; fb.vx = l.vx; fb.vy = l.vy;
        let landed = NO_LANDING;
        // the first platform (by height) that can still be hit: that band only moves down while the body falls
        let ptr = -1;
        for (let k = 0; k < 120 && landed === NO_LANDING; k++) {
          const prev = fb.y;
          airStep(fb, dt, dir, false);
          if (fb.y > waterY + 20) break;
          if (fb.vy >= 0) {
            if (ptr < 0) {
              let lo = 0, hi = n;
              while (lo < hi) { const mid = (lo + hi) >> 1; if (py[mid] < prev - 14) lo = mid + 1; else hi = mid; }
              ptr = lo;
            } else {
              while (ptr < n && py[ptr] < prev - 14) ptr++;
            }
            let bestOrder = 0x7fffffff;
            for (let q = ptr; q < n && py[q] <= fb.y; q++) {
              if (fb.x >= lx[q] && fb.x <= rx[q] && order[q] < bestOrder) { bestOrder = order[q]; landed = pids[q]; }
            }
            // falling below the lowest top there is: nothing is left to land on
            if (landed === NO_LANDING && fb.y > maxTop + 14) break;
          }
        }
        hitBuf[f] = landed;
      }
      // longest run of consecutive frames landing on the same platform
      let runId = NO_LANDING;
      let run = 0;
      const best = new Map<number, number>();
      for (let f = 0; f <= 100; f++) {
        const h = f < 100 ? hitBuf[f] : NO_LANDING;
        if (h !== NO_LANDING && h === runId) run++;
        else {
          if (runId !== NO_LANDING) best.set(runId, Math.max(best.get(runId) ?? 0, run));
          runId = h;
          run = h === NO_LANDING ? 0 : 1;
        }
      }
      for (const [id, r] of best) if (r >= 6) out.set(id, (out.get(id) ?? 0) + 1);
    }
  }
  return out;
}

// ---- Graph -----------------------------------------------------------------

/** how the check treats a stage's falls and boulders (World 4) */
export interface CheckOptions {
  /** boulders to leave where they stand (platform ids): otherwise the check rolls a fall's boulder into its slot once he can get behind it */
  frozen?: ReadonlySet<number>;
  /** handed the graph the check walked last (its pieces of ground, its links, what was reached), for tests that ask more of it */
  inspect?: (g: CheckGraph) => void;
  /**
   * walls that stand where they are (a puzzle room's shut gates, puzzleCheck.ts): like pouring water, no ground under one is somewhere to
   * stand and no jump or climb crosses it. Given, the stage's puzzle rooms are not checked again (this is one of their layouts).
   */
  walls?: readonly KitWall[];
}

/** the graph a check walked: every piece of ground (a platform, less what a boulder or pouring water covers), the links, what was reached */
export interface CheckGraph {
  plats: readonly Platform[];
  adj: ReadonlyMap<string, ReadonlySet<string>>;
  key: (p: Platform) => string;
  seen: ReadonlySet<string>;
  /** where a boulder stood in that walk (one the check rolled is in its slot) */
  boulderX: (id: number) => number;
  /** the falls pouring in that walk */
  pouring: readonly Waterfall[];
}

/** his body, against the water: half its width, its height, and how far over the ground he took off from a jump can carry his head */
const BODY_HALF = 16;
const BODY_H = 48;
let headRise = 0;
const riseAll = () => headRise || (headRise = maxRise() + 26 + BODY_H);

/** World 4's falls (proto.w4.falls); a curtain (veil, 4-5) is somewhere to stand behind, not a wall */
const wallFalls = (stage: GeneratedStage): Waterfall[] =>
  ((stage as { proto?: { w4?: { falls?: Waterfall[] } } }).proto?.w4?.falls ?? []).filter((w) => !w.veil);

/** a fall of World 4 that pours now: a plug fall until its boulder sits in the slot, any fall with no rhythm always (a surge goes quiet on
 * its own, so it is a wait, not a wall) */
export const fallPours = (w: Waterfall, boulderX: (id: number) => number | undefined): boolean => {
  if (w.veil) return false;
  if (w.plug) {
    const x = boulderX(w.plug.platformId);
    return x === undefined || x < w.plug.atX - 2;
  }
  return !w.surge;
};

/** [a, b) spans less [x0, x1) */
function cutSpans(spans: Array<[number, number]>, x0: number, x1: number): Array<[number, number]> {
  const out: Array<[number, number]> = [];
  for (const [a, b] of spans) {
    if (x1 <= a || x0 >= b) {
      out.push([a, b]);
      continue;
    }
    if (x0 > a) out.push([a, x0]);
    if (x1 < b) out.push([x1, b]);
  }
  return out;
}

export function validateStage(stage: GeneratedStage, opts: CheckOptions = {}): CheckResult {
  // a stage with puzzle rooms (puzzleKit.ts): the stage is walked as it is once every room is solved (its gates open, its lifts up), and
  // each room is checked on its own, symbolically, that it can be solved (puzzleCheck.ts), on this graph with its gates shut as walls
  if (stage.kit?.rooms.length && !opts.walls) {
    const res = validateStage(kitSolved(stage), { ...opts, walls: [] });
    const graphFor = (platforms: GeneratedStage['platforms'], walls: readonly KitWall[]) => {
      let g: CheckGraph | null = null;
      validateStage({ ...stage, platforms, kit: undefined }, { walls, inspect: (x) => { g = x; } });
      return g!;
    };
    res.errors.push(...checkRooms(stage, graphFor));
    res.ok = res.errors.length === 0;
    return res;
  }
  const errors: string[] = [];
  const cfg = stage.config;
  // The engine keeps the hero inside [20, W - 20]: ground beyond that cannot be stood on, a vine out there cannot be grabbed, and a
  // platform that sticks out only counts for the part that is inside. (A platform that leaves less than STAND_MIN px does not count.)
  const stripLo = STRIP_MARGIN;
  const stripHi = cfg.levelWidth - STRIP_MARGIN;
  // World 4's falls and boulders. A pouring fall is a wall of water (w4Play.ts barrier): no ground under it can be stood on, and no jump
  // or climb crosses it. A boulder (a pushed solid block) is a wall on the ground it stands on: that ground is two pieces, one either
  // side, joined only by climbing over it. Once he can stand behind a plug fall's boulder (on the ground beside it, on the side away from
  // the slot) the check rolls it into the slot, the fall dries, and the stage is walked again (unless `opts.frozen` holds it).
  const falls = wallFalls(stage);
  const rollers = stage.platforms.filter((p) => p.push && p.type === 'solid' && p.height >= 50 && !p.broken);
  const byId = new Map(stage.platforms.map((p) => [p.id, p]));
  const rolledTo = new Map<number, number>();
  const boulderX = (id: number) => rolledTo.get(id) ?? byId.get(id)?.x ?? NaN;
  let pouring: Waterfall[] = [];
  let plats: Platform[] = [];
  const keys = new WeakMap<Platform, string>();
  const layout = () => {
    pouring = falls.filter((w) => fallPours(w, (id) => (byId.has(id) ? boulderX(id) : undefined)));
    for (const w of opts.walls ?? []) pouring.push({ id: -1, x: w.x, width: w.width, top: w.top, bottom: w.bottom });
    plats = [];
    for (const p0 of stage.platforms) {
      if (p0.broken) continue;
      const p = rolledTo.has(p0.id) ? { ...p0, x: rolledTo.get(p0.id)! } : p0;
      // a lift (2-7) is one stop the player reaches at its top and at its bottom: two copies under one id, so riding it joins them
      if (p.lift) { plats.push({ ...p, y: p.lift.top }, { ...p, y: p.lift.bottom }); continue; }
      if (p.type === 'moving' || p.type === 'drift') { plats.push(p); continue; }
      let spans: Array<[number, number]> = [[p.x, p.x + p.width]];
      for (const b of rollers) if (b.id !== p.id && Math.abs(b.y + b.height - p.y) < 2) spans = cutSpans(spans, boulderX(b.id), boulderX(b.id) + b.width);
      for (const w of pouring) if (p.y > w.top && p.y - BODY_H < w.bottom) spans = cutSpans(spans, w.x - BODY_HALF, w.x + w.width + BODY_HALF);
      const whole = spans.length === 1 && spans[0][0] === p.x && spans[0][1] === p.x + p.width;
      if (whole && p.x >= stripLo && p.x + p.width <= stripHi) { plats.push(p); continue; }
      spans.forEach(([s0, s1], k) => {
        const x0 = Math.max(s0, stripLo);
        const x1 = Math.min(s1, stripHi);
        if (x1 - x0 < STAND_MIN) return;
        const piece = { ...p, x: x0, width: x1 - x0 };
        if (!whole) keys.set(piece, `p${p.id}~${k}`);
        plats.push(piece);
      });
    }
  };
  /** does pouring water stand between two pieces of ground (or a trunk: x0 === x1), across the heights a jump between them passes? */
  const waterBetween = (ax0: number, ax1: number, ay: number, bx0: number, bx1: number, by: number): boolean => {
    for (const w of pouring) {
      const l = w.x - BODY_HALF, r = w.x + w.width + BODY_HALF, mid = w.x + w.width / 2;
      const aLeft = ax0 + ax1 < 2 * mid;
      const bLeft = bx0 + bx1 < 2 * mid;
      if (aLeft === bLeft) continue;
      // (one of them reaching past the water, over or under it, is a way round it, not through it)
      const [lx1, rx0] = aLeft ? [ax1, bx0] : [bx1, ax0];
      if (lx1 >= r || rx0 <= l) continue;
      if (w.top < Math.max(ay, by) && w.bottom > Math.min(ay, by) - riseAll()) return true;
    }
    return false;
  };
  const vines = stage.vines.filter((v) => v.x >= stripLo && v.x <= stripHi);
  const waterY = stage.waterY ?? cfg.levelHeight + 100;
  let maxGapUsed = 0;
  let swingEdges = 0;
  let climbEdges = 0;
  const usedSwing = new Set<number>();
  let reachedIds: number[] = [];

  const adj = new Map<string, Set<string>>();
  const link = (a: string, b: string) => {
    if (!adj.has(a)) adj.set(a, new Set());
    adj.get(a)!.add(b);
  };
  const pid = (p: Platform) => keys.get(p) ?? `p${p.id}`;
  const vid = (v: Vine) => `v${v.id}`;

  // a double jump is a tool the player may need from mission 6 on; before that every gap is a plain jump
  const allowDouble = (cfg.worldIndex - 1) * 10 + cfg.miniIndex >= 6;
  // the leaf glide, from the stage everyone who gets there has learned it (skills.ts): it carries a falling jump much further
  const allowGlide = skillGuaranteedAt('glide', (cfg.worldIndex - 1) * 10 + cfg.miniIndex);
  // a drop deeper than this is a fall into the mist (4-7), never a way on (with room to spare)
  const deep = stage.deepFall !== undefined ? stage.deepFall - 30 : Infinity;
  const mission = (cfg.worldIndex - 1) * 10 + cfg.miniIndex;
  const ropesCount = skillGuaranteedAt('shimmy', mission);
  const drafts = allowGlide ? stage.updrafts ?? [] : [];
  let seen = new Set<string>();
  let firstWalk = true;

  /** build the graph over the ground as `layout` left it, and walk it from the spawn point (false: nothing under the spawn point) */
  const walk = (): boolean => {
    adj.clear();
    usedSwing.clear();
    maxGapUsed = 0;
    swingEdges = 0;
    climbEdges = 0;
    const byX = [...plats].sort((a, b) => ext(a)[0] - ext(b)[0]);

    // 1. jumps between platforms (only compare neighbours within a plausible horizontal window)
    // To the right the window is 460 px. To the left a platform can only be reached if the gap is within the furthest any jump
    // in THIS stage could cover (its biggest drop sets that), so everything further left is skipped: the same links as comparing
    // every pair, found without visiting them.
    const nP = byX.length;
    const px0 = new Float64Array(nP), px1 = new Float64Array(nP), prefMax1 = new Float64Array(nP);
    let minY = Infinity, maxY = -Infinity;
    for (let i = 0; i < nP; i++) {
      const [x0, x1] = ext(byX[i]);
      px0[i] = x0;
      px1[i] = x1;
      prefMax1[i] = i > 0 ? Math.max(prefMax1[i - 1], x1) : x1;
      if (byX[i].y < minY) minY = byX[i].y;
      if (byX[i].y > maxY) maxY = byX[i].y;
    }
    const maxDrop = nP ? maxY - minY : 0;
    const leftReach = (allowGlide ? Math.max(maxDropReach(maxDrop), reachGlide(-maxDrop, true), reachBounceGlide(-maxDrop, true)) : maxDropReach(maxDrop)) * MARGIN - TAKEOFF_SLACK;
    const rightWindow = allowGlide ? Math.max(460, leftReach) : 460;
    for (let i = 0; i < nP; i++) {
      const a = byX[i];
      const ax0 = px0[i], ax1 = px1[i];
      // first platform whose right edge (or any earlier one's) is within reach of a's left edge
      let lo = 0, hi = i;
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (prefMax1[mid] < ax0 - leftReach) lo = mid + 1; else hi = mid;
      }
      for (let j = lo; j < nP; j++) {
        if (i === j) continue;
        const bx0 = px0[j];
        if (bx0 > ax1 + rightWindow) {
          if (j > i) break;
          continue;
        }
        const b = byX[j];
        const bx1 = px1[j];
        const gap = Math.max(0, bx0 - ax1, ax0 - bx1);
        if (gap > leftReach) continue;
        const dy = a.y - b.y;
        if (-dy > deep) continue;
        const f = a.type === 'bouncy' ? reachBounce : reachJump;
        let r = allowDouble ? Math.max(f(dy, false), f(dy, true)) : f(dy, false);
        if (allowGlide && !(r >= 0 && gap <= r * MARGIN - TAKEOFF_SLACK)) {
          const fg = a.type === 'bouncy' ? reachBounceGlide : reachGlide;
          r = Math.max(r, fg(dy, false), fg(dy, true));
        }
        if (r >= 0 && gap <= r * MARGIN - TAKEOFF_SLACK) {
          if (pouring.length && waterBetween(ax0, ax1, a.y, bx0, bx1, b.y)) continue;
          link(pid(a), pid(b));
          if (a.type !== 'bouncy') maxGapUsed = Math.max(maxGapUsed, gap);
        }
      }
    }

    // 2. climbing vines
    for (const v of vines) {
      if (v.vineType === 'swing_liana') continue;
      // (a trunk with pouring water on it cannot be climbed)
      if (pouring.some((w) => v.x > w.x - BODY_HALF && v.x < w.x + w.width + BODY_HALF && v.bottomY > w.top && v.topY < w.bottom)) continue;
      const n = vid(v);
      const across = (x0: number, x1: number, y: number) => pouring.length > 0 && waterBetween(x0, x1, y, v.x, v.x, Math.max(v.topY, Math.min(v.bottomY, y)));
      // entering: stand next to the trunk and press up
      for (const p of plats) {
        const [x0, x1] = ext(p);
        if (p.type !== 'bouncy' && p.y >= v.topY - 12 && p.y <= v.bottomY + 25 && dxTo(x0, x1, v.x) < 42 && !across(x0, x1, p.y)) link(pid(p), n);
      }
      // leaving
      for (const p of plats) {
        const [x0, x1] = ext(p);
        const gx = dxTo(x0, x1, v.x);
        let ok = false;
        // vault off the top
        if (p.y >= v.topY - 22 && p.y <= v.topY + 90) {
          const dy = v.topY - 12 - p.y;
          const r = reachMin(dy, 190, 160, false);
          if (r >= 0 && gx <= r * MARGIN) ok = true;
        }
        // hop sideways / leap off at any height
        if (!ok) {
          for (let h = v.topY; h <= v.bottomY && !ok; h += 12) {
            const dy = h - p.y;
            if (-dy > deep) continue;
            const hop = reachMin(dy, PHYS.treeHopV, 240, true);
            const leap = reachMin(dy, PHYS.treeLeapV, 330, true);
            const r = Math.max(hop, leap);
            if (r >= 0 && gx <= r * MARGIN) ok = true;
          }
        }
        if (ok && !across(x0, x1, p.y)) {
          link(n, pid(p));
          climbEdges++;
        }
      }
    }

    // 3. swinging lianas
    for (const v of vines) {
      if (v.vineType !== 'swing_liana') continue;
      const pack = landingPack(v, plats);
      for (const a of plats) {
        if (a.type === 'moving' || a.type === 'drift' || a.type === 'bouncy') continue;
        const dirs: Array<1 | -1> = [];
        if (a.x + a.width <= v.x + 40 && v.x - (a.x + a.width) < 520) dirs.push(1);
        if (a.x >= v.x - 40 && a.x - v.x < 520) dirs.push(-1);
        for (const dir of dirs) {
          const res = swingLandingsIn(a, v, dir, pack, waterY);
          for (const [id, lines] of res) {
            if (lines >= 6 && id !== a.id) {
              link(`p${a.id}`, `p${id}`);
              usedSwing.add(v.id);
              swingEdges++;
            }
          }
        }
      }
    }

    // 3b. shimmy ropes: a rope joins the two ledges it hangs over, but only counts where EVERY player has the skill (a stage
    // entered before that may have ropes as extras, and must be finishable without them)
    for (const r of stage.ropes ?? []) {
      if (firstWalk && r.required && !ropesCount) errors.push(`rope #${r.id} is needed here, but the player may not have learned the skill yet`);
      if (!ropesCount) continue;
      const gapStart = r.x0 + ROPE_OVERLAP;
      const gapEnd = r.x1 - ROPE_OVERLAP;
      const left = plats.filter((p) => Math.abs(p.y - r.g0) < 3 && Math.abs(ext(p)[1] - gapStart) < 8);
      const right = plats.filter((p) => Math.abs(p.y - r.g1) < 3 && Math.abs(ext(p)[0] - gapEnd) < 8);
      if (!left.length || !right.length) {
        if (firstWalk) errors.push(`rope #${r.id} does not join two ledges`);
        continue;
      }
      for (const a of left) for (const b of right) {
        link(pid(a), pid(b));
        link(pid(b), pid(a));
      }
    }

    // 3c. warm air (4-7): with the leaf open in an updraft he rises to its top and hangs there, his feet about LIFT_HOVER under its top,
    // then drifts off it, still gliding (the warm air gave him back a whole glide). In: walk or jump off a ledge and glide into it, at
    // any depth it reaches down to. Out: from the top, a drift with the leaf open onto any ledge below it (a ledge above is out of reach).
    drafts.forEach((u, i) => {
      const n = `u${i}`;
      const in0 = u.x0 + LIFT_INSIDE, in1 = u.x1 - LIFT_INSIDE;
      if (in1 <= in0) return;
      for (const a of plats) {
        if (a.type === 'bouncy') continue;
        const [x0, x1] = ext(a);
        // the deepest he can glide in at: the bottom of the air, never as far down as the mist
        const d = Math.min(u.bottom - 40 - a.y, deep);
        if (d < 0 || a.y + d < u.top + 40) continue;
        const gap = Math.max(0, in0 - x1, x0 - in1);
        const r = Math.max(reachGlide(-d, false), reachGlide(-d, true));
        if (r >= 0 && gap <= r * MARGIN - TAKEOFF_SLACK) link(pid(a), n);
      }
      const hover = u.top + LIFT_HOVER;
      for (const b of plats) {
        const drop = b.y - hover;
        if (drop < 10 || drop > deep) continue;
        const [x0, x1] = ext(b);
        const gap = Math.max(0, x0 - u.x1, u.x0 - x1);
        let r = Infinity;
        for (const dt of SIM_DTS) r = Math.min(r, flightReach(-drop, { v0: 0, vx: PHYS.maxRun, dbl: false, dt, glide: true }));
        if (r >= 0 && gap <= r * MARGIN - LIFT_SLACK) link(n, pid(b));
      }
    });

    // 4. walk the graph
    const start = plats.find((p) => stage.spawnX >= ext(p)[0] - 4 && stage.spawnX <= ext(p)[1] + 4 && Math.abs(p.y - stage.spawnY) < 6);
    if (!start) return false;
    seen = new Set<string>([pid(start)]);
    const q = [pid(start)];
    while (q.length) {
      const n = q.pop()!;
      for (const m of adj.get(n) ?? []) {
        if (!seen.has(m)) {
          seen.add(m);
          q.push(m);
        }
      }
    }
    return true;
  };

  // walk the stage; while there is a boulder he can get behind, roll it into its slot and walk again
  for (;;) {
    layout();
    if (!walk()) {
      errors.push('no platform under the spawn point');
      return finish();
    }
    firstWalk = false;
    let rolled = false;
    for (const w of pouring) {
      if (!w.plug || opts.frozen?.has(w.plug.platformId)) continue;
      const b = byId.get(w.plug.platformId);
      // (only into a slot its roll reaches)
      if (!b?.push || b.push.max - b.width < w.plug.atX - 2 || b.push.min > w.plug.atX + 2) continue;
      const x = boulderX(b.id);
      const toRight = w.plug.atX >= x;
      const behind = plats.find((p) => Math.abs(p.y - (b.y + b.height)) < 2 && (toRight ? Math.abs(p.x + p.width - x) < 2 : Math.abs(p.x - (x + b.width)) < 2));
      if (behind && seen.has(pid(behind))) {
        rolledTo.set(b.id, w.plug.atX);
        rolled = true;
      }
    }
    if (!rolled) break;
  }
  opts.inspect?.({ plats, adj, key: pid, seen, boulderX, pouring });
  reachedIds = [...new Set([...seen].filter((k) => k.startsWith('p')).map((k) => Number(k.slice(1).split('~')[0])))];
  const reach = (p: Platform) => seen.has(pid(p));
  const reachPlats = plats.filter(reach);

  // exit
  const exitP = plats.find((p) => stage.exitTotemX >= ext(p)[0] && stage.exitTotemX <= ext(p)[1] && Math.abs(p.y - stage.exitTotemY) < 6);
  if (!exitP) errors.push('no platform under the exit totem');
  else if (!reach(exitP)) errors.push(`exit platform ${exitP.id} is not reachable`);

  // checkpoints
  let lastX = -1;
  for (const cp of stage.checkpoints ?? []) {
    const p = plats.find((q2) => cp.x >= ext(q2)[0] && cp.x <= ext(q2)[1] && Math.abs(q2.y - cp.y) < 6);
    if (!p || !reach(p)) errors.push(`checkpoint at x=${Math.round(cp.x)} is not on a reachable platform`);
    if (cfg.objectiveType !== 'ascent' && cp.x <= lastX) errors.push('checkpoints are out of order');
    lastX = cp.x;
  }

  // items must be near something reachable
  const heldGlide = skillHeldAt('glide', (cfg.worldIndex - 1) * 10 + cfg.miniIndex);
  const nearReachable = (x: number, y: number) => {
    for (const p of reachPlats) {
      const [x0, x1] = ext(p);
      if (dxTo(x0, x1, x) <= 150 && p.y - y >= -14 && p.y - y <= 190) return true;
    }
    // up the warm air he rode
    for (let i = 0; i < drafts.length; i++) {
      const u = drafts[i];
      if (seen.has(`u${i}`) && x >= u.x0 && x <= u.x1 && y >= u.top && y <= u.bottom) return true;
    }
    for (const v of vines) {
      if (seen.has(vid(v)) && Math.abs(x - v.x) < 70 && y >= v.topY - 40 && y <= v.bottomY) return true;
      if (usedSwing.has(v.id) && Math.abs(x - v.x) < 190 && y >= v.topY - 40 && y <= v.bottomY + 20) return true;
    }
    // pickups along a glide: below a reachable ledge and within how far the leaf carries at that height (a glide's flowers, out over a drop)
    if (heldGlide) {
      for (const p of reachPlats) {
        const [x0, x1] = ext(p);
        const dy = p.y - y; // > 0: the pickup is above the ledge's top
        if (dy > 100 || dy < -900) continue;
        const r = reachGlide(dy, false);
        if (r >= 0 && dxTo(x0, x1, x) <= r * MARGIN - TAKEOFF_SLACK) return true;
      }
    }
    // pickups hanging under a rope (reached by shimmying along it)
    for (const r of stage.ropes ?? []) {
      if (x >= r.x0 && x <= r.x1 && y >= ropeYAt(r, x) + 10 && y <= ropeYAt(r, x) + HANG_DROP + 4) return true;
    }
    return false;
  };
  for (const c of stage.collectibles) {
    if (c.type === 'exit_totem') continue;
    if (!nearReachable(c.x, c.y)) errors.push(`${c.type} #${c.id} at (${Math.round(c.x)}, ${Math.round(c.y)}) is out of reach`);
  }
  // a pickup must be in the open: not inside a platform (a flower on a ditch floor once sat in the bridge deck over it, a few in a mushroom),
  // not outside the strip the hero can walk, and not on top of another pickup
  for (const c of stage.collectibles) {
    if (c.type === 'exit_totem') continue;
    if (c.x < stripLo || c.x > stripHi) errors.push(`${c.type} #${c.id} is outside the walkable strip`);
    // (in a stage that is not a climb the engine stops him at the shrine: nothing beyond it can be picked up)
    if (cfg.objectiveType !== 'ascent' && stage.exitTotemX > 0 && c.x > stage.exitTotemX + PAST_SHRINE) errors.push(`${c.type} #${c.id} lies past the shrine, where he cannot go`);
    for (const p of stage.platforms) {
      if (p.broken || p.type === 'drift' || p.type === 'moving') continue;
      if (c.x >= p.x && c.x <= p.x + p.width && c.y > p.y + 2 && c.y < p.y + p.height - 2) {
        errors.push(`${c.type} #${c.id} at (${Math.round(c.x)}, ${Math.round(c.y)}) is inside platform ${p.id}`);
        break;
      }
    }
  }
  {
    const live = stage.collectibles.filter((c) => c.type !== 'exit_totem').sort((a, b) => a.x - b.x);
    for (let i = 0; i < live.length; i++) {
      for (let j = i + 1; j < live.length && live[j].x - live[i].x < PICKUP_APART; j++) {
        if (Math.hypot(live[j].x - live[i].x, live[j].y - live[i].y) < PICKUP_APART) {
          errors.push(`${live[i].type} #${live[i].id} and ${live[j].type} #${live[j].id} overlap`);
          break;
        }
      }
    }
  }

  // quota
  const count = (f: (t: string) => boolean) => stage.collectibles.filter((c) => f(c.type)).length;
  const need = cfg.targetCount;
  if (cfg.objectiveType === 'harvest' && count((t) => t === 'flower' || t === 'leaf') < need) errors.push('not enough flowers/leaves for the quota');
  // (5-5: a creature wrapped in a cocoon counts as one to free, w5Play.ts; its stage test checks each hangs where a standing punch lands)
  const cocoons = (stage as { proto?: { w5?: { cocoons?: unknown[] } } }).proto?.w5?.cocoons?.length ?? 0;
  if (cfg.objectiveType === 'rescue' && count((t) => t === 'cage') + cocoons < need) errors.push('not enough cages for the quota');
  if (cfg.objectiveType === 'relic_hunt' && count((t) => t === 'relic') < need) errors.push('not enough relics for the quota');
  if (cfg.objectiveType === 'purge' || cfg.objectiveType === 'gauntlet') {
    // (4-9: a capuchin guard blown off its ledge counts as one defeated, w4Play.ts)
    const w4 = (stage as { proto?: { w4?: { monkeys?: Array<{ job: string; x: number; blowOff?: number }> } } }).proto?.w4;
    const guards = (w4?.monkeys ?? []).filter((m) => m.job === 'guard' && m.blowOff);
    const foes = [...stage.enemies.map((e) => e.x), ...guards.map((m) => m.x)];
    if (foes.length < need) errors.push('not enough enemies for the quota');
    // only those on the way to the exit can be defeated: one that waits beyond it is no use to the quota
    else if (foes.filter((x) => x <= stage.exitTotemX + 35).length < need) errors.push('not enough enemies before the exit for the quota');
  }

  // fairness: nothing hostile right on top of the player when they spawn or respawn
  // (each flag is compared at its own height: in a climb the flags are far above the spawn, so judging every enemy against
  // the spawn's height let an eagle sit right over a flag)
  const safeSpots = [{ x: stage.spawnX, y: stage.spawnY }, ...(stage.checkpoints ?? []), { x: stage.exitTotemX, y: stage.exitTotemY }];
  for (const e of stage.enemies) {
    for (const s of safeSpots) {
      if (Math.abs(e.y - s.y) >= 400) continue;
      // (a flier is judged by where it hangs, a walker by how close its patch of ground comes)
      const d = e.type === 'eagle' ? Math.abs(e.x - s.x) : Math.min(Math.abs(e.x - s.x), dxTo(e.patrolMinX, e.patrolMaxX, s.x));
      if (d < (e.type === 'eagle' ? 300 : SAFE_APPROACH)) errors.push(`enemy #${e.id} stands too close to a safe spot at x=${Math.round(s.x)}`);
    }
  }

  // rivers: the logs must be spaced so a hop between neighbours is easy, and a bank must stand at each end of the water
  for (const r of stage.rivers ?? []) {
    const logs = plats.filter((p) => p.type === 'drift' && p.drift && p.drift.x0 === r.x0 && p.drift.x1 === r.x1);
    // (still water, a lily pond, has no current and no logs: it is crossed on its pads, which the reach check covers)
    if (r.speed === 0 || r.open) { /* no logs to space */ }
    // (a ferry raft, run by a sluice: one wide log that carries him the whole way across, river.ts `raft`)
    else if (r.raft && logs.length === 1 && logs[0].width >= 160) { /* one raft */ }
    else if (logs.length < 2) errors.push(`river at x=${Math.round(r.x0)} has fewer than two logs`);
    else {
      const d = logs[0].drift!;
      const spacing = ((d.x1 - d.x0 + d.width) / logs.length);
      const gap = spacing - d.width;
      const limit = hopLimit(d.dir);
      if (gap < 60) errors.push(`river at x=${Math.round(r.x0)}: logs overlap or nearly touch`);
      if (gap > limit) errors.push(`river at x=${Math.round(r.x0)}: ${Math.round(gap)}px between logs is too far to hop`);
    }
    const near = plats.some((p) => p.type === 'solid' && p.x + p.width >= r.x0 - 2 && p.x + p.width <= r.x0 + 2);
    const far = plats.some((p) => p.type === 'solid' && p.x >= r.x1 - 2 && p.x <= r.x1 + 2);
    if (!near || !far) errors.push(`river at x=${Math.round(r.x0)} has no bank at one end`);
  }

  // zones (Worlds 3 and 4): a rhythm that can always be waited out, a hop that is possible in either state, nothing hostile or
  // risky standing inside one
  for (const z of stage.zones ?? []) {
    const at = `${z.kind} zone at x=${Math.round(z.x0)}`;
    const idle = idleTime(z);
    if (!isStatic(z) && idle < 2.0) errors.push(`${at}: only ${idle.toFixed(1)}s quiet between bursts (needs 2s to be waitable)`);
    if (!isStatic(z) && z.warn < 0.9) errors.push(`${at}: warning of ${z.warn}s is too short`);
    if (z.kind === 'spore' && sporeClearTime(z) < SPORE_CLEAR_MIN - 0.001) errors.push(`${at}: only ${sporeClearTime(z).toFixed(1)}s awake between clouds (needs ${SPORE_CLEAR_MIN}s to cross)`);
    if (z.kind === 'tide') {
      const need = tideCrossTime(z.x1 - z.x0);
      if (idle + z.warn < need) errors.push(`${at}: low tide of ${(idle + z.warn).toFixed(1)}s is shorter than the ${need.toFixed(1)}s the crossing takes`);
      const wall = plats.filter((p) => p.type === 'solid' && Math.abs(p.x + p.width - z.x0) < 4 || Math.abs(p.x - z.x1) < 4).length;
      if (wall < 2) errors.push(`${at}: no bank at one end of the mudflat`);
    }
    if (z.kind === 'dark') {
      // every gap in the dark must have fireflies close enough to light it
      const solids = plats.filter((p) => p.type === 'solid' && p.x < z.x1 && p.x + p.width > z.x0).sort((a, b) => a.x - b.x);
      for (let i = 1; i < solids.length; i++) {
        const gap = solids[i].x - (solids[i - 1].x + solids[i - 1].width);
        if (gap <= 24) continue;
        const mid = solids[i - 1].x + solids[i - 1].width + gap / 2;
        if (!(z.lights ?? []).some((l) => Math.abs(l.x - mid) <= 120 && l.r >= 150)) errors.push(`${at}: a ${Math.round(gap)}px gap at x=${Math.round(mid)} has no light on it`);
      }
    }
    if (z.kind === 'crumble') {
      const tiles = plats.filter((p) => p.type === 'fragile' && p.crumbleAfter !== undefined && p.x >= z.x0 - 2 && p.x < z.x1).sort((a, b) => a.x - b.x);
      let run = 0;
      for (let i = 0; i < tiles.length; i++) {
        const t = tiles[i];
        const crossing = t.width / (PHYS.maxRun * 0.9);
        if (crossing > (t.crumbleAfter ?? 0) * 0.75) errors.push(`${at}: a tile holds ${t.crumbleAfter}s but takes ${crossing.toFixed(2)}s to cross`);
        run = i > 0 && Math.abs(t.x - (tiles[i - 1].x + tiles[i - 1].width)) < 2 ? run + 1 : 1;
        if (run > CRUMBLE_RUN_MAX) errors.push(`${at}: ${run} crumbling tiles in a row with no slab to rest on`);
        if (i > 0 && Math.abs(t.y - tiles[i - 1].y) > CRUMBLE_STEP + 1) errors.push(`${at}: tiles step by ${Math.abs(t.y - tiles[i - 1].y)}px`);
        if (t.width !== CRUMBLE_TILE_W) errors.push(`${at}: tile of unexpected width ${t.width}`);
      }
    }
    if (isDamaging(z)) {
      if (z.warn < 1.1) errors.push(`${at}: a damaging zone needs at least 1.1s of warning`);
      if (z.active > 1.2) errors.push(`${at}: a damaging zone fires for ${z.active}s, too long to dodge`);
      // a safe pocket between neighbours: room to stand between two columns while one of them fires
      for (const o of stage.zones ?? []) {
        if (o === z || !isDamaging(o) || o.x0 < z.x0 || Math.abs(o.baseY - z.baseY) > 40) continue;
        const gapPx = o.x0 - z.x1;
        if (gapPx < 110) errors.push(`${at}: only ${Math.round(gapPx)}px to the next column, no room to stand between them`);
      }
    }
    if (z.active > 3.0) errors.push(`${at}: stays active ${z.active}s, longer than a player should have to wait`);
    if (z.kind === 'wind' && z.force > 160) errors.push(`${at}: gust of ${z.force} px/s is too strong`);
    for (const e of stage.enemies) {
      if (e.x > z.x0 - 30 && e.x < z.x1 + 30 && e.y > (isDamaging(z) ? z.baseY - 150 : z.top) && e.y < z.bottom + 60) errors.push(`enemy #${e.id} stands inside the ${at}`);
    }
    for (const c of stage.checkpoints ?? []) {
      if (c.x > z.x0 && c.x < z.x1 && c.y > z.top && c.y < z.bottom) errors.push(`a checkpoint flag stands inside the ${at}`);
    }
    // every gap the zone covers: a plain jump must cross it, and a headwind must still leave the double jump a way over
    const under = plats
      .filter((p) => p.type === 'solid' && p.x < z.x1 && p.x + p.width > z.x0 && p.y > z.top && p.y < z.bottom + 20)
      .sort((a, b) => a.x - b.x);
    for (let i = 1; i < under.length && z.kind !== 'crumble' && z.kind !== 'dark'; i++) {
      const gap = under[i].x - (under[i - 1].x + under[i - 1].width);
      if (gap <= 24) continue;
      if (gap > SAFE.gap1) errors.push(`${at}: a ${Math.round(gap)}px gap is wider than a plain jump`);
      if (z.kind === 'wind' && z.dir === -1 && gap + z.force * 0.7 > SAFE.gap2) errors.push(`${at}: a headwind of ${z.force} makes the ${Math.round(gap)}px gap too far even for a double jump`);
    }
  }

  // nothing floats below the water
  for (const p of plats) {
    if (stage.waterY !== undefined && p.y > stage.waterY - 20 && p.height < 50) {
      errors.push(`platform ${p.id} is under the waterline`);
    }
  }

  if (stage.lanes?.length) errors.push(...checkLanes(stage));
  return finish();

  function finish(): CheckResult {
    return {
      ok: errors.length === 0,
      errors,
      stats: {
        platforms: plats.length,
        reachablePlatforms: reachedIds.length,
        vines: stage.vines.length,
        maxGapUsed: Math.round(maxGapUsed),
        swingEdges,
        climbEdges,
      },
      reachableIds: reachedIds,
    };
  }
}


/**
 * Each lane of every two-lane fork is checked on its own: with the other lane taken away, the player must still get from the shared split
 * platform to the shared join platform. (The whole-stage check above only proves that SOME route exists; a fork's lanes are both real
 * routes, and a lane that cannot be crossed is a trap for whoever picks it.) The check runs on the stretch around the fork only, so it is cheap.
 */
export function checkLanes(stage: GeneratedStage): string[] {
  const errors: string[] = [];
  const mid = (p: Platform) => p.x + p.width / 2;
  for (const f of stage.lanes ?? []) {
    const split = stage.platforms.find((p) => !p.broken && p.x <= f.x0 - 40 && p.x + p.width >= f.x0 - 10 && Math.abs(p.y - f.splitY) < 4);
    const join = stage.platforms.find((p) => !p.broken && p.x <= f.x1 + 10 && p.x + p.width >= f.x1 + 60 && Math.abs(p.y - f.joinY) < 4);
    if (!split || !join) { errors.push(`fork #${f.id} has no shared split or join platform`); continue; }
    for (const side of ['high', 'low'] as const) {
      const other = side === 'high' ? f.low : f.high;
      const dropP = new Set(other.platforms);
      const dropV = new Set(other.vines);
      const dropR = new Set(other.ropes);
      const x0 = split.x - 40;
      const x1 = join.x + join.width + 40;
      const mini: GeneratedStage = {
        ...stage,
        platforms: stage.platforms.filter((p) => p.x + p.width >= x0 && p.x <= x1 && !dropP.has(p.id)),
        vines: stage.vines.filter((v) => v.x >= x0 && v.x <= x1 && !dropV.has(v.id)),
        ropes: (stage.ropes ?? []).filter((r) => r.x0 >= x0 && r.x1 <= x1 && !dropR.has(r.id)),
        enemies: [],
        collectibles: [],
        checkpoints: [],
        rivers: undefined,
        zones: undefined,
        lanes: undefined,
        spawnX: mid(split),
        spawnY: split.y,
        exitTotemX: mid(join),
        exitTotemY: join.y,
      };
      const res = validateStage(mini);
      const bad = res.errors.filter((e) => /exit|spawn|rope/.test(e));
      if (bad.length) errors.push(`fork #${f.id} ${side} lane cannot be crossed (${bad[0]})`);
    }
  }
  return errors;
}
