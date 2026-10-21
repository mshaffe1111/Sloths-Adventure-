/**
 * The Marsh Reaver's lair, part two: everything the hero touches, in the Blackwater Roost's own style.
 *   - the floor is the Reaver's dock: grey, rotten planks over black peat, with reeds and a lip of slime where the boards meet the mud
 *   - the ledges are rafts of lashed logs on stilts with a drying rack of fish and nets; the moving ledge is a plank crate hung from two
 *     ropes with a lantern on it
 *   - the pillars at the fences are totem poles: stacked, carved faces with painted eyes and a crown of spears and bones
 *   - the climb vine is a thick reed-rope with knots and trailing moss, the swing liana a rope with a bone hook to hold
 *
 * Nothing here changes a box: every shape sits on the platform's own rectangle (top edge = p.y). The wood warms to ember in the war
 * (reaverWar in lairReaver.ts).
 */
import type { Platform, TreeStructure, Vine } from './types.ts';
import { lampRgb, mix, reaverWar } from './lairReaver.ts';
import { rand, stamp } from './lairKit.ts';

interface Cam {
  x: number;
  y: number;
  viewportWidth: number;
  viewportHeight: number;
}

/** a wood colour, a little warmer in the war */
function wood(c: [number, number, number], k: number): string {
  return mix(c, [Math.min(255, c[0] * 1.5 + 30), c[1] * 0.85, c[2] * 0.7], k * 0.55);
}

// ───────────────────────────── the dock ─────────────────────────────

function drawDock(ctx: CanvasRenderingContext2D, p: Platform, cam: Cam, time: number) {
  const x0 = Math.max(p.x, cam.x - 160);
  const x1 = Math.min(p.x + p.width, cam.x + cam.viewportWidth + 160);
  if (x1 <= x0) return;
  const top = p.y;
  const bottom = cam.y + cam.viewportHeight + 60;
  const k = reaverWar();

  // peat and black water under the boards
  const peat = ctx.createLinearGradient(0, top, 0, bottom);
  peat.addColorStop(0, mix([40, 34, 28], [58, 30, 22], k));
  peat.addColorStop(0.3, mix([22, 20, 18], [30, 16, 12], k));
  peat.addColorStop(1, '#06080a');
  ctx.fillStyle = peat;
  ctx.fillRect(x0, top + 22, x1 - x0, bottom - top);
  ctx.strokeStyle = 'rgba(120, 130, 110, 0.14)';
  ctx.lineWidth = 1.5;
  for (let y = 54; y < 220; y += 34) {
    ctx.beginPath();
    for (let x = x0; x <= x1 + 14; x += 14) {
      const px = Math.min(x, x1);
      const yy = top + y + Math.sin(px * 0.03 + y + time * 0.6) * 2.4;
      if (x === x0) ctx.moveTo(px, yy);
      else ctx.lineTo(px, yy);
    }
    ctx.stroke();
  }
  // stilts under the dock, going down into the dark
  ctx.fillStyle = wood([34, 28, 22], k);
  for (let x = Math.floor(x0 / 120) * 120; x < x1; x += 120) {
    const sd = Math.floor(x / 120);
    const sx = x + 30 + rand(sd) * 40;
    ctx.fillRect(sx, top + 22, 14, 90 + rand(sd + 1) * 60);
  }

  // the planks: weathered boards in a long run with dark gaps, each a slightly different grey-brown
  const boardH = 22;
  const boardW = 68;
  for (let x = Math.floor(x0 / boardW) * boardW - boardW; x < x1; x += boardW) {
    const sd = Math.floor(x / boardW);
    const bx = Math.max(x, x0);
    const bw = Math.min(x + boardW - 3, x1) - bx;
    if (bw <= 0) continue;
    const g = ctx.createLinearGradient(0, top, 0, top + boardH);
    const tone = rand(sd + 3);
    g.addColorStop(0, wood([142 + tone * 30, 132 + tone * 26, 112 + tone * 20], k));
    g.addColorStop(1, wood([82 + tone * 18, 74 + tone * 16, 62 + tone * 12], k));
    ctx.fillStyle = g;
    ctx.fillRect(bx, top, bw, boardH);
    // grain and a knot, a nail at each end
    ctx.strokeStyle = 'rgba(30, 24, 16, 0.4)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(bx + 4, top + 8 + rand(sd + 9) * 5);
    ctx.lineTo(bx + bw - 4, top + 8 + rand(sd + 10) * 5);
    ctx.stroke();
    ctx.fillStyle = 'rgba(20, 16, 12, 0.7)';
    ctx.fillRect(bx + 5, top + 5, 2.6, 2.6);
    ctx.fillRect(bx + bw - 8, top + 5, 2.6, 2.6);
    // some boards are green with slime along the top edge
    if (rand(sd + 20) < 0.4) {
      ctx.fillStyle = 'rgba(96, 130, 70, 0.55)';
      ctx.fillRect(bx, top, bw, 3.4);
    }
  }
  // the lit edge on top, and a gap-shadow under the boards
  ctx.strokeStyle = `rgba(230, 226, 200, ${0.4 - 0.15 * k})`;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(x0, top + 0.9);
  ctx.lineTo(x1, top + 0.9);
  ctx.stroke();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(x0, top + boardH, x1 - x0, 5);

  // reeds growing through the gaps and a bone or two on the boards
  ctx.strokeStyle = mix([86, 112, 66], [120, 90, 50], k);
  ctx.lineWidth = 2.2;
  ctx.lineCap = 'round';
  for (let x = Math.floor(x0 / 54) * 54; x < x1; x += 54) {
    const sd = Math.floor(x / 54);
    if (rand(sd + 30) < 0.45) continue;
    const rx = x + rand(sd) * 40;
    const sway = Math.sin(time * 1.6 + rx * 0.05) * 3;
    for (let r = 0; r < 3; r++) {
      ctx.beginPath();
      ctx.moveTo(rx + r * 3, top);
      ctx.quadraticCurveTo(rx + r * 3 + sway * 0.5, top - 8, rx + r * 3 + 2 + sway, top - 12 - rand(sd + r) * 10);
      ctx.stroke();
    }
  }
  ctx.strokeStyle = '#e4dfc8';
  ctx.lineWidth = 3;
  for (let x = Math.floor(x0 / 340) * 340; x < x1; x += 340) {
    const sd = Math.floor(x / 340);
    const bx = x + 60 + rand(sd + 50) * 220;
    if (bx < x0 || bx > x1) continue;
    ctx.beginPath();
    ctx.moveTo(bx, top - 2);
    ctx.lineTo(bx + 14, top - 4);
    ctx.stroke();
  }
}

