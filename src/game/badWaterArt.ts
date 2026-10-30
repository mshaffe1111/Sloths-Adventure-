/**
 * badWaterArt — Matt's dirty, fast water sheet (Gemini, 2026-10-29) for Worlds 6-10, where Pokey can swim and the water that still costs a
 * life has to look unswimmable: the choppy murky strip repeated along the water and rushing left to right, pale current streaks racing
 * through it and clumps of dead leaves riding the current. Cut by hand from reference/prop-sheets/gemini-batch-2026-10-29/, then
 * repainted at 1024 px on Hugging Face (hf-art-ground 2026-10-29), the strip made periodic left to right so copies meet with no seam.
 *
 * drawBadWater returns false until the sheet has loaded, and the caller then draws the old shapes.
 */
import { trackAtlas } from './atlasLoader.ts';
import { bakeStep } from './artKit.ts';

export const BAD_WATER_URL = new URL('../assets/props/w6-water.webp', import.meta.url).href;
/**
 * Worlds 8-10's own (hf-art-ground 2026-10-30, the W8-10 inventory: all three still showed World 6's muddy water): World 8's moonlit
 * blackwater, World 9's magma pit, World 10's grey storm surge, each with its floating bits and its streaks, in World 6's layout
 * (tools/art/hfground/packwater810.py). Worlds 6 and 7 keep World 6's.
 */
const WORLD_URLS: Record<number, string> = {
  8: new URL('../assets/props/w8-water.webp', import.meta.url).href,
  9: new URL('../assets/props/w9-water.webp', import.meta.url).href,
  10: new URL('../assets/props/w10-water.webp', import.meta.url).href,
};
/** each world's deep water under the strip (its bottom rows) */
const WORLD_DEEP: Record<number, string> = { 8: '#1d2235', 9: '#4b1e0a', 10: '#2d2f34' };
/** the sheet the current world's water is drawn from (setBadWaterWorld) */
export const currentBadWaterUrl = (): string => badWaterUrl(world);
/** the sheet a world's water is drawn from */
export const badWaterUrl = (world: number): string => WORLD_URLS[world] ?? BAD_WATER_URL;
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

/** the world whose water is drawn (setBadWaterWorld): its sheet, loaded when first asked for */
let world = 6;
const sheets = new Map<string, { img: HTMLImageElement | null; ready: boolean }>();
let img: HTMLImageElement | null = null;
let ready = false;
/** draw this world's water from here on (each caller that knows the world sets it; the sheet starts loading) */
export function setBadWaterWorld(w: number): void {
  if (w === world) return;
  world = w;
  load();
}
function load() {
  const url = badWaterUrl(world);
  let st = sheets.get(url);
  if (!st) {
    st = { img: null, ready: false };
    sheets.set(url, st);
  }
  const s = st;
  if (!s.img && typeof Image !== 'undefined') {
    const im = new Image();
    s.img = im;
    trackAtlas(
      im,
      url,
      () => {
        s.ready = true;
        if (badWaterUrl(world) === url) ready = true;
      },
      () => {
        s.img = null;
      },
      () => {
        s.img = null;
        s.ready = false;
      },
    );
  }
  img = s.img;
  ready = s.ready;
}
/**
 * Bake the pieces for a view drawn at `scale` device px a world unit, before play (stageReady, for a stage with this water): a bake costs
 * 7-20 ms on a slow phone, too much for a frame of play. Nothing happens until the sheet has loaded. `stampOn`: the canvas that
 * will show it (the game's), so the bake is uploaded to the GPU before play as well.
 */
export function warmBadWater(scale: number, stampOn?: CanvasRenderingContext2D): void {
  load();
  bakeScale(scale);
  // (a 1x1 stamp of each bake in a corner, so its upload to the GPU happens now too: PERFORMANCE-RULES §2.12)
  if (stampOn && bakes.img === img) for (const c of Object.values(bakes.cv)) if (c) stamp(stampOn, c);
}
function stamp(ctx: CanvasRenderingContext2D, c: CanvasImageSource) {
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(c, 0, 0, 1, 1);
  ctx.restore();
}
/** whether the sheet has loaded (starts the load) */
export function badWaterReady(): boolean {
  load();
  return ready && !!img;
}

/** how wide each piece is drawn, in world units (the chop strip one TILE; the streaks and leaves as drawBadWater sizes them) */
const DRAWN_W: Record<keyof typeof FRAMES, number> = { chop: TILE, streaks: 120, leaves: 70 };
/**
 * The three pieces baked once at the size they cover on screen (world width times the canvas scale, on artKit's bakeStep ladder, so a
 * piece is never enlarged and a zoom inside one step bakes nothing): the 1024 px strip was shrunk about 4.4x from the sheet on every tile, every frame. Made again only when the sheet
 * or the scale changes (a new world, a quality step, the camera's zoom).
 */
const bakes = { img: null as HTMLImageElement | null, k: 0, cv: {} as Partial<Record<keyof typeof FRAMES, HTMLCanvasElement>> };
function bakeAt(ctx: CanvasRenderingContext2D) {
  if (typeof ctx.getTransform !== 'function') return;
  const m = ctx.getTransform();
  bakeScale(Math.hypot(m.a, m.b));
}
function bakeScale(scale: number) {
  if (typeof document === 'undefined' || !img || !ready) return;
  const k = bakeStep(scale);
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
  ctx.fillStyle = WORLD_DEEP[world] ?? DEEP;
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
