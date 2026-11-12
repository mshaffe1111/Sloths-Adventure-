// The casts after World 1 as kit data (reference/design/PREDATORS.md §2, §3): first-draft numbers from today's code, each held
// fair, each with the roster's habit, and the kit rules they needed: a way that only works from behind (the turtle's shell), a
// gait of bursts and pauses (the spider), a sweeper whose body rides its eye (the caiman's ripple), looking at a noise without
// leaving its spot (the sentry), and stillness beating anything that has nowhere to go (the frog).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bellNoise, landingNoise, thrownNoise } from './heroNoise.ts';
import { NOISE } from './noise.ts';
import { inWorld } from './predators/ways.ts';
import { beat, blocks, checkPredator, foodChain, hear, hurt, newPredator, touches } from './predators/core.ts';
import { DT, firstT, post, prey, run } from './predators/fixtures.ts';
import { CAIMAN, CASTS_AFTER_1, FROG, HARPY, JAGUAR, OCELOT, RIVER_GUARD, SENTRY, SPIDER, TAYRA, TURTLE } from './predators/casts.ts';
import { HABIT, type Kind } from './predators/roster.ts';
import type { ClockDef } from './stageKit.types.ts';

test('every animal after World 1 is fair, has the habit the roster gives it, and is never beaten only by hitting it', () => {
  assert.equal(CASTS_AFTER_1.length, 10);
  for (const d of CASTS_AFTER_1) {
    assert.deepEqual(checkPredator(d), [], d.kind);
    assert.equal(d.habit, HABIT[d.kind as Kind], d.kind);
    const ways = Object.keys(d.beatenBy);
    const hits = ['stomp', 'punch', 'kick'];
    assert.ok(ways.some((w) => !hits.includes(w)) || d.hears, `${d.kind}: a way that is not a hit (${ways})`);
  }
});

test('turtle: all shell from the front. A punch only works from behind; a kick sends the shell away from the kicker', () => {
  const s = newPredator(TURTLE, post({ facing: -1 }));
  assert.equal(beat(TURTLE, s, 'punch', 0, 440), false, 'from the front: the shell');
  assert.equal(beat(TURTLE, s, 'punch', 0), false, 'and with no side given, it is not behind');
  assert.equal(beat(TURTLE, s, 'punch', 0, 560), true, 'from behind');
  const k = newPredator(TURTLE, post({ facing: -1 }));
  assert.equal(beat(TURTLE, k, 'kick', 0, 440), true);
  assert.deepEqual([k.leaving, k.facing], [true, 1]);
  // nosy: it walks to a noise and he passes behind its back
  const n = newPredator(TURTLE, post());
  assert.equal(hear(TURTLE, n, thrownNoise(650, 300, 0)), 'drawn');
  assert.equal(run(TURTLE, n, 4, () => prey({ x: 520 })).filter((e) => e.tell).length, 0);
});

test("River King's guard: it leaves its post for nothing but the bell (World 2's own noise, rung, not thrown)", () => {
  const G = inWorld(RIVER_GUARD, 2);
  const s = newPredator(G, post({ x: 500, minX: 420, maxX: 700 }));
  assert.equal(blocks(G, s), true);
  assert.equal(run(G, s, 3, () => prey({ x: 380 })).length, 0, 'he stands off and it only stands there');
  assert.equal(hear(G, s, landingNoise(560, 300, 3, 400)!), null, 'his own landing does not move it');
  const bell = bellNoise(600, 240, 3);
  assert.equal(bell.r, NOISE.bellHear);
  assert.equal(hear(G, s, bell), 'drawn');
  const ev = run(G, s, 6, (t) => prey({ x: 380 + 30 * (t - 3) }), { t0: 3 });
  assert.ok(s.x > 590, `it walked to the bell (${s.x})`);
  assert.equal(ev.length, 0, 'and he walked through its post behind its back');
  run(G, s, 12, () => prey({ x: -999 }), { t0: 9 });
  assert.ok(Math.abs(s.x - 500) <= 6, 'then it goes back to its post');
  // the turtle answers the bell too, in its own world
  const t = newPredator(inWorld(TURTLE, 2), post());
  assert.equal(hear(inWorld(TURTLE, 2), t, bellNoise(650, 240, 0)), 'drawn');
});

test('spider: it comes in bursts and pauses; in the pause it is open; stillness does not hide him from it', () => {
  const s = newPredator(SPIDER, post({ x: 700, minX: 100, maxX: 700, facing: -1 }));
  const xs: number[] = [];
  let openInPause = false;
  let closedInBurst = true;
  run(SPIDER, s, 1.5, (t) => {
    xs.push(s.x);
    if (s.phase === 'hunt') {
      const moved = xs.length > 1 && xs[xs.length - 2] !== s.x;
      const probe = { ...s };
      const worked = beat(SPIDER, probe, 'punch', t);
      if (!moved && xs.length > 3 && worked) openInPause = true;
      if (moved && worked) closedInBurst = false;
    }
    return prey({ x: 300, still: true });
  });
  const stops = xs.filter((x, i) => i > 0 && x === xs[i - 1]).length * DT;
  assert.ok(s.x < 700 - 100, `it came at a still sloth (${s.x}): it feels the silk`);
  assert.ok(stops >= 0.3 && stops <= 0.75, `it paused for ${stops} s of 1.5`);
  assert.equal(openInPause, true);
  assert.equal(closedInBurst, true, 'a punch mid-burst does nothing');
});

