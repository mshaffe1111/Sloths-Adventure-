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
import type { GeneratedStage } from '../stageGenerator.ts';
import type { ProtoExtras, StageHint } from '../protoStage.ts';
import { fixPickups } from '../flowerReach.ts';
import { findForStage } from '../finds.ts';
import { heldMaxGap, jumpOK, validateStage } from '../levelCheck.ts';
import { reachGlide, reachJump } from '../physics.ts';

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
  | 'lily-pad hop' | 'reed isles' | 'bank walk' | 'rotten-branch drop' | 'push block' | 'bough stair' | 'bridge span';
/** the floor ideas a canopy is laid over (the designer's ruling 1 on the CP3 miss: "boughs run above bank hops, stump hops or the creek") */
export const FLOOR: readonly Idea[] = ['bank hops', 'stump hop', 'lily-pad hop'];
export interface Fork { high: Idea[]; low: Idea[] }
export interface NodePlan { id?: string; easyOnly?: boolean; job: string; deck: Idea[] | Fork; not?: number; notLast?: number; hint?: string; padHint?: string; flagBefore?: boolean; heartAfter?: boolean; seed?: boolean }

/** CP3's 1-5 plan, row by row (ENGINE-SPEC "CP3 design"); `not`: never the idea node `not` rolled; `notLast`: never one the last n nodes laid */
/** a node's name on the map: its plan id, or its number counting only the nodes without one (n7b sits between n7 and n8) */
const nid = (i: number): string => PLAN_15[i].id ?? String(PLAN_15.slice(0, i + 1).filter((q) => !q.id).length);
export const PLAN_15: NodePlan[] = [
  { job: 'warm-up', deck: ['bank hops', 'stump hop'] },
  { job: 'teach creaky', deck: ['snap teach'], hint: 'Creaky branches! Grab the petals and keep moving' },
  // (each deck gains a floor idea, the old 1-1's cycle: the designer's ruling (a) on the review, 11-05 ~2:35 AM)
  { job: 'climb up', deck: ['bounce up', 'the climb', 'stump hop'] },
  // (Easy's third rest, the designer's option (c) for Easy's density, 11-05: Easy only)
  { id: '3b', easyOnly: true, job: 'rest', deck: ['bank walk'] },
  { job: 'the fork', deck: { high: ['crumbling ledge', 'creaky boughs'], low: ['lily-pad hop', 'reed isles'] } },
  { job: 'rest', deck: ['bank walk'], hint: 'These petals are fresher. She came this way not long ago.', flagBefore: false },
  { job: 'test creaky', deck: ['snap dash', 'bank hops'], flagBefore: true, heartAfter: true },
  { job: 'twist', deck: ['rotten-branch drop', 'stump hop'] },
  // (the second rest, the designer's ruling on the fun gate, 11-05 ~2:26 AM: a short flat pad and a Dot spot after the drop; its flag
  // only if a hard node follows, which the flag rule decides; Dot's line is the designer's)
  { id: '7b', job: 'rest', deck: ['bank walk'], hint: 'Down on the forest floor now. Her marks go on past the creek.' },
  // (the designer's ruling 6 on the CP3 miss: n8 draws one that the previous two nodes did not lay)
  { job: 'creek', deck: ['lily-pad hop', 'reed isles', 'stump hop', 'crumbling ledge'], notLast: 2 },
  // (push block leaves n9 for CP3, the designer's ruling: the level check walks a pushed log only inside a puzzle room; back in CP4)
  { job: 'puzzle beat', deck: ['bough stair', 'the climb', 'bank hops'], not: 3, seed: true, hint: 'Something shiny, far away...', padHint: 'Something shiny, far away... too far, for now.' },
  { job: 'master (fork)', deck: { high: ['crumbling ledge', 'bridge span'], low: ['bough stair', 'bank hops'] }, flagBefore: true, heartAfter: true },
  { job: 'cool down', deck: ['bank hops', 'stump hop'] },
];

interface Lay {
  /** the difficulty dial's gap, as a share of the gate's widest (ENGINE-SPEC "The difficulty dial") */
  gapShare: number;
  /** the dial's rise cap: its share of the highest rise the gate allows (px) */
  riseCap: number;
  /** the dial's landing width: Easy's typical landing over Normal's (260 -> 150 against 220 -> 110 px) */
  wScale: number;
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
  /** Easy's breather pads laid so far (they alternate log and bank) */
  pads?: number;
  /** creaky has been taught (n2's first twig is laid): no creaky piece before it (STAGE-RULES: the first appearance is taught) */
  creakyTaught: boolean;
  /** the last six landings' kind x size, as the variety gate reads them (cp1/measure2.py), so a burst picks a size that is new */
  recent: string[];
  glints: Array<{ x: number; y: number }>;
}
type Entry = 'mushroom' | 'vine' | 'step';
/** the old 1-1's mushrooms, median over its 16 layouts (cp1-old.json) */
const MUSHROOM_CAP = 14;
/** where the way is: the end of the last piece laid, its top, and the kind of piece it was */
interface Cursor { x: number; y: number }

const GROUND = 900;
const LIMIT = { yMin: 300, yMax: 1400 };
/** the band the way must stay in right now (a fork's road keeps to its own, so the two roads never meet) */
let band = { ...LIMIT };
/** the narrowest gap that is still a jump (beatTrace.ts MIN_GAP) */
const MIN_GAP = 40;

