/**
 * Jump forgiveness for 30 fps touch, on every stage, by difficulty (Matt's Gemini research, reference/GEMINI-LEDGER.md section G;
 * physics.ts FORGIVE). Real engine (realPlay.ts) on a bare floor, except G8 (the validator).
 *   G1 coyote time: a jump 120 ms after walking off an edge still jumps on Normal, 160 ms on Easy (and not 200 ms on Normal).
 *   G2 jump buffer: a press 180 ms before landing (no jump left in the air) jumps as he lands on Easy; on Normal it is too early.
 *   G3 ledge landing: a jump toward a ledge that comes down with his foot 10 px short of it lands on Easy (12 px allowed) but not on
 *      Normal (8 px).
 *   G4 a jump into a 90 px face carries over its lip, in World 1 and in a generated world.
 *   G8 the validator: an Easy step that needs a full-hold jump fails easyHoldCheck; one a 70% hold climbs passes; Easy softens the
 *      first (a step halfway up in front of it, the rise still there) until it passes. Every Easy stage on rolls 1-3: easyMode.test.ts.
 */
import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { RealPlay } from './realPlay.ts';
import { setDifficulty } from './difficulty.ts';
import { ASSIST, FORGIVE, JUMP_RISE, reachJump, reachJumpHeld, EASY_HOLD } from './physics.ts';
import { easyHoldCheck, validateStage } from './levelCheck.ts';
import { easyHoldSoften } from './easyMode.ts';
import { buildProtoStage, HAND_STAGES } from './protoStage.ts';
import { levelConfig } from './realPlay.ts';
import type { Platform } from './types.ts';

const Y = 600;
const EDGE = 1000;
after(() => setDifficulty('normal'));

/** a bare world on `id` (its stage number sets the early-stage help: 4-1 has none left) at the difficulty */
function bare(id: string, easy: boolean, plats: Platform[]): RealPlay {
  setDifficulty(easy ? 'easy' : 'normal');
  const sim = new RealPlay(id, 1);
  (sim.input as unknown as { source: string }).source = 'gesture';
  sim.bare(plats);
  return sim;
}
const floor = (x0: number, x1: number, y = Y, h = 90): Platform => ({ id: x0 + 1, x: x0, y, width: x1 - x0, height: h, type: 'solid', style: 'log' } as Platform);

/** walk off the edge and press jump `ms` after his feet leave it: did he jump? */
function coyote(easy: boolean, ms: number): boolean {
  const sim = bare('4-1', easy, [floor(0, EDGE)]);
  if (!easy) assert.equal(sim.e.assistNow(), 0, 'no early-stage help on 4-1 on Normal (Easy keeps it, on top)');
  sim.stand(EDGE - 60, Y);
  let leftAt = -1;
  for (let i = 0; i < 60; i++) {
    const t = sim.t;
    const press = leftAt >= 0 && t - leftAt >= ms / 1000 - 1e-6 && t - leftAt < ms / 1000 + 1 / 30 - 1e-6;
    sim.frame({ right: true, press });
    if (leftAt < 0 && !sim.p.grounded) leftAt = t;
    if (press) {
      sim.frame({ right: true });
      if (process.env.FORG_DEBUG) console.log('coyote', easy, ms, (t - leftAt).toFixed(3), sim.p.vy.toFixed(0), sim.p.jumpsLeft, sim.e.coyoteTimer);
      return sim.p.vy < -100 && sim.p.jumpsLeft === 1;
    }
  }
  return false;
}

test('G1 coyote time: 133 ms on Normal and 167 on Easy, on a stage past the early help', () => {
  assert.ok(coyote(false, 100) && coyote(false, 120), 'Normal, 120 ms after the edge');
  assert.ok(!coyote(false, 200), 'Normal, 200 ms is too late');
  assert.ok(coyote(true, 160), 'Easy, 160 ms after the edge');
  assert.ok(!coyote(false, 167), 'Normal, 167 ms is too late');
  assert.equal(FORGIVE.normal.coyote, 0.133);
  assert.equal(FORGIVE.easy.coyote, 0.167);
});

/** a double jump used up, falling to the floor: a press `ms` before he lands. Did he jump again on landing? */
function buffered(easy: boolean, ms: number): boolean {
  const sim = bare('4-1', easy, [floor(0, 4000)]);
  sim.fly(1000, Y - 200, 0, 0, 0);
  // (the frames until he lands, falling from rest)
  const probe = bare('4-1', easy, [floor(0, 4000)]);
  probe.fly(1000, Y - 200, 0, 0, 0);
  let n = 0;
  while (!probe.p.grounded && n < 200) {
    probe.frame();
    n++;
  }
  const pressAt = n - Math.round(ms / (1000 / 30));
  for (let i = 0; i < n + 6; i++) {
    sim.frame({ press: i === pressAt });
    if (i >= n - 1 && sim.p.vy < -300) return true;
  }
  return false;
}

