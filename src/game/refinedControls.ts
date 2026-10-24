/**
 * Refined controls (2026-10-23): four rule changes that came out of the recorded control test (3 testers, every touch replayed through
 * the touch rules and the physics). All of them are about a player who uses ONE finger, which is how every tester played:
 *
 *  1. In the air, letting go of the screen no longer brakes Pokey. A one-finger player slides up to jump and lifts: the old rules read
 *     "no direction held" as "stop", so long jumps fell short (a full-speed jump lifted after 0.2 s carried 86 px instead of 170) and a
 *     vine leap with the finger off the glass reached the next vine 0 times in 112. Now he keeps the speed he jumped with; steering the
 *     other way still brakes him, and so does holding down.
 *  2. Letting go of a vine sends him the way he is facing (toward the next vine), not whichever way the swing happens to be moving.
 *     Jen was thrown backward 26 times, Steph 11.
 *  3. A vine swings by itself: with no direction held it pumps until the swing is a good size, so a slow, low grab still swings far
 *     enough to reach the next vine. Holding a direction steers as before.
 *  4. A sideways flick only kicks when something is close enough to kick (touchGestures.ts, `refined`); anywhere else it starts a run.
 *
 * On for the control test (#ctest), and from the menu switch or ?refined=1 for one visit; off otherwise while testers play.
 */
import { ctestEnabled } from './playRecorder.ts';

const KEY = 'sloth_refined_controls';

export function refinedControls(): boolean {
  if (ctestEnabled()) return true;
  try {
    if (typeof location !== 'undefined' && /[?&]refined=1\b/.test(location.search)) return true;
    return typeof localStorage !== 'undefined' && localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

export function setRefinedControlsPref(on: boolean) {
  try {
    if (on) localStorage.setItem(KEY, '1');
    else localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

/** how close (px, centre to centre) an animal, the boss or a cage must be for a sideways flick to be a kick */
export const KICK_NEAR_PX = 260;

/** the swing a vine builds on its own (radians either side of hanging straight down) */
export const AUTO_SWING = 0.8;

/** the biggest swing holding a direction can build (radians, about 55 degrees): past this, holding pushes no more */
export const STEER_SWING = 0.95;

/** the size of a swing (radians either side) from its energy: where it would come to rest if nothing pushed */
export function swingAmp(angle: number, omega: number, len: number, g: number): number {
  const c = 1 - Math.cos(angle) + (omega * omega * len) / (2 * g);
  return Math.acos(Math.max(-1, Math.min(1, 1 - c)));
}

/**
 * pure: holding a direction on a vine pumps WITH the swing, the way a child pumps a playground swing. The old rule pushed with a
 * constant force for as long as a direction was held; on a long vine gravity could never pull him back, so holding right pinned him
 * almost at the top (Matt, 2026-10-23). Now the push only comes while he is already moving the held way, and stops once the swing
 * is `STEER_SWING` big; stopped at the far end with the direction still held, gravity brings him back down.
 */
export function steerPump(angle: number, omega: number, len: number, g: number, steer: -1 | 1): -1 | 0 | 1 {
  if (swingAmp(angle, omega, len, g) >= STEER_SWING) return 0;
  // from a dead hang, holding a direction starts the swing that way
  if (Math.abs(omega) < 0.05 && Math.abs(angle) < 0.05) return steer;
  return omega * steer > 0 ? steer : 0;
}

/**
 * pure: which way to push a vine this frame when nothing is held. It pushes along the swing's motion (the way a child pumps a swing),
 * starting in the facing direction from a dead hang, and stops pushing once the swing has reached `AUTO_SWING`.
 */
export function autoPump(angle: number, omega: number, len: number, g: number, facing: -1 | 1): -1 | 0 | 1 {
  if (swingAmp(angle, omega, len, g) >= AUTO_SWING) return 0;
  if (Math.abs(omega) < 0.05) return facing;
  return omega > 0 ? 1 : -1;
}
