/**
 * flora — real flowers and leaves, one species at a time.
 *
 * The old flowers were five identical ovals and the old leaves flat gradient spears. Everything here is a species
 * you could name: hibiscus with a pollen-tipped stamen column, moth orchids, heliconia "lobster claws", birds of
 * paradise, passionflowers, plumeria, lotus, glowing bells; and leaves with the structure that makes them read —
 * monstera with real splits and holes, banana leaves torn along their veins, heart-shaped philodendron, arching ferns.
 * Colours come from the world's palette, so every biome blooms in its own colours.
 */
import { tone, mix, lighten, darken, rgba, type RNG, type Tone } from './artKit.ts';

export type Bloom = 'hibiscus' | 'orchid' | 'heliconia' | 'paradise' | 'passion' | 'plumeria' | 'lotus' | 'bells' | 'daisy';
export const BLOOMS: Bloom[] = ['hibiscus', 'orchid', 'heliconia', 'paradise', 'passion', 'plumeria', 'lotus', 'bells', 'daisy'];

const TAU = Math.PI * 2;

/** soft dark ground shadow under a flower head, so it sits on the scene instead of floating */
function shadowUnder(ctx: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number) {
  ctx.fillStyle = 'rgba(10,20,10,0.2)';
  ctx.beginPath();
  ctx.ellipse(x + rx * 0.08, y + ry * 0.2, rx, ry, 0, 0, TAU);
  ctx.fill();
}

/** one petal from the origin to (len, 0): gradient from a deep base to a light rim, veins, lit edge */
function petal(
  ctx: CanvasRenderingContext2D, len: number, wid: number, t: Tone, o: { ruffle?: number; round?: number; veins?: boolean; flip?: boolean; deep?: string } = {}
) {
  const ruffle = o.ruffle ?? 0;
  const round = o.round ?? 0.5;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(len * 0.18, -wid * 0.55, len * (0.55 + round * 0.2), -wid * (0.95 + ruffle * 0.1), len, -wid * 0.28);
  if (ruffle > 0) {
    ctx.quadraticCurveTo(len * 1.06, -wid * 0.1, len * 1.02, wid * 0.05);
    ctx.quadraticCurveTo(len * 1.07, wid * 0.22, len, wid * 0.3);
  } else {
    ctx.quadraticCurveTo(len * 1.08, 0, len, wid * 0.28);
  }
  ctx.bezierCurveTo(len * (0.55 + round * 0.2), wid * (0.95 + ruffle * 0.1), len * 0.18, wid * 0.55, 0, 0);
  ctx.closePath();
  const g = ctx.createLinearGradient(0, 0, len, 0);
  g.addColorStop(0, o.deep ?? t.deep);
  g.addColorStop(0.3, t.dark);
  g.addColorStop(0.62, t.mid);
  g.addColorStop(1, t.light);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.save();
  ctx.clip();
  if (o.veins !== false) {
    ctx.strokeStyle = rgba(t.deep, 0.32);
    ctx.lineWidth = Math.max(0.6, len * 0.012);
    ctx.beginPath();
    for (let i = -3; i <= 3; i++) {
      ctx.moveTo(len * 0.06, 0);
      ctx.quadraticCurveTo(len * 0.5, i * wid * 0.17, len * 0.98, i * wid * 0.24);
    }
    ctx.stroke();
  }
  // light catching the upper edge
  ctx.strokeStyle = rgba(t.hi, 0.7);
  ctx.lineWidth = Math.max(1, len * 0.04);
  ctx.beginPath();
  ctx.moveTo(len * 0.2, -wid * 0.5);
  ctx.bezierCurveTo(len * 0.5, -wid * 0.95, len * 0.8, -wid * 0.85, len * 0.98, -wid * 0.3);
  ctx.stroke();
  ctx.restore();
}

function stamenDots(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, col: string, r: RNG, n = 6) {
  ctx.fillStyle = col;
  for (let i = 0; i < n; i++) {
    ctx.beginPath();
    ctx.arc(x + (r() - 0.5) * s * 0.55, y + (r() - 0.5) * s * 0.45, s * 0.09, 0, TAU);
    ctx.fill();
  }
}

// ───────────────────────────── the species ─────────────────────────────

