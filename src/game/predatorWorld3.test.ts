// World 3's prowler, worked through (reference/design/PREDATORS.md §2, §3; 3-2.md NEW 1 ENG-PROWL): the ocelot never looks up. A sloth
// hanging from a rope over it is out of its sight unless he hangs low (its `sight.up`); one it does see hanging, it answers with its
// leap (aim 'up'), told first, one heart, and on Easy never inside the tell's escapes (creep on along the rope, or freeze).
// Every kit run goes through predators/fixtures.ts's `run`, which asserts the tell gate on every step. The wiring and the freeze go
// through castPlay.ts (CastHero.hanging, stillness from his own speed), as the engine hands them.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CastPlay, type CastHero } from './castPlay.ts';
import type { CastData } from './castPlay.types.ts';
import { checkPredator, hurt, landed, newPredator, reachBox, tellOf, touches } from './predators/core.ts';
import { DT, firstT, post, prey, run } from './predators/fixtures.ts';
import { BY_WORLD } from './predators/registry.ts';
import { JAGUAR, OCELOT, WORLD3 } from './predators/world3.ts';
import type { PredatorDef, PredatorState, Prey } from './predators/types.ts';
import { ROPE_SPEED } from './rope.ts';
import { STILLNESS } from './stillness.ts';
import type { Enemy, Platform } from './types.ts';

/** its ground (the kit's post y: its feet) */
const FLOOR = 300;
/** Easy's root on 3-2 (3-2.md NEW 1: "a hanging Pokey (74 px up)"), and a low hang inside its sight.up */
const HIGH = 74;
const LOW = 30;
const floor = (over = {}) => post({ x: 600, y: FLOOR, minX: 300, maxX: 900, facing: -1, ...over });
/** he creeps along a rope at ROPE_SPEED, his feet `up` px over its ground, from `x0` the way `dir` says */
const creep = (x0: number, up: number, dir: 1 | -1 = 1) => (t: number): Prey => prey({ x: x0 + dir * ROPE_SPEED * t, y: FLOOR - up, facing: dir, hanging: true });
/** the plant: the same ocelot with `sight.up` off (it sees as high as `tall`, as every kind did before ENG-PROWL) */
const lookingUp: PredatorDef = { ...OCELOT, sight: { ...OCELOT.sight, up: undefined } };

test('both are fair: a tell of 0.5 s or more, two ways or more, Easy never harder, and the ocelot never looks up past 40 px', () => {
  for (const d of WORLD3) assert.deepEqual(checkPredator(d), [], d.kind);
  assert.equal(OCELOT.sight.up, 40);
  assert.equal(OCELOT.sight.tall, 80, 'below its feet it sees as before');
  assert.deepEqual(OCELOT.leap && { aim: OCELOT.leap.aim, tall: OCELOT.leap.tall }, { aim: 'up', tall: 130 });
  assert.equal(JAGUAR.sight.up, undefined, 'the jaguar waits overhead and looks down: unchanged');
});

test('every other kind sees as it did: only the ocelot has an up of its own or a leap (nothing shipped moves)', () => {
  const all = BY_WORLD.flat();
  assert.deepEqual(all.filter((d) => d.sight.up !== undefined).map((d) => d.kind), ['ocelot']);
  assert.deepEqual(all.filter((d) => d.leap).map((d) => d.kind), ['ocelot']);
});

// ───────────────────────────── the planted toys ─────────────────────────────

test('TOY 1: a sloth hanging 74 px over a prowling ocelot creeps right over it unseen, both settings (plant: sight.up off -> seen)', () => {
  for (const easy of [false, true]) {
    for (const def of [OCELOT, lookingUp]) {
      const s = newPredator(def, floor());
      let hit = false;
      const ev = run(def, s, 6, (t) => {
        const p = creep(300, HIGH)(t);
        if (touches(hurt(def, s), p)) hit = true;
        return p;
      }, { easy });
      const seen = ev.some((e) => e.notice || e.tell);
      if (def === OCELOT) {
        assert.ok(!seen && !s.knows && !hit, `easy=${easy}: it never noticed him (${JSON.stringify(ev)})`);
      } else {
        // the plant: 74 px is inside `tall` 80, so the same run with up off is seen, told and leapt at (the line sight.up draws)
        assert.ok(seen && s.knows, `easy=${easy}, sight.up off: seen`);
        assert.ok(hit, `easy=${easy}, sight.up off: the leap reaches 74 px (tall 130)`);
      }
    }
  }
});

