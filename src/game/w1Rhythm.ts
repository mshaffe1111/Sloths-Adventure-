/**
 * World 1's beat-built stages (w1-rhythm, 2026-11-04): 1-2 The Petal Trail and 1-5 Where She Walked, node by node on the research's
 * tension curve (11-04 line 531), every flow node traced on the stage's music beat (beatTrace.ts, line 597), no padding.
 *
 * This file lays out the stage as plain geometry (a Layout): ledges by tier and node, the gaps, the lianas, the flags, the petals, the
 * hazards on the avoided lines, the markers. protoStage.ts turns a Layout into the game's stage (platform styles, art, hints, goals).
 *
 *   1-2: an over-under loop-back (W1-REBUILD-PLAN.md row 1-2): out along the high canopy (A) on the swung beat, swinging over the drop;
 *        down onto the great bough (B) and back LEFT along it under the canopy; down to the forest floor (C) and right again under the
 *        bough, out into the open for the climax and the shrine. Every gap of the canopy and the floor drops out of the stage (a fall);
 *        the bough has none (the floor runs under it), so a miss never lands on a later part of the way.
 *   1-5: a trail that comes DOWN from the canopy to the floor at dusk (1-1 rises), on a broken beat, the fastest stage so far: snap
 *        twigs over real pits, Meeca's carvings closer and closer together into the last stretch, vines only in the counter-melody.
 */
import { APRON, checkTrace, easyNode, hazardSpots, stageBpm, traceNode, flight, type Ledge, type Move, type NodeSpec, type Step, type Surface, type Trace } from './beatTrace.ts';
import { heartsAtFlags, type ProtoExtras, type StageHint } from './protoStage.ts';
import { badPickups, fixPickups } from './flowerReach.ts';
import { PICKUP_APART, SAFE_APPROACH, swingLandings, validateStage } from './levelCheck.ts';
import { goalCounts } from './goals.ts';
import { busiestScreen, clumpExtras, offArc, PER_SCREEN, rowExtras } from './petals.ts';
import { swingSetup } from './physics.ts';
import { findForStage } from './finds.ts';
import type { GeneratedStage } from './stageGenerator.ts';
import type { Collectible, Enemy, LevelConfig } from './types.ts';
import { STAGE_PLAN } from './stagePlan.ts';
import { PHYS } from './physics.ts';
import { catchWindow, earlyCatch, jumpGrab, landWindow } from './protoCheck.ts';
import type { Platform, Vine } from './types.ts';

/** the stages built here */
export const RHYTHM_STAGES: ReadonlySet<string> = new Set(['1-2', '1-5']);

export type Tag = 'intro' | 'ramp' | 'spike' | 'rest' | 'counter' | 'climax' | 'cool';
export interface LNode {
  tag: Tag;
  /** the mechanic pair it plays */
  pair: string;
  /** the tier (1-2: A canopy, B bough, C floor; 1-5: the trail) */
  tier: string;
  dir: 1 | -1;
  x0: number;
  x1: number;
  y: number;
  bars: string[];
  /** take-offs a second */
  density: number;
  seconds: number;
}
export interface LLedge extends Omit<Ledge, 'surface'> {
  surface: Surface | 'apron' | 'bough' | 'catch';
  node: number;
  /** a snap twig: how long it holds once stepped on (s), from his run on it on the beat (crumble only) */
  hold?: number;
}
export interface Layout {
  stage: '1-2' | '1-5';
  bpm: number;
  ledges: LLedge[];
  vines: Array<{ x: number; topY: number; bottomY: number; node: number }>;
  nodes: LNode[];
  flags: Array<{ x: number; y: number }>;
  /** the beat path's petals (they show where the jump goes); `road`: on one road of a split (1-2's high branches or the bough under
   * them), else on the shared path every route crosses */
  petals: Array<{ x: number; y: number; road?: 'high' | 'low' }>;
  /** where a hazard sits on an avoided line (a snake on a bough or a ledge) */
  snakes: Array<{ x: number; y: number }>;
  /** 1-5's coiled boas (R-159.1, w1Tricks.ts 'coil'): punches bounce off, a kick bowls one off its ledge */
  boas: Array<{ x: number; y: number; facing: 1 | -1; asleep?: boolean }>;
  /** World 1's rocks standing on a ledge (x: middle, y: the ledge's top): a hop over each */
  rocks: Array<{ x: number; y: number }>;
  /** Meeca's carvings (1-5): the goal */
  marks: Array<{ x: number; y: number }>;
  /** the stage's keepsake or note, teased from a rest */
  find: { x: number; y: number } | null;
  /** Dot's lines: where, and what */
  lines: Array<{ x: number; text: string; y: number }>;
  spawn: { x: number; y: number };
  exit: { x: number; y: number };
  width: number;
  height: number;
  /** a fall from these spans costs a heart and sets him back on his ledge (Normal), not a life */
  heartFalls: Array<{ x0: number; x1: number }>;
  /** open air over a later part of the way (1-2's rotten bough over the floor leg): a fall that deep under his last ground is a fall
   * there and then (engine.ts fallZones), never a landing on the leg below */
  fallZones: Array<{ x0: number; x1: number; depth: number }>;
  /** a quick, sure player's seconds */
  expert: number;
  /** faces he can't pass (a trunk at the end of a leg): x0, x1, top, bottom */
  walls: Array<{ x0: number; x1: number; y0: number; y1: number }>;
}

// ------------------------------------------------------------------ dice ------------------------------------------------------------------

export function rng(seed: number, salt: string) {
  let h = 2166136261 >>> 0;
  for (const ch of salt) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
  let a = (h ^ Math.imul(seed >>> 0, 2654435761)) >>> 0;
  const f = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    f,
    r: (a0: number, b: number) => a0 + (b - a0) * f(),
    i: (a0: number, b: number) => Math.floor(a0 + (b - a0 + 1) * f()),
    pick: <T>(xs: readonly T[]): T => xs[Math.floor(f() * xs.length)],
    chance: (p: number) => f() < p,
  };
}
type Rng = ReturnType<typeof rng>;

// ------------------------------------------------------------------ steps that fit the beat ------------------------------------------------------------------

/** what a node may stand on and how it may rise and fall */
export interface Palette {
  /** surfaces for a landing (drawn at random, in this proportion) */
  surfaces: readonly Surface[];
  /** jump heights to choose from (px, up +) */
  jumpDy: readonly number[];
  hopDy: readonly number[];
  /** a double where the beat leaves room for one, this often */
  doubles: number;
  /** the lowest and highest the trail may go in this node (the game's y) */
  yMin: number;
  yMax: number;
  /** where the node must end (the game's y, within 30 px): its landings track a straight line from its start down (or up) to it */
  end?: number;
  /** snap twigs in short runs (one or two) between solid pads, never two solid pads running: each run is a snap the player meets anew */
  alternate?: boolean;
}

/** the marks' slots in order */
function marks(bars: readonly string[]): number[] {
  const out: number[] = [];
  bars.forEach((b, i) => [...b].forEach((c, s) => c !== '.' && out.push(i * 8 + s)));
  return out;
}

/**
 * Steps for a node's bars that fit its beat: each mark gets a move whose air time leaves it on the ground before the next mark (a hop
 * where the next is a quarter away, a double where it is more than a half away, if the palette wants), a height from the palette that
 * keeps the trail inside its band, and a surface. Rolled again until the tracer takes it (and Easy's version too).
 */
export function fitSteps(spec: Omit<NodeSpec, 'steps'>, pal: Palette, R: Rng, tries = 160): { steps: Step[]; tr: Trace; easy: Trace } {
  const ms = marks(spec.bars);
  const eighth = 30 / spec.bpm;
  const total = spec.bars.length * 8;
  let last: Error | null = null;
  for (let k = 0; k < tries; k++) {
    const steps: Step[] = [];
    let y = spec.y;
    for (let i = 0; i < ms.length; i++) {
      const room = ((i + 1 < ms.length ? ms[i + 1] : total + 4) - ms[i]) * eighth;
      // (the take-off after this one: if it is a quick one (a hop, which goes down), leave room below to hop down into)
      const nextRoom = i + 2 < ms.length ? (ms[i + 2] - ms[i + 1]) * eighth : i + 1 < ms.length ? (total + 4 - ms[i + 1]) * eighth : 9;
      const footroom = nextRoom < 0.6 ? 30 : 0;
      const fits = (move: Move, dy: number) => {
        const f = flight({ move, dy, vx: PHYS.maxRun });
        return !!f && f.t + 0.012 < room && y - dy >= pal.yMin && y - dy <= pal.yMax - footroom;
      };
      let surface = R.pick(pal.surfaces);
      if (pal.alternate) {
        const a = steps[steps.length - 1]?.surface, b = steps[steps.length - 2]?.surface;
        surface = a === 'crumble' && b === 'crumble' ? 'branch' : a && a !== 'crumble' ? 'crumble' : R.chance(0.5) ? 'crumble' : 'branch';
      }
      let pick: Step | null = null;
      // (a node with an end height: keep each landing near the line from its start to that end, a step down a tier at a time)
      const want = pal.end === undefined ? null : spec.y + (pal.end - spec.y) * ((i + 1) / ms.length);
      const near = (dys: number[]) => {
        if (want === null) return dys;
        const ok = dys.filter((d) => Math.abs(y - d - want) <= 26);
        return ok.length ? ok : dys;
      };
      if (room > 1.1 && R.chance(pal.doubles)) {
        const dys = near(pal.jumpDy.filter((d) => fits('double', d)));
        if (dys.length) pick = { move: 'double', dy: R.pick(dys), surface };
      }
      if (!pick) {
        const jd = near(pal.jumpDy.filter((d) => fits('jump', d) && !(surface === 'stump' && d <= 0)));
        const hd = near(pal.hopDy.filter((d) => fits('hop', d) && d !== 0));
        if (jd.length && (room > 0.6 || !hd.length)) pick = { move: 'jump', dy: R.pick(jd), surface };
        else if (hd.length) pick = { move: 'hop', dy: R.pick(hd), surface: surface === 'stump' ? 'branch' : surface };
      }
      if (!pick) break;
      // (a stump is a face to climb: only going up; coming down is onto a branch or a bank. A bank is ground: never up onto one across
      // a gap, where its face meets a short jump; up is onto a stump, a hop up onto a branch)
      if (pick.surface === 'stump' && pick.dy <= 0) pick.surface = pal.surfaces.includes('bank') ? 'bank' : 'branch';
      if (pick.surface === 'bank' && pick.dy > 0) pick.surface = pick.move === 'hop' ? 'branch' : 'stump';
      steps.push(pick);
      y -= pick.dy;
    }
    if (steps.length !== ms.length) continue;
    if (pal.end !== undefined && Math.abs(y - pal.end) > 30) continue;
    try {
      const tr = traceNode({ ...spec, steps, noOverhang: true });
      const es = easyNode({ ...spec, steps, noOverhang: true });
      const easy = traceNode(es);
      if (checkTrace(tr, steps).length || checkTrace(easy, es.steps, true).length) continue;
      return { steps, tr, easy };
    } catch (e) {
      last = e as Error;
    }
  }
  throw new Error(`no steps fit ${spec.bars.join('|')} at ${spec.bpm} BPM: ${last?.message}`);
}

