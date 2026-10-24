/**
 * The standard hero: Pokey drawn entirely from the standard-set sheets (reference/animation-sheets/slomatt/standard-set), packed by
 * scripts/cutStandard.py. One consistent look (the satchel and wrist wraps, no backpack) for every state: idle, walk, run, jump, fall, land,
 * flip, climb, hang, vine swing, punch, kick, mega, hurt, duck, and the portraits.
 *
 * This is Pokey now: it draws every pose it has a frame for. While the atlas loads, or for a pose with no frame here, the older hero (heroSprite.ts)
 * draws as before. `?std=0` turns it off for a debugging session (it is not remembered).
 */
import type { PlayerState } from './types.ts';
import { STD_ATLAS_SIZE, STD_FRAMES, type StdFrame } from './heroStandardData.ts';
import { HURT_TIME, type HeroEvents } from './heroEvents.ts';
import { attackStage } from './heroStudies.ts';
import { airLean, flipPose } from './heroSprite.ts';
import { trackAtlas } from './atlasLoader.ts';

export const DEFAULT_STANDARD = true;
export const STD_ATLAS_URL = new URL('../assets/hero/hero-standard.webp', import.meta.url).href;
export { STD_ATLAS_SIZE };

let enabled: boolean | null = null;
export function standardEnabled(): boolean {
  if (enabled !== null) return enabled;
  let v = DEFAULT_STANDARD;
  try {
    const q = new URLSearchParams(location.search).get('std');
    if (q === '0' || q === 'off') v = false;
  } catch {
    /* no window: stay on */
  }
  enabled = v;
  return v;
}

let atlas: HTMLImageElement | null = null;
let ready = false;
function load() {
  if (atlas || typeof Image === 'undefined') return;
  const img = new Image();
  atlas = img;
  trackAtlas(img, STD_ATLAS_URL, () => { ready = true; }, () => { atlas = null; });
}
/** the atlas image once it has loaded (and starts the load the first time it is asked for while the standard hero is on) */
export function standardAtlas(): HTMLImageElement | null {
  if (!standardEnabled()) return null;
  load();
  return ready ? atlas : null;
}
export function warmStandardAtlas() {
  if (standardEnabled()) load();
}

export function stdFrame(name: string): StdFrame | undefined {
  return STD_FRAMES[name];
}

/** what stdPick chooses: the frame, and how to turn it */
export interface StdChoice {
  name: string;
  /** a small rise and fall, in world units */
  bob: number;
  /** line the raised hand up with the rope or ladder instead of the feet */
  byHand?: boolean;
  /** line the middle of the body up with his position instead of the feet: the walk and run, whose feet reach far ahead and behind,
   * so planting them made the whole body jump back and forth by up to 30 px from one frame to the next */
  byBody?: boolean;
  /** hang from the top of the picture, swaying */
  hang?: boolean;
  /** lean or flip angle in radians, about the middle of the body (positive tips him forward) */
  rot?: number;
  /** draw the frame centred on the middle of the body, so frames of different shapes turn about the same point (the flip) */
  centred?: boolean;
  /** vine swing: the angle the whole body turns about its feet */
  swing?: number;
  /** vine swing: how far the body trails behind the swing, turning about the hands (radians, world sense: positive swings the feet left) */
  trail?: number;
  /** how much of the code's squash and stretch to add (default 1): the painted squash frames already carry it */
  squash?: number;
}

/** the walk and the run, in the order the stride unfolds (index = frame of the loop) */
export const WALK_CYCLE = ['walk_0', 'walk_1', 'walk_2', 'walk_3', 'walk_4', 'walk_5', 'walk_6', 'walk_7'];
export const RUN_CYCLE = ['run_0', 'run_1', 'run_2', 'run_3', 'run_4', 'run_5', 'run_6', 'run_7'];
/** below this speed (px/s) he walks; above it he runs */
export const WALK_MAX = 90;
/** strides per turn of walkCycle: the frames of a cycle must not outrun the 30 fps loop at full speed */
const STRIDE_RATE = 0.6;
/** the climb follows height gained: one frame per this many pixels */
export const CLIMB_FRAME_PX = 12;
export const CLIMB_CYCLE = ['climb_0', 'climb_1', 'climb_2', 'climb_3', 'climb_4', 'climb_5', 'climb_6', 'climb_7'];
export const KICK_STAGES = ['kick_0', 'kick_1', 'kick_2', 'kick_3'];
/** wind-up, launch, impact (the two-handed push), follow-through */
export const MEGA_STAGES = ['mega_0', 'mega_1', 'mega_3', 'mega_2'];
export const PUNCH_STAGES = ['punch_0', 'punch_1', 'punch_2', 'punch_3', 'punch_4'];
/** the same four stages of an attack, drawn in the air: wind-up, launch, impact, follow-through (the two middle ones share the hit pose) */
export const AIR_PUNCH_STAGES = ['air_punch_0', 'air_punch_1', 'air_punch_1', 'air_punch_2'];
export const AIR_KICK_STAGES = ['air_kick_0', 'air_kick_1', 'air_kick_1', 'air_kick_2'];

