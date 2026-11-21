/**
 * groundStack: a leg laid UNDER another leg is not buried by the upper leg's earth (ENG-GROUND; 2-7 "The Way Home", every out-and-back
 * stage). The painted ground runs each bank's soil on down out of sight (protoArt.ts drawBankArt), lowest bank first: where a leg runs
 * under another, the upper leg's soil was drawn down over it, and he walked in front of solid earth with the river under it hidden.
 *
 * Over a lower leg the upper leg's earth now ENDS at a ceiling: a line his height and a double jump (and the underside's own hang) over
 * every piece of the lower leg and a little past its ends, smoothed so it never steps from piece to piece, and wobbling UP from there
 * (never down into his headroom) so it never reads as a straight cut. At the ceiling's ends the line slants down into the hillside, so
 * where the upper earth runs on past the lower leg it stands as a face, not a vertical cut. Between the ceiling and the lower leg the
 * stage's own backdrop shows: the two legs read as two levels of the same world.
 *
 * This file holds the geometry (pure, cached once per stage) and the two drawing helpers protoArt.ts uses: the clip that takes the air
 * under a ceiling out of an upper bank's paint, and the stand-in underside (the soil's own edge darkened as ground seen from below)
 * drawn inside a bank's soil until the painted underside strip lands (STAGE-RULES §4: the code drawing is only the stand-in).
 * Nothing here names a stage, a seed or a place.
 */
import type { Platform } from './types.ts';
import { DOUBLE_RISE } from './physics.ts';
import { GROUND_FRAMES } from './groundAtlasData.ts';
import { groundSheetImage } from './groundPaint.ts';

/** his collider's height */
const HIS_H = 48;
/** the lower leg's air the upper earth never reaches: his height and a double jump over every piece of it */
export const HEADROOM = HIS_H + Math.ceil(DOUBLE_RISE);
/** the underside's own reach below its line (its ragged edge, the roots of the painted strip to come): kept out of the headroom too */
export const UNDER_HANG = 40;
/** sideways: the air runs this far past a lower piece's ends (a jump off its end rises before it clears it) */
const SIDE = 160;
/** lower pieces this close (a river's width and its banks) are one ceiling */
const BRIDGE = 1100;
/** the line's sample step */
export const STEP = 16;
/** how steeply the line may climb or fall between pieces (the smoothing's cone) */
const SLOPE = 0.6;
/** how steeply the line falls into the hillside past its ends */
const END_SLOPE = 1.1;

/** an area a lay marks as a lower leg (gen2 legs.ts LaidLeg: a run leg laid under another): only pieces inside one feed a ceiling */
export interface StackZone { x0: number; x1: number; y0: number; y1: number }

export interface Ceiling {
  /** the line: ys[i] is the ceiling at x0 + i * STEP (the wobble in); x1 its last sample's x */
  x0: number;
  x1: number;
  ys: number[];
  /** the lower pieces under it */
  lower: Platform[];
}

