/**
 * territoryTrees — skyline pieces that exist because of who lives in the world.
 *
 *   crag (W4): the Sky Sovereign is an eagle, and eagles own cliffs. A wet slate sea-stack with a waterfall down one
 *      face, ferns clinging to its ledges and a heap of sticks — the aerie — on the very top.
 *   roost (W8): the Night-Wing Monarch is a bat. A gnarled giant whose limbs are hung with sleeping flying foxes and
 *      ripe figs: the roost the whole world is built around (real flying foxes roost by the hundreds in big trees).
 *   karst (W8): the world is limestone tower karst — sheer grey towers with a cave mouth at the foot, forest clinging
 *      to the ledges and a forest cap on top, and bats streaming out of the cave at dusk.
 */
import { tone, mix, lighten, darken, rgba, type RNG } from './artKit.ts';
import { fernFrond } from './flora.ts';
import { leafSpray, canopyMass } from './rainforest.ts';
import { orb } from './envPlants.ts';
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
export function hangingBat(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, col: string, eye?: string, mantle?: string) {
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
  if (mantle) {
    // flying foxes wear a golden cape of fur at the neck
    ctx.fillStyle = mantle;
    ctx.beginPath();
    ctx.ellipse(x, y + s * 1.18, s * 0.34, s * 0.16, 0, 0, TAU);
    ctx.fill();
  }
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
  // an old fig-like giant: grey-brown bark, and a crown of night-green leaves among the sleepers
  const bark = tone(mix('#8a7a68', look.trunk[0], 0.35), '#1a1008');
  const glow = look.glow ?? '#7ae6ff';
  const fruit = look.flora[0];
  const batCol = '#2a1c18';
  const crownT = tone(mix(look.leaves[0], look.haze, 0.15), '#06201a');
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
        if (r() > 0.28) hangingBat(ctx, hx, hy + w * 0.4, 10 + r() * 6, batCol, undefined, r() > 0.4 ? '#c98a3a' : undefined);
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
      leafSpray(ctx, ex, ey, 30 + r() * 12, crownT, r, 7, ang, 1.6);
    }
  };
  const reach = Math.max(90, (baseY - topY) * 0.4);
  limb(x + o.lean * 0.2, top + 16, -Math.PI / 2 - 0.9, reach, o.w * 0.55, 3);
  limb(x + o.lean * 0.2, top + 16, -Math.PI / 2 + 0.9, reach, o.w * 0.55, 3);
  limb(x + o.lean * 0.2, top + 6, -Math.PI / 2 + jitter(r, 0.2), reach * 0.7, o.w * 0.45, 2);
  limb(x - o.w * 0.4, (baseY + top) / 2 - 10, -Math.PI + 0.35, reach * 0.8, o.w * 0.4, 2);
  limb(x + o.w * 0.4, (baseY + top) / 2 + 10, -0.35, reach * 0.8, o.w * 0.4, 2);
}

// ───────────────────────────── W8: limestone karst tower ─────────────────────────────

