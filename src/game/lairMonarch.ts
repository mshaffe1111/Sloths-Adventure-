/**
 * The Night-Wing Monarch's lair: the Karst Roost. A limestone cavern under a tower of karst, the roof hung with stalactites and with
 * hundreds of sleeping bats. One round hole in the roof lets in a shaft of moonlight; spores of blue and violet fungus glow along the
 * floor. When the Monarch is down to a third of her strength the lights go out: the moon is covered, the shaft fails, the roost wakes
 * (eyes open all across the dark roof, bats stir and cross the cave in shadow) and the screen closes in to a pool of light around the
 * hero. Hazards and warnings are bright enough to read through it.
 *
 * Same layers as the other lairs (lairArt.ts): back (screen space, opaque), world (the cave mouth's stalagmites and fungus at each end
 * of the arena) and front (screen space: the dark, the shadows, the motes). The floor, ledges, columns and roots are in
 * lairMonarchObjects.ts.
 */
import type { LairArena, LairView } from './lairArt.ts';
import { rand, stamp } from './lairKit.ts';

// ───────────────────────────── the dark ─────────────────────────────

/** 0 = the moonlit roost, 1 = the lights are out and the roost is awake. Eased toward the target; snaps on a new fight or a retry. */
let night = 0;
let lastT = -1;

function easeNight(time: number, phase: number) {
  const target = phase >= 3 ? 1 : 0;
  const dt = time - lastT;
  if (lastT < 0 || dt < 0 || dt > 1) night = target;
  else night += (target - night) * Math.min(1, dt * 0.9);
  lastT = time;
}

/** how dark the roost is (the objects file dims its glow and lights its fungus with it) */
export function monarchNight(): number {
  return night;
}

/** the fungus glow: a cold teal in the moonlight, a hot violet in the dark */
export function sporeRgb(k: number): string {
  return k > 0.5 ? '186,120,255' : '90,200,220';
}

// ───────────────────────────── 1. the back ─────────────────────────────

/** a jagged silhouette of limestone towers along the horizon, repeating, shifted by its own parallax */
function towers(ctx: CanvasRenderingContext2D, v: LairView, baseY: number, par: number, seed: number, minH: number, maxH: number, fill: string) {
  const step = 130;
  const off = (v.x * par) % (step * 40);
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(-20, baseY + 10);
  for (let i = -1; i < v.vw / step + 3; i++) {
    const sd = Math.floor((off + i * step) / step) + seed;
    const x = i * step - (off % step) + (rand(sd) - 0.5) * 30;
    const h = minH + rand(sd + 1) * (maxH - minH);
    const w = 50 + rand(sd + 2) * 40;
    ctx.lineTo(x - w, baseY);
    ctx.lineTo(x - w * 0.35, baseY - h * 0.9);
    ctx.lineTo(x, baseY - h);
    ctx.lineTo(x + w * 0.4, baseY - h * 0.8);
    ctx.lineTo(x + w, baseY);
  }
  ctx.lineTo(v.vw + 20, baseY + 10);
  ctx.closePath();
  ctx.fill();
}

/** a stalactite fringe hanging from the roof */
function stalactites(ctx: CanvasRenderingContext2D, v: LairView, par: number, seed: number, maxLen: number, fill: string) {
  const step = 70;
  const off = (v.x * par) % (step * 50);
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(-10, -10);
  for (let i = -1; i < v.vw / step + 3; i++) {
    const sd = Math.floor((off + i * step) / step) + seed;
    const x = i * step - (off % step) + (rand(sd) - 0.5) * 24;
    const len = maxLen * (0.25 + rand(sd + 1) * 0.75) * (rand(sd + 2) < 0.3 ? 1.5 : 1);
    const w = 18 + rand(sd + 3) * 22;
    ctx.lineTo(x - w, 0);
    ctx.quadraticCurveTo(x - w * 0.3, len * 0.55, x, len);
    ctx.quadraticCurveTo(x + w * 0.3, len * 0.55, x + w, 0);
  }
  ctx.lineTo(v.vw + 10, -10);
  ctx.closePath();
  ctx.fill();
}

