// npx tsx --test src/game/groundEnd.test.ts
/**
 * The bank end's rock is solid (ENG-24h, R-165.323 2c): groundPaint.ts solidEndAlpha on a made-up piece shaped like the sheets' (a rim
 * along the face fading inward over 50 px, its last 120 rows faded out, a hanging root off its face, a crack in it), and the face line the
 * soil is cut to lying on or inside the rock (groundAtlasData face, tools/art/hfground/endface.py). The real pieces are checked on the page
 * by tools/perf/endcheck.mjs.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { END_SOLID, solidEndAlpha } from './groundPaint.ts';
import { GROUND_FRAMES } from './groundAtlasData.ts';

const W = 200, H = 300, EDGE = 160;
function piece(): Uint8ClampedArray {
  const a = new Uint8ClampedArray(W * H);
  for (let y = 0; y < H; y++) {
    const footFade = Math.max(0, Math.min(1, (H - 1 - y) / 120));
    for (let x = 0; x <= EDGE; x++) {
      const rim = Math.max(0, Math.min(1, 1 - (EDGE - x - 40) / 50));
      a[y * W + x] = Math.round(255 * rim * footFade);
    }
    // (a root hanging off the face, 4 px wide, 10 px out)
    for (let x = EDGE + 10; x < EDGE + 14; x++) a[y * W + x] = Math.round(255 * footFade);
  }
  // (a crack in the rock, clear, 6 px wide, rows 100-110)
  for (let y = 100; y < 110; y++) for (let x = EDGE - 20; x < EDGE - 14; x++) a[y * W + x] = 0;
  return a;
}

test('2c: the rock is solid from its face in to the rim, down to its last rows; it is only ever raised', () => {
  const a = piece();
  const s = solidEndAlpha(a, W, H);
  const at = (arr: ArrayLike<number>, x: number, y: number) => arr[y * W + x];
  // (the made-up piece is see-through inside its rock today: the plant)
  assert.ok(at(a, EDGE - 60, 150) < 250 && at(a, EDGE - 5, H - 40) < 250, 'the made-up piece is see-through in its rock (the plant)');
  for (let y = 0; y < H - END_SOLID.foot; y++) {
    for (let x = EDGE - Math.min(60, END_SOLID.rim); x <= EDGE; x++) assert.equal(at(s, x, y), 255, `solid at ${x},${y}`);
  }
  // (the crack: solid; the root: the paint's own; outside the rock and its root: clear)
  assert.equal(at(s, EDGE - 17, 105), 255, 'a crack in the rock is made solid');
  assert.equal(at(s, EDGE + 11, 150), at(a, EDGE + 11, 150), 'a hanging root keeps its own alpha');
  assert.equal(at(s, EDGE + 5, 150), 0, 'the gap between the rock and its root stays clear');
  // (it hands over to the soil inward within the feather, and fades at its foot)
  assert.ok(at(s, EDGE - END_SOLID.rim - END_SOLID.feather - 4, 150) === at(a, EDGE - END_SOLID.rim - END_SOLID.feather - 4, 150), 'past the feather: the paint\'s own');
  assert.ok(at(s, EDGE - 5, H - 1) === at(a, EDGE - 5, H - 1), 'its very last row: the paint\'s own');
  for (let i = 0; i < a.length; i++) assert.ok(s[i] >= a[i], `never lowered (${i})`);
});

test('2c: every world\'s face line (the soil\'s and the river\'s cut) has 25 points (World 1: its old 9), starting at the corner or in', () => {
  for (const [w, g] of Object.entries(GROUND_FRAMES)) {
    for (const e of g.ends ?? [g.end]) {
      assert.equal(e.face.length, w === '1' ? 9 : 25, `w${w}: ${w === '1' ? '9 (World 1 keeps pack.py\'s line, endface.py KEEP)' : '25'} face points`);
      assert.ok(e.face[0] <= e.cx + 1e-9, `w${w}: the face starts at the corner or in`);
      for (const f of e.face) assert.ok(f > 0.2 && f < 1, `w${w}: face share ${f} on the piece`);
    }
  }
});