test("caiman: the ripple is the animal. Its body rides its eye along its water; a still sloth is passed; asleep, it is a log", () => {
  const water = () => post({ x: 300, y: 300, minX: 300, maxX: 900, facing: 1 });
  const s = newPredator(CAIMAN, water());
  let rode = true;
  const ev = run(CAIMAN, s, 14, () => {
    if (s.phase === 'hunt' && Math.abs(s.x - s.eyeX) > 1) rode = false;
    return prey({ x: 600, y: 280, still: true });
  });
  assert.equal(rode, true);
  assert.equal(ev.filter((e) => e.tell).length, 0, 'he held still on his log and the ripple went by');
  const m = newPredator(CAIMAN, water());
  let hit = false;
  const ev2 = run(CAIMAN, m, 14, () => {
    const p = prey({ x: 600, y: 280 });
    hit = hit || touches(hurt(CAIMAN, m), p);
    return p;
  });
  assert.ok(Math.abs(firstT(ev2, 'tell') - (1 + (600 - 90 - 300) / 60)) < 0.2, 'it rose where its ripple reached him');
  assert.equal(hit, true);
  const z = newPredator(CAIMAN, { ...water(), asleep: true });
  assert.equal(run(CAIMAN, z, 10, () => prey({ x: 320, y: 280 })).length, 0, '2-6: he walks across its back and it sleeps on');
  assert.equal(hear(CAIMAN, z, landingNoise(320, 280, 10, 400)!), 'woke', 'a hard landing is another matter');
});

test('sentry: it stands in the doorway and cannot be hit; a noise turns its head (it does not leave its spot) and it notices nobody', () => {
  const s = newPredator(SENTRY, post());
  assert.equal(blocks(SENTRY, s), true);
  for (const w of ['stomp', 'punch', 'kick'] as const) assert.equal(beat(SENTRY, s, w, 0, 440), false, w);
  assert.equal(hear(SENTRY, s, thrownNoise(700, 300, 0)), 'drawn');
  const ev = run(SENTRY, s, 4.3, () => prey({ x: 450 }));
  assert.deepEqual([ev.length, s.x, s.facing], [0, 500, 1], 'head turned to the noise; he is inside its reach behind it');
  run(SENTRY, s, 0.5, () => prey({ x: -999 }), { t0: 4.3 });
  assert.equal(s.drawn, false, 'then it looks back');
  assert.equal(beat(SENTRY, s, 'break', 5, 560), true);
});

test('frog: on the clock; go still when its throat flashes and it settles (stillness beats what has nowhere to go)', () => {
  const HOP: ClockDef = { id: 'hop', phases: [{ name: 'off', seconds: 1.5 }, { name: 'warn', seconds: 0.7 }, { name: 'on', seconds: 0.5 }], offset: 0, easyStretch: 1.4 };
  const s = newPredator(FROG, post());
  const ev = run(FROG, s, 2.6, (t) => prey({ x: 460, still: t > 1.7 }), { clock: HOP });
  assert.ok(Math.abs(firstT(ev, 'tell') - 1.5) < 2 * DT, 'the flash, on the warn');
  assert.equal(ev.filter((e) => e.act).length, 0);
  assert.equal(ev.filter((e) => e.beaten === 'still').length, 1);
  const m = newPredator(FROG, post());
  assert.equal(run(FROG, m, 2.6, () => prey({ x: 460 }), { clock: HOP }).filter((e) => e.act).length, 1, 'keep fidgeting beside it and it stings');
});

test('the food chain past World 1: a tayra whose line ends at the caiman is chased off; a night harpy under the owl likewise', () => {
  const tayra = newPredator(TAYRA, post({ x: 300, minX: 300, maxX: 900 }));
  const caiman = newPredator(CAIMAN, post({ x: 950, y: 300, minX: 920, maxX: 1400, facing: 1 }));
  const all = [{ def: TAYRA, s: tayra }, { def: CAIMAN, s: caiman }];
  let ran = NaN;
  for (let i = 0, t = 0; i < 8 / DT && Number.isNaN(ran); i++, t += DT) {
    // he stirs the water, then holds still on the far bank: the ripple is out looking as the tayra charges down its line at the water
    const p = prey({ x: 1000, y: 300 });
    run(TAYRA, tayra, DT, () => ({ ...p, x: 560 }), { t0: t });
    run(CAIMAN, caiman, DT, () => (t < 1.6 ? prey({ x: -999 }) : { ...p, still: true }), { t0: t });
    if (tayra.x >= 880 && foodChain(all, t)) ran = t;
  }
  assert.ok(Number.isFinite(ran), 'it ran when its line brought it to the water');
  assert.deepEqual([tayra.leaving, tayra.facing, tayra.beatenBy], [true, -1, 'lure']);
  assert.ok(HARPY.fears?.includes('owl') && HARPY.beatenBy.light && JAGUAR.beatenBy.trap && OCELOT.hears && RIVER_GUARD.blocks);
});
