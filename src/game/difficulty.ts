/**
 * How hard the game is: picked when a new game starts, changeable any time in the menu, and kept with the saved game.
 *   easy:   for the story and for learning to play. Shorter gaps (a single jump, now and then a double), fewer enemies with longer
 *           warnings, more hearts and flags, a wide sweet spot on the swinging vines, extra forgiveness on landings.
 *   normal: the game as designed.
 * The story is the same either way. A change applies from the next stage (a stage keeps its layout until it is cleared).
 */
export type Difficulty = 'easy' | 'normal';

export const DIFFICULTY_KEY = 'sloth_difficulty';

let cached: Difficulty | null = null;
const listeners = new Set<() => void>();

function read(): string | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage.getItem(DIFFICULTY_KEY);
  } catch {
    return null;
  }
}

/** the current difficulty (normal when nothing was chosen, which is also what the tests and old saves get) */
export function difficulty(): Difficulty {
  if (cached === null) cached = read() === 'easy' ? 'easy' : 'normal';
  return cached;
}

export const isEasy = () => difficulty() === 'easy';

export function setDifficulty(d: Difficulty) {
  cached = d;
  try {
    localStorage.setItem(DIFFICULTY_KEY, d);
  } catch {
    /* storage blocked: the choice lasts for this visit */
  }
  listeners.forEach((l) => l());
}

/** forget the cached value (after a save file is loaded or a new game wipes the old one) */
export function reloadDifficulty() {
  cached = null;
  listeners.forEach((l) => l());
}

export function subscribeDifficulty(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

/** the mode the stage being played started on: a change in the menu applies from the next stage, so the run keeps this one */
let run: Difficulty | null = null;
/** a stage is starting: it is played on the mode chosen now */
export function startRun(): Difficulty {
  run = difficulty();
  return run;
}
/** the mode of the stage being played (or last played); the chosen mode before any stage (LV-1: shown on its cards, kept with its bests) */
export const runDifficulty = (): Difficulty => run ?? difficulty();

export const DIFFICULTY_LABEL: Record<Difficulty, { name: string; blurb: string }> = {
  easy: { name: 'Easy', blurb: 'For the story and for learning to play. Shorter jumps, fewer enemies, more hearts.' },
  normal: { name: 'Normal', blurb: 'The adventure as it was meant to be played.' },
};