function hibiscus(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, col: string, accent: string, rot: number, r: RNG) {
  const t = tone(col, '#40081c');
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  shadowUnder(ctx, 0, s * 0.1, s * 0.95, s * 0.5);
  // five broad ruffled petals, each overlapping the next
  for (let i = 0; i < 5; i++) {
    ctx.save();
    ctx.rotate((i / 5) * TAU);
    petal(ctx, s, s * 0.74, t, { ruffle: 1, round: 1, deep: darken(col, 0.5) });
    ctx.restore();
  }
  // the dark star in the throat
  ctx.fillStyle = rgba(darken(col, 0.55), 0.85);
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * TAU;
    const rr = i % 2 ? s * 0.12 : s * 0.4;
    ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  ctx.closePath();
  ctx.fill();
  // stamen column curving out of the throat, pollen dots and a red tip
  ctx.strokeStyle = lighten(accent, 0.5);
  ctx.lineWidth = Math.max(1.6, s * 0.07);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(s * 0.25, -s * 0.18, s * 0.52, -s * 0.34);
  ctx.stroke();
  stamenDots(ctx, s * 0.4, -s * 0.28, s * 0.5, accent, r, 7);
  ctx.fillStyle = '#e8283c';
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.arc(s * 0.54 + (i - 2) * s * 0.035, -s * 0.36 - Math.abs(i - 2) * s * 0.012, s * 0.04, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

function orchidBloom(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, col: string, accent: string, rot: number) {
  const t = tone(col, '#40104a');
  const lipT = tone(accent, '#4a1030');
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  shadowUnder(ctx, 0, s * 0.1, s * 0.9, s * 0.55);
  const sep = (a: number, len: number, wid: number) => {
    ctx.save();
    ctx.rotate(a);
    petal(ctx, len, wid, t, { round: 0.2, veins: false });
    ctx.restore();
  };
  // back sepals: one up, two low
  sep(-Math.PI / 2, s * 0.95, s * 0.42);
  sep(Math.PI * 0.82, s * 0.92, s * 0.4);
  sep(Math.PI * 0.18, s * 0.92, s * 0.4);
  // two big round side petals
  for (const side of [-1, 1]) {
    ctx.save();
    ctx.rotate(side < 0 ? Math.PI * 1.02 : -0.02);
    ctx.translate(s * 0.05, -s * 0.12 * side * (side < 0 ? 1 : 1));
    petal(ctx, s * 1.05, s * 0.78, t, { round: 1, veins: true });
    ctx.restore();
  }
  // lip
  ctx.save();
  ctx.rotate(Math.PI / 2);
  petal(ctx, s * 0.5, s * 0.34, lipT, { round: 0.6, veins: true });
  ctx.restore();
  // whiskers on the lip
  ctx.strokeStyle = lighten(accent, 0.3);
  ctx.lineWidth = 1.2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-s * 0.05, s * 0.5);
  ctx.quadraticCurveTo(-s * 0.2, s * 0.62, -s * 0.28, s * 0.58);
  ctx.moveTo(s * 0.05, s * 0.5);
  ctx.quadraticCurveTo(s * 0.2, s * 0.62, s * 0.28, s * 0.58);
  ctx.stroke();
  // column
  ctx.fillStyle = '#fff6e8';
  ctx.beginPath();
  ctx.ellipse(0, s * 0.02, s * 0.11, s * 0.15, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = rgba(darken(col, 0.4), 0.6);
  ctx.beginPath();
  ctx.arc(0, s * 0.08, s * 0.035, 0, TAU);
  ctx.fill();
  ctx.restore();
}

function heliconia(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, col: string, accent: string, rot: number) {
  const t = tone(col, '#40081c');
  const tip = tone(accent, '#403000');
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  // the zig-zag stem and the boat-shaped bracts that grow from each node, big at the bottom, small at the top
  const n = 6;
  const node = (i: number): [number, number] => [(i % 2 ? 1 : -1) * s * 0.07 * (1 - i / n), -i * s * 0.3];
  ctx.strokeStyle = tip.dark;
  ctx.lineWidth = Math.max(2, s * 0.08);
  ctx.lineCap = 'round';
  ctx.beginPath();
  for (let i = 0; i <= n; i++) {
    const [nx, ny] = node(i);
    if (i === 0) ctx.moveTo(nx, ny);
    else ctx.lineTo(nx, ny);
  }
  ctx.stroke();
  for (let i = n - 1; i >= 0; i--) {
    const [nx, ny] = node(i);
    const dir = i % 2 ? 1 : -1;
    const len = s * (1.0 - (i / n) * 0.42);
    ctx.save();
    ctx.translate(nx, ny);
    ctx.rotate(-Math.PI / 2 + dir * 0.95);
    petal(ctx, len, s * 0.36 * (1 - i / n * 0.3), t, { round: 0.25, veins: false });
    // yellow-green keel along the lower edge and a bright tip
    ctx.strokeStyle = tip.mid;
    ctx.lineWidth = Math.max(1.6, s * 0.07);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(len * 0.1, dir * s * 0.05);
    ctx.quadraticCurveTo(len * 0.6, dir * s * 0.3, len * 0.99, dir * s * 0.02);
    ctx.stroke();
    ctx.fillStyle = tip.light;
    ctx.beginPath();
    ctx.ellipse(len * 0.96, 0, s * 0.07, s * 0.04, 0, 0, TAU);
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

function paradise(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, col: string, accent: string, rot: number) {
  const orange = tone(col, '#401000');
  const blue = tone(accent === col ? '#2a6af0' : accent, '#101a50');
  const sheath = tone('#5a9a3a', '#102010');
  ctx.save();
  ctx.translate(x - s * 0.3, y + s * 0.6);
  ctx.rotate(rot);
  // stem
  ctx.strokeStyle = '#3a7a3a';
  ctx.lineWidth = Math.max(2, s * 0.08);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-s * 0.2, s * 0.9);
  ctx.quadraticCurveTo(-s * 0.1, s * 0.3, 0, 0);
  ctx.stroke();
  // the boat-shaped sheath, pointing up and forward like a beak
  ctx.save();
  ctx.rotate(-0.95);
  petal(ctx, s * 1.2, s * 0.3, sheath, { round: 0.1, veins: false });
  ctx.strokeStyle = '#a04a7a';
  ctx.lineWidth = Math.max(1.4, s * 0.05);
  ctx.beginPath();
  ctx.moveTo(s * 0.1, s * 0.05);
  ctx.quadraticCurveTo(s * 0.7, s * 0.28, s * 1.18, 0);
  ctx.stroke();
  ctx.restore();
  // crest of orange petals standing up out of the sheath
  const tx = Math.cos(-0.95) * s * 0.85;
  const ty = Math.sin(-0.95) * s * 0.85;
  ctx.translate(tx, ty);
  for (let i = 0; i < 3; i++) {
    ctx.save();
    ctx.rotate(-Math.PI / 2 + (i - 1) * 0.36);
    petal(ctx, s * (1.05 - Math.abs(i - 1) * 0.18), s * 0.2, orange, { round: 0.05, veins: false });
    ctx.restore();
  }
  // the two blue petals jutting forward
  for (let i = 0; i < 2; i++) {
    ctx.save();
    ctx.rotate(-0.1 + i * 0.5);
    petal(ctx, s * 0.62, s * 0.13, blue, { round: 0.05, veins: false });
    ctx.restore();
  }
  ctx.restore();
}

function passion(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, col: string, accent: string, rot: number, r: RNG) {
  const t = tone(col, '#30104a');
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  shadowUnder(ctx, 0, s * 0.1, s * 0.95, s * 0.5);
  for (let i = 0; i < 10; i++) {
    ctx.save();
    ctx.rotate((i / 10) * TAU);
    petal(ctx, s, s * 0.2, t, { round: 0.2, veins: false });
    ctx.restore();
  }
  // corona: rings of fine filaments
  const rings: Array<[number, string]> = [[0.72, accent], [0.58, '#ffffff'], [0.46, darken(accent, 0.2)]];
  for (const [rad, c] of rings) {
    ctx.strokeStyle = c;
    ctx.lineWidth = Math.max(0.8, s * 0.025);
    ctx.lineCap = 'round';
    ctx.beginPath();
    for (let i = 0; i < 44; i++) {
      const a = (i / 44) * TAU + rad;
      ctx.moveTo(Math.cos(a) * s * 0.18, Math.sin(a) * s * 0.18);
      ctx.lineTo(Math.cos(a) * s * rad, Math.sin(a) * s * rad);
    }
    ctx.stroke();
  }
  ctx.fillStyle = '#7ac84a';
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * TAU - Math.PI / 2;
    ctx.beginPath();
    ctx.arc(Math.cos(a) * s * 0.16, Math.sin(a) * s * 0.16, s * 0.07, 0, TAU);
    ctx.fill();
  }
  ctx.fillStyle = '#ffe36a';
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * TAU;
    ctx.beginPath();
    ctx.ellipse(Math.cos(a) * s * 0.28, Math.sin(a) * s * 0.28, s * 0.07, s * 0.045, a, 0, TAU);
    ctx.fill();
  }
  void r;
  ctx.restore();
}

function plumeria(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, col: string, accent: string, rot: number) {
  const t = tone(col, '#4a2a30');
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  shadowUnder(ctx, 0, s * 0.1, s * 0.9, s * 0.5);
  for (let i = 0; i < 5; i++) {
    ctx.save();
    ctx.rotate((i / 5) * TAU);
    // twisted, lopsided petal
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(s * 0.15, -s * 0.5, s * 0.75, -s * 0.62, s * 1.0, -s * 0.2);
    ctx.bezierCurveTo(s * 1.05, s * 0.05, s * 0.7, s * 0.28, 0, s * 0.06);
    ctx.closePath();
    const g = ctx.createLinearGradient(0, 0, s, 0);
    g.addColorStop(0, accent);
    g.addColorStop(0.35, mix(accent, col, 0.6));
    g.addColorStop(0.75, t.light);
    g.addColorStop(1, t.hi);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = rgba(t.deep, 0.3);
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  }
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.arc(0, 0, s * 0.1, 0, TAU);
  ctx.fill();
  ctx.restore();
}

function lotus(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, col: string, accent: string, rot: number) {
  const t = tone(col, '#40104a');
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot * 0.2);
  // three rows of pointed petals fanning upward
  const rows: Array<[number, number, number]> = [[7, 1.0, 0.3], [5, 0.78, 0.24], [3, 0.52, 0.2]];
  rows.forEach(([n, k, w], row) => {
    for (let i = 0; i < n; i++) {
      const u = n === 1 ? 0.5 : i / (n - 1);
      const a = -Math.PI / 2 + (u - 0.5) * (2.4 - row * 0.5);
      ctx.save();
      ctx.rotate(a);
      petal(ctx, s * k * 1.15, s * w * 1.1, row === 2 ? mixTone(t, '#ffffff', 0.35) : t, { round: 0.05, veins: true });
      ctx.restore();
    }
  });
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.ellipse(0, -s * 0.18, s * 0.14, s * 0.09, 0, 0, TAU);
  ctx.fill();
  ctx.restore();
}

