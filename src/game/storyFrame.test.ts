import { test } from 'node:test';
import assert from 'node:assert/strict';
import { capStoryZoom, liftForFeet, MAX_CEL_MAG } from './storyFrame.ts';
import { CEL_K } from './storyCels.ts';

test('a story close-up never draws a figure above 1.5x its cel, and never zooms out past the framing (ST-1)', () => {
  // upright on a phone: the picture is 390 css wide at dpr 2 over 960 scene units: about 0.81 device px a unit
  const up = 0.81;
  const z = capStoryZoom(1.5, up);
  assert.ok(z < 1.5 && z >= 1, `capped to ${z}`);
  assert.ok(up * CEL_K * z <= MAX_CEL_MAG + 1e-9);
  // sideways the picture is 390 css tall at dpr 2 over 540 units: already past the cap at 1, so the plain framing holds
  assert.equal(capStoryZoom(1.35, (390 * 2) / 540), 1);
  // a wide shot is left alone
  assert.equal(capStoryZoom(1, up), 1);
});

test('the picture is raised until the ground is clear of the words box (ST-1)', () => {
  // ground at 0.86 of a 540-unit view, box top at 0.66: raised 0.2
  assert.ok(Math.abs(liftForFeet(0.86 * 540, 540, 0.66, 0.09) - 0.2) < 1e-9);
  // already clear: the usual lift stays
  assert.equal(liftForFeet(0.5 * 540, 540, 0.66, 0.09), 0.09);
  // never more than a third
  assert.equal(liftForFeet(540, 540, 0.5, 0), 0.32);
});
