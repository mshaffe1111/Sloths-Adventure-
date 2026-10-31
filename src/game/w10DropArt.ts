/**
 * w10DropArt — World 10's drop gate (GRAB-BAG D: a 'bolt' zone with look 'portcullis'): the gatehouse over the wall-walk, a battlemented
 * stone arch (the grab bag's HF sheet, w10BagArt 'gatehouse': drawn behind Pokey), and the gate's bars (Matt's w10a
 * 'portcullis-down' painting's own bars with the dark between them cut away, w10/dropgate.webp: drawn in front of him), which shudder as
 * it warns and slam down while it is down. Both return false until their sheet has loaded.
 */
import { trackAtlas } from './atlasLoader.ts';
import { drawW10Bag, drawW10BagPart, W10_BAG_FRAMES } from './w10BagArt.ts';
import type { Zone, ZoneState } from './zones.ts';
import { w10VarSheet } from './w10PieceArt.ts';

const BARS_URL = new URL('../assets/w10/dropgate.webp', import.meta.url).href;
const LID_URL = new URL('../assets/w10/barrel-end.webp', import.meta.url).href;
export const W10_DROP_URLS: readonly string[] = [BARS_URL, LID_URL];
/** the gatehouse's drawn height over the walk (world px) and its painting's frame (w10BagArt 'gatehouse') */
export const GATE_H = 250;
const FRAME = W10_BAG_FRAMES.gatehouse;
/** the doorway in the painting (where the bars run), in its px (measured on the cut: bagcut.py) */
const OPENING = { x0: 62, x1: 258, y0: 146, y1: 396 };

let bars: HTMLImageElement | null = null;
let barsReady = false;
function barsImg(): HTMLImageElement | null {
  if (typeof Image === 'undefined') return null;
  if (!bars) {
    const im = new Image();
    bars = im;
    trackAtlas(im, BARS_URL, () => (barsReady = true), () => (bars = null), () => ((bars = null), (barsReady = false)));
  }
  return barsReady ? bars : null;
}
export const w10DropReady = (): boolean => !!barsImg() && !!spoutImg() && !!lidImg();

/** how far down the gate is, 0 (up in the wall) .. 1 (on the walk), and its shudder (px) */
function dropOf(st: ZoneState, t: number): { down: number; shake: number } {
  if (st.phase === 'warn') return { down: 0.04 + 0.04 * st.u, shake: (1 + 2 * st.u) * Math.sin(t * 46) };
  if (st.phase === 'active') return { down: Math.min(1, st.strength * 1.6), shake: 0 };
  return { down: 0, shake: 0 };
}

/** the gatehouse, behind him (the arch, the dark doorway, the gate's spikes just showing under its lintel) */
export function drawW10Gatehouse(ctx: CanvasRenderingContext2D, z: Zone): boolean {
  return drawW10Bag(ctx, 'gatehouse', (z.x0 + z.x1) / 2, z.baseY + 6, GATE_H);
}

/** the bars, in front of him: up in the wall at rest, shuddering as it warns, down while it is down */
export function drawW10DropBars(ctx: CanvasRenderingContext2D, z: Zone, st: ZoneState, t: number): boolean {
  const img = barsImg();
  if (!img) return false;
  const s = GATE_H / FRAME.h;
  const cx = (z.x0 + z.x1) / 2;
  const left = cx - FRAME.ax * s + OPENING.x0 * s;
  const top = z.baseY + 6 - GATE_H + OPENING.y0 * s;
  const w = (OPENING.x1 - OPENING.x0) * s;
  const h = (OPENING.y1 - OPENING.y0) * s;
  const { down, shake } = dropOf(st, t);
  // (raised, all but the spike tips is in the wall above the doorway: clipped to the doorway, the bars slide out of its top)
  const y = top - (1 - down) * h * 0.92 + shake;
  if (y + h < top + 2) return true;
  ctx.save();
  ctx.beginPath();
  ctx.rect(left - 2, top, w + 4, h);
  ctx.clip();
  ctx.drawImage(img, left, y, w, h);
  ctx.restore();
  return true;
}

// ───────────────────────────── the gutter spout (GRAB-BAG E: a 'bolt' zone with look 'gush') ─────────────────────────────

const SPOUT_URL = new URL('../assets/w6to10/props-made/w10alt.webp', import.meta.url).href;
/** the spout block (w10alt 'spout-b'): a stone block with an iron gutter pipe pointing left, its mouth at (22, 150) of 398 x 416 */
const SPOUT = { x: 0, y: 433, w: 398, h: 416, ax: 278, ay: 416, mouthX: 22, mouthY: 150 };
/** the spout's drawn height (world px), set on a wall stub WALL_H tall behind the walk (the lead, 2026-10-31: from architecture, not a
 *  block standing in the street): its mouth stands about 180 px over the walk, higher than a single jump clears */
