/**
 * artKit — the shared drawing vocabulary for every scene in the game.
 *
 * One house style: soft gradient-shaded shapes (light from the upper left, a hue-shifted
 * shadow side, a bright rim), no hard outlines on scenery. Anything the player stands on
 * or grabs gets a dark outline in terrain.ts so it always reads against the backdrop.
 */

import { drawBloom, pickBloom, monstera, bananaLeaf } from './flora.ts';

/** a seeded random source; `state`/`seek` let a caller note where the sequence is and jump back to it (so a thing can be drawn on its own, with the same dice) */
export type RNG = (() => number) & { state?: () => number; seek?: (s: number) => void };

export function rng(seed: number): RNG {
  let a = (seed | 0) + 0x6d2b79f5;
  const f = (() => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }) as RNG;
  f.state = () => a;
  f.seek = (s: number) => {
    a = s | 0;
  };
  return f;
}

export function hex2rgb(h: string): [number, number, number] {
  let s = h.replace('#', '');
  if (s.length === 3) s = s.split('').map((c) => c + c).join('');
  const n = parseInt(s, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function mixHex(a: string, b: string, t: number): string {
  const A = hex2rgb(a);
  const B = hex2rgb(b);
  const c = (i: number) => Math.round(A[i] + (B[i] - A[i]) * t);
  return `rgb(${c(0)},${c(1)},${c(2)})`;
}

// mixHex returns rgb(); these accept hex or rgb() output by normalising first.
function norm(c: string): string {
  if (c.startsWith('#')) return c;
  const m = c.match(/rgb\((\d+),(\d+),(\d+)\)/);
  if (!m) return '#808080';
  const h = (v: string) => Number(v).toString(16).padStart(2, '0');
  return `#${h(m[1])}${h(m[2])}${h(m[3])}`;
}

/** blend two colours and return plain #rrggbb (safe to append alpha digits to) */
export function mixToHex(a: string, b: string, t: number): string {
  const A = hex2rgb(norm(a));
  const B = hex2rgb(norm(b));
  const c = (i: number) => Math.round(A[i] + (B[i] - A[i]) * t).toString(16).padStart(2, '0');
  return `#${c(0)}${c(1)}${c(2)}`;
}

export const lighten = (c: string, t: number) => mixHex(norm(c), '#ffffff', t);
export const darken = (c: string, t: number) => mixHex(norm(c), '#000000', t);
export const mix = (a: string, b: string, t: number) => mixHex(norm(a), norm(b), t);

export function rgba(c: string, a: number): string {
  const [r, g, b] = hex2rgb(norm(c));
  return `rgba(${r},${g},${b},${a})`;
}

export interface Tone {
  hi: string;
  light: string;
  mid: string;
  dark: string;
  deep: string;
}

/** Build a five-step tone ramp from one base colour. `shadow` hue-shifts the dark side. */
export function tone(base: string, shadow = '#10203c'): Tone {
  // kept: platforms and props ask for the same few ramps every frame (the ramp is never changed by a caller)
  let byBase = tones.get(shadow);
  if (!byBase) tones.set(shadow, (byBase = new Map()));
  let t = byBase.get(base);
  if (t) return t;
  const b = norm(base);
  t = {
    hi: lighten(b, 0.62),
    light: lighten(b, 0.28),
    mid: b,
    dark: mix(darken(b, 0.18), shadow, 0.28),
    deep: mix(darken(b, 0.45), shadow, 0.42),
  };
  if (byBase.size >= 256) byBase.clear();
  byBase.set(base, t);
  return t;
}
const tones = new Map<string, Map<string, Tone>>();

/**
 * A gradient kept by the numbers that shape it (PERFORMANCE-RULES §2.3: none made per frame). `key` is a whole number built from them,
 * `make` builds it the first time; drawn in its own local space (after a translate), one gradient serves every place it stands.
 */
export function keptGradient(owner: object, key: number, make: () => CanvasGradient): CanvasGradient {
  let m = keptGrads.get(owner);
  if (!m) keptGrads.set(owner, (m = new Map()));
  let g = m.get(key);
  if (!g) {
    if (m.size >= 512) m.clear();
    m.set(key, (g = make()));
  }
  return g;
}
const keptGrads = new WeakMap<object, Map<number, CanvasGradient>>();

/**
 * The scale a picture is baked at for a draw at `k` device px a unit: the next step up on a ladder of square roots of 2, so a camera zoom
 * or a quality step inside one step reuses the bake (drawn 0.71-1x, never enlarged) instead of baking again in the middle of play.
 */
export function bakeStep(k: number): number {
  return k > 0 ? Math.pow(2, Math.ceil(Math.log2(k) * 2 - 1e-9) / 2) : 1;
}

/** a world rectangle (what the canvas shows: viewRect) */
export interface ViewRect {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}
/**
 * The world rectangle the canvas shows under ctx's current transform, grown by `margin`, written into `out` (kept by the caller, so
 * nothing is made per frame). A rotated or skewed transform (a shake, a lean) leaves `out` as everything, so nothing is culled by mistake.
 */
export function viewRect(ctx: CanvasRenderingContext2D, out: ViewRect, margin = 0): ViewRect {
  const m = typeof ctx.getTransform === 'function' ? ctx.getTransform() : null;
  if (!m || m.b !== 0 || m.c !== 0 || m.a <= 0 || m.d <= 0) {
    out.x0 = out.y0 = -Infinity;
    out.x1 = out.y1 = Infinity;
    return out;
  }
  out.x0 = -m.e / m.a - margin;
  out.x1 = (ctx.canvas.width - m.e) / m.a + margin;
  out.y0 = -m.f / m.d - margin;
  out.y1 = (ctx.canvas.height - m.f) / m.d + margin;
  return out;
}

export function tau(n: number) {
  return n * Math.PI * 2;
}

/** Foliage mass: cel-shaded lobes (shadow, body, light) with a few leaf marks. The workhorse of every canopy. */
export function drawCrown(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  t: Tone,
  r: RNG,
  lobes = 11,
  flecks = true
) {
  const circles: Array<[number, number, number]> = [];
  const m = Math.min(rx, ry);
  for (let i = 0; i < lobes; i++) {
    const a = (i / lobes) * Math.PI * 2 + r() * 0.5;
    const d = 0.5 + 0.35 * r();
    circles.push([cx + Math.cos(a) * rx * d * 0.62, cy + Math.sin(a) * ry * d * 0.62, m * (0.34 + 0.2 * r())]);
  }
  circles.push([cx, cy - ry * 0.08, m * 0.62]);
  circles.push([cx - rx * 0.28, cy - ry * 0.2, m * 0.45]);

  const disc = (x: number, y: number, rad: number) => {
    ctx.beginPath();
    ctx.arc(x, y, rad, 0, Math.PI * 2);
    ctx.fill();
  };
  // 1. shadow silhouette
  ctx.fillStyle = t.dark;
  for (const [x, y, rad] of circles) disc(x + rad * 0.04, y + rad * 0.1, rad * 1.04);
  // 2. body
  ctx.fillStyle = t.mid;
  for (const [x, y, rad] of circles) disc(x - rad * 0.05, y - rad * 0.07, rad * 0.9);
  // 3. light side
  ctx.fillStyle = t.light;
  for (const [x, y, rad] of circles) {
    if (y > cy + ry * 0.18) continue;
    disc(x - rad * 0.18, y - rad * 0.24, rad * 0.62);
  }
  // 4. hot highlights
  ctx.strokeStyle = t.hi;
  ctx.globalAlpha = 0.6;
  ctx.lineCap = 'round';
  ctx.lineWidth = Math.max(1.5, m * 0.03);
  for (const [x, y, rad] of circles) {
    if (y > cy - ry * 0.05) continue;
    ctx.beginPath();
    ctx.arc(x - rad * 0.1, y - rad * 0.12, rad * 0.78, Math.PI * 1.12, Math.PI * 1.5);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  if (flecks) {
    const n = Math.round(m * 0.22);
    for (let i = 0; i < n; i++) {
      const a = r() * Math.PI * 2;
      const d = Math.sqrt(r()) * 0.85;
      const x = cx + Math.cos(a) * rx * d;
      const y = cy + Math.sin(a) * ry * d;
      const up = y < cy - ry * 0.05;
      ctx.fillStyle = up ? t.hi : t.deep;
      ctx.globalAlpha = up ? 0.5 : 0.4;
      const len = m * (0.05 + r() * 0.05);
      ctx.beginPath();
      ctx.ellipse(x, y, len, len * 0.38, -0.8 + r() * 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}

/** Palm / fern frond: a curved rib with tapering leaflets. */
export function drawFrond(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  len: number,
  ang: number,
  droop: number,
  t: Tone,
  leaflets = 14,
  width = 0.28
) {
  const tx = x + Math.cos(ang) * len;
  const ty = y + Math.sin(ang) * len + droop;
  const cx = x + Math.cos(ang) * len * 0.55;
  const cy = y + Math.sin(ang) * len * 0.55 - droop * 0.8;
  const at = (u: number): [number, number, number] => {
    const mx = (1 - u) * (1 - u) * x + 2 * (1 - u) * u * cx + u * u * tx;
    const my = (1 - u) * (1 - u) * y + 2 * (1 - u) * u * cy + u * u * ty;
    const dx = 2 * (1 - u) * (cx - x) + 2 * u * (tx - cx);
    const dy = 2 * (1 - u) * (cy - y) + 2 * u * (ty - cy);
    return [mx, my, Math.atan2(dy, dx)];
  };
  for (let side = -1; side <= 1; side += 2) {
    for (let i = 1; i <= leaflets; i++) {
      const u = i / (leaflets + 1);
      const [px, py, a] = at(u);
      const ll = len * width * Math.sin(Math.PI * Math.min(1, u * 0.9 + 0.12)) * (1 - u * 0.3);
      const la = a + side * (1.1 - u * 0.45);
      const ex = px + Math.cos(la) * ll;
      const ey = py + Math.sin(la) * ll + ll * 0.18;
      const g = ctx.createLinearGradient(px, py, ex, ey);
      g.addColorStop(0, side < 0 ? t.light : t.mid);
      g.addColorStop(1, side < 0 ? t.mid : t.dark);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.quadraticCurveTo((px + ex) / 2 + Math.cos(la - side * 1.57) * ll * 0.16, (py + ey) / 2 + Math.sin(la - side * 1.57) * ll * 0.16, ex, ey);
      ctx.quadraticCurveTo((px + ex) / 2 + Math.cos(la + side * 1.57) * ll * 0.1, (py + ey) / 2 + Math.sin(la + side * 1.57) * ll * 0.1, px, py);
      ctx.fill();
    }
  }
  ctx.strokeStyle = t.deep;
  ctx.lineWidth = Math.max(1.5, len * 0.018);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(cx, cy, tx, ty);
  ctx.stroke();
}

/** Split-leaf monstera with real slits and holes (see flora.ts). */
export function drawMonstera(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, rot: number, t: Tone, _veins = true) {
  monstera(ctx, x, y + size * 0.1, size * 1.05, rot, t, rng((x * 73 + y * 131 + size * 7) | 0));
}

/** Broad banana / heliconia leaf, torn along its veins (see flora.ts). */
export function drawBananaLeaf(ctx: CanvasRenderingContext2D, x: number, y: number, len: number, wid: number, rot: number, t: Tone) {
  bananaLeaf(ctx, x, y, len, wid, rot, t, rng((x * 53 + y * 97 + len * 5) | 0));
}

/** Spiky grass tuft. */
export function drawGrass(ctx: CanvasRenderingContext2D, x: number, y: number, h: number, t: Tone, r: RNG, blades = 7) {
  for (let i = 0; i < blades; i++) {
    const k = i / (blades - 1) - 0.5;
    const bh = h * (0.6 + r() * 0.5) * (1 - Math.abs(k) * 0.6);
    const bx = x + k * h * 0.9;
    const lean = k * h * 0.7 + (r() - 0.5) * h * 0.2;
    ctx.fillStyle = i % 2 ? t.mid : t.light;
    ctx.beginPath();
    ctx.moveTo(bx - h * 0.07, y);
    ctx.quadraticCurveTo(bx + lean * 0.3, y - bh * 0.6, bx + lean, y - bh);
    ctx.quadraticCurveTo(bx + lean * 0.35 + h * 0.03, y - bh * 0.5, bx + h * 0.07, y);
    ctx.fill();
  }
}

/** A flower head: the species is picked from its size and position, so scenes bloom with variety (see flora.ts). */
export function drawFlower(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rad: number,
  petal: string,
  core: string,
  rot = 0,
  _petals = 5
) {
  const key = Math.round(x * 0.37 + y * 0.91);
  const kind = pickBloom(rad, key);
  // a flower head is drawn petal by petal, each petal clipped and shaded, and the same ones stand on the same ledges for the whole stage.
  // So each is painted once into a small picture, at the density it is shown at, and drawn as a picture from then on
  if (ctx.globalAlpha === 1) {
    const t = ctx.getTransform();
    const dens = Math.max(1, Math.min(3, Math.ceil(Math.hypot(t.a, t.b) - 0.05)));
    const id = `${key}|${rad}|${petal}|${core}|${rot}|${dens}`;
    let pic = flowerPics.get(id);
    if (pic) {
      flowerPics.delete(id); // most recently used goes last
      flowerPics.set(id, pic);
    } else {
      const pad = rad * FLOWER_PAD;
      const n = Math.ceil(2 * pad * dens);
      const cv = document.createElement('canvas');
      cv.width = cv.height = n;
      const g = cv.getContext('2d');
      if (g) {
        g.scale(dens, dens);
        g.translate(pad, pad);
        drawBloom(g, kind, 0, 0, rad, petal, core, rot, rng(key | 0));
      }
      pic = { cv, pad, size: n / dens };
      flowerPics.set(id, pic);
      if (flowerPics.size > FLOWER_PICS_MAX) flowerPics.delete(flowerPics.keys().next().value as string);
    }
    ctx.drawImage(pic.cv, x - pic.pad, y - pic.pad, pic.size, pic.size);
    return;
  }
  drawBloom(ctx, kind, x, y, rad, petal, core, rot, rng(key | 0));
}

/** the painted flower heads kept so far (see drawFlower): enough for everything on screen, the least recently used go first */
const flowerPics = new Map<string, { cv: HTMLCanvasElement; pad: number; size: number }>();
const FLOWER_PICS_MAX = 110;
/** how far a head reaches from its middle, in its own radius: measured at 1.2 for every species the ledges use, so this leaves a margin */
const FLOWER_PAD = 1.6;

/** Toadstool, optionally glowing. Drawn about its foot, so its gradients are kept by size and colour, not made each frame. */
export function drawMushroom(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, cap: string, spot: string, glow = false) {
  const ct = tone(cap, '#2a0a30');
  const key = Math.round(s * 64);
  ctx.translate(x, y);
  if (glow) {
    const g = keptGradient(ct, -1 - key, () => {
      const gr = ctx.createRadialGradient(0, -s * 0.7, s * 0.2, 0, -s * 0.7, s * 2.4);
      gr.addColorStop(0, ct.hi + '');
      gr.addColorStop(1, 'rgba(0,0,0,0)');
      return gr;
    });
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, -s * 0.7, s * 2.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  ctx.fillStyle = keptGradient(MUSH_STEM, key, () => {
    const sg = ctx.createLinearGradient(-s * 0.3, 0, s * 0.3, 0);
    sg.addColorStop(0, '#fff6e0');
    sg.addColorStop(1, '#d8c39a');
    return sg;
  });
  ctx.beginPath();
  ctx.moveTo(-s * 0.22, 0);
  ctx.quadraticCurveTo(-s * 0.16, -s * 0.5, -s * 0.2, -s * 0.75);
  ctx.lineTo(s * 0.2, -s * 0.75);
  ctx.quadraticCurveTo(s * 0.16, -s * 0.5, s * 0.22, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = keptGradient(ct, key, () => {
    const cg = ctx.createRadialGradient(-s * 0.25, -s * 1.15, s * 0.1, 0, -s * 0.7, s * 0.95);
    cg.addColorStop(0, ct.light);
    cg.addColorStop(0.55, ct.mid);
    cg.addColorStop(1, ct.dark);
    return cg;
  });
  ctx.beginPath();
  ctx.ellipse(0, -s * 0.72, s * 0.78, s * 0.52, 0, Math.PI, 0);
  ctx.quadraticCurveTo(0, -s * 0.6, -s * 0.78, -s * 0.72);
  ctx.fill();
  ctx.fillStyle = spot;
  for (let i = 0; i < 9; i += 3) {
    const dr = MUSH_SPOTS[i + 2];
    ctx.beginPath();
    ctx.ellipse(MUSH_SPOTS[i] * s, MUSH_SPOTS[i + 1] * s, dr * s, dr * s * 0.75, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.translate(-x, -y);
}
const MUSH_STEM = {};
/** the cap's three spots: x, y and radius in the toadstool's size */
const MUSH_SPOTS = [-0.35, -1.0, 0.1, 0.1, -1.12, 0.13, 0.4, -0.92, 0.09];

/** Rounded boulder with a lit top-left. */
export function drawRock(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, t: Tone, outline?: string) {
  const g = ctx.createLinearGradient(x - w * 0.4, y - h, x + w * 0.4, y);
  g.addColorStop(0, t.light);
  g.addColorStop(0.5, t.mid);
  g.addColorStop(1, t.dark);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(x - w / 2, y);
  ctx.quadraticCurveTo(x - w * 0.55, y - h * 0.8, x - w * 0.2, y - h);
  ctx.quadraticCurveTo(x + w * 0.25, y - h * 1.05, x + w * 0.5, y - h * 0.45);
  ctx.quadraticCurveTo(x + w * 0.56, y - h * 0.1, x + w / 2, y);
  ctx.closePath();
  ctx.fill();
  if (outline) {
    ctx.strokeStyle = outline;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  ctx.fillStyle = t.hi;
  ctx.globalAlpha = 0.45;
  ctx.beginPath();
  ctx.ellipse(x - w * 0.18, y - h * 0.72, w * 0.16, h * 0.1, -0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

/** Puffy cloud sprite, lit from above. */
export function drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, top: string, bottom: string, r: RNG) {
  const puffs: Array<[number, number, number]> = [];
  const n = 6 + Math.floor(r() * 3);
  for (let i = 0; i < n; i++) {
    const k = i / (n - 1);
    puffs.push([x + (k - 0.5) * s * 1.9, y - Math.sin(k * Math.PI) * s * 0.34 - r() * s * 0.08, s * (0.26 + Math.sin(k * Math.PI) * 0.22)]);
  }
  ctx.fillStyle = bottom;
  for (const [px, py, pr] of puffs) {
    ctx.beginPath();
    ctx.arc(px, py + pr * 0.28, pr, 0, Math.PI * 2);
    ctx.fill();
  }
  for (const [px, py, pr] of puffs) {
    const g = ctx.createLinearGradient(0, py - pr, 0, py + pr);
    g.addColorStop(0, top);
    g.addColorStop(1, bottom);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(px, py, pr * 0.94, 0, Math.PI * 2);
    ctx.fill();
  }
  // flat base
  ctx.fillStyle = bottom;
  ctx.globalAlpha = 0.5;
  ctx.fillRect(x - s * 0.95, y + s * 0.2, s * 1.9, s * 0.06);
  ctx.globalAlpha = 1;
}

/** Angled god-rays from the top of the frame. */
export function drawRays(ctx: CanvasRenderingContext2D, w: number, h: number, col: string, alpha: number, r: RNG, count = 7, lean = 0.32) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < count; i++) {
    const x = (i / count) * w + r() * (w / count);
    const bw = 40 + r() * 110;
    const len = h * (0.7 + r() * 0.5);
    const g = ctx.createLinearGradient(x, 0, x + len * lean, len);
    g.addColorStop(0, rgba(col, alpha * (0.5 + r() * 0.7)));
    g.addColorStop(1, rgba(col, 0));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(x, -10);
    ctx.lineTo(x + bw, -10);
    ctx.lineTo(x + bw + len * lean + bw * 0.8, len);
    ctx.lineTo(x + len * lean, len);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

/** Hanging liana strand with leaves (backdrop version, no outline). */
export function drawLiana(ctx: CanvasRenderingContext2D, x: number, y: number, len: number, t: Tone, r: RNG, flower?: string) {
  const sway = (r() - 0.5) * 30;
  ctx.strokeStyle = t.deep;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.bezierCurveTo(x + sway, y + len * 0.3, x - sway, y + len * 0.65, x + sway * 0.4, y + len);
  ctx.stroke();
  const n = Math.floor(len / 26);
  for (let i = 1; i <= n; i++) {
    const u = i / (n + 1);
    const px = x + sway * 0.4 * u + Math.sin(u * 5) * sway * 0.25;
    const py = y + len * u;
    const side = i % 2 ? 1 : -1;
    const g = ctx.createLinearGradient(px, py, px + side * 18, py + 8);
    g.addColorStop(0, t.light);
    g.addColorStop(1, t.mid);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(px + side * 9, py + 3, 10, 5, side * 0.6 + 0.4, 0, Math.PI * 2);
    ctx.fill();
  }
  if (flower) drawFlower(ctx, x + sway * 0.4, y + len, 9, flower, '#fff2a8', r() * 3);
}

export function ellipsePath(ctx: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, rot = 0) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2);
}
