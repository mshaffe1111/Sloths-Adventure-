// The predator kit's shared rules (reference/design/PREDATORS.md §0, §5): the tell always comes first, being beaten is data and
// never cruel, stillness and noise work on every kind the same way, and Easy is never harder.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { drumNoise, landingNoise, LOUD, sound, thrownNoise } from './heroNoise.ts';
import { NOISE } from './noise.ts';
import {
  TELL_MIN, GONE_AFTER, beat, blocks, checkPredator, coolOf, foodChain, hear, hurt, newPredator, postsFor, sees, speedOf, tellOf, touches,
} from './predators/core.ts';
import { DT, base, firstT, post, prey, run } from './predators/fixtures.ts';
import type { PredatorDef, Way } from './predators/types.ts';

// ───────────────────────────── the tell gate ─────────────────────────────

test('a kind is refused unless it is fair: a real tell, two ways or more and never only the stomp, Easy never harder', () => {
  assert.deepEqual(checkPredator(base()), []);
  const bad = (over: Partial<PredatorDef>, word: string) => {
    const said = checkPredator(base(over));
    assert.ok(said.some((l) => l.includes(word)), `expected "${word}" in ${JSON.stringify(said)}`);
  };
  bad({ tell: TELL_MIN - 0.01 }, 'tell');
  bad({ beatenBy: { stomp: { ends: 'flees', seconds: 3 } }, first: 'stomp' }, 'two ways');
  bad({ beatenBy: { stomp: { ends: 'flees', seconds: 3 } }, first: 'stomp' }, 'only the stomp');
  bad({ first: 'drum' }, 'first');
  bad({ beatenBy: { punch: { ends: 'stunned', seconds: 0 }, trap: { ends: 'chasedOff' } } }, 'seconds');
  bad({ easy: { tell: 0.9, cool: 1, speed: 1 } }, 'Easy');
  bad({ easy: { tell: 1, cool: 0.9, speed: 1 } }, 'Easy');
  bad({ easy: { tell: 1, cool: 1, speed: 1.1 } }, 'Easy');
  bad({ act: { aim: 'ahead', seconds: 0, speed: 0, reach: 60, tall: 30 } }, 'act');
  bad({ habit: 'guard', beatenBy: { punch: { ends: 'stunned', seconds: 2 }, break: { ends: 'chasedOff' } }, first: 'break' }, 'guard');
  bad({ habit: 'sweep' }, 'warn');
  bad({ fears: ['eagle'] }, 'lure');
  // the noise lure is a way too: a kind that goes to look at a noise needs only one more
  assert.deepEqual(checkPredator(base({ hears: 4.5, beatenBy: { still: { ends: 'flees', seconds: 8 } }, first: 'still' })), []);
  bad({ beatenBy: { still: { ends: 'flees', seconds: 8 } }, first: 'still' }, 'two ways');
  bad({ hears: 4.5, beatenBy: { stomp: { ends: 'flees', seconds: 3 } }, first: 'stomp' }, 'only the stomp');
  assert.equal(TELL_MIN, 0.5, "R-159.1's 0.5 s warning");
});

test('Easy: the tell and the beat are never shorter and nothing is faster, whatever the data says', () => {
  const d = base();
  assert.ok(tellOf(d, true) > tellOf(d, false));
  assert.ok(coolOf(d, true) > coolOf(d, false));
  assert.ok(speedOf(d, true) < speedOf(d, false));
  const wrong = base({ easy: { tell: 0.5, cool: 0.5, speed: 2 } });
  assert.equal(tellOf(wrong, true), tellOf(wrong, false));
  assert.equal(coolOf(wrong, true), coolOf(wrong, false));
  assert.equal(speedOf(wrong, true), 1);
});

test('Easy has fewer: posts marked normalOnly are left out', () => {
  const posts = [post(), post({ x: 900, normalOnly: true }), post({ x: 1300 })];
  assert.equal(postsFor(posts, false).length, 3);
  assert.deepEqual(postsFor(posts, true).map((p) => p.x), [500, 1300]);
});

