/**
 * World 5's pieces in the real engine (realPlay.ts), each the way a player meets it: standing still wraps him (a heart in 5-2, only a
 * fright in 5-1's gentle lesson), a wiggle keeps it off, a soft chair tugs, a cake makes him slow, a thread's hum wakes the sleeping
 * spiders (who crouch before they come), and a punch knocks the Butler's tray away.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { RealPlay } from './realPlay.ts';
import { G } from './protoStage.ts';
import { BUTLER, SIT, SPIDER5, W5_TEACH, type W5Extras } from './w5Kit.ts';

const w5Of = (sim: RealPlay) => (sim.stage as unknown as { proto: { w5: W5Extras } }).proto.w5;
/** stand him at x on the ground, take one step (so the stage has seen him move), and let go */
function standAt(sim: RealPlay, x: number) {
  sim.stand(x, G);
  for (let i = 0; i < 3; i++) sim.frame({ right: true });
  for (let i = 0; i < 6; i++) sim.frame();
}

test('5-2: standing still, the silk creeps up him and wraps him for a heart; wiggling keeps it off', () => {
  const sim = new RealPlay('5-2', 1);
  sim.safe = false;
  standAt(sim, 600);
  const hp = sim.p.hp;
  sim.wait(SIT.drowse + 1);
  assert.ok(sim.e.w5.silk > 0, 'the silk has started');
  sim.wait(SIT.creep + 0.5);
  assert.equal(sim.p.hp, hp - 1, 'wrapped: a heart');
  assert.ok(sim.said.some((s) => s.text === W5_TEACH.sit), 'Dot said what the silk is the first time');
  // wiggling on the spot (left, right) never lets it wrap him
  const sim2 = new RealPlay('5-2', 1);
  sim2.safe = false;
  standAt(sim2, 600);
  const hp2 = sim2.p.hp;
  for (let s = 0; s < 12; s++) {
    sim2.wait(1.6);
    for (let i = 0; i < 3; i++) sim2.frame({ left: true });
    for (let i = 0; i < 3; i++) sim2.frame({ right: true });
  }
  assert.equal(sim2.p.hp, hp2);
});

test('5-1 teaches it gently: the wrap costs no heart, and Dot wakes him', () => {
  const sim = new RealPlay('5-1', 1);
  sim.safe = false;
  standAt(sim, 700);
  const hp = sim.p.hp;
  sim.wait(SIT.drowse + SIT.gentleCreep + 1);
  assert.equal(sim.p.hp, hp);
  assert.ok(sim.said.some((s) => s.text === W5_TEACH.wrapGentle));
});

test("5-1: the table's soft chairs tug him toward them while he stands beside one", () => {
  const sim = new RealPlay('5-1', 1);
  const chair = w5Of(sim).chairs!.find((c) => !c.wrapped)!;
  standAt(sim, chair.x - 90);
  const x0 = sim.p.x;
  sim.wait(1);
  assert.ok(sim.p.x > x0 + 15, `pulled from ${Math.round(x0)} to ${Math.round(sim.p.x)} (chair at ${chair.x})`);
});

test('5-2: walking into a cake makes him sleepy and slow for a few seconds', () => {
  const sim = new RealPlay('5-2', 1);
  const cake = w5Of(sim).cakes![0];
  const walk = (secs: number) => {
    const x = sim.p.x;
    for (let i = 0; i < Math.round(secs * 30); i++) sim.frame({ right: true });
    return sim.p.x - x;
  };
  sim.stand(cake.x - 300, G);
  const awake = walk(0.6);
  sim.stand(cake.x - 40, G);
  for (let i = 0; i < 10 && sim.e.w5.asleep <= 0; i++) sim.frame({ right: true });
  assert.ok(sim.e.w5.asleep > 0, 'he ate it');
  // (the harness's stand clears the sleep: walk on from where he is)
  const sleepy = walk(0.6);
  assert.ok(sleepy < awake * 0.8, `awake ${Math.round(awake)} px, sleepy ${Math.round(sleepy)} px`);
  assert.ok(sim.said.some((s) => s.text === W5_TEACH.cake), 'the cakes were taught before the first one');
});

