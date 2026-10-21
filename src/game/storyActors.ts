/**
 * THE STORY ACTOR API
 *
 * What a cutscene can ask of the people in it. A picture is a StoryScene (story.ts); its `actors` are SceneActors. The script language (storyDsl.ts)
 * writes most of this as a cast string ("P:walk@.2 M:sad@.7"); everything below can also be given straight, or per cast member through a beat's `x`.
 * Everything is a pure function of the time since the picture appeared (seconds), so a picture plays the same every time.
 *
 * ── GROUND ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
 * One ground line per picture, `StoryScene.ground` (share of the height, default 0.8: the top of the mossy branch every world's picture is drawn on).
 * Every grounded actor (milo, daisy, daisy_wave, thornbark, boss) stands on it, whatever `y` it was written with, as long as `y` is within a share of the
 * line (0.22 above to 0.12 below); a `y` further above that is a hover (the actor floats there, its shadow stays on the ground and shrinks as it rises),
 * and a portrait is drawn chin on the line. Every grounded actor gets a soft contact shadow; its width and darkness fall as it leaves the ground (a jump).
 * `lineup` pictures stand the ten guardians on the branch (front row) and on a misty far ledge (back row), each with its shadow.
 *     { ground: 0.74 }                       a scene whose branch sits higher (the text box covers less)
 *
 * ── ACTORS (SceneActor.kind) ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────
 *   milo       Pokey, painted from the standard hero (hero-standard.webp) plus the cutscene poses (hero-story.webp). `mood` picks what he is doing.
 *                { kind: 'milo', x: 0.3, mood: 'talk' }
 *   daisy      Meeca (jennifurSprite.ts, meeca-standard.webp). `mood` picks what she is doing.   { kind: 'daisy', x: 0.68, facing: -1, mood: 'sad' }
 *   daisy_wave Meeca calling out in alarm (default mood 'scaredwave').
 *   boss       a world's guardian (`world: 1..10`), painted when the art is there; `angry`, `beaten`, `silhouette` as before; `seq` frames are the boss's own.
 *   thornbark  the corrupted guardian (`angry`, `beaten` = freed).        bloom  the Heartbloom (`stage`: bud | bloom | epic | ultimate).
 *   dot        the hummingbird courier, hovering (`scale` is its size).
 *
 * ── MOODS ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
 * A mood is a timed loop of painted poses (a one-shot mood plays once and holds its last frame), with a breath, a sway or a bob on top. Pokey (SceneActor.mood):
 *   idle talk walk run sneak urgent sad tired exhausted determined happy cheer surprised worried scared think sleep hurt ko
 *   look point crossed thumbs weep jump fall land punch duck away walkaway farewell
 *   (the old `pose` presets 'idle' | 'punch' | 'duck' | 'happy' are these moods)
 * Meeca:
 *   idle talk happy laugh sing think surprised sad sob scared scaredwave cheer walk run sadwalk jump fall land climb hurt ko crouch pickup wave sleepy
 * walk, run, sneak, walkaway and sadwalk are gaits: they need a `move` to take them anywhere (see below); without one the actor marches on the spot.
 * The tables are POKEY_MOODS (heroStory.ts) and MEECA_MOODS (jennifurSprite.ts): one line per mood, the frames and the seconds each is held.
 *
 * ── FRAMES (a `seq` key's `frame`) ────────────────────────────────────────────────────────────────────────────────────────────────────────────
 * A seq is a timeline of PoseKey beats (storyShots.ts): { at, frame | mood, dx, dy, rot, sc, flip, dur, ease, fps }. `frame` names one painted pose; `mood`
 * plays a mood from that beat; a `frame` that is a list loops (a walk or run list is a gait: with `dx` and `dur` it travels, planted feet, and rests at the end).
 *   Pokey, the game's poses:   idle blink walk_0..7 run_0..7 launch rise_fast rise apex fall_a fall_b land recover climb_0..7 hang_a hang_b hang_c swing_grip swing_back
 *                              swing_pull swing_top tuck tumble duck punch_0..4 kick_0..3 mega_0..3 hurt_a hurt_b hurt_c ko cheer_a cheer_b air_punch_0..2 air_kick_0..2
 *                              stomp_start stomp_plunge stomp_impact stomp_rebound bounce_squash bounce_rise bounce_top spring_squash spring_launch spring_rise
 *   Pokey, the old names:      idle_a idle_blink jump_up fall hurt guard punch_rec punch_2..punch_5 punch kick mega dead crouch climb_a..d run_a..run_j
 *   Pokey, cutscene poses:     look_a talk_a talk_b look_up look_down think sneak_a sneak_b shock point_a shout_up point_b impatient sad_a wipe tired slump resolve crossed
 *                              thumbs stance alarm cheer_c worried scared sleep away away_a away_b away_c farewell
 *   Pokey, faces (portrait):   face_calm face_calm_closed face_happy face_wink face_cheer face_surprised face_hurt face_angry face_laugh face_dizzy face_worried
 *                              face_tired face_neutral face_oh face_ah face_smile face_gasp face_scowl face_smirk face_shout face_cry face_rage face_stars face_sleep
 *   Meeca:                     idle idle_b blink breathe sing glad sleepy tilt look_a look_up back walk_0..7 run_0..6 crouch jump_up jump_tuck jump_fall land_b land_c
 *                              climb_0..5 leap pickup hurt_a hurt_b knock_a knock_b getup lie kneel_a kneel_b prone_a scared shiver look_l lament alarm panic_up sad sob
 *                              wipe slump cower dwalk_a dwalk_b wave
 *     { kind: 'milo', x: 0.2, seq: [{ at: 0, frame: 'guard' }, { at: 0.4, frame: 'punch_2', dx: 0.05, dur: 0.14 }, { at: 1.5, mood: 'happy' }] }
 *
 * ── MOVE ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
 * SceneActor.move: ActorMove | ActorMove[]   { at?, dx, dur, ease?, gait?, then? }
 *   at     seconds into the picture the walk starts (default: when the one before it ends, or 0)
 *   dx     how far, as a share of the scene width (negative = leftwards); the actor turns to face the way it goes and stays facing that way
 *   dur    seconds it takes;  ease  'linear' (default) | 'inOut' | 'in' | 'out'
 *   gait   'auto' (default: the actor's mood when that is a gait, else walk or run by how fast it goes) | 'walk' | 'run' | 'sneak' | 'sadwalk' | 'walkaway'
 *   then   the mood the actor settles into when it arrives (default: its own mood, or 'idle' when that is a gait)
 * The frames are chosen by the ground, not by the clock: the planted foot is held where the ground puts it (distance / stride), a footfall puffs a little dust on a
 * run, the body bobs, and the step lengthens or shortens (never faster than the legs can go) so the feet never skate. Before it starts and after it arrives the actor
 * rests in its mood; a mood that is a gait ('walk', 'run'...) is the gait of the move, and the actor idles around it.
 *     { kind: 'milo', x: 0.15, mood: 'walk', move: { dx: 0.35, dur: 4 } }
 *     { kind: 'daisy', x: 0.7, mood: 'sad', move: [{ at: 1, dx: -0.2, dur: 3, gait: 'sadwalk', then: 'sob' }] }
 *
 * ── CAMERA FOLLOW ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
 * StoryScene.follow: { actor, strength? }   `actor` is the index in `actors`; the actor that travels stays where it is on the screen and the world goes by under
 * it: the sky, the hills and the trees scroll at their own speeds (parallax), the branch and the foreground go by at the speed it walks, and the other actors
 * stay where they were in the world (so they slide out of frame behind it). `strength` 0..1 (default 1) is how much of its travel the camera takes. The zoom,
 * focus, `camera` and shake of the scene still apply on top.
 *     p: { follow: { actor: 0 } }
 *
 * Pure parts (no canvas), so they can be tested: groundOf, footing, shadowFor, moodAt, gaitAt, moveAt, actorDx, followScroll, anchorMix.
 */
