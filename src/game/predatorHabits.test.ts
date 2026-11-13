// The eight habits (reference/design/PREDATORS.md §5), each read from data by the one machine in core.ts. Every run here goes
// through predators/fixtures.ts's `run`, so the tell gate is asserted on every step of every habit.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { landingNoise, thrownNoise } from './heroNoise.ts';
import type { ClockDef } from './stageKit.types.ts';
import { beat, blocks, checkOnClock, checkPredator, hear, hurt, newPredator, tellOf, touches } from './predators/core.ts';
import { DT, base, firstT, post, prey, run } from './predators/fixtures.ts';
import type { PredatorDef } from './predators/types.ts';

const FAR = () => prey({ x: -5000 });
const fair = (d: PredatorDef): PredatorDef => {
  assert.deepEqual(checkPredator(d), []);
  return d;
};

// ───────────────────────────── patrol ─────────────────────────────

test('patrol: it walks its beat end to end and turns at both; Easy walks no faster', () => {
  const def = fair(base());
  const s = newPredator(def, post());
  let lo = s.x;
  let hi = s.x;
  run(def, s, 40, () => {
    lo = Math.min(lo, s.x);
    hi = Math.max(hi, s.x);
    return FAR();
  });
  assert.deepEqual([lo, hi], [300, 700], 'both ends reached, never passed');
  const n = newPredator(def, post());
  const e = newPredator(def, post());
  run(def, n, 3, FAR);
  run(def, e, 3, FAR, { easy: true });
  assert.ok(e.x - 500 < n.x - 500 && e.x > 500, `Easy ${e.x} vs Normal ${n.x}`);
});

test('patrol, shy (the tree snake): it gives ground while he comes, and strikes only when crowded or out of branch', () => {
  const def = fair(base({ shy: 30, engage: 105, sight: { ahead: 200, behind: 90, tall: 80 } }));
  const s = newPredator(def, post({ x: 600, facing: -1 }));
  // he walks in from the left at 60 px/s and stops 150 px short of it: it backs away the whole time and never tells
  const ev = run(def, s, 3, (t) => prey({ x: Math.min(420 + 60 * t, 480) }));
  assert.ok(s.x > 620, `it backed off (${s.x})`);
  assert.equal(firstT(ev, 'tell'), NaN);
  // he keeps coming: it runs out of branch at 700, and when he is within reach and a half of its corner it rears
  const ev2 = run(def, s, 8, (t) => prey({ x: Math.min(480 + 40 * t, 650) }), { t0: 3 });
  assert.ok(Number.isFinite(firstT(ev2, 'tell')), 'cornered, it tells');
  assert.ok(Number.isFinite(firstT(ev2, 'act')), 'then strikes');
  assert.ok(s.x >= 690, 'from the end of its branch');
});

// ───────────────────────────── ambush ─────────────────────────────

const boaLike = (): PredatorDef => fair(base({
  habit: 'ambush', speed: { rest: 0, hunt: 0 }, sight: { ahead: 280, behind: 280, tall: 80 }, engage: 150, tell: 0.6,
  act: { aim: 'ahead', seconds: 0.2, speed: 0, reach: 128, tall: 30 }, recover: 0.8,
}));

test('ambush: it never leaves its post, strikes to either side with a long reach, and is open for a long time after', () => {
  const def = boaLike();
  for (const side of [-1, 1] as const) {
    const s = newPredator(def, post({ facing: 1 }));
    let struck = false;
    let openFor = 0;
    const ev = run(def, s, 3, () => {
      if (s.phase === 'act') struck = struck || touches(hurt(def, s), prey({ x: 500 + side * 120 }));
      if (s.phase === 'recover') openFor += DT;
      assert.equal(s.x, 500, 'at its post');
      return prey({ x: 500 + side * 120 });
    });
    assert.equal(s.facing, side, 'it turned to him when the tell began');
    assert.ok(Number.isFinite(firstT(ev, 'act')));
    assert.equal(struck, true, `120 px ${side > 0 ? 'ahead' : 'behind'} is inside its reach`);
    assert.ok(openFor >= def.recover - DT, `open ${openFor} s`);
  }
  // out of its engage, it only watches
  const w = newPredator(def, post());
  assert.equal(run(def, w, 3, () => prey({ x: 300 })).filter((e) => e.tell).length, 0);
  assert.equal(w.phase, 'rest');
});

test('ambush: its strike is at where its reach is, so standing past the reach is safe through the whole act', () => {
  const def = boaLike();
  const s = newPredator(def, post());
  let hit = false;
  run(def, s, 3, () => {
    // he steps in to draw the strike, then stands just past its reach
    const p = prey({ x: s.phase === 'rest' && s.cool <= 0 ? 640 : 500 + 128 + 20 });
    hit = hit || touches(hurt(def, s), p);
    return p;
  });
  assert.equal(hit, false);
});

