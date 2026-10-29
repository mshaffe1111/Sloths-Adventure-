/**
 * Build 2 of the polish report (2026-10-29): controls that never misread. Each test is one of the report's scripted reproductions
 * (check/c1, c4 and the rest), run through the whole touch chain (touchRig.ts: the real recogniser, the real InputEngine, the real engine
 * at 30 fps), kept as a regression test.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TouchRig, stroke, type TouchEv } from './touchRig.ts';
import { PadInput } from './padControl.ts';

const G = 2000;
/** a bare floor, Pokey standing on it at x */
function floorRig(x = 300): TouchRig {
  const rig = new TouchRig('1-1', 1);
  rig.r.bare([{ id: 1, x: 0, y: G, width: 20000, height: 300, type: 'solid' } as never]);
  rig.r.stand(x, G);
  rig.clear();
  return rig;
}

/** run the rig until he lands again; how far across the jump carried him (from the take-off) */
function jumpCarry(rig: TouchRig, ms: number): number {
  let x0 = NaN, land = NaN, wasG = true;
  rig.run(ms, () => {
    const p = rig.p;
    if (wasG && !p.grounded && Number.isNaN(x0)) x0 = p.x - p.vx / 30;
    if (!Number.isNaN(x0) && Number.isNaN(land) && p.grounded) land = p.x;
    wasG = p.grounded;
  });
  return land - x0;
}

// ───────────────────────────── CT-1 and CT-11 ─────────────────────────────

/**
 * one thumb on the left half: slide right, run, then flick up. `lift`: off the glass the moment the flick ends (a one-thumb player);
 * `arcX`: how far the flick drifts sideways as it rises (a thumb arcs back toward the palm: negative). `offset` moves the flick against
 * the 30 fps frames, so every phase of the lift against the frame is tried.
 */
function runningJump(offset: number, lift: boolean, arcX = 12): number {
  const rig = floorRig();
  const t1 = 700 + offset;
  const evs: TouchEv[] = stroke(1, [[0, 150, 700], [100, 200, 700], [t1, 210, 704], [t1 + 50, 210 + arcX, 644]], lift);
  if (!lift) evs.push({ t: t1 + 400, k: 'u', id: 1, x: 210 + arcX, y: 644 });
  rig.push(evs);
  return jumpCarry(rig, t1 + 1600);
}

test('CT-1: a one-thumb running jump carries as far whether the thumb lifts at once or stays down (at least 165 px, every frame phase)', () => {
  for (let o = 0; o < 34; o += 3) {
    const lifted = runningJump(o, true);
    const held = runningJump(o, false);
    assert.ok(lifted >= 165, `lifted at once, phase ${o} ms: ${lifted.toFixed(0)} px`);
    assert.ok(held >= 165, `thumb on the glass, phase ${o} ms: ${held.toFixed(0)} px`);
  }
});

test('CT-11: a flick that arcs back toward the palm as it rises keeps the run going (no stop, no turn at take-off)', () => {
  for (const arcX of [-25, -40]) {
    for (let o = 0; o < 34; o += 6) {
      const d = runningJump(o, false, arcX);
      assert.ok(d >= 165, `arc ${arcX} px, phase ${o} ms: ${d.toFixed(0)} px`);
    }
  }
});

// ───────────────────────────── CT-2: the Pad on a trunk or a liana ─────────────────────────────

const TRUNK = { id: 7, x: 600, topY: 1500, bottomY: 2000, swaySpeed: 0, swayPhase: 0, vineType: 'tree_climb' } as const;
const LIANA = { id: 8, x: 1400, topY: 1600, bottomY: 1860, swaySpeed: 0, swayPhase: 0, vineType: 'swing_liana' } as const;
function vineRig(): TouchRig {
  const rig = new TouchRig('1-1', 1);
  rig.r.bare([{ id: 1, x: 0, y: G, width: 20000, height: 300, type: 'solid' } as never], [{ ...TRUNK }, { ...LIANA }] as never);
  return rig;
}
/** the Pad, as PadController.tsx drives it */
function padOf(rig: TouchRig): PadInput {
  rig.input.source = 'pad';
  return new PadInput(rig.input);
}

