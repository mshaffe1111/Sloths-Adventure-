/**
 * Y2 (R-165.120, after R-165.124 and R-165.126): the generator repairs inside a roll what the dead-zone and bounce-purpose verdicts
 * refuse (landings.ts repairLandings, run by pipeline.ts checkAndRepair on every judged build), instead of the search swapping sections
 * for them. Planted on toy pieces (each case red before the repair: the verdict's own judge refuses it), then on fresh 1-1 rolls.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import '../headlessDom.ts';
import { deadZones, Landings, pickupPiece, purposelessBounces, repairLandings, type LandPickup, type LandPiece } from './landings.ts';
import { buildGen2Stage } from './pipeline.ts';
import { w1World } from './worlds/w1.ts';
import { generateAllLevels } from '../worldsData.ts';

const S = (x: number, y: number, width: number, height = 24): LandPiece => ({ x, y, width, height, type: 'solid' });
const cap = (x: number, y: number): LandPiece => ({ x, y: y - 30, width: 70, height: 30, type: 'bouncy' });
const petal = (x: number, y: number, type = 'flower'): LandPickup => ({ x, y: y - 34, type });
const all = (): [number, number] => [-10000, 10000];

for (const s of ['normal', 'easy'] as const) {
  test(`toy, ${s}: a petal row on the log under a log moves to the nearest piece a clean flight reaches, its height and count kept`, () => {
    // (landings.test.ts's toy dead zone: a petal log 72 px under a ledge, a log over the gap)
    const ledge = S(0, 900, 1000, 300), far = S(1600, 900, 600, 300), over = S(1000, 830, 400), low = S(1080, 972, 90);
    const pcs = [ledge, far, over, low];
    const row = [petal(1100, 972), petal(1150, 972)], keep = petal(1800, 900);
    const pk = [...row, keep];
    assert.deepEqual(deadZones(pcs, pk, s), [low]);
    const r = repairLandings(pcs, pk, s, all);
    assert.equal(r.moved, 2);
    assert.deepEqual(deadZones(pcs, pk, s), []);
    const L = new Landings(pcs, s);
    for (const c of row) {
      const on = pickupPiece(c, pcs)!;
      assert.ok(on && on !== low && L.cleanWay(on), JSON.stringify(c));
      assert.equal(on.y - c.y, 34);
    }
    assert.equal(Math.abs(row[1].x - row[0].x), 50);
    assert.deepEqual(keep, petal(1800, 900));
  });

  test(`toy, ${s}: a row with no clean piece within its stretch stays (the verdict refuses it), and a find is never moved`, () => {
    const ledge = S(0, 900, 1000, 300), far = S(1600, 900, 600, 300), over = S(1000, 830, 400), low = S(1080, 972, 90);
    const pcs = [ledge, far, over, low];
    const pk = [petal(1120, 972)];
    assert.equal(repairLandings(pcs, pk, s, () => [1100, 1130]).moved, 0);
    assert.deepEqual(deadZones(pcs, pk, s), [low]);
    const fk = [petal(1120, 972, 'find')];
    assert.equal(repairLandings(pcs, fk, s, all).moved, 0);
    assert.deepEqual(deadZones(pcs, fk, s), [low]);
  });

  test(`toy, ${s}: a mushroom with no purpose is taken up; one under a high bank, and a chain into it, stays`, () => {
    const floor = S(0, 900, 2000, 300);
    const one = cap(300, 900);
    assert.deepEqual(repairLandings([floor, one], [], s, all).caps, [one]);
    const caps = [cap(300, 900), cap(500, 900), cap(700, 900)], bank = S(800, 690, 500, 510);
    assert.deepEqual(purposelessBounces([floor, ...caps, bank], [], s), []);
    assert.deepEqual(repairLandings([floor, ...caps, bank], [], s, all).caps, []);
  });
}

// (fresh 1-1 seeds whose search, before the repair, laid a dead-zone petal row or an idle mushroom on its returned roll; on the base the
// yield probe found 37 of 108 clean-but-for-these rolls, Y2/REPORT.md. Every roll the search returns clean carries neither)
test('fresh 1-1 rolls: no roll the search returns clean has a dead-zone petal or an idle mushroom, and the repair is what cleared them', () => {
  const cfg = { ...generateAllLevels().find((l) => l.id === '1-1')!, unlocked: true };
  // (fresh seeds from 50001 until one the repair cleared, every roll on the way checked: found, never copied. Re-pinned by POLISH-9b
  // (R-165.228): 50004/18/31/41 drew sprint-B or -C, and with 1-1 on A and D they lay clean without the repair; today 2 in 120 need it)
  let repaired = 0;
  for (let seed = 50001; seed <= 50100 && !repaired; seed++) for (const difficulty of ['normal', 'easy'] as const) {
    if (difficulty === 'easy' && !repaired) continue;
    const st = buildGen2Stage({ config: cfg, kit: w1World(), seed, difficulty });
    if (st.gen2.errors?.length) continue; // (a refused roll is never played: the rule is the clean one's)
    assert.deepEqual(deadZones(st.platforms, st.collectibles, difficulty), [], `seed ${seed} ${difficulty}`);
    assert.deepEqual(purposelessBounces(st.platforms, st.collectibles, difficulty), [], `seed ${seed} ${difficulty}`);
    if (difficulty === 'normal' && st.gen2.repairs.some((r) => /^landings:/.test(r.note))) repaired++;
  }
  assert.ok(repaired > 0, 'no roll of 100 was repaired: the repair never ran');
});
