/**
 * The Tarantula Queen's lair, part two: everything the hero touches, in the Silk Hollow's own style.
 *   - the floor is hollow-tree loam under a crust of grey silk, with roots through it, pale fungus and a few husks of old meals
 *   - the ledges are gnarled branches wrapped in silk, with a sagging hammock of web under each and dew on the threads; the moving ledge
 *     is a silk sling hung on two strands, with a cocoon swinging under it
 *   - the pillars at the fences are hollow trunks swathed in layers of silk, with shelves of glow-fungus and a cocoon or two
 *   - the climb vine is a thick silk rope with beads of dew and wrapped knots; the swing liana a strand with a cocoon to hold
 *
 * Nothing here changes a box: every shape sits on the platform's own rectangle (top edge = p.y). The fungus glow turns red when the brood
 * hatches (queenBrood in lairQueen.ts).
 */
import type { Platform, TreeStructure, Vine } from './types.ts';
import { drawLairRope, drawLairRopeLine } from './ropeArt.ts';
import { glowRgb, queenBrood } from './lairQueen.ts';
import { rand, stamp } from './lairKit.ts';

interface Cam {
  x: number;
  y: number;
  viewportWidth: number;
  viewportHeight: number;
}

const SILK = '#d7deee';

// ───────────────────────────── the floor ─────────────────────────────

