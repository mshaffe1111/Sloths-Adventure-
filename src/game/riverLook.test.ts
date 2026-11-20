// npx tsx --test src/game/riverLook.test.ts
/**
 * Two rules of how a river is drawn (ENG-24e 2b and 2c), on the numbers riverArt.ts draws with:
 *   2b: a log on a safe river reads as a solid floor of wood: its waterline (drawSafeRiverOver) crosses its painted body low, at least 60%
 *       down the bark, never at its top (BUILD-24d's stills: the band across the whole river at the surface covered a log from 10 px under
 *       its top, 26% down, so only a sliver read as wood: a faint glass tube on 2-1, 2-2 and 2-4);
 *   2c: under a painted bank the river's water, bed and earth stop at the bank's painted face (groundPaint endFace, the line the bank's
 *       soil is clipped to), never behind it (R-165.323: the 140 px run laid the bed's stones and the earth behind the see-through lower
 *       part of the bank's end piece, with a seam where the run stopped).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { logLineAt, riverWaterOutline } from './riverArt.ts';
import { endFace } from './groundPaint.ts';
import { W2_FRAMES } from './w2PropsData.ts';
import { LOG_DROP, surfaceBelowBank } from './river.ts';

test('2b: a safe river log\'s waterline crosses its painted bark at least 60% of the way down (long and short logs)', () => {
  // (riverArt.ts drawRiverLog: the painting is width * 1.08 wide, its bark's top a fifth of the way down it, laid 2 px under the log's top;
  //  measured here from the frames themselves, not from logPaint, so a change to either shows)
  for (const [n, width] of [['logLong', 150], ['logLong', 200], ['logShort', 120]] as const) {
    const f = W2_FRAMES[n];
    const h = (width * 1.08 * f.h) / f.w;
    const barkTop = 2, barkBottom = 2 + h * 0.8;
    const line = logLineAt({ width });
    const down = (line - barkTop) / (barkBottom - barkTop);
    assert.ok(down >= 0.6 && down < 1, `${n} ${width} px: the waterline ${line.toFixed(1)} px under its top, ${Math.round(down * 100)}% down the bark`);
    // (and under the river's own surface line: it never rides up over the open water's)
    assert.ok(line > surfaceBelowBank - LOG_DROP, `${n} ${width} px: the waterline is under the open water's surface`);
  }
});

test('2c: the river under a painted bank stops at the bank\'s own painted face, both ends; a side with no bank runs straight down', () => {
  const top = 880 + surfaceBelowBank - 40, bottom = 2200;
  const o = riverWaterOutline(2, 10028, 10766, 880, 860, top, bottom);
  const near = endFace(2, 10028, 880, bottom, true), far = endFace(2, 10766, 860, bottom, false);
  const onPath = (pt: [number, number]) => o.some((q) => Math.abs(q[0] - pt[0]) < 1e-6 && Math.abs(q[1] - pt[1]) < 1e-6);
  assert.ok(near.every(onPath), 'every point of the near bank\'s face is on the water\'s outline');
  assert.ok(far.every(onPath), 'every point of the far bank\'s face is on the water\'s outline');
  // (and it never reaches behind a face: below the surface the outline's left edge is the near face, which slopes back in by up to ~71 px,
  //  less than the 140 px run that drew the bed behind it)
  const deepest = Math.min(...near.map((q) => q[0]));
  assert.ok(10028 - deepest > 20 && 10028 - deepest < 140, `the near face slopes back in ${Math.round(10028 - deepest)} px`);
  const leftmost = Math.min(...o.map((q) => q[0]));
  assert.equal(leftmost, deepest, 'nothing of the water is drawn left of the near bank\'s face');
  const bare = riverWaterOutline(2, 500, 900, null, null, top, bottom);
  assert.deepEqual([...new Set(bare.map((q) => q[0]))].sort((a, b) => a - b), [500, 900], 'no painted bank: the water\'s own edges, straight down');
});
