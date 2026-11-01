/**
 * The first-timer bot's own self-test (bot-fix, 2026-11-01). The bot (tools/inspect/firsttimer.ts) is the measuring stick for bands,
 * curation, the first-timer checks and the "flown over" findings, so it is tested like game code, in the real engine on a bare world.
 *
 * The defect this guards: "stopped dead against something" measured his movement against lastX, which the end of the frame had already
 * set to where he is, so it read 0 every frame. Every 0.3 s of walking counted as a stop, and he hopped along flat ground (9 hops in
 * 10 s) and took off for a ledge up to ~1100 px before its end instead of edgeAim's 22-44 px.
 *
 * And the gaps those hops had been hiding (the same day): a fall back down a climb never led to a rescue (each fall moved his place back
 * down the way, so climbing back counted as progress); put past a puzzle room, he walked back into it, or stood on its top and it
 * "started again"; and a rescue put him back on the spot he had just failed. On main 6-3 and 1-4 ran out the clock on every roll.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { FirstTimerRun, firstTimer, FT_ADULT, FT_KID, type FirstTimer } from '../../tools/inspect/firsttimer.ts';
import type { Pad } from './realPlay.ts';
import type { Platform } from './types.ts';

const Y = 580;
const ground = (id: number, x: number, width: number): Platform => ({ id, x, y: Y, width, height: 90, type: 'solid' }) as Platform;

/** a run on a bare world along a straight route at ground height, with every jump press he makes from the ground (x) */
function run(who: FirstTimer, seed: number, platforms: Platform[], cap: number) {
  const route = Array.from({ length: 250 }, (_, i) => ({ x: 100 + i * 24, y: Y }));
  const r = new FirstTimerRun('1-1', seed, who, { route, cap, rescueAfter: 1000 });
  r.sim.bare(platforms);
  r.sim.stand(100, Y);
  r.prog.relocate(r.sim.p);
  const presses: number[] = [];
  const frame = r.sim.frame.bind(r.sim);
  r.sim.frame = (pad?: Pad) => {
    if (pad?.press && r.sim.p.grounded) presses.push(r.sim.p.x);
    frame(pad);
  };
  r.play();
  return { r, presses };
}

const WHO: Array<[string, FirstTimer]> = [
  ['the adult (Normal)', FT_ADULT],
  ['the kid (Easy)', FT_KID],
];

for (const [name, who] of WHO) {
  test(`${name}: on flat ground he walks, never hops, and never "stops dead"`, () => {
    for (const seed of [1, 2, 3]) {
      const { r, presses } = run(who, seed, [ground(1, 0, 8000)], 10);
      assert.equal(presses.length, 0, `seed ${seed}: ${presses.length} hops on flat ground, at x ${presses.map(Math.round).join(', ')}`);
      assert.equal(r.stops.length, 0, `seed ${seed}: stopped dead ${r.stops.length} times with nothing in the way`);
      assert.ok(r.sim.p.x > 2000, `seed ${seed}: he walks on (x ${Math.round(r.sim.p.x)})`);
    }
  });

  test(`${name}: at a ledge's end he takes off within edgeAim of it, once, and gets across`, () => {
    const end = 1500;
    for (const seed of [1, 2, 3]) {
      for (const gap of [140, 200]) {
        const { r, presses } = run(who, seed, [ground(1, 0, end), ground(2, end + gap, 6000)], 12);
        assert.ok(presses.length >= 1, `seed ${seed}, gap ${gap}: no jump at the ledge`);
        const before = end - presses[0];
        // (he means to jump 22 + edgeAim px before the end; his thumb's lag only moves the press later, towards and a little past the
        // end, where the engine's coyote time still lets it go: never earlier than he meant)
        assert.ok(before <= 22 + who.edgeAim, `seed ${seed}, gap ${gap}: took off ${Math.round(before)} px before the end (edgeAim ${who.edgeAim})`);
        assert.ok(before >= -30, `seed ${seed}, gap ${gap}: pressed ${Math.round(-before)} px past the end`);
        assert.equal(presses.filter((x) => x < end - 120).length, 0, `seed ${seed}, gap ${gap}: hops on the way to the ledge`);
        assert.equal(r.harms.length, 0, `seed ${seed}, gap ${gap}: hurt (${JSON.stringify(r.harms)})`);
        assert.ok(r.sim.p.x > end + gap + 200, `seed ${seed}, gap ${gap}: across (x ${Math.round(r.sim.p.x)})`);
      }
    }
  });

  test(`${name}: he stops dead only where something really blocks him, and that is where he jumps`, () => {
    const face = 900;
    for (const seed of [1, 2, 3]) {
      const step = { id: 2, x: face, y: Y - 60, width: 300, height: 60, type: 'solid' } as Platform;
      const { r, presses } = run(who, seed, [ground(1, 0, 8000), step], 10);
      assert.ok(r.stops.length >= 1, `seed ${seed}: the 60 px step did not stop him`);
      for (const s of r.stops) assert.ok(s.x > face - 40 && s.x <= face, `seed ${seed}: a stop at x ${Math.round(s.x)}, not at the step's face (${face})`);
      assert.ok(Math.abs(r.stops[0].h - 60) < 4, `seed ${seed}: the step's height read ${r.stops[0].h}`);
      assert.equal(presses.filter((x) => x < face - 40).length, 0, `seed ${seed}: hops before the step, at x ${presses.map(Math.round).join(', ')}`);
      assert.ok(r.sim.p.x > face + 300, `seed ${seed}: up and over (x ${Math.round(r.sim.p.x)})`);
    }
  });
}

