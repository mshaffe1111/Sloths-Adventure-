/**
 * The Tarantula Queen's lair: the Silk Hollow. The inside of a vast hollow tree-cavern, black-green and damp, hung with silk. A giant orb
 * web fills the far wall, cocoons dangle in the dark on single threads, patches of glow-fungus give the only light and the brood's egg
 * sacs are heaped at both ends of the arena. When she is down to a third of her strength the brood hatches: the sacs burst, the glow
 * turns from cold teal to angry red, pairs of small red eyes open all over the walls and spiderlings drop on threads from the roof.
 *
 * Same layers as the other lairs (lairArt.ts): back (screen space, opaque), world (egg sacs, silk guy-lines, husks) and front (screen space:
 * vignette, drifting strands, the brood). The floor, ledges, trunks and silk ropes are in lairQueenObjects.ts.
 *
 * Glow is stamped from small pre-drawn soft sprites (drawImage), never shadowBlur, so the lair costs next to nothing on a phone.
 */
import type { LairArena, LairView } from './lairArt.ts';
import { rand, stamp } from './lairKit.ts';

// ───────────────────────────── the brood level ─────────────────────────────

/** 0 = the quiet hollow, 1 = the brood has hatched. Eased toward the target; snaps on a new fight or a retry. */
let brood = 0;
let lastT = -1;

function easeBrood(time: number, phase: number) {
  const target = phase >= 3 ? 1 : 0;
  const dt = time - lastT;
  if (lastT < 0 || dt < 0 || dt > 1) brood = target;
  else brood += (target - brood) * Math.min(1, dt * 1.1);
  lastT = time;
}

/** how far the brood has hatched (the objects file warms its glow with it) */
export function queenBrood(): number {
  return brood;
}

/** the glow colour: cold teal in the quiet hollow, hot red-magenta once the brood has hatched */
export function glowRgb(k: number): string {
  return k > 0.5 ? '255,70,90' : '90,235,200';
}

// ───────────────────────────── 1. the back wall ─────────────────────────────

