import test from 'node:test';
import assert from 'node:assert/strict';
import {
  AIR_KICK_STAGES, AIR_PUNCH_STAGES, CLIMB_CYCLE, DEFAULT_STANDARD, KICK_STAGES, MEGA_STAGES, PUNCH_STAGES, RUN_CYCLE, WALK_CYCLE, WALK_MAX,
  standardEnabled, stdAirFrame, stdAlias, stdBounceFrame, stdDiveFrame, stdFlip, stdHangFrame, stdPick, stdPunchFrame, stdSwingFrame, stdUi,
} from './heroStandard.ts';
import { STD_FRAMES, STD_STAND_H } from './heroStandardData.ts';
import { HERO_FRAMES } from './heroAtlasData.ts';

const calm = { isHurt: () => false, isLanding: () => false, hurtUntil: 0 };
const player = (o: Record<string, unknown> = {}) =>
  ({ x: 0, y: 0, vx: 0, vy: 0, facing: 1, grounded: true, somersaultAngle: 0, attackType: 'none', walkCycle: 0, ...o }) as never;

test('the standard hero is the hero unless a debugging session turns it off', () => {
  assert.equal(DEFAULT_STANDARD, true);
  assert.equal(standardEnabled(), true);
  assert.ok(stdUi('idle_a'), 'the menus draw the standard frames');
});

test('every frame the loops and stages name is in the atlas', () => {
  for (const n of [...WALK_CYCLE, ...RUN_CYCLE, ...CLIMB_CYCLE, ...KICK_STAGES, ...MEGA_STAGES, ...PUNCH_STAGES, ...AIR_PUNCH_STAGES, ...AIR_KICK_STAGES, 'idle', 'blink', 'duck', 'land', 'tuck', 'hurt_a', 'hurt_b', 'hurt_c']) {
    assert.ok(STD_FRAMES[n], `${n} is in the atlas`);
  }
  for (let vy = -800; vy <= 1000; vy += 20) assert.ok(STD_FRAMES[stdAirFrame(vy)], `air frame at vy ${vy}`);
  for (let u = 0; u <= 1; u += 0.05) assert.ok(STD_FRAMES[stdFlip(u * Math.PI * 2, u).name], `flip frame at ${u}`);
  for (let vy = 0; vy <= 1000; vy += 50) assert.ok(STD_FRAMES[stdDiveFrame(vy)], `dive frame at vy ${vy}`);
  for (const k of ['stomp', 'big', 'spring'] as const) {
    for (let t = 0; t < 1.7; t += 0.02) {
      for (let vy = -900; vy <= 900; vy += 30) {
        const b = stdBounceFrame(k, t, vy);
        if (b) assert.ok(STD_FRAMES[b], `${k} bounce frame ${b} at t ${t} vy ${vy}`);
      }
    }
  }
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
    { grounded: false, punching: true, attackType: 'punch', swingReach: 0.9, swingCock: 0 }, { grounded: false, kicking: true, attackType: 'kick', swingReach: 0.9, swingCock: 0 },
    { grounded: false, vy: 100, diving: true }, { grounded: false, vy: 700, diving: true },
    { grounded: false, vy: -500, bounce: { kind: 'stomp', t: 0.2 } }, { grounded: false, vy: -700, bounce: { kind: 'big', t: 0.2 } }, { grounded: false, vy: -830, bounce: { kind: 'spring', t: 0 } },
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
  // the hardest drop squashes deep, lands and recovers (AN-13; it used to roll out in the somersault frame)
  const hard = (u: number) => stdPick(player(), 1, { isHurt: () => false, isLanding: () => true, isHardLanding: () => true, landPhase: () => u, hurtUntil: 0 })?.name;
  assert.deepEqual([hard(0), hard(0.5), hard(0.9)], ['spring_squash', 'land', 'recover']);
  const soft = (u: number) => stdPick(player(), 1, { isHurt: () => false, isLanding: () => true, landPhase: () => u, hurtUntil: 0 })?.name;
  assert.deepEqual([soft(0), soft(0.8)], ['land', 'recover']);
});