test('a climb he keeps falling back down: after the third fall from the same spot he is put past it, not left looping to the cap', () => {
  const P = (id: number, x: number, y: number, width: number, height = 30): Platform => ({ id, x, y, width, height, type: 'solid' }) as Platform;
  // (five 90 px steps up to a gap no jump crosses (580 px); a miss drops him to the ground, back near the start of the way)
  const steps = [[800, 490], [950, 400], [1100, 310], [1250, 220], [1400, 130]];
  const plats = [P(1, 0, Y, 3200, 90), ...steps.map(([x, y], i) => P(10 + i, x, y, 120)), P(20, 2100, 130, 900)];
  const route: Array<{ x: number; y: number }> = [];
  for (let x = 100; x < 800; x += 24) route.push({ x, y: Y });
  for (const [x, y] of steps) for (let k = 0; k < 120; k += 24) route.push({ x: x + k, y });
  for (let x = 1520; x < 3000; x += 24) route.push({ x, y: 130 });
  for (const [name, who] of WHO) {
    for (const seed of [1, 2, 3]) {
      const r = new FirstTimerRun('1-1', seed, who, { route, cap: 150 });
      r.sim.bare(plats);
      r.sim.stand(100, Y);
      r.prog.relocate(r.sim.p);
      let across = -1;
      const frame = r.sim.frame.bind(r.sim);
      r.sim.frame = (pad?: Pad) => {
        frame(pad);
        const p = r.sim.p;
        if (across < 0 && p.grounded && p.x > 2100 && Math.abs(p.y - 130) < 4) across = r.sim.t;
      };
      r.play();
      assert.ok(across > 0 && across < 100, `${name}, seed ${seed}: never put across the gap (at x ${Math.round(r.sim.p.x)}, ${r.rescues} rescues)`);
      assert.ok(r.stuck.some((q) => q.what === 'fell back down from here 3 times'), `${name}, seed ${seed}: the loop is not reported`);
    }
  }
});

test("put past a puzzle room he goes on from there: 6-3's seesaw and 1-4's lift reach the shrine (the kid, every roll)", () => {
  for (const id of ['6-3', '1-4']) {
    for (const seed of [1, 2, 3]) {
      const r = firstTimer(id, seed, FT_KID);
      assert.equal(r.end, 'shrine', `${id} seed ${seed}: ${r.end} at ${r.time} s, x ${r.x}`);
    }
  }
});
