/**
 * dressArt — the stage dressing for Worlds 1, 2 and 5 (hf-art-ground, 2026-10-29; polish report VI-17): one small sheet
 * (props/dress.webp, dressAtlasData.ts) of the pieces artDress.ts dressSets lays out: bank sets at the ends of the banks, hanging moss
 * and orchids under the ledges, clutter along the long floors. Pictures only, behind Pokey. Loaded with the stage ('dress' in
 * stageSheets.ts) and let go with its world (atlasLoader.ts); nothing draws until it is in.
 */
import { trackAtlas } from './atlasLoader.ts';
import { DRESS_FRAMES, type DressName } from './dressAtlasData.ts';

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

/** one piece set in a stage: `x` its middle; `b` the ground under its foot, or for a hanging piece the underside it hangs from */
export interface DressPiece {
  n: DressName;
  x: number;
  b: number;
  flip?: boolean;
  alpha?: number;
}

/** a piece's size in the game (world units) */
export function dressSize(n: DressName): { w: number; h: number } {
  const f = DRESS_FRAMES[n];
  return { w: f.units, h: (f.units * f.h) / f.w };
}

/** the dressing in view; nothing until the sheet has loaded */
export function drawDress(ctx: CanvasRenderingContext2D, items: readonly DressPiece[], view: { x0: number; x1: number; y0: number; y1: number }) {
  if (!items.length || !dressReady()) return;
  for (const d of items) {
    const f = DRESS_FRAMES[d.n] as { x: number; y: number; w: number; h: number; units: number; hang?: boolean };
    const { w, h } = dressSize(d.n);
    const top = f.hang ? d.b : d.b - h;
    if (d.x + w < view.x0 - 20 || d.x - w > view.x1 + 20 || top > view.y1 + 20 || top + h < view.y0 - 20) continue;
    ctx.save();
    ctx.translate(d.x, top);
    if (d.flip) ctx.scale(-1, 1);
    if (d.alpha !== undefined) ctx.globalAlpha *= d.alpha;
    ctx.drawImage(img!, f.x, f.y, f.w, f.h, -w / 2, 0, w, h);
    ctx.restore();
  }
}
