// The testers' let-go flies every perch a liana is laid to by what he sees (ENG-16E, R-165.246; physics FORWARD_END, forwardEndLands;
// pipeline lianaBand). BUILD-16d E1: a chain's lianas swing at half the engine's swing (ENG-S5's floor, chainAmp), and the last one's
// perch, at the far end of its release band, landed the forward-end let-go 8-17 px in (two seeds short): the kid fell into the thorns.
// Toy lianas, no stage id: RED with the guard taken out of lianaBand.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { lianaBand, VINE } from '../pipeline.ts';
import { forwardEndLands, FORWARD_END, setTimedSwing, type AirBody } from '../../physics.ts';
import { gripsOf } from '../../levelCheck.ts';
import { LIANA, type LianaSwing } from '../types.ts';
import { LAND_IN } from '../landings.ts';

const from = { x: 0, y: 600, w: 280 };
const perchLands = (v: { x: number; topY: number; bottomY: number }, sw: LianaSwing, x: number, w: number, d: 'normal' | 'easy') => {
  setTimedSwing(d === 'easy');
  const hits = (c: AirBody, _t: number, prevY: number) => c.vy >= 0 && prevY <= from.y + 14 && c.y >= from.y && c.x >= x + LAND_IN.px && c.x <= x + w - LAND_IN.px;
  const ok = forwardEndLands({ ...v, swingAmp: sw.amp, swingPeriod: sw.period, swingPhase: 0 }, hits, gripsOf(sw.grip, v.bottomY - v.topY));
  setTimedSwing(false);
  return ok;
};

test('the forward-end let-go is the bot\'s: physics FORWARD_END equals the first-timer\'s LET_GO_AT (never one without the other)', () => {
  const src = readFileSync(new URL('../../../../tools/inspect/firsttimer.ts', import.meta.url), 'utf8');
  const m = src.match(/export const LET_GO_AT = ([\d.]+);/);
  assert.ok(m, 'firsttimer.ts LET_GO_AT not found');
  assert.equal(FORWARD_END, Number(m![1]));
});

test('a chain\'s last liana at half the engine\'s swing: its perch is laid where the forward-end let-go lands him with margin (RED: 8-17 px in)', () => {
  // (1-6's chain as laid: a 410 px liana 175 px past the bough (LIANA.reach), at 0.24-0.26 rad, its LONG perch 120-140 px wide, `held`, both settings)
  for (const d of ['normal', 'easy'] as const) for (const amp of [0.24, 0.26]) for (const w of [124, 136]) {
    const v = { x: 455, topY: 190, bottomY: 600 };
    const sw: LianaSwing = { amp, period: VINE.period[d] };
    const band = lianaBand(from, v, sw, 0, w, LIANA.window[d], -Infinity, d, false, true);
    assert.ok(band, `${d} amp ${amp} w ${w}: no band at all`);
    assert.ok(perchLands(v, sw, band![1], w, d), `${d} amp ${amp} w ${w}: the band's far end +${band![1] - v.x} px is past the testers' let-go`);
  }
});

test('a dialled liana (FAR, the foot only): its band ends where the forward-end let-go from the foot lands (RED: FAR fell 2-27 px short)', () => {
  for (const d of ['normal', 'easy'] as const) {
    const v = { x: 455, topY: 180, bottomY: 600 };
    const sw: LianaSwing = { amp: VINE.amp, period: VINE.period[d], grip: 'low' };
    const band = lianaBand(from, v, sw, 0, 130, Math.max(LIANA.window[d], d === 'easy' ? 0.55 : 0.3), -Infinity, d, false, false);
    assert.ok(band, `${d}: no FAR band`);
    assert.ok(perchLands(v, sw, band![1], 130, d), `${d}: FAR's far end +${band![1] - v.x} px is past the testers' let-go from the foot`);
  }
});

test('a liana with no dial is laid as before (Worlds 6-8, World 1\'s LONG): the guard reads only what he sees', () => {
  // (the same band with and without asking: no dial, not held, so lianaBand never asks the forward-end let-go)
  const v = { x: 455, topY: 180, bottomY: 600 };
  const a = lianaBand(from, v, { amp: VINE.amp, period: VINE.period.normal }, 0, 260, LIANA.window.normal, -Infinity, 'normal');
  assert.ok(a && a[1] > a[0], `no band ${a}`);
});
