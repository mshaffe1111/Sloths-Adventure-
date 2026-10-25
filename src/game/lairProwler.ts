/**
 * The Shadow Prowler's lair: the Glowcap Sinkhole. A cave under the rainforest, lit by giant glowing mushrooms in pink, cyan, amber and
 * violet, with two cracks in the ceiling that let shafts of moonlight down onto the floor. Where a shaft lands there is a moon pool of
 * pale light, and the jaguar cannot step out of the shadows inside it (the fight uses prowlerPools.ts, so the paint and the rule share
 * their numbers). In the last phase the mushrooms go dark and only the moon pools still shine.
 *
 * Same layers as the other lairs (lairArt.ts): back (screen space, opaque), world (the moon pools and mushrooms on the floor) and front
 * (screen space: vignette, roots, the darkness of the last phase). The floor, ledges, wall pillars and ropes are in lairProwlerObjects.ts.
 *
 * The mushroom glows are pre-drawn soft discs stamped with drawImage, never shadowBlur, so the lair costs next to nothing on a phone.
 */
import type { LairArena, LairView } from './lairArt.ts';
import { POOL_HALF, PROWLER_POOLS } from './prowlerPools.ts';
import { trackAtlas } from './atlasLoader.ts';

/**
 * Matt's painted Glowcap Sinkhole (Gemini, 2026-10-24) behind the fight, in place of the code-drawn cave once it has loaded. It is
 * pinned to the arena, not the screen, so its two painted moon pools sit under the game's own (PROWLER_POOLS): in the painting they
 * are 30.5% and 71.8% of the way across, and their middle is 85.3% of the way down.
 */
const LAIR_URL = new URL('../assets/lairs/prowler-lair.webp', import.meta.url).href;
const PAINT_POOLS = [0.305, 0.718];
const PAINT_POOL_Y = 0.853;
let lairImg: HTMLImageElement | null = null;
let lairReady = false;
function lairPicture(): HTMLImageElement | null {
  if (typeof Image === 'undefined') return null;
  if (!lairImg) {
    lairImg = new Image();
    trackAtlas(lairImg, LAIR_URL, () => { lairReady = true; }, () => { lairImg = null; });
  }
  return lairReady ? lairImg : null;
}

