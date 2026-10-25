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
