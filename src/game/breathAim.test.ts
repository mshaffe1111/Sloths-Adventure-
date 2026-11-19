// FIX-284 (R-165.284; the lead's ruling A, 11-19): after a death or a put-back, a breathing row never meets him in lockstep. The clock's
// align and breathAim's aim, pure. The engine toy (a put-back at many moments, each row just risen at his soonest arrival) is in
// tools/inspect/padRide.test.ts.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { stageClock } from './clock.ts';
import type { ClockDef } from './stageKit.types.ts';
import { beatDef } from './beat.ts';
import { aimBreaths, BREATH_AIM, breathsAhead } from './breathAim.ts';
import type { Platform } from './types.ts';

const DT = 1 / 30;
const row = beatDef('pads-row', 3.2, 0.6, 0.6, 1.5); // up 2.0, shiver 0.6, under 0.6 (2-2's deepBeat22)

test('align: at the given moment the beat has just come out of its on (a pad just risen), on both settings and with a stagger; a turn moves it on', () => {
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
  // turned a share of a period: that far past the rise
  const c2 = stageClock([row], false);
  c2.align('pads-row', 50, 0, 0.5);
  c2.seek(50);
  assert.ok(Math.abs(c2.read('pads-row').into - 1.6) < 1e-4 && c2.read('pads-row').phase === 'off');
  // a beat whose cycle starts with its 'on': aligned to the moment after it
  const onFirst: ClockDef = { id: 'x', phases: [{ name: 'on', seconds: 0.5 }, { name: 'off', seconds: 2 }, { name: 'warn', seconds: 0.5 }], offset: 0.3, easyStretch: 1 };
  const c = stageClock([onFirst], false);
  c.align('x', 10, 0);
  c.seek(10);
  assert.equal(c.read('x').phase, 'off');
  assert.ok(c.read("x").into < 1e-4);
});

test('breathsAhead / aimBreaths: the nearest beat pad of each row ahead of him within reach; weight pads and rows behind are left', () => {
  const pad = (id: number, x: number, by: 'beat' | 'weight', clock: string): Platform => ({ id, x, y: 600, width: 130, height: 12, type: 'moving', lily: true, pad: { by, clock, look: 'small' } } as Platform);
  const P = [pad(1, 900, 'beat', 'a'), pad(2, 1100, 'beat', 'a'), pad(3, 400, 'beat', 'b'), pad(4, 1000, 'weight', 'pad-small'), pad(5, 500 + BREATH_AIM.reach + 50, 'beat', 'c')];
  assert.deepEqual(breathsAhead(P, 500), [{ clock: 'a', shift: 0, dist: 400 }]);
  const got: Array<[string, number, number]> = [];
  const tries = new Map<string, number>();
  const clock = { align: (id: string, at: number, _shift?: number, turn?: number) => { got.push([id, at, turn ?? 0]); } };
  const aimed = aimBreaths(P, 500, 20, 0.35, 285, clock, tries);
  assert.deepEqual(aimed.map((a) => a.clock), ['a']);
  assert.ok(Math.abs(got[0][1] - (20 + 0.35 + 400 / 285)) < 1e-9);
  // each later put-back before the same row turns it a golden share further: never the same moment twice running, spread over the breath
  for (let k = 1; k < 8; k++) aimBreaths(P, 500, 20 + k * 6.4, 0.35, 285, clock, tries);
  const turns = got.map((g) => g[2]);
  assert.equal(turns[0], 0, 'the first aim: just risen at his soonest arrival');
  for (let k = 1; k < turns.length; k++) {
    const step = (((turns[k] - turns[k - 1]) % 1) + 1) % 1;
    assert.ok(Math.abs(step - BREATH_AIM.turn) < 1e-9, `try ${k}: turned ${step.toFixed(3)} of a breath on`);
  }
  const sorted = [...turns].sort((a, b) => a - b);
  const widest = Math.max(...sorted.map((t, i) => (i + 1 < sorted.length ? sorted[i + 1] : sorted[0] + 1) - t));
  assert.ok(widest < 0.4, `8 tries leave no stretch of the breath over 0.4 of it unmet (${widest.toFixed(2)})`);
});
