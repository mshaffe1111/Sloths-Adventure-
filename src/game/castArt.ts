/**
 * castArt — how a stage's drop traps are drawn (castPlay.ts, dropTrap.ts): World 1's painted trap pieces (ART-W1, 2026-11-12;
 * src/assets/props/w1-traps.webp, w1TrapsData.ts, made by tools/art/w1traps/pack.py). The lead's picks: a bent SAPLING holds the load
 * under its crown, a painted bough end (the CLUMP) holds the handle, one painted VINE runs between them; the vine HANDLE is a knotted
 * loop at his raised hand (a limp snapped end once sprung), the TENDRIL handle runs taut, knotted round a living root hoop (the hoop
 * and the torn curl once cut: World 1 has no made things, no stake); the mossy stone hangs with vines wrapped round it and lands in
 * them; the hive is painted hive A (hanging with its dark doorway; landed on its side, whole: the lead's pick over Matt's sheet, which
 * read as a brown cocoon at phone size, ART-W1B), and a few of Matt's bees buzz out, circle the animal and drift off, away from Pokey.
 * Where the first sapling stands beyond the load, a second, smaller one stands behind the handle and the vine's corner hangs from its
 * crown (ART-W1B). Code only adds the small touches: the
 * handle's soft "hit me" ring and the bees' flight.
 *
 * Nothing floats: the sapling's foot is set on real ground (the stage's platforms), at a size that keeps its crown under the top of a
 * sideways phone (no more than 300 units tall) and hangs the load at its tested height; where no such spot exists, a second bough end
 * holds the load as W1C's stand-in did. The trap's boxes, timings and lay are W1C's and do not change here: this file only draws.
 */
import { TRAP, type TrapState } from './dropTrap.ts';
import type { TrapPost } from './castPlay.types.ts';
import type { Platform } from './types.ts';
import { groundUnder } from './polish.ts';
import { trackAtlas } from './atlasLoader.ts';
import { drawSheet } from './sheetBake.ts';
import { canvasLost } from './canvasLost.ts';
import { W1_TRAPS_URL, W1_TRAP_FRAMES, W1_TRAP_MEASURES, type W1TrapPiece } from './w1TrapsData.ts';

let img: HTMLImageElement | null = null;
let ready = false;
/** start loading the trap sheet (the engine calls this as a stage with traps is built, so the pieces are there for its first frame) */
export function warmTrapArt(): boolean {
  if (!img && typeof Image !== 'undefined') {
    const im = new Image();
    img = im;
    trackAtlas(im, W1_TRAPS_URL, () => { ready = true; }, () => { img = null; }, () => { img = null; ready = false; });
  }
  return ready && !!img;
}

/** a frame's game units per atlas px at its usual size */
const unit = (n: W1TrapPiece): number => {
  const f = W1_TRAP_FRAMES[n];
  return f.units / (f.axis === 'h' ? f.h : f.w);
};

/** draw a frame with its point (ax, ay) (frame px) at the canvas origin, scaled by k (units per px), mirrored if flip */
function piece(ctx: CanvasRenderingContext2D, n: W1TrapPiece, ax: number, ay: number, k: number, flip = false): void {
  const f = W1_TRAP_FRAMES[n];
  if (!img) return;
  ctx.save();
  if (flip) ctx.scale(-1, 1);
  drawSheet(ctx, img, f.x, f.y, f.w, f.h, -ax * k, -ay * k, f.w * k, f.h * k);
  ctx.restore();
}

const SAP = W1_TRAP_MEASURES.sapling;
const SAP_F = W1_TRAP_FRAMES.sapling;
const SAP_COLW = SAP_F.w / SAP.under.length;
/** the crown's underside columns the load may hang from (the drooping tip, under the leaves) */
const CROWN_COLS = [17, 18, 19, 20, 21];
/** the tallest the sapling may stand (units). Sideways the goal sign's bottom is about 230 over the handle's ground (1-3 stills), and
 *  since 1-3's snakes lie on logs (W1C aa98fbc3) the hung hive's own top is about 177 over it, so no crown that holds it fits under
 *  the sign: 265 lets the crown tuck partly behind the sign's end (the lead's call, 11-12, between this and floating bough ends) */
const SAP_MAX_TALL = 265;
const CLUMP = W1_TRAP_MEASURES.clump;
const CLUMP_F = W1_TRAP_FRAMES.clump;
/** the clump column the handle hangs from: the middle of the frond's underside */
const CLUMP_HANG_COL = 6;
const LINK = W1_TRAP_MEASURES.link;

