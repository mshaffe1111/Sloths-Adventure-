/**
 * soil — baked, tileable ground textures.
 *
 * The ground used to be redrawn from scratch every frame as a flat gradient with evenly spaced stones. Now each
 * world paints one rich tile (soil strata, buried stones, roots, fossils, grit) once, and every platform is filled
 * with it in world space — so neighbouring platforms join into one landmass with no seams and no obvious repeats.
 * The grass cap works the same way: a baked strip of layered blades, drips and moss.
 */
import { getSceneSeed, onSceneSeedChange } from './sceneSeed.ts';
import { rng, tone, mix, lighten, darken, rgba, type RNG } from './artKit.ts';
import { drawBloom } from './flora.ts';
import type { Look } from './scenery.ts';

/** world units covered by one soil tile */
export const SOIL_W = 1024;
export const SOIL_H = 512;
const RES = 1.5; // texture pixels per world unit
export const CAP_W = 512;
export const CAP_H = 72;

interface SoilSet {
  soil: CanvasPattern;
  cap: CanvasPattern;
}
const cache = new Map<string, SoilSet>();
onSceneSeedChange(() => cache.clear());

export function disposeSoil() {
  cache.clear();
}

function canvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const cv = document.createElement('canvas');
  cv.width = Math.round(w * RES);
  cv.height = Math.round(h * RES);
  const c = cv.getContext('2d')!;
  c.scale(RES, RES);
  return [cv, c];
}

/** run fn at the point and at the copies that wrap around the tile edges, so the tile repeats without seams */
function wrap2(x: number, y: number, rad: number, fn: (x: number, y: number) => void, wrapY = true) {
  const xs = [x];
  if (x < rad) xs.push(x + SOIL_W);
  if (x > SOIL_W - rad) xs.push(x - SOIL_W);
  const ys = [y];
  if (wrapY) {
    if (y < rad) ys.push(y + SOIL_H);
    if (y > SOIL_H - rad) ys.push(y - SOIL_H);
  }
  for (const xx of xs) for (const yy of ys) fn(xx, yy);
}

// ───────────────────────────── the soil tile ─────────────────────────────

function stoneBlob(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, rot: number, r: RNG, col: string, outline: string) {
  const n = 9;
  const pts: Array<[number, number]> = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const k = 0.84 + r() * 0.26;
    pts.push([Math.cos(a) * w * 0.5 * k, Math.sin(a) * h * 0.5 * k]);
  }
  const path = () => {
    ctx.beginPath();
    const mid = (i: number): [number, number] => {
      const a = pts[i % n];
      const b = pts[(i + 1) % n];
      return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    };
    const m0 = mid(n - 1);
    ctx.moveTo(m0[0], m0[1]);
    for (let i = 0; i < n; i++) {
      const m = mid(i);
      ctx.quadraticCurveTo(pts[i][0], pts[i][1], m[0], m[1]);
    }
    ctx.closePath();
  };
  const t = tone(col, '#2a1a10');
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  // soft contact shadow in the soil
  ctx.save();
  ctx.translate(2, 3);
  path();
  ctx.fillStyle = 'rgba(30,12,2,0.38)';
  ctx.fill();
  ctx.restore();
  path();
  const g = ctx.createLinearGradient(-w * 0.4, -h * 0.5, w * 0.4, h * 0.5);
  g.addColorStop(0, t.light);
  g.addColorStop(0.5, t.mid);
  g.addColorStop(1, t.dark);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.lineWidth = 1.6;
  ctx.strokeStyle = rgba(outline, 0.75);
  ctx.stroke();
  ctx.save();
  path();
  ctx.clip();
  // lichen / strata flecks
  ctx.fillStyle = rgba(t.hi, 0.35);
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.ellipse((r() - 0.5) * w * 0.6, (r() - 0.6) * h * 0.5, 2 + r() * 4, 1 + r() * 2, r() * 3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = rgba(t.deep, 0.3);
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.ellipse((r() - 0.5) * w * 0.6, (r() - 0.2) * h * 0.5, 2 + r() * 4, 1 + r() * 2, r() * 3, 0, Math.PI * 2);
    ctx.fill();
  }
  // a hairline crack
  if (w > 26 && r() > 0.5) {
    ctx.strokeStyle = rgba(t.deep, 0.5);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-w * 0.2, -h * 0.3);
    ctx.lineTo(-w * 0.05, 0);
    ctx.lineTo(w * 0.12, h * 0.1);
    ctx.stroke();
  }
  ctx.restore();
  // highlight crescent, upper left
  ctx.strokeStyle = rgba(t.hi, 0.7);
  ctx.lineWidth = Math.max(1.4, w * 0.05);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.ellipse(0, 0, w * 0.37, h * 0.36, 0, Math.PI * 1.08, Math.PI * 1.55);
  ctx.stroke();
  ctx.restore();
}

/** a tapered, branching root system; draws a centreline with width falling off along it */
function rootSystem(ctx: CanvasRenderingContext2D, x: number, y: number, ang: number, len: number, wid: number, r: RNG, col: string, depth: number) {
  const segs = 10;
  const pts: Array<[number, number, number]> = [];
  let px = x;
  let py = y;
  let a = ang;
  for (let i = 0; i <= segs; i++) {
    const u = i / segs;
    pts.push([px, py, wid * (1 - u * 0.85)]);
    a += (r() - 0.5) * 0.55;
    px += Math.cos(a) * (len / segs);
    py += Math.sin(a) * (len / segs);
  }
  const edge = (side: number) => pts.map(([ex, ey, ew], i) => {
    const nx = pts[Math.min(i + 1, segs)][0] - pts[Math.max(i - 1, 0)][0];
    const ny = pts[Math.min(i + 1, segs)][1] - pts[Math.max(i - 1, 0)][1];
    const l = Math.hypot(nx, ny) || 1;
    return [ex - (ny / l) * ew * 0.5 * side, ey + (nx / l) * ew * 0.5 * side] as [number, number];
  });
  const L = edge(1);
  const R = edge(-1);
  ctx.beginPath();
  ctx.moveTo(L[0][0], L[0][1]);
  for (const p of L) ctx.lineTo(p[0], p[1]);
  for (let i = R.length - 1; i >= 0; i--) ctx.lineTo(R[i][0], R[i][1]);
  ctx.closePath();
  ctx.fillStyle = col;
  ctx.fill();
  ctx.strokeStyle = rgba(darken(col, 0.45), 0.8);
  ctx.lineWidth = 1.2;
  ctx.stroke();
  // lit edge
  ctx.strokeStyle = rgba(lighten(col, 0.45), 0.55);
  ctx.lineWidth = Math.max(1, wid * 0.14);
  ctx.beginPath();
  ctx.moveTo(L[0][0], L[0][1]);
  for (const p of L) ctx.lineTo(p[0], p[1]);
  ctx.stroke();
  if (depth > 0) {
    for (let i = 3; i < segs; i += 3) {
      const [bx, by] = pts[i];
      rootSystem(ctx, bx, by, ang + (r() > 0.5 ? 1 : -1) * (0.5 + r() * 0.7), len * (0.5 + r() * 0.25), pts[i][2] * 0.7, r, col, depth - 1);
    }
  }
}

