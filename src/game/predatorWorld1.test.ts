// World 1's three, worked through (reference/design/PREDATORS.md §2, §3): for the Golden Tree Snake, the Harpy Eagle and the Boa
// Constrictor, the tell, the attack, and every way to beat it. Read top to bottom, this is how each animal plays.
// Every run goes through predators/fixtures.ts's `run`, which asserts the tell gate on every step.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { landingNoise, thrownNoise } from './heroNoise.ts';
import { inWorld } from './predators/ways.ts';
import { STILLNESS } from './stillness.ts';
import { GONE_AFTER, beat, checkPredator, foodChain, hear, hurt, newPredator, tellOf, touches } from './predators/core.ts';
import { DT, firstT, post, prey, run } from './predators/fixtures.ts';
import { BOA, EAGLE, SNAKE, WORLD1 } from './predators/world1.ts';
import type { PredatorState, Prey } from './predators/types.ts';

const branch = (over = {}) => post({ x: 600, y: 300, minX: 400, maxX: 700, facing: -1, ...over });
const bough = () => post({ x: 600, y: 300, minX: 600, maxX: 600 });
const sky = () => post({ x: 700, y: 40, minX: 200, maxX: 1200 });
const bush = (x: number): Prey => prey({ x, still: true, covered: true });

test('all three are fair: a tell of 0.5 s or more, two ways or more and never only the stomp, Easy never harder', () => {
  for (const d of WORLD1) assert.deepEqual(checkPredator(d), [], d.kind);
  assert.deepEqual(WORLD1.map((d) => [d.kind, d.habit, d.first]), [['snake', 'patrol', 'punch'], ['boa', 'ambush', 'trap'], ['eagle', 'sweep', 'still']]);
});

// ───────────────────────────── the Golden Tree Snake: it gives ground ─────────────────────────────

/** he walks at the snake from the left until he is `stop` px from the end of its branch */
const crowd = (s: PredatorState, stop = 60) => (t: number): Prey => prey({ x: Math.min(380 + 70 * t, 700 - stop) });

test('snake, the tell and the attack: it backs to the end of its branch, rears for half a second, then strikes what is in reach', () => {
  for (const easy of [false, true]) {
    const s = newPredator(SNAKE, branch());
    let bitten = NaN;
    const ev = run(SNAKE, s, 8, (t) => {
      const p = crowd(s, 30)(t);
      if (Number.isNaN(bitten) && touches(hurt(SNAKE, s), p)) bitten = t;
      return p;
    }, { easy });
    const tell = firstT(ev, 'tell');
    assert.ok(tell > 1, `it gave ground first (the tell came at ${tell} s)`);
    assert.ok(bitten - tell >= tellOf(SNAKE, easy) - DT - 1e-9, `the strike landed ${bitten - tell} s after it reared`);
  }
});

test('snake, the read: stay out of its reach and a half and it never strikes; he can stand and watch it', () => {
  const s = newPredator(SNAKE, branch());
  const ev = run(SNAKE, s, 10, crowd(s, 170));
  assert.equal(ev.filter((e) => e.tell).length, 0);
  assert.ok(s.x >= 699, 'it is at the end of its branch, watching him');
});

test('snake, way 1 (taught first, 1-3): a punch stuns it for 2 s, any time, and the sleeping first one is a free punch', () => {
  const s = newPredator(SNAKE, branch());
  run(SNAKE, s, 1, crowd(s));
  assert.equal(beat(SNAKE, s, 'punch', 1), true);
  run(SNAKE, s, 1.9, () => prey({ x: 580 }), { t0: 1 });
  assert.equal(s.phase, 'stunned', 'he is right beside it and it does nothing');
  const z = newPredator(SNAKE, branch({ asleep: true }));
  run(SNAKE, z, 3, () => prey({ x: 480 }));
  assert.equal(z.asleep, true, 'asleep until he moves within 95 px of it');
  assert.equal(beat(SNAKE, z, 'punch', 3), true);
});

