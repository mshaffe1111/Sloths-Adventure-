/**
 * World 1's new painted pieces (the W1-4 art rounds, src/assets/w1to4art/w1-new.webp, cut 2026-11-01 and never drawn until now: the
 * designer's ENGINE-SPEC, 11-05): the squirrels who watch Pokey leave at 1-1's start, the hollow logs, the root gates, the knots, the
 * acorn slope, the mossy shut log and the vine rope.
 *
 *   - dressing a stage lays (protoStage.ts ProtoExtras.mixDress: a frame name, its centre x and the ground it stands on), drawn behind
 *     Pokey (engine.ts);
 *   - a hollow log (types.ts Platform.hollow): its platform is the shell's top, the painted log hanging from it to the floor, its inside
 *     clear to walk through (hollowLogSize); drawn by protoArt.ts drawProtoScene, and over Pokey while he is inside (engine.ts).
 *
 * Every draw returns false until the sheet has loaded (stagePreload.ts decodes it first on a stage that asks for it: stageSheets.ts
 * 'w1-new'); nothing is ever drawn in its place.
 */
import { trackAtlas } from './atlasLoader.ts';
import type { Platform } from './types.ts';
import FRAMES from '../assets/w1to4art/w1-new.json';

/** the sheet's cells: the cutter's own list, read as it is (one source: the art-use gate counts its pieces there) */
export const W1_NEW_FRAMES = FRAMES;
export type W1NewPiece = keyof typeof FRAMES;
const F: Record<string, { x: number; y: number; w: number; h: number }> = W1_NEW_FRAMES;

/** the sheet's address (stagePreload.ts decodes it before a stage that asks for it starts) */
export const W1_NEW_URL = new URL('../assets/w1to4art/w1-new.webp', import.meta.url).href;
let img: HTMLImageElement | null = null;
let ready = false;
function load() {
  if (img || typeof Image === 'undefined') return;
  const im = new Image();
  img = im;
  trackAtlas(im, W1_NEW_URL, () => { ready = true; }, () => { img = null; }, () => { img = null; ready = false; });
}
/** whether the sheet has loaded (starts the load) */
export function w1NewReady(): boolean {
  load();
  return ready && !!img;
}
/** whether the sheet has a piece by this name (the bootprint, the 1-1 clue, is its own picture: drawW1Clue) */
export const hasW1New = (n: string): n is W1NewPiece => n in F;

/**
 * 1-1's clue (R-165.31): the soldier's bootprint, a flush decal toe east (src/assets/props/w1-bootprint.webp, 300x74, painted on
 * Hugging Face from World 1's bank art: art-bootprint f57eac784). It lies in the moss of the end log's top, drawn 110x28 game px (the art helper's remake, art-1-1-sunrise-2 fd69a508e, picked by the lead 11-05) with
 * its top edge on the log's top line, behind Pokey and under the HUD (engine.ts draws it with the stage's dressing). Only a stage that
 * reports a clue place lays it (proto.mixDress, the name CLUE_NAME); it loads with the w1-new sheet (stagePreload.ts).
 */
export const CLUE_NAME = 'bootprint';
export const W1_CLUE_URL = new URL('../assets/props/w1-bootprint.webp', import.meta.url).href;
export const CLUE_W = 110, CLUE_H = 28;
let clueImg: HTMLImageElement | null = null;
let clueReady = false;
export function w1ClueReady(): boolean {
  if (!clueImg && typeof Image !== 'undefined') {
    const im = new Image();
    clueImg = im;
    trackAtlas(im, W1_CLUE_URL, () => { clueReady = true; }, () => { clueImg = null; }, () => { clueImg = null; clueReady = false; });
  }
  return clueReady && !!clueImg;
}
/** where the decal lies for a clue place (its centre x and the landing's top): flush in the moss, its top edge on the top line */
export const cluePlace = (cx: number, top: number) => ({ x: cx - CLUE_W / 2, y: top, w: CLUE_W, h: CLUE_H });
/** the bootprint at its place; false (nothing drawn, never a stand-in) until the picture has loaded */
export function drawW1Clue(ctx: CanvasRenderingContext2D, cx: number, top: number): boolean {
  if (!w1ClueReady()) return false;
  const r = cluePlace(cx, top);
  ctx.drawImage(clueImg!, r.x, r.y, r.w, r.h);
  return true;
}

