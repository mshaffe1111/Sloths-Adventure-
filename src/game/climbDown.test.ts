/**
 * Climbing down (Matt, 2026-10-31: "You can't climb down. Once you go up, the only way to get down is to fall"). STAGE-RULES: straight
 * up or down on a vine always climbs. In the real engine, by touch (a slide down held) and with the Pad, with Jump help Off, On and
 * On + forward: up a trunk onto the branch at its top, then straight down climbs all the way back to its foot; and a liana climbed up
 * is climbed back down to its full length. (The trunk's branch caught his feet every frame he climbed down past it, and down on the
 * branch did nothing: engine.ts downAtTop and the floor check's climbing-down pass.)
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TouchRig, stroke } from './touchRig.ts';
import { PadInput } from './padControl.ts';
import { jumpHelp, setJumpHelp, type JumpHelp } from './jumpHelp.ts';

const G = 2000;
const TRUNK = { id: 7, x: 600, topY: 1500, bottomY: 2000, swaySpeed: 0, swayPhase: 0, vineType: 'tree_climb' } as const;
const LIANA = { id: 8, x: 1400, topY: 1600, bottomY: 1860, swaySpeed: 0, swayPhase: 0, vineType: 'swing_liana' } as const;
/** the ground, and the branch the trunk holds up at its top */
function rig(width = 1034): TouchRig {
  const r = new TouchRig('1-1', 1, width);
  r.r.bare(
    [{ id: 1, x: 0, y: G, width: 20000, height: 300, type: 'solid' }, { id: 2, x: 480, y: TRUNK.topY, width: 240, height: 26, type: 'solid' }] as never,
    [{ ...TRUNK }, { ...LIANA }] as never,
  );
  return r;
}

type Way = 'pad' | 'touch';
/** hold down (and only down) for `ms` */
function holdDown(r: TouchRig, way: Way, ms: number) {
  if (way === 'pad') {
    r.input.source = 'pad';
    const pad = new PadInput(r.input);
    pad.pad(0, 45);
    r.run(ms);
    pad.padUp();
  } else {
    r.push(stroke(1, [[0, 160, 600], [120, 160, 700]], false));
    r.run(ms);
    r.push([{ t: 0, k: 'u', id: 1, x: 160, y: 700 }]);
    r.run(100);
  }
}
function holdUp(r: TouchRig, way: Way, ms: number) {
  if (way === 'pad') {
    r.input.source = 'pad';
    const pad = new PadInput(r.input);
    pad.pad(0, -45);
    r.run(ms);
    pad.padUp();
  } else {
    r.push(stroke(1, [[0, 160, 700], [120, 160, 600]], false));
    r.run(ms);
    r.push([{ t: 0, k: 'u', id: 1, x: 160, y: 600 }]);
    r.run(100);
  }
}

const HELPS: JumpHelp[] = ['off', 'keep', 'forward'];
/** the Pad, and touch on a phone held sideways (1034 css px wide) and upright (390) */
const WAYS: Array<[Way, number]> = [['pad', 1034], ['touch', 1034], ['touch', 390]];
const was = jumpHelp();

test('standing on the branch at the top of a trunk, straight down climbs all the way down it (touch and Pad, every Jump help)', () => {
  try {
    for (const help of HELPS) {
      setJumpHelp(help);
      for (const [way, width] of WAYS) {
        const r = rig(width);
        r.r.stand(TRUNK.x + 20, TRUNK.topY);
        r.clear();
        r.run(100);
        holdDown(r, way, 1000);
        assert.ok(r.p.climbing || r.p.y > TRUNK.topY + 100, `${help}/${way}@${width}: down on the branch took hold of the trunk (y ${r.p.y.toFixed(0)})`);
        holdDown(r, way, 3000);
        assert.ok(Math.abs(r.p.y - G) < 8, `${help}/${way}@${width}: climbed down to the foot (y ${r.p.y.toFixed(0)}, ground ${G})`);
        assert.ok(Math.abs(r.p.x - TRUNK.x) < 60, `${help}/${way}@${width}: down the trunk, not off the branch's end (x ${r.p.x.toFixed(0)})`);
      }
    }
  } finally {
    setJumpHelp(was);
  }
});

test('up a trunk from its foot onto the branch, and straight back down to the foot (touch and Pad, every Jump help)', () => {
  try {
    for (const help of HELPS) {
      setJumpHelp(help);
      for (const [way, width] of WAYS) {
        const r = rig(width);
        r.r.climb(r.r.vines[0], TRUNK.bottomY - 40);
        r.clear();
        r.run(100);
        holdUp(r, way, 3500);
        assert.ok(r.p.y <= TRUNK.topY + 2, `${help}/${way}@${width}: climbed to the top (y ${r.p.y.toFixed(0)})`);
        r.run(600);
        // back to the trunk if the vault carried him along the branch
        r.r.stand(TRUNK.x + 20, TRUNK.topY);
        r.clear();
        r.run(100);
        holdDown(r, way, 4000);
        assert.ok(Math.abs(r.p.y - G) < 8, `${help}/${way}@${width}: climbed back down to the foot (y ${r.p.y.toFixed(0)})`);
      }
    }
  } finally {
    setJumpHelp(was);
  }
});

test('a liana climbed up is climbed back down to its full length, never let go of (touch and Pad, every Jump help)', () => {
  try {
    for (const help of HELPS) {
      setJumpHelp(help);
      for (const [way, width] of WAYS) {
        const r = rig(width);
        const v = r.r.vines[1];
        const full = LIANA.bottomY - LIANA.topY;
        r.r.swing(v, { angle: 0, omega: 0, len: full - 20 });
        r.clear();
        r.run(100);
        holdUp(r, way, 1500);
        const up = r.p.swingLength;
        assert.ok(r.p.isVineSwinging && up < full - 80, `${help}/${way}@${width}: climbed up the liana (${up.toFixed(0)} of ${full})`);
        holdDown(r, way, 2500);
        assert.ok(r.p.isVineSwinging, `${help}/${way}@${width}: still on the liana`);
        assert.ok(r.p.swingLength > up + 60, `${help}/${way}@${width}: climbed back down (${up.toFixed(0)} -> ${r.p.swingLength.toFixed(0)})`);
      }
    }
  } finally {
    setJumpHelp(was);
  }
});
