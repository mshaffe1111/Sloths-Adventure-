/**
 * territoryTrees — skyline pieces that exist because of who lives in the world.
 *
 *   crag (W4): the Sky Sovereign is an eagle, and eagles own cliffs. A wet slate sea-stack with a waterfall down one
 *      face, ferns clinging to its ledges and a heap of sticks — the aerie — on the very top.
 *   roost (W8): the Night-Wing Monarch is a bat. A pale, bare, gnarled giant whose limbs are hung with sleeping bats
 *      and glowing figs: the roost the whole world is built around.
 *   crystalspire (W8): the rock of that world is crystal, so the skyline has clusters of lit columns, not only trees.
 */
import { tone, mix, lighten, darken, rgba, type RNG } from './artKit.ts';
import { fernFrond } from './flora.ts';
import { leafSpray } from './rainforest.ts';
import type { StampOpts } from './trees.ts';
import type { Look } from './scenery.ts';

const TAU = Math.PI * 2;
const jitter = (r: RNG, a: number) => (r() - 0.5) * 2 * a;

// ───────────────────────────── W4: the eagle's crag ─────────────────────────────

export function crag(ctx: CanvasRenderingContext2D, x: number, baseY: number, topY: number, look: Look, r: RNG, o: StampOpts) {
  const rock = tone(mix('#3c4d5c', look.ground.stone, 0.2), '#08121e');
  const halfBase = o.w * 1.55;
  const halfTop = o.w * 0.8;
  const steps = 16;
  const lean = o.lean * 0.3;
  const Ls: Array<[number, number]> = [];
  const Rs: Array<[number, number]> = [];
  const ledges: Array<[number, number, number]> = []; // x, y, side
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const yy = baseY + 14 - (baseY + 14 - topY) * t;
    const cx = x + lean * t * t;
    // each course steps in, with a ledge where it does
    const step = Math.floor(t * 5) / 5;
    const hw = halfBase + (halfTop - halfBase) * (0.55 * t + 0.45 * step) + jitter(r, o.w * 0.1);
    Ls.push([cx - hw, yy]);
    Rs.push([cx + hw, yy]);
    if (i % 3 === 2 && i < steps - 1) {
      ledges.push([cx - hw, yy, -1]);
      ledges.push([cx + hw, yy, 1]);
    }
  }
  ctx.beginPath();
  ctx.moveTo(Ls[0][0] - 12, Ls[0][1]);
  for (const p of Ls) ctx.lineTo(p[0], p[1]);
  // a flat, broken top
  const tl = Ls[steps];
  const tr = Rs[steps];
  ctx.lineTo(tl[0] + (tr[0] - tl[0]) * 0.18, tl[1] - 10);
  ctx.lineTo(tl[0] + (tr[0] - tl[0]) * 0.55, tl[1] - 4);
  ctx.lineTo(tr[0], tr[1]);
  for (let i = Rs.length - 1; i >= 0; i--) ctx.lineTo(Rs[i][0], Rs[i][1]);
  ctx.lineTo(Rs[0][0] + 14, Rs[0][1]);
  ctx.closePath();
  const g = ctx.createLinearGradient(x - halfBase, 0, x + halfBase, 0);
  g.addColorStop(0, rock.light);
  g.addColorStop(0.5, rock.mid);
  g.addColorStop(1, rock.dark);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.save();
  ctx.clip();
  // slate strata, tilted a little, and the vertical sheen of wet rock
  ctx.lineWidth = 1.6;
  for (let k = 0; k < 26; k++) {
    const yy = topY + r() * (baseY - topY);
    ctx.strokeStyle = rgba(rock.deep, 0.5);
    ctx.beginPath();
    ctx.moveTo(x - halfBase - 10, yy);
    ctx.lineTo(x + halfBase + 10, yy + jitter(r, 10));
    ctx.stroke();
  }
  for (let k = 0; k < 14; k++) {
    const sx = x + jitter(r, halfBase * 0.9);
    ctx.strokeStyle = rgba(rock.hi, 0.18 + r() * 0.15);
    ctx.lineWidth = 1.2 + r() * 1.6;
    ctx.beginPath();
    ctx.moveTo(sx, topY + r() * 40);
    ctx.lineTo(sx + jitter(r, 4), baseY);
    ctx.stroke();
  }
  // the waterfall: a ribbon of white from near the top to a pool of spray at the base
  const wx = x + (r() > 0.5 ? 1 : -1) * halfBase * 0.18;
  const wTop = topY + 14;
  const ww = Math.max(7, o.w * 0.2);
  const wg = ctx.createLinearGradient(0, wTop, 0, baseY);
  wg.addColorStop(0, 'rgba(235,250,255,0.9)');
  wg.addColorStop(1, 'rgba(190,225,245,0.75)');
  ctx.fillStyle = wg;
  ctx.beginPath();
  ctx.moveTo(wx - ww * 0.5, wTop);
  for (let i = 0; i <= 20; i++) ctx.lineTo(wx - ww * (0.5 + i * 0.012) + Math.sin(i * 0.9 + o.w) * 2, wTop + (baseY - wTop) * (i / 20));
  for (let i = 20; i >= 0; i--) ctx.lineTo(wx + ww * (0.5 + i * 0.012) + Math.sin(i * 0.9 + 2 + o.w) * 2, wTop + (baseY - wTop) * (i / 20));
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.55)';
  ctx.lineWidth = 1.4;
  for (let k = 0; k < 3; k++) {
    ctx.beginPath();
    ctx.moveTo(wx + (k - 1) * ww * 0.35, wTop + 6);
    ctx.lineTo(wx + (k - 1) * ww * 0.4 + jitter(r, 2), baseY);
    ctx.stroke();
  }
  ctx.restore();
  // spray at the foot
  for (let k = 0; k < 10; k++) {
    ctx.fillStyle = `rgba(235,248,255,${0.18 + r() * 0.2})`;
    ctx.beginPath();
    ctx.ellipse(wx + jitter(r, ww * 2.4), baseY - r() * 18, 14 + r() * 18, 8 + r() * 8, 0, 0, TAU);
    ctx.fill();
  }
  // ferns and moss clinging to the ledges
  const leaf = tone(mix(look.leaves[1] ?? look.leaves[0], look.haze, 0.1));
  for (const [lx, ly, side] of ledges) {
    ctx.fillStyle = rgba(leaf.mid, 0.9);
    ctx.beginPath();
    ctx.ellipse(lx, ly + 2, 11 + r() * 8, 5, 0, 0, TAU);
    ctx.fill();
    if (r() > 0.35) fernFrond(ctx, lx, ly, 34 + r() * 22, -Math.PI / 2 + side * (0.7 + r() * 0.5), leaf, r, 0.7);
  }
  // the aerie: a bowl of sticks heaped on the top, with a bleached snag leaning over it
  const nx = (tl[0] + tr[0]) / 2 + (tr[0] - tl[0]) * 0.05;
  const ny = tl[1] - 6;
  const nw = (tr[0] - tl[0]) * 0.58;
  ctx.lineCap = 'round';
  const stick = tone('#6b5236', '#1a1006');
  for (let k = 0; k < 34; k++) {
    const u = k / 33;
    const sx = nx + (u - 0.5) * nw * 1.5 + jitter(r, 5);
    const sy = ny - Math.sin(u * Math.PI) * nw * 0.2 - r() * 6;
    const a = (r() - 0.5) * 2.2;
    const len = nw * (0.22 + r() * 0.22);
    ctx.strokeStyle = k % 3 ? stick.mid : stick.light;
    ctx.lineWidth = 1.8 + r() * 1.8;
    ctx.beginPath();
    ctx.moveTo(sx - Math.cos(a) * len * 0.5, sy - Math.sin(a) * len * 0.5);
    ctx.lineTo(sx + Math.cos(a) * len * 0.5, sy + Math.sin(a) * len * 0.5);
    ctx.stroke();
  }
  ctx.fillStyle = rgba(stick.deep, 0.9);
  ctx.beginPath();
  ctx.ellipse(nx, ny - nw * 0.08, nw * 0.42, nw * 0.1, 0, 0, TAU);
  ctx.fill();
  // two pale eggs in the bowl
  ctx.fillStyle = '#eee4cc';
  for (const dx of [-0.1, 0.1]) {
    ctx.beginPath();
    ctx.ellipse(nx + nw * dx, ny - nw * 0.1, nw * 0.07, nw * 0.09, 0, 0, TAU);
    ctx.fill();
  }
  ctx.strokeStyle = '#b8b09a';
  ctx.lineWidth = 3.4;
  ctx.beginPath();
  ctx.moveTo(nx + nw * 0.5, ny + 4);
  ctx.quadraticCurveTo(nx + nw * 0.6, ny - nw * 0.4, nx + nw * 0.35, ny - nw * 0.7);
  ctx.moveTo(nx + nw * 0.56, ny - nw * 0.3);
  ctx.lineTo(nx + nw * 0.78, ny - nw * 0.5);
  ctx.stroke();
}

