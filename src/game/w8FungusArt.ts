/**
 * World 8's fungus steps and knot perches (GRAB-BAG.md H and J): the shelf-fungus brackets painted on Hugging Face in the W8 kit style
 * (tools/art/hfbatch/funguscut.py; jobs.txt hfb-w8fungus-r1b), drawn over every platform of style 'fungus_shelf' in place of the kit's
 * branch. Two looks, a plain bracket and one with moss and two glow mushrooms, alternating by the platform's id. The bracket's flat top
 * (its walkTop row) sits on the platform's top; it is drawn a little wider than the platform, like the kit's branches.
 */
import { trackAtlas } from './atlasLoader.ts';
import type { Platform } from './types.ts';
import { W8_FUNGUS_FRAMES, W8_FUNGUS_URL } from './w8FungusData.ts';

let img: HTMLImageElement | null = null;
let ready = false;

/** start the sheet loading (stagePreload 'w8-fungus'); true once it is in */
export function w8FungusReady(): boolean {
  if (!img && typeof Image !== 'undefined') {
    const im = new Image();
    img = im;
    trackAtlas(im, W8_FUNGUS_URL, () => { ready = true; }, () => { img = null; }, () => { img = null; ready = false; });
  }
  return ready && !!img;
}

/** one bracket over platform `p`; false until the sheet is in (the kit's branch stands in) */
export function drawW8Fungus(ctx: CanvasRenderingContext2D, p: Platform): boolean {
  if (!w8FungusReady()) return false;
  const f = W8_FUNGUS_FRAMES[p.id % 2 ? 'moss' : 'plain'];
  const w = p.width * 1.18;
  const s = w / f.w;
  ctx.drawImage(img!, f.x, f.y, f.w, f.h, Math.round(p.x + p.width / 2 - w / 2), Math.round(p.y - f.walkTop * s - 2), Math.round(w), Math.round(f.h * s));
  return true;
}