/** a trace mirrored to run right to left from `x` (its entrance) */
function mirror(tr: Trace, x: number): Trace {
  const m = (v: number) => 2 * x - v;
  return {
    ...tr,
    ledges: tr.ledges.map((q) => ({ ...q, x0: m(q.x1), x1: m(q.x0) })),
    gaps: tr.gaps.map((g) => ({ ...g, x0: m(g.x1), x1: m(g.x0) })),
    landings: tr.landings.map((l) => ({ ...l, fromX: m(l.fromX), toX: m(l.toX), shortX: m(l.shortX), longX: m(l.longX), lateX: m(l.lateX) })),
    checkpoint: { ...tr.checkpoint, x: m(tr.checkpoint.x) },
    x0: m(tr.x1),
    x1: m(tr.x0),
    avoided: tr.avoided.map((a) => ({ ...a, path: a.path.map(([px, py]) => [m(px), py] as [number, number]) })),
    safe: tr.safe.map((p) => p.map(([px, py]) => [m(px), py] as [number, number])),
    walks: tr.walks.map((w) => ({ ...w, x0: m(w.x1), x1: m(w.x0) })),
  };
}

// ------------------------------------------------------------------ the builder ------------------------------------------------------------------

/**
 * Bars from the gaps between take-offs (in eighths): each take-off marked 'x' on an even eighth, 'o' on an odd one; `lead` eighths of
 * running first, and the last bar filled out with running. The broken beat is uneven gaps (3, 4, 3, 5...), the swung one long-short.
 */
export function barsFrom(gaps: readonly number[], lead = 0): string[] {
  const at: number[] = [lead];
  for (const g of gaps) at.push(at[at.length - 1] + g);
  const n = Math.ceil((at[at.length - 1] + 4) / 8);
  const cells = Array.from({ length: n * 8 }, () => '.');
  for (const a of at) cells[a] = a % 2 ? 'o' : 'x';
  return Array.from({ length: n }, (_, b) => cells.slice(b * 8, b * 8 + 8).join(''));
}

/** a snake's patrol either side of its middle (px), and how far above the bough his feet must pass over all of it on every safe try */
export const SNAKE_RANGE = 40;
export const SNAKE_CLEAR = 70;
/** every safe try passes this x span (the snake's patrol and its body, plus his) with his feet at least SNAKE_CLEAR over `floor` */
function clearAbove(safe: Trace['safe'], x: number, floor: number, range: number): boolean {
  for (const path of safe) for (const [px, py] of path) if (Math.abs(px - x) < range + 19 + 28 && py > floor - SNAKE_CLEAR) return false;
  return true;
}

/** a snap twig holds this long past his run on it on the beat (s): Normal, Easy */
export const SNAP_SPARE = 0.35;
export const SNAP_EASY = 0.75;

/** a stage in the making: the cursor and what is laid so far */
class Lay {
  L: Layout;
  node = -1;
  constructor(stage: Layout['stage'], bpm: number, readonly R: Rng, readonly easy: boolean) {
    this.L = { stage, bpm, ledges: [], vines: [], nodes: [], flags: [], petals: [], snakes: [], boas: [], rocks: [], marks: [], find: null, lines: [], spawn: { x: 0, y: 0 }, exit: { x: 0, y: 0 }, width: 0, height: 0, heartFalls: [], fallZones: [], expert: 0, walls: [] };
  }
  begin(tag: Tag, pair: string, tier: string, dir: 1 | -1, x: number, y: number, bars: string[] = []) {
    this.lastExit = null;
    this.node = this.L.nodes.length;
    this.L.nodes.push({ tag, pair, tier, dir, x0: x, x1: x, y, bars, density: 0, seconds: 0 });
  }
  end(x: number, seconds: number, density = 0) {
    const n = this.L.nodes[this.node];
    n.x0 = Math.min(n.x0, x);
    n.x1 = Math.max(n.x1, x);
    n.seconds = +seconds.toFixed(2);
    n.density = density;
    this.L.expert += seconds;
  }
  ledge(x0: number, x1: number, y: number, surface: LLedge['surface'], step = -1) {
    this.L.ledges.push({ x0: Math.round(x0), x1: Math.round(x1), y: Math.round(y), surface, step, node: this.node });
  }
  /** a traced node, laid down (right to left when dir is -1, entering at x); its flag on the entrance apron, petals over each jump */
  /** where the last traced node's exit apron ends (a node that starts right there shares that apron as its entrance) */
  lastExit: { x: number; y: number } | null = null;
  traced(tag: Tag, pair: string, tier: string, dir: 1 | -1, x: number, y: number, bars: string[], pal: Palette, opts: { petals?: boolean; fit?: ReturnType<typeof fitSteps>; flagsLow?: boolean } = {}) {
    // (two nodes back to back share one 200 px apron, the exit of the one and the entrance of the next: research 11-04 line 600 asks for
    // a flat safe apron at every node's seam, and two of them read as 2.8 s of walking, the validator's dead walk)
    const shared = dir === 1 && this.lastExit && Math.abs(this.lastExit.x - x) < 1 && this.lastExit.y === y;
    if (shared) x -= APRON;
    const spec = { bpm: this.L.bpm, bars, x: dir === 1 ? x : 0, y };
    const fit = opts.fit ?? fitSteps(spec, pal, this.R);
    let tr = this.easy ? fit.easy : fit.tr;
    if (dir === -1) tr = mirror(tr, 0);
    if (dir === -1) {
      // (mirrored about 0, then moved so its entrance is at x)
      const dx = x - tr.x1;
      tr = shift(tr, dx);
    }
    this.begin(tag, pair, tier, dir, tr.x0, y, bars);
    // (a snap twig holds for his run on it, on the beat, and a little more: it breaks once he has left it, never under him)
    const runOn = (step: number) => {
      const l = tr.landings[step], next = tr.landings[step + 1];
      return next ? next.t - (l.t + l.air) : 1;
    };
    for (const q of tr.ledges) {
      // (the shared apron is the last node's: this node's entrance ledge starts where it ends)
      if (shared && q.step === -1) {
        if (q.x1 - (x + APRON) > 8) this.ledge(x + APRON, q.x1, q.y, q.surface, q.step);
        continue;
      }
      this.ledge(q.x0, q.x1, q.y, q.surface, q.step);
      if (q.surface === 'crumble') this.L.ledges[this.L.ledges.length - 1].hold = +(Math.max(0, runOn(q.step)) + (this.easy ? SNAP_EASY : SNAP_SPARE)).toFixed(2);
    }
    this.L.flags.push({ x: Math.round(tr.checkpoint.x), y });
    // (a long node gets a flag about every 2,200 px too, on a solid ledge 140 px wide or more, in the way's order: no stretch between
    // flags over easyMode.ts FLAG_SPAN_MAX, so its pass never adds one out of order)
    // (`flagsLow`, a split: never up on its high branches: a flag there is reached only by the high road, and on Easy's 70% hold not at
    // all, G8; its flags go on the bough under them)
    const solid = tr.ledges.filter((q) => q.surface !== 'crumble' && q.x1 - q.x0 >= 140 && (!opts.flagsLow || q.y >= y - 40));
    const along = [...solid].sort((a, b) => dir * (a.x0 - b.x0));
    let last = dir === 1 ? tr.x0 : tr.x1;
    for (const q of along) {
      const at = dir === 1 ? q.x0 + 70 : q.x1 - 70;
      if (Math.abs(at - last) >= 2200 && Math.abs((dir === 1 ? tr.x1 : tr.x0) - at) >= 600) {
        this.L.flags.push({ x: Math.round(at), y: q.y });
        last = at;
      }
    }
    if (opts.petals !== false) for (const l of tr.landings) arcPetals(this.L.petals, l.fromX, l.toX, l.fromY, l.toY, l.move);
    const spots = hazardSpots(tr, ['skip', 'held']).filter((s) => s.kind === 'skip');
    this.L.expert += 0;
    const out = { tr, steps: fit.steps, spots };
    this.end(tr.x1, tr.seconds - (shared ? APRON / PHYS.maxRun : 0), tr.density);
    this.lastExit = dir === 1 ? { x: tr.x1, y: tr.yOut } : null;
    return out;
  }
}

function shift(tr: Trace, dx: number): Trace {
  const s = (v: number) => v + dx;
  return {
    ...tr,
    ledges: tr.ledges.map((q) => ({ ...q, x0: s(q.x0), x1: s(q.x1) })),
    gaps: tr.gaps.map((g) => ({ ...g, x0: s(g.x0), x1: s(g.x1) })),
    landings: tr.landings.map((l) => ({ ...l, fromX: s(l.fromX), toX: s(l.toX), shortX: s(l.shortX), longX: s(l.longX), lateX: s(l.lateX) })),
    checkpoint: { ...tr.checkpoint, x: s(tr.checkpoint.x) },
    x0: s(tr.x0),
    x1: s(tr.x1),
    avoided: tr.avoided.map((a) => ({ ...a, path: a.path.map(([px, py]) => [s(px), py] as [number, number]) })),
    safe: tr.safe.map((p) => p.map(([px, py]) => [s(px), py] as [number, number])),
    walks: tr.walks.map((w) => ({ ...w, x0: s(w.x0), x1: s(w.x1) })),
  };
}

/**
 * a petal just past each landing, at his body's height (one a jump): every player who makes the jump takes it, a full jump on the beat
 * and the first-timer's short flick alike (the pickup is 46 px round a point 20 px over his feet, engine.ts). At the top of the arc it
 * was 140 px up, over a short flick's head (D14): the fixed first-timer got about half of 1-2's petals
 */
function arcPetals(out: Layout['petals'], fx: number, tx: number, _fy: number, ty: number, _move: Move) {
  out.push({ x: Math.round(tx + Math.sign(tx - fx) * 14), y: Math.round(ty - 45) });
}

