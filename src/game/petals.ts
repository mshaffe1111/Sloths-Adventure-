/**
 * petals — one pickup, Meeca's petal, in trails with a purpose (Matt, 2026-10-29: "make sure that they're collectible, that there's
 * enough that it stays something that people need to collect in order to get perfect scores, but they're not just so overwhelming that
 * you'll hit 15 in a short little frame. A more clean playthrough is better than having clutter to collect just to collect"; and on
 * reach: "They can be difficult as long as possible").
 *
 * Run on every stage as it is built (protoStage.ts, w2Stages.ts, stageGenerator.ts finishStage for the old generator and gen2):
 *   - every scattered flower, leaf and fruit is a petal (type 'flower', drawn as Meeca's painted petal: vectorArt.ts); World 8's night
 *     blooms stay its harvest's own goal item;
 *   - none the level check cannot reach (levelCheck.ts, the same reach model: a hard line is fine, an impossible one is not);
 *   - none hanging below a required jump's natural arc, where going for it means dipping into the gap: a petal over a jump lies on its
 *     arc or above it (a higher line, a harder one, never a worse take-off or landing);
 *   - no solid rows: of petals spaced closer than ROW_GAP on one line, every other goes; no clumps: of petals closer than CLUMP_GAP, one stays;
 *   - at most PER_SCREEN on any one screen (SCREEN, about a phone's view held either way): the extra on the plainest stretches go first.
 * Goal items keep their own looks and counts: finds, relics, cages, seeds, the thorn gate, World 8's night blooms.
 * pickupCheck (levelCheck.ts) holds every shipped stage to the same rules; the goals are shares of what a stage holds (goals.ts), so they
 * follow.
 */
import type { Collectible, Platform } from './types.ts';
import type { GeneratedStage } from './stageGenerator.ts';
import { jumpEdges } from './stageMetrics.ts';

/** the most petals on one screen, and the screen (world px: wider than an upright phone's view, about a sideways one's) */
export const PER_SCREEN = 6;
export const SCREEN = { w: 840, h: 640 } as const;
/** petals closer than this on one line are a row */
export const ROW_GAP = 150;
/** how far a petal over a jump may hang below the jump's natural arc (px), how far above it (px), and from how far above it is a line
 *  of its own (px) */
export const ARC_SLACK = 70;
export const ARC_ABOVE = 90;
export const ARC_HIGH = 260;

const SCATTER = new Set<Collectible['type']>(['flower', 'leaf', 'fruit']);

/** World 8's harvest: its flowers are the night blooms the goal counts, a goal item of their own */
export const nightBlooms = (stage: Pick<GeneratedStage, 'config'>) => stage.config.worldIndex === 8 && stage.config.objectiveType === 'harvest';

/** a petal (a scattered pickup that is not a goal item of its own) */
export const isPetal = (c: Collectible, stage: Pick<GeneratedStage, 'config'>) => SCATTER.has(c.type) && !c.hidden && !c.findId && !(nightBlooms(stage) && c.type === 'flower');

/** the natural arc's height (feet, world y) over a jump at x: a single jump from the take-off edge to the landing */
export function arcFeet(j: { takeoffX: number; landX: number; from: Platform; to: Platform }, x: number): number {
  const u = Math.max(0, Math.min(1, (x - j.takeoffX) / Math.max(1, j.landX - j.takeoffX)));
  const y0 = j.from.y;
  const y1 = j.to.y;
  const h = Math.min(120, 60 + (j.landX - j.takeoffX) * 0.3);
  return y0 + (y1 - y0) * u - h * 4 * u * (1 - u);
}

/** the petals below a required jump's natural arc (in the gap, where reaching them means a dip: a worse take-off or landing) */
export function offArc(stage: GeneratedStage, petals: readonly Collectible[]): Set<Collectible> {
  const out = new Set<Collectible>();
  for (const j of jumpEdges(stage)) {
    if (j.dir !== 1 || j.gap < 40) continue;
    for (const c of petals) {
      if (c.x <= j.takeoffX + 10 || c.x >= j.landX - 10) continue;
      // (a petal floats about 34 px over the ground he stands on: its body is there when his feet are on the arc). Below the arc it
      // means a dip into the gap; well above it, a higher, later jump from the same edge (Matt, World 7: "going for one makes you miss
      // the jump"); far above, a line of its own reached from somewhere else
      const dy = c.y - (arcFeet(j, c.x) - 34);
      if (dy > ARC_SLACK || (dy < -ARC_ABOVE && dy > -ARC_HIGH)) out.add(c);
    }
  }
  return out;
}

