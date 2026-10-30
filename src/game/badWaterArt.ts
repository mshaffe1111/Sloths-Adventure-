/**
 * badWaterArt — Matt's dirty, fast water sheet (Gemini, 2026-10-29) for Worlds 6-10, where Pokey can swim and the water that still costs a
 * life has to look unswimmable: the choppy murky strip repeated along the water and rushing left to right, pale current streaks racing
 * through it and clumps of dead leaves riding the current. Cut by hand from reference/prop-sheets/gemini-batch-2026-10-29/, then
 * repainted at 1024 px on Hugging Face (hf-art-ground 2026-10-29), the strip made periodic left to right so copies meet with no seam.
 *
 * drawBadWater returns false until the sheet has loaded, and the caller then draws the old shapes.
 */
import { trackAtlas } from './atlasLoader.ts';
import { drawDeep } from './deepWaterArt.ts';
import { CHOP_VARIANTS, DEBRIS } from './badWater2Data.ts';

export const BAD_WATER_URL = new URL('../assets/props/w6-water.webp', import.meta.url).href;
// (hf-art-ground 2026-10-29, polish report VI-18: the strip was 183 px wide; repainted on Hugging Face at 1024 from Matt's, the same
// three parts, tools/art/hfground/packwater.py)
const FRAMES = {
  chop: { x: 0, y: 0, w: 1024, h: 528 },
  leaves: { x: 0, y: 541, w: 512, h: 213 },
  streaks: { x: 512, y: 530, w: 512, h: 142 },
};
/** the deep water under the strip (its bottom row) */
const DEEP = '#30312c';
/** one repeat of the strip, in world units */
const TILE = 300;
/** how far down the choppy strip its surface line sits */
const SURFACE = 0.178;

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

const hash = (n: number) => {
  const v = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return v - Math.floor(v);
};

/** the second sheet: more choppy strips and the things riding the current (w6-water2.webp, CLEAN-SWEEP S4: the one strip and the one
 *  leaf clump repeated until they read as a pattern) */
export const BAD_WATER2_URL = new URL('../assets/props/w6-water2.webp', import.meta.url).href;
let img2: HTMLImageElement | null = null;
let ready2 = false;
function load2() {
  if (img2 || typeof Image === 'undefined') return;
  const im = new Image();
  img2 = im;
  trackAtlas(im, BAD_WATER2_URL, () => { ready2 = true; }, () => { img2 = null; }, () => { img2 = null; ready2 = false; });
}
export function badWater2Ready(): boolean {
  load2();
  return ready2 && !!img2;
}

/**
 * the choppy strip repeated from x0 to x1 with its top at `top`, slid `shift` along the current: each copy picked by a hash of its place
 * among the first strip and its painted variants (their edges are the first strip's, so any meets any), so no run of copies repeats
 */
function tiled(ctx: CanvasRenderingContext2D, x0: number, x1: number, top: number, h: number, shift: number) {
  const s = ((shift % TILE) + TILE) % TILE;
  const more = badWater2Ready() ? CHOP_VARIANTS : [];
  for (let x = Math.floor((x0 - s) / TILE) * TILE + s; x < x1; x += TILE - 1) {
    const slot = Math.round((x - s) / TILE);
    const k = Math.floor(hash(slot * 1.37) * (more.length + 1));
    // (and half of them mirrored, so the crests do not march along in step: the strip's two ends match, so a mirrored copy meets too)
    const flip = hash(slot * 4.71) > 0.5;
    ctx.save();
    if (flip) {
      ctx.translate(x * 2 + TILE, 0);
      ctx.scale(-1, 1);
    }
    if (k === 0) blit(ctx, 'chop', x, top, TILE, h);
    else {
      const f = more[k - 1];
      ctx.drawImage(img2!, f.x, f.y, f.w, f.h, x, top, TILE, h);
    }
    ctx.restore();
  }
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
  // the murky deep under the strip (deepWaterArt.ts), drifting with the current; the plain fill only while its sheet loads
  if (!drawDeep(ctx, 'murk', x0, x1, top + th * 0.7, bottom, time * 20 * dir)) {
    ctx.fillStyle = DEEP;
    ctx.fillRect(x0, top + th - 2, x1 - x0, Math.max(0, bottom - (top + th - 2)));
  }
  // the choppy strip rushing along the current
  tiled(ctx, x0, x1, top, th, time * 60 * dir);
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
  // things riding the current, bobbing on the surface: the leaf clump and the painted debris (leaf mats, a rotten log end, foam scum,
  // twigs), each slot its own piece, size and spacing, mirrored at random, so no two in a row match
  const lw = 70, lh = (lw * FRAMES.leaves.h) / FRAMES.leaves.w;
  const more = badWater2Ready() ? DEBRIS : [];
  for (let x = Math.floor(x0 / 480) * 480 - 480; x < x1 + 480; x += 480) {
    const slot = Math.round(x / 480);
    for (let j = 0; j < 2; j++) {
      const hk = hash(slot * 3.1 + j * 17.3);
      if (j === 1 && hk < 0.45) continue;
      const k = Math.abs(slot * 2 + j) % 4;
      const sx = x + j * 200 + hk * 120 + ((((time * (50 + 12 * hk) * dir + k * 130) % 480) + 480) % 480);
      const bob = Math.sin(time * 2.6 + k * 1.9 + j) * 2;
      const pick = Math.floor(hash(slot * 7.7 + j * 2.9) * (more.length + 1));
      const size = 0.75 + 0.5 * hash(slot * 5.3 + j);
      const flip = hash(slot * 9.1 + j) > 0.5;
      ctx.save();
      ctx.translate(sx, waterY + bob);
      if (flip) ctx.scale(-1, 1);
      if (pick === 0) blit(ctx, 'leaves', (-lw * size) / 2, -lh * size * 0.55, lw * size, lh * size);
      else {
        const f = more[pick - 1];
        const w = 64 * size, h = (w * f.h) / f.w;
        ctx.drawImage(img2!, f.x, f.y, f.w, f.h, -w / 2, -h * 0.6, w, h);
      }
      ctx.restore();
    }
  }
  ctx.restore();
  return true;
}