function ammonite(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, rot: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.strokeStyle = 'rgba(255,236,200,0.42)';
  ctx.lineCap = 'round';
  ctx.lineWidth = s * 0.16;
  ctx.beginPath();
  for (let a = 0; a < Math.PI * 6; a += 0.2) {
    const rr = s * (0.06 + a * 0.052);
    const px = Math.cos(a) * rr;
    const py = Math.sin(a) * rr;
    if (a === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgba(70,35,10,0.35)';
  for (let a = 1; a < Math.PI * 6; a += 0.55) {
    const rr = s * (0.06 + a * 0.052);
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * (rr - s * 0.09), Math.sin(a) * (rr - s * 0.09));
    ctx.lineTo(Math.cos(a) * (rr + s * 0.09), Math.sin(a) * (rr + s * 0.09));
    ctx.stroke();
  }
  ctx.restore();
}

function fishBones(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, rot: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.strokeStyle = 'rgba(255,240,215,0.45)';
  ctx.lineCap = 'round';
  ctx.lineWidth = s * 0.07;
  ctx.beginPath();
  ctx.moveTo(-s, 0);
  ctx.lineTo(s * 0.8, 0);
  ctx.stroke();
  for (let i = -3; i <= 3; i++) {
    const bx = i * s * 0.22;
    const hh = s * 0.34 * (1 - Math.abs(i) * 0.12);
    ctx.beginPath();
    ctx.moveTo(bx, 0);
    ctx.lineTo(bx - s * 0.1, -hh);
    ctx.moveTo(bx, 0);
    ctx.lineTo(bx - s * 0.1, hh);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.ellipse(s * 0.95, 0, s * 0.22, s * 0.2, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-s, 0);
  ctx.lineTo(-s * 1.3, -s * 0.28);
  ctx.moveTo(-s, 0);
  ctx.lineTo(-s * 1.3, s * 0.28);
  ctx.stroke();
  ctx.restore();
}

function leafImprint(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, rot: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.strokeStyle = 'rgba(40,18,6,0.4)';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(-s, 0);
  ctx.quadraticCurveTo(0, -s * 0.55, s, 0);
  ctx.quadraticCurveTo(0, s * 0.55, -s, 0);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-s, 0);
  ctx.lineTo(s * 0.9, 0);
  for (let i = -3; i <= 3; i++) {
    ctx.moveTo(i * s * 0.22, 0);
    ctx.lineTo(i * s * 0.22 + s * 0.16, -s * 0.28 * (1 - Math.abs(i) / 4));
    ctx.moveTo(i * s * 0.22, 0);
    ctx.lineTo(i * s * 0.22 + s * 0.16, s * 0.28 * (1 - Math.abs(i) / 4));
  }
  ctx.stroke();
  ctx.restore();
}

/** which ground a world is built from */
export type GroundStyle = 'earth' | 'sand' | 'peat' | 'fungus' | 'slate' | 'cave' | 'blocks' | 'basalt' | 'wetslate' | 'rooted' | 'crystal' | 'iron';
/** which edge sits on top of it */
export type CapStyle = 'grass' | 'moss' | 'glow' | 'blossom' | 'reed' | 'ash' | 'ruin';

export const GROUND_STYLE: Record<number, GroundStyle> = {
  1: 'earth', 2: 'sand', 3: 'cave', 4: 'wetslate', 5: 'rooted', 6: 'peat', 7: 'blocks', 8: 'crystal', 9: 'basalt', 10: 'iron',
};
export const CAP_STYLE: Record<number, CapStyle> = {
  1: 'grass', 2: 'grass', 3: 'glow', 4: 'moss', 5: 'blossom', 6: 'reed', 7: 'ruin', 8: 'glow', 9: 'ash', 10: 'ruin',
};

function paintStrata(look: Look, world: number, style: GroundStyle): HTMLCanvasElement {
  const [cv, ctx] = canvas(SOIL_W, SOIL_H);
  const r = rng(world * 7919 + 101 + getSceneSeed() * 1013);
  const g = look.ground;
  const sand = style === 'sand';
  const peat = style === 'peat';
  const fungus = style === 'fungus';

  // 1. strata: wavy bands of different soils
  const ramp = sand
    ? [
        mix(g.dirt, '#fff0c8', 0.35),
        g.dirt,
        mix(g.dirt, '#e8b878', 0.4),
        mix(g.dirt, g.dirtDark, 0.3),
        mix(g.dirt, '#fff0c8', 0.2),
        mix(g.dirt, g.dirtDark, 0.55),
        mix(g.dirt, '#e0a868', 0.3),
        mix(g.dirt, g.dirtDark, 0.2),
      ]
    : peat
      ? [
          mix(g.dirt, g.dirtDark, 0.2),
          mix(g.dirt, g.dirtDark, 0.5),
          g.dirt,
          mix(g.dirt, g.dirtDark, 0.75),
          mix(g.dirt, '#2a3a30', 0.35),
          mix(g.dirt, g.dirtDark, 0.4),
          mix(g.dirt, '#4a3a22', 0.4),
          mix(g.dirt, g.dirtDark, 0.62),
        ]
      : [
          lighten(g.dirt, 0.06),
          g.dirt,
          mix(g.dirt, '#d49a58', 0.28),
          mix(g.dirt, g.dirtDark, 0.4),
          mix(g.dirt, '#7a3a22', 0.3),
          mix(g.dirt, g.dirtDark, 0.7),
          mix(g.dirt, '#c98a4c', 0.2),
          mix(g.dirt, g.dirtDark, 0.25),
        ];
  const heights: number[] = [];
  let total = 0;
  for (let i = 0; i < ramp.length; i++) {
    const h = 40 + r() * 52;
    heights.push(h);
    total += h;
  }
  const scale = SOIL_H / total;
  const waves = ramp.map(() => [
    { n: 1 + ((r() * 2) | 0), a: 5 + r() * 9, p: r() * 6.28 },
    { n: 3 + ((r() * 3) | 0), a: 2 + r() * 4, p: r() * 6.28 },
    { n: 7 + ((r() * 5) | 0), a: 0.8 + r() * 1.6, p: r() * 6.28 },
  ]);
  const baseTops: number[] = [];
  let acc = 0;
  for (let i = 0; i < ramp.length; i++) {
    baseTops.push(acc);
    acc += heights[i] * scale;
  }
  const topY = (i: number, x: number) => {
    const k = i % ramp.length;
    let y = baseTops[k] + (i >= ramp.length ? SOIL_H : 0);
    for (const w of waves[k]) y += Math.sin((x / SOIL_W) * Math.PI * 2 * w.n + w.p) * w.a;
    return y;
  };
  for (let i = 0; i < ramp.length; i++) {
    for (const off of [-SOIL_H, 0]) {
      ctx.beginPath();
      for (let x = 0; x <= SOIL_W; x += 16) ctx.lineTo(x, topY(i, x) + off);
      for (let x = SOIL_W; x >= 0; x -= 16) ctx.lineTo(x, topY(i + 1, x) + off);
      ctx.closePath();
      ctx.fillStyle = ramp[i];
      ctx.fill();
      // lit upper edge and shaded lower edge of each layer
      ctx.strokeStyle = rgba('#ffffff', 0.13);
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      for (let x = 0; x <= SOIL_W; x += 16) (x === 0 ? ctx.moveTo : ctx.lineTo).call(ctx, x, topY(i, x) + off + 1);
      ctx.stroke();
      ctx.strokeStyle = rgba(g.outline, 0.16);
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let x = 0; x <= SOIL_W; x += 16) (x === 0 ? ctx.moveTo : ctx.lineTo).call(ctx, x, topY(i + 1, x) + off - 2);
      ctx.stroke();
    }
  }

  // 2. mottling: soft blotches so the layers are not flat colour
  for (let i = 0; i < 90; i++) {
    const x = r() * SOIL_W;
    const y = r() * SOIL_H;
    const rad = 14 + r() * 34;
    const light = r() > 0.5;
    wrap2(x, y, rad, (xx, yy) => {
      const gg = ctx.createRadialGradient(xx, yy, 0, xx, yy, rad);
      gg.addColorStop(0, light ? 'rgba(255,214,150,0.13)' : rgba(g.dirtDark, 0.2));
      gg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = gg;
      ctx.beginPath();
      ctx.ellipse(xx, yy, rad, rad * 0.6, r() * 3, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  // 3. grit
  for (let i = 0; i < 6500; i++) {
    const x = r() * SOIL_W;
    const y = r() * SOIL_H;
    const roll = r();
    ctx.fillStyle = roll < 0.4 ? 'rgba(255,225,170,0.3)' : roll < 0.8 ? rgba(g.outline, 0.3) : 'rgba(255,255,255,0.18)';
    const sz = 0.9 + r() * 1.7;
    ctx.fillRect(x, y, sz, sz * (0.7 + r() * 0.6));
  }

  // 4. wormholes
  ctx.lineCap = 'round';
  for (let i = 0; i < 7; i++) {
    const x = r() * SOIL_W;
    const y = r() * SOIL_H;
    wrap2(x, y, 60, (xx, yy) => {
      ctx.strokeStyle = rgba(g.outline, 0.45);
      ctx.lineWidth = 3 + r() * 2;
      ctx.beginPath();
      ctx.moveTo(xx, yy);
      ctx.bezierCurveTo(xx + 20 + r() * 20, yy - 16, xx + 30, yy + 22, xx + 52 + r() * 14, yy + (r() - 0.5) * 26);
      ctx.stroke();
      ctx.strokeStyle = rgba('#ffffff', 0.12);
      ctx.lineWidth = 1;
      ctx.stroke();
    });
  }

  // 5. roots
  const rootCol = fungus ? mix('#d8c0e8', g.dirtDark, 0.5) : mix('#c8a06a', g.dirtDark, 0.42);
  const nRoots = sand ? 3 : peat ? 17 : fungus ? 6 : 9;
  for (let i = 0; i < nRoots; i++) {
    const x = r() * SOIL_W;
    const y = r() * SOIL_H * 0.7;
    const thick = peat ? 1.5 : 1;
    wrap2(x, y, 170, (xx, yy) => rootSystem(ctx, xx, yy, Math.PI / 2 + (r() - 0.5) * (peat ? 2.4 : 1.2), 120 + r() * 120, (6 + r() * 6) * thick, r, rootCol, 2));
  }
  if (peat) {
    // waterlogged pockets, bubbles and snapped twigs
    for (let i = 0; i < 14; i++) {
      const x = r() * SOIL_W;
      const y = r() * SOIL_H;
      const rad = 20 + r() * 34;
      wrap2(x, y, rad, (xx, yy) => {
        const gg = ctx.createRadialGradient(xx, yy, 0, xx, yy, rad);
        gg.addColorStop(0, 'rgba(60,110,100,0.32)');
        gg.addColorStop(1, 'rgba(60,110,100,0)');
        ctx.fillStyle = gg;
        ctx.beginPath();
        ctx.ellipse(xx, yy, rad, rad * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
      });
    }
    ctx.lineCap = 'round';
    for (let i = 0; i < 26; i++) {
      const x = r() * SOIL_W;
      const y = r() * SOIL_H;
      wrap2(x, y, 40, (xx, yy) => {
        const a = (r() - 0.5) * 2.6;
        const l = 14 + r() * 22;
        ctx.strokeStyle = rgba('#2a1c10', 0.75);
        ctx.lineWidth = 2.6;
        ctx.beginPath();
        ctx.moveTo(xx, yy);
        ctx.lineTo(xx + Math.cos(a) * l, yy + Math.sin(a) * l);
        ctx.moveTo(xx + Math.cos(a) * l * 0.5, yy + Math.sin(a) * l * 0.5);
        ctx.lineTo(xx + Math.cos(a + 0.8) * l * 0.5 + Math.cos(a) * l * 0.5, yy + Math.sin(a + 0.8) * l * 0.5 + Math.sin(a) * l * 0.5);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(190,150,100,0.35)';
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.moveTo(xx, yy - 0.8);
        ctx.lineTo(xx + Math.cos(a) * l, yy + Math.sin(a) * l - 0.8);
        ctx.stroke();
      });
    }
    for (let i = 0; i < 40; i++) {
      wrap2(r() * SOIL_W, r() * SOIL_H, 6, (xx, yy) => {
        ctx.strokeStyle = 'rgba(190,230,220,0.35)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(xx, yy, 1.5 + r() * 2.5, 0, Math.PI * 2);
        ctx.stroke();
      });
    }
  }
  if (fungus) {
    // glowing mycelium threading through the soil
    const gl = look.glow ?? look.flora[0];
    for (let i = 0; i < 10; i++) {
      const x = r() * SOIL_W;
      const y = r() * SOIL_H;
      wrap2(x, y, 150, (xx, yy) => {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = rgba(gl, 0.18);
        ctx.lineWidth = 7;
        ctx.lineCap = 'round';
        const path = () => {
          ctx.beginPath();
          let px = xx;
          let py = yy;
          let a = r() * 6.28;
          ctx.moveTo(px, py);
          for (let k = 0; k < 8; k++) {
            a += (r() - 0.5) * 1.1;
            px += Math.cos(a) * 16;
            py += Math.sin(a) * 16;
            ctx.lineTo(px, py);
          }
        };
        path();
        ctx.stroke();
        ctx.strokeStyle = rgba(gl, 0.7);
        ctx.lineWidth = 1.6;
        ctx.stroke();
        ctx.restore();
      });
    }
    for (let i = 0; i < 70; i++) {
      wrap2(r() * SOIL_W, r() * SOIL_H, 10, (xx, yy) => {
        const gg = ctx.createRadialGradient(xx, yy, 0, xx, yy, 7);
        gg.addColorStop(0, rgba(gl, 0.85));
        gg.addColorStop(1, rgba(gl, 0));
        ctx.fillStyle = gg;
        ctx.fillRect(xx - 7, yy - 7, 14, 14);
      });
    }
  }

  // 6. buried stones, big and small, spread by jittered grid so they never clump or line up
  const st = [g.stone, mix(g.stone, '#a89880', 0.5), mix(g.stone, '#8a7a68', 0.4), mix(g.stone, '#d8cfb8', 0.5), mix(g.stone, g.dirt, 0.4)];
  const cols = sand ? 18 : 14;
  const rows = sand ? 8 : 6;
  for (let gy = 0; gy < rows; gy++) {
    for (let gx = 0; gx < cols; gx++) {
      if (r() < (peat ? 0.62 : sand ? 0.1 : 0.2)) continue;
      const x = ((gx + 0.15 + r() * 0.7) / cols) * SOIL_W;
      const y = ((gy + 0.15 + r() * 0.7) / rows) * SOIL_H;
      const big = r() < 0.22;
      const w = big ? 40 + r() * 34 : 13 + r() * 22;
      const h = w * (0.55 + r() * 0.35);
      wrap2(x, y, w, (xx, yy) => stoneBlob(ctx, xx, yy, w, h, (r() - 0.5) * 0.8, r, st[(r() * st.length) | 0], g.outline));
    }
  }
  // clustered pebbles
  for (let c = 0; c < 10; c++) {
    const cx = r() * SOIL_W;
    const cy = r() * SOIL_H;
    for (let k = 0; k < 6; k++) {
      const w = 6 + r() * 8;
      wrap2(cx + (r() - 0.5) * 60, cy + (r() - 0.5) * 30, w, (xx, yy) => stoneBlob(ctx, xx, yy, w, w * 0.7, r() * 3, r, st[(r() * st.length) | 0], g.outline));
    }
  }

  // 7. fossils and treasures
  wrap2(130 + r() * 200, 150 + r() * 200, 60, (x, y) => ammonite(ctx, x, y, 14 + r() * 5, r() * 6));
  wrap2(480 + r() * 200, 80 + r() * 300, 70, (x, y) => fishBones(ctx, x, y, 26, (r() - 0.5) * 0.7));
  wrap2(760 + r() * 200, 160 + r() * 200, 60, (x, y) => leafImprint(ctx, x, y, 28, (r() - 0.5) * 1.2));
  wrap2(300 + r() * 120, 380 + r() * 80, 60, (x, y) => leafImprint(ctx, x, y, 20, (r() - 0.5) * 1.6));
  // amber and gems catching the light
  const gems = ['#ffcf4a', '#ff8a3a', '#7be6ff', '#ff7aa8'];
  for (let i = 0; i < 6; i++) {
    const x = r() * SOIL_W;
    const y = r() * SOIL_H;
    const col = gems[i % gems.length];
    wrap2(x, y, 16, (xx, yy) => {
      const rr = 4 + r() * 3;
      ctx.beginPath();
      ctx.moveTo(xx, yy - rr * 1.3);
      ctx.lineTo(xx + rr, yy);
      ctx.lineTo(xx, yy + rr * 1.1);
      ctx.lineTo(xx - rr, yy);
      ctx.closePath();
      ctx.fillStyle = col;
      ctx.fill();
      ctx.strokeStyle = rgba(darken(col, 0.5), 0.8);
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.fillRect(xx - rr * 0.35, yy - rr * 0.9, rr * 0.4, rr * 0.5);
    });
  }
  return cv;
}

// ───────────────────────────── rock grounds ─────────────────────────────

/** cut [0, total] into n..m-wide pieces that sum exactly to total, so a row of blocks closes on itself and tiles */
function cuts(total: number, lo: number, hi: number, r: RNG): number[] {
  const out: number[] = [];
  let acc = 0;
  while (acc < total) {
    const w = lo + r() * (hi - lo);
    out.push(w);
    acc += w;
  }
  const k = total / acc;
  return out.map((w) => w * k);
}

function crackLine(ctx: CanvasRenderingContext2D, x: number, y: number, ang: number, len: number, r: RNG, col: string, lw: number) {
  ctx.strokeStyle = col;
  ctx.lineWidth = lw;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(x, y);
  let px = x;
  let py = y;
  let a = ang;
  const seg = Math.max(3, Math.round(len / 9));
  for (let i = 0; i < seg; i++) {
    a += (r() - 0.5) * 1.2;
    px += Math.cos(a) * (len / seg);
    py += Math.sin(a) * (len / seg);
    ctx.lineTo(px, py);
  }
  ctx.stroke();
}

/** a glyph chiselled into stone: dark cut with a pale lip below so it reads as engraved */
function glyph(ctx: CanvasRenderingContext2D, kind: number, cx: number, cy: number, s: number, dark: string) {
  const draw = (ox: number, oy: number, col: string, lw: number) => {
    ctx.save();
    ctx.translate(cx + ox, cy + oy);
    ctx.strokeStyle = col;
    ctx.lineWidth = lw;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    switch (kind % 6) {
      case 0: // spiral
        for (let a = 0; a < Math.PI * 5; a += 0.25) {
          const rr = s * (0.06 + a * 0.05);
          if (a === 0) ctx.moveTo(Math.cos(a) * rr, Math.sin(a) * rr);
          else ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
        }
        break;
      case 1: // eye
        ctx.moveTo(-s * 0.8, 0);
        ctx.quadraticCurveTo(0, -s * 0.75, s * 0.8, 0);
        ctx.quadraticCurveTo(0, s * 0.75, -s * 0.8, 0);
        ctx.moveTo(s * 0.22, 0);
        ctx.arc(0, 0, s * 0.22, 0, Math.PI * 2);
        break;
      case 2: // sun
        ctx.arc(0, 0, s * 0.3, 0, Math.PI * 2);
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2;
          ctx.moveTo(Math.cos(a) * s * 0.48, Math.sin(a) * s * 0.48);
          ctx.lineTo(Math.cos(a) * s * 0.82, Math.sin(a) * s * 0.82);
        }
        break;
      case 3: // stepped key
        ctx.moveTo(-s * 0.8, s * 0.5);
        ctx.lineTo(-s * 0.8, 0);
        ctx.lineTo(-s * 0.4, 0);
        ctx.lineTo(-s * 0.4, -s * 0.5);
        ctx.lineTo(0, -s * 0.5);
        ctx.lineTo(0, s * 0.1);
        ctx.lineTo(s * 0.4, s * 0.1);
        ctx.lineTo(s * 0.4, -s * 0.5);
        ctx.lineTo(s * 0.8, -s * 0.5);
        break;
      case 4: // zigzag serpent
        ctx.moveTo(-s * 0.9, 0);
        for (let i = 1; i <= 6; i++) ctx.lineTo(-s * 0.9 + i * s * 0.3, i % 2 ? -s * 0.35 : s * 0.35);
        ctx.moveTo(s * 0.95, -s * 0.05);
        ctx.arc(s * 0.9, -s * 0.05, s * 0.1, 0, Math.PI * 2);
        break;
      default: // leaf-and-vein
        ctx.moveTo(-s * 0.8, 0);
        ctx.quadraticCurveTo(0, -s * 0.7, s * 0.8, 0);
        ctx.quadraticCurveTo(0, s * 0.7, -s * 0.8, 0);
        ctx.moveTo(-s * 0.8, 0);
        ctx.lineTo(s * 0.6, 0);
        break;
    }
    ctx.stroke();
    ctx.restore();
  };
  draw(1, 1.2, 'rgba(255,245,220,0.28)', 2.4);
  draw(0, 0, dark, 2.2);
}

function stoneSurface(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: RNG, base: string, outline: string) {
  // per-block gradient, speckle and a lit top edge
  const t = tone(base, '#241a14');
  const gg = ctx.createLinearGradient(x, y, x + w * 0.4, y + h);
  gg.addColorStop(0, t.light);
  gg.addColorStop(0.5, t.mid);
  gg.addColorStop(1, t.dark);
  ctx.fillStyle = gg;
  ctx.fillRect(x, y, w, h);
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  for (let i = 0; i < w * h * 0.03; i++) {
    const roll = r();
    ctx.fillStyle = roll < 0.4 ? rgba(t.hi, 0.22) : roll < 0.8 ? rgba(outline, 0.2) : 'rgba(255,255,255,0.1)';
    const sz = 0.8 + r() * 1.5;
    ctx.fillRect(x + r() * w, y + r() * h, sz, sz);
  }
  // weather stains
  for (let i = 0; i < 3; i++) {
    const sx = x + r() * w;
    const gg2 = ctx.createLinearGradient(sx, y, sx, y + h);
    gg2.addColorStop(0, rgba(outline, 0.22));
    gg2.addColorStop(1, rgba(outline, 0));
    ctx.fillStyle = gg2;
    ctx.fillRect(sx - 2 - r() * 4, y, 4 + r() * 8, h * (0.5 + r() * 0.5));
  }
  ctx.restore();
  // bevel
  ctx.fillStyle = rgba(t.hi, 0.55);
  ctx.fillRect(x, y, w, 2.4);
  ctx.fillRect(x, y, 2, h);
  ctx.fillStyle = rgba(outline, 0.4);
  ctx.fillRect(x, y + h - 3, w, 3);
  ctx.fillRect(x + w - 2.4, y, 2.4, h);
}

/** carved ruin masonry: running-bond blocks, mortar, glyphs, cracks, ivy and roots */
function paintBlocks(look: Look, world: number): HTMLCanvasElement {
  const [cv, ctx] = canvas(SOIL_W, SOIL_H);
  const r = rng(world * 7919 + 303 + getSceneSeed() * 1013);
  const g = look.ground;
  ctx.fillStyle = darken(g.dirtDark, 0.4);
  ctx.fillRect(0, 0, SOIL_W, SOIL_H);
  const rowsN = 8;
  const rh = SOIL_H / rowsN;
  const palette = [g.dirt, mix(g.dirt, g.stone, 0.4), mix(g.dirt, g.dirtDark, 0.3), mix(g.dirt, '#e8d8b0', 0.3), mix(g.dirt, '#8a6a50', 0.25)];
  let glyphN = 0;
  const blocks: Array<{ x: number; y: number; w: number; h: number }> = [];
  for (let row = 0; row < rowsN; row++) {
    const ws = cuts(SOIL_W, 100, 200, r);
    let x = 0;
    const y = row * rh;
    for (const w of ws) {
      const gap = 3;
      const bx = x + gap / 2;
      const by = y + gap / 2;
      const bw = w - gap;
      const bh = rh - gap;
      stoneSurface(ctx, bx, by, bw, bh, r, palette[(r() * palette.length) | 0], g.outline);
      blocks.push({ x: bx, y: by, w: bw, h: bh });
      // chipped corner
      if (r() < 0.35) {
        ctx.fillStyle = darken(g.dirtDark, 0.5);
        const cx = r() < 0.5 ? bx : bx + bw;
        const dir = cx === bx ? 1 : -1;
        const cs = 5 + r() * 9;
        ctx.beginPath();
        ctx.moveTo(cx, by + bh);
        ctx.lineTo(cx + dir * cs, by + bh);
        ctx.lineTo(cx, by + bh - cs * 0.9);
        ctx.fill();
      }
      // crack
      if (r() < 0.35) crackLine(ctx, bx + bw * (0.2 + r() * 0.6), by, Math.PI / 2 + (r() - 0.5), bh * (0.5 + r() * 0.5), r, rgba(g.outline, 0.6), 1.2);
      // glyph
      if (bw > 120 && r() < 0.5) {
        glyph(ctx, glyphN++ + ((r() * 6) | 0), bx + bw / 2, by + bh / 2, Math.min(bh * 0.32, bw * 0.2), rgba(g.outline, 0.7));
      }
      x += w;
    }
  }
  // water stains running down across courses
  for (let i = 0; i < 16; i++) {
    const x = r() * SOIL_W;
    const y = r() * SOIL_H;
    const len = 60 + r() * 120;
    wrap2(x, y, len, (xx, yy) => {
      const gg = ctx.createLinearGradient(xx, yy, xx, yy + len);
      gg.addColorStop(0, rgba(g.outline, 0.26));
      gg.addColorStop(1, rgba(g.outline, 0));
      ctx.fillStyle = gg;
      ctx.fillRect(xx - 3, yy, 6 + r() * 5, len);
    });
  }
  // moss and ivy settling in the joints
  const moss = g.capDark;
  for (const b of blocks) {
    if (r() > 0.34) continue;
    const mx = b.x + r() * b.w;
    const n = 4 + ((r() * 6) | 0);
    for (let k = 0; k < n; k++) {
      const px = mx + (r() - 0.5) * 26;
      const py = b.y + b.h + 1 - r() * 4;
      ctx.fillStyle = r() < 0.5 ? moss : g.cap;
      ctx.beginPath();
      ctx.ellipse(px, py, 3 + r() * 5, 2.2 + r() * 3, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  // roots and vines crawling over the face
  const rootCol = mix('#7a5a34', g.dirtDark, 0.35);
  for (let i = 0; i < 7; i++) {
    const x = r() * SOIL_W;
    const y = r() * SOIL_H * 0.8;
    wrap2(x, y, 150, (xx, yy) => rootSystem(ctx, xx, yy, Math.PI / 2 + (r() - 0.5) * 1.5, 110 + r() * 110, 5 + r() * 5, r, rootCol, 2));
  }
  // ivy leaves along some roots
  for (let i = 0; i < 70; i++) {
    wrap2(r() * SOIL_W, r() * SOIL_H, 12, (xx, yy) => {
      ctx.fillStyle = i % 3 ? g.cap : g.capDark;
      ctx.strokeStyle = rgba(g.outline, 0.5);
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.ellipse(xx, yy, 6 + r() * 3, 3.4 + r() * 1.5, r() * 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });
  }
  return cv;
}

/** layered rock: stacked slabs with joints, cracks, wet sheen and, for caves, glowing crystal clusters */
function paintSlab(look: Look, world: number, cave: boolean): HTMLCanvasElement {
  const [cv, ctx] = canvas(SOIL_W, SOIL_H);
  const r = rng(world * 7919 + 505 + getSceneSeed() * 1013);
  const g = look.ground;
  const gl = look.glow ?? look.flora[0];
  ctx.fillStyle = darken(g.dirtDark, 0.45);
  ctx.fillRect(0, 0, SOIL_W, SOIL_H);
  const rowHs = cuts(SOIL_H, 38, 78, r);
  let y = 0;
  const palette = [g.dirt, mix(g.dirt, g.dirtDark, 0.35), mix(g.dirt, g.stone, 0.22), mix(g.dirt, g.dirtDark, 0.6), lighten(g.dirt, 0.05)];
  for (const rh of rowHs) {
    const ws = cuts(SOIL_W, 80, 230, r);
    let x = 0;
    for (const w of ws) {
      const gap = 3.2;
      const bx = x + gap / 2;
      const by = y + gap / 2;
      const bw = w - gap;
      const bh = rh - gap;
      // irregular slab silhouette
      const j = () => (r() - 0.5) * 3.2;
      const t = tone(palette[(r() * palette.length) | 0], '#0a1220');
      ctx.beginPath();
      ctx.moveTo(bx + 3, by + j());
      ctx.lineTo(bx + bw * 0.5, by + j() - 0.5);
      ctx.lineTo(bx + bw - 3, by + j());
      ctx.lineTo(bx + bw + j() * 0.4, by + bh * 0.5);
      ctx.lineTo(bx + bw - 3, by + bh + j());
      ctx.lineTo(bx + bw * 0.5, by + bh + j());
      ctx.lineTo(bx + 3, by + bh + j());
      ctx.lineTo(bx + j() * 0.4, by + bh * 0.5);
      ctx.closePath();
      const gg = ctx.createLinearGradient(bx, by, bx + bw * 0.3, by + bh);
      gg.addColorStop(0, t.light);
      gg.addColorStop(0.45, t.mid);
      gg.addColorStop(1, t.dark);
      ctx.fillStyle = gg;
      ctx.fill();
      ctx.save();
      ctx.clip();
      // strata flecks and speckle
      for (let k = 0; k < bw * bh * 0.02; k++) {
        const roll = r();
        ctx.fillStyle = roll < 0.45 ? rgba(t.hi, 0.2) : roll < 0.85 ? rgba(g.outline, 0.22) : 'rgba(255,255,255,0.09)';
        const sz = 0.8 + r() * 1.4;
        ctx.fillRect(bx + r() * bw, by + r() * bh, sz * (1 + r() * 2), sz);
      }
      ctx.strokeStyle = rgba(g.outline, 0.22);
      ctx.lineWidth = 1;
      for (let k = 0; k < 2; k++) {
        const yy = by + bh * (0.25 + r() * 0.55);
        ctx.beginPath();
        ctx.moveTo(bx, yy);
        ctx.bezierCurveTo(bx + bw * 0.3, yy + (r() - 0.5) * 6, bx + bw * 0.6, yy + (r() - 0.5) * 6, bx + bw, yy + (r() - 0.5) * 4);
        ctx.stroke();
      }
      // wet sheen
      const sh = ctx.createLinearGradient(bx, by, bx + bw, by);
      sh.addColorStop(0, 'rgba(255,255,255,0)');
      sh.addColorStop(0.3 + r() * 0.3, 'rgba(255,255,255,0.1)');
      sh.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = sh;
      ctx.fillRect(bx, by, bw, bh * 0.45);
      ctx.restore();
      ctx.fillStyle = rgba(t.hi, 0.5);
      ctx.fillRect(bx + 4, by + 0.6, bw - 8, 1.8);
      ctx.fillStyle = rgba(g.outline, 0.35);
      ctx.fillRect(bx + 4, by + bh - 2.6, bw - 8, 2.6);
      // crack
      if (r() < 0.3) crackLine(ctx, bx + bw * (0.15 + r() * 0.7), by + 1, Math.PI / 2 + (r() - 0.5) * 0.9, bh * (0.5 + r() * 0.5), r, rgba(g.outline, 0.6), 1.2);
      x += w;
    }
    y += rh;
  }
  // moss clinging to the joints
  const mossA = cave ? mix(g.cap, gl, 0.25) : g.capDark;
  for (let i = 0; i < 44; i++) {
    wrap2(r() * SOIL_W, r() * SOIL_H, 20, (xx, yy) => {
      for (let k = 0; k < 5; k++) {
        ctx.fillStyle = k % 2 ? mossA : g.cap;
        ctx.globalAlpha = 0.85;
        ctx.beginPath();
        ctx.ellipse(xx + (k - 2) * 5, yy + r() * 3, 3 + r() * 4, 2 + r() * 2.5, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    });
  }
  // seeping streaks
  for (let i = 0; i < 18; i++) {
    const x = r() * SOIL_W;
    const yy = r() * SOIL_H;
    const len = 50 + r() * 100;
    wrap2(x, yy, len, (xx, y2) => {
      const gg = ctx.createLinearGradient(xx, y2, xx, y2 + len);
      gg.addColorStop(0, rgba(cave ? gl : '#cfe8f0', cave ? 0.22 : 0.16));
      gg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = gg;
      ctx.fillRect(xx - 1.5, y2, 3, len);
    });
  }
  if (cave) {
    // glowing veins through the rock
    for (let i = 0; i < 9; i++) {
      wrap2(r() * SOIL_W, r() * SOIL_H, 120, (xx, yy) => {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        crackLine(ctx, xx, yy, r() * 6.28, 90 + r() * 90, r, rgba(gl, 0.2), 7);
        ctx.restore();
        crackLine(ctx, xx, yy, r() * 6.28, 70 + r() * 70, r, rgba(gl, 0.75), 1.5);
      });
    }
    // crystal clusters
    for (let i = 0; i < 22; i++) {
      wrap2(r() * SOIL_W, r() * SOIL_H, 40, (xx, yy) => {
        const n = 3 + ((r() * 3) | 0);
        const hue = i % 3 === 0 ? look.flora[1 % look.flora.length] : gl;
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const halo = ctx.createRadialGradient(xx, yy, 0, xx, yy, 34);
        halo.addColorStop(0, rgba(hue, 0.35));
        halo.addColorStop(1, rgba(hue, 0));
        ctx.fillStyle = halo;
        ctx.fillRect(xx - 34, yy - 34, 68, 68);
        ctx.restore();
        for (let k = 0; k < n; k++) {
          const a = -Math.PI / 2 + (k - (n - 1) / 2) * 0.55 + (r() - 0.5) * 0.25;
          const l = 12 + r() * 16;
          const wd = 3.6 + r() * 2.4;
          ctx.save();
          ctx.translate(xx, yy);
          ctx.rotate(a + Math.PI / 2);
          ctx.beginPath();
          ctx.moveTo(-wd, 0);
          ctx.lineTo(-wd, -l * 0.7);
          ctx.lineTo(0, -l);
          ctx.lineTo(wd, -l * 0.7);
          ctx.lineTo(wd, 0);
          ctx.closePath();
          const cg = ctx.createLinearGradient(-wd, 0, wd, 0);
          cg.addColorStop(0, lighten(hue, 0.5));
          cg.addColorStop(0.5, hue);
          cg.addColorStop(1, darken(hue, 0.45));
          ctx.fillStyle = cg;
          ctx.fill();
          ctx.strokeStyle = rgba(darken(hue, 0.7), 0.85);
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.fillStyle = 'rgba(255,255,255,0.7)';
          ctx.fillRect(-wd * 0.55, -l * 0.62, wd * 0.4, l * 0.4);
          ctx.restore();
        }
      });
    }
    // drifting glow specks
    for (let i = 0; i < 60; i++) {
      wrap2(r() * SOIL_W, r() * SOIL_H, 8, (xx, yy) => {
        const gg = ctx.createRadialGradient(xx, yy, 0, xx, yy, 5);
        gg.addColorStop(0, rgba(gl, 0.8));
        gg.addColorStop(1, rgba(gl, 0));
        ctx.fillStyle = gg;
        ctx.fillRect(xx - 5, yy - 5, 10, 10);
      });
    }
  } else {
    // pale mineral seams
    for (let i = 0; i < 10; i++) {
      wrap2(r() * SOIL_W, r() * SOIL_H, 90, (xx, yy) => crackLine(ctx, xx, yy, (r() - 0.5) * 0.6, 60 + r() * 90, r, 'rgba(230,240,245,0.35)', 1.6));
    }
  }
  return cv;
}

/** columnar basalt with lava glowing in the cracks */
function paintBasalt(look: Look, world: number): HTMLCanvasElement {
  const [cv, ctx] = canvas(SOIL_W, SOIL_H);
  const r = rng(world * 7919 + 707 + getSceneSeed() * 1013);
  const g = look.ground;
  ctx.fillStyle = '#0c0606';
  ctx.fillRect(0, 0, SOIL_W, SOIL_H);
  const cols = cuts(SOIL_W, 30, 66, r);
  const palette = [g.dirt, mix(g.dirt, g.dirtDark, 0.45), mix(g.dirt, g.stone, 0.18), mix(g.dirt, '#5a3a3a', 0.3)];
  let x = 0;
  const seams: Array<{ x: number; w: number }> = [];
  for (const w of cols) {
    const bx = x + 1.5;
    const bw = w - 3;
    const base = palette[(r() * palette.length) | 0];
    const t = tone(base, '#050303');
    const gg = ctx.createLinearGradient(bx, 0, bx + bw, 0);
    gg.addColorStop(0, t.light);
    gg.addColorStop(0.45, t.mid);
    gg.addColorStop(1, t.deep);
    ctx.fillStyle = gg;
    ctx.fillRect(bx, 0, bw, SOIL_H);
    // cross joints, staggered
    let y = r() * 60;
    while (y < SOIL_H + 60) {
      const h = 46 + r() * 70;
      for (const off of [0, -SOIL_H]) {
        const yy = y + off;
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(bx, yy, bw, 2.4);
        ctx.fillStyle = rgba(t.hi, 0.3);
        ctx.fillRect(bx, yy + 2.4, bw, 1.4);
        // segment shading
        const sg = ctx.createLinearGradient(0, yy, 0, yy + h);
        sg.addColorStop(0, 'rgba(255,255,255,0.07)');
        sg.addColorStop(1, 'rgba(0,0,0,0.18)');
        ctx.fillStyle = sg;
        ctx.fillRect(bx, yy + 4, bw, h - 4);
      }
      y += h;
    }
    // facets: a lit left edge
    ctx.fillStyle = rgba(t.hi, 0.35);
    ctx.fillRect(bx, 0, 2, SOIL_H);
    // pits and speckle
    for (let k = 0; k < bw * 5; k++) {
      ctx.fillStyle = r() < 0.5 ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.28)';
      ctx.fillRect(bx + r() * bw, r() * SOIL_H, 1 + r(), 1 + r());
    }
    seams.push({ x, w });
    x += w;
  }
  // lava glowing between columns and in cracks
  const lava = ['#ff5a14', '#ff9a2a', '#ffd25a'];
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (const s of seams) {
    let y = r() * 50;
    while (y < SOIL_H) {
      const len = 30 + r() * 120;
      if (r() < 0.55) {
        for (const off of [0, -SOIL_H, SOIL_H]) {
          ctx.strokeStyle = rgba(lava[0], 0.28);
          ctx.lineWidth = 8;
          ctx.beginPath();
          ctx.moveTo(s.x, y + off);
          ctx.lineTo(s.x, y + len + off);
          ctx.stroke();
          ctx.strokeStyle = rgba(lava[1], 0.85);
          ctx.lineWidth = 2.2;
          ctx.stroke();
          ctx.strokeStyle = rgba(lava[2], 0.9);
          ctx.lineWidth = 0.9;
          ctx.stroke();
        }
      }
      y += len + 20 + r() * 80;
    }
  }
  for (let i = 0; i < 16; i++) {
    wrap2(r() * SOIL_W, r() * SOIL_H, 100, (xx, yy) => {
      const a = r() * 6.28;
      crackLine(ctx, xx, yy, a, 50 + r() * 80, r, rgba(lava[0], 0.3), 7);
      crackLine(ctx, xx, yy, a, 40 + r() * 70, r, rgba(lava[1], 0.85), 1.8);
    });
  }
  for (let i = 0; i < 90; i++) {
    wrap2(r() * SOIL_W, r() * SOIL_H, 8, (xx, yy) => {
      const gg = ctx.createRadialGradient(xx, yy, 0, xx, yy, 6);
      gg.addColorStop(0, rgba(lava[1 + (i % 2)], 0.8));
      gg.addColorStop(1, rgba(lava[0], 0));
      ctx.fillStyle = gg;
      ctx.fillRect(xx - 6, yy - 6, 12, 12);
    });
  }
  ctx.restore();
  // soot and ash
  for (let i = 0; i < 40; i++) {
    wrap2(r() * SOIL_W, r() * SOIL_H, 40, (xx, yy) => {
      const gg = ctx.createRadialGradient(xx, yy, 0, xx, yy, 36);
      gg.addColorStop(0, 'rgba(0,0,0,0.3)');
      gg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = gg;
      ctx.beginPath();
      ctx.ellipse(xx, yy, 36, 22, 0, 0, Math.PI * 2);
      ctx.fill();
    });
  }
  return cv;
}


// ───────────────────────────── world 4: wet slate, with runnels of water ─────────────────────────────

function paintWetSlate(look: Look, world: number): HTMLCanvasElement {
  const cv = paintSlab(look, world, false);
  const ctx = cv.getContext('2d')!;
  const r = rng(world * 7919 + 411 + getSceneSeed() * 1013);
  // a cool sheen over everything, as if the rock had just been rained on
  const sheen = ctx.createLinearGradient(0, 0, SOIL_W, SOIL_H);
  sheen.addColorStop(0, 'rgba(170,215,235,0.16)');
  sheen.addColorStop(0.5, 'rgba(170,215,235,0.03)');
  sheen.addColorStop(1, 'rgba(170,215,235,0.16)');
  ctx.fillStyle = sheen;
  ctx.fillRect(0, 0, SOIL_W, SOIL_H);
  // runnels: thin streams that wander down the face and end in a drip
  ctx.lineCap = 'round';
  for (let i = 0; i < 46; i++) {
    const x = r() * SOIL_W;
    const y = r() * SOIL_H;
    const len = 90 + r() * 200;
    wrap2(x, y, 14, (xx, yy) => {
      const pts: Array<[number, number]> = [];
      let px = xx;
      for (let k = 0; k <= 10; k++) {
        px += (r() - 0.5) * 5;
        pts.push([px, yy + (k / 10) * len]);
      }
      const path = () => {
        ctx.beginPath();
        pts.forEach(([a, b], k) => (k === 0 ? ctx.moveTo(a, b) : ctx.lineTo(a, b)));
      };
      ctx.strokeStyle = 'rgba(20,60,85,0.34)';
      ctx.lineWidth = 9 + r() * 4;
      path();
      ctx.stroke();
      ctx.strokeStyle = 'rgba(130,215,245,0.5)';
      ctx.lineWidth = 4;
      path();
      ctx.stroke();
      ctx.strokeStyle = 'rgba(240,252,255,0.8)';
      ctx.lineWidth = 1.5;
      path();
      ctx.stroke();
      const [ex, ey] = pts[pts.length - 1];
      ctx.fillStyle = 'rgba(190,235,250,0.7)';
      ctx.beginPath();
      ctx.ellipse(ex, ey + 3, 3.4, 5, 0, 0, Math.PI * 2);
      ctx.fill();
    });
  }
  // dark wet patches and a few seeping pools
  for (let i = 0; i < 26; i++) {
    const x = r() * SOIL_W;
    const y = r() * SOIL_H;
    const rad = 16 + r() * 30;
    wrap2(x, y, rad, (xx, yy) => {
      const gg = ctx.createRadialGradient(xx, yy, 0, xx, yy, rad);
      gg.addColorStop(0, 'rgba(10,40,60,0.3)');
      gg.addColorStop(1, 'rgba(10,40,60,0)');
      ctx.fillStyle = gg;
      ctx.beginPath();
      ctx.ellipse(xx, yy, rad, rad * 0.55, 0, 0, Math.PI * 2);
      ctx.fill();
    });
  }
  return cv;
}

// ───────────────────────────── world 5: a rooted, petal-strewn floor ─────────────────────────────

function paintRooted(look: Look, world: number): HTMLCanvasElement {
  const cv = paintStrata(look, world, 'earth');
  const ctx = cv.getContext('2d')!;
  const r = rng(world * 7919 + 515 + getSceneSeed() * 1013);
  const g = look.ground;
  // great knotted roots through the soil: thick, pale and branching
  const rootCols = [mix('#e8c8d8', g.dirtDark, 0.35), mix('#d8a8c0', g.dirtDark, 0.45), mix('#c89ab4', g.dirtDark, 0.3)];
  for (let i = 0; i < 16; i++) {
    const x = r() * SOIL_W;
    const y = r() * SOIL_H * 0.8;
    wrap2(x, y, 200, (xx, yy) => rootSystem(ctx, xx, yy, Math.PI / 2 + (r() - 0.5) * 1.9, 150 + r() * 130, 9 + r() * 8, r, rootCols[(r() * 3) | 0], 2));
  }
  // fallen petals worked into the soil
  const cols = look.flora.concat(['#ffd0ec']);
  for (let i = 0; i < 190; i++) {
    const x = r() * SOIL_W;
    const y = r() * SOIL_H;
    const sz = 4 + r() * 5;
    const rot = r() * 6.28;
    const col = cols[(r() * cols.length) | 0];
    wrap2(x, y, sz * 2, (xx, yy) => {
      ctx.save();
      ctx.translate(xx, yy);
      ctx.rotate(rot);
      ctx.globalAlpha = 0.55 + r() * 0.35;
      ctx.beginPath();
      ctx.moveTo(-sz, 0);
      ctx.quadraticCurveTo(0, -sz * 0.75, sz, 0);
      ctx.quadraticCurveTo(0, sz * 0.75, -sz, 0);
      ctx.fillStyle = col;
      ctx.fill();
      ctx.strokeStyle = rgba(darken(col, 0.5), 0.6);
      ctx.lineWidth = 0.8;
      ctx.stroke();
      ctx.restore();
    });
  }
  return cv;
}

// ───────────────────────────── world 8: crystal-laden rock ─────────────────────────────

/** a fan of faceted crystals growing from (x, y) */
function crystalCluster(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, up: number, r: RNG, cols: string[], outline: string) {
  const n = 3 + ((r() * 3) | 0);
  // glow under the cluster
  const gl = ctx.createRadialGradient(x, y - size * 0.5, 0, x, y - size * 0.5, size * 1.4);
  gl.addColorStop(0, rgba(cols[0], 0.35));
  gl.addColorStop(1, rgba(cols[0], 0));
  ctx.fillStyle = gl;
  ctx.fillRect(x - size * 1.4, y - size * 1.9, size * 2.8, size * 2.4);
  for (let i = 0; i < n; i++) {
    const a = up + (i - (n - 1) / 2) * 0.38 + (r() - 0.5) * 0.25;
    const L = size * (0.55 + r() * 0.75);
    const wd = size * (0.13 + r() * 0.09);
    const col = cols[(r() * cols.length) | 0];
    const t = tone(col, outline);
    ctx.save();
    ctx.translate(x + (i - (n - 1) / 2) * size * 0.14, y);
    ctx.rotate(a - up);
    ctx.rotate(up + Math.PI / 2);
    // prism: base, shoulders, pointed tip
    ctx.beginPath();
    ctx.moveTo(-wd, 0);
    ctx.lineTo(-wd, -L * 0.72);
    ctx.lineTo(0, -L);
    ctx.lineTo(wd, -L * 0.72);
    ctx.lineTo(wd, 0);
    ctx.closePath();
    const gg = ctx.createLinearGradient(-wd, 0, wd, 0);
    gg.addColorStop(0, t.light);
    gg.addColorStop(0.55, t.mid);
    gg.addColorStop(1, t.dark);
    ctx.fillStyle = gg;
    ctx.fill();
    ctx.strokeStyle = rgba(outline, 0.85);
    ctx.lineWidth = 1.4;
    ctx.stroke();
    // lit facet and a glint
    ctx.beginPath();
    ctx.moveTo(-wd, -L * 0.1);
    ctx.lineTo(-wd, -L * 0.72);
    ctx.lineTo(0, -L);
    ctx.lineTo(-wd * 0.1, -L * 0.7);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255,255,255,0.32)';
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.fillRect(-wd * 0.55, -L * 0.62, wd * 0.3, L * 0.22);
    ctx.restore();
  }
}

function paintCrystal(look: Look, world: number): HTMLCanvasElement {
  const cv = paintStrata(look, world, 'fungus');
  const ctx = cv.getContext('2d')!;
  const r = rng(world * 7919 + 808 + getSceneSeed() * 1013);
  const g = look.ground;
  const cols = ['#c9a2ff', '#8fd0ff', '#f39af0', '#a58aff'];
  // geodes: a dark hollow lined with crystals, in rings of the soil
  for (let i = 0; i < 7; i++) {
    const x = (i + 0.2 + r() * 0.6) * (SOIL_W / 7);
    const y = 70 + r() * (SOIL_H - 140);
    const rw = 30 + r() * 20;
    const rh = rw * (0.62 + r() * 0.18);
    wrap2(x, y, rw + 6, (xx, yy) => {
      ctx.beginPath();
      ctx.ellipse(xx, yy, rw + 5, rh + 5, 0, 0, Math.PI * 2);
      ctx.fillStyle = mix(g.stone, g.dirtDark, 0.4);
      ctx.fill();
      ctx.strokeStyle = rgba(g.outline, 0.8);
      ctx.lineWidth = 1.6;
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(xx, yy, rw, rh, 0, 0, Math.PI * 2);
      const gg = ctx.createRadialGradient(xx, yy + rh * 0.3, 2, xx, yy, rw);
      gg.addColorStop(0, '#d9c0ff');
      gg.addColorStop(0.5, '#7a4fd0');
      gg.addColorStop(1, '#2a1560');
      ctx.fillStyle = gg;
      ctx.fill();
      // teeth of crystal around the rim
      for (let k = 0; k < 11; k++) {
        const a = (k / 11) * Math.PI * 2 + r() * 0.3;
        const bx = xx + Math.cos(a) * rw * 0.92;
        const by = yy + Math.sin(a) * rh * 0.92;
        ctx.beginPath();
        ctx.moveTo(bx + Math.cos(a + 1.57) * 3.5, by + Math.sin(a + 1.57) * 3.5);
        ctx.lineTo(bx - Math.cos(a) * (8 + r() * 7), by - Math.sin(a) * (8 + r() * 7));
        ctx.lineTo(bx - Math.cos(a + 1.57) * 3.5, by - Math.sin(a + 1.57) * 3.5);
        ctx.closePath();
        ctx.fillStyle = k % 3 === 0 ? '#f3e6ff' : '#b090f0';
        ctx.fill();
        ctx.strokeStyle = rgba('#1a0a40', 0.7);
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
    });
  }
  // veins and clusters of crystals pushing out of the rock
  for (let i = 0; i < 40; i++) {
    const x = r() * SOIL_W;
    const y = 30 + r() * (SOIL_H - 30);
    const size = 26 + r() * 30;
    wrap2(x, y, size * 1.6, (xx, yy) => crystalCluster(ctx, xx, yy, size, -Math.PI / 2 + (r() - 0.5) * 1.6, r, cols, '#120626'));
  }
  // sparkle dust
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 90; i++) {
    wrap2(r() * SOIL_W, r() * SOIL_H, 6, (xx, yy) => {
      ctx.fillStyle = rgba(cols[(r() * cols.length) | 0], 0.7);
      ctx.fillRect(xx - 0.8, yy - 3, 1.6, 6);
      ctx.fillRect(xx - 3, yy - 0.8, 6, 1.6);
    });
  }
  ctx.restore();
  return cv;
}

// ───────────────────────────── world 10: riveted iron plate, lit from the seams ─────────────────────────────

function paintIron(look: Look, world: number): HTMLCanvasElement {
  const [cv, ctx] = canvas(SOIL_W, SOIL_H);
  const r = rng(world * 7919 + 1010 + getSceneSeed() * 1013);
  const g = look.ground;
  ctx.fillStyle = '#07040a';
  ctx.fillRect(0, 0, SOIL_W, SOIL_H);
  const rowsN = 8;
  const rh = SOIL_H / rowsN;
  const metals = [mix(g.dirt, g.stone, 0.28), mix(g.dirt, g.stone, 0.42), mix(g.dirt, g.stone, 0.18), mix(g.dirt, '#5a3a52', 0.3)];
  const seamCol = '#ff4a62';
  const glowSeams: Array<{ x: number; y: number; w: number }> = [];
  for (let row = 0; row < rowsN; row++) {
    const y = row * rh;
    const plates = cuts(SOIL_W, 120, 210, r);
    let x = 0;
    for (const w of plates) {
      const bx = x + 2;
      const by = y + 2;
      const bw = w - 4;
      const bh = rh - 4;
      const t = tone(metals[(r() * metals.length) | 0], '#06030a');
      const gg = ctx.createLinearGradient(bx, by, bx + bw * 0.5, by + bh);
      gg.addColorStop(0, t.light);
      gg.addColorStop(0.5, t.mid);
      gg.addColorStop(1, t.dark);
      ctx.fillStyle = gg;
      ctx.fillRect(bx, by, bw, bh);
      ctx.save();
      ctx.beginPath();
      ctx.rect(bx, by, bw, bh);
      ctx.clip();
      // brushed grain
      for (let k = 0; k < bh / 2.2; k++) {
        ctx.fillStyle = r() > 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.12)';
        ctx.fillRect(bx, by + k * 2.2, bw, 1);
      }
      // scorch and rust bloom
      for (let k = 0; k < 2; k++) {
        const sx = bx + r() * bw;
        const sy = by + r() * bh;
        const rad = 14 + r() * 22;
        const sg = ctx.createRadialGradient(sx, sy, 0, sx, sy, rad);
        sg.addColorStop(0, r() > 0.5 ? 'rgba(120,40,30,0.28)' : 'rgba(0,0,0,0.3)');
        sg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = sg;
        ctx.fillRect(sx - rad, sy - rad, rad * 2, rad * 2);
      }
      // a few scratches
      ctx.strokeStyle = 'rgba(255,255,255,0.12)';
      ctx.lineWidth = 0.8;
      for (let k = 0; k < 3; k++) {
        const sx = bx + r() * bw;
        const sy = by + r() * bh;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx + (r() - 0.3) * 30, sy + (r() - 0.5) * 8);
        ctx.stroke();
      }
      ctx.restore();
      // bevel
      ctx.fillStyle = rgba(t.hi, 0.5);
      ctx.fillRect(bx, by, bw, 2.2);
      ctx.fillRect(bx, by, 2, bh);
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(bx, by + bh - 3, bw, 3);
      ctx.fillRect(bx + bw - 2.4, by, 2.4, bh);
      // rivets
      for (const [rx, ry] of [[bx + 7, by + 7], [bx + bw - 7, by + 7], [bx + 7, by + bh - 8], [bx + bw - 7, by + bh - 8]]) {
        ctx.beginPath();
        ctx.arc(rx, ry, 3.1, 0, Math.PI * 2);
        ctx.fillStyle = t.mid;
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.7)';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fillRect(rx - 1.4, ry - 1.5, 1.4, 1.4);
      }
      if (r() < 0.2) glowSeams.push({ x: bx, y: by + bh - 1, w: bw });
      x += w;
    }
  }
  // seams that glow crimson where the keep's forge heat leaks through
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (const s2 of glowSeams) {
    const sg = ctx.createLinearGradient(0, s2.y - 7, 0, s2.y + 7);
    sg.addColorStop(0, 'rgba(255,60,80,0)');
    sg.addColorStop(0.5, 'rgba(255,60,80,0.55)');
    sg.addColorStop(1, 'rgba(255,60,80,0)');
    ctx.fillStyle = sg;
    ctx.fillRect(s2.x, s2.y - 7, s2.w, 14);
    ctx.fillStyle = 'rgba(255,170,150,0.8)';
    ctx.fillRect(s2.x + 4, s2.y - 0.6, s2.w - 8, 1.2);
  }
  ctx.restore();
  void seamCol;
  return cv;
}

function paintSoil(look: Look, world: number): HTMLCanvasElement {
  const style = GROUND_STYLE[world] ?? 'earth';
  if (style === 'blocks') return paintBlocks(look, world);
  if (style === 'slate') return paintSlab(look, world, false);
  if (style === 'cave') return paintSlab(look, world, true);
  if (style === 'basalt') return paintBasalt(look, world);
  if (style === 'wetslate') return paintWetSlate(look, world);
  if (style === 'iron') return paintIron(look, world);
  if (style === 'crystal') return paintCrystal(look, world);
  if (style === 'rooted') return paintRooted(look, world);
  return paintStrata(look, world, style);
}

// ───────────────────────────── the grass cap strip ─────────────────────────────

function blade(ctx: CanvasRenderingContext2D, x: number, y: number, h: number, w: number, lean: number, base: string, tip: string) {
  const g = ctx.createLinearGradient(x, y, x + lean, y - h);
  g.addColorStop(0, base);
  g.addColorStop(1, tip);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(x - w, y);
  ctx.quadraticCurveTo(x - w * 0.3 + lean * 0.35, y - h * 0.6, x + lean, y - h);
  ctx.quadraticCurveTo(x + w * 0.5 + lean * 0.4, y - h * 0.55, x + w, y);
  ctx.closePath();
  ctx.fill();
}

function paintGrassCap(look: Look, world: number, blossom = false): HTMLCanvasElement {
  const [cv, ctx] = canvas(CAP_W, CAP_H);
  const r = rng(world * 3331 + 17 + getSceneSeed() * 1013);
  const g = look.ground;
  const dark = darken(g.capDark, 0.2);
  const BODY_TOP = 30;
  const BODY_BOT = 46;
  const wrapX = (x: number, rad: number, fn: (x: number) => void) => {
    fn(x);
    if (x < rad) fn(x + CAP_W);
    if (x > CAP_W - rad) fn(x - CAP_W);
  };

  // dark back row of tall blades (behind everything)
  for (let x = 0; x < CAP_W; x += 5 + r() * 3) {
    wrapX(x, 24, (xx) => blade(ctx, xx, BODY_TOP + 6, 18 + r() * 14, 2.2, (r() - 0.5) * 12, dark, g.capDark));
  }
  // body with drips
  ctx.beginPath();
  ctx.moveTo(0, BODY_TOP);
  ctx.lineTo(CAP_W, BODY_TOP);
  ctx.lineTo(CAP_W, BODY_BOT);
  const step = 16;
  const pts: number[] = [];
  for (let x = CAP_W; x >= 0; x -= step) {
    // drip depth must match at x=0 and x=CAP_W: use a smooth periodic function of x plus jitter chosen per index
    const u = x / CAP_W;
    const d = 5 + 9 * Math.max(0, Math.sin(u * Math.PI * 2 * 11 + 0.7)) + 6 * Math.max(0, Math.sin(u * Math.PI * 2 * 5 + 2)) * Math.sin(u * Math.PI * 2 * 17);
    pts.push(d);
  }
  let idx = 0;
  for (let x = CAP_W; x >= 0; x -= step) {
    const d = pts[idx++];
    ctx.quadraticCurveTo(x - step * 0.5 + 3, BODY_BOT + d * 1.3, x - step + 2, BODY_BOT + d * 0.4);
  }
  ctx.closePath();
  const bg = ctx.createLinearGradient(0, BODY_TOP, 0, BODY_BOT + 16);
  bg.addColorStop(0, g.cap);
  bg.addColorStop(0.55, mix(g.cap, g.capDark, 0.5));
  bg.addColorStop(1, g.capDark);
  ctx.fillStyle = bg;
  ctx.fill();
  // moss strands + clover flecks on the face
  ctx.strokeStyle = rgba(g.capDark, 0.6);
  ctx.lineWidth = 1.2;
  for (let i = 0; i < 26; i++) {
    const x = r() * CAP_W;
    wrapX(x, 8, (xx) => {
      ctx.beginPath();
      ctx.moveTo(xx, BODY_BOT - 2);
      ctx.quadraticCurveTo(xx + (r() - 0.5) * 6, BODY_BOT + 8, xx + (r() - 0.5) * 4, BODY_BOT + 12 + r() * 14);
      ctx.stroke();
    });
  }
  ctx.fillStyle = rgba(g.capHi, 0.5);
  for (let i = 0; i < 40; i++) {
    wrapX(r() * CAP_W, 6, (xx) => {
      ctx.beginPath();
      ctx.ellipse(xx, BODY_TOP + 4 + r() * 10, 3.2, 1.3, (r() - 0.5) * 0.9, 0, Math.PI * 2);
      ctx.fill();
    });
  }
  // mid row of blades
  for (let x = 0; x < CAP_W; x += 4 + r() * 3) {
    wrapX(x, 24, (xx) => blade(ctx, xx, BODY_TOP + 3, 14 + r() * 16, 2.4, (r() - 0.5) * 16, g.capDark, g.cap));
  }
  // bright front row, some tipped with light
  for (let x = 0; x < CAP_W; x += 6 + r() * 5) {
    wrapX(x, 24, (xx) => blade(ctx, xx, BODY_TOP + 4, 9 + r() * 14, 2.7, (r() - 0.5) * 18, g.cap, g.capHi));
  }
  // a few seed-heads and tiny clover leaves to break the rhythm
  for (let i = 0; i < 9; i++) {
    const x = r() * CAP_W;
    wrapX(x, 10, (xx) => {
      const h = 20 + r() * 12;
      ctx.strokeStyle = g.cap;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(xx, BODY_TOP + 4);
      ctx.quadraticCurveTo(xx + 5, BODY_TOP - h * 0.5, xx + 7, BODY_TOP + 4 - h);
      ctx.stroke();
      ctx.fillStyle = '#f4e9a8';
      for (let k = 0; k < 5; k++) {
        ctx.beginPath();
        ctx.ellipse(xx + 7 + (k - 2) * 1.8, BODY_TOP + 4 - h - k * 0.4, 1.4, 2.6, (k - 2) * 0.3, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }
  if (blossom) {
    // little blooms and fallen petals scattered over the turf
    for (let i = 0; i < 16; i++) {
      const x = r() * CAP_W;
      const col = look.flora[i % look.flora.length];
      wrapX(x, 14, (xx) => {
        const h = 10 + r() * 14;
        ctx.strokeStyle = g.capDark;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(xx, BODY_TOP + 5);
        ctx.lineTo(xx + (r() - 0.5) * 4, BODY_TOP + 5 - h);
        ctx.stroke();
        drawBloom(ctx, i % 2 ? 'daisy' : 'plumeria', xx, BODY_TOP + 4 - h, 5 + r() * 2.5, col, '#fff3a0', r() * 6, r);
      });
    }
    for (let i = 0; i < 60; i++) {
      wrapX(r() * CAP_W, 6, (xx) => {
        ctx.fillStyle = rgba(look.flora[i % look.flora.length], 0.85);
        ctx.beginPath();
        ctx.ellipse(xx, BODY_TOP + 3 + r() * 14, 2.2, 1.1, r() * 3, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  }
  lip(ctx, g.capHi);
  return cv;
}

function lip(ctx: CanvasRenderingContext2D, col: string) {
  ctx.strokeStyle = rgba(col, 0.55);
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(0, 32);
  ctx.lineTo(CAP_W, 32);
  ctx.stroke();
}

/** a drippy body shared by the non-grass caps; `d(u)` is the drip depth at u in 0..1 and must be periodic */
function capBody(ctx: CanvasRenderingContext2D, top: number, bot: number, fill: CanvasGradient | string, d: (u: number) => number) {
  const step = 16;
  ctx.beginPath();
  ctx.moveTo(0, top);
  ctx.lineTo(CAP_W, top);
  ctx.lineTo(CAP_W, bot);
  for (let x = CAP_W; x > 0; x -= step) {
    const dd = d(x / CAP_W);
    ctx.quadraticCurveTo(x - step * 0.5 + 3, bot + dd * 1.3, x - step + 2, bot + dd * 0.4);
  }
  ctx.lineTo(0, bot);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

const periodic = (u: number, a: number, b: number) => 5 + 9 * Math.max(0, Math.sin(u * Math.PI * 2 * a + 0.7)) + 5 * Math.max(0, Math.sin(u * Math.PI * 2 * b + 2));

/** thick velvety moss (damp rock) and its glowing cousin for the cave and twilight worlds */
function paintMossCap(look: Look, world: number, glowing: boolean): HTMLCanvasElement {
  const [cv, ctx] = canvas(CAP_W, CAP_H);
  const r = rng(world * 3331 + 29 + getSceneSeed() * 1013);
  const g = look.ground;
  const gl = look.glow ?? look.flora[0];
  const TOP = 32;
  const BOT = 46;
  const wrapX = (x: number, rad: number, fn: (x: number) => void) => {
    fn(x);
    if (x < rad) fn(x + CAP_W);
    if (x > CAP_W - rad) fn(x - CAP_W);
  };
  const bg = ctx.createLinearGradient(0, TOP, 0, BOT + 14);
  bg.addColorStop(0, g.cap);
  bg.addColorStop(0.5, mix(g.cap, g.capDark, 0.55));
  bg.addColorStop(1, g.capDark);
  capBody(ctx, TOP, BOT, bg, (u) => periodic(u, 9, 4));
  // lumpy cushions along the top: overlapping domes in three tones
  for (const [row, col, hi] of [[0, g.capDark, g.cap], [1, g.cap, g.capHi], [2, mix(g.cap, g.capHi, 0.4), lighten(g.capHi, 0.2)]] as Array<[number, string, string]>) {
    for (let x = -8; x < CAP_W + 8; x += 9 + r() * 7) {
      const rad = 7 + r() * 6 - row * 1.2;
      const cy = TOP + 4 - row * 3 - r() * 4;
      wrapX(x, rad + 2, (xx) => {
        const gg = ctx.createRadialGradient(xx - rad * 0.3, cy - rad * 0.4, 0, xx, cy, rad);
        gg.addColorStop(0, hi);
        gg.addColorStop(1, col);
        ctx.fillStyle = gg;
        ctx.beginPath();
        ctx.ellipse(xx, cy, rad, rad * 0.78, 0, Math.PI, 0);
        ctx.lineTo(xx + rad, cy + 6);
        ctx.lineTo(xx - rad, cy + 6);
        ctx.closePath();
        ctx.fill();
      });
    }
  }
  // fern fiddleheads and tiny sprouts
  for (let i = 0; i < 14; i++) {
    wrapX(r() * CAP_W, 14, (xx) => {
      const h = 12 + r() * 12;
      ctx.strokeStyle = g.capHi;
      ctx.lineWidth = 1.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(xx, TOP + 4);
      ctx.bezierCurveTo(xx + 2, TOP - h * 0.5, xx + 9, TOP - h, xx + 6, TOP - h + 5);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(xx + 5.2, TOP - h + 5.6, 1.9, 0, Math.PI * 2);
      ctx.stroke();
    });
  }
  // hanging strands
  ctx.strokeStyle = rgba(g.capDark, 0.7);
  ctx.lineWidth = 1.3;
  for (let i = 0; i < 24; i++) {
    wrapX(r() * CAP_W, 8, (xx) => {
      ctx.beginPath();
      ctx.moveTo(xx, BOT - 2);
      ctx.quadraticCurveTo(xx + (r() - 0.5) * 6, BOT + 8, xx + (r() - 0.5) * 4, BOT + 12 + r() * 14);
      ctx.stroke();
    });
  }
  if (glowing) {
    // bioluminescent specks and tiny glowing caps
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 46; i++) {
      wrapX(r() * CAP_W, 8, (xx) => {
        const yy = TOP - 4 + r() * 18;
        const gg = ctx.createRadialGradient(xx, yy, 0, xx, yy, 6);
        gg.addColorStop(0, rgba(gl, 0.95));
        gg.addColorStop(1, rgba(gl, 0));
        ctx.fillStyle = gg;
        ctx.fillRect(xx - 6, yy - 6, 12, 12);
      });
    }
    ctx.restore();
    for (let i = 0; i < 9; i++) {
      wrapX(r() * CAP_W, 10, (xx) => {
        const h = 7 + r() * 8;
        const col = look.flora[i % look.flora.length];
        ctx.fillStyle = '#e8e2d8';
        ctx.fillRect(xx - 1.2, TOP + 2 - h, 2.4, h + 2);
        ctx.save();
        ctx.shadowColor = col;
        ctx.shadowBlur = 6;
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.ellipse(xx, TOP + 2 - h, 4.6 + r() * 2, 3.2, 0, Math.PI, 0);
        ctx.fill();
        ctx.restore();
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.fillRect(xx - 2, TOP - h - 0.5, 1.4, 1.2);
      });
    }
  }
  lip(ctx, g.capHi);
  return cv;
}

/** swamp mud edge with tall reeds, cattails and low sedge */
function paintReedCap(look: Look, world: number): HTMLCanvasElement {
  const [cv, ctx] = canvas(CAP_W, CAP_H);
  const r = rng(world * 3331 + 43 + getSceneSeed() * 1013);
  const g = look.ground;
  const TOP = 34;
  const BOT = 48;
  const wrapX = (x: number, rad: number, fn: (x: number) => void) => {
    fn(x);
    if (x < rad) fn(x + CAP_W);
    if (x > CAP_W - rad) fn(x - CAP_W);
  };
  const stalk = (xx: number, base: number, h: number, lean: number, col: string, lw: number) => {
    ctx.strokeStyle = col;
    ctx.lineWidth = lw;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(xx, base);
    ctx.quadraticCurveTo(xx + lean * 0.3, base - h * 0.55, xx + lean, base - h);
    ctx.stroke();
  };
  // back reeds
  for (let x = 0; x < CAP_W; x += 6 + r() * 5) wrapX(x, 20, (xx) => stalk(xx, TOP + 4, 16 + r() * 18, (r() - 0.5) * 14, g.capDark, 1.8));
  // muddy bank
  const mud = mix(g.dirt, g.dirtDark, 0.55);
  const bg = ctx.createLinearGradient(0, TOP, 0, BOT + 14);
  bg.addColorStop(0, mix(g.cap, mud, 0.45));
  bg.addColorStop(0.35, mud);
  bg.addColorStop(1, g.dirtDark);
  capBody(ctx, TOP, BOT, bg, (u) => periodic(u, 7, 3));
  // wet sheen and algae on the mud
  ctx.fillStyle = 'rgba(190,230,215,0.2)';
  for (let i = 0; i < 24; i++) {
    wrapX(r() * CAP_W, 12, (xx) => {
      ctx.beginPath();
      ctx.ellipse(xx, TOP + 3 + r() * 10, 6 + r() * 8, 1.2, 0, 0, Math.PI * 2);
      ctx.fill();
    });
  }
  ctx.fillStyle = rgba(g.cap, 0.8);
  for (let i = 0; i < 30; i++) {
    wrapX(r() * CAP_W, 8, (xx) => {
      ctx.beginPath();
      ctx.ellipse(xx, TOP + 2 + r() * 9, 3 + r() * 3, 1.5, 0, 0, Math.PI * 2);
      ctx.fill();
    });
  }
  // sedge tufts
  for (let x = 0; x < CAP_W; x += 5 + r() * 4) {
    wrapX(x, 20, (xx) => blade(ctx, xx, TOP + 4, 8 + r() * 10, 2, (r() - 0.5) * 12, g.capDark, g.cap));
  }
  // tall reeds with cattail heads
  for (let i = 0; i < 20; i++) {
    wrapX(r() * CAP_W, 18, (xx) => {
      const h = 22 + r() * 16;
      const lean = (r() - 0.5) * 12;
      stalk(xx, TOP + 4, h, lean, i % 2 ? g.cap : g.capHi, 1.8);
      if (i % 3 === 0) {
        ctx.strokeStyle = '#5a3a20';
        ctx.lineWidth = 3.4;
        ctx.beginPath();
        ctx.moveTo(xx + lean, TOP + 4 - h);
        ctx.lineTo(xx + lean + 0.6, TOP + 4 - h - 8);
        ctx.stroke();
        ctx.strokeStyle = g.capHi;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(xx + lean + 0.6, TOP + 4 - h - 8);
        ctx.lineTo(xx + lean + 1, TOP + 4 - h - 13);
        ctx.stroke();
      }
    });
  }
  // dangling roots
  ctx.strokeStyle = rgba('#2a1c10', 0.7);
  ctx.lineWidth = 1.4;
  for (let i = 0; i < 22; i++) {
    wrapX(r() * CAP_W, 8, (xx) => {
      ctx.beginPath();
      ctx.moveTo(xx, BOT - 2);
      ctx.quadraticCurveTo(xx + (r() - 0.5) * 8, BOT + 8, xx + (r() - 0.5) * 6, BOT + 12 + r() * 14);
      ctx.stroke();
    });
  }
  lip(ctx, g.capHi);
  return cv;
}

/** scorched crust: cracked plates of cooled slag with glowing seams and jagged shards */
function paintAshCap(look: Look, world: number): HTMLCanvasElement {
  const [cv, ctx] = canvas(CAP_W, CAP_H);
  const r = rng(world * 3331 + 61 + getSceneSeed() * 1013);
  const g = look.ground;
  const TOP = 32;
  const BOT = 47;
  const wrapX = (x: number, rad: number, fn: (x: number) => void) => {
    fn(x);
    if (x < rad) fn(x + CAP_W);
    if (x > CAP_W - rad) fn(x - CAP_W);
  };
  // jagged shards behind
  for (let x = 0; x < CAP_W; x += 7 + r() * 9) {
    wrapX(x, 14, (xx) => {
      const h = 8 + r() * 16;
      const w = 4 + r() * 6;
      ctx.fillStyle = r() < 0.5 ? g.capDark : darken(g.cap, 0.2);
      ctx.beginPath();
      ctx.moveTo(xx - w, TOP + 5);
      ctx.lineTo(xx - w * 0.2 + (r() - 0.5) * 3, TOP + 5 - h);
      ctx.lineTo(xx + w, TOP + 5);
      ctx.closePath();
      ctx.fill();
    });
  }
  const bg = ctx.createLinearGradient(0, TOP, 0, BOT + 14);
  bg.addColorStop(0, g.cap);
  bg.addColorStop(0.5, mix(g.cap, g.capDark, 0.6));
  bg.addColorStop(1, g.capDark);
  capBody(ctx, TOP, BOT, bg, (u) => periodic(u, 8, 5) * 0.8);
  // plates
  ctx.strokeStyle = rgba('#0a0505', 0.7);
  ctx.lineWidth = 1.4;
  for (let x = 0; x < CAP_W; x += 22 + r() * 18) {
    ctx.beginPath();
    ctx.moveTo(x, TOP + 2);
    ctx.lineTo(x + (r() - 0.5) * 8, BOT + 4);
    ctx.stroke();
  }
  // glowing seams
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 12; i++) {
    wrapX(r() * CAP_W, 30, (xx) => {
      const y0 = TOP + 6 + r() * 8;
      crackLine(ctx, xx, y0, (r() - 0.5) * 1.2, 16 + r() * 22, r, 'rgba(255,90,20,0.35)', 5);
    });
  }
  ctx.restore();
  for (let i = 0; i < 12; i++) {
    wrapX(r() * CAP_W, 30, (xx) => {
      const y0 = TOP + 6 + r() * 8;
      crackLine(ctx, xx, y0, (r() - 0.5) * 1.2, 14 + r() * 20, r, 'rgba(255,170,60,0.95)', 1.4);
    });
  }
  // embers resting on top
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 26; i++) {
    wrapX(r() * CAP_W, 8, (xx) => {
      const yy = TOP - 6 + r() * 20;
      const gg = ctx.createRadialGradient(xx, yy, 0, xx, yy, 5);
      gg.addColorStop(0, 'rgba(255,190,70,0.95)');
      gg.addColorStop(1, 'rgba(255,90,20,0)');
      ctx.fillStyle = gg;
      ctx.fillRect(xx - 5, yy - 5, 10, 10);
    });
  }
  ctx.restore();
  lip(ctx, g.capHi);
  return cv;
}

/** carved stone lip with moss tufts and creeping ivy */
function paintRuinCap(look: Look, world: number): HTMLCanvasElement {
  const [cv, ctx] = canvas(CAP_W, CAP_H);
  const r = rng(world * 3331 + 79 + getSceneSeed() * 1013);
  const g = look.ground;
  const TOP = 32;
  const wrapX = (x: number, rad: number, fn: (x: number) => void) => {
    fn(x);
    if (x < rad) fn(x + CAP_W);
    if (x > CAP_W - rad) fn(x - CAP_W);
  };
  // low grass behind the lip
  for (let x = 0; x < CAP_W; x += 5 + r() * 4) wrapX(x, 20, (xx) => blade(ctx, xx, TOP + 5, 8 + r() * 12, 2.2, (r() - 0.5) * 14, g.capDark, g.cap));
  // a course of capstones
  const ws = cuts(CAP_W, 70, 130, r);
  let x = 0;
  for (const w of ws) {
    const bx = x + 1.2;
    const bw = w - 2.4;
    const t = tone(mix(g.dirt, g.stone, 0.5), '#241a14');
    const gg = ctx.createLinearGradient(0, TOP, 0, TOP + 22);
    gg.addColorStop(0, t.hi);
    gg.addColorStop(0.2, t.light);
    gg.addColorStop(1, t.dark);
    ctx.fillStyle = gg;
    ctx.beginPath();
    ctx.moveTo(bx + 3, TOP);
    ctx.lineTo(bx + bw - 3, TOP);
    ctx.lineTo(bx + bw, TOP + 3);
    ctx.lineTo(bx + bw, TOP + 22);
    ctx.lineTo(bx, TOP + 22);
    ctx.lineTo(bx, TOP + 3);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = rgba(g.outline, 0.7);
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fillRect(bx + 4, TOP + 1, bw - 8, 1.8);
    for (let k = 0; k < bw * 0.5; k++) {
      ctx.fillStyle = r() < 0.5 ? 'rgba(255,255,255,0.14)' : rgba(g.outline, 0.22);
      ctx.fillRect(bx + r() * bw, TOP + 3 + r() * 18, 1.2, 1.2);
    }
    if (r() < 0.4) crackLine(ctx, bx + bw * (0.2 + r() * 0.6), TOP + 2, Math.PI / 2, 14, r, rgba(g.outline, 0.6), 1.1);
    x += w;
  }
  // moss tufts and ivy spilling over the edge
  for (let i = 0; i < 20; i++) {
    wrapX(r() * CAP_W, 14, (xx) => {
      const yy = TOP + 1 + r() * 2;
      for (let k = 0; k < 5; k++) {
        ctx.fillStyle = k % 2 ? g.cap : g.capDark;
        ctx.beginPath();
        ctx.ellipse(xx + (k - 2) * 3.6, yy - r() * 2, 3.2 + r() * 2.4, 2.2 + r() * 1.4, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }
  ctx.strokeStyle = g.capDark;
  ctx.lineWidth = 1.4;
  for (let i = 0; i < 12; i++) {
    wrapX(r() * CAP_W, 12, (xx) => {
      const l = 12 + r() * 18;
      ctx.beginPath();
      ctx.moveTo(xx, TOP + 18);
      ctx.bezierCurveTo(xx + 4, TOP + 18 + l * 0.4, xx - 4, TOP + 18 + l * 0.7, xx + 1, TOP + 18 + l);
      ctx.stroke();
      for (let k = 1; k <= 3; k++) {
        ctx.fillStyle = k % 2 ? g.cap : g.capHi;
        ctx.beginPath();
        ctx.ellipse(xx + (k % 2 ? 4 : -4), TOP + 18 + (l * k) / 3.2, 3.2, 1.9, k % 2 ? 0.5 : -0.5, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }
  lip(ctx, g.capHi);
  return cv;
}

function paintCap(look: Look, world: number): HTMLCanvasElement {
  switch (CAP_STYLE[world] ?? 'grass') {
    case 'moss': return paintMossCap(look, world, false);
    case 'glow': return paintMossCap(look, world, true);
    case 'reed': return paintReedCap(look, world);
    case 'ash': return paintAshCap(look, world);
    case 'ruin': return paintRuinCap(look, world);
    case 'blossom': return paintGrassCap(look, world, true);
    default: return paintGrassCap(look, world, false);
  }
}

export function getSoil(ctx: CanvasRenderingContext2D, look: Look, world: number): SoilSet {
  const key = `${world}:${getSceneSeed()}`;
  let s = cache.get(key);
  if (!s) {
    const soilCv = paintSoil(look, world);
    const capCv = paintCap(look, world);
    const soil = ctx.createPattern(soilCv, 'repeat')!;
    const cap = ctx.createPattern(capCv, 'repeat-x')!;
    // the textures are painted at RES pixels per world unit
    soil.setTransform(new DOMMatrix().scale(1 / RES));
    s = { soil, cap };
    cache.set(key, s);
  }
  return s;
}

/** the cap pattern needs shifting to sit on each platform's top edge; the caller sets the transform per platform */
export function capTransform(y: number): DOMMatrix {
  return new DOMMatrix().translate(0, y).scale(1 / RES);
}
