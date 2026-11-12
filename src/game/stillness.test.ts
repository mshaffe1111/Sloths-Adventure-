import test from 'node:test';
import assert from 'node:assert/strict';
import { STILLNESS, calm, inCover, isStill, moving, newStill, stepStill, watcherSees, type StillBody, type Watcher } from './stillness.ts';
import { VINE, vineSees, type ThornVine } from './thornVine.ts';
import { WATCH, hidden, newWatch, shadowX, stepWatch, type Bush, type WatchZone } from './watcher.ts';

const DT = 1 / 30;
const N = STILLNESS.normal;
const body = (o: Partial<StillBody> = {}): StillBody => ({ vx: 0, vy: 0, grounded: true, holding: false, ...o });
const run = (s = newStill(), b: StillBody, seconds: number, set = N) => { for (let n = 0; n < Math.round(seconds / DT); n++) stepStill(s, b, DT, set); return s; };

test('he is still on the ground under the threshold, after the calm-in, and any step breaks it at once', () => {
  const s = newStill();
  assert.equal(isStill(s, N), false);
  run(s, body(), N.calmIn / 2);
  assert.equal(isStill(s, N), false, 'not yet: the calm comes in over calmIn');
  assert.ok(calm(s, N) > 0.4 && calm(s, N) < 0.6, 'the tell is half in');
  run(s, body(), N.calmIn / 2 + DT);
  assert.equal(isStill(s, N), true);
  assert.equal(calm(s, N), 1);
  // a creep under the threshold keeps it (a thumb resting on the pad); a real step breaks it on that frame
  stepStill(s, body({ vx: N.speed }), DT, N);
  assert.equal(isStill(s, N), true);
  stepStill(s, body({ vx: -N.speed - 1 }), DT, N);
  assert.deepEqual([isStill(s, N), calm(s, N)], [false, 0]);
});

test('never while airborne; holding a vine counts, unless he is climbing it', () => {
  assert.equal(isStill(run(newStill(), body({ grounded: false }), 3), N), false, 'hanging in the air at the top of a jump is not still');
  assert.equal(isStill(run(newStill(), body({ grounded: false, vy: 300 }), 3), N), false);
  // on a vine the vine may carry him (a liana's swing): he is still while he does not climb
  assert.equal(isStill(run(newStill(), body({ grounded: false, holding: true, vx: 140 }), 1), N), true);
  assert.equal(isStill(run(newStill(), body({ grounded: false, holding: true, vy: -90 }), 1), N), false, 'climbing is moving');
  // landing does not carry stillness over from the air: the calm-in starts when he lands
  const s = run(newStill(), body({ grounded: false }), 2);
  stepStill(s, body(), DT, N);
  assert.equal(isStill(s, N), false);
});

test('the numbers are data, and Easy is never harder: calm comes in no later, and the threshold is no tighter', () => {
  const E = STILLNESS.easy;
  assert.ok(E.calmIn <= N.calmIn && E.speed >= N.speed);
  assert.ok(N.calmIn > 0 && N.speed > 0);
  // a pass is announced for long enough to stop and go calm twice over (watcher.ts WATCH.warn)
  assert.ok(N.calmIn * 2 <= WATCH.warn);
  const quick = { speed: 10, calmIn: 0.2 };
  assert.equal(isStill(run(newStill(), body({ vx: 12 }), 1, quick), quick), false);
  assert.equal(isStill(run(newStill(), body(), 0.25, quick), quick), true);
});

test('the watcher contract: movement in sight is seen; still in cover is unseen; still in the open is seen only by one that sees still', () => {
  const hunter: Watcher = {};
  const eagle: Watcher = { seesStill: true };
  for (const w of [hunter, eagle]) {
    assert.equal(watcherSees(w, false, false, false), false, 'out of its cone or shadow nothing is seen');
    assert.equal(watcherSees(w, true, false, false), true, 'moving in the open');
    assert.equal(watcherSees(w, true, false, true), true, 'moving inside cover: the leaves shake');
    assert.equal(watcherSees(w, true, true, true), false, 'still inside cover');
  }
  assert.equal(watcherSees(hunter, true, true, false), false, 'a hunter that looks for movement loses a still sloth anywhere');
  assert.equal(watcherSees(eagle, true, true, false), true, 'one that sees still (1-7\'s eagle; World 5\'s spiders, by touch) does not');
});

