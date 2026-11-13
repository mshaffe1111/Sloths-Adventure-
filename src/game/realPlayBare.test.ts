import { test } from 'node:test';
import assert from 'node:assert/strict';
import './headlessDom.ts';
import { RealPlay } from './realPlay.ts';
import type { Platform } from './types.ts';

// INT-3 (11-13): RealPlay.bare gives a sim a bare world as wide as it likes; the stage's side walls came from the stage it was built on, so
// on a tower (1-4, 1280 wide) every flight sim piece past x 1260 was out of reach and every jump read 39 px (reference/qa-reports/INT-3/
// fly14-invalid). The walls are the travel mode's own (stageModes.ts bounds), made again for the bare world.
const floor = (x: number, w: number): Platform => ({ id: 1, x, y: 5000, width: w, height: 600, type: 'solid' }) as Platform;

for (const id of ['1-4', '1-5', '1-1']) {
  test(`realPlay bare: on ${id} he runs on past where the stage's own walls stood (a sim's world is the sim's)`, () => {
    const r = new RealPlay(id, 1);
    r.bare([floor(100, 6000)]);
    r.stand(2900, 5000);
    for (let i = 0; i < 30; i++) r.frame({ right: true });
    assert.ok(r.p.x > 3100, `${id}: x ${Math.round(r.p.x)} after a second running right from 2900`);
    // and the far side still stops him: the bare world's own wall
    r.stand(60, 5000);
    for (let i = 0; i < 30; i++) r.frame({ left: true });
    assert.ok(r.p.x >= 19 && r.p.x < 60, `${id}: x ${Math.round(r.p.x)}`);
  });
}
