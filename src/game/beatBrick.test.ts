import test from 'node:test';
import assert from 'node:assert/strict';
import { brickFair, brickNow, type BeatBrick } from './beatBrick.ts';
import { checkClock, clockAt, stageClock } from './clock.ts';
import type { ClockDef } from './stageKit.types.ts';

// The example piece (test-side only; World 2's real stone is a B5 piece): a snap-jaw stone on a four-beat count. He may stand on it on
// beats 1 to 3; it bites on beat 4; its jaw creaks open over the last half second of beat 3 (the warning).
const BEAT = 0.75;
const WARN = 0.5;
const jawClock: ClockDef = { id: 'jaws', phases: [{ name: 'off', seconds: 3 * BEAT - WARN }, { name: 'warn', seconds: WARN }, { name: 'on', seconds: BEAT }], offset: 0, easyStretch: 1.4 };
const stone: BeatBrick = { clock: 'jaws', on: 'bites' };
const stoneAt = (t: number, easy = false, shift = 0) => brickNow(stone.on, clockAt(jawClock, t, easy, shift));

test('a snap-jaw stone is safe on beats 1 to 3 and bites on beat 4, every bar, and always holds him up', () => {
  assert.deepEqual(checkClock(jawClock), []);
  const bites: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
  for (let n = 0; n < 30 * 12; n++) {
    const t = n / 30;
    const beat = Math.floor((t % (4 * BEAT)) / BEAT) + 1;
    const now = stoneAt(t);
    assert.equal(now.solid, true);
    assert.equal(now.hurts, beat === 4, `beat ${beat} at ${t}`);
    if (now.hurts) bites[beat]++;
  }
  assert.deepEqual([bites[1], bites[2], bites[3]], [0, 0, 0]);
  assert.ok(bites[4] > 80);
});

test('it never bites unwarned: the jaw opens for the whole warning first, a little wider each frame', () => {
  for (const easy of [false, true]) {
    let run: number[] = [];
    let prev = stoneAt(0, easy);
    let bitesSeen = 0;
    for (let n = 1; n < 30 * 20; n++) {
      const now = stoneAt(n / 30, easy);
      if (!now.hurts && now.tell > 0) {
        if (run.length) assert.ok(now.tell > run[run.length - 1], 'the tell only grows');
        run.push(now.tell);
      }
      if (now.hurts && !prev.hurts) {
        bitesSeen++;
        assert.ok(run.length >= (easy ? 20 : 14), `only ${run.length} frames of warning before a bite (easy ${easy})`);
        assert.ok(prev.tell > 0.9, 'the jaw is wide open the frame before it snaps');
        assert.equal(now.tell, 1);
        run = [];
      }
      if (!now.hurts && now.tell === 0) assert.equal(run.length, 0, 'a warning is never called off');
      prev = now;
    }
    assert.ok(bitesSeen >= 4);
  }
});

test('Easy gives him longer on the stone and a longer warning, never a faster bite', () => {
  const count = (easy: boolean) => {
    let safe = 0;
    let bites = 0;
    let prev = false;
    for (let n = 0; n < 30 * 42; n++) { const h = stoneAt(n / 30, easy).hurts; if (!h) safe++; if (h && !prev) bites++; prev = h; }
    return { safe, bites };
  };
  const normal = count(false);
  const easy = count(true);
  assert.ok(easy.bites < normal.bites, `${easy.bites} bites on Easy, ${normal.bites} on Normal`);
  // one safe spell: 2.25 s on Normal, 3.15 s on Easy
  assert.equal(clockAt(jawClock, 0, false).toOn, 2.25);
  assert.ok(Math.abs(clockAt(jawClock, 0, true).toOn - 3.15) < 1e-9);
  assert.ok(easy.safe / easy.bites > normal.safe / normal.bites);
});

test('stones on one clock, a beat apart, snap in a row and never two neighbours at once: there is always a way across', () => {
  const lane = [0, 1, 2, 3].map((k) => ({ ...stone, shift: k * BEAT }));
  const clock = stageClock([jawClock], false);
  for (let n = 0; n < 30 * 12; n++) {
    clock.step(1 / 30);
    const biting = lane.map((b) => brickNow(b.on, clock.read(b.clock, b.shift)).hurts);
    assert.equal(biting.filter(Boolean).length, 1, `exactly one stone of the four is biting (frame ${n}: ${biting})`);
  }
  // paused, the jaws hold exactly where they were
  const held = lane.map((b) => brickNow(b.on, clock.read(b.clock, b.shift)));
  assert.deepEqual(lane.map((b) => brickNow(b.on, clock.read(b.clock, b.shift))), held);
});

test('a sinking pad on the same base: it holds through the warning, is gone while on, and never hurts', () => {
  const padClock: ClockDef = { id: 'pads', phases: [{ name: 'off', seconds: 2 }, { name: 'warn', seconds: 1 }, { name: 'on', seconds: 1.5 }, { name: 'rest', seconds: 0.5 }], offset: 0, easyStretch: 1.25 };
  const pad = (t: number) => brickNow('gone', clockAt(padClock, t));
  assert.deepEqual(pad(1), { solid: true, hurts: false, tell: 0 });
  assert.deepEqual(pad(2.5), { solid: true, hurts: false, tell: 0.5 });
  assert.deepEqual(pad(3.5), { solid: false, hurts: false, tell: 1 });
  // back up, and settling: it holds him again before the next count
  assert.deepEqual(pad(4.75), { solid: true, hurts: false, tell: 0 });
});

test('the builder\'s check refuses a brick that is not fair, with the reason', () => {
  const need = { warn: 0.4, safe: 1.5 };
  assert.deepEqual(brickFair(jawClock, need), []);
  // too short a warning to read
  const snap: ClockDef = { ...jawClock, phases: [{ name: 'off', seconds: 2.15 }, { name: 'warn', seconds: 0.1 }, { name: 'on', seconds: BEAT }] };
  assert.match(brickFair(snap, need).join(), /warn/);
  // too short a safe spell to cross
  const greedy: ClockDef = { ...jawClock, phases: [{ name: 'off', seconds: 0.3 }, { name: 'warn', seconds: 0.5 }, { name: 'on', seconds: 2 }] };
  assert.match(brickFair(greedy, need).join(), /safe/);
  // no warning at all: the clock's own rule, passed on
  const bare: ClockDef = { ...jawClock, phases: [{ name: 'off', seconds: 3 }, { name: 'on', seconds: 1 }] };
  assert.match(brickFair(bare, need).join(), /no warn/);
  // a clock that never comes on is no beat at all
  assert.match(brickFair({ ...jawClock, phases: [{ name: 'off', seconds: 3 }] }, need).join(), /never on/);
  // two bites a bar: the short spell between them is the one that counts
  const twice: ClockDef = { ...jawClock, phases: [{ name: 'off', seconds: 2 }, { name: 'warn', seconds: 0.5 }, { name: 'on', seconds: 0.5 }, { name: 'warn', seconds: 0.5 }, { name: 'on', seconds: 0.5 }] };
  assert.match(brickFair(twice, need).join(), /safe/);
  assert.deepEqual(brickFair(twice, { warn: 0.4, safe: 0.5 }), []);
});