function mixTone(a: Tone, c: string, k: number): Tone {
  return { hi: mix(a.hi, c, k), light: mix(a.light, c, k), mid: mix(a.mid, c, k), dark: mix(a.dark, c, k), deep: mix(a.deep, c, k * 0.5) };
}

/** pendant bell flowers with a halo, for the dark worlds */
function bells(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, col: string, accent: string, rot: number, r: RNG) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot * 0.3);
  const t = tone(col, '#10104a');
  ctx.strokeStyle = '#2f6a3a';
  ctx.lineWidth = Math.max(1.5, s * 0.06);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-s * 0.1, s * 0.7);
  ctx.bezierCurveTo(-s * 0.2, -s * 0.2, s * 0.1, -s * 0.8, s * 0.6, -s * 0.7);
  ctx.stroke();
  const stem = (u: number): [number, number] => {
    const k = 1 - u;
    return [
      k * k * k * -s * 0.1 + 3 * k * k * u * -s * 0.2 + 3 * k * u * u * s * 0.1 + u * u * u * s * 0.6,
      k * k * k * s * 0.7 + 3 * k * k * u * -s * 0.2 + 3 * k * u * u * -s * 0.8 + u * u * u * -s * 0.7,
    ];
  };
  for (let i = 0; i < 3; i++) {
    const [px, py] = stem(0.5 + i * 0.22);
    const bs = s * (0.42 - i * 0.06);
    const bx = px;
    const by = py;
    // short pedicel
    ctx.strokeStyle = '#2f6a3a';
    ctx.lineWidth = Math.max(1, s * 0.04);
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(bx, by + bs * 0.15);
    ctx.stroke();
    const g = ctx.createRadialGradient(bx, by + bs * 0.7, 0, bx, by + bs * 0.7, bs * 2.2);
    g.addColorStop(0, rgba(accent, 0.5));
    g.addColorStop(1, rgba(accent, 0));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(bx, by + bs * 0.7, bs * 2.2, 0, TAU);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(bx - bs * 0.2, by + bs * 0.1);
    ctx.bezierCurveTo(bx - bs * 0.6, by + bs * 0.5, bx - bs * 0.55, by + bs * 1.0, bx - bs * 0.85, by + bs * 1.25);
    ctx.quadraticCurveTo(bx, by + bs * 1.05, bx + bs * 0.85, by + bs * 1.25);
    ctx.bezierCurveTo(bx + bs * 0.55, by + bs * 1.0, bx + bs * 0.6, by + bs * 0.5, bx + bs * 0.2, by + bs * 0.1);
    ctx.closePath();
    const bg = ctx.createLinearGradient(bx - bs, by, bx + bs, by + bs * 1.2);
    bg.addColorStop(0, t.light);
    bg.addColorStop(0.55, t.mid);
    bg.addColorStop(1, t.dark);
    ctx.fillStyle = bg;
    ctx.fill();
    ctx.strokeStyle = rgba(t.hi, 0.6);
    ctx.lineWidth = Math.max(1, bs * 0.08);
    ctx.beginPath();
    ctx.moveTo(bx - bs * 0.32, by + bs * 0.25);
    ctx.quadraticCurveTo(bx - bs * 0.45, by + bs * 0.7, bx - bs * 0.62, by + bs * 1.05);
    ctx.stroke();
    ctx.fillStyle = rgba(accent, 0.95);
    ctx.beginPath();
    ctx.ellipse(bx, by + bs * 1.16, bs * 0.5, bs * 0.13, 0, 0, TAU);
    ctx.fill();
  }
  void r;
  ctx.restore();
}

