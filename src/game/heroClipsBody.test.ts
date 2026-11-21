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

/**
 * R-165.378 (ART-HERO, 11-21, D108): the same bar for EVERY hero sheet the game draws frames of, not only the idles: every clip in
 * HERO_CLIPS and the two-vine climb (hero-climb2.webp). tools/art/hfnext/herobody.py --write measures them into heroBody.json; this holds
 * that JSON to the shipped sheets by SHA-256, so a sheet changed without re-measuring fails. A sheet not regraded yet sits in
 * heroBody.known.json at the numbers it had (shrink-only: knowncheck.mjs fails an added row; this fails a row that got worse, and a row
 * that now passes the bar and is still listed).
 */
import { HERO_CLIPS } from './heroClipsData.ts';
import BODY from './heroBody.json' with { type: 'json' };
import KNOWN from './heroBody.known.json' with { type: 'json' };

type Sheet = { sheet: string; sheet_sha256: string; frames: number; frame_max: number; frame_max_at: number; pooled: number };
const B = BODY as unknown as { bar: { frame_max: number; pooled: number }; plain_sha256: string; sheets: Record<string, Sheet> };
const K = KNOWN as unknown as { known: Array<{ sheet: string; frame_max: number; pooled: number; why: string }> };
const HERO_SHEETS = [...Object.keys(HERO_CLIPS), 'hero-climb2'];

test('every hero sheet was measured, as it ships (re-run tools/art/hfnext/herobody.py --write after any hero sheet changes)', () => {
  assert.deepEqual(B.bar, { frame_max: 2.0, pooled: 1.0 }, 'the bar is fixed here, not in the JSON');
  assert.equal(B.plain_sha256, sha('../assets/hero/hero-standard.webp'), 'hero-standard.webp changed since measuring');
  assert.deepEqual(Object.keys(B.sheets).sort(), [...HERO_SHEETS].sort(), 'heroBody.json measures a different set of sheets than the game draws');
  for (const n of HERO_SHEETS) assert.equal(B.sheets[n].sheet_sha256, sha(`../../${B.sheets[n].sheet}`), `${n}: ${B.sheets[n].sheet} changed since measuring`);
});

test('every hero sheet is the same sloth as the plain pose (fur: each frame <= 2.0 dE, the sheet pooled <= 1.0 dE), or a known row no worse', () => {
  const known = new Map(K.known.map((k) => [k.sheet, k]));
  const bad: string[] = [];
  for (const n of HERO_SHEETS) {
    const s = B.sheets[n]; const k = known.get(n);
    const passes = s.frame_max <= B.bar.frame_max && s.pooled <= B.bar.pooled;
    if (k) {
      if (passes) bad.push(`${n} now passes the bar (worst frame ${s.frame_max}, pooled ${s.pooled}): take it off heroBody.known.json`);
      else if (s.frame_max > k.frame_max || s.pooled > k.pooled) bad.push(`${n} got further from the plain pose (worst frame ${s.frame_max} vs ${k.frame_max} listed, pooled ${s.pooled} vs ${k.pooled})`);
      continue;
    }
    if (s.frame_max > B.bar.frame_max) bad.push(`${n} frame ${s.frame_max_at}: fur ${s.frame_max} dE off the plain pose (limit ${B.bar.frame_max})`);
    if (s.pooled > B.bar.pooled) bad.push(`${n}: its frames' fur is ${s.pooled} dE off the plain pose (limit ${B.bar.pooled})`);
  }
  assert.deepEqual(bad, [], 'hero sheets off the plain pose');
  for (const k of K.known) assert.ok(HERO_SHEETS.includes(k.sheet), `heroBody.known.json lists ${k.sheet}, which is not a hero sheet`);
});