test('the tell runs its full length before the first frame that can hurt, and longer on Easy', () => {
  for (const easy of [false, true]) {
    const def = base();
    const s = newPredator(def, post({ facing: -1 }));
    const ev = run(def, s, 4, () => prey({ x: 430 }), { easy });
    const tell = firstT(ev, 'tell');
    const act = firstT(ev, 'act');
    assert.ok(Number.isFinite(tell) && Number.isFinite(act), 'it told, then acted');
    assert.ok(act - tell >= tellOf(def, easy) - DT - 1e-9, `the act came ${act - tell} s after the tell began`);
    assert.ok(act - tell < tellOf(def, easy) + 2 * DT);
  }
});

test('fuzz: whatever he does and whatever the habit, nothing hurts without a full tell right before it (the gate is checked on every step)', () => {
  let seed = 12345;
  const roll = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  const habits: Array<Partial<PredatorDef>> = [
    {},
    { habit: 'ambush', speed: { rest: 0, hunt: 0 }, sight: { ahead: 220, behind: 220, tall: 80 }, engage: 150 },
    { habit: 'stalk', watched: 0.3, callsOff: true },
    { habit: 'charge', engage: 260, sight: { ahead: 300, behind: 120, tall: 80 }, act: { aim: 'ahead', seconds: 1, speed: 240, reach: 40, tall: 30 } },
    { habit: 'sweep', warn: 1, speed: { rest: 160, hunt: 0 }, sight: { ahead: 70, behind: 70, tall: 400 }, engage: 70, tell: 0.75, callsOff: true, act: { aim: 'him', seconds: 1, speed: 400, reach: 50, tall: 50 } },
    { habit: 'drop', speed: { rest: 60, hunt: 0 }, sight: { ahead: 60, behind: 60, tall: 300 }, engage: 60, act: { aim: 'below', seconds: 1, speed: 500, reach: 60, tall: 40 } },
    { habit: 'guard', speed: { rest: 0, hunt: 0 }, blocks: true, beatenBy: { break: { ends: 'chasedOff' }, push: { ends: 'stunned', seconds: 6 } }, first: 'break' },
    { habit: 'seek', hears: 3 },
    { shy: 30 },
  ];
  let acts = 0;
  for (const over of habits) {
    const def = base(over);
    assert.deepEqual(checkPredator(def), [], JSON.stringify(over));
    for (let n = 0; n < 12; n++) {
      const s = newPredator(def, post({ y: def.habit === 'drop' || def.habit === 'sweep' ? 80 : 300, asleep: n % 6 === 5 }));
      const hero = prey({ x: 300 + roll() * 400 });
      let vx = 0;
      const ev = run(def, s, 30, (t) => {
        if (roll() < 0.05) vx = (roll() - 0.5) * 500;
        if (roll() < 0.02) vx = 0;
        hero.x = Math.max(250, Math.min(750, hero.x + vx * DT));
        hero.still = vx === 0;
        hero.covered = hero.still && roll() < 0.5;
        if (vx) hero.facing = vx > 0 ? 1 : -1;
        if (roll() < 0.004) hear(def, s, drumNoise(hero.x, hero.y, t));
        if (roll() < 0.004) hear(def, s, landingNoise(hero.x, hero.y, t, 400)!);
        if (roll() < 0.003) beat(def, s, 'punch', t, hero.x);
        return hero;
      }, { easy: n % 2 === 1 });
      acts += ev.filter((e) => e.act).length;
    }
  }
  assert.ok(acts > 60, `the fuzz must really reach the act (it did ${acts} times)`);
});

// ───────────────────────────── being beaten ─────────────────────────────

