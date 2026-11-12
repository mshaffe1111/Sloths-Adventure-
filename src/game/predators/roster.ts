/**
 * predators/roster — who has which habit, and each world's cast (reference/design/PREDATORS.md §2). Data only. The rule it is held
 * to (predatorRoster.test.ts): an animal has one habit everywhere, and no two animals in one world's cast share a habit.
 * Kinds are the game's own ids where it has one (types.ts EnemyType); the rest are named for what they are.
 */
import type { Habit } from './types.ts';

export const HABIT = {
  snake: 'patrol', boa: 'ambush', eagle: 'sweep',
  turtle: 'seek', riverGuard: 'guard', caiman: 'sweep',
  ocelot: 'stalk', jaguar: 'drop', thornVine: 'ambush', grottoEyes: 'sweep',
  capuchinThief: 'stalk', capuchinLookout: 'ambush', capuchinGuard: 'guard', eaglet: 'patrol',
  spider: 'seek', seamstress: 'guard', butler: 'patrol', dangler: 'drop', mantis: 'ambush',
  tayra: 'charge', frog: 'patrol', crab: 'guard', piranha: 'seek',
  sentry: 'guard', beetle: 'patrol',
  harpy: 'seek', bats: 'sweep', mimicBush: 'guard', moths: 'seek',
  gaze: 'sweep', lavaLizard: 'patrol',
  soldier: 'guard',
} as const satisfies Record<string, Habit>;

export type Kind = keyof typeof HABIT;

/** each world's cast. Moths are 8-4's own cast (the Lantern Run), never beside the night harpy */
export const CASTS: Record<number, readonly Kind[]> = {
  1: ['snake', 'eagle', 'boa'],
  2: ['turtle', 'riverGuard', 'caiman', 'snake'],
  3: ['ocelot', 'jaguar', 'thornVine', 'grottoEyes'],
  4: ['eagle', 'capuchinThief', 'capuchinLookout', 'capuchinGuard', 'eaglet'],
  5: ['spider', 'seamstress', 'butler', 'dangler', 'mantis'],
  6: ['caiman', 'tayra', 'frog', 'crab', 'piranha'],
  7: ['sentry', 'boa', 'ocelot', 'beetle'],
  8: ['harpy', 'jaguar', 'bats', 'mimicBush', 'boa'],
  9: ['gaze', 'tayra', 'jaguar', 'harpy', 'lavaLizard'],
  10: ['soldier', 'ocelot'],
};

/** casts that stand apart from their world's (one special stage) */
export const SPECIAL_CASTS: Record<string, readonly Kind[]> = { '8-4': ['moths'] };
