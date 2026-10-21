/**
 * The Night-Wing Monarch's lair, part two: everything the hero touches, in the Karst Roost's own style.
 *   - the floor is wet limestone: pale flowstone slabs over dark strata, with fungus caps glowing along the lip
 *   - the ledges are limestone shelves with flowstone teeth hanging under them; the moving ledge is a rock slab hung from two pale roots
 *   - the pillars at the fences are columns of flowstone, stalactite meeting stalagmite, banded and dripping
 *   - the climb vine is a thick pale root with fibres and a knot or two, the swing liana a root with a bone-white loop to hold
 *
 * Nothing here changes a box: every shape sits on the platform's own rectangle (top edge = p.y). The glow goes from teal to violet in the
 * dark (monarchNight in lairMonarch.ts).
 */
import type { Platform, TreeStructure, Vine } from './types.ts';
import { monarchNight, sporeRgb } from './lairMonarch.ts';
import { rand, stamp } from './lairKit.ts';

interface Cam {
  x: number;
  y: number;
  viewportWidth: number;
  viewportHeight: number;
}

/** a fungus cap: a glowing dome on a stalk */
function cap(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, k: number, time: number, seed: number) {
  stamp(ctx, sporeRgb(k), x, y - r, r * 7, r * 5, 0.4 + 0.2 * Math.sin(time * 2 + seed) + 0.2 * k);
  ctx.fillStyle = '#2a2250';
  ctx.fillRect(x - 1, y - r, 2, r);
  ctx.fillStyle = k > 0.5 ? '#e0bfff' : '#aef1f6';
  ctx.beginPath();
  ctx.ellipse(x, y - r, r, r * 0.65, 0, Math.PI, 0);
  ctx.fill();
}

// ───────────────────────────── the cave floor ─────────────────────────────