export const SPOUT_H = 110;
const WALL_H = 112;
/** the wall stub: the left part of w10var's 'bank-b' wall (446 x 200: its crenellated top and dressed stones) */
const WALL = { x: 0, y: 0, w: 230, h: 200 };
/** each gush frame's water: its mouth's and its foot's x in the frame (bagcut's frames, measured), the water from row 84 to the foot */
const GUSH_X: Record<string, [number, number]> = { 'gush-1': [111, 161], 'gush-2': [152, 196], 'gush-3': [107, 161] };
const GUSH_TOP = 84;
const GUSH_FRAMES = ['gush-1', 'gush-2', 'gush-3'] as const;
let spout: HTMLImageElement | null = null;
let spoutReady = false;
function spoutImg(): HTMLImageElement | null {
  if (typeof Image === 'undefined') return null;
  if (!spout) {
    const im = new Image();
    spout = im;
    trackAtlas(im, SPOUT_URL, () => (spoutReady = true), () => (spout = null), () => ((spout = null), (spoutReady = false)));
  }
  return spoutReady ? spout : null;
}
const sb = SPOUT_H / SPOUT.h;
/** where the gush's mouth is for a column whose water lands at cx */
function mouthOf(z: Zone): { x: number; y: number; blockX: number } {
  const cx = (z.x0 + z.x1) / 2;
  const mouthH = WALL_H + (SPOUT.h - SPOUT.mouthY) * sb;
  // (the water drifts ~50 frame px off the mouth as it falls, flipped: the foot lands that much left of the mouth, scaled)
  const k = mouthH / (494 - GUSH_TOP);
  const mx = cx + 50 * k;
  return { x: mx, y: z.baseY - mouthH, blockX: mx + (SPOUT.ax - SPOUT.mouthX) * sb };
}

/** the wall stub behind the walk and the spout block set on its parapet, its pipe out over the column */
export function drawW10Spout(ctx: CanvasRenderingContext2D, z: Zone): boolean {
  const im = spoutImg();
  const wall = w10VarSheet();
  if (!im || !wall) return false;
  const m = mouthOf(z);
  const ww = (WALL.w * WALL_H) / WALL.h;
  ctx.drawImage(wall, WALL.x, WALL.y, WALL.w, WALL.h, m.blockX - ww * 0.55, z.baseY + 4 - WALL_H, ww, WALL_H);
  ctx.drawImage(im, SPOUT.x, SPOUT.y, SPOUT.w, SPOUT.h, m.blockX - SPOUT.ax * sb, z.baseY + 8 - WALL_H - SPOUT.h * sb, SPOUT.w * sb, SPOUT.h * sb);
  return true;
}

/** the water: a trickle at rest, a gurgling stream growing as it warns, the full gush (3 painted frames, 10 fps) while it pours */
export function drawW10Gush(ctx: CanvasRenderingContext2D, z: Zone, st: ZoneState, t: number): boolean {
  const m = mouthOf(z);
  const len = z.baseY + 6 - m.y;
  const reach = st.phase === 'active' ? 1 : st.phase === 'warn' ? 0.25 + 0.5 * st.u : 0.12;
  const alpha = st.phase === 'active' ? Math.max(0.55, st.strength) : st.phase === 'warn' ? 0.45 + 0.3 * st.u : 0.35;
  const n = GUSH_FRAMES[Math.floor(t * 10 + z.x0 * 0.01) % 3];
  const f = W10_BAG_FRAMES[n];
  const [mx0] = GUSH_X[n];
  const k = len / (f.h - GUSH_TOP);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  ctx.rect(m.x - 200, m.y - 4, 400, len * reach + 4);
  ctx.clip();
  // (flipped: the pipe points left, so the water bends away to the left as it falls)
  ctx.translate(m.x, m.y);
  ctx.scale(-1, 1);
  const ok = drawW10BagPart(ctx, n, 0, GUSH_TOP, f.w, f.h - GUSH_TOP, -mx0 * k, 0, f.w * k, len);
  ctx.restore();
  return ok;
}

// ───────────────────────────── the lantern sweep (GRAB-BAG L: a watch zone with look 'lantern') ─────────────────────────────

/** the watchtower's drawn height (the grab bag's gatehouse, stood up as a tower at the watched stretch's middle) and its lantern */
const TOWER_H = 270;
/** the beam's painting: its point (the lantern) at (50, 18) of the frame, the middle of its foot at (110, 404) */
const BEAM = { px: 50, py: 18, fx: 110, fy: 404 };

/** the lantern's glow, made once (PERFORMANCE-RULES §2.3: no gradient per frame): a warm radial light on a 92 px canvas */
let glowCv: HTMLCanvasElement | null = null;
function lanternGlow(): HTMLCanvasElement | null {
  if (glowCv || typeof document === 'undefined') return glowCv;
  const cv = document.createElement('canvas');
  cv.width = cv.height = 92;
  const c = cv.getContext('2d');
  if (!c) return null;
  const g = c.createRadialGradient(46, 46, 2, 46, 46, 46);
  g.addColorStop(0, 'rgba(255, 214, 140, 1)');
  g.addColorStop(1, 'rgba(255, 180, 90, 0)');
  c.fillStyle = g;
  c.fillRect(0, 0, 92, 92);
  glowCv = cv;
  return cv;
}

