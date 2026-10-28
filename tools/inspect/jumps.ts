/**
 * Jump difficulty and noisy-thumb bots, for every jump on the main route.
 *
 * Each jump is flown with physics.ts's own airStep at the engine's 60 Hz step, with the engine's jump rules copied from engine.ts:
 * launch at PHYS.jumpV; while the thumb is still down the ascent is not cut (a lift with the body still rising faster than PHYS.cutV
 * cuts it to cutV); the second jump adds to the first (secondJumpV) at doubleV * (1 + ASSIST.doubleJump * assist); a jump pressed
 * after running off a ledge still works within the coyote time (PHYS.coyote + ASSIST.coyote * assist); he lands when his feet come
 * down through the top within catchDrop (14 + ASSIST.catchDrop * assist) and his middle is within (0.26 + ASSIST.landSide * assist)
 * of his 44 px width past an end. Easy keeps assist at 1 the whole game; Normal eases it from 1 at 1-1 to 0 at 3-5.
 *
 * The bots are an edge-level Monte Carlo, not a run of the engine: one jump at a time, from a full run, with no animals, wind or
 * ceilings in the air, and a thumb modelled as timing noise (when the jump lands on the ledge, how long the thumb stays down, when the
 * second flick comes) rather than as finger paths through touchGestures.ts.
 */
import { PHYS, ASSIST, airStep, secondJumpV, easeAssist, type AirBody } from '../../src/game/physics.ts';
import { idleTime, isStatic } from '../../src/game/zones.ts';
import { NEST } from '../../src/game/eaglet.ts';
import { TEAPOT } from '../../src/game/w5Kit.ts';
import { surfaceOf } from '../../src/game/stageMetrics.ts';
import type { Platform } from '../../src/game/types.ts';
import type { Route, Seg } from './route.ts';
import type { Stage } from './stages.ts';

const DT = 1 / 60;
const FRAME30 = 1 / 30;
const WIDTH = 44;
/** half his body for walls (LAND_HALF), and his height */
const HALF = 21;
const BODY_H = 48;
/** the thumb stays down this long on a jump the player means to make full (the cut only bites before about 0.22 s) */
const HOLD = 0.3;

export interface Persona {
  name: 'KID' | 'ADULT';
  /** reaction: mean and spread (s) */
  react: number;
  reactSd: number;
  /** how long the thumb stays down: spread around HOLD (s) */
  holdSd: number;
  /** chance a flick comes out short (30% less height) */
  short: number;
  /** extra 30 fps frames between meaning to jump and the jump registering (inclusive range) */
  lateFrames: [number, number];
  /** chance the steering thumb drifts off for a few 30 fps frames in the air, and how many */
  drift: number;
  driftFrames: [number, number];
}
export const KID: Persona = { name: 'KID', react: 0.09, reactSd: 0.065, holdSd: 0.08, short: 0.08, lateFrames: [1, 4], drift: 0.12, driftFrames: [3, 8] };
export const ADULT: Persona = { name: 'ADULT', react: 0.03, reactSd: 0.03, holdSd: 0.035, short: 0.03, lateFrames: [0, 2], drift: 0.04, driftFrames: [2, 4] };
export const TRIALS = 200;

/** one jump as the bots see it: take off running along `dir` from ledge A, come down on B */
export interface JumpEdge {
  from: Platform;
  to: Platform;
  dir: 1 | -1;
  x: number;
  y: number;
  gap: number;
  rise: number;
  /** the route's own label */
  kind: string;
}

export function routeJumps(route: Route): JumpEdge[] {
  const out: JumpEdge[] = [];
  for (const s of route.segs) {
    if ((s.kind !== 'jump' && s.kind !== 'hop') || !s.from || !s.plat) continue;
    const A = s.from, B = s.plat;
    let dir: 1 | -1 = s.x1 > s.x0 + 0.5 ? 1 : s.x1 < s.x0 - 0.5 ? -1 : B.x + B.width / 2 >= s.x0 ? 1 : -1;
    // a jump up onto a branch over the ledge he stands on: run along under it, the way the branch lies
    if (Math.abs(s.x1 - s.x0) < 0.5) dir = B.x + B.width / 2 >= s.x0 ? 1 : -1;
    out.push({ from: A, to: B, dir, x: s.x0, y: s.y0, gap: Math.abs(s.x1 - s.x0), rise: A.y - B.y, kind: s.kind });
  }
  return out;
}

