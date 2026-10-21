/**
 * The Stone Idol Golem's lair, part two: everything the hero touches, in the Idol Sanctum's own style.
 *   - the floor is cracked flagstone, mossy at the seams, with a line of rune inlay that glows blue (white-blue once the idol wakes)
 *   - the ledges are broken blocks of carved temple stone, each with a rune band; the moving ledge is a floating rune slab with a halo
 *   - the pillars at the fences are carved rune columns, stacked with glyph bands, a heavy capital and a cracked base
 *   - the climb vine is a thick, moss-furred liana wound round an old chain, the swing liana a chain with a stone ring to hold
 *
 * Nothing here changes a box: every shape sits on the platform's own rectangle (top edge = p.y).
 */
import type { Platform, TreeStructure, Vine } from './types.ts';
import { glyph, golemAwake, runeRgb } from './lairGolem.ts';
import { rand, stamp } from './lairKit.ts';

interface Cam {
  x: number;
  y: number;
  viewportWidth: number;
  viewportHeight: number;
}

// ───────────────────────────── the flagstone floor ─────────────────────────────

function drawFlags(ctx: CanvasRenderingContext2D, p: Platform, cam: Cam, time: number) {
  const x0 = Math.max(p.x, cam.x - 160);
  const x1 = Math.min(p.x + p.width, cam.x + cam.viewportWidth + 160);
  if (x1 <= x0) return;
  const top = p.y;
  const bottom = cam.y + cam.viewportHeight + 60;
  const k = golemAwake();

  // dark rubble and earth under the slabs
  const under = ctx.createLinearGradient(0, top, 0, bottom);
  under.addColorStop(0, '#1a232c');
  under.addColorStop(0.35, '#0f161d');
  under.addColorStop(1, '#05080b');
  ctx.fillStyle = under;
  ctx.fillRect(x0, top + 26, x1 - x0, bottom - top);
  // buried courses of block, fading into the dark
  ctx.strokeStyle = 'rgba(80, 110, 130, 0.12)';
  ctx.lineWidth = 1.6;
  for (let y = 62; y < 260; y += 46) {
    ctx.beginPath();
    ctx.moveTo(x0, top + y);
    ctx.lineTo(x1, top + y);
    ctx.stroke();
    const off = (y / 46) % 2 ? 0 : 60;
    for (let x = Math.floor(x0 / 120) * 120 + off; x < x1; x += 120) {
      ctx.beginPath();
      ctx.moveTo(x, top + y);
      ctx.lineTo(x, top + y + 46);
      ctx.stroke();
    }
  }

  // the slabs: wide flagstones with a lit top edge, a chipped corner now and then
  const slabH = 26;
  const slabW = 112;
  for (let x = Math.floor(x0 / slabW) * slabW - slabW; x < x1; x += slabW) {
    const sd = Math.floor(x / slabW);
    const bx = Math.max(x, x0);
    const bw = Math.min(x + slabW - 3, x1) - bx;
    if (bw <= 0) continue;
    const tone = rand(sd + 3);
    const g = ctx.createLinearGradient(0, top, 0, top + slabH);
    g.addColorStop(0, `rgb(${74 + tone * 16}, ${92 + tone * 16}, ${106 + tone * 14})`);
    g.addColorStop(1, `rgb(${38 + tone * 10}, ${50 + tone * 10}, ${60 + tone * 10})`);
    ctx.fillStyle = g;
    ctx.fillRect(bx, top, bw, slabH);
    // a crack, and a patch of moss along the top
    ctx.strokeStyle = 'rgba(0, 4, 8, 0.55)';
    ctx.lineWidth = 1.4;
    if (rand(sd + 8) < 0.55) {
      const cx = bx + 12 + rand(sd + 9) * Math.max(10, bw - 24);
      ctx.beginPath();
      ctx.moveTo(cx, top);
      ctx.lineTo(cx + 5, top + slabH * 0.4);
      ctx.lineTo(cx - 3, top + slabH * 0.7);
      ctx.lineTo(cx + 2, top + slabH);
      ctx.stroke();
    }
    if (rand(sd + 20) < 0.45) {
      ctx.fillStyle = 'rgba(70, 120, 76, 0.6)';
      ctx.fillRect(bx + rand(sd + 21) * bw * 0.4, top, bw * (0.3 + rand(sd + 22) * 0.4), 3.4);
    }
  }
  // the lit edge, the shadow under it
  ctx.strokeStyle = 'rgba(190, 220, 240, 0.4)';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(x0, top + 0.9);
  ctx.lineTo(x1, top + 0.9);
  ctx.stroke();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(x0, top + slabH, x1 - x0, 5);

  // the rune inlay: a line cut into the stone just under the lip with glyphs every so often, glowing and pulsing
  const pulse = 0.7 + 0.3 * Math.sin(time * 1.8);
  ctx.strokeStyle = `rgba(${runeRgb(k)}, ${(0.55 + 0.35 * k) * pulse})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x0, top + 12);
  ctx.lineTo(x1, top + 12);
  ctx.stroke();
  ctx.lineWidth = 1.6;
  for (let x = Math.floor(x0 / 112) * 112 + 56; x < x1; x += 112) {
    glyph(ctx, x, top + 12, 11, Math.floor(x / 112) * 5 + 3);
  }
  stamp(ctx, runeRgb(k), (x0 + x1) / 2, top + 12, Math.min(x1 - x0, 900), 26, 0.22 + 0.2 * k);

  // tufts of grass and a pebble or two on the slabs
  ctx.strokeStyle = 'rgba(86, 140, 90, 0.8)';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  for (let x = Math.floor(x0 / 70) * 70; x < x1; x += 70) {
    const sd = Math.floor(x / 70);
    if (rand(sd + 30) < 0.55) continue;
    const gx = x + rand(sd) * 50;
    const sway = Math.sin(time * 1.5 + gx * 0.05) * 2;
    for (let r = 0; r < 3; r++) {
      ctx.beginPath();
      ctx.moveTo(gx + r * 3, top);
      ctx.quadraticCurveTo(gx + r * 3 + sway * 0.5, top - 6, gx + r * 3 + 2 + sway, top - 9 - rand(sd + r) * 6);
      ctx.stroke();
    }
  }
}

// ───────────────────────────── the ledges ─────────────────────────────

function drawBlock(ctx: CanvasRenderingContext2D, p: Platform, time: number) {
  const k = golemAwake();
  const x0 = p.x;
  const x1 = p.x + p.width;
  const top = p.y;
  const bot = p.y + Math.max(p.height, 24);
  const sd = p.id * 13;

  // a block of carved stone, chipped at the bottom corners, with a broken lower edge
  const g = ctx.createLinearGradient(0, top, 0, bot);
  g.addColorStop(0, '#6a8294');
  g.addColorStop(1, '#303f4b');
  ctx.fillStyle = g;
  ctx.strokeStyle = '#05080c';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(x0, top);
  ctx.lineTo(x1, top);
  ctx.lineTo(x1, bot - 8);
  ctx.lineTo(x1 - 14, bot);
  ctx.lineTo(x0 + p.width * 0.55, bot - 5);
  ctx.lineTo(x0 + p.width * 0.32, bot);
  ctx.lineTo(x0 + 10, bot - 2);
  ctx.lineTo(x0, bot - 10);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // a rune band down the face
  ctx.strokeStyle = `rgba(${runeRgb(k)}, ${0.6 + 0.3 * k})`;
  ctx.lineWidth = 1.6;
  const by = top + (bot - top) * 0.52;
  ctx.beginPath();
  ctx.moveTo(x0 + 8, by);
  ctx.lineTo(x1 - 8, by);
  ctx.stroke();
  for (let x = x0 + 26; x < x1 - 14; x += 34) glyph(ctx, x, by, 10, sd + Math.floor(x / 34));
  stamp(ctx, runeRgb(k), (x0 + x1) / 2, by, p.width * 0.9, 22, 0.16 + 0.14 * k);
  // cracks, moss on the top and a lit edge
  ctx.strokeStyle = 'rgba(0, 4, 8, 0.5)';
  ctx.lineWidth = 1.4;
  const cx = x0 + p.width * (0.3 + rand(sd) * 0.4);
  ctx.beginPath();
  ctx.moveTo(cx, top + 2);
  ctx.lineTo(cx - 5, top + (bot - top) * 0.4);
  ctx.lineTo(cx + 3, bot - 4);
  ctx.stroke();
  ctx.fillStyle = 'rgba(70, 120, 76, 0.6)';
  ctx.fillRect(x0 + 8, top, p.width * 0.4, 3.4);
  ctx.strokeStyle = 'rgba(205, 230, 245, 0.45)';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(x0 + 3, top + 1.2);
  ctx.lineTo(x1 - 3, top + 1.2);
  ctx.stroke();
  // a little dust sifting off the underside
  ctx.fillStyle = 'rgba(160, 190, 210, 0.4)';
  for (let i = 0; i < 3; i++) {
    const ph = (time * 0.6 + i * 0.37 + rand(sd + i)) % 1;
    ctx.fillRect(x0 + p.width * (0.2 + 0.3 * i), bot + ph * 26, 2, 2);
  }
}

/** the moving ledge: a slab of rune-cut stone held up by its own light, a ring of glyphs turning under it */
function drawRuneSlab(ctx: CanvasRenderingContext2D, p: Platform, time: number) {
  const k = golemAwake();
  const top = p.y;
  const bot = p.y + Math.max(p.height, 22);
  const cx = p.x + p.width / 2;
  stamp(ctx, runeRgb(k), cx, bot + 8, p.width * 1.5, 70, 0.55 + 0.15 * Math.sin(time * 3 + p.id));
  const g = ctx.createLinearGradient(0, top, 0, bot);
  g.addColorStop(0, '#7e98ab');
  g.addColorStop(1, '#3c4f5d');
  ctx.fillStyle = g;
  ctx.strokeStyle = '#05080c';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.roundRect(p.x, top, p.width, bot - top, 4);
  ctx.fill();
  ctx.stroke();
  // glowing rune rim
  ctx.strokeStyle = `rgba(${runeRgb(k)}, ${0.8 + 0.2 * Math.sin(time * 4 + p.id)})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(p.x + 5, top + 5, p.width - 10, bot - top - 10, 3);
  ctx.stroke();
  ctx.lineWidth = 1.5;
  for (let x = p.x + 22; x < p.x + p.width - 14; x += 30) glyph(ctx, x, (top + bot) / 2, 9, p.id * 7 + Math.floor(x / 30));
  ctx.strokeStyle = 'rgba(210, 235, 250, 0.5)';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(p.x + 4, top + 1.2);
  ctx.lineTo(p.x + p.width - 4, top + 1.2);
  ctx.stroke();
  // a turning ring of glyph-motes underneath
  for (let i = 0; i < 5; i++) {
    const a = time * 1.4 + (i / 5) * Math.PI * 2;
    ctx.fillStyle = `rgba(${runeRgb(k)}, 0.8)`;
    ctx.fillRect(cx + Math.cos(a) * p.width * 0.34 - 2, bot + 10 + Math.sin(a) * 6, 4, 4);
  }
}