test('snake, way 1, the branch end: a punch shoves it 70 px along its branch; one that has backed to the end is knocked off and glides away', () => {
  const mid = newPredator(SNAKE, branch({ x: 560 }));
  assert.equal(beat(SNAKE, mid, 'punch', 0, 520), true);
  assert.deepEqual([mid.phase, mid.x, mid.leaving], ['stunned', 630, false], 'mid-branch it is shoved away from him and sits dazed');
  assert.equal(beat(SNAKE, mid, 'punch', 0.5, 590), true);
  assert.deepEqual([mid.phase, mid.x, mid.leaving], ['stunned', 700, false], 'the second shoves it to the very end of its branch');
  assert.equal(beat(SNAKE, mid, 'punch', 1, 660), true, 'the third has no branch left to shove it along');
  assert.deepEqual([mid.phase, mid.leaving, mid.facing], ['flee', true, 1], 'off the end, away from him');
  run(SNAKE, mid, GONE_AFTER + 0.1, () => prey({ x: 660 }), { t0: 1 });
  assert.equal(mid.phase, 'gone', 'it glides off and stays away');
  const end = newPredator(SNAKE, branch());
  run(SNAKE, end, 2.4, (t) => prey({ x: 380 + 70 * t }));
  assert.ok(end.x > 630 && end.phase === 'hunt', 'shy: it has been backing along its branch, away from him');
  assert.equal(beat(SNAKE, end, 'punch', 2.4, end.x - 40), true);
  assert.equal(end.leaving, true, 'one punch at the branch end knocks it off');
  const noSide = newPredator(SNAKE, branch({ x: 690 }));
  assert.equal(beat(SNAKE, noSide, 'punch', 0), true);
  assert.deepEqual([noSide.phase, noSide.x], ['stunned', 690], 'a blow from nowhere (no side given) only stuns');
});

test('snake, however he beats it, it ends the same kind way (Matt, 11-12): it flattens and glides to a lower tree, gone for good', () => {
  // (every ENDING in its data is the glide; a punch mid-branch is not an ending: it only shoves it along and dazes it)
  for (const [w, o] of Object.entries(SNAKE.beatenBy)) assert.ok(o.ends === 'chasedOff' || (w === 'punch' && o.ends === 'stunned' && o.knock), `${w} ends ${o.ends}`);
  const gone = (name: string, s: PredatorState, t0: number) => {
    assert.deepEqual([s.phase, s.leaving], ['flee', true], `${name}: it is on its way out`);
    run(SNAKE, s, GONE_AFTER + 0.1, () => prey({ x: 560 }), { t0 });
    assert.equal(s.phase, 'gone', `${name}: gone`);
    const ev = run(SNAKE, s, 8, () => prey({ x: 600 }), { t0: t0 + 2 });
    assert.deepEqual([s.phase, ev.length], ['gone', 0], `${name}: and it never comes back, though he stands on its branch`);
  };
  const trapped = newPredator(SNAKE, branch());
  assert.equal(beat(SNAKE, trapped, 'trap', 0, 560), true);
  gone('a drop trap', trapped, 0);
  const stomped = newPredator(SNAKE, branch());
  run(SNAKE, stomped, 2, crowd(stomped));
  assert.equal(beat(SNAKE, stomped, 'stomp', 2, 560), true);
  gone('a stomp (he vaults it)', stomped, 2);
  const kicked = newPredator(SNAKE, branch());
  assert.equal(beat(SNAKE, kicked, 'kick', 0, 560), true);
  gone('a kick', kicked, 0);
  const punched = newPredator(SNAKE, branch({ x: 690 }));
  assert.equal(beat(SNAKE, punched, 'punch', 0, 650), true);
  gone('a punch at its branch end', punched, 0);
  assert.equal(beat(SNAKE, newPredator(SNAKE, branch()), 'drum', 0), false, 'no drum in World 1');
});

// ───────────────────────────── the Harpy Eagle: the shadow ─────────────────────────────

test('eagle, the tell and the attack: a screech, two seconds of shadow at the edge, the sweep; seen, it dives 0.75 s later and it lands', () => {
  for (const easy of [false, true]) {
    const s = newPredator(EAGLE, sky());
    let hit = NaN;
    const ev = run(EAGLE, s, 12, (t) => {
      const p = prey({ x: 600 + 30 * t });
      if (Number.isNaN(hit) && touches(hurt(EAGLE, s), p)) hit = t;
      return p;
    }, { easy });
    const k = easy ? EAGLE.easy.tell : 1;
    assert.equal(firstT(ev, 'notice'), 0, 'the screech');
    const tell = firstT(ev, 'tell');
    assert.ok(tell >= 2 * k, `nothing but shadow for the warn (${tell} s)`);
    assert.ok(hit - tell >= 0.75 * k - DT - 1e-9, `the dive landed ${hit - tell} s after it saw him`);
  }
});

