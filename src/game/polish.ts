/**
 * polish — the "make the backdrops look amazing" pass. PROTOTYPE: off unless switched on.
 *
 * Three passes, one switch (`?polish=1`, or localStorage sloth_polish = 'on'; `?polish=0` turns it off again):
 *   1. character lighting — soft cast + contact shadows that follow the ground (so you can judge a jump), a back-glow and a rim
 *      light on Slomatt, both tinted by the world's own sun and mood
 *   2. living scenery — foliage sways in the wind, light shafts breathe, ground mist drifts, pollen / dust / spores float by
 *   3. glow and depth — a soft bloom over the finished frame
 * Plus a per-stage variation "rig": every stage seed rolls its own wind, light direction, haze, mote type, and shifts/flips
 * each parallax layer, so the same world never lays out the same way twice.
 *
 * Nothing here imports scenery.ts (it would be a cycle); the Look is passed in.
 */
import { onSceneSeedChange } from './sceneSeed.ts';
import { rng, mixToHex, lighten, darken, rgba } from './artKit.ts';
import type { Look } from './scenery.ts';
import type { Platform } from './types.ts';

/** set by the playable-preview build so the polish starts on there; the real game leaves it undefined (off) */
declare const __POLISH_DEFAULT__: boolean | undefined;

let enabled: boolean | null = null;
export function polishEnabled(): boolean {
  if (enabled !== null) return enabled;
  let v = typeof __POLISH_DEFAULT__ !== 'undefined' && __POLISH_DEFAULT__ === true;
  try {
    const q = new URLSearchParams(location.search).get('polish');
    if (q === '1' || q === 'on') v = true;
    else if (q === '0' || q === 'off') v = false;
    else if (localStorage.getItem('sloth_polish') === 'on') v = true;
    else if (localStorage.getItem('sloth_polish') === 'off') v = false;
  } catch {
    /* no window or storage: stay off */
  }
  enabled = v;
  return v;
}
let skips: Set<string> | null = null;
/** debug: ?pskip=bloom,sway,lit,shafts,mist,motes switches single passes off so each one's cost can be measured */
export function pskip(name: string): boolean {
  if (!skips) {
    skips = new Set();
    try {
      for (const k of (new URLSearchParams(location.search).get('pskip') ?? '').split(',')) if (k) skips.add(k);
    } catch {
      /* no window */
    }
  }
  return skips.has(name);
}
/**
 * How much polish the screen can afford: 0 = everything, 1 = no bloom, rim light or wind (shadows, light, mist and motes stay),
 * 2 = off. The engine steps this down before it touches resolution, so a slow phone loses the sparkle first.
 */
let tier = 0;
export const polishTier = () => tier;
export function setPolishTier(t: number) {
  tier = t;
}
/** tests and the settings screen */
export function setPolishEnabled(v: boolean | null) {
  enabled = v;
}
/** the menu switch: applies at once and is remembered on the device (an address override like ?polish=0 still wins for that visit) */
export function setPolishPref(on: boolean) {
  enabled = on;
  tier = 0;
  try {
    localStorage.setItem('sloth_polish', on ? 'on' : 'off');
  } catch {
    /* storage blocked: it just will not be remembered */
  }
}

export type LayerName = 'far' | 'hills' | 'mid' | 'near' | 'front';
export interface LayerVar {
  /** fraction of a tile the layer is slid sideways, so the stage starts on a different stretch of it */
  shift: number;
  flip: boolean;
  /** design-space px the layer sits higher/lower */
  dy: number;
}
export type MoteKind = 'pollen' | 'dust' | 'spore' | 'none';

export interface Rig {
  /** which side the light comes from: +1 right, -1 left (magnitude = how side-on) */
  lx: number;
  rim: string;
  rimA: number;
  shadow: string;
  shadowA: number;
  glow: string;
  wind: { amp: number; spd: number; gust: number; phase: number };
  layers: Record<LayerName, LayerVar>;
  mist: { n: number; a: number; col: string; speed: number; y: number };
  shafts: { n: number; a: number; col: string; slant: number; width: number; speed: number };
  motes: { kind: MoteKind; n: number; col: string; a: number; rise: number; size: number };
  bloom: number;
  /** the ground's share of the pass: dappled light, exposed roots, mottling, and how hard the grass bends */
  terrain: { dapple: number; dappleCol: string; roots: number; mottle: number; lean: number; deep: string; glint: number };
}

