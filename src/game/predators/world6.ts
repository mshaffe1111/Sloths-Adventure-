/**
 * predators/world6 — the animals the game first meets in this world, as kit data (reference/design/PREDATORS.md §2, §3): the mangrove: the tayra and the poison frog (the caiman is the river's, world2.ts).
 * FIRST-DRAFT numbers, taken from what each does today (enemyBrain.ts PERSONALITY, predatorAI.ts, w5Kit.ts SPIDER5); the world tunes
 * its own when its first cast stage is laid. Held fair by predatorCasts.test.ts; registry.ts hands each to the stages that may name it.
 */
import type { PredatorDef } from './types.ts';

const EASY = { tell: 1.3, cool: 1.5, speed: 0.85 } as const;

/**
 * Tayra: runs its line to the end, every time (today its dash stops after 0.55 s, predatorAI.ts: the kit's runs to the end of its
 * ground, which is what lets him choose where the line ends). It fears the caiman
 */
export const TAYRA: PredatorDef = {
  kind: 'tayra', habit: 'charge', sight: { ahead: 340, behind: 240, tall: 70 }, speed: { rest: 70, hunt: 0 },
  // today it stands up for 0.42 s: the kit's floor is 0.5
  engage: 300, tell: 0.5, act: { aim: 'ahead', seconds: 6, speed: 235, reach: 46, tall: 24 }, recover: 0.6, cool: 1.7, giveUp: 6, easy: EASY,
  beatenBy: { lure: { ends: 'chasedOff' }, stomp: { ends: 'stunned', seconds: 2 }, kick: { ends: 'stunned', seconds: 2 }, geyser: { ends: 'chasedOff' } },
  first: 'lure',
  fears: ['caiman'],
};

/** Poison Dart Frog: on the stage clock. Its throat flashes on the warn; it stings on the on. It never goes anywhere */
export const FROG: PredatorDef = {
  kind: 'frog', habit: 'patrol', onBeat: true, sight: { ahead: 70, behind: 70, tall: 60 }, speed: { rest: 0, hunt: 0 },
  engage: 70, tell: 0.6, callsOff: true, act: { aim: 'ahead', seconds: 0.4, speed: 0, reach: 30, tall: 28 }, recover: 0.3, cool: 0, giveUp: 2,
  easy: EASY,
  beatenBy: { stomp: { ends: 'flees', seconds: 6 }, kick: { ends: 'chasedOff' }, still: { ends: 'flees', seconds: 4 } },
  first: 'stomp',
};

export const WORLD6: readonly PredatorDef[] = [TAYRA, FROG];