/** the petal shares (Matt, 2026-11-04, via the lead): the shared path every route crosses carries 70%, each road of a split 15% */
export const PETAL_ROAD = 15 / 70;
/**
 * 1-2's splits, each a high road (the branches the beat takes) over a low one (the bough under them): the high road keeps its landing
 * petals, as many as the low road gets along its solid bough (clear of the rotten stretches, the snakes and the flags), together
 * PETAL_ROAD of the shared path's count each. One play down either road reaches about 85%; 100% takes a replay.
 */
function splitPetals(L: Layout, splits: ReadonlyArray<{ x0: number; x1: number; line: number }>) {
  const inside = (pt: { x: number }) => splits.find((sp) => pt.x > sp.x0 && pt.x < sp.x1);
  const shared = L.petals.filter((pt) => !inside(pt));
  const high = L.petals.filter((pt) => { const sp = inside(pt); return sp && pt.y <= sp.line - 80; });
  // (and, where the high road has fewer landings than its share, spots along its branches: Easy's beat lands on fewer of them)
  for (const sp of splits) {
    for (const q of L.ledges) {
      if ((q.surface !== 'branch' && q.surface !== 'crumble') || q.y > sp.line - 50 || q.x1 < sp.x0 || q.x0 > sp.x1) continue;
      for (let x = q.x0 + 40; x <= q.x1 - 40; x += 70) if (!high.some((h) => Math.abs(h.x - x) < 50 && Math.abs(h.y - (q.y - 45)) < 30)) high.push({ x, y: q.y - 45 });
    }
  }
  high.sort((a, b) => a.x - b.x);
  const n = Math.min(high.length, Math.round(shared.length * PETAL_ROAD));
  const pick = <T,>(xs: T[], k: number) => (k <= 0 ? [] : Array.from({ length: k }, (_, i) => xs[Math.floor(((i + 0.5) * xs.length) / k)]));
  const highKeep = pick(high, n).map((pt) => ({ ...pt, road: 'high' as const }));
  const spots: number[][] = [];
  for (const sp of splits) {
    for (const q of L.ledges) {
      if (q.surface !== 'bough' || q.y !== Math.round(sp.line) || q.x1 < sp.x0 || q.x0 > sp.x1) continue;
      for (let x = Math.max(q.x0, sp.x0) + 60; x <= Math.min(q.x1, sp.x1) - 60; x += 40) {
        if (L.ledges.some((c) => c.surface === 'crumble' && c.y === q.y && x > c.x0 - 120 && x < c.x1 + 120)) continue;
        if (L.snakes.some((sn) => Math.abs(sn.y - q.y) < 20 && Math.abs(sn.x - x) < 140)) continue;
        if (L.flags.some((f) => Math.abs(f.y - q.y) < 20 && Math.abs(f.x - x) < 100)) continue;
        spots.push([x, q.y]);
      }
    }
  }
  spots.sort((a, b) => a[0] - b[0]);
  const low = pick(spots, Math.min(n, spots.length)).map(([x, y]) => ({ x, y: y - 45, road: 'low' as const }));
  const k = Math.min(highKeep.length, low.length);
  const all = apart([...apart(shared), ...pick(highKeep, k), ...pick(low, k)]);
  // (the spacing can drop a road's petal: the larger road gives up as many, so the two stay equal)
  const hi = all.filter((pt) => pt.road === 'high'), lo = all.filter((pt) => pt.road === 'low'), m = Math.min(hi.length, lo.length);
  L.petals = [...all.filter((pt) => !pt.road), ...pick(hi, m), ...pick(lo, m)];
}

/** petals at least PICKUP_APART + 4 px from each other (levelCheck.ts: two pickups closer are one on top of the other); the first kept */
function apart<T extends { x: number; y: number }>(pts: T[]): T[] {
  const out: T[] = [];
  for (const pt of pts) if (!out.some((o) => Math.hypot(o.x - pt.x, o.y - pt.y) < PICKUP_APART + 4)) out.push(pt);
  return out;
}

/**
 * A chain of n lianas from a ledge ending at `edge` (height y) to a far ledge, the vines hung from the canopy above: rolled until a
 * running jump grabs the first, every vine catches the next and the last lands on the far side (protoCheck.ts, the same checks as
 * protoStage.ts chain). Returns the far ledge's start.
 */
function vineChain(lay: Lay, edge: number, y: number, n: number, soft: boolean, farW = 400, farY = y, tops?: [number, number]): number {
  const R = lay.R;
  for (let tries = 0; tries < 16; tries++) {
    const easy = soft || tries > 8;
    const d0 = R.r(170, 200);
    const xs = [edge + d0];
    for (let k = 1; k < n; k++) xs.push(xs[k - 1] + (easy ? R.r(300, 330) : R.r(315, 350)));
    const farX = Math.round(xs[n - 1] + R.r(200, 240));
    // (lianas of different lengths: some hang long and low, some short)
    const topYs = xs.map(() => Math.round(tops ? R.r(tops[0], tops[1]) : y - (soft ? R.r(360, 390) : R.r(340, 460))));
    const vs: Vine[] = xs.map((vx, k) => ({ id: -1 - k, x: Math.round(vx), topY: topYs[k], bottomY: Math.min(y + 30, topYs[k] + R.r(330, 410)), swaySpeed: 1.1, swayPhase: 0, vineType: 'swing_liana', isSwingingVine: true }));
    const far: Platform = { id: -99, x: farX, y: farY, width: farW, height: 24, type: 'solid' };
    let ok = jumpGrab(edge, y, vs[0]) >= 4;
    for (let k = 0; ok && k < n - 1; k++) ok = catchWindow(vs[k], vs[k + 1]) > 0.6 && earlyCatch(vs[k], vs[k + 1]);
    if (ok) ok = landWindow(n > 1 ? vs[n - 2] : null, vs[n - 1], far) >= 8;
    // (and the level check's own swing (levelCheck.ts swingLandings: a ledge, the liana, a release onto the far ledge, 6 frames in a row),
    // so the shared gate proves every swing the stage asks for)
    if (ok && n === 1) {
      const from: Platform = { id: -98, x: edge - 300, y, width: 300, height: 24, type: 'solid' };
      const v = { ...vs[0] };
      swingSetup([v]);
      ok = (swingLandings(from, v, 1, [from, far], 1e9).get(-99) ?? 0) >= 7;
    }
    if (!ok && tries < 15) continue;
    for (const v of vs) lay.L.vines.push({ x: v.x, topY: v.topY, bottomY: v.bottomY, node: lay.node });
    return farX;
  }
  throw new Error('no vine chain fits');
}

// ------------------------------------------------------------------ 1-2 The Petal Trail: the over-under loop-back ------------------------------------------------------------------

/** 1-2's three tiers (the game's y of each surface) */
export const T12 = { A: 330, B: 630, C: 930 } as const;
/** the canopy's palette from the height he is at (Easy's rises are lower, so its trail drifts down: the band follows him) */
const PAL_A = (y: number): Palette => ({ surfaces: ['branch'], jumpDy: [-60, -40, -20, 0, 20, 40], hopDy: [-40, -30, -20], doubles: 0, yMin: Math.min(y, T12.A - 80), yMax: Math.max(y, T12.A + 90) });
/** the swung beat: a dotted half and a quarter (a long jump, a quick hop), now and then a whole bar's breath */
const swung = (R: Rng, n: number, breath = 0.3) => {
  // (each node of each roll swings its own way: 3:1 (a dotted half and a quarter), 2:1 (the shuffle), 5:1, all long-short: the feel is
  // the stage's, how far it leans rolls)
  const [long, short] = R.pick([[6, 2], [4, 2], [10, 2], [6, 2], [4, 2]] as const);
  const g: number[] = [];
  // (and a rest pad every five or six take-offs: a 10-eighth breath, about 1.7 s on a wide ledge, so no group runs past ~10 s,
  // STAGE-RULES §0b.1 and §2's rest pads)
  let since = 0;
  while (g.length < n) {
    if (since >= 5 + (g.length % 2)) {
      g.push(10);
      since = 0;
    } else if (R.chance(breath)) {
      g.push(8);
      since++;
    } else {
      g.push(long, short);
      since += 2;
    }
  }
  return g.slice(0, n);
};


/** a rotten stretch of 1-2's bough: how long it holds once he is on it (s; Easy's falls are free, a little longer still), its width, how
 * far it keeps from where the beat's way touches the bough, and how deep under his last ground a fall through it is a fall */
export const ROT_HOLD = { normal: 0.25, easy: 0.45 } as const;
export const ROT_MIN = 120;
export const ROT_MAX = 220;
export const ROT_CLEAR = 130;
export const ROT_DEPTH = 170;
/**
 * 1-2's bough leg bites the player who stays down on it (the lead's ruling, 2026-11-04; the research's line-59 rule: the hazard on the
 * avoided line): under the high branches, where the beat's way is up in the air or on the branches, the bough is rotten for a stretch and
 * gives way under him. The fall is a fall there and then (fallZones), a heart and back on the bough on Normal (the floor leg's heartFall
 * span covers the bough's), free on Easy: never a landing on the floor leg below, which would skip the rest of the bough. Never near
 * where the beat's way lands on or leaves the bough, a snake, a flag, or a liana below (lianas grab on touch).
 */
function rottenBough(L: Layout, tr: Trace, Lx: number, bRight: number, B: number, easy: boolean) {
  const touch = tr.ledges.filter((q) => q.y >= B - 10).map((q) => [q.x0, q.x1] as [number, number]);
  // (and both ends: the drop off the left end, and the landing apron where the canopy drops him on at the right)
  touch.push([Lx - 1, Lx + 200], [bRight - 520, bRight]);
  touch.sort((a, b) => a[0] - b[0]);
  const bough = L.ledges.find((q) => q.surface === 'bough' && q.y === Math.round(B) && q.x0 === Math.round(Lx));
  if (!bough) throw new Error('1-2: the bough is missing');
  const stretches: Array<[number, number]> = [];
  let reach = -Infinity;
  for (const [a, b] of touch) {
    const lo = reach + ROT_CLEAR, hi = a - ROT_CLEAR;
    const first = reach === -Infinity;
    reach = Math.max(reach, b);
    if (first) continue;
    if (hi - lo < ROT_MIN) continue;
    const w = Math.min(ROT_MAX, hi - lo);
    const s0 = Math.round((lo + hi - w) / 2), s1 = s0 + Math.round(w);
    if (L.vines.some((v) => v.x > s0 - 160 && v.x < s1 + 160)) continue;
    if (L.snakes.some((sn) => sn.y === B && sn.x > s0 - 150 - SNAKE_RANGE && sn.x < s1 + 150 + SNAKE_RANGE)) continue;
    if (L.flags.some((f) => Math.abs(f.y - B) < 20 && f.x > s0 - 200 && f.x < s1 + 200)) continue;
    stretches.push([s0, s1]);
  }
  if (!stretches.length) return;
  // the bough in pieces, the rotten stretches between them
  const i = L.ledges.indexOf(bough);
  const pieces: LLedge[] = [];
  let at = bough.x0;
  for (const [s0, s1] of stretches) {
    pieces.push({ ...bough, x0: at, x1: s0 });
    pieces.push({ ...bough, x0: s0, x1: s1, surface: 'crumble', hold: easy ? ROT_HOLD.easy : ROT_HOLD.normal });
    L.fallZones.push({ x0: s0 - 60, x1: s1 + 60, depth: ROT_DEPTH });
    at = s1;
  }
  pieces.push({ ...bough, x0: at, x1: bough.x1 });
  L.ledges.splice(i, 1, ...pieces);
}

