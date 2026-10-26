import test from 'node:test';
import assert from 'node:assert/strict';
import {
  admiring, anyCakeEaten, BUTLER, CAKE, CAKE_KEY, chairPull, CHAIR, COCOON, hitCocoon, humReaches, inSteam, loadCakes, newButler, newCocoon,
  newGate, newSit, newTeapot, orchidAt, orchidFair, orchidTiming, ORCHID, parseCakes, potAt, potFair, punchReachesCocoon, queenCakeLine,
  recordCake, seatedIn, shakyLetters, silkLine, silkSpeed, SIT, sitDrowsy, sleepySpeed, SPIDER5, spoutOf, stepButler, stepGate, stepSit,
  TEAPOT, threadTouched, touchesCake, trayAt, W5_TEACH, type GateState, type Orchid, type SitInput, type SitState,
} from './w5Kit.ts';
import { swapLine } from './dotLines.ts';
import { W5_HINTS } from './w5Lines.ts';

const DT = 1 / 30;
const still = { still: true, steer: 0 as const, seated: false, admiring: false };
const moving = { still: false, steer: 1 as const, seated: false, admiring: false };
/** stand (or move) for `secs`: the state, and the moment (s) he was wrapped, if he was */
function hold(s: SitState, secs: number, inp: SitInput = still, gentle = false): { s: SitState; wrappedAt: number | null; beganAt: number | null } {
  let wrappedAt: number | null = null;
  let beganAt: number | null = null;
  for (let i = 0; i < Math.round(secs / DT); i++) {
    const r = stepSit(s, inp, DT, gentle);
    s = r.s;
    if (r.began && beganAt === null) beganAt = (i + 1) * DT;
    if (r.wrapped && wrappedAt === null) wrappedAt = (i + 1) * DT;
  }
  return { s, wrappedAt, beganAt };
}

test("don't sit: standing still, the silk starts after a while and wraps him after a while more; gently slower in 5-1", () => {
  const r = hold(newSit(), 12);
  assert.ok(r.beganAt !== null && Math.abs(r.beganAt - SIT.drowse) < 0.1, `began at ${r.beganAt}`);
  assert.ok(r.wrappedAt !== null && Math.abs(r.wrappedAt - (SIT.drowse + SIT.creep)) < 0.15, `wrapped at ${r.wrappedAt}`);
  const g = hold(newSit(), 12, still, true);
  assert.ok(g.wrappedAt! > r.wrappedAt! + 1, 'the gentle lesson gives more time');
  // standing still for a breath (reading, aiming a jump) is never a danger
  assert.equal(hold(newSit(), SIT.drowse - 0.2).s.silk, 0);
});

test("don't sit: moving shakes the silk off, a wiggle sheds a chunk at once, and the wrap clears it with a moment's grace", () => {
  const half = hold(newSit(), SIT.drowse + SIT.creep * 0.6).s;
  assert.ok(half.silk > 0.5);
  const after = hold(half, 0.5, moving).s;
  assert.equal(after.silk, 0, 'half a second of moving shakes it all off');
  assert.equal(after.still, 0);
  // a wiggle: a new push one way sheds SIT.wiggle on the spot
  const w = stepSit({ ...half, steer: 0 }, { still: false, steer: -1, seated: false, admiring: false }, 0, false);
  assert.ok(Math.abs(half.silk - w.s.silk - SIT.wiggle) < 1e-9);
  // wrapped: the silk is gone, and stillness does not count again straight away
  const wr = hold(newSit(), SIT.drowse + SIT.creep + 0.2);
  assert.equal(wr.s.silk, 0);
  assert.ok(wr.s.cool > 0);
  // sticky: thick silk slows him, none does not
  assert.equal(silkSpeed(0), 1);
  assert.ok(silkSpeed(1) < 0.7 && silkSpeed(1) > 0.5);
  assert.ok(sitDrowsy(half) > 0.5 && sitDrowsy(newSit()) === 0);
});

