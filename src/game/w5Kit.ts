/**
 * World 5's pieces of play (the Orchid Sanctuary), the rules only. Each one comes from the story (reference/STORY-REWRITE.md "World 5"):
 * Dot's five rules are the mechanics, and the sanctuary's lovely things are the traps.
 *
 *   don't sit     standing still too long makes Pokey drowsy and silk starts creeping up him. A move or a wiggle shakes it off; still
 *                 long enough and he is wrapped (a heart, or in 5-1, where it is taught gently, only a fright). Soft armchairs beside the
 *                 path tug him toward them as he passes; sitting in one brings the silk on faster. Silk-wrapped "visitor" chairs are
 *                 the guests who sat (scenery).
 *   don't eat     tiny cakes look like pickups but make him sleepy (slower for a few seconds). Whether ANY cake was eaten in World 5 is
 *                 saved with the game, for the Queen's line and a badge (CAKE_KEY).
 *   don't drink   warm teapots ("always warm") puff sleepy steam on a rhythm; walking through a puff makes him sleepy.
 *   don't touch   some threads hum when touched, and the spiders near them turn and come (stealth without hiding spots).
 *   don't admire  shimmering silk sheets: lingering in front of one (stopped, or dawdling) counts as standing still, and faster.
 *   orchids       big orchids are platforms and pickups that open and close on a rhythm, closing earlier as the world goes on.
 *   cocoons       creatures wrapped in silk: punch one open to free them.
 *   silk lines    swing on them like lianas (the liana system: a Vine with `silk`).
 *   carvings      Meeca's shaky hairpin letters on the trunks; the game draws the words, so they are crisp.
 *   the Butler    a waistcoated spider holding out a tray with a cake on it: punch the tray away (walk into it and he has eaten).
 *   spiders       World 5's jumping spiders crouch for a moment (SPIDER5.tell) before they rush, so the first rush is always warned, and
 *                 they crouch only in full view on the screen (SPIDER5.edge), so the warning is always seen.
 *
 * Pure (no canvas, no engine): the stage builder, the engine (w5Play.ts) and the tests agree on what each one is doing.
 */
import type { Vine } from './types.ts';

// ───────────────────────────── don't sit ─────────────────────────────

export const SIT = {
  /** slower than this (px/s) on the ground counts as standing still */
  still: 20,
  /** seconds of standing still before the silk starts creeping */
  drowse: 2.4,
  /** seconds from the first silk to wrapped (5-1's gentle lesson takes longer) */
  creep: 3.4,
  gentleCreep: 4.6,
  /** silk shed per second while he moves, and with each wiggle (a new push left or right) */
  shake: 1.6,
  wiggle: 0.34,
  /** how much faster it all comes on sitting in a chair, or lingering in front of a silk sheet */
  seat: 2.2,
  linger: 1.8,
  /** the share of his speed the silk takes at its thickest (it is sticky: shaking it off is a little slow) */
  slow: 0.35,
  /** seconds after a wrap before stillness counts again (the silk has just burst off) */
  cool: 1.2,
  /**
   * seconds of standing still before Dot first says so (W5_TEACH.still): well before the silk can start at `drowse`, so the rule is
   * taught before it ever catches him (QA v198: the silk grabbed him "silently", its line only after the first catch)
   */
  notice: 1,
  /** the silk a jump sheds at once (a jump is a wiggle: it is never swallowed by the silk) */
  jump: 0.4,
  /** with more silk than this on him, pulling against it shows (WOBBLE) */
  showTug: 0.08,
} as const;

/** how he wobbles in the silk while he pulls against it (W5Play.wobble): world px, more the thicker it is; how quick; how long after */
export const WOBBLE = { px: 1.5, perSilk: 3.5, rate: 38, hold: 0.3 } as const;

export interface SitState {
  /** seconds he has stood still (scaled by the chair and the sheet) */
  still: number;
  /** how far up him the silk has crept, 0..1 */
  silk: number;
  /** the way he was steering last frame */
  steer: -1 | 0 | 1;
  /** seconds of the cool-down after a wrap */
  cool: number;
}

export const newSit = (): SitState => ({ still: 0, silk: 0, steer: 0, cool: 0 });

export interface SitInput {
  /** on the ground and not moving (or dawdling in front of a silk sheet) */
  still: boolean;
  /** the steering this frame */
  steer: -1 | 0 | 1;
  /** in a soft chair */
  seated: boolean;
  /** lingering in front of a silk sheet */
  admiring: boolean;
}