/**
 * 1-2's layout. Swung beat (dotted half + quarter: a long jump, a quick hop: "swing... land-hop"), the pair jump + vine swing.
 * Nodes: intro (A) -> ramp (A) -> spike: the vines over the drop (A) -> rest over the loop (A; Dot; the note seen far below) ->
 * over the bough (A: high branches over a base bough) -> counter-melody back LEFT on the bough (B: hops up onto the high branches and
 * down, snakes on the bough for whoever stays down) -> under the bough (C, right; pits now) -> climax (C: swung jumps, doubles, a vine
 * pair over a chasm) -> cool-down to the shrine.
 */
export function layout12(seed: number, easy: boolean, bpm: number): Layout {
  const R = rng(seed, '1-2');
  const lay = new Lay('1-2', bpm, R, easy);
  const L = lay.L;
  const { A, B, C } = T12;
  L.spawn = { x: 140, y: A };
  /**
   * one swing in the middle of a stretch (the stage's pair, jump + vine, in one move: a run-up, the liana, a pad to land and hop off):
   * so the vines run all through 1-2, not in one bunch. `tops`: where the liana hangs from (under the bough, over the floor's pits).
   * A roll whose liana the checks refuse goes on without it.
   */
  const midSwing = (tag: Tag, tier: string, x0: number, yy: number, tops?: [number, number]) => {
    lay.begin(tag, 'jump + vine swing', tier, 1, x0, yy);
    lay.ledge(x0, x0 + 240, yy, 'apron');
    L.flags.push({ x: x0 + 100, y: yy });
    try {
      const far = vineChain(lay, x0 + 240, yy, 1, easy, 260, yy, tops);
      lay.ledge(far, far + 260, yy, yy >= FLOOR_Y ? 'bank' : 'branch');
      L.heartFalls.push({ x0: x0 + 240, x1: far });
      lay.end(far + 260, (far + 260 - x0) / 330 + 1.2);
      return far + 260;
    } catch {
      lay.end(x0 + 240, 240 / PHYS.maxRun);
      return x0 + 240;
    }
  };
  // ---- A: the canopy, rightwards
  let x = 40;
  const intro = lay.traced('intro', 'run + jump', 'A', 1, x, A, barsFrom(Array.from({ length: 8 }, () => R.pick([6, 8, 9])), 0), PAL_A(A));
  // (no catch branches: the jump is 1-1's, already taught; a miss here costs a heart and sets him back on his ledge, Easy a soft fall.
  // A catch under the gap made the jump optional: the quick route walked off onto it and stepped up, 2026-11-04 validator)
  L.heartFalls.push({ x0: intro.tr.x0, x1: intro.tr.x1 });
  L.lines.push({ x: 260, y: A, text: 'Follow the petals' });
  x = intro.tr.x1;
  const ramp1 = lay.traced('ramp', 'jump + hop (swung)', 'A', 1, x, intro.tr.yOut, barsFrom(swung(R, 7, 0.45)), PAL_A(intro.tr.yOut));
  L.heartFalls.push({ x0: ramp1.tr.x0, x1: ramp1.tr.x1 });
  x = midSwing('ramp', 'A', ramp1.tr.x1, ramp1.tr.yOut);
  const ramp = lay.traced('ramp', 'jump + hop (swung)', 'A', 1, x, ramp1.tr.yOut, barsFrom(swung(R, 8, 0.45)), PAL_A(ramp1.tr.yOut));
  L.heartFalls.push({ x0: ramp.tr.x0, x1: ramp.tr.x1 });
  x = ramp.tr.x1;
  let y = ramp.tr.yOut;
  // spike: the vine, taught over a catch branch (a miss lands on it), then the chain over the drop, then the swung jumps off it
  lay.begin('spike', 'jump + vine swing', 'A', 1, x, y);
  lay.ledge(x, x + 320, y, 'apron');
  L.flags.push({ x: x + 100, y });
  let edge = x + 320;
  const far1 = vineChain(lay, edge, y, 1, true, 360);
  lay.ledge(edge - 10, far1 + 40, y + 90, 'catch');
  lay.ledge(far1, far1 + 360, y, 'branch');
  edge = far1 + 360;
  const far2 = swings(lay, edge, y, 4, false, 240, 260);
  L.heartFalls.push({ x0: edge, x1: far2 });
  lay.end(far2, (far2 - lay.L.nodes[lay.node].x0) / 360 + 2);
  const off = lay.traced('spike', 'vine landing + hop (swung)', 'A', 1, far2 - 260, y, barsFrom(swung(R, 6, 0.2)), PAL_A(y));
  L.heartFalls.push({ x0: off.tr.x0, x1: off.tr.x1 });
  x = off.tr.x1;
  y = off.tr.yOut;
  // ---- the loop: the rest over the bough, then the high branches over a base bough (no gap a miss could fall through)
  const restX = x;
  lay.begin('rest', 'none (Dot; the note seen far below)', 'A', 1, x, y);
  lay.ledge(x, x + 1180, y, 'apron');
  L.flags.push({ x: x + 100, y });
  L.lines.push({ x: x + 200, y, text: "There's something down by the roots..." });
  x += 1180;
  lay.end(x, 1180 / PHYS.maxRun + 1);
  // (the bough's leg is fitted first: the canopy's high branches over the loop must reach further back than it does)
  const PAL_B: Palette = { surfaces: ['branch'], jumpDy: [-60, -50, 50, 60, 80, 90], hopDy: [-40, -30, -20], doubles: 0, yMin: B - 120, yMax: B };
  const barsB = barsFrom(swung(R, 12, 0.2));
  const fitB = fitSteps({ bpm, bars: barsB, x: 0, y: B }, PAL_B, R);
  const wB = (easy ? fitB.easy : fitB.tr).x1;
  let gapsTop = 10;
  const eighthPx = (30 / bpm) * PHYS.maxRun;
  while (gapsTop < 40 && (gapsTop * 4 + 8) * eighthPx + 400 < wB + 620 - 1180 + 300 + 200) gapsTop += 2;
  // (rotten wood taught here, where it is safe: a rotten branch high over the canopy's solid base bough holds his run on the beat and a
  // little more, and a hesitant player drops 50-120 px onto the base bough, nothing lost (STAGE-RULES: taught in a safe spot before it
  // can hurt). The bough leg's rotten stretches come next, and bite)
  const topNode = L.nodes.length;
  const top = lay.traced('ramp', 'jump up + down over a bough (rotten branches, taught)', 'A', 1, x, y, barsFrom(swung(R, gapsTop, 0)), { surfaces: ['branch'], jumpDy: [-50, -40, 40, 50, 80, 90], hopDy: [-40, -30, -20], doubles: 0, yMin: y - 120, yMax: y }, { flagsLow: true });
  // (every other branch 50 px or more over the base bough is rotten; each holds his run across it at full speed, the most the beat
  // keeps him on it, and SNAP_SPARE more (Easy: SNAP_EASY))
  let rot = true;
  for (const q of L.ledges) {
    if (q.node !== topNode || q.surface !== 'branch' || q.y > y - 50) continue;
    if (rot) { q.surface = 'crumble'; q.hold = +((q.x1 - q.x0) / PHYS.maxRun + (easy ? SNAP_EASY : SNAP_SPARE)).toFixed(2); }
    rot = !rot;
  }
  const rotten1 = L.ledges.find((q) => q.node === topNode && q.surface === 'crumble');
  if (!rotten1) throw new Error('1-2: no rotten branch to teach on over the base bough');
  L.lines.push({ x: rotten1.x0 - 260, y, text: 'Rotten wood! Don\'t stop on it!' });
  lay.ledge(x, top.tr.x1, y, 'bough');
  // (the split's flags on its base bough, the way everyone takes, every 2,200 px: none up on the high road, G8)
  for (let fx = x + 2200; fx < top.tr.x1 - 600; fx += 2200) L.flags.push({ x: Math.round(fx), y });
  const Rx = top.tr.x1;
  // turn 1: off the end, down onto the bough (B), whose right end is a trunk
  const bRight = Rx + 300;
  lay.ledge(Rx - 180, bRight, B, 'apron');
  L.walls.push({ x0: bRight, x1: bRight + 90, y0: B - 360, y1: B + 40 });
  L.lines.push({ x: Rx - 160, y: B, text: 'Back the other way, up off the snakes!' });
  // ---- B: the bough, leftwards. Its snakes sit on the bough under the highest branches, where the beat has him 80 px up or more:
  // a player who stays down on the bough meets them (the skip line), one on the beat passes over
  const back = lay.traced('counter', 'hop up + jump down (the bough, leftward)', 'B', -1, bRight, B, barsB, PAL_B, { fit: fitB, flagsLow: true });
  const Lx = back.tr.x0;
  if (Lx < restX + 620) throw new Error(`1-2: the bough runs out from under the canopy's safe stretch (${Lx} < ${restX + 620})`);
  lay.ledge(Lx, bRight, B, 'bough');
  // (and the bough leg's, right to left in the way's order: flagsInOrder)
  for (let fx = bRight - 2200; fx > Lx + 600; fx -= 2200) L.flags.push({ x: Math.round(fx), y: B });
  for (const q of back.tr.ledges) {
    if (q.y > B - 80) continue;
    for (let sx = q.x0 + 40; sx <= q.x1 - 40; sx += 20) {
      if (L.snakes.some((sn) => Math.abs(sn.x - sx) < 300)) continue;
      // (and never within 150 px of where a jump lands near the bough: research 11-04, "never ... within 150 pixels of where Pokey lands")
      // (nor of where a drop off any branch's end comes down on the bough: the quick route lands there, validator mechanics.ts enemyJobs)
      const nearLanding = back.tr.landings.some((l) => Math.abs(l.toY - B) < 100 && Math.abs(l.toX - sx) < 150 + SNAKE_RANGE)
        || back.tr.ledges.some((q) => q.y < B - 10 && (Math.abs(q.x0 - 60 - sx) < 150 + SNAKE_RANGE || Math.abs(q.x1 + 60 - sx) < 150 + SNAKE_RANGE));
      if (!nearLanding && clearAbove(back.tr.safe, sx, B, SNAKE_RANGE)) L.snakes.push({ x: Math.round(sx), y: B });
    }
  }
  // ---- C: the floor, rightwards from under the bough's left end (a landing pad under the drop, a trunk at its left)
  const padL = Lx - 480;
  lay.ledge(padL, Lx + 60, C, 'apron');
  // (the trunk overlaps the pad's end: no slit between them, w1Pits.ts would paint one)
  L.walls.push({ x0: padL - 90, x1: padL + 30, y0: C - 360, y1: C + 90 });
  L.lines.push({ x: padL + 20, y: C, text: 'Under the bough now. Watch the gaps!' });
  const PAL_C: Palette = { surfaces: R.pick([['bank', 'bank', 'stump'], ['bank', 'stump', 'stump'], ['bank', 'stump', 'branch']] as Surface[][]), jumpDy: [-60, -30, 0, 30, 50], hopDy: [-40, -30, -20], doubles: 0, yMin: C - 100, yMax: C };
  x = Lx + 60;
  const under1 = lay.traced('ramp', 'jump + hop (pits now)', 'C', 1, x, C, barsFrom(swung(R, 7, 0.4)), PAL_C);
  // (a liana hung from under the bough, over the floor's pit)
  x = midSwing('ramp', 'C', under1.tr.x1, under1.tr.yOut, [B + 50, B + 70]);
  const under = lay.traced('ramp', 'jump + hop (pits now)', 'C', 1, x, under1.tr.yOut, barsFrom(swung(R, 8, 0.4)), { ...PAL_C, yMin: Math.min(under1.tr.yOut, C) - 100, yMax: Math.max(under1.tr.yOut, C) });
  // (under the loop the flags don't take: engine.ts keeps the furthest-right flag, so a fall here costs a heart, never a life)
  L.heartFalls.push({ x0: padL, x1: Math.max(under.tr.x1, bRight + 100) });
  // the note: on the floor right under the rest, where the view from the rest looks down on it (upright)
  L.find = { x: Math.round(Math.max(padL + 120, restX + 420)), y: C };
  x = under.tr.x1;
  y = under.tr.yOut;
  const c1bars = barsFrom(swung(R, 9, 0.1));
  const climax1 = lay.traced('climax', 'jump + hop + drop (swung, densest)', 'C', 1, x, y, c1bars, { ...PAL_C, yMin: Math.min(y, C) - 100, yMax: Math.max(y, C), surfaces: ['bank', 'stump', 'branch'] });
  x = midSwing('climax', 'C', climax1.tr.x1, climax1.tr.yOut);
  y = climax1.tr.yOut;
  // (the second half never plays the first half's bars again: the same template with the same numbers is nothing you feel change,
  // STAGE-RULES §0c.3, tools/validate/variety.ts templateFlags; it leans denser, fewer breaths)
  const bars1 = c1bars.join('|');
  let bars2 = barsFrom(swung(R, 9, 0.05));
  for (let k = 0; k < 12 && bars2.join('|') === bars1; k++) bars2 = barsFrom(swung(R, 9 + (k % 2), 0.05));
  const climax = lay.traced('climax', 'jump + hop + drop (swung, densest)', 'C', 1, x, y, bars2, { ...PAL_C, yMin: Math.min(y, C) - 100, yMax: Math.max(y, C), surfaces: ['bank', 'stump', 'branch'] });
  x = climax.tr.x1;
  y = climax.tr.yOut;
  lay.begin('climax', 'jump + vine swing (over the chasm)', 'C', 1, x, y);
  lay.ledge(x, x + 200, y, 'apron');
  L.flags.push({ x: x + 100, y });
  const far3 = swings(lay, x + 200, y, 3, easy, 240, 300);
  lay.end(far3, (far3 - x) / 360 + 1);
  x = far3;
  // cool-down: a short run out of the chasm to the shrine
  lay.begin('cool', 'run', 'C', 1, x, y);
  lay.ledge(x, x + 640, y, 'apron');
  L.exit = { x: x + 420, y };
  lay.end(x + 640, 640 / PHYS.maxRun);
  L.width = x + 660;
  L.height = C + 120;
  rottenBough(L, back.tr, Lx, bRight, B, easy);
  // (the two splits: the high branches over the canopy's base bough, and the bough leg's branches over the bough)
  const topN = L.nodes[topNode], bN = L.nodes.find((nd) => nd.tier === 'B')!;
  splitPetals(L, [{ x0: topN.x0, x1: topN.x1, line: topN.y }, { x0: bN.x0, x1: bN.x1, line: B }]);
  // (no snake within reach of a safe spot: the level check's rule, a flag or the spawn within 400 px up or down, levelCheck.ts SAFE_APPROACH)
  const safe = [L.spawn, ...L.flags, L.exit];
  L.snakes = L.snakes.filter((sn) => !safe.some((f) => Math.abs(f.y - sn.y) < 400 && Math.abs(f.x - sn.x) < SAFE_APPROACH + SNAKE_RANGE + 40));
  return L;
}

