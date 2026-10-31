import test from 'node:test';
import assert from 'node:assert/strict';
import { clipPick, edgeClip, flipU, nextAirRise, SMALL_HOP, MOVE_ORDER, moveFrame, footfallsBetween, heroClipsLive, isCalm, IDLE_CLIPS, moveIndex, RUN_FOOTFALLS } from './heroClips.ts';
import { HERO_CLIPS } from './heroClipsData.ts';
import type { PlayerState } from './types.ts';

const ev = { isHurt: () => false, isLanding: () => false, hurtUntil: 0 };
const still = { grounded: true, vx: 0, climbing: false, hanging: false, isVineSwinging: false, punching: false, kicking: false, ducking: false } as PlayerState;

test('clips: only standing quietly counts as calm', () => {
  assert.equal(isCalm(still, 1, ev), true);
  assert.equal(isCalm({ ...still, vx: 40 }, 1, ev), false);
  assert.equal(isCalm({ ...still, grounded: false }, 1, ev), false);
  assert.equal(isCalm({ ...still, climbing: true }, 1, ev), false);
  assert.equal(isCalm(still, 1, { ...ev, isHurt: () => true }), false);
});

test('clips: off by default, so the hero draws as before', () => {
  heroClipsLive(true);
  for (let t = 0; t < 20; t += 0.5) assert.equal(clipPick(still, t, ev), null);
  heroClipsLive(false);
});

test('clips: every sheet is cut at the standard hero size, feet inside the frame', () => {
  for (const [name, c] of Object.entries(HERO_CLIPS)) {
    assert.ok(c.n > (name.startsWith('move-') ? 4 : 8) && c.cols > 0 && c.fps > 0, name); // a strike sheet is a handful of hand-picked frames
    assert.ok(c.ax > 0 && c.ax < c.w && c.ay > c.h * 0.8 && c.ay <= c.h, `${name}: feet at ${c.ax},${c.ay} in ${c.w}x${c.h}`);
    assert.ok(c.h < 320, `${name}: ${c.h} px tall, the standing hero is 200`);
  }
  assert.ok(IDLE_CLIPS.some((n) => HERO_CLIPS[n]), 'at least one idle clip');
});

test('clips: at a ledge end he steps back once, then teeters in a loop; arriving already settled, he teeters at once (X-14)', () => {
  const all = () => true;
  const sb = HERO_CLIPS['step-back'];
  const te = HERO_CLIPS.teeter;
  assert.ok(sb && te, 'both sheets are cut');
  assert.deepEqual(edgeClip(0, true, all), { name: 'step-back', i: 0, blend: 0 });
  assert.equal(edgeClip((sb.n - 0.5) / sb.fps, true, all)?.name, 'step-back');
  const after = sb.n / sb.fps;
  assert.equal(edgeClip(after + 0.01, true, all)?.name, 'teeter');
  // the loop wraps
  assert.equal(edgeClip(after + te.n / te.fps + 0.01, true, all)?.i, 0);
  assert.equal(edgeClip(0.01, false, all)?.name, 'teeter');
  assert.equal(edgeClip(0.01, true, (n) => n !== 'step-back')?.name, 'teeter', 'no step-back sheet: straight to the teeter');
  assert.equal(edgeClip(5, true, () => false), null);
});

test('footsteps land on the run frames\' footfalls: three a loop, none twice, none when he stands still', () => {
  const loop = (Math.PI * 2) / 0.6; // walkCycle per turn of the 15-frame run sheet
  assert.equal(RUN_FOOTFALLS.length, 3);
  assert.equal(footfallsBetween(0, loop), 3, 'one loop passes each footfall once');
  assert.equal(footfallsBetween(0, loop * 10), 30);
  assert.equal(footfallsBetween(1, 1), 0, 'standing still: none');
  assert.equal(footfallsBetween(2, 1), 0, 'a reset cycle (a restart): none');
  // walked a tick at a time (a full run at 30 fps), the ticks add up to the whole: no footfall counted twice or skipped
  let c = 0;
  let k = 0;
  const d = (285 / 30) * 0.08;
  for (let i = 0; i < 300; i++) {
    k += footfallsBetween(c, c + d);
    c += d;
  }
  assert.equal(k, footfallsBetween(0, c));
  // at a full run (285 px/s) about 6.5 footfalls a second: every other one is the 3.3 a second Matt's calmer steps want
  assert.ok(Math.abs(k / 10 - 6.5) < 0.2, `${k / 10} a second`);
});

test('the painted flip runs through its sheet once, eased, and holds its last frame (AN-13)', () => {
  assert.equal(flipU(0), 0);
  assert.ok(flipU(Math.PI) > 0.49 && flipU(Math.PI) < 0.51);
  assert.ok(flipU(Math.PI * 0.2) < 0.1, 'a gentle start');
  assert.equal(flipU(Math.PI * 2), 0.999);
  assert.equal(flipU(40), 0.999, 'the engine may keep counting: the flip stays done');
  assert.equal(moveIndex(12, flipU(40)), 11);
});


test('the jab comes back from full reach through its own wind-up pose, and every reordered frame is on its sheet', () => {
  assert.deepEqual([0, 0.2, 0.35, 0.55, 0.7, 0.9].map((u) => moveFrame('move-jab', HERO_CLIPS['move-jab'].n, u)), [0, 1, 2, 3, 0, 5]);
  for (const [sheet, order] of Object.entries(MOVE_ORDER)) for (const i of order) assert.ok(i < HERO_CLIPS[sheet].n, `${sheet} frame ${i}`);
  assert.equal(moveFrame('move-cross', 7, 0.5), moveIndex(7, 0.5), 'a sheet with no order plays in its own');
});

test('a small hop (the vault over a trunk top, a step off a ledge) keeps the painted frames; a real jump gets the video leap', () => {
  const air = { grounded: false, climbing: false, hanging: false, isVineSwinging: false };
  let r = 0;
  for (const vy of [-190, -60, 30, 150]) r = nextAirRise(r, { ...air, vy });
  assert.ok(r > -SMALL_HOP, 'the vault hop stays small');
  r = 0;
  for (const vy of [-576, -400, 0, 300]) r = nextAirRise(r, { ...air, vy });
  assert.ok(r <= -SMALL_HOP, 'a jump is a jump all the way down');
  assert.equal(nextAirRise(-576, { ...air, grounded: true, vy: 0 }), 0, 'landing resets it');
});
