/**
 * Two-lane forks: a stretch of 900-1400 px where the stage splits in two and joins again.
 *
 * Shape: a shared split platform (with a flag if one is due), then
 *   - a HIGH lane in the branches: a canopy of hops, a swing, or stone pillars. It is quicker, riskier, has fewer flowers and one special reward;
 *     a fall from it lands in the low lane, so it is never fatal;
 *   - a LOW lane on the ground: a trench (steps down, a floor with animals on patrol and a row of flowers, steps up). It is safer and takes longer;
 *   and a shared join platform. A REVERSED fork swaps the roles: the low lane is a quick hollow run and the high lane the long scenic way (climb a tree,
 *   cross the canopy, swing, an animal on an overlook), with the flowers and the reward up there.
 * Both lanes are built from the same parts the rest of the stage uses (hops no longer than a hop, swings that validate, steps no taller than a jump),
 * so each one is completable on its own: levelCheck.checkLanes() proves it for every fork.
 */
import type { Gen } from './stageGenerator.ts';
import type { GeneratedStage } from './stageGenerator.ts';
import type { LaneFork, LaneRoute, Platform, Vine } from './types.ts';
import type { PlatformKind } from './platformStyles.ts';
import { reachJump } from './physics.ts';
import { swingLandings } from './levelCheck.ts';
import { laneSeconds, MODEL_TYPICAL } from './stageTime.ts';

export type HighKind = 'canopy' | 'swing' | 'pillars';
export interface ForkPlan {
  /** a stage with three forks keeps each one on the short side, so the forks together stay under about a fifth of the stage */
  compact?: boolean;
  high: HighKind;
  reversed: boolean;
}

/** the least time difference (typical player) between a fork's lanes: below this a fork is not a real choice */
export const FORK_MIN_DELTA = 6.5;
export const FORK_SPAN_MIN = 900;
export const FORK_SPAN_MAX = 1400;

interface Taken {
  platforms: number[];
  vines: number[];
  ropes: number[];
  enemies: number[];
  flowers: number[];
}

/** run `build` and report which platforms, vines, ropes, animals and pickups it created */
function capture<T>(gen: Gen, build: () => T): { out: T; taken: Taken } {
  const p0 = gen.P.length, v0 = gen.V.length, r0 = gen.R.length, e0 = gen.E.length, c0 = gen.C.length;
  const out = build();
  return {
    out,
    taken: {
      platforms: gen.P.slice(p0).map((p) => p.id),
      vines: gen.V.slice(v0).map((v) => v.id),
      ropes: gen.R.slice(r0).map((r) => r.id),
      enemies: gen.E.slice(e0).map((e) => e.id),
      flowers: gen.C.slice(c0).map((c) => c.id),
    },
  };
}

const emptyRoute = (terrain: LaneRoute['terrain']): LaneRoute => ({
  terrain, platforms: [], vines: [], ropes: [], enemies: [], flowers: [], hops: 0, steps: 0, extraPx: 0, entryRise: 0,
});

/** which plan this fork gets: the high lane's make, and whether the lanes swap roles */
export function planFork(gen: Gen, index: number, total: number): ForkPlan {
  const opts: HighKind[] = ['canopy'];
  if (gen.unlocked('swing') && !gen.safeMode) opts.push('swing');
  const reversedWanted = total >= 2 ? index % 2 === 1 : gen.chance(0.3);
  if (reversedWanted && gen.unlocked('pillars')) opts.push('pillars');
  // rotate through the options so a stage's forks differ
  const pick = opts[(index + Math.floor(gen.rnd() * opts.length)) % opts.length];
  return { high: pick === 'pillars' && !reversedWanted ? 'canopy' : pick, reversed: reversedWanted, compact: total >= 3 };
}

// ---------------------------------------------------------------------------
// the high lane
// ---------------------------------------------------------------------------

/** a swing between two platforms at the same height: finds the widest gap the swing validates for, places the liana and the far platform */
function swingAcross(gen: Gen, a: Platform, wMax: number, farWidth: number, kind: PlatformKind): Platform | null {
  const A: Platform = { ...a, id: -1 };
  for (let w = wMax; w >= 240; w -= 20) {
    const B: Platform = { id: -2, x: a.x + a.width + w, y: a.y, width: farWidth, height: 28, type: 'solid' };
    const v: Vine = {
      id: 999, x: a.x + a.width + w / 2 + gen.rr(-18, 18), topY: a.y - 310, bottomY: a.y + 30,
      swaySpeed: 1.1, swayPhase: 0, vineType: 'swing_liana', isSwingingVine: true,
    };
    const res = swingLandings(A, v, 1, [A, B], gen.waterY);
    if ((res.get(-2) ?? 0) >= 8) {
      gen.V.push({ ...v, id: gen.vid++, swayPhase: gen.rnd() * 6 });
      return gen.plat({ x: B.x, y: B.y, width: farWidth, height: 28, type: 'solid' }, kind);
    }
  }
  return null;
}