/** of petals on one line closer than ROW_GAP, every other one (the row's middle ones; its ends stay) */
export function rowExtras(petals: readonly Collectible[]): Set<Collectible> {
  const out = new Set<Collectible>();
  const sorted = [...petals].sort((a, b) => a.y - b.y || a.x - b.x);
  const lines: Collectible[][] = [];
  for (const c of sorted) {
    const line = lines.find((l) => Math.abs(l[0].y - c.y) <= 8);
    if (line) line.push(c);
    else lines.push([c]);
  }
  for (const line of lines) {
    line.sort((a, b) => a.x - b.x);
    let run: Collectible[] = [line[0]];
    const flush = () => {
      if (run.length >= 4) run.forEach((c, i) => i % 2 === 1 && i !== run.length - 1 && out.add(c));
    };
    for (let i = 1; i < line.length; i++) {
      if (line[i].x - line[i - 1].x < ROW_GAP) run.push(line[i]);
      else {
        flush();
        run = [line[i]];
      }
    }
    flush();
  }
  return out;
}

/** petals closer than this read as one clump: one of them goes */
export const CLUMP_GAP = 50;

/** petals a stage lays close on purpose and keeps whole: 5-3's orchid cups (petalPass.ts fills it) */
export const KEEP = new WeakSet<Collectible>();

/** of petals closer than CLUMP_GAP, all but one (the first along the route stays; a KEEP one never goes) */
export function clumpExtras(petals: readonly Collectible[]): Set<Collectible> {
  const out = new Set<Collectible>();
  const ps = [...petals].sort((a, b) => a.x - b.x || a.y - b.y);
  for (let i = 0; i < ps.length; i++) {
    if (out.has(ps[i])) continue;
    for (let k = i + 1; k < ps.length && ps[k].x - ps[i].x < CLUMP_GAP; k++) {
      if (!out.has(ps[k]) && !KEEP.has(ps[k]) && Math.hypot(ps[k].x - ps[i].x, ps[k].y - ps[i].y) < CLUMP_GAP) out.add(ps[k]);
    }
  }
  return out;
}

/** the most petals any one screen holds, and where (its left edge x, its middle y) */
export function busiestScreen(petals: readonly Pick<Collectible, 'x' | 'y'>[]): { n: number; x: number; y: number } {
  const ps = [...petals].sort((p, q) => p.x - q.x);
  let best = { n: 0, x: 0, y: 0 };
  let hi = 0;
  for (let lo = 0; lo < ps.length; lo++) {
    while (hi < ps.length && ps[hi].x <= ps[lo].x + SCREEN.w) hi++;
    const win = ps.slice(lo, hi);
    // (the screen's height centred on each petal of the window in turn)
    for (const m of win) {
      const n = win.filter((c) => Math.abs(c.y - m.y) <= SCREEN.h / 2).length;
      if (n > best.n) best = { n, x: ps[lo].x, y: m.y };
    }
  }
  return best;
}

/** of each screen with more than PER_SCREEN, the extra ones (taken from the most crowded spot first, every other along it) */
export function screenExtras(petals: readonly Collectible[]): Set<Collectible> {
  const out = new Set<Collectible>();
  const live = () => petals.filter((c) => !out.has(c));
  for (let guard = 0; guard < 500; guard++) {
    const b = busiestScreen(live());
    if (b.n <= PER_SCREEN) break;
    const inside = live()
      .filter((c) => c.x >= b.x && c.x <= b.x + SCREEN.w && Math.abs(c.y - b.y) <= SCREEN.h / 2)
      .sort((p, q) => p.x - q.x);
    // (the one nearest its neighbours goes: the trail stays spread along the screen; of the screen's lowest ones first, so the plain
    // stretches thin before a high line, a double jump's or a climb's, does)
    const low = Math.max(...inside.map((c) => c.y)) - 60;
    let worst = inside.find((c) => c.y >= low) ?? inside[1] ?? inside[0];
    let close = Infinity;
    for (let i = 1; i < inside.length - 1; i++) {
      const d = inside[i + 1].x - inside[i - 1].x + (inside[i].y >= low ? 0 : 1e6);
      if (d < close) {
        close = d;
        worst = inside[i];
      }
    }
    out.add(worst);
  }
  return out;
}