test('a soft chair tugs him toward it on the ground beside it, harder close up, and sitting in it brings the silk on faster', () => {
  const c = { x: 1000, y: 580, face: 1 as const };
  assert.ok(chairPull(c, 900, 580, true) > 0, 'pulled right, toward it');
  assert.ok(chairPull(c, 1100, 580, true) < 0, 'pulled left, toward it');
  assert.ok(Math.abs(chairPull(c, 960, 580, true)) > Math.abs(chairPull(c, 860, 580, true)), 'harder close up');
  assert.equal(chairPull(c, 1000 - CHAIR.reach - 5, 580, true), 0, 'out of its reach');
  assert.equal(chairPull(c, 900, 580, false), 0, 'not in the air');
  assert.equal(chairPull(c, 900, 400, true), 0, 'not from another level');
  assert.equal(chairPull({ ...c, wrapped: true }, 900, 580, true), 0, 'a wrapped chair is only a reminder');
  // never strong enough to hold back a walk (285 px/s)
  assert.ok(Math.abs(chairPull(c, 990, 580, true)) < 100);
  assert.ok(seatedIn(c, 1010, 580) && !seatedIn(c, 1060, 580));
  const sat = hold(newSit(), 12, { ...still, seated: true });
  assert.ok(sat.wrappedAt! < (SIT.drowse + SIT.creep) / 1.8, `wrapped at ${sat.wrappedAt} in the chair`);
});

test("don't admire the silk: dawdling on the ground in front of a sheet is admiring it, and it counts faster than standing", () => {
  const s = { x0: 100, x1: 400, top: 300, bottom: 580 };
  assert.ok(admiring(s, 200, 580, 40, true));
  assert.ok(!admiring(s, 200, 580, 280, true), 'running past is fine');
  assert.ok(!admiring(s, 500, 580, 0, true), 'away from it is fine');
  assert.ok(!admiring(s, 200, 500, 0, false), 'not in the air');
  const a = hold(newSit(), 12, { ...still, admiring: true });
  assert.ok(a.wrappedAt! < (SIT.drowse + SIT.creep) / 1.5);
});

test("don't eat: a cake touches his body as he walks into it, not as he jumps over, and its sleep wears off", () => {
  const cake = { x: 500, y: 546 };
  assert.ok(touchesCake(cake, 500, 580));
  assert.ok(touchesCake(cake, 480, 580));
  assert.ok(!touchesCake(cake, 500, 580 - 60), 'jumped over');
  assert.ok(!touchesCake(cake, 400, 580));
  assert.equal(sleepySpeed(0), 1);
  assert.equal(sleepySpeed(CAKE.sleepy), CAKE.slow);
  assert.ok(sleepySpeed(0.5) > CAKE.slow && sleepySpeed(0.5) < 1, 'it eases back');
});

test("the cake record: none eaten in a new game, any cake is remembered, a damaged record is none, and the Queen's line follows it", () => {
  const m = new Map<string, string>();
  const store = { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v) };
  assert.equal(anyCakeEaten(store), false);
  assert.match(queenCakeLine(false), /Nobody has ever not eaten the cake/);
  recordCake('5-2', store);
  recordCake('5-2', store);
  assert.deepEqual(loadCakes(store), { v: 1, eaten: 2, stages: ['5-2'] });
  assert.equal(anyCakeEaten(store), true);
  assert.match(queenCakeLine(true), /You ate the cake, darling\. Everyone does\./);
  m.set(CAKE_KEY, '{nope');
  assert.equal(anyCakeEaten(store), false);
  assert.equal(parseCakes(JSON.stringify({ v: 1, eaten: 3, stages: ['5-1', 'x', 9] })).stages.join(), '5-1');
  // (no storage at all: nothing breaks)
  assert.equal(anyCakeEaten(null), false);
});

test('the Butler: the tray comes out over a warning, only a held-out tray is eaten from, a punch knocks it away, and a cake comes back', () => {
  const b = { x: 1000, y: 580, dir: -1 as const };
  let st = newButler();
  assert.equal(trayAt(b, st).out, 0);
  st = stepButler(st, { near: true, punched: false, touch: false }, DT).st;
  assert.equal(st.phase, 'offer');
  // touching the tray before it is out (inside the warning) eats nothing
  let r = stepButler(st, { near: true, punched: false, touch: true }, 0.2);
  assert.equal(r.ate, false);
  st = r.st;
  for (let i = 0; i < 30; i++) st = stepButler(st, { near: true, punched: false, touch: false }, DT).st;
  assert.equal(trayAt(b, st).out, 1);
  assert.ok(trayAt(b, st).x < b.x, 'held out toward him');
  assert.ok(BUTLER.tell >= 0.6, 'a warning of at least 0.6 s');
  r = stepButler(st, { near: true, punched: false, touch: true }, DT);
  assert.equal(r.ate, true);
  assert.equal(r.st.cake, false);
  // a punch
  let k = stepButler({ phase: 'offer', t: 0.1, cake: true }, { near: true, punched: true, touch: true }, DT);
  assert.equal(k.knocked, true);
  assert.equal(k.ate, false);
  let s2 = k.st;
  for (let i = 0; i < Math.ceil(BUTLER.refill / DT) + 1; i++) s2 = stepButler(s2, { near: false, punched: false, touch: false }, DT).st;
  assert.equal(s2.phase, 'idle');
  assert.equal(s2.cake, true);
  k = stepButler(s2, { near: false, punched: false, touch: false }, DT);
  assert.equal(k.st.phase, 'idle', 'no offer while he is not near');
});