// ───────────────────────────── stalk ─────────────────────────────

test('stalk: it closes while his back is turned, crawls while he faces it, and freezes if its `watched` is 0', () => {
  const closed = (watched: number | undefined, heroFacing: 1 | -1): number => {
    const def = fair(base({ habit: 'stalk', watched, speed: { rest: 0, hunt: 95 }, sight: { ahead: 400, behind: 150, tall: 80 }, engage: 100 }));
    const s = newPredator(def, post({ x: 700, minX: 100, maxX: 700, facing: -1 }));
    // he walks away from it to the left, in step, so it never gets within its engage
    run(def, s, 2, (t) => prey({ x: 400 - 20 * t, facing: heroFacing }));
    return 700 - s.x;
  };
  const turned = closed(0.3, -1);
  const facing = closed(0.3, 1);
  assert.ok(turned > 150, `back turned: it came ${turned} px`);
  assert.ok(Math.abs(facing / turned - 0.3) < 0.05, `watched: ${facing} px is 0.3 of ${turned}`);
  assert.ok(closed(0, 1) < 1, 'watched 0: looked at, it does not move');
  assert.equal(closed(undefined, 1), closed(undefined, -1), 'a kind without `watched` does not care which way he looks');
});

test('stalk: it stops short of where it last saw him and never tells at a sloth it cannot see', () => {
  const def = fair(base({ habit: 'stalk', speed: { rest: 0, hunt: 95 }, sight: { ahead: 400, behind: 150, tall: 80 }, engage: 100, giveUp: 6 }));
  const s = newPredator(def, post({ x: 700, minX: 100, maxX: 700, facing: -1 }));
  run(def, s, 0.5, () => prey({ x: 350 }));
  const ev = run(def, s, 5, () => prey({ x: 350, still: true }), { t0: 0.5 });
  assert.ok(s.x - 350 >= 100 * 0.8 - 95 * DT - 1e-6 && s.x - 350 <= 100 * 0.8, `it stopped ${s.x - 350} px short (0.8 of its engage, to a step)`);
  assert.equal(ev.filter((e) => e.tell).length, 0);
});

// ───────────────────────────── charge ─────────────────────────────

const tayraLike = (): PredatorDef => fair(base({
  habit: 'charge', speed: { rest: 0, hunt: 0 }, sight: { ahead: 340, behind: 240, tall: 80 }, engage: 300,
  act: { aim: 'ahead', seconds: 5, speed: 235, reach: 40, tall: 30 }, recover: 0.6,
  beatenBy: { stomp: { ends: 'stunned', seconds: 2 }, geyser: { ends: 'chasedOff' }, lure: { ends: 'chasedOff' } }, first: 'lure', fears: ['caiman'],
}));

test('charge: it tells from far off, then runs its line to the end of its ground whatever he does, and is winded there', () => {
  const def = tayraLike();
  const s = newPredator(def, post({ x: 300, minX: 300, maxX: 900 }));
  // he is ahead of it when it stands up, then jumps clear and goes back the other way behind it
  let turned = false;
  const ev = run(def, s, 6, (t) => {
    if (s.phase === 'act' && s.facing !== 1) turned = true;
    return prey({ x: t < 1 ? 550 : 320, y: t < 1 ? 300 : 150 });
  });
  const act = firstT(ev, 'act');
  assert.ok(act - firstT(ev, 'tell') >= tellOf(def, false) - DT - 1e-9);
  assert.equal(s.x, 900, 'the end of its line');
  assert.equal(turned, false, 'it cannot turn once it is running');
  // winded at the end: open to anything for its recover
  const w = newPredator(def, post({ x: 300, minX: 300, maxX: 900 }));
  let openAtEnd = 0;
  run(def, w, 4, () => {
    if (w.phase === 'recover' && w.x === 900) openAtEnd += DT;
    return prey({ x: 550 });
  });
  assert.ok(openAtEnd >= def.recover - 2 * DT, `open at the end for ${openAtEnd} s`);
});

test('charge: you choose where its line ends: a geyser there chases it off (the stage calls beat when it arrives)', () => {
  const def = tayraLike();
  const s = newPredator(def, post({ x: 300, minX: 300, maxX: 900 }));
  let off = false;
  run(def, s, 6, (t) => {
    if (s.phase === 'recover' && s.x === 900 && !off) off = beat(def, s, 'geyser', t, 900);
    return prey({ x: 550 });
  });
  assert.equal(off, true);
  assert.equal(s.phase, 'gone');
});