// ------------------------------------------------------------------ 1-5 Where She Walked: the trail down ------------------------------------------------------------------

/**
 * 1-5's layout: down from the canopy to the floor at dusk, on a broken beat (uneven gaps of 3-6 eighths), snap twigs required over
 * real pits, Meeca's carvings closer together into the last stretch. Vines only in the counter-melody (1-2 owns them).
 * intro -> snap twigs taught (over a catch) -> ramp (snaps over pits, down a tier) -> spike (the dense snap run, down again) -> rest
 * (the keepsake seen on a high branch across the drop) -> counter-melody (jump + vine) -> climax: the carving chase (snaps, drops,
 * carvings every second ledge, to the floor) -> cool-down to the shrine.
 */
export function layout15(seed: number, easy: boolean, bpm: number): Layout {
  const R = rng(seed, '1-5');
  const lay = new Lay('1-5', bpm, R, easy);
  const L = lay.L;
  // the trail's tiers, canopy to floor: each middle node comes down one (a staircase you see from the rests)
  const T = { canopy: 330, two: 460, three: 590, four: 720, five: 820, floor: 930 } as const;
  L.spawn = { x: 140, y: T.canopy };
  /** a carving on the path: on the nearest solid ledge to (x, y) (never a snap twig, which breaks under it) */
  const mark = (x: number, y: number) => {
    const q = L.ledges.filter((l) => l.surface !== 'crumble' && l.surface !== 'catch' && l.x1 - l.x0 >= 60).sort((a, b) => Math.abs((a.x0 + a.x1) / 2 - x) - Math.abs((b.x0 + b.x1) / 2 - x))[0];
    if (!q) return;
    const mx = Math.max(q.x0 + 30, Math.min(q.x1 - 30, x));
    if (L.marks.some((m) => Math.abs(m.x - mx) < 120)) return;
    L.marks.push({ x: Math.round(mx), y: q.y });
  };
  let x = 40, y: number = T.canopy;
  /** a node's palette: down from where he is to `end`, snap twigs this often */
  const down = (end: number, snap: number): Palette => ({
    surfaces: snap >= 1 ? ['crumble'] : snap > 0 ? ['crumble', 'branch', 'crumble'] : ['branch'],
    alternate: snap > 0 && snap < 1,
    jumpDy: [-60, -50, -40, -30, -20, 0, 20], hopDy: [-30, -20], doubles: 0, yMin: Math.min(y, end) - 40, yMax: Math.max(y, end) + 30, end,
  });
  // (uneven gaps, a rest pad (9 eighths, about 1.3 s on a ledge) every seven or eight take-offs)
  const broken = (n: number, set: readonly number[]) => Array.from({ length: n }, (_, i) => (i % 8 === 7 ? 9 : R.pick(set)));
  // (each roll breaks the beat its own way, and leans on the snap twigs more or less)
  const SET = R.pick([[3, 4, 4, 5, 6], [3, 3, 5, 6, 6], [4, 4, 3, 5, 3, 6], [3, 5, 4, 6, 3]]);
  const SNAP = R.pick([0.5, 0.7, 0.85]);
  // ---- intro: the canopy, sparse jumps, the first carving on the path
  const intro = lay.traced('intro', 'run + jump', 'canopy', 1, x, y, barsFrom(Array.from({ length: 8 }, () => R.pick([7, 8, 9]))), { ...down(T.canopy, 0), jumpDy: [-30, -20, 0, 20, 30] });
  // (each mark at its ledge's far end, just before the take-off: the inspector counts a mark as a 1.5 s look, stageTime.ts relicSec, and
  // a mark at a ledge's start left a dead walk after it)
  mark(intro.tr.ledges[1].x1 - 40, intro.tr.ledges[1].y);
  L.lines.push({ x: 260, y, text: "Meeca's mark! Follow her trail" });
  x = intro.tr.x1;
  y = intro.tr.yOut;
  // ---- the snap twig, taught: twigs over catch branches (a miss is a hop back up)
  const teach = lay.traced('ramp', 'snap twig + jump (taught)', 'canopy', 1, x, y, barsFrom(broken(9, [4, 6, 8])), { ...down(y, 0), surfaces: ['crumble', 'branch'], alternate: true, jumpDy: [-20, 0, 20], end: undefined });
  // (taught safe: a catch branch under the far part of each gap, one hop below the far ledge: a jump that falls short lands on it, a walk
  // off the edge falls past it (about 70 px on at a run), so the jump is still the way)
  for (const g of teach.tr.gaps) {
    const far = teach.tr.ledges.find((q) => q.x0 >= g.x1 - 1);
    const cy = (far?.y ?? y) + 80;
    if (g.x1 + 60 - (g.x0 + 80) >= 60) lay.ledge(g.x0 + 80, g.x1 + 60, cy, 'catch');
  }
  L.lines.push({ x: x + 120, y, text: 'These ones snap! Keep moving' });
  x = teach.tr.x1;
  y = teach.tr.yOut;
  // ---- ramp: down a tier, snaps and plain branches, the broken beat; then down another, the falls real now
  const ramp = lay.traced('ramp', 'snap twig + jump (broken)', 'two', 1, x, y, barsFrom(broken(21, SET)), down(T.two, SNAP - 0.1));
  mark(ramp.tr.ledges[4].x1 - 40, ramp.tr.ledges[4].y);
  x = ramp.tr.x1;
  y = ramp.tr.yOut;
  const ramp2 = lay.traced('ramp', 'snap twig + jump, over the drop (broken)', 'three', 1, x, y, barsFrom(broken(21, SET)), down(T.three, SNAP));
  mark(ramp2.tr.ledges[5].x1 - 40, ramp2.tr.ledges[5].y);
  x = ramp2.tr.x1;
  y = ramp2.tr.yOut;
  // ---- spike: down another tier, all snaps, the quickest gaps
  const spike = lay.traced('spike', 'snap twig + drop', 'four', 1, x, y, barsFrom(broken(22, SET.filter((g) => g < 6))), down(T.four, 0.9));
  mark(spike.tr.ledges[5].x1 - 40, spike.tr.ledges[5].y);
  x = spike.tr.x1;
  y = spike.tr.yOut;
  // ---- rest: 4-5 s, the keepsake on a high branch across the drop (seen from here), reached up two branches
  lay.begin('rest', 'none (Dot; the keepsake seen across the drop)', 'three', 1, x, y);
  lay.ledge(x, x + 1180, y, 'apron');
  L.flags.push({ x: x + 100, y });
  lay.ledge(x + 860, x + 980, y - 70, 'branch');
  lay.ledge(x + 980, x + 1160, y - 140, 'branch');
  L.find = { x: x + 1080, y: y - 140 };
  L.lines.push({ x: x + 200, y, text: 'She came this way. Look up there!' });
  x += 1180;
  lay.end(x, 1180 / PHYS.maxRun + 1);
  // ---- the kick, taught (the lead's ruling, 2026-11-04: 1-5's new thing): a coiled boa, the first in the game, on a wide stone ledge,
  // Dot's line before it. Punches bounce off it ("TOUGH!"), a stomp bounces; a kick (a quick flick toward it) rolls it away along the
  // ledge and off its end. A flag at the ledge's start
  lay.begin('counter', 'kick a coiled boa (taught)', 'three', 1, x, y);
  lay.ledge(x, x + BOA_TEACH_W, y, 'apron');
  L.flags.push({ x: x + 100, y });
  L.lines.push({ x: x + 140, y, text: BOA_LINE });
  // (asleep: it wakes only when he walks right into it, and then takes a moment before it can strike, predatorAI.ts: the safe teach)
  L.boas.push({ x: x + Math.round(BOA_TEACH_W * 0.6), y, facing: -1, asleep: true });
  x += BOA_TEACH_W;
  lay.end(x, BOA_TEACH_W / PHYS.maxRun + 2);
  // ---- counter-melody: the only vines in 1-5, four swings of different lengths over the drop, down a tier on the way
  lay.begin('counter', 'jump + vine swing', 'five', 1, x, y);
  lay.ledge(x, x + 220, y, 'apron');
  L.flags.push({ x: x + 100, y });
  let e = x + 220;
  for (let k = 0; k < 5; k++) {
    const to = k < 2 ? y : k < 4 ? y + 40 : T.five;
    const w = R.pick([200, 240, 280]);
    const far = vineChain(lay, e, y, 1, easy, w, to);
    lay.ledge(far, far + w, to, 'branch');
    e = far + w;
    y = to;
  }
  L.heartFalls.push({ x0: x + 220, x1: e });
  mark(e - 120, y);
  lay.end(e, (e - x) / 300 + 4);
  x = e;
  // ---- climax: the carving chase, down two tiers to the floor, a carving every second ledge
  const climax = lay.traced('climax', 'snap twig + drop + hop (the chase)', 'floor', 1, x, y, barsFrom(broken(26, SET.filter((g) => g < 6))), down(T.floor, SNAP));
  // (the carving chase: closer and closer together toward the shrine)
  climax.tr.ledges.forEach((q, i) => { const n = climax.tr.ledges.length; if (i > 0 && i < n - 1 && i % (i < n / 2 ? 3 : 2) === 0) mark((q.x0 + q.x1) / 2, q.y); });
  // (the pair in one move: a coiled boa on a wide snap twig, kicked off it before the twig goes under him. The twig holds the kick's
  // time too, BOA_KICK_S; never the first twig of the climax, at most two, apart)
  const climaxN = L.nodes.length - 1;
  const twigs = L.ledges.filter((q) => q.node === climaxN && q.surface === 'crumble').sort((a, b) => a.x0 - b.x0);
  const all = L.ledges.filter((q) => q.node === climaxN).sort((a, b) => a.x0 - b.x0);
  // (each boa BOA_CLEAR past where the jump onto its twig lands (research 11-04: never within 150 px of a landing; the validator's
  // landing sits a little further on), the twig reaching on that far if the next gap keeps 45 px, still a jump (beatTrace MIN_GAP 40); widest twigs first, never the first)
  const land = (q: LLedge) => climax.tr.landings.find((l) => l.toX >= q.x0 - 2 && l.toX <= q.x1 + 2)?.toX ?? q.x0 + 40;
  for (const q of [...twigs.slice(1)].sort((a, b) => (b.x1 - b.x0) - (a.x1 - a.x0))) {
    if (L.boas.length >= 3) break;
    const bx = land(q) + BOA_CLEAR;
    if (L.boas.some((b) => Math.abs(b.x - bx) < 1200)) continue;
    const next = all[all.indexOf(q) + 1];
    // (and the next ledge's near edge as far: the quick route's jump off the twig lands right at it)
    if (next && next.x0 - bx < 150) continue;
    if (bx + 30 > q.x1) {
      if (!next || next.x0 - (bx + 30) < 45) continue;
      q.x1 = bx + 30;
    }
    L.boas.push({ x: bx, y: q.y, facing: -1 });
    q.hold = +((q.hold ?? 0.6) + (easy ? BOA_KICK_S.easy : BOA_KICK_S.normal)).toFixed(2);
  }
  // (a roll whose twigs are all too short for one: the climax's widest solid branch has it, kicked off its ledge in the chase)
  if (L.boas.length === 1) {
    const q = all.slice(1, -1).filter((c) => c.surface !== 'crumble').sort((a, b) => (b.x1 - b.x0) - (a.x1 - a.x0))[0];
    const nx = q ? all[all.indexOf(q) + 1] : undefined;
    if (q && land(q) + BOA_CLEAR + 30 <= q.x1 && (!nx || nx.x0 - (land(q) + BOA_CLEAR) >= 150)) L.boas.push({ x: land(q) + BOA_CLEAR, y: q.y, facing: -1 });
  }
  x = climax.tr.x1;
  y = climax.tr.yOut;
  lay.begin('cool', 'run', 'floor', 1, x, y);
  lay.ledge(x, x + 640, y, 'apron');
  L.exit = { x: x + 400, y };
  lay.end(x + 640, 640 / PHYS.maxRun);
  L.width = x + 660;
  L.height = Math.max(...L.ledges.map((q) => q.y)) + 120;
  L.petals = apart(L.petals);
  return L;
}