interface Inputs {
  /** take-off offset past the ledge's end along dir (px; below 0 = on the ledge) */
  s: number;
  v0: number;
  hold: number;
  /** second press time after the first (s), or -1 */
  tD: number;
  hold2: number;
  /** steering drop-out: [start, end) seconds, or null */
  drift: [number, number] | null;
  /** how late his steering reacts (s): he brakes for the landing on where he was this long ago, so a slow thumb overshoots */
  lag: number;
}

type Outcome = 'ok' | 'ranOff' | 'short' | 'over' | 'back';

/**
 * The jump's frame: x runs along `dir` from E, the last place to take off from (the ledge's end; for a jump up onto a branch over the
 * ledge, the branch's far end), y runs down from A's top. `offEdge`: E is the ledge's end, so going past it is running off it.
 */
interface Frame { E: number; offEdge: boolean; aLo: number; aHi: number; b0: number; b1: number }
function frame(e: JumpEdge): Frame {
  const A = e.from, B = e.to;
  const edge = e.dir === 1 ? A.x + A.width : A.x;
  const bFar = e.dir === 1 ? B.x + B.width : B.x;
  const E = e.dir === 1 ? Math.min(edge, bFar) : Math.max(edge, bFar);
  const loc = (x: number) => (x - E) * e.dir;
  const [a0, a1] = [loc(A.x), loc(A.x + A.width)].sort((p, q) => p - q);
  const [b0, b1] = [loc(B.x), loc(B.x + B.width)].sort((p, q) => p - q);
  return { E, offEdge: E === edge, aLo: a0, aHi: a1, b0, b1 };
}

/** fly one jump in its frame */
function fly(e: JumpEdge, assist: number, inp: Inputs): Outcome {
  const A = e.from, B = e.to;
  const { offEdge, aLo, aHi, b0, b1 } = frame(e);
  const by = B.y - A.y;
  const side = 0.26 + ASSIST.landSide * assist;
  const catchDrop = 14 + ASSIST.catchDrop * assist;
  const coyote = PHYS.coyote + ASSIST.coyote * assist;
  const v2 = PHYS.doubleV * (1 + ASSIST.doubleJump * assist);
  // a block 50 px or taller is a wall at his feet (physics.ts blockBeside): a step up stops him at its foot, and he cannot pass its side
  const wall = B.height >= 50 && B.y < A.y - 6;
  const by0 = B.y - A.y;
  const b: AirBody = { x: Math.min(inp.s, 0), y: 0, vx: PHYS.maxRun, vy: 0 };
  if (wall && b0 <= 8 && inp.s > b0 - HALF) {
    // ran into the step before the press: he jumps from standing at its foot
    b.x = b0 - HALF;
    b.vx = 0;
  } else if (inp.s > 0 && !offEdge) b.x = inp.s;
  else if (inp.s > 0) {
    const tOff = inp.s / PHYS.maxRun;
    if (tOff > coyote) return 'ranOff';
    let t = 0;
    while (t < tOff - 1e-9) { airStep(b, DT, 1, false); t += DT; }
    b.x = inp.s;
  }
  b.vy = -inp.v0;
  let t = 0;
  let doubled = inp.tD < 0;
  let launched = true;
  const target = Math.min(b1 - 20, Math.max(b0 + 20, b0 + Math.min(70, B.width / 2)));
  for (let i = 0; i < 240; i++) {
    if (!doubled && t >= inp.tD - 1e-9) { b.vy = secondJumpV(b.vy, v2); doubled = true; launched = true; }
    const held = doubled && inp.tD >= 0 ? t < inp.hold2 : t < inp.hold;
    if (b.vy >= 0) launched = false;
    if (!held && b.vy < -PHYS.cutV && launched) b.vy = -PHYS.cutV;
    // steering: toward a spot on the landing, braking in time (where he would stop if he pushed back now)
    const stopAt = b.x - b.vx * inp.lag + (b.vx * Math.abs(b.vx)) / (2 * PHYS.airAcc);
    let dir: -1 | 0 | 1 = stopAt < target - 4 ? 1 : stopAt > target + 4 ? -1 : 0;
    if (inp.drift && t >= inp.drift[0] && t < inp.drift[1]) dir = 0;
    const py = b.y;
    const px = b.x;
    airStep(b, DT, dir, held);
    t += DT;
    if (b.vy >= 0) {
      const onB = b.x + WIDTH * side > b0 && b.x - WIDTH * side < b1;
      if (onB && py <= by + catchDrop && b.y >= by) return 'ok';
      const onA = b.x - WIDTH * side < aHi && b.x + WIDTH * side > aLo;
      if (onA && py <= catchDrop && b.y >= 0 && A !== B) return 'back';
    }
    // (a wall stops him only coming at it from the side, after any landing on its top this frame)
    if (wall && b.y > by0 + 6 && b.y - BODY_H < by0 + B.height && b.x + HALF > b0 && b.x - HALF < b1 && (px + HALF <= b0 + 1 || px - HALF >= b1 - 1)) {
      b.x = px <= b0 ? b0 - HALF : b1 + HALF;
      b.vx = 0;
    }
    if (b.y > Math.max(0, by) + 300) return b.x < b0 ? 'short' : 'over';
  }
  return 'short';
}

