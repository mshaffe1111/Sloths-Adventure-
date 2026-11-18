/**
 * ENG-26 NEW 1 (reference/design/2-6.md): the water wheel.
 *   - wheel.ts: bucket i's floor at time t turns the way the design flew it (the top moves the way he travels, the bottom back toward the
 *     jetty), and the jetty's and the street's lips stand a log's step (DROP) from the floor passing them;
 *   - the piece (pieces/wheelPiece.ts) on the real engine carries a rider by the bucket's own (dx AND dy): he rises with it doing nothing;
 *   - the flight table (wheelFlights.data.ts) is the engine's: every World 2 row flown again matches it, and each meets the design's numbers;
 *   - the toy (tools/inspect/wheelToys.ts: a wheel laid by place `wheel` in a gen2 tower on World 2's ground) builds clean on both settings,
 *     laid both ways round, the wheel the only way up (levelCheck: without its buckets the street is out of reach);
 *   - planted faults, each RED by name: the street moved out of the flown window (and the engine agrees: its window there is shut), the
 *     jetty moved, a bough in the sweep, no pond, a row nobody flew, an 'up' street too high.
 */
import '../headlessDom.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bucketAt, lipOff, turnTime, wheelLips, WHEEL, type Wheel } from '../wheel.ts';
import { RealPlay, DT } from '../realPlay.ts';
import { setDifficulty } from '../difficulty.ts';
import type { Platform } from '../types.ts';
import { flyWheel } from './wheelFlights.ts';
import { WHEEL_FLOWN } from './wheelFlights.data.ts';
import { flownKey, layWheel, rowLayout, stageWheels, streetFromJetty, wheelFaults, WHEEL_FAIR } from './wheelLay.ts';
import { W2_WHEELS } from './worlds/w2.ts';
import { validateStage } from '../levelCheck.ts';
import { fixtureSeed, toyStage, wheelsOf, type WheelToy } from '../../../tools/inspect/wheelToys.ts';
import { flyAll } from '../../../tools/engine/wheelflights.ts';

const SETTINGS = ['normal', 'easy'] as const;
const ROWS = Object.keys(W2_WHEELS) as Array<keyof typeof W2_WHEELS>;

test('wheel.ts: the top moves the way he travels, the bottom back toward the jetty; the lips a log step from the floor', () => {
  for (const way of [1, -1] as const) {
    const w: Wheel = { cx: 1000, cy: 500, R: 180, N: 6, W: 120, V: 70, way };
    const at = (i: number, t: number) => bucketAt(w, i, t);
    // bucket 0 at the bottom at t = 0, its floor's middle under the axle
    assert.equal(Math.round(at(0, 0).x + w.W / 2), w.cx);
    assert.equal(Math.round(at(0, 0).y), w.cy + w.R);
    // a little later: the bottom has moved back (against `way`), the top (bucket 3 of 6) on (with `way`)
    assert.ok((at(0, 0.1).x - at(0, 0).x) * way < 0, 'the bottom moves back toward the jetty');
    assert.ok((at(3, 0.1).x - at(3, 0).x) * way > 0, 'the top moves the way he travels');
    assert.ok(at(1, 0.1).y < at(1, 0).y, 'bucket 1 (on the near side) rises');
    // a whole turn brings every bucket back
    for (let i = 0; i < w.N; i++) assert.ok(Math.abs(at(i, turnTime(w)).x - at(i, 0).x) < 1e-6);
    const L = wheelLips(w, 'edge');
    assert.equal(L.jettyY, w.cy + w.R - WHEEL.drop);
    assert.equal(L.streetY, w.cy - w.R + WHEEL.drop);
    assert.ok((w.cx - L.jettyX) * way > 0, 'the jetty stands behind the wheel');
    assert.ok((L.streetX - w.cx) * way > 0, 'the street stands on past it');
    // the jetty's lip is where the near edge of a bucket floor DROP px over the bottom meets it
    assert.ok(Math.abs(Math.abs(L.jettyX - w.cx) - (lipOff(w.R) + w.W / 2)) < 1e-9);
    assert.equal(wheelLips(w, 'up', 80).streetY, w.cy - w.R - 80);
    assert.equal(wheelLips(w, 'in').streetX, w.cx + way * WHEEL.streetIn);
  }
});

