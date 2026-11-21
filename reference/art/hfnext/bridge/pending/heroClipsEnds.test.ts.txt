/**
 * R-165.354 (ART-NEXT-c, 11-21): every idle clip starts and ends on Pokey's plain standing pose, so the melt between the plain hero and
 * a clip never shows two outlines. The numbers are measured from the shipped sheets by tools/art/hfnext/idleends.py into
 * heroClipsEnds.json (CI has no image decoder); this test holds the JSON to the sheets by SHA-256, so a sheet changed without
 * re-measuring fails here, then holds every end frame to the plain frame: feet, body box and head within 2 px, silhouette xor under 2%.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { IDLE_CLIPS } from './heroClips.ts';
import { HERO_CLIPS } from './heroClipsData.ts';
import ENDS from './heroClipsEnds.json' with { type: 'json' };

const sha = (rel: string) => createHash('sha256').update(readFileSync(new URL(rel, import.meta.url))).digest('hex');
type End = { box: number[]; feet: number[]; head: number[]; xor: number; dmax: number };
const E = ENDS as unknown as { plain: { sheet_sha256: string }; clips: Record<string, { sheet_sha256: string; n: number; first: End; last: End }> };

test('the measured ends are of the sheets that ship (re-run tools/art/hfnext/idleends.py after any clip or hero sheet change)', () => {
  assert.equal(E.plain.sheet_sha256, sha('../assets/hero/hero-standard.webp'), 'hero-standard.webp changed since measuring');
  for (const n of IDLE_CLIPS) {
    const c = E.clips[n];
    assert.ok(c, `${n}: not measured`);
    assert.equal(c.sheet_sha256, sha(`../assets/hero/clips/${n}.webp`), `${n}.webp changed since measuring`);
    assert.equal(c.n, HERO_CLIPS[n].n, `${n}: frame count changed since measuring`);
  }
});

test('every idle clip starts and ends on the plain pose (feet, body, head within 2 px; silhouette xor under 2%)', () => {
  for (const n of IDLE_CLIPS) {
    for (const tag of ['first', 'last'] as const) {
      const f = E.clips[n][tag];
      assert.ok(f.dmax <= 2, `${n} ${tag} frame: ${f.dmax} px off the plain pose (box ${f.box}, feet ${f.feet}, head ${f.head})`);
      assert.ok(f.xor < 0.02, `${n} ${tag} frame: silhouette xor ${(f.xor * 100).toFixed(1)}% of the plain pose`);
    }
  }
});