import { easeFn, poseAt, type Ease, type PoseKey } from './storyShots.ts';

// ───────────── ground ─────────────

export const GROUND = 0.8;
/** how far above and below the ground line a grounded actor's `y` still means "standing on it" (shares of the scene height) */
export const SNAP_ABOVE = 0.22;
export const SNAP_BELOW = 0.12;
/** the kinds that stand on the ground */
export const GROUNDED = new Set(['milo', 'daisy', 'daisy_wave', 'thornbark', 'boss']);

/** the ground line of a picture, as a share of its height */
export function groundOf(scene: { ground?: number }): number {
  return scene.ground ?? GROUND;
}

export interface Footing {
  /** where the actor's feet are drawn (share of the height) */
  y: number;
  /** how far they are above the ground line (share of the height, 0 = standing) */
  hover: number;
}

/** where an actor's feet go: on the ground line when it is meant to stand, hovering when it is meant to be in the air */
export function footing(a: { kind: string; y?: number; portrait?: boolean }, ground: number): Footing {
  if (a.portrait || !GROUNDED.has(a.kind)) return { y: a.y ?? ground, hover: 0 };
  const y = a.y ?? ground;
  if (y >= ground - SNAP_ABOVE && y <= ground + SNAP_BELOW) return { y: ground, hover: 0 };
  if (y < ground - SNAP_ABOVE) return { y, hover: ground - y };
  return { y, hover: 0 };
}