test('each way that works ends as its data says: stunned for the seconds, home for the seconds, or off the stage for good', () => {
  const def = base();
  const s = newPredator(def, post());
  assert.equal(beat(def, s, 'punch', 10), true);
  assert.equal(s.phase, 'stunned');
  assert.equal(s.beatenBy, 'punch');
  run(def, s, 1.9, () => prey({ x: 480 }), { t0: 10 });
  assert.equal(s.phase, 'stunned', 'still dazed, with him right beside it');
  run(def, s, 0.2, () => prey({ x: 480 }), { t0: 11.9 });
  assert.notEqual(s.phase, 'stunned');
  assert.ok(s.cool > 0, 'and it may not tell the moment it comes round');

  const f = newPredator(def, post({ x: 650 }));
  assert.equal(beat(def, f, 'stomp', 0), true);
  run(def, f, 4.9, () => prey({ x: 640 }));
  assert.equal(f.phase, 'flee');
  assert.ok(Math.abs(f.x - f.homeX) < 2, 'it went home');
  run(def, f, 0.3, () => prey({ x: -999 }), { t0: 4.9 });
  assert.equal(f.phase, 'rest', 'and comes back when the seconds are up');

  const g = newPredator(def, post());
  assert.equal(beat(def, g, 'trap', 0, 400), true);
  assert.equal(g.facing, 1, 'it runs away from what beat it');
  run(def, g, GONE_AFTER + 0.1, () => prey({ x: 480 }));
  assert.equal(g.phase, 'gone');
  const ev = run(def, g, 20, () => prey({ x: g.x }));
  assert.deepEqual([ev.length, g.phase], [0, 'gone'], 'chased off is for the rest of the stage');
  assert.equal(beat(def, g, 'punch', 30), false, 'and it cannot be beaten again');
});

test('dozes off: it falls asleep where it stands, mid-hunt or not, and a noise can wake it again', () => {
  const def = base({ beatenBy: { light: { ends: 'dozes' }, punch: { ends: 'stunned', seconds: 2 } } });
  const s = newPredator(def, post({ facing: -1 }));
  run(def, s, 0.3, () => prey({ x: 430 }));
  assert.equal(s.phase, 'tell');
  assert.equal(beat(def, s, 'light', 0.3), true);
  const ev = run(def, s, 5, () => prey({ x: 480 }), { t0: 0.3 });
  assert.deepEqual([s.asleep, s.phase, ev.length], [true, 'rest', 0], 'the tell it was in is gone with it');
  assert.equal(hear(def, s, landingNoise(480, 300, 6, 400)!), 'woke');
});

test('a way that is not on its list does nothing at all', () => {
  const def = base();
  const s = newPredator(def, post());
  const was = JSON.stringify(s);
  for (const w of ['kick', 'drum', 'light', 'wind', 'geyser', 'break', 'push', 'lure', 'still'] as Way[]) assert.equal(beat(def, s, w, 1), false, w);
  assert.equal(JSON.stringify(s), was);
});

test("an 'open' way only works while it is recovering, stunned or asleep", () => {
  const def = base({ beatenBy: { punch: { ends: 'stunned', seconds: 2, when: 'open' }, trap: { ends: 'chasedOff' } } });
  const s = newPredator(def, post({ facing: -1 }));
  assert.equal(beat(def, s, 'punch', 0), false, 'not while it is up and watching');
  run(def, s, 4, () => prey({ x: 430 }));
  // find the recover
  const r = newPredator(def, post({ facing: -1 }));
  let hit = false;
  run(def, r, 4, (t) => {
    if (r.phase === 'tell') assert.equal(beat(def, r, 'punch', t), false, 'not during the tell');
    if (r.phase === 'recover' && !hit) hit = beat(def, r, 'punch', t);
    return prey({ x: 430 });
  });
  assert.equal(hit, true, 'after the miss, its head is out');
  const z = newPredator(def, post({ asleep: true }));
  assert.equal(beat(def, z, 'punch', 0), true, 'the sleeping first one is a free punch');
});

