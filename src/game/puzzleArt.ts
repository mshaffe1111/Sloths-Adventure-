/**
 * puzzleArt — the puzzle kit's painted pieces (Matt's cut-out sheets, packed by tools/art/w5puzzle/packkit.py into puzzle-kit.webp):
 * the acorn, stone, pinecone and cake, the acorn and stone piles, the knot plate up and pressed, the vine gate shut and open, the pulley,
 * the basket empty and full, the lift's plank, the lever both ways, the signpost, the lure beetle's sixteen frames and Pokey's carry,
 * throw and set-down poses. Every draw returns false (and draws nothing) until the sheet has loaded, so callers keep a stand-in.
 *
 * The sheet loads only where a stage has puzzle rooms (stagePreload.ts 'kit-pieces'), and is let go with the world's other sheets
 * (atlasLoader.ts).
 */
import { trackAtlas } from './atlasLoader.ts';
import { KIT_ART, type KitArtName } from './puzzleAtlasData.ts';

export const KIT_ART_URL = new URL('../assets/props/puzzle-kit.webp', import.meta.url).href;
let img: HTMLImageElement | null = null;
let ready = false;
function load() {
  if (img || typeof Image === 'undefined') return;
  const im = new Image();
  img = im;
  trackAtlas(im, KIT_ART_URL, () => { ready = true; }, () => { img = null; }, () => { img = null; ready = false; });
}

/** whether the kit's pieces have loaded (starts the load) */
export function kitArtReady(): boolean {
  load();
  return ready && !!img;
}

/** a piece's size in the game (px), at scale 1 */
export function kitSize(n: KitArtName, scale = 1): { w: number; h: number } {
  const f = KIT_ART[n];
  return { w: f.w * f.k * scale, h: f.h * f.k * scale };
}

export interface KitDrawOpts {
  flip?: boolean;
  scale?: number;
  alpha?: number;
  /** turned about its middle (radians) */
  rot?: number;
  /** stretched to this width (px) instead of its own (the lift's plank, the root wall) */
  w?: number;
  h?: number;
}

/** draw a piece with the middle of its base (its feet) at (x, bottom). False until the sheet has loaded. */
export function drawKitArt(ctx: CanvasRenderingContext2D, n: KitArtName, x: number, bottom: number, o: KitDrawOpts = {}): boolean {
  if (!kitArtReady()) return false;
  const f = KIT_ART[n];
  const s = f.k * (o.scale ?? 1);
  const w = o.w ?? f.w * s;
  const h = o.h ?? f.h * s;
  const ax = o.w ? w / 2 : f.ax * s;
  ctx.save();
  ctx.translate(x, bottom);
  if (o.flip) ctx.scale(-1, 1);
  if (o.alpha !== undefined) ctx.globalAlpha *= o.alpha;
  if (o.rot) {
    ctx.translate(w / 2 - ax, -h / 2);
    ctx.rotate(o.rot);
    ctx.drawImage(img!, f.x, f.y, f.w, f.h, -w / 2, -h / 2, w, h);
  } else ctx.drawImage(img!, f.x, f.y, f.w, f.h, -ax, -h, w, h);
  ctx.restore();
  return true;
}

/** where a pose's held thing sits (world), drawn at (x, bottom) facing `facing` */
export function handOf(n: KitArtName, x: number, bottom: number, facing: 1 | -1): { x: number; y: number } | null {
  const f = KIT_ART[n] as { hx?: number; hy?: number; ax: number; h: number; k: number };
  if (f.hx === undefined || f.hy === undefined) return null;
  return { x: x + (f.hx - f.ax) * f.k * facing, y: bottom - (f.h - f.hy) * f.k };
}