const rigs = new Map<string, Rig>();
onSceneSeedChange(() => rigs.clear());

/** the generator: a look + a stage seed in, a full set of per-stage traits out (deterministic) */
export function rigFor(look: Look, world: number, seed: number): Rig {
  const key = `${world}:${seed}`;
  const hit = rigs.get(key);
  if (hit) return hit;
  const r = rng(world * 40503 + seed * 977 + 13);
  const sunX = look.sun ? look.sun.x : r();
  // light comes from the sun's side; never dead-centre so there is always a lit edge
  let lx = (sunX - 0.5) * 3;
  lx = Math.max(-1, Math.min(1, lx));
  if (Math.abs(lx) < 0.4) lx = (lx < 0 ? -1 : 1) * (0.4 + r() * 0.3);
  const sunCol = look.sun ? look.sun.glow : look.rays;
  const rim = mixToHex(lighten(sunCol, 0.2), '#ffcf70', 0.45);
  const night = !!look.stars;
  const flip = (): boolean => r() < 0.5;
  const sh = (): number => r();
  const layers: Record<LayerName, LayerVar> = {
    far: { shift: sh(), flip: flip(), dy: (r() - 0.5) * 36 },
    hills: { shift: sh(), flip: flip(), dy: (r() - 0.5) * 28 },
    mid: { shift: sh(), flip: flip(), dy: (r() - 0.5) * 16 },
    near: { shift: sh(), flip: r() < 0.3, dy: (r() - 0.5) * 10 },
    front: { shift: sh(), flip: flip(), dy: 0 },
  };
  const w = look.weather;
  const kind: MoteKind =
    w === 'rain' || w === 'storm' || w === 'embers' || w === 'ash' ? 'none' : w === 'spores' ? 'spore' : w === 'mist' || night ? 'dust' : r() < 0.25 ? 'dust' : 'pollen';
  const moteCol = kind === 'spore' ? lighten(look.flora[0] ?? '#c8ffa0', 0.4) : kind === 'dust' ? lighten(look.haze, 0.5) : lighten(mixToHex(sunCol, '#fff2b0', 0.5), 0.3);
  const out: Rig = {
    lx,
    rim,
    rimA: night ? 0.7 : 0.95,
    shadow: mixToHex(darken(look.hills[2], 0.7), '#04060e', 0.6),
    shadowA: 0.72,
    glow: mixToHex(sunCol, '#ffffff', 0.25),
    wind: { amp: 2.4 + r() * 3.4, spd: 0.7 + r() * 0.9, gust: 0.3 + r() * 0.5, phase: r() * 6.28 },
    layers,
    mist: { n: 3 + ((r() * 3) | 0), a: (night ? 0.14 : 0.05) + r() * 0.07, col: lighten(look.haze, 0.25), speed: 6 + r() * 12, y: 0.66 + r() * 0.1 },
    shafts: {
      n: look.rayA > 0.01 ? 3 + ((r() * 4) | 0) : 0,
      a: Math.min(0.2, look.rayA * 1.5 + 0.03),
      col: look.rays,
      slant: (lx > 0 ? -1 : 1) * (0.12 + r() * 0.2),
      width: 40 + r() * 70,
      speed: 0.3 + r() * 0.5,
    },
    motes: { kind, n: kind === 'none' ? 0 : 36 + ((r() * 36) | 0), col: moteCol, a: 0.55 + r() * 0.3, rise: (r() - 0.35) * 8, size: 1 + r() * 0.8 },
    bloom: night ? 0.2 : 0.16 + r() * 0.05,
    terrain: {
      dapple: night ? 0.3 : 0.55 + r() * 0.6,
      dappleCol: lighten(mixToHex(sunCol, '#fff0b0', 0.4), 0.2),
      roots: r() * 1.3,
      mottle: r() * 1000,
      lean: 0.7 + r() * 0.8,
      deep: mixToHex(darken(look.ground.dirtDark, 0.4), look.grade[0], 0.25),
      glint: r(),
    },
  };
  rigs.set(key, out);
  return out;
}

// ───────────────────────────── living scenery ─────────────────────────────

const smooth = (t: number) => {
  const c = Math.max(0, Math.min(1, t));
  return c * c * (3 - 2 * c);
};

