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
 * The room, left to right (v2, B14 11-13: FEEL-LATTICE §5-7, crude by Matt's rule, 11-12 10:36 PM ET: "a crudely drawn prototype"):
 *   lane 1, pure feel: a sign (the one-hand slide, 2x or 1.6x: a tap by it switches, feelPair.ts); five vines 80 px apart, 450 px tall,
 *     from a bough to the floor; six vines of mixed lengths (150-450 px) from a second bough, one 110 px gap he must jump;
 *   lane 3a, the first push: three vines under a bough SHUT by one fruit cluster low on a quiet vine (nothing falls there): pushed up its
 *     vine it tears free, drops, and the bough springs open (vineField.ts ClusterGate);
 *   lane 2, pods: five vines with pods down two columns on ONE steady stage beat (3.6 s, beat.ts), half a beat apart, each creaking
 *     with its fluff trickling 1.0 s before it lets go (podfall.ts); a pod knocks him to the floor;
 *   lane 3b, pushing under pods: a bough shut by two clusters, pods down both push vines, free vines between: he steps a vine over for a
 *     pod, the cluster stays snagged where he left it, he steps back; the bough lifts a notch for the first, springs open on the second.
 * A stopwatch times each climb from the floor to a bough, and counts the knocks and the fruit freed (FeelPairClock.tsx). No hearts, no
 * exit: Matt leaves by the pause menu. Not in the room yet (1-4.md piece 8, after the level stands): the flyer and the ants.
 * Stand-ins named plainly: the field vines are World 1's painted vine hung straight, the clusters, the pods and the shut boughs are
 * code-drawn, the sounds are the rockfall's and a log's, Pokey's two-vine climb is v1's pair climb (vineFieldArt.ts; R-165.178).
 */
import type { GeneratedStage } from './stageGenerator.ts';
import type { Collectible, LevelConfig, Platform, Vine } from './types.ts';
import { qaBuild } from './playRecorder.ts';
import { FIELD_FEEL, type ClusterGate, type VineCluster } from './vineField.ts';
import { podBeat, type PodColumn } from './podfall.ts';

export const FEEL_PAIR_ID = 'feel-pair';

/** the slides Matt tries on the sign (times the climb speed; FEEL-LATTICE §4), the first where it starts */
export const SLIDE_SPEEDS = [FIELD_FEEL.slide, 1.6] as const;
/** the pods' beat (s; 1-4.md's steady 3.6) and its tell (1-4.md "Pods fair": 1.0 s) */
export const POD_BEAT = 3.6;
export const POD_TELL = 1.0;

/**
 * The room's numbers (world px). Each field hangs from a bough FEEL.rise over the floor (450: five of Pokey's drawn height, 89.1,
 * heroSprite.ts; LESSONS D41). Each vine is [x, length]; a length short of the rise ends in the air.
 */
export const FEEL = {
  floor: 1300,
  rise: 450,
  /** how much of the world shows under the floor's top (px) */
  below: 130,
  width: 3600,
  spawn: 220,
  sign: 420,
  /** lane 1: five vines 80 apart, floor to bough */
  even: [[600, 450], [680, 450], [760, 450], [840, 450], [920, 450]] as ReadonlyArray<readonly [number, number]>,
  evenBough: [540, 980] as const,
  /** lane 1, on: six of mixed lengths, one 110 px gap (1320 to 1430) he must jump */
  mixed: [[1160, 450], [1240, 300], [1320, 380], [1430, 420], [1510, 150], [1590, 330]] as ReadonlyArray<readonly [number, number]>,
  mixedBough: [1100, 1650] as const,
  /** lane 3a: three vines under a bough shut by ONE cluster, low on the first vine (a quiet vine: nothing falls there) */
  push: [[1860, 450], [1940, 450], [2020, 450]] as ReadonlyArray<readonly [number, number]>,
  pushBough: [1800, 2080] as const,
  /** the clusters: which vine of `push` then of `under` (index into the two lanes in turn), its bottom over the floor, its height */
  clusters: [[0, 150, 56]] as ReadonlyArray<readonly [number, number, number]>,
  /** lane 2: five vines with pods down the 2nd and 4th columns (indices), half a beat apart */
  pods: [[2420, 450], [2500, 450], [2580, 450], [2660, 450], [2740, 450]] as ReadonlyArray<readonly [number, number]>,
  podsBough: [2360, 2800] as const,
  podCols: [1, 3] as readonly number[],
  /** lane 3b: five vines under a bough shut by TWO clusters (on the 1st and 4th vines), pods down both push vines, the rest free */
  under: [[3000, 450], [3080, 450], [3160, 450], [3240, 450], [3320, 450]] as ReadonlyArray<readonly [number, number]>,
  underBough: [2940, 3380] as const,
  underClusters: [[0, 150, 56], [3, 250, 56]] as ReadonlyArray<readonly [number, number, number]>,
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
    bough(5, FEEL.podsBough),
    bough(6, FEEL.underBough),
  ];
  const V: Vine[] = [];
  for (const [x, len] of [...FEEL.even, ...FEEL.mixed, ...FEEL.push, ...FEEL.pods, ...FEEL.under]) {
    V.push({ id: V.length + 1, x, topY: top, bottomY: top + len, swaySpeed: 0, swayPhase: 0, vineType: 'tree_climb', field: { slide: SLIDE_SPEEDS[0] } });
  }
  const pushAt = FEEL.even.length + FEEL.mixed.length;
  const podsAt = pushAt + FEEL.push.length;
  const underAt = podsAt + FEEL.pods.length;
  const K: VineCluster[] = [
    ...FEEL.clusters.map(([i, over, h]) => ({ vine: V[pushAt + i].id, over, h })),
    ...FEEL.underClusters.map(([i, over, h]) => ({ vine: V[underAt + i].id, over, h })),
  ].map((c, n) => ({ id: n + 1, vine: c.vine, y: G - c.over, h: c.h }));
  // the gates: lane 3a's bough held by its one cluster, lane 3b's by its two; each sags at its far (right) end
  const gates: ClusterGate[] = [
    { id: 1, platform: 4, clusters: [1], far: 1 },
    { id: 2, platform: 6, clusters: [2, 3], far: 1 },
  ];
  // the pods: down lane 2's two columns, then down lane 3b's two push vines, each pair half a beat apart; under the bough to the floor.
  // They knock him down, nothing more (no hearts in the room: FEEL-LATTICE §6)
  // (`top`: where its bottom hangs, a drawn pod's length under the bough: vineFieldArt.ts drawPod); every pod on ONE stage beat
  const podTop = top + 110;
  const clocks = [podBeat('room-pods', POD_BEAT, POD_TELL, G - podTop, 1)];
  const pod = (id: number, v: Vine, shift: number): PodColumn =>
    ({ id, vine: v.id, x: v.x, top: podTop, land: G, clock: 'room-pods', shift, cost: 'knock' });
  const pods: PodColumn[] = [
    ...FEEL.podCols.map((i, n) => pod(n + 1, V[podsAt + i], n * (POD_BEAT / 2))),
    ...FEEL.underClusters.map(([i], n) => pod(FEEL.podCols.length + n + 1, V[underAt + i], POD_BEAT / 4 + n * (POD_BEAT / 2))),
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
    checkpoints: [],
    zones: [],
    meta: { attempt: 1, chunks: [], width: FEEL.width },
    proto: { hints: [], covers: [], beats: [] },
    clusters: K,
    gates,
    clocks,
    pods,
    feelRoom: { field: V.map((v) => v.id), sign: { x: FEEL.sign, y: G }, top, speeds: SLIDE_SPEEDS },
  } as GeneratedStage & { feelRoom: FeelRoomSpec };
}
