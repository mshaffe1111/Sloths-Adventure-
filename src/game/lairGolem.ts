/**
 * The Stone Idol Golem's lair: the Idol Sanctum. The great hall of a drowned temple, black-blue and cold, with a colossal carved face
 * set into the far wall: its eyes are empty sockets that hold a slow blue glow. Pillars wrapped in runes stand in two ranks, shafts of
 * pale light fall through holes in the roof, lianas hang in the gloom and glyphs drift in the air. When the Golem is down to a third of
 * his strength the idol wakes: its eyes blaze, every rune in the hall flares white-blue, dust and grit shake down from the roof and the
 * hall shudders with a low, steady pulse.
 *
 * Same layers as the other lairs (lairArt.ts): back (screen space, opaque), world (a rune circle on the floor, braziers, fallen pieces
 * of the idol) and front (screen space: vignette, dust, falling grit). The floor, ledges, pillars and lianas are in lairGolemObjects.ts.
 */
import type { LairArena, LairView } from './lairArt.ts';
import { rand, stamp } from './lairKit.ts';

// ───────────────────────────── the awakening ─────────────────────────────

/** 0 = the sleeping hall, 1 = the idol is awake. Eased toward the target; snaps on a new fight or a retry. */
let awake = 0;
let lastT = -1;

function easeAwake(time: number, phase: number) {
  const target = phase >= 3 ? 1 : 0;
  const dt = time - lastT;
  if (lastT < 0 || dt < 0 || dt > 1) awake = target;
  else awake += (target - awake) * Math.min(1, dt * 0.9);
  lastT = time;
}

/** how awake the idol is (the objects file brightens its runes with it) */
export function golemAwake(): number {
  return awake;
}

/** the rune colour: a cold blue, going to white-blue as the idol wakes */
export function runeRgb(k: number): string {
  return k > 0.5 ? '170,225,255' : '70,150,255';
}

// ───────────────────────────── glyphs ─────────────────────────────

/** a rune: a few strokes in a small box, chosen by seed, so a wall of them reads as writing */
export function glyph(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, seed: number) {
  const n = 2 + Math.floor(rand(seed) * 3);
  ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const x0 = x + (rand(seed + i * 3 + 1) - 0.5) * s;
    const y0 = y + (rand(seed + i * 3 + 2) - 0.5) * s;
    const x1 = x + (rand(seed + i * 3 + 3) - 0.5) * s;
    const y1 = y + (rand(seed + i * 3 + 4) - 0.5) * s;
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
  }
  ctx.moveTo(x - s * 0.5, y - s * 0.5);
  ctx.lineTo(x + s * 0.5, y - s * 0.5);
  ctx.stroke();
}

// ───────────────────────────── 1. the back ─────────────────────────────