/** how much of the sway a row of a layer gets (0 at its roots, 1 at the loose tips) */
export function swayWeight(layer: LayerName, t: number): number {
  if (layer === 'front') return 0.35 + 0.65 * Math.sin(Math.PI * Math.min(1, Math.max(0, t)));
  // roots on the ground line (~78% down the tile), tips above it
  return smooth((0.8 - t) / 0.7);
}

export function swayAmount(rig: Rig, layer: LayerName): number {
  const k = layer === 'front' ? 1.9 : layer === 'near' ? 1.25 : layer === 'mid' ? 0.7 : 0;
  return rig.wind.amp * k;
}

/** a gust every so often on top of the steady breeze */
export function gustAt(rig: Rig, time: number): number {
  const g = Math.sin(time * 0.31 + rig.wind.phase) * Math.sin(time * 0.17 + 1.3);
  return 0.75 + rig.wind.gust * Math.max(0, g);
}

interface Spec {
  x: number;
  y: number;
  vx: number;
  vy: number;
  ph: number;
  d: number;
}
const specCache = new Map<string, Spec[]>();
onSceneSeedChange(() => specCache.clear());
function specs(key: string, n: number): Spec[] {
  let s = specCache.get(key);
  if (!s || s.length < n) {
    const r = rng(key.split('').reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 7));
    s = [];
    for (let i = 0; i < Math.max(n, 80); i++) s.push({ x: r(), y: r(), vx: 0.4 + r() * 1.2, vy: (r() - 0.5) * 0.6, ph: r() * 6.28, d: 0.25 + r() * 0.75 });
    specCache.set(key, s);
  }
  return s;
}

const wrap01 = (v: number) => ((v % 1) + 1) % 1;