/**
 * The tower behind the watched wall, its lantern glowing on the battlement; the beam from it to `at` (world x on the wall) while it warns
 * (dim, at the stretch's edge) and sweeps (bright), drawn additively; nothing but the tower and a dim lantern while calm (`at` null).
 */
export function drawW10LanternSweep(ctx: CanvasRenderingContext2D, z: { x0: number; x1: number }, at: number | null, u: number, wallY: number, t: number): boolean {
  const cx = (z.x0 + z.x1) / 2;
  const base = wallY + 6;
  if (!drawW10Bag(ctx, 'gatehouse', cx, base, TOWER_H)) return false;
  const lx = cx;
  const ly = base - TOWER_H + 22;
  // (the lantern itself: a warm glow on the battlement, a light source; flickering)
  const flick = 0.85 + 0.15 * Math.sin(t * 17) * Math.sin(t * 5.3);
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const glow = lanternGlow();
  if (glow) {
    ctx.globalAlpha = 0.8 * flick;
    ctx.drawImage(glow, lx - 46, ly - 46, 92, 92);
    ctx.globalAlpha = 1;
  }
  if (at !== null) {
    // (the beam's painting turned about its point so its foot lands on the wall at `at`)
    const f = W10_BAG_FRAMES['beam-1'];
    const len = Math.hypot(at - lx, base - ly);
    const k = len / (BEAM.fy - BEAM.py);
    const own = Math.atan2(BEAM.fx - BEAM.px, BEAM.fy - BEAM.py);
    const want = Math.atan2(at - lx, base - ly);
    // (the light stops on the wall's top: nothing lit inside the stone under it)
    ctx.beginPath();
    ctx.rect(Math.min(lx, at) - 400, ly - 40, Math.abs(at - lx) + 800, base - 2 - (ly - 40));
    ctx.clip();
    ctx.translate(lx, ly);
    ctx.rotate(own - want);
    ctx.globalAlpha = Math.min(1, 0.25 + 0.75 * u) * flick;
    drawW10BagPart(ctx, 'beam-1', 0, 0, f.w, f.h, -BEAM.px * k, -BEAM.py * k, f.w * k, f.h * k);
  }
  ctx.restore();
  return true;
}

// ───────────────────────────── the rolling barrels (GRAB-BAG K: a 'bolt' zone with look 'barrel') ─────────────────────────────

/** a barrel's drawn width (its painting on its side, w10BagArt 'barrel', 198 x 145) */
const BARREL_W = 58;
/** the stack at the lane's start the barrels roll out of: two barrels on their sides and one stood on end over them; the top one rocks
 *  as a barrel is about to go */
export function drawW10BarrelStack(ctx: CanvasRenderingContext2D, z: Zone, st: ZoneState, t: number): boolean {
  const f = W10_BAG_FRAMES.barrel;
  const h = (BARREL_W * f.h) / f.w;
  const sx = z.dir === 1 ? z.x0 - 34 : z.x1 + 34;
  if (!drawW10Bag(ctx, 'barrel', sx - BARREL_W * 0.52, z.baseY + 3, h)) return false;
  drawW10Bag(ctx, 'barrel', sx + BARREL_W * 0.52, z.baseY + 3, h);
  const rock = st.phase === 'warn' ? Math.sin(t * 30) * 0.12 * st.u : 0;
  ctx.save();
  ctx.translate(sx, z.baseY + 3 - h * 0.95);
  ctx.rotate(rock);
  drawW10Bag(ctx, 'barrel', 0, 0, h);
  ctx.restore();
  return true;
}

let lid: HTMLImageElement | null = null;
let lidReady = false;
function lidImg(): HTMLImageElement | null {
  if (typeof Image === 'undefined') return null;
  if (!lid) {
    const im = new Image();
    lid = im;
    trackAtlas(im, LID_URL, () => (lidReady = true), () => (lid = null), () => ((lid = null), (lidReady = false)));
  }
  return lidReady ? lid : null;
}
/** the rolling barrel's size on the lane: its round end's diameter (zones.ts BARREL: 44 px wide, 40 high, the hoop just over it) */
const LID_D = 46;
/**
 * the barrel rolling down its lane: knocked over on its side with its end to us (hfb-w10bag-r2's barrel end, w10/barrel-end.webp), so
 * it truly rolls, turning the distance it has gone over its radius (the bung goes round with it), with a small hop on the stones
 */
export function drawW10Barrel(ctx: CanvasRenderingContext2D, z: Zone, st: ZoneState): boolean {
  if (st.phase !== 'active') return true;
  const im = lidImg();
  if (!im) return false;
  const bx = z.dir === 1 ? z.x0 + st.u * (z.x1 - z.x0) : z.x1 - st.u * (z.x1 - z.x0);
  const d = st.u * (z.x1 - z.x0);
  const r = LID_D / 2;
  ctx.save();
  ctx.translate(bx, z.baseY + 1 - r - Math.abs(Math.sin(d * 0.05)) * 1.5);
  ctx.rotate(((d / r) * (z.dir ?? 1)) % (Math.PI * 2));
  ctx.drawImage(im, -r, -r, LID_D, LID_D);
  ctx.restore();
  return true;
}
