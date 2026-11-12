import test from 'node:test';
import assert from 'node:assert/strict';
import { beatOf, checkClock, clockAt, cycleRead, stageClock, type CycleRead } from './clock.ts';
import type { ClockDef } from './stageKit.types.ts';

const DT = 1 / 30;
/** a hazard's beat: 2 s quiet, 1 s of warning, 0.5 s that hurts, 0.5 s settling (a 4 s cycle) */
const def: ClockDef = { id: 'rocks', phases: [{ name: 'off', seconds: 2 }, { name: 'warn', seconds: 1 }, { name: 'on', seconds: 0.5 }, { name: 'rest', seconds: 0.5 }], offset: 0, easyStretch: 1.5 };

test('the phases come round in order, each for its own length, every cycle', () => {
  const seen: string[] = [];
  const frames: Record<string, number> = {};
  for (let n = 0; n < 240; n++) {
    const s = clockAt(def, n * DT);
    if (seen[seen.length - 1] !== s.phase) seen.push(s.phase);
    frames[s.phase] = (frames[s.phase] ?? 0) + 1;
    assert.ok(s.u >= 0 && s.u < 1, `u stays in 0..1 (${s.u} at frame ${n})`);
    assert.equal(s.cycle, Math.floor((n * DT) / 4), 'whole cycles so far');
  }
  assert.deepEqual(seen, ['off', 'warn', 'on', 'rest', 'off', 'warn', 'on', 'rest']);
  assert.deepEqual(frames, { off: 120, warn: 60, on: 30, rest: 30 });
});

test('a read tells how far into the phase, how long it has left, and how long to the next on', () => {
  const a = clockAt(def, 0.5);
  assert.deepEqual([a.phase, a.index, a.into, a.left, a.toOn], ['off', 0, 0.5, 1.5, 2.5]);
  const w = clockAt(def, 2.25);
  assert.deepEqual([w.phase, w.into, w.u, w.left, w.toOn], ['warn', 0.25, 0.25, 0.75, 0.75]);
  const on = clockAt(def, 3.25);
  assert.deepEqual([on.phase, on.toOn, on.left], ['on', 0, 0.25]);
  // after the bite, the next one is a whole cycle's quiet and warning away
  assert.equal(clockAt(def, 3.75).toOn, 3.25);
  // a clock with nothing that hurts never counts down to one
  assert.equal(clockAt({ id: 'calm', phases: [{ name: 'off', seconds: 1 }, { name: 'rest', seconds: 1 }], offset: 0, easyStretch: 1 }, 0.3).toOn, Infinity);
});

test('the warning always comes first: every frame that is on follows a warning, never quiet', () => {
  for (const easy of [false, true]) {
    let prev = clockAt(def, 0, easy).phase;
    let warned = 0;
    for (let n = 1; n < 900; n++) {
      const s = clockAt(def, n * DT, easy);
      if (s.phase === 'warn') warned++;
      if (s.phase === 'on' && prev !== 'on') {
        assert.equal(prev, 'warn', `on began straight from ${prev} at frame ${n}`);
        assert.ok(warned >= (easy ? 44 : 29), `only ${warned} frames of warning`);
        warned = 0;
      }
      prev = s.phase;
    }
  }
});

test('a clock that would hurt without warning is refused, with the reason', () => {
  assert.deepEqual(checkClock(def), []);
  const bare: ClockDef = { ...def, phases: [{ name: 'off', seconds: 2 }, { name: 'on', seconds: 1 }] };
  assert.match(checkClock(bare).join(), /warn/);
  // the warning has to be the phase right before it, not somewhere earlier in the cycle
  const early: ClockDef = { ...def, phases: [{ name: 'warn', seconds: 1 }, { name: 'off', seconds: 1 }, { name: 'on', seconds: 1 }] };
  assert.match(checkClock(early).join(), /warn/);
  // ...and it wraps: an on that opens the cycle is warned by the phase that closes it
  const wrap: ClockDef = { ...def, phases: [{ name: 'on', seconds: 1 }, { name: 'off', seconds: 1 }, { name: 'warn', seconds: 1 }] };
  assert.deepEqual(checkClock(wrap), []);
  assert.match(checkClock({ ...def, easyStretch: 0.8 }).join(), /easyStretch/);
  assert.match(checkClock({ ...def, phases: [{ name: 'warn', seconds: 0 }, { name: 'on', seconds: 1 }] }).join(), /seconds/);
  assert.match(checkClock({ ...def, offset: NaN }).join(), /offset/);
});

