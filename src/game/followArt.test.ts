/**
 * followArt's painted poses (ART-W2A): the little ones waddle on two painted frames swapped by the ground they cover (no foot-slide),
 * paddle in their swim pose, hide in their Sad pose, are Happy at home; the heron looks up while it warns or sweeps. Every pose is drawn at
 * the Happy pose's scale, and every pose named here is a real, painted frame on the sheet.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FOLLOW_STRIDE, FOLLOWER_W, HERON_LOOK_W, followerPose, heronPose, lookInView, poseWidth } from './followArt.ts';
import { W2_FRAMES } from './w2PropsData.ts';
import { DRESS_NEW_FRAMES } from './dressNewData.ts';
import type { FollowKind } from './follow.ts';

const KINDS: FollowKind[] = ['duck', 'otter', 'capy'];
const walker = (kind: FollowKind, x: number) => ({ kind, x, state: 'follow' as const, paddle: false, back: false });

test('a walking little one swaps its two painted waddle frames once per stride of ground, never on the clock', () => {
  for (const kind of KINDS) {
    const seen: string[] = [];
    for (let x = 0; x < FOLLOW_STRIDE * 6; x += FOLLOW_STRIDE / 3) seen.push(followerPose(walker(kind, x)));
    const swaps = seen.filter((n, i) => i > 0 && n !== seen[i - 1]).length;
    assert.equal(swaps, 5, `${kind}: one swap per stride over six strides`);
    assert.deepEqual([...new Set(seen)].sort(), [`${kind}WalkA`, `${kind}WalkB`]);
    // (standing still holds its frame: the same x is the same pose, frame after frame)
    assert.equal(followerPose(walker(kind, 37)), followerPose(walker(kind, 37)));
    // (left of the world's 0 too: the parity never breaks into one frame)
    assert.notEqual(followerPose(walker(kind, -1)), followerPose(walker(kind, -1 - FOLLOW_STRIDE)));
  }
});

test('paddling, hiding after a spook and home each have their own painted pose', () => {
  for (const kind of KINDS) {
    assert.equal(followerPose({ ...walker(kind, 0), paddle: true }), `${kind}Paddle`);
    assert.equal(followerPose({ ...walker(kind, 0), state: 'spooked', back: true }), `${kind}Sad`);
    assert.match(followerPose({ ...walker(kind, 0), state: 'spooked', back: false }), /Walk[AB]$/, 'running back: it waddles');
    assert.equal(followerPose({ ...walker(kind, 0), state: 'home' }), `${kind}Happy`);
  }
});

test('every pose is drawn at its Happy pose\'s scale (the Happy pose at FOLLOWER_W), and every pose is on the sheet', () => {
  for (const kind of KINDS) {
    const happy = W2_FRAMES[`${kind}Happy`];
    assert.equal(poseWidth(kind, `${kind}Happy`), FOLLOWER_W);
    for (const n of [`${kind}WalkA`, `${kind}WalkB`, `${kind}Paddle`, `${kind}Sad`] as const) {
      const f = W2_FRAMES[n];
      assert.ok(f && f.w > 40 && f.h > 40, `${n} on w2-props`);
      assert.ok(Math.abs(poseWidth(kind, n) / f.w - FOLLOWER_W / happy.w) < 1e-9, `${n} at the Happy scale`);
    }
    // (a waddle frame stands about as tall as the Happy pose: within a fifth, so the line does not grow and shrink as it walks)
    for (const n of [`${kind}WalkA`, `${kind}WalkB`] as const) assert.ok(Math.abs(W2_FRAMES[n].h / happy.h - 1) < 0.2, `${n} height`);
  }
});

test('the heron looks up while it warns and while it sweeps, and is plain while calm', () => {
  assert.equal(heronPose({ s: { phase: 'calm' } as never }), 'w2Heron');
  assert.equal(heronPose({ s: { phase: 'warn' } as never }), 'w2HeronLook');
  assert.equal(heronPose({ s: { phase: 'pass' } as never }), 'w2HeronLook');
  const plain = DRESS_NEW_FRAMES.w2Heron, look = W2_FRAMES.w2HeronLook;
  // (an actor pose on w2-props with the little ones, never on a dressing sheet: every dressing piece must be in a dressing set)
  assert.ok(look && !('w2HeronLook' in DRESS_NEW_FRAMES), 'the looking heron is on w2-props, not a dressing sheet');
  // (drawn at w2Heron's px a unit: HERON_LOOK_W in w2Heron's sheet px is the registered frame's 336 px; packed at 0.72 of that, the
  // same shape, so the post and legs do not jump when it looks up)
  assert.ok(Math.abs((HERON_LOOK_W * plain.w) / plain.units - 336) < 0.5, 'drawn at w2Heron\'s scale');
  assert.ok(Math.abs(look.w / look.h - 336 / 586) < 0.005, 'packed at the registered frame\'s shape');
  assert.ok(Math.abs(look.w / 336 - 0.72) < 0.005, 'packed at 0.72 of it');
});

test("a heron in view that looks shows its gaze even while the place it looks is off screen (BUILD-23b: 2-3's first sweep began left of the view and the head-up heron stood with no gaze)", () => {
  const x0 = 5620, x1 = 6820;
  // (planted: the old rule drew the look only while its wash was in view: the first case went RED)
  assert.equal(lookInView({ lookX: 5464, foot: { x: 6290, b: 653 } }, x0, x1), true, 'heron in view, wash off the left edge: its gaze is drawn');
  assert.equal(lookInView({ lookX: 6000, foot: { x: 9000, b: 653 } }, x0, x1), true, 'wash in view, heron off screen: the wash is drawn');
  assert.equal(lookInView({ lookX: 3000, foot: { x: 9000, b: 653 } }, x0, x1), false, 'both off screen: nothing');
  assert.equal(lookInView({ lookX: null, foot: { x: 6290, b: 653 } }, x0, x1), false, 'calm: no look');
});
