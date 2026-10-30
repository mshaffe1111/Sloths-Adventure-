/**
 * w7ChairsArt — 7-3 Ten Chairs' set piece: the ring of ten stone chairs and a plain eleventh on a curved raised floor, one knocked over
 * (Hugging Face, branch hf-w7-chairs, src/assets/w7/chairs-ring.webp, 1600 x 405). The pipeline lays its spot (w7.ts W7_PROP.chairs in the
 * courtyard section w7-chair-ring: proto.gen2.w7.chairs, centred on the ring's floor). It is drawn behind the floors at CHAIRS_W wide, its
 * bottom CHAIRS_SINK under the floor's top, so the floor's own lip covers the strip's carved edge and the ring stands on the courtyard.
 * A picture only: nothing here is solid.
 *
 * drawW7Chairs does nothing until the picture has loaded.
 */
import { trackAtlas } from './atlasLoader.ts';

export const W7_CHAIRS_URL = new URL('../assets/w7/chairs-ring.webp', import.meta.url).href;
/** the picture's size (px) */
const PIC = { w: 1600, h: 405 };
/** how wide the ring is drawn (world px): its chairs half again Pokey's height, the ring across the courtyard, its two steps and a little of the floors either side (all one height) */
export const CHAIRS_W = 1000;
/** how far under the floor's top its bottom sits (the carved strip under the floor's lip) */
const CHAIRS_SINK = 14;

let img: HTMLImageElement | null = null;
let ready = false;
function load() {
  if (img || typeof Image === 'undefined') return;
  const im = new Image();
  img = im;
  trackAtlas(
    im,
    W7_CHAIRS_URL,
    () => {
      ready = true;
    },
    () => {
      img = null;
    },
    () => {
      img = null;
      ready = false;
    },
  );
}
/** whether the picture has loaded (starts the load) */
export function w7ChairsReady(): boolean {
  load();
  return ready && !!img;
}

/** each ring centred at x on the ground b, when it is in view (x0 to x1) */
export function drawW7Chairs(ctx: CanvasRenderingContext2D, chairs: ReadonlyArray<{ x: number; b: number }>, x0: number, x1: number) {
  if (!chairs.length || !w7ChairsReady()) return;
  const h = (CHAIRS_W * PIC.h) / PIC.w;
  for (const c of chairs) {
    if (c.x + CHAIRS_W / 2 < x0 || c.x - CHAIRS_W / 2 > x1) continue;
    ctx.drawImage(img!, c.x - CHAIRS_W / 2, c.b + CHAIRS_SINK - h, CHAIRS_W, h);
  }
}
