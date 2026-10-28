/**
 * puzzleCamera — how the view frames a puzzle room (puzzlePlay.ts camFocus, engine.ts updateCamera), generalising the boss arena's
 * zoom (bossCamera.ts): inside a room's box the view leans from Pokey toward the part of the puzzle that matters now (the thing before he
 * picks it up, where it goes after), and pulls back just far enough that both fit, but never so far that Pokey is drawn smaller than
 * three quarters of his size. Outside a room nothing changes. Pure, so the tests can check what a phone shows, upright and sideways.
 */

export const ROOM_CAM = {
  /** how far the view's middle leans from him toward the puzzle part (0 him, 1 the part) */
  lean: 0.35,
  /** the most it zooms out (Pokey's drawn size, of his usual) */
  minZoom: 0.75,
  /** room kept round him and the part (world px) */
  margin: 80,
  /** how quickly the zoom eases (per second) */
  ease: 2.2,
  /** the first time a far gate opens, the view goes to it for this long (s) */
  pan: 1.5,
  /** a gate further than this share of the view's width from him is "far" */
  far: 0.42,
} as const;

/** the point the view centres on: `lean` of the way from him (his middle) to the part */
export function roomLean(px: number, py: number, fx: number, fy: number, lean: number = ROOM_CAM.lean): { x: number; y: number } {
  return { x: px + (fx - px) * lean, y: py + (fy - py) * lean };
}

/**
 * How much to zoom (1: as usual, down to ROOM_CAM.minZoom) so that both he (his middle at px, py) and the part fit in the view, centred
 * on the lean point, with a margin. `vw`, `vh`: the view at the usual zoom (world px).
 */
export function roomZoom(vw: number, vh: number, px: number, py: number, fx: number, fy: number): number {
  const c = roomLean(px, py, fx, fy);
  const m = ROOM_CAM.margin;
  const needW = 2 * (Math.max(Math.abs(px - c.x), Math.abs(fx - c.x)) + m);
  const needH = 2 * (Math.max(Math.abs(py - c.y) + 50, Math.abs(fy - c.y)) + m);
  return Math.max(ROOM_CAM.minZoom, Math.min(1, vw / needW, vh / needH));
}

/** the view's top-left for a centre point, never letting him (middle px, feet py) slip out of it */
export function roomView(cx: number, cy: number, vw: number, vh: number, px: number, py: number): { x: number; y: number } {
  let x = cx - vw / 2;
  let y = cy - vh / 2;
  x = Math.max(px + 70 - vw, Math.min(px - 70, x));
  // (his feet above the bottom tenth, his head well under the top)
  y = Math.max(py - vh * 0.9, Math.min(py - 130, y));
  return { x, y };
}