/** one frame of the stillness rule: the new state, whether he was wrapped this frame, and whether the silk has just begun to creep */
export function stepSit(s: SitState, inp: SitInput, dt: number, gentle = false): { s: SitState; wrapped: boolean; began: boolean } {
  let { still, silk, cool } = s;
  // a new push one way or the other is a wiggle: it sheds a chunk of silk at once
  const wiggled = inp.steer !== 0 && inp.steer !== s.steer;
  if (cool > 0) {
    cool = Math.max(0, cool - dt);
    return { s: { still: 0, silk: Math.max(0, silk - SIT.shake * dt), steer: inp.steer, cool }, wrapped: false, began: false };
  }
  const rate = (inp.seated ? SIT.seat : 1) * (inp.admiring ? SIT.linger : 1);
  if (inp.still) {
    still += dt * rate;
    if (still > SIT.drowse) silk += (dt * rate) / (gentle ? SIT.gentleCreep : SIT.creep);
  } else {
    still = 0;
    silk -= SIT.shake * dt;
  }
  if (wiggled) silk -= SIT.wiggle;
  silk = Math.max(0, silk);
  const began = s.silk <= 0 && silk > 0;
  if (silk >= 1) return { s: { still: 0, silk: 0, steer: inp.steer, cool: SIT.cool }, wrapped: true, began };
  return { s: { still, silk, steer: inp.steer, cool }, wrapped: false, began };
}

/** how drowsy he looks (0..1): a soft hint as the stillness builds, then the silk itself */
export function sitDrowsy(s: SitState): number {
  const pre = Math.max(0, Math.min(1, (s.still - SIT.drowse * 0.5) / (SIT.drowse * 0.5)));
  return Math.min(1, Math.max(pre * 0.3, s.silk));
}

/** the share of his walking speed the silk leaves him */
export const silkSpeed = (silk: number): number => 1 - SIT.slow * Math.max(0, Math.min(1, silk));

/** a soft armchair beside the path (`wrapped`: one of the guests who sat, scenery only) */
export interface Chair {
  x: number;
  /** the ground it stands on */
  y: number;
  /** which way it faces (the seat opens that way) */
  face: 1 | -1;
  color?: 'pink' | 'lilac' | 'cream';
  wrapped?: boolean;
}

export const CHAIR = {
  /** how far along the ground it tugs (px), how hard (px/s at the edge and close up), and how close is sitting in it */
  reach: 180,
  pull: 72,
  near: 0.35,
  seat: 28,
  /** how far his feet may be off the chair's ground and still be pulled (px) */
  level: 30,
} as const;

/** the tug a chair gives him (px/s, + to the right): only on the ground beside it, stronger the closer he is; none from a wrapped one */
export function chairPull(c: Chair, px: number, feetY: number, grounded: boolean): number {
  if (c.wrapped || !grounded || Math.abs(feetY - c.y) > CHAIR.level) return 0;
  const d = c.x - px;
  const ad = Math.abs(d);
  if (ad > CHAIR.reach || ad < 3) return 0;
  return Math.sign(d) * CHAIR.pull * (CHAIR.near + (1 - CHAIR.near) * (1 - ad / CHAIR.reach));
}

/** is he sitting in it (in its seat, on its ground)? */
export const seatedIn = (c: Chair, px: number, feetY: number): boolean => !c.wrapped && Math.abs(c.x - px) < CHAIR.seat && Math.abs(feetY - c.y) <= CHAIR.level;

// ───────────────────────────── don't eat ─────────────────────────────

/** a tiny cake, floating like a pickup at (x, y) (its middle) */
export interface Cake {
  x: number;
  y: number;
}

export const CAKE = {
  /**
   * half its touch box (px), seconds of sleep, and the share of his speed left while asleep on his feet. The box is a little inside the
   * painted cake (about 31 by 41 px, w5Look.ts drawCake), and his reach for it a little inside his body: a hop that looks clear of it
   * is (QA 5-2, 2026-10-26: three cakes eaten on hops she thought had cleared them).
   */
  half: 11,
  /** half his body's width, for touching a cake (his body is 26 px wide) */
  reach: 10,
  sleepy: 4.5,
  slow: 0.5,
} as const;

/** does his body (feet at px, py) touch the cake? */
export function touchesCake(c: { x: number; y: number }, px: number, py: number, ducking = false): boolean {
  const h = ducking ? 24 : 38;
  return Math.abs(c.x - px) < CAKE.reach + CAKE.half && c.y + CAKE.half > py - h && c.y - CAKE.half < py;
}

/** the share of his speed left with `left` seconds of sleepiness to go: slow, easing back over the last second */
export function sleepySpeed(left: number, slow: number = CAKE.slow): number {
  if (left <= 0) return 1;
  if (left >= 1) return slow;
  return slow + (1 - slow) * (1 - left);
}

/** the game's record of World 5's cakes (saveFile.ts keeps it with the game, so a new game starts with none eaten) */
export const CAKE_KEY = 'sloth_w5_cakes';
export interface CakeRecord {
  v: 1;
  eaten: number;
  /** the stages a cake was eaten in */
  stages: string[];
}

