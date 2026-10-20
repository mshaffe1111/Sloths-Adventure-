import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CLIMB_CYCLE, DEFAULT_STANDARD, KICK_STAGES, MEGA_STAGES, PUNCH_STAGES, RUN_CYCLE, WALK_CYCLE, WALK_MAX,
  standardEnabled, stdAirFrame, stdAlias, stdFlipFrame, stdHangFrame, stdPick, stdPunchFrame, stdSwingFrame, stdUi,
} from './heroStandard.ts';
import { STD_FRAMES, STD_STAND_H } from './heroStandardData.ts';
import { HERO_FRAMES } from './heroAtlasData.ts';

const calm = { isHurt: () => false, isLanding: () => false, hurtUntil: 0 };
const player = (o: Record<string, unknown> = {}) =>
  ({ x: 0, y: 0, vx: 0, vy: 0, facing: 1, grounded: true, somersaultAngle: 0, attackType: 'none', walkCycle: 0, ...o }) as never;

test('the standard hero is off unless switched on', () => {
  assert.equal(DEFAULT_STANDARD, false);
  assert.equal(standardEnabled(), false);
  assert.equal(stdUi('idle_a'), null, 'the menus keep the main hero while it is off');
});

test('every frame the loops and stages name is in the atlas', () => {
  for (const n of [...WALK_CYCLE, ...RUN_CYCLE, ...CLIMB_CYCLE, ...KICK_STAGES, ...MEGA_STAGES, ...PUNCH_STAGES, 'idle', 'blink', 'duck', 'land', 'tuck', 'hurt_a', 'hurt_b', 'hurt_c']) {
    assert.ok(STD_FRAMES[n], `${n} is in the atlas`);
  }
  for (let vy = -800; vy <= 1000; vy += 20) assert.ok(STD_FRAMES[stdAirFrame(vy)], `air frame at vy ${vy}`);
  for (let u = 0; u <= 1; u += 0.05) assert.ok(STD_FRAMES[stdFlipFrame(u)], `flip frame at ${u}`);
  for (let r = 0; r <= 1; r += 0.05) assert.ok(STD_FRAMES[stdPunchFrame(r)], `punch frame at reach ${r}`);
  for (let a = -1.2; a <= 1.2; a += 0.1) for (const w of [-3, 0, 3]) for (const f of [1, -1] as const) assert.ok(STD_FRAMES[stdSwingFrame(a, w, f)]);
  for (const m of [true, false]) for (let t = 0; t < 2; t += 0.1) assert.ok(STD_FRAMES[stdHangFrame(m, t)]);
});

test('every state the hero can be in draws a frame that exists', () => {
  const states: Record<string, unknown>[] = [
    {}, { vx: 40 }, { vx: WALK_MAX }, { vx: 285 }, { vx: 285, walkCycle: 3.3 }, { ducking: true }, { grounded: false, vy: -600 }, { grounded: false, vy: 0 }, { grounded: false, vy: 900 },
    { grounded: false, isDoubleJumping: true, somersaultAngle: 3 }, { climbing: true, y: -57 }, { climbing: true, y: 83 }, { hanging: true }, { hanging: true, vx: 100 },
    { isVineSwinging: true, swingAngle: 0.7, swingAngularVelocity: 2 }, { punching: true, attackType: 'punch', swingReach: 0.6 }, { punching: true, attackType: 'mega', swingReach: 1, swingCock: 0 },
    { kicking: true, attackType: 'kick', swingReach: 0.2, swingCock: 0.8 },
  ];
  for (const s of states) {
    const c = stdPick(player(s), 1, calm);
    assert.ok(c, `a pose for ${JSON.stringify(s)}`);
    assert.ok(STD_FRAMES[c.name], `${c.name} is in the atlas`);
  }
  const hurt = stdPick(player(), 1, { isHurt: () => true, isLanding: () => false, hurtUntil: 1.2 });
  assert.ok(hurt && STD_FRAMES[hurt.name]);
  const land = stdPick(player(), 1, { isHurt: () => false, isLanding: () => true, hurtUntil: 0 });
  assert.equal(land?.name, 'land');
});

test('he walks slowly and runs fast, and stands still with a blink', () => {
  assert.ok(WALK_CYCLE.includes(stdPick(player({ vx: WALK_MAX - 10 }), 1, calm)!.name));
  assert.ok(RUN_CYCLE.includes(stdPick(player({ vx: WALK_MAX + 10 }), 1, calm)!.name));
  assert.equal(stdPick(player(), 1, calm)!.name, 'idle');
  assert.equal(stdPick(player(), 3.5, calm)!.name, 'blink');
});

test('the run cycle steps through all of its frames as the stride turns', () => {
  const seen = new Set<string>();
  for (let wc = 0; wc < 12; wc += 0.1) seen.add(stdPick(player({ vx: 285, walkCycle: wc }), 1, calm)!.name);
  assert.equal(seen.size, RUN_CYCLE.length);
});

test('the flip tucks in the middle and the vine swing turns the body about the feet', () => {
  assert.equal(stdFlipFrame(0.5), 'tuck');
  const c = stdPick(player({ grounded: false, isDoubleJumping: true, somersaultAngle: 3 }), 1, calm)!;
  assert.equal(c.centred, true);
  assert.ok(typeof c.rot === 'number' && c.rot !== 0);
  const s = stdPick(player({ isVineSwinging: true, swingAngle: 0.6, swingAngularVelocity: 2 }), 1, calm)!;
  assert.ok((s.swing ?? 0) < 0);
});

test('the story scenes and menus keep working: every old name either has a standard frame or is left to the main atlas', () => {
  for (const n of ['face_happy', 'face_calm', 'face_wink', 'face_cheer', 'face_surprised', 'face_hurt', 'face_calm_closed']) assert.ok(stdAlias(n), `${n} has a portrait`);
  for (const n of ['idle_a', 'idle_blink', 'jump_up', 'fall', 'hurt', 'land', 'duck', 'guard', 'punch_rec', 'punch_2', 'punch_3', 'punch_4', 'punch_5', 'kick', 'mega', 'climb_a', 'climb_d', 'run_a', 'run_j']) {
    assert.ok(stdAlias(n), `${n} has a standard frame`);
  }
  assert.equal(stdAlias('no_such_pose'), undefined);
  // the names the old atlas has that the standard set does not replace are a short list, not a hole
  const left = Object.keys(HERO_FRAMES).filter((n) => !stdAlias(n));
  assert.ok(left.length <= 4, `old names with no standard frame: ${left.join(', ')}`);
});

test('the standing frame is measured, and every frame is a sensible size', () => {
  assert.ok(STD_STAND_H > 200 && STD_STAND_H < 280);
  for (const [n, f] of Object.entries(STD_FRAMES)) {
    assert.ok(f.w > 40 && f.h > 40, `${n} has a size`);
    assert.ok(f.ax > 0 && f.ax < f.w && f.ay > 0 && f.ay <= f.h, `${n} has its feet inside the frame`);
  }
});
