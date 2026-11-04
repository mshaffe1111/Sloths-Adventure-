/**
 * The small code touches that show World 1's tricks (w1Tricks.ts, R-159.1); the lead's calls, 2026-11-04:
 *   - the stun's stars: five circling over a dazed snake's head the whole daze, blinking in its last 0.3 s (it is waking);
 *   - the armoured coil: a glint on the coiled boa, so its armour reads before it is touched; its tell (the coil tightens before it
 *     strikes) is a squeeze and a darkening of the coil, with the glint pulsing (the painted tighten clip came out still);
 *   - the rolling boa, until its painted ball is cut in: its coil frame turned as a wheel.
 * Each is a few paths a frame, only for the World 1 animals that carry a trick.
 */
import type { Enemy } from './types.ts';
import { isCoiled, isDazed, starsShown } from './w1Tricks.ts';

function star(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.beginPath();
  for (let k = 0; k < 10; k++) {
    const rr = k % 2 === 0 ? r : r * 0.42;
    const a = -Math.PI / 2 + (k * Math.PI) / 5;
    const px = x + rr * Math.cos(a);
    const py = y + rr * Math.sin(a);
    if (k === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

/** the stars over a dazed (or stiff) trick snake's head; drawn in world space, after the snake */
export function drawTrickStars(ctx: CanvasRenderingContext2D, e: Enemy, t: number): void {
  if (e.defeated || !isDazed(e) || starsShown(e, t) === 0) return;
  const cx = e.x;
  const cy = e.y - 30;
  ctx.save();
  ctx.fillStyle = '#ffe25a';
  ctx.strokeStyle = '#784610';
  ctx.lineWidth = 1.6;
  for (let i = 0; i < 5; i++) {
    const a = t * 4.2 + (i * 2 * Math.PI) / 5;
    // (a flat ring seen from the side: the stars behind the head are a little smaller)
    const depth = 0.8 + 0.2 * Math.sin(a);
    star(ctx, cx + Math.cos(a) * 20, cy + Math.sin(a) * 6, 7 * depth);
  }
  ctx.restore();
}

/** the coiled boa's tell: how hard the coil is squeezed now (0 lying still, 1 at the strike), from its 'rear' wind-up */
export function coilSqueeze(e: Enemy): number {
  if (e.trick !== 'coil' || e.state !== 'rear') return 0;
  return Math.min(1, (e.stateT ?? 0) / 0.6);
}

/** squash the coil around its feet while it tightens (called around the boa's own drawing) */
export function withCoilSqueeze(ctx: CanvasRenderingContext2D, e: Enemy, feetY: number, paint: () => void): void {
  const q = coilSqueeze(e);
  if (q <= 0) {
    paint();
    return;
  }
  ctx.save();
  ctx.translate(e.x, feetY);
  ctx.scale(1 - 0.1 * q, 1 + 0.1 * q);
  ctx.translate(-e.x, -feetY);
  paint();
  ctx.restore();
  // (it darkens as it tightens: a shade over the coil, not over the ground)
  ctx.save();
  ctx.globalAlpha = 0.28 * q;
  ctx.fillStyle = '#2a1608';
  ctx.beginPath();
  ctx.ellipse(e.x, feetY - 12, 30, 13, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** the glints on the armoured coil (always while coiled; pulsing faster as it tightens) */
export function drawCoilGlint(ctx: CanvasRenderingContext2D, e: Enemy, t: number): void {
  if (e.defeated || !isCoiled(e)) return;
  const q = coilSqueeze(e);
  const pulse = 0.55 + 0.45 * Math.sin(t * (q > 0 ? 18 : 3) + e.id);
  ctx.save();
  ctx.fillStyle = '#fffbe8';
  ctx.globalAlpha = Math.max(0.25, pulse);
  for (const [dx, dy, r] of [[-12, -16, 7], [8, -20, 5], [16, -10, 4]] as const) {
    const x = e.x + dx * (e.facing > 0 ? 1 : -1);
    const y = e.y + dy + 8;
    const rr = r * (0.8 + 0.4 * pulse);
    ctx.beginPath();
    ctx.moveTo(x, y - rr);
    ctx.lineTo(x + rr * 0.25, y - rr * 0.25);
    ctx.lineTo(x + rr, y);
    ctx.lineTo(x + rr * 0.25, y + rr * 0.25);
    ctx.lineTo(x, y + rr);
    ctx.lineTo(x - rr * 0.25, y + rr * 0.25);
    ctx.lineTo(x - rr, y);
    ctx.lineTo(x - rr * 0.25, y - rr * 0.25);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

/** the rolling boa: the turn of the ball (radians), from how far it has rolled */
export const rollAngle = (e: Enemy) => ((e.stateT ?? 0) * 360 * (e.slideDir ?? 1)) / 18;
