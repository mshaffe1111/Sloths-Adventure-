/**
 * platformSprites — pre-rendered platform art.
 *
 * Painting a limb or a ruin takes dozens of path operations; a phone at a steady 30 fps cannot afford that for every platform
 * every frame. So each thin platform is painted once into its own small canvas (keyed by world, scene seed, id, look, variant and
 * size) and afterwards costs one drawImage. The cache is dropped whenever the scene seed changes (a new stage) and is bounded: by
 * count, and by memory (a stage's sprites came to as much as 46 MB, memory audit 2026-10-25), letting go first of the sprites that
 * have not been drawn for a while, so the ones on screen are never thrown away and painted again.
 */
import type { Platform } from './types.ts';
import { rng } from './artKit.ts';
import { onSceneSeedChange, getSceneSeed } from './sceneSeed.ts';
import type { Look } from './scenery.ts';
import { paletteFor } from './platformPalette.ts';
import type { Art } from './platformKit.ts';
import { h01, type ThinLook, type ThinPlan } from './platformPlan.ts';

/** texture pixels per world unit */
export const RES = 2;
const MAX_SPRITES = 140;
/** bytes the sprites may hold before the ones not drawn for IDLE_MS are let go */
const BUDGET = 24 * 2 ** 20;
const IDLE_MS = 1500;

export interface Sprite {
  cv: HTMLCanvasElement;
  /** where the platform's top-left sits inside the canvas, in world units */
  ox: number;
  oy: number;
}

/** a painter draws one variant of a look into platform space */
export type Painter = (a: Art) => void;

/** extra room around the collision box a look needs: left/right, above, below the box */
export interface Pad { x: number; top: number; bot: number }

const cache = new Map<string, Sprite>();
/** when each sprite was last drawn (ms), and the bytes they all hold */
const used = new Map<string, number>();
let bytes = 0;
const sizeOf = (sp: Sprite) => sp.cv.width * sp.cv.height * 4;
const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());

function drop(key: string) {
  const sp = cache.get(key);
  if (!sp) return;
  bytes -= sizeOf(sp);
  // a zero-size canvas frees its pixels now, not whenever it is collected (nothing draws a sprite once it has left the cache)
  sp.cv.width = sp.cv.height = 0;
  cache.delete(key);
  used.delete(key);
  stamps.delete(key);
}

export function clearSprites() {
  for (const k of [...cache.keys()]) drop(k);
  bytes = 0;
}
onSceneSeedChange(clearSprites);

/** a cached sprite, marked as drawn now */
function hit(key: string): Sprite | undefined {
  const sp = cache.get(key);
  if (sp) used.set(key, now());
  return sp;
}

export function spriteCount() {
  return cache.size;
}

/** build (or fetch) the sprite for one platform */
export function spriteFor(
  p: Platform, look: Look, world: number, plan: ThinPlan, painter: Painter, pad: Pad, height?: number,
): Sprite {
  const w = Math.round(p.width);
  const h = Math.round(height ?? p.height);
  const key = `${getSceneSeed()}:${world}:${p.id}:${plan.look}:${plan.variant}:${w}:${h}`;
  const had = hit(key);
  if (had) return had;
  const cvW = Math.ceil((w + pad.x * 2) * RES);
  const cvH = Math.ceil((pad.top + h + pad.bot) * RES);
  const cv = document.createElement('canvas');
  cv.width = cvW;
  cv.height = cvH;
  const c = cv.getContext('2d')!;
  c.setTransform(RES, 0, 0, RES, pad.x * RES, pad.top * RES);
  const a: Art = {
    c,
    w,
    h,
    pal: paletteFor(look, world),
    look,
    world,
    r: rng(Math.abs(p.id) * 977 + plan.variant * 131 + 7),
    v: plan.variant,
    id: Math.abs(p.id),
    side: h01(p.id, 3, plan.variant) < 0.5 ? 1 : -1,
  };
  painter(a);
  const sp: Sprite = { cv, ox: pad.x, oy: pad.top };
  store(key, sp);
  return sp;
}

function store(key: string, sp: Sprite) {
  const t = now();
  if (cache.size >= MAX_SPRITES || bytes + sizeOf(sp) > BUDGET) {
    // the oldest ones not drawn lately go first; past half again the count, the oldest go whatever they are
    for (const k of [...cache.keys()]) {
      if (cache.size < MAX_SPRITES && bytes + sizeOf(sp) <= BUDGET) break;
      if (t - (used.get(k) ?? 0) > IDLE_MS || cache.size >= MAX_SPRITES * 1.5) drop(k);
    }
  }
  cache.set(key, sp);
  used.set(key, t);
  bytes += sizeOf(sp);
}

/** what the cache holds (for the tests) */
export const spriteBytes = (): number => bytes;

/** a sprite for anything that is not a thin platform (steps, pillars): painted by `paint` in box space, cached under `key` */
export function bakeSprite(key: string, w: number, h: number, pad: Pad, paint: (c: CanvasRenderingContext2D) => void): Sprite {
  const k = `${getSceneSeed()}:${key}`;
  const had = hit(k);
  if (had) return had;
  const cv = document.createElement('canvas');
  cv.width = Math.ceil((w + pad.x * 2) * RES);
  cv.height = Math.ceil((pad.top + h + pad.bot) * RES);
  const c = cv.getContext('2d')!;
  c.setTransform(RES, 0, 0, RES, pad.x * RES, pad.top * RES);
  paint(c);
  const sp: Sprite = { cv, ox: pad.x, oy: pad.top };
  store(k, sp);
  return sp;
}

const tiles = new Map<string, CanvasPattern>();
onSceneSeedChange(() => tiles.clear());

