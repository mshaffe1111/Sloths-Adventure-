import test from 'node:test';
import assert from 'node:assert/strict';
import { stillSpots } from './stillSpots.ts';

test('stills spots: from gen2 meta, the start, both roads of every fork, the double teach block, the seed and the end log', () => {
  const st = { spawnX: 100, exitTotemX: 9000, collectibles: [{ type: 'seed', x: 5000 }],
    gen2: { nodes: [{ token: 'A', x0: 0, x1: 1300 }, { token: 'Tg2<', x0: 2000, x1: 3000, block: 2600 }, { token: 'F[Pc2^+|Pg1]<', x0: 3000, x1: 4500 }] } };
  assert.deepEqual(stillSpots(st).map(([n, x, r]) => `${n}@${x}/${r}`), ['start@180/low', 'fork-high@3120/high', 'fork-low@3120/low', 'double-teach-block@2600/low', 'golden-seed@4900/low', 'end-log@8800/low']);
  const noBlock = { ...st, gen2: { nodes: [{ token: 'Tg2<', x0: 2000, x1: 3000 }] } };
  assert.ok(stillSpots(noBlock).some(([n, x]) => n === 'double-teach-block' && x === 2500));
});