function daisy(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, col: string, accent: string, rot: number) {
  const t = tone(col, '#401040');
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  const n = 11;
  for (let layer = 0; layer < 2; layer++) {
    for (let i = 0; i < n; i++) {
      ctx.save();
      ctx.rotate((i / n) * TAU + layer * (Math.PI / n));
      petal(ctx, s * (layer ? 0.82 : 1), s * 0.16, layer ? t : mixTone(t, '#ffffff', 0.18), { round: 0.4, veins: false });
      ctx.restore();
    }
  }
  const g = ctx.createRadialGradient(-s * 0.04, -s * 0.05, 0, 0, 0, s * 0.26);
  g.addColorStop(0, lighten(accent, 0.45));
  g.addColorStop(1, darken(accent, 0.25));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, s * 0.24, 0, TAU);
  ctx.fill();
  ctx.fillStyle = rgba(darken(accent, 0.5), 0.5);
  for (let i = 0; i < 8; i++) {
    const a = i * 2.4;
    ctx.beginPath();
    ctx.arc(Math.cos(a) * s * 0.12, Math.sin(a) * s * 0.12, s * 0.025, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

/** which species suits a flower of this size at this spot (deterministic, so a scene never flickers) */
export function pickBloom(rad: number, key: number): Bloom {
  const k = Math.abs(Math.floor(key));
  if (rad < 9) return (['daisy', 'plumeria', 'passion', 'daisy'] as Bloom[])[k % 4];
  if (rad < 18) return (['hibiscus', 'plumeria', 'daisy', 'orchid', 'passion', 'hibiscus'] as Bloom[])[k % 6];
  return (['hibiscus', 'orchid', 'plumeria', 'passion', 'hibiscus'] as Bloom[])[k % 5];
}

/** draw one flower head of the named species centred on (x, y); `s` is roughly its radius */
export function drawBloom(ctx: CanvasRenderingContext2D, kind: Bloom, x: number, y: number, s: number, col: string, accent: string, rot = 0, r: RNG = Math.random) {
  switch (kind) {
    case 'hibiscus': return hibiscus(ctx, x, y, s, col, accent, rot, r);
    case 'orchid': return orchidBloom(ctx, x, y, s, col, accent, rot * 0.15);
    case 'heliconia': return heliconia(ctx, x, y + s * 0.8, s, col, accent, rot * 0.15);
    case 'paradise': return paradise(ctx, x, y, s, col, accent, rot * 0.2);
    case 'passion': return passion(ctx, x, y, s, col, accent, rot, r);
    case 'plumeria': return plumeria(ctx, x, y, s, col, accent, rot);
    case 'lotus': return lotus(ctx, x, y + s * 0.3, s, col, accent, rot);
    case 'bells': return bells(ctx, x, y, s, col, accent, rot, r);
    case 'daisy': return daisy(ctx, x, y, s, col, accent, rot);
  }
}

// ───────────────────────────── leaves ─────────────────────────────

/** heart-shaped outline with the stem at the origin and the tip at (0, -size) */
function heartPoints(size: number, n = 64): Array<[number, number]> {
  const pts: Array<[number, number]> = [];
  for (let i = 0; i < n; i++) {
    const t = (i / n) * TAU;
    const hx = 16 * Math.pow(Math.sin(t), 3);
    const hy = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    // heart curve has its notch at the top (hy ≈ 5) and its point at the bottom (hy ≈ -17): flip so the point is up
    pts.push([(hx / 17) * size * 0.62, -((hy + 5) / 22) * size * 1.0 + size * 0.0]);
  }
  return pts;
}

/** monstera: heart-shaped with deep slits from the edge and real holes beside the midrib */
export function monstera(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, rot: number, t: Tone, r: RNG) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  const base = heartPoints(size, 72);
  // build the outline, replacing a few edge points on each side with an inward slit
  ctx.beginPath();
  const slitAt = new Set<number>();
  for (let k = 0; k < 4; k++) {
    slitAt.add(10 + k * 6 + ((r() * 2) | 0)); // right side
    slitAt.add(72 - 10 - k * 6 - ((r() * 2) | 0)); // left side
  }
  base.forEach(([px, py], i) => {
    if (slitAt.has(i)) {
      // go inward toward the midrib along the line from the edge to (0, -size*0.45)
      const mx = px * 0.28;
      const my = py * 0.6 + -size * 0.45 * 0.4;
      ctx.lineTo(px * 0.96, py);
      ctx.lineTo(mx, my);
      ctx.lineTo(px * 0.9, py + size * 0.04);
    } else ctx.lineTo(px, py);
  });
  ctx.closePath();
  // holes beside the midrib
  for (const side of [-1, 1]) {
    for (let k = 0; k < 3; k++) {
      ctx.moveTo(side * size * 0.17 + size * 0.045, -size * (0.3 + k * 0.17));
      ctx.ellipse(side * size * 0.17, -size * (0.3 + k * 0.17), size * 0.045, size * 0.07, side * 0.5, 0, TAU);
    }
  }
  const g = ctx.createLinearGradient(-size * 0.5, -size, size * 0.5, 0);
  g.addColorStop(0, t.light);
  g.addColorStop(0.45, t.mid);
  g.addColorStop(1, t.dark);
  ctx.fillStyle = g;
  ctx.fill('evenodd');
  ctx.save();
  ctx.clip('evenodd');
  // glossy sheen on the lit half
  ctx.fillStyle = rgba(t.hi, 0.2);
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.05);
  ctx.bezierCurveTo(-size * 0.55, -size * 0.2, -size * 0.45, -size * 0.8, -size * 0.02, -size * 0.98);
  ctx.closePath();
  ctx.fill();
  // veins
  ctx.strokeStyle = rgba(t.deep, 0.45);
  ctx.lineWidth = Math.max(1, size * 0.018);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -size * 0.95);
  for (let i = 1; i <= 6; i++) {
    const vy = -size * (0.1 + i * 0.13);
    ctx.moveTo(0, vy);
    ctx.quadraticCurveTo(size * 0.2, vy - size * 0.02, size * 0.5 * (1 - i * 0.1), vy - size * 0.16);
    ctx.moveTo(0, vy);
    ctx.quadraticCurveTo(-size * 0.2, vy - size * 0.02, -size * 0.5 * (1 - i * 0.1), vy - size * 0.16);
  }
  ctx.stroke();
  ctx.restore();
  ctx.restore();
}