export interface TrapLayout {
  /** +1 when the load is to the right of the handle */
  dir: number;
  /** the handle's top: under the bough end over it */
  hy: number;
  /** where the load hangs from, and how its own frame is drawn */
  hangX: number;
  hangY: number;
  /** the sapling over the load (its foot on the ground), or null: a second bough end holds the load */
  sap: { x: number; y: number; k: number; flip: boolean } | null;
  /** the bough end over the handle: its stick's end set on the sapling's bark, or null where the trunk is not on the handle's side
   *  (then it hangs at the vine line as W1C's stand-in did) */
  bough: { x: number; y: number; k: number; flip: boolean } | null;
  /** the second, smaller sapling behind the handle (ART-W1B): its crown over the handle, the vine's corner hanging from its
   *  underside at (handle x, hy), so nothing hangs on air; null where the first sapling's bough end already holds that corner */
  sap2: { x: number; y: number; k: number; flip: boolean } | null;
}

const loadOf = (p: TrapPost): W1TrapPiece => (p.load === 'hive' ? 'hiveHang' : 'stoneHang');
const loadTall = (p: TrapPost): number => W1_TRAP_FRAMES[loadOf(p)].h * unit(loadOf(p));

/**
 * Where a trap's sapling stands (pure, so it is tested: castArt.test.ts). It scans the sapling's size and which side of the load its
 * foot is on, keeps the spots whose foot is on one flat ground (both edges of its root flare on it), whose crown hangs the load at its
 * tested height (the load's top 4-70 units under the crown) and whose trunk keeps clear of the handle, and takes the closest to the
 * tested height, the foot on the handle's side first.
 */
export function layoutTrap(p: TrapPost, platforms: readonly Platform[]): TrapLayout {
  const dir = p.loadX >= p.x ? 1 : -1;
  // (W1C's line: the vine 68 over the load's bottom; the handle's top stays there)
  const hy = p.loadY - 68;
  // (the load's top may tuck up into the crown's leaves: the hive's stem, the stone's net loop)
  const top = p.loadY - loadTall(p) + (p.load === 'stone' ? 20 : 8);
  let best: { score: number; lay: TrapLayout } | null = null;
  for (const s of [dir, -dir]) {
    for (const c of CROWN_COLS) {
      const colX = (c + 0.5) * SAP_COLW;
      for (let k = 0.2; k <= SAP_MAX_TALL / SAP_F.h + 1e-9; k += 0.004) {
        const fx = p.loadX - s * k * (colX - SAP.foot[0]);
        const half = (SAP.footW * k) / 2;
        const g = groundUnder(platforms, fx, Math.min(p.y, p.landY) - 80, 420);
        if (g === undefined) continue;
        if (groundUnder(platforms, fx - half * 0.6, g - 4, 8) !== g || groundUnder(platforms, fx + half * 0.6, g - 4, 8) !== g) continue;
        const hangY = g - k * (SAP_F.h - SAP.under[c]);
        if (hangY > top || hangY < top - 70) continue;
        // the trunk's root flare keeps clear of the handle's hit box
        if (Math.abs(fx - p.x) < half + TRAP.handle.w / 2) continue;
        const score = Math.abs(hangY - (top - 14)) + (s === dir ? 0 : 400) + k * 20;
        if (!best || score < best.score) best = { score, lay: { dir, hy, hangX: p.loadX, hangY, sap: { x: fx, y: g, k, flip: s < 0 }, bough: null, sap2: null } };
      }
    }
  }
  const lay = best?.lay ?? { dir, hy, hangX: p.loadX, hangY: hy, sap: null, bough: null, sap2: null };
  if (lay.sap && (lay.sap.flip ? -1 : 1) === dir) {
    const a = attach(p, lay);
    if (a.bough) return a;
  }
  return lay.sap ? behind(p, lay, platforms) : lay;
}

const SAP2 = W1_TRAP_MEASURES.sapling2;
const SAP2_F = W1_TRAP_FRAMES.sapling2;
const SAP2_COLW = SAP2_F.w / SAP2.under.length;
/** the second sapling's crown-blob columns: the vine's corner hangs from its underside (the leaves past them droop lower) */
const SAP2_COLS = [12, 13, 14, 15];
/** its tallest (units): smaller than the first, and kept low so sideways its crown stays under the goal sign where it can */
const SAP2_MAX_TALL = 225;

