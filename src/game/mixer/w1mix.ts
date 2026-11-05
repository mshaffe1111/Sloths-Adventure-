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
import { heldMaxGap, jumpOK } from '../levelCheck.ts';
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
export interface Fork { high: Idea[]; low: Idea[] }
export interface NodePlan { job: string; deck: Idea[] | Fork; not?: number; hint?: string; padHint?: string; flagBefore?: boolean; heartAfter?: boolean; seed?: boolean }

/** CP3's 1-5 plan, row by row (ENGINE-SPEC "CP3 design"); `not`: never the idea node `not` rolled */
export const PLAN_15: NodePlan[] = [
  { job: 'warm-up', deck: ['bank hops', 'stump hop'] },
  { job: 'teach creaky', deck: ['snap teach'], hint: 'Creaky branches! Grab the petals and keep moving' },
  { job: 'climb up', deck: ['bounce up', 'the climb'] },
  { job: 'the fork', deck: { high: ['crumbling ledge', 'creaky boughs'], low: ['lily-pad hop', 'reed isles'] } },
  { job: 'rest', deck: ['bank walk'], hint: 'These petals are fresher. She came this way not long ago.', flagBefore: false },
  { job: 'test creaky', deck: ['snap dash'], flagBefore: true, heartAfter: true },
  { job: 'twist', deck: ['rotten-branch drop'] },
  { job: 'creek', deck: ['lily-pad hop', 'reed isles', 'stump hop'], not: 4 },
  // (push block leaves n9 for CP3, the designer's ruling: the level check walks a pushed log only inside a puzzle room; back in CP4)
  { job: 'puzzle beat', deck: ['bough stair', 'the climb'], not: 3, seed: true, hint: 'Something shiny, far away...', padHint: 'Something shiny, far away... too far, for now.' },
  { job: 'master (fork)', deck: { high: ['crumbling ledge', 'bridge span'], low: ['bough stair', 'bank hops'] }, flagBefore: true, heartAfter: true },
  { job: 'cool down', deck: ['bank hops'] },
];

interface Lay {
  P: Platform[];
  V: Vine[];
  C: Collectible[];
  hints: StageHint[];
  flags: Array<{ x: number; y: number }>;
  marks: Array<{ x: number; y: number }>;
  explain: Array<{ node: number; job: string; idea: string; road?: 'high' | 'low'; x0: number; x1: number; why: string }>;
  pid: number;
  cid: number;
  easy: boolean;
}
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
  else if (k === 'stone') Object.assign(p, { style: 'moss_stone', height: 40 });
  else if (k === 'log') Object.assign(p, { style: 'log', height: 90 });
  else if (k === 'bridge') Object.assign(p, { style: 'canopy_bridge' });
  else if (k === 'creaky') Object.assign(p, { type: 'fragile', creak: L.easy ? 1.2 : 0.88 });
  else if (k === 'crumble') Object.assign(p, { type: 'fragile', style: 'ruin', crumbleAfter: L.easy ? 1.0 : 0.7 });
  else if (k === 'catch') Object.assign(p, { catch: true });
  else if (k === 'lily') Object.assign(p, { style: undefined, height: 12, lily: true });
  else if (k === 'reed') Object.assign(p, { style: undefined, height: 30 });
  else if (k === 'mushroom') Object.assign(p, { type: 'bouncy', style: undefined, height: 30 });
  L.P.push(p);
  return p;
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

/** a run of pieces of one kind: each a gap on from the last and dy higher (up +), widths and steps rolled in their ranges. Steps are
 *  clamped to the band; a step whose gap the gate allows under MIN_GAP comes down 10 px at a time until it is a real jump */