type CakeStore = Pick<Storage, 'getItem' | 'setItem'> | null;
function cakeStore(): CakeStore {
  try {
    return typeof localStorage !== 'undefined' ? localStorage : null;
  } catch {
    return null;
  }
}

/** only a well-formed record counts; anything else is no cake eaten */
export function parseCakes(raw: string | null): CakeRecord {
  const none: CakeRecord = { v: 1, eaten: 0, stages: [] };
  if (!raw) return none;
  try {
    const o = JSON.parse(raw);
    if (!o || o.v !== 1 || typeof o.eaten !== 'number' || !Array.isArray(o.stages)) return none;
    return { v: 1, eaten: Math.max(0, Math.floor(o.eaten)), stages: o.stages.filter((s: unknown) => typeof s === 'string' && /^5-\d{1,2}$/.test(s)).slice(0, 12) };
  } catch {
    return none;
  }
}

export function loadCakes(store: CakeStore = cakeStore()): CakeRecord {
  try {
    return parseCakes(store?.getItem(CAKE_KEY) ?? null);
  } catch {
    return parseCakes(null);
  }
}

/** a cake was eaten in this stage */
export function recordCake(stageId: string, store: CakeStore = cakeStore()): CakeRecord {
  const r = loadCakes(store);
  const next: CakeRecord = { v: 1, eaten: r.eaten + 1, stages: r.stages.includes(stageId) ? r.stages : [...r.stages, stageId] };
  try {
    store?.setItem(CAKE_KEY, JSON.stringify(next));
  } catch {
    /* storage full or blocked: the cake still made him sleepy */
  }
  return next;
}

export const anyCakeEaten = (store: CakeStore = cakeStore()): boolean => loadCakes(store).eaten > 0;

/** the Queen's line about the cake (storyBosses.ts, World 5's guardian): true only if no cake was eaten in all of World 5 */
export function queenCakeLine(eaten: boolean): string {
  return eaten ? 'You ate the cake, darling. Everyone does.' : 'And you didn\'t eat the cake. Nobody has ever not eaten the cake.';
}

// ───────────────────────────── the Butler ─────────────────────────────

/** a waistcoated spider standing on the path at x (feet on y), holding a tray out toward `dir` */
export interface Butler {
  x: number;
  y: number;
  dir: 1 | -1;
}

export const BUTLER = {
  /** he holds the tray out once Pokey is this close (px), taking `tell` seconds to do it; a cake is back on it `refill` s after */
  offer: 340,
  tell: 0.8,
  refill: 6,
  /** where the tray is, from his feet (px): out in front, at Pokey's chest */
  trayOut: 46,
  trayUp: 34,
  /** a punch this close to the tray knocks it away */
  punch: 80,
} as const;

export type ButlerPhase = 'idle' | 'offer' | 'knocked' | 'refill';
export interface ButlerState {
  phase: ButlerPhase;
  t: number;
  cake: boolean;
}
export const newButler = (): ButlerState => ({ phase: 'idle', t: 0, cake: true });

/** the tray's middle, and how far out it is (0 tucked in, 1 held right out) */
export function trayAt(b: Butler, st: ButlerState): { x: number; y: number; out: number } {
  const out = st.phase === 'offer' ? Math.min(1, st.t / BUTLER.tell) : st.phase === 'idle' || st.phase === 'refill' ? 0 : 1;
  return { x: b.x + b.dir * (18 + (BUTLER.trayOut - 18) * out), y: b.y - BUTLER.trayUp, out };
}

/** one frame: `near` he is within the offer distance in front of him; `punched` a punch landed by the tray; `touch` his body is on it */
export function stepButler(st: ButlerState, inp: { near: boolean; punched: boolean; touch: boolean }, dt: number): { st: ButlerState; ate: boolean; knocked: boolean } {
  const t = st.t + dt;
  if (st.phase === 'idle') return { st: inp.near && st.cake ? { phase: 'offer', t: 0, cake: true } : { ...st, t }, ate: false, knocked: false };
  if (st.phase === 'offer') {
    if (inp.punched && st.cake) return { st: { phase: 'knocked', t: 0, cake: false }, ate: false, knocked: true };
    // the tray is only taken from once it is right out (the tell has played)
    if (inp.touch && st.cake && t >= BUTLER.tell) return { st: { phase: 'refill', t: 0, cake: false }, ate: true, knocked: false };
    if (!inp.near && t >= BUTLER.tell) return { st: { phase: 'idle', t: 0, cake: st.cake }, ate: false, knocked: false };
    return { st: { ...st, t }, ate: false, knocked: false };
  }
  // knocked away or eaten: a fresh cake comes out of a pocket after a while
  if (t >= BUTLER.refill) return { st: { phase: 'idle', t: 0, cake: true }, ate: false, knocked: false };
  return { st: { ...st, t }, ate: false, knocked: false };
}

// ───────────────────────────── don't drink ─────────────────────────────

