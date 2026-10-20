import test from 'node:test';
import assert from 'node:assert/strict';
import { LESSONS, pickLesson, type LessonId, type LessonScene } from './lessons.ts';
import { isSaveKey } from './saveFile.ts';

const none: ReadonlySet<LessonId> = new Set();
const scene = (o: Partial<LessonScene> = {}): LessonScene => ({
  px: 1000,
  py: 500,
  view: { x0: 700, x1: 1400, y0: 100, y1: 700 },
  enemies: [],
  collectibles: [],
  vines: [],
  platforms: [],
  checkpoints: [],
  rivers: [],
  ...o,
});

test('nothing close, nothing to say', () => {
  assert.equal(pickLesson(scene(), none), null);
});

test('the first foe gets the fighting lesson, whatever it is', () => {
  for (const type of ['snake', 'eagle', 'spider', 'jaguar']) {
    assert.equal(pickLesson(scene({ enemies: [{ type, x: 1300, y: 490, defeated: false }] }), none), 'foe', type);
  }
});

test('a foe far off screen, behind a wall of distance, or already beaten is not "here"', () => {
  assert.equal(pickLesson(scene({ enemies: [{ type: 'snake', x: 1900, y: 500, defeated: false }] }), none), null);
  assert.equal(pickLesson(scene({ enemies: [{ type: 'snake', x: 1200, y: 500, defeated: true }] }), none), null);
  assert.equal(pickLesson(scene({ enemies: [{ type: 'boss', x: 1200, y: 500, defeated: false }] }), none), null, 'a boss has its own introduction');
});

test('after the fighting lesson, each new kind of foe teaches its own thing once', () => {
  const seen = new Set<LessonId>(['foe']);
  assert.equal(pickLesson(scene({ enemies: [{ type: 'eagle', x: 1200, y: 400, defeated: false }] }), seen), 'eagle');
  assert.equal(pickLesson(scene({ enemies: [{ type: 'spider', x: 1200, y: 500, defeated: false }] }), seen), 'nostomp');
  assert.equal(pickLesson(scene({ enemies: [{ type: 'caiman', x: 1200, y: 500, defeated: false }] }), seen), 'tough');
  assert.equal(pickLesson(scene({ enemies: [{ type: 'snake', x: 1200, y: 500, defeated: false }] }), seen), null);
  seen.add('eagle');
  assert.equal(pickLesson(scene({ enemies: [{ type: 'eagle', x: 1200, y: 400, defeated: false }] }), seen), null, 'never twice');
});

test('a trunk to climb, a vine to swing on, and the special platforms each get their lesson', () => {
  assert.equal(pickLesson(scene({ vines: [{ x: 1100, topY: 200, bottomY: 540, vineType: 'tree_climb' }] }), none), 'climb');
  assert.equal(pickLesson(scene({ vines: [{ x: 1250, topY: 150, bottomY: 450, vineType: 'swing_liana' }] }), none), 'swing');
  const plat = (type: string) => scene({ platforms: [{ x: 1150, y: 520, width: 120, type }] });
  assert.equal(pickLesson(plat('bouncy'), none), 'bounce');
  assert.equal(pickLesson(plat('fragile'), none), 'crumble');
  assert.equal(pickLesson(plat('moving'), none), 'moving');
  assert.equal(pickLesson(plat('solid'), none), null);
});

test('a gap in the ground ahead gets its lesson, but a step or a join does not', () => {
  const ground = (x: number, w: number) => ({ x, y: 520, width: w, type: 'solid' });
  assert.equal(pickLesson(scene({ platforms: [ground(600, 600), ground(1340, 400)] }), none), 'gap');
  assert.equal(pickLesson(scene({ platforms: [ground(600, 600), ground(1200, 400)] }), none), null, 'ground that joins');
  assert.equal(pickLesson(scene({ platforms: [ground(600, 300), ground(1500, 400)] }), none), null, 'the gap is behind him or too far to matter yet');
});

test('pick-ups and the exit: one lesson each, the cage before the fruit beside it', () => {
  const col = (type: string) => scene({ collectibles: [{ type, x: 1150, y: 480, collected: false }] });
  assert.equal(pickLesson(col('fruit'), none), 'fruit');
  assert.equal(pickLesson(col('heart'), none), 'heart');
  assert.equal(pickLesson(col('cage'), none), 'cage');
  assert.equal(pickLesson(col('relic'), none), 'idol');
  assert.equal(pickLesson(col('powerup_magnet'), none), 'power');
  assert.equal(pickLesson(col('exit_totem'), none), 'shrine');
  assert.equal(pickLesson(scene({ collectibles: [{ type: 'fruit', x: 1150, y: 480, collected: true }] }), none), null, 'already taken');
  const both = scene({ collectibles: [{ type: 'fruit', x: 1100, y: 480, collected: false }, { type: 'cage', x: 1200, y: 480, collected: false }] });
  assert.equal(pickLesson(both, none), 'cage');
  assert.equal(pickLesson(scene({ checkpoints: [{ x: 1200, y: 500 }] }), none), 'checkpoint');
});

test('every lesson has words for all three kinds of controls, and what has been shown is part of the save', () => {
  for (const l of Object.values(LESSONS)) {
    assert.ok(l.title && l.intro, l.id);
    for (const m of ['screen', 'pad', 'keys'] as const) assert.ok(l.lines[m].length > 0, `${l.id} ${m}`);
  }
  assert.ok(isSaveKey('sloth_lessons'), 'a New Game clears it, a save file carries it');
});
