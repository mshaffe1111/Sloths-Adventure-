/**
 * Build 4 of the polish report (Matt's four calls, 2026-10-29 5:03 PM ET): CT-5, CT-19, CT-13 with CT-27's Pad Jump, and CT-27's slant
 * flick. Each test is the item's reproduction, kept as a regression test, through the whole touch chain where touch matters (touchRig.ts).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TouchRig, stroke } from './touchRig.ts';
import { padSideFrom } from './controlPrefs.ts';

const G = 2000;
const TRUNK = { id: 7, x: 600, topY: 1500, bottomY: 2000, swaySpeed: 0, swayPhase: 0, vineType: 'tree_climb' } as const;
function trunkRig(): TouchRig {
  const rig = new TouchRig('1-1', 1);
  rig.r.bare([{ id: 1, x: 0, y: G, width: 20000, height: 300, type: 'solid' } as never], [{ ...TRUNK }] as never);
  rig.r.climb(rig.r.vines[0], 1990);
  rig.clear();
  rig.run(100); // (the engine tells the input he is on a trunk on its next frame)
  return rig;
}

// ───────────────────────────── CT-5: straight up on a vine always climbs ─────────────────────────────

test('CT-5: on a trunk, the second thumb\'s straight flick up climbs, the steering thumb resting; leaning 30 degrees still leaps off', () => {
  // the left thumb rests on the glass (the steering thumb), the right one flicks 80 px straight up in 60 ms
  const rig = trunkRig();
  const y0 = rig.p.y;
  rig.push([...stroke(1, [[0, 200, 700], [900, 201, 701]]), ...stroke(2, [[200, 700, 700], [260, 702, 620]])]);
  rig.run(900);
  assert.ok(rig.p.climbing, `still on the trunk: ${rig.words().join(' ')}`);
  assert.ok(y0 - rig.p.y >= 40, `climbed ${(y0 - rig.p.y).toFixed(0)} px`);
  // and the climb stops (no runaway): it does not keep going after the flick
  const y1 = rig.p.y;
  rig.run(500);
  assert.ok(Math.abs(rig.p.y - y1) < 1, `stopped after the flick (${y1.toFixed(0)} -> ${rig.p.y.toFixed(0)})`);
  // leaning 30 degrees over: a leap, as before
  const lean = trunkRig();
  lean.push([...stroke(1, [[0, 200, 700], [900, 201, 701]]), ...stroke(2, [[200, 700, 700], [260, 746, 620]])]);
  lean.run(900);
  assert.ok(!lean.p.climbing, `a 30 degree flick leaps off: ${lean.words().join(' ')}`);
});

// ───────────────────────────── CT-19: the Pad's default side ─────────────────────────────

test('CT-19: the Pad puts movement on the left unless a side was chosen; a chosen side is kept', () => {
  assert.equal(padSideFrom(null), 'left', 'never chosen: the new default');
  assert.equal(padSideFrom('right'), 'right', 'chose right: kept');
  assert.equal(padSideFrom('left'), 'left', 'chose left: kept');
  assert.equal(padSideFrom('junk'), 'left');
});
