/**
 * The level mixer, first stage: 1-5 built from the level designer's node plan (reference/engine/ENGINE-SPEC.md "CP3 design", branch
 * engine-spec). GREY-BOX for Matt's checkpoint; nothing here ships until Matt picks it (CP5).
 *
 * A stage is a list of nodes; each node has a job and a deck of ideas. One idea is drawn per roll (a shuffle bag, never the idea the
 * node before used), and each idea lays its own pieces with sizes rolled inside the ranges proven in the real engine
 * (reference/engine/cp2/: cp2-trace*.out, cp2-climb.out, cp2-push.out). Easy's rules (designer, CP2):
 *   - no rise over +40 px onto a landing narrower than 220 px;
 *   - a landing after a +40 rise is at least 110 px wide;
 *   - a rise of +30 or more has a gap of at most 80 px;
 *   - crumbling tiles hold 1.0 s.
 * Every choice is written to `explain` (node, idea, why), so a roll can be read without opening the game.
 *
 * Coordinates: x right, y down (the game's), feet on a platform's top.
 */
import type { Collectible, LevelConfig, Platform, Vine } from '../types.ts';
import { IDEAS, SHAPES, type BurstRecipe } from './library.ts';
import { kitFor, type WorldKit } from './kits.ts';
import { holds } from './support.ts';
import { paintedBank } from '../w1Pits.ts';
import { fitTrunks, FOOT_IN, trunkGround } from '../trunkFit.ts';
import { w1DressFacing, w1DressWidth } from '../w1NewArt.ts';
import type { StageSpec } from './spec.ts';
import type { GeneratedStage } from '../stageGenerator.ts';
import type { ProtoExtras, StageHint } from '../protoStage.ts';
import { fixPickups } from '../flowerReach.ts';
import { findForStage } from '../finds.ts';
import { heldMaxGap, jumpOK, validateStage } from '../levelCheck.ts';
import { DOUBLE_RISE, reachGlide, reachJump } from '../physics.ts';

type Rng = { f: () => number; r: (a: number, b: number) => number; i: (a: number, b: number) => number; pick: <T>(xs: readonly T[]) => T };
/** one RNG stream per seed and salt (the same mix as w1Rhythm.ts rng): every node and layer draws from its own stream */
export function rngFor(seed: number, salt: string): Rng {
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
  return { f, r: (x, y) => x + (y - x) * f(), i: (x, y) => Math.floor(x + (y - x + 1) * f()), pick: (xs) => xs[Math.floor(f() * xs.length)] };
}

export type Idea =
  | 'bank hops' | 'stump hop' | 'snap teach' | 'snap dash' | 'bounce up' | 'the climb' | 'crumbling ledge' | 'creaky boughs'
  | 'lily-pad hop' | 'reed isles' | 'bank walk' | 'rotten-branch drop' | 'push block' | 'bough stair' | 'bridge span'
  // (1-1's, CP4: the designer's node plan for "Into the Canopy")
  | 'floor walk' | 'bough hops' | 'double gap' | 'double chain' | 'top branch'
  // (1-1's ground half, the designer's "a ground stage that becomes a tree stage", 11-05)
  | 'bounce mound' | 'stump tops' | 'log jam';
/** the floor ideas a canopy is laid over (the designer's ruling 1 on the CP3 miss: "boughs run above bank hops, stump hops or the creek") */
// (log jam joins them, 11-05: with no lily pads until the water draws, two floor ideas left one over the 40% cap on 1-5)
export const FLOOR: readonly Idea[] = ['bank hops', 'stump hop', 'lily-pad hop', 'log jam'];
export interface Fork { high: Idea[]; low: Idea[] }
export interface NodePlan { id?: string; easyOnly?: boolean;
  /** one burst only (1-1's run teach: a flat walk, no gaps) */
  one?: boolean;
  /** bursts this node lays, over the dial's (1-1's ground teaches: 3, for its length without a canopy) */
  bursts?: number;
  inOrder?: boolean;
  /** no canopy over its floor idea (1-1's n1-n7: the forest floor; boughs arrive with the climb) */
  ground?: boolean;
  /** Dot's line at the node's end, not its start (1-1's "Look how high we are!" at the chain's top) */
  hintAtEnd?: boolean; job: string; deck: Idea[] | Fork; not?: number; notLast?: number; hint?: string; padHint?: string; flagBefore?: boolean; heartAfter?: boolean; seed?: boolean;
  /** a catch branch under every gap of the node's floor road: a teach whose misses cost nothing (1-1) */
  safe?: boolean;
  /** the band the node's way keeps to, top and bottom (1-1 rises node by node; 1-5's nodes share the stage's whole band) */
  band?: [number, number] }

/** a node's name on the map: its plan id, or its number counting only the nodes without one (n7b sits between n7 and n8) */
const nidOf = (plan: NodePlan[], i: number): string => plan[i].id ?? String(plan.slice(0, i + 1).filter((q) => !q.id).length);

/** a stage the mixer builds, read from its spec: its plan, where it starts, how many of Meeca's marks it lays (0 for a sprint), its last
 *  piece, and its petals low on the pieces for a trail (1-1: Meeca's pressed petals, the lead's brief) */
interface MixSpec { id: string; plan: NodePlan[]; startY: number; marks: number; marksGoal?: { normal: number; easy: number }; end: { kind: string; w: number }; burstMin?: number; burstMax?: number; lowPetals?: boolean;
  dress?: { start?: string[]; clue?: string } }

/** a stage spec in the mixer's own terms (nothing stage-specific lives in this file: every stage is its spec, stages.ts) */
export function mixOf(S: StageSpec): MixSpec {
  const plan: NodePlan[] = S.nodes.map((n) => ({
    ...(n.id ? { id: n.id } : {}), job: n.job, deck: n.deck as NodePlan['deck'],
    ...(n.line ? { hint: n.line.text, ...(n.line.pad ? { padHint: n.line.pad } : {}), ...(n.line.at === 'end' ? { hintAtEnd: true } : {}) } : {}),
    ...(n.flagBefore !== undefined ? { flagBefore: n.flagBefore } : {}), ...(n.heartAfter !== undefined ? { heartAfter: n.heartAfter } : {}),
    ...(n.safe ? { safe: true } : {}), ...(n.lay ?? {}),
  }));
  return { id: S.id, plan, startY: S.lay.startY, marks: S.goal.kind === 'marks' ? S.goal.count : 0, marksGoal: S.goal.kind === 'marks' ? { normal: S.goal.normal, easy: S.goal.easy } : undefined, end: S.lay.end, burstMin: S.lay.burstMin, burstMax: S.lay.burstMax,
    lowPetals: S.profile.petals === 'trail' || undefined, dress: S.dress };
}

interface Lay {
  /** the node lays a petal at the top of each double gap's arc (1-5's in-order test node) */
  arcPetals?: boolean;
  /** the difficulty dial's gap, as a share of the gate's widest (ENGINE-SPEC "The difficulty dial") */
  gapShare: number;
  /** the dial's rise cap: its share of the highest rise the gate allows (px) */
  riseCap: number;
  /** the dial's landing width: Easy's typical landing over Normal's (260 -> 150 against 220 -> 110 px) */
  wScale: number;
  /** Easy's own size bands: every band this many times Normal's (the designer's pacing ruling A, 11-05: Easy landings about 300 px) */
  bs: number;
  /** the dial's d for this stage (0 at 1-1, 1 at 10-9) */
  dial: number;
  P: Platform[];
  V: Vine[];
  C: Collectible[];
  hints: StageHint[];
  flags: Array<{ x: number; y: number }>;
  marks: Array<{ x: number; y: number }>;
  explain: Array<{ node: number; nid?: string; job: string; idea: string; road?: 'high' | 'low'; canopy?: boolean; x0: number; x1: number; why: string }>;
  pid: number;
  cid: number;
  easy: boolean;
  /** how the last canopy was entered, and how many mushrooms the stage has (the designer's review D: no more than the old 1-1's) */
  entry?: Entry;
  mushrooms: number;
  /** bursts laid so far on Normal (normalPad) */
  nb?: number;
  /** petals at marching height on the pieces (MixSpec.lowPetals) */
  lowPetals?: boolean;
  /** the fewest pieces a Normal burst lays (1-1: 5, a calm march over wide ground) */
  burstMin?: number;
  /** the most pieces a Normal burst lays (1-1: 4, for its 2:40-3:15 clock; 1-5: 5) */
  burstMax?: number;
  /** whether a mushroom's bounce has been taught yet (1-1's n4): no canopy is entered by one before it */
  bounceTaught?: boolean;
  /** laying a canopy's boughs: they keep Normal's size bands on Easy (the high road is optional; the designer, 11-05) */
  boughing?: boolean;
  /** Easy's breather pads, so `padLogs` can find them */
  padSet: Set<Platform>;
  /** Easy's breather pads laid so far (they alternate log and bank) */
  pads?: number;
  /** creaky has been taught (n2's first twig is laid): no creaky piece before it (STAGE-RULES: the first appearance is taught) */
  creakyTaught: boolean;
  /** the last six landings' kind x size, as the variety gate reads them (cp1/measure2.py), so a burst picks a size that is new */
  recent: string[];
  glints: Array<{ x: number; y: number }>;
  /** laying a recipe whose logs stand on stumps: its logs are thin (the kit's stumpLog height) */
  stumping?: boolean;
  /** the creeks laid so far (waterRun): the stage's drawn water, proto.water */
  water: Array<{ x0: number; x1: number; y: number }>;
}
type Entry = 'mushroom' | 'vine' | 'step';
/** where the way is: the end of the last piece laid, its top, and the kind of piece it was */
interface Cursor { x: number; y: number }

/** a phone screen's width of the stage, sideways (the stills): the trunk cap counts within it */
const SCREEN = 1400;
/** this build's world kit (kits.ts): set at the start of every build, from the stage's world */
let K = undefined as unknown as WorldKit;
/** the band the way must stay in right now (a fork's road keeps to its own, so the two roads never meet) */
let band = { yMin: 0, yMax: 0 };
/** the narrowest gap that is still a jump (beatTrace.ts MIN_GAP) */
const MIN_GAP = 40;

function plat(L: Lay, k: string, x: number, y: number, w: number): Platform {
  const p: Platform & Record<string, unknown> = { id: L.pid++, x: Math.round(x), y: Math.round(y), width: Math.round(w), height: 24, type: 'solid', style: 'branch' } as never;
  if (k === 'bank') Object.assign(p, { style: 'moss_stone', height: 120 });
  // (50 px, the height World 1's painted rock is drawn for (protoArt.ts drawRockArt): at 40 it drew the grey placeholder slab, P-12)
  else if (k === 'stone') Object.assign(p, { style: 'moss_stone', height: 50 });
  else if (k === 'log') Object.assign(p, { style: 'log', height: L.stumping ? K.heights.stumpLog ?? 30 : 90 });
  else if (k === 'bridge') Object.assign(p, { style: 'canopy_bridge' });
  else if (k === 'creaky') {
    if (!L.creakyTaught) throw new Error('a creaky piece before the node that teaches creaky');
    Object.assign(p, { type: 'fragile', creak: L.easy ? 1.2 : 0.88 });
  }
  else if (k === 'crumble') Object.assign(p, { type: 'fragile', style: 'ruin', crumbleAfter: L.easy ? 1.0 : 0.7 });
  else if (k === 'catch') Object.assign(p, { catch: true });
  else if (k === 'lily') Object.assign(p, { style: undefined, height: 12, lily: true });
  // (a reed isle is a low bank of earth in the creek, which World 1's kit paints (paintedBank, h 90); styleless at 30 px it was drawn as
  // terrain's code island, 3 gradients a frame: engine-render's trace of the draw check, 11-05)
  else if (k === 'reed') Object.assign(p, { style: 'moss_stone', height: 90 });
  else if (k === 'mushroom') Object.assign(p, { type: 'bouncy', style: undefined, height: 30 });
  L.P.push(p);
  L.recent.push(sizeKey(k, p.width, L.boughing ? 1 : L.bs));
  if (L.recent.length > 6) L.recent.shift();
  return p;
}

/** a piece's kind x size as the variety gate names it: short under 150 px, medium to 300, long over */
function sizeKey(k: string, w: number, s = 1): string {
  return `${k} ${w < 150 * s ? 'short' : w <= 300 * s ? 'medium' : 'long'}`;
}

/** the Easy rules (designer, CP2), applied to a rise `dy` (up +) onto a landing `w` wide, after a gap */
function easyFit(L: Lay, dy: number, w: number, gap: number): { dy: number; w: number; gap: number } {
  if (!L.easy) return { dy, w, gap };
  if (dy > 40 && w < 220) dy = 40;
  if (dy >= 40 && w < 110) w = 110;
  if (dy >= 30 && gap > 80) gap = 80;
  return { dy, w, gap };
}

/**
 * The widest gap the stage's own gate accepts from a to b (P4: one model of a jump, the level check's, never a copy): Normal is the
 * single jump (1-5 is before doubles count, levelCheck.ts doubleAllowed); Easy is also held to the ~70% jump (easyHoldCheck).
 */
