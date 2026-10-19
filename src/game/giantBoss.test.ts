import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { BossEntity } from './types.ts';
import { bossDefFor } from './bossDefs.ts';
import { newBrain, weakOpen, weakRect } from './bossAI.ts';
import { DOUBLE_RISE } from './physics.ts';
import { generateStage } from './stageGenerator.ts';
import { generateAllLevels } from './worldsData.ts';
import { validateStage } from './levelCheck.ts';

const drake = bossDefFor(9);
const floor = 560;
const mk = (state: 'idle' | 'tell' | 'act' | 'rec' | 'stun' | 'roar' | 'dying', facing: 1 | -1 = 1): BossEntity => {
  const b = {
    id: 1, type: 'boss', x: 1500, y: floor - drake.h / 2, vx: 0, vy: 0, width: drake.w, height: drake.h, hp: 48, maxHp: 48,
    facing, patrolMinX: 0, patrolMaxX: 0, attackCooldown: 0, telegraphTimer: 0, isAttacking: false,
    animTimer: 0, hitFlashTimer: 0, defeated: false, koTimer: 0, behaviorTimer: 0, phase: 1, phaseMax: 3,
    specialAttackTimer: 0, shieldActive: false, dialogueIntro: '', dialogueDefeat: '', ai: newBrain(),
  } as BossEntity;
  b.ai!.state = state;
  return b;
};

test('the weak point is open only in the opening after a move, or while stunned', () => {
  for (const s of ['idle', 'tell', 'act', 'roar', 'dying'] as const) assert.equal(weakOpen(mk(s)), false, s);
  for (const s of ['rec', 'stun'] as const) assert.equal(weakOpen(mk(s)), true, s);
});

test('the weak point sits on the head side and follows the way the boss faces', () => {
  const r = weakRect(mk('rec', 1), drake, floor)!;
  const l = weakRect(mk('rec', -1), drake, floor)!;
  assert.ok(r.x + r.w / 2 > 1500 && l.x + l.w / 2 < 1500);
  assert.equal(weakRect(mk('rec'), bossDefFor(1), floor), null, 'a boss without a weak point can be hit anywhere');
});

test('the Drake is a giant whose head can be reached with a double jump from the floor', () => {
  assert.ok((drake.scale ?? 1) >= 3 && drake.w >= 400);
  const r = weakRect(mk('rec'), drake, floor)!;
  const bottomAboveFloor = floor - (r.y + r.h);
  assert.ok(bottomAboveFloor <= DOUBLE_RISE, `head bottom ${bottomAboveFloor} vs double jump ${DOUBLE_RISE}`);
  assert.ok(bottomAboveFloor > 60, 'it is high enough that a ledge helps');
  // the head is inside the body box, so a strike that lands on it also counts as touching the boss
  const bodyTop = floor - drake.h;
  assert.ok(r.y >= bodyTop - 20);
});

test('the Drake bar: one segment per hit, two hit points a hit, and it fits its arena', () => {
  assert.equal(drake.hp, (drake.hits ?? 0) * 2);
  const stage = generateStage(generateAllLevels().find((l) => l.id === '9-10')!);
  const a = stage.arena!;
  assert.ok(a.right - a.left >= drake.w + 700, 'room to run around a giant');
  assert.equal(stage.boss!.maxHp, drake.hp);
  assert.ok(stage.boss!.x + drake.w / 2 <= a.right, 'it starts inside the fence');
  assert.equal(validateStage(stage).ok, true);
});
