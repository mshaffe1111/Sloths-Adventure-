import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DotFlight, type FlightInput } from './dotFlight.ts';
import { buildDotStage, DOT, MIST, type DotStage } from './dotFlightStage.ts';
import { autopilot } from './dotFlightPilot.ts';

const input = (o: Partial<FlightInput> = {}): FlightInput => ({ left: false, right: false, jumpPressed: false, jumpHeld: false, punchPressed: false, megaPunchPressed: false, ...o });
/** an empty sky to try her wings in */
const sky = (): DotStage => {
  const st = buildDotStage(1);
  return { ...st, walls: [], panels: [], thorns: [], flowers: [], gusts: [], puffs: [], dew: [], silk: [], spawn: { x: 400, y: 500 }, letter: { ...st.letter, slowFrom: 1e9, x: 1e9 } };
};
const run = (d: DotFlight, secs: number, inp: () => FlightInput) => {
  const ev = [];
  for (let t = 0; t < secs; t += 1 / 30) ev.push(...d.step(1 / 30, inp()));
  return ev;
};

test('she hangs still at the start until the player does something', () => {
  const d = new DotFlight(sky());
  run(d, 3, () => input());
  assert.ok(Math.abs(d.y - 500) < 2, `she sank to ${d.y}`);
  assert.equal(d.energy, DOT.energy, 'waiting costs nothing');
});

test('a flap lifts her, three in a row and then her wings need a rest: she climbs, she does not rocket', () => {
  const d = new DotFlight(sky());
  const flapsAt: number[] = [];
  let t = 0;
  // flick as fast as a thumb can, every 0.1 s, for two seconds
  for (let i = 0; i < 60; i++, t += 1 / 30) {
    const ev = d.step(1 / 30, input({ jumpPressed: i % 3 === 0 }));
    if (ev.some((e) => e.k === 'flap')) flapsAt.push(t);
  }
  assert.ok(flapsAt.length >= 3 && flapsAt.length <= 7, `${flapsAt.length} flaps in 2 s`);
  // the first three come quickly, then they space out
  assert.ok(flapsAt[2] - flapsAt[0] < 0.5);
  const later = flapsAt.slice(3).map((x, i) => x - flapsAt[i + 2]);
  assert.ok(later.every((g) => g > 0.4), `rests between later flaps: ${later.map((g) => g.toFixed(2))}`);
  const climbed = 500 - d.y;
  assert.ok(climbed > 150 && climbed < 520, `climbed ${climbed.toFixed(0)} px in 2 s`);
});

test('a tap holds her nearly still for a moment, and quick taps keep her there', () => {
  const d = new DotFlight(sky());
  run(d, 0.2, () => input({ right: true }));
  const y0 = d.y;
  let n = 0;
  run(d, 3, () => input({ punchPressed: n++ % 12 === 0 }));
  assert.ok(d.y - y0 < 120, `sank ${(d.y - y0).toFixed(0)} px in 3 s of tapping`);
  // without the taps she drops much further
  const e = new DotFlight(sky());
  run(e, 0.2, () => input({ right: true }));
  const z0 = e.y;
  run(e, 3, () => input());
  assert.ok(e.y - z0 > 300);
});

test('keeping the thumb down after the flick hovers, like the leaf', () => {
  const d = new DotFlight(sky());
  run(d, 0.1, () => input({ jumpPressed: true, jumpHeld: true }));
  run(d, 0.4, () => input({ jumpHeld: true }));
  const y0 = d.y;
  run(d, 2, () => input({ jumpHeld: true }));
  assert.ok(Math.abs(d.y - y0) < 70, `drifted ${(d.y - y0).toFixed(0)} px while held`);
  assert.ok(d.hovering);
});

test('out of nectar she cannot flap or hover: she sinks slowly and can still steer', () => {
  const d = new DotFlight(sky());
  d.waiting = false;
  d.energy = 0;
  const ev = run(d, 0.1, () => input({ jumpPressed: true }));
  assert.ok(ev.some((e) => e.k === 'flapEmpty'));
  assert.ok(!ev.some((e) => e.k === 'flap'));
  run(d, 1, () => input({ right: true, punchPressed: true }));
  assert.ok(!d.hovering);
  assert.ok(d.vy <= DOT.tiredFall + 1 && d.vy > 60, `sinking at ${d.vy}`);
  assert.ok(d.vx > 100, 'still steers');
});

