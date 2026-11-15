/**
 * predators/world1 — World 1's cast as kit data (reference/design/PREDATORS.md §2, §3): the Golden Tree Snake, the Boa Constrictor
 * and the Harpy Eagle. The worked example of the kit, and the data World 1 is laid with. Not wired into any shipped stage.
 *
 * Numbers start from what each animal does today (enemyBrain.ts PERSONALITY, predatorAI.ts, watcher.ts WATCH); a number that
 * changes says why. Each is held fair by `checkPredator` (predatorWorld1.test.ts).
 */
import { NOISE } from '../noise.ts';
import type { PredatorDef } from './types.ts';

const EASY = { tell: 1.3, cool: 1.5, speed: 0.85 } as const;

/**
 * The Golden Tree Snake: it gives ground. It backs along its branch and strikes only when he crowds it or it runs out of branch.
 * The real one is the "flying snake": chased off, it flattens and glides to a lower tree. EVERY way of beating it ends so (Matt,
 * 11-12): a punch at its branch end, a stomp, a kick, a drop trap. Only a punch mid-branch is not an ending: it shoves it along
 * its branch and dazes it, and it is still his to deal with (which is what keeps the trap worth using).
 */
export const SNAKE: PredatorDef = {
  kind: 'snake',
  habit: 'patrol',
  sight: { ahead: 200, behind: 90, tall: 60 },
  speed: { rest: 32, hunt: 0 },
  shy: 30,
  wakeAt: 95,
  engage: 105,
  // today's rear is 0.38 s (predatorAI.ts): under the 0.5 s floor, so the kit's snake rears for the floor
  tell: 0.5,
  act: { aim: 'ahead', seconds: 0.18, speed: 300, reach: 42, tall: 22 },
  recover: 0.55,
  cool: 1.3,
  giveUp: 1.5,
  easy: EASY,
  beatenBy: {
    // 70 px: a third of a short branch, so a snake he has crowded to the end goes off in one punch and one mid-branch in two or three
    punch: { ends: 'stunned', seconds: 2, knock: 70 },
    trap: { ends: 'chasedOff' },
    // (Matt, 11-12, R-165.141: however he beats it, it ends the same kind way, the glide, gone for good. A stomp was 'flees 5 s')
    stomp: { ends: 'chasedOff' },
    kick: { ends: 'chasedOff' },
  },
  first: 'punch',
};

/**
 * The Boa Constrictor: it strikes at movement. It lies along its bough and watches both ways; a still sloth is a branch to it, so
 * holding still while it rears makes it settle back. It fears the eagle's shadow.
 */
export const BOA: PredatorDef = {
  kind: 'boa',
  habit: 'ambush',
  sight: { ahead: 280, behind: 280, tall: 70 },
  speed: { rest: 0, hunt: 0 },
  wakeAt: 40,
  engage: 150,
  // 1.0 s (the lead's ruling, 7:47 PM ET 11-14, from 1-9's flight reference/specs/sims/boaFreeze.ts): at 0.8 s a thumb running in had
  // to lift within 7 frames (0.23 s) of the rear's start, under a touch player's reaction; 1.0 s gives 13 frames (0.43 s) on Normal, and
  // Easy keeps its own row (x1.3). Going still (calm in 0.5 s, stillness.ts) fits inside the rear with room to react (boaFreeze.test.ts)
  tell: 1.0,
  callsOff: true,
  act: { aim: 'ahead', seconds: 0.42, speed: 0, reach: 128, tall: 30 },
  // (its coil hurts on touch, the lead's ruling 11:20 AM ET 11-15: running through it inside its rear was a free pass; the body as laid,
  // 58 x 26, w1Cast.ts W1_BOAS)
  coil: { w: 58, tall: 26 },
  recover: 0.8,
  cool: 1.1,
  giveUp: 2,
  // (Easy notices him 1.3 times as far off, 195 px: the lead's ruling 11:31 AM ET 11-15, so Easy's freeze window stays about double
  // Normal's with the coil; boaFreeze.test flies it)
  easy: { ...EASY, engage: 1.3 },
  beatenBy: {
    trap: { ends: 'chasedOff' },
    lure: { ends: 'chasedOff' },
    still: { ends: 'flees', seconds: 4 },
    punch: { ends: 'stunned', seconds: 2.5, when: 'open' },
  },
  first: 'trap',
  fears: ['eagle'],
};

/**
 * The Harpy Eagle: the shadow. Its eye crosses its stretch; it takes what it sees move, and what it sees in the open. Only cover
 * hides a still sloth from it (World 1's rule: in the bush, hold still). A noise pulls its shadow away. It cannot be hit.
 */
export const EAGLE: PredatorDef = {
  kind: 'eagle',
  habit: 'sweep',
  // it flies over its eye (its body is where its shadow is): its dive starts from over him, so the box that hurts arrives with the drawn
  // dive (sweepPose.ts), never 700 px/s from the far end of its stretch (1-7 NEW 2, ENG-E1)
  rides: true,
  sight: { ahead: 70, behind: 70, tall: 2000, seesStill: true },
  // the eye crosses a phone's width in about the 2.6 s today's pass takes (watcher.ts WATCH.pass)
  speed: { rest: 320, hunt: 0 },
  hears: NOISE.dur,
  warn: 2,
  engage: 70,
  tell: 0.75,
  callsOff: true,
  act: { aim: 'him', seconds: 3, speed: 700, reach: 60, tall: 60 },
  recover: 0.6,
  cool: 5,
  giveUp: 2,
  easy: EASY,
  // its second way is the noise lure (`hears`): it has no body to hit
  beatenBy: { still: { ends: 'flees', seconds: 8 } },
  first: 'still',
};

export const WORLD1: readonly PredatorDef[] = [SNAKE, BOA, EAGLE];
