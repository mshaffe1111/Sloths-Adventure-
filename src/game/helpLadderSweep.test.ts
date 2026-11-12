// What the help ladder would grow, on every listed 1-1 seed and both settings (R-165.62; INT-1-1 item 3 on the re-laid 1-1): at every
// piece, every grown rock stands on something (ground, a log or the rock below it: never in the air), no face is taller than 60 px, no
// rock is sunk, no two grown boxes overlap. Planks (pads) may float (Matt, 11-06). The checker (helpSweep.ts breaches) is its own,
// independent of the stair builder it judges. Where the ladder may promise a step (canGrowAt), the step grows, and plain jumps pass the
// piece after it: flown here on every 10th listed seed (the full flight over all 200 is tools/inspect/helpSweep.ts --fly).
import test from 'node:test';
import assert from 'node:assert/strict';
import './headlessDom.ts';
import { PROVEN_SEEDS } from './gen2/provenSeeds.ts';
import { plainThrough, sweepSeed } from './helpSweep.ts';

const seeds = PROVEN_SEEDS['1-1'].seeds;
for (const setting of ['easy', 'normal'] as const) {
  test(`every listed 1-1 seed on ${setting}: every grown rock stands, no face over 60 px, none sunk; Dot promises only a step that grows`, (t) => {
    const bad: string[] = [];
    let rocks = 0, grow = 0, none = 0;
    for (const sd of seeds) {
      const s = sweepSeed(sd, setting);
      rocks += s.rocks;
      grow += s.grow.length;
      none += s.none.length;
      for (const b of s.breaches) bad.push(`seed ${sd} ${b}`);
    }
    t.diagnostic(`${setting}: ${rocks} rocks over ${seeds.length} seeds; a step may be promised at ${grow} piece-seeds, never at ${none}`);
    assert.ok(seeds.length >= 200 && rocks > 0 && grow > 0, 'the sweep covered the list and grew rocks');
    const kinds = ['floats', 'px face', 'px up', 'overlap', 'sunk'].map((k) => `${k}: ${bad.filter((v) => v.includes(k)).length}`).join(', ');
    assert.deepEqual(bad.slice(0, 8), [], `${bad.length} breaches over ${seeds.length} seeds (${rocks} rocks): ${kinds}`);
  });

  test(`1-1 on ${setting}, every 10th listed seed: where a step may be promised it grows, and plain jumps then pass the whole piece`, () => {
    const bad: string[] = [];
    let flown = 0;
    for (const sd of seeds.filter((_, i) => i % 10 === 0)) {
      for (const k of sweepSeed(sd, setting).grow) {
        const f = plainThrough(sd, k, setting, true);
        flown++;
        if (f.grown === 0) bad.push(`seed ${sd} ${k}: promised, nothing grew`);
        else if (!f.ok) bad.push(`seed ${sd} ${k}: ${f.why}`);
      }
    }
    assert.ok(flown > 50, `${flown} flown`);
    assert.deepEqual(bad, []);
  });
}