interface HighResult {
  /** where the lane ends: the join platform begins here */
  x1: number;
  hops: number;
  /** the platform with the reward on it */
  peak: Platform | null;
  /** the lane's longest platform (an overlook that can carry an animal) */
  overlook: Platform | null;
  route: Partial<LaneRoute>;
}

/** a trail of branches (or columns): rise, a crest, fall; precise single jumps, a double-jump gap late in the game */
function chain(gen: Gen, from: { x: number; y: number }, span: number, o: { first: number; crest: number; kind: PlatformKind; frac: [number, number]; widths: [number, number]; minN: number; height: number; wideChance: number }): HighResult {
  let x = from.x;
  let prevY = from.y;
  let hops = 0;
  const nEst = Math.max(o.minN, Math.round(span / 230));
  let h = o.first;
  let peak: Platform | null = null;
  let overlook: Platform | null = null;
  let i = 0;
  const frac = () => gen.rr(o.frac[0], o.frac[1]);
  for (;;) {
    const hump = o.first + (o.crest - o.first) * Math.sin((Math.PI * (i + 0.5)) / nEst);
    const wantH = Math.max(54, hump + gen.rr(-14, 14));
    h = Math.max(h - 62, Math.min(h + 62, wantH));
    // (the first branch is one ordinary jump above the split platform)
    if (i === 0) h = Math.min(h, 74);
    const y = from.y - h;
    const wide = gen.m >= 8 && gen.world >= 3 && i >= 2 && i < nEst - 2 && !gen.safeMode && gen.chance(o.wideChance);
    const gap = wide ? Math.max(130, gen.rr(0.42, 0.52) * reachJump(prevY - y, true)) : gen.hopLen(prevY - y, frac());
    const w = gen.rr(o.widths[0], o.widths[1]);
    if (i >= o.minN && x + gap + w - from.x > span - 90) break;
    x += gap;
    const p = gen.plat({ x, y, width: w, height: o.height, type: 'solid' }, o.kind);
    hops++;
    if (!peak || p.y < peak.y) peak = p;
    if (!overlook || p.width > overlook.width) overlook = p;
    x += w;
    prevY = y;
    i++;
    if (i > 16) break;
  }
  // the way down onto the join platform
  const out = gen.hopLen(prevY - from.y, frac());
  hops++;
  return { x1: x + out, hops, peak, overlook, route: { entryRise: o.first } };
}

function highCanopy(gen: Gen, x0: number, g0: number, span: number): HighResult {
  const d = gen.d;
  const first = gen.rr(56, 72);
  const crest = Math.min(176, first + gen.rr(50, 96));
  return chain(gen, { x: x0, y: g0 }, span, {
    first, crest, kind: 'lane-high', frac: [0.5 + 0.12 * d, 0.7 + 0.12 * d], widths: [104, 150], minN: 4, height: 24, wideChance: 0.18,
  });
}

function highPillars(gen: Gen, x0: number, g0: number, span: number): HighResult {
  const r = chain(gen, { x: x0, y: g0 }, span, {
    first: gen.rr(56, 70), crest: gen.rr(110, 150), kind: 'pillar', frac: [0.5, 0.72], widths: [68, 96], minN: 5, height: 170, wideChance: 0,
  });
  return r;
}

