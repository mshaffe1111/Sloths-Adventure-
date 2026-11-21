/**
 * LV-11 (polish report 1, 2026-10-29): a way out of the dips the scripted player got stuck in. (2-3's step at the foot of its mooring
 * posts' high banks went with its hand build, BUILD-23 11-20: the designed 2-3 has no high bank behind its post.) 5-8: no spot of the floor under its first stairs more than 300 px from a
 * way back up (a stair one jump up, or a climb trunk standing on the floor).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { generateAllLevels } from './worldsData.ts';
import { generateStage, setLayoutVariant } from './stageGenerator.ts';
import { ONE_JUMP_UP, WAY_OUT_EVERY } from './dipWayOut.ts';

const cfg = (id: string) => generateAllLevels().find((l) => l.id === id && !l.secret)!;

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