function plat(L: Lay, k: string, x: number, y: number, w: number): Platform {
  const p: Platform & Record<string, unknown> = { id: L.pid++, x: Math.round(x), y: Math.round(y), width: Math.round(w), height: 24, type: 'solid', style: 'branch' } as never;
  if (k === 'bank') Object.assign(p, { style: 'moss_stone', height: 120 });
  // (50 px, the height World 1's painted rock is drawn for (protoArt.ts drawRockArt): at 40 it drew the grey placeholder slab, P-12)
  else if (k === 'stone') Object.assign(p, { style: 'moss_stone', height: 50 });
  else if (k === 'log') Object.assign(p, { style: 'log', height: 90 });
  else if (k === 'bridge') Object.assign(p, { style: 'canopy_bridge' });
  else if (k === 'creaky') {
    if (!L.creakyTaught) throw new Error('1-5: a creaky piece before n2 teaches it');
    Object.assign(p, { type: 'fragile', creak: L.easy ? 1.2 : 0.88 });
  }
  else if (k === 'crumble') Object.assign(p, { type: 'fragile', style: 'ruin', crumbleAfter: L.easy ? 1.0 : 0.7 });
  else if (k === 'catch') Object.assign(p, { catch: true });
  else if (k === 'lily') Object.assign(p, { style: undefined, height: 12, lily: true });
  else if (k === 'reed') Object.assign(p, { style: undefined, height: 30 });
  else if (k === 'mushroom') Object.assign(p, { type: 'bouncy', style: undefined, height: 30 });
  L.P.push(p);
  L.recent.push(sizeKey(k, p.width));
  if (L.recent.length > 6) L.recent.shift();
  return p;
}

