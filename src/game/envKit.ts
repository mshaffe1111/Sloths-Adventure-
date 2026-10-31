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
import { drawGroundFlora, groundFlora } from './paintedScenery.ts';
import { drawW8Stones } from './w810FaceArt.ts';
import { tone, mix, rgba, lighten, darken, rng, type RNG, type Tone } from './artKit.ts';
import { fernFrond } from './flora.ts';
import { leaf } from './rainforest.ts';
import { hangingBat } from './territoryTrees.ts';
import { EXTRA_PLANTS, SWAYS, plantGlow, plantGradient, type PlantDef, type SwayFn } from './envPlants.ts';
import type { Look } from './scenery.ts';
import { canvasLost } from './canvasLost.ts';

const TAU = Math.PI * 2;

export interface Kit {
  /** [plant, weight] painted into the near layer (visible in gaps and pits); empty = keep the shared jungle undergrowth */
  near: Array<[string, number]>;
  /** [plant, weight] stood along the top of the ground; empty = the shared grass/flowers/mushrooms */
  decor: Array<[string, number]>;
  /** probability that a ground-edge slot is taken by the kit (the rest keep the shared decoration) */
  decorChance?: number;
  /** the hanging cluster in front of the camera; none = shared leaves */
  sway?: string;
  /** what sits low along the bottom edge of the frame */
  front?: 'fern' | 'reed' | 'rock';
}

export const ENV: Partial<Record<number, Kit>> = {};
export const hasKit = (world: number) => (ENV[world]?.near.length ?? 0) > 0;

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
  ctx.fillStyle = plantGradient(ctx, x - rw, topY, x + rw, topY, [[0, t.dark], [0.45, t.mid], [1, t.light]]);
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
    ctx.fillStyle = plantGlow(ctx, fx, fy, sz * 2, 'rgba(79,224,192,0.35)', 'rgba(79,224,192,0)');
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
    ctx.fillStyle = plantGlow(ctx, hx, hy + R, R * 3, rgba(col, 0.35), rgba(col, 0));
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
      ctx.fillStyle = plantGlow(ctx, sx, fy, R * 2.4, 'rgba(244,236,212,0.5)', 'rgba(244,236,212,0)');
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
    ctx.fillStyle = plantGlow(ctx, mx, my - ms, ms * 3, rgba(fox, 0.28), rgba(fox, 0));
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

/** paint one plant of a world's kit into the near layer; false if the world has none (keep the shared undergrowth) */
export function paintNearPlant(ctx: CanvasRenderingContext2D, world: number, look: Look, x: number, y: number, size: number, r: RNG): boolean {
  const kit = ENV[world];
  if (!kit || kit.near.length === 0) return false;
  const def = PLANTS[pickWeighted(r, kit.near)];
  if (!def) return false;
  def.draw(ctx, x, y, size * def.near, look, r);
  return true;
}

/** the hanging cluster in front of the camera (a 360px sprite, hung from its top centre) */
export function paintSwayCluster(c: CanvasRenderingContext2D, world: number, look: Look, variant: number, r: RNG): boolean {
  const kit = ENV[world];
  const fn = kit?.sway ? SWAY_ALL[kit.sway] : undefined;
  if (!fn) return false;
  fn(c, look, variant, r);
  return true;
}