function gateGap(L: Lay, aY: number, b: { y: number; height: number; type: string }, dy: number): number {
  const A = { id: 0, x: 0, y: aY, width: 100, height: 24, type: 'solid' } as Platform;
  let lo = 0, hi = 400;
  // (jumpOK answers for one gap: search the widest that passes)
  while (hi - lo > 1) {
    const m = (lo + hi) >> 1;
    const B = { id: 1, x: 100 + m, y: aY - dy, width: 100, height: b.height, type: b.type } as Platform;
    if (jumpOK(A, B, false).ok) lo = m; else hi = m;
  }
  let max = lo;
  if (L.easy) max = Math.min(max, Math.floor(heldMaxGap(A, { id: 1, x: 100 + max, y: aY - dy, width: 100, height: b.height, type: b.type } as Platform, false)));
  return max;
}

/** how far a trunk's top goes into the underside of the piece it holds (px) */
const UNDER_IN = 4;

/** the pieces laid from cursor c on stand on stumps (supports draws a short trunk, no crown, for each): a ground high road */
function markStumps(L: Lay, e: Cursor, c: Cursor): Cursor {
  for (const p of L.P) if (p.x >= c.x - 2 && p.style === 'log') (p as Platform & { stump?: boolean }).stump = true;
  return e;
}

/** a gap a double jump makes and a single does not (1-1's double nodes): the gate's widest single plus 40-60 px, held inside 80% of
 *  the double's widest, from a ledge at aY to one dy higher */
function doubleGap(L: Lay, aY: number, dy: number): number {
  const A = { id: 0, x: 0, y: aY, width: 100, height: 24, type: 'solid' } as Platform;
  const widest = (dbl: boolean) => {
    let lo = 0, hi = 500;
    while (hi - lo > 1) { const m = (lo + hi) >> 1; if (jumpOK(A, { id: 1, x: 100 + m, y: aY - dy, width: 160, height: 24, type: 'solid' } as Platform, dbl).ok) lo = m; else hi = m; }
    return lo;
  };
  const one = widest(false), two = widest(true);
  let g = Math.min(one + (L.easy ? 40 : 60), Math.round(two * 0.8));
  if (g <= one + 20) g = Math.round((one + two) / 2);
  return g;
}

/** a petal over the middle of each gap between neighbouring route pieces from index `from` on (an arc that shows where the jump goes) */
function petalsOver(L: Lay, from: number, to = L.P.length) {
  // (one road's petals, the floor's, where the marks are: petals on both roads of a canopy traced a way no one takes, up to the boughs
  // and down again, and the inspector's pickup route counted every one of those hops)
  const ps = L.P.slice(from, to).filter((p) => p.type !== 'bouncy' && !(p as { bough?: boolean }).bough && !(p as { perch?: boolean }).perch);
  for (let i = 1; i < ps.length; i++) {
    const a = ps[i - 1], b = ps[i];
    const gx = (a.x + a.width + b.x) / 2;
    if (b.x - (a.x + a.width) < 30) continue;
    if (L.lowPetals) {
      // (on the landing, 40 px over it: where he walks, low)
      const lx = b.x + Math.min(70, b.width / 2);
      L.C.push({ id: L.cid++, type: 'flower', botanicalVariant: 'orchid', x: Math.round(lx), y: b.y - 40, collected: false, bobPhase: (lx * 0.031) % 6.28 } as Collectible);
      continue;
    }
    // (never tucked under a piece over it: the creek's boughs over the lily pads hid two, which the reach pass then moved, 1-5 seed 1)
    const py = Math.min(a.y, b.y) - 80;
    if (L.P.some((q) => q.type !== 'bouncy' && q.x < gx + 40 && q.x + q.width > gx - 40 && q.y < py + 10 && py - q.y < 110)) continue;
    L.C.push({ id: L.cid++, type: 'flower', botanicalVariant: i % 3 ? 'orchid' : 'hibiscus', x: Math.round(gx), y: py, collected: false, bobPhase: (gx * 0.031) % 6.28 } as Collectible);
  }
}

/** the middle-most of these pieces with nothing over it for 110 px (a mark on it is never inside a piece above), on the walking road:
 *  never a canopy's bough or perch, which only a bounce reaches (a first-timer on the floor met a sealed door, cp3-ft after the rebuild) */
function clearPiece(L: Lay, ps: Platform[]): Platform | undefined {
  const road = ps.filter((p) => !(p as { bough?: boolean }).bough && !(p as { perch?: boolean }).perch && !(p as { crossing?: boolean }).crossing);
  const mid = road.length >> 1;
  const order = road.map((p, i) => [Math.abs(i - mid), p] as const).sort((a, b) => a[0] - b[0]).map(([, p]) => p);
  // (never on a piece that gives way: a mark on a crumbling ledge dropped him to the low road before he reached it, and the way to it went
  // round the fork's crossings again and again)
  const clear = (p: Platform) => p.type !== 'bouncy' && p.type !== 'fragile' && !L.P.some((q) => q !== p && q.x < p.x + p.width / 2 + 40 && q.x + q.width > p.x + p.width / 2 - 40 && q.y < p.y && p.y - q.y < 110);
  // (where both roads meet: no bough over it at any height, so a player on the canopy and one on the floor both pass it. Under a
  // canopy a mark on the floor is one road's, and the bots on the boughs missed 3-4 of the 9 main-way marks, so a first timer met the
  // sealed door with Normal's one mark of slack gone (layout 3: 7 of 10))
  // (no bough within 250 px either side, at any height: a jump between two boughs flies over the floor between them. Letting boughs
  // behind it in (a canopy's end) was tried: the adult bot's marks fell from 7-8 of 10 to 5-7)
  const open = (p: Platform) => !L.P.some((q) => (q as { bough?: boolean }).bough && q.x < p.x + p.width / 2 + 250 && q.x + q.width > p.x + p.width / 2 - 250 && q.y < p.y);
  // (and one he cannot jump over: the gap before it, the piece and the gap after it together 380 px or more, past a double jump's
  // reach at a run, so whoever goes this way lands on it. A short piece between short gaps is jumped over, mark and all: layout 1's
  // adult bot passed 4 of its 9)
  const span = (p: Platform) => {
    const solid = L.P.filter((q) => q !== p && q.type !== 'bouncy' && Math.abs(q.y - p.y) < 160);
    const before = Math.max(...solid.filter((q) => q.x + q.width <= p.x + 10).map((q) => q.x + q.width), -1e9);
    const after = Math.min(...solid.filter((q) => q.x >= p.x + p.width - 10).map((q) => q.x), 1e9);
    return after - before;
  };
  // (first a canopy's rest on Normal: its far end, past the boughs, is where both roads walk (the boughs end 260 px before it), so the
  // mark goes 110 px from that end, clear of every bough; a short floor piece under a canopy is jumped over, mark and all)
  const rest = order.find((p) => L.padSet.has(p) && p.width >= 400 && clear(p) && !L.P.some((q) => (q as { bough?: boolean }).bough && q.x < p.x + p.width - 110 + 60 && q.x + q.width > p.x + p.width - 110 - 60 && q.y < p.y));
  if (rest) { (rest as Platform & { markX?: number }).markX = rest.x + rest.width - 110; return rest; }
  return order.find((p) => clear(p) && open(p) && span(p) >= 380) ?? order.find((p) => clear(p) && span(p) >= 380) ?? order.find((p) => clear(p) && open(p)) ?? order.find(clear);
}

/** Easy's size bands over Normal's (pacing ruling A); the variety gate reads Easy's sizes on the same bands (cp1/measure2.py) */
export const EASY_BS = 1.35;
/** (a step of 20 px or less reads as flat: the variety gate's up/flat/down, cp1/measure2.py) */
const FLAT = 20;

/**
 * A burst (the designer's ruling, CP3 (a)+(c)): `n` pieces from `kinds`; the kind changes every 2 pieces and the size band every piece;
 * every landing steps up or down more than 20 px unless the band forbids it. Gaps are the dial's share of the gate's (gateGap).
 */
function burst(L: Lay, c: Cursor, R: Rng, kinds: string[], n: number, steps: number[] = K.steps, fixedGap?: number, width?: number): Cursor {
  let { x, y } = c;
  for (let i = 0; i < n; i++) {
    const k = kinds[Math.floor(i / 2) % kinds.length];
    // (a stone sits on ground (the designer's S-3/S-9, and "keep the stones", 11-05): it is a 50 px rise on the far end of a bank, its
    // foot on the bank's top, never a rock on nothing. A bank is laid first when the piece before is not one)
    if (k === 'stone' && width === undefined) {
      let base = L.P[L.P.length - 1];
      // (never on a rest pad, whose petals lie along its top)
      if (!(base && base.style === 'moss_stone' && base.height >= 90 && !L.padSet.has(base) && Math.abs(base.x + base.width - x) < 2 && Math.abs(base.y - y) < 2)) {
        const e = burst(L, { x, y }, R, ['bank'], 1, steps, fixedGap);
        x = e.x; y = e.y; base = L.P[L.P.length - 1];
      }
      const sw = Math.round(R.r(70, 110) * L.bs);
      if (base.width < sw + 90) base.width = sw + 90;
      const st = plat(L, 'stone', base.x + base.width - sw, base.y - 50, sw);
      x = st.x + st.width; y = st.y;
      continue;
    }
    const bands = (K.bands[k] ?? [[110, 200]]).map(([a, b]) => [Math.round(a * L.bs), Math.round(b * L.bs)] as [number, number]);
    // (the size band turns every piece, so two of a kind side by side are two sizes: "something new" comes often)
    // (and of the bands, the first in that turn whose size is new against the last six landings, the gate's "something new")
    const turnAt = (i + Math.floor(i / 2)) % bands.length;
    const order = bands.map((_, j) => bands[(turnAt + j) % bands.length]);
    const bnd = width !== undefined ? bands[turnAt] : order.find((b) => !L.recent.includes(sizeKey(k, (b[0] + b[1]) / 2, L.bs))) ?? bands[turnAt];
    let d = R.pick(steps);
    // (outside its band a burst steps back toward it; inside, a step that would leave the band turns round, or shrinks to 30 px)
    if (y > band.yMax) d = Math.abs(d) || FLAT + 10;
    else if (y < band.yMin) d = -(Math.abs(d) || FLAT + 10);
    else {
      if (y - d < band.yMin || y - d > band.yMax) d = -d;
      if (y - d < band.yMin || y - d > band.yMax) d = Math.sign(-d) * (FLAT + 10);
      if (y - d < band.yMin || y - d > band.yMax) d = 0;
    }
    // (the dial's rise cap, and its landing widths: Easy's are wider by the dial's ratio, up to the top of the piece's own size band, so
    // a short piece stays short and the gate's kind x size variety holds; never under 90 px)
    if (d > L.riseCap) d = L.riseCap;
    const f = easyFit(L, d, width ?? Math.max(90, Math.round(R.r(bnd[0], bnd[1]))), 999);
    const h = k === 'log' && L.stumping ? K.heights.stumpLog ?? 30 : K.heights[k] ?? 24, type = k === 'creaky' || k === 'crumble' ? 'fragile' : 'solid';
    let max = gateGap(L, y, { y: y - f.dy, height: h, type }, f.dy);
    while (max < MIN_GAP + 10 && f.dy > 0) { f.dy -= 10; max = gateGap(L, y, { y: y - f.dy, height: h, type }, f.dy); }
    // (the gap is the dial's share of the gate's widest, give or take 8%; Easy's 80 px cap on a rise still holds)
    const want = Math.round(max * L.gapShare * R.r(0.92, 1.08));
    f.gap = fixedGap ?? Math.max(MIN_GAP, Math.min(want, f.gap, max - 4));
    x += f.gap;
    y -= f.dy;
    plat(L, k, x, y, f.w);
    x += f.w;
  }
  return { x, y };
}

/** one piece `w` wide, a gate-sized gap on from the cursor and a step up or down from it (no landing sits flat with the one before) */
function step(L: Lay, c: Cursor, R: Rng, k: string, w: number): Platform {
  burst(L, c, R, [k], 1, K.steps, undefined, w);
  return L.P[L.P.length - 1];
}

/**
 * A creek (a water idea, the designer's 11:40 ruling: lily pads come back on real water): a bank, then the idea's pieces in turn on one
 * drawn surface (the world kit's water row: a pad floats on it, a log or a reed isle rises out of it), then a bank on the far side at the
 * near bank's height; the stretch between the banks is the stage's water (L.water, proto.water), reaching in under both banks. Every gap
 * is the gate's, as a burst's are. `farW` sets the far bank's width (a canopy's long end piece). A world with no water row lays none.
 */