// ───────────────────────────── the ledges ─────────────────────────────

function drawLogRaft(ctx: CanvasRenderingContext2D, p: Platform, time: number) {
  const k = reaverWar();
  const x0 = p.x;
  const x1 = p.x + p.width;
  const top = p.y;
  const bot = p.y + Math.max(p.height, 22);
  const sd = p.id * 17;

  // stilts under each end
  ctx.fillStyle = wood([36, 28, 20], k);
  for (const sx of [x0 + 18, x1 - 30]) ctx.fillRect(sx, bot - 2, 12, 64);

  // two courses of logs lashed together: the top log is the standing surface
  const rows = 2;
  const rh = (bot - top) / rows;
  for (let r = 0; r < rows; r++) {
    const y = top + r * rh;
    const g = ctx.createLinearGradient(0, y, 0, y + rh);
    g.addColorStop(0, wood(r ? [96, 80, 60] : [150, 130, 98], k));
    g.addColorStop(1, wood(r ? [60, 48, 36] : [96, 80, 60], k));
    ctx.fillStyle = g;
    ctx.strokeStyle = '#160f08';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.roundRect(x0 + r * 5, y, p.width - r * 10, rh, rh / 2.4);
    ctx.fill();
    ctx.stroke();
    // ring marks at the log ends and a split in the bark
    ctx.strokeStyle = 'rgba(30, 20, 10, 0.45)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.ellipse(x0 + r * 5 + rh / 2.4, y + rh / 2, rh * 0.18, rh * 0.28, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x0 + 24, y + rh * (0.35 + rand(sd + r) * 0.3));
    ctx.lineTo(x1 - 24, y + rh * (0.4 + rand(sd + r + 5) * 0.3));
    ctx.stroke();
  }
  // lashings of reed-rope round the logs
  ctx.strokeStyle = '#b3a06a';
  ctx.lineWidth = 3;
  for (const lx of [x0 + 28, (x0 + x1) / 2, x1 - 28]) {
    for (let w = 0; w < 3; w++) {
      ctx.beginPath();
      ctx.moveTo(lx + w * 4 - 4, top + 1);
      ctx.lineTo(lx + w * 4 + 3, bot - 1);
      ctx.stroke();
    }
  }
  // a lit edge on top and slime along it
  ctx.strokeStyle = `rgba(235, 230, 205, ${0.45 - 0.2 * k})`;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(x0 + 8, top + 1.2);
  ctx.lineTo(x1 - 8, top + 1.2);
  ctx.stroke();
  ctx.fillStyle = 'rgba(96, 130, 70, 0.5)';
  ctx.fillRect(x0 + 10, top + 1, p.width * 0.4, 3);

  // a drying rack of fish hung under the raft, swinging
  const hang = rand(sd + 40) < 0.5 ? x0 + 40 : x1 - 40;
  const sw = Math.sin(time * 1.4 + sd) * 3;
  ctx.strokeStyle = '#2c2014';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(hang, bot - 2);
  ctx.lineTo(hang + sw * 0.5, bot + 16);
  ctx.stroke();
  for (let i = -1; i <= 1; i++) {
    ctx.fillStyle = i % 2 ? '#8fa6a8' : '#a9b7b0';
    ctx.beginPath();
    ctx.ellipse(hang + i * 10 + sw, bot + 30 + Math.abs(i) * 3, 3.6, 12, sw * 0.04, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** a moving ledge is a crate of planks hung from two ropes, a lantern swinging from its corner */
function drawHungCrate(ctx: CanvasRenderingContext2D, p: Platform, cam: Cam, time: number) {
  const k = reaverWar();
  ctx.strokeStyle = '#2a1e12';
  ctx.lineWidth = 4.4;
  ctx.lineCap = 'round';
  for (const rx of [p.x + 14, p.x + p.width - 14]) {
    ctx.beginPath();
    ctx.moveTo(rx, p.y + 4);
    ctx.lineTo(rx, cam.y - 30);
    ctx.stroke();
    ctx.strokeStyle = '#b3a06a';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 7]);
    ctx.beginPath();
    ctx.moveTo(rx, p.y + 4);
    ctx.lineTo(rx, cam.y - 30);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.strokeStyle = '#2a1e12';
    ctx.lineWidth = 4.4;
  }
  const top = p.y;
  const bot = p.y + Math.max(p.height, 22);
  const g = ctx.createLinearGradient(0, top, 0, bot);
  g.addColorStop(0, wood([140, 118, 84], k));
  g.addColorStop(1, wood([78, 62, 44], k));
  ctx.fillStyle = g;
  ctx.strokeStyle = '#160f08';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.roundRect(p.x, top, p.width, bot - top, 4);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = 'rgba(30, 20, 10, 0.5)';
  ctx.lineWidth = 1.6;
  for (let x = p.x + 30; x < p.x + p.width - 8; x += 30) {
    ctx.beginPath();
    ctx.moveTo(x, top + 2);
    ctx.lineTo(x, bot - 2);
    ctx.stroke();
  }
  ctx.strokeStyle = '#3a2a1a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(p.x + 2, top + 5);
  ctx.lineTo(p.x + p.width - 2, bot - 5);
  ctx.stroke();
  ctx.strokeStyle = `rgba(235, 230, 205, ${0.4 - 0.2 * k})`;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(p.x + 4, top + 1.2);
  ctx.lineTo(p.x + p.width - 4, top + 1.2);
  ctx.stroke();
  // a lantern swinging off one corner
  const sw = Math.sin(time * 1.7 + p.id) * 4;
  const lx = p.x + p.width - 10;
  ctx.strokeStyle = '#2a1e12';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(lx, bot - 2);
  ctx.lineTo(lx + sw * 0.5, bot + 16);
  ctx.stroke();
  stamp(ctx, lampRgb(k), lx + sw, bot + 26, 46, 46, 0.7 + 0.15 * Math.sin(time * 6 + p.id));
  ctx.fillStyle = k > 0.5 ? '#ff9a4a' : '#ffd27a';
  ctx.strokeStyle = '#2a1e12';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.roundRect(lx + sw - 6, bot + 18, 12, 16, 3);
  ctx.fill();
  ctx.stroke();
}

// ───────────────────────────── totem poles (the pillars at the fences) ─────────────────────────────

function drawTotem(ctx: CanvasRenderingContext2D, t: TreeStructure, cam: Cam, time: number) {
  const k = reaverWar();
  const top = cam.y - 40;
  const bottom = t.groundY + 4;
  const half = 40;
  ctx.save();
  const g = ctx.createLinearGradient(t.x - half, 0, t.x + half, 0);
  g.addColorStop(0, wood([30, 24, 18], k));
  g.addColorStop(0.5, wood([96, 78, 56], k));
  g.addColorStop(1, wood([36, 28, 20], k));
  ctx.fillStyle = g;
  ctx.fillRect(t.x - half, top, half * 2, bottom - top);
  ctx.strokeStyle = '#120c06';
  ctx.lineWidth = 2.6;
  ctx.strokeRect(t.x - half, top, half * 2, bottom - top);

  // carved faces stacked up the pole, every 150 px, each with painted eyes that catch the light
  const step = 150;
  for (let y = Math.floor((bottom - 120) / step) * step; y > top + 40; y -= step) {
    const sd = Math.floor(y / step) + t.id * 3;
    const cy = y - ((bottom - 120) % step);
    const fy = Math.min(bottom - 100, cy);
    if (fy < top + 40) continue;
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    ctx.fillRect(t.x - half + 5, fy - 44, half * 2 - 10, 88);
    // brow, eyes, a wide mouth with teeth
    ctx.fillStyle = '#d9cfae';
    ctx.strokeStyle = '#120c06';
    ctx.lineWidth = 2;
    for (const dx of [-14, 14]) {
      ctx.beginPath();
      ctx.ellipse(t.x + dx, fy - 14, 9, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    ctx.fillStyle = rand(sd) < 0.5 ? '#c0392b' : '#2f8f9d';
    for (const dx of [-14, 14]) {
      ctx.beginPath();
      ctx.arc(t.x + dx + 1, fy - 14, 3.6, 0, Math.PI * 2);
      ctx.fill();
    }
    stamp(ctx, lampRgb(k), t.x, fy - 14, 70, 26, 0.18 + 0.12 * k);
    ctx.fillStyle = '#120c06';
    ctx.beginPath();
    ctx.roundRect(t.x - 20, fy + 8, 40, 18, 5);
    ctx.fill();
    ctx.fillStyle = '#ece4c6';
    for (let i = -3; i <= 3; i++) ctx.fillRect(t.x + i * 5.4 - 1.6, fy + 8, 3.2, 6);
    // a brow ridge scored across
    ctx.strokeStyle = 'rgba(0,0,0,0.6)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(t.x - 26, fy - 28);
    ctx.lineTo(t.x - 4, fy - 22);
    ctx.moveTo(t.x + 26, fy - 28);
    ctx.lineTo(t.x + 4, fy - 22);
    ctx.stroke();
  }
  // bands of lashing, and a crown of spears and bones at the top of the view
  ctx.strokeStyle = '#b3a06a';
  ctx.lineWidth = 3;
  for (let y = Math.floor(top / 110) * 110 + 30; y < bottom - 20; y += 110) {
    ctx.beginPath();
    ctx.moveTo(t.x - half, y);
    ctx.lineTo(t.x + half, y + 6);
    ctx.stroke();
  }
  // a rope of fish bones hanging at one side
  const sw = Math.sin(time * 1.3 + t.id) * 4;
  const hy = Math.max(top + 100, bottom - 330);
  ctx.strokeStyle = '#2a1e12';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(t.x + half, hy);
  ctx.lineTo(t.x + half + 10 + sw * 0.4, hy + 38);
  ctx.stroke();
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = '#e4dfc8';
    ctx.beginPath();
    ctx.ellipse(t.x + half + 10 + sw * 0.5, hy + 44 + i * 16, 2.6, 7, sw * 0.04, 0, Math.PI * 2);
    ctx.fill();
  }
  // roots and reeds at the foot
  ctx.strokeStyle = mix([86, 112, 66], [120, 90, 50], k);
  ctx.lineWidth = 2.4;
  ctx.lineCap = 'round';
  for (let i = -5; i <= 5; i++) {
    ctx.beginPath();
    ctx.moveTo(t.x + i * 9, t.groundY + 2);
    ctx.quadraticCurveTo(t.x + i * 9 + 3, t.groundY - 8, t.x + i * 9 + 8 + Math.sin(time * 1.8 + i) * 3, t.groundY - 14 - rand(i + t.id) * 10);
    ctx.stroke();
  }
  ctx.restore();
}

// ───────────────────────────── reed ropes (vines) ─────────────────────────────

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

function drawReedRope(ctx: CanvasRenderingContext2D, v: Vine, cam: Cam, time: number) {
  const k = reaverWar();
  const swing = v.vineType === 'swing_liana';
  const { at, tipX, tipY, len, ang } = ropeCurve(v, time, !swing);
  const N = Math.max(14, Math.floor(len / 10));
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  if (swing) {
    ctx.strokeStyle = '#1a120a';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(v.x, v.topY);
    ctx.lineTo(v.x, cam.y - 30);
    ctx.stroke();
    ctx.strokeStyle = '#a89560';
    ctx.lineWidth = 4.4;
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(200, 220, 190, 0.1)';
  ctx.lineWidth = 20;
  trace(ctx, at, N);
  ctx.stroke();
  ctx.strokeStyle = '#1a120a';
  ctx.lineWidth = 9.5;
  trace(ctx, at, N);
  ctx.stroke();
  ctx.strokeStyle = mix([168, 150, 98], [190, 130, 76], k);
  ctx.lineWidth = 6;
  trace(ctx, at, N);
  ctx.stroke();
  ctx.strokeStyle = '#5a4a28';
  ctx.lineWidth = 1.8;
  ctx.setLineDash([4, 6]);
  trace(ctx, at, N);
  ctx.stroke();
  ctx.setLineDash([]);
  // knots and trailing moss
  for (let i = 2; i < N - 1; i += swing ? 7 : 4) {
    const p = at(i / N);
    ctx.fillStyle = '#c8b57a';
    ctx.strokeStyle = '#1a120a';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    if (i % 8 === 2) {
      ctx.strokeStyle = mix([70, 100, 60], [100, 80, 44], k);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(p.x + 4, p.y);
      ctx.quadraticCurveTo(p.x + 12 + Math.sin(time * 1.5 + i) * 3, p.y + 10, p.x + 8, p.y + 20);
      ctx.stroke();
    }
  }
  if (swing) {
    // a curved bone hook to hold
    ctx.save();
    ctx.translate(tipX, tipY);
    ctx.rotate(-ang);
    ctx.strokeStyle = '#1a120a';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(0, 12, 11, Math.PI * 0.1, Math.PI * 1.1);
    ctx.stroke();
    ctx.strokeStyle = '#ece4c6';
    ctx.lineWidth = 4.6;
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}

// ───────────────────────────── entry ─────────────────────────────

export function drawReaverObjects(ctx: CanvasRenderingContext2D, platforms: Platform[], vines: Vine[], trees: TreeStructure[], cam: Cam, time: number) {
  const left = cam.x - 200;
  const right = cam.x + cam.viewportWidth + 200;

  for (const t of trees) {
    if (t.x + 130 < left || t.x - 130 > right) continue;
    drawTotem(ctx, t, cam, time);
  }
  for (const v of vines) {
    if (v.x < left || v.x > right || v.vineType === 'swing_liana') continue;
    drawReedRope(ctx, v, cam, time);
  }
  for (const p of platforms) {
    if (p.height >= 50 && !p.broken) {
      ctx.save();
      drawDock(ctx, p, cam, time);
      ctx.restore();
    }
  }
  for (const p of platforms) {
    if (p.height >= 50 || p.broken || p.x + p.width < left - 200 || p.x > right + 200) continue;
    ctx.save();
    if (p.type === 'moving') drawHungCrate(ctx, p, cam, time);
    else drawLogRaft(ctx, p, time);
    ctx.restore();
  }
  for (const v of vines) {
    if (v.vineType !== 'swing_liana' || v.x < left || v.x > right) continue;
    drawReedRope(ctx, v, cam, time);
  }
}
