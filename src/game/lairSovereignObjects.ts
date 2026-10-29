/**
 * The Sky Sovereign's lair, part two: everything the hero touches, in the Cloud Aerie's own style.
 *   - the floor is a cut-away of the cliff top: a skin of wind-bent grass, then bands of warm sandstone and cold grey rock, with fallen
 *     feathers and pebbles in the layers
 *   - the ledges are slabs of weathered stone with a lashing of rope and a rim of twigs from old nests; the moving one is a woven
 *     plank platform hanging on two ropes
 *   - the pillars at the fences are spires of banded rock with a pennant of charms at the top; the climb vine is a thick braided rope with
 *     knots, the swing liana a rope with a wooden ring to hold
 *
 * Nothing here changes a box: every shape sits on the platform's own rectangle (top edge = p.y). The stone dims in the storm
 * (sovereignStorm in lairSovereign.ts).
 */
import type { Platform, TreeStructure, Vine } from './types.ts';
import { drawLairRope, drawLairRopeLine } from './ropeArt.ts';
import { sovereignStorm } from './lairSovereign.ts';
import { drawSkyPillar } from './sovereignArt.ts';

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

/** a colour pulled toward the storm's violet-grey by `k` (0..1) */
function stormy(c: [number, number, number], k: number): string {
  const t = [60, 52, 92];
  const r = Math.round(c[0] + (t[0] - c[0]) * k * 0.62);
  const g = Math.round(c[1] + (t[1] - c[1]) * k * 0.62);
  const b = Math.round(c[2] + (t[2] - c[2]) * k * 0.62);
  return `rgb(${r},${g},${b})`;
}

// ───────────────────────────── the floor ─────────────────────────────