// ───────────────────────────── W8: the bat roost ─────────────────────────────

/** a sleeping bat hanging head-down with its wings folded round it */
export function hangingBat(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, col: string, eye?: string) {
  ctx.strokeStyle = darken(col, 0.3);
  ctx.lineWidth = Math.max(1, s * 0.1);
  ctx.beginPath();
  ctx.moveTo(x, y - s * 0.1);
  ctx.lineTo(x, y + s * 0.15);
  ctx.stroke();
  // folded wings: a teardrop
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.bezierCurveTo(x - s * 0.75, y + s * 0.4, x - s * 0.55, y + s * 1.25, x, y + s * 1.45);
  ctx.bezierCurveTo(x + s * 0.55, y + s * 1.25, x + s * 0.75, y + s * 0.4, x, y);
  ctx.fill();
  ctx.fillStyle = lighten(col, 0.18);
  ctx.beginPath();
  ctx.ellipse(x - s * 0.18, y + s * 0.55, s * 0.12, s * 0.45, 0.2, 0, TAU);
  ctx.fill();
  // head with ears at the bottom
  ctx.fillStyle = darken(col, 0.1);
  ctx.beginPath();
  ctx.ellipse(x, y + s * 1.38, s * 0.26, s * 0.22, 0, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x - s * 0.24, y + s * 1.46);
  ctx.lineTo(x - s * 0.3, y + s * 1.8);
  ctx.lineTo(x - s * 0.06, y + s * 1.55);
  ctx.moveTo(x + s * 0.24, y + s * 1.46);
  ctx.lineTo(x + s * 0.3, y + s * 1.8);
  ctx.lineTo(x + s * 0.06, y + s * 1.55);
  ctx.fill();
  if (eye) {
    ctx.fillStyle = eye;
    ctx.fillRect(x - s * 0.12, y + s * 1.34, s * 0.06, s * 0.05);
    ctx.fillRect(x + s * 0.06, y + s * 1.34, s * 0.06, s * 0.05);
  }
}

