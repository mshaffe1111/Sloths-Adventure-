/**
 * rainforest — the big, specific things that make a rainforest read as a rainforest.
 *
 * The old backdrops were soft round blobs of foliage on thin trunks. These are drawn leaf by leaf: towering
 * trunks with buttress roots, cracked bark, moss and strangling lianas; epiphytes (bromeliads, orchids, ferns)
 * perched on the limbs; canopies built from real leaf shapes with light and shadow; curtains of hanging roots.
 * Everything is painted once into the cached layers (see scenery.ts), so it costs nothing per frame.
 */
import { getScratch } from './scratch.ts';
import { tone, mix, lighten, darken, rgba, type RNG, type Tone } from './artKit.ts';
import { drawBloom } from './flora.ts';
import { clusterAround } from './placement.ts';
import type { Look } from './scenery.ts';

/** the worlds that use the new hand-built art (being grown world by world) */
export const RICH_WORLDS = new Set<number>([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
export const isRich = (world: number) => RICH_WORLDS.has(world);

// ───────────────────────────── leaves ─────────────────────────────

/** one pointed leaf growing from (x, y) at angle `ang`; the half facing the light is brighter */
export function leaf(ctx: CanvasRenderingContext2D, x: number, y: number, len: number, wid: number, ang: number, t: Tone, bend = 0, veins = true) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(ang);
  const by = bend * len;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(len * 0.38, -wid + by * 0.4, len, by);
  ctx.quadraticCurveTo(len * 0.38, wid + by * 0.4, 0, 0);
  ctx.fillStyle = t.mid;
  ctx.fill();
  // lit half (upper side of the leaf in its own frame, flipped when pointing away from the light)
  const lit = Math.cos(ang) > -0.2 ? -1 : 1;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(len * 0.38, lit * wid + by * 0.4, len, by);
  ctx.quadraticCurveTo(len * 0.5, by * 0.5, 0, 0);
  ctx.fillStyle = t.light;
  ctx.fill();
  // shaded tip edge
  if (wid > 4) {
    ctx.strokeStyle = rgba(t.dark, 0.5);
    ctx.lineWidth = Math.max(1, wid * 0.08);
    ctx.beginPath();
    ctx.moveTo(len * 0.1, 0);
    ctx.quadraticCurveTo(len * 0.5, by * 0.5, len * 0.97, by * 0.97);
    ctx.stroke();
  }
  if (veins && len > 40) {
    ctx.strokeStyle = rgba(t.deep, 0.28);
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 1; i <= 4; i++) {
      const u = i / 5;
      const px = len * u;
      const py = by * u * 0.95;
      ctx.moveTo(px, py);
      ctx.lineTo(px + len * 0.12, py - wid * 0.62 * (1 - u * 0.5));
      ctx.moveTo(px, py);
      ctx.lineTo(px + len * 0.12, py + wid * 0.62 * (1 - u * 0.5));
    }
    ctx.stroke();
  }
  ctx.restore();
}

/** a fan of leaves from one point — the building block of every canopy */
export function leafSpray(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, t: Tone, r: RNG, count = 8, baseAng = -Math.PI / 2, spread = 2.4) {
  const items: Array<[number, number, number, number]> = [];
  for (let i = 0; i < count; i++) {
    const u = count === 1 ? 0.5 : i / (count - 1);
    const a = baseAng + (u - 0.5) * spread + (r() - 0.5) * 0.3;
    const len = size * (0.65 + r() * 0.45);
    items.push([a, len, size * (0.17 + r() * 0.07), (r() - 0.5) * 0.35]);
  }
  // draw the leaves that point away from the light first
  items.sort((a, b) => Math.sin(b[0]) - Math.sin(a[0]));
  for (const [a, len, wid, bend] of items) leaf(ctx, x, y, len, wid, a, t, bend);
}