function waterRun(L: Lay, c: Cursor, R: Rng, kinds: string[], n: number, farW?: number): Cursor {
  const W = K.water;
  if (!W) throw new Error(`World ${K.world}'s kit has no water row: the mixer cannot lay a creek there (src/game/mixer/kits.ts)`);
  const bank = (p: Platform | undefined) => !!p && p.style === 'moss_stone' && p.height >= 120 && Math.abs(p.x + p.width - c.x) < 2 && Math.abs(p.y - c.y) < 2;
  const last = L.P[L.P.length - 1];
  const near = bank(last) ? last : step(L, c, R, 'bank', Math.round(R.r(K.bands.bank[1][0], K.bands.bank[1][1]) * L.wScale));
  const s = near.y + W.depth;
  let x = near.x + near.width, y = near.y;
  // (each piece a gate-sized gap on, at the dial's share of the widest, as a burst lays it)
  const next = (k: string, ty: number, w: number): Platform => {
    const h = K.heights[k] ?? (k === 'lily' ? 12 : k === 'reed' ? 90 : 24);
    const f = easyFit(L, y - ty, w, 999);
    const max = gateGap(L, y, { y: ty, height: h, type: 'solid' }, y - ty);
    const gap = Math.max(MIN_GAP, Math.min(Math.round(max * L.gapShare * R.r(0.92, 1.08)), f.gap, max - 4));
    const p = plat(L, k, x + gap, ty, f.w);
    x = p.x + p.width; y = p.y;
    return p;
  };
  for (let i = 0; i < n; i++) {
    const k = kinds[i % kinds.length];
    if (W.top[k] === undefined) throw new Error(`"${k}" has no height over the water in World ${K.world}'s kit water row`);
    const bnd = R.pick(K.bands[k] ?? [[110, 200]]);
    next(k, s - W.top[k], Math.round(R.r(bnd[0], bnd[1]) * L.bs));
  }
  // (on Easy the far bank is 220 px or more: a 52 px rise onto a narrower one breaks Easy's 40 px cap, easyFit)
  const fw = farW ?? Math.round(R.r(K.bands.bank[1][0], K.bands.bank[1][1]) * L.wScale);
  const far = next('bank', near.y, L.easy ? Math.max(220, fw) : fw);
  L.water.push({ x0: near.x + near.width - W.inset, x1: far.x + W.inset, y: s });
  return { x: far.x + far.width, y: far.y };
}

/** a burst idea laid from its library recipe (library.ts `lay`) */
function layRecipe(L: Lay, c: Cursor, R: Rng, rec: BurstRecipe, n: number): Cursor {
  const ks = L.easy && rec.easyKinds ? rec.easyKinds : rec.kinds;
  // (several kind lists: one is picked for each burst)
  const kinds = Array.isArray(ks[0]) ? R.pick(ks as string[][]) : (ks as string[]);
  const count = rec.n ? (L.easy ? rec.n.easy : rec.n.normal) : n - (rec.nLess ?? 0);
  const steps = (L.easy && rec.easySteps) || rec.steps;
  if (rec.stumps) L.stumping = true;
  let e = burst(L, c, R, kinds, count, steps, rec.gap);
  L.stumping = false;
  if (rec.stumps) e = markStumps(L, e, c);
  if (rec.then) e = layRecipe(L, e, R, rec.then, n);
  return e;
}

/** one idea's burst, laid from the cursor; returns the way's end */
function idea(L: Lay, name: Idea, c: Cursor, R: Rng): Cursor {
  // (a burst is 4-6 pieces, the designer's (a); 1-5 sits at 4-5 for its 2:30-3:00 aim, ENGINE-SPEC "Stage length")
  // (Easy one piece shorter, 3-4, the designer's ruling on the fun gate)
  // (Easy at 3 pieces: the designer's second fix for Easy's density; the snap dash keeps 5 for its teach-to-test job)
  const n = L.easy ? 3 : R.i(L.burstMin ?? 4, L.burstMax ?? 5);
  // (a burst idea is the library's recipe; only the shapes below are built here)
  const rec = IDEAS[name]?.lay;
  // (a water idea is a creek: its recipe's kinds on one drawn surface between two banks, waterRun)
  if (rec && IDEAS[name].element === 'water') return waterRun(L, c, R, rec.kinds as string[], L.easy && rec.n ? rec.n.easy : rec.n ? rec.n.normal : n - 1);
  if (rec) return layRecipe(L, c, R, rec, n);
  // (the shapes' numbers are the library's, SHAPES; here only the geometry each one builds from them)
  const r = (q: readonly [number, number] | readonly number[]) => R.r(q[0], q[1]);
  switch (name) {
    case 'snap teach': {
      const P = SHAPES['snap teach'];
      L.creakyTaught = true;
      const bank = step(L, c, R, 'bank', P.bank);
      for (const [dx, dy, w] of P.twigs) plat(L, 'creaky', bank.x + dx, bank.y + dy, w);
      return { x: bank.x + bank.width, y: bank.y };
    }
    case 'bounce up': {
      const P = SHAPES['bounce up'];
      L.bounceTaught = true;
      const pad = step(L, c, R, 'bank', P.pad);
      plat(L, 'mushroom', pad.x + P.mushDx, pad.y - 30, P.mushW);
      const by = pad.y - Math.round(r(P.rise));
      const b = plat(L, 'branch', pad.x + P.boughDx, by, Math.round(r(P.boughW)));
      return burst(L, { x: b.x + b.width, y: by }, R, [...P.tail], R.i(P.tailN[0], P.tailN[1]));
    }
    case 'the climb': {
      const P = SHAPES['the climb'];
      const bank = step(L, c, R, 'bank', P.bank);
      const rise = Math.round(R.r(P.rise[0], Math.max(P.rise[0], Math.min(P.rise[1], bank.y - K.limit.yMin))));
      const vx = bank.x + bank.width + P.vineDx;
      L.V.push({ id: -1, x: vx, topY: bank.y - rise - P.vineTop, bottomY: bank.y, swaySpeed: 0, swayPhase: 0, vineType: 'tree_climb' } as Vine);
      const b = plat(L, 'branch', vx + P.boughDx, bank.y - rise, Math.round(r(P.boughW)));
      return { x: b.x + b.width, y: b.y };
    }
    case 'bounce mound': {
      const P = SHAPES['bounce mound'];
      L.bounceTaught = true;
      const pad = step(L, c, R, 'bank', Math.round(P.pad * L.wScale));
      const perch = plat(L, 'branch', pad.x + pad.width - P.perchBack, pad.y - P.perchUp, P.perchW);
      (perch as Platform & { perch?: boolean }).perch = true;
      plat(L, 'mushroom', pad.x + pad.width - P.mushBack, perch.y - 30, P.mushW);
      L.mushrooms++;
      const top = plat(L, 'bank', pad.x + pad.width + P.moundDx, pad.y - Math.round(r(P.rise)), Math.round(r(P.moundW) * L.wScale));
      return burst(L, { x: top.x + top.width, y: top.y }, R, [...P.tail], P.tailN, [...P.tailSteps]);
    }
    case 'double gap': {
      const P = SHAPES['double gap'];
      let e = step(L, c, R, 'bank', Math.round(r(P.bank) * L.wScale));
      for (let k = 0; k < P.count; k++) {
        const g = doubleGap(L, e.y, 0);
        const b = plat(L, k === 1 ? P.middle : 'bank', e.x + e.width + g, e.y, Math.round(r(P.landW) * L.wScale));
        L.P.push({ id: L.pid++, x: e.x + e.width - P.catchBack, y: e.y + P.catchDrop, width: g + P.catchExtra, height: 24, type: 'solid', style: 'branch', catch: true } as Platform);
        // (a petal at the top of the double's arc over each gap, 130 px over the take-off: past a single's reach, so the gap asks for the
        // double: 1-5's test node's three double pickups, the designer 11-06)
        if (L.arcPetals) L.C.push({ id: L.cid++, type: 'flower', x: Math.round(e.x + e.width + g / 2), y: e.y - 130, collected: false, bobPhase: 0 } as Collectible);
        e = b;
      }
      return { x: e.x + e.width, y: e.y };
    }
    case 'double chain': {
      const P = SHAPES['double chain'];
      let e = step(L, c, R, 'bank', Math.round(r(P.bank) * L.wScale));
      const k0 = R.i(P.count[0], P.count[1]);
      for (let k = 0; k < k0; k++) {
        const dy = Math.round(r(P.rise));
        const g = doubleGap(L, e.y, dy);
        const kind = P.kinds[k], ws = P.widths[k];
        const b = plat(L, kind, e.x + e.width + g, e.y - dy, Math.round(R.r(ws[0], ws[1]) * (kind === 'branch' ? 1 : L.bs)));
        L.P.push({ id: L.pid++, x: e.x + e.width - P.catchBack, y: e.y + P.catchDrop, width: g + P.catchExtra, height: 24, type: 'solid', style: 'branch', catch: true } as Platform);
        e = b;
      }
      return { x: e.x + e.width, y: e.y };
    }
    case 'top branch': {
      const b = step(L, c, R, 'branch', Math.round(r(SHAPES['top branch'].w)));
      return { x: b.x + b.width, y: b.y };
    }
    case 'crumbling ledge': {
      const P = SHAPES['crumbling ledge'];
      let e = step(L, c, R, 'bank', Math.round(r(P.bank) * L.wScale));
      const k0 = L.easy ? P.easyCount : R.i(P.count[0], P.count[1]);
      for (let k = 0; k < k0; k++) {
        if (k > 0) { burst(L, { x: e.x + e.width, y: e.y }, R, ['bank'], 1, [...P.hopSteps]); e = L.P[L.P.length - 1]; }
        const g = Math.round(r(P.gap));
        plat(L, 'crumble', e.x + e.width - P.back, e.y + P.setIn, g + P.overlap);
        e = plat(L, 'bank', e.x + e.width + g, e.y, Math.round(r(P.landW) * L.wScale));
      }
      return { x: e.x + e.width, y: e.y };
    }
    case 'bank walk': {
      const P = SHAPES['bank walk'];
      if (L.easy) {
        const Q = P.easy;
        const e1 = step(L, c, R, 'log', Q.first);
        const mid = burst(L, { x: e1.x + e1.width, y: e1.y }, R, ['log'], 1, [...Q.midSteps], Q.midGap, Q.mid);
        const e2 = burst(L, mid, R, ['bank'], 1, [...Q.midSteps], Q.midGap, Q.second);
        const e3 = L.P[L.P.length - 1];
        // (the petal arc over the hop between them)
        for (let k = 0; k < Q.petals; k++) L.C.push({ id: L.cid++, type: 'flower', botanicalVariant: k % 2 ? 'orchid' : 'hibiscus', x: Math.round(e1.x + e1.width - 60 + k * 45), y: Math.round(Math.min(e1.y, e3.y) - 50 - Math.sin((k / (Q.petals - 1)) * Math.PI) * 60), collected: false, bobPhase: k * 0.9 } as Collectible);
        return e2;
      }
      const b1 = step(L, c, R, 'bank', Math.round(r(P.normal.bank)));
      const b2 = step(L, { x: b1.x + b1.width, y: b1.y }, R, 'stone', Math.round(r(P.normal.stone)));
      return { x: b2.x + b2.width, y: b2.y };
    }
    case 'rotten-branch drop': {
      const P = SHAPES['rotten-branch drop'];
      const save = band;
      band = { yMin: band.yMin, yMax: Math.max(band.yMax, c.y + 60 + P.room) };
      let e = burst(L, c, R, ['branch'], 1);
      for (const [kind, dy, gap] of P.drops) e = burst(L, e, R, [kind], 1, [dy], gap);
      band = save;
      return e;
    }
    case 'push block': throw new Error('push block is in the library but the mixer does not lay it yet');
    default: throw new Error(`idea "${name}" has no recipe in the library and no shape in the mixer`);
  }
}


/** each floor idea's kinds, and the wide kind that holds a canopy's mushroom */
const FLOOR_KINDS: Record<string, { host: string; kinds: string[][] }> = {
  // (the long piece each stretch ends on, turning stretch by stretch so no two stretches repeat it: the gate's "something new")
  'bank hops': { host: 'bank', kinds: [['log'], ['stone'], ['bank']] },
  'stump hop': { host: 'bank', kinds: [['stone'], ['log'], ['stone']] },
  // (the creek's host is its near bank and its long end piece the far one: the water lies between them, waterRun)
  'lily-pad hop': { host: 'bank', kinds: [['lily']] },
  'log jam': { host: 'log', kinds: [['bank'], ['log'], ['stone']] },
};

/**
 * A floor idea with a canopy over it (the designer's rulings 1 and 4 on the CP3 miss): the floor idea's own pieces, in three short
 * stretches; each starts on a wide host piece with a mushroom on a perch beside the lane, 46 px over the floor, so walking on passes
 * under it and only a hop onto it bounces him up. The boughs run from just past the mushroom to 90 px into the stretch's last floor
 * piece, a long one, so stepping or jumping off their end lands on floor:
 *   - 135 px or more over the highest floor under them, so the two roads count as a split (120 px);
 *   - no more than 215 px over the lowest, so a jump off a bough (about 180 px up) down to the floor falls less than LONG_FALL (400 px).
 * The length counts for the floor idea; the canopy is its split.
 */
