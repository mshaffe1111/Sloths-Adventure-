/**
 * envKit — what grows at the hero's feet, and what hangs in front of the camera, in each world.
 *
 * Every world is designed from one question: what is this place, and what would grow here because of it?
 *   W4 Mist Cascades: waterfall spray soaks everything, so the plants are the ones that thrive in constant wet:
 *      huge umbrella-leafed gunnera, tree ferns, dripping moss. Fronds droop and shed water.
 *   W8 Twilight Treetops: a dusk canopy where light is scarce, so plants glow to call in the moths:
 *      crystal blooms, bell-vines that shine, ferns edged with light.
 * A world with no kit here keeps the shared jungle undergrowth (see scenery.buildNear).
 */
import { tone, mix, rgba, lighten, darken, type RNG, type Tone } from './artKit.ts';
import { fernFrond } from './flora.ts';
import { leaf } from './rainforest.ts';
import { hangingBat } from './territoryTrees.ts';
import type { Look } from './scenery.ts';

const TAU = Math.PI * 2;

export type NearKind = 'gunnera' | 'treefern' | 'dripmoss' | 'crystalbloom' | 'glowfern' | 'bellvine';
export type SwayKind = 'drip-fern' | 'bell-vine';

interface Kit {
  /** [plant, weight] at the hero's feet */
  near: Array<[NearKind, number]>;
  /** the big hanging things at the top of the screen */
  sway: SwayKind;
}

export const ENV: Partial<Record<number, Kit>> = {
  4: { near: [['gunnera', 3], ['treefern', 3], ['dripmoss', 2]], sway: 'drip-fern' },
  8: { near: [['crystalbloom', 3], ['glowfern', 3], ['bellvine', 2]], sway: 'bell-vine' },
};

export const hasKit = (world: number) => !!ENV[world];

function pickWeighted<T>(r: RNG, items: Array<[T, number]>): T {
  const total = items.reduce((s, [, w]) => s + w, 0);
  let k = r() * total;
  for (const [it, w] of items) {
    k -= w;
    if (k <= 0) return it;
  }
  return items[0][0];
}

// ───────────────────────────── W4: plants of constant spray ─────────────────────────────

/** gunnera: a stout stalk under a huge ribbed umbrella of a leaf, with water beading on it */
function gunnera(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, t: Tone, r: RNG) {
  const stalkH = s * (0.8 + r() * 0.4);
  const topY = y - stalkH;
  // bristly stalk
  ctx.strokeStyle = t.deep;
  ctx.lineWidth = Math.max(4, s * 0.07);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x, y + 10);
  ctx.quadraticCurveTo(x + (r() - 0.5) * s * 0.2, y - stalkH * 0.5, x, topY);
  ctx.stroke();
  ctx.strokeStyle = rgba(t.hi, 0.4);
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(x - 1.5, y + 8);
  ctx.quadraticCurveTo(x - 1.5 + (r() - 0.5) * s * 0.2, y - stalkH * 0.5, x - 1.5, topY);
  ctx.stroke();
  // the umbrella: a wide, shallow bowl seen from the side, with a scalloped, toothed rim
  const rw = s * (0.72 + r() * 0.25);
  const rh = rw * 0.3;
  const lobes = 9;
  ctx.beginPath();
  for (let i = 0; i <= lobes * 2; i++) {
    const a = Math.PI + (i / (lobes * 2)) * Math.PI;
    const bump = i % 2 ? 1.0 : 0.9;
    const px = x + Math.cos(a) * rw * bump;
    const py = topY + Math.sin(a) * rh * bump * -1;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.quadraticCurveTo(x, topY + rh * 1.5, x - rw, topY);
  ctx.closePath();
  const g = ctx.createLinearGradient(x - rw, topY, x + rw, topY);
  g.addColorStop(0, t.dark);
  g.addColorStop(0.45, t.mid);
  g.addColorStop(1, t.light);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = t.deep;
  ctx.lineWidth = 1.6;
  ctx.stroke();
  // ribs from the stalk to the rim
  ctx.strokeStyle = rgba(t.deep, 0.7);
  ctx.lineWidth = 1.4;
  for (let i = 1; i < lobes * 2; i += 2) {
    const a = Math.PI + (i / (lobes * 2)) * Math.PI;
    ctx.beginPath();
    ctx.moveTo(x, topY + 2);
    ctx.lineTo(x + Math.cos(a) * rw * 0.92, topY - Math.sin(a) * rh * 0.92 * -1 * -1);
    ctx.stroke();
  }
  // water beads on the leaf
  ctx.fillStyle = 'rgba(225,248,255,0.8)';
  for (let i = 0; i < 9; i++) {
    const bx = x + (r() - 0.5) * rw * 1.5;
    const by = topY - r() * rh * 0.7;
    ctx.beginPath();
    ctx.ellipse(bx, by, 1.8 + r() * 1.6, 1.4 + r() * 1.2, 0, 0, TAU);
    ctx.fill();
  }
  // a drip falling from the rim
  ctx.fillStyle = 'rgba(200,240,255,0.75)';
  const dx = x + (r() > 0.5 ? 1 : -1) * rw * 0.85;
  ctx.beginPath();
  ctx.ellipse(dx, topY + rh * 0.6, 2, 3.4, 0, 0, TAU);
  ctx.fill();
}

