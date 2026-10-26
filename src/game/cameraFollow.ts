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

// ───── the look across a gap (testers, 2026-10-25: "no next ledge is on screen", "the next vine is cut off at the edge") ─────
//
// Standing near the end of a ledge with a gap ahead, the view shifts just far enough to show the far side: the next ledge (or vine)
// across the gap, up or down, as well as Pokey. Pokey always wins: if both cannot fit, he stays in view and the landing is as near as
// it can be. Upright (about 440 x 790 of world) a 300 px gap and the vine past it fit; sideways everything a jump reaches does.

export const AHEAD = {
  /** how close to the end of his ledge (px, the way he faces) before the view looks across */
  near: 320,
  /** how far across, up and down a landing may be to be looked for (about the furthest a double jump or the leaf goes) */
  reach: 760,
  up: 340,
  down: 560,
  /** the part of the view the landing is kept in, clear of the HUD along the top (fractions of the view) */
  pad: { l: 0.02, r: 0.98, t: 0.2, b: 0.92 },
  /** and the part Pokey is kept in: he may go higher, between the HUD's corners, so a deep drop's landing fits under him */
  heroPad: { l: 0.02, r: 0.98, t: 0.17, b: 0.9 },
} as const;

/**
 * The band along the top of the screen the HUD covers (css px): the hearts, lives, Menu and score pills and the stage's progress card.
 * Measured 2026-10-26: they reach 106 px down sideways (844 x 390) and 128 px upright (400 x 720); a little room is added. Pokey's head
 * is kept under it in every stage: the look across or down a drop gives way first (Matt, 2026-10-26: in 4-7 the look down pushed him
 * half behind the Menu pill).
 */
export const HUD_BAND = { land: 112, port: 140 } as const;
/** how far his head is over his feet (px of world) */
export const HERO_HEAD = 104;
/** the lowest the view's top may sit (its largest y) for his head, feet at feetY, to stay under a HUD band `band` px of world tall */
export const underHud = (feetY: number, band: number): number => feetY - HERO_HEAD - band;

/** a ledge's top */
export interface Ledge {
  x: number;
  y: number;
  width: number;
  broken?: boolean;
}
export interface Climb {
  x: number;
  topY: number;
  bottomY: number;
}
/** a box in the world the view should show */
export interface Box {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
}

/** what to show of a landing at (x, y): the first of the ledge past it, and the space over it he comes down through. (Upright the
 *  view is only 440 wide: a 300 px gap, Pokey and this much of the far side are about all that fit) */
export const landingBox = (x: number, y: number, facing: number): Box =>
  facing >= 0 ? { x0: x - 20, x1: x + 40, y0: y - 80, y1: y + 4 } : { x0: x - 40, x1: x + 20, y0: y - 80, y1: y + 4 };
/** Pokey's own room (his feet at px, py) */
export const heroBox = (px: number, py: number): Box => ({ x0: px - 28, x1: px + 28, y0: py - 104, y1: py + 12 });

/**
 * The next landing past the end of the ledge he stands on, the way he faces: the nearest ledge or vine across the gap. null when he is
 * not near the end, or the ledge carries straight on (no gap).
 */
export function landingAhead(px: number, facing: number, ledge: Ledge, plats: readonly Ledge[], vines: readonly Climb[] = []): Box | null {
  const f = facing < 0 ? -1 : 1;
  const edge = f > 0 ? ledge.x + ledge.width : ledge.x;
  const toEdge = (edge - px) * f;
  if (toEdge > AHEAD.near || toEdge < -40) return null;
  let best: { x: number; y: number; score: number; under?: boolean } | null = null;
  for (const q of plats) {
    if (q === ledge || q.broken || q.width <= 0) continue;
    const dy = q.y - ledge.y;
    if (dy < -AHEAD.up || dy > AHEAD.down) continue;
    // the part of it past the edge
    const a = f > 0 ? Math.max(q.x, edge) : Math.min(q.x + q.width, edge);
    const b = f > 0 ? q.x + q.width : q.x;
    if ((b - a) * f <= 20) continue;
    const gap = (a - edge) * f;
    if (gap > AHEAD.reach) continue;
    // the ledge carries straight on: no gap to look across
    if (gap < 24 && Math.abs(dy) < 40) return null;
    const score = gap + Math.abs(dy) * 0.4;
    // (`under`: the floor of the drop itself, starting right at his edge, well below: 1-6's soft moss under its first liana)
    if (!best || score < best.score) best = { x: a + f * 10, y: q.y, score, under: gap < 24 && dy >= 40 };
  }
  for (const v of vines) {
    const gap = (v.x - edge) * f;
    if (gap < 10 || gap > AHEAD.reach || v.bottomY < ledge.y - AHEAD.up || v.topY > ledge.y + AHEAD.down) continue;
    // (where he would catch it: about his own height, on the part of it that hangs)
    const y = Math.max(v.topY + 40, Math.min(v.bottomY, ledge.y - 60));
    const score = gap + Math.abs(y - ledge.y) * 0.4;
    // a vine across the gap is the way over it, before the floor of the drop under it (which scored nearer: upright, the view showed
    // the moss below the gap and left the liana he was jumping for off screen, QA 2026-10-26)
    if (!best || best.under || score < best.score) best = { x: v.x, y: y + 60, score };
  }
  return best ? landingBox(best.x, best.y, f) : null;
}

/**
 * The view's top-left that shows `land` as well as Pokey (feet at px, py), moved as little as it can be from (tx, ty), the view the
 * camera wanted anyway. Pokey's own room comes first.
 */
export function showBoth(tx: number, ty: number, px: number, py: number, land: Box, vw: number, vh: number): { x: number; y: number } {
  const P = AHEAD.pad, Q = AHEAD.heroPad;
  const fit = (t: number, l0: number, l1: number, lo: number, hi: number, a: number, b: number, hlo: number, hhi: number, size: number) => {
    // the landing inside the clear part of the view ...
    let v = Math.max(t, l1 - size * hi);
    v = Math.min(v, l0 - size * lo);
    // ... and Pokey, first
    v = Math.max(v, b - size * hhi);
    return Math.min(v, a - size * hlo);
  };
  const h = heroBox(px, py);
  return { x: fit(tx, land.x0, land.x1, P.l, P.r, h.x0, h.x1, Q.l, Q.r, vw), y: fit(ty, land.y0, land.y1, P.t, P.b, h.y0, h.y1, Q.t, Q.b, vh) };
}
