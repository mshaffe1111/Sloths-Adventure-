/**
 * trees — the species that give each world its own skyline.
 *
 * rainforest.ts paints the buttress giant; this file adds the rest of the cast: coconut palms and bamboo for the
 * riverbank, glowing giant mushrooms for the grotto, tree ferns and moss-furred cloud-forest trunks for the
 * cascades, stilt-rooted mangroves for the swamp, strangler-fig-wrapped ruin pillars for the temple world, and
 * charred, ember-cracked trunks for the volcano. All of them draw into a layer once; nothing here runs per frame.
 */
import { tone, mix, lighten, darken, rgba, type RNG, type Tone } from './artKit.ts';
import { leafSpray, canopyMass, rootCurtain, bromeliad } from './rainforest.ts';
import { palmFrond, fernFrond } from './flora.ts';
import type { Look } from './scenery.ts';

const TAU = Math.PI * 2;

export interface StampOpts {
  w: number;
  lean: number;
  /** extra width of the thing (mushroom cap, crown radius ...) */
  size: number;
}

const jitter = (r: RNG, a: number) => (r() - 0.5) * 2 * a;

/** a tapering curved column from (x0, y0) up to (x1, y1) as a filled polygon, returning its edges for texturing */
function column(
  ctx: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, w0: number, w1: number, bow: number, fill: CanvasGradient | string, steps = 28
) {
  const L: Array<[number, number]> = [];
  const R: Array<[number, number]> = [];
  const C: Array<[number, number, number]> = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const cx = x0 + (x1 - x0) * t + bow * Math.sin(t * Math.PI);
    const cy = y0 + (y1 - y0) * t;
    const hw = (w0 + (w1 - w0) * t) / 2;
    L.push([cx - hw, cy]);
    R.push([cx + hw, cy]);
    C.push([cx, cy, hw]);
  }
  ctx.beginPath();
  ctx.moveTo(L[0][0], L[0][1]);
  for (const p of L) ctx.lineTo(p[0], p[1]);
  for (let i = R.length - 1; i >= 0; i--) ctx.lineTo(R[i][0], R[i][1]);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  return { L, R, C };
}

// ───────────────────────────── coconut palm ─────────────────────────────

export function palmTree(ctx: CanvasRenderingContext2D, x: number, baseY: number, topY: number, look: Look, r: RNG, o: StampOpts) {
  const trk = tone(mix(look.trunk[0], '#9a8a6a', 0.35), '#2a2018');
  const leaves = look.leaves.map((c) => tone(c));
  const bow = o.lean * 0.5;
  const g = ctx.createLinearGradient(x - o.w, 0, x + o.w, 0);
  g.addColorStop(0, trk.light);
  g.addColorStop(0.45, trk.mid);
  g.addColorStop(1, trk.dark);
  const { L, R, C } = column(ctx, x, baseY, x + o.lean, topY, o.w * 1.35, o.w * 0.78, bow, g);
  // ring scars
  ctx.lineCap = 'round';
  for (let i = 2; i < C.length - 1; i++) {
    const [cx, cy, hw] = C[i];
    ctx.strokeStyle = rgba(trk.deep, 0.5);
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(cx - hw, cy);
    ctx.quadraticCurveTo(cx, cy + 5, cx + hw, cy);
    ctx.stroke();
    ctx.strokeStyle = rgba(trk.hi, 0.28);
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(cx - hw, cy - 3);
    ctx.quadraticCurveTo(cx, cy + 1, cx + hw, cy - 3);
    ctx.stroke();
  }
  ctx.strokeStyle = rgba(trk.hi, 0.35);
  ctx.lineWidth = 2;
  ctx.beginPath();
  L.forEach((p, i) => (i ? ctx.lineTo(p[0] + 3, p[1]) : ctx.moveTo(p[0] + 3, p[1])));
  ctx.stroke();
  ctx.strokeStyle = rgba(darken(look.trunk[1], 0.5), 0.5);
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  R.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
  ctx.stroke();
  // crown
  const cx = x + o.lean;
  const cy = topY;
  const n = 11;
  const order = Array.from({ length: n }, (_, i) => i).sort(() => r() - 0.5);
  // back fronds darker, front lighter
  for (const i of order) {
    const u = i / (n - 1);
    const a = -Math.PI + u * Math.PI + jitter(r, 0.12);
    const t = leaves[(r() * leaves.length) | 0];
    palmFrond(ctx, cx, cy, o.size * (0.85 + r() * 0.35), a - (u < 0.5 ? 0 : 0), t, r);
  }
  // coconuts
  ctx.fillStyle = '#5a3a1e';
  for (let i = 0; i < 4; i++) {
    const px = cx + (i - 1.5) * 9 + jitter(r, 2);
    const py = cy + 12 + Math.abs(i - 1.5) * 3;
    ctx.beginPath();
    ctx.arc(px, py, 8, 0, TAU);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,220,160,0.4)';
    ctx.beginPath();
    ctx.arc(px - 2.5, py - 2.5, 2.6, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#5a3a1e';
  }
}

