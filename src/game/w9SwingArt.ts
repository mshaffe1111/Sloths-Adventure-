/**
 * World 9's swings in its own painted pieces (gen2/worlds/w9Swing.ts): an iron chain (the Hugging Face irons sheet, w9IronsData.ts) in
 * place of a liana, hanging from an eye bolt under a stone lintel (the W9/W10 bridges sheet's cooled ember slab) that lies across two basalt
 * posts (Matt's W9 props sheet, 'hex-column'): one standing on the swing's own ledge by its end, one on the perch past it. Nothing floats
 * (STAGE-RULES §6): the posts are drawn behind the ground, so their feet stand behind the ledges' fronts.
 *
 * The chain is never stretched: the irons sheet's strand is cut to a whole number of links (tools/art/w9swing/cut.py) and laid end to end
 * down the chain's length, turning with the swing about the bolt. Until the sheets have loaded the game's own liana stands in.
 */
import type { Platform, Vine } from './types.ts';
import { W9_IRONS, W9_IRONS_URL, type W9IronFrame } from './w9IronsData.ts';

const BRIDGES_URL = new URL('../assets/w6to10/gemini/w9w10-bridges.webp', import.meta.url).href;
const W9B_URL = new URL('../assets/w6to10/props-made/w9b.webp', import.meta.url).href;
/** the cells used, from their sheets' json (w9w10-bridges.json, props-made/w9b.json) */
export const W9_BRIDGE_CELLS = {
  charredLog: { x: 1537, y: 0, w: 310, h: 138 },
  plankRing: { x: 0, y: 0, w: 314, h: 89 },
  emberSlab: { x: 1205, y: 0, w: 328, h: 68 },
} as const;
export const W9B_HEX_COLUMN = { x: 430, y: 0, w: 133, h: 426 } as const;

const imgs: Record<string, HTMLImageElement | null> = { irons: null, bridges: null, w9b: null };
const ok: Record<string, boolean> = { irons: false, bridges: false, w9b: false };
/** start loading World 9's swing and room irons (a World 9 stage calls it as it starts) */
export function loadW9Irons(): void {
  if (imgs.irons || typeof Image === 'undefined') return;
  for (const [k, url] of [['irons', W9_IRONS_URL], ['bridges', BRIDGES_URL], ['w9b', W9B_URL]] as const) {
    const im = new Image();
    im.onload = () => { ok[k] = true; };
    im.src = url;
    imgs[k] = im;
  }
}
export const w9IronsReady = (): boolean => ok.irons && ok.bridges && ok.w9b;

/** a cell of the irons sheet, its anchor (the middle of its top for a strand, the middle of its foot otherwise) at (x, y), `w` wide */
export function drawIron(ctx: CanvasRenderingContext2D, n: keyof typeof W9_IRONS, x: number, y: number, w: number): boolean {
  if (!ok.irons) return false;
  const f: W9IronFrame = W9_IRONS[n];
  const s = w / f.w;
  ctx.drawImage(imgs.irons!, f.x, f.y, f.w, f.h, x - f.ax * s, y - f.ay * s, f.w * s, f.h * s);
  return true;
}

/** the chain strand laid from (0, 0) straight down `len` px, `w` wide (whole tiles of links, the last cut to length) */
function strandDown(ctx: CanvasRenderingContext2D, f: W9IronFrame, w: number, len: number) {
  const s = w / f.w;
  const tile = f.h * s;
  for (let y = 0; y < len; y += tile - 1) {
    const h = Math.min(tile, len - y);
    ctx.drawImage(imgs.irons!, f.x, f.y, f.w, h / s, -w / 2, y, w, h);
  }
}

/** a straight chain from (x0, y0) to (x1, y1), `w` wide, its links laid end to end along it (a lift's chains, a bucket's) */
export function drawW9ChainLine(ctx: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, w = 12): boolean {
  if (!ok.irons) return false;
  ctx.save();
  ctx.translate(x0, y0);
  ctx.rotate(Math.atan2(x0 - x1, y1 - y0));
  strandDown(ctx, W9_IRONS.chainB, w, Math.hypot(x1 - x0, y1 - y0));
  ctx.restore();
  return true;
}