/**
 * The second sapling (ART-W1B, the lead's option (a)): it stands behind the handle, away from the load, and arches toward it, so the
 * vine's corner over the handle hangs from the underside of its crown. Its foot on one flat ground, its root flare clear of the
 * handle; the corner from 40 units over the vine line to 45 under it (the handle's strand drawn that much longer or shorter, never
 * under 12 units); the shortest tree that fits, then the corner nearest the vine line.
 * Where none fits, the layout is unchanged (the vine runs from the first crown and hangs down as the handle, as before).
 */
function behind(p: TrapPost, lay: TrapLayout, platforms: readonly Platform[]): TrapLayout {
  const dir = lay.dir;
  // (the lowest the corner may come: the handle's own painted piece and 12 units of strand still fit above his hand / his feet)
  const lowest = p.kind === 'vine'
    ? p.y - TRAP.handle.low - 30 - W1_TRAP_FRAMES.handle.h * unit('handle') - 12
    : p.y - W1_TRAP_FRAMES.tendril.h * unit('tendril') - 12;
  let best: { score: number; sap2: NonNullable<TrapLayout['sap2']>; hy: number } | null = null;
  for (const c of SAP2_COLS) {
    const colX = (c + 0.5) * SAP2_COLW;
    for (let k = 0.12; k <= SAP2_MAX_TALL / SAP2_F.h + 1e-9; k += 0.004) {
      const fx = p.x - dir * k * (colX - SAP2.foot[0]);
      const half = (SAP2.footW * k) / 2;
      const g = groundUnder(platforms, fx, p.y - 80, 420);
      if (g === undefined) continue;
      if (groundUnder(platforms, fx - half * 0.6, g - 4, 8) !== g || groundUnder(platforms, fx + half * 0.6, g - 4, 8) !== g) continue;
      const cy = g - k * (SAP2_F.h - SAP2.under[c]);
      if (cy > Math.min(lay.hy + 45, lowest) || cy < lay.hy - 40) continue;
      if (Math.abs(fx - p.x) < half + TRAP.handle.w / 2) continue;
      const score = k * SAP2_F.h + Math.abs(cy - lay.hy) * 0.5;
      if (!best || score < best.score) best = { score, sap2: { x: fx, y: g, k, flip: dir < 0 }, hy: cy };
    }
  }
  return best ? { ...lay, hy: best.hy, sap2: best.sap2 } : lay;
}

/** the trunk's bark on the handle's side at world height y (the sapling's measured edge, nearest row that has one) */
function bark(sap: NonNullable<TrapLayout['sap']>, y: number): number | undefined {
  const rows = SAP.edge.length;
  const r = Math.floor(((y - (sap.y - sap.k * SAP_F.h)) / sap.k / SAP_F.h) * rows);
  for (let d = 0; d < 4; d++) {
    for (const i of [r + d, r - d]) {
      if (i >= 0 && i < rows && SAP.edge[i] >= 0) return sap.x + (sap.flip ? -1 : 1) * (SAP.edge[i] - SAP.foot[0]) * sap.k;
    }
  }
  return undefined;
}

/**
 * The bough end over the handle grows out of the sapling: its stick's end on the bark facing the handle, the frond reaching back over
 * the handle, the handle hanging from the frond's underside right over where he hits it, at the vine line. The frond is sized so that
 * column lands over the handle (0.15-0.4 units a px); where it can't, it hangs at the vine line on its own as before.
 */
function attach(p: TrapPost, lay: TrapLayout): TrapLayout {
  const sap = lay.sap!;
  const n = CLUMP.under.length;
  const colW = CLUMP_F.w / n;
  const [sx, sy] = CLUMP.stick;
  let y = lay.hy + 12;
  for (let it = 0; it < 3; it++) {
    const ex = bark(sap, y);
    if (ex === undefined) return lay;
    const D = Math.abs(ex - p.x);
    // the column over the handle: as far out as the frond goes, so its leaves reach past him
    for (const col of [8, 7, 9, 6, 10, 5]) {
      const k = D / ((col + 0.5) * colW - sx);
      if (k < 0.15 || k > 0.4) continue;
      const ny = lay.hy - (CLUMP.under[col] - sy) * k;
      if (Math.abs(ny - y) < 1 || it === 2) return { ...lay, bough: { x: ex, y: ny, k, flip: lay.dir > 0 } };
      y = ny;
      break;
    }
  }
  return lay;
}

const layouts = new WeakMap<TrapPost, TrapLayout>();

