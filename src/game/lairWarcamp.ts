/**
 * General Iron-Claw's lair: the War Camp. The warlord's fortress in the high canopy at dusk: a sky going from violet to ember over a sea
 * of treetops, and in front of it the palisade, a wall of sharpened logs with watchtowers, torches and the crimson claw banners of his
 * army. When the General is down to a third of his strength the camp goes to war: the sky turns blood red, the palisade and the towers
 * catch fire, banners are torn, embers and smoke fill the air and drums beat under it all (the fire at the arena's two ends is the
 * boss's own hazard, see bossArt.ts).
 *
 * Same layers as the other lairs (lairArt.ts): back (screen space, opaque), world (braziers, banner poles and weapon racks at each end
 * of the arena) and front (screen space: the vignette, embers, smoke). The floor, scaffolds, posts and chains are in lairWarcampObjects.ts.
 */
import type { LairArena, LairView } from './lairArt.ts';
import { rand, stamp } from './lairKit.ts';

// ───────────────────────────── the war ─────────────────────────────

/** 0 = dusk over the camp, 1 = the camp is burning. Eased toward the target; snaps on a new fight or a retry. */
let war = 0;
let lastT = -1;

function easeWar(time: number, phase: number) {
  const target = phase >= 3 ? 1 : 0;
  const dt = time - lastT;
  if (lastT < 0 || dt < 0 || dt > 1) war = target;
  else war += (target - war) * Math.min(1, dt * 0.8);
  lastT = time;
}

/** how far the camp is into the war (the objects file warms its iron and lights its torches with it) */
export function warcampWar(): number {
  return war;
}

/** the firelight colour: torch orange at dusk, a hotter red in the war */
export function fireRgb(k: number): string {
  return k > 0.5 ? '255,96,48' : '251,146,60';
}

export function mixc(a: [number, number, number], b: [number, number, number], t: number): string {
  return `rgb(${Math.round(a[0] + (b[0] - a[0]) * t)}, ${Math.round(a[1] + (b[1] - a[1]) * t)}, ${Math.round(a[2] + (b[2] - a[2]) * t)})`;
}

// ───────────────────────────── 1. the back ─────────────────────────────

/** a sea of treetops: rounded crowns, repeating, shifted by its own parallax */
function treetops(ctx: CanvasRenderingContext2D, v: LairView, baseY: number, par: number, seed: number, minH: number, maxH: number, fill: string) {
  const step = 90;
  const off = (v.x * par) % (step * 60);
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(-20, baseY + 20);
  for (let i = -1; i < v.vw / step + 3; i++) {
    const sd = Math.floor((off + i * step) / step) + seed;
    const x = i * step - (off % step);
    const h = minH + rand(sd) * (maxH - minH);
    const r = 40 + rand(sd + 1) * 30;
    ctx.lineTo(x - r, baseY);
    ctx.quadraticCurveTo(x - r * 0.9, baseY - h, x, baseY - h);
    ctx.quadraticCurveTo(x + r * 0.9, baseY - h, x + r, baseY);
  }
  ctx.lineTo(v.vw + 20, baseY + 20);
  ctx.closePath();
  ctx.fill();
}

