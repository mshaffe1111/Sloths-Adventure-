/**
 * World 9's puzzle pieces (gen2/worlds/w9Rooms.ts), drawn over the kit's own in puzzlePlay.ts: Matt's Gemini W9 puzzle sheet
 * (src/assets/w6to10/gemini/w9a-puzzle.webp/json, cut by tools/art/w6to10/geminicut.py): the basalt lever, the hot plate whose cracks
 * glow when it is pressed, the basalt column gate; and World 9's irons (w9SwingArt.ts): the ore bucket, the pulley, chains in place of
 * the kit's ropes, the chain plank of the W9/W10 bridges sheet, and the basalt posts and charred beams that hold them up (nothing floats:
 * every pulley and beam stands on a post on the ground, STAGE-RULES §6). Until the sheets have loaded, the kit's art stands in.
 */
import type { Platform } from './types.ts';
import { drawIron, drawW9Beam, drawW9Bridge, drawW9Post, loadW9Irons, w9IronsReady } from './w9SwingArt.ts';
export { drawW9ChainLine } from './w9SwingArt.ts';
import { W9_IRONS } from './w9IronsData.ts';

export interface W9Frame { x: number; y: number; w: number; h: number; ax: number; ay: number }
export const W9_PUZZLE_URL = new URL('../assets/w6to10/gemini/w9a-puzzle.webp', import.meta.url).href;
export const W9_PUZZLE_FRAMES = {
  'lever-up': { x: 0, y: 0, w: 202, h: 193, ax: 67.5, ay: 193 },
  'lever-down': { x: 206, y: 0, w: 202, h: 193, ax: 67.5, ay: 193 },
  'plate-up': { x: 412, y: 0, w: 296, h: 129, ax: 143.5, ay: 129 },
  'plate-down': { x: 712, y: 0, w: 296, h: 129, ax: 143.5, ay: 129 },
  'gate-closed': { x: 1012, y: 0, w: 276, h: 220, ax: 139.5, ay: 220 },
  'gate-open': { x: 1292, y: 0, w: 276, h: 220, ax: 139.5, ay: 220 },
} as const satisfies Record<string, W9Frame>;
export type W9PieceName = keyof typeof W9_PUZZLE_FRAMES;

let img: HTMLImageElement | null = null;
let ready = false;
/** start loading the sheets (a World 9 room's KitPlay calls it as the stage starts) */
export function loadW9RoomArt(): void {
  loadW9Irons();
  if (img || typeof Image === 'undefined') return;
  img = new Image();
  img.onload = () => { ready = true; };
  img.src = W9_PUZZLE_URL;
}

/** a piece `h` px tall (its width from the painting) with the middle of its foot at (x, bottom); false until the sheet has loaded */
export function drawW9Piece(ctx: CanvasRenderingContext2D, n: W9PieceName, x: number, bottom: number, h: number): boolean {
  if (!ready || !img) return false;
  const f = W9_PUZZLE_FRAMES[n];
  const s = h / f.h;
  ctx.drawImage(img, f.x, f.y, f.w, f.h, x - f.ax * s, bottom - f.ay * s, f.w * s, f.h * s);
  return true;
}

/** the ore bucket, its mouth (the pail's rim) at (x, mouthY), `w` wide; false until the irons have loaded */
export function drawW9Bucket(ctx: CanvasRenderingContext2D, x: number, mouthY: number, w = 74): boolean {
  const f = W9_IRONS.bucket;
  const h = (w * f.h) / f.w;
  // (the rim sits about 30% down the painting, under the bail)
  return drawIron(ctx, 'bucket', x, mouthY + h * 0.7, w);
}

/** the pulley, its wheel's middle at (x, y), `w` wide */
export const drawW9Pulley = (ctx: CanvasRenderingContext2D, x: number, y: number, w = 58): boolean => drawIron(ctx, 'pulley', x, y, w);

/**
 * A pulley held up: a basalt post from the ground at `groundY` up past the wheel, a short charred arm on its top reaching over the wheel,
 * and the pulley hung from the arm by its eye. The post stands at `postX`.
 */
export function drawW9PulleyPost(ctx: CanvasRenderingContext2D, x: number, y: number, groundY: number, postX: number): boolean {
  if (!w9IronsReady()) return false;
  const armY = y - 52;
  drawW9Post(ctx, postX, armY - 12, groundY + 30, 44);
  drawW9Beam(ctx, Math.min(postX, x) - 34, Math.max(postX, x) + 34, armY, 30);
  drawW9Pulley(ctx, x, y);
  return true;
}

/** the chain plank, its top at pl.y (the ring at its end and all) */
export const drawW9Plank = (ctx: CanvasRenderingContext2D, pl: Platform): boolean => drawW9Bridge(ctx, 'plankRing', pl.x + pl.width / 2, pl.y + 24, pl.width + 30, 30);

/** a basalt shelf: the ember slab on its two basalt posts down to the ground at `groundY` */
export function drawW9Shelf(ctx: CanvasRenderingContext2D, pl: Platform, groundY: number): boolean {
  if (!w9IronsReady()) return false;
  drawW9Post(ctx, pl.x + 28, pl.y + 10, groundY + 30, 42);
  drawW9Post(ctx, pl.x + pl.width - 28, pl.y + 10, groundY + 30, 42);
  return drawW9Bridge(ctx, 'emberSlab', pl.x + pl.width / 2, pl.y + 26, pl.width + 30, 34);
}