test('no outcome ever hurts: stunned, fleeing and gone have no hurt box and block nothing', () => {
  const def = base({ habit: 'guard', blocks: true, speed: { rest: 0, hunt: 0 }, beatenBy: { break: { ends: 'chasedOff' }, push: { ends: 'stunned', seconds: 6 }, wind: { ends: 'flees', seconds: 3 } }, first: 'break' });
  for (const w of ['break', 'push', 'wind'] as Way[]) {
    const s = newPredator(def, post());
    assert.equal(blocks(def, s), true);
    beat(def, s, w, 0);
    assert.equal(hurt(def, s), null);
    assert.equal(blocks(def, s), false, `${w}: the way is open while it is beaten`);
  }
});

// ───────────────────────────── stillness ─────────────────────────────

test('sight is stillness.ts: movement in sight is seen, a still sloth is lost, a seesStill kind sees him in the open but not in cover', () => {
  const def = base();
  const s = newPredator(def, post({ facing: -1 }));
  assert.equal(sees(def, s, prey({ x: 350 })), true);
  assert.equal(sees(def, s, prey({ x: 350, still: true })), false);
  assert.equal(sees(def, s, prey({ x: 350, covered: true })), true, 'moving in a bush shakes the leaves');
  assert.equal(sees(def, s, prey({ x: 250 })), false, 'too far ahead');
  assert.equal(sees(def, s, prey({ x: 600 })), false, 'further behind than it can sense');
  assert.equal(sees(def, s, prey({ x: 570 })), true, 'close behind');
  assert.equal(sees(def, s, prey({ x: 350, y: 100 })), false, 'on another level');
  const keen = base({ sight: { ahead: 200, behind: 80, tall: 80, seesStill: true } });
  assert.equal(sees(keen, s, prey({ x: 350, still: true })), true);
  assert.equal(sees(keen, s, prey({ x: 350, still: true, covered: true })), false);
});

test('a kind that remembers: stillness in the open hides him only until it has seen him once', () => {
  const def = base({ sight: { ahead: 200, behind: 80, tall: 80, remembers: true } });
  const s = newPredator(def, post({ facing: -1 }));
  assert.equal(sees(def, s, prey({ x: 350, still: true })), false);
  run(def, s, 0.2, () => prey({ x: 350 }));
  assert.equal(s.knows, true);
  assert.equal(sees(def, s, prey({ x: 350, still: true })), true, 'it remembers');
  assert.equal(sees(def, s, prey({ x: 350, still: true, covered: true })), false, 'only cover hides him now');
});

test('going still beats a hunter that has it on its list: it loses him, gives up and goes home; running off is not the same thing', () => {
  const def = base({ habit: 'stalk', beatenBy: { still: { ends: 'flees', seconds: 5 }, punch: { ends: 'stunned', seconds: 1.5 } }, first: 'still' });
  const s = newPredator(def, post({ facing: -1 }));
  run(def, s, 0.4, () => prey({ x: 320 }));
  assert.equal(s.phase, 'hunt');
  const ev = run(def, s, def.giveUp + 0.3, () => prey({ x: 320, still: true }), { t0: 0.4 });
  assert.equal(firstT(ev, 'tell'), NaN, 'it never told: it could not see him');
  assert.equal(ev.filter((e) => e.beaten === 'still').length, 1);
  assert.equal(s.phase, 'flee');
  // he runs out of sight instead: it stands down, but that is not a win
  const r = newPredator(def, post({ facing: -1 }));
  run(def, r, 0.4, () => prey({ x: 320 }));
  const ev2 = run(def, r, def.giveUp + 0.3, () => prey({ x: -500 }), { t0: 0.4 });
  assert.equal(ev2.filter((e) => e.beaten).length, 0);
  assert.equal(ev2.filter((e) => e.lostHim).length, 1);
  assert.equal(r.phase, 'rest');
});