/** a length of vine (the handle's own painted strand) from y0 down to y1 at x */
function strand(ctx: CanvasRenderingContext2D, x: number, y0: number, y1: number): void {
  const f = W1_TRAP_FRAMES.handle;
  const k = unit('handle');
  const len = y1 - y0;
  if (len <= 1 || !img) return;
  const sw = 34;
  const sh = Math.min(f.h * 0.55, len / k);
  // (stretched only when longer than the strand's own straight run: it is a twisted vine, so it reads the same)
  drawSheet(ctx, img, f.x + f.w / 2 - sw / 2 - 4, f.y, sw, sh, x - (sw * k) / 2, y0, sw * k, len);
}

/** the bough end over the handle (or the load): the frond's underside middle at (x, y), its stick toward `toward` */
function clump(ctx: CanvasRenderingContext2D, x: number, y: number, toward: number): void {
  const k = unit('clump');
  const hx = (CLUMP_HANG_COL + 0.5) * (CLUMP_F.w / CLUMP.under.length);
  ctx.save();
  ctx.translate(x, y);
  // (the stick is at the frame's left: mirrored when it must point right)
  piece(ctx, 'clump', hx, CLUMP.under[CLUMP_HANG_COL] - 4, k, toward > 0);
  ctx.restore();
}

/** the vine from a to b: the painted length mapped end to end (its sag is painted in) */
function link(ctx: CanvasRenderingContext2D, ax: number, ay: number, bx: number, by: number): void {
  const [[lx, ly], [rx, ry]] = LINK.ends;
  const [x0, y0, x1, y1] = ax <= bx ? [ax, ay, bx, by] : [bx, by, ax, ay];
  const k = Math.hypot(x1 - x0, y1 - y0) / Math.hypot(rx - lx, ry - ly);
  const ang = Math.atan2(y1 - y0, x1 - x0) - Math.atan2(ry - ly, rx - lx);
  ctx.save();
  ctx.translate(x0, y0);
  ctx.rotate(ang);
  piece(ctx, 'link', lx, ly, k);
  ctx.restore();
}

// ─────────── World 1's shimmy vine: a rope whose data says `look: 'vine'` (Rope.look; ropeArt.ts lays it and calls these) ───────────
/** the handle's straight twisted run (its frame's px): ONE turn of the twist, cut where the turn meets itself (rows 98 to 194: of every
 *  cut of the run, the one whose first rows differ least from the rows a turn on), so it repeats along a rope with no seam to see. The
 *  vine is 24 px thick there, its middle at column 53.4 */
const VINE_RUN = { x: 26, w: 56, y: 98, h: 96, mid: 53.4, thick: 24 } as const;
/**
 * The run turned a quarter to lie left to right (its top to the tile's left end, its left edge to the tile's foot), baked from the sheet
 * into `cache` once, and baked AGAIN when the phone has taken that canvas back (canvasLost.ts, LESSONS D6: drawn from a lost copy, the
 * vine would be nothing for the rest of the stage). `make` gives the canvas (a test gives its own).
 */
export function vineTileFrom(sheet: CanvasImageSource, cache: { cv: HTMLCanvasElement | null }, make: () => HTMLCanvasElement): HTMLCanvasElement | null {
  if (cache.cv && canvasLost(cache.cv, 'w1 vine tile')) cache.cv = null;
  if (cache.cv) return cache.cv;
  const f = W1_TRAP_FRAMES.handle;
  const c = make();
  c.width = VINE_RUN.h;
  c.height = VINE_RUN.w;
  const g = c.getContext('2d');
  if (!g) return null;
  g.translate(0, VINE_RUN.w);
  g.rotate(-Math.PI / 2);
  g.drawImage(sheet, f.x + VINE_RUN.x, f.y + VINE_RUN.y, VINE_RUN.w, VINE_RUN.h, 0, 0, VINE_RUN.w, VINE_RUN.h);
  cache.cv = c;
  return c;
}
const vineCache: { cv: HTMLCanvasElement | null } = { cv: null };
/** the vine as a tile lying left to right, for ropeArt.ts's slices; null until the sheet is in */
export function vineTile(): { src: CanvasImageSource; tile: { x: number; y: number; w: number; h: number; mid: number; thick: number } } | null {
  if (!warmTrapArt() || !img || typeof document === 'undefined') return null;
  const cv = vineTileFrom(img, vineCache, () => document.createElement('canvas'));
  return cv ? { src: cv, tile: { x: 0, y: 0, w: VINE_RUN.h, h: VINE_RUN.w, mid: VINE_RUN.w - (VINE_RUN.mid - VINE_RUN.x), thick: VINE_RUN.thick } } : null;
}