function canopied(L: Lay, name: Idea, c: Cursor, R: Rng): Cursor {
  const fk = FLOOR_KINDS[name];
  let e = c;
  const turn = R.i(0, 2);
  // (3 stretches on both settings: the designer's first fix for Easy's density, 2 on Easy, dropped Easy's splits to 18, under the floor)
  for (let s = 0; s < 3; s++) {
    // (the host is a medium piece, 240-290 px, never long like the stretch's end piece; it steps up 30-50 or down 70, and the floor after it steps down 30-40: the perch, 46 px over the host, then never sits
    // within 20 px of a piece beside it, so no landing next to it is flat)
    // (the designer's review D: each canopy is entered a different way from the one before, by a mushroom, a climb vine or a bough
    // step, and the stage has no more mushrooms than the old 1-1)
    const ways = (['mushroom', 'vine', 'step'] as Entry[]).filter((w) => w !== L.entry && (w !== 'mushroom' || (L.mushrooms < K.mushroomCap && L.bounceTaught !== false)));
    const way = R.pick(ways);
    L.entry = way;
    // (a step entry's host never steps down 70: the step, 80 px over it, would sit flat with the piece before)
    burst(L, e, R, [fk.host], 1, way === 'step' ? [30, 40, 50] : [30, 40, 50, -70], undefined, Math.min(Math.round(290 * L.bs), Math.round(R.r(240, 280) * L.wScale)));
    const host = L.P[L.P.length - 1];
    let bx = host.x + 160;
    let entryY: number | undefined;
    if (way === 'mushroom') {
      // (on a perch 46 px over the floor, beside the lane: walking on passes under it, and only a hop onto it bounces him up)
      const perch = plat(L, 'branch', host.x + 105, host.y - 46, 80);
      (perch as Platform & { perch?: boolean }).perch = true;
      plat(L, 'mushroom', host.x + 110, perch.y - 30, 70);
      L.mushrooms++;
    } else if (way === 'vine') {
      // (a climbing vine from the host up to the first bough's left end, as "the climb" lays it (CP2 cp2-climb.out); walking past a vine
      // never grabs it, only up does)
      const vx = host.x + 150;
      entryY = host.y - 175;
      L.V.push({ id: -1, x: vx, topY: entryY - 30, bottomY: host.y, swaySpeed: 0, swayPhase: 0, vineType: 'tree_climb' } as Vine);
      bx = vx + 13;
    } else {
      // (a short bough 80 px over the host, one hop up, and the canopy one more hop over it: a bough stair of two steps)
      const st = plat(L, 'branch', host.x + 80, host.y - 80, 90);
      (st as Platform & { perch?: boolean }).perch = true;
      entryY = host.y - 155;
      bx = st.x + st.width + 25;
    }
    // (the floor stays within 40 px of the host's height under the canopy, so the boughs fit both limits)
    const save = band;
    band = { yMin: host.y, yMax: host.y + 40 };
    // (the creek's stretch is a lily pad and a log after the host; the others one wide piece of their own kinds)
    const from = L.P.length;
    const ks = fk.kinds[(turn + s) % fk.kinds.length];
    // (on Easy the end piece is a rest (the designer's pacing ruling A): its first part about 600-640 px, 2.0-3.0 s of quiet, then a short
    // second part 30 px up; a canopy ran 27-30 s on Easy with no 2 s rest)
    // (about 600-640 px: 2.0-3.0 s of quiet off either road; at 720-800 it read 3.4 s, over the gate's 3 s dead walk)
    // (on Normal too, the designer's two-road fix, 11-05: its rest is this piece, 520-560 px flat then the short step, about 1.1 s of quiet
    // off the boughs, so the rest keeps both roads over it; no separate pad follows a canopied burst)
    const endW = () => Math.round(L.easy ? R.r(770, 820) : R.r(650, 700));
    const wet = IDEAS[name].element === 'water';
    // (one pad a stretch, as the creek's canopy always laid it: the host, a pad, the long end piece)
    let end = wet ? waterRun(L, { x: host.x + host.width, y: host.y }, R, IDEAS[name].lay!.kinds as string[], 1, endW())
      : burst(L, { x: host.x + host.width, y: host.y }, R, [ks[0]], 1, [-30, -40], undefined, endW());
    // (the long end piece is two, touching, the second 30 px up: a hop to make on the walk out from under the canopy, never a gap to
    // fall in (the fun gate's dead walks: a 2 s walk with nothing to do, 12 of them at canopy ends))
    const m1 = L.P[L.P.length - 1];
    const full = m1.width;
    // (60/40, so the second half is short and the first medium: two sizes, the gate's "something new")
    m1.width = full - Math.round(L.easy ? R.r(160, 190) : R.r(120, 150));
    // (on Easy the rest is one of the pads `padLogs` may turn to a log where the gate would run too long with nothing new; on Normal it
    // is a rest a mark may stand at the end of, `clearPiece`)
    L.padSet.add(m1);
    const m2 = plat(L, wet ? 'bank' : ks[0], m1.x + m1.width, m1.y - 30, full - m1.width);
    end = { x: m2.x + m2.width, y: m2.y };
    const floor = L.P.slice(from).concat(host);
    const hi = Math.min(...floor.map((q) => q.y)), lo = Math.max(...floor.map((q) => q.y));
    band = { yMin: lo - 215, yMax: hi - 135 };
    // (the boughs end 110 px into the stretch's long end piece, its two halves 330-380 px in all: a running jump off their end carries
    // about 240 px, and lands on that floor, never in the gap past it (cp3-ft: the adult's pit lives after the first rebuild))
    // (on Normal the boughs run on over the rest, ending 260 px before its end, so the rest keeps two roads and a running jump off them
    // (about 240 px) still lands on it)
    const xEnd = L.easy ? m1.x + 110 : Math.max(m1.x + 110, m1.x + m1.width - 260);
    const by = entryY ?? Math.round(Math.max(band.yMin, Math.min(band.yMax, hi - R.r(150, 175))));
    // (boughs at the dial's typical landing, 170-240 px; not widened on Easy, where the high road is the optional one and wider boughs
    // all fell in one size band, which broke the gate's "something new")
    const bw = () => Math.round(R.r(170, 240));
    // (the first bough is short, 130-160 px, so the creaky limbs after it fill the canopy)
    // (off a climb vine or a bough step the first bough is creaky too: he steps on from the vine or the step, as the old 1-1's trees hand
    // him to a limb; a mushroom's bounce lands on a bough that holds)
    L.boughing = true;
    const b0 = plat(L, way !== 'mushroom' && L.creakyTaught ? 'creaky' : s === 1 ? 'bridge' : 'branch', bx, by, Math.round(R.r(130, 160)));
    let bc: Cursor = { x: b0.x + b0.width, y: by };
    // (the boughs step between the band's top and bottom, 50 px or more apart, so no two sit flat)
    for (let guard = 0; guard < 9 && bc.x < xEnd - 100; guard++) {
      const to = bc.y > (band.yMin + band.yMax) / 2 ? band.yMin : band.yMax;
      // (every bough after the first is a creaky limb: the stage's theme (the designer's review E), over floor, so a snap drops him onto
      // the low road, never into a pit; the first, where he lands from the entry, holds)
      bc = burst(L, bc, R, [L.creakyTaught ? 'creaky' : 'branch'], 1, [bc.y - to], undefined, Math.round(R.r(120, 170)));
    }
    // (the last bough ends over the floor: trimmed back to 90 px into it, never under 100 px)
    L.boughing = false;
    for (const q of L.P.slice(L.P.indexOf(b0))) (q as Platform & { bough?: boolean }).bough = true;
    const lb = L.P[L.P.length - 1];
    if (lb.x + lb.width > xEnd) lb.width = Math.max(100, Math.round(xEnd - lb.x));
    // (a creaky limb over the creek holds: a snap drops him onto the low road, never into the water (this canopy's own rule above))
    const z = wet ? L.water[L.water.length - 1] : undefined;
    if (z) for (const q of L.P.slice(L.P.indexOf(b0))) if (q.type === 'fragile' && q.x < z.x1 && q.x + q.width > z.x0) { q.type = 'solid'; delete (q as { creak?: number }).creak; }
    band = save;
    e = end;
  }
  return e;
}

/**
 * Easy's breather (the designer's ruling on the fun gate, 11-05 ~2:26 AM): a flat, safe pad, 600-680 px, about 2.1-2.4 s at a run (a rest of 2 s
 * or more, under the gate's 2.5 s of dead time), with breadcrumb petals only.
 */
function breather(L: Lay, c: Cursor, R: Rng): Cursor {
  L.pads = (L.pads ?? 0) + 1;
  // (a bank: logs would crowd out creaky, the stage's theme, from its 3 commonest kinds; the bank's width turns, 600-680, so no two pads
  // are one size twice running)
  // (a bank: logs would crowd out creaky, the stage's theme, from its 3 commonest kinds; its width turns, 600 or 680. The finished stage
  // turns a pad into a log only where it would otherwise run too long with nothing new: see `padLogs`)
  const pad = step(L, c, R, 'bank', L.pads % 2 ? 600 : 680);
  L.padSet.add(pad);
  for (let px = pad.x + 120; px < pad.x + pad.width - 80; px += 170) L.C.push({ id: L.cid++, type: 'flower', botanicalVariant: 'orchid', x: Math.round(px), y: pad.y - 40, collected: false, bobPhase: (px * 0.031) % 6.28 } as Collectible);
  return { x: pad.x + pad.width, y: pad.y };
}

/**
 * The finished Easy stage, read the way the variety gate reads it (`reference/engine/cp1/measure2.py`: a landing is new when its kind x size
 * is not among the six landings before it, in order of their middles): where more than 1,400 px pass with nothing new and a breather pad
 * lies in that stretch, the pad becomes a long log, which is new there. Only where it is needed: as a rule, log pads pushed creaky out of
 * Easy's 3 commonest kinds on 13 of 16 rolls. (Layout 10 Easy ran 1,585 px with nothing new, over the gate's 1,516.)
 */
function padLogs(L: Lay) {
  const kindOf = (p: Platform): string => {
    const q = p as Platform & { creak?: number; catch?: boolean; lily?: boolean };
    const k = p.type === 'bouncy' ? 'mushroom' : p.type === 'fragile' ? (q.creak ? 'creak' : 'twig') : p.style === 'canopy_bridge' ? 'bridge' : p.style === 'log' ? 'log'
      : p.style === 'branch' ? (q.catch ? 'catch' : 'branch') : p.style === 'moss_stone' ? (p.height > 60 ? 'ground' : 'stone') : q.lily ? 'lily' : 'ground';
    const b = (p as { bough?: boolean }).bough ? 1 : L.bs;
    return `${k} ${p.width < 150 * b ? 's' : p.width <= 300 * b ? 'm' : 'l'}`;
  };
  for (let pass = 0; pass < 4; pass++) {
    const ls = [...L.P.map((p) => ({ m: p.x + p.width / 2, k: kindOf(p), p: p as Platform | null })), ...L.V.map((v) => ({ m: v.x, k: v.vineType === 'tree_climb' ? 'climb' : 'liana', p: null }))].sort((a, b) => a.m - b.m);
    let last = -1, fixed = false;
    for (let i = 0; i < ls.length && !fixed; i++) {
      if (ls.slice(Math.max(0, i - 6), i).some((q) => q.k === ls[i].k)) continue;
      if (last >= 0 && ls[i].m - ls[last].m > 1400) {
        // (a long log, or a bank where a long log is among the six before it: whichever is new there)
        for (let j = last + 1; j < i && !fixed; j++) {
          const q = ls[j];
          if (!q.p || !L.padSet.has(q.p)) continue;
          const before = ls.slice(Math.max(0, j - 6), j).map((o) => o.k);
          // (or a long rope bridge where both a long log and a long bank are among the six before it: 1-1's canopy ends)
          const to = !before.includes('log l') && q.p.style !== 'log' ? { style: 'log', height: 90 } : !before.includes('ground l') && q.p.style !== 'moss_stone' ? { style: 'moss_stone', height: 120 } : !before.includes('bridge l') && q.p.style !== 'canopy_bridge' ? { style: 'canopy_bridge', height: 24 } : null;
          if (to) { Object.assign(q.p, to); fixed = true; }
        }
      }
      last = i;
    }
    if (!fixed) break;
  }
}

/**
 * Normal's breath (the designer's pacing ruling B, 11-05): after every second burst, a flat bank of 400-440 px: about 1.0-1.2 s of quiet
 * between landing on it and leaving it (300-340 px measured under the inspector's 1.0 s split),
 * so no Normal run goes longer than main's 1-5 (29 s) without a rest. Easy has its own breathers.
 */
function normalPad(L: Lay, c: Cursor, R: Rng): Cursor {
  if (L.easy) return c;
  L.nb = (L.nb ?? 0) + 1;
  if (L.nb % 2) return c;
  const pad = step(L, c, R, 'bank', Math.round(R.r(400, 440)));
  return { x: pad.x + pad.width, y: pad.y };
}

/**
 * A fork's crossings (the designer's ruling 1 on the CP3 rebuild): a step-down halfway along the high road, a middle ledge in one of its
 * gaps over the low road, so a player who wants the low road drops twice (each under 220 px, inside LONG_FALL with a jump), and later a
 * climbing vine from the low road up to the start of a high-road piece. Each is placed only where the two roads line up for it; what
 * could not be placed is written to `explain`.
 */
