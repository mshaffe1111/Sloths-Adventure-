/**
 * LV-11 (polish report 1, 2026-10-29): a way out of the dips the scripted player got stuck in. 2-3 (its mooring posts only; elsewhere
 * the step skipped the climb): a 60-80 px step at the foot of the post's high bank. 5-8: no spot of the floor under its first stairs more than 300 px from a
 * way back up (a stair one jump up, or a climb trunk standing on the floor).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { generateAllLevels } from './worldsData.ts';
import { generateStage, setLayoutVariant } from './stageGenerator.ts';
import { buildW2Stage, W2_STAGES } from './w2Stages.ts';
import { ONE_JUMP_UP, WAY_OUT_EVERY } from './dipWayOut.ts';
import { G } from './protoStage.ts';

const cfg = (id: string) => generateAllLevels().find((l) => l.id === id && !l.secret)!;

test('2-3: every high bank behind a mooring post has a 60-80 px step at its foot', () => {
  let seen = 0;
  for (const seed of [1, 2, 3, 4, 5, 6, 7, 8]) {
    const st = buildW2Stage(cfg('2-3'), seed, W2_STAGES['2-3']);
    // the post's high banks: a bank 200 px up rising straight from the trail
    const walls = st.platforms.filter((p) => p.y === G - 200 && st.platforms.some((q) => q.y === G && Math.abs(q.x + q.width - p.x) < 2));
    seen += walls.length;
    for (const w of walls) {
      const step = st.platforms.find((q) => Math.abs(q.x + q.width - w.x) < 2 && G - q.y >= 60 && G - q.y <= 80);
      assert.ok(step, `seed ${seed}: the bank at ${w.x} has no step at its foot`);
    }
  }
  assert.ok(seen >= 4, `${seen} post banks seen`);
});

test('5-8: no spot of the floor under the first stairs more than 300 px from a way back up, layouts 1-3', () => {
  for (const lay of [1, 2, 3]) {
    setLayoutVariant(lay);
    const st = generateStage(cfg('5-8'), 'normal');
    setLayoutVariant(null);
    const floor = st.platforms.find((p) => st.spawnX >= p.x && st.spawnX <= p.x + p.width && Math.abs(p.y - st.spawnY) < 4)!;
    const stairs = st.platforms.filter((p) => p !== floor && p.type === 'solid' && p.y < floor.y && floor.y - p.y <= 360);
    const outs: number[] = [];
    for (const p of stairs) if (floor.y - p.y <= ONE_JUMP_UP) outs.push(p.x, p.x + p.width);
    for (const v of st.vines) if (v.vineType === 'tree_climb' && Math.abs(v.bottomY - floor.y) < 20) outs.push(v.x);
    for (const p of stairs.filter((q) => floor.y - q.y > ONE_JUMP_UP)) {
      for (let x = p.x; x <= p.x + p.width; x += 20) {
        const d = Math.min(...outs.map((o) => Math.abs(o - x)));
        assert.ok(d <= WAY_OUT_EVERY + 60, `layout ${lay}: under the stair at ${Math.round(p.x)}, ${Math.round(d)} px from a way up`);
      }
    }
  }
});