// ───────────────────────────── bamboo ─────────────────────────────

export function bambooClump(ctx: CanvasRenderingContext2D, x: number, baseY: number, topY: number, look: Look, r: RNG, o: StampOpts) {
  const n = 5 + ((r() * 4) | 0);
  const base = tone(mix('#7ac840', look.leaves[0], 0.4), '#10301a');
  const leaves = look.leaves.map((c) => tone(c));
  const stalks: Array<{ x: number; top: number; lean: number; w: number }> = [];
  for (let i = 0; i < n; i++) stalks.push({ x: x + (i - n / 2) * 15 + jitter(r, 6), top: topY - r() * 80, lean: jitter(r, 40) + (i - n / 2) * 6, w: 8 + r() * 5 });
  stalks.sort((a, b) => a.w - b.w);
  for (const s of stalks) {
    const g = ctx.createLinearGradient(s.x - s.w, 0, s.x + s.w, 0);
    g.addColorStop(0, base.light);
    g.addColorStop(0.5, base.mid);
    g.addColorStop(1, base.dark);
    const { C } = column(ctx, s.x, baseY, s.x + s.lean, s.top, s.w, s.w * 0.75, s.lean * 0.2, g, 40);
    // nodes: darker rings and a lighter swelling
    for (let i = 3; i < C.length; i += 3 + ((r() * 2) | 0)) {
      const [cx, cy, hw] = C[i];
      ctx.fillStyle = rgba(base.deep, 0.75);
      ctx.fillRect(cx - hw - 1, cy - 1.5, hw * 2 + 2, 3.4);
      ctx.fillStyle = rgba(base.hi, 0.5);
      ctx.fillRect(cx - hw, cy - 4, hw * 0.8, 1.6);
      // leaf sprays from the upper nodes
      if (i > C.length * 0.45 && r() > 0.45) {
        const t = leaves[(r() * leaves.length) | 0];
        const dir = r() > 0.5 ? 1 : -1;
        leafSpray(ctx, cx, cy, 34 + r() * 18, t, r, 5, dir > 0 ? -0.5 : -Math.PI + 0.5, 1.2);
      }
    }
  }
}

// ───────────────────────────── giant mushroom ─────────────────────────────

