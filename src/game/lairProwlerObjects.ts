/**
 * The Shadow Prowler's lair, part two: everything the hero touches, in the Glowcap Sinkhole's own style.
 *   - the floor is a cut-away of the cave floor: a skin of glowing moss, dark soil threaded with pale mycelium, bands of grey stone
 *     and then black rock, with little mushrooms along the top
 *   - the ledges are stone slabs furred with moss, glowcaps on top and stalactites underneath
 *   - the wall trunks are columns of dark root-wood with veins that pulse; the climb vine is a knotted root, the swing liana a hanging
 *     root with a glowing bulb to hold
 *
 * Nothing here changes a box: every shape sits on the platform's own rectangle (top edge = p.y). The mushrooms dim with the rest of
 * the cave when the lights go out (prowlerGlow in lairProwler.ts).
 */
import type { Platform, TreeStructure, Vine } from './types.ts';
import { CAP_COLORS, glowcap, prowlerGlow, stampGlow } from './lairProwler.ts';

interface Cam {
  x: number;
  y: number;
  viewportWidth: number;
  viewportHeight: number;
}

function rand(i: number): number {
  const s = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}

// ───────────────────────────── the floor ─────────────────────────────

function drawCaveFloor(ctx: CanvasRenderingContext2D, p: Platform, cam: Cam, time: number) {
  const x0 = Math.max(p.x, cam.x - 160);
  const x1 = Math.min(p.x + p.width, cam.x + cam.viewportWidth + 160);
  if (x1 <= x0) return;
  const top = p.y;
  const bottom = cam.y + cam.viewportHeight + 60;
  const glow = prowlerGlow();
  const wob = (x: number, k: number) => Math.sin(x * 0.021 + k) * 3 + Math.sin(x * 0.057 + k * 2.1) * 2;

  const band = (y0: number, y1: number, k0: number, k1: number, fill: string | CanvasGradient) => {
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.moveTo(x0, y0 + wob(x0, k0));
    for (let x = x0; x <= x1 + 12; x += 12) ctx.lineTo(Math.min(x, x1), y0 + wob(x, k0));
    for (let x = x1; x >= x0 - 12; x -= 12) ctx.lineTo(Math.max(x, x0), y1 + wob(x, k1));
    ctx.closePath();
    ctx.fill();
  };

  const soil = ctx.createLinearGradient(0, top, 0, top + 56);
  soil.addColorStop(0, '#2a4338');
  soil.addColorStop(1, '#16271f');
  band(top + 4, top + 56, 0, 1, soil);
  const stone = ctx.createLinearGradient(0, top + 52, 0, top + 120);
  stone.addColorStop(0, '#3b4c52');
  stone.addColorStop(1, '#1b2a31');
  band(top + 52, top + 120, 1, 2, stone);
  const deep = ctx.createLinearGradient(0, top + 116, 0, top + 190);
  deep.addColorStop(0, '#0f1b22');
  deep.addColorStop(1, '#050c10');
  band(top + 116, bottom, 2, 3, deep);

  // pale mycelium threading the soil, glowing a little
  ctx.lineCap = 'round';
  for (let i = 0; i < 9; i++) {
    const span = Math.max(1, x1 - x0);
    const sx = x0 + ((rand(i + Math.floor(p.id) * 5) * 997 + i * 133) % span);
    const sy = top + 14 + rand(i + 3) * 36;
    const col = CAP_COLORS[i % 4];
    ctx.strokeStyle = col;
    ctx.globalAlpha = (0.12 + 0.2 * glow) * (0.7 + 0.3 * Math.sin(time * 1.1 + i));
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.bezierCurveTo(sx + 30, sy + 10, sx + 50, sy - 8, sx + 90, sy + 6);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // stones and gravel in the strata
  for (let x = Math.floor(x0 / 70) * 70; x < x1; x += 70) {
    const sd = Math.floor(x / 70);
    const sx = x + rand(sd) * 60;
    ctx.fillStyle = rand(sd + 4) < 0.5 ? 'rgba(0, 0, 0, 0.3)' : 'rgba(150, 190, 190, 0.12)';
    ctx.beginPath();
    ctx.ellipse(sx, top + 60 + rand(sd + 1) * 50, 6 + rand(sd + 2) * 9, 3 + rand(sd + 3) * 4, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // the moss skin on top, with a light rim and tufts
  const moss = ctx.createLinearGradient(0, top - 4, 0, top + 12);
  moss.addColorStop(0, '#2fa37a');
  moss.addColorStop(1, '#1b5c47');
  ctx.fillStyle = moss;
  ctx.beginPath();
  ctx.moveTo(x0, top - 2 + wob(x0, 7) * 0.5);
  for (let x = x0; x <= x1 + 10; x += 10) ctx.lineTo(Math.min(x, x1), top - 2 + wob(x, 7) * 0.5);
  for (let x = x1; x >= x0 - 10; x -= 10) ctx.lineTo(Math.max(x, x0), top + 10 + wob(x, 8) * 0.6);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = `rgba(150, 255, 220, ${0.25 + 0.2 * glow})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x0, top - 2 + wob(x0, 7) * 0.5);
  for (let x = x0; x <= x1 + 10; x += 10) ctx.lineTo(Math.min(x, x1), top - 2 + wob(x, 7) * 0.5);
  ctx.stroke();
  ctx.strokeStyle = '#238a67';
  ctx.lineWidth = 2.4;
  for (let x = Math.floor(x0 / 22) * 22; x < x1; x += 22) {
    const sd = Math.floor(x / 22);
    const hh = 5 + rand(sd + 11) * 8;
    ctx.beginPath();
    ctx.moveTo(x + rand(sd) * 10, top);
    ctx.quadraticCurveTo(x + 4, top - hh * 0.6, x + 8 + rand(sd + 2) * 6, top - hh);
    ctx.stroke();
  }

  // tiny glowcaps along the top edge
  for (let x = Math.floor(x0 / 150) * 150; x < x1; x += 150) {
    const sd = Math.floor(x / 150);
    const sx = x + 20 + rand(sd + 50) * 110;
    if (sx < x0 || sx > x1) continue;
    glowcap(ctx, sx, top + 1, 12 + rand(sd + 51) * 12, sd, glow, time, sd);
  }
}

// ───────────────────────────── the ledges ─────────────────────────────

function drawStoneLedge(ctx: CanvasRenderingContext2D, p: Platform, time: number) {
  const glow = prowlerGlow();
  const x0 = p.x;
  const x1 = p.x + p.width;
  const top = p.y;
  const bot = p.y + Math.max(p.height, 22);
  const sd = p.id * 13;

  // stalactites under the slab
  ctx.fillStyle = '#1b2a31';
  const n = Math.max(2, Math.floor(p.width / 60));
  for (let i = 0; i < n; i++) {
    const sx = x0 + 18 + (i + rand(sd + i)) * ((p.width - 36) / n);
    const len = 14 + rand(sd + i + 3) * 30;
    ctx.beginPath();
    ctx.moveTo(sx - 8, bot - 4);
    ctx.lineTo(sx + 8, bot - 4);
    ctx.quadraticCurveTo(sx + 2, bot + len * 0.5, sx, bot + len);
    ctx.quadraticCurveTo(sx - 2, bot + len * 0.5, sx - 8, bot - 4);
    ctx.fill();
  }

  // the slab
  const g = ctx.createLinearGradient(0, top, 0, bot);
  g.addColorStop(0, '#53686c');
  g.addColorStop(0.35, '#3a4d53');
  g.addColorStop(1, '#1c2b32');
  ctx.fillStyle = g;
  ctx.strokeStyle = '#050d11';
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.roundRect(x0, top, p.width, bot - top, 7);
  ctx.fill();
  ctx.stroke();
  // cracks and layers
  ctx.strokeStyle = 'rgba(2, 10, 14, 0.5)';
  ctx.lineWidth = 1.6;
  for (let i = 0; i < Math.max(2, p.width / 80); i++) {
    const cx = x0 + 20 + rand(sd + i + 20) * (p.width - 40);
    ctx.beginPath();
    ctx.moveTo(cx, top + 6);
    ctx.lineTo(cx + 5, top + (bot - top) * 0.5);
    ctx.lineTo(cx - 3, bot - 3);
    ctx.stroke();
  }

  // moss on top, drooping over the front edge
  ctx.fillStyle = '#237a5a';
  ctx.beginPath();
  ctx.moveTo(x0 - 2, top + 2);
  for (let x = x0; x <= x1 + 8; x += 8) ctx.lineTo(Math.min(x, x1 + 2), top - 4 + Math.sin(x * 0.18 + sd) * 2);
  for (let x = x1 + 2; x >= x0 - 4; x -= 14) ctx.lineTo(x, top + 8 + rand(Math.floor(x / 14) + sd) * 10);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = `rgba(150, 255, 220, ${0.3 + 0.25 * glow})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x0 + 3, top - 3);
  ctx.lineTo(x1 - 3, top - 3);
  ctx.stroke();

  // glowcaps growing on the slab: one or two, never in the middle where the hero lands
  const caps = p.width > 150 ? 2 : 1;
  for (let i = 0; i < caps; i++) {
    const cx = i === 0 ? x0 + 16 + rand(sd + 7) * 14 : x1 - 16 - rand(sd + 8) * 14;
    glowcap(ctx, cx, top - 2, 20 + rand(sd + i + 30) * 14, sd + i, glow, time, sd + i);
  }

  // a hanging root with a small glowing bulb off one end
  const rx = rand(sd + 40) < 0.5 ? x0 + 10 : x1 - 10;
  const sw = Math.sin(time * 0.9 + sd) * 3;
  ctx.strokeStyle = '#0c1a16';
  ctx.lineWidth = 3.4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(rx, bot - 4);
  ctx.quadraticCurveTo(rx + sw, bot + 18, rx + sw * 1.6, bot + 34);
  ctx.stroke();
  stampGlow(ctx, CAP_COLORS[(sd >> 1) % 4], rx + sw * 1.6, bot + 36, 9, 0.8 * glow);
}

/** a moving ledge hangs from the dark on two roots */
function drawHangingSlab(ctx: CanvasRenderingContext2D, p: Platform, cam: Cam, time: number) {
  ctx.strokeStyle = '#0c1a16';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  for (const rx of [p.x + 14, p.x + p.width - 14]) {
    ctx.beginPath();
    ctx.moveTo(rx, p.y + 4);
    ctx.lineTo(rx, cam.y - 30);
    ctx.stroke();
  }
  drawStoneLedge(ctx, p, time);
}

// ───────────────────────────── trunks ─────────────────────────────

function drawRootPillar(ctx: CanvasRenderingContext2D, t: TreeStructure, cam: Cam, time: number) {
  const top = cam.y - 40;
  const bottom = t.groundY + 4;
  const half = 46;
  const glow = prowlerGlow();
  ctx.save();
  const g = ctx.createLinearGradient(t.x - half, 0, t.x + half, 0);
  g.addColorStop(0, '#040d11');
  g.addColorStop(0.55, '#0e2227');
  g.addColorStop(0.92, '#1f4846');
  g.addColorStop(1, '#357a72');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(t.x - half * 0.8, top);
  ctx.lineTo(t.x + half * 0.8, top);
  for (let y = top; y <= bottom; y += 40) ctx.lineTo(t.x + half * (0.8 + 0.15 * Math.sin(y * 0.01 + t.id)) + (y > bottom - 110 ? (y - (bottom - 110)) * 0.18 : 0), y);
  ctx.lineTo(t.x + half * 1.2, bottom);
  ctx.lineTo(t.x - half * 1.2, bottom);
  for (let y = bottom; y >= top; y -= 40) ctx.lineTo(t.x - half * (0.8 + 0.15 * Math.sin(y * 0.013 + t.id * 2)) - (y > bottom - 110 ? (y - (bottom - 110)) * 0.18 : 0), y);
  ctx.closePath();
  ctx.fill();

  // furrows
  ctx.strokeStyle = 'rgba(1, 7, 10, 0.55)';
  ctx.lineWidth = 3;
  for (let r = 0; r < 5; r++) {
    const rx = t.x - half * 0.65 + r * (half * 0.3);
    ctx.beginPath();
    for (let y = top; y <= bottom; y += 36) ctx.lineTo(rx + Math.sin(y * 0.02 + r + t.id) * 5, y);
    ctx.stroke();
  }
  // veins of light that pulse slowly up the column
  for (let r = 0; r < 3; r++) {
    const rx = t.x - half * 0.4 + r * (half * 0.4);
    ctx.strokeStyle = CAP_COLORS[(t.id + r) % 4];
    ctx.globalAlpha = (0.15 + 0.4 * glow) * (0.6 + 0.4 * Math.sin(time * 1.2 + r * 2 + t.id));
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    for (let y = top; y <= bottom - 60; y += 30) ctx.lineTo(rx + Math.sin(y * 0.025 + r * 2 + t.id) * 7, y);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  // a lit edge on the right
  ctx.strokeStyle = 'rgba(160, 235, 225, 0.22)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(t.x + half * 0.82, top);
  for (let y = top; y <= bottom - 100; y += 40) ctx.lineTo(t.x + half * (0.82 + 0.1 * Math.sin(y * 0.01 + t.id)), y);
  ctx.stroke();
  // mushrooms clustered at the foot
  for (let m = 0; m < 3; m++) {
    glowcap(ctx, t.x + (m - 1) * 26, t.groundY + 2, 24 + rand(t.id * 3 + m) * 24, t.id + m, glow, time, t.id * 3 + m);
  }
  ctx.restore();
}

// ───────────────────────────── roots (vines) ─────────────────────────────

function rootCurve(v: Vine, time: number, calm: boolean) {
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

function drawRoot(ctx: CanvasRenderingContext2D, v: Vine, cam: Cam, time: number) {
  const swing = v.vineType === 'swing_liana';
  const { at, tipX, tipY, len, ang } = rootCurve(v, time, !swing);
  const N = Math.max(14, Math.floor(len / 10));
  const glow = prowlerGlow();
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  if (swing) {
    // up into the dark
    ctx.strokeStyle = '#06100d';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(v.x, v.topY);
    ctx.lineTo(v.x, cam.y - 30);
    ctx.stroke();
    ctx.strokeStyle = '#27493a';
    ctx.lineWidth = 4.4;
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(120, 255, 220, 0.12)';
  ctx.lineWidth = 22;
  trace(ctx, at, N);
  ctx.stroke();
  ctx.strokeStyle = '#06100d';
  ctx.lineWidth = 9.5;
  trace(ctx, at, N);
  ctx.stroke();
  ctx.strokeStyle = '#2d5a45';
  ctx.lineWidth = 6;
  trace(ctx, at, N);
  ctx.stroke();
  ctx.strokeStyle = '#4f9a74';
  ctx.lineWidth = 1.8;
  ctx.setLineDash([5, 9]);
  trace(ctx, at, N);
  ctx.stroke();
  ctx.setLineDash([]);
  // knots with a tiny glow, so a climbing vine reads as something to grab
  for (let i = 2; i < N - 1; i += swing ? 7 : 4) {
    const p = at(i / N);
    ctx.fillStyle = '#1c3a2d';
    ctx.strokeStyle = '#06100d';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    stampGlow(ctx, CAP_COLORS[i % 4], p.x, p.y, 10, 0.55 * glow);
  }
  if (swing) {
    // a glowing bulb to hold
    ctx.save();
    ctx.translate(tipX, tipY);
    ctx.rotate(-ang);
    stampGlow(ctx, '#ffb02e', 0, 8, 26, 0.85 * (0.4 + 0.6 * glow));
    ctx.fillStyle = '#f5b94a';
    ctx.strokeStyle = '#06100d';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.ellipse(0, 8, 13, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.beginPath();
    ctx.ellipse(-4, 5, 4.5, 3, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

// ───────────────────────────── entry ─────────────────────────────

export function drawProwlerObjects(ctx: CanvasRenderingContext2D, platforms: Platform[], vines: Vine[], trees: TreeStructure[], cam: Cam, time: number) {
  const left = cam.x - 200;
  const right = cam.x + cam.viewportWidth + 200;

  for (const t of trees) {
    if (t.x + 130 < left || t.x - 130 > right) continue;
    drawRootPillar(ctx, t, cam, time);
  }
  for (const v of vines) {
    if (v.x < left || v.x > right || v.vineType === 'swing_liana') continue;
    drawRoot(ctx, v, cam, time);
  }
  for (const p of platforms) {
    if (p.height >= 50 && !p.broken) {
      ctx.save();
      drawCaveFloor(ctx, p, cam, time);
      ctx.restore();
    }
  }
  for (const p of platforms) {
    if (p.height >= 50 || p.broken || p.x + p.width < left - 200 || p.x > right + 200) continue;
    ctx.save();
    if (p.type === 'moving') drawHangingSlab(ctx, p, cam, time);
    else drawStoneLedge(ctx, p, time);
    ctx.restore();
  }
  for (const v of vines) {
    if (v.vineType !== 'swing_liana' || v.x < left || v.x > right) continue;
    drawRoot(ctx, v, cam, time);
  }
}