test('a flower fills her fast while she hangs at it, droops when drained, and fills again', () => {
  const st = sky();
  st.flowers = [{ id: 1, x: 420, y: 500, kind: 'heli', face: -1 }];
  const d = new DotFlight(st);
  d.waiting = false;
  d.energy = 10;
  d.x = 420;
  d.y = 500;
  const ev = run(d, 1, () => input());
  assert.ok(d.energy > 95, `energy ${d.energy}`);
  assert.ok(ev.some((e) => e.k === 'sip'));
  assert.ok(Math.abs(d.y - 500) < 30, `she hangs at the flower while she drinks (${d.y.toFixed(0)})`);
  assert.deepEqual(d.checkpoint, { x: 386, y: 500 });
  d.energy = 0;
  const ev2 = run(d, 1.5, () => input());
  assert.ok(ev2.some((e) => e.k === 'droop'));
  assert.equal(d.nectar.get(1), 0);
  run(d, DOT.regrow + 0.5, () => input());
  assert.equal(d.nectar.get(1), DOT.flowerHolds);
});

test('a thorn costs a scratch and throws her off; the netting just bonks', () => {
  const st = sky();
  st.thorns = [{ id: 1, x0: 460, y0: 400, x1: 460, y1: 600 }];
  const d = new DotFlight(st);
  let hurtAt = -1;
  for (let k = 0; k < 30 && hurtAt < 0; k++) if (d.step(1 / 30, input({ right: true, punchPressed: true })).some((e) => e.k === 'hurt')) hurtAt = k;
  assert.ok(hurtAt >= 0);
  assert.equal(d.scratches, 1);
  assert.ok(d.x < 460 && d.vx < 0, 'thrown back off the strand');
  // and she can't be scratched again straight away
  run(d, 0.5, () => input({ right: true }));
  assert.equal(d.scratches, 1);
  const s2 = sky();
  s2.walls = [{ id: 1, x: 460, w: 50, openings: [{ y: 860, h: 60 }] }];
  const e = new DotFlight(s2);
  run(e, 2, () => input({ right: true, jumpHeld: true, jumpPressed: true }));
  assert.ok(e.x <= 460 - DOT.R + 0.5, `she went into the iron: ${e.x}`);
  assert.equal(e.scratches, 0);
});

// a plain autopilot (dotFlightPilot.ts) flies every roll with her real rules: if it gets to the gap with hearts to spare, it can be flown
test('every roll of the stage can be flown to the folded-letter gap (16 seeds, her real rules)', () => {
  for (let k = 0; k < 16; k++) {
    const seed = 1 + k * 37;
    const st = buildDotStage(seed);
    const r = autopilot(st);
    assert.ok(r.through, `seed ${seed}: stuck at x ${Math.round(r.d.x)}, y ${Math.round(r.d.y)} after ${Math.round(r.t)} s (energy ${Math.round(r.d.energy)})`);
    assert.ok(r.mists === 0, `seed ${seed}: fell into the mist ${r.mists} times: ${r.log.join('; ')}`);
    assert.ok(r.hurts <= 4, `seed ${seed}: ${r.hurts} thorns: ${r.log.join('; ')}`);
    assert.ok(r.d.y < MIST);
  }
});

// ---- QA, 2026-10-25: the lesson is safe, the thorned holes take a flap, she drinks anywhere in the bloom ----

const SEEDS = Array.from({ length: 16 }, (_, i) => 1 + i * 37);

test('nothing can hurt her before the flap and the hover are taught: the catch net is under the lesson (16 seeds, five ways to play it)', () => {
  const scripts: Array<[string, (t: number) => Partial<FlightInput>]> = [
    ['holding right only', () => ({ right: true })],
    ['holding left, then right', (t) => (t < 4 ? { left: true } : { right: true })],
    ['right with a flick now and then', (t) => ({ right: true, jumpPressed: Math.floor(t * 30) % 20 === 0 })],
    ['right with taps', (t) => ({ right: true, punchPressed: Math.floor(t * 30) % 9 === 0 })],
    ['right, the thumb kept down after a flick', (t) => ({ right: true, jumpPressed: Math.floor(t * 30) % 45 === 0, jumpHeld: true })],
  ];
  for (const seed of SEEDS) {
    const st = buildDotStage(seed);
    const flapAt = st.hints.find((h) => /flap/i.test(h.text))!.x;
    const hoverAt = st.hints.find((h) => /hover/i.test(h.text))!.x;
    const net = st.panels.find((p) => p.catch)!;
    assert.ok(net && net.x + net.w > Math.max(flapAt, hoverAt) + 200, `seed ${seed}: the catch net ends at ${net?.x + net?.w}`);
    for (const [name, inp] of scripts) {
      const d = new DotFlight(st);
      for (let t = 0; t < 50 && d.x < net.x + net.w; t += 1 / 30) {
        const ev = d.step(1 / 30, input(inp(t)));
        const bad = ev.find((e) => e.k === 'hurt' || e.k === 'mist');
        assert.ok(!bad, `seed ${seed}, ${name}: ${bad?.k} at x ${Math.round(d.x)}, ${t.toFixed(1)} s in`);
      }
      assert.ok(d.y < MIST - 40, `seed ${seed}, ${name}: she got down to ${Math.round(d.y)}`);
    }
    // and the first line teaches the flap as well as the flying
    assert.ok(/flap/i.test(st.hints[0].text) && /left or right/i.test(st.hints[0].text));
  }
});