/** the idol: a colossal carved face with a heavy brow, a broad nose and a mouth set in a long, calm line; the eyes are sockets of light */
function drawIdol(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, time: number, k: number) {
  // the great block it is carved from
  const g = ctx.createLinearGradient(cx, cy - r * 1.4, cx, cy + r * 1.3);
  g.addColorStop(0, '#1d2832');
  g.addColorStop(1, '#0b1118');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.roundRect(cx - r * 0.95, cy - r * 1.25, r * 1.9, r * 2.5, r * 0.28);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.lineWidth = 3;
  ctx.stroke();
  // brow, nose, mouth
  ctx.fillStyle = '#26333f';
  ctx.beginPath();
  ctx.roundRect(cx - r * 0.78, cy - r * 0.62, r * 1.56, r * 0.26, r * 0.1);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.13, cy - r * 0.3);
  ctx.lineTo(cx + r * 0.13, cy - r * 0.3);
  ctx.lineTo(cx + r * 0.2, cy + r * 0.34);
  ctx.lineTo(cx - r * 0.2, cy + r * 0.34);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#05080c';
  ctx.beginPath();
  ctx.roundRect(cx - r * 0.5, cy + r * 0.62, r * 1.0, r * 0.14, r * 0.07);
  ctx.fill();
  // the eyes: sockets with a slow-breathing blue light
  const pulse = 0.65 + 0.2 * Math.sin(time * 1.2) + 0.55 * k;
  for (const dx of [-1, 1]) {
    const ex = cx + dx * r * 0.42;
    const ey = cy - r * 0.2;
    ctx.fillStyle = '#04070a';
    ctx.beginPath();
    ctx.ellipse(ex, ey, r * 0.24, r * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();
    stamp(ctx, runeRgb(k), ex, ey, r * 0.9 * (1 + k * 0.5), r * 0.6 * (1 + k * 0.5), Math.min(1, pulse));
    stamp(ctx, '230,245,255', ex, ey, r * 0.28, r * 0.18, Math.min(1, 0.4 + k));
  }
  // carved lines down the cheeks, glowing
  ctx.strokeStyle = `rgba(${runeRgb(k)}, ${0.28 + 0.3 * k})`;
  ctx.lineWidth = 2.4;
  for (const dx of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(cx + dx * r * 0.62, cy - r * 0.1);
    ctx.quadraticCurveTo(cx + dx * r * 0.74, cy + r * 0.3, cx + dx * r * 0.58, cy + r * 0.66);
    ctx.stroke();
  }
  // moss on the brow and a crack across one cheek
  ctx.fillStyle = 'rgba(46, 84, 52, 0.55)';
  ctx.beginPath();
  ctx.ellipse(cx - r * 0.5, cy - r * 0.64, r * 0.3, r * 0.08, 0, 0, Math.PI * 2);
  ctx.ellipse(cx + r * 0.2, cy - r * 1.2, r * 0.4, r * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.55)';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(cx + r * 0.5, cy - r * 0.1);
  ctx.lineTo(cx + r * 0.44, cy + r * 0.2);
  ctx.lineTo(cx + r * 0.56, cy + r * 0.4);
  ctx.stroke();
}

export function drawGolemBack(ctx: CanvasRenderingContext2D, v: LairView, a: LairArena, time: number, bossX: number, phase: number) {
  easeAwake(time, phase);
  const k = awake;
  ctx.save();
  const baseY = a.floor - v.y;
  const sky = ctx.createLinearGradient(0, 0, 0, v.vh);
  sky.addColorStop(0, '#05080d');
  sky.addColorStop(0.6, '#0b141d');
  sky.addColorStop(1, '#08101a');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, v.vw, v.vh);

  const mid = (a.left + a.right) / 2;
  // the great idol on the far wall, drifting slowly against the fight, with the glow of its eyes washing the wall
  const ix = (mid - v.x) * 0.3 + v.vw * 0.34;
  const ir = Math.max(190, v.vh * 0.42);
  stamp(ctx, runeRgb(k), ix, baseY - ir * 1.1, ir * 3.6, ir * 2.4, 0.16 + 0.1 * k);
  drawIdol(ctx, ix, baseY - ir * 1.2, ir, time, k);

  // shafts of pale light through holes in the roof, with motes turning in them
  for (let i = 0; i < 3; i++) {
    const sx = ((rand(i + 5) * v.vw * 1.2 - v.x * 0.12) % (v.vw + 200)) - 60;
    const w = 90 + rand(i + 9) * 70;
    const g = ctx.createLinearGradient(sx, 0, sx + 80, baseY);
    g.addColorStop(0, `rgba(${k > 0.5 ? '150,200,255' : '120,170,220'}, ${0.16 + 0.05 * Math.sin(time * 0.6 + i)})`);
    g.addColorStop(1, 'rgba(120, 170, 220, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(sx, 0);
    ctx.lineTo(sx + w, 0);
    ctx.lineTo(sx + w + 160, baseY);
    ctx.lineTo(sx + 110, baseY);
    ctx.closePath();
    ctx.fill();
  }

  // two ranks of pillars, the far rank paler and smaller, each wrapped in glowing runes
  for (let layer = 0; layer < 2; layer++) {
    const par = layer ? 0.62 : 0.42;
    const step = layer ? 380 : 300;
    const w = layer ? 96 : 66;
    for (let i = -2; i < v.vw / step + 3; i++) {
      const sd = i + layer * 37 + Math.floor((v.x * par) / step);
      const px = i * step - ((v.x * par) % step) + (rand(sd) - 0.5) * 40;
      // leave the wall clear around the idol so its face reads
      if (Math.abs(px - ix) < ir * (layer ? 0.9 : 1.05)) continue;
      const g = ctx.createLinearGradient(px - w / 2, 0, px + w / 2, 0);
      g.addColorStop(0, layer ? '#04070b' : '#0b121a');
      g.addColorStop(0.5, layer ? '#0f1822' : '#18242f');
      g.addColorStop(1, layer ? '#04070b' : '#0b121a');
      ctx.fillStyle = g;
      ctx.fillRect(px - w / 2, -10, w, baseY + 40);
      // bands of glyphs
      ctx.strokeStyle = `rgba(${runeRgb(k)}, ${(layer ? 0.32 : 0.2) + 0.25 * k})`;
      ctx.lineWidth = 1.6;
      for (let y = 40; y < baseY - 10; y += 70) glyph(ctx, px, y + rand(sd + y) * 20, w * 0.34, sd * 7 + y);
      // a carved cap
      ctx.fillStyle = layer ? '#0a1119' : '#111b25';
      ctx.fillRect(px - w * 0.62, baseY - 20 - (layer ? 0 : 8), w * 1.24, 14);
    }
  }

  // lianas hanging in the dark from the roof
  ctx.strokeStyle = 'rgba(12, 28, 22, 0.9)';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  for (let i = 0; i < 8; i++) {
    const lx = ((rand(i + 70) * v.vw * 1.3 - v.x * 0.5) % (v.vw + 100)) - 30;
    const len = 90 + rand(i + 80) * v.vh * 0.35;
    ctx.beginPath();
    ctx.moveTo(lx, -4);
    ctx.quadraticCurveTo(lx + Math.sin(time * 0.6 + i) * 8, len * 0.5, lx + Math.sin(time * 0.6 + i) * 12, len);
    ctx.stroke();
  }

  // glyphs adrift in the air
  for (let i = 0; i < 14; i++) {
    const gx = ((rand(i + 120) * v.vw * 1.2 + Math.sin(time * 0.3 + i) * 24) % (v.vw + 40));
    const gy = baseY - 40 - ((rand(i + 130) * (baseY - 60) + time * (8 + rand(i) * 8)) % Math.max(100, baseY - 60));
    ctx.strokeStyle = `rgba(${runeRgb(k)}, ${0.35 + 0.3 * Math.sin(time * 1.5 + i)})`;
    ctx.lineWidth = 1.4;
    glyph(ctx, gx, gy, 10 + rand(i + 140) * 8, i * 11);
  }

  // the Golem's own glow, so he reads against the dark wall
  stamp(ctx, runeRgb(k), bossX - v.x, baseY - 110, 540, 320, 0.15 + 0.1 * k);
  ctx.restore();
}

