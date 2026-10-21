/**
 * platformKit — small drawing helpers shared by the platform painters (thinArt, spanArt, groundArt).
 *
 * Everything draws in platform space: (0,0) is the top-left of the platform's collision box, so the line y = 0 is exactly
 * where Pokey's feet rest. Painters may reach above it (leaf tips, posts) but the lit lip is always laid on y = 0.
 */
import { rgba, mixToHex, lighten, darken, type RNG, type Tone } from './artKit.ts';
import type { Palette } from './platformPalette.ts';
import type { Look } from './scenery.ts';

export type C = CanvasRenderingContext2D;

/** what a painter is told about the platform it paints */
export interface Art {
  c: C;
  /** width and height of the collision box */
  w: number;
  h: number;
  pal: Palette;
  look: Look;
  world: number;
  r: RNG;
  /** variant within the look */
  v: number;
  id: number;
  /** 1 or -1: which way the asymmetric parts lean (thick end of a limb, hollow end of a log) */
  side: 1 | -1;
}

export const LW = 2.6;

export function rrPath(c: C, x: number, y: number, w: number, h: number, r: number | [number, number, number, number]) {
  c.beginPath();
  c.roundRect(x, y, w, h, r);
}

export function fillStroke(c: C, fill: string | CanvasGradient | CanvasPattern, ol: string, lw = LW) {
  c.fillStyle = fill;
  c.fill();
  c.lineJoin = 'round';
  c.lineCap = 'round';
  c.strokeStyle = ol;
  c.lineWidth = lw;
  c.stroke();
}

/** a vertical gradient from y0 to y1 */
export function vgrad(c: C, y0: number, y1: number, stops: Array<[number, string]>): CanvasGradient {
  const g = c.createLinearGradient(0, y0, 0, y1);
  for (const [t, col] of stops) g.addColorStop(t, col);
  return g;
}

export function hgrad(c: C, x0: number, x1: number, stops: Array<[number, string]>): CanvasGradient {
  const g = c.createLinearGradient(x0, 0, x1, 0);
  for (const [t, col] of stops) g.addColorStop(t, col);
  return g;
}

/** the lit lip: the line the hero stands on. A bright strip on y = 0 with a pale hairline on top. */
export function litLip(a: Art, x0: number, x1: number, color: string, thick = 3.2, y = 0) {
  const c = a.c;
  c.save();
  c.lineCap = 'round';
  c.strokeStyle = color;
  c.lineWidth = thick;
  c.beginPath();
  c.moveTo(x0, y + thick / 2);
  c.lineTo(x1, y + thick / 2);
  c.stroke();
  c.strokeStyle = 'rgba(255,255,255,0.5)';
  c.lineWidth = 1;
  c.beginPath();
  c.moveTo(x0 + 1, y + 0.8);
  c.lineTo(x1 - 1, y + 0.8);
  c.stroke();
  c.restore();
}

/**
 * A blanket of moss (or grass, or ash-lichen: whatever the world's cap is) along the top edge, from x0 to x1: flat on
 * top, scalloped below with a few drips. The lit lip is laid over its upper edge.
 */
export function mossBlanket(a: Art, x0: number, x1: number, thick: number, drip = 5, lipColor?: string, y = 0) {
  const { c, pal, r } = a;
  const m = pal.moss;
  c.beginPath();
  c.moveTo(x0, y - 0.5);
  c.lineTo(x1, y - 0.5);
  const n = Math.max(3, Math.round((x1 - x0) / 14));
  const seg = (x1 - x0) / n;
  for (let i = 0; i < n; i++) {
    const xa = x1 - i * seg;
    const xb = xa - seg;
    const d = thick + (r() > 0.6 ? drip * (0.6 + r() * 0.8) : r() * 2);
    c.quadraticCurveTo(xa - seg * 0.1, y + d * 0.9, xa - seg * 0.5, y + d);
    c.quadraticCurveTo(xb + seg * 0.1, y + d * 0.9, xb, y + thick * 0.6);
  }
  c.closePath();
  c.fillStyle = vgrad(c, y, y + thick + drip, [[0, m.light], [0.5, m.mid], [1, m.dark]]);
  c.fill();
  c.strokeStyle = rgba(m.deep, 0.75);
  c.lineWidth = 1.3;
  c.lineJoin = 'round';
  c.stroke();
  litLip(a, x0 + 1, x1 - 1, lipColor ?? pal.lip.moss, 3, y - 0.2);
}

/** a leaf: pointed, with a midrib and a pale sheen */
export function leafAt(c: C, x: number, y: number, len: number, wid: number, rot: number, t: Tone, ol: string, lw = 1.8) {
  c.save();
  c.translate(x, y);
  c.rotate(rot);
  c.beginPath();
  c.moveTo(0, 0);
  c.quadraticCurveTo(len * 0.38, -wid, len, 0);
  c.quadraticCurveTo(len * 0.38, wid, 0, 0);
  c.fillStyle = t.mid;
  c.fill();
  c.lineJoin = 'round';
  c.strokeStyle = ol;
  c.lineWidth = lw;
  c.stroke();
  c.fillStyle = rgba(t.hi, 0.55);
  c.beginPath();
  c.ellipse(len * 0.42, -wid * 0.32, len * 0.22, wid * 0.16, -0.08, 0, Math.PI * 2);
  c.fill();
  c.strokeStyle = rgba(t.deep, 0.55);
  c.lineWidth = 1;
  c.beginPath();
  c.moveTo(len * 0.08, 0);
  c.lineTo(len * 0.84, 0);
  c.stroke();
  c.restore();
}