/** the take-off offsets that work with clean thumbs (largest run), the best second-flick time at each, and whether one jump does it */
interface Feasible { lo: number; hi: number; dbl: boolean; tD: (s: number) => [number, number] | null }

function feasible(e: JumpEdge, assist: number, allowDbl: boolean): { one: Feasible | null; two: Feasible | null } {
  const f = frame(e);
  const sMin = Math.max(f.aLo, -420 - (f.offEdge ? 0 : e.to.width));
  const sMax = f.offEdge ? (PHYS.coyote + ASSIST.coyote * assist) * PHYS.maxRun : 0;
  const clean = (s: number, tD: number) => fly(e, assist, { s, v0: PHYS.jumpV, hold: 1, tD, hold2: 9, drift: null, lag: 0 }) === 'ok';
  const run = (ok: (s: number) => boolean): [number, number] | null => {
    let best: [number, number] | null = null;
    let a: number | null = null;
    for (let s = sMin; s <= sMax + 0.01; s += 3) {
      if (ok(s)) { if (a === null) a = s; }
      else if (a !== null) { if (!best || s - 3 - a > best[1] - best[0] || (s - 3 - a === best[1] - best[0])) best = [a, s - 3]; a = null; }
    }
    if (a !== null && (!best || sMax - a >= best[1] - best[0])) best = [a, sMax];
    return best;
  };
  const tDwin = (s: number): [number, number] | null => {
    let best: [number, number] | null = null;
    let a: number | null = null;
    for (let tD = 0.02; tD <= 0.9; tD += 1 / 60) {
      if (clean(s, tD)) { if (a === null) a = tD; }
      else if (a !== null) { if (!best || tD - a > best[1] - best[0]) best = [a, tD - 1 / 60]; a = null; }
    }
    if (a !== null && (!best || 0.9 - a > best[1] - best[0])) best = [a, 0.9];
    return best;
  };
  const one = run((s) => clean(s, -1));
  const two = allowDbl ? run((s) => { const w = tDwin(s); return w !== null && w[1] - w[0] >= 0.05; }) : null;
  return {
    one: one ? { lo: one[0], hi: one[1], dbl: false, tD: () => null } : null,
    two: two ? { lo: two[0], hi: two[1], dbl: true, tD: tDwin } : null,
  };
}

