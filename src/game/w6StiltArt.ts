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
import { drawRopeAlong } from './ropeArt.ts';

type Frame = { x: number; y: number; w: number; h: number };
const SHEETS = {
  gem: new URL('../assets/w6to10/gemini/w6-hides-arches.webp', import.meta.url).href,
  var: new URL('../assets/w6to10/props-made/w6var.webp', import.meta.url).href,
  d: new URL('../assets/w6to10/props-made/w6d.webp', import.meta.url).href,
  c: new URL('../assets/w6to10/props-made/w6c.webp', import.meta.url).href,
  balt: new URL('../assets/w6to10/props-made/w6balt.webp', import.meta.url).href,
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
export type LedgeLook = 'branch-b' | 'root-arch' | 'root-den' | 'moss-log' | 'stump' | 'bank' | 'bank-edge';
export const LEDGE_LOOKS: Record<LedgeLook, { sheet: Sheet; f: Frame; top: number; cut?: number; max: number }> = {
  'branch-b': { sheet: 'var', f: { x: 0, y: 0, w: 447, h: 162 }, top: 0.031, max: 460 },
  'root-arch': { sheet: 'd', f: { x: 0, y: 0, w: 469, h: 305 }, top: 0.026, max: 360 },
  'root-den': { sheet: 'd', f: { x: 473, y: 0, w: 469, h: 305 }, top: 0.026, max: 360 },
  'moss-log': { sheet: 'd', f: { x: 0, y: 423, w: 460, h: 132 }, top: 0.083, cut: 0.735, max: 420 },
  stump: { sheet: 'var', f: { x: 910, y: 0, w: 431, h: 189 }, top: 0.026, max: 260 },
  // the start's bank: w6var's soil block, and its bank edge (the mud breaking off into the water, roots hanging from it: its walkable top
  // runs over the left `walk` share of its width)
  bank: { sheet: 'var', f: { x: 1345, y: 0, w: 442, h: 387 }, top: 0.057, max: 400 },
  'bank-edge': { sheet: 'var', f: { x: 0, y: 391, w: 414, h: 421 }, top: 0.03, max: 420 },
};
/** the share of the bank edge's width its walkable top runs over (from its left); past it the mud breaks off */
export const BANK_EDGE_WALK = 0.72;
/**
 * the looks that grow out of the ground (the lead's review, 2026-10-29: "a stump or a root den is something that grows out of the
 * ground"; w6var's second plank is a slab on spreading roots too, and reads as one): laid only where their own roots reach down onto the ledge under them (w6Stages.ts sizes them so their feet stand on it)
 */
export const GROUNDED: readonly LedgeLook[] = ['stump', 'root-arch', 'root-den', 'branch-b'];
/** how much wider than its ledge a look is drawn (its painted ends are ragged: the walkable top still covers the ledge) */
export const LEDGE_OVER = 1.1;

/** a ledge the stage paints with one of the looks (its platform is art 'stilt'), laid in `n` copies side by side */
export interface StiltLedge { id: number; look: LedgeLook; x: number; y: number; w: number; n: number; flip?: boolean; over?: number; /** drawn this tall (the start's bank: one piece, no seams) */ h?: number }
/**
 * dressing: a hides-and-arches piece or a w6c prop on its foot at (x, b), `w` px wide; the moss curtain hangs from b. And what holds
 * a ledge up, from its underside at (x, b): a stilt post (w6balt's gauge post) down to its foot at `foot` (a ledge's top, or under the
 * water); a brace (the same post, slanting) down to `to` on a climbing root's trunk; a lashed rope up to `top` (the ledge over it)
 */
export interface StiltDecor {
  n: StiltPiece | StiltProp | 'post' | 'brace' | 'rope';
  x: number;
  b: number;
  w: number;
  flip?: boolean;
  foot?: number;
  to?: [number, number];
  top?: number;
}
export const isProp = (n: StiltDecor['n']): n is StiltProp => n in STILT_PROP_FRAMES;
/** the gauge post: its capped top, then its plain shaft, laid again and again down to the foot */
const POST = { x: 769, w: 78, cap: 215, shaft: [215, 405] as const };

/** how many copies a look takes over a ledge `w` wide */
export const ledgeCopies = (look: LedgeLook, w: number): number => Math.max(1, Math.ceil(w / LEDGE_LOOKS[look].max));
/** how tall a look is drawn over a ledge `w` wide, laid in `n` copies (more copies, each narrower, draw it shallower) */
export function ledgeHeight(look: LedgeLook, w: number, n = ledgeCopies(look, w), over = LEDGE_OVER): number {
  const L = LEDGE_LOOKS[look];
  return ((w / n) * over * L.f.h) / (L.f.w * (L.cut ?? 1));
}
/** how much wider than its ledge a grounded look is drawn, so its feet stand `drop` px under its top (one copy) */
export function overFor(look: LedgeLook, w: number, drop: number): number {
  const L = LEDGE_LOOKS[look];
  return (drop / (1 - L.top)) * (L.f.w * (L.cut ?? 1)) / (w * L.f.h);
}
/** the range of `overFor` a grounded look may be drawn at: its walkable top still covers its ledge, and it overhangs only a little */
export const GROUND_OVER = [1.0, 1.18] as const;
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
type View = { x0: number; x1: number; y0: number; y1: number };
function blit(ctx: CanvasRenderingContext2D, s: Sheet, f: Frame, x: number, y: number, w: number, h: number, flip = false, cut = 1) {
  const img = imgs.get(s);
  if (!img || !ready.has(s)) return;
  ctx.save();
  ctx.translate(x + w / 2, y);
  if (flip) ctx.scale(-1, 1);
  ctx.drawImage(img, f.x, f.y, f.w * cut, f.h, -w / 2, 0, w, h);
  ctx.restore();
}
/** a picture drawn with its right `fade` px fading out (the start's bank over its edge piece: no seam), made once per size */
const faded = new Map<string, HTMLCanvasElement>();
function drawFaded(ctx: CanvasRenderingContext2D, s: Sheet, f: Frame, x: number, y: number, w: number, h: number, fade: number) {
  const img = imgs.get(s);
  if (!img || !ready.has(s) || typeof document === 'undefined') return;
  const key = `${s}:${f.x}:${f.y}:${Math.round(w)}:${Math.round(h)}:${fade}`;
  let c = faded.get(key);
  if (!c) {
    c = document.createElement('canvas');
    c.width = Math.ceil(w);
    c.height = Math.ceil(h);
    const g = c.getContext('2d')!;
    g.drawImage(img, f.x, f.y, f.w, f.h, 0, 0, w, h);
    g.globalCompositeOperation = 'destination-out';
    const gr = g.createLinearGradient(w - fade, 0, w, 0);
    gr.addColorStop(0, 'rgba(0,0,0,0)');
    gr.addColorStop(1, 'rgba(0,0,0,1)');
    g.fillStyle = gr;
    g.fillRect(w - fade, 0, fade, h);
    faded.set(key, c);
  }
  ctx.drawImage(c, x, y, w, h);
}
/** a brace: the post slanting from (x, y) down to (tx, ty), its cap at the top */
function drawBrace(ctx: CanvasRenderingContext2D, x: number, y: number, tx: number, ty: number, w: number, flip = false) {
  const len = Math.hypot(tx - x, ty - y);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Math.atan2(ty - y, tx - x) - Math.PI / 2);
  drawPost(ctx, 0, 0, len, w, { x0: -1e9, x1: 1e9, y0: -1e9, y1: 1e9 }, flip);
  ctx.restore();
}
/** a lashed rope from the ledge over it at top down to its ledge at b: the game's painted rope (ropeArt.ts), hung straight */
function drawRope(ctx: CanvasRenderingContext2D, x: number, top: number, b: number) {
  drawRopeAlong(ctx, [[x, top], [x, b]]);
}
/** a stilt post from b down to foot, `w` wide: the cap, then the shaft laid down to the foot (the last one cut short) */
function drawPost(ctx: CanvasRenderingContext2D, x: number, b: number, foot: number, w: number, view: View, flip = false) {
  const k = w / POST.w;
  const left = x - w / 2;
  const capH = Math.min(POST.cap * k, foot - b);
  blit(ctx, 'balt', { x: POST.x, y: 0, w: POST.w, h: capH / k }, left, b, w, capH, flip);
  const [s0, s1] = POST.shaft;
  const step = (s1 - s0) * k;
  // (only the pieces in view: a post down into the water can be thousands of px long)
  let y = b + capH;
  if (view.y0 - 40 > y) y += Math.floor((view.y0 - 40 - y) / step) * step;
  for (; y < Math.min(foot, view.y1 + 40) - 0.5; y += step) {
    const h = Math.min(step, foot - y);
    blit(ctx, 'balt', { x: POST.x, y: s0, w: POST.w, h: h / k }, left, y, w, h, flip);
  }
}