export function roost(ctx: CanvasRenderingContext2D, x: number, baseY: number, topY: number, look: Look, r: RNG, o: StampOpts) {
  // ghost-pale bark: this tree has been dead long enough to bleach, and the bats do not mind
  const bark = tone(mix('#b9a9d0', look.trunk[0], 0.3), '#1a0a30');
  const glow = look.glow ?? '#7ae6ff';
  const fruit = look.flora[0];
  const batCol = '#241640';
  const g = ctx.createLinearGradient(x - o.w, 0, x + o.w, 0);
  g.addColorStop(0, bark.light);
  g.addColorStop(0.55, bark.mid);
  g.addColorStop(1, bark.dark);
  // a swollen, buttressed trunk
  const top = topY + 60;
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(x - o.w * 2.1, baseY + 12);
  ctx.bezierCurveTo(x - o.w * 0.9, baseY - 30, x - o.w * 0.95, (baseY + top) / 2, x - o.w * 0.7 + o.lean * 0.2, top);
  ctx.lineTo(x + o.w * 0.7 + o.lean * 0.2, top);
  ctx.bezierCurveTo(x + o.w * 0.95, (baseY + top) / 2, x + o.w * 0.9, baseY - 30, x + o.w * 2.1, baseY + 12);
  ctx.closePath();
  ctx.fill();
  // bark furrows
  ctx.strokeStyle = rgba(bark.deep, 0.55);
  ctx.lineWidth = 1.6;
  for (let k = 0; k < 9; k++) {
    const fx = x + jitter(r, o.w * 0.7);
    ctx.beginPath();
    ctx.moveTo(fx, top + 12 + r() * 30);
    ctx.quadraticCurveTo(fx + jitter(r, 8), (baseY + top) / 2, fx + jitter(r, 12), baseY - 10);
    ctx.stroke();
  }
  // bare limbs reaching out, each hung with bats and the occasional glowing fig
  const limb = (bx: number, by: number, ang: number, len: number, w: number, depth: number) => {
    const ex = bx + Math.cos(ang) * len;
    const ey = by + Math.sin(ang) * len;
    const mx = (bx + ex) / 2 + jitter(r, 12);
    const my = (by + ey) / 2 - 10;
    ctx.strokeStyle = bark.mid;
    ctx.lineWidth = w;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.quadraticCurveTo(mx, my, ex, ey);
    ctx.stroke();
    ctx.strokeStyle = rgba(bark.hi, 0.35);
    ctx.lineWidth = Math.max(1, w * 0.18);
    ctx.beginPath();
    ctx.moveTo(bx, by - w * 0.25);
    ctx.quadraticCurveTo(mx, my - w * 0.25, ex, ey - w * 0.25);
    ctx.stroke();
    // things that hang from this limb
    if (len > 40 && depth < 3) {
      const n = 1 + ((r() * 3) | 0);
      for (let k = 0; k < n; k++) {
        const u = 0.3 + r() * 0.6;
        const hx = (1 - u) * (1 - u) * bx + 2 * (1 - u) * u * mx + u * u * ex;
        const hy = (1 - u) * (1 - u) * by + 2 * (1 - u) * u * my + u * u * ey;
        if (r() > 0.28) hangingBat(ctx, hx, hy + w * 0.4, 9 + r() * 5, batCol, r() > 0.6 ? glow : undefined);
        else {
          ctx.strokeStyle = bark.dark;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(hx, hy);
          ctx.lineTo(hx, hy + 14);
          ctx.stroke();
          const fg = ctx.createRadialGradient(hx, hy + 20, 0, hx, hy + 20, 22);
          fg.addColorStop(0, rgba(fruit, 0.5));
          fg.addColorStop(1, rgba(fruit, 0));
          ctx.fillStyle = fg;
          ctx.fillRect(hx - 22, hy - 4, 44, 44);
          ctx.fillStyle = lighten(fruit, 0.25);
          ctx.beginPath();
          ctx.arc(hx, hy + 20, 5.5, 0, TAU);
          ctx.fill();
        }
      }
    }
    if (depth > 0) {
      limb(ex, ey, ang - 0.45 - r() * 0.4, len * 0.72, w * 0.66, depth - 1);
      limb(ex, ey, ang + 0.45 + r() * 0.4, len * 0.72, w * 0.66, depth - 1);
    } else {
      leafSpray(ctx, ex, ey, 16, tone(mix('#3a2a7a', look.haze, 0.2), '#0a0420'), r, 4, ang, 1.2);
    }
  };
  const reach = Math.max(90, (baseY - topY) * 0.4);
  limb(x + o.lean * 0.2, top + 16, -Math.PI / 2 - 0.9, reach, o.w * 0.55, 3);
  limb(x + o.lean * 0.2, top + 16, -Math.PI / 2 + 0.9, reach, o.w * 0.55, 3);
  limb(x + o.lean * 0.2, top + 6, -Math.PI / 2 + jitter(r, 0.2), reach * 0.7, o.w * 0.45, 2);
  limb(x - o.w * 0.4, (baseY + top) / 2 - 10, -Math.PI + 0.35, reach * 0.8, o.w * 0.4, 2);
  limb(x + o.w * 0.4, (baseY + top) / 2 + 10, -0.35, reach * 0.8, o.w * 0.4, 2);
}