/** how far one jump (or a double jump at its best moment) carries to the landing's height, from a running take-off at the ledge's end */
function maxReach(e: JumpEdge, assist: number, dbl: boolean): number {
  const by = e.to.y - e.from.y;
  const v2 = PHYS.doubleV * (1 + ASSIST.doubleJump * assist);
  let best = -1;
  const tries = dbl ? Array.from({ length: 50 }, (_, i) => 0.02 + i / 60) : [-1];
  for (const tD of tries) {
    const b: AirBody = { x: 0, y: 0, vx: PHYS.maxRun, vy: -PHYS.jumpV };
    let t = 0, done = tD < 0;
    for (let i = 0; i < 300; i++) {
      if (!done && t >= tD) { b.vy = secondJumpV(b.vy, v2); done = true; }
      const py = b.y;
      airStep(b, DT, 1, true);
      t += DT;
      if (b.vy >= 0 && py <= by + 14 && b.y >= by) { best = Math.max(best, b.x); break; }
      if (b.y > by + 300) break;
    }
  }
  return best;
}

/** the highest a clean jump (or double jump at its best moment) lifts his feet, with the thumb held (the apex hang included) */
function maxRise(assist: number, dbl: boolean): number {
  const v2 = PHYS.doubleV * (1 + ASSIST.doubleJump * assist);
  let best = 0;
  for (const tD of dbl ? Array.from({ length: 50 }, (_, i) => 0.02 + i / 60) : [-1]) {
    const b: AirBody = { x: 0, y: 0, vx: 0, vy: -PHYS.jumpV };
    let t = 0, done = tD < 0;
    for (let i = 0; i < 200; i++) {
      if (!done && t >= tD) { b.vy = secondJumpV(b.vy, v2); done = true; }
      airStep(b, DT, 0, true);
      t += DT;
      best = Math.max(best, -b.y);
      if (done && b.vy > 0) break;
    }
  }
  return best;
}

// ---- a small seeded random stream, so a report is the same every run ----
function rng(seed: number) {
  let a = seed >>> 0;
  const f = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const n = () => Math.sqrt(-2 * Math.log(1 - f())) * Math.cos(2 * Math.PI * f());
  const int = (lo: number, hi: number) => lo + Math.floor(f() * (hi - lo + 1));
  return { f, n, int };
}

/**
 * Where the bot means to take off: the middle of the part of what works that is still on the ledge (the grace past the edge is there
 * to catch a late thumb, nobody aims for it), never earlier than 70 px before the end (TAKEOFF_SLACK: the most the game asks).
 */
function aimOf(fz: Feasible): number {
  const hi = Math.min(fz.hi, 0);
  if (hi < fz.lo) return fz.lo;
  return Math.max(fz.lo, Math.max((fz.lo + hi) / 2, Math.min(hi, -70)));
}

export interface BotResult { rate: number; fails: Record<string, number> }

function bots(e: JumpEdge, assist: number, fz: Feasible, p: Persona, seed: number): BotResult {
  const aim = aimOf(fz);
  const win = fz.dbl ? fz.tD(aim) : null;
  const tAim = win ? (win[0] + win[1]) / 2 : -1;
  const R = rng(seed);
  let ok = 0;
  const fails: Record<string, number> = {};
  for (let k = 0; k < TRIALS; k++) {
    const late = R.int(p.lateFrames[0], p.lateFrames[1]) * FRAME30;
    const delay = p.react + p.reactSd * R.n() + late;
    const s = aim + PHYS.maxRun * delay;
    const short = R.f() < p.short;
    const v0 = PHYS.jumpV * (short ? Math.sqrt(0.7) : 1);
    const hold = Math.max(0.03, HOLD + p.holdSd * R.n());
    const tD = fz.dbl ? Math.max(0.02, tAim + p.react + p.reactSd * R.n()) : -1;
    const hold2 = tD + Math.max(0.03, HOLD + p.holdSd * R.n());
    let drift: [number, number] | null = null;
    if (R.f() < p.drift) {
      const a = R.f() * 0.5;
      drift = [a, a + R.int(p.driftFrames[0], p.driftFrames[1]) * FRAME30];
    }
    const lag = Math.max(0, p.react + p.reactSd * R.n());
    const r = fly(e, assist, { s, v0, hold, tD, hold2, drift, lag });
    if (r === 'ok') ok++;
    else {
      const why = r === 'ranOff' ? 'ran off the ledge before the jump registered'
        : fz.dbl && tD >= 0 && !(win && tD >= win[0] - 0.02 && tD <= win[1] + 0.02) ? 'second flick outside its window'
        : short ? 'flick came out short'
        : r === 'over' ? 'overshot the landing'
        : r === 'back' ? 'came back down on the ledge'
        : 'fell short';
      fails[why] = (fails[why] ?? 0) + 1;
    }
  }
  return { rate: ok / TRIALS, fails };
}

