/**
 * followArt — the little ones walking home behind him and the herons watching them (2-3: followPlay.ts), in World 2's painted pieces:
 * the little ones are the cages' own Happy poses (riverArt.ts duckHappy / otterHappy / capyHappy) at about half his height; the heron is
 * World 2's new dressing (dressnew-w2#w2Heron). Code draws only the small touches: a step's bob, the paddle's ripple, a hiding one's reed
 * tuft and the heron's look on the ground (STAGE-RULES §4). Until the walk and paddle frames arrive (2-3.md "Hugging Face asks") the
 * still pose bobs.
 */
import { drawDress } from './dressArt.ts';
import { FONT_DISPLAY } from './fonts.ts';
import { drawW2Piece, riverArtReady, type W2Piece } from './riverArt.ts';
import { WATCH } from './watcher.ts';
import type { FollowKind, Follower } from './follow.ts';
import type { FollowPlay, Heron } from './followPlay.ts';

/** a little one's width (px): about 45 px tall, half of Pokey's 89 (2-3.md), so the 34 px gap between them reads */
export const FOLLOWER_W = 33;
const HAPPY: Record<FollowKind, W2Piece> = { duck: 'duckHappy', otter: 'otterHappy', capy: 'capyHappy' };
/** the heron's look: a pale wash on the ground where it is looking (its sight, WATCH.sight either side) and its gaze down to it */
const LOOK = { rgb: '255, 244, 196', alpha: 0.55, gaze: 0.45 };
/** where the heron's eye is on its painting, from its foot (px; the painting faces left: its beak at the left) */
const HERON_EYE = { dx: -14, dy: -104 };

/** the little ones in view, under the reeds (the engine draws the bushes after them) */
export function drawFollowers(ctx: CanvasRenderingContext2D, fp: FollowPlay, t: number, x0: number, x1: number): void {
  if (!riverArtReady()) return;
  for (let i = 0; i < fp.line.length; i++) {
    const f = fp.line[i];
    if (f.x < x0 - 60 || f.x > x1 + 60) continue;
    drawFollower(ctx, f, t + i * 0.37);
  }
}

function drawFollower(ctx: CanvasRenderingContext2D, f: Follower, t: number): void {
  const n = HAPPY[f.kind];
  const flip = f.facing < 0;
  if (f.paddle) {
    // (paddling: sunk to the chest, a ripple round it)
    const sink = 18;
    ctx.save();
    ctx.beginPath();
    ctx.rect(f.x - 40, f.y - 90, 80, 90 + 2);
    ctx.clip();
    drawW2Piece(ctx, n, f.x, f.y + sink + Math.sin(t * 7) * 1.5, FOLLOWER_W, flip);
    ctx.restore();
    ctx.save();
    ctx.strokeStyle = 'rgba(224, 242, 254, 0.7)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(f.x, f.y + 1, 19 + Math.sin(t * 5) * 2, 4, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    return;
  }
  if (f.state === 'spooked' && f.back) {
    // (hiding where it ran to: crouched low behind a reed tuft, until he comes back for it)
    drawW2Piece(ctx, n, f.x, f.y, FOLLOWER_W, flip, (FOLLOWER_W * 1.05));
    reedTuft(ctx, f.x, f.y, t);
    return;
  }
  const hop = f.state === 'home' ? Math.abs(Math.sin(t * 4)) * 10 : f.moved ? Math.abs(Math.sin(t * (f.state === 'spooked' ? 22 : 14))) * 3 : 0;
  drawW2Piece(ctx, n, f.x, f.y - hop, FOLLOWER_W, flip);
}

/** a little tuft of reeds in front of a hiding one */
function reedTuft(ctx: CanvasRenderingContext2D, x: number, y: number, t: number): void {
  ctx.save();
  ctx.strokeStyle = '#5b7f3a';
  ctx.lineCap = 'round';
  ctx.lineWidth = 3;
  for (let k = -2; k <= 2; k++) {
    const sway = Math.sin(t * 1.6 + k) * 2;
    ctx.beginPath();
    ctx.moveTo(x + k * 7, y + 1);
    ctx.quadraticCurveTo(x + k * 8 + sway, y - 22, x + k * 9 + sway * 2, y - 40 + Math.abs(k) * 5);
    ctx.stroke();
  }
  ctx.restore();
}

/** the herons in view, wading at their stretches' ends, and each one's look on the ground while it sweeps */
export function drawHerons(ctx: CanvasRenderingContext2D, fp: FollowPlay, t: number, x0: number, x1: number): void {
  for (const h of fp.herons) {
    if (h.lookX !== null && h.lookX > x0 - WATCH.sight && h.lookX < x1 + WATCH.sight) drawLook(ctx, h, fp);
    if (h.foot.x < x0 - 120 || h.foot.x > x1 + 120) continue;
    // (facing back along its stretch: the painting faces left, so the one wading past the stretch's start is turned)
    drawDress(ctx, [{ n: 'w2Heron', x: h.foot.x, b: h.foot.b, flip: h.end < 0 }], { x0, x1, y0: -1e6, y1: 1e6 });
    if (h.s.phase === 'warn') {
      ctx.save();
      ctx.fillStyle = '#fbbf24';
      ctx.font = `26px ${FONT_DISPLAY}`;
      ctx.textAlign = 'center';
      ctx.fillText('!', h.foot.x, h.foot.b - 128 - Math.abs(Math.sin(t * 6)) * 4);
      ctx.restore();
    }
  }
}

function drawLook(ctx: CanvasRenderingContext2D, h: Heron, fp: FollowPlay): void {
  const x = h.lookX!;
  const y = fp.groundAt(x) ?? h.foot.b;
  // (its gaze from its eye down to where it looks, then two flat washes there, the wide one fainter: no gradient made a frame)
  ctx.save();
  const ex = h.foot.x + HERON_EYE.dx * (h.end < 0 ? -1 : 1);
  const ey = h.foot.b + HERON_EYE.dy;
  ctx.strokeStyle = `rgba(${LOOK.rgb}, ${LOOK.gaze})`;
  ctx.lineWidth = 3;
  ctx.setLineDash([10, 9]);
  ctx.beginPath();
  ctx.moveTo(ex, ey);
  ctx.lineTo(x, y - 14);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = `rgba(${LOOK.rgb}, ${LOOK.alpha / 2})`;
  ctx.beginPath();
  ctx.ellipse(x, y - 6, WATCH.sight, 24, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = `rgba(${LOOK.rgb}, ${LOOK.alpha / 2})`;
  ctx.beginPath();
  ctx.ellipse(x, y - 6, WATCH.sight * 0.6, 15, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
