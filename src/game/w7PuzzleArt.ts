/**
 * w7PuzzleArt — World 7's puzzle pieces from Matt's Gemini sheets, cut 2026-10-29: the stone door shut and open and the stone lever up
 * and down (src/assets/w6to10/gemini/w7a-puzzle-take2), and the carved pressure plate up and down (props-made/w7-plates). Each pair shares
 * a canvas and an anchor (the middle of its foot), so a piece swaps in place. puzzlePlay.ts draws them in World 7's rooms (7-3's sealed
 * door, 7-7's lever door) instead of the kit's woven gate, wooden lever and knot plate (STAGE-RULES §5b item 3: the art matches the place).
 *
 * drawW7Piece returns false until its sheet has loaded, and the caller draws the kit's piece.
 */
import { trackAtlas } from './atlasLoader.ts';

export const W7_PUZZLE_URLS = [new URL('../assets/w6to10/gemini/w7a-puzzle-take2.webp', import.meta.url).href, new URL('../assets/w6to10/props-made/w7-plates.webp', import.meta.url).href] as const;
type Frame = { sheet: 0 | 1; x: number; y: number; w: number; h: number };
const FRAMES = {
  'lever-up': { sheet: 0, x: 0, y: 0, w: 245, h: 204 },
  'lever-down': { sheet: 0, x: 249, y: 0, w: 245, h: 204 },
  'door-closed': { sheet: 0, x: 498, y: 0, w: 274, h: 277 },
  'door-open': { sheet: 0, x: 776, y: 0, w: 274, h: 277 },
  'plate-up': { sheet: 1, x: 0, y: 0, w: 352, h: 86 },
  'plate-down': { sheet: 1, x: 356, y: 0, w: 352, h: 86 },
} as const satisfies Record<string, Frame>;
export type W7PuzzlePiece = keyof typeof FRAMES;

const imgs: Array<HTMLImageElement | null> = [null, null];
const ready = [false, false];
function load(i: 0 | 1) {
  if (imgs[i] || typeof Image === 'undefined') return;
  const im = new Image();
  imgs[i] = im;
  trackAtlas(
    im,
    W7_PUZZLE_URLS[i],
    () => {
      ready[i] = true;
    },
    () => {
      imgs[i] = null;
    },
    () => {
      imgs[i] = null;
      ready[i] = false;
    },
  );
}
/** whether both sheets have loaded (starts the loads) */
export function w7PuzzleReady(): boolean {
  load(0);
  load(1);
  return ready[0] && ready[1];
}

/** a piece `w` wide (its height kept to its picture unless `h` is given), the middle of its foot at (x, bottom) */
export function drawW7Piece(ctx: CanvasRenderingContext2D, n: W7PuzzlePiece, x: number, bottom: number, w: number, h?: number): boolean {
  if (!w7PuzzleReady()) return false;
  const f = FRAMES[n];
  const dh = h ?? (w * f.h) / f.w;
  ctx.drawImage(imgs[f.sheet]!, f.x, f.y, f.w, f.h, x - w / 2, bottom - dh, w, dh);
  return true;
}
