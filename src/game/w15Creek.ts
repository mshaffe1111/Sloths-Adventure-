/**
 * World 1's creek as a HURT FLOOR look (gen2 WorldManifest.hurtLooks 'creek', art 'w15-creek'): ART's fast shallow creek painted at 1-5's
 * dusk (src/assets/props/pitwater/w15-creek.webp + .json, catalog row hf1113/w15-creek: riffles, foam at stones under the surface, no
 * lily pads, no petals). It fills a hollow between its walls, its surface a little over the hurt line so a miss reads as a splash in, and
 * runs fast to the left (a creek, not a pond). Another world (World 2's river) reuses the tile through its own row and tint.
 * Returns false until the picture is in; the caller then draws nothing (as the thorn bed does).
 */
import { trackAtlas } from './atlasLoader.ts';
import CREEK from '../assets/props/pitwater/w15-creek.json';

export const W15_CREEK_ART = 'w15-creek';
const URL_ = new URL('../assets/props/pitwater/w15-creek.webp', import.meta.url).href;
/** world px per tile px (the row's units_per_px: 3 tile px a world px, so its stones sit at Pokey's ankle, not his head) */
const K = CREEK.units_per_px;
const TW = CREEK.w * K, TH = CREEK.h * K, SURF = CREEK.surface * K;
/** how far over the hurt line the water's surface stands (px): he is in the water before the heart goes */
export const CREEK_OVER = 22;
/** how fast it runs (px a second, leftward) */
const RUN = 46;

let img: HTMLImageElement | null = null, ready = false;
export function w15CreekReady(): boolean {
  if (!img && typeof Image !== 'undefined') {
    const im = new Image();
    img = im;
    trackAtlas(im, URL_, () => { ready = true; }, () => { img = null; }, () => { img = null; ready = false; });
  }
  return ready && !!img;
}

/** the creek between x0 and x1 (world px, already clipped to the hollow by the caller), its hurt line at `floor` */
export function drawW15Creek(ctx: CanvasRenderingContext2D, x0: number, x1: number, floor: number): boolean {
  if (!w15CreekReady() || !img) return false;
  const t = (typeof performance !== 'undefined' ? performance.now() : 0) / 1000;
  const top = floor - CREEK_OVER - SURF, shift = (t * RUN) % TW;
  for (let x = Math.floor((x0 - shift) / TW) * TW + shift - TW; x < x1; x += TW) {
    if (x + TW < x0) continue;
    // (a slight bob of the whole tile, half a px either way: the surface lives without a second picture)
    ctx.drawImage(img, x, top + Math.sin(t * 2.1 + x * 0.01) * 0.6, TW + 1, TH);
  }
  ctx.fillStyle = CREEK.bed;
  ctx.fillRect(x0, top + TH - 1, x1 - x0, 260);
  return true;
}
