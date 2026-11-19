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

type Cut = { kind: 'stone' | 'stump' | 'perch' | 'log'; x: number; y: number; w: number; h: number; fy: number; fx0: number; fx1: number; fb?: number };
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
  if (c.kind === 'log' && !THICK_CUTS.has(c)) {
    const k = p.width / span;
    return { x: p.x - c.fx0 * k, y: p.y - c.fy * k, w: c.w * k, h: c.h * k, sx: k, sy: k, srcH: c.h };
  }
  const sx = p.width / span;
  // (a thick log, PAINT-292: like a stone, its top on the platform's top and its body down to the foot, sunk SINK; it reaches by `fb`, the
  //  row its levelled body reaches under most of its stand span, so its round underside is in the ground, never a gap of air under it)
  const reach = (p.height + SINK) / Math.max(1, (c.fb ?? c.h) - c.fy);
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
 * the two hollow hiding stumps (a hiding spot's, not a step's) and the tall vine post (1-1 has no tall post on the ground for it: every
 * 120 px narrow piece is a dip's pocket). The two thick log planks ('log', PAINT-292) are a 50-89 px log's: their tops levelled in the sheet
 * by tools/art/flattenlogs.py, so the painted top is the floor
 */
export const LAID: Readonly<Record<string, 'stone' | 'boulder' | 'stump' | 'plank' | 'log'>> = {
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
  'w1-log-plank-a': 'log',
  'w1-log-plank-b': 'log',
};
/** the thick log planks' frames (cutBox draws them as a stone is drawn: top on the top, body to the foot) */
const THICK_CUTS: ReadonlySet<Cut> = new Set(Object.keys(LAID).filter((n) => LAID[n] === 'log').map((n) => W1_CUT[n]));
/** the tallest log the thick planks are laid on: from 90 a log is a bank, the bank painter's (protoArt.ts) */
export const THICK_LOG_MAX = 89;
/** the widest stone a stone piece is laid on (PAINT-292: Easy widens 1-1's stones to 268, 1-6 lays 300; stoneMiss keeps its stretch in
 *  MAX_STRETCH). Over 260 only under BANK_FROM: from there the bank painter (protoArt.ts) already paints a wide stone, as before */
export const STONE_W_MAX = 400;
export const BANK_FROM = 90;

/** a plank longer than this is laid as several pieces end to end (the end log, 686 px: one piece stretched that long drew 3x too thick) */
export const PLANK_MAX = 360;
/** how many pieces a plank this long is laid as */
export const logParts = (width: number): number => Math.max(1, Math.ceil(width / PLANK_MAX));
/** the thick planks' mean stand span and reach (frame px), what a 50-89 px log's pieces are counted by */
const THICK = [...THICK_CUTS];
const THICK_SPAN = THICK.reduce((s, c) => s + c.fx1 - c.fx0, 0) / Math.max(1, THICK.length);
const THICK_REACH = THICK.reduce((s, c) => s + (c.fb ?? c.h) - c.fy, 0) / Math.max(1, THICK.length);
/** how many thick planks a 50-89 px log is laid as: each drawn at the scale its height needs, as near its own length as whole pieces allow
 *  (one rhythm along the block: every piece the same length, never one stretched long beside one squeezed) */
export const thickParts = (p: Pick<Platform, 'width' | 'height'>): number =>
  Math.max(1, Math.round(p.width / (THICK_SPAN * (p.height + SINK) / THICK_REACH)));
/** how many pieces a log's cut is drawn as */
export const partsOf = (p: Pick<Platform, 'width' | 'height'>, c: Cut): number => (THICK_CUTS.has(c) ? thickParts(p) : logParts(p.width));
/** the i-th piece's share of a long plank (each the same length; a thin plank's a few px over the next so no seam shows, a thick one's
 *  ends overlap by their own ragged tips, drawCutArt) */
export function logPart<P extends Pick<Platform, 'x' | 'y' | 'width' | 'height'>>(p: P, i: number, n = logParts(p.width), seam = 4): P {
  const w = p.width / n;
  return { ...p, x: p.x + i * w - (i ? seam : 0), width: w + (i ? seam : 0) };
}
/** the piece each part of a long plank uses: the picked one, then the other plank cuts of its class in turn, so the end log is not one
 *  piece repeated */
function partCut(first: string, i: number): string {
  if (!i) return first;
  const logs = Object.keys(LAID).filter((n) => LAID[n] === LAID[first]);
  const at = Math.max(0, logs.indexOf(first));
  return logs[(at + i) % logs.length] ?? first;
}

/** a platform's piece: of the kind it is, one of those that fit it about as well as the best (ties by its id) */
export function pickCut(p: Pick<Platform, 'id' | 'x' | 'y' | 'width' | 'height' | 'style'>): string | undefined {
  const kind: Cut['kind'] | null = p.style === 'log' && p.height <= THICK_LOG_MAX ? 'log'
    : p.style === 'moss_stone' && p.height >= 30 && p.height <= 140 && (p.width <= 260 || (p.width <= STONE_W_MAX && p.height < BANK_FROM)) ? (p.height > 90 && p.width < 150 ? 'stump' : 'stone') : null;
  if (!kind) return undefined;
  // (a log under 50 px is a thin plank's, the ledges; 50-89 a thick plank's, PAINT-292: the thin ledges drawn that tall were 3x too thick)
  const thick = kind === 'log' && p.height >= 50;
  const fits = Object.entries(W1_CUT).filter(([n]) => n in LAID && (kind !== 'log' || (LAID[n] === 'log') === thick)).filter(([, c]) => c.kind === kind || (kind === 'stone' && c.kind === 'stump' && p.height > 70)).map(([n, c]) => {
    // (a thin log is drawn at its width: how far its height is from a plank's 30 px; a thick one or a stone by stoneMiss)
    return { n, miss: kind === 'log' && !thick ? Math.abs(cutBox(logPart(p, 0), c).h - 30) / 30 : stoneMiss(thick ? logPart(p, 0, thickParts(p), 0) : p, c) };
  }).sort((a, b) => a.miss - b.miss);
  if (!fits.length) return undefined;
  // (every piece that fits about as well as the best takes its turn, the round and grey boulders too: the lead, 11-06, "at least 6 kinds
  // a roll"; a top-three the flat slabs and blocks always filled had cut them off)
  const best = kind === 'log' && !thick ? fits.filter((f) => f.miss <= fits[0].miss + 0.25).slice(0, 3) : fits.filter((f) => f.miss <= fits[0].miss + 0.2);
  return best[Math.abs(p.id * 2654435761) % best.length].n;
}
/** a stone's piece as World 1 draws it: the one the lay settled on its ground (Platform.cut, settleCut), else pickCut's; none when the lay
 *  said none (cut '': no piece keeps it on its ground once a chase is laid, so it is drawn as its ground, pipeline.ts settleLaid) */
export function cutOf(p: Pick<Platform, 'id' | 'x' | 'y' | 'width' | 'height' | 'style' | 'cut'>): string | undefined {
  if (p.cut === '') return undefined;
  return p.cut && W1_CUT[p.cut] ? p.cut : pickCut(p);
}

/** the most a stone's or stump's drawn piece may reach past the edge of the ground it stands on (R-165.226: Matt's frame, a boulder drawn
 *  ~100 px out over a dip) */
export const OVERHANG_MAX = 6;
type Solid = Pick<Platform, 'x' | 'y' | 'width' | 'height' | 'type'> & { broken?: boolean; chase?: boolean };
/** the ground a stone stands on: the run of solid tops level with its foot (within 3 px), joined end to end, that its middle is over, and
 *  on over a bank that rises where it ends;
 *  undefined when nothing is under its middle (a plank's, or a stone that floats) */
export function groundRun(p: Pick<Platform, 'x' | 'y' | 'width' | 'height'>, solids: readonly Solid[]): [number, number] | undefined {
  const foot = p.y + p.height;
  const level = solids.filter((q) => q !== p && q.type === 'solid' && !q.broken && Math.abs(q.y - foot) <= 3);
  const mid = p.x + p.width / 2;
  if (!level.some((q) => q.x <= mid && q.x + q.width >= mid)) return undefined;
  let x0 = mid, x1 = mid;
  for (let grew = true; grew;) {
    grew = false;
    for (const q of level) if (q.x < x0 && q.x + q.width >= x0 - 1) { x0 = q.x; grew = true; }
    for (const q of level) if (q.x + q.width > x1 && q.x <= x1 + 1) { x1 = q.x + q.width; grew = true; }
  }
  // (an end where the ground RISES is no lip: a bank higher than his foot that meets the run there. A stone's piece drawn past it is drawn
  //  in front of that bank's earth, a rock against a bank, never over air (1-2 seed 81's step between two banks); the run goes on over it.
  //  A bank the chase breaks is no bank: its section falls and the piece hangs over the hole, ENG-LOOK2 (1c), 1-8's 23 stones)
  const wall = (x: number) => solids.find((q) => q !== p && q.type === 'solid' && !q.broken && !q.chase && q.y < foot - 3 && q.y + q.height > foot + 3 && q.x <= x + 1 && q.x + q.width >= x - 1);
  const wl = wall(x0), wr = wall(x1);
  return [wl ? Math.min(x0, wl.x) : x0, wr ? Math.max(x1, wr.x + wr.width) : x1];
}
/** how far a piece's drawn box reaches past its ground run, the worse side (px; 0 when it is on its ground) */
export function overhang(p: Pick<Platform, 'x' | 'y' | 'width' | 'height'>, cut: string, run: readonly [number, number]): number {
  const b = cutBox(p, W1_CUT[cut]);
  return Math.max(0, run[0] - b.x, b.x + b.w - run[1]);
}
/**
 * A stone or stump on the ground, drawn on its ground (R-165.226, the lead's rule 11-14: "the generator keeps a stone back from a lip by its
 * piece's art margin"): its piece, and how far its collider moves (dx) so that piece is drawn no more than OVERHANG_MAX past its ground run.
 * Of the pieces that fit it about as well as the best (pickCut's own band, then any of its kind), the one that needs the least move, the
 * picked one first; the move never puts it into another piece. Undefined when nothing needs doing (no piece, no ground, already on it);
 * `dx` NaN when no piece and no move keeps it on its ground (the roll is refused by name, the World 1 kit's settle).
 * (w1-rock-roots is never a stand-in: its art rises ~52 px over where he stands, POLISH-5's tried swap drew a wall behind him)
 */
export function settleCut(p: Pick<Platform, 'id' | 'x' | 'y' | 'width' | 'height' | 'style' | 'cut'>, solids: readonly Solid[]): { cut: string; dx: number } | undefined {
  // (the piece it was laid with first, when it has one: a second settle (pipeline.ts settleLaid) keeps every piece still on its ground)
  const picked = p.cut === '' ? undefined : cutOf(p);
  if (!picked || W1_CUT[picked].kind === 'log') return undefined;
  const run = groundRun(p, solids);
  if (!run) return undefined;
  if (overhang(p, picked, run) <= OVERHANG_MAX) return { cut: picked, dx: 0 };
  const foot = p.y + p.height;
  // (the move a piece needs: its box inside the run, OVERHANG_MAX each side; NaN if the box is wider than the run allows, or the move hits
  //  another piece standing on the same ground or hanging over it)
  const move = (cut: string): number => {
    const b = cutBox(p, W1_CUT[cut]);
    const lo = run[0] - OVERHANG_MAX, hi = run[1] + OVERHANG_MAX;
    if (b.w > hi - lo) return NaN;
    // (whole px, rounded inward: the stage's own x stay as they were laid, and the piece ends inside the limit)
    const dx = b.x < lo ? Math.ceil(lo - b.x) : b.x + b.w > hi ? Math.floor(hi - (b.x + b.w)) : 0;
    const nx = p.x + dx;
    if (dx && solids.some((q) => (q as unknown) !== p && q.type === 'solid' && !q.broken && q.x < nx + p.width && q.x + q.width > nx && q.y < foot - 3 && q.y + q.height > p.y)) return NaN;
    return dx;
  };
  const kinds = (c: Cut) => c.kind === W1_CUT[picked].kind || (c.kind === 'stump' && W1_CUT[picked].kind === 'stone' && p.height > 70);
  const all = Object.entries(W1_CUT).filter(([n, c]) => n in LAID && n !== 'w1-rock-roots' && kinds(c)).map(([n, c]) => ({ n, miss: stoneMiss(p, c) })).sort((a, b) => a.miss - b.miss || (a.n < b.n ? -1 : 1));
  const band = all.filter((f) => f.miss <= Math.min(stoneMiss(p, W1_CUT[picked]), all[0]?.miss ?? Infinity) + 0.2);
  // (the least move in pool order; the first that needs none ends the look: no later piece beats it)
  for (const pool of [[{ n: picked }, ...band], all]) {
    let best: { n: string; dx: number } | undefined;
    for (const f of pool) {
      const dx = move(f.n);
      if (Number.isNaN(dx) || (best && Math.abs(dx) >= Math.abs(best.dx))) continue;
      best = { n: f.n, dx };
      if (!dx) break;
    }
    if (best) return { cut: best.n, dx: best.dx };
  }
  return { cut: picked, dx: NaN };
}

/** the gate's reading (R-165.226; w1Overhang.test.ts on every World 1 stage, every listed layout, both settings): each stone or stump drawn
 *  more than OVERHANG_MAX past the ground it stands on, read off the finished stage by the same cutBox the screen draws with */
export function overhangs(platforms: readonly (Solid & Pick<Platform, 'id' | 'cut'>)[]): Array<{ id: number; cut: string; x: number; over: number }> {
  return platforms.flatMap((p) => {
    const c = p.cut ? W1_CUT[p.cut] : undefined;
    if (!c || c.kind === 'log' || p.type !== 'solid' || p.broken) return [];
    const run = groundRun(p, platforms);
    const over = run ? overhang(p, p.cut!, run) : Infinity;
    return over > OVERHANG_MAX ? [{ id: p.id, cut: p.cut!, x: Math.round(p.x), over: Math.round(over) }] : [];
  });
}

/** draws a platform's cut piece; false until the sheet is ready (nothing drawn in its place) */
export function drawCutArt(ctx: CanvasRenderingContext2D, p: Platform): boolean {
  const c = p.cut ? W1_CUT[p.cut] : undefined;
  if (!c || !w1CutReady() || !img) return false;
  // (a long plank: its pieces end to end, the art director's ledges in turn. A thick one's are drawn right to left, each the same length,
  //  so every piece's own rounded right end lies in front of the next one's start: one pile of logs, its top one level line, PAINT-292)
  const thick = THICK_CUTS.has(c);
  const n = c.kind === 'log' ? partsOf(p, c) : 1;
  for (let j = 0; j < n; j++) {
    const i = thick ? n - 1 - j : j;
    const cc = n > 1 ? W1_CUT[partCut(p.cut!, i)] : c;
    const b = cutBox(n > 1 ? (thick ? logPart(p, i, n, 0) : logPart(p, i)) : p, cc);
    // (only the part above its foot: the rest is in the ground)
    ctx.drawImage(img, cc.x, cc.y, cc.w, b.srcH, b.x, b.y, b.w, b.h);
  }
  return true;
}
