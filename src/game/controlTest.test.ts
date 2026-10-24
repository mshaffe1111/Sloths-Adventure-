import test from 'node:test';
import assert from 'node:assert/strict';
import { buildProtoStage, G } from './protoStage.ts';
import { reachJump } from './physics.ts';
import { maxRise } from './protoCheck.ts';
import { ctestEnabled } from './playRecorder.ts';
import type { LevelConfig } from './types.ts';

const cfg = {
  worldIndex: 1, miniIndex: 2, id: '1-2', name: 'Control test', objectiveType: 'vine_runner', targetCount: 1, timeLimit: 270,
  levelWidth: 9000, levelHeight: 900, description: '', unlocked: true, completed: false, stars: 0, highScore: 0, bestTime: 0,
} as LevelConfig;

test('control test: off unless the address asks for it', () => {
  assert.equal(ctestEnabled(), false);
});

test('control test: every tester gets the same stage, one skill per stretch, in order, with an exit', () => {
  const a = buildProtoStage(cfg, 7, 'ctest');
  assert.equal(JSON.stringify(buildProtoStage(cfg, 7, 'ctest')), JSON.stringify(a));
  assert.deepEqual(a.proto.beats.map((b) => b[2]), ['Run and stop', 'Short hops', 'Long jumps', 'Climb up and down', 'Swing', 'Fight', 'Finish']);
  assert.equal(a.collectibles.filter((c) => c.type === 'exit_totem').length, 1);
  assert.ok((a.checkpoints ?? []).length >= 6, 'a flag after every stretch');
  assert.ok(a.enemies.length >= 2 && a.enemies.every((e) => e.type === 'snake'));
  assert.equal(a.collectibles.filter((c) => c.type === 'seed').length, 0, 'no secrets in a test');
  // a test is cheap to fail: nothing to fall into but soft moss (the water is below everything)
  assert.ok(a.platforms.every((p) => p.y <= 720), 'every floor is above the water');
});

test('control test: the long jumps get wider, and the last two need the second jump but can be made with it', () => {
  const a = buildProtoStage(cfg, 7, 'ctest');
  const [x0, x1] = a.proto.beats[2];
  // the ground banks in the long-jump stretch, left to right: the gaps are the spaces between them
  const banks = a.platforms.filter((p) => p.y === G && p.x + p.width > x0 && p.x < x1).sort((p, q) => p.x - q.x);
  const gaps = banks.slice(1).map((b, i) => b.x - (banks[i].x + banks[i].width));
  assert.equal(gaps.length, 4, `gaps ${gaps}`);
  for (let i = 1; i < gaps.length; i++) assert.ok(gaps[i] > gaps[i - 1], `gaps ${gaps}`);
  const one = reachJump(0, false), two = reachJump(0, true);
  assert.ok(gaps[0] < one * 0.6 && gaps[2] > one && gaps[3] < two * 0.9, `gaps ${gaps}, reach ${one} / ${two}`);
  // and from the moss below each gap, a double jump climbs back out
  assert.ok(720 - G - 10 < maxRise() + 26);
});