/** a warm teapot standing at (x, y: its base), spout toward `dir`, puffing on its own rhythm */
export interface Teapot {
  x: number;
  y: number;
  dir: 1 | -1;
  /** seconds quiet, rattling (the warning), and puffing; where in its beat it starts */
  idle: number;
  warn: number;
  puff: number;
  offset: number;
}

export const TEAPOT = {
  idle: 2.6,
  warn: 0.9,
  puff: 1.5,
  /** the steam column: half its width (px) and how high it rises above the spout */
  half: 46,
  rise: 200,
  /** seconds of sleep a breath of it brings */
  sleepy: 2.6,
  /** the fairness floor: a warning at least this long, and a quiet spell long enough to walk past */
  minWarn: 0.6,
  minIdle: 2,
} as const;

export const newTeapot = (x: number, y: number, dir: 1 | -1 = 1, o: Partial<Pick<Teapot, 'idle' | 'warn' | 'puff' | 'offset'>> = {}): Teapot => ({
  x, y, dir, idle: o.idle ?? TEAPOT.idle, warn: o.warn ?? TEAPOT.warn, puff: o.puff ?? TEAPOT.puff, offset: o.offset ?? 0,
});

export type PotPhase = 'idle' | 'warn' | 'puff';
/** where the pot is in its beat: the phase and how far through it (0..1) */
export function potAt(p: Teapot, t: number): { phase: PotPhase; u: number } {
  const cyc = p.idle + p.warn + p.puff;
  const s = (((t + p.offset) % cyc) + cyc) % cyc;
  if (s < p.idle) return { phase: 'idle', u: s / p.idle };
  if (s < p.idle + p.warn) return { phase: 'warn', u: (s - p.idle) / p.warn };
  return { phase: 'puff', u: (s - p.idle - p.warn) / p.puff };
}

/** the spout (where the steam comes from) */
export const spoutOf = (p: Teapot): { x: number; y: number } => ({ x: p.x + p.dir * 30, y: p.y - 34 });

/** is his body (feet at px, py) in the steam right now? */
export function inSteam(p: Teapot, t: number, px: number, py: number): boolean {
  if (potAt(p, t).phase !== 'puff') return false;
  const s = spoutOf(p);
  return Math.abs(px - s.x) < TEAPOT.half + 13 && py > s.y - TEAPOT.rise && py - 38 < s.y + 20;
}

/** a teapot's rhythm is fair: warned for long enough, and quiet for long enough to walk past */
export const potFair = (p: Teapot): boolean => p.warn >= TEAPOT.minWarn && p.idle >= TEAPOT.minIdle;

// ───────────────────────────── don't touch the silk ─────────────────────────────

/** a humming thread strung low across the way, from x0 to x1 at height y (jump over it) */
export interface Thread {
  x0: number;
  x1: number;
  y: number;
}

export const THREAD = {
  /** seconds it quivers after a touch; how far its hum carries (px along, and up or down) */
  hum: 1.4,
  alert: 680,
  alertDy: 260,
  /** seconds before a thread can hum again */
  cool: 2.2,
} as const;

/** does his body (feet at px, py) touch the thread? */
export function threadTouched(th: Thread, px: number, py: number, ducking = false): boolean {
  const h = ducking ? 24 : 38;
  const a = Math.min(th.x0, th.x1), b = Math.max(th.x0, th.x1);
  return px + 13 > a && px - 13 < b && py - h < th.y + 2 && py > th.y - 2;
}

/** does a hum from this thread reach a spider at (x, y)? */
export const humReaches = (th: Thread, x: number, y: number): boolean =>
  Math.abs(x - (th.x0 + th.x1) / 2) < THREAD.alert && Math.abs(y - th.y) < THREAD.alertDy;

// ───────────────────────────── the spiders ─────────────────────────────

/** a World 5 spider (an enemy of type 'spider', by id): `doze` ones sleep until a thread hums or he bumps right into them */
export interface W5Spider {
  id: number;
  doze?: boolean;
}

export const SPIDER5 = {
  /** the crouch before the rush (s): the readable warning (World 5's rule: every attack warned at least 0.6 s) */
  tell: 0.7,
  /** how close he must come to notice him: dozing (only by walking right into it: a hop over it does not wake it), and awake; and how
   *  far up or down it looks */
  doze: 64,
  sense: 430,
  dy: 170,
  /**
   * how far inside the edges of the screen (world px) its whole body must be before it may crouch. It notices him from 430 px either
   * way, but upright on a narrow phone the view shows only about 80 px behind him and under 300 ahead: QA (2026-10-26, 320 x 782) saw
   * every crouch happen off the screen, so the rush was the first thing the player saw. Now it crouches only where he can see it.
   */
  edge: 30,
  /** a rush that has been off the screen this long (s) is given up: it must crouch again in view before it can come again */
  lose: 0.4,
  /** an awake spider that heard a hum while off the screen still comes if it is in view within this long (s) */
  called: 4,
  /**
   * a rush is one way: once he is this far (px) past the spider's middle, behind where it was rushing, the rush is over, and it must
   * crouch again in view before it comes back the other way. It used to turn and chase on the same rush, biting him from behind with
   * no warning of its own, at the edge of the screen he had his back to (QA v198, 5-1 and 5-2 at 320 x 782)
   */
  past: 4,
} as const;

