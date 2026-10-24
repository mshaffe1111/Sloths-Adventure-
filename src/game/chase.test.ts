import test from 'node:test';
import assert from 'node:assert/strict';
import { CHASE, caught, chaseSpeed, newChase, restartAt, sectionState, stepChase, type ChasePlan } from './chase.ts';
import { BRANCH_TILE, buildProtoStage, EXPERT_SECONDS, G } from './protoStage.ts';
import { badPickups } from './flowerReach.ts';
import { reachJump } from './physics.ts';
import type { LevelConfig } from './types.ts';

const plan: ChasePlan = { start: 2000, end: 30000, finalFrom: 28000 };

test('the collapse waits until he passes its start, then sets off behind him', () => {
  const s = newChase(plan);
  stepChase(s, plan, 1, 1500);
  assert.equal(s.active, false);
  stepChase(s, plan, 1 / 30, 2010);
  assert.equal(s.active, true);
  assert.ok(2010 - s.front >= CHASE.behind - 1);
});

test('a player who keeps running pulls away; one who stops is caught within a few seconds', () => {
  const run = newChase(plan);
  let x = 2010;
  stepChase(run, plan, 1 / 30, x);
  for (let i = 0; i < 30 * 20; i++) {
    x += 285 / 30;
    stepChase(run, plan, 1 / 30, x);
    assert.equal(caught(run, x), false, `caught while running at ${i / 30} s`);
  }
  // the band: far ahead, it speeds up, so the gap stays bounded
  assert.ok(x - run.front < CHASE.band + CHASE.ramp + 200, `gap ${x - run.front}`);
  const stop = newChase(plan);
  stepChase(stop, plan, 1 / 30, 2010);
  let t = 0;
  while (!caught(stop, 2010) && t < 10) {
    stepChase(stop, plan, 1 / 30, 2010);
    t += 1 / 30;
  }
  assert.ok(t > 1.5 && t < 4, `stopping is caught after ${t.toFixed(1)} s`);
});

test('it goes faster the farther ahead he is, and faster again on the last stretch', () => {
  assert.equal(chaseSpeed(plan, 100, 5000), CHASE.base);
  assert.ok(chaseSpeed(plan, CHASE.band + CHASE.ramp, 5000) === CHASE.max);
  assert.ok(chaseSpeed(plan, 100, 28500) > CHASE.base);
  assert.ok(CHASE.base < 285, 'slower than his run');
});

test('a restart puts the collapse well behind the flag and holds it a moment', () => {
  const s = newChase(plan);
  stepChase(s, plan, 1 / 30, 2100);
  restartAt(s, plan, 9000);
  assert.equal(s.front, 9000 - CHASE.behind);
  const f = s.front;
  stepChase(s, plan, 1, 9000);
  assert.equal(s.front, f, 'held');
  assert.equal(sectionState(s, 9000, 9222), 'whole');
  assert.equal(sectionState(s, f - 300, f - 100), 'fallen');
  assert.equal(sectionState(s, f + 10, f + 200), 'cracked');
});

test('1-8: the branch runs unbroken but for jumpable gaps and vine swings, the chase starts after a calm run, and it takes two minutes', () => {
  const cfg = { worldIndex: 1, miniIndex: 8, id: '1-8', name: 'The Long Branch', objectiveType: 'sprint', targetCount: 1, timeLimit: 0, levelWidth: 16700, levelHeight: 900, description: '', unlocked: true, completed: false, stars: 0, highScore: 0, bestTime: 0 } as LevelConfig;
  const two = reachJump(0, true);
  for (let seed = 1; seed < 900; seed += 41) {
    const st = buildProtoStage(cfg, seed, '1-8');
    const ch = st.proto.chase!;
    assert.ok(ch.start > 2000 && ch.start < ch.finalFrom && ch.finalFrom < ch.end && ch.end < st.exitTotemX);
    assert.ok(st.meta!.timing!.layoutSeconds >= EXPERT_SECONDS - 15, `seed ${seed}`);
    const secs = st.platforms.filter((p) => p.chase && p.width === BRANCH_TILE).sort((a, b) => a.x - b.x);
    assert.ok(secs.length > 80);
    // every gap along the main branch is a jump (single or double), a drop, or has a vine or a trunk over it
    for (let i = 1; i < secs.length; i++) {
      const a = secs[i - 1], b = secs[i];
      const g = b.x - (a.x + a.width);
      if (g <= 1) continue;
      const helped = st.vines.some((v) => v.x > a.x + a.width - 120 && v.x < b.x + 120);
      assert.ok(helped || (g < two * 0.78 && b.y >= a.y - 10), `seed ${seed}: gap of ${g} at ${a.x + a.width}`);
    }
    assert.equal(st.proto.movedPickups, 0);
    assert.equal(badPickups({ platforms: st.platforms, vines: st.vines }, st.collectibles).length, 0);
    assert.ok(st.collectibles.some((c) => c.type === 'seed'), 'the fast line holds a seed');
    // World 1's book, in a fern before the chase starts
    const book = st.collectibles.find((c) => c.type === 'find');
    assert.ok(book && book.findId === 'w1_book' && book.hidden && book.x < ch.start, `seed ${seed}: the book before the chase`);
    assert.ok(st.platforms.some((p) => p.chaseTip));
    assert.ok(st.checkpoints!.length >= 6);
    assert.ok(st.platforms[0].y === G);
  }
});