/** banana leaf: long, with the blade torn into strips along its side veins */
export function bananaLeaf(ctx: CanvasRenderingContext2D, x: number, y: number, len: number, wid: number, rot: number, t: Tone, r: RNG, tears = true) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  const bend = (r() - 0.5) * len * 0.25;
  const spineAt = (u: number): [number, number] => [bend * u * u, -len * u];
  const half = (side: number) => {
    const pts: Array<[number, number]> = [];
    const N = 26;
    for (let i = 0; i <= N; i++) {
      const u = i / N;
      const w = wid * Math.sin(Math.PI * Math.pow(u, 0.75)) * (0.9 + 0.1 * Math.sin(u * 14 + side));
      const [sx, sy] = spineAt(u);
      let off = w;
      // tears: occasional notches cut in toward the midrib
      if (tears && i > 3 && i < N - 2 && (i + (side > 0 ? 1 : 0)) % 5 === 0) off = w * 0.32;
      pts.push([sx + side * off, sy + off * 0.18]);
    }
    return pts;
  };
  const R = half(1);
  const L = half(-1);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  for (const p of R) ctx.lineTo(p[0], p[1]);
  for (let i = L.length - 1; i >= 0; i--) ctx.lineTo(L[i][0], L[i][1]);
  ctx.closePath();
  const g = ctx.createLinearGradient(-wid, 0, wid, 0);
  g.addColorStop(0, t.light);
  g.addColorStop(0.5, t.mid);
  g.addColorStop(1, t.dark);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.save();
  ctx.clip();
  // parallel side veins
  ctx.strokeStyle = rgba(t.deep, 0.3);
  ctx.lineWidth = Math.max(0.8, len * 0.006);
  ctx.beginPath();
  for (let i = 1; i < 26; i++) {
    const u = i / 26;
    const [sx, sy] = spineAt(u);
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + wid * 1.1, sy + wid * 0.28);
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx - wid * 1.1, sy + wid * 0.28);
  }
  ctx.stroke();
  // midrib, lighter than the blade
  ctx.strokeStyle = rgba(t.hi, 0.7);
  ctx.lineWidth = Math.max(1.4, len * 0.014);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(bend * 0.3, -len * 0.5, bend, -len);
  ctx.stroke();
  ctx.restore();
  ctx.restore();
}