/** a piece's kind x size as the variety gate names it: short under 150 px, medium to 300, long over */
function sizeKey(k: string, w: number): string {
  return `${k} ${w < 150 ? 'short' : w <= 300 ? 'medium' : 'long'}`;
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

/** a petal over the middle of each gap between neighbouring route pieces from index `from` on (an arc that shows where the jump goes) */
function petalsOver(L: Lay, from: number) {
  const ps = L.P.slice(from).filter((p) => p.type !== 'bouncy');
  for (let i = 1; i < ps.length; i++) {
    const a = ps[i - 1], b = ps[i];
    const gx = (a.x + a.width + b.x) / 2;
    if (b.x - (a.x + a.width) < 30) continue;
    L.C.push({ id: L.cid++, type: 'flower', botanicalVariant: i % 3 ? 'orchid' : 'hibiscus', x: Math.round(gx), y: Math.min(a.y, b.y) - 80, collected: false, bobPhase: (gx * 0.031) % 6.28 } as Collectible);
  }
}

/** the middle-most of these pieces with nothing over it for 110 px (a mark on it is never inside a piece above), on the walking road:
 *  never a canopy's bough or perch, which only a bounce reaches (a first-timer on the floor met a sealed door, cp3-ft after the rebuild) */
function clearPiece(L: Lay, ps: Platform[]): Platform | undefined {
  const road = ps.filter((p) => !(p as { bough?: boolean }).bough && !(p as { perch?: boolean }).perch && !(p as { crossing?: boolean }).crossing);
  const mid = road.length >> 1;
  const order = road.map((p, i) => [Math.abs(i - mid), p] as const).sort((a, b) => a[0] - b[0]).map(([, p]) => p);
  return order.find((p) => p.type !== 'bouncy' && !L.P.some((q) => q !== p && q.x < p.x + p.width / 2 + 40 && q.x + q.width > p.x + p.width / 2 - 40 && q.y < p.y && p.y - q.y < 110));
}

/** each piece kind's widths by size band (short under 150 px, medium 150-300, long over 300), inside the shipped p10-p90 (cp2/library.txt)
 *  and CP2's proven sizes */
// (short stones stop at 120 px: Easy's own pass widens a ledge by its jump, and a 140 px stone came out medium, easyMode.ts)
const BANDS: Record<string, Array<[number, number]>> = {
  bank: [[110, 148], [160, 290], [310, 360]], stone: [[60, 120], [160, 233]], log: [[180, 290], [310, 420]], branch: [[110, 148], [160, 290]],
  bridge: [[112, 148], [160, 300]], creaky: [[110, 148], [150, 170]], crumble: [[110, 110]], lily: [[82, 102]], reed: [[150, 190]],
};
const HEIGHT: Record<string, number> = { bank: 120, stone: 50, log: 90 };
/** a landing steps up or down (the designer's (c): at least 4 of 5 landings do) */
const STEPS = [40, 30, 50, -30, -40, -60];
/** (a step of 20 px or less reads as flat: the variety gate's up/flat/down, cp1/measure2.py) */
const FLAT = 20;

/**
 * A burst (the designer's ruling, CP3 (a)+(c)): `n` pieces from `kinds`; the kind changes every 2 pieces and the size band every piece;
 * every landing steps up or down more than 20 px unless the band forbids it. Gaps are the dial's share of the gate's (gateGap).
 */
function burst(L: Lay, c: Cursor, R: Rng, kinds: string[], n: number, steps: number[] = STEPS, fixedGap?: number, width?: number): Cursor {
  let { x, y } = c;
  for (let i = 0; i < n; i++) {
    const k = kinds[Math.floor(i / 2) % kinds.length];
    const bands = BANDS[k] ?? [[110, 200]];
    // (the size band turns every piece, so two of a kind side by side are two sizes: "something new" comes often)
    // (and of the bands, the first in that turn whose size is new against the last six landings, the gate's "something new")
    const turnAt = (i + Math.floor(i / 2)) % bands.length;
    const order = bands.map((_, j) => bands[(turnAt + j) % bands.length]);
    const bnd = width !== undefined ? bands[turnAt] : order.find((b) => !L.recent.includes(sizeKey(k, (b[0] + b[1]) / 2))) ?? bands[turnAt];
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
    const f = easyFit(L, d, width ?? Math.max(90, Math.round(Math.min(Math.max(bnd[1], bnd[0] * L.wScale), R.r(bnd[0], bnd[1]) * L.wScale))), 999);
    const h = HEIGHT[k] ?? 24, type = k === 'creaky' || k === 'crumble' ? 'fragile' : 'solid';
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
  burst(L, c, R, [k], 1, STEPS, undefined, w);
  return L.P[L.P.length - 1];
}

/** one idea's burst, laid from the cursor; returns the way's end */
function idea(L: Lay, name: Idea, c: Cursor, R: Rng): Cursor {
  // (a burst is 4-6 pieces, the designer's (a); 1-5 sits at 4-5 for its 2:30-3:00 aim, ENGINE-SPEC "Stage length")
  // (Easy one piece shorter, 3-4, the designer's ruling on the fun gate)
  // (Easy at 3 pieces: the designer's second fix for Easy's density; the snap dash keeps 5 for its teach-to-test job)
  const n = L.easy ? 3 : R.i(4, 5);
  switch (name) {
    case 'bank hops': return burst(L, c, R, R.pick([['bank', 'stone', 'log'], ['log', 'bank'], ['stone', 'bank', 'log']]), n);
    // (a log as its third kind: on Easy its stones and banks all widen into one size, and the gate's "something new" ran out)
    case 'stump hop': return burst(L, c, R, ['stone', 'bank', 'log'], n, [40, -40, -70, 30, -30]);
    case 'snap teach': {
      L.creakyTaught = true;
      // (expose, then validate: a creaky twig low over a long bank, then two over safe ground; nothing to fall into)
      // (600 px, the twigs close together: the designer's ruling on the fun gate (the 900 px bank was a 3 s walk with nothing to do))
      const bank = step(L, c, R, 'bank', 600);
      // (low, higher, low: 40, 75 and 40 px over the bank, each a step up or down from the last, never flat)
      plat(L, 'creaky', bank.x + 110, bank.y - 40, 150);
      plat(L, 'creaky', bank.x + 280, bank.y - 75, 140);
      plat(L, 'creaky', bank.x + 440, bank.y - 40, 130);
      return { x: bank.x + bank.width, y: bank.y };
    }
    // (the test of n2's teach in its full form (the designer's review B): six pieces, three of them creaky, every gap a real one)
    case 'snap dash': return burst(L, c, R, ['creaky', 'branch'], L.easy ? 5 : 6);
    case 'bounce up': {
      // (the old 1-1's highRoad: a mushroom on the ground, branches 170-200 px over it, proven there)
      const pad = step(L, c, R, 'bank', 300);
      plat(L, 'mushroom', pad.x + 170, pad.y - 30, 70);
      const by = pad.y - Math.round(R.r(170, 200));
      const b = plat(L, 'branch', pad.x + 210, by, Math.round(R.r(220, 280)));
      return burst(L, { x: b.x + b.width, y: by }, R, ['branch', 'bridge'], R.i(2, 4));
    }
    case 'the climb': {
      // (CP2 cp2-climb.out: a bank, a climbing vine at its end, a bough 170-300 px up out from it, on the bough in 1.2-2.4 s)
      const bank = step(L, c, R, 'bank', 260);
      const rise = Math.round(R.r(170, Math.max(170, Math.min(300, bank.y - LIMIT.yMin))));
      const vx = bank.x + bank.width + 2;
      L.V.push({ id: -1, x: vx, topY: bank.y - rise - 30, bottomY: bank.y, swaySpeed: 0, swayPhase: 0, vineType: 'tree_climb' } as Vine);
      const b = plat(L, 'branch', vx + 13, bank.y - rise, Math.round(R.r(240, 300)));
      return { x: b.x + b.width, y: b.y };
    }
    case 'crumbling ledge': return burst(L, c, R, ['crumble', 'branch'], n, [30, -30, 40, -40]);
    case 'creaky boughs': return burst(L, c, R, ['branch', 'creaky'], n);
    case 'lily-pad hop': return burst(L, c, R, ['lily', 'log'], n, [30, -30, 40, -40]);
    case 'reed isles': return burst(L, c, R, ['reed', 'lily'], n, [30, -30, 40, -40]);
    case 'bank walk': {
      // (a rest: a long bank and a medium stone, an easy step between them; never one long flat, never one size: the variety gate)
      if (L.easy) {
        // (Easy's rest, 4-5 s: two banks of about 2 s each with one small hop between and a petal arc over it, play, not dead time:
        // the designer's third fix for Easy's density, which also gives Easy its breather in the middle)
        // (620 px each, about 2.2 s: a rest of 2 s or more that is still under the gate's 2.5 s dead walk, since the gate reads a petal as
        // nothing to do)
        // (a log, then a bank: after a fork's long rejoin bank, two more banks read as nothing new)
        const e1 = step(L, c, R, 'log', 620);
        // (the hop between the halves is onto a short log stump, 130 px: something new in the middle of 1.3k px of rest)
        const mid = burst(L, { x: e1.x + e1.width, y: e1.y }, R, ['log'], 1, [30, -30], 50, 130);
        const e2 = burst(L, mid, R, ['bank'], 1, [30, -30], 50, 620);
        const e3 = L.P[L.P.length - 1];
        for (let k = 0; k < 5; k++) L.C.push({ id: L.cid++, type: 'flower', botanicalVariant: k % 2 ? 'orchid' : 'hibiscus', x: Math.round(e1.x + e1.width - 60 + k * 45), y: Math.round(Math.min(e1.y, e3.y) - 50 - Math.sin((k / 4) * Math.PI) * 60), collected: false, bobPhase: k * 0.9 } as Collectible);
        return e2;
      }
      const b1 = step(L, c, R, 'bank', Math.round(R.r(300, 360)));
      const b2 = step(L, { x: b1.x + b1.width, y: b1.y }, R, 'stone', Math.round(R.r(180, 230)));
      return { x: b2.x + b2.width, y: b2.y };
    }
    case 'rotten-branch drop': {
      // (CP2: branch -> creaky limb 40 down, gap 60 -> catch branch 150 down, gap 120 -> bank 120 down, gap 80; 421-667 ms)
      // (the drop is 310 px after its first branch's step (60 px at most) and is never flipped into a climb: deep in the stage its band gives it the room, and the bursts after it
      // climb back into the band)
      const save = band;
      band = { yMin: band.yMin, yMax: Math.max(band.yMax, c.y + 60 + 330) };
      let e = burst(L, c, R, ['branch'], 1);
      e = burst(L, e, R, ['creaky'], 1, [-40], 60);
      e = burst(L, e, R, ['catch'], 1, [-150], 120);
      e = burst(L, e, R, ['bank'], 1, [-120], 80);
      band = save;
      return e;
    }
    case 'push block': throw new Error('push block is out of 1-5 for CP3 (the designer\'s ruling)');
    case 'bough stair':
      // (CP2, with Easy's rule: Normal steps +50 to +70; Easy +30 to +40, gaps 80 or less: easyFit and the gate cap them)
      // (the bridge only as the stair's top piece, a short rope bridge from the last bough on (the designer's ruling 4))
      return burst(L, burst(L, c, R, ['branch', 'log'], n - 1, L.easy ? [30, 40] : [50, 60, 70]), R, ['bridge'], 1, [30, -30]);
    // (rope bridges with creaky limbs between them: creaky shows on n10's high road (the designer's review E))
    case 'bridge span': return burst(L, c, R, ['bridge', 'creaky'], n, [30, -30, 40, -40]);
  }
}


/** each floor idea's kinds, and the wide kind that holds a canopy's mushroom */
const FLOOR_KINDS: Record<string, { host: string; kinds: string[][] }> = {
  // (the long piece each stretch ends on, turning stretch by stretch so no two stretches repeat it: the gate's "something new")
  'bank hops': { host: 'bank', kinds: [['log'], ['stone'], ['bank']] },
  'stump hop': { host: 'bank', kinds: [['stone'], ['log'], ['stone']] },
  'lily-pad hop': { host: 'log', kinds: [['lily']] },
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
    const ways = (['mushroom', 'vine', 'step'] as Entry[]).filter((w) => w !== L.entry && (w !== 'mushroom' || L.mushrooms < MUSHROOM_CAP));
    const way = R.pick(ways);
    L.entry = way;
    // (a step entry's host never steps down 70: the step, 80 px over it, would sit flat with the piece before)
    burst(L, e, R, [fk.host], 1, way === 'step' ? [30, 40, 50] : [30, 40, 50, -70], undefined, Math.min(290, Math.round(R.r(240, 280) * L.wScale)));
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
    let end = burst(L, { x: host.x + host.width, y: host.y }, R, [ks[0]], 1, [-30, -40], undefined, ks[0] === 'lily' ? undefined : Math.round(R.r(330, 380) * L.wScale));
    if (ks[0] === 'lily') end = burst(L, end, R, ['log'], 1, [-30, -40], undefined, Math.round(R.r(330, 380) * L.wScale));
    // (the long end piece is two, touching, the second 30 px up: a hop to make on the walk out from under the canopy, never a gap to
    // fall in (the fun gate's dead walks: a 2 s walk with nothing to do, 12 of them at canopy ends))
    const m1 = L.P[L.P.length - 1];
    const full = m1.width;
    // (60/40, so the second half is short and the first medium: two sizes, the gate's "something new")
    m1.width = Math.round(full * 0.6);
    const m2 = plat(L, ks[0] === 'lily' ? 'log' : ks[0], m1.x + m1.width, m1.y - 30, full - m1.width);
    end = { x: m2.x + m2.width, y: m2.y };
    const floor = L.P.slice(from).concat(host);
    const hi = Math.min(...floor.map((q) => q.y)), lo = Math.max(...floor.map((q) => q.y));
    band = { yMin: lo - 215, yMax: hi - 135 };
    // (the boughs end 110 px into the stretch's long end piece, its two halves 330-380 px in all: a running jump off their end carries
    // about 240 px, and lands on that floor, never in the gap past it (cp3-ft: the adult's pit lives after the first rebuild))
    const xEnd = m1.x + 110;
    const by = entryY ?? Math.round(Math.max(band.yMin, Math.min(band.yMax, hi - R.r(150, 175))));
    // (boughs at the dial's typical landing, 170-240 px; not widened on Easy, where the high road is the optional one and wider boughs
    // all fell in one size band, which broke the gate's "something new")
    const bw = () => Math.round(R.r(170, 240));
    // (the first bough is short, 130-160 px, so the creaky limbs after it fill the canopy)
    // (off a climb vine or a bough step the first bough is creaky too: he steps on from the vine or the step, as the old 1-1's trees hand
    // him to a limb; a mushroom's bounce lands on a bough that holds)
    const b0 = plat(L, way !== 'mushroom' && L.creakyTaught ? 'creaky' : s === 1 ? 'bridge' : 'branch', bx, by, Math.round(R.r(130, 160)));
    let bc: Cursor = { x: b0.x + b0.width, y: by };
    // (the boughs step between the band's top and bottom, 50 px or more apart, so no two sit flat)
    for (let guard = 0; guard < 6 && bc.x < xEnd - 100; guard++) {
      const to = bc.y > (band.yMin + band.yMax) / 2 ? band.yMin : band.yMax;
      // (every bough after the first is a creaky limb: the stage's theme (the designer's review E), over floor, so a snap drops him onto
      // the low road, never into a pit; the first, where he lands from the entry, holds)
      bc = burst(L, bc, R, [L.creakyTaught ? 'creaky' : 'branch'], 1, [bc.y - to], undefined, Math.round(R.r(120, 170)));
    }
    // (the last bough ends over the floor: trimmed back to 90 px into it, never under 100 px)
    for (const q of L.P.slice(L.P.indexOf(b0))) (q as Platform & { bough?: boolean }).bough = true;
    const lb = L.P[L.P.length - 1];
    if (lb.x + lb.width > xEnd) lb.width = Math.max(100, Math.round(xEnd - lb.x));
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
  // (a bank: logs would crowd out creaky, the stage's theme, from its 3 commonest kinds; its width turns, 600 or 680)
  const pad = step(L, c, R, 'bank', L.pads % 2 ? 600 : 680);
  for (let px = pad.x + 120; px < pad.x + pad.width - 80; px += 170) L.C.push({ id: L.cid++, type: 'flower', botanicalVariant: 'orchid', x: Math.round(px), y: pad.y - 40, collected: false, bobPhase: (px * 0.031) % 6.28 } as Collectible);
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
    (m as Platform & { crossing?: boolean }).crossing = true;
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
function supports(P: Platform[], height: number): Array<{ x: number; topY: number; bottomY: number; w: number; art?: 'plain' }> {
  type T = { x: number; topY: number; bottomY: number; w: number; art?: 'plain' };
  const out: T[] = [];
  const floorOf = (x: number, y: number) => {
    const under = P.filter((q) => q.type !== 'bouncy' && q.style === 'moss_stone' && q.x <= x && q.x + q.width >= x && q.y > y + 30);
    return under.length ? Math.min(...under.map((q) => q.y)) : null;
  };
  // (each tree its own width and, tree by tree, the vine-wrapped kapok or the bare one: never two neighbours alike (S-4))
  const tree = (x: number, top: number, w: number) => {
    const fl = floorOf(x, top - 16);
    const k = out.length;
    out.push({ x: Math.round(x), topY: Math.round(top), bottomY: Math.round(fl !== null ? fl + 30 : height + 200), w: w * (0.85 + ((k * 37) % 7) * 0.07), ...(k % 2 ? { art: 'plain' as const } : {}) });
  };
  const air = P.filter((p) => p.type !== 'bouncy' && !(p as { catch?: boolean }).catch && !(p as { art?: string }).art
    && (p.style === 'branch' || p.style === 'canopy_bridge' || p.style === 'log' || p.style === 'ruin' || p.type === 'fragile')).sort((a, b) => a.x - b.x);
  const done = new Set<Platform>();
  for (let i = 0; i < air.length; i++) {
    const p = air[i];
    if (done.has(p)) continue;
    const perch = !!(p as { perch?: boolean }).perch;
    const top = (q: Platform) => q.y + (q.style === 'log' ? 50 : 16);
    if (p.style === 'canopy_bridge') {
      // (a bridge hangs from a thin post at each end, P-11)
      for (const x of [p.x + 12, p.x + p.width - 12]) { const fl = floorOf(x, p.y); out.push({ x: Math.round(x), topY: Math.round(top(p)), bottomY: Math.round(fl !== null ? fl + 30 : height + 200), w: 0.5 }); }
      continue;
    }
    if (perch) { tree(p.x + p.width / 2, top(p), 0.7); continue; }
    // (two boughs side by side, a short gap and a step between them, grow from one tree standing in the gap (S-4: like the old 1-1's
    // canopy, one trunk and its boughs at two heights))
    const q = air.slice(i + 1).find((o) => !done.has(o) && o.style !== 'canopy_bridge' && !(o as { perch?: boolean }).perch && o.x >= p.x + p.width - 10);
    if (q && q.x - (p.x + p.width) <= 120 && Math.abs(q.y - p.y) <= 140) {
      done.add(q);
      tree((p.x + p.width + q.x) / 2, Math.min(top(p), top(q)), 1.25);
      continue;
    }
    if (out.some((t) => Math.abs(t.x - (p.x + p.width / 2)) < 160 && Math.abs(t.topY - top(p)) < 80)) continue;
    tree(p.x + p.width / 2, top(p), 1.15);
  }
  return out;
}

/**
 * Build 1-5 from its node plan. Normal and Easy draw the same ideas from the same streams (Easy only changes sizes), so a roll is the
 * same stage in both settings.
 */
export function buildMix15(config: LevelConfig, seed: number, easy: boolean): GeneratedStage & { proto: ProtoExtras } {
  // (the difficulty dial, ENGINE-SPEC: d from the world and stage; the gap is this share of the gate's widest)
  const d = (0.1 * (config.worldIndex - 1) + 0.2 * (config.miniIndex - 1) / 8) / 1.1;
  const gapShare = easy ? 0.45 + 0.35 * d : 0.55 + 0.37 * d;
  const riseShare = easy ? 0.4 + 0.4 * d : 0.5 + 0.45 * d;
  // (Easy's wider landings come from the engine's own Easy pass, easyMode.ts easyStage, which widens a ledge by its jump; the mixer widening
  // them too doubled it and pushed medium pieces into long, which broke the gate's "something new". Measured after that pass)
  const wScale = 1;
  const L: Lay = { P: [], V: [], C: [], hints: [], flags: [], marks: [], explain: [], pid: 1, cid: 1, easy, gapShare, riseCap: 999, wScale, dial: d, mushrooms: 0, glints: [], recent: [], creakyTaught: false };
  // (the highest rise the gate allows: the largest step up a plain jump makes across a real gap, measured with the gate itself)
  let maxRise = 0;
  for (let dy = 10; dy <= 200; dy += 5) if (gateGap(L, 800, { y: 800 - dy, height: 24, type: 'solid' }, dy) >= MIN_GAP + 10) maxRise = dy;
  L.riseCap = Math.max(30, Math.round(maxRise * riseShare));
  /** what each node rolled (a fork: both roads' ideas), so a later node can be held off it */
  const rolled: Array<string[]> = [];
  let lastIdea: Idea | undefined;
  // (today's frame, kept by the designer: down from the canopy to the floor at dusk; the start is high)
  let c: Cursor = { x: 0, y: 460 };
  // the start: a flat bank, the spawn on it
  const start = plat(L, 'bank', 0, c.y, 520);
  c = { x: start.width, y: c.y };
  L.flags.push({ x: 100, y: c.y });
  const forkMarks: Array<{ x: number; y: number }> = [];
  PLAN_15.forEach((n, i) => {
    if (n.easyOnly && !easy) return;
    const R = rngFor(seed, `1-5 n${i}`);
    const x0 = c.x;
    if (n.flagBefore) {
      // (a medium log, not another bank beside the banks around it: the gate's "something new")
      const pad = step(L, c, R, 'log', 280);
      c = { x: pad.x + pad.width, y: pad.y };
    }
    // (Easy's breathers between nodes; none next to a rest node, which is one)
    if (L.easy && i > 0 && n.job !== 'rest' && PLAN_15[i - 1].job !== 'rest') c = breather(L, c, R);
    if (n.hint) L.hints.push({ x: c.x + 60, text: n.hint, pad: n.padHint ?? n.hint, keys: n.padHint ?? n.hint, ...(c.y >= 600 ? { belowY: c.y - 60 } : { aboveY: c.y + 60 }) } as StageHint);
    const from = L.P.length;
    if (Array.isArray(n.deck)) {
      // (the designer's ruling (a), CP3: a node lays its bursts from its deck, never the same idea twice in a row; the dial sets how
      // many. Every burst comes from the node's own deck (the teach pairs with bank hops); a floor idea carries a canopy (ruling 1 on the
      // CP3 miss). Rest lays one; so do the warm-up and the cool down, under a canopy)
      // (the warm-up lays one too, so the first hard node starts inside LV-9's first 4,000 px and the stage's second flag stands before
      // it, never on the warm-up's easy ground: placement rule 3, the designer's ruling 3 on the CP3 miss. For the designer to confirm)
      const one = n.job === 'rest' || n.job === 'cool down' || n.job === 'warm-up';
      const off = new Set([...(rolled[i - 1] ?? []), ...(n.not !== undefined ? rolled[n.not - 1] ?? [] : []), ...(n.notLast ? rolled.slice(Math.max(0, i - n.notLast), i).flat() : [])]);
      // (the difficulty dial's bursts per node: 2 at d = 0, 3 at d = 1, ENGINE-SPEC "The difficulty dial")
      const bursts = one ? 1 : Math.round(2 + L.dial);
      const laid: Idea[] = [];
      let last = lastIdea;
      for (let k = 0; k < bursts; k++) {
        // (the designer's review C: a node draws only from its own deck; the teach pairs with bank hops (ruling (a)). A node whose deck has
        // nothing left that is not the idea just laid lays no more bursts)
        // (the node's own idea bursts first and its floor idea follows (the designer's ruling (a) on the review); n8's creek pairs a reed
        // or crumbling burst with a floor burst from its deck)
        const ok = (d: Idea) => d !== last && !off.has(d) && !laid.includes(d);
        const ownIdeas = n.deck.filter((d) => !FLOOR.includes(d));
        let cand: Idea[];
        if (n.job.startsWith('teach')) cand = k === 0 ? n.deck.filter(ok) : ['bank hops'];
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
        if (!n.deck.includes(pick) && !(n.job.startsWith('teach') && pick === 'bank hops')) throw new Error(`1-5 n${i + 1} drew ${pick}, not in its deck`);
        const bx = c.x;
        // (a floor idea outside a fork and the rest carries a canopy)
        const over = FLOOR.includes(pick) && n.job !== 'rest';
        // (and between a node's bursts, so no Easy run goes 20 s without a 2 s rest)
        if (L.easy && k > 0) c = breather(L, c, R);
        c = over ? canopied(L, pick, c, R) : idea(L, pick, c, R);
        L.explain.push({ node: i + 1, nid: nid(i), job: n.job, idea: pick, ...(over ? { canopy: true } : {}), x0: bx, x1: c.x, why: `burst ${k + 1} of ${bursts}${over ? ', a canopy over it' : ''}` });
        laid.push(pick);
        last = pick;
      }
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
      const forkBank = step(L, c, R, 'bank', 240);
      // (each road keeps to its own band, 200 px apart, so they never meet: the high road no lower than 60 px under the fork bank,
      // the low road no higher than 60 px over its start)
      // (head room: the high road never comes down toward the low one and the low one never rises toward it, so the roads stay 260 px
      // or more apart: a jump on the low road (100 px up, his body 116 tall) never meets the high road over it)
      // (Easy, the designer's ruling 5 on the CP3 miss: the roads sit within 400 px of each other, so a slip costs nothing there)
      const hy = forkBank.y, ly = hy + (L.easy ? 240 : 260);
      band = { yMin: Math.max(LIMIT.yMin, hy - (L.easy ? 60 : 160)), yMax: hy };
      const forkFrom = L.P.length;
      // (each road lays two bursts, its deck's two ideas in turn, so the fork is a real stretch of the stage: the plan's 15-20% each)
      lastIdea = lo2;
      // (on Easy a breather between each road's two bursts, as between a node's)
      const gap = (e: Cursor) => (L.easy ? breather(L, e, R) : e);
      const hiEnd = idea(L, hi2, gap(idea(L, hi, { x: forkBank.x + forkBank.width, y: hy }, R)), R);
      // (the low road starts under the gap off the fork bank's end, so running off that end drops him onto it)
      const lowStart = { x: forkBank.x + forkBank.width - 90, y: ly };
      band = { yMin: ly, yMax: ly + (L.easy ? 60 : 160) };
      const lowFrom = L.P.length;
      const loEnd = idea(L, lo2, gap(idea(L, lo, lowStart, R)), R);
      band = { ...LIMIT };
      // (rejoin: one long bank 30 px over the low road's end, a gap the gate allows on from it, and long enough to run on under the high
      // road's end, which drops onto it)
      const ry = Math.max(LIMIT.yMin, loEnd.y - 30);
      const rx = loEnd.x + Math.min(70, gateGap(L, loEnd.y, { y: ry, height: 120, type: 'solid' }, loEnd.y - ry) - 4);
      // (a long log: after a low road of banks, another long bank was nothing new for 1.6k px)
      const rejoin = plat(L, 'log', rx, ry, Math.max(320, hiEnd.x + 240 - rx));
      L.explain.push({ node: i + 1, nid: nid(i), job: n.job, idea: `${hi} + ${hi2}` as Idea, road: 'high', x0, x1: hiEnd.x, why: `high road from [${n.deck.high.join(', ')}]` });
      L.explain.push({ node: i + 1, nid: nid(i), job: n.job, idea: `${lo} + ${lo2}` as Idea, road: 'low', x0: lowStart.x, x1: loEnd.x, why: `low road from [${n.deck.low.join(', ')}]` });
      petalsOver(L, lowFrom);
      // (Meeca's marks, the designer's ruling: one on each road; the high road's at its hardest spot, its middle piece)
      const hiPs = L.P.slice(forkFrom, lowFrom), loPs = L.P.slice(lowFrom, L.P.length - 1);
      crossings(L, hiPs.filter((q) => q.type !== 'bouncy'), loPs.filter((q) => q.type !== 'bouncy'), n.job);
      const hm = clearPiece(L, hiPs), lm = clearPiece(L, loPs);
      if (hm) forkMarks.push({ x: hm.x + hm.width / 2, y: hm.y });
      if (lm) forkMarks.push({ x: lm.x + lm.width / 2, y: lm.y });
      c = { x: rejoin.x + rejoin.width, y: ry };
    }
    petalsOver(L, from);
    // one of Meeca's marks in each non-fork node, on the main route, on a piece the idea laid (its middle one)
    // (n7b, the second rest, lays no mark: the designer's 13 marks are the plan's nine nodes and the forks' four, and the goal is 10 of them)
    if (Array.isArray(n.deck) && !n.id) { const m = clearPiece(L, L.P.slice(from)); if (m) L.marks.push({ x: m.x + m.width / 2, y: m.y }); }
    // (n9's golden seed: the designer's ruling (b), CP3: no seed on 1-5; Dot's line plays here, the seed waits for the stage that teaches
    // the glide. The far-off glint is dressing only: a twinkle 420 px over the node's highest piece, out of every jump's reach)
    if (n.seed) {
      const ps = L.P.slice(from);
      const top = Math.min(...ps.map((q) => q.y));
      L.glints.push({ x: Math.round((x0 + c.x) / 2), y: Math.max(40, top - 420) });
    }
    // (on the node's last solid piece, over its middle, never over the gap past it: markers stand on the path, P-5)
    if (n.heartAfter && !easy) {
      const lastP = [...L.P.slice(from)].reverse().find((q) => q.type === 'solid' && !(q as { bough?: boolean }).bough && q.width >= 100);
      const hx = lastP ? lastP.x + lastP.width / 2 : c.x - 60, hy = lastP ? lastP.y : c.y;
      L.C.push({ id: L.cid++, type: 'heart', x: Math.round(hx), y: hy - 60, collected: false, bobPhase: 0 } as Collectible);
    }
  });
  const end = step(L, c, rngFor(seed, '1-5 end'), 'bank', 640);
  const exit = { x: end.x + 420, y: end.y };
  L.marks.push(...forkMarks);
  for (const m of L.marks) L.C.push({ id: L.cid++, type: 'relic', mark: 'meeca', x: m.x, y: m.y - 34, collected: false, bobPhase: (m.x * 0.017) % 6.28 } as Collectible);
  const find = findForStage(config.worldIndex, config.miniIndex);
  if (find) L.C.push({ id: L.cid++, type: 'find', findId: find.id, hidden: false, x: end.x + 200, y: end.y - 26, collected: false, bobPhase: 0 } as Collectible);
  L.C.push({ id: L.cid++, type: 'exit_totem', x: exit.x, y: exit.y - 30, collected: false, bobPhase: 0 } as Collectible);
  L.V.forEach((v, k) => (v.id = k + 1));
  // (the flags, the designer's ruling 3 on the CP3 miss: LV-9's spacing (easyMode.ts FLAG_SPAN_MAX, 4,000 px from the spawn to the exit)
  // holds, and inside each 4,000 px window the flag stands on the nearest safe spot before the next hard node; with no hard node in a
  // window, LV-9 still puts one at the window's far end. A safe spot: a solid piece 200 px or wider, nothing over it, on no fork road)
  const hardSpans = PLAN_15.flatMap((n, i) => {
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
    if (!ground) Object.assign(p, { style: 'branch', height: 24 });
  }
  // (nothing hurts in the first seconds (STAGE-RULES §2 "Opening seconds"), as w1Rhythm.ts rhythmStage lays it: a catch branch 60 px
  // under the lower lip of every gap met in the first 6.5 s at a run, ending against a stone face under the far ledge, so a short jump
  // drops onto it and a hop goes back up)
  const openTo = 100 + 6.5 * 285;
  const opening = L.P.filter((q) => q.type !== 'bouncy' && q.x < openTo && !(q as { catch?: boolean }).catch).sort((a, b) => a.x - b.x);
  for (let k = 1; k < opening.length; k++) {
    const a = opening[k - 1], b = opening[k];
    if (b.x - (a.x + a.width) < 20) continue;
    const y = Math.max(a.y, b.y) + 60;
    L.P.push({ id: L.pid++, x: a.x + a.width - 30, y, width: b.x + 50 - (a.x + a.width - 30), height: 24, type: 'solid', style: 'branch', catch: true } as Platform);
    L.P.push({ id: L.pid++, x: b.x, y: b.y, width: 50, height: y - b.y, type: 'solid', style: 'moss_stone', art: 'rock' } as Platform);
  }
  // (every gap is a drop: World 1 paints an unmarked fall as water otherwise)
  for (const p of L.P) if (p.type === 'solid' || p.type === 'fragile') (p as Platform & { pit?: string }).pit = 'drop';
  const movedPickups = fixPickups({ platforms: L.P, vines: L.V, ropes: [] }, L.C);
  const width = end.x + end.width + 40;
  const height = Math.max(...L.P.map((p) => p.y + p.height)) + 120;
  const nMarks = L.marks.length;
  // (the marks goal, the designer's ruling 2: 10 of 13 on Normal and 8 of 13 on Easy, one miss of slack on a single route of 11)
  const goalN = Math.min(nMarks, Math.round(nMarks * 10 / 13)), goalE = Math.min(nMarks, Math.round(nMarks * 8 / 13));
  if (nMarks !== 13) throw new Error(`1-5 laid ${nMarks} marks, not the plan's 13`);
  const cfg: LevelConfig = { ...config, levelWidth: width, levelHeight: height, targetCount: Math.max(1, easy ? goalE : goalN) };
  // (nothing floats unless it floats (the designer's P-2, P-7, P-11; D16): every bough, log, crumbling ledge and creaky limb in the air
  // stands on a painted kapok set back in the shade, as 1-2's logs do (protoArt.ts setDecoTrunks), down to the floor under it or past the
  // stage's bottom; a bridge hangs from a post at each end; the mushroom's perch is a short stump on its bank. Dressing only: no surface)
  const trunks = supports(L.P, height);
  const beats: Array<[number, number, string]> = L.explain.map((e) => [e.x0, e.x1, `${e.job}: ${e.idea}${e.road ? ` (${e.road} road)` : ''}`]);
  const stage = {
    config: cfg, trees: [], platforms: L.P, vines: L.V, ropes: [], enemies: [], boss: null, collectibles: L.C,
    spawnX: 100, spawnY: 460, exitTotemX: exit.x, exitTotemY: exit.y,
    checkpoints: L.flags.map((f) => ({ x: f.x, y: f.y, reached: false })).sort((a, b) => a.x - b.x),
    easyGoal: Math.max(1, goalE), normalGoal: Math.max(1, goalN),
    meta: { attempt: seed, chunks: L.explain.map((e) => e.idea), width, pieces: L.explain.map((e) => ({ k: `1-5 ${e.idea}`, x0: e.x0, x1: e.x1 })), mix: { explain: L.explain } },
    proto: { hints: L.hints.sort((a, b) => a.x - b.x), covers: [], beats, movedPickups, ownPetals: true, glints: L.glints, trunks },
  } as unknown as GeneratedStage & { proto: ProtoExtras };
  // (petals the shared judge can't reach come off: a petal over a gap between the canopy and the floor below it marks no jump anyone
  // makes. The level check names each one; only petals are taken off, never a mark, a heart or the exit)
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
  return stage;
}