/** what the camera shows (world units): its left and right, top and bottom */
export interface ViewBox {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
}

/** is a body (middle x, y; w by h) on the screen, at least `inset` px inside every edge of the view? */
export const onScreen = (v: ViewBox, x: number, y: number, w: number, h: number, inset = 0): boolean =>
  x - w / 2 >= v.x0 + inset && x + w / 2 <= v.x1 - inset && y - h / 2 >= v.y0 + inset && y + h / 2 <= v.y1 - inset;

export type GatePhase = 'calm' | 'windup' | 'go';
export interface GateState {
  phase: GatePhase;
  t: number;
  /** still asleep (until something wakes it, then it stays awake) */
  dozing: boolean;
  /** seconds left in which a hum it heard off the screen still brings it, once it is in view */
  called: number;
  /** seconds its rush has been off the screen */
  lost: number;
  /** the way its rush goes (toward where he was as it crouched: +1 right, -1 left; 0 or unset, either way) */
  dir?: -1 | 0 | 1;
}
export const newGate = (doze = false): GateState => ({ phase: 'calm', t: 0, dozing: doze, called: 0, lost: 0 });
const CALM: GateState = { phase: 'calm', t: 0, dozing: false, called: 0, lost: 0 };

/**
 * one frame of a spider's gate (the engine's own spider brain runs only once the gate is open, `go`): `dx`, `dy` from the spider to him;
 * `alarm` a thread hummed within reach; `hunting` the spider's own brain still has him in mind (it falls calm once that runs out);
 * `grounded` he is on his feet (a sleeping spider wakes only if he walks right into it, never at a hop over it).
 *
 * The screen: `seen`, its whole body is on the screen and SPIDER5.edge inside its edges (only then may it crouch, so the warning is
 * always where he can see it; nothing rouses it from out of sight, ahead or behind); `shown`, its whole body is on the screen at all (a
 * crouch that leaves the screen is called off, so every rush comes after a whole crouch in view; a rush that stays off the screen
 * SPIDER5.lose is given up). Both default to true (no screen: the rules alone).
 */
export function stepGate(
  g: GateState,
  inp: { dx: number; dy: number; alarm: boolean; hunting: boolean; grounded?: boolean; seen?: boolean; shown?: boolean },
  dt: number,
): GateState {
  const t = g.t + dt;
  const seen = inp.seen !== false;
  const shown = inp.shown !== false;
  if (g.phase === 'calm') {
    const bumped = g.dozing ? inp.grounded !== false && Math.abs(inp.dy) < 40 && Math.abs(inp.dx) < SPIDER5.doze : Math.abs(inp.dy) < SPIDER5.dy && Math.abs(inp.dx) < SPIDER5.sense;
    const called = inp.alarm ? SPIDER5.called : Math.max(0, g.called - dt);
    if (seen && (inp.alarm || bumped || (!g.dozing && called > 0))) return { ...CALM, phase: 'windup', dir: inp.dx >= 0 ? 1 : -1 };
    // (a hum heard off the screen wakes it; it comes once it is in view)
    if (inp.alarm) return { ...g, t, dozing: false, called };
    return { ...g, t, called };
  }
  if (g.phase === 'windup') {
    if (!shown) return CALM;
    // (he got past it while it crouched: it crouches again, facing him, the whole warning over)
    if (g.dir && g.dir * inp.dx < -SPIDER5.past) return CALM;
    return t >= SPIDER5.tell ? { ...CALM, phase: 'go', dir: g.dir } : { ...g, t };
  }
  // (he got past it: the rush is spent, and coming back needs a crouch of its own)
  if (g.dir && g.dir * inp.dx < -SPIDER5.past) return CALM;
  const lost = shown ? 0 : g.lost + dt;
  if (lost >= SPIDER5.lose) return CALM;
  // (a moment in before it can lose interest, so a rush is never cut off the frame it starts)
  if (!inp.hunting && t > 1) return CALM;
  return { ...g, t, lost };
}

// ───────────────────────────── don't admire the silk ─────────────────────────────

/** a shimmering sheet of silk hanging by the way, over [x0, x1] from top to bottom (its ground) */
export interface SilkSheet {
  x0: number;
  x1: number;
  top: number;
  bottom: number;
}

export const SHEET = {
  /** dawdling slower than this (px/s) in front of a sheet is admiring it */
  pace: 150,
} as const;

