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


export function refinedControls(): boolean {
  // the game's controls since 2026-10-24 (Matt tested them): `?refined=0` brings back the old rules for comparing
  if (ctestEnabled()) return true;
  try {
    return !(typeof location !== 'undefined' && /[?&]refined=0\b/.test(location.search));
  } catch {
    return true;
  }
}

/** how close (px, centre to centre) an animal, the boss or a cage must be for a sideways flick to be a kick */
export const KICK_NEAR_PX = 260;

// (the pumped swing's helpers, autoPump and steerPump, went with the self-swinging vines, physics.ts, 2026-10-28)