test('CT-2: on a trunk, the Pad pushed up climbs, let go and pushed up again still climbs, and never leaps off', () => {
  const rig = vineRig();
  const pad = padOf(rig);
  rig.r.climb(rig.r.vines[0], 1990);
  rig.clear();
  rig.run(100); // (the engine tells the input he is on a trunk on its next frame)
  let y = rig.p.y;
  for (let i = 0; i < 3; i++) {
    pad.pad(0, -45);
    rig.run(250);
    assert.ok(rig.p.climbing, `push ${i + 1}: still on the trunk`);
    assert.ok(rig.p.y < y - 40, `push ${i + 1}: climbed (${y.toFixed(0)} -> ${rig.p.y.toFixed(0)})`);
    y = rig.p.y;
    pad.padUp();
    rig.run(300);
    assert.ok(rig.p.climbing, `let go ${i + 1}: still on the trunk`);
  }
  // down climbs down
  y = rig.p.y;
  pad.pad(0, 45);
  rig.run(300);
  assert.ok(rig.p.climbing && rig.p.y > y + 20, 'down climbs down');
  pad.padUp();
});

test('CT-2: on a liana, the Pad pushed up climbs and never lets go', () => {
  const rig = vineRig();
  const pad = padOf(rig);
  rig.r.swing(rig.r.vines[1], { angle: 0, omega: 0.5, len: 200 });
  rig.clear();
  rig.run(100);
  const len = rig.p.swingLength!;
  for (let i = 0; i < 3; i++) {
    pad.pad(4, -45);
    rig.run(500);
    assert.ok(rig.p.isVineSwinging, `push ${i + 1}: still on the liana`);
    pad.padUp();
    rig.run(200);
  }
  assert.ok(rig.p.swingLength! < len - 20, `climbed the liana (${len.toFixed(0)} -> ${rig.p.swingLength!.toFixed(0)})`);
});

test('CT-2: off a trunk, the Pad leaps only on the Jump button or a push 45 degrees over with 38 px up, the way it leans', () => {
  for (const how of ['button', 'diagonal'] as const) {
    const rig = vineRig();
    const pad = padOf(rig);
    rig.r.climb(rig.r.vines[0], 1800);
    rig.clear();
    rig.run(400); // past the grab's grace
    if (how === 'button') {
      pad.pad(-30, 0); // steering left (no hop off, CT-4)
      pad.jumpButton(true);
    } else pad.pad(-45, -42);
    rig.run(200);
    assert.ok(!rig.p.climbing, `${how}: leapt off`);
    assert.ok(rig.p.vx < -200, `${how}: leapt left (${rig.p.vx.toFixed(0)})`);
    pad.padUp();
    pad.jumpButton(false);
  }
});