/** where the vine is tied on the trunk's level arm (its frame's px): the branch's end, inside its leaves, so the leaves fall over the
 *  vine's end (measured on the sheet: the bark's last px at rows 353-377; MEASURES.trunk.armTip is the arm's furthest leaf). How far the
 *  frame reaches from the tie: back to the trunk's far side, on past the leaves, up to the crown */
export const TRUNK_TIE = { x: 730, y: 366, back: 730, fore: W1_TRAP_FRAMES.trunk.w - 730, up: 366 } as const;
/** the trunk's size (units per frame px) for a vine tied at height y over its ground: its foot on the ground, the arm at the tie */
export const trunkScale = (y: number, ground: number): number => Math.max(0.05, (ground - y) / (W1_TRAP_MEASURES.trunk.foot[1] - TRUNK_TIE.y));
/**
 * A living tree standing on `ground`, its level arm holding the vine at (x, y) and reaching into the span: `reach` 1 when the span is to
 * its right (the rope's left end), -1 mirrored (its right end). At a rope's usual height (ROPE_RISE over level ground) it is drawn at
 * about its usual size; the foot is always on the ground. False until the sheet is in.
 */
export function drawTrunk(ctx: CanvasRenderingContext2D, x: number, y: number, ground: number, reach: 1 | -1): boolean {
  if (!warmTrapArt() || !img) return false;
  ctx.save();
  ctx.translate(x, y);
  piece(ctx, 'trunk', TRUNK_TIE.x, TRUNK_TIE.y, trunkScale(y, ground), reach < 0);
  ctx.restore();
  return true;
}

