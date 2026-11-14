// After the help ladder's steps grow, the piece is passed with plain jumps (R-165.62; re-pinned to the re-laid 1-1, INT-1-1). Flown in
// the real engine at 30 fps from the piece's entry to its exit (helpSweep.ts plainRun): hold right; standing, with a face or an edge just
// ahead, a held single jump; never a press in the air (a mushroom's own bounce is allowed: it is the piece's move). Each pinned piece is
// one plain jumps do NOT pass as laid, so the help is what gets him through:
//  - Easy, the 1st listed seed, w1-double-teach: the teach's rise and gap, a stair up to it;
//  - Normal, the first run (firstRun11.ts), w1-dip-double-teach: the double test gap, a pad at its middle and a stair up to it;
//  - Normal, seed 5088, w1-bank-double-teach: the bank's double rise, a stair up it.
// Re-pinned by POLISH-9b (R-165.228) on POLISH-7/8's 1-1: the bounce teach is a plain bounce now (it teaches, it does not block), so
// plain jumps pass w1-mushroom-bank-teach as laid and it pins nothing (the stump take-in rule is no longer pinned on a piece here: no
// listed 1-1 layout's ladder grows a stair over a stump in the first 12 seeds swept); w1-two-answers is out of 1-1 (CUT_11_DOUBLES) and the
// ladder is 1-1's only, so its place goes to the third double teach's shape. Swept: every double teach of the first 12 listed layouts,
// both settings, fails plainly as laid and passes once grown (reference/qa-reports/POLISH-9/gates/helpladder-sweep-12.txt).
import test from 'node:test';
import assert from 'node:assert/strict';
import './headlessDom.ts';
import { plainThrough } from './helpSweep.ts';
import { provenSeeds } from './gen2/seedList.ts';
import { FIRST_RUN_11 } from './gen2/firstRun11.ts';

for (const [seed, k, setting] of [[provenSeeds('1-1')[0], 'w1-double-teach', 'easy'], [FIRST_RUN_11.seed, 'w1-dip-double-teach', 'normal'], [5088, 'w1-bank-double-teach', 'normal']] as const) {
  test(`seed ${seed} ${setting}, ${k}: plain jumps fail it as laid; after the steps grow, they pass the whole piece`, (t) => {
    const before = plainThrough(seed, k, setting, false);
    const after = plainThrough(seed, k, setting, true);
    t.diagnostic(`${k} ${setting}: before ${before.ok ? 'passed' : before.why}; ${after.grown} grown, after ${after.ok ? 'passed' : after.why}`);
    assert.ok(!before.ok, 'the piece needs the help (else this pins nothing)');
    assert.ok(after.grown > 0 && after.ok, after.why);
  });
}