test('eagle, way 1 (taught first, 1-7): in the bush, hold still. The pass goes over; after two empty passes it gives up for 8 s', () => {
  const s = newPredator(EAGLE, sky());
  const ev = run(EAGLE, s, 30, () => bush(700));
  assert.equal(ev.filter((e) => e.tell || e.act).length, 0, 'never a dive');
  const gaveUp = ev.find((e) => e.beaten === 'still');
  assert.ok(gaveUp, 'stillness beat it');
  // for the next 8 s he crosses the open and nothing comes
  const s2 = newPredator(EAGLE, sky());
  run(EAGLE, s2, gaveUp.t + DT, () => bush(700));
  const open = run(EAGLE, s2, 7.5, (t) => prey({ x: 700 + 40 * (t - gaveUp.t) }), { t0: gaveUp.t + DT });
  assert.equal(open.length, 0);
  // still in the open is NOT enough for this one: only the bush hides him
  const o = newPredator(EAGLE, sky());
  assert.ok(Number.isFinite(firstT(run(EAGLE, o, 10, () => prey({ x: 700, still: true })), 'act')));
});

test('eagle, the last-second save: seen in the open, he makes the bush and goes still before the dive, and it pulls up', () => {
  const s = newPredator(EAGLE, sky());
  let seenAt = NaN;
  const ev = run(EAGLE, s, 8, (t) => {
    if (s.phase === 'tell' && Number.isNaN(seenAt)) seenAt = t;
    // 0.15 s to step into the bush beside him, then the calm comes in (stillness.ts)
    const safe = !Number.isNaN(seenAt) && t >= seenAt + 0.15 + STILLNESS.normal.calmIn;
    return prey({ x: 700, still: safe, covered: safe });
  });
  assert.ok(0.15 + STILLNESS.normal.calmIn < EAGLE.tell, 'the save fits inside the dive tell');
  assert.ok(Number.isFinite(seenAt));
  assert.equal(firstT(ev, 'act'), NaN);
});

test('eagle, in World 1 there is no noise lure: nothing he throws or lands pulls the shadow off him (the move ladder)', () => {
  const W1 = inWorld(EAGLE, 1);
  const s = newPredator(W1, sky());
  let heard: string | null = 'never';
  const ev = run(W1, s, 8, (t) => {
    if (heard === 'never' && s.phase === 'hunt' && s.eyeX > 200) heard = hear(W1, s, thrownNoise(260, 300, t)) ?? hear(W1, s, landingNoise(260, 300, t, 420)!);
    return prey({ x: 700 + 60 * Math.max(0, t - 2) });
  });
  assert.equal(heard, null);
  assert.ok(Number.isFinite(firstT(ev, 'act')), 'crossing the open under the pass, he is dived at');
  assert.equal(beat(W1, s, 'punch', 8), false, 'it cannot be hit');
  assert.equal(beat(W1, s, 'stomp', 8), false);
});

test('eagle, from World 3 on (so 4-5): a thrown pebble pulls its shadow to the noise for 4.5 s, and he crosses behind it', () => {
  const W4 = inWorld(EAGLE, 4);
  const s = newPredator(W4, sky());
  let drew = false;
  const ev = run(W4, s, 6.4, (t) => {
    if (!drew && s.phase === 'hunt' && s.eyeX > 200) drew = hear(W4, s, thrownNoise(260, 300, t)) === 'drawn';
    return prey({ x: 700 + 60 * Math.max(0, t - 2) });
  });
  assert.equal(drew, true);
  assert.equal(ev.filter((e) => e.tell).length, 0);
});

// ───────────────────────────── the Boa Constrictor: it strikes at movement ─────────────────────────────

test('boa, the tell and the attack: movement inside 150 px and it rears for 0.8 s, then strikes 128 px, then its head is out for 0.8 s', () => {
  for (const easy of [false, true]) {
    const s = newPredator(BOA, bough());
    let bitten = NaN;
    let headOut = 0;
    const ev = run(BOA, s, 3, (t) => {
      const p = prey({ x: Math.min(380 + 110 * t, 490) });
      if (Number.isNaN(bitten) && touches(hurt(BOA, s), p)) bitten = t;
      if (s.phase === 'recover') headOut += DT;
      assert.equal(s.x, 600, 'it never leaves its bough');
      return p;
    }, { easy });
    const tell = firstT(ev, 'tell');
    assert.ok(bitten - tell >= tellOf(BOA, easy) - DT - 1e-9, `the strike landed ${bitten - tell} s after it reared (110 px away: inside its reach)`);
    assert.ok(headOut >= BOA.recover - DT);
  }
});