export const inSheet = (s: SilkSheet, px: number, py: number): boolean => px >= s.x0 && px <= s.x1 && py >= s.top && py <= s.bottom + 4;
/** admiring: on the ground in front of it, slower than a walk */
export const admiring = (s: SilkSheet, px: number, py: number, vx: number, grounded: boolean): boolean =>
  grounded && inSheet(s, px, py) && Math.abs(vx) < SHEET.pace;

// ───────────────────────────── the Seamstress ─────────────────────────────

/**
 * The Queen's seamstress, a pink lace-aproned spider knitting one of the silk sheets (5-4: her first, gentle appearance). She does not
 * walk or bite. She knits; but let him linger in front of her sheet, admiring it, and she looks up (the tell: she lifts her needles,
 * SEAMSTRESS.tell, with a "!" over her) and casts a length of lace onto him: more silk on him at once, never a wrap by itself. Moving on
 * past her sheet during the tell calls it off, and she goes back to her knitting.
 */
export interface Seamstress {
  /** her feet (on the ground at the end of her sheet), facing her work */
  x: number;
  y: number;
  dir: 1 | -1;
  /** the sheet she is knitting (an index into W5Extras.sheets) */
  sheet: number;
}

export const SEAMSTRESS = {
  /** seconds of his lingering at her sheet before she looks up; her tell (World 5's rule: every attack warned at least 0.6 s) */
  watch: 0.5,
  tell: 0.8,
  /** seconds the cast takes (the lace flying), and her rest after it before she will look up again */
  cast: 0.5,
  rest: 2.5,
  /** the silk her lace puts on him, and the most it can leave on him (her lace alone never wraps him: the stillness does) */
  lace: 0.4,
  most: 0.85,
  /** how tall she stands (world units): about the Butler's height */
  h: 96,
} as const;

export type SeamPhase = 'knit' | 'tell' | 'cast' | 'rest';
export interface SeamState {
  phase: SeamPhase;
  t: number;
  /** seconds he has lingered at her sheet (knitting) */
  watched: number;
}
export const newSeam = (): SeamState => ({ phase: 'knit', t: 0, watched: 0 });

/**
 * one frame of the Seamstress: `lingering` he is admiring her sheet (w5Kit admiring); `seen` she is in full view on the screen (she
 * only looks up where he can see her do it). `cast` is true on the frame her lace lands on him.
 */
export function stepSeam(st: SeamState, inp: { lingering: boolean; seen: boolean }, dt: number): { st: SeamState; cast: boolean } {
  const t = st.t + dt;
  if (st.phase === 'knit') {
    const watched = inp.lingering ? st.watched + dt : 0;
    if (watched >= SEAMSTRESS.watch && inp.seen) return { st: { phase: 'tell', t: 0, watched: 0 }, cast: false };
    return { st: { phase: 'knit', t, watched }, cast: false };
  }
  if (st.phase === 'tell') {
    // (he moved on, or she is off the screen: called off, back to her knitting)
    if (!inp.lingering || !inp.seen) return { st: newSeam(), cast: false };
    if (t >= SEAMSTRESS.tell) return { st: { phase: 'cast', t: 0, watched: 0 }, cast: true };
    return { st: { ...st, t }, cast: false };
  }
  if (st.phase === 'cast') return { st: t >= SEAMSTRESS.cast ? { phase: 'rest', t: 0, watched: 0 } : { ...st, t }, cast: false };
  return { st: t >= SEAMSTRESS.rest ? newSeam() : { ...st, t }, cast: false };
}

/** the silk on him after her lace lands */
export const laced = (silk: number): number => Math.max(silk, Math.min(SEAMSTRESS.most, silk + SEAMSTRESS.lace));

// ───────────────────────────── closing orchids ─────────────────────────────

/**
 * a big orchid at (x, y: the top of its open bloom, where he stands), `w` wide. It opens and closes on its own beat: open for `open` s,
 * closing (the warning: it shivers and folds, still standable) for ORCHID.tell, shut, then opening again. Shut, its bloom is no ledge
 * (platformId: it is broken) and the petals in its cup (petalIds) cannot be picked.
 */
export interface Orchid {
  x: number;
  y: number;
  w: number;
  period: number;
  open: number;
  offset: number;
  platformId?: number;
  petalIds?: number[];
  /** the ground its stem grows from (default: 260 px under the bloom) */
  stem?: number;
}

export const ORCHID = {
  /** the closing warning, and the opening (s) */
  tell: 0.8,
  /** the shortest it may stay open: long enough to reach and land, with the warning on top */
  minOpen: 1.4,
} as const;

/**
 * how an orchid keeps time in a stage of World 5 (`mini` 1..9): open for less of its beat the further on (Matt: "closing earlier as the
 * world goes on"). `period` is its whole beat (s).
 */