/** a short, thick tree-fern trunk crowned with drooping, dew-laden fronds */
function treeFernNear(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, t: Tone, r: RNG) {
  const h = s * (0.55 + r() * 0.35);
  const topY = y - h;
  // fibrous trunk with leaf-scar rings
  ctx.strokeStyle = '#4a3a2a';
  ctx.lineWidth = Math.max(7, s * 0.11);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x, y + 8);
  ctx.quadraticCurveTo(x + (r() - 0.5) * 12, y - h * 0.5, x, topY);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.lineWidth = 1.2;
  for (let k = 1; k < 7; k++) {
    const yy = y - (h * k) / 7;
    ctx.beginPath();
    ctx.moveTo(x - s * 0.05, yy);
    ctx.lineTo(x + s * 0.05, yy + 2);
    ctx.stroke();
  }
  // moss on the trunk
  ctx.fillStyle = rgba(t.mid, 0.7);
  for (let k = 0; k < 7; k++) {
    ctx.beginPath();
    ctx.ellipse(x + (r() - 0.5) * s * 0.07, y - r() * h, 3.2, 5, 0, 0, TAU);
    ctx.fill();
  }
  // the crown: arching fronds, all drooping from the weight of the water
  const n = 9;
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + ((i / (n - 1)) - 0.5) * 3.0 + (r() - 0.5) * 0.2;
    fernFrond(ctx, x, topY, s * (0.5 + r() * 0.2), a, i % 2 ? t : tone(lighten(t.mid, 0.08)), r, 0.9);
  }
}

/** curtains of wet moss hanging from a root or a snag, beaded with water */
function dripMoss(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, t: Tone, r: RNG) {
  const w = s * 0.7;
  // a low bank of moss
  ctx.fillStyle = t.dark;
  ctx.beginPath();
  ctx.ellipse(x, y + 8, w, s * 0.18, 0, Math.PI, 0);
  ctx.fill();
  for (let i = 0; i < 26; i++) {
    const px = x + (r() - 0.5) * w * 1.8;
    const py = y - r() * s * 0.16 + 6;
    ctx.fillStyle = i % 3 ? t.mid : t.light;
    ctx.beginPath();
    ctx.ellipse(px, py, 5 + r() * 6, 4 + r() * 4, 0, 0, TAU);
    ctx.fill();
  }
  // strands that droop and drip
  ctx.lineCap = 'round';
  for (let i = 0; i < 7; i++) {
    const px = x + (r() - 0.5) * w * 1.5;
    const len = s * (0.2 + r() * 0.28);
    ctx.strokeStyle = i % 2 ? t.mid : t.light;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(px, y + 2);
    ctx.quadraticCurveTo(px + (r() - 0.5) * 8, y + len * 0.5, px + (r() - 0.5) * 5, y + len);
    ctx.stroke();
    ctx.fillStyle = 'rgba(215,245,255,0.85)';
    ctx.beginPath();
    ctx.ellipse(px, y + len + 3, 1.8, 2.8, 0, 0, TAU);
    ctx.fill();
  }
}

