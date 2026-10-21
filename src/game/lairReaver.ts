/**
 * The Marsh Reaver's lair: the Blackwater Roost. A rotting plank dock on the edge of a mangrove swamp at dusk: pewter mist over brown
 * water, three ranks of stilt-rooted mangroves going back into the haze, a stilt-house with its lanterns lit far across the water, and
 * marsh lights drifting. Spear-racks hung with fish and skulls stand at both ends of the dock and a torch burns beside each. When he is
 * down to a third of his strength the war-horns sound: the sky goes from pewter to smoky ember, every lantern and torch flares, drums pulse
 * in the light and embers rise off the water.
 *
 * Same layers as the other lairs (lairArt.ts): back (screen space, opaque), world (the racks, torches, a boat, nets on the dock) and front
 * (screen space: vignette, mist, the war-glow). The dock, rafts, totems and ropes are in lairReaverObjects.ts.
 */
import type { LairArena, LairView } from './lairArt.ts';
import { rand, stamp } from './lairKit.ts';

// ───────────────────────────── the war level ─────────────────────────────

/** 0 = pewter dusk, 1 = the war-horns have sounded. Eased toward the target; snaps on a new fight or a retry. */
let war = 0;
let lastT = -1;

function easeWar(time: number, phase: number) {
  const target = phase >= 3 ? 1 : 0;
  const dt = time - lastT;
  if (lastT < 0 || dt < 0 || dt > 1) war = target;
  else war += (target - war) * Math.min(1, dt * 0.9);
  lastT = time;
}

/** how far into the war the roost is (the objects file warms its wood with it) */
export function reaverWar(): number {
  return war;
}

/** blend two [r,g,b] by `k` into a css colour */
export function mix(a: [number, number, number], b: [number, number, number], k: number): string {
  return `rgb(${Math.round(a[0] + (b[0] - a[0]) * k)},${Math.round(a[1] + (b[1] - a[1]) * k)},${Math.round(a[2] + (b[2] - a[2]) * k)})`;
}

/** lantern colour: warm lamp-yellow at dusk, hot ember in the war */
export function lampRgb(k: number): string {
  return k > 0.5 ? '255,110,40' : '255,200,110';
}

// ───────────────────────────── 1. the back ─────────────────────────────

/** a mangrove: a bushy crown on a fan of arched stilt roots */
function mangrove(ctx: CanvasRenderingContext2D, x: number, waterY: number, h: number, w: number, seed: number, fill: string) {
  ctx.fillStyle = fill;
  ctx.strokeStyle = fill;
  ctx.lineWidth = Math.max(2, w * 0.035);
  ctx.lineCap = 'round';
  const n = 6;
  for (let i = 0; i < n; i++) {
    const u = (i + 0.5) / n - 0.5;
    ctx.beginPath();
    ctx.moveTo(x + u * w * 0.35, waterY - h * 0.5);
    ctx.quadraticCurveTo(x + u * w * 0.9, waterY - h * 0.35, x + u * w * 1.15, waterY + 2);
    ctx.stroke();
  }
  ctx.beginPath();
  for (let i = 0; i < 7; i++) {
    const a = rand(seed + i);
    const cx = x + (a - 0.5) * w * 0.9;
    const cy = waterY - h * (0.55 + rand(seed + i + 9) * 0.38);
    const r = w * (0.2 + rand(seed + i + 4) * 0.16);
    ctx.moveTo(cx + r, cy);
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
  }
  ctx.fill();
}

