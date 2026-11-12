/**
 * World 1's ground seams (RF2, the lead 2026-11-12): the soil fills are sampled clear of the dark their lossy sheet bled into their edges,
 * and a floor's lip runs on under a short raised bank between two floors.
 *   npx tsx --test src/game/groundSeams.test.ts
 */
import './headlessDom.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { FILL_INSET, fillSrc } from './groundPaint.ts';
import { GROUND_FRAMES } from './groundAtlasData.ts';
import { stepFootLips } from './protoArt.ts';
import { paintedBank } from './w1Pits.ts';
import { RealPlay } from './realPlay.ts';
import type { Platform } from './types.ts';

test('every soil fill, in every world, is sampled at least 3 sheet pixels in from each edge (the WebP bleed: World 1 fill 2 falls 60 -> 36 over its last 3 rows, a hairline along every soil row, R-165.146 / R-165.129)', () => {
  assert.ok(FILL_INSET >= 3, `FILL_INSET ${FILL_INSET}: the bleed is 3 rows deep`);
  let n = 0;
  for (const [w, g] of Object.entries(GROUND_FRAMES)) {
    for (const f of g.fills) {
      const [sx, sy, sw, sh] = fillSrc(f);
      const where = `world ${w} fill at ${f.x},${f.y}`;
      assert.ok(sx >= f.x + 3 && sy >= f.y + 3, `${where}: sampled from its top or left edge rows`);
      assert.ok(sx + sw <= f.x + f.w - 3 && sy + sh <= f.y + f.h - 3, `${where}: sampled from its bottom or right edge rows`);
      // (and only those: the rest of the fill is used, so a tile still reads as the painted soil at its size)
      assert.ok(sw >= f.w - 8 && sh >= f.h - 8, `${where}: cut more than the bleed`);
      n++;
    }
  }
  assert.ok(n >= 30, `${n} fills checked`);
});

const P = (x: number, x1: number, y: number, extra: Partial<Platform> = {}): Platform => ({ id: x, x, y, width: x1 - x, height: 90, type: 'solid', ...extra }) as Platform;

test("a floor's lip runs on under a short raised bank between two floors, and only there (R-165.146: W1C's 1-3 box under the bank)", () => {
  // the 1-3 case: a moss stone 38 above the log floor either side
  assert.deepEqual(stepFootLips([P(7991, 8308, 580), P(8308, 8473, 542), P(8473, 9118, 580)]), [{ x0: 8308, x1: 8473, y: 580 }]);
  // a run of two raised pieces at different heights, still under SHORT_STEP: one lip under the whole run
  assert.deepEqual(stepFootLips([P(0, 500, 580), P(500, 560, 545), P(560, 620, 530), P(620, 900, 580)]), [{ x0: 500, x1: 620, y: 580 }]);
  // a run that ends at a drop (no floor beyond it) keeps its own painted end: no lip
  assert.deepEqual(stepFootLips([P(0, 500, 580), P(500, 660, 542), P(800, 900, 580)]), []);
  // a tall step (SHORT_STEP or more) has its full end face, faded: no lip
  assert.deepEqual(stepFootLips([P(0, 500, 580), P(500, 660, 500), P(660, 900, 580)]), []);
  // floors at different heights either side: no lip (which floor's would it be)
  assert.deepEqual(stepFootLips([P(0, 500, 580), P(500, 660, 542), P(660, 900, 570)]), []);
  // a pit's low steps (soil) and a hollow's hurt floor are not floors
  assert.deepEqual(stepFootLips([P(0, 500, 580, { soil: true }), P(500, 660, 542), P(660, 900, 580, { soil: true })]), []);
  assert.deepEqual(stepFootLips([P(0, 500, 580), P(500, 660, 542, { soil: true }), P(660, 900, 580)]), []);
});

test("on 1-3's designed roll, every short raised bank between two floors gets the floor's lip under it", () => {
  const r = new RealPlay('1-3', 1);
  const banks: Platform[] = (r.e.platforms as Platform[]).filter(paintedBank);
  const lips = stepFootLips(banks);
  let raised = 0;
  for (const p of banks) {
    if (p.soil) continue;
    const L = banks.find((q) => !q.soil && Math.abs(q.x + q.width - p.x) < 2 && q.y > p.y + 2 && q.y - p.y < 60);
    const R = banks.find((q) => !q.soil && Math.abs(q.x - (p.x + p.width)) < 2 && L && Math.abs(q.y - L.y) < 2);
    if (!L || !R) continue;
    raised++;
    assert.ok(lips.some((f) => f.x0 <= p.x + 1 && f.x1 >= p.x + p.width - 1 && Math.abs(f.y - L.y) < 2), `the bank at ${Math.round(p.x)} (${Math.round(L.y - p.y)} up) has no floor lip under it`);
  }
  assert.ok(raised >= 10, `${raised} raised banks found on 1-3`);
});

test("a backdrop strip's foot (below its painted bottom, over a chasm) is its bottom edge averaged into soft columns and darkened downward, never its last rows stretched into streaks (R-165.129: 1-1's low log)", async () => {
  const { stripFoot, FOOT_W, FOOT_H, FOOT_DARK } = await import('./scenery.ts');
  const calls: Array<{ src: unknown; a: number[] }> = [];
  const stops: string[] = [];
  const doc = (globalThis as { document: { createElement: unknown } }).document;
  const was = doc.createElement;
  doc.createElement = () => {
    const cv = { width: 0, height: 0, getContext: () => g };
    const g = {
      canvas: cv, imageSmoothingEnabled: false, imageSmoothingQuality: 'low', globalCompositeOperation: 'source-over', fillStyle: '',
      drawImage: (src: unknown, ...a: number[]) => void calls.push({ src: src === cv ? 'self' : 'strip', a }),
      createLinearGradient: () => ({ addColorStop: (_o: number, c: string) => void stops.push(c) }),
      fillRect: () => {},
    };
    return cv;
  };
  try {
    const strip = {} as CanvasImageSource;
    const foot = stripFoot(strip, 0, 970, 2000, 30);
    assert.ok(foot && foot.width === FOOT_W && foot.height === FOOT_H, 'a foot of FOOT_W x FOOT_H');
    const fromStrip = calls.filter((c) => c.src === 'strip');
    assert.equal(fromStrip.length, 1, 'the strip is read once');
    // (its bottom rows, averaged down to FOOT_W columns and one row: no line of it is stretched down the screen)
    assert.deepEqual(fromStrip[0].a, [0, 970, 2000, 30, 0, 0, FOOT_W, 1]);
    assert.ok(FOOT_W <= 64, `${FOOT_W} columns: few enough that no painted mark survives as a streak`);
    assert.ok(stops.some((c) => c.includes(`${FOOT_DARK})`)) && FOOT_DARK >= 0.3, 'darker with depth by the bottom');
  } finally {
    doc.createElement = was;
  }
});