/** falling with down held: curled over at first, then feet first as he picks up speed */
export function stdDiveFrame(vy: number): string {
  return vy < 300 ? 'stomp_start' : 'stomp_plunge';
}
/**
 * the pose just after a bounce, by how long ago it was (t, seconds) and how fast he is going up (negative). null once the bounce is spent, so the
 * ordinary jump frames take over for the fall.
 * stomp: landing on an animal's head. big: the same from a dive (the harder rebound). spring: a mushroom.
 */
export function stdBounceFrame(kind: 'stomp' | 'big' | 'spring', t: number, vy: number): string | null {
  if (kind === 'spring') {
    if (t < 0.05) return 'spring_squash';
    if (vy < -300) return 'spring_launch';
    return vy < -120 ? 'spring_rise' : null;
  }
  if (t < (kind === 'big' ? 0.1 : 0.08)) return kind === 'big' ? 'stomp_impact' : 'bounce_squash';
  if (vy < -120) return kind === 'big' ? 'stomp_rebound' : 'bounce_rise';
  return vy <= 140 ? 'bounce_top' : null;
}

/** the vine swing: where in the swing he is picks the pose */
export function stdSwingFrame(angle: number, omega: number, facing: 1 | -1): string {
  const a = Math.abs(angle);
  const forward = omega * facing > 0;
  if (Math.abs(omega) < 0.35 && a < 0.25) return 'swing_grip'; // just gripping the vine
  if (!forward) return 'swing_back'; // leaning back as he swings away
  return a < 0.55 ? 'swing_pull' : 'swing_top'; // pulling forward, then reaching at the top
}
/** shimmying along a rope: the grip shifts hand over hand */
export function stdHangFrame(moving: boolean, time: number): string {
  if (!moving) return 'hang_a';
  return ['hang_a', 'hang_b', 'hang_c', 'hang_b'][Math.floor(time * 5) % 4];
}
/** the punch's frame, from how far the arm is out (0 = wind-up .. 1 = full reach) */
export function stdPunchFrame(reach: number): string {
  return reach <= 0 ? PUNCH_STAGES[0] : reach < 0.3 ? PUNCH_STAGES[1] : reach < 0.55 ? PUNCH_STAGES[2] : reach < 0.8 ? PUNCH_STAGES[3] : PUNCH_STAGES[4];
}
/** the jump, by how fast he is going up (negative) or down: launch, rise, top of the jump, fall, plunge */
export function stdAirFrame(vy: number): string {
  if (vy < -580) return 'launch';
  if (vy < -420) return 'rise_fast';
  if (vy < -120) return 'rise';
  if (vy <= 140) return 'apex';
  return vy < 560 ? 'fall_a' : 'fall_b';
}
/** the flip, by how far through it he is (0..1): stretched at launch, curled in the middle, opening as he comes round */
export function stdFlipFrame(u: number): string {
  return u < 0.2 ? 'rise_fast' : u < 0.78 ? 'tuck' : 'fall_a';
}

function cycle(list: string[], p: PlayerState): string {
  const u = ((((p.walkCycle * STRIDE_RATE) / (Math.PI * 2)) % 1) + 1) % 1;
  return list[Math.min(list.length - 1, Math.floor(u * list.length))];
}

/**
 * the pose for this moment from the standard set, or null when a frame is missing (the main hero then draws). Every state has a frame, so with the
 * whole atlas present this never returns null.
 */