export function giantMushroom(ctx: CanvasRenderingContext2D, x: number, baseY: number, topY: number, look: Look, r: RNG, o: StampOpts) {
  const capCol = look.crowns[(r() * look.crowns.length) | 0];
  const ct = tone(capCol, '#2a0a40');
  const glow = look.glow ?? look.rays;
  const capW = o.size;
  const sw = o.w;
  // halo of light
  const hg = ctx.createRadialGradient(x + o.lean, topY - capW * 0.1, capW * 0.15, x + o.lean, topY - capW * 0.1, capW * 1.5);
  hg.addColorStop(0, rgba(glow, 0.38));
  hg.addColorStop(1, rgba(glow, 0));
  ctx.fillStyle = hg;
  ctx.fillRect(x + o.lean - capW * 1.6, topY - capW * 1.6, capW * 3.2, capW * 3.2);
  // stalk
  const sg = ctx.createLinearGradient(x - sw, 0, x + sw, 0);
  sg.addColorStop(0, '#fff2d8');
  sg.addColorStop(0.5, '#e8d2aa');
  sg.addColorStop(1, '#a8906e');
  const { C } = column(ctx, x, baseY, x + o.lean, topY + capW * 0.12, sw * 1.9, sw, o.lean * 0.3, sg, 24);
  // fibrous streaks
  ctx.strokeStyle = 'rgba(120,90,60,0.28)';
  ctx.lineWidth = 1.4;
  for (let i = 0; i < 8; i++) {
    const u = (i + 0.5) / 8 - 0.5;
    ctx.beginPath();
    C.forEach(([cx, cy, hw], k) => (k ? ctx.lineTo(cx + u * hw * 1.8, cy) : ctx.moveTo(cx + u * hw * 1.8, cy)));
    ctx.stroke();
  }
  // skirt ring
  const ringI = Math.floor(C.length * 0.62);
  const [rx, ry, rhw] = C[ringI];
  ctx.fillStyle = '#f4e6c8';
  ctx.beginPath();
  ctx.moveTo(rx - rhw, ry);
  ctx.quadraticCurveTo(rx, ry + 16, rx + rhw, ry);
  ctx.quadraticCurveTo(rx + rhw * 1.7, ry + 12, rx + rhw * 1.2, ry + 8);
  ctx.quadraticCurveTo(rx, ry + 26, rx - rhw * 1.2, ry + 8);
  ctx.quadraticCurveTo(rx - rhw * 1.7, ry + 12, rx - rhw, ry);
  ctx.fill();
  ctx.fillStyle = 'rgba(120,90,60,0.25)';
  ctx.beginPath();
  ctx.ellipse(rx, ry + 12, rhw * 1.1, 6, 0, 0, TAU);
  ctx.fill();
  // gills under the cap
  const cx = x + o.lean;
  const gillY = topY + capW * 0.08;
  ctx.fillStyle = rgba(darken(capCol, 0.5), 0.95);
  ctx.beginPath();
  ctx.ellipse(cx, gillY, capW * 0.88, capW * 0.12, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = rgba(lighten(capCol, 0.35), 0.45);
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  for (let i = -14; i <= 14; i++) {
    ctx.moveTo(cx + i * capW * 0.06, gillY - capW * 0.07);
    ctx.lineTo(cx + i * capW * 0.062, gillY + capW * 0.07);
  }
  ctx.stroke();
  // cap dome
  ctx.beginPath();
  ctx.moveTo(cx - capW, gillY);
  ctx.bezierCurveTo(cx - capW * 1.0, gillY - capW * 0.85, cx + capW * 1.0, gillY - capW * 0.85, cx + capW, gillY);
  ctx.quadraticCurveTo(cx, gillY + capW * 0.1, cx - capW, gillY);
  const cg = ctx.createRadialGradient(cx - capW * 0.3, gillY - capW * 0.5, capW * 0.05, cx, gillY - capW * 0.2, capW * 1.05);
  cg.addColorStop(0, ct.hi);
  cg.addColorStop(0.35, ct.light);
  cg.addColorStop(0.75, ct.mid);
  cg.addColorStop(1, ct.dark);
  ctx.fillStyle = cg;
  ctx.fill();
  ctx.save();
  ctx.clip();
  // spots, lit from the top, plus a glowing rim along the edge
  for (let i = 0; i < 9; i++) {
    const a = Math.PI + r() * Math.PI;
    const d = 0.25 + r() * 0.65;
    const sx = cx + Math.cos(a) * capW * d;
    const sy = gillY + Math.sin(a) * capW * 0.6 * d - capW * 0.08;
    const sr = capW * (0.04 + r() * 0.06);
    ctx.fillStyle = 'rgba(255,255,255,0.78)';
    ctx.beginPath();
    ctx.ellipse(sx, sy, sr, sr * 0.65, 0, 0, TAU);
    ctx.fill();
  }
  ctx.strokeStyle = rgba(glow, 0.6);
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx - capW * 0.98, gillY - 2);
  ctx.quadraticCurveTo(cx, gillY + capW * 0.08, cx + capW * 0.98, gillY - 2);
  ctx.stroke();
  ctx.restore();
  // a scatter of small ones at the foot
  for (let i = 0; i < 4; i++) {
    const sx = x + jitter(r, o.w * 3);
    const s = 16 + r() * 22;
    ctx.fillStyle = '#efe0c0';
    ctx.fillRect(sx - s * 0.12, baseY - s * 0.7, s * 0.24, s * 0.7);
    const t = tone(look.crowns[(r() * look.crowns.length) | 0], '#2a0a40');
    ctx.fillStyle = t.mid;
    ctx.beginPath();
    ctx.ellipse(sx, baseY - s * 0.7, s * 0.5, s * 0.32, 0, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = rgba(glow, 0.55);
    ctx.beginPath();
    ctx.arc(sx - s * 0.12, baseY - s * 0.88, s * 0.06, 0, TAU);
    ctx.fill();
  }
}

// ───────────────────────────── mangrove ─────────────────────────────

export function mangrove(ctx: CanvasRenderingContext2D, x: number, baseY: number, topY: number, look: Look, r: RNG, o: StampOpts) {
  const trk = tone(mix(look.trunk[0], '#4a3a2a', 0.3), '#1a1220');
  const leaves = look.crowns.map((c) => tone(c));
  const rootCol = mix(look.trunk[0], look.trunk[1], 0.55);
  const trunkBase = baseY - 150 - r() * 60;
  // prop roots: arching stilts from the trunk into the ground
  const roots = 7 + ((r() * 4) | 0);
  const arch = (sx: number, sy: number, ex: number, ey: number, w: number) => {
    ctx.strokeStyle = rootCol;
    ctx.lineWidth = w;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.bezierCurveTo(sx + (ex - sx) * 0.3, sy - 30, ex - (ex - sx) * 0.1, ey - 60, ex, ey);
    ctx.stroke();
    ctx.strokeStyle = rgba(lighten(rootCol, 0.3), 0.5);
    ctx.lineWidth = Math.max(1, w * 0.25);
    ctx.beginPath();
    ctx.moveTo(sx - w * 0.2, sy - 1);
    ctx.bezierCurveTo(sx + (ex - sx) * 0.3, sy - 32, ex - (ex - sx) * 0.1 - w * 0.2, ey - 62, ex - w * 0.2, ey);
    ctx.stroke();
  };
  for (let i = 0; i < roots; i++) {
    const u = i / (roots - 1) - 0.5;
    const ex = x + u * (o.w * 6 + 120) + jitter(r, 16);
    arch(x + u * o.w * 0.8, trunkBase + r() * 40 - 20, ex, baseY + 6, 6 + r() * 7);
  }
  // trunk
  const g = ctx.createLinearGradient(x - o.w, 0, x + o.w, 0);
  g.addColorStop(0, trk.light);
  g.addColorStop(0.5, trk.mid);
  g.addColorStop(1, trk.dark);
  const { L, R } = column(ctx, x, trunkBase + 20, x + o.lean, topY, o.w * 1.5, o.w * 0.8, o.lean * 0.2, g, 20);
  ctx.strokeStyle = rgba(trk.deep, 0.5);
  ctx.lineWidth = 2;
  for (let i = 0; i < 6; i++) {
    const u = i / 5;
    ctx.beginPath();
    for (let k = 0; k < L.length; k++) {
      const px = L[k][0] + (R[k][0] - L[k][0]) * u + Math.sin(k * 0.8 + i) * 2;
      k ? ctx.lineTo(px, L[k][1]) : ctx.moveTo(px, L[k][1]);
    }
    ctx.stroke();
  }
  // crown
  const cx = x + o.lean;
  canopyMass(ctx, cx - o.size * 0.5, topY + 10, o.size * 0.7, o.size * 0.35, leaves, r, 20, 40);
  canopyMass(ctx, cx + o.size * 0.5, topY + 20, o.size * 0.7, o.size * 0.35, leaves, r, 20, 40);
  canopyMass(ctx, cx, topY - 20, o.size * 0.9, o.size * 0.42, leaves, r, 30, 44);
  // aerial roots dangling from the crown
  rootCurtain(ctx, cx, topY + 40, o.size * 1.3, 160 + r() * 120, rootCol, r, 10);
}

// ───────────────────────────── cloud-forest trunk and tree fern ─────────────────────────────

export function cloudTree(ctx: CanvasRenderingContext2D, x: number, baseY: number, topY: number, look: Look, r: RNG, o: StampOpts) {
  const trk = tone(mix(look.trunk[0], '#3a4a40', 0.4), '#10201a');
  const moss = tone(look.leaves[1] ?? look.leaves[0], '#102018');
  const g = ctx.createLinearGradient(x - o.w, 0, x + o.w, 0);
  g.addColorStop(0, trk.light);
  g.addColorStop(0.5, trk.mid);
  g.addColorStop(1, trk.dark);
  const { C } = column(ctx, x, baseY + 10, x + o.lean, topY, o.w * 1.3, o.w * 0.85, o.lean * 0.15, g, 40);
  // thick fur of moss over most of the trunk
  for (let i = 0; i < C.length * 3; i++) {
    const k = (r() * (C.length - 1)) | 0;
    const [cx, cy, hw] = C[k];
    const mx = cx + jitter(r, hw * 0.9);
    const rad = 8 + r() * 14;
    ctx.fillStyle = rgba(r() > 0.5 ? moss.mid : moss.dark, 0.78);
    ctx.beginPath();
    ctx.ellipse(mx, cy, rad, rad * 0.7, jitter(r, 0.6), 0, TAU);
    ctx.fill();
    ctx.fillStyle = rgba(moss.light, 0.7);
    ctx.beginPath();
    ctx.arc(mx - rad * 0.2, cy - rad * 0.25, rad * 0.32, 0, TAU);
    ctx.fill();
  }
  // long drapes of hanging moss
  ctx.lineCap = 'round';
  for (let i = 0; i < 16; i++) {
    const k = (r() * (C.length - 4)) | 0;
    const [cx, cy, hw] = C[k];
    const px = cx + jitter(r, hw);
    const len = 50 + r() * 110;
    ctx.strokeStyle = rgba(r() > 0.5 ? moss.light : moss.mid, 0.8);
    ctx.lineWidth = 2 + r() * 2;
    ctx.beginPath();
    ctx.moveTo(px, cy);
    ctx.bezierCurveTo(px + jitter(r, 10), cy + len * 0.35, px + jitter(r, 14), cy + len * 0.7, px + jitter(r, 12), cy + len);
    ctx.stroke();
  }
  // bromeliads on the shoulders
  const L = look.leaves.map((c) => tone(c));
  for (let i = 0; i < 3; i++) {
    const k = 4 + ((r() * (C.length - 10)) | 0);
    const [cx, cy, hw] = C[k];
    bromeliad(ctx, cx + (r() > 0.5 ? 1 : -1) * hw * 0.7, cy, 28 + r() * 16, L[(r() * L.length) | 0], look.flora[(r() * look.flora.length) | 0], r);
  }
}

export function treeFern(ctx: CanvasRenderingContext2D, x: number, baseY: number, topY: number, look: Look, r: RNG, o: StampOpts) {
  const trk = tone('#4a3a2a', '#10100a');
  const g = ctx.createLinearGradient(x - o.w, 0, x + o.w, 0);
  g.addColorStop(0, trk.light);
  g.addColorStop(0.5, trk.mid);
  g.addColorStop(1, trk.dark);
  const { C } = column(ctx, x, baseY + 8, x + o.lean, topY, o.w * 1.15, o.w * 0.9, o.lean * 0.25, g, 30);
  // fibrous leaf-scar diamonds
  ctx.fillStyle = rgba(trk.deep, 0.55);
  for (let i = 1; i < C.length; i += 1) {
    const [cx, cy, hw] = C[i];
    for (let k = -1; k <= 1; k++) {
      if ((i + k) % 2) continue;
      ctx.beginPath();
      ctx.moveTo(cx + k * hw * 0.8, cy - 5);
      ctx.lineTo(cx + k * hw * 0.8 + 4, cy);
      ctx.lineTo(cx + k * hw * 0.8, cy + 5);
      ctx.lineTo(cx + k * hw * 0.8 - 4, cy);
      ctx.fill();
    }
  }
  const cx = x + o.lean;
  const t = tone(look.leaves[0]);
  const t2 = tone(look.leaves[2] ?? look.leaves[0]);
  for (let i = 0; i < 14; i++) {
    const u = i / 13;
    const a = -Math.PI + u * Math.PI + jitter(r, 0.1);
    fernFrond(ctx, cx, topY, o.size * (0.8 + r() * 0.3), a, i % 2 ? t : t2, r, 0.65);
  }
}

// ───────────────────────────── ruin pillar wrapped in a strangler fig ─────────────────────────────

function stoneBlock(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, st: Tone, r: RNG) {
  const g = ctx.createLinearGradient(x, y, x + w, y + h);
  g.addColorStop(0, st.light);
  g.addColorStop(0.6, st.mid);
  g.addColorStop(1, st.dark);
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = rgba(st.deep, 0.7);
  ctx.lineWidth = 1.6;
  ctx.strokeRect(x + 0.8, y + 0.8, w - 1.6, h - 1.6);
  ctx.fillStyle = rgba(st.hi, 0.28);
  ctx.fillRect(x + 2, y + 2, w - 4, 3);
  ctx.strokeStyle = rgba(st.deep, 0.35);
  ctx.beginPath();
  ctx.moveTo(x + w * (0.2 + r() * 0.6), y + 2);
  ctx.lineTo(x + w * (0.2 + r() * 0.6), y + h * 0.6);
  ctx.stroke();
}

export function figRuin(ctx: CanvasRenderingContext2D, x: number, baseY: number, topY: number, look: Look, r: RNG, o: StampOpts) {
  const stone = tone(mix(look.ground.stone, '#8a8a70', 0.35), '#201a10');
  const pw = o.w * 1.7;
  const leaves = look.crowns.map((c) => tone(c));
  // the pillar: stacked blocks, a carved band, a broken top
  const top = topY + 60 + r() * 60;
  let y = baseY;
  let row = 0;
  while (y > top) {
    const h = 34 + r() * 14;
    stoneBlock(ctx, x - pw / 2 - (row % 2 ? 3 : 0), y - h, pw + (row % 2 ? 6 : 0), h, stone, r);
    // carved glyph band every few courses
    if (row % 4 === 2) {
      ctx.strokeStyle = rgba(stone.deep, 0.75);
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let k = 0; k < 5; k++) {
        const gx = x - pw / 2 + 8 + k * (pw - 16) / 4;
        ctx.moveTo(gx, y - h + 8);
        ctx.lineTo(gx + 6, y - h + 8);
        ctx.lineTo(gx + 6, y - 8);
        ctx.lineTo(gx - 2, y - 8);
      }
      ctx.stroke();
    }
    y -= h;
    row++;
  }
  // capital
  stoneBlock(ctx, x - pw * 0.7, top - 22, pw * 1.4, 22, stone, r);
  // fig roots: braided ropes down the pillar from a crown of leaves, with buttress flares at the ground
  const rootCol = mix(look.trunk[0], look.trunk[1], 0.45);
  for (let k = 0; k < 7; k++) {
    const phase = r() * 6;
    const side = (k / 6 - 0.5) * pw * 1.5;
    ctx.strokeStyle = rootCol;
    ctx.lineWidth = 5 + r() * 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    for (let i = 0; i <= 40; i++) {
      const t = i / 40;
      const px = x + side * (0.55 + 0.45 * t) + Math.sin(t * 8 + phase) * pw * 0.28 * (1 - t * 0.4);
      const py = top - 10 + t * (baseY - top + 10);
      i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
    }
    ctx.stroke();
    ctx.strokeStyle = rgba(lighten(rootCol, 0.3), 0.5);
    ctx.lineWidth = 1.6;
    ctx.stroke();
  }
  // moss on the stone and a crown of leaves at the top
  const moss = tone(look.leaves[1] ?? look.leaves[0]);
  for (let i = 0; i < 30; i++) {
    ctx.fillStyle = rgba(moss.mid, 0.6);
    ctx.beginPath();
    ctx.ellipse(x + jitter(r, pw * 0.55), top + r() * (baseY - top), 6 + r() * 12, 3 + r() * 5, 0, 0, TAU);
    ctx.fill();
  }
  canopyMass(ctx, x, top - 40, o.size * 0.6, 50, leaves, r, 26, 40);
  rootCurtain(ctx, x, top - 10, pw * 1.6, 120, rootCol, r, 8);
}

