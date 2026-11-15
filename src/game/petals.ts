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
import { shutLidFeet } from './vineField.ts';
import type { Collectible, Platform } from './types.ts';
import type { GeneratedStage } from './stageGenerator.ts';
import { jumpEdges } from './stageMetrics.ts';
import { hopArcs, LAID_ASKS, walkedSpan, WALKED_MIN, type SpanStage } from './gen2/walkedSpan.ts';

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

/** the stage's petal brief says LOW (GraphBrief.petals, by data: 1-2, 1-6, 1-7; R-165.263): pickups come only from its sections' sockets,
 *  so nothing after the lay adds petals (no arc over a gap, jumpTrails.ts; no fill, fillGaps) */
export const petalsLow = (stage: object) => (stage as { gen2?: { brief?: { petals?: string } } }).gen2?.brief?.petals === 'low';

/** the stage's petal brief asks for its REQUIRED hops' arcs (GraphBrief.petalArcs, by data: 1-6; INT-10, the lead's ruling 11-15 11:10 AM) */
export const petalArcsOn = (stage: object) => (stage as { gen2?: { brief?: { petalArcs?: boolean } } }).gen2?.brief?.petalArcs === true;
/** how close an arc's petal may stand to another pickup (px: a flower is never laid within 40 px of another, pipeline fillSockets) */
export const ARC_NEAR = 40;
/**
 * Petals on the arcs of the stage's REQUIRED hops (gen2/walkedSpan.ts hopArcs: every run flies through them, so they are walked space;
 * INT-10, the lead's ruling 11-15 11:10 AM ET), one at each of its points that is open (not in a piece, not in the water or a mist, not
 * below a fall's lower lip) and ARC_NEAR from every other pickup. The species is the nearest petal's (a row never mixes them). Run on the
 * built stage (they stand in the air, not on a piece); petalTrail then holds them to every petal rule. Each is marked
 * `arc`: the door never counts it (goals.ts goalCounts): the child tier flies under the apex row, and with them counted it met the sealed
 * door on 40 of 40 Normal 1-6 runs (INT-10 castBots-1-6-arcs.txt; 32/40 before the arcs). Returns how many.
 */
/** an arc's point this low over a piece reads as a petal STANDING on it (markWalked's own reading: its body up to 60 px over the top), so it
 *  stands only inside that piece's walked span: 1-6 layout 1's arc petal 37 px over the rest log's near end, where every run is still in the
 *  air, looked like a ground petal no run stands by (INT-10c; walkedPath.test D) */
function readsStanding(stage: GeneratedStage, ws: SpanStage, c: { x: number; y: number }): boolean {
  const p = stage.platforms.filter((q) => !q.broken && q.type !== 'bouncy' && c.x >= q.x && c.x <= q.x + q.width && q.y - c.y > 0 && q.y - c.y <= 60).sort((a, b) => a.y - b.y)[0];
  if (!p || (p.type !== 'solid' && p.type !== 'fragile')) return false;
  if (ws.away!(p)) return true;
  const w = walkedSpanMemo(p, ws);
  return w.hi - w.lo < WALKED_MIN || c.x < w.lo - 2 || c.x > w.hi + 2;
}
export function arcPetals(stage: GeneratedStage): number {
  const spans = fallSpans(stage);
  const ws = walkedStage(stage, spans);
  let id = stage.collectibles.reduce((m, c) => Math.max(m, c.id), 0) + 1;
  const petals = stage.collectibles.filter((c) => isPetal(c, stage));
  let n = 0;
  for (const a of hopArcs(ws)) {
    for (const p of a.points) {
      if (!open(stage, p, ARC_NEAR) || inFall(spans, p) || readsStanding(stage, ws, p)) continue;
      let near: Collectible | undefined;
      for (const q of petals) if (!near || Math.hypot(q.x - p.x, q.y - p.y) < Math.hypot(near.x - p.x, near.y - p.y)) near = q;
      const c: Collectible = { id: id++, type: 'flower', x: p.x, y: p.y, collected: false, bobPhase: (p.x * 0.031) % 6.28, arc: true, ...(near?.botanicalVariant ? { botanicalVariant: near.botanicalVariant } : {}) };
      stage.collectibles.push(c);
      petals.push(c);
      n++;
    }
  }
  return n;
}

