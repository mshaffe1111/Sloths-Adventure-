/**
 * artKit — the shared drawing vocabulary for every scene in the game.
 *
 * One house style: soft gradient-shaded shapes (light from the upper left, a hue-shifted
 * shadow side, a bright rim), no hard outlines on scenery. Anything the player stands on
 * or grabs gets a dark outline in terrain.ts so it always reads against the backdrop.
 */

export type RNG = () => number;

export function rng(seed: number): RNG {
  let a = (seed | 0) + 0x6d2b79f5;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
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
  const b = norm(base);
  return {
    hi: lighten(b, 0.62),
    light: lighten(b, 0.28),
    mid: b,
    dark: mix(darken(b, 0.18), shadow, 0.28),
    deep: mix(darken(b, 0.45), shadow, 0.42),
  };
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

/** Split-leaf monstera: real gaps between lobes, no compositing tricks. */
export function drawMonstera(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, rot: number, t: Tone, veins = true) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  const lobes = 4;
  // central body
  const body = ctx.createLinearGradient(-size * 0.5, -size * 0.6, size * 0.5, size * 0.5);
  body.addColorStop(0, t.light);
  body.addColorStop(0.55, t.mid);
  body.addColorStop(1, t.dark);
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.moveTo(0, size * 0.42);
  ctx.bezierCurveTo(-size * 0.62, size * 0.32, -size * 0.55, -size * 0.55, 0, -size * 0.78);
  ctx.bezierCurveTo(size * 0.55, -size * 0.55, size * 0.62, size * 0.32, 0, size * 0.42);
  ctx.fill();
  // lobes, as fingers radiating from the rib
  for (let side = -1; side <= 1; side += 2) {
    for (let i = 0; i < lobes; i++) {
      const u = i / lobes;
      const by = size * (0.25 - u * 0.78);
      const len = size * (0.62 - u * 0.12) * (i === lobes - 1 ? 0.7 : 1);
      const ex = side * len;
      const ey = by - size * (0.12 + u * 0.06);
      const g = ctx.createLinearGradient(side * size * 0.15, by, ex, ey);
      g.addColorStop(0, t.mid);
      g.addColorStop(1, side < 0 ? t.light : t.dark);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(side * size * 0.1, by + size * 0.1);
      ctx.quadraticCurveTo(side * len * 0.55, by + size * 0.12, ex, ey);
      ctx.quadraticCurveTo(side * len * 0.55, by - size * 0.14, side * size * 0.1, by - size * 0.1);
      ctx.fill();
    }
  }
  if (veins) {
    ctx.strokeStyle = t.deep;
    ctx.globalAlpha = 0.5;
    ctx.lineWidth = Math.max(1.2, size * 0.02);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, size * 0.46);
    ctx.lineTo(0, -size * 0.74);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}