export function karst(ctx: CanvasRenderingContext2D, x: number, baseY: number, topY: number, look: Look, r: RNG, o: StampOpts, eyes = false) {
  const rock = eyes ? tone(mix(look.ground.stone, '#2a3040', 0.55), '#06080e') : tone(mix(look.ground.stone, '#8a8f9a', 0.35), '#1a2030');
  const leafT = tone(mix(look.leaves[0], look.haze, 0.1), '#06201a');
  const H = Math.max(160, baseY - topY);
  const hw = Math.max(30, o.w * 1.2);
  const steps = 18;
  const Ls: Array<[number, number]> = [];
  const Rs: Array<[number, number]> = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const yy = baseY + 10 - H * t;
    // a karst tower is barely narrower at the top than at the foot, and bellies out where the rain undercuts it
    const bulge = Math.sin(t * Math.PI * 1.6 + o.w) * hw * 0.14;
    const w = hw * (1.0 - 0.18 * t) + bulge + jitter(r, hw * 0.05);
    const cx = x + o.lean * 0.15 * t;
    Ls.push([cx - w, yy]);
    Rs.push([cx + w * (0.9 + r() * 0.1), yy]);
  }
  ctx.beginPath();
  ctx.moveTo(Ls[0][0] - 10, Ls[0][1]);
  for (const p of Ls) ctx.lineTo(p[0], p[1]);
  const tl = Ls[steps];
  const tr = Rs[steps];
  ctx.lineTo(tl[0] + (tr[0] - tl[0]) * 0.3, tl[1] - 8);
  ctx.lineTo(tr[0], tr[1]);
  for (let i = Rs.length - 1; i >= 0; i--) ctx.lineTo(Rs[i][0], Rs[i][1]);
  ctx.lineTo(Rs[0][0] + 12, Rs[0][1]);
  ctx.closePath();
  const g = ctx.createLinearGradient(x - hw, 0, x + hw, 0);
  g.addColorStop(0, rock.light);
  g.addColorStop(0.55, rock.mid);
  g.addColorStop(1, rock.dark);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.save();
  ctx.clip();
  // rain-fluted channels running down the face, and dark staining where the water goes
  for (let k = 0; k < 18; k++) {
    const sx = x + jitter(r, hw * 0.95);
    ctx.strokeStyle = rgba(rock.deep, 0.18 + r() * 0.22);
    ctx.lineWidth = 2 + r() * 4;
    ctx.beginPath();
    ctx.moveTo(sx, topY + r() * 40);
    ctx.quadraticCurveTo(sx + jitter(r, 6), (topY + baseY) / 2, sx + jitter(r, 8), baseY);
    ctx.stroke();
  }
  for (let k = 0; k < 10; k++) {
    ctx.strokeStyle = rgba(rock.hi, 0.18 + r() * 0.12);
    ctx.lineWidth = 1.4;
    const sx = x + jitter(r, hw * 0.9);
    ctx.beginPath();
    ctx.moveTo(sx, topY + r() * 60);
    ctx.lineTo(sx + jitter(r, 4), baseY - r() * 50);
    ctx.stroke();
  }
  // the cave mouth at the foot: a dark arch with stalactites, where the bats come out
  const cx0 = x + jitter(r, hw * 0.3);
  const ch = Math.min(H * (eyes ? 0.34 : 0.26), eyes ? 120 : 90);
  const cw = hw * (eyes ? 0.7 : 0.55);
  ctx.fillStyle = '#05050c';
  ctx.beginPath();
  ctx.moveTo(cx0 - cw, baseY + 10);
  ctx.quadraticCurveTo(cx0 - cw, baseY - ch, cx0, baseY - ch);
  ctx.quadraticCurveTo(cx0 + cw, baseY - ch, cx0 + cw, baseY + 10);
  ctx.closePath();
  ctx.fill();
  if (eyes) {
    // two eyes watching from the dark: the Shadow Prowler's lair
    const ey = baseY - ch * 0.42;
    for (const dx of [-0.2, 0.2]) {
      const ex = cx0 + cw * dx;
      const g = ctx.createRadialGradient(ex, ey, 0, ex, ey, 16);
      g.addColorStop(0, 'rgba(210,255,90,0.6)');
      g.addColorStop(1, 'rgba(210,255,90,0)');
      ctx.fillStyle = g;
      ctx.fillRect(ex - 16, ey - 16, 32, 32);
      ctx.fillStyle = '#d8ff58';
      ctx.beginPath();
      ctx.ellipse(ex, ey, 6.5, 3.8, dx > 0 ? -0.2 : 0.2, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#05050c';
      ctx.fillRect(ex - 0.9, ey - 3.4, 1.8, 6.8);
    }
  }
  ctx.fillStyle = rock.mid;
  for (let k = 0; k < 7; k++) {
    const sx = cx0 - cw * 0.8 + (k / 6) * cw * 1.6;
    const sy = baseY - ch * (0.94 - Math.abs(k - 3) * 0.1);
    ctx.beginPath();
    ctx.moveTo(sx - 4, sy);
    ctx.lineTo(sx + 4, sy);
    ctx.lineTo(sx, sy + 8 + r() * 14);
    ctx.fill();
  }
  ctx.restore();
  // forest clinging to ledges
  for (let k = 0; k < 9; k++) {
    const yy = topY + 30 + r() * (H - 90);
    const side = r() > 0.5 ? 1 : -1;
    const lx = x + side * hw * (0.55 + r() * 0.35);
    ctx.fillStyle = rgba(leafT.dark, 0.95);
    ctx.beginPath();
    ctx.ellipse(lx, yy, 14 + r() * 12, 7, 0, 0, TAU);
    ctx.fill();
    leafSpray(ctx, lx, yy, 20 + r() * 12, leafT, r, 6, -Math.PI / 2 + side * 0.5, 1.8);
  }
  // a roots-and-leaves cap of forest on top, with a few lianas draped over the edge
  canopyMass(ctx, (tl[0] + tr[0]) / 2, tl[1] - 6, hw * 1.05, 40, [leafT, tone(look.crowns[1] ?? look.crowns[0])], r, 18, 30);
  ctx.lineCap = 'round';
  for (let k = 0; k < 4; k++) {
    const sx = tl[0] + (tr[0] - tl[0]) * (0.1 + r() * 0.8);
    ctx.strokeStyle = leafT.dark;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(sx, tl[1] - 2);
    ctx.quadraticCurveTo(sx + jitter(r, 8), tl[1] + 40, sx + jitter(r, 5), tl[1] + 60 + r() * 60);
    ctx.stroke();
  }
}