test('every hole with thorns along its edges: one flap from its middle, or two taps of hover, goes through without a scratch (16 seeds, her real flight)', () => {
  let n = 0;
  for (const seed of SEEDS) {
    const st = buildDotStage(seed);
    for (const w of st.walls) {
      const edge = st.thorns.filter((t) => Math.min(t.x0, t.x1) < w.x + w.w && Math.max(t.x0, t.x1) > w.x && Math.abs(t.y0 - t.y1) < 20);
      if (edge.length < 2) continue;
      n++;
      const o = w.openings[0];
      const mid = o.y + o.h / 2;
      const flapAt = (at: number): [string, (x: number, t: number) => Partial<FlightInput>] => {
        let done = false;
        return [
          `a flap at ${Math.round(at)}`,
          (x) => {
            const p = !done && x >= w.x + at;
            if (p) done = true;
            return { right: true, jumpPressed: p };
          },
        ];
      };
      let since = -1;
      const tries: Array<[string, (x: number, t: number) => Partial<FlightInput>]> = [
        ...[-70, -30, 10, w.w / 2].map(flapAt),
        // a tap as she gets to the thorns' ends, and another as that hover runs out
        ['taps every half second', (x) => {
          if (x >= w.x - 70) since++;
          return { right: true, punchPressed: since >= 0 && since % 15 === 0 };
        }],
      ];
      for (const [name, inp] of tries) {
        const d = new DotFlight(st);
        d.x = w.x - 130;
        d.y = mid;
        d.waiting = false;
        let t = 0;
        while (d.x < w.x + w.w + 70 && t < 6) {
          const ev = d.step(1 / 30, input(inp(d.x, t)));
          t += 1 / 30;
          assert.ok(!ev.some((e) => e.k === 'hurt'), `seed ${seed}, wall ${w.id} (hole ${o.h} px), ${name}: scratched at y ${Math.round(d.y)} (hole ${o.y}..${o.y + o.h})`);
        }
        assert.ok(d.x >= w.x + w.w + 70, `seed ${seed}, wall ${w.id}, ${name}: stuck at ${Math.round(d.x)}, ${Math.round(d.y)}`);
      }
    }
  }
  assert.ok(n >= 16, `${n} thorned holes`);
});

test("she drinks anywhere in a flower's bloom and just under it, hovering, but not far down its stalk", () => {
  for (const kind of ['heli', 'fuchsia', 'trumpet', 'passion', 'blue'] as const) {
    const at = (dx: number, dy: number) => {
      const st = sky();
      st.flowers = [{ id: 1, x: 420, y: 500, kind, face: -1, stalk: true }];
      const d = new DotFlight(st);
      d.waiting = false;
      d.energy = 20;
      d.x = 420 + dx;
      d.y = 500 + dy;
      let n = 0;
      run(d, 0.5, () => input({ punchPressed: n++ % 12 === 0 }));
      return d.energy;
    };
    for (const [dx, dy] of [[0, 0], [-40, 0], [40, 0], [0, -30], [0, 25], [-30, 20]]) assert.ok(at(dx, dy) > 60, `${kind}: no drink at ${dx}, ${dy}`);
    assert.ok(at(0, 260) < 20, `${kind}: drinks far down the stalk`);
  }
  // the blue flower: hovering just under its head, beside the stalk, drinks (QA: she tapped there until empty and sank)
  const st = sky();
  st.flowers = [{ id: 1, x: 420, y: 500, kind: 'blue', face: -1, stalk: true }];
  const d = new DotFlight(st);
  d.waiting = false;
  d.energy = 10;
  d.x = 400;
  d.y = 590;
  let k = 0;
  run(d, 0.6, () => input({ punchPressed: k++ % 12 === 0 }));
  assert.ok(d.energy > 60, `energy ${d.energy}`);
});

test('the scratch tally is the whole flight: coming back at a flower keeps it', () => {
  const st = sky();
  st.thorns = [{ id: 1, x0: 460, y0: 400, x1: 460, y1: 600 }];
  const d = new DotFlight(st);
  for (let k = 0; k < 30 && d.scratches === 0; k++) d.step(1 / 30, input({ right: true, punchPressed: true }));
  assert.equal(d.scratches, 1);
  d.respawn();
  assert.equal(d.scratches, 1);
  assert.ok(d.invuln > 0);
});
