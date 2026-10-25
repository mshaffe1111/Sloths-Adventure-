/**
 * cameraFollow — how the camera keeps Pokey in view without making the screen jiggle (testers, 2026-10-25: "the screen jiggles").
 *
 * The camera used to aim at his feet every frame. Every hop then bobbed the whole world up and back down (about 100 px on a phone held
 * upright), every swing on a vine rocked it with the arc, and every turn swung the view 180 px across as the look-ahead flipped sides.
 * Now:
 *   - the height it keeps level with (the anchor) is where he stands, climbs or hangs; on a swinging vine, the bottom of the swing's arc
 *     (so it moves only when he climbs the vine);
 *   - in the air it holds that height, and follows only once he is well above it (a high bounce) or below it (a fall);
 *   - the look-ahead eases over to the side he faces instead of jumping there.
 *
 * Pure: the engine feeds it each frame (engine.ts updateCamera); the tests check the rules.
 */

export const CAM = {
  /** in the air, how far above / below the anchor he may go (fractions of the view's height) before the camera follows */
  airUp: 0.26,
  airDown: 0.2,
  /** px the view looks ahead of him, and how fast that eases across when he turns (per second) */
  lookAhead: 90,
  lookRate: 2.2,
  /** a jump in his height bigger than this many views (a respawn, a checkpoint) moves the anchor at once */
  teleport: 1,
} as const;

export interface CamSubject {
  y: number;
  grounded: boolean;
  climbing?: boolean;
  hanging?: boolean;
  /** on a swinging vine: the bottom of the swing's arc (the vine's top plus his hold on it) */
  swingBottom?: number;
}

/** the height the camera keeps level with this frame, from last frame's */
export function camAnchor(prev: number, p: CamSubject, vh: number): number {
  if (!Number.isFinite(prev) || Math.abs(p.y - prev) > vh * CAM.teleport) return p.y;
  if (p.swingBottom !== undefined) return p.swingBottom;
  if (p.grounded || p.climbing || p.hanging) return p.y;
  const up = vh * CAM.airUp;
  const down = vh * CAM.airDown;
  if (p.y < prev - up) return p.y + up;
  if (p.y > prev + down) return p.y - down;
  return prev;
}

/** the look-ahead this frame: easing toward `facing` x CAM.lookAhead */
export function camLook(prev: number, facing: number, dt: number): number {
  const want = (facing < 0 ? -1 : 1) * CAM.lookAhead;
  return prev + (want - prev) * Math.min(1, dt * CAM.lookRate);
}

/** a camera position snapped to whole device pixels (`scale`: device px per world px), so the world steps by one device pixel, not three */
export const snapCam = (v: number, scale: number): number => Math.round(v * scale) / scale;
