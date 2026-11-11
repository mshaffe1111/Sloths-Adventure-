// After the help ladder's steps grow, the piece is passed with plain jumps (R-165.62; re-pinned to the re-laid 1-1, INT-1-1). Flown in
// the real engine at 30 fps from the piece's entry to its exit (helpSweep.ts plainRun): hold right; standing, with a face or an edge just
// ahead, a held single jump; never a press in the air (a mushroom's own bounce is allowed: it is the piece's move). Each pinned piece is
// one plain jumps do NOT pass as laid, so the help is what gets him through:
//  - Easy, the 1st listed seed (769), w1-mushroom-bank-teach: a stair that takes in the stump on its floor (the stump take-in rule);
//  - Normal, seed 4106 (the first run), w1-dip-double-teach: the double test gap, a pad at its middle and a stair up to it.
import test from 'node:test';
import assert from 'node:assert/strict';
import './headlessDom.ts';
import { plainThrough } from './helpSweep.ts';

// (and 3868 Normal w1-two-answers: a bounce sets him down at the test gap's lip, and his jump from there overshot the old 60 px pad; the
// pad is now the gap less 100, the lead's ruling 11-11)
for (const [seed, k, setting] of [[769, 'w1-mushroom-bank-teach', 'easy'], [4106, 'w1-dip-double-teach', 'normal'], [3868, 'w1-two-answers', 'normal']] as const) {
  test(`seed ${seed} ${setting}, ${k}: plain jumps fail it as laid; after the steps grow, they pass the whole piece`, (t) => {
    const before = plainThrough(seed, k, setting, false);
    const after = plainThrough(seed, k, setting, true);
    t.diagnostic(`${k} ${setting}: before ${before.ok ? 'passed' : before.why}; ${after.grown} grown, after ${after.ok ? 'passed' : after.why}`);
    assert.ok(!before.ok, 'the piece needs the help (else this pins nothing)');
    assert.ok(after.grown > 0 && after.ok, after.why);
  });
}