// ───────────────────────────── sweep ─────────────────────────────

const eagleLike = (over: Partial<PredatorDef> = {}): PredatorDef => fair(base({
  kind: 'eagle', habit: 'sweep', warn: 2, speed: { rest: 300, hunt: 0 }, sight: { ahead: 70, behind: 70, tall: 600, seesStill: true },
  engage: 70, tell: 0.75, callsOff: true, act: { aim: 'him', seconds: 3, speed: 600, reach: 60, tall: 60 }, recover: 0.6, cool: 3, giveUp: 2,
  hears: 4.5, beatenBy: { still: { ends: 'flees', seconds: 8 }, wind: { ends: 'flees', seconds: 4 } }, first: 'still', ...over,
}));
const sky = () => post({ x: 600, y: 40, minX: 200, maxX: 1000 });

test('sweep: no pass while he is outside its stretch; inside, the eye shows at the edge for the warn (longer on Easy) before it moves', () => {
  const def = eagleLike();
  const s = newPredator(def, sky());
  assert.equal(run(def, s, 6, () => prey({ x: 100 })).length, 0, 'he is not in its stretch');
  assert.equal(s.eyeX, 200);
  for (const easy of [false, true]) {
    const e = newPredator(def, sky());
    let moved = NaN;
    const ev = run(def, e, 5, (t) => {
      if (Number.isNaN(moved) && e.eyeX !== 200) moved = t;
      return prey({ x: 900, still: true, covered: true });
    }, { easy });
    const warn = 2 * (easy ? def.easy.tell : 1);
    assert.equal(firstT(ev, 'notice'), 0, 'the pass is called at once (the screech)');
    assert.ok(moved >= warn - DT && moved < warn + 3 * DT, `the eye left the edge at ${moved} s (warn ${warn})`);
  }
});

test('sweep: its eye takes what it sees: a moving sloth under it is dived at; the dive follows him, and lands', () => {
  const def = eagleLike();
  const s = newPredator(def, sky());
  let hit = false;
  const ev = run(def, s, 8, (t) => {
    const p = prey({ x: 500 + 40 * t });
    hit = hit || touches(hurt(def, s), p);
    return p;
  });
  const tell = firstT(ev, 'tell');
  assert.ok(tell > 2, 'after the warn, when the eye reached him');
  assert.ok(firstT(ev, 'act') - tell >= 0.75 - DT - 1e-9);
  assert.equal(hit, true, 'walking on does not lose a dive');
});

test('sweep: in cover and still, he is not seen: the pass goes over; two empty passes and it gives up (stillness beats it)', () => {
  const def = eagleLike();
  const s = newPredator(def, sky());
  const hidden = () => prey({ x: 600, still: true, covered: true });
  const ev = run(def, s, 5.5, hidden);
  assert.equal(ev.filter((e) => e.tell || e.act).length, 0);
  assert.deepEqual([s.phase, s.lost, s.facing], ['rest', 1, -1], 'one empty pass; the next comes back the other way');
  const ev2 = run(def, s, 12, hidden, { t0: 5.5 });
  assert.equal(ev2.filter((e) => e.beaten === 'still').length, 1);
  assert.equal(s.phase, 'flee');
  // it sees a still sloth in the open (seesStill): only cover hides him from this one
  const o = newPredator(def, sky());
  assert.ok(Number.isFinite(firstT(run(def, o, 6, () => prey({ x: 600, still: true })), 'act')));
  // a kind that looks only for movement loses a still sloth in the open too
  const soft = eagleLike({ sight: { ahead: 70, behind: 70, tall: 600 } });
  const m = newPredator(soft, sky());
  assert.equal(firstT(run(soft, m, 6, () => prey({ x: 600, still: true })), 'tell'), NaN);
});

test('sweep: seen, he can still call the dive off by getting into cover and still before the tell ends; running does not', () => {
  const def = eagleLike();
  const s = newPredator(def, sky());
  let tellAt = NaN;
  const ev = run(def, s, 5, (t) => {
    if (s.phase === 'tell' && Number.isNaN(tellAt)) tellAt = t;
    const safe = !Number.isNaN(tellAt) && t > tellAt + 0.4;
    return prey({ x: 600, still: safe, covered: safe });
  });
  assert.ok(Number.isFinite(firstT(ev, 'tell')));
  assert.ok(Number.isFinite(firstT(ev, 'lostHim')));
  assert.equal(firstT(ev, 'act'), NaN);
  const r = newPredator(def, sky());
  assert.ok(Number.isFinite(firstT(run(def, r, 6, (t) => prey({ x: 600 + (r.phase === 'tell' ? 230 * t : 0) })), 'act')), 'running out from under the shadow is not hiding');
});