/** heart-shaped glossy leaf (philodendron, elephant ear) */
export function heartLeaf(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, rot: number, t: Tone) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  const pts = heartPoints(size, 64);
  ctx.beginPath();
  pts.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
  ctx.closePath();
  const g = ctx.createLinearGradient(-size * 0.5, -size, size * 0.5, 0);
  g.addColorStop(0, t.light);
  g.addColorStop(0.5, t.mid);
  g.addColorStop(1, t.dark);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.save();
  ctx.clip();
  ctx.strokeStyle = rgba(t.deep, 0.4);
  ctx.lineWidth = Math.max(1, size * 0.016);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -size * 0.95);
  for (let i = 1; i <= 5; i++) {
    const vy = -size * (0.08 + i * 0.15);
    ctx.moveTo(0, vy);
    ctx.quadraticCurveTo(size * 0.28, vy - size * 0.02, size * 0.58 * (1 - i * 0.12), vy - size * 0.22);
    ctx.moveTo(0, vy);
    ctx.quadraticCurveTo(-size * 0.28, vy - size * 0.02, -size * 0.58 * (1 - i * 0.12), vy - size * 0.22);
  }
  ctx.stroke();
  ctx.fillStyle = rgba(t.hi, 0.22);
  ctx.beginPath();
  ctx.ellipse(-size * 0.18, -size * 0.55, size * 0.1, size * 0.3, 0.35, 0, TAU);
  ctx.fill();
  ctx.restore();
  ctx.restore();
}