/** a mass of foliage: sprays layered dark-to-light with soft shadow between, holes where the sky shows */
export function canopyMass(
  ctx: CanvasRenderingContext2D, cx: number, cy: number, rx: number, ry: number, tones: Tone[], r: RNG, sprays: number, size = 46, inverted = false, quality = 1
) {
  sprays = Math.max(6, Math.round(sprays * quality));
  const spots: Array<[number, number, number]> = [];
  for (let i = 0; i < sprays; i++) {
    const a = r() * Math.PI * 2;
    const d = Math.sqrt(r());
    const x = cx + Math.cos(a) * rx * d;
    const y = cy + Math.sin(a) * ry * d;
    spots.push([x, y, d]);
  }
  // back to front: lower sprays first so the lit tops overlap them
  spots.sort((a, b) => (inverted ? a[1] - b[1] : b[1] - a[1]));
  for (const [x, y, d] of spots) {
    const heightU = Math.max(0, Math.min(1, (cy + ry - y) / (ry * 2))); // 1 at the top
    const k = Math.min(tones.length - 1, Math.floor(r() * tones.length));
    const t = tones[k];
    // shade lower sprays
    const shaded = heightU < 0.38 ? mixTone(t, t.dark, 0.55 * (0.38 - heightU) / 0.38) : t;
    const s = size * (0.8 + r() * 0.5) * (1 - d * 0.18);
    ctx.fillStyle = rgba(t.deep, 0.3);
    ctx.beginPath();
    ctx.ellipse(x, y + s * 0.25, s * 0.72, s * 0.32, 0, 0, Math.PI * 2);
    ctx.fill();
    leafSpray(ctx, x, y, s, shaded, r, Math.max(4, Math.round((7 + ((r() * 4) | 0)) * (0.65 + 0.35 * quality))), (inverted ? Math.PI / 2 : -Math.PI / 2) + (r() - 0.5) * 1.1, 2.2 + r() * 0.8);
  }
}

function mixTone(a: Tone, c: string, t: number): Tone {
  return { hi: mix(a.hi, c, t), light: mix(a.light, c, t), mid: mix(a.mid, c, t), dark: mix(a.dark, c, t * 0.6), deep: a.deep };
}

// ───────────────────────────── perched plants ─────────────────────────────

/** bromeliad: a rosette of stiff, arching, spiky leaves with a hot centre */
export function bromeliad(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, t: Tone, hot: string, r: RNG) {
  const n = 11;
  for (let i = 0; i < n; i++) {
    const u = i / (n - 1);
    const a = -Math.PI / 2 + (u - 0.5) * 2.7 + (r() - 0.5) * 0.15;
    leaf(ctx, x, y, size * (0.8 + r() * 0.35), size * 0.12, a, t, a < -Math.PI / 2 ? -0.18 : 0.18, false);
  }
  // spiked inner leaves in the warm colour
  const ht = tone(hot);
  for (let i = 0; i < 5; i++) leaf(ctx, x, y, size * (0.42 + r() * 0.2), size * 0.08, -Math.PI / 2 + (i - 2) * 0.35, ht, 0, false);
  ctx.fillStyle = hot;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.1, size * 0.07, 0, Math.PI * 2);
  ctx.fill();
}

