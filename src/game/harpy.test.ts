import test from 'node:test';
import assert from 'node:assert/strict';
import type { Enemy } from './types.ts';
import { FEET, HARPY, harpyShockReach, stepPredator } from './predatorAI.ts';
import { PERSONALITY } from './enemyBrain.ts';
import { HARPY_FRAMES } from './harpyAtlasData.ts';
import { harpyPose } from './harpySprite.ts';
import { TRAITS } from './fight.ts';
import { PREDATOR_ENTRIES } from './journal.ts';
import { PREDATORS } from './badges.ts';
import { generateStage } from './stageGenerator.ts';
import { generateAllLevels } from './worldsData.ts';
import { validateStage } from './levelCheck.ts';

const GROUND = 1000;
const mk = (over: Partial<Enemy> = {}): Enemy => ({
  id: 1, type: 'harpy', x: 400, y: GROUND - FEET.harpy, vx: 48, vy: 0, width: 48, height: 36, hp: 2, maxHp: 2, facing: 1,
  patrolMinX: 300, patrolMaxX: 600, attackCooldown: 0, telegraphTimer: 0, isAttacking: false, animTimer: 0,
  hitFlashTimer: 0, defeated: false, koTimer: 0, behaviorTimer: 0, ...over,
});

/** run a harpy with the player standing `gap` px in front of it (on the floor), recording what it did */
function run(secs: number, gap: number, over: Partial<Enemy> = {}) {
  const e = mk(over);
  const states: string[] = [];
  const hurtIn = new Map<string, number>();
  let minX = e.x, maxX = e.x, maxLift = 0, telegraphAt = -1, launchAt = -1, impactAt = -1;
  let shock: { reach: number; top: number; h: number } | null = null;
  for (let i = 0; i < secs * 30; i++) {
    const { hurt, ev } = stepPredator(e, { x: e.x + gap, y: GROUND }, 1 / 30);
    if (states[states.length - 1] !== e.state) states.push(e.state ?? '');
    if (ev.telegraph && telegraphAt < 0) telegraphAt = i;
    if (ev.launch && launchAt < 0) launchAt = i;
    if (ev.impact && impactAt < 0) impactAt = i;
    if (hurt.length > 1) hurtIn.set(e.state ?? '', (hurtIn.get(e.state ?? '') ?? 0) + 1);
    if (e.state === 'quake' && hurt.length > 1) shock = { reach: hurt[1].w / 2, top: hurt[1].y, h: hurt[1].h };
    minX = Math.min(minX, e.x); maxX = Math.max(maxX, e.x);
    maxLift = Math.max(maxLift, (e.groundY ?? e.y) - e.y);
    assert.ok(Number.isFinite(e.x) && Number.isFinite(e.y));
  }
  return { e, states, hurtIn, minX, maxX, maxLift, telegraphAt, launchAt, impactAt, shock };
}

test('the harpy crouches, slides, leaps, stomps, then stands dizzy before it walks again', () => {
  const r = run(7, 150);
  assert.deepEqual(r.states.slice(0, 6), ['crouch', 'slide', 'stomp', 'quake', 'recover', 'patrol']);
  assert.ok(r.maxLift > 30 && r.maxLift <= HARPY.hop + 1, `hop height ${r.maxLift}`);
});

test('it warns for over half a second before it slides, and the warning is a crouch with a "!"', () => {
  const r = run(4, 150);
  assert.ok(r.telegraphAt >= 0 && r.launchAt > r.telegraphAt);
  assert.ok((r.launchAt - r.telegraphAt) / 30 >= 0.55, `only ${(r.launchAt - r.telegraphAt) / 30}s of warning`);
});

test('the slide only hurts during the slide, the shockwave only during the quake, and a jump clears the shockwave', () => {
  const r = run(7, 150);
  assert.ok((r.hurtIn.get('slide') ?? 0) > 0 && (r.hurtIn.get('quake') ?? 0) > 0);
  for (const s of ['crouch', 'stomp', 'recover', 'patrol']) assert.equal(r.hurtIn.get(s) ?? 0, 0, `${s} must only hurt by touching`);
  assert.ok(r.shock, 'no shockwave box');
  assert.ok(r.shock!.h <= 16, 'the shockwave must be low enough to jump over');
  assert.ok(Math.abs(r.shock!.top + r.shock!.h - (GROUND + 1)) <= 2, 'it runs along the ground');
  assert.ok(r.shock!.reach <= HARPY.shockTo + 1);
  assert.ok(harpyShockReach(0) < harpyShockReach(HARPY.quake) && harpyShockReach(HARPY.quake) === HARPY.shockTo);
});

test('the stomp lands with an impact once, back on the ground, and the harpy stays on its own ground', () => {
  const r = run(7, 200);
  assert.ok(r.impactAt > r.launchAt);
  assert.ok(r.minX >= 300 - 20 && r.maxX <= 600 + 20 + PERSONALITY.harpy.reach, `wandered to ${r.minX}..${r.maxX}`);
  const settled = run(2.9, 150).e;
  assert.ok(settled.y === settled.groundY || settled.state === 'stomp');
});

test('it is dizzy long enough to hit, and rests before attacking again', () => {
  assert.ok(HARPY.dizzy >= 0.8);
  const e = mk();
  let recoverEnd = -1, nextCrouch = -1;
  for (let i = 0; i < 400 && nextCrouch < 0; i++) {
    stepPredator(e, { x: e.x + 150, y: GROUND }, 1 / 30);
    if (e.state === 'patrol' && recoverEnd < 0 && i > 60) recoverEnd = i;
    if (recoverEnd >= 0 && e.state === 'crouch') nextCrouch = i;
  }
  assert.ok(nextCrouch > recoverEnd, 'it never attacked a second time');
  assert.ok((nextCrouch - recoverEnd) / 30 >= 1.0, `only ${(nextCrouch - recoverEnd) / 30}s between attacks`);
});

test('a far-away harpy just patrols', () => {
  const r = run(20, 900);
  assert.deepEqual(r.states, ['patrol']);
});

test('every state and hit reaction has a drawn pose, and the journal, badges and fight table know the harpy', () => {
  for (const st of ['patrol', 'crouch', 'slide', 'stomp', 'quake', 'recover']) {
    for (const t of [0, 0.05, 0.2, 0.5]) for (const step of [0, 1]) assert.ok(HARPY_FRAMES[harpyPose(st, t, step)], `${st} @${t}`);
  }
  for (const h of ['hurt', 'dazed', 'defeated'] as const) assert.ok(HARPY_FRAMES[harpyPose('patrol', 0, 0, h)], h);
  assert.ok(PREDATORS.includes('harpy'));
  assert.equal(PREDATOR_ENTRIES.harpy.name, 'Night Harpy');
  assert.equal(TRAITS.harpy.stomp, true);
});

test('night harpies show up from World 6, never earlier, and only where there is room to slide and stomp', () => {
  let early = 0, late = 0;
  for (const l of generateAllLevels()) {
    if (l.id.endsWith('-10') || l.worldIndex === undefined) continue;
    const stage = generateStage(l);
    for (const e of stage.enemies) {
      if (e.type !== 'harpy') continue;
      if (l.worldIndex < 6) early++;
      else late++;
      assert.ok(e.patrolMaxX - e.patrolMinX >= 140, 'too short a patch');
    }
    if (l.worldIndex >= 6 && l.worldIndex <= 7 && Number(l.id.split('-')[1]) <= 3) assert.equal(validateStage(stage).ok, true, l.id);
  }
  assert.equal(early, 0);
  assert.ok(late > 0, 'no harpies anywhere');
});
