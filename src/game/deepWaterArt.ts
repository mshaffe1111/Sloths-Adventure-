/**
 * deepWaterArt — the painted deep water under the surface strips (2026-10-29, CLEAN-SWEEP S1 and S4: World 2's river and the dirty water
 * of Worlds 6-10 were a flat fill below their painted strips). Two seamless textures, Hugging Face img2img from each strip's own deep rows
 * (tools/art/hazard/cleanstarts.py, cut by cleancut.py): World 2's clear deep river with soft light shafts, and the murky swamp deep.
 * Each is drawn as one row of copies stretched to the water's depth, drifting slowly with the current: the river made seamless side to
 * side (cleancut.py), the murk with every other copy mirrored, so no join shows.
 *
 * drawDeep returns false until the sheet has loaded (stagePreload asks for it before every stage); the caller keeps its plain fill only
 * for that moment.
 */
import { trackAtlas } from './atlasLoader.ts';

export const DEEP_WATER_URL = new URL('../assets/props/deep-water.webp', import.meta.url).href;
/** the two textures, side by side in the sheet */
const FRAMES = { river: { x: 0, y: 0, w: 512, h: 512 }, murk: { x: 514, y: 0, w: 512, h: 512 } };
/** one copy of a texture, in world units */
const TILE = 300;

let img: HTMLImageElement | null = null;
let ready = false;
function load() {
  if (img || typeof Image === 'undefined') return;
  const im = new Image();
  img = im;
  trackAtlas(im, DEEP_WATER_URL, () => { ready = true; }, () => { img = null; }, () => { img = null; ready = false; });
}
/** whether the sheet has loaded (starts the load) */
export function deepWaterReady(): boolean {
  load();
  return ready && !!img;
}

/**
 * The deep water `kind` filling x0..x1 from `top` down to `bottom`, slid `shift` along the current (world units), at `alpha`. False
 * (nothing drawn) before the sheet has loaded.
 */
export function drawDeep(ctx: CanvasRenderingContext2D, kind: keyof typeof FRAMES, x0: number, x1: number, top: number, bottom: number, shift = 0, alpha = 1): boolean {
  if (!deepWaterReady()) return false;
  if (bottom <= top || x1 <= x0) return true;
  const f = FRAMES[kind];
  const s = ((shift % (TILE * 2)) + TILE * 2) % (TILE * 2);
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.beginPath();
  ctx.rect(x0, top, x1 - x0, bottom - top);
  ctx.clip();
  // (one row of copies, each stretched to the full depth, so the water darkens steadily downward: rows of copies mirrored top to bottom
  // turned light again further down)
  const th = Math.max(TILE, bottom - top);
  const gx0 = Math.floor((x0 - s) / TILE) - 1;
  for (let gx = gx0; gx * TILE + s < x1; gx++) {
    const x = gx * TILE + s;
    if (x + TILE < x0) continue;
    const fx = kind === 'murk' && ((gx % 2) + 2) % 2 === 1;
    ctx.save();
    ctx.translate(x + (fx ? TILE : 0), top);
    ctx.scale(fx ? -1 : 1, 1);
    ctx.drawImage(img!, f.x, f.y, f.w, f.h, 0, 0, TILE + 0.6, th);
    ctx.restore();
  }
  ctx.restore();
  return true;
}