/** how tall each kind of dressing stands (world px): a squirrel a little under Pokey's height (about 70), the gates and knots their own */
const DRESS_H: Record<string, number> = { squirrel: 62, 'root-gate': 120, knot: 70, 'acorn-slope': 80, 'log-hide': 90 };
const dressH = (n: string) => DRESS_H[Object.keys(DRESS_H).find((k) => n.startsWith(k)) ?? ''] ?? 70;
/** the share of each picture's height under its feet that is transparent margin (measured from the sheet's alpha: the squirrels' feet
 *  are 9 px over the cell's bottom of 420) */
const FOOT = 0.02;

/** piece `n` filling the box (x, y, w, h); `flip` mirrors it */
function blit(ctx: CanvasRenderingContext2D, n: string, x: number, y: number, w: number, h: number, flip = false) {
  const f = F[n];
  if (!flip) {
    ctx.drawImage(img!, f.x, f.y, f.w, f.h, x, y, w, h);
    return;
  }
  ctx.save();
  ctx.translate(x + w, y);
  ctx.scale(-1, 1);
  ctx.drawImage(img!, f.x, f.y, f.w, f.h, 0, 0, w, h);
  ctx.restore();
}

/** how wide a piece of dressing draws (world px), at its drawn height: what a layout keeps clear around it */
export function w1DressWidth(n: string): number {
  const f = F[n];
  return f ? (dressH(n) * f.w) / f.h : 0;
}
/** which way a picture faces as painted (read off the sheet, 11-05): the sitting and waving squirrels face the viewer; the tipping,
 *  hauling and running ones face right. A layout flips a right-facing one to face left */
export function w1DressFacing(n: string): 'front' | 'right' {
  return /^squirrel-(tip|haul|run)$/.test(n) ? 'right' : 'front';
}

/** a piece of dressing standing on the ground at `bottom`, centred on `cx`; `flip` faces it the other way. False if it has no picture
 *  or the sheet is loading */
export function drawW1Dress(ctx: CanvasRenderingContext2D, n: string, cx: number, bottom: number, flip = false): boolean {
  if (!hasW1New(n) || !w1NewReady()) return false;
  const f = F[n];
  const h = dressH(n), w = (h * f.w) / f.h;
  blit(ctx, n, cx - w / 2, bottom - h * (1 - FOOT), w, h, flip);
  return true;
}

/** where the hollow logs' walkable top and the bark's bottom sit, as shares of the picture's height (measured from the sheet's alpha
 *  down the middle: under the bark is transparent margin) */
const HOLLOW_TOP: Record<'moss' | 'plain', number> = { moss: 24 / 218, plain: 12 / 192 };
const HOLLOW_BOT: Record<'moss' | 'plain', number> = { moss: 206 / 218, plain: 181 / 192 };
/** how far the bark's belly sits down into the floor's grass, so it rests on the ground, never over it (the designer, 11-05) */
const HOLLOW_SINK = 6;
/** how far the picture is drawn wider than the platform */
const HOLLOW_GROW = 1.06;
/**
 * A hollow log is two roads (the designer, 11-05): its top to run along, and its inside to walk through on the floor. Its platform is
 * only the shell's top, HOLLOW_SHELL thick; the painted log hangs from it down to the floor it rests on, `height` under its top, and
 * the inside is clear from the shell's underside to the floor (`clearance`; Pokey is 48 tall, so 56 or more walks him through standing).
 * The builder lays the platform at y = floor - height, HOLLOW_SHELL tall: then the top is `height` over the floor, the split's two roads.
 *   seated on the floor (its bark's belly HOLLOW_SINK into the grass): moss 310 wide 128 high (104 clear), 380 wide 158 (134);
 *   plain 310 wide 123 (99), 380 wide 152 (128). The split's 120 px rule passes at 310 wide or more for either.
 */
export const HOLLOW_SHELL = 24;
export function hollowLogSize(kind: 'moss' | 'plain', width: number): { height: number; clearance: number } {
  const f = F[kind === 'moss' ? 'hollowlog-moss' : 'hollowlog-plain'];
  const h = (width * HOLLOW_GROW * f.h) / f.w;
  const height = Math.round(h * (HOLLOW_BOT[kind] - HOLLOW_TOP[kind]) - HOLLOW_SINK);
  return { height, clearance: height - HOLLOW_SHELL };
}
/** is Pokey (x his left edge, y his feet) walking through the log, under its shell, between its ends */
export function insideHollow(p: Platform, who: { x: number; y: number; width: number }): boolean {
  if (!p.hollow) return false;
  const cx = who.x + who.width / 2;
  const { height } = hollowLogSize(p.hollow, p.width);
  return cx > p.x && cx < p.x + p.width && who.y > p.y + HOLLOW_SHELL && who.y <= p.y + height + 6;
}
/** a hollow log platform, drawn as Matt's painted hollow log: a little wider than its box, its top where he stands, its mouth to the left
 *  (flipped every other piece, by id); `alpha` for the copy over him while he walks through it */
