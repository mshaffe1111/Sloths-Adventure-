/**
 * gen2/riverLay (ENG-W2 (2)): the river's ONE lay. The hand-built World 2 stages lay every log river through it and every one is fair by
 * riverFaults (the lock holds those stages byte for byte); World 2's river rows (w2.ts W2_RIVERS) lay fair under World 2's banks AND under
 * another world's (World 6's ground: the lay is world-neutral, level.md rule 21); each fairness rule is planted below (a river built to
 * break it, which riverFaults names), so no rule can go quiet unseen.
 */
import '../headlessDom.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateAllLevels } from '../worldsData.ts';
import { buildW2Stage, W2_STAGES } from '../w2Stages.ts';
import { driftX, LOG_DROP, logLayout, gapFor, type RiverZone } from '../river.ts';
import type { Platform } from '../types.ts';
import { layRiver, RIVER_LAY, riverBeat, riverFaults, riverWidth, type RiverRow } from './riverLay.ts';
import { W2_GROUND, W2_RIVERS } from './worlds/w2.ts';
import { W6_GROUND } from './worlds/w6.ts';

/** a river laid between two banks, as a stage (the near bank `nearW` wide) */
function laidStage(row: RiverRow, bankY: number, nearW = 400): { platforms: Platform[]; rivers: RiverZone[] } {
  let id = 1;
  const near: Platform = { id: id++, x: 1000 - nearW, y: bankY, width: nearW, height: 90, type: 'solid', style: 'log' };
  const r = layRiver(row, 1000, bankY, () => id++);
  const far: Platform = { id: id++, x: r.zone.x1, y: bankY, width: 400, height: 90, type: 'solid', style: 'log' };
  return { platforms: [near, ...r.logs, far], rivers: [r.zone] };
}

test("the lay: river.ts's own rules (its window a whole number of spacings, logLayout's count and offsets, the logs at LOG_DROP)", () => {
  const row: RiverRow = { dir: 1, speed: 75, logW: 160, logs: 3 };
  const { zone, logs } = layRiver(row, 500, W2_GROUND.y, (() => { let i = 1; return () => i++; })());
  const gap = gapFor(1, 75);
  assert.equal(zone.x1 - zone.x0, (3 + 1) * (160 + gap) - 160);
  assert.equal(riverWidth(row), zone.x1 - zone.x0);
  const { count, period } = logLayout({ dir: 1, speed: 75, logW: 160, gap, width: riverWidth(row) });
  assert.equal(logs.length, count);
  logs.forEach((p, i) => { assert.equal(p.drift!.offset, (i * period) / count); assert.equal(p.x, driftX(p.drift!, 0)); assert.equal(p.y, W2_GROUND.y + LOG_DROP); });
  assert.equal(zone.safe, undefined);
  assert.deepEqual(layRiver({ ...row, safe: true }, 500, 580, () => 0).zone.safe, { backX: 430, backY: 580 });
});

test('the hand-built World 2 stages lay every log river through the lay, and every one is fair (seeds 1-3)', () => {
  // (2-6 is gen2's now, BUILD-26: its millrace is judged by riverFaults in w2Arc26.test.ts)
  const plans = Object.entries(W2_STAGES);
  let rivers = 0;
  for (const [id, plan] of plans) for (const s of [1, 2, 3]) {
    const cfg = generateAllLevels().find((c) => c.id === id && !c.secret)!;
    const st = buildW2Stage(cfg, s, plan);
    assert.deepEqual(riverFaults(st), [], `${id} seed ${s}`);
    rivers += (st.rivers ?? []).filter((r) => r.speed > 0 && !r.open && !r.raft && !r.flood).length;
  }
  assert.ok(rivers >= 10, `${rivers} log rivers judged`);
});

