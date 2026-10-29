/**
 * The Tarantula Queen's lair: the Silk Hollow. The inside of a vast hollow tree-cavern, black-green and damp, hung with silk. A giant orb
 * web fills the far wall, cocoons dangle in the dark on single threads, patches of glow-fungus give the only light and the brood's egg
 * sacs are heaped at both ends of the arena. When she is down to a third of her strength the brood hatches: the sacs burst, the glow
 * turns from cold teal to angry red, pairs of small red eyes open all over the walls and spiderlings drop on threads from the roof.
 *
 * Same layers as the other lairs (lairArt.ts): back (screen space, opaque), world (silk guy-lines) and front (screen space:
 * vignette, drifting strands, the brood). The floor, ledges, trunks and silk ropes are in lairQueenObjects.ts.
 *
 * The back wall is Matt's painting (lair-queen-calm and -rage); glow is stamped from small pre-drawn soft sprites (drawImage), never
 * shadowBlur, so the lair costs next to nothing on a phone.
 */
import type { LairArena, LairView } from './lairArt.ts';
import { rand, stamp } from './lairKit.ts';
import { LairPlate } from './lairPlate.ts';

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

/**
 * Matt's painted Silk Hollow (lair-queen-calm / -rage, w6to10/lairs): the hollow tree-cavern with its orb web, cocoons, glow-fungus and
 * the tea table, and its hatched twin with the burst egg sacs and the brood's red eyes. The rage painting bleeds in with the brood.
 */
const PLATE = new LairPlate({
  calm: new URL('../assets/w6to10/lairs/lair-queen-calm.webp', import.meta.url).href,
  rage: new URL('../assets/w6to10/lairs/lair-queen-rage.webp', import.meta.url).href,
  floorAt: 0.86,
  widthK: 1.2,
  drift: 0.22,
  fill: '#07100e',
  // the top of the painting is the canopy: a tall screen grows it to fit rather than show the canopy mirrored
  cover: true,
});

export function drawQueenBack(ctx: CanvasRenderingContext2D, v: LairView, a: LairArena, time: number, bossX: number, phase: number) {
  easeBrood(time, phase);
  const k = brood;
  ctx.save();
  PLATE.draw(ctx, v, a, k);
  const baseY = a.floor - v.y;
  // the Queen's own glow, so she reads against the dark wall
  stamp(ctx, glowRgb(k), bossX - v.x, baseY - 70, 520, 280, 0.16 + 0.12 * k);
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

export function drawQueenWorld(ctx: CanvasRenderingContext2D, a: LairArena, view: { x: number; y: number; vw: number; vh: number }, _time: number) {
  const top = view.y - 20;
  for (const dir of [1, -1] as const) {
    const edge = dir > 0 ? a.left + 40 : a.right - 40;
    if (edge < view.x - 260 || edge > view.x + view.vw + 260) continue;
    guyLines(ctx, edge, a.floor, dir, top);
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