test('boa, way 1 (taught first, 1-9): a drop trap chases it off, away from where the trap fell', () => {
  const s = newPredator(BOA, bough());
  assert.equal(beat(BOA, s, 'trap', 0, 560), true);
  assert.equal(s.facing, 1);
  run(BOA, s, GONE_AFTER + 0.1, () => prey({ x: 500 }));
  assert.equal(s.phase, 'gone');
});

test("boa, way 2, the food chain: lead the eagle's shadow over it and it is chased off; the eagle does nothing to it", () => {
  const boa = newPredator(BOA, bough());
  const eagle = newPredator(EAGLE, post({ x: 700, y: 40, minX: 200, maxX: 1200 }));
  const both = [{ def: BOA, s: boa }, { def: EAGLE, s: eagle }];
  let ranAt = NaN;
  for (let i = 0, t = 0; i < 8 / DT && Number.isNaN(ranAt); i++, t += DT) {
    // he waits in a bush past the boa: the pass he called sweeps over its bough
    run(EAGLE, eagle, DT, () => bush(900), { t0: t });
    run(BOA, boa, DT, () => bush(900), { t0: t });
    if (foodChain(both, t)) ranAt = t;
  }
  assert.ok(ranAt > 2, `the shadow reached it after the warn (${ranAt} s)`);
  assert.ok(Math.abs(eagle.eyeX - 600) <= EAGLE.sight.ahead + 320 * DT, 'when the eye was over its bough');
  assert.deepEqual([boa.phase, boa.leaving, boa.beatenBy], ['flee', true, 'lure']);
  assert.equal(eagle.phase, 'hunt', 'the eagle just carries on its pass');
  // a resting eagle scares nothing, even with its eye parked right over the bough: only a pass that is out counts
  const calm = newPredator(BOA, bough());
  const perched = newPredator(EAGLE, post({ x: 700, y: 40, minX: 600, maxX: 1200 }));
  assert.deepEqual([perched.eyeX, perched.phase], [600, 'rest']);
  assert.equal(foodChain([{ def: BOA, s: calm }, { def: EAGLE, s: perched }], 0), 0);
});

test('boa, way 3: go still while it rears and he is a branch: it settles back for 4 s, and he walks past', () => {
  for (const set of ['normal', 'easy'] as const) {
    const easy = set === 'easy';
    const s = newPredator(BOA, bough());
    let tellAt = NaN;
    let walked = false;
    const ev = run(BOA, s, 5, (t) => {
      if (s.phase === 'tell' && Number.isNaN(tellAt)) tellAt = t;
      if (Number.isNaN(tellAt)) return prey({ x: 380 + 110 * t });
      // he sees it rear, takes 0.2 s to stop, and the calm comes in
      const calm = t >= tellAt + 0.2 + STILLNESS[set].calmIn;
      if (s.phase === 'flee') {
        walked = true;
        return prey({ x: 480 + 90 * (t - tellAt - 1) });
      }
      return prey({ x: 480, still: calm });
    }, { easy });
    assert.ok(0.2 + STILLNESS[set].calmIn < tellOf(BOA, easy), `${set}: a 0.2 s reaction fits inside its rear`);
    assert.equal(ev.filter((e) => e.act).length, 0, 'it never struck');
    assert.equal(ev.filter((e) => e.beaten === 'still').length, 1);
    assert.equal(walked, true, 'and he walked on past it while it was settled');
  }
  // moving on through its rear is not a branch: it strikes
  const m = newPredator(BOA, bough());
  assert.ok(Number.isFinite(firstT(run(BOA, m, 3, (t) => prey({ x: 380 + 110 * t })), 'act')));
});

test('boa, way 4: a punch only works while its head is out after a miss; then it is stunned for 2.5 s', () => {
  const s = newPredator(BOA, bough());
  let early = false;
  let landed = false;
  run(BOA, s, 3, (t) => {
    if (s.phase === 'rest' || s.phase === 'tell') early = early || beat(BOA, s, 'punch', t);
    if (s.phase === 'recover' && !landed) landed = beat(BOA, s, 'punch', t);
    // he draws the strike from just past its reach
    return prey({ x: 600 - 128 - 16 });
  });
  assert.equal(early, false, 'coiled or rearing, a punch does nothing');
  assert.equal(landed, true);
  assert.equal(s.phase, 'stunned');
});
