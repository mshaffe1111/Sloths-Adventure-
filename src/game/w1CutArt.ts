/**
 * The art director's World 1 cuts that gen2 1-1 stands on (W1-ART-AUDIT §3.2-3.5, reference/art/cut/INTEGRATE-1-1.md; packed by
 * tools/art/packcut.py into src/assets/w1to4art/w1-cut.webp): four kinds of stone, the wide stump and the tall post, the planks. Each is
 * drawn with its footing line (the drawn top a foot stands on) on the platform's top:
 *   - a stone or stump stands on the ground (rocks never float, LABELS rule 1): scaled so its footing is the platform's top and its foot
 *     the platform's foot, sunk 3 px as the kit's stand() does, its stand span centred over the platform;
 *   - a plank floats where it is (Matt, 11-06: walked-on logs may float with nothing under them): scaled so its stand span is the
 *     platform's width.
 * w1Finish (gen2/worlds/w1.ts) picks each platform's piece (Platform.cut); nothing is drawn in a piece's place until the sheet has
 * loaded (stagePreload.ts decodes it first: stageManifest.ts 'w1-cut'), and terrain.ts draws none of them (protoArt.ts paintedPlatforms).
 */
import { trackAtlas } from './atlasLoader.ts';
import type { Platform } from './types.ts';
import FRAMES from '../assets/w1to4art/w1-cut.json';

type Cut = { kind: 'stone' | 'stump' | 'perch' | 'log'; x: number; y: number; w: number; h: number; fy: number; fx0: number; fx1: number };
export const W1_CUT: Record<string, Cut> = FRAMES as Record<string, Cut>;
export const W1_CUT_URL = new URL('../assets/w1to4art/w1-cut.webp', import.meta.url).href;
let img: HTMLImageElement | null = null;
let ready = false;
export function w1CutReady(): boolean {
  if (!img && typeof Image !== 'undefined') {
    const im = new Image();
    img = im;
    trackAtlas(im, W1_CUT_URL, () => { ready = true; }, () => { img = null; }, () => { img = null; ready = false; });
  }
  return ready && !!img;
}

const SINK = 3;
/** where a piece is drawn for a platform (game px): its frame's box */
export function cutBox(p: Pick<Platform, 'x' | 'y' | 'width' | 'height'>, c: Cut): { x: number; y: number; w: number; h: number } {
  const s = c.kind === 'log' ? p.width / Math.max(1, c.fx1 - c.fx0) : (p.height + SINK) / Math.max(1, c.h - c.fy);
  const cx = c.kind === 'log' ? p.x - c.fx0 * s : p.x + p.width / 2 - ((c.fx0 + c.fx1) / 2) * s;
  return { x: cx, y: p.y - c.fy * s, w: c.w * s, h: c.h * s };
}

/** a platform's piece: of the kind it is, the one whose stand span best fits its width once drawn at its height (ties by its id) */
export function pickCut(p: Pick<Platform, 'id' | 'x' | 'y' | 'width' | 'height' | 'style'>): string | undefined {
  const kind: Cut['kind'] | null = p.style === 'log' && p.height < 50 && p.width <= 420 ? 'log'
    : p.style === 'moss_stone' && p.height >= 30 && p.height <= 140 && p.width <= 260 ? (p.height > 90 && p.width < 150 ? 'stump' : 'stone') : null;
  if (!kind) return undefined;
  const fits = Object.entries(W1_CUT).filter(([, c]) => c.kind === kind || (kind === 'stone' && c.kind === 'stump' && p.height > 70)).map(([n, c]) => {
    const b = cutBox(p, c);
    const span = ((c.fx1 - c.fx0) * b.w) / c.w;
    // (a log is drawn at its width; a stone at its height: how far its stand span is from the platform's width, and how wide it draws)
    return { n, miss: kind === 'log' ? Math.abs(b.h - 30) / 30 : Math.abs(span - p.width) / p.width + Math.max(0, b.w - p.width * 1.6) / p.width };
  }).sort((a, b) => a.miss - b.miss);
  if (!fits.length) return undefined;
  const best = fits.filter((f) => f.miss <= fits[0].miss + 0.25).slice(0, 3);
  return best[Math.abs(p.id * 2654435761) % best.length].n;
}

/** draws a platform's cut piece; false until the sheet is ready (nothing drawn in its place) */
export function drawCutArt(ctx: CanvasRenderingContext2D, p: Platform): boolean {
  const c = p.cut ? W1_CUT[p.cut] : undefined;
  if (!c || !w1CutReady() || !img) return false;
  const b = cutBox(p, c);
  ctx.drawImage(img, c.x, c.y, c.w, c.h, b.x, b.y, b.w, b.h);
  return true;
}
