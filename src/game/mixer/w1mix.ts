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
  | 'lily-pad hop' | 'reed isles' | 'bank walk' | 'rotten-branch drop' | 'push block' | 'bough stair' | 'bridge span' | 'canopy over floor';
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
  /** the difficulty dial's gap, as a share of the gate's widest (ENGINE-SPEC "The difficulty dial") */
  gapShare: number;
  /** the dial's d for this stage (0 at 1-1, 1 at 10-9) */
  dial: number;
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

/** each piece kind's widths by size band (short under 150 px, medium 150-300, long over 300), inside the shipped p10-p90 (cp2/library.txt)
 *  and CP2's proven sizes */
const BANDS: Record<string, Array<[number, number]>> = {
  bank: [[110, 148], [160, 290], [310, 360]], stone: [[60, 140], [160, 233]], log: [[180, 290], [310, 420]], branch: [[110, 148], [160, 290]],
  bridge: [[112, 148], [160, 300]], creaky: [[110, 148], [150, 170]], crumble: [[110, 110]], lily: [[82, 102]], reed: [[120, 140]],
};
const HEIGHT: Record<string, number> = { bank: 120, stone: 40, log: 90 };
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
    const bnd = bands[(i + Math.floor(i / 2)) % bands.length];
    let d = R.pick(steps);
    // (outside its band a burst steps back toward it; inside, a step that would leave the band turns round, or shrinks to 30 px)
    if (y > band.yMax) d = Math.abs(d) || FLAT + 10;
    else if (y < band.yMin) d = -(Math.abs(d) || FLAT + 10);
    else {
      if (y - d < band.yMin || y - d > band.yMax) d = -d;
      if (y - d < band.yMin || y - d > band.yMax) d = Math.sign(-d) * (FLAT + 10);
      if (y - d < band.yMin || y - d > band.yMax) d = 0;
    }
    const f = easyFit(L, d, width ?? Math.round(R.r(bnd[0], bnd[1])), 999);
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
  const n = R.i(4, 6);
  switch (name) {
    case 'bank hops': return burst(L, c, R, R.pick([['bank', 'stone', 'log'], ['log', 'bank'], ['stone', 'bank', 'log']]), n);
    case 'stump hop': return burst(L, c, R, ['stone', 'bank'], n, [40, -40, -70, 30, -30]);
    case 'snap teach': {
      // (expose, then validate: a creaky twig low over a long bank, then two over safe ground; nothing to fall into)
      const bank = step(L, c, R, 'bank', 900);
      plat(L, 'creaky', bank.x + 200, bank.y - 60, 150);
      plat(L, 'creaky', bank.x + 470, bank.y - 70, 140);
      plat(L, 'creaky', bank.x + 690, bank.y - 60, 130);
      return { x: bank.x + bank.width, y: bank.y };
    }
    case 'snap dash': return burst(L, c, R, ['creaky', 'branch'], n);
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
      return burst(L, c, R, ['branch', 'log'], n, L.easy ? [30, 40] : [50, 60, 70]);
    case 'bridge span': return burst(L, c, R, ['bridge', 'branch'], n, [30, -30, 40, -40]);
    case 'canopy over floor': {
      // (the designer's rulings (b), CP3 and 11-05 1:11 AM: the old 1-1's canopy over the floor in short stretches, not one long one.
      // Each stretch: a mushroom on a bank bounces him up into 2-3 boughs 170-200 px up (the old 1-1's highRoad heights), in the
      // stretch's own height band; under them the low route is one long walk on a log, with no jump to meet a bough over his head; past
      // the boughs both come down onto the same ground, and a hop or two on the floor leads to the next stretch)
      let e = c;
      const stretches = 3;
      for (let s = 0; s < stretches; s++) {
        // (the pad steps up or down from the floor before it, as every landing does)
        // (each stretch differs in its sizes and its floor, so the three never read as one piece three times: the gate's "something new")
        burst(L, e, R, ['bank'], 1, STEPS, undefined, s === 1 ? 260 : 300);
        const pad = L.P[L.P.length - 1];
        e = { x: e.x, y: pad.y };
        plat(L, 'mushroom', pad.x + 170, e.y - 30, 70);
        const by = e.y - Math.round(R.r(170, 200));
        // (the boughs stay 140-200 px over the floor: a jump off a bough (about 180 px up with the double) down to the floor must fall
        // less than the long fall that hurts (engine.ts LONG_FALL, 400 px), since the floor is the low route, not a miss)
        const save = band;
        band = { yMin: e.y - 200, yMax: e.y - 140 };
        // (the first bough starts 210 px along the pad, clear of the mushroom's bounce, as the old 1-1's highRoad and "bounce up" lay it)
        const b0 = plat(L, s === 1 ? 'bridge' : 'branch', pad.x + 210, by, Math.round(s === 1 ? R.r(124, 148) : R.r(160, 240)));
        const hiEnd = burst(L, { x: b0.x + b0.width, y: by }, R, [['bridge', 'branch'], ['branch', 'bridge'], ['bridge']][s % 3], R.i(1, 2), [30, -30]);
        band = save;
        // (the floor runs 220 px on past the last bough, so stepping off the boughs' end is a plain drop onto wide ground in view: a
        // first-timer stood 8-20 s at a 60 px lip, cp3-ft stuck spots)
        const log = plat(L, (['log', 'bank', 'stone'] as const)[s % 3], pad.x + pad.width, e.y, Math.max(300, hiEnd.x - (pad.x + pad.width) + 220));
        e = burst(L, { x: log.x + log.width, y: e.y }, R, s === stretches - 1 ? ['stone', 'bank'] : R.pick([['stone'], ['stone', 'bank']]), s === stretches - 1 ? R.i(2, 3) : R.i(1, 2));
      }
      return e;
    }
  }
}