test('Easy is never faster: every phase lasts at least as long as on Normal, in the same order', () => {
  const n = beatOf(def, false);
  const e = beatOf(def, true);
  assert.deepEqual(e.names, n.names);
  e.seconds.forEach((s, i) => assert.equal(s, n.seconds[i] * 1.5));
  assert.equal(e.period, 6);
  // a brief that asks for a faster Easy does not get one
  const cheat = beatOf({ ...def, easyStretch: 0.5 }, true);
  assert.deepEqual(cheat.seconds, n.seconds);
  assert.deepEqual(beatOf({ ...def, easyStretch: NaN }, true).seconds, n.seconds);
  // Normal is untouched by the stretch
  assert.equal(n.period, 4);
});

test('an offset staggers a lane: the same beat, that much sooner, on both settings', () => {
  for (const easy of [false, true]) {
    const k = easy ? 1.5 : 1;
    for (let n = 0; n < 300; n++) {
      const t = n * 0.125;
      // (eighths of a second: exact in binary, so the two reads land on the very same moment of the cycle)
      const lane = clockAt(def, t, easy, 1.5);
      const lead = clockAt(def, t + 1.5 * k, easy);
      assert.deepEqual([lane.phase, lane.into, lane.toOn], [lead.phase, lead.into, lead.toOn]);
    }
    // two lanes half a cycle apart are never on together
    for (let n = 0; n < 600; n++) assert.ok(!(clockAt(def, n * DT, easy).phase === 'on' && clockAt(def, n * DT, easy, 2).phase === 'on'));
  }
  // the clock's own offset and a lane's shift add up
  assert.deepEqual(clockAt({ ...def, offset: 1 }, 0.5, false, 0.5), clockAt(def, 2));
});

test('the stage clock runs on the fixed step only: a pause holds it, and the same steps always give the same beat', () => {
  const a = stageClock([def], false);
  const b = stageClock([def], false);
  let gameTime = 0;
  for (let n = 0; n < 100; n++) { a.step(DT); b.step(DT); gameTime += DT; }
  // it keeps the engine's own sum, bit for bit (engine.ts: gameTime += dt)
  assert.equal(a.time(), gameTime);
  assert.deepEqual(a.read('rocks'), b.read('rocks'));
  const held = a.read('rocks');
  // paused: nothing steps it, however long the wall clock runs
  assert.deepEqual(a.read('rocks'), held);
  assert.equal(a.time(), gameTime);
  a.step(DT);
  assert.notDeepEqual(a.read('rocks'), held);
  assert.equal(a.read('rocks').phase, clockAt(def, a.time()).phase);
  assert.equal(stageClock([def], true).read('rocks').left, 3);
  assert.throws(() => a.read('tide'), /tide/);
});

test('the walk under every timer: stretches in order, the last one running to the end of the cycle', () => {
  const out: CycleRead = { index: 0, into: 0, at: 0 };
  // a 5 s cycle of 2 + 1 + (what is left)
  assert.deepEqual({ ...cycleRead(0.5, 0, 5, [2, 1], 2, out) }, { index: 0, into: 0.5, at: 0.5 });
  assert.deepEqual({ ...cycleRead(2.5, 0, 5, [2, 1], 2, out) }, { index: 1, into: 0.5, at: 2.5 });
  assert.deepEqual({ ...cycleRead(4.5, 0, 5, [2, 1], 2, out) }, { index: 2, into: 1.5, at: 4.5 });
  // before game time 0 it still reads a real place in the cycle
  assert.deepEqual({ ...cycleRead(-0.5, 0, 5, [2, 1], 2, out) }, { index: 2, into: 1.5, at: 4.5 });
  assert.deepEqual({ ...cycleRead(1, 1.5, 5, [2, 1], 2, out) }, { index: 1, into: 0.5, at: 2.5 });
});
