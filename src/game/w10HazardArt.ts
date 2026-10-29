/**
 * w10HazardArt — World 10's storm hazards drawn from the Hugging Face set (src/assets/w10, tools/art/w10; review sheets in
 * reference/prop-sheets/qa-notes/w10/):
 *   rods.webp       the lightning rod (zones.ts 'bolt'), two looks (a spear, a crown with a coil) picked by the rod's place: DULL while it
 *                   is quiet, CHARGING through its warning (its tip's halo swelling and flickering), and SPENT for a moment after the strike
 *                   (an after-glow on the tip and a wisp of smoke rising off it). A scorch mark lies on the stone at its foot.
 *   lightning.webp  the strike: one of four painted bolts, from high over the rod down to its tip, a different one each strike, flickering
 *                   as it fades; the burst where it lands (flash, crackle, fade).
 *   spikes.webp     the iron spike bed on a trough's floor (zones.ts 'spikes'): the strip repeated on the world's grid, an end cap each side.
 *   rampart.webp    the crumbling rampart slab (a crumbling tile in World 10): cracked at rest (whole only far from the eye: never, so
 *                   every slab shows it will break), shaking as its hold runs out, then breaking; its rubble falling after it breaks.
 * The glow pieces (halo, after-glow, smoke, bolts, burst) were painted on black and are drawn with "lighter". Every draw returns false
 * until its sheet has loaded, and the caller draws the stand-in.
 */
import { trackAtlas } from './atlasLoader.ts';
import { regrowDelay } from './regrow.ts';
import type { Platform } from './types.ts';
import type { Zone, ZoneState } from './zones.ts';

type F = { x: number; y: number; w: number; h: number; ax: number; ay: number };
export const W10_HAZARD_URLS = {
  rods: new URL('../assets/w10/rods.webp', import.meta.url).href,
  lightning: new URL('../assets/w10/lightning.webp', import.meta.url).href,
  spikes: new URL('../assets/w10/spikes.webp', import.meta.url).href,
  rampart: new URL('../assets/w10/rampart.webp', import.meta.url).href,
} as const;
type Sheet = keyof typeof W10_HAZARD_URLS;

/** the frames (src/assets/w10/*.json) */
const ROD: Record<string, F> = {
  'rod-a-dull': { x: 0, y: 0, w: 126, h: 577, ax: 63, ay: 575.5 },
  'rod-a-charge': { x: 130, y: 0, w: 126, h: 577, ax: 63, ay: 575.5 },
  'rod-a-spent': { x: 260, y: 0, w: 126, h: 577, ax: 63, ay: 575.5 },
  'rod-b-dull': { x: 390, y: 0, w: 126, h: 560, ax: 62, ay: 558.5 },
  'rod-b-charge': { x: 520, y: 0, w: 126, h: 560, ax: 62, ay: 558.5 },
  'rod-b-spent': { x: 650, y: 0, w: 126, h: 560, ax: 62, ay: 558.5 },
  'halo-a': { x: 780, y: 0, w: 110, h: 125, ax: 51, ay: 63 },
  'halo-b': { x: 894, y: 0, w: 123, h: 129, ax: 61, ay: 63 },
  afterglow: { x: 1021, y: 0, w: 69, h: 88, ax: 36, ay: 40 },
  'smoke-0': { x: 1094, y: 0, w: 49, h: 198, ax: 23, ay: 191 },
  'smoke-1': { x: 1147, y: 0, w: 54, h: 235, ax: 26, ay: 226 },
};
/** where each look's tip is in its rod frame */
const TIP = { a: [63, 1.5], b: [62, 26.5] } as const;
const BOLT: Record<string, F> = {
  bolt0: { x: 0, y: 0, w: 130, h: 704, ax: 79, ay: 704 },
  bolt1: { x: 134, y: 0, w: 126, h: 704, ax: 15, ay: 704 },
  bolt2: { x: 264, y: 0, w: 124, h: 704, ax: 84, ay: 704 },
  bolt3: { x: 392, y: 0, w: 132, h: 704, ax: 71, ay: 704 },
  'burst-flash': { x: 528, y: 0, w: 232, h: 138, ax: 110, ay: 120 },
  'burst-crackle': { x: 764, y: 0, w: 190, h: 122, ax: 94, ay: 110 },
  'burst-fade': { x: 958, y: 0, w: 125, h: 138, ax: 64, ay: 120 },
};
const SPIKE: Record<string, F> = {
  strip: { x: 0, y: 0, w: 512, h: 142, ax: 0, ay: 138 },
  'cap-left': { x: 516, y: 0, w: 82, h: 104, ax: 82, ay: 101 },
  'cap-right': { x: 602, y: 0, w: 78, h: 104, ax: 0, ay: 101 },
};
const RAMP: Record<string, F> = {
  whole: { x: 0, y: 0, w: 331, h: 142, ax: 0, ay: 1 },
  cracked: { x: 335, y: 0, w: 331, h: 142, ax: 0, ay: 1 },
  breaking: { x: 670, y: 0, w: 371, h: 182, ax: 20, ay: 21 },
  'rubble-0': { x: 1045, y: 0, w: 50, h: 52, ax: 25, ay: 26 },
  'rubble-1': { x: 1099, y: 0, w: 50, h: 39, ax: 25, ay: 19.5 },
  'rubble-2': { x: 1153, y: 0, w: 38, h: 25, ax: 19, ay: 12.5 },
  'rubble-3': { x: 1195, y: 0, w: 43, h: 52, ax: 21.5, ay: 26 },
  scorch: { x: 1242, y: 0, w: 222, h: 60, ax: 111, ay: 30 },
};

