/**
 * The two things that carry the story finds, drawn in code (placeholders for painted art):
 *  - the Hush Fern: a clump of fronds that hides a book or a keepsake. Crouch beside it and a ring fills over it.
 *  - the Keeper's Bell: Jennifur's pink bell flower, which carries her notes and is just touched.
 * Both are drawn with the origin at the item's centre, 26 px above the ground it stands on.
 */
import type { Collectible } from './types.ts';

const GROUND = 26;

function frond(ctx: CanvasRenderingContext2D, lean: number, len: number, wid: number, fill: string, sway: number) {
  ctx.save();
  ctx.rotate(lean + sway);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(-wid, -len * 0.3, -wid * 0.7, -len * 0.8, 0, -len);
  ctx.bezierCurveTo(wid * 0.7, -len * 0.8, wid, -len * 0.3, 0, 0);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = '#1f4a22';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
}

export function drawHushFern(ctx: CanvasRenderingContext2D, item: Collectible, time: number) {
  ctx.save();
  ctx.translate(0, GROUND);
  const sway = Math.sin(time * 1.6 + item.id) * 0.03;
  const search = item.search ?? 0;
  // while searched the fronds shiver
  const shake = search > 0 ? Math.sin(time * 38) * 0.035 * search : 0;
  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  ctx.beginPath();
  ctx.ellipse(0, 1, 34, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  const blades: Array<[number, number, number, string]> = [
    [-0.95, 38, 13, '#3f8a3c'], [0.95, 38, 13, '#3f8a3c'], [-0.5, 50, 14, '#4f9a48'], [0.5, 50, 14, '#4f9a48'], [0, 58, 15, '#5fae56'],
  ];
  for (const [lean, len, wid, fill] of blades) frond(ctx, lean, len, wid, fill, sway + shake);
  // a faint wink of light so a careful player notices it
  const wink = Math.max(0, Math.sin(time * 2.4 + item.id * 1.7));
  ctx.globalAlpha = 0.25 + 0.6 * wink * wink;
  ctx.fillStyle = '#fff6c8';
  const sx = -10 + Math.sin(item.id) * 8;
  const sy = -34 - wink * 6;
  ctx.beginPath();
  ctx.moveTo(sx, sy - 6); ctx.lineTo(sx + 1.8, sy - 1.8); ctx.lineTo(sx + 6, sy); ctx.lineTo(sx + 1.8, sy + 1.8);
  ctx.lineTo(sx, sy + 6); ctx.lineTo(sx - 1.8, sy + 1.8); ctx.lineTo(sx - 6, sy); ctx.lineTo(sx - 1.8, sy - 1.8);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.restore();

  // the search ring over the fern
  if (search > 0) {
    ctx.save();
    ctx.translate(0, -GROUND - 34);
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgba(232,196,106,0.35)';
    ctx.beginPath();
    ctx.arc(0, 0, 14, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = '#e8c46a';
    ctx.beginPath();
    ctx.arc(0, 0, 14, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * search);
    ctx.stroke();
    ctx.restore();
  } else if (item.near) {
    // close, but still standing: say what to do
    ctx.save();
    ctx.translate(0, -GROUND - 62);
    const a = 0.75 + 0.25 * Math.sin(time * 5);
    ctx.globalAlpha = a;
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    const w = 82;
    ctx.fillStyle = 'rgba(20,34,24,0.85)';
    ctx.beginPath();
    ctx.roundRect(-w / 2, -14, w, 22, 8);
    ctx.fill();
    ctx.fillStyle = '#fde68a';
    ctx.fillText('HOLD DOWN', 0, 2);
    ctx.restore();
  }
}

export function drawKeepersBell(ctx: CanvasRenderingContext2D, item: Collectible, time: number) {
  ctx.save();
  const sway = Math.sin(time * 2 + item.id) * 0.1;
  ctx.translate(0, GROUND);
  ctx.scale(1.3, 1.3);
  // stem and leaf
  ctx.strokeStyle = '#3f8a3c';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-3, -16, 0, -30);
  ctx.stroke();
  ctx.fillStyle = '#4f9a48';
  ctx.beginPath();
  ctx.moveTo(-1, -10);
  ctx.bezierCurveTo(-16, -18, -26, -12, -30, -18);
  ctx.bezierCurveTo(-18, -26, -8, -22, -1, -14);
  ctx.fill();
  // the bell
  ctx.translate(0, -34);
  ctx.rotate(sway);
  const g = ctx.createRadialGradient(0, -2, 2, 0, 0, 22);
  g.addColorStop(0, 'rgba(255, 220, 235, 0.55)');
  g.addColorStop(1, 'rgba(255, 220, 235, 0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-12, 4);
  ctx.bezierCurveTo(-16, -14, -6, -18, 0, -18);
  ctx.bezierCurveTo(6, -18, 16, -14, 12, 4);
  ctx.bezierCurveTo(6, 8, -6, 8, -12, 4);
  ctx.fillStyle = '#e9a0b4';
  ctx.fill();
  ctx.strokeStyle = '#8a4a60';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#f6c9d6';
  ctx.beginPath();
  ctx.ellipse(0, 4, 11, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#e8c46a';
  ctx.beginPath();
  ctx.ellipse(0, 9, 3, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