// ───────────────────────────── W8: plants that call the moths ─────────────────────────────

/** a stalk topped by a faceted glass bloom that gives off its own light */
function crystalBloom(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, look: Look, r: RNG) {
  const glow = look.glow ?? '#7ae6ff';
  const cols = [look.flora[0], look.flora[1], '#c9a2ff', '#8fd0ff'];
  const h = s * (0.7 + r() * 0.5);
  const topY = y - h;
  // halo
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const hg = ctx.createRadialGradient(x, topY, 0, x, topY, s * 0.9);
  hg.addColorStop(0, rgba(glow, 0.5));
  hg.addColorStop(1, rgba(glow, 0));
  ctx.fillStyle = hg;
  ctx.fillRect(x - s, topY - s, s * 2, s * 2);
  ctx.restore();
  // stalk with a leaf pair
  ctx.strokeStyle = '#2a1a50';
  ctx.lineWidth = 3.2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x, y + 8);
  ctx.quadraticCurveTo(x + (r() - 0.5) * 10, y - h * 0.5, x, topY);
  ctx.stroke();
  const lt = tone('#5a3aa0', '#0a0420');
  leaf(ctx, x, y - h * 0.3, s * 0.4, s * 0.1, -0.5, lt, 0.1);
  leaf(ctx, x, y - h * 0.45, s * 0.36, s * 0.09, Math.PI + 0.5, lt, -0.1);
  // the bloom: six glassy petals, each a faceted spear
  const petals = 6;
  for (let i = 0; i < petals; i++) {
    const a = -Math.PI / 2 + (i / (petals - 1) - 0.5) * 2.3;
    const L = s * (0.42 + r() * 0.12) * (i === 2 || i === 3 ? 1.15 : 0.9);
    const col = cols[i % cols.length];
    const pt = tone(col, '#120626');
    ctx.save();
    ctx.translate(x, topY + 4);
    ctx.rotate(a + Math.PI / 2);
    const wd = s * 0.1;
    ctx.beginPath();
    ctx.moveTo(-wd, 0);
    ctx.lineTo(-wd * 1.1, -L * 0.6);
    ctx.lineTo(0, -L);
    ctx.lineTo(wd * 1.1, -L * 0.6);
    ctx.lineTo(wd, 0);
    ctx.closePath();
    const gg = ctx.createLinearGradient(-wd, 0, wd, 0);
    gg.addColorStop(0, pt.light);
    gg.addColorStop(0.5, pt.mid);
    gg.addColorStop(1, pt.dark);
    ctx.fillStyle = gg;
    ctx.fill();
    ctx.strokeStyle = rgba('#120626', 0.8);
    ctx.lineWidth = 1.3;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-wd, 0);
    ctx.lineTo(-wd * 1.1, -L * 0.6);
    ctx.lineTo(0, -L);
    ctx.lineTo(0, -L * 0.3);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle = '#fff6c8';
  ctx.beginPath();
  ctx.arc(x, topY + 3, s * 0.06, 0, TAU);
  ctx.fill();
}

