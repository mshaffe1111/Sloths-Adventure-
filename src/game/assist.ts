/**
 * Optional help, chosen in the menu (or offered after a few Game Overs on the same stage) and kept on the device.
 * It never changes the stars a stage can give; it only gives more room to learn it.
 *   extraLives: hearts of padding before Game Over. 0 (none), 2 or 4 more than the usual three.
 *   speed:      how fast the whole stage runs. 1 is normal; 0.9 and 0.8 slow everything (animals, hazards, Pokey) together.
 * Both apply from the next stage entry or retry.
 */
export type ExtraLives = 0 | 2 | 4;
export type GameSpeed = 1 | 0.9 | 0.8;

export const BASE_LIVES = 3;
export const EXTRA_LIVES_CHOICES: ExtraLives[] = [0, 2, 4];
export const SPEED_CHOICES: GameSpeed[] = [1, 0.9, 0.8];

/** how many Game Overs on one stage before the card offers extra lives */
export const OFFER_AFTER_FAILS = 3;

const KEY_LIVES = 'sloth_assist_lives';
const KEY_SPEED = 'sloth_assist_speed';

let lives: ExtraLives | null = null;
let speed: GameSpeed | null = null;
const listeners = new Set<() => void>();

export const isExtraLives = (v: unknown): v is ExtraLives => v === 0 || v === 2 || v === 4;
export const isGameSpeed = (v: unknown): v is GameSpeed => v === 1 || v === 0.9 || v === 0.8;

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null; // storage blocked: the defaults
  }
}

export function extraLives(): ExtraLives {
  if (lives === null) {
    const n = Number(read(KEY_LIVES));
    lives = isExtraLives(n) ? n : 0;
  }
  return lives;
}

export function gameSpeed(): GameSpeed {
  if (speed === null) {
    const n = Number(read(KEY_SPEED));
    speed = isGameSpeed(n) ? n : 1;
  }
  return speed;
}

function save(key: string, v: number) {
  try {
    localStorage.setItem(key, String(v));
  } catch {
    /* storage blocked: the choice lasts for this visit only */
  }
  listeners.forEach((l) => l());
}

export function setExtraLives(v: ExtraLives) {
  lives = v;
  save(KEY_LIVES, v);
}

export function setGameSpeed(v: GameSpeed) {
  speed = v;
  save(KEY_SPEED, v);
}

export function subscribeAssist(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

/** lives a stage starts with, and what a Continue refills to */
export function startingLives(): number {
  return BASE_LIVES + extraLives();
}

/** the card offers extra lives once a stage has ended the run this many times and the help is not on yet */
export function shouldOfferHelp(fails: number): boolean {
  return fails >= OFFER_AFTER_FAILS && extraLives() === 0;
}
