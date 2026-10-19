/**
 * A boss's lair is its home, so every boss that has one gets its own look: a darker, re-coloured backdrop with something huge
 * behind the fight, a raised dais with glowing runes under it, things the creature lives among (bones, eggs), carved pillars outside
 * the fence and a dark vignette over everything. All of it is drawn in code from the world's own backdrop, so it can be tried
 * before any new painting exists.
 *
 * Three layers, drawn by the engine in this order:
 *   back   screen space, right after the world's parallax backdrop (darken, glow, the great shape behind the arena, light shafts)
 *   world  in the world, after the ground and ledges and before the fighters (dais, runes, bones, eggs, pillars)
 *   front  screen space, last (vignette and the cave ceiling)
 */

export type LairKind = 'drake';

export interface LairView {
  /** camera top-left in the world, and the size of the view in world units */
  x: number;
  y: number;
  vw: number;
  vh: number;
}

export interface LairArena {
  left: number;
  right: number;
  floor: number;
}

interface Kit {
  /** darkness laid over the world backdrop */
  dim: string;
  glow: [number, number, number];
  rune: string;
  runeHot: string;
  stone: [string, string];
  ember: string;
}

const KITS: Record<LairKind, Kit> = {
  drake: {
    dim: 'rgba(14, 5, 2, 0.58)',
    glow: [255, 110, 30],
    rune: '#f97316',
    runeHot: '#fde68a',
    stone: ['#3a2a22', '#140a07'],
    ember: '#fdba74',
  },
};

/** a tiny repeatable random so set pieces do not jitter from frame to frame */
function rand(i: number): number {
  const s = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}

/** 1. over the world backdrop: it is darkened and re-lit so the fight happens in front of the creature's own volcano */
export function drawLairBack(ctx: CanvasRenderingContext2D, kind: LairKind, v: LairView, a: LairArena, time: number, bossX: number) {
  const k = KITS[kind];
  const [r, g, b] = k.glow;
  ctx.save();
  ctx.fillStyle = k.dim;
  ctx.fillRect(0, 0, v.vw, v.vh);

  // the great shape behind the arena: a volcano that moves slowly against the fight, crater glowing
  const mid = (a.left + a.right) / 2;
  const cx = (mid - v.x) * 0.55 + v.vw * 0.22;
  const baseY = a.floor - v.y + 20;
  const h = Math.max(420, v.vh * 0.95);
  const wBase = Math.max(900, v.vw * 1.25);
  const body = ctx.createLinearGradient(0, baseY - h, 0, baseY);
  body.addColorStop(0, '#1a0a06');
  body.addColorStop(1, '#0b0403');
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.moveTo(cx - wBase / 2, baseY);
  ctx.lineTo(cx - wBase * 0.07, baseY - h);
  ctx.lineTo(cx + wBase * 0.07, baseY - h);
  ctx.lineTo(cx + wBase / 2, baseY);
  ctx.closePath();
  ctx.fill();
  // lava seams running down the slopes
  ctx.strokeStyle = `rgba(${r},${g},${b},${0.55 + 0.2 * Math.sin(time * 2)})`;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  for (let i = 0; i < 6; i++) {
    const s = (i - 2.5) / 2.5;
    ctx.beginPath();
    ctx.moveTo(cx + s * wBase * 0.05, baseY - h + 8);
    ctx.bezierCurveTo(cx + s * wBase * 0.16, baseY - h * 0.7, cx + s * wBase * 0.22 + rand(i) * 40, baseY - h * 0.4, cx + s * wBase * 0.34, baseY - h * 0.05);
    ctx.stroke();
  }
  // the crater's glow, and the sky it lights
  const cr = ctx.createRadialGradient(cx, baseY - h, 6, cx, baseY - h, h * 0.9);
  cr.addColorStop(0, `rgba(255, 220, 140, ${0.85 + 0.1 * Math.sin(time * 3)})`);
  cr.addColorStop(0.18, `rgba(${r},${g},${b},0.6)`);
  cr.addColorStop(1, `rgba(${r},${g},${b},0)`);
  ctx.fillStyle = cr;
  ctx.fillRect(0, 0, v.vw, v.vh);

  // light shafts from the top, slowly breathing
  for (let i = 0; i < 4; i++) {
    const sx = v.vw * (0.12 + i * 0.26) + Math.sin(time * 0.25 + i) * 30;
    ctx.globalAlpha = 0.1 + 0.05 * Math.sin(time * 0.7 + i * 2);
    const gr = ctx.createLinearGradient(sx, 0, sx + 90, v.vh * 0.85);
    gr.addColorStop(0, `rgba(255, 200, 120, 0.9)`);
    gr.addColorStop(1, `rgba(255, 200, 120, 0)`);
    ctx.fillStyle = gr;
    ctx.beginPath();
    ctx.moveTo(sx - 26, 0);
    ctx.lineTo(sx + 26, 0);
    ctx.lineTo(sx + 160, v.vh * 0.85);
    ctx.lineTo(sx + 10, v.vh * 0.85);
    ctx.closePath();
    ctx.fill();
  }

  // heat around the boss
  ctx.globalAlpha = 0.22;
  const bx = bossX - v.x;
  const hg = ctx.createRadialGradient(bx, a.floor - v.y - 120, 20, bx, a.floor - v.y - 120, 420);
  hg.addColorStop(0, `rgba(${r},${g},${b},0.9)`);
  hg.addColorStop(1, `rgba(${r},${g},${b},0)`);
  ctx.fillStyle = hg;
  ctx.fillRect(0, 0, v.vw, v.vh);

  // embers rising through the whole view
  ctx.globalAlpha = 1;
  ctx.fillStyle = k.ember;
  for (let i = 0; i < 34; i++) {
    const ph = (time * (0.05 + rand(i) * 0.08) + rand(i + 50)) % 1;
    const ex = (rand(i + 9) * v.vw * 1.2 + Math.sin(time + i) * 14) % v.vw;
    const ey = v.vh * (1.05 - ph * 1.1);
    ctx.globalAlpha = Math.sin(ph * Math.PI) * 0.8;
    ctx.fillRect(ex, ey, 2 + rand(i + 3) * 2, 2 + rand(i + 3) * 2);
  }
  ctx.restore();
}

