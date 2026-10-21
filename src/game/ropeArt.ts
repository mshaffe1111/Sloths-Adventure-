import type { Rope } from './types.ts';
import { ROPE_SAG, ropeYAt } from './rope.ts';

/** Draws shimmy ropes: a wooden post at each end and a twisted rope that sags between them. */

function post(ctx: CanvasRenderingContext2D, x: number, ground: number, top: number) {
  const w = 18;
  const g = ctx.createLinearGradient(x - w / 2, 0, x + w / 2, 0);
  g.addColorStop(0, '#5a3413');
  g.addColorStop(0.45, '#8b5a2b');
  g.addColorStop(1, '#4a2a0e');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.roundRect(x - w / 2, top, w, ground - top + 6, 6);
  ctx.fill();
  ctx.strokeStyle = 'rgba(40,20,5,.55)';
  ctx.lineWidth = 2;
  ctx.stroke();
  // lashings where the rope is tied on
  ctx.strokeStyle = '#fde68a';
  ctx.lineWidth = 3;
  for (const dy of [4, 11]) {
    ctx.beginPath();
    ctx.moveTo(x - w / 2 - 1, top + dy);
    ctx.lineTo(x + w / 2 + 1, top + dy + 2);
    ctx.stroke();
  }
  // a little moss at the foot
  ctx.fillStyle = '#4ade80';
  ctx.beginPath();
  ctx.ellipse(x, ground + 1, w * 0.8, 4, 0, 0, Math.PI * 2);
  ctx.fill();
}

export function drawRopes(
  ctx: CanvasRenderingContext2D,
  ropes: Rope[],
  time: number,
  opts: { hangingId?: number; canGrab: boolean; px: number; py: number; pGrounded: boolean },
) {
  for (const r of ropes) {
    // the rope is only a rope to someone who has learned the skill; before that it is still drawn (it is part of the jungle)
    post(ctx, r.x0, r.g0, r.y - 10);
    post(ctx, r.x1, r.g1, r.y - 10);

    const N = 24;
    const pts: Array<[number, number]> = [];
    for (let i = 0; i <= N; i++) {
      const x = r.x0 + ((r.x1 - r.x0) * i) / N;
      let y = ropeYAt(r, x);
      // the rope gives a little under the hanging hero, and shivers as he moves
      if (opts.hangingId === r.id) {
        const d = Math.abs(x - opts.px);
        y += Math.max(0, 1 - d / 140) * 5;
      }
      pts.push([x, y]);
    }
    const trace = () => {
      ctx.beginPath();
      pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    };
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    trace();
    ctx.strokeStyle = 'rgba(40,20,5,.5)';
    ctx.lineWidth = 9;
    ctx.stroke();
    trace();
    ctx.strokeStyle = '#fde68a';
    ctx.lineWidth = 6;
    ctx.stroke();
    trace();
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 2.4;
    ctx.setLineDash([5, 8]);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  void ROPE_SAG;
}