export interface ShadowSpec {
  rx: number;
  ry: number;
  alpha: number;
}

/** the contact shadow under something `bodyW` wide and `bodyH` tall (px) that is `lift` px above the ground: it narrows and fades as it rises */
export function shadowFor(bodyW: number, bodyH: number, lift: number): ShadowSpec {
  const u = Math.max(0, Math.min(1, lift / Math.max(1, bodyH)));
  const rx = (bodyW / 2) * (1 - 0.5 * u);
  return { rx, ry: rx * 0.24, alpha: 0.55 * (1 - 0.7 * u) };
}

// ───────────── moods ─────────────

/** one beat of a mood: show `frame` for `seconds`; `lift0` to `lift1` is how high above the ground the body is (in standing heights) at the start and the end of it */
export type MoodStep = [frame: string, seconds: number, lift0?: number, lift1?: number];

export interface MoodSpec {
  steps: MoodStep[];
  /** play once and hold the last frame (a jump, a faint) instead of looping */
  once?: boolean;
  /** breathing: the body stretches this much (0.01 = 1%) at `breathHz` (default 0.32) */
  breath?: number;
  breathHz?: number;
  /** a sway about the feet, in radians, at `swayHz` (default 0.7): a shiver is a small fast one */
  sway?: number;
  swayHz?: number;
  /** a bounce: this many standing heights up, `bobHz` (default 2.2) times a second */
  bob?: number;
  bobHz?: number;
}

export interface MoodNow {
  frame: string;
  /** standing heights above the ground */
  lift: number;
  /** vertical stretch about the feet */
  sy: number;
  /** lean in radians about the feet */
  rot: number;
}

export function moodTotal(spec: MoodSpec): number {
  return spec.steps.reduce((a, s) => a + s[1], 0);
}