export function drawHollowLog(ctx: CanvasRenderingContext2D, p: Platform, alpha = 1): boolean {
  const kind = p.hollow;
  if (!kind || !w1NewReady()) return false;
  const n = kind === 'moss' ? 'hollowlog-moss' : 'hollowlog-plain';
  const f = F[n];
  const w = p.width * HOLLOW_GROW, h = (w * f.h) / f.w;
  const x0 = p.x + p.width / 2 - w / 2, y0 = p.y - h * HOLLOW_TOP[kind], mid = p.x + p.width / 2;
  ctx.save();
  if (alpha < 1) ctx.globalAlpha = alpha;
  else {
    // (its contact shadow on the floor, soft, under its belly: a small code touch, STAGE-RULES §4)
    const floor = p.y + hollowLogSize(kind, p.width).height;
    ctx.fillStyle = 'rgba(20, 24, 10, 0.32)';
    ctx.beginPath();
    ctx.ellipse(mid, floor - 1, w * 0.46, 7, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // (open at both ends, so it reads as a way through: the painted log's open half each side, mirrored about its middle, as one log)
  ctx.beginPath();
  ctx.rect(x0 - 2, y0 - 2, mid - x0 + 2, h + 4);
  ctx.clip();
  blit(ctx, n, x0, y0, w, h, false);
  ctx.restore();
  ctx.save();
  if (alpha < 1) ctx.globalAlpha = alpha;
  ctx.beginPath();
  ctx.rect(mid, y0 - 2, x0 + w - mid + 2, h + 4);
  ctx.clip();
  blit(ctx, n, x0, y0, w, h, true);
  ctx.restore();
  return true;
}

/**
 * The lily pads a stage lays that are not on water (Matt, 11-05: "lily pads only on water"): a pad is on water when its middle is over a
 * water zone the stage declares (proto.water) or a river, with the surface within 40 px of its top. The tests hold every built stage to
 * none, and the mixer's element gate can ask the same.
 */
export function padsOffWater(platforms: readonly Platform[], water: ReadonlyArray<{ x0: number; x1: number; y: number }> = [], rivers: ReadonlyArray<{ x0: number; x1: number; surfaceY: number }> = []): Platform[] {
  return platforms.filter((p) => {
    if (!p.lily) return false;
    const cx = p.x + p.width / 2, top = p.y + 8;
    return !water.some((z) => cx >= z.x0 && cx <= z.x1 && Math.abs(z.y - top) < 40) && !rivers.some((r) => cx >= r.x0 && cx <= r.x1 && Math.abs(r.surfaceY - top) < 40);
  });
}

/** bank dressing (artDress.ts pieces: a name, its centre x and the ground it stands on) less what stands where a hollow log lies, its
 *  width and 40 px either side, on its floor: a stump or a fallen log there drew over the log's body and in its mouths */
export function clearOfHollowLogs<T extends { x: number; b: number }>(dress: T[], platforms: readonly Platform[]): T[] {
  const logs = platforms.filter((p) => p.hollow).map((p) => ({ x0: p.x - 40, x1: p.x + p.width + 40, floor: p.y + hollowLogSize(p.hollow!, p.width).height }));
  return dress.filter((d) => !logs.some((l) => d.x > l.x0 && d.x < l.x1 && Math.abs(d.b - l.floor) < 40));
}

/**
 * Pieces sunk under a stage's drawn water (Matt, 11-05: "Why are logs underwater? What other than clutter does that provide?"): a solid
 * piece whose middle is over a zone and whose top is under its surface. Nothing stands there: a stone or a stump rises out of the water
 * (its top over the surface), a lily pad floats on it, and a catch branch under a gap has no place in a creek. Held to none by the tests.
 */
export function piecesUnderWater(platforms: readonly Platform[], water: ReadonlyArray<{ x0: number; x1: number; y: number }> = []): Platform[] {
  return platforms.filter((p) => {
    if (p.lily || p.broken) return false;
    const cx = p.x + p.width / 2;
    return water.some((z) => cx > z.x0 && cx < z.x1 && p.y > z.y + 2);
  });
}