// ───────────────────────────── charred trunk ─────────────────────────────

export function charredTree(ctx: CanvasRenderingContext2D, x: number, baseY: number, topY: number, look: Look, r: RNG, o: StampOpts) {
  const trk = tone('#3a2a26', '#0a0505');
  const ember = look.glow ?? '#ff7a1a';
  const g = ctx.createLinearGradient(x - o.w, 0, x + o.w, 0);
  g.addColorStop(0, trk.light);
  g.addColorStop(0.5, trk.mid);
  g.addColorStop(1, trk.dark);
  const { L, R } = column(ctx, x, baseY + 10, x + o.lean, topY, o.w * 1.8, o.w * 0.5, o.lean * 0.3, g, 28);
  // charred cracks with a hot glow inside
  for (let i = 0; i < 10; i++) {
    const u = 0.15 + (i / 10) * 0.7;
    const k0 = (r() * (L.length - 8)) | 0;
    ctx.beginPath();
    for (let k = k0; k < Math.min(L.length, k0 + 5 + ((r() * 8) | 0)); k++) {
      const px = L[k][0] + (R[k][0] - L[k][0]) * u + jitter(r, 3);
      k === k0 ? ctx.moveTo(px, L[k][1]) : ctx.lineTo(px, L[k][1]);
    }
    ctx.strokeStyle = rgba(ember, 0.35);
    ctx.lineWidth = 6;
    ctx.stroke();
    ctx.strokeStyle = lighten(ember, 0.25);
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  // rim light from the glow of the lava
  ctx.strokeStyle = rgba(ember, 0.5);
  ctx.lineWidth = 2;
  ctx.beginPath();
  L.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
  ctx.stroke();
  // broken, spiky limbs
  const limb = (bx: number, by: number, ang: number, len: number, w: number, depth: number) => {
    const ex = bx + Math.cos(ang) * len;
    const ey = by + Math.sin(ang) * len;
    ctx.strokeStyle = trk.dark;
    ctx.lineWidth = w;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.quadraticCurveTo((bx + ex) / 2 + jitter(r, 14), (by + ey) / 2 - 10, ex, ey);
    ctx.stroke();
    ctx.strokeStyle = rgba(ember, 0.4);
    ctx.lineWidth = Math.max(1, w * 0.25);
    ctx.stroke();
    if (depth > 0) {
      limb(ex, ey, ang - 0.5 - r() * 0.4, len * 0.7, w * 0.65, depth - 1);
      limb(ex, ey, ang + 0.5 + r() * 0.4, len * 0.7, w * 0.65, depth - 1);
    } else if (r() > 0.4) {
      // a last red-orange leaf cluster
      const lt = tone(look.crowns[(r() * look.crowns.length) | 0]);
      leafSpray(ctx, ex, ey, 22, lt, r, 5, ang, 1.4);
    }
  };
  const cx = x + o.lean;
  limb(cx, topY + 10, -Math.PI / 2 - 0.3, 110 + r() * 40, o.w * 0.45, 3);
  limb(cx, topY + 80, -Math.PI / 2 + 0.95, 100, o.w * 0.35, 2);
  limb(cx, topY + 140, -Math.PI / 2 - 1.0, 90, o.w * 0.35, 2);
}
