/**
 * w6StiltArt — 6-8 Stilt Climb's painted look from Matt's World 6 sheets, so no two ledges on one screen look alike (the lead's review,
 * 2026-10-29: "five identical planks on one screen"):
 *   - ledges: besides the World 6 kit's root plank (the engine's own), the second plank (props-made/w6var `branch-b`), the flat-topped
 *     mossy root arch and root den (props-made/w6d), a mossy log (w6d `moss-log`, its log only) and a stump (w6var `stump-b`). Each is
 *     drawn with its walkable top on the ledge's top (`top`, measured from the pictures), so nobody stands in the air or sinks in;
 *   - dressing (pictures only, nothing stood on or hurts): the Gemini hides and arches sheet (gemini/w6-hides-arches: reed hide, moss
 *     hide, hollow log, moss arch, root arch, root mound), and props-made/w6c's cattails, mooring post, glow mushrooms and lantern flower
 *     standing on the shelves, and its moss curtain hanging under them.
 * The stage lays them (w6Stages.ts) and the engine draws them with the ledges (a ledge painted here is art 'stilt': the engine's own
 * platform look leaves it alone). Nothing is drawn until its sheet has loaded.
 */
import { trackAtlas } from './atlasLoader.ts';

type Frame = { x: number; y: number; w: number; h: number };
const SHEETS = {
  gem: new URL('../assets/w6to10/gemini/w6-hides-arches.webp', import.meta.url).href,
  var: new URL('../assets/w6to10/props-made/w6var.webp', import.meta.url).href,
  d: new URL('../assets/w6to10/props-made/w6d.webp', import.meta.url).href,
  c: new URL('../assets/w6to10/props-made/w6c.webp', import.meta.url).href,
} as const;
type Sheet = keyof typeof SHEETS;
export const STILT_ART_URLS: readonly string[] = Object.values(SHEETS);

/** the hides and arches sheet's pieces, anchored at the middle of the foot (as its .json beside it says: w6Stages.test.ts checks) */
export type StiltPiece = 'reed-hide' | 'moss-hide' | 'log-hide' | 'moss-arch' | 'root-arch' | 'root-mound';
export const STILT_FRAMES: Record<StiltPiece, Frame & { ax: number; ay: number }> = {"reed-hide": {x: 0, y: 0, w: 295, h: 228, ax: 147.0, ay: 228}, "moss-hide": {x: 299, y: 0, w: 290, h: 207, ax: 145.0, ay: 207}, "log-hide": {x: 593, y: 0, w: 300, h: 165, ax: 196.5, ay: 165}, "moss-arch": {x: 897, y: 0, w: 303, h: 222, ax: 152.0, ay: 222}, "root-arch": {x: 1204, y: 0, w: 320, h: 201, ax: 161.0, ay: 201}, "root-mound": {x: 1528, y: 0, w: 308, h: 152, ax: 152.5, ay: 152}};
export const STILT_PIECES = Object.keys(STILT_FRAMES) as StiltPiece[];

/** props-made/w6c's dressing (as w6c.json says), stood on its foot (bottom middle) or, the moss curtain, hung by its top */
export type StiltProp = 'cattails' | 'mooring-post' | 'glow-mushrooms' | 'lantern-flower' | 'moss-curtain';
export const STILT_PROP_FRAMES: Record<StiltProp, Frame> = {"moss-curtain": {x: 426, y: 0, w: 425, h: 249}, "cattails": {x: 0, y: 0, w: 422, h: 456}, "mooring-post": {x: 1500, y: 0, w: 286, h: 390}, "glow-mushrooms": {x: 0, y: 460, w: 410, h: 374}, "lantern-flower": {x: 855, y: 0, w: 209, h: 421}};

/**
 * the ledge looks: the sheet, the picture (a log's frame also holds a stump beside it: `cut` keeps the share of its width that is the
 * log), where its walkable top is (share of the picture's height, measured from the pictures' opaque pixels), and the widest ledge one
 * copy covers before it is laid in several side by side
 */
export type LedgeLook = 'branch-b' | 'root-arch' | 'root-den' | 'moss-log' | 'stump';
export const LEDGE_LOOKS: Record<LedgeLook, { sheet: Sheet; f: Frame; top: number; cut?: number; max: number }> = {
  'branch-b': { sheet: 'var', f: { x: 0, y: 0, w: 447, h: 162 }, top: 0.031, max: 460 },
  'root-arch': { sheet: 'd', f: { x: 0, y: 0, w: 469, h: 305 }, top: 0.026, max: 360 },
  'root-den': { sheet: 'd', f: { x: 473, y: 0, w: 469, h: 305 }, top: 0.026, max: 360 },
  'moss-log': { sheet: 'd', f: { x: 0, y: 423, w: 460, h: 132 }, top: 0.083, cut: 0.735, max: 420 },
  stump: { sheet: 'var', f: { x: 910, y: 0, w: 431, h: 189 }, top: 0.026, max: 260 },
};
/** how much wider than its ledge a look is drawn (its painted ends are ragged: the walkable top still covers the ledge) */
export const LEDGE_OVER = 1.1;