/** what the pass did (for the tests and the report) */
export interface PetalOut {
  before: number;
  after: number;
  unreachable: number;
  offArc: number;
  rows: number;
  clumps: number;
  crowded: number;
  /** the petals the spread put in (petalPass.ts) */
  filled?: number;
}

/**
 * The pass: the stage's scattered pickups become petals in trails. `unreachable`: the ids the level check found out of reach (the caller
 * runs it: validateStage(stage).errors, so this file stays clear of levelCheck's imports).
 */
export function petalTrail<T extends GeneratedStage>(stage: T, unreachable: ReadonlySet<number> = new Set(), out?: PetalOut): T {
  const all = stage.collectibles.filter((c) => isPetal(c, stage));
  for (const c of all) if (c.type !== 'flower') c.type = 'flower';
  const gone = new Set<Collectible>();
  let n = { unreachable: 0, offArc: 0, rows: 0, clumps: 0, crowded: 0 };
  for (const c of all) if (unreachable.has(c.id)) gone.add(c);
  n.unreachable = gone.size;
  const live = () => all.filter((c) => !gone.has(c));
  const arc = offArc(stage, live());
  arc.forEach((c) => gone.add(c));
  n.offArc = arc.size;
  // (again until none is left: every other one of a long row can leave its last two close)
  for (let k = 0; k < 4; k++) {
    const rows = rowExtras(live());
    if (!rows.size) break;
    rows.forEach((c) => gone.add(c));
    n.rows += rows.size;
  }
  const clump = clumpExtras(live());
  clump.forEach((c) => gone.add(c));
  n.clumps = clump.size;
  const crowd = screenExtras(live());
  crowd.forEach((c) => gone.add(c));
  n.crowded = crowd.size;
  if (gone.size) stage.collectibles = stage.collectibles.filter((c) => !gone.has(c));
  if (out) Object.assign(out, { before: all.length, after: all.length - gone.size, ...n });
  return stage;
}

/**
 * Spread (Matt, 2026-10-30: "getting this spread out better"): no long stretch of the route without a trail. Where the route runs more
 * than FILL_GAP without a petal (start to first, petal to petal, last to the shrine: along x, or along y on a climb), a short trail of
 * TRAIL_LEN goes in where it leads somewhere, the first that fits of: up a climbing vine (straight up always climbs), over a jump on its
 * natural arc, along a ledge that rises off the route or sits by a goal item or a heart, along any ledge. Which candidate and where along
 * it come from the layout itself (a generated stage's every roll lays out differently, so its trails land in new spots). The caller
 * (petalPass.ts) then holds the new petals to the same rules: out of reach, off the arc, rows and the screen cap take them out again.
 */
export const FILL_GAP = 1050;
export const TRAIL_LEN = 3;
/** a petal over a ledge: its middle this far over the ledge's top */
export const FLOAT = 40;

type Pt = { x: number; y: number };

/** the route: along x, or up (-y) on a climb */
export function routeAxis(stage: GeneratedStage) {
  const exit = stage.collectibles.find((c) => c.type === 'exit_totem');
  const ex = exit?.x ?? stage.exitTotemX;
  const ey = exit?.y ?? stage.exitTotemY;
  const up = Math.abs(ey - stage.spawnY) > Math.abs(ex - stage.spawnX);
  return { up, at: (p: Pt) => (up ? -p.y : p.x), start: up ? -stage.spawnY : stage.spawnX, end: up ? -ey : ex };
}

/** the stretches of the route longer than FILL_GAP with no petal, longest first ([from, to] along the route) */
export function petalGaps(stage: GeneratedStage, petals: readonly Pt[]): Array<[number, number]> {
  const ax = routeAxis(stage);
  const ts = [ax.start, ...petals.map(ax.at), ax.end].sort((a, b) => a - b);
  const out: Array<[number, number]> = [];
  for (let i = 1; i < ts.length; i++) if (ts[i] - ts[i - 1] > FILL_GAP) out.push([ts[i - 1], ts[i]]);
  return out.sort((a, b) => b[1] - b[0] - (a[1] - a[0]));
}

