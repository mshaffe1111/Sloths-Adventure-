/**
 * Game-wide rules of the 2026-10-28 groundwork: the goals' shares (goals.ts) and the crumbled platforms' slow, out-of-sight regrowth
 * (regrow.ts). (Worlds 1-4's backdrops through the day: stageBackdrops.test.ts.)
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { GOAL_SHARE, easyGoalFor, goalCounts, normalGoal, onCrumbling, withGoals } from './goals.ts';
import { mayRegrow, offScreen, REGROW, regrowDelay } from './regrow.ts';
import { easyStage } from './easyMode.ts';
import { buildProtoStage, HAND_STAGES } from './protoStage.ts';
import { buildW2Stage, W2_STAGES } from './w2Stages.ts';
import { generateAllLevels } from './worldsData.ts';
import type { GeneratedStage } from './stageGenerator.ts';
import type { Collectible, Enemy, LevelConfig, Platform } from './types.ts';

const cfg = (objectiveType: LevelConfig['objectiveType'], targetCount: number): LevelConfig => ({
  worldIndex: 1, miniIndex: 2, id: '1-2', name: 't', objectiveType, targetCount, timeLimit: 0, levelWidth: 4000, levelHeight: 900,
  description: '', unlocked: true, completed: false, stars: 0, highScore: 0, bestTime: 0,
});
const flower = (id: number, x: number, y = 546): Collectible => ({ id, type: 'flower', x, y, collected: false, bobPhase: 0 });
const ground: Platform = { id: 1, x: 0, y: 580, width: 4000, height: 90, type: 'solid' };
const stageOf = (c: LevelConfig, collectibles: Collectible[], platforms: Platform[] = [ground], enemies: Enemy[] = []): GeneratedStage => ({
  config: c, trees: [], platforms, vines: [], ropes: [], enemies, boss: null, collectibles, spawnX: 0, spawnY: 580, exitTotemX: 3900, exitTotemY: 580,
});

// ───────────────────────────── goals ─────────────────────────────

test('goals: gather about 85-90% of the flowers a player can reach; never one on a crumbling platform', () => {
  const fl = Array.from({ length: 20 }, (_, i) => flower(i + 1, 100 + i * 150));
  assert.equal(normalGoal(stageOf(cfg('harvest', 8), fl) as never), 18, '87.5% of 20, rounded');
  // four of them over a fragile log: they do not count
  const log: Platform = { id: 2, x: 1550, y: 500, width: 500, height: 24, type: 'fragile' };
  const high = fl.map((c) => (c.x >= 1600 && c.x <= 2000 ? { ...c, y: 470 } : c));
  assert.equal(high.filter((c) => onCrumbling(c, [ground, log])).length, 3);
  assert.equal(goalCounts(stageOf(cfg('harvest', 8), high, [ground, log]) as never).petals, 17);
  assert.equal(normalGoal(stageOf(cfg('harvest', 8), high, [ground, log]) as never), 15);
  assert.equal(GOAL_SHARE.collect, 0.875);
});

test('goals: free every animal there is to free; beat about three quarters of the predators', () => {
  const cages = Array.from({ length: 7 }, (_, i): Collectible => ({ id: i + 1, type: 'cage', x: 200 + i * 300, y: 540, collected: false, bobPhase: 0 }));
  assert.equal(normalGoal(stageOf(cfg('rescue', 5), cages) as never), 7);
  const foes = Array.from({ length: 10 }, (_, i) => ({ id: i, type: 'snake', x: 300 + i * 300, y: 560 }) as unknown as Enemy);
  assert.equal(normalGoal(stageOf(cfg('purge', 6), [], [ground], foes) as never), 8, '75% of 10, rounded');
  assert.equal(normalGoal(stageOf(cfg('sprint', 1), []) as never), null, 'a stage with no count keeps none');
});

test('goals: Normal gets its share; Easy asks round(Normal x 0.65), never under 60% of what is there nor under today\'s goal (LV-6), and its gentler beat-the-animals goal', () => {
  const fl = Array.from({ length: 20 }, (_, i) => flower(i + 1, 100 + i * 150));
  const st = withGoals(stageOf(cfg('harvest', 9), fl));
  assert.equal(st.config.targetCount, 18);
  assert.equal(st.easyGoal, 12, 'round(18 x 0.65) = 12 = 60% of 20: the stage\'s own quota of 9 no longer lowers it');
  assert.equal(withGoals(st).config.targetCount, 18, 'set once');
  // never under the goal Easy had before (the stage's quota, at most 80% of Normal: 14)
  assert.equal(withGoals(stageOf(cfg('harvest', 19), fl)).easyGoal, 14);
  const easy = easyStage(withGoals(stageOf(cfg('harvest', 9), fl)) as never);
  assert.equal(easy.config.targetCount, 12);
  // the rule alone: 65% of Normal, the 60% floor, today's goal, never over Normal
  assert.equal(easyGoalFor(20, 21), 13, '65% of 20');
  assert.equal(easyGoalFor(10, 30), 10, '60% of 30 is over Normal: Normal');
  assert.equal(easyGoalFor(16, 21), 13, '60% of 21 lifts round(10.4)');
  assert.equal(easyGoalFor(16, 21, 15), 15, 'never under today\'s goal');
  assert.equal(easyGoalFor(1, 1), 1);
  const foes = Array.from({ length: 10 }, (_, i) => ({ id: i, type: i % 2 ? 'snake' : 'ocelot', x: 300 + i * 300, y: 560, attackCooldown: 1 }) as unknown as Enemy);
  const purge = easyStage(withGoals(stageOf(cfg('purge', 6), [], [ground], foes)) as never);
  const kept = purge.enemies.length;
  assert.ok(kept < 10, 'Easy holds fewer animals');
  assert.ok(purge.config.targetCount >= Math.ceil(kept * 0.6) && purge.config.targetCount <= kept, `Easy: ${purge.config.targetCount} of ${kept}`);
});

test('goals: every hand-built stage of Worlds 1-4 with a count lands in Matt\'s band on Normal (small counts round as near as they can)', () => {
  const levels = generateAllLevels().filter((c) => c.worldIndex <= 4 && c.objectiveType !== 'boss_lair');
  let checked = 0;
  for (const c of levels) {
    const hand = HAND_STAGES[c.id] ? buildProtoStage(c, 1, HAND_STAGES[c.id]) : W2_STAGES[c.id] ? buildW2Stage(c, 1, W2_STAGES[c.id]) : null;
    if (!hand) continue;
    const st = withGoals(hand);
    const n = goalCounts(st as never);
    const t = c.objectiveType;
    const have = t === 'harvest' ? n.petals : t === 'rescue' ? n.rescuable : t === 'purge' || t === 'gauntlet' ? n.animals : 0;
    if (!have) continue;
    const share = st.config.targetCount / have;
    const band = t === 'harvest' ? [0.85, 0.9] : t === 'rescue' ? [1, 1] : [0.7, 0.8];
    // (with few things to count, the nearest whole number can sit a little outside the band)
    const slack = 0.5 / have + 0.005;
    assert.ok(share >= band[0] - slack && share <= band[1] + slack, `${c.id} ${t}: ${st.config.targetCount} of ${have}`);
    assert.ok((st.easyGoal ?? 0) <= st.config.targetCount, `${c.id}: Easy asks no more than Normal`);
    checked++;
  }
  assert.ok(checked >= 6, `${checked} stages checked`);
});

// ───────────────────────────── crumbling platforms ─────────────────────────────

test('regrow: a crumbled platform comes back only after 30-35 s, and only off screen, and never where he is', () => {
  for (let id = 1; id < 200; id++) {
    const d = regrowDelay(id);
    assert.ok(d >= REGROW.min && d <= REGROW.max, `${id}: ${d}`);
    assert.equal(regrowDelay(id), d, 'the same every time');
  }
  assert.equal(REGROW.min, 30);
  assert.equal(REGROW.max, 35);
  const view = { x: 1000, y: 0, w: 844, h: 390 };
  const plank = { x: 1300, y: 300, width: 120, height: 24, regrowAt: 40 };
  const hero = { x: 1100, y: 300 };
  assert.equal(mayRegrow(plank, 39, view, hero), false, 'too soon');
  assert.equal(mayRegrow(plank, 60, view, hero), false, 'in view: it waits');
  assert.equal(offScreen(plank, view), false);
  assert.equal(mayRegrow(plank, 60, { ...view, x: 2000 }, hero), true, 'out of view: back it comes');
  assert.equal(mayRegrow(plank, 60, { ...view, x: 2000 }, { x: 1350, y: 300 }), false, 'never where he stands');
  // the margin: just past the edge of the view is still too close
  assert.equal(offScreen({ x: 1850, y: 300, width: 100, height: 24 }, view), false);
  assert.equal(offScreen({ x: 1950, y: 300, width: 100, height: 24 }, view), true);
});