/** a rod drawn this tall (world px): a head over Pokey, its shaft about 8 px across */
export const ROD_H = 150;
/** the painted pieces' scale: rods and their glows at ROD_K, the slab a tile wide (330 painted px = 110), the bed's strip 60 px tall */
const ROD_K = ROD_H / 577;
const SPIKE_H = 60;
/** how long a rod stays spent (s) after its strike, and how long a broken slab's rubble falls */
const SPENT_S = 1.4;
const FALL_S = 0.6;

const imgs = new Map<Sheet, HTMLImageElement>();
const ready = new Set<Sheet>();
function load(k: Sheet) {
  if (imgs.has(k) || typeof Image === 'undefined') return;
  const im = new Image();
  imgs.set(k, im);
  trackAtlas(im, W10_HAZARD_URLS[k], () => ready.add(k), () => imgs.delete(k), () => (imgs.delete(k), ready.delete(k)));
}
const has = (k: Sheet) => (load(k), ready.has(k));
/** whether the rampart sheet has loaded (starts the load) */
export const w10SlabReady = (): boolean => has('rampart');
/** whether every sheet has loaded (starts the loads) */
export function w10HazardsReady(): boolean {
  return (Object.keys(W10_HAZARD_URLS) as Sheet[]).every(has);
}

/** World 10's stage is being played: its crumbling tiles are rampart slabs (crumbleArt.ts asks) */
let rampartStage = false;
export function setW10Stage(on: boolean): void {
  rampartStage = on;
}
export const w10RampartStage = (): boolean => rampartStage;

const hash = (x: number, s: number): number => {
  const v = Math.sin(x * 12.9898 + s * 78.233) * 43758.5453;
  return v - Math.floor(v);
};

function blit(ctx: CanvasRenderingContext2D, k: Sheet, f: F, x: number, y: number, s: number, o: { flip?: boolean; alpha?: number; add?: boolean; sy?: number } = {}) {
  const im = imgs.get(k)!;
  ctx.save();
  if (o.alpha !== undefined) ctx.globalAlpha *= o.alpha;
  if (o.add) ctx.globalCompositeOperation = 'lighter';
  ctx.translate(x, y);
  if (o.flip) ctx.scale(-1, 1);
  const sy = o.sy ?? s;
  ctx.drawImage(im, f.x, f.y, f.w, f.h, -f.ax * s, -f.ay * sy, f.w * s, f.h * sy);
  ctx.restore();
}

