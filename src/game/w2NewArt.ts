/**
 * World 2's new painted pieces (the W1-4 art rounds, src/assets/w1to4art/w2-new.webp, cut 2026-11-01 and never drawn until 2-3, BUILD-23b:
 * the lead's ruling 8:05 PM ET 11-20): the mooring post and the reed isles first (2-3's beat 5 and its pond's isle, reference/design/2-3.md).
 *
 * A stage lays them as World 2's dressing (proto.decor, riverArt.ts W2Decor `nw`), drawn by drawW2Decor with the rest of the world's
 * dressing. Every draw returns false until the sheet has loaded (stagePreload.ts decodes it first on a stage that asks for it:
 * stageSheets.ts 'w2-new'); nothing is ever drawn in its place.
 */
import { trackAtlas } from './atlasLoader.ts';
import FRAMES from '../assets/w1to4art/w2-new.json';

/** the sheet's cells: the cutter's own list, read as it is (one source: the art-use gate counts its pieces there) */
export const W2_NEW_FRAMES = FRAMES;
export type W2NewPiece = keyof typeof FRAMES;
const F: Record<string, { x: number; y: number; w: number; h: number }> = W2_NEW_FRAMES;

/** the sheet's address (stagePreload.ts decodes it before a stage that asks for it starts) */
export const W2_NEW_URL = new URL('../assets/w1to4art/w2-new.webp', import.meta.url).href;
let img: HTMLImageElement | null = null;
let ready = false;
function load() {
  if (img || typeof Image === 'undefined') return;
  const im = new Image();
  img = im;
  trackAtlas(im, W2_NEW_URL, () => { ready = true; }, () => { img = null; }, () => { img = null; ready = false; });
}
/** whether the sheet has loaded (starts the load) */
export function w2NewReady(): boolean {
  load();
  return ready && !!img;
}

/** a piece's drawn height at width w (its picture's own shape) */
export const w2NewHeight = (n: W2NewPiece, w: number): number => (w * F[n].h) / F[n].w;

/** piece `n` standing on `bottom`, its middle at cx, `w` wide (its own shape); `flip` mirrors it. False (nothing drawn) until loaded */
export function drawW2New(ctx: CanvasRenderingContext2D, n: W2NewPiece, cx: number, bottom: number, w: number, flip = false): boolean {
  if (!w2NewReady()) return false;
  const f = F[n];
  const h = w2NewHeight(n, w);
  if (!flip) {
    ctx.drawImage(img!, f.x, f.y, f.w, f.h, cx - w / 2, bottom - h, w, h);
    return true;
  }
  ctx.save();
  ctx.translate(cx + w / 2, bottom - h);
  ctx.scale(-1, 1);
  ctx.drawImage(img!, f.x, f.y, f.w, f.h, 0, 0, w, h);
  ctx.restore();
  return true;
}
