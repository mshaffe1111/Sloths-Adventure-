// 'Lit = seen' (3-2.md NEW 1, the seam ENG-PROWL left: predators/core.ts upOf; built by ENG-ROOT for the root's glowworm patches): in
// the dark the ocelot never looks up past its sight.up (40 px), so a sloth hanging 94 px over it (3-2's Normal root, 190 px) creeps by
// unseen; inside a LIT light's ring (zones.ts litRing) he is seen at any height, and it tells, then leaps. Planted: upOf back to the
// def alone (lit ignored) -> the lit toy reads unseen and fails (red on t-eng-w3 13135bf6b, where Prey has no lit).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newPredator, upOf } from './predators/core.ts';
import { post, prey, run } from './predators/fixtures.ts';
import { OCELOT } from './predators/world3.ts';
import type { Prey } from './predators/types.ts';
import { ROOT_SPEED } from './rope.ts';
import { LIT_MID, litRing, type Zone } from './zones.ts';

const FLOOR = 300;
/** his feet over the floor hanging from a 190 px root (3-2.md: HANG_DROP 86 + the sag: 94) */
const UP = 94;
const floor = () => post({ x: 600, y: FLOOR, minX: 300, maxX: 900, facing: -1 });
const creep = (lit: boolean) => (t: number): Prey => prey({ x: 300 + ROOT_SPEED * t, y: FLOOR - UP, facing: 1, hanging: true, lit });

test('litRing: inside a lit light\'s ring (measured to his middle) only; a sleeping light until it wakes, a clocked one in its window', () => {
  const light = { x: 1000, y: 200, r: 90 };
  const z = (l: object): Zone[] => [{ kind: 'dark', x0: 0, x1: 2000, lights: [{ ...light, ...l }] } as unknown as Zone];
  const none = () => undefined;
  const feetAt = (dy: number) => light.y + LIT_MID + dy;
  assert.equal(litRing(z({}), 1000, feetAt(0), 5, none), true, 'a fixed patch is always lit');
  assert.equal(litRing(z({}), 1000 + 89, feetAt(0), 5, none), true, 'just inside its ring');
  assert.equal(litRing(z({}), 1000 + 91, feetAt(0), 5, none), false, 'just outside it');
  assert.equal(litRing(z({ sleep: true, id: 7 }), 1000, feetAt(0), 5, none), false, 'a sleeping glowworm lights nothing');
  assert.equal(litRing(z({ sleep: true, id: 7 }), 1000, feetAt(0), 5, (id) => (id === 7 ? 4 : undefined)), true, 'once woken it does');
  assert.equal(litRing(z({ sleep: true, id: 7 }), 1000, feetAt(0), 3, (id) => (id === 7 ? 4 : undefined)), false, 'not before it wakes');
  assert.equal(litRing([{ kind: 'wind', x0: 0, x1: 2000, lights: [light] } as unknown as Zone], 1000, feetAt(0), 5, none), false, 'a dark zone\'s lights only');
  assert.equal(litRing(undefined, 1000, feetAt(0), 5, none), false);
});

test('upOf: lit, the ocelot sees him at any height; dark, its own sight.up (40)', () => {
  assert.equal(upOf(OCELOT), 40);
  assert.equal(upOf(OCELOT, { lit: false }), 40);
  assert.equal(upOf(OCELOT, { lit: true }), Infinity);
});

test('TOY: a sloth creeping a 190 px root over an ocelot at the root\'s speed: dark, never noticed; lit, noticed and told, both settings', () => {
  for (const easy of [false, true]) {
    const dark = newPredator(OCELOT, floor());
    const evDark = run(OCELOT, dark, 6, creep(false), { easy });
    assert.ok(!evDark.some((e) => e.notice || e.tell) && !dark.knows, `easy=${easy}: in the dark it never saw him`);
    const lit = newPredator(OCELOT, floor());
    const evLit = run(OCELOT, lit, 6, creep(true), { easy });
    assert.ok(evLit.some((e) => e.notice || e.tell), `easy=${easy}: in the light it saw him (${JSON.stringify(evLit.slice(0, 3))})`);
  }
});