// ------------------------------------------------------------------ the game's stage ------------------------------------------------------------------

/** the layout for this stage and roll; a roll whose dice can't be fitted is rolled again from the next seed (deterministic) */
export function rhythmLayout(id: '1-2' | '1-5', seed: number, easy: boolean, bpm: number): Layout & { reroll: number } {
  const f = id === '1-2' ? layout12 : layout15;
  let last: Error | null = null;
  for (let k = 0; k < 8; k++) {
    try {
      return { ...f(seed + k * 7919, easy, bpm), reroll: k };
    } catch (e) {
      last = e as Error;
    }
  }
  throw new Error(`${id} seed ${seed}: no layout in 8 rolls: ${last?.message}`);
}

/** a ledge on the floor (1-2's C, 1-5's last tier) is ground: a bank; anything higher is a branch */
const FLOOR_Y = 850;

/**
 * The game's stage from a layout: banks on the floor, branches above it, mossy stumps, snap twigs (fragile, each with its own hold),
 * lianas, the bough's snakes, the flags with a heart at every second, the petals on the jump arcs, World 1's find for the stage, Dot's
 * lines, the shrine. On Normal the spans where a flag can't take (1-2's leftward leg and the floor under it) cost a heart, not a life;
 * Easy's falls are the engine's soft falls everywhere.
 */
export function buildRhythmStage(config: LevelConfig, seed: number, easy: boolean): GeneratedStage & { proto: ProtoExtras } {
  // (the level check is the shared judge: a roll it can't see through, a swing its model doesn't take, is rolled again; 9 ms a check)
  let last: string[] = [];
  for (let k = 0; k < 6; k++) {
    const st = rhythmStage(config, seed + k * 104729, easy);
    const r = validateStage(st, { rooms: false });
    if (r.ok) {
      st.proto.rhythm!.reroll += k;
      return st;
    }
    last = r.errors;
  }
  throw new Error(`${config.id} seed ${seed}: no roll passes the level check: ${last.slice(0, 3).join('; ')}`);
}

/** 1-5's kick: the teaching ledge's width, the narrowest snap twig a boa sits on, how much longer such a twig holds (the kick's time),
 *  and Dot's line (approved; it moves here from 1-9, where it still shows on a struggle) */
export const BOA_TEACH_W = 760;
export const BOA_CLEAR = 175;
export const BOA_KICK_S = { normal: 0.8, easy: 1.2 } as const;
export const BOA_LINE = 'A coiled boa! Punches bounce off. Kick it!';
/** the first seconds of the way, at full run, in which no gap can hurt (a catch under each) */
export const OPENING_S = 6.5;
/** 1-2's petal goal, a share of its petals, from the first-timer bots' runs */
export const PETAL_SHARE = { normal: 0.6, easy: 0.6 } as const;
const petalGoal = (n: number, k: number) => Math.max(1, Math.round(n * k));
/**
 * 1-2's two splits on the stage as built (Matt's 70/30, the lead 2026-11-04; as protoStage.ts splitPetals does 1-3's): the petal pass has
 * filled the trail's long gaps, most of them on the shared path, so each road (the high branches, the bough under them) is brought to
 * 15/70 of the shared petals: extras taken off evenly, then even spots filled (clear of the snakes, the rotten wood and the flags), each
 * new petal kept only where the pass's own rules still hold (six a screen, no rows, no clumps)
 */
