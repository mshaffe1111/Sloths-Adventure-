// The OUT-AND-BACK shape (ENG-27; reference/design/2-7.md "READY before the builder", PICKS-26-28 ruling 1): a run right, a way down, a run
// back LEFT on the column's foot with its rivers flowing left, laid by gen2 on the toy (toyHome.ts, World 2's ground and river rows).
// No stage of the game is built here; the toy's id is the test's own.
import test from 'node:test';
import assert from 'node:assert/strict';
import '../headlessDom.ts';
import { buildGen2Stage } from './pipeline.ts';
import { towerCfg } from './toyTower.ts';
import { HOME_CODE, homeKit, SAME_GROUND_CODE } from './toyHome.ts';
import { LEG_CLEAR, reflectLeg } from './legs.ts';
import { layRiver, riverFaults } from './riverLay.ts';
import { validateStage } from '../levelCheck.ts';
import { W2_RIVERS } from './worlds/w2.ts';

const ID = '2-97';
const build = (code: string, seed: number, difficulty: 'normal' | 'easy' = 'normal') => buildGen2Stage({ config: { ...towerCfg(ID, 'sprint'), unlocked: true }, kit: homeKit(ID, code), seed, difficulty });
const errorsOf = (st: ReturnType<typeof build>) => [...(st.gen2.errors ?? []), ...validateStage(st).errors.map((e) => `levelCheck: ${e}`)];

test('home toy (planted RED): turned back LEFT at the out leg\'s own ground, the home leg lies on top of it: refused by name on every roll', () => {
  for (let seed = 1; seed <= 4; seed++) {
    const st = build(SAME_GROUND_CODE, seed);
    assert.match(errorsOf(st).join('\n'), /legs: leg 2 \(left\) overlays leg 1 \(right\) at x \d+-\d+: .* needs its own ground/, `seed ${seed}`);
  }
});

test('home toy (GREEN): out right, down the column, home left: clean on 6 seeds and both settings, the same stage from the same seed', () => {
  for (const difficulty of ['normal', 'easy'] as const) {
    for (let seed = 1; seed <= 6; seed++) {
      const st = build(HOME_CODE, seed, difficulty);
      const at = `${difficulty} seed ${seed}`;
      assert.deepEqual(errorsOf(st), [], at);
      const T = st.gen2.tower!;
      assert.deepEqual(T.legs!.map((g) => g.travel), ['right', 'down', 'left'], at);
      const [out, col, home] = T.legs!;
      // (the home leg on its own ground: its top a jump and his height under the out leg's foot, on the column's floor)
      assert.ok(home.y0 - out.y1 >= LEG_CLEAR, `${at}: home top ${home.y0}, out foot ${out.y1}`);
      assert.equal(home.ground, col.floorY, `${at}: home stands on the column's floor`);
      // (it runs back under the out leg: home begins at the column's near wall and lies left of it)
      assert.ok(home.x1 <= col.x0 && home.x0 < out.x0, at);
      // (the stage ends LEFT: its last leg names the travel, and its shrine is at the home leg's left end)
      assert.equal(st.config.travel, 'left', at);
      assert.ok(st.exitTotemX < out.x0, `${at}: shrine at ${st.exitTotemX}`);
      // (every river on the home leg flows LEFT, with him, and is marked as crossed right to left; the out leg's flow left, AT him)
      const homeRivers = (st.rivers ?? []).filter((r) => r.x1 <= home.x1 + 1 && r.surfaceY > out.y1);
      const outRivers = (st.rivers ?? []).filter((r) => r.x0 >= out.x0 - 1 && r.surfaceY < out.y1);
      assert.ok(homeRivers.length >= 3 && outRivers.length >= 1, `${at}: ${homeRivers.length} home rivers, ${outRivers.length} out`);
      for (const r of homeRivers) assert.deepEqual([r.dir, r.way], [-1, -1], `${at}: home river at ${r.x0}`);
      for (const r of outRivers) assert.deepEqual([r.dir, r.way], [-1, undefined], `${at}: out river at ${r.x0}`);
      // (flags lie along the home leg too, and petals: the shrine at the left end strips none, levelCheck's 'past the shrine' reads the
      //  way he travels; planted RED before ENG-27: every petal of the stage was refused as past a shrine at x ~0)
      const homeFlags = (st.checkpoints ?? []).filter((c) => c.x < home.x1 && c.y > out.y1);
      const homePetals = st.collectibles.filter((c) => c.type === 'flower' && c.x < home.x1 && c.y > out.y1);
      assert.ok(homeFlags.length >= 3, `${at}: ${homeFlags.length} flags on the home leg`);
      assert.ok(homePetals.length >= 10, `${at}: ${homePetals.length} petals on the home leg`);
      if (seed <= 2) assert.deepEqual(build(HOME_CODE, seed, difficulty).platforms, st.platforms, `${at}: the same stage from the same seed`);
    }
  }
});

test('home toy (planted): a river crossed right to left is judged in its own frame: the mirror of a fair river is fair, unmarked it is not', () => {
  // (a river with him laid rightwards between two banks; then the same river turned, as a leg laid left turns it)
  let id = 1;
  const near = { id: id++, x: 4000, y: 580, width: 300, height: 200, type: 'solid' as const };
  const r = layRiver(W2_RIVERS.ride, near.x + near.width, near.y, () => id++);
  const far = { id: id++, x: r.zone.x1, y: 580, width: 300, height: 200, type: 'solid' as const };
  const st = { platforms: [near, ...r.logs, far], rivers: [r.zone], vines: [] };
  assert.deepEqual(riverFaults(st), []);
  const sum = 2 * 4000;
  reflectLeg({ platforms: st.platforms, vines: [], ropes: [], zones: [], gaps: [], asks: [], heartFalls: [], rivers: st.rivers, sections: [] }, sum);
  assert.deepEqual([r.zone.dir, r.zone.way], [-1, -1]);
  assert.deepEqual(riverFaults(st), [], 'the turned river, judged in its own frame');
  // (planted: the way mark taken off, the judge reads the river as flowing back at a player running right, and refuses it)
  delete r.zone.way;
  assert.match(riverFaults(st).join(), /flows back at him/);
});
