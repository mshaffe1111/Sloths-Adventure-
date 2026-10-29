/**
 * The QA batch of 2026-10-29 on Worlds 1-3 (reference/STATUS.md, the QA checklist's rule numbers): one regression test per finding
 * that can be one, each failing on the stages as they were before the fix.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { buildProtoStage, G } from './protoStage.ts';
import { easyStage } from './easyMode.ts';
import { withGoals } from './goals.ts';
import { reachJump } from './physics.ts';
import { RealPlay } from './realPlay.ts';
import { setDifficulty } from './difficulty.ts';
import type { LevelConfig, Platform } from './types.ts';

const cfg = (id: string, type: LevelConfig['objectiveType']): LevelConfig =>
  ({
    worldIndex: Number(id[0]), miniIndex: Number(id.split('-')[1]), id, name: id, objectiveType: type, targetCount: 1, timeLimit: 0, levelWidth: 9000,
    levelHeight: 900, description: '', unlocked: true, completed: false, stars: 0, highScore: 0, bestTime: 0,
  }) as LevelConfig;
const ROLLS = Array.from({ length: 24 }, (_, i) => 1 + i);
const DEEP_TIP = 'No moss down there. Jump true!';

/** the stretches of a stage's path where nothing stands above the water (a fall there costs a life): [x0, x1] */
function deepGaps(platforms: Platform[], x0: number, x1: number, water: number): Array<[number, number]> {
  const out: Array<[number, number]> = [];
  let from: number | null = null;
  for (let x = x0; x <= x1; x += 2) {
    const dry = platforms.some((p) => p.type !== 'bouncy' && x >= p.x && x <= p.x + p.width && p.y < water - 8);
    if (!dry && from === null) from = x;
    if (dry && from !== null) {
      out.push([from, x]);
      from = null;
    }
  }
  return out;
}

// QA 1 (rule 2): 3-1's first water came 12-16% in with no tip before it (Dot's line waited behind the spores' and the lessons), as a
// 56-64 px slot just out of the spore cloud; plain hops lost all three lives in about 10 s on ?layout=1 and 7
test('3-1: the first water is taught well before it, and is one plain level jump with a wide landing (every roll, Normal and Easy)', () => {
  for (const s of ROLLS) {
    for (const easy of [false, true]) {
      const built = withGoals(buildProtoStage(cfg('3-1', 'sprint'), s, '3-1'));
      const st = easy ? easyStage(built) : built;
      const water = st.waterY!;
      const gaps = deepGaps(st.platforms, st.spawnX, st.exitTotemX, water);
      assert.ok(gaps.length > 0, `roll ${s}: 3-1 has water`);
      const [edge, far] = gaps[0];
      const tip = st.proto.hints.find((h) => h.text === DEEP_TIP);
      assert.ok(tip, `roll ${s}: Dot's water line is in the stage`);
      assert.ok(tip!.x <= edge - 1200, `roll ${s}${easy ? ' Easy' : ''}: Dot's water line ${Math.round(edge - tip!.x)} px before the first water (want 1200+)`);
      // (nothing else of Dot's comes between her water line and the water: the spores' line comes after it)
      const between = st.proto.hints.filter((h) => h.x > tip!.x && h.x < edge);
      assert.deepEqual(between.map((h) => h.text), [], `roll ${s}: no other line of Dot's between the water line and the water`);
      const w = far - edge;
      assert.ok(w >= 64 && w <= reachJump(0, false) * 0.46, `roll ${s}: the first water is ${w} px across (a plain jump, wide enough to see)`);
      const near = st.platforms.find((p) => Math.abs(p.x + p.width - edge) <= 2 && p.y < water - 8)!;
      const land = st.platforms.find((p) => Math.abs(p.x - far) <= 2 && p.y < water - 8)!;
      assert.ok(near && land, `roll ${s}: banks either side of the first water`);
      assert.equal(near.y, G, `roll ${s}: taken off from the floor`);
      assert.equal(land.y, G, `roll ${s}: a level landing`);
      assert.ok(land.width >= 330, `roll ${s}: a wide landing (${land.width} px)`);
      // no spore cloud and no dark anywhere near it
      for (const z of st.zones ?? []) assert.ok(z.x1 < tip!.x - 100 || z.x0 > far + 300, `roll ${s}: a ${z.kind} zone at ${Math.round(z.x0)}-${Math.round(z.x1)} near the first water`);
    }
  }
});

test('3-1: in the real engine a short running flick clears the first water, and walking off it costs the life (it is real water)', () => {
  setDifficulty('normal');
  for (const s of [1, 7, 12]) {
    const r = new RealPlay('3-1', s);
    const st = r.stage;
    const [edge, far] = deepGaps(r.platforms, st.spawnX, st.exitTotemX, st.waterY!)[0];
    for (const at of [-60, -30, 0]) {
      r.stand(edge - 260, G);
      r.died = false;
      let pressed = false;
      let held = 0;
      for (let i = 0; i < 90 && !r.died; i++) {
        const pad: Record<string, boolean> = { right: true };
        if (!pressed && r.p.x >= edge + at) {
          pressed = true;
          pad.press = pad.jump = true;
        } else if (pressed && held < 0.07) pad.jump = true;
        if (pressed) held += 1 / 30;
        r.frame(pad);
      }
      assert.ok(!r.died && r.p.x > far, `roll ${s}: a 0.07 s flick ${at} px from the edge clears the first water`);
    }
    r.stand(edge - 120, G);
    r.died = false;
    for (let i = 0; i < 60 && !r.died; i++) r.frame({ right: true });
    assert.ok(r.died, `roll ${s}: a plain walk off the bank falls in`);
  }
});