function rhythmRoads(st: GeneratedStage & { proto: ProtoExtras }): void {
  const nodes = st.proto.rhythm?.nodes ?? [];
  const top = nodes.find((n) => n.tier === 'A' && n.pair.includes('rotten branches')), leg = nodes.find((n) => n.tier === 'B');
  if (!top || !leg) return;
  const splits = [{ x0: top.x0, x1: top.x1, line: top.y }, { x0: leg.x0, x1: leg.x1, line: T12.B }];
  const isPet = (c: Collectible) => c.type === 'flower' || c.type === 'leaf';
  // (by height too: the bough leg runs under the canopy, whose petals are the shared path's)
  const roadOf = (c: { x: number; y: number }) => {
    const sp = splits.find((q) => c.x > q.x0 && c.x < q.x1 && c.y >= q.line - 180 && c.y <= q.line + 10);
    return !sp ? null : c.y <= sp.line - 80 ? 'high' : 'low';
  };
  const want = Math.round((st.collectibles.filter((c) => isPet(c) && !roadOf(c)).length * 15) / 70);
  // (a road over its share gives up its extras, evenly along it)
  for (const r of ['high', 'low'] as const) {
    const on = st.collectibles.filter((c) => isPet(c) && roadOf(c) === r).sort((a, b) => a.x - b.x);
    const extra = on.length - want;
    for (let i = 0; i < extra; i++) {
      const c = on[Math.floor(((i + 0.5) * on.length) / extra)];
      st.collectibles.splice(st.collectibles.indexOf(c), 1);
    }
  }
  const spots: Record<'high' | 'low', Array<{ x: number; y: number }>> = { high: [], low: [] };
  for (const sp of splits) {
    for (const p of st.platforms) {
      if (p.type !== 'solid' || p.x + p.width < sp.x0 || p.x > sp.x1) continue;
      const r = p.y <= sp.line - 50 && p.y >= sp.line - 135 && p.style === 'branch' ? 'high' : p.y === Math.round(sp.line) && p.style === 'log' ? 'low' : null;
      if (!r) continue;
      for (let fx = Math.max(p.x, sp.x0) + 50; fx <= Math.min(p.x + p.width, sp.x1) - 50; fx += 30) {
        if (st.enemies.some((e) => Math.abs(e.y + 14 - p.y) < 20 && Math.abs(e.x - fx) < 140)) continue;
        if (st.platforms.some((f) => f.type === 'fragile' && Math.abs(f.y - p.y) < 10 && fx > f.x - 120 && fx < f.x + f.width + 120)) continue;
        if ((st.checkpoints ?? []).some((f) => Math.abs(f.y - p.y) < 20 && Math.abs(f.x - fx) < 100)) continue;
        // (and open air over it: a petal under a branch 75 px up or less is boxed in, the level check cannot take it)
        if (st.platforms.some((f) => f !== p && f.y < p.y && f.y > p.y - 75 && fx > f.x - 30 && fx < f.x + f.width + 30)) continue;
        spots[r].push({ x: fx, y: p.y - 45 });
      }
    }
  }
  let id = Math.max(0, ...st.collectibles.map((c) => c.id)) + 1;
  const firstNew = id;
  for (const r of ['high', 'low'] as const) {
    let have = st.collectibles.filter((c) => isPet(c) && roadOf(c) === r).length;
    const list = spots[r].sort((a, b) => a.x - b.x);
    for (let k = 0; have < want && k < 3; k++) {
      // (three passes over the road's spots, spread out first, then closer)
      const step = Math.max(1, Math.floor(list.length / Math.max(1, want - have)) >> k);
      for (let i = Math.floor(step / 2); i < list.length && have < want; i += step) {
        const q = list[i];
        const c: Collectible = { id, type: 'flower', botanicalVariant: 'orchid', x: q.x, y: q.y, collected: false, bobPhase: (q.x * 0.031) % 6.28 };
        const pets = [...st.collectibles.filter(isPet), c];
        if (st.collectibles.some((o) => o.type !== 'exit_totem' && Math.hypot(o.x - c.x, o.y - c.y) < PICKUP_APART + 4)) continue;
        if (busiestScreen(pets).n > PER_SCREEN || rowExtras(pets).size || clumpExtras(pets).size) continue;
        st.collectibles.push(c);
        id++;
        have++;
      }
    }
  }
  // (a new petal the level check cannot reach is taken off again: flowerReach.ts badPickups, the check the stage's test holds it to)
  const bad = new Set(badPickups({ platforms: st.platforms, vines: st.vines, waterY: st.waterY }, st.collectibles).filter((c) => c.id >= firstNew));
  // (nor one hanging below a required jump's arc: the petal rules, petals.ts offArc)
  for (const c of offArc(st, st.collectibles.filter(isPet))) if (c.id >= firstNew) bad.add(c);
  st.collectibles = st.collectibles.filter((c) => !bad.has(c));
  // (NOT thinned to keep the shares: where the six-a-screen cap leaves a road short, thinning the shared path to match took 1-2 down to
  // about 27 petals and sealed the door, the fixed first-timer, 2026-11-04 5:15 PM; the 70/30 shares on the built stage are open, R-id
  // to come: the petal pass's trail fills the shared path past 70%)
}

/** 1-2's goal on the stage as built, after the petal pass (protoStage.ts: it fills the trail's long gaps): PETAL_SHARE of the petals it
 *  holds, counted as the goal counts them (goals.ts goalCounts: none on a crumbling branch) */
export function rhythmPetalGoal(st: GeneratedStage, easy: boolean): void {
  rhythmRoads(st as GeneratedStage & { proto: ProtoExtras });
  const n = goalCounts(st as never).petals;
  st.normalGoal = petalGoal(n, PETAL_SHARE.normal);
  st.easyGoal = petalGoal(n, PETAL_SHARE.easy);
  st.config = { ...st.config, targetCount: easy ? st.easyGoal : st.normalGoal };
}