function hops(L: Lay, c: Cursor, R: Rng, k: string, n: number, w: [number, number], dy: number[], gap: [number, number]): Cursor {
  let { x, y } = c;
  const h = k === 'bank' ? 120 : k === 'stone' ? 40 : k === 'log' ? 90 : 24;
  const type = k === 'creaky' || k === 'crumble' ? 'fragile' : 'solid';
  for (let i = 0; i < n; i++) {
    let d = R.pick(dy);
    if (y - d < band.yMin || y - d > band.yMax) d = -d;
    if (y - d < band.yMin || y - d > band.yMax) d = 0;
    const f = easyFit(L, d, R.r(w[0], w[1]), R.r(gap[0], gap[1]));
    let max = gateGap(L, y, { y: y - f.dy, height: h, type }, f.dy);
    while (max < MIN_GAP + 10 && f.dy > 0) { f.dy -= 10; max = gateGap(L, y, { y: y - f.dy, height: h, type }, f.dy); }
    f.gap = Math.max(MIN_GAP, Math.min(f.gap, max - 4));
    x += f.gap;
    y -= f.dy;
    plat(L, k, x, y, f.w);
    x += f.w;
  }
  return { x, y };
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

/** the middle-most of these pieces with nothing over it for 140 px (a mark on it is never inside a piece above) */
function clearPiece(L: Lay, ps: Platform[]): Platform | undefined {
  const mid = ps.length >> 1;
  const order = ps.map((p, i) => [Math.abs(i - mid), p] as const).sort((a, b) => a[0] - b[0]).map(([, p]) => p);
  return order.find((p) => p.type !== 'bouncy' && !L.P.some((q) => q !== p && q.x < p.x + p.width / 2 + 40 && q.x + q.width > p.x + p.width / 2 - 40 && q.y < p.y && p.y - q.y < 140));
}

/** one idea, laid from the cursor; returns the way's end */
function idea(L: Lay, name: Idea, c: Cursor, R: Rng): Cursor {
  switch (name) {
    case 'bank hops':
      return hops(L, c, R, 'bank', R.i(12, 15), [150, 260], [0, 40, -40, 20, -20], [70, 90]);
    case 'stump hop': {
      // (CP2: bank -> stones of three heights; Easy step 1 is +40 onto a stone of 110 px or more)
      let e = hops(L, c, R, 'stone', 1, [110, 140], [40], [80, 90]);
      e = hops(L, e, R, 'stone', R.i(6, 8), [110, 233], [40, -40, -70, 20], [80, 90]);
      return hops(L, e, R, 'bank', 1, [200, 240], [-20, 0], [80, 90]);
    }
    case 'snap teach': {
      // (expose, then validate: a creaky twig low over a long bank, then two over safe ground; nothing to fall into)
      const bank = plat(L, 'bank', c.x + 80, c.y, 900);
      plat(L, 'creaky', bank.x + 200, c.y - 60, 150);
      plat(L, 'creaky', bank.x + 470, c.y - 70, 140);
      plat(L, 'creaky', bank.x + 690, c.y - 60, 130);
      return { x: bank.x + bank.width, y: c.y };
    }
    case 'snap dash':
      // (the full form: creaky twigs over real gaps; a twig holds 0.88 s Normal, 1.2 s Easy)
      return hops(L, hops(L, c, R, 'creaky', R.i(9, 11), [110, 170], [0, 20, -20], [70, 90]), R, 'bank', 1, [220, 280], [0], [70, 80]);
    case 'bounce up': {
      // (the old 1-1's highRoad: a mushroom on the ground, branches 170-200 px over it, proven there)
      const pad = plat(L, 'bank', c.x + 80, c.y, 300);
      plat(L, 'mushroom', pad.x + 170, c.y - 30, 70);
      const by = c.y - Math.round(R.r(170, 200));
      const b = plat(L, 'branch', pad.x + 210, by, Math.round(R.r(220, 280)));
      return hops(L, { x: b.x + b.width, y: by }, R, 'branch', R.i(5, 7), [170, 260], [0, 20, -20], [70, 90]);
    }
    case 'the climb': {
      // (CP2 cp2-climb.out: a bank, a climbing vine at its end, a bough 170-300 px up out from it, on the bough in 1.2-2.4 s)
      const bank = plat(L, 'bank', c.x + 80, c.y, 260);
      const rise = Math.round(R.r(170, Math.min(300, c.y - LIMIT.yMin)));
      const vx = bank.x + bank.width + 2;
      L.V.push({ id: -1, x: vx, topY: c.y - rise - 30, bottomY: c.y, swaySpeed: 0, swayPhase: 0, vineType: 'tree_climb' } as Vine);
      const b = plat(L, 'branch', vx + 13, c.y - rise, Math.round(R.r(240, 300)));
      return { x: b.x + b.width, y: b.y };
    }
    case 'crumbling ledge':
      // (CP2: World 7's tile, 110 px, crumbleAfter 0.7 s Normal / 1.0 s Easy; gaps 80; steps of 20)
      return hops(L, hops(L, c, R, 'crumble', R.i(9, 11), [110, 110], [0, 20, -20], [80, 80]), R, 'branch', 1, [220, 260], [0], [70, 80]);
    case 'creaky boughs': {
      // (a bough run with creaky limbs between solid boughs)
      let e = c;
      for (let k = 0, nk = R.i(6, 7); k < nk; k++) {
        e = hops(L, e, R, 'branch', 1, [170, 240], [0, 20, -20], [70, 90]);
        e = hops(L, e, R, 'creaky', 1, [110, 150], [0, 20, -20], [70, 90]);
      }
      return hops(L, e, R, 'branch', 1, [220, 260], [0], [70, 80]);
    }
    case 'lily-pad hop':
      // (CP2: lily pads 82-102 px, gaps 80-95, flat; back to a bank)
      return hops(L, hops(L, c, R, 'lily', R.i(9, 11), [82, 102], [0], [80, 90]), R, 'bank', 1, [200, 240], [0, -20], [80, 85]);
    case 'reed isles':
      return hops(L, hops(L, c, R, 'reed', R.i(9, 11), [120, 140], [0, 20, -20], [80, 90]), R, 'bank', 1, [200, 240], [0, -20], [80, 90]);
    case 'bank walk': {
      const b = plat(L, 'bank', c.x + 80, c.y, Math.round(R.r(600, 700)));
      return { x: b.x + b.width, y: b.y };
    }
    case 'rotten-branch drop': {
      // (CP2: branch -> creaky limb 40 down, gap 60 -> catch branch 150 down, gap 120 -> bank 120 down, gap 80; 421-667 ms)
      let e = hops(L, c, R, 'branch', 1, [220, 240], [0], [70, 80]);
      if (e.y + 310 > LIMIT.yMax) e = { x: e.x, y: e.y };
      e = hops(L, e, R, 'creaky', 1, [225, 225], [-40], [60, 60]);
      e = hops(L, e, R, 'catch', 1, [110, 110], [-150], [120, 120]);
      return hops(L, e, R, 'bank', 1, [150, 200], [-120], [80, 80]);
    }
    case 'push block': {
      // (CP2 cp2-push.out, the shipped logPuzzle: a 220 x 100 log pushed against a 230 px wall, then a double jump to the top)
      const run = plat(L, 'bank', c.x + 80, c.y, 900);
      const wallX = run.x + run.width;
      const log = plat(L, 'log', run.x + 260, c.y - 100, 220) as Platform & Record<string, unknown>;
      Object.assign(log, { height: 100, push: { min: run.x + 40, max: wallX - 55 } });
      // (the designer's ruling, CP3: the wall at 190 px, the log's 100 plus a 90 px single-jump rise: 1-5 is before doubles count)
      const top = plat(L, 'bank', wallX, c.y - 190, Math.round(R.r(420, 560)));
      Object.assign(top, { height: 190 + 120 });
      L.hints.push({ x: log.x - 160, text: 'Keep sliding into the log to push it', pad: 'Hold the pad into the log to push it', keys: 'Hold left or right into the log to push it', aboveY: c.y + 60 } as StageHint);
      return { x: top.x + top.width, y: top.y };
    }
    case 'bough stair':
      // (CP2, with Easy's rule: Normal steps +50 to +70 onto boughs of 220 px or more; Easy +30 to +40, gaps 80 or less)
      return L.easy
        ? hops(L, hops(L, c, R, 'branch', R.i(7, 9), [120, 160], [30, 35, 40], [70, 80]), R, 'branch', 1, [240, 280], [0], [70, 80])
        : hops(L, hops(L, c, R, 'branch', R.i(4, 6), [220, 260], [50, 60, 70], [70, 90]), R, 'branch', 1, [240, 280], [0], [70, 80]);
    case 'bridge span':
      return hops(L, hops(L, c, R, 'bridge', R.i(8, 10), [112, 300], [0, 30, -30], [80, 90]), R, 'bank', 1, [220, 260], [0], [80, 80]);
  }
}

/**
 * Build 1-5 from its node plan. Normal and Easy draw the same ideas from the same streams (Easy only changes sizes), so a roll is the
 * same stage in both settings.
 */
export function buildMix15(config: LevelConfig, seed: number, easy: boolean): GeneratedStage & { proto: ProtoExtras } {
  const L: Lay = { P: [], V: [], C: [], hints: [], flags: [], marks: [], explain: [], pid: 1, cid: 1, easy };
  /** what each node rolled (a fork: both roads' ideas), so a later node can be held off it */
  const rolled: Array<string[]> = [];
  // (today's frame, kept by the designer: down from the canopy to the floor at dusk; the start is high)
  let c: Cursor = { x: 0, y: 460 };
  // the start: a flat bank, the spawn on it
  const start = plat(L, 'bank', 0, c.y, 520);
  c = { x: start.width, y: c.y };
  L.flags.push({ x: 100, y: c.y });
  const forkMarks: Array<{ x: number; y: number }> = [];
  PLAN_15.forEach((n, i) => {
    const R = rngFor(seed, `1-5 n${i}`);
    const x0 = c.x;
    if (n.flagBefore) {
      const pad = plat(L, 'bank', c.x + 80, c.y, 320);
      L.flags.push({ x: pad.x + 120, y: c.y });
      c = { x: pad.x + pad.width, y: c.y };
    }
    if (n.hint) L.hints.push({ x: c.x + 60, text: n.hint, pad: n.padHint ?? n.hint, keys: n.padHint ?? n.hint, ...(c.y >= 600 ? { belowY: c.y - 60 } : { aboveY: c.y + 60 }) } as StageHint);
    const from = L.P.length;
    if (Array.isArray(n.deck)) {
      const off = new Set([...(rolled[i - 1] ?? []), ...(n.not !== undefined ? rolled[n.not - 1] ?? [] : [])]);
      const deck = n.deck.filter((d) => !off.has(d));
      const pick = R.pick(deck.length ? deck : n.deck);
      rolled[i] = [pick];
      c = idea(L, pick, c, R);
      L.explain.push({ node: i + 1, job: n.job, idea: pick, x0, x1: c.x, why: `drawn from [${n.deck.join(', ')}]${deck.length < n.deck.length ? `, not ${n.deck.filter((d) => !deck.includes(d)).join(', ')} (rolled by the node before or the node it must differ from)` : ''}` });
    } else {
      // the fork: a high road at the cursor and a low road 200 px under it, side by side; they rejoin on one bank
      // (neither road repeats the idea the node before rolled: no idea twice in a row)
      const prev = new Set(rolled[i - 1] ?? []);
      const hiDeck = n.deck.high.filter((d) => !prev.has(d)), loDeck = n.deck.low.filter((d) => !prev.has(d));
      const hi = R.pick(hiDeck.length ? hiDeck : n.deck.high), lo = R.pick(loDeck.length ? loDeck : n.deck.low);
      rolled[i] = [hi, lo];
      const forkBank = plat(L, 'bank', c.x + 80, c.y, 240);
      // (each road keeps to its own band, 200 px apart, so they never meet: the high road no lower than 60 px under the fork bank,
      // the low road no higher than 60 px over its start)
      const hy = c.y, ly = Math.min(LIMIT.yMax, c.y + 200);
      band = { yMin: Math.max(LIMIT.yMin, hy - 160), yMax: hy + 60 };
      const forkFrom = L.P.length;
      const hiEnd = idea(L, hi, { x: forkBank.x + forkBank.width, y: hy }, R);
      // (the low road starts under the gap off the fork bank's end, so running off that end drops him onto it)
      const lowStart = { x: forkBank.x + forkBank.width - 90, y: ly };
      band = { yMin: ly - 60, yMax: Math.min(LIMIT.yMax, ly + 160) };
      const lowFrom = L.P.length;
      const loEnd = idea(L, lo, lowStart, R);
      band = { ...LIMIT };
      // (rejoin: one long bank 30 px over the low road's end, a gap the gate allows on from it, and long enough to run on under the high
      // road's end, which drops onto it)
      const ry = Math.max(LIMIT.yMin, loEnd.y - 30);
      const rx = loEnd.x + Math.min(70, gateGap(L, loEnd.y, { y: ry, height: 120, type: 'solid' }, loEnd.y - ry) - 4);
      const rejoin = plat(L, 'bank', rx, ry, Math.max(320, hiEnd.x + 240 - rx));
      L.explain.push({ node: i + 1, job: n.job, idea: hi, road: 'high', x0, x1: hiEnd.x, why: `high road from [${n.deck.high.join(', ')}]` });
      L.explain.push({ node: i + 1, job: n.job, idea: lo, road: 'low', x0: lowStart.x, x1: loEnd.x, why: `low road from [${n.deck.low.join(', ')}]` });
      petalsOver(L, lowFrom);
      // (Meeca's marks, the designer's ruling: one on each road; the high road's at its hardest spot, its middle piece)
      const hiPs = L.P.slice(forkFrom, lowFrom), loPs = L.P.slice(lowFrom, L.P.length - 1);
      const hm = clearPiece(L, hiPs), lm = clearPiece(L, loPs);
      if (hm) forkMarks.push({ x: hm.x + hm.width / 2, y: hm.y });
      if (lm) forkMarks.push({ x: lm.x + lm.width / 2, y: lm.y });
      c = { x: rejoin.x + rejoin.width, y: ry };
    }
    petalsOver(L, from);
    // one of Meeca's marks in each non-fork node, on the main route, on a piece the idea laid (its middle one)
    if (Array.isArray(n.deck)) { const m = clearPiece(L, L.P.slice(from)); if (m) L.marks.push({ x: m.x + m.width / 2, y: m.y }); }
    // (n9's golden seed: the designer's ruling (b), CP3: no seed on 1-5; Dot's line plays here, the seed waits for the stage that teaches
    // the glide. The far-off glint, dressing only, is a separate small piece still to draw)
    if (n.heartAfter && !easy) L.C.push({ id: L.cid++, type: 'heart', x: c.x + 40, y: c.y - 60, collected: false, bobPhase: 0 } as Collectible);
  });
  const end = plat(L, 'bank', c.x + 80, c.y, 640);
  const exit = { x: end.x + 420, y: c.y };
  L.marks.push(...forkMarks);
  for (const m of L.marks) L.C.push({ id: L.cid++, type: 'relic', mark: 'meeca', x: m.x, y: m.y - 34, collected: false, bobPhase: (m.x * 0.017) % 6.28 } as Collectible);
  const find = findForStage(config.worldIndex, config.miniIndex);
  if (find) L.C.push({ id: L.cid++, type: 'find', findId: find.id, hidden: false, x: end.x + 200, y: c.y - 26, collected: false, bobPhase: 0 } as Collectible);
  L.C.push({ id: L.cid++, type: 'exit_totem', x: exit.x, y: exit.y - 30, collected: false, bobPhase: 0 } as Collectible);
  L.V.forEach((v, k) => (v.id = k + 1));
  // (every gap is a drop: World 1 paints an unmarked fall as water otherwise)
  for (const p of L.P) if (p.type === 'solid' || p.type === 'fragile') (p as Platform & { pit?: string }).pit = 'drop';
  const movedPickups = fixPickups({ platforms: L.P, vines: L.V, ropes: [] }, L.C);
  const width = end.x + end.width + 40;
  const height = Math.max(...L.P.map((p) => p.y + p.height)) + 120;
  const nMarks = L.marks.length;
  const cfg: LevelConfig = { ...config, levelWidth: width, levelHeight: height, targetCount: Math.max(1, Math.round(nMarks * (easy ? 0.65 : 0.85))) };
  const beats: Array<[number, number, string]> = L.explain.map((e) => [e.x0, e.x1, `${e.job}: ${e.idea}${e.road ? ` (${e.road} road)` : ''}`]);
  return {
    config: cfg, trees: [], platforms: L.P, vines: L.V, ropes: [], enemies: [], boss: null, collectibles: L.C,
    spawnX: 100, spawnY: 460, exitTotemX: exit.x, exitTotemY: exit.y,
    checkpoints: L.flags.map((f) => ({ x: f.x, y: f.y, reached: false })).sort((a, b) => a.x - b.x),
    easyGoal: Math.max(1, Math.round(nMarks * 0.65)), normalGoal: Math.max(1, Math.round(nMarks * 0.85)),
    meta: { attempt: seed, chunks: L.explain.map((e) => e.idea), width, pieces: L.explain.map((e) => ({ k: `1-5 ${e.idea}`, x0: e.x0, x1: e.x1 })), mix: { explain: L.explain } },
    proto: { hints: L.hints.sort((a, b) => a.x - b.x), covers: [], beats, movedPickups, ownPetals: true },
  } as unknown as GeneratedStage & { proto: ProtoExtras };
}