// ───────────────────────────── rune columns (the pillars at the fences) ─────────────────────────────

function drawColumn(ctx: CanvasRenderingContext2D, t: TreeStructure, cam: Cam, time: number) {
  const k = golemAwake();
  const top = cam.y - 40;
  const bottom = t.groundY + 4;
  const half = 38;
  ctx.save();
  const g = ctx.createLinearGradient(t.x - half, 0, t.x + half, 0);
  g.addColorStop(0, '#111b24');
  g.addColorStop(0.45, '#5a7183');
  g.addColorStop(1, '#16212b');
  ctx.fillStyle = g;
  ctx.fillRect(t.x - half, top, half * 2, bottom - top);
  ctx.strokeStyle = '#05080c';
  ctx.lineWidth = 2.6;
  ctx.strokeRect(t.x - half, top, half * 2, bottom - top);
  // drums: a seam every 120 px
  ctx.strokeStyle = 'rgba(0, 4, 8, 0.55)';
  ctx.lineWidth = 2;
  for (let y = Math.floor(top / 120) * 120 + 40; y < bottom - 20; y += 120) {
    ctx.beginPath();
    ctx.moveTo(t.x - half, y);
    ctx.lineTo(t.x + half, y + 3);
    ctx.stroke();
  }
  // glyph bands between the seams, glowing and pulsing slowly
  const pulse = 0.7 + 0.3 * Math.sin(time * 1.6 + t.id);
  ctx.strokeStyle = `rgba(${runeRgb(k)}, ${(0.6 + 0.3 * k) * pulse})`;
  ctx.lineWidth = 1.7;
  for (let y = Math.floor(top / 120) * 120 + 100; y < bottom - 20; y += 120) {
    for (let i = -1; i <= 1; i++) glyph(ctx, t.x + i * 22, y, 12, t.id * 11 + Math.floor(y / 120) * 3 + i);
  }
  stamp(ctx, runeRgb(k), t.x, bottom - 160, 160, 260, 0.12 + 0.12 * k);
  // a heavy capital at the top of the view and a cracked, mossy base
  ctx.fillStyle = '#273542';
  ctx.strokeStyle = '#05080c';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.rect(t.x - half - 12, bottom - 26, half * 2 + 24, 26);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = 'rgba(70, 120, 76, 0.65)';
  ctx.fillRect(t.x - half - 12, bottom - 26, 44, 4);
  ctx.strokeStyle = 'rgba(0, 4, 8, 0.6)';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(t.x + 10, bottom - 26);
  ctx.lineTo(t.x + 4, bottom - 12);
  ctx.lineTo(t.x + 14, bottom);
  ctx.stroke();
  // a liana of moss hanging on one side
  const sw = Math.sin(time * 1.2 + t.id) * 3;
  const hy = Math.max(top + 100, bottom - 320);
  ctx.strokeStyle = 'rgba(46, 90, 56, 0.9)';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(t.x - half, hy);
  ctx.quadraticCurveTo(t.x - half - 10 + sw, hy + 40, t.x - half - 4 + sw, hy + 84);
  ctx.stroke();
  ctx.restore();
}