/** an arching orchid stem with a row of little flowers */
export function orchid(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, col: string, r: RNG, dir = 1) {
  ctx.strokeStyle = '#3d6b2a';
  ctx.lineWidth = Math.max(1.5, size * 0.04);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.bezierCurveTo(x + dir * size * 0.2, y - size * 0.9, x + dir * size * 0.9, y - size * 1.0, x + dir * size * 1.05, y - size * 0.35);
  ctx.stroke();
  const t = tone(col);
  for (let i = 0; i < 7; i++) {
    const u = 0.25 + (i / 6) * 0.75;
    const px = x + dir * size * (0.2 * u + 0.85 * u * u);
    const py = y - size * (0.9 * Math.sin(u * 2.4) * 0.95) + size * 0.05;
    const fs = size * (0.14 - i * 0.008);
    for (let p = 0; p < 5; p++) {
      const a = (p / 5) * Math.PI * 2 + r() * 0.2;
      ctx.fillStyle = p % 2 ? t.mid : t.light;
      ctx.beginPath();
      ctx.ellipse(px + Math.cos(a) * fs * 0.6, py + Math.sin(a) * fs * 0.6, fs * 0.62, fs * 0.34, a, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#ffe06a';
    ctx.beginPath();
    ctx.arc(px, py, fs * 0.28, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** drooping curtain of aerial roots and hanging moss */
export function rootCurtain(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, drop: number, col: string, r: RNG, count = 14) {
  ctx.lineCap = 'round';
  for (let i = 0; i < count; i++) {
    const px = x + (i / (count - 1) - 0.5) * width + (r() - 0.5) * 8;
    const len = drop * (0.45 + r() * 0.55);
    const sway = (r() - 0.5) * 26;
    ctx.strokeStyle = rgba(darken(col, 0.25), 0.9);
    ctx.lineWidth = 2.2 + r() * 2;
    ctx.beginPath();
    ctx.moveTo(px, y);
    ctx.bezierCurveTo(px + sway, y + len * 0.35, px - sway * 0.6, y + len * 0.7, px + sway * 0.3, y + len);
    ctx.stroke();
    ctx.strokeStyle = rgba(lighten(col, 0.3), 0.55);
    ctx.lineWidth = 1;
    ctx.stroke();
    // fine rootlets
    ctx.strokeStyle = rgba(col, 0.6);
    ctx.lineWidth = 0.9;
    for (let k = 0; k < 3; k++) {
      const u = 0.35 + r() * 0.5;
      const bx = px + sway * (0.3 * u);
      const by = y + len * u;
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.quadraticCurveTo(bx + (r() - 0.5) * 20, by + len * 0.1, bx + (r() - 0.5) * 24, by + len * 0.22);
      ctx.stroke();
    }
  }
}

// ───────────────────────────── giant trees ─────────────────────────────

export interface TreeOpts {
  /** half-width of the trunk at chest height */
  w: number;
  /** how far the trunk leans over its height */
  lean: number;
  /** 0 = crisp, 1 = lost in the haze (distance) */
  haze: number;
  /** show the crown (otherwise the trunk runs off the top of the screen) */
  crown: boolean;
  /** perched plants and lianas */
  detail: number;
  /** wind direction: the crown is swept to one side (storm-bent trees) */
  wind?: number;
  /** drape the trunk in orchids and hibiscus (the Orchid Sanctuary) */
  bloom?: boolean;
}

function jitter(r: RNG, a: number) {
  return (r() - 0.5) * 2 * a;
}

/** paint one tree into ctx with its base at (x, baseY) and the top of the trunk at topY */
export function giantTree(ctx: CanvasRenderingContext2D, x: number, baseY: number, topY: number, look: Look, r: RNG, o: TreeOpts) {
  // backdrop trunks are cooler and quieter than the warm brown of the hero and the ground, so the hero stands out
  const TRK: [string, string] = [mix(look.trunk[0], '#6a7a66', 0.5), mix(look.trunk[1], '#26382f', 0.5)];
  const trunkT = tone(TRK[0], '#1a1228');
  const dark = TRK[1];
  const L = look.leaves.map((c) => tone(c));
  const crowns = look.crowns.map((c) => tone(c));
  const H = baseY - topY;
  const cxAt = (t: number) => x + o.lean * t * t;
  const hwAt = (t: number) => o.w * (1 - t * 0.38);
  const flare = (t: number) => o.w * 1.9 * Math.exp(-t * 11);

  // ── side buttress fins (behind the trunk)
  const fin = (side: number, reach: number, high: number, wid: number, col: string, edge: string) => {
    const sx = x + side * o.w * 0.35;
    ctx.beginPath();
    ctx.moveTo(sx, baseY - high);
    ctx.bezierCurveTo(sx + side * reach * 0.12, baseY - high * 0.45, sx + side * reach * 0.55, baseY - 24, sx + side * reach, baseY + 10);
    ctx.lineTo(sx + side * (reach - wid * 0.1), baseY + 16);
    ctx.bezierCurveTo(sx + side * reach * 0.5, baseY - 4, sx + side * (wid * 0.3), baseY - high * 0.3, sx - side * wid * 0.22, baseY - high * 0.75);
    ctx.closePath();
    ctx.fillStyle = col;
    ctx.fill();
    ctx.strokeStyle = edge;
    ctx.lineWidth = 2;
    ctx.stroke();
  };
  const finL = mix(TRK[0], dark, 0.35);
  fin(-1, o.w * (1.9 + r() * 0.5), H * 0.2, o.w * 0.5, finL, rgba(darken(dark, 0.2), 0.8));
  fin(1, o.w * (1.9 + r() * 0.5), H * 0.2, o.w * 0.5, mix(TRK[0], dark, 0.7), rgba(darken(dark, 0.3), 0.8));

  // ── trunk silhouette
  const N = 44;
  const left: Array<[number, number]> = [];
  const right: Array<[number, number]> = [];
  const nl = r() * 9;
  const nr = r() * 9;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const y = baseY - t * H;
    const c = cxAt(t);
    const hw = hwAt(t);
    const fl = flare(t);
    left.push([c - hw - fl * 0.9 + Math.sin(t * 17 + nl) * o.w * 0.035, y]);
    right.push([c + hw + fl + Math.sin(t * 15 + nr) * o.w * 0.035, y]);
  }
  const trunkPath = () => {
    ctx.beginPath();
    ctx.moveTo(left[0][0], left[0][1]);
    for (const p of left) ctx.lineTo(p[0], p[1]);
    for (let i = right.length - 1; i >= 0; i--) ctx.lineTo(right[i][0], right[i][1]);
    ctx.closePath();
  };
  trunkPath();
  const g = ctx.createLinearGradient(x - o.w * 1.1, 0, x + o.w * 1.3, 0);
  g.addColorStop(0, trunkT.light);
  g.addColorStop(0.35, TRK[0]);
  g.addColorStop(0.8, mix(TRK[0], dark, 0.7));
  g.addColorStop(1, dark);
  ctx.fillStyle = g;
  ctx.fill();

  ctx.save();
  trunkPath();
  ctx.clip();
  // bark fissures that follow the trunk
  ctx.lineCap = 'round';
  const fiss = 16 + Math.round(o.w / 5);
  for (let i = 0; i < fiss; i++) {
    const u = (i + r() * 0.8) / fiss;
    const t0 = r() * 0.55;
    const t1 = Math.min(1, t0 + 0.2 + r() * 0.55);
    const wob = r() * 6;
    const pts: Array<[number, number]> = [];
    for (let k = 0; k <= 14; k++) {
      const t = t0 + (t1 - t0) * (k / 14);
      const c = cxAt(t);
      const span = hwAt(t) * 2 + flare(t) * 1.8;
      pts.push([c - hwAt(t) - flare(t) * 0.9 + span * u + Math.sin(t * 24 + wob) * 2.4, baseY - t * H]);
    }
    ctx.strokeStyle = rgba(darken(dark, 0.35), 0.42);
    ctx.lineWidth = 1.4 + r() * 2.4;
    ctx.beginPath();
    pts.forEach((p, k) => (k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
    ctx.stroke();
    ctx.strokeStyle = rgba(trunkT.hi, 0.2);
    ctx.lineWidth = 1;
    ctx.beginPath();
    pts.forEach((p, k) => (k ? ctx.lineTo(p[0] - 2.4, p[1]) : ctx.moveTo(p[0] - 2.4, p[1])));
    ctx.stroke();
  }
  // growth rings: little horizontal bark scars
  ctx.strokeStyle = rgba(darken(dark, 0.4), 0.3);
  ctx.lineWidth = 1.6;
  for (let i = 0; i < H / 22; i++) {
    const t = r();
    const c = cxAt(t);
    const hw = hwAt(t);
    const sx = c - hw + r() * hw * 1.6;
    ctx.beginPath();
    ctx.moveTo(sx, baseY - t * H);
    ctx.quadraticCurveTo(sx + 6, baseY - t * H + 3, sx + 12 + r() * 10, baseY - t * H);
    ctx.stroke();
  }
  // moss on the damp, shaded side and along the roots
  const moss = tone(look.leaves[1] ?? look.leaves[0]);
  for (let i = 0; i < 30 + o.detail * 24; i++) {
    const t = Math.pow(r(), 1.4) * 0.85;
    const c = cxAt(t);
    const hw = hwAt(t) + flare(t) * 0.7;
    const mx = c - hw + r() * hw * 1.2;
    const my = baseY - t * H;
    const rad = 7 + r() * 16;
    ctx.fillStyle = rgba(moss.mid, 0.55);
    ctx.beginPath();
    ctx.ellipse(mx, my, rad, rad * 0.55, (r() - 0.5) * 0.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = rgba(moss.light, 0.6);
    for (let k = 0; k < 5; k++) {
      ctx.beginPath();
      ctx.arc(mx + jitter(r, rad * 0.8), my + jitter(r, rad * 0.4), 1.5 + r() * 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  // pale lichen discs
  ctx.fillStyle = 'rgba(225,235,200,0.22)';
  for (let i = 0; i < 18; i++) {
    const t = r() * 0.9;
    const c = cxAt(t);
    ctx.beginPath();
    ctx.arc(c + jitter(r, hwAt(t) * 0.8), baseY - t * H, 3 + r() * 5, 0, Math.PI * 2);
    ctx.fill();
  }
  // shadow on the right, rim light on the left
  const sh = ctx.createLinearGradient(x - o.w * 1.4, 0, x + o.w * 1.6, 0);
  sh.addColorStop(0, 'rgba(255,240,200,0.18)');
  sh.addColorStop(0.35, 'rgba(0,0,0,0)');
  sh.addColorStop(1, 'rgba(10,6,20,0.45)');
  ctx.fillStyle = sh;
  ctx.fillRect(x - o.w * 4, topY - 20, o.w * 8, H + 60);
  // darker toward the ground (undergrowth shade)
  const bt = ctx.createLinearGradient(0, baseY - 90, 0, baseY + 10);
  bt.addColorStop(0, 'rgba(8,16,6,0)');
  bt.addColorStop(1, 'rgba(8,16,6,0.5)');
  ctx.fillStyle = bt;
  ctx.fillRect(x - o.w * 4, baseY - 90, o.w * 8, 110);
  ctx.restore();
  ctx.strokeStyle = rgba(darken(dark, 0.55), 0.55);
  ctx.lineWidth = 2;
  trunkPath();
  ctx.stroke();

  // ── the trunk carries on below its base, into the undergrowth, so it never floats when the ground sits low on screen
  const bx0 = left[0][0];
  const bx1 = right[0][0];
  const ext = ctx.createLinearGradient(bx0, 0, bx1, 0);
  ext.addColorStop(0, mix(TRK[0], dark, 0.5));
  ext.addColorStop(1, dark);
  ctx.fillStyle = ext;
  ctx.fillRect(bx0, baseY - 4, bx1 - bx0, 300);

  // ── front buttress fin (overlaps the trunk base)
  fin(r() > 0.5 ? 1 : -1, o.w * (1.0 + r() * 0.5), H * 0.15, o.w * 0.4, mix(TRK[0], dark, 0.45), rgba(darken(dark, 0.3), 0.7));

  // ── strangling lianas twisting up the trunk
  const nL = Math.round(1 + o.detail * 2);
  for (let k = 0; k < nL; k++) {
    const phase = r() * 6;
    const freq = 2.2 + r() * 1.4;
    const amp = hwAt(0.3) * (0.55 + r() * 0.3);
    const t0 = 0.03 + r() * 0.1;
    const t1 = 0.6 + r() * 0.35;
    const pts: Array<[number, number, number]> = [];
    for (let i = 0; i <= 60; i++) {
      const t = t0 + (t1 - t0) * (i / 60);
      const ph = Math.sin(t * freq * Math.PI * 2 + phase);
      pts.push([cxAt(t) + ph * amp * (1 - t * 0.35), baseY - t * H, Math.cos(t * freq * Math.PI * 2 + phase)]);
    }
    // draw the parts that pass in front of the trunk, thicker
    ctx.lineCap = 'round';
    for (let i = 0; i < pts.length - 1; i++) {
      const front = pts[i][2] > 0;
      ctx.strokeStyle = front ? mix(look.vine.main, '#2a1a0a', 0.45) : rgba(mix(look.vine.main, '#2a1a0a', 0.7), 0.7);
      ctx.lineWidth = front ? 4.5 : 3;
      ctx.beginPath();
      ctx.moveTo(pts[i][0], pts[i][1]);
      ctx.lineTo(pts[i + 1][0], pts[i + 1][1]);
      ctx.stroke();
      if (front) {
        ctx.strokeStyle = rgba(lighten(look.vine.main, 0.35), 0.6);
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
    }
    // a few leaves along it
    for (let i = 4; i < pts.length; i += 7) {
      leaf(ctx, pts[i][0], pts[i][1], 18 + r() * 10, 6, (r() > 0.5 ? 0.3 : Math.PI - 0.3) + jitter(r, 0.4), L[(r() * L.length) | 0], 0.1, false);
    }
  }

  // ── perched plants on the trunk and its roots: composed, not strewn. A cluster of three to five plants (the biggest in the middle, a
  // minimum gap between neighbours, one flower colour for the whole cluster) sits at one height on one side of the trunk; a big near
  // trunk may get a second, smaller one a good way up or down, and the bark between them stays bare. (They used to be up to seven
  // plants at random heights and sides on every tree, which read as flowers thrown at the wall.)
  const clusters: Array<{ tc: number; n: number; side: number }> = [];
  const tc0 = 0.14 + r() * 0.3;
  clusters.push({ tc: tc0, n: o.detail < 0.3 ? 3 : o.detail < 0.8 ? 3 + ((r() * 2) | 0) : 4 + ((r() * 2) | 0), side: r() > 0.5 ? 1 : -1 });
  if (o.detail >= 0.8 && r() < 0.55) clusters.push({ tc: tc0 + (tc0 > 0.36 ? -0.24 : 0.26) + r() * 0.04, n: 3, side: -clusters[0].side });
  // a far, hazy tree is a quiet silhouette: only some of them carry a cluster at all
  const skipFar = o.detail < 0.3 && r() < 0.4;
  for (const cl of skipFar ? [] : clusters) {
    const tcx = cxAt(cl.tc);
    const hot = look.flora[(r() * look.flora.length) | 0];
    const base = 34 + o.w * 0.12 + r() * 8;
    const mem = clusterAround(r, cl.n, tcx + cl.side * hwAt(cl.tc) * 0.35, baseY - cl.tc * H, hwAt(cl.tc) * 0.75, H * 0.07, base * 0.95);
    for (const m of mem) {
      const ex = m.x;
      const ey = m.y;
      const roll = r();
      // the lead is the biggest; the ones toward the edge of the cluster taper off
      const size = base * (1 - m.edge * 0.38) * (0.9 + r() * 0.2);
      // a small mossy pad for it to sit on
      ctx.fillStyle = rgba(moss.dark, 0.85);
      ctx.beginPath();
      ctx.ellipse(ex, ey + 3, size * 0.5, size * 0.17, 0, 0, Math.PI * 2);
      ctx.fill();
      if (o.bloom) {
        // a drape of blooms on a green tuft
        leafSpray(ctx, ex, ey + 4, size * 0.7, L[(r() * L.length) | 0], r, 8, -Math.PI / 2, 2.8);
        const kinds = ['hibiscus', 'orchid', 'plumeria', 'passion'] as const;
        const nb = m.k === 0 ? 3 : 2;
        for (let k = 0; k < nb; k++) drawBloom(ctx, kinds[(r() * kinds.length) | 0], ex + jitter(r, size * 0.5), ey - size * 0.3 + jitter(r, size * 0.3), size * (0.35 + r() * 0.25), k === 0 ? hot : look.flora[(r() * look.flora.length) | 0], '#ffd23a', jitter(r, 1), r);
      } else if (roll < 0.45) bromeliad(ctx, ex, ey, size, L[(r() * L.length) | 0], hot, r);
      else if (roll < 0.75) orchid(ctx, ex, ey, size * 1.1, hot, r, m.k % 2 ? 1 : -1);
      else leafSpray(ctx, ex, ey, size * 0.9, L[(r() * L.length) | 0], r, 9, -Math.PI / 2, 2.6);
    }
  }

  if (!o.crown) {
    // trunk runs off the top: just a few limbs with hanging foliage at the edge of the frame
    return;
  }

  // ── limbs and crown
  const cx0 = cxAt(1);
  const limb = (sx: number, sy: number, ex: number, ey: number, w0: number) => {
    ctx.strokeStyle = TRK[1];
    ctx.lineCap = 'round';
    ctx.lineWidth = w0;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.quadraticCurveTo((sx + ex) / 2, Math.min(sy, ey) - 26, ex, ey);
    ctx.stroke();
    ctx.strokeStyle = rgba(trunkT.light, 0.6);
    ctx.lineWidth = w0 * 0.35;
    ctx.beginPath();
    ctx.moveTo(sx, sy - w0 * 0.2);
    ctx.quadraticCurveTo((sx + ex) / 2, Math.min(sy, ey) - 30, ex, ey - w0 * 0.2);
    ctx.stroke();
  };
  const spread = 150 + o.w * 1.6;
  const limbs: Array<[number, number, number]> = [];
  for (const s of o.wind ? [Math.sign(o.wind)] : [-1, 1]) {
    const lx = cx0 + s * (spread * (o.wind ? 1.2 + r() * 0.5 : 0.7 + r() * 0.5));
    const ly = topY + 10 + r() * 50;
    limb(cx0, topY + 70 + r() * 40, lx, ly, o.w * 0.34);
    limbs.push([lx, ly, s]);
  }
  // hanging roots / lianas under the limbs
  for (const [lx, ly] of limbs) {
    rootCurtain(ctx, lx, ly + 6, 90, 120 + r() * 120, TRK[1], r, 8);
    for (let k = 0; k < 2; k++) {
      const vx = lx + jitter(r, 60);
      ctx.strokeStyle = tone(look.vine.main).deep;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(vx, ly);
      ctx.bezierCurveTo(vx + 14, ly + 70, vx - 14, ly + 130, vx + 4, ly + 150 + r() * 120);
      ctx.stroke();
    }
  }
  // crowns: far lobes, then the big one on top
  const q = 0.5 + 0.5 * Math.min(1, o.detail);
  const mass = (cx: number, cy: number, rx: number, ry: number, n: number) => canopyMass(ctx, cx, cy, rx, ry, crowns, r, n, 40 + o.w * 0.22, false, q);
  for (const [lx, ly] of limbs) mass(lx, ly - 22, 120 + o.w, 70 + o.w * 0.3, 28);
  mass(cx0 + (o.wind ? Math.sign(o.wind) * 60 : 0), topY - 30, 150 + o.w * 1.5, 92 + o.w * 0.5, o.wind ? 30 : 44);
  // epiphytes high on the limbs, catching the light
  for (const [lx, ly] of limbs) {
    if (r() > 0.3) bromeliad(ctx, lx - 8, ly - 4, 30 + r() * 14, L[(r() * L.length) | 0], look.flora[(r() * look.flora.length) | 0], r);
    if (r() > 0.5) orchid(ctx, lx + 20, ly - 6, 38, look.flora[(r() * look.flora.length) | 0], r, r() > 0.5 ? 1 : -1);
  }
}

/** composite a tree through a haze veil so distant ones sit in the atmosphere */
export function paintTree(
  target: CanvasRenderingContext2D, x: number, baseY: number, topY: number, look: Look, r: RNG, o: TreeOpts, tileW: number, res = 1
) {
  const reach = 330 + o.w * 3.2;
  const top = Math.min(topY, 0) - 160;
  const pad = 40;
  const cw = Math.round(reach * 2 + pad * 2);
  const chh = Math.round(baseY - top + 200);
  const pw = Math.round(cw * res);
  const ph = Math.round(chh * res);
  const [tmp, c] = getScratch(pw, ph);
  c.scale(res, res);
  c.translate(cw / 2 - x, -top + pad);
  giantTree(c, x, baseY, topY, look, r, o);
  if (o.haze > 0) {
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.globalCompositeOperation = 'source-atop';
    c.fillStyle = rgba(look.haze, o.haze);
    c.fillRect(0, 0, pw, ph);
  }
  for (const dx of [0, tileW, -tileW]) {
    const ox = x - cw / 2 + dx;
    if (ox > tileW || ox + cw < 0) continue;
    target.drawImage(tmp, 0, 0, pw, ph, ox, top - pad, cw, chh);
  }
}
