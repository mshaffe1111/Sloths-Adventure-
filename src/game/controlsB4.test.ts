/**
 * Build 4 of the polish report (Matt's four calls, 2026-10-29 5:03 PM ET): CT-5, CT-19, CT-13 with CT-27's Pad Jump, and CT-27's slant
 * flick. Each test is the item's reproduction, kept as a regression test, through the whole touch chain where touch matters (touchRig.ts).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TouchRig, stroke } from './touchRig.ts';
import { padSideFrom } from './controlPrefs.ts';
import { PadInput } from './padControl.ts';
import { COACH_TEXT } from '../components/CoachOverlay.tsx';
import { jumpHelp, setJumpHelp } from './jumpHelp.ts';
import { PHYS, LEAN_SPEED } from './physics.ts';

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

// ───────────────────────────── CT-13 / CT-27: the Pad's Jump, a tap is a hop ─────────────────────────────

/** standing on a floor, the Pad's Jump button pressed for `ms`: how high he went */
function padJumpHeight(ms: number): number {
  const rig = new TouchRig('1-1', 1);
  rig.r.bare([{ id: 1, x: 0, y: G, width: 20000, height: 300, type: 'solid' } as never]);
  rig.r.stand(300, G);
  rig.clear();
  const pad = new PadInput(rig.input);
  rig.input.source = 'pad';
  rig.run(100);
  let top = G;
  pad.jumpButton(true);
  rig.run(ms, () => (top = Math.min(top, rig.p.y)));
  pad.jumpButton(false);
  rig.run(1200, () => (top = Math.min(top, rig.p.y)));
  return G - top;
}

test('CT-13: the Pad\'s Jump tapped is a short hop, held it goes full height, as the lesson says; a touch flick is unchanged', () => {
  const taps = [40, 70, 100].map(padJumpHeight);
  const held = padJumpHeight(600);
  for (const h of taps) assert.ok(h >= 50 && h <= 75, `a tap hops ${h.toFixed(0)} px`);
  assert.ok(held >= 95, `held: ${held.toFixed(0)} px`);
  assert.ok(held - Math.max(...taps) >= 20, `a hold goes clearly higher than a tap (${taps.map((h) => h.toFixed(0)).join(', ')} against ${held.toFixed(0)})`);
  assert.match(COACH_TEXT.pad.nice.sub, /hold jump/i, 'the lesson still tells the truth');
  // the pad pushed up (not the button) and every touch flick keep the full jump however short
  const rig = new TouchRig('1-1', 1);
  rig.r.bare([{ id: 1, x: 0, y: G, width: 20000, height: 300, type: 'solid' } as never]);
  rig.r.stand(300, G);
  rig.clear();
  rig.run(100);
  rig.push(stroke(1, [[0, 800, 700], [50, 800, 640]]));
  let top = G;
  rig.run(1300, () => (top = Math.min(top, rig.p.y)));
  assert.ok(G - top >= 95, `a quick flick: ${(G - top).toFixed(0)} px`);
});

// ───────────────────────────── CT-27: a slanted standing flick carries him ─────────────────────────────

/** standing still, a lone flick 70 px up leaning `deg` (+ right), lifted at once: his speed across at the top, and where he landed */
function slantFlick(deg: number) {
  const rig = new TouchRig('1-1', 1);
  rig.r.bare([{ id: 1, x: 0, y: G, width: 20000, height: 300, type: 'solid' } as never]);
  rig.r.stand(3000, G);
  rig.clear();
  rig.run(100);
  const a = (deg * Math.PI) / 180;
  rig.push(stroke(1, [[0, 800, 700], [60, 800 + Math.sin(a) * 70, 700 - Math.cos(a) * 70]]));
  let vTop = 0, top = G, wasAir = false, land = NaN;
  rig.run(1400, () => {
    if (rig.p.y < top) (top = rig.p.y), (vTop = rig.p.vx);
    if (!rig.p.grounded) wasAir = true;
    else if (wasAir && Number.isNaN(land)) land = rig.p.x;
  });
  return { vTop, carried: land - 3000 };
}

test('CT-27: a standing flick leaning 35 degrees or more carries him that way at 0.75 of a run; one under 35 goes straight up; Jump help on or off', () => {
  const was = jumpHelp();
  try {
    for (const help of ['off', 'keep', 'forward'] as const) {
      setJumpHelp(help);
      for (const deg of [40, -40, 55]) {
        const s = slantFlick(deg);
        const want = Math.sign(deg) * PHYS.maxRun * LEAN_SPEED;
        assert.ok(Math.abs(s.vTop - want) <= PHYS.maxRun * 0.08, `help ${help}, ${deg} degrees: across at the top ${s.vTop.toFixed(0)} px/s, want about ${want.toFixed(0)}`);
        assert.ok(Math.sign(s.carried) === Math.sign(deg) && Math.abs(s.carried) >= 60, `help ${help}, ${deg} degrees: carried ${s.carried.toFixed(0)} px`);
      }
      for (const deg of [0, 25, -25]) {
        const s = slantFlick(deg);
        assert.ok(Math.abs(s.carried) <= 8, `help ${help}, ${deg} degrees: carried ${s.carried.toFixed(0)} px (straight up)`);
      }
    }
  } finally {
    setJumpHelp(was);
  }
});