/** 2. in the world: the dais, runes, the things the creature lives among, and carved pillars outside the fence */
export function drawLairWorld(ctx: CanvasRenderingContext2D, kind: LairKind, a: LairArena, view: LairView, time: number) {
  const k = KITS[kind];
  const f = a.floor;
  const x0 = Math.max(view.x - 40, a.left - 360);
  const x1 = Math.min(view.x + view.vw + 40, a.right + 360);

  // a raised stone dais over the ground: a lip with a glowing line, and diamonds in it
  ctx.save();
  const x2 = a.left - 30;
  const x3 = a.right + 30;
  const dais = ctx.createLinearGradient(0, f - 14, 0, f + 28);
  dais.addColorStop(0, '#5a4034');
  dais.addColorStop(1, '#1b0e09');
  ctx.fillStyle = dais;
  ctx.fillRect(x2, f - 10, x3 - x2, 38);
  ctx.fillStyle = k.stone[1];
  ctx.fillRect(x2 - 14, f + 10, 14, 18);
  ctx.fillRect(x3, f + 10, 14, 18);
  const pulse = 0.65 + 0.25 * Math.sin(time * 2.2);
  ctx.strokeStyle = k.rune;
  ctx.globalAlpha = pulse;
  ctx.lineWidth = 3;
  ctx.shadowColor = k.rune;
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.moveTo(x2, f - 9);
  ctx.lineTo(x3, f - 9);
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 0.9;
  for (let x = x2 + 70; x < x3 - 20; x += 110) {
    if (x < x0 || x > x1) continue;
    ctx.fillStyle = k.rune;
    ctx.beginPath();
    ctx.moveTo(x, f + 2);
    ctx.lineTo(x + 8, f + 11);
    ctx.lineTo(x, f + 20);
    ctx.lineTo(x - 8, f + 11);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = k.runeHot;
    ctx.globalAlpha = 0.5 + 0.4 * Math.sin(time * 3 + x);
    ctx.fillRect(x - 1.5, f + 8, 3, 6);
    ctx.globalAlpha = 0.9;
  }
  ctx.restore();

  // the nest: a clutch of eggs in a bed of ash on the far right, and the rib bones of something it ate on the left
  ctx.save();
  const ex = a.right - 40;
  if (ex > x0 && ex < x1 + 400) {
    ctx.fillStyle = '#1a0d08';
    ctx.beginPath();
    ctx.ellipse(ex, f - 6, 150, 18, 0, Math.PI, 0);
    ctx.fill();
    for (let i = 0; i < 5; i++) {
      const gx = ex - 90 + i * 44 + (rand(i) - 0.5) * 12;
      const gy = f - 14 - (i % 2) * 8;
      const glow = 0.5 + 0.4 * Math.sin(time * 1.6 + i * 1.3);
      const eg = ctx.createRadialGradient(gx - 5, gy - 8, 3, gx, gy, 24);
      eg.addColorStop(0, '#ffe9b8');
      eg.addColorStop(0.4, `rgba(251, 146, 60, ${0.55 + glow * 0.4})`);
      eg.addColorStop(1, '#5a1d0a');
      ctx.fillStyle = eg;
      ctx.beginPath();
      ctx.ellipse(gx, gy, 17, 23, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,.45)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }
  const bx = a.left + 70;
  if (bx > x0 - 200 && bx < x1) {
    ctx.strokeStyle = '#e7d9c0';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    for (let i = 0; i < 5; i++) {
      const rx = bx + i * 20;
      ctx.beginPath();
      ctx.moveTo(rx, f - 8);
      ctx.quadraticCurveTo(rx + 14, f - 58 - i * 4, rx - 18, f - 74 + i * 6);
      ctx.stroke();
    }
    ctx.strokeStyle = '#cdbf9f';
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.moveTo(bx - 14, f - 6);
    ctx.lineTo(bx + 112, f - 6);
    ctx.stroke();
  }
  ctx.restore();

  // carved pillars outside the fence, so the arena reads as a room with walls
  ctx.save();
  for (const side of [-1, 1] as const) {
    const px = side < 0 ? a.left - 250 : a.right + 110;
    if (px + 140 < view.x - 40 || px > view.x + view.vw + 40) continue;
    const top = view.y - 40;
    const gr = ctx.createLinearGradient(px, 0, px + 140, 0);
    gr.addColorStop(0, k.stone[0]);
    gr.addColorStop(0.5, '#241410');
    gr.addColorStop(1, k.stone[1]);
    ctx.fillStyle = gr;
    ctx.fillRect(px, top, 140, f - top + 30);
    ctx.strokeStyle = `rgba(255,120,40,${0.5 + 0.25 * Math.sin(time * 2 + side)})`;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let y = f - 40; y > top; y -= 130) {
      ctx.moveTo(px + 20, y);
      ctx.lineTo(px + 70, y - 22);
      ctx.lineTo(px + 120, y);
    }
    ctx.stroke();
    ctx.fillStyle = 'rgba(0,0,0,.45)';
    ctx.fillRect(side < 0 ? px + 140 - 18 : px, top, 18, f - top + 30);
  }
  ctx.restore();
}

