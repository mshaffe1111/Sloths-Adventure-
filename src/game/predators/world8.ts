/**
 * predators/world8 — the animals the game first meets in this world, as kit data (reference/design/PREDATORS.md §2, §3): the night canopy: the night harpy.
 * FIRST-DRAFT numbers, taken from what each does today (enemyBrain.ts PERSONALITY, predatorAI.ts, w5Kit.ts SPIDER5); the world tunes
 * its own when its first cast stage is laid. Held fair by predatorCasts.test.ts; registry.ts hands each to the stages that may name it.
 */
import type { PredatorDef } from './types.ts';

const EASY = { tell: 1.3, cool: 1.5, speed: 0.85 } as const;

/** Night Harpy: hunts by ear (poor eyes, goes to every noise), hates light, fears the owl */
export const HARPY: PredatorDef = {
  kind: 'harpy', habit: 'seek', sight: { ahead: 120, behind: 60, tall: 80 }, hears: 4, speed: { rest: 48, hunt: 85 },
  engage: 110, tell: 0.6, callsOff: true, act: { aim: 'ahead', seconds: 0.42, speed: 270, reach: 50, tall: 36 }, recover: 1, cool: 1.9, giveUp: 4,
  easy: EASY,
  beatenBy: {
    light: { ends: 'flees', seconds: 6 }, lure: { ends: 'chasedOff' }, still: { ends: 'flees', seconds: 5 },
    drum: { ends: 'stunned', seconds: 3 }, punch: { ends: 'stunned', seconds: 2, when: 'open' },
  },
  first: 'light',
  fears: ['owl'],
};

export const WORLD8: readonly PredatorDef[] = [HARPY];