/** the low, dark clump at the very bottom edge of the frame */
export function paintFrontClump(ctx: CanvasRenderingContext2D, world: number, look: Look, x: number, y: number, r: RNG): boolean {
  const kit = ENV[world];
  if (!kit || !kit.front) return false;
  const dark = tone(mix(look.leaves[0], '#04120c', 0.62));
  if (kit.front === 'fern') {
    for (let k = 0; k < 7; k++) {
      const a = -Math.PI / 2 + ((k / 6) - 0.5) * 2.3 + (r() - 0.5) * 0.15;
      fernFrond(ctx, x, y, 150 + r() * 60, a, dark, r, 0.65);
    }
  } else if (kit.front === 'reed') {
    ctx.lineCap = 'round';
    ctx.strokeStyle = dark.mid;
    for (let k = 0; k < 26; k++) {
      const bx = x + (k - 13) * 9 + (r() - 0.5) * 6;
      const h = 90 + r() * 110;
      ctx.lineWidth = 3 + r() * 2;
      ctx.beginPath();
      ctx.moveTo(bx, y + 10);
      ctx.quadraticCurveTo(bx + (r() - 0.5) * 20, y - h * 0.6, bx + (r() - 0.5) * 70, y - h);
      ctx.stroke();
    }
  } else {
    const rock = tone(mix(look.ground.stone, '#04060c', 0.7));
    ctx.fillStyle = rock.mid;
    for (let k = 0; k < 4; k++) {
      const bx = x + (k - 1.5) * 90 + (r() - 0.5) * 30;
      const w = 50 + r() * 50;
      ctx.beginPath();
      ctx.moveTo(bx - w, y + 12);
      ctx.lineTo(bx - w * 0.6, y - 30 - r() * 30);
      ctx.lineTo(bx + w * 0.1, y - 44 - r() * 34);
      ctx.lineTo(bx + w * 0.7, y - 18 - r() * 24);
      ctx.lineTo(bx + w, y + 12);
      ctx.closePath();
      ctx.fill();
    }
  }
  if (look.glow && world === 8) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let k = 0; k < 4; k++) {
      const gx = x + (k - 1.5) * 80;
      const gy = y - 20 - r() * 30;
      ctx.fillStyle = plantGlow(ctx, gx, gy, 12, rgba(look.glow, 0.5), rgba(look.glow, 0));
      ctx.fillRect(gx - 12, gy - 12, 24, 24);
    }
    ctx.restore();
  }
  return true;
}