function drawLoamFloor(ctx: CanvasRenderingContext2D, p: Platform, cam: Cam, time: number) {
  const x0 = Math.max(p.x, cam.x - 160);
  const x1 = Math.min(p.x + p.width, cam.x + cam.viewportWidth + 160);
  if (x1 <= x0) return;
  const top = p.y;
  const bottom = cam.y + cam.viewportHeight + 60;
  const k = queenBrood();
  const wob = (x: number, s: number) => Math.sin(x * 0.021 + s) * 2.6 + Math.sin(x * 0.057 + s * 2.1) * 1.8;

  const band = (y0: number, y1: number, s0: number, s1: number, fill: string | CanvasGradient) => {
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.moveTo(x0, y0 + wob(x0, s0));
    for (let x = x0; x <= x1 + 12; x += 12) ctx.lineTo(Math.min(x, x1), y0 + wob(x, s0));
    for (let x = x1; x >= x0 - 12; x -= 12) ctx.lineTo(Math.max(x, x0), y1 + wob(x, s1));
    ctx.closePath();
    ctx.fill();
  };

  const loam = ctx.createLinearGradient(0, top, 0, top + 70);
  loam.addColorStop(0, k > 0.5 ? '#4a2a30' : '#3a3a32');
  loam.addColorStop(1, k > 0.5 ? '#2c161e' : '#201f1c');
  band(top + 4, top + 70, 0, 1, loam);
  const deep = ctx.createLinearGradient(0, top + 64, 0, top + 190);
  deep.addColorStop(0, k > 0.5 ? '#26121a' : '#1a1a18');
  deep.addColorStop(1, k > 0.5 ? '#0e0509' : '#080a09');
  band(top + 64, bottom, 1, 2, deep);

  // roots running through the soil
  ctx.strokeStyle = k > 0.5 ? 'rgba(90, 40, 46, 0.7)' : 'rgba(80, 66, 48, 0.7)';
  ctx.lineWidth = 3.2;
  ctx.lineCap = 'round';
  for (let x = Math.floor(x0 / 150) * 150; x < x1; x += 150) {
    const sd = Math.floor(x / 150);
    const rx = x + rand(sd) * 90;
    ctx.beginPath();
    ctx.moveTo(rx, top + 8);
    ctx.bezierCurveTo(rx + 20, top + 30, rx - 18, top + 52 + rand(sd + 1) * 20, rx + 26, top + 90 + rand(sd + 2) * 40);
    ctx.stroke();
  }
  // stones and pale grubs in the earth
  for (let x = Math.floor(x0 / 70) * 70; x < x1; x += 70) {
    const sd = Math.floor(x / 70);
    ctx.fillStyle = rand(sd + 4) < 0.5 ? 'rgba(0, 0, 0, 0.3)' : 'rgba(210, 214, 226, 0.1)';
    ctx.beginPath();
    ctx.ellipse(x + rand(sd) * 60, top + 40 + rand(sd + 1) * 100, 5 + rand(sd + 2) * 8, 3 + rand(sd + 3) * 4, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // the crust of silk laid over the ground: a pale mat, a bright lip, and threads fanning from it
  const mat = ctx.createLinearGradient(0, top - 3, 0, top + 12);
  mat.addColorStop(0, '#c9d0e2');
  mat.addColorStop(1, '#6f768c');
  ctx.fillStyle = mat;
  ctx.beginPath();
  ctx.moveTo(x0, top - 2 + wob(x0, 7) * 0.4);
  for (let x = x0; x <= x1 + 10; x += 10) ctx.lineTo(Math.min(x, x1), top - 2 + wob(x, 7) * 0.4);
  for (let x = x1; x >= x0 - 10; x -= 10) ctx.lineTo(Math.max(x, x0), top + 10 + wob(x, 8) * 0.5);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(240, 246, 255, 0.55)';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(x0, top - 2 + wob(x0, 7) * 0.4);
  for (let x = x0; x <= x1 + 10; x += 10) ctx.lineTo(Math.min(x, x1), top - 2 + wob(x, 7) * 0.4);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(214, 222, 240, 0.5)';
  ctx.lineWidth = 1.2;
  for (let x = Math.floor(x0 / 34) * 34; x < x1; x += 34) {
    const sd = Math.floor(x / 34);
    const h = 4 + rand(sd + 9) * 8;
    ctx.beginPath();
    ctx.moveTo(x + rand(sd) * 14, top - 1);
    ctx.quadraticCurveTo(x + 8, top - h * 0.7, x + 16 + Math.sin(time * 1.3 + x * 0.05) * 2, top - h);
    ctx.stroke();
  }

  // pale fungus on the ground, glowing
  for (let x = Math.floor(x0 / 210) * 210; x < x1; x += 210) {
    const sd = Math.floor(x / 210);
    const fx = x + 30 + rand(sd + 70) * 150;
    if (fx < x0 || fx > x1) continue;
    stamp(ctx, glowRgb(k), fx, top - 6, 60, 26, 0.5 + 0.2 * Math.sin(time * 1.6 + sd));
    for (let i = 0; i < 3; i++) {
      const cx = fx + (i - 1) * 9;
      const ch = 7 + rand(sd + i + 80) * 8;
      ctx.strokeStyle = '#1b2a26';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(cx, top);
      ctx.lineTo(cx, top - ch);
      ctx.stroke();
      ctx.fillStyle = k > 0.5 ? '#ff6a7e' : '#7cf0d2';
      ctx.beginPath();
      ctx.ellipse(cx, top - ch, 5.6, 3.2, 0, Math.PI, Math.PI * 2);
      ctx.fill();
    }
  }
}

// ───────────────────────────── the ledges ─────────────────────────────

/** dew beads strung on a thread from (x0, y0) to (x1, y1) */
function dew(ctx: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, n: number, time: number, k: number, seed: number) {
  for (let i = 1; i < n; i++) {
    const u = i / n;
    stamp(ctx, glowRgb(k), x0 + (x1 - x0) * u, y0 + (y1 - y0) * u, 8, 8, 0.5 + 0.35 * Math.sin(time * 1.8 + seed + i));
  }
}

function drawSilkBranch(ctx: CanvasRenderingContext2D, p: Platform, time: number) {
  const k = queenBrood();
  const x0 = p.x;
  const x1 = p.x + p.width;
  const top = p.y;
  const bot = p.y + Math.max(p.height, 20);
  const sd = p.id * 11;

  // the hammock sagging under the branch, a sheet of silk with threads to the ends
  ctx.fillStyle = 'rgba(206, 214, 232, 0.34)';
  ctx.strokeStyle = 'rgba(226, 232, 248, 0.6)';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(x0 + 4, bot - 4);
  ctx.quadraticCurveTo((x0 + x1) / 2, bot + 38 + Math.sin(time * 0.9 + sd) * 2, x1 - 4, bot - 4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  for (let i = 1; i < 6; i++) {
    const u = i / 6;
    ctx.beginPath();
    ctx.moveTo(x0 + (x1 - x0) * u, bot - 2);
    ctx.lineTo((x0 + x1) / 2 + ((x1 - x0) * (u - 0.5)) * 0.4, bot + 28 * (1 - Math.abs(u - 0.5) * 1.2));
    ctx.stroke();
  }

  // the branch: dark, knotted wood
  const g = ctx.createLinearGradient(0, top, 0, bot);
  g.addColorStop(0, k > 0.5 ? '#6a3e40' : '#6b5a44');
  g.addColorStop(0.4, k > 0.5 ? '#4a2830' : '#4a3d30');
  g.addColorStop(1, '#1c1512');
  ctx.fillStyle = g;
  ctx.strokeStyle = '#0c0a09';
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.roundRect(x0, top, p.width, bot - top, 8);
  ctx.fill();
  ctx.stroke();
  // grain and knots
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.lineWidth = 1.4;
  for (let i = 0; i < 3; i++) {
    const gy = top + (bot - top) * (0.28 + i * 0.22);
    ctx.beginPath();
    ctx.moveTo(x0 + 8, gy);
    ctx.quadraticCurveTo((x0 + x1) / 2, gy + (rand(sd + i) - 0.5) * 6, x1 - 8, gy);
    ctx.stroke();
  }
  // bands of silk wrapped round the branch
  ctx.strokeStyle = 'rgba(226, 232, 248, 0.85)';
  ctx.lineWidth = 2.2;
  const bands = Math.max(3, Math.floor(p.width / 46));
  for (let i = 0; i < bands; i++) {
    const bx = x0 + 14 + (i + rand(sd + i + 5) * 0.6) * ((p.width - 28) / bands);
    for (let w = 0; w < 3; w++) {
      ctx.beginPath();
      ctx.moveTo(bx + w * 4, top);
      ctx.lineTo(bx + w * 4 - 5, bot);
      ctx.stroke();
    }
  }
  // the lip of silk along the top, where the hero stands, and a few loose threads
  ctx.strokeStyle = 'rgba(236, 242, 255, 0.7)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x0 + 4, top + 1);
  ctx.lineTo(x1 - 4, top + 1);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(214, 222, 240, 0.55)';
  ctx.lineWidth = 1.2;
  for (let x = x0 + 8; x < x1 - 6; x += 20) {
    const sdg = Math.floor(x / 20) + sd;
    ctx.beginPath();
    ctx.moveTo(x, top);
    ctx.lineTo(x + 3 + Math.sin(time * 1.4 + x * 0.06) * 2, top - 4 - rand(sdg) * 5);
    ctx.stroke();
  }
  dew(ctx, x0, bot + 6, x1, bot + 6, Math.floor(p.width / 28), time, k, sd);
  // a thread up from each end to the roof of the hollow
  ctx.strokeStyle = 'rgba(214, 222, 240, 0.35)';
  ctx.lineWidth = 1.4;
  for (const ax of [x0 + 10, x1 - 10]) {
    ctx.beginPath();
    ctx.moveTo(ax, top + 2);
    ctx.lineTo(ax + (rand(sd + ax) - 0.5) * 20, top - 120);
    ctx.stroke();
  }
}

/** a moving ledge is a silk sling on two strands, a cocoon swinging beneath */
function drawSilkSling(ctx: CanvasRenderingContext2D, p: Platform, cam: Cam, time: number) {
  const k = queenBrood();
  ctx.strokeStyle = 'rgba(214, 222, 240, 0.85)';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  for (const rx of [p.x + 14, p.x + p.width - 14]) {
    ctx.beginPath();
    ctx.moveTo(rx, p.y + 3);
    ctx.lineTo(rx, cam.y - 30);
    ctx.stroke();
  }
  const top = p.y;
  const bot = p.y + Math.max(p.height, 20);
  // the sling: a wrapped plank of silk
  const g = ctx.createLinearGradient(0, top, 0, bot);
  g.addColorStop(0, '#dfe5f4');
  g.addColorStop(1, '#8a92aa');
  ctx.fillStyle = g;
  ctx.strokeStyle = '#1a1d2a';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.roundRect(p.x, top, p.width, bot - top, 9);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = 'rgba(30, 34, 52, 0.4)';
  ctx.lineWidth = 1.4;
  for (let x = p.x + 18; x < p.x + p.width - 6; x += 18) {
    ctx.beginPath();
    ctx.moveTo(x, top + 3);
    ctx.lineTo(x - 5, bot - 2);
    ctx.stroke();
  }
  // a cocoon swinging beneath
  const sw = Math.sin(time * 1.5 + p.id) * 5;
  const cx = p.x + p.width / 2;
  ctx.strokeStyle = 'rgba(214, 222, 240, 0.7)';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(cx, bot - 2);
  ctx.lineTo(cx + sw * 0.5, bot + 22);
  ctx.stroke();
  ctx.fillStyle = '#aeb6cc';
  ctx.strokeStyle = '#1a1d2a';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.ellipse(cx + sw, bot + 40, 10, 19, sw * 0.03, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  stamp(ctx, glowRgb(k), cx + sw, bot + 40, 40, 52, 0.25 + 0.15 * Math.sin(time * 2.4 + p.id));
}

// ───────────────────────────── the trunks at the fences ─────────────────────────────

function drawTrunk(ctx: CanvasRenderingContext2D, t: TreeStructure, cam: Cam, time: number) {
  const k = queenBrood();
  const top = cam.y - 40;
  const bottom = t.groundY + 4;
  const half = 44;
  ctx.save();
  const g = ctx.createLinearGradient(t.x - half, 0, t.x + half, 0);
  g.addColorStop(0, '#0f0d0c');
  g.addColorStop(0.5, k > 0.5 ? '#4a2a2e' : '#3e362c');
  g.addColorStop(1, '#14110f');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(t.x - half * 0.74, top);
  ctx.lineTo(t.x + half * 0.74, top);
  for (let y = top; y <= bottom; y += 40) ctx.lineTo(t.x + half * (0.8 + 0.1 * Math.sin(y * 0.012 + t.id)) + (y > bottom - 100 ? (y - (bottom - 100)) * 0.22 : 0), y);
  ctx.lineTo(t.x + half * 1.25, bottom);
  ctx.lineTo(t.x - half * 1.25, bottom);
  for (let y = bottom; y >= top; y -= 40) ctx.lineTo(t.x - half * (0.8 + 0.1 * Math.sin(y * 0.013 + t.id * 2)) - (y > bottom - 100 ? (y - (bottom - 100)) * 0.22 : 0), y);
  ctx.closePath();
  ctx.fill();
  // bark furrows
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.lineWidth = 2.2;
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.moveTo(t.x + i * 14, top);
    for (let y = top; y <= bottom; y += 50) ctx.lineTo(t.x + i * 14 + Math.sin(y * 0.02 + i + t.id) * 4, y);
    ctx.stroke();
  }
  // layers of silk swathed round the trunk, in loose bands, with hanging loops
  for (let y = Math.floor(top / 90) * 90 + 40; y < bottom - 30; y += 90) {
    const sd = Math.floor(y / 90) + t.id;
    const gy = y + rand(sd) * 20;
    ctx.fillStyle = 'rgba(204, 212, 232, 0.55)';
    ctx.strokeStyle = 'rgba(236, 242, 255, 0.7)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(t.x - half * 1.05, gy);
    ctx.quadraticCurveTo(t.x, gy + 20, t.x + half * 1.05, gy + 4);
    ctx.lineTo(t.x + half * 1.05, gy + 20);
    ctx.quadraticCurveTo(t.x, gy + 36, t.x - half * 1.05, gy + 16);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  // a shelf of glow-fungus up the trunk
  for (let i = 0; i < 3; i++) {
    const fy = bottom - 150 - i * 170;
    if (fy < top + 40) continue;
    const side = i % 2 ? -1 : 1;
    const fx = t.x + side * half * 0.8;
    stamp(ctx, glowRgb(k), fx + side * 8, fy, 70, 40, 0.55 + 0.2 * Math.sin(time * 1.5 + i + t.id));
    ctx.fillStyle = k > 0.5 ? '#ff6a7e' : '#7cf0d2';
    ctx.strokeStyle = '#102019';
    ctx.lineWidth = 1.6;
    for (let s = 0; s < 3; s++) {
      ctx.beginPath();
      ctx.ellipse(fx + side * (6 + s * 8), fy + s * 5, 11 - s * 2, 4.4, side * 0.2, Math.PI, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }
  // a cocoon hung from the trunk, swaying
  const cy = Math.max(top + 90, bottom - 420);
  const sw = Math.sin(time * 0.9 + t.id) * 4;
  ctx.strokeStyle = 'rgba(214, 222, 240, 0.65)';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(t.x + half * 0.7, cy);
  ctx.lineTo(t.x + half * 0.7 + sw, cy + 46);
  ctx.stroke();
  ctx.fillStyle = '#aeb6cc';
  ctx.strokeStyle = '#161a26';
  ctx.beginPath();
  ctx.ellipse(t.x + half * 0.7 + sw, cy + 76, 12, 30, sw * 0.03, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  stamp(ctx, glowRgb(k), t.x + half * 0.7 + sw, cy + 76, 50, 76, 0.28);
  // roots splaying at the foot
  ctx.strokeStyle = '#1c1512';
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(t.x + s * half * 0.9, t.groundY - 40);
    ctx.quadraticCurveTo(t.x + s * half * 1.3, t.groundY - 6, t.x + s * half * 1.9, t.groundY + 2);
    ctx.stroke();
  }
  ctx.restore();
}

// ───────────────────────────── silk ropes (vines) ─────────────────────────────

function ropeCurve(v: Vine, time: number, calm: boolean) {
  const len = v.bottomY - v.topY;
  const swinging = v.isSwingingVine && v.swingAngle !== undefined;
  const ang = swinging ? v.swingAngle || 0 : Math.sin(time * v.swaySpeed + v.swayPhase) * (calm ? 0.02 : 0.1);
  const tipX = v.x + Math.sin(ang) * len;
  const tipY = v.topY + Math.cos(ang) * len;
  const midX = (v.x + tipX) * 0.5 + Math.sin(ang * 0.5) * 12;
  const midY = (v.topY + tipY) * 0.5;
  const at = (u: number) => ({
    x: (1 - u) * (1 - u) * v.x + 2 * (1 - u) * u * midX + u * u * tipX,
    y: (1 - u) * (1 - u) * v.topY + 2 * (1 - u) * u * midY + u * u * tipY,
  });
  return { at, tipX, tipY, len, ang };
}

function trace(ctx: CanvasRenderingContext2D, at: (u: number) => { x: number; y: number }, N: number) {
  ctx.beginPath();
  for (let i = 0; i <= N; i++) {
    const p = at(i / N);
    if (i === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  }
}

function drawSilkRope(ctx: CanvasRenderingContext2D, v: Vine, cam: Cam, time: number) {
  const k = queenBrood();
  const swing = v.vineType === 'swing_liana';
  const { at, tipX, tipY, len, ang } = ropeCurve(v, time, !swing);
  const N = Math.max(14, Math.floor(len / 10));
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  if (swing) {
    drawLairRopeLine(ctx, v.x, v.topY, v.x, cam.y - 30, 6, '#e4e6f4', SILK);
  }
  ctx.strokeStyle = 'rgba(214, 222, 240, 0.12)';
  ctx.lineWidth = 20;
  trace(ctx, at, N);
  ctx.stroke();
  drawLairRope(ctx, at, N, 9.5, '#f0f2ff', SILK);
  // wrapped knots, so a climbing rope reads as something to grab, and dew
  for (let i = 2; i < N - 1; i += swing ? 7 : 4) {
    const p = at(i / N);
    ctx.fillStyle = '#c3cadf';
    ctx.strokeStyle = '#1a1d2a';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, 6, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    if (i % 8 === 2) stamp(ctx, glowRgb(k), p.x + 6, p.y - 4, 8, 8, 0.7);
  }
  if (swing) {
    // a small cocoon to hold, with the thread wrapped round it
    ctx.save();
    ctx.translate(tipX, tipY);
    ctx.rotate(-ang);
    ctx.fillStyle = '#c3cadf';
    ctx.strokeStyle = '#1a1d2a';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.ellipse(0, 14, 10, 17, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = 'rgba(30, 34, 52, 0.45)';
    ctx.lineWidth = 1.2;
    for (let b = -1; b <= 1; b++) {
      ctx.beginPath();
      ctx.ellipse(0, 14 + b * 6, 9, 2.4, 0, 0, Math.PI);
      ctx.stroke();
    }
    ctx.restore();
  }
  ctx.restore();
}

// ───────────────────────────── entry ─────────────────────────────

export function drawQueenObjects(ctx: CanvasRenderingContext2D, platforms: Platform[], vines: Vine[], trees: TreeStructure[], cam: Cam, time: number) {
  const left = cam.x - 200;
  const right = cam.x + cam.viewportWidth + 200;

  for (const t of trees) {
    if (t.x + 130 < left || t.x - 130 > right) continue;
    drawTrunk(ctx, t, cam, time);
  }
  for (const v of vines) {
    if (v.x < left || v.x > right || v.vineType === 'swing_liana') continue;
    drawSilkRope(ctx, v, cam, time);
  }
  for (const p of platforms) {
    if (p.height >= 50 && !p.broken) {
      ctx.save();
      drawLoamFloor(ctx, p, cam, time);
      ctx.restore();
    }
  }
  for (const p of platforms) {
    if (p.height >= 50 || p.broken || p.x + p.width < left - 200 || p.x > right + 200) continue;
    ctx.save();
    if (p.type === 'moving') drawSilkSling(ctx, p, cam, time);
    else drawSilkBranch(ctx, p, time);
    ctx.restore();
  }
  for (const v of vines) {
    if (v.vineType !== 'swing_liana' || v.x < left || v.x > right) continue;
    drawSilkRope(ctx, v, cam, time);
  }
}