export function drawReaverBack(ctx: CanvasRenderingContext2D, v: LairView, a: LairArena, time: number, bossX: number, phase: number) {
  easeWar(time, phase);
  const k = war;
  ctx.save();
  const baseY = a.floor - v.y;
  const horizon = Math.min(v.vh * 0.72, Math.max(v.vh * 0.3, baseY - 110));

  // sky
  const sky = ctx.createLinearGradient(0, 0, 0, horizon);
  sky.addColorStop(0, mix([26, 38, 40], [44, 20, 16], k));
  sky.addColorStop(0.6, mix([66, 86, 80], [112, 50, 30], k));
  sky.addColorStop(1, mix([140, 152, 126], [206, 112, 54], k));
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, v.vw, horizon + 2);

  // a pale sun through the haze (a smouldering one in the war)
  const sx = v.vw * 0.7 - (v.x * 0.03);
  stamp(ctx, k > 0.5 ? '255,140,70' : '235,238,205', sx, horizon - 70, 420, 300, 0.55);
  stamp(ctx, k > 0.5 ? '255,200,120' : '255,255,235', sx, horizon - 70, 120, 110, 0.9);

  // three ranks of mangrove going back into the haze, each darker and bigger than the one behind
  for (let layer = 0; layer < 3; layer++) {
    const par = 0.12 + layer * 0.16;
    const step = 260 - layer * 40;
    const h = 130 + layer * 60;
    const fill = mix([[96, 112, 100], [58, 72, 64], [26, 36, 32]][layer] as [number, number, number], [[120, 64, 44], [70, 36, 28], [30, 16, 14]][layer] as [number, number, number], k);
    const wy = horizon + 4 + layer * 14;
    for (let i = -2; i < v.vw / step + 3; i++) {
      const sd = i + layer * 41 + Math.floor((v.x * par) / step);
      const px = i * step - ((v.x * par) % step) + (rand(sd) - 0.5) * 90;
      mangrove(ctx, px, wy, h * (0.7 + rand(sd + 3) * 0.6), 110 + rand(sd + 5) * 80 + layer * 30, sd, fill);
    }
  }

  // the stilt-house across the water, its lanterns lit
  const hx = v.vw * 0.22 - v.x * 0.08;
  const hy = horizon - 12;
  ctx.fillStyle = mix([40, 50, 46], [34, 18, 14], k);
  ctx.fillRect(hx - 52, hy - 34, 104, 24);
  ctx.beginPath();
  ctx.moveTo(hx - 66, hy - 34);
  ctx.lineTo(hx, hy - 66);
  ctx.lineTo(hx + 66, hy - 34);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = ctx.fillStyle as string;
  ctx.lineWidth = 4;
  for (const dx of [-44, -14, 14, 44]) {
    ctx.beginPath();
    ctx.moveTo(hx + dx, hy - 10);
    ctx.lineTo(hx + dx, hy + 26);
    ctx.stroke();
  }
  for (const dx of [-30, 0, 30]) stamp(ctx, lampRgb(k), hx + dx, hy - 22, 26 + 10 * k, 26 + 10 * k, 0.7 + 0.2 * Math.sin(time * 3 + dx));

  // the water: dark, with long reflections of the lights and slow ripples
  const wg = ctx.createLinearGradient(0, horizon, 0, v.vh);
  wg.addColorStop(0, mix([72, 82, 70], [96, 52, 34], k));
  wg.addColorStop(0.25, mix([36, 44, 38], [50, 26, 20], k));
  wg.addColorStop(1, mix([14, 18, 16], [20, 10, 8], k));
  ctx.fillStyle = wg;
  ctx.fillRect(0, horizon, v.vw, v.vh - horizon);
  for (const dx of [-30, 0, 30]) stamp(ctx, lampRgb(k), hx + dx, horizon + 40, 14, 90, 0.35 + 0.1 * Math.sin(time * 2 + dx));
  stamp(ctx, k > 0.5 ? '255,150,80' : '235,238,205', sx, horizon + 60, 90, 150, 0.35);
  ctx.strokeStyle = k > 0.5 ? 'rgba(255, 170, 110, 0.14)' : 'rgba(200, 220, 200, 0.12)';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 26; i++) {
    const ry = horizon + 8 + rand(i) * (v.vh - horizon) * 0.8;
    const rx = (rand(i + 20) * (v.vw + 300) - v.x * 0.2 + Math.sin(time * 0.4 + i) * 16) % (v.vw + 300);
    const rw = 24 + rand(i + 40) * 70;
    ctx.beginPath();
    ctx.moveTo(rx, ry);
    ctx.lineTo(rx + rw, ry + Math.sin(time + i) * 1.5);
    ctx.stroke();
  }

  // banks of mist lying on the water
  for (let i = 0; i < 6; i++) {
    const mx = ((rand(i + 60) * (v.vw + 600) + time * (6 + i * 2) - v.x * 0.15) % (v.vw + 600)) - 300;
    stamp(ctx, k > 0.5 ? '255,170,120' : '214,224,214', mx, horizon + 10 + rand(i + 70) * 70, 420 + rand(i + 71) * 260, 70 + rand(i + 72) * 40, 0.2 - 0.06 * k);
  }

  // the Reaver's own glow, so he reads against the haze
  stamp(ctx, k > 0.5 ? '255,120,60' : '200,230,215', bossX - v.x, baseY - 120, 520, 320, 0.14 + 0.08 * k);

  // marsh lights and fireflies
  ctx.fillStyle = k > 0.5 ? 'rgba(255, 190, 120, 0.8)' : 'rgba(190, 255, 180, 0.8)';
  for (let i = 0; i < 18; i++) {
    const px = ((rand(i + 100) * v.vw * 1.2 + Math.sin(time * 0.5 + i) * 30) % (v.vw + 40));
    const py = horizon + 20 + ((rand(i + 110) * (baseY - horizon) + Math.sin(time * 0.7 + i * 2) * 18) % Math.max(60, baseY - horizon));
    const tw = 0.3 + 0.7 * Math.max(0, Math.sin(time * 1.6 + i * 3));
    stamp(ctx, k > 0.5 ? '255,190,120' : '190,255,170', px, py, 10, 10, tw);
  }
  ctx.restore();
}