function rhythmStage(config: LevelConfig, seed: number, easy: boolean): GeneratedStage & { proto: ProtoExtras } {
  const id = config.id as '1-2' | '1-5';
  const bpm = stageBpm(config);
  const L = rhythmLayout(id, seed, easy, bpm);
  const P: Platform[] = [];
  const V: Vine[] = [];
  const E: Enemy[] = [];
  const C: Collectible[] = [];
  let pid = 1, vid = 1, eid = 1, cid = 1;
  const bottom = Math.max(...L.ledges.map((q) => q.y));
  // (World 1's own platform art, used so each stage looks its own (the validator's look-alike, tools/validate/look.ts): 1-2's canopy
  // is rope-and-plank bridges between short branches, its great bough a log, its floor banks and mossy stumps; 1-5's trail is mossy
  // stone ledges and short branches between the snap twigs)
  const style = (q: LLedge): Platform['style'] => {
    if (id === '1-2') {
      if (q.surface === 'bough') return 'log';
      const tier = L.nodes[q.node]?.tier;
      if (tier === 'A' || q.surface === 'catch') return q.x1 - q.x0 >= 220 || q.surface === 'apron' ? 'canopy_bridge' : 'branch';
      return 'branch';
    }
    // (a floating 'log' draws as a wooden crate: never in the canopy)
    return q.surface === 'apron' || q.x1 - q.x0 >= 200 ? 'moss_stone' : 'branch';
  };
  // (nothing hurts in the first seconds: a catch branch under every gap he meets in the first OPENING_S of the way, 60 px under the
  // lower lip, so a short first jump drops onto it and a hop goes back up (STAGE-RULES: nothing can hurt in the first ~3-5 s, and Dot's
  // first tip, "Flick up just before the edge", comes at about 4-5 s; the first-timer bot fell into the first gap at 1.6 s)
  const intro = L.ledges.filter((q) => q.node === 0 && q.surface !== 'catch' && q.x0 < L.spawn.x + OPENING_S * PHYS.maxRun).sort((a, b) => a.x0 - b.x0);
  // (under each gap he meets in the first seconds, a catch branch 60 px under the lower lip, ending against a stone face under the far
  // ledge's near end: holding the way on, he drops onto the catch and is stopped by the face, never hurt, and a hop goes up. Never one
  // low branch under the whole opening: the quick route walked it, a dead walk of 5-7 s (fun gate))
  for (let i = 1; i < intro.length; i++) {
    const a = intro[i - 1], b = intro[i];
    if (b.x0 - a.x1 < 20) continue;
    const y = Math.max(a.y, b.y) + 60;
    P.push({ id: pid++, x: a.x1 - 30, y, width: b.x0 + 50 - (a.x1 - 30), height: 24, type: 'solid', style: 'branch' });
    P.push({ id: pid++, x: b.x0, y: b.y, width: 50, height: y - b.y, type: 'solid', style: 'moss_stone', art: 'rock' });
    // (a catch the layout already laid there, 1-5's teach catches: this one replaces it)
    for (const c of L.ledges) if (c.surface === 'catch' && c.x0 < b.x0 && c.x1 > a.x1) c.x1 = c.x0;
  }
  for (const q of L.ledges) {
    const w = q.x1 - q.x0;
    if (w < 8) continue;
    if (q.surface === 'stump') {
      P.push({ id: pid++, x: q.x0, y: q.y, width: w, height: bottom + 90 - q.y, type: 'solid', style: 'moss_stone' });
    } else if (q.y >= FLOOR_Y && (q.surface === 'bank' || q.surface === 'apron')) {
      P.push({ id: pid++, x: q.x0, y: q.y, width: w, height: 90, type: 'solid', style: 'log' });
    } else if (q.surface === 'crumble') {
      P.push({ id: pid++, x: q.x0, y: q.y, width: w, height: 24, type: 'fragile', style: 'branch', creak: q.hold ?? 0.6 });
    } else {
      P.push({ id: pid++, x: q.x0, y: q.y, width: w, height: q.surface === 'bough' ? 40 : 24, type: 'solid', style: style(q) });
    }
  }
  // (the floor: a slit under 40 px between two floor pieces is no gap he can fall through (he is 38 wide), only a sliver the pit art
  // would paint: the lower piece reaches under the higher one's edge. And every floorless gap left is a drop, painted as one (w1Pits.ts:
  // an unmarked fall in World 1 is water, and these stages have none))
  const floor = P.filter((q) => q.type === 'solid' && q.y >= bottom - 250).sort((a, b) => a.x - b.x);
  // (any two floor pieces, not only neighbours in x order: a branch over the floor can sort between a stump and the bank after it)
  for (const b of floor) {
    for (const a of floor) {
      const gap = b.x - (a.x + a.width);
      if (a === b || gap <= 0 || gap >= 40 || Math.abs(a.y - b.y) > 120) continue;
      if (b.y >= a.y) { b.width += gap; b.x -= gap; } else a.width += gap;
    }
  }
  for (const r of L.rocks) P.push({ id: pid++, x: r.x - 35, y: r.y - 52, width: 70, height: 52, type: 'solid', style: 'moss_stone', art: 'rock' });
  for (const wl of L.walls) P.push({ id: pid++, x: wl.x0, y: wl.y0, width: wl.x1 - wl.x0, height: wl.y1 - wl.y0, type: 'solid', style: 'moss_stone' });
  for (const q of P) if (q.type === 'solid' && (q.y >= bottom - 250 || q.y + q.height >= bottom - 150)) q.pit = 'drop';
  for (const v of L.vines) V.push({ id: vid++, x: v.x, topY: v.topY, bottomY: v.bottomY, swaySpeed: 1.1, swayPhase: (v.x * 0.013) % 6.28, vineType: 'swing_liana', isSwingingVine: true });
  for (const sn of L.snakes) {
    E.push({
      asleep: false, id: eid++, type: 'snake', x: sn.x, y: sn.y - 14, vx: 28, vy: 0, width: 38, height: 22, hp: 1, maxHp: 1, facing: sn.x % 2 ? 1 : -1,
      patrolMinX: sn.x - SNAKE_RANGE, patrolMaxX: sn.x + SNAKE_RANGE, attackCooldown: 2, telegraphTimer: 0, isAttacking: false,
      animTimer: 0, hitFlashTimer: 0, defeated: false, koTimer: 0, behaviorTimer: 0,
    } as Enemy);
  }
  // (World 1's coiled boas: protoStage.ts boa(), tagged 'coil' as the stage loads, w1Tricks.ts tagWorld1)
  for (const b of L.boas) {
    E.push({
      asleep: !!b.asleep, id: eid++, type: 'boa', x: Math.round(b.x), y: b.y - 16, vx: 0, vy: 0, width: 58, height: 26, hp: 3, maxHp: 3, facing: b.facing,
      patrolMinX: b.x - 12, patrolMaxX: b.x + 12, attackCooldown: 1.2, telegraphTimer: 0, isAttacking: false,
      animTimer: 0, hitFlashTimer: 0, defeated: false, koTimer: 0, behaviorTimer: 0,
    } as Enemy);
  }
  L.petals.forEach((pt, i) => C.push({ id: cid++, type: 'flower', botanicalVariant: i % 3 === 2 ? 'hibiscus' : 'orchid', x: pt.x, y: pt.y, collected: false, bobPhase: (pt.x * 0.031) % 6.28 }));
  // 1-5: Meeca's marks are the goal (relic_hunt): all of them on Normal, 65% on Easy
  for (const m of L.marks) C.push({ id: cid++, type: 'relic', mark: 'meeca', x: m.x, y: m.y - 34, collected: false, bobPhase: (m.x * 0.017) % 6.28 });
  const find = findForStage(config.worldIndex, config.miniIndex);
  if (find && L.find) C.push({ id: cid++, type: 'find', findId: find.id, hidden: false, x: L.find.x, y: L.find.y - 26, collected: false, bobPhase: 0 });
  C.push({ id: cid++, type: 'exit_totem', x: L.exit.x, y: L.exit.y - 30, collected: false, bobPhase: 0 });
  // (nothing past the shrine: the engine stops him at it)
  for (let i = C.length - 1; i >= 0; i--) if (C[i].type !== 'exit_totem' && C[i].x > L.exit.x + 30) C.splice(i, 1);
  const checkpoints = L.flags.map((f) => ({ x: f.x, y: f.y, reached: false }));
  cid = heartsAtFlags(C, checkpoints, cid);
  // (a petal on top of a heart, a mark or the find is lifted clear of it: the level check reads two pickups that close as one)
  for (const c of C) {
    if (c.type !== 'flower') continue;
    for (const o of C) if (o !== c && o.type !== 'flower' && o.type !== 'exit_totem' && Math.hypot(o.x - c.x, o.y - c.y) < PICKUP_APART) c.y = o.y - PICKUP_APART - 4;
  }
  const hints: StageHint[] = L.lines.map((l) => ({ x: l.x, text: l.text, pad: l.text, keys: l.text, ...(l.y >= 600 ? { belowY: l.y - 60 } : { aboveY: l.y + 60 }) }));
  const movedPickups = fixPickups({ platforms: P, vines: V, ropes: [] }, C);
  const cfg: LevelConfig = { ...config, levelWidth: L.width, levelHeight: L.height, ...(L.marks.length ? { targetCount: Math.max(1, Math.round(L.marks.length * (easy ? 0.65 : 0.85))) } : id === '1-2' ? { targetCount: petalGoal(L.petals.length, easy ? PETAL_SHARE.easy : PETAL_SHARE.normal) } : {}) };
  const beats: Array<[number, number, string]> = L.nodes.map((n) => [n.x0, n.x1, `${n.tag[0].toUpperCase()}${n.tag.slice(1)}: ${n.pair}`]);
  return {
    config: cfg,
    trees: [],
    platforms: P,
    vines: V,
    ropes: [],
    enemies: E,
    boss: null,
    collectibles: C,
    spawnX: L.spawn.x,
    spawnY: L.spawn.y,
    exitTotemX: L.exit.x,
    exitTotemY: L.exit.y,
    // (1-2 turns back on itself: its flags stay in the way's order and take in it, engine.ts flagsInOrder; 1-5 runs one way)
    checkpoints: id === '1-2' ? checkpoints : checkpoints.sort((a, b) => a.x - b.x),
    ...(id === '1-2' ? { flagsInOrder: true } : {}),
    ...(easy || !L.heartFalls.length ? {} : { heartFalls: L.heartFalls }),
    ...(L.fallZones.length ? { fallZones: L.fallZones } : {}),
    // (Normal: 85% of the marks, from the fixed first-timer's runs, the lead's ruling 2026-11-04: the adult got 12 and 13 of 14)
    ...(L.marks.length ? { easyGoal: Math.max(1, Math.round(L.marks.length * 0.65)), normalGoal: Math.max(1, Math.round(L.marks.length * 0.85)) } : {}),
    // (1-2's petals: 75% of them (the lead's ruling 2026-11-04, Matt's 70/30 rule): the shared path holds 70%, either road 15% more, so
    // the goal is always in reach whichever road he takes (splitPetals); checked against the fixed first-timer bots' runs)
    ...(id === '1-2' ? { normalGoal: petalGoal(L.petals.length, PETAL_SHARE.normal), easyGoal: petalGoal(L.petals.length, PETAL_SHARE.easy) } : {}),
    meta: { attempt: seed, chunks: L.nodes.map((n) => n.tag), width: L.width, pieces: L.nodes.map((n) => ({ k: `${id} ${n.tag} ${n.tier}`, x0: n.x0, x1: n.x1 })), timing: { layoutSeconds: L.expert, decorSeconds: 0, route: L.width } },
    proto: { hints: hints.sort((a, b) => a.x - b.x), covers: [], beats, movedPickups, bpm, rhythm: { bpm, nodes: L.nodes, reroll: L.reroll } },
  } as GeneratedStage & { proto: ProtoExtras };
}

/**
 * Swings over a drop, one liana per gap with a short branch between (swing... land, hop, jump for the next): the level check (levelCheck.ts)
 * proves a ledge-liana-ledge swing, not liana to liana, and the land-hop is the stage's swung beat. Returns the end of the last branch.
 */
function swings(lay: Lay, edge: number, y: number, n: number, soft: boolean, pad = 240, lastPad = 320): number {
  let e = edge;
  for (let k = 0; k < n; k++) {
    const w = k === n - 1 ? lastPad : pad;
    const far = vineChain(lay, e, y, 1, soft, w);
    lay.ledge(far, far + w, y, 'branch');
    e = far + w;
  }
  return e;
}

// ------------------------------------------------------------------ how far two rolls are apart ------------------------------------------------------------------

const rollMemo = new Map<string, Layout>();
/** the layout of a roll as the game builds it on Normal (memoised: a replay asks for a few) */
function rollLayout(id: '1-2' | '1-5', seed: number): Layout {
  const key = `${id}|${seed}`;
  const hit = rollMemo.get(key);
  if (hit) return hit;
  const mini = Number(id.slice(2));
  const spec = STAGE_PLAN[1][mini - 1];
  const L = rhythmLayout(id, seed, false, stageBpm({ worldIndex: 1, id, miniIndex: mini, objectiveType: spec.type }));
  if (rollMemo.size > 32) rollMemo.clear();
  rollMemo.set(key, L);
  return L;
}

/**
 * How different two rolls of a beat-built stage play, 0 (the same) to 1 (nothing alike), node by node (the design, the nodes, is fixed;
 * what rolls is inside them): the mean of how much their beat patterns differ (the take-offs' eighths, Jaccard), how far apart their
 * landing heights are (60 px apart counts as wholly different) and how much the pieces they land on differ (surface and length). layoutMemory
 * keeps a fresh roll at least AWAY.min (0.35) from the last one played (the lead, 2026-11-04).
 */
export function rhythmRollDistance(id: '1-2' | '1-5', a: number, b: number): number {
  const A = rollLayout(id, a), B = rollLayout(id, b);
  let beat = 0, height = 0, piece = 0, n = 0;
  for (let i = 0; i < Math.min(A.nodes.length, B.nodes.length); i++) {
    const na = A.nodes[i], nb = B.nodes[i];
    if (!na.bars.length && !nb.bars.length) continue;
    n++;
    // (the beat: the take-offs' eighths, as sets; the share of either's take-offs the other doesn't have (Jaccard): two rolls tapped the
    // same are 0, no take-off in common is 1)
    const ma = new Set(marks(na.bars)), mb = new Set(marks(nb.bars));
    const union = new Set([...ma, ...mb]).size;
    let both = 0;
    for (const k of ma) if (mb.has(k)) both++;
    beat += union ? 1 - both / union : 0;
    const la = A.ledges.filter((q) => q.node === i && q.step >= 0), lb = B.ledges.filter((q) => q.node === i && q.step >= 0);
    const m = Math.max(la.length, lb.length);
    let dh = 0, dp = 0;
    for (let k = 0; k < m; k++) {
      const qa = la[k], qb = lb[k];
      if (!qa || !qb) {
        dh += 1;
        dp += 1;
        continue;
      }
      dh += Math.min(1, Math.abs(qa.y - na.y - (qb.y - nb.y)) / 60);
      // (a piece: what he lands on and how long it is to run on: short, middling, long)
      const size = (q: LLedge) => (q.x1 - q.x0 < 160 ? 0 : q.x1 - q.x0 < 300 ? 1 : 2);
      dp += (qa.surface === qb.surface ? 0 : 0.5) + (size(qa) === size(qb) ? 0 : 0.5);
    }
    height += m ? dh / m : 0;
    piece += m ? dp / m : 0;
  }
  rollParts = { beat: beat / Math.max(1, n), height: height / Math.max(1, n), piece: piece / Math.max(1, n) };
  return n ? +((beat + height + piece) / (3 * n)).toFixed(3) : 1;
}
/** the last distance's three parts (for the tests and the notes) */
export let rollParts = { beat: 0, height: 0, piece: 0 };
