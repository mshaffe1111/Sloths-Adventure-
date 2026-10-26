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
import { PHYS } from './physics.ts';

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

/** the look-ahead this frame: easing toward `facing` x `look` (CAM.lookAhead, or less on a narrow upright phone: framing) */
export function camLook(prev: number, facing: number, dt: number, look: number = CAM.lookAhead): number {
  const want = (facing < 0 ? -1 : 1) * look;
  return prev + (want - prev) * Math.min(1, dt * CAM.lookRate);
}

// ───── the lead at a run, on a narrow view (QA, 2026-10-26: upright on a 320 x 782 phone a first-timer running right in 1-3 lost two
// hearts to snakes he never saw) ─────
//
// The camera eases after its aim (RUN.follow), so at a full run it trails about 34 px behind, and the view ahead of him shrinks by that
// much. Upright the view is only 340-440 px of world wide: on 1-3 at 320 x 782 a snake came on screen 0.70 s before it bit. Now, at a
// run, the view leads further, so it shows RUN.ahead px ahead of him (about 1.2 s of running), except that his middle never comes
// nearer the edge behind him than RUN.back of the view: on the narrowest phones that is what limits it (0.8 s or more on 320-400 px
// wide phones, cameraLead.test.ts). Sideways the plain view already shows far more than RUN.ahead, so nothing changes there (the lead
// is 0 for any view over about 515 px of world). The lead grows with his speed over a third of a second or so and fades as quickly
// as the camera catches him up (and the last few px over a couple of seconds), so a stop brings the view to rest, not past him and back.

export const RUN = {
  /** px of world the view shows ahead of him at a full run (his middle to the view's edge) */
  ahead: 340,
  /** the nearest his middle comes to the edge of the view behind him (fraction of its width) */
  back: 0.16,
  /** how fast the lead grows with his speed, and fades when he slows (per second) */
  rate: 3,
  drop: 15,
  /** and how fast the part of it past the camera's trail fades (runOffset) */
  settle: 0.8,
  /** the camera's own easing after its aim (engine.ts updateCamera, per second) */
  follow: 6.5,
} as const;

// ───── the framing by the screen's shape (QA, 2026-10-26) ─────
//
// Upright on a narrow phone (320 x 782, 390 x 844) the view is only 340-440 px of world wide, and the look-ahead put his middle only
// 48-81 css px from the edge behind him: a spider coming up behind him in 5-5 had its "!" and the "-1 HP" squeezed into the left edge.
// There his middle now stays FRAME.back of the view from the edge behind him standing or walking (the look-ahead is cut to fit), and
// FRAME.runBack at a full run, as long as the view ahead keeps FRAME.keepAhead (keepStand standing): on a 390 x 844 phone that is
// 28-30% behind him, where it was 20-23%; on a 320 x 782 one, whose view is only 368 px of world, the way ahead needs nearly all of it,
// so there it is 18-22% (it was 16-20%).
// Sideways on a squat screen (640 x 320, 782 x 288) the hearts row and the pills take a far bigger share of the height, and with his
// feet 55% down the bottom 45% was dirt, so ledges and pickups crowded up under the hearts. There his feet sit FRAME.shortFeetAt down
// the view instead: less dirt, more sky and path; the HUD band still keeps his head clear (HUD_BAND). A boss arena keeps its own
// floor framing (bossDefs floorAt), which already sits as low or lower.
// Every other screen keeps the plain framing.

export const FRAME = {
  /** where his middle sits across the plain view before the look-ahead, and his feet down it (fractions of the view) */
  across: 0.45,
  feetAt: 0.55,
  /** upright and narrower than this (css px): the margins behind him below */
  uprightMaxW: 600,
  /** the nearest his middle comes to the edge behind him there, standing or walking, and at a full run (fractions of the view's width) */
  back: 0.3,
  runBack: 0.28,
  /**
   * but the view ahead of his middle never drops under these (px of world), at a full run and standing: a snake ahead is on screen 0.8 s
   * before it bites (cameraLead.test.ts) and a World 5 spider ahead crouches in full view in time (w5SpiderView.test.ts). On the
   * narrowest phones (a 320 x 782 view is only 368 px of world) the margin behind gives way first. (Standing, a little less: the run
   * lead adds the rest as he sets off, and a stop lets the view settle back only the difference, slowly)
   */
  keepAhead: 305,
  keepStand: 285,
  /** sideways and this short or shorter (css px): his feet this far down the view */
  shortMaxH: 340,
  shortFeetAt: 0.68,
} as const;