/** a ledge the stage paints with one of the looks (its platform is art 'stilt'), laid in `n` copies side by side */
export interface StiltLedge { id: number; look: LedgeLook; x: number; y: number; w: number; n: number; flip?: boolean }
/** dressing: a hides-and-arches piece or a w6c prop on its foot at (x, b), `w` px wide; the moss curtain hangs from b */
export interface StiltDecor { n: StiltPiece | StiltProp; x: number; b: number; w: number; flip?: boolean }
export const isProp = (n: StiltDecor['n']): n is StiltProp => n in STILT_PROP_FRAMES;

/** how many copies a look takes over a ledge `w` wide */
export const ledgeCopies = (look: LedgeLook, w: number): number => Math.max(1, Math.ceil(w / LEDGE_LOOKS[look].max));
/** how tall a look is drawn over a ledge `w` wide, laid in `n` copies (more copies, each narrower, draw it shallower) */
export function ledgeHeight(look: LedgeLook, w: number, n = ledgeCopies(look, w)): number {
  const L = LEDGE_LOOKS[look];
  return ((w / n) * LEDGE_OVER * L.f.h) / (L.f.w * (L.cut ?? 1));
}
/** the narrowest one copy of a look is laid (narrower reads as a smudge) */
export const LEDGE_MIN_COPY = 130;

const imgs = new Map<Sheet, HTMLImageElement>();
const ready = new Set<Sheet>();
function load(s: Sheet) {
  if (imgs.has(s) || typeof Image === 'undefined') return;
  const im = new Image();
  imgs.set(s, im);
  trackAtlas(im, SHEETS[s], () => ready.add(s), () => imgs.delete(s), () => { imgs.delete(s); ready.delete(s); });
}
/** whether every sheet has loaded (starts the loads) */
export function stiltArtReady(): boolean {
  (Object.keys(SHEETS) as Sheet[]).forEach(load);
  return ready.size === Object.keys(SHEETS).length;
}
function blit(ctx: CanvasRenderingContext2D, s: Sheet, f: Frame, x: number, y: number, w: number, h: number, flip = false, cut = 1) {
  const img = imgs.get(s);
  if (!img || !ready.has(s)) return;
  ctx.save();
  ctx.translate(x + w / 2, y);
  if (flip) ctx.scale(-1, 1);
  ctx.drawImage(img, f.x, f.y, f.w * cut, f.h, -w / 2, 0, w, h);
  ctx.restore();
}

type View = { x0: number; x1: number; y0: number; y1: number };
const seen = (x0: number, x1: number, y0: number, y1: number, v: View) => x1 > v.x0 - 40 && x0 < v.x1 + 40 && y1 > v.y0 - 40 && y0 < v.y1 + 40;

/** the dressing behind the ledges (the hanging moss, and what stands on the shelves) */
export function drawStiltDecor(ctx: CanvasRenderingContext2D, items: readonly StiltDecor[], view: View): void {
  stiltArtReady();
  for (const d of items) {
    if (isProp(d.n)) {
      const f = STILT_PROP_FRAMES[d.n];
      const h = (f.h * d.w) / f.w;
      const top = d.n === 'moss-curtain' ? d.b : d.b - h;
      if (seen(d.x - d.w / 2, d.x + d.w / 2, top, top + h, view)) blit(ctx, 'c', f, d.x - d.w / 2, top, d.w, h, d.flip);
      continue;
    }
    const f = STILT_FRAMES[d.n];
    const k = d.w / f.w;
    const h = f.h * k;
    if (!seen(d.x - d.w, d.x + d.w, d.b - h, d.b, view)) continue;
    // (anchored at its foot's middle as cut: ax, ay; flipped about that same point)
    const left = d.flip ? d.x - (f.w - f.ax) * k : d.x - f.ax * k;
    blit(ctx, 'gem', f, left, d.b - f.ay * k, d.w, h, d.flip);
  }
}

/** the painted ledges: each look laid over its ledge, its walkable top on the ledge's top */
export function drawStiltLedges(ctx: CanvasRenderingContext2D, ledges: readonly StiltLedge[], view: View): void {
  stiltArtReady();
  for (const l of ledges) {
    const L = LEDGE_LOOKS[l.look];
    const cw = (l.w / l.n) * LEDGE_OVER;
    const h = ledgeHeight(l.look, l.w, l.n);
    const top = l.y - L.top * h;
    if (!seen(l.x - cw, l.x + l.w + cw, top, top + h, view)) continue;
    for (let i = 0; i < l.n; i++) {
      const cx = l.x + (l.w / l.n) * (i + 0.5);
      blit(ctx, L.sheet, L.f, cx - cw / 2, top, cw, h, !!l.flip !== (i % 2 === 1), L.cut ?? 1);
    }
  }
}
