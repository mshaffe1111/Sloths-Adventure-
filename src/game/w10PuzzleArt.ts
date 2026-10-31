/**
 * World 10's puzzle pieces (gen2/worlds/w10Rooms.ts), in the world's own painted sheets, drawn over the kit's own by puzzlePlay.ts (the
 * kit's art stands in until a sheet loads):
 *   the iron lever on its block, the portcullis down and up: props-made/w10a.webp (each pair on one canvas and anchor, the middle of the
 *     foot, so the two states swap in place)
 *   the pressure plate: a mossy slab in a riveted iron frame, raised and pressed (w10/plate.webp: Hugging Face, from the kit's own plate,
 *     2026-10-29; the kit's w10a plate read as a flat grey slab of flooring, the lead's review)
 *   the hoist's plank: the iron grate hung on two chains (props-made/w10b 'hanging-iron'), its chains run on up off the screen
 *   the hoist's counterweight: a cage on a chain (props-made/w10alt 'cage-b'), the stones in it once they are thrown in
 *   the beam: the iron-banded plank (gemini/w9w10-bridges 'plank-ring') turned on a block of the wall's rock (the kit's 'boulder')
 */
import { KIT_FRAMES } from './kitAtlasData.ts';

export interface W10Frame { x: number; y: number; w: number; h: number; ax: number; ay: number }
const URLS = {
  a: new URL('../assets/w6to10/props-made/w10a.webp', import.meta.url).href,
  b: new URL('../assets/w6to10/props-made/w10b.webp', import.meta.url).href,
  alt: new URL('../assets/w6to10/props-made/w10alt.webp', import.meta.url).href,
  br: new URL('../assets/w6to10/gemini/w9w10-bridges.webp', import.meta.url).href,
  kit: new URL('../assets/kits/w10.webp', import.meta.url).href,
  plate: new URL('../assets/w10/plate.webp', import.meta.url).href,
} as const;
type Sheet = keyof typeof URLS;
export const W10_PUZZLE_FRAMES = {
  'lever-up': { x: 0, y: 0, w: 304, h: 331, ax: 104, ay: 331 },
  'lever-down': { x: 308, y: 0, w: 304, h: 331, ax: 104, ay: 331 },
  'plate-up': { x: 616, y: 0, w: 388, h: 86, ax: 195, ay: 86 },
  'plate-down': { x: 1008, y: 0, w: 388, h: 86, ax: 195, ay: 86 },
  'portcullis-down': { x: 1400, y: 0, w: 374, h: 434, ax: 187, ay: 434 },
  'portcullis-up': { x: 0, y: 438, w: 374, h: 434, ax: 187, ay: 434 },
} as const satisfies Record<string, W10Frame>;
export type W10PieceName = keyof typeof W10_PUZZLE_FRAMES;
const HANGING_IRON: W10Frame = { x: 1203, y: 0, w: 397, h: 316, ax: 198.5, ay: 316 };
const CAGE: W10Frame = { x: 864, y: 0, w: 405, h: 419, ax: 144, ay: 419 };
const PLANK: W10Frame = { x: 0, y: 0, w: 314, h: 89, ax: 182.5, ay: 89 };
const CHAIN = KIT_FRAMES[10].liana;
const BOULDER = KIT_FRAMES[10].boulder;

const imgs = new Map<Sheet, HTMLImageElement>();
const ready = new Set<Sheet>();
function sheet(n: Sheet): HTMLImageElement | null {
  if (typeof Image === 'undefined') return null;
  if (!imgs.has(n)) {
    const im = new Image();
    im.onload = () => ready.add(n);
    im.src = URLS[n];
    imgs.set(n, im);
  }
  return ready.has(n) ? imgs.get(n)! : null;
}
/** start loading the sheets (a World 10 room's KitPlay, as the stage starts) */
export function loadW10RoomArt(): void {
  for (const n of Object.keys(URLS) as Sheet[]) sheet(n);
}

/** a piece `h` px tall (its width from the painting) with the middle of its foot at (x, bottom); false until the sheet has loaded */
export function drawW10Piece(ctx: CanvasRenderingContext2D, n: W10PieceName, x: number, bottom: number, h: number): boolean {
  const img = sheet('a');
  if (!img) return false;
  const f = W10_PUZZLE_FRAMES[n];
  const s = h / f.h;
  ctx.drawImage(img, f.x, f.y, f.w, f.h, x - f.ax * s, bottom - f.ay * s, f.w * s, f.h * s);
  return true;
}

/** the pressure plate's two states, side by side in w10/plate.webp on the same box (its iron frame's foot at the bottom middle) */
const PLATE = { w: 389, h: 157, gap: 4 };
/** the pressure plate, raised or pressed, `w` px wide, the middle of its frame's foot at (x, bottom); false until the sheet has loaded */
export function drawW10Plate(ctx: CanvasRenderingContext2D, down: boolean, x: number, bottom: number, w: number): boolean {
  const img = sheet('plate');
  if (!img) return false;
  const h = (w * PLATE.h) / PLATE.w;
  ctx.drawImage(img, down ? PLATE.w + PLATE.gap : 0, 0, PLATE.w, PLATE.h, x - w / 2, bottom - h, w, h);
  return true;
}

