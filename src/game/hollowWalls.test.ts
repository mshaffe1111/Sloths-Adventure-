/**
 * A thorn hollow's two walls at any lay (RF3, 2026-11-12): a narrow hollow beside a taller bank (1-2's stair: 63 px, the stump 80 px
 * over the lower lip) and a step down of any height (1-2's long chain dips 27-38 px) are planted here, every width and step a World 1 lay
 * can give, and the walls checked as the bake draws them (hollowWalls is the line the bake moves each row of the painted face onto).
 *   npx tsx --test src/game/hollowWalls.test.ts
 */
import './headlessDom.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { findW1Pits, hollowFaceLift, hollowWalls, HOLLOW_BACK, HOLLOW_FACE_LIFT, HOLLOW_FOOT, HOLLOW_JUT, type PitGap } from './w1Pits.ts';
import type { Platform } from './types.ts';

const P = (id: number, x: number, y: number, width: number, height: number, more: Partial<Platform> = {}): Platform => ({ id, x, y, width, height, type: 'solid', style: 'moss_stone', ownLook: true, ...more }) as Platform;
/** a hollow `w` wide at x, its left lip at yl and its right at yr, its hurt floor `deep` under the lower lip */
const hollow = (x: number, w: number, yl: number, yr: number, deep = 165): PitGap => {
  const lo = Math.max(yl, yr);
  const ps = [P(1, x - 300, yl, 300, 1100 - yl), P(2, x, lo + deep, w, 120, { pit: 'hurt' }), P(3, x + w, yr, 300, 1100 - yr)];
  const g = findW1Pits(ps).find((q) => q.kind === 'hurt');
  assert.ok(g && g.lipL && g.lipR, `no hollow found at ${x}`);
  return g;
};
const WIDTHS = [49, 56, 63, 74, 82, 95];
const STEPS = [-160, -120, -80, -77, -40, -27, 0, 27, 35, 38, 40, 80, 120];
const XS = [3583, 8777, 12528, 20062, 27398];

test('a wall is never held on a bound (a straight cut): in the hollow it lies within HOLLOW_JUT..HOLLOW_BACK of its bank, and a taller bank\'s side above the hollow\'s top stands out past its closed cut, uneven, never on it (1-2\'s stair, RF3 a)', () => {
  let n = 0;
  for (const x of XS) for (const w of WIDTHS) for (const step of STEPS) {
    const yl = 600, yr = 600 + step, g = hollow(x, w, yl, yr);
    const floor = g.floor!, where = (y: number) => `x ${x} w ${w} step ${step} y ${y}`;
    for (const side of [0, 1] as const) {
      const own = side ? yr : yl, edge = side ? g.x1 : g.x0, d = side ? 1 : -1;
      let run = 0, longest = 0, prev = NaN;
      for (let y = own + 4; y <= floor - 24; y++) {
        const v = hollowWalls(g, y)[side], u = d * (v - edge);
        if (y < g.top) assert.ok(u <= -0.99 && u >= -HOLLOW_JUT, `${where(y)}: wall ${side ? 'right' : 'left'} at ${u.toFixed(2)} from its bank's cut above the hollow's top (the cut shows, or it juts past HOLLOW_JUT)`);
        else assert.ok(u > -HOLLOW_JUT + 0.01 && u < HOLLOW_BACK - 0.01, `${where(y)}: wall ${side ? 'right' : 'left'} at ${u.toFixed(2)}: held on a bound`);
        // (a wall held on a bound does not move at all: a curve's own turn, where it stands upright for a few px, does)
        run = Math.abs(v - prev) < 0.001 ? run + 1 : 0;
        longest = Math.max(longest, run);
        prev = v;
      }
      assert.ok(longest < 8, `x ${x} w ${w} step ${step}: the ${side ? 'right' : 'left'} wall runs ${longest} px dead straight`);
      n++;
    }
  }
  assert.ok(n >= 300, `${n} walls checked`);
});

test('the two walls read as two walls at every step height: the right one is never the left one mirrored (a step down of HOLLOW_FACE_LIFT drew one picture, 1-2\'s long chain, RF3 b)', () => {
  let n = 0;
  for (const x of XS) for (const w of [56, 63, 82]) for (let step = -120; step <= 120; step += 1) {
    const yl = 600, yr = 600 + step, g = hollow(x, w, yl, yr);
    const foot = g.floor! + HOLLOW_FOOT;
    let rows = 0, differ = 0;
    for (let y = g.top; y <= foot - 44; y += 2) {
      const [a, b] = hollowWalls(g, y);
      rows++;
      if (Math.abs((g.x0 - a) - (b - g.x1)) > 3) differ++;
    }
    // (the painted face: the right one is drawn from its piece hollowFaceLift higher than the left, so at any height the two show rows of
    // the piece at least HOLLOW_FACE_LIFT apart, never the same rows mirrored)
    const apart = Math.abs(yr - hollowFaceLift(g) - yl);
    assert.ok(apart >= HOLLOW_FACE_LIFT, `x ${x} w ${w} step ${step}: the two faces show the piece's rows only ${apart} px apart: one mirrored picture`);
    // (and their lines: the face's shape comes back about every 75 px, so two faces that far apart can be alike for a stretch; never all
    // the way down)
    assert.ok(differ >= rows * 0.15, `x ${x} w ${w} step ${step}: the walls differ on ${differ} of ${rows} rows: one mirrored outline`);
    n++;
  }
  assert.ok(n >= 3000, `${n} lays checked`);
});
