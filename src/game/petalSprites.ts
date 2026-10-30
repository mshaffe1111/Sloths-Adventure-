/**
 * petalSprites — painted drifting petals (2026-10-29, Hugging Face img2img of crops of the game's own painted flowers,
 * tools/art/hazard/petalcut.py): loose petals and small blossoms for the weather of Worlds 2 and 5, World 5's petals drifting through
 * the light, and the petals blown about in Dot's flight. They replace flat code ellipses (Matt 2026-10-29: repeating effects are
 * painted). Nothing is drawn until the sheet has loaded; stagePreload asks for it before every stage.
 */
import { trackAtlas } from './atlasLoader.ts';
import { PETALS } from './petalData.ts';
import { drawSheet } from './sheetBake.ts';

export const PETALS_URL = new URL('../assets/flora/petals.webp', import.meta.url).href;
let img: HTMLImageElement | null = null;
let ready = false;
function load() {
  if (img || typeof Image === 'undefined') return;
  const im = new Image();
  img = im;
  trackAtlas(im, PETALS_URL, () => { ready = true; }, () => { img = null; }, () => { img = null; ready = false; });
}
/** whether the petals have loaded (starts the load) */
export function petalsReady(): boolean {
  load();
  return ready && !!img;
}

/**
 * One petal (`c` picks which: any number, the same one for the same c), `size` px across, turned `rot`, tumbling over by `flip` (1 face
 * on, 0 edge on). False until the sheet has loaded.
 */
export function drawPetal(ctx: CanvasRenderingContext2D, c: number, x: number, y: number, size: number, rot: number, flip: number, alpha: number): boolean {
  if (!petalsReady() || alpha <= 0.01) return !!img && ready;
  const f = PETALS[Math.floor(Math.abs(c) * 7919) % PETALS.length];
  const k = size / Math.max(f.w, f.h);
  ctx.save();
  ctx.globalAlpha *= Math.min(1, alpha);
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.scale(Math.max(0.2, Math.abs(flip)), 1);
  drawSheet(ctx, img!, f.x, f.y, f.w, f.h, (-f.w * k) / 2, (-f.h * k) / 2, f.w * k, f.h * k);
  ctx.restore();
  return true;
}