test("World 2's river rows lay fair under World 2's banks and under World 6's (the lay is world-neutral)", () => {
  for (const [name, row] of Object.entries(W2_RIVERS)) for (const y of [W2_GROUND.y, W6_GROUND.y - 40]) {
    assert.deepEqual(riverFaults(laidStage(row, y)), [], `${name} at ${y}`);
    assert.ok(riverBeat(row) <= RIVER_LAY.beat, `${name}: a log every ${riverBeat(row).toFixed(1)} s`);
  }
  // (the teaching river splashes him back; the river flowing back at him keeps its logs closer, as the hand-built 2-1's did)
  assert.equal(W2_RIVERS.ride.safe, true);
  assert.equal(W2_RIVERS.back.dir, -1);
});

test('planted: each fairness rule names the river built to break it', () => {
  const ok: RiverRow = { dir: 1, speed: 75, logW: 160, logs: 3 };
  const has = (st: ReturnType<typeof laidStage>, re: RegExp) => assert.ok(riverFaults(st).some((f) => re.test(f)), `${riverFaults(st).join(' | ') || 'no fault'} (wanted ${re})`);
  assert.deepEqual(riverFaults(laidStage(ok, 580)), []);
  has(laidStage({ ...ok, gap: 150 }, 580), /past a hop/);
  has(laidStage({ ...ok, gap: 40 }, 580), /under 60/);
  has(laidStage({ ...ok, speed: 160 }, 580), /over 143/);
  has(laidStage({ ...ok, speed: 50, gap: 70 }, 580), /a log every .* s, over 4/);
  has(laidStage(ok, 580, 100), /bank to wait on/);
  has(laidStage({ dir: -1, speed: 70, logW: 150, logs: 4 }, 580), /out of sight/);
  const one = laidStage(ok, 580);
  one.platforms = one.platforms.filter((p, i) => p.type !== 'drift' || i === 1);
  has(one, /under 2/);
  const uneven = laidStage(ok, 580);
  uneven.platforms.find((p) => p.type === 'drift')!.drift!.offset += 0.7;
  has(uneven, /not evenly spaced/);
  const bankless = laidStage(ok, 580);
  bankless.platforms = bankless.platforms.slice(0, -1);
  has(bankless, /no bank at one end/);
});

test("a marsh's `open` (data, off by default): with it the marsh opens on water at the near bank's foot; without it the old shape", () => {
  const row = (open?: number): RiverRow => ({ dir: 1, speed: 0, logW: 0, logs: 0, safe: true, marsh: { width: 1400, floor: 75, dips: 4, dip: 100, ...(open === undefined ? {} : { open }) } });
  const x0 = 1000;
  const bankY = 580;
  const lay = (open?: number) => {
    let id = 1;
    return layRiver(row(open), x0, bankY, () => id++);
  };
  const pieces = (f: Platform[]) => f.map((p) => [p.x, p.x + p.width]);
  // without it (unset, or 0): the floor's first piece starts at the bank's foot, five equal pieces, four 100 px dips (2-8.md:9)
  for (const off of [lay(), lay(0)]) {
    assert.deepEqual(pieces(off.floor), [[1000, 1200], [1300, 1500], [1600, 1800], [1900, 2100], [2200, 2400]]);
    assert.equal(off.zone.x0, x0);
  }
  // with it: water from the bank's foot `open` px wide, then the same pieces and dips sharing the rest, the far end unmoved
  const on = lay(220);
  assert.equal(on.floor.length, 5);
  assert.equal(on.floor[0].x, x0 + 220, 'the first piece starts past the open dip');
  assert.ok(!on.floor.some((p) => p.x < x0 + 220 && p.x + p.width > x0), 'no floor in the open dip');
  assert.equal(on.floor.at(-1)!.x + on.floor.at(-1)!.width, x0 + 1400, 'the marsh ends where it did');
  for (let i = 1; i < on.floor.length; i++) assert.equal(on.floor[i].x - (on.floor[i - 1].x + on.floor[i - 1].width), 100, `dip ${i}`);
  assert.ok(on.floor.every((p) => p.width === on.floor[0].width && p.y === bankY + 75));
  // the water is there to see at his feet: the zone starts at the bank's foot, under the floor's top
  assert.ok(on.zone.x0 === x0 && on.zone.surfaceY === bankY + 75 + RIVER_LAY.marshWater);
  // an open that leaves no floor is named
  assert.throws(() => lay(1000), /has no floor left with open 1000/);
});