/** run the ocelot at a sloth from `at`, the engine's way: a box on him takes a heart and the act pulls up (core.ts landed) */
function hearts(def: PredatorDef, s: PredatorState, seconds: number, at: (t: number) => Prey, easy: boolean) {
  const out = { hearts: 0, acts: 0, leapt: 0, tellAt: NaN, perAct: [] as number[], boxH: [] as number[] };
  let was = s.phase;
  const ev = run(def, s, seconds, (t) => {
    const p = at(t);
    if (s.phase === 'act' && was !== 'act') {
      out.acts++;
      out.perAct.push(0);
      if (s.leaping) out.leapt++;
    }
    const box = hurt(def, s);
    if (s.phase === 'act' && touches(box, p)) {
      out.hearts++;
      out.perAct[out.perAct.length - 1]++;
      out.boxH.push(box!.h);
      landed(s);
    }
    was = s.phase;
    return p;
  }, { easy });
  out.tellAt = firstT(ev, 'tell');
  return out;
}

test('TOY 2: a sloth hanging inside 40 px is seen, told, leapt at from the ground (box 130 tall), one heart an act', () => {
  for (const easy of [false, true]) {
    const s = newPredator(OCELOT, floor());
    let leapBox = 0, tellBefore = NaN;
    const r = hearts(OCELOT, s, 3, (t) => {
      if (s.phase === 'act' && s.leaping) leapBox = Math.max(leapBox, reachBox(OCELOT, s).h);
      if (s.phase === 'tell' && Number.isNaN(tellBefore)) tellBefore = t;
      return creep(300, LOW)(t);
    }, easy);
    assert.ok(Number.isFinite(r.tellAt), `easy=${easy}: it saw him and told`);
    assert.equal(leapBox, 130, `easy=${easy}: the act it took was the leap`);
    assert.ok(r.hearts >= 1 && r.leapt === r.acts, `easy=${easy}: the leap took a heart (he crept on into it); every act a leap`);
    assert.ok(r.perAct.every((n) => n <= 1), `easy=${easy}: one heart an act (${r.perAct})`);
    assert.ok(r.boxH.every((h) => h === 130), 'every heart was the leap\'s');
  }
});

test('a sloth on the ground still meets its plain pounce, not the leap: the leap is only for one hanging over it', () => {
  const s = newPredator(OCELOT, floor());
  let leapt = false, box = 0;
  run(OCELOT, s, 3, (t) => {
    if (s.phase === 'act') {
      leapt ||= !!s.leaping;
      box = Math.max(box, reachBox(OCELOT, s).h);
    }
    return prey({ x: 300 + 60 * t, y: FLOOR });
  });
  assert.ok(box > 0 && !leapt && box === OCELOT.act.tall, `the pounce (tall ${OCELOT.act.tall}), not the leap (${box})`);
});

test('its pair, below: a sloth walking 60 px under its feet is still seen (down to tall 80, unchanged); 90 px under is not', () => {
  for (const [under, seen] of [[60, true], [90, false]] as const) {
    const s = newPredator(OCELOT, floor());
    const ev = run(OCELOT, s, 3, (t) => prey({ x: 300 + 60 * t, y: FLOOR + under }));
    assert.equal(ev.some((e) => e.notice || e.tell), seen, `${under} px under its feet`);
  }
});

test('the leap never leaves its ground: a sloth hanging past the end of its patch is leapt at from the end', () => {
  const s = newPredator(OCELOT, floor({ x: 650, minX: 500, maxX: 700, facing: 1 }));
  let far = -Infinity, acts = 0, was = s.phase;
  run(OCELOT, s, 2, (t) => {
    if (s.phase === 'act') far = Math.max(far, s.x);
    if (s.phase === 'act' && was !== 'act') acts++;
    was = s.phase;
    return creep(720, LOW)(t);
  });
  assert.ok(acts >= 1 && far <= 700, `it leapt (${acts}) and stayed on its patch (to ${far})`);
});

// ───────────────────────────── the tell's escapes, Easy first ─────────────────────────────

test('ESCAPE 1: creeping on along the rope, away from it, from wherever the tell began, the leap never lands (Easy and Normal)', () => {
  for (const easy of [true, false]) {
    for (const dir of [1, -1] as const) {
      for (let d = 0; d <= OCELOT.engage; d += 10) {
        // (it faces him and he creeps on away: the tell begins at once, he is d px off its middle)
        const s = newPredator(OCELOT, floor({ facing: dir }));
        const r = hearts(OCELOT, s, 4, creep(600 + dir * d, LOW, dir), easy);
        assert.ok(Number.isFinite(r.tellAt) && r.acts >= 1 && r.leapt === r.acts, `easy=${easy} dir=${dir} d=${d}: it told and leapt`);
        assert.equal(r.hearts, 0, `easy=${easy} dir=${dir} d=${d}: he crept on out of the leap`);
      }
    }
  }
});

