import test from 'node:test';
import assert from 'node:assert/strict';
import { clipPick, heroClipsLive, isCalm, IDLE_CLIPS } from './heroClips.ts';
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