// ───────────────────────────── 2. in the world ─────────────────────────────

/** a brazier: a stone bowl on a stand with a blue flame */
function brazier(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, k: number, seed: number) {
  ctx.fillStyle = '#1b2530';
  ctx.strokeStyle = '#05080c';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - 10, y);
  ctx.lineTo(x - 6, y - 58);
  ctx.lineTo(x + 6, y - 58);
  ctx.lineTo(x + 10, y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - 24, y - 60);
  ctx.quadraticCurveTo(x, y - 36, x + 24, y - 60);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  const f = 1 + 0.2 * Math.sin(time * 9 + seed) + 0.1 * Math.sin(time * 15 + seed * 2);
  stamp(ctx, runeRgb(k), x, y - 80, 130 * f * (1 + 0.4 * k), 130 * f * (1 + 0.4 * k), 0.5);
  ctx.fillStyle = k > 0.5 ? '#d8f1ff' : '#5fb0ff';
  ctx.beginPath();
  ctx.moveTo(x - 12, y - 62);
  ctx.quadraticCurveTo(x - 14, y - 82 * f, x, y - 102 * f);
  ctx.quadraticCurveTo(x + 14, y - 82 * f, x + 12, y - 62);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#f4fbff';
  ctx.beginPath();
  ctx.ellipse(x, y - 70, 4, 9 * f, 0, 0, Math.PI * 2);
  ctx.fill();
}

