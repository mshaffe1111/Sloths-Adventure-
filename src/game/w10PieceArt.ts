/**
 * w10PieceArt — World 10's grab-bag stepping pieces (qa-notes/w10/GRAB-BAG.md G, H, I, J), each a thin platform of its own style,
 * painted from sheets already made for World 10 and never drawn before:
 *   'w10_perch'    a timber post with a plank on top, stuck up out of a chasm (props-made/w10var 'perch-b'): the plank is the platform,
 *                  the post runs on down into the dark
 *   'w10_balcony'  a stone balcony on its two corbels, jutting from a tower (props-made/w10b 'balcony')
 *   'w10_stair'    one tread of the iron stair bolted to a tower face (props-made/w10b 'iron-stair', its top tread and post)
 *   'w10_scaffold' the iron walkway with its rail (props-made/w10b 'scaffold')
 *   'w10_trap'     a trapdoor grate (trapdoor.ts): shut, w10var's iron grate (its sheet names it 'branch-b'), shuddering as it warns; open,
 *                  the grab bag's HF grate (w10BagArt 'grate') hanging from its hinge
 *   'w10_bridge'   the chain bridge slung across a chasm (gemini/w9w10-bridges 'chain-bridge'), stretched by its ends, never its middle
 * Each draw puts the painted walking surface on the collider's top (STAGE-RULES §5b: nobody stands in the air or sinks into a ledge).
 * Every draw returns false until its sheet has loaded (the kit's own look stands in).
 */
import { trackAtlas } from './atlasLoader.ts';
import type { Platform } from './types.ts';
import { trapState } from './trapdoor.ts';
import { drawW10Bag, W10_BAG_FRAMES } from './w10BagArt.ts';
import { drawW10Chain, drawW10Plank, loadW10RoomArt } from './w10PuzzleArt.ts';
import { drawW10Gear, W10_PIT_FLOOR } from './w10GearArt.ts';

export type W10PieceStyle = 'w10_perch' | 'w10_balcony' | 'w10_stair' | 'w10_scaffold' | 'w10_bridge' | 'w10_trap';
export const W10_PIECE_STYLES: readonly W10PieceStyle[] = ['w10_perch', 'w10_balcony', 'w10_stair', 'w10_scaffold', 'w10_bridge', 'w10_trap'];
export const isW10Piece = (p: Pick<Platform, 'style'>): boolean => !!p.style && (W10_PIECE_STYLES as readonly string[]).includes(p.style);

const URLS = {
  b: new URL('../assets/w6to10/props-made/w10b.webp', import.meta.url).href,
  v: new URL('../assets/w6to10/props-made/w10var.webp', import.meta.url).href,
  br: new URL('../assets/w6to10/gemini/w9w10-bridges.webp', import.meta.url).href,
} as const;
type Sheet = keyof typeof URLS;
export const W10_PIECE_URLS: readonly string[] = Object.values(URLS);

/**
 * Each look: its sheet, the source box, and where the walking surface lies in it (`top`, px from the box's top) and how wide it is
 * (`x0`..`x1`, px from the box's left): the platform's [x, x + width] maps onto [x0, x1], its y onto `top`.
 */
interface Look { sheet: Sheet; x: number; y: number; w: number; h: number; top: number; x0: number; x1: number }
const LOOK: Record<W10PieceStyle, Look> = {
  // the perch's plank on its bracket, 116 px across, 82 px down the post (the post's top stands above it at the plank's back end)
  w10_perch: { sheet: 'v', x: 450, y: 0, w: 200, h: 427, top: 82, x0: 72, x1: 188 },
  // the balcony's slab top runs the box's width less its chipped ends; the corbels hang under it
  w10_balcony: { sheet: 'b', x: 775, y: 0, w: 424, h: 295, top: 44, x0: 30, x1: 396 },
  // the iron stair's top tread (the upper right of the painting) and the post under it
  w10_stair: { sheet: 'b', x: 1604 + 240, y: 0, w: 153, h: 302, top: 28, x0: 7, x1: 92 },
  // the walkway's grate (the rail stands above it)
  w10_scaffold: { sheet: 'b', x: 0, y: 0, w: 467, h: 128, top: 75, x0: 0, x1: 467 },
  // the iron grate (w10var 'branch-b', a little perspective: its middle is the floor)
  w10_trap: { sheet: 'v', x: 1552, y: 0, w: 438, h: 83, top: 24, x0: 8, x1: 430 },
  // the chain bridge's deck (its posts at either end)
  w10_bridge: { sheet: 'br', x: 563, y: 0, w: 307, h: 118, top: 34, x0: 8, x1: 299 },
};

