/**
 * badWaterArt — Matt's dirty, fast water sheet (Gemini, 2026-10-29) for Worlds 6-10, where Pokey can swim and the water that still costs a
 * life has to look unswimmable: the choppy murky strip repeated along the water and rushing left to right, pale current streaks racing
 * through it and clumps of dead leaves riding the current. Cut by hand from reference/prop-sheets/gemini-batch-2026-10-29/; the strips'
 * ends were cross-faded so copies meet with no seam.
 *
 * drawBadWater returns false until the sheet has loaded, and the caller then draws the old shapes.
 */
import { trackAtlas } from './atlasLoader.ts';

export const BAD_WATER_URL = new URL('../assets/props/w6-water.webp', import.meta.url).href;
const FRAMES = {
  chop: { x: 0, y: 158, w: 183, h: 86 },
  leaves: { x: 0, y: 246, w: 170, h: 72 },
  streaks: { x: 0, y: 320, w: 180, h: 50 },
};
/** the deep water under the strip (its bottom row) */
const DEEP = '#2d302d';
/** one repeat of the strip, in world units */
const TILE = 300;
/** how far down the choppy strip its surface line sits */
const SURFACE = 0.14;

let img: HTMLImageElement | null = null;
let ready = false;
function load() {
  if (img || typeof Image === 'undefined') return;
  const im = new Image();
  img = im;
  trackAtlas(
    im,
    BAD_WATER_URL,
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
/** whether the sheet has loaded (starts the load) */
export function badWaterReady(): boolean {
  load();
  return ready && !!img;
}

function blit(ctx: CanvasRenderingContext2D, n: keyof typeof FRAMES, x: number, y: number, w: number, h: number) {
  const f = FRAMES[n];
  ctx.drawImage(img!, f.x, f.y, f.w, f.h, x, y, w, h);
}

/** the strip `n` repeated from x0 to x1 with its top at `top`, slid `shift` along the current */
function tiled(ctx: CanvasRenderingContext2D, n: keyof typeof FRAMES, x0: number, x1: number, top: number, h: number, shift: number) {
  const s = ((shift % TILE) + TILE) % TILE;
  for (let x = Math.floor((x0 - s) / TILE) * TILE + s; x < x1; x += TILE - 1) blit(ctx, n, x, top, TILE, h);
}

/** the dirty, fast water between x0 and x1, from its surface `waterY` down to `bottom`, running toward `dir` (World 6's tide: the bank it sweeps you to) */
export function drawBadWater(ctx: CanvasRenderingContext2D, x0: number, x1: number, waterY: number, bottom: number, time: number, dir: 1 | -1 = 1): boolean {
  if (!badWaterReady()) return false;
  const th = (TILE * FRAMES.chop.h) / FRAMES.chop.w;
  const top = waterY - th * SURFACE;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x0, top - 4, x1 - x0, bottom - top + 4);
  ctx.clip();
  ctx.fillStyle = DEEP;
  ctx.fillRect(x0, top + th - 2, x1 - x0, Math.max(0, bottom - (top + th - 2)));
  // the choppy strip rushing along the current
  tiled(ctx, 'chop', x0, x1, top, th, time * 60 * dir);
  // pale streaks racing along under the surface
  const sw = 120, sh = (sw * FRAMES.streaks.h) / FRAMES.streaks.w;
  for (let x = Math.floor(x0 / 260) * 260 - 260; x < x1 + 260; x += 260) {
    const k = Math.abs((x / 260) | 0) % 3;
    const sx = x + ((((time * 170 * dir + k * 90) % 260) + 260) % 260);
    const sy = waterY + 10 + k * 9;
    if (sy + sh > bottom) continue;
    ctx.globalAlpha = 0.8;
    blit(ctx, 'streaks', sx, sy, sw, sh);
  }
  ctx.globalAlpha = 1;
  // dead leaves riding the current, bobbing on the surface
  const lw = 70, lh = (lw * FRAMES.leaves.h) / FRAMES.leaves.w;
  for (let x = Math.floor(x0 / 480) * 480 - 480; x < x1 + 480; x += 480) {
    const k = Math.abs((x / 480) | 0) % 4;
    const sx = x + ((((time * 55 * dir + k * 130) % 480) + 480) % 480);
    const bob = Math.sin(time * 2.6 + k * 1.9) * 2;
    blit(ctx, 'leaves', sx - lw / 2, waterY - lh * 0.55 + bob, lw, lh);
  }
  ctx.restore();
  return true;
}