/** the frame, lift, breath and sway of a mood `t` seconds after it began */
export function moodAt(spec: MoodSpec, t: number): MoodNow {
  const total = moodTotal(spec);
  const tt = Math.max(0, t);
  let at = spec.once ? Math.min(tt, total - 1e-6) : ((tt % total) + total) % total;
  let step = spec.steps[spec.steps.length - 1];
  let u = 1;
  for (const s of spec.steps) {
    if (at < s[1]) { step = s; u = s[1] > 0 ? at / s[1] : 1; break; }
    at -= s[1];
  }
  const l0 = step[2] ?? 0;
  const l1 = step[3] ?? l0;
  let lift = l0 + (l1 - l0) * u;
  if (spec.bob) lift += spec.bob * Math.abs(Math.sin(Math.PI * tt * (spec.bobHz ?? 2.2)));
  return {
    frame: step[0],
    lift,
    sy: 1 + (spec.breath ?? 0) * Math.sin(Math.PI * 2 * tt * (spec.breathHz ?? 0.32)),
    rot: (spec.sway ?? 0) * Math.sin(Math.PI * 2 * tt * (spec.swayHz ?? 0.7)),
  };
}

// ───────────── gait ─────────────

export interface GaitFrame {
  name: string;
  /** the planted foot: pixels of the frame ahead of (+) or behind (-) the middle of the head. Frames without it cycle in the order they are listed. */
  fx?: number;
}

export interface GaitSpec {
  frames: GaitFrame[];
  /** pixels of the frame the body travels in one full cycle, for frames that have no `fx` (with `fx` it is the sweep of the planted foot) */
  stride?: number;
  /** steps (cycles) per second the legs can manage: the stride is lengthened above the maximum and shortened below the minimum */
  minCadence: number;
  maxCadence: number;
  /** how high the body rises in the middle of a step, in standing heights */
  bob: number;
  /** puff dust at each footfall */
  dust?: boolean;
  /**
   * how much of the gap between the planted foot of the frame shown and where the ground puts it is closed by sliding the figure along (default 0.6). The sheets hold
   * 7-8 poses to a step, so the foot is up to a few pixels off the ground's place; sliding the figure by most of that keeps the foot on the ground and moves the body a
   * little instead (a body bobbing along is much less noticeable than a skating foot). 1 pins the foot exactly, 0 lets the foot skate.
   */
  pin?: number;
}

export interface GaitNow {
  frame: string;
  /** standing heights the body is raised by the bob */
  bob: number;
  /** footfalls so far */
  step: number;
  /** how far through the current step, 0..1 */
  phase: number;
  /** pixels of the frame to slide the figure forward (negative: back) so the planted foot stays where the ground has it */
  shift: number;
  /** pixels of the frame the body travels per step, and how many seconds a step takes (what the dust puff's timing is worked out from) */
  stride: number;
  seconds: number;
}

/** the planted-foot sweep of a gait: its frames from the foot furthest ahead to the foot furthest behind */
export function gaitOrder(g: GaitSpec): GaitFrame[] {
  const withFx = g.frames.filter((f) => f.fx !== undefined);
  return withFx.length === g.frames.length ? [...g.frames].sort((a, b) => (b.fx as number) - (a.fx as number)) : g.frames;
}

export function gaitStride(g: GaitSpec): number {
  const o = gaitOrder(g);
  const sweep = o.length && o[0].fx !== undefined ? (o[0].fx as number) - (o[o.length - 1].fx as number) : 0;
  return g.stride ?? Math.max(24, sweep);
}

/** the cadence a gait settles into when it is not going anywhere (the geometric middle of what the legs can do) */
export function gaitNaturalSpeed(g: GaitSpec): number {
  return gaitStride(g) * Math.sqrt(g.minCadence * g.maxCadence);
}

/**
 * The frame of a gait after the body has travelled `dist` pixels (of the frame), on a walk that averages `speed` pixels a second. The planted foot is the one that
 * stays still on the ground, so the frame whose planted foot is where the ground puts it is the one to show: as the body moves on, the foot sweeps from the front
 * to the back (frame to frame), then the other foot lands in front. The stride is the sweep, lengthened or shortened by the cadence limits.
 */
