/**
 * The puzzle kits' sounds: which kind of action each engine event is (PUZZLE_KIND). The sounds themselves are the recorded set's
 * (sfxRec.ts recForPuzzle: pz_<kind>, a wooden gate, the wind chime); the synthesized recipes that were here (the splash, the respawn, the
 * landing, the boss arrival and these twelve) are replaced by recordings (polish-sfx, 2026-10-29).
 */

/** the puzzle actions, in the order of the `puzzle` effect's argument (see PUZZLE_KIND for which engine event plays which) */
export const PUZZLE_SOUNDS = ['pick', 'drop', 'wrap', 'reset', 'press', 'lift', 'gate', 'lever', 'throw', 'chime', 'shift', 'solved'] as const;
export type PuzzleSound = (typeof PUZZLE_SOUNDS)[number];

/** the puzzle kits' event names (engine.ts sfx hooks) -> their sound */
export const PUZZLE_KIND: Record<string, PuzzleSound> = {
  pick: 'pick', trade: 'pick', munch: 'pick', sip: 'pick', cake: 'pick',
  drop: 'drop', land: 'drop', tray: 'drop', rock: 'drop',
  wrap: 'wrap', knot: 'wrap', unroll: 'wrap',
  reset: 'reset', lost: 'reset',
  press: 'press', noise: 'press', wiggle: 'press',
  lift: 'lift', bend: 'lift', frond: 'lift',
  gate: 'gate', bloom: 'gate',
  lever: 'lever', snap: 'lever', crack: 'lever',
  throw: 'throw', pop: 'throw',
  ring: 'chime', chime: 'chime', hum: 'chime',
  tilt: 'shift', sink: 'shift', stick: 'shift', tip: 'shift', pour: 'shift',
  free: 'solved', solved: 'solved',
};
