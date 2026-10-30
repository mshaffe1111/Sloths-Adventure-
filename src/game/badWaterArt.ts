/**
 * badWaterArt — Matt's dirty, fast water sheet (Gemini, 2026-10-29) for Worlds 6-10, where Pokey can swim and the water that still costs a
 * life has to look unswimmable: the choppy murky strip repeated along the water and rushing left to right, pale current streaks racing
 * through it and clumps of dead leaves riding the current. Cut by hand from reference/prop-sheets/gemini-batch-2026-10-29/, then
 * repainted at 1024 px on Hugging Face (hf-art-ground 2026-10-29), the strip made periodic left to right so copies meet with no seam.
 *
 * drawBadWater returns false until the sheet has loaded, and the caller then draws the old shapes.
 */
import { trackAtlas } from './atlasLoader.ts';

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

/** how wide each piece is drawn, in world units (the chop strip one TILE; the streaks and leaves as drawBadWater sizes them) */
const DRAWN_W: Record<keyof typeof FRAMES, number> = { chop: TILE, streaks: 120, leaves: 70 };
/**
 * The three pieces baked once at the size they cover on screen (world width times the canvas scale, in eighths, rounded up, so a piece
 * is never enlarged): the 1024 px strip was shrunk about 4.4x from the sheet on every tile, every frame. Made again only when the sheet
 * or the scale changes (a new world, a quality step, the camera's zoom).
 */
const bakes = { img: null as HTMLImageElement | null, k: 0, cv: {} as Partial<Record<keyof typeof FRAMES, HTMLCanvasElement>> };
function bakeAt(ctx: CanvasRenderingContext2D) {
  if (typeof document === 'undefined' || typeof ctx.getTransform !== 'function') return;
  const m = ctx.getTransform();
  const k = Math.ceil(Math.hypot(m.a, m.b) * 8) / 8;
  if (bakes.img === img && bakes.k === k) return;
  bakes.img = img;
  bakes.k = k;
  for (const n of Object.keys(FRAMES) as Array<keyof typeof FRAMES>) {
    const f = FRAMES[n];
    const w = Math.ceil(DRAWN_W[n] * k);
    // (already as small as the sheet itself: drawn straight from the sheet)
    if (w >= f.w) {
      delete bakes.cv[n];
      continue;
    }
    const c = bakes.cv[n] ?? document.createElement('canvas');
    c.width = w;
    c.height = Math.ceil((w * f.h) / f.w);
    const g = c.getContext('2d');
    if (!g) continue;
    g.imageSmoothingEnabled = true;
    g.imageSmoothingQuality = 'high';
    g.drawImage(img!, f.x, f.y, f.w, f.h, 0, 0, c.width, c.height);
    bakes.cv[n] = c;
  }
}

function blit(ctx: CanvasRenderingContext2D, n: keyof typeof FRAMES, x: number, y: number, w: number, h: number) {
  const c = bakes.img === img ? bakes.cv[n] : undefined;
  if (c) {
    ctx.drawImage(c, x, y, w, h);
    return;
  }
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
  // all of it below the view: nothing to draw (the leaves ride no higher than the strip's top)
  if (top - 4 >= bottom || x1 <= x0) return true;
  bakeAt(ctx);
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