test("don't drink: the pot rattles before it puffs, the steam only holds him during the puff, and every pot's rhythm is fair", () => {
  const pot = newTeapot(1000, 580, 1);
  assert.equal(potAt(pot, 0).phase, 'idle');
  assert.equal(potAt(pot, TEAPOT.idle + 0.1).phase, 'warn');
  assert.equal(potAt(pot, TEAPOT.idle + TEAPOT.warn + 0.1).phase, 'puff');
  assert.equal(potAt(pot, TEAPOT.idle + TEAPOT.warn + TEAPOT.puff + 0.1).phase, 'idle');
  const s = spoutOf(pot);
  const puffT = TEAPOT.idle + TEAPOT.warn + 0.5;
  assert.ok(inSteam(pot, puffT, s.x, 580));
  assert.ok(!inSteam(pot, 1, s.x, 580), 'quiet: walk past');
  assert.ok(!inSteam(pot, TEAPOT.idle + 0.2, s.x, 580), 'rattling (the warning): still safe');
  assert.ok(!inSteam(pot, puffT, s.x + 200, 580), 'away from the spout');
  assert.ok(potFair(pot));
  assert.ok(!potFair(newTeapot(0, 0, 1, { warn: 0.3 })));
  assert.ok(TEAPOT.warn >= 0.6);
});

test("don't touch the silk: a low thread is touched walking into it, not jumping over it, and its hum reaches the spiders near it", () => {
  const th = { x0: 1000, x1: 1080, y: 566 };
  assert.ok(threadTouched(th, 990, 580));
  assert.ok(threadTouched(th, 1040, 580));
  assert.ok(!threadTouched(th, 1040, 580 - 50), 'jumped over');
  assert.ok(!threadTouched(th, 900, 580));
  assert.ok(humReaches(th, 1500, 568));
  assert.ok(!humReaches(th, 2200, 568), 'too far along');
  assert.ok(!humReaches(th, 1100, 200), 'too far up');
});

test('the spiders: a crouch of at least 0.6 s before any rush; a sleeping one wakes at a hum or a bump, never at a hop over it', () => {
  assert.ok(SPIDER5.tell >= 0.6);
  const run = (g: GateState, inp: Parameters<typeof stepGate>[1], secs: number) => {
    for (let i = 0; i < Math.round(secs / DT); i++) g = stepGate(g, inp, DT);
    return g;
  };
  // awake: he comes into its sight, it crouches, and only after the tell does it go
  let g = stepGate(newGate(), { dx: 300, dy: 0, alarm: false, hunting: false }, DT);
  assert.equal(g.phase, 'windup');
  g = run(g, { dx: 200, dy: 0, alarm: false, hunting: false }, SPIDER5.tell - 0.1);
  assert.equal(g.phase, 'windup');
  g = run(g, { dx: 200, dy: 0, alarm: false, hunting: false }, 0.2);
  assert.equal(g.phase, 'go');
  // and it falls calm again once its brain loses him
  g = run(g, { dx: 2000, dy: 0, alarm: false, hunting: false }, 1.2);
  assert.equal(g.phase, 'calm');
  // out of sight: calm
  assert.equal(stepGate(newGate(), { dx: 900, dy: 0, alarm: false, hunting: false }, DT).phase, 'calm');
  // asleep: walking past further off, or hopping right over it, does not wake it
  assert.equal(stepGate(newGate(true), { dx: 150, dy: 0, alarm: false, hunting: false, grounded: true }, DT).phase, 'calm');
  assert.equal(stepGate(newGate(true), { dx: 10, dy: -60, alarm: false, hunting: false, grounded: false }, DT).phase, 'calm');
  // walking into it does, and a hum does from afar
  assert.equal(stepGate(newGate(true), { dx: 30, dy: 0, alarm: false, hunting: false, grounded: true }, DT).phase, 'windup');
  const woke = stepGate(newGate(true), { dx: 600, dy: 0, alarm: true, hunting: false }, DT);
  assert.equal(woke.phase, 'windup');
  assert.equal(woke.dozing, false, 'once woken it stays awake');
});

