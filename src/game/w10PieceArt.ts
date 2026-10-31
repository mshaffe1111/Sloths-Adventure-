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
import { drawW10Bag } from './w10BagArt.ts';

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
/** start loading every sheet (stagePreload 'w10') */
export function w10PiecesReady(): boolean {
  return (Object.keys(URLS) as Sheet[]).map((n) => !!sheet(n)).every(Boolean);
}

/** a grab-bag piece in its painting (false: not one of them, or its sheet is still loading) */
export function drawW10PieceArt(ctx: CanvasRenderingContext2D, p: Platform, t = 0): boolean {
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
  ctx.drawImage(img, L.x, L.y, L.w, L.h, p.x - L.x0 * s, p.y - L.top * s, L.w * s, L.h * s);
  return true;
}
