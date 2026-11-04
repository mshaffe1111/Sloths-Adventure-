/**
 * The rope catch, in the real engine (w8-rope2, 2026-11-01). 8-2's first-timer lost every heart at its ropes the same way: a flick a
 * little early topped out short of the rope's near end, and on the way down his hands passed back through the rope (the engine caught a
 * falling Pokey only with Up held). Each test failed on release-0.9.2 and passes now, except the climb test, which guards the narrowing
 * (a fall from a shelf above must still land on the shelf below, not on a rope in between: 1-4, 2-6, 3-4, 4-1's zigzags).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { RealPlay, DT } from './realPlay.ts';
import { HANG_DROP, ROPE_OVERLAP, ROPE_RISE, ropeYAt } from './rope.ts';
import type { Collectible, Platform, Rope } from './types.ts';

const G = 600;
const plat = (id: number, x: number, x1: number, y = G): Platform => ({ id, x, y, width: x1 - x, height: 400, type: 'solid' }) as Platform;
/** two ledges, a required rope over the 500 px gap between them (as gen2's rope rule and World 3 hang them) */
function world(extra: { plats?: Platform[]; ropes?: Rope[]; flowers?: Collectible[] } = {}) {
  const r = new RealPlay('8-2', 1);
  const a = plat(1, 0, 1000), b = plat(2, 1500, 2600);
  const rope: Rope = { id: 1, x0: a.x + a.width - ROPE_OVERLAP, x1: b.x + ROPE_OVERLAP, y: G - ROPE_RISE, g0: G, g1: G, required: true };
  r.bare([a, b, ...(extra.plats ?? [])], [], [rope, ...(extra.ropes ?? [])]);
  r.e.skills.add('shimmy');
  r.e.currentStage.heartFalls = [];
  r.e.collectibles = extra.flowers ?? [];
  return { r, a, b, rope };
}

/** run at the edge and flick `lead` px short of it, the jump held `hold` s, the steer kept; true once he hangs */
function flick(r: RealPlay, edge: number, lead: number, hold: number, startX = edge - 300): { caught: boolean; xs: number[] } {
  r.stand(startX, G);
  let t = 0, at = -1;
  const xs: number[] = [];
  while (t < 3) {
    const pad: Record<string, boolean> = { right: true };
    if (at < 0 && r.p.x >= edge - lead) { pad.press = true; at = t; } else if (at >= 0 && t - at < hold) pad.jump = true;
    r.frame(pad);
    t += DT;
    xs.push(r.p.x);
    if (r.p.hanging) return { caught: true, xs };
    if (r.p.y > G + 200) return { caught: false, xs };
  }
  return { caught: false, xs };
}

test('an early flick at a rope over a gap is caught on the way down (failed before: his hands fell back through the rope)', () => {
  const { r, a } = world();
  const edge = a.x + a.width;
  for (const lead of [120, 150, 170]) for (const hold of [0.12, 0.2, 0.3]) {
    assert.ok(flick(r, edge, lead, hold).caught, `a flick ${lead} px short of the edge, held ${hold} s, catches the rope`);
  }
});

test('every ordinary flick at the edge still catches it', () => {
  const { r, a } = world();
  const edge = a.x + a.width;
  for (const lead of [-20, 0, 40, 90]) for (const hold of [0.1, 0.25, 0.4]) assert.ok(flick(r, edge, lead, hold).caught, `lead ${lead}, hold ${hold}`);
});

test('caught past the rope\'s end, he slides onto it over a few frames, never a jump in one (failed before: 30-40 px at once)', () => {
  const { r, a } = world();
  const edge = a.x + a.width;
  let worst = 0;
  for (const lead of [120, 150, 170]) for (const hold of [0.12, 0.2, 0.3]) {
    const { caught, xs } = flick(r, edge, lead, hold);
    assert.ok(caught);
    for (let i = 1; i < xs.length; i++) worst = Math.max(worst, Math.abs(xs[i] - xs[i - 1]));
  }
  assert.ok(worst <= 20, `the biggest one-frame move is ${worst.toFixed(1)} px (his run is about 9 px a frame)`);
});

test('hanging, he picks up a bloom just under the rope (failed before: from his feet it was out of reach)', () => {
  const x = 1250;
  const flower = { id: 1, type: 'flower', x, y: G - ROPE_RISE + 26, collected: false } as Collectible;
  const { r, rope } = world({ flowers: [flower] });
  r.hang(rope, rope.x0 + 20, ropeYAt(rope, rope.x0 + 20) + HANG_DROP);
  for (let i = 0; i < 150 && !flower.collected; i++) r.frame({ right: true });
  assert.ok(flower.collected, 'the bloom under the middle of the rope is picked up on the way across');
});

test('in a climb, a fall from a shelf above lands on the shelf below, not on a rope in between (the catch is for a jump from its own ledge)', () => {
  // a shelf 260 px over the rope's ledge, its end over the rope: he walks off it and drops past the rope onto the ledge below
  const high = plat(3, 700, 1100, G - 260);
  const { r } = world({ plats: [high] });
  r.stand(1050, high.y);
  let caught = false;
  for (let i = 0; i < 60; i++) {
    r.frame({ right: i < 8 });
    if (r.p.hanging) caught = true;
    if (r.p.grounded && i > 8) break;
  }
  assert.equal(caught, false, 'falling past a rope he did not jump for does not catch him');
});