test('the turn faces us squeezed and opens out, then his new side view settles; a skid faces the way he slides (AN-13)', () => {
  const ev = (o: object) => ({ isHurt: () => false, isLanding: () => false, hurtUntil: 0, ...o });
  const t0 = stdPick(player(), 1, ev({ turnPhase: () => 0 }));
  assert.equal(t0?.name, 'turn');
  assert.ok(Math.abs((t0?.sx ?? 1) - 0.55) < 1e-9, 'squeezed to 55% across (15% showed as a sliver for a whole frame)');
  assert.notEqual(stdPick(player(), 1, ev({ turnPhase: () => 0.8 }))?.name, 'turn');
  const sk = stdPick(player(), 1, ev({ isSkidding: () => true, skidDir: -1 }));
  assert.equal(sk?.name, 'skid');
  assert.equal(sk?.face, -1);
  assert.ok(STD_FRAMES.turn && STD_FRAMES.skid);
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
  // the painted roll: curled, the somersault, upside down, curled, opening out; the code only turns him what the paint leaves over
  const names = [0.3, 1.5, 3.2, 5.0, 5.9].map((a) => stdFlip(a, 0.5).name);
  assert.deepEqual(names, ['tuck', 'tumble', 'flip_inv', 'tuck', 'fall_a']);
  for (let a = 0; a <= Math.PI * 2; a += 0.05) assert.ok(Math.abs(stdFlip(a, 0.5).rot) < 1.6, `at most ~90 degrees of code turn at ${a}`);
  for (const a of [0.3, 1.5, 3.2, 5.0]) assert.equal(stdFlip(-a, 0.5).rot, -stdFlip(a, 0.5).rot, 'turned the way he turns');
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
  assert.ok(STD_STAND_H > 150 && STD_STAND_H < 280);
  for (const [n, f] of Object.entries(STD_FRAMES)) {
    assert.ok(f.w > 40 && f.h > 40, `${n} has a size`);
    assert.ok(f.ax > 0 && f.ax < f.w && f.ay > 0 && f.ay <= f.h, `${n} has its feet inside the frame`);
  }
});

test('the air attacks, the stomp dive and the bounces each get their own poses', () => {
  const pick = (o: Record<string, unknown>) => stdPick(player({ grounded: false, ...o }), 1, calm)?.name;
  // an attack in the air uses the air frames, on the ground the ground ones
  assert.equal(pick({ kicking: true, attackType: 'kick', swingReach: 1, swingCock: 0 }), 'air_kick_1');
  assert.equal(stdPick(player({ kicking: true, attackType: 'kick', swingReach: 1, swingCock: 0 }), 1, calm)?.name, KICK_STAGES[2]);
  assert.equal(pick({ punching: true, attackType: 'punch', swingReach: 0 }), 'air_punch_0');
  assert.equal(pick({ punching: true, attackType: 'punch', swingReach: 0.5, swingCock: 0 }), 'air_punch_2');
  // holding down while falling: curled, then feet first
  assert.equal(pick({ vy: 100, diving: true }), 'stomp_start');
  assert.equal(pick({ vy: 700, diving: true }), 'stomp_plunge');
  // landing on an animal: squash, then the rise, then the top; a dive rebounds harder
  assert.equal(stdBounceFrame('stomp', 0.02, -460), 'bounce_squash');
  assert.equal(stdBounceFrame('stomp', 0.3, -400), 'bounce_rise');
  assert.equal(stdBounceFrame('stomp', 0.6, 0), 'bounce_top');
  assert.equal(stdBounceFrame('stomp', 0.9, 300), null, 'the fall goes back to the ordinary jump frames');
  assert.equal(stdBounceFrame('big', 0.02, -700), 'stomp_impact');
  assert.equal(stdBounceFrame('big', 0.3, -600), 'stomp_rebound');
  // a mushroom
  assert.equal(stdBounceFrame('spring', 0.01, -830), 'spring_squash');
  assert.equal(stdBounceFrame('spring', 0.2, -700), 'spring_launch');
  assert.equal(stdBounceFrame('spring', 0.5, -200), 'spring_rise');
  assert.equal(stdBounceFrame('spring', 0.8, 0), null);
  // a dive wins over a bounce still in progress, and the painted squash frames carry their own squash
  assert.equal(pick({ vy: 400, diving: true, bounce: { kind: 'stomp', t: 0.4 } }), 'stomp_plunge');
  assert.ok((stdPick(player({ grounded: false, vy: -500, bounce: { kind: 'stomp', t: 0.2 } }), 1, calm)?.squash ?? 1) < 1);
});