test('the piece on the real engine: a rider in a bucket is carried by its dx AND dy, and stays in it doing nothing', () => {
  setDifficulty('normal');
  const r = new RealPlay('2-6', 1);
  const w: Wheel = { cx: 4000, cy: 2000, R: 180, N: 6, W: 120, V: 70, way: 1 };
  const buckets: Platform[] = [];
  for (let i = 0; i < w.N; i++) buckets.push({ id: 100 + i, x: 0, y: 0, width: w.W, height: WHEEL.bucketH, type: 'moving', wheel: { w, i } });
  r.bare([{ id: 1, x: 2000, y: 2600, width: 4000, height: 200, type: 'solid' }, ...buckets]);
  r.t = 0;
  r.frame();
  r.stand(buckets[0].x + w.W / 2, buckets[0].y);
  // (the frame he is set down he is not yet standing on it: the engine finds his floor after the pieces step, so the carry starts next frame)
  r.frame();
  r.frame();
  const y0 = r.p.y, x0 = r.p.x, off = r.p.x - (buckets[0].x + w.W / 2);
  // a quarter turn: bucket 0 goes from the bottom to the near side's middle (way 1: the left), rising R
  const n = Math.round(turnTime(w) / 4 / DT);
  for (let k = 0; k < n; k++) r.frame();
  assert.equal(r.standingOn, 100, 'still standing in his bucket');
  assert.ok(y0 - r.p.y > w.R - 12, `carried up ${Math.round(y0 - r.p.y)} px (a quarter turn rises ${w.R})`);
  assert.ok(x0 - r.p.x > w.R - 12, `carried back ${Math.round(x0 - r.p.x)} px`);
  const slip = r.p.x - (buckets[0].x + w.W / 2) - off;
  assert.ok(Math.abs(slip) < 0.5, `his feet where they were in the bucket (no slip): ${slip} px`);
  assert.ok(Math.abs(r.p.y - buckets[0].y) < 0.5, 'his feet on its floor');
});

test('the flight table is the engine: every World 2 row flown again matches it, and meets the design', async () => {
  const flown = await flyAll();
  for (const [k, v] of Object.entries(flown)) assert.deepEqual(WHEEL_FLOWN[k], v, `${k}: re-run tools/engine/wheelflights.ts --write`);
  for (const k of Object.keys(WHEEL_FLOWN)) assert.ok(flown[k], `${k} is in the table and no row flies it`);
  // the design's numbers (2-6.md "The wheel, FLOWN"): boarding by a tap hop at every moment; the step-off windows over the floors
  for (const row of ROWS) for (const d of SETTINGS) {
    const f = WHEEL_FLOWN[flownKey(rowLayout(W2_WHEELS[row], d), d)];
    assert.equal(f.board.tap.share, 100, `${row} ${d}: board`);
    assert.ok(f.step >= WHEEL_FAIR.step[d], `${row} ${d}: step ${f.step} s`);
    assert.notEqual(f.ride, 'fell', `${row} ${d}: a missed step-off rides round`);
  }
  // pinned against the design's own flight (wheel26.ts, out/wheel26-normal.txt): R180 V70 N6 Normal boards 100% (2.7 s), the edge
  // walk-off 11% of a turn, the jump off the top to a street 80 px up 15-16%, 2.27 s
  const edge = WHEEL_FLOWN[flownKey(rowLayout(W2_WHEELS.edge, 'normal'), 'normal')];
  assert.equal(edge.board.tap.window, 2.7);
  assert.equal(edge.walk.share, 11);
  const top = WHEEL_FLOWN[flownKey(rowLayout(W2_WHEELS.top, 'normal'), 'normal')];
  assert.equal(top.jump.window, 2.27);
});

test('the toy: a wheel laid by place `wheel` in a gen2 tower builds clean on both settings, the wheel the only way up', () => {
  const ways = new Set<number>();
  for (const row of ROWS) {
    const seed = fixtureSeed(row);
    assert.ok(seed !== null, `${row}: no seed of 1-60 lays the one wheel clean on both settings`);
    for (let s = 1; s <= 8; s++) for (const d of SETTINGS) {
      const st = toyStage(row, s, d);
      if (st.gen2.errors?.length || wheelsOf(st) !== 1) continue;
      assert.deepEqual(wheelFaults(st, d), [], `${row} seed ${s} ${d}`);
      ways.add(stageWheels(st.platforms)[0].way);
    }
    // the wheel is the way: without its buckets the street (and the stage past it) is out of reach
    const st = toyStage(row, seed!, 'normal');
    const lay = stageWheels(st.platforms)[0].lay!;
    const bare = validateStage({ ...st, platforms: st.platforms.filter((p) => !p.wheel) });
    assert.ok(bare.errors.some((e) => /not reachable/.test(e)), `${row}: the street is reachable with no wheel (${bare.errors.slice(0, 2)})`);
    assert.ok(st.platforms.some((p) => p.id === lay.streetId));
  }
  // (the toy tower's storeys lay the wheel leftward; the lay turned the other way is proven on the lay itself, and the engine's flight is
  // the same either way round)
  assert.ok(ways.has(-1), `laid leftward (${[...ways]})`);
});

