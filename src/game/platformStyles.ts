/**
 * What a platform is made of: the one place that chooses a `style` for every platform the generator lays down.
 *
 * `styleFor(kind, world, rng)` answers for one platform, by the kind of piece it belongs to and the flavour of the world (a river world
 * is logs and rope bridges, the ruins are stone, the canopy is branches). The renderer reads `Platform.style`.
 *
 * `balanceStyles` is the stage-wide check run when a stage is finished: a stage never leans on one material for more than
 * 40% of its thin platforms and always shows at least four of the five.
 */
import type { Platform } from './types.ts';

export type PlatformStyle = NonNullable<Platform['style']>;
export const STYLES: readonly PlatformStyle[] = ['branch', 'log', 'moss_stone', 'ruin', 'canopy_bridge'];

/**
 * The kind of platform. Ground is always a log-faced bank. A `bridge` is a rope bridge, a `stump` a log, a `pillar` a column, a `plank`
 * a hanging board. A `ledge` and a `step` are the ordinary hop platforms, and are the ones that take the world's flavour; a `lane-high`
 * is a platform of a two-lane fork's canopy lane, a `lane-low` one of its ground lane.
 */
export type PlatformKind =
  | 'ground' | 'bridge' | 'stump' | 'pillar' | 'plank' | 'crumble' | 'ledge' | 'step' | 'rung' | 'summit' | 'island' | 'peg'
  | 'lane-high' | 'lane-low' | 'canopy' | 'tier' | 'causeway';

type Weights = Partial<Record<PlatformStyle, number>>;

/** how each world dresses an ordinary hop platform (weights, not percentages) */
const WORLD_FLAVOUR: Record<number, Weights> = {
  1: { branch: 5, log: 3, moss_stone: 1, canopy_bridge: 1 },
  2: { log: 5, branch: 2, canopy_bridge: 2, moss_stone: 1 },
  3: { moss_stone: 5, branch: 2, log: 2, ruin: 1 },
  4: { moss_stone: 3, log: 3, canopy_bridge: 3, branch: 2 },
  5: { branch: 4, canopy_bridge: 3, log: 2, moss_stone: 2 },
  6: { log: 5, branch: 3, moss_stone: 2, canopy_bridge: 1 },
  7: { ruin: 5, moss_stone: 4, log: 1, branch: 1 },
  8: { branch: 4, canopy_bridge: 3, moss_stone: 2, ruin: 2, log: 1 },
  9: { moss_stone: 4, ruin: 3, log: 3, branch: 1 },
  10: { ruin: 5, moss_stone: 3, canopy_bridge: 2, log: 1 },
};

/** what each kind of platform is made of regardless of the world (null: it takes the world's flavour) */
const FIXED: Partial<Record<PlatformKind, Weights>> = {
  ground: { log: 1 },
  bridge: { canopy_bridge: 1 },
  stump: { log: 4, moss_stone: 1 },
  pillar: { ruin: 3, moss_stone: 1 },
  causeway: { ruin: 1 },
  summit: { log: 1 },
  crumble: { moss_stone: 3, ruin: 1 },
  plank: { branch: 3, log: 2 },
  rung: { branch: 4, log: 1, moss_stone: 1 },
  canopy: { branch: 4, canopy_bridge: 1 },
  'lane-high': { branch: 4, canopy_bridge: 2, log: 1 },
};

/** kinds whose style the balancing pass may change (the rest are what they are) */
const FLEXIBLE = new Set<PlatformKind>(['ledge', 'step', 'island', 'peg', 'tier', 'lane-high', 'lane-low', 'canopy', 'rung']);

function pick(w: Weights, rng: () => number): PlatformStyle {
  let sum = 0;
  for (const s of STYLES) sum += w[s] ?? 0;
  if (sum <= 0) return 'branch';
  let r = rng() * sum;
  for (const s of STYLES) {
    r -= w[s] ?? 0;
    if (r <= 0) return s;
  }
  return 'branch';
}

/** the style of one platform of this kind in this world; `rng` is the stage's own style stream (a function returning 0..1) */
export function styleFor(kind: PlatformKind, world: number, rng: () => number): PlatformStyle {
  const fixed = FIXED[kind];
  if (fixed) return pick(fixed, rng);
  const flavour = WORLD_FLAVOUR[Math.min(10, Math.max(1, world))] ?? WORLD_FLAVOUR[1];
  if (kind === 'lane-low') return pick({ ...flavour, canopy_bridge: 0 }, rng);
  return pick(flavour, rng);
}

export const isFlexible = (k: PlatformKind) => FLEXIBLE.has(k);

const thin = (p: Platform) => p.height < 50 && p.type !== 'drift' && p.type !== 'bouncy' && !p.broken;

/**
 * Evens out a finished stage: no style on more than 40% of the thin platforms, and at least four distinct styles among them. Only
 * platforms of a flexible kind change, and a style is only ever swapped for one the world uses. `kinds` maps platform id to kind.
 * The pick of which platform changes is deterministic (every n-th one of the crowded style), so the result depends only on the stage.
 */
export function balanceStyles(platforms: Platform[], kinds: Map<number, PlatformKind>, world: number): void {
  const th = platforms.filter(thin);
  if (th.length < 4) return;
  const flavour = WORLD_FLAVOUR[Math.min(10, Math.max(1, world))] ?? WORLD_FLAVOUR[1];
  const counts = () => {
    const c: Record<string, number> = {};
    for (const p of th) c[p.style ?? 'branch'] = (c[p.style ?? 'branch'] ?? 0) + 1;
    return c;
  };
  const flexible = (p: Platform) => isFlexible(kinds.get(p.id) ?? 'ledge') && p.type !== 'fragile';
  // 1. at least four distinct styles: give the next-most-used style of the world to a spread of flexible platforms
  for (let guard = 0; guard < 8; guard++) {
    const c = counts();
    if (Object.keys(c).length >= 4) break;
    const missing = STYLES.filter((s) => !c[s] && (flavour[s] ?? 0) > 0).sort((a, b) => (flavour[b] ?? 0) - (flavour[a] ?? 0))[0]
      ?? STYLES.filter((s) => !c[s])[0];
    if (!missing) break;
    const crowd = Object.entries(c).sort((a, b) => b[1] - a[1])[0][0];
    const pool = th.filter((p) => p.style === crowd && flexible(p));
    if (pool.length < 2) break;
    const need = Math.max(2, Math.round(th.length * 0.15));
    const stepBy = Math.max(1, Math.floor(pool.length / need));
    let given = 0;
    for (let i = Math.floor(stepBy / 2); i < pool.length && given < need; i += stepBy) { pool[i].style = missing; given++; }
  }
  // 2. nothing above 40%
  for (let guard = 0; guard < 12; guard++) {
    const c = counts();
    const [top, n] = Object.entries(c).sort((a, b) => b[1] - a[1])[0];
    if (n <= th.length * 0.4) break;
    const pool = th.filter((p) => p.style === top && flexible(p));
    if (!pool.length) break;
    const others = STYLES.filter((s) => s !== top && (flavour[s] ?? 0) > 0).sort((a, b) => (c[a] ?? 0) - (c[b] ?? 0) || (flavour[b] ?? 0) - (flavour[a] ?? 0));
    const excess = n - Math.floor(th.length * 0.36);
    const stepBy = Math.max(1, Math.floor(pool.length / Math.min(pool.length, excess)));
    let k = 0;
    for (let i = Math.floor(stepBy / 2); i < pool.length && k < excess; i += stepBy) { pool[i].style = others[k % others.length]; k++; }
  }
}
