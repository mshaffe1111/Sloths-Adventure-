/** Worlds 1-4 and 6 go through the day in their far backdrops (stageBackdrops.ts, Matt's new paintings, 2026-10-28). */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { FAR_BY_STAGE, FAR_ONLY, stageBackdropStem } from './stageBackdrops.ts';
import { backdropStem } from './paintedBackdrops.ts';

// ───────────────────────────── backdrops ─────────────────────────────

test('backdrops: every world alternates three or four painted sets, its early light first and its late light last, and no two neighbouring stages share a set (hf-backdrops2)', () => {
  const want: Record<string, string | null> = {
    '1-1': 'w1sun2', '1-2': 'w1rain', '1-4': null, '1-6': 'w1b', '1-9': 'w1kapok', '1-10': null,
    '2-1': 'w2mist', '2-2': null, '2-4': 'w2rapids', '2-9': 'w2evening',
    '3-1': null, '3-2': 'w3crystal', '3-4': 'w3sinkhole', '3-9': 'w3cavern',
    '4-1': 'w4terraces', '4-2': 'w4storm', '4-4': null, '4-9': 'w4mist',
    '5-1': 'w5', '5-4': 'w5dusk2',
    '6-1': 'w6dawn', '6-4': 'w6moon', '6-5': null, '6-9': 'w6dusk', '6-10': null,
    '7-1': 'w7dawn', '7-2': 'w7court', '7-4': null, '7-9': 'w7dusk', '7-10': null,
    '8-1': 'w8dawn', '8-2': 'w8sunset', '8-4': null, '8-9': 'w8night', '8-10': null,
    '9-1': 'w9dawn', '9-2': 'w9ash', '9-4': null, '9-9': 'w9night', '9-10': null,
    '10-1': 'w10dusk', '10-2': 'w10gale', '10-5': null, '10-7': 'w10storm', '10-9': 'w10storm', '10-10': null,
  };
  for (const [id, stem] of Object.entries(want)) assert.equal(stageBackdropStem(id), stem, id);
  for (const w of [1, 2, 3, 4, 6, 7, 8, 9, 10]) {
    for (let n = 1; n <= 9; n++) assert.notEqual(stageBackdropStem(`${w}-${n}`), stageBackdropStem(`${w}-${n + 1}`), `${w}-${n} and ${w}-${n + 1}`);
    assert.ok(new Set(Array.from({ length: 9 }, (_, i) => stageBackdropStem(`${w}-${i + 1}`))).size >= 4, `world ${w}: 4 sets`);
  }
  // (World 10's rain still falls under every sky: its clear skies, w10after and w10night, wait for it to end; its new sets are storms)
  assert.ok(!FAR_ONLY.includes('w10after') && !FAR_ONLY.includes('w10night'));
  // (under the test runner there are no strips to find, so the engine's own pick falls back on the world's set: no picture is assumed)
  assert.equal(backdropStem(1, '1-1'), 'w1');
});

test('backdrops: each new far strip is there at the far layers\' height (1302, native resolution: X-16; seamless: VI-4), well under the size limit; and the sinkhole is Matt\'s redo', () => {
  assert.deepEqual([...FAR_ONLY].sort(), ['w10dusk', 'w10gale', 'w10storm', 'w1b', 'w1kapok', 'w1rain', 'w1sun2', 'w1sunrise', 'w2evening', 'w2mist', 'w2rapids', 'w3cavern', 'w3crystal', 'w3sinkhole', 'w4mist', 'w4storm', 'w4terraces', 'w6dawn', 'w6dusk', 'w6moon', 'w7court', 'w7dawn', 'w7dusk', 'w8dawn', 'w8night', 'w8sunset', 'w9ash', 'w9dawn', 'w9night']);
  for (const stem of FAR_ONLY) {
    const f = new URL(`../assets/backdrops/${stem}-far.webp`, import.meta.url);
    const buf = fs.readFileSync(f);
    assert.ok(buf.length < 400 * 1024, `${stem}: ${buf.length}`);
    // the WebP's own size (VP8 lossy: 14 bits each, after the frame tag)
    const i = buf.indexOf('VP8 ');
    assert.ok(i > 0, stem);
    const w = buf.readUInt16LE(i + 14) & 0x3fff;
    const h = buf.readUInt16LE(i + 16) & 0x3fff;
    // (repainted at native resolution, X-16 2026-10-29: 1302 tall, as the middle strips; seamless, so a little narrower than 2.03x)
    assert.equal(h, 1302, stem);
    assert.ok(w >= 2100 && w <= 2800, `${stem}: ${w} wide`);
    // its world's middle and near strips are the ones it borrows
    assert.ok(fs.existsSync(new URL(`../assets/backdrops/w${/^w(\d+)/.exec(stem)![1]}-mid.webp`, import.meta.url)));
  }
});

test("1-3 plays its own sunrise again, on the far strip REPAINTED without the edge orchids that met where it wraps (F13's stills, 11-12: one big white shape behind 1-3's route)", () => {
  // (the repaint is ART-W1B's, passed by the lead: no orchids, log or branch; its wrap join 1.69 against 0.69 between any two columns,
  //  the old far's 12.9, measured by tools/art/sky13/seam.py. This pins THAT file: the orchid strip cannot come back unseen; a new
  //  repaint changes the pin with its own join measure. No image decoder is in the game's tests, so the join is measured there)
  assert.equal(stageBackdropStem('1-3'), 'w1sunrise');
  const buf = fs.readFileSync(new URL('../assets/backdrops/w1sunrise-far.webp', import.meta.url));
  assert.equal(createHash('sha256').update(buf).digest('hex').slice(0, 16), '1ee64942f0d2301d', 'w1sunrise-far.webp is not the repaint the lead passed');
});