export function drawMonarchBack(ctx: CanvasRenderingContext2D, v: LairView, a: LairArena, time: number, bossX: number, phase: number) {
  easeNight(time, phase);
  const k = night;
  ctx.save();
  const baseY = a.floor - v.y;
  const g = ctx.createLinearGradient(0, 0, 0, v.vh);
  g.addColorStop(0, '#04020b');
  g.addColorStop(0.5, k > 0.5 ? '#0b0620' : '#130a2c');
  g.addColorStop(1, '#0d1030');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, v.vw, v.vh);

  // the hole in the roof and its shaft of moonlight, which fails when the lights go out
  const hx = v.vw * 0.64 - (v.x * 0.12) % (v.vw * 1.4);
  const moon = 1 - 0.9 * k;
  if (moon > 0.02) {
    const sh = ctx.createLinearGradient(0, 0, 0, baseY);
    sh.addColorStop(0, `rgba(205, 200, 255, ${0.3 * moon})`);
    sh.addColorStop(1, `rgba(150, 160, 240, 0)`);
    ctx.fillStyle = sh;
    ctx.beginPath();
    ctx.moveTo(hx - 70, 0);
    ctx.lineTo(hx + 70, 0);
    ctx.lineTo(hx + 250, baseY);
    ctx.lineTo(hx - 130, baseY);
    ctx.closePath();
    ctx.fill();
    stamp(ctx, '215,210,255', hx, 4, 260, 120, 0.5 * moon);
  }

  // karst towers far and near, their tops lit a little by the moon
  towers(ctx, v, baseY, 0.18, 11, 120, 300, k > 0.5 ? '#0c0a22' : '#171238');
  towers(ctx, v, baseY, 0.34, 53, 90, 240, k > 0.5 ? '#090718' : '#100c2a');

  // the roost: bats asleep in clusters under the roof, and when the lights go out their eyes open and some take wing
  stalactites(ctx, v, 0.5, 91, 150, '#0a0618');
  const par = 0.5;
  const nb = 46;
  for (let i = 0; i < nb; i++) {
    const bx = ((rand(i + 200) * v.vw * 1.5 - v.x * par) % (v.vw + 80)) - 20;
    const by = 20 + rand(i + 210) * 96;
    const s = 12 + rand(i + 220) * 10;
    const sleepy = Math.sin(time * 0.6 + i) * 0.5;
    ctx.save();
    ctx.translate(bx, by);
    // wrapped wings, hanging head down
    ctx.fillStyle = '#05030c';
    ctx.beginPath();
    ctx.ellipse(0, s * 0.5 + sleepy, s * 0.46, s * 0.82, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#17102e';
    ctx.beginPath();
    ctx.ellipse(-s * 0.1, s * 0.5 + sleepy, s * 0.2, s * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
    if (k > 0.05) {
      ctx.fillStyle = `rgba(255, 70, 96, ${k * (0.55 + 0.35 * Math.sin(time * 2 + i * 1.7))})`;
      ctx.beginPath();
      ctx.arc(-s * 0.16, s * 1.05, 1.7, 0, Math.PI * 2);
      ctx.arc(s * 0.16, s * 1.05, 1.7, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
  stalactites(ctx, v, 0.72, 133, 110, '#06030f');

  // fungus and crystal glow along the floor line, and a low mist
  for (let i = 0; i < 9; i++) {
    const fx = ((rand(i + 300) * v.vw * 1.4 - v.x * 0.8) % (v.vw + 100)) - 20;
    stamp(ctx, sporeRgb(k), fx, baseY - 6 - rand(i + 310) * 24, 150, 90, 0.16 + 0.1 * Math.sin(time * 0.9 + i) + 0.12 * k);
  }
  const mist = ctx.createLinearGradient(0, baseY - 90, 0, baseY + 20);
  mist.addColorStop(0, 'rgba(120, 130, 220, 0)');
  mist.addColorStop(1, `rgba(120, 130, 220, ${0.16 - 0.06 * k})`);
  ctx.fillStyle = mist;
  ctx.fillRect(0, baseY - 90, v.vw, 110);

  // the Monarch's own glow, so she reads against the dark roof
  stamp(ctx, k > 0.5 ? '255,90,110' : '167,139,250', bossX - v.x, baseY - 200, 620, 360, 0.1 + 0.08 * k);
  ctx.restore();
}

// ───────────────────────────── 2. in the world ─────────────────────────────

/** a stalagmite with a cap of glowing fungus */
function stalagmite(ctx: CanvasRenderingContext2D, x: number, y: number, h: number, w: number, time: number, k: number, seed: number) {
  const g = ctx.createLinearGradient(x - w, 0, x + w, 0);
  g.addColorStop(0, '#120c26');
  g.addColorStop(0.5, '#4b4670');
  g.addColorStop(1, '#161034');
  ctx.fillStyle = g;
  ctx.strokeStyle = '#05030c';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - w, y);
  ctx.quadraticCurveTo(x - w * 0.4, y - h * 0.6, x - 3, y - h);
  ctx.lineTo(x + 3, y - h);
  ctx.quadraticCurveTo(x + w * 0.4, y - h * 0.6, x + w, y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // banding of the flowstone
  ctx.strokeStyle = 'rgba(190, 180, 255, 0.18)';
  ctx.lineWidth = 1.4;
  for (let i = 1; i < 5; i++) {
    const yy = y - (h * i) / 5;
    const hw = w * (1 - i / 5) * 0.8;
    ctx.beginPath();
    ctx.moveTo(x - hw, yy);
    ctx.quadraticCurveTo(x, yy + 4, x + hw, yy);
    ctx.stroke();
  }
  // a cluster of glowing caps at the foot
  for (let i = -1; i <= 1; i++) {
    const cx = x + i * w * 0.7;
    const r = 4 + rand(seed + i + 5) * 3;
    stamp(ctx, sporeRgb(k), cx, y - 3, 46, 30, 0.45 + 0.2 * Math.sin(time * 2 + seed + i) + 0.2 * k);
    ctx.fillStyle = k > 0.5 ? '#e7cbff' : '#aef1f6';
    ctx.beginPath();
    ctx.ellipse(cx, y - r, r, r * 0.7, 0, Math.PI, 0);
    ctx.fill();
  }
}

export function drawMonarchWorld(ctx: CanvasRenderingContext2D, a: LairArena, view: { x: number; y: number; vw: number; vh: number }, time: number) {
  const k = night;
  for (const dir of [1, -1] as const) {
    const edge = dir > 0 ? a.left + 70 : a.right - 70;
    if (edge < view.x - 260 || edge > view.x + view.vw + 260) continue;
    stalagmite(ctx, edge, a.floor, 150, 38, time, k, dir * 7);
    stalagmite(ctx, edge + dir * 70, a.floor, 82, 24, time, k, dir * 13);
    // a litter of bones and a heap of guano at the foot, the roost's leavings
    ctx.fillStyle = '#1a1230';
    ctx.beginPath();
    ctx.ellipse(edge + dir * 140, a.floor, 40, 9, 0, Math.PI, 0);
    ctx.fill();
    ctx.strokeStyle = '#d9d2c0';
    ctx.lineWidth = 2.4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(edge + dir * 120, a.floor - 2);
    ctx.lineTo(edge + dir * 134, a.floor - 6);
    ctx.moveTo(edge + dir * 150, a.floor - 3);
    ctx.lineTo(edge + dir * 158, a.floor - 8);
    ctx.stroke();
  }
  // a pool of spore-glow in the middle of the floor
  const cx = (a.left + a.right) / 2;
  if (cx > view.x - 500 && cx < view.x + view.vw + 500) stamp(ctx, sporeRgb(k), cx, a.floor - 3, 900, 36, 0.14 + 0.1 * k);
}

// ───────────────────────────── 3. over everything ─────────────────────────────

export function drawMonarchFront(ctx: CanvasRenderingContext2D, v: LairView, time: number) {
  const k = night;
  ctx.save();
  // the walls of the cave close in, a little in the moonlight and a great deal in the dark
  const cx = v.vw / 2;
  const cy = v.vh * 0.58;
  const inner = v.vh * (0.62 - 0.3 * k);
  const outer = Math.max(v.vw, v.vh) * (0.9 - 0.18 * k);
  const vg = ctx.createRadialGradient(cx, cy, inner, cx, cy, outer);
  vg.addColorStop(0, 'rgba(2, 0, 10, 0)');
  vg.addColorStop(1, `rgba(2, 0, 10, ${0.5 + 0.28 * k})`);
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, v.vw, v.vh);

  // spores drifting up
  for (let i = 0; i < 22; i++) {
    const px = (rand(i + 400) * v.vw * 1.2 + Math.sin(time * 0.4 + i) * 20) % (v.vw + 20);
    const py = v.vh - ((rand(i + 410) * v.vh + time * (6 + rand(i) * 9)) % v.vh);
    ctx.fillStyle = `rgba(${sporeRgb(k)}, ${0.3 + 0.2 * Math.sin(time * 1.5 + i)})`;
    ctx.beginPath();
    ctx.arc(px, py, 0.9 + rand(i + 5) * 1.3, 0, Math.PI * 2);
    ctx.fill();
  }

  if (k > 0.03) {
    // shadows of bats crossing the dark, quick and low, and eyes opening at the edges of the light
    for (let i = 0; i < 5; i++) {
      const ph = (time * (0.16 + rand(i + 500) * 0.12) + rand(i + 510)) % 1;
      const dir = i % 2 ? 1 : -1;
      const bx = dir > 0 ? -60 + ph * (v.vw + 120) : v.vw + 60 - ph * (v.vw + 120);
      const by = v.vh * (0.1 + rand(i + 520) * 0.5) + Math.sin(time * 2 + i) * 14;
      const s = 20 + rand(i + 530) * 16;
      const flap = Math.sin(time * 14 + i * 2);
      ctx.save();
      ctx.translate(bx, by);
      ctx.scale(dir, 1);
      ctx.fillStyle = `rgba(0, 0, 6, ${0.5 * k})`;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(-s * 0.4, -s * (0.5 + 0.4 * flap), -s, -s * (0.1 + 0.3 * flap));
      ctx.quadraticCurveTo(-s * 0.6, s * 0.1, -s * 0.5, s * 0.22);
      ctx.quadraticCurveTo(-s * 0.2, s * 0.05, 0, s * 0.2);
      ctx.quadraticCurveTo(s * 0.2, s * 0.05, s * 0.5, s * 0.22);
      ctx.quadraticCurveTo(s * 0.6, s * 0.1, s, -s * (0.1 + 0.3 * flap));
      ctx.quadraticCurveTo(s * 0.4, -s * (0.5 + 0.4 * flap), 0, 0);
      ctx.fill();
      ctx.restore();
    }
    for (let i = 0; i < 12; i++) {
      const ex = (i % 2 ? 0.04 + rand(i + 600) * 0.2 : 0.76 + rand(i + 600) * 0.2) * v.vw;
      const ey = v.vh * (0.08 + rand(i + 610) * 0.7);
      const blink = Math.max(0, Math.sin(time * 0.8 + rand(i + 620) * 9)) ** 0.3;
      ctx.fillStyle = `rgba(255, 70, 96, ${k * 0.8 * blink})`;
      ctx.beginPath();
      ctx.arc(ex, ey, 2.1, 0, Math.PI * 2);
      ctx.arc(ex + 9, ey, 2.1, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}
