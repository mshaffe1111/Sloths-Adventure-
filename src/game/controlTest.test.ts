// The testers' link (#ctest): on only when the address asks for it. The old control course it once opened is deleted (R-165.151); the
// link now plays playRecorder.ts CTEST_LEVEL_ID (ctestCoach.test.ts, ctestCourseGone.test.ts).
import test from 'node:test';
import assert from 'node:assert/strict';
import { ctestEnabled, qaBuild } from './playRecorder.ts';

test('control test: off unless the address asks for it (#ctest or ?ctest=1), and then on in any build, the live site too', () => {
  assert.equal(ctestEnabled(), false);
  assert.equal(qaBuild(), false);
  const g = globalThis as unknown as { location?: unknown };
  const was = g.location;
  g.location = { hash: '#ctest', search: '' };
  assert.equal(ctestEnabled(), true, 'the testers\' link opens it on the live site');
  g.location = { hash: '', search: '?level=1-2' };
  assert.equal(ctestEnabled(), false, 'the full game is unaffected');
  g.location = was;
});
