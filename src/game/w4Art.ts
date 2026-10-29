/**
 * w4Art — World 4's painted pieces (art batch 1, Hugging Face 2026-10-25: tools/art/w4): the falling rocks and their shards, the
 * fern frond from curled to bridge, the chimes still and swinging, boulders, the falls' rocks, the pools full and drained, the cave,
 * the ribbon log, and the capuchin's poses. Batch 2: 4-5's cover (a moss-curtain stump, a fern clump, a wide low bush, a mossy rock
 * shrub), the fruit tree full and picked with its orange and the peel, the falls' lips (trickling and pouring), and the eaglet's nest
 * full and empty, and the eaglet flying. Every draw does nothing (returns false) until the atlas has loaded, so callers keep a
 * stand-in for that moment.
 */
import { trackAtlas } from './atlasLoader.ts';
import { W4_FRAMES } from './w4PropsData.ts';

export type W4Piece = keyof typeof W4_FRAMES;

/** the sheet's address (stagePreload.ts decodes it before a World 4 stage starts) */
export const W4_PROPS_URL = new URL('../assets/props/w4-props.webp', import.meta.url).href;
let img: HTMLImageElement | null = null;
let ready = false;
function load() {
  if (img || typeof Image === 'undefined') return;
  const im = new Image();
  img = im;
  trackAtlas(im, W4_PROPS_URL, () => { ready = true; }, () => { img = null; }, () => { img = null; ready = false; pour = null; });
}

/** whether the World 4 pieces have loaded (starts the load) */
export function w4ArtReady(): boolean {
  load();
  return ready && !!img;
}

/** a piece's drawn height at width w */
export function w4Height(n: W4Piece, w: number): number {
  const f = W4_FRAMES[n];
  return (w * f.h) / f.w;
}

/**
 * Draw a piece `w` wide with its bottom middle at (x, bottom), turned `rot` radians about that point, mirrored with `flip`.
 * Returns false (and draws nothing) before the atlas has loaded.
 */
export function drawW4(ctx: CanvasRenderingContext2D, n: W4Piece, x: number, bottom: number, w: number, opts: { flip?: boolean; rot?: number; alpha?: number } = {}): boolean {
  if (!w4ArtReady()) return false;
  const f = W4_FRAMES[n];
  const h = (w * f.h) / f.w;
  ctx.save();
  ctx.translate(x, bottom);
  if (opts.rot) ctx.rotate(opts.rot);
  if (opts.flip) ctx.scale(-1, 1);
  if (opts.alpha !== undefined) ctx.globalAlpha *= opts.alpha;
  ctx.drawImage(img!, f.x, f.y, f.w, f.h, -w / 2, -h, w, h);
  ctx.restore();
  return true;
}

/**
 * The water pouring off the painted lip ('lipPour'), cut out on its own (its place in that piece): a strip of falling water, the same
 * from top to bottom, that the falls are built from (w4Play.ts drawFallWater, drawVeil), so the water under a lip is the lip's own.
 * Made seamless once, when the sheet has loaded: its last third cross-faded into its first, so copies stacked down a fall meet with no
 * seam. `core` is the strip without its white rims, for the inside of a wide fall; `edge` with its left rim only, for a wide fall's
 * edges (turned round for the right one); `full` the whole strip, for a fall one column wide.
 */
const POUR = { x: 128, y: 38, w: 35, h: 72, rim: 3 };
const POUR_SCALE = 2;
const POUR_FADE = 1 / 3;
export type PourStrip = 'core' | 'edge' | 'full';
let pour: Record<PourStrip, HTMLCanvasElement> | null = null;
const POUR_W: Record<PourStrip, number> = { core: POUR.w - 2 * POUR.rim, edge: POUR.w - POUR.rim, full: POUR.w };
function seamless(sx: number, sw: number): HTMLCanvasElement | null {
  const f = W4_FRAMES.lipPour;
  const W = sw * POUR_SCALE, H = POUR.h * POUR_SCALE, K = Math.round(H * POUR_FADE), P = H - K;
  const cv = document.createElement('canvas');
  cv.width = W;
  cv.height = P;
  const g = cv.getContext('2d');
  const tmp = document.createElement('canvas');
  tmp.width = W;
  tmp.height = K;
  const tg = tmp.getContext('2d');
  if (!g || !tg) return null;
  // the strip's first P rows, then its last K rows laid over the top, fading out downward: the bottom runs on into the top again
  g.drawImage(img!, f.x + sx, f.y + POUR.y, sw, (P / H) * POUR.h, 0, 0, W, P);
  tg.drawImage(img!, f.x + sx, f.y + POUR.y + (P / H) * POUR.h, sw, (K / H) * POUR.h, 0, 0, W, K);
  tg.globalCompositeOperation = 'destination-in';
  const fade = tg.createLinearGradient(0, 0, 0, K);
  fade.addColorStop(0, 'rgba(0,0,0,1)');
  fade.addColorStop(1, 'rgba(0,0,0,0)');
  tg.fillStyle = fade;
  tg.fillRect(0, 0, W, K);
  g.drawImage(tmp, 0, 0);
  return cv;
}
function pourStrips(): typeof pour {
  if (pour || !w4ArtReady() || typeof document === 'undefined') return pour;
  const core = seamless(POUR.x + POUR.rim, POUR_W.core);
  const edge = seamless(POUR.x, POUR_W.edge);
  const full = seamless(POUR.x, POUR_W.full);
  if (core && edge && full) pour = { core, edge, full };
  return pour;
}

/** one repeat of the falling water's strip: its height for a width */
export function pourAspect(n: PourStrip): number {
  return (POUR.h * (1 - POUR_FADE) + 0.5) / POUR_W[n];
}

/** the lip's falling water stretched to the box (x, y, w, h): one repeat of it. False until the atlas has loaded. */
export function drawW4Pour(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, n: PourStrip = 'full'): boolean {
  const p = pourStrips();
  if (!p) return false;
  ctx.drawImage(p[n], x, y, w, h);
  return true;
}

/** the painted cover for each kind of hiding bush in World 4, and how much wider than its hiding box it is drawn */
const COVER: Record<'tall' | 'wide' | 'fern' | 'grotto', { n: W4Piece; k: number }> = {
  tall: { n: 'coverStump', k: 1.3 },
  wide: { n: 'coverWide', k: 1.1 },
  fern: { n: 'coverFern', k: 1.1 },
  grotto: { n: 'coverMossRock', k: 1.15 },
};

/**
 * A hiding bush in World 4 (4-5): the painted cover piece for its kind, in front of Pokey. Only the look: the hiding box (b.x, b.w) and
 * the hiding rules stay watcher.ts's. `inside`: he is in it, so it is a little see-through, and it rustles when he moves. False until
 * the atlas has loaded.
 */
export function drawW4Bush(ctx: CanvasRenderingContext2D, b: { x: number; w: number; y: number; kind: keyof typeof COVER }, inside: boolean, rustle: number, t: number): boolean {
  if (!w4ArtReady()) return false;
  const c = COVER[b.kind];
  ctx.save();
  if (inside) ctx.globalAlpha = 0.62;
  ctx.translate(b.x + b.w / 2, b.y + 6);
  ctx.transform(1, 0, Math.sin(t * 22) * 0.05 * rustle, 1, 0, 0);
  // (some mirrored, so a row of the same kind does not repeat)
  drawW4(ctx, c.n, 0, 0, b.w * c.k, { flip: Math.round(b.x / 10) % 2 === 1 });
  ctx.restore();
  return true;
}