/** a fern whose frond edges are lined with light, as if each leaflet were wired */
function glowFern(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, look: Look, r: RNG) {
  const glow = look.glow ?? '#7ae6ff';
  const base = tone(mix(look.leaves[1] ?? '#3a9ad8', '#1a0a40', 0.35), '#0a0420');
  const n = 7;
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + ((i / (n - 1)) - 0.5) * 2.5 + (r() - 0.5) * 0.2;
    fernFrond(ctx, x, y, s * (0.55 + r() * 0.25), a, base, r, 0.55);
  }
  // the light along the fronds
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + ((i / (n - 1)) - 0.5) * 2.5;
    const len = s * 0.6;
    const tx = x + Math.cos(a) * len;
    const ty = y + Math.sin(a) * len + len * 0.28;
    ctx.strokeStyle = rgba(glow, 0.55);
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + Math.cos(a) * len * 0.55, y + Math.sin(a) * len * 0.55 - len * 0.12, tx, ty);
    ctx.stroke();
    const sg = ctx.createRadialGradient(tx, ty, 0, tx, ty, 9);
    sg.addColorStop(0, rgba(glow, 0.9));
    sg.addColorStop(1, rgba(glow, 0));
    ctx.fillStyle = sg;
    ctx.fillRect(tx - 9, ty - 9, 18, 18);
  }
  ctx.restore();
}

