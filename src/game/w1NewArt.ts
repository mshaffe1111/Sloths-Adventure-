/**
 * World 1's new painted pieces (the W1-4 art rounds, src/assets/w1to4art/w1-new.webp, cut 2026-11-01 and never drawn until now: the
 * designer's ENGINE-SPEC, 11-05): the squirrels who watch Pokey leave at 1-1's start, the hollow logs, the root gates, the knots, the
 * acorn slope, the mossy shut log and the vine rope.
 *
 *   - dressing a stage lays (protoStage.ts ProtoExtras.mixDress: a frame name, its centre x and the ground it stands on), drawn behind
 *     Pokey (engine.ts);
 *   - a log platform marked `hollow` (types.ts Platform.hollow), drawn as the painted hollow log fitted to its box, its top where he
 *     stands (protoArt.ts drawProtoScene; terrain.ts and the painted ground leave it alone).
 *
 * Every draw returns false until the sheet has loaded (stagePreload.ts decodes it first on a stage that asks for it: stageSheets.ts
 * 'w1-new'); nothing is ever drawn in its place.
 */
import { trackAtlas } from './atlasLoader.ts';
import type { Platform } from './types.ts';

/** the sheet's cells (copied from src/assets/w1to4art/w1-new.json, the cutter's own list; w1NewArt.test.ts holds them equal) */
export const W1_NEW_FRAMES = {
  'squirrel-sit': { x: 0, y: 0, w: 361, h: 420 },
  'squirrel-wave': { x: 365, y: 0, w: 373, h: 420 },
  'squirrel-haul': { x: 742, y: 0, w: 257, h: 420 },
  'squirrel-tip': { x: 1003, y: 0, w: 388, h: 420 },
  'squirrel-run': { x: 1395, y: 0, w: 420, h: 317 },
  'root-gate-open': { x: 1819, y: 0, w: 177, h: 300 },
  'root-gate-shut': { x: 0, y: 424, w: 177, h: 299 },
  'acorn-slope': { x: 181, y: 424, w: 479, h: 279 },
  'log-hide': { x: 664, y: 424, w: 534, h: 274 },
  'knot-a': { x: 1202, y: 424, w: 300, h: 231 },
  'hollowlog-moss': { x: 1506, y: 424, w: 446, h: 218 },
  'knot-b': { x: 0, y: 727, w: 268, h: 198 },
  'log-moss-shut': { x: 272, y: 727, w: 422, h: 196 },
  'hollowlog-plain': { x: 698, y: 727, w: 432, h: 192 },
  'vine-rope': { x: 1134, y: 727, w: 298, h: 88 },
} as const;
export type W1NewPiece = keyof typeof W1_NEW_FRAMES;
const F: Record<string, { x: number; y: number; w: number; h: number }> = W1_NEW_FRAMES;

/** the sheet's address (stagePreload.ts decodes it before a stage that asks for it starts) */
export const W1_NEW_URL = new URL('../assets/w1to4art/w1-new.webp', import.meta.url).href;
let img: HTMLImageElement | null = null;
let ready = false;
function load() {
  if (img || typeof Image === 'undefined') return;
  const im = new Image();
  img = im;
  trackAtlas(im, W1_NEW_URL, () => { ready = true; }, () => { img = null; }, () => { img = null; ready = false; });
}
/** whether the sheet has loaded (starts the load) */
export function w1NewReady(): boolean {
  load();
  return ready && !!img;
}
/** whether the sheet has a piece by this name (the bootprint, the 1-1 clue, has none yet: a known art gap, never drawn as a stand-in) */
export const hasW1New = (n: string): n is W1NewPiece => n in F;

/** how tall each kind of dressing stands (world px): a squirrel a little under Pokey's height (about 70), the gates and knots their own */
const DRESS_H: Record<string, number> = { squirrel: 62, 'root-gate': 120, knot: 70, 'acorn-slope': 80, 'log-hide': 90, 'vine-rope': 26 };
const dressH = (n: string) => DRESS_H[Object.keys(DRESS_H).find((k) => n.startsWith(k)) ?? ''] ?? 70;
/** the share of each picture's height under its feet that is transparent margin (measured from the sheet's alpha: the squirrels' feet
 *  are 9 px over the cell's bottom of 420) */
const FOOT = 0.02;

/** piece `n` filling the box (x, y, w, h); `flip` mirrors it */
function blit(ctx: CanvasRenderingContext2D, n: string, x: number, y: number, w: number, h: number, flip = false) {
  const f = F[n];
  if (!flip) {
    ctx.drawImage(img!, f.x, f.y, f.w, f.h, x, y, w, h);
    return;
  }
  ctx.save();
  ctx.translate(x + w, y);
  ctx.scale(-1, 1);
  ctx.drawImage(img!, f.x, f.y, f.w, f.h, 0, 0, w, h);
  ctx.restore();
}

/** a piece of dressing standing on the ground at `bottom`, centred on `cx`; `flip` faces it the other way. False if it has no picture
 *  or the sheet is loading */
export function drawW1Dress(ctx: CanvasRenderingContext2D, n: string, cx: number, bottom: number, flip = false): boolean {
  if (!hasW1New(n) || !w1NewReady()) return false;
  const f = F[n];
  const h = dressH(n), w = (h * f.w) / f.h;
  blit(ctx, n, cx - w / 2, bottom - h * (1 - FOOT), w, h, flip);
  return true;
}

/** where the hollow logs' walkable top sits, as a share of the picture's height (measured from the sheet's alpha down the middle) */
const HOLLOW_TOP: Record<'moss' | 'plain', number> = { moss: 24 / 218, plain: 12 / 192 };
/** a hollow log platform, drawn as Matt's painted hollow log: a little wider than its box, its top where he stands, its mouth to the left
 *  (flipped every other piece, by id) */
export function drawHollowLog(ctx: CanvasRenderingContext2D, p: Platform): boolean {
  const kind = p.hollow;
  if (!kind || !w1NewReady()) return false;
  const n = kind === 'moss' ? 'hollowlog-moss' : 'hollowlog-plain';
  const f = F[n];
  const w = p.width * 1.06, h = (w * f.h) / f.w;
  blit(ctx, n, p.x + p.width / 2 - w / 2, p.y - h * HOLLOW_TOP[kind], w, h, Math.abs(p.id) % 2 === 1);
  return true;
}
