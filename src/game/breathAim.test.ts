// FIX-284 (R-165.284; the lead's ruling A, 11-19): after a death or a put-back, a breathing row never meets him in lockstep. The clock's
// align and breathAim's aim, pure. The engine toy (a put-back at many moments, each row just risen at his soonest arrival) is in
// tools/inspect/padRide.test.ts.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { stageClock } from './clock.ts';
import type { ClockDef } from './stageKit.types.ts';
import { beatDef } from './beat.ts';
import { aimBreaths, BREATH_AIM, breathsAhead, noteArrivals } from './breathAim.ts';
import type { Platform } from './types.ts';

const DT = 1 / 30;
const row = beatDef('pads-row', 3.2, 0.6, 0.6, 1.5); // up 2.0, shiver 0.6, under 0.6 (2-2's deepBeat22)

test('align: at the given moment the beat has just come out of its on (a pad just risen), on both settings and with a stagger', () => {
  for (const easy of [false, true]) for (const shift of [0, 0.7]) for (const at of [0, 3.3, 17.91, 101.4]) {
    const c = stageClock([row], easy);
    c.seek(at - 5);
    c.align('pads-row', at, shift);
    c.seek(at);
    const r = c.read('pads-row', shift);
    assert.equal(r.phase, 'off', `${easy ? 'Easy' : 'Normal'} shift ${shift} at ${at}: ${r.phase}`);
    assert.ok(r.into < 1e-4, `just risen: ${r.into.toFixed(3)} s into its up`);
    // one frame before: still under
    c.seek(at - DT);
    assert.equal(c.read('pads-row', shift).phase, 'on');
  }
  // a beat whose cycle starts with its 'on': aligned to the moment after it
  const onFirst: ClockDef = { id: 'x', phases: [{ name: 'on', seconds: 0.5 }, { name: 'off', seconds: 2 }, { name: 'warn', seconds: 0.5 }], offset: 0.3, easyStretch: 1 };
  const c = stageClock([onFirst], false);
  c.align('x', 10, 0);
  c.seek(10);
  assert.equal(c.read('x').phase, 'off');
  assert.ok(c.read("x").into < 1e-4);
});

test('breathsAhead / aimBreaths / noteArrivals: the nearest beat pad of each row ahead within reach; aimed at the soonest, then at his own pace', () => {
  const pad = (id: number, x: number, by: 'beat' | 'weight', clock: string): Platform => ({ id, x, y: 600, width: 130, height: 12, type: 'moving', lily: true, pad: { by, clock, look: 'small' } } as Platform);
  const P = [pad(1, 900, 'beat', 'a'), pad(2, 1100, 'beat', 'a'), pad(3, 400, 'beat', 'b'), pad(4, 1000, 'weight', 'pad-small'), pad(5, 500 + BREATH_AIM.reach + 50, 'beat', 'c')];
  assert.deepEqual(breathsAhead(P, 500).map((b) => [b.clock, b.dist]), [['a', 400]]);
  const got: Array<[string, number]> = [];
  const clock = { align: (id: string, at: number) => { got.push([id, at]); } };
  const lags = new Map<string, number>();
  // first put-back: the soonest (his mark at a full run, moving at once), the row up `lead` before
  let watch = aimBreaths(P, 500, 20, 285, clock, lags);
  const mark = 900 - BREATH_AIM.near;
  assert.deepEqual(watch, [{ clock: 'a', mark, from: 20, soonest: (mark - 500) / 285 }]);
  assert.ok(Math.abs(got[0][1] - (20 + (mark - 500) / 285 - BREATH_AIM.lead)) < 1e-9);
  // he took 2.6 s to come to the mark, (2.6 - soonest) more than he could have: kept, and the next put-back (from another flag) is aimed
  // that much later than its own soonest
  watch = noteArrivals(watch, mark - 1, 22, lags);
  assert.equal(watch.length, 1, 'not there yet');
  watch = noteArrivals(watch, mark + 3, 22.6, lags);
  assert.deepEqual(watch, []);
  const late = 2.6 - (mark - 500) / 285;
  assert.ok(Math.abs(lags.get('a')! - late) < 1e-9);
  aimBreaths(P, 600, 40, 285, clock, lags);
  assert.ok(Math.abs(got[1][1] - (40 + (mark - 600) / 285 + late - BREATH_AIM.lead)) < 1e-9, `aimed at his own pace: ${got[1][1]}`);
});

test('a SNAP STONE row is no breathing row: a put-back never aims its bar (INT-13b: ENG-25b snap stones x FIX-284 breath aim)', () => {
  // (rideLay.ts lays a snap stone as pad { by: 'beat', on: 'bites' }: a floor always, that bites on four; aiming its bar at a put-back
  // turned a wave row's first stone 'just out of its bite', so the second and third bit him as he came: snapRide.test.ts wave child Easy
  // v1 'bitten 2 times', red on the merge, green on each branch alone)
  const lily = (id: number, x: number, clock: string): Platform => ({ id, x, y: 600, width: 130, height: 12, type: 'moving', lily: true, pad: { by: 'beat', clock, look: 'small' } } as Platform);
  const stone = (id: number, x: number, shift: number): Platform => ({ id, x, y: 600, width: 80, height: 40, type: 'solid', art: 'snapStone', pad: { by: 'beat', on: 'bites', clock: 'snap-r', shift, look: 'snap' } } as Platform);
  const P = [stone(1, 700, 0), stone(2, 820, -0.75), stone(3, 940, -1.5), lily(4, 1300, 'beat-r')];
  assert.deepEqual(breathsAhead(P, 500).map((b) => b.clock), ['beat-r'], 'only the breathing row ahead is aimed');
  const got: string[] = [];
  aimBreaths(P, 500, 20, 285, { align: (id: string) => { got.push(id); } }, new Map());
  assert.deepEqual(got, ['beat-r'], "the snap row's bar is never moved");
});
