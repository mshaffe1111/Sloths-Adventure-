/**
 * envKit — what grows at the hero's feet, and what hangs in front of the camera, in each world.
 *
 * Every world is designed from one question: what is this place, and what would grow here because of it?
 *   W4 Mist Cascades: waterfall spray soaks everything, so the plants are the ones that thrive in constant wet:
 *      huge umbrella-leafed gunnera, tree ferns, dripping moss. Fronds droop and shed water.
 *   W8 Twilight Treetops: limestone karst at dusk, home of the bats, so the plants are the ones bats pollinate:
 *      jade vine, Parkia pompoms and pale night-opening moonflowers, with foxfire fungus glowing on the rotting wood.
 * A world with no kit here keeps the shared jungle undergrowth (see scenery.buildNear).
 */
import { tone, mix, rgba, lighten, darken, type RNG, type Tone } from './artKit.ts';
import { fernFrond } from './flora.ts';
import { leaf } from './rainforest.ts';
import { hangingBat } from './territoryTrees.ts';
import type { Look } from './scenery.ts';

const TAU = Math.PI * 2;

export type NearKind = 'gunnera' | 'treefern' | 'dripmoss' | 'jadevine' | 'parkia' | 'moonflower' | 'foxfire';
export type SwayKind = 'drip-fern' | 'jade-vine';

interface Kit {
  /** [plant, weight] at the hero's feet */
  near: Array<[NearKind, number]>;
  /** the big hanging things at the top of the screen */
  sway: SwayKind;
}

