/**
 * The two things that carry the story finds, painted (stageArt.ts, hf-art-stage 2026-10-29, VI-16):
 *  - the Hush Fern: a clump of fronds that hides a book or a keepsake. Crouch beside it and a ring fills over it.
 *  - the Keeper's Bell: Meeca's pink bell flower, which carries her notes and is just touched.
 * Both are drawn with the origin at the item's centre, 26 px above the ground it stands on. Code adds only the small touches: the motes
 * of light drifting up out of the fern, its wink, and the search ring.
 */
import type { Collectible } from './types.ts';
import { FONT_UI } from './fonts.ts';
import { drawBellArt, drawFernArt } from './stageArt.ts';

const GROUND = 26;

export function drawHushFern(ctx: CanvasRenderingContext2D, item: Collectible, time: number) {
  const search = item.search ?? 0;
  if (!drawFernArt(ctx, GROUND, time, item.id, search)) return;
  ctx.save();
  ctx.translate(0, GROUND);
  // motes of light drifting up out of it
  for (let k = 0; k < 4; k++) {
    const ph = (time * 0.35 + k * 0.25 + item.id * 0.13) % 1;
    const mx = Math.sin(k * 2.4 + item.id) * 22 + Math.sin(ph * 6 + k) * 5;
    const my = -20 - ph * 62;
    ctx.globalAlpha = Math.sin(ph * Math.PI) * 0.85;
    ctx.fillStyle = '#fff3b0';
    ctx.beginPath();
    ctx.arc(mx, my, 2.1 - ph * 0.8, 0, Math.PI * 2);
    ctx.fill();
  }
  // a bright wink of light so a careful player notices it
  const wink = Math.max(0, Math.sin(time * 2.4 + item.id * 1.7));
  ctx.globalAlpha = 0.35 + 0.65 * wink * wink;
  ctx.fillStyle = '#fffbe0';
  const sx = -10 + Math.sin(item.id) * 8;
  const sy = -34 - wink * 6;
  ctx.beginPath();
  ctx.moveTo(sx, sy - 7.5); ctx.lineTo(sx + 2.2, sy - 2.2); ctx.lineTo(sx + 7.5, sy); ctx.lineTo(sx + 2.2, sy + 2.2);
  ctx.lineTo(sx, sy + 7.5); ctx.lineTo(sx - 2.2, sy + 2.2); ctx.lineTo(sx - 7.5, sy); ctx.lineTo(sx - 2.2, sy - 2.2);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.restore();

  drawSearchHint(ctx, item, time);
}

/** over a fern that hides something: the search ring while he crouches, or HOLD DOWN when he is close but standing (origin as above) */
export function drawSearchHint(ctx: CanvasRenderingContext2D, item: Collectible, time: number) {
  const search = item.search ?? 0;
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
    ctx.font = `bold 13px ${FONT_UI}`;
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

/** the Keeper's Bell, painted, swaying on its stem */
export function drawKeepersBell(ctx: CanvasRenderingContext2D, item: Collectible, time: number) {
  drawBellArt(ctx, GROUND, time, item.id);
}