test('G2 jump buffer: a press 180 ms before landing jumps as he lands on Easy (200 ms), not on Normal (133 ms)', () => {
  assert.ok(buffered(true, 180), 'Easy, 180 ms early');
  assert.ok(!buffered(false, 180), 'Normal, 180 ms early is too early');
  assert.ok(buffered(false, 100), 'Normal, 100 ms early');
  assert.equal(ASSIST.buffer > 0, true);
});

/** falling straight down past the left edge of a ledge with his foot `short` px short of it: on it after? */
function ledge(easy: boolean, short: number): boolean {
  const L = 1500;
  const sim = bare('4-1', easy, [floor(0, 600, Y + 300), floor(L, L + 300, Y)]);
  const side = 0.26 * sim.p.width;
  // (a jump toward it that fell a little short: still drifting toward it as he comes down)
  // (from a little above its top, so he drifts about 5 px on the way down)
  sim.fly(L - side - short - 5, Y - 30, 35, 0, 0);
  for (let i = 0; i < 40; i++) {
    if (!sim.p.grounded) sim.p.vx = 35;
    sim.frame();
  }
  return Math.abs(sim.p.y - Y) < 1 && sim.p.grounded;
}

test('G3 ledge landing: a foot 10 px short of an edge lands on Easy (12 px), not on Normal (8 px); 6 px lands on both', () => {
  assert.ok(ledge(true, 10), 'Easy, 10 px short');
  assert.ok(!ledge(false, 10), 'Normal, 10 px short');
  assert.ok(ledge(false, 6), 'Normal, 6 px short');
  // (Easy keeps the first stage's wider landing too, ASSIST.landSide: about 4 px more)
  assert.ok(!ledge(true, 22), 'Easy, 22 px short falls');
});

/** steer to a face, lift, one straight flick: on top? */
function face(id: string, h: number): boolean {
  const sim = bare(id, false, [floor(0, 4000), floor(EDGE, EDGE + 200, Y - h, h)]);
  sim.stand(EDGE - 60, Y);
  let hold = 0, flicked = false;
  for (let i = 0; i < 60; i++) {
    let press = false;
    if (!flicked && sim.p.grounded && sim.p.x + 19 >= EDGE - 3) {
      press = true;
      flicked = true;
      hold = 7;
    }
    sim.frame({ right: !flicked, press, jump: hold > 0 });
    hold--;
  }
  return Math.abs(sim.p.y - (Y - h)) < 1 && sim.p.x > EDGE;
}

test('G4 a jump into a 90 px face carries over its lip, in World 1 and in a generated world (6-3)', () => {
  assert.ok(face('1-3', 90), 'World 1');
  assert.ok(face('6-3', 90), 'World 6, generated');
});

test('G8 the validator: an Easy step that needs a full-hold jump fails; one a 70% hold climbs passes', () => {
  assert.ok(reachJumpHeld(0.85 * JUMP_RISE, false) < 0, 'a 70% hold does not rise 85% of a full jump');
  assert.ok(reachJump(0.85 * JUMP_RISE, false) > 0);
  const make = (rise: number) => {
    const st = buildProtoStage(levelConfig('1-3'), 1, HAND_STAGES['1-3']);
    const A = floor(0, 900);
    const B = floor(900, 1900, Y - rise, rise + 90);
    Object.assign(st, {
      config: { ...st.config, objectiveType: 'sprint', targetCount: 1 },
      platforms: [A, B], vines: [], ropes: [], enemies: [], rivers: [], checkpoints: [], zones: [], updrafts: [], kit: undefined,
      collectibles: [{ id: 1, type: 'exit_totem', x: 1700, y: Y - rise - 30, collected: false, bobPhase: 0 }],
      spawnX: 100, spawnY: Y, exitTotemX: 1700, exitTotemY: Y - rise,
    });
    return st;
  };
  const HARD = Math.round(0.95 * JUMP_RISE); // (a face: the lip's hoist, levelCheck.ts HOLD_MANTLE, takes the held jump a little higher)
  const hard = make(HARD);
  assert.ok(validateStage(hard).ok, `the full jump climbs it: ${validateStage(hard).errors.join('; ')}`);
  assert.ok(easyHoldCheck(hard).length > 0, 'a 70% hold does not');
  const fine = make(Math.round(0.5 * JUMP_RISE));
  assert.deepEqual(easyHoldCheck(fine), []);
  assert.equal(EASY_HOLD, 0.7);
  // Easy softens the hard one: a step halfway up in front of the face, which is still there at its height
  assert.equal(easyHoldSoften(hard), 1);
  assert.deepEqual(easyHoldCheck(hard), []);
  const [, face, step] = hard.platforms;
  assert.equal(face.y, Y - HARD, 'the face keeps its height');
  assert.ok(step && step.x + step.width <= face.x + 1 && step.y > face.y && step.y < Y, `a step in front of it, halfway up (${step?.y})`);
  assert.equal(easyHoldSoften(fine), 0, 'nothing to soften on the easy one');
});