// ───────────────────────────── 2. in the world ─────────────────────────────

/** a torch on a post, the flame stamped with glow */
function torch(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, k: number, seed: number) {
  ctx.strokeStyle = '#2a1c12';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y - 96);
  ctx.stroke();
  ctx.strokeStyle = '#6a4a2a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x - 1, y);
  ctx.lineTo(x - 1, y - 96);
  ctx.stroke();
  const f = 1 + 0.18 * Math.sin(time * 11 + seed) + 0.1 * Math.sin(time * 17 + seed * 2);
  stamp(ctx, lampRgb(k), x, y - 112, 120 * f * (1 + 0.5 * k), 120 * f * (1 + 0.5 * k), 0.55);
  ctx.fillStyle = k > 0.5 ? '#ff7a2a' : '#ffb347';
  ctx.beginPath();
  ctx.moveTo(x - 7, y - 98);
  ctx.quadraticCurveTo(x - 9, y - 114 * f, x, y - 132 * f);
  ctx.quadraticCurveTo(x + 9, y - 114 * f, x + 7, y - 98);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#fff3c4';
  ctx.beginPath();
  ctx.ellipse(x, y - 106, 3.4, 8 * f, 0, 0, Math.PI * 2);
  ctx.fill();
}

/** a spear rack: a post with crossed spears, a skull and a string of fish bones */
function spearRack(ctx: CanvasRenderingContext2D, x: number, y: number, dir: 1 | -1, time: number, seed: number) {
  ctx.strokeStyle = '#2a1c12';
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y - 150);
  ctx.stroke();
  ctx.strokeStyle = '#6a4a2a';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x - 1.5, y);
  ctx.lineTo(x - 1.5, y - 150);
  ctx.stroke();
  // crossed spears behind the post
  for (const s of [-1, 1]) {
    ctx.strokeStyle = '#3d2c1c';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x - s * 40, y - 6);
    ctx.lineTo(x + s * 30, y - 150);
    ctx.stroke();
    ctx.fillStyle = '#cfd8dc';
    ctx.beginPath();
    ctx.moveTo(x + s * 30, y - 148);
    ctx.lineTo(x + s * 26, y - 168);
    ctx.lineTo(x + s * 38, y - 158);
    ctx.closePath();
    ctx.fill();
  }
  // a skull on top
  ctx.fillStyle = '#e8e2cf';
  ctx.strokeStyle = '#3a3226';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(x, y - 160, 13, 11, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#1a140e';
  for (const dx of [-5, 5]) {
    ctx.beginPath();
    ctx.ellipse(x + dx, y - 161, 3, 3.6, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // fish bones on a string, swinging
  const sw = Math.sin(time * 1.4 + seed) * 3;
  ctx.strokeStyle = '#d8d2c0';
  ctx.lineWidth = 1.6;
  for (let i = 0; i < 3; i++) {
    const fx = x + dir * (14 + i * 10) + sw * 0.4;
    const fy = y - 120 + i * 4;
    ctx.beginPath();
    ctx.moveTo(fx, fy - 12);
    ctx.lineTo(fx + sw * 0.2, fy + 14);
    ctx.stroke();
    for (let r = -2; r <= 2; r++) {
      ctx.beginPath();
      ctx.moveTo(fx + sw * 0.1, fy + r * 4);
      ctx.lineTo(fx + 6 + sw * 0.1, fy + r * 4 + 3);
      ctx.stroke();
    }
  }
}

export function drawReaverWorld(ctx: CanvasRenderingContext2D, a: LairArena, view: { x: number; y: number; vw: number; vh: number }, time: number) {
  const k = war;
  for (const dir of [1, -1] as const) {
    const edge = dir > 0 ? a.left + 34 : a.right - 34;
    if (edge < view.x - 260 || edge > view.x + view.vw + 260) continue;
    spearRack(ctx, edge, a.floor, dir, time, dir * 7);
    torch(ctx, edge + dir * 76, a.floor, time, k, dir * 3);
    // a coil of net and a fish basket on the boards
    ctx.strokeStyle = 'rgba(190, 170, 120, 0.7)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.ellipse(edge + dir * 130, a.floor - 5, 24 - i * 4, 7 - i, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.fillStyle = '#4a3622';
    ctx.strokeStyle = '#1c130b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(edge + dir * 180 - 16, a.floor - 24, 32, 24, 4);
    ctx.fill();
    ctx.stroke();
  }
  // a beached dugout in the middle of the dock, and a heap of shells
  const bx = a.left + (a.right - a.left) * 0.42;
  if (bx > view.x - 160 && bx < view.x + view.vw + 160) {
    ctx.fillStyle = '#3b2a1b';
    ctx.strokeStyle = '#150e08';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(bx - 70, a.floor - 14);
    ctx.quadraticCurveTo(bx, a.floor + 6, bx + 70, a.floor - 16);
    ctx.lineTo(bx + 60, a.floor - 6);
    ctx.quadraticCurveTo(bx, a.floor + 8, bx - 60, a.floor - 6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
}

// ───────────────────────────── 3. over everything ─────────────────────────────

export function drawReaverFront(ctx: CanvasRenderingContext2D, v: LairView, time: number) {
  const k = war;
  ctx.save();
  const vg = ctx.createRadialGradient(v.vw / 2, v.vh * 0.55, v.vh * 0.4, v.vw / 2, v.vh * 0.55, Math.max(v.vw, v.vh) * 0.78);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, k > 0.5 ? 'rgba(34, 6, 0, 0.55)' : 'rgba(4, 10, 8, 0.5)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, v.vw, v.vh);

  // low mist drifting across the front of the view
  for (let i = 0; i < 4; i++) {
    const mx = ((rand(i + 800) * (v.vw + 500) + time * (10 + i * 5)) % (v.vw + 500)) - 250;
    stamp(ctx, k > 0.5 ? '255,170,120' : '210,222,212', mx, v.vh * (0.55 + rand(i + 810) * 0.3), 380 + rand(i + 820) * 200, 60, 0.12);
  }
  // hanging moss at the top edge
  ctx.strokeStyle = k > 0.5 ? 'rgba(40, 24, 14, 0.8)' : 'rgba(30, 44, 32, 0.8)';
  ctx.lineWidth = 2.2;
  ctx.lineCap = 'round';
  for (let i = 0; i < 18; i++) {
    const x = (i + rand(i + 900)) * (v.vw / 18);
    const len = 20 + rand(i + 910) * 46;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.quadraticCurveTo(x + Math.sin(time * 0.8 + i) * 5, len * 0.5, x + Math.sin(time * 0.8 + i) * 8, len);
    ctx.stroke();
  }
  if (k > 0.02) {
    // embers rising off the water and the pulse of the war drums
    for (let i = 0; i < 16; i++) {
      const ph = (time * (0.07 + rand(i) * 0.09) + rand(i + 50)) % 1;
      const ex = (rand(i + 9) * v.vw * 1.1 + Math.sin(time + i) * 12) % v.vw;
      const ey = v.vh * (1.02 - ph * 1.05);
      ctx.globalAlpha = Math.sin(ph * Math.PI) * 0.8 * k;
      stamp(ctx, '255,170,80', ex, ey, 8, 8, 1);
    }
    ctx.globalAlpha = 1;
    const beat = Math.max(0, Math.sin(time * 5.2)) ** 6;
    ctx.fillStyle = `rgba(160, 40, 0, ${(0.03 + 0.07 * beat) * k})`;
    ctx.fillRect(0, 0, v.vw, v.vh);
  }
  ctx.restore();
}
