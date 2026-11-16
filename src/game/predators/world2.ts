/**
 * predators/world2 — the animals the game first meets in this world, as kit data (reference/design/PREDATORS.md §2, §3): the river: the snapping turtle, the River King's guard, the caiman.
 * FIRST-DRAFT numbers, taken from what each does today (enemyBrain.ts PERSONALITY, predatorAI.ts, w5Kit.ts SPIDER5); the world tunes
 * its own when its first cast stage is laid. Held fair by predatorCasts.test.ts; registry.ts hands each to the stages that may name it.
 */
import { NOISE } from '../noise.ts';
import type { PredatorDef } from './types.ts';

const EASY = { tell: 1.3, cool: 1.5, speed: 0.85 } as const;

/** Snapping Turtle: nosy, and all shell from the front */
export const TURTLE: PredatorDef = {
  kind: 'turtle', habit: 'seek', sight: { ahead: 180, behind: 30, tall: 60 }, hears: NOISE.dur, speed: { rest: 22, hunt: 26 },
  engage: 85, tell: 0.5, act: { aim: 'ahead', seconds: 0.18, speed: 0, reach: 46, tall: 24 }, recover: 0.75, cool: 1.6, giveUp: 2, easy: EASY,
  beatenBy: { kick: { ends: 'chasedOff' }, stomp: { ends: 'stunned', seconds: 1.8 }, punch: { ends: 'stunned', seconds: 1.5, when: 'behind' } },
  first: 'kick',
};

/** River King's guard: holds its raft and leaves its post for nothing but the bell (World 2's own noise); the kick breaks its block */
export const RIVER_GUARD: PredatorDef = {
  kind: 'riverGuard', habit: 'guard', blocks: true, sight: { ahead: 180, behind: 60, tall: 60 }, hears: NOISE.dur, speed: { rest: 22, hunt: 26 },
  engage: 78, tell: 0.62, act: { aim: 'ahead', seconds: 0.2, speed: 0, reach: 78, tall: 30 }, recover: 0.95, cool: 1.6, giveUp: 2, easy: EASY,
  beatenBy: { kick: { ends: 'stunned', seconds: 2 }, trap: { ends: 'stunned', seconds: 3 } },
  first: 'kick',
};

/** Spectacled Caiman: the ripple. Its body rides its eye; it snaps at what stirs the water; asleep it is a log (no wakeAt: only noise) */
export const CAIMAN: PredatorDef = {
  kind: 'caiman', habit: 'sweep', rides: true, sight: { ahead: 90, behind: 90, tall: 200 }, speed: { rest: 60, hunt: 0 }, warn: 1,
  engage: 90, tell: 0.6, callsOff: true, act: { aim: 'him', seconds: 0.5, speed: 500, reach: 82, tall: 32 }, recover: 0.95, cool: 2, giveUp: 2,
  easy: EASY,
  beatenBy: { still: { ends: 'flees', seconds: 5 }, punch: { ends: 'stunned', seconds: 2.5, when: 'open' }, trap: { ends: 'stunned', seconds: 4 } },
  first: 'still',
};

export const WORLD2: readonly PredatorDef[] = [TURTLE, RIVER_GUARD, CAIMAN];