/** a number from the layout (the same stage, the same roll: the same number; another roll: another) */
function layoutHash(stage: GeneratedStage): number {
  let h = 2166136261;
  for (const p of stage.platforms) h = Math.imul(h ^ (Math.round(p.x) * 31 + Math.round(p.y) * 7 + Math.round(p.width)), 16777619);
  return h >>> 0;
}
function rng(seed: number) {
  let s = seed || 1;
  return () => {
    s = Math.imul(s ^ (s >>> 15), 1 | s);
    s ^= s + Math.imul(s ^ (s >>> 7), 61 | s);
    return ((s ^ (s >>> 14)) >>> 0) / 4294967296;
  };
}

/** a spot is open: not inside a platform, not on another pickup, above the water, not in 4-6's mist (a pickup there would give its
 *  hidden ledges away), not by the top of a silk line (a ledge only the line reaches is its own reward) */
function open(stage: GeneratedStage, p: Pt): boolean {
  if (stage.waterY != null && p.y > stage.waterY - 30) return false;
  const mist = (stage as { proto?: { w4?: { patience?: Array<{ area?: { top: number; bottom: number } }> } } }).proto?.w4?.patience ?? [];
  if (mist.some((m) => m.area && p.y > m.area.top - 50 && p.y < m.area.bottom + 50)) return false;
  if (stage.vines.some((v) => v.silk && Math.abs(p.x - v.x) < 420 && p.y < v.topY + 260)) return false;
  if (stage.platforms.some((q) => !q.broken && p.x > q.x - 18 && p.x < q.x + q.width + 18 && p.y > q.y - 22 && p.y < q.y + q.height + 18)) return false;
  return !stage.collectibles.some((c) => !c.collected && Math.hypot(c.x - p.x, c.y - p.y) < 70);
}

const isClimb = (v: GeneratedStage['vines'][number]) => !v.off && !v.isSwingingVine && v.vineType !== 'swing_liana' && !v.silk && v.bottomY - v.topY >= 260;
// (no special ledge: an orchid's cup, a hidden ledge in the mist, a lift, a log: they have their own pickups or none)
const firm = (p: Platform) => !p.broken && !p.art && (p.type === 'solid' || p.type === 'bouncy') && p.width >= 170;
const GOALISH = new Set<Collectible['type']>(['relic', 'cage', 'find', 'seed', 'heart', 'super_heart', 'powerup_speed', 'powerup_invincible', 'powerup_magnet']);

/** the trails that could fill the stretch [a, b] of the route, the ones that lead somewhere first (tiers), each a few spots */
function candidates(stage: GeneratedStage, a: number, b: number, r: () => number): Pt[][][] {
  const ax = routeAxis(stage);
  const inGap = (p: Pt) => ax.at(p) > a + 120 && ax.at(p) < b - 120;
  const climbs: Pt[][] = [];
  for (const v of stage.vines.filter(isClimb)) {
    const span = v.bottomY - v.topY - 160;
    const step = 115;
    if (span < step * (TRAIL_LEN - 1)) continue;
    const y0 = v.topY + 80 + r() * (span - step * (TRAIL_LEN - 1));
    const t = Array.from({ length: TRAIL_LEN }, (_, i) => ({ x: v.x, y: y0 + i * step }));
    if (t.some(inGap)) climbs.push(t);
  }
  const jumps: Pt[][] = [];
  for (const j of jumpEdges(stage)) {
    if (j.dir !== 1) continue;
    // (never a clump: petals on the arc at least 70 px apart, so three over a long jump, two over a shorter one, none over a hop)
    const span = j.landX - j.takeoffX;
    const us = span >= 320 ? [0.28, 0.5, 0.72] : span >= 210 ? [0.33, 0.67] : [];
    if (!us.length) continue;
    const t = us.map((u) => {
      const x = j.takeoffX + (j.landX - j.takeoffX) * u;
      return { x, y: arcFeet(j, x) - 34 };
    });
    if (t.some(inGap)) jumps.push(t);
  }
  const ledges: Pt[][] = [];
  const plain: Pt[][] = [];
  const floor: Pt[][] = [];
  const ground = Math.max(...stage.platforms.map((p) => p.y));
  for (const p of stage.platforms.filter(firm)) {
    // (three along a wide ledge, two on a narrow one: never a row, ROW_GAP needs four)
    const len = p.width >= 300 ? TRAIL_LEN : 2;
    const step = Math.min(175, (p.width - 60) / (len - 1));
    if (!ax.up && (p.x + p.width < a + 120 || p.x > b - 120)) continue;
    if (step < 110) continue;
    // (on the stretch of the ledge inside the gap: a long floor runs on far past it)
    let lo = p.x + 30;
    let hi = p.x + p.width - 30 - step * (len - 1);
    if (!ax.up) {
      lo = Math.max(lo, a + 120);
      hi = Math.min(hi, b - 120 - step * (len - 1));
    }
    if (hi < lo) continue;
    const x0 = lo + r() * (hi - lo);
    const t = Array.from({ length: len }, (_, i) => ({ x: x0 + i * step, y: p.y - FLOAT }));
    if (!t.some(inGap)) continue;
    const raised = p.y < ground - 120;
    // (the walking floor: solid ground at the start's height or a checkpoint's)
    const floors = [stage.spawnY, ...(stage.checkpoints ?? []).map((c) => c.y)];
    if (p.height >= 50 && floors.some((y) => Math.abs(p.y - y) <= 40)) floor.push(t);
    const byGoal = stage.collectibles.some((c) => GOALISH.has(c.type) && Math.abs(c.x - (p.x + p.width / 2)) < p.width / 2 + 300 && Math.abs(c.y - p.y) < 260);
    if (!floor.includes(t)) (raised || byGoal ? ledges : plain).push(t);
  }
  FLOOR.splice(0, FLOOR.length, ...floor);
  return [climbs, jumps, ledges, floor, plain];
}

