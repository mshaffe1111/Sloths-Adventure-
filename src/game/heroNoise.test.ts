import test from 'node:test';
import assert from 'node:assert/strict';
import { LOUD, breakNoise, drumNoise, hears, landingNoise, newFall, punchNoise, sound, stepFall, stunned, type Listener, type Sound } from './heroNoise.ts';
import { DOUBLE_RISE, JUMP_RISE } from './physics.ts';
import { STILLNESS, isStill, newStill, stepStill } from './stillness.ts';
import type { ThornVine } from './thornVine.ts';

const DT = 1 / 30;
const sleeper = (x: number, y = 700): Listener => ({ x, y, asleep: true, stunUntil: 0 });
const prowler = (x: number, y = 700): Listener => ({ x, y, asleep: false, stunUntil: 0 });

test('a landing is louder the higher he fell, silent under the soft line, and never louder than the cap', () => {
  const L = LOUD.landing;
  assert.equal(landingNoise(0, 0, 0, L.soft), null, 'at the soft line: silent');
  assert.equal(landingNoise(0, 0, 0, 40), null);
  const a = landingNoise(100, 700, 3, L.soft + 60)!;
  const b = landingNoise(100, 700, 3, L.soft + 260)!;
  const c = landingNoise(100, 700, 3, 5000)!;
  assert.deepEqual([a.x, a.y, a.t, a.from], [100, 700, 3, 'landing']);
  assert.ok(a.r >= L.min && a.r < b.r && b.r < c.r, `${a.r} < ${b.r} < ${c.r}`);
  assert.equal(c.r, L.max);
});

test('fairness: nothing he does on flat ground is loud (a jump, a double jump); only a drop from above is', () => {
  assert.ok(LOUD.landing.soft > DOUBLE_RISE, `the soft line ${LOUD.landing.soft} is over a double jump's rise ${Math.round(DOUBLE_RISE)}`);
  assert.equal(landingNoise(0, 0, 0, JUMP_RISE), null);
  assert.equal(landingNoise(0, 0, 0, DOUBLE_RISE), null);
});

test('a punch, a break and the drum each carry their own distance, from data', () => {
  const p = punchNoise(10, 20, 1);
  const k = breakNoise(10, 20, 1);
  const d = drumNoise(10, 20, 1);
  assert.deepEqual([p.r, k.r, d.r], [LOUD.punch.r, LOUD.breaking.r, LOUD.drum.r]);
  assert.deepEqual([p.from, k.from, d.from], ['punch', 'break', 'drum']);
  assert.ok(p.r < k.r && k.r < d.r, 'a punch is the quietest, the drum the loudest');
  assert.ok(LOUD.drum.stun > 0);
});

/** drop him from `fromY` to the ground at 700 (or onto a vine he grabs at `grabY`), frame by frame; the noise his landing made, if any */
function drop(fromY: number, x = 500, grabY?: number): Sound | null {
  const f = newFall();
  let y = fromY;
  let vy = 0;
  let made: Sound | null = null;
  stepFall(f, { y, grounded: true, holding: false });
  for (let n = 0; n < 200; n++) {
    vy += 1500 * DT;
    y = Math.min(700, y + vy * DT);
    const holding = grabY !== undefined && y >= grabY;
    if (holding) y = grabY!;
    const fell = stepFall(f, { y, grounded: !holding && y >= 700, holding });
    if (fell !== null) made = landingNoise(x, y, n * DT, fell);
    if (y >= 700 || holding) { vy = 0; if (n > 150) break; }
  }
  return made;
}

test('the fall is measured from the top of his arc to where he lands; catching a vine ends it without a sound', () => {
  const f = newFall();
  // a jump: up 100, back down to the same ground: a fall of 100
  let fell: number | null = null;
  stepFall(f, { y: 700, grounded: true, holding: false });
  for (const y of [660, 620, 600, 620, 660]) assert.equal(stepFall(f, { y, grounded: false, holding: false }), null);
  fell = stepFall(f, { y: 700, grounded: true, holding: false });
  assert.equal(fell, 100);
  assert.equal(stepFall(f, { y: 700, grounded: true, holding: false }), null, 'one landing, one report');
  // a long drop is loud; the same drop caught on a vine half way makes no landing at all, and letting go measures from the vine
  assert.ok(drop(200) !== null);
  assert.equal(drop(200, 500, 560), null, 'he caught the vine: hanging makes no landing noise');
  stepFall(f, { y: 300, grounded: false, holding: false });
  stepFall(f, { y: 500, grounded: false, holding: true });
  stepFall(f, { y: 560, grounded: false, holding: true });
  assert.equal(stepFall(f, { y: 700, grounded: true, holding: false }), 140, 'from where he let go, not from where he first fell');
});

