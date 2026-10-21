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

/** a cloud: a row of overlapping blobs, a bright top and a shaded belly */
function cloud(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, seed: number, lit: string, shade: string, alpha: number) {
  const n = 5;
  for (let i = 0; i < n; i++) {
    const u = (i + 0.5) / n;
    const bw = w * (0.34 + rand(seed + i) * 0.14);
    const bh = h * (0.7 + rand(seed + i + 9) * 0.5) * (1 - Math.abs(u - 0.5) * 0.7);
    const bx = x - w / 2 + u * w;
    stamp(ctx, shade, bx, y + bh * 0.18, bw, bh, alpha * 0.9);
    stamp(ctx, lit, bx, y - bh * 0.12, bw * 0.85, bh * 0.75, alpha);
  }
}

// ───────────────────────────── 1. the back ─────────────────────────────

/** the whole backdrop: the sky, the sun, the cloud sea, the rock spires, drifting clouds, wind and the storm */
export function drawSovereignBack(ctx: CanvasRenderingContext2D, v: LairView, a: LairArena, time: number, bossX: number, phase = 1) {
  easeStorm(time, phase);
  ctx.save();
  const W = v.vw;
  const H = v.vh;
  const floorY = a.floor - v.y;
  const horizon = floorY - 70;

  // the sky: indigo overhead, violet, then the orange of the sun going down
  const sky = ctx.createLinearGradient(0, 0, 0, Math.max(H, floorY + 30));
  sky.addColorStop(0, '#171a45');
  sky.addColorStop(0.32, '#4a3478');
  sky.addColorStop(0.62, '#c8607a');
  sky.addColorStop(0.82, '#f29a5e');
  sky.addColorStop(1, '#ffd98a');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  // a few early stars at the top
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 26; i++) {
    const sx = (rand(i + 3) * W * 1.4 - v.x * 0.02 + W * 2) % W;
    const sy = rand(i + 4) * Math.max(40, horizon * 0.42);
    ctx.globalAlpha = (0.25 + 0.5 * rand(i + 5)) * (0.6 + 0.4 * Math.sin(time * (0.8 + rand(i) * 1.6) + i)) * (1 - storm * 0.9);
    ctx.fillRect(sx, sy, 1.6, 1.6);
  }
  ctx.globalAlpha = 1;

  // the sun, low and enormous, behind the middle of the arena
  const sunX = W * 0.58 - (v.x - (a.left + a.right) / 2) * 0.05;
  const sunY = horizon - 28;
  stamp(ctx, '255,214,140', sunX, sunY, 900, 640, 0.7 * (1 - storm * 0.85));
  stamp(ctx, '255,244,206', sunX, sunY, 300, 300, 0.9 * (1 - storm * 0.9));
  ctx.fillStyle = `rgba(255, 246, 214, ${0.95 * (1 - storm * 0.9)})`;
  ctx.beginPath();
  ctx.arc(sunX, sunY, 58, 0, Math.PI * 2);
  ctx.fill();

  // rock spires standing out of the cloud, two ranges, rim-lit by the sun
  const spires = (par: number, col: string, rim: string, hMin: number, hMax: number, step: number, seed: number, base: number) => {
    const off = v.x * par;
    for (let wx = Math.floor((-60 + off) / step); wx <= Math.floor((W + 60 + off) / step); wx++) {
      if (rand(wx + seed) < 0.32) continue;
      const sx = wx * step - off + rand(wx + seed + 3) * step * 0.4;
      const h = hMin + rand(wx + seed + 5) * (hMax - hMin);
      const bw = 26 + rand(wx + seed + 7) * 36;
      const tw = bw * (0.35 + rand(wx + seed + 8) * 0.25);
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.moveTo(sx - bw, base + 6);
      ctx.lineTo(sx - tw, base - h * 0.78);
      ctx.lineTo(sx - tw * 0.4, base - h);
      ctx.lineTo(sx + tw, base - h * 0.94);
      ctx.lineTo(sx + bw, base + 6);
      ctx.closePath();
      ctx.fill();
      // the sunny side
      ctx.strokeStyle = rim;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(sx + bw, base + 6);
      ctx.lineTo(sx + tw, base - h * 0.94);
      ctx.lineTo(sx - tw * 0.4, base - h);
      ctx.stroke();
    }
  };
  spires(0.07, '#6b4a88', 'rgba(255, 196, 140, 0.55)', 110, 300, 210, 21, horizon + 10);
  spires(0.15, '#41295f', 'rgba(255, 170, 120, 0.4)', 70, 220, 150, 55, horizon + 34);

  // the cloud sea: three banks, the far ones pale and warm, the near one in shade
  const bank = (par: number, y: number, size: number, lit: string, shade: string, alpha: number, seed: number, drift: number) => {
    const off = v.x * par + time * drift;
    const step = size * 0.55;
    for (let wx = Math.floor((-size + off) / step); wx <= Math.floor((W + size + off) / step); wx++) {
      const cx = wx * step - off;
      cloud(ctx, cx, y + Math.sin(wx * 1.7 + seed) * 8, size, size * 0.34, wx * 7 + seed, lit, shade, alpha);
    }
  };
  bank(0.1, horizon + 8, 300, '255,226,190', '236,150,150', 0.85, 2, 3);
  bank(0.2, horizon + 34, 360, '255,214,190', '196,120,150', 0.9, 5, 5);
  bank(0.34, floorY - 6, 420, '240,196,196', '120,84,130', 0.95, 9, 8);

  // big clouds drifting through the air above the cliff, slowly
  for (let i = 0; i < 6; i++) {
    const span = W + 700;
    const cx = ((((i + 0.25 + rand(i + 30) * 0.5) / 6) * span - v.x * 0.26 - time * (4 + rand(i + 31) * 6)) % span + span) % span - 350;
    const cy = horizon - 150 - rand(i + 32) * Math.max(60, horizon * 0.55);
    cloud(ctx, cx, cy, 240 + rand(i + 33) * 160, 70 + rand(i + 34) * 40, i * 11, '255,226,210', '190,120,160', 0.5 * (1 - storm * 0.5));
  }

  // wind: long thin streaks racing across, a few loose feathers tumbling in it
  ctx.lineCap = 'round';
  for (let i = 0; i < 12; i++) {
    const ph = (time * (0.16 + rand(i) * 0.14) + rand(i + 50)) % 1;
    const x = W * 1.15 - ph * (W * 1.5);
    const y = H * (0.12 + rand(i + 9) * 0.7);
    const len = 70 + rand(i + 3) * 120;
    ctx.strokeStyle = `rgba(255, 255, 255, ${Math.sin(ph * Math.PI) * (0.2 + 0.2 * storm)})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.bezierCurveTo(x + len * 0.3, y - 5, x + len * 0.7, y + 5, x + len, y);
    ctx.stroke();
  }
  for (let i = 0; i < 7; i++) {
    const ph = (time * (0.05 + rand(i + 60) * 0.04) + rand(i + 61)) % 1;
    const x = W * 1.05 - ph * W * 1.2;
    const y = H * (0.2 + rand(i + 62) * 0.55) + Math.sin(time * 1.3 + i * 2) * 16;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.sin(time * 1.1 + i) * 0.9);
    ctx.globalAlpha = Math.sin(ph * Math.PI) * 0.8;
    ctx.fillStyle = '#f7ead2';
    ctx.beginPath();
    ctx.ellipse(0, 0, 9, 2.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.globalAlpha = 1;

  // a warm glow behind the boss, to set a dark eagle against the sunset
  stamp(ctx, '255,196,120', bossX - v.x, floorY - 190, 760, 520, 0.2 * (1 - storm));

  // the storm: the sky closes up and the clouds go dark
  if (storm > 0.01) {
    ctx.fillStyle = `rgba(24, 14, 48, ${0.72 * storm})`;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = `rgba(60, 40, 100, ${0.22 * storm})`;
    for (let i = 0; i < 5; i++) {
      const cx = ((i + 0.3) / 5) * W + Math.sin(time * 0.2 + i) * 60;
      cloud(ctx, cx, H * 0.1 + (i % 2) * 34, W * 0.5, 150, i * 13, '84,64,128', '30,20,60', 0.85 * storm);
    }
    const f = flash(time);
    if (f > 0.01) {
      // a bolt behind the spires and the flash that lights the whole sky
      const bx = W * (0.25 + 0.5 * rand(Math.floor(time / 5.1) + 7));
      ctx.strokeStyle = `rgba(235, 228, 255, ${f})`;
      ctx.lineWidth = 3;
      ctx.lineJoin = 'round';
      ctx.beginPath();
      let x = bx;
      let y = 0;
      ctx.moveTo(x, y);
      for (let k = 0; k < 7; k++) {
        x += (rand(k + Math.floor(time / 5.1) * 3) - 0.5) * 70;
        y += horizon / 7;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.fillStyle = `rgba(210, 200, 255, ${0.28 * f})`;
      ctx.fillRect(0, 0, W, H);
    }
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