export const cavemouth = (ctx: CanvasRenderingContext2D, x: number, baseY: number, topY: number, look: Look, r: RNG, o: StampOpts) => karst(ctx, x, baseY, topY, look, r, o, true);

// ───────────────────────────── W6: peat swamp giant ─────────────────────────────

export function peat(ctx: CanvasRenderingContext2D, x: number, baseY: number, topY: number, look: Look, r: RNG, o: StampOpts) {
  const bark = tone(mix('#4a4034', look.trunk[0], 0.3), '#0a0a06');
  const moss = tone(mix(look.leaves[2] ?? look.leaves[0], '#9aa88a', 0.5));
  const top = Math.max(topY, baseY - 380);
  const g = ctx.createLinearGradient(x - o.w, 0, x + o.w, 0);
  g.addColorStop(0, bark.light);
  g.addColorStop(0.55, bark.mid);
  g.addColorStop(1, bark.dark);
  // a tall, straight trunk that flares into buttresses at the waterline
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(x - o.w * 2.4, baseY + 8);
  ctx.bezierCurveTo(x - o.w * 1.1, baseY - 24, x - o.w * 0.9, baseY - 90, x - o.w * 0.6 + o.lean * 0.1, baseY - 150);
  ctx.lineTo(x - o.w * 0.5 + o.lean * 0.2, top);
  ctx.lineTo(x + o.w * 0.5 + o.lean * 0.2, top);
  ctx.lineTo(x + o.w * 0.6 + o.lean * 0.1, baseY - 150);
  ctx.bezierCurveTo(x + o.w * 0.9, baseY - 90, x + o.w * 1.1, baseY - 24, x + o.w * 2.4, baseY + 8);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = rgba(bark.deep, 0.5);
  ctx.lineWidth = 1.4;
  for (let k = 0; k < 7; k++) {
    const fx = x + jitter(r, o.w * 0.4);
    ctx.beginPath();
    ctx.moveTo(fx, top + r() * 60);
    ctx.lineTo(fx + jitter(r, 6), baseY - 20);
    ctx.stroke();
  }
  // stilt roots bracing it in the soft peat
  ctx.lineCap = 'round';
  for (let k = 0; k < 5; k++) {
    const side = (k / 4 - 0.5) * 2;
    const sx = x + side * o.w * 0.5;
    ctx.strokeStyle = bark.dark;
    ctx.lineWidth = 6 - Math.abs(side) * 2;
    ctx.beginPath();
    ctx.moveTo(sx, baseY - 70 - r() * 30);
    ctx.quadraticCurveTo(x + side * o.w * 2.2, baseY - 30, x + side * o.w * (2.6 + r() * 0.8), baseY + 8);
    ctx.stroke();
  }
  // pegs poking up around it
  ctx.fillStyle = bark.mid;
  for (let k = 0; k < 7; k++) {
    const px = x + jitter(r, o.w * 3.4);
    const h = 8 + r() * 16;
    ctx.beginPath();
    ctx.moveTo(px - 3, baseY + 8);
    ctx.lineTo(px - 1.6, baseY + 8 - h);
    ctx.quadraticCurveTo(px, baseY + 6 - h, px + 1.6, baseY + 8 - h);
    ctx.lineTo(px + 3, baseY + 8);
    ctx.fill();
  }
  // hanging moss from the trunk
  for (let k = 0; k < 9; k++) {
    const sx = x + jitter(r, o.w * 0.5);
    const sy = top + 40 + r() * (baseY - top - 160);
    const len = 40 + r() * 90;
    ctx.strokeStyle = rgba(k % 2 ? moss.mid : moss.light, 0.85);
    ctx.lineWidth = 3 + r() * 2;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.bezierCurveTo(sx + jitter(r, 8), sy + len * 0.35, sx + jitter(r, 10), sy + len * 0.7, sx + jitter(r, 8), sy + len);
    ctx.stroke();
  }
  canopyMass(ctx, x + o.lean * 0.2, top - 10, o.w * 3.2, 46, [tone(mix(look.leaves[0], look.haze, 0.1)), tone(look.crowns[1] ?? look.crowns[0])], r, 18, 36);
}

