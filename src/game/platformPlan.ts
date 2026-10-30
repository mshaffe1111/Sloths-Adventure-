/**
 * platformPlan — which look every platform gets (pure logic, no canvas).
 *
 * The stage generator tags platforms with a `style` (branch, log, moss_stone, ruin, canopy_bridge) and a `type`; this turns
 * them into what is drawn, with the variety rules the art needs:
 *   - a platform never changes between frames or visits: everything is a hash of its id (plus the scene seed for ground);
 *   - along a stage's thin platforms no look takes more than 40% (bridges aside), the same look never repeats three times in
 *     a row, and a stage with 8 or more of them shows at least 4 different looks. The generator's style stays the main
 *     voice (a `log` is drawn as a log); only where a stage leans too hard on one style do neighbours swap to a kin look;
 *   - each look has several variants, picked with a use-count penalty so neighbours of the same look rarely match;
 *   - ground blocks get one of four treatments per stretch, steps climbing to the exit are found and drawn as stairs, and
 *     free-standing narrow blocks are found and drawn as pillars.
 * Collision never depends on any of this: the plan only decides how the same flat tops are painted.
 */
import type { Platform } from './types.ts';

/**
 * What a thin platform is drawn as. `plank`, `slices` and `lashed` are the three faces of a fragile platform (boards, rotten
 * log slices, lashed sticks): all read as "this will give way" (cracks, frayed lashings), but they are different shapes.
 * `toadstool`, `parasol` and `bloom` are the three bounce plants: different silhouettes, one cue (the up-arrow above).
 * `raft`, `barge` and `pad` are the moving platforms (one cue: the direction chevrons); `drift`, `canoe` and `reeds` are the
 * river carriers of World 2 (one cue: they bob and slide between the banks).
 */
export type ThinLook =
  | 'island' | 'branch' | 'log' | 'stone' | 'ruin' | 'shelf' | 'bridge'
  | 'plank' | 'slices' | 'lashed' | 'toadstool' | 'parasol' | 'bloom'
  | 'raft' | 'barge' | 'pad' | 'drift' | 'canoe' | 'reeds'
  | 'jetty' | 'slate' | 'silk' | 'root' | 'basalt' | 'steps';

/** how many variants each look has */
export const VARIANTS: Record<ThinLook, number> = {
  island: 3, branch: 5, log: 4, stone: 4, ruin: 4, shelf: 3, bridge: 3, plank: 2, slices: 2, lashed: 2, toadstool: 3, parasol: 3, bloom: 3, raft: 3, barge: 3, pad: 3, drift: 3, canoe: 3, reeds: 3,
  jetty: 2, slate: 2, silk: 2, root: 2, basalt: 2, steps: 2,
};

/**
 * The material a world is known by (worldLedges.ts), and the share of its ordinary stepping platforms that take it. The rest keep
 * the mixed looks, so a stage is never one repeated shape; the signature is exempt from the 38% cap and the no-three-in-a-row rule
 * (like bridges, it is the place, not a repeat). Worlds without an entry keep today's mix.
 */
export const SIGNATURE: Partial<Record<number, { look: ThinLook; share: number }>> = {
  2: { look: 'jetty', share: 0.5 },
  4: { look: 'slate', share: 0.5 },
  5: { look: 'silk', share: 0.45 },
  6: { look: 'root', share: 0.55 },
  9: { look: 'basalt', share: 0.55 },
  10: { look: 'steps', share: 0.55 },
};

const FRAGILE_LOOKS: ThinLook[] = ['plank', 'slices', 'lashed'];
const BOUNCE_LOOKS: ThinLook[] = ['toadstool', 'parasol', 'bloom'];
const RAFT_LOOKS: ThinLook[] = ['raft', 'barge', 'pad'];
const DRIFT_LOOKS: ThinLook[] = ['drift', 'canoe', 'reeds'];

/** narrowest width a variant can be drawn at (below it, variant 0 is used) */
const MIN_W: Partial<Record<ThinLook, number[]>> = {
  branch: [0, 96, 96, 110, 80],
  log: [0, 90, 90, 100],
  stone: [0, 90, 90, 90],
  ruin: [0, 110, 90, 90],
  shelf: [0, 90, 90],
};

export interface ThinPlan {
  look: ThinLook;
  variant: number;
}