function crossings(L: Lay, hi: Platform[], lo: Platform[], job: string) {
  const mid = (hi[0].x + hi[hi.length - 1].x + hi[hi.length - 1].width) / 2;
  const downs: Array<{ H: Platform; W: Platform; d: number }> = [];
  for (let k = 0; k + 1 < hi.length; k++) {
    const H = hi[k], end = H.x + H.width;
    if (H.x + H.width > mid + 1500) break;
    for (const W of lo) if (W.x <= end + 20 && W.x + W.width >= end + 170 && W.y - H.y >= 200 && W.y - H.y <= 440) downs.push({ H, W, d: Math.abs(end - mid) });
  }
  downs.sort((a, b) => a.d - b.d);
  const dn = downs[0];
  let made = '';
  if (dn) {
    const m = plat(L, 'stone', dn.H.x + dn.H.width + 10, Math.round((dn.H.y + dn.W.y) / 2), 130);
    (m as Platform & { crossing?: boolean; stepDown?: boolean }).crossing = true;
    (m as Platform & { stepDown?: boolean }).stepDown = true;
    made += 'step-down';
  }
  const ups: Array<{ H: Platform; W: Platform; d: number }> = [];
  for (const H of hi) {
    if (H.x < mid + 300) continue;
    for (const W of lo) if (H.x >= W.x + 60 && H.x <= W.x + W.width - 20 && W.y - H.y >= 170 && W.y - H.y <= 600) ups.push({ H, W, d: H.x - mid });
  }
  ups.sort((a, b) => a.d - b.d);
  const up = ups[0];
  if (up) {
    L.V.push({ id: -1, x: up.H.x - 2, topY: up.H.y - 30, bottomY: up.W.y, swaySpeed: 0, swayPhase: 0, vineType: 'tree_climb' } as Vine);
    made += (made ? ' + ' : '') + 'climb up';
  } else {
    // (where no high piece starts over a low one: the vine stands at a low piece's end, and a short ledge at its top runs on to the next
    // high piece, at its height, a plain hop short of it)
    for (const W of lo) {
      const vx = W.x + W.width - 20;
      if (vx < mid + 200) continue;
      const H = hi.find((q) => q.x > vx + 120 && q.x - vx <= 420 && W.y - q.y >= 170 && W.y - q.y <= 600);
      if (!H) continue;
      const lx = vx + 13, lw = H.x - 50 - lx;
      if (lw < 70) continue;
      L.V.push({ id: -1, x: vx, topY: H.y - 30, bottomY: W.y, swaySpeed: 0, swayPhase: 0, vineType: 'tree_climb' } as Vine);
      const ledge = plat(L, 'branch', lx, H.y, lw);
      (ledge as Platform & { crossing?: boolean }).crossing = true;
      made += (made ? ' + ' : '') + 'climb up (vine and ledge)';
      break;
    }
  }
  L.explain.push({ node: -1, job, idea: `crossings: ${made || 'none could be placed'}`, x0: Math.round(mid), x1: Math.round(mid), why: 'the designer\'s ruling 1 on the CP3 rebuild' });
}

/**
 * The trees and posts that hold the pieces in the air (P-2, P-7, P-11, S-4). A piece is in the air when it is a bough, a log, a crumbling
 * ledge or a creaky limb; banks and stones are ground. Two boughs side by side share one tree in the gap between them; a lone bough has its
 * own under its middle; a bridge gets a thin post at each end; the perch a short stump. Each trunk runs from just under its piece's top to the
 * first bank under it, or past the stage's bottom.
 */
function supports(P: Platform[], height: number, clear: number[] = [], water: ReadonlyArray<{ x0: number; x1: number; y: number }> = []): { trunks: Array<{ x: number; topY: number; bottomY: number; w: number; art?: 'plain'; holdY?: number }>; leaves: Array<{ x: number; y: number; w: number; flip?: boolean; kind?: 'bushWide' | 'bushTall' }> } {
  type T = { x: number; topY: number; bottomY: number; w: number; art?: 'plain'; holdY?: number };
  const out: T[] = [];
  const leaves: Array<{ x: number; y: number; w: number; flip?: boolean; kind?: 'bushWide' | 'bushTall' }> = [];
  // (the first solid surface under a trunk's top: the floor, a bank, a low-road piece or a creek's water, as the draw fits it (protoArt.ts
  // fitTrunks); a stump stands on it and never runs on down through the low road (the designer's 12:52 condition 2). Before, only a
  // bank of earth counted, so a trunk ran down through a log or a bough under it)
  const floorOf = (x: number, y: number) => {
    const under = P.filter((q) => trunkGround(q) && q.x - 2 <= x && q.x + q.width + 2 >= x && q.y > y + 8).map((q) => q.y);
    for (const z of water) if (x > z.x0 && x < z.x1 && z.y > y + 8) under.push(z.y);
    return under.length ? Math.min(...under) : null;
  };
  // (each tree its own width and, tree by tree, the vine-wrapped kapok or the bare one: never two neighbours alike (S-4))
  // (and a tree goes on up past its boughs, 320-420 px, to a leafy crown: the upright screen's top half holds the canopy, never empty sky
  // (P-6, S-7); a post, a stump or a lily's stem stops at its piece)
  const tree = (x: number, top: number, w: number, crown = true) => {
    // (at the x it is drawn at: the surface under it is looked for there, never half a pixel off a piece's end)
    x = Math.round(x);
    const fl = floorOf(x, top - 16);
    const k = out.length;
    // (a crown only where no other is within 360 px: a canopy line overhead, not a wall of leaves in front of the play, round-2 stills)
    const want = 400 + ((k * 53) % 4) * 20;
    // (a crown only where nothing stands over it. Where a higher piece does, the tree rises to that piece's underside and holds it too,
    // one trunk and boughs at two heights (S-4), with no crown: a crown grown on up behind it was cut off by the draw at that piece
    // (fitTrunks), and a crownless trunk stopping at its bough read as a stump with a plank on it (the stills, 11-05))
    const over = P.filter((q) => q.x - 2 <= x && q.x + q.width + 2 >= x && q.y + q.height <= top && q.y > top - want - 12).map((q) => q.y + q.height);
    const room = crown && !leaves.some((l) => Math.abs(l.x - x) < 360) && !over.length;
    const reach = crown && over.length ? top - (Math.max(...over) - UNDER_IN) : 0;
    // (a tree kept from its leaves only by a crown near it still rises bare, as its neighbours do: stopping at its bough left a stump)
    const rise = crown && !over.length ? want : reach >= 30 ? reach : 0;
    out.push({ x: Math.round(x), topY: Math.round(top - rise), bottomY: Math.round(fl !== null ? fl + FOOT_IN : height + 200), w: w * (0.85 + ((k * 37) % 7) * 0.07), ...(k % 2 ? { art: 'plain' as const } : {}), ...(rise ? { holdY: Math.round(top) } : {}) });
    if (room) leaves.push({ x: Math.round(x), y: Math.round(top - rise + 30), w: 160 + ((k * 29) % 4) * 20, flip: k % 2 === 1, kind: 'bushWide' });
  };
  // (a piece in the creek, its middle over the water and its foot under the surface, stands in the water: a pad floats, a log or a reed
  // isle rises out of it; no stem and no trunk)
  const wet = (p: Platform) => water.some((z) => p.x + p.width / 2 > z.x0 && p.x + p.width / 2 < z.x1 && p.y + p.height > z.y);
  // (a piece the kit paints as a bank of earth (a 90 px log too) is ground, its body to the floor: no trunk, as the draw drops one under
  // it (protoArt.ts fitTrunks))
  const air = P.filter((p) => !wet(p) && !paintedBank(p) && p.type !== 'bouncy' && !(p as { catch?: boolean }).catch && !(p as { art?: string }).art
    && (p.style === 'branch' || p.style === 'canopy_bridge' || p.style === 'log' || p.style === 'ruin' || p.type === 'fragile')).sort((a, b) => a.x - b.x);
  // (a lily pad or a reed isle over the drop stands on a thin stem down to the ground (S-2: nothing above the water line floats))
  for (const p of P) if (!wet(p) && ((p as { lily?: boolean }).lily || (p.style === undefined && p.height === 30 && p.type === 'solid'))) tree(p.x + p.width / 2, p.y + 10, 0.45, false);
  // (would a full trunk at x put 4 in some screen's width, anywhere it is seen? every 1,400 px window that holds x)
  const crowded = (x: number) => {
    const xs = out.filter((t) => t.w >= 0.9 && Math.abs(t.x - x) < SCREEN).map((t) => t.x);
    return xs.some((a) => a <= x && xs.filter((b) => b >= a && b < a + SCREEN).length >= 3 && x < a + SCREEN) || xs.filter((b) => b >= x && b < x + SCREEN).length >= 3;
  };
  const done = new Set<Platform>();
  for (let i = 0; i < air.length; i++) {
    const p = air[i];
    if (done.has(p)) continue;
    const perch = !!(p as { perch?: boolean }).perch;
    // (a trunk meets its piece's underside, a few px into it: a log of any height (the designer's 12:52 condition 1: at y + 50 a thin
    // log hovered 20 px over its stump), a bough 16 px down)
    const top = (q: Platform) => q.y + (q.style === 'log' ? q.height - UNDER_IN : 16);
    if (p.style === 'canopy_bridge') {
      // (a bridge hangs from a thin post at each end, P-11)
      for (const x of [Math.round(p.x + 12), Math.round(p.x + p.width - 12)]) { const fl = floorOf(x, p.y); out.push({ x: Math.round(x), topY: Math.round(top(p)), bottomY: Math.round(fl !== null ? fl + FOOT_IN : height + 200), w: 0.5 }); }
      continue;
    }
    if (perch) { tree(p.x + p.width / 2, top(p), 0.7, false); continue; }
    // (a log on a stump: a short trunk under its middle, no crown, never a tree)
    if ((p as { stump?: boolean }).stump) { tree(p.x + p.width / 2, top(p), 0.8, false); continue; }
    // (two boughs side by side, a short gap and a step between them, grow from one tree standing in the gap (S-4: like the old 1-1's
    // canopy, one trunk and its boughs at two heights))
    // (never a log on a stump: it has its own stump (the designer's 12:52 condition 1))
    const q = air.slice(i + 1).find((o) => !done.has(o) && o.style !== 'canopy_bridge' && !(o as { perch?: boolean }).perch && !(o as { stump?: boolean }).stump && o.x >= p.x + p.width - 10);
    // (the designer's trunk rule after Matt's play, 11-05: boughs up to 220 px apart share one tree, and no more than 3 full trunks stand
    // in a screen's width; a bough past that hangs from a shared trunk on that screen and takes none of its own. Stills v9's
    // sideways bank end had six alike, evenly spaced: a forest of poles)
    if (q && q.x - (p.x + p.width) <= 220 && Math.abs(q.y - p.y) <= 140) {
      done.add(q);
      const x = (p.x + p.width + q.x) / 2;
      if (!crowded(x)) tree(x, Math.min(top(p), top(q)), 1.25);
      continue;
    }
    if (out.some((t) => Math.abs(t.x - (p.x + p.width / 2)) < 160 && Math.abs(t.topY - top(p)) < 80)) continue;
    if (crowded(p.x + p.width / 2)) continue;
    tree(p.x + p.width / 2, top(p), 1.15);
  }
  // (a bough the trunk cap left far from every tree (more than 300 px past its end) stands on a thin post, half a trunk wide: nothing
  // floats. The designer's rule wants it hung from a shared trunk's side branch, which is art the kit does not have yet)
  for (const p of air) {
    if (p.style === 'canopy_bridge' || (p as { perch?: boolean }).perch) continue;
    const m = Math.round(p.x + p.width / 2);
    // (held only by a trunk within 220 px of it that reaches its height: the designer's label, the same rule E3's check reads (support.ts);
    // one 300 px off along x alone, whatever its height, left 1-5's creaky limbs over a trunk that stopped below them)
    if (out.some((t) => holds(t, p))) continue;
    const fl = floorOf(m, p.y);
    out.push({ x: Math.round(m), topY: Math.round(p.y + 16), bottomY: Math.round(fl !== null ? fl + FOOT_IN : height + 200), w: 0.55 });
  }
  // (on the long banks where no tree stands within 500 px, a tree grows from the bank itself, set back, so the start, the rests and the
  // shrine have their canopy overhead too (S-7))
  for (const b of P.filter((q) => q.style === 'moss_stone' && q.height >= 90 && q.width >= 300)) {
    for (let x = b.x + 120; x < b.x + b.width - 120; x += 520) {
      if (out.some((t) => Math.abs(t.x - x) < 500)) continue;
      // (never in front of a flag, the start or the shrine: v5's start tree hid the first flag)
      if (clear.some((c) => Math.abs(c - x) < 200)) continue;
      if (crowded(x)) continue;
      // (nothing over it up to its crown: the draw would stop it there, a stub hanging over the bank)
      if (P.some((q) => q !== b && q.x - 2 <= x && q.x + q.width + 2 >= x && q.y < b.y && q.y > b.y - 572)) continue;
      const k = out.length;
      out.push({ x: Math.round(x), topY: Math.round(b.y - 560), bottomY: Math.round(b.y + FOOT_IN), w: 1.3 * (0.85 + ((k * 37) % 7) * 0.07), ...(k % 2 ? { art: 'plain' as const } : {}) });
      if (!leaves.some((l) => Math.abs(l.x - x) < 360)) leaves.push({ x: Math.round(x), y: Math.round(b.y - 530), w: 180, flip: k % 2 === 1, kind: 'bushWide' });
    }
  }
  // (fitted as the draw fits them, by the one rule (trunkFit.ts): each on the nearest surface under its piece, none under a bank of earth,
  // so a stage's trunks are drawn as they were laid; a crown's leaves go with its trunk)
  const fit = fitTrunks(out, P, water) as T[];
  return { trunks: fit, leaves: leaves.filter((l) => fit.some((t) => Math.abs(t.x - l.x) <= 1)) };
}

