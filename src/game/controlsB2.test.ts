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
      pad.pad(-45, 0); // steering left, clearly (a hop off needs it held 0.35 s: CT-4)
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

test('CT-3: ordinary climbing strokes climb, slanted and slow (the report\'s 22 and 25 degree strokes) or near-straight and brisk, and never let go', () => {
  for (const swing of [false, true]) {
    // (a stroke 21 degrees or more over at 0.44 px/ms is a let-go: Steph's flicks off a liana are 20 to 48 degrees at 0.5 px/ms and
    // more, swingSlide.test.ts. So the slanted strokes that must climb are the slow ones)
    for (const [deg, speed] of [[15, 0.3], [22, 0.3], [25, 0.4], [-22, 0.4], [28, 0.35], [18, 0.9], [-19, 0.7]] as const) {
      for (const len of [60, 110]) {
        assert.ok(!strokeLetsGo(lean(deg, len, speed), swing), `${swing ? 'liana' : 'trunk'}: ${deg} degrees, ${len} px at ${speed} px/ms let go`);
      }
    }
  }
});

test('CT-3: a climb that bends over as it goes is still a climb (it was already climbing)', () => {
  for (const deg of [30, 35, -32]) assert.ok(!strokeLetsGo(lean(deg, 60, 0.7, 50)), `climb 50 px, then ${deg} degrees at 0.7 px/ms let go`);
});

test('CT-3: a fresh flick up and over lets go: 21 degrees or more at 0.44 px/ms or faster', () => {
  for (const swing of [false, true]) {
    for (const [deg, speed] of [[30, 0.7], [-35, 0.8], [45, 1.0], [24, 1.2], [-23, 1.4], [55, 1.5], [22, 0.55], [-27, 0.5]] as const) {
      assert.ok(strokeLetsGo(lean(deg, 70, speed), swing), `${swing ? 'liana' : 'trunk'}: ${deg} degrees at ${speed} px/ms did not let go`);
    }
  }
});

// ───────────────────────────── CT-4: stopping on a trunk ─────────────────────────────

/**
 * on a trunk: one climbing stroke `deg` off straight up, `len` px at 0.35 px/ms, then the thumb stops the climb: `lift` takes it off the
 * glass, `back` eases it 30 px back down (the joystick's middle trails 40 px behind a climbing thumb) and holds it there. How far he climbed past
 * the moment the thumb stopped, and whether he is still on the trunk `holdMs` later.
 */
function climbAndStop(deg: number, len: number, how: 'lift' | 'back', holdMs = 1500) {
  const rig = vineRig();
  rig.r.climb(rig.r.vines[0], 1980);
  rig.clear();
  rig.run(400);
  const r = (deg * Math.PI) / 180;
  const ms = len / 0.35;
  const x1 = 300 + Math.sin(r) * len, y1 = 700 - Math.cos(r) * len;
  const pts: Array<[number, number, number]> = [[0, 300, 700], [ms, x1, y1]];
  if (how === 'back') pts.push([ms + 80, x1, y1 + 30]);
  rig.push(stroke(1, pts, how === 'lift'));
  rig.run(pts[pts.length - 1][0]);
  const yStop = rig.p.y;
  rig.run(holdMs);
  return { overshoot: yStop - rig.p.y, climbing: rig.p.climbing, words: rig.words().join(' ') };
}

test('CT-4: stopping the climb on a trunk stops him within a few px (no 90 px overshoot), and a thumb left a little sideways never drops him off', () => {
  for (const how of ['lift', 'back'] as const) {
    for (const deg of [0, 10, -10, 20]) {
      const s = climbAndStop(deg, 100, how);
      assert.ok(s.climbing, `${how}, ${deg} degrees: still on the trunk 1.5 s later (${s.words})`);
      assert.ok(s.overshoot <= 20, `${how}, ${deg} degrees: climbed ${s.overshoot.toFixed(0)} px past where the thumb stopped`);
    }
  }
});

