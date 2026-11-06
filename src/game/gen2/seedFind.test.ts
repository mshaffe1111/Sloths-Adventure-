// The golden seed stands in the seed perch (the porter's 11-05 finding, the lead's 11:58 AM priority: the seed's promise failed on Rolls
// A and C). A fork's high road has a `find` socket too, and the first `find` on the stage took the one seed, so the required perch's own
// socket was never filled and the seed sat 34 px over a fork log, far from its perch. The seed goes to the required section's find.
import test from 'node:test';
import assert from 'node:assert/strict';
import '../headlessDom.ts';
import { buildGen2Stage } from './pipeline.ts';
import { provenSeeds } from './seedList.ts';
import { w1World } from './worlds/w1.ts';
import { generateAllLevels } from '../worldsData.ts';

test('gen2 1-1: one golden seed, in the seed perch\'s own find socket (16 proven seeds and Roll A, both settings)', () => {
  const c = generateAllLevels().find((l) => l.id === '1-1')!;
  for (const seed of [79191, ...provenSeeds('1-1').slice(0, 16)]) for (const difficulty of ['normal', 'easy'] as const) {
    const st = buildGen2Stage({ config: c, kit: w1World(), seed, difficulty });
    const seeds = st.collectibles.filter((q) => q.type === 'seed');
    assert.equal(seeds.length, 1, `seed ${seed} ${difficulty}: ${seeds.length} golden seeds`);
    const perch = (st.gen2.sections as Array<{ uid: string; template: string }>).find((q) => q.template === 'w1-seed-perch');
    assert.ok(perch, `seed ${seed} ${difficulty}: no seed perch laid`);
    const fill = st.gen2.fills.find((f) => f.role === 'find' && f.what === 'seed');
    assert.equal(fill?.section, perch!.uid, `seed ${seed} ${difficulty}: the seed went to ${fill?.section} (${(st.gen2.sections as Array<{ uid: string; template: string }>).find((q) => q.uid === fill?.section)?.template}), not the perch ${perch!.uid}`);
    assert.ok(Math.abs(seeds[0].x - fill!.x) < 1, `seed ${seed} ${difficulty}: the seed at x ${seeds[0].x} is not at its socket ${fill!.x}`);
  }
});
