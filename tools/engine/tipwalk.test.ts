// npx tsx --test tools/engine/tipwalk.test.ts: the tip walk gate's own test (R-165.236). It must find the climbing stages, pass 1-4 with
// its bands, and fail 1-4 by name with them taken off (x alone, the defect INT-7b found: all four teach lines on the start floor).
import test from 'node:test';
import assert from 'node:assert/strict';
import { tipWalk, verticalStages } from './tipwalk.ts';

test('the walk finds the climbing rolled stages (1-4 among them) and no run', () => {
  const v = verticalStages();
  assert.ok(v.includes('1-4'), `found ${v.join(', ')}`);
  for (const s of ['1-1', '1-2', '1-5']) assert.ok(!v.includes(s), `${s} is a run`);
});

test('1-4 with its bands: no miss, on Normal and Easy, built as asked', () => {
  for (const setting of ['normal', 'easy'] as const) {
    const w = tipWalk('1-4', 1, setting);
    assert.deepEqual(w.misses, [], w.lines.join('\n'));
    assert.match(w.lines[0], new RegExp(`built ${setting} `));
    assert.equal(w.flow, 'up');
  }
});

test('planted: 1-4 with the bands off (x alone) fails by name, both judgments', () => {
  const w = tipWalk('1-4', 1, 'normal', { strip: true });
  assert.ok(w.misses.some((m) => /is said \d+ px of route before its socket, past TIP_NEAR/.test(m)), w.misses.join('\n'));
  assert.ok(w.misses.filter((m) => /said with his feet at \d+, outside its band/.test(m)).length >= 4, w.misses.join('\n'));
});
