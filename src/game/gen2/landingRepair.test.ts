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

// (fresh 1-1 rolls: every roll the search returns clean carries no dead-zone petal and no idle mushroom. The old existence proof (seeds
// from 50001 until the repair cleared one) went red once 1-1's sections stopped needing it (0 of 100 by ENG-PETAL): the repair's proof is
// now the PLANTED roll below, never a wider seed range (INT-10c, the lead agreed)
test('fresh 1-1 rolls: no roll the search returns clean has a dead-zone petal or an idle mushroom (seeds 50001-50100)', () => {
  const cfg = { ...generateAllLevels().find((l) => l.id === '1-1')!, unlocked: true };
  for (let seed = 50001; seed <= 50100; seed++) {
    const st = buildGen2Stage({ config: cfg, kit: w1World(), seed, difficulty: 'normal' });
    if (st.gen2.errors?.length) continue; // (a refused roll is never played: the rule is the clean one's)
    assert.deepEqual(deadZones(st.platforms, st.collectibles, 'normal'), [], `seed ${seed}`);
    assert.deepEqual(purposelessBounces(st.platforms, st.collectibles, 'normal'), [], `seed ${seed}`);
  }
});

// (planted on a real roll: 1-1 seed 50001 Normal; every piece where a petal would be a dead zone is found by deadZones itself, a petal is
// put on each in turn, and the repair the pipeline runs (pipeline.ts checkAndRepair: repairLandings inside the petal's own section) moves
// it to a piece a clean flight reaches in that section, and nothing is left in a dead zone)
test('planted on a real 1-1 roll: a petal put on a dead-zone piece is moved by the repair to a clean piece in its own section', () => {
  const cfg = { ...generateAllLevels().find((l) => l.id === '1-1')!, unlocked: true };
  const st = buildGen2Stage({ config: cfg, kit: w1World(), seed: 50001, difficulty: 'normal' });
  assert.deepEqual(st.gen2.errors ?? [], []);
  const secs = (st.gen2 as unknown as { sections: Array<{ x0: number; x1: number; room?: unknown }> }).sections;
  const within = (x: number): readonly [number, number] | undefined => {
    const q = secs.find((s) => x >= s.x0 && x <= s.x1);
    return q && !q.room ? [q.x0, q.x1] : undefined;
  };
  const on = (p: LandPiece): LandPickup => petal(p.x + p.width / 2, p.y);
  const dead = st.platforms.filter((p) => p.type === 'solid' && p.width >= 40 && deadZones(st.platforms, [...st.collectibles, on(p)], 'normal').includes(p));
  assert.ok(dead.length > 0, 'the roll has a piece a petal would be a dead zone on');
  const L = new Landings(st.platforms, 'normal');
  for (const p of dead) {
    const pk: LandPickup[] = [...st.collectibles.map((c) => ({ ...c })), on(p)];
    assert.deepEqual(deadZones(st.platforms, pk, 'normal'), [p], 'red before the repair: the verdict refuses it');
    const r = repairLandings(st.platforms, pk, 'normal', within);
    assert.equal(r.moved, 1);
    assert.deepEqual(deadZones(st.platforms, pk, 'normal'), []);
    const c = pk.at(-1)!, to = pickupPiece(c, st.platforms)!;
    assert.ok(to && to !== p && L.cleanWay(to), `moved onto a piece a clean flight reaches (${Math.round(c.x)})`);
    const [a, b] = within(p.x + p.width / 2)!;
    assert.ok(c.x >= a && c.x <= b, 'inside its own section');
  }
});
