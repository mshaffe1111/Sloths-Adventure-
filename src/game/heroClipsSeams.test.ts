/**
 * R-165.354 (ART-NEXT-e, 11-21, D108): Pokey's idle bridges carry his colours, so there is no colour pop going into a clip or coming
 * out of it. tools/art/hfnext/clipde.py --write measures, from the shipped sheets, the step in mean body colour (Lab dE76, motion-free)
 * at every seam (plain -> bridge, bridge -> clip, clip -> bridge, bridge -> plain) and the median step inside the clip's bridges, into
 * heroClipsSeams.json (CI has no image decoder). This test holds the JSON to the sheets by SHA-256, then holds every seam to the bar:
 * no more than twice the bridges' median step (or under 0.5 dE), and under 1.0 dE always.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { IDLE_CLIPS } from './heroClips.ts';
import { HERO_CLIPS } from './heroClipsData.ts';
import SEAMS from './heroClipsSeams.json' with { type: 'json' };

const sha = (rel: string) => createHash('sha256').update(readFileSync(new URL(rel, import.meta.url))).digest('hex');
type Clip = { sheet_sha256: string; n: number; bridge_median: number; seams: Record<string, number> };
const S = SEAMS as unknown as { bar: { times_median: number; floor: number; ceiling: number }; clips: Record<string, Clip> };

test('the measured seams are of the sheets that ship (re-run tools/art/hfnext/clipde.py --write after any clip sheet change)', () => {
  assert.deepEqual(S.bar, { times_median: 2, floor: 0.5, ceiling: 1.0 }, 'the bar is fixed here, not in the JSON');
  for (const n of IDLE_CLIPS) {
    const c = S.clips[n];
    assert.ok(c, `${n}: not measured`);
    assert.equal(c.sheet_sha256, sha(`../assets/hero/clips/${n}.webp`), `${n}.webp changed since measuring`);
    assert.equal(c.n, HERO_CLIPS[n].n, `${n}: frame count changed since measuring`);
    assert.ok(Object.keys(c.seams).length >= 2, `${n}: fewer than two seams measured`);
  }
});

test('no colour pop at any bridge seam (each seam step <= max(2 x the bridge median, 0.5) dE and < 1.0 dE)', () => {
  for (const n of IDLE_CLIPS) {
    const c = S.clips[n];
    const lim = Math.min(Math.max(2 * c.bridge_median, 0.5), 1.0);
    for (const [k, de] of Object.entries(c.seams)) {
      assert.ok(de <= lim, `${n} step ${k}: ${de} dE colour jump at a seam (limit ${lim.toFixed(2)}; bridge median ${c.bridge_median})`);
    }
  }
});