export function drawGolemWorld(ctx: CanvasRenderingContext2D, a: LairArena, view: { x: number; y: number; vw: number; vh: number }, time: number) {
  const k = awake;
  // the rune circle on the floor: a flat ring of glowing arcs and glyphs under the middle of the arena, turning slowly
  const cx = (a.left + a.right) / 2;
  if (cx > view.x - 420 && cx < view.x + view.vw + 420) {
    ctx.save();
    ctx.translate(cx, a.floor - 2);
    ctx.scale(1, 0.1);
    for (const [r, lw, al] of [[340, 6, 0.5], [290, 3, 0.4], [210, 4, 0.45]] as const) {
      ctx.strokeStyle = `rgba(${runeRgb(k)}, ${(al + 0.3 * k) * (0.8 + 0.2 * Math.sin(time * 1.3))})`;
      ctx.lineWidth = lw * 3;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.lineWidth = 3;
    for (let i = 0; i < 24; i++) {
      const ang = (i / 24) * Math.PI * 2 + time * 0.05;
      ctx.strokeStyle = `rgba(${runeRgb(k)}, ${0.5 + 0.3 * k})`;
      glyph(ctx, Math.cos(ang) * 315, Math.sin(ang) * 315, 34, i * 13);
    }
    ctx.restore();
    stamp(ctx, runeRgb(k), cx, a.floor - 4, 760, 40, 0.28 + 0.2 * k);
  }
  for (const dir of [1, -1] as const) {
    const edge = dir > 0 ? a.left + 60 : a.right - 60;
    if (edge < view.x - 200 || edge > view.x + view.vw + 200) continue;
    brazier(ctx, edge, a.floor, time, k, dir * 5);
    // fallen pieces of the idol: a fist-sized chunk of carved stone and a broken hand
    ctx.fillStyle = '#25323d';
    ctx.strokeStyle = '#05080c';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(edge + dir * 70, a.floor);
    ctx.lineTo(edge + dir * 80, a.floor - 22);
    ctx.lineTo(edge + dir * 102, a.floor - 28);
    ctx.lineTo(edge + dir * 118, a.floor - 6);
    ctx.lineTo(edge + dir * 124, a.floor);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = `rgba(${runeRgb(k)}, 0.6)`;
    ctx.lineWidth = 1.6;
    glyph(ctx, edge + dir * 98, a.floor - 14, 12, dir * 31);
    ctx.fillStyle = 'rgba(46, 84, 52, 0.7)';
    ctx.beginPath();
    ctx.ellipse(edge + dir * 96, a.floor - 27, 14, 3.4, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ───────────────────────────── 3. over everything ─────────────────────────────

export function drawGolemFront(ctx: CanvasRenderingContext2D, v: LairView, time: number) {
  const k = awake;
  ctx.save();
  const vg = ctx.createRadialGradient(v.vw / 2, v.vh * 0.55, v.vh * 0.38, v.vw / 2, v.vh * 0.55, Math.max(v.vw, v.vh) * 0.78);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(0, 4, 10, 0.6)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, v.vw, v.vh);

  // dust turning in the dark
  ctx.fillStyle = 'rgba(170, 205, 235, 0.35)';
  for (let i = 0; i < 20; i++) {
    const px = ((rand(i + 300) * v.vw * 1.3 + time * (4 + rand(i) * 6)) % (v.vw + 40));
    const py = (rand(i + 310) * v.vh + time * (6 + rand(i + 2) * 8) * (1 + k)) % v.vh;
    ctx.beginPath();
    ctx.arc(px, py, 0.9 + rand(i + 5) * 1.4, 0, Math.PI * 2);
    ctx.fill();
  }
  if (k > 0.02) {
    // grit and chips of stone shaking down from the roof, and the slow pulse of the idol's heart
    ctx.fillStyle = `rgba(120, 130, 140, ${0.8 * k})`;
    for (let i = 0; i < 26; i++) {
      const ph = (time * (0.5 + rand(i) * 0.6) + rand(i + 20)) % 1;
      const gx = (rand(i + 40) * v.vw * 1.1 + Math.sin(time * 3 + i) * 3) % v.vw;
      ctx.fillRect(gx, ph * v.vh, 2 + rand(i + 60) * 3, 2 + rand(i + 61) * 4);
    }
    const beat = Math.max(0, Math.sin(time * 2.6)) ** 4;
    ctx.fillStyle = `rgba(110, 180, 255, ${(0.02 + 0.06 * beat) * k})`;
    ctx.fillRect(0, 0, v.vw, v.vh);
  }
  ctx.restore();
}
