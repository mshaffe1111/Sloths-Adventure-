/**
 * predators/world7 — the animals the game first meets in this world, as kit data (reference/design/PREDATORS.md §2, §3): the ruins: the stone sentry.
 * FIRST-DRAFT numbers, taken from what each does today (enemyBrain.ts PERSONALITY, predatorAI.ts, w5Kit.ts SPIDER5); the world tunes
 * its own when its first cast stage is laid. Held fair by predatorCasts.test.ts; registry.ts hands each to the stages that may name it.
 */
import { NOISE } from '../noise.ts';
import type { PredatorDef } from './types.ts';

const EASY = { tell: 1.3, cool: 1.5, speed: 0.85 } as const;

/** Stone sentry: a doorway that hits back. Cannot be hit; a noise turns its head */
export const SENTRY: PredatorDef = {
  kind: 'sentry', habit: 'guard', blocks: true, sight: { ahead: 160, behind: 160, tall: 90 }, hears: NOISE.dur, speed: { rest: 0, hunt: 0 },
  engage: 80, tell: 0.7, act: { aim: 'ahead', seconds: 0.25, speed: 0, reach: 80, tall: 60 }, recover: 1.2, cool: 2, giveUp: 3, easy: EASY,
  beatenBy: { break: { ends: 'chasedOff' }, push: { ends: 'stunned', seconds: 6 } },
  first: 'break',
};

export const WORLD7: readonly PredatorDef[] = [SENTRY];