/** a cocoon on a thread: a pale wrapped oval, longer than wide, with bands of silk; in the brood one splits and glows */
function cocoon(ctx: CanvasRenderingContext2D, x: number, top: number, len: number, w: number, h: number, seed: number, time: number, k: number) {
  const sway = Math.sin(time * 0.8 + seed) * 4;
  const cx = x + sway;
  const cy = top + len;
  ctx.strokeStyle = 'rgba(190, 200, 215, 0.4)';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(x, top);
  ctx.lineTo(cx, cy - h / 2);
  ctx.stroke();
  const g = ctx.createLinearGradient(cx - w / 2, 0, cx + w / 2, 0);
  g.addColorStop(0, '#3b4252');
  g.addColorStop(0.5, '#9aa3b8');
  g.addColorStop(1, '#4b5266');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(cx, cy, w / 2, h / 2, sway * 0.01, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(20, 24, 36, 0.5)';
  ctx.lineWidth = 1.2;
  for (let b = -2; b <= 2; b++) {
    ctx.beginPath();
    ctx.ellipse(cx, cy + b * h * 0.17, w * 0.5 * Math.sqrt(1 - (b * 0.34) ** 2), 2.6, 0, 0, Math.PI);
    ctx.stroke();
  }
  // something is moving inside some of them
  if (rand(seed + 3) < 0.45) stamp(ctx, glowRgb(k), cx, cy, w * 1.5, h * 1.1, (0.18 + 0.12 * Math.sin(time * 2 + seed)) * (1 + k));
}

/** the great orb web on the far wall: spokes, a spiral, dew */
function drawOrbWeb(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, time: number, k: number) {
  const spokes = 14;
  ctx.save();
  ctx.lineCap = 'round';
  ctx.strokeStyle = `rgba(206, 216, 236, ${0.3 + 0.08 * Math.sin(time * 0.5)})`;
  ctx.lineWidth = 1.6;
  for (let i = 0; i < spokes; i++) {
    const a = (i / spokes) * Math.PI * 2 + 0.2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(a) * r * 1.15, cy + Math.sin(a) * r * 1.15);
    ctx.stroke();
  }
  ctx.lineWidth = 1.2;
  for (let ring = 1; ring <= 11; ring++) {
    const rr = (ring / 11) * r;
    ctx.beginPath();
    for (let i = 0; i <= spokes; i++) {
      const a = (i / spokes) * Math.PI * 2 + 0.2;
      // threads sag between spokes
      const sag = 1 - 0.07 * Math.sin(((i % 1) + 0.5) * Math.PI);
      const sx = cx + Math.cos(a) * rr * sag;
      const sy = cy + Math.sin(a) * rr * sag + 3 * Math.sin(ring + i);
      if (i === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.stroke();
  }
  // dew on the threads, catching the glow
  for (let i = 0; i < 26; i++) {
    const a = rand(i + 1) * Math.PI * 2;
    const rr = (0.2 + rand(i + 40) * 0.8) * r;
    stamp(ctx, glowRgb(k), cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, 9, 9, 0.5 + 0.3 * Math.sin(time * 1.5 + i));
  }
  ctx.restore();
}

export function drawQueenBack(ctx: CanvasRenderingContext2D, v: LairView, a: LairArena, time: number, bossX: number, phase: number) {
  easeBrood(time, phase);
  const k = brood;
  ctx.save();
  // the black-green of a hollow tree, warming to a bruised red in the brood
  const sky = ctx.createLinearGradient(0, 0, 0, v.vh);
  sky.addColorStop(0, k > 0.5 ? '#190a12' : '#07100e');
  sky.addColorStop(0.55, k > 0.5 ? '#2a0f1c' : '#0f1b18');
  sky.addColorStop(1, k > 0.5 ? '#1a0a12' : '#0a1210');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, v.vw, v.vh);
  if (k > 0.02 && k < 0.98) {
    // cross-fade: the other palette over the first, so the change is a slow bleed and not a pop
    const s2 = ctx.createLinearGradient(0, 0, 0, v.vh);
    s2.addColorStop(0, '#190a12');
    s2.addColorStop(0.55, '#2a0f1c');
    s2.addColorStop(1, '#1a0a12');
    ctx.globalAlpha = k;
    ctx.fillStyle = s2;
    ctx.fillRect(0, 0, v.vw, v.vh);
    ctx.globalAlpha = 1;
  }

  const mid = (a.left + a.right) / 2;
  const baseY = a.floor - v.y;

  // far glow patches of fungus on the hollow's wall
  const glow = glowRgb(k);
  for (let i = 0; i < 9; i++) {
    const px = ((rand(i) * 2400 - (v.x * 0.2)) % (v.vw + 600) + v.vw + 600) % (v.vw + 600) - 300;
    stamp(ctx, glow, px, baseY - 80 - rand(i + 7) * v.vh * 0.5, 280 + rand(i + 3) * 240, 170 + rand(i + 5) * 130, (0.14 + 0.06 * Math.sin(time * 0.7 + i)) * (1 + k * 0.8));
  }

  // the great orb web behind the arena, drifting slowly against the fight
  const wx = (mid - v.x) * 0.4 + v.vw * 0.3;
  const wr = Math.max(300, v.vh * 0.62);
  drawOrbWeb(ctx, wx, baseY - wr * 0.62, wr, time, k);
  // the Queen's own glow, so she reads against it
  stamp(ctx, glow, bossX - v.x, baseY - 70, 520, 280, 0.2 + 0.12 * k);

  // root columns of the hollow in two depths, black against the glow
  for (let layer = 0; layer < 2; layer++) {
    const par = layer ? 0.7 : 0.45;
    ctx.fillStyle = layer ? 'rgba(5, 9, 8, 0.92)' : 'rgba(10, 18, 16, 0.85)';
    const step = layer ? 430 : 360;
    for (let i = -2; i < v.vw / step + 3; i++) {
      const sd = i + layer * 31 + Math.floor((v.x * par) / step);
      const px = i * step - ((v.x * par) % step) + (rand(sd) - 0.5) * 120;
      const w = 50 + rand(sd + 4) * (layer ? 70 : 50);
      ctx.beginPath();
      ctx.moveTo(px - w * 0.5, baseY + 30);
      ctx.quadraticCurveTo(px - w * 0.3, baseY - v.vh * 0.45, px - w * 0.18, -10);
      ctx.lineTo(px + w * 0.2, -10);
      ctx.quadraticCurveTo(px + w * 0.34, baseY - v.vh * 0.5, px + w * 0.55, baseY + 30);
      ctx.closePath();
      ctx.fill();
    }
  }

  // cocoons hanging at three depths
  for (let i = 0; i < 9; i++) {
    const par = 0.35 + (i % 3) * 0.2;
    const cx = ((rand(i + 80) * 2600 - v.x * par) % (v.vw + 400) + v.vw + 400) % (v.vw + 400) - 200;
    const len = 60 + rand(i + 90) * v.vh * 0.28;
    cocoon(ctx, cx, -10, len, 26 + rand(i + 91) * 16, 60 + rand(i + 92) * 30, i + 100, time, k);
  }

  // the brood's eyes in the dark: pairs of small red lights that open as it hatches
  if (k > 0.05) {
    for (let i = 0; i < 26; i++) {
      const open = Math.max(0, Math.min(1, (k - rand(i + 200) * 0.5) * 2));
      if (open <= 0) continue;
      const ex = ((rand(i + 210) * 2800 - v.x * 0.6) % (v.vw + 200) + v.vw + 200) % (v.vw + 200) - 100;
      const ey = baseY - 30 - rand(i + 220) * v.vh * 0.62;
      const blink = Math.sin(time * 1.3 + i * 2.1) > 0.93 ? 0.1 : 1;
      ctx.globalAlpha = open * blink;
      for (const dx of [-5, 5]) stamp(ctx, '255,60,70', ex + dx, ey, 11, 11, 1);
      ctx.globalAlpha = 1;
    }
  }

  // spores drifting up out of the dark
  ctx.fillStyle = k > 0.5 ? 'rgba(255, 150, 160, 0.4)' : 'rgba(170, 255, 230, 0.4)';
  for (let i = 0; i < 24; i++) {
    const px = ((rand(i + 300) * v.vw * 1.3 + time * (6 + rand(i) * 8)) % (v.vw + 40));
    const py = v.vh - ((rand(i + 310) * v.vh + time * (10 + rand(i + 2) * 12)) % v.vh);
    ctx.beginPath();
    ctx.arc(px, py, 1 + rand(i + 5) * 1.6, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// ───────────────────────────── 2. in the world ─────────────────────────────

/** a heap of egg sacs: pale sacs with the dark shapes of spiderlings curled inside; in the brood they split and the glow shows through */
function eggHeap(ctx: CanvasRenderingContext2D, x: number, y: number, dir: 1 | -1, time: number, k: number) {
  const n = 7;
  for (let i = 0; i < n; i++) {
    const sx = x + dir * (i % 4) * 26 - dir * (i > 3 ? 12 : 0) + (rand(i + 50) - 0.5) * 8;
    const r = 17 + rand(i + 51) * 9 - (i > 3 ? 4 : 0);
    const sy = y - r * 0.7 - (i > 3 ? 24 : 0);
    const g = ctx.createRadialGradient(sx - r * 0.3, sy - r * 0.4, 2, sx, sy, r * 1.05);
    g.addColorStop(0, '#e9ecf4');
    g.addColorStop(0.7, '#9ba3b8');
    g.addColorStop(1, '#565d72');
    ctx.fillStyle = g;
    ctx.strokeStyle = 'rgba(15, 18, 28, 0.75)';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.ellipse(sx, sy, r, r * 0.86, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // the shapes inside
    ctx.fillStyle = 'rgba(30, 20, 28, 0.35)';
    ctx.beginPath();
    ctx.ellipse(sx + 2, sy + 2, r * 0.4, r * 0.3, 0.4, 0, Math.PI * 2);
    ctx.fill();
    if (k > 0.3) {
      // split open, glowing
      ctx.strokeStyle = '#1a0a10';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(sx - r * 0.5, sy - r * 0.2);
      ctx.lineTo(sx, sy + r * 0.1);
      ctx.lineTo(sx + r * 0.45, sy - r * 0.3);
      ctx.stroke();
      stamp(ctx, '255,70,90', sx, sy, r * 2.6, r * 2.2, 0.35 * k * (0.8 + 0.2 * Math.sin(time * 3 + i)));
    }
  }
  stamp(ctx, glowRgb(k), x + dir * 40, y - 24, 170, 90, 0.18 + 0.1 * k);
}

/** silk guy-lines from the roof to the ground at both ends, and a dried husk or two on the floor */
function guyLines(ctx: CanvasRenderingContext2D, x: number, y: number, dir: 1 | -1, top: number) {
  ctx.strokeStyle = 'rgba(214, 222, 240, 0.4)';
  ctx.lineWidth = 1.6;
  for (let i = 0; i < 4; i++) {
    const tx = x + dir * (30 + i * 52);
    ctx.beginPath();
    ctx.moveTo(tx - dir * 16, top);
    ctx.quadraticCurveTo(tx - dir * 6, (top + y) / 2, tx, y - 2);
    ctx.stroke();
  }
  // webbing across the ground, a flat fan with radiating threads
  ctx.strokeStyle = 'rgba(214, 222, 240, 0.3)';
  ctx.lineWidth = 1.2;
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.moveTo(x + dir * 14, y - 1);
    ctx.lineTo(x + dir * (70 + i * 22), y - 1 - (i % 2) * 4);
    ctx.stroke();
  }
}

export function drawQueenWorld(ctx: CanvasRenderingContext2D, a: LairArena, view: { x: number; y: number; vw: number; vh: number }, time: number) {
  const k = brood;
  const top = view.y - 20;
  for (const dir of [1, -1] as const) {
    const edge = dir > 0 ? a.left + 40 : a.right - 40;
    if (edge < view.x - 260 || edge > view.x + view.vw + 260) continue;
    guyLines(ctx, edge, a.floor, dir, top);
    eggHeap(ctx, edge + dir * 26, a.floor, dir, time, k);
  }
  // husks of past meals, drained and curled: a leaf-green beetle shell and a bundle of wrapped bones
  for (const [fx, f] of [[0.28, 1], [0.62, 2], [0.86, 3]] as const) {
    const x = a.left + (a.right - a.left) * fx;
    if (x < view.x - 40 || x > view.x + view.vw + 40) continue;
    ctx.save();
    ctx.translate(x, a.floor - 1);
    if (f === 1) {
      ctx.fillStyle = '#3f6b3a';
      ctx.strokeStyle = '#142014';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.ellipse(0, -5, 15, 8, 0, Math.PI, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (f === 2) {
      ctx.strokeStyle = '#d6d2c2';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-14, -3);
      ctx.lineTo(10, -7);
      ctx.moveTo(-8, -9);
      ctx.lineTo(14, -2);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(214, 222, 240, 0.7)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(-16, -5);
      ctx.lineTo(16, -5);
      ctx.stroke();
    } else {
      ctx.fillStyle = '#b8b8c8';
      ctx.beginPath();
      ctx.ellipse(0, -5, 12, 6, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

// ───────────────────────────── 3. over everything ─────────────────────────────

export function drawQueenFront(ctx: CanvasRenderingContext2D, v: LairView, time: number) {
  const k = brood;
  ctx.save();
  // heavy vignette: a hollow is dark at the edges
  const vg = ctx.createRadialGradient(v.vw / 2, v.vh * 0.55, v.vh * 0.35, v.vw / 2, v.vh * 0.55, Math.max(v.vw, v.vh) * 0.78);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, k > 0.5 ? 'rgba(40, 0, 10, 0.62)' : 'rgba(0, 6, 4, 0.6)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, v.vw, v.vh);

  // loose strands of silk drifting across the view
  ctx.strokeStyle = 'rgba(220, 228, 244, 0.2)';
  ctx.lineWidth = 1.3;
  for (let i = 0; i < 5; i++) {
    const x = ((rand(i + 400) * v.vw * 1.2 + time * (14 + i * 4)) % (v.vw + 200)) - 100;
    const y = v.vh * (0.12 + rand(i + 410) * 0.5);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + 40, y - 18 + Math.sin(time + i) * 8, x + 90, y + 6);
    ctx.stroke();
  }

  // spiderlings lowering and hauling themselves back up their own threads; more of them once the brood has hatched
  const n = Math.round(2 + 8 * k);
  for (let i = 0; i < n; i++) {
    const x = (rand(i + 500) * 0.9 + 0.05) * v.vw;
    const cycle = 6 + rand(i + 510) * 5;
    const u = ((time + rand(i + 520) * cycle) % cycle) / cycle;
    const drop = Math.sin(u * Math.PI) * v.vh * (0.14 + rand(i + 530) * 0.2);
    ctx.strokeStyle = 'rgba(220, 228, 244, 0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, drop);
    ctx.stroke();
    ctx.fillStyle = '#0b0a10';
    ctx.beginPath();
    ctx.arc(x, drop + 3, 3.4, 0, Math.PI * 2);
    ctx.fill();
    if (k > 0.3) stamp(ctx, '255,60,70', x, drop + 3, 8, 8, 0.8);
  }

  // the red pulse of a hatching brood
  if (k > 0.02) {
    ctx.fillStyle = `rgba(150, 0, 30, ${(0.05 + 0.04 * Math.sin(time * 3)) * k})`;
    ctx.fillRect(0, 0, v.vw, v.vh);
  }
  ctx.restore();
}