const seen = (x0: number, x1: number, y0: number, y1: number, v: View) => x1 > v.x0 - 40 && x0 < v.x1 + 40 && y1 > v.y0 - 40 && y0 < v.y1 + 40;

/** the dressing behind the ledges (the hanging moss, and what stands on the shelves) */
export function drawStiltDecor(ctx: CanvasRenderingContext2D, items: readonly StiltDecor[], view: View): void {
  stiltArtReady();
  for (const d of items) {
    if (d.n === 'brace' && d.to) {
      if (seen(Math.min(d.x, d.to[0]), Math.max(d.x, d.to[0]), d.b, d.to[1], view)) drawBrace(ctx, d.x, d.b, d.to[0], d.to[1], d.w, d.flip);
      continue;
    }
    if (d.n === 'rope' && d.top !== undefined) {
      if (seen(d.x - 20, d.x + 20, d.top, d.b, view)) drawRope(ctx, d.x, d.top, d.b);
      continue;
    }
    if (d.n === 'post') {
      const foot = d.foot ?? d.b;
      if (seen(d.x - d.w, d.x + d.w, d.b, foot, view)) drawPost(ctx, d.x, d.b, foot, d.w, view, d.flip);
      continue;
    }
    if (isProp(d.n)) {
      const f = STILT_PROP_FRAMES[d.n];
      const h = (f.h * d.w) / f.w;
      const top = d.n === 'moss-curtain' ? d.b : d.b - h;
      if (seen(d.x - d.w / 2, d.x + d.w / 2, top, top + h, view)) blit(ctx, 'c', f, d.x - d.w / 2, top, d.w, h, d.flip);
      continue;
    }
    const f = STILT_FRAMES[d.n as StiltPiece];
    if (!f) continue;
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
    const cw = (l.w / l.n) * (l.over ?? LEDGE_OVER);
    const h = l.h ?? ledgeHeight(l.look, l.w, l.n, l.over);
    const top = l.y - L.top * h;
    if (!seen(l.x - cw, l.x + l.w + cw, top, top + h, view)) continue;
    if (l.look === 'bank') {
      drawFaded(ctx, L.sheet, L.f, l.x + l.w / 2 - cw / 2, top, cw, h, 80);
      continue;
    }
    for (let i = 0; i < l.n; i++) {
      const cx = l.x + (l.w / l.n) * (i + 0.5);
      blit(ctx, L.sheet, L.f, cx - cw / 2, top, cw, h, !!l.flip !== (i % 2 === 1), L.cut ?? 1);
    }
  }
}