const imgs = new Map<Sheet, HTMLImageElement>();
const ready = new Set<Sheet>();
function sheet(n: Sheet): HTMLImageElement | null {
  if (typeof Image === 'undefined') return null;
  if (!imgs.has(n)) {
    const im = new Image();
    imgs.set(n, im);
    trackAtlas(im, URLS[n], () => ready.add(n), () => imgs.delete(n), () => (imgs.delete(n), ready.delete(n)));
  }
  return ready.has(n) ? imgs.get(n)! : null;
}
/** the w10var sheet (the gutter spout's wall stub stands on its 'bank-b' wall: w10DropArt.ts) */
export const w10VarSheet = (): HTMLImageElement | null => sheet('v');

/** start loading every sheet (stagePreload 'w10') */
export function w10PiecesReady(): boolean {
  return (Object.keys(URLS) as Sheet[]).map((n) => !!sheet(n)).every(Boolean);
}

/** the rubble heap (w10var 'stump-b', 448 x 240): a knob on a soft pit's floor under the moving planks (w10Game decorate) */
const RUBBLE = { x: 654, y: 0, w: 448, h: 240 };

/** a grab-bag piece in its painting (false: not one of them, or its sheet is still loading) */
export function drawW10PieceArt(ctx: CanvasRenderingContext2D, p: Platform, t = 0): boolean {
  if (p.style === 'w10_rubble') {
    // (the heap's foot on the pit floor, the knob's foot; its crown a few px over the knob's top, so he stands in its rounded top. Which
    // heap, by the spot: w10var's plain rubble, or one of the gear sheet's (a half-sunk cog, a fallen gear, a coil of chain))
    const pick = Math.floor(Math.abs(Math.sin(p.x * 12.9898) * 43758.5453) % 1 * (W10_PIT_FLOOR.length + 1));
    if (pick < W10_PIT_FLOOR.length && drawW10Gear(ctx, W10_PIT_FLOOR[pick], p.x + p.width / 2, p.y + (p.height ?? 30), (p.height ?? 30) + 10)) return true;
    const img = sheet('v');
    if (!img) return false;
    const h = (p.height ?? 30) + 6;
    const w = (h * RUBBLE.w) / RUBBLE.h;
    ctx.drawImage(img, RUBBLE.x, RUBBLE.y, RUBBLE.w, RUBBLE.h, p.x + p.width / 2 - w / 2, p.y + (p.height ?? 30) - h, w, h);
    return true;
  }
  if (!isW10Piece(p)) return false;
  const L = LOOK[p.style as W10PieceStyle];
  const img = sheet(L.sheet);
  if (!img) return false;
  const s = p.width / (L.x1 - L.x0);
  if (p.trap) {
    const st = trapState(p.trap, t);
    if (st.open) {
      // (hanging from its hinge at the near end: the HF open grate, drawn the grate's length down from the hinge, flipped for a far hinge)
      const h = p.width * 1.05;
      return drawW10Bag(ctx, 'grate', p.x + 40 + (1 - st.swing) * p.width * 0.35, p.y + h * (0.55 + 0.45 * st.swing) - 6, h * (0.6 + 0.4 * st.swing));
    }
    const dy = st.shake ? Math.sin(t * 52) * 2.4 * st.shake : 0;
    ctx.drawImage(img, L.x, L.y, L.w, L.h, p.x - L.x0 * s, p.y - L.top * s + dy, L.w * s, L.h * s);
    return true;
  }
  if (p.style === 'w10_bridge') {
    // (at 0.6 of its painting, a deck about 70 px deep under the walk: the two end posts keep their width and the deck's middle repeats
    // between them, offset by where the span stands so two bridges never line up plank for plank)
    const k = 0.6;
    const end = 52;
    const dh = L.h * k;
    const y = p.y - L.top * k;
    const x0 = p.x - 20;
    const midW = Math.max(0, p.width + 40 - 2 * end * k);
    ctx.drawImage(img, L.x, L.y, end, L.h, x0, y, end * k, dh);
    const tile = (L.w - 2 * end) * k;
    const skip = (p.x * 0.37) % tile;
    for (let u = -skip; u < midW - 0.5; u += tile) {
      const a = Math.max(0, u), z = Math.min(midW, u + tile);
      if (z <= a) continue;
      const s0 = (a - u) / k, s1 = (z - u) / k;
      ctx.drawImage(img, L.x + end + s0, L.y, s1 - s0, L.h, x0 + end * k + a, y, z - a + 0.6, dh);
    }
    ctx.drawImage(img, L.x + L.w - end, L.y, end, L.h, x0 + end * k + midW, y, end * k, dh);
    return true;
  }
  if (p.style === 'w10_stair') {
    // (the tread and its bracket, then the post under its far end: the painting's diagonal stringer below the tread is left out, so no
    // stub of the next flight hangs under it, the lead's review)
    const TOP = 22;
    const TREAD = 54;
    const POST = 115;
    ctx.drawImage(img, L.x, L.y + TOP, L.w, TREAD - TOP, p.x - L.x0 * s, p.y - (L.top - TOP) * s, L.w * s, (TREAD - TOP) * s);
    ctx.drawImage(img, L.x + POST, L.y + TREAD, L.w - POST, L.h - TREAD, p.x - L.x0 * s + POST * s, p.y - L.top * s + TREAD * s, (L.w - POST) * s, (L.h - TREAD) * s);
    return true;
  }
  ctx.drawImage(img, L.x, L.y, L.w, L.h, p.x - L.x0 * s, p.y - L.top * s, L.w * s, L.h * s);
  return true;
}