test('a tell he can call off: unseen when it ends, it does not act', () => {
  const def = base({ callsOff: true });
  const s = newPredator(def, post({ facing: -1 }));
  const ev = run(def, s, 1.5, (t) => prey({ x: 430, still: t > 0.3 }));
  assert.ok(Number.isFinite(firstT(ev, 'tell')));
  assert.equal(firstT(ev, 'act'), NaN);
  assert.ok(Number.isFinite(firstT(ev, 'lostHim')));
  // without callsOff the same sloth is struck at: the strike was aimed when the tell began
  const hard = base();
  const h = newPredator(hard, post({ facing: -1 }));
  assert.ok(Number.isFinite(firstT(run(hard, h, 1.5, (t) => prey({ x: 430, still: t > 0.3 })), 'act')));
});

// ───────────────────────────── noise ─────────────────────────────

test('a predator is a heroNoise Listener: a noise wakes a sleeper (drowsy first), the drum stuns the awake', () => {
  const def = base();
  const z = newPredator(def, post({ asleep: true }));
  run(def, z, 3, () => prey({ x: 480 }));
  assert.deepEqual([z.asleep, z.phase, z.x], [true, 'rest', 500], 'asleep, it does nothing with him right beside it');
  assert.deepEqual(sound([z], landingNoise(480, 300, 3, 400)!), { woke: 1, stunned: 0 }, 'heroNoise wakes it directly');
  const ev = run(def, z, 3, () => prey({ x: 480 }), { t0: 3 });
  assert.ok(firstT(ev, 'tell') - 3 >= 1, 'a drowsy second before it can even tell');
  const a = newPredator(def, post());
  assert.equal(hear(def, a, drumNoise(480, 300, 10)), 'stunned');
  run(def, a, LOUD.drum.stun - 0.1, () => prey({ x: 480 }), { t0: 10 });
  assert.equal(a.phase, 'stunned');
  const s = newPredator(def, post({ asleep: true }));
  assert.equal(hear(def, s, drumNoise(480, 300, 10)), 'woke', 'the drum wakes a sleeper; it does not stun it');
  assert.equal(hear(def, newPredator(def, post()), landingNoise(4000, 300, 0, 400)!), null, 'too far to hear');
});

test('a sleeper with wakeAt wakes when he MOVES close; a still sloth never wakes anything', () => {
  const def = base({ wakeAt: 95 });
  const z = newPredator(def, post({ asleep: true }));
  run(def, z, 2, () => prey({ x: 450, still: true }));
  assert.equal(z.asleep, true);
  run(def, z, 2, () => prey({ x: 300 }));
  assert.equal(z.asleep, true, 'moving, but not close');
  run(def, z, 0.1, () => prey({ x: 450 }));
  assert.equal(z.asleep, false);
});

test('the noise lure is a THROWN noise: a kind that hears goes to it and looks there, noticing nobody, then goes back to its habit', () => {
  const def = base({ habit: 'seek', hears: 3 });
  const s = newPredator(def, post());
  assert.equal(hear(def, s, thrownNoise(640, 300, 0)), 'drawn');
  const ev = run(def, s, 2.3, () => prey({ x: 520 }));
  assert.ok(Math.abs(s.x - 640) < 8, `it walked to the noise (${s.x})`);
  assert.equal(ev.filter((e) => e.tell || e.act).length, 0, 'he walked right behind it');
  run(def, s, 3.2, () => prey({ x: -999 }), { t0: 2.3 });
  assert.equal(s.drawn, false);
  assert.equal(s.phase, 'rest');
  // a noise past the end of its ground: it goes to the end and looks from there
  const e = newPredator(def, post());
  assert.equal(hear(def, e, thrownNoise(800, 300, 0)), 'drawn');
  run(def, e, 4, () => prey({ x: -999 }));
  assert.ok(e.x > 690 && e.x <= 700, `it stopped at the end of its ground (${e.x})`);
  // "noticing nobody" holds for a kind that remembers too: while it looks at the noise it does not learn him
  const keen = base({ habit: 'seek', hears: 3, sight: { ahead: 200, behind: 80, tall: 80, remembers: true } });
  const k = newPredator(keen, post());
  hear(keen, k, thrownNoise(640, 300, 0));
  run(keen, k, 2, () => prey({ x: 560 }));
  assert.equal(k.knows, false);
  // a kind without `hears` stays where it is
  const deaf = base();
  const d = newPredator(deaf, post());
  assert.equal(hear(deaf, d, thrownNoise(640, 300, 0)), null);
});

