/**
 * A narrow bank standing alone, drawn as a post (R-165.440, SIDEWALL-FIX; narrowBank.ts decides which blocks: narrower than Pokey, a side
 * open over his height, its foot on a solid). 1-6's 24 x 345 support under each fragile branch was painted as bank soil, the backdrop's
 * colour: a wall he stopped against with nothing on screen. The look follows the collider: it is drawn as the inventory's tall live post
 * (hf678/w1-livepost-tall, 'support', World 1's made thing: a sawn post wrapped in a vine, moss cap, its root pad on the floor), from the
 * block's top down to the floor it stands on, its root pad sunk into the floor's top, its shaft (about 50 px of the picture's 142) drawn
 * the collider's width plus 8 px, so what he meets is what he sees. The picture's own shape is kept within 20% (the width follows the
 * height when the collider would squash it further). The pattern is BUILD-26t's face posts (2-6, facePostArt.ts on t-build-26).
 *
 * Drawn by the painted ground (protoArt.ts drawProtoScene) LAST, after its cut pieces and rocks: it is a solid on his plane, and 1-6's
 * stair is a cut boulder drawn 200 px past its own collider into the trough, which hid the post (the first after-stills). It starts under
 * what rests on it (the branch's underside), so it never paints over the branch it holds up. Nothing is drawn until the picture has loaded (stagePreload.ts decodes it before a stage that
 * has a post: stageSheets.ts 'live-post'); nothing is ever drawn in its place. One drawImage per post in view, no allocation a frame.
 */
import { trackAtlas } from './atlasLoader.ts';
import type { Platform } from './types.ts';

/** the picture's address (stagePreload.ts decodes it before a stage that has a post) */
export const LIVE_POST_URL = new URL('../assets/w1-678/w1-livepost-tall.webp', import.meta.url).href;
/** the picture's own size, its shaft's width and middle, and where its root pad's top is (px, the cut as shipped) */
export const LIVE_POST_PX = { w: 142, h: 330, shaft: 50, mid: 66, pad: 300 } as const;
let img: HTMLImageElement | null = null;
let ready = false;
function load() {
  if (img || typeof Image === 'undefined') return;
  const im = new Image();
  img = im;
  trackAtlas(im, LIVE_POST_URL, () => { ready = true; }, () => { img = null; }, () => { img = null; ready = false; });
}
/** whether the picture has loaded (starts the load) */
export function livePostReady(): boolean {
  load();
  return ready && !!img;
}

/** where a post is drawn: its box in the world (the picture's top at `top`, under what rests on it; its root pad's top at the floor's top) */
export function livePostBox(p: Platform, top: number, floor: number): { x: number; y: number; w: number; h: number } {
  const P = LIVE_POST_PX;
  const sy = (floor - top) / P.pad;
  const sx = Math.min(1.2 * sy, Math.max(0.8 * sy, (p.width + 8) / P.shaft));
  return { x: p.x + p.width / 2 - P.mid * sx, y: top, w: P.w * sx, h: P.h * sy };
}

/** each post in view drawn standing on its floor */
export function drawLivePosts(ctx: CanvasRenderingContext2D, posts: ReadonlyArray<{ p: Platform; top: number; floor: number }>, view: { x0: number; x1: number; y0?: number; y1?: number }): void {
  if (!posts.length || !livePostReady()) return;
  const y0 = view.y0 ?? -Infinity, y1 = view.y1 ?? Infinity;
  for (const { p, top, floor } of posts) {
    const b = livePostBox(p, top, floor);
    if (b.x > view.x1 || b.x + b.w < view.x0 || b.y > y1 || b.y + b.h < y0) continue;
    ctx.drawImage(img!, 0, 0, LIVE_POST_PX.w, LIVE_POST_PX.h, b.x, b.y, b.w, b.h);
  }
}