export function gaitAt(g: GaitSpec, dist: number, speed: number): GaitNow {
  const order = gaitOrder(g);
  const base = gaitStride(g);
  const v = speed > 0 ? speed : gaitNaturalSpeed(g);
  const c = v / base;
  let stride = base;
  if (c > g.maxCadence) stride = v / g.maxCadence;
  else if (c < g.minCadence) stride = v / g.minCadence;
  const steps = Math.max(0, dist) / stride;
  const step = Math.floor(steps);
  const phase = steps - step;
  let frame = order[0].name;
  let shift = 0;
  if (order[0].fx !== undefined) {
    const top = order[0].fx as number;
    const want = top - phase * ((top - (order[order.length - 1].fx as number)) || 1);
    let best = Infinity;
    for (const f of order) {
      const d = Math.abs((f.fx as number) - want);
      if (d < best) { best = d; frame = f.name; shift = want - (f.fx as number); }
    }
    shift *= g.pin ?? 0.6;
  } else {
    frame = order[Math.min(order.length - 1, Math.floor(phase * order.length))].name;
  }
  return { frame, bob: g.bob * Math.sin(Math.PI * phase), step, phase, shift, stride, seconds: stride / v };
}

// ───────────── moving ─────────────

export interface ActorMove {
  at?: number;
  dx: number;
  dur: number;
  ease?: Ease;
  gait?: string;
  then?: string;
}

export function asMoves(m: ActorMove | ActorMove[] | undefined): ActorMove[] {
  return m === undefined ? [] : Array.isArray(m) ? m : [m];
}

export interface MoveNow {
  /** how far the actor has gone so far, as a share of the scene width */
  dx: number;
  /** a move is under way */
  moving: boolean;
  /** which move (-1 before the first one starts) */
  index: number;
  /** the gait asked for ('auto' unless the move says) */
  gait: string;
  /** the mood to rest in after it (undefined = the actor's own) */
  then: string | undefined;
  /** px the actor has gone in the current (or last) move, and its average speed in px/s */
  dist: number;
  speed: number;
  /** seconds since the current move began, and since the last one ended (Infinity before any has) */
  since: number;
  sinceEnd: number;
  /** the way the actor was last going (undefined before it has gone anywhere) */
  dir: 1 | -1 | undefined;
}

/** where an actor is `t` seconds in, on its moves (in time order), for a scene `w` px wide */
export function moveAt(moves: ActorMove[], t: number, w: number): MoveNow {
  let dx = 0;
  let end = 0;
  const out: MoveNow = { dx: 0, moving: false, index: -1, gait: 'auto', then: undefined, dist: 0, speed: 0, since: 0, sinceEnd: Infinity, dir: undefined };
  for (let i = 0; i < moves.length; i++) {
    const m = moves[i];
    const start = m.at ?? end;
    if (t < start) break;
    const stop = start + m.dur;
    const u = m.dur <= 0 ? 1 : Math.max(0, Math.min(1, (t - start) / m.dur));
    const part = m.dx * easeFn(u, m.ease ?? 'linear');
    out.index = i;
    out.gait = m.gait ?? 'auto';
    out.then = m.then;
    out.dir = m.dx < 0 ? -1 : m.dx > 0 ? 1 : out.dir;
    out.dist = Math.abs(part) * w;
    out.speed = m.dur > 0 ? (Math.abs(m.dx) * w) / m.dur : 0;
    out.since = t - start;
    out.moving = t < stop;
    out.sinceEnd = t < stop ? Infinity : t - stop;
    dx += part;
    end = stop;
    if (t < stop) break;
  }
  out.dx = dx;
  return out;
}

/** how far an actor is from where it was placed (a share of the width), from its moves and its pose timeline */
export function actorDx(a: { move?: ActorMove | ActorMove[]; seq?: PoseKey[] }, t: number, w: number): number {
  const m = asMoves(a.move);
  return (m.length ? moveAt(m, t, w).dx : 0) + (a.seq && a.seq.length ? poseAt(a.seq, t).dx : 0);
}