// ───────────────────────────── chain-lianas (vines) ─────────────────────────────

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

function drawChainLiana(ctx: CanvasRenderingContext2D, v: Vine, cam: Cam, time: number) {
  const k = golemAwake();
  const swing = v.vineType === 'swing_liana';
  const { at, tipX, tipY, len, ang } = chainCurve(v, time, !swing);
  const N = Math.max(14, Math.floor(len / 10));
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  if (swing) {
    ctx.strokeStyle = '#0a0f14';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(v.x, v.topY);
    ctx.lineTo(v.x, cam.y - 30);
    ctx.stroke();
    ctx.strokeStyle = '#6e8496';
    ctx.lineWidth = 4.4;
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(170, 210, 235, 0.09)';
  ctx.lineWidth = 20;
  trace(ctx, at, N);
  ctx.stroke();
  // the old chain, with the moss-furred liana wound round it
  ctx.strokeStyle = '#080d12';
  ctx.lineWidth = 9.5;
  trace(ctx, at, N);
  ctx.stroke();
  ctx.strokeStyle = '#5f7686';
  ctx.lineWidth = 6;
  trace(ctx, at, N);
  ctx.stroke();
  ctx.strokeStyle = '#1b2830';
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 6]);
  trace(ctx, at, N);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.strokeStyle = 'rgba(74, 130, 84, 0.9)';
  ctx.lineWidth = 2.4;
  for (let i = 1; i < N; i += 2) {
    const a = at(i / N);
    const b = at(Math.min(1, (i + 1.6) / N));
    ctx.beginPath();
    ctx.moveTo(a.x - 4, a.y);
    ctx.quadraticCurveTo((a.x + b.x) / 2 + 5, (a.y + b.y) / 2 - 2, b.x - 4, b.y);
    ctx.stroke();
  }
  // rune beads to grip
  for (let i = 2; i < N - 1; i += swing ? 7 : 4) {
    const p = at(i / N);
    stamp(ctx, runeRgb(k), p.x, p.y, 26, 26, 0.5);
    ctx.fillStyle = k > 0.5 ? '#cfeeff' : '#7fc1ff';
    ctx.strokeStyle = '#080d12';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  if (swing) {
    // a worn stone ring to hold
    ctx.save();
    ctx.translate(tipX, tipY);
    ctx.rotate(-ang);
    ctx.strokeStyle = '#080d12';
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.arc(0, 12, 11, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = '#8aa2b4';
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}

// ───────────────────────────── entry ─────────────────────────────

export function drawGolemObjects(ctx: CanvasRenderingContext2D, platforms: Platform[], vines: Vine[], trees: TreeStructure[], cam: Cam, time: number) {
  const left = cam.x - 200;
  const right = cam.x + cam.viewportWidth + 200;

  for (const t of trees) {
    if (t.x + 130 < left || t.x - 130 > right) continue;
    drawColumn(ctx, t, cam, time);
  }
  for (const v of vines) {
    if (v.x < left || v.x > right || v.vineType === 'swing_liana') continue;
    drawChainLiana(ctx, v, cam, time);
  }
  for (const p of platforms) {
    if (p.height >= 50 && !p.broken) {
      ctx.save();
      drawFlags(ctx, p, cam, time);
      ctx.restore();
    }
  }
  for (const p of platforms) {
    if (p.height >= 50 || p.broken || p.x + p.width < left - 200 || p.x > right + 200) continue;
    ctx.save();
    if (p.type === 'moving') drawRuneSlab(ctx, p, time);
    else drawBlock(ctx, p, time);
    ctx.restore();
  }
  for (const v of vines) {
    if (v.vineType !== 'swing_liana' || v.x < left || v.x > right) continue;
    drawChainLiana(ctx, v, cam, time);
  }
}
