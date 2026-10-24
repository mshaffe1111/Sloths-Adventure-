/**
 * The river snapper (World 2's snapping turtle), drawn in shapes until Matt's painted sheet arrives: a domed shell, a beaked head that
 * pulls back before it snaps, and the shell alone while it hides, slides, or sits dizzy. The origin is the middle of the body, the feet
 * 14 below (predatorAI.ts FEET).
 */
import { TURTLE } from './predatorAI.ts';
import type { Enemy } from './types.ts';

const OL = '#2b2416';
const SHELL = '#5f6b3a';
const SHELL_HI = '#7d8a4c';
const SCUTE = '#4a5530';
const SKIN = '#8a9a5b';
const BELLY = '#d8c98f';

export function drawTurtle(ctx: CanvasRenderingContext2D, e: Enemy, t: number) {
  const st = e.state ?? 'patrol';
  const u = e.stateT ?? 0;
  const hidden = st === 'shell' || st === 'slide' || st === 'dizzy' || (st === 'peek' && u < TURTLE.peek * 0.5);
  ctx.save();
  ctx.translate(e.x, e.y);
  ctx.scale(e.facing, 1);
  ctx.lineWidth = 2.4;
  ctx.strokeStyle = OL;
  ctx.lineJoin = 'round';
  // a sliding shell spins a little and leaves dust lines behind
  if (st === 'slide') {
    ctx.rotate(Math.sin(t * 30) * 0.06);
    ctx.save();
    ctx.scale(e.facing, 1);
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    for (let k = 0; k < 3; k++) {
      const d = -(e.slideDir ?? 1);
      ctx.beginPath();
      ctx.moveTo(d * (30 + k * 6), 4 - k * 6);
      ctx.lineTo(d * (48 + k * 8), 4 - k * 6);
      ctx.stroke();
    }
    ctx.restore();
  }
  const walk = st === 'patrol' ? Math.sin(t * 9) : 0;
  if (!hidden) {
    // legs
    ctx.fillStyle = SKIN;
    for (const [lx, ph] of [[-14, 0], [12, Math.PI]] as const) {
      ctx.beginPath();
      ctx.ellipse(lx + walk * 2 * Math.cos(ph), 9, 6, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    // the head: pulled back in the tell, shot forward in the snap
    const reach = st === 'windup' ? -6 : st === 'snap' ? TURTLE.reach - 14 : st === 'recover' ? 8 : 2;
    const hx = 22 + reach;
    ctx.fillStyle = SKIN;
    ctx.beginPath();
    ctx.moveTo(14, -2);
    ctx.lineTo(hx, -4);
    ctx.lineTo(hx, 4);
    ctx.lineTo(14, 5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(hx + 4, -1, 8, 6.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // the hooked beak, open as it snaps
    ctx.fillStyle = '#c9b77a';
    ctx.beginPath();
    ctx.moveTo(hx + 9, -3);
    ctx.lineTo(hx + 15, st === 'snap' ? -6 : 0);
    ctx.lineTo(hx + 9, st === 'snap' ? 4 : 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // a cross little eye
    ctx.fillStyle = '#1b140c';
    ctx.beginPath();
    ctx.arc(hx + 5, -3, 1.7, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(hx + 2, -6.5);
    ctx.lineTo(hx + 8, -5);
    ctx.stroke();
    // the tail
    ctx.fillStyle = SKIN;
    ctx.beginPath();
    ctx.moveTo(-20, 2);
    ctx.lineTo(-30, 5);
    ctx.lineTo(-20, 7);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  // the shell: a ridged dome over a pale rim
  ctx.fillStyle = BELLY;
  ctx.beginPath();
  ctx.ellipse(0, 7, 23, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  const g = ctx.createLinearGradient(0, -16, 0, 8);
  g.addColorStop(0, SHELL_HI);
  g.addColorStop(1, SHELL);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(-23, 6);
  ctx.quadraticCurveTo(-22, -16, 0, -17);
  ctx.quadraticCurveTo(22, -16, 23, 6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // the ridges of the scutes
  ctx.strokeStyle = SCUTE;
  ctx.lineWidth = 2;
  for (const sx of [-12, 0, 12]) {
    ctx.beginPath();
    ctx.moveTo(sx - 5, -8);
    ctx.lineTo(sx, -13);
    ctx.lineTo(sx + 5, -8);
    ctx.lineTo(sx + 4, 1);
    ctx.lineTo(sx - 4, 1);
    ctx.closePath();
    ctx.stroke();
  }
  ctx.restore();
  // dizzy: little stars circling over the shell
  if (st === 'dizzy') {
    ctx.save();
    ctx.fillStyle = '#fde68a';
    for (let k = 0; k < 3; k++) {
      const a = t * 5 + (k * Math.PI * 2) / 3;
      ctx.beginPath();
      ctx.arc(e.x + Math.cos(a) * 16, e.y - 24 + Math.sin(a) * 4, 2.6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}
