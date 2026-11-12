/**
 * predators/casts — the animals after World 1 as kit data (reference/design/PREDATORS.md §2, §3). FIRST-DRAFT numbers, taken from
 * what each does today (enemyBrain.ts PERSONALITY, predatorAI.ts, w5Kit.ts SPIDER5); each world tunes its own when it is laid.
 * Here to prove the kit covers every fighting animal's personality from data alone, and held fair by predatorCasts.test.ts.
 * Not wired into any shipped stage.
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

/** Poison Dart Frog: on the stage clock. Its throat flashes on the warn; it stings on the on. It never goes anywhere */
export const FROG: PredatorDef = {
  kind: 'frog', habit: 'patrol', onBeat: true, sight: { ahead: 70, behind: 70, tall: 60 }, speed: { rest: 0, hunt: 0 },
  engage: 70, tell: 0.6, callsOff: true, act: { aim: 'ahead', seconds: 0.4, speed: 0, reach: 30, tall: 28 }, recover: 0.3, cool: 0, giveUp: 2,
  easy: EASY,
  beatenBy: { stomp: { ends: 'flees', seconds: 6 }, kick: { ends: 'chasedOff' }, still: { ends: 'flees', seconds: 4 } },
  first: 'stomp',
};

/** Jumping Spider: feels the silk (a still sloth is not hidden), comes in bursts with pauses, open in the pause */
export const SPIDER: PredatorDef = {
  kind: 'spider', habit: 'seek', sight: { ahead: 430, behind: 430, tall: 80, seesStill: true }, hears: NOISE.dur, speed: { rest: 0, hunt: 150 },
  gait: { go: 0.45, pause: 0.32 },
  engage: 90, tell: 0.7, act: { aim: 'ahead', seconds: 0.3, speed: 150, reach: 60, tall: 22 }, recover: 0.5, cool: 1.2, giveUp: 3, easy: EASY,
  beatenBy: { stomp: { ends: 'flees', seconds: 5 }, punch: { ends: 'stunned', seconds: 2, when: 'open' }, dew: { ends: 'dozes' } },
  first: 'stomp',
};

/** Stone sentry: a doorway that hits back. Cannot be hit; a noise turns its head */
export const SENTRY: PredatorDef = {
  kind: 'sentry', habit: 'guard', blocks: true, sight: { ahead: 160, behind: 160, tall: 90 }, hears: NOISE.dur, speed: { rest: 0, hunt: 0 },
  engage: 80, tell: 0.7, act: { aim: 'ahead', seconds: 0.25, speed: 0, reach: 80, tall: 60 }, recover: 1.2, cool: 2, giveUp: 3, easy: EASY,
  beatenBy: { break: { ends: 'chasedOff' }, push: { ends: 'stunned', seconds: 6 } },
  first: 'break',
};

export const CASTS_AFTER_1: readonly PredatorDef[] = [TURTLE, RIVER_GUARD, CAIMAN, OCELOT, JAGUAR, TAYRA, HARPY, FROG, SPIDER, SENTRY];
