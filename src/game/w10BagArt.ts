/**
 * w10BagArt — World 10's grab-bag sheet (Hugging Face, hfb-w10bag-r1, 2026-10-31; tools/art/w10/bagcut.py): src/assets/w10/bag.webp.
 *   pulley, weight        the chain lifts' and counterweight planks' wheel and iron counterweight (GRAB-BAG A, B; 10-8's lift)
 *   cog, rack             the gear lift's great cog and its stone block on a toothed rack (C; 10-8's gears)
 *   gatehouse             the drop gate's stone gatehouse with battlements (D, w10DropArt.ts)
 *   grate                 the trapdoor grate swung open (F; shut is w10var 'branch-b')
 *   barrel, barrel-tip    the rolling barrels (K)
 *   winch, winch-jam      the Winch House's winch (10-7's second room)
 *   beam-1, beam-2        the lantern sweep's light (L: drawn additively)
 *   gush-1..3             the gutter spout's gush (E; the spout itself is w10alt 'spout-b')
 * Every frame's anchor is the middle of its foot (beams: the lantern's point). Generated data: re-run bagcut.py, do not edit.
 */
import { trackAtlas } from './atlasLoader.ts';

export interface W10BagFrame { x: number; y: number; w: number; h: number; ax: number; ay: number }
export const W10_BAG_FRAMES = {"pulley": {"x": 0, "y": 0, "w": 353, "h": 438, "ax": 176.5, "ay": 438}, "weight": {"x": 357, "y": 0, "w": 248, "h": 443, "ax": 124.0, "ay": 443}, "cog": {"x": 609, "y": 0, "w": 442, "h": 439, "ax": 221.0, "ay": 439}, "rack": {"x": 1055, "y": 0, "w": 339, "h": 502, "ax": 169.5, "ay": 502}, "gatehouse": {"x": 1398, "y": 0, "w": 311, "h": 417, "ax": 155.5, "ay": 417}, "grate": {"x": 1713, "y": 0, "w": 199, "h": 364, "ax": 99.5, "ay": 364}, "barrel": {"x": 0, "y": 506, "w": 198, "h": 145, "ax": 99.0, "ay": 145}, "barrel-tip": {"x": 202, "y": 506, "w": 212, "h": 193, "ax": 106.0, "ay": 193}, "winch": {"x": 418, "y": 506, "w": 372, "h": 388, "ax": 186.0, "ay": 388}, "winch-jam": {"x": 794, "y": 506, "w": 372, "h": 493, "ax": 186.0, "ay": 493}, "beam-1": {"x": 1170, "y": 506, "w": 296, "h": 426, "ax": 32.0, "ay": 0}, "beam-2": {"x": 1470, "y": 506, "w": 292, "h": 426, "ax": 31.6, "ay": 0}, "gush-1": {"x": 1766, "y": 506, "w": 211, "h": 494, "ax": 105.5, "ay": 494}, "gush-2": {"x": 0, "y": 1004, "w": 253, "h": 493, "ax": 126.5, "ay": 493}, "gush-3": {"x": 257, "y": 1004, "w": 213, "h": 494, "ax": 106.5, "ay": 494}} as const satisfies Record<string, W10BagFrame>;
export type W10BagName = keyof typeof W10_BAG_FRAMES;
const URL_ = new URL('../assets/w10/bag.webp', import.meta.url).href;
export const W10_BAG_URLS: readonly string[] = [URL_];

let img: HTMLImageElement | null = null;
let ready = false;
function sheet(): HTMLImageElement | null {
  if (typeof Image === 'undefined') return null;
  if (!img) {
    const im = new Image();
    img = im;
    trackAtlas(im, URL_, () => (ready = true), () => (img = null), () => ((img = null), (ready = false)));
  }
  return ready ? img : null;
}
export const w10BagReady = (): boolean => !!sheet();

/** a frame `h` px tall with its anchor at (x, y); false until the sheet has loaded */
export function drawW10Bag(ctx: CanvasRenderingContext2D, n: W10BagName, x: number, y: number, h: number): boolean {
  const im = sheet();
  if (!im) return false;
  const f: W10BagFrame = W10_BAG_FRAMES[n];
  const s = h / f.h;
  ctx.drawImage(im, f.x, f.y, f.w, f.h, x - f.ax * s, y - f.ay * s, f.w * s, f.h * s);
  return true;
}