test('his own noise is no lure: a hunter that goes to noises comes looking for HIM, eyes open (so a hard landing never blinds anything)', () => {
  assert.equal(thrownNoise(0, 0, 0).r, NOISE.hear, 'a thrown thing carries as the puzzle kit\'s does');
  const def = base({ habit: 'seek', hears: 3 });
  const s = newPredator(def, post());
  assert.equal(hear(def, s, landingNoise(640, 300, 0, 400)!), 'alert');
  assert.deepEqual([s.phase, s.drawn], ['hunt', false]);
  // he landed at 640 and stays there: it walks over, sees him, and tells
  const ev = run(def, s, 3, () => prey({ x: 640 }));
  assert.ok(Number.isFinite(firstT(ev, 'tell')), 'it found him');
  // he landed and slipped away: it looks where the noise was, then stands down
  const g = newPredator(def, post());
  hear(def, g, landingNoise(640, 300, 0, 400)!);
  const ev2 = run(def, g, def.giveUp + 0.5, () => prey({ x: -999 }));
  assert.ok(g.x > 540, `it went to look (${g.x})`);
  assert.equal(ev2.filter((e) => e.lostHim).length, 1);
  // something that never leaves its post just stays (it is not blinded either)
  const guard = base({ habit: 'guard', hears: 3, speed: { rest: 0, hunt: 0 }, beatenBy: { break: { ends: 'chasedOff' }, push: { ends: 'stunned', seconds: 6 } }, first: 'break' });
  const p = newPredator(guard, post());
  assert.equal(hear(guard, p, landingNoise(560, 300, 0, 400)!), null);
  assert.ok(Number.isFinite(firstT(run(guard, p, 2, () => prey({ x: 440 })), 'tell')));
});

// ───────────────────────────── the food chain ─────────────────────────────

test('the food chain: a kind is chased off by what it fears when that is awake and near; nobody is caught', () => {
  const small = base({ kind: 'boa', fears: ['eagle'], beatenBy: { lure: { ends: 'chasedOff' }, trap: { ends: 'chasedOff' } }, first: 'trap' });
  const big = base({ kind: 'eagle' });
  const a = newPredator(small, post({ x: 500 }));
  const far = newPredator(big, post({ x: 1500, minX: 1300, maxX: 1700 }));
  assert.equal(foodChain([{ def: small, s: a }, { def: big, s: far }], 0), 0);
  const near = newPredator(big, post({ x: 560 }));
  near.asleep = true;
  assert.equal(foodChain([{ def: small, s: a }, { def: big, s: near }], 0), 0, 'a sleeping hunter scares nobody');
  near.asleep = false;
  assert.equal(foodChain([{ def: small, s: a }, { def: big, s: near }], 0), 1);
  assert.deepEqual([a.phase, a.leaving, a.beatenBy, a.facing], ['flee', true, 'lure', -1], 'it runs the other way');
  assert.equal(near.phase, 'rest', 'the big one does nothing to it');
  assert.equal(foodChain([{ def: small, s: a }, { def: big, s: near }], 1), 0, 'once');
});

test('touches: the hurt box against his body', () => {
  assert.equal(touches({ x: 100, y: 260, w: 60, h: 40 }, prey({ x: 150 })), true);
  assert.equal(touches({ x: 100, y: 260, w: 60, h: 40 }, prey({ x: 190 })), false);
  assert.equal(touches({ x: 100, y: 100, w: 60, h: 40 }, prey({ x: 150 })), false, 'over his head');
  assert.equal(touches(null, prey()), false);
});