/** the kit chain's links (two links, pinch to pinch), hanging from (x, y0) down to y1 */
function chain(ctx: CanvasRenderingContext2D, kit: HTMLImageElement, x: number, y0: number, y1: number) {
  const K = 0.5, L0 = 160, L1 = 300;
  const th = (L1 - L0) * K;
  for (let y = y0; y < y1; y += th) {
    const h = Math.min(th, y1 - y);
    ctx.drawImage(kit, CHAIN.x, CHAIN.y + L0, CHAIN.w, h / K, x - 44 * K, y, CHAIN.w * K, h + 0.5);
  }
}

/** a chain hung from (x, y0) down to y1 (the kit's chain links): the grab bag's chain lifts and counterweights hang on it (w10PieceArt.ts);
 *  false until the kit has loaded */
export function drawW10Chain(ctx: CanvasRenderingContext2D, x: number, y0: number, y1: number): boolean {
  const kit = sheet('kit');
  if (!kit) return false;
  chain(ctx, kit, x, y0, y1);
  return true;
}

/** the iron-banded plank (gemini w9w10-bridges 'plank-ring'), `w` wide, its top at y; false until its sheet has loaded */
export function drawW10Plank(ctx: CanvasRenderingContext2D, x: number, y: number, w: number): boolean {
  const br = sheet('br');
  if (!br) return false;
  // (the plank's top is 18 px down its painting, past the ring; its body 70 px deep)
  const s = w / (PLANK.w - 40);
  ctx.drawImage(br, PLANK.x, PLANK.y, PLANK.w, PLANK.h, x - 30 * s, y - 18 * s, PLANK.w * s, PLANK.h * s);
  return true;
}

/** the hoist's plank: the iron grate on its two chains, `w` wide, its top at y; the chains on up off the screen */
export function drawW10Hoist(ctx: CanvasRenderingContext2D, cx: number, y: number, w: number): boolean {
  const b = sheet('b'), kit = sheet('kit');
  if (!b || !kit) return false;
  const s = w / HANGING_IRON.w;
  const h = HANGING_IRON.h * s;
  // (the grate's top edge is 6% of the picture's height above its foot; the hooks' eyes at its top)
  const top = y + 0.12 * h - h;
  for (const k of [0.06, 0.94]) chain(ctx, kit, cx - w / 2 + k * w, top - 900, top + 6);
  ctx.drawImage(b, HANGING_IRON.x, HANGING_IRON.y, HANGING_IRON.w, HANGING_IRON.h, cx - w / 2, top, w, h);
  return true;
}

/** the hoist's counterweight: a cage on a chain, its mouth at `mouthY`, `full` once a stone is in */
export function drawW10Counterweight(ctx: CanvasRenderingContext2D, x: number, mouthY: number, full: boolean, drawStone: (x: number, y: number) => void): boolean {
  const alt = sheet('alt'), kit = sheet('kit');
  if (!alt || !kit) return false;
  const h = 96;
  const s = h / CAGE.h;
  const top = mouthY - 22;
  chain(ctx, kit, x, top - 900, top + 8);
  if (full) {
    drawStone(x - 8, top + h - 14);
    drawStone(x + 10, top + h - 18);
  }
  ctx.drawImage(alt, CAGE.x, CAGE.y, CAGE.w, CAGE.h, x - CAGE.ax * s, top, CAGE.w * s, h);
  return true;
}

/** the beam: the iron-banded plank from (x0, y0) to (x1, y1) (its top), turned on a block of rock standing on the ground at `foot` */
export function drawW10Beam(ctx: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, px: number, py: number, foot: number): boolean {
  const br = sheet('br'), kit = sheet('kit');
  if (!br || !kit) return false;
  // (the pivot block: the kit's rock, from the ground up to the pivot)
  const bh = Math.max(40, foot - py + 18);
  const bw = Math.min(120, (BOULDER.w * bh) / BOULDER.h);
  ctx.drawImage(kit, BOULDER.x, BOULDER.y, BOULDER.w, BOULDER.h, px - bw / 2, foot - bh + 6, bw, bh);
  const len = Math.hypot(x1 - x0, y1 - y0) + 30;
  const h = 34;
  ctx.save();
  ctx.translate((x0 + x1) / 2, (y0 + y1) / 2);
  ctx.rotate(Math.atan2(y1 - y0, x1 - x0));
  // (the plank's top edge sits about a fifth down its picture: the ring stands over it)
  ctx.drawImage(br, PLANK.x, PLANK.y, PLANK.w, PLANK.h, -len / 2, -h * 0.35, len, h * (PLANK.h / 60));
  ctx.restore();
  return true;
}
