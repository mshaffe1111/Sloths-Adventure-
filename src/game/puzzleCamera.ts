/**
 * puzzleCamera — how the view frames a puzzle room (puzzlePlay.ts camFocus, engine.ts updateCamera), generalising the boss arena's
 * zoom (bossCamera.ts): inside a room's box the view leans from Pokey toward the part of the puzzle that matters now (the thing before he
 * picks it up, where it goes after), and pulls back just far enough that he, that part and what it works (the basket's cage or lift, the
 * lever's or bell's gate, the seesaw's raised end: the room's key box, puzzlePlay.ts keyBox) are all in the view together.
 *
 * How far it may pull back: sideways, to three quarters of his usual size, as it always has. Upright the usual view is only ~420 px of
 * world wide (and, on a stage 900 px tall, already the level's whole height), so there it may pull back further, to the size he is drawn
 * in a room on the same phone held sideways (roomFloor: 0.54 css px a world px on a 390 px wide phone, 0.50 on a 360 px one). Past the
 * level's height the extra room is the sky over the level (the backdrop is painted to the screen, engine.ts updateCamera), never the
 * void under its ground. Outside a room nothing changes. Pure, so the tests can check what a phone shows, upright and sideways.
 */

export const ROOM_CAM = {
  /** how far the view's middle leans from him toward the puzzle part (0 him, 1 the part) */
  lean: 0.35,
  /** the most it zooms out for the lean alone, and sideways at all (Pokey's drawn size, of his usual) */
  minZoom: 0.75,
  /** room kept round him and the part (world px) */
  margin: 80,
  /** room kept round the key box (world px) */
  keyMargin: 36,
  /** the world's height on a sideways screen (engine.ts WORLD_VIEW_H): upright, he is never drawn smaller than sideways in a room */
  sideH: 540,
  /** how quickly the zoom eases (per second) */
  ease: 2.2,
  /** coming into a room or leaving it, its framing blends in or out over this long (s) */
  blend: 0.8,
  /** the first time a far gate opens, the view goes to it for this long (s) */
  pan: 1.5,
  /** a gate further than this share of the view's width from him is "far" */
  far: 0.42,
} as const;

export interface CamBox {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
}

/** the smallest of two boxes holding both */
export function unionBox(a: CamBox, b: CamBox): CamBox {
  return { x0: Math.min(a.x0, b.x0), x1: Math.max(a.x1, b.x1), y0: Math.min(a.y0, b.y0), y1: Math.max(a.y1, b.y1) };
}

/** Pokey's own box (his middle px, feet py): his body and a step of room either side */
export function heroBox(px: number, feetY: number): CamBox {
  return { x0: px - 45, x1: px + 45, y0: feetY - 115, y1: feetY + 8 };
}

/**
 * The most a room may pull back (of the usual zoom `usual`, css px per world px) on a screen cssW x cssH: sideways ROOM_CAM.minZoom;
 * upright, down to the scale a sideways phone of the same size shows in a room (its short side over sideH, times minZoom).
 */
export function roomFloor(cssW: number, cssH: number, usual: number): number {
  if (!(usual > 0)) return ROOM_CAM.minZoom;
  const smallest = (Math.min(cssW, cssH) / ROOM_CAM.sideH) * ROOM_CAM.minZoom;
  return Math.max(0.3, Math.min(ROOM_CAM.minZoom, smallest / usual));
}

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

/** does box `b` (with the key margin) fit in a view vw x vh (world px) */
export function boxFits(b: CamBox, vw: number, vh: number): boolean {
  const m = 2 * ROOM_CAM.keyMargin;
  return b.x1 - b.x0 + m <= vw + 0.5 && b.y1 - b.y0 + m <= vh + 0.5;
}

/** the zoom (of the usual: 1 down to `floor`) that fits box `b` with the key margin in the usual view vw x vh */
export function fitZoom(vw: number, vh: number, b: CamBox, floor: number): number {
  const m = 2 * ROOM_CAM.keyMargin;
  return Math.max(floor, Math.min(1, vw / (b.x1 - b.x0 + m), vh / (b.y1 - b.y0 + m)));
}

/**
 * The view's middle: the lean point `c`, moved the least that keeps the box `b` (with the key margin) in a view vw x vh. Along an axis
 * where the box is bigger than the view, the box's middle (roomView then keeps him in). Continuous both ways, so it never jumps.
 */
export function roomCentre(c: { x: number; y: number }, b: CamBox, vw: number, vh: number): { x: number; y: number } {
  const m = ROOM_CAM.keyMargin;
  const along = (v: number, lo: number, hi: number, span: number) => {
    const a = hi + m - span / 2;
    const z = lo - m + span / 2;
    return a > z ? (a + z) / 2 : Math.max(a, Math.min(z, v));
  };
  return { x: along(c.x, b.x0, b.x1, vw), y: along(c.y, b.y0, b.y1, vh) };
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