/** the walking-floor trails of the last candidates() (fillGaps marks their petals in ON_FLOOR) */
const FLOOR: Pt[][] = [];
/** the petals fillGaps laid on the walking floor: where the level check cannot follow a stage (a hand-built stage's puzzle rooms), these
 *  are the ones known fair without it (he walks the floor to the shrine) */
export const ON_FLOOR = new WeakSet<Collectible>();

/**
 * Fill the stage's long petal-free stretches (see FILL_GAP). `tried` holds spots already taken out again (an earlier round found them out
 * of reach or off the arc): none goes back. `floorOnly`: the walking floor's trails only (where the level check cannot follow the stage).
 * Returns the petals it added (already in stage.collectibles).
 */
export function fillGaps(stage: GeneratedStage, tried: ReadonlySet<string> = new Set(), floorOnly = false): Collectible[] {
  const added: Collectible[] = [];
  const r = rng(layoutHash(stage) ^ (tried.size * 2654435761));
  let id = Math.max(0, ...stage.collectibles.map((c) => c.id)) + 1;
  const skip = new Set<string>();
  for (let guard = 0; guard < 40; guard++) {
    const petals = stage.collectibles.filter((c) => isPetal(c, stage));
    const gap = petalGaps(stage, petals).find(([a, b]) => !skip.has(`${a}:${b}`));
    if (!gap) break;
    const [a, b] = gap;
    let placed = false;
    const all = candidates(stage, a, b, r);
    const tiers = floorOnly ? [all[3]] : all;
    for (const tier of tiers) {
      // (any candidate of the tier, the one the layout's number picks first)
      const order = tier.map((t) => ({ t, k: r() })).sort((p, q) => p.k - q.k).map((o) => o.t);
      for (const t of order) {
        const spots = t.filter((p) => open(stage, p) && !tried.has(`${Math.round(p.x)},${Math.round(p.y)}`));
        if (spots.length < 2) continue;
        for (const p of spots) {
          // (the nearest petal's look: a row never mixes species)
          let near: Collectible | undefined;
          for (const q of petals) if (!near || Math.hypot(q.x - p.x, q.y - p.y) < Math.hypot(near.x - p.x, near.y - p.y)) near = q;
          const c: Collectible = { id: id++, type: 'flower', x: Math.round(p.x), y: Math.round(p.y), collected: false, bobPhase: r() * Math.PI * 2, ...(near?.botanicalVariant ? { botanicalVariant: near.botanicalVariant } : {}) };
          stage.collectibles.push(c);
          added.push(c);
          if (FLOOR.includes(t)) ON_FLOOR.add(c);
        }
        placed = true;
        break;
      }
      if (placed) break;
    }
    if (!placed) skip.add(`${a}:${b}`);
  }
  return added;
}

