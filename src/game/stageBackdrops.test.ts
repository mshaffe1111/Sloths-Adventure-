/** Worlds 1-4 and 6 go through the day in their far backdrops (stageBackdrops.ts, Matt's new paintings, 2026-10-28). */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { FAR_BY_STAGE, FAR_ONLY, stageBackdropStem } from './stageBackdrops.ts';
import { backdropStem } from './paintedBackdrops.ts';

// ───────────────────────────── backdrops ─────────────────────────────

test('backdrops: Worlds 1-4 go through the day (W1 sunrise, the world\'s own, the kapok; W2 own, rapids, evening; W3 own, the sinkhole, cavern; W4 terraces, own, above the mist)', () => {
  const want: Record<string, string | null> = {
    '1-1': 'w1sunrise', '1-3': 'w1sunrise', '1-4': null, '1-6': null, '1-7': 'w1kapok', '1-9': 'w1kapok', '1-10': null,
    '2-1': null, '2-3': null, '2-4': 'w2rapids', '2-6': 'w2rapids', '2-7': 'w2evening', '2-9': 'w2evening',
    '3-1': null, '3-3': null, '3-4': 'w3sinkhole', '3-5': 'w3sinkhole', '3-6': 'w3cavern', '3-9': 'w3cavern',
    '4-1': 'w4terraces', '4-3': 'w4terraces', '4-5': null, '4-7': 'w4mist', '4-9': 'w4mist',
    '5-1': 'w5', '5-4': 'w5dusk2',
    '6-1': 'w6dawn', '6-3': 'w6dawn', '6-4': null, '6-6': null, '6-7': 'w6dusk', '6-9': 'w6dusk', '6-10': null,
  };
  for (const [id, stem] of Object.entries(want)) assert.equal(stageBackdropStem(id), stem, id);
  // (under the test runner there are no strips to find, so the engine's own pick falls back on the world's set: no picture is assumed)
  assert.equal(backdropStem(1, '1-1'), 'w1');
});

test('backdrops: each new far strip is there at the far layers\' size (2048 x 868), well under the size limit; and the sinkhole is Matt\'s redo', () => {
  assert.deepEqual([...FAR_ONLY].sort(), ['w1kapok', 'w1sunrise', 'w2evening', 'w2rapids', 'w3cavern', 'w3sinkhole', 'w4mist', 'w4terraces', 'w6dawn', 'w6dusk']);
  for (const stem of FAR_ONLY) {
    const f = new URL(`../assets/backdrops/${stem}-far.webp`, import.meta.url);
    const buf = fs.readFileSync(f);
    assert.ok(buf.length < 400 * 1024, `${stem}: ${buf.length}`);
    // the WebP's own size (VP8 lossy: 14 bits each, after the frame tag)
    const i = buf.indexOf('VP8 ');
    assert.ok(i > 0, stem);
    const w = buf.readUInt16LE(i + 14) & 0x3fff;
    const h = buf.readUInt16LE(i + 16) & 0x3fff;
    assert.deepEqual([w, h], [2048, 868], stem);
    // its world's middle and near strips are the ones it borrows
    assert.ok(fs.existsSync(new URL(`../assets/backdrops/w${/^w(\d+)/.exec(stem)![1]}-mid.webp`, import.meta.url)));
  }
});
