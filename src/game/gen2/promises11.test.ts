// 1-1's player promises as the proven list's filter (promises11.ts, the lead's 0.9.5 rulings): planted both ways.
import test from 'node:test';
import assert from 'node:assert/strict';
import '../headlessDom.ts';
import { floorlessGaps, promiseBreaches11 } from './promises11.ts';
import { G } from '../protoStage.ts';
import type { Platform } from '../types.ts';

const P = (id: number, x: number, y: number, width: number): Platform => ({ id, x, y, width, height: 300, type: 'solid', style: 'moss_stone' });

test('an unmarked floorless gap is a breach; inside a soft zone it is not (planted)', () => {
  const ps = [P(1, 0, G, 600), P(2, 800, G, 600), P(3, 1600, G, 600)];
  assert.equal(floorlessGaps({ platforms: ps }).length, 2);
  assert.deepEqual(floorlessGaps({ platforms: ps, heartFalls: [{ x0: 600, x1: 800, soft: true }] }).map(([x0]) => Math.round(x0)), [1400]);
});

test('the double after its teach: a gap only the double crosses with a soft zone under it keeps it; none, or a bare one, breaks it (planted)', () => {
  // (R-165.61: "only the double crosses" on the flown arcs, reach.ts: one jump at its best crosses 246, a double flick 283 from 70 px;
  // the old closed-form 200 px gap is now a gap one jump crosses)
  const ps = [P(1, 0, 600, 500), P(2, 760, 600, 500)];
  const base = { config: { levelHeight: 2000 }, gen2: { nodes: [{ token: 'Tg2>', x0: 0 }] } };
  assert.deepEqual(promiseBreaches11({ ...base, platforms: ps, heartFalls: [{ x0: 500, x1: 760, soft: true }] }), []);
  assert.match(promiseBreaches11({ ...base, platforms: [P(1, 0, 600, 500), P(2, 700, 600, 500)], heartFalls: [{ x0: 500, x1: 700, soft: true }] }).join(';'), /no gap only the second jump/, '200 px: one jump crosses it');
  assert.deepEqual(promiseBreaches11({ ...base, platforms: [P(1, 0, 600, 500), P(2, 700, 600, 500)] }, 'easy').filter((b) => /second jump|double gap/.test(b)), [], 'Easy: the double promises are not judged (registry settings)');
  assert.match(promiseBreaches11({ ...base, platforms: ps }).join(';'), /nothing under the double gap/);
  assert.match(promiseBreaches11({ ...base, platforms: [P(1, 0, 600, 500), P(2, 560, 600, 500)] }).join(';'), /no gap only the second jump/);
});
