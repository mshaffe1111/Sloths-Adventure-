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

// ───── the re-pick ease (R-165.214, Matt 2026-11-13: getting on and off vines "not very smooth") ─────
//
// The anchor's rules pick a new height in ONE frame when he catches a vine (in the air it held the ground he left; on the vine it is
// him: 60-90 px up at once), lands after jumping off one (140 px down at once), or a hand step or vault puts his body somewhere new.
// The camera eases after its aim, but an aim that jumps starts it from rest to 14-28 css px a frame in one frame (measured on the real
// page, tools/inspect/camFeel.mjs, 1-4 both ways): the world lurches. Now the camera aims at an EASED subject: where his body and the
// anchor's pick move as they did last frame, it follows them exactly (a climb, a run and a fall frame the same as before); where they
// jump (the rule re-picked, or his body was put somewhere), the jump is taken up by an offset that a critically damped spring brings
// back to nothing, so the view starts from rest and comes in like any other move. Never past the band the air rules already allow
// (CAM.airUp / airDown of the view's height, a quarter of its width), so he never leaves the screen; a respawn or a placement cut
// (camAnchor's teleport) is followed at once.

export const REPICK = {
  /** the spring's rate (per second, critically damped): 8 settles a 90 px re-pick in about 0.6 s with a jerk of 2-3 css px */
  rate: 8,
  /** a change in his move from one frame to the next over this (world px) is a re-pick, not a move: a climb starts at about 7 px a
   *  frame, a run turns by under 2, gravity adds about 2; a grab, a hand step or a landing re-pick moves 17-140 */
  cut: 12,
  /** the widest the offset may grow across (fraction of the view's width) */
  across: 0.25,
  /** an offset that holds him higher on the screen leaves this much (px of world) between his head and the HUD band at the aim: the
   *  camera trails a climbing aim by 25-45 px, and standing, the HUD rule pulls the view at once (1-5 headless: a 27 px jerk without it) */
  hudRoom: 60,
} as const;

/** one axis of the eased subject */
export interface EaseAxis {
  /** the last raw value, and the move it is expected to keep making (his body's, held to him) */
  raw: number;
  d: number;
  /** the offset still to take up, and how fast it is changing (px/s) */
  off: number;
  v: number;
}
export interface Repick {
  x: EaseAxis;
  y: EaseAxis;
  /** what held the anchor last frame (swinging, standing / climbing / hanging, or in the air) */
  mode: string;
  /** his body's height last frame, and where the camera was left last frame (markCam): moved since by anything else, it was a cut */
  by: number;
  cx: number;
  cy: number;
}
const axis = (): EaseAxis => ({ raw: NaN, d: 0, off: 0, v: 0 });
export const newRepick = (): Repick => ({ x: axis(), y: axis(), mode: '', by: NaN, cx: NaN, cy: NaN });
/** a body jump bigger than this in one frame (px) is a respawn, a flag or a door, never a move (vineFeel.ts SETTLE_MAX's number) */
export const REPICK_TELEPORT = 96;

/** what holds the anchor: a change of it is always a re-pick */
export const anchorMode = (p: CamSubject): string => (p.swingBottom !== undefined ? 'swing' : p.grounded || p.climbing || p.hanging ? 'held' : 'air');

/** one axis: the value to aim at this frame for `raw`, taking up `jump` (px: the part of this frame's move that is a re-pick) into the
 *  offset, which is kept within [-lo, hi] (px of world) */
function easeAxis(a: EaseAxis, raw: number, dt: number, jump: number, cut: boolean, lo: number, hi: number): number {
  if (cut || !Number.isFinite(a.raw)) {
    Object.assign(a, { raw, d: 0, off: 0, v: 0 });
    return raw;
  }
  a.raw = raw;
  a.off -= jump;
  const w = REPICK.rate;
  a.v += (-w * w * a.off - 2 * w * a.v) * dt;
  a.off += a.v * dt;
  if (a.off < -lo || a.off > hi) {
    a.off = Math.max(-lo, Math.min(hi, a.off));
    a.v = 0;
  }
  return raw + a.off;
}