function drawCliffFloor(ctx: CanvasRenderingContext2D, p: Platform, cam: Cam, time: number) {
  const x0 = Math.max(p.x, cam.x - 160);
  const x1 = Math.min(p.x + p.width, cam.x + cam.viewportWidth + 160);
  if (x1 <= x0) return;
  const top = p.y;
  const bottom = cam.y + cam.viewportHeight + 60;
  const k = sovereignStorm();
  const wob = (x: number, s: number) => Math.sin(x * 0.019 + s) * 3 + Math.sin(x * 0.051 + s * 2.3) * 2;

  const band = (y0: number, y1: number, s0: number, s1: number, fill: string | CanvasGradient) => {
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.moveTo(x0, y0 + wob(x0, s0));
    for (let x = x0; x <= x1 + 12; x += 12) ctx.lineTo(Math.min(x, x1), y0 + wob(x, s0));
    for (let x = x1; x >= x0 - 12; x -= 12) ctx.lineTo(Math.max(x, x0), y1 + wob(x, s1));
    ctx.closePath();
    ctx.fill();
  };

  const sand = ctx.createLinearGradient(0, top, 0, top + 62);
  sand.addColorStop(0, stormy([196, 150, 108], k));
  sand.addColorStop(1, stormy([138, 98, 84], k));
  band(top + 4, top + 62, 0, 1, sand);
  const rock = ctx.createLinearGradient(0, top + 58, 0, top + 130);
  rock.addColorStop(0, stormy([112, 96, 122], k));
  rock.addColorStop(1, stormy([66, 56, 84], k));
  band(top + 58, top + 130, 1, 2, rock);
  const deep = ctx.createLinearGradient(0, top + 126, 0, top + 200);
  deep.addColorStop(0, stormy([52, 42, 72], k));
  deep.addColorStop(1, stormy([24, 18, 40], k));
  band(top + 126, bottom, 2, 3, deep);

  // thin layers in the rock, and pebbles
  ctx.strokeStyle = 'rgba(40, 20, 40, 0.28)';
  ctx.lineWidth = 1.6;
  for (let y = 30; y < 190; y += 34) {
    ctx.beginPath();
    for (let x = x0; x <= x1 + 16; x += 16) {
      const px = Math.min(x, x1);
      if (x === x0) ctx.moveTo(px, top + y + wob(px, y * 0.1));
      else ctx.lineTo(px, top + y + wob(px, y * 0.1));
    }
    ctx.stroke();
  }
  for (let x = Math.floor(x0 / 70) * 70; x < x1; x += 70) {
    const sd = Math.floor(x / 70);
    const sx = x + rand(sd) * 60;
    ctx.fillStyle = rand(sd + 4) < 0.5 ? 'rgba(30, 14, 30, 0.3)' : 'rgba(255, 226, 190, 0.16)';
    ctx.beginPath();
    ctx.ellipse(sx, top + 44 + rand(sd + 1) * 90, 6 + rand(sd + 2) * 9, 3 + rand(sd + 3) * 4, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // the grass skin on top, with a sunlit rim, bent over by the wind
  const grass = ctx.createLinearGradient(0, top - 4, 0, top + 12);
  grass.addColorStop(0, stormy([150, 170, 88], k));
  grass.addColorStop(1, stormy([92, 112, 66], k));
  ctx.fillStyle = grass;
  ctx.beginPath();
  ctx.moveTo(x0, top - 2 + wob(x0, 7) * 0.5);
  for (let x = x0; x <= x1 + 10; x += 10) ctx.lineTo(Math.min(x, x1), top - 2 + wob(x, 7) * 0.5);
  for (let x = x1; x >= x0 - 10; x -= 10) ctx.lineTo(Math.max(x, x0), top + 10 + wob(x, 8) * 0.6);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = `rgba(255, 232, 170, ${0.55 - 0.4 * k})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x0, top - 2 + wob(x0, 7) * 0.5);
  for (let x = x0; x <= x1 + 10; x += 10) ctx.lineTo(Math.min(x, x1), top - 2 + wob(x, 7) * 0.5);
  ctx.stroke();
  ctx.strokeStyle = stormy([120, 140, 70], k);
  ctx.lineWidth = 2.2;
  ctx.lineCap = 'round';
  for (let x = Math.floor(x0 / 18) * 18; x < x1; x += 18) {
    const sd = Math.floor(x / 18);
    const hh = 5 + rand(sd + 11) * 9;
    const lean = 4 + Math.sin(time * 2.2 + x * 0.06) * 2.5 * (1 + k);
    ctx.beginPath();
    ctx.moveTo(x + rand(sd) * 8, top);
    ctx.quadraticCurveTo(x + 3 + lean * 0.4, top - hh * 0.6, x + 7 + lean, top - hh);
    ctx.stroke();
  }

  // a fallen feather here and there on the grass
  for (let x = Math.floor(x0 / 260) * 260; x < x1; x += 260) {
    const sd = Math.floor(x / 260);
    const fx = x + 40 + rand(sd + 60) * 180;
    if (fx < x0 || fx > x1) continue;
    ctx.save();
    ctx.translate(fx, top - 1);
    ctx.rotate(-0.1 + rand(sd + 61) * 0.2);
    ctx.fillStyle = '#e9ddc6';
    ctx.strokeStyle = 'rgba(80, 60, 44, 0.7)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(0, 0, 13, 2.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
}

// ───────────────────────────── the ledges ─────────────────────────────

function drawStoneLedge(ctx: CanvasRenderingContext2D, p: Platform, time: number) {
  const k = sovereignStorm();
  const x0 = p.x;
  const x1 = p.x + p.width;
  const top = p.y;
  const bot = p.y + Math.max(p.height, 22);
  const sd = p.id * 13;

  // the slab
  const g = ctx.createLinearGradient(0, top, 0, bot);
  g.addColorStop(0, stormy([206, 168, 136], k));
  g.addColorStop(0.35, stormy([150, 118, 112], k));
  g.addColorStop(1, stormy([78, 62, 92], k));
  ctx.fillStyle = g;
  ctx.strokeStyle = '#2a1626';
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.roundRect(x0, top, p.width, bot - top, 7);
  ctx.fill();
  ctx.stroke();
  // layers and a crack or two
  ctx.strokeStyle = 'rgba(40, 20, 40, 0.34)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x0 + 5, top + (bot - top) * 0.45);
  ctx.lineTo(x1 - 5, top + (bot - top) * 0.5);
  ctx.stroke();
  for (let i = 0; i < Math.max(2, p.width / 90); i++) {
    const cx = x0 + 22 + rand(sd + i + 20) * (p.width - 44);
    ctx.beginPath();
    ctx.moveTo(cx, top + 6);
    ctx.lineTo(cx + 5, top + (bot - top) * 0.55);
    ctx.lineTo(cx - 3, bot - 3);
    ctx.stroke();
  }
  // a lashing of rope round each end, where the slab is tied to the cliff
  ctx.strokeStyle = '#8a6a3c';
  ctx.lineWidth = 3;
  for (const lx of [x0 + 18, x1 - 18]) {
    for (let r = 0; r < 3; r++) {
      ctx.beginPath();
      ctx.moveTo(lx - 6, top + 3 + r * 5);
      ctx.lineTo(lx + 6, top + 6 + r * 5);
      ctx.stroke();
    }
  }
  // twigs from an old nest along the top edge, and bent grass
  ctx.strokeStyle = '#6b4a30';
  ctx.lineWidth = 2.6;
  ctx.lineCap = 'round';
  const nt = Math.max(3, Math.floor(p.width / 34));
  for (let i = 0; i < nt; i++) {
    const tx = x0 + 10 + (i + rand(sd + i)) * ((p.width - 20) / nt);
    ctx.beginPath();
    ctx.moveTo(tx, top + 2);
    ctx.lineTo(tx + (rand(sd + i + 5) - 0.5) * 16, top - 4 - rand(sd + i + 7) * 6);
    ctx.stroke();
  }
  ctx.strokeStyle = stormy([130, 150, 76], k);
  ctx.lineWidth = 2;
  for (let x = x0 + 6; x < x1 - 4; x += 16) {
    const sdg = Math.floor(x / 16) + sd;
    const lean = 3 + Math.sin(time * 2.2 + x * 0.07) * 2 * (1 + k);
    ctx.beginPath();
    ctx.moveTo(x, top);
    ctx.quadraticCurveTo(x + lean * 0.4, top - 4, x + 3 + lean, top - 5 - rand(sdg) * 5);
    ctx.stroke();
  }
  // a rim of sun
  ctx.strokeStyle = `rgba(255, 234, 180, ${0.55 - 0.4 * k})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x0 + 4, top + 1);
  ctx.lineTo(x1 - 4, top + 1);
  ctx.stroke();
  // a hanging charm of feathers off one end
  const cx = rand(sd + 40) < 0.5 ? x0 + 9 : x1 - 9;
  const sw = Math.sin(time * 1.6 + sd) * 4;
  ctx.strokeStyle = '#4a3220';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx, bot - 3);
  ctx.lineTo(cx + sw * 0.5, bot + 14);
  ctx.stroke();
  ctx.fillStyle = '#f1e4cc';
  for (let f = -1; f <= 1; f++) {
    ctx.beginPath();
    ctx.ellipse(cx + sw * 0.5 + f * 5, bot + 24 + Math.abs(f) * 2, 2.6, 10, f * 0.25 + sw * 0.03, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** a moving ledge is a woven plank platform on two ropes from the sky */
function drawHangingPlanks(ctx: CanvasRenderingContext2D, p: Platform, cam: Cam, time: number) {
  const k = sovereignStorm();
  for (const rx of [p.x + 14, p.x + p.width - 14]) drawLairRopeLine(ctx, rx, p.y + 4, rx, cam.y - 30, 6, null, '#b88c52');
  const top = p.y;
  const bot = p.y + Math.max(p.height, 20);
  ctx.fillStyle = stormy([172, 126, 78], k);
  ctx.strokeStyle = '#2a1608';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.roundRect(p.x, top, p.width, bot - top, 5);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = 'rgba(40, 20, 8, 0.55)';
  ctx.lineWidth = 1.6;
  for (let x = p.x + 28; x < p.x + p.width - 6; x += 28) {
    ctx.beginPath();
    ctx.moveTo(x, top + 2);
    ctx.lineTo(x, bot - 2);
    ctx.stroke();
  }
  ctx.strokeStyle = `rgba(255, 226, 170, ${0.5 - 0.35 * k})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(p.x + 4, top + 1.5);
  ctx.lineTo(p.x + p.width - 4, top + 1.5);
  ctx.stroke();
  // a small pennant at one end
  const px = p.x + p.width - 10;
  ctx.strokeStyle = '#3a2a1e';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(px, top);
  ctx.lineTo(px, top - 26);
  ctx.stroke();
  ctx.fillStyle = '#e0566e';
  ctx.beginPath();
  ctx.moveTo(px, top - 26);
  const fl = Math.sin(time * 6) * 3;
  ctx.lineTo(px - 24, top - 22 + fl);
  ctx.lineTo(px, top - 15);
  ctx.closePath();
  ctx.fill();
}

// ───────────────────────────── spires (the pillars at the fences) ─────────────────────────────

function drawSpire(ctx: CanvasRenderingContext2D, t: TreeStructure, cam: Cam, time: number) {
  const top = cam.y - 40;
  const bottom = t.groundY + 4;
  const half = 46;
  const k = sovereignStorm();
  ctx.save();
  const g = ctx.createLinearGradient(t.x - half, 0, t.x + half, 0);
  g.addColorStop(0, stormy([62, 46, 84], k));
  g.addColorStop(0.5, stormy([130, 100, 116], k));
  g.addColorStop(0.9, stormy([226, 170, 128], k));
  g.addColorStop(1, stormy([255, 205, 150], k));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(t.x - half * 0.78, top);
  ctx.lineTo(t.x + half * 0.78, top);
  for (let y = top; y <= bottom; y += 40) ctx.lineTo(t.x + half * (0.8 + 0.14 * Math.sin(y * 0.011 + t.id)) + (y > bottom - 110 ? (y - (bottom - 110)) * 0.2 : 0), y);
  ctx.lineTo(t.x + half * 1.22, bottom);
  ctx.lineTo(t.x - half * 1.22, bottom);
  for (let y = bottom; y >= top; y -= 40) ctx.lineTo(t.x - half * (0.8 + 0.14 * Math.sin(y * 0.012 + t.id * 2)) - (y > bottom - 110 ? (y - (bottom - 110)) * 0.2 : 0), y);
  ctx.closePath();
  ctx.fill();
  // bands of rock layers across the spire
  ctx.strokeStyle = 'rgba(40, 18, 40, 0.32)';
  ctx.lineWidth = 2.4;
  for (let y = Math.floor(top / 58) * 58; y < bottom; y += 58) {
    ctx.beginPath();
    ctx.moveTo(t.x - half * 1.1, y + Math.sin(y * 0.1 + t.id) * 4);
    ctx.lineTo(t.x + half * 1.1, y + 6 + Math.sin(y * 0.07 + t.id) * 4);
    ctx.stroke();
  }
  // a lit edge on the sun side
  ctx.strokeStyle = `rgba(255, 224, 170, ${0.5 - 0.35 * k})`;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(t.x + half * 0.8, top);
  for (let y = top; y <= bottom - 100; y += 40) ctx.lineTo(t.x + half * (0.8 + 0.12 * Math.sin(y * 0.011 + t.id)), y);
  ctx.stroke();
  // a string of feather charms hanging from a peg, swaying in the wind
  const peg = Math.max(top + 60, bottom - 380);
  ctx.strokeStyle = '#4a3220';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(t.x - half * 0.7, peg);
  ctx.lineTo(t.x - half * 0.7 - 12, peg + 4);
  ctx.stroke();
  for (let i = 0; i < 4; i++) {
    const sw = Math.sin(time * 1.8 + i * 0.9 + t.id) * (4 + 4 * k);
    const fx = t.x - half * 0.7 - 10 - i * 7;
    ctx.beginPath();
    ctx.moveTo(fx, peg + 4);
    ctx.lineTo(fx + sw * 0.4, peg + 20 + i * 3);
    ctx.stroke();
    ctx.fillStyle = i % 2 ? '#f1e4cc' : '#38b6c4';
    ctx.beginPath();
    ctx.ellipse(fx + sw * 0.5, peg + 30 + i * 3, 3.2, 11, sw * 0.04, 0, Math.PI * 2);
    ctx.fill();
  }
  // grass at the foot
  ctx.strokeStyle = stormy([120, 140, 70], k);
  ctx.lineWidth = 2.4;
  ctx.lineCap = 'round';
  for (let i = -5; i <= 5; i++) {
    ctx.beginPath();
    ctx.moveTo(t.x + i * 9, t.groundY + 2);
    ctx.quadraticCurveTo(t.x + i * 9 + 3, t.groundY - 8, t.x + i * 9 + 8 + Math.sin(time * 2.2 + i) * 3, t.groundY - 14 - rand(i + t.id) * 8);
    ctx.stroke();
  }
  ctx.restore();
}

// ───────────────────────────── ropes (vines) ─────────────────────────────

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

function drawRope(ctx: CanvasRenderingContext2D, v: Vine, cam: Cam, time: number) {
  const swing = v.vineType === 'swing_liana';
  const { at, tipX, tipY, len, ang } = ropeCurve(v, time, !swing);
  const N = Math.max(14, Math.floor(len / 10));
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  if (swing) {
    // up into the sky
    drawLairRopeLine(ctx, v.x, v.topY, v.x, cam.y - 30, 7, null, '#a98050');
  }
  ctx.strokeStyle = 'rgba(255, 220, 160, 0.14)';
  ctx.lineWidth = 20;
  trace(ctx, at, N);
  ctx.stroke();
  drawLairRope(ctx, at, N, 9.5, null, '#a98050');
  // knots, so a climbing rope reads as something to grab
  for (let i = 2; i < N - 1; i += swing ? 7 : 4) {
    const p = at(i / N);
    ctx.fillStyle = '#c29a62';
    ctx.strokeStyle = '#2a1a10';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  if (swing) {
    // a wooden ring to hold
    ctx.save();
    ctx.translate(tipX, tipY);
    ctx.rotate(-ang);
    ctx.strokeStyle = '#2a1a10';
    ctx.lineWidth = 7.5;
    ctx.beginPath();
    ctx.ellipse(0, 10, 12, 10, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = '#c8985a';
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}

// ───────────────────────────── entry ─────────────────────────────

export function drawSovereignObjects(ctx: CanvasRenderingContext2D, platforms: Platform[], vines: Vine[], trees: TreeStructure[], cam: Cam, time: number) {
  const left = cam.x - 200;
  const right = cam.x + cam.viewportWidth + 200;

  for (const t of trees) {
    if (t.x + 130 < left || t.x - 130 > right) continue;
    drawSpire(ctx, t, cam, time);
  }
  for (const v of vines) {
    if (v.x < left || v.x > right || v.vineType === 'swing_liana') continue;
    drawRope(ctx, v, cam, time);
  }
  for (const p of platforms) {
    if (p.height >= 50 && !p.broken && p.pillar === undefined) {
      ctx.save();
      drawCliffFloor(ctx, p, cam, time);
      ctx.restore();
    }
  }
  // the rock pillars of the fight (sovereignArt.ts), cracked by her slams
  for (const p of platforms) {
    if (p.pillar === undefined || p.x + p.width < left || p.x > right) continue;
    drawSkyPillar(ctx, p, time, sovereignStorm());
  }
  for (const p of platforms) {
    if (p.height >= 50 || p.pillar !== undefined || p.broken || p.x + p.width < left - 200 || p.x > right + 200) continue;
    ctx.save();
    if (p.type === 'moving') drawHangingPlanks(ctx, p, cam, time);
    else drawStoneLedge(ctx, p, time);
    ctx.restore();
  }
  for (const v of vines) {
    if (v.vineType !== 'swing_liana' || v.x < left || v.x > right) continue;
    drawRope(ctx, v, cam, time);
  }
}