/** an arching fern frond with a curled fiddlehead-style tip and tapered leaflets */
export function fernFrond(ctx: CanvasRenderingContext2D, x: number, y: number, len: number, ang: number, t: Tone, r: RNG, droop = 0.5) {
  const tipX = x + Math.cos(ang) * len;
  const tipY = y + Math.sin(ang) * len + len * droop * 0.5;
  const cX = x + Math.cos(ang) * len * 0.55;
  const cY = y + Math.sin(ang) * len * 0.55 - len * 0.12;
  const at = (u: number): [number, number, number] => {
    const mx = (1 - u) * (1 - u) * x + 2 * (1 - u) * u * cX + u * u * tipX;
    const my = (1 - u) * (1 - u) * y + 2 * (1 - u) * u * cY + u * u * tipY;
    const dx = 2 * (1 - u) * (cX - x) + 2 * u * (tipX - cX);
    const dy = 2 * (1 - u) * (cY - y) + 2 * u * (tipY - cY);
    return [mx, my, Math.atan2(dy, dx)];
  };
  const n = Math.max(10, Math.round(len / 7));
  for (let i = 1; i < n; i++) {
    const u = i / n;
    const [px, py, a] = at(u);
    const ll = len * 0.3 * Math.sin(Math.PI * Math.pow(u, 0.7)) * (0.9 + r() * 0.2);
    for (const side of [-1, 1]) {
      const la = a + side * (1.25 - u * 0.5);
      const ex = px + Math.cos(la) * ll;
      const ey = py + Math.sin(la) * ll + ll * 0.2;
      ctx.fillStyle = side < 0 ? t.light : t.mid;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.quadraticCurveTo((px + ex) / 2 + Math.cos(la - side * 1.6) * ll * 0.14, (py + ey) / 2 + Math.sin(la - side * 1.6) * ll * 0.14, ex, ey);
      ctx.quadraticCurveTo((px + ex) / 2 + Math.cos(la + side * 1.6) * ll * 0.1, (py + ey) / 2 + Math.sin(la + side * 1.6) * ll * 0.1, px, py);
      ctx.fill();
    }
  }
  ctx.strokeStyle = t.deep;
  ctx.lineWidth = Math.max(1.4, len * 0.02);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(cX, cY, tipX, tipY);
  ctx.stroke();
}

