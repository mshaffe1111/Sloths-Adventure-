/**
 * BUILD-17 Step 0 (the lead's redo 2 of ENG-E2): hanging moss hides him only if the cast is told he is HOLDING while he hangs on a rope.
 * The cast's hero record (engine.ts stepCast) counted climbing and swinging as holding, never hanging, so stillness.ts inCover's hanging
 * rule (`p.holding && ...`) was never met in the game: the real page printed hanging true, calmNow 0 under the drape (BUILD-17 shots).
 * Planted: with `|| p.hanging` taken out of h.holding, or the hanging creep taken out of stillness.ts moving, this test goes red.
 */
import './headlessDom.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeEngine, step } from './engineCoreHarness.ts';
import { HAND_REACH, ropeYAt } from './rope.ts';

test('hanging still on a rope under hanging moss, the moss comes over him (calmNow rises); on the same rope with no moss it does not', () => {
  for (const moss of [true, false]) {
    const { e } = makeEngine('1-3', 'normal', 1);
    const r = e.ropes[0];
    assert.ok(r, "1-3 lays its shimmy rope");
    const mid = r.x0 + 140;
    e.skills.add('shimmy');
    e.proto.bushes = moss ? [{ x: mid - 86, w: 173, y: r.y + 4, kind: 'mossHang', hanging: true }] : [];
    e.proto.cast = { kinds: [], traps: [] };
    e.startCast();
    const p = e.player;
    e.input.state.up = true;
    for (let i = 0; i < 20 && !p.hanging; i++) {
      p.x = mid; p.y = ropeYAt(r, mid) + HAND_REACH + 4; p.vx = 0; p.vy = 0; p.grounded = false;
      step(e, 1);
    }
    assert.ok(p.hanging, 'he hangs on the rope');
    e.input.state.up = false;
    step(e, 45);
    assert.ok(p.hanging, 'still hanging');
    const calm = e.cast.calmNow(false);
    if (moss) assert.ok(calm > 0.9, `hanging still in the hanging moss, it is over him: calmNow ${calm}`);
    else assert.equal(calm, 0, 'no moss on the rope: no cover');
    if (!moss) continue;
    // (creeping along the rope inside the moss is moving: the moss goes off him; still again, it comes back)
    e.input.state.right = true;
    step(e, 4);
    assert.ok(p.hanging && Math.abs(p.vx) > 25, `he creeps along the rope (vx ${p.vx})`);
    assert.equal(e.cast.calmNow(false), 0, 'creeping in the moss: not hidden');
    e.input.state.right = false;
    step(e, 30);
    assert.ok(e.cast.calmNow(false) > 0.9, 'still again in the moss: hidden');
  }
});
