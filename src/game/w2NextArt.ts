/**
 * w2NextArt — World 2's next sheet (src/assets/w2-next/w2-next.webp, packed by ENG-27c from ART-NEXT-b's cuts:
 * reference/qa-reports/ENG-27/pack-w2-next.py): 2-7's mail boat (two rowing frames), the PLEASE BE PATIENT door swung open, and the
 * post's letter and reply (two flutter frames each). Every frame is named by its inventory id (`w2-next#<frame>`, the catalog's rows);
 * pacerDraw.ts and postDraw.ts draw them. Loaded with a stage that lays a pacer or a post (stageManifest.ts 'w2-next').
 *
 * Every draw returns false until the sheet has loaded, and the caller then draws nothing (no code-drawn stand-in).
 */
import { trackAtlas } from './atlasLoader.ts';
import W2_NEXT from '../assets/w2-next/w2-next.json';

/** the sheet's address (stagePreload.ts decodes it before a stage that lays a pacer or a post starts) */
export const W2_NEXT_URL = new URL('../assets/w2-next/w2-next.webp', import.meta.url).href;
/** the sheet's own frames: the cutter's cells (w2-next.json) */
export const W2_NEXT_FRAMES: Readonly<Record<string, { x: number; y: number; w: number; h: number }>> = W2_NEXT;
/** cut px a world px (the catalog's on_screen_px: 3 cut px a unit, the mailman about one Pokey tall) */
export const W2_NEXT_SCALE = 3;

let img: HTMLImageElement | null = null;
let ready = false;
/** whether the sheet is in (starts the load) */
export function w2NextReady(): boolean {
  if (!img && typeof Image !== 'undefined') {
    const im = new Image();
    img = im;
    trackAtlas(im, W2_NEXT_URL, () => { ready = true; }, () => { img = null; }, () => { img = null; ready = false; });
  }
  return ready && !!img;
}

/** a frame of this sheet by its inventory id ('w2-next#mailBoat'), or undefined for another sheet's id or an unknown frame */
export function w2NextFrame(id: string): { x: number; y: number; w: number; h: number } | undefined {
  const [sheet, frame] = id.split('#');
  return sheet === 'w2-next' ? W2_NEXT_FRAMES[frame] : undefined;
}

/** a frame by inventory id filling the box (x, y, w, h); `flip` mirrors it. False when the sheet is not in or the id is not this sheet's */
export function drawW2Next(ctx: CanvasRenderingContext2D, id: string, x: number, y: number, w: number, h: number, flip = false): boolean {
  const f = w2NextFrame(id);
  if (!f || !w2NextReady()) return false;
  if (!flip) {
    ctx.drawImage(img!, f.x, f.y, f.w, f.h, x, y, w, h);
    return true;
  }
  ctx.save();
  ctx.translate(x + w, y);
  ctx.scale(-1, 1);
  ctx.drawImage(img!, f.x, f.y, f.w, f.h, 0, 0, w, h);
  ctx.restore();
  return true;
}
