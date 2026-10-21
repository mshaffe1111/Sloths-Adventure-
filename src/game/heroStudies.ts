/**
 * The action studies: painted poses cut from the six study sheets Matt supplied (reference/animation-sheets/slomatt), used where the main
 * hero atlas has only one frame or none: the vine swing (which used to fall back to the code-drawn hero), the double-jump flip, a knock-back,
 * the mega punch, the kick, hanging from a rope and the top of a jump.
 *
 * It is always on (Matt tried the poses and kept them); `?studies=0` turns it off for a session.
 * While the atlas loads, or for any pose with no study, nothing here applies and the main atlas draws as before.
 */
import type { PlayerState } from './types.ts';
import { STUDY_FRAMES, type StudyFrame } from './heroStudiesData.ts';
import { flipPose } from './heroSprite.ts';
import type { HeroEvents } from './heroEvents.ts';
import { HURT_TIME } from './heroEvents.ts';
import { trackAtlas } from './atlasLoader.ts';

export const DEFAULT_STUDIES = true;

/** always on (there is no menu switch any more); `?studies=0` turns it off for one session, for comparing */
let enabled: boolean | null = null;
export function studiesEnabled(): boolean {
  if (enabled !== null) return enabled;
  let v = DEFAULT_STUDIES;
  try {
    const q = new URLSearchParams(location.search).get('studies');
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
  trackAtlas(img, new URL('../assets/hero/hero-studies.webp', import.meta.url).href, () => { ready = true; }, () => { atlas = null; });
}
/** the atlas image once it has loaded (and starts the load the first time it is asked for while the studies are on) */
export function studyAtlas(): HTMLImageElement | null {
  if (!studiesEnabled()) return null;
  load();
  return ready ? atlas : null;
}

/**
 * how a study frame sits: feet on the ground; hung from the hands at its top (a rope, tilting about the hands); swinging on a vine (the rope ends
 * at the feet in the physics, so it turns about the feet, as the code-drawn hero does); or centred on the middle of the body (the painted flip
 * and knock-back are already turned in the picture, so the code does not turn them again)
 */
export type StudyMode = 'feet' | 'hang' | 'swing' | 'centre';
export interface StudyChoice {
  name: string;
  mode: StudyMode;
  /** hang and swing: tilt in radians */
  tilt?: number;
}

export function studyFrame(name: string): StudyFrame | undefined {
  return STUDY_FRAMES[name];
}

/** which of an attack's four poses to show, from how far the limb is pulled back (cock) and thrust out (reach) */
export function attackStage(cock: number, reach: number): 0 | 1 | 2 | 3 {
  if (reach <= 0.05) return 0; // wind-up
  if (cock > 0.2) return 1; // launch
  if (reach >= 0.85) return 2; // impact
  return 3; // follow-through
}
const KICK = ['s3_13', 's3_14', 's3_15', 's3_16'];
const MEGA = ['s4_01', 's4_02', 's4_03', 's4_04'];
/** the vine swing: where in the swing he is picks the pose */
export function swingFrame(angle: number, omega: number, facing: 1 | -1): string {
  const a = Math.abs(angle);
  const forward = omega * facing > 0;
  if (Math.abs(omega) < 0.35 && a < 0.25) return 's1_05'; // just gripping the vine
  if (!forward) return 's1_06'; // leaning back as he swings away
  return a < 0.55 ? 's1_07' : 's1_08'; // pulling forward, then reaching at the top
}
/** the flip, by how far through it he is (0..1) */
export function flipStudy(u: number): string {
  return u < 0.25 ? 's3_05' : u < 0.6 ? 's3_06' : u < 0.85 ? 's3_07' : 's3_08';
}
/** shimmying along a rope: the grip shifts hand over hand */
export function hangStudy(moving: boolean, time: number): string {
  if (!moving) return 's4_06';
  const i = Math.floor(time * 5) % 4;
  return ['s4_06', 's4_07', 's4_08', 's4_07'][i];
}

/** the study pose for this moment, or null when the main atlas should draw (nothing here for the pose, or a frame is missing) */
export function studyPick(p: PlayerState, time: number, ev: Pick<HeroEvents, 'isHurt' | 'hurtUntil'>): StudyChoice | null {
  const has = (n: string) => !!STUDY_FRAMES[n];
  const out = (name: string, mode: StudyMode, tilt?: number): StudyChoice | null => (has(name) ? { name, mode, tilt } : null);

  if (p.isVineSwinging) {
    // the rope ends at his feet, so the body turns about them against the swing angle (gentler than the code-drawn hero's 0.85, because the painted frames already lean)
    return out(swingFrame(p.swingAngle ?? 0, p.swingAngularVelocity ?? 0, p.facing), 'swing', -(p.swingAngle ?? 0) * 0.55);
  }
  if (p.hanging) return out(hangStudy(Math.abs(p.vx) > 10, time), 'hang', Math.sin(time * (Math.abs(p.vx) > 10 ? 7 : 2.2)) * (Math.abs(p.vx) > 10 ? 0.1 : 0.045));
  if (p.climbing) return null;
  if (ev.isHurt(time)) {
    const into = (time - (ev.hurtUntil - HURT_TIME)) / HURT_TIME;
    return out(into > 0.6 && !p.grounded ? 's3_10' : 's3_09', 'centre');
  }
  if (p.ducking) return null;
  if (p.kicking || (p.punching && p.attackType === 'mega')) {
    const st = attackStage(p.swingCock ?? 0, p.swingReach ?? 0);
    return out((p.kicking ? KICK : MEGA)[st], 'feet');
  }
  if (p.punching) return null;
  if (!p.grounded) {
    if (p.isDoubleJumping) return out(flipStudy(flipPose(p.somersaultAngle).u), 'centre');
    if (p.vy < -120) return out('s5_14', 'feet');
    if (p.vy <= 110) return out('s5_15', 'feet'); // the top of the jump, arms up
    return null;
  }
  return null;
}