/**
 * A lightning rod at its column's foot, in its state (the base layer, behind Pokey): dull, charging (the halo on its tip swells and
 * flickers through the warning), spent (after-glow and smoke) for SPENT_S after the strike. False until the sheets have loaded.
 */
export function drawW10Rod(ctx: CanvasRenderingContext2D, z: Zone, st: ZoneState, t: number): boolean {
  if (!has('rods') || !has('rampart')) return false;
  const cx = (z.x0 + z.x1) / 2;
  const look = hash(cx, 5) < 0.5 ? 'a' : 'b';
  // (seconds since the last strike ended: the spent state follows it)
  const since = st.phase === 'idle' ? st.u * (z.period - z.warn - z.active) : Infinity;
  const state = st.phase === 'warn' || st.phase === 'active' ? 'charge' : since < SPENT_S ? 'spent' : 'dull';
  // the scorch on the stone at its foot, darker just after a strike
  blit(ctx, 'rampart', RAMP.scorch, cx, z.baseY - 2, 0.42, { alpha: 0.55 + (since < SPENT_S ? 0.35 * (1 - since / SPENT_S) : 0), sy: 0.3 });
  blit(ctx, 'rods', ROD[`rod-${look}-${state}`], cx, z.baseY + 2, ROD_K);
  const [tx, ty] = TIP[look];
  const tipX = cx + (tx - ROD[`rod-${look}-dull`].ax) * ROD_K;
  const tipY = z.baseY + 2 + (ty - ROD[`rod-${look}-dull`].ay) * ROD_K;
  if (state === 'charge') {
    const grow = st.phase === 'warn' ? 0.45 + 0.55 * st.u : 1;
    const flick = st.phase === 'warn' ? 0.75 + 0.25 * Math.sin(t * (30 + 30 * st.u)) : 1;
    blit(ctx, 'rods', ROD[`halo-${look}`], tipX, tipY, ROD_K * 1.25 * grow, { add: true, alpha: flick });
  } else if (state === 'spent') {
    const u = since / SPENT_S;
    blit(ctx, 'rods', ROD.afterglow, tipX, tipY, ROD_K * 1.3, { add: true, alpha: 1 - u });
    blit(ctx, 'rods', ROD[hash(cx + Math.floor((t + z.offset) / z.period), 3) < 0.5 ? 'smoke-0' : 'smoke-1'], tipX, tipY - 10 * u, ROD_K * 1.1, { add: true, alpha: 0.7 * Math.sin(Math.PI * Math.min(1, u * 1.2)) });
  }
  return true;
}

/** the strike (the effects layer, over Pokey): a painted bolt from the column's top down to the rod's tip, and the burst at its foot */
export function drawW10Bolt(ctx: CanvasRenderingContext2D, z: Zone, st: ZoneState, t: number): boolean {
  if (!has('lightning')) return false;
  if (st.phase !== 'active') return true;
  const cx = (z.x0 + z.x1) / 2;
  const strike = Math.floor((t + z.offset) / z.period);
  const f = BOLT[`bolt${Math.floor(hash(cx + strike * 7.1, 11) * 4)}`];
  const tip = z.baseY - ROD_H + 6;
  // (the bolt drawn its painted width at a height that reaches from the column's top to the tip; it flickers as it fades)
  const s = (tip - z.top) / f.h;
  const k = Math.min(1, (1.4 * (1 - st.u)) ** 0.7);
  const flick = 0.8 + 0.2 * Math.sin(t * 61 + cx);
  blit(ctx, 'lightning', f, cx, tip, Math.max(0.36, s * 0.8), { add: true, alpha: k * flick, sy: s, flip: hash(cx + strike, 13) < 0.5 });
  // the burst where it lands: flash, crackle, fade over the strike
  const b = st.u < 0.25 ? 'burst-flash' : st.u < 0.6 ? 'burst-crackle' : 'burst-fade';
  blit(ctx, 'lightning', BOLT[b], cx, z.baseY, 0.42, { add: true, alpha: 1 - st.u * 0.6 });
  return true;
}