test("5-2: a thread's hum wakes the sleeping spiders; each crouches for its warning before it comes", () => {
  const sim = new RealPlay('5-2', 1);
  const w5 = w5Of(sim);
  const sleepers = new Set(w5.spiders!.filter((s) => s.doze).map((s) => s.id));
  // the first thread with sleepers in reach of its hum
  const th = w5.threads!.find((t) => sim.e.enemies.some((e: { id: number; x: number }) => sleepers.has(e.id) && Math.abs(e.x - (t.x0 + t.x1) / 2) < 680))!;
  assert.ok(th, 'a thread guards sleeping spiders');
  const gates = sim.e.w5.gates as Map<number, { phase: string }>;
  const near = sim.e.enemies.filter((e: { id: number; x: number }) => sleepers.has(e.id) && Math.abs(e.x - (th.x0 + th.x1) / 2) < 680);
  for (const e of near) assert.equal(gates.get(e.id)!.phase, 'calm');
  sim.stand(th.x0 - 60, G);
  for (let i = 0; i < 20 && !near.some((e: { id: number }) => gates.get(e.id)!.phase !== 'calm'); i++) sim.frame({ right: true });
  for (const e of near) assert.equal(gates.get(e.id)!.phase, 'windup', `spider ${e.id} woke`);
  // the warning: still for SPIDER5.tell
  const xs = near.map((e: { x: number }) => e.x);
  for (let i = 0; i < Math.floor((SPIDER5.tell - 0.1) * 30); i++) sim.frame();
  near.forEach((e: { id: number; x: number }, k: number) => {
    assert.equal(gates.get(e.id)!.phase, 'windup');
    assert.equal(e.x, xs[k], 'it has not moved yet');
  });
  sim.wait(0.3);
  for (const e of near) assert.equal(gates.get(e.id)!.phase, 'go');
  assert.ok(sim.said.some((s) => s.text === W5_TEACH.thread), 'the threads were taught');
});

test("5-2: a punch knocks the Butler's tray away, and then there is no cake to eat", () => {
  const sim = new RealPlay('5-2', 1);
  const b = w5Of(sim).butlers![0];
  sim.stand(b.x - 120, G);
  sim.p.facing = 1;
  for (let i = 0; i < Math.ceil(BUTLER.tell * 30) + 3; i++) sim.frame();
  const st = () => sim.e.w5.butlers[0] as { phase: string; cake: boolean };
  assert.equal(st().phase, 'offer');
  sim.stand(b.x - 80, G);
  sim.p.facing = 1;
  for (let i = 0; i < 12 && st().phase === 'offer'; i++) sim.frame({ punch: i === 0 });
  assert.equal(st().phase, 'knocked');
  assert.equal(st().cake, false);
  for (let i = 0; i < 30; i++) sim.frame({ right: true });
  assert.equal(sim.e.w5.asleep, 0, 'walked past the empty tray awake');
});

test("5-2: walking into the Butler's held-out tray is eating its cake (sleepy), and jumping over him is not", () => {
  const sim = new RealPlay('5-2', 1);
  const b = w5Of(sim).butlers![0];
  sim.stand(b.x - 200, G);
  for (let i = 0; i < Math.ceil(BUTLER.tell * 30) + 3; i++) sim.frame();
  for (let i = 0; i < 40 && sim.e.w5.asleep <= 0; i++) sim.frame({ right: true });
  assert.ok(sim.e.w5.asleep > 0, 'he ate the cake on the tray');
  const sim2 = new RealPlay('5-2', 1);
  sim2.stand(b.x - 230, G);
  for (let i = 0; i < Math.ceil(BUTLER.tell * 30) + 3; i++) sim2.frame();
  for (let i = 0; i < 50; i++) sim2.frame({ right: true, press: i === 6, jump: i > 6 && i < 22 });
  assert.ok(sim2.p.x > b.x + 40, 'past him');
  assert.equal(sim2.e.w5.asleep, 0, 'jumped clean over the tray');
});
