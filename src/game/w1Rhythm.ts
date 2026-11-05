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
  /** a catch that ends against a stone face under the far ledge's near end: [x, top] (1-5's teach catches: holding the way on, he is
   * stopped by the face and a hop goes up, never walked off the catch's end into the drop; the dips test, plainWalk.test.ts) */
  wall?: [number, number];
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
  /** the stage's tiers, its ground lines (1-2: canopy, bough, floor; 1-5: the trail's steps down) */
  tiers: number[];
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
  /** (1-5's descent, the lead's ruling 2026-11-05) the surfaces drawn from short patterns of snap twigs (T) and solid pads (B), never
   *  the pattern just used, never two solid pads running: in place of `alternate`'s strict twig/pad turn, the same phrase every bar */
  deck?: string[];
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
    let pat: string[] = [], lastPat = -1;
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
      if (pal.deck) {
        if (!pat.length) {
          const ks = [...pal.deck.keys()].filter((k) => k !== lastPat);
          lastPat = R.pick(ks);
          pat = [...pal.deck[lastPat]];
        }
        const a = steps[steps.length - 1]?.surface;
        surface = pat.shift() === 'T' || a === 'branch' ? 'crumble' : 'branch';
        // (the landing right after a rest (a gap of 9 eighths or more) is a solid pad: "a long wait, onto a short twig, quickly off it"
        // was the one bar the validator found four times over, the repeat; 2026-11-05)
        if (i > 0 && ms[i] - ms[i - 1] >= 9) surface = 'branch';
      } else if (pal.alternate) {
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
      const tr = traceNode({ ...spec, steps, noOverhang: true, faceMargin: FACE_MARGIN });
      const es = easyNode({ ...spec, steps, noOverhang: true, faceMargin: FACE_MARGIN });
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
/** px more inside the reach for a gap down onto a bank or stump (beatTrace.ts NodeSpec.faceMargin) */
export const FACE_MARGIN = 30;
export const SNAP_SPARE = 0.35;
export const SNAP_EASY = 0.75;

/** a stage in the making: the cursor and what is laid so far */
class Lay {
  L: Layout;
  node = -1;
  constructor(stage: Layout['stage'], bpm: number, readonly R: Rng, readonly easy: boolean) {
    this.L = { stage, bpm, ledges: [], vines: [], nodes: [], flags: [], petals: [], snakes: [], boas: [], rocks: [], marks: [], find: null, lines: [], spawn: { x: 0, y: 0 }, exit: { x: 0, y: 0 }, width: 0, height: 0, heartFalls: [], fallZones: [], tiers: [], expert: 0, walls: [] };
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
function arcPetals(out: Layout['petals'], fx: number, tx: number, fy: number, _ty: number, _move: Move) {
  // (just before the take-off: everyone runs to the edge to jump, where a petal just past the beat's landing was missed by anyone who
  // landed further on, the fixed adult bot 2026-11-04)
  out.push({ x: Math.round(fx - Math.sign(tx - fx) * 30), y: Math.round(fy - 45) });
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
  const high = L.petals.filter((pt) => { const sp = inside(pt); return sp && pt.y < sp.line - ROAD_CUT; });
  // (and, where the high road has fewer landings than its share, spots along its branches: Easy's beat lands on fewer of them)
  for (const sp of splits) {
    for (const q of L.ledges) {
      if ((q.surface !== 'branch' && q.surface !== 'crumble') || q.y > sp.line + 20 || q.x1 < sp.x0 || q.x0 > sp.x1) continue;
      for (let x = q.x0 + 40; x <= q.x1 - 40; x += 70) if (!high.some((h) => Math.abs(h.x - x) < 50 && Math.abs(h.y - (q.y - 45)) < 30)) high.push({ x, y: q.y - 45 });
    }
  }
  high.sort((a, b) => a.x - b.x);
  // (every candidate kept: the stage's own pass, rhythmOwnPetals, takes the roads in turn up to their share under the petal rules)
  const n = high.length;
  const pick = <T,>(xs: T[], k: number) => (k <= 0 ? [] : Array.from({ length: k }, (_, i) => xs[Math.floor(((i + 0.5) * xs.length) / k)]));
  const highKeep = pick(high, n).map((pt) => ({ ...pt, road: 'high' as const }));
  const spots: number[][] = [];
  for (const sp of splits) {
    for (const q of L.ledges) {
      if (q.surface !== 'bough' || Math.abs(q.y - sp.line) > TOP_DROP + 2 || q.x1 < sp.x0 || q.x0 > sp.x1) continue;
      // (35 px in from a piece's ends: the base bough's pieces are its hops' take-offs and landings, a petal at each, 2026-11-04)
      for (let x = Math.max(q.x0, sp.x0) + 35; x <= Math.min(q.x1, sp.x1) - 35; x += 40) {
        if (L.ledges.some((c) => c.surface === 'crumble' && c.y === q.y && x > c.x0 - 120 && x < c.x1 + 120)) continue;
        if (L.snakes.some((sn) => Math.abs(sn.y - q.y) < 20 && Math.abs(sn.x - x) < 140)) continue;
        if (L.flags.some((f) => Math.abs(f.y - q.y) < 20 && Math.abs(f.x - x) < 100)) continue;
        // (never under the high road's jumps, the gaps between its branches: a petal below a required jump's arc breaks the petal rules,
        // petals.ts offArc; under a branch 75 px up or more is room)
        const hi = L.ledges.filter((h) => h.y <= sp.line + 20 && (h.surface === 'branch' || h.surface === 'crumble') && h.x1 > sp.x0 && h.x0 < sp.x1).sort((a, b) => a.x0 - b.x0);
        const under = hi.find((h) => x > h.x0 - 10 && x < h.x1 + 10);
        if (under ? q.y - under.y < 110 : hi.some((h, k) => k > 0 && x > hi[k - 1].x1 - 40 && x < h.x0 + 40)) continue;
        spots.push([x, q.y]);
      }
    }
  }
  spots.sort((a, b) => a[0] - b[0]);
  const low = spots.map(([x, y]) => ({ x, y: y - 45, road: 'low' as const }));
  L.petals = apart([...apart(shared), ...highKeep, ...low]);
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
    // (a short flick at a run carries 120-150 px: the clumsy thumb grabbed a liana 183 px out 60% of the time, 1-2's chasm, 2026-11-04)
    const d0 = R.r(140, 165);
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
/** how far the swung beat leans (the long note, the short, in eighths) */
const LEANS = [[6, 2], [4, 2], [10, 2], [6, 2], [4, 2]] as const;
/** the floor's lean: no long note over 5 eighths (a step down is no move, so a 6-eighth note and a drop read as a 2.6 s dead walk on the
 *  fun gate, 2026-11-04) */
const LEANS_FLOOR = [[4, 2], [4, 2], [3, 2], [5, 2]] as const;
/** the swung beat: a dotted half and a quarter (a long jump, a quick hop), now and then a whole bar's breath */
const swung = (R: Rng, n: number, breath = 0.3, lean: ReadonlyArray<readonly [number, number]> = LEANS) => {
  // (each node of each roll swings its own way: 3:1 (a dotted half and a quarter), 2:1 (the shuffle), 5:1, all long-short: the feel is
  // the stage's, how far it leans rolls)
  const [long, short] = R.pick(lean);
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


/** a rotten stretch of 1-2's bough: how long it holds once he is on it (s; Easy's falls are free, a little longer still), and how deep
 *  under his last ground a fall through it is a fall */
export const ROT_HOLD = { normal: 0.25, easy: 0.45 } as const;
/** how far 1-2's canopy base bough lies under its split node's entry (px) */
export const TOP_DROP = 60;
/** a petal this far over the split node's entry line, or more, is on the high road (the branches); under it, the base bough's low road */
export const ROAD_CUT = 10;
export const ROT_DEPTH = 170;
/** 1-2's rest over the loop, Dot's stop (px): 2.1 s at a run */
const REST_W = 600;
/** the gaps to hop in 1-2's canopy base bough (px) */
const BOUGH_GAP = 70;

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
    // (the take-off pad runs on from the node before's exit apron, so it is short; the landing pad is the next node's entrance apron too:
    // a 200 px apron, a 240 px pad and a 260 px landing with another apron after read as 2.6-2.8 s dead walks, the fun gate 2026-11-04)
    const PAD = lay.lastExit && Math.abs(lay.lastExit.x - x0) < 1 ? 100 : 240;
    lay.begin(tag, 'jump + vine swing', tier, 1, x0, yy);
    lay.ledge(x0, x0 + PAD, yy, 'apron');
    L.flags.push({ x: x0 + Math.min(100, PAD / 2), y: yy });
    try {
      const far = vineChain(lay, x0 + PAD, yy, 1, easy, 260, yy, tops);
      lay.ledge(far, far + 260, yy, yy >= FLOOR_Y ? 'bank' : 'branch');
      L.heartFalls.push({ x0: x0 + PAD, x1: far });
      lay.end(far + 260, (far + 260 - x0) / 330 + 1.2);
      lay.lastExit = { x: far + 260, y: yy };
      return far + 260;
    } catch {
      lay.end(x0 + PAD, PAD / PHYS.maxRun);
      return x0 + PAD;
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
  // (a hop in the apron, 70 px across at the same height: the ramp's last ledge and this apron were a 3.3-3.8 s walk with nothing to do,
  // fun gate dead walk; a gap the route takes as a hop, where decorative rocks were not registered)
  lay.ledge(x, x + 150, y, 'apron');
  lay.ledge(x + 220, x + 320, y, 'apron');
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
  // (the rest: REST_W at a run is under the 2.5 s no-input rule (the lead, 2026-11-04: no rest is exempt), a step up halfway; Dot's line
  // near its start, where a player who stops to look down reads it)
  lay.ledge(x, x + REST_W / 2, y, 'apron');
  lay.ledge(x + REST_W / 2, x + REST_W, y - 30, 'apron');
  L.flags.push({ x: x + 100, y });
  L.lines.push({ x: x + 160, y, text: "There's something down by the roots..." });
  x += REST_W;
  y -= 30;
  lay.end(x, REST_W / PHYS.maxRun + 1);
  // (the bough's leg is fitted first: the canopy's high branches over the loop must reach further back than it does)
  const PAL_B: Palette = { surfaces: ['branch'], jumpDy: [-60, -50, 50, 60, 80, 90], hopDy: [-40, -30, -20], doubles: 0, yMin: B - 120, yMax: B };
  const barsB = barsFrom(swung(R, 12, 0.2));
  const fitB = fitSteps({ bpm, bars: barsB, x: 0, y: B }, PAL_B, R);
  const wB = (easy ? fitB.easy : fitB.tr).x1;
  let gapsTop = 10;
  const eighthPx = (30 / bpm) * PHYS.maxRun;
  while (gapsTop < 40 && (gapsTop * 4 + 8) * eighthPx + 400 < wB + 620 - REST_W + 300 + 200) gapsTop += 2;
  // (rotten wood taught here, where it is safe: a rotten branch high over the canopy's solid base bough holds his run on the beat and a
  // little more, and a hesitant player drops 50-120 px onto the base bough, nothing lost (STAGE-RULES: taught in a safe spot before it
  // can hurt). The bough leg's rotten stretches come next, and bite)
  const topNode = L.nodes.length;
  const top = lay.traced('ramp', 'jump up + down over a bough (rotten branches, taught)', 'A', 1, x, y, barsFrom(swung(R, gapsTop, 0)), { surfaces: ['branch'], jumpDy: [-50, -40, 40, 50, 80, 90], hopDy: [-40, -30, -20], doubles: 0, yMin: y - 120, yMax: y }, { flagsLow: true });
  // (every other branch 50 px or more over the base bough is rotten; each holds his run across it at full speed, the most the beat
  // keeps him on it, and SNAP_SPARE more (Easy: SNAP_EASY))
  let rot = true;
  for (const q of L.ledges) {
    if (q.node !== topNode || q.surface !== 'branch' || q.y > y + TOP_DROP - 50) continue;
    if (rot) { q.surface = 'crumble'; q.hold = +((q.x1 - q.x0) / PHYS.maxRun + (easy ? SNAP_EASY : SNAP_SPARE)).toFixed(2); }
    rot = !rot;
  }
  const rotten1 = L.ledges.find((q) => q.node === topNode && q.surface === 'crumble');
  if (!rotten1) throw new Error('1-2: no rotten branch to teach on over the base bough');
  L.lines.push({ x: rotten1.x0 - 260, y, text: 'Rotten wood! Don\'t stop on it!' });
  // (the base bough TOP_DROP under the node's entry: every branch 50 px or more over the entry is 110 px or more over the base bough, so
  // the low road's petals have room under the branches and clear of their jumps' arcs, the lead's ruling 2026-11-04)
  // (the base bough in pieces, a 70 px gap to hop every 300-360 px (1.1-1.3 s at a run): the low road is hops, never 17 s of plain walking (the fun gate's dead
  // walk, the lead's item 4, 2026-11-04). A miss through a gap is a fall (fallZones), never a landing on the bough leg under it. No gap
  // under a branch's end, where a drop from the high road comes down)
  const ends = L.ledges.filter((q) => q.node === topNode && q.y < y + TOP_DROP - 20).flatMap((q) => [q.x0, q.x1]);
  const gaps: number[] = [];
  for (let gx = x + R.r(300, 360); gx < top.tr.x1 - 400; gx += R.r(300, 360)) {
    // (the nearest place clear of the branch ends, either way, up to 280 px off)
    const clear = (g: number) => !ends.some((e) => g < e + 110 && g + BOUGH_GAP > e - 110) && g > (gaps.at(-1) ?? x) + 240 && g < top.tr.x1 - 400;
    const g = [0, 40, -40, 80, -80, 120, -120, 160, -160, 200, -200, 240, -240, 280, -280].map((d) => Math.round(gx) + d).find(clear);
    if (g !== undefined) { gaps.push(g); gx = g; }
  }
  let bx = x;
  for (const g of gaps) {
    lay.ledge(bx, g, y + TOP_DROP, 'bough');
    L.fallZones.push({ x0: g - 30, x1: g + BOUGH_GAP + 30, depth: ROT_DEPTH });
    bx = g + BOUGH_GAP;
  }
  lay.ledge(bx, top.tr.x1, y + TOP_DROP, 'bough');
  // (the split's flags on its base bough, the way everyone takes, every 2,200 px, clear of its gaps: none up on the high road, G8)
  for (let fx = x + 2200; fx < top.tr.x1 - 600; fx += 2200) {
    let f = Math.round(fx);
    while (gaps.some((g) => f > g - 160 && f < g + BOUGH_GAP + 160)) f += 60;
    L.flags.push({ x: f, y: y + TOP_DROP });
  }
  const Rx = top.tr.x1;
  // turn 1: off the end, down onto the bough (B), whose right end is a trunk
  const bRight = Rx + 300;
  lay.ledge(Rx - 180, bRight, B, 'apron');
  // (the trunk stands well over the canopy's highest branch: under that, the canopy's end was a jump over it, past the whole bough leg
  // and half the floor)
  const canopyTop = Math.min(...L.ledges.filter((q) => q.x1 > Rx - 900).map((q) => q.y));
  L.walls.push({ x0: bRight, x1: bRight + 90, y0: Math.min(B - 360, canopyTop - 300), y1: B + 40 });
  L.lines.push({ x: Rx - 160, y: B, text: 'Back the other way, up off the snakes!' });
  // ---- B: the bough, leftwards, ONE way (the lead's ruling 2026-11-04: no high road, so its petals are the shared path's): the bough
  // itself, with the rotten stretches and the snakes to hop on the swung beat. A rotten stretch is too long to walk before it goes
  // (ROT_HOLD), so it is a hop; a snake is a hop or a punch, never within 150 px of a landing (research 11-04)
  lay.begin('counter', 'hop the rot + hop the snakes (the bough, leftward)', 'B', -1, bRight, B, barsB);
  const Lx = Math.round(bRight - wB);
  if (Lx < restX + 620) throw new Error(`1-2: the bough runs out from under the canopy's safe stretch (${Lx} < ${restX + 620})`);
  L.flags.push({ x: bRight - 260, y: B });
  const hz: Array<{ x0: number; x1: number; rot: boolean }> = [];
  const beat = swung(R, 40, 0.2);
  let hx = Rx - 260;
  for (let k = 0; hx > Lx + 420; k++) {
    const rot = k === 0 || !R.chance(0.34);
    const w = rot ? Math.round(R.r(120, 160)) : 76;
    hz.push({ x0: hx - w, x1: hx, rot });
    // (the next hazard on the beat, never nearer than a landing's 150 px clear of a snake)
    // (and never more than 600 px on: 2 s of bough at a run, the dead walk's 2.5 s under it)
    hx -= w + Math.min(600, Math.max(rot ? 300 : 380, Math.round((beat[k % beat.length] ?? 6) * eighthPx)));
  }
  // (the bough in pieces, rotten stretches between them; a snake in the middle of its stretch; a petal before each hop's take-off)
  let at = bRight;
  for (const h of hz) {
    if (h.rot) {
      lay.ledge(h.x1, at, B, 'bough');
      lay.ledge(h.x0, h.x1, B, 'crumble');
      L.ledges[L.ledges.length - 1].hold = easy ? ROT_HOLD.easy : ROT_HOLD.normal;
      L.fallZones.push({ x0: h.x0 - 60, x1: h.x1 + 60, depth: ROT_DEPTH });
      at = h.x0;
    } else L.snakes.push({ x: Math.round((h.x0 + h.x1) / 2), y: B });
    L.petals.push({ x: h.x1 + 40, y: B - 45 });
  }
  lay.ledge(Lx, at, B, 'bough');
  // (the bough leg's flags, right to left in the way's order: flagsInOrder)
  for (let fx = bRight - 2200; fx > Lx + 600; fx -= 2200) {
    const ok = !hz.some((h) => fx > h.x0 - 200 && fx < h.x1 + 200);
    L.flags.push({ x: Math.round(ok ? fx : fx + 260), y: B });
  }
  lay.end(Lx, (bRight - Lx) / PHYS.maxRun + hz.length * 0.3);
  // ---- C: the floor, rightwards from under the bough's left end (a landing pad under the drop, a trunk at its left)
  const padL = Lx - 480;
  lay.ledge(padL, Lx + 60, C, 'apron');
  // (the trunk overlaps the pad's end: no slit between them, w1Pits.ts would paint one)
  L.walls.push({ x0: padL - 90, x1: padL + 30, y0: C - 360, y1: C + 90 });
  L.lines.push({ x: padL + 20, y: C, text: 'Under the bough now. Watch the gaps!' });
  const PAL_C: Palette = { surfaces: R.pick([['bank', 'bank', 'stump'], ['bank', 'stump', 'stump'], ['bank', 'stump', 'branch']] as Surface[][]), jumpDy: [-60, -30, 0, 30, 50], hopDy: [-40, -30, -20], doubles: 0, yMin: C - 100, yMax: C };
  x = Lx + 60;
  const under1 = lay.traced('ramp', 'jump + hop (pits now)', 'C', 1, x, C, barsFrom(swung(R, 7, 0.15, LEANS_FLOOR)), PAL_C);
  // (a liana hung from under the bough, over the floor's pit)
  x = midSwing('ramp', 'C', under1.tr.x1, under1.tr.yOut, [B + 50, B + 70]);
  const under = lay.traced('ramp', 'jump + hop (pits now)', 'C', 1, x, under1.tr.yOut, barsFrom(swung(R, 8, 0.15, LEANS_FLOOR)), { ...PAL_C, yMin: Math.min(under1.tr.yOut, C) - 100, yMax: Math.max(under1.tr.yOut, C) });
  // (under the loop the flags don't take: engine.ts keeps the furthest-right flag, so a fall here costs a heart, never a life)
  L.heartFalls.push({ x0: padL, x1: Math.max(under.tr.x1, bRight + 100) });
  // the note: on the floor right under the rest, where the view from the rest looks down on it (upright)
  L.find = { x: Math.round(Math.max(padL + 120, restX + 420)), y: C };
  x = under.tr.x1;
  y = under.tr.yOut;
  const c1bars = barsFrom(swung(R, 9, 0.1, LEANS_FLOOR));
  const climax1 = lay.traced('climax', 'jump + hop + drop (swung, densest)', 'C', 1, x, y, c1bars, { ...PAL_C, yMin: Math.min(y, C) - 100, yMax: Math.max(y, C), surfaces: ['bank', 'stump', 'branch'] });
  x = midSwing('climax', 'C', climax1.tr.x1, climax1.tr.yOut);
  y = climax1.tr.yOut;
  // (the second half never plays the first half's bars again: the same template with the same numbers is nothing you feel change,
  // STAGE-RULES §0c.3, tools/validate/variety.ts templateFlags; it leans denser, fewer breaths)
  const bars1 = c1bars.join('|');
  let bars2 = barsFrom(swung(R, 9, 0.05, LEANS_FLOOR));
  for (let k = 0; k < 12 && bars2.join('|') === bars1; k++) bars2 = barsFrom(swung(R, 9 + (k % 2), 0.05, LEANS_FLOOR));
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
  L.tiers = [T12.A, T12.B, T12.C];
  // (the two splits: the high branches over the canopy's base bough, and the bough leg's branches over the bough)
  const topN = L.nodes[topNode], bN = L.nodes.find((nd) => nd.tier === 'B')!;
  splitPetals(L, [{ x0: topN.x0, x1: topN.x1, line: topN.y }]);
  // (a split whose roads can't hold their share, Easy's branches drifting down onto the base bough, is rolled again: Matt's 70/30)
  const roadN = (r: 'high' | 'low') => L.petals.filter((pt) => pt.road === r).length;
  if (roadN('low') < 30 || roadN('high') < 20) throw new Error(`1-2: the split's roads can't hold their petals (high ${roadN('high')}, low ${roadN('low')})`);
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
/** 1-5's snap twigs: seconds more than the beat's run and the spare, for a first-timer's pause on landing */
export const FT_PAUSE_15 = 0.3;

export function layout15(seed: number, easy: boolean, bpm: number): Layout {
  const R = rng(seed, '1-5');
  const lay = new Lay('1-5', bpm, R, easy);
  const L = lay.L;
  // the trail's tiers, canopy to floor: each middle node comes down one (a staircase you see from the rests)
  const T = { canopy: 330, two: 460, three: 590, four: 720, five: 820, floor: 930 } as const;
  L.tiers = Object.values(T);
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
    deck: snap > 0 && snap < 1 ? ['TBT', 'TTB', 'BTT', 'TBTT', 'BTBTT', 'TTBTB'] : undefined,
    jumpDy: [-60, -50, -40, -30, -20, 0, 20], hopDy: [-30, -20], doubles: 0, yMin: Math.min(y, end) - 40, yMax: Math.max(y, end) + 30, end,
  });
  // (uneven gaps, a rest pad (9 eighths, about 1.3 s on a ledge) every seven or eight take-offs)
  const brokenFixed = (n: number, set: readonly number[]) => Array.from({ length: n }, (_, i) => (i % 8 === 7 ? 9 : R.pick(set)));
  // (the descent's beat, broken by construction, the lead's ruling 2026-11-05: one SET and a rest every 8 take-offs made the same
  // "J B J J" bar every bar, the validator's repeat on 4 of 16 layouts. Now a deck of broken motifs, a fresh order each node, never the
  // motif just used and none over twice in a node; a rest (9 eighths) 6-9 take-offs after the last, rolled each time; `cap`: no gap
  // over it, for the spike and the climax)
  // (Normal's motifs have no 3-eighth gap: it left a pad of about 110 px, and the first-timer adult, who pauses on landing, ran off its
  // end or stood on its twig as it broke, 2-4 lives at one spot, 2026-11-05; Easy's beat is slower and keeps its quick ones)
  const MOTIFS = easy ? [[3, 5, 4, 6], [4, 3, 6, 5], [5, 3, 3, 6], [6, 4, 3, 4], [3, 6, 5, 3], [4, 5, 3, 5]]
    : [[4, 5, 6, 4], [5, 4, 7, 5], [6, 4, 5, 7], [4, 6, 4, 5], [7, 5, 4, 6], [5, 7, 4, 4]];
  const broken = (n: number, cap = 9) => {
    const deck: number[] = [...MOTIFS.keys()].map((k) => [R.f(), k]).sort((a, b) => a[0] - b[0]).map((a) => a[1]);
    const used = new Map<number, number>();
    const out: number[] = [];
    let last = -1, rest = 6 + Math.floor(R.f() * 4), since = 0;
    while (out.length < n) {
      const k = deck.find((d) => d !== last && (used.get(d) ?? 0) < 2) ?? deck.find((d) => d !== last)!;
      deck.push(...deck.splice(deck.indexOf(k), 1));
      used.set(k, (used.get(k) ?? 0) + 1);
      last = k;
      for (const g of MOTIFS[k]) {
        if (out.length >= n) break;
        if (++since > rest) { out.push(9); since = 0; rest = 6 + Math.floor(R.f() * 4); if (out.length >= n) break; }
        out.push(Math.min(g, cap));
      }
    }
    return out;
  };
  // (each roll breaks the beat its own way, and leans on the snap twigs more or less)
  const SET = R.pick([[3, 4, 4, 5, 6], [3, 3, 5, 6, 6], [4, 4, 3, 5, 3, 6], [3, 5, 4, 6, 3]]);
  const SNAP = R.pick([0.5, 0.7, 0.85]);
  /**
   * coiled boas on the way down after the kick is taught (node `ni`, trace `tr`): on its widest ledges, never its first or last, `max` at
   * most, `apart` px apart. Each 265 px past where the jump onto its ledge lands (the validator's landing sits a little past the trace's;
   * research 11-04: never within 150 px of a landing), 150 px or more short of the next ledge, and clear of every safe spot (the level
   * check's SAFE_APPROACH: the flags so far and the next node's at this one's end). A twig with a boa holds the kick's time too.
   */
  const boasOn = (ni: number, tr: Trace, max: number, apart: number) => {
    const mine = L.ledges.filter((q) => q.node === ni && q.surface !== 'catch' && q.surface !== 'apron').sort((a, b) => a.x0 - b.x0);
    const land = (q: LLedge) => tr.landings.find((l) => l.toX >= q.x0 - 2 && l.toX <= q.x1 + 2)?.toX ?? q.x0 + 40;
    const safeNow = [L.spawn, ...L.flags, { x: tr.x1 + 100, y: tr.yOut }];
    let n = 0;
    for (const q of [...mine.slice(1, -1)].sort((a, b) => (b.x1 - b.x0) - (a.x1 - a.x0))) {
      if (n >= max) break;
      const bx = land(q) + BOA_CLEAR + 90;
      if (L.boas.some((b) => Math.abs(b.x - bx) < apart)) continue;
      if (safeNow.some((f) => Math.abs(f.y - q.y) < 400 && Math.abs(f.x - bx) < SAFE_APPROACH + SNAKE_RANGE + 40)) continue;
      const next = mine[mine.indexOf(q) + 1];
      if (next && next.x0 - bx < 150) continue;
      if (bx + 30 > q.x1) {
        if (!next || next.x0 - (bx + 30) < 45) continue;
        q.x1 = bx + 30;
      }
      L.boas.push({ x: bx, y: q.y, facing: -1 });
      if (q.surface === 'crumble') q.hold = +((q.hold ?? 0.6) + (easy ? BOA_KICK_S.easy : BOA_KICK_S.normal)).toFixed(2);
      n++;
    }
  };
  // ---- intro: the canopy, sparse jumps, the first carving on the path
  const intro = lay.traced('intro', 'run + jump', 'canopy', 1, x, y, barsFrom(Array.from({ length: 8 }, () => R.pick([7, 8, 9]))), { ...down(T.canopy, 0), jumpDy: [-30, -20, 0, 20, 30] });
  // (each mark at its ledge's far end, just before the take-off: the inspector counts a mark as a 1.5 s look, stageTime.ts relicSec, and
  // a mark at a ledge's start left a dead walk after it)
  mark(intro.tr.ledges[1].x1 - 40, intro.tr.ledges[1].y);
  L.lines.push({ x: 260, y, text: "Meeca's mark! Follow her trail" });
  x = intro.tr.x1;
  y = intro.tr.yOut;
  // ---- the snap twig, taught: twigs over catch branches (a miss is a hop back up)
  const teach = lay.traced('ramp', 'snap twig + jump (taught)', 'canopy', 1, x, y, barsFrom(brokenFixed(9, [4, 6, 8])), { ...down(y, 0), surfaces: ['crumble', 'branch'], alternate: true, jumpDy: [-20, 0, 20], end: undefined });
  // (taught safe: a catch branch under the far part of each gap, one hop below the far ledge: a jump that falls short lands on it, a walk
  // off the edge falls past it (about 70 px on at a run), so the jump is still the way)
  for (const g of teach.tr.gaps) {
    const far = teach.tr.ledges.find((q) => q.x0 >= g.x1 - 1);
    const cy = (far?.y ?? y) + 80;
    // (ending against a stone face under the far ledge's near end, as the opening's catches do: 60 px under the far ledge with no face,
    // a player holding the way on walked under it and off the catch's end into the drop; dips test 2026-11-05)
    const x1 = far ? far.x0 + 50 : g.x1 + 60;
    // (every gap of the teach has its catch: a narrow one's, started at x0 + 80, was under 60 px and was left out, and the first-timer
    // adult lost three lives in it, 2026-11-05; its open top runs at least 50-60 px to the face, never under the near ledge)
    const open = far ? far.x0 : x1;
    const c0 = Math.max(g.x0 + 2, Math.min(g.x0 + 80, open - 60));
    if (open - c0 >= 50) {
      lay.ledge(c0, x1, cy, 'catch');
      if (far) L.ledges[L.ledges.length - 1].wall = [far.x0, far.y];
    }
  }
  L.lines.push({ x: x + 120, y, text: 'These ones snap! Keep moving' });
  x = teach.tr.x1;
  y = teach.tr.yOut;
  // ---- the kick, taught early (the lead's ruling, 2026-11-04: 1-5's new thing; at the top since 2026-11-05, so the boas meet him all the
  // way down and Easy keeps it): a coiled boa, the first in the game, on a wide stone ledge,
  // Dot's line before it. Punches bounce off it ("TOUGH!"), a stomp bounces; a kick (a quick flick toward it) rolls it away along the
  // ledge and off its end. A flag at the ledge's start
  lay.begin('ramp', 'kick a coiled boa (taught)', 'canopy', 1, x, y);
  lay.ledge(x, x + BOA_TEACH_W, y, 'apron');
  // (Meeca's marks lead him to it, three on the way in: the walk from the last twig to the boa read as dead, 2.8-3.6 s)
  mark(x - 300, y);
  mark(x + 200, y);
  mark(x + 470, y);
  L.flags.push({ x: x + 100, y });
  // (Dot's line 260 px before the teach ledge: she holds a line while an animal is within 300 px (engine.ts guide env danger), and from
  // x + 140 the boa already was, so the line waited until he was past it, on the lianas)
  L.lines.push({ x: x - 260, y, text: BOA_LINE });
  // (asleep: it wakes only when he walks right into it, and then takes a moment before it can strike, predatorAI.ts: the safe teach)
  // (three quarters along: room still to roll it off the end, and no long walk on after the kick)
  L.boas.push({ x: x + Math.round(BOA_TEACH_W * 0.75), y, facing: -1, asleep: true });
  x += BOA_TEACH_W;
  lay.end(x, BOA_TEACH_W / PHYS.maxRun + 2);
  // ---- ramp: down a tier, snaps and plain branches, the broken beat; then down another, the falls real now
  const ramp = lay.traced('ramp', 'snap twig + jump (broken)', 'two', 1, x, y, barsFrom(broken(21)), down(T.two, SNAP - 0.1));
  mark(ramp.tr.ledges[4].x1 - 40, ramp.tr.ledges[4].y);
  // (a kick on the way down: the move 1-5 teaches, met again before the climax)
  boasOn(L.nodes.length - 1, ramp.tr, 2, 900);
  x = ramp.tr.x1;
  y = ramp.tr.yOut;
  const ramp2 = lay.traced('ramp', 'snap twig + jump, over the drop (broken)', 'three', 1, x, y, barsFrom(broken(21)), down(T.three, SNAP));
  mark(ramp2.tr.ledges[5].x1 - 40, ramp2.tr.ledges[5].y);
  // (a kick on the way down: the move 1-5 teaches, met again before the climax)
  boasOn(L.nodes.length - 1, ramp2.tr, 2, 900);
  x = ramp2.tr.x1;
  y = ramp2.tr.yOut;
  // ---- spike: down another tier, all snaps, the quickest gaps
  const spike = lay.traced('spike', 'snap twig + drop', 'four', 1, x, y, barsFrom(broken(22, 5)), down(T.four, 0.9));
  mark(spike.tr.ledges[5].x1 - 40, spike.tr.ledges[5].y);
  // (a kick on the way down: the move 1-5 teaches, met again before the climax)
  boasOn(L.nodes.length - 1, spike.tr, 1, 900);
  x = spike.tr.x1;
  y = spike.tr.yOut;
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
  // ---- rest (after the vines, the breath before the climax: before them, the vines' first swings came after nothing to do): 4-5 s, the keepsake on a high branch across the drop (seen from here), reached up two branches
  // (900 px with two root knots, the bough broken round each or the level check walks through it: with the kick taught at the top the
  // rest runs straight on to the vines, and its old 1,180 px of plain walk were 7 s with nothing to do)
  lay.begin('rest', 'none (Dot; the keepsake seen across the drop)', 'five', 1, x, y);
  lay.ledge(x, x + 290, y, 'apron');
  lay.ledge(x + 290, x + 380, y - 28, 'branch');
  lay.ledge(x + 380, x + 560, y, 'apron');
  lay.ledge(x + 560, x + 650, y - 28, 'branch');
  lay.ledge(x + 650, x + 900, y, 'apron');
  L.flags.push({ x: x + 100, y });
  lay.ledge(x + 680, x + 790, y - 90, 'branch');
  lay.ledge(x + 790, x + 900, y - 160, 'branch');
  L.find = { x: x + 850, y: y - 160 };
  L.lines.push({ x: x + 160, y, text: 'She came this way. Look up there!' });
  x += 900;
  lay.end(x, 900 / PHYS.maxRun + 1);
  // ---- climax: the carving chase, down two tiers to the floor, a carving every second ledge
  const climax = lay.traced('climax', 'snap twig + drop + hop (the chase)', 'floor', 1, x, y, barsFrom(broken(26, 5)), down(T.floor, SNAP));
  // (the carving chase: closer and closer together toward the shrine)
  // (at each ledge's far end, just before the take-off, as on the way down: mid-ledge, the look left a walk after it)
  climax.tr.ledges.forEach((q, i) => { const n = climax.tr.ledges.length; if (i > 0 && i < n - 1 && i % (i < n / 2 ? 3 : 2) === 0) mark(q.x1 - 40, q.y); });
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
  // (Meeca's last marks, on the way to the shrine: the run from the chase's last move to the shrine read as a dead walk, 3.9-4 s)
  mark(x - 380, y);
  mark(x + 280, y);
  L.exit = { x: x + 400, y };
  lay.end(x + 640, 640 / PHYS.maxRun);
  // (every snap twig holds 0.3 s more than its run on the beat and the spare: the first-timer adult pauses on landing, and twigs of
  // 0.56-0.83 s broke under him on the way down, 13 lives on one roll; the lead, 2026-11-05: about 4 at most, Normal jumps 70%+)
  for (const q of L.ledges) if (q.surface === 'crumble') q.hold = +((q.hold ?? 0.6) + FT_PAUSE_15).toFixed(2);
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
export const PETAL_SHARE = { normal: 0.75, easy: 0.75 } as const;
const petalGoal = (n: number, k: number) => Math.max(1, Math.round(n * k));
/**
 * The beat-traced stage's own petals (proto.ownPetals, the lead's ruling 2026-11-04: the petal pass adds none), held to the pass's rules
 * here: the shared path's petals first, then the splits' two roads (1-2) in turn, as many on each, up to 15/70 of the shared path, then
 * the bare stretches filled on solid ledges; each petal kept only where it breaks none of the rules (petals.ts: never below a required
 * jump's arc, no rows, no clumps, six a screen; flowerReach.ts: in reach; 40 px from any other pickup; petals.test.ts: two screens)
 */
export function rhythmOwnPetals(st: GeneratedStage & { proto: ProtoExtras }): void {
  const isPet = (c: Collectible) => c.type === 'flower' || c.type === 'leaf';
  const nodes = st.proto.rhythm?.nodes ?? [];
  // (1-2's one split: the canopy's high branches over its base bough; the bough leg is one way, its petals the shared path's)
  const top = nodes.find((n) => n.tier === 'A' && n.pair.includes('rotten branches'));
  const splits = top ? [{ x0: top.x0, x1: top.x1, line: top.y }] : [];
  const roadOf = (c: { x: number; y: number }) => {
    const sp = splits.find((q) => c.x > q.x0 && c.x < q.x1 && c.y >= q.line - 180 && c.y <= q.line + TOP_DROP + 10);
    return !sp ? null : c.y < sp.line - ROAD_CUT ? 'high' : 'low';
  };
  const all = st.collectibles.filter(isPet).sort((a, b) => a.x - b.x);
  st.collectibles = st.collectibles.filter((c) => !isPet(c));
  const kept: Collectible[] = [];
  const accept = (c: Collectible) => {
    if (st.collectibles.some((o) => o.type !== 'exit_totem' && Math.hypot(o.x - c.x, o.y - c.y) < PICKUP_APART + 4)) return false;
    const pets = [...kept, c];
    if (offArc(st, [c]).size) return false;
    if (rowExtras(pets).size) return false;
    if (clumpExtras(pets).size) return false;
    if (busiestScreen(pets).n > PER_SCREEN) return false;
    kept.push(c);
    st.collectibles.push(c);
    return true;
  };
  // (the roads first: over the loop the canopy, the bough leg and the floor under them all share one screen's six, and the shared
  // path's floor petals there would leave the roads none; then the shared path)
  const sharedAll = all.filter((c) => !roadOf(c));
  const want = Math.round((sharedAll.length * 15) / 70);
  const road = { high: all.filter((c) => roadOf(c) === 'high'), low: all.filter((c) => roadOf(c) === 'low') };
  const taken = { high: [] as Collectible[], low: [] as Collectible[] };
  // (the scarcer road first, wherever its spots are: the bough's legal spots are few, under the branches with room, and the high road
  // would fill those screens' six first)
  const roads = (['low', 'high'] as const).slice().sort((a, b) => road[a].length - road[b].length);
  for (const r of roads) for (const c of road[r]) if (taken[r].length < want && accept(c)) taken[r].push(c);
  for (const c of sharedAll) accept(c);
  // (the bare stretches: a petal on a solid ledge every 300 px between two petals more than 1,900 px apart, at his body's height; over
  // a run of lianas, at a liana's foot, where his body passes on the swing)
  let id = Math.max(0, ...st.collectibles.map((c) => c.id), ...all.map((c) => c.id)) + 1;
  const ledges = st.platforms.filter((p) => p.type === 'solid' && p.width >= 120 && p.height < 300);
  for (let pass = 0; pass < 3; pass++) {
    const xs = kept.map((c) => c.x).sort((a, b) => a - b);
    for (let i = 1; i < xs.length; i++) {
      if (xs[i] - xs[i - 1] <= 1900) continue;
      for (let x = xs[i - 1] + 300; x < xs[i] - 200; x += 300) {
        const q = ledges.filter((p) => x > p.x + 30 && x < p.x + p.width - 30).sort((a, b) => a.y - b.y)[0];
        const v = !q ? st.vines.find((vn) => Math.abs(vn.x - x) < 150) : undefined;
        // (at a climb vine's foot; where the foot stands on a ledge, over the ledge's top, never 10 px into it: the mixer's 1-5)
        const foot = v ? st.platforms.find((p) => v.x >= p.x && v.x <= p.x + p.width && Math.abs(p.y - v.bottomY) <= 20) : undefined;
        if (v) accept({ id: id++, type: 'flower', botanicalVariant: 'orchid', x: v.x, y: foot ? foot.y - 45 : v.bottomY + 10, collected: false, bobPhase: (v.x * 0.031) % 6.28 });
        else if (q) accept({ id: id++, type: 'flower', botanicalVariant: 'orchid', x, y: q.y - 45, collected: false, bobPhase: (x * 0.031) % 6.28 });
      }
    }
  }
  // (none the level check cannot reach)
  const bad = new Set(badPickups({ platforms: st.platforms, vines: st.vines, waterY: st.waterY }, st.collectibles).filter(isPet));
  st.collectibles = st.collectibles.filter((c) => !bad.has(c));
  // (and the roads equal: the longer gives up its extras, evenly)
  const on = (r: 'high' | 'low') => st.collectibles.filter((c) => isPet(c) && roadOf(c) === r).sort((a, b) => a.x - b.x);
  // (a road's count: as many as the shorter road holds, and no more than 15/70 of the shared path kept)
  const m = Math.min(on('high').length, on('low').length, Math.round((st.collectibles.filter((c) => isPet(c) && !roadOf(c)).length * 15) / 70));
  const thin = (list: Collectible[], keep: number) => {
    const extra = list.length - keep;
    const drop = new Set(Array.from({ length: Math.max(0, extra) }, (_, i) => list[Math.floor(((i + 0.5) * list.length) / extra)]));
    st.collectibles = st.collectibles.filter((c) => !drop.has(c));
  };
  for (const r of ['high', 'low'] as const) thin(on(r), m);
  // (the shares by the shared path's density: over the loop the canopy's two roads and the bough leg's share screens, so six a screen
  // holds a road to about a dozen; the shared path then keeps 70/15 of a road's count, thinned evenly. Never under 6 a road: at 4 a road
  // this took 1-2 to 27 petals and sealed the door, 2026-11-04)
  if (splits.length && m >= 6) {
    const sh = st.collectibles.filter((c) => isPet(c) && !roadOf(c)).sort((a, b) => a.x - b.x);
    thin(sh, Math.min(sh.length, Math.round((m * 70) / 15)));
  }
}

/** 1-2's goal on the stage as built, after the petal pass (protoStage.ts: it fills the trail's long gaps): PETAL_SHARE of the petals it
 *  holds, counted as the goal counts them (goals.ts goalCounts: none on a crumbling branch) */
export function rhythmPetalGoal(st: GeneratedStage, easy: boolean): void {
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
    P.push({ id: pid++, x: a.x1 - 30, y, width: b.x0 + 50 - (a.x1 - 30), height: 24, type: 'solid', style: 'branch', catch: true });
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
      P.push({ id: pid++, x: q.x0, y: q.y, width: w, height: q.surface === 'bough' ? 40 : 24, type: 'solid', style: style(q), ...(q.surface === 'catch' ? { catch: true } : {}) });
      if (q.wall) P.push({ id: pid++, x: q.wall[0], y: q.wall[1], width: 50, height: q.y - q.wall[1], type: 'solid', style: 'moss_stone', art: 'rock' });
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
  // (1-2's canopy boughs, the great logs, floated in mid-air over the water with nothing holding them (the quality supervisor's recording,
  // 2026-11-04, D16): each stands on a kapok behind it, as 1-1's boughs do (protoArt.ts setDecoTrunks), down past the water's edge; a
  // surface the same height lying inside a log's span (a bridge laid on it) is drawn by the log alone. Dressing only: nothing moves)
  const trunks: Array<{ x: number; topY: number; bottomY: number; w: number }> = [];
  if (id === '1-2') {
    const logs = P.filter((q) => q.style === 'log' && q.height === 40);
    for (const lg of logs) {
      for (const q of P) if (q !== lg && !q.art && q.type === 'solid' && Math.abs(q.y - lg.y) < 4 && q.x >= lg.x - 2 && q.x + q.width <= lg.x + lg.width + 2) q.art = 'hidden';
      // (one kapok under a log, two under a long one, a third of the way in from each end; never two kapoks closer than 260 px)
      const at = lg.width >= 700 ? [lg.x + lg.width / 3, lg.x + (2 * lg.width) / 3] : [lg.x + lg.width / 2];
      for (const x of at) {
        if (trunks.some((t) => Math.abs(t.x - x) < 260 && t.topY <= lg.y + 30)) continue;
        trunks.push({ x: Math.round(x), topY: lg.y + 24, bottomY: bottom + 200, w: 1.3 + ((Math.round(x) * 7) % 5) * 0.08 });
      }
    }
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
    proto: { hints: hints.sort((a, b) => a.x - b.x), covers: [], beats, ...(trunks.length ? { trunks } : {}), movedPickups, bpm, ownPetals: true, rhythm: { bpm, nodes: L.nodes, reroll: L.reroll, tiers: L.tiers } },
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
    // (a petal before the pad's take-off for the next liana, as a jump's: everyone crosses the pad)
    lay.L.petals.push({ x: Math.round(far + w - 40), y: y - 45 });
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
