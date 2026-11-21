/**
 * R-165.377 (ART-REGRADE, 11-21, D108): Pokey is one sloth in every idle. The old idle clips were painted with his fur about 5-7 dE
 * paler and beiger than his plain pose (less red, less yellow); tools/art/hfnext/regrade.py moved them onto the plain pose's palette.
 * tools/art/hfnext/clipde.py --write measures, from the shipped sheets, each frame's mean FUR colour (solid px, not the outline, not the
 * eyes' whites) against the plain pose's (hero-standard.webp), into heroClipsSeams.json (CI has no image decoder; the seams test holds
 * the JSON to the sheets by SHA-256). This test holds the plain pose to its hash too, then every idle clip to the bar: every frame within
 * 2.0 dE of the plain pose's fur, and the clip's own frames pooled (the bridges left out) within 1.0 dE.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { IDLE_CLIPS } from './heroClips.ts';
import SEAMS from './heroClipsSeams.json' with { type: 'json' };

const sha = (rel: string) => createHash('sha256').update(readFileSync(new URL(rel, import.meta.url))).digest('hex');
type Body = { frame_max: number; frame_max_at: number; own_pooled: number };
const S = SEAMS as unknown as { body_bar: { frame_max: number; own_pooled: number }; plain_sha256: string; clips: Record<string, { body: Body }> };

test('the idle clips were measured against the plain pose that ships (re-run tools/art/hfnext/clipde.py --write after it changes)', () => {
  assert.deepEqual(S.body_bar, { frame_max: 2.0, own_pooled: 1.0 }, 'the bar is fixed here, not in the JSON');
  assert.equal(S.plain_sha256, sha('../assets/hero/hero-standard.webp'), 'hero-standard.webp changed since measuring');
  for (const n of IDLE_CLIPS) assert.ok(S.clips[n]?.body, `${n}: its fur colour was not measured`);
});

test('every idle clip is the same sloth as the plain pose (fur colour: each frame <= 2.0 dE, the clip pooled <= 1.0 dE)', () => {
  for (const n of IDLE_CLIPS) {
    const b = S.clips[n].body;
    assert.ok(b.frame_max <= S.body_bar.frame_max, `${n} frame ${b.frame_max_at}: fur ${b.frame_max} dE off the plain pose (limit ${S.body_bar.frame_max})`);
    assert.ok(b.own_pooled <= S.body_bar.own_pooled, `${n}: its own frames' fur is ${b.own_pooled} dE off the plain pose (limit ${S.body_bar.own_pooled})`);
  }
});
