/**
 * 8-2 Night Blooms, fair for a Normal first-timer (w8-rope2, 2026-11-01). Each rule here failed on release-0.9.2's 8-2:
 *   - the fungus stairs' steps were thin brackets with nothing under them (a hop that fell short went under the next step and into the
 *     void: 5-15 lives on layout 2);
 *   - a stair's foot bough was shorter than a running jump off the top, with the deep gap to the next section right after it.
 */
import '../../headlessDom.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { generateAllLevels } from '../../worldsData.ts';
import { buildGen2ForGame } from '../game.ts';
import { TRUNK_ID, TRUNK_UNDER } from './w8.ts';

const cfg = generateAllLevels().find((c) => c.id === '8-2')!;
const rolls = (difficulty: 'normal' | 'easy') => Array.from({ length: 16 }, (_, v) => buildGen2ForGame(cfg, difficulty, v));
const normal = rolls('normal');

test('8-2: no fungus step floats over the void: each stands on a trunk to the ground', () => {
  let stairs = 0;
  for (const [v, st] of [...normal.entries(), ...rolls('easy').entries()]) {
    const secs = (st.gen2?.sections ?? []).filter((s) => /^w8-fungus-/.test(s.template));
    for (const s of secs) {
      const steps = st.platforms.filter((p) => p.id < TRUNK_ID && p.height <= 30 && p.x >= s.x0 - 2 && p.x + p.width <= s.x1 + 2);
      for (const p of steps) {
        stairs++;
        const under = st.platforms.find((q) => q.id >= TRUNK_ID && Math.abs(q.x - p.x) < 1 && Math.abs(q.y - (p.y + TRUNK_UNDER)) < 1);
        assert.ok(under && under.height > 150, `layout ${v}, ${s.template}: the step at x ${p.x} has a trunk under it`);
      }
    }
  }
  assert.ok(stairs > 50, `${stairs} steps checked`);
});

test("8-2: past a fungus stair's foot comes a knot (a step up), not the deep gap to the next section", () => {
  for (const [v, st] of normal.entries()) {
    // (a mirrored stair is climbed down from its top: no jump off the top onto the foot)
    for (const s of (st.gen2?.sections ?? []).filter((q) => (q.template === 'w8-fungus-blooms' || q.template === 'w8-fungus-tall') && !(q as { mirrored?: boolean }).mirrored)) {
      // the section's last three grounds: the foot, the knot, the end
      const ground = st.platforms.filter((p) => p.id < TRUNK_ID && p.height > 30 && p.x >= s.x0 - 2 && p.x + p.width <= s.x1 + 2).sort((a, b) => a.x - b.x);
      const [foot, knot, end] = ground.slice(-3);
      assert.ok(knot.y < foot.y - 20 && Math.abs(knot.x - (foot.x + foot.width)) < 2, `layout ${v}, ${s.template} at ${s.x0}: a knot right past the foot`);
      assert.ok(end.y > knot.y, `layout ${v}: the section ends stepping down off the knot`);
    }
  }
});
