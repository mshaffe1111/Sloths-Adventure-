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
  // (the main signal: a clear ring of big stars, as the boards showed)
  // (centred on the snake, not on the head: he stands at its head when he punches, and the ring sat on him)
  const cx = e.x - e.facing * 6;
  const cy = e.y - 58;
  ctx.save();
  // the ring they circle on, faint, so it reads as one dizzy halo and not loose sparks
  ctx.strokeStyle = 'rgba(255,240,170,0.55)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.ellipse(cx, cy, 40, 12, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#ffe25a';
  ctx.strokeStyle = '#6b3a08';
  ctx.lineWidth = 3;
  for (let i = 0; i < 5; i++) {
    const a = t * 4.2 + (i * 2 * Math.PI) / 5;
    // (a flat ring seen from the side: the stars behind the head are a little smaller)
    const depth = 0.82 + 0.18 * Math.sin(a);
    star(ctx, cx + Math.cos(a) * 40, cy + Math.sin(a) * 12, 19 * depth);
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

/** the armoured coil, read at a glance: a hard pale sheen along the top of the coil (it looks plated, not soft) and big glints with a dark
 *  edge, pulsing faster as it tightens */
export function drawCoilGlint(ctx: CanvasRenderingContext2D, e: Enemy, t: number): void {
  // (lying coiled, and through its tell, when the glint pulses fast)
  if (e.defeated || !(isCoiled(e) || (e.trick === 'coil' && e.state === 'rear'))) return;
  const q = coilSqueeze(e);
  const pulse = 0.55 + 0.45 * Math.sin(t * (q > 0 ? 18 : 3) + e.id);
  const f = e.facing > 0 ? 1 : -1;
  ctx.save();
  // the rim: a hard bright edge round the whole coil, pulsing, that reads from a jump away as "this is armoured" (a dark line inside it
  // keeps it clear on pale leaves)
  ctx.lineWidth = 6;
  ctx.strokeStyle = 'rgba(40,24,6,0.55)';
  ctx.beginPath();
  ctx.ellipse(e.x, e.y + 6, 34, 17, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 3.5;
  ctx.strokeStyle = `rgba(255,236,160,${0.6 + 0.4 * pulse})`;
  ctx.beginPath();
  ctx.ellipse(e.x, e.y + 6, 36, 19, 0, 0, Math.PI * 2);
  ctx.stroke();
  // the sheen: two bright arcs along the coil's top, like light on a hard shell
  ctx.lineCap = 'round';
  ctx.strokeStyle = `rgba(255,252,235,${0.55 + 0.3 * pulse})`;
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.ellipse(e.x - 4 * f, e.y + 11, 28, 13, 0, Math.PI * 1.08, Math.PI * 1.78);
  ctx.stroke();
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.ellipse(e.x + 2 * f, e.y + 5, 17, 8, 0, Math.PI * 1.12, Math.PI * 1.72);
  ctx.stroke();
  // the glints, with a dark edge so they show on light leaves and dark bark alike
  ctx.fillStyle = '#fffdf0';
  ctx.strokeStyle = 'rgba(60,40,10,0.6)';
  ctx.lineWidth = 2;
  ctx.globalAlpha = Math.max(0.6, pulse);
  // (on the coil's own body, which lies between its origin and its feet 16 px below: above it, they vanished against the sky)
  for (const [dx, dy, r] of [[-14, 1, 17], [10, -4, 12], [21, 7, 9]] as const) {
    const x = e.x + dx * f;
    const y = e.y + dy;
    const rr = r * (0.8 + 0.4 * pulse);
    ctx.beginPath();
    ctx.moveTo(x, y - rr);
    ctx.lineTo(x + rr * 0.22, y - rr * 0.22);
    ctx.lineTo(x + rr, y);
    ctx.lineTo(x + rr * 0.22, y + rr * 0.22);
    ctx.lineTo(x, y + rr);
    ctx.lineTo(x - rr * 0.22, y + rr * 0.22);
    ctx.lineTo(x - rr, y);
    ctx.lineTo(x - rr * 0.22, y - rr * 0.22);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
}

/** the rolling boa: the turn of the ball (radians), from how far it has rolled */
export const rollAngle = (e: Enemy) => ((e.stateT ?? 0) * 360 * (e.slideDir ?? 1)) / 18;
