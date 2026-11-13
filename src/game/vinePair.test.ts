/**
 * The draped pair as one grab (1-4.md piece 4, R-165.170; FEEL-PAIR): in the real engine, by touch, upright (390) and sideways (1034).
 *   - a single climb is climbed at 220 px/s up and down, exactly as before, and is taken from no further than it always was (54 px);
 *   - the pair's speed is a value on the vine piece: up AND down at `climbSpeed`;
 *   - from beside either strand (outside a single's reach) up takes both: he hangs between them, `climbPair` set;
 *   - the rustle quickens with the climb; a single's is unchanged.
 * Planted failure: before vinePair.ts the engine climbed every vine at a bare 220 and took hold within 54 px of its line, so the speed,
 * down and beside-a-strand tests were red.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TouchRig, stroke } from './touchRig.ts';
import { CLIMB_SPEED, PAIR_GAP, climbReach, climbSpeedOf, rustleGap } from './vinePair.ts';

const G = 2000;
const TOP = 1200;
const SINGLE = { id: 7, x: 600, topY: TOP, bottomY: G, swaySpeed: 0, swayPhase: 0, vineType: 'tree_climb' } as const;
const PAIR = { id: 8, x: 1000, topY: TOP, bottomY: G, swaySpeed: 0, swayPhase: 0, vineType: 'tree_climb', pair: PAIR_GAP, climbSpeed: CLIMB_SPEED * 2 } as const;

function rig(width: number): TouchRig {
  const r = new TouchRig('1-1', 1, width);
  r.r.bare(
    [
      { id: 1, x: 0, y: G, width: 20000, height: 300, type: 'solid' },
      { id: 2, x: 500, y: TOP, width: 200, height: 26, type: 'solid' },
      { id: 3, x: 900, y: TOP, width: 200, height: 26, type: 'solid' },
    ] as never,
    [{ ...SINGLE }, { ...PAIR }] as never,
  );
  return r;
}
/** a thumb slides up and stays down (held up), on the left half */
const press = (r: TouchRig, dir: -1 | 1) => r.push(stroke(1, [[0, 160, 700], [120, 160, 700 + dir * 100]], false));
const lift = (r: TouchRig) => r.push([{ t: 0, k: 'u', id: 1, x: 160, y: 600 }]);

/** stand at x, hold up (or down) until he is climbing, then hold on for 0.5 s more: the speed over those frames (px/s, up positive) */
function climbRate(r: TouchRig, x: number, dir: -1 | 1, startY = G): { took: boolean; rate: number; pair: number } {
  if (startY === G) r.r.stand(x, G);
  else Object.assign(r.p, { x, y: startY, climbing: true, grounded: false });
  r.clear();
  r.run(100);
  press(r, dir);
  r.run(400);
  const took = r.p.climbing;
  // (per frame of the loop's fixed 1/30 s step: the rig's clock does not land a half second on a whole number of frames)
  let y = r.p.y;
  const steps: number[] = [];
  r.run(500, () => {
    steps.push(y - r.p.y);
    y = r.p.y;
  });
  const rate = (steps.reduce((a, b) => a + b, 0) / steps.length) * 30;
  const pair = r.p.climbPair ?? 0;
  lift(r);
  r.run(100);
  return { took, rate, pair };
}

const WIDTHS = [390, 1034];
/** beside a strand: outside a single's reach (54), inside the pair's (54 + 20) */
const GRAB_OFF = 64;

test('a single climb is climbed at 220 px/s up and down, as before (the pair changes nothing about it)', () => {
  for (const w of WIDTHS) {
    const up = climbRate(rig(w), SINGLE.x, -1);
    assert.ok(up.took, `@${w}: up at a single's foot takes hold`);
    assert.ok(Math.abs(up.rate - CLIMB_SPEED) < 3, `@${w}: up a single at ${up.rate.toFixed(1)} px/s, want 220`);
    assert.equal(up.pair, 0, `@${w}: a single is no pair`);
    const down = climbRate(rig(w), SINGLE.x, 1, TOP + 400);
    assert.ok(Math.abs(-down.rate - CLIMB_SPEED) < 3, `@${w}: down a single at ${(-down.rate).toFixed(1)} px/s, want 220`);
  }
  assert.equal(climbSpeedOf({}), 220);
  assert.equal(climbReach({}, false), 54);
  assert.equal(climbReach({}, true), 60);
});

test("the pair is climbed at its piece's own speed, up and down (2x here: 440 px/s)", () => {
  for (const w of WIDTHS) {
    const up = climbRate(rig(w), PAIR.x, -1);
    assert.ok(up.took, `@${w}: up between the strands takes hold`);
    assert.ok(Math.abs(up.rate - PAIR.climbSpeed) < 5, `@${w}: up the pair at ${up.rate.toFixed(1)} px/s, want ${PAIR.climbSpeed}`);
    assert.equal(up.pair, PAIR_GAP, `@${w}: climbing the pair sets climbPair to its gap`);
    const down = climbRate(rig(w), PAIR.x, 1, TOP + 400);
    assert.ok(Math.abs(-down.rate - PAIR.climbSpeed) < 5, `@${w}: down the pair at ${(-down.rate).toFixed(1)} px/s, want ${PAIR.climbSpeed}`);
  }
});

test('from beside either strand, up takes both (one grab); the same distance from a single takes nothing', () => {
  const off = GRAB_OFF;
  for (const w of WIDTHS) {
    for (const side of [-1, 1]) {
      const r = rig(w);
      const got = climbRate(r, PAIR.x + side * off, -1);
      assert.ok(got.took, `@${w}: ${off} px ${side < 0 ? 'left' : 'right'} of the pair's middle (beside a strand), up takes hold`);
      assert.ok(Math.abs(r.p.x - PAIR.x) < 0.5, `@${w}: he hangs between the strands (x ${r.p.x.toFixed(1)})`);
    }
    const s = climbRate(rig(w), SINGLE.x + off, -1);
    assert.ok(!s.took, `@${w}: ${off} px from a single's line takes nothing, as before`);
  }
});
test("the rustle quickens with a quicker climb; a single's is as it was (0.36-0.48 s)", () => {
  for (const u of [0, 0.5, 1]) assert.equal(rustleGap({}, u), 0.36 + u * 0.12);
  assert.ok(rustleGap({ climbSpeed: 440 }, 0.5) < rustleGap({}, 0.5) * 0.51);
  assert.equal(rustleGap({ climbSpeed: 100 }, 0.5), rustleGap({}, 0.5), 'a slower climb never rustles slower than a single (no drag)');
});
