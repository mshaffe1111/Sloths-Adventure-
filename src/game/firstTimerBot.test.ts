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
import { FirstTimerRun, firstTimer, freshPhone, FT_ADULT, FT_KID, type FirstTimer } from '../../tools/inspect/firsttimer.ts';
import type { Pad } from './realPlay.ts';
import type { Platform } from './types.ts';
import { GEN2_STAGES, KID_RUNS_59 } from './gen2/game.ts';

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

test("put past a puzzle room he goes on from there, not back into it: 6-3's seesaw reaches the shrine (the kid, every roll)", () => {
  // (the route runs through the room's far wall there: placed at the nearest point, he walked back into the room until the cap)
  for (const seed of [1, 2, 3]) {
    const r = firstTimer('6-3', seed, FT_KID);
    assert.equal(r.end, 'shrine', `6-3 seed ${seed}: ${r.end} at ${r.time} s, x ${r.x}`);
  }
});

test("a room starts again only when he has fallen back down into it, never while he stands on its top (1-4's lift)", () => {
  // (1-4's lift puts him on its own top, inside its box, and the way on crosses back over it: standing there 12 s later started the
  // room again, every 12 s until the cap)
  type Room = { box: { x0: number; x1: number; y0: number; y1: number }; beyond?: { x: number; y: number } };
  for (const who of [FT_KID, FT_ADULT]) {
    for (const seed of [1, 2, 3]) {
      freshPhone(who.setting);
      const r = new FirstTimerRun('1-4', seed, who, { cap: 200 });
      const rooms = ((r.e as unknown as { kit?: { rooms: Room[] } }).kit?.rooms ?? []).filter((q) => q.beyond);
      assert.ok(rooms.length > 0, '1-4 has its lift rooms');
      const bad: string[] = [];
      const seen = new Set<number>();
      let starts = 0;
      // (judged where he stands as the room starts: a lift can carry him up during the moment he waits there)
      const host = r as unknown as { puzzleWait: { room: number } | null };
      const frame = r.sim.frame.bind(r.sim);
      let was: unknown = null;
      r.sim.frame = (pad?: Pad) => {
        frame(pad);
        const w = host.puzzleWait;
        if (w && w !== was) {
          starts++;
          const room = ((r.e as unknown as { kit: { rooms: Room[] } }).kit.rooms)[w.room];
          // (a room's first start is judged by nothing here: only its starting again)
          const again = seen.has(w.room);
          seen.add(w.room);
          if (again && room.beyond && r.sim.p.y < room.beyond.y + 40) bad.push(`at ${Math.round(r.sim.t)} s from y ${Math.round(r.sim.p.y)} (its top ${room.beyond.y})`);
        }
        was = w;
      };
      r.play();
      assert.ok(starts >= 1, `${who.name} seed ${seed}: never worked a room`);
      assert.deepEqual(bad, [], `${who.name} seed ${seed}: the room started again while he stood on it`);
    }
  }
});

test('a rescue from no further on than the last one puts him further on, never back on the spot he just failed', () => {
  const route = Array.from({ length: 200 }, (_, i) => ({ x: 100 + i * 24, y: Y }));
  const r = new FirstTimerRun('1-1', 1, FT_ADULT, { route, cap: 1 });
  r.sim.bare([ground(1, 0, 8000)]);
  const at: number[] = [];
  for (let k = 0; k < 3; k++) {
    // (back where he was, no further on: as after a fall)
    r.sim.stand(300, Y);
    r.prog.relocate(r.sim.p);
    (r as unknown as { rescue(): boolean }).rescue();
    at.push(Math.round(r.sim.p.x));
  }
  assert.ok(at[1] > at[0] && at[2] > at[1], `put at x ${at.join(', ')}`);
});

test("5-9's Easy goal rests on the kid's runs: re-measured, they are still the ones recorded (gen2/game.ts KID_RUNS_59)", () => {
  // (as they were measured: Easy's goal at the 65% floor, so the shrine does not stop him before he has beaten what he will beat)
  const entry = GEN2_STAGES['5-9'] as { easyGoal?: number };
  const kept = entry.easyGoal;
  entry.easyGoal = undefined;
  try {
    const runs: number[] = [];
    for (const seed of [1, 2, 3]) for (const trial of [0, 1]) runs.push(firstTimer('5-9', seed, FT_KID, { trial }).goal?.got ?? -1);
    assert.deepEqual(runs, [...KID_RUNS_59], 'the kid bot or 5-9 changed: re-measure, and set the goal from the new runs (goals.ts kidMedian)');
  } finally {
    entry.easyGoal = kept;
  }
});