/** 3. over everything: a dark vignette and the cave's own ceiling, so the eye goes to the fight */
export function drawLairFront(ctx: CanvasRenderingContext2D, kind: LairKind, v: LairView, time: number) {
  const k = KITS[kind];
  const [r, g, b] = k.glow;
  ctx.save();
  const vg = ctx.createRadialGradient(v.vw / 2, v.vh * 0.62, Math.min(v.vw, v.vh) * 0.35, v.vw / 2, v.vh * 0.62, Math.max(v.vw, v.vh) * 0.75);
  vg.addColorStop(0, 'rgba(8, 2, 1, 0)');
  vg.addColorStop(1, 'rgba(8, 2, 1, 0.62)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, v.vw, v.vh);
  // the ceiling: dark rock with a few teeth, lit from below by the lava
  const cy = Math.min(v.vh * 0.2, 150);
  const cg = ctx.createLinearGradient(0, 0, 0, cy + 40);
  cg.addColorStop(0, 'rgba(8, 3, 2, 0.92)');
  cg.addColorStop(0.7, 'rgba(8, 3, 2, 0.5)');
  cg.addColorStop(1, 'rgba(8, 3, 2, 0)');
  ctx.fillStyle = cg;
  ctx.fillRect(0, 0, v.vw, cy + 40);
  ctx.fillStyle = 'rgba(10, 4, 2, 0.95)';
  for (let i = 0; i < 12; i++) {
    const tx = (i + rand(i + 1) * 0.6) * (v.vw / 11);
    const th = 22 + rand(i + 5) * 46;
    ctx.beginPath();
    ctx.moveTo(tx - 24, 0);
    ctx.lineTo(tx + 24, 0);
    ctx.lineTo(tx + (rand(i + 7) - 0.5) * 10, th);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = `rgba(${r},${g},${b},${0.25 + 0.12 * Math.sin(time * 3 + i)})`;
    ctx.beginPath();
    ctx.arc(tx, th - 2, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(10, 4, 2, 0.95)';
  }
  ctx.restore();
}
