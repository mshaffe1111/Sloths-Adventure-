// The cast on the court's tempo toy (2-9's NEW 1, ENG-29d; rule 21: the bots on a new piece first): on a locked court the liana and the
// river keep one clock, so a let-go moment that misses misses on every bar. GREEN: the two runs that hung on a liana to a rescue before
// the bot pressed on the drum's ONE (middle Easy seed 2 at its first liana, the expert Normal seed 1) finish clean. RED by name: the same
// court with NO drum (no tempo: 2-4's own swing, 2.85 s, and the court river's log every 2.85 s still keep one clock, but there is no ONE to
// press on), the expert hangs on a liana with no way on, to a rescue. (A ONE that misses is refused by gen2 itself: tempoToy.test.ts.)
import test from 'node:test';
import assert from 'node:assert/strict';
import { tempoCast } from './tempoToys.ts';

test('tempo toy cast: the runs that hung on a locked liana finish clean (the press on ONE)', () => {
  for (const [bot, setting, seed] of [['middle', 'easy', 2], ['expert', 'normal', 1]] as const) {
    const r = tempoCast(bot, setting, seed);
    assert.ok(r.pass && r.rescues === 0, `${bot} ${setting} seed ${seed}: ${r.end}, rescues ${r.rescues}, stuck ${JSON.stringify(r.stuck.slice(0, 2))}`);
  }
});

test('tempo toy cast (planted): the court without its drum, the expert Normal seed 1 hangs on a liana with no way on, to a rescue', () => {
  const r = tempoCast('expert', 'normal', 1, { tempo: null });
  assert.ok(!r.pass && r.rescues >= 1, `planted: ${r.end}, rescues ${r.rescues}`);
  assert.ok(r.stuck.some((s) => /on a vine at \d+,\d+ with no way on/.test(s.what)), JSON.stringify(r.stuck.slice(0, 3)));
});