/** the walked path on a finished stage (gen2/walkedSpan.ts, the model the door count reads, markWalked): its pieces, lianas, the asks it was laid
 *  with, and `away`, from its own record of its falls (missPiece) */
export function walkedStage(stage: GeneratedStage, spans: readonly FallSpan[] = fallSpans(stage)): SpanStage {
  return { platforms: stage.platforms, vines: stage.vines, asks: LAID_ASKS.get(stage) ?? [], away: awayOf(spans) };
}
/** missPiece over these falls, each piece's answer kept while its place is the same (asked for every piece by every span: a build's cost) */
export function awayOf(spans: readonly FallSpan[]): (p: Platform) => boolean {
  const seen = new WeakMap<Platform, { k: string; v: boolean }>();
  return (p) => {
    const k = `${p.x},${p.y},${p.width},${p.pit ?? ''},${p.catch ? 1 : 0}`;
    const h = seen.get(p);
    if (h && h.k === k) return h.v;
    const v = missPiece(spans, p);
    seen.set(p, { k, v });
    return v;
  };
}

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
  /** the petals laid on the required hops' arcs (arcPetals), before the trail's rules judged them */
  arcs?: number;
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
function open(stage: GeneratedStage, p: Pt, near = 70): boolean {
  if (stage.waterY != null && p.y > stage.waterY - 30) return false;
  const mist = (stage as { proto?: { w4?: { patience?: Array<{ area?: { top: number; bottom: number } }> } } }).proto?.w4?.patience ?? [];
  if (mist.some((m) => m.area && p.y > m.area.top - 50 && p.y < m.area.bottom + 50)) return false;
  if (stage.vines.some((v) => v.silk && Math.abs(p.x - v.x) < 420 && p.y < v.topY + 260)) return false;
  if (stage.platforms.some((q) => !q.broken && p.x > q.x - 18 && p.x < q.x + q.width + 18 && p.y > q.y - 22 && p.y < q.y + q.height + 18)) return false;
  return !stage.collectibles.some((c) => !c.collected && Math.hypot(c.x - p.x, c.y - p.y) < near);
}

const isClimb = (v: GeneratedStage['vines'][number]) => !v.off && !v.isSwingingVine && v.vineType !== 'swing_liana' && !v.silk && v.bottomY - v.topY >= 260;
// (no special ledge: an orchid's cup, a hidden ledge in the mist, a lift, a log: they have their own pickups or none)
const firm = (p: Platform) => !p.broken && !p.art && (p.type === 'solid' || p.type === 'bouncy') && p.width >= 170;
const GOALISH = new Set<Collectible['type']>(['relic', 'cage', 'find', 'seed', 'heart', 'super_heart', 'powerup_speed', 'powerup_invincible', 'powerup_magnet']);

/**
 * OFF THE PATH (ENG-16E, R-165.246; BUILD-16c/16d 1-6: the fill laid its pairs on soft pits' floors where a creaky limb or a run of lianas
 * left a stretch over FILL_GAP, and the tier bots met the sealed door for them): a fill petal goes only on the walked and landed path, never
 * where he must take a fall or a hit to get it. The stage's own record of its falls says where that is, in any world:
 *   - inside a fall on the route (gen2's `falls`: the route's gaps, each with its take-off lip) or a heart-fall zone (`heartFalls`), a
 *     spot below the gap's LOWER lip is in the pit: its floor, its stair, its hurt floor (a perch level with the lips is above it);
 *   - a hurt floor (`pit: 'hurt'`, the thorn bed: touching it is a heart and a set-back), a catch under a gap (`catch`: a fall's floor), a
 *     creaky limb (`fragile`: it gives way under him) never holds one, nor does a jump that starts or ends on one of them, nor a climb that
 *     stands in a pit.
 * A stage with no record of its falls (the hand-built stages: no `gen2`) is judged by the pieces' own marks alone.
 */