test('cover is the same place the bush hide already uses, standing or hanging', () => {
  const bushes: Bush[] = [{ x: 600, w: 160, y: 700, kind: 'wide' }, { x: 1000, w: 120, y: 300, kind: 'tall', hanging: true }, { x: 1300, w: 160, y: 700, kind: 'wide', secret: true }];
  for (let x = 560; x < 1500; x += 5) {
    assert.equal(inCover(bushes, { x, y: 700, grounded: true, holding: false }), hidden(bushes, { x, y: 700, grounded: true, ducking: true, hanging: false }), `on the ground at ${x}`);
    assert.equal(inCover(bushes, { x, y: 380, grounded: false, holding: true }), hidden(bushes, { x, y: 380, grounded: false, ducking: false, hanging: true }), `hanging at ${x}`);
  }
  assert.equal(inCover(bushes, { x: 680, y: 640, grounded: false, holding: false }), false, 'jumping through a bush is not in it');
});

test('one line for "moving": it is the thorn vines\' line, so a vine can read this state later with nothing changed', () => {
  assert.equal(N.speed, VINE.still);
  // a vine that never sleeps, him standing in its reach: it sees him exactly when stillness calls him moving
  const vine: ThornVine = { x: 500, top: 0, bud: 300, reach: 200, sleep: 0, stir: 0, look: 1, offset: 0, awake: true };
  for (const grounded of [true, false]) for (let vx = -60; vx <= 60; vx += 0.5) {
    assert.equal(moving(body({ vx, grounded }), N), vineSees(vine, 0.5, { x: 520, y: 380, vx, grounded }), `vx ${vx}, grounded ${grounded}`);
  }
});

// ── the example (test-side): 1-7's eagle shadow, read through the contract. A watched stretch with two bushes; the eagle comes on
//    watcher.ts's own rhythm and its shadow crosses the ground. ──
const BUSHES: Bush[] = [{ x: 600, w: 160, y: 700, kind: 'wide' }, { x: 1500, w: 160, y: 700, kind: 'wide' }];
const ZONE: WatchZone = { x0: 0, x1: 2400, calm: [1.5, 1.5] };
const EAGLE: Watcher = { seesStill: true };
/** play `seconds` of one plan (where he wants to be and how fast he walks); returns the frames he was seen on and the calm at the first sweep */
function play(w: Watcher, plan: (t: number, x: number) => number, seconds: number, x0: number) {
  const watch = newWatch();
  const still = newStill();
  let x = x0;
  const seenAt: number[] = [];
  let calmAtSweep = -1;
  let overhead = 0;
  for (let n = 0; n < Math.round(seconds / DT); n++) {
    const vx = plan(n * DT, x);
    x += vx * DT;
    stepStill(still, body({ vx }), DT, N);
    stepWatch(watch, DT, ZONE, () => 0);
    if (watch.phase !== 'pass') continue;
    if (calmAtSweep < 0) calmAtSweep = calm(still, N);
    const shadow = shadowX(watch, x - 400, 800);
    const inSight = Math.abs(shadow - x) < WATCH.sight;
    if (inSight) overhead++;
    if (watcherSees(w, inSight, isStill(still, N), inCover(BUSHES, { x, y: 700, grounded: true, holding: false }))) seenAt.push(n);
  }
  return { seenAt, calmAtSweep, x, overhead, passes: watch.passes };
}
const toward = (goal: number, speed = 150) => (_t: number, x: number) => (Math.abs(goal - x) < 4 ? 0 : Math.sign(goal - x) * speed);

test('1-7: running between the bushes, the shadow spots him', () => {
  const r = play(EAGLE, () => 150, 9, 780);
  assert.ok(r.seenAt.length > 0, 'the shadow crossed him out in the open and saw him');
});

test('1-7: he freezes in the bush before the sweep, the moss is fully in, and the shadow passes over without seeing him', () => {
  const r = play(EAGLE, toward(680), 14, 420);
  assert.ok(Math.abs(r.x - 680) < 5, 'he is in the bush');
  assert.equal(r.calmAtSweep, 1, 'calm was all the way in before the first sweep began');
  assert.ok(r.passes >= 2 && r.overhead > 10, `the shadow really crossed him (${r.passes} passes, ${r.overhead} frames overhead)`);
  assert.deepEqual(r.seenAt, [], 'never seen');
});

test('1-7: in the bush but fidgeting he is seen, and frozen out in the open he is seen: "in the bush, hold still" is one lesson', () => {
  const fidget = play(EAGLE, (t) => (Math.sin(t * 6) > 0 ? 60 : -60), 9, 680);
  assert.ok(fidget.seenAt.length > 0, 'the leaves shake');
  const open = play(EAGLE, () => 0, 9, 1100);
  assert.ok(open.seenAt.length > 0, 'the first world\'s eagle sees a still sloth in the open');
  // the later lesson (stillness anywhere): a hunter that looks only for movement loses him in that same open spot
  const lost = play({}, () => 0, 9, 1100);
  assert.ok(lost.overhead >= 5, `it looked right at him (${lost.overhead} frames)`);
  assert.deepEqual(lost.seenAt, []);
  // ...but not if he runs
  assert.ok(play({}, () => 150, 9, 780).seenAt.length > 0);
});
