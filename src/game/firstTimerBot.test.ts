/**
 * The first-timer bot's own self-test (bot-fix, 2026-11-01). The bot (tools/inspect/firsttimer.ts) is the measuring stick for bands,
 * curation, the first-timer checks and the "flown over" findings, so it is tested like game code, in the real engine on a bare world.
 *
 * The defect this guards: "stopped dead against something" measured his movement against lastX, which the end of the frame had already
 * set to where he is, so it read 0 every frame. Every 0.3 s of walking counted as a stop, and he hopped along flat ground (9 hops in
 * 10 s) and took off for a ledge up to ~1100 px before its end instead of edgeAim's 22-44 px.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { FirstTimerRun, FT_ADULT, FT_KID, type FirstTimer } from '../../tools/inspect/firsttimer.ts';
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