// ───────────────────────────── W5: golden orb web ─────────────────────────────

export function web(ctx: CanvasRenderingContext2D, x: number, baseY: number, topY: number, look: Look, r: RNG, o: StampOpts) {
  const H = Math.max(180, baseY - topY);
  const R = Math.min(190, H * 0.46);
  const cy = baseY - H * 0.55;
  const bark = tone(mix(look.trunk[0], '#2a2018', 0.3), '#0a0604');
  // two slim trunks hold it between them
  for (const dx of [-1, 1]) {
    const tx = x + dx * R * 1.08;
    const g = ctx.createLinearGradient(tx - 10, 0, tx + 10, 0);
    g.addColorStop(0, bark.light);
    g.addColorStop(1, bark.dark);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(tx - 12, baseY + 8);
    ctx.lineTo(tx - 6, topY);
    ctx.lineTo(tx + 6, topY);
    ctx.lineTo(tx + 12, baseY + 8);
    ctx.closePath();
    ctx.fill();
    leafSpray(ctx, tx, topY, 46, tone(mix(look.leaves[0], look.haze, 0.1)), r, 9, -Math.PI / 2, 2.4);
  }
  // guy lines out to the trunks and ground
  ctx.strokeStyle = 'rgba(250,236,180,0.55)';
  ctx.lineWidth = 1.2;
  for (const [ax, ay] of [[-1, -0.6], [1, -0.7], [-1, 0.4], [1, 0.5]]) {
    ctx.beginPath();
    ctx.moveTo(x + ax * R * 0.6, cy + ay * R * 0.6);
    ctx.lineTo(x + ax * R * 1.08, cy + ay * R * 1.2);
    ctx.stroke();
  }
  orb(ctx, x, cy, R, r, true);
  // things she has caught: a wrapped bundle or two, and a butterfly
  ctx.fillStyle = '#e8e0cc';
  for (let k = 0; k < 2; k++) {
    const a = r() * 6.28;
    const rr = R * (0.35 + r() * 0.35);
    ctx.beginPath();
    ctx.ellipse(x + Math.cos(a) * rr, cy + Math.sin(a) * rr, 5, 10, a, 0, 6.28);
    ctx.fill();
  }
  ctx.fillStyle = 'rgba(60,140,230,0.9)';
  const bx = x + R * 0.4;
  const by = cy - R * 0.25;
  ctx.beginPath();
  ctx.ellipse(bx - 6, by, 7, 9, 0.4, 0, TAU);
  ctx.ellipse(bx + 6, by, 7, 9, -0.4, 0, TAU);
  ctx.fill();
}

