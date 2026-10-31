/**
 * w10GearArt — World 10's gear works (hfb-w10bag-r3, src/assets/w10/gear.webp + gear.json, cut by tools/art/w10/gearcut.py):
 *   the gear grinder (10-9's gear theme: a 'bolt' zone, look 'grinder'): two iron cogs meshing in a stone trough set in the walk; still
 *     while it is quiet, creeping and rattling as it warns, spinning while it bites. Drawn as the two cogs turning behind the trough's front.
 *   the rolling spiked cog (look 'cog', the barrel lane's way): the spiked cog turning its distance over its radius; the gear wall it comes
 *     out of stands at the lane's start.
 *   the lift pits' floor (World 9's knobs under World 10's moving planks, style 'w10_rubble', w10PieceArt): a half-sunk cog, a fallen gear,
 *     a coil of chain, each on its heap of stones, or w10var's plain rubble, picked by the spot.
 *   dressing on the walks: the gear lever and the axle stub (w10Art's decor, by name).
 * Every draw returns false until the sheet has loaded.
 */
import { trackAtlas } from './atlasLoader.ts';
import { zoneState, type Zone } from './zones.ts';
import GEAR from '../assets/w10/gear.json';

const URL_ = new URL('../assets/w10/gear.webp', import.meta.url).href;
export const W10_GEAR_URLS: readonly string[] = [URL_];
type Frame = { x: number; y: number; w: number; h: number; ax: number; ay: number };
export const W10_GEAR_FRAMES = GEAR.frames as Record<string, Frame>;
export type W10GearFrame = keyof typeof GEAR.frames;

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
export const w10GearReady = (): boolean => !!sheet();

/** one frame, `h` px tall, its anchor (the middle of its foot, or a cog's hub) at (x, y) */
export function drawW10Gear(ctx: CanvasRenderingContext2D, n: string, x: number, y: number, h: number, flip = false): boolean {
  const im = sheet();
  const f = W10_GEAR_FRAMES[n];
  if (!im || !f) return false;
  const k = h / f.h;
  if (flip) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(-1, 1);
    ctx.drawImage(im, f.x, f.y, f.w, f.h, -f.ax * k, -f.ay * k, f.w * k, f.h * k);
    ctx.restore();
  } else ctx.drawImage(im, f.x, f.y, f.w, f.h, x - f.ax * k, y - f.ay * k, f.w * k, f.h * k);
  return true;
}

/** a cog frame turned `rot` about its hub, `d` px across, its hub at (x, y) */
function drawCog(ctx: CanvasRenderingContext2D, n: string, x: number, y: number, d: number, rot: number): boolean {
  const im = sheet();
  const f = W10_GEAR_FRAMES[n];
  if (!im || !f) return false;
  const k = d / f.w;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.drawImage(im, f.x, f.y, f.w, f.h, -f.ax * k, -f.ay * k, f.w * k, f.h * k);
  ctx.restore();
  return true;
}

// ───────────────────────────── the gear grinder ─────────────────────────────

/** the trough's drawn width over the column's (its stone lip reaches past the cogs' mouth) and the cogs' size against it */
const TROUGH_OVER = 44;
const COG_K = 0.6;

/**
 * The grinder: its two cogs (turning by the zone's state: still while idle, creeping and rattling as it warns, spinning fast as it bites)
 * behind the trough's front, the trough's top flush with the walk.
 */
export function drawW10Grinder(ctx: CanvasRenderingContext2D, z: Zone, t: number): boolean {
  const f = W10_GEAR_FRAMES['grinder-trough'];
  if (!f || !sheet()) return false;
  const st = zoneState(z, t);
  const w = z.x1 - z.x0 + TROUGH_OVER;
  const h = (w * f.h) / f.w;
  const cx = (z.x0 + z.x1) / 2;
  // (the cogs' turn: the phase's own clock, never a running sum, so it is the same on every frame for a given time)
  const spin = st.phase === 'active' ? st.u * 26 : st.phase === 'warn' ? st.u * st.u * 1.6 : 0;
  const shake = st.phase === 'warn' ? Math.sin(t * 50) * 1.6 * st.u : 0;
  const d = w * COG_K;
  // (the hubs a little over the rim: most of each cog shows, its teeth up to the column's top (GRIND.height))
  const cy = z.baseY - d * 0.12 + shake;
  drawCog(ctx, 'spiked-cog', cx - d * 0.4, cy, d, spin);
  drawCog(ctx, 'spiked-cog', cx + d * 0.4, cy, d, -spin + 0.31);
  // (the trough's front: its anchor is its rim (gearcut.py), so the rim sits on the walk line and the rest goes down into the ground)
  return drawW10Gear(ctx, 'grinder-trough', cx, z.baseY, h);
}

// ───────────────────────────── the rolling spiked cog ─────────────────────────────

/** the rolling cog's size on its lane (zones.ts BARREL: 44 px wide, 40 high: the cog's disc inside it, only its spike tips past) */
const ROLL_D = 58;

/** the gear wall at the lane's start the cog comes out of: rattling as one is about to go */
export function drawW10CogWall(ctx: CanvasRenderingContext2D, z: Zone, t: number): boolean {
  const st = zoneState(z, t);
  const sx = z.dir === 1 ? z.x0 - 46 : z.x1 + 46;
  const dx = st.phase === 'warn' ? Math.sin(t * 40) * 1.5 * st.u : 0;
  return drawW10Gear(ctx, 'gear-wall', sx + dx, z.baseY + 3, 132, z.dir === 1);
}

/** the spiked cog rolling down its lane, turning its distance over its radius */
export function drawW10CogRoll(ctx: CanvasRenderingContext2D, z: Zone, t: number): boolean {
  const st = zoneState(z, t);
  if (st.phase !== 'active') return true;
  const bx = z.dir === 1 ? z.x0 + st.u * (z.x1 - z.x0) : z.x1 - st.u * (z.x1 - z.x0);
  const dist = st.u * (z.x1 - z.x0);
  const r = ROLL_D / 2;
  // (sparks where its spikes bite the stone, flung back the way it came: a small code-drawn touch, three dots, no allocation)
  ctx.fillStyle = '#ffb347';
  for (let i = 0; i < 3; i++) {
    const k = (t * 9 + i * 0.37) % 1;
    ctx.globalAlpha = 1 - k;
    ctx.fillRect(bx - z.dir * (6 + k * 34) - 1.5, z.baseY - 2 - k * (10 + 8 * i) - 1.5, 3, 3);
  }
  ctx.globalAlpha = 1;
  return drawCog(ctx, 'spiked-cog', bx, z.baseY + 1 - r, ROLL_D, ((dist / r) * (z.dir ?? 1)) % (Math.PI * 2));
}

// ───────────────────────────── the lift pits' floor ─────────────────────────────

/** the pit-floor pieces in the gear sheet (w10PieceArt draws w10var's plain rubble for the rest) */
export const W10_PIT_FLOOR: readonly string[] = ['cog-stub', 'gear-fallen', 'chain-heap'];
