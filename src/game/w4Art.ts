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

let img: HTMLImageElement | null = null;
let ready = false;
function load() {
  if (img || typeof Image === 'undefined') return;
  const im = new Image();
  img = im;
  trackAtlas(im, new URL('../assets/props/w4-props.webp', import.meta.url).href, () => { ready = true; }, () => { img = null; }, () => { img = null; ready = false; });
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