// The freeze goes through castPlay (the kit reads stillness from his own speed there: STILLNESS.calmIn), with the engine's hanging flag.
const GROUND = 400;
const floorPlat = { id: 1, x: 0, y: GROUND, width: 1400, height: 30, type: 'solid' } as Platform;
const ocelot = (over: Partial<Enemy> = {}): Enemy => ({
  id: 700, type: 'ocelot', x: 600, y: GROUND - 20, vx: 0, vy: 0, width: 44, height: 28, hp: 1, maxHp: 1, facing: -1, patrolMinX: 300, patrolMaxX: 900,
  attackCooldown: 0, telegraphTimer: 0, isAttacking: false, animTimer: 0, hitFlashTimer: 0, defeated: false, koTimer: 0, behaviorTimer: 0, ...over,
} as Enemy);
const hang = (x: number, up: number, vx: number): CastHero => ({ x, y: GROUND - up, vx, vy: 0, facing: vx < 0 ? -1 : 1, grounded: false, holding: true, hanging: true });
/** the cast in World 3, Pokey creeping right over the floor at `up` px until `stopAt(t)` says he holds still. Hearts the engine's way */
function castRun(up: number, stopAt: (tellAt: number) => number, easy: boolean, seconds = 4) {
  const e = ocelot();
  const c = new CastPlay({ kinds: ['ocelot'], traps: [] } as CastData, [e], [floorPlat], 3);
  const m = c.members[0];
  const r = { hearts: 0, tellAt: NaN, acts: 0, leapt: 0, calledOff: false };
  let x = 300;
  for (let i = 0, t = 0; i < Math.round(seconds / DT); i++, t += DT) {
    const moving = !(t >= stopAt(r.tellAt));
    const vx = moving ? ROPE_SPEED : 0;
    x += vx * DT;
    const h = hang(x, up, vx);
    const was = m.s.phase;
    const step = c.step(h, DT, t, easy);
    if (step.told.length && Number.isNaN(r.tellAt)) r.tellAt = t;
    if (step.struck.length) {
      r.acts++;
      if (m.s.leaping) r.leapt++;
    }
    if (was === 'tell' && m.s.phase !== 'tell' && m.s.phase !== 'act') r.calledOff = true;
    for (const k of step.hurts) if (touches(k.box, h)) {
      r.hearts++;
      c.struck(k.e);
    }
  }
  return r;
}

test('the wiring: castPlay hands the kit his hanging (CastHero.hanging), so the engine\'s hanging sloth is leapt at, one heart', () => {
  for (const easy of [false, true]) {
    const r = castRun(LOW, () => Infinity, easy, 3);
    assert.ok(Number.isFinite(r.tellAt) && r.acts >= 1 && r.leapt === r.acts, `easy=${easy}: told, and every act a leap (${JSON.stringify(r)})`);
    assert.equal(r.hearts, r.acts, `easy=${easy}: he crept on into it: one heart an act`);
  }
  const high = castRun(HIGH, () => Infinity, true, 6);
  assert.ok(Number.isNaN(high.tellAt) && high.hearts === 0, 'at 74 px, through castPlay too: never told');
});

test('ESCAPE 2 (Easy): freezing on the rope when the tell begins, as late as the tell allows, calls the leap off', () => {
  const tell = tellOf(OCELOT, true), calm = STILLNESS.easy.calmIn;
  assert.ok(tell > calm, `the Easy tell (${tell} s) outlasts Easy's calm-in (${calm} s)`);
  for (const late of [0, 0.1, 0.2, Math.max(0, tell - calm - 2 * DT)]) {
    const r = castRun(LOW, (at) => (Number.isFinite(at) ? at + late : Infinity), true);
    assert.ok(Number.isFinite(r.tellAt), `late ${late}: it told`);
    assert.ok(r.calledOff && r.acts === 0 && r.hearts === 0, `late ${late.toFixed(2)} s: the freeze called it off (${JSON.stringify(r)})`);
  }
});

// ───────────────────────────── the kit refuses an unfair leap ─────────────────────────────

test('checkPredator refuses a leap a creeping sloth could not escape on Easy, and one a freeze cannot call off', () => {
  const leap = OCELOT.leap!;
  const wide = { ...OCELOT, leap: { ...leap, reach: 2 * (ROPE_SPEED * tellOf(OCELOT, true)) } };
  assert.ok(checkPredator(wide).some((m) => /creep/.test(m)), `too wide to creep out of: ${checkPredator(wide)}`);
  const noCall = { ...OCELOT, callsOff: undefined };
  assert.ok(checkPredator(noCall).some((m) => /call/.test(m)), `a leap a freeze cannot call off: ${checkPredator(noCall)}`);
});