/** the part of a body's move `d` that is a snap, not a move: its change from last frame's move `d0` over REPICK.cut */
const snapPart = (d: number, d0: number): number => (Math.abs(d - d0) > REPICK.cut ? d - d0 : 0);

/**
 * The eased subject this frame: `x` his body's middle, `anchor` camAnchor's pick (this frame's), `p` what camAnchor was given, `prevAnchor`
 * the anchor it was given as last frame's, `camX/camY` the camera as this frame found it. A re-pick is the part of the aim's move that his
 * body's own move does not explain: the anchor jumping further than he moved (a catch, a landing, a swing caught or let go), or his body
 * put somewhere new while it holds (a hand step, a vault: its move changed by over REPICK.cut in a frame). A speed change is never one
 * (the air rule starting to follow a fall moves the anchor no further than he moved). A CUT is followed at once, never eased: a respawn
 * or stage start (prevAnchor NaN, or a jump of a view), a flag, door or teleport (his body moved over REPICK_TELEPORT px in a frame), or
 * the camera put somewhere by anything but updateCamera since last frame (markCam). `roomUp`: how far his head sits under the HUD band at
 * the framing (px of world; the engine's feet share of the view less HERO_HEAD and the band): an offset holding him higher stays
 * REPICK.hudRoom inside it, so the HUD rule never has to pull the view (where there is no room, the old one-frame move is kept).
 */
