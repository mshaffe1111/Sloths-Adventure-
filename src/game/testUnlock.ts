/**
 * The tester's switch: tapping "Shaffer" in the title credit ten times in a row opens every stage and world, so any part of the
 * game can be played without clearing what comes before it. It only changes what is OPEN: nothing is marked cleared, no stars or
 * trophies are given, and it is not part of a save file. Tapping ten times again turns it off.
 */
const KEY = 'sloth_test_unlock';

export const testUnlockOn = (): boolean => {
  try {
    return localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
};

export const setTestUnlock = (on: boolean) => {
  try {
    if (on) localStorage.setItem(KEY, '1');
    else localStorage.removeItem(KEY);
  } catch {
    /* storage blocked: the switch just does nothing */
  }
};

/** taps in a row that flip the switch, and how long a pause breaks the run */
export const UNLOCK_TAPS = 10;
export const UNLOCK_TAP_GAP_MS = 1500;

/** pure tap counter so the rule can be tested: returns the new run length (a long pause restarts it) */
export const nextTapRun = (run: number, gapMs: number): number => (gapMs > UNLOCK_TAP_GAP_MS ? 1 : run + 1);