// ───────────────────────────── CT-9: short quick flicks ─────────────────────────────

/** standing still: these fingers; what the recogniser said, and whether he left the ground */
function standing(evs: TouchEv[]) {
  const rig = floorRig();
  rig.run(100);
  rig.push(evs);
  let air = false;
  rig.run(Math.max(...evs.map((e) => e.t)) + 400, () => {
    if (!rig.p.grounded) air = true;
  });
  const w = rig.words();
  return { jumped: w.some((x) => x.startsWith('jump:')) && air, punched: w.includes('punch'), words: w.join(' ') };
}
/** a quick flick straight up of `rise` px in `ms`, from (x, y), lifted at once */
const upFlick = (id: number, x: number, y: number, rise: number, ms: number, t0 = 0, across = 0): TouchEv[] =>
  stroke(id, [[t0, x, y], [t0 + ms, x + across, y - rise]]);

test('CT-9: a short quick flick up jumps from every finger: a lone finger either side, a second finger, the steering thumb', () => {
  for (const [rise, ms] of [[18, 40], [22, 45], [26, 56], [36, 56]] as const) {
    for (const x of [250, 800]) {
      const s = standing(upFlick(1, x, 700, rise, ms));
      assert.ok(s.jumped && !s.punched, `lone finger at x ${x}, ${rise} px in ${ms} ms: ${s.words}`);
    }
    // a second finger while the left thumb rests on the glass
    const two = standing([...stroke(1, [[0, 200, 700], [600, 202, 700]]), ...upFlick(2, 800, 700, rise, ms, 300)]);
    assert.ok(two.jumped && !two.punched, `second finger, ${rise} px in ${ms} ms: ${two.words}`);
  }
  // the steering thumb, running, flicks 30 px and lifts: a jump (it used to just stop him)
  const rig = floorRig();
  rig.push(stroke(1, [[0, 150, 700], [100, 200, 700], [500, 205, 700], [560, 210, 670]]));
  let air = false;
  rig.run(1200, () => (air ||= !rig.p.grounded));
  assert.ok(air, `steering thumb, 30 px flick: ${rig.words().join(' ')}`);
});

test('CT-9: a tap still punches, and a quick 12 to 18 px flick up neither punches nor jumps', () => {
  for (const x of [250, 800]) {
    const tap = standing(stroke(1, [[0, x, 700], [90, x + 3, 702]]));
    assert.ok(tap.punched && !tap.jumped, `tap at x ${x}: ${tap.words}`);
    const nudge = standing(stroke(1, [[0, x, 700], [150, x + 4, 690]]));
    assert.ok(nudge.punched && !nudge.jumped, `slow 10 px nudge at x ${x} is still a tap: ${nudge.words}`);
    const half = standing(upFlick(1, x, 700, 15, 30));
    assert.ok(!half.punched && !half.jumped, `15 px in 30 ms at x ${x}: ${half.words}`);
  }
});

// ───────────────────────────── CT-7: a resting action thumb ─────────────────────────────

test('CT-7: a second thumb resting on the glass, then flicking up, jumps; a rest under 550 ms throws no mega, and a longer one still lets the flick jump', () => {
  for (const rest of [460, 540, 800]) {
    const s = standing([...stroke(1, [[0, 200, 700], [1600, 202, 700]]), ...stroke(2, [[200, 800, 700], [200 + rest, 801, 701], [200 + rest + 60, 802, 641]])]);
    assert.ok(s.jumped, `rest ${rest} ms, then a 60 px flick: ${s.words}`);
    if (rest < 550) assert.ok(!s.words.includes('mega'), `rest ${rest} ms threw a mega: ${s.words}`);
    else assert.ok(s.words.includes('mega'), `a deliberate hold of ${rest} ms is still the mega: ${s.words}`);
  }
});

// ───────────────────────────── CT-12: jump height ─────────────────────────────

