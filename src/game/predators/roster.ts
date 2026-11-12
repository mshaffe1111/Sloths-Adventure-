/**
 * predators/roster — who has which habit, and each world's cast (reference/design/PREDATORS.md §2). Data only. The rule it is held
 * to (predatorRoster.test.ts): an animal has one habit everywhere, and no two animals in one world's cast share a habit.
 * Kinds are the game's own ids where it has one (types.ts EnemyType); the rest are named for what they are.
 */
import type { Habit, PredatorDef, Way } from './types.ts';

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
 * or after this one. 'noise' is the noise lure (`hears`: thrown things, the bell): before World 3 the only noise is his own landing,
 * and that must never pull a hunter's eye off him. World 1: stomp 1-1, punch and drop traps 1-3, kick 1-5, stillness 1-7, the food
 * chain 1-9.
 */
export const TAUGHT: Record<Way | 'noise', number> = {
  stomp: 1, punch: 1, kick: 1, trap: 1, still: 1, lure: 1,
  noise: 3, drum: 3, wind: 4, dew: 5, break: 7, push: 7, light: 8, geyser: 9,
};

/** who else is about in a world that a cast animal may fear (not hunters of Pokey, so not in a cast) */
export const ALLIES: Record<number, readonly string[]> = { 8: ['owl'] };

/**
 * An animal as it plays in one world: the ways that world has not been taught yet are taken off its list, the food chain is off it
 * when nothing it fears lives there, and it does not answer the noise lure before noise is taught. The same object back when
 * nothing changes. A stage lays its cast through this, so a way can never appear before its move (predatorRoster.test.ts).
 */
export function inWorld(def: PredatorDef, world: number): PredatorDef {
  const about: readonly string[] = [...(CASTS[world] ?? []), ...(ALLIES[world] ?? [])];
  const keep = (w: Way): boolean => TAUGHT[w] <= world && (w !== 'lure' || !def.fears || def.fears.some((k) => about.includes(k)));
  const ways = Object.keys(def.beatenBy) as Way[];
  const deaf = def.hears !== undefined && TAUGHT.noise > world;
  if (ways.every(keep) && !deaf) return def;
  const beatenBy: PredatorDef['beatenBy'] = {};
  for (const w of ways) if (keep(w)) Object.assign(beatenBy, { [w]: def.beatenBy[w] });
  return { ...def, beatenBy, hears: deaf ? undefined : def.hears };
}