/** drawn right after the layers and before the playfield: drifting ground mist and breathing light shafts */
export function polishBack(ctx: CanvasRenderingContext2D, look: Look, rig: Rig, world: number, camX: number, vw: number, vh: number, time: number) {
  // shafts
  const sh = rig.shafts;
  for (let i = 0; i < (pskip('shafts') ? 0 : sh.n); i++) {
    const u = (i + 0.5) / sh.n;
    const sway = Math.sin(time * sh.speed + i * 1.9) * 26;
    const x0 = vw * (0.06 + 0.88 * wrap01(u + (i % 2 ? 0.07 : -0.05))) - camX * 0.04 + sway;
    const len = vh * (0.8 + 0.15 * Math.sin(i * 2.3));
    const dx = sh.slant * len;
    const w0 = sh.width * 0.35;
    const w1 = sh.width * (1.2 + 0.4 * Math.sin(i * 1.3));
    const pulse = 0.55 + 0.45 * Math.sin(time * (0.5 + i * 0.13) + i * 2.1);
    const g = ctx.createLinearGradient(x0, 0, x0 + dx, len);
    g.addColorStop(0, rgba(sh.col, sh.a * pulse));
    g.addColorStop(0.7, rgba(sh.col, sh.a * 0.3 * pulse));
    g.addColorStop(1, rgba(sh.col, 0));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(x0 - w0, -4);
    ctx.lineTo(x0 + w0, -4);
    ctx.lineTo(x0 + dx + w1, len);
    ctx.lineTo(x0 + dx - w1, len);
    ctx.closePath();
    ctx.fill();
  }
  // ground mist: wide soft ellipses sliding slowly
  const m = rig.mist;
  const sp = specs(`mist${world}`, m.n);
  for (let i = 0; i < (pskip('mist') ? 0 : m.n); i++) {
    const p = sp[i];
    const w = vw * (0.55 + p.d * 0.5);
    const x = wrap01(p.x + (time * m.speed * p.vx) / (vw + w) - camX * 0.00018 * (0.6 + p.d)) * (vw + w) - w * 0.5;
    const y = vh * (m.y + (p.y - 0.5) * 0.14) + Math.sin(time * 0.2 + p.ph) * 6;
    const h = vh * 0.1 * (0.7 + p.d);
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(1, h / w);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, w * 0.5);
    g.addColorStop(0, rgba(m.col, m.a));
    g.addColorStop(1, rgba(m.col, 0));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, w * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

/** drawn over the playfield with the foreground leaves: pollen, dust, spores drifting in the light */
export function polishFront(ctx: CanvasRenderingContext2D, rig: Rig, world: number, camX: number, vw: number, vh: number, time: number) {
  const mo = rig.motes;
  if (mo.kind === 'none' || mo.n <= 0 || pskip('motes')) return;
  const sp = specs(`mote${world}`, mo.n);
  ctx.save();
  for (let i = 0; i < mo.n; i++) {
    const p = sp[i];
    // nearer motes (d→1) are bigger, brighter, and slide faster against the camera
    const x = wrap01(p.x + time * 0.004 * p.vx * (mo.kind === 'spore' ? 0.5 : 1) - camX * 0.0006 * p.d) * vw;
    const y = wrap01(p.y - (time * mo.rise * 0.0012) * (0.5 + p.d) + Math.sin(time * 0.6 * p.vx + p.ph) * 0.006) * vh;
    const tw = 0.55 + 0.45 * Math.sin(time * (0.8 + p.vx) + p.ph);
    const r = mo.size * (0.7 + p.d * 1.8);
    const a = mo.a * tw * (0.35 + p.d * 0.65);
    // a soft halo then a bright core
    ctx.fillStyle = rgba(mo.col, a * 0.22);
    ctx.beginPath();
    ctx.arc(x, y, r * 2.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = rgba(mo.col, a);
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// ───────────────────────────── character lighting ─────────────────────────────

/** the top of whatever the character would land on: undefined if there is nothing under them */
export function groundUnder(platforms: readonly Platform[], x: number, feetY: number, maxDrop = 420): number | undefined {
  let best: number | undefined;
  for (const p of platforms) {
    if (p.broken) continue;
    if (x < p.x - 4 || x > p.x + p.width + 4) continue;
    const d = p.y - feetY;
    if (d < -8 || d > maxDrop) continue;
    if (best === undefined || p.y < best) best = p.y;
  }
  return best;
}

/**
 * A soft shadow on the ground under a character: a wide cast shadow thrown away from the light and a darker contact core.
 * It shrinks and fades as they leave the ground, so it is also a jump-height cue.
 */
export function drawGroundShadow(ctx: CanvasRenderingContext2D, rig: Rig, platforms: readonly Platform[], x: number, feetY: number, halfW: number, strength = 1) {
  const top = groundUnder(platforms, x, feetY);
  if (top === undefined) return;
  const h = Math.max(0, top - feetY);
  const k = 1 - Math.min(1, h / 380);
  const w = halfW * (0.65 + 0.35 * k);
  const a = rig.shadowA * strength * (0.25 + 0.75 * k);
  const blob = (cx: number, rx: number, ry: number, alpha: number) => {
    ctx.save();
    ctx.translate(cx, top + 3);
    ctx.scale(1, ry / rx);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
    g.addColorStop(0, rgba(rig.shadow, alpha));
    g.addColorStop(0.7, rgba(rig.shadow, alpha * 0.85));
    g.addColorStop(1, rgba(rig.shadow, 0));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, rx, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };
  // cast: thrown away from the light, longer when the light is low
  blob(x - rig.lx * w * 0.5, w * 1.5, w * 0.27, a * 0.6);
  // contact
  blob(x, w * 1.0, w * 0.26, Math.min(0.85, a * 1.25));
}

/** a warm glow behind a character, so they lift off the backdrop */
export function drawBackGlow(ctx: CanvasRenderingContext2D, rig: Rig, x: number, y: number, r: number, a = 0.16) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, rgba(rig.glow, a));
  g.addColorStop(1, rgba(rig.glow, 0));
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
}

interface Off {
  cv: HTMLCanvasElement;
  c: CanvasRenderingContext2D;
}
let offA: Off | null = null;
let offB: Off | null = null;
function off(slot: 'a' | 'b', w: number, h: number): Off {
  let o = slot === 'a' ? offA : offB;
  if (!o) {
    const cv = document.createElement('canvas');
    o = { cv, c: cv.getContext('2d')! };
    if (slot === 'a') offA = o;
    else offB = o;
  }
  if (o.cv.width !== w || o.cv.height !== h) {
    o.cv.width = w;
    o.cv.height = h;
  }
  return o;
}

const BOX_W = 280;
const BOX_UP = 210;
const BOX_DOWN = 70;

/**
 * Draw a character through an offscreen pass so a rim of the world's light can catch the edge facing the sun.
 * `draw` must paint with absolute world coordinates onto the context it is given (it is, for the hero).
 * `scale` is pixels per logical unit of the main canvas.
 */
export function drawLit(ctx: CanvasRenderingContext2D, rig: Rig, scale: number, x: number, feetY: number, draw: (c: CanvasRenderingContext2D) => void) {
  const px = Math.max(1, scale);
  const W = Math.ceil(BOX_W * px);
  const Hh = Math.ceil((BOX_UP + BOX_DOWN) * px);
  const A = off('a', W, Hh);
  const B = off('b', W, Hh);
  const ox = x - BOX_W / 2;
  const oy = feetY - BOX_UP;
  A.c.setTransform(1, 0, 0, 1, 0, 0);
  A.c.clearRect(0, 0, W, Hh);
  A.c.setTransform(px, 0, 0, px, -ox * px, -oy * px);
  draw(A.c);
  A.c.setTransform(1, 0, 0, 1, 0, 0);

  ctx.drawImage(A.cv, ox, oy, BOX_W, BOX_UP + BOX_DOWN);

  // rim = silhouette tinted with the sun colour, minus the silhouette pushed away from the light
  B.c.setTransform(1, 0, 0, 1, 0, 0);
  B.c.globalCompositeOperation = 'source-over';
  B.c.clearRect(0, 0, W, Hh);
  B.c.drawImage(A.cv, 0, 0);
  B.c.globalCompositeOperation = 'source-in';
  B.c.fillStyle = rig.rim;
  B.c.fillRect(0, 0, W, Hh);
  B.c.globalCompositeOperation = 'destination-out';
  B.c.drawImage(A.cv, -rig.lx * 4.2 * px, 3 * px);
  B.c.globalCompositeOperation = 'source-over';
  const prev = ctx.globalAlpha;
  ctx.globalAlpha = prev * rig.rimA;
  ctx.drawImage(B.cv, ox, oy, BOX_W, BOX_UP + BOX_DOWN);
  ctx.globalAlpha = prev;
}

// ───────────────────────────── glow and depth ─────────────────────────────

let bloomA: Off | null = null;
let bloomTick = 0;
let bloomB: Off | null = null;
/**
 * A soft bloom over the finished frame: shrink the picture, square it (so only the bright parts survive), and lay it back over
 * the sharp frame, stretched with smoothing. Cheap: everything but the final blit happens on a ~1/6-size canvas.
 * `ctx` must be the main canvas context, already scaled to logical units (vw × vh).
 */
export function drawBloom(ctx: CanvasRenderingContext2D, rig: Rig, vw: number, vh: number) {
  if (pskip('bloom')) return;
  const src = ctx.canvas;
  const bw = Math.max(48, Math.round(vw / 6));
  const bh = Math.max(32, Math.round(vh / 6));
  if (!bloomA) bloomA = { cv: document.createElement('canvas'), c: null as unknown as CanvasRenderingContext2D };
  if (!bloomB) bloomB = { cv: document.createElement('canvas'), c: null as unknown as CanvasRenderingContext2D };
  for (const o of [bloomA, bloomB]) {
    if (o.cv.width !== bw || o.cv.height !== bh) {
      o.cv.width = bw;
      o.cv.height = bh;
    }
    o.c = o.c ?? o.cv.getContext('2d')!;
  }
  // the soft copy only needs refreshing every few frames: it is blurry, and reading the whole canvas back is the one costly step
  if (bloomTick++ % 3 === 0) {
    const a = bloomA.c;
    const b = bloomB.c;
    a.globalCompositeOperation = 'copy';
    a.imageSmoothingEnabled = true;
    a.imageSmoothingQuality = 'high';
    a.drawImage(src, 0, 0, src.width, src.height, 0, 0, bw, bh);
    // square it twice: bright stays bright, mid-tones sink
    b.globalCompositeOperation = 'copy';
    b.drawImage(bloomA.cv, 0, 0);
    b.globalCompositeOperation = 'multiply';
    b.drawImage(bloomA.cv, 0, 0);
    b.drawImage(bloomB.cv, 0, 0);
    b.globalCompositeOperation = 'source-over';
  }
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.globalAlpha = rig.bloom * 2;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(bloomB.cv, 0, 0, vw, vh);
  ctx.restore();
}