// ───────────────────────────── W7: face tower ─────────────────────────────

function carvedFace(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, st: ReturnType<typeof tone>) {
  ctx.fillStyle = st.mid;
  ctx.strokeStyle = rgba(st.deep, 0.95);
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.roundRect(x - w / 2, y - h, w, h, w * 0.14);
  ctx.fill();
  ctx.stroke();
  // serene closed eyes, a broad nose and a faint smile
  ctx.strokeStyle = rgba(st.deep, 0.95);
  ctx.lineWidth = 2;
  for (const dx of [-0.24, 0.24]) {
    ctx.beginPath();
    ctx.arc(x + w * dx, y - h * 0.58, w * 0.1, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
  }
  ctx.fillStyle = st.dark;
  ctx.beginPath();
  ctx.moveTo(x - w * 0.07, y - h * 0.55);
  ctx.lineTo(x + w * 0.07, y - h * 0.55);
  ctx.lineTo(x + w * 0.13, y - h * 0.36);
  ctx.lineTo(x - w * 0.13, y - h * 0.36);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x - w * 0.22, y - h * 0.22);
  ctx.quadraticCurveTo(x, y - h * 0.12, x + w * 0.22, y - h * 0.22);
  ctx.stroke();
  ctx.fillStyle = st.light;
  ctx.fillRect(x - w / 2 + 2, y - h + 2, w - 4, 3);
}

