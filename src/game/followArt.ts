/**
 * followArt — the little ones walking home behind him and the herons watching them (2-3: followPlay.ts), in World 2's painted pieces
 * (w2-props): each little one WADDLES on two painted frames swapped by the ground it covers (FOLLOW_STRIDE: no foot-slide at any pace),
 * PADDLES in its painted swim pose sunk to the chest, crouches in its Sad pose while it hides after a spook, and is Happy at home. The heron
 * is World 2's new dressing (dressnew-w2#w2Heron) while calm and its painted head-up LOOKING pose (#w2HeronLook) while it warns or looks.
 * Code draws only the small touches: the paddle's ripple, a hiding one's reed tuft and the heron's look on the ground (STAGE-RULES §4).
 */
import { drawDress } from './dressArt.ts';
import { FONT_DISPLAY } from './fonts.ts';
import { drawW2Piece, riverArtReady, type W2Piece } from './riverArt.ts';
import { W2_FRAMES } from './w2PropsData.ts';
import { WATCH } from './watcher.ts';
import type { FollowKind, Follower } from './follow.ts';
import type { FollowPlay, Heron } from './followPlay.ts';

/** a little one's width (px): about 45 px tall, half of Pokey's 89 (2-3.md), so the 34 px gap between them reads */
export const FOLLOWER_W = 33;
const HAPPY: Record<FollowKind, W2Piece> = { duck: 'duckHappy', otter: 'otterHappy', capy: 'capyHappy' };
const WALK: Record<FollowKind, readonly [W2Piece, W2Piece]> = {
  duck: ['duckWalkA', 'duckWalkB'], otter: ['otterWalkA', 'otterWalkB'], capy: ['capyWalkA', 'capyWalkB'],
};
const PADDLE: Record<FollowKind, W2Piece> = { duck: 'duckPaddle', otter: 'otterPaddle', capy: 'capyPaddle' };
const SAD: Record<FollowKind, W2Piece> = { duck: 'duckSad', otter: 'otterSad', capy: 'capySad' };
/**
 * the ground a waddle frame covers (px): the frame swaps every FOLLOW_STRIDE px it moves, so its feet keep pace with the ground at any
 * speed (a clock-timed swap slides its feet when it slows). About a third of its 45 px height: a little one's short step.
 */
export const FOLLOW_STRIDE = 15;

/** which painted pose a little one is drawn in this frame (pure: followArt.test.ts) */
export function followerPose(f: Pick<Follower, 'kind' | 'x' | 'state' | 'paddle' | 'back'>): W2Piece {
  if (f.paddle) return PADDLE[f.kind];
  if (f.state === 'home') return HAPPY[f.kind];
  if (f.state === 'spooked' && f.back) return SAD[f.kind];
  const k = Math.floor(f.x / FOLLOW_STRIDE);
  return WALK[f.kind][((k % 2) + 2) % 2];
}

/** a pose's draw width (px): every pose is painted at the Happy pose's scale, so it is drawn at that same scale (FOLLOWER_W for Happy) */
export function poseWidth(kind: FollowKind, n: W2Piece): number {
  return (FOLLOWER_W * W2_FRAMES[n].w) / W2_FRAMES[HAPPY[kind]].w;
}
/** the heron's look: a pale wash on the ground where it is looking (its sight, WATCH.sight either side) and its gaze down to it */
const LOOK = { rgb: '255, 244, 196', alpha: 0.55, gaze: 0.45 };
/**
 * where the heron's eye is on its LOOKING painting (w2HeronLook: the gaze is drawn only while it looks), from its foot (units; the
 * painting faces left: its beak at the left). Measured on the packed frame (ART-W2A: eye at 107,33 of 336x586 px, 84.52 units wide).
 */
const HERON_EYE = { dx: -15, dy: -139 };
/** the '!' of its warning, over the looking pose's head (its crown at 147 units over its foot) */
const HERON_WARN_Y = -158;

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
  const n = followerPose(f);
  const w = poseWidth(f.kind, n);
  const flip = f.facing < 0;
  if (f.paddle) {
    // (paddling: its swim pose sunk to the chest, a ripple round it)
    const sink = PADDLE_SINK * w2HeightOf(n, w);
    ctx.save();
    ctx.beginPath();
    ctx.rect(f.x - 40, f.y - 90, 80, 90 + 2);
    ctx.clip();
    drawW2Piece(ctx, n, f.x, f.y + sink + Math.sin(t * 7) * 1.5, w, flip);
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
    // (hiding where it ran to: crouched in its Sad pose behind a reed tuft, until he comes back for it)
    drawW2Piece(ctx, n, f.x, f.y, w, flip);
    reedTuft(ctx, f.x, f.y, t);
    return;
  }
  // (home: Happy, hopping; walking: the painted step (the passing frame stands its body a little higher by itself))
  const lift = f.state === 'home' ? Math.abs(Math.sin(t * 4)) * 10 : 0;
  drawW2Piece(ctx, n, f.x, f.y - lift, w, flip);
}

const w2HeightOf = (n: W2Piece, w: number): number => (w * W2_FRAMES[n].h) / W2_FRAMES[n].w;
/** how much of the swim pose sits under the surface (share of its height): sunk to the chest */
const PADDLE_SINK = 0.4;

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
    drawDress(ctx, [{ n: heronPose(h), x: h.foot.x, b: h.foot.b, flip: h.end < 0 }], { x0, x1, y0: -1e6, y1: 1e6 });
    if (h.s.phase === 'warn') {
      ctx.save();
      ctx.fillStyle = '#fbbf24';
      ctx.font = `26px ${FONT_DISPLAY}`;
      ctx.textAlign = 'center';
      ctx.fillText('!', h.foot.x, h.foot.b + HERON_WARN_Y - Math.abs(Math.sin(t * 6)) * 4);
      ctx.restore();
    }
  }
}

/** the heron's painted pose: head-up looking while it warns or sweeps, its plain pose while calm (pure: followArt.test.ts) */
export function heronPose(h: Pick<Heron, 's'>): 'w2Heron' | 'w2HeronLook' {
  return h.s.phase === 'calm' ? 'w2Heron' : 'w2HeronLook';
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