/** a fan of leaves from one point */
export function leafFan(a: Art, x: number, y: number, n: number, len: number, baseAng: number, spread: number, t?: Tone) {
  const { c, pal, r } = a;
  const tn = t ?? pal.leaf;
  for (let i = 0; i < n; i++) {
    const u = n === 1 ? 0.5 : i / (n - 1);
    const ang = baseAng + (u - 0.5) * spread + (r() - 0.5) * 0.18;
    const l = len * (0.78 + r() * 0.4);
    leafAt(c, x, y, l, l * 0.3, ang, i % 2 ? tn : { ...tn, mid: tn.light }, pal.outline, 1.6);
  }
}

/** a hanging vine with a couple of leaves */
export function hangVine(a: Art, x: number, y: number, len: number, sway = 0.5) {
  const { c, pal, r } = a;
  const dx = (r() - 0.5) * 8 * sway;
  c.lineCap = 'round';
  for (const [col, lw] of [[pal.outline, 3.8], [pal.vine.mid, 2.2]] as const) {
    c.strokeStyle = col;
    c.lineWidth = lw;
    c.beginPath();
    c.moveTo(x, y);
    c.quadraticCurveTo(x + dx, y + len * 0.5, x + dx * 0.4, y + len);
    c.stroke();
  }
  if (len > 14) {
    leafAt(c, x + dx * 0.3, y + len * 0.55, 8 + r() * 4, 3.4, 0.7 + r() * 0.5, pal.leaf, pal.outline, 1.4);
    leafAt(c, x + dx * 0.4, y + len * 0.8, 7 + r() * 4, 3, Math.PI - 0.7 - r() * 0.5, pal.leaf, pal.outline, 1.4);
  }
}

/** a jagged crack from (x,y) heading roughly along `ang` */
export function crackLine(c: C, x: number, y: number, len: number, ang: number, r: RNG, col: string, lw = 1.6) {
  c.strokeStyle = col;
  c.lineWidth = lw;
  c.lineCap = 'round';
  c.lineJoin = 'round';
  c.beginPath();
  c.moveTo(x, y);
  const steps = Math.max(3, Math.round(len / 6));
  let px = x;
  let py = y;
  for (let i = 1; i <= steps; i++) {
    const a2 = ang + (r() - 0.5) * 1.1;
    const l = len / steps;
    px += Math.cos(a2) * l;
    py += Math.sin(a2) * l;
    c.lineTo(px, py);
  }
  c.stroke();
}

/** a soft glow (cheap: one radial gradient) */
export function glowAt(c: C, x: number, y: number, rad: number, col: string, a: number) {
  const g = c.createRadialGradient(x, y, 0, x, y, rad);
  g.addColorStop(0, rgba(col, a));
  g.addColorStop(1, rgba(col, 0));
  c.fillStyle = g;
  c.fillRect(x - rad, y - rad, rad * 2, rad * 2);
}

/** a small round stone / pebble */
export function pebble(c: C, x: number, y: number, rx: number, ry: number, t: Tone, ol: string) {
  c.beginPath();
  c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  c.fillStyle = vgrad(c, y - ry, y + ry, [[0, t.light], [1, t.dark]]);
  c.fill();
  c.strokeStyle = rgba(ol, 0.85);
  c.lineWidth = 1.4;
  c.stroke();
}

/** a bracket-fungus half disc hanging off a surface at (x,y), flat side up */
export function bracket(c: C, x: number, y: number, rw: number, rh: number, col: string, ol: string, glow?: string | null) {
  if (glow) glowAt(c, x, y + rh * 0.5, rw * 1.8, glow, 0.35);
  c.beginPath();
  c.moveTo(x - rw, y);
  c.quadraticCurveTo(x - rw * 0.85, y + rh * 1.15, x, y + rh);
  c.quadraticCurveTo(x + rw * 0.85, y + rh * 1.15, x + rw, y);
  c.closePath();
  c.fillStyle = vgrad(c, y, y + rh, [[0, lighten(col, 0.4)], [1, col]]);
  c.fill();
  c.strokeStyle = ol;
  c.lineWidth = 1.6;
  c.lineJoin = 'round';
  c.stroke();
  c.strokeStyle = rgba(ol, 0.35);
  c.lineWidth = 1;
  c.beginPath();
  c.moveTo(x - rw * 0.62, y + 1);
  c.quadraticCurveTo(x, y + rh * 0.72, x + rw * 0.62, y + 1);
  c.stroke();
}

/** darken the lower part of whatever was just filled inside the current clip (call inside save/clip) */
export function underShade(a: Art, y0: number, y1: number, strength = 0.38) {
  const c = a.c;
  c.fillStyle = vgrad(c, y0, y1, [[0, 'rgba(8,4,16,0)'], [1, `rgba(8,4,16,${strength})`]]);
  c.fillRect(-40, y0, a.w + 80, y1 - y0 + 40);
}

/** the tone of ruin stone: world stone, shifted a touch towards the outline so it reads older than a boulder */
export function ruinStone(a: Art): Tone {
  const s = a.pal.stone;
  const k = (c: string) => mixToHex(c, a.pal.outline, 0.1);
  return { hi: k(s.hi), light: k(s.light), mid: k(s.mid), dark: k(s.dark), deep: k(s.deep) };
}

export { rgba, mixToHex, lighten, darken };