// ───────────────────────────── W8: crystal spires ─────────────────────────────

export function crystalspire(ctx: CanvasRenderingContext2D, x: number, baseY: number, topY: number, look: Look, r: RNG, o: StampOpts) {
  const glow = look.glow ?? '#7ae6ff';
  const cols = [look.flora[0], look.flora[1] ?? '#c9a2ff', '#8fd0ff', '#b48cff'];
  const H = Math.max(120, baseY - topY);
  const n = 5;
  // glow on the ground around the base
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const bg = ctx.createRadialGradient(x, baseY, 0, x, baseY, H * 0.55);
  bg.addColorStop(0, rgba(glow, 0.35));
  bg.addColorStop(1, rgba(glow, 0));
  ctx.fillStyle = bg;
  ctx.fillRect(x - H * 0.6, baseY - H * 0.6, H * 1.2, H * 1.2);
  ctx.restore();
  const items = Array.from({ length: n }, (_, i) => ({
    ox: (i - (n - 1) / 2) * o.w * 0.75 + jitter(r, 8),
    h: H * (i === 2 ? 1 : 0.45 + r() * 0.4),
    w: o.w * (0.42 + r() * 0.2),
    tilt: (i - (n - 1) / 2) * 0.1 + jitter(r, 0.05),
    c: cols[i % cols.length],
  }));
  items.sort((a, b) => b.h - a.h);
  for (const c of items.slice().reverse()) {
    const t = tone(c.c, '#120626');
    ctx.save();
    ctx.translate(x + c.ox, baseY + 6);
    ctx.rotate(c.tilt);
    const w = c.w;
    // hexagonal column: a left face, a right face, a pointed cap
    const tipY = -c.h;
    const shoulder = -c.h * 0.84;
    const faces: Array<[number, number, string]> = [
      [-w, -w * 0.15, t.light],
      [-w * 0.15, w * 0.45, t.mid],
      [w * 0.45, w, t.dark],
    ];
    for (const [a, b, col] of faces) {
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.moveTo(a, 0);
      ctx.lineTo(a, shoulder);
      ctx.lineTo(((a + b) / 2) * 0.5, tipY + (a + b === 0 ? 0 : 0));
      ctx.lineTo(b, shoulder);
      ctx.lineTo(b, 0);
      ctx.closePath();
      ctx.fill();
    }
    ctx.strokeStyle = rgba('#120626', 0.7);
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(-w, 0);
    ctx.lineTo(-w, shoulder);
    ctx.lineTo(-w * 0.1, tipY);
    ctx.lineTo(w, shoulder);
    ctx.lineTo(w, 0);
    ctx.moveTo(-w * 0.15, 0);
    ctx.lineTo(-w * 0.15, shoulder);
    ctx.lineTo(-w * 0.1, tipY);
    ctx.moveTo(w * 0.45, 0);
    ctx.lineTo(w * 0.45, shoulder);
    ctx.stroke();
    // inner light
    ctx.fillStyle = 'rgba(255,255,255,0.28)';
    ctx.beginPath();
    ctx.moveTo(-w * 0.7, -c.h * 0.1);
    ctx.lineTo(-w * 0.5, -c.h * 0.7);
    ctx.lineTo(-w * 0.35, -c.h * 0.1);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}