/** the camera's scroll in px for a scene that follows an actor: all of its travel (or `strength` of it) */
export function followScroll(follow: CameraFollow | undefined, actors: Array<{ move?: ActorMove | ActorMove[]; seq?: PoseKey[] }>, t: number, w: number): number {
  if (!follow) return 0;
  const a = actors[follow.actor];
  if (!a) return 0;
  return actorDx(a, t, w) * w * (follow.strength ?? 1);
}

export interface CameraFollow {
  /** the index in the scene's `actors` of the actor to follow */
  actor: number;
  /** how much of its travel the camera takes, 0..1 (default 1: the actor stays put on the screen and the world goes by) */
  strength?: number;
}

const smooth = (u: number) => easeFn(u, 'inOut');
/** how the actor hangs from the picture: 0 = by the head (walking: the body travels smoothly, the feet swing under it), 1 = by the feet (a pose). It blends across a start and a stop so the switch does not jump. */
export function anchorMix(mv: MoveNow | null): number {
  if (!mv || mv.index < 0) return 1;
  if (mv.moving) return 1 - smooth(mv.since / 0.15);
  return smooth(mv.sinceEnd / 0.25);
}

/** the gait a name asks for, given how fast the actor goes (frame px a second) and the gaits the character has: 'auto' is a walk until the legs would have to go faster than a walk can */
export function pickGait(name: string, speed: number, gaits: Record<string, GaitSpec>, fallbackMood?: string): string {
  if (name !== 'auto' && gaits[name]) return name;
  if (fallbackMood && gaits[fallbackMood]) return fallbackMood;
  const walk = gaits.walk;
  if (!walk || !gaits.run) return gaits.walk ? 'walk' : Object.keys(gaits)[0];
  return speed > gaitStride(walk) * walk.maxCadence ? 'run' : 'walk';
}

/** the kind of gait a list of frame names is (a legacy seq's frame list), or undefined when it is just a loop of poses */
export function listGait(frames: string[]): string | undefined {
  if (frames.length < 4) return undefined;
  if (frames.every((f) => /^run_[a-z0-9]$/.test(f))) return 'run';
  if (frames.every((f) => /^walk_[a-z0-9]$/.test(f))) return 'walk';
  return undefined;
}

// ───────────── the actors: what to show ─────────────

/** what a painted character gives the story engine (Pokey: heroStory.ts, Meeca: jennifurSprite.ts) */
export interface StoryCharacter {
  /** the painted art is loaded and on */
  ready(): boolean;
  moods: Record<string, MoodSpec>;
  gaits: Record<string, GaitSpec>;
  /** the frame a name stands for (a painted frame of this character, an old name, a standard name), or undefined when there is none */
  resolve(name: string): string | undefined;
  /** draws a frame with its feet (anchor 1) or its head (anchor 0, or any mix) at the origin, facing right, `k` world units to the pixel; `flipped`: the caller has
   *  mirrored the canvas, so a character with print on it (Meeca's bib number) turns the print back */
  draw(ctx: CanvasRenderingContext2D, frame: string, anchor: number, flipped?: boolean): boolean;
  /** world units per atlas pixel (a frame is drawn this big at scale 1) and how tall the standing frame is in world units */
  k: number;
  units: number;
  /** the mood of a character nobody gave one */
  rest: string;
}

export interface ActorShow {
  frame: string;
  /** standing heights above the ground (a jump, a bounce) */
  lift: number;
  /** vertical stretch about the feet (breath) */
  sy: number;
  /** lean in radians about the feet, before the facing is applied */
  rot: number;
  /** 0 = hang the frame by its head, 1 = by its feet */
  anchor: number;
  /** the actor is walking or running: its gait state */
  gait?: GaitNow & { name: string };
  /** which way it faces */
  facing: 1 | -1;
  /** how far it has gone from where it was placed (a share of the width) */
  dx: number;
  /** the mood it is in, when it is in one */
  mood?: string;
}