export function bayon(ctx: CanvasRenderingContext2D, x: number, baseY: number, topY: number, look: Look, r: RNG, o: StampOpts) {
  const st = tone(mix(look.ground.stone, '#8a8a74', 0.35), '#201a10');
  const root = tone('#8a7a64', '#120c06');
  const moss = tone(look.leaves[1] ?? look.leaves[0]);
  const w0 = Math.max(70, o.w * 2.2);
  const top = Math.max(topY, baseY - 320) + 30;
  // stepped base
  let y = baseY + 6;
  const steps = 4;
  const hStep = Math.min(40, (baseY - top) * 0.1);
  for (let k = 0; k < steps; k++) {
    const w = w0 * (1.5 - k * 0.14);
    ctx.fillStyle = k % 2 ? st.mid : st.dark;
    ctx.strokeStyle = rgba(st.deep, 0.9);
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.rect(x - w / 2, y - hStep, w, hStep);
    ctx.fill();
    ctx.stroke();
    y -= hStep;
  }
  // the tower: two tiers of faces, narrowing
  const faceH = Math.min(90, (y - top) / 2.2);
  for (let tier = 0; tier < 2; tier++) {
    const w = w0 * (1 - tier * 0.26);
    carvedFace(ctx, x, y, w, faceH, st);
    y -= faceH;
    ctx.fillStyle = st.dark;
    ctx.fillRect(x - w * 0.55, y - 8, w * 1.1, 8);
    y -= 8;
  }
  // a lotus-bud crown
  ctx.fillStyle = st.mid;
  ctx.strokeStyle = rgba(st.deep, 0.9);
  ctx.beginPath();
  ctx.moveTo(x - w0 * 0.3, y);
  ctx.quadraticCurveTo(x - w0 * 0.34, y - 36, x, y - 66);
  ctx.quadraticCurveTo(x + w0 * 0.34, y - 36, x + w0 * 0.3, y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // roots and moss, taking it back
  ctx.lineCap = 'round';
  for (let k = 0; k < 6; k++) {
    const sx = x + jitter(r, w0 * 0.55);
    ctx.strokeStyle = root.deep;
    ctx.lineWidth = 5 + r() * 4;
    ctx.beginPath();
    ctx.moveTo(sx, top + r() * 40);
    ctx.bezierCurveTo(sx + 14, top + (baseY - top) * 0.35, sx - 14, top + (baseY - top) * 0.7, sx + jitter(r, 20), baseY + 4);
    ctx.stroke();
    ctx.strokeStyle = root.mid;
    ctx.lineWidth = 2.6;
    ctx.stroke();
  }
  for (let k = 0; k < 14; k++) {
    ctx.fillStyle = rgba(moss.mid, 0.65);
    ctx.beginPath();
    ctx.ellipse(x + jitter(r, w0 * 0.7), top + r() * (baseY - top), 6 + r() * 10, 3 + r() * 4, 0, 0, TAU);
    ctx.fill();
  }
}

// ───────────────────────────── W10: the General's camp ─────────────────────────────

export function watchtower(ctx: CanvasRenderingContext2D, x: number, baseY: number, topY: number, look: Look, r: RNG, o: StampOpts) {
  const wood = tone('#5a4630', '#0a0604');
  const H = Math.min(baseY - topY, 300);
  const top = baseY - H;
  const spread = Math.max(30, o.w * 0.9);
  ctx.lineCap = 'round';
  // four lashed legs, splayed at the foot, and cross-braces
  for (const dx of [-1, 1]) {
    ctx.strokeStyle = wood.deep;
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(x + dx * spread * 1.5, baseY + 8);
    ctx.lineTo(x + dx * spread * 0.8, top + 24);
    ctx.stroke();
    ctx.strokeStyle = wood.mid;
    ctx.lineWidth = 6;
    ctx.stroke();
  }
  ctx.strokeStyle = wood.dark;
  ctx.lineWidth = 4;
  for (let k = 1; k < 4; k++) {
    const yy = top + 24 + ((baseY - top - 24) * k) / 4;
    const w = spread * (0.8 + 0.7 * (k / 4));
    ctx.beginPath();
    ctx.moveTo(x - w, yy);
    ctx.lineTo(x + w, yy + 12);
    ctx.moveTo(x + w, yy);
    ctx.lineTo(x - w, yy + 12);
    ctx.stroke();
  }
  // platform, rail and a hut roof
  ctx.fillStyle = wood.mid;
  ctx.strokeStyle = wood.deep;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.rect(x - spread * 1.1, top + 18, spread * 2.2, 10);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = wood.dark;
  ctx.fillRect(x - spread, top - 22, spread * 2, 40);
  ctx.fillStyle = '#2a2230';
  ctx.beginPath();
  ctx.moveTo(x - spread * 1.35, top - 18);
  ctx.lineTo(x, top - 62);
  ctx.lineTo(x + spread * 1.35, top - 18);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // a torch, and the General's banner
  const tx = x + spread * 1.15;
  const g = ctx.createRadialGradient(tx, top + 6, 0, tx, top + 6, 40);
  g.addColorStop(0, 'rgba(255,150,60,0.6)');
  g.addColorStop(1, 'rgba(255,150,60,0)');
  ctx.fillStyle = g;
  ctx.fillRect(tx - 40, top - 34, 80, 80);
  ctx.fillStyle = '#ff9a2a';
  ctx.beginPath();
  ctx.moveTo(tx - 4, top + 14);
  ctx.quadraticCurveTo(tx - 6, top - 6, tx, top - 14);
  ctx.quadraticCurveTo(tx + 6, top - 4, tx + 4, top + 14);
  ctx.fill();
  ctx.strokeStyle = '#3a3040';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x - spread * 0.5, top - 54);
  ctx.lineTo(x - spread * 0.5, top - 110);
  ctx.stroke();
  ctx.fillStyle = '#b02a3a';
  ctx.beginPath();
  ctx.moveTo(x - spread * 0.5, top - 108);
  ctx.lineTo(x + spread * 0.3, top - 100);
  ctx.lineTo(x + spread * 0.15, top - 88);
  ctx.lineTo(x + spread * 0.3, top - 76);
  ctx.lineTo(x - spread * 0.5, top - 82);
  ctx.closePath();
  ctx.fill();
  void look;
  void r;
}

