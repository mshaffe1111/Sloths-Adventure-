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
 *   - no solid rows: of petals spaced closer than ROW_GAP on one line, every other goes;
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
function arcFeet(j: { takeoffX: number; landX: number; from: Platform; to: Platform }, x: number): number {
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
    // (the one nearest its neighbours goes: the trail stays spread along the screen)
    let worst = inside[1] ?? inside[0];
    let close = Infinity;
    for (let i = 1; i < inside.length - 1; i++) {
      const d = inside[i + 1].x - inside[i - 1].x;
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
  crowded: number;
}

/**
 * The pass: the stage's scattered pickups become petals in trails. `unreachable`: the ids the level check found out of reach (the caller
 * runs it: validateStage(stage).errors, so this file stays clear of levelCheck's imports).
 */
export function petalTrail<T extends GeneratedStage>(stage: T, unreachable: ReadonlySet<number> = new Set(), out?: PetalOut): T {
  const all = stage.collectibles.filter((c) => isPetal(c, stage));
  for (const c of all) if (c.type !== 'flower') c.type = 'flower';
  const gone = new Set<Collectible>();
  let n = { unreachable: 0, offArc: 0, rows: 0, crowded: 0 };
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
  const crowd = screenExtras(live());
  crowd.forEach((c) => gone.add(c));
  n.crowded = crowd.size;
  if (gone.size) stage.collectibles = stage.collectibles.filter((c) => !gone.has(c));
  if (out) Object.assign(out, { before: all.length, after: all.length - gone.size, ...n });
  return stage;
}
