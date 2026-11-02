/**
 * dressArt — the stage dressing for Worlds 1, 2 and 5 (hf-art-ground, 2026-10-29; polish report VI-17): one small sheet
 * (props/dress.webp, dressAtlasData.ts) of the pieces artDress.ts dressSets lays out: bank sets at the ends of the banks, hanging moss
 * and orchids under the ledges, clutter along the long floors. Pictures only, behind Pokey. Loaded with the stage ('dress' in
 * stageSheets.ts) and let go with its world (atlasLoader.ts); nothing draws until it is in.
 */
import { trackAtlas } from './atlasLoader.ts';
import { DRESS_FRAMES, type DressName } from './dressAtlasData.ts';
import { DRESS_NEW_FRAMES, DRESS_NEW_URLS, type DressNewName } from './dressNewData.ts';
import { drawSheet } from './sheetBake.ts';

export const DRESS_URL = new URL('../assets/props/dress.webp', import.meta.url).href;
let img: HTMLImageElement | null = null;
let ready = false;
function load() {
  if (img || typeof Image === 'undefined') return;
  const im = new Image();
  img = im;
  trackAtlas(im, DRESS_URL, () => { ready = true; }, () => { img = null; }, () => { img = null; ready = false; });
}
/** whether the dressing sheet has loaded (starts the load) */
export function dressReady(): boolean {
  load();
  return ready && !!img;
}

/**
 * hf-props (2026-10-31): Worlds 1-7's new dressing, one small sheet per world (dressNewData.ts, src/assets/props/dressnew-w<N>.webp),
 * loaded with the stage ('dress:<N>' in stageSheets.ts) and drawn by the same call as the first sheet's pieces.
 */
export type AnyDress = DressName | DressNewName;
type Frame = { x: number; y: number; w: number; h: number; units: number; hang?: boolean; world?: number };
const frameOf = (n: AnyDress): Frame => ((DRESS_FRAMES as Record<string, Frame>)[n] ?? (DRESS_NEW_FRAMES as Record<string, Frame>)[n]);
const newImgs = new Map<number, HTMLImageElement>();
const newReady = new Set<number>();
/** the address of a world's new dressing sheet (none for a world without one) */
export function dressNewUrl(world: number): string | undefined {
  return DRESS_NEW_URLS[world];
}
/** whether a world's new dressing sheet has loaded (starts the load) */
export function dressNewReady(world: number): boolean {
  const url = DRESS_NEW_URLS[world];
  if (!url) return false;
  if (!newImgs.has(world) && typeof Image !== 'undefined') {
    const im = new Image();
    newImgs.set(world, im);
    trackAtlas(im, url, () => { newReady.add(world); }, () => { newImgs.delete(world); }, () => { newImgs.delete(world); newReady.delete(world); });
  }
  return newReady.has(world) && newImgs.has(world);
}

/** one piece set in a stage: `x` its middle; `b` the ground under its foot, or for a hanging piece the underside it hangs from */
export interface DressPiece {
  n: AnyDress;
  x: number;
  b: number;
  flip?: boolean;
  alpha?: number;
}

/** a piece's size in the game (world units) */
export function dressSize(n: AnyDress): { w: number; h: number } {
  const f = frameOf(n);
  return { w: f.units, h: (f.units * f.h) / f.w };
}

/** the dressing in view; nothing until the sheet has loaded */
export function drawDress(ctx: CanvasRenderingContext2D, items: readonly DressPiece[], view: { x0: number; x1: number; y0: number; y1: number }) {
  if (!items.length) return;
  // (the first sheet is asked for only by a stage that has its pieces: Worlds 3, 4, 6 and 7 use only their new sheets)
  let old: boolean | undefined;
  for (const d of items) {
    const f = frameOf(d.n);
    // (a piece of a world's new sheet waits for that sheet; the first sheet's for the first)
    const sheet = f.world ? (dressNewReady(f.world) ? newImgs.get(f.world)! : null) : (old ??= dressReady()) ? img! : null;
    if (!sheet) continue;
    const { w, h } = dressSize(d.n);
    const top = f.hang ? d.b : d.b - h;
    if (d.x + w < view.x0 - 20 || d.x - w > view.x1 + 20 || top > view.y1 + 20 || top + h < view.y0 - 20) continue;
    ctx.save();
    ctx.translate(d.x, top);
    if (d.flip) ctx.scale(-1, 1);
    if (d.alpha !== undefined) ctx.globalAlpha *= d.alpha;
    drawSheet(ctx, sheet, f.x, f.y, f.w, f.h, -w / 2, 0, w, h);
    ctx.restore();
  }
}