/** a vine of lit bells that rises and arches over, each bell a tiny lantern */
function bellVine(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, look: Look, r: RNG) {
  const glow = look.glow ?? '#7ae6ff';
  const dir = r() > 0.5 ? 1 : -1;
  const pts: Array<[number, number]> = [];
  for (let i = 0; i <= 12; i++) {
    const u = i / 12;
    pts.push([x + dir * Math.sin(u * 2.2) * s * 0.55, y - Math.sin(u * 1.6) * s * 0.9 + u * u * s * 0.25]);
  }
  ctx.strokeStyle = '#3a2470';
  ctx.lineWidth = 2.6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  pts.forEach(([a, b], i) => (i === 0 ? ctx.moveTo(a, b) : ctx.lineTo(a, b)));
  ctx.stroke();
  for (let i = 3; i < pts.length; i += 2) {
    const [bx, by] = pts[i];
    const sz = 6 + r() * 4;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(bx, by + sz, 0, bx, by + sz, sz * 3);
    g.addColorStop(0, rgba(glow, 0.55));
    g.addColorStop(1, rgba(glow, 0));
    ctx.fillStyle = g;
    ctx.fillRect(bx - sz * 3, by - sz * 2, sz * 6, sz * 6);
    ctx.restore();
    ctx.strokeStyle = '#3a2470';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(bx, by + 4);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(bx - sz * 0.8, by + sz * 1.5);
    ctx.quadraticCurveTo(bx - sz * 0.7, by + 4, bx, by + 3);
    ctx.quadraticCurveTo(bx + sz * 0.7, by + 4, bx + sz * 0.8, by + sz * 1.5);
    ctx.closePath();
    const bg = ctx.createLinearGradient(bx, by, bx, by + sz * 1.5);
    bg.addColorStop(0, lighten(look.flora[i % look.flora.length], 0.25));
    bg.addColorStop(1, '#fff6d0');
    ctx.fillStyle = bg;
    ctx.fill();
    ctx.strokeStyle = rgba(darken(look.flora[i % look.flora.length], 0.5), 0.8);
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

// ───────────────────────────── public ─────────────────────────────

/** paint one plant of a world's kit; false if the world has no kit */
export function paintNearPlant(ctx: CanvasRenderingContext2D, world: number, look: Look, x: number, y: number, size: number, r: RNG): boolean {
  const kit = ENV[world];
  if (!kit) return false;
  const kind = pickWeighted(r, kit.near);
  const leafT = tone(mix(look.leaves[(r() * look.leaves.length) | 0], look.haze, 0.1));
  switch (kind) {
    case 'gunnera': gunnera(ctx, x, y, size * 1.5, leafT, r); break;
    case 'treefern': treeFernNear(ctx, x, y, size * 1.7, leafT, r); break;
    case 'dripmoss': dripMoss(ctx, x, y, size * 1.4, tone(mix(look.leaves[2] ?? '#7fe0b0', '#2a7a5a', 0.3)), r); break;
    case 'crystalbloom': crystalBloom(ctx, x, y, size * 1.5, look, r); break;
    case 'glowfern': glowFern(ctx, x, y, size * 1.5, look, r); break;
    case 'bellvine': bellVine(ctx, x, y, size * 1.5, look, r); break;
  }
  return true;
}

/** the hanging cluster in front of the camera (a 360px sprite, hung from its top centre) */
export function paintSwayCluster(c: CanvasRenderingContext2D, world: number, look: Look, variant: number, r: RNG): boolean {
  const kit = ENV[world];
  if (!kit) return false;
  if (kit.sway === 'drip-fern') {
    const dark = tone(darken(look.leaves[0], 0.3), '#04201a');
    const n = 4 + (variant % 2);
    for (let k = 0; k < n; k++) {
      const a = Math.PI / 2 + (k - (n - 1) / 2) * 0.5 + (r() - 0.5) * 0.15;
      fernFrond(c, 180, 8, 190 + r() * 60, a, dark, r, 1.1);
    }
    // beads of water along the lowest frond tips
    c.fillStyle = 'rgba(215,245,255,0.8)';
    for (let k = 0; k < 6; k++) {
      c.beginPath();
      c.ellipse(80 + r() * 200, 150 + r() * 160, 2, 3.2, 0, 0, TAU);
      c.fill();
    }
    return true;
  }
  // bell-vine: dark stems that hang and curl, each ending in a lit bell
  const glow = look.glow ?? '#7ae6ff';
  const n = 3 + (variant % 2);
  for (let k = 0; k < n; k++) {
    const sx = 180 + (k - (n - 1) / 2) * 70 + (r() - 0.5) * 20;
    const len = 150 + r() * 150;
    const sway = (r() - 0.5) * 60;
    c.strokeStyle = '#1c1040';
    c.lineWidth = 3.4;
    c.lineCap = 'round';
    c.beginPath();
    c.moveTo(sx, 4);
    c.bezierCurveTo(sx + sway, len * 0.35, sx - sway, len * 0.7, sx + sway * 0.3, len);
    c.stroke();
    // leaves on the stem
    const lt = tone('#3a2a7a', '#0a0420');
    for (let m = 1; m <= 3; m++) leaf(c, sx + (m % 2 ? sway * 0.2 : -sway * 0.2), (len * m) / 4, 40 + r() * 20, 12, m % 2 ? 0.4 : Math.PI - 0.4, lt, 0.2);
    const bx = sx + sway * 0.3;
    const by = len;
    c.save();
    c.globalCompositeOperation = 'lighter';
    const g = c.createRadialGradient(bx, by + 14, 0, bx, by + 14, 44);
    g.addColorStop(0, rgba(glow, 0.6));
    g.addColorStop(1, rgba(glow, 0));
    c.fillStyle = g;
    c.fillRect(bx - 44, by - 30, 88, 88);
    c.restore();
    c.beginPath();
    c.moveTo(bx - 15, by + 28);
    c.quadraticCurveTo(bx - 13, by + 4, bx, by);
    c.quadraticCurveTo(bx + 13, by + 4, bx + 15, by + 28);
    c.closePath();
    const bg = c.createLinearGradient(bx, by, bx, by + 28);
    bg.addColorStop(0, lighten(look.flora[k % look.flora.length], 0.3));
    bg.addColorStop(1, '#fff6d0');
    c.fillStyle = bg;
    c.fill();
    c.strokeStyle = rgba(darken(look.flora[k % look.flora.length], 0.5), 0.85);
    c.lineWidth = 1.4;
    c.stroke();
  }
  // the Monarch's subjects asleep on the vines: a couple of bats hanging between the bells
  const batN = 1 + (variant % 2);
  for (let k = 0; k < batN; k++) {
    const bx = 70 + r() * 220;
    c.strokeStyle = '#1c1040';
    c.lineWidth = 2.4;
    c.beginPath();
    c.moveTo(bx - 26, 3);
    c.quadraticCurveTo(bx, 14 + r() * 10, bx + 26, 3);
    c.stroke();
    hangingBat(c, bx, 10, 15 + r() * 6, '#1b1033', r() > 0.5 ? glow : undefined);
  }
  return true;
}

/** the low, dark clump at the very bottom edge of the frame */
export function paintFrontClump(ctx: CanvasRenderingContext2D, world: number, look: Look, x: number, y: number, r: RNG): boolean {
  if (!ENV[world]) return false;
  const dark = tone(mix(look.leaves[0], '#04120c', 0.62));
  const n = 7;
  for (let k = 0; k < n; k++) {
    const a = -Math.PI / 2 + ((k / (n - 1)) - 0.5) * 2.3 + (r() - 0.5) * 0.15;
    fernFrond(ctx, x, y, 150 + r() * 60, a, dark, r, 0.65);
  }
  if (look.glow && world === 8) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let k = 0; k < 6; k++) {
      const a = -Math.PI / 2 + ((k / 5) - 0.5) * 2.2;
      const gx = x + Math.cos(a) * 150;
      const gy = y + Math.sin(a) * 150 + 40;
      const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, 14);
      g.addColorStop(0, rgba(look.glow, 0.55));
      g.addColorStop(1, rgba(look.glow, 0));
      ctx.fillStyle = g;
      ctx.fillRect(gx - 14, gy - 14, 28, 28);
    }
    ctx.restore();
  }
  return true;
}