test('sweep: a thrown noise during the pass pulls its eye to the noise, where it sees nobody; his own landing does not', () => {
  const def = eagleLike();
  const s = newPredator(def, sky());
  let drew = false;
  const ev = run(def, s, 6, (t) => {
    if (!drew && s.phase === 'hunt' && s.eyeX > 200) drew = hear(def, s, thrownNoise(300, 300, t)) === 'drawn';
    return prey({ x: 700 });
  });
  assert.equal(drew, true);
  assert.equal(ev.filter((e) => e.tell).length, 0, 'he walked on under where the eye would have been');
  assert.ok(Math.abs(s.eyeX - 300) < 1, `the eye is at the noise (${s.eyeX})`);
  const own = newPredator(def, sky());
  let tried: string | null = 'never';
  const ev2 = run(def, own, 6, (t) => {
    if (tried === 'never' && own.phase === 'hunt' && own.eyeX > 200) tried = hear(def, own, landingNoise(300, 300, t, 400)!);
    return prey({ x: 700 });
  });
  assert.equal(tried, null);
  assert.ok(Number.isFinite(firstT(ev2, 'tell')), 'the pass carries on and finds him');
  // it listens where its eye is, not where it perches
  const f = newPredator(def, post({ x: 1500, y: 40, minX: 200, maxX: 1600 }));
  run(def, f, 2.2, () => prey({ x: 900, still: true, covered: true }));
  assert.equal(f.phase, 'hunt');
  assert.equal(hear(def, f, thrownNoise(1500, 300, 2.2)), null, 'right under its perch, 1,200 px from its eye');
  assert.equal(hear(def, f, thrownNoise(300, 300, 2.2)), 'drawn', 'beside its eye, 1,200 px from its perch');
});

// ───────────────────────────── drop ─────────────────────────────

const jaguarLike = (): PredatorDef => fair(base({
  habit: 'drop', speed: { rest: 80, hunt: 0 }, sight: { ahead: 50, behind: 50, tall: 320 }, engage: 50, tell: 0.65,
  act: { aim: 'below', seconds: 2, speed: 700, reach: 64, tall: 40 }, recover: 0.95, cool: 2.2,
  beatenBy: { trap: { ends: 'chasedOff' }, drum: { ends: 'stunned', seconds: 3 }, punch: { ends: 'stunned', seconds: 2, when: 'open' } }, first: 'trap',
}));
const shelf = () => post({ x: 500, y: 60, minX: 500, maxX: 500 });

test('drop: it comes straight down where he was when it growled, so walking on is the dodge; it lands at his level', () => {
  const def = jaguarLike();
  const s = newPredator(def, shelf());
  let hit = false;
  const ev = run(def, s, 1.4, (t) => {
    const p = prey({ x: 470 + 90 * t });
    hit = hit || touches(hurt(def, s), p);
    return p;
  });
  assert.ok(Number.isFinite(firstT(ev, 'act')));
  assert.deepEqual([s.x, s.y], [500, 300], 'straight down, onto the ground he stood on');
  assert.equal(hit, false, 'he walked on');
  // he stops under it: it lands on him
  const t2 = newPredator(def, shelf());
  let hit2 = false;
  run(def, t2, 1.4, (t) => {
    const p = prey({ x: Math.min(470 + 90 * t, 500) });
    hit2 = hit2 || touches(hurt(def, t2), p);
    return p;
  });
  assert.equal(hit2, true);
});

test('drop: on the ground it is open, then it has to climb all the way back before it can growl again', () => {
  const def = jaguarLike();
  const s = newPredator(def, shelf());
  const ev = run(def, s, 14, (t) => prey({ x: t < 0.3 ? 480 : 500 + (Math.floor(t * 2) % 2 ? 20 : -20) }));
  const tells = ev.filter((e) => e.tell).map((e) => e.t);
  assert.ok(tells.length >= 2, 'it drops again in time');
  const climb = (300 - 60) / 80;
  assert.ok(tells[1] - tells[0] >= def.tell + def.recover + climb, `the second growl came ${tells[1] - tells[0]} s after the first (climb ${climb} s)`);
  const p = newPredator(def, shelf());
  let punched = false;
  run(def, p, 3, (t) => {
    if (p.phase === 'recover' && !punched) punched = beat(def, p, 'punch', t);
    return prey({ x: 480 });
  });
  assert.equal(punched, true, 'winded on the ground: the open punch');
});

// ───────────────────────────── guard ─────────────────────────────

