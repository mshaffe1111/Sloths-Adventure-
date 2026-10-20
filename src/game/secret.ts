/**
 * The secret: a hidden Thorn Gate in stage 7-7 leads to Thornbark's Hollow, a boss fight outside the ten worlds.
 * Beating him earns the Thorn Heart: one extra heart, for good.
 */
import type { LevelConfig } from './types.ts';

/** the stage that hides the gate */
export const SECRET_GATE_LEVEL = '7-7';

export const THORNBARK_LEVEL: LevelConfig = {
  worldIndex: 7,
  miniIndex: 11,
  id: 'S-1',
  name: "Thornbark's Hollow",
  objectiveType: 'boss_lair',
  targetCount: 1,
  timeLimit: 0,
  levelWidth: 2600,
  levelHeight: 900,
  description: 'The Jungle Guardian was twisted by the thorns. Only a true sloth hero can free him.',
  unlocked: true,
  completed: false,
  stars: 0,
  highScore: 0,
  bestTime: 0,
  secret: 'thornbark',
};

const KEY_FOUND = 'sloth_secret_gate';
const KEY_HEART = 'sloth_thorn_heart';

function read(key: string): boolean {
  try {
    return localStorage.getItem(key) === '1';
  } catch {
    return false;
  }
}
function write(key: string) {
  try {
    localStorage.setItem(key, '1');
  } catch {
    /* ignore */
  }
}

/** has the player found the gate? */
export const gateFound = () => read(KEY_FOUND);
export const markGateFound = () => write(KEY_FOUND);
/** has the player beaten Thornbark? */
export const hasThornHeart = () => read(KEY_HEART);
export const markThornHeart = () => write(KEY_HEART);

/** hearts Pokey starts every stage with */
export const maxHearts = () => 5 + (hasThornHeart() ? 1 : 0);