/** a vertically repeating tile (w x h units, painted by `paint`) as a pattern, for the shafts below steps and pillars */
export function shaftPattern(ctx: CanvasRenderingContext2D, key: string, w: number, h: number, paint: (c: CanvasRenderingContext2D) => void): CanvasPattern {
  const k = `${getSceneSeed()}:${key}`;
  const hit = tiles.get(k);
  if (hit) return hit;
  const cv = document.createElement('canvas');
  cv.width = Math.ceil(w * RES);
  cv.height = Math.ceil(h * RES);
  const c = cv.getContext('2d')!;
  c.scale(RES, RES);
  paint(c);
  const pat = ctx.createPattern(cv, 'repeat-y')!;
  tiles.set(k, pat);
  return pat;
}

/** blit a sprite so its box sits exactly on the platform (rounded to whole units so the lip stays crisp) */
export function blit(ctx: CanvasRenderingContext2D, sp: Sprite, x: number, y: number) {
  ctx.drawImage(sp.cv, Math.round(x) - sp.ox, Math.round(y) - sp.oy, sp.cv.width / RES, sp.cv.height / RES);
}

export type { ThinLook };

/**
 * A small piece drawn at a point (a plant, a tuft, a flower or a stone on a ledge top: terrain.ts topDecor), painted once at the screen's
 * own scale and cropped to what it covers (PF-1b: a ground ledge's growing things were hundreds of path calls a frame, each one a fixed
 * cost on an iPhone at any resolution). Its pixels sit on the screen's own pixel grid, so it is a straight copy, not a resample: it looks
 * as the live drawing did. Kept under the sprites' byte budget and dropped with them on a new stage.
 */
export interface Stamp {
  cv: HTMLCanvasElement;
  /** the canvas's top-left in world units */
  x: number;
  y: number;
  /** its size in world units */
  w: number;
  h: number;
}
const stamps = new Map<string, Stamp | null | undefined>();
/** how many stamps have been painted (the caller counts its new ones a frame from it) */
export let stampsPainted = 0;
/** room round the anchor anything growing on a ledge may need: sideways, above, below (world units) */
const STAMP_BOX = { x: 240, up: 380, down: 90 };
let scratch: CanvasRenderingContext2D | null = null;
onSceneSeedChange(() => stamps.clear());

/**
 * The stamp for `key` drawn by `paint` (world units, anchored at ax, ay) at screen scale `scale`, the world's screen offset being a whole
 * number of pixels. Null when it draws nothing or when it cannot be made (no canvas): the caller draws it live then.
 */
export function stampFor(key: string, scale: number, ax: number, ay: number, paint: (c: CanvasRenderingContext2D) => void, mayPaint = true): Stamp | null | undefined {
  const k = `${getSceneSeed()}:${scale}:${key}`;
  if (stamps.has(k)) {
    const st = stamps.get(k);
    if (st) used.set(k, now());
    return st;
  }
  if (!mayPaint || typeof document === 'undefined') return undefined;
  // where it reaches: painted once at one pixel per unit into a scratch canvas and its covered rows and columns found
  const bw = STAMP_BOX.x * 2;
  const bh = STAMP_BOX.up + STAMP_BOX.down;
  if (!scratch) {
    const cv = document.createElement('canvas');
    cv.width = bw;
    cv.height = bh;
    scratch = cv.getContext('2d', { willReadFrequently: true });
    if (!scratch) return undefined;
  }
  const s = scratch;
  s.setTransform(1, 0, 0, 1, 0, 0);
  s.clearRect(0, 0, bw, bh);
  s.setTransform(1, 0, 0, 1, STAMP_BOX.x - ax, STAMP_BOX.up - ay);
  s.save();
  paint(s);
  s.restore();
  const d = s.getImageData(0, 0, bw, bh).data;
  let x0 = bw, x1 = -1, y0 = bh, y1 = -1;
  for (let y = 0; y < bh; y++) {
    const row = y * bw * 4;
    for (let x = 0; x < bw; x++) {
      if (d[row + x * 4 + 3]) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        y1 = y;
      }
    }
  }
  // (something reaching the edge of the room may be bigger than it: never cropped, it is drawn live for good)
  if (x1 >= 0 && (x0 === 0 || y0 === 0 || x1 === bw - 1 || y1 === bh - 1)) {
    stamps.set(k, undefined);
    stampsPainted++;
    return undefined;
  }
  if (x1 < 0) {
    stamps.set(k, null);
    stampsPainted++;
    return null;
  }
  // (two units of margin for the smoothing at its edges, then whole screen pixels so it lands on the screen's own grid)
  const wx0 = ax - STAMP_BOX.x + x0 - 2;
  const wy0 = ay - STAMP_BOX.up + y0 - 2;
  const px0 = Math.floor(wx0 * scale);
  const py0 = Math.floor(wy0 * scale);
  const pw = Math.ceil((x1 - x0 + 5) * scale) + 1;
  const ph = Math.ceil((y1 - y0 + 5) * scale) + 1;
  const cv = document.createElement('canvas');
  cv.width = pw;
  cv.height = ph;
  const c = cv.getContext('2d');
  if (!c) return undefined;
  c.setTransform(scale, 0, 0, scale, -px0, -py0);
  paint(c);
  const st: Stamp = { cv, x: px0 / scale, y: py0 / scale, w: pw / scale, h: ph / scale };
  // (held against the same byte budget as the platform sprites, the stalest let go first)
  const sp: Sprite = { cv, ox: 0, oy: 0 };
  store(k, sp);
  stamps.set(k, st);
  stampsPainted++;
  return st;
}