/** the painting in screen space, scaled and placed so its pools land on the game's pools */
function paintLair(ctx: CanvasRenderingContext2D, pic: HTMLImageElement, v: LairView, a: LairArena) {
  ctx.fillStyle = '#0c0f10';
  ctx.fillRect(0, 0, v.vw, v.vh);
  const iw = pic.naturalWidth;
  const ih = pic.naturalHeight;
  const dw = (PROWLER_POOLS[1] - PROWLER_POOLS[0]) / (PAINT_POOLS[1] - PAINT_POOLS[0]);
  const dh = (dw * ih) / iw;
  const left = a.left + PROWLER_POOLS[0] - PAINT_POOLS[0] * dw - v.x;
  const top = a.floor - 10 - PAINT_POOL_Y * dh - v.y;
  ctx.drawImage(pic, left, top, dw, dh);
  // past the painting's edges the cave goes on as its own mirror image, a little darker, so a wide screen never sees a hard end
  for (const side of [-1, 1]) {
    const edge = side < 0 ? left : left + dw;
    if (side < 0 ? edge <= 0 : edge >= v.vw) continue;
    ctx.save();
    ctx.translate(edge, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(pic, side < 0 ? 0 : -dw, top, dw, dh);
    ctx.restore();
    ctx.fillStyle = 'rgba(6, 10, 12, 0.35)';
    if (side < 0) ctx.fillRect(0, 0, edge, v.vh);
    else ctx.fillRect(edge, 0, v.vw - edge, v.vh);
  }
  // the painted mushrooms dim with the rest when the lights go out
  if (glow < 0.98) {
    ctx.fillStyle = `rgba(0, 4, 8, ${0.55 * (1 - glow)})`;
    ctx.fillRect(0, 0, v.vw, v.vh);
  }
}

function rand(i: number): number {
  const s = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}

/** the glowcap colours of the third world */
export const CAP_COLORS = ['#ff5ad0', '#5ae6ff', '#ffb02e', '#b06aff'] as const;

// ───────────────────────────── the light level ─────────────────────────────

/** 1 = every mushroom shining, ~0.16 = lights out. Eased toward the target each frame; snaps on a new fight or a retry. */
let glow = 1;
let lastT = -1;
/** where the back layer last drew the arena, so the front layer can put the moon pools back on top of the dark */
let lastLeft = 0;
let lastFloor = 0;
const DARK = 0.16;

function easeGlow(time: number, phase: number) {
  const target = phase >= 3 ? DARK : 1;
  const dt = time - lastT;
  if (lastT < 0 || dt < 0 || dt > 1) glow = target;
  else glow += (target - glow) * Math.min(1, dt * 1.6);
  lastT = time;
}

/** how bright the mushrooms are right now (the objects file reads it so ledge caps dim with the rest) */
export function prowlerGlow(): number {
  return glow;
}

// ───────────────────────────── soft glows ─────────────────────────────

const sprites = new Map<string, HTMLCanvasElement>();

function glowSprite(color: string): HTMLCanvasElement | null {
  if (typeof document === 'undefined') return null;
  let c = sprites.get(color);
  if (!c) {
    c = document.createElement('canvas');
    c.width = c.height = 64;
    const g = c.getContext('2d');
    if (!g) return null;
    const rg = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    rg.addColorStop(0, color);
    rg.addColorStop(0.35, color + '88');
    rg.addColorStop(1, color + '00');
    g.fillStyle = rg;
    g.fillRect(0, 0, 64, 64);
    sprites.set(color, c);
  }
  return c;
}

/** a soft round glow of `color` (#rrggbb) centred on x, y */
export function stampGlow(ctx: CanvasRenderingContext2D, color: string, x: number, y: number, r: number, alpha: number) {
  if (alpha <= 0.01) return;
  const s = glowSprite(color);
  if (!s) return;
  const old = ctx.globalAlpha;
  ctx.globalAlpha = old * Math.min(1, alpha);
  ctx.drawImage(s, x - r, y - r, r * 2, r * 2);
  ctx.globalAlpha = old;
}

/** one glowing mushroom standing on (x, y): a pale stalk, a domed cap with spots, and its halo. `lit` scales the whole glow. */
export function glowcap(ctx: CanvasRenderingContext2D, x: number, y: number, h: number, ci: number, lit: number, time: number, seed: number) {
  const col = CAP_COLORS[((ci % 4) + 4) % 4];
  const capW = h * 0.62;
  const capH = h * 0.42;
  const sway = Math.sin(time * 0.9 + seed) * h * 0.03;
  const topY = y - h;
  // halo first, so the mushroom sits in its own light
  stampGlow(ctx, col, x + sway, topY + capH * 0.2, h * 1.5, 0.5 * lit * (0.85 + 0.15 * Math.sin(time * 1.7 + seed * 2)));
  // stalk
  ctx.fillStyle = lit > 0.5 ? '#c9d6d0' : '#4b5b58';
  ctx.beginPath();
  ctx.moveTo(x - h * 0.07, y);
  ctx.quadraticCurveTo(x - h * 0.05 + sway * 0.5, y - h * 0.5, x + sway - h * 0.05, topY + capH * 0.5);
  ctx.lineTo(x + sway + h * 0.05, topY + capH * 0.5);
  ctx.quadraticCurveTo(x + h * 0.05 + sway * 0.5, y - h * 0.5, x + h * 0.07, y);
  ctx.closePath();
  ctx.fill();
  // cap: a dark dome with the colour glowing through it
  ctx.fillStyle = '#0a1e22';
  ctx.beginPath();
  ctx.ellipse(x + sway, topY + capH * 0.5, capW, capH, 0, Math.PI, 0);
  ctx.quadraticCurveTo(x + sway, topY + capH * 0.85, x + sway - capW, topY + capH * 0.5);
  ctx.fill();
  const a0 = ctx.globalAlpha;
  ctx.globalAlpha = a0 * (0.28 + 0.72 * lit);
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.ellipse(x + sway, topY + capH * 0.5, capW * 0.94, capH * 0.92, 0, Math.PI, 0);
  ctx.quadraticCurveTo(x + sway, topY + capH * 0.8, x + sway - capW * 0.94, topY + capH * 0.5);
  ctx.fill();
  // lit crown and spots
  ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
  ctx.beginPath();
  ctx.ellipse(x + sway - capW * 0.25, topY + capH * 0.2, capW * 0.32, capH * 0.2, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(x + sway + (i - 1) * capW * 0.5, topY + capH * (0.55 + (i % 2) * 0.12), Math.max(1.2, h * 0.035), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = a0;
}

// ───────────────────────────── 1. the back ─────────────────────────────

/** the whole backdrop: cave dark, far rock ridges, stalactites, the two moonlit shafts, far mushroom colonies, spores */
export function drawProwlerBack(ctx: CanvasRenderingContext2D, v: LairView, a: LairArena, time: number, bossX: number, phase = 1) {
  easeGlow(time, phase);
  lastLeft = a.left;
  lastFloor = a.floor;
  ctx.save();
  const W = v.vw;
  const H = v.vh;
  const floorY = a.floor - v.y;

  const pic = lairPicture();
  if (pic) {
    paintLair(ctx, pic, v, a);
    backLife(ctx, v, a, time, bossX, floorY);
    ctx.restore();
    return;
  }

  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#02080d');
  bg.addColorStop(0.5, '#05202a');
  bg.addColorStop(1, '#0b3a3c');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // far rock ridges, two layers sliding at different speeds
  const ridge = (par: number, col: string, hMin: number, hMax: number, step: number, seed: number, base: number) => {
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.moveTo(-20, H + 10);
    const off = v.x * par;
    for (let x = -20; x <= W + 40; x += step) {
      const wx = Math.floor((x + off) / step);
      const th = hMin + rand(wx + seed) * (hMax - hMin);
      ctx.lineTo(x, base - th);
      ctx.lineTo(x + step * 0.5, base - th * (0.55 + 0.3 * rand(wx + seed + 5)));
    }
    ctx.lineTo(W + 40, H + 10);
    ctx.closePath();
    ctx.fill();
  };
  ridge(0.1, '#062a31', 60, 190, 90, 3, floorY - 20);
  ridge(0.2, '#041b21', 40, 140, 70, 11, floorY);

  // far mushroom colonies on the ridges: dim, small, and they breathe
  for (let i = 0; i < 14; i++) {
    const span = W + 500;
    const cx = ((((i + 0.3 + rand(i + 40) * 0.4) / 14) * span - v.x * 0.3) % span + span) % span - 250;
    const cy = floorY - 26 - rand(i + 41) * 120;
    for (let m = 0; m < 3; m++) {
      glowcap(ctx, cx + m * 17 - 14, cy + (m % 2) * 6, 18 + rand(i * 3 + m) * 20, i + m, 0.65 * glow, time, i * 5 + m);
    }
  }

  // the two shafts of moonlight, one over each moon pool
  const moon = 0.9 + 0.1 * Math.sin(time * 0.6);
  for (let k = 0; k < PROWLER_POOLS.length; k++) {
    const sx = a.left + PROWLER_POOLS[k] - v.x;
    if (sx < -420 || sx > W + 420) continue;
    for (let layer = 0; layer < 2; layer++) {
      const wTop = layer ? 26 : 52;
      const wBot = POOL_HALF * (layer ? 0.55 : 0.95);
      const bm = ctx.createLinearGradient(0, 0, 0, floorY);
      bm.addColorStop(0, `rgba(200, 238, 255, ${0.06 * moon})`);
      bm.addColorStop(0.55, `rgba(190, 236, 255, ${(layer ? 0.17 : 0.1) * moon})`);
      bm.addColorStop(1, `rgba(210, 244, 255, ${(layer ? 0.3 : 0.17) * moon})`);
      ctx.fillStyle = bm;
      ctx.beginPath();
      ctx.moveTo(sx - wTop, -20);
      ctx.lineTo(sx + wTop, -20);
      ctx.lineTo(sx + wBot, floorY);
      ctx.lineTo(sx - wBot, floorY);
      ctx.closePath();
      ctx.fill();
    }
    // dust turning slowly in the light
    ctx.fillStyle = '#e8f8ff';
    for (let i = 0; i < 14; i++) {
      const ph = (time * (0.03 + rand(i + k * 20) * 0.03) + rand(i + 5 + k * 20)) % 1;
      const y = ph * floorY;
      const half = 26 + (POOL_HALF * 0.9 - 26) * (y / Math.max(1, floorY));
      const x = sx + (rand(i + 9 + k * 20) - 0.5) * 2 * half * 0.8 + Math.sin(time * 0.7 + i) * 6;
      ctx.globalAlpha = Math.sin(ph * Math.PI) * 0.55;
      ctx.fillRect(x, y, 1.8, 1.8);
    }
    ctx.globalAlpha = 1;
  }

  // stalactites from the ceiling, dark, with a cold rim on the lit side
  for (let i = 0; i < 16; i++) {
    const span = W + 400;
    const sx = ((((i + 0.2 + rand(i + 60) * 0.6) / 16) * span - v.x * 0.5) % span + span) % span - 200;
    const len = 40 + rand(i + 61) * 130;
    const w = 14 + rand(i + 62) * 20;
    ctx.fillStyle = '#031017';
    ctx.beginPath();
    ctx.moveTo(sx - w, -6);
    ctx.lineTo(sx + w, -6);
    ctx.quadraticCurveTo(sx + w * 0.3, len * 0.6, sx + 2, len);
    ctx.quadraticCurveTo(sx - w * 0.3, len * 0.6, sx - w, -6);
    ctx.fill();
    ctx.strokeStyle = 'rgba(170, 225, 240, 0.12)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(sx + w * 0.8, 0);
    ctx.quadraticCurveTo(sx + w * 0.25, len * 0.6, sx + 2, len);
    ctx.stroke();
  }

  // a green-teal haze lying in the bottom of the cave, and a faint light behind the boss to set a dark jaguar against it
  const hz = ctx.createLinearGradient(0, floorY - 150, 0, floorY + 20);
  hz.addColorStop(0, 'rgba(60, 220, 190, 0)');
  hz.addColorStop(1, `rgba(60, 220, 190, ${0.16 * glow + 0.03})`);
  ctx.fillStyle = hz;
  ctx.fillRect(0, floorY - 150, W, 170);
  ctx.globalAlpha = 0.16;
  stampGlow(ctx, '#5ae6ff', bossX - v.x, floorY - 90, 340, 1);
  ctx.globalAlpha = 1;

  // spores: tiny coloured motes drifting up through the whole view
  for (let i = 0; i < 30; i++) {
    const ph = (time * (0.02 + rand(i) * 0.035) + rand(i + 50)) % 1;
    const ex = (rand(i + 9) * W * 1.1 + Math.sin(time * 0.5 + i) * 30 + W) % W;
    const ey = H * (0.96 - ph * 0.9) + Math.sin(time * 0.8 + i * 2) * 10;
    const col = CAP_COLORS[i % 4];
    const r = 1.4 + rand(i + 3) * 2;
    ctx.globalAlpha = Math.sin(ph * Math.PI) * (0.25 + 0.6 * glow);
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.arc(ex, ey, r, 0, Math.PI * 2);
    ctx.fill();
    stampGlow(ctx, col, ex, ey, r * 4, 0.5);
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}

/** what moves over the painting: dust turning in the two shafts, a faint light behind the boss, spores drifting up */
function backLife(ctx: CanvasRenderingContext2D, v: LairView, a: LairArena, time: number, bossX: number, floorY: number) {
  const W = v.vw;
  const H = v.vh;
  const moon = 0.9 + 0.1 * Math.sin(time * 0.6);
  ctx.fillStyle = '#e8f8ff';
  for (let k = 0; k < PROWLER_POOLS.length; k++) {
    const sx = a.left + PROWLER_POOLS[k] - v.x;
    if (sx < -300 || sx > W + 300) continue;
    for (let i = 0; i < 16; i++) {
      const ph = (time * (0.03 + rand(i + k * 20) * 0.03) + rand(i + 5 + k * 20)) % 1;
      const y = ph * floorY;
      const half = 30 + (POOL_HALF * 0.8 - 30) * (y / Math.max(1, floorY));
      const x = sx + (rand(i + 9 + k * 20) - 0.5) * 2 * half * 0.8 + Math.sin(time * 0.7 + i) * 6;
      ctx.globalAlpha = Math.sin(ph * Math.PI) * 0.6 * moon;
      ctx.fillRect(x, y, 1.8, 1.8);
    }
  }
  ctx.globalAlpha = 0.14;
  stampGlow(ctx, '#5ae6ff', bossX - v.x, floorY - 90, 320, 1);
  for (let i = 0; i < 26; i++) {
    const ph = (time * (0.02 + rand(i) * 0.035) + rand(i + 50)) % 1;
    const ex = (rand(i + 9) * W * 1.1 + Math.sin(time * 0.5 + i) * 30 + W) % W;
    const ey = H * (0.96 - ph * 0.9) + Math.sin(time * 0.8 + i * 2) * 10;
    const col = CAP_COLORS[i % 4];
    const r = 1.4 + rand(i + 3) * 2;
    ctx.globalAlpha = Math.sin(ph * Math.PI) * (0.25 + 0.6 * glow);
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.arc(ex, ey, r, 0, Math.PI * 2);
    ctx.fill();
    stampGlow(ctx, col, ex, ey, r * 4, 0.5);
  }
  ctx.globalAlpha = 1;
}

// ───────────────────────────── a moon pool ─────────────────────────────

/** the lit ground of a moon pool, centred on (cx, y). `power` is 1 for the normal pool, brighter when the cave is dark. */
function moonPool(ctx: CanvasRenderingContext2D, cx: number, y: number, time: number, power: number, seed: number) {
  ctx.save();
  ctx.translate(cx, y);
  ctx.scale(1, 0.1);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, POOL_HALF);
  g.addColorStop(0, `rgba(235, 250, 255, ${0.7 * power})`);
  g.addColorStop(0.6, `rgba(150, 220, 240, ${0.36 * power})`);
  g.addColorStop(1, 'rgba(120, 200, 230, 0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, POOL_HALF, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  // rim and slow rings spreading on the water
  ctx.strokeStyle = `rgba(200, 245, 255, ${0.5 * power})`;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.ellipse(cx, y, POOL_HALF * 0.96, 11, 0, 0, Math.PI * 2);
  ctx.stroke();
  for (let r = 0; r < 3; r++) {
    const u = (time * 0.22 + r / 3 + seed * 0.37) % 1;
    ctx.strokeStyle = `rgba(220, 250, 255, ${(1 - u) * 0.45 * power})`;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.ellipse(cx, y, 14 + u * POOL_HALF * 0.85, 1.5 + u * 8, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  // glints
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 9; i++) {
    const tw = 0.5 + 0.5 * Math.sin(time * (1.6 + rand(i + seed * 7) * 2) + i * 2);
    ctx.globalAlpha = tw * 0.7 * power;
    ctx.fillRect(cx + (rand(i + seed * 3) - 0.5) * POOL_HALF * 1.6, y - 5 + rand(i + seed * 5 + 9) * 10, 6 + rand(i) * 8, 1.6);
  }
  ctx.globalAlpha = 1;
}

// ───────────────────────────── 2. the world ─────────────────────────────

/** props on the floor: the two moon pools, mushroom clusters at both fences, a few old bones and claw marks */
export function drawProwlerWorld(ctx: CanvasRenderingContext2D, a: LairArena, view: LairView, time: number) {
  const f = a.floor;
  const x0 = view.x - 80;
  const x1 = view.x + view.vw + 80;
  ctx.save();
  const power = 0.8 + 0.4 * (1 - glow);
  for (let k = 0; k < PROWLER_POOLS.length; k++) {
    const cx = a.left + PROWLER_POOLS[k];
    if (cx + POOL_HALF < x0 || cx - POOL_HALF > x1) continue;
    moonPool(ctx, cx, f, time, power, k);
  }

  // mushroom clusters standing at the two fences and between the pools
  const clusters: Array<[number, number]> = [
    [a.left + 40, 0], [a.left + 118, 1], [a.left + 690, 2], [a.left + 770, 3], [a.right - 118, 4], [a.right - 40, 5],
  ];
  for (const [cx, n] of clusters) {
    if (cx < x0 - 40 || cx > x1 + 40) continue;
    for (let m = 0; m < 3; m++) {
      glowcap(ctx, cx + (m - 1) * 15 + (rand(n * 4 + m) - 0.5) * 8, f + 2 - (m % 2) * 3, 30 + rand(n * 3 + m + 7) * 38, n + m, glow, time, n * 3 + m);
    }
  }

  // old bones and claw scratches on the cave floor
  const bone = (x: number, dy: number, len: number, rot: number) => {
    if (x < x0 || x > x1) return;
    ctx.save();
    ctx.translate(x, f - 2 - dy);
    ctx.rotate(rot);
    ctx.strokeStyle = '#cfd8d2';
    ctx.lineWidth = 4.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-len, 0);
    ctx.lineTo(len, 0);
    ctx.stroke();
    ctx.fillStyle = '#cfd8d2';
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.arc(s * len, -2.4, 3.6, 0, Math.PI * 2);
      ctx.arc(s * len, 2.4, 3.6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  };
  bone(a.left + 560, 1, 20, 0.12);
  bone(a.left + 585, 4, 15, -0.5);
  bone(a.right - 360, 1, 22, -0.1);
  ctx.strokeStyle = 'rgba(2, 10, 12, 0.65)';
  ctx.lineWidth = 2.4;
  ctx.lineCap = 'round';
  for (const sx of [a.left + 235, a.right - 230]) {
    if (sx < x0 || sx > x1) continue;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(sx + i * 9, f - 2);
      ctx.lineTo(sx + i * 9 + 12, f + 8);
      ctx.stroke();
    }
  }
  ctx.restore();
}

// ───────────────────────────── 3. the front ─────────────────────────────

/** over everything: a deep vignette, roots hanging from the ceiling, and the dark of the last phase */
export function drawProwlerFront(ctx: CanvasRenderingContext2D, v: LairView, time: number) {
  ctx.save();
  const vg = ctx.createRadialGradient(v.vw / 2, v.vh * 0.55, Math.min(v.vw, v.vh) * 0.36, v.vw / 2, v.vh * 0.55, Math.max(v.vw, v.vh) * 0.78);
  vg.addColorStop(0, 'rgba(0, 6, 10, 0)');
  vg.addColorStop(1, 'rgba(0, 6, 10, 0.66)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, v.vw, v.vh);

  // roots and moss hanging from the top edge
  ctx.lineCap = 'round';
  for (let i = 0; i < 12; i++) {
    const mx = (i + 0.3 + rand(i + 80) * 0.5) * (v.vw / 11.5);
    const len = 40 + rand(i + 81) * 100;
    const sw = Math.sin(time * 0.7 + i * 1.3) * 6;
    ctx.strokeStyle = 'rgba(2, 12, 14, 0.94)';
    ctx.lineWidth = 5.5;
    ctx.beginPath();
    ctx.moveTo(mx, -6);
    ctx.bezierCurveTo(mx + sw * 0.3, len * 0.35, mx - sw * 0.5, len * 0.7, mx + sw, len);
    ctx.stroke();
    if (i % 3 === 0) stampGlow(ctx, CAP_COLORS[(i / 3) % 4], mx + sw, len, 9, 0.7 * glow);
  }

  // the dark of the last phase: everything dims, but the moon pools shine through brighter
  const dark = 1 - glow;
  if (dark > 0.02) {
    ctx.fillStyle = `rgba(0, 4, 8, ${0.62 * dark})`;
    ctx.fillRect(0, 0, v.vw, v.vh);
    ctx.globalCompositeOperation = 'lighter';
    for (const dx of PROWLER_POOLS) {
      const sx = lastLeft + dx - v.x;
      const sy = lastFloor - v.y;
      if (sx < -POOL_HALF * 2 || sx > v.vw + POOL_HALF * 2) continue;
      ctx.save();
      ctx.translate(sx, sy);
      ctx.scale(1, 0.34);
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, POOL_HALF * 1.1);
      g.addColorStop(0, `rgba(190, 235, 255, ${0.5 * dark})`);
      g.addColorStop(1, 'rgba(190, 235, 255, 0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(0, 0, POOL_HALF * 1.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.globalCompositeOperation = 'source-over';
  }
  ctx.restore();
}