/** how thick a swing chain is drawn (world px), and which strand a chain uses (by its id: neighbours differ) */
export const CHAIN_W = 22;
const STRANDS = ['chainA', 'chainB', 'chainC'] as const;

/** a swinging chain: the eye bolt at its top, the strand down to its end, turned `ang` about the bolt. False until the sheets have loaded */
export function drawW9Chain(ctx: CanvasRenderingContext2D, v: { x: number; topY: number; bottomY: number; id: number }, ang: number): boolean {
  if (!w9IronsReady()) return false;
  const f = W9_IRONS[STRANDS[Math.abs(v.id) % STRANDS.length]];
  ctx.save();
  ctx.translate(v.x, v.topY);
  ctx.rotate(-ang);
  strandDown(ctx, f, CHAIN_W, v.bottomY - v.topY);
  ctx.restore();
  // (the bolt over the chain's top link: it does not turn)
  drawIron(ctx, 'eyebolt', v.x, v.topY + 10, 34);
  return true;
}

/**
 * The basalt post's tile: the hex column's shaft (its glowing cap and its foot left off), darkened to the ground's charcoal once, on its
 * own canvas. Laid end to end its joins read as the column's own cracks (basalt columns are jointed), so a post of any height is whole
 * tiles, never a stretched picture (World 6's lesson: stretched posts read as grey pipes).
 */
let postTile: HTMLCanvasElement | null = null;
function postTileOf(): HTMLCanvasElement | null {
  if (postTile || !ok.w9b || typeof document === 'undefined') return postTile;
  const c = W9B_HEX_COLUMN;
  const y0 = Math.round(c.h * 0.16), y1 = Math.round(c.h * 0.86);
  const cv = document.createElement('canvas');
  cv.width = c.w;
  cv.height = y1 - y0;
  const g = cv.getContext('2d');
  if (!g) return null;
  g.drawImage(imgs.w9b!, c.x, c.y + y0, c.w, y1 - y0, 0, 0, c.w, y1 - y0);
  g.globalCompositeOperation = 'source-atop';
  g.fillStyle = 'rgba(28, 20, 22, 0.42)';
  g.fillRect(0, 0, cv.width, cv.height);
  postTile = cv;
  return cv;
}

/** a basalt post from `top` down to `bottom`, `w` wide, centred on x: whole tiles of the column's shaft, laid up from its foot */
export function drawW9Post(ctx: CanvasRenderingContext2D, x: number, top: number, bottom: number, w: number): boolean {
  const t = postTileOf();
  if (!t) return false;
  const th = (t.height * w) / t.width;
  for (let y = bottom; y > top; y -= th - 2) {
    const h = Math.min(th, y - top);
    // (the top tile cut at its top edge, so the post meets what it holds up)
    ctx.drawImage(t, 0, t.height - (h * t.width) / w, t.width, (h * t.width) / w, x - w / 2, y - h, w, h);
  }
  return true;
}

/**
 * The lintel's middle pieces between its two painted ends: each a different cut (`off`, `len` in the slab's own px) of the slab's middle,
 * at `x` `w` wide, every other one flipped, so no two alike side by side. Pure, and always onward (a few px left is the last piece), so it
 * ends for any span (w9SwingArt.test.ts)
 */
export function beamPieces(x0: number, x1: number, h: number, y = 0): Array<{ x: number; w: number; off: number; flip: boolean }> {
  const c = W9_BRIDGE_CELLS.emberSlab;
  const k = h / c.h;
  const cap = c.w * 0.2, mid = c.w - 2 * cap;
  const capW = cap * k;
  const out: Array<{ x: number; w: number; off: number; flip: boolean }> = [];
  let seed = Math.abs(Math.round(x0 * 7 + y * 13)) % 997;
  for (let x = x0 + capW, n = 0; x < x1 - capW - 3; n++) {
    seed = (seed * 73 + 41) % 997;
    const len = mid * (0.55 + 0.45 * ((seed % 100) / 100));
    const off = (mid - len) * (((seed >> 3) % 50) / 50);
    const w = Math.min(len * k, x1 - capW - x);
    out.push({ x, w, off, flip: n % 2 === 1 });
    x += Math.max(1, w - 2);
  }
  return out;
}

