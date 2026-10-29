/**
 * The Sky Sovereign's lair: the Cloud Aerie. A cliff-top high above a sea of cloud at sunset: a great low sun, spires of rock standing out
 * of the cloud, drifting banks of cloud, wind streaks and loose feathers. Her nest of speckled eggs sits at one end of the cliff and tattered
 * pennants flap from poles at both fences. When she is down to a third of her strength the storm breaks: the sky goes from gold to bruised
 * violet, rain slants across the view and lightning flashes behind the spires.
 *
 * Same layers as the other lairs (lairArt.ts): back (screen space, opaque), world (the nest, pennants and feathers on the cliff) and front
 * (screen space: vignette, fast wisps of cloud, the storm). The cliff, ledges, spires and ropes are in lairSovereignObjects.ts.
 *
 * The clouds and the sun are pre-drawn soft sprites stamped with drawImage, never shadowBlur, so the lair costs next to nothing on a phone.
 */
import type { LairArena, LairView } from './lairArt.ts';
import { LairPlate, LairStrip } from './lairPlate.ts';

function rand(i: number): number {
  const s = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}

// ───────────────────────────── the storm level ─────────────────────────────

/** 0 = golden dusk, 1 = the storm. Eased toward the target each frame; snaps on a new fight or a retry. */
let storm = 0;
let lastT = -1;

function easeStorm(time: number, phase: number) {
  const target = phase >= 3 ? 1 : 0;
  const dt = time - lastT;
  if (lastT < 0 || dt < 0 || dt > 1) storm = target;
  else storm += (target - storm) * Math.min(1, dt * 0.9);
  lastT = time;
}

/** how stormy the aerie is right now (the objects file dims its stone with it) */
export function sovereignStorm(): number {
  return storm;
}

/** a lightning flash: 0..1, a double flicker every few seconds, only in the storm */
function flash(time: number): number {
  if (storm < 0.6) return 0;
  const t = time % 5.1;
  if (t < 0.1) return 1 - t / 0.1;
  if (t > 0.22 && t < 0.34) return 0.8 * (1 - (t - 0.22) / 0.12);
  return 0;
}

// ───────────────────────────── soft sprites ─────────────────────────────

const sprites = new Map<string, HTMLCanvasElement>();

/** a soft round blob of `rgb` ("r,g,b") that fades to nothing at its edge */
function blob(rgb: string): HTMLCanvasElement | null {
  if (typeof document === 'undefined') return null;
  let c = sprites.get(rgb);
  if (!c) {
    c = document.createElement('canvas');
    c.width = c.height = 64;
    const g = c.getContext('2d');
    if (!g) return null;
    const rg = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    rg.addColorStop(0, `rgba(${rgb},1)`);
    rg.addColorStop(0.45, `rgba(${rgb},0.55)`);
    rg.addColorStop(1, `rgba(${rgb},0)`);
    g.fillStyle = rg;
    g.fillRect(0, 0, 64, 64);
    sprites.set(rgb, c);
  }
  return c;
}

/** a soft blob stretched to w x h, centred on x, y */
function stamp(ctx: CanvasRenderingContext2D, rgb: string, x: number, y: number, w: number, h: number, alpha: number) {
  if (alpha <= 0.01) return;
  const s = blob(rgb);
  if (!s) return;
  const old = ctx.globalAlpha;
  ctx.globalAlpha = old * Math.min(1, alpha);
  ctx.drawImage(s, x - w / 2, y - h / 2, w, h);
  ctx.globalAlpha = old;
}

// ───────────────────────────── 1. the back ─────────────────────────────

/**
 * The painted Cloud Aerie (Hugging Face img2img from World 4's own cloud-sea backdrop over the code lair's layout, hf-art-bosses): the
 * cliffs and spires over the cloud sea at sunset with her nest on the tallest spire, and its storm twin (bruised violet, lightning behind
 * the spires, slanting rain) that bleeds in when the storm breaks.
 */
const PLATE = new LairPlate({
  calm: new URL('../assets/lairs/lair-sov-calm.webp', import.meta.url).href,
  rage: new URL('../assets/lairs/lair-sov-rage.webp', import.meta.url).href,
  floorAt: 0.9,
  widthK: 1.25,
  drift: 0.25,
  fill: '#2a1a40',
});
/** the painted wind-bent grass, stones and feathers along the bottom edge (fg-sov.webp: all of it stands, none hangs) */
const STRIP = new LairStrip(new URL('../assets/lairs/fg-sov.webp', import.meta.url).href, 0);