/** one segment of the palisade: pointed logs side by side, banded with iron, between two towers */
function palisade(ctx: CanvasRenderingContext2D, v: LairView, baseY: number, time: number, k: number) {
  const par = 0.5;
  const step = 560;
  const off = (v.x * par) % (step * 40);
  const wallH = 150;
  for (let i = -1; i < v.vw / step + 2; i++) {
    const sd = Math.floor((off + i * step) / step) + 7;
    const x0 = i * step - (off % step);
    // the wall
    const g = ctx.createLinearGradient(0, baseY - wallH, 0, baseY);
    g.addColorStop(0, mixc([46, 24, 22], [52, 14, 12], k));
    g.addColorStop(1, mixc([22, 12, 14], [26, 8, 8], k));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(x0, baseY);
    for (let x = 0; x <= step - 100; x += 22) {
      const top = baseY - wallH + (rand(sd + x) - 0.5) * 12;
      ctx.lineTo(x0 + 70 + x, top + 12);
      ctx.lineTo(x0 + 70 + x + 11, top - 12);
      ctx.lineTo(x0 + 70 + x + 22, top + 12);
    }
    ctx.lineTo(x0 + step - 30, baseY);
    ctx.closePath();
    ctx.fill();
    // iron bands
    ctx.fillStyle = 'rgba(10, 8, 10, 0.7)';
    ctx.fillRect(x0 + 70, baseY - wallH * 0.7, step - 100, 7);
    ctx.fillRect(x0 + 70, baseY - wallH * 0.3, step - 100, 7);
    // a banner hung from the wall: crimson with a pale claw mark, torn when the camp is at war
    const bx = x0 + 250 + rand(sd + 3) * 90;
    const sway = Math.sin(time * 1.3 + sd) * 4;
    ctx.fillStyle = mixc([122, 22, 30], [150, 18, 20], k);
    ctx.beginPath();
    ctx.moveTo(bx - 26, baseY - wallH + 6);
    ctx.lineTo(bx + 26, baseY - wallH + 6);
    ctx.lineTo(bx + 24 + sway, baseY - wallH + 96 - 12 * k);
    ctx.lineTo(bx + sway * 1.3, baseY - wallH + 82 + 10 * k);
    ctx.lineTo(bx - 24 + sway, baseY - wallH + 98);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(240, 220, 200, 0.75)';
    ctx.lineWidth = 2.6;
    ctx.lineCap = 'round';
    for (let c = -1; c <= 1; c++) {
      ctx.beginPath();
      ctx.moveTo(bx + c * 9 - 3, baseY - wallH + 26);
      ctx.quadraticCurveTo(bx + c * 9 + 4 + sway * 0.3, baseY - wallH + 44, bx + c * 9 - 1 + sway * 0.5, baseY - wallH + 66);
      ctx.stroke();
    }
    // the watchtower at the end of the segment
    const tx = x0 + step - 40;
    const tw = 74;
    const th = 250;
    ctx.fillStyle = mixc([34, 18, 18], [40, 12, 10], k);
    ctx.fillRect(tx - tw / 2, baseY - th, tw, th);
    ctx.fillStyle = mixc([26, 12, 14], [30, 8, 8], k);
    ctx.beginPath();
    ctx.moveTo(tx - tw * 0.8, baseY - th + 6);
    ctx.lineTo(tx, baseY - th - 52);
    ctx.lineTo(tx + tw * 0.8, baseY - th + 6);
    ctx.closePath();
    ctx.fill();
    ctx.fillRect(tx - tw * 0.62, baseY - th + 6, tw * 1.24, 12);
    // a lit slit window and a torch on the wall of the tower
    stamp(ctx, fireRgb(k), tx, baseY - th + 54, 90, 90, 0.4 + 0.15 * Math.sin(time * 7 + sd) + 0.25 * k);
    ctx.fillStyle = k > 0.5 ? '#ffd9a0' : '#ffc46b';
    ctx.fillRect(tx - 5, baseY - th + 44, 10, 22);
    stamp(ctx, fireRgb(k), tx - tw / 2 - 12, baseY - 150, 60, 60, 0.5 + 0.2 * Math.sin(time * 9 + sd * 2));
    // at war the tower burns: flames from its roof and a column of smoke
    if (k > 0.05) {
      stamp(ctx, '255,110,40', tx, baseY - th - 20, 150 * k + 40, 130 * k + 40, 0.7 * k);
      for (let f = 0; f < 3; f++) {
        const fh = (40 + f * 18) * k * (0.8 + 0.2 * Math.sin(time * 10 + f + sd));
        ctx.fillStyle = f % 2 ? '#f97316' : '#dc2626';
        ctx.beginPath();
        ctx.moveTo(tx - 16 + f * 16 - 7, baseY - th - 6);
        ctx.quadraticCurveTo(tx - 16 + f * 16 - 8, baseY - th - fh * 0.6, tx - 16 + f * 16, baseY - th - fh - 10);
        ctx.quadraticCurveTo(tx - 16 + f * 16 + 8, baseY - th - fh * 0.6, tx - 16 + f * 16 + 7, baseY - th - 6);
        ctx.fill();
      }
      ctx.fillStyle = `rgba(20, 8, 8, ${0.35 * k})`;
      for (let sm = 0; sm < 4; sm++) {
        const ph = (time * 0.2 + sm * 0.25 + rand(sd)) % 1;
        ctx.beginPath();
        ctx.ellipse(tx + 20 + ph * 60 + Math.sin(time + sm) * 8, baseY - th - 60 - ph * 220, 20 + ph * 36, 14 + ph * 22, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}

export function drawWarcampBack(ctx: CanvasRenderingContext2D, v: LairView, a: LairArena, time: number, bossX: number, phase: number) {
  easeWar(time, phase);
  const k = war;
  ctx.save();
  const baseY = a.floor - v.y;
  // the sky: violet over ember at dusk, blood red over black in the war
  const g = ctx.createLinearGradient(0, 0, 0, baseY);
  g.addColorStop(0, mixc([28, 14, 40], [18, 2, 8], k));
  g.addColorStop(0.45, mixc([88, 28, 54], [86, 10, 18], k));
  g.addColorStop(0.85, mixc([186, 84, 44], [196, 52, 20], k));
  g.addColorStop(1, mixc([120, 48, 30], [110, 30, 14], k));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, v.vw, v.vh);

  // a low sun sinking behind the treetops, a fat disc with a wide glow (it burns redder in the war)
  const sx = v.vw * 0.7 - (v.x * 0.05) % (v.vw * 0.5);
  stamp(ctx, fireRgb(k), sx, baseY - 120, 720, 420, 0.5 + 0.2 * k);
  ctx.fillStyle = mixc([255, 204, 130], [255, 120, 70], k);
  ctx.beginPath();
  ctx.arc(sx, baseY - 120, 62, 0, Math.PI * 2);
  ctx.fill();

  // long storm clouds lit from below
  for (let i = 0; i < 5; i++) {
    const cx = ((rand(i + 30) * v.vw * 1.6 - v.x * 0.08 + time * (3 + i)) % (v.vw + 500)) - 250;
    const cy = 40 + rand(i + 40) * baseY * 0.4;
    ctx.fillStyle = mixc([54, 22, 44], [36, 8, 14], k);
    ctx.beginPath();
    ctx.ellipse(cx, cy, 220 + rand(i + 50) * 120, 26 + rand(i + 60) * 16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(${fireRgb(k)}, 0.2)`;
    ctx.beginPath();
    ctx.ellipse(cx, cy + 14, 180 + rand(i + 50) * 90, 8, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // the sea of treetops, far and near, black against the glow
  treetops(ctx, v, baseY - 20, 0.14, 3, 30, 90, mixc([56, 24, 40], [40, 10, 16], k));
  treetops(ctx, v, baseY - 8, 0.28, 17, 30, 80, mixc([34, 14, 28], [26, 6, 10], k));

  // the palisade, its towers, torches and banners
  palisade(ctx, v, baseY, time, k);

  // the General's own glow on the wall behind him
  stamp(ctx, k > 0.5 ? '255,70,50' : '252,165,165', bossX - v.x, baseY - 160, 700, 360, 0.1 + 0.1 * k);
  ctx.restore();
}

// ───────────────────────────── 2. in the world ─────────────────────────────

/** an iron brazier on a tripod with a roaring fire */
function brazier(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, k: number, seed: number) {
  ctx.strokeStyle = '#120a0a';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - 24, y);
  ctx.lineTo(x - 8, y - 64);
  ctx.moveTo(x + 24, y);
  ctx.lineTo(x + 8, y - 64);
  ctx.moveTo(x, y);
  ctx.lineTo(x, y - 62);
  ctx.stroke();
  ctx.fillStyle = '#2b1d1a';
  ctx.strokeStyle = '#0a0606';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(x - 28, y - 66);
  ctx.quadraticCurveTo(x, y - 40, x + 28, y - 66);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  const f = 1 + 0.22 * Math.sin(time * 9 + seed) + 0.1 * Math.sin(time * 15 + seed * 2);
  stamp(ctx, fireRgb(k), x, y - 92, 170 * f * (1 + 0.4 * k), 170 * f * (1 + 0.4 * k), 0.55);
  for (let j = 0; j < 3; j++) {
    const fx = x + (j - 1) * 11;
    const fh = (40 + (j % 2) * 14) * f;
    ctx.fillStyle = j === 1 ? '#fbbf24' : j ? '#f97316' : '#dc2626';
    ctx.beginPath();
    ctx.moveTo(fx - 9, y - 66);
    ctx.quadraticCurveTo(fx - 10, y - 66 - fh * 0.6, fx + Math.sin(time * 8 + j + seed) * 2, y - 66 - fh - 14);
    ctx.quadraticCurveTo(fx + 10, y - 66 - fh * 0.6, fx + 9, y - 66);
    ctx.fill();
  }
}

/** a tall banner pole with the crimson claw flag, whipping in the wind */
function banner(ctx: CanvasRenderingContext2D, x: number, y: number, dir: 1 | -1, time: number, k: number, seed: number) {
  ctx.fillStyle = '#1a0f0c';
  ctx.fillRect(x - 3, y - 250, 6, 250);
  ctx.fillStyle = '#3a2620';
  ctx.beginPath();
  ctx.moveTo(x - 6, y - 250);
  ctx.lineTo(x, y - 272);
  ctx.lineTo(x + 6, y - 250);
  ctx.closePath();
  ctx.fill();
  const w = 78;
  const h = 92;
  const sway = (i: number) => Math.sin(time * 3 + seed + i * 0.8) * (4 + 5 * i * 0.25);
  ctx.fillStyle = mixc([126, 22, 30], [156, 18, 20], k);
  ctx.beginPath();
  ctx.moveTo(x, y - 246);
  for (let i = 0; i <= 4; i++) ctx.lineTo(x + dir * (w * i) / 4, y - 246 + sway(i));
  for (let i = 4; i >= 0; i--) ctx.lineTo(x + dir * (w * i) / 4 - (i === 4 ? dir * 10 * k : 0), y - 246 + h * (i === 4 ? 0.8 : 1) + sway(i));
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(240, 220, 200, 0.8)';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  for (let c = 0; c < 3; c++) {
    ctx.beginPath();
    ctx.moveTo(x + dir * (22 + c * 12), y - 246 + 20 + sway(1));
    ctx.quadraticCurveTo(x + dir * (28 + c * 12), y - 246 + 46 + sway(2), x + dir * (24 + c * 12), y - 246 + 70 + sway(2));
    ctx.stroke();
  }
}

export function drawWarcampWorld(ctx: CanvasRenderingContext2D, a: LairArena, view: { x: number; y: number; vw: number; vh: number }, time: number) {
  const k = war;
  for (const dir of [1, -1] as const) {
    const edge = dir > 0 ? a.left + 70 : a.right - 70;
    if (edge < view.x - 260 || edge > view.x + view.vw + 260) continue;
    banner(ctx, edge + dir * 20, a.floor, dir, time, k, dir * 3);
    brazier(ctx, edge + dir * 110, a.floor, time, k, dir * 5);
    // a rack of spears and a barrel
    ctx.strokeStyle = '#1a0f0c';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(edge + dir * 190, a.floor);
    ctx.lineTo(edge + dir * 190, a.floor - 50);
    ctx.moveTo(edge + dir * 250, a.floor);
    ctx.lineTo(edge + dir * 250, a.floor - 50);
    ctx.moveTo(edge + dir * 186, a.floor - 36);
    ctx.lineTo(edge + dir * 254, a.floor - 36);
    ctx.stroke();
    for (let i = 0; i < 4; i++) {
      const sx = edge + dir * (196 + i * 16);
      ctx.strokeStyle = '#3a2a22';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(sx, a.floor - 30);
      ctx.lineTo(sx + dir * 6, a.floor - 96);
      ctx.stroke();
      ctx.fillStyle = '#cbd5e1';
      ctx.beginPath();
      ctx.moveTo(sx + dir * 6 - 3, a.floor - 94);
      ctx.lineTo(sx + dir * 6, a.floor - 112);
      ctx.lineTo(sx + dir * 6 + 3, a.floor - 94);
      ctx.fill();
    }
  }
  // the glow of the camp's fires along the floor
  const cx = (a.left + a.right) / 2;
  if (cx > view.x - 600 && cx < view.x + view.vw + 600) stamp(ctx, fireRgb(k), cx, a.floor - 3, 1000, 40, 0.14 + 0.12 * k);
}

// ───────────────────────────── 3. over everything ─────────────────────────────

export function drawWarcampFront(ctx: CanvasRenderingContext2D, v: LairView, time: number) {
  const k = war;
  ctx.save();
  const vg = ctx.createRadialGradient(v.vw / 2, v.vh * 0.55, v.vh * 0.4, v.vw / 2, v.vh * 0.55, Math.max(v.vw, v.vh) * 0.78);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, `rgba(${k > 0.5 ? '24, 2, 4' : '10, 2, 8'}, ${0.5 + 0.12 * k})`);
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, v.vw, v.vh);

  // embers rising from the camp's fires, thicker and hotter in the war
  const n = 20 + Math.round(30 * k);
  for (let i = 0; i < n; i++) {
    const px = (rand(i + 700) * v.vw * 1.2 + Math.sin(time * 0.7 + i) * 24) % (v.vw + 20);
    const py = v.vh - ((rand(i + 710) * v.vh + time * (24 + rand(i) * 40)) % v.vh);
    const tw = 0.5 + 0.5 * Math.sin(time * 5 + i);
    ctx.fillStyle = `rgba(${fireRgb(k)}, ${0.35 + 0.5 * tw})`;
    ctx.beginPath();
    ctx.arc(px, py, 0.9 + rand(i + 5) * 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
  if (k > 0.03) {
    // smoke drifting over the top of the view, and the beat of the war drums: a slow red pulse
    ctx.fillStyle = `rgba(16, 4, 6, ${0.28 * k})`;
    for (let i = 0; i < 4; i++) {
      const ph = (time * 0.05 + i * 0.25) % 1;
      ctx.beginPath();
      ctx.ellipse(ph * (v.vw + 400) - 200, 30 + Math.sin(time * 0.5 + i) * 14, 260, 46, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    const beat = Math.max(0, Math.sin(time * 3.2)) ** 6;
    ctx.fillStyle = `rgba(255, 50, 30, ${(0.015 + 0.06 * beat) * k})`;
    ctx.fillRect(0, 0, v.vw, v.vh);
  }
  ctx.restore();
}
