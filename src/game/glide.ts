/**
 * Leaf Glide: a skill Pokey learns (see skills.ts). While he is falling, holding Jump opens a leaf over his head and his fall
 * slows to a gentle drift. It never lifts him, so it makes a long gap or a pit-edge slip easier to cover without changing how high
 * any jump goes (the level builder and beatability check ignore it, so no stage ever needs it).
 *
 * The rules are plain functions so they can be tested; the engine feeds them once per frame and draws the leaf.
 */
export const GLIDE = {
  /** the slowest he falls while gliding, px/s */
  fallSpeed: 125,
  /** how long one flight's glide lasts, seconds; it comes back after any new upward launch (second jump, stomp, bounce) or on landing */
  maxTime: 1.35,
  /** he must have been falling this long before the leaf opens, so a quick hop never flutters */
  onset: 0.1,
  /** falling slower than this does not count as falling (px/s) */
  minFall: 40,
  /** how fast the leaf catches him, px/s per second */
  brake: 4200,
  /** an upward launch at least this fast gives the glide back */
  refillUp: 200,
} as const;

export interface GlideState {
  /** seconds spent falling in a row */
  fallT: number;
  /** glide time still left in this flight */
  left: number;
  /** the leaf is out right now */
  on: boolean;
}

export const newGlide = (): GlideState => ({ fallT: 0, left: GLIDE.maxTime, on: false });

export interface GlideInput {
  /** he has learned the skill */
  has: boolean;
  /** off the ground and free to fall (not climbing, swinging or hanging) */
  airborne: boolean;
  /** Jump is being held */
  held: boolean;
  vy: number;
}

/**
 * Advance one frame. Returns the fastest he may fall this frame (Infinity when the leaf is not out).
 */
export function glideStep(g: GlideState, a: GlideInput, dt: number): number {
  if (!a.airborne) {
    g.fallT = 0;
    g.left = GLIDE.maxTime;
    g.on = false;
    return Infinity;
  }
  if (a.vy <= -GLIDE.refillUp) g.left = GLIDE.maxTime;
  g.fallT = a.vy > GLIDE.minFall ? g.fallT + dt : 0;
  g.on = a.has && a.held && g.fallT >= GLIDE.onset && g.left > 0;
  if (g.on) g.left = Math.max(0, g.left - dt);
  return g.on ? GLIDE.fallSpeed : Infinity;
}

/** pull a falling speed down toward the glide cap (never speeds him up) */
export function glideBrake(vy: number, cap: number, dt: number): number {
  return vy > cap ? Math.max(cap, vy - GLIDE.brake * dt) : vy;
}

/** the leaf over Pokey's head. `open` is 0 (folded) to 1 (spread); `fade` is 1 until the glide is about to run out */
export function drawGlideLeaf(ctx: CanvasRenderingContext2D, x: number, y: number, open: number, time: number, lean: number, fade = 1): void {
  if (open <= 0.02) return;
  const sway = Math.sin(time * 7) * 0.07 + lean * 0.12;
  ctx.save();
  ctx.globalAlpha = Math.max(0.25, Math.min(1, fade));
  ctx.translate(x, y);
  ctx.rotate(sway);
  ctx.scale(0.35 + 0.65 * open, 0.55 + 0.45 * open);
  // stem down to his paws
  ctx.strokeStyle = '#5b8a3a';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 40);
  ctx.lineTo(0, 0);
  ctx.stroke();
  // the blade
  ctx.fillStyle = '#4ade80';
  ctx.strokeStyle = '#166534';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(-46, -4);
  ctx.bezierCurveTo(-34, -40, 34, -40, 46, -4);
  ctx.bezierCurveTo(30, 8, -30, 8, -46, -4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // highlight and ribs
  ctx.fillStyle = 'rgba(255,255,255,.22)';
  ctx.beginPath();
  ctx.moveTo(-40, -6);
  ctx.bezierCurveTo(-28, -32, 4, -34, 14, -26);
  ctx.bezierCurveTo(-4, -22, -24, -14, -40, -6);
  ctx.fill();
  ctx.strokeStyle = '#15803d';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(-44, -4);
  ctx.quadraticCurveTo(0, -14, 44, -4);
  for (const k of [-24, -8, 8, 24]) {
    ctx.moveTo(k, -10);
    ctx.lineTo(k * 1.15, k < 0 ? -26 + Math.abs(k) * 0.3 : -26 + Math.abs(k) * 0.3);
  }
  ctx.stroke();
  ctx.restore();
}
