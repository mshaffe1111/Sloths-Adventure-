// Every painted HUD vine ends the way the painted set does (R-165.364, HUD-VINE 11-21): its left end is the lead piece (with its
// leaves) or the painted curl, and its right end is the painted curl or runs off the screen edge. BUILD-23c found the upright HUD's
// lower-row strip over the goal plate (2-5, any count stage whose plate hangs under the hearts) cut square at both ends.
// (VineHud.tsx imports CSS, so it is read here, not rendered.)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('every <PaintedVine> in the HUD ends in a lead or curl on the left, a curl or the screen edge on the right', () => {
  const src = fs.readFileSync(new URL('./VineHud.tsx', import.meta.url), 'utf8');
  const tags = [...src.matchAll(/<PaintedVine\b([^>]*)\/>/g)].map((m) => m[1]);
  assert.ok(tags.length >= 3, `the HUD's painted vines are found (${tags.length})`);
  for (const t of tags) {
    assert.match(t, /\blead\b|\bendL\b/, `left end painted (lead or endL): <PaintedVine${t}/>`);
    assert.match(t, /\bendR\b|ins\.right|vp\.w/, `right end painted (endR) or off the screen edge: <PaintedVine${t}/>`);
  }
});

test('the lower-row strip keeps its curls inside the plate width (its tiles stop where each curl begins)', () => {
  const src = fs.readFileSync(new URL('./VineHud.tsx', import.meta.url), 'utf8');
  const strip = src.match(/<PaintedVine\b[^>]*\by=\{pv\}[^>]*\/>/);
  assert.ok(strip, 'the strip over the goal plate is a PaintedVine at the plate vine line pv');
  assert.match(strip[0], /\bendL\b/);
  assert.match(strip[0], /\bendR\b/);
  assert.match(strip[0], /x0=\{[^}]*vineEndW\(/, 'x0 leaves room for the left curl');
  assert.match(strip[0], /x1=\{[^}]*vineEndW\(/, 'x1 leaves room for the right curl');
});
