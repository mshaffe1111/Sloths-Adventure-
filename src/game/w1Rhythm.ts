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
import { checkTrace, deadWalks, easyNode, hazardSpots, traceNode, flight, type Ledge, type Move, type NodeSpec, type Step, type Surface, type Trace, type HazardSpot } from './beatTrace.ts';
import { PHYS } from './physics.ts';
import { catchWindow, earlyCatch, jumpGrab, landWindow } from './protoCheck.ts';
import type { Platform, Vine } from './types.ts';

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
}
export interface Layout {
  stage: '1-2' | '1-5';
  bpm: number;
  ledges: LLedge[];
  vines: Array<{ x: number; topY: number; bottomY: number; node: number }>;
  nodes: LNode[];
  flags: Array<{ x: number; y: number }>;
  /** the beat path's petals (they show where the jump goes) */
  petals: Array<{ x: number; y: number }>;
  /** where a hazard sits on an avoided line (a snake on a bough or a ledge) */
  snakes: Array<{ x: number; y: number }>;
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
  /** a quick, sure player's seconds */
  expert: number;
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
export function fitSteps(spec: Omit<NodeSpec, 'steps'>, pal: Palette, R: Rng, tries = 60): { steps: Step[]; tr: Trace; easy: Trace } {
  const ms = marks(spec.bars);
  const eighth = 30 / spec.bpm;
  const total = spec.bars.length * 8;
  let last: Error | null = null;
  for (let k = 0; k < tries; k++) {
    const steps: Step[] = [];
    let y = spec.y;
    for (let i = 0; i < ms.length; i++) {
      const room = ((i + 1 < ms.length ? ms[i + 1] : total + 4) - ms[i]) * eighth;
      const fits = (move: Move, dy: number) => {
        const f = flight({ move, dy, vx: PHYS.maxRun });
        return !!f && f.t + 0.012 < room && y - dy >= pal.yMin && y - dy <= pal.yMax;
      };
      const surface = R.pick(pal.surfaces);
      let pick: Step | null = null;
      if (room > 1.1 && R.chance(pal.doubles)) {
        const dys = pal.jumpDy.filter((d) => fits('double', d));
        if (dys.length) pick = { move: 'double', dy: R.pick(dys), surface };
      }
      if (!pick) {
        const jd = pal.jumpDy.filter((d) => fits('jump', d) && !(surface === 'stump' && d <= 0));
        const hd = pal.hopDy.filter((d) => fits('hop', d) && d !== 0);
        if (jd.length && (room > 0.6 || !hd.length)) pick = { move: 'jump', dy: R.pick(jd), surface };
        else if (hd.length) pick = { move: 'hop', dy: R.pick(hd), surface: surface === 'stump' ? 'branch' : surface };
      }
      if (!pick) break;
      // (a stump is a face to climb: only going up; coming down is onto a branch or a bank)
      if (pick.surface === 'stump' && pick.dy <= 0) pick.surface = 'branch';
      steps.push(pick);
      y -= pick.dy;
    }
    if (steps.length !== ms.length) continue;
    try {
      const tr = traceNode({ ...spec, steps });
      const es = easyNode({ ...spec, steps });
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

/** a stage in the making: the cursor and what is laid so far */
class Lay {
  L: Layout;
  node = -1;
  constructor(stage: Layout['stage'], bpm: number, readonly R: Rng, readonly easy: boolean) {
    this.L = { stage, bpm, ledges: [], vines: [], nodes: [], flags: [], petals: [], snakes: [], marks: [], find: null, lines: [], spawn: { x: 0, y: 0 }, exit: { x: 0, y: 0 }, width: 0, height: 0, heartFalls: [], expert: 0 };
  }
  begin(tag: Tag, pair: string, tier: string, dir: 1 | -1, x: number, y: number, bars: string[] = []) {
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
  traced(tag: Tag, pair: string, tier: string, dir: 1 | -1, x: number, y: number, bars: string[], pal: Palette, opts: { petals?: boolean; snakes?: number } = {}) {
    const spec = { bpm: this.L.bpm, bars, x: dir === 1 ? x : 0, y };
    const fit = fitSteps(spec, pal, this.R);
    let tr = this.easy ? fit.easy : fit.tr;
    if (dir === -1) tr = mirror(tr, 0);
    if (dir === -1) {
      // (mirrored about 0, then moved so its entrance is at x)
      const dx = x - tr.x1;
      tr = shift(tr, dx);
    }
    this.begin(tag, pair, tier, dir, Math.min(tr.x0, tr.x1), y, bars);
    for (const q of tr.ledges) this.ledge(q.x0, q.x1, q.y, q.surface, q.step);
    this.L.flags.push({ x: Math.round(tr.checkpoint.x), y });
    if (opts.petals !== false) for (const l of tr.landings) arcPetals(this.L.petals, l.fromX, l.toX, l.fromY, l.toY, l.move);
    const spots = hazardSpots(tr, ['skip', 'held']).filter((s) => s.kind === 'skip');
    this.L.expert += 0;
    const out = { tr, steps: fit.steps, spots };
    this.end(dir === 1 ? tr.x1 : tr.x0, tr.seconds, tr.density);
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

/** petals along a jump's arc, where his body goes (one at the top, one on the way down: at most six a screen, petals.ts) */
function arcPetals(out: Layout['petals'], fx: number, tx: number, fy: number, ty: number, move: Move) {
  const rise = move === 'hop' ? 50 : move === 'double' ? 170 : 100;
  for (const k of [0.45, 0.75]) {
    const x = fx + (tx - fx) * k;
    const base = fy + (ty - fy) * k;
    out.push({ x: Math.round(x), y: Math.round(base - 40 - rise * Math.sin(Math.PI * k)) });
  }
}

/**
 * A chain of n lianas from a ledge ending at `edge` (height y) to a far ledge, the vines hung from the canopy above: rolled until a
 * running jump grabs the first, every vine catches the next and the last lands on the far side (protoCheck.ts, the same checks as
 * protoStage.ts chain). Returns the far ledge's start.
 */
function vineChain(lay: Lay, edge: number, y: number, n: number, soft: boolean): number {
  const R = lay.R;
  for (let tries = 0; tries < 16; tries++) {
    const easy = soft || tries > 8;
    const d0 = R.r(170, 200);
    const xs = [edge + d0];
    for (let k = 1; k < n; k++) xs.push(xs[k - 1] + (easy ? R.r(300, 330) : R.r(315, 350)));
    const farX = Math.round(xs[n - 1] + R.r(200, 240));
    const tops = xs.map(() => Math.round(y - (soft ? R.r(360, 390) : R.r(380, 440))));
    const vs: Vine[] = xs.map((vx, k) => ({ id: -1 - k, x: Math.round(vx), topY: tops[k], bottomY: Math.min(y + 30, tops[k] + 410), swaySpeed: 1.1, swayPhase: 0, vineType: 'swing_liana', isSwingingVine: true }));
    const far: Platform = { id: -99, x: farX, y, width: 400, height: 90, type: 'solid' };
    let ok = jumpGrab(edge, y, vs[0]) >= 4;
    for (let k = 0; ok && k < n - 1; k++) ok = catchWindow(vs[k], vs[k + 1]) > 0.6 && earlyCatch(vs[k], vs[k + 1]);
    if (ok) ok = landWindow(n > 1 ? vs[n - 2] : null, vs[n - 1], far) >= 8;
    if (!ok && tries < 15) continue;
    for (const v of vs) lay.L.vines.push({ x: v.x, topY: v.topY, bottomY: v.bottomY, node: lay.node });
    return farX;
  }
  throw new Error('no vine chain fits');
}

// ------------------------------------------------------------------ 1-2 The Petal Trail: the over-under loop-back ------------------------------------------------------------------

/** 1-2's three tiers (the game's y of each surface) */
export const T12 = { A: 330, B: 630, C: 930 } as const;
const PAL_A = (y: number): Palette => ({ surfaces: ['branch'], jumpDy: [-40, -20, 0, 20, 40], hopDy: [-40, -30, 30, 40], doubles: 0, yMin: y - 60, yMax: y + 60 });

/**
 * 1-2's layout. Swung beat (dotted half + quarter: a long jump, a quick hop: "swing... land-hop"), the pair jump + vine swing.
 * Nodes: intro (A) -> ramp (A) -> spike: the vines over the drop (A) -> rest over the loop (A; Dot; the note seen far below) ->
 * counter-melody back LEFT on the bough (B: hops up onto the high branches and down, snakes on the bough for whoever stays down) ->
 * the floor under the bough (C, right; the ramp again, pits now) -> climax (C: swung jumps, doubles, a vine pair over a chasm) ->
 * cool-down to the shrine.
 */
export function layout12(seed: number, easy: boolean, bpm: number): Layout {
  const R = rng(seed, '1-2');
  const lay = new Lay('1-2', bpm, R, easy);
  const L = lay.L;
  const { A, B, C } = T12;
  L.spawn = { x: 140, y: A };
  // ---- A: the canopy, rightwards
  let x = 40;
  const intro = lay.traced('intro', 'run + jump', 'A', 1, x, A, R.pick([
    ['x.......', '....x...', '........', 'x.......', '........'],
    ['x.......', '........', 'x.......', '....x...', '........'],
  ]), PAL_A(A));
  // (the first gaps are taught safe: a catch branch under each, a hop below, so a miss is a hop back up)
  for (const g of intro.tr.gaps) lay.ledge(g.x0 - 40, g.x1 + 40, A + 70, 'catch');
  L.lines.push({ x: 300, y: A, text: 'Follow the petals' });
  x = intro.tr.x1;
  const ramp = lay.traced('ramp', 'jump + hop (swung)', 'A', 1, x, intro.tr.yOut, R.pick([
    ['x.....x.', 'x.......', 'x.....x.', 'x.......', 'x.....x.', 'x.......'],
    ['x.......', 'x.....x.', 'x.......', 'x.....x.', 'x.....x.', 'x.......'],
  ]), PAL_A(A));
  x = ramp.tr.x1;
  let y = ramp.tr.yOut;
  // spike: the vine, taught over a bough (a miss lands on it), then the chain over the drop
  lay.begin('spike', 'jump + vine swing', 'A', 1, x, y);
  lay.ledge(x, x + 320, y, 'apron');
  L.flags.push({ x: x + 100, y });
  L.lines.push({ x: x + 60, y, text: 'Jump to the vine, let go to fly' });
  let edge = x + 320;
  const far1 = vineChain(lay, edge, y, 1, true);
  lay.ledge(edge - 10, far1 + 40, y + 90, 'catch');
  lay.ledge(far1, far1 + 360, y, 'branch');
  edge = far1 + 360;
  const far2 = vineChain(lay, edge, y, 3, false);
  lay.ledge(far2, far2 + 260, y, 'branch');
  L.heartFalls.push({ x0: edge, x1: far2 });
  x = far2 + 260;
  lay.end(x, (x - lay.L.nodes[lay.node].x0) / PHYS.maxRun + 4 * 0.5);
  // ---- the loop: the rest over the bough, then down and back left along it
  const restX = x;
  lay.begin('rest', 'none (Dot; the note seen far below)', 'A', 1, x, y);
  lay.ledge(x, x + 700, y, 'apron');
  L.flags.push({ x: x + 100, y });
  L.lines.push({ x: x + 200, y, text: "There's something down by the roots..." });
  x += 700;
  lay.end(x, 700 / PHYS.maxRun);
  // over the rest of the loop, the canopy has no gaps: a base bough with high branches to hop (no miss falls onto the bough below)
  const top = lay.traced('ramp', 'jump + hop over a bough', 'A', 1, x, y, ['x.....x.', 'x.....x.', 'x.......'], { surfaces: ['branch'], jumpDy: [-50, 50, -40, 40], hopDy: [40, -40, 30, -30], doubles: 0, yMin: y - 60, yMax: y });
  lay.ledge(x, top.tr.x1, y, 'bough');
  const Rx = top.tr.x1;
  // turn 1: off the end, down onto the bough (B), whose right end is a trunk
  const bRight = Rx + 260;
  lay.ledge(Rx - 160, bRight, B, 'apron');
  L.lines.push({ x: Rx + 120, y: B, text: 'Back the other way!' });
  // ---- B: the bough, leftwards
  const back = lay.traced('counter', 'hop up + jump down (the bough)', 'B', -1, bRight, B, R.pick([
    ['x.....x.', 'x.....x.', 'x.....x.'],
    ['x...x...', 'x.....x.', 'x...x...'],
  ]), { surfaces: ['branch'], jumpDy: [-60, -50, -40, 40, 50, 60], hopDy: [40, 30, -30, -40], doubles: 0, yMin: B - 70, yMax: B });
  const Lx = Math.min(back.tr.x0, back.tr.x1);
  lay.ledge(Lx, bRight, B, 'bough');
  // (a snake on the bough wherever the beat had him up on the branches: holding the way on along the bough meets it)
  for (const l of back.tr.landings) if (l.toY < B - 20) L.snakes.push({ x: Math.round((l.fromX + l.toX) / 2), y: B });
  L.snakes.splice(0, L.snakes.length, ...L.snakes.filter((s, i, a) => i === 0 || Math.abs(s.x - a[i - 1].x) > 260));
  // ---- C: the floor, rightwards from under the bough's left end
  x = Lx - 380;
  lay.ledge(x - 200, x, C, 'apron');
  L.lines.push({ x: x + 40, y: C, text: 'Now under the bough' });
  const PAL_C: Palette = { surfaces: ['bank', 'bank', 'stump'], jumpDy: [-30, 0, 30, 50], hopDy: [-30, 30, 40], doubles: 0, yMin: C - 70, yMax: C };
  const under = lay.traced('ramp', 'jump + hop (pits now)', 'C', 1, x, C, R.pick([
    ['x.....x.', 'x.......', 'x.....x.', 'x.......', 'x.....x.'],
    ['x.......', 'x.....x.', 'x.....x.', 'x.......', 'x.....x.'],
  ]), PAL_C);
  // (the note: on the floor right under the rest, where the view from the rest looks down on it, upright)
  L.find = { x: Math.round(restX + 420), y: C };
  x = under.tr.x1;
  y = under.tr.yOut;
  const climax = lay.traced('climax', 'jump + double + vine (swung)', 'C', 1, x, y, ['x.....x.', 'h.....x.', 'x.....x.', 'h.....x.', 'x.....x.', 'x.....x.'], { ...PAL_C, doubles: easy ? 0 : 0.6, surfaces: ['bank', 'stump', 'branch'] });
  x = climax.tr.x1;
  y = climax.tr.yOut;
  lay.begin('climax', 'jump + vine swing (over the chasm)', 'C', 1, x, y);
  const far3 = vineChain(lay, x, y, 2, false);
  lay.ledge(far3, far3 + 300, y, 'bank');
  lay.end(far3 + 300, (far3 + 300 - x) / 430 + 1);
  x = far3 + 300;
  // cool-down: a short run out of the chasm to the shrine
  lay.begin('cool', 'run', 'C', 1, x, y);
  lay.ledge(x, x + 700, y, 'apron');
  L.exit = { x: x + 440, y };
  lay.end(x + 700, 700 / PHYS.maxRun);
  L.width = x + 720;
  L.height = C + 120;
  return L;
}

// ------------------------------------------------------------------ 1-5 Where She Walked: the trail down ------------------------------------------------------------------

/**
 * 1-5's layout: down from the canopy to the floor at dusk, on a broken beat (quarters and halves, uneven), snap twigs required over
 * real pits, Meeca's carvings closer together into the last stretch. Vines only in the counter-melody (1-2 owns them).
 * intro -> snap twigs taught (over a catch) -> ramp (snaps over pits, down a level) -> spike (the dense snap run, down again) -> rest
 * (a carving seen across the drop, the keepsake high on a branch) -> counter-melody (jump + vine) -> climax: the carving chase (snaps,
 * drops, carvings every few jumps, to the floor) -> cool-down to the shrine.
 */
export function layout15(seed: number, easy: boolean, bpm: number): Layout {
  const R = rng(seed, '1-5');
  const lay = new Lay('1-5', bpm, R, easy);
  const L = lay.L;
  const tiers = [330, 480, 630, 780, 930];
  L.spawn = { x: 140, y: tiers[0] };
  // (from the height he is at down to the node's tier: the trail only ever goes down a little at a time)
  const pal = (to: number, snap: number): Palette => ({
    surfaces: snap >= 1 ? ['crumble'] : snap > 0 ? ['crumble', 'branch', 'crumble'] : ['branch'],
    jumpDy: [-60, -50, -30, -20, 0, 20], hopDy: [-40, -30, 30], doubles: 0, yMin: Math.min(y, to) - 40, yMax: to + 30,
  });
  const mark = (x: number, y: number) => L.marks.push({ x: Math.round(x), y: Math.round(y) });
  let x = 40, y = tiers[0];
  const intro = lay.traced('intro', 'run + jump', 'trail', 1, x, y, R.pick([
    ['x.......', '......x.', '........', '....x...'],
    ['x.......', '........', 'x.......', '......x.'],
  ]), pal(y, 0));
  mark(intro.tr.ledges[1].x0 + 60, intro.tr.ledges[1].y);
  L.lines.push({ x: 260, y, text: "Meeca's mark! Follow her trail" });
  x = intro.tr.x1;
  y = intro.tr.yOut;
  const teach = lay.traced('ramp', 'snap twig + jump (taught)', 'trail', 1, x, y, ['x...x...', '........', 'x...x...'], { ...pal(y, 0.5), surfaces: ['crumble'], jumpDy: [0, -20], yMax: y + 40 });
  for (const g of teach.tr.gaps) lay.ledge(g.x0 - 60, g.x1 + 60, y + 80, 'catch');
  L.lines.push({ x: x + 120, y, text: 'These ones snap! Keep moving' });
  x = teach.tr.x1;
  y = teach.tr.yOut;
  const broken = (n: number) => Array.from({ length: n }, () => R.pick([3, 4, 4, 5, 6]));
  const ramp = lay.traced('ramp', 'snap twig + jump (broken)', 'trail', 1, x, y, barsFrom(broken(9)), pal(tiers[1], 0.6));
  mark(ramp.tr.ledges[2].x0 + 40, ramp.tr.ledges[2].y);
  x = ramp.tr.x1;
  y = ramp.tr.yOut;
  const spike = lay.traced('spike', 'snap twig + drop', 'trail', 1, x, y, barsFrom(Array.from({ length: 10 }, () => R.pick([3, 3, 4, 5]))), pal(tiers[2], 1));
  mark(spike.tr.ledges[3].x0 + 40, spike.tr.ledges[3].y);
  x = spike.tr.x1;
  y = spike.tr.yOut;
  // rest: the keepsake on a high branch across the drop (seen from here), a carving beyond it
  lay.begin('rest', 'none (Dot; the keepsake seen across the drop)', 'trail', 1, x, y);
  lay.ledge(x, x + 620, y, 'apron');
  L.flags.push({ x: x + 100, y });
  L.find = { x: x + 900, y: y - 160 };
  lay.ledge(x + 820, x + 980, y - 130, 'branch');
  L.lines.push({ x: x + 220, y, text: 'She came this way. Look up there!' });
  x += 620;
  lay.end(x, 620 / PHYS.maxRun);
  // counter-melody: the only vines in 1-5 (a jump, a swing, a jump, a swing)
  lay.begin('counter', 'jump + vine swing', 'trail', 1, x, y);
  lay.ledge(x, x + 220, y, 'apron');
  const far = vineChain(lay, x + 220, y, 2, easy);
  lay.ledge(far, far + 320, y, 'branch');
  mark(far + 120, y);
  lay.end(far + 320, (far + 320 - x) / 430 + 1);
  x = far + 320;
  // climax: the carving chase, down to the floor, carvings every few jumps
  const climax = lay.traced('climax', 'snap twig + drop + hop (the chase)', 'trail', 1, x, y, barsFrom(Array.from({ length: 16 }, () => R.pick([3, 3, 4, 4, 5]))), { ...pal(tiers[4] - 100, 0.8), yMax: tiers[4] });
  climax.tr.ledges.forEach((q, i) => { if (i > 0 && i % 2 === 0 && q.surface !== 'apron') mark(q.x0 + 30, q.y); });
  x = climax.tr.x1;
  y = climax.tr.yOut;
  lay.begin('cool', 'run', 'trail', 1, x, y);
  lay.ledge(x, x + 640, y, 'apron');
  L.exit = { x: x + 400, y };
  lay.end(x + 640, 640 / PHYS.maxRun);
  L.width = x + 660;
  L.height = Math.max(...L.ledges.map((q) => q.y)) + 120;
  return L;
}