test('the sleeper contract: inside the radius it wakes, outside it sleeps on; a noise does nothing twice', () => {
  const near = sleeper(700);
  const far = sleeper(2000);
  const above = sleeper(700, 100);
  const n = breakNoise(500, 700, 5);
  assert.equal(hears(n, near), true);
  assert.equal(hears(n, far), false);
  assert.equal(hears(n, above), false, 'too far up to hear it');
  assert.deepEqual(sound([near, far, above], n), { woke: 1, stunned: 0 });
  assert.deepEqual([near.asleep, far.asleep, above.asleep], [false, true, true]);
  assert.deepEqual(sound([near, far, above], n), { woke: 0, stunned: 0 });
});

test('stillness and soft landings keep a sleeper asleep', () => {
  const s = sleeper(540);
  // he stands still right beside it for ten seconds: stillness makes no noise at all
  const still = newStill();
  for (let n = 0; n < 300; n++) stepStill(still, { vx: 0, vy: 0, grounded: true, holding: false }, DT, STILLNESS.normal);
  assert.equal(isStill(still, STILLNESS.normal), true);
  // ...and hops on the spot, and double jumps: soft landings, no noise to hear
  for (const fromY of [700 - JUMP_RISE, 700 - DOUBLE_RISE]) {
    const made = drop(fromY);
    assert.equal(made, null);
    if (made) sound([s], made);
  }
  assert.equal(s.asleep, true);
});

// ── the examples (test-side) ──
test('3-5: sleeping thorn vines are woken by a hard landing beside them, and not by a soft one', () => {
  // three vines along a cave floor, as 3-5 hangs them; each listens from its bud
  const vines: ThornVine[] = [900, 1200, 2600].map((x, i) => ({ x, top: 300, bud: 560, reach: 120, sleep: 3, stir: 1.2, look: 1.6, offset: i * 1.7 }));
  const ears = () => vines.map((v) => sleeper(v.x, v.bud));
  // a soft landing right under the first vine: a hop
  let l = ears();
  const hop = drop(700 - JUMP_RISE, 900);
  assert.equal(hop, null);
  assert.deepEqual(l.map((e) => e.asleep), [true, true, true]);
  // a hard landing off the high ledge beside it: the near two wake, the far one sleeps on
  l = ears();
  const thud = drop(140, 1000)!;
  assert.ok(thud && thud.r >= 200, `a ${Math.round(thud.r)} px thud`);
  assert.deepEqual(sound(l, thud), { woke: 2, stunned: 0 });
  assert.deepEqual(l.map((e) => e.asleep), [false, false, true]);
  // the same drop, caught on a liana: nothing wakes
  l = ears();
  assert.equal(drop(140, 1000, 520), null);
  assert.deepEqual(l.map((e) => e.asleep), [true, true, true]);
});

test('the drum stuns every awake predator in its radius for the set time, and only those', () => {
  const a = prowler(300);
  const b = prowler(900);
  const away = prowler(600 + LOUD.drum.r + 50);
  const dozing = sleeper(700);
  const beat = drumNoise(600, 700, 10);
  assert.deepEqual(sound([a, b, away, dozing], beat), { woke: 1, stunned: 2 });
  for (const p of [a, b]) {
    assert.equal(stunned(p, 10), true);
    assert.equal(stunned(p, 10 + LOUD.drum.stun - DT), true);
    assert.equal(stunned(p, 10 + LOUD.drum.stun), false, 'the stun ends on time');
  }
  assert.equal(stunned(away, 10.1), false, 'out of its radius');
  // loud is loud: a sleeper in the radius is woken by it, and is not stunned (the drum is a choice, not a free pass)
  assert.deepEqual([dozing.asleep, stunned(dozing, 10.1)], [false, false]);
  // a punch or a landing stuns nobody
  const c = prowler(620);
  assert.deepEqual(sound([c], punchNoise(600, 700, 20)), { woke: 0, stunned: 0 });
  assert.equal(stunned(c, 20.1), false);
  // a second beat while stunned starts the time again from that beat, never shortens it
  sound([a], drumNoise(600, 700, 11));
  assert.equal(stunned(a, 11 + LOUD.drum.stun - DT), true);
});