export function orchidTiming(mini: number, period = 6): { period: number; open: number } {
  const open = Math.max(ORCHID.minOpen, Math.min(period - 2 * ORCHID.tell - 0.6, 4.2 - 0.3 * (mini - 1)));
  return { period, open: Math.round(open * 10) / 10 };
}

export type OrchidPhase = 'open' | 'closing' | 'shut' | 'opening';
/** an orchid now: its phase, how open the bloom looks (1 open, 0 shut), whether it holds him, and whether its petals can be picked */
export function orchidAt(o: Orchid, t: number): { phase: OrchidPhase; open: number; solid: boolean; picks: boolean } {
  const s = (((t + o.offset) % o.period) + o.period) % o.period;
  const tell = ORCHID.tell;
  if (s < o.open) return { phase: 'open', open: 1, solid: true, picks: true };
  if (s < o.open + tell) {
    const u = (s - o.open) / tell;
    return { phase: 'closing', open: 1 - 0.55 * u, solid: true, picks: true };
  }
  if (s < o.period - tell) return { phase: 'shut', open: 0, solid: false, picks: false };
  const u = (s - (o.period - tell)) / tell;
  return { phase: 'opening', open: u, solid: false, picks: false };
}

/** an orchid's beat is fair: open long enough, and shut for less than it is open (so a wait is never long) */
export const orchidFair = (o: Orchid): boolean => o.open >= ORCHID.minOpen && o.period - o.open - 2 * ORCHID.tell <= o.open + ORCHID.tell;

// ───────────────────────────── cocoons ─────────────────────────────

/** a creature wrapped in silk, hanging with its bottom at (x, y) */
export interface Cocoon {
  x: number;
  y: number;
  /**
   * tied across the path: he cannot walk or hop past it until it is punched open (the first cocoon of 5-5, so nobody walks past the
   * stage's whole idea without knowing someone is inside: QA, v198)
   */
  block?: boolean;
}

export const COCOON = {
  /** punches to break it open, and how near his fist must land (px, from its middle) */
  hits: 3,
  reach: 72,
  /** its middle is this far above its bottom */
  mid: 34,
  /** a cocoon tied across the path holds him this far short of it (px, his x to its x): where a standing punch lands on its middle */
  stop: 42,
  /** and holds him at any height up to this far over it (no hopping past: its guy-lines and thread are in the way) */
  stopUp: 320,
} as const;

/**
 * a cocoon tied across the path (Cocoon.block) and still shut: where he may go no further, coming from the left at (x, y). Null when
 * it does not hold him (open, or he is not at it).
 */
export function cocoonStop(c: Cocoon, freed: boolean, x: number, y: number): number | null {
  if (!c.block || freed) return null;
  const at = c.x - COCOON.stop;
  if (x <= at || x > c.x + 30) return null;
  if (y < c.y - COCOON.stopUp || y > c.y + 40) return null;
  return at;
}

export interface CocoonState {
  hits: number;
  freed: boolean;
  /** seconds since the last hit (for the shake) */
  since: number;
}
export const newCocoon = (): CocoonState => ({ hits: 0, freed: false, since: 9 });

export const punchReachesCocoon = (c: Cocoon, fist: { x: number; y: number }): boolean => Math.hypot(fist.x - c.x, fist.y - (c.y - COCOON.mid)) < COCOON.reach;

/** a punch landed on it (once per swing): one hit nearer free */
export function hitCocoon(st: CocoonState): CocoonState {
  if (st.freed) return st;
  const hits = st.hits + 1;
  return { hits, freed: hits >= COCOON.hits, since: 0 };
}

// ───────────────────────────── silk lines ─────────────────────────────

/** a silk line hanging from a branch at topY, to swing on like a liana (the liana system draws it as silk: terrain.ts) */
export function silkLine(id: number, x: number, topY: number, bottomY: number): Vine {
  return { id, x, topY, bottomY, swaySpeed: 1.2, swayPhase: (x * 0.011) % 6.28, vineType: 'swing_liana', isSwingingVine: true, silk: true };
}

// ───────────────────────────── Meeca's carvings ─────────────────────────────

/** words carved in a trunk, the top line's middle at (x, y); the game draws the letters, shaky, as if cut on the move */
export interface Carving {
  x: number;
  y: number;
  lines: string[];
  /** the letters' height (px) */
  size?: number;
  /** a painted trunk is drawn behind the words: its foot (ground) */
  trunk?: { ground: number; w: number; h: number };
}

/** one letter of a carving: where it sits off its even place, its tilt and its size share. The same words always shake the same way. */
export function shakyLetters(text: string, seed = 0): Array<{ ch: string; dx: number; dy: number; rot: number; k: number }> {
  let a = (seed * 2654435761 + text.length * 40503) >>> 0;
  const rnd = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return [...text].map((ch) => ({ ch, dx: (rnd() - 0.5) * 3, dy: (rnd() - 0.5) * 6, rot: (rnd() - 0.5) * 0.24, k: 0.92 + rnd() * 0.16 }));
}

