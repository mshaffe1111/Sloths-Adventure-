import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DotFlight, type FlightEvent, type FlightInput } from './dotFlight.ts';
import { buildDotStage, flowerCheckpoint } from './dotFlightStage.ts';
import { DotLog, dotState, NECTAR_EVERY, type DotLine } from './dotRecord.ts';

const input = (o: Partial<FlightInput> = {}): FlightInput => ({ left: false, right: false, jumpPressed: false, jumpHeld: false, punchPressed: false, megaPunchPressed: false, ...o });
const still = { dir: 0, down: false };
const events = (lines: DotLine[], what: string) => lines.filter((l): l is Extract<DotLine, { k: 'e' }> => l.k === 'e' && l.what === what);
const pLine = (lines: DotLine[]) => lines.find((l): l is Extract<DotLine, { k: 'p' }> => l.k === 'p')!;

test('her state codes: waiting, flap, hover, sink, drinking, tired, through the gap', () => {
  const d = new DotFlight(buildDotStage(1));
  assert.equal(dotState(d), 'dw', 'hanging still at the start');
  d.waiting = false;
  d.hovering = false;
  d.vy = 40;
  assert.equal(dotState(d), 'ds');
  d.hovering = true;
  assert.equal(dotState(d), 'dh');
  d.sinceFlap = 0.1;
  d.vy = -200;
  assert.equal(dotState(d), 'df', 'rising on a flap');
  d.sinceFlap = 2;
  d.energy = 0;
  d.tired = true;
  assert.equal(dotState(d), 'dt');
  d.sipping = 3;
  assert.equal(dotState(d), 'dd', 'drinking beats tired');
  d.through = true;
  assert.equal(dotState(d), 'dg');
});

test("the 'p' line is Dot (her x, y and speed, the thumb's direction), and the section is her beat", () => {
  const st = buildDotStage(1);
  const d = new DotFlight(st);
  const log = new DotLog();
  const first = pLine(log.step(d, [], still, 0));
  assert.equal(first.x, st.spawn.x);
  assert.equal(first.y, st.spawn.y);
  assert.equal(first.state, 'dw');
  assert.equal(first.section, st.beats[0][2]);
  // flying right a while: a 'p' line that says so, and later beats as she gets to them
  const seen = new Set<string>();
  let t = 0;
  for (let i = 0; i < 30 * 40; i++) {
    t += 1 / 30;
    const ev = d.step(1 / 30, input({ right: true, jumpPressed: i % 20 === 0, jumpHeld: false }));
    const p = pLine(log.step(d, ev, { dir: 1, down: false }, t));
    assert.ok(p.state.startsWith('d') && p.state.endsWith('/R'), p.state);
    seen.add(p.section);
  }
  assert.ok(seen.size >= 2, `only ${[...seen].join(', ')}`);
  for (const s of seen) assert.ok(st.beats.some((b) => b[2] === s), s);
});

test('flap and hover intents, nectar every 5 s, and empty when it runs out', () => {
  const d = new DotFlight(buildDotStage(1));
  const log = new DotLog();
  const a = log.step(d, [{ k: 'flap' }, { k: 'buzz' }, { k: 'flapEmpty' }, { k: 'tired' }], still, 0);
  assert.deepEqual(a.filter((l) => l.k === 'i'), [{ k: 'i', name: 'flap' }, { k: 'i', name: 'hover', arg: 'tap' }, { k: 'i', name: 'flap', arg: 'empty' }]);
  assert.equal(events(a, 'empty').length, 1);
  assert.equal(events(a, 'nectar').length, 1, 'the level at the start');
  assert.match(String(events(a, 'nectar')[0].detail), /^100 flaps \d/);
  assert.equal(events(log.step(d, [], still, NECTAR_EVERY - 0.1), 'nectar').length, 0);
  d.energy = 41.6;
  const b = log.step(d, [], still, NECTAR_EVERY);
  assert.match(String(events(b, 'nectar')[0].detail), /^42 flaps/);
  // the thumb kept down after a flap: one 'hover hold' each time it takes over
  d.waiting = false;
  d.hovering = true;
  d.hoverT = 0;
  const h1 = log.step(d, [], { dir: 0, down: true }, 6);
  const h2 = log.step(d, [], { dir: 0, down: true }, 6.1);
  assert.deepEqual(h1.filter((l) => l.k === 'i'), [{ k: 'i', name: 'hover', arg: 'hold' }]);
  assert.equal(h2.filter((l) => l.k === 'i').length, 0);
});

test('flowers are checkpoints (drink, pass, respawn), a thorn is a scratch, and through the gap is the finish', () => {
  const st = buildDotStage(1);
  const d = new DotFlight(st);
  const log = new DotLog();
  const [f1, f2] = st.flowers;
  // she drinks at the first (the flight says checkpoint, then sip), flies past the second
  const ev: FlightEvent[] = [{ k: 'checkpoint', id: f1.id }, { k: 'sip', id: f1.id, first: true }, { k: 'checkpoint', id: f2.id }];
  const a = events(log.step(d, ev, still, 1), 'checkpoint').map((l) => l.detail);
  assert.deepEqual(a, [`${Math.round(f1.x)} f${f1.id} drink`, `${Math.round(f2.x)} f${f2.id} pass`]);
  // a first drink at a flower she had flown past
  assert.deepEqual(events(log.step(d, [{ k: 'sip', id: f2.id, first: false }], still, 2), 'checkpoint').map((l) => l.detail), [`${Math.round(f2.x)} f${f2.id} drink`]);
  // brought back at her checkpoint
  d.checkpoint = flowerCheckpoint(f2);
  d.respawn();
  assert.deepEqual(events(log.step(d, [], still, 3), 'checkpoint').map((l) => l.detail), [`${Math.round(f2.x)} f${f2.id} respawn`]);
  assert.equal(events(log.step(d, [], still, 3.1), 'checkpoint').length, 0, 'once');
  d.scratches = 2;
  d.x = 1234.4;
  assert.deepEqual(events(log.step(d, [{ k: 'hurt', x: 0, y: 0, dir: 1 }], still, 4), 'scratch').map((l) => l.detail), ['2 x1234']);
  assert.deepEqual(events(log.step(d, [{ k: 'through' }], still, 187.6), 'finish').map((l) => l.detail), [188]);
});