/** platform, swing, platform, a hop or two, swing, platform: all at one height a jump above the ground */
function highSwing(gen: Gen, x0: number, g0: number, span: number): HighResult | null {
  const rise = 78;
  const y = g0 - rise;
  let hops = 0;
  const first = gen.plat({ x: x0 + gen.hopLen(rise, 0.6), y, width: 190, height: 26, type: 'solid' }, 'lane-high');
  hops++;
  let cur = first;
  const wMax = gen.lerp(280, 380);
  let overlook: Platform | null = first;
  let swings = 0;
  const wantSwings = span > 1150 ? 2 : 1;
  while (cur.x + cur.width - x0 < span - 230) {
    if (swings < wantSwings) {
      const nxt = swingAcross(gen, cur, wMax, 200, 'lane-high');
      if (!nxt) return null;
      swings++;
      hops++;
      cur = nxt;
      if (!overlook || cur.width > overlook.width) overlook = cur;
      // a branch to hop along between the swings
      if (swings < wantSwings && cur.x + cur.width - x0 < span - 700) {
        const w = gen.rr(110, 150);
        const nx = cur.x + cur.width + gen.hopLen(0, gen.rr(0.5, 0.68));
        cur = gen.plat({ x: nx, y, width: w, height: 24, type: 'solid' }, 'lane-high');
        hops++;
      }
    } else {
      const w = gen.rr(110, 150);
      const nx = cur.x + cur.width + gen.hopLen(0, gen.rr(0.5, 0.68));
      cur = gen.plat({ x: nx, y, width: w, height: 24, type: 'solid' }, 'lane-high');
      hops++;
    }
  }
  const out = gen.hopLen(rise, gen.rr(0.5, 0.7));
  hops++;
  return { x1: cur.x + cur.width + out, hops, peak: first, overlook, route: { entryRise: rise } };
}

/** the scenic long way: climb a tree to the canopy, cross it (a swing if swings are known), an overlook with an animal, and down */
function highScenic(gen: Gen, x0: number, g0: number, span: number): HighResult | null {
  const H = Math.min(gen.rr(215, 262), g0 - 190);
  if (H < 170) return null;
  const treeX = x0 - 24;
  const topY = g0 - H;
  const tree = { id: gen.tid++, x: treeX, groundY: g0, topY: topY - 170, trunkWidth: 76, hasClimbVine: true, canopyRadius: 150 };
  gen.T.push(tree);
  gen.V.push({ id: gen.vid++, x: treeX, topY: topY - 2, bottomY: g0 - 6, swaySpeed: 0.9, swayPhase: gen.rnd() * 6, vineType: 'tree_climb', treeId: tree.id });
  const top = gen.plat({ x: treeX - 90, y: topY, width: 220, height: 26, type: 'solid' }, 'lane-high');
  let hops = 1;
  let cur = top;
  let overlook: Platform | null = top;
  const crestY = topY;
  const wantSwing = gen.unlocked('swing') && !gen.safeMode;
  if (wantSwing) {
    const nxt = swingAcross(gen, cur, gen.lerp(280, 360), 340, 'lane-high');
    if (nxt) { cur = nxt; hops++; if (nxt.width > overlook.width) overlook = nxt; }
  }
  // branches along the top, then the overlook and the way down
  const rest = span - (cur.x + cur.width - x0);
  let x = cur.x + cur.width;
  let prevY = cur.y;
  const n = Math.max(2, Math.round((rest - 200) / 250));
  for (let i = 0; i < n; i++) {
    const y = Math.max(crestY - 40, Math.min(crestY + 70, prevY + gen.rr(-46, 40)));
    const gap = gen.hopLen(prevY - y, gen.rr(0.5, 0.68 + 0.1 * gen.d));
    const w = i === Math.floor(n / 2) && !wantSwing ? 360 : gen.rr(104, 150);
    x += gap;
    const p = gen.plat({ x, y, width: w, height: 24, type: 'solid' }, 'lane-high');
    hops++;
    if (!overlook || p.width > overlook.width) overlook = p;
    x += w;
    prevY = y;
  }
  const out = gen.hopLen(prevY - g0, gen.rr(0.5, 0.7));
  hops++;
  return { x1: x + out, hops, peak: overlook, overlook, route: { entryRise: H } };
}

// ---------------------------------------------------------------------------
// the low lane
// ---------------------------------------------------------------------------

/** a trench: steps down, a floor, steps up. Returns where the floor is (for the animals and the flowers). */
function lowTrench(gen: Gen, x0: number, x1: number, g0: number, o: { steps: number; dh: [number, number]; stepLen: [number, number] }): { floor: { x0: number; x1: number; y: number }; depth: number; steps: number } {
  const n = Math.min(o.steps, Math.max(1, Math.floor((g0 + 160 - g0) / 40)));
  const dhs: number[] = [];
  for (let i = 0; i < n; i++) dhs.push(gen.rr(o.dh[0], o.dh[1]));
  let depth = dhs.reduce((a, b) => a + b, 0);
  // never below what the level has room for
  while (depth > 0 && !(g0 + depth <= gen.G + 96)) { dhs.pop(); depth = dhs.reduce((a, b) => a + b, 0); }
  const steps = dhs.length;
  gen.cx = x0; gen.g = g0; gen.bank = x0;
  const lens: number[] = [];
  for (let i = 0; i < 2 * steps; i++) lens.push(gen.rr(o.stepLen[0], o.stepLen[1]));
  const floorLen = Math.max(260, x1 - x0 - lens.reduce((a, b) => a + b, 0));
  for (let i = 0; i < steps; i++) { gen.down(dhs[i]); gen.flat(lens[i], { yard: true, optional: true }); }
  const floor = gen.flat(floorLen, { yard: true, optional: true });
  const fl = { x0: floor.x0, x1: floor.x1, y: gen.g };
  for (let i = steps - 1; i >= 0; i--) { gen.up(dhs[i]); gen.flat(lens[steps + i], { yard: true, optional: true }); }
  return { floor: fl, depth, steps: steps * 2 };
}