export interface FallSpan { x0: number; x1: number; lip: number }
export function fallSpans(stage: GeneratedStage): FallSpan[] {
  const falls = (stage as { gen2?: { falls?: Array<{ x0: number; x1: number; y: number }> } }).gen2?.falls ?? [];
  const zones = (stage.heartFalls ?? []).map((z) => ({ x0: z.x0, x1: z.x1, y: NaN }));
  const out: FallSpan[] = [];
  for (const f of [...falls, ...zones]) {
    // (the lower of the two lips: a bank whose end meets the gap's start, one whose start meets its end; the record's own lip when known)
    const lips = stage.platforms.filter((p) => !p.broken && p.pit !== 'hurt' && (Math.abs(p.x + p.width - f.x0) <= 4 || Math.abs(p.x - f.x1) <= 4)).map((p) => p.y);
    if (Number.isFinite(f.y)) lips.push(f.y);
    if (lips.length) out.push({ x0: f.x0, x1: f.x1, lip: Math.max(...lips) });
  }
  return out;
}
/** a spot inside a fall, lower than its lower lip: getting it means dropping into the gap */
export const inFall = (spans: readonly FallSpan[], p: Pt): boolean => spans.some((f) => p.x > f.x0 && p.x < f.x1 && p.y > f.lip);
/** a piece he stands on only after a miss (ENG-PETAL 11-14: the walked path's `away`, gen2/walkedSpan.ts): a hurt floor, a catch, or a
 *  floor or step inside a fall below its lower lip (a soft pit's floor and its stair) */
export const missPiece = (spans: readonly FallSpan[], p: Platform): boolean =>
  p.pit === 'hurt' || !!p.catch || spans.some((f) => p.x + p.width > f.x0 + 4 && p.x < f.x1 - 4 && p.y > f.lip);
/** a piece off the path: one he stands on only after a miss (missPiece), or a creaky limb */
export const offPath = (spans: readonly FallSpan[], p: Platform): boolean => p.type === 'fragile' || missPiece(spans, p);

/**
 * Which petals the door counts (the lead's ruling INT-10d 11-15: the walked path decides WHICH petals a share goal counts, never WHERE they
 * go; ENG-PETAL's model with rule A, gen2/walkedSpan.ts). Each flower or leaf of a finished gen2 stage gets `walked`:
 *   - standing on a solid piece or a creaky limb (its body up to 60 px over the top): true only inside that piece's walked span (at least
 *     WALKED_MIN wide, 2 px of give) on a piece the run does not reach only after a miss (`away`: a pit's floor or stair, a hurt floor, a
 *     catch). A petal behind where the leap sets him down, past where he jumps off, or on a piece he clears in the air is false;
 *   - standing on any other piece (a log or a pad he rides, a lift): true (the model does not judge a ride);
 *   - in the air (a climb's trail, a jump's arc): true unless it hangs inside a fall below its lower lip (getting it means dropping in).
 * A petal marked false still shows and still adds to the counter when he picks it; it never seals a door (goals.ts goalCounts). Changed
 * in place; returns how many are marked false. Run last, on the stage as the game plays it (stageGenerator finishStage, after pairPetals).
 */
export function markWalked(stage: GeneratedStage): number {
  const spans = fallSpans(stage);
  const ws = walkedStage(stage, spans);
  let off = 0;
  for (const c of stage.collectibles) {
    if (c.type !== 'flower' && c.type !== 'leaf') continue;
    c.walked = walkedPetal(stage, ws, spans, c);
    if (!c.walked) off++;
  }
  return off;
}
function walkedPetal(stage: GeneratedStage, ws: SpanStage, spans: readonly FallSpan[], c: Collectible): boolean {
  if (KEEP.has(c)) return true;
  const p = stage.platforms.filter((q) => !q.broken && q.type !== 'bouncy' && c.x >= q.x && c.x <= q.x + q.width && q.y - c.y > 0 && q.y - c.y <= 60).sort((a, b) => a.y - b.y)[0];
  if (!p) return !inFall(spans, c);
  if (p.type !== 'solid' && p.type !== 'fragile') return true;
  if (ws.away!(p)) return false;
  const w = walkedSpanMemo(p, ws);
  return w.hi - w.lo >= WALKED_MIN && c.x >= w.lo - 2 && c.x <= w.hi + 2;
}

