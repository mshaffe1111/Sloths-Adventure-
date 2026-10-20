import test from 'node:test';
import assert from 'node:assert/strict';
import { versionDiffers, updateAvailable, checkForUpdate } from './updates.ts';

test('a different published stamp means a newer build; a missing one means "cannot tell"', () => {
  assert.equal(versionDiffers('2026-10-20T16:00:00-04:00', '2026-10-19T19:23:01-04:00'), true);
  assert.equal(versionDiffers('2026-10-19T19:23:01-04:00', '2026-10-19T19:23:01-04:00'), false);
  assert.equal(versionDiffers('', '2026-10-19T19:23:01-04:00'), false);
  assert.equal(versionDiffers(undefined, '2026-10-19T19:23:01-04:00'), false);
  assert.equal(versionDiffers('2026-10-20T16:00:00-04:00', ''), false, 'an unstamped copy (tests, previews) never claims an update');
});

test('outside a stamped build, checking says "unknown" and nothing is flagged', async () => {
  assert.equal(await checkForUpdate(), 'unknown');
  assert.equal(updateAvailable(), false);
});