/** the hanging cluster at the top corners of the frame, reusing the sway sprite at a smaller scale */
export function paintFrontHang(ctx: CanvasRenderingContext2D, world: number, look: Look, x: number, variant: number, r: RNG): boolean {
  if (!ENV[world]) return false;
  ctx.save();
  ctx.translate(x - 144, -26);
  ctx.scale(0.8, 0.8);
  paintSwayCluster(ctx, world, look, variant, r);
  ctx.restore();
  return true;
}

// ───────────────────────────── ground-edge decoration (what grows right at the hero's feet) ─────────────────────────────

interface Strip { x: number; y: number; width: number; height: number }

function pebbleStack(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, t: Tone, outline: string) {
  for (let k = 0; k < 2; k++) {
    const w = s * (1 - k * 0.35);
    ctx.fillStyle = k ? t.light : t.mid;
    ctx.strokeStyle = outline;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.ellipse(x + k * 2, y - 3 - k * s * 0.34, w, s * 0.38, 0, Math.PI, 0);
    ctx.lineTo(x + w + k * 2, y - 1 - k * s * 0.3);
    ctx.lineTo(x - w + k * 2, y - 1 - k * s * 0.3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  // wet sheen
  ctx.fillStyle = 'rgba(235,250,255,0.5)';
  ctx.beginPath();
  ctx.ellipse(x - s * 0.2, y - s * 0.55, s * 0.28, 1.8, -0.2, 0, TAU);
  ctx.fill();
}

function featherOnGround(ctx: CanvasRenderingContext2D, x: number, y: number, len: number, r: RNG) {
  ctx.save();
  ctx.translate(x, y - 3);
  ctx.rotate((r() - 0.5) * 0.7 + (r() > 0.5 ? 0 : Math.PI));
  ctx.fillStyle = r() > 0.5 ? '#eee6d2' : '#8a6a48';
  ctx.beginPath();
  ctx.moveTo(-len, 0);
  ctx.quadraticCurveTo(-len * 0.1, -len * 0.3, len * 0.9, -1);
  ctx.quadraticCurveTo(-len * 0.1, len * 0.12, -len, 0);
  ctx.fill();
  ctx.strokeStyle = 'rgba(50,38,26,0.8)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-len * 1.1, 0.6);
  ctx.lineTo(len * 0.9, -1);
  ctx.stroke();
  ctx.restore();
}

function mossCushion(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, t: Tone, r: RNG) {
  ctx.fillStyle = t.dark;
  ctx.beginPath();
  ctx.ellipse(x, y, s, s * 0.45, 0, Math.PI, 0);
  ctx.fill();
  for (let k = 0; k < 8; k++) {
    ctx.fillStyle = k % 2 ? t.mid : t.light;
    ctx.beginPath();
    ctx.ellipse(x + (r() - 0.5) * s * 1.5, y - r() * s * 0.32, 3 + r() * 3, 2.4 + r() * 2, 0, 0, TAU);
    ctx.fill();
  }
  ctx.fillStyle = 'rgba(225,248,255,0.9)';
  for (let k = 0; k < 4; k++) {
    ctx.beginPath();
    ctx.arc(x + (r() - 0.5) * s * 1.3, y - s * 0.12 - r() * s * 0.22, 1.2 + r(), 0, TAU);
    ctx.fill();
  }
}

function crystalShards(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, look: Look, r: RNG) {
  const glow = look.glow ?? '#7ae6ff';
  const cols = [look.flora[0], look.flora[1] ?? '#c9a2ff', '#8fd0ff'];
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createRadialGradient(x, y - s * 0.4, 0, x, y - s * 0.4, s * 1.6);
  g.addColorStop(0, rgba(glow, 0.4));
  g.addColorStop(1, rgba(glow, 0));
  ctx.fillStyle = g;
  ctx.fillRect(x - s * 1.6, y - s * 2, s * 3.2, s * 2.4);
  ctx.restore();
  const n = 3 + ((r() * 3) | 0);
  for (let k = 0; k < n; k++) {
    const t = tone(cols[k % cols.length], '#120626');
    const bx = x + (k - (n - 1) / 2) * s * 0.4;
    const h = s * (0.55 + r() * 0.7) * (k === (n >> 1) ? 1.25 : 1);
    const w = s * 0.2;
    const lean = (k - (n - 1) / 2) * 0.12;
    ctx.save();
    ctx.translate(bx, y);
    ctx.rotate(lean);
    ctx.fillStyle = t.light;
    ctx.beginPath();
    ctx.moveTo(-w, 0);
    ctx.lineTo(-w, -h * 0.78);
    ctx.lineTo(0, -h);
    ctx.lineTo(0, 0);
    ctx.fill();
    ctx.fillStyle = t.dark;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -h);
    ctx.lineTo(w, -h * 0.78);
    ctx.lineTo(w, 0);
    ctx.fill();
    ctx.strokeStyle = rgba('#120626', 0.75);
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-w, 0);
    ctx.lineTo(-w, -h * 0.78);
    ctx.lineTo(0, -h);
    ctx.lineTo(w, -h * 0.78);
    ctx.lineTo(w, 0);
    ctx.stroke();
    ctx.restore();
  }
}