/** the hanging cluster at the top corners of the frame, reusing the sway sprite at a smaller scale */
export function paintFrontHang(ctx: CanvasRenderingContext2D, world: number, look: Look, x: number, variant: number, r: RNG): boolean {
  if (!ENV[world]?.sway) return false;
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

/** one ground-edge slot: draw this world's plant here and return true, or return false to keep the shared decoration */
export function paintDecorAt(ctx: CanvasRenderingContext2D, world: number, look: Look, px: number, py: number, r: RNG): boolean {
  const kit = ENV[world];
  if (!kit || kit.decor.length === 0) return false;
  if (kit.decorChance !== undefined && r() > kit.decorChance) return false;
  const name = pickWeighted(r, kit.decor);
  // Matt's painted flowers and plants (paintedScenery.ts): one of the world's signature species, standing on the ground
  if (name === 'pflower' || name === 'pplant') {
    const kind = name === 'pflower' ? 'flower' : 'plant';
    const pool = groundFlora(world, kind);
    const num = pool[Math.floor(r() * pool.length) % pool.length];
    const size = kind === 'flower' ? 22 + r() * 8 : 28 + r() * 12;
    return drawGroundFlora(ctx, kind, num, px, py + 2, size, r() < 0.5);
  }
  // World 8's painted mossy stones (w810FaceArt.ts; they replace the code-drawn white stalagmites, which read as thorns on a safe ledge)
  if (name === 'w8stones') return drawW8Stones(ctx, px, py + 2, 56 + r() * 14, r() < 0.5, r());
  const def = PLANTS[name];
  if (!def) return false;
  const size = def.decor[0] + r() * (def.decor[1] - def.decor[0]);
  if (!stampDecor(ctx, world, look, name, def, px, py, size, r)) def.draw(ctx, px, py, size, look, r);
  return true;
}

/**
 * A ground plant drawn from a picture of itself (PERFORMANCE-RULES.md §2.1). A plant here is dozens of path fills (a fern clump is a fan
 * of fronds, each a fill and a stroke), and the screen holds dozens of plants: 345 to 1050 path fills and strokes a frame on 3-3, 6-3 and
 * 7-3 (perf-sprites, 2026-10-30). Each one is the same every frame (its dice are put back to where it began: terrain.ts topDecor), so it
 * is painted once into a small canvas at the screen's scale and from then on stamped, the wind's lean applied around the stamp as before;
 * its dice are then moved on to where drawing it leaves them, so everything after it is drawn as before. The painting is never done on a
 * frame: a plant met for the first time is drawn as paths and put in a queue, which is painted in the browser's idle time between frames
 * and while the stage gets ready (settleDecorBakes). A plant that blends ('lighter' glows) or reaches past its canvas stays paths.
 */
interface DecorPic {
  cv: HTMLCanvasElement | null;
  /** where the picture's top left sits from the plant's foot, in device pixels */
  ox: number;
  oy: number;
  /** device pixels per world unit it was painted at */
  k: number;
  /** the dice once the plant is drawn */
  end: number;
}
interface DecorJob {
  key: string;
  def: PlantDef;
  look: Look;
  px: number;
  py: number;
  size: number;
  k: number;
  s0: number;
}
const decorPics = new Map<string, DecorPic>();
const decorQueue = new Map<string, DecorJob>();
/** the plant pictures kept for a stage, at most (the oldest let go first; each 10 to 60 KB): they are let go when the next stage gets ready */
const DECOR_BYTES_MAX = 4 * 1024 * 1024;
let decorBytes = 0;
/** a plant is only painted in idle time that has this long left (ms): painting one takes about that on a slow phone */
const IDLE_BAKE_MS = 8;
/**
 * The last frame's gap (ms), from when the first plant of each frame is drawn, and its recent average: the half-second fallback only paints
 * after a frame no worse than 1.5 times the average (not on a stall). A phone always slower than 30 fps still gets its pictures, one paint
 * of a few ms every half second, each one taking about as much off every frame after it.
 */
let frameAt = 0;
let frameGap = 0;
let frameAvg = 0;
const lookIds = new WeakMap<object, number>();
let lookCount = 0;
let bakeCanvas: HTMLCanvasElement | null = null;
let idleAsked = false;

function stampDecor(ctx: CanvasRenderingContext2D, world: number, look: Look, name: string, def: PlantDef, px: number, py: number, size: number, r: RNG): boolean {
  if (typeof document === 'undefined' || !r.state || !r.seek || typeof ctx.getTransform !== 'function') return false;
  const m = ctx.getTransform();
  const k = Math.hypot(m.a, m.b);
  if (!(k > 0)) return false;
  let lid = lookIds.get(look);
  if (lid === undefined) lookIds.set(look, (lid = ++lookCount));
  const now = performance.now();
  if (now - frameAt > 8) {
    if (frameAt) {
      frameGap = now - frameAt;
      // (a gap over a second is a pause, a menu or a hidden tab: not a frame)
      if (frameGap < 1000) frameAvg = frameAvg ? frameAvg * 0.9 + frameGap * 0.1 : frameGap;
    }
    frameAt = now;
  }
  // (painted at the screen's scale rounded up to a step of 1/16 of a doubling, about 4%: the camera eases its zoom at a stage's start,
  // and one picture per step, stamped up to 4% smaller, stands for every scale in the step)
  const step = Math.ceil(Math.log2(k) * 16);
  const kb = 2 ** (step / 16);
  const s0 = r.state();
  const key = world + '|' + lid + '|' + name + '|' + s0 + '|' + size + '|' + step;
  let pic = decorPics.get(key);
  if (pic?.cv && canvasLost(pic.cv, 'decor plant')) {
    // (its picture was taken back by the phone: drawn as paths again, and painted again in idle time)
    dropPic(key, pic);
    pic = undefined;
  }
  if (!pic) {
    if (!decorQueue.has(key)) {
      decorQueue.set(key, { key, def, look, px, py, size, k: kb, s0 });
      askIdle();
    }
    return false;
  }
  if (!pic.cv) return false;
  r.seek(pic.end);
  const w = pic.cv.width / pic.k;
  const h = pic.cv.height / pic.k;
  let x = px + pic.ox / pic.k;
  let y = py + pic.oy / pic.k;
  if (m.b === 0 && m.c === 0) {
    // (its corner on a whole device pixel, as the paths were drawn into it, so the picture is as sharp as the paths)
    x = (Math.round(m.a * x + m.e) - m.e) / m.a;
    y = (Math.round(m.d * y + m.f) - m.f) / m.d;
  }
  ctx.drawImage(pic.cv, x, y, w, h);
  return true;
}

/** paint queued plants until `more()` says stop */
function runDecorQueue(more: () => boolean) {
  for (const job of decorQueue.values()) {
    if (!more()) return;
    decorQueue.delete(job.key);
    const dice = rng(0);
    dice.seek!(job.s0);
    const pic = bakeDecor(job.def, job.look, job.px, job.py, job.size, dice, job.k, job.s0);
    const bytes = pic.cv ? pic.cv.width * pic.cv.height * 4 : 0;
    while (decorBytes + bytes > DECOR_BYTES_MAX && decorPics.size) {
      const first = decorPics.keys().next().value as string;
      dropPic(first, decorPics.get(first)!);
    }
    decorPics.set(job.key, pic);
    decorBytes += bytes;
  }
}

function dropPic(key: string, pic: DecorPic) {
  if (pic.cv) {
    decorBytes -= pic.cv.width * pic.cv.height * 4;
    pic.cv.width = pic.cv.height = 0;
  }
  decorPics.delete(key);
}

/** let every plant picture go, and the queue (a new stage getting ready: stageReady.ts) */
export function releaseDecorPics() {
  for (const [key, pic] of decorPics) dropPic(key, pic);
  decorPics.clear();
  decorQueue.clear();
  decorBytes = 0;
}

/**
 * The queue painted in the browser's idle time after a frame, only where that idle time covers a painting. A phone too busy to have any
 * paints one plant (a few ms) between frames every half second instead, and only after a frame no slower than usual (not a stall).
 */
function askIdle() {
  if (idleAsked) return;
  idleAsked = true;
  type Idle = { timeRemaining(): number; didTimeout?: boolean };
  const w = typeof window !== 'undefined' ? (window as Window & { requestIdleCallback?: (cb: (d: Idle) => void, o?: { timeout: number }) => number }) : null;
  const go = (d: Idle) => {
    idleAsked = false;
    // (idle time that covers a painting; on a phone with none, one plant at most, and only after a frame no slower than usual)
    let one = !!d.didTimeout && frameGap > 0 && frameAvg > 0 && frameGap <= frameAvg * 1.5;
    runDecorQueue(() => {
      if (one) {
        one = false;
        return true;
      }
      return !d.didTimeout && d.timeRemaining() >= IDLE_BAKE_MS;
    });
    if (decorQueue.size) askIdle();
  };
  if (w?.requestIdleCallback) w.requestIdleCallback(go, { timeout: 500 });
  else setTimeout(() => go({ timeRemaining: () => 0, didTimeout: true }), 100);
}

/**
 * Paint every plant waiting in the queue now: for a stage getting ready under its title card (stageReady.ts, after its frames), so the
 * plants its first frames met are pictures from its first frame of play.
 */
export function settleDecorBakes() {
  if (typeof document === 'undefined') return;
  runDecorQueue(() => true);
}

function bakeDecor(def: PlantDef, look: Look, px: number, py: number, size: number, r: RNG, k: number, s0: number): DecorPic {
  const none: DecorPic = { cv: null, ox: 0, oy: 0, k, end: s0 };
  // a scratch canvas big enough for any plant (a plant of `size` reaches about 2 sizes up and 1.5 across; one reaching the edge is not baked)
  const W = Math.ceil(size * 5 * k) + 8;
  const H = Math.ceil(size * 5 * k) + 8;
  if (!bakeCanvas) bakeCanvas = document.createElement('canvas');
  const c = bakeCanvas;
  if (c.width < W || c.height < H) {
    c.width = Math.max(c.width, W);
    c.height = Math.max(c.height, H);
  }
  const g = c.getContext('2d', { willReadFrequently: true });
  if (!g) return none;
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalCompositeOperation = 'source-over';
  g.globalAlpha = 1;
  g.clearRect(0, 0, W, H);
  const fx = Math.round(W / 2);
  const fy = Math.round(H * 0.72);
  g.setTransform(k, 0, 0, k, fx - px * k, fy - py * k);
  // (a plant that blends with what is under it cannot be a picture: watch for any mode but source-over while it is painted)
  let blends = false;
  const proto = Object.getPrototypeOf(g) as CanvasRenderingContext2D;
  const d = Object.getOwnPropertyDescriptor(proto, 'globalCompositeOperation');
  if (d?.set && d.get) {
    Object.defineProperty(g, 'globalCompositeOperation', {
      configurable: true,
      get: () => d.get!.call(g),
      set: (v: GlobalCompositeOperation) => {
        if (v !== 'source-over') blends = true;
        d.set!.call(g, v);
      },
    });
  }
  try {
    def.draw(g, px, py, size, look, r);
  } finally {
    delete (g as unknown as Record<string, unknown>).globalCompositeOperation;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalCompositeOperation = 'source-over';
    g.globalAlpha = 1;
  }
  const end = r.state!();
  if (blends) return none;
  // the painted part's box (from the alpha: each pixel read as one 32-bit word, its top byte the alpha on a little-endian phone, any
  // byte order caught by testing the whole word for zero)
  const px32 = new Uint32Array(g.getImageData(0, 0, W, H).data.buffer);
  let x0 = W, y0 = H, x1 = -1, y1 = -1;
  for (let y = 0; y < H; y++) {
    const row = y * W;
    let first = -1;
    let last = -1;
    for (let x = 0; x < W; x++) if (px32[row + x] !== 0) { first = x; break; }
    if (first < 0) continue;
    for (let x = W - 1; x >= first; x--) if (px32[row + x] !== 0) { last = x; break; }
    if (first < x0) x0 = first;
    if (last > x1) x1 = last;
    if (y < y0) y0 = y;
    y1 = y;
  }
  if (x1 < 0) return { ...none, end };
  if (x0 === 0 || y0 === 0 || x1 === W - 1 || y1 === H - 1) return none;
  // copied into a canvas of its own, without the read-back hint (PERFORMANCE-RULES.md §2.9)
  const cv = document.createElement('canvas');
  cv.width = x1 - x0 + 1;
  cv.height = y1 - y0 + 1;
  const cg = cv.getContext('2d');
  if (!cg) return none;
  cg.drawImage(c, x0, y0, cv.width, cv.height, 0, 0, cv.width, cv.height);
  return { cv, ox: x0 - fx, oy: y0 - fy, k, end };
}

// ───────────────────────────── the registry ─────────────────────────────

const tn = (look: Look, r: RNG, i?: number) => tone(mix(look.leaves[i ?? ((r() * look.leaves.length) | 0)], look.haze, 0.1));

const swayDripFern: SwayFn = (c, look, variant, r) => {
  const dark = tone(darken(look.leaves[0], 0.3), '#04201a');
  const n = 4 + (variant % 2);
  for (let k = 0; k < n; k++) {
    const a = Math.PI / 2 + (k - (n - 1) / 2) * 0.5 + (r() - 0.5) * 0.15;
    fernFrond(c, 180, 8, 190 + r() * 60, a, dark, r, 1.1);
  }
  c.fillStyle = 'rgba(215,245,255,0.8)';
  for (let k = 0; k < 6; k++) {
    c.beginPath();
    c.ellipse(80 + r() * 200, 150 + r() * 160, 2, 3.2, 0, 0, TAU);
    c.fill();
  }
};

const swayJadeVine: SwayFn = (c, look, variant, r) => {
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
  // the Monarch's subjects asleep on the vines
  const batN = 1 + (variant % 2);
  for (let k = 0; k < batN; k++) {
    const bx = 70 + r() * 220;
    c.strokeStyle = '#1a3a2e';
    c.lineWidth = 2.4;
    c.beginPath();
    c.moveTo(bx - 26, 3);
    c.quadraticCurveTo(bx, 14 + r() * 10, bx + 26, 3);
    c.stroke();
    hangingBat(c, bx, 10, 15 + r() * 6, '#2a1c18', undefined, '#c98a3a');
  }
};

const SWAY_ALL: Record<string, SwayFn> = { ...SWAYS, dripfern: swayDripFern, jadevine: swayJadeVine };

const PLANTS: Record<string, PlantDef> = {
  ...EXTRA_PLANTS,
  // W4 cloud forest
  gunnera: { draw: (c, x, y, s, l, r) => gunnera(c, x, y, s, tn(l, r), r), near: 1.5, decor: [34, 44] },
  treefern: { draw: (c, x, y, s, l, r) => treeFernNear(c, x, y, s, tn(l, r), r), near: 1.7, decor: [26, 34] },
  dripmoss: { draw: (c, x, y, s, l, r) => dripMoss(c, x, y, s, tone(mix(l.leaves[2] ?? '#7fe0b0', '#2a7a5a', 0.3)), r), near: 1.4, decor: [14, 22] },
  ferncrown: {
    draw: (c, x, y, s, l, r) => {
      const t = tn(l, r);
      for (let f = 0; f < 5; f++) fernFrond(c, x, y - 2, s * (0.7 + r() * 0.4), -Math.PI / 2 + (f - 2) * 0.5, t, r, 0.9);
    },
    near: 1, decor: [30, 40],
  },
  mosscushion: { draw: (c, x, y, s, l, r) => mossCushion(c, x, y, s, tone(mix(l.leaves[2] ?? l.leaves[0], '#2a7a5a', 0.3)), r), near: 1, decor: [12, 20] },
  pebbles: { draw: (c, x, y, s, l) => pebbleStack(c, x, y, s, tone(mix(l.ground.stone, '#566a7c', 0.4), '#0a1826'), l.ground.outline), near: 1, decor: [9, 15] },
  feather: { draw: (c, x, y, s, _l, r) => featherOnGround(c, x, y, s, r), near: 1, decor: [8, 12] },
  horsetail: {
    draw: (c, x, y, _s, l, r) => {
      const t = tone(mix(l.leaves[2] ?? l.leaves[0], '#2a7a5a', 0.3));
      c.lineWidth = 2;
      for (let k = 0; k < 4; k++) {
        const hx = x + (k - 1.5) * 4;
        const hh = 12 + r() * 12;
        c.strokeStyle = t.mid;
        c.beginPath();
        c.moveTo(hx, y - 1);
        c.lineTo(hx, y - hh);
        c.stroke();
        c.strokeStyle = t.dark;
        for (let j = 1; j < 4; j++) {
          c.beginPath();
          c.moveTo(hx - 3, y - (hh * j) / 4);
          c.lineTo(hx + 3, y - (hh * j) / 4);
          c.stroke();
        }
      }
    },
    near: 1, decor: [10, 14],
  },
  // W8 limestone karst at night
  jadevine: { draw: jadeVine, near: 1.5, decor: [26, 34] },
  parkia: { draw: parkia, near: 1.6, decor: [30, 38] },
  moonflower: { draw: moonflower, near: 1.5, decor: [22, 30] },
  foxfire: { draw: foxfireLog, near: 1.4, decor: [22, 32] },
  karstpebbles: { draw: (c, x, y, s, l) => pebbleStack(c, x, y, s, tone(mix(l.ground.stone, '#8a8f9a', 0.3), '#1a2030'), l.ground.outline), near: 1, decor: [9, 15] },
};

ENV[1] = { near: [], decor: [['snakeskin', 1.5], ['hollowlog', 1.5], ['pflower', 3], ['pplant', 3]], decorChance: 0.35 };
ENV[2] = {
  near: [['reedclump', 3], ['nipa', 2], ['hyacinth', 2], ['proproot', 3]],
  decor: [['reedclump', 4], ['nipa', 2], ['pflower', 2.5], ['pplant', 2], ['proproot', 2], ['driftwood', 1.5], ['crocnest', 1]],
  sway: 'droop', front: 'reed',
};
ENV[3] = {
  near: [['birdnest', 3], ['bracket', 2], ['clawrock', 2], ['kneeroot', 2]],
  decor: [['birdnest', 3], ['bracket', 2], ['clawrock', 2], ['bones', 1.2], ['kneeroot', 2], ['fernclump', 2], ['pplant', 2], ['pflower', 1.2]],
  sway: 'glowworm', front: 'fern',
};
ENV[4] = {
  near: [['gunnera', 3], ['treefern', 3], ['dripmoss', 2]],
  decor: [['ferncrown', 26], ['mosscushion', 18], ['pebbles', 14], ['feather', 10], ['gunnera', 10], ['horsetail', 8], ['pplant', 16], ['pflower', 12]],
  sway: 'dripfern', front: 'fern',
};
ENV[5] = {
  near: [['heliconia', 3], ['orchidclump', 3], ['bromrosette', 2], ['orbweb', 2]],
  // (no orange heliconia on the ground any more: it shouted over the dim violet backdrop)
  decor: [['pflower', 3.5], ['pplant', 2], ['bromrosette', 1.5], ['orbweb', 2.5], ['cocoon', 1.2]],
  sway: 'silk', front: 'fern',
};
ENV[6] = {
  near: [['pitcher', 2], ['pegs', 3], ['bogfern', 2], ['kneeroot', 2]],
  decor: [['pegs', 3], ['pflower', 2], ['pplant', 2], ['bogfern', 2], ['kneeroot', 2], ['mudbubble', 2]],
  sway: 'bogmoss', front: 'reed',
};
// (no figroot: its pale code-drawn roots on every ledge read as ribs, QA 2026-10-29; Matt's painted fig roots, w7c, are to be wired in)
ENV[7] = {
  near: [['idolhead', 1], ['blockpile', 3], ['fernclump', 3]],
  decor: [['blockpile', 3], ['idolhead', 1.2], ['fernclump', 3], ['pplant', 2], ['pflower', 1.5]],
  sway: 'aerial', front: 'rock',
};
ENV[8] = {
  near: [['jadevine', 3], ['parkia', 2], ['moonflower', 3], ['foxfire', 2]],
  // (no grey karst pebbles: grey spikes in the treetops read as a hazard where there is none, polish bar item 3; the painted stones stay)
  decor: [['foxfire', 26], ['pflower', 20], ['ferncrown', 14], ['pplant', 14], ['w8stones', 20], ['parkia', 6], ['mosscushion', 8]],
  sway: 'jadevine', front: 'fern',
};
ENV[9] = {
  near: [['ohia', 2], ['steamvent', 2], ['lavafern', 2], ['obsidian', 2]],
  decor: [['ohia', 2], ['steamvent', 2], ['lavafern', 2.5], ['lichenrock', 2], ['obsidian', 2], ['pplant', 1.5], ['pflower', 1.2]],
  sway: 'charvine', front: 'rock',
};
// the mountain above the treeline: rock, wind-bent grass and rain (the war camp went with the old backdrop; no iron thorns on safe ground,
// where thorns hurt: WIP-16)
ENV[10] = {
  near: [['slaterock', 3], ['wiregrass', 3]],
  decor: [['slaterock', 3], ['wiregrass', 3], ['puddle', 1.5], ['pebbles', 1], ['pflower', 0.6]],
  sway: 'chains', front: 'rock',
};