/** Broad banana / heliconia leaf with slanted veins. */
export function drawBananaLeaf(ctx: CanvasRenderingContext2D, x: number, y: number, len: number, wid: number, rot: number, t: Tone) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  const g = ctx.createLinearGradient(-wid, 0, wid, 0);
  g.addColorStop(0, t.light);
  g.addColorStop(0.5, t.mid);
  g.addColorStop(1, t.dark);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(-wid * 1.15, -len * 0.2, -wid * 0.95, -len * 0.75, 0, -len);
  ctx.bezierCurveTo(wid * 0.95, -len * 0.75, wid * 1.15, -len * 0.2, 0, 0);
  ctx.fill();
  ctx.strokeStyle = t.deep;
  ctx.lineCap = 'round';
  ctx.globalAlpha = 0.55;
  ctx.lineWidth = Math.max(1.4, len * 0.012);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -len * 0.98);
  ctx.stroke();
  ctx.lineWidth = Math.max(1, len * 0.008);
  for (let i = 1; i < 11; i++) {
    const u = i / 11;
    const w = wid * Math.sin(Math.PI * Math.min(1, u * 1.05)) * 0.92;
    ctx.beginPath();
    ctx.moveTo(0, -len * u);
    ctx.lineTo(-w, -len * (u - 0.09));
    ctx.moveTo(0, -len * u);
    ctx.lineTo(w, -len * (u - 0.09));
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  // sun sheen along the left half
  ctx.fillStyle = t.hi;
  ctx.globalAlpha = 0.22;
  ctx.beginPath();
  ctx.moveTo(0, -len * 0.05);
  ctx.bezierCurveTo(-wid * 0.8, -len * 0.25, -wid * 0.7, -len * 0.7, 0, -len * 0.94);
  ctx.bezierCurveTo(-wid * 0.2, -len * 0.6, -wid * 0.25, -len * 0.3, 0, -len * 0.05);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.restore();
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

/** Layered tropical flower (hibiscus-ish). */
export function drawFlower(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rad: number,
  petal: string,
  core: string,
  rot = 0,
  petals = 5
) {
  const pt = tone(petal, '#4a1030');
  for (let layer = 0; layer < 2; layer++) {
    const rr = rad * (layer ? 0.66 : 1);
    for (let i = 0; i < petals; i++) {
      const a = rot + (i / petals) * Math.PI * 2 + layer * (Math.PI / petals);
      const px = x + Math.cos(a) * rr * 0.55;
      const py = y + Math.sin(a) * rr * 0.55;
      const g = ctx.createRadialGradient(x, y, rr * 0.1, px, py, rr * 0.7);
      g.addColorStop(0, layer ? pt.hi : pt.light);
      g.addColorStop(0.6, layer ? pt.light : pt.mid);
      g.addColorStop(1, layer ? pt.mid : pt.dark);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(px, py, rr * 0.55, rr * 0.38, a, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.fillStyle = core;
  ctx.beginPath();
  ctx.arc(x, y, rad * 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.beginPath();
  ctx.arc(x - rad * 0.06, y - rad * 0.07, rad * 0.07, 0, Math.PI * 2);
  ctx.fill();
}

/** Toadstool, optionally glowing. */
export function drawMushroom(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, cap: string, spot: string, glow = false) {
  const ct = tone(cap, '#2a0a30');
  if (glow) {
    const g = ctx.createRadialGradient(x, y - s * 0.7, s * 0.2, x, y - s * 0.7, s * 2.4);
    g.addColorStop(0, ct.hi + '');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y - s * 0.7, s * 2.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  const sg = ctx.createLinearGradient(x - s * 0.3, 0, x + s * 0.3, 0);
  sg.addColorStop(0, '#fff6e0');
  sg.addColorStop(1, '#d8c39a');
  ctx.fillStyle = sg;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.22, y);
  ctx.quadraticCurveTo(x - s * 0.16, y - s * 0.5, x - s * 0.2, y - s * 0.75);
  ctx.lineTo(x + s * 0.2, y - s * 0.75);
  ctx.quadraticCurveTo(x + s * 0.16, y - s * 0.5, x + s * 0.22, y);
  ctx.closePath();
  ctx.fill();
  const cg = ctx.createRadialGradient(x - s * 0.25, y - s * 1.15, s * 0.1, x, y - s * 0.7, s * 0.95);
  cg.addColorStop(0, ct.light);
  cg.addColorStop(0.55, ct.mid);
  cg.addColorStop(1, ct.dark);
  ctx.fillStyle = cg;
  ctx.beginPath();
  ctx.ellipse(x, y - s * 0.72, s * 0.78, s * 0.52, 0, Math.PI, 0);
  ctx.quadraticCurveTo(x, y - s * 0.6, x - s * 0.78, y - s * 0.72);
  ctx.fill();
  ctx.fillStyle = spot;
  for (const [dx, dy, dr] of [[-0.35, -1.0, 0.1], [0.1, -1.12, 0.13], [0.4, -0.92, 0.09]]) {
    ctx.beginPath();
    ctx.ellipse(x + dx * s, y + dy * s, dr * s, dr * s * 0.75, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

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
