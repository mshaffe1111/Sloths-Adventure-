/**
 * feelPairStage — Matt's feel test for the two-vine climb (R-165.170, FEEL-PAIR; 1-4.md piece 4): one single vine and one draped pair
 * side by side, the same height, on World 1's forest floor, before 1-4 is built on it. Matt plays the pair ALONE here and decides if it
 * stays (Matt, 11-12: "I'm afraid that we're gonna try to use something that just won't work").
 *
 * In a QA build only (Matt's test link, the dev server: playRecorder.ts qaBuild), never the shipped game: the Settings card's About page
 * on the title has a "Vine pair test" row there (TitleSettings.tsx), and `#autostart=1&level=feel-pair` opens it too. Elsewhere the room
 * does not exist: feelPairConfig() is null and generateStage never sees its id.
 *
 * The room: the floor (sound footing under both climbs), a single kapok climb on the left, the pair (one liana draped over the bough,
 * its two strands PAIR_GAP apart) on the right, 120 px+ apart (1-4.md), both up to one sound top FEEL.rise over the floor (the single's
 * perch and the pair's bough, end to end) with a flag on it. A signpost at the pair's foot shows its speed (2x or 1.6x the single's); a tap by it switches (feelPair.ts). A stopwatch
 * on screen times each climb, grab to standing on the bough (FeelPairClock.tsx). Nothing hurts, nothing falls, no exit: Matt leaves by
 * the pause menu.
 */
import type { GeneratedStage } from './stageGenerator.ts';
import type { Collectible, LevelConfig, Platform, Vine } from './types.ts';
import { qaBuild } from './playRecorder.ts';
import { CLIMB_SPEED, PAIR_GAP, PAIR_SPEEDS } from './vinePair.ts';

export const FEEL_PAIR_ID = 'feel-pair';

/**
 * The room's numbers (world px). The climb is about three storeys: 720 px, eight of Pokey's drawn height (89.1, heroSprite.ts; LESSONS
 * D41), so the single takes about 3.3 s, the pair 1.6-2.0 s. The single and the pair stand 160 apart (1-4.md: 120 px+ from the nearer
 * strand), so an upright phone shows both; the sign beside the pair's foot, out of its grab reach (vinePair.ts climbReach: 54 + 20).
 */
export const FEEL = {
  floor: 1300,
  rise: 720,
  /** how much of the world shows under the floor's top (px) */
  below: 130,
  width: 1500,
  spawn: 260,
  single: 680,
  pair: 840,
  sign: 950,
  /** the top, one walk across: the single's own perch (the kapok's painted perch, protoArt.ts drawPerchArt), then the bough the pair is
   *  draped over, meeting it (a plank across both read as a post holding a beam, and the trunk is a plant) */
  perch: [640, 800] as const,
  bough: [800, 940] as const,
} as const;

/** what the engine's feel room needs (feelPair.ts FeelRoom): the two climbs' ids, the sign's foot, the bough's top */
export interface FeelRoomSpec {
  single: number;
  pair: number;
  sign: { x: number; y: number };
  top: number;
  /** the pair's speeds (times the single's), the first its start */
  speeds: readonly number[];
}

/** the room's stage config, or null outside a QA build (the shipped game has no such room) */
export function feelPairConfig(): LevelConfig | null {
  if (!qaBuild()) return null;
  return {
    worldIndex: 1,
    miniIndex: 14,
    id: FEEL_PAIR_ID,
    name: 'Vine Pair Test',
    objectiveType: 'sprint',
    targetCount: 1,
    timeLimit: 0,
    levelWidth: FEEL.width,
    // (the level ends just under the floor's bank, so the camera rests on the floor: 300 below it showed half a screen of soil sideways)
    levelHeight: FEEL.floor + FEEL.below,
    description: 'One vine or two: climb each and feel the difference.',
    unlocked: true,
    completed: false,
    stars: 0,
    highScore: 0,
    bestTime: 0,
  };
}

/** the room, built (the same each time: no roll) */
export function buildFeelPairStage(config: LevelConfig): GeneratedStage & { feelRoom: FeelRoomSpec } {
  const G = FEEL.floor;
  const top = G - FEEL.rise;
  const P: Platform[] = [
    // the forest floor, one sound bank wall to wall
    { id: 1, x: 0, y: G, width: FEEL.width, height: 90, type: 'solid', style: 'log' },
    // the top: the single's perch and the pair's bough, end to end (a perch's top is 2 px under the climb's top: engine.ts Exit A)
    { id: 2, x: FEEL.perch[0], y: top + 2, width: FEEL.perch[1] - FEEL.perch[0], height: 26, type: 'solid', style: 'branch' },
    { id: 3, x: FEEL.bough[0], y: top + 2, width: FEEL.bough[1] - FEEL.bough[0], height: 26, type: 'solid', style: 'branch' },
  ];
  const V: Vine[] = [
    { id: 1, x: FEEL.single, topY: top, bottomY: G, swaySpeed: 0, swayPhase: 0, vineType: 'tree_climb' },
    { id: 2, x: FEEL.pair, topY: top, bottomY: G, swaySpeed: 0, swayPhase: 0, vineType: 'tree_climb', pair: PAIR_GAP, climbSpeed: CLIMB_SPEED * PAIR_SPEEDS[0] },
  ];
  const C: Collectible[] = [];
  return {
    config: { ...config, levelWidth: FEEL.width, levelHeight: G + FEEL.below },
    trees: [],
    platforms: P,
    vines: V,
    ropes: [],
    enemies: [],
    boss: null,
    collectibles: C,
    spawnX: FEEL.spawn,
    spawnY: G,
    // (no door: the room is left from the pause menu)
    exitTotemX: 0,
    exitTotemY: G,
    // the flag at the top, on the bough between the two climbs
    checkpoints: [{ x: (FEEL.single + FEEL.pair) / 2, y: top + 2, reached: false }],
    zones: [],
    meta: { attempt: 1, chunks: [], width: FEEL.width },
    proto: { hints: [], covers: [], beats: [] },
    feelRoom: { single: 1, pair: 2, sign: { x: FEEL.sign, y: G }, top, speeds: PAIR_SPEEDS },
  } as GeneratedStage & { feelRoom: FeelRoomSpec };
}