/**
 * A stage from its spec (stages.ts): every stage the engine builds goes through here, nothing is built per stage. Normal and Easy draw the
 * same ideas from the same streams (Easy only changes sizes), so a roll is the same stage in both settings.
 */
export function buildFromSpec(config: LevelConfig, seed: number, easy: boolean, spec: StageSpec): GeneratedStage & { proto: ProtoExtras } {
  return buildMix(config, seed, easy, mixOf(spec));
}

/** Pokey's body width (engine.ts: the hero is 44 px wide): no dressing stands within one body width of his spawn */
const BODY_W = 44;
/**
 * The start's dressing, from the stage's brief (1-1: "the squirrels came to watch him leave"): the first stands behind his spawn at the
 * forest's edge where there is room; the rest (all of them, where there is none) stand a few steps apart ahead along the start bank,
 * turned to face him as he sets off. None stands within one body
 * width of his spawn or off the bank. Asserted: a layout that breaks either throws, in every build.
 */
function startDress(names: string[], spawnX: number, bank: Platform): Array<{ n: string; x: number; b: number; flip?: boolean }> {
  const clear0 = spawnX - BODY_W, clear1 = spawnX + BODY_W + BODY_W;
  const out: Array<{ n: string; x: number; b: number; flip?: boolean }> = [];
  let ahead = clear1 + 16;
  names.forEach((n, k) => {
    const w = w1DressWidth(n) || 60;
    // (behind him only where it fits between the bank's end and the clear zone: at 1-1's spawn (x 100) a squirrel is 53 px and the gap 52)
    if (k === 0 && clear0 - 8 - bank.x >= w + 4) out.push({ n, x: Math.round(clear0 - 8 - w / 2), b: bank.y });
    else { out.push({ n, x: Math.round(ahead + w / 2), b: bank.y, ...(w1DressFacing(n) === 'right' ? { flip: true } : {}) }); ahead += w + 34; }
  });
  for (const d of out) {
    const w = w1DressWidth(d.n) || 60, x0 = d.x - w / 2, x1 = d.x + w / 2;
    if (x1 > clear0 && x0 < clear1) throw new Error(`start dressing ${d.n} at x ${d.x} stands within one body width of the spawn (${clear0}-${clear1})`);
    if (x0 < bank.x || x1 > bank.x + bank.width) throw new Error(`start dressing ${d.n} at x ${d.x} stands off the start bank`);
  }
  return out;
}