export function stdPick(p: PlayerState, time: number, ev: Pick<HeroEvents, 'isHurt' | 'isLanding' | 'hurtUntil'> & Partial<Pick<HeroEvents, 'isHardLanding'>>): StdChoice | null {
  const has = (n: string) => !!STD_FRAMES[n];
  const out = (c: StdChoice): StdChoice | null => (has(c.name) ? c : null);

  if (p.isVineSwinging) {
    // hanging by both hands from the vine (Matt, 2026-10-24: the leaping poses let go of it): the whole body turns with the vine,
    // so the hands stay on it, and trails a little behind the swing
    const a = p.swingAngle ?? 0;
    const trail = Math.max(-0.2, Math.min(0.2, (p.swingAngularVelocity ?? 0) * 0.09));
    return out({ name: 'swing_grip', bob: 0, swing: -a, byHand: true, trail });
  }
  if (p.hanging) return out({ name: stdHangFrame(Math.abs(p.vx) > 10, time), bob: 0, hang: true });
  if (p.climbing) {
    const n = CLIMB_CYCLE.length;
    const i = (((Math.floor(-p.y / CLIMB_FRAME_PX) % n) + n) % n);
    return out({ name: CLIMB_CYCLE[i], bob: 0, byHand: true });
  }
  if (ev.isHurt(time)) {
    const into = (time - (ev.hurtUntil - HURT_TIME)) / HURT_TIME;
    return out({ name: !p.grounded ? 'hurt_c' : into < 0.5 ? 'hurt_a' : 'hurt_b', bob: 0 });
  }
  if (p.ducking) return out({ name: 'duck', bob: 0 });
  if (p.kicking) {
    const st = attackStage(p.swingCock ?? 0, p.swingReach ?? 0);
    return out({ name: (p.grounded ? KICK_STAGES : AIR_KICK_STAGES)[st], bob: 0 });
  }
  if (p.punching && p.attackType === 'mega') return out({ name: MEGA_STAGES[attackStage(p.swingCock ?? 0, p.swingReach ?? 0)], bob: 0 });
  if (p.punching) {
    if (!p.grounded) return out({ name: AIR_PUNCH_STAGES[attackStage(p.swingCock ?? 0, p.swingReach ?? 0)], bob: 0 });
    return out({ name: stdPunchFrame(p.swingReach ?? 1), bob: 0 });
  }
  if (!p.grounded) {
    if (p.diving) return out({ name: stdDiveFrame(p.vy), bob: 0, squash: 0.3 });
    if (p.bounce) {
      const b = stdBounceFrame(p.bounce.kind, p.bounce.t, p.vy);
      if (b) return out({ name: b, bob: 0, squash: 0.3 });
    }
    if (p.isDoubleJumping) {
      const f = flipPose(p.somersaultAngle);
      return out({ name: stdFlipFrame(f.u), bob: 0, rot: f.angle, centred: true });
    }
    // the painted frames already lean into the jump, so the code's lean is only a hint
    return out({ name: stdAirFrame(p.vy), bob: 0, rot: airLean(p.vy) * 0.5 });
  }
  if (ev.isHardLanding?.(time) && has('tumble')) return out({ name: 'tumble', bob: 0 }); // a drop at the hardest speed rolls out of the landing
  if (ev.isLanding(time)) return out({ name: 'land', bob: 0 });
  const speed = Math.abs(p.vx);
  if (speed > 10) {
    const run = speed >= WALK_MAX;
    const u = ((((p.walkCycle * STRIDE_RATE) / (Math.PI * 2)) % 1) + 1) % 1;
    return out({ name: cycle(run ? RUN_CYCLE : WALK_CYCLE, p), bob: -Math.abs(Math.sin(u * Math.PI * 2)) * (run ? 1.6 : 0.8), byBody: true });
  }
  // standing: a slow breath, and a blink every few seconds
  const blink = time % 3.6 > 3.45;
  return out({ name: blink ? 'blink' : 'idle', bob: Math.sin(time * 3.2) * 0.5 });
}

/** the names the old atlas used (and the story scenes still ask for) -> the standard frame that stands in for them */
const ALIAS: Record<string, string> = {
  idle_a: 'idle', idle_blink: 'blink', jump_up: 'launch', fall: 'fall_a', hurt: 'hurt_a', land: 'land', duck: 'duck', crouch: 'duck',
  guard: 'punch_0', punch_rec: 'punch_1', punch_2: 'punch_2', punch_3: 'punch_3', punch_4: 'punch_4', punch_5: 'punch_4', punch: 'punch_3',
  kick: 'kick_2', mega: 'mega_3', dead: 'ko',
  climb_a: 'climb_0', climb_b: 'climb_2', climb_c: 'climb_4', climb_d: 'climb_6',
  ...Object.fromEntries('abcdefghij'.split('').map((c, i) => [`run_${c}`, `run_${Math.min(7, Math.floor((i * 8) / 10))}`])),
};
/** the standard frame for an old-atlas name or a standard name, or undefined when the standard set has nothing for it */
export function stdAlias(name: string): string | undefined {
  if (STD_FRAMES[name]) return name;
  const a = ALIAS[name];
  return a && STD_FRAMES[a] ? a : undefined;
}

/** for the story scenes and the menus: the frame to draw in place of an old-atlas name, when the standard hero is on and its atlas has loaded */
export function stdStill(name: string): { f: StdFrame; img: HTMLImageElement } | null {
  const img = standardAtlas();
  const a = stdAlias(name);
  if (!img || !a) return null;
  return { f: STD_FRAMES[a], img };
}
/** for the menus (which paint the atlas as a CSS background): the frame, when the standard hero is switched on. No need to wait for the load. */
export function stdUi(name: string): StdFrame | null {
  if (!standardEnabled()) return null;
  const a = stdAlias(name);
  return a ? STD_FRAMES[a] : null;
}
