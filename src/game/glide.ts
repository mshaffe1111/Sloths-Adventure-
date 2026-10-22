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

/** a plain leaf under Pokey's feet, shown only until the painted one has loaded. (x, y) is where his feet are; `open` is 0 (gone) to 1 (spread). */
export function drawGlideLeaf(ctx: CanvasRenderingContext2D, x: number, y: number, open: number, time: number, lean: number, fade = 1): void {
  if (open <= 0.02) return;
  ctx.save();
  ctx.globalAlpha = Math.max(0.2, Math.min(1, fade)) * Math.min(1, open * 1.6);
  ctx.translate(x, y + 7);
  ctx.rotate(Math.sin(time * 6) * 0.05 + lean * 0.1);
  ctx.scale(open, 0.55 + 0.45 * open);
  ctx.fillStyle = '#4ade80';
  ctx.strokeStyle = '#166534';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-29, 0);
  ctx.quadraticCurveTo(0, -17, 29, 0);
  ctx.quadraticCurveTo(0, 15, -29, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = '#15803d';
  ctx.beginPath();
  ctx.moveTo(-27, 0);
  ctx.lineTo(27, 0);
  ctx.stroke();
  ctx.restore();
}