test('turned the other way round: the lay right is the lay left mirrored, clean, and the engine flies it the same', async () => {
  for (const row of ROWS) for (const d of SETTINGS) {
    const R0 = W2_WHEELS[row];
    const at = streetFromJetty(R0, d);
    for (const way of [1, -1] as const) {
      const jetty: Platform = { id: 1, x: way > 0 ? 1000 : 3000, y: 2000, width: 300, height: 24, type: 'solid' };
      const lip = way > 0 ? jetty.x + jetty.width : jetty.x;
      const street: Platform = { id: 2, x: way > 0 ? lip + at.dx : lip - at.dx - 340, y: jetty.y + at.dy, width: 340, height: 24, type: 'solid' };
      let id = 10;
      const laid = layWheel(R0, row, jetty, street, d, () => id++);
      assert.equal(laid.wheel.way, way);
      assert.deepEqual(wheelFaults({ platforms: [jetty, street, ...laid.buckets], rivers: [laid.zone] }, d), [], `${row} ${d} way ${way}`);
    }
  }
  const L = rowLayout(W2_WHEELS.edge, 'normal');
  const [left, right] = [await flyWheel({ ...L, way: -1 }, 'normal'), await flyWheel({ ...L, way: 1 }, 'normal')];
  assert.deepEqual({ ...right, misses: {} }, { ...left, misses: {} }, 'the flight is the same either way round');
});

test('PLANTED: the street moved out of the flown window is refused by name, and the engine agrees its window is shut', async () => {
  const seed = fixtureSeed('edge')!;
  for (const d of SETTINGS) {
    const st = toyStage('edge', seed, d);
    assert.deepEqual(wheelFaults(st, d), [], 'GREEN as designed');
    const w = stageWheels(st.platforms)[0];
    const street = st.platforms.find((p) => p.id === w.lay!.streetId)!;
    const moved = { ...st, platforms: st.platforms.map((p) => (p === street ? { ...p, x: p.x + w.way * 90 } : p)) };
    const faults = wheelFaults(moved, d);
    assert.ok(faults.some((f) => /street's lip stands .* from where the flown step-off lands him/.test(f)), `RED: ${faults}`);
  }
  // the engine: the same wheel with its street 90 px further on: no walk reaches it, a tap hop only 0.83 s a turn (60 px on still holds
  // 1.83 s by a tap: the check refuses every layout but the flown one, stricter than the engine needs)
  const L = { ...rowLayout(W2_WHEELS.edge, 'normal'), moved: { dx: 90, dy: 0 } };
  const f = await flyWheel(L, 'normal');
  assert.ok(f.step < WHEEL_FAIR.step.normal, `the moved street's step-off window ${f.step} s (as designed: ${WHEEL_FLOWN[flownKey(rowLayout(W2_WHEELS.edge, 'normal'), 'normal')].step} s)`);
});

test('PLANTED: a moved jetty, a bough in the sweep, a drowned ledge, no pond, an unflown row, an up street too high: each refused by name', () => {
  const seed = fixtureSeed('top')!;
  const st = toyStage('top', seed, 'normal');
  const w = stageWheels(st.platforms)[0];
  const lay = w.lay!;
  const jetty = st.platforms.find((p) => p.id === lay.jetty)!;
  const f1 = wheelFaults({ ...st, platforms: st.platforms.map((p) => (p === jetty ? { ...p, y: p.y + 30 } : p)) }, 'normal');
  assert.ok(f1.some((f) => /jetty's lip stands/.test(f)), `${f1}`);
  const bough: Platform = { id: 9999, x: w.cx - 40, y: w.cy, width: w.R + 80, height: 24, type: 'solid' };
  const f2 = wheelFaults({ ...st, platforms: [...st.platforms, bough] }, 'normal');
  assert.ok(f2.some((f) => /platform #9999 .* stands in its sweep/.test(f)), `${f2}`);
  // a ledge drowned under the pond's water (the lay keeps it clear: tower.ts localExtent reads the pond's depth)
  const z = st.rivers!.find((r) => r.wheelPond)!;
  const drowned: Platform = { id: 9998, x: z.x0 + 10, y: z.surfaceY + 30, width: 80, height: 24, type: 'solid' };
  const f6 = wheelFaults({ ...st, platforms: [...st.platforms, drowned] }, 'normal');
  assert.ok(f6.some((f) => /platform #9998 .* stands under its pond's water/.test(f)), `${f6}`);
  const f3 = wheelFaults({ ...st, rivers: [] }, 'normal');
  assert.ok(f3.some((f) => /no safe pond under its sweep/.test(f)), `${f3}`);
  // a wheel turned faster than any row: no flight
  const fast: Wheel = { ...w, V: w.V + 1 };
  const f4 = wheelFaults({ ...st, platforms: st.platforms.map((p) => (p.wheel ? { ...p, wheel: { w: fast, i: p.wheel.i } } : p)) }, 'normal');
  assert.ok(f4.some((f) => /has not been flown/.test(f)), `${f4}`);
  // an up street 100 px over the top (the rule: 80 on Normal)
  const high: Wheel = { ...w, lay: { ...lay, up: 100 } };
  const f5 = wheelFaults({ ...st, platforms: st.platforms.map((p) => (p.wheel ? { ...p, wheel: { w: high, i: p.wheel.i } } : p)) }, 'normal');
  assert.ok(f5.some((f) => /stands 100 px over the top bucket, past the 80 px/.test(f)), `${f5}`);
});
