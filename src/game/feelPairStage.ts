/**
 * feelPairStage — Matt's feel test for the vine field (R-165.177, LATTICE; F15's FEEL-LATTICE.md, 1-4.md "The vine field"): a small field
 * of short vines on World 1's forest floor, before 1-4 is built on it, to play Matt's rule (vineField.ts: a push toward a vine in reach
 * takes it in the other hand, again lets go of the old one) and pushing a fruit cluster up its vine. It REPLACES v1's single-and-pair
 * room (FEEL-PAIR, R-165.170) in place: the same entry, the same id.
 *
 * In a QA build only (Matt's test link, the dev server: playRecorder.ts qaBuild), never the shipped game: the Settings card's About page
 * on the title has a "Vine field test" row there (TitleSettings.tsx), and `#autostart=1&level=feel-pair` opens it too. Elsewhere the room
 * does not exist: feelPairConfig() is null and generateStage never sees its id.
 *
 * The room, left to right: a sign (the one-hand slide, 2x or 1.6x: a tap by it switches, feelPair.ts); five vines 80 px apart, 450 px
 * tall, from a bough to the floor; six vines of mixed lengths (150-450 px) from a second bough, one 110 px gap he must jump; three vines
 * with two fruit clusters on them to push up (a third bough). A stopwatch times each climb from the floor to a bough (FeelPairClock.tsx).
 * Nothing falls on him, nothing hurts, no exit: Matt leaves by the pause menu. Stand-ins named plainly: the field vines are World 1's
 * painted vine hung straight, the clusters are code-drawn, Pokey's two-vine climb is v1's pair climb (vineFieldArt.ts; R-165.178).
 */
import type { GeneratedStage } from './stageGenerator.ts';
import type { Collectible, LevelConfig, Platform, Vine } from './types.ts';
import { qaBuild } from './playRecorder.ts';
import { FIELD_FEEL, type VineCluster } from './vineField.ts';

export const FEEL_PAIR_ID = 'feel-pair';

/** the slides Matt tries on the sign (times the climb speed; FEEL-LATTICE §4), the first where it starts */
export const SLIDE_SPEEDS = [FIELD_FEEL.slide, 1.6] as const;

/**
 * The room's numbers (world px). Each field hangs from a bough FEEL.rise over the floor (450: five of Pokey's drawn height, 89.1,
 * heroSprite.ts; LESSONS D41). Each vine is [x, length]; a length short of the rise ends in the air.
 */
export const FEEL = {
  floor: 1300,
  rise: 450,
  /** how much of the world shows under the floor's top (px) */
  below: 130,
  width: 2300,
  spawn: 220,
  sign: 420,
  /** lane 1: five vines 80 apart, floor to bough */
  even: [[600, 450], [680, 450], [760, 450], [840, 450], [920, 450]] as ReadonlyArray<readonly [number, number]>,
  evenBough: [540, 980] as const,
  /** lane 1, on: six of mixed lengths, one 110 px gap (1320 to 1430) he must jump */
  mixed: [[1160, 450], [1240, 300], [1320, 380], [1430, 420], [1510, 150], [1590, 330]] as ReadonlyArray<readonly [number, number]>,
  mixedBough: [1100, 1650] as const,
  /** lane 3: three vines, a cluster low on the first and one higher on the third */
  push: [[1860, 450], [1940, 450], [2020, 450]] as ReadonlyArray<readonly [number, number]>,
  pushBough: [1800, 2080] as const,
  /** the clusters: which push vine (index), its bottom over the floor, its height */
  clusters: [[0, 150, 56], [2, 300, 56]] as ReadonlyArray<readonly [number, number, number]>,
} as const;

/** what the engine's feel room needs (feelPair.ts FeelRoom): the field's vine ids, the sign's foot, the boughs' top */
export interface FeelRoomSpec {
  field: number[];
  sign: { x: number; y: number };
  top: number;
  /** the one-hand slides (times the climb speed), the first its start */
  speeds: readonly number[];
}

/** the room's stage config, or null outside a QA build (the shipped game has no such room) */
export function feelPairConfig(): LevelConfig | null {
  if (!qaBuild()) return null;
  return {
    worldIndex: 1,
    miniIndex: 14,
    id: FEEL_PAIR_ID,
    name: 'Vine Field Test',
    objectiveType: 'sprint',
    targetCount: 1,
    timeLimit: 0,
    levelWidth: FEEL.width,
    // (the level ends just under the floor's bank, so the camera rests on the floor: 300 below it showed half a screen of soil sideways)
    levelHeight: FEEL.floor + FEEL.below,
    description: 'Push toward a vine for two hands; again to let go of the old one.',
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
  const bough = (id: number, [x0, x1]: readonly [number, number]): Platform =>
    // (a bough's top is 2 px under the climbs' top: engine.ts Exit A)
    ({ id, x: x0, y: top + 2, width: x1 - x0, height: 26, type: 'solid', style: 'branch' });
  const P: Platform[] = [
    // the forest floor, one sound bank wall to wall
    { id: 1, x: 0, y: G, width: FEEL.width, height: 90, type: 'solid', style: 'log' },
    bough(2, FEEL.evenBough),
    bough(3, FEEL.mixedBough),
    bough(4, FEEL.pushBough),
  ];
  const V: Vine[] = [];
  for (const [x, len] of [...FEEL.even, ...FEEL.mixed, ...FEEL.push]) {
    V.push({ id: V.length + 1, x, topY: top, bottomY: top + len, swaySpeed: 0, swayPhase: 0, vineType: 'tree_climb', field: { slide: SLIDE_SPEEDS[0] } });
  }
  const pushAt = FEEL.even.length + FEEL.mixed.length;
  const K: VineCluster[] = FEEL.clusters.map(([i, over, h], n) => ({ id: n + 1, vine: V[pushAt + i].id, y: G - over, h }));
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
    checkpoints: [],
    zones: [],
    meta: { attempt: 1, chunks: [], width: FEEL.width },
    proto: { hints: [], covers: [], beats: [] },
    clusters: K,
    feelRoom: { field: V.map((v) => v.id), sign: { x: FEEL.sign, y: G }, top, speeds: SLIDE_SPEEDS },
  } as GeneratedStage & { feelRoom: FeelRoomSpec };
}