function drawFloor(ctx: CanvasRenderingContext2D, p: Platform, cam: Cam, time: number) {
  const x0 = Math.max(p.x, cam.x - 160);
  const x1 = Math.min(p.x + p.width, cam.x + cam.viewportWidth + 160);
  if (x1 <= x0) return;
  const top = p.y;
  const bottom = cam.y + cam.viewportHeight + 60;
  const k = monarchNight();

  // dark strata below the flowstone
  const rock = ctx.createLinearGradient(0, top, 0, bottom);
  rock.addColorStop(0, '#231a44');
  rock.addColorStop(0.3, '#120c28');
  rock.addColorStop(1, '#05030c');
  ctx.fillStyle = rock;
  ctx.fillRect(x0, top + 24, x1 - x0, bottom - top);
  ctx.strokeStyle = 'rgba(150, 140, 230, 0.1)';
  ctx.lineWidth = 1.6;
  for (let y = 50; y < 230; y += 36) {
    ctx.beginPath();
    for (let x = x0; x <= x1 + 16; x += 16) {
      const px = Math.min(x, x1);
      const yy = top + y + Math.sin(px * 0.02 + y) * 4;
      if (x === x0) ctx.moveTo(px, yy);
      else ctx.lineTo(px, yy);
    }
    ctx.stroke();
  }

  // the flowstone: broad, rounded slabs, each a slightly different violet-grey, with a wet highlight
  const slabH = 26;
  const slabW = 124;
  for (let x = Math.floor(x0 / slabW) * slabW - slabW; x < x1; x += slabW) {
    const sd = Math.floor(x / slabW);
    const bx = Math.max(x, x0);
    const bw = Math.min(x + slabW - 4, x1) - bx;
    if (bw <= 0) continue;
    const tone = rand(sd + 3);
    const g = ctx.createLinearGradient(0, top, 0, top + slabH);
    g.addColorStop(0, `rgb(${96 + tone * 20}, ${88 + tone * 18}, ${140 + tone * 20})`);
    g.addColorStop(1, `rgb(${44 + tone * 10}, ${38 + tone * 10}, ${78 + tone * 12})`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.roundRect(bx, top, bw, slabH, [3, 3, 8, 8]);
    ctx.fill();
    // ripples where the water ran
    ctx.strokeStyle = 'rgba(220, 210, 255, 0.16)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(bx + 8, top + 9 + rand(sd + 8) * 5);
    ctx.quadraticCurveTo(bx + bw / 2, top + 14 + rand(sd + 9) * 4, bx + bw - 8, top + 8 + rand(sd + 10) * 5);
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(210, 205, 255, 0.45)';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(x0, top + 0.9);
  ctx.lineTo(x1, top + 0.9);
  ctx.stroke();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(x0, top + slabH, x1 - x0, 5);

  // fungus caps along the lip, glowing
  for (let x = Math.floor(x0 / 96) * 96; x < x1; x += 96) {
    const sd = Math.floor(x / 96);
    if (rand(sd + 40) < 0.4) continue;
    const fx = x + 10 + rand(sd) * 70;
    for (let i = 0; i < 2; i++) cap(ctx, fx + i * 9, top + 1, 3 + rand(sd + i + 2) * 3, k, time, sd + i);
  }
  stamp(ctx, sporeRgb(k), (x0 + x1) / 2, top + 4, Math.min(x1 - x0, 900), 24, 0.14 + 0.12 * k);
  // a drip falling here and there
  ctx.fillStyle = 'rgba(200, 210, 255, 0.5)';
  for (let x = Math.floor(x0 / 260) * 260; x < x1; x += 260) {
    const sd = Math.floor(x / 260);
    const ph = (time * 0.7 + rand(sd + 70)) % 1;
    ctx.fillRect(x + 40 + rand(sd) * 150, top - 60 + ph * 58, 1.8, 6);
  }
}

// ───────────────────────────── the ledges ─────────────────────────────

function drawShelf(ctx: CanvasRenderingContext2D, p: Platform, time: number) {
  const k = monarchNight();
  const x0 = p.x;
  const x1 = p.x + p.width;
  const top = p.y;
  const bot = p.y + Math.max(p.height, 24);
  const sd = p.id * 13;

  // a limestone shelf, rounded and heavy, with flowstone teeth hanging from its underside
  const g = ctx.createLinearGradient(0, top, 0, bot);
  g.addColorStop(0, '#7d77ad');
  g.addColorStop(1, '#2e2858');
  ctx.fillStyle = g;
  ctx.strokeStyle = '#05030c';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(x0, top);
  ctx.lineTo(x1, top);
  ctx.lineTo(x1, bot - 6);
  const n = Math.max(3, Math.floor(p.width / 34));
  for (let i = n; i >= 0; i--) {
    const tx = x0 + (p.width * i) / n;
    const len = 5 + rand(sd + i) * 16;
    ctx.lineTo(tx + 8, bot - 2);
    ctx.lineTo(tx, bot + len);
    ctx.lineTo(tx - 8, bot - 2);
  }
  ctx.lineTo(x0, bot - 8);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // banding and a crack
  ctx.strokeStyle = 'rgba(215, 205, 255, 0.2)';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(x0 + 8, top + (bot - top) * 0.45);
  ctx.quadraticCurveTo((x0 + x1) / 2, top + (bot - top) * 0.62, x1 - 8, top + (bot - top) * 0.4);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(0, 0, 8, 0.5)';
  const cx = x0 + p.width * (0.3 + rand(sd + 3) * 0.4);
  ctx.beginPath();
  ctx.moveTo(cx, top + 2);
  ctx.lineTo(cx - 4, top + (bot - top) * 0.5);
  ctx.lineTo(cx + 3, bot - 3);
  ctx.stroke();
  // glowing moss on top, a lit edge, a cap or two
  ctx.fillStyle = `rgba(${sporeRgb(k)}, 0.5)`;
  ctx.fillRect(x0 + 8, top, p.width * 0.35, 3.2);
  ctx.strokeStyle = 'rgba(225, 220, 255, 0.5)';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(x0 + 3, top + 1.2);
  ctx.lineTo(x1 - 3, top + 1.2);
  ctx.stroke();
  cap(ctx, x0 + p.width * 0.78, top + 1, 4, k, time, sd);
  cap(ctx, x0 + p.width * 0.78 + 8, top + 1, 3, k, time, sd + 1);
  stamp(ctx, sporeRgb(k), (x0 + x1) / 2, bot + 8, p.width, 40, 0.14 + 0.1 * k);
}

/** the moving ledge: a rock slab hung from two pale roots, a sleeping bat under it */
function drawHungSlab(ctx: CanvasRenderingContext2D, p: Platform, cam: Cam, time: number) {
  const k = monarchNight();
  ctx.strokeStyle = '#0a0618';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  for (const rx of [p.x + 16, p.x + p.width - 16]) {
    ctx.beginPath();
    ctx.moveTo(rx, p.y + 4);
    ctx.lineTo(rx, cam.y - 30);
    ctx.stroke();
  }
  ctx.strokeStyle = '#c8bfa4';
  ctx.lineWidth = 2.4;
  ctx.setLineDash([5, 6]);
  for (const rx of [p.x + 16, p.x + p.width - 16]) {
    ctx.beginPath();
    ctx.moveTo(rx, p.y + 4);
    ctx.lineTo(rx, cam.y - 30);
    ctx.stroke();
  }
  ctx.setLineDash([]);
  const top = p.y;
  const bot = p.y + Math.max(p.height, 22);
  const g = ctx.createLinearGradient(0, top, 0, bot);
  g.addColorStop(0, '#8b85bd');
  g.addColorStop(1, '#383067');
  ctx.fillStyle = g;
  ctx.strokeStyle = '#05030c';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.roundRect(p.x, top, p.width, bot - top, 6);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = `rgba(${sporeRgb(k)}, ${0.6 + 0.3 * Math.sin(time * 2 + p.id)})`;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(p.x + 10, bot - 5);
  ctx.lineTo(p.x + p.width - 10, bot - 5);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(225, 220, 255, 0.5)';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(p.x + 4, top + 1.2);
  ctx.lineTo(p.x + p.width - 4, top + 1.2);
  ctx.stroke();
  stamp(ctx, sporeRgb(k), p.x + p.width / 2, bot + 6, p.width * 1.2, 40, 0.3);
  // a bat asleep under it
  const bx = p.x + p.width * 0.5;
  ctx.fillStyle = '#05030c';
  ctx.beginPath();
  ctx.ellipse(bx, bot + 10 + Math.sin(time * 0.8 + p.id) * 0.6, 5, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  if (k > 0.2) {
    ctx.fillStyle = `rgba(255, 70, 96, ${k})`;
    ctx.fillRect(bx - 3, bot + 16, 1.8, 1.8);
    ctx.fillRect(bx + 1.5, bot + 16, 1.8, 1.8);
  }
}

// ───────────────────────────── flowstone columns (the pillars at the fences) ─────────────────────────────

function drawColumn(ctx: CanvasRenderingContext2D, t: TreeStructure, cam: Cam, time: number) {
  const k = monarchNight();
  const top = cam.y - 40;
  const bottom = t.groundY + 4;
  const half = 36;
  ctx.save();
  // stalactite and stalagmite grown together: fat at the ends, a waist in the middle
  const waist = 0.72;
  const mid = (top + bottom) / 2;
  const g = ctx.createLinearGradient(t.x - half, 0, t.x + half, 0);
  g.addColorStop(0, '#150e30');
  g.addColorStop(0.45, '#6a638f');
  g.addColorStop(1, '#1a1238');
  ctx.fillStyle = g;
  ctx.strokeStyle = '#05030c';
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(t.x - half, top);
  ctx.quadraticCurveTo(t.x - half * waist, mid, t.x - half * 1.3, bottom);
  ctx.lineTo(t.x + half * 1.3, bottom);
  ctx.quadraticCurveTo(t.x + half * waist, mid, t.x + half, top);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // bands of flowstone and the glint of wet rock
  ctx.strokeStyle = 'rgba(215, 205, 255, 0.2)';
  ctx.lineWidth = 1.6;
  for (let y = Math.floor(top / 90) * 90 + 40; y < bottom - 20; y += 90) {
    ctx.beginPath();
    ctx.moveTo(t.x - half * 0.9, y);
    ctx.quadraticCurveTo(t.x, y + 7, t.x + half * 0.9, y);
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(235, 230, 255, 0.35)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(t.x - half * 0.3, top);
  ctx.quadraticCurveTo(t.x - half * 0.45, mid, t.x - half * 0.55, bottom - 20);
  ctx.stroke();
  // fungus caps round the foot, glowing
  for (let i = -2; i <= 2; i++) cap(ctx, t.x + i * 15, t.groundY + 1, 4 + rand(i + t.id) * 4, k, time, i + t.id);
  stamp(ctx, sporeRgb(k), t.x, bottom - 20, 220, 90, 0.22 + 0.14 * k);
  // a drip falling off the waist
  const ph = (time * 0.8 + rand(t.id)) % 1;
  ctx.fillStyle = 'rgba(210, 215, 255, 0.6)';
  ctx.fillRect(t.x + 10, mid + ph * 120, 2, 7);
  ctx.restore();
}

// ───────────────────────────── cave roots (vines) ─────────────────────────────

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
  const k = monarchNight();
  const swing = v.vineType === 'swing_liana';
  const { at, tipX, tipY, len, ang } = rootCurve(v, time, !swing);
  const N = Math.max(14, Math.floor(len / 10));
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  if (swing) {
    ctx.strokeStyle = '#0a0618';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(v.x, v.topY);
    ctx.lineTo(v.x, cam.y - 30);
    ctx.stroke();
    ctx.strokeStyle = '#b9b095';
    ctx.lineWidth = 4.4;
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(200, 190, 255, 0.09)';
  ctx.lineWidth = 20;
  trace(ctx, at, N);
  ctx.stroke();
  ctx.strokeStyle = '#0a0618';
  ctx.lineWidth = 9.5;
  trace(ctx, at, N);
  ctx.stroke();
  ctx.strokeStyle = '#cfc5a6';
  ctx.lineWidth = 6;
  trace(ctx, at, N);
  ctx.stroke();
  ctx.strokeStyle = '#7d7358';
  ctx.lineWidth = 1.8;
  ctx.setLineDash([6, 5]);
  trace(ctx, at, N);
  ctx.stroke();
  ctx.setLineDash([]);
  // fine root hairs trailing off it and a glowing knot to grip
  for (let i = 2; i < N - 1; i += swing ? 6 : 3) {
    const p = at(i / N);
    ctx.strokeStyle = 'rgba(214, 204, 170, 0.7)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(p.x + 3, p.y);
    ctx.quadraticCurveTo(p.x + 11 + Math.sin(time * 1.4 + i) * 2, p.y + 6, p.x + 8, p.y + 15);
    ctx.stroke();
    if (i % 2 === 0) {
      stamp(ctx, sporeRgb(k), p.x, p.y, 26, 26, 0.4);
      ctx.fillStyle = k > 0.5 ? '#e7cbff' : '#aef1f6';
      ctx.strokeStyle = '#0a0618';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }
  if (swing) {
    // a bone-white loop to hold
    ctx.save();
    ctx.translate(tipX, tipY);
    ctx.rotate(-ang);
    ctx.strokeStyle = '#0a0618';
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.arc(0, 12, 11, Math.PI * 0.05, Math.PI * 1.1);
    ctx.stroke();
    ctx.strokeStyle = '#ece6d2';
    ctx.lineWidth = 4.8;
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}

// ───────────────────────────── entry ─────────────────────────────

export function drawMonarchObjects(ctx: CanvasRenderingContext2D, platforms: Platform[], vines: Vine[], trees: TreeStructure[], cam: Cam, time: number) {
  const left = cam.x - 200;
  const right = cam.x + cam.viewportWidth + 200;

  for (const t of trees) {
    if (t.x + 130 < left || t.x - 130 > right) continue;
    drawColumn(ctx, t, cam, time);
  }
  for (const v of vines) {
    if (v.x < left || v.x > right || v.vineType === 'swing_liana') continue;
    drawRoot(ctx, v, cam, time);
  }
  for (const p of platforms) {
    if (p.height >= 50 && !p.broken) {
      ctx.save();
      drawFloor(ctx, p, cam, time);
      ctx.restore();
    }
  }
  for (const p of platforms) {
    if (p.height >= 50 || p.broken || p.x + p.width < left - 200 || p.x > right + 200) continue;
    ctx.save();
    if (p.type === 'moving') drawHungSlab(ctx, p, cam, time);
    else drawShelf(ctx, p, time);
    ctx.restore();
  }
  for (const v of vines) {
    if (v.vineType !== 'swing_liana' || v.x < left || v.x > right) continue;
    drawRoot(ctx, v, cam, time);
  }
}