/** the safest share of a hazard's cycle for a jump that passes through it: seconds clear of every cycle it crosses, and the cycle */
export interface Timing { what: string; safe: number; cycle: number }

function timingFor(stage: Stage, e: JumpEdge): Timing | null {
  const x0 = Math.min(e.x, e.dir === 1 ? e.to.x : e.to.x + e.to.width) - 20;
  const x1 = Math.max(e.x, e.dir === 1 ? e.to.x : e.to.x + e.to.width) + 60;
  const lo = Math.min(e.from.y, e.to.y) - 200, hi = Math.max(e.from.y, e.to.y) + 40;
  const over = (a: number, b: number) => a <= x1 && b >= x0;
  const list: Timing[] = [];
  for (const z of stage.zones ?? []) {
    if (isStatic(z) || !over(z.x0, z.x1) || z.bottom < lo || z.top > hi) continue;
    list.push({ what: `${z.kind === 'wind' ? 'wind gust' : z.kind === 'spore' ? 'spore cloud' : z.kind} cycle`, safe: idleTime(z), cycle: z.period });
  }
  for (const r of stage.proto?.w4?.rocks ?? []) if (over(r.x - 40, r.x + 40) && r.land > lo && r.land < hi + 200) list.push({ what: 'falling rock', safe: Math.max(0, r.every - r.warn - 0.4), cycle: r.every });
  for (const v of stage.proto?.thorns ?? []) if (over(v.x - v.reach, v.x + v.reach)) list.push({ what: 'thorn vine', safe: v.sleep, cycle: v.sleep + v.stir + v.look });
  for (const n of stage.proto?.w4?.nests ?? []) if (over(n.x0, n.x1)) list.push({ what: 'eaglets look', safe: Math.max(0, n.every - NEST.look), cycle: n.every });
  for (const pot of stage.proto?.w5?.pots ?? []) if (over(pot.x - TEAPOT.half, pot.x + TEAPOT.half)) list.push({ what: 'teapot steam', safe: pot.idle, cycle: pot.idle + pot.warn + pot.puff });
  for (const w of stage.proto?.w4?.falls ?? []) if (w.surge && !w.plug && over(w.x, w.x + w.width)) list.push({ what: 'surging fall', safe: w.surge.quiet, cycle: w.surge.pour + w.surge.ease + w.surge.quiet });
  // an animal pacing the landing: the share of its walk it spends clear of the spot he lands on
  const land = e.dir === 1 ? e.to.x + Math.min(70, e.to.width / 2) : e.to.x + e.to.width - Math.min(70, e.to.width / 2);
  for (const m of stage.enemies) {
    if (m.type === 'eagle' || Math.abs(surfaceOf(m) - e.to.y) > 12) continue;
    const span = m.patrolMaxX - m.patrolMinX;
    if (span <= 0 || land < m.patrolMinX - 60 || land > m.patrolMaxX + 60) continue;
    const v = Math.max(20, Math.abs(m.vx) || m.speed || 60);
    const cycle = (2 * span) / v;
    const near = Math.max(0, Math.min(land + 60, m.patrolMaxX) - Math.max(land - 60, m.patrolMinX));
    list.push({ what: `${m.type === 'turtle' ? 'snapper' : m.type} pacing the landing`, safe: cycle - (2 * near) / v, cycle });
  }
  if (!list.length) return null;
  return list.sort((a, b) => a.safe - b.safe)[0];
}