export interface ActorInput {
  mood?: string;
  /** the old pose presets of Pokey */
  pose?: string;
  move?: ActorMove | ActorMove[];
  seq?: PoseKey[];
  facing?: 1 | -1;
  scale?: number;
}

/**
 * Decides what a character shows `t` seconds into a picture. The order of say: a pose timeline (`seq`) beat that names a frame or a mood is shown as asked; else a
 * move in progress is the gait; else the mood it settled into after a move; else its own mood (a mood that is a gait is not one to stand in: the actor idles).
 */
export function showActor(ch: Pick<StoryCharacter, 'moods' | 'gaits' | 'resolve' | 'k' | 'rest'>, a: ActorInput, t: number, w: number, defaultMood?: string): ActorShow {
  const moves = asMoves(a.move);
  const mv = moves.length ? moveAt(moves, t, w) : null;
  const pose = a.seq && a.seq.length ? poseAt(a.seq, t) : null;
  const scale = (a.scale ?? 1) * (pose?.sc ?? 1);
  const unit = ch.k * 3 * scale; // scene px per atlas px
  const own = a.mood ?? a.pose ?? defaultMood ?? ch.rest;
  const base = a.facing === -1 ? -1 : 1;
  let facing: 1 | -1 = mv && mv.dir ? mv.dir : base;
  if (pose?.flip) facing = facing === 1 ? -1 : 1;
  const out: ActorShow = { frame: '', lift: 0, sy: 1, rot: 0, anchor: anchorMix(mv), facing, dx: (mv?.dx ?? 0) + (pose?.dx ?? 0) };

  const rest = (name: string, since: number) => {
    const spec = ch.moods[ch.gaits[name] ? ch.rest : name] ?? ch.moods[ch.rest];
    const m = moodAt(spec, since);
    out.frame = m.frame; out.lift = m.lift; out.sy = m.sy; out.rot = m.rot;
    out.mood = ch.moods[ch.gaits[name] ? ch.rest : name] ? (ch.gaits[name] ? ch.rest : name) : ch.rest;
  };
  const walk = (kind: string, dist: number, speed: number) => {
    const spec = ch.gaits[kind] ?? ch.gaits.walk;
    const g = gaitAt(spec, dist / unit, speed / unit);
    out.frame = g.frame;
    out.lift = g.bob;
    out.gait = { ...g, name: kind };
  };

  const explicit = pose && (pose.mood || pose.frame || pose.travel);
  if (explicit && pose) {
    if (pose.travel) {
      if (pose.travel.arrived) rest(own, Math.max(0, pose.since - pose.travel.dur));
      else {
        const speed = (pose.travel.total * w) / pose.travel.dur;
        const kind = listGait(pose.travel.frames);
        walk(kind && ch.gaits[kind] ? (kind === 'run' ? pickGait('auto', speed / unit, ch.gaits) : kind) : 'walk', pose.travel.done * w, speed);
      }
    } else if (pose.mood) {
      if (ch.gaits[pose.mood]) walk(pose.mood, pose.since * gaitNaturalSpeed(ch.gaits[pose.mood]) * unit, 0);
      else rest(pose.mood, pose.since);
    } else {
      out.frame = ch.resolve(pose.frame) ?? ch.moods[ch.rest].steps[0][0];
    }
  } else if (mv && mv.moving) {
    const kind = pickGait(mv.gait, mv.speed / unit, ch.gaits, ch.gaits[own] ? own : undefined);
    walk(kind, mv.dist, mv.speed);
  } else if (mv && mv.index >= 0) {
    rest(mv.then ?? own, mv.sinceEnd);
  } else if (ch.gaits[own] && !mv) {
    // a walk or a run with nowhere to go: it marches on the spot at the pace of its legs
    out.anchor = 0;
    walk(own, t * gaitNaturalSpeed(ch.gaits[own]) * unit, 0);
  } else {
    rest(own, t);
  }
  return out;
}