/** the whole backdrop: the painted aerie, and in the storm the flash that lights the whole sky */
export function drawSovereignBack(ctx: CanvasRenderingContext2D, v: LairView, a: LairArena, time: number, _bossX: number, phase = 1) {
  easeStorm(time, phase);
  ctx.save();
  PLATE.draw(ctx, v, a, storm);
  const f = flash(time);
  if (f > 0.01) {
    ctx.fillStyle = `rgba(210, 200, 255, ${0.28 * f})`;
    ctx.fillRect(0, 0, v.vw, v.vh);
  }
  ctx.restore();
}

// ───────────────────────────── a pennant ─────────────────────────────

/** a tattered pennant on a pole standing on (x, y): it streams with the wind, harder in the storm */
export function pennant(ctx: CanvasRenderingContext2D, x: number, y: number, h: number, color: string, time: number, seed: number) {
  const lash = 1 + storm * 1.6;
  ctx.save();
  ctx.strokeStyle = '#3a2a1e';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y - h);
  ctx.stroke();
  ctx.fillStyle = '#e9c56a';
  ctx.beginPath();
  ctx.arc(x, y - h - 2, 4.5, 0, Math.PI * 2);
  ctx.fill();
  // the cloth, three tails
  ctx.fillStyle = color;
  ctx.strokeStyle = 'rgba(30, 14, 30, 0.6)';
  ctx.lineWidth = 1.4;
  const top = y - h + 6;
  for (let t = 0; t < 3; t++) {
    const ty = top + t * 15;
    const len = 56 + rand(seed + t) * 26;
    ctx.beginPath();
    ctx.moveTo(x + 2, ty);
    const n = 8;
    for (let i = 1; i <= n; i++) {
      const u = i / n;
      ctx.lineTo(x + 2 + u * len * lash * 0.7, ty + Math.sin(time * 6 * lash - u * 5 + seed + t) * 5 * u * lash + u * 4);
    }
    for (let i = n; i >= 1; i--) {
      const u = i / n;
      ctx.lineTo(x + 2 + u * len * lash * 0.7, ty + 11 * (1 - u * 0.7) + Math.sin(time * 6 * lash - u * 5 + seed + t) * 5 * u * lash + u * 4);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
}

// ───────────────────────────── 2. the world ─────────────────────────────

/** props on the cliff: the nest of speckled eggs, a pennant pole at each fence, a few big feathers and tufts in the wind */
export function drawSovereignWorld(ctx: CanvasRenderingContext2D, a: LairArena, view: LairView, time: number) {
  const f = a.floor;
  const x0 = view.x - 120;
  const x1 = view.x + view.vw + 120;
  ctx.save();

  // the nest: a wide bowl of twigs on the right, with three eggs
  const nx = a.right - 150;
  if (nx > x0 - 160 && nx < x1 + 160) {
    ctx.fillStyle = '#4a3322';
    ctx.strokeStyle = '#21140c';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(nx, f - 8, 128, 26, 0, 0, Math.PI);
    ctx.lineTo(nx + 128, f - 12);
    ctx.ellipse(nx, f - 12, 128, 14, 0, 0, Math.PI, true);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // eggs
    const eggs: Array<[number, number, number]> = [[-44, 0, 0], [6, -3, 1], [52, 1, 2]];
    for (const [ex, ey, k] of eggs) {
      const gx = nx + ex;
      const gy = f - 28 + ey;
      stamp(ctx, '255,200,120', gx, gy - 6, 78, 70, 0.28 + 0.1 * Math.sin(time * 1.4 + k));
      const eg = ctx.createRadialGradient(gx - 6, gy - 12, 3, gx, gy, 26);
      eg.addColorStop(0, '#fff6e2');
      eg.addColorStop(0.6, '#e8d2ae');
      eg.addColorStop(1, '#a88a62');
      ctx.fillStyle = eg;
      ctx.strokeStyle = 'rgba(50, 30, 12, 0.55)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(gx, gy, 17, 23, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = 'rgba(96, 70, 44, 0.5)';
      for (let s = 0; s < 6; s++) {
        ctx.beginPath();
        ctx.arc(gx + (rand(k * 9 + s) - 0.5) * 22, gy + (rand(k * 9 + s + 4) - 0.5) * 30, 1.6 + rand(s + k) * 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    // twigs poking out over the front rim
    ctx.strokeStyle = '#6b4a30';
    ctx.lineWidth = 3.4;
    ctx.lineCap = 'round';
    for (let i = 0; i < 12; i++) {
      const tx = nx - 120 + i * 21 + rand(i) * 8;
      ctx.beginPath();
      ctx.moveTo(tx, f - 12);
      ctx.lineTo(tx + (rand(i + 3) - 0.5) * 26, f - 20 - rand(i + 5) * 12);
      ctx.stroke();
    }
  }

  // a pennant pole at each fence
  for (const [px, col, sd] of [[a.left + 60, '#e0566e', 1], [a.right - 40, '#38b6c4', 2]] as const) {
    if (px < x0 - 100 || px > x1 + 100) continue;
    pennant(ctx, px, f, 190, col, time, sd * 7);
  }
  // and a smaller one in the middle of each half
  for (const [px, col, sd] of [[a.left + (a.right - a.left) * 0.3, '#f3c14a', 3], [a.left + (a.right - a.left) * 0.74, '#e0566e', 4]] as const) {
    if (px < x0 - 100 || px > x1 + 100) continue;
    pennant(ctx, px, f, 120, col, time, sd * 7);
  }

  // big feathers stuck in the ground, leaning with the wind, and tufts of grass
  for (const fx of [a.left + 340, a.left + 905, a.right - 330]) {
    if (fx < x0 || fx > x1) continue;
    const lean = 0.3 + 0.1 * Math.sin(time * 1.6 + fx);
    ctx.save();
    ctx.translate(fx, f);
    ctx.rotate(lean);
    ctx.fillStyle = '#d8cdb6';
    ctx.strokeStyle = '#6b5b45';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(0, 2);
    ctx.quadraticCurveTo(-9, -34, 0, -78);
    ctx.quadraticCurveTo(10, -34, 0, 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, 2);
    ctx.lineTo(0, -72);
    ctx.stroke();
    ctx.restore();
  }
  ctx.strokeStyle = '#8aa05a';
  ctx.lineWidth = 2.4;
  ctx.lineCap = 'round';
  for (let x = Math.floor(x0 / 90) * 90; x < x1; x += 90) {
    const sd = Math.floor(x / 90);
    if (rand(sd + 70) < 0.35) continue;
    const gx = x + rand(sd + 71) * 70;
    for (let b = 0; b < 4; b++) {
      const h = 8 + rand(sd * 4 + b) * 10;
      const sway = Math.sin(time * 2.4 + gx * 0.05 + b) * 3.5 * (1 + storm);
      ctx.beginPath();
      ctx.moveTo(gx + b * 3, f);
      ctx.quadraticCurveTo(gx + b * 3 + sway * 0.5, f - h * 0.6, gx + b * 3 + 5 + sway, f - h);
      ctx.stroke();
    }
  }
  ctx.restore();
}

// ───────────────────────────── 3. the front ─────────────────────────────

/** over everything: a soft vignette, a fast wisp of cloud now and then, and the storm's rain */
export function drawSovereignFront(ctx: CanvasRenderingContext2D, v: LairView, time: number) {
  ctx.save();
  const vg = ctx.createRadialGradient(v.vw / 2, v.vh * 0.55, Math.min(v.vw, v.vh) * 0.4, v.vw / 2, v.vh * 0.55, Math.max(v.vw, v.vh) * 0.8);
  vg.addColorStop(0, 'rgba(20, 8, 40, 0)');
  vg.addColorStop(1, `rgba(20, 8, 40, ${0.4 + 0.2 * storm})`);
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, v.vw, v.vh);
  // the painted grass and feathers along the bottom edge, nearer than anything
  STRIP.draw(ctx, v, Math.min(130, Math.max(90, v.vh * 0.22)), 0.95);

  // wisps of cloud blowing through the foreground
  for (let i = 0; i < 3; i++) {
    const ph = (time * (0.07 + rand(i + 90) * 0.04) + rand(i + 91)) % 1;
    const x = v.vw * 1.2 - ph * v.vw * 1.6;
    const y = v.vh * (0.1 + rand(i + 92) * 0.8);
    stamp(ctx, storm > 0.5 ? '120,100,170' : '255,224,214', x, y, 520, 70, Math.sin(ph * Math.PI) * 0.22);
  }

  if (storm > 0.01) {
    // slanting rain
    ctx.strokeStyle = `rgba(200, 210, 255, ${0.32 * storm})`;
    ctx.lineWidth = 1.4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    for (let i = 0; i < 64; i++) {
      const ph = (time * (1.5 + rand(i) * 0.8) + rand(i + 50)) % 1;
      const x = ((rand(i + 9) * (v.vw + 200) - ph * 120) + v.vw + 200) % (v.vw + 200) - 60;
      const y = -30 + ph * (v.vh + 60);
      ctx.moveTo(x, y);
      ctx.lineTo(x - 11, y + 30);
    }
    ctx.stroke();
    const f = flash(time);
    if (f > 0.01) {
      ctx.fillStyle = `rgba(225, 218, 255, ${0.18 * f})`;
      ctx.fillRect(0, 0, v.vw, v.vh);
    }
  }
  ctx.restore();
}