export interface JumpReport {
  x: number;
  y: number;
  gap: number;
  rise: number;
  landW: number;
  /** a miss costs a life (nothing under the gap) or only another go */
  miss: 'fall' | 'retry';
  /** the bot double-jumps here (it works better for it), and whether one jump cannot do it at all */
  dbl: boolean;
  dblNeeded: boolean;
  /** share of the most a clean jump (or double jump) reaches, on this setting */
  reach: number;
  /** the second-flick window with clean thumbs, from the take-off the bot aims for (s) */
  dblWindow: number | null;
  timing: Timing | null;
  rate: number | null;
  fails: Record<string, number>;
  why: string[];
  /** no clean jump makes it (the route's link is a liana, a puzzle or something the jump model does not cover) */
  unflyable?: boolean;
}

/** every jump on a route, on one setting, with one bot */

export function inspectJumps(stage: Stage, route: Route, easy: boolean, persona: Persona): JumpReport[] {
  const c = stage.config;
  const mission = (c.worldIndex - 1) * 10 + c.miniIndex;
  const assist = easy ? 1 : easeAssist(mission);
  const out: JumpReport[] = [];
  routeJumps(route).forEach((e, i) => {
    const pit = !stage.platforms.some((q) => q !== e.from && q !== e.to && !q.broken && q.x < Math.max(e.x, e.to.x + e.to.width / 2) && q.x + q.width > Math.min(e.x, e.to.x + e.to.width / 2) && q.y > Math.max(e.from.y, e.to.y) && q.y < Math.max(e.from.y, e.to.y) + 220);
    const base = { x: Math.round(e.x), y: Math.round(e.y), gap: Math.round(e.gap), rise: Math.round(e.rise), landW: Math.round(e.to.width), miss: (pit && e.gap > 30 ? 'fall' : 'retry') as 'fall' | 'retry' };
    const both = feasible(e, assist, mission >= 6);
    if (!both.one && !both.two) { out.push({ ...base, dbl: false, dblNeeded: false, reach: 1, dblWindow: null, timing: timingFor(stage, e), rate: null, fails: {}, why: ['no clean jump makes it in this model'], unflyable: true }); return; }
    // the bot takes one jump or a double jump, whichever works better for it (a player who keeps missing a tall stump double-jumps)
    const seed = 1000 + i * 7919 + Math.round(e.x);
    const r1 = both.one ? bots(e, assist, both.one, persona, seed) : null;
    const r2 = both.two ? bots(e, assist, both.two, persona, seed + 1) : null;
    const useTwo = !!r2 && (!r1 || r2.rate > r1.rate + 0.02);
    const fz = (useTwo ? both.two : both.one)!;
    const b = (useTwo ? r2 : r1)!;
    // the share of the most it can do: across (to the landing's height), or up, whichever is nearer its limit
    const reachMax = maxReach(e, assist, fz.dbl);
    const up = maxRise(assist, fz.dbl);
    const reach = Math.max(reachMax > 0 ? Math.max(0, e.gap) / reachMax : 1, Math.max(0, e.rise) / up);
    const aim = aimOf(fz);
    const w = fz.dbl ? fz.tD(aim) : null;
    const dblWindow = w ? w[1] - w[0] + 1 / 60 : null;
    const timing = timingFor(stage, e);
    const why: string[] = [];
    if (reach > 0.85) why.push('too far');
    if (e.to.width < 90) why.push('narrow landing');
    if (fz.dbl && dblWindow !== null && dblWindow < 0.2) why.push('double-jump window');
    if (fz.hi - fz.lo < 40) why.push('take-off spot');
    if (timing && timing.safe / timing.cycle < 0.5) why.push('timing');
    out.push({ ...base, dbl: fz.dbl, dblNeeded: !both.one, reach, dblWindow, timing, rate: b.rate, fails: b.fails, why });
  });
  return out;
}