function batFlower(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, look: Look, r: RNG) {
  const glow = look.glow ?? '#7ae6ff';
  const col = look.flora[(r() * look.flora.length) | 0];
  ctx.strokeStyle = '#2a1a50';
  ctx.lineWidth = 2.2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x + s * 0.3, y - s * 0.6, x + s * 0.15, y - s);
  ctx.stroke();
  const bx = x + s * 0.15;
  const by = y - s;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createRadialGradient(bx, by + 6, 0, bx, by + 6, s * 0.9);
  g.addColorStop(0, rgba(glow, 0.5));
  g.addColorStop(1, rgba(glow, 0));
  ctx.fillStyle = g;
  ctx.fillRect(bx - s, by - s * 0.5, s * 2, s * 1.6);
  ctx.restore();
  // a hanging bell, mouth down: the shape that suits a bat's face
  ctx.fillStyle = lighten(col, 0.2);
  ctx.strokeStyle = rgba(darken(col, 0.5), 0.8);
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.moveTo(bx - s * 0.22, by + s * 0.34);
  ctx.quadraticCurveTo(bx - s * 0.2, by, bx, by - 2);
  ctx.quadraticCurveTo(bx + s * 0.2, by, bx + s * 0.22, by + s * 0.34);
  ctx.quadraticCurveTo(bx, by + s * 0.28, bx - s * 0.22, by + s * 0.34);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#fff6d0';
  ctx.beginPath();
  ctx.ellipse(bx, by + s * 0.34, s * 0.08, 2, 0, 0, TAU);
  ctx.fill();
}

