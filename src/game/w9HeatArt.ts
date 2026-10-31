/**
 * World 9's heat hazards on the geyser's rhythm (zones.ts Zone `look`, GRAB-BAG.md), in Matt's painted World 9 pieces:
 *   flare     the hot platform of the W9 props sheet (props-made/w9b 'hot-platform') laid flush in the route: resting, the painted cool
 *             slab (Hugging Face, w9/pieces.webp 'flarecool', the same cell); warning, the hot slab bleeds in over it and shivers;
 *             flaring, the hazards sheet's lava fountain spits low off it
 *   lavafall  the painted pour (w9/pieces.webp 'lavafall0'..'2', a loop) from above the frame: a thin trickle first (the warning), then
 *             the pour down to the ground, landing in its own splash
 */
import type { Zone, ZoneState } from './zones.ts';
import { drawLava, drawW9Hazard, drawW9Piece } from './w9Art.ts';
import { W9_PIECE_FRAMES } from './w9PiecesData.ts';

const W9B_URL = new URL('../assets/w6to10/props-made/w9b.webp', import.meta.url).href;
const W9_PIECES_URL = new URL('../assets/w9/pieces.webp', import.meta.url).href;
/** props-made/w9b.json 'hot-platform'; laid flush in the route, `top` of its height above the ground line (its top face in the ground, its
 *  front edge down the bank's face), so he walks over it, never into it */
const SLAB = { x: 567, y: 0, w: 434, h: 211, top: 0.19 } as const;

let im: HTMLImageElement | null = null;
let ok = false;
let pim: HTMLImageElement | null = null;
let pok = false;
function slabImg(): HTMLImageElement | null {
  if (typeof Image === 'undefined') return null;
  if (!im) {
    im = new Image();
    im.onload = () => (ok = true);
    im.src = W9B_URL;
  }
  return ok ? im : null;
}
/** the HF pieces sheet (w9PiecesData.ts): the cool slab, the lavafall's pours */
function piecesImg(): HTMLImageElement | null {
  if (typeof Image === 'undefined') return null;
  if (!pim) {
    pim = new Image();
    pim.onload = () => (pok = true);
    pim.src = W9_PIECES_URL;
  }
  return pok ? pim : null;
}
export const W9_HEAT_URLS: readonly string[] = [W9B_URL, W9_PIECES_URL];
type PF = { x: number; y: number; w: number; h: number };
const PF_ = W9_PIECE_FRAMES as unknown as Record<string, PF>;

/** the slab where the zone lies, its heat by the zone's phase */
export function drawW9Flare(ctx: CanvasRenderingContext2D, z: Zone, st: ZoneState, t: number): void {
  const src = slabImg();
  if (!src) return;
  const w = z.x1 - z.x0 + 30;
  const h = (SLAB.h * w) / SLAB.w;
  const x = z.x0 - 15;
  const y = z.baseY - SLAB.top * h;
  const heat = st.phase === 'warn' ? Math.min(1, st.u * 1.2) : st.phase === 'active' ? 1 : 0;
  const shiver = st.phase === 'warn' ? Math.sin(t * 55) * 1.8 * st.u : 0;
  const pc = piecesImg();
  const cf = PF_.flarecool;
  if (pc && cf) ctx.drawImage(pc, cf.x, cf.y, cf.w, cf.h, x + shiver, y, w, h);
  if (heat > 0 || !pc) {
    ctx.save();
    ctx.globalAlpha = pc ? heat : 1;
    ctx.drawImage(src, SLAB.x, SLAB.y, SLAB.w, SLAB.h, x + shiver, y, w, h);
    ctx.restore();
  }
}

/** flaring: low fountains spitting off the slab, across its width */
export function drawW9FlareBurst(ctx: CanvasRenderingContext2D, z: Zone, st: ZoneState): void {
  if (st.phase !== 'active') return;
  const n = Math.max(2, Math.round((z.x1 - z.x0) / 80));
  const frame = st.u < 0.2 ? 'burst0' : st.u < 0.75 ? 'burst1' : 'burst2';
  const full = (z.baseY - z.top) * Math.min(1, st.strength * 1.3) + 10;
  for (let i = 0; i < n; i++) {
    const cx = z.x0 + ((i + 0.5) / n) * (z.x1 - z.x0);
    const h = full * (0.8 + 0.2 * ((i * 7) % 3) / 2);
    const w = h * 0.55;
    drawW9Hazard(ctx, frame, cx - w / 2, z.baseY - h + 6, w, h);
  }
}

/** the lavafall: a thin trickle of the painted pour as it warns, the pour itself (its three frames looping) while it is active, its own
 *  splash at the foot; the hazards sheet's fountain, upside down, while the pieces sheet loads */
/** where a lavafall lands, the painted lava pool (w9c 'lava-pool'), lying in the ground: dull while it is quiet, brightening as the drips
 *  warn, full while it pours, a spot a kid learns to read before the fall comes (drawn with the zone bases, under him) */
export function drawW9LavafallPool(ctx: CanvasRenderingContext2D, z: Zone, st: ZoneState): void {
  const w = (z.x1 - z.x0) * 1.9;
  const glow = st.phase === 'idle' ? 0.45 : st.phase === 'warn' ? 0.45 + 0.55 * st.u : 1;
  drawW9Piece(ctx, 'lava-pool', (z.x0 + z.x1) / 2, z.baseY + w * 0.14, w, false, glow);
}