/**
 * Build 1-5 from its node plan. Normal and Easy draw the same ideas from the same streams (Easy only changes sizes), so a roll is the
 * same stage in both settings.
 */
export function buildMix15(config: LevelConfig, seed: number, easy: boolean): GeneratedStage & { proto: ProtoExtras } {
  // (the difficulty dial, ENGINE-SPEC: d from the world and stage; the gap is this share of the gate's widest)
  const d = (0.1 * (config.worldIndex - 1) + 0.2 * (config.miniIndex - 1) / 8) / 1.1;
  const gapShare = easy ? 0.45 + 0.35 * d : 0.55 + 0.37 * d;
  const L: Lay = { P: [], V: [], C: [], hints: [], flags: [], marks: [], explain: [], pid: 1, cid: 1, easy, gapShare, dial: d };
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
    const R = rngFor(seed, `1-5 n${i}`);
    const x0 = c.x;
    if (n.flagBefore) {
      // (a medium log, not another bank beside the banks around it: the gate's "something new")
      const pad = step(L, c, R, 'log', 280);
      L.flags.push({ x: pad.x + 120, y: pad.y });
      c = { x: pad.x + pad.width, y: pad.y };
    }
    if (n.hint) L.hints.push({ x: c.x + 60, text: n.hint, pad: n.padHint ?? n.hint, keys: n.padHint ?? n.hint, ...(c.y >= 600 ? { belowY: c.y - 60 } : { aboveY: c.y + 60 }) } as StageHint);
    const from = L.P.length;
    if (Array.isArray(n.deck)) {
      // (the designer's ruling (a), CP3: a node lays 2-3 bursts from its deck, alternating ideas, never the same idea twice in a row;
      // a node with one idea alternates it with "canopy over floor"; the teach alternates with bank hops; rest and cool down lay one)
      const one = n.job === 'rest' || n.job === 'cool down';
      const pool: Idea[] = n.job.startsWith('teach') ? [...n.deck, 'bank hops'] : n.deck.length > 1 ? [...n.deck, 'canopy over floor'] : [...n.deck, 'canopy over floor'];
      const off = new Set([...(rolled[i - 1] ?? []), ...(n.not !== undefined ? rolled[n.not - 1] ?? [] : [])]);
      // (the difficulty dial's bursts per node: 2 at d = 0, 3 at d = 1, ENGINE-SPEC "The difficulty dial")
      const bursts = one ? 1 : Math.round(2 + L.dial);
      const laid: Idea[] = [];
      let last = lastIdea;
      // (the node's own idea comes first: its job is what it teaches or tests)
      for (let k = 0; k < bursts; k++) {
        const own = n.deck.filter((d) => d !== last && !off.has(d));
        // (the designer's ruling, 11-05 1:11 AM: canopy over floor recurs with the other bursts, never twice in a row; it is each node's
        // second burst wherever the pool has it)
        const canopy: Idea[] = k === 1 && last !== 'canopy over floor' && pool.includes('canopy over floor') ? ['canopy over floor'] : [];
        const cand = k === 0 && own.length ? own : canopy.length ? canopy : pool.filter((d) => d !== last && !(k === 0 && off.has(d)) && !laid.includes(d));
        const pick = R.pick(cand.length ? cand : pool.filter((d) => d !== last));
        const bx = c.x;
        c = idea(L, pick, c, R);
        L.explain.push({ node: i + 1, job: n.job, idea: pick, x0: bx, x1: c.x, why: `burst ${k + 1} of ${bursts} from [${pool.join(', ')}]` });
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
      const hy = forkBank.y, ly = hy + 260;
      band = { yMin: Math.max(LIMIT.yMin, hy - 160), yMax: hy };
      const forkFrom = L.P.length;
      // (each road lays two bursts, its deck's two ideas in turn, so the fork is a real stretch of the stage: the plan's 15-20% each)
      lastIdea = lo2;
      const hiEnd = idea(L, hi2, idea(L, hi, { x: forkBank.x + forkBank.width, y: hy }, R), R);
      // (the low road starts under the gap off the fork bank's end, so running off that end drops him onto it)
      const lowStart = { x: forkBank.x + forkBank.width - 90, y: ly };
      band = { yMin: ly, yMax: ly + 160 };
      const lowFrom = L.P.length;
      const loEnd = idea(L, lo2, idea(L, lo, lowStart, R), R);
      band = { ...LIMIT };
      // (rejoin: one long bank 30 px over the low road's end, a gap the gate allows on from it, and long enough to run on under the high
      // road's end, which drops onto it)
      const ry = Math.max(LIMIT.yMin, loEnd.y - 30);
      const rx = loEnd.x + Math.min(70, gateGap(L, loEnd.y, { y: ry, height: 120, type: 'solid' }, loEnd.y - ry) - 4);
      const rejoin = plat(L, 'bank', rx, ry, Math.max(320, hiEnd.x + 240 - rx));
      L.explain.push({ node: i + 1, job: n.job, idea: `${hi} + ${hi2}` as Idea, road: 'high', x0, x1: hiEnd.x, why: `high road from [${n.deck.high.join(', ')}]` });
      L.explain.push({ node: i + 1, job: n.job, idea: `${lo} + ${lo2}` as Idea, road: 'low', x0: lowStart.x, x1: loEnd.x, why: `low road from [${n.deck.low.join(', ')}]` });
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
  const end = step(L, c, rngFor(seed, '1-5 end'), 'bank', 640);
  const exit = { x: end.x + 420, y: end.y };
  L.marks.push(...forkMarks);
  for (const m of L.marks) L.C.push({ id: L.cid++, type: 'relic', mark: 'meeca', x: m.x, y: m.y - 34, collected: false, bobPhase: (m.x * 0.017) % 6.28 } as Collectible);
  const find = findForStage(config.worldIndex, config.miniIndex);
  if (find) L.C.push({ id: L.cid++, type: 'find', findId: find.id, hidden: false, x: end.x + 200, y: end.y - 26, collected: false, bobPhase: 0 } as Collectible);
  L.C.push({ id: L.cid++, type: 'exit_totem', x: exit.x, y: exit.y - 30, collected: false, bobPhase: 0 } as Collectible);
  L.V.forEach((v, k) => (v.id = k + 1));
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
  const cfg: LevelConfig = { ...config, levelWidth: width, levelHeight: height, targetCount: Math.max(1, Math.round(nMarks * (easy ? 0.65 : 0.85))) };
  const beats: Array<[number, number, string]> = L.explain.map((e) => [e.x0, e.x1, `${e.job}: ${e.idea}${e.road ? ` (${e.road} road)` : ''}`]);
  const stage = {
    config: cfg, trees: [], platforms: L.P, vines: L.V, ropes: [], enemies: [], boss: null, collectibles: L.C,
    spawnX: 100, spawnY: 460, exitTotemX: exit.x, exitTotemY: exit.y,
    checkpoints: L.flags.map((f) => ({ x: f.x, y: f.y, reached: false })).sort((a, b) => a.x - b.x),
    easyGoal: Math.max(1, Math.round(nMarks * 0.65)), normalGoal: Math.max(1, Math.round(nMarks * 0.85)),
    meta: { attempt: seed, chunks: L.explain.map((e) => e.idea), width, pieces: L.explain.map((e) => ({ k: `1-5 ${e.idea}`, x0: e.x0, x1: e.x1 })), mix: { explain: L.explain } },
    proto: { hints: L.hints.sort((a, b) => a.x - b.x), covers: [], beats, movedPickups, ownPetals: true },
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