export const ENV: Partial<Record<number, Kit>> = {
  4: { near: [['gunnera', 3], ['treefern', 3], ['dripmoss', 2]], sway: 'drip-fern' },
  8: { near: [['jadevine', 3], ['parkia', 2], ['moonflower', 3], ['foxfire', 2]], sway: 'jade-vine' },
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

// ───────────────────────────── W8: plants that bats and moths pollinate ─────────────────────────────

const JADE = '#4fe0c0';

/** a hanging chain of claw-shaped flowers: the real jade vine, which is pollinated by bats */
function raceme(ctx: CanvasRenderingContext2D, x: number, y: number, len: number, r: RNG) {
  ctx.strokeStyle = '#2a5a4a';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x + (r() - 0.5) * 6, y + len * 0.5, x + (r() - 0.5) * 4, y + len);
  ctx.stroke();
  const n = Math.max(4, Math.round(len / 11));
  for (let i = 0; i < n; i++) {
    const u = (i + 0.5) / n;
    const fy = y + u * len;
    const side = i % 2 ? 1 : -1;
    const sz = 7 + (1 - u) * 3;
    const fx = x + side * 3;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(fx, fy, 0, fx, fy, sz * 2);
    g.addColorStop(0, 'rgba(79,224,192,0.35)');
    g.addColorStop(1, 'rgba(79,224,192,0)');
    ctx.fillStyle = g;
    ctx.fillRect(fx - sz * 2, fy - sz * 2, sz * 4, sz * 4);
    ctx.restore();
    // the claw: a curved beak with a smaller keel under it
    ctx.fillStyle = JADE;
    ctx.strokeStyle = '#1c6a5a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(fx, fy - sz * 0.3);
    ctx.quadraticCurveTo(fx + side * sz * 1.3, fy - sz * 0.9, fx + side * sz * 1.5, fy + sz * 0.5);
    ctx.quadraticCurveTo(fx + side * sz * 0.7, fy - sz * 0.1, fx, fy + sz * 0.2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#a8f4dc';
    ctx.beginPath();
    ctx.moveTo(fx, fy + sz * 0.1);
    ctx.quadraticCurveTo(fx + side * sz * 0.6, fy + sz * 0.9, fx + side * sz * 0.2, fy + sz * 1.0);
    ctx.quadraticCurveTo(fx - side * sz * 0.1, fy + sz * 0.5, fx, fy + sz * 0.1);
    ctx.fill();
  }
}

function jadeVine(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, look: Look, r: RNG) {
  const dir = r() > 0.5 ? 1 : -1;
  const pts: Array<[number, number]> = [];
  for (let i = 0; i <= 12; i++) {
    const u = i / 12;
    pts.push([x + dir * Math.sin(u * 2.3) * s * 0.55, y - Math.sin(u * 1.65) * s * 0.9 + u * u * s * 0.2]);
  }
  ctx.strokeStyle = '#2a4a3a';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  pts.forEach(([a, b], i) => (i === 0 ? ctx.moveTo(a, b) : ctx.lineTo(a, b)));
  ctx.stroke();
  const lt = tone(mix(look.leaves[1] ?? '#3f9a78', '#0a2a22', 0.2));
  // leaves come in threes on a jade vine
  for (let i = 1; i < pts.length; i += 2) {
    const [lx, ly] = pts[i];
    for (let k = -1; k <= 1; k++) leaf(ctx, lx, ly, s * 0.2, s * 0.07, -Math.PI / 2 + k * 0.9 + dir * 0.2, lt, 0.1);
  }
  for (let i = 4; i < pts.length - 1; i += 3) raceme(ctx, pts[i][0], pts[i][1] + 2, s * (0.32 + r() * 0.22), r);
}

/** Parkia: pompom flower-heads on long stalks, held out in the open where bats can reach them at night */
function parkia(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, look: Look, r: RNG) {
  const col = look.flora[2] ?? '#ffb25a';
  const lt = tone(mix(look.leaves[0], look.haze, 0.1));
  for (let i = 0; i < 4; i++) fernFrond(ctx, x, y, s * (0.55 + r() * 0.2), -Math.PI / 2 + (i - 1.5) * 0.55, lt, r, 0.55);
  const n = 2 + ((r() * 2) | 0);
  for (let k = 0; k < n; k++) {
    const sx = x + (k - (n - 1) / 2) * s * 0.4;
    const len = s * (0.7 + r() * 0.5);
    const hx = sx + (r() - 0.5) * 10;
    const hy = y - len;
    ctx.strokeStyle = '#3a3a2a';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(sx, y);
    ctx.quadraticCurveTo(sx + (r() - 0.5) * 20, y - len * 0.6, hx, hy);
    ctx.stroke();
    const R = s * 0.15;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(hx, hy + R, 0, hx, hy + R, R * 3);
    g.addColorStop(0, rgba(col, 0.35));
    g.addColorStop(1, rgba(col, 0));
    ctx.fillStyle = g;
    ctx.fillRect(hx - R * 3, hy - R * 2, R * 6, R * 6);
    ctx.restore();
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.ellipse(hx, hy + R, R, R * 1.15, 0, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = rgba(lighten(col, 0.4), 0.8);
    ctx.lineWidth = 1;
    for (let j = 0; j < 22; j++) {
      const a = (j / 22) * TAU;
      ctx.beginPath();
      ctx.moveTo(hx + Math.cos(a) * R * 0.8, hy + R + Math.sin(a) * R * 0.9);
      ctx.lineTo(hx + Math.cos(a) * R * 1.35, hy + R + Math.sin(a) * R * 1.45);
      ctx.stroke();
    }
  }
}

/** moonflower: heart-shaped leaves and a big white flower that opens at dusk for the hawk-moths and bats */
function moonflower(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, look: Look, r: RNG) {
  const lt = tone(mix(look.leaves[1] ?? '#3f9a78', '#0a2a22', 0.15));
  const n = 2 + ((r() * 2) | 0);
  for (let k = 0; k < n; k++) {
    const sx = x + (k - (n - 1) / 2) * s * 0.5;
    const h = s * (0.5 + r() * 0.55);
    ctx.strokeStyle = '#2a4a3a';
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(sx, y + 6);
    ctx.quadraticCurveTo(sx + (r() - 0.5) * 12, y - h * 0.5, sx, y - h);
    ctx.stroke();
    leaf(ctx, sx, y - h * 0.45, s * 0.34, s * 0.16, -0.4 + (r() - 0.5) * 0.3, lt, 0.1);
    leaf(ctx, sx, y - h * 0.3, s * 0.3, s * 0.14, Math.PI + 0.4, lt, -0.1);
    if (k === (n >> 1)) {
      const R = s * 0.3;
      const fy = y - h - R * 0.3;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const g = ctx.createRadialGradient(sx, fy, 0, sx, fy, R * 2.4);
      g.addColorStop(0, 'rgba(244,236,212,0.5)');
      g.addColorStop(1, 'rgba(244,236,212,0)');
      ctx.fillStyle = g;
      ctx.fillRect(sx - R * 2.4, fy - R * 2.4, R * 4.8, R * 4.8);
      ctx.restore();
      // five pleated petals fused into a disc, with the green-yellow throat
      ctx.fillStyle = '#f6f0dc';
      ctx.strokeStyle = 'rgba(120,110,80,0.7)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let j = 0; j < 5; j++) {
        const a0 = (j / 5) * TAU - Math.PI / 2;
        const a1 = ((j + 1) / 5) * TAU - Math.PI / 2;
        ctx.lineTo(sx + Math.cos(a0) * R, fy + Math.sin(a0) * R * 0.92);
        ctx.quadraticCurveTo(sx + Math.cos((a0 + a1) / 2) * R * 0.78, fy + Math.sin((a0 + a1) / 2) * R * 0.72, sx + Math.cos(a1) * R, fy + Math.sin(a1) * R * 0.92);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      for (let j = 0; j < 5; j++) {
        const a = (j / 5) * TAU - Math.PI / 2 + TAU / 10;
        ctx.strokeStyle = 'rgba(160,200,120,0.55)';
        ctx.beginPath();
        ctx.moveTo(sx, fy);
        ctx.lineTo(sx + Math.cos(a) * R * 0.85, fy + Math.sin(a) * R * 0.8);
        ctx.stroke();
      }
      ctx.fillStyle = '#d8e8a0';
      ctx.beginPath();
      ctx.arc(sx, fy, R * 0.22, 0, TAU);
      ctx.fill();
    }
  }
}

/** a rotting log stub with foxfire fungi (Mycena): a faint neon-green glow, brightest in the damp */
function foxfireLog(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, look: Look, r: RNG) {
  const fox = look.glow ?? '#8aff9a';
  const bark = tone('#6a5a46', '#1a1008');
  const w = s * 0.9;
  const h = s * 0.32;
  ctx.fillStyle = bark.mid;
  ctx.strokeStyle = rgba(bark.deep, 0.9);
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.roundRect(x - w / 2, y - h, w, h + 4, h * 0.45);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = rgba(bark.deep, 0.5);
  ctx.lineWidth = 1;
  for (let k = 0; k < 3; k++) {
    ctx.beginPath();
    ctx.moveTo(x - w * 0.4, y - h * (0.25 + k * 0.25));
    ctx.lineTo(x + w * 0.4, y - h * (0.3 + k * 0.25));
    ctx.stroke();
  }
  const n = 5 + ((r() * 4) | 0);
  for (let i = 0; i < n; i++) {
    const mx = x + (r() - 0.5) * w * 0.85;
    const my = y - h + r() * h * 0.5;
    const ms = 4 + r() * 5;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(mx, my - ms, 0, mx, my - ms, ms * 3);
    g.addColorStop(0, rgba(fox, 0.28));
    g.addColorStop(1, rgba(fox, 0));
    ctx.fillStyle = g;
    ctx.fillRect(mx - ms * 3, my - ms * 4, ms * 6, ms * 6);
    ctx.restore();
    ctx.strokeStyle = rgba(fox, 0.95);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(mx, my);
    ctx.lineTo(mx + (r() - 0.5) * 3, my - ms);
    ctx.stroke();
    ctx.fillStyle = lighten(fox, 0.25);
    ctx.beginPath();
    ctx.ellipse(mx, my - ms, ms * 0.75, ms * 0.48, 0, Math.PI, 0);
    ctx.fill();
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
    case 'jadevine': jadeVine(ctx, x, y, size * 1.5, look, r); break;
    case 'parkia': parkia(ctx, x, y, size * 1.6, look, r); break;
    case 'moonflower': moonflower(ctx, x, y, size * 1.5, look, r); break;
    case 'foxfire': foxfireLog(ctx, x, y, size * 1.4, look, r); break;
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
  // jade vine: dark stems hang from the canopy, each carrying a chain of claw-shaped flowers
  const glow = look.glow ?? '#8aff9a';
  const n = 3 + (variant % 2);
  for (let k = 0; k < n; k++) {
    const sx = 180 + (k - (n - 1) / 2) * 70 + (r() - 0.5) * 20;
    const len = 150 + r() * 130;
    const sway = (r() - 0.5) * 40;
    c.strokeStyle = '#1a3a2e';
    c.lineWidth = 3.4;
    c.lineCap = 'round';
    c.beginPath();
    c.moveTo(sx, 4);
    c.bezierCurveTo(sx + sway, len * 0.2, sx - sway, len * 0.45, sx + sway * 0.3, len * 0.55);
    c.stroke();
    const lt = tone(mix(look.leaves[1] ?? '#3f9a78', '#04160f', 0.4));
    for (let m = 1; m <= 2; m++) leaf(c, sx + (m % 2 ? sway * 0.2 : -sway * 0.2), (len * m) / 5, 38 + r() * 18, 11, m % 2 ? 0.4 : Math.PI - 0.4, lt, 0.2);
    raceme(c, sx + sway * 0.3, len * 0.55, len * 0.5, r);
  }
  void glow;
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

function stalagmite(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, look: Look, r: RNG) {
  const t = tone(mix('#efe6cf', look.ground.stone, 0.3), '#2a2018');
  const n = 1 + ((r() * 3) | 0);
  for (let k = 0; k < n; k++) {
    const bx = x + (k - (n - 1) / 2) * s * 0.5;
    const h = s * (0.8 + r() * 0.9);
    const w = s * 0.22;
    ctx.fillStyle = t.light;
    ctx.strokeStyle = look.ground.outline;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(bx - w, y);
    ctx.quadraticCurveTo(bx - w * 0.5, y - h * 0.6, bx, y - h);
    ctx.quadraticCurveTo(bx + w * 0.5, y - h * 0.6, bx + w, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = rgba(t.dark, 0.5);
    ctx.beginPath();
    ctx.moveTo(bx, y - h);
    ctx.quadraticCurveTo(bx + w * 0.5, y - h * 0.6, bx + w, y);
    ctx.lineTo(bx + w * 0.2, y);
    ctx.closePath();
    ctx.fill();
  }
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
      if (roll < 0.3) foxfireLog(ctx, px, p.y, 22 + r() * 10, look, r);
      else if (roll < 0.5) moonflower(ctx, px, p.y, 22 + r() * 8, look, r);
      else if (roll < 0.68) {
        for (let f = 0; f < 5; f++) fernFrond(ctx, px, p.y - 2, 24 + r() * 14, -Math.PI / 2 + (f - 2) * 0.5, leafT, r, 0.5);
      } else if (roll < 0.82) stalagmite(ctx, px, p.y, 14 + r() * 8, look, r);
      else if (roll < 0.92) parkia(ctx, px, p.y, 30 + r() * 8, look, r);
      else pebbleStack(ctx, px, p.y, 9 + r() * 6, tone(mix(look.ground.stone, '#8a8f9a', 0.3), '#1a2030'), look.ground.outline);
    }
  }
  return true;
}
