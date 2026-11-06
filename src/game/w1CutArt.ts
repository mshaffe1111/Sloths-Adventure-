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
/** the most a stone is stretched one way more than the other (a flat ledge drawn with a round boulder: wider, never squashed flat) */
export const MAX_STRETCH = 1.5;
/**
 * Where a piece is drawn for a platform (game px): its frame's box, and how much of the frame shows (`srcH`, frame px from its top).
 *   - a plank: scaled so its stand span is the platform's width;
 *   - a stone or stump (the lead, 11-06: "stand span = their footing span"): its stand span IS the platform's width, so he never stands
 *     on air beside a rock; its footing on the platform's top; scaled up or down evenly, stretched no more than MAX_STRETCH, deep enough
 *     to reach the ground, and whatever reaches deeper than its foot (3 px into the ground) is left out: the rock sits sunk in the earth.
 */
export function cutBox(p: Pick<Platform, 'x' | 'y' | 'width' | 'height'>, c: Cut): { x: number; y: number; w: number; h: number; sx: number; sy: number; srcH: number } {
  const span = Math.max(1, c.fx1 - c.fx0);
  if (c.kind === 'log') {
    const k = p.width / span;
    return { x: p.x - c.fx0 * k, y: p.y - c.fy * k, w: c.w * k, h: c.h * k, sx: k, sy: k, srcH: c.h };
  }
  const sx = p.width / span;
  const reach = (p.height + SINK) / Math.max(1, c.h - c.fy);
  const sy = Math.min(sx * MAX_STRETCH, Math.max(reach, sx / MAX_STRETCH));
  const y = p.y - c.fy * sy;
  const foot = p.y + p.height + SINK;
  const srcH = Math.min(c.h, (foot - y) / sy);
  return { x: p.x - c.fx0 * sx, y, w: c.w * sx, h: srcH * sy, sx, sy, srcH };
}

/** how poorly a piece fits a platform: its stretch, how much of it is sunk out of sight, and (a stone too small to reach) the gap */
function stoneMiss(p: Pick<Platform, 'width' | 'height'>, c: Cut): number {
  const b = cutBox({ x: 0, y: 0, ...p }, c);
  const stretch = Math.abs(Math.log(b.sx / b.sy)) / Math.log(MAX_STRETCH);
  const sunk = 1 - b.srcH / c.h;
  const short = Math.max(0, p.height + SINK - (c.h - c.fy) * b.sy) / (p.height + SINK);
  return stretch * 0.6 + sunk + short * 4;
}

/**
 * The pieces gen2 1-1 lays, by what each is for (pickCut picks only from these; the art-use gate reads the names here). Not yet laid:
 * the two hollow hiding stumps (a hiding spot's, not a step's), the two log planks and the tall vine post (1-1 has no tall post on the
 * ground for it: every 120 px narrow piece is a dip's pocket)
 */
export const LAID: Readonly<Record<string, 'stone' | 'boulder' | 'stump' | 'plank'>> = {
  'w1-rock-slabs-low': 'stone',
  'w1-rock-slabs-stacked': 'stone',
  'w1-rock-slabs-stacked-big': 'stone',
  'w1-rock-block-big': 'stone',
  'w1-rock-root-block': 'stone',
  'w1-rock-roots': 'stone',
  'w1-rock-boulder-moss': 'boulder',
  'w1-rock-boulder-moss-big': 'boulder',
  'w1-boulder-grey-moss': 'boulder',
  'w1-boulder-grey-moss-b': 'boulder',
  'w1-stump-wide': 'stump',
  'w1-plank-ledge-a': 'plank',
  'w1-plank-ledge-b': 'plank',
  'w1-plank-ledge-c': 'plank',
};

/** a plank longer than this is laid as several pieces end to end (the end log, 686 px: one piece stretched that long drew 3x too thick) */
export const PLANK_MAX = 360;
/** how many pieces a plank this long is laid as */
export const logParts = (width: number): number => Math.max(1, Math.ceil(width / PLANK_MAX));
/** the i-th piece's share of a long plank (each the same length, a few px over the next so no seam shows) */
export function logPart<P extends Pick<Platform, 'x' | 'y' | 'width' | 'height'>>(p: P, i: number): P {
  const n = logParts(p.width), w = p.width / n;
  return { ...p, x: p.x + i * w - (i ? 4 : 0), width: w + (i ? 4 : 0) };
}
/** the piece each part of a long plank uses: the picked one, then the other plank cuts in turn, so the end log is not one piece repeated */
function partCut(first: string, i: number): string {
  if (!i) return first;
  const logs = Object.keys(LAID).filter((n) => LAID[n] === 'plank');
  const at = Math.max(0, logs.indexOf(first));
  return logs[(at + i) % logs.length] ?? first;
}

/** a platform's piece: of the kind it is, one of those that fit it about as well as the best (ties by its id) */
export function pickCut(p: Pick<Platform, 'id' | 'x' | 'y' | 'width' | 'height' | 'style'>): string | undefined {
  const kind: Cut['kind'] | null = p.style === 'log' && p.height < 50 ? 'log'
    : p.style === 'moss_stone' && p.height >= 30 && p.height <= 140 && p.width <= 260 ? (p.height > 90 && p.width < 150 ? 'stump' : 'stone') : null;
  if (!kind) return undefined;
  const fits = Object.entries(W1_CUT).filter(([n]) => n in LAID).filter(([, c]) => c.kind === kind || (kind === 'stone' && c.kind === 'stump' && p.height > 70)).map(([n, c]) => {
    // (a log is drawn at its width: how far its height is from a plank's 30 px; a stone by stoneMiss)
    return { n, miss: kind === 'log' ? Math.abs(cutBox(logPart(p, 0), c).h - 30) / 30 : stoneMiss(p, c) };
  }).sort((a, b) => a.miss - b.miss);
  if (!fits.length) return undefined;
  // (every piece that fits about as well as the best takes its turn, the round and grey boulders too: the lead, 11-06, "at least 6 kinds
  // a roll"; a top-three the flat slabs and blocks always filled had cut them off)
  const best = kind === 'log' ? fits.filter((f) => f.miss <= fits[0].miss + 0.25).slice(0, 3) : fits.filter((f) => f.miss <= fits[0].miss + 0.2);
  return best[Math.abs(p.id * 2654435761) % best.length].n;
}

/** draws a platform's cut piece; false until the sheet is ready (nothing drawn in its place) */
export function drawCutArt(ctx: CanvasRenderingContext2D, p: Platform): boolean {
  const c = p.cut ? W1_CUT[p.cut] : undefined;
  if (!c || !w1CutReady() || !img) return false;
  // (a long plank: its pieces end to end, the art director's ledges in turn)
  const n = c.kind === 'log' ? logParts(p.width) : 1;
  for (let i = 0; i < n; i++) {
    const cc = n > 1 ? W1_CUT[partCut(p.cut!, i)] : c;
    const b = cutBox(n > 1 ? logPart(p, i) : p, cc);
    // (only the part above its foot: the rest is in the ground)
    ctx.drawImage(img, cc.x, cc.y, cc.w, b.srcH, b.x, b.y, b.w, b.h);
  }
  return true;
}
