import { test } from 'node:test';
import assert from 'node:assert/strict';
import { drawBankArt, protoArtReady, stripSpan } from './protoArt.ts';
import { warmGround } from './groundPaint.ts';
import { buildProtoStage } from './protoStage.ts';
import { generateAllLevels } from './worldsData.ts';
import type { Platform } from './types.ts';

// (QA, 2026-10-27: small phones ran choppy; the long ground banks drew their painted top edge all along the bank every frame, 34 repeats
// for 1-2's 5,700 px bank, where a 320-wide phone shows 3 or 4)

/** the repeats a strip loop draws from `from` to `to`, every `tw - 2` */
function repeats(from: number, to: number, tw: number, x0?: number, x1?: number): number[] {
  const { start, end } = stripSpan(from, to, tw, x0, x1);
  const out: number[] = [];
  for (let x = start; x < end; x += tw - 2) out.push(x);
  return out;
}

test('a strip laid along a long bank keeps only the repeats on screen, each where the full strip has it', () => {
  const tw = 168;
  const all = repeats(1000, 6720, tw);
  for (const x0 of [-500, 900, 1000, 1234.5, 3000, 6500, 7000]) {
    const x1 = x0 + 440;
    const seen = repeats(1000, 6720, tw, x0, x1);
    // every repeat that reaches into the view is drawn, at the same place as in the full strip
    const want = all.filter((x) => x + tw > x0 && x < x1);
    for (const x of want) assert.ok(seen.includes(x), `view ${x0}: the repeat at ${x} is missing`);
    for (const x of seen) assert.ok(all.includes(x), `view ${x0}: a repeat at ${x} the full strip does not have`);
    // and no more than the view's width needs (plus one each side)
    assert.ok(seen.length <= Math.ceil(440 / (tw - 2)) + 2, `view ${x0}: ${seen.length} repeats for a 440 px view`);
  }
  // no view: the whole strip, as before (the journal's scenes)
  assert.deepEqual(repeats(1000, 6720, tw, undefined, undefined), all);
});

// a picture that "loads" at once, so the painted kit counts as ready
class FakeImage {
  onload: null | (() => void) = null;
  onerror: null | (() => void) = null;
  naturalWidth = 2048;
  naturalHeight = 2048;
  set src(_v: string) {
    queueMicrotask(() => this.onload?.());
  }
}

// (the bank: 1-7's, 5,485 px on its first roll. It was 1-2's until fix-petals, 2026-11-01, sank 1-2's stair steps into the ground and
// broke its long bank into pieces under 1,850 px; the rule is about a long bank, whichever stage has it)
test("a long ground bank (1-7's) draws a handful of pieces a frame at a narrow phone's view, wherever the view is", async () => {
  const g = globalThis as unknown as { Image?: unknown };
  const had = g.Image;
  g.Image = FakeImage;
  try {
    protoArtReady();
    warmGround(1);
    await new Promise((r) => setTimeout(r, 0));
    assert.ok(protoArtReady(), 'the kit is ready');
    assert.ok(warmGround(1), "World 1's painted ground is ready");
    const lvl = generateAllLevels().find((l) => l.id === '1-7')!;
    const st = buildProtoStage(lvl, 1, '1-7');
    const banks = st.platforms.filter((p: Platform) => p.height >= 90 && !p.push && !p.broken && !p.art);
    const bank = banks.reduce((a: Platform, b: Platform) => (b.width > a.width ? b : a));
    assert.ok(bank.width > 2000, `a long bank (${Math.round(bank.width)} px)`);
    let n = 0;
    const ctx = new Proxy({}, { get: (_t, k) => (k === 'drawImage' ? () => n++ : () => {}) }) as unknown as CanvasRenderingContext2D;
    // a 320 x 649 phone upright shows 440 px of world
    for (let x0 = bank.x - 300; x0 < bank.x + bank.width; x0 += 97) {
      n = 0;
      drawBankArt(ctx, bank, { left: true, right: true }, false, 0, { x0, x1: x0 + 440 });
      // (hf-art-ground 2026-10-29) the soil tiles on screen (600 units each: 2 across, 2 rows at most), the darkening field (2 at most),
      // the top lip's repeats (700 each: 4 at most) and an end on screen
      assert.ok(n <= 10, `view at ${x0}: ${n} pieces drawn`);
    }
    // the whole bank, with no view given: every repeat, as the journal's scenes draw it
    n = 0;
    drawBankArt(ctx, bank, { left: true, right: true }, false, 0);
    assert.ok(n > 12, `${n} pieces for the whole bank`);
  } finally {
    g.Image = had;
  }
});
