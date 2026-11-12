/**
 * predators/roster — who has which habit, and each world's cast (reference/design/PREDATORS.md §2). Data only: no functions
 * (generality.test.ts holds it to that; the rule that reads it, inWorld, is engine code in ways.ts, under the generality gate). The rule it is held
 * to (predatorRoster.test.ts): an animal has one habit everywhere, and no two animals in one world's cast share a habit.
 * Kinds are the game's own ids where it has one (types.ts EnemyType); the rest are named for what they are.
 */
import type { Habit, Way } from './types.ts';

export const HABIT = {
  snake: 'patrol', boa: 'ambush', eagle: 'sweep',
  turtle: 'seek', riverGuard: 'guard', caiman: 'sweep',
  ocelot: 'stalk', jaguar: 'drop', thornVine: 'ambush', grottoEyes: 'sweep',
  capuchinThief: 'stalk', capuchinLookout: 'ambush', capuchinGuard: 'guard', eaglet: 'patrol',
  spider: 'seek', seamstress: 'guard', butler: 'patrol', dangler: 'drop', mantis: 'ambush',
  tayra: 'charge', frog: 'patrol', crab: 'guard', piranha: 'seek',
  sentry: 'guard', beetle: 'patrol',
  harpy: 'seek', bats: 'sweep', blinkingLog: 'guard', moths: 'seek',
  gaze: 'sweep', lavaLizard: 'patrol',
  soldier: 'guard',
} as const satisfies Record<string, Habit>;

export type Kind = keyof typeof HABIT;

/**
 * each world's cast (Matt approved a cast per world, 11-11 9:42 PM ET). Moths are 8-4's own cast (the Lantern Run), never beside the
 * night harpy. W8's mimic is a log that blinks, never a bush: bushes are the safe place in every world (the story keeper)
 */
export const CASTS: Record<number, readonly Kind[]> = {
  1: ['snake', 'eagle', 'boa'],
  2: ['turtle', 'riverGuard', 'caiman', 'snake'],
  3: ['ocelot', 'jaguar', 'thornVine', 'grottoEyes'],
  4: ['eagle', 'capuchinThief', 'capuchinLookout', 'capuchinGuard', 'eaglet'],
  5: ['spider', 'seamstress', 'butler', 'dangler', 'mantis'],
  6: ['caiman', 'tayra', 'frog', 'crab', 'piranha'],
  7: ['sentry', 'boa', 'ocelot', 'beetle'],
  8: ['harpy', 'jaguar', 'bats', 'blinkingLog', 'boa'],
  9: ['gaze', 'tayra', 'jaguar', 'harpy', 'lavaLizard'],
  10: ['soldier', 'ocelot'],
};

/** casts that stand apart from their world's (one special stage) */
export const SPECIAL_CASTS: Record<string, readonly Kind[]> = { '8-4': ['moths'] };

/**
 * The move ladder (the lead, 11-11 9:56 PM ET): the world that teaches each way. A way to beat a creature is only there in a world at
 * or after this one. Two noises lure (`hears`): the 'bell', a fixed thing he rings, is World 2's (the lead, 10:06 PM ET: built, and the
 * right first taste); 'noise', the thrown pebble or nut, is World 3's, where noise becomes a world rule. In World 1 the only noise is
 * his own landing, and that never pulls a hunter's eye off him (core.ts `hear`). World 1: stomp 1-1, punch and drop traps 1-3, kick 1-5, stillness 1-7, the food
 * chain 1-9.
 */
export const TAUGHT: Record<Way | 'noise' | 'bell' | 'landing', number> = {
  stomp: 1, punch: 1, kick: 1, trap: 1, still: 1, lure: 1,
  // (`landing`: his own hard landing waking a sleeper, "quiet feet": World 2's lesson (the sleeping caiman). Before that world no
  // landing makes a noise event at all, so nothing in World 1 wakes to a mechanic nobody has taught: the lead, 11-12)
  landing: 2,
  bell: 2, noise: 3, drum: 3, wind: 4, dew: 5, break: 7, push: 7, light: 8, geyser: 9,
};

/** who else is about in a world that a cast animal may fear (not hunters of Pokey, so not in a cast) */
export const ALLIES: Record<number, readonly string[]> = { 8: ['owl'] };
