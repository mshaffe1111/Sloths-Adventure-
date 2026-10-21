/**
 * General Iron-Claw's lair, part two: everything the hero touches, in the War Camp's own style.
 *   - the floor is the camp's parade deck: heavy timber planks bound with riveted iron plates, a lip of spikes along the front edge
 *   - the ledges are scaffolds of lashed timber with an iron-shod top and spikes hung under; the moving ledge is a siege platform hung
 *     from two chains with a torch on it
 *   - the pillars at the fences are iron-banded war posts crowned with spikes and a skull, a torn banner hanging from each
 *   - the climb vine is a heavy iron chain, the swing liana a chain with an iron ring to hold
 *
 * Nothing here changes a box: every shape sits on the platform's own rectangle (top edge = p.y). The iron glows ember in the war
 * (warcampWar in lairWarcamp.ts).
 */
import type { Platform, TreeStructure, Vine } from './types.ts';
import { fireRgb, mixc, warcampWar } from './lairWarcamp.ts';
import { rand, stamp } from './lairKit.ts';

interface Cam {
  x: number;
  y: number;
  viewportWidth: number;
  viewportHeight: number;
}

// ───────────────────────────── the parade deck ─────────────────────────────

function drawDeck(ctx: CanvasRenderingContext2D, p: Platform, cam: Cam, time: number) {
  const x0 = Math.max(p.x, cam.x - 160);
  const x1 = Math.min(p.x + p.width, cam.x + cam.viewportWidth + 160);
  if (x1 <= x0) return;
  const top = p.y;
  const bottom = cam.y + cam.viewportHeight + 60;
  const k = warcampWar();

  // the timber under the deck: heavy beams in the dark, a scorch of firelight along the top
  const under = ctx.createLinearGradient(0, top, 0, bottom);
  under.addColorStop(0, mixc([44, 24, 22], [56, 18, 14], k));
  under.addColorStop(0.3, mixc([24, 14, 14], [30, 10, 8], k));
  under.addColorStop(1, '#070405');
  ctx.fillStyle = under;
  ctx.fillRect(x0, top + 26, x1 - x0, bottom - top);
  ctx.strokeStyle = 'rgba(255, 170, 110, 0.07)';
  ctx.lineWidth = 2;
  for (let y = 54; y < 240; y += 40) {
    ctx.beginPath();
    ctx.moveTo(x0, top + y);
    ctx.lineTo(x1, top + y);
    ctx.stroke();
  }
  for (let x = Math.floor(x0 / 130) * 130; x < x1; x += 130) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.fillRect(x + 30, top + 26, 18, 120 + rand(Math.floor(x / 130)) * 100);
  }

  // the planks: thick boards, each slightly different, with rivets at each end and a black gap between
  const plankH = 26;
  const plankW = 96;
  for (let x = Math.floor(x0 / plankW) * plankW - plankW; x < x1; x += plankW) {
    const sd = Math.floor(x / plankW);
    const bx = Math.max(x, x0);
    const bw = Math.min(x + plankW - 3, x1) - bx;
    if (bw <= 0) continue;
    const tone = rand(sd + 3);
    const g = ctx.createLinearGradient(0, top, 0, top + plankH);
    g.addColorStop(0, mixc([118 + tone * 24, 84 + tone * 18, 66 + tone * 14], [150 + tone * 30, 74 + tone * 12, 54 + tone * 10], k));
    g.addColorStop(1, mixc([66 + tone * 14, 44 + tone * 10, 38 + tone * 8], [84 + tone * 16, 36 + tone * 8, 30 + tone * 6], k));
    ctx.fillStyle = g;
    ctx.fillRect(bx, top, bw, plankH);
    ctx.strokeStyle = 'rgba(20, 10, 8, 0.4)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(bx + 4, top + 9 + rand(sd + 9) * 6);
    ctx.lineTo(bx + bw - 4, top + 9 + rand(sd + 10) * 6);
    ctx.stroke();
    ctx.fillStyle = 'rgba(12, 8, 8, 0.8)';
    ctx.fillRect(bx + 5, top + 5, 3, 3);
    ctx.fillRect(bx + bw - 8, top + 5, 3, 3);
  }
  // iron plates bolted over the seams every so often
  for (let x = Math.floor(x0 / 288) * 288; x < x1; x += 288) {
    const sd = Math.floor(x / 288);
    const px = x + 40 + rand(sd + 5) * 160;
    if (px < x0 - 30 || px > x1) continue;
    const g = ctx.createLinearGradient(0, top, 0, top + plankH);
    g.addColorStop(0, mixc([120, 122, 132], [160, 98, 84], k));
    g.addColorStop(1, mixc([52, 54, 62], [84, 44, 38], k));
    ctx.fillStyle = g;
    ctx.strokeStyle = '#0a0606';
    ctx.lineWidth = 1.8;
    ctx.fillRect(px, top - 1, 70, plankH + 1);
    ctx.strokeRect(px, top - 1, 70, plankH + 1);
    ctx.fillStyle = '#d6d6de';
    for (const rx of [px + 7, px + 63]) for (const ry of [top + 6, top + plankH - 6]) {
      ctx.beginPath();
      ctx.arc(rx, ry, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  // the lit edge, the shadow under it and a row of iron spikes set along the front lip
  ctx.strokeStyle = `rgba(255, 220, 190, ${0.4 - 0.1 * k})`;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(x0, top + 0.9);
  ctx.lineTo(x1, top + 0.9);
  ctx.stroke();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(x0, top + plankH, x1 - x0, 5);
  ctx.fillStyle = '#9ca3af';
  for (let x = Math.floor(x0 / 52) * 52 + 26; x < x1; x += 52) {
    ctx.beginPath();
    ctx.moveTo(x - 4, top + plankH + 4);
    ctx.lineTo(x, top + plankH + 18);
    ctx.lineTo(x + 4, top + plankH + 4);
    ctx.fill();
  }
  stamp(ctx, fireRgb(k), (x0 + x1) / 2, top + 3, Math.min(x1 - x0, 900), 22, 0.13 + 0.12 * k);
}

// ───────────────────────────── the scaffolds ─────────────────────────────

function drawScaffold(ctx: CanvasRenderingContext2D, p: Platform, time: number) {
  const k = warcampWar();
  const x0 = p.x;
  const x1 = p.x + p.width;
  const top = p.y;
  const bot = p.y + Math.max(p.height, 24);
  const sd = p.id * 11;

  // trestle legs under each end, cross-braced
  ctx.strokeStyle = mixc([36, 22, 20], [48, 18, 14], k);
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  for (const lx of [x0 + 20, x1 - 20]) {
    ctx.beginPath();
    ctx.moveTo(lx, bot);
    ctx.lineTo(lx + (lx < (x0 + x1) / 2 ? -6 : 6), bot + 70);
    ctx.stroke();
  }
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x0 + 20, bot + 10);
  ctx.lineTo(x1 - 20, bot + 60);
  ctx.moveTo(x1 - 20, bot + 10);
  ctx.lineTo(x0 + 20, bot + 60);
  ctx.stroke();

  // the timber top: two courses of lashed logs, an iron shoe along the standing edge
  const g = ctx.createLinearGradient(0, top, 0, bot);
  g.addColorStop(0, mixc([140, 98, 74], [178, 86, 60], k));
  g.addColorStop(1, mixc([64, 42, 34], [86, 34, 26], k));
  ctx.fillStyle = g;
  ctx.strokeStyle = '#0a0606';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.roundRect(x0, top, p.width, bot - top, 4);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = 'rgba(20, 10, 8, 0.5)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x0 + 6, (top + bot) / 2);
  ctx.lineTo(x1 - 6, (top + bot) / 2 + 1);
  ctx.stroke();
  for (let x = x0 + 40; x < x1 - 20; x += 60) {
    ctx.beginPath();
    ctx.moveTo(x, top + 3);
    ctx.lineTo(x + 3, bot - 3);
    ctx.stroke();
  }
  const ig = ctx.createLinearGradient(0, top, 0, top + 8);
  ig.addColorStop(0, mixc([142, 146, 158], [190, 110, 90], k));
  ig.addColorStop(1, mixc([66, 68, 78], [96, 46, 40], k));
  ctx.fillStyle = ig;
  ctx.fillRect(x0 - 2, top - 1, p.width + 4, 8);
  ctx.fillStyle = '#e5e7eb';
  for (let x = x0 + 12; x < x1 - 8; x += 36) {
    ctx.beginPath();
    ctx.arc(x, top + 3.5, 1.8, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.strokeStyle = 'rgba(255, 230, 205, 0.5)';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(x0 + 3, top + 0.8);
  ctx.lineTo(x1 - 3, top + 0.8);
  ctx.stroke();
  // spikes hung under it
  ctx.fillStyle = '#9ca3af';
  const n = Math.max(3, Math.floor(p.width / 40));
  for (let i = 0; i < n; i++) {
    const sx = x0 + (p.width * (i + 0.5)) / n;
    ctx.beginPath();
    ctx.moveTo(sx - 5, bot);
    ctx.lineTo(sx, bot + 12 + rand(sd + i) * 5);
    ctx.lineTo(sx + 5, bot);
    ctx.fill();
  }
  // a small torch at one end
  const tx = rand(sd + 2) < 0.5 ? x0 + 14 : x1 - 14;
  ctx.fillStyle = '#2a1812';
  ctx.fillRect(tx - 2, top - 26, 4, 26);
  const f = 0.8 + 0.25 * Math.sin(time * 9 + sd);
  stamp(ctx, fireRgb(k), tx, top - 32, 70 * f, 70 * f, 0.55);
  ctx.fillStyle = '#f97316';
  ctx.beginPath();
  ctx.moveTo(tx - 6, top - 24);
  ctx.quadraticCurveTo(tx - 7, top - 32 * f, tx, top - 44 * f);
  ctx.quadraticCurveTo(tx + 7, top - 32 * f, tx + 6, top - 24);
  ctx.fill();
}

/** the moving ledge: a siege platform hung from two chains, a swinging brazier at its corner */
function drawHungDeck(ctx: CanvasRenderingContext2D, p: Platform, cam: Cam, time: number) {
  const k = warcampWar();
  for (const rx of [p.x + 16, p.x + p.width - 16]) {
    ctx.strokeStyle = '#0a0606';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(rx, p.y + 4);
    ctx.lineTo(rx, cam.y - 30);
    ctx.stroke();
    ctx.strokeStyle = mixc([138, 142, 154], [190, 110, 90], k);
    ctx.lineWidth = 3;
    ctx.setLineDash([6, 5]);
    ctx.beginPath();
    ctx.moveTo(rx, p.y + 4);
    ctx.lineTo(rx, cam.y - 30);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  const top = p.y;
  const bot = p.y + Math.max(p.height, 22);
  const g = ctx.createLinearGradient(0, top, 0, bot);
  g.addColorStop(0, mixc([142, 146, 158], [190, 110, 90], k));
  g.addColorStop(1, mixc([60, 62, 72], [90, 44, 38], k));
  ctx.fillStyle = g;
  ctx.strokeStyle = '#0a0606';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.roundRect(p.x, top, p.width, bot - top, 4);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#e5e7eb';
  for (let x = p.x + 14; x < p.x + p.width - 8; x += 30) {
    ctx.beginPath();
    ctx.arc(x, (top + bot) / 2, 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.strokeStyle = 'rgba(255, 235, 215, 0.55)';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(p.x + 4, top + 1.2);
  ctx.lineTo(p.x + p.width - 4, top + 1.2);
  ctx.stroke();
  // the brazier hung from a corner
  const sw = Math.sin(time * 1.6 + p.id) * 4;
  const lx = p.x + p.width - 12;
  ctx.strokeStyle = '#0a0606';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(lx, bot - 2);
  ctx.lineTo(lx + sw * 0.5, bot + 16);
  ctx.stroke();
  const f = 0.8 + 0.25 * Math.sin(time * 9 + p.id);
  stamp(ctx, fireRgb(k), lx + sw, bot + 26, 70 * f, 70 * f, 0.6);
  ctx.fillStyle = '#2b1d1a';
  ctx.beginPath();
  ctx.roundRect(lx + sw - 8, bot + 16, 16, 10, 3);
  ctx.fill();
  ctx.fillStyle = '#f97316';
  ctx.beginPath();
  ctx.moveTo(lx + sw - 6, bot + 17);
  ctx.quadraticCurveTo(lx + sw - 6, bot + 8, lx + sw, bot + 2);
  ctx.quadraticCurveTo(lx + sw + 6, bot + 8, lx + sw + 6, bot + 17);
  ctx.fill();
}

// ───────────────────────────── war posts (the pillars at the fences) ─────────────────────────────

function drawWarPost(ctx: CanvasRenderingContext2D, t: TreeStructure, cam: Cam, time: number) {
  const k = warcampWar();
  const top = cam.y - 40;
  const bottom = t.groundY + 4;
  const half = 36;
  ctx.save();
  const g = ctx.createLinearGradient(t.x - half, 0, t.x + half, 0);
  g.addColorStop(0, mixc([30, 18, 16], [44, 14, 10], k));
  g.addColorStop(0.5, mixc([104, 70, 54], [140, 62, 44], k));
  g.addColorStop(1, mixc([34, 20, 18], [48, 14, 10], k));
  ctx.fillStyle = g;
  ctx.fillRect(t.x - half, top, half * 2, bottom - top);
  ctx.strokeStyle = '#0a0606';
  ctx.lineWidth = 2.6;
  ctx.strokeRect(t.x - half, top, half * 2, bottom - top);
  // wood grain
  ctx.strokeStyle = 'rgba(20, 10, 8, 0.4)';
  ctx.lineWidth = 1.4;
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.moveTo(t.x + i * 13, top);
    ctx.lineTo(t.x + i * 13 + 2, bottom);
    ctx.stroke();
  }
  // iron bands every 110 px with a rivet at each end
  for (let y = Math.floor(top / 110) * 110 + 40; y < bottom - 20; y += 110) {
    const bg = ctx.createLinearGradient(0, y, 0, y + 16);
    bg.addColorStop(0, mixc([128, 132, 144], [180, 100, 84], k));
    bg.addColorStop(1, mixc([54, 56, 66], [90, 44, 38], k));
    ctx.fillStyle = bg;
    ctx.fillRect(t.x - half - 3, y, half * 2 + 6, 16);
    ctx.strokeStyle = '#0a0606';
    ctx.lineWidth = 1.6;
    ctx.strokeRect(t.x - half - 3, y, half * 2 + 6, 16);
    ctx.fillStyle = '#e5e7eb';
    for (const rx of [t.x - half + 5, t.x + half - 5]) {
      ctx.beginPath();
      ctx.arc(rx, y + 8, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  // a torn crimson banner hanging from the post, swaying
  const by = Math.max(top + 80, bottom - 340);
  const sw = Math.sin(time * 1.5 + t.id) * 5;
  ctx.fillStyle = mixc([126, 22, 30], [156, 18, 20], k);
  ctx.beginPath();
  ctx.moveTo(t.x + half, by);
  ctx.lineTo(t.x + half + 38, by + 4);
  ctx.lineTo(t.x + half + 34 + sw, by + 84 - 12 * k);
  ctx.lineTo(t.x + half + 18 + sw * 1.4, by + 70 + 10 * k);
  ctx.lineTo(t.x + half + 2 + sw * 0.6, by + 88);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(240, 220, 200, 0.75)';
  ctx.lineWidth = 2.4;
  ctx.lineCap = 'round';
  for (let c = 0; c < 3; c++) {
    ctx.beginPath();
    ctx.moveTo(t.x + half + 12 + c * 8, by + 18);
    ctx.quadraticCurveTo(t.x + half + 16 + c * 8 + sw * 0.4, by + 34, t.x + half + 13 + c * 8 + sw * 0.5, by + 54);
    ctx.stroke();
  }
  // a rim of firelight down the side, and the foot lashed with chain
  stamp(ctx, fireRgb(k), t.x, bottom - 110, 190, 230, 0.12 + 0.12 * k);
  ctx.fillStyle = '#0a0606';
  ctx.fillRect(t.x - half - 10, bottom - 22, half * 2 + 20, 22);
  ctx.strokeStyle = '#6b7280';
  ctx.lineWidth = 2;
  ctx.strokeRect(t.x - half - 10, bottom - 22, half * 2 + 20, 22);
  ctx.restore();
}

// ───────────────────────────── chains (vines) ─────────────────────────────

function chainCurve(v: Vine, time: number, calm: boolean) {
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

function drawChain(ctx: CanvasRenderingContext2D, v: Vine, cam: Cam, time: number) {
  const k = warcampWar();
  const swing = v.vineType === 'swing_liana';
  const { at, tipX, tipY, len, ang } = chainCurve(v, time, !swing);
  const N = Math.max(14, Math.floor(len / 10));
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  if (swing) {
    ctx.strokeStyle = '#0a0606';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(v.x, v.topY);
    ctx.lineTo(v.x, cam.y - 30);
    ctx.stroke();
    ctx.strokeStyle = '#8a8f9c';
    ctx.lineWidth = 4.4;
    ctx.stroke();
  }
  ctx.strokeStyle = `rgba(255, 190, 140, ${0.08 + 0.05 * k})`;
  ctx.lineWidth = 20;
  trace(ctx, at, N);
  ctx.stroke();
  ctx.strokeStyle = '#0a0606';
  ctx.lineWidth = 9.5;
  trace(ctx, at, N);
  ctx.stroke();
  ctx.strokeStyle = mixc([138, 142, 154], [196, 110, 88], k);
  ctx.lineWidth = 6;
  trace(ctx, at, N);
  ctx.stroke();
  // the links: dark gaps cut across it
  ctx.strokeStyle = '#1c1416';
  ctx.lineWidth = 2;
  ctx.setLineDash([2.5, 8]);
  trace(ctx, at, N);
  ctx.stroke();
  ctx.setLineDash([]);
  // a heavy link and a rivet every so often to grip
  for (let i = 2; i < N - 1; i += swing ? 7 : 4) {
    const p = at(i / N);
    ctx.fillStyle = mixc([190, 194, 206], [236, 150, 120], k);
    ctx.strokeStyle = '#0a0606';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, 6, 4.4, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  if (swing) {
    // an iron ring to hold
    ctx.save();
    ctx.translate(tipX, tipY);
    ctx.rotate(-ang);
    ctx.strokeStyle = '#0a0606';
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.arc(0, 12, 11, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = mixc([186, 190, 202], [232, 140, 110], k);
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}

// ───────────────────────────── entry ─────────────────────────────

export function drawWarcampObjects(ctx: CanvasRenderingContext2D, platforms: Platform[], vines: Vine[], trees: TreeStructure[], cam: Cam, time: number) {
  const left = cam.x - 200;
  const right = cam.x + cam.viewportWidth + 200;

  for (const t of trees) {
    if (t.x + 130 < left || t.x - 130 > right) continue;
    drawWarPost(ctx, t, cam, time);
  }
  for (const v of vines) {
    if (v.x < left || v.x > right || v.vineType === 'swing_liana') continue;
    drawChain(ctx, v, cam, time);
  }
  for (const p of platforms) {
    if (p.height >= 50 && !p.broken) {
      ctx.save();
      drawDeck(ctx, p, cam, time);
      ctx.restore();
    }
  }
  for (const p of platforms) {
    if (p.height >= 50 || p.broken || p.x + p.width < left - 200 || p.x > right + 200) continue;
    ctx.save();
    if (p.type === 'moving') drawHungDeck(ctx, p, cam, time);
    else drawScaffold(ctx, p, time);
    ctx.restore();
  }
  for (const v of vines) {
    if (v.vineType !== 'swing_liana' || v.x < left || v.x > right) continue;
    drawChain(ctx, v, cam, time);
  }
}