export function stumps(ctx: CanvasRenderingContext2D, x: number, baseY: number, topY: number, look: Look, r: RNG, o: StampOpts) {
  const bark = tone('#4a3a2c', '#0a0604');
  const n = 3;
  for (let k = 0; k < n; k++) {
    const sx = x + (k - 1) * o.w * 1.9 + jitter(r, 10);
    const w = o.w * (0.7 + r() * 0.5);
    const h = Math.min(130, (baseY - topY) * (0.25 + r() * 0.25));
    ctx.fillStyle = bark.mid;
    ctx.strokeStyle = rgba(look.ground.outline, 0.9);
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(sx - w * 1.3, baseY + 8);
    ctx.quadraticCurveTo(sx - w * 0.85, baseY - h * 0.3, sx - w, baseY - h);
    ctx.lineTo(sx + w * 0.8, baseY - h + jitter(r, 6));
    ctx.quadraticCurveTo(sx + w * 0.85, baseY - h * 0.3, sx + w * 1.3, baseY + 8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#c8aa7c';
    ctx.beginPath();
    ctx.ellipse(sx - w * 0.1, baseY - h, w * 0.9, w * 0.26, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = 'rgba(30,20,12,0.7)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(sx - w * 0.1, baseY - h, w * 0.88, w * 0.25, 0, 0.2, Math.PI - 0.2);
    ctx.stroke();
  }
  // a felled log across the front, still bearing a few scorched branch stubs
  ctx.fillStyle = bark.dark;
  ctx.strokeStyle = rgba(look.ground.outline, 0.9);
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.roundRect(x - o.w * 2.6, baseY - 16, o.w * 5.2, 22, 10);
  ctx.fill();
  ctx.stroke();
}

// ───────────────────────────── W9: ohia ─────────────────────────────

export function ohiatree(ctx: CanvasRenderingContext2D, x: number, baseY: number, topY: number, look: Look, r: RNG, o: StampOpts) {
  const bark = tone('#3a2a26', '#0a0505');
  const ember = '#e8281a';
  const top = Math.max(topY, baseY - 240);
  ctx.strokeStyle = bark.dark;
  ctx.lineCap = 'round';
  ctx.lineWidth = o.w * 0.7;
  ctx.beginPath();
  ctx.moveTo(x, baseY + 8);
  ctx.bezierCurveTo(x - 24, baseY - (baseY - top) * 0.35, x + 26, baseY - (baseY - top) * 0.65, x + o.lean * 0.2, top);
  ctx.stroke();
  const tips: Array<[number, number]> = [[x + o.lean * 0.2, top]];
  for (const dx of [-1, 1]) {
    ctx.lineWidth = o.w * 0.3;
    const bx = x + dx * 2;
    const by = top + (baseY - top) * 0.32;
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.quadraticCurveTo(bx + dx * 40, by - 20, bx + dx * 66, by - 52);
    ctx.stroke();
    tips.push([bx + dx * 66, by - 52]);
  }
  for (const [tx, ty] of tips) {
    leafSpray(ctx, tx, ty, 26, tone(look.leaves[1] ?? '#c8c02a'), r, 6, -Math.PI / 2, 2.4);
    const g = ctx.createRadialGradient(tx, ty, 0, tx, ty, 34);
    g.addColorStop(0, 'rgba(232,40,26,0.45)');
    g.addColorStop(1, 'rgba(232,40,26,0)');
    ctx.fillStyle = g;
    ctx.fillRect(tx - 34, ty - 34, 68, 68);
    for (let k = 0; k < 28; k++) {
      const a = (k / 28) * TAU;
      ctx.strokeStyle = k % 3 ? ember : '#ff6a4a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(tx + Math.cos(a) * 13, ty + Math.sin(a) * 13);
      ctx.stroke();
    }
  }
}