/** standing, a quick flick straight up lifted at once (`phase` ms against the frames; `freezeMs` of hitstop just after it): how high */
function flickHeight(phase: number, freezeMs = 0): number {
  const rig = floorRig();
  rig.run(100 + phase);
  rig.push(upFlick(1, 800, 700, 50, 40));
  let top = G;
  if (freezeMs) {
    rig.run(45);
    rig.freeze(freezeMs);
  }
  rig.run(1200, () => (top = Math.min(top, rig.p.y)));
  return G - top;
}

test('CT-12: a quick flick jumps the same height whatever the frame phase, and a hitstop just after it does not cut it low', () => {
  const hs = Array.from({ length: 12 }, (_, i) => flickHeight(i * 3));
  assert.ok(Math.max(...hs) - Math.min(...hs) <= 2, `heights by phase: ${hs.map((h) => h.toFixed(0)).join(' ')}`);
  for (const f of [45, 80, 110]) {
    const h = flickHeight(0, f);
    assert.ok(h >= Math.min(...hs) - 2, `a ${f} ms hitstop after the flick: ${h.toFixed(0)} px against ${Math.min(...hs).toFixed(0)}`);
  }
});

// ───────────────────────────── CT-10: a jump beside a trunk ─────────────────────────────

/** standing `side` px from the trunk (negative: left of it), these fingers: did he grab the trunk within the next second */
function besideTrunk(side: number, evs: TouchEv[]): { grabbed: boolean; words: string } {
  const rig = vineRig();
  rig.r.stand(TRUNK.x + side, G);
  rig.clear();
  rig.run(100);
  rig.push(evs);
  let grabbed = false;
  rig.run(1000, () => (grabbed ||= rig.p.climbing));
  return { grabbed, words: rig.words().join(' ') };
}
/** a flick up from (800, 700) leaning `deg` (+ right), 70 px in 60 ms, lifted */
const leanFlick = (deg: number, t0 = 0, id = 1) => upFlick(id, 800, 700, 70 * Math.cos((deg * Math.PI) / 180), 60, t0, 70 * Math.sin((deg * Math.PI) / 180));

test('CT-10: beside a trunk, a jump straight up or toward it grabs it; one leaning or steering away is a jump', () => {
  for (const side of [-30, 30]) {
    const toward = side < 0 ? 1 : -1;
    assert.ok(besideTrunk(side, leanFlick(0)).grabbed, `${side}: straight up grabs`);
    assert.ok(besideTrunk(side, leanFlick(35 * toward)).grabbed, `${side}: leaning toward grabs`);
    const away = besideTrunk(side, leanFlick(-35 * toward));
    assert.ok(!away.grabbed, `${side}: leaning away grabbed the trunk: ${away.words}`);
    // the left thumb steering away, the right thumb flicking straight up
    const steerAway = besideTrunk(side, [...stroke(2, [[0, 200, 700], [80, 200 - 40 * toward, 700], [900, 200 - 42 * toward, 700]]), ...leanFlick(0, 90)]);
    assert.ok(!steerAway.grabbed, `${side}: steering away grabbed the trunk: ${steerAway.words}`);
  }
});

test('CT-4: a fresh, clearly sideways stroke on a trunk, held, still steps him off that way', () => {
  for (const dir of [-1, 1]) {
    const rig = vineRig();
    rig.r.climb(rig.r.vines[0], 1900);
    rig.clear();
    rig.run(400);
    rig.push(stroke(1, [[0, 300, 700], [120, 300 + 70 * dir, 704], [900, 300 + 72 * dir, 704]]));
    let off = 0;
    rig.run(900, () => {
      if (!off && !rig.p.climbing) off = Math.sign(rig.p.vx);
    });
    assert.equal(off, dir, `stroke ${dir > 0 ? 'right' : 'left'}: ${rig.words().join(' ')}`);
  }
});
