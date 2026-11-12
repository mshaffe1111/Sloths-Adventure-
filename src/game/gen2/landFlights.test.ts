/**
 * R-165.124: the landing judge's flights (landFlights.data.ts) are the real engine's. Flown again here on both settings and compared
 * point for point: a change to his movement that moves a flight fails this until tools/engine/landflights.ts is run again.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { FLIGHTS, flyLandFlights } from './landFlights.ts';
import { LAND_FLIGHTS } from './landFlights.data.ts';
import { setDifficulty } from '../difficulty.ts';

for (const s of ['normal', 'easy'] as const) {
  test(`the flights in landFlights.data.ts are the engine's, flown again (${s})`, async () => {
    const f = await flyLandFlights(s);
    setDifficulty('normal');
    for (const k of FLIGHTS) assert.deepEqual(LAND_FLIGHTS[s][k], f[k], `${s} ${k}`);
  });
}
test('the flights are what their names say: a walk-off never rises, a double tops a single, a bounce + air jump tops a bounce, straight up stays put', () => {
  const F = LAND_FLIGHTS.normal;
  const apex = (k: keyof typeof F) => -Math.min(...F[k].map((p) => p[1]));
  assert.ok(apex('walk') <= 0, 'a walk-off never rises');
  assert.ok(apex('jump') > 90 && apex('double') > apex('jump') + 60, `${apex('jump')} ${apex('double')}`);
  assert.ok(apex('bounce') > apex('jump') && apex('bounce-air') > apex('bounce') + 60, `${apex('bounce')} ${apex('bounce-air')}`);
  for (const k of ['jump-up', 'double-up'] as const) assert.ok(F[k].every((p) => Math.abs(p[0]) < 1), k);
  for (const k of ['walk', 'jump', 'double', 'bounce', 'bounce-air'] as const) assert.ok(F[k][F[k].length - 1][1] > 600, `${k} flown deep`);
});