export type GroundTreat = 'layered' | 'roots' | 'strata' | 'overhang';
export const TREATS: GroundTreat[] = ['layered', 'roots', 'strata', 'overhang'];

export interface GroundRegion {
  x0: number;
  x1: number;
  treat: GroundTreat;
}

export interface StairRun {
  /** the platforms of the run, left to right */
  steps: Platform[];
  /** true when the steps climb as they go right */
  rising: boolean;
  /** 0..3: which kind of stair (world decides the family; this picks the variant) */
  variant: number;
}

export interface GroundPlan {
  role: 'ground' | 'pillar' | 'step';
  regions: GroundRegion[];
  /** for a pillar: 0..PILLAR_VARIANTS-1 */
  variant: number;
  run?: StairRun;
  stepIndex?: number;
}

export interface StagePlan {
  thin: Map<Platform, ThinPlan>;
  ground: Map<Platform, GroundPlan>;
  /** the looks in thin-platform order (for the variety script) */
  order: ThinLook[];
}

// ───────────────────────────── hashing ─────────────────────────────

/** integer hash of up to four numbers, 0..1 */
export function h01(a: number, b = 0, c = 0, d = 0): number {
  let h = 2166136261 ^ (a | 0);
  h = Math.imul(h ^ (b | 0), 16777619);
  h = Math.imul(h ^ (c | 0), 16777619);
  h = Math.imul(h ^ (d | 0), 16777619);
  h ^= h >>> 15;
  h = Math.imul(h, 2246822519);
  h ^= h >>> 13;
  h = Math.imul(h, 3266489917);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

// ───────────────────────────── thin platforms ─────────────────────────────

const isThin = (p: Platform) => p.height < 50;
const sortX = (p: Platform) => (p.baseX ?? p.x);

/** the look the generator's tags ask for */
export function baseLook(p: Platform): ThinLook {
  // World 7's crumbling ruin tiles are carved slabs; every other fragile platform is timber
  if (p.type === 'fragile') return p.crumbleAfter !== undefined ? 'ruin' : 'plank';
  if (p.type === 'bouncy') return 'toadstool';
  if (p.type === 'moving') return 'raft';
  if (p.type === 'drift') return 'drift';
  switch (p.style) {
    case 'canopy_bridge': return 'bridge';
    case 'branch': return 'branch';
    case 'log': return 'log';
    case 'moss_stone': return 'stone';
    case 'ruin': return 'ruin';
    default: return 'island';
  }
}

const SWAPPABLE = new Set<ThinLook>(['island', 'branch', 'log', 'stone', 'ruin', 'shelf']);
/** looks the variety rules leave alone: a span, and the world's own material */
const exemptLook = (k: ThinLook, world: number) => k === 'bridge' || k === SIGNATURE[world]?.look;

/** which kin look a swapped platform takes, by world (weights); ruins belong to the ruin worlds, shards and girders to theirs */
function altWeights(world: number, from: ThinLook): Array<[ThinLook, number]> {
  const ruinW = world >= 7 ? 3 : 0.6;
  const woody = world === 9 ? 1 : 3;
  const all: Array<[ThinLook, number]> = [
    ['branch', woody], ['log', woody], ['stone', 3], ['island', world >= 9 ? 1.2 : 2], ['shelf', 3], ['ruin', ruinW],
  ];
  return all.filter(([k]) => k !== from);
}

/** the whole plan for the thin platforms of one stage */
function planThin(platforms: readonly Platform[], world: number, out: StagePlan) {
  // (World 7's crumbling tiles are drawn from Matt's painted crumble frames, crumbleArt.ts, not from the kit's looks: they take no
  // part in the mix; until the frames load they fall back to their base look, the carved ruin)
  const thin = platforms.filter((p) => isThin(p) && p.crumbleAfter === undefined).sort((a, b) => sortX(a) - sortX(b) || a.id - b.id);
  const looks: ThinLook[] = thin.map(baseLook);
  const n = thin.length;
  // fragile platforms (and bounce plants) take turns among their faces, so a run of them is never one repeated shape
  const rotate = (from: ThinLook, family: ThinLook[], salt: number) => {
    let last: ThinLook | null = null;
    for (let i = 0; i < n; i++) {
      if (looks[i] !== from) continue;
      const opts = family.filter((k) => k !== last && !(i > 0 && looks[i - 1] === k));
      const pick = opts[Math.floor(h01(thin[i].id, world, salt) * opts.length) % opts.length];
      looks[i] = pick;
      last = pick;
    }
  };
  rotate('plank', FRAGILE_LOOKS, 23);
  rotate('toadstool', BOUNCE_LOOKS, 29);
  rotate('raft', RAFT_LOOKS, 31);
  rotate('drift', DRIFT_LOOKS, 37);
  // the world's own material takes its share of the ordinary stepping platforms (chosen by hash, so it never changes between visits)
  const sig = SIGNATURE[world];
  if (sig) {
    for (let i = 0; i < n; i++) {
      if (thin[i].type !== 'solid' || !SWAPPABLE.has(looks[i]) || thin[i].width < 44) continue;
      if (h01(thin[i].id, world, 61) < sig.share) looks[i] = sig.look;
    }
  }
  const count = (k: ThinLook) => looks.filter((l) => l === k).length;
  const swappable = (i: number) => thin[i].type === 'solid' && SWAPPABLE.has(looks[i]) && thin[i].width >= 44;
  const tripleAt = (i: number, k: ThinLook) => {
    const a = (j: number) => (j === i ? k : looks[j]);
    for (let s = Math.max(0, i - 2); s <= Math.min(n - 3, i); s++) if (a(s) === a(s + 1) && a(s + 1) === a(s + 2)) return true;
    return false;
  };
  const pickAlt = (i: number, cap: number, avoid: ThinLook[] = []): ThinLook | null => {
    const opts = altWeights(world, looks[i]).filter(([k]) => !avoid.includes(k) && count(k) + 1 <= cap && !tripleAt(i, k));
    if (!opts.length) return null;
    const total = opts.reduce((s, [, w]) => s + w, 0);
    let t = h01(thin[i].id, world, 91) * total;
    for (const [k, w] of opts) {
      t -= w;
      if (t <= 0) return k;
    }
    return opts[0][0];
  };

  if (n >= 5) {
    const cap = Math.max(2, Math.floor(n * 0.38));
    // 1. no look takes more than ~38% of the thin platforms (bridges are exempt: they are a span, not a stepping stone)
    for (let guard = 0; guard < 64; guard++) {
      const over = [...new Set(looks)].filter((k) => !exemptLook(k, world) && count(k) > cap).sort((a, b) => count(b) - count(a));
      let done = false;
      for (const worst of over) {
        // swap one of its swappable members, chosen by hash
        const idx = looks.map((l, i) => (l === worst && swappable(i) ? i : -1)).filter((i) => i >= 0);
        idx.sort((a, b) => h01(thin[a].id, 7) - h01(thin[b].id, 7));
        for (const i of idx) {
          const alt = pickAlt(i, cap);
          if (alt) { looks[i] = alt; done = true; break; }
        }
        if (done) break;
      }
      if (!done) break;
    }
    // 2. never three in a row
    for (let i = 2; i < n; i++) {
      if (looks[i] === looks[i - 1] && looks[i] === looks[i - 2] && !exemptLook(looks[i], world)) {
        const j = swappable(i) ? i : swappable(i - 1) ? i - 1 : -1;
        if (j >= 0) {
          const alt = pickAlt(j, Math.max(cap, 3));
          if (alt) looks[j] = alt;
        }
      }
    }
  }
  // 3. a stage with 8 or more thin platforms shows at least four looks
  if (n >= 8) {
    for (let guard = 0; guard < 8 && new Set(looks).size < 4; guard++) {
      const present = new Set(looks);
      const missing = altWeights(world, 'bridge').map(([k]) => k).filter((k) => !present.has(k));
      if (!missing.length) break;
      // take a member of the most common look and give it the missing look
      let top: ThinLook = looks[0];
      for (const k of present) if (!exemptLook(k, world) && count(k) > count(top)) top = k;
      const idx = looks.map((l, i) => (l === top && swappable(i) ? i : -1)).filter((i) => i >= 0);
      if (!idx.length) break;
      idx.sort((a, b) => h01(thin[a].id, 11) - h01(thin[b].id, 11));
      let placed = false;
      for (const i of idx) {
        for (const k of missing) {
          if (!tripleAt(i, k)) { looks[i] = k; placed = true; break; }
        }
        if (placed) break;
      }
      if (!placed) break;
    }
  }

  // variants: a use-count penalty so neighbours of one look rarely match
  const recent = new Map<ThinLook, number[]>();
  for (let i = 0; i < n; i++) {
    const p = thin[i];
    const look = looks[i];
    const nv = VARIANTS[look];
    const used = recent.get(look) ?? [];
    let best = 0;
    let bestScore = Infinity;
    for (let v = 0; v < nv; v++) {
      const minW = MIN_W[look]?.[v] ?? 0;
      if (p.width < minW) continue;
      let score = h01(p.id, v, world, 5) * 1.5;
      if (used.length && used[used.length - 1] === v) score += 4;
      score += used.slice(-3).filter((u) => u === v).length * 1.1;
      if (score < bestScore) { bestScore = score; best = v; }
    }
    used.push(best);
    recent.set(look, used);
    out.thin.set(p, { look, variant: best });
  }
  out.order = looks;
}

// ───────────────────────────── ground ─────────────────────────────

/** treatment weights per world: [layered earth, root tangle, rock strata, mossy overhang] */
const TREAT_W: Record<number, [number, number, number, number]> = {
  1: [3, 3, 2.5, 2], 2: [3, 2.5, 2.5, 2], 3: [2, 3, 3, 2], 4: [2, 2, 2.5, 3.5], 5: [2.5, 3.5, 2, 2],
  6: [2, 3.5, 1.5, 3], 7: [1.5, 2, 4.5, 2], 8: [2, 2, 3, 3], 9: [1.5, 2, 5, 1.5], 10: [1, 1.5, 5.5, 2],
};

function pickTreat(world: number, key: number, seed: number, avoid: GroundTreat | null): GroundTreat {
  const w = TREAT_W[world] ?? TREAT_W[1];
  const opts = TREATS.map((t, i) => [t, w[i]] as [GroundTreat, number]).filter(([t]) => t !== avoid);
  const total = opts.reduce((s, [, x]) => s + x, 0);
  let t = h01(key, seed, world, 17) * total;
  for (const [k, x] of opts) {
    t -= x;
    if (t <= 0) return k;
  }
  return opts[0][0];
}

/** split a ground block into stretches, each with its own treatment; short blocks are one stretch */
export function groundRegions(p: Platform, world: number, seed: number, prev: GroundTreat | null): GroundRegion[] {
  const w = p.width;
  const out: GroundRegion[] = [];
  const nSeg = w < 1050 ? 1 : Math.max(2, Math.round(w / (780 + h01(p.id, seed, 3) * 420)));
  const cuts: number[] = [p.x];
  for (let i = 1; i < nSeg; i++) {
    const base = p.x + (w * i) / nSeg;
    cuts.push(base + (h01(p.id, seed, 40 + i) - 0.5) * Math.min(260, w / nSeg * 0.5));
  }
  cuts.push(p.x + w);
  let last = prev;
  for (let i = 0; i < nSeg; i++) {
    const treat = pickTreat(world, p.id * 31 + i, seed, last);
    out.push({ x0: cuts[i], x1: cuts[i + 1], treat });
    last = treat;
  }
  return out;
}

const NARROW = 130;
const touches = (a: Platform, b: Platform) => Math.abs(a.x + a.width - b.x) <= 4;

/** stair runs: two or more narrow ground blocks side by side, each one step above (or below) the last */
export function findStairs(ground: Platform[], seed: number): StairRun[] {
  const g = [...ground].sort((a, b) => a.x - b.x);
  const runs: StairRun[] = [];
  let i = 0;
  while (i < g.length) {
    const a = g[i];
    if (a.width > NARROW) { i++; continue; }
    const steps: Platform[] = [a];
    let dir = 0;
    let j = i;
    while (j + 1 < g.length) {
      const c = g[j];
      const d = g[j + 1];
      if (d.width > NARROW || !touches(c, d)) break;
      const dy = d.y - c.y;
      const sgn = Math.sign(dy);
      if (Math.abs(dy) < 12 || Math.abs(dy) > 90) break;
      if (dir !== 0 && sgn !== dir) break;
      dir = sgn;
      steps.push(d);
      j++;
    }
    if (steps.length >= 2) {
      runs.push({ steps, rising: dir < 0, variant: Math.floor(h01(steps[0].id, seed, 77) * 3) });
      i = j + 1;
    } else i++;
  }
  return runs;
}

/** how many pillar variants there are: three materials (stone column, trunk, root spire; the variant mod 3) times two dressings */
export const PILLAR_VARIANTS = 6;
/** material weights of pillars per world: [stone, wood, root] */
const PILLAR_W: Record<number, [number, number, number]> = {
  1: [1, 2, 2], 2: [1, 2, 2], 3: [2, 1, 2], 4: [2, 1.5, 2], 5: [1, 2, 2.5], 6: [1, 2.5, 2.5],
  7: [3, 0.6, 1], 8: [2.5, 0.8, 1.5], 9: [3, 0.5, 1.2], 10: [3.5, 0.4, 0.8],
};

function planGround(platforms: readonly Platform[], world: number, seed: number, out: StagePlan) {
  const ground = platforms.filter((p) => !isThin(p) && p.type === 'solid').sort((a, b) => a.x - b.x || a.id - b.id);
  const runs = findStairs(ground, seed);
  const inRun = new Map<Platform, { run: StairRun; idx: number }>();
  for (const run of runs) run.steps.forEach((s, idx) => inRun.set(s, { run, idx }));
  let prev: GroundTreat | null = null;
  // pillars take turns among their variants, so a field of them is never one repeated shape
  const pw = PILLAR_W[world] ?? PILLAR_W[1];
  let pv1 = -1;
  let pv2 = -1;
  for (const p of ground) {
    const st = inRun.get(p);
    if (st) {
      out.ground.set(p, { role: 'step', regions: [], variant: st.run.variant, run: st.run, stepIndex: st.idx });
      continue;
    }
    const left = ground.some((q) => q !== p && touches(q, p));
    const right = ground.some((q) => q !== p && touches(p, q));
    if (p.width < 140 && !left && !right) {
      let best = 0;
      let bestScore = Infinity;
      for (let v = 0; v < PILLAR_VARIANTS; v++) {
        const kind = v % 3;
        let score = h01(p.id, seed, 61, v) - pw[kind] * 0.45;
        if (v === pv1) score += 6;
        if (pv1 >= 0 && kind === pv1 % 3) score += 2.2;
        if (v === pv2) score += 1.5;
        if (pv2 >= 0 && kind === pv2 % 3) score += 0.6;
        if (score < bestScore) { bestScore = score; best = v; }
      }
      pv2 = pv1;
      pv1 = best;
      out.ground.set(p, { role: 'pillar', regions: [], variant: best });
      continue;
    }
    const regions = groundRegions(p, world, seed, prev);
    prev = regions[regions.length - 1].treat;
    out.ground.set(p, { role: 'ground', regions, variant: 0 });
  }
}

// ───────────────────────────── public ─────────────────────────────

export function planStage(platforms: readonly Platform[], world: number, seed: number): StagePlan {
  const out: StagePlan = { thin: new Map(), ground: new Map(), order: [] };
  planThin(platforms, world, out);
  planGround(platforms, world, seed, out);
  return out;
}

/** share of each look among the swappable thin platforms of a plan (for the variety script and tests) */
export function lookShares(order: ThinLook[]): { counts: Record<string, number>; maxShare: number; maxLook: string; distinct: number } {
  const counts: Record<string, number> = {};
  for (const l of order) counts[l] = (counts[l] ?? 0) + 1;
  const n = order.length || 1;
  let maxShare = 0;
  let maxLook = '';
  for (const [k, c] of Object.entries(counts)) {
    if (k === 'bridge') continue;
    if (c / n > maxShare) { maxShare = c / n; maxLook = k; }
  }
  return { counts, maxShare, maxLook, distinct: Object.keys(counts).length };
}

/** longest run of one look in the order (bridges excluded) */
export function longestRun(order: ThinLook[]): number {
  let best = 0;
  let run = 0;
  for (let i = 0; i < order.length; i++) {
    run = i > 0 && order[i] === order[i - 1] && order[i] !== 'bridge' ? run + 1 : 1;
    if (run > best) best = run;
  }
  return best;
}