/** the framing for one screen shape */
export interface Framing {
  /** the look-ahead (px of world) */
  look: number;
  /** the nearest his middle comes to the edge behind him at a full run (fraction of the view's width) */
  back: number;
  /** how far down the view his feet sit (fraction of its height) */
  feetAt: number;
}
type RunFrame = Pick<Framing, 'look' | 'back'>;

const PLAIN: Framing = { look: CAM.lookAhead, back: RUN.back, feetAt: FRAME.feetAt };

/** the framing on a screen `cssW` x `cssH` (css px) that shows a view `vw` px of world wide */
export function framing(cssW: number, cssH: number, vw: number): Framing {
  const upright = cssH > cssW && cssW < FRAME.uprightMaxW;
  const short = cssW > cssH && cssH <= FRAME.shortMaxH;
  if (!upright && !short) return PLAIN;
  return {
    look: upright ? Math.min(CAM.lookAhead, Math.max(vw * (FRAME.across - FRAME.back), FRAME.keepStand - (1 - FRAME.across) * vw)) : CAM.lookAhead,
    back: upright ? FRAME.runBack : RUN.back,
    feetAt: short ? FRAME.shortFeetAt : FRAME.feetAt,
  };
}

/** how far behind its aim the camera trails at a steady speed (px/s), easing at RUN.follow a frame at a time */
export const camLag = (speed: number, dt: number): number => speed * (1 / RUN.follow - dt);

/** the extra lead (px of world, on top of the look-ahead) a view `vw` wide takes at a full run: 0 when the plain view already shows
 *  enough. `f`: that view's look-ahead and the nearest he may come to the edge behind him (framing; by default CAM.lookAhead, RUN.back) */
export function runLead(vw: number, dt = 1 / 30, f: RunFrame = PLAIN): number {
  // where his middle sits across the view at a full run with no extra: 45% across less the look-ahead, plus the camera's trail
  const plain = vw * FRAME.across - f.look + camLag(PHYS.maxRun, dt);
  // (a margin behind him wider than RUN.back gives way on the narrowest views, so the view ahead never drops under FRAME.keepAhead)
  const want = Math.max(vw * RUN.back, Math.min(vw * f.back, vw - FRAME.keepAhead), vw - RUN.ahead);
  return Math.max(0, plain - want);
}

/** how much of the run lead to take this frame (0 to 1), easing toward his speed the way he faces (vx in px/s); `drop` is how fast it
 *  fades when he slows */
export function camRun(prev: number, vx: number, facing: number, dt: number, drop: number = RUN.drop): number {
  const want = Math.min(1, Math.max(0, (vx * (facing < 0 ? -1 : 1)) / PHYS.maxRun));
  return prev + (want - prev) * Math.min(1, dt * (want > prev ? RUN.rate : drop));
}

/**
 * The run lead this frame (px of world, the way he faces): the part that makes up for the camera's trail behind him fades as fast as
 * the trail does when he stops (`fast`, from camRun with RUN.drop), and the rest slowly (`slow`, with RUN.settle), so a stop brings
 * the view to rest and then lets it drift the last few px back over a couple of seconds instead of swinging it back at once.
 */
export function runOffset(vw: number, fast: number, slow: number, dt = 1 / 30, f: RunFrame = PLAIN): number {
  const lead = runLead(vw, dt, f);
  const trail = Math.min(lead, camLag(PHYS.maxRun, dt));
  return trail * fast + (lead - trail) * slow;
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
