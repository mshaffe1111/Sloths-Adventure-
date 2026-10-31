/**
 * World 8's puzzle pieces from Matt's Gemini W8 sheet (reference/prop-sheets/gemini-batch-2026-10-28/w8a-puzzle.jpg, keyed and cut by
 * tools/art/w6to10/geminicut.py into src/assets/w6to10/gemini/w8a-puzzle.webp/json): the branch-lever stump (the kit's lever), the
 * glow-mushroom pad (the plate) and the bark door in its trunk (the gate), each pair on one canvas and anchor (the middle of the foot) so
 * the two states swap in place. World 8's rooms (gen2/worlds/w8Rooms.ts) draw these over the kit's own (puzzlePlay.ts); until the sheet
 * has loaded, the kit's art stands in.
 */
export interface W8Frame { x: number; y: number; w: number; h: number; ax: number; ay: number }
export const W8_PUZZLE_URL = new URL('../assets/w6to10/gemini/w8a-puzzle.webp', import.meta.url).href;
export const W8_PUZZLE_FRAMES = {
  'lever-up': { x: 0, y: 0, w: 225, h: 226, ax: 56.5, ay: 226 },
  'lever-down': { x: 229, y: 0, w: 225, h: 226, ax: 56.5, ay: 226 },
  'plate-up': { x: 458, y: 0, w: 243, h: 132, ax: 121.5, ay: 132 },
  'plate-down': { x: 705, y: 0, w: 243, h: 132, ax: 121.5, ay: 132 },
  'door-closed': { x: 952, y: 0, w: 244, h: 256, ax: 119.5, ay: 256 },
  'door-open': { x: 1200, y: 0, w: 244, h: 256, ax: 119.5, ay: 256 },
} as const satisfies Record<string, W8Frame>;
export type W8PieceName = keyof typeof W8_PUZZLE_FRAMES;

/** the leaf hammock of Matt's W8 props sheet (src/assets/w6to10/props-made/w8b.webp/json, 'leaf-hammock'): the hammock room's lift */
export const W8_PROPS_URL = new URL('../assets/w6to10/props-made/w8b.webp', import.meta.url).href;
export const W8_HAMMOCK: W8Frame = { x: 453, y: 0, w: 473, h: 274, ax: 235, ay: 274 };

let img: HTMLImageElement | null = null;
let ready = false;
let props: HTMLImageElement | null = null;
let propsReady = false;
/** start loading the sheets (a World 8 room's KitPlay calls it as the stage starts) */
export function loadW8RoomArt(): void {
  if (img || typeof Image === 'undefined') return;
  img = new Image();
  img.onload = () => { ready = true; };
  img.src = W8_PUZZLE_URL;
  props = new Image();
  props.onload = () => { propsReady = true; };
  props.src = W8_PROPS_URL;
}

/** the leaf hammock `w` px wide, the bottom of its sag at (x, bottom); false until the sheet has loaded */
export function drawW8Hammock(ctx: CanvasRenderingContext2D, x: number, bottom: number, w: number): boolean {
  if (!propsReady || !props) return false;
  const f = W8_HAMMOCK;
  const s = w / f.w;
  ctx.drawImage(props, f.x, f.y, f.w, f.h, x - f.ax * s, bottom - f.ay * s, f.w * s, f.h * s);
  return true;
}

/** a piece `h` px tall (its width from the painting) with the middle of its foot at (x, bottom); false until the sheet has loaded */
export function drawW8Piece(ctx: CanvasRenderingContext2D, n: W8PieceName, x: number, bottom: number, h: number): boolean {
  if (!ready || !img) return false;
  const f = W8_PUZZLE_FRAMES[n];
  const s = h / f.h;
  ctx.drawImage(img, f.x, f.y, f.w, f.h, x - f.ax * s, bottom - f.ay * s, f.w * s, f.h * s);
  return true;
}