/** a stage from its node plan */
function buildMix(config: LevelConfig, seed: number, easy: boolean, S: MixSpec): GeneratedStage & { proto: ProtoExtras } {
  // (the band starts at the stage's limits on every build: it was left over from the stage built before, so 1-5 after 1-1 was a different
  // stage from 1-5 built fresh, same seed (found 11-05, tools/engine/probe-order.ts); the snapshot's order check holds it)
  K = kitFor(config.worldIndex);
  band = { ...K.limit };
  const PLAN = S.plan;
  const nid = (i: number) => nidOf(PLAN, i);
  // (the difficulty dial, ENGINE-SPEC: d from the world and stage; the gap is this share of the gate's widest)
  const d = (0.1 * (config.worldIndex - 1) + 0.2 * (config.miniIndex - 1) / 8) / 1.1;
  const gapShare = easy ? 0.45 + 0.35 * d : 0.55 + 0.37 * d;
  const riseShare = easy ? 0.4 + 0.4 * d : 0.5 + 0.45 * d;
  // (Easy's wider landings come from the engine's own Easy pass, easyMode.ts easyStage, which widens a ledge by its jump; the mixer widening
  // them too doubled it and pushed medium pieces into long, which broke the gate's "something new". Measured after that pass)
  // (the designer's pacing ruling A, 11-05: a calmer Easy, its landings about 300 px on its own size bands, Normal's times EASY_BS. The
  // fixed pieces (canopy hosts and ends) scale with it; the boughs over them do not: the high road is the optional one)
  const wScale = easy ? EASY_BS : 1;
  const L: Lay = { P: [], V: [], C: [], hints: [], flags: [], marks: [], explain: [], pid: 1, cid: 1, easy, gapShare, riseCap: 999, wScale, bs: easy ? EASY_BS : 1, dial: d, mushrooms: 0, glints: [], water: [], recent: [], padSet: new Set(), creakyTaught: false, burstMin: S.burstMin, burstMax: S.burstMax, lowPetals: S.lowPetals, ...(S.plan.some((n) => Array.isArray(n.deck) && n.deck.includes('bounce up') && n.job.startsWith('teach')) ? { bounceTaught: false } : {}) };
  // (the highest rise the gate allows: the largest step up a plain jump makes across a real gap, measured with the gate itself)
  let maxRise = 0;
  for (let dy = 10; dy <= 200; dy += 5) if (gateGap(L, 800, { y: 800 - dy, height: 24, type: 'solid' }, dy) >= MIN_GAP + 10) maxRise = dy;
  L.riseCap = Math.max(30, Math.round(maxRise * riseShare));
  /** what each node rolled (a fork: both roads' ideas), so a later node can be held off it */
  const rolled: Array<string[]> = [];
  let lastIdea: Idea | undefined;
  // (today's frame, kept by the designer: down from the canopy to the floor at dusk; the start is high)
  let c: Cursor = { x: 0, y: S.startY };
  // the start: a flat bank, the spawn on it
  const start = plat(L, 'bank', 0, c.y, 520);
  c = { x: start.width, y: c.y };
  L.flags.push({ x: 100, y: c.y });
  const forkMarks: Array<{ x: number; y: number }> = [];
  const markNodes: Platform[][] = [];
  // (the designer's pacing ruling (3), 11-05: on Easy about 6 nodes keep their canopy and the rest lay one burst, their own idea, with
  // none: the canopy stays on the forks' neighbours and on the node right after a teach or a test. Rests don't count as neighbours)
  const easyKeep = new Set<number>();
  if (easy) {
    const plays = PLAN.map((n, i) => i).filter((i) => PLAN[i].job !== 'rest');
    plays.forEach((i, k) => {
      const n = PLAN[i];
      if (!Array.isArray(n.deck)) { if (k > 0) easyKeep.add(plays[k - 1]); if (k + 1 < plays.length) easyKeep.add(plays[k + 1]); }
      if ((n.job.startsWith('teach') || n.job.startsWith('test')) && k + 1 < plays.length) easyKeep.add(plays[k + 1]);
      if (n.job.startsWith('teach')) easyKeep.add(i);
    });
  }
  PLAN.forEach((n, i) => {
    if (n.easyOnly && !easy) return;
    const R = rngFor(seed, `${S.id} n${i}`);
    if (n.band) band = { yMin: n.band[0], yMax: n.band[1] };
    const x0 = c.x;
    if (n.flagBefore) {
      // (a medium log, not another bank beside the banks around it: the gate's "something new")
      const pad = step(L, c, R, 'log', 280);
      c = { x: pad.x + pad.width, y: pad.y };
    }
    // (Easy's breathers between nodes; none next to a rest node, which is one)
    // (and none right after another: a fork's rejoin already ends on Easy's breather, and two pads in a row ran the gate's "nothing new"
    // to 2,366 px on 1-1)
    if (L.easy && i > 0 && n.job !== 'rest' && PLAN[i - 1].job !== 'rest' && !L.padSet.has(L.P[L.P.length - 1])) c = breather(L, c, R);
    if (n.hint && !n.hintAtEnd) L.hints.push({ x: c.x + 60, text: n.hint, pad: n.padHint ?? n.hint, keys: n.padHint ?? n.hint, ...(c.y >= 600 ? { belowY: c.y - 60 } : { aboveY: c.y + 60 }) } as StageHint);
    const from = L.P.length;
    if (Array.isArray(n.deck)) {
      // (the designer's ruling (a), CP3: a node lays its bursts from its deck, never the same idea twice in a row; the dial sets how
      // many. Every burst comes from the node's own deck (the teach pairs with bank hops); a floor idea carries a canopy (ruling 1 on the
      // CP3 miss). Rest lays one; so do the warm-up and the cool down, under a canopy)
      // (the warm-up lays one too, so the first hard node starts inside LV-9's first 4,000 px and the stage's second flag stands before
      // it, never on the warm-up's easy ground: placement rule 3, the designer's ruling 3 on the CP3 miss. For the designer to confirm)
      const one = n.job === 'rest' || n.job === 'cool down' || n.job === 'warm-up' || !!n.one;
      const off = new Set([...(rolled[i - 1] ?? []), ...(n.not !== undefined ? rolled[n.not - 1] ?? [] : []), ...(n.notLast ? rolled.slice(Math.max(0, i - n.notLast), i).flat() : [])]);
      // (the difficulty dial's bursts per node: 2 at d = 0, 3 at d = 1, ENGINE-SPEC "The difficulty dial")
      // (Easy lays one fewer, the designer's pacing ruling A, so its wider landings hold the length)
      const bare = easy && !easyKeep.has(i);
      const bursts = n.inOrder ? n.deck.length : one || bare ? 1 : n.bursts ?? Math.round(2 + L.dial);
      // (the arc petals over a double gap: the in-order test node's only, laid with no canopy over them)
      L.arcPetals = !!n.inOrder;
      const laid: Idea[] = [];
      // (the move a teach node teaches: its job's last word, "teach double" -> double)
      const taught = n.job.startsWith('teach ') ? n.job.slice(6) : undefined;
      let last = lastIdea;
      for (let k = 0; k < bursts; k++) {
        // (the designer's review C: a node draws only from its own deck; the teach pairs with bank hops (ruling (a)). A node whose deck has
        // nothing left that is not the idea just laid lays no more bursts)
        // (the node's own idea bursts first and its floor idea follows (the designer's ruling (a) on the review); n8's creek pairs a reed
        // or crumbling burst with a floor burst from its deck)
        const ok = (d: Idea) => d !== last && !off.has(d) && !laid.includes(d);
        const ownIdeas = n.deck.filter((d) => !FLOOR.includes(d));
        let cand: Idea[];
        // (a teach's second burst: its deck's own floor idea, not the one just laid; bank hops where it has none (1-5's snap teach))
        if (n.inOrder) cand = [n.deck[k]];
        else if (n.job.startsWith('teach')) { const fl = n.deck.filter((d) => FLOOR.includes(d) && d !== last && !laid.includes(d)); const own = n.deck.filter((d) => IDEAS[d]?.teaches === taught); cand = k === 0 ? (own.length ? own : n.deck.filter(ok)) : fl.length ? fl : k === 1 ? ['bank hops'] : []; }
        else if (k === 0) {
          const own = (ownIdeas.length ? ownIdeas : n.deck).filter(ok);
          cand = own.length ? own : (ownIdeas.length ? ownIdeas : n.deck).filter((d) => d !== last);
        } else {
          const floors = n.deck.filter((d) => FLOOR.includes(d) && ok(d));
          // (a node whose first burst was not a floor must pair it with one: the floor the last nodes laid is allowed then, never the
          // idea just laid)
          cand = floors.length ? floors : !FLOOR.includes(laid[0]) ? n.deck.filter((d) => FLOOR.includes(d) && d !== last && !laid.includes(d)) : [];
        }
        if (!cand.length) break;
        const pick = R.pick(cand);
        if (!n.deck.includes(pick) && !(n.job.startsWith('teach') && pick === 'bank hops')) throw new Error(`${S.id} n${i + 1} drew ${pick}, not in its deck`);
        const bx = c.x;
        // (a floor idea outside a fork and the rest carries a canopy)
        const over = FLOOR.includes(pick) && n.job !== 'rest' && !bare && !n.ground;
        // (and between a node's bursts, so no Easy run goes 20 s without a 2 s rest)
        if (L.easy && k > 0) c = breather(L, c, R);
        c = over ? canopied(L, pick, c, R) : idea(L, pick, c, R);
        // (a canopied burst rests on its own end pieces; the pad comes after every second plain burst)
        if (!over) c = normalPad(L, c, R);
        L.explain.push({ node: i + 1, nid: nid(i), job: n.job, idea: pick, ...(over ? { canopy: true } : {}), x0: bx, x1: c.x, why: `burst ${k + 1} of ${bursts}${over ? ', a canopy over it' : ''}` });
        laid.push(pick);
        last = pick;
      }
      // (a teach lays what it teaches: its own idea, when its deck has one (1-1's n7 once laid two floor bursts and no double gap))
      // (what it teaches is the library's word: the deck's idea that teaches the job's move, "teach jump" -> bank hops)
      const ownOf = n.deck.filter((d) => IDEAS[d]?.teaches === taught);
      if (n.job.startsWith('teach') && ownOf.length && !laid.some((d) => ownOf.includes(d))) throw new Error(`${S.id} n${i + 1} (${n.job}) laid no idea that teaches ${taught}`);
      lastIdea = last;
      rolled[i] = laid;
    } else {
      // the fork: a high road at the cursor and a low road 200 px under it, side by side; they rejoin on one bank
      // (neither road repeats the idea the node before rolled: no idea twice in a row)
      const prev = new Set(rolled[i - 1] ?? []);
      const hiDeck = n.deck.high.filter((d) => !prev.has(d)), loDeck = n.deck.low.filter((d) => !prev.has(d));
      const hi = R.pick(hiDeck.length ? hiDeck : n.deck.high), lo = R.pick(loDeck.length ? loDeck : n.deck.low);
      // (a second idea the node before laid is swapped for a plain hop burst: no idea twice in a row)
      const second = (deck: Idea[], first: Idea): Idea => deck.find((d) => d !== first && !prev.has(d)) ?? (first === 'bank hops' ? 'stump hop' : 'bank hops');
      const hi2 = second(n.deck.high, hi), lo2 = second(n.deck.low, lo);
      rolled[i] = [hi, lo, hi2, lo2];
      // (on Normal the fork bank is a rest pad, 400-440 px (ruling B): the roads carry no pad, and a fork ran 30-31 s without one)
      const forkBank = step(L, c, R, 'bank', L.easy ? 240 : Math.round(R.r(400, 440)));
      // (each road keeps to its own band, 200 px apart, so they never meet: the high road no lower than 60 px under the fork bank,
      // the low road no higher than 60 px over its start)
      // (head room: the high road never comes down toward the low one and the low one never rises toward it, so the roads stay 260 px
      // or more apart: a jump on the low road (100 px up, his body 116 tall) never meets the high road over it)
      // (Easy, the designer's ruling 5 on the CP3 miss: the roads sit within 400 px of each other, so a slip costs nothing there)
      const hy = forkBank.y, ly = hy + (L.easy ? 240 : 260);
      band = { yMin: Math.max(K.limit.yMin, hy - (L.easy ? 60 : 160)), yMax: hy };
      const forkFrom = L.P.length;
      // (each road lays two bursts, its deck's two ideas in turn, so the fork is a real stretch of the stage: the plan's 15-20% each)
      lastIdea = lo2;
      // (on Easy a breather between each road's two bursts, as between a node's)
      // (no breather or pad on a fork's roads (the designer's ruling on the bot's fork stall, 11-05): the high road runs straight into the
      // crossing or the rejoin; the rest comes after the roads rejoin)
      const gap = (e: Cursor) => e;
      const hiEnd = idea(L, hi2, gap(idea(L, hi, { x: forkBank.x + forkBank.width, y: hy }, R)), R);
      // (the low road starts under the gap off the fork bank's end, so running off that end drops him onto it)
      const lowStart = { x: forkBank.x + forkBank.width - 90, y: ly };
      band = { yMin: ly, yMax: ly + (L.easy ? 60 : 160) };
      const lowFrom = L.P.length;
      const loEnd = idea(L, lo2, gap(idea(L, lo, lowStart, R)), R);
      band = { ...K.limit };
      // (rejoin: one long bank 30 px over the low road's end, a gap the gate allows on from it, and long enough to run on under the high
      // road's end, which drops onto it)
      const ry = Math.max(K.limit.yMin, loEnd.y - 30);
      const rx = loEnd.x + Math.min(70, gateGap(L, loEnd.y, { y: ry, height: 120, type: 'solid' }, loEnd.y - ry) - 4);
      // (a long log: after a low road of banks, another long bank was nothing new for 1.6k px)
      const rejoin = plat(L, 'log', rx, ry, Math.max(320, hiEnd.x + 240 - rx));
      L.explain.push({ node: i + 1, nid: nid(i), job: n.job, idea: `${hi} + ${hi2}` as Idea, road: 'high', x0, x1: hiEnd.x, why: `high road from [${n.deck.high.join(', ')}]` });
      L.explain.push({ node: i + 1, nid: nid(i), job: n.job, idea: `${lo} + ${lo2}` as Idea, road: 'low', x0: lowStart.x, x1: loEnd.x, why: `low road from [${n.deck.low.join(', ')}]` });
      // (the fork's petals on the high road only: its reward is the stage's hardest petal group (the designer's ruling (i), 11-05), and a
      // route never has to change roads for one)
      petalsOver(L, forkFrom, lowFrom);
      const hiPs = L.P.slice(forkFrom, lowFrom), loPs = L.P.slice(lowFrom, L.P.length - 1);
      crossings(L, hiPs.filter((q) => q.type !== 'bouncy'), loPs.filter((q) => q.type !== 'bouncy'), n.job);
      // (the low road is the fork's lowest ground: under each of its gaps a catch branch 60 px below the lower lip, reaching 50 px under the
      // far piece, so a missed hop lands on it and a hop goes back up, never down to the stage's bottom. The adult bot lost 3 lives at one
      // n10 gap, and 1.5 a run in all, over the dial's 0.7)
      const lows = loPs.filter((q) => q.type !== 'bouncy').sort((a, b) => a.x - b.x);
      for (let k = 1; k < lows.length; k++) {
        const a = lows[k - 1], b = lows[k];
        if (b.x - (a.x + a.width) < 20) continue;
        const y = Math.max(a.y, b.y) + 60;
        L.P.push({ id: L.pid++, x: a.x + a.width - 30, y, width: b.x + 50 - (a.x + a.width - 30), height: 24, type: 'solid', style: 'branch', catch: true } as Platform);
      }
      // (the fork's two marks where both roads meet: one on the fork bank before the split, one on the rejoin log after it (the designer's
      // ruling (i), 11-05). One per road, joined by crossings, sent every route that took both round the fork again and again, the bots'
      // fork stall and the inspector's Easy loops)
      if (S.marks) {
        forkMarks.push({ x: forkBank.x + forkBank.width / 2, y: forkBank.y });
        forkMarks.push({ x: rejoin.x + rejoin.width / 2, y: rejoin.y });
      }
      c = { x: rejoin.x + rejoin.width, y: ry };
      if (L.easy) c = breather(L, c, R);
      else { L.nb = 1; c = normalPad(L, c, R); }
    }
    // (a safe node (1-1's teaches): a catch branch 60 px under the lower lip of every gap on its floor road, reaching 50 px under the far
    // piece, so a short jump drops onto it and a hop goes back up)
    if (n.safe) {
      const fl = L.P.slice(from).filter((q) => q.type !== 'bouncy' && !(q as { bough?: boolean; catch?: boolean; perch?: boolean }).bough && !(q as { catch?: boolean }).catch && !(q as { perch?: boolean }).perch).sort((a, b) => a.x - b.x);
      for (let k = 1; k < fl.length; k++) {
        const a = fl[k - 1], b = fl[k];
        if (b.x - (a.x + a.width) < 20 || L.P.some((q) => (q as { catch?: boolean }).catch && q.x < b.x && q.x + q.width > a.x + a.width)) continue;
        L.P.push({ id: L.pid++, x: a.x + a.width - 30, y: Math.max(a.y, b.y) + 60, width: b.x + 50 - (a.x + a.width - 30), height: 24, type: 'solid', style: 'branch', catch: true } as Platform);
      }
    }
    if (Array.isArray(n.deck)) petalsOver(L, from);
    if (n.hint && n.hintAtEnd) L.hints.push({ x: c.x - 120, text: n.hint, pad: n.padHint ?? n.hint, keys: n.padHint ?? n.hint, ...(c.y >= 600 ? { belowY: c.y - 60 } : { aboveY: c.y + 60 }) } as StageHint);
    // one of Meeca's marks in each non-fork node, on the main route, on a piece the idea laid (its middle one)
    // (n7b, the second rest, lays no mark: the designer's 13 marks are the plan's nine nodes and the forks' four, and the goal is 10 of them)
    if (S.marks && Array.isArray(n.deck) && !n.id) { const m = clearPiece(L, L.P.slice(from)); if (m) L.marks.push({ x: (m as Platform & { markX?: number }).markX ?? m.x + m.width / 2, y: m.y }); markNodes.push(L.P.slice(from)); }
    // (n9's golden seed: the designer's ruling (b), CP3: no seed on 1-5; Dot's line plays here, the seed waits for the stage that teaches
    // the glide. The far-off glint is dressing only: a twinkle 420 px over the node's highest piece, out of every jump's reach)
    if (n.seed) {
      const ps = L.P.slice(from);
      const top = Math.min(...ps.map((q) => q.y));
      const y = Math.max(40, top - 420);
      // (where the clamp at the stage's top leaves it within a double of a high piece near it (a canopy bridge 134 px under it, seed 1),
      // it moves along the node to where nothing within 200 px is that high: out of every jump's reach, as ruled)
      const clearAt = (x: number) => !L.P.some((q) => q.x <= x + 200 && q.x + q.width >= x - 200 && q.y - y <= DOUBLE_RISE + 60);
      const mid = Math.round((x0 + c.x) / 2);
      const xs = Array.from({ length: Math.floor((c.x - x0) / 40) + 1 }, (_, k) => Math.round(x0 + k * 40)).sort((a, b) => Math.abs(a - mid) - Math.abs(b - mid));
      L.glints.push({ x: xs.find(clearAt) ?? mid, y });
    }
    // (on the node's last solid piece, over its middle, never over the gap past it: markers stand on the path, P-5)
    if (n.heartAfter && !easy) {
      // (and not the piece a mark stands on: the two would overlap, which the level check fails)
      const marked = (q: Platform) => [...L.marks, ...forkMarks].some((m) => m.x >= q.x && m.x <= q.x + q.width && Math.abs(m.y - q.y) < 2);
      const lastP = [...L.P.slice(from)].reverse().find((q) => q.type === 'solid' && !(q as { bough?: boolean }).bough && q.width >= 100 && !marked(q));
      const hx = lastP ? lastP.x + lastP.width / 2 : c.x - 60, hy = lastP ? lastP.y : c.y;
      L.C.push({ id: L.cid++, type: 'heart', x: Math.round(hx), y: hy - 60, collected: false, bobPhase: 0 } as Collectible);
    }
  });
  const end = step(L, c, rngFor(seed, `${S.id} end`), S.end.kind, S.end.w);
  const exit = { x: end.x + 420, y: end.y };
  // (1-5's 15 marks, the designer 11-06, 1.5x the Normal goal of 10: the nodes' and the forks' 13, and a second mark in the longest
  //  nodes, each well clear of the marks laid, until the plan's count is laid)
  for (const ps of [...markNodes].sort((a, b) => b.length - a.length)) {
    if (L.marks.length + forkMarks.length >= S.marks) break;
    const all = [...L.marks, ...forkMarks];
    const m = clearPiece(L, ps.filter((q) => !all.some((k) => Math.abs(k.x - (q.x + q.width / 2)) < 400)));
    if (m) L.marks.push({ x: (m as Platform & { markX?: number }).markX ?? m.x + m.width / 2, y: m.y });
  }
  L.marks.push(...forkMarks);
  for (const m of L.marks) L.C.push({ id: L.cid++, type: 'relic', mark: 'meeca', x: m.x, y: m.y - 34, collected: false, bobPhase: (m.x * 0.017) % 6.28 } as Collectible);
  const find = findForStage(config.worldIndex, config.miniIndex);
  if (find) L.C.push({ id: L.cid++, type: 'find', findId: find.id, hidden: false, x: end.x + 200, y: end.y - 26, collected: false, bobPhase: 0 } as Collectible);
  L.C.push({ id: L.cid++, type: 'exit_totem', x: exit.x, y: exit.y - 30, collected: false, bobPhase: 0 } as Collectible);
  L.V.forEach((v, k) => (v.id = k + 1));
  // (the flags, the designer's ruling 3 on the CP3 miss: LV-9's spacing (easyMode.ts FLAG_SPAN_MAX, 4,000 px from the spawn to the exit)
  // holds, and inside each 4,000 px window the flag stands on the nearest safe spot before the next hard node; with no hard node in a
  // window, LV-9 still puts one at the window's far end. A safe spot: a solid piece 200 px or wider, nothing over it, on no fork road)
  const hardSpans = PLAN.flatMap((n, i) => {
    if (['warm-up', 'rest', 'cool down'].includes(n.job)) return [];
    const es = L.explain.filter((e) => e.node === i + 1);
    return [[Math.min(...es.map((e) => e.x0)), Math.max(...es.map((e) => e.x1))] as [number, number]];
  }).sort((a, b) => a[0] - b[0]);
  const roads = L.explain.filter((e) => e.road);
  const onRoad = (x: number) => roads.some((e) => x > e.x0 - 60 && x < e.x1 + 60);
  const covered = (p: Platform, x: number) => L.P.some((q) => q !== p && q.type !== 'bouncy' && q.x < x + 40 && q.x + q.width > x - 40 && q.y < p.y && p.y - q.y < 160);
  // (every 40 px along a piece, 60 px in from its ends: a long bank with twigs over its middle still has room before them)
  const spots = L.P.filter((p) => p.type === 'solid' && p.width >= 200 && !(p as { catch?: boolean }).catch)
    .flatMap((p) => Array.from({ length: Math.floor((p.width - 120) / 40) + 1 }, (_, k) => p.x + 60 + 40 * k).filter((x) => !covered(p, x) && !onRoad(x)).map((x) => ({ x: Math.round(x), y: p.y })))
    .sort((a, b) => a.x - b.x);
  const SPAN = 3900;
  for (let lastX = 100, guard = 0; exit.x - lastX > SPAN && guard < 40; guard++) {
    const win = spots.filter((q) => q.x > lastX + 400 && q.x <= lastX + SPAN);
    if (!win.length) break;
    // (the hard node the last flag stands before, or in, is its own; the next flag goes before the hard node after that one, so hard
    // ground always lies between two flags)
    const own = hardSpans.findIndex(([, x1]) => x1 > lastX);
    const h = own >= 0 ? hardSpans.slice(own).find(([x0]) => x0 > Math.max(lastX, hardSpans[own][0]) + 50)?.[0] : undefined;
    const before = h !== undefined && h <= lastX + SPAN ? win.filter((q) => q.x < h) : [];
    const pick = before.length ? before[before.length - 1] : win[win.length - 1];
    L.flags.push(pick);
    lastX = pick.x;
  }
  // (stones stand on ground, never on poles (the designer's S-3, round 1): a stone with no bank under it within 250 px is a bough, up
  // in the canopy where a stone cannot be)
  for (const p of L.P) {
    if (!(p.style === 'moss_stone' && p.height === 50)) continue;
    const ground = L.P.some((q) => q !== p && q.style === 'moss_stone' && q.height >= 90 && q.x < p.x + p.width && q.x + q.width > p.x && q.y > p.y && q.y - p.y < 250);
    // (and a stone sits on what is under it, never on air over water or a lower road (the designer's S-9): its bottom meets the surface
    // under its middle, or it is a bough. The fork's step-down stone hung 75-150 px over the low road on 8 of 32 rolls)
    const mid = p.x + p.width / 2;
    const under = L.P.filter((q) => q !== p && q.x <= mid && q.x + q.width >= mid && q.y >= p.y + 10).map((q) => q.y);
    const sits = under.length > 0 && Math.min(...under) <= p.y + p.height + 2;
    if (!ground || !sits) Object.assign(p, { style: 'branch', height: 24 });
  }
  if (easy) padLogs(L);
  // (nothing hurts in the first seconds (STAGE-RULES §2 "Opening seconds"), as w1Rhythm.ts rhythmStage lays it: a catch branch 60 px
  // under the lower lip of every gap met in the first 6.5 s at a run, reaching 50 px under the far ledge, so a short jump drops onto it
  // and a hop goes back up. No stone face under the far ledge: rocks stand only on ground or in water (the designer's S-3, round 2: the
  // faces read as big mossy rocks on posts over the gap), and a face only ever repeated the ledge's own top. The floor road only)
  const openTo = 100 + 6.5 * 285;
  const opening = L.P.filter((q) => q.type !== 'bouncy' && q.x < openTo && !(q as { catch?: boolean; bough?: boolean; perch?: boolean }).catch && !(q as { bough?: boolean }).bough && !(q as { perch?: boolean }).perch).sort((a, b) => a.x - b.x);
  for (let k = 1; k < opening.length; k++) {
    const a = opening[k - 1], b = opening[k];
    if (b.x - (a.x + a.width) < 20) continue;
    const y = Math.max(a.y, b.y) + 60;
    L.P.push({ id: L.pid++, x: a.x + a.width - 30, y, width: b.x + 50 - (a.x + a.width - 30), height: 24, type: 'solid', style: 'branch', catch: true } as Platform);
  }
  // (a creaking branch over safe ground (the old 1-5's promise, stage15.test.ts; the lead 11-06): where a creaky piece has nothing safe under
  // its middle, a catch branch 120 px under it, 30 px wider each side, so a snap drops him onto it and a hop goes on. A creek's water is
  // still the creek's, a splash (the pass below takes a catch off the water, Matt 11-05))
  // (the designer's ruling (a), 11-06: over the creek the high road lays SOLID boughs, not creaky ones: a taught creaky may be required
  //  over a pit, a "may", and with the water under it a snap is a splash, so none is laid there and the promise above holds)
  for (const p of L.P) {
    const mid = p.x + p.width / 2;
    if (p.type === 'fragile' && L.water.some((z) => mid > z.x0 && mid < z.x1 && p.y < z.y)) { p.type = 'solid'; delete (p as { creak?: unknown }).creak; }
  }
  for (const p of [...L.P]) {
    if (p.type !== 'fragile') continue;
    const mid = p.x + p.width / 2;
    if (L.P.some((q) => q !== p && q.type !== 'fragile' && q.y > p.y && q.x <= mid && q.x + q.width >= mid)) continue;
    const clear = (c: { x: number; y: number; width: number }) => !L.P.some((q) => q.x < c.x + c.width && q.x + q.width > c.x && q.y < c.y + 24 + 40 && q.y + q.height > c.y - 40);
    // (120 px under it and 30 px wider each side, or narrower or deeper where a neighbour stands close)
    const tries = [[120, 30], [120, 10], [150, 10], [90, 10], [120, 0]].map(([dy, wx]) => ({ x: p.x - wx, y: p.y + dy, width: p.width + 2 * wx }));
    let c: { x: number; y: number; width: number } | null = tries.find(clear) ?? null;
    if (!c) {
      // (over a gap in the ground under it: the floor gap's own catch, 60 px under its lower lip, from the near piece's edge to 50 px under
      // the far one, as the safe nodes lay theirs)
      const below = L.P.filter((q) => q !== p && q.type !== 'fragile' && q.type !== 'bouncy' && q.y > p.y + 40);
      const a = below.filter((q) => q.x + q.width <= mid && q.x + q.width > mid - 260).sort((u, v) => v.x + v.width - (u.x + u.width))[0];
      const b = below.filter((q) => q.x >= mid && q.x < mid + 260).sort((u, v) => u.x - v.x)[0];
      c = a && b ? { x: a.x + a.width - 30, y: Math.max(a.y, b.y) + 60, width: b.x + 50 - (a.x + a.width - 30) } : null;
      if (c && !(c.x <= mid && c.x + c.width >= mid)) c = null;
    }
    if (!c) continue;
    L.P.push({ id: L.pid++, x: Math.round(c.x), y: Math.round(c.y), width: Math.round(c.width), height: 24, type: 'solid', style: 'branch', catch: true } as Platform);
  }
  // (no catch branch in a creek (Matt, 11-05: "a catch branch under a gap has no place in a creek"; w1NewArt.ts piecesUnderWater): a gap
  // over the water is the creek's, and a miss there is a splash)
  for (let k = L.P.length - 1; k >= 0; k--) {
    const q = L.P[k], mid = q.x + q.width / 2;
    if ((q as { catch?: boolean }).catch && L.water.some((z) => mid > z.x0 && mid < z.x1 && q.y > z.y + 2)) L.P.splice(k, 1);
  }
  // (every gap is a drop: World 1 paints an unmarked fall as water otherwise)
  for (const p of L.P) if (p.type === 'solid' || p.type === 'fragile') (p as Platform & { pit?: string }).pit = 'drop';
  const movedPickups = fixPickups({ platforms: L.P, vines: L.V, ropes: [] }, L.C);
  const width = end.x + end.width + 40;
  const height = Math.max(...L.P.map((p) => p.y + p.height)) + 120;
  const nMarks = L.marks.length;
  // (the marks goal, the designer's ruling 2: 10 of 13 on Normal and 8 of 13 on Easy, one miss of slack on a single route of 11)
  // (the spec's own goals when it names them: 1-5's 10 and 8 of 15, the designer 11-06)
  const goalN = Math.min(nMarks, S.marksGoal?.normal ?? Math.round(nMarks * 10 / 13)), goalE = Math.min(nMarks, S.marksGoal?.easy ?? Math.round(nMarks * 8 / 13));
  if (nMarks !== S.marks) throw new Error(`${S.id} laid ${nMarks} marks, not the plan's ${S.marks}`);
  const cfg: LevelConfig = { ...config, levelWidth: width, levelHeight: height, targetCount: S.marks ? Math.max(1, easy ? goalE : goalN) : config.targetCount };
  // (nothing floats unless it floats (the designer's P-2, P-7, P-11; D16): every bough, log, crumbling ledge and creaky limb in the air
  // stands on a painted kapok set back in the shade, as 1-2's logs do (protoArt.ts setDecoTrunks), down to the floor under it or past the
  // stage's bottom; a bridge hangs from a post at each end; the mushroom's perch is a short stump on its bank. Dressing only: no surface)
  const { trunks, leaves } = supports(L.P, height, [100, exit.x, ...L.flags.map((f) => f.x)], L.water);
  const beats: Array<[number, number, string]> = L.explain.map((e) => [e.x0, e.x1, `${e.job}: ${e.idea}${e.road ? ` (${e.road} road)` : ''}`]);
  const stage = {
    config: cfg, trees: [], platforms: L.P, vines: L.V, ropes: [], enemies: [], boss: null, collectibles: L.C,
    spawnX: 100, spawnY: S.startY, exitTotemX: exit.x, exitTotemY: exit.y,
    checkpoints: L.flags.map((f) => ({ x: f.x, y: f.y, reached: false })).sort((a, b) => a.x - b.x),
    easyGoal: Math.max(1, goalE), normalGoal: Math.max(1, goalN),
    meta: { attempt: seed, chunks: L.explain.map((e) => e.idea), width, pieces: L.explain.map((e) => ({ k: `${S.id} ${e.idea}`, x0: e.x0, x1: e.x1 })), mix: { explain: L.explain } },
    proto: { hints: L.hints.sort((a, b) => a.x - b.x), covers: [], beats, movedPickups, ownPetals: true, glints: L.glints, trunks, leaves,
      // (the creeks, the world's deadly pit water: falling in costs a life, so the stage's first is warned of (waterTeach.ts))
      ...(L.water.length ? { water: L.water.map((z) => ({ ...z, kind: 'deadly' as const })) } : {}),
      // (the dressing the stage asks for, by the w1-new atlas's frame names; drawn once engine-render wires that atlas: nothing draws it yet)
      ...(S.dress ? { mixDress: [...startDress(S.dress.start ?? [], 100, start), ...(S.dress.clue ? [{ n: S.dress.clue, x: end.x + end.width - 140, b: end.y }] : [])] } : {}) },
  } as unknown as GeneratedStage & { proto: ProtoExtras };
  // (petals the shared judge can't reach come off: a petal over a gap between the canopy and the floor below it marks no jump anyone
  // makes. The level check names each one; only petals are taken off, never a mark, a heart or the exit)
  // (a petal inside a piece sits 40 px over its top: a bank widened under a stone, or a pad laid after the petals, can cover one)
  for (const q of stage.collectibles) {
    if (q.type !== 'flower') continue;
    const inside = L.P.find((p) => q.x > p.x && q.x < p.x + p.width && q.y > p.y - 20 && q.y < p.y + p.height);
    if (inside) q.y = inside.y - 40;
  }
  const chk = validateStage(stage, { rooms: false });
  const out = new Set(chk.errors.map((e) => /^flower #(\d+) .* out of reach/.exec(e)?.[1]).filter(Boolean).map(Number));
  stage.collectibles = stage.collectibles.filter((q) => !(q.type === 'flower' && out.has(q.id)));
  // (a mark the check can't reach moves to the nearest piece it can, standing clear under nothing: the mark stays in its own stretch)
  const ok = new Set(chk.reachableIds);
  const lost = new Set(chk.errors.map((e) => /^relic #(\d+) .* out of reach/.exec(e)?.[1]).filter(Boolean).map(Number));
  for (const m of stage.collectibles) {
    if (m.type !== 'relic' || !lost.has(m.id)) continue;
    const cand = L.P.filter((p) => ok.has(p.id) && p.type === 'solid' && p.width >= 100 && !L.P.some((q) => q !== p && q.x < p.x + p.width / 2 + 40 && q.x + q.width > p.x + p.width / 2 - 40 && q.y < p.y && p.y - q.y < 140))
      .sort((a, b) => Math.abs(a.x + a.width / 2 - m.x) - Math.abs(b.x + b.width / 2 - m.x));
    if (cand[0]) { m.x = cand[0].x + cand[0].width / 2; m.y = cand[0].y - 34; }
  }
  // (every piece has a look World 1's kit paints: a bank, stone, log, branch, ruin, bridge, lily pad or mushroom; anything else falls back
  // to terrain's code-drawn island, 3 gradients a frame (engine-render's suggestion, 11-05))
  const KIT = new Set(K.styles);
  for (const p of stage.platforms) {
    const q = p as Platform & { lily?: boolean };
    if (!(KIT.has(p.style as string) || q.lily || p.type === 'bouncy')) throw new Error(`${S.id}: piece ${p.id} at x ${p.x} (h ${p.height}, style ${p.style}) has no look in World ${K.world}'s kit`);
  }
  return stage;
}
