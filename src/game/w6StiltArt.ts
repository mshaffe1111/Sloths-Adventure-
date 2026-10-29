/**
 * w6StiltArt — 6-8 Stilt Climb's dressing from Matt's painted World 6 hides and arches sheet (Gemini, 2026-10-28; cut to
 * src/assets/w6to10/gemini/w6-hides-arches.webp + .json): a reed hide, a moss hide, a hollow log, a moss arch, a root arch and a root
 * mound, stood on the wide root shelves behind Pokey (pictures only: nothing here is stood on or hurts). The stage lays them
 * (w6Stages.ts) and the engine draws them behind the ledges. Nothing is drawn until the sheet has loaded.
 */
import { trackAtlas } from './atlasLoader.ts';

export const STILT_ART_URL = new URL('../assets/w6to10/gemini/w6-hides-arches.webp', import.meta.url).href;

/** the sheet's pieces, anchored at the middle of the foot (ax, ay) */
export type StiltPiece = 'reed-hide' | 'moss-hide' | 'log-hide' | 'moss-arch' | 'root-arch' | 'root-mound';
/** where each piece sits on the sheet (as its .json beside it says: w6StiltArt.test.ts checks they agree) */
export const STILT_FRAMES: Record<StiltPiece, { x: number; y: number; w: number; h: number; ax: number; ay: number }> = {"reed-hide": {x: 0, y: 0, w: 295, h: 228, ax: 147.0, ay: 228}, "moss-hide": {x: 299, y: 0, w: 290, h: 207, ax: 145.0, ay: 207}, "log-hide": {x: 593, y: 0, w: 300, h: 165, ax: 196.5, ay: 165}, "moss-arch": {x: 897, y: 0, w: 303, h: 222, ax: 152.0, ay: 222}, "root-arch": {x: 1204, y: 0, w: 320, h: 201, ax: 161.0, ay: 201}, "root-mound": {x: 1528, y: 0, w: 308, h: 152, ax: 152.5, ay: 152}};
export const STILT_PIECES = Object.keys(STILT_FRAMES) as StiltPiece[];
const FRAMES = STILT_FRAMES;

/** a piece standing on a shelf: its foot's middle at x, its foot at b, `w` px wide */
export interface StiltDecor { n: StiltPiece; x: number; b: number; w: number; flip?: boolean }

let img: HTMLImageElement | null = null;
let ready = false;
function load() {
  if (img || typeof Image === 'undefined') return;
  const im = new Image();
  img = im;
  trackAtlas(im, STILT_ART_URL, () => { ready = true; }, () => { img = null; }, () => { img = null; ready = false; });
}
/** whether the sheet has loaded (starts the load) */
export function stiltArtReady(): boolean {
  load();
  return ready && !!img;
}

/** draw the dressing a view from (x0, y0) to (x1, y1) shows */
export function drawStiltDecor(ctx: CanvasRenderingContext2D, items: readonly StiltDecor[], view: { x0: number; x1: number; y0: number; y1: number }): void {
  if (!stiltArtReady()) return;
  for (const d of items) {
    const f = FRAMES[d.n];
    const k = d.w / f.w;
    const h = f.h * k;
    if (d.x + d.w < view.x0 || d.x - d.w > view.x1 || d.b < view.y0 || d.b - h > view.y1) continue;
    ctx.save();
    ctx.translate(d.x, d.b);
    if (d.flip) ctx.scale(-1, 1);
    ctx.drawImage(img!, f.x, f.y, f.w, f.h, -f.ax * k, -f.ay * k, d.w, h);
    ctx.restore();
  }
}