// ───────────────────────────── the moving platforms (GRAB-BAG A, B, C: World 9's riser, lift.ts `bob`) ─────────────────────────────

/** the chains run this far over a lift's top stop, to the pulley block or off the screen */
const CHAIN_UP = 320;

/**
 * World 10's risers, drawn over the engine's lift (engine.ts hands every `bob` platform of World 10 here):
 *   'w10_lift'  A: the iron-banded plank on two chains, the chains running up to a pulley block high on the wall (bag 'pulley')
 *   'w10_cw'    B: the same plank on one chain over a pulley wheel, the iron counterweight (bag 'weight') riding the other side
 *   'w10_gear'  C: a stone block on a toothed rack (bag 'rack') rising out of its well, the great cog (bag 'cog') turning beside it
 * False for anything else, or until its sheets load (the engine's own slab stands in).
 */
export function drawW10Bob(ctx: CanvasRenderingContext2D, p: Platform, t: number): boolean {
  const l = p.lift;
  if (!l || !p.style) return false;
  loadW10RoomArt();
  const cx = p.x + p.width / 2;
  if (p.style === 'w10_lift' || p.style === 'w10_cw') {
    const top = l.top - CHAIN_UP;
    if (p.style === 'w10_lift') {
      if (!drawW10Chain(ctx, p.x + 14, top, p.y + 4) || !drawW10Chain(ctx, p.x + p.width - 14, top, p.y + 4)) return false;
      drawW10Bag(ctx, 'pulley', cx, top + 40, 90);
    } else {
      // (one chain over the wheel: the plank on this side, the counterweight on the other, so the weight is low when the plank is high)
      const wheelR = 46;
      if (!drawW10Chain(ctx, cx - wheelR, top, p.y + 4) || !drawW10Chain(ctx, cx + wheelR, top, top + (l.bottom - p.y) + 80)) return false;
      const f = W10_BAG_FRAMES.weight;
      drawW10Bag(ctx, 'weight', cx + wheelR, top + (l.bottom - p.y) + 80 + 70, 70 * (f.h / f.h));
      ctx.save();
      ctx.translate(cx, top);
      ctx.rotate((p.y - l.top) / wheelR);
      drawW10Bag(ctx, 'cog', 0, wheelR, wheelR * 2);
      ctx.restore();
    }
    return drawW10Plank(ctx, p.x, p.y, p.width);
  }
  if (p.style === 'w10_gear') {
    // (the block's painted top is 6 px down its painting; the rack runs down into the well past the bottom stop)
    const f = W10_BAG_FRAMES.rack;
    const s = (p.width + 30) / f.w;
    drawW10Bag(ctx, 'rack', cx, p.y - 6 * s + f.h * s, f.h * s);
    // (the cog is set in the bank's face below the walk, its rim just under the top: never a thing on the walk to trip on)
    ctx.save();
    ctx.translate(p.x - 30, l.bottom + 58);
    ctx.rotate(-(p.y - l.bottom) / 40);
    const ok = drawW10Bag(ctx, 'cog', 0, 45, 90);
    ctx.restore();
    return ok;
  }
  return false;
}