export function repick(s: Repick, x: number, anchor: number, prevAnchor: number, p: CamSubject, vw: number, vh: number, dt: number, camX: number, camY: number, roomUp = Infinity): { x: number; y: number } {
  const moved = Number.isFinite(s.cx) && (Math.abs(camX - s.cx) > 0.5 || Math.abs(camY - s.cy) > 0.5);
  const cut = moved || !Number.isFinite(prevAnchor) || Math.abs(p.y - prevAnchor) > vh * CAM.teleport || Math.abs(x - s.x.raw) > REPICK_TELEPORT || Math.abs(p.y - s.by) > REPICK_TELEPORT;
  const mode = anchorMode(p);
  const held = mode === 'held' && s.mode === 'held';
  s.mode = mode;
  // y: the anchor's move past his body's own this frame, or (held to him both frames) his body's snap
  const dBody = Number.isFinite(s.by) ? p.y - s.by : 0;
  s.by = p.y;
  const dRaw = Number.isFinite(s.y.raw) ? anchor - s.y.raw : 0;
  const snapY = held ? snapPart(dBody, s.y.d) : 0;
  const jumpY = held ? snapY : dRaw - Math.max(Math.min(0, dBody), Math.min(Math.max(0, dBody), dRaw));
  s.y.d = held && !snapY ? dBody : 0;
  // (the anchor above him by up to the air's "down" band puts him lower on the screen; below him by "up" puts him higher)
  const y = easeAxis(s.y, anchor, dt, jumpY, cut, vh * CAM.airDown, Math.max(0, Math.min(vh * CAM.airUp, roomUp - REPICK.hudRoom)));
  // x: his body's snap
  const dx = Number.isFinite(s.x.raw) ? x - s.x.raw : 0;
  const jumpX = snapPart(dx, s.x.d);
  if (!jumpX) s.x.d = dx;
  const xx = easeAxis(s.x, x, dt, jumpX, cut, vw * REPICK.across, vw * REPICK.across);
  return { x: xx, y };
}
/** where updateCamera left the camera this frame (repick's cut test) */
export function markCam(s: Repick, x: number, y: number): void {
  s.cx = x;
  s.cy = y;
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

// ───── the climb camera (R-165.170 piece 3) ─────
//
// His feet sat 55% down the view on every stage (68% on a squat sideways screen). On a stage that travels UP that shows as much under
// him as over him, and what he needs is over him: the next storey, where the vine leads. Sideways the view is only 540 px of world
// tall: with his feet 55% down, 297 px over them, and the HUD's band over the top of that, the storey above (a turn up: 225 px or
// more, 281 where it lies over the one he is on) was hidden behind the hearts and the goal sign. Now, on a stage whose travel leads up
// (a stage laid as a TOWER, gen2/tower.ts towerLead: its travel's lead, -1), his feet sit CLIMB_VIEW.up down the view: sideways 432 px of world over his feet, 285 clear under the
// HUD band (cameraFollow.test.ts holds the px, both ways round); upright 782 px over them, two storeys and more.
// On a stage that leads DOWN his feet sit CLIMB_VIEW.down from the top, so the landing under him shows before he commits (D46: no
// blind drop); the engine's HUD rule still keeps his head under the band (engine.ts underHud), so sideways they come to rest lower
// than that share and about 290 px shows under them.
// It is the stage's travel, never where he happens to be on it: the framing does not move as he walks, hops or climbs, so nothing
// eases and nothing jiggles (the anchor's rules above are unchanged). A run (dy 0) keeps its framing exactly, and so does every
// shipped climb of the old generator and the way down (towerLead gives them 0): rising water, lava and mist come from under him
// there, and seeing less under his feet is a change each of those stages must be looked at for (R-165.170's report).

export const CLIMB_VIEW = {
  /** on a stage that leads up: how far down the view his feet sit (the rest is over him) */
  up: 0.8,
  /** on a stage that leads down: how far down the view his feet sit (the rest is under him) */
  down: 0.34,
} as const;

/**
 * How far down the view his feet sit on this stage: `base` (the screen's framing, Framing.feetAt) on a run; on a stage that leads up
 * never higher than CLIMB_VIEW.up; on one that leads down never lower than CLIMB_VIEW.down. `leadDy`: gen2/tower.ts towerLead.
 */
export function travelFeet(base: number, leadDy: number): number {
  return leadDy < 0 ? Math.max(base, CLIMB_VIEW.up) : leadDy > 0 ? Math.min(base, CLIMB_VIEW.down) : base;
}

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
export function landingAhead(px: number, facing: number, ledge: Ledge, plats: readonly Ledge[], vines: readonly Climb[] = [], whole = false): Box | null {
  const f = facing < 0 ? -1 : 1;
  const edge = f > 0 ? ledge.x + ledge.width : ledge.x;
  const toEdge = (edge - px) * f;
  if (toEdge > AHEAD.near || toEdge < -40) return null;
  let best: { x: number; y: number; score: number; under?: boolean; end?: number } | null = null;
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
    if (!best || score < best.score) best = { x: a + f * 10, y: q.y, score, under: gap < 24 && dy >= 40, end: b };
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
  if (!best) return null;
  // (a swing's landing, `whole`: the perch end to end, so he sees where it stops before he lets go: SWING_CAM)
  return whole && best.end !== undefined && !best.under ? perchBox(best.x - f * 10, best.end, best.y, f) : landingBox(best.x, best.y, f);
}

/**
 * The swing camera (R-165.225; Matt, 2026-11-14 2:02 AM ET, "shorter swings": every liana's landing fits upright). Upright a phone shows
 * only ~405-440 px of world, and a liana throws him 400 px and more past its anchor (1-6.md), so while he swings the view eases OUT, no
 * more than `out` (Pokey stays 1 / 1.3 = 77% of his usual size or more), and leads with the WHOLE perch the swing throws him onto
 * (perchBox, not landingBox's 60 px lip); it eases back in once he is down. Sideways (1168 px of world) it never widens.
 */
export const SWING_CAM = {
  /** the most the view widens while he swings, times the usual view (Matt: ~1.3x; Pokey at 77% of his size) */
  out: 1.3,
  /** per second: out from the catch (95% in ~0.67 s, before the first forward sweet spot, as LAND_EASE.rate) and back in once he is
   *  down (95% in ~1 s) */
  rateOut: 4.5,
  rateIn: 3,
  /** the most of a landing shown whole (px): a perch end to end; of a long bough or the ground, its first this much */
  perch: 300,
  /**
   * the narrowest usual upright view of the phones the gates use (px of world): 412 x 915 and 400 x 880 on a 900 px level (engine.ts
   * applyZoom: the level's height x 0.45). SWING_SEEN is figured on it, so a perch it passes is whole in view on every one of them
   */
  refVw: 405,
} as const;

/** a swing's landing: the perch from its near end (`near`) to its far end (`far`), at most SWING_CAM.perch of it, and the space over it */
export function perchBox(near: number, far: number, y: number, facing: number): Box {
  const end = facing >= 0 ? Math.min(far, near + SWING_CAM.perch) : Math.max(far, near - SWING_CAM.perch);
  return facing >= 0 ? { x0: near - 10, x1: end, y0: y - 80, y1: y + 4 } : { x0: end, x1: near + 10, y0: y - 80, y1: y + 4 };
}


/**
 * How far the view should widen now (1 = the usual view; the engine divides its zoom by it): upright, on a swing or flying off one, as
 * much as fits him (at the swing's anchor `anchorX`) and the whole of `land` across the clear part of a view `usualVw` wide, up to
 * SWING_CAM.out. Sideways, on the ground, or with no landing ahead: 1.
 */
export function swingWideTarget(upright: boolean, swinging: boolean, anchorX: number, land: Box | null, usualVw: number): number {
  if (!upright || !swinging || !land || usualVw <= 0) return 1;
  const reach = Math.max(Math.abs(land.x1 - anchorX), Math.abs(land.x0 - anchorX)) + 28;
  return Math.max(1, Math.min(SWING_CAM.out, reach / ((AHEAD.pad.r - AHEAD.heroPad.l) * usualVw)));
}

/** one step of the swing ease from `k` toward `target` (dt s): out at SWING_CAM.rateOut, back in at rateIn; it settles exactly on it */
export function swingWideEase(k: number, target: number, dt: number): number {
  const n = k + (target - k) * Math.min(1, dt * (target > k ? SWING_CAM.rateOut : SWING_CAM.rateIn));
  return Math.abs(target - n) < 0.002 ? target : n;
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

/**
 * how far in from either side of the view his middle is always kept (px of world): his body and a little room. The camera's aim already
 * keeps him in view (showBoth's heroPad); this is for the eased camera, which trails the aim (QA v200, 5-4 upright at 320 x 782:
 * swinging back on a long silk line, he went out past the left edge while the camera caught up)
 */
export const HERO_KEEP = 44;
/** the camera's left edge, moved just enough to keep his middle (at px) HERO_KEEP px inside a view `vw` wide (or centred, if narrower) */
export function keepHeroX(camX: number, px: number, vw: number): number {
  const keep = Math.min(HERO_KEEP, vw / 2);
  return Math.max(px + keep - vw, Math.min(px - keep, camX));
}

/**
 * THE FAR CAP, in one place (R-165.225): how far ahead of his middle, at the moment he presses to let go, the far end of a perch may lie
 * and still be whole in the view at the swing's full ease on the narrowest gate phone: him led to the back edge (the engine keeps his
 * middle HERO_KEEP in, or his half body plus AHEAD.heroPad, whichever is more), the perch inside AHEAD.pad's clear part ahead. gen2 counts
 * a release press only if its perch's far end is within this of him (pipeline lianaRelease), so no liana it lays throws him at a perch
 * he cannot see whole. 472 px.
 */
export const SWING_SEEN = Math.floor(AHEAD.pad.r * SWING_CAM.out * SWING_CAM.refVw - Math.max(HERO_KEEP, 28 + AHEAD.heroPad.l * SWING_CAM.out * SWING_CAM.refVw));
