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

/** a mode was picked and kept on this device (difficulty() reads Normal without one, for old saves and the tests) */
export const modeChosen = () => read() !== null;

/**
 * LV-19: a fresh game (no stage cleared) with no mode kept asks Little explorer (Easy) or Big explorer (Normal) before the story and 1-1,
 * with nothing picked for them. An old save that never stored a mode keeps playing Normal, unasked.
 */
export const mustPickMode = (hasProgress: boolean, chosen = modeChosen()) => !hasProgress && !chosen;

export function setDifficulty(d: Difficulty) {
  cached = d;
  try {
    localStorage.setItem(DIFFICULTY_KEY, d);
  } catch {
    /* storage blocked: the choice lasts for this visit */
  }
  listeners.forEach((l) => l());
}

/** the player changes the mode in the menu, mid-game (LV-7: from Easy to Normal it eases in; back to Easy the easing ends) */
export function switchDifficulty(d: Difficulty) {
  const was = difficulty();
  setDifficulty(d);
  try {
    if (was === 'easy' && d === 'normal') localStorage.setItem(EASE_KEY, '[]');
    else if (d === 'easy') localStorage.removeItem(EASE_KEY);
  } catch {
    /* storage blocked */
  }
}

/**
 * Easing into Normal (LV-7, polish report 2026-10-29): Easy keeps 1-1's help (the longer ledge grace, the stronger second jump, the wider
 * landing: physics.ts ASSIST) all game, and Normal's is gone by stage 25, so a switch in World 3 took it all away at once. After a switch
 * from Easy to Normal the help fades out over the next EASE_STAGES different stages played (all of it on the first, none after the last);
 * kept with the save (saveFile.ts), as the stage ids played since the switch.
 */
export const EASE_KEY = 'sloth_ease_in';
export const EASE_STAGES = 5;

function easeRead(): string[] | null {
  try {
    const v = typeof localStorage === 'undefined' ? null : localStorage.getItem(EASE_KEY);
    const a = v === null ? null : JSON.parse(v);
    return Array.isArray(a) ? a.filter((x): x is string => typeof x === 'string') : null;
  } catch {
    return null;
  }
}

/** the share of Easy's help still in force on stage `id` played on Normal: 1 on the first stage after the switch, 0 from the sixth on */
export function easeInShare(id: string): number {
  if (difficulty() !== 'normal') return 0;
  const seen = easeRead();
  if (!seen) return 0;
  const k = seen.includes(id) ? seen.indexOf(id) : seen.length;
  return Math.max(0, 1 - k / EASE_STAGES);
}

/** a stage is starting on Normal: count it toward the easing (a retry of a stage already counted counts nothing more) */
function easeCount(id: string) {
  const seen = easeRead();
  if (!seen || seen.includes(id) || seen.length >= EASE_STAGES) return;
  try {
    localStorage.setItem(EASE_KEY, JSON.stringify([...seen, id]));
  } catch {
    /* storage blocked */
  }
}

/** the stage card's line while Normal eases in (LV-7: said once, on the first stage after the switch), or null */
export function easeInLine(id: string): string | null {
  const seen = easeRead();
  return difficulty() === 'normal' && seen && seen[0] === id ? "Normal now: Easy's help fades over 5 stages" : null;
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
export function startRun(id?: string): Difficulty {
  run = difficulty();
  if (id && run === 'normal') easeCount(id);
  return run;
}
/** the mode of the stage being played (or last played); the chosen mode before any stage (LV-1: shown on its cards, kept with its bests) */
export const runDifficulty = (): Difficulty => run ?? difficulty();

export const DIFFICULTY_LABEL: Record<Difficulty, { name: string; blurb: string }> = {
  easy: { name: 'Easy', blurb: 'For the story and for learning to play. Shorter jumps, fewer enemies, more hearts.' },
  normal: { name: 'Normal', blurb: 'The adventure as it was meant to be played.' },
};