export function drawW9Lavafall(ctx: CanvasRenderingContext2D, z: Zone, st: ZoneState, t: number): void {
  if (st.phase === 'idle') return;
  const cx = (z.x0 + z.x1) / 2;
  const w = z.x1 - z.x0;
  const len = z.baseY - z.top;
  const pc = piecesImg();
  const f = PF_[`lavafall${Math.floor(t * 9) % 3}`];
  const warn = st.phase === 'warn';
  const fw = w * (warn ? 0.35 + 0.35 * st.u : 1.7);
  if (pc && f) {
    ctx.save();
    if (warn) ctx.globalAlpha = 0.7 + 0.3 * st.u;
    // (a trickle hangs from the sky without reaching the ground's splash: its foot cut off; the pour lands)
    const sh = warn ? f.h * 0.86 : f.h;
    ctx.drawImage(pc, f.x, f.y, f.w, sh, cx - fw / 2, z.top, fw, warn ? len * 0.97 : len + 6);
    ctx.restore();
    return;
  }
  if (warn) {
    ctx.save();
    ctx.globalAlpha = 0.75 + 0.25 * st.u;
    drawW9Hazard(ctx, 'burst2', cx - fw / 2, z.top, fw, len, true);
    ctx.restore();
    return;
  }
  const cw = w * (1.05 + 0.15 * st.strength);
  drawW9Hazard(ctx, Math.floor(t * 10) % 2 ? 'burst1' : 'burst2', cx - cw / 2, z.top, cw, len, true);
  const sw = w * 2.2;
  drawW9Hazard(ctx, `splash${Math.floor(t * 8) % 3}`, cx - sw / 2, z.baseY - sw * 0.6, sw, sw * 0.6);
}

/**
 * a lava surge down a cooled channel (zones.ts look 'surge', GRAB-BAG.md N6): as it warns, the painted surge front shows small at the
 * channel's upstream end, glowing and growing; running, the painted lava strip floods the floor behind its front, which rolls along it in
 * the first third of the firing, then the whole floor is lava until it drains
 */
export function drawW9Surge(ctx: CanvasRenderingContext2D, z: Zone, st: ZoneState, t: number): void {
  if (st.phase === 'idle') return;
  const pc = piecesImg();
  const f = PF_[`surge${Math.floor(t * 8) % 3}`];
  if (st.phase === 'warn') {
    if (!pc || !f) return;
    const k = 0.3 + 0.4 * st.u;
    ctx.save();
    // (clipped at the channel's walls: the painted frame's cut tail sits on the wall's face, so the surge reads as pouring out of it)
    ctx.beginPath();
    ctx.rect(z.x0 - 12, z.baseY - f.h * k - 10, z.x1 - z.x0 + 24, f.h * k + 30);
    ctx.clip();
    ctx.globalAlpha = 0.5 + 0.5 * st.u;
    ctx.drawImage(pc, f.x, f.y, f.w, f.h, z.x0 - f.w * k * 0.6, z.baseY - f.h * k + 4, f.w * k, f.h * k);
    ctx.restore();
    return;
  }
  // (the flood runs wall to wall: the zone is inset from the channel's ends by pipeline SURGE.inset, the lava is not)
  const a = z.x0 - 12, b = z.x1 + 12;
  const front = a + (b - a) * Math.min(1, st.u * 3);
  const depth = 30 * Math.min(1, st.strength * 1.4);
  // (its ends taper: the surface rounds down into the wall and into the front, a bead of lava, not a cut-off slab)
  const top = z.baseY - depth - 6, bot = z.baseY + 14, r = Math.min(26, (front - a) / 2);
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(a, bot);
  ctx.lineTo(a, top + depth * 0.9);
  ctx.quadraticCurveTo(a, top, a + r, top);
  ctx.lineTo(front - r, top);
  ctx.quadraticCurveTo(front, top, front, top + depth * 0.9);
  ctx.lineTo(front, bot);
  ctx.closePath();
  ctx.clip();
  drawLava(ctx, a, front, z.baseY - depth + 4, bot, t);
  ctx.restore();
  if (pc && f && st.u < 0.45) {
    const h = 90;
    const w = (f.w * h) / f.h;
    ctx.drawImage(pc, f.x, f.y, f.w, f.h, front - w * 0.8, z.baseY - h + 8, w, h);
  }
}

/** one of World 9's painted ash streaks (w9/pieces.webp 'gust0'..'3', the hot wind's look 'ash'), `len` long, its middle at (x, y). False
 *  while the sheet loads (the game's own painted gust strip stands in) */
export function drawW9AshStreak(ctx: CanvasRenderingContext2D, i: number, x: number, y: number, len: number, alpha: number, flip: boolean): boolean {
  const pc = piecesImg();
  const f = PF_[`gust${((i % 4) + 4) % 4}`];
  if (!pc || !f) return false;
  const h = (f.h * len) / f.w;
  ctx.save();
  ctx.globalAlpha = alpha;
  if (flip) {
    ctx.translate(x * 2, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(pc, f.x, f.y, f.w, f.h, x - len / 2, y - h / 2, len, h);
  ctx.restore();
  return true;
}
