/**
 * predators/world5 — the animals the game first meets in this world, as kit data (reference/design/PREDATORS.md §2, §3): the Seamstress's garden: the jumping spider.
 * FIRST-DRAFT numbers, taken from what each does today (enemyBrain.ts PERSONALITY, predatorAI.ts, w5Kit.ts SPIDER5); the world tunes
 * its own when its first cast stage is laid. Held fair by predatorCasts.test.ts; registry.ts hands each to the stages that may name it.
 */
import { NOISE } from '../noise.ts';
import type { PredatorDef } from './types.ts';

const EASY = { tell: 1.3, cool: 1.5, speed: 0.85 } as const;

/** Jumping Spider: feels the silk (a still sloth is not hidden), comes in bursts with pauses, open in the pause */
export const SPIDER: PredatorDef = {
  kind: 'spider', habit: 'seek', sight: { ahead: 430, behind: 430, tall: 80, seesStill: true }, hears: NOISE.dur, speed: { rest: 0, hunt: 150 },
  gait: { go: 0.45, pause: 0.32 },
  engage: 90, tell: 0.7, act: { aim: 'ahead', seconds: 0.3, speed: 150, reach: 60, tall: 22 }, recover: 0.5, cool: 1.2, giveUp: 3, easy: EASY,
  beatenBy: { stomp: { ends: 'flees', seconds: 5 }, punch: { ends: 'stunned', seconds: 2, when: 'open' }, dew: { ends: 'dozes' } },
  first: 'stomp',
};

export const WORLD5: readonly PredatorDef[] = [SPIDER];
