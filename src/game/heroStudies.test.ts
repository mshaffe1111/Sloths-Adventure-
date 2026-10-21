import test from 'node:test';
import assert from 'node:assert/strict';
import { attackStage, flipStudy, hangStudy, studiesEnabled, studyPick, swingFrame, DEFAULT_STUDIES } from './heroStudies.ts';
import { STUDY_FRAMES } from './heroStudiesData.ts';

const idle = { isHurt: () => false, hurtUntil: 0 };
const player = (o: Record<string, unknown> = {}) =>
  ({ x: 0, y: 0, vx: 0, vy: 0, facing: 1, grounded: true, somersaultAngle: 0, attackType: 'none', ...o }) as never;

test('the action studies are always on', () => {
  assert.equal(DEFAULT_STUDIES, true);
  assert.equal(studiesEnabled(), true);
});

test('every study pose the game can ask for exists in the atlas', () => {
  const names = new Set<string>();
  for (let a = -1; a <= 1; a += 0.1) for (const w of [-3, 0, 3]) for (const f of [1, -1] as const) names.add(swingFrame(a, w, f));
  for (let u = 0; u <= 1; u += 0.05) names.add(flipStudy(u));
  for (const m of [true, false]) for (let t = 0; t < 2; t += 0.1) names.add(hangStudy(m, t));
  for (const c of [0, 0.5, 1]) for (const r of [0, 0.1, 0.4, 0.9, 1]) names.add(`stage${attackStage(c, r)}`);
  for (const n of names) if (!n.startsWith('stage')) assert.ok(STUDY_FRAMES[n], `${n} is in the atlas`);
  for (const n of ['s3_09', 's3_10', 's5_14', 's5_15']) assert.ok(STUDY_FRAMES[n]);
});

test('an attack runs wind-up, launch, impact, follow-through', () => {
  assert.equal(attackStage(0, 0), 0);
  assert.equal(attackStage(1, 0.1), 1);
  assert.equal(attackStage(0, 1), 2);
  assert.equal(attackStage(0, 0.5), 3);
});

test('a vine swing turns about the feet against the swing angle, and the ground poses are left to the main atlas', () => {
  const s = studyPick(player({ isVineSwinging: true, swingAngle: 0.6, swingAngularVelocity: 2 }), 0, idle);
  assert.equal(s?.mode, 'swing');
  assert.ok((s?.tilt ?? 0) < 0);
  assert.equal(studyPick(player(), 0, idle), null, 'standing is not a study pose');
  assert.equal(studyPick(player({ vx: 200 }), 0, idle), null, 'running is not a study pose');
});

test('the top of a jump and a mega punch pick studies', () => {
  assert.equal(studyPick(player({ grounded: false, vy: 0 }), 0, idle)?.name, 's5_15');
  assert.equal(studyPick(player({ grounded: false, vy: -400 }), 0, idle)?.name, 's5_14');
  const m = studyPick(player({ punching: true, attackType: 'mega', swingCock: 0, swingReach: 1 }), 0, idle);
  assert.ok(m?.name.startsWith('s4_'));
});