test('closing orchids: open, then a shiver it can still be stood on through, then shut; they close earlier further into the world, always fairly', () => {
  const o: Orchid = { x: 0, y: 400, w: 120, period: 6, open: 3.4, offset: 0 };
  assert.deepEqual(orchidAt(o, 1).phase, 'open');
  const c = orchidAt(o, 3.5);
  assert.equal(c.phase, 'closing');
  assert.ok(c.solid && c.picks, 'the warning still holds him');
  assert.ok(ORCHID.tell >= 0.6);
  const s = orchidAt(o, 4.6);
  assert.equal(s.phase, 'shut');
  assert.ok(!s.solid && !s.picks);
  assert.equal(orchidAt(o, 5.5).phase, 'opening');
  assert.equal(orchidAt(o, 6.1).phase, 'open');
  let last = Infinity;
  for (let mini = 1; mini <= 9; mini++) {
    const tm = orchidTiming(mini);
    assert.ok(tm.open <= last, `stage ${mini} stays open longer than the one before`);
    last = tm.open;
    assert.ok(orchidFair({ ...o, ...tm }), `5-${mini}: ${JSON.stringify(tm)}`);
  }
  assert.ok(orchidTiming(9).open < orchidTiming(3).open);
});

test('cocoons: a punch by it is a hit, three set the creature free, and a freed one takes no more', () => {
  const c = { x: 500, y: 560 };
  assert.ok(punchReachesCocoon(c, { x: 480, y: 540 }));
  assert.ok(!punchReachesCocoon(c, { x: 380, y: 540 }));
  let st = newCocoon();
  for (let i = 0; i < COCOON.hits - 1; i++) st = hitCocoon(st);
  assert.equal(st.freed, false);
  st = hitCocoon(st);
  assert.equal(st.freed, true);
  assert.equal(hitCocoon(st).hits, st.hits);
});

test("silk lines are lianas (the vine system swings them), drawn as silk; Meeca's letters shake the same way every time", () => {
  const v = silkLine(7, 1200, 200, 560);
  assert.equal(v.vineType, 'swing_liana');
  assert.equal(v.isSwingingVine, true);
  assert.equal(v.silk, true);
  const a = shakyLetters('POKEY.', 3);
  assert.deepEqual(a, shakyLetters('POKEY.', 3));
  assert.notDeepEqual(a, shakyLetters('POKEY.', 4));
  assert.equal(a.map((l) => l.ch).join(''), 'POKEY.');
  for (const l of a) assert.ok(Math.abs(l.dy) <= 3 && Math.abs(l.rot) <= 0.12 && l.k > 0.9 && l.k < 1.1);
});

test('every World 5 line has its new-look words: a tip of 8 words or fewer that names the thumb move, and the old look keeps the old', () => {
  const words = (s: string) => s.split(/\s+/).filter((t) => /[A-Za-z0-9]/.test(t)).length;
  const THUMB = /\b(slide|flick|tap|thumb)\b/i;
  for (const [k, old] of Object.entries(W5_TEACH)) {
    const sw = swapLine(old);
    assert.ok(sw && sw.text, `${k}: no new-look line`);
    if (sw.line.kind === 'move') {
      assert.ok(words(sw.text) <= 8, `${k}: ${sw.text}`);
      assert.ok(THUMB.test(sw.text), `${k} names no thumb move: ${sw.text}`);
    }
    // the old look's words name the touch move too
    if (sw.line.kind === 'move') assert.ok(THUMB.test(old), `${k} (old): ${old}`);
  }
  for (const [k, h] of Object.entries(W5_HINTS)) {
    const sw = swapLine(h.old, h.stage);
    assert.ok(sw && sw.text, `${k}: no new-look line`);
    assert.ok(words(sw.text) <= 12, `${k}: ${sw.text}`);
  }
});
