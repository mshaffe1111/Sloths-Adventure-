/**
 * w4Art — World 4's painted pieces (art batch 1, Hugging Face 2026-10-25: tools/art/w4): the falling rocks and their shards, the
 * fern frond from curled to bridge, the chimes still and swinging, boulders, the falls' rocks, the pools full and drained, the cave,
 * the ribbon log, and the capuchin's poses. Every draw does nothing (returns false) until the atlas has loaded, so callers keep a
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