test('guard: it stands in the way, never leaves its spot, strikes only what comes within reach, and cannot be stomped or punched', () => {
  const def = fair(base({
    habit: 'guard', blocks: true, speed: { rest: 0, hunt: 0 }, sight: { ahead: 200, behind: 200, tall: 80 }, engage: 78, tell: 0.7,
    act: { aim: 'ahead', seconds: 0.2, speed: 0, reach: 78, tall: 40 },
    beatenBy: { break: { ends: 'chasedOff' }, push: { ends: 'stunned', seconds: 6 } }, first: 'break', hears: 4.5,
  }));
  const s = newPredator(def, post());
  const ev = run(def, s, 5, () => prey({ x: 380 }));
  assert.deepEqual([ev.length, s.x, blocks(def, s)], [0, 500, true], 'he stands 120 px off: it only stands there');
  assert.equal(beat(def, s, 'stomp', 5), false);
  assert.equal(beat(def, s, 'punch', 5), false);
  assert.ok(Number.isFinite(firstT(run(def, s, 2, () => prey({ x: 440 }), { t0: 5 }), 'act')), 'within reach, it strikes');
  assert.equal(beat(def, s, 'push', 8), true);
  assert.equal(blocks(def, s), false, 'the way is open while it is down');
  run(def, s, 6.2, FAR, { t0: 8 });
  assert.equal(blocks(def, s), true, 'and shut again when it gets up');
  assert.equal(beat(def, s, 'break', 15, 560), true);
  run(def, s, 2, FAR, { t0: 15 });
  assert.deepEqual([s.phase, blocks(def, s)], ['gone', false]);
});

// ───────────────────────────── seek ─────────────────────────────

test('seek: asleep until a noise; the first noise only wakes it, the next one it goes to look at', () => {
  const def = fair(base({ habit: 'seek', hears: 3, speed: { rest: 0, hunt: 85 } }));
  const s = newPredator(def, post({ asleep: true }));
  run(def, s, 5, () => prey({ x: 520, still: true }));
  assert.equal(s.asleep, true, 'a still sloth right beside it');
  assert.equal(hear(def, s, landingNoise(650, 300, 5, 400)!), 'woke');
  run(def, s, 1, FAR, { t0: 5 });
  assert.equal(s.x, 500, 'woken, it has not gone anywhere');
  assert.equal(hear(def, s, thrownNoise(650, 300, 6)), 'drawn');
  run(def, s, 2.5, FAR, { t0: 6 });
  assert.ok(Math.abs(s.x - 650) <= 6);
});

// ───────────────────────────── on the clock ─────────────────────────────

const HOP: ClockDef = { id: 'hop', phases: [{ name: 'off', seconds: 1.5 }, { name: 'warn', seconds: 0.6 }, { name: 'on', seconds: 0.5 }], offset: 0, easyStretch: 1.4 };

test('on the clock (the frog): its tell starts only on the warn and its act only on the on; Easy takes the clock\'s stretch', () => {
  const def = fair(base({ onBeat: true, speed: { rest: 0, hunt: 0 }, tell: 0.5, cool: 0, sight: { ahead: 120, behind: 120, tall: 80 }, engage: 120 }));
  assert.deepEqual(checkOnClock(def, HOP), []);
  for (const easy of [false, true]) {
    const k = easy ? 1.4 : 1;
    const s = newPredator(def, post());
    const ev = run(def, s, 2.6 * k * 3, () => prey({ x: 450 }), { clock: HOP, easy });
    const tells = ev.filter((e) => e.tell).map((e) => e.t);
    const acts = ev.filter((e) => e.act).map((e) => e.t);
    assert.equal(tells.length, 3, 'once a cycle');
    tells.forEach((t, i) => assert.ok(Math.abs(t - (1.5 * k + i * 2.6 * k)) < 2 * DT, `tell ${i} at ${t}`));
    acts.forEach((t, i) => assert.ok(t >= 2.1 * k + i * 2.6 * k - 1e-9 && t < 2.1 * k + i * 2.6 * k + 2 * DT, `act ${i} at ${t}`));
  }
  // with no clock handed to it, an onBeat kind never tells
  const lone = newPredator(def, post());
  assert.equal(run(def, lone, 6, () => prey({ x: 450 })).length, 0);
  assert.ok(checkOnClock(def, { ...HOP, phases: [{ name: 'off', seconds: 2 }, { name: 'warn', seconds: 0.3 }, { name: 'on', seconds: 0.5 }] }).some((l) => l.includes('shorter')));
  assert.ok(checkOnClock(base(), HOP).some((l) => l.includes('onBeat')));
});