/** replace the shared grass/flower/mushroom ground decoration with what belongs in this world; false = use the shared one */
export function paintTopDecor(ctx: CanvasRenderingContext2D, world: number, look: Look, p: Strip, r: RNG): boolean {
  const kit = ENV[world];
  if (!kit) return false;
  const isGround = p.height >= 50;
  const step = isGround ? 50 : 42;
  const leafT = tone(mix(look.leaves[(r() * look.leaves.length) | 0], look.haze, 0.1));
  const mossT = tone(mix(look.leaves[2] ?? look.leaves[0], '#2a7a5a', 0.3));
  for (let x = p.x + 14; x < p.x + p.width - 12; x += step) {
    const px = x + (r() - 0.5) * 18;
    const roll = r();
    if (world === 4) {
      if (roll < 0.3) {
        // a small tree-fern crown, fronds weighed down with spray
        for (let f = 0; f < 5; f++) fernFrond(ctx, px, p.y - 2, 24 + r() * 14, -Math.PI / 2 + (f - 2) * 0.5, leafT, r, 0.9);
      } else if (roll < 0.5) mossCushion(ctx, px, p.y, 12 + r() * 8, mossT, r);
      else if (roll < 0.66) pebbleStack(ctx, px, p.y, 9 + r() * 6, tone(mix(look.ground.stone, '#566a7c', 0.4), '#0a1826'), look.ground.outline);
      else if (roll < 0.78) featherOnGround(ctx, px, p.y, 8 + r() * 4, r);
      else if (roll < 0.9) gunnera(ctx, px, p.y, 34 + r() * 10, leafT, r);
      else {
        // horsetail: jointed, upright, and always found where it is wet
        ctx.strokeStyle = mossT.mid;
        ctx.lineWidth = 2;
        for (let k = 0; k < 4; k++) {
          const hx = px + (k - 1.5) * 4;
          const hh = 12 + r() * 12;
          ctx.beginPath();
          ctx.moveTo(hx, p.y - 1);
          ctx.lineTo(hx, p.y - hh);
          ctx.stroke();
          ctx.strokeStyle = mossT.dark;
          for (let j = 1; j < 4; j++) {
            ctx.beginPath();
            ctx.moveTo(hx - 3, p.y - (hh * j) / 4);
            ctx.lineTo(hx + 3, p.y - (hh * j) / 4);
            ctx.stroke();
          }
          ctx.strokeStyle = mossT.mid;
        }
      }
    } else {
      if (roll < 0.28) crystalShards(ctx, px, p.y, 15 + r() * 10, look, r);
      else if (roll < 0.52) batFlower(ctx, px, p.y, 20 + r() * 10, look, r);
      else if (roll < 0.74) glowFern(ctx, px, p.y, 28 + r() * 12, look, r);
      else if (roll < 0.88) crystalBloom(ctx, px, p.y, 30 + r() * 8, look, r);
      else pebbleStack(ctx, px, p.y, 9 + r() * 6, tone(mix(look.ground.stone, '#4a2a7a', 0.3), '#120626'), look.ground.outline);
    }
  }
  return true;
}