/** an iron spike bed along its trough's floor (zones.ts 'spikes'): the strip on the world's grid, a cap each end */
export function drawW10Spikes(ctx: CanvasRenderingContext2D, z: Zone): boolean {
  if (!has('spikes')) return false;
  const s = SPIKE_H / SPIKE.strip.h;
  const tw = SPIKE.strip.w * s;
  const im = imgs.get('spikes')!;
  ctx.save();
  ctx.beginPath();
  ctx.rect(z.x0, z.baseY - SPIKE_H - 4, z.x1 - z.x0, SPIKE_H + 8);
  ctx.clip();
  for (let x = Math.floor(z.x0 / tw) * tw; x < z.x1; x += tw - 0.5) ctx.drawImage(im, SPIKE.strip.x, SPIKE.strip.y, SPIKE.strip.w, SPIKE.strip.h, x, z.baseY - SPIKE.strip.ay * s, tw, SPIKE.strip.h * s);
  ctx.restore();
  blit(ctx, 'spikes', SPIKE['cap-left'], z.x0 + 4, z.baseY - 1, s);
  blit(ctx, 'spikes', SPIKE['cap-right'], z.x1 - 4, z.baseY - 1, s);
  return true;
}

/**
 * A crumbling rampart slab: cracked at rest, shaking and then breaking as its hold runs out, its rubble falling after it breaks. False
 * until the sheet has loaded (or the tile is not a crumbling one).
 */
export function drawW10Slab(ctx: CanvasRenderingContext2D, p: Platform, time: number, dx = 0, dy = 0): boolean {
  if (p.crumbleAfter === undefined || !has('rampart')) return false;
  // (the painted slab is 3 px a world px: a tile wide)
  const k = p.width / RAMP.cracked.w;
  if (p.broken) {
    const since = p.regrowAt === undefined ? Infinity : time - (p.regrowAt - regrowDelay(p.id));
    if (since < 0 || since > FALL_S) return true;
    const u = since / FALL_S;
    for (let i = 0; i < 4; i++) {
      const sd = hash(p.x + i * 13, 17);
      blit(ctx, 'rampart', RAMP[`rubble-${i}`], p.x + p.width * (0.15 + 0.23 * i) + (sd - 0.5) * 20 * u, p.y + 12 + 260 * u * u * (0.8 + 0.4 * sd), k * 1.1, { alpha: 1 - u * u });
    }
    return true;
  }
  const prog = p.fragileTimer === undefined ? 0 : Math.max(0, Math.min(1, 1 - p.fragileTimer / p.crumbleAfter));
  const f = prog > 0.66 ? RAMP.breaking : RAMP.cracked;
  blit(ctx, 'rampart', f, p.x + dx, p.y - 1 + dy + prog * 3, k);
  return true;
}

/**
 * A free bolt (10-3 Thunder's storm over the wall, watcher.ts): one of the four painted bolts from `top` down to `bottom` at x, picked
 * by `seed`, `alpha` its strength; the burst at its foot when `burst`. False until the sheet has loaded.
 */
export function drawW10SkyBolt(ctx: CanvasRenderingContext2D, x: number, top: number, bottom: number, seed: number, alpha: number, burst = false): boolean {
  if (!has('lightning')) return false;
  const f = BOLT[`bolt${Math.floor(hash(seed, 19) * 4)}`];
  const sy = (bottom - top) / f.h;
  blit(ctx, 'lightning', f, x, bottom, Math.max(0.24, sy * 0.5), { add: true, alpha, sy, flip: hash(seed, 23) < 0.5 });
  if (burst) blit(ctx, 'lightning', BOLT['burst-flash'], x, bottom, 0.5, { add: true, alpha });
  return true;
}
