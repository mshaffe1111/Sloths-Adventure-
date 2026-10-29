import test from 'node:test';
import assert from 'node:assert/strict';
import { CARD_SAFE, DONE_LESSONS, LESSONS, cardSafe, lessonDone, lessonOfLine, lessonStale, pickLesson, type CardSafety, type LessonId, type LessonScene } from './lessons.ts';
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
  assert.equal(pickLesson({ ...col('heart'), hp: 4, maxHp: 5 }, none), 'heart');
  assert.equal(pickLesson(col('cage'), none), 'cage');
  assert.equal(pickLesson(col('relic'), none), 'idol');
  assert.equal(pickLesson(col('powerup_magnet'), none), 'power');
  assert.equal(pickLesson(col('exit_totem'), none), 'shrine');
  assert.equal(pickLesson(scene({ collectibles: [{ type: 'fruit', x: 1150, y: 480, collected: true }] }), none), null, 'already taken');
  const both = scene({ collectibles: [{ type: 'fruit', x: 1100, y: 480, collected: false }, { type: 'cage', x: 1200, y: 480, collected: false }] });
  assert.equal(pickLesson(both, none), 'cage');
  // the checkpoint card comes on the flag, once he has run past it, not 340 px before it (it used to open mid-climb on a ladder)
  assert.equal(pickLesson(scene({ checkpoints: [{ x: 1200, y: 500 }] }), none), null, 'not on the way to the flag');
  assert.equal(pickLesson(scene({ checkpoints: [{ x: 1040, y: 500, reached: true }] }), none), 'checkpoint');
});

test('every lesson has words for all three kinds of controls, and what has been shown stays on the device', () => {
  for (const l of Object.values(LESSONS)) {
    assert.ok(l.title && l.intro, l.id);
    for (const m of ['screen', 'pad', 'keys'] as const) assert.ok(l.lines[m].length > 0, `${l.id} ${m}`);
  }
  assert.ok(!isSaveKey('sloth_lessons'), 'a New Game must not bring the lessons back');
  assert.ok(!isSaveKey('sloth_coach_done'));
  assert.ok(!isSaveKey('sloth_hint_v3'));
});

test('a card only opens when stopping cannot hurt him: standing or holding on, not hurt, no foe at hand, nothing falling', () => {
  const ok: CardSafety = { grounded: true, holding: false, hurt: false, foeDx: Infinity, foeDy: Infinity, hazard: Infinity };
  assert.equal(cardSafe(ok), true, 'standing still in the open');
  assert.equal(cardSafe({ ...ok, grounded: false, holding: true }), true, 'holding a trunk, a ladder or a rope');
  // the play-testers' cases (2026-10-25): mid-glide or mid-jump, mid-vault off a ladder, a snake already touching him, just hit
  assert.equal(cardSafe({ ...ok, grounded: false }), false, 'in the air');
  assert.equal(cardSafe({ ...ok, foeDx: 40, foeDy: 0 }), false, 'a snake at his feet');
  assert.equal(cardSafe({ ...ok, foeDx: -CARD_SAFE.foeDx + 10, foeDy: 20 }), false, 'a foe just behind him');
  assert.equal(cardSafe({ ...ok, foeDx: 60, foeDy: 400 }), true, 'a foe on a ledge far below is not at hand');
  assert.equal(cardSafe({ ...ok, foeDx: 400, foeDy: 0 }), true, 'a foe far ahead: the foe card itself can open');
  assert.equal(cardSafe({ ...ok, hurt: true }), false, 'still blinking from a hit');
  assert.equal(cardSafe({ ...ok, hazard: 0 }), false, 'a rock coming down, or a branch crumbling under him');
});

test('the heart card says what really happens: a heart is for when you are hurt', () => {
  const h = LESSONS.heart;
  assert.ok(/hurt/i.test(h.intro) && /full health/i.test(h.intro), h.intro);
  assert.ok(!h.lines.screen.some((l) => /just touch it/i.test(l.how)), 'not "Just touch it": at full health it cannot be picked up');
});

test('the heart lesson only when he is hurt: at 5 of 5 hearts it waits for the next heart after a hit (QA 2026-10-29, 1-7 and 3-1)', () => {
  const heart = (hp?: number, maxHp?: number) => scene({ collectibles: [{ type: 'heart', x: 1150, y: 480, collected: false }], hp, maxHp });
  assert.equal(pickLesson(heart(5, 5), none), null, 'full health: not said');
  assert.equal(pickLesson(heart(), none), null, 'hearts unknown: taken as full health');
  assert.equal(pickLesson(heart(4, 5), none), 'heart', 'hurt and near a heart');
  assert.equal(pickLesson(scene({ collectibles: [{ type: 'super_heart', x: 1150, y: 480, collected: false }], hp: 1, maxHp: 3 }), none), 'heart');
  assert.equal(pickLesson(scene({ hp: 1, maxHp: 5 }), none), null, 'hurt but no heart near');
  // a heart's lesson picked while he was hurt is stale once he is back to full health (the engine's waiting card, the guide's queue)
  const st = { enemies: [], collectibles: [], hp: 5, maxHp: 5 };
  assert.equal(lessonStale('heart', st), true);
  assert.equal(lessonStale('heart', { ...st, hp: 3 }), false);
});

test('a lesson whose thing he has done already is not said: 5 flowers picked, no "Run through flowers" (QA 2026-10-29, 2-2)', () => {
  const flowers = [
    ...[0, 1, 2, 3, 4].map((i) => ({ type: 'flower', x: 700 + i * 40, y: 480, collected: true })),
    { type: 'flower', x: 1150, y: 480, collected: false },
  ];
  assert.equal(pickLesson(scene({ collectibles: flowers }), none), null);
  assert.equal(pickLesson(scene({ collectibles: flowers.slice(5) }), none), 'fruit', 'none picked yet: taught');
  // each done-check, on what it is about
  const got = (type: string) => ({ enemies: [], collectibles: [{ type, collected: true }] });
  const beat = (type: string) => ({ enemies: [{ type, defeated: true }], collectibles: [] });
  assert.equal(lessonDone('fruit', got('leaf')), true);
  assert.equal(lessonDone('heart', got('heart')), true);
  assert.equal(lessonDone('cage', got('cage')), true);
  assert.equal(lessonDone('idol', got('relic')), true);
  assert.equal(lessonDone('power', got('powerup_speed')), true);
  assert.equal(lessonDone('foe', beat('snake')), true);
  assert.equal(lessonDone('foe', beat('boss')), false, 'a boss has its own introduction');
  assert.equal(lessonDone('eagle', beat('eagle')), true);
  assert.equal(lessonDone('eagle', beat('snake')), false);
  assert.equal(lessonDone('nostomp', beat('spider')), true);
  assert.equal(lessonDone('tough', beat('jaguar')), true);
  assert.equal(lessonDone('fruit', got('heart')), false);
  assert.equal(lessonDone('gap', got('flower')), false, 'a move lesson closes on its move, in the guide');
  for (const id of DONE_LESSONS) assert.ok(id in LESSONS, id);
  // a foe already beaten: the foe lesson for the next one is not said
  assert.equal(pickLesson(scene({ enemies: [{ type: 'snake', x: 600, y: 500, defeated: true }, { type: 'snake', x: 1200, y: 500, defeated: false }] }), none), null);
  assert.equal(lessonOfLine({ key: 'lesson:fruit:0', source: 'lesson' }), 'fruit');
  assert.equal(lessonOfLine({ key: 'lesson:fruit:0', source: 'engine' }), null);
});