const isStatic = (q: Platform) => q.type !== 'drift' && q.type !== 'moving';
const overlap = (a: Platform, b: Platform) => Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
/** a deterministic 0..1 from an integer (the wobble's grain) */
const hash = (n: number) => {
  let h = Math.imul(n ^ 0x9e3779b9, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
};
/** how far the edge rises over the smoothed line at x (always 2..34: the cut only ever goes up, away from his headroom) */
export function wobble(x: number): number {
  const k = Math.floor(x / STEP);
  return 18 + 8 * Math.sin(x / 47 + 1.3) + 5 * Math.sin(x / 19 + 0.4) + (hash(k) - 0.5) * 6;
}

/**
 * The stage's ceilings: every static piece he stands on that lies under a bank of earth with a clear gap of HEADROOM or more under the
 * bank's collider (a pit's floor tucked under a bank's end is not: no headroom), inside `zones` when given; grouped by x (a river's width
 * apart is one group), each group's line laid as above.
 */
export function findCeilings(platforms: readonly Platform[], banks: readonly Platform[], zones?: readonly StackZone[]): Ceiling[] {
  const inZone = (q: Platform) => !zones || zones.some((z) => q.x + q.width / 2 >= z.x0 && q.x + q.width / 2 <= z.x1 && q.y >= z.y0 - 2 && q.y <= z.y1 + 2);
  const lower = platforms
    .filter((q) => isStatic(q) && inZone(q) && banks.some((p) => p !== q && overlap(p, q) > 8 && q.y >= p.y + p.height + HEADROOM))
    .sort((a, b) => a.x - b.x);
  const groups: Platform[][] = [];
  let end = -Infinity;
  for (const q of lower) {
    const last = groups[groups.length - 1];
    if (last && q.x - end <= BRIDGE) last.push(q);
    else {
      groups.push([q]);
      end = -Infinity;
    }
    end = Math.max(end, q.x + q.width);
  }
  return groups.map((g) => line(g, banks));
}

function line(g: Platform[], banks: readonly Platform[]): Ceiling {
  const a = Math.floor((Math.min(...g.map((q) => q.x)) - SIDE) / STEP) * STEP;
  const b = Math.max(...g.map((q) => q.x + q.width)) + SIDE;
  const n = Math.ceil((b - a) / STEP) + 1;
  const raw: number[] = new Array(n).fill(NaN);
  for (const q of g) {
    const y = q.y - HEADROOM - UNDER_HANG;
    const i0 = Math.max(0, Math.ceil((q.x - SIDE - a) / STEP)), i1 = Math.min(n - 1, Math.floor((q.x + q.width + SIDE - a) / STEP));
    for (let i = i0; i <= i1; i++) if (!(raw[i] <= y)) raw[i] = y;
  }
  // (a gap no piece's air reaches, a river between two banks: the higher of the two sides' lines, so a jump across keeps its air)
  for (let i = 0; i < n; i++) {
    if (!Number.isNaN(raw[i])) continue;
    let l = i, r = i;
    while (l >= 0 && Number.isNaN(raw[l])) l--;
    while (r < n && Number.isNaN(raw[r])) r++;
    const v = Math.min(l >= 0 ? raw[l] : Infinity, r < n ? raw[r] : Infinity);
    for (let k = i; k < r; k++) raw[k] = v;
  }
  // the smoothing: the highest of every piece's line and a cone from each, so the line never steps and never comes lower than any piece's
  const c = [...raw];
  for (let i = 1; i < n; i++) c[i] = Math.min(c[i], c[i - 1] + SLOPE * STEP);
  for (let i = n - 2; i >= 0; i--) c[i] = Math.min(c[i], c[i + 1] + SLOPE * STEP);
  // (no sag: the line never dips between two higher stretches. A static piece on a river's bed pulled it down over the water, and the
  // upper bank's earth hung there as a column to just over the race leg's banks: ENG-GROUND's first stills, x 15100-15400)
  const left: number[] = [], right: number[] = [];
  for (let i = 0; i < n; i++) left[i] = Math.min(c[i], i ? left[i - 1] : Infinity);
  for (let i = n - 1; i >= 0; i--) right[i] = Math.min(c[i], i < n - 1 ? right[i + 1] : Infinity);
  for (let i = 0; i < n; i++) c[i] = Math.min(c[i], Math.max(left[i], right[i]));
  // the wobble, upward; and never into an upper bank's own collider (a lay that leaves him less air keeps its earth's body: its line is
  // its collider's foot there)
  const ys = c.map((y, i) => {
    const x = a + i * STEP;
    let v = y - wobble(x);
    for (const p of banks) if (x >= p.x && x <= p.x + p.width && p.y < v && p.y + p.height + 6 > v) v = p.y + p.height + 6;
    return v;
  });
  return { x0: a, x1: a + (n - 1) * STEP, ys, lower: g };
}

/** the ceiling's line at x (its ends slanting down past x0..x1) */
export function ceilingAt(c: Ceiling, x: number): number {
  if (x <= c.x0) return c.ys[0] + (c.x0 - x) * END_SLOPE;
  if (x >= c.x1) return c.ys[c.ys.length - 1] + (x - c.x1) * END_SLOPE;
  const f = (x - c.x0) / STEP, i = Math.floor(f);
  return c.ys[i] + (c.ys[Math.min(i + 1, c.ys.length - 1)] - c.ys[i]) * (f - i);
}

/** the ceilings bank p stands over: it spans the line's own run (not only its slanted ends) and its top is above the line all along it */
export function ceilingsOver(p: Platform, cs: readonly Ceiling[]): Ceiling[] {
  return cs.filter((c) => {
    const a = Math.max(p.x, c.x0), b = Math.min(p.x + p.width, c.x1);
    if (b - a <= 8 || c.lower.includes(p)) return false;
    for (let x = a; x <= b; x += STEP) if (p.y >= ceilingAt(c, x)) return false;
    return true;
  });
}

/**
 * The ceilings over a stretch of an upper leg that is no bank: a river's water, its bed and the soil under it, which engine.ts drawRivers
 * runs down to the view's foot as a bank's soil runs (its top above the line all along x0..x1: ceilingsOver's rule). ENG-GROUND-b.
 */
export function ceilingsOverSpan(x0: number, x1: number, top: number, cs: readonly Ceiling[]): Ceiling[] {
  return ceilingsOver({ x: x0, width: x1 - x0, y: top } as Platform, cs);
}

/**
 * Clip to the air ABOVE `cs`'s lines over x0..x1, from `top` down (the highest line where two meet): what a river of an upper leg keeps
 * of its water, bed and soil. Only the stretch's own samples (a river's width, not the whole line). Call between save() and restore().
 */
export function clipAboveLines(ctx: CanvasRenderingContext2D, cs: readonly Ceiling[], x0: number, x1: number, top: number) {
  const at = (x: number) => Math.min(...cs.map((c) => ceilingAt(c, x)));
  ctx.beginPath();
  ctx.moveTo(x0, top);
  ctx.lineTo(x1, top);
  ctx.lineTo(x1, at(x1));
  for (let x = Math.floor(x1 / STEP) * STEP; x > x0; x -= STEP) ctx.lineTo(x, at(x));
  ctx.lineTo(x0, at(x0));
  ctx.closePath();
  ctx.clip();
}

/** is q one of a ceiling's lower pieces (the lower leg) */
export const underCeiling = (q: Platform, cs: readonly Ceiling[]) => cs.some((c) => c.lower.includes(q));

/**
 * Clip to everything but the air under `cs` (the region under each line, its ends slanting down), over x0..x1 and down to `foot`.
 * Call between save() and restore().
 */
export function clipAbove(ctx: CanvasRenderingContext2D, cs: readonly Ceiling[], x0: number, x1: number, top: number, foot: number) {
  ctx.beginPath();
  ctx.rect(x0, top, x1 - x0, foot - top);
  for (const c of cs) {
    const y0 = c.ys[0], y1 = c.ys[c.ys.length - 1];
    if (Math.min(...c.ys) >= foot) continue;
    ctx.moveTo(c.x0 - Math.max(0, foot - y0) / END_SLOPE, foot);
    for (let i = 0; i < c.ys.length; i++) ctx.lineTo(c.x0 + i * STEP, c.ys[i]);
    ctx.lineTo(c.x1 + Math.max(0, foot - y1) / END_SLOPE, foot);
    ctx.closePath();
  }
  ctx.clip('evenodd');
}

/** the stand-in underside's dark band, a 4 x 64 strip made once (no gradient per frame: PERFORMANCE-RULES §8) */
let band: HTMLCanvasElement | null = null;
function underBand(deep: readonly number[]): HTMLCanvasElement | null {
  if (band) return band;
  if (typeof document === 'undefined') return null;
  const cv = document.createElement('canvas');
  cv.width = 4;
  cv.height = 64;
  const g = cv.getContext('2d');
  if (!g || typeof g.createLinearGradient !== 'function') return null;
  const gr = g.createLinearGradient(0, 0, 0, 64);
  gr.addColorStop(0, `rgba(${deep[0]},${deep[1]},${deep[2]},0)`);
  gr.addColorStop(0.7, `rgba(${deep[0]},${deep[1]},${deep[2]},0.45)`);
  gr.addColorStop(1, `rgba(${deep[0]},${deep[1]},${deep[2]},0.8)`);
  g.fillStyle = gr;
  g.fillRect(0, 0, 4, 64);
  band = cv;
  return cv;
}

/** a painted underside strip's frame in a world's ground sheet: its box, and the share of its height where the soil's edge runs */
export interface UnderFrame { x: number; y: number; w: number; h: number; edge: number }
/**
 * THE HOOK for the painted underside (the lead's order, ENG-GROUND: W2 first, three 1024 x 256 strips and a 384 x 576 corner): the
 * strips are packed into the world's ground sheet beside its lips, as inventory ids `w<n>#under0..2`, and groundAtlasData.ts carries them
 * as that world's `unders` (each with `edge`, the share of its height where the soil's edge runs). Until a world has them: none.
 */
export function underFrames(w: number): UnderFrame[] | null {
  const g = GROUND_FRAMES[w] as unknown as { unders?: UnderFrame[] } | undefined;
  return g?.unders?.length ? g.unders : null;
}
/** the painted strip's shown width (world units) and height (its own aspect) */
const UNDER_W = 512;

/**
 * The underside along each line under bank p, drawn inside its soil's outline (so only on its earth). Painted (underFrames): the strip
 * laid along the line a 16-unit column at a time, each column's edge on the line, the strips taking turns from the world's origin.
 * STAND-IN until the strip lands (allowed on the toy only, the lead's ruling; 2-7 ships with the painted one): the soil's own edge
 * darkened as ground seen from below is, over the last 56 units to the line.
 */
export function drawUnderside(ctx: CanvasRenderingContext2D, w: number, p: Platform, cs: readonly Ceiling[], view: { x0: number; x1: number }) {
  const s = underSheet(w);
  const frames = underFrames(w);
  const img = frames && s ? null : underBand(GROUND_FRAMES[w]?.deep ?? [20, 14, 10]);
  if (!frames && !img) return;
  for (const c of cs) {
    const a = Math.max(p.x, c.x0, view.x0 - STEP), b = Math.min(p.x + p.width, c.x1, view.x1 + STEP);
    for (let x = Math.floor(a / STEP) * STEP; x < b; x += STEP) {
      const y = Math.max(ceilingAt(c, x), ceilingAt(c, x + STEP));
      if (frames && s) {
        const k = Math.floor(x / UNDER_W), f = frames[((k % frames.length) + frames.length) % frames.length];
        const h = (UNDER_W * f.h) / f.w, sw = (f.w * STEP) / UNDER_W;
        const sx = f.x + (((x - k * UNDER_W) / UNDER_W) * f.w);
        ctx.drawImage(s, sx, f.y, sw, f.h, x, y - f.edge * h, STEP + 0.5, h);
      } else if (img) ctx.drawImage(img, 0, 0, 4, 64, x, y - 56, STEP + 0.5, 58);
    }
  }
}
/** the world's ground sheet, once its underside frames are packed in it (the painted path only) */
const underSheet = (w: number): CanvasImageSource | null => (underFrames(w) ? groundSheetImage(w) : null);

/** the stage's ceilings, kept while its platforms, banks and zones are the same (the painted ground asks once a square) */
let memo: { plats: readonly Platform[]; sig: number; zones: readonly StackZone[] | undefined; cs: Ceiling[] } | null = null;
export function ceilingsFor(platforms: readonly Platform[], banks: readonly Platform[], sig: number, zones: readonly StackZone[] | undefined): Ceiling[] {
  if (memo && memo.plats === platforms && memo.sig === sig && memo.zones === zones) return memo.cs;
  memo = { plats: platforms, sig, zones, cs: findCeilings(platforms, banks, zones) };
  return memo.cs;
}

/** a leg as the gen2 lay records it (legs.ts LaidLeg): its travel and the box its pieces fill */
interface LegBox { travel: string; x0: number; x1: number; y0: number; y1: number }
/**
 * The zones the lay stacks (ENG-GROUND, the lead's ruling (b)): each run leg (right or left) laid wholly under another run leg it shares
 * x with. Only these feed a ceiling, so a stage whose lay stacks no leg draws exactly as before (1-4's summit and 7-4's ruin banks stand
 * over walkable ground without being legs: R-165.376).
 */
export function stackZonesOf(legs: readonly LegBox[] | undefined): StackZone[] {
  const run = (legs ?? []).filter((l) => l.travel === 'left' || l.travel === 'right');
  return run
    .filter((l) => run.some((u) => u !== l && Math.min(u.x1, l.x1) - Math.max(u.x0, l.x0) > 0 && l.y0 >= u.y1 + HIS_H))
    .map((l) => ({ x0: l.x0, x1: l.x1, y0: l.y0, y1: l.y1 }));
}
