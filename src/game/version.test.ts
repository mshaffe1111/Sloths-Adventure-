import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatBuildTime, BUILD_TIME } from './version.ts';

test('the build stamp formats as a short date and time', () => {
  const s = formatBuildTime('2026-10-19T19:23:01-04:00', 'en-US');
  assert.match(s, /Oct 19, 2026/);
  assert.match(s, /\d{1,2}:\d{2}\s?(AM|PM)/);
});

test('a missing or unreadable stamp shows nothing', () => {
  assert.equal(formatBuildTime(''), '');
  assert.equal(formatBuildTime('not a date'), '');
});

test('outside the build there is no stamp', () => {
  assert.equal(BUILD_TIME, '');
});
