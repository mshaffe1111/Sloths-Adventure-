/**
 * predators/world3 — the animals the game first meets in this world, as kit data (reference/design/PREDATORS.md §2, §3): the quiet dark: the ocelot and the jaguar.
 * FIRST-DRAFT numbers, taken from what each does today (enemyBrain.ts PERSONALITY, predatorAI.ts, w5Kit.ts SPIDER5); the world tunes
 * its own when its first cast stage is laid. Held fair by predatorCasts.test.ts; registry.ts hands each to the stages that may name it.
 */
import { NOISE } from '../noise.ts';
import type { PredatorDef } from './types.ts';

const EASY = { tell: 1.3, cool: 1.5, speed: 0.85 } as const;

/** Ocelot (the prowler): creeps while his back is turned, crawls when faced, loses a still sloth, comes to noise */
export const OCELOT: PredatorDef = {
  kind: 'ocelot', habit: 'stalk', sight: { ahead: 240, behind: 150, tall: 80 }, hears: NOISE.dur, speed: { rest: 55, hunt: 95 }, watched: 0.3,
  // today's windup is 0.38 s (predatorAI.ts): the kit's floor is 0.5
  engage: 150, tell: 0.5, callsOff: true, act: { aim: 'ahead', seconds: 0.36, speed: 400, reach: 44, tall: 28 }, recover: 0.4, cool: 1.6, giveUp: 3,
  easy: EASY,
  beatenBy: {
    still: { ends: 'flees', seconds: 5 }, trap: { ends: 'chasedOff' }, drum: { ends: 'stunned', seconds: 3 },
    punch: { ends: 'stunned', seconds: 1.5 }, light: { ends: 'flees', seconds: 6 },
  },
  first: 'still',
};

/** Jaguar: waits above and comes down where he was when it growled, then climbs all the way back */
export const JAGUAR: PredatorDef = {
  kind: 'jaguar', habit: 'drop', sight: { ahead: 60, behind: 60, tall: 340 }, speed: { rest: 70, hunt: 0 },
  engage: 60, tell: 0.65, act: { aim: 'below', seconds: 2, speed: 700, reach: 60, tall: 38 }, recover: 0.95, cool: 2.2, giveUp: 4, easy: EASY,
  beatenBy: {
    trap: { ends: 'chasedOff' }, drum: { ends: 'stunned', seconds: 3 }, punch: { ends: 'stunned', seconds: 2, when: 'open' },
    light: { ends: 'flees', seconds: 6 }, geyser: { ends: 'chasedOff' },
  },
  first: 'trap',
};

export const WORLD3: readonly PredatorDef[] = [OCELOT, JAGUAR];
