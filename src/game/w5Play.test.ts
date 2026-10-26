/**
 * World 5's pieces in the real engine (realPlay.ts), each the way a player meets it: standing still wraps him (a heart in 5-2, only a
 * fright in 5-1's gentle lesson), a wiggle keeps it off, a soft chair tugs, a cake makes him slow, a thread's hum wakes the sleeping
 * spiders (who crouch before they come), a punch knocks the Butler's tray away, and a closing orchid holds him only while it is open.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { RealPlay } from './realPlay.ts';
import { G } from './protoStage.ts';
import { BUTLER, ORCHID, onScreen, SIT, SPIDER5, W5_TEACH, type GateState, type W5Extras } from './w5Kit.ts';

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

test("5-2: a thread's hum wakes the sleeping spiders; each in view crouches for its warning before it comes, one off the screen once it is in view", () => {
  const sim = new RealPlay('5-2', 1);
  const w5 = w5Of(sim);
  const sleepers = new Set(w5.spiders!.filter((s) => s.doze).map((s) => s.id));
  type Bug = { id: number; x: number; y: number; width: number; height: number };
  // the first thread with sleepers in reach of its hum
  const th = w5.threads!.find((t) => sim.e.enemies.some((e: Bug) => sleepers.has(e.id) && Math.abs(e.x - (t.x0 + t.x1) / 2) < 680))!;
  assert.ok(th, 'a thread guards sleeping spiders');
  const gates = sim.e.w5.gates as Map<number, GateState>;
  const near: Bug[] = sim.e.enemies.filter((e: Bug) => sleepers.has(e.id) && Math.abs(e.x - (th.x0 + th.x1) / 2) < 680);
  for (const e of near) assert.equal(gates.get(e.id)!.phase, 'calm');
  sim.stand(th.x0 - 60, G);
  for (let i = 0; i < 20 && near.every((e) => gates.get(e.id)!.dozing); i++) sim.frame({ right: true });
  const cam = sim.e.camera;
  const view = { x0: cam.x, x1: cam.x + cam.viewportWidth, y0: cam.y, y1: cam.y + cam.viewportHeight };
  const seen = near.filter((e) => onScreen(view, e.x, e.y, e.width, e.height, SPIDER5.edge));
  const unseen = near.filter((e) => !seen.includes(e));
  assert.ok(seen.length > 0 && unseen.length > 0, 'the hum reaches spiders on the screen and off it');
  for (const e of near) assert.equal(gates.get(e.id)!.dozing, false, `spider ${e.id} woke`);
  for (const e of seen) assert.equal(gates.get(e.id)!.phase, 'windup', `spider ${e.id}, on the screen, crouches`);
  // (off the screen, behind him: it does not crouch where he cannot see it)
  for (const e of unseen) assert.equal(gates.get(e.id)!.phase, 'calm', `spider ${e.id}, off the screen, waits`);
  // the warning: still for SPIDER5.tell
  const xs = seen.map((e) => e.x);
  // (the one woken off the screen never comes without its crouch: the view settles as he stands, and if it comes into full view
  // meanwhile, it crouches there first)
  const far = unseen[0];
  let farLast = gates.get(far.id)!.phase;
  const step = () => {
    sim.frame();
    const ph = gates.get(far.id)!.phase;
    assert.ok(!(farLast === 'calm' && ph === 'go'), 'the spider woken off the screen came without a crouch');
    farLast = ph;
  };
  for (let i = 0; i < Math.floor((SPIDER5.tell - 0.1) * 30); i++) step();
  seen.forEach((e, k) => {
    assert.equal(gates.get(e.id)!.phase, 'windup');
    assert.equal(e.x, xs[k], 'it has not moved yet');
  });
  for (let i = 0; i < 9; i++) step();
  for (const e of seen) assert.equal(gates.get(e.id)!.phase, 'go');
  // the one the hum woke off the screen crouches as soon as it is in view (150 px off: a sleeper would wake only at a bump)
  if (gates.get(far.id)!.phase === 'calm') {
    sim.stand(far.x + 150, G);
    sim.frame();
    assert.equal(gates.get(far.id)!.phase, 'windup', 'the woken spider comes once it is seen');
  }
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

test('5-3: an open orchid holds him and gives up the flowers in its cup; it shivers, then shuts and drops him to the grass; a shut cup gives nothing', () => {
  const sim = new RealPlay('5-3', 1);
  const o = w5Of(sim).orchids![0];
  const at = (s: number) => 60 + ((((s - o.offset) % o.period) + o.period) % o.period);
  const cup = () => sim.collectibles.filter((c) => o.petalIds!.includes(c.id));
  // open: he stands on it, and walking across it picks the cup
  sim.t = at(0.1);
  sim.stand(o.x - o.w / 2 + 14, o.y);
  for (let i = 0; i < 20; i++) sim.frame({ right: i < 8 });
  assert.ok(cup().every((c) => c.collected), 'the cup picked while open');
  // through the closing shiver it still holds him; shut, he drops to the grass under it
  sim.t = at(o.open + 0.1);
  sim.stand(o.x, o.y);
  for (let i = 0; i < 15; i++) sim.frame();
  assert.ok(Math.abs(sim.p.y - o.y) < 2 && sim.p.grounded, 'held while it shivers');
  for (let i = 0; i < 36; i++) sim.frame();
  assert.ok(Math.abs(sim.p.y - G) < 2, `shut, it dropped him to the grass (y ${Math.round(sim.p.y)})`);
  // a shut cup: passing through where it was picks nothing
  const sim2 = new RealPlay('5-3', 1);
  const o2 = w5Of(sim2).orchids![0];
  sim2.t = 60 + ((((o2.open + ORCHID.tell + 0.2 - o2.offset) % o2.period) + o2.period) % o2.period);
  sim2.fly(o2.x - 40, o2.y - 10, 0, 0, 0);
  for (let i = 0; i < 6; i++) sim2.frame({ right: true });
  assert.ok(sim2.collectibles.filter((c) => o2.petalIds!.includes(c.id)).every((c) => !c.collected), 'nothing from a shut cup');
});