/** every trap on screen. `seen`: the engine's on-screen test; `platforms`: where a sapling may stand */
export function drawTraps(ctx: CanvasRenderingContext2D, traps: readonly TrapState[], t: number, seen: (x: number, y: number) => boolean,
  platforms: readonly Platform[]): void {
  if (!warmTrapArt()) return;
  for (const tr of traps) {
    const p = tr.post;
    let lay = layouts.get(p);
    if (!lay) layouts.set(p, (lay = layoutTrap(p, platforms)));
    if (!seen(p.x, p.y) && !seen(p.loadX, p.loadY) && !(lay.sap && seen(lay.sap.x, lay.sap.y)) && !(lay.sap2 && seen(lay.sap2.x, lay.sap2.y))) continue;
    const set = tr.phase === 'set';
    const loose = tr.phase === 'loose';
    const held = set || loose;
    const sway = set ? Math.sin(t * 1.7 + p.id) * 0.05 : loose ? Math.sin(tr.t * 46) * 0.16 : 0;
    const swing = set ? Math.sin(t * 2.1 + p.id * 2) * 0.025 : loose ? Math.sin(tr.t * 46) * 0.06 : 0;

    // the sapling, behind everything of its trap
    if (lay.sap) {
      ctx.save();
      ctx.translate(lay.sap.x, lay.sap.y);
      piece(ctx, 'sapling', SAP.foot[0], SAP.foot[1], lay.sap.k, lay.sap.flip);
      ctx.restore();
    }
    if (lay.sap2) {
      ctx.save();
      ctx.translate(lay.sap2.x, lay.sap2.y);
      piece(ctx, 'sapling2', SAP2.foot[0], SAP2.foot[1], lay.sap2.k, lay.sap2.flip);
      ctx.restore();
    }
    // the vine from the handle's bough end over to the load, while it holds; once let go, a limp end under each
    if (held) link(ctx, p.x, lay.hy + 2, lay.hangX, lay.hangY + 2);
    else {
      ctx.save();
      ctx.translate(lay.hangX, lay.hangY - 2);
      piece(ctx, 'sprung', 0, 0, unit('sprung') * 0.7, lay.dir < 0);
      ctx.restore();
    }

    // the handle
    if (p.kind === 'vine') {
      ctx.save();
      ctx.translate(p.x, lay.hy);
      ctx.rotate(swing);
      if (held) {
        // the knotted loop's bottom at his raised hand, the strand up to the bough
        const f = W1_TRAP_FRAMES.handle;
        const k = unit('handle');
        const end = p.y - TRAP.handle.low - 30 - lay.hy;
        strand(ctx, 0, -2, end - f.h * k + 6);
        ctx.translate(0, end);
        piece(ctx, 'handle', f.w / 2, f.h, k);
        if (set) glow(ctx, 0, -10, t, p.id);
      } else piece(ctx, 'sprung', W1_TRAP_FRAMES.sprung.w / 2, 0, unit('sprung'));
      ctx.restore();
    } else {
      const f = W1_TRAP_FRAMES.tendril;
      const k = unit('tendril');
      if (held) {
        // taut from its stake at his feet up to the bough
        strand(ctx, p.x, lay.hy - 2, p.y - f.h * k + 6);
        ctx.save();
        ctx.translate(p.x, p.y);
        piece(ctx, 'tendril', f.w / 2, f.h, k);
        ctx.restore();
        if (set) glow(ctx, p.x, p.y - 22, t, p.id);
      } else {
        ctx.save();
        ctx.translate(p.x, p.y);
        piece(ctx, 'stake', W1_TRAP_FRAMES.stake.w / 2, W1_TRAP_FRAMES.stake.h, unit('stake'));
        ctx.restore();
        ctx.save();
        ctx.translate(p.x, lay.hy);
        piece(ctx, 'sprung', W1_TRAP_FRAMES.sprung.w / 2, 0, unit('sprung'));
        ctx.restore();
      }
    }
    // the bough end over the handle, grown out of the sapling's bark (or on its own at the vine line); and over the load where no
    // sapling could stand
    if (lay.bough) {
      ctx.save();
      ctx.translate(lay.bough.x, lay.bough.y);
      piece(ctx, 'clump', CLUMP.stick[0], CLUMP.stick[1], lay.bough.k, lay.bough.flip);
      ctx.restore();
    } else if (!lay.sap) {
      clump(ctx, p.x, lay.hy, lay.dir);
      clump(ctx, lay.hangX, lay.hangY, -lay.dir);
    }
    // (a sapling beyond the load and no bark on the handle's side: no bough end, the vine runs from the crown and hangs down as the
    // handle, one vine, so nothing hangs in the air)

    // the load: hanging on a short strand from the crown, falling, or landed where it fell
    const hang = loadOf(p);
    const down = tr.phase === 'down';
    const n: W1TrapPiece = down ? (p.load === 'hive' ? 'hiveDown' : 'stoneDown') : hang;
    const k = unit(n);
    const f = W1_TRAP_FRAMES[n];
    if (held) strand(ctx, p.loadX, lay.hangY - 2, tr.y - f.h * k + 4);
    ctx.save();
    ctx.translate(p.loadX, tr.y);
    ctx.rotate(down ? 0.22 * lay.dir : sway);
    piece(ctx, n, f.w / 2, f.h, k);
    ctx.restore();
    if (down && p.load === 'hive' && tr.t < 4) bees(ctx, p, lay, tr);
  }
}

/** Matt's bees: four buzz out of the crack, circle the animal under the hive for two seconds, then drift off away from Pokey and fade */
function bees(ctx: CanvasRenderingContext2D, p: TrapPost, lay: TrapLayout, tr: TrapState): void {
  const f = W1_TRAP_FRAMES.bee;
  const k = unit('bee');
  const cx = p.loadX;
  const cy = tr.y - 30;
  const drift = Math.max(0, tr.t - 2.2);
  ctx.save();
  ctx.globalAlpha *= Math.min(1, tr.t * 4) * Math.max(0, 1 - drift / 1.8);
  for (let i = 0; i < 4; i++) {
    const a = tr.t * (4.5 + i * 0.8) + i * 1.6;
    const r = Math.min(1, tr.t * 2) * (20 + i * 6);
    const x = cx + Math.cos(a) * r + lay.dir * drift * (55 + i * 10);
    const y = cy + Math.sin(a * 1.3) * r * 0.45 - drift * (18 + i * 4);
    ctx.save();
    ctx.translate(x, y);
    piece(ctx, 'bee', f.w / 2, f.h / 2, k, Math.cos(a) < 0);
    ctx.restore();
  }
  ctx.restore();
}

/** the soft pulse that says "hit me": one ring, no gradient (cheap) */
function glow(ctx: CanvasRenderingContext2D, x: number, y: number, t: number, id: number): void {
  const u = (Math.sin(t * 3.2 + id) + 1) / 2;
  ctx.save();
  ctx.globalAlpha *= 0.25 + 0.3 * u;
  ctx.strokeStyle = '#fef08a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(x, y, 17 + 4 * u, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}