/** a feather-palm frond: long rachis, drooping paired leaflets in tufts */
export function palmFrond(ctx: CanvasRenderingContext2D, x: number, y: number, len: number, ang: number, t: Tone, r: RNG) {
  const droop = len * 0.55;
  const tipX = x + Math.cos(ang) * len;
  const tipY = y + Math.sin(ang) * len + droop * (Math.cos(ang) > 0 ? 1 : 1);
  const cX = x + Math.cos(ang) * len * 0.5;
  const cY = y + Math.sin(ang) * len * 0.6 - len * 0.18;
  const at = (u: number): [number, number, number] => {
    const mx = (1 - u) * (1 - u) * x + 2 * (1 - u) * u * cX + u * u * tipX;
    const my = (1 - u) * (1 - u) * y + 2 * (1 - u) * u * cY + u * u * tipY;
    const dx = 2 * (1 - u) * (cX - x) + 2 * u * (tipX - cX);
    const dy = 2 * (1 - u) * (cY - y) + 2 * u * (tipY - cY);
    return [mx, my, Math.atan2(dy, dx)];
  };
  const n = Math.max(14, Math.round(len / 6));
  for (let i = 2; i < n; i++) {
    const u = i / n;
    const [px, py, a] = at(u);
    const ll = len * 0.34 * Math.sin(Math.PI * Math.min(1, u * 0.95 + 0.06)) * (0.85 + r() * 0.25);
    for (const side of [-1, 1]) {
      const la = a + side * (1.0 + u * 0.2) + (side > 0 ? 0.25 : -0.05);
      const ex = px + Math.cos(la) * ll;
      const ey = py + Math.sin(la) * ll + ll * 0.65;
      ctx.strokeStyle = side < 0 ? t.light : t.mid;
      ctx.lineWidth = Math.max(1.4, len * 0.016);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.quadraticCurveTo(px + Math.cos(la) * ll * 0.6, py + Math.sin(la) * ll * 0.4, ex, ey);
      ctx.stroke();
    }
  }
  ctx.strokeStyle = t.deep;
  ctx.lineWidth = Math.max(2, len * 0.03);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(cX, cY, tipX, tipY);
  ctx.stroke();
}

