/**
 * followArt's painted poses (ART-W2A): the little ones waddle on two painted frames swapped by the ground they cover (no foot-slide),
 * paddle in their swim pose, hide in their Sad pose, are Happy at home; the heron looks up while it warns or sweeps. Every pose is drawn at
 * the Happy pose's scale, and every pose named here is a real, painted frame on the sheet.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FOLLOW_STRIDE, FOLLOWER_W, followerPose, heronPose, poseWidth } from './followArt.ts';
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
  const plain = DRESS_NEW_FRAMES.w2Heron, look = DRESS_NEW_FRAMES.w2HeronLook;
  assert.ok(look && look.world === 2, 'the looking heron is on World 2\'s dressing sheet');
  // (drawn at the plain heron's scale: units per sheet px equal, so the post and legs do not jump when it looks up)
  // (units are stored to 2 decimals: 1e-4 a sheet px is under 0.06 units over the whole 586 px frame)
  assert.ok(Math.abs(look.units / look.w - plain.units / plain.w) < 1e-4);
});