/** each piece's walked span, read once per built layout (asked for each petal; the pieces do not move once built) */
const SPANS = new WeakMap<Platform, { key: string; lo: number; hi: number }>();
function walkedSpanMemo(p: Platform, st: SpanStage): { lo: number; hi: number } {
  const key = `${st.platforms.length}:${p.x},${p.y},${p.width}`;
  const m = SPANS.get(p);
  if (m && m.key === key) return m;
  const w = walkedSpan(p, st);
  const r = { key, lo: w.lo, hi: w.hi };
  SPANS.set(p, r);
  return r;
}

/** his collider's height (px, engine.ts the player), and how far under its top a trail's top petal lies at a fig gate's shut lid (px: in
 *  him, so a climb to the lid takes it; 1-4 seed 1 measured, his box top 4388 at the lid and the petal at 4418 taken, 4303 not) */
const LID_BODY = 48;
const LID_IN = 40;
/** the trails that could fill the stretch [a, b] of the route, the ones that lead somewhere first (tiers), each a few spots */
function candidates(stage: GeneratedStage, a: number, b: number, r: () => number, edges?: ReturnType<typeof jumpEdges>): Pt[][][] {
  const ax = routeAxis(stage);
  const inGap = (p: Pt) => ax.at(p) > a + 120 && ax.at(p) < b - 120;
  const climbs: Pt[][] = [];
  for (const v of stage.vines.filter(isClimb)) {
    // (under a fig gate the climb tops out where the shut lid stops his head as the stage starts (vineField.ts shutLidFeet), not at the
    //  vine's top: the trail's top petal lies inside his body there, LID_IN under his collider's top (INT-10b: since ENG-PETAL's walked
    //  path laid trails on 1-4's paired columns, seed 1's 614,4303 hung 85 px over his head at the lid, his only way to it the freed figs)
    const lid = stage.gates?.length ? shutLidFeet(stage.gates, stage.platforms, v.x, v.bottomY) - LID_BODY + LID_IN : -Infinity;
    const cut = Math.max(0, lid - (v.topY + 80));
    const span = v.bottomY - v.topY - 160 - cut;
    const step = 115;
    if (span < step * (TRAIL_LEN - 1)) continue;
    const y0 = v.topY + 80 + cut + r() * (span - step * (TRAIL_LEN - 1));
    const t = Array.from({ length: TRAIL_LEN }, (_, i) => ({ x: v.x, y: y0 + i * step }));
    if (t.some(inGap)) climbs.push(t);
  }
  const jumps: Pt[][] = [];
  for (const j of edges ?? jumpEdges(stage)) {
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
    const raised = p.y < ground - 120;
    // (the walking floor: solid ground at the start's height or a checkpoint's)
    const floors = [stage.spawnY, ...(stage.checkpoints ?? []).map((c) => c.y)];
    const onFloor = p.height >= 50 && floors.some((y) => Math.abs(p.y - y) <= 40);
    const byGoal = stage.collectibles.some((c) => GOALISH.has(c.type) && Math.abs(c.x - (p.x + p.width / 2)) < p.width / 2 + 300 && Math.abs(c.y - p.y) < 260);
    // (a few spots along a long ledge, from where the layout's number says: one may sit under a stepping stone or by a heart)
    const tries = Math.max(1, Math.min(4, Math.floor((hi - lo) / 300) + 1));
    const k0 = r();
    for (let k = 0; k < tries; k++) {
      const x0 = lo + ((k0 + k / tries) % 1) * (hi - lo);
      const t = Array.from({ length: len }, (_, i) => ({ x: x0 + i * step, y: p.y - FLOAT }));
      if (!t.some(inGap)) continue;
      (onFloor ? floor : raised || byGoal ? ledges : plain).push(t);
    }
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
  // (its jumps, read once: the fill adds petals only, the pieces stay put)
  const edges = jumpEdges(stage);
  for (let guard = 0; guard < 40; guard++) {
    const petals = stage.collectibles.filter((c) => isPetal(c, stage));
    const gap = petalGaps(stage, petals).find(([a, b]) => !skip.has(`${a}:${b}`));
    if (!gap) break;
    const [a, b] = gap;
    let placed = false;
    const all = candidates(stage, a, b, r, edges);
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