/**
 * The lintel from x0 to x1, its middle at y, `h` thick: the bridges sheet's cooled ember slab at its own scale (never stretched: its
 * outline would thicken past the kit's), its two painted ends, and between them its middle in different cuts (beamPieces; the stage
 * walk's detector: one stretched slab read 3.4 px of outline against the kit's 0.6, and one middle piece repeated read as copy-paste)
 */
export function drawW9Beam(ctx: CanvasRenderingContext2D, x0: number, x1: number, y: number, h: number): boolean {
  if (!ok.bridges) return false;
  const c = W9_BRIDGE_CELLS.emberSlab;
  const k = h / c.h;
  const cap = c.w * 0.2;
  const capW = cap * k;
  const top = y - h / 2;
  const im = imgs.bridges!;
  ctx.drawImage(im, c.x, c.y, cap, c.h, x0, top, capW + 1, h);
  ctx.drawImage(im, c.x + c.w - cap, c.y, cap, c.h, x1 - capW - 1, top, capW + 1, h);
  for (const p of beamPieces(x0, x1, h, y)) {
    const sw = p.w / k;
    ctx.save();
    if (p.flip) {
      ctx.translate(p.x + p.w, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(im, c.x + cap + p.off, c.y, sw, c.h, 0, top, p.w + 1, h);
    } else ctx.drawImage(im, c.x + cap + p.off, c.y, sw, c.h, p.x, top, p.w + 1, h);
    ctx.restore();
  }
  return true;
}

/** a bridges-sheet cell `w` wide with the middle of its foot at (x, bottom) */
export function drawW9Bridge(ctx: CanvasRenderingContext2D, n: keyof typeof W9_BRIDGE_CELLS, x: number, bottom: number, w: number, h?: number): boolean {
  if (!ok.bridges) return false;
  const c = W9_BRIDGE_CELLS[n];
  const hh = h ?? (w * c.h) / c.w;
  ctx.drawImage(imgs.bridges!, c.x, c.y, c.w, c.h, x - w / 2, bottom - hh, w, hh);
  return true;
}

/** where a chain's frame stands: its two posts' x and the ledge tops they stand on, and the beam's height */
export interface W9Frame { ax: number; aTop: number; bx: number; bTop: number; beamY: number }
const frames = new WeakMap<Vine, W9Frame | null>();
/** the frame of a swing chain: a post on the ledge it hangs past (by that ledge's end) and one on the perch past it (by its near end) */
export function w9FrameOf(v: Vine, platforms: readonly Platform[]): W9Frame | null {
  if (frames.has(v)) return frames.get(v)!;
  const solid = platforms.filter((p) => p.type !== 'bouncy' && !p.art && p.width >= 60);
  const a = solid
    .filter((p) => p.x + p.width <= v.x + 2 && v.x - (p.x + p.width) < 260 && Math.abs(p.y - v.bottomY) < 90)
    .sort((p, q) => q.x + q.width - (p.x + p.width))[0];
  const b = a
    ? solid.filter((p) => p.x > v.x && p.x - v.x < 700 && p.y < a.y + 60 && p.y > a.y - 200).sort((p, q) => p.x - q.x)[0]
    : undefined;
  const f = a && b ? { ax: a.x + a.width - 26, aTop: a.y, bx: b.x + 26, bTop: b.y, beamY: v.topY - 14 } : null;
  frames.set(v, f);
  return f;
}

/** the posts and the beam of every swing chain on screen (drawn before the ground, so the posts' feet stand behind the ledges) */
export function drawW9SwingFrames(ctx: CanvasRenderingContext2D, platforms: readonly Platform[], vines: readonly Vine[], x0: number, x1: number): void {
  if (!w9IronsReady()) return;
  for (const v of vines) {
    if (v.vineType !== 'swing_liana') continue;
    const f = w9FrameOf(v, platforms);
    if (!f || f.bx < x0 - 100 || f.ax > x1 + 100) continue;
    const top = f.beamY - 8;
    drawW9Post(ctx, f.ax, top, f.aTop + 40, 52);
    drawW9Post(ctx, f.bx, top, f.bTop + 40, 52);
    drawW9Beam(ctx, f.ax - 50, f.bx + 50, f.beamY, 46);
  }
}