// ───────────────────────────── the table set for two ─────────────────────────────

/** the little table in the middle of the path (5-1): two soft chairs, china cups, the cakes, the pot, and the card */
export interface TeaTable {
  x: number;
  y: number;
  card: string;
}

export const TABLE_CARD = 'Do sit. The pot is warm. It is always warm.';

// ───────────────────────────── a stage's World 5 pieces ─────────────────────────────

/** a painted World 5 piece standing in the scene (behind Pokey, or in `front`): bottom middle at (x, b), `w` wide */
export interface W5Decor {
  n: string;
  x: number;
  b: number;
  w: number;
  flip?: boolean;
  front?: boolean;
}

/** what a World 5 stage adds (ProtoExtras.w5), read by w5Play.ts */
export interface W5Extras {
  /** the light: golden afternoon (5-1 to 5-3), dusk, misty violet twilight (never night: World 8 is the night) */
  mood?: 'gold' | 'dusk' | 'twilight';
  /** 5-1: the stillness is taught gently: a wrap is only a fright, never a heart */
  gentle?: boolean;
  chairs?: Chair[];
  tables?: TeaTable[];
  cakes?: Cake[];
  butlers?: Butler[];
  pots?: Teapot[];
  threads?: Thread[];
  sheets?: SilkSheet[];
  orchids?: Orchid[];
  cocoons?: Cocoon[];
  carvings?: Carving[];
  spiders?: W5Spider[];
  /** the Seamstress, knitting a sheet (5-4) */
  seamstresses?: Seamstress[];
  decor?: W5Decor[];
  /** petals drifting down through the light (a lovely stage) */
  petals?: boolean;
  /** 5-5: the rest branch where the orchids hang in rows, and the pouch scene played on it (w5Play.ts, w5Lines.ts W5_POUCH) */
  rest?: RestBranch;
}

// ───────────────────────────── 5-5: the rest branch ─────────────────────────────

/** a branch to rest on, [x0, x1] at height y: a story beat plays when he comes to it, and standing on it then is no danger */
export interface RestBranch {
  x0: number;
  x1: number;
  y: number;
  /** where its calm stretch ends (the flag after the quiet garden past it): the pouch scene plays only up to here */
  calm?: number;
}

/** is he standing on the rest branch? */
export const onRest = (r: RestBranch, px: number, py: number, grounded: boolean): boolean => grounded && px >= r.x0 && px <= r.x1 && Math.abs(py - r.y) < 3;

// ───────────────────────────── what Dot says the first time ─────────────────────────────

/**
 * Dot's first-time lines for each piece, in the old look's words (said where the piece first comes into view, once per stage: w5Play
 * tip). The new look swaps each for Matt's short line (w5Lines.ts: 8 words or fewer, naming the thumb move).
 */
export const W5_TEACH = {
  still: 'Don\'t stop here, Pokey, don\'t even slow down. The silk creeps up on anyone who stands still. Slide on, keep moving',
  sit: 'Don\'t stand still here, Pokey! The silk creeps up on you. Keep moving, or slide left and right to shake it off',
  wrapped: 'Wrapped up! Never stand still for long here. Slide your thumb to wiggle free',
  wrapGentle: 'Wake up, Pokey! That silk nearly had you. Keep moving',
  chair: 'Soft chairs. They pull you in as you pass. Slide right on by, and never sit down',
  cake: 'Tiny cakes! They look like treats, but they make you sleepy and slow. Flick up and jump over them',
  ate: 'You ate the cake! Now you\'re sleepy and slow. Keep going, it wears off',
  butler: 'A butler, offering cake. Tap to punch the tray away, or jump right over him',
  pot: 'That teapot puffs sleepy steam. When the lid rattles, wait, then slide past between puffs',
  steam: 'You breathed the steam! Sleepy for a bit. Go between puffs',
  thread: 'Those threads hum if you touch them, and the spiders wake and come. Flick up and jump over them',
  hummed: 'It hummed! Here come the spiders',
  sheet: 'Lovely silk. Don\'t stop to look at it. It takes it as a compliment. Slide right on past',
  orchid: 'The big orchids close on a beat. When one shivers, it\'s about to shut. Flick up onto it while it\'s open',
  cocoon: 'Somebody\'s wrapped up in that cocoon! Tap to punch it open and set them free',
  silk: 'A silk line, like a vine. Flick up into it to swing',
  spider: 'A jumping spider! It crouches before it rushes. Tap to punch it, or jump on it',
  seamstress: 'That\'s the Seamstress, knitting her silk. Don\'t stand there watching her. Slide on past before she looks up',
  laced: 'She saw you looking, and now there\'s lace all over you! Slide left and right to shake it off',
} as const;