/** the animals on a trench floor, each with a patch of its own, clear of both ends */
function floorAnimals(gen: Gen, fl: { x0: number; x1: number; y: number }, count: number) {
  const a = fl.x0 + 90;
  const b = fl.x1 - 90;
  const w = (b - a) / count;
  for (let i = 0; i < count; i++) gen.ground(a + (i + 0.5) * w, fl.y, a + i * w + 6, a + (i + 1) * w - 6);
}

// ---------------------------------------------------------------------------
// the fork
// ---------------------------------------------------------------------------

/**
 * Builds one fork at the cursor. Returns true if it fitted (otherwise nothing is left behind, the caller rewinds).
 * `index` and `total` say which fork of the stage this is (the second is reversed, ...).
 */
export function buildFork(gen: Gen, plan: ForkPlan, index: number, boost = 0): boolean {
  const idx = gen.lanes.length;
  // room: the ground must be low enough for the branches and high enough for a trench
  for (let k = 0; k < 6 && gen.g < 400 && gen.roomBelow(40); k++) { gen.down(40); gen.flat(110); }
  if (gen.g < 330) return false;
  if (plan.reversed && !gen.roomBelow(80)) return false;
  if (!plan.reversed && !gen.roomBelow(70)) return false;

  // ---- the shared split platform ----
  // (the flag stands on the split platform, so the climb to the join flag is never more than a fork's length: a recent flag lengthens the split to carry the next one)
  const flagX = Math.max(gen.cx + 90, gen.lastFlagX + gen.flagMin());
  const split = gen.flat(Math.max(gen.rr(300, 360), flagX - gen.cx + 170), { safe: true });
  gen.flagAt(flagX, gen.g);
  if (split.x1 - split.x0 > 420) gen.row(split.x0 + 40, flagX - 70, gen.g - 34, 3);
  const x0 = gen.cx;
  const g0 = gen.g;
  gen.closeBank();
  gen.log.push('fork');
  const splitTopY = g0;

  // ---- the high lane (it decides where the lanes meet) ----
  const spanMax = plan.compact && !plan.reversed ? 1250 : FORK_SPAN_MAX;
  const span0 = gen.rr(FORK_SPAN_MIN + 120, spanMax - 40);
  const hiCap = capture(gen, () => {
    if (plan.reversed) return highScenic(gen, x0, g0, span0) ?? highCanopy(gen, x0, g0, span0);
    if (plan.high === 'swing') return highSwing(gen, x0, g0, span0) ?? highCanopy(gen, x0, g0, span0);
    if (plan.high === 'pillars') return highPillars(gen, x0, g0, span0);
    return highCanopy(gen, x0, g0, span0);
  });
  const hi = hiCap.out;
  const x1 = hi.x1;
  if (x1 - x0 < FORK_SPAN_MIN - 20 || x1 - x0 > spanMax + (plan.compact && !plan.reversed ? 110 : 60)) return false;

  // ---- the low lane, fitted to the span ----
  const saveG = gen.g;
  let floorInfo: { x0: number; x1: number; y: number } | null = null;
  const loCap = capture(gen, () => {
    const t = plan.reversed
      ? lowTrench(gen, x0, x1, g0, { steps: 1, dh: [66, 84], stepLen: [84, 110] })
      : lowTrench(gen, x0, x1, g0, { steps: gen.ri(2, 3), dh: [30, 42], stepLen: [70, 100] });
    floorInfo = t.floor;
    return t;
  });
  const lo = loCap.out;
  gen.g = saveG;
  if (!floorInfo) return false;
  const fl: { x0: number; x1: number; y: number } = floorInfo;

  // ---- animals and flowers: the safe lane has the animals and the flowers, the quick lane the reward ----
  let lowAnimals = 0;
  const animalCap = capture(gen, () => {
    if (plan.reversed) return;
    lowAnimals = Math.min(boost >= 2 ? 4 : 3, Math.max(2, Math.floor((fl.x1 - fl.x0 - 180) / 150)));
    floorAnimals(gen, fl, lowAnimals);
  });
  const lowFlowerCap = capture(gen, () => {
    const n = plan.reversed ? 4 : 7;
    gen.row(fl.x0 + 70, fl.x1 - 70, fl.y - 34, n, true); // a lane's flowers are its reward: never thinned
    // a few more just inside the steps, over where the animals are not
    if (!plan.reversed) gen.row(x0 + 18, x0 + 95, g0 + 40 - 34, 2, true);
  });
  let reward: LaneFork['reward'] = null;
  const hiFlowerCap = capture(gen, () => {
    const pk = hi.peak;
    if (!pk) return;
    // a lure on the way in (a short row over the first branches) and the reward with a ring of flowers on the crest
    const rx = pk.x + pk.width / 2;
    const ry = pk.y - 36;
    const kinds = ['heart', 'powerup_speed', 'powerup_magnet', 'powerup_invincible'] as const;
    const kind = gen.m < 3 ? 'heart' : kinds[(gen.world + index) % kinds.length];
    gen.item(kind, rx, ry);
    reward = { x: rx, y: ry };
    gen.arc(pk.x + 10, pk.x + pk.width - 10, pk.y - 56, 40, plan.reversed ? 3 : 2);
    if (plan.reversed && hi.overlook && hi.overlook !== pk) gen.row(hi.overlook.x + 40, hi.overlook.x + hi.overlook.width - 40, hi.overlook.y - 36, 3, true);
  });
  // the scenic lane keeps an animal on its overlook (a slower walk to match the faster hollow)
  const overlookCap = capture(gen, () => {
    if (!plan.reversed || !hi.overlook) return;
    const o = hi.overlook;
    if (o.width >= 330) gen.ground(o.x + o.width / 2, o.y, o.x + 125, o.x + o.width - 125);
  });

  // ---- the shared join platform ----
  gen.cx = x1;
  gen.g = g0;
  const join = gen.flat(gen.rr(300, 360), { safe: true });
  if (join.x0 + 90 - gen.lastFlagX >= gen.flagMin()) gen.flagAt(join.x0 + 90, g0);

  // ---- bookkeeping ----
  const high: LaneRoute = {
    ...emptyRoute(plan.high === 'pillars' ? 'pillars' : plan.high === 'swing' || (plan.reversed && gen.V.some((v) => hiCap.taken.vines.includes(v.id) && v.vineType === 'swing_liana')) ? 'swing' : 'canopy'),
    platforms: hiCap.taken.platforms,
    vines: hiCap.taken.vines,
    enemies: [...overlookCap.taken.enemies],
    flowers: hiFlowerCap.taken.flowers,
    hops: hi.hops,
    steps: 0,
    extraPx: plan.reversed ? 160 : 0,
    entryRise: hi.route.entryRise ?? 60,
  };
  const low: LaneRoute = {
    ...emptyRoute(plan.reversed ? 'hollow' : 'trench'),
    platforms: loCap.taken.platforms,
    enemies: animalCap.taken.enemies,
    flowers: lowFlowerCap.taken.flowers,
    hops: 0,
    steps: lo.steps,
    extraPx: plan.reversed ? 40 : Math.round(60 + lo.depth * 3.2),
    entryRise: -Math.round(lo.depth / Math.max(1, lo.steps / 2)),
  };
  void lowAnimals;
  const fork: LaneFork = { id: idx, x0, x1, splitY: splitTopY, joinY: g0, reversed: plan.reversed, high, low, reward };
  gen.lanes.push(fork);
  gen.pieces.push({ k: `fork:${high.terrain}${plan.reversed ? '/hollow' : '/trench'}`, x0: split.x0, x1: join.x1 });
  return true;
}

/** the typical player's seconds on each lane of a fork that is built (gen's arrays are all the lookup needs) */
export function forkDelta(gen: Gen, f: LaneFork): number {
  const view = { vines: gen.V, platforms: gen.P, ropes: gen.R, enemies: gen.E } as unknown as GeneratedStage;
  const hi = laneSeconds(view, f, f.high, MODEL_TYPICAL);
  const lo = laneSeconds(view, f, f.low, MODEL_TYPICAL);
  return Math.abs(hi - lo);
}