test('CT-2: keyboard and game controller: on a trunk or a liana Up climbs and only Space or A leaps; off one, Up still jumps', () => {
  const rig = vineRig();
  const inp = rig.input;
  const keys = inp as unknown as Record<'handleKeyDown' | 'handleKeyUp', (e: unknown) => void>;
  const key = (code: string, down = true) => keys[down ? 'handleKeyDown' : 'handleKeyUp']({ code, repeat: false, preventDefault() {} });
  inp.onVine = true;
  key('ArrowUp');
  assert.ok(inp.state.up && !inp.state.jumpPressed, 'Up on a trunk: climb, no jump');
  key('ArrowUp', false);
  key('Space');
  assert.ok(inp.state.jumpPressed, 'Space on a trunk: a leap');
  key('Space', false);
  inp.clearAll();
  inp.onVine = false;
  key('ArrowUp');
  assert.ok(inp.state.jumpPressed, 'Up off a trunk: a jump, as before');
  key('ArrowUp', false);
  inp.clearAll();

  // a game controller: stick up, then A
  const pads: { axes: number[]; buttons: { pressed: boolean }[] }[] = [{ axes: [0, 0], buttons: Array.from({ length: 16 }, () => ({ pressed: false })) }];
  const nav = globalThis as unknown as { navigator?: unknown };
  const had = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
  Object.defineProperty(globalThis, 'navigator', { value: { getGamepads: () => pads }, configurable: true });
  try {
    inp.onVine = true;
    pads[0].axes[1] = -1;
    inp.update(1 / 30);
    assert.ok(inp.state.up && !inp.state.jumpPressed && !inp.state.jumpHeld, 'stick up on a trunk: climb');
    pads[0].buttons[0].pressed = true;
    inp.update(1 / 30);
    assert.ok(inp.state.jumpPressed, 'A on a trunk: a leap');
    pads[0].buttons[0].pressed = false;
    pads[0].axes[1] = 0;
    inp.update(1 / 30);
    inp.onVine = false;
    pads[0].axes[1] = -1;
    inp.update(1 / 30);
    assert.ok(inp.state.jumpPressed, 'stick up off a trunk: a jump, as before');
  } finally {
    if (had) Object.defineProperty(globalThis, 'navigator', had);
    else delete nav.navigator;
  }
});

// ───────────────────────────── CT-3: climbing strokes that lean a little ─────────────────────────────

/** a stroke up from (x, y) that leans `deg` off straight up (+ right), `len` px long at `speed` px per ms; `pre`: climbing straight first */
function lean(deg: number, len: number, speed: number, pre = 0): Array<[number, number, number]> {
  const r = (deg * Math.PI) / 180;
  const pts: Array<[number, number, number]> = [[0, 300, 700]];
  let t = 0, x = 300, y = 700;
  if (pre) {
    t += pre / 0.3;
    y -= pre;
    pts.push([t, x, y]);
  }
  t += len / speed;
  pts.push([t, x + Math.sin(r) * len, y - Math.cos(r) * len]);
  return pts;
}

/** on a trunk (or a liana), one stroke: did he let go? */
function strokeLetsGo(pts: Array<[number, number, number]>, swing = false): boolean {
  const rig = vineRig();
  if (swing) rig.r.swing(rig.r.vines[1], { angle: 0, omega: 0.5, len: 150 });
  else rig.r.climb(rig.r.vines[0], 1980);
  rig.clear();
  rig.run(400);
  rig.push(stroke(1, pts));
  rig.run(pts[pts.length - 1][0] + 300);
  return rig.words().some((w) => w.startsWith('jump:'));
}

test('CT-3: ordinary climbing strokes 15 to 27 degrees off straight up climb, slow or brisk, and never let go', () => {
  for (const swing of [false, true]) {
    for (const [deg, speed] of [[15, 0.3], [22, 0.3], [25, 0.4], [-22, 0.4], [27, 0.5], [20, 0.9], [-25, 0.55]] as const) {
      for (const len of [60, 110]) {
        assert.ok(!strokeLetsGo(lean(deg, len, speed), swing), `${swing ? 'liana' : 'trunk'}: ${deg} degrees, ${len} px at ${speed} px/ms let go`);
      }
    }
  }
});

test('CT-3: a climb that bends over as it goes is still a climb (it was already climbing)', () => {
  for (const deg of [30, 35, -32]) assert.ok(!strokeLetsGo(lean(deg, 60, 0.7, 50)), `climb 50 px, then ${deg} degrees at 0.7 px/ms let go`);
});

test('CT-3: a fresh flick up and over lets go: 28 degrees or more at 0.6 px/ms, or 22 degrees or more at 1 px/ms or faster', () => {
  for (const swing of [false, true]) {
    for (const [deg, speed] of [[30, 0.7], [-35, 0.8], [45, 1.0], [24, 1.2], [-23, 1.4], [55, 1.5]] as const) {
      assert.ok(strokeLetsGo(lean(deg, 70, speed), swing), `${swing ? 'liana' : 'trunk'}: ${deg} degrees at ${speed} px/ms did not let go`);
    }
  }
});
